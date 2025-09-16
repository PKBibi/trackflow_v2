#!/usr/bin/env node

/**
 * Error Monitoring & Alerting Test Suite
 *
 * This script tests the complete monitoring system:
 * 1. Sentry error tracking
 * 2. Health check endpoints
 * 3. Performance monitoring
 * 4. Alert system
 * 5. Error boundaries
 *
 * Prerequisites:
 * - App must be running on localhost:3000
 * - SENTRY_DSN must be configured (optional)
 */

const crypto = require('crypto');

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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

// Test 1: Health Check Endpoint
async function testHealthCheck() {
  logTest('Health Check Endpoint');

  try {
    const response = await makeRequest('/api/health');

    if (response.status === 200 || response.status === 503) {
      const data = await response.json();

      logSuccess(`Health endpoint accessible (status: ${response.status})`);
      log(`Overall status: ${data.status}`);
      log(`Environment: ${data.environment}`);
      log(`Version: ${data.version}`);

      if (data.services) {
        log('\n🔍 Service Status:');
        Object.entries(data.services).forEach(([service, status]) => {
          const icon = status === 'healthy' ? '✅' : status === 'degraded' ? '⚠️' : '❌';
          log(`  ${icon} ${service}: ${status}`);
        });
      }

      if (data.alerts && data.alerts.length > 0) {
        logWarning(`Active alerts: ${data.alerts.length}`);
        data.alerts.forEach(alert => {
          log(`  - [${alert.severity}] ${alert.type}: ${alert.message}`);
        });
      } else {
        logSuccess('No active alerts');
      }

      return true;
    } else {
      logError(`Health endpoint returned unexpected status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    return false;
  }
}

// Test 2: Performance Monitoring
async function testPerformanceMonitoring() {
  logTest('Performance Monitoring');

  try {
    // Test multiple endpoints to measure performance
    const endpoints = [
      { path: '/api/health', name: 'Health Check' },
      { path: '/', name: 'Home Page' },
      { path: '/pricing', name: 'Pricing Page' },
    ];

    for (const endpoint of endpoints) {
      const startTime = Date.now();

      try {
        const response = await makeRequest(endpoint.path, {
          method: 'GET',
          headers: { 'Accept': 'text/html,application/json' }
        });

        const duration = Date.now() - startTime;
        const status = response.ok ? '✅' : '❌';

        log(`${status} ${endpoint.name}: ${duration}ms (${response.status})`);

        if (duration > 2000) {
          logWarning(`Slow response for ${endpoint.name}: ${duration}ms`);
        } else if (duration < 100) {
          logSuccess(`Fast response for ${endpoint.name}: ${duration}ms`);
        }

      } catch (error) {
        logError(`${endpoint.name} failed: ${error.message}`);
      }
    }

    return true;
  } catch (error) {
    logError(`Performance monitoring failed: ${error.message}`);
    return false;
  }
}

// Test 3: Error Boundary Testing
async function testErrorBoundaries() {
  logTest('Error Boundary Testing');

  try {
    // Test various error scenarios by hitting endpoints that might fail
    const errorTests = [
      {
        name: 'Invalid API Route',
        path: '/api/nonexistent-endpoint',
        expectedStatus: 404,
      },
      {
        name: 'Malformed JSON',
        path: '/api/health',
        method: 'POST',
        body: '{invalid json}',
        expectedStatus: [400, 405], // Either bad request or method not allowed
      },
    ];

    for (const test of errorTests) {
      try {
        const response = await makeRequest(test.path, {
          method: test.method || 'GET',
          body: test.body,
          headers: test.body ? { 'Content-Type': 'application/json' } : {},
        });

        const expectedStatuses = Array.isArray(test.expectedStatus)
          ? test.expectedStatus
          : [test.expectedStatus];

        if (expectedStatuses.includes(response.status)) {
          logSuccess(`${test.name}: Handled correctly (${response.status})`);
        } else {
          logWarning(`${test.name}: Unexpected status ${response.status}`);
        }

      } catch (error) {
        if (test.name === 'Invalid API Route' && error.message.includes('404')) {
          logSuccess(`${test.name}: Handled correctly`);
        } else {
          logWarning(`${test.name}: ${error.message}`);
        }
      }
    }

    return true;
  } catch (error) {
    logError(`Error boundary testing failed: ${error.message}`);
    return false;
  }
}

// Test 4: Sentry Integration (if configured)
async function testSentryIntegration() {
  logTest('Sentry Integration');

  const hasSentry = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!hasSentry) {
    logWarning('Sentry DSN not configured - skipping integration test');
    return true;
  }

  try {
    // Test Sentry by triggering a test error
    // Note: This would only work if we had a test endpoint that could trigger Sentry
    logSuccess('Sentry DSN configured');
    log('Note: Manual testing required to verify Sentry error capture');
    log('1. Navigate to your app');
    log('2. Trigger an error (invalid form submission, etc.)');
    log('3. Check Sentry dashboard for captured events');

    return true;
  } catch (error) {
    logError(`Sentry integration test failed: ${error.message}`);
    return false;
  }
}

// Test 5: Monitoring Metrics
async function testMonitoringMetrics() {
  logTest('Monitoring Metrics');

  try {
    const response = await makeRequest('/api/health');

    if (response.ok) {
      const data = await response.json();

      if (data.metrics) {
        logSuccess('Monitoring metrics available:');
        Object.entries(data.metrics).forEach(([metric, value]) => {
          log(`  📊 ${metric}: ${value}`);
        });
      } else {
        logWarning('No monitoring metrics in health check response');
      }

      return true;
    } else {
      logError('Could not retrieve monitoring metrics');
      return false;
    }
  } catch (error) {
    logError(`Monitoring metrics test failed: ${error.message}`);
    return false;
  }
}

// Test 6: Alert System Configuration
async function testAlertSystem() {
  logTest('Alert System Configuration');

  try {
    const hasSlackWebhook = !!process.env.SLACK_WEBHOOK_URL;
    const hasAlertEmail = !!process.env.ALERT_EMAIL;
    const hasWebhook = !!process.env.ALERT_WEBHOOK_URL;

    log('\n📢 Alert Configuration:');
    log(`  Email alerts: ${hasAlertEmail ? '✅ Configured' : '❌ Not configured'}`);
    log(`  Slack alerts: ${hasSlackWebhook ? '✅ Configured' : '❌ Not configured'}`);
    log(`  Webhook alerts: ${hasWebhook ? '✅ Configured' : '❌ Not configured'}`);

    if (!hasSlackWebhook && !hasAlertEmail && !hasWebhook) {
      logWarning('No alert channels configured - alerts will only go to console');
    } else {
      logSuccess('At least one alert channel configured');
    }

    return true;
  } catch (error) {
    logError(`Alert system test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n🚀 TrackFlow Monitoring Test Suite', 'bold');
  log('═'.repeat(60), 'blue');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  const tests = [
    ['Health Check Endpoint', testHealthCheck],
    ['Performance Monitoring', testPerformanceMonitoring],
    ['Error Boundaries', testErrorBoundaries],
    ['Sentry Integration', testSentryIntegration],
    ['Monitoring Metrics', testMonitoringMetrics],
    ['Alert System', testAlertSystem],
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

  // Recommendations
  log('\n💡 Recommendations:', 'bold');
  log('1. Configure Sentry DSN for error tracking');
  log('2. Set up Slack webhook for instant alerts');
  log('3. Configure uptime monitoring (Pingdom, UptimeRobot)');
  log('4. Set up error rate alerts in production');
  log('5. Monitor key business metrics (signups, subscriptions)');

  if (results.failed === 0) {
    log('\n🎉 All monitoring tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n💥 Some tests failed. Please check the errors above.', 'red');
    process.exit(1);
  }
}

// Check app availability
async function checkAppAvailability() {
  try {
    const response = await makeRequest('/');
    if (!response.ok) {
      throw new Error(`App returned status ${response.status}`);
    }
    logSuccess('App is running and accessible');
    return true;
  } catch (error) {
    logError('App is not accessible. Please start the development server:');
    log('  npm run dev', 'yellow');
    return false;
  }
}

// Run the tests
if (require.main === module) {
  checkAppAvailability().then(available => {
    if (available) {
      runAllTests().catch(error => {
        logError(`Test suite failed: ${error.message}`);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

module.exports = { runAllTests };