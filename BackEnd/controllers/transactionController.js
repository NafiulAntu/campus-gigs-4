const sequelize = require('../config/sequelize');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const pool = require('../config/db');
const { emitNotification } = require('../utils/notificationHelpers');

// Send money to another user
exports.sendMoney = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const senderId = req.user.id;
    const { receiver_id, amount, transaction_type = 'transfer', notes = '' } = req.body;

    // Validation
    if (!receiver_id || !amount) {
      await t.rollback();
      return res.status(400).json({ error: 'Receiver ID and amount are required' });
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Check if sender and receiver are different
    if (senderId === parseInt(receiver_id)) {
      await t.rollback();
      return res.status(400).json({ error: 'Cannot send money to yourself' });
    }

    // Check if receiver exists
    const receiver = await User.findByPk(receiver_id);
    if (!receiver) {
      await t.rollback();
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Check sender balance
    const senderBalanceResult = await pool.query(
      'SELECT balance FROM users WHERE id = $1',
      [senderId]
    );
    const senderBalance = parseFloat(senderBalanceResult.rows[0]?.balance || 0);

    if (senderBalance < amountNum) {
      await t.rollback();
      return res.status(400).json({ 
        error: 'Insufficient balance', 
        currentBalance: senderBalance 
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      sender_id: senderId,
      receiver_id,
      amount: amountNum,
      transaction_type,
      status: 'completed',
      notes
    }, { transaction: t });

    // Update balances (trigger will handle this automatically, but we can do it manually too)
    await pool.query(
      'UPDATE users SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amountNum, senderId]
    );

    await pool.query(
      'UPDATE users SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amountNum, receiver_id]
    );

    await t.commit();

    // Get sender info for notification
    const sender = await User.findByPk(senderId);

    // Send notification to receiver after successful commit
    try {
      await emitNotification(receiver_id, {
        type: 'transaction',
        message: `${sender.full_name || sender.username} sent you ৳${amountNum}`,
        sender_id: senderId,
        transaction_id: transaction.id
      });
    } catch (notifErr) {
      console.error('Failed to send transaction notification:', notifErr);
      // Don't fail the transaction if notification fails
    }

    res.json({
      success: true,
      message: 'Money sent successfully',
      transaction: {
        id: transaction.id,
        sender_id: senderId,
        receiver_id,
        amount: amountNum,
        transaction_type,
        status: 'completed',
        notes,
        created_at: transaction.created_at
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('Send money error:', error);
    res.status(500).json({ error: 'Failed to send money' });
  }
};

// Get user's transaction history
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    // Get transactions with user details
    const query = `
      SELECT 
        t.*,
        sender.full_name as sender_name,
        sender.username as sender_username,
        sender.profile_picture as sender_picture,
        receiver.full_name as receiver_name,
        receiver.username as receiver_username,
        receiver.profile_picture as receiver_picture
      FROM user_transactions t
      LEFT JOIN users sender ON t.sender_id = sender.id
      LEFT JOIN users receiver ON t.receiver_id = receiver.id
      WHERE t.sender_id = $1 OR t.receiver_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [userId, limit]);

    res.json({
      success: true,
      transactions: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { transactionId } = req.params;

    const query = `
      SELECT 
        t.*,
        sender.full_name as sender_name,
        sender.username as sender_username,
        sender.profile_picture as sender_picture,
        receiver.full_name as receiver_name,
        receiver.username as receiver_username,
        receiver.profile_picture as receiver_picture
      FROM user_transactions t
      LEFT JOIN users sender ON t.sender_id = sender.id
      LEFT JOIN users receiver ON t.receiver_id = receiver.id
      WHERE t.id = $1 AND (t.sender_id = $2 OR t.receiver_id = $2)
    `;

    const result = await pool.query(query, [transactionId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      success: true,
      transaction: result.rows[0]
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};

// Get user balance
exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT balance FROM users WHERE id = $1',
      [userId]
    );

    const balance = parseFloat(result.rows[0]?.balance || 0);

    res.json({
      success: true,
      balance: balance
    });

  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
};

// Add balance (for testing/admin purposes)
exports.addBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    await pool.query(
      'UPDATE users SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [parseFloat(amount), userId]
    );

    const result = await pool.query(
      'SELECT balance FROM users WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Balance added successfully',
      balance: parseFloat(result.rows[0]?.balance || 0)
    });

  } catch (error) {
    console.error('Add balance error:', error);
    res.status(500).json({ error: 'Failed to add balance' });
  }
};

// Withdraw funds
exports.withdrawFunds = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const { amount, payment_method, account_number } = req.body;

    // Validation
    if (!amount || !payment_method || !account_number) {
      await t.rollback();
      return res.status(400).json({ 
        success: false,
        message: 'Amount, payment method, and account number are required' 
      });
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      await t.rollback();
      return res.status(400).json({ 
        success: false,
        message: 'Amount must be greater than 0' 
      });
    }

    if (amountNum < 500) {
      await t.rollback();
      return res.status(400).json({ 
        success: false,
        message: 'Minimum withdrawal amount is ৳500' 
      });
    }

    // Check user balance
    const balanceResult = await pool.query(
      'SELECT balance FROM users WHERE id = $1',
      [userId]
    );
    const currentBalance = parseFloat(balanceResult.rows[0]?.balance || 0);

    if (currentBalance < amountNum) {
      await t.rollback();
      return res.status(400).json({ 
        success: false,
        message: 'Insufficient balance',
        current_balance: currentBalance,
        required: amountNum
      });
    }

    // Calculate processing fee (2%)
    const processingFee = amountNum * 0.02;
    const netAmount = amountNum - processingFee;

    // Create withdrawal transaction
    const transactionResult = await pool.query(
      `INSERT INTO user_transactions 
       (sender_id, receiver_id, amount, transaction_type, payment_method, status, notes, created_at)
       VALUES ($1, NULL, $2, 'withdrawal', $3, 'pending', $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        userId,
        amountNum,
        payment_method,
        `Withdrawal to ${payment_method} - ${account_number} (Net: ৳${netAmount.toFixed(2)} after 2% fee)`
      ]
    );

    // Deduct amount from user balance
    await pool.query(
      'UPDATE users SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amountNum, userId]
    );

    // Get updated balance
    const updatedBalanceResult = await pool.query(
      'SELECT balance FROM users WHERE id = $1',
      [userId]
    );

    await t.commit();

    res.json({
      success: true,
      message: 'Withdrawal initiated successfully',
      transaction: {
        id: transactionResult.rows[0].id,
        amount: amountNum,
        processing_fee: processingFee,
        net_amount: netAmount,
        payment_method,
        status: 'pending',
        created_at: transactionResult.rows[0].created_at
      },
      balance: parseFloat(updatedBalanceResult.rows[0]?.balance || 0)
    });

  } catch (error) {
    await t.rollback();
    console.error('Withdrawal error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process withdrawal. Please try again.' 
    });
  }
};

module.exports = exports;
