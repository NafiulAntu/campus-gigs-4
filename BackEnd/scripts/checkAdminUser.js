const pool = require('../config/db');

async function checkAdmin() {
  try {
    const result = await pool.query(`
      SELECT id, email, role, password IS NOT NULL as has_password, 
             LENGTH(password) as password_length
      FROM users 
      WHERE role = 'admin' OR email = 'nafiul.nia@gmail.com'
    `);
    
    console.log('Admin users found:');
    console.log(JSON.stringify(result.rows, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkAdmin();
