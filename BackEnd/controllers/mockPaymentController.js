/**
 * Mock Payment Controller
 * Handles demo payment transactions without real money
 */

const { MockPaymentGateway } = require('../services/mockPaymentGateway');
const Subscription = require('../models/Subscription');
const PaymentTransaction = require('../models/PaymentTransaction');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

const mockGateway = new MockPaymentGateway();

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

// Initialize mock payment
exports.initiateMockPayment = async (req, res) => {
  try {
    const { plan_type } = req.body;
    const userId = req.user.id;

    if (!['15days', '30days', 'yearly'].includes(plan_type)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    const amount = PRICING[plan_type];
    const tran_id = `MOCK-${Date.now()}-${uuidv4().slice(0, 8)}`;

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
      status: 'pending',
      plan_type: plan_type,
      payment_method: 'mock'
    });

    const data = {
      amount,
      currency: 'BDT',
      transaction_id: tran_id,
      customer_name: user.fullname || user.username,
      customer_email: user.email,
      product_name: `Campus Gigs Premium - ${plan_type}`,
      success_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/mock-payment/success`,
      fail_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/mock-payment/fail`,
      cancel_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/mock-payment/cancel`
    };

    const response = await mockGateway.initiatePayment(data);

    res.json({
      success: true,
      gateway_url: response.GatewayPageURL,
      transaction_id: tran_id,
      plan_type: plan_type,
      mode: 'DEMO'
    });

  } catch (error) {
    res.status(500).json({ error: 'Payment initiation failed' });
  }
};

// Process mock payment
exports.processMockPayment = async (req, res) => {
  try {
    const { transaction_id, payment_method, card_number } = req.body;

    const result = await mockGateway.processPayment(transaction_id, payment_method, card_number);

    if (result.status === 'SUCCESS') {
      // Update transaction
      const transaction = await PaymentTransaction.findOne({
        where: { transaction_id }
      });

      if (transaction) {
        transaction.status = 'completed';
        transaction.payment_method = payment_method;
        await transaction.save();

        // Get plan type from transaction
        const mockTxn = mockGateway.getTransaction(transaction_id);
        const planType = mockTxn.product_name.includes('15days') ? '15days' :
                        mockTxn.product_name.includes('30days') ? '30days' : 'yearly';

        // Create or update subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + PLAN_DAYS[planType]);

        // Check if user already has an active subscription
        const existingSub = await Subscription.findOne({
          where: { 
            user_id: transaction.user_id,
            status: 'active'
          }
        });

        if (existingSub) {
          // Extend existing subscription
          existingSub.end_date = endDate;
          existingSub.plan_type = planType;
          existingSub.plan_duration = planType;
          await existingSub.save();
        } else {
          // Create new subscription
          await Subscription.create({
            user_id: transaction.user_id,
            plan_type: planType,
            plan_duration: planType,
            start_date: startDate,
            end_date: endDate,
            status: 'active',
            transaction_id
          });
        }

        // Activate premium for user
        const user = await User.findByPk(transaction.user_id);
        if (user) {
          user.is_premium = true;
          user.premium_activated_at = new Date();
          await user.save();
        }

        // Create notification for premium activation
        const pool = require('../config/db');
        try {
          await pool.query(`
            INSERT INTO notifications (user_id, type, title, message, link, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
          `, [
            transaction.user_id,
            'premium_activated',
            '🎉 Premium Activated!',
            `Your ${planType === '15days' ? '15 Days' : planType === '30days' ? '30 Days' : 'Yearly'} Premium subscription is now active! Enjoy all premium features.`,
            '/premium'
          ]);
        } catch (notifError) {
          console.error('Failed to create notification:', notifError);
        }

        console.log('✅ Mock payment completed successfully for user:', transaction.user_id, 'plan:', planType);

        // Return success JSON for API call
        return res.json({
          success: true,
          transaction_id,
          message: 'Payment successful',
          redirect_url: `/premium?status=success&plan=${planType}`
        });
      }
    }
    
    // Payment failed
    return res.json({
      success: false,
      transaction_id,
      message: result.message || 'Payment failed',
      redirect_url: `/premium?status=failed&error=${encodeURIComponent(result.message || 'Payment failed')}`
    });

  } catch (error) {
    console.error('Mock payment processing error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Payment processing failed',
      message: error.message
    });
  }
};

// Handle Success Callback (like Stripe/SSLCommerz)
exports.handleSuccess = async (req, res) => {
  try {
    const tran_id = req.query.tran_id || req.body.tran_id;
    
    console.log('✅ Mock payment success callback received');
    console.log('📋 Transaction ID:', tran_id);
    console.log('📋 Query params:', req.query);
    console.log('📋 Body:', req.body);

    if (!tran_id) {
      console.error('❌ No transaction ID provided');
      return res.redirect(`${process.env.FRONTEND_URL}/premium?status=failed&error=${encodeURIComponent('No transaction ID')}`);
    }

    // Get transaction
    console.log('🔍 Looking up transaction:', tran_id);
    const transaction = await PaymentTransaction.findOne({
      where: { transaction_id: tran_id }
    });

    if (!transaction) {
      console.error('❌ Transaction not found in database:', tran_id);
      return res.redirect(`${process.env.FRONTEND_URL}/premium?status=failed&error=${encodeURIComponent('Transaction not found')}`);
    }

    console.log('✅ Transaction found:', transaction.id, 'User:', transaction.user_id);

    // Get plan type from transaction
    const mockTxn = mockGateway.getTransaction(tran_id);
    const planType = transaction.plan_type || 
                    (mockTxn?.product_name.includes('15days') ? '15days' :
                     mockTxn?.product_name.includes('30days') ? '30days' : 'yearly');

    // Update transaction status
    transaction.status = 'completed';
    transaction.payment_method = transaction.payment_method || 'mock';
    await transaction.save();

    // Create or update subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + PLAN_DAYS[planType]);

    const existingSub = await Subscription.findOne({
      where: { 
        user_id: transaction.user_id,
        status: 'active'
      }
    });

    if (existingSub) {
      existingSub.end_date = endDate;
      existingSub.plan_type = planType;
      existingSub.plan_duration = planType;
      await existingSub.save();
    } else {
      await Subscription.create({
        user_id: transaction.user_id,
        plan_type: planType,
        plan_duration: planType,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        transaction_id: tran_id
      });
    }

    // Activate premium
    const user = await User.findByPk(transaction.user_id);
    if (user) {
      user.is_premium = true;
      user.premium_activated_at = new Date();
      await user.save();
    }

    // Create notification
    const pool = require('../config/db');
    try {
      await pool.query(`
        INSERT INTO notifications (user_id, type, title, message, link, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [
        transaction.user_id,
        'premium_activated',
        '🎉 Premium Activated!',
        `Your ${planType === '15days' ? '15 Days' : planType === '30days' ? '30 Days' : 'Yearly'} Premium subscription is now active!`,
        '/premium'
      ]);
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    console.log('✅ Mock payment success processed for user:', transaction.user_id);

    // Redirect to premium with success
    res.redirect(`${process.env.FRONTEND_URL}/premium?status=success&plan=${planType}`);

  } catch (error) {
    console.error('Mock payment success handler error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/premium?status=failed&error=Payment processing failed`);
  }
};

// Handle Fail Callback
exports.handleFail = async (req, res) => {
  try {
    const tran_id = req.query.tran_id || req.body.tran_id;
    const error = req.query.error || req.body.error || 'Payment failed';

    console.log('❌ Mock payment failed callback:', tran_id);

    if (tran_id) {
      const transaction = await PaymentTransaction.findOne({
        where: { transaction_id: tran_id }
      });

      if (transaction) {
        transaction.status = 'failed';
        await transaction.save();
      }
    }

    res.redirect(`${process.env.FRONTEND_URL}/premium?status=failed&error=${encodeURIComponent(error)}`);

  } catch (error) {
    console.error('Mock payment fail handler error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/premium?status=failed&error=Payment failed`);
  }
};

// Handle Cancel Callback
exports.handleCancel = async (req, res) => {
  try {
    const tran_id = req.query.tran_id || req.body.tran_id;

    console.log('⚠️ Mock payment cancelled:', tran_id);

    if (tran_id) {
      const transaction = await PaymentTransaction.findOne({
        where: { transaction_id: tran_id }
      });

      if (transaction) {
        transaction.status = 'cancelled';
        await transaction.save();
      }
    }

    res.redirect(`${process.env.FRONTEND_URL}/premium?status=cancelled`);

  } catch (error) {
    console.error('Mock payment cancel handler error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/premium?status=cancelled`);
  }
};

module.exports = exports;
