/**
 * Stripe Payment Routes
 */

const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripePaymentController');
const { protect } = require('../middleware/authMiddleware');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Stripe routes are working!' });
});

// Create checkout session (protected)
router.post('/create-checkout-session', (req, res, next) => {
  console.log('===== STRIPE CHECKOUT REQUEST RECEIVED =====');
  console.log('Body:', req.body);
  console.log('Headers:', req.headers.authorization ? 'Has Auth Token' : 'No Auth Token');
  console.log('User:', req.user ? req.user.id : 'Not authenticated yet');
  next();
}, protect, stripeController.createCheckoutSession);

// Stripe webhook (public - Stripe will call this)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

// Verify one-time payment token (protected)
router.get('/verify-token', protect, stripeController.verifyPaymentToken);

// Verify session (protected)
router.get('/verify-session', protect, stripeController.verifySession);

module.exports = router;
