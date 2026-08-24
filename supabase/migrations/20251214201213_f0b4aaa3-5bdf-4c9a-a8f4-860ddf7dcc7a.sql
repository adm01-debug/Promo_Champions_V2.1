-- Create table for SDR consecutive alerts history
CREATE TABLE public.sdr_alert_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  triggered_by TEXT DEFAULT 'cron',
  sdrs_notified INTEGER NOT NULL DEFAULT 0,
  threshold_used INTEGER NOT NULL DEFAULT 3,
  sdr_details JSONB NOT NULL DEFAULT '[]'::jsonb,
  admin_emails TEXT[] NOT NULL DEFAULT '{}'::text[]
);

-- Enable RLS
ALTER TABLE public.sdr_alert_history ENABLE ROW LEVEL SECURITY;

-- Admins and managers can view alert history
CREATE POLICY "Admins and managers can view sdr_alert_history" 
ON public.sdr_alert_history 
FOR SELECT 
USING (is_admin_or_manager(auth.uid()));

-- Service role can insert
CREATE POLICY "Service role can insert sdr_alert_history" 
ON public.sdr_alert_history 
FOR INSERT 
WITH CHECK (true);

-- Index for performance
CREATE INDEX idx_sdr_alert_history_created_at ON public.sdr_alert_history(created_at DESC);