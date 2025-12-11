const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const activeUsersController = require('../controllers/activeUsersController');

// Get all active/online users
router.get('/', protect, activeUsersController.getActiveUsers);

// Check if a specific user is online
router.get('/check/:userId', protect, activeUsersController.checkUserOnline);

module.exports = router;
