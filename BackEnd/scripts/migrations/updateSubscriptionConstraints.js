const { Pool } = require('pg');
require('dotenv').config();

async function updateSubscriptionConstraints() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('🔄 Updating subscription constraints...');

    // Step 1: Drop the old unique constraint if it exists
    await pool.query(`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'subscriptions_user_id_status_key'
        ) THEN
          ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_user_id_status_key;
          RAISE NOTICE 'Dropped old unique constraint';
        END IF;
      END $$;
    `);

    // Step 2: Drop the CHECK constraint temporarily
    await pool.query(`
      ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
    `);

    // Step 3: Update any existing subscriptions if needed
    console.log('📊 Checking existing subscriptions...');
    const result = await pool.query(`
      SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active';
    `);
    console.log(`   Found ${result.rows[0].count} active subscriptions`);

    // Step 4: Create unique partial index for one active subscription per user
    // Note: We'll only enforce 'active' for now since 'completed' may not be in the enum yet
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_user_active_subscription 
      ON subscriptions (user_id) 
      WHERE status = 'active';
    `);

    console.log('✅ Successfully updated subscription constraints!');
    console.log('✅ Created unique index: idx_user_active_subscription');
    console.log('✅ Each user can now only have ONE active subscription');
    console.log('⚠️  Backend will handle "completed" status and prevent multiple subscriptions');
    
  } catch (error) {
    console.error('❌ Error updating constraints:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
if (require.main === module) {
  updateSubscriptionConstraints()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = updateSubscriptionConstraints;
