const pool = require('../../config/db');

async function createTestSubscription() {
  let client;
  try {
    console.log('🔄 Creating test subscription for user 1...\n');
    
    client = await pool.connect();
    
    // Create subscription
    const subResult = await client.query(`
      INSERT INTO subscriptions (user_id, plan_type, status, start_date, end_date, auto_renew, created_at, updated_at)
      VALUES (1, 'monthly', 'completed', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', false, NOW(), NOW())
      RETURNING id, plan_type, status, start_date, end_date
    `);
    
    const subscription = subResult.rows[0];
    console.log('✅ Created subscription:');
    console.log('   ID:', subscription.id);
    console.log('   Plan:', subscription.plan_type);
    console.log('   Status:', subscription.status);
    console.log('   Start:', subscription.start_date);
    console.log('   End:', subscription.end_date);
    
    // Create payment transaction
    const txnResult = await client.query(`
      INSERT INTO payment_transactions (user_id, subscription_id, transaction_id, amount, currency, payment_method, status, created_at, updated_at)
      VALUES (1, $1::integer, 'test_txn_' || $1::text, 150.00, 'BDT', 'mock', 'success', NOW(), NOW())
      RETURNING id, transaction_id, amount, status
    `, [subscription.id]);
    
    const transaction = txnResult.rows[0];
    console.log('\n✅ Created payment transaction:');
    console.log('   ID:', transaction.id);
    console.log('   Transaction ID:', transaction.transaction_id);
    console.log('   Amount: ৳', transaction.amount);
    console.log('   Status:', transaction.status);
    
    // Verify it appears in recent activity
    const activityResult = await client.query(`
      SELECT 
        pt.id,
        pt.transaction_id,
        pt.amount,
        pt.status,
        pt.payment_method,
        s.plan_type,
        pt.created_at
      FROM payment_transactions pt
      LEFT JOIN subscriptions s ON pt.subscription_id = s.id
      WHERE pt.user_id = 1 AND pt.subscription_id IS NOT NULL
      ORDER BY pt.created_at DESC 
      LIMIT 5
    `);
    
    console.log('\n📊 All subscription payments for user 1:');
    activityResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.plan_type} - ৳${row.amount} - ${row.status} - ${row.created_at.toLocaleString()}`);
    });
    
    console.log('\n✅ Test subscription created successfully!');
    console.log('💡 Now refresh your browser and check Payments → Overview → Recent Activity');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

createTestSubscription();
