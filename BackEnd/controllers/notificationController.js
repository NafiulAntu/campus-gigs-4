const Notification = require('../models/Notification');
const admin = require('firebase-admin');

/**
 * Notification Controller
 * Handles notification CRUD operations and FCM integration
 */

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    const notifications = await Notification.getByUserId(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      unreadOnly: unreadOnly === 'true'
    });

    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        hasMore: notifications.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query; // Optional type filter (e.g., 'message')
    const count = await Notification.getUnreadCount(userId, type);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch unread count' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.markAsRead(id, userId);

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    // Emit socket event for real-time update
    if (req.io) {
      req.io.to(`user_${userId}`).emit('notification:read', { notificationId: id });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.markAllAsRead(userId);

    // Emit socket event for real-time update
    if (req.io) {
      req.io.to(`user_${userId}`).emit('notification:all_read');
    }

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark all as read' });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await Notification.delete(id, userId);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, error: 'Failed to delete notification' });
  }
};

// Get notification preferences
exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = await Notification.getPreferences(userId);

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch preferences' });
  }
};

// Update notification preferences
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = await Notification.updatePreferences(userId, req.body);

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ success: false, error: 'Failed to update preferences' });
  }
};

// Save FCM token
exports.saveFCMToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token, deviceType, deviceName } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    await Notification.saveFCMToken(userId, token, deviceType, deviceName);

    res.json({
      success: true,
      message: 'FCM token saved successfully'
    });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ success: false, error: 'Failed to save FCM token' });
  }
};

// Remove FCM token
exports.removeFCMToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    await Notification.removeFCMToken(token);

    res.json({
      success: true,
      message: 'FCM token removed successfully'
    });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(500).json({ success: false, error: 'Failed to remove FCM token' });
  }
};

/**
 * Helper function to create and send notification
 * Used by other controllers (posts, messages, jobs, etc.)
 */
exports.createAndSendNotification = async ({
  userId,
  type,
  title,
  message,
  data = {},
  actorId = null,
  link = null,
  io = null
}) => {
  try {
    // Check if user wants this type of notification
    const shouldNotify = await Notification.shouldNotify(userId, type);
    if (!shouldNotify) {
      return null;
    }

    // Create notification in database
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      actorId,
      link
    });

    // Send real-time notification via Socket.io if user is online
    if (io) {
      io.to(`user_${userId}`).emit('notification:new', notification);
    }

    // Send push notification via FCM
    const preferences = await Notification.getPreferences(userId);
    if (preferences.push_enabled) {
      await sendPushNotification(userId, title, message, data, link);
    }

    return notification;
  } catch (error) {
    console.error('Error creating and sending notification:', error);
    throw error;
  }
};

/**
 * Send push notification via Firebase Cloud Messaging
 */
async function sendPushNotification(userId, title, body, data = {}, link = null) {
  try {
    const tokens = await Notification.getFCMTokens(userId);
    
    if (tokens.length === 0) {
      return;
    }

    const payload = {
      notification: {
        title,
        body,
        icon: '/logo192.png',
        badge: '/logo192.png',
        click_action: link || '/'
      },
      data: {
        ...data,
        url: link || '/'
      }
    };

    // Send to all user devices
    const promises = tokens.map(token => 
      admin.messaging().send({
        token,
        ...payload
      }).catch(err => {
        // Remove invalid tokens
        if (err.code === 'messaging/invalid-registration-token' ||
            err.code === 'messaging/registration-token-not-registered') {
          Notification.removeFCMToken(token);
        }
        console.error('FCM send error:', err);
      })
    );

    await Promise.all(promises);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

module.exports = exports;
