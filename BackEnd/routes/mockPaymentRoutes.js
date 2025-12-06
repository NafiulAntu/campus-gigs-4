/**
 * Mock Payment Routes
 */

const express = require('express');
const router = express.Router();
const mockPaymentController = require('../controllers/mockPaymentController');
const { protect } = require('../middleware/authMiddleware');

// Test endpoint to verify routes are working
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Mock payment routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Initiate mock payment (protected)
router.post('/initiate', protect, mockPaymentController.initiateMockPayment);

// Complete mock payment (protected) - API endpoint
router.post('/complete', protect, mockPaymentController.processMockPayment);

// Success callback - Like Stripe/SSLCommerz (GET and POST)
router.get('/success', mockPaymentController.handleSuccess);
router.post('/success', mockPaymentController.handleSuccess);

// Fail callback - Like Stripe/SSLCommerz (GET and POST)
router.get('/fail', mockPaymentController.handleFail);
router.post('/fail', mockPaymentController.handleFail);

// Cancel callback (GET and POST)
router.get('/cancel', mockPaymentController.handleCancel);
router.post('/cancel', mockPaymentController.handleCancel);

module.exports = router;
