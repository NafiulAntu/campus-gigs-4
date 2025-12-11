const pool = require('../config/db');

/**
 * Verification Request Model
 * Handles ID card verification requests
 */

class VerificationRequest {
  /**
   * Create a new verification request
   */
  static async create({
    user_id,
    user_type,
    id_card_url,
    id_card_back_url = null,
    extracted_data = {},
    institutional_email = null,
    email_domain = null
  }) {
    const query = `
      INSERT INTO verification_requests (
        user_id, user_type, id_card_url, id_card_back_url,
        extracted_data, institutional_email, email_domain, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *
    `;

    const values = [
      user_id,
      user_type,
      id_card_url,
      id_card_back_url,
      JSON.stringify(extracted_data),
      institutional_email,
      email_domain
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Get verification request by ID
   */
  static async findById(id) {
    const query = `
      SELECT vr.*, 
             u.full_name, u.email, u.username, u.profile_picture, u.profession
      FROM verification_requests vr
      JOIN users u ON vr.user_id = u.id
      WHERE vr.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get verification requests by user ID
   */
  static async findByUserId(userId) {
    const query = `
      SELECT * FROM verification_requests
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Get latest verification request by user ID
   */
  static async getLatestByUserId(userId) {
    const query = `
      SELECT * FROM verification_requests
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  /**
   * Get all pending verification requests (for admin dashboard)
   */
  static async getPending(limit = 50, offset = 0) {
    const query = `
      SELECT * FROM pending_verifications
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  /**
   * Get verification requests by status
   */
  static async getByStatus(status, limit = 50, offset = 0) {
    const query = `
      SELECT vr.*, 
             u.full_name, u.email, u.username, u.profile_picture, u.profession
      FROM verification_requests vr
      JOIN users u ON vr.user_id = u.id
      WHERE vr.status = $1
      ORDER BY vr.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [status, limit, offset]);
    return result.rows;
  }

  /**
   * Update verification status
   */
  static async updateStatus(id, status, reviewed_by, rejection_reason = null, admin_notes = null) {
    const query = `
      UPDATE verification_requests
      SET status = $1,
          reviewed_by = $2,
          rejection_reason = $3,
          admin_notes = $4,
          reviewed_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const values = [status, reviewed_by, rejection_reason, admin_notes, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Update extracted data
   */
  static async updateExtractedData(id, extractedData) {
    const query = `
      UPDATE verification_requests
      SET extracted_data = $1,
          status = 'processing'
      WHERE id = $2
      RETURNING *
    `;

    const values = [JSON.stringify(extractedData), id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Mark email as verified
   */
  static async markEmailVerified(id) {
    const query = `
      UPDATE verification_requests
      SET email_verified = true
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get verification statistics (for admin dashboard)
   */
  static async getStatistics() {
    const query = `SELECT * FROM verification_stats`;
    const result = await pool.query(query);
    return result.rows[0];
  }

  /**
   * Delete verification request
   */
  static async delete(id) {
    const query = `
      DELETE FROM verification_requests
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Check if user has pending verification
   */
  static async hasPendingVerification(userId) {
    const query = `
      SELECT COUNT(*) as count
      FROM verification_requests
      WHERE user_id = $1 AND status IN ('pending', 'processing')
    `;

    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Get recent verifications (last 7 days)
   */
  static async getRecent(days = 7, limit = 20) {
    const query = `
      SELECT vr.*, 
             u.full_name, u.email, u.username, u.profile_picture
      FROM verification_requests vr
      JOIN users u ON vr.user_id = u.id
      WHERE vr.created_at >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY vr.created_at DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

module.exports = VerificationRequest;
