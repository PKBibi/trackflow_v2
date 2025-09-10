-- =============================================
-- TrackFlow V2 - Complete Database Schema
-- Consolidated Migration (replaces phase9, phase10, phase11)
-- =============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

-- Create invoice_status enum only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
        CREATE TYPE invoice_status AS ENUM (
          'draft',
          'sent', 
          'paid',
          'overdue',
          'cancelled'
        );
    END IF;
END $$;

-- =============================================
-- 1. USER PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  location TEXT,
  website TEXT,
  linkedin TEXT,
  github TEXT,
  twitter TEXT,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  job_title TEXT,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- =============================================
-- 2. CLIENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic client info
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  phone TEXT,
  website TEXT,
  
  -- Address info
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  
  -- Billing info
  hourly_rate INTEGER, -- in cents
  currency TEXT DEFAULT 'USD',
  tax_rate DECIMAL(5,4) DEFAULT 0.0,
  
  -- Retainer management
  has_retainer BOOLEAN DEFAULT FALSE,
  retainer_hours INTEGER DEFAULT 0,
  retainer_amount INTEGER DEFAULT 0,
  retainer_start_date DATE,
  retainer_end_date DATE,
  retainer_auto_renew BOOLEAN DEFAULT FALSE,
  
  -- Alert settings
  alert_at_75_percent BOOLEAN DEFAULT TRUE,
  alert_at_90_percent BOOLEAN DEFAULT TRUE,
  alert_at_100_percent BOOLEAN DEFAULT TRUE,
  
  -- Status and metadata
  status TEXT CHECK (status IN ('active', 'inactive', 'archived')) DEFAULT 'active',
  notes TEXT,
  tags TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_has_retainer ON public.clients(has_retainer);
CREATE INDEX idx_clients_name ON public.clients(name);

-- =============================================
-- 3. PROJECTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic project info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Project details
  project_type TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  
  -- Budget and time tracking
  budget_type TEXT CHECK (budget_type IN ('hourly', 'fixed', 'retainer')) DEFAULT 'hourly',
  budget_amount INTEGER DEFAULT 0,
  estimated_hours INTEGER DEFAULT 0,
  
  -- Campaign-specific fields
  campaign_id TEXT,
  campaign_platform TEXT,
  campaign_objective TEXT,
  
  -- Timeline
  start_date DATE,
  end_date DATE,
  deadline DATE,
  
  -- Status
  status TEXT CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')) DEFAULT 'planning',
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  
  -- Billing
  billable BOOLEAN DEFAULT TRUE,
  hourly_rate INTEGER,
  
  -- Metadata
  notes TEXT,
  tags TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_campaign_platform ON public.projects(campaign_platform);
CREATE INDEX idx_projects_deadline ON public.projects(deadline);

-- =============================================
-- 4. TIME ENTRIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  
  -- Time tracking
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER, -- in minutes
  
  -- Marketing categorization
  marketing_category TEXT NOT NULL,
  marketing_channel TEXT NOT NULL,
  
  -- Task details
  task_title TEXT,
  task_description TEXT,
  
  -- Campaign linking
  campaign_id TEXT,
  campaign_platform TEXT,
  
  -- Billing
  billable BOOLEAN DEFAULT TRUE,
  hourly_rate INTEGER NOT NULL, -- in cents
  amount INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN billable AND duration IS NOT NULL AND hourly_rate IS NOT NULL 
      THEN ROUND((duration::DECIMAL / 60) * hourly_rate)
      ELSE 0
    END
  ) STORED,
  
  -- Status and metadata
  status TEXT CHECK (status IN ('running', 'stopped', 'invoiced', 'paid')) DEFAULT 'stopped',
  is_timer_running BOOLEAN DEFAULT FALSE,
  
  -- Additional fields
  notes TEXT,
  tags TEXT[],
  screenshots TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_client_id ON public.time_entries(client_id);
CREATE INDEX idx_time_entries_project_id ON public.time_entries(project_id);
CREATE INDEX idx_time_entries_start_time ON public.time_entries(start_time);
CREATE INDEX idx_time_entries_marketing_category ON public.time_entries(marketing_category);
CREATE INDEX idx_time_entries_marketing_channel ON public.time_entries(marketing_channel);
CREATE INDEX idx_time_entries_billable ON public.time_entries(billable);
CREATE INDEX idx_time_entries_status ON public.time_entries(status);
CREATE INDEX idx_time_entries_campaign_platform ON public.time_entries(campaign_platform);

-- =============================================
-- 5. INVOICES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT NOT NULL,
  
  -- Invoice details
  invoice_number TEXT NOT NULL,
  title TEXT,
  description TEXT,
  
  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  period_start DATE,
  period_end DATE,
  
  -- Amounts in cents
  subtotal BIGINT NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,4) DEFAULT 0.0,
  tax_amount BIGINT GENERATED ALWAYS AS (ROUND(subtotal * tax_rate)) STORED,
  total_amount BIGINT GENERATED ALWAYS AS (subtotal + ROUND(subtotal * tax_rate)) STORED,
  
  -- Currency and terms
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  payment_terms INTEGER NOT NULL DEFAULT 30, -- days
  
  -- Status and payment info
  status invoice_status NOT NULL DEFAULT 'draft',
  payment_date DATE,
  payment_method TEXT,
  payment_reference TEXT,
  
  -- Metadata
  notes TEXT,
  terms TEXT,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, invoice_number)
);

CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_invoices_created_at ON public.invoices(created_at);

-- =============================================
-- 6. INVOICE LINE ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  time_entry_id UUID REFERENCES public.time_entries(id) ON DELETE SET NULL,
  
  -- Line item details
  description TEXT NOT NULL,
  marketing_channel TEXT,
  marketing_category TEXT,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_type TEXT DEFAULT 'hours',
  rate BIGINT NOT NULL, -- in cents
  amount BIGINT GENERATED ALWAYS AS (ROUND(quantity * rate)) STORED,
  
  -- Service date
  service_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(invoice_id, time_entry_id)
);

CREATE INDEX idx_invoice_line_items_invoice_id ON public.invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_line_items_time_entry_id ON public.invoice_line_items(time_entry_id);
CREATE INDEX idx_invoice_line_items_marketing_channel ON public.invoice_line_items(marketing_channel);

-- Add invoice_id to time_entries for tracking
ALTER TABLE time_entries 
ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_time_entries_invoice_id ON time_entries(invoice_id);

-- =============================================
-- 7. RETAINER USAGE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.retainer_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Period info
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Usage tracking
  allocated_hours INTEGER NOT NULL,
  used_hours DECIMAL(10,2) DEFAULT 0,
  usage_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN allocated_hours > 0 
      THEN ROUND((used_hours / allocated_hours) * 100, 2)
      ELSE 0
    END
  ) STORED,
  
  -- Alert tracking
  alert_75_sent BOOLEAN DEFAULT FALSE,
  alert_90_sent BOOLEAN DEFAULT FALSE,
  alert_100_sent BOOLEAN DEFAULT FALSE,
  
  -- Status
  status TEXT CHECK (status IN ('active', 'completed', 'rolled_over')) DEFAULT 'active',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_retainer_usage_client_id ON public.retainer_usage(client_id);
CREATE INDEX idx_retainer_usage_user_id ON public.retainer_usage(user_id);
CREATE INDEX idx_retainer_usage_period ON public.retainer_usage(period_start, period_end);
CREATE INDEX idx_retainer_usage_status ON public.retainer_usage(status);

-- =============================================
-- 8. TEAM MEMBERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
  status TEXT CHECK (status IN ('active', 'invited', 'inactive')) DEFAULT 'invited',
  permissions JSONB DEFAULT '[]'::jsonb,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_email ON public.team_members(email);
CREATE INDEX idx_team_members_status ON public.team_members(status);

-- =============================================
-- 9. API KEYS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  prefix TEXT NOT NULL,
  permissions JSONB DEFAULT '["read"]'::jsonb,
  rate_limit INTEGER DEFAULT 1000,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('active', 'inactive', 'expired')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_prefix ON public.api_keys(prefix);
CREATE INDEX idx_api_keys_status ON public.api_keys(status);

-- =============================================
-- 10. NOTIFICATION SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email Notifications
  email_enabled BOOLEAN DEFAULT TRUE,
  email_daily_summary BOOLEAN DEFAULT TRUE,
  email_weekly_report BOOLEAN DEFAULT FALSE,
  email_invoice_sent BOOLEAN DEFAULT TRUE,
  email_payment_received BOOLEAN DEFAULT TRUE,
  email_team_updates BOOLEAN DEFAULT TRUE,
  email_project_updates BOOLEAN DEFAULT TRUE,
  email_timer_reminders BOOLEAN DEFAULT FALSE,
  
  -- Push Notifications
  push_enabled BOOLEAN DEFAULT FALSE,
  push_timer_reminders BOOLEAN DEFAULT FALSE,
  push_invoice_updates BOOLEAN DEFAULT FALSE,
  push_team_mentions BOOLEAN DEFAULT TRUE,
  push_project_deadlines BOOLEAN DEFAULT TRUE,
  
  -- In-App Notifications
  app_enabled BOOLEAN DEFAULT TRUE,
  app_sound_enabled BOOLEAN DEFAULT TRUE,
  app_desktop_enabled BOOLEAN DEFAULT FALSE,
  
  -- Slack Integration
  slack_enabled BOOLEAN DEFAULT FALSE,
  slack_webhook_url TEXT,
  slack_channel TEXT,
  slack_daily_summary BOOLEAN DEFAULT FALSE,
  slack_timer_reminders BOOLEAN DEFAULT FALSE,
  slack_invoice_updates BOOLEAN DEFAULT FALSE,
  
  -- Quiet Hours
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  quiet_hours_timezone TEXT DEFAULT 'UTC',
  
  -- Frequency Settings
  summary_frequency TEXT CHECK (summary_frequency IN ('never', 'daily', 'weekly', 'monthly')) DEFAULT 'daily',
  reminder_frequency TEXT CHECK (reminder_frequency IN ('never', 'hourly', 'daily', 'weekly')) DEFAULT 'daily',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notification_settings_user_id ON public.notification_settings(user_id);

-- =============================================
-- 11. ACTIVITY LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  category TEXT CHECK (category IN ('auth', 'time', 'project', 'invoice', 'team', 'settings', 'api')),
  description TEXT,
  user_name TEXT,
  user_email TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT CHECK (status IN ('success', 'failed', 'warning')) DEFAULT 'success',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_category ON public.activity_logs(category);
CREATE INDEX idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX idx_activity_logs_timestamp ON public.activity_logs(timestamp DESC);
CREATE INDEX idx_activity_logs_status ON public.activity_logs(status);

-- =============================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON public.time_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at 
  BEFORE UPDATE ON public.invoices 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_line_items_updated_at BEFORE UPDATE ON public.invoice_line_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retainer_usage_updated_at BEFORE UPDATE ON public.retainer_usage 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retainer_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Clients policies
CREATE POLICY "Users can view own clients" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON public.clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON public.clients
  FOR DELETE USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Time entries policies
CREATE POLICY "Users can view own time entries" ON public.time_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own time entries" ON public.time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own time entries" ON public.time_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own time entries" ON public.time_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" ON public.invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON public.invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" ON public.invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Invoice line items policies
CREATE POLICY "Users can view own invoice line items" ON public.invoice_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own invoice line items" ON public.invoice_line_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own invoice line items" ON public.invoice_line_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own invoice line items" ON public.invoice_line_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

-- Retainer usage policies
CREATE POLICY "Users can view own retainer usage" ON public.retainer_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own retainer usage" ON public.retainer_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own retainer usage" ON public.retainer_usage
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own retainer usage" ON public.retainer_usage
  FOR DELETE USING (auth.uid() = user_id);

-- Team members policies
CREATE POLICY "Users can view team members" ON public.team_members
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM public.team_members WHERE team_id = team_members.team_id
  ));

CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM public.team_members 
    WHERE team_id = team_members.team_id 
    AND role IN ('owner', 'admin')
  ));

-- API keys policies
CREATE POLICY "Users can view own API keys" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own API keys" ON public.api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Notification settings policies
CREATE POLICY "Users can view own notification settings" ON public.notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notification settings" ON public.notification_settings
  FOR ALL USING (auth.uid() = user_id);

-- Activity logs policies
CREATE POLICY "Users can view own activity logs" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_category TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_status TEXT DEFAULT 'success'
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
  v_user_email TEXT;
  v_user_name TEXT;
BEGIN
  -- Get user details
  SELECT email, full_name INTO v_user_email, v_user_name
  FROM public.profiles
  WHERE id = p_user_id;

  -- Insert activity log
  INSERT INTO public.activity_logs (
    user_id, action, category, description, 
    user_email, user_name, metadata, status
  ) VALUES (
    p_user_id, p_action, p_category, p_description,
    v_user_email, v_user_name, p_metadata, p_status
  ) RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired data
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
  -- Delete expired API keys
  UPDATE public.api_keys 
  SET status = 'expired' 
  WHERE expires_at < NOW() AND status = 'active';

  -- Delete old activity logs (older than 90 days)
  DELETE FROM public.activity_logs 
  WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;