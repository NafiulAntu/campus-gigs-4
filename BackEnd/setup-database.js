require('dotenv').config();
const pool = require('./config/db');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');
    
    // Drop existing table
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('✓ Dropped existing users table (if any)');
    
    // Create users table with OAuth support
    const createTableQuery = `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        terms_agreed BOOLEAN DEFAULT FALSE NOT NULL,
        provider VARCHAR(50) DEFAULT 'local' CHECK (provider IN ('local', 'google', 'github', 'linkedin')),
        provider_id VARCHAR(255),
        profile_picture VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(createTableQuery);
    console.log('✓ Created users table with OAuth support');
    
    // Add unique constraint for OAuth
    await pool.query('ALTER TABLE users ADD CONSTRAINT unique_provider_id UNIQUE (provider, provider_id)');
    console.log('✓ Added unique provider constraint');
    
    // Create indexes
    await pool.query('CREATE INDEX idx_users_email ON users(email)');
    console.log('✓ Created email index');
    
    await pool.query('CREATE INDEX idx_users_provider ON users(provider)');
    console.log('✓ Created provider index');
    
    // Create update trigger function
    const createFunctionQuery = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;
    await pool.query(createFunctionQuery);
    console.log('✓ Created update function');
    
    // Create trigger
    const createTriggerQuery = `
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `;
    await pool.query(createTriggerQuery);
    console.log('✓ Created update trigger');
    
    // Verify table structure
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Users table structure:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : ''}`);
    });
    
    console.log('\n✅ Database setup complete!');
    console.log('🎉 Ready to accept signup/signin requests');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check PostgreSQL is running');
    console.error('   2. Verify database "PG Antu" exists');
    console.error('   3. Check password in .env file');
    console.error('   4. Try: ALTER USER postgres PASSWORD \'antu@1972\';');
    process.exit(1);
  }
}

setupDatabase();
