# Stripe Payment Integration Guide

## 🎉 FREE Forever Testing Mode!

Stripe is the **best choice** for your payment gateway:
- ✅ 100% FREE test mode (never expires)
- ✅ No registration fees
- ✅ Works in Bangladesh + Internationally
- ✅ Instant setup (5 minutes)
- ✅ Better than SSLCommerz

---

## Quick Start (5 Minutes)

### Step 1: Get FREE Test Keys

1. Visit: https://dashboard.stripe.com/register
2. Sign up with your email (no documents needed)
3. Skip business verification (it's optional for testing)
4. Go to: https://dashboard.stripe.com/test/apikeys
5. Copy your keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### Step 2: Add to `.env`

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51Xxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51Xxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxx
PAYMENT_GATEWAY=stripe
```

### Step 3: Add Route to server.js

```javascript
// Add this line in server.js
app.use('/api/stripe', require('./routes/stripeRoutes'));
```

### Step 4: Test Cards (FREE)

Use these test card numbers:

| Card Number | Result | Description |
|-------------|--------|-------------|
| 4242 4242 4242 4242 | ✅ Success | Visa card |
| 4000 0000 0000 0002 | ❌ Declined | Generic decline |
| 4000 0000 0000 9995 | ❌ Failed | Insufficient funds |
| 4000 0025 0000 3155 | ⏳ 3D Secure | Requires authentication |

**For ALL test cards:**
- CVV: Any 3 digits (e.g., 123)
- Expiry: Any future date (e.g., 12/25)
- ZIP: Any 5 digits (e.g., 12345)

---

## Features

### ✨ What You Get:

1. **Multiple Payment Methods**
   - Credit/Debit Cards (Visa, Mastercard, Amex)
   - Digital Wallets (Apple Pay, Google Pay)
   - Buy Now Pay Later
   - Bank Transfers

2. **Security**
   - PCI Compliant (Stripe handles it)
   - 3D Secure authentication
   - Fraud detection built-in
   - No sensitive data on your server

3. **Real-time Updates**
   - Webhook notifications
   - Instant payment confirmation
   - Automatic subscription activation

4. **Dashboard**
   - View all transactions
   - Download reports
   - Refund management
   - Customer analytics

---

## API Endpoints

### Create Checkout Session
```javascript
POST /api/stripe/create-checkout-session
Authorization: Bearer <token>

Body:
{
  "plan_type": "15days" | "30days" | "yearly"
}

Response:
{
  "success": true,
  "sessionId": "cs_test_xxx",
  "url": "https://checkout.stripe.com/pay/cs_test_xxx"
}
```

### Webhook (Stripe calls this)
```javascript
POST /api/stripe/webhook
```

### Verify Session
```javascript
GET /api/stripe/verify-session?session_id=cs_test_xxx
```

---

## Frontend Integration

### Update Premium Component:

```javascript
import { createStripeCheckout } from '../../../services/api';

const handleSubscribe = async (planType) => {
  try {
    const response = await createStripeCheckout({ plan_type: planType });
    
    if (response.data.success) {
      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    }
  } catch (error) {
    console.error('Payment error:', error);
  }
};
```

### Add to api.js:

```javascript
// Stripe payments
export const createStripeCheckout = (data) => API.post('/stripe/create-checkout-session', data);
export const verifyStripeSession = (sessionId) => API.get(`/stripe/verify-session?session_id=${sessionId}`);
```

---

## Pricing

### Test Mode (Current):
- **Cost**: $0 forever
- **Features**: All features available
- **Limits**: Unlimited transactions
- **Cards**: Test cards only

### Production Mode:
- **Setup Fee**: $0
- **Transaction Fee**: 2.9% + $0.30 per successful charge
- **Monthly Fee**: $0
- **Payout**: 2-7 days to Bangladesh bank

---

## Go Live (When Ready)

1. **Complete Account Setup**
   - Add business details
   - Verify identity (NID/Passport)
   - Add bank account for payouts

2. **Switch to Live Mode**
   - Get live API keys from: https://dashboard.stripe.com/apikeys
   - Update `.env` with live keys
   - Test with real card (small amount)

3. **Enable in Bangladesh**
   - Stripe supports Bangladesh bank payouts
   - Currency: BDT, USD, EUR, etc.
   - Settlement time: 2-7 days

---

## Webhooks Setup (Important)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter: `https://yourdomain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
5. Copy webhook secret to `.env`

---

## Advantages Over SSLCommerz

| Feature | Stripe | SSLCommerz |
|---------|--------|------------|
| Test Mode | FREE Forever | Time-limited sandbox |
| Setup Time | 5 minutes | 3-5 days approval |
| Documentation | Excellent | Limited |
| Test Cards | Provided | Need to request |
| International | Yes | Bangladesh only |
| Mobile SDKs | Yes | Limited |
| Dashboard | Modern UI | Basic |
| Support | 24/7 Chat | Email only |

---

## Troubleshooting

### Error: "No such customer"
- This is normal in test mode
- Customer is created automatically

### Error: "Invalid API key"
- Check if you're using test key (starts with `sk_test_`)
- Don't use live key in test mode

### Webhook not working
- Make sure URL is publicly accessible
- Use ngrok for local testing: `ngrok http 5000`
- Add ngrok URL to Stripe dashboard

---

## Support

- **Stripe Docs**: https://stripe.com/docs
- **API Reference**: https://stripe.com/docs/api
- **Dashboard**: https://dashboard.stripe.com/
- **Support Chat**: Available in dashboard

---

## Next Steps

1. ✅ Install Stripe: `npm install stripe` (DONE)
2. ✅ Add controllers (DONE)
3. ✅ Add routes (DONE)
4. ⏳ Add route to server.js
5. ⏳ Update Premium component
6. ⏳ Test with test cards
7. ⏳ Setup webhooks

**You're almost ready to accept payments!** 🎉
