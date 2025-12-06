# 🚀 Mobile Wallet Integration - Complete Setup Guide

## ✅ What Has Been Done

### Backend Files Created:
1. **✅ `/BackEnd/services/bkashPaymentService.js`** - bKash API integration
2. **✅ `/BackEnd/services/nagadPaymentService.js`** - Nagad API integration  
3. **✅ `/BackEnd/services/rocketPaymentService.js`** - Rocket API integration
4. **✅ `/BackEnd/controllers/mobileWalletController.js`** - Payment gateway controller
5. **✅ `/BackEnd/controllers/webhookController.js`** - Webhook handlers
6. **✅ `/BackEnd/routes/mobileWalletRoutes.js`** - Mobile wallet routes
7. **✅ `/BackEnd/routes/webhookRoutes.js`** - Webhook routes
8. **✅ `/BackEnd/migrations/add_mobile_wallet_columns.sql`** - Database migration
9. **✅ `/BackEnd/.env.mobile-wallet.example`** - Environment template

### Frontend Files Created:
1. **✅ `/FrontEnd/src/components/Post/pages/PaymentCallbackPage.jsx`** - Payment verification page

### Files Updated:
1. **✅ `/BackEnd/server.js`** - Added mobile wallet and webhook routes
2. **✅ `/FrontEnd/src/services/api.js`** - Added mobile wallet API endpoints
3. **✅ `/FrontEnd/src/components/Post/pages/SendMoneyPage.jsx`** - Updated to use mobile wallet API

### Documentation Created:
1. **✅ `/MOBILE_WALLET_INTEGRATION.md`** - Complete integration guide
2. **✅ `/SETUP_GUIDE.md`** - This setup guide

---

## 📝 Setup Steps

### Step 1: Run Database Migration

```bash
cd BackEnd
# Connect to your PostgreSQL database
psql -U postgres -d "PG Antu" -f migrations/add_mobile_wallet_columns.sql
```

Or run directly in your database client:
```sql
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20),
ADD COLUMN IF NOT EXISTS payment_reference TEXT;

CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_transactions_status_payment_method ON transactions(status, payment_method);
```

### Step 2: Register for Payment Gateway Accounts

#### bKash Merchant Account
1. Visit: https://developer.bka.sh/
2. Click "Get Started" or "Register"
3. Fill out merchant application
4. Wait for approval (2-5 business days)
5. Get sandbox credentials from developer portal

**What you'll get:**
- App Key
- App Secret
- Username
- Password

#### Nagad Merchant Account
1. Visit: https://nagad.com.bd/merchant
2. Click "Become a Merchant"
3. Contact Nagad merchant support: merchant@nagad.com.bd
4. Submit business documents
5. Wait for approval (5-10 business days)
6. Receive API credentials and key pairs

**What you'll get:**
- Merchant ID
- Merchant Number
- Public Key (RSA)
- Private Key (RSA)

#### Rocket Merchant Account
1. Contact Dutch-Bangla Bank (DBBL)
2. Visit nearest DBBL branch
3. Apply for Rocket Business Account
4. Submit business documents
5. Wait for approval (7-15 business days)
6. Get API credentials from DBBL

**What you'll get:**
- Merchant ID
- API Key
- Secret Key

### Step 3: Configure Environment Variables

Copy the example file:
```bash
cd BackEnd
cp .env.mobile-wallet.example .env.mobile-wallet
```

Edit `.env.mobile-wallet` with your actual credentials:

```env
# bKash Credentials
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_APP_KEY=your_actual_app_key_here
BKASH_APP_SECRET=your_actual_app_secret_here
BKASH_USERNAME=your_actual_username_here
BKASH_PASSWORD=your_actual_password_here
BKASH_CALLBACK_URL=http://localhost:5000/api/webhooks/bkash

# Nagad Credentials  
NAGAD_BASE_URL=http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0
NAGAD_MERCHANT_ID=your_actual_merchant_id_here
NAGAD_MERCHANT_NUMBER=your_actual_merchant_number_here
NAGAD_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
Your actual public key here
-----END PUBLIC KEY-----"
NAGAD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
Your actual private key here
-----END PRIVATE KEY-----"
NAGAD_CALLBACK_URL=http://localhost:5000/api/webhooks/nagad

# Rocket Credentials
ROCKET_BASE_URL=https://sandbox.rocketgateway.com/api/v1
ROCKET_MERCHANT_ID=your_actual_merchant_id_here
ROCKET_API_KEY=your_actual_api_key_here
ROCKET_SECRET_KEY=your_actual_secret_key_here
ROCKET_CALLBACK_URL=http://localhost:5000/api/webhooks/rocket
```

Then add these to your main `.env` file or load this file in your app.

### Step 4: Add Payment Callback Route

Add this route to your frontend router (usually in `App.jsx` or route configuration):

```javascript
import PaymentCallbackPage from './components/Post/pages/PaymentCallbackPage';

// Add to your routes:
<Route path="/post/payment-callback" element={<PaymentCallbackPage />} />
```

### Step 5: Install Required Dependencies

```bash
cd BackEnd
npm install axios crypto

cd ../FrontEnd
npm install
```

### Step 6: Restart Backend Server

```bash
cd BackEnd
npm start
```

The server should now load the new routes and services.

---

## 🧪 Testing

### Test with Sandbox Credentials

Each payment gateway provides test credentials:

#### bKash Test Numbers:
- Test Number: `01770618567`
- OTP: `123456`
- PIN: `12345`

#### Nagad Test Numbers:
- Test Number: `01711111111`
- PIN: `123456`

#### Rocket Test Numbers:
- Test Number: `01234567890`
- PIN: `1234`

### Testing Flow:

1. Navigate to Send Money page
2. Select a receiver
3. Enter amount (try ৳100)
4. Select payment method (bKash/Nagad/Rocket)
5. Click "Send Money"
6. You'll be redirected to the payment gateway
7. Use test credentials to complete payment
8. You'll be redirected back to `/post/payment-callback`
9. Payment will be verified automatically
10. Check transaction history

---

## 🔧 Troubleshooting

### Issue: "Failed to initiate payment"
**Solution:** Check if payment gateway credentials are correct in `.env` file

### Issue: "Payment verification failed"
**Solution:** Check webhook URLs are accessible and correct

### Issue: "Invalid signature"
**Solution:** Verify public/private keys are correctly formatted (especially for Nagad)

### Issue: Database error
**Solution:** Ensure migration has been run and columns exist

### Issue: CORS errors
**Solution:** Add payment gateway callback URLs to CORS whitelist

---

## 🌐 Production Deployment

### Before Going Live:

1. **Switch to Production URLs:**
   ```env
   BKASH_BASE_URL=https://tokenized.pay.bka.sh/v1.2.0-beta
   NAGAD_BASE_URL=https://api.mynagad.com/api/dfs
   ROCKET_BASE_URL=https://api.rocketgateway.com/api/v1
   ```

2. **Update Callback URLs to HTTPS:**
   ```env
   BKASH_CALLBACK_URL=https://yourdomain.com/api/webhooks/bkash
   NAGAD_CALLBACK_URL=https://yourdomain.com/api/webhooks/nagad
   ROCKET_CALLBACK_URL=https://yourdomain.com/api/webhooks/rocket
   ```

3. **Get Production Credentials:**
   - Request production API keys from each provider
   - Complete any additional verification requirements

4. **Configure Webhooks:**
   - Register webhook URLs in each payment gateway dashboard
   - Whitelist your server IPs if required

5. **Test in Production:**
   - Do small test transactions with real money
   - Verify webhooks are received correctly
   - Check transaction records in database

---

## 📊 Monitoring

### Check Transaction Status:
```sql
SELECT id, sender_id, receiver_id, amount, payment_method, status, created_at
FROM transactions
WHERE payment_method IN ('bkash', 'nagad', 'rocket')
ORDER BY created_at DESC
LIMIT 20;
```

### Check Failed Payments:
```sql
SELECT id, sender_id, amount, payment_method, status, notes, created_at
FROM transactions
WHERE payment_method IN ('bkash', 'nagad', 'rocket')
AND status = 'failed'
ORDER BY created_at DESC;
```

### Check Pending Payments:
```sql
SELECT id, sender_id, amount, payment_method, status, created_at
FROM transactions
WHERE payment_method IN ('bkash', 'nagad', 'rocket')
AND status = 'pending'
AND created_at > NOW() - INTERVAL '1 hour';
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` files to Git**
   ```bash
   echo ".env*" >> .gitignore
   echo "!.env.example" >> .gitignore
   ```

2. **Use environment variables in production**
   - Set environment variables in your hosting platform
   - Don't store credentials in code

3. **Verify webhook signatures**
   - Already implemented in webhook controllers
   - Reject unsigned webhooks in production

4. **Log all transactions**
   - Keep audit trail
   - Monitor for suspicious activity

5. **Rate limit payment endpoints**
   - Prevent abuse
   - Add rate limiting middleware

---

## 📞 Support Contacts

- **bKash:** support@bka.sh | https://developer.bka.sh/support
- **Nagad:** merchant@nagad.com.bd | 16167
- **Rocket:** 16216 | https://www.rocket.com.bd/contact

---

## ✨ Current Status

- ✅ Backend services implemented
- ✅ Database migration ready
- ✅ Frontend payment flow updated
- ✅ Webhook handlers created
- ⏳ **Waiting for payment gateway credentials**
- ⏳ Sandbox testing pending
- ⏳ Production deployment pending

---

## 📝 Next Steps

1. **Register for merchant accounts** (can take 2-15 days)
2. **Get sandbox credentials**
3. **Configure `.env` file**
4. **Run database migration**
5. **Test with sandbox**
6. **Fix any issues**
7. **Request production access**
8. **Go live!**

---

**Need Help?** Review `/MOBILE_WALLET_INTEGRATION.md` for detailed API documentation.
