-- =============================================
-- Two-Factor Authentication Tables
-- Run this after the audit logs migration
-- =============================================

-- Table for temporary 2FA setup (expires after 10 minutes)
CREATE TABLE IF NOT EXISTS public.two_factor_temp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL, -- Encrypted TOTP secret
  backup_codes TEXT NOT NULL, -- Encrypted backup codes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Table for permanent 2FA settings
CREATE TABLE IF NOT EXISTS public.user_two_factor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 2FA Configuration
  secret TEXT NOT NULL, -- Encrypted TOTP secret
  backup_codes TEXT NOT NULL, -- Encrypted backup codes (JSON array)
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Timestamps
  enabled_at TIMESTAMPTZ,
  disabled_at TIMESTAMPTZ,
  last_used TIMESTAMPTZ,
  backup_codes_generated_at TIMESTAMPTZ,
  
  -- Recovery
  recovery_email TEXT,
  recovery_phone TEXT,
  
  -- Statistics
  successful_verifications INTEGER DEFAULT 0,
  failed_attempts INTEGER DEFAULT 0,
  last_failed_attempt TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for 2FA verification sessions (for login flow)
CREATE TABLE IF NOT EXISTS public.two_factor_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_two_factor_temp_user_id ON public.two_factor_temp(user_id);
CREATE INDEX idx_two_factor_temp_expires ON public.two_factor_temp(expires_at);

CREATE INDEX idx_user_two_factor_user_id ON public.user_two_factor(user_id);
CREATE INDEX idx_user_two_factor_enabled ON public.user_two_factor(enabled);

CREATE INDEX idx_two_factor_sessions_user_id ON public.two_factor_sessions(user_id);
CREATE INDEX idx_two_factor_sessions_token ON public.two_factor_sessions(session_token);
CREATE INDEX idx_two_factor_sessions_expires ON public.two_factor_sessions(expires_at);

-- Enable Row Level Security
ALTER TABLE public.two_factor_temp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_two_factor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.two_factor_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for two_factor_temp
CREATE POLICY "Users can manage own 2FA temp setup" ON public.two_factor_temp
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_two_factor
CREATE POLICY "Users can view own 2FA settings" ON public.user_two_factor
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own 2FA settings" ON public.user_two_factor
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for two_factor_sessions
CREATE POLICY "Users can view own 2FA sessions" ON public.two_factor_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage 2FA sessions" ON public.two_factor_sessions
  FOR ALL USING (true);

-- Function to clean up expired 2FA data
CREATE OR REPLACE FUNCTION cleanup_expired_two_factor()
RETURNS void AS $$
BEGIN
  -- Delete expired temporary setups
  DELETE FROM public.two_factor_temp 
  WHERE expires_at < NOW();
  
  -- Delete expired sessions
  DELETE FROM public.two_factor_sessions 
  WHERE expires_at < NOW();
  
  -- Log cleanup
  INSERT INTO public.audit_logs (
    event_type,
    severity,
    success,
    metadata,
    timestamp
  ) VALUES (
    'admin:2fa_cleanup',
    'low',
    true,
    jsonb_build_object(
      'temp_deleted', (SELECT COUNT(*) FROM public.two_factor_temp WHERE expires_at < NOW()),
      'sessions_deleted', (SELECT COUNT(*) FROM public.two_factor_sessions WHERE expires_at < NOW())
    ),
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user needs 2FA
CREATE OR REPLACE FUNCTION check_two_factor_required(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_enabled BOOLEAN;
BEGIN
  SELECT enabled INTO v_enabled
  FROM public.user_two_factor
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_enabled, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment 2FA attempt counter
CREATE OR REPLACE FUNCTION increment_two_factor_attempts(p_user_id UUID, p_success BOOLEAN)
RETURNS void AS $$
BEGIN
  IF p_success THEN
    UPDATE public.user_two_factor
    SET successful_verifications = successful_verifications + 1,
        last_used = NOW()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE public.user_two_factor
    SET failed_attempts = failed_attempts + 1,
        last_failed_attempt = NOW()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_user_two_factor_updated_at
  BEFORE UPDATE ON public.user_two_factor
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Update table statistics
ANALYZE public.two_factor_temp;
ANALYZE public.user_two_factor;
ANALYZE public.two_factor_sessions;