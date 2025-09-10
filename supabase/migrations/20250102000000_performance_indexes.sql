-- =============================================
-- Performance Optimization Indexes
-- Run this AFTER the initial schema migration
-- 
-- Note: Partial indexes cannot use non-IMMUTABLE functions like NOW()
-- For time-based filtering, the application should pass specific dates
-- =============================================

-- =============================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- =============================================

-- Time Entries: Most common query patterns
CREATE INDEX IF NOT EXISTS idx_time_entries_user_client 
  ON public.time_entries(user_id, client_id);

CREATE INDEX IF NOT EXISTS idx_time_entries_user_project 
  ON public.time_entries(user_id, project_id);

CREATE INDEX IF NOT EXISTS idx_time_entries_user_date_range 
  ON public.time_entries(user_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_time_entries_client_billable 
  ON public.time_entries(client_id, billable, status);

CREATE INDEX IF NOT EXISTS idx_time_entries_user_running 
  ON public.time_entries(user_id, is_timer_running) 
  WHERE is_timer_running = true;

-- Invoices: Status and date combinations
CREATE INDEX IF NOT EXISTS idx_invoices_status_due 
  ON public.invoices(status, due_date);

CREATE INDEX IF NOT EXISTS idx_invoices_user_status 
  ON public.invoices(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_client_status 
  ON public.invoices(client_id, status);

CREATE INDEX IF NOT EXISTS idx_invoices_overdue 
  ON public.invoices(due_date, status) 
  WHERE status = 'sent';

-- Projects: Active projects and deadlines
CREATE INDEX IF NOT EXISTS idx_projects_user_active 
  ON public.projects(user_id, status) 
  WHERE status IN ('active', 'planning');

CREATE INDEX IF NOT EXISTS idx_projects_client_active 
  ON public.projects(client_id, status) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_projects_upcoming_deadlines 
  ON public.projects(deadline, status) 
  WHERE deadline IS NOT NULL AND status NOT IN ('completed', 'cancelled');

-- Clients: Retainer management
CREATE INDEX IF NOT EXISTS idx_clients_retainer_active 
  ON public.clients(user_id, has_retainer, status) 
  WHERE has_retainer = true AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_clients_user_active 
  ON public.clients(user_id, status) 
  WHERE status = 'active';

-- Retainer Usage: Active periods
CREATE INDEX IF NOT EXISTS idx_retainer_usage_active_period 
  ON public.retainer_usage(client_id, period_start, period_end) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_retainer_usage_alerts 
  ON public.retainer_usage(client_id, usage_percentage) 
  WHERE status = 'active';

-- Invoice Line Items: Aggregation queries
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_amount 
  ON public.invoice_line_items(invoice_id, amount);

CREATE INDEX IF NOT EXISTS idx_invoice_line_items_channel_analysis 
  ON public.invoice_line_items(marketing_channel, marketing_category, amount);

-- Activity Logs: Recent activities
-- Note: Can't use NOW() in partial index as it's not IMMUTABLE
-- This index will help with queries that filter by user and sort by timestamp
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_recent 
  ON public.activity_logs(user_id, timestamp DESC);

-- API Keys: Active keys lookup
CREATE INDEX IF NOT EXISTS idx_api_keys_active 
  ON public.api_keys(user_id, status) 
  WHERE status = 'active';

-- Team Members: Active team lookups
CREATE INDEX IF NOT EXISTS idx_team_members_team_active 
  ON public.team_members(team_id, status) 
  WHERE status = 'active';

-- =============================================
-- PARTIAL INDEXES FOR SPECIFIC WORKFLOWS
-- =============================================

-- Timer running check (for real-time timer features)
CREATE INDEX IF NOT EXISTS idx_time_entries_timer_active 
  ON public.time_entries(user_id, is_timer_running, start_time DESC) 
  WHERE is_timer_running = true;

-- Unbilled time entries (for invoice generation)
CREATE INDEX IF NOT EXISTS idx_time_entries_unbilled 
  ON public.time_entries(user_id, client_id, billable, invoice_id) 
  WHERE billable = true AND invoice_id IS NULL;

-- Unpaid invoices (for AR tracking)
CREATE INDEX IF NOT EXISTS idx_invoices_unpaid 
  ON public.invoices(client_id, total_amount, due_date) 
  WHERE status IN ('sent', 'overdue');

-- =============================================
-- TEXT SEARCH INDEXES (if using full-text search)
-- =============================================

-- Create text search indexes for common search fields
CREATE INDEX IF NOT EXISTS idx_clients_search 
  ON public.clients USING gin(
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(company, '') || ' ' || coalesce(email, ''))
  );

CREATE INDEX IF NOT EXISTS idx_projects_search 
  ON public.projects USING gin(
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
  );

CREATE INDEX IF NOT EXISTS idx_time_entries_search 
  ON public.time_entries USING gin(
    to_tsvector('english', coalesce(task_title, '') || ' ' || coalesce(task_description, '') || ' ' || coalesce(notes, ''))
  );

-- =============================================
-- JSONB INDEXES (for metadata queries)
-- =============================================

-- API Keys permissions
CREATE INDEX IF NOT EXISTS idx_api_keys_permissions 
  ON public.api_keys USING gin(permissions);

-- Team Members permissions
CREATE INDEX IF NOT EXISTS idx_team_members_permissions 
  ON public.team_members USING gin(permissions);

-- Activity Logs metadata
CREATE INDEX IF NOT EXISTS idx_activity_logs_metadata 
  ON public.activity_logs USING gin(metadata);

-- =============================================
-- ARRAY INDEXES (for tag searches)
-- =============================================

-- Tags on various tables
CREATE INDEX IF NOT EXISTS idx_clients_tags 
  ON public.clients USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_projects_tags 
  ON public.projects USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_time_entries_tags 
  ON public.time_entries USING gin(tags);

-- =============================================
-- STATISTICS UPDATE
-- =============================================

-- Update table statistics for query planner
ANALYZE public.profiles;
ANALYZE public.clients;
ANALYZE public.projects;
ANALYZE public.time_entries;
ANALYZE public.invoices;
ANALYZE public.invoice_line_items;
ANALYZE public.retainer_usage;
ANALYZE public.team_members;
ANALYZE public.api_keys;
ANALYZE public.notification_settings;
ANALYZE public.activity_logs;