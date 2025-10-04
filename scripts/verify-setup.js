#!/usr/bin/env node

/**
 * TrackFlow Setup Verification Script
 *
 * Checks that all required environment variables and configurations are in place.
 * Run this before starting development or deploying to production.
 *
 * Usage: node scripts/verify-setup.js
 */

require('dotenv').config({ path: '.env.local' })

const chalk = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
}

console.log('\n' + chalk.bold(chalk.blue('🔍 TrackFlow Setup Verification\n')))

// Required environment variables
const required = {
  'Supabase': [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ],
  'Stripe': [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ],
  'Application': [
    'NEXT_PUBLIC_APP_URL',
  ],
}

// Optional but recommended
const optional = {
  'OpenAI (AI Features)': ['OPENAI_API_KEY'],
  'Resend (Email)': ['RESEND_API_KEY'],
  'Sentry (Monitoring)': ['SENTRY_DSN'],
}

let hasErrors = false
let hasWarnings = false

// Check required variables
console.log(chalk.bold('Required Configuration:\n'))

Object.entries(required).forEach(([category, vars]) => {
  console.log(chalk.bold(`  ${category}:`))
  vars.forEach(varName => {
    const value = process.env[varName]
    if (value) {
      console.log(`    ${chalk.green('✓')} ${varName}`)

      // Validate format
      if (varName === 'NEXT_PUBLIC_SUPABASE_URL' && !value.includes('supabase.co')) {
        console.log(`      ${chalk.yellow('⚠')} Warning: URL doesn't look like a Supabase URL`)
        hasWarnings = true
      }
      if (varName === 'STRIPE_SECRET_KEY' && !value.startsWith('sk_')) {
        console.log(`      ${chalk.yellow('⚠')} Warning: Should start with 'sk_'`)
        hasWarnings = true
      }
      if (varName === 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY' && !value.startsWith('pk_')) {
        console.log(`      ${chalk.yellow('⚠')} Warning: Should start with 'pk_'`)
        hasWarnings = true
      }
      if (varName === 'STRIPE_WEBHOOK_SECRET' && !value.startsWith('whsec_')) {
        console.log(`      ${chalk.yellow('⚠')} Warning: Should start with 'whsec_'`)
        hasWarnings = true
      }
    } else {
      console.log(`    ${chalk.red('✗')} ${varName} ${chalk.red('(MISSING)')}`)
      hasErrors = true
    }
  })
  console.log('')
})

// Check optional variables
console.log(chalk.bold('Optional Configuration:\n'))

Object.entries(optional).forEach(([category, vars]) => {
  console.log(chalk.bold(`  ${category}:`))
  vars.forEach(varName => {
    const value = process.env[varName]
    if (value) {
      console.log(`    ${chalk.green('✓')} ${varName}`)
    } else {
      console.log(`    ${chalk.yellow('○')} ${varName} ${chalk.yellow('(not configured)')}`)
    }
  })
  console.log('')
})

// Check if using test or live Stripe keys
console.log(chalk.bold('Stripe Mode Check:\n'))
const stripeKey = process.env.STRIPE_SECRET_KEY || ''
if (stripeKey.includes('_test_')) {
  console.log(`  ${chalk.yellow('⚠')} Using Stripe ${chalk.bold('TEST')} keys`)
  console.log(`    ${chalk.yellow('→')} This is correct for development`)
  console.log(`    ${chalk.yellow('→')} Use live keys (sk_live_...) for production\n`)
} else if (stripeKey.includes('_live_')) {
  console.log(`  ${chalk.green('✓')} Using Stripe ${chalk.bold('LIVE')} keys`)
  console.log(`    ${chalk.yellow('⚠')} Make sure you're in production mode!\n`)
} else if (stripeKey) {
  console.log(`  ${chalk.yellow('⚠')} Cannot determine Stripe mode\n`)
}

// Summary
console.log(chalk.bold('═'.repeat(50)))
console.log('')

if (hasErrors) {
  console.log(chalk.red(chalk.bold('❌ Setup Incomplete')))
  console.log(chalk.red('\nMissing required environment variables.'))
  console.log(chalk.yellow('Please check SETUP-GUIDE.md for configuration instructions.\n'))
  process.exit(1)
} else if (hasWarnings) {
  console.log(chalk.yellow(chalk.bold('⚠️  Setup Complete with Warnings')))
  console.log(chalk.yellow('\nPlease review warnings above.'))
  console.log(chalk.green('You can proceed, but double-check your configuration.\n'))
} else {
  console.log(chalk.green(chalk.bold('✅ Setup Verified')))
  console.log(chalk.green('\nAll required environment variables are configured!'))
  console.log(chalk.blue('\nNext steps:'))
  console.log(chalk.blue('  1. Run: npm run dev'))
  console.log(chalk.blue('  2. Visit: http://localhost:3000'))
  console.log(chalk.blue('  3. Check SETUP-GUIDE.md for Supabase database setup\n'))
}

console.log(chalk.bold('═'.repeat(50)))
console.log('')
