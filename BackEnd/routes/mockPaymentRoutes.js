/**
 * Mock Payment Routes
 */

const express = require('express');
const router = express.Router();
const mockPaymentController = require('../controllers/mockPaymentController');
const { protect } = require('../middleware/authMiddleware');

// Initiate mock payment (protected)
router.post('/initiate', protect, mockPaymentController.initiateMockPayment);

// Complete mock payment (protected)
router.post('/complete', protect, mockPaymentController.completeMockPayment);

module.exports = router;
