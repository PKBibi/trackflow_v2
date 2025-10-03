-- =============================================
-- Add team_id columns to all main tables for team scoping
-- =============================================

-- Add team_id to clients table
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.team_members(team_id);

-- Add team_id to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.team_members(team_id);

-- Add team_id to time_entries table
ALTER TABLE public.time_entries
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.team_members(team_id);

-- Add team_id to invoices table
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.team_members(team_id);

-- Add team_id to invoice_items table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoice_items') THEN
        ALTER TABLE public.invoice_items
        ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.team_members(team_id);
    END IF;
END $$;

-- =============================================
-- Create indexes for team_id columns
-- =============================================

CREATE INDEX IF NOT EXISTS idx_clients_team_id ON public.clients(team_id);
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON public.projects(team_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_team_id ON public.time_entries(team_id);
CREATE INDEX IF NOT EXISTS idx_invoices_team_id ON public.invoices(team_id);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_clients_user_team ON public.clients(user_id, team_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_team ON public.projects(user_id, team_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_team ON public.time_entries(user_id, team_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_client_team ON public.time_entries(client_id, team_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_team ON public.time_entries(project_id, team_id);

-- =============================================
-- Migrate existing data
-- For existing records without team_id, set to NULL
-- This allows gradual migration
-- =============================================

-- Note: In a real migration, you might want to:
-- 1. Create a default team for each user
-- 2. Assign all their existing data to that team
-- But for now, we'll allow NULL values

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS clients_isolation_policy ON public.clients;
DROP POLICY IF EXISTS projects_isolation_policy ON public.projects;
DROP POLICY IF EXISTS time_entries_isolation_policy ON public.time_entries;
DROP POLICY IF EXISTS invoices_isolation_policy ON public.invoices;

-- Clients table policies
CREATE POLICY clients_isolation_policy ON public.clients
  FOR ALL
  USING (
    -- Allow access if user_id matches
    auth.uid() = user_id
    -- OR if user is member of the team
    OR team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- Projects table policies
CREATE POLICY projects_isolation_policy ON public.projects
  FOR ALL
  USING (
    auth.uid() = user_id
    OR team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- Time entries table policies
CREATE POLICY time_entries_isolation_policy ON public.time_entries
  FOR ALL
  USING (
    auth.uid() = user_id
    OR team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- Invoices table policies
CREATE POLICY invoices_isolation_policy ON public.invoices
  FOR ALL
  USING (
    auth.uid() = user_id
    OR team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- Function to auto-set team_id on insert
-- =============================================

-- Create a function to get the user's active team
CREATE OR REPLACE FUNCTION public.get_user_active_team()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_team UUID;
BEGIN
  -- Get the user's first team (or implement your own logic)
  SELECT team_id INTO active_team
  FROM public.team_members
  WHERE user_id = auth.uid()
  ORDER BY created_at ASC
  LIMIT 1;

  RETURN active_team;
END;
$$;

-- =============================================
-- Triggers to auto-populate team_id
-- =============================================

-- Function that sets team_id before insert
CREATE OR REPLACE FUNCTION public.set_team_id_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only set team_id if not already provided
  IF NEW.team_id IS NULL THEN
    NEW.team_id := public.get_user_active_team();
  END IF;

  RETURN NEW;
END;
$$;

-- Create triggers for each table
DROP TRIGGER IF EXISTS set_team_id_on_clients_insert ON public.clients;
CREATE TRIGGER set_team_id_on_clients_insert
  BEFORE INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.set_team_id_on_insert();

DROP TRIGGER IF EXISTS set_team_id_on_projects_insert ON public.projects;
CREATE TRIGGER set_team_id_on_projects_insert
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_team_id_on_insert();

DROP TRIGGER IF EXISTS set_team_id_on_time_entries_insert ON public.time_entries;
CREATE TRIGGER set_team_id_on_time_entries_insert
  BEFORE INSERT ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_team_id_on_insert();

DROP TRIGGER IF EXISTS set_team_id_on_invoices_insert ON public.invoices;
CREATE TRIGGER set_team_id_on_invoices_insert
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_team_id_on_insert();

-- =============================================
-- Validation function to prevent team_id changes
-- =============================================

CREATE OR REPLACE FUNCTION public.prevent_team_id_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Prevent changing team_id after creation
  IF OLD.team_id IS DISTINCT FROM NEW.team_id THEN
    RAISE EXCEPTION 'Cannot change team_id after record creation';
  END IF;

  RETURN NEW;
END;
$$;

-- Create triggers to prevent team_id modification
DROP TRIGGER IF EXISTS prevent_clients_team_change ON public.clients;
CREATE TRIGGER prevent_clients_team_change
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_team_id_change();

DROP TRIGGER IF EXISTS prevent_projects_team_change ON public.projects;
CREATE TRIGGER prevent_projects_team_change
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_team_id_change();

DROP TRIGGER IF EXISTS prevent_time_entries_team_change ON public.time_entries;
CREATE TRIGGER prevent_time_entries_team_change
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_team_id_change();

DROP TRIGGER IF EXISTS prevent_invoices_team_change ON public.invoices;
CREATE TRIGGER prevent_invoices_team_change
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_team_id_change();

-- =============================================
-- Grant necessary permissions
-- =============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
