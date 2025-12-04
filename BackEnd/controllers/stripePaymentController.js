/**
 * Stripe Payment Controller
 * FREE forever in test mode - No registration required for testing
 * Get test keys instantly from: https://dashboard.stripe.com/test/apikeys
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/Subscription');
const PaymentTransaction = require('../models/PaymentTransaction');
const User = require('../models/User');

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

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key not configured');
      return res.status(500).json({ 
        success: false,
        error: 'Payment system not configured. Please contact support.' 
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

    // Check existing subscription
    const existingSubscription = await Subscription.findOne({
      where: { user_id: userId, status: 'active' }
    });

    if (existingSubscription && new Date(existingSubscription.end_date) > new Date()) {
      return res.status(400).json({ 
        success: false,
        error: 'You already have an active subscription' 
      });
    }

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

    // Create pending transaction
    await PaymentTransaction.create({
      user_id: userId,
      transaction_id: session.id,
      amount: amountBDT,
      currency: 'BDT',
      status: 'pending'
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
    const transaction_id = session.id;

    // Update transaction
    const transaction = await PaymentTransaction.findOne({
      where: { transaction_id }
    });

    if (transaction) {
      transaction.status = 'completed';
      transaction.payment_method = session.payment_method_types?.[0] || 'card';
      await transaction.save();

      // Create subscription
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + PLAN_DAYS[plan_type]);

      await Subscription.create({
        user_id: parseInt(user_id),
        plan_type: plan_type,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        transaction_id
      });

      console.log(`✅ Subscription created for user ${user_id}`);
    }
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
      where: { transaction_id: session.id }
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
        where: { transaction_id: session.data[0].id }
      });

      if (transaction) {
        transaction.status = 'failed';
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
    const { session_id } = req.query;

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      res.json({
        success: true,
        status: 'completed',
        amount: session.amount_total / 100,
        currency: session.currency
      });
    } else {
      res.json({
        success: false,
        status: session.payment_status
      });
    }

  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({ error: 'Failed to verify session' });
  }
};

module.exports = exports;
