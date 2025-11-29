# 💳 Payment & Subscription Flow Diagrams

## 1. Payment Initiation Flow

```
┌─────────────┐
│   User      │
│  (Frontend) │
└──────┬──────┘
       │
       │ 1. Clicks "Upgrade to Premium"
       │
       ▼
┌─────────────────────────────────────────────────┐
│  Premium.jsx                                     │
│  - Shows pricing cards                          │
│  - Monthly: ৳299  Yearly: ৳2,999                │
└──────┬──────────────────────────────────────────┘
       │
       │ 2. POST /api/payments/initiate
       │    { plan_type: "monthly" }
       │
       ▼
┌─────────────────────────────────────────────────┐
│  paymentController.js                           │
│  - Validate plan                                │
│  - Check existing subscription                  │
│  - Generate unique transaction_id               │
│  - Create pending transaction in DB             │
│  - Call SSLCommerz API                          │
└──────┬──────────────────────────────────────────┘
       │
       │ 3. Returns gateway_url
       │
       ▼
┌─────────────────────────────────────────────────┐
│  SSLCommerz Payment Gateway                     │
│  - User selects payment method                  │
│  - bKash / Nagad / Rocket / Card                │
│  - Completes payment                            │
└──────┬──────────────────────────────────────────┘
       │
       └─────────────┐
                     │
         ┌───────────┴──────────┬──────────────┐
         │                      │              │
    [SUCCESS]              [FAILED]       [CANCELLED]
         │                      │              │
         ▼                      ▼              ▼
    success URL            fail URL       cancel URL
```

---

## 2. Payment Success Flow (Detailed)

```
┌─────────────────────────────────────────────────┐
│  SSLCommerz Callback                            │
│  POST /api/payments/success                     │
│  { tran_id, val_id, amount, card_type, ... }   │
└──────┬──────────────────────────────────────────┘
       │
       │ 1. Receive callback
       │
       ▼
┌─────────────────────────────────────────────────┐
│  paymentController.paymentSuccess()             │
│  Step 1: Validate with SSLCommerz              │
└──────┬──────────────────────────────────────────┘
       │
       │ sslcz.validate({ val_id })
       │
       ▼
       ✓ VALID / VALIDATED
       │
       ▼
┌─────────────────────────────────────────────────┐
│  BEGIN DATABASE TRANSACTION                     │
│                                                 │
│  Step 2: Update payment_transactions           │
│  - status = 'success'                          │
│  - payment_method = 'bKash' (or other)        │
│  - gateway_response = { ... }                  │
│                                                 │
│  Step 3: Calculate dates                       │
│  - start_date = NOW()                          │
│  - end_date = NOW() + 1 month/year            │
│                                                 │
│  Step 4: Cancel old subscriptions              │
│  - UPDATE subscriptions                         │
│  - SET status = 'cancelled'                    │
│  - WHERE user_id AND status = 'active'         │
│                                                 │
│  Step 5: Create new subscription               │
│  - INSERT INTO subscriptions                    │
│  - status = 'active'                           │
│  - plan_type, start_date, end_date             │
│                                                 │
│  Step 6: Link transaction to subscription      │
│  - UPDATE payment_transactions                  │
│  - SET subscription_id                         │
│                                                 │
│  Step 7: Update user premium flag              │
│  - UPDATE users                                 │
│  - SET is_premium = true                       │
│  - SET premium_expires_at = end_date           │
│                                                 │
│  Step 8: Register after-commit hook            │
│  - t.afterCommit(() => { emit notification })  │
│                                                 │
│  COMMIT                                         │
└──────┬──────────────────────────────────────────┘
       │
       │ After commit
       │
       ▼
┌─────────────────────────────────────────────────┐
│  simpleNotificationHelpers.createNotification() │
│  - Create notification record                   │
│  - Emit Socket.io event to user_{pgUserId}     │
│  - User sees "Welcome to Premium!" notification│
└──────┬──────────────────────────────────────────┘
       │
       │ Redirect user to success page
       │
       ▼
┌─────────────────────────────────────────────────┐
│  /payment/success?transaction=CGIGS-xxxxx      │
│  PaymentSuccess component                       │
│  - Shows success icon                           │
│  - Transaction details                          │
│  - Features unlocked                            │
│  - Buttons: View Subscription / Go to Home     │
└─────────────────────────────────────────────────┘
```

---

## 3. Subscription Check Flow

```
┌─────────────┐
│   Component │ (Profile, Post Creation, etc.)
└──────┬──────┘
       │
       │ GET /api/subscription/status
       │
       ▼
┌─────────────────────────────────────────────────┐
│  subscriptionController.getSubscriptionStatus() │
│                                                 │
│  1. Find latest subscription for user          │
│  2. Check if active and not expired            │
│  3. Calculate days remaining                   │
└──────┬──────────────────────────────────────────┘
       │
       │ Returns
       │
       ▼
{
  "is_premium": true,
  "subscription": {
    "id": 123,
    "plan_type": "monthly",
    "status": "active",
    "start_date": "2025-11-29",
    "end_date": "2025-12-29",
    "auto_renew": true,
    "days_remaining": 30
  }
}
       │
       │ Component uses this data
       │
       ▼
┌─────────────────────────────────────────────────┐
│  UI Updates                                     │
│  - Show/hide premium badge                      │
│  - Enable/disable premium features              │
│  - Show subscription status                     │
└─────────────────────────────────────────────────┘
```

---

## 4. Feature Gate Flow (requirePremium Middleware)

```
┌─────────────┐
│   Request   │
│  POST /api/posts/unlimited
└──────┬──────┘
       │
       │ JWT Token
       │
       ▼
┌─────────────────────────────────────────────────┐
│  authenticateToken middleware                   │
│  - Verify JWT                                   │
│  - Set req.user                                 │
└──────┬──────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│  requirePremium middleware                      │
│                                                 │
│  1. Get user from database                      │
│  2. Quick check: users.is_premium               │
│  3. Verify: premium_expires_at > NOW()         │
└──────┬──────────────────────────────────────────┘
       │
       ├─── is_premium = true ──────────────┐
       │                                     │
       │                                     ▼
       │                              ┌─────────────┐
       │                              │  next()     │
       │                              │  Continue   │
       │                              └─────────────┘
       │
       └─── is_premium = false ────────────┐
                                            │
                                            ▼
                                   ┌─────────────────┐
                                   │  403 Forbidden  │
                                   │  {              │
                                   │    error: "Premium required",
                                   │    upgrade_url: "/premium"
                                   │  }              │
                                   └─────────────────┘
```

---

## 5. Subscription Expiration Flow (Cron Job)

```
┌─────────────────────────────────────────────────┐
│  Cron Job (Daily at 2 AM)                      │
│  node-cron: '0 2 * * *'                        │
└──────┬──────────────────────────────────────────┘
       │
       │ Triggers
       │
       ▼
┌─────────────────────────────────────────────────┐
│  subscriptionController.expireSubscriptions()   │
│                                                 │
│  BEGIN TRANSACTION                              │
│                                                 │
│  Step 1: Find expired subscriptions            │
│  SELECT * FROM subscriptions                    │
│  WHERE status = 'active'                       │
│  AND end_date < NOW()                          │
│                                                 │
│  Step 2: Update subscriptions                  │
│  UPDATE subscriptions                           │
│  SET status = 'expired'                        │
│  WHERE id IN (expired_ids)                     │
│                                                 │
│  Step 3: Update user premium flags             │
│  UPDATE users                                   │
│  SET is_premium = false,                       │
│      premium_expires_at = NULL                 │
│  WHERE id IN (user_ids)                        │
│                                                 │
│  Step 4: Register after-commit hook            │
│  - Send expiration notifications               │
│                                                 │
│  COMMIT                                         │
└──────┬──────────────────────────────────────────┘
       │
       │ After commit
       │
       ▼
┌─────────────────────────────────────────────────┐
│  For each expired subscription:                 │
│  - createNotification()                         │
│  - "Your premium has expired. Renew now!"      │
│  - Emit Socket.io event                        │
└─────────────────────────────────────────────────┘
```

---

## 6. Cancel Subscription Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ Clicks "Turn Off Auto-Renewal"
       │
       ▼
┌─────────────────────────────────────────────────┐
│  Premium.jsx                                     │
│  - Shows confirmation dialog                    │
└──────┬──────────────────────────────────────────┘
       │
       │ User confirms
       │
       │ POST /api/subscription/cancel
       │
       ▼
┌─────────────────────────────────────────────────┐
│  subscriptionController.cancelSubscription()    │
│                                                 │
│  BEGIN TRANSACTION                              │
│                                                 │
│  1. Find active subscription                    │
│  2. UPDATE subscriptions                        │
│     SET auto_renew = false                     │
│                                                 │
│  3. After commit:                              │
│     - Send notification                         │
│     - "Auto-renewal cancelled. Premium until..." │
│                                                 │
│  COMMIT                                         │
└──────┬──────────────────────────────────────────┘
       │
       │ Returns success
       │
       ▼
┌─────────────────────────────────────────────────┐
│  UI Updates                                     │
│  - Show "Auto-Renewal: Disabled"               │
│  - Show end date                                │
│  - Button: "Turn On Auto-Renewal"              │
└─────────────────────────────────────────────────┘

Note: User keeps premium access until end_date
```

---

## 7. Database Transaction Pattern

All critical operations use this pattern for data integrity:

```javascript
await sequelize.transaction(async (t) => {
  // Step 1: Database writes
  await PaymentTransaction.update(..., { transaction: t });
  await Subscription.create(..., { transaction: t });
  await User.update(..., { transaction: t });

  // Step 2: Register after-commit hook
  t.afterCommit(async () => {
    // External operations (Socket.io, notifications)
    // Only run if transaction commits successfully
    io.to(`user_${userId}`).emit('notification:new', data);
  });

  // If any error occurs, entire transaction rolls back
  // after-commit hooks won't run
});
```

**Benefits:**
- ✅ Atomicity: All or nothing
- ✅ Consistency: No partial updates
- ✅ No ghost events: Socket emits only after DB commit
- ✅ Automatic rollback on errors

---

## 8. Payment Method Flow (User Perspective)

```
User on /premium page
       │
       │ Clicks "Upgrade"
       │
       ▼
SSLCommerz Gateway Opens
       │
       ├──────┬──────┬──────┬──────┬──────┐
       │      │      │      │      │      │
    bKash  Nagad Rocket  Card  Bank  Other
       │      │      │      │      │      │
       └──────┴──────┴──────┴──────┴──────┘
                     │
                     │ User selects method
                     │
                     ▼
         ┌───────────────────────┐
         │  Payment Provider UI  │
         │  - Enter credentials  │
         │  - Confirm payment    │
         └───────────┬───────────┘
                     │
                     ▼
              Payment Processing
                     │
         ┌───────────┼───────────┐
         │           │           │
    [SUCCESS]   [FAILED]   [CANCELLED]
         │           │           │
         ▼           ▼           ▼
   /payment/   /payment/   /payment/
    success      failed     cancelled
```

---

## 9. Real-time Notification Flow

```
Backend                          Socket.io                Frontend
   │                                │                        │
   │ Payment success                │                        │
   │ ──────────────────────────────▶│                        │
   │ io.to('user_123').emit(        │                        │
   │   'notification:new',          │                        │
   │   { content: "Welcome..." }    │                        │
   │ )                              │                        │
   │                                │   Notification event   │
   │                                │ ──────────────────────▶│
   │                                │                        │ useSocket hook
   │                                │                        │ receives event
   │                                │                        │
   │                                │                        │ Update state
   │                                │                        │ Show notification
   │                                │                        │ Increment badge
   │                                │                        │
```

---

## 10. Complete User Journey

```
1. User Registration/Login
   └─▶ JWT token received

2. Browse Platform (Free)
   ├─▶ Create posts (limited to 5/month)
   ├─▶ Basic messaging
   └─▶ See "Upgrade to Premium" prompts

3. Click "Upgrade"
   └─▶ /premium page
       ├─▶ See pricing (৳299/month or ৳2,999/year)
       └─▶ Click plan

4. Payment Gateway
   ├─▶ Choose method (bKash, etc.)
   ├─▶ Complete payment
   └─▶ Redirected back

5. Success!
   ├─▶ Subscription created
   ├─▶ Premium badge added
   ├─▶ Notification sent
   └─▶ Unlimited access granted

6. Using Premium
   ├─▶ Unlimited posts
   ├─▶ Priority placement
   ├─▶ Advanced analytics
   └─▶ Premium badge visible

7. Subscription Management
   ├─▶ View status at /premium
   ├─▶ Cancel auto-renewal (keeps premium until end)
   └─▶ Reactivate auto-renewal

8. Expiration
   ├─▶ Cron job runs daily
   ├─▶ Expired subscriptions marked
   ├─▶ Premium flag removed
   ├─▶ Notification sent
   └─▶ User prompted to renew
```

---

## 11. Error Handling Flow

```
Any step in payment flow
       │
       │ Error occurs
       │
       ▼
┌─────────────────────────────────────────────────┐
│  Error Handler                                  │
│                                                 │
│  Database transaction?                          │
│  ├─ Yes: Automatic ROLLBACK                    │
│  │         All changes reverted                 │
│  │         No partial updates                   │
│  │                                              │
│  └─ No: Log error                               │
│                                                 │
│  Return error response to frontend             │
└──────┬──────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│  Frontend                                       │
│  - Show error message                           │
│  - Suggest retry                                │
│  - Log for debugging                            │
└─────────────────────────────────────────────────┘
```

---

## Summary of Key Flows

1. **Payment Initiation**: User → Backend → SSLCommerz
2. **Payment Success**: SSLCommerz → Backend → DB Transaction → Notification → User
3. **Subscription Check**: Frontend → Backend → Quick check (denormalized) → Response
4. **Feature Gate**: Request → Auth → Premium Check → Allow/Deny
5. **Expiration**: Cron → Find Expired → Update DB → Notify Users
6. **Cancellation**: User → Backend → Update auto_renew → Notify

All flows use:
- ✅ Database transactions for atomicity
- ✅ After-commit hooks for external operations
- ✅ JWT authentication for security
- ✅ Real-time Socket.io notifications
- ✅ Proper error handling
