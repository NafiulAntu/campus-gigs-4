// Quick check without loading the entire server
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'PG Antu',
  password: 'antu@1972',
  port: 5432,
});

(async () => {
  try {
    const result = await pool.query(
      `SELECT id, plan_type, plan_duration, status, 
              EXTRACT(DAY FROM (end_date - start_date)) as duration_days
       FROM subscriptions 
       WHERE user_id = 5 AND status = 'active'
       ORDER BY id DESC LIMIT 1`
    );
    
    if (result.rows.length > 0) {
      const sub = result.rows[0];
      console.log('\nActive Subscription:');
      console.log('ID:', sub.id);
      console.log('plan_type:', sub.plan_type);
      console.log('plan_duration:', sub.plan_duration);
      console.log('status:', sub.status);
      console.log('duration_days:', sub.duration_days);
    } else {
      console.log('No active subscription found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
})();
