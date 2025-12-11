const SSLCommerzPayment = require('sslcommerz-lts');

class SSLCommerzService {
  constructor() {
    this.store_id = process.env.SSLCOMMERZ_STORE_ID;
    this.store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
    this.is_live = process.env.SSLCOMMERZ_MODE === 'live';
    this.isConfigured = !!(this.store_id && this.store_passwd);
    
    // Log configuration status (but don't throw error)
    if (!this.isConfigured) {
      console.log('⚠️  SSLCommerz credentials not found - SSLCommerz payments disabled');
      return;
    }
    
    console.log('✅ SSLCommerz Service initialized');
    console.log('Store ID:', this.store_id);
    console.log('Mode:', this.is_live ? 'LIVE' : 'SANDBOX');
  }

  /**
   * Initialize a payment transaction
   * @param {Object} paymentData - Payment information
   * @returns {Promise} API response with GatewayPageURL
   */
  async initPayment(paymentData) {
    if (!this.isConfigured) {
      throw new Error('SSLCommerz is not configured. Please set SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD in .env');
    }
    
    try {
      console.log('🔵 SSLCommerz Init - Store ID:', this.store_id);
      console.log('🔵 SSLCommerz Init - Mode:', this.is_live ? 'LIVE' : 'SANDBOX');
      console.log('🔵 SSLCommerz Init - Payment Data:', JSON.stringify(paymentData, null, 2));
      
      const sslcz = new SSLCommerzPayment(this.store_id, this.store_passwd, this.is_live);
      const apiResponse = await sslcz.init(paymentData);
      
      console.log('✅ SSLCommerz Init Response:', JSON.stringify(apiResponse, null, 2));
      
      if (apiResponse.status === 'FAILED') {
        throw new Error(apiResponse.failedreason || 'Payment initialization failed');
      }
      
      return {
        success: true,
        gatewayUrl: apiResponse.GatewayPageURL,
        sessionKey: apiResponse.sessionkey,
        response: apiResponse
      };
    } catch (error) {
      console.error('❌ SSLCommerz init error:', error);
      console.error('❌ Error stack:', error.stack);
      throw new Error('Payment initialization failed: ' + error.message);
    }
  }

  /**
   * Validate a transaction after payment
   * @param {string} val_id - Validation ID from SSLCommerz callback
   * @returns {Promise} Validation response
   */
  async validatePayment(val_id) {
    if (!this.isConfigured) {
      throw new Error('SSLCommerz is not configured');
    }
    
    try {
      const sslcz = new SSLCommerzPayment(this.store_id, this.store_passwd, this.is_live);
      const validationResponse = await sslcz.validate({ val_id });
      return {
        success: true,
        data: validationResponse
      };
    } catch (error) {
      console.error('SSLCommerz validation error:', error);
      throw new Error('Payment validation failed: ' + error.message);
    }
  }

  /**
   * Query transaction status by transaction ID
   * @param {string} tran_id - Transaction ID
   * @returns {Promise} Transaction status
   */
  async queryByTransactionId(tran_id) {
    try {
      const sslcz = new SSLCommerzPayment(this.store_id, this.store_passwd, this.is_live);
      const queryResponse = await sslcz.transactionQueryByTransactionId({ tran_id });
      return {
        success: true,
        data: queryResponse
      };
    } catch (error) {
      console.error('SSLCommerz query by transaction ID error:', error);
      throw new Error('Transaction query failed: ' + error.message);
    }
  }

  /**
   * Query transaction status by session ID
   * @param {string} sessionkey - Session key
   * @returns {Promise} Transaction status
   */
  async queryBySessionId(sessionkey) {
    try {
      const sslcz = new SSLCommerzPayment(this.store_id, this.store_passwd, this.is_live);
      const queryResponse = await sslcz.transactionQueryBySessionId({ sessionkey });
      return {
        success: true,
        data: queryResponse
      };
    } catch (error) {
      console.error('SSLCommerz query by session ID error:', error);
      throw new Error('Transaction query failed: ' + error.message);
    }
  }

  /**
   * Initiate a refund
   * @param {Object} refundData - Refund information
   * @returns {Promise} Refund response
   */
  async initiateRefund(refundData) {
    try {
      const sslcz = new SSLCommerzPayment(this.store_id, this.store_passwd, this.is_live);
      const refundResponse = await sslcz.initiateRefund(refundData);
      return {
        success: true,
        data: refundResponse
      };
    } catch (error) {
      console.error('SSLCommerz refund error:', error);
      throw new Error('Refund initiation failed: ' + error.message);
    }
  }

  /**
   * Query refund status
   * @param {string} refund_ref_id - Refund reference ID
   * @returns {Promise} Refund status
   */
  async queryRefund(refund_ref_id) {
    try {
      const sslcz = new SSLCommerzPayment(this.store_id, this.store_passwd, this.is_live);
      const refundQuery = await sslcz.refundQuery({ refund_ref_id });
      return {
        success: true,
        data: refundQuery
      };
    } catch (error) {
      console.error('SSLCommerz refund query error:', error);
      throw new Error('Refund query failed: ' + error.message);
    }
  }

  /**
   * Build payment data object for SSLCommerz
   * @param {Object} params - Payment parameters
   * @returns {Object} Formatted payment data
   */
  buildPaymentData(params) {
    const {
      tran_id,
      total_amount,
      currency = 'BDT',
      product_name,
      product_category,
      cus_name,
      cus_email,
      cus_phone,
      cus_add1,
      cus_city,
      cus_country = 'Bangladesh',
      success_url,
      fail_url,
      cancel_url,
      ipn_url
    } = params;

    return {
      total_amount,
      currency,
      tran_id,
      success_url,
      fail_url,
      cancel_url,
      ipn_url,
      shipping_method: 'NO',
      product_name: product_name || 'Campus Gigs Transaction',
      product_category: product_category || 'Service',
      product_profile: 'general',
      cus_name,
      cus_email,
      cus_add1: cus_add1 || 'Dhaka',
      cus_add2: 'N/A',
      cus_city: cus_city || 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country,
      cus_phone,
      cus_fax: cus_phone,
      ship_name: cus_name,
      ship_add1: cus_add1 || 'Dhaka',
      ship_add2: 'N/A',
      ship_city: cus_city || 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: 1000,
      ship_country: cus_country
    };
  }
}

module.exports = new SSLCommerzService();
