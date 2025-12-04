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
      status: 'pending'
    });

    const data = {
      amount,
      currency: 'BDT',
      transaction_id: tran_id,
      customer_name: user.fullname || user.username,
      customer_email: user.email,
      product_name: `Campus Gigs Premium - ${plan_type}`,
      success_url: `${process.env.FRONTEND_URL}/payment/success`,
      fail_url: `${process.env.FRONTEND_URL}/payment/failed`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancelled`
    };

    const response = await mockGateway.initiatePayment(data);

    res.json({
      success: true,
      gateway_url: response.GatewayPageURL,
      transaction_id: tran_id,
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

        // Create subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + PLAN_DAYS[planType]);

        await Subscription.create({
          user_id: transaction.user_id,
          plan_type: planType,
          start_date: startDate,
          end_date: endDate,
          status: 'active',
          transaction_id
        });

        res.redirect(`${process.env.FRONTEND_URL}/payment/success?tran_id=${transaction_id}`);
      }
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/payment/failed?tran_id=${transaction_id}`);
    }

  } catch (error) {
    res.status(500).json({ error: 'Payment processing failed' });
  }
};

module.exports = exports;
