const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { Op } = require('sequelize');

/**
 * DUMMY Mobile Wallet Controller
 * Simulates bKash, Nagad, Rocket transactions for testing
 * No real payment gateway integration required
 */

// Simulate payment initialization
exports.initiateDummyPayment = async (req, res) => {
  try {
    const { receiver_id, amount, payment_method } = req.body;
    const sender_id = req.user.id;

    // Validate payment method
    const validMethods = ['bkash', 'nagad', 'rocket'];
    if (!validMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Use: bkash, nagad, or rocket'
      });
    }

    // Validate amount
    if (!amount || amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum amount is 10 TK'
      });
    }

    // Check if users exist
    const [sender, receiver] = await Promise.all([
      User.findByPk(sender_id),
      User.findByPk(receiver_id)
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: 'Sender or receiver not found'
      });
    }

    // Check sender balance
    if (sender.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Generate dummy transaction reference
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const payment_reference = `${payment_method.toUpperCase()}${timestamp}${random}`;

    // Create pending transaction
    const transaction = await Transaction.create({
      sender_id,
      receiver_id,
      amount,
      transaction_type: 'send_money',
      status: 'pending',
      payment_method,
      payment_reference,
      description: `Send money via ${payment_method.toUpperCase()} (Dummy Mode)`
    });

    // Simulate payment URL (dummy page)
    const payment_url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dummy-payment?` +
      `transaction_id=${transaction.id}&` +
      `method=${payment_method}&` +
      `amount=${amount}&` +
      `reference=${payment_reference}`;

    res.json({
      success: true,
      message: 'Dummy payment initialized',
      data: {
        transaction_id: transaction.id,
        payment_url,
        payment_reference,
        payment_method,
        amount,
        status: 'pending',
        isDummyMode: true
      }
    });

  } catch (error) {
    console.error('Dummy payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate dummy payment',
      error: error.message
    });
  }
};

// Simulate payment completion (auto-success for testing)
exports.completeDummyPayment = async (req, res) => {
  try {
    const { transaction_id, action } = req.body; // action: 'success' or 'failed'

    const transaction = await Transaction.findByPk(transaction_id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Transaction already ${transaction.status}`
      });
    }

    // Simulate success or failure based on action
    if (action === 'success') {
      // Get sender and receiver
      const [sender, receiver] = await Promise.all([
        User.findByPk(transaction.sender_id),
        User.findByPk(transaction.receiver_id)
      ]);

      // Check balance again
      if (sender.balance < transaction.amount) {
        transaction.status = 'failed';
        transaction.failure_reason = 'Insufficient balance';
        await transaction.save();

        return res.status(400).json({
          success: false,
          message: 'Payment failed: Insufficient balance'
        });
      }

      // Process payment
      sender.balance -= transaction.amount;
      receiver.balance += transaction.amount;

      await Promise.all([
        sender.save(),
        receiver.save()
      ]);

      // Update transaction
      transaction.status = 'completed';
      transaction.completed_at = new Date();
      await transaction.save();

      res.json({
        success: true,
        message: 'Dummy payment completed successfully',
        data: {
          transaction_id: transaction.id,
          payment_reference: transaction.payment_reference,
          amount: transaction.amount,
          payment_method: transaction.payment_method,
          status: 'completed',
          sender_new_balance: sender.balance,
          receiver_new_balance: receiver.balance,
          isDummyMode: true
        }
      });

    } else {
      // Simulate failure
      transaction.status = 'failed';
      transaction.failure_reason = 'User cancelled or payment declined (Dummy)';
      await transaction.save();

      res.json({
        success: false,
        message: 'Dummy payment failed',
        data: {
          transaction_id: transaction.id,
          status: 'failed',
          reason: transaction.failure_reason,
          isDummyMode: true
        }
      });
    }

  } catch (error) {
    console.error('Dummy payment completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete dummy payment',
      error: error.message
    });
  }
};

// Get transaction status
exports.getDummyPaymentStatus = async (req, res) => {
  try {
    const { transaction_id } = req.params;

    const transaction = await Transaction.findByPk(transaction_id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'fullname'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'fullname'] }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: {
        transaction_id: transaction.id,
        payment_reference: transaction.payment_reference,
        payment_method: transaction.payment_method,
        amount: transaction.amount,
        status: transaction.status,
        sender: transaction.sender,
        receiver: transaction.receiver,
        created_at: transaction.created_at,
        completed_at: transaction.completed_at,
        failure_reason: transaction.failure_reason,
        isDummyMode: true
      }
    });

  } catch (error) {
    console.error('Get dummy payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
};

// List all dummy transactions for user
exports.getDummyTransactionHistory = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const transactions = await Transaction.findAndCountAll({
      where: {
        [Op.or]: [
          { sender_id: user_id },
          { receiver_id: user_id }
        ],
        payment_method: ['bkash', 'nagad', 'rocket']
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'fullname'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'fullname'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        transactions: transactions.rows,
        total: transactions.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        isDummyMode: true
      }
    });

  } catch (error) {
    console.error('Get dummy transaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction history',
      error: error.message
    });
  }
};
