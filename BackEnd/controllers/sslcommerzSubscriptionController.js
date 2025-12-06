const sslcommerzService = require('../services/sslcommerzService');
const Subscription = require('../models/Subscription');
const PaymentTransaction = require('../models/PaymentTransaction');
const User = require('../models/User');
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Pricing in BDT
const PRICING_BDT = {
  '15days': 99,
  '30days': 150,
  yearly: 1500
};

const PLAN_DAYS = {
  '15days': 15,
  '30days': 30,
  yearly: 365
};

/**
 * Initialize SSLCommerz Premium Subscription Payment
 */
exports.initPremiumSubscription = async (req, res) => {
  try {
    const { plan_type } = req.body;
    const userId = req.user.id;

    console.log('Creating SSLCommerz subscription for user:', userId, 'plan:', plan_type);

    // Validate plan type
    if (!plan_type || !['15days', '30days', 'yearly'].includes(plan_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type. Must be 15days, 30days, or yearly'
      });
    }

    // Get user details
    const userResult = await pool.query(
      'SELECT id, full_name, email FROM users WHERE id = $1',
      [userId]
    );

    if (!userResult.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Check existing active subscription
    const existingSubscription = await Subscription.findOne({
      where: { 
        user_id: userId, 
        status: 'active' 
      }
    });

    if (existingSubscription && new Date(existingSubscription.end_date) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription'
      });
    }

    const amount = PRICING_BDT[plan_type];
    const tran_id = `SSL_SUB_${userId}_${Date.now()}_${uuidv4().substring(0, 8)}`;

    // Create pending payment transaction
    const paymentTransaction = await PaymentTransaction.create({
      user_id: userId,
      transaction_id: tran_id,
      payment_method: 'sslcommerz',
      amount: amount,
      currency: 'BDT',
      status: 'pending',
      plan_type: plan_type
    });

    // Get user phone
    const phoneQuery = await pool.query(`
      SELECT COALESCE(t.phone, s.phone, e.phone, '01711111111') as phone
      FROM users u
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE u.id = $1
    `, [userId]);

    const phone = phoneQuery.rows[0]?.phone || '01711111111';

    // Build payment data
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const paymentData = sslcommerzService.buildPaymentData({
      tran_id,
      total_amount: amount,
      currency: 'BDT',
      product_name: `Campus Gigs Premium - ${plan_type}`,
      product_category: 'Subscription',
      cus_name: user.full_name,
      cus_email: user.email,
      cus_phone: phone,
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      success_url: `${backendUrl}/api/sslcommerz/subscription/success`,
      fail_url: `${backendUrl}/api/sslcommerz/subscription/fail`,
      cancel_url: `${backendUrl}/api/sslcommerz/subscription/cancel`,
      ipn_url: `${backendUrl}/api/sslcommerz/subscription/ipn`
    });

    // Initialize payment with SSLCommerz
    const paymentResponse = await sslcommerzService.initPayment(paymentData);

    console.log('SSLCommerz subscription session created:', tran_id);

    res.json({
      success: true,
      message: 'Payment session created successfully',
      gatewayUrl: paymentResponse.gatewayUrl,
      transaction_id: tran_id,
      session_key: paymentResponse.sessionKey,
      amount: amount,
      plan_type: plan_type
    });

  } catch (error) {
    console.error('SSLCommerz subscription init error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment',
      error: error.message
    });
  }
};

/**
 * Handle successful subscription payment
 */
exports.subscriptionSuccess = async (req, res) => {
  try {
    const { tran_id, val_id, amount, card_type, card_brand, bank_tran_id } = req.body;

    console.log('Subscription payment success callback:', req.body);

    // Validate payment with SSLCommerz
    const validation = await sslcommerzService.validatePayment(val_id);

    if (!validation.success || validation.data.status !== 'VALID') {
      console.error('Subscription payment validation failed:', validation);
      return res.redirect(
        `${process.env.FRONTEND_URL}/premium?status=failed&message=Payment validation failed`
      );
    }

    // Get payment transaction
    const paymentTransaction = await PaymentTransaction.findOne({
      where: { transaction_id: tran_id }
    });

    if (!paymentTransaction) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/premium?status=failed&message=Transaction not found`
      );
    }

    const userId = paymentTransaction.user_id;
    const planType = paymentTransaction.plan_type;

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + PLAN_DAYS[planType]);

    // Create or update subscription
    const [subscription, created] = await Subscription.findOrCreate({
      where: { user_id: userId },
      defaults: {
        user_id: userId,
        plan_type: planType,
        plan_duration: planType,
        status: 'active',
        start_date: startDate,
        end_date: endDate,
        auto_renew: false
      }
    });

    if (!created) {
      // Update existing subscription
      subscription.plan_type = planType;
      subscription.plan_duration = planType;
      subscription.status = 'active';
      subscription.start_date = startDate;
      subscription.end_date = endDate;
      await subscription.save();
    }

    // Update payment transaction
    paymentTransaction.status = 'completed';
    paymentTransaction.payment_intent_id = val_id;
    paymentTransaction.ssl_val_id = val_id;
    paymentTransaction.ssl_card_type = card_type;
    paymentTransaction.ssl_card_brand = card_brand;
    paymentTransaction.ssl_bank_tran_id = bank_tran_id;
    await paymentTransaction.save();

    // Update user premium status
    await pool.query(
      'UPDATE users SET is_premium = true, premium_until = $1 WHERE id = $2',
      [endDate, userId]
    );

    // Create notification
    await pool.query(`
      INSERT INTO notifications (user_id, type, title, message, link, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [
      userId,
      'premium_activated',
      'Premium Activated!',
      `Your ${planType} premium subscription is now active`,
      '/premium'
    ]);

    console.log('Subscription activated successfully for user:', userId);

    res.redirect(
      `${process.env.FRONTEND_URL}/premium?status=success&plan=${planType}`
    );

  } catch (error) {
    console.error('Subscription success handler error:', error);
    res.redirect(
      `${process.env.FRONTEND_URL}/premium?status=failed&message=Payment processing failed`
    );
  }
};

/**
 * Handle failed subscription payment
 */
exports.subscriptionFail = async (req, res) => {
  try {
    const { tran_id, error } = req.body;

    console.log('Subscription payment failed:', req.body);

    // Update payment transaction
    await PaymentTransaction.update(
      { status: 'failed' },
      { where: { transaction_id: tran_id } }
    );

    res.redirect(
      `${process.env.FRONTEND_URL}/premium?status=failed&message=${encodeURIComponent(error || 'Payment failed')}`
    );
  } catch (error) {
    console.error('Subscription fail handler error:', error);
    res.redirect(
      `${process.env.FRONTEND_URL}/premium?status=failed&message=Payment failed`
    );
  }
};

/**
 * Handle cancelled subscription payment
 */
exports.subscriptionCancel = async (req, res) => {
  try {
    const { tran_id } = req.body;

    console.log('Subscription payment cancelled:', req.body);

    // Update payment transaction
    await PaymentTransaction.update(
      { status: 'cancelled' },
      { where: { transaction_id: tran_id } }
    );

    res.redirect(
      `${process.env.FRONTEND_URL}/premium?status=cancelled&message=Payment was cancelled`
    );
  } catch (error) {
    console.error('Subscription cancel handler error:', error);
    res.redirect(
      `${process.env.FRONTEND_URL}/premium?status=cancelled&message=Payment cancelled`
    );
  }
};

/**
 * Handle subscription payment IPN
 */
exports.subscriptionIPN = async (req, res) => {
  try {
    const { tran_id, val_id, status } = req.body;

    console.log('Subscription IPN received:', req.body);

    // Validate payment
    const validation = await sslcommerzService.validatePayment(val_id);

    if (validation.success && validation.data.status === 'VALID') {
      const paymentTransaction = await PaymentTransaction.findOne({
        where: { transaction_id: tran_id }
      });

      if (paymentTransaction && paymentTransaction.status === 'pending') {
        paymentTransaction.status = 'completed';
        paymentTransaction.ssl_val_id = val_id;
        await paymentTransaction.save();
      }
    }

    res.status(200).send('IPN processed');
  } catch (error) {
    console.error('Subscription IPN handler error:', error);
    res.status(500).send('IPN processing failed');
  }
};

module.exports = exports;
