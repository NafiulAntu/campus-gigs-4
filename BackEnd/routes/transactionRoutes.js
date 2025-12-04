const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Send money to another user
router.post('/send', transactionController.sendMoney);

// Get user's transaction history
router.get('/history', transactionController.getTransactions);

// Get specific transaction
router.get('/:transactionId', transactionController.getTransactionById);

// Get user balance
router.get('/balance/current', transactionController.getBalance);

// Add balance (for testing/admin)
router.post('/balance/add', transactionController.addBalance);

// Withdraw funds
router.post('/withdraw', transactionController.withdrawFunds);

module.exports = router;
