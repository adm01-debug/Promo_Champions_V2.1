CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.trigger_campaign_health_alert()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  PERFORM extensions.http_post(
    url := 'https://rapjswienfhkobhlamxb.supabase.co/functions/v1/campaign-health-alert',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGpzd2llbmZoa29iaGxhbXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODM2MDUsImV4cCI6MjA5NDA1OTYwNX0.V8nfjFxM8BRBORwGwadtN3xMPbowTuKDBZm5xpUX1OE'
    ),
    body := '{}'::jsonb
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'trigger_campaign_health_alert failed: %', SQLERRM;
END;
$$;

REVOKE ALL ON FUNCTION public.trigger_campaign_health_alert() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_campaign_health_alert() TO service_role;

DO $$
BEGIN
  PERFORM cron.unschedule('campaign-health-alert-30min')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'campaign-health-alert-30min');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'campaign-health-alert-30min',
  '*/30 * * * *',
  $$SELECT public.trigger_campaign_health_alert();$$
);