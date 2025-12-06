require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'PG Antu',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'antu@1972'
});

async function clearSubscriptions() {
  const client = await pool.connect();
  try {
    console.log('🔄 Clearing all subscriptions and setting user as non-premium...');
    
    // Delete payment transactions first (foreign key constraint)
    await client.query('DELETE FROM payment_transactions');
    console.log('✅ Payment transactions cleared');
    
    // Delete all subscriptions
    await client.query('DELETE FROM subscriptions');
    console.log('✅ Subscriptions cleared');
    
    // Set all users as non-premium
    await client.query(`
      UPDATE users 
      SET is_premium = false
    `);
    console.log('✅ Users set to non-premium');
    
    console.log('🎉 Done! You can now test Stripe payment fresh.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

clearSubscriptions();
