const sequelize = require('../config/sequelize');
const { Op } = require('sequelize');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

// Get current subscription status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    if (!subscription) {
      return res.json({
        is_premium: false,
        subscription: null
      });
    }

    const isPremium = (subscription.status === 'active' || subscription.status === 'completed') && new Date(subscription.end_date) > new Date();

    // Map plan_duration to display names and prices
    const planInfo = {
      '15days': { name: '15 Days Premium', amount: 99 },
      '30days': { name: '30 Days Premium', amount: 150 },
      'yearly': { name: 'Premium Yearly', amount: 1500 }
    };

    // Use plan_duration if available, fallback to plan_type
    const planDuration = subscription.plan_duration || (subscription.plan_type === 'yearly' ? 'yearly' : '30days');
    const currentPlan = planInfo[planDuration] || planInfo['30days'];

    res.json({
      is_premium: isPremium,
      subscription: {
        id: subscription.id,
        plan_type: subscription.plan_type,
        plan_duration: planDuration,
        plan_name: currentPlan.name,
        amount: currentPlan.amount,
        status: subscription.status,
        start_date: subscription.start_date,
        end_date: subscription.end_date,
        expiry_date: subscription.end_date,
        auto_renew: subscription.auto_renew,
        days_remaining: Math.ceil((new Date(subscription.end_date) - new Date()) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
};

// Cancel subscription immediately
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🚀 Cancel subscription request from user:', userId);

    const subscription = await Subscription.findOne({
      where: { 
        user_id: userId, 
        status: { [Op.in]: ['active', 'completed'] }
      }
    });

    console.log('📊 Found subscription:', subscription ? `ID ${subscription.id}` : 'None');

    if (!subscription) {
      console.log('❌ No active subscription found');
      return res.status(404).json({ error: 'No active subscription found' });
    }

    await sequelize.transaction(async (t) => {
      // Cancel subscription immediately
      await Subscription.update(
        { status: 'cancelled', auto_renew: false },
        { where: { id: subscription.id }, transaction: t }
      );

      console.log('✅ Subscription status updated to cancelled');

      // Send notification after commit
      t.afterCommit(async () => {
        try {
          const { createNotification } = require('../utils/simpleNotificationHelpers');
          await createNotification({
            userId,
            type: 'system',
            content: 'Your premium subscription has been cancelled. You can purchase a new subscription anytime.',
            metadata: { subscription_id: subscription.id }
          });
        } catch (notifError) {
          console.error('Notification error:', notifError);
        }
      });
    });

    // Remove user premium status AFTER transaction completes
    try {
      await User.updatePremiumStatus(userId, false, null);
      console.log('✅ User premium status updated');
    } catch (userUpdateError) {
      console.error('❌ User premium status update error:', userUpdateError);
      // Continue anyway, subscription is already cancelled
    }

    console.log('✅ Subscription cancelled successfully');
    res.json({
      success: true,
      message: 'Subscription cancelled successfully. You can purchase a new subscription anytime.'
    });
  } catch (error) {
    console.error('❌ Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription', details: error.message });
  }
};

// Turn off auto-renew (keep subscription until end date)
exports.turnOffAutoRenew = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      where: { 
        user_id: userId, 
        status: { [Op.in]: ['active', 'completed'] }
      }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    await sequelize.transaction(async (t) => {
      // Turn off auto-renew
      await Subscription.update(
        { auto_renew: false },
        { where: { id: subscription.id }, transaction: t }
      );

      // Send notification after commit
      t.afterCommit(async () => {
        try {
          const { createNotification } = require('../utils/simpleNotificationHelpers');
          await createNotification({
            userId,
            type: 'system',
            content: 'Your subscription auto-renewal has been turned off. You can still use premium features until the end date.',
            metadata: { subscription_id: subscription.id }
          });
        } catch (notifError) {
          console.error('Notification error:', notifError);
        }
      });
    });

    res.json({
      success: true,
      message: 'Auto-renewal turned off. Premium access will continue until end date.',
      end_date: subscription.end_date
    });
  } catch (error) {
    console.error('Turn off auto-renew error:', error);
    res.status(500).json({ error: 'Failed to turn off auto-renew' });
  }
};

// Reactivate subscription (turn on auto-renew)
exports.reactivateSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      where: { 
        user_id: userId, 
        status: { [Op.in]: ['active', 'completed'] }
      }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    await Subscription.update(
      { auto_renew: true },
      { where: { id: subscription.id } }
    );

    res.json({
      success: true,
      message: 'Auto-renewal reactivated'
    });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({ error: 'Failed to reactivate subscription' });
  }
};

// Check if user has premium (quick check for middleware)
exports.checkPremium = async (req, res) => {
  try {
    const userId = req.user.id;
    const isPremium = await Subscription.isUserPremium(userId);
    res.json({ is_premium: isPremium });
  } catch (error) {
    console.error('Check premium error:', error);
    res.status(500).json({ error: 'Failed to check premium status' });
  }
};

// Admin: Get all premium users (add admin auth middleware in routes)
exports.getAllPremiumUsers = async (req, res) => {
  try {
    const premiumUsers = await sequelize.query(`
      SELECT * FROM active_premium_users
      ORDER BY end_date DESC
    `, { type: sequelize.QueryTypes.SELECT });

    res.json(premiumUsers);
  } catch (error) {
    console.error('Get premium users error:', error);
    res.status(500).json({ error: 'Failed to fetch premium users' });
  }
};

// Cron job function to expire subscriptions (call this from a scheduled task)
exports.expireSubscriptions = async () => {
  try {
    await sequelize.transaction(async (t) => {
      // Find expired subscriptions that are still active
      const expiredSubs = await Subscription.findAll({
        where: {
          status: 'active',
          end_date: { [Op.lt]: new Date() }
        },
        transaction: t
      });

      // Update subscriptions to expired
      await Subscription.update(
        { status: 'expired' },
        {
          where: {
            status: 'active',
            end_date: { [Op.lt]: new Date() }
          },
          transaction: t
        }
      );

      // Update users' premium status
      const userIds = expiredSubs.map(sub => sub.user_id);
      if (userIds.length > 0) {
        // Update each user's premium status
        for (const userId of userIds) {
          await User.updatePremiumStatus(userId, false, null);
        }
      }

      // Send notifications after commit
      t.afterCommit(async () => {
        const { createNotification } = require('../utils/simpleNotificationHelpers');
        for (const sub of expiredSubs) {
          try {
            await createNotification({
              userId: sub.user_id,
              type: 'system',
              content: 'Your Campus Gigs Premium subscription has expired. Renew now to continue enjoying premium features!',
              metadata: { subscription_id: sub.id }
            });
          } catch (notifError) {
            console.error('Notification error:', notifError);
          }
        }
      });
    });

    console.log('Subscription expiration check completed');
  } catch (error) {
    console.error('Expire subscriptions error:', error);
  }
};
