const pool = require('../config/db');

async function makeSuperAdmin() {
  try {
    const email = 'nafiul.nia@gmail.com';
    
    // Update to super_admin
    await pool.query(
      'UPDATE users SET role = $1 WHERE email = $2',
      ['super_admin', email]
    );
    
    console.log(`✅ ${email} is now a Super Admin!`);
    console.log('🔐 Role updated: super_admin');
    console.log('✨ Super admins have full administrative privileges');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

makeSuperAdmin();
