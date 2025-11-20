const pool = require('../config/db');

class User {
  // Create a new user (local signup)
  static async create({ full_name, email, password, terms_agreed = true, provider = 'local', provider_id = null, profile_picture = null }) {
    const query = `
      INSERT INTO users (full_name, email, password, terms_agreed, provider, provider_id, profile_picture)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, full_name, email, provider, profile_picture, created_at
    `;
    const values = [full_name, email, password, terms_agreed, provider, provider_id, profile_picture];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find user by email
  static async findOne({ email }) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find user by provider and provider_id (for OAuth)
  static async findByProvider(provider, provider_id) {
    const query = 'SELECT * FROM users WHERE provider = $1 AND provider_id = $2';
    const result = await pool.query(query, [provider, provider_id]);
    return result.rows[0];
  }

  // Create OAuth user
  static async createOAuth({ full_name, email, provider, provider_id, profile_picture }) {
    const query = `
      INSERT INTO users (full_name, email, provider, provider_id, profile_picture, terms_agreed)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id, full_name, email, provider, provider_id, profile_picture, created_at
    `;
    const values = [full_name, email, provider, provider_id, profile_picture];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get all users
  static async findAll() {
    const query = 'SELECT id, full_name, email, provider, profile_picture, created_at FROM users ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Update user by ID
  static async update(id, { full_name, email, profile_picture }) {
    const query = `
      UPDATE users 
      SET full_name = COALESCE($1, full_name), 
          email = COALESCE($2, email), 
          profile_picture = COALESCE($3, profile_picture),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, full_name, email, provider, profile_picture, updated_at
    `;
    const values = [full_name, email, profile_picture, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete user by ID
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Update password
  static async updatePassword(id, hashedPassword) {
    const query = 'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id';
    const result = await pool.query(query, [hashedPassword, id]);
    return result.rows[0];
  }
}

module.exports = User;