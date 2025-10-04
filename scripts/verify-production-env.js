#!/usr/bin/env node

/**
 * Script to verify production environment configuration
 * Usage: node scripts/verify-production-env.js
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_ID_FREELANCER',
  'STRIPE_PRICE_ID_PROFESSIONAL',
  'STRIPE_PRICE_ID_ENTERPRISE',
  'NEXT_PUBLIC_APP_URL',
  'JWT_SECRET',
  'WEBHOOK_SECRET_KEY',
];

const OPTIONAL_VARS = [
  'OPENAI_API_KEY',
  'OPENAI_MODEL',
  'NEXT_PUBLIC_GA_MEASUREMENT_ID',
  'NEXT_PUBLIC_POSTHOG_KEY',
  'NEXT_PUBLIC_POSTHOG_HOST',
  'SENTRY_DSN',
  'NEXT_PUBLIC_SENTRY_DSN',
];

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};

  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return env;
}

function verifyEnvVar(name, value, isRequired = true) {
  const status = {
    name,
    isSet: !!value,
    isValid: true,
    warnings: [],
    isRequired,
  };

  if (!value) {
    if (isRequired) {
      status.isValid = false;
      status.warnings.push('Missing required variable');
    }
    return status;
  }

  // Validate specific formats
  if (name.includes('SUPABASE_URL') && value) {
    if (!value.startsWith('https://') || !value.includes('.supabase.co')) {
      status.warnings.push('Should be a Supabase URL (https://xxx.supabase.co)');
    }
  }

  if (name.includes('STRIPE_PUBLISHABLE_KEY') && value) {
    if (value.startsWith('pk_test_')) {
      status.warnings.push('⚠️  Using TEST key - switch to pk_live_ for production');
    } else if (!value.startsWith('pk_live_')) {
      status.warnings.push('Should start with pk_live_ (or pk_test_ for testing)');
    }
  }

  if (name.includes('STRIPE_SECRET_KEY') && value) {
    if (value.startsWith('sk_test_')) {
      status.warnings.push('⚠️  Using TEST key - switch to sk_live_ for production');
    } else if (!value.startsWith('sk_live_')) {
      status.warnings.push('Should start with sk_live_ (or sk_test_ for testing)');
    }
  }

  if (name.includes('STRIPE_PRICE_ID') && value) {
    if (!value.startsWith('price_')) {
      status.warnings.push('Should start with price_');
    }
  }

  if (name === 'JWT_SECRET' && value) {
    if (value.length < 32) {
      status.warnings.push('Should be at least 32 characters (generate with: openssl rand -base64 64)');
    }
  }

  if (name === 'NEXT_PUBLIC_APP_URL' && value) {
    if (!value.startsWith('https://') && !value.startsWith('http://localhost')) {
      status.warnings.push('Should start with https:// (or http://localhost for local dev)');
    }
    if (value.endsWith('/')) {
      status.warnings.push('Should not end with /');
    }
  }

  return status;
}

function main() {
  log('\n🔍 TrackFlow v2 - Production Environment Verification\n', 'blue');

  // Load .env.production or process.env
  let env = process.env;
  const envPath = path.join(__dirname, '..', '.env.production');

  if (fs.existsSync(envPath)) {
    log(`📄 Loading environment from .env.production\n`, 'blue');
    const loadedEnv = loadEnvFile(envPath);
    if (loadedEnv) {
      env = loadedEnv;
    }
  } else {
    log(`📄 No .env.production found, using process.env\n`, 'yellow');
  }

  let hasErrors = false;
  let hasWarnings = false;

  // Check required variables
  log('Required Variables:', 'green');
  REQUIRED_VARS.forEach(varName => {
    const status = verifyEnvVar(varName, env[varName], true);

    if (status.isSet) {
      if (status.warnings.length > 0) {
        log(`  ⚠️  ${varName}:`, 'yellow');
        status.warnings.forEach(w => log(`      ${w}`, 'yellow'));
        hasWarnings = true;
      } else {
        log(`  ✅ ${varName}`, 'green');
      }
    } else {
      log(`  ❌ ${varName}: MISSING`, 'red');
      hasErrors = true;
    }
  });

  // Check optional variables
  log('\nOptional Variables:', 'blue');
  OPTIONAL_VARS.forEach(varName => {
    const status = verifyEnvVar(varName, env[varName], false);

    if (status.isSet) {
      if (status.warnings.length > 0) {
        log(`  ⚠️  ${varName}:`, 'yellow');
        status.warnings.forEach(w => log(`      ${w}`, 'yellow'));
        hasWarnings = true;
      } else {
        log(`  ✅ ${varName}`, 'green');
      }
    } else {
      log(`  ⊘  ${varName}: not set`, 'reset');
    }
  });

  // Check for common security issues
  log('\n🔒 Security Checks:', 'blue');

  const securityIssues = [];

  // Check if using localhost in production URL
  if (env.NEXT_PUBLIC_APP_URL?.includes('localhost')) {
    securityIssues.push('NEXT_PUBLIC_APP_URL contains localhost - this should be your production domain');
  }

  // Check if JWT secret is weak
  if (env.JWT_SECRET && (env.JWT_SECRET === 'your-secret-key' || env.JWT_SECRET.length < 32)) {
    securityIssues.push('JWT_SECRET appears to be weak or default - generate a strong secret');
  }

  // Check if using Stripe test keys
  if (env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
    securityIssues.push('Using Stripe TEST keys - switch to live keys for production');
  }

  if (securityIssues.length > 0) {
    securityIssues.forEach(issue => log(`  ⚠️  ${issue}`, 'yellow'));
    hasWarnings = true;
  } else {
    log('  ✅ No obvious security issues found', 'green');
  }

  // Final summary
  log('\n' + '='.repeat(60), 'blue');

  if (hasErrors) {
    log('\n❌ ERRORS FOUND: Missing required environment variables', 'red');
    log('   Run: node scripts/setup-production.sh\n', 'yellow');
    process.exit(1);
  } else if (hasWarnings) {
    log('\n⚠️  WARNINGS: Some configuration issues detected', 'yellow');
    log('   Review the warnings above before deploying\n', 'yellow');
    process.exit(0);
  } else {
    log('\n✅ All environment variables are properly configured!\n', 'green');
    process.exit(0);
  }
}

main();
