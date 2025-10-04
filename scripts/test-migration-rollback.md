# Migration Rollback Testing Guide

## Overview
This document outlines the migration rollback strategy for TrackFlow v2.

## Current Migration State

All migrations are in `supabase/migrations/` directory:
- Initial schema: `20250101000000_initial_schema.sql`
- Performance indexes: `20250102000000_performance_indexes.sql`
- Audit logs: `20250103000000_audit_logs_table.sql`
- 2FA: `20250104000000_two_factor_auth.sql`
- Team invitations: `20250105000000_team_invitations.sql`
- Retainer alerts: `20250106000000_retainer_alerts.sql`
- Scheduled exports: `20250107000000_scheduled_exports.sql`
- User preferences: `20250108000000_user_preferences.sql` + extras
- Cleanup: `20250109000000_cleanup_duplicate_team_invites.sql`

## Rollback Strategy

### Option 1: Supabase CLI (Recommended for Production)

```bash
# List migrations
supabase migration list

# Rollback last migration
supabase db reset --version <previous-version>

# Apply specific version
supabase migration repair --status reverted <version>
```

### Option 2: Manual SQL Rollback

Create rollback SQL files for each migration:

```sql
-- Example rollback for 20250105000000_team_invitations.sql
DROP FUNCTION IF EXISTS public.accept_team_invitation(TEXT);
DROP TRIGGER IF EXISTS update_team_invitations_updated_at ON public.team_invitations;
DROP TABLE IF EXISTS public.team_invitations CASCADE;
```

### Option 3: Database Snapshot/Restore

**Before applying migrations:**
1. Take Supabase database snapshot via dashboard
2. Note snapshot timestamp
3. Apply migrations
4. If issues occur, restore from snapshot

**Steps:**
1. Go to Supabase Dashboard > Database > Backups
2. Click "Create Backup"
3. After testing, restore if needed

## Testing Rollback Locally

Since we don't have local Supabase running, we recommend:

1. **Use Supabase Branching** (if available on your plan):
   - Create a preview branch
   - Apply migrations to preview
   - Test rollback on preview
   - Merge to production when confident

2. **Use Staging Environment**:
   - Set up separate Supabase project for staging
   - Test migrations there first
   - Validate rollback works
   - Then apply to production

## Migration Safety Checklist

Before applying ANY migration to production:

- [ ] Migration is idempotent (uses IF NOT EXISTS, IF EXISTS)
- [ ] Migration has been tested in staging
- [ ] Database backup created
- [ ] Rollback script prepared
- [ ] Rollback script tested
- [ ] Team notified of maintenance window
- [ ] Monitoring in place for errors

## Current State: Safe for Production

✅ **All migrations use safe patterns:**
- `CREATE TABLE IF NOT EXISTS`
- `DROP TABLE IF EXISTS`
- `CREATE INDEX IF NOT EXISTS`
- Proper CASCADE handling

✅ **Cleanup migration is safe:**
- Drops old unused table (team_invites)
- Uses IF EXISTS
- Won't break if table doesn't exist

## Recommendation

**For production deployment:**

1. Take database snapshot BEFORE applying any new migrations
2. Apply migrations one at a time, not all at once
3. Monitor logs after each migration
4. Keep snapshot for 7 days minimum
5. Document which snapshot corresponds to which migration version

**Emergency Rollback Procedure:**

```bash
# If migration causes issues:
1. Note the issue and time
2. Go to Supabase Dashboard > Database > Backups
3. Select pre-migration snapshot
4. Click "Restore"
5. Wait for restore to complete (usually 2-5 minutes)
6. Verify data integrity
7. Fix migration issue before re-applying
```

## Rollback Testing Status

Since the database tables don't appear to exist yet in the current environment (based on schema cache errors), we recommend:

1. **First**: Apply all migrations to the production database
2. **Then**: Create a test migration and test rollback
3. **Finally**: Document the rollback process for each critical migration

**Next Steps:**
- Apply all pending migrations to production Supabase
- Create database snapshot
- Test one migration + rollback
- Document results
