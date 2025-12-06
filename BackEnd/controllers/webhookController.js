const pool = require('../config/db');
const bkashService = require('../services/bkashPaymentService');
const nagadService = require('../services/nagadPaymentService');
const rocketService = require('../services/rocketPaymentService');
const { emitNotification } = require('../utils/notificationHelpers');
const User = require('../models/User');

/**
 * bKash webhook handler
 */
exports.bkashWebhook = async (req, res) => {
  try {
    const { transaction_id } = req.query;
    const { paymentID, status } = req.body;

    console.log('bKash Webhook received:', { transaction_id, paymentID, status });

    if (!transaction_id || !paymentID) {
      return res.status(400).json({ error: 'Missing required parameters' });
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

    // Query payment status from bKash
    const paymentStatus = await bkashService.queryPayment(paymentID);

    if (paymentStatus.transactionStatus === 'Completed') {
      // Update transaction and balances
      await pool.query(
        `UPDATE transactions 
         SET status = 'completed', 
             payment_reference = $1,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [JSON.stringify(paymentStatus), transaction_id]
      );

      // Add balance to receiver
      await pool.query(
        'UPDATE users SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [transaction.amount, transaction.receiver_id]
      );

      // Send notification
      const sender = await User.findByPk(transaction.sender_id);
      await emitNotification(transaction.receiver_id, {
        type: 'transaction',
        message: `${sender.full_name || sender.username} sent you ৳${transaction.amount} via bKash`,
        sender_id: transaction.sender_id,
        transaction_id: transaction.id
      });

      res.json({ success: true, message: 'Payment processed' });
    } else {
      // Update transaction to failed
      await pool.query(
        `UPDATE transactions 
         SET status = 'failed', 
             payment_reference = $1,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [JSON.stringify(paymentStatus), transaction_id]
      );

      res.json({ success: false, message: 'Payment failed' });
    }

  } catch (error) {
    console.error('bKash Webhook Error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Nagad webhook handler
 */
exports.nagadWebhook = async (req, res) => {
  try {
    const { transaction_id } = req.query;
    const webhookData = req.body;

    console.log('Nagad Webhook received:', { transaction_id, webhookData });

    if (!transaction_id) {
      return res.status(400).json({ error: 'Missing transaction ID' });
    }

    // Verify webhook signature
    const signature = req.headers['x-nagad-signature'];
    if (signature && !nagadService.verifyWebhookSignature(webhookData, signature)) {
      console.error('Invalid Nagad webhook signature');
      return res.status(403).json({ error: 'Invalid signature' });
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

    // Process based on status
    if (webhookData.status === 'Success') {
      // Update transaction and balances
      await pool.query(
        `UPDATE transactions 
         SET status = 'completed', 
             payment_reference = $1,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [JSON.stringify(webhookData), transaction_id]
      );

      await pool.query(
        'UPDATE users SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [transaction.amount, transaction.receiver_id]
      );

      // Send notification
      const sender = await User.findByPk(transaction.sender_id);
      await emitNotification(transaction.receiver_id, {
        type: 'transaction',
        message: `${sender.full_name || sender.username} sent you ৳${transaction.amount} via Nagad`,
        sender_id: transaction.sender_id,
        transaction_id: transaction.id
      });

      res.json({ success: true, message: 'Payment processed' });
    } else {
      // Update transaction to failed
      await pool.query(
        `UPDATE transactions 
         SET status = 'failed', 
             payment_reference = $1,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [JSON.stringify(webhookData), transaction_id]
      );

      res.json({ success: false, message: 'Payment failed' });
    }

  } catch (error) {
    console.error('Nagad Webhook Error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Rocket webhook handler
 */
exports.rocketWebhook = async (req, res) => {
  try {
    const { transaction_id } = req.query;
    const webhookData = req.body;

    console.log('Rocket Webhook received:', { transaction_id, webhookData });

    if (!transaction_id) {
      return res.status(400).json({ error: 'Missing transaction ID' });
    }

    // Verify webhook signature
    const signature = req.headers['x-rocket-signature'];
    if (signature && !rocketService.verifyWebhookSignature(webhookData, signature)) {
      console.error('Invalid Rocket webhook signature');
      return res.status(403).json({ error: 'Invalid signature' });
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

    // Process based on status
    if (webhookData.status === 'completed') {
      // Update transaction and balances
      await pool.query(
        `UPDATE transactions 
         SET status = 'completed', 
             payment_reference = $1,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [JSON.stringify(webhookData), transaction_id]
      );

      await pool.query(
        'UPDATE users SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [transaction.amount, transaction.receiver_id]
      );

      // Send notification
      const sender = await User.findByPk(transaction.sender_id);
      await emitNotification(transaction.receiver_id, {
        type: 'transaction',
        message: `${sender.full_name || sender.username} sent you ৳${transaction.amount} via Rocket`,
        sender_id: transaction.sender_id,
        transaction_id: transaction.id
      });

      res.json({ success: true, message: 'Payment processed' });
    } else {
      // Update transaction to failed
      await pool.query(
        `UPDATE transactions 
         SET status = 'failed', 
             payment_reference = $1,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [JSON.stringify(webhookData), transaction_id]
      );

      res.json({ success: false, message: 'Payment failed' });
    }

  } catch (error) {
    console.error('Rocket Webhook Error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
