# Dummy Mobile Wallet Payment System

## Overview

This dummy payment system allows you to test **bKash**, **Nagad**, and **Rocket** payment flows **without real merchant credentials** or actual money transfers. Perfect for development, testing, and demonstrations!

## ✨ Features

- 🧪 **Test Mode**: Full payment flow simulation
- 💳 **All Payment Methods**: bKash, Nagad, Rocket
- ✅ **Success/Failure Testing**: Test both scenarios
- 🔒 **Secure**: Uses same database and authentication
- 📊 **Transaction History**: Track all dummy transactions
- 🎨 **Beautiful UI**: Realistic payment gateway pages

---

## 🚀 Quick Start

### 1. **Toggle Test Mode**

In the Send Money page, you'll see a **Test Mode** toggle at the top:

- **ON** (Yellow/Amber): Dummy payments - no real money
- **OFF** (Gray): Real payments - requires merchant credentials

### 2. **Make a Dummy Payment**

1. Select a receiver
2. Enter amount
3. Choose payment method (bKash/Nagad/Rocket)
4. Click "Continue"
5. You'll be redirected to a dummy payment page
6. Enter any 5-digit PIN (e.g., 12345)
7. Click:
   - **"Pay Now"** to simulate successful payment
   - **"Cancel"** to simulate payment failure

### 3. **View Results**

After clicking, you'll be redirected to the callback page showing:
- ✅ Payment successful: Money transferred (within app balance)
- ❌ Payment failed: No money transferred

---

## 🛠️ API Endpoints

### Backend Routes

All dummy payment routes are prefixed with `/api/dummy-mobile-wallet`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/initiate` | Start a dummy payment |
| POST | `/complete` | Complete payment (success/fail) |
| GET | `/status/:transaction_id` | Get payment status |
| GET | `/history` | Get transaction history |

### Example: Initiate Payment

```javascript
POST http://localhost:5000/api/dummy-mobile-wallet/initiate
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiver_id": 123,
  "amount": 500,
  "payment_method": "bkash",
  "notes": "Test payment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dummy payment initialized",
  "data": {
    "transaction_id": 456,
    "payment_url": "http://localhost:5173/dummy-payment?transaction_id=456&method=bkash&amount=500&reference=BKASH17123456781234",
    "payment_reference": "BKASH17123456781234",
    "payment_method": "bkash",
    "amount": 500,
    "status": "pending",
    "isDummyMode": true
  }
}
```

### Example: Complete Payment

```javascript
POST http://localhost:5000/api/dummy-mobile-wallet/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "transaction_id": 456,
  "action": "success"  // or "failed"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Dummy payment completed successfully",
  "data": {
    "transaction_id": 456,
    "payment_reference": "BKASH17123456781234",
    "amount": 500,
    "payment_method": "bkash",
    "status": "completed",
    "sender_new_balance": 9500,
    "receiver_new_balance": 10500,
    "isDummyMode": true
  }
}
```

---

## 📁 File Structure

### Backend Files

```
BackEnd/
├── controllers/
│   └── dummyMobileWalletController.js   # Dummy payment logic
├── routes/
│   └── dummyMobileWalletRoutes.js       # API routes
└── server.js                             # Routes registered here
```

### Frontend Files

```
FrontEnd/src/components/Post/pages/
├── SendMoneyPage.jsx                # Send money with dummy mode toggle
├── DummyPaymentPage.jsx             # Dummy payment gateway UI
└── PaymentCallbackPage.jsx          # Payment result page
```

---

## 🎨 UI Components

### 1. **Test Mode Toggle**

Located at the top of Send Money page:
- Yellow badge when active
- Shows "Dummy payments - no real money transferred"
- Easy on/off switch

### 2. **Dummy Payment Gateway**

Realistic payment page with:
- Payment method branding (bKash/Nagad/Rocket)
- Amount and reference display
- PIN input (any 5 digits work)
- Success/Cancel buttons
- Clear "Test Mode" indicators

### 3. **Payment Callback**

Shows payment results:
- Success: Green checkmark, balance updated
- Failed: Red X, balance unchanged
- Transaction details
- Return to home button

---

## 🔄 Payment Flow

```
1. User clicks "Send Money"
   ↓
2. Toggle Test Mode ON
   ↓
3. Enter amount and select method
   ↓
4. Click "Continue"
   ↓
5. POST /api/dummy-mobile-wallet/initiate
   ↓
6. Redirect to /dummy-payment
   ↓
7. User enters PIN and clicks "Pay Now"
   ↓
8. POST /api/dummy-mobile-wallet/complete
   ↓
9. Update balances in database
   ↓
10. Redirect to /payment-callback
    ↓
11. Show success/failure result
```

---

## 💡 Use Cases

### Development Testing
- Test payment flows without merchant accounts
- Debug UI/UX issues
- Verify transaction logic

### Client Demos
- Show complete payment flow
- Demonstrate all payment methods
- No risk of real money

### Feature Development
- Build features before getting credentials
- Test error handling
- Validate user experience

---

## 🔐 Security Notes

1. **Same Authentication**: Uses JWT tokens like real payments
2. **Balance Checks**: Validates sender has sufficient balance
3. **Transaction Records**: All transactions saved to database
4. **No External Calls**: Everything happens locally

---

## 🆚 Dummy vs Real Mode

| Feature | Dummy Mode | Real Mode |
|---------|-----------|-----------|
| Money Transfer | ✅ App balance only | 💰 Real money via gateway |
| Merchant Account | ❌ Not required | ✅ Required |
| API Credentials | ❌ Not needed | ✅ Must configure |
| External Gateway | ❌ Internal simulation | ✅ Redirects to gateway |
| Transaction Fees | ❌ None | ✅ Gateway charges apply |
| Settlement | ⚡ Instant | ⏱️ T+1 or T+3 days |
| Testing | ✅ Perfect | ❌ Real money at risk |

---

## 🚦 When to Use Each Mode

### Use Dummy Mode When:
- ✅ Developing new features
- ✅ Testing payment flows
- ✅ Demonstrating to clients
- ✅ Don't have merchant credentials yet
- ✅ Training new team members

### Use Real Mode When:
- ✅ Production environment
- ✅ Have merchant credentials
- ✅ Need actual money transfers
- ✅ Processing real customer payments
- ✅ Live transactions required

---

## 📊 Transaction History

View all dummy transactions:

```javascript
GET http://localhost:5000/api/dummy-mobile-wallet/history?limit=20&offset=0
Authorization: Bearer <token>
```

Includes:
- Sender/receiver information
- Amount and payment method
- Status (pending/completed/failed)
- Timestamps
- Payment references

---

## 🔧 Configuration

### Enable/Disable Dummy Mode

In `SendMoneyPage.jsx`:

```javascript
const [isDummyMode, setIsDummyMode] = useState(true); // Default to dummy mode
```

Change `true` to `false` to default to real payments.

### Customize Payment Methods

In `SendMoneyPage.jsx`, modify the `paymentMethods` array to add/remove methods:

```javascript
const paymentMethods = [
  { id: 'bkash', name: 'bKash', logo: '...', color: '#E2136E' },
  { id: 'nagad', name: 'Nagad', logo: '...', color: '#EC1C24' },
  { id: 'rocket', name: 'Rocket', logo: '...', color: '#8B3090' }
];
```

---

## 🐛 Troubleshooting

### Payment Not Completing
- Check browser console for errors
- Verify backend server is running
- Ensure JWT token is valid

### Balance Not Updating
- Check database connection
- Verify transaction status in database
- Review backend logs

### UI Not Loading
- Clear browser cache
- Check React dev server
- Verify all routes are registered

---

## 📝 Database Schema

Dummy payments use the same `transactions` table:

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id),
  receiver_id INTEGER REFERENCES users(id),
  amount DECIMAL(10, 2),
  transaction_type VARCHAR(50),
  status VARCHAR(20),
  payment_method VARCHAR(20),  -- 'bkash', 'nagad', 'rocket'
  payment_reference TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  failure_reason TEXT
);
```

---

## 🎯 Next Steps

### To Move to Production:

1. **Get Merchant Credentials**:
   - bKash: https://developer.bka.sh/
   - Nagad: merchant@nagad.com.bd
   - Rocket: Visit DBBL branch

2. **Configure Environment**:
   ```env
   BKASH_APP_KEY=your_key
   BKASH_APP_SECRET=your_secret
   # ... etc
   ```

3. **Switch to Real Mode**:
   - Toggle off dummy mode
   - Test with small amounts first
   - Monitor transactions carefully

4. **Update Webhooks**:
   - Configure public webhook URLs
   - Test webhook callbacks
   - Verify signature validation

---

## 📞 Support

For issues or questions:
1. Check backend terminal for errors
2. Review browser console
3. Verify API endpoints are accessible
4. Check database for transaction records

---

## 🎉 Benefits

✅ **No Setup Required**: Works out of the box  
✅ **Full Feature Testing**: Complete payment flow  
✅ **Safe Development**: No financial risk  
✅ **Client Friendly**: Perfect for demos  
✅ **Team Training**: Easy onboarding  
✅ **Quick Iteration**: Fast development cycle  

---

Happy Testing! 🚀
