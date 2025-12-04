const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Initiate payment (protected)
router.post('/initiate', protect, paymentController.initiatePayment);

// SSLCommerz callbacks (public - SSLCommerz will call these)
router.post('/success', paymentController.paymentSuccess);
router.post('/fail', paymentController.paymentFail);
router.post('/cancel', paymentController.paymentCancel);
router.post('/ipn', paymentController.paymentIPN);

// Transaction history (protected)
router.get('/transaction/:transactionId', protect, paymentController.getTransaction);
router.get('/history', protect, paymentController.getTransactionHistory);
router.get('/recent-activity', protect, paymentController.getRecentActivity);

module.exports = router;
