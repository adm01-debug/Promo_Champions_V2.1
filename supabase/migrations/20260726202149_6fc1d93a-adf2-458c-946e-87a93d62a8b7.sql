CREATE TABLE IF NOT EXISTS public.campaign_health_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.email_bulk_jobs(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('opt_out_rate', 'stalled', 'failure_rate')),
  severity text NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  message text NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.campaign_health_alerts TO authenticated;
GRANT ALL ON public.campaign_health_alerts TO service_role;

ALTER TABLE public.campaign_health_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner or admin can view campaign health alerts"
  ON public.campaign_health_alerts
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin can delete campaign health alerts"
  ON public.campaign_health_alerts
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_campaign_health_alerts_job_type
  ON public.campaign_health_alerts (job_id, alert_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaign_health_alerts_owner_created
  ON public.campaign_health_alerts (owner_id, created_at DESC);

CREATE TRIGGER trg_campaign_health_alerts_updated
  BEFORE UPDATE ON public.campaign_health_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();