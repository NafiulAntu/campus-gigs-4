const pool = require('../../config/db');

async function addPlanDurationColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting plan_duration column migration...');
    
    await client.query('BEGIN');

    // Check if column already exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'subscriptions' 
      AND column_name = 'plan_duration'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('⚠️  Column plan_duration already exists, skipping...');
      await client.query('ROLLBACK');
      return;
    }

    // Add plan_duration column
    await client.query(`
      ALTER TABLE subscriptions 
      ADD COLUMN plan_duration VARCHAR(20)
    `);
    console.log('✅ Added plan_duration column');

    // Add comment
    await client.query(`
      COMMENT ON COLUMN subscriptions.plan_duration 
      IS 'Original plan duration: 15days, 30days, or yearly'
    `);
    console.log('✅ Added column comment');

    // Create index
    await client.query(`
      CREATE INDEX idx_subscriptions_plan_duration 
      ON subscriptions(plan_duration)
    `);
    console.log('✅ Created index on plan_duration');

    // Update existing records
    const updateResult = await client.query(`
      UPDATE subscriptions 
      SET plan_duration = CASE 
        WHEN plan_type = 'yearly' THEN 'yearly'
        WHEN plan_type = 'monthly' THEN '30days'
        ELSE '30days'
      END
      WHERE plan_duration IS NULL
    `);
    console.log(`✅ Updated ${updateResult.rowCount} existing subscription records`);

    await client.query('COMMIT');
    
    // Show results
    const result = await client.query(`
      SELECT id, user_id, plan_type, plan_duration, status, start_date, end_date 
      FROM subscriptions 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    console.log('\n📊 Recent subscriptions with plan_duration:');
    console.table(result.rows);
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Run migration
addPlanDurationColumn().catch(console.error);
