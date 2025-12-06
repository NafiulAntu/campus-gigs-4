const sequelize = require('../config/sequelize');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const pool = require('../config/db');
const bkashService = require('../services/bkashPaymentService');
const nagadService = require('../services/nagadPaymentService');
const rocketService = require('../services/rocketPaymentService');
const { emitNotification } = require('../utils/notificationHelpers');

/**
 * Initiate mobile wallet payment
 * Creates a pending transaction and redirects user to payment gateway
 */
exports.initiatePayment = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const senderId = req.user.id;
    const { receiver_id, amount, payment_method, notes = '' } = req.body;

    // Validation
    if (!receiver_id || !amount || !payment_method) {
      await t.rollback();
      return res.status(400).json({ error: 'Receiver ID, amount, and payment method are required' });
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Check if sender and receiver are different
    if (senderId === parseInt(receiver_id)) {
      await t.rollback();
      return res.status(400).json({ error: 'Cannot send money to yourself' });
    }

    // Check if receiver exists
    const receiver = await User.findByPk(receiver_id);
    if (!receiver) {
      await t.rollback();
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Validate payment method
    const validMethods = ['bkash', 'nagad', 'rocket'];
    if (!validMethods.includes(payment_method.toLowerCase())) {
      await t.rollback();
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Create pending transaction
    const transaction = await Transaction.create({
      sender_id: senderId,
      receiver_id,
      amount: amountNum,
      transaction_type: 'transfer',
      status: 'pending',
      payment_method: payment_method.toLowerCase(),
      notes
    }, { transaction: t });

    await t.commit();

    // Initiate payment with the selected gateway
    let paymentResponse;
    const paymentData = {
      amount: amountNum,
      sender_id: senderId,
      receiver_id,
      transaction_id: transaction.id,
      notes
    };

    try {
      switch (payment_method.toLowerCase()) {
        case 'bkash':
          paymentResponse = await bkashService.createPayment(paymentData);
          break;
        case 'nagad':
          paymentResponse = await nagadService.initializePayment(paymentData);
          break;
        case 'rocket':
          paymentResponse = await rocketService.initiatePayment(paymentData);
          break;
        default:
          throw new Error('Unsupported payment method');
      }

      // Store payment gateway reference in transaction
      await pool.query(
        `UPDATE transactions 
         SET payment_reference = $1, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [JSON.stringify(paymentResponse), transaction.id]
      );

      res.json({
        success: true,
        message: 'Payment initiated successfully',
        transaction_id: transaction.id,
        payment_method: payment_method.toLowerCase(),
        payment_url: paymentResponse.bkashURL || paymentResponse.callBackUrl || paymentResponse.paymentURL,
        payment_data: paymentResponse
      });

    } catch (paymentError) {
      // Update transaction status to failed
      await pool.query(
        `UPDATE transactions 
         SET status = 'failed', 
             notes = $1,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [`Payment gateway error: ${paymentError.message}`, transaction.id]
      );

      throw paymentError;
    }

  } catch (error) {
    if (t) await t.rollback();
    console.error('Initiate Payment Error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to initiate payment',
      details: error.response?.data || null
    });
  }
};

/**
 * Verify and complete payment after gateway callback
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { transaction_id, payment_method } = req.body;

    if (!transaction_id || !payment_method) {
      return res.status(400).json({ error: 'Transaction ID and payment method are required' });
    }

    // Get transaction
    const transactionResult = await pool.query(
      'SELECT * FROM transactions WHERE id = $1',
      [transaction_id]
    );

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = transactionResult.rows[0];

    if (transaction.status === 'completed') {
      return res.json({
        success: true,
        message: 'Payment already completed',
        transaction
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: `Transaction is ${transaction.status}` });
    }

    // Parse payment reference
    let paymentReference;
    try {
      paymentReference = JSON.parse(transaction.payment_reference || '{}');
    } catch (e) {
      paymentReference = {};
    }

    // Verify payment with gateway
    let verificationResult;
    switch (payment_method.toLowerCase()) {
      case 'bkash':
        if (!paymentReference.paymentID) {
          return res.status(400).json({ error: 'Payment ID not found' });
        }
        verificationResult = await bkashService.executePayment(paymentReference.paymentID);
        break;
      case 'nagad':
        if (!paymentReference.paymentReferenceId) {
          return res.status(400).json({ error: 'Payment reference ID not found' });
        }
        verificationResult = await nagadService.verifyPayment(paymentReference.paymentReferenceId);
        break;
      case 'rocket':
        if (!paymentReference.paymentId) {
          return res.status(400).json({ error: 'Payment ID not found' });
        }
        verificationResult = await rocketService.verifyPayment(paymentReference.paymentId);
        break;
      default:
        return res.status(400).json({ error: 'Invalid payment method' });
    }

    if (!verificationResult.success) {
      // Update transaction to failed
      await pool.query(
        `UPDATE transactions 
         SET status = 'failed', 
             notes = $1,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [`Payment verification failed: ${verificationResult.statusMessage || 'Unknown error'}`, transaction_id]
      );

      return res.status(400).json({ 
        success: false,
        error: 'Payment verification failed',
        details: verificationResult
      });
    }

    // Payment successful - update balances and transaction
    const t = await sequelize.transaction();

    try {
      // Update transaction status
      await pool.query(
        `UPDATE transactions 
         SET status = 'completed', 
             payment_reference = $1,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [JSON.stringify({...paymentReference, verification: verificationResult}), transaction_id]
      );

      // Update receiver balance (money comes from external wallet)
      await pool.query(
        'UPDATE users SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [transaction.amount, transaction.receiver_id]
      );

      await t.commit();

      // Get sender info for notification
      const sender = await User.findByPk(transaction.sender_id);

      // Send notification to receiver
      try {
        await emitNotification(transaction.receiver_id, {
          type: 'transaction',
          message: `${sender.full_name || sender.username} sent you ৳${transaction.amount} via ${payment_method.toUpperCase()}`,
          sender_id: transaction.sender_id,
          transaction_id: transaction.id
        });
      } catch (notifErr) {
        console.error('Failed to send transaction notification:', notifErr);
      }

      res.json({
        success: true,
        message: 'Payment completed successfully',
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          status: 'completed',
          payment_method,
          verification: verificationResult
        }
      });

    } catch (dbError) {
      await t.rollback();
      throw dbError;
    }

  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to verify payment',
      details: error.response?.data || null
    });
  }
};

/**
 * Check payment status
 */
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { transaction_id } = req.params;

    const transactionResult = await pool.query(
      'SELECT * FROM transactions WHERE id = $1 AND sender_id = $2',
      [transaction_id, req.user.id]
    );

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = transactionResult.rows[0];

    res.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        status: transaction.status,
        payment_method: transaction.payment_method,
        receiver_id: transaction.receiver_id,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at
      }
    });

  } catch (error) {
    console.error('Check Payment Status Error:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
};

/**
 * Cancel pending payment
 */
exports.cancelPayment = async (req, res) => {
  try {
    const { transaction_id } = req.params;

    const transactionResult = await pool.query(
      'SELECT * FROM transactions WHERE id = $1 AND sender_id = $2 AND status = $3',
      [transaction_id, req.user.id, 'pending']
    );

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pending transaction not found' });
    }

    await pool.query(
      `UPDATE transactions 
       SET status = 'cancelled', 
           notes = 'Cancelled by user',
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [transaction_id]
    );

    res.json({
      success: true,
      message: 'Payment cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel Payment Error:', error);
    res.status(500).json({ error: 'Failed to cancel payment' });
  }
};
