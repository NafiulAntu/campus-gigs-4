const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'PG Antu',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'antu@1972',
});

async function fixSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking database schema...\n');
    
    // Check subscriptions table structure
    const subColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'subscriptions'
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Current subscriptions table columns:');
    subColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    console.log('');
    
    // Check notifications table structure
    const notifColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'notifications'
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Current notifications table columns:');
    notifColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    console.log('');
    
    // Check posts table structure
    const postColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'posts'
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Current posts table columns:');
    postColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    console.log('');
    
    // Fix subscriptions table - rename plan_name to plan_type if needed
    const hasPlanName = subColumns.rows.some(r => r.column_name === 'plan_name');
    const hasPlanType = subColumns.rows.some(r => r.column_name === 'plan_type');
    
    if (hasPlanName && !hasPlanType) {
      console.log('🔧 Renaming plan_name to plan_type in subscriptions table...');
      await client.query('ALTER TABLE subscriptions RENAME COLUMN plan_name TO plan_type;');
      console.log('✅ Renamed plan_name to plan_type');
    } else if (hasPlanType) {
      console.log('✅ Subscriptions table already has plan_type column');
    } else {
      console.log('⚠️  Neither plan_name nor plan_type found. Adding plan_type...');
      await client.query(`
        ALTER TABLE subscriptions 
        ADD COLUMN plan_type VARCHAR(20) NOT NULL DEFAULT 'monthly' 
        CHECK (plan_type IN ('monthly', 'yearly'));
      `);
      console.log('✅ Added plan_type column');
    }
    
    // Add plan_duration if missing
    const hasPlanDuration = subColumns.rows.some(r => r.column_name === 'plan_duration');
    if (!hasPlanDuration) {
      console.log('🔧 Adding plan_duration column...');
      await client.query('ALTER TABLE subscriptions ADD COLUMN plan_duration VARCHAR(20);');
      console.log('✅ Added plan_duration column');
    }
    
    // Fix notifications table - ensure read column exists
    const hasRead = notifColumns.rows.some(r => r.column_name === 'read');
    const hasIsRead = notifColumns.rows.some(r => r.column_name === 'is_read');
    
    if (hasIsRead && !hasRead) {
      console.log('🔧 Renaming is_read to read in notifications table...');
      await client.query('ALTER TABLE notifications RENAME COLUMN is_read TO read;');
      console.log('✅ Renamed is_read to read');
    } else if (!hasRead && !hasIsRead) {
      console.log('🔧 Adding read column to notifications table...');
      await client.query('ALTER TABLE notifications ADD COLUMN read BOOLEAN DEFAULT FALSE;');
      console.log('✅ Added read column');
    } else if (hasRead) {
      console.log('✅ Notifications table already has read column');
    }
    
    // Add read_at if missing
    const hasReadAt = notifColumns.rows.some(r => r.column_name === 'read_at');
    if (!hasReadAt) {
      console.log('🔧 Adding read_at column to notifications table...');
      await client.query('ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP;');
      console.log('✅ Added read_at column');
    }
    
    // Fix posts table - check for posted_by vs user_id
    const hasPostedBy = postColumns.rows.some(r => r.column_name === 'posted_by');
    const hasUserId = postColumns.rows.some(r => r.column_name === 'user_id');
    
    if (hasUserId && !hasPostedBy) {
      console.log('🔧 Adding posted_by as alias for user_id in posts table...');
      await client.query('ALTER TABLE posts RENAME COLUMN user_id TO posted_by;');
      console.log('✅ Renamed user_id to posted_by');
    } else if (hasPostedBy) {
      console.log('✅ Posts table already has posted_by column');
    }
    
    console.log('\n✅ Schema fixes completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixSchema().catch(console.error);
