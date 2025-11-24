// Test database connection and check users table
const pool = require('./config/db');

async function testDB() {
  try {
    console.log('Testing database connection...');
    
    // Check users table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Users table structure:');
    console.table(columns.rows);
    
    // Check existing users
    const users = await pool.query('SELECT id, email, firebase_uid, provider FROM users ORDER BY created_at DESC LIMIT 5');
    console.log('\n👥 Recent users:');
    console.table(users.rows);
    
    console.log('\n✅ Database test completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDB();
