# Supabase Migration Instructions

## ⚠️ IMPORTANT: Migration Order & Prerequisites

Follow these instructions **exactly in order** to avoid conflicts and ensure a smooth migration.

## Prerequisites

1. **Backup your database** if you have existing data
2. **Ensure you have Supabase CLI** installed and configured
3. **Check your Supabase project** is accessible

## Migration Files Overview

| File | Purpose | When to Run |
|------|---------|------------|
| `00_cleanup_existing_schema.sql` | Remove all existing tables (DELETES DATA) | Option A - Fresh start |
| `00_fix_enum_type.sql` | Fix enum type conflict only (PRESERVES DATA) | Option B - Minimal fix |
| `01_fix_profiles_table.sql` | Fix existing profiles table (PRESERVES DATA) | Option C - Fix profiles |
| `20250101000000_initial_schema.sql` | Complete database schema | After cleanup/fix |
| `20250102000000_performance_indexes.sql` | Performance optimization indexes | After initial schema |
| `seed-insights-data.sql` | Sample test data | Optional - Development only |

## Step-by-Step Migration Instructions

### Step 1: Fix Migration Conflicts

Choose the appropriate fix based on your error:

**Option A: Fresh Start (DELETES ALL DATA)**
```sql
-- Run: 00_cleanup_existing_schema.sql
-- This will drop all tables, types, and start fresh
```

**Option B: Fix "type invoice_status already exists" Error (PRESERVES DATA)**
```sql
-- Run: 00_fix_enum_type.sql
-- This only fixes the enum type conflict
```

**Option C: Fix "column username does not exist" Error (PRESERVES DATA)**
```sql
-- Run: 01_fix_profiles_table.sql
-- This adds missing columns to existing profiles table
```

### Step 2: Run Initial Schema Migration

**Method 1: Using Supabase CLI (Recommended)**
```bash
# From your project root
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

**Method 2: Using Supabase Dashboard**
1. Go to SQL Editor in Supabase Dashboard
2. Copy entire contents of `supabase/migrations/20250101000000_initial_schema.sql`
3. Paste and click "Run"
4. Verify success (should see "Success. No rows returned")

### Step 3: Run Performance Indexes

After the initial schema is created:

1. Go to SQL Editor in Supabase Dashboard
2. Copy entire contents of `supabase/migrations/20250102000000_performance_indexes.sql`
3. Paste and click "Run"
4. This may take 30-60 seconds depending on data volume

### Step 4: Verify Migration Success

Run these verification queries:

```sql
-- Check all tables were created
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';
-- Expected: 11 tables

-- Check all indexes were created
SELECT COUNT(*) as index_count 
FROM pg_indexes 
WHERE schemaname = 'public';
-- Expected: 100+ indexes

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- Expected: All tables should show rowsecurity = true

-- Check enum types
SELECT typname 
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typtype = 'e';
-- Expected: invoice_status
```

### Step 5: (Optional) Load Test Data

**⚠️ Development Environment Only!**

To load sample data for testing:

1. First, get a valid user ID:
```sql
-- Get your auth user ID
SELECT id FROM auth.users LIMIT 1;
```

2. Update the seed file with your user ID:
```sql
-- Replace 'user-123' with your actual user ID in seed-insights-data.sql
-- Then run the modified script
```

## Troubleshooting Common Issues

### Error: "type invoice_status already exists"
- **Cause**: Enum type exists from previous migration attempt
- **Solution**: Run `00_fix_enum_type.sql` to fix just the enum, or `00_cleanup_existing_schema.sql` for fresh start

### Error: "column username does not exist"
- **Cause**: Profiles table exists from previous migration but missing columns
- **Solution**: Run `01_fix_profiles_table.sql` (preserve data) or `00_cleanup_existing_schema.sql` (fresh start)

### Error: "relation already exists"
- **Cause**: Tables already exist from previous migration
- **Solution**: Run `00_cleanup_existing_schema.sql` first to clean up

### Error: "permission denied"
- **Cause**: RLS policies blocking access
- **Solution**: Ensure you're authenticated or temporarily disable RLS:
```sql
ALTER TABLE [table_name] DISABLE ROW LEVEL SECURITY;
-- Run your operations
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
```

### Error: "uuid-ossp extension not found"
- **Cause**: Extension not enabled
- **Solution**: Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Error: "enum type invoice_status already exists"
- **Cause**: Running phase11 migration after initial schema
- **Solution**: Skip phase11 - it's already included in initial schema

## Production Deployment Checklist

- [ ] Backup production database
- [ ] Test migrations in staging environment
- [ ] Schedule maintenance window
- [ ] Run migrations in this order:
  1. [ ] Initial schema (if fresh install)
  2. [ ] Performance indexes
- [ ] Verify all tables created
- [ ] Verify all indexes created
- [ ] Verify RLS policies active
- [ ] Test application connectivity
- [ ] Monitor performance for 24 hours

## Rollback Plan

If issues occur:

```sql
-- Save this beforehand
pg_dump -h [host] -U postgres -d postgres > backup_before_migration.sql

-- To rollback
psql -h [host] -U postgres -d postgres < backup_before_migration.sql
```

## DO NOT RUN These Files

These files are deprecated and included in the consolidated migration:
- ❌ `phase9_settings_tables.sql`
- ❌ `phase10_marketing_core_tables.sql`
- ❌ `phase11_invoices_tables.sql`

## Questions or Issues?

1. Check error messages carefully
2. Verify you're running migrations in correct order
3. Ensure you're using the consolidated migration file
4. Check Supabase logs for detailed error information