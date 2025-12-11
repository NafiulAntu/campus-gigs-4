const pool = require('../config/db');

class Post {
  // Create a new post
  static async create(userId, content, mediaUrls = []) {
    const query = `
      INSERT INTO posts (posted_by, content, media_urls)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, content, mediaUrls]);
    return result.rows[0];
  }

  // Get all posts with user information
  static async getAll(currentUserId = null, limit = 50, offset = 0) {
    const query = `
      SELECT 
        p.*,
        u.full_name,
        u.username,
        u.profile_picture,
        u.email,
        u.firebase_uid,
        COALESCE((SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = $1), 0) > 0 as user_liked,
        COALESCE((SELECT COUNT(*) FROM post_shares WHERE post_id = p.id AND user_id = $1), 0) > 0 as user_shared,
        COALESCE(p.likes_count, 0) as likes_count,
        COALESCE(p.comments_count, 0) as comments_count,
        COALESCE(p.shares_count, 0) as shares_count,
        p.media_urls,
        p.posted_by as user_id,
        p.repost_of,
        -- Get original post data if this is a repost
        CASE WHEN p.repost_of IS NOT NULL THEN
          (SELECT json_build_object(
            'id', op.id,
            'content', op.content,
            'media_urls', op.media_urls,
            'full_name', ou.full_name,
            'username', ou.username,
            'profile_picture', ou.profile_picture,
            'posted_by', op.posted_by,
            'firebase_uid', ou.firebase_uid
          ) FROM posts op
          JOIN users ou ON op.posted_by = ou.id
          WHERE op.id = p.repost_of)
        ELSE NULL END as original_post
      FROM posts p
      JOIN users u ON p.posted_by = u.id
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [currentUserId, limit, offset]);
    return result.rows;
  }

  // Get posts by specific user
  static async getByUserId(userId, limit = 50, offset = 0) {
    const query = `
      SELECT 
        p.id,
        p.posted_by,
        p.content,
        p.media_urls,
        p.created_at,
        p.likes_count,
        p.comments_count,
        u.full_name,
        u.username,
        u.profile_picture
      FROM posts p
      JOIN users u ON p.posted_by = u.id
      WHERE p.posted_by = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  // Get a single post by ID
  static async getById(postId) {
    const query = `
      SELECT 
        p.*,
        u.full_name,
        u.username,
        u.profile_picture,
        u.email,
        COALESCE((SELECT COUNT(*) FROM post_likes WHERE post_id = p.id), 0) as likes_count,
        p.replies as comments_count,
        COALESCE((SELECT COUNT(*) FROM post_shares WHERE post_id = p.id), 0) as shares_count,
        p.media_urls,
        p.posted_by as user_id
      FROM posts p
      JOIN users u ON p.posted_by = u.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [postId]);
    return result.rows[0];
  }

  // Update a post
  static async update(postId, userId, content, mediaUrls) {
    const query = `
      UPDATE posts
      SET content = $1, media_urls = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND posted_by = $4
      RETURNING *
    `;
    const result = await pool.query(query, [content, mediaUrls || [], postId, userId]);
    return result.rows[0];
  }

  // Delete a post
  static async delete(postId, userId) {
    const query = 'DELETE FROM posts WHERE id = $1 AND posted_by = $2 RETURNING *';
    const result = await pool.query(query, [postId, userId]);
    return result.rows[0];
  }

  // Like/Unlike a post
  static async toggleLike(postId, userId) {
    try {
      // Check if user already liked the post
      const checkQuery = `SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2`;
      const checkResult = await pool.query(checkQuery, [postId, userId]);
      
      if (checkResult.rows.length > 0) {
        // Unlike: Remove the like
        await pool.query(`DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`, [postId, userId]);
        return { liked: false };
      } else {
        // Like: Add the like
        await pool.query(`INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)`, [postId, userId]);
        return { liked: true };
      }
    } catch (error) {
      console.error('Error in toggleLike:', error);
      throw error;
    }
  }

  // Add a comment to a post (simplified without post_comments table)
  static async addComment(postId, userId, comment) {
    // Just increment replies count for now
    const query = `
      UPDATE posts
      SET replies = replies + 1
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [postId]);
    return result.rows[0];
  }

  // Get comments for a post (placeholder - no post_comments table)
  static async getComments(postId) {
    return [];
  }

  // Share/Unshare a post
  static async toggleShare(postId, userId) {
    try {
      // Check if user already shared the post
      const checkQuery = `SELECT * FROM post_shares WHERE post_id = $1 AND user_id = $2`;
      const checkResult = await pool.query(checkQuery, [postId, userId]);
      
      if (checkResult.rows.length > 0) {
        // Unshare: Remove the share
        await pool.query(`DELETE FROM post_shares WHERE post_id = $1 AND user_id = $2`, [postId, userId]);
        return { shared: false };
      } else {
        // Share: Add the share
        await pool.query(`INSERT INTO post_shares (post_id, user_id) VALUES ($1, $2)`, [postId, userId]);
        return { shared: true };
      }
    } catch (error) {
      console.error('Error in toggleShare:', error);
      throw error;
    }
  }

  // Create a repost (share with optional comment)
  static async createRepost(userId, originalPostId, content = '') {
    const query = `
      INSERT INTO posts (posted_by, content, repost_of)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, content, originalPostId]);
    
    // Also add to post_shares for tracking
    await pool.query(`INSERT INTO post_shares (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [originalPostId, userId]);
    
    return result.rows[0];
  }

  // Get user's share of a specific post
  static async getUserShare(postId, userId) {
    const query = `
      SELECT p.* FROM posts p
      JOIN post_shares ps ON ps.post_id = $1 AND ps.user_id = $2
      WHERE p.posted_by = $2 AND p.repost_of = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [postId, userId]);
    return result.rows[0];
  }

  // Delete a repost
  static async deleteRepost(repostId) {
    const query = `DELETE FROM posts WHERE id = $1 RETURNING repost_of, posted_by`;
    const result = await pool.query(query, [repostId]);
    
    if (result.rows[0]) {
      // Remove from post_shares
      await pool.query(`DELETE FROM post_shares WHERE post_id = $1 AND user_id = $2`, 
        [result.rows[0].repost_of, result.rows[0].posted_by]);
    }
    
    return result.rows[0];
  }

  // Check if user liked a post (placeholder)
  static async isLikedByUser(postId, userId) {
    return false;
  }

  // Check if user shared a post (placeholder)
  static async isSharedByUser(postId, userId) {
    return false;
  }
}

module.exports = Post;