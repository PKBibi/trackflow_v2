#!/usr/bin/env node

/**
 * Payment Flow Testing Script
 * Tests Stripe integration and payment flows
 */

const https = require('https');
const crypto = require('crypto');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Test configuration
const TEST_CONFIG = {
  plans: ['freelancer', 'professional', 'enterprise'],
  testCards: {
    success: '4242424242424242',
    declined: '4000000000000002',
    insufficient: '4000000000009995',
    threeds: '4000002500003155'
  }
};

class PaymentTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Payment Flow Tests\n');

    try {
      // Test API endpoints
      await this.testCheckoutSessionCreation();
      await this.testPortalSessionCreation();
      await this.testBillingStatus();

      // Test webhook processing
      await this.testWebhookEndpoint();
      await this.testWebhookSignatureValidation();

      // Test error handling
      await this.testErrorHandling();

      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  async testCheckoutSessionCreation() {
    console.log('Testing checkout session creation...');

    for (const plan of TEST_CONFIG.plans) {
      try {
        const response = await this.makeRequest('/api/billing/create-checkout-session', {
          method: 'POST',
          body: JSON.stringify({ plan }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token' // Mock token for testing
          }
        });

        if (response.url && response.url.includes('checkout.stripe.com')) {
          this.addResult(true, `Checkout session created for ${plan} plan`);
        } else {
          this.addResult(false, `Invalid checkout URL for ${plan} plan`);
        }
      } catch (error) {
        this.addResult(false, `Checkout session failed for ${plan}: ${error.message}`);
      }
    }
  }

  async testPortalSessionCreation() {
    console.log('Testing customer portal session...');

    try {
      const response = await this.makeRequest('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      if (response.url && response.url.includes('billing.stripe.com')) {
        this.addResult(true, 'Customer portal session created successfully');
      } else {
        this.addResult(false, 'Invalid portal URL returned');
      }
    } catch (error) {
      this.addResult(false, `Portal session failed: ${error.message}`);
    }
  }

  async testBillingStatus() {
    console.log('Testing billing status endpoint...');

    try {
      const response = await this.makeRequest('/api/billing/status', {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      if (response && typeof response === 'object') {
        this.addResult(true, 'Billing status retrieved successfully');
      } else {
        this.addResult(false, 'Invalid billing status response');
      }
    } catch (error) {
      this.addResult(false, `Billing status failed: ${error.message}`);
    }
  }

  async testWebhookEndpoint() {
    console.log('Testing webhook endpoint accessibility...');

    try {
      const response = await this.makeRequest('/api/webhooks/stripe', {
        method: 'GET'
      });

      if (response.status === 'ok') {
        this.addResult(true, 'Webhook endpoint is accessible');
      } else {
        this.addResult(false, 'Webhook endpoint returned unexpected response');
      }
    } catch (error) {
      this.addResult(false, `Webhook endpoint failed: ${error.message}`);
    }
  }

  async testWebhookSignatureValidation() {
    console.log('Testing webhook signature validation...');

    const testEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          client_reference_id: 'test_user_123',
          customer: 'cus_test_123',
          subscription: 'sub_test_123'
        }
      }
    };

    const payload = JSON.stringify(testEvent);

    // Test with invalid signature
    try {
      await this.makeRequest('/api/webhooks/stripe', {
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'invalid_signature'
        }
      });
      this.addResult(false, 'Webhook accepted invalid signature');
    } catch (error) {
      if (error.message.includes('signature')) {
        this.addResult(true, 'Webhook correctly rejected invalid signature');
      } else {
        this.addResult(false, `Unexpected webhook error: ${error.message}`);
      }
    }

    // Test with missing signature
    try {
      await this.makeRequest('/api/webhooks/stripe', {
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      this.addResult(false, 'Webhook accepted missing signature');
    } catch (error) {
      if (error.message.includes('signature')) {
        this.addResult(true, 'Webhook correctly rejected missing signature');
      } else {
        this.addResult(false, `Unexpected webhook error: ${error.message}`);
      }
    }
  }

  async testErrorHandling() {
    console.log('Testing error handling...');

    // Test invalid plan
    try {
      await this.makeRequest('/api/billing/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ plan: 'invalid_plan' }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });
      this.addResult(false, 'API accepted invalid plan');
    } catch (error) {
      this.addResult(true, 'API correctly rejected invalid plan');
    }

    // Test unauthorized access
    try {
      await this.makeRequest('/api/billing/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ plan: 'professional' }),
        headers: {
          'Content-Type': 'application/json'
          // No authorization header
        }
      });
      this.addResult(false, 'API allowed unauthorized access');
    } catch (error) {
      this.addResult(true, 'API correctly blocked unauthorized access');
    }
  }

  async makeRequest(path, options = {}) {
    const url = new URL(path, BASE_URL);

    return new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: 10000
      }, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(parsed.error || `HTTP ${res.statusCode}`));
            }
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  addResult(passed, message) {
    this.results.tests.push({ passed, message });
    if (passed) {
      this.results.passed++;
      console.log(`  ✅ ${message}`);
    } else {
      this.results.failed++;
      console.log(`  ❌ ${message}`);
    }
  }

  printResults() {
    console.log('\n🎯 Test Results Summary');
    console.log('=======================');
    console.log(`Total Tests: ${this.results.tests.length}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${Math.round((this.results.passed / this.results.tests.length) * 100)}%`);

    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(test => !test.passed)
        .forEach(test => console.log(`  - ${test.message}`));

      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed!');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new PaymentTester();
  tester.runAllTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = PaymentTester;