// SSLCommerz Integration Test Script
// Run this to verify SSLCommerz is working properly

const SSLCommerzPayment = require('sslcommerz-lts');

// Test configuration
const store_id = process.env.SSLCOMMERZ_STORE_ID || 'testbox';
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD || 'qwerty';
const is_live = false; // Use sandbox for testing

console.log('🧪 Testing SSLCommerz Integration...\n');
console.log('Store ID:', store_id);
console.log('Mode:', is_live ? 'LIVE' : 'SANDBOX');
console.log('-----------------------------------\n');

async function testSSLCommerz() {
  try {
    // Initialize SSLCommerz
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    console.log('✅ SSLCommerz instance created successfully\n');

    // Test payment data
    const data = {
      total_amount: 99,
      currency: 'BDT',
      tran_id: `TEST-${Date.now()}`,
      success_url: 'http://localhost:5000/api/payments/success',
      fail_url: 'http://localhost:5000/api/payments/fail',
      cancel_url: 'http://localhost:5000/api/payments/cancel',
      ipn_url: 'http://localhost:5000/api/payments/ipn',
      shipping_method: 'NO',
      product_name: 'Campus Gigs Premium - 15days (TEST)',
      product_category: 'Subscription',
      product_profile: 'non-physical-goods',
      cus_name: 'Test User',
      cus_email: 'test@example.com',
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: '01700000000',
      value_a: '1', // user_id
      value_b: '15days', // plan_type
    };

    console.log('📝 Test Payment Data:');
    console.log('Amount: ৳', data.total_amount);
    console.log('Product:', data.product_name);
    console.log('Transaction ID:', data.tran_id);
    console.log('-----------------------------------\n');

    // Initialize payment
    console.log('🔄 Initializing payment...');
    const apiResponse = await sslcz.init(data);

    console.log('\n📊 SSLCommerz Response:');
    console.log('Status:', apiResponse.status);
    
    if (apiResponse.status === 'SUCCESS') {
      console.log('✅ Payment initialization SUCCESSFUL!');
      console.log('Gateway URL:', apiResponse.GatewayPageURL);
      console.log('Session Key:', apiResponse.sessionkey ? 'Present' : 'Missing');
      console.log('\n🎉 SSLCommerz is working properly!');
      console.log('\nNext steps:');
      console.log('1. Use the Gateway URL to redirect users for payment');
      console.log('2. Handle callbacks at /success, /fail, /cancel endpoints');
      console.log('3. Test with real payment flow in browser');
      
      return true;
    } else {
      console.log('❌ Payment initialization FAILED');
      console.log('Response:', JSON.stringify(apiResponse, null, 2));
      return false;
    }

  } catch (error) {
    console.error('❌ Error testing SSLCommerz:');
    console.error('Message:', error.message);
    console.error('Details:', error.response?.data || error);
    
    console.log('\n⚠️ Common Issues:');
    console.log('1. Check if SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD are correct');
    console.log('2. Make sure you are using sandbox credentials for testing');
    console.log('3. Verify internet connection');
    console.log('4. Check if sslcommerz-lts package is installed');
    
    return false;
  }
}

// Run test
testSSLCommerz()
  .then((success) => {
    if (success) {
      console.log('\n✅ SSLCommerz integration is working correctly!');
      process.exit(0);
    } else {
      console.log('\n❌ SSLCommerz integration has issues. Please check the errors above.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
