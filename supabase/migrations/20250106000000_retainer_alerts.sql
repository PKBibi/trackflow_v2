-- Create function to update retainer usage when time entries are added
CREATE OR REPLACE FUNCTION public.update_retainer_usage()
RETURNS TRIGGER AS $$
DECLARE
  retainer_record RECORD;
  current_period_start DATE;
  current_period_end DATE;
  time_hours DECIMAL(10,2);
BEGIN
  -- Only process billable time entries for clients with retainers
  IF NEW.billable = false THEN
    RETURN NEW;
  END IF;

  -- Get client retainer info
  SELECT c.has_retainer, c.retainer_hours, c.retainer_start_date
  INTO retainer_record
  FROM public.clients c
  WHERE c.id = NEW.client_id AND c.has_retainer = true;
  
  -- Exit if client doesn't have retainer
  IF NOT FOUND OR retainer_record.has_retainer = false THEN
    RETURN NEW;
  END IF;
  
  -- Calculate current retainer period (monthly)
  current_period_start := DATE_TRUNC('month', COALESCE(NEW.start_time::date, CURRENT_DATE));
  current_period_end := current_period_start + INTERVAL '1 month' - INTERVAL '1 day';
  
  -- Convert duration to hours
  time_hours := COALESCE(NEW.duration, 0) / 60.0;
  
  -- Insert or update retainer usage for current period
  INSERT INTO public.retainer_usage (
    client_id,
    user_id,
    period_start,
    period_end,
    allocated_hours,
    used_hours
  )
  VALUES (
    NEW.client_id,
    NEW.user_id,
    current_period_start,
    current_period_end,
    retainer_record.retainer_hours,
    time_hours
  )
  ON CONFLICT (client_id, period_start, period_end)
  DO UPDATE SET
    used_hours = retainer_usage.used_hours + time_hours,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update retainer usage
DROP TRIGGER IF EXISTS trigger_update_retainer_usage ON public.time_entries;
CREATE TRIGGER trigger_update_retainer_usage
  AFTER INSERT OR UPDATE OF duration, billable ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_retainer_usage();

-- Create function to get clients needing alerts
CREATE OR REPLACE FUNCTION public.get_retainer_alerts()
RETURNS TABLE (
  client_id UUID,
  client_name TEXT,
  client_email TEXT,
  user_id UUID,
  usage_percentage DECIMAL(5,2),
  used_hours DECIMAL(10,2),
  allocated_hours INTEGER,
  period_start DATE,
  period_end DATE,
  alert_type TEXT,
  retainer_usage_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ru.client_id,
    c.name as client_name,
    c.email as client_email,
    ru.user_id,
    ru.usage_percentage,
    ru.used_hours,
    ru.allocated_hours,
    ru.period_start,
    ru.period_end,
    CASE 
      WHEN ru.usage_percentage >= 100 AND NOT ru.alert_100_sent THEN '100%'
      WHEN ru.usage_percentage >= 90 AND NOT ru.alert_90_sent THEN '90%'
      WHEN ru.usage_percentage >= 75 AND NOT ru.alert_75_sent THEN '75%'
      ELSE NULL
    END as alert_type,
    ru.id as retainer_usage_id
  FROM public.retainer_usage ru
  JOIN public.clients c ON c.id = ru.client_id
  WHERE ru.status = 'active'
    AND (
      (ru.usage_percentage >= 75 AND NOT ru.alert_75_sent) OR
      (ru.usage_percentage >= 90 AND NOT ru.alert_90_sent) OR
      (ru.usage_percentage >= 100 AND NOT ru.alert_100_sent)
    )
    AND ru.period_end >= CURRENT_DATE
  ORDER BY ru.usage_percentage DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to mark alert as sent
CREATE OR REPLACE FUNCTION public.mark_retainer_alert_sent(
  p_retainer_usage_id UUID,
  p_alert_type TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  CASE p_alert_type
    WHEN '75%' THEN
      UPDATE public.retainer_usage 
      SET alert_75_sent = true, updated_at = NOW()
      WHERE id = p_retainer_usage_id;
    WHEN '90%' THEN
      UPDATE public.retainer_usage 
      SET alert_90_sent = true, updated_at = NOW()
      WHERE id = p_retainer_usage_id;
    WHEN '100%' THEN
      UPDATE public.retainer_usage 
      SET alert_100_sent = true, updated_at = NOW()
      WHERE id = p_retainer_usage_id;
    ELSE
      RETURN FALSE;
  END CASE;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create unique constraint to prevent duplicate periods
ALTER TABLE public.retainer_usage 
ADD CONSTRAINT unique_client_period 
UNIQUE (client_id, period_start, period_end);