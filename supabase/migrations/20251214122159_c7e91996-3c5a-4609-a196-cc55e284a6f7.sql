-- Create table for security alert history
CREATE TABLE public.security_alert_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL DEFAULT 'access_denied_spike',
  recipients TEXT[] NOT NULL,
  access_count INTEGER NOT NULL,
  time_window_hours INTEGER NOT NULL,
  threshold_used INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_alert_history ENABLE ROW LEVEL SECURITY;

-- Only admins can view alert history
CREATE POLICY "Admins can view alert history"
ON public.security_alert_history
FOR SELECT
USING (is_admin_or_manager(auth.uid()));

-- Allow insert from edge functions (service role)
CREATE POLICY "Service role can insert alert history"
ON public.security_alert_history
FOR INSERT
WITH CHECK (true);