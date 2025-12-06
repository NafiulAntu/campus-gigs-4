const pool = require('../config/db');

(async () => {
  const client = await pool.connect();
  try {
    console.log('🔍 Checking subscriptions...\n');
    
    // Check subscription
    const result = await client.query(`
      SELECT id, user_id, plan_type, plan_duration, status,
             EXTRACT(DAY FROM (end_date - start_date)) as duration_days,
             start_date, end_date
      FROM subscriptions 
      WHERE user_id = 5 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.table(result.rows);
    
    // Find active one
    const active = result.rows.find(r => r.status === 'active');
    if (!active) {
      console.log('❌ No active subscription found');
      return;
    }
    
    console.log('\n📊 Active Subscription:');
    console.log('   ID:', active.id);
    console.log('   plan_type:', active.plan_type);
    console.log('   plan_duration:', active.plan_duration);
    console.log('   duration_days:', active.duration_days);
    
    // Fix if needed
    const days = parseInt(active.duration_days);
    let newDuration = '30days';
    
    if (days >= 14 && days <= 16) {
      newDuration = '15days';
    } else if (days >= 28 && days <= 32) {
      newDuration = '30days';
    } else if (days > 300) {
      newDuration = 'yearly';
    }
    
    if (!active.plan_duration || active.plan_duration !== newDuration) {
      await client.query(
        'UPDATE subscriptions SET plan_duration = $1 WHERE id = $2',
        [newDuration, active.id]
      );
      console.log('\n✅ FIXED: Updated plan_duration from', active.plan_duration, 'to', newDuration);
      
      // Verify
      const verify = await client.query(
        'SELECT id, plan_type, plan_duration FROM subscriptions WHERE id = $1',
        [active.id]
      );
      console.log('\n✅ Verified:');
      console.table(verify.rows);
    } else {
      console.log('\n✅ plan_duration is already correct:', newDuration);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
})();
