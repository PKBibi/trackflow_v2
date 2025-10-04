-- Cleanup: Drop old team_invites table
-- The proper table is team_invitations (created in 20250105000000_team_invitations.sql)

-- Drop old team_invites table if it exists
DROP TABLE IF EXISTS public.team_invites CASCADE;
