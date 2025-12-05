/**
 * Migration Script: Add Premium Columns to Users Table
 * Run this script to add is_premium and premium_expires_at columns
 */

const pool = require('../../config/db');

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting migration: Add Premium Columns to Users...');
    
    await client.query('BEGIN');
    
    // Add is_premium column
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE
    `);
    console.log('✅ Added is_premium column');
    
    // Add premium_expires_at column
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP
    `);
    console.log('✅ Added premium_expires_at column');
    
    // Add indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_is_premium ON users(is_premium)
    `);
    console.log('✅ Created index on is_premium');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_premium_expires ON users(premium_expires_at)
    `);
    console.log('✅ Created index on premium_expires_at');
    
    // Update existing users with active subscriptions
    const result = await client.query(`
      UPDATE users u
      SET is_premium = TRUE,
          premium_expires_at = s.end_date
      FROM subscriptions s
      WHERE u.id = s.user_id 
        AND s.status = 'active' 
        AND s.end_date > NOW()
        AND u.is_premium IS NOT TRUE
    `);
    console.log(`✅ Updated ${result.rowCount} users with active subscriptions`);
    
    // Add comments
    await client.query(`
      COMMENT ON COLUMN users.is_premium IS 'Indicates if the user has an active premium subscription'
    `);
    await client.query(`
      COMMENT ON COLUMN users.premium_expires_at IS 'The date and time when the premium subscription expires'
    `);
    console.log('✅ Added column comments');
    
    await client.query('COMMIT');
    
    console.log('');
    console.log('🎉 Migration completed successfully!');
    console.log('   Premium columns added to users table');
    console.log('');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('✅ Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
