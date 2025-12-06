const axios = require('axios');
const crypto = require('crypto');

class BkashPaymentService {
  constructor() {
    this.baseURL = process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';
    this.appKey = process.env.BKASH_APP_KEY;
    this.appSecret = process.env.BKASH_APP_SECRET;
    this.username = process.env.BKASH_USERNAME;
    this.password = process.env.BKASH_PASSWORD;
    this.callbackURL = process.env.BKASH_CALLBACK_URL || 'http://localhost:5000/api/webhooks/bkash';
    this.grantToken = null;
    this.tokenExpiresAt = null;
  }

  /**
   * Get authentication token from bKash
   */
  async getToken() {
    try {
      // Check if we have a valid token
      if (this.grantToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
        return this.grantToken;
      }

      const response = await axios.post(
        `${this.baseURL}/tokenized/checkout/token/grant`,
        {
          app_key: this.appKey,
          app_secret: this.appSecret
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'username': this.username,
            'password': this.password
          }
        }
      );

      this.grantToken = response.data.id_token;
      // Token typically expires in 1 hour, we'll refresh 5 minutes before
      this.tokenExpiresAt = Date.now() + (55 * 60 * 1000);

      return this.grantToken;
    } catch (error) {
      console.error('bKash Token Error:', error.response?.data || error.message);
      throw new Error('Failed to get bKash authentication token');
    }
  }

  /**
   * Create payment request
   */
  async createPayment({ amount, sender_id, receiver_id, transaction_id, notes }) {
    try {
      const token = await this.getToken();
      
      const paymentRequest = {
        mode: '0011', // Tokenized checkout
        payerReference: `USER_${sender_id}`,
        callbackURL: `${this.callbackURL}?transaction_id=${transaction_id}`,
        amount: amount.toFixed(2),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: `TXN_${transaction_id}_${Date.now()}`
      };

      const response = await axios.post(
        `${this.baseURL}/tokenized/checkout/create`,
        paymentRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
            'X-APP-Key': this.appKey
          }
        }
      );

      if (response.data.statusCode === '0000') {
        return {
          success: true,
          paymentID: response.data.paymentID,
          bkashURL: response.data.bkashURL,
          callbackURL: response.data.callbackURL,
          successCallbackURL: response.data.successCallbackURL,
          failureCallbackURL: response.data.failureCallbackURL,
          cancelledCallbackURL: response.data.cancelledCallbackURL
        };
      } else {
        throw new Error(response.data.statusMessage || 'Payment creation failed');
      }
    } catch (error) {
      console.error('bKash Create Payment Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.statusMessage || 'Failed to create bKash payment');
    }
  }

  /**
   * Execute payment after user authorization
   */
  async executePayment(paymentID) {
    try {
      const token = await this.getToken();

      const response = await axios.post(
        `${this.baseURL}/tokenized/checkout/execute`,
        { paymentID },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
            'X-APP-Key': this.appKey
          }
        }
      );

      if (response.data.statusCode === '0000') {
        return {
          success: true,
          paymentID: response.data.paymentID,
          trxID: response.data.trxID,
          transactionStatus: response.data.transactionStatus,
          amount: parseFloat(response.data.amount),
          customerMsisdn: response.data.customerMsisdn,
          paymentExecuteTime: response.data.paymentExecuteTime,
          merchantInvoiceNumber: response.data.merchantInvoiceNumber
        };
      } else {
        throw new Error(response.data.statusMessage || 'Payment execution failed');
      }
    } catch (error) {
      console.error('bKash Execute Payment Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.statusMessage || 'Failed to execute bKash payment');
    }
  }

  /**
   * Query payment status
   */
  async queryPayment(paymentID) {
    try {
      const token = await this.getToken();

      const response = await axios.post(
        `${this.baseURL}/tokenized/checkout/payment/status`,
        { paymentID },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
            'X-APP-Key': this.appKey
          }
        }
      );

      return {
        success: response.data.statusCode === '0000',
        paymentID: response.data.paymentID,
        trxID: response.data.trxID,
        transactionStatus: response.data.transactionStatus,
        amount: parseFloat(response.data.amount),
        statusCode: response.data.statusCode,
        statusMessage: response.data.statusMessage
      };
    } catch (error) {
      console.error('bKash Query Payment Error:', error.response?.data || error.message);
      throw new Error('Failed to query bKash payment status');
    }
  }

  /**
   * Refund payment
   */
  async refundPayment({ paymentID, trxID, amount, reason }) {
    try {
      const token = await this.getToken();

      const response = await axios.post(
        `${this.baseURL}/tokenized/checkout/payment/refund`,
        {
          paymentID,
          trxID,
          amount: amount.toFixed(2),
          sku: 'Send Money Refund',
          reason: reason || 'Customer requested refund'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
            'X-APP-Key': this.appKey
          }
        }
      );

      return {
        success: response.data.statusCode === '0000',
        refundTrxID: response.data.refundTrxID,
        originalTrxID: response.data.originalTrxID,
        transactionStatus: response.data.transactionStatus,
        amount: parseFloat(response.data.amount),
        completedTime: response.data.completedTime
      };
    } catch (error) {
      console.error('bKash Refund Error:', error.response?.data || error.message);
      throw new Error('Failed to process bKash refund');
    }
  }

  /**
   * Verify webhook signature (if bKash provides webhook signatures)
   */
  verifyWebhookSignature(payload, signature) {
    // Implement signature verification if bKash provides it
    // For now, return true as bKash might not provide webhook signatures
    return true;
  }
}

module.exports = new BkashPaymentService();
