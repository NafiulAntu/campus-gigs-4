const { Pool } = require('pg');
require('dotenv').config();

const passwords = [
  'antu@1972',
  'postgres',
  'admin',
  'root',
  '1234',
  '12345',
  'password',
  '' // empty password
];

async function testPasswords() {
  console.log('🔍 Testing PostgreSQL passwords...\n');
  
  for (const pwd of passwords) {
    try {
      const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'postgres', // Try postgres default DB first
        user: 'postgres',
        password: pwd
      });
      
      await pool.query('SELECT NOW()');
      console.log(`✅ SUCCESS! Password is: "${pwd}"`);
      console.log(`\n📝 Update your .env file with:`);
      console.log(`DB_PASSWORD=${pwd}`);
      await pool.end();
      return;
    } catch (error) {
      console.log(`❌ Failed: "${pwd || '(empty)'}"`);
    }
  }
  
  console.log('\n⚠️  None of the common passwords worked.');
  console.log('\n💡 Solutions:');
  console.log('1. Open pgAdmin and check your saved password');
  console.log('2. Reset password in pgAdmin:');
  console.log('   - Right-click PostgreSQL server → Properties → Connection');
  console.log('   - Or run: ALTER USER postgres PASSWORD \'antu@1972\';');
  console.log('3. Or enter your password below and update .env file');
}

testPasswords();
