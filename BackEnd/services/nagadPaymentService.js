const axios = require('axios');
const crypto = require('crypto');

class NagadPaymentService {
  constructor() {
    this.baseURL = process.env.NAGAD_BASE_URL || 'http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0';
    this.merchantId = process.env.NAGAD_MERCHANT_ID;
    this.merchantNumber = process.env.NAGAD_MERCHANT_NUMBER;
    this.publicKey = process.env.NAGAD_PUBLIC_KEY;
    this.privateKey = process.env.NAGAD_PRIVATE_KEY;
    this.callbackURL = process.env.NAGAD_CALLBACK_URL || 'http://localhost:5000/api/webhooks/nagad';
  }

  /**
   * Generate signature for Nagad API
   */
  generateSignature(data) {
    try {
      const sign = crypto.createSign('SHA256');
      sign.update(data);
      sign.end();
      return sign.sign(this.privateKey, 'base64');
    } catch (error) {
      console.error('Nagad Signature Error:', error.message);
      throw new Error('Failed to generate Nagad signature');
    }
  }

  /**
   * Encrypt sensitive data using Nagad public key
   */
  encryptData(data) {
    try {
      const buffer = Buffer.from(JSON.stringify(data));
      const encrypted = crypto.publicEncrypt(
        {
          key: this.publicKey,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        buffer
      );
      return encrypted.toString('base64');
    } catch (error) {
      console.error('Nagad Encryption Error:', error.message);
      throw new Error('Failed to encrypt data for Nagad');
    }
  }

  /**
   * Initialize payment
   */
  async initializePayment({ amount, sender_id, receiver_id, transaction_id, notes }) {
    try {
      const dateTime = new Date().toISOString();
      const orderId = `TXN_${transaction_id}_${Date.now()}`;

      const sensitiveData = {
        merchantId: this.merchantId,
        datetime: dateTime,
        orderId: orderId,
        challenge: crypto.randomBytes(32).toString('hex')
      };

      const postData = {
        accountNumber: this.merchantNumber,
        dateTime: dateTime,
        sensitiveData: this.encryptData(sensitiveData),
        signature: this.generateSignature(JSON.stringify(sensitiveData))
      };

      const response = await axios.post(
        `${this.baseURL}/check-out/initialize/${this.merchantId}/${orderId}`,
        postData,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-KM-Api-Version': 'v-0.2.0',
            'X-KM-IP-V4': '127.0.0.1',
            'X-KM-Client-Type': 'PC_WEB'
          }
        }
      );

      if (response.data.sensitiveData && response.data.signature) {
        return {
          success: true,
          orderId: orderId,
          sensitiveData: response.data.sensitiveData,
          signature: response.data.signature,
          challenge: sensitiveData.challenge
        };
      } else {
        throw new Error('Invalid response from Nagad initialization');
      }
    } catch (error) {
      console.error('Nagad Initialize Error:', error.response?.data || error.message);
      throw new Error('Failed to initialize Nagad payment');
    }
  }

  /**
   * Complete payment
   */
  async completePayment({ amount, orderId, challenge, sender_id }) {
    try {
      const dateTime = new Date().toISOString();

      const postData = {
        merchantId: this.merchantId,
        orderId: orderId,
        amount: amount.toFixed(2),
        currencyCode: '050', // BDT
        challenge: challenge
      };

      const sensitiveData = this.encryptData({
        merchantId: this.merchantId,
        orderId: orderId,
        amount: amount.toFixed(2),
        currencyCode: '050',
        challenge: challenge
      });

      const payload = {
        paymentReferenceId: `REF_${orderId}`,
        callbackUrl: this.callbackURL,
        sensitiveData: sensitiveData,
        signature: this.generateSignature(JSON.stringify(postData)),
        merchantCallbackURL: this.callbackURL,
        additionalMerchantInfo: {
          sender_id: sender_id.toString()
        }
      };

      const response = await axios.post(
        `${this.baseURL}/check-out/complete/${orderId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-KM-Api-Version': 'v-0.2.0',
            'X-KM-IP-V4': '127.0.0.1',
            'X-KM-Client-Type': 'PC_WEB'
          }
        }
      );

      if (response.data.callBackUrl) {
        return {
          success: true,
          orderId: orderId,
          callBackUrl: response.data.callBackUrl,
          paymentReferenceId: response.data.paymentReferenceId
        };
      } else {
        throw new Error('Invalid response from Nagad completion');
      }
    } catch (error) {
      console.error('Nagad Complete Payment Error:', error.response?.data || error.message);
      throw new Error('Failed to complete Nagad payment');
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(paymentReferenceId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/verify/payment/${paymentReferenceId}`,
        {
          headers: {
            'X-KM-Api-Version': 'v-0.2.0',
            'X-KM-IP-V4': '127.0.0.1',
            'X-KM-Client-Type': 'PC_WEB'
          }
        }
      );

      return {
        success: response.data.status === 'Success',
        orderId: response.data.orderId,
        paymentReferenceId: response.data.paymentRefId,
        amount: parseFloat(response.data.amount),
        status: response.data.status,
        issuerPaymentDateTime: response.data.issuerPaymentDateTime,
        issuerPaymentRefNo: response.data.issuerPaymentRefNo
      };
    } catch (error) {
      console.error('Nagad Verify Payment Error:', error.response?.data || error.message);
      throw new Error('Failed to verify Nagad payment');
    }
  }

  /**
   * Verify webhook callback signature
   */
  verifyWebhookSignature(payload, signature) {
    try {
      const verify = crypto.createVerify('SHA256');
      verify.update(JSON.stringify(payload));
      verify.end();
      return verify.verify(this.publicKey, signature, 'base64');
    } catch (error) {
      console.error('Nagad Webhook Verification Error:', error.message);
      return false;
    }
  }
}

module.exports = new NagadPaymentService();
