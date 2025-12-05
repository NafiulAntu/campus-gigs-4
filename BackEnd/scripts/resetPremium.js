/**
 * Easy Reset Script - Delete Premium Subscription
 * Just run this script to reset and test payments again!
 */

const pool = require('../config/db');

async function resetPremium() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Resetting premium status (keeping payment history)...\n');
    
    // Cancel active subscriptions (don't delete)
    const subs = await client.query(`
      UPDATE subscriptions 
      SET status = 'cancelled', end_date = NOW() 
      WHERE status = 'active'
      RETURNING id, user_id
    `);
    console.log(`✅ Cancelled ${subs.rowCount} active subscriptions`);
    
    // Reset all users premium status
    const users = await client.query(`
      UPDATE users 
      SET is_premium = FALSE, premium_expires_at = NULL 
      WHERE is_premium = TRUE
      RETURNING id, full_name
    `);
    console.log(`✅ Reset ${users.rowCount} users to non-premium`);
    
    console.log('\n🎉 Done! Payment history preserved, you can purchase premium again!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

resetPremium()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
