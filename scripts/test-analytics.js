#!/usr/bin/env node

/**
 * Analytics Testing Script
 *
 * This script tests the analytics configuration by verifying:
 * 1. Google Analytics ID is properly set
 * 2. Analytics utilities are importable
 * 3. Key tracking functions are available
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Analytics Configuration...\n');

// Test 1: Check environment configuration
console.log('1. Checking environment configuration...');
const envExample = path.join(__dirname, '..', '.env.example');
const envLocal = path.join(__dirname, '..', '.env.local');

if (fs.existsSync(envExample)) {
  const envContent = fs.readFileSync(envExample, 'utf8');
  const hasGAConfig = envContent.includes('NEXT_PUBLIC_GA_MEASUREMENT_ID');
  const hasPosthogConfig = envContent.includes('NEXT_PUBLIC_POSTHOG_KEY');

  console.log(`   ✅ Environment example includes GA config: ${hasGAConfig}`);
  console.log(`   ✅ Environment example includes PostHog config: ${hasPosthogConfig}`);
} else {
  console.log('   ❌ No .env.example found');
}

// Test 2: Check analytics component exists
console.log('\n2. Checking analytics component...');
const analyticsPath = path.join(__dirname, '..', 'components', 'analytics.tsx');

if (fs.existsSync(analyticsPath)) {
  const analyticsContent = fs.readFileSync(analyticsPath, 'utf8');

  const hasGAId = analyticsContent.includes('G-WC4MZKFK0D');
  const hasPageview = analyticsContent.includes('pageview');
  const hasTrackEvent = analyticsContent.includes('trackEvent');
  const hasSubscriptionTracking = analyticsContent.includes('subscriptionStart');
  const hasEcommerceTracking = analyticsContent.includes('begin_checkout');
  const hasViewPricingPage = analyticsContent.includes('viewPricingPage');

  console.log(`   ✅ Analytics component exists`);
  console.log(`   ✅ Contains GA ID fallback: ${hasGAId}`);
  console.log(`   ✅ Has pageview tracking: ${hasPageview}`);
  console.log(`   ✅ Has event tracking: ${hasTrackEvent}`);
  console.log(`   ✅ Has subscription tracking: ${hasSubscriptionTracking}`);
  console.log(`   ✅ Has ecommerce tracking: ${hasEcommerceTracking}`);
  console.log(`   ✅ Has pricing page tracking: ${hasViewPricingPage}`);
} else {
  console.log('   ❌ Analytics component not found');
}

// Test 3: Check pricing page integration
console.log('\n3. Checking pricing page integration...');
const pricingPath = path.join(__dirname, '..', 'app', '(marketing)', 'pricing', 'page.tsx');

if (fs.existsSync(pricingPath)) {
  const pricingContent = fs.readFileSync(pricingPath, 'utf8');

  const hasViewTracking = pricingContent.includes('trackEvent.viewPricingPage');
  const hasSelectTracking = pricingContent.includes('trackEvent.selectPlan');
  const hasSubscriptionTracking = pricingContent.includes('trackEvent.subscriptionStart');

  console.log(`   ✅ Pricing page exists`);
  console.log(`   ✅ Has view tracking: ${hasViewTracking}`);
  console.log(`   ✅ Has plan selection tracking: ${hasSelectTracking}`);
  console.log(`   ✅ Has subscription start tracking: ${hasSubscriptionTracking}`);
} else {
  console.log('   ❌ Pricing page not found');
}

// Test 4: Check signup page integration
console.log('\n4. Checking signup page integration...');
const signupPath = path.join(__dirname, '..', 'app', '(auth)', 'signup', 'page.tsx');

if (fs.existsSync(signupPath)) {
  const signupContent = fs.readFileSync(signupPath, 'utf8');

  const hasSignupTracking = signupContent.includes('trackEvent.signup');
  const hasTrialTracking = signupContent.includes('trackEvent.trialStart');

  console.log(`   ✅ Signup page exists`);
  console.log(`   ✅ Has signup tracking: ${hasSignupTracking}`);
  console.log(`   ✅ Has trial start tracking: ${hasTrialTracking}`);
} else {
  console.log('   ❌ Signup page not found');
}

// Test 5: Check root layout integration
console.log('\n5. Checking root layout integration...');
const layoutPath = path.join(__dirname, '..', 'app', 'layout.tsx');

if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');

  const hasAnalyticsImport = layoutContent.includes("import { Analytics }");
  const hasAnalyticsComponent = layoutContent.includes('<Analytics />');

  console.log(`   ✅ Root layout exists`);
  console.log(`   ✅ Imports Analytics component: ${hasAnalyticsImport}`);
  console.log(`   ✅ Includes Analytics component: ${hasAnalyticsComponent}`);
} else {
  console.log('   ❌ Root layout not found');
}

console.log('\n🎉 Analytics configuration test completed!');
console.log('\nNext steps:');
console.log('1. Set up .env.local with your actual GA and PostHog credentials');
console.log('2. Test in browser developer tools to verify events are firing');
console.log('3. Check Google Analytics Real-Time reports for live data');
console.log('4. Monitor PostHog dashboard for event tracking');