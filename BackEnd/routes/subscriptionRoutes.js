const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get current subscription status
router.get('/status', authenticateToken, subscriptionController.getSubscriptionStatus);

// Quick premium check
router.get('/check', authenticateToken, subscriptionController.checkPremium);

// Cancel subscription (turn off auto-renew)
router.post('/cancel', authenticateToken, subscriptionController.cancelSubscription);

// Reactivate subscription (turn on auto-renew)
router.post('/reactivate', authenticateToken, subscriptionController.reactivateSubscription);

// Admin routes (add admin middleware in production)
// router.get('/admin/premium-users', authenticateToken, adminMiddleware, subscriptionController.getAllPremiumUsers);

module.exports = router;
