# Stripe Integration Testing Checklist

## 🎯 Pre-Launch Testing Requirements

### Environment Setup
- [ ] **Stripe Test Keys Configured**
  - `STRIPE_SECRET_KEY=sk_test_...`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
  - `STRIPE_WEBHOOK_SECRET=whsec_...`

- [ ] **Price IDs Set Up**
  - `STRIPE_PRICE_ID_PROFESSIONAL` (Agency Starter - $29)
  - `STRIPE_PRICE_ID_ENTERPRISE` (Agency Growth - $49)

### 1. Subscription Creation Flow ✅
**Test Steps:**
1. Sign up for new account
2. Navigate to `/pricing`
3. Click "Start Free Trial" for Agency Starter
4. Complete Stripe Checkout flow
5. Verify redirect to dashboard with success message

**Expected Results:**
- [ ] Checkout session creates successfully
- [ ] User is redirected to Stripe Checkout
- [ ] Payment form displays correct amount ($29)
- [ ] After payment, user returns to app
- [ ] Subscription confirmation email sent
- [ ] User plan updated in database

### 2. Webhook Handling ✅
**Test using Stripe CLI:**
```bash
# Listen to webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

**Expected Results:**
- [ ] Webhook endpoint responds with 200 status
- [ ] `checkout.session.completed` updates user metadata
- [ ] `customer.subscription.created` sets subscription ID
- [ ] `customer.subscription.updated` updates plan/status
- [ ] `invoice.payment_succeeded` logs success
- [ ] `invoice.payment_failed` marks account as past_due

### 3. Billing Page Functionality ✅
**Test Steps:**
1. Login as subscribed user
2. Navigate to `/billing`
3. Verify current plan displays correctly
4. Click "Manage Subscription" (opens Stripe Portal)
5. Test upgrade/downgrade in portal
6. Return to app and verify changes

**Expected Results:**
- [ ] Current subscription status shown correctly
- [ ] Plan name and price displayed
- [ ] Next billing date shown
- [ ] Stripe Portal opens successfully
- [ ] Changes in portal reflect in app
- [ ] Payment method management works

### 4. Subscription Upgrades/Downgrades ✅
**Test Scenarios:**
- Free → Agency Starter ($29)
- Free → Agency Growth ($49)
- Agency Starter → Agency Growth (upgrade)
- Agency Growth → Agency Starter (downgrade)
- Any Plan → Canceled

**Expected Results:**
- [ ] Proration calculated correctly
- [ ] Plan change reflects immediately
- [ ] Email notification sent
- [ ] Access to features updated
- [ ] Next billing amount adjusted

### 5. Payment Failure Scenarios ✅
**Test with Stripe Test Cards:**
```javascript
// Declined card
4000000000000002

// Insufficient funds
4000000000009995

// Requires authentication
4000002500003155
```

**Expected Results:**
- [ ] Payment failure shows proper error message
- [ ] Account marked as past_due
- [ ] User retains access during grace period
- [ ] Retry payment options available
- [ ] Account suspended after multiple failures

### 6. Edge Cases & Error Handling ✅
**Test Scenarios:**
- [ ] User tries to subscribe twice
- [ ] Webhook arrives before checkout completes
- [ ] Stripe is temporarily unavailable
- [ ] Invalid webhook signature
- [ ] Missing environment variables
- [ ] Customer already exists in Stripe

### 7. Production Readiness Checklist
**Before Going Live:**
- [ ] Switch to Stripe live keys
- [ ] Update webhook endpoint URL
- [ ] Configure webhook retry settings
- [ ] Set up monitoring for failed webhooks
- [ ] Test with real payment methods
- [ ] Verify tax calculation (if applicable)
- [ ] Enable 3D Secure for European customers

## 🧪 Automated Testing

Run the automated test suite:
```bash
# Set up environment variables
export STRIPE_SECRET_KEY=sk_test_your_key
export STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Run tests
node scripts/test-stripe.js
```

## 🔧 Useful Stripe CLI Commands

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe account
stripe login

# Test webhook delivery
stripe webhooks create \
  --url https://your-domain.com/api/webhooks/stripe \
  --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed

# Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test webhook events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated

# View recent events
stripe events list --limit 10

# Get webhook endpoint secret
stripe webhook_endpoints list
```

## 📊 Key Metrics to Monitor

1. **Checkout Conversion Rate** - % of users who complete payment
2. **Webhook Success Rate** - % of webhooks processed successfully
3. **Payment Failure Rate** - % of failed transactions
4. **Subscription Churn** - % of canceled subscriptions
5. **Revenue Recovery** - Success rate of failed payment retries

## 🚨 Troubleshooting Common Issues

### Webhook Not Firing
1. Check webhook endpoint URL
2. Verify webhook secret
3. Check Stripe dashboard for delivery attempts
4. Ensure endpoint returns 200 status

### Payment Not Completing
1. Verify Stripe keys are correct
2. Check for JavaScript errors in browser
3. Confirm price IDs exist in Stripe
4. Test with different payment methods

### User Plan Not Updating
1. Check webhook handling logic
2. Verify user metadata updates
3. Confirm database connection
4. Check for race conditions

### Email Notifications Not Sending
1. Verify Resend API key
2. Check email templates
3. Confirm user email address
4. Check spam folder

## 📝 Launch Day Checklist

**Final Steps Before Launch:**
- [ ] Switch to Stripe live mode
- [ ] Update all webhook URLs to production
- [ ] Test with real payment methods
- [ ] Monitor webhook delivery
- [ ] Set up error alerting
- [ ] Prepare customer support for billing questions
- [ ] Document refund/cancellation process