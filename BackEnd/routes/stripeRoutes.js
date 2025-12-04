/**
 * Stripe Payment Routes
 */

const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripePaymentController');
const authMiddleware = require('../middleware/authMiddleware');

// Create checkout session (protected)
router.post('/create-checkout-session', authMiddleware, stripeController.createCheckoutSession);

// Stripe webhook (public - Stripe will call this)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

// Verify session (protected)
router.get('/verify-session', authMiddleware, stripeController.verifySession);

module.exports = router;
