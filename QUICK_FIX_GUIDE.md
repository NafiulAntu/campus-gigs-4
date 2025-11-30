# 🔧 Quick Setup & Fix Guide

## ✅ What Just Got Fixed

### 1. Database Setup ✓
- ✅ `user_transactions` table created
- ✅ `balance` column added to users
- ✅ Auto-balance update triggers installed
- ✅ Test balance added (৳1000 per user)

### 2. What's Working Now
- ✅ Send money between users
- ✅ Transaction history
- ✅ Balance tracking
- ✅ Real-time balance updates

## ⚠️ SSLCommerz Configuration Needed

To enable **Premium Subscriptions**, you need to configure SSLCommerz:

### Option 1: Test Mode (Sandbox - Recommended for Testing)

Register for a test account at: https://developer.sslcommerz.com/registration/

Then update `BackEnd/.env`:

```env
# Replace these with your actual sandbox credentials
SSLCOMMERZ_STORE_ID=your_sandbox_store_id
SSLCOMMERZ_STORE_PASSWORD=your_sandbox_store_password
SSLCOMMERZ_MODE=sandbox
```

### Option 2: Quick Test (Demo Store - Works Immediately)

For immediate testing, you can use SSLCommerz demo credentials:

```env
SSLCOMMERZ_STORE_ID=testbox
SSLCOMMERZ_STORE_PASSWORD=qwerty
SSLCOMMERZ_MODE=sandbox
```

⚠️ **Note**: Demo credentials are for testing only. Get your own credentials for production.

### Option 3: Skip Premium for Now

If you want to test only P2P transactions (Send Money), you can skip SSLCommerz configuration. Premium subscriptions will be disabled but transactions will work fine.

---

## 🚀 Start the Server

```bash
cd BackEnd
npm start
```

## 🧪 Test the Features

### 1. Test P2P Transactions (Works Now!)

1. Login to your app
2. Go to any user's profile
3. Click the green **"💸 Send Money"** button
4. Enter amount (you have ৳1000 test balance)
5. Add a note and send!
6. Check **"Transactions"** menu to see history

### 2. Test Premium (After SSLCommerz Config)

1. Click **"Premium"** in sidebar
2. Choose Monthly (৳299) or Yearly (৳2,999)
3. Click "Subscribe Now"
4. Complete payment via SSLCommerz test gateway
5. Get premium badge!

---

## 📊 Quick Commands

```bash
# Check system status
node checkSetup.js

# Add more balance to users
node addTestBalance.js

# Check if server is running
curl http://localhost:5000/

# View transaction history (with your token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/transactions/history
```

---

## 🎯 What's Available Right Now

### ✅ Working Features (No Config Needed)
- Send money to other users
- View transaction history
- Check balance
- Filter transactions (All/Sent/Received)
- Transaction notifications
- Beautiful UI with animations

### ⏳ Needs SSLCommerz Config
- Premium subscriptions
- Payment gateway integration
- Auto-renewal

---

## 🐛 Troubleshooting

### "Cannot send money"
- Check if you have balance: `node checkSetup.js`
- Add balance: `node addTestBalance.js`

### "Server not starting"
- Check if port 5000 is free
- Check database connection in .env

### "Premium not working"
- Configure SSLCOMMERZ credentials in .env
- Or use demo credentials (testbox/qwerty)

---

## 📝 Summary

**Fixed:**
- ✅ Database tables created
- ✅ Balance system working
- ✅ Test data added
- ✅ Transaction system fully functional

**Ready to Use:**
- 💸 Send Money feature
- 📊 Transaction history
- 💰 Balance tracking
- 🔔 Notifications

**Needs Setup:**
- 💳 SSLCommerz for Premium (optional)

**Your system is now working! 🎉**
