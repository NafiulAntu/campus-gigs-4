// Migration script to add firebase_uid column to users table
const pool = require('./config/db');

async function runMigration() {
  try {
    console.log('Starting migration: add_firebase_uid...');
    
    // Add firebase_uid column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE
    `);
    console.log('✓ Added firebase_uid column');
    
    // Create index for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)
    `);
    console.log('✓ Created index on firebase_uid');
    
    // Display current schema
    const result = await pool.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('\n✓ Migration completed successfully!\n');
    console.log('Current users table schema:');
    console.table(result.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
