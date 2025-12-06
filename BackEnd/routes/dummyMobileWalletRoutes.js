const express = require('express');
const router = express.Router();
const dummyMobileWalletController = require('../controllers/dummyMobileWalletController');
const { protect } = require('../middleware/authMiddleware');

/**
 * DUMMY Mobile Wallet Routes
 * For testing bKash, Nagad, Rocket without real APIs
 */

// Initiate dummy payment
router.post('/initiate', protect, dummyMobileWalletController.initiateDummyPayment);

// Complete dummy payment (simulate success/failure)
router.post('/complete', protect, dummyMobileWalletController.completeDummyPayment);

// Get payment status
router.get('/status/:transaction_id', protect, dummyMobileWalletController.getDummyPaymentStatus);

// Get transaction history
router.get('/history', protect, dummyMobileWalletController.getDummyTransactionHistory);

module.exports = router;
