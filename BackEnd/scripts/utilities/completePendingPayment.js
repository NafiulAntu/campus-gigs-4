const { Pool } = require('pg');
const sequelize = require('../../config/sequelize');
const Subscription = require('../../models/Subscription');
const PaymentTransaction = require('../../models/PaymentTransaction');
const User = require('../../models/User');
require('dotenv').config();

const PLAN_DAYS = {
  '30days': 30,
  'monthly': 30,
  'yearly': 365
};

async function completePendingPayment(transactionId) {
  try {
    console.log(`\n🔄 Processing transaction: ${transactionId}\n`);

    // Find the pending transaction
    const transaction = await PaymentTransaction.findOne({
      where: { transaction_id: transactionId }
    });

    if (!transaction) {
      console.log('❌ Transaction not found');
      return;
    }

    if (transaction.status !== 'pending') {
      console.log(`⚠️  Transaction is already ${transaction.status}`);
      return;
    }

    console.log('Transaction details:');
    console.log('  User ID:', transaction.user_id);
    console.log('  Amount:', transaction.amount);
    console.log('  Status:', transaction.status);

    // Determine plan type from amount
    let planType = 'monthly';
    if (transaction.amount >= 1500) {
      planType = 'yearly';
    } else if (transaction.amount >= 150) {
      planType = '30days';
    }

    console.log('  Plan Type:', planType);

    // Start transaction
    await sequelize.transaction(async (t) => {
      // Cancel any existing active/completed subscriptions
      await Subscription.update(
        { status: 'cancelled' },
        {
          where: {
            user_id: transaction.user_id,
            status: { [sequelize.Sequelize.Op.in]: ['active', 'completed'] }
          },
          transaction: t
        }
      );

      // Update transaction to completed
      await PaymentTransaction.update(
        {
          status: 'success',
          payment_method: 'manual_completion'
        },
        { where: { id: transaction.id }, transaction: t }
      );

      // Create subscription
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + PLAN_DAYS[planType]);

      const subscription = await Subscription.create(
        {
          user_id: transaction.user_id,
          plan_type: planType,
          start_date: startDate,
          end_date: endDate,
          status: 'completed',
          auto_renew: true
        },
        { transaction: t }
      );

      // Update user premium status
      await User.updatePremiumStatus(transaction.user_id, true, endDate);

      console.log('\n✅ Successfully completed payment!');
      console.log('📋 Subscription Details:');
      console.log('  Subscription ID:', subscription.id);
      console.log('  Plan Type:', subscription.plan_type);
      console.log('  Status:', subscription.status);
      console.log('  Start Date:', subscription.start_date);
      console.log('  End Date:', subscription.end_date);
      console.log('  Days:', PLAN_DAYS[planType]);
    });

    console.log('\n✅ Payment completed successfully!\n');
  } catch (error) {
    console.error('❌ Error completing payment:', error);
  }
}

// Get transaction ID from command line or use latest pending
async function main() {
  try {
    let transactionId = process.argv[2];

    if (!transactionId) {
      // Get the latest pending transaction
      const result = await PaymentTransaction.findOne({
        where: { status: 'pending' },
        order: [['created_at', 'DESC']]
      });

      if (!result) {
        console.log('❌ No pending transactions found');
        process.exit(1);
      }

      transactionId = result.transaction_id;
      console.log('Using latest pending transaction:', transactionId);
    }

    await completePendingPayment(transactionId);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = completePendingPayment;
