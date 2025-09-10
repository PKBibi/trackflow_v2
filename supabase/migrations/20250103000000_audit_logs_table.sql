-- =============================================
-- Audit Logs Table for Security and Compliance
-- Run this after the performance indexes migration
-- 
-- Note: Partial indexes cannot use non-IMMUTABLE functions like NOW()
-- For time-based filtering, the application should pass specific dates
-- =============================================

-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Event identification
  event_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
  
  -- User context
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  session_id TEXT,
  
  -- Request context
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,
  
  -- Resource context
  resource_type TEXT,
  resource_id TEXT,
  
  -- Data changes
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Operation result
  success BOOLEAN NOT NULL,
  error_message TEXT,
  
  -- Timestamps
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX idx_audit_logs_severity ON public.audit_logs(severity);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_success ON public.audit_logs(success);
CREATE INDEX idx_audit_logs_ip_address ON public.audit_logs(ip_address);

-- Composite indexes for common queries
CREATE INDEX idx_audit_logs_user_event ON public.audit_logs(user_id, event_type, timestamp DESC);
CREATE INDEX idx_audit_logs_security ON public.audit_logs(severity, success, timestamp DESC)
  WHERE severity IN ('high', 'critical');
CREATE INDEX idx_audit_logs_failed_ops ON public.audit_logs(event_type, timestamp DESC)
  WHERE success = false;

-- JSONB indexes for metadata queries
CREATE INDEX idx_audit_logs_metadata ON public.audit_logs USING gin(metadata);
CREATE INDEX idx_audit_logs_old_values ON public.audit_logs USING gin(old_values);
CREATE INDEX idx_audit_logs_new_values ON public.audit_logs USING gin(new_values);

-- Partial index for recent critical events (performance optimization)
-- Note: Cannot use NOW() in partial index as it's not IMMUTABLE
-- This index will help with queries that filter by severity and sort by timestamp
CREATE INDEX idx_audit_logs_recent_critical ON public.audit_logs(severity, timestamp DESC, user_id)
  WHERE severity = 'critical';

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (restrictive - admin access only)
-- Users cannot view their own audit logs for security reasons
-- Only system/admin can access audit logs

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND profiles.email LIKE '%@trackflow.com' -- Company admin emails only
    )
  );

-- Create a view for security dashboard
CREATE OR REPLACE VIEW public.security_events AS
SELECT 
  id,
  event_type,
  severity,
  user_id,
  user_email,
  ip_address,
  success,
  error_message,
  timestamp,
  metadata
FROM public.audit_logs 
WHERE severity IN ('high', 'critical')
  OR event_type LIKE 'security:%'
  OR success = false;

-- Grant permissions
GRANT SELECT ON public.security_events TO authenticated;

-- Function to clean up old audit logs (data retention)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  -- Keep critical events for 2 years, others for 1 year
  DELETE FROM public.audit_logs 
  WHERE timestamp < NOW() - INTERVAL '2 years'
    AND severity = 'critical';
    
  DELETE FROM public.audit_logs 
  WHERE timestamp < NOW() - INTERVAL '1 year'
    AND severity != 'critical';
    
  -- Log the cleanup operation
  INSERT INTO public.audit_logs (
    event_type,
    severity,
    success,
    metadata,
    timestamp
  ) VALUES (
    'admin:audit_cleanup',
    'low',
    true,
    jsonb_build_object('cleaned_at', NOW()),
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit summary for dashboard
CREATE OR REPLACE FUNCTION get_audit_summary(
  p_user_id UUID DEFAULT NULL,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  total_events BIGINT,
  critical_events BIGINT,
  failed_operations BIGINT,
  unique_users BIGINT,
  top_events JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH event_stats AS (
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE severity = 'critical') as critical,
      COUNT(*) FILTER (WHERE success = false) as failed,
      COUNT(DISTINCT user_id) as users
    FROM public.audit_logs
    WHERE timestamp > NOW() - (p_days || ' days')::interval
      AND (p_user_id IS NULL OR user_id = p_user_id)
  ),
  top_event_types AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'event_type', event_type,
        'count', cnt
      ) ORDER BY cnt DESC
    ) as top_events
    FROM (
      SELECT event_type, COUNT(*) as cnt
      FROM public.audit_logs
      WHERE timestamp > NOW() - (p_days || ' days')::interval
        AND (p_user_id IS NULL OR user_id = p_user_id)
      GROUP BY event_type
      ORDER BY cnt DESC
      LIMIT 10
    ) t
  )
  SELECT 
    e.total,
    e.critical,
    e.failed,
    e.users,
    t.top_events
  FROM event_stats e, top_event_types t;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update table statistics
ANALYZE public.audit_logs;