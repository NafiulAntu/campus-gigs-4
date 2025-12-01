require('dotenv').config();
const pool = require('./config/db');

async function addTestBalance() {
  console.log('\n💰 Adding Test Balance to All Users...\n');

  try {
    // Get all users
    const usersResult = await pool.query('SELECT id, firebase_uid, full_name, username FROM users');
    const users = usersResult.rows;

    console.log(`Found ${users.length} users\n`);

    // Add 1000 Taka to each user
    const testAmount = 1000.00;

    for (const user of users) {
      await pool.query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2',
        [testAmount, user.id]
      );
      const displayName = user.full_name || user.username || user.firebase_uid;
      console.log(`✅ Added ৳${testAmount} to User ${user.id} (${displayName})`);
    }

    console.log('\n✅ Test balance added successfully!\n');

    // Show updated balances
    const balanceResult = await pool.query('SELECT id, full_name, username, balance FROM users ORDER BY id');
    console.log('Current Balances:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    balanceResult.rows.forEach(user => {
      const displayName = user.full_name || user.username || 'Unknown';
      console.log(`User ${user.id}: ${displayName} - ৳${user.balance}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addTestBalance();
