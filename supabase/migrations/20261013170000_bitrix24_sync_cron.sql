-- Agenda o sync bidirecional do Bitrix24 via pg_cron.
-- bitrix24-sync entra na allowlist do trigger_internal_edge_job (mesmo padrão
-- das outras edge jobs: Authorization = anon key + X-Cron-Secret lido de
-- _internal_secrets, sem credencial no comando do job).

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
      -- operacionais pré-existentes
      'notify-v4-quote-status',
      'check-v4-callback-alerts',
      'cron-failure-alerter',
      'process-call-recording-ingest',
      'edge-retry-threshold-alert',
      'deal-risk-digest',
      'email-bulk-retry',
      'wal-health-alert',
      'winloss-webhook-health-monitor',
      'webvitals-regression-alert',
      -- máquina de vendas (Onda 1)
      'sequence-runner',
      'process-cadence-tasks',
      'process-scheduled-sends',
      'check-quote-expiration',
      'check-lead-sla',
      'sdr-consecutive-alerts',
      'activity-goal-alerts',
      'challenge-expiration-alerts',
      'send-alert-notifications',
      'auto-reassign-inactive',
      'access-denied-alerts',
      'scheduled-reports-runner',
      -- integração Bitrix24 (esta migration)
      'bitrix24-sync'
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
  PERFORM cron.unschedule('bitrix24-sync-hourly')
  WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'bitrix24-sync-hourly'
  );
  PERFORM cron.schedule(
    'bitrix24-sync-hourly',
    '17 * * * *',
    'SELECT public.trigger_internal_edge_job(''bitrix24-sync'');'
  );
END;
$$;
