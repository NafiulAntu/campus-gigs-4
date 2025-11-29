const Subscription = require('../models/Subscription');
const User = require('../models/User');

// Middleware to check if user has active premium subscription
exports.requirePremium = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Quick check from user table (denormalized flag)
    const user = await User.findByPk(userId, {
      attributes: ['is_premium', 'premium_expires_at']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user is marked premium and not expired
    if (user.is_premium && user.premium_expires_at && new Date(user.premium_expires_at) > new Date()) {
      return next();
    }

    // Double-check with subscription table (in case denormalized data is stale)
    const isPremium = await Subscription.isUserPremium(userId);
    
    if (isPremium) {
      // Update denormalized flag if it was stale
      const subscription = await Subscription.findOne({
        where: { user_id: userId, status: 'active' }
      });
      
      if (subscription) {
        await User.update(
          { is_premium: true, premium_expires_at: subscription.end_date },
          { where: { id: userId } }
        );
      }
      
      return next();
    }

    // User is not premium
    return res.status(403).json({
      error: 'Premium subscription required',
      message: 'This feature is only available for premium users. Upgrade now!',
      upgrade_url: '/premium'
    });

  } catch (error) {
    console.error('Premium middleware error:', error);
    res.status(500).json({ error: 'Failed to verify premium status' });
  }
};

// Middleware to add premium status to request (doesn't block)
exports.checkPremium = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      req.isPremium = false;
      return next();
    }

    const user = await User.findByPk(userId, {
      attributes: ['is_premium', 'premium_expires_at']
    });

    req.isPremium = user && user.is_premium && 
                     user.premium_expires_at && 
                     new Date(user.premium_expires_at) > new Date();

    next();
  } catch (error) {
    console.error('Check premium middleware error:', error);
    req.isPremium = false;
    next();
  }
};
