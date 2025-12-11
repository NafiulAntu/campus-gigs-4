/**
 * Stripe Payment Controller
 * FREE forever in test mode - No registration required for testing
 * Get test keys instantly from: https://dashboard.stripe.com/test/apikeys
 */

// Initialize Stripe only if secret key is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized');
} else {
  console.log('⚠️  Stripe secret key not found - Stripe payments disabled');
}

const Subscription = require('../models/Subscription');
const PaymentTransaction = require('../models/PaymentTransaction');
const User = require('../models/User');
const crypto = require('crypto');

// Store for one-time tokens (in production, use Redis)
const paymentTokens = new Map();

// Pricing (in BDT, converted to USD for Stripe)
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

// Convert BDT to USD (approximate rate)
const BDT_TO_USD = 0.0091; // 1 BDT = ~0.0091 USD

/**
 * Create Stripe Checkout Session
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    // Check if Stripe is initialized
    if (!stripe) {
      console.error('Stripe not initialized - secret key not configured');
      return res.status(500).json({ 
        success: false,
        error: 'Payment system not configured. Please contact support.' 
      });
    }

    const { plan_type } = req.body;
    const userId = req.user.id;

    console.log('Creating Stripe checkout for user:', userId, 'plan:', plan_type);

    if (!plan_type) {
      return res.status(400).json({ 
        success: false,
        error: 'Plan type is required' 
      });
    }

    if (!['15days', '30days', 'yearly'].includes(plan_type)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid plan type. Must be 15days, 30days, or yearly' 
      });
    }

    // Get user details
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Check existing subscription (TEMPORARILY DISABLED FOR TESTING)
    // const existingSubscription = await Subscription.findOne({
    //   where: { user_id: userId, status: 'active' }
    // });

    // if (existingSubscription && new Date(existingSubscription.end_date) > new Date()) {
    //   return res.status(400).json({ 
    //     success: false,
    //     error: 'You already have an active subscription' 
    //   });
    // }
    
    console.log('⚠️ TESTING MODE: Active subscription check bypassed for testing');

    const amountBDT = PRICING_BDT[plan_type];
    const amountUSD = Math.round(amountBDT * BDT_TO_USD * 100); // in cents

    console.log('Creating session - Amount BDT:', amountBDT, 'Amount USD cents:', amountUSD);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Campus Gigs Premium - ${plan_type}`,
              description: `${PLAN_DAYS[plan_type]} days premium subscription`,
            },
            unit_amount: amountUSD,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/premium`,
      customer_email: user.email,
      metadata: {
        user_id: userId.toString(),
        plan_type: plan_type,
        amount_bdt: amountBDT.toString()
      }
    });

    console.log('Stripe session created:', session.id);
    
    // Generate secure one-time token
    const secureToken = crypto.randomBytes(32).toString('hex');
    
    // Store token with session mapping (expires in 10 minutes)
    paymentTokens.set(secureToken, {
      sessionId: session.id,
      userId: userId,
      createdAt: Date.now(),
      used: false
    });
    
    // Clean up expired tokens (older than 10 minutes)
    setTimeout(() => {
      paymentTokens.delete(secureToken);
    }, 10 * 60 * 1000);

    // Create pending transaction
    await PaymentTransaction.create({
      user_id: userId,
      gateway_transaction_id: session.id,
      transaction_id: `STRIPE_${userId}_${Date.now()}`,
      amount: amountBDT,
      currency: 'BDT',
      status: 'pending',
      payment_method: 'stripe',
      payment_gateway: 'stripe',
      transaction_type: 'subscription',
      plan_type: plan_type,
      metadata: {
        session_id: session.id,
        plan_days: PLAN_DAYS[plan_type]
      }
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      transaction_id: session.id
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create checkout session',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Handle Stripe Webhook (Payment Success/Failure)
 */
exports.handleWebhook = async (req, res) => {
  // Check if Stripe is initialized
  if (!stripe) {
    console.error('Stripe webhook received but Stripe not initialized');
    return res.status(500).send('Payment system not configured');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleSuccessfulPayment(event.data.object);
      break;
    
    case 'checkout.session.expired':
      await handleExpiredSession(event.data.object);
      break;

    case 'payment_intent.payment_failed':
      await handleFailedPayment(event.data.object);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

/**
 * Handle successful payment
 */
async function handleSuccessfulPayment(session) {
  try {
    const { user_id, plan_type, amount_bdt } = session.metadata;
    const session_id = session.id;
    const userId = parseInt(user_id);

    // Use Sequelize transaction for atomicity
    const sequelize = require('../config/sequelize');
    await sequelize.transaction(async (t) => {
      // Update transaction using gateway_transaction_id (session ID)
      const transaction = await PaymentTransaction.findOne({
        where: { gateway_transaction_id: session_id },
        transaction: t
      });

      if (transaction) {
        transaction.status = 'success';
        transaction.payment_method = session.payment_method_types?.[0] || 'card';
        await transaction.save({ transaction: t });

        // Calculate dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + PLAN_DAYS[plan_type]);

        // Determine plan_type for database (monthly or yearly)
        const dbPlanType = plan_type === 'yearly' ? 'yearly' : 'monthly';

        // Create subscription with plan_duration
        const subscription = await Subscription.create({
          user_id: userId,
          plan_type: dbPlanType,
          plan_duration: plan_type, // Store original plan (15days/30days/yearly)
          start_date: startDate,
          end_date: endDate,
          status: 'active',
          auto_renew: false
        }, { transaction: t });

        // Link subscription to transaction
        transaction.subscription_id = subscription.id;
        await transaction.save({ transaction: t });

        // Update user premium status with expiry date
        await User.updatePremiumStatus(userId, true, endDate);

        console.log(`✅ Subscription created for user ${user_id}, expires:`, endDate);

        // Create notification after transaction commits
        t.afterCommit(async () => {
          try {
            const { createNotification } = require('../utils/simpleNotificationHelpers');
            const planNames = {
              '15days': '15 Days',
              '30days': '30 Days',
              'yearly': 'Yearly'
            };
            await createNotification({
              userId,
              type: 'system',
              content: `🎉 Welcome to Campus Gigs Premium! Your ${planNames[plan_type]} subscription is now active.`,
              metadata: { plan_type, subscription_id: subscription.id, amount: amount_bdt }
            });
          } catch (notifError) {
            console.error('Notification error:', notifError);
          }
        });
      }
    });
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

/**
 * Handle expired session
 */
async function handleExpiredSession(session) {
  try {
    const transaction = await PaymentTransaction.findOne({
      where: { gateway_transaction_id: session.id }
    });

    if (transaction) {
      transaction.status = 'cancelled';
      await transaction.save();
    }
  } catch (error) {
    console.error('Error handling expired session:', error);
  }
}

/**
 * Handle failed payment
 */
async function handleFailedPayment(paymentIntent) {
  try {
    // Find transaction by payment intent
    const session = await stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      limit: 1
    });

    if (session.data.length > 0) {
      const transaction = await PaymentTransaction.findOne({
        where: { gateway_transaction_id: session.data[0].id }
      });

      if (transaction) {
        transaction.status = 'failed';
        transaction.gateway_response = paymentIntent.last_payment_error;
        await transaction.save();
      }
    }
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

/**
 * Verify payment session (for manual check)
 */
exports.verifySession = async (req, res) => {
  try {
    // Check if Stripe is initialized
    if (!stripe) {
      console.error('Stripe not initialized - cannot verify session');
      return res.status(500).json({ 
        success: false,
        error: 'Payment system not configured' 
      });
    }

    const { session_id } = req.query;
    const userId = req.user.id;

    console.log('Verifying session:', session_id, 'for user:', userId);

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      // Check if subscription already activated
      const existingSubscription = await Subscription.findOne({
        where: { 
          user_id: userId,
          status: 'active'
        }
      });

      if (!existingSubscription) {
        // Extract plan details from metadata
        const planType = session.metadata.plan_type || '30days';
        const planDuration = PLAN_DAYS[planType] || 30;
        const planPrice = session.amount_total / 100;

        // Calculate dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + planDuration);

        // Determine plan_type for database (monthly or yearly)
        const dbPlanType = planType === 'yearly' ? 'yearly' : 'monthly';

        // Use Sequelize transaction for atomicity
        const sequelize = require('../config/sequelize');
        await sequelize.transaction(async (t) => {
          // Create subscription with all required fields
          const subscription = await Subscription.create({
            user_id: userId,
            plan_type: dbPlanType,
            plan_duration: planType, // Store original plan (15days/30days/yearly)
            start_date: startDate,
            end_date: endDate,
            amount: planPrice,
            currency: session.currency.toUpperCase(), // BDT, USD, etc
            status: 'active'
          }, { transaction: t });

          // Update transaction to link subscription and mark as success
          await PaymentTransaction.update(
            { 
              status: 'success',
              subscription_id: subscription.id,
              payment_intent_id: session.payment_intent
            },
            { 
              where: { gateway_transaction_id: session_id },
              transaction: t 
            }
          );

          // Update user premium status with expiry date
          await User.updatePremiumStatus(userId, true, endDate);

          console.log('✅ Premium subscription activated for user:', userId, 'expires:', endDate);

          // Create notification after transaction commits
          t.afterCommit(async () => {
            try {
              const { createNotification } = require('../utils/simpleNotificationHelpers');
              const planNames = {
                '15days': '15 Days',
                '30days': '30 Days',
                'yearly': 'Yearly'
              };
              await createNotification({
                userId,
                type: 'system',
                content: `🎉 Welcome to Campus Gigs Premium! Your ${planNames[planType]} subscription is now active.`,
                metadata: { plan_type: planType, subscription_id: subscription.id, amount: planPrice }
              });
            } catch (notifError) {
              console.error('Notification error:', notifError);
            }
          });
        });
      }

      res.json({
        success: true,
        status: 'completed',
        amount: session.amount_total / 100,
        currency: session.currency,
        plan_type: session.metadata.plan_type || '30days',
        message: 'Premium subscription activated successfully!'
      });
    }
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Verify Payment Token (One-time use)
 */
exports.verifyPaymentToken = async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token required'
      });
    }
    
    // Check if token exists
    const tokenData = paymentTokens.get(token);
    
    if (!tokenData) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    
    // Check if already used
    if (tokenData.used) {
      return res.status(400).json({
        success: false,
        error: 'Token already used'
      });
    }
    
    // Check if expired (10 minutes)
    if (Date.now() - tokenData.createdAt > 10 * 60 * 1000) {
      paymentTokens.delete(token);
      return res.status(400).json({
        success: false,
        error: 'Token expired'
      });
    }
    
    // Mark as used
    tokenData.used = true;
    paymentTokens.set(token, tokenData);
    
    // Return session ID for verification
    res.json({
      success: true,
      sessionId: tokenData.sessionId
    });
    
    // Delete token after 30 seconds
    setTimeout(() => {
      paymentTokens.delete(token);
    }, 30000);
    
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
