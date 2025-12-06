const express = require('express');
const router = express.Router();
const mobileWalletController = require('../controllers/mobileWalletController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Initiate payment with mobile wallet gateway
router.post('/initiate', mobileWalletController.initiatePayment);

// Verify payment after gateway callback
router.post('/verify', mobileWalletController.verifyPayment);

// Check payment status
router.get('/status/:transaction_id', mobileWalletController.checkPaymentStatus);

// Cancel pending payment
router.post('/cancel/:transaction_id', mobileWalletController.cancelPayment);

module.exports = router;
