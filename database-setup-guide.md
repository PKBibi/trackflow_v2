# Production Database Setup Guide

## Overview

TrackFlow uses Supabase PostgreSQL for production database. This guide covers complete production database setup, migration, and optimization.

## 1. Supabase Production Project Setup

### Step 1: Create Production Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Project settings:
   - **Name**: `trackflow-production`
   - **Database Password**: Generate strong password (32+ characters)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
   - **Plan**: Pro plan (recommended for production)

### Step 2: Configure Project Settings
```bash
# Project Configuration
Organization: Your Organization
Project Name: trackflow-production
Reference ID: [auto-generated]
Region: us-east-1 (or closest to users)
Database Password: [32+ character secure password]
```

### Step 3: Save Connection Details
```bash
# Save these values for environment variables
SUPABASE_URL: https://your-project-id.supabase.co
SUPABASE_ANON_KEY: eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY: eyJ...your-service-role-key
```

## 2. Database Schema Migration

### Migration Files Overview
TrackFlow includes these key migrations:

```bash
supabase/migrations/
├── 20250101000000_initial_schema.sql     # Core tables and relationships
├── 20250102000000_performance_indexes.sql # Database optimization
├── 20250103000000_audit_logs_table.sql   # Security and compliance
├── 20250104000000_two_factor_auth.sql    # Enhanced security
├── 20250105000000_team_invitations.sql   # Team collaboration
├── 20250106000000_retainer_alerts.sql    # Client management
├── 20250107000000_scheduled_exports.sql  # Data export features
└── 20250108000000_user_preferences.sql   # User customization
```

### Step 1: Run Database Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize project (if not done)
supabase init

# Link to production project
supabase link --project-ref your-project-id

# Run all migrations
supabase db push

# Verify migration status
supabase migration list
```

### Step 2: Manual Migration (Alternative)
If CLI doesn't work, manually run migrations:

1. Go to Supabase Dashboard → SQL Editor
2. Run migrations in order:
   ```sql
   -- Run each migration file content in sequence
   -- Start with 20250101000000_initial_schema.sql
   -- Then 20250102000000_performance_indexes.sql
   -- Continue in order...
   ```

## 3. Row Level Security (RLS) Setup

### Enable RLS on All Tables
```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Create RLS policies for time_entries
CREATE POLICY "Users can manage own time entries" ON public.time_entries
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for clients
CREATE POLICY "Users can manage own clients" ON public.clients
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for projects
CREATE POLICY "Users can manage own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for team access
CREATE POLICY "Team members can view shared data" ON public.time_entries
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = time_entries.user_id
      AND user_id = auth.uid()
    )
  );
```

## 4. Database Performance Optimization

### Essential Indexes
```sql
-- Performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON public.time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_client_id ON public.time_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON public.time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_channel ON public.time_entries(marketing_channel);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON public.time_entries(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_channel ON public.time_entries(user_id, marketing_channel);
```

### Database Configuration
```sql
-- Optimize for time-series data
ALTER TABLE public.time_entries
SET (fillfactor = 90);

-- Set up automatic vacuuming
ALTER TABLE public.time_entries
SET (autovacuum_vacuum_scale_factor = 0.1);

-- Configure statistics for better query planning
ALTER TABLE public.time_entries
ALTER COLUMN start_time SET STATISTICS 1000;
```

## 5. Backup and Recovery Setup

### Automated Backups
Supabase Pro automatically provides:
- **Point-in-Time Recovery**: 7 days retention
- **Daily Backups**: 30 days retention
- **Automated Failover**: Multi-AZ deployment

### Manual Backup Configuration
```bash
# Create manual backup
pg_dump "postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres" \
  --no-owner --no-privileges --clean --if-exists \
  > trackflow_backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="trackflow_backup_$DATE.sql"

pg_dump "$DATABASE_URL" \
  --no-owner --no-privileges --clean --if-exists \
  > "$BACKUP_FILE"

# Upload to cloud storage
aws s3 cp "$BACKUP_FILE" s3://trackflow-backups/
```

## 6. Environment Configuration

### Production Environment Variables
```bash
# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# Database Connection Pool (if needed)
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres

# Connection Pool Settings
SUPABASE_POOL_MAX_CONNECTIONS=20
SUPABASE_POOL_IDLE_TIMEOUT=30000
```

### Database Connection Configuration
```typescript
// lib/supabase/config.ts
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  options: {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
};
```

## 7. Security Configuration

### Database Security Settings
```sql
-- Configure secure defaults
ALTER DATABASE postgres SET timezone = 'UTC';
ALTER DATABASE postgres SET log_statement = 'mod';
ALTER DATABASE postgres SET log_min_duration_statement = 1000;

-- Set up database monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Configure connection limits
ALTER ROLE postgres CONNECTION LIMIT 100;
```

### API Security Configuration
```typescript
// lib/supabase/security.ts
export const securityMiddleware = {
  // Rate limiting per user
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // requests per window
  },

  // Query timeout
  timeout: 30000, // 30 seconds

  // Connection pooling
  pooling: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000
  }
};
```

## 8. Monitoring and Alerting

### Database Monitoring Setup
```sql
-- Create monitoring views
CREATE OR REPLACE VIEW public.db_stats AS
SELECT
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows
FROM pg_stat_user_tables;

-- Monitor connection counts
CREATE OR REPLACE VIEW public.connection_stats AS
SELECT
  state,
  COUNT(*) as connections
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state;
```

### Performance Monitoring
```typescript
// lib/monitoring/database.ts
export async function checkDatabaseHealth() {
  const checks = [
    {
      name: 'connection_count',
      query: 'SELECT count(*) FROM pg_stat_activity',
      threshold: 80
    },
    {
      name: 'slow_queries',
      query: 'SELECT count(*) FROM pg_stat_statements WHERE mean_time > 1000',
      threshold: 10
    },
    {
      name: 'table_bloat',
      query: 'SELECT count(*) FROM pg_stat_user_tables WHERE n_dead_tup > n_live_tup',
      threshold: 0
    }
  ];

  const results = await Promise.all(
    checks.map(check => executeHealthCheck(check))
  );

  return {
    status: results.every(r => r.healthy) ? 'healthy' : 'warning',
    checks: results
  };
}
```

## 9. Data Migration and Seeding

### Production Data Seeding
```sql
-- Create default marketing channels
INSERT INTO public.marketing_channels (name, color, description) VALUES
('PPC', '#3B82F6', 'Pay-per-click advertising'),
('SEO', '#10B981', 'Search engine optimization'),
('Social Media', '#8B5CF6', 'Social media marketing'),
('Email Marketing', '#F59E0B', 'Email campaigns'),
('Content Marketing', '#EF4444', 'Content creation and strategy'),
('Analytics', '#6B7280', 'Data analysis and reporting')
ON CONFLICT (name) DO NOTHING;

-- Create default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (
    user_id,
    email_weekly_reports,
    email_retainer_alerts,
    email_project_deadlines,
    push_timer_reminders
  ) VALUES (
    NEW.id,
    true,
    true,
    true,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_preferences();
```

## 10. Testing and Validation

### Database Connectivity Test
```typescript
// scripts/test-database.ts
import { createClient } from '@supabase/supabase-js';

async function testDatabaseConnection() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Test basic connectivity
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) throw error;

    console.log('✅ Database connection successful');

    // Test RLS policies
    const { data: rlsTest, error: rlsError } = await supabase
      .rpc('check_rls_policies');

    if (rlsError) throw rlsError;

    console.log('✅ RLS policies active');

    return { success: true };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return { success: false, error };
  }
}
```

### Performance Testing
```bash
# Load testing script
#!/bin/bash
echo "Running database performance tests..."

# Test concurrent connections
for i in {1..10}; do
  psql "$DATABASE_URL" -c "SELECT pg_sleep(1);" &
done
wait

# Test query performance
psql "$DATABASE_URL" -c "EXPLAIN ANALYZE SELECT * FROM time_entries WHERE user_id = gen_random_uuid() LIMIT 100;"

echo "Performance tests completed."
```

## 11. Troubleshooting

### Common Issues

**Connection Timeouts**
- Check connection pool settings
- Verify network connectivity
- Review Supabase project status

**Slow Queries**
- Check pg_stat_statements for slow queries
- Review index usage with EXPLAIN ANALYZE
- Consider query optimization

**RLS Policy Issues**
- Verify policies are correctly configured
- Check user authentication status
- Test policies with different user roles

### Debug Commands
```sql
-- Check active connections
SELECT * FROM pg_stat_activity WHERE datname = current_database();

-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT
  indexrelname,
  idx_tup_read,
  idx_tup_fetch,
  idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## 12. Maintenance Schedule

### Daily Tasks
- Monitor connection counts
- Check error logs
- Verify backup completion

### Weekly Tasks
- Review slow query reports
- Check database size growth
- Update table statistics

### Monthly Tasks
- Analyze index usage
- Review and optimize queries
- Update database configuration
- Security audit