const axios = require('axios');
const crypto = require('crypto');

class RocketPaymentService {
  constructor() {
    this.baseURL = process.env.ROCKET_BASE_URL || 'https://sandbox.rocketgateway.com/api/v1';
    this.merchantId = process.env.ROCKET_MERCHANT_ID;
    this.apiKey = process.env.ROCKET_API_KEY;
    this.secretKey = process.env.ROCKET_SECRET_KEY;
    this.callbackURL = process.env.ROCKET_CALLBACK_URL || 'http://localhost:5000/api/webhooks/rocket';
  }

  /**
   * Generate HMAC signature for Rocket API
   */
  generateSignature(payload) {
    try {
      const hmac = crypto.createHmac('sha256', this.secretKey);
      hmac.update(JSON.stringify(payload));
      return hmac.digest('hex');
    } catch (error) {
      console.error('Rocket Signature Error:', error.message);
      throw new Error('Failed to generate Rocket signature');
    }
  }

  /**
   * Generate authorization header
   */
  getAuthHeader() {
    const credentials = Buffer.from(`${this.merchantId}:${this.apiKey}`).toString('base64');
    return `Basic ${credentials}`;
  }

  /**
   * Initiate payment
   */
  async initiatePayment({ amount, sender_id, receiver_id, transaction_id, notes }) {
    try {
      const orderId = `TXN_${transaction_id}_${Date.now()}`;
      
      const payload = {
        merchant_id: this.merchantId,
        order_id: orderId,
        amount: amount.toFixed(2),
        currency: 'BDT',
        description: notes || 'Send Money Transaction',
        customer_id: sender_id.toString(),
        callback_url: `${this.callbackURL}?transaction_id=${transaction_id}`,
        cancel_url: `${this.callbackURL}/cancel?transaction_id=${transaction_id}`,
        success_url: `${this.callbackURL}/success?transaction_id=${transaction_id}`,
        timestamp: Date.now()
      };

      const signature = this.generateSignature(payload);

      const response = await axios.post(
        `${this.baseURL}/payment/initiate`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.getAuthHeader(),
            'X-Signature': signature
          }
        }
      );

      if (response.data.status === 'success') {
        return {
          success: true,
          orderId: orderId,
          paymentId: response.data.payment_id,
          paymentURL: response.data.payment_url,
          expiresAt: response.data.expires_at
        };
      } else {
        throw new Error(response.data.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Rocket Initiate Payment Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initiate Rocket payment');
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(paymentId) {
    try {
      const payload = {
        merchant_id: this.merchantId,
        payment_id: paymentId,
        timestamp: Date.now()
      };

      const signature = this.generateSignature(payload);

      const response = await axios.get(
        `${this.baseURL}/payment/verify/${paymentId}`,
        {
          headers: {
            'Authorization': this.getAuthHeader(),
            'X-Signature': signature
          },
          params: {
            merchant_id: this.merchantId,
            timestamp: payload.timestamp
          }
        }
      );

      return {
        success: response.data.status === 'completed',
        paymentId: response.data.payment_id,
        orderId: response.data.order_id,
        transactionId: response.data.transaction_id,
        amount: parseFloat(response.data.amount),
        status: response.data.status,
        paidAt: response.data.paid_at,
        customerPhone: response.data.customer_phone
      };
    } catch (error) {
      console.error('Rocket Verify Payment Error:', error.response?.data || error.message);
      throw new Error('Failed to verify Rocket payment');
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(orderId) {
    try {
      const payload = {
        merchant_id: this.merchantId,
        order_id: orderId,
        timestamp: Date.now()
      };

      const signature = this.generateSignature(payload);

      const response = await axios.get(
        `${this.baseURL}/payment/status`,
        {
          headers: {
            'Authorization': this.getAuthHeader(),
            'X-Signature': signature
          },
          params: {
            merchant_id: this.merchantId,
            order_id: orderId,
            timestamp: payload.timestamp
          }
        }
      );

      return {
        success: response.data.status === 'completed',
        orderId: response.data.order_id,
        paymentId: response.data.payment_id,
        status: response.data.status,
        amount: parseFloat(response.data.amount),
        message: response.data.message
      };
    } catch (error) {
      console.error('Rocket Status Check Error:', error.response?.data || error.message);
      throw new Error('Failed to check Rocket payment status');
    }
  }

  /**
   * Refund payment
   */
  async refundPayment({ paymentId, amount, reason }) {
    try {
      const payload = {
        merchant_id: this.merchantId,
        payment_id: paymentId,
        refund_amount: amount.toFixed(2),
        reason: reason || 'Customer requested refund',
        timestamp: Date.now()
      };

      const signature = this.generateSignature(payload);

      const response = await axios.post(
        `${this.baseURL}/payment/refund`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.getAuthHeader(),
            'X-Signature': signature
          }
        }
      );

      return {
        success: response.data.status === 'success',
        refundId: response.data.refund_id,
        paymentId: response.data.payment_id,
        amount: parseFloat(response.data.amount),
        status: response.data.status,
        refundedAt: response.data.refunded_at
      };
    } catch (error) {
      console.error('Rocket Refund Error:', error.response?.data || error.message);
      throw new Error('Failed to process Rocket refund');
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    try {
      const expectedSignature = this.generateSignature(payload);
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Rocket Webhook Verification Error:', error.message);
      return false;
    }
  }
}

module.exports = new RocketPaymentService();
