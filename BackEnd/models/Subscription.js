const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  plan_type: {
    type: DataTypes.ENUM('monthly', 'yearly'),
    allowNull: false
  },
  plan_duration: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Original plan duration: 15days, 30days, or yearly'
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_date'
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_date'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'BDT'
  },
  payment_transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'subscriptions',
  timestamps: false,
  underscored: false,
  freezeTableName: true
});

// Class methods
Subscription.isUserPremium = async function(userId) {
  const subscription = await this.findOne({
    where: {
      user_id: userId,
      status: 'active'
    }
  });

  if (!subscription) return false;
  
  const now = new Date();
  return new Date(subscription.end_date) > now;
};

Subscription.getUserSubscription = async function(userId) {
  return await this.findOne({
    where: { user_id: userId },
    order: [['created_at', 'DESC']]
  });
};

Subscription.expireSubscription = async function(subscriptionId, transaction = null) {
  const options = transaction ? { transaction } : {};
  
  return await this.update(
    { status: 'expired' },
    { where: { id: subscriptionId }, ...options }
  );
};

module.exports = Subscription;
