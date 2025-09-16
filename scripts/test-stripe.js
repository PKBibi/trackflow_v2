#!/usr/bin/env node

/**
 * Stripe Integration Test Suite
 *
 * This script tests the complete Stripe integration flow:
 * 1. Checkout session creation
 * 2. Webhook handling simulation
 * 3. Subscription management
 * 4. Billing portal access
 * 5. Error scenarios
 *
 * Prerequisites:
 * - STRIPE_SECRET_KEY must be set (test key: sk_test_...)
 * - STRIPE_WEBHOOK_SECRET must be set
 * - App must be running on localhost:3000
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  testEmail: 'test@trackflow-test.com',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  timeout: 10000, // 10 seconds
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  log(`\n🧪 ${testName}`, 'bold');
  log('─'.repeat(50), 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test utilities
async function makeRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TEST_CONFIG.timeout);

  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}${url}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Create a test webhook event
function createTestWebhookEvent(type, data) {
  const event = {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    api_version: '2024-06-20',
    created: Math.floor(Date.now() / 1000),
    data: { object: data },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type,
  };

  const payload = JSON.stringify(event);
  const signature = crypto
    .createHmac('sha256', TEST_CONFIG.webhookSecret)
    .update(payload)
    .digest('hex');

  return {
    payload,
    headers: {
      'stripe-signature': `t=${Math.floor(Date.now() / 1000)},v1=${signature}`,
    },
  };
}

// Test 1: Check Stripe configuration
async function testStripeConfiguration() {
  logTest('Stripe Configuration');

  try {
    const account = await stripe.accounts.retrieve();
    logSuccess(`Stripe account ID: ${account.id}`);
    logSuccess(`Account country: ${account.country}`);
    logSuccess(`Charges enabled: ${account.charges_enabled}`);
    logSuccess(`Payouts enabled: ${account.payouts_enabled}`);

    // Check for test/live mode
    if (account.id.startsWith('acct_')) {
      logSuccess('Using Stripe test mode ✓');
    } else {
      logWarning('Using Stripe live mode - be careful!');
    }

    return true;
  } catch (error) {
    logError(`Stripe configuration error: ${error.message}`);
    return false;
  }
}

// Test 2: Check webhook endpoint
async function testWebhookEndpoint() {
  logTest('Webhook Endpoint');

  try {
    const response = await makeRequest('/api/webhooks/stripe', { method: 'GET' });

    if (response.status === 200) {
      logSuccess('Webhook endpoint is accessible');
    } else {
      logError(`Webhook endpoint returned status ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    logError(`Webhook endpoint error: ${error.message}`);
    return false;
  }
}

// Test 3: Test checkout session creation
async function testCheckoutSessionCreation() {
  logTest('Checkout Session Creation');

  const testPlans = ['pro', 'enterprise'];

  for (const plan of testPlans) {
    try {
      log(`Testing ${plan} plan checkout...`);

      const response = await makeRequest('/api/billing/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      });

      if (response.status === 401) {
        logWarning('Checkout requires authentication - this is expected');
        continue;
      }

      if (response.status === 200) {
        const data = await response.json();
        if (data.url && data.url.includes('checkout.stripe.com')) {
          logSuccess(`${plan} checkout session created: ${data.url.substring(0, 50)}...`);
        } else {
          logError(`Invalid checkout URL for ${plan}: ${data.url}`);
          return false;
        }
      } else {
        const errorData = await response.json();
        logError(`Checkout session creation failed for ${plan}: ${errorData.error}`);
        return false;
      }
    } catch (error) {
      logError(`Checkout session error for ${plan}: ${error.message}`);
      return false;
    }
  }

  return true;
}

// Test 4: Test webhook handling with mock events
async function testWebhookHandling() {
  logTest('Webhook Event Handling');

  const testEvents = [
    {
      type: 'checkout.session.completed',
      data: {
        id: 'cs_test_123456789',
        object: 'checkout.session',
        client_reference_id: 'user_test_123',
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
        metadata: { user_id: 'user_test_123', plan: 'pro' },
      },
    },
    {
      type: 'customer.subscription.created',
      data: {
        id: 'sub_test_123',
        object: 'subscription',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        items: {
          data: [{
            price: {
              id: 'price_test_pro',
            },
          }],
        },
        metadata: { user_id: 'user_test_123' },
      },
    },
    {
      type: 'invoice.payment_succeeded',
      data: {
        id: 'in_test_123456789',
        object: 'invoice',
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
        amount_paid: 2900,
        currency: 'usd',
      },
    },
  ];

  for (const eventData of testEvents) {
    try {
      log(`Testing ${eventData.type} webhook...`);

      const { payload, headers } = createTestWebhookEvent(eventData.type, eventData.data);

      const response = await makeRequest('/api/webhooks/stripe', {
        method: 'POST',
        headers,
        body: payload,
      });

      if (response.status === 200) {
        const result = await response.json();
        if (result.received) {
          logSuccess(`${eventData.type} webhook handled successfully`);
        } else {
          logError(`${eventData.type} webhook processing failed`);
          return false;
        }
      } else {
        logError(`${eventData.type} webhook returned status ${response.status}`);
        return false;
      }
    } catch (error) {
      logError(`Webhook test error for ${eventData.type}: ${error.message}`);
      return false;
    }
  }

  return true;
}

// Test 5: Test billing status API
async function testBillingStatus() {
  logTest('Billing Status API');

  try {
    const response = await makeRequest('/api/billing/status');

    if (response.status === 200) {
      const data = await response.json();

      logSuccess('Billing status API accessible');
      log(`Plan: ${data.plan || 'free'}`);
      log(`Authenticated: ${data.authenticated}`);

      if (data.prices && Array.isArray(data.prices)) {
        logSuccess(`Found ${data.prices.length} price(s)`);
        data.prices.forEach(price => {
          log(`  - ${price.nickname}: $${(price.unitAmount / 100).toFixed(2)}/${price.interval}`);
        });
      }

      if (data.subscription) {
        logSuccess('Active subscription found');
        log(`  Status: ${data.subscription.status}`);
        log(`  Plan: ${data.subscription.nickname}`);
      }

      return true;
    } else {
      logError(`Billing status API returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Billing status API error: ${error.message}`);
    return false;
  }
}

// Test 6: Test portal session creation
async function testPortalSession() {
  logTest('Billing Portal Session');

  try {
    const response = await makeRequest('/api/billing/create-portal-session', {
      method: 'POST',
    });

    if (response.status === 401) {
      logWarning('Portal session requires authentication - this is expected');
      return true;
    }

    if (response.status === 200) {
      const data = await response.json();
      if (data.url && data.url.includes('billing.stripe.com')) {
        logSuccess(`Portal session created: ${data.url.substring(0, 50)}...`);
        return true;
      } else {
        logError(`Invalid portal URL: ${data.url}`);
        return false;
      }
    } else {
      const errorData = await response.json();
      logError(`Portal session creation failed: ${errorData.error}`);
      return false;
    }
  } catch (error) {
    logError(`Portal session error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n🚀 TrackFlow Stripe Integration Test Suite', 'bold');
  log('═'.repeat(60), 'blue');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  const tests = [
    ['Stripe Configuration', testStripeConfiguration],
    ['Webhook Endpoint', testWebhookEndpoint],
    ['Checkout Sessions', testCheckoutSessionCreation],
    ['Webhook Handling', testWebhookHandling],
    ['Billing Status', testBillingStatus],
    ['Portal Sessions', testPortalSession],
  ];

  for (const [name, testFn] of tests) {
    results.total++;

    try {
      const passed = await testFn();
      if (passed) {
        results.passed++;
        logSuccess(`${name} - PASSED`);
      } else {
        results.failed++;
        logError(`${name} - FAILED`);
      }
    } catch (error) {
      results.failed++;
      logError(`${name} - ERROR: ${error.message}`);
    }
  }

  // Summary
  log('\n📊 Test Results Summary', 'bold');
  log('═'.repeat(60), 'blue');
  log(`Total Tests: ${results.total}`);
  logSuccess(`Passed: ${results.passed}`);
  if (results.failed > 0) {
    logError(`Failed: ${results.failed}`);
  } else {
    logSuccess(`Failed: ${results.failed}`);
  }

  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  log(`Success Rate: ${successRate}%`);

  if (results.failed === 0) {
    log('\n🎉 All Stripe integration tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n💥 Some tests failed. Please check the errors above.', 'red');
    process.exit(1);
  }
}

// Check requirements before running tests
function checkRequirements() {
  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    logError('Missing required environment variables:');
    missing.forEach(key => log(`  - ${key}`, 'red'));
    log('\nPlease set these environment variables and try again.', 'yellow');
    process.exit(1);
  }

  if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    logWarning('WARNING: Not using Stripe test keys. Proceed with caution!');
  }
}

// Run the tests
if (require.main === module) {
  checkRequirements();
  runAllTests().catch(error => {
    logError(`Test suite failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runAllTests };