const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runVerificationMigration() {
  try {
    console.log('🔧 Running verification system migration...');

    // Read the SQL migration file
    const sqlPath = path.join(__dirname, '../migrations/create_verification_system.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the migration
    await pool.query(sql);

    console.log('✅ Verification system migration completed successfully!');

    // Check results
    const verificationTableCheck = await pool.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_name = 'verification_requests'
    `);

    const adminLogTableCheck = await pool.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_name = 'admin_logs'
    `);

    console.log('📊 Migration results:');
    console.log(`  - verification_requests table: ${verificationTableCheck.rows[0].count > 0 ? '✅ Created' : '❌ Missing'}`);
    console.log(`  - admin_logs table: ${adminLogTableCheck.rows[0].count > 0 ? '✅ Created' : '❌ Missing'}`);

    // Check if admin user exists
    const adminCheck = await pool.query(`
      SELECT COUNT(*) as count FROM users WHERE role IN ('admin', 'super_admin')
    `);
    console.log(`  - Admin users: ${adminCheck.rows[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

runVerificationMigration();
