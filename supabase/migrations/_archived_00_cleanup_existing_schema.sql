-- =============================================
-- Cleanup Script - Run BEFORE Initial Schema
-- This handles existing tables from previous migration attempts
-- =============================================

-- Drop all existing tables and types to start fresh
-- WARNING: This will DELETE ALL DATA

DO $$ 
BEGIN
    -- Drop all tables in reverse dependency order
    DROP TABLE IF EXISTS public.invoice_line_items CASCADE;
    DROP TABLE IF EXISTS public.invoice_items CASCADE;
    DROP TABLE IF EXISTS public.retainer_usage CASCADE;
    DROP TABLE IF EXISTS public.time_entries CASCADE;
    DROP TABLE IF EXISTS public.invoices CASCADE;
    DROP TABLE IF EXISTS public.projects CASCADE;
    DROP TABLE IF EXISTS public.clients CASCADE;
    DROP TABLE IF EXISTS public.export_history CASCADE;
    DROP TABLE IF EXISTS public.api_usage CASCADE;
    DROP TABLE IF EXISTS public.login_history CASCADE;
    DROP TABLE IF EXISTS public.user_sessions CASCADE;
    DROP TABLE IF EXISTS public.activity_logs CASCADE;
    DROP TABLE IF EXISTS public.notification_settings CASCADE;
    DROP TABLE IF EXISTS public.user_security CASCADE;
    DROP TABLE IF EXISTS public.api_keys CASCADE;
    DROP TABLE IF EXISTS public.team_invites CASCADE;
    DROP TABLE IF EXISTS public.team_members CASCADE;
    DROP TABLE IF EXISTS public.profiles CASCADE;
    
    -- Drop enum types if they exist
    DROP TYPE IF EXISTS invoice_status CASCADE;
    
    -- Drop functions if they exist
    DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    DROP FUNCTION IF EXISTS log_activity(UUID, TEXT, TEXT, TEXT, JSONB, TEXT) CASCADE;
    DROP FUNCTION IF EXISTS cleanup_expired_data() CASCADE;
    
    RAISE NOTICE 'Cleanup completed successfully';
END $$;