const pool = require('../config/db');

class Post {
  // Create a new post
  static async create(userId, content, mediaUrls = []) {
    const query = `
      INSERT INTO posts (posted_by, content, media)
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
        false as user_liked,
        false as user_shared,
        p.likes as likes_count,
        p.replies as comments_count,
        0 as shares_count,
        p.media as media_urls
      FROM posts p
      JOIN users u ON p.posted_by = u.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  // Get posts by specific user
  static async getByUserId(userId, limit = 50, offset = 0) {
    const query = `
      SELECT 
        p.id,
        p.posted_by,
        p.content,
        p.media as media_urls,
        p.created_at,
        p.likes as likes_count,
        p.replies as comments_count,
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
        p.likes as likes_count,
        p.replies as comments_count,
        0 as shares_count,
        p.media as media_urls
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
      SET content = $1, media = $2, updated_at = CURRENT_TIMESTAMP
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

  // Like/Unlike a post (simplified without post_likes table)
  static async toggleLike(postId, userId) {
    // Just increment likes count for now
    const query = `
      UPDATE posts
      SET likes = likes + 1
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [postId]);
    return { liked: true, post: result.rows[0] };
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

  // Share/Unshare a post (simplified without post_shares table)
  static async toggleShare(postId, userId) {
    // No shares table, just return success
    return { shared: true };
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