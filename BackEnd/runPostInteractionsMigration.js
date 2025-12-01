const fs = require('fs');
const pool = require('./config/db');

async function runMigration() {
  try {
    console.log('📊 Running post interactions migration...');
    const sql = fs.readFileSync('./migrations/create_post_interactions.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ Post interactions migration completed successfully!');
    console.log('📊 Created tables: post_likes, post_shares');
    console.log('📈 Created indexes for performance optimization');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
