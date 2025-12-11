const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'PG Antu',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'antu@1972'
});

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database schema...\n');
    
    // Fix subscriptions table
    console.log('📝 Adding missing columns to subscriptions table...');
    await pool.query(`
      ALTER TABLE subscriptions 
      ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'BDT',
      ADD COLUMN IF NOT EXISTS payment_transaction_id INTEGER;
    `);
    console.log('✅ Subscriptions table fixed\n');
    
    // Fix posts table
    console.log('📝 Adding missing columns to posts table...');
    await pool.query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS media_urls TEXT[],
      ADD COLUMN IF NOT EXISTS original_post_id INTEGER;
    `);
    console.log('✅ Posts table fixed\n');
    
    // Fix payment_transactions table
    console.log('📝 Adding missing columns to payment_transactions table...');
    await pool.query(`
      ALTER TABLE payment_transactions 
      ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS payment_gateway VARCHAR(50),
      ADD COLUMN IF NOT EXISTS gateway_transaction_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS metadata JSONB,
      ADD COLUMN IF NOT EXISTS plan_type VARCHAR(20),
      ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS ssl_val_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS ssl_card_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS ssl_card_brand VARCHAR(50),
      ADD COLUMN IF NOT EXISTS ssl_bank_tran_id VARCHAR(255);
    `);
    console.log('✅ Payment transactions table fixed\n');
    
    console.log('═══════════════════════════════════════');
    console.log('✅ Database schema fixed successfully!');
    console.log('═══════════════════════════════════════');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixDatabase();
