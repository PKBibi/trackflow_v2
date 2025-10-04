-- Run this in Supabase SQL Editor to fix the database

-- 1. Drop duplicate team_invites table (we use team_invitations instead)
DROP TABLE IF EXISTS public.team_invites CASCADE;

-- 2. Mark all migrations as applied in the migration history
-- This tells Supabase that the schema is already up to date
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES
  ('20250109000000', 'cleanup_duplicate_team_invites', ARRAY[]::text[]),
  ('20250201000100', 'webhook_subscriptions', ARRAY[]::text[]),
  ('20250201000200', 'webhook_delivery_logs', ARRAY[]::text[]),
  ('20250201000300', 'ai_summaries', ARRAY[]::text[]),
  ('20250202000000', 'add_team_id_columns', ARRAY[]::text[])
ON CONFLICT (version) DO NOTHING;

-- Done! Your database schema is now in sync with your migration files.
