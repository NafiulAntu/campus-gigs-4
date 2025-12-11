const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'antu@1972'
});

async function runMigration() {
  try {
    console.log('🔄 Running migration: add_repost_support.sql...');
    
    const migrationPath = path.join(__dirname, '../migrations/add_repost_support.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('✅ Column "repost_of" added to posts table');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();
