# TrackFlow Database Migration Checklist

## Pre-Migration Checklist

### 1. Environment Preparation
- [ ] Identify target environment: `[ ] Development` `[ ] Staging` `[ ] Production`
- [ ] Record current date/time: ___________________
- [ ] Verify Supabase project URL: ___________________
- [ ] Confirm database credentials are available
- [ ] Ensure team is notified of migration window

### 2. Backup Current State
- [ ] Create full database backup
  ```bash
  pg_dump -h [host] -U postgres -d postgres > backup_[date].sql
  ```
- [ ] Backup location verified: ___________________
- [ ] Test restore process on separate instance (production only)
- [ ] Document current table count: ___________________
- [ ] Document current row counts for main tables:
  - [ ] users: ___________
  - [ ] clients: ___________
  - [ ] projects: ___________
  - [ ] time_entries: ___________
  - [ ] invoices: ___________

### 3. Pre-Migration Validation
- [ ] Check for existing migrations:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' ORDER BY table_name;
  ```
- [ ] Identify any custom modifications to document
- [ ] Verify no active connections (production):
  ```sql
  SELECT pid, usename, application_name, client_addr, state 
  FROM pg_stat_activity WHERE datname = 'postgres';
  ```

## Migration Execution Checklist

### Phase 1: Initial Schema Migration

- [ ] **File to run**: `20250101000000_initial_schema.sql`
- [ ] Open Supabase SQL Editor
- [ ] Copy and paste migration content
- [ ] Execute migration
- [ ] Verify no errors in output
- [ ] Check execution time: ___________

**Validation checks:**
- [ ] Verify 11 tables created:
  ```sql
  SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
  ```
- [ ] Verify enum types created:
  ```sql
  SELECT typname FROM pg_type WHERE typtype = 'e';
  ```
- [ ] Verify UUID extension:
  ```sql
  SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';
  ```

### Phase 2: Performance Indexes

- [ ] **File to run**: `20250102000000_performance_indexes.sql`
- [ ] Copy and paste migration content
- [ ] Execute migration
- [ ] Verify no errors in output
- [ ] Check execution time: ___________

**Validation checks:**
- [ ] Count total indexes:
  ```sql
  SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';
  ```
  Expected: 100+ indexes
- [ ] Verify composite indexes created:
  ```sql
  SELECT indexname FROM pg_indexes 
  WHERE schemaname = 'public' AND indexname LIKE 'idx_%composite%';
  ```

### Phase 3: Security Verification

- [ ] Verify RLS is enabled on all tables:
  ```sql
  SELECT tablename, rowsecurity FROM pg_tables 
  WHERE schemaname = 'public' AND NOT rowsecurity;
  ```
  Should return 0 rows

- [ ] Test RLS policies are working:
  ```sql
  SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
  ```
  Expected: 40+ policies

- [ ] Verify triggers are active:
  ```sql
  SELECT trigger_name, event_object_table FROM information_schema.triggers 
  WHERE trigger_schema = 'public';
  ```

## Post-Migration Checklist

### 1. Functional Testing

- [ ] Test user authentication works
- [ ] Test creating a new client record
- [ ] Test creating a new project
- [ ] Test creating a time entry
- [ ] Test timer start/stop functionality
- [ ] Test invoice generation
- [ ] Test team member invitations
- [ ] Test API key generation

### 2. Performance Testing

- [ ] Run sample queries and check execution time:
  ```sql
  -- Test time entries query performance
  EXPLAIN ANALYZE 
  SELECT * FROM time_entries 
  WHERE user_id = '[test-user-id]' 
  AND start_time > NOW() - INTERVAL '30 days';
  ```

- [ ] Check index usage:
  ```sql
  SELECT schemaname, tablename, indexname, idx_scan 
  FROM pg_stat_user_indexes 
  WHERE schemaname = 'public' 
  ORDER BY idx_scan DESC;
  ```

### 3. Application Integration

- [ ] Update application environment variables if needed
- [ ] Test application connection to database
- [ ] Verify all API endpoints working
- [ ] Check application logs for errors
- [ ] Monitor error tracking service (Sentry, etc.)

### 4. Monitoring Setup

- [ ] Set up database monitoring alerts
- [ ] Configure backup schedule
- [ ] Set up query performance monitoring
- [ ] Document slow query threshold: ___________ms

## Rollback Checklist (If Needed)

### Rollback Decision Criteria
- [ ] Critical functionality broken
- [ ] Performance degradation > 50%
- [ ] Data integrity issues detected
- [ ] Security vulnerabilities found

### Rollback Steps
1. [ ] Stop application traffic
2. [ ] Restore from backup:
   ```bash
   psql -h [host] -U postgres -d postgres < backup_[date].sql
   ```
3. [ ] Verify restoration successful
4. [ ] Re-enable application traffic
5. [ ] Document rollback reason: ___________________
6. [ ] Schedule post-mortem meeting

## Sign-off

### Migration Team
- [ ] Database Administrator: ___________ Date: ___________
- [ ] Lead Developer: ___________ Date: ___________
- [ ] QA Lead: ___________ Date: ___________
- [ ] Product Owner: ___________ Date: ___________

### Final Checks
- [ ] All checklist items completed
- [ ] No critical issues identified
- [ ] Performance metrics acceptable
- [ ] Security validation passed
- [ ] Documentation updated
- [ ] Team notified of completion

## Notes Section

### Issues Encountered:
_________________________________________________
_________________________________________________
_________________________________________________

### Resolutions Applied:
_________________________________________________
_________________________________________________
_________________________________________________

### Follow-up Actions:
_________________________________________________
_________________________________________________
_________________________________________________

### Lessons Learned:
_________________________________________________
_________________________________________________
_________________________________________________

---

**Migration Completed**: Date: ___________ Time: ___________ By: ___________