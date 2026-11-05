CREATE OR REPLACE FUNCTION public.trigger_campaign_health_alert()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, net
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://rapjswienfhkobhlamxb.supabase.co/functions/v1/campaign-health-alert',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer [REDACTED_JWT]'
    ),
    body := '{}'::jsonb
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'trigger_campaign_health_alert failed: %', SQLERRM;
END;
$$;

REVOKE ALL ON FUNCTION public.trigger_campaign_health_alert() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_campaign_health_alert() TO service_role;
