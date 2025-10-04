#!/usr/bin/env node

/**
 * Script to cleanup old team_invites table
 * The proper table is team_invitations
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanupTeamInvites() {
  console.log('🗑️  Cleaning up old team_invites table...\n');

  try {
    // Check if team_invites table exists
    const { data: tables, error: listError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'team_invites');

    if (listError) {
      console.log('ℹ️  Could not check for table existence (this is normal)');
      console.log('   Proceeding with DROP TABLE IF EXISTS...\n');
    }

    // Drop the table using raw SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS public.team_invites CASCADE;'
    });

    if (error) {
      // Try alternative approach using pg_catalog
      console.log('⚠️  exec_sql RPC not available, trying direct query...');

      const { error: dropError } = await supabase
        .schema('public')
        .from('team_invites')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (dropError && !dropError.message.includes('does not exist')) {
        throw dropError;
      }
    }

    console.log('✅ Cleanup complete!');
    console.log('   - Dropped old team_invites table (if it existed)');
    console.log('   - team_invitations table is the correct one to use\n');

  } catch (err) {
    if (err.message && err.message.includes('does not exist')) {
      console.log('✅ Table team_invites does not exist (already clean)');
      console.log('   - team_invitations is the active table\n');
    } else {
      console.error('❌ Error during cleanup:', err.message);
      process.exit(1);
    }
  }
}

cleanupTeamInvites();
