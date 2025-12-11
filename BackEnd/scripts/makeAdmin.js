require('dotenv').config();
const pool = require('../config/db');

async function makeAdmin() {
  try {
    const email = 'nafiul.nia@gmail.com';
    
    // First check if user exists
    const checkUser = await pool.query(
      'SELECT id, full_name, email, role FROM users WHERE email = $1',
      [email]
    );
    
    if (checkUser.rows.length === 0) {
      console.log('❌ User not found with email:', email);
      process.exit(1);
    }
    
    console.log('📋 Current user info:');
    console.log(checkUser.rows[0]);
    
    // Update to admin
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, full_name, email, role',
      ['admin', email]
    );
    
    console.log('\n✅ User updated to admin:');
    console.log(result.rows[0]);
    console.log('\n🎉 Success! You are now an admin.');
    console.log('⚠️  Please log out and log back in for changes to take effect.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

makeAdmin();
