CREATE OR REPLACE FUNCTION public.trigger_campaign_health_alert()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'net'
AS $function$
DECLARE
  v_base_url text;
  v_anon_key text;
  v_cron_secret text;
BEGIN
  SELECT
    max(s.value) FILTER (WHERE s.key = 'functions_base_url'),
    max(s.value) FILTER (WHERE s.key = 'anon_key'),
    max(s.value) FILTER (WHERE s.key = 'coaching_cron_secret')
  INTO v_base_url, v_anon_key, v_cron_secret
  FROM public._internal_secrets AS s;

  IF v_base_url IS NULL OR v_anon_key IS NULL OR v_cron_secret IS NULL THEN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('trigger_campaign_health_alert', 'campaign-health-alert',
            '{}'::jsonb, 'internal_edge_secrets_missing');
    RETURN;
  END IF;
  IF v_base_url !~ '^https://[^[:space:]]+$' THEN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('trigger_campaign_health_alert', 'campaign-health-alert',
            '{}'::jsonb, 'internal_edge_base_url_must_be_https');
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := rtrim(v_base_url, '/') || '/campaign-health-alert',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', v_anon_key,
      'Authorization', 'Bearer ' || v_anon_key,
      'X-Cron-Secret', v_cron_secret
    ),
    body := jsonb_build_object('scheduled_at', now())
  );
EXCEPTION WHEN OTHERS THEN
  BEGIN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('trigger_campaign_health_alert', 'campaign-health-alert',
            '{}'::jsonb, SQLERRM);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RAISE WARNING 'trigger_campaign_health_alert failed: %', SQLERRM;
END;
$function$
