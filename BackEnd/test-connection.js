require('dotenv').config();
const pool = require('./config/db');

async function testConnection() {
  try {
    // Test database connection
    const dbInfo = await pool.query('SELECT current_database(), current_user, version()');
    console.log('\n✅ Connected to PostgreSQL');
    console.log('📊 Database:', dbInfo.rows[0].current_database);
    console.log('👤 User:', dbInfo.rows[0].current_user);
    console.log('📌 Version:', dbInfo.rows[0].version.split(' ')[0] + ' ' + dbInfo.rows[0].version.split(' ')[1]);

    // Check users table structure
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Users Table Structure:');
    tableStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : '(optional)'}`);
    });

    // Count users
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('\n👥 Total Users:', userCount.rows[0].count);

    // Show sample user (without password)
    const sampleUser = await pool.query('SELECT id, full_name, email, provider, created_at FROM users LIMIT 1');
    if (sampleUser.rows.length > 0) {
      console.log('\n📝 Sample User:');
      console.log('  ID:', sampleUser.rows[0].id);
      console.log('  Name:', sampleUser.rows[0].full_name);
      console.log('  Email:', sampleUser.rows[0].email);
      console.log('  Provider:', sampleUser.rows[0].provider);
      console.log('  Created:', sampleUser.rows[0].created_at);
    }

    console.log('\n✅ Your backend is fully connected to SQL database "PG Antu"!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    process.exit(1);
  }
}

testConnection();
