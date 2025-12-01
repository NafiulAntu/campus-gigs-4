require('dotenv').config();
const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('\n🚀 Running Payment Preferences Migration...\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', 'add_payment_preferences.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Executing migration...');
    
    // Execute migration
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!\n');
    console.log('Added:');
    console.log('  - payment_methods column (JSONB)');
    console.log('  - allow_payments column (BOOLEAN)');
    console.log('  - payment_note column (TEXT)\n');

    // Verify
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('payment_methods', 'allow_payments', 'payment_note')
    `);

    console.log('✅ Verification passed!');
    console.log(`   Found ${result.rows.length} new columns in users table:`);
    result.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    console.log('');

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Columns already exist - migration previously run');
    } else {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  } finally {
    await pool.end();
  }
}

runMigration();
