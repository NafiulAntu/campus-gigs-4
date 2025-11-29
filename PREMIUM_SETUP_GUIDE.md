# Premium & Payment System Setup Guide

## 🎯 Overview
Complete premium subscription system with SSLCommerz payment gateway integration for Campus Gigs.

---

## 📋 Prerequisites

1. **SSLCommerz Account**
   - Register at https://developer.sslcommerz.com/
   - Get Store ID and Store Password
   - Start with Sandbox for testing

2. **Database Access**
   - PostgreSQL 12+
   - Admin access to run migrations

3. **Node.js Packages**
   - Already installed: `sslcommerz-lts`, `uuid`

---

## 🚀 Setup Steps

### 1. Run Database Migration

Connect to your PostgreSQL database and run the migration:

```bash
psql -U postgres -d "PG Antu" -f BackEnd/migrations/create_premium_system.sql
```

Or manually copy-paste the SQL from `BackEnd/migrations/create_premium_system.sql` into your database tool.

**This will create:**
- `subscriptions` table
- `payment_transactions` table
- Add `is_premium` and `premium_expires_at` columns to `users` table
- Create indexes for performance
- Create `active_premium_users` view

### 2. Configure Environment Variables

Update `BackEnd/.env` with your SSLCommerz credentials:

```env
# Backend URL (for SSLCommerz callbacks)
BACKEND_URL=http://localhost:5000

# SSLCommerz Configuration
SSLCOMMERZ_STORE_ID=your_store_id_here
SSLCOMMERZ_STORE_PASSWORD=your_store_password_here
SSLCOMMERZ_MODE=sandbox  # Use 'live' for production
```

**To get SSLCommerz credentials:**
1. Go to https://developer.sslcommerz.com/registration/
2. Register your store
3. Verify your business details
4. Get Sandbox credentials immediately
5. Get Live credentials after business verification (1-2 weeks)

### 3. Update Server Routes (Already Done ✓)

The following have been added to `server.js`:
```javascript
const paymentRoutes = require('./routes/paymentRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

app.use('/api/payments', paymentRoutes);
app.use('/api/subscription', subscriptionRoutes);
```

### 4. Frontend Routes (Already Done ✓)

Added to `App.jsx`:
- `/premium` - Premium subscription page
- `/payment/success` - Payment success page
- `/payment/failed` - Payment failure page
- `/payment/cancelled` - Payment cancelled page

---

## 💰 Pricing Configuration

Current prices (can be changed in `BackEnd/controllers/paymentController.js`):

```javascript
const PRICING = {
  monthly: 299,   // ৳299/month
  yearly: 2999    // ৳2,999/year (17% discount)
};
```

---

## 🔧 API Endpoints

### Payment Endpoints

**Initiate Payment** (Protected)
```
POST /api/payments/initiate
Body: { "plan_type": "monthly" | "yearly" }
Returns: { "gateway_url": "https://sandbox.sslcommerz.com/..." }
```

**Callbacks** (Public - SSLCommerz calls these)
```
POST /api/payments/success
POST /api/payments/fail
POST /api/payments/cancel
POST /api/payments/ipn
```

**Transaction History** (Protected)
```
GET /api/payments/history
GET /api/payments/transaction/:transactionId
```

### Subscription Endpoints

**Get Status** (Protected)
```
GET /api/subscription/status
Returns: {
  "is_premium": true,
  "subscription": {
    "plan_type": "monthly",
    "end_date": "2025-12-29",
    "days_remaining": 30
  }
}
```

**Cancel Subscription** (Protected)
```
POST /api/subscription/cancel
```

**Reactivate Subscription** (Protected)
```
POST /api/subscription/reactivate
```

**Quick Premium Check** (Protected)
```
GET /api/subscription/check
Returns: { "is_premium": true }
```

---

## 🔒 Using Premium Middleware

Protect routes that require premium:

```javascript
const { requirePremium } = require('../middleware/premiumMiddleware');

// Example: Premium-only post creation with unlimited posts
router.post('/posts/create', authenticateToken, requirePremium, postController.create);
```

Or add premium status to request without blocking:

```javascript
const { checkPremium } = require('../middleware/premiumMiddleware');

router.get('/posts', authenticateToken, checkPremium, (req, res) => {
  if (req.isPremium) {
    // Show premium features
  }
});
```

---

## 🎨 Frontend Integration

### 1. Add Premium Badge to User Profiles

```jsx
import PremiumBadge from './components/Post/PremiumBadge';

// In your profile component
{user.is_premium && <PremiumBadge size="medium" />}
```

### 2. Add Premium Link to Sidebar

Update `Sidebar.jsx`:

```jsx
import { Link } from 'react-router-dom';

// Add to navigation
<Link to="/premium" className="nav-item">
  <span className="icon">⭐</span>
  <span>Premium</span>
</Link>
```

### 3. Check Premium Status on Load

```jsx
useEffect(() => {
  const checkPremium = async () => {
    try {
      const response = await api.get('/subscription/status');
      setIsPremium(response.data.is_premium);
    } catch (err) {
      console.error('Failed to check premium:', err);
    }
  };
  checkPremium();
}, []);
```

### 4. Feature Gates

Show upgrade prompts for premium features:

```jsx
const handleUnlimitedPost = () => {
  if (!isPremium && postCount >= 5) {
    alert('Upgrade to Premium for unlimited posts!');
    navigate('/premium');
    return;
  }
  // Continue with post creation
};
```

---

## ⏰ Cron Job for Expiring Subscriptions

Set up a cron job to automatically expire subscriptions daily.

### Option 1: Node-Cron (Recommended)

Install node-cron:
```bash
cd BackEnd
npm install node-cron
```

Add to `server.js`:

```javascript
const cron = require('node-cron');
const { expireSubscriptions } = require('./controllers/subscriptionController');

// Run every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running subscription expiration check...');
  await expireSubscriptions();
});
```

### Option 2: System Cron (Linux/Mac)

Create a script `BackEnd/scripts/expireSubscriptions.js`:

```javascript
require('dotenv').config();
const { expireSubscriptions } = require('../controllers/subscriptionController');

expireSubscriptions()
  .then(() => {
    console.log('Subscription expiration completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
```

Add to crontab:
```bash
crontab -e
# Add this line (runs daily at 2 AM)
0 2 * * * cd /path/to/BackEnd && node scripts/expireSubscriptions.js
```

### Option 3: Windows Task Scheduler

1. Create `expireSubscriptions.bat`:
```batch
@echo off
cd C:\path\to\BackEnd
node scripts/expireSubscriptions.js
```

2. Open Task Scheduler
3. Create Basic Task
4. Set trigger to Daily at 2:00 AM
5. Action: Start a program → Select your .bat file

---

## 🧪 Testing

### Test with SSLCommerz Sandbox

**Test Card Numbers:**
```
Success: 4111 1111 1111 1111
Fail: 4111 1111 1111 1234
```

**Test bKash/Nagad:**
- Use sandbox credentials provided by SSLCommerz

### Manual Testing Flow

1. **Create Account & Login**
2. **Go to Premium Page** (`/premium`)
3. **Click "Upgrade Monthly"**
4. **SSLCommerz Gateway Opens**
5. **Choose Payment Method** (bKash/Card/etc.)
6. **Complete Payment**
7. **Redirected to Success Page**
8. **Check Subscription Status**

### API Testing with cURL

```bash
# Get subscription status
curl -X GET http://localhost:5000/api/subscription/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Initiate payment
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan_type": "monthly"}'
```

---

## 🔍 Monitoring & Debugging

### Check Active Premium Users

```sql
SELECT * FROM active_premium_users;
```

### Check Payment Transactions

```sql
SELECT 
  pt.transaction_id,
  pt.amount,
  pt.status,
  pt.payment_method,
  u.username,
  pt.created_at
FROM payment_transactions pt
JOIN users u ON pt.user_id = u.id
ORDER BY pt.created_at DESC
LIMIT 20;
```

### Debug Logs

Backend logs payment flow:
- Payment initiation
- SSLCommerz responses
- Transaction updates
- Subscription creation

Check console for errors.

---

## 🚨 Common Issues

### Issue 1: Port Already in Use
**Solution:** Kill the process or change PORT in `.env`

### Issue 2: SSLCommerz Returns "Invalid Store"
**Solution:** Double-check STORE_ID and STORE_PASSWORD in `.env`

### Issue 3: Payment Success but Subscription Not Created
**Solution:** Check backend logs, ensure database transaction committed

### Issue 4: Premium Badge Not Showing
**Solution:** Ensure `is_premium` flag is updated in users table

### Issue 5: Callback URLs Not Working
**Solution:** 
- For local testing, use ngrok: `ngrok http 5000`
- Update BACKEND_URL in `.env` to ngrok URL
- Update callback URLs in SSLCommerz dashboard

---

## 🌐 Production Deployment

### Before Going Live:

1. **Update .env:**
```env
SSLCOMMERZ_MODE=live
SSLCOMMERZ_STORE_ID=your_live_store_id
SSLCOMMERZ_STORE_PASSWORD=your_live_password
BACKEND_URL=https://your-domain.com
FRONTEND_URL=https://your-frontend.com
```

2. **SSL Certificate:**
   - Ensure your backend has valid SSL (https://)
   - SSLCommerz requires HTTPS callbacks in production

3. **Test Thoroughly:**
   - Test all payment methods (bKash, Nagad, Cards)
   - Test success/fail/cancel flows
   - Test subscription expiration
   - Test auto-renewal

4. **Set Up Monitoring:**
   - Monitor failed payments
   - Track subscription churn
   - Set up alerts for payment gateway errors

5. **Backup Database:**
   - Regular backups of subscriptions and transactions tables
   - Test restore procedures

---

## 📊 Analytics & Metrics

Track these metrics:

1. **Conversion Rate:** Free → Premium
2. **Monthly Recurring Revenue (MRR)**
3. **Churn Rate:** Cancelled subscriptions
4. **Payment Success Rate**
5. **Popular Payment Methods**
6. **Average Revenue Per User (ARPU)**

Query for MRR:
```sql
SELECT 
  SUM(CASE 
    WHEN plan_type = 'monthly' THEN 299 
    WHEN plan_type = 'yearly' THEN 2999/12 
  END) as mrr
FROM subscriptions
WHERE status = 'active';
```

---

## 🎉 You're All Set!

Your premium & payment system is ready. Test thoroughly in sandbox before going live.

**Need help?**
- SSLCommerz Docs: https://developer.sslcommerz.com/
- SSLCommerz Support: integration@sslcommerz.com

**Next Steps:**
1. Run the database migration
2. Configure SSLCommerz credentials
3. Test payment flow in sandbox
4. Add premium badge to user profiles
5. Implement feature gates for premium content
6. Set up cron job for expiring subscriptions
7. Go live! 🚀
