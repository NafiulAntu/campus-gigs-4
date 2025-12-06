// Fix subscription 13 plan_duration
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
    // Update subscription 13 to have plan_duration = '15days'
    const result = await pool.query(
      `UPDATE subscriptions 
       SET plan_duration = '15days'
       WHERE id = 13 AND plan_duration IS NULL`
    );
    
    console.log('FIXED_SUB_13_UPDATED_ROWS:' + result.rowCount);
    
    // Verify the update
    const verify = await pool.query(
      `SELECT id, plan_type, plan_duration, status 
       FROM subscriptions WHERE id = 13`
    );
    
    console.log('FIXED_SUB_13_PLAN_DURATION:' + verify.rows[0].plan_duration);
    process.exit(0);
  } catch (error) {
    console.error('FIXED_SUB_13_ERROR:' + error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
