const SSLCommerzPayment = require('sslcommerz-lts');
const sequelize = require('../config/sequelize');
const { Op } = require('sequelize');
const Subscription = require('../models/Subscription');
const PaymentTransaction = require('../models/PaymentTransaction');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// SSLCommerz configuration
const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
const is_live = process.env.SSLCOMMERZ_MODE === 'live'; // true for live, false for sandbox

// Pricing
const PRICING = {
  '15days': 99,
  '30days': 150,
  yearly: 1500
};

const PLAN_DAYS = {
  '15days': 15,
  '30days': 30,
  yearly: 365
};

// Initialize payment
exports.initiatePayment = async (req, res) => {
  try {
    const { plan_type } = req.body; // '15days', '30days', or 'yearly'
    const userId = req.user.id;

    // Validate plan
    if (!['15days', '30days', 'yearly'].includes(plan_type)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // Check if user already has active or completed subscription
    const existingSubscription = await Subscription.findOne({
      where: { 
        user_id: userId, 
        status: { [Op.in]: ['active', 'completed'] }
      }
    });

    if (existingSubscription && new Date(existingSubscription.end_date) > new Date()) {
      return res.status(400).json({ 
        error: 'You already have an active Premium subscription',
        subscription: {
          plan_type: existingSubscription.plan_type,
          expiry_date: existingSubscription.end_date,
          days_remaining: Math.ceil((new Date(existingSubscription.end_date) - new Date()) / (1000 * 60 * 60 * 24))
        }
      });
    }

    const amount = PRICING[plan_type];
    const tran_id = `CGIGS-${Date.now()}-${uuidv4().slice(0, 8)}`;

    // Get user details
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create pending transaction
    await PaymentTransaction.create({
      user_id: userId,
      transaction_id: tran_id,
      amount,
      currency: 'BDT',
      status: 'pending'
    });

    // SSLCommerz payment data
    const data = {
      total_amount: amount,
      currency: 'BDT',
      tran_id: tran_id,
      success_url: `${process.env.BACKEND_URL}/api/payments/success`,
      fail_url: `${process.env.BACKEND_URL}/api/payments/fail`,
      cancel_url: `${process.env.BACKEND_URL}/api/payments/cancel`,
      ipn_url: `${process.env.BACKEND_URL}/api/payments/ipn`,
      shipping_method: 'NO',
      product_name: `Campus Gigs Premium - ${plan_type}`,
      product_category: 'Subscription',
      product_profile: 'non-physical-goods',
      cus_name: user.fullname || user.username,
      cus_email: user.email,
      cus_add1: 'Bangladesh',
      cus_city: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: user.phone || '01700000000',
      value_a: userId.toString(), // Pass user_id
      value_b: plan_type, // Pass plan_type
      value_c: '', // Reserved for future use
      value_d: '' // Reserved for future use
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    if (apiResponse.status === 'SUCCESS') {
      res.json({
        success: true,
        gateway_url: apiResponse.GatewayPageURL,
        transaction_id: tran_id
      });
    } else {
      throw new Error('Payment initialization failed');
    }

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Payment initiation failed' });
  }
};

// Success callback
exports.paymentSuccess = async (req, res) => {
  try {
    const { tran_id, val_id, amount, card_type, status, value_a, value_b } = req.body;

    // Validate with SSLCommerz
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const validation = await sslcz.validate({ val_id });

    if (validation.status !== 'VALID' && validation.status !== 'VALIDATED') {
      throw new Error('Payment validation failed');
    }

    // Use transaction to ensure atomicity
    await sequelize.transaction(async (t) => {
      // Update payment transaction
      await PaymentTransaction.update(
        {
          status: 'success',
          payment_method: card_type,
          gateway_response: req.body
        },
        { where: { transaction_id: tran_id }, transaction: t }
      );

      const userId = parseInt(value_a);
      const planType = value_b;

      // Calculate dates
      const startDate = new Date();
      const endDate = new Date();
      const planDays = PLAN_DAYS[planType];
      endDate.setDate(endDate.getDate() + planDays);

      // Cancel any existing active subscriptions
      await Subscription.update(
        { status: 'cancelled' },
        { where: { 
          user_id: userId, 
          status: { [sequelize.Op.in]: ['active', 'completed'] }
        }, transaction: t }
      );

      // Create new subscription
      const subscription = await Subscription.create({
        user_id: userId,
        plan_type: planType,
        status: 'completed',
        start_date: startDate,
        end_date: endDate,
        auto_renew: true
      }, { transaction: t });

      // Link transaction to subscription
      await PaymentTransaction.update(
        { subscription_id: subscription.id },
        { where: { transaction_id: tran_id }, transaction: t }
      );

      // Update user premium status
      await User.updatePremiumStatus(userId, true, endDate);

      // After commit, emit notification
      t.afterCommit(async () => {
        try {
          const { createNotification } = require('../utils/simpleNotificationHelpers');
          await createNotification({
            userId,
            type: 'system',
            content: `🎉 Welcome to Campus Gigs Premium! Your ${planType} subscription is now active.`,
            metadata: { plan_type: planType, subscription_id: subscription.id }
          });
        } catch (notifError) {
          console.error('Notification error:', notifError);
        }
      });
    });

    // Redirect to frontend success page
    res.redirect(`${process.env.FRONTEND_URL}/payment/success?transaction=${tran_id}`);

  } catch (error) {
    console.error('Payment success handler error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  }
};

// Fail callback
exports.paymentFail = async (req, res) => {
  try {
    const { tran_id } = req.body;

    await PaymentTransaction.update(
      { status: 'failed', gateway_response: req.body },
      { where: { transaction_id: tran_id } }
    );

    res.redirect(`${process.env.FRONTEND_URL}/payment/failed?transaction=${tran_id}`);
  } catch (error) {
    console.error('Payment fail handler error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  }
};

// Cancel callback
exports.paymentCancel = async (req, res) => {
  try {
    const { tran_id } = req.body;

    await PaymentTransaction.update(
      { status: 'cancelled', gateway_response: req.body },
      { where: { transaction_id: tran_id } }
    );

    res.redirect(`${process.env.FRONTEND_URL}/payment/cancelled?transaction=${tran_id}`);
  } catch (error) {
    console.error('Payment cancel handler error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/cancelled`);
  }
};

// IPN (Instant Payment Notification) - for async updates
exports.paymentIPN = async (req, res) => {
  try {
    const { tran_id, status, val_id } = req.body;

    // Validate with SSLCommerz
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const validation = await sslcz.validate({ val_id });

    if (validation.status === 'VALID' || validation.status === 'VALIDATED') {
      await PaymentTransaction.update(
        { status: 'success', gateway_response: req.body },
        { where: { transaction_id: tran_id } }
      );
    }

    res.status(200).send('IPN received');
  } catch (error) {
    console.error('IPN handler error:', error);
    res.status(500).send('IPN processing failed');
  }
};

// Get transaction details
exports.getTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const transaction = await PaymentTransaction.findOne({
      where: { transaction_id: transactionId, user_id: userId }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};

// Get user's transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await PaymentTransaction.getUserTransactions(userId, 50);
    res.json(transactions);
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
};
