require('dotenv').config();
const { sequelize } = require('../config/sequelize');
const { expireSubscriptions } = require('../controllers/subscriptionController');

// Script to expire subscriptions - run this via cron job

(async () => {
  try {
    console.log('Starting subscription expiration check...');
    await expireSubscriptions();
    console.log('✅ Subscription expiration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error expiring subscriptions:', error);
    process.exit(1);
  }
})();
