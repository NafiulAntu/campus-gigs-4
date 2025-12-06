const sslcommerzService = require('../services/sslcommerzService');
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Initialize SSLCommerz payment
 */
exports.initSSLCommerzPayment = async (req, res) => {
  try {
    const { amount, receiver_id, notes } = req.body;
    const sender_id = req.user.id;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    if (!receiver_id) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID is required'
      });
    }

    // Get sender and receiver info
    const senderQuery = await pool.query(
      'SELECT id, full_name, email FROM users WHERE id = $1',
      [sender_id]
    );
    const receiverQuery = await pool.query(
      'SELECT id, full_name, email FROM users WHERE id = $1',
      [receiver_id]
    );

    if (!senderQuery.rows[0] || !receiverQuery.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const sender = senderQuery.rows[0];
    const receiver = receiverQuery.rows[0];

    // Generate unique transaction ID
    const tran_id = `SSL_${sender_id}_${Date.now()}_${uuidv4().substring(0, 8)}`;

    // Create pending transaction record
    const insertQuery = `
      INSERT INTO transactions (
        sender_id, 
        receiver_id, 
        amount, 
        transaction_type, 
        status,
        payment_method,
        payment_reference,
        description,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `;

    const transaction = await pool.query(insertQuery, [
      sender_id,
      receiver_id,
      amount,
      'send_money',
      'pending',
      'sslcommerz',
      tran_id,
      notes || 'Payment via SSLCommerz'
    ]);

    // Get user phone for SSLCommerz
    const phoneQuery = await pool.query(`
      SELECT COALESCE(t.phone, s.phone, e.phone, '01711111111') as phone
      FROM users u
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE u.id = $1
    `, [sender_id]);

    const phone = phoneQuery.rows[0]?.phone || '01711111111';

    // Build payment data
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const paymentData = sslcommerzService.buildPaymentData({
      tran_id,
      total_amount: parseFloat(amount),
      currency: 'BDT',
      product_name: `Send Money to ${receiver.full_name}`,
      product_category: 'Money Transfer',
      cus_name: sender.full_name,
      cus_email: sender.email,
      cus_phone: phone,
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      success_url: `${backendUrl}/api/sslcommerz/success`,
      fail_url: `${backendUrl}/api/sslcommerz/fail`,
      cancel_url: `${backendUrl}/api/sslcommerz/cancel`,
      ipn_url: `${backendUrl}/api/sslcommerz/ipn`
    });

    // Initialize payment with SSLCommerz
    const paymentResponse = await sslcommerzService.initPayment(paymentData);

    // Store session key for validation
    await pool.query(
      'UPDATE transactions SET ssl_session_key = $1 WHERE payment_reference = $2',
      [paymentResponse.sessionKey, tran_id]
    );

    res.json({
      success: true,
      message: 'Payment initiated successfully',
      gatewayUrl: paymentResponse.gatewayUrl,
      transaction_id: tran_id,
      session_key: paymentResponse.sessionKey
    });

  } catch (error) {
    console.error('SSLCommerz init payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment',
      error: error.message
    });
  }
};

/**
 * Handle successful payment callback
 */
exports.paymentSuccess = async (req, res) => {
  try {
    const { tran_id, val_id, amount, card_type, card_brand, bank_tran_id } = req.body;

    console.log('Payment success callback:', req.body);

    // Validate payment with SSLCommerz
    const validation = await sslcommerzService.validatePayment(val_id);

    if (!validation.success || validation.data.status !== 'VALID') {
      console.error('Payment validation failed:', validation);
      return res.redirect(
        `${process.env.FRONTEND_URL}/payments/send?status=failed&message=Payment validation failed`
      );
    }

    // Get transaction
    const transactionQuery = await pool.query(
      'SELECT * FROM transactions WHERE payment_reference = $1',
      [tran_id]
    );

    if (!transactionQuery.rows[0]) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/payments/send?status=failed&message=Transaction not found`
      );
    }

    const transaction = transactionQuery.rows[0];

    // Update transaction status
    await pool.query(`
      UPDATE transactions 
      SET status = 'completed',
          ssl_val_id = $1,
          ssl_card_type = $2,
          ssl_card_brand = $3,
          ssl_bank_tran_id = $4,
          completed_at = NOW()
      WHERE payment_reference = $5
    `, [val_id, card_type, card_brand, bank_tran_id, tran_id]);

    // Update sender balance (deduct)
    await pool.query(
      'UPDATE users SET balance = balance - $1 WHERE id = $2',
      [transaction.amount, transaction.sender_id]
    );

    // Update receiver balance (add)
    await pool.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2',
      [transaction.amount, transaction.receiver_id]
    );

    // Create notification for receiver
    await pool.query(`
      INSERT INTO notifications (user_id, type, title, message, link, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [
      transaction.receiver_id,
      'payment_received',
      'Money Received',
      `You received ৳${transaction.amount} via SSLCommerz`,
      `/payments/transactions`
    ]);

    console.log('Payment completed successfully:', tran_id);

    // Redirect to success page
    res.redirect(
      `${process.env.FRONTEND_URL}/payments/transactions?status=success&amount=${amount}&method=sslcommerz`
    );

  } catch (error) {
    console.error('Payment success handler error:', error);
    res.redirect(
      `${process.env.FRONTEND_URL}/payments/send?status=failed&message=Payment processing failed`
    );
  }
};

/**
 * Handle failed payment callback
 */
exports.paymentFail = async (req, res) => {
  try {
    const { tran_id, error } = req.body;

    console.log('Payment failed callback:', req.body);

    // Update transaction status
    await pool.query(
      'UPDATE transactions SET status = $1 WHERE payment_reference = $2',
      ['failed', tran_id]
    );

    res.redirect(
      `${process.env.FRONTEND_URL}/payments/send?status=failed&message=${encodeURIComponent(error || 'Payment failed')}`
    );
  } catch (error) {
    console.error('Payment fail handler error:', error);
    res.redirect(
      `${process.env.FRONTEND_URL}/payments/send?status=failed&message=Payment failed`
    );
  }
};

/**
 * Handle cancelled payment callback
 */
exports.paymentCancel = async (req, res) => {
  try {
    const { tran_id } = req.body;

    console.log('Payment cancelled callback:', req.body);

    // Update transaction status
    await pool.query(
      'UPDATE transactions SET status = $1 WHERE payment_reference = $2',
      ['cancelled', tran_id]
    );

    res.redirect(
      `${process.env.FRONTEND_URL}/payments/send?status=cancelled&message=Payment was cancelled`
    );
  } catch (error) {
    console.error('Payment cancel handler error:', error);
    res.redirect(
      `${process.env.FRONTEND_URL}/payments/send?status=cancelled&message=Payment cancelled`
    );
  }
};

/**
 * Handle IPN (Instant Payment Notification)
 */
exports.paymentIPN = async (req, res) => {
  try {
    const { tran_id, val_id, status, amount } = req.body;

    console.log('IPN received:', req.body);

    // Validate payment
    const validation = await sslcommerzService.validatePayment(val_id);

    if (validation.success && validation.data.status === 'VALID') {
      // Update transaction if not already updated
      const checkQuery = await pool.query(
        'SELECT status FROM transactions WHERE payment_reference = $1',
        [tran_id]
      );

      if (checkQuery.rows[0] && checkQuery.rows[0].status === 'pending') {
        await pool.query(
          'UPDATE transactions SET status = $1, ssl_val_id = $2 WHERE payment_reference = $3',
          ['completed', val_id, tran_id]
        );
      }
    }

    res.status(200).send('IPN processed');
  } catch (error) {
    console.error('IPN handler error:', error);
    res.status(500).send('IPN processing failed');
  }
};

/**
 * Query transaction status
 */
exports.queryTransaction = async (req, res) => {
  try {
    const { tran_id } = req.params;

    const response = await sslcommerzService.queryByTransactionId(tran_id);

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Query transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to query transaction',
      error: error.message
    });
  }
};

/**
 * Initiate refund
 */
exports.initiateRefund = async (req, res) => {
  try {
    const { tran_id, refund_amount, refund_remarks } = req.body;

    // Get transaction details
    const transactionQuery = await pool.query(
      'SELECT * FROM transactions WHERE payment_reference = $1',
      [tran_id]
    );

    if (!transactionQuery.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const transaction = transactionQuery.rows[0];

    if (transaction.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed transactions can be refunded'
      });
    }

    // Initiate refund with SSLCommerz
    const refundData = {
      refund_amount: refund_amount || transaction.amount,
      refund_remarks: refund_remarks || 'Refund requested',
      bank_tran_id: transaction.ssl_bank_tran_id,
      refe_id: tran_id
    };

    const refundResponse = await sslcommerzService.initiateRefund(refundData);

    // Update transaction
    await pool.query(
      'UPDATE transactions SET status = $1, refund_status = $2 WHERE payment_reference = $3',
      ['refund_pending', 'initiated', tran_id]
    );

    res.json({
      success: true,
      message: 'Refund initiated successfully',
      data: refundResponse.data
    });

  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate refund',
      error: error.message
    });
  }
};

/**
 * Query refund status
 */
exports.queryRefund = async (req, res) => {
  try {
    const { refund_ref_id } = req.params;

    const response = await sslcommerzService.queryRefund(refund_ref_id);

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Query refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to query refund',
      error: error.message
    });
  }
};
