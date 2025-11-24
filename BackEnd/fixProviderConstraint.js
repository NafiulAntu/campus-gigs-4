// Fix provider constraint to include 'firebase'
const pool = require('./config/db');

async function fixProviderConstraint() {
  try {
    console.log('Fixing provider constraint...');
    
    // Drop old constraint
    await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_provider_check');
    console.log('✅ Dropped old constraint');
    
    // Add new constraint with 'firebase'
    await pool.query(`
      ALTER TABLE users 
      ADD CONSTRAINT users_provider_check 
      CHECK (provider IN ('local', 'google', 'github', 'linkedin', 'firebase'))
    `);
    console.log('✅ Added new constraint with firebase support');
    
    // Verify
    const result = await pool.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition 
      FROM pg_constraint 
      WHERE conrelid = 'users'::regclass AND contype = 'c'
    `);
    console.log('\n📋 Updated constraint:');
    console.table(result.rows);
    
    console.log('\n✅ Provider constraint fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to fix constraint:', error);
    process.exit(1);
  }
}

fixProviderConstraint();
