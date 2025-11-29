const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

// Get current subscription status
router.get('/status', protect, subscriptionController.getSubscriptionStatus);

// Quick premium check
router.get('/check', protect, subscriptionController.checkPremium);

// Cancel subscription (turn off auto-renew)
router.post('/cancel', protect, subscriptionController.cancelSubscription);

// Reactivate subscription (turn on auto-renew)
router.post('/reactivate', protect, subscriptionController.reactivateSubscription);

// Admin routes (add admin middleware in production)
// router.get('/admin/premium-users', protect, adminMiddleware, subscriptionController.getAllPremiumUsers);

module.exports = router;
