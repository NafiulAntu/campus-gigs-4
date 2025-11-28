const pool = require('../config/db');

class Notification {
  /**
   * Create a new notification
   */
  static async create({ userId, type, title, message, data = {}, actorId = null, link = null }) {
    try {
      const query = `
        INSERT INTO notifications (user_id, type, title, message, data, actor_id, link)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const values = [userId, type, title, message, JSON.stringify(data), actorId, link];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a user with pagination
   */
  static async getByUserId(userId, { limit = 20, offset = 0, unreadOnly = false } = {}) {
    try {
      let query = `
        SELECT 
          n.*,
          u.username as actor_username,
          u.full_name as actor_name,
          u.profile_picture as actor_photo
        FROM notifications n
        LEFT JOIN users u ON n.actor_id = u.id
        WHERE n.user_id = $1
      `;
      
      const values = [userId];
      
      if (unreadOnly) {
        query += ' AND n.read = FALSE';
      }
      
      query += ' ORDER BY n.created_at DESC LIMIT $2 OFFSET $3';
      values.push(limit, offset);
      
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM notifications
        WHERE user_id = $1 AND read = FALSE
      `;
      const result = await pool.query(query, [userId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId, userId) {
    try {
      const query = `
        UPDATE notifications
        SET read = TRUE, read_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;
      const result = await pool.query(query, [notificationId, userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId) {
    try {
      const query = `
        UPDATE notifications
        SET read = TRUE, read_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND read = FALSE
        RETURNING id
      `;
      const result = await pool.query(query, [userId]);
      return result.rowCount;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async delete(notificationId, userId) {
    try {
      const query = 'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id';
      const result = await pool.query(query, [notificationId, userId]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Get user notification preferences
   */
  static async getPreferences(userId) {
    try {
      const query = 'SELECT * FROM notification_preferences WHERE user_id = $1';
      const result = await pool.query(query, [userId]);
      
      // Create default preferences if not exist
      if (result.rows.length === 0) {
        const insertQuery = `
          INSERT INTO notification_preferences (user_id)
          VALUES ($1)
          RETURNING *
        `;
        const insertResult = await pool.query(insertQuery, [userId]);
        return insertResult.rows[0];
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update user notification preferences
   */
  static async updatePreferences(userId, preferences) {
    try {
      const allowedFields = [
        'push_enabled', 'email_enabled', 'sms_enabled',
        'sup_notifications', 'repost_notifications', 'send_notifications',
        'message_notifications', 'accept_notifications', 'reject_notifications',
        'job_alert_notifications', 'follow_notifications'
      ];

      const updates = [];
      const values = [userId];
      let paramIndex = 2;

      Object.keys(preferences).forEach(key => {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = $${paramIndex}`);
          values.push(preferences[key]);
          paramIndex++;
        }
      });

      if (updates.length === 0) {
        return null;
      }

      const query = `
        UPDATE notification_preferences
        SET ${updates.join(', ')}
        WHERE user_id = $1
        RETURNING *
      `;

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Save FCM token for user
   */
  static async saveFCMToken(userId, token, deviceType = 'web', deviceName = null) {
    try {
      const query = `
        INSERT INTO fcm_tokens (user_id, token, device_type, device_name)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (token) 
        DO UPDATE SET last_used = CURRENT_TIMESTAMP
        RETURNING *
      `;
      const values = [userId, token, deviceType, deviceName];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error saving FCM token:', error);
      throw error;
    }
  }

  /**
   * Get FCM tokens for user
   */
  static async getFCMTokens(userId) {
    try {
      const query = `
        SELECT token FROM fcm_tokens
        WHERE user_id = $1
        ORDER BY last_used DESC
      `;
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => row.token);
    } catch (error) {
      console.error('Error fetching FCM tokens:', error);
      throw error;
    }
  }

  /**
   * Remove FCM token
   */
  static async removeFCMToken(token) {
    try {
      const query = 'DELETE FROM fcm_tokens WHERE token = $1';
      await pool.query(query, [token]);
      return true;
    } catch (error) {
      console.error('Error removing FCM token:', error);
      throw error;
    }
  }

  /**
   * Check if user should receive notification based on preferences
   */
  static async shouldNotify(userId, notificationType) {
    try {
      const preferences = await this.getPreferences(userId);
      const typeKey = `${notificationType}_notifications`;
      return preferences[typeKey] !== false;
    } catch (error) {
      console.error('Error checking notification preferences:', error);
      return true; // Default to sending notification
    }
  }
}

module.exports = Notification;
