# Payment Flow Testing Guide

## Overview

TrackFlow uses Stripe for subscription billing. This guide covers comprehensive testing of payment flows from signup to cancellation.

## 1. Test Environment Setup

### Stripe Test Mode Configuration
```bash
# Test Environment Variables
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-test-publishable-key
STRIPE_SECRET_KEY=sk_test_your-test-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-test-webhook-secret

# Test Price IDs (create these in Stripe Dashboard)
STRIPE_PRICE_ID_FREELANCER=price_test_freelancer_monthly
STRIPE_PRICE_ID_PROFESSIONAL=price_test_professional_monthly
STRIPE_PRICE_ID_ENTERPRISE=price_test_enterprise_monthly
```

### Stripe Test Products Setup
1. Go to Stripe Dashboard → Products
2. Create test products:

```javascript
// Freelancer Plan
{
  name: "Freelancer",
  description: "Perfect for solo marketers",
  pricing: {
    amount: 1500, // $15.00
    currency: "usd",
    interval: "month"
  }
}

// Professional Plan (Agency Starter)
{
  name: "Professional",
  description: "For growing agencies",
  pricing: {
    amount: 2900, // $29.00
    currency: "usd",
    interval: "month"
  }
}

// Enterprise Plan
{
  name: "Enterprise",
  description: "For large agencies",
  pricing: {
    amount: 9900, // $99.00
    currency: "usd",
    interval: "month"
  }
}
```

## 2. Test Card Numbers

### Successful Payments
```bash
# Visa
4242424242424242

# Visa (debit)
4000056655665556

# Mastercard
5555555555554444

# American Express
378282246310005

# Discover
6011111111111117
```

### Failed Payments
```bash
# Card declined
4000000000000002

# Insufficient funds
4000000000009995

# Expired card
4000000000000069

# Incorrect CVC
4000000000000127

# Processing error
4000000000000119
```

### 3D Secure Cards
```bash
# Requires authentication
4000002500003155

# Authentication fails
4000008400001629
```

## 3. Payment Flow Testing Checklist

### A. Subscription Creation Flow

#### Test Case 1: Successful Subscription
1. **Setup**: Use test card `4242424242424242`
2. **Steps**:
   ```bash
   # Navigate to pricing page
   curl https://track-flow.app/pricing

   # Start checkout for Professional plan
   curl -X POST https://track-flow.app/api/billing/create-checkout-session \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $USER_TOKEN" \
     -d '{"plan": "professional"}'

   # Complete payment in Stripe Checkout
   # Verify webhook receives checkout.session.completed
   # Verify user metadata updated with subscription
   ```

3. **Expected Results**:
   - Checkout session created successfully
   - Payment processed without errors
   - User redirected to success page
   - Webhook triggered and processed
   - User plan upgraded in database

#### Test Case 2: Payment Failure
1. **Setup**: Use test card `4000000000000002`
2. **Steps**:
   ```bash
   # Attempt payment with declined card
   # Complete form in Stripe Checkout
   # Verify error handling
   ```

3. **Expected Results**:
   - Payment declined message shown
   - User remains on payment page
   - No subscription created
   - User plan remains unchanged

#### Test Case 3: 3D Secure Authentication
1. **Setup**: Use test card `4000002500003155`
2. **Steps**:
   ```bash
   # Complete payment form
   # Handle 3DS authentication modal
   # Complete or fail authentication
   ```

3. **Expected Results**:
   - 3DS modal appears
   - Authentication process works
   - Payment completes after successful auth

### B. Subscription Management Flow

#### Test Case 4: Customer Portal Access
```bash
# Test portal session creation
curl -X POST https://track-flow.app/api/billing/create-portal-session \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected: Portal URL returned
# Manual: Access portal and test functions
```

#### Test Case 5: Plan Changes
1. **Upgrade Plan**:
   ```bash
   # In Customer Portal, upgrade from Professional to Enterprise
   # Verify proration calculation
   # Verify immediate access to new features
   ```

2. **Downgrade Plan**:
   ```bash
   # Downgrade from Enterprise to Professional
   # Verify change takes effect at period end
   # Verify feature access remains until period end
   ```

#### Test Case 6: Subscription Cancellation
```bash
# Cancel subscription in Customer Portal
# Verify cancellation webhook processed
# Verify access continues until period end
# Verify plan downgrades to 'free' after period end
```

### C. Webhook Testing

#### Test Case 7: Webhook Verification
```bash
# Test webhook endpoint
curl -X POST https://track-flow.app/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: $TEST_SIGNATURE" \
  -d '$WEBHOOK_PAYLOAD'

# Test webhook signature validation
# Test malformed payloads
# Test missing signatures
```

#### Test Case 8: Webhook Event Processing
Test each webhook event type:

1. **checkout.session.completed**
2. **customer.subscription.created**
3. **customer.subscription.updated**
4. **customer.subscription.deleted**
5. **invoice.payment_succeeded**
6. **invoice.payment_failed**

## 4. Automated Test Suite

### Jest Test Configuration
```javascript
// __tests__/payments/stripe.test.js
import { stripe } from '@/lib/stripe/client';
import { createTestUser } from '../helpers/auth';

describe('Stripe Payment Integration', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  test('creates checkout session for professional plan', async () => {
    const response = await fetch('/api/billing/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUser.token}`
      },
      body: JSON.stringify({ plan: 'professional' })
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.url).toMatch(/^https:\/\/checkout\.stripe\.com/);
  });

  test('handles invalid plan selection', async () => {
    const response = await fetch('/api/billing/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUser.token}`
      },
      body: JSON.stringify({ plan: 'invalid' })
    });

    expect(response.status).toBe(400);
  });

  test('creates customer portal session', async () => {
    // First create a subscription
    const customer = await stripe.customers.create({
      email: testUser.email,
      metadata: { user_id: testUser.id }
    });

    const response = await fetch('/api/billing/create-portal-session', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testUser.token}`
      }
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.url).toMatch(/^https:\/\/billing\.stripe\.com/);
  });
});
```

### Webhook Test Suite
```javascript
// __tests__/webhooks/stripe.test.js
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/webhooks/stripe/route';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
});

describe('Stripe Webhooks', () => {
  test('processes checkout.session.completed', async () => {
    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          client_reference_id: 'user_123',
          customer: 'cus_test_123',
          subscription: 'sub_test_123',
          metadata: { plan: 'professional' }
        }
      }
    };

    const payload = JSON.stringify(event);
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET!
    });

    const request = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: payload,
      headers: {
        'stripe-signature': signature
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
  });

  test('rejects invalid webhook signature', async () => {
    const request = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: '{"test": true}',
      headers: {
        'stripe-signature': 'invalid_signature'
      }
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
```

## 5. Manual Testing Procedures

### End-to-End User Journey
1. **New User Signup**
   - Create account
   - Access free features
   - Hit usage limits
   - See upgrade prompts

2. **Plan Selection**
   - Compare plans on pricing page
   - Click "Get Started" button
   - Complete Stripe Checkout
   - Verify account upgrade

3. **Feature Access**
   - Test premium features
   - Verify feature gating works
   - Test usage limits

4. **Billing Management**
   - Access customer portal
   - Update payment method
   - Download invoices
   - View billing history

5. **Plan Changes**
   - Upgrade to higher tier
   - Test immediate access
   - Downgrade plan
   - Verify end-of-period access

6. **Cancellation**
   - Cancel subscription
   - Verify continued access
   - Test reactivation

### Testing Checklist Template
```markdown
## Payment Testing Session: [Date]

### Environment
- [ ] Test mode enabled
- [ ] Test price IDs configured
- [ ] Webhook endpoint accessible
- [ ] Database in test mode

### Subscription Creation
- [ ] Freelancer plan checkout works
- [ ] Professional plan checkout works
- [ ] Enterprise plan checkout works
- [ ] Payment decline handling works
- [ ] 3D Secure authentication works

### Webhook Processing
- [ ] checkout.session.completed processed
- [ ] subscription.created processed
- [ ] subscription.updated processed
- [ ] subscription.deleted processed
- [ ] User metadata updated correctly

### Customer Portal
- [ ] Portal access works
- [ ] Payment method updates work
- [ ] Invoice downloads work
- [ ] Plan changes work
- [ ] Cancellation works

### Edge Cases
- [ ] Duplicate webhook handling
- [ ] Network timeout handling
- [ ] Invalid plan handling
- [ ] Unauthorized access blocked

### Performance
- [ ] Checkout loads quickly (< 3s)
- [ ] Webhook processes quickly (< 5s)
- [ ] Portal loads quickly (< 3s)
```

## 6. Production Testing

### Pre-Launch Checklist
```bash
# Verify live keys are configured
echo $STRIPE_SECRET_KEY | grep "sk_live"
echo $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | grep "pk_live"

# Test webhook endpoint is accessible
curl -I https://track-flow.app/api/webhooks/stripe

# Verify webhook is configured in Stripe Dashboard
# https://dashboard.stripe.com/webhooks

# Test with small live transaction
# Use real card with $1 test amount
```

### Live Transaction Testing
1. **Test with $1 Transaction**
   - Create test subscription with $1 price
   - Complete payment with real card
   - Verify webhook processing
   - Immediately cancel subscription

2. **Test Refund Process**
   - Process refund for test transaction
   - Verify webhook handling
   - Verify user plan updates

### Monitoring Setup
```javascript
// lib/monitoring/payments.ts
export async function logPaymentEvent(event: {
  type: string;
  userId?: string;
  amount?: number;
  status: 'success' | 'failed' | 'pending';
  error?: string;
}) {
  // Log to monitoring service
  console.log('Payment Event:', {
    ...event,
    timestamp: new Date().toISOString()
  });

  // Send to analytics
  if (typeof window !== 'undefined') {
    window.gtag?.('event', 'payment', {
      event_category: 'billing',
      event_label: event.type,
      value: event.amount
    });
  }
}
```

## 7. Troubleshooting

### Common Issues

**Webhook Not Receiving Events**
- Check webhook URL is correct
- Verify SSL certificate is valid
- Check webhook endpoint returns 200
- Review Stripe webhook logs

**Payment Failures**
- Check test card numbers are correct
- Verify price IDs are configured
- Check for API key mismatches
- Review Stripe Dashboard logs

**User Plan Not Updating**
- Check webhook signature validation
- Verify user ID mapping is correct
- Check database permissions
- Review webhook processing logs

### Debug Tools
```bash
# Check webhook deliveries
curl "https://api.stripe.com/v1/webhook_endpoints" \
  -H "Authorization: Bearer $STRIPE_SECRET_KEY"

# Retrieve specific webhook event
curl "https://api.stripe.com/v1/events/evt_test_webhook" \
  -H "Authorization: Bearer $STRIPE_SECRET_KEY"

# Test webhook locally with Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
```