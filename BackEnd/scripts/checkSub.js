const pool = require('../config/db');

(async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT id, user_id, plan_type, plan_duration, status
      FROM subscriptions 
      WHERE user_id = 5 AND status = 'active'
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (result.rows.length > 0) {
      const sub = result.rows[0];
      console.log('Current Active Subscription:');
      console.log('ID:', sub.id);
      console.log('plan_type:', sub.plan_type);
      console.log('plan_duration:', sub.plan_duration || 'NULL');
      console.log('status:', sub.status);
    } else {
      console.log('No active subscription');
    }
  } finally {
    client.release();
    pool.end();
  }
})();
