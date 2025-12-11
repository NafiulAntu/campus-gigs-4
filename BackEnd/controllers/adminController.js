const pool = require('../config/db');
const User = require('../models/User');

// Get all users with their details (for admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'all', role = 'all', profession = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];
    let paramCount = 0;

    // Search filter
    if (search) {
      paramCount++;
      whereClause += ` AND (u.full_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR u.username ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Status filter
    if (status === 'verified') {
      whereClause += ' AND u.is_verified = true';
    } else if (status === 'unverified') {
      whereClause += ' AND u.is_verified = false';
    } else if (status === 'pending') {
      whereClause += ' AND u.is_verified = false AND EXISTS (SELECT 1 FROM verification_requests vr WHERE vr.user_id = u.id AND vr.status = \'pending\')';
    }

    // Role filter
    if (role !== 'all') {
      paramCount++;
      whereClause += ` AND u.role = $${paramCount}`;
      params.push(role);
    }

    // Profession filter
    if (profession !== 'all') {
      paramCount++;
      whereClause += ` AND u.profession = $${paramCount}`;
      params.push(profession);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM users u 
      WHERE 1=1 ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get users with pagination
    paramCount++;
    const limitParam = paramCount;
    paramCount++;
    const offsetParam = paramCount;
    
    const query = `
      SELECT 
        u.id,
        u.firebase_uid,
        u.full_name,
        u.username,
        u.email,
        u.phone,
        u.profile_picture,
        u.profession,
        u.role,
        u.is_verified,
        u.verified_at,
        u.balance,
        u.is_premium,
        u.premium_until,
        u.provider,
        u.created_at,
        u.updated_at,
        (SELECT COUNT(*) FROM posts WHERE posted_by = u.id) as posts_count
      FROM users u
      WHERE 1=1 ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;
    
    params.push(parseInt(limit), parseInt(offset));
    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
};

// Get user details by ID (with all related data)
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('📊 Fetching details for user ID:', userId);

    // Get user basic info
    const userQuery = `
      SELECT u.*
      FROM users u
      WHERE u.id = $1
    `;
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = userResult.rows[0];
    delete user.password;
    console.log('✅ User found:', user.email);

    // Get counts from various tables
    let posts_count = 0;
    let followers_count = 0;
    let following_count = 0;
    
    try {
      const postsCountResult = await pool.query('SELECT COUNT(*) as count FROM posts WHERE posted_by = $1', [userId]);
      posts_count = parseInt(postsCountResult.rows[0].count);
    } catch (e) {}
    
    try {
      const followersResult = await pool.query('SELECT COUNT(*) as count FROM followers WHERE following_id = $1', [userId]);
      followers_count = parseInt(followersResult.rows[0].count);
    } catch (e) {}
    
    try {
      const followingResult = await pool.query('SELECT COUNT(*) as count FROM followers WHERE follower_id = $1', [userId]);
      following_count = parseInt(followingResult.rows[0].count);
    } catch (e) {}
    
    user.posts_count = posts_count;
    user.followers_count = followers_count;
    user.following_count = following_count;

    // Get user's posts
    const postsQuery = `
      SELECT id, content, media, likes_count, shares_count, comments_count, created_at
      FROM posts 
      WHERE posted_by = $1 
      ORDER BY created_at DESC 
      LIMIT 20
    `;
    const postsResult = await pool.query(postsQuery, [userId]);

    // Get profile data based on profession
    let profileData = null;
    if (user.profession === 'Student') {
      const studentQuery = 'SELECT * FROM students WHERE user_id = $1';
      const studentResult = await pool.query(studentQuery, [userId]);
      profileData = studentResult.rows[0] || null;
    } else if (user.profession === 'Teacher') {
      const teacherQuery = 'SELECT * FROM teachers WHERE user_id = $1';
      const teacherResult = await pool.query(teacherQuery, [userId]);
      profileData = teacherResult.rows[0] || null;
    } else if (user.profession === 'Employee') {
      const employeeQuery = 'SELECT * FROM employees WHERE user_id = $1';
      const employeeResult = await pool.query(employeeQuery, [userId]);
      profileData = employeeResult.rows[0] || null;
    }

    // Get verification history
    let verificationHistory = [];
    try {
      const verificationQuery = `
        SELECT * FROM verification_requests 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `;
      const verificationResult = await pool.query(verificationQuery, [userId]);
      verificationHistory = verificationResult.rows;
    } catch (e) {
      // Table doesn't exist, skip
    }

    // Get transaction history
    const transactionsQuery = `
      SELECT * FROM user_transactions 
      WHERE sender_id = $1 OR receiver_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    let transactions = [];
    try {
      const transactionsResult = await pool.query(transactionsQuery, [userId]);
      transactions = transactionsResult.rows;
    } catch (e) {
      // Table might not exist
    }

    // Get subscription history
    const subscriptionsQuery = `
      SELECT * FROM subscriptions 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    let subscriptions = [];
    try {
      const subscriptionsResult = await pool.query(subscriptionsQuery, [userId]);
      subscriptions = subscriptionsResult.rows;
    } catch (e) {
      // Table might not exist
    }

    res.json({
      success: true,
      data: {
        user,
        profile: profileData,
        posts: postsResult.rows,
        verificationHistory,
        transactions,
        subscriptions
      }
    });
  } catch (error) {
    console.error('❌ Get user details error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user details',
      error: error.message 
    });
  }
};

// Approve user (set is_verified = true)
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role = 'user' } = req.body;
    const adminId = req.user.id;

    // Update user
    const query = `
      UPDATE users 
      SET is_verified = true, 
          verified_at = CURRENT_TIMESTAMP,
          verified_by = $1,
          role = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, full_name, email, is_verified, role
    `;
    const result = await pool.query(query, [adminId, role, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Log admin action
    try {
      await pool.query(`
        INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
        VALUES ($1, 'approve_user', 'user', $2, $3)
      `, [adminId, userId, JSON.stringify({ role })]);
    } catch (logError) {
      console.log('Admin log skipped (table may not exist):', logError.message);
    }

    res.json({
      success: true,
      message: 'User approved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve user',
      error: error.message 
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reason = req.body?.reason || 'No reason provided';
    const adminId = req.user.id;

    // Can't delete yourself
    if (parseInt(userId) === adminId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT id, email, full_name FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = userCheck.rows[0];

    console.log(`🗑️ Admin deleting user ${userId} (${userData.email}). Reason: ${reason}`);

    // Delete related data first (with error handling for missing tables)
    const deleteOperations = [
      { query: 'DELETE FROM verification_requests WHERE user_id = $1', name: 'verification requests' },
      { query: 'DELETE FROM teachers WHERE user_id = $1', name: 'teacher profile' },
      { query: 'DELETE FROM students WHERE user_id = $1', name: 'student profile' },
      { query: 'DELETE FROM employees WHERE user_id = $1', name: 'employee profile' },
      { query: 'DELETE FROM posts WHERE posted_by = $1', name: 'posts' },
      { query: 'DELETE FROM followers WHERE follower_id = $1 OR following_id = $1', name: 'followers' },
      { query: 'DELETE FROM notifications WHERE user_id = $1 OR actor_id = $1', name: 'notifications' },
      { query: 'DELETE FROM user_transactions WHERE sender_id = $1 OR receiver_id = $1', name: 'transactions' },
      { query: 'DELETE FROM subscriptions WHERE user_id = $1', name: 'subscriptions' },
      { query: 'DELETE FROM payment_transactions WHERE user_id = $1', name: 'payments' },
      { query: 'DELETE FROM messages WHERE sender_id = $1 OR receiver_id = $1', name: 'messages' },
      { query: 'DELETE FROM comments WHERE user_id = $1', name: 'comments' },
      { query: 'DELETE FROM likes WHERE user_id = $1', name: 'likes' }
    ];

    let deletedCounts = {};
    for (const operation of deleteOperations) {
      try {
        const result = await pool.query(operation.query, [userId]);
        if (result.rowCount > 0) {
          deletedCounts[operation.name] = result.rowCount;
          console.log(`  ✅ Deleted ${result.rowCount} ${operation.name}`);
        }
      } catch (e) {
        // Table might not exist, continue
        console.log(`  ⚠️ Skipped ${operation.name}: ${e.message}`);
      }
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    console.log(`✅ User ${userId} (${userData.email}) deleted successfully`);

    // Log admin action with deletion summary
    try {
      await pool.query(`
        INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
        VALUES ($1, 'delete_user', 'user', $2, $3)
      `, [adminId, userId, JSON.stringify({ 
        email: userData.email, 
        name: userData.full_name, 
        reason,
        deletedCounts
      })]);
    } catch (logError) {
      console.log('Admin log skipped (table may not exist):', logError.message);
    }

    res.json({
      success: true,
      message: 'User and all associated data deleted successfully',
      deletedItems: deletedCounts
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user',
      error: error.message 
    });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const adminId = req.user.id;

    // Validate role
    const validRoles = ['user', 'admin', 'super_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Must be one of: user, admin, super_admin' 
      });
    }

    // Can't change your own role
    if (parseInt(userId) === adminId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot change your own role' 
      });
    }

    // Update role
    const query = `
      UPDATE users 
      SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, full_name, email, role
    `;
    const result = await pool.query(query, [role, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Log admin action
    try {
      await pool.query(`
        INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
        VALUES ($1, 'change_role', 'user', $2, $3)
      `, [adminId, userId, JSON.stringify({ newRole: role })]);
    } catch (logError) {
      console.log('Admin log skipped (table may not exist):', logError.message);
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user role',
      error: error.message 
    });
  }
};

// Get user's posts
exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const countQuery = 'SELECT COUNT(*) as total FROM posts WHERE posted_by = $1';
    const countResult = await pool.query(countQuery, [userId]);
    const total = parseInt(countResult.rows[0].total);

    const query = `
      SELECT 
        p.id,
        p.content,
        p.media,
        p.likes_count,
        p.shares_count,
        p.comments_count,
        p.is_job_post,
        p.job_title,
        p.job_category,
        p.created_at,
        p.updated_at
      FROM posts p
      WHERE p.posted_by = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user posts',
      error: error.message 
    });
  }
};

// Get admin dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Total users
    const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
    
    // Verified users
    const verifiedCount = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_verified = true');
    
    // Pending verifications
    let pendingVerifications = 0;
    try {
      const pendingResult = await pool.query("SELECT COUNT(*) as count FROM verification_requests WHERE status = 'pending'");
      pendingVerifications = parseInt(pendingResult.rows[0].count);
    } catch(e) {}
    
    // Total posts
    const postsCount = await pool.query('SELECT COUNT(*) as count FROM posts');
    
    // Premium users
    const premiumCount = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_premium = true');
    
    // New users this week
    const newUsersWeek = await pool.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `);
    
    // New posts this week
    const newPostsWeek = await pool.query(`
      SELECT COUNT(*) as count FROM posts 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `);

    // Users by role
    const usersByRole = await pool.query(`
      SELECT role, COUNT(*) as count FROM users GROUP BY role
    `);

    // Recent admin activities
    let recentActivities = [];
    try {
      const activitiesResult = await pool.query(`
        SELECT al.*, u.full_name as admin_name
        FROM admin_logs al
        JOIN users u ON al.admin_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 10
      `);
      recentActivities = activitiesResult.rows;
    } catch(e) {}

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(usersCount.rows[0].count),
        verifiedUsers: parseInt(verifiedCount.rows[0].count),
        pendingVerifications,
        totalPosts: parseInt(postsCount.rows[0].count),
        premiumUsers: parseInt(premiumCount.rows[0].count),
        newUsersThisWeek: parseInt(newUsersWeek.rows[0].count),
        newPostsThisWeek: parseInt(newPostsWeek.rows[0].count),
        usersByRole: usersByRole.rows,
        recentActivities
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard stats',
      error: error.message 
    });
  }
};

// Check if current user is admin
exports.checkAdminStatus = async (req, res) => {
  try {
    const user = req.user;
    
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    
    res.json({
      success: true,
      isAdmin,
      role: user.role
    });
  } catch (error) {
    console.error('Check admin status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check admin status',
      error: error.message 
    });
  }
};
