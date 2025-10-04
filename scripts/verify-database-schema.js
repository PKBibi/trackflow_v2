#!/usr/bin/env node

/**
 * Script to verify database schema and table existence
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifySchema() {
  console.log('🔍 Verifying database schema...\n');

  try {
    // Check team_invitations (correct table)
    console.log('Checking team_invitations table...');
    const { data: invitations, error: invitationsError } = await supabase
      .from('team_invitations')
      .select('*')
      .limit(1);

    if (invitationsError) {
      console.log('❌ team_invitations error:', invitationsError.message);
    } else {
      console.log('✅ team_invitations table exists and is accessible');
    }

    // Check team_invites (old table, should not exist)
    console.log('\nChecking team_invites table (should NOT exist)...');
    const { data: invites, error: invitesError } = await supabase
      .from('team_invites')
      .select('*')
      .limit(1);

    if (invitesError) {
      if (invitesError.message.includes('does not exist') || invitesError.message.includes('not found')) {
        console.log('✅ team_invites table does not exist (correct - it was cleaned up)');
      } else {
        console.log('⚠️  team_invites error:', invitesError.message);
      }
    } else {
      console.log('⚠️  team_invites table still exists! Should be removed.');
    }

    // List all tables
    console.log('\n📋 Listing all tables in public schema:');
    const tables = [
      'profiles',
      'time_entries',
      'clients',
      'projects',
      'team_members',
      'team_invitations',
      'api_keys',
      'notification_preferences',
      'activity_logs'
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      console.log(`   ${error ? '❌' : '✅'} ${table}`);
    }

    console.log('\n✅ Database schema verification complete!');

  } catch (err) {
    console.error('❌ Error during verification:', err.message);
    process.exit(1);
  }
}

verifySchema();
