# SSLCommerz Payment Integration Guide

## Overview
SSLCommerz is now fully integrated into Campus Gigs for secure credit/debit card payments. Users can send money using Visa, MasterCard, American Express, and other cards supported by SSLCommerz.

## Features Implemented

### Backend (Node.js/Express)

1. **SSLCommerz Service** (`services/sslcommerzService.js`)
   - Initialize payment sessions
   - Validate transactions
   - Query transaction status
   - Handle refunds
   - Build payment data structures

2. **Payment Controller** (`controllers/sslcommerzController.js`)
   - `initSSLCommerzPayment` - Initialize payment with SSLCommerz
   - `paymentSuccess` - Handle successful payment callback
   - `paymentFail` - Handle failed payment callback
   - `paymentCancel` - Handle cancelled payment callback
   - `paymentIPN` - Handle Instant Payment Notifications
   - `queryTransaction` - Check transaction status
   - `initiateRefund` - Start refund process
   - `queryRefund` - Check refund status

3. **Routes** (`routes/sslcommerzRoutes.js`)
   - `POST /api/sslcommerz/init` - Initialize payment (Protected)
   - `POST /api/sslcommerz/success` - Success callback (Public)
   - `POST /api/sslcommerz/fail` - Fail callback (Public)
   - `POST /api/sslcommerz/cancel` - Cancel callback (Public)
   - `POST /api/sslcommerz/ipn` - IPN handler (Public)
   - `GET /api/sslcommerz/query/:tran_id` - Query transaction (Protected)
   - `POST /api/sslcommerz/refund` - Initiate refund (Protected)
   - `GET /api/sslcommerz/refund/:refund_ref_id` - Query refund (Protected)

4. **Database Schema** (`migrations/add_sslcommerz_columns.sql`)
   - `ssl_session_key` - Session tracking
   - `ssl_val_id` - Validation ID
   - `ssl_card_type` - Card type (VISA, MASTERCARD, etc.)
   - `ssl_card_brand` - Card issuer
   - `ssl_bank_tran_id` - Bank transaction reference
   - `refund_status` - Refund tracking
   - `refund_amount` - Refund amount
   - `refund_ref_id` - Refund reference
   - `completed_at` - Completion timestamp

### Frontend (React)

1. **API Service** (`services/api.js`)
   - `initiateSSLCommerzPayment(data)` - Start payment
   - `querySSLCommerzTransaction(tranId)` - Check status
   - `initiateSSLCommerzRefund(data)` - Request refund
   - `querySSLCommerzRefund(refundRefId)` - Check refund

2. **Send Money Page** (`components/Post/pages/SendMoneyPage.jsx`)
   - Added "Card Payment" option with SSLCommerz logo
   - Handles redirect to SSLCommerz gateway
   - Stores transaction info for callback handling
   - Shows all card types (Visa, MasterCard, Amex)

3. **Transactions Page**
   - Displays SSLCommerz transactions with payment details
   - Shows card type and brand
   - Transaction reference display
   - Status indicators

## Configuration

### Environment Variables (.env)
```env
# SSLCommerz Configuration
SSLCOMMERZ_STORE_ID=campu69342714745ee
SSLCOMMERZ_STORE_PASSWORD=campu69342714745ee@ssl
SSLCOMMERZ_MODE=sandbox  # Change to 'live' for production

# Backend URL for callbacks
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

## Payment Flow

1. **User Initiates Payment**
   - User selects receiver and amount
   - Chooses "Card Payment" method
   - Clicks "Send Money"

2. **Backend Processing**
   - Creates pending transaction record
   - Builds SSLCommerz payment data
   - Initializes payment with SSLCommerz
   - Receives gateway URL

3. **Redirect to Gateway**
   - User redirected to SSLCommerz payment page
   - Enters card details securely
   - Completes payment

4. **Payment Callback**
   - SSLCommerz redirects to success/fail/cancel URL
   - Backend validates payment with SSLCommerz
   - Updates transaction status
   - Updates user balances
   - Creates notification for receiver
   - Redirects user to transaction history

5. **IPN (Instant Payment Notification)**
   - SSLCommerz sends server-to-server notification
   - Backend validates and updates if needed
   - Ensures transaction integrity

## Testing

### Sandbox Mode
Currently configured for sandbox testing:
- Store ID: `campu69342714745ee`
- Store Password: `campu69342714745ee@ssl`
- Mode: `sandbox`

### Test Cards
Use SSLCommerz sandbox test cards for testing:
- Visa: 4111111111111111
- MasterCard: 5555555555554444
- Check SSLCommerz documentation for more test cards

## Going Live

1. **Get Live Credentials**
   - Register at https://sslcommerz.com/
   - Complete KYC verification
   - Obtain live store ID and password

2. **Update Configuration**
   ```env
   SSLCOMMERZ_STORE_ID=your_live_store_id
   SSLCOMMERZ_STORE_PASSWORD=your_live_store_password
   SSLCOMMERZ_MODE=live
   ```

3. **Update URLs**
   - Set production backend URL
   - Set production frontend URL
   - Ensure HTTPS for production

4. **Security Checklist**
   - ✅ Validate all callbacks with SSLCommerz
   - ✅ Use HTTPS in production
   - ✅ Keep credentials secure in .env
   - ✅ Implement rate limiting
   - ✅ Log all transactions
   - ✅ Monitor for suspicious activity

## Refund Process

### Initiate Refund
```javascript
const response = await initiateSSLCommerzRefund({
  tran_id: 'SSL_123_1234567890_abcd1234',
  refund_amount: 100.00,
  refund_remarks: 'Customer request'
});
```

### Check Refund Status
```javascript
const status = await querySSLCommerzRefund('refund_ref_id');
```

## Transaction Queries

### By Transaction ID
```javascript
const transaction = await querySSLCommerzTransaction('SSL_123_1234567890_abcd1234');
```

## Error Handling

### Payment Failures
- Insufficient funds
- Card declined
- Network issues
- Invalid card details

All errors are logged and user is redirected to send money page with error message.

### Validation Failures
- Invalid transaction
- Duplicate payment
- Tampered data

Backend validates all callbacks with SSLCommerz API before updating database.

## Supported Cards
- ✅ Visa
- ✅ MasterCard
- ✅ American Express
- ✅ Any other cards supported by SSLCommerz

## Benefits
- **Secure**: PCI DSS compliant payment processing
- **Multiple Cards**: Support for all major card types
- **Real-time**: Instant payment validation
- **Refunds**: Built-in refund management
- **Tracking**: Complete transaction tracking
- **Professional**: Industry-standard payment gateway

## Support
For SSLCommerz API documentation: https://developer.sslcommerz.com/
For integration support: support@sslcommerz.com

## Next Steps
1. ✅ Install sslcommerz-lts package
2. ✅ Configure environment variables
3. ✅ Run database migration
4. ✅ Test in sandbox mode
5. ⏳ Get live credentials
6. ⏳ Switch to production mode
7. ⏳ Test with real cards

## Transaction Display
All SSLCommerz transactions show:
- Payment method badge
- Transaction reference
- Card type and brand
- Completion timestamp
- Refund status (if applicable)

---
**Status**: ✅ Fully Integrated and Ready for Testing
**Mode**: Sandbox (Test Mode)
**Next**: Test payments with sandbox credentials
