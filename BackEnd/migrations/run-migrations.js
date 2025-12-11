const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'PG Antu',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running migrations...\n');
    
    // Read and execute create_jobs_table.sql
    console.log('📝 Creating jobs tables...');
    const createTableSQL = fs.readFileSync(
      path.join(__dirname, 'create_jobs_table.sql'),
      'utf8'
    );
    await client.query(createTableSQL);
    console.log('✅ Jobs tables created successfully!\n');
    
    // Read and execute seed_demo_jobs.sql
    console.log('🌱 Seeding demo jobs...');
    const seedSQL = fs.readFileSync(
      path.join(__dirname, 'seed_demo_jobs.sql'),
      'utf8'
    );
    await client.query(seedSQL);
    console.log('✅ Demo jobs seeded successfully!\n');
    
    // Verify data
    const result = await client.query('SELECT COUNT(*) FROM jobs');
    console.log(`📊 Total jobs in database: ${result.rows[0].count}`);
    
    console.log('\n🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
