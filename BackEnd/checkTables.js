const pool = require('./config/db');

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'post%'
    `);
    
    console.log('Post-related tables found:');
    if (result.rows.length === 0) {
      console.log('❌ NO POST TABLES FOUND!');
      console.log('\n🔧 You need to run the SQL schema:');
      console.log('   Open BackEnd/migrations/create_posts_tables.sql');
      console.log('   Execute it in your PG Antu database\n');
    } else {
      result.rows.forEach(row => {
        console.log('✅', row.table_name);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking tables:', error.message);
    process.exit(1);
  }
}

checkTables();
