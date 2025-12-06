# Mobile Wallet Payment Setup Guide

## Overview
This guide explains how to configure bKash, Nagad, and Rocket payment gateways for the Send Money feature.

## ✅ What's Working
- **Payment Methods**: bKash, Nagad, Rocket
- **Flow**: User selects method → Enters amount → Confirms → Redirects to payment gateway (Demo/OTP) → Payment success → Money transferred
- **Backend**: Real payment gateway integration with proper callbacks

## 🔧 Backend Configuration

### Add to `BackEnd/.env`:

```env
# bKash Payment Gateway Configuration (Sandbox)
# Get credentials from https://developer.bka.sh/
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_APP_KEY=4f6o0cjiki2rfm34kfdadl1eqq
BKASH_APP_SECRET=2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b
BKASH_USERNAME=sandboxTokenizedUser02
BKASH_PASSWORD=sandboxTokenizedUser02@12345
BKASH_CALLBACK_URL=http://localhost:5000/api/mobile-wallet/callback

# Nagad Payment Gateway Configuration (Sandbox)
NAGAD_BASE_URL=http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs
NAGAD_MERCHANT_ID=683002007104225
NAGAD_MERCHANT_NUMBER=01711428801
NAGAD_PUBLIC_KEY=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjBH1pFfSijxSqmEg0csjJT9v1kx2GbdMcQKACX38FwIvvYLMd2bNIB8KKYbvqS+/XZdtANKEuUPvdKT6p+rXkuVjb7U7xQb9kCGMPM8A1OhXkO0G0IXvH/CxQx/zqnv8j5h8QWVHpEgRZM6UWC7IIZ+Wo2hVo0tLJz1wJlEKQOLXbOzR7R8F8Lp8HbGzBpJFGXy1jQ8iYrF1p5XJOz5kq0E7Y0xZKfE4RkYp1S7A0hYUxMZwNlzDqr0CfPHFCn8IcNYZQ/XzPGN8b7xq4J2OvNVKH8ZwZ6tMHfG1vPRfwf9kG8S2RvZ2LfXj2N4Y3Y7F8TqLH0j3Kp0yM+3m5CzQDIDAQAB
NAGAD_PRIVATE_KEY=MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCZT05Tn9pFYGSCaLPLEQb4VJT1h44SQdCiDBXzxLGg4h4XxQqLHWPmWpVjAHx8PB1h3cTdQ0K0pQ5F7L0J7YiN8fQOhNQmXR+0n+cqU9F6Q0M4cYjIb0P0IVvWEiKjGqkzXqH8DqZ7LlRpQYh3iUGGHYQP+LwFbBFOW0Q0F0l6HiYqLB7HfQpb7L2mB8hC7SQ7R8Wl1F2QhYpK8L8H+QN7F8Q8LCHQd0FQ7K8L5H7Q8B8M5F7L8H9Q8O5F7L8H
NAGAD_CALLBACK_URL=http://localhost:5000/api/mobile-wallet/callback

# Rocket Payment Gateway Configuration (Sandbox)
ROCKET_BASE_URL=https://sandbox.rocketpay.com.bd/api
ROCKET_MERCHANT_ID=ROCKET_TEST_MERCHANT
ROCKET_API_KEY=test_rocket_api_key_12345
ROCKET_API_SECRET=test_rocket_secret_67890
ROCKET_CALLBACK_URL=http://localhost:5000/api/mobile-wallet/callback
```

## 🚀 How It Works

### 1. User Initiates Payment
- User selects bKash/Nagad/Rocket
- Enters amount (৳50 - ৳5000)
- Clicks Confirm

### 2. Payment Gateway Redirect
- Backend creates pending transaction
- Calls payment gateway API
- Returns payment URL
- Frontend redirects user to gateway

### 3. Gateway Demo/OTP Page
- **bKash**: Shows demo payment page with OTP verification
- **Nagad**: Shows Nagad payment interface
- **Rocket**: Shows Rocket payment interface

### 4. Payment Completion
- User completes payment (enters OTP/PIN)
- Gateway calls callback URL: `/api/mobile-wallet/callback`
- Backend verifies payment
- Updates transaction status to 'completed'
- Transfers money between accounts
- Redirects back to app

### 5. Success
- User sees success message
- Balance updated
- Transaction recorded

## 📂 Key Files

### Backend
- `BackEnd/services/bkashPaymentService.js` - bKash API integration
- `BackEnd/services/nagadPaymentService.js` - Nagad API integration
- `BackEnd/services/rocketPaymentService.js` - Rocket API integration
- `BackEnd/controllers/mobileWalletController.js` - Payment controller
- `BackEnd/routes/mobileWalletRoutes.js` - Payment routes

### Frontend
- `FrontEnd/src/components/Post/pages/SendMoneyPage.jsx` - Send Money UI
- `FrontEnd/src/services/api.js` - API service

## 🧪 Testing

### 1. Start Servers
```bash
cd Campus
npm run dev
```

### 2. Test Payment Flow
1. Go to http://localhost:3000
2. Click on a user profile
3. Click "Send Money"
4. Select **bKash** (or Nagad/Rocket)
5. Enter amount: `100`
6. Click "Confirm Transaction"
7. Will redirect to bKash Demo/OTP page
8. Complete payment on gateway
9. Should redirect back with success

### 3. Check Transaction
- Backend logs will show payment creation and verification
- Check database `transactions` table for completed transaction
- User balances should be updated

## 🔑 Important Notes

1. **Sandbox Mode**: All credentials are for sandbox/testing
2. **Production**: Replace with live credentials from payment gateway providers
3. **Callback URL**: Must be publicly accessible in production (use ngrok for local testing)
4. **Security**: Never commit `.env` file to git

## 🐛 Troubleshooting

### Payment fails immediately
- Check if bKash credentials are correct in `.env`
- Check backend logs for API errors
- Verify callback URL is accessible

### Redirect doesn't work
- Check FRONTEND_URL and BACKEND_URL in `.env`
- Verify callback route is registered in server.js

### Payment stuck in pending
- Check if callback is being received
- Verify transaction ID is stored correctly
- Check payment gateway webhook logs

## 📞 Support

For production credentials:
- **bKash**: https://developer.bka.sh/
- **Nagad**: Contact Nagad merchant support
- **Rocket**: Contact DBBL Rocket merchant support
