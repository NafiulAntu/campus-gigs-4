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

  // Update user metadata (profession, username)
  static async updateMetadata(id, { profession, username, profile_picture }) {
    const query = `
      UPDATE users 
      SET profession = COALESCE($1, profession),
          username = COALESCE($2, username),
          profile_picture = COALESCE($3, profile_picture),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, full_name, email, profession, username, profile_picture
    `;
    const values = [profession, username, profile_picture, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find user by Firebase UID
  static async findByFirebaseUid(firebase_uid) {
    const query = 'SELECT * FROM users WHERE firebase_uid = $1';
    const result = await pool.query(query, [firebase_uid]);
    return result.rows[0];
  }

  // Create or update user from Firebase auth
  // Note: Firebase users have password = NULL because Firebase handles authentication
  // The password hash is stored securely in Firebase's system, not in our database
  static async upsertFirebaseUser({ firebase_uid, email, full_name, profile_picture, profession, username }) {
    try {
      const query = `
        INSERT INTO users (firebase_uid, email, full_name, profile_picture, profession, username, provider, terms_agreed, password)
        VALUES ($1, $2, $3, $4, $5, $6, 'firebase', true, NULL)
        ON CONFLICT (firebase_uid) 
        DO UPDATE SET 
          email = COALESCE(EXCLUDED.email, users.email),
          full_name = COALESCE(EXCLUDED.full_name, users.full_name),
          profile_picture = COALESCE(EXCLUDED.profile_picture, users.profile_picture),
          profession = COALESCE(EXCLUDED.profession, users.profession),
          username = COALESCE(EXCLUDED.username, users.username),
          updated_at = CURRENT_TIMESTAMP
        RETURNING id, firebase_uid, email, full_name, profile_picture, profession, username, provider, created_at
      `;
      const values = [firebase_uid, email, full_name, profile_picture, profession, username];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      // If email already exists, try to find and update that user
      if (error.code === '23505' && error.constraint === 'users_email_key') {
        console.log('Email already exists, linking Firebase UID to existing user...');
        const updateQuery = `
          UPDATE users 
          SET firebase_uid = $1, 
              provider = 'firebase',
              full_name = COALESCE($3, full_name),
              profile_picture = COALESCE($4, profile_picture),
              updated_at = CURRENT_TIMESTAMP
          WHERE email = $2
          RETURNING id, firebase_uid, email, full_name, profile_picture, profession, username, provider, created_at
        `;
        const result = await pool.query(updateQuery, [firebase_uid, email, full_name, profile_picture]);
        return result.rows[0];
      }
      throw error;
    }
  }

  // Link Firebase UID to existing user (for migration)
  static async linkFirebaseUid(id, firebase_uid) {
    const query = `
      UPDATE users 
      SET firebase_uid = $1, 
          provider = 'firebase',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, firebase_uid, email, full_name, provider
    `;
    const result = await pool.query(query, [firebase_uid, id]);
    return result.rows[0];
  }

  // Search users by username, full name, or email
  static async search(searchTerm) {
    const query = `
      SELECT id, firebase_uid, full_name, username, email, profile_picture, profession, provider, created_at
      FROM users 
      WHERE 
        LOWER(username) LIKE $1 OR 
        LOWER(full_name) LIKE $1 OR 
        LOWER(email) LIKE $1
      ORDER BY 
        CASE 
          WHEN LOWER(username) = LOWER($2) THEN 1
          WHEN LOWER(username) LIKE $3 THEN 2
          WHEN LOWER(full_name) LIKE $3 THEN 3
          ELSE 4
        END,
        full_name
      LIMIT 20
    `;
    const wildcardSearch = `%${searchTerm}%`;
    const exactSearch = searchTerm;
    const startsWithSearch = `${searchTerm}%`;
    const result = await pool.query(query, [wildcardSearch, exactSearch, startsWithSearch]);
    return result.rows;
  }
}

module.exports = User;