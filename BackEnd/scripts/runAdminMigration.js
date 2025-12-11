require('dotenv').config();
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/create_admin_logs.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📋 Running admin migration...\n');
    
    // Execute the migration
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('✅ Admin logs table created');
    console.log('✅ Role column added to users table');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

runMigration();
