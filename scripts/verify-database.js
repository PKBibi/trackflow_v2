#!/usr/bin/env node

/**
 * TrackFlow Database Verification Script
 *
 * Checks that all required database tables exist in Supabase.
 * Run this after setting up your database migrations.
 *
 * Usage: node scripts/verify-database.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const chalk = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
}

console.log('\n' + chalk.bold(chalk.blue('🔍 TrackFlow Database Verification\n')))

// Check environment variables first
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log(chalk.red(chalk.bold('❌ Missing Supabase credentials')))
  console.log(chalk.red('\nPlease set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local\n'))
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

// Required tables grouped by feature
const requiredTables = {
  'Core Tables': [
    'profiles',
    'teams',
    'teams_users',
  ],
  'Time Tracking': [
    'clients',
    'projects',
    'time_entries',
  ],
  'Invoicing': [
    'invoices',
    'invoice_line_items',
  ],
  'Security & API': [
    'api_keys',
    'activity_logs',
    'user_security',
  ],
  'Features': [
    'notification_preferences',
    'user_preferences',
    'scheduled_exports',
    'retainer_alerts',
    'webhook_subscriptions',
    'webhook_delivery_logs',
    'ai_summaries',
  ],
}

async function checkTable(tableName) {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)

    if (error) {
      // Check if it's a "table doesn't exist" error
      if (error.message.includes('does not exist') || error.code === '42P01') {
        return { exists: false, error: 'Table does not exist' }
      }
      // Other errors (like RLS) are fine - table exists
      return { exists: true }
    }

    return { exists: true }
  } catch (err) {
    return { exists: false, error: err.message }
  }
}

async function verifyDatabase() {
  let missingTables = []
  let totalChecked = 0

  for (const [category, tables] of Object.entries(requiredTables)) {
    console.log(chalk.bold(`  ${category}:`))

    for (const table of tables) {
      totalChecked++
      const result = await checkTable(table)

      if (result.exists) {
        console.log(`    ${chalk.green('✓')} ${table}`)
      } else {
        console.log(`    ${chalk.red('✗')} ${table} ${chalk.red('(MISSING)')}`)
        missingTables.push(table)
      }
    }

    console.log('')
  }

  // Summary
  console.log(chalk.bold('═'.repeat(50)))
  console.log('')

  if (missingTables.length === 0) {
    console.log(chalk.green(chalk.bold('✅ Database Verified')))
    console.log(chalk.green(`\nAll ${totalChecked} required tables exist!`))
    console.log(chalk.blue('\nYour database is fully configured and ready to use.\n'))
  } else {
    console.log(chalk.red(chalk.bold('❌ Database Incomplete')))
    console.log(chalk.red(`\n${missingTables.length} of ${totalChecked} tables are missing:`))
    missingTables.forEach(table => {
      console.log(chalk.red(`  • ${table}`))
    })
    console.log(chalk.yellow('\nTo fix this, run migrations in PowerShell:'))
    console.log(chalk.yellow('  supabase db push\n'))
    console.log(chalk.yellow('Or check Supabase Dashboard → Database → Migrations\n'))
  }

  console.log(chalk.bold('═'.repeat(50)))
  console.log('')

  process.exit(missingTables.length > 0 ? 1 : 0)
}

// Run verification
verifyDatabase().catch(err => {
  console.error(chalk.red('\nError connecting to database:'))
  console.error(chalk.red(err.message))
  console.log('')
  process.exit(1)
})
