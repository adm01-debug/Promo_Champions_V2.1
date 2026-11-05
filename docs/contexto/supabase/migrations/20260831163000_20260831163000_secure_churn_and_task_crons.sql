-- Fecha execução anônima dos jobs privilegiados de churn/fila automática.
-- Os valores sensíveis permanecem em _internal_secrets e nunca são gravados
-- no comando do pg_cron nem no repositório.

CREATE OR REPLACE FUNCTION public.trigger_generate_urgent_client_tasks()
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
    RAISE EXCEPTION 'auto_task_queue_cron_secrets_missing';
  END IF;
  IF v_base_url !~ '^https://[^[:space:]]+$' THEN
    RAISE EXCEPTION 'auto_task_queue_cron_base_url_must_be_https';
  END IF;

  PERFORM net.http_post(
    url := rtrim(v_base_url, '/') || '/generate-urgent-client-tasks',
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

REVOKE ALL ON FUNCTION public.trigger_generate_urgent_client_tasks()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_generate_urgent_client_tasks()
  TO service_role;

CREATE OR REPLACE FUNCTION public.trigger_detect_client_churn_alerts()
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
    RAISE EXCEPTION 'detect_client_churn_cron_secrets_missing';
  END IF;
  IF v_base_url !~ '^https://[^[:space:]]+$' THEN
    RAISE EXCEPTION 'detect_client_churn_cron_base_url_must_be_https';
  END IF;

  PERFORM net.http_post(
    url := rtrim(v_base_url, '/') || '/detect-client-churn-alerts',
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

REVOKE ALL ON FUNCTION public.trigger_detect_client_churn_alerts()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_detect_client_churn_alerts()
  TO service_role;

DO $$
BEGIN
  PERFORM cron.unschedule('auto-task-queue-hourly')
  WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'auto-task-queue-hourly'
  );
  PERFORM cron.schedule(
    'auto-task-queue-hourly',
    '0 * * * *',
    'SELECT public.trigger_generate_urgent_client_tasks();'
  );

  PERFORM cron.unschedule('detect-client-churn-alerts-hourly')
  WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'detect-client-churn-alerts-hourly'
  );
  PERFORM cron.schedule(
    'detect-client-churn-alerts-hourly',
    '15 * * * *',
    'SELECT public.trigger_detect_client_churn_alerts();'
  );
END;
$$;
