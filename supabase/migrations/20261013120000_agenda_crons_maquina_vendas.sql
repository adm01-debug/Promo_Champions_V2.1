-- ONDA 1 (#2, #4, #14): agenda os crons que fazem a venda andar sozinha.
--
-- Estende a allowlist de public.trigger_internal_edge_job com as funções de
-- cadência/sequência/SLA/alertas e cria os cron.job correspondentes.
-- Tudo idempotente: reexecutar não duplica jobs nem derruba o allowlist.
--
-- Funções ainda não deployadas (limite de 100 do plano) passam a responder
-- 404 até o deploy pós-upgrade — o cron-failure-alerter registra e nada é
-- perdido; ao deployarem, os jobs já disparam sozinhos.

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
      'scheduled-reports-runner'
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
DECLARE
  -- jobname, schedule, chamada
  v_jobs CONSTANT text[][] := ARRAY[
    -- motor de cadências e sequências (a cada 5 min)
    ['sequence-runner-5min',                '*/5 * * * *',  'sequence-runner'],
    ['process-cadence-tasks-5min',          '*/5 * * * *',  'process-cadence-tasks'],
    ['process-scheduled-sends-15min',       '*/15 * * * *', 'process-scheduled-sends'],
    -- cotação: expiração diária 8h UTC
    ['check-quote-expiration-daily',        '0 8 * * *',    'check-quote-expiration'],
    -- SLA de lead a cada 15 min
    ['check-lead-sla-15min',                '*/15 * * * *', 'check-lead-sla'],
    -- alertas de SDR 8h, metas de atividade 15h (janela comercial BRT)
    ['sdr-consecutive-alerts-daily',        '0 11 * * *',   'sdr-consecutive-alerts'],
    ['activity-goal-alerts-daily',          '0 18 * * *',   'activity-goal-alerts'],
    ['challenge-expiration-alerts-daily',   '0 12 * * *',   'challenge-expiration-alerts'],
    -- notificações pendentes a cada 5 min
    ['send-alert-notifications-5min',       '*/5 * * * *',  'send-alert-notifications'],
    -- reatribuição de leads inativos 6h UTC, acesso negado de hora em hora
    ['auto-reassign-inactive-daily',        '0 9 * * *',    'auto-reassign-inactive'],
    ['access-denied-alerts-hourly',         '0 * * * *',    'access-denied-alerts'],
    -- relatórios agendados de hora em hora
    ['scheduled-reports-runner-hourly',     '10 * * * *',   'scheduled-reports-runner']
  ];
  v_job text[];
BEGIN
  FOREACH v_job SLICE 1 LOOP
    PERFORM cron.unschedule(v_job[1])
      WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = v_job[1]);
    PERFORM cron.schedule(
      v_job[1],
      v_job[2],
      format('SELECT public.trigger_internal_edge_job(%L);', v_job[3])
    );
  END LOOP;
END;
$$;
