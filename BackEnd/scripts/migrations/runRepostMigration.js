const pool = require('../../config/db');
const fs = require('fs');
const path = require('path');

async function runRepostMigration() {
  try {
    console.log('📦 Running repost support migration...');
    
    const migrationPath = path.join(__dirname, '../../migrations/add_repost_support.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Repost support migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runRepostMigration();
