-- Corrige o retry de `trigger_internal_edge_job`. A versao anterior (migration
-- 20261124120000) fazia polling da resposta do pg_net DENTRO da mesma transacao,
-- o que nunca pode funcionar: `net.http_post` apenas enfileira a requisicao e o
-- worker do pg_net so a despacha depois do COMMIT, isto e, quando a funcao
-- retorna. Medicao em producao (2026-11-22) prova o acoplamento:
--
--   request_id 344276  janela 4x2s  -> resposta gravada com lag de  8,0s  (DNS)
--   request_id 344302  janela 9x2s  -> resposta gravada com lag de 18,1s  (HTTP 200)
--   request_id 344307  janela 10x2s -> resposta gravada com lag de 20,0s  (HTTP 200)
--   request_id 344305  post direto  -> resposta gravada com lag de  1,2s  (HTTP 401)
--
-- O lag era sempre igual a janela: a resposta so ficava visivel apos o retorno.
-- Contraprova: um `net.http_post` que nao fica preso em polling responde em 1,2s.
-- Resultado pratico do bug: todo timeout por DNS era classificado como
-- `response_pending`/`non_retryable` e o retry nunca acontecia, entao a
-- reindexacao semantica diaria (job 95) seguia sem rodar quando o DNS falhava.
--
-- Desenho novo: disparo e reconciliacao em transacoes separadas.
--   1. `trigger_internal_edge_job` apenas posta e registra a pendencia. Custo
--      cai de 8-20s para alguns milissegundos por execucao de cron.
--   2. `retry_pending_internal_edge_jobs` roda a cada 2 min num cron proprio,
--      le `net._http_response` das pendencias ja commitadas e decide: sucesso,
--      re-enfileirar (ate 3 tentativas) ou desistir. Cada linha pendente carrega
--      `error_name = 'pending'` como marcador de estado.
--   3. Pendencia sem resposta por 20 min vira `exhausted`, que o
--      `edge-retry-threshold-alert` ja contabiliza como falha (nada silencioso).
--
-- O cron que chama `trigger_internal_edge_job` marcava `succeeded` mesmo quando o
-- pg_net nao resolvia o DNS, porque `net.http_post` devolve request_id e o
-- `_http_response` grava `timed_out = true` com `status_code` NULL. Agora esse
-- caso deixa de ser terminal: vira pendencia reconciliada e re-tentada.

-- Dispara a requisicao e registra a pendencia de reconciliacao.
CREATE OR REPLACE FUNCTION public.post_internal_edge_job(
  p_function_name text,
  p_attempt integer,
  p_max_attempts integer
)
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
BEGIN
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

  INSERT INTO public.edge_retry_events
    (function_name, operation, attempt, total_attempts, outcome, status_code, error_name, error_message, request_id)
  VALUES
    (p_function_name, 'trigger_internal_edge_job', p_attempt, p_max_attempts,
     'retry', NULL, 'pending', 'aguardando reconciliacao do pg_net', v_request_id::text);

  RETURN v_request_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_internal_edge_job(p_function_name text)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'net'
AS $function$
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

  RETURN public.post_internal_edge_job(p_function_name, 1, 3);
END;
$function$;

-- Le o desfecho das pendencias ja commitadas e re-enfileira quando faz sentido.
CREATE OR REPLACE FUNCTION public.retry_pending_internal_edge_jobs()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'net'
AS $function$
DECLARE
  v_row record;
  v_status integer;
  v_timed_out boolean;
  v_error_msg text;
  v_is_dns boolean;
  v_sucesso integer := 0;
  v_reenfileirado integer := 0;
  v_desistiu integer := 0;
  v_sem_resposta integer := 0;
  v_stale_minutes constant integer := 20;
BEGIN
  FOR v_row IN
    SELECT e.id, e.function_name, e.attempt, e.total_attempts, e.request_id, e.created_at
      FROM public.edge_retry_events AS e
     WHERE e.operation = 'trigger_internal_edge_job'
       AND e.outcome = 'retry'
       AND e.error_name = 'pending'
       AND e.request_id ~ '^[0-9]+$'
       AND e.created_at > now() - interval '2 hours'
     ORDER BY e.created_at
     FOR UPDATE SKIP LOCKED
  LOOP
    v_status := NULL;
    v_timed_out := NULL;
    v_error_msg := NULL;

    SELECT r.status_code, r.timed_out, r.error_msg
      INTO v_status, v_timed_out, v_error_msg
      FROM net._http_response AS r
     WHERE r.id = v_row.request_id::bigint
     LIMIT 1;

    IF v_status IS NULL AND v_timed_out IS NULL THEN
      -- Ainda em voo. Passou do limite: registra como falha, nunca em silencio.
      IF v_row.created_at < now() - make_interval(mins => v_stale_minutes) THEN
        UPDATE public.edge_retry_events
           SET outcome = 'exhausted', error_name = 'no_response',
               error_message = 'pg_net nunca gravou resposta para o request_id'
         WHERE id = v_row.id;
        v_sem_resposta := v_sem_resposta + 1;
      END IF;
      CONTINUE;
    END IF;

    -- Sucesso. Em primeira tentativa nao houve retry: a pendencia e' descartada.
    IF v_status IS NOT NULL AND NOT COALESCE(v_timed_out, false)
       AND v_status >= 200 AND v_status < 300 THEN
      IF v_row.attempt > 1 THEN
        UPDATE public.edge_retry_events
           SET outcome = 'success_after_retry', status_code = v_status,
               error_name = 'success_after_retry', error_message = 'sucesso na tentativa ' || v_row.attempt
         WHERE id = v_row.id;
        v_sucesso := v_sucesso + 1;
      ELSE
        DELETE FROM public.edge_retry_events WHERE id = v_row.id;
        v_sucesso := v_sucesso + 1;
      END IF;
      CONTINUE;
    END IF;

    -- Entregue ao servidor mas a resposta estourou o timeout do pg_net: a edge
    -- function pode ter executado. Nao re-enfileira para nao duplicar efeito.
    IF COALESCE(v_timed_out, false) THEN
      v_is_dns :=
        v_error_msg IS NOT NULL
        AND v_error_msg ~* 'TCP/SSL handshake time:\s*0\.0+\s*ms'
        AND v_error_msg ~* 'HTTP Request/Response time:\s*0\.0+\s*ms';
      IF NOT v_is_dns THEN
        UPDATE public.edge_retry_events
           SET outcome = 'non_retryable', error_name = 'timeout_after_send',
               error_message = 'pg_net timeout apos o envio; nao re-enfileirado para evitar duplicata'
         WHERE id = v_row.id;
        v_desistiu := v_desistiu + 1;
        CONTINUE;
      END IF;
    END IF;

    -- Erro do cliente: repetir nao adianta.
    IF v_status IS NOT NULL AND v_status >= 400 AND v_status < 500 THEN
      UPDATE public.edge_retry_events
         SET outcome = 'non_retryable', status_code = v_status, error_name = 'http_4xx',
             error_message = 'edge function rejeitou a requisicao (status ' || v_status || ')'
       WHERE id = v_row.id;
      v_desistiu := v_desistiu + 1;
      CONTINUE;
    END IF;

    -- DNS nunca resolveu ou 5xx: re-tenta enquanto houver tentativa disponivel.
    IF v_row.attempt >= COALESCE(v_row.total_attempts, 3) THEN
      UPDATE public.edge_retry_events
         SET outcome = 'exhausted', status_code = v_status,
             error_name = CASE WHEN COALESCE(v_timed_out, false) THEN 'timeout_dns' ELSE 'http_5xx' END,
             error_message = COALESCE(v_error_msg, 'pg_net falhou (status=' || COALESCE(v_status::text, 'none') || ')')
       WHERE id = v_row.id;
      v_desistiu := v_desistiu + 1;
      CONTINUE;
    END IF;

    UPDATE public.edge_retry_events
       SET status_code = v_status,
           error_name = CASE WHEN COALESCE(v_timed_out, false) THEN 'retried_after_timeout_dns' ELSE 'retried_after_http_5xx' END,
           error_message = COALESCE(v_error_msg, 'pg_net falhou (status=' || COALESCE(v_status::text, 'none') || ')')
     WHERE id = v_row.id;

    PERFORM public.post_internal_edge_job(v_row.function_name, v_row.attempt + 1, COALESCE(v_row.total_attempts, 3));
    v_reenfileirado := v_reenfileirado + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'resolvidos', v_sucesso,
    'reenfileirados', v_reenfileirado,
    'desistiram', v_desistiu,
    'sem_resposta', v_sem_resposta
  );
END;
$function$;

-- Reconciliacao a cada 2 min. `cron.schedule` e' idempotente por nome em versoes
-- novas, mas removemos antes para nao duplicar job em reaplicacao da migration.
DO $do$
DECLARE
  v_old_jobid bigint;
BEGIN
  SELECT jobid INTO v_old_jobid FROM cron.job WHERE jobname = 'retry-pending-internal-edge-jobs-2min';
  IF v_old_jobid IS NOT NULL THEN
    PERFORM cron.unschedule(v_old_jobid);
  END IF;
  PERFORM cron.schedule(
    'retry-pending-internal-edge-jobs-2min',
    '*/2 * * * *',
    $cron$SELECT public.retry_pending_internal_edge_jobs();$cron$
  );
END
$do$;

GRANT EXECUTE ON FUNCTION public.retry_pending_internal_edge_jobs() TO postgres;
REVOKE ALL ON FUNCTION public.post_internal_edge_job(text, integer, integer) FROM PUBLIC, anon, authenticated;