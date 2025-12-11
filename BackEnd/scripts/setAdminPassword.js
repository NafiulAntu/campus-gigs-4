const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function setAdminPassword() {
  try {
    const email = 'nafiul.nia@gmail.com';
    const password = 'admin123'; // Change this to your desired password
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update the user
    await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hashedPassword, email]
    );
    
    console.log(`✅ Password set for ${email}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

setAdminPassword();
