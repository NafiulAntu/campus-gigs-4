const express = require('express');
const router = express.Router();
const sslcommerzController = require('../controllers/sslcommerzController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/sslcommerz/init
 * @desc    Initialize SSLCommerz payment
 * @access  Private
 */
router.post('/init', protect, sslcommerzController.initSSLCommerzPayment);

/**
 * @route   POST /api/sslcommerz/success
 * @desc    Handle successful payment callback
 * @access  Public (called by SSLCommerz)
 */
router.post('/success', sslcommerzController.paymentSuccess);

/**
 * @route   POST /api/sslcommerz/fail
 * @desc    Handle failed payment callback
 * @access  Public (called by SSLCommerz)
 */
router.post('/fail', sslcommerzController.paymentFail);

/**
 * @route   POST /api/sslcommerz/cancel
 * @desc    Handle cancelled payment callback
 * @access  Public (called by SSLCommerz)
 */
router.post('/cancel', sslcommerzController.paymentCancel);

/**
 * @route   POST /api/sslcommerz/ipn
 * @desc    Handle IPN (Instant Payment Notification)
 * @access  Public (called by SSLCommerz)
 */
router.post('/ipn', sslcommerzController.paymentIPN);

/**
 * @route   GET /api/sslcommerz/query/:tran_id
 * @desc    Query transaction status
 * @access  Private
 */
router.get('/query/:tran_id', protect, sslcommerzController.queryTransaction);

/**
 * @route   POST /api/sslcommerz/refund
 * @desc    Initiate refund
 * @access  Private
 */
router.post('/refund', protect, sslcommerzController.initiateRefund);

/**
 * @route   GET /api/sslcommerz/refund/:refund_ref_id
 * @desc    Query refund status
 * @access  Private
 */
router.get('/refund/:refund_ref_id', protect, sslcommerzController.queryRefund);

// Subscription Payment Routes
const sslcommerzSubscriptionController = require('../controllers/sslcommerzSubscriptionController');

/**
 * @route   POST /api/sslcommerz/subscription/init
 * @desc    Initialize SSLCommerz premium subscription payment
 * @access  Private
 */
router.post('/subscription/init', protect, sslcommerzSubscriptionController.initPremiumSubscription);

/**
 * @route   POST /api/sslcommerz/subscription/success
 * @desc    Handle successful subscription payment callback
 * @access  Public (called by SSLCommerz)
 */
router.post('/subscription/success', sslcommerzSubscriptionController.subscriptionSuccess);

/**
 * @route   POST /api/sslcommerz/subscription/fail
 * @desc    Handle failed subscription payment callback
 * @access  Public (called by SSLCommerz)
 */
router.post('/subscription/fail', sslcommerzSubscriptionController.subscriptionFail);

/**
 * @route   POST /api/sslcommerz/subscription/cancel
 * @desc    Handle cancelled subscription payment callback
 * @access  Public (called by SSLCommerz)
 */
router.post('/subscription/cancel', sslcommerzSubscriptionController.subscriptionCancel);

/**
 * @route   POST /api/sslcommerz/subscription/ipn
 * @desc    Handle subscription payment IPN
 * @access  Public (called by SSLCommerz)
 */
router.post('/subscription/ipn', sslcommerzSubscriptionController.subscriptionIPN);

module.exports = router;
