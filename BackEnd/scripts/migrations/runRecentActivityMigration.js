const fs = require('fs');
const path = require('path');
const pool = require('../../config/db');

async function createRecentActivityView() {
  let client;
  
  try {
    console.log('🔄 Creating Recent Activity View and Indexes...\n');
    
    client = await pool.connect();
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', '..', 'migrations', 'create_recent_activity_view.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL
    await client.query(sql);
    
    console.log('✅ Recent Activity View created successfully!');
    console.log('✅ Function get_user_recent_activity() created!');
    console.log('✅ Performance indexes added!\n');
    
    // Test the view
    console.log('🧪 Testing the view...\n');
    
    const testQuery = `
      SELECT activity_type, COUNT(*) as count
      FROM recent_activity_view
      GROUP BY activity_type;
    `;
    
    const result = await client.query(testQuery);
    
    console.log('📊 Activity Statistics:');
    result.rows.forEach(row => {
      console.log(`   - ${row.activity_type}: ${row.count} records`);
    });
    
    // Test the function
    console.log('\n🧪 Testing function with user ID 1...\n');
    
    const functionTest = await client.query(
      'SELECT * FROM get_user_recent_activity($1, $2)',
      [1, 5]
    );
    
    console.log(`📊 Found ${functionTest.rows.length} recent activities for user 1:`);
    functionTest.rows.forEach((activity, index) => {
      console.log(`   ${index + 1}. [${activity.activity_type}] ${activity.description} - ৳${activity.amount}`);
    });
    
    console.log('\n✅ Recent Activity View setup complete!\n');
    
    console.log('📝 Usage Examples:');
    console.log('   SELECT * FROM get_user_recent_activity(1);          -- Get 5 recent activities');
    console.log('   SELECT * FROM get_user_recent_activity(1, 10);      -- Get 10 recent activities');
    console.log('   SELECT * FROM recent_activity_view WHERE user_id = 1; -- Direct view query\n');
    
  } catch (error) {
    console.error('❌ Error creating Recent Activity View:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  createRecentActivityView();
}

module.exports = createRecentActivityView;
