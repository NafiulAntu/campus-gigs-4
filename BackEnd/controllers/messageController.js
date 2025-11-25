// Optional PostgreSQL Message Controller
// Note: The current messaging system uses Firebase Firestore + Socket.io
// This file is provided as an alternative if you want to use PostgreSQL instead

const Message = require('../models/Message');
const { Op } = require('sequelize');

// Get conversation messages
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await Message.findAll({
      where: { conversationId },
      order: [['timestamp', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, receiverId, content } = req.body;
    const senderId = req.user.id; // From auth middleware

    const message = await Message.create({
      conversationId,
      senderId,
      receiverId,
      content,
      timestamp: new Date()
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.id;

    await Message.update(
      { isRead: true },
      {
        where: {
          id: { [Op.in]: messageIds },
          receiverId: userId
        }
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};

// Get conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all conversations where user is sender or receiver
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      order: [['timestamp', 'DESC']],
      limit: 100
    });

    // Group by conversation ID and get last message
    const conversations = {};
    messages.forEach(msg => {
      if (!conversations[msg.conversationId]) {
        conversations[msg.conversationId] = {
          conversationId: msg.conversationId,
          lastMessage: msg.content,
          timestamp: msg.timestamp,
          otherUserId: msg.senderId === userId ? msg.receiverId : msg.senderId,
          unreadCount: 0
        };
      }
      if (msg.receiverId === userId && !msg.isRead) {
        conversations[msg.conversationId].unreadCount++;
      }
    });

    res.json({ conversations: Object.values(conversations) });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};
