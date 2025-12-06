const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'PG Antu',
  password: 'antu@1972',
  port: 5432,
});

async function checkLatestSubscription() {
  try {
    const result = await pool.query(
      `SELECT id, user_id, plan_type, plan_duration, status, 
              TO_CHAR(start_date, 'YYYY-MM-DD HH24:MI:SS') as start_date,
              TO_CHAR(end_date, 'YYYY-MM-DD HH24:MI:SS') as end_date
       FROM subscriptions 
       WHERE user_id = 5 
       ORDER BY id DESC 
       LIMIT 1`
    );
    
    if (result.rows.length > 0) {
      console.log('\n=== Latest Subscription ===');
      console.log('ID:', result.rows[0].id);
      console.log('User ID:', result.rows[0].user_id);
      console.log('Plan Type:', result.rows[0].plan_type);
      console.log('Plan Duration:', result.rows[0].plan_duration);
      console.log('Status:', result.rows[0].status);
      console.log('Start Date:', result.rows[0].start_date);
      console.log('End Date:', result.rows[0].end_date);
      console.log('===========================\n');
    } else {
      console.log('No subscription found');
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkLatestSubscription();
