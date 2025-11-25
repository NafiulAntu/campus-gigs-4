// Optional PostgreSQL Message Routes
// Note: The current messaging system uses Firebase Firestore + Socket.io
// This file is provided as an alternative if you want to use PostgreSQL instead

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Get all conversations for current user
router.get('/conversations', messageController.getConversations);

// Get messages in a conversation
router.get('/:conversationId', messageController.getMessages);

// Send a new message
router.post('/', messageController.sendMessage);

// Mark messages as read
router.patch('/read', messageController.markAsRead);

module.exports = router;
