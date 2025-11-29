const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  transaction_type: {
    type: DataTypes.ENUM('transfer', 'payment', 'tip', 'refund'),
    defaultValue: 'transfer'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'completed'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'user_transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

// Static methods
Transaction.getUserTransactions = async function(userId, limit = 50) {
  return await this.findAll({
    where: {
      [sequelize.Sequelize.Op.or]: [
        { sender_id: userId },
        { receiver_id: userId }
      ]
    },
    order: [['created_at', 'DESC']],
    limit,
    raw: true
  });
};

Transaction.getTransactionById = async function(transactionId) {
  return await this.findOne({
    where: { id: transactionId },
    raw: true
  });
};

Transaction.getUserBalance = async function(userId) {
  const pool = require('../config/db');
  const result = await pool.query(
    'SELECT balance FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0]?.balance || 0;
};

module.exports = Transaction;
