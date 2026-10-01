-- Agenda os monitores de saúde que hoje existem apenas como código:
--   wal-health-alert                  a cada 5 min  (lag de replicação/WAL)
--   winloss-webhook-health-monitor    a cada 15 min (saúde dos webhooks win/loss)
-- Ambos passam a constar da allowlist de public.trigger_internal_edge_job, que
-- carrega credenciais de _internal_secrets em runtime (nada de segredo literal
-- no pg_cron). Idempotente: pode ser reexecutada sem duplicar jobs.
-- Falhas de execução são capturadas pelo job 'cron-failure-alerter-10min'
-- (fn_admin_get_new_cron_failures cobre todos os jobs de cron.job_run_details).

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
      'winloss-webhook-health-monitor'
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
  PERFORM cron.unschedule('wal-health-alert-5min')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'wal-health-alert-5min');
  PERFORM cron.schedule(
    'wal-health-alert-5min',
    '*/5 * * * *',
    'SELECT public.trigger_internal_edge_job(''wal-health-alert'');'
  );

  PERFORM cron.unschedule('winloss-webhook-health-monitor-15min')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'winloss-webhook-health-monitor-15min');
  PERFORM cron.schedule(
    'winloss-webhook-health-monitor-15min',
    '*/15 * * * *',
    'SELECT public.trigger_internal_edge_job(''winloss-webhook-health-monitor'');'
  );
END;
$$;
