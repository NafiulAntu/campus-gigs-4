const pool = require('../config/db');

async function checkSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'posts'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Posts table schema:');
    console.log('='.repeat(60));
    result.rows.forEach(row => {
      console.log(`${row.column_name.padEnd(20)} | ${row.data_type.padEnd(20)} | ${row.is_nullable}`);
    });
    console.log('='.repeat(60));
    
    // Check specifically for media columns
    const mediaColumns = result.rows.filter(row => 
      row.column_name.includes('media')
    );
    
    console.log('\n🎬 Media-related columns:');
    mediaColumns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSchema();
