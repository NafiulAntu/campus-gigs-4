const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Initiate payment (protected)
router.post('/initiate', authenticateToken, paymentController.initiatePayment);

// SSLCommerz callbacks (public - SSLCommerz will call these)
router.post('/success', paymentController.paymentSuccess);
router.post('/fail', paymentController.paymentFail);
router.post('/cancel', paymentController.paymentCancel);
router.post('/ipn', paymentController.paymentIPN);

// Transaction history (protected)
router.get('/transaction/:transactionId', authenticateToken, paymentController.getTransaction);
router.get('/history', authenticateToken, paymentController.getTransactionHistory);

module.exports = router;
