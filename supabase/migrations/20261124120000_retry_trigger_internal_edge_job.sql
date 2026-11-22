-- O cron que chama `trigger_internal_edge_job` marca `succeeded` mesmo quando o
-- pg_net nao consegue resolver o DNS. Exemplo real (job 95, 2026-11-22 05:00 UTC):
--   error_msg = "Timeout of 5000 ms reached. DNS time: 5012.187000 ms,
--                TCP/SSL handshake time: 0.000000 ms,
--                HTTP Request/Response time: 0.000000 ms"
-- A edge function NUNCA foi invocada e nao ficou rastro: o `net.http_post`
-- retornou um request_id e o `_http_response` gravou `timed_out = true` com
-- `status_code` NULL. O job marcou `succeeded` e a reindexacao nao rodou.
--
-- Regra de re-tentativa (nunca duplica execucao):
--   * 2xx                                  -> sucesso, encerra.
--   * timed_out + handshake/HTTP ambos 0ms -> nunca conectou (DNS). Re-enfileira.
--   * timed_out com handshake/HTTP > 0ms   -> conectou e enviou; a edge function
--                                             pode estar processando. NAO re-enfileira.
--   * status >= 500                        -> falha do servidor. Re-enfileira.
--   * status 4xx                           -> erro do cliente. NAO re-enfileira.
--   * sem resposta apos polling            -> em voo. NAO re-enfileira.
--
-- Cada falha registra uma linha em `edge_retry_events` (owner postgres bypassa a
-- RLS), consumida pelo `edge-retry-threshold-alert`.

CREATE OR REPLACE FUNCTION public.trigger_internal_edge_job(p_function_name text)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'net'
AS $function$
DECLARE
  v_base_url text;
  v_anon_key text;
  v_cron_secret text;
  v_request_id bigint;
  v_attempt integer;
  v_poll integer;
  v_max_attempts integer := 3;
  v_status_code integer;
  v_timed_out boolean;
  v_error_msg text;
  v_never_connected boolean;
  v_request_id_text text;
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
      'webvitals-regression-alert',
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
      'rotate-daily-challenges',
      'bitrix24-sync',
      'semantic-reindex-batch'
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

  FOR v_attempt IN 1..v_max_attempts LOOP
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

    v_request_id_text := v_request_id::text;
    v_status_code := NULL;
    v_timed_out := NULL;
    v_error_msg := NULL;
    v_never_connected := false;

    -- Polling curto (4 x 2s) pela resposta do pg_net.
    FOR v_poll IN 1..4 LOOP
      SELECT r.status_code, r.timed_out, r.error_msg
        INTO v_status_code, v_timed_out, v_error_msg
        FROM net._http_response AS r
       WHERE r.id = v_request_id
       LIMIT 1;
      EXIT WHEN v_timed_out IS NOT NULL OR v_status_code IS NOT NULL;
      PERFORM pg_sleep(2);
    END LOOP;

    IF v_status_code IS NOT NULL AND NOT COALESCE(v_timed_out, false)
       AND v_status_code >= 200 AND v_status_code < 300 THEN
      RETURN v_request_id;  -- sucesso
    END IF;

    -- Sem resposta ainda: requisicao em voo. Nao re-enfileira (evita duplicata).
    -- Nao e falha: o pg_net apenas ainda nao gravou a resposta. Registramos como
    -- 'non_retryable' para nao inflar o contador de retries do alerta.
    IF v_timed_out IS NULL AND v_status_code IS NULL THEN
      INSERT INTO public.edge_retry_events
        (function_name, operation, attempt, total_attempts, outcome, status_code, error_name, error_message, request_id)
      VALUES
        (p_function_name, 'trigger_internal_edge_job', v_attempt, v_max_attempts,
         'non_retryable', NULL, 'response_pending',
         'pg_net response not yet recorded; not re-enqueued to avoid duplicate execution',
         v_request_id_text);
      RETURN v_request_id;
    END IF;

    -- timed_out: distingue "nunca conectou" (DNS) de "enviado, resposta lenta".
    IF COALESCE(v_timed_out, false) THEN
      v_never_connected :=
        v_error_msg IS NOT NULL
        AND v_error_msg ~* 'TCP/SSL handshake time:\s*0\.0+\s*ms'
        AND v_error_msg ~* 'HTTP Request/Response time:\s*0\.0+\s*ms';

      IF NOT v_never_connected THEN
        -- A requisicao chegou ao servidor; a edge function pode estar rodando.
        INSERT INTO public.edge_retry_events
          (function_name, operation, attempt, total_attempts, outcome, status_code, error_name, error_message, request_id)
        VALUES
          (p_function_name, 'trigger_internal_edge_job', v_attempt, v_max_attempts,
           'non_retryable', NULL, 'timeout_after_send',
           'pg_net timed out after the request was sent; not re-enqueued to avoid duplicate execution',
           v_request_id_text);
        RETURN v_request_id;
      END IF;
    END IF;

    -- Erro do cliente (4xx): nao adianta repetir.
    IF v_status_code IS NOT NULL AND v_status_code >= 400 AND v_status_code < 500 THEN
      INSERT INTO public.edge_retry_events
        (function_name, operation, attempt, total_attempts, outcome, status_code, error_name, error_message, request_id)
      VALUES
        (p_function_name, 'trigger_internal_edge_job', v_attempt, v_max_attempts,
         'non_retryable', v_status_code, 'http_4xx',
         'edge function rejected the request (status ' || v_status_code || ')',
         v_request_id_text);
      RETURN v_request_id;
    END IF;

    -- DNS nunca resolveu ou 5xx: registra e re-tenta.
    INSERT INTO public.edge_retry_events
      (function_name, operation, attempt, total_attempts, outcome, status_code, error_name, error_message, request_id)
    VALUES
      (p_function_name, 'trigger_internal_edge_job', v_attempt, v_max_attempts,
       CASE WHEN v_attempt < v_max_attempts THEN 'retry' ELSE 'exhausted' END,
       v_status_code,
       CASE WHEN v_never_connected THEN 'timeout_dns' ELSE 'http_5xx' END,
       COALESCE(v_error_msg,
                'pg_net request failed (status=' || COALESCE(v_status_code::text, 'none') || ')'),
       v_request_id_text);
  END LOOP;

  RETURN v_request_id;
END;
$function$
