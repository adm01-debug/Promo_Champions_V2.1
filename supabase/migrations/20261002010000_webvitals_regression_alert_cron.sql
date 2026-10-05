-- WEBVITALS-REGRESSION: alerta diário de regressão de Web Vitals.
--
-- Agenda `webvitals-regression-alert` (edge function) 1x/dia às 11:15 UTC,
-- que compara o p75 de LCP/CLS/FCP do último dia com a média móvel dos 7
-- dias anteriores (dados de `public.v_web_vitals_p75`) e posta no Slack
-- via SLACK_WEBHOOK_URL quando há regressão.
--
-- Reutiliza o mecanismo existente: a edge function entra na allowlist de
-- `public.trigger_internal_edge_job` (credenciais de _internal_secrets em
-- runtime, nada de segredo literal no pg_cron). Idempotente: pode ser
-- reexecutada sem duplicar o job. Falhas são capturadas pelo
-- 'cron-failure-alerter-10min' como os demais jobs internos.

CREATE OR REPLACE FUNCTION public.trigger_internal_edge_job(p_function_name text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  v_base_url text;
  v_anon_key text;
  v_cron_secret text;
  v_request_id bigint;
BEGIN
  IF p_function_name IS NULL OR NOT (
    p_function_name = ANY (ARRAY[
      'notify-v4-quote-status',
      'check-v4-callback-alerts',
      'cron-failure-alerter',
      'process-call-recording-ingest',
      'edge-retry-threshold-alert',
      'deal-risk-digest',
      'email-bulk-retry',
      'wal-health-alert',
      'winloss-webhook-health-monitor',
      'webvitals-regression-alert'
    ]::text[])
  ) THEN
    RAISE EXCEPTION 'internal_edge_job_not_allowed';
  END IF;

  SELECT
    max(s.value) FILTER (WHERE s.key = 'functions_base_url'),
    max(s.value) FILTER (WHERE s.key = 'anon_key'),
    max(s.value) FILTER (WHERE s.key = 'coaching_cron_secret')
  INTO v_base_url, v_anon_key, v_cron_secret
  FROM public._internal_secrets AS s;

  IF v_base_url IS NULL OR v_anon_key IS NULL OR v_cron_secret IS NULL THEN
    RAISE EXCEPTION 'internal_edge_job_secrets_missing';
  END IF;
  IF v_base_url !~ '^https://[^[:space:]]+$' THEN
    RAISE EXCEPTION 'internal_edge_job_base_url_must_be_https';
  END IF;

  SELECT net.http_post(
    url := rtrim(v_base_url, '/') || '/' || p_function_name,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', v_anon_key,
      'Authorization', 'Bearer ' || v_anon_key,
      'X-Cron-Secret', v_cron_secret
    ),
    body := jsonb_build_object('scheduled_at', now())
  )
  INTO v_request_id;

  RETURN v_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.trigger_internal_edge_job(text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_internal_edge_job(text)
  TO service_role;

DO $$
BEGIN
  PERFORM cron.unschedule('webvitals-regression-alert-daily')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'webvitals-regression-alert-daily');
  PERFORM cron.schedule(
    'webvitals-regression-alert-daily',
    '15 11 * * *',
    'SELECT public.trigger_internal_edge_job(''webvitals-regression-alert'');'
  );
END;
$$;
