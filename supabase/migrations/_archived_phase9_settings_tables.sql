-- =============================================
-- Phase 9: Settings & Preferences Tables
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE
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

-- Create indexes for profiles
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- =============================================
-- 2. TEAM MEMBERS TABLE
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

-- Create indexes for team_members
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_email ON public.team_members(email);
CREATE INDEX idx_team_members_status ON public.team_members(status);

-- =============================================
-- 3. TEAM INVITES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.team_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'member', 'viewer')) DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')) DEFAULT 'pending',
  token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for team_invites
CREATE INDEX idx_team_invites_email ON public.team_invites(email);
CREATE INDEX idx_team_invites_status ON public.team_invites(status);
CREATE INDEX idx_team_invites_token ON public.team_invites(token);

-- =============================================
-- 4. API KEYS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- Store hashed version of the key
  prefix TEXT NOT NULL, -- First 7 characters for identification
  permissions JSONB DEFAULT '["read"]'::jsonb,
  rate_limit INTEGER DEFAULT 1000, -- requests per hour
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('active', 'inactive', 'expired')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for api_keys
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_prefix ON public.api_keys(prefix);
CREATE INDEX idx_api_keys_status ON public.api_keys(status);

-- =============================================
-- 5. USER SECURITY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_security (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_method TEXT CHECK (two_factor_method IN ('authenticator', 'sms', NULL)),
  two_factor_secret TEXT, -- Encrypted in production
  backup_codes JSONB DEFAULT '[]'::jsonb, -- Encrypted in production
  recovery_email TEXT,
  recovery_phone TEXT,
  security_questions JSONB DEFAULT '[]'::jsonb,
  last_password_change TIMESTAMPTZ,
  password_history JSONB DEFAULT '[]'::jsonb, -- Hashed passwords
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user_security
CREATE INDEX idx_user_security_user_id ON public.user_security(user_id);

-- =============================================
-- 6. NOTIFICATION SETTINGS TABLE
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

-- Create index for notification_settings
CREATE INDEX idx_notification_settings_user_id ON public.notification_settings(user_id);

-- =============================================
-- 7. ACTIVITY LOGS TABLE
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

-- Create indexes for activity_logs
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_category ON public.activity_logs(category);
CREATE INDEX idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX idx_activity_logs_timestamp ON public.activity_logs(timestamp DESC);
CREATE INDEX idx_activity_logs_status ON public.activity_logs(status);

-- =============================================
-- 8. USER SESSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  device TEXT,
  browser TEXT,
  os TEXT,
  ip_address INET,
  location TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for user_sessions
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX idx_user_sessions_last_active ON public.user_sessions(last_active DESC);

-- =============================================
-- 9. LOGIN HISTORY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  location TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  status TEXT CHECK (status IN ('success', 'failed')) DEFAULT 'success',
  method TEXT CHECK (method IN ('password', '2fa', 'oauth', 'magic_link', 'api_key')),
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for login_history
CREATE INDEX idx_login_history_user_id ON public.login_history(user_id);
CREATE INDEX idx_login_history_timestamp ON public.login_history(timestamp DESC);
CREATE INDEX idx_login_history_status ON public.login_history(status);

-- =============================================
-- 10. API USAGE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time INTEGER, -- in milliseconds
  request_size INTEGER, -- in bytes
  response_size INTEGER, -- in bytes
  ip_address INET,
  user_agent TEXT,
  date DATE DEFAULT CURRENT_DATE,
  requests INTEGER DEFAULT 1,
  errors INTEGER DEFAULT 0,
  latency INTEGER DEFAULT 0, -- average latency in ms
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for api_usage
CREATE INDEX idx_api_usage_user_id ON public.api_usage(user_id);
CREATE INDEX idx_api_usage_api_key_id ON public.api_usage(api_key_id);
CREATE INDEX idx_api_usage_date ON public.api_usage(date DESC);
CREATE INDEX idx_api_usage_endpoint ON public.api_usage(endpoint);

-- =============================================
-- 11. EXPORT HISTORY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.export_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  format TEXT CHECK (format IN ('csv', 'json', 'excel', 'pdf')),
  size BIGINT, -- in bytes
  status TEXT CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
  download_url TEXT,
  file_path TEXT,
  options JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for export_history
CREATE INDEX idx_export_history_user_id ON public.export_history(user_id);
CREATE INDEX idx_export_history_status ON public.export_history(status);
CREATE INDEX idx_export_history_created_at ON public.export_history(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

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

-- User security policies
CREATE POLICY "Users can view own security settings" ON public.user_security
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own security settings" ON public.user_security
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

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" ON public.user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Login history policies
CREATE POLICY "Users can view own login history" ON public.login_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert login history" ON public.login_history
  FOR INSERT WITH CHECK (true);

-- API usage policies
CREATE POLICY "Users can view own API usage" ON public.api_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert API usage" ON public.api_usage
  FOR INSERT WITH CHECK (true);

-- Export history policies
CREATE POLICY "Users can view own export history" ON public.export_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create exports" ON public.export_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================

-- Function to update updated_at timestamp
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

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_invites_updated_at BEFORE UPDATE ON public.team_invites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_security_updated_at BEFORE UPDATE ON public.user_security
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTION TO LOG ACTIVITIES
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

-- =============================================
-- FUNCTION TO CLEANUP EXPIRED DATA
-- =============================================

CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
  -- Delete expired team invites
  UPDATE public.team_invites 
  SET status = 'expired' 
  WHERE expires_at < NOW() AND status = 'pending';

  -- Delete expired API keys
  UPDATE public.api_keys 
  SET status = 'expired' 
  WHERE expires_at < NOW() AND status = 'active';

  -- Delete old activity logs (older than 90 days)
  DELETE FROM public.activity_logs 
  WHERE timestamp < NOW() - INTERVAL '90 days';

  -- Delete old login history (older than 90 days)
  DELETE FROM public.login_history 
  WHERE timestamp < NOW() - INTERVAL '90 days';

  -- Delete expired sessions
  DELETE FROM public.user_sessions 
  WHERE expires_at < NOW();

  -- Delete expired export history
  DELETE FROM public.export_history 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup function to run daily (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-data', '0 2 * * *', 'SELECT cleanup_expired_data();');

-- =============================================
-- SAMPLE DATA FOR TESTING (Optional)
-- =============================================

-- Insert sample profile for authenticated user (uncomment to use)
-- INSERT INTO public.profiles (id, email, full_name)
-- SELECT id, email, raw_user_meta_data->>'full_name'
-- FROM auth.users
-- WHERE id = auth.uid()
-- ON CONFLICT (id) DO NOTHING;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =============================================
-- END OF MIGRATION
-- =============================================

