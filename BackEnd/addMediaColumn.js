const pool = require('./config/db');

async function addMediaColumn() {
  try {
    // Check if media column exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'media'
    `);

    if (checkColumn.rows.length === 0) {
      console.log('Adding media column to posts table...');
      await pool.query(`
        ALTER TABLE posts 
        ADD COLUMN IF NOT EXISTS media TEXT[]
      `);
      console.log('✅ Media column added successfully');
    } else {
      console.log('✅ Media column already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addMediaColumn();
