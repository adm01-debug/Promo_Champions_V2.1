-- Reconcilia os jobs operacionais com os handlers implantados e autenticados.
-- Não grava credenciais no pg_cron: os valores são carregados no runtime da
-- tabela interna já existente. A migration pode ser reexecutada sem duplicar jobs.

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
      'email-bulk-retry'
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
  PERFORM cron.unschedule('notify-v4-quote-status-every-5min')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'notify-v4-quote-status-every-5min');
  PERFORM cron.schedule(
    'notify-v4-quote-status-every-5min',
    '*/5 * * * *',
    'SELECT public.trigger_internal_edge_job(''notify-v4-quote-status'');'
  );

  PERFORM cron.unschedule('check-v4-callback-alerts-every-5min')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'check-v4-callback-alerts-every-5min');
  PERFORM cron.schedule(
    'check-v4-callback-alerts-every-5min',
    '*/5 * * * *',
    'SELECT public.trigger_internal_edge_job(''check-v4-callback-alerts'');'
  );

  PERFORM cron.unschedule('cron-failure-alerter-10min')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cron-failure-alerter-10min');
  PERFORM cron.schedule(
    'cron-failure-alerter-10min',
    '*/10 * * * *',
    'SELECT public.trigger_internal_edge_job(''cron-failure-alerter'');'
  );

  PERFORM cron.unschedule('process-call-recording-ingest-1min')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-call-recording-ingest-1min');
  PERFORM cron.schedule(
    'process-call-recording-ingest-1min',
    '* * * * *',
    'SELECT public.trigger_internal_edge_job(''process-call-recording-ingest'');'
  );

  -- 11:00 UTC corresponde a 08:00 BRT; o Brasil não adota horário de verão.
  PERFORM cron.unschedule('deal-risk-digest-daily')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'deal-risk-digest-daily');
  PERFORM cron.schedule(
    'deal-risk-digest-daily',
    '0 11 * * *',
    'SELECT public.trigger_internal_edge_job(''deal-risk-digest'');'
  );

  PERFORM cron.unschedule('email-bulk-retry-15min')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'email-bulk-retry-15min');
  PERFORM cron.schedule(
    'email-bulk-retry-15min',
    '*/15 * * * *',
    'SELECT public.trigger_internal_edge_job(''email-bulk-retry'');'
  );
END;
$$;
