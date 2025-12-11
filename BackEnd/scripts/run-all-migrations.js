const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'PG Antu',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'antu@1972'
});

// List of migrations in correct order
const migrations = [
  'create_posts_tables.sql',
  'create_post_interactions.sql',
  'create_premium_system.sql',
  'create_followers_table.sql',
  'create_notifications_system.sql',
  'create_user_transactions.sql',
  'create_recent_activity_view.sql',
  'add_firebase_uid.sql',
  'add_fullname_phone_to_profiles.sql',
  'add_profession_username.sql',
  'add_premium_columns_to_users.sql',
  'add_payment_preferences.sql',
  'add_mobile_wallet_columns.sql',
  'add_sslcommerz_columns.sql',
  'add_sslcommerz_to_payment_transactions.sql',
  'add_plan_duration_to_subscriptions.sql',
  'add_repost_support.sql',
  'setup_send_money.sql'
];

async function runAllMigrations() {
  console.log('🔄 Running all migrations for PG Antu database...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const migration of migrations) {
    try {
      console.log(`📄 Running: ${migration}...`);
      
      const migrationPath = path.join(__dirname, '../migrations', migration);
      
      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️  Skipped: ${migration} (file not found)\n`);
        continue;
      }
      
      const sql = fs.readFileSync(migrationPath, 'utf8');
      await pool.query(sql);
      
      console.log(`✅ Success: ${migration}\n`);
      successCount++;
      
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`ℹ️  Already exists: ${migration}\n`);
        successCount++;
      } else {
        console.error(`❌ Error in ${migration}:`, error.message, '\n');
        errorCount++;
      }
    }
  }
  
  console.log('═══════════════════════════════════════');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('═══════════════════════════════════════');
  
  await pool.end();
}

runAllMigrations();
