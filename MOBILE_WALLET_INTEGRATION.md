# Mobile Wallet Integration Guide

## 🎯 Objective
Integrate real bKash, Nagad, and Rocket payment gateway APIs for actual mobile wallet transfers in the Send Money feature.

---

## 📋 Payment Gateways Overview

### 1. bKash Payment Gateway
**Provider:** bKash Limited (Subsidiary of BRAC Bank)
**Website:** https://developer.bka.sh/

**API Types:**
- **Tokenized Checkout API** - Best for P2P transfers
- **Payment API** - For merchant payments
- **Payout API** - For disbursements

**Authentication:**
- Grant Token (OAuth 2.0)
- Refresh Token mechanism
- App Key & App Secret

**Test Environment:**
- Sandbox Base URL: `https://tokenized.sandbox.bka.sh/v1.2.0-beta`
- Production Base URL: `https://tokenized.pay.bka.sh/v1.2.0-beta`

**Registration Required:**
- bKash Merchant Account
- Developer Portal Access
- Test credentials provided in sandbox

**Key Features:**
- Instant transfers
- QR code support
- Callback/Webhook notifications
- Refund support

---

### 2. Nagad Payment Gateway
**Provider:** Nagad (Subsidiary of Bangladesh Post Office)
**Website:** https://nagad.com.bd/merchant

**API Types:**
- **Checkout API** - Payment collection
- **Verification API** - Transaction verification
- **Payment Complete API** - Finalize payment

**Authentication:**
- PGW Merchant ID
- Public Key (RSA encryption)
- Signature verification

**Test Environment:**
- Sandbox Base URL: `http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0`
- Production Base URL: `https://api.mynagad.com/api/dfs`

**Registration Required:**
- Nagad Merchant Account
- Documentation from Nagad team
- Digital signature setup

**Key Features:**
- High transaction limit
- Government-backed
- Strong security
- Instant settlement

---

### 3. Rocket Payment Gateway
**Provider:** Dutch-Bangla Bank (DBBL)
**Website:** https://www.rocket.com.bd/

**API Types:**
- **Payment API** - Transaction initiation
- **Status Check API** - Transaction verification
- **Callback API** - Real-time updates

**Authentication:**
- Merchant ID
- API Key
- Secret Key

**Test Environment:**
- Sandbox Base URL: `https://sandbox.rocketgateway.com/api/v1`
- Production Base URL: `https://api.rocketgateway.com/api/v1`

**Registration Required:**
- DBBL Rocket Merchant Account
- API credentials from DBBL
- Whitelisted IPs

**Key Features:**
- Bank integration
- Transaction history
- Automated reconciliation
- Multi-currency support

---

## 🔑 API Credentials Setup

### Environment Variables (.env)
```env
# bKash
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_APP_KEY=your_app_key_here
BKASH_APP_SECRET=your_app_secret_here
BKASH_USERNAME=your_username_here
BKASH_PASSWORD=your_password_here
BKASH_CALLBACK_URL=http://localhost:5000/api/payment/bkash/callback

# Nagad
NAGAD_BASE_URL=http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0
NAGAD_MERCHANT_ID=your_merchant_id_here
NAGAD_PUBLIC_KEY=your_public_key_here
NAGAD_PRIVATE_KEY=your_private_key_here
NAGAD_CALLBACK_URL=http://localhost:5000/api/payment/nagad/callback

# Rocket
ROCKET_BASE_URL=https://sandbox.rocketgateway.com/api/v1
ROCKET_MERCHANT_ID=your_merchant_id_here
ROCKET_API_KEY=your_api_key_here
ROCKET_SECRET_KEY=your_secret_key_here
ROCKET_CALLBACK_URL=http://localhost:5000/api/payment/rocket/callback
```

---

## 📁 File Structure

```
BackEnd/
├── services/
│   ├── bkashPaymentService.js      # bKash API integration
│   ├── nagadPaymentService.js      # Nagad API integration
│   └── rocketPaymentService.js     # Rocket API integration
├── controllers/
│   ├── mobileWalletController.js   # Unified wallet controller
│   └── webhookController.js        # Payment callbacks
├── routes/
│   ├── mobileWalletRoutes.js       # Wallet payment routes
│   └── webhookRoutes.js            # Webhook routes
└── utils/
    └── paymentHelpers.js           # Common payment utilities
```

---

## 🔄 Payment Flow

### Current Flow (Internal Wallet)
```
User A → Select bKash → Enter Amount → Send 
→ Deduct from A's balance → Add to B's balance → Transaction Complete
```

### New Flow (Real Mobile Wallet)
```
User A → Select bKash → Enter Amount → Send
→ Redirect to bKash → User enters PIN → Payment processed
→ Callback received → Verify payment → Update balances
→ Send notification → Transaction Complete
```

---

## 🛠️ Implementation Steps

### Phase 1: Research & Setup ✅
- [x] Document API requirements
- [ ] Register for developer accounts
- [ ] Obtain sandbox credentials
- [ ] Set up test environments

### Phase 2: Backend Integration
- [ ] Create bKash service module
- [ ] Create Nagad service module
- [ ] Create Rocket service module
- [ ] Update transaction controller
- [ ] Add webhook handlers
- [ ] Test each gateway independently

### Phase 3: Frontend Updates
- [ ] Add payment gateway redirect handling
- [ ] Create payment status polling
- [ ] Add payment confirmation page
- [ ] Update error handling
- [ ] Add loading states

### Phase 4: Testing
- [ ] Test bKash sandbox transactions
- [ ] Test Nagad sandbox transactions
- [ ] Test Rocket sandbox transactions
- [ ] Test error scenarios
- [ ] Test callback handling

### Phase 5: Production
- [ ] Switch to production credentials
- [ ] Configure production webhooks
- [ ] Enable logging & monitoring
- [ ] Launch & monitor

---

## ⚠️ Important Notes

1. **Sandbox Testing Required**: All gateways require sandbox testing before production
2. **Merchant Approval**: Getting merchant accounts can take 7-15 days
3. **SSL Required**: Production webhooks require HTTPS
4. **Compliance**: Follow Bangladesh Bank regulations for payment processing
5. **Transaction Limits**: Each gateway has different limits (need merchant account for details)

---

## 🔗 Useful Resources

- bKash Developer Docs: https://developer.bka.sh/docs
- Nagad Merchant Guide: https://nagad.com.bd/merchant-services
- Rocket Business: https://www.rocket.com.bd/business
- Bangladesh Bank Guidelines: https://www.bb.org.bd/

---

## 📝 Next Steps

1. **Register for Accounts**: Contact each provider for merchant accounts
2. **Get Sandbox Access**: Request sandbox credentials for testing
3. **Review Documentation**: Study each API's specific requirements
4. **Start with bKash**: Most popular and well-documented
5. **Test Thoroughly**: Use sandbox for all testing before production

