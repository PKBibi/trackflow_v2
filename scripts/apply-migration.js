#!/usr/bin/env node

/**
 * Script to apply pending migrations to Supabase database
 * Usage: node scripts/apply-migration.js <migration-file>
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration(migrationFile) {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile);

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log(`📝 Applying migration: ${migrationFile}`);
  console.log(`SQL:\n${sql}\n`);

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }

    console.log('✅ Migration applied successfully');
  } catch (err) {
    console.error('❌ Error applying migration:', err.message);
    process.exit(1);
  }
}

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node scripts/apply-migration.js <migration-file>');
  console.error('Example: node scripts/apply-migration.js 20250109000000_cleanup_duplicate_team_invites.sql');
  process.exit(1);
}

applyMigration(migrationFile);
