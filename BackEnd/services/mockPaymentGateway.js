/**
 * Mock Payment Gateway for Demo/Testing
 * Simulates payment processing without real transactions
 * 100% FREE - No external service needed
 */

class MockPaymentGateway {
  constructor() {
    this.mode = 'test';
    this.transactions = new Map();
  }

  /**
   * Initialize payment
   */
  async initiatePayment(data) {
    const {
      amount,
      currency = 'BDT',
      customer_name,
      customer_email,
      product_name,
      transaction_id,
      success_url,
      fail_url,
      cancel_url
    } = data;

    // Validate
    if (!amount || !transaction_id) {
      throw new Error('Amount and transaction_id are required');
    }

    // Store transaction
    this.transactions.set(transaction_id, {
      transaction_id,
      amount,
      currency,
      customer_name,
      customer_email,
      product_name,
      status: 'PENDING',
      created_at: new Date(),
      success_url,
      fail_url,
      cancel_url
    });

    // Generate mock payment page URL
    const paymentUrl = `${process.env.FRONTEND_URL}/mock-payment?tran_id=${transaction_id}&amount=${amount}&currency=${currency}`;

    return {
      status: 'SUCCESS',
      GatewayPageURL: paymentUrl,
      transaction_id,
      message: 'Payment initiated successfully'
    };
  }

  /**
   * Process payment (simulate card/mobile banking)
   */
  async processPayment(transaction_id, paymentMethod = 'card', cardNumber = null) {
    const transaction = this.transactions.get(transaction_id);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate success/failure based on test card numbers
    let status = 'SUCCESS';
    let message = 'Payment successful';

    // Test card logic
    if (paymentMethod === 'card' && cardNumber) {
      if (cardNumber === '4111111111111111') {
        status = 'SUCCESS';
      } else if (cardNumber === '4000000000000002') {
        status = 'FAILED';
        message = 'Card declined';
      } else if (cardNumber === '4000000000000069') {
        status = 'FAILED';
        message = 'Expired card';
      } else {
        status = 'SUCCESS'; // Any other card succeeds
      }
    }

    // Test mobile banking
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') {
      status = 'SUCCESS'; // Mobile payments always succeed in test
    }

    // Update transaction
    transaction.status = status;
    transaction.payment_method = paymentMethod;
    transaction.completed_at = new Date();
    transaction.card_last4 = cardNumber ? cardNumber.slice(-4) : null;

    this.transactions.set(transaction_id, transaction);

    return {
      status,
      transaction_id,
      amount: transaction.amount,
      currency: transaction.currency,
      message,
      validation_id: `VAL-${Date.now()}`, // Mock validation ID
      card_type: paymentMethod === 'card' ? 'VISA' : paymentMethod.toUpperCase(),
      card_last4: transaction.card_last4
    };
  }

  /**
   * Validate transaction
   */
  async validateTransaction(transaction_id, validation_id) {
    const transaction = this.transactions.get(transaction_id);
    
    if (!transaction) {
      return { status: 'INVALID', message: 'Transaction not found' };
    }

    if (transaction.status === 'SUCCESS') {
      return {
        status: 'VALID',
        transaction_id,
        amount: transaction.amount,
        currency: transaction.currency,
        validated: true
      };
    }

    return { status: 'INVALID', message: 'Transaction not successful' };
  }

  /**
   * Get transaction details
   */
  getTransaction(transaction_id) {
    return this.transactions.get(transaction_id);
  }

  /**
   * Cancel transaction
   */
  cancelTransaction(transaction_id) {
    const transaction = this.transactions.get(transaction_id);
    if (transaction) {
      transaction.status = 'CANCELLED';
      transaction.cancelled_at = new Date();
      this.transactions.set(transaction_id, transaction);
    }
    return transaction;
  }
}

// Test card numbers for demo
const TEST_CARDS = {
  SUCCESS: '4111111111111111',
  DECLINED: '4000000000000002',
  EXPIRED: '4000000000000069',
  INSUFFICIENT_FUNDS: '4000000000000341',
  FRAUD: '4100000000000019'
};

module.exports = { MockPaymentGateway, TEST_CARDS };
