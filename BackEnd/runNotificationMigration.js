require('dotenv').config();
const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Running notification system migration...');
    
    const sqlPath = path.join(__dirname, 'migrations', 'create_notifications_system.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Notification system migration completed successfully!');
    console.log('📊 Created tables:');
    console.log('   - notifications');
    console.log('   - notification_preferences');
    console.log('   - fcm_tokens');
    console.log('📈 Created indexes for performance optimization');
    console.log('🔔 Notification system is ready to use!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
