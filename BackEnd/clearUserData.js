// Clear all user data from PostgreSQL database
const pool = require('./config/db');

async function clearUserData() {
  try {
    console.log('🗑️  Clearing all user data and related records...\n');
    
    // Get counts before deletion
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const postCount = await pool.query('SELECT COUNT(*) FROM posts');
    const teacherCount = await pool.query('SELECT COUNT(*) FROM teachers');
    const studentCount = await pool.query('SELECT COUNT(*) FROM students');
    const employeeCount = await pool.query('SELECT COUNT(*) FROM employees');
    
    console.log(`📊 Current data in database:`);
    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log(`   Posts: ${postCount.rows[0].count}`);
    console.log(`   Teachers: ${teacherCount.rows[0].count}`);
    console.log(`   Students: ${studentCount.rows[0].count}`);
    console.log(`   Employees: ${employeeCount.rows[0].count}\n`);
    
    console.log('🗑️  Deleting related data first...');
    
    // Delete in order to respect foreign key constraints
    await pool.query('DELETE FROM posts');
    console.log('✅ Deleted all posts');
    
    await pool.query('DELETE FROM teachers');
    console.log('✅ Deleted all teachers');
    
    await pool.query('DELETE FROM students');
    console.log('✅ Deleted all students');
    
    await pool.query('DELETE FROM employees');
    console.log('✅ Deleted all employees');
    
    // Now delete users
    const result = await pool.query('DELETE FROM users RETURNING id');
    console.log(`✅ Deleted ${result.rowCount} users from PostgreSQL`);
    
    // Reset all ID sequences
    await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE posts_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE teachers_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE students_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE employees_id_seq RESTART WITH 1');
    console.log('✅ Reset all ID sequences to start from 1');
    
    // Verify deletion
    const afterCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`\n📊 Users remaining: ${afterCount.rows[0].count}`);
    
    console.log('\n✅ All user data and related records cleared from PostgreSQL!');
    console.log('\n📝 Note: Firebase users are NOT deleted automatically.');
    console.log('   To delete Firebase users, go to:');
    console.log('   https://console.firebase.google.com/');
    console.log('   → Authentication → Users → Manually delete each user\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to clear user data:', error);
    process.exit(1);
  }
}

clearUserData();
