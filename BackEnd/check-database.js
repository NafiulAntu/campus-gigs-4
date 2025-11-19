const { Pool } = require('pg');
require('dotenv').config();

async function checkDatabase() {
  console.log('🔍 Checking database connection...\n');
  
  // First, connect to default postgres database
  const defaultPool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'antu@1972'
  });
  
  try {
    // Check if "PG Antu" database exists
    const result = await defaultPool.query(
      "SELECT datname FROM pg_database WHERE datname = $1",
      ['PG Antu']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Database "PG Antu" does not exist');
      console.log('\n📝 Creating database "PG Antu"...');
      
      try {
        await defaultPool.query('CREATE DATABASE "PG Antu"');
        console.log('✅ Database "PG Antu" created successfully!');
      } catch (createError) {
        console.log('❌ Failed to create database:', createError.message);
      }
    } else {
      console.log('✅ Database "PG Antu" exists');
    }
    
    await defaultPool.end();
    
    // Now try connecting to "PG Antu"
    console.log('\n🔌 Testing connection to "PG Antu"...');
    const targetPool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'PG Antu',
      user: 'postgres',
      password: 'antu@1972'
    });
    
    const timeResult = await targetPool.query('SELECT NOW()');
    console.log('✅ Connected to "PG Antu" successfully!');
    console.log('✅ Database time:', timeResult.rows[0].now);
    
    // Check if users table exists
    const tableCheck = await targetPool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
    );
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Users table exists');
      
      const count = await targetPool.query('SELECT COUNT(*) FROM users');
      console.log(`📊 Users in database: ${count.rows[0].count}`);
    } else {
      console.log('⚠️  Users table does not exist');
      console.log('💡 Run: node setup-database.js to create the table');
    }
    
    await targetPool.end();
    console.log('\n🎉 Everything is ready!');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkDatabase();
