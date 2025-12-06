const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const PaymentTransaction = sequelize.define('PaymentTransaction', {
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
  subscription_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'subscriptions',
      key: 'id'
    }
  },
  transaction_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'BDT'
  },
  payment_method: {
    type: DataTypes.STRING(50)
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed', 'cancelled', 'refunded', 'completed'),
    defaultValue: 'pending'
  },
  gateway_response: {
    type: DataTypes.JSONB
  },
  plan_type: {
    type: DataTypes.STRING(50)
  },
  payment_intent_id: {
    type: DataTypes.STRING(255)
  },
  ssl_val_id: {
    type: DataTypes.STRING(255)
  },
  ssl_card_type: {
    type: DataTypes.STRING(100)
  },
  ssl_card_brand: {
    type: DataTypes.STRING(100)
  },
  ssl_bank_tran_id: {
    type: DataTypes.STRING(255)
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
  tableName: 'payment_transactions',
  timestamps: false,
  underscored: true
});

// Class methods
PaymentTransaction.findByTransactionId = async function(transactionId) {
  return await this.findOne({
    where: { transaction_id: transactionId }
  });
};

PaymentTransaction.getUserTransactions = async function(userId, limit = 20) {
  return await this.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    limit
  });
};

PaymentTransaction.updateStatus = async function(transactionId, status, gatewayResponse = null, transaction = null) {
  const options = transaction ? { transaction } : {};
  const updateData = { status };
  
  if (gatewayResponse) {
    updateData.gateway_response = gatewayResponse;
  }
  
  return await this.update(
    updateData,
    { where: { transaction_id: transactionId }, ...options }
  );
};

module.exports = PaymentTransaction;
