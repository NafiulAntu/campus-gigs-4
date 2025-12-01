require('dotenv').config();
const pool = require('./config/db');

async function checkSetup() {
  console.log('\n🔍 Checking System Setup...\n');
  
  try {
    // Check database connection
    console.log('1. Database Connection...');
    await pool.query('SELECT NOW()');
    console.log('   ✅ Database connected\n');

    // Check user_transactions table
    console.log('2. User Transactions Table...');
    const transResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_transactions'
    `);
    if (transResult.rows.length > 0) {
      console.log('   ✅ user_transactions table exists');
      console.log('   Columns:', transResult.rows.map(r => r.column_name).join(', '));
    } else {
      console.log('   ❌ user_transactions table MISSING');
      console.log('   Run: node runTransactionMigration.js');
    }
    console.log('');

    // Check users.balance column
    console.log('3. User Balance Column...');
    const balanceResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'balance'
    `);
    if (balanceResult.rows.length > 0) {
      console.log('   ✅ users.balance column exists');
    } else {
      console.log('   ❌ users.balance column MISSING');
      console.log('   Run: node runTransactionMigration.js');
    }
    console.log('');

    // Check subscriptions table
    console.log('4. Subscriptions Table...');
    const subResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'subscriptions'
    `);
    if (subResult.rows.length > 0) {
      console.log('   ✅ subscriptions table exists');
    } else {
      console.log('   ❌ subscriptions table MISSING');
      console.log('   Run: node runPremiumMigration.js');
    }
    console.log('');

    // Check payment_transactions table
    console.log('5. Payment Transactions Table...');
    const payResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payment_transactions'
    `);
    if (payResult.rows.length > 0) {
      console.log('   ✅ payment_transactions table exists');
    } else {
      console.log('   ❌ payment_transactions table MISSING');
      console.log('   Run: node runPremiumMigration.js');
    }
    console.log('');

    // Check SSLCommerz configuration
    console.log('6. SSLCommerz Configuration...');
    if (process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_ID !== 'your_store_id_here') {
      console.log('   ✅ Store ID configured');
    } else {
      console.log('   ❌ Store ID NOT configured');
      console.log('   Update SSLCOMMERZ_STORE_ID in .env');
    }
    
    if (process.env.SSLCOMMERZ_STORE_PASSWORD && process.env.SSLCOMMERZ_STORE_PASSWORD !== 'your_store_password_here') {
      console.log('   ✅ Store Password configured');
    } else {
      console.log('   ❌ Store Password NOT configured');
      console.log('   Update SSLCOMMERZ_STORE_PASSWORD in .env');
    }
    console.log('');

    // Check user count
    console.log('7. User Data...');
    const userResult = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`   ✅ ${userResult.rows[0].count} users in database`);
    
    if (parseInt(userResult.rows[0].count) > 0) {
      const balanceCheck = await pool.query('SELECT id, balance FROM users WHERE balance > 0 LIMIT 3');
      if (balanceCheck.rows.length > 0) {
        console.log('   ✅ Some users have balance');
        balanceCheck.rows.forEach(u => console.log(`      User ${u.id}: ৳${u.balance}`));
      } else {
        console.log('   ⚠️  No users have balance (add test balance)');
      }
    }
    console.log('');

    console.log('📊 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const issues = [];
    if (transResult.rows.length === 0) issues.push('Missing user_transactions table');
    if (balanceResult.rows.length === 0) issues.push('Missing balance column');
    if (subResult.rows.length === 0) issues.push('Missing subscriptions table');
    if (payResult.rows.length === 0) issues.push('Missing payment_transactions table');
    if (!process.env.SSLCOMMERZ_STORE_ID || process.env.SSLCOMMERZ_STORE_ID === 'your_store_id_here') {
      issues.push('SSLCommerz not configured');
    }

    if (issues.length === 0) {
      console.log('✅ All systems ready!');
      console.log('\nNext steps:');
      console.log('1. Start server: npm start');
      console.log('2. Add test balance: POST /api/transactions/balance/add');
      console.log('3. Test features in frontend');
    } else {
      console.log('❌ Issues found:');
      issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
      console.log('\nRun the migrations to fix:');
      if (transResult.rows.length === 0 || balanceResult.rows.length === 0) {
        console.log('   node runTransactionMigration.js');
      }
      if (subResult.rows.length === 0 || payResult.rows.length === 0) {
        console.log('   node runPremiumMigration.js');
      }
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSetup();
