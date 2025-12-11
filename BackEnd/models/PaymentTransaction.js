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
    allowNull: true,
    references: {
      model: 'subscriptions',
      key: 'id'
    }
  },
  transaction_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  transaction_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  payment_gateway: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  gateway_transaction_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'BDT'
  },
  payment_method: {
    type: DataTypes.STRING(50)
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending'
  },
  gateway_response: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('gateway_response');
      return rawValue ? (typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue) : null;
    },
    set(value) {
      this.setDataValue('gateway_response', value ? (typeof value === 'string' ? value : JSON.stringify(value)) : null);
    }
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
