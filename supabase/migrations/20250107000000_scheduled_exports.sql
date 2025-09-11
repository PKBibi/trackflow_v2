-- Enable cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Scheduled exports table
CREATE TABLE IF NOT EXISTS public.scheduled_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Export configuration
  format TEXT CHECK (format IN ('csv', 'excel', 'pdf')) NOT NULL DEFAULT 'csv',
  data_type TEXT CHECK (data_type IN ('time_entries', 'clients', 'projects')) NOT NULL DEFAULT 'time_entries',
  
  -- Filters (stored as JSONB for flexibility)
  filters JSONB DEFAULT '{}',
  
  -- Schedule configuration
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')) NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
  time_of_day TIME NOT NULL DEFAULT '09:00:00',
  
  -- Delivery settings
  email_to TEXT NOT NULL,
  email_subject TEXT,
  email_body TEXT,
  
  -- Status and metadata
  is_active BOOLEAN DEFAULT true,
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  last_run_status TEXT CHECK (last_run_status IN ('success', 'error', 'pending')),
  last_error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.scheduled_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own scheduled exports"
ON public.scheduled_exports
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Export execution history
CREATE TABLE IF NOT EXISTS public.export_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheduled_export_id UUID REFERENCES public.scheduled_exports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Execution details
  status TEXT CHECK (status IN ('success', 'error', 'pending')) NOT NULL DEFAULT 'pending',
  file_name TEXT,
  file_size INTEGER,
  record_count INTEGER,
  error_message TEXT,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security for history
ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own export history"
ON public.export_history
FOR SELECT
USING (auth.uid() = user_id);

-- Function to calculate next run time
CREATE OR REPLACE FUNCTION public.calculate_next_run(
  frequency TEXT,
  day_of_week INTEGER,
  day_of_month INTEGER,
  time_of_day TIME,
  from_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
AS $$
DECLARE
  next_run TIMESTAMPTZ;
  target_time TIMESTAMPTZ;
BEGIN
  CASE frequency
    WHEN 'daily' THEN
      -- Next occurrence of the time today or tomorrow
      target_time := date_trunc('day', from_date) + time_of_day;
      IF target_time <= from_date THEN
        target_time := target_time + INTERVAL '1 day';
      END IF;
      next_run := target_time;
      
    WHEN 'weekly' THEN
      -- Next occurrence of day_of_week at time_of_day
      target_time := date_trunc('week', from_date) + (day_of_week * INTERVAL '1 day') + time_of_day;
      IF target_time <= from_date THEN
        target_time := target_time + INTERVAL '7 days';
      END IF;
      next_run := target_time;
      
    WHEN 'monthly' THEN
      -- Next occurrence of day_of_month at time_of_day
      target_time := date_trunc('month', from_date) + ((day_of_month - 1) * INTERVAL '1 day') + time_of_day;
      IF target_time <= from_date THEN
        -- Move to next month
        target_time := date_trunc('month', from_date + INTERVAL '1 month') + 
                      ((day_of_month - 1) * INTERVAL '1 day') + time_of_day;
      END IF;
      next_run := target_time;
      
    ELSE
      RAISE EXCEPTION 'Invalid frequency: %', frequency;
  END CASE;
  
  RETURN next_run;
END;
$$;

-- Trigger to update next_run_at when scheduled export is created or modified
CREATE OR REPLACE FUNCTION public.update_next_run_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.next_run_at := public.calculate_next_run(
    NEW.frequency,
    NEW.day_of_week,
    NEW.day_of_month,
    NEW.time_of_day
  );
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_next_run
  BEFORE INSERT OR UPDATE ON public.scheduled_exports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_next_run_trigger();

-- Indexes for performance
CREATE INDEX idx_scheduled_exports_user_id ON public.scheduled_exports(user_id);
CREATE INDEX idx_scheduled_exports_next_run ON public.scheduled_exports(next_run_at) WHERE is_active = true;
CREATE INDEX idx_export_history_scheduled_export_id ON public.export_history(scheduled_export_id);
CREATE INDEX idx_export_history_user_id ON public.export_history(user_id);