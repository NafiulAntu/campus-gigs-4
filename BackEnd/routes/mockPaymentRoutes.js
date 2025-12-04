/**
 * Mock Payment Routes
 */

const express = require('express');
const router = express.Router();
const mockPaymentController = require('../controllers/mockPaymentController');
const { protect } = require('../middleware/authMiddleware');

// Initiate mock payment (protected)
router.post('/initiate', protect, mockPaymentController.initiatePayment);

// Complete mock payment (protected)
router.post('/complete', protect, mockPaymentController.completePayment);

module.exports = router;
