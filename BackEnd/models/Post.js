const pool = require('../config/db');

class Post {
  // Create a new post
  static async create(userId, content, mediaUrls = []) {
    const query = `
      INSERT INTO posts (user_id, content, media_urls)
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
        EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $1) as user_liked,
        EXISTS(SELECT 1 FROM post_shares WHERE post_id = p.id AND user_id = $1) as user_shared
      FROM posts p
      JOIN users u ON p.user_id = u.id
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
        p.*,
        u.full_name,
        u.username,
        u.profile_picture,
        u.email
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
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
        u.email
      FROM posts p
      JOIN users u ON p.user_id = u.id
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
      WHERE id = $3 AND user_id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [content, mediaUrls, postId, userId]);
    return result.rows[0];
  }

  // Delete a post
  static async delete(postId, userId) {
    const query = 'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(query, [postId, userId]);
    return result.rows[0];
  }

  // Like/Unlike a post
  static async toggleLike(postId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if already liked
      const checkQuery = 'SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2';
      const checkResult = await client.query(checkQuery, [postId, userId]);

      let liked = false;
      if (checkResult.rows.length > 0) {
        // Unlike: Remove like
        await client.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
        await client.query('UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1', [postId]);
        liked = false;
      } else {
        // Like: Add like
        await client.query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
        await client.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1', [postId]);
        liked = true;
      }

      await client.query('COMMIT');
      return { liked };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Add a comment to a post
  static async addComment(postId, userId, comment) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO post_comments (post_id, user_id, comment)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const result = await client.query(insertQuery, [postId, userId, comment]);

      // Increment comment count
      await client.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1', [postId]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get comments for a post
  static async getComments(postId) {
    const query = `
      SELECT 
        c.*,
        u.full_name,
        u.username,
        u.profile_picture
      FROM post_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at DESC
    `;
    const result = await pool.query(query, [postId]);
    return result.rows;
  }

  // Share/Unshare a post
  static async toggleShare(postId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if already shared
      const checkQuery = 'SELECT * FROM post_shares WHERE post_id = $1 AND user_id = $2';
      const checkResult = await client.query(checkQuery, [postId, userId]);

      let shared = false;
      if (checkResult.rows.length > 0) {
        // Unshare
        await client.query('DELETE FROM post_shares WHERE post_id = $1 AND user_id = $2', [postId, userId]);
        await client.query('UPDATE posts SET shares_count = GREATEST(0, shares_count - 1) WHERE id = $1', [postId]);
        shared = false;
      } else {
        // Share
        await client.query('INSERT INTO post_shares (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
        await client.query('UPDATE posts SET shares_count = shares_count + 1 WHERE id = $1', [postId]);
        shared = true;
      }

      await client.query('COMMIT');
      return { shared };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Check if user liked a post
  static async isLikedByUser(postId, userId) {
    const query = 'SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2';
    const result = await pool.query(query, [postId, userId]);
    return result.rows.length > 0;
  }

  // Check if user shared a post
  static async isSharedByUser(postId, userId) {
    const query = 'SELECT * FROM post_shares WHERE post_id = $1 AND user_id = $2';
    const result = await pool.query(query, [postId, userId]);
    return result.rows.length > 0;
  }
}

module.exports = Post;