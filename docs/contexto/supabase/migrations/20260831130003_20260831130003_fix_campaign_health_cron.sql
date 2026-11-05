-- Corrige o destino e a autenticação do job campaign-health-alert sem gravar
-- chaves no código-fonte ou no corpo da função.
CREATE OR REPLACE FUNCTION public.trigger_campaign_health_alert()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
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
    RAISE EXCEPTION 'campaign_health_cron_secrets_missing';
  END IF;

  IF v_base_url !~ '^https://[^[:space:]]+$' THEN
    RAISE EXCEPTION 'campaign_health_cron_base_url_must_be_https';
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
END;
$$;

REVOKE ALL ON FUNCTION public.trigger_campaign_health_alert()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_campaign_health_alert()
  TO service_role;
