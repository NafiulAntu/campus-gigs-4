const db = require('../config/db');

/**
 * Get list of currently active/online users
 */
exports.getActiveUsers = async (req, res) => {
  try {
    const io = req.app.get('io');
    
    if (!io || !io.getActiveUsers) {
      return res.status(503).json({
        success: false,
        message: 'Socket server not initialized'
      });
    }

    // Get array of Firebase UIDs that are currently connected
    const activeFirebaseUids = io.getActiveUsers();

    if (activeFirebaseUids.length === 0) {
      return res.json({
        success: true,
        data: {
          users: [],
          count: 0
        }
      });
    }

    // Fetch user details from PostgreSQL
    const query = `
      SELECT 
        id,
        firebase_uid,
        username,
        full_name,
        profile_picture,
        profession
      FROM users
      WHERE firebase_uid = ANY($1)
      ORDER BY full_name ASC
      LIMIT 50
    `;

    const result = await db.query(query, [activeFirebaseUids]);

    res.json({
      success: true,
      data: {
        users: result.rows,
        count: result.rows.length
      }
    });

  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active users',
      error: error.message
    });
  }
};

/**
 * Check if a specific user is online
 */
exports.checkUserOnline = async (req, res) => {
  try {
    const { userId } = req.params; // Can be firebase_uid or PostgreSQL id
    const io = req.app.get('io');

    if (!io || !io.getActiveUsers) {
      return res.status(503).json({
        success: false,
        message: 'Socket server not initialized'
      });
    }

    const activeFirebaseUids = io.getActiveUsers();
    
    // Check if it's a Firebase UID
    let isOnline = activeFirebaseUids.includes(userId);

    // If not found, check if it's a PostgreSQL ID
    if (!isOnline && !isNaN(userId)) {
      const result = await db.query(
        'SELECT firebase_uid FROM users WHERE id = $1',
        [parseInt(userId)]
      );
      
      if (result.rows.length > 0) {
        isOnline = activeFirebaseUids.includes(result.rows[0].firebase_uid);
      }
    }

    res.json({
      success: true,
      data: {
        userId,
        online: isOnline
      }
    });

  } catch (error) {
    console.error('Error checking user online status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check user status',
      error: error.message
    });
  }
};
