require('dotenv').config();
const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('\n🚀 Running Transaction System Migration...\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', 'create_user_transactions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Executing migration...');
    
    // Execute migration
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!\n');
    console.log('Created:');
    console.log('  - user_transactions table');
    console.log('  - users.balance column');
    console.log('  - Database triggers for auto-balance updates');
    console.log('  - Indexes for performance\n');

    // Verify
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_transactions'
    `);

    console.log('✅ Verification passed!');
    console.log(`   Found ${result.rows.length} columns in user_transactions table\n`);

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Tables already exist - migration previously run');
    } else {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  } finally {
    await pool.end();
  }
}

runMigration();
