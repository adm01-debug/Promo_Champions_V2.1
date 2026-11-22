-- Contrato do dispatcher de crons internos e do reconciler do pg_net.
-- Somente leitura: nada aqui altera estado. Qualquer divergência aborta a suite.
--
-- Cobre os três pontos que já causaram incidente em produção:
--   1. timeout do pg_net por função (default de 5s matava a reindexação semântica);
--   2. post_internal_edge_job realmente passando esse timeout ao net.http_post;
--   3. reconciler não reenfileirando 5xx de configuração (secret ausente).
DO $$
DECLARE
  v_ms integer;
  v_def text;
  v_fn text;
BEGIN
  -- 1. Funções longas precisam de timeout explícito; o default do pg_net (5000ms)
  --    produz timed_out=true e o reconciler reexecuta a função.
  SELECT public.internal_edge_job_timeout_ms('semantic-reindex-batch') INTO v_ms;
  IF v_ms IS DISTINCT FROM 120000 THEN
    RAISE EXCEPTION 'semantic_reindex_timeout_expected_120000_got_%', v_ms;
  END IF;

  SELECT public.internal_edge_job_timeout_ms('process-call-recording-ingest') INTO v_ms;
  IF v_ms IS DISTINCT FROM 60000 THEN
    RAISE EXCEPTION 'call_recording_ingest_timeout_expected_60000_got_%', v_ms;
  END IF;

  -- Funções que só enfileiram/consultam mantêm o default curto.
  SELECT public.internal_edge_job_timeout_ms('check-lead-sla') INTO v_ms;
  IF v_ms IS DISTINCT FROM 5000 THEN
    RAISE EXCEPTION 'default_timeout_expected_5000_got_%', v_ms;
  END IF;

  -- Funções que sofreram timeout_dns medido em produção precisam de margem:
  -- o erro real foi "DNS time: 5003.771000 ms" com handshake e HTTP em 0 ms,
  -- ou seja, todo o orçamento de 5 s consumido só na resolução de nome.
  FOREACH v_fn IN ARRAY ARRAY[
    'cron-failure-alerter',
    'wal-health-alert',
    'send-alert-notifications',
    'access-denied-alerts'
  ] LOOP
    SELECT public.internal_edge_job_timeout_ms(v_fn) INTO v_ms;
    IF v_ms IS DISTINCT FROM 60000 THEN
      RAISE EXCEPTION 'timeout_dns_%_expected_60000_got_%', v_fn, v_ms;
    END IF;
  END LOOP;

  -- 2. O timeout precisa chegar ao net.http_post — declará-lo na função de apoio
  --    sem usá-lo no dispatch deixa o bug ativo com aparência de corrigido.
  SELECT pg_get_functiondef('public.post_internal_edge_job(text, integer, integer)'::regprocedure)
    INTO v_def;
  IF position('timeout_milliseconds' IN v_def) = 0 THEN
    RAISE EXCEPTION 'post_internal_edge_job_nao_passa_timeout_milliseconds';
  END IF;
  IF position('internal_edge_job_timeout_ms' IN v_def) = 0 THEN
    RAISE EXCEPTION 'post_internal_edge_job_nao_usa_internal_edge_job_timeout_ms';
  END IF;

  -- 3. Só o service_role dispara jobs internos nem lê a tabela de timeouts.
  IF has_function_privilege('anon', 'public.trigger_internal_edge_job(text)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.trigger_internal_edge_job(text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'trigger_internal_edge_job_exposta_para_anon_ou_authenticated';
  END IF;

  IF has_function_privilege('anon', 'public.post_internal_edge_job(text, integer, integer)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.post_internal_edge_job(text, integer, integer)', 'EXECUTE') THEN
    RAISE EXCEPTION 'post_internal_edge_job_exposta_para_anon_ou_authenticated';
  END IF;

  IF has_function_privilege('anon', 'public.retry_pending_internal_edge_jobs()', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.retry_pending_internal_edge_jobs()', 'EXECUTE') THEN
    RAISE EXCEPTION 'retry_pending_internal_edge_jobs_exposta_para_anon_ou_authenticated';
  END IF;

  IF has_function_privilege('anon', 'public.internal_edge_job_timeout_ms(text)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.internal_edge_job_timeout_ms(text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'internal_edge_job_timeout_ms_exposta_para_anon_ou_authenticated';
  END IF;

  -- 4. O reconciler precisa reconhecer 5xx de configuração, senão volta a
  --    reenfileirar função que só falha porque falta secret.
  SELECT pg_get_functiondef('public.retry_pending_internal_edge_jobs()'::regprocedure)
    INTO v_def;
  IF position('http_5xx_config' IN v_def) = 0 THEN
    RAISE EXCEPTION 'reconciler_sem_regra_http_5xx_config';
  END IF;
  IF position('timed_out' IN v_def) = 0 THEN
    RAISE EXCEPTION 'reconciler_sem_tratamento_de_timed_out';
  END IF;

  -- 5. A tabela de retry precisa dos índices que sustentam a varredura por
  --    função e a ordenação por criação; sem eles o cron de 2 min degrada.
  IF to_regclass('public.edge_retry_events') IS NULL THEN
    RAISE EXCEPTION 'edge_retry_events_ausente';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'edge_retry_events'
      AND indexdef ILIKE '%function_name%'
  ) THEN
    RAISE EXCEPTION 'edge_retry_events_sem_indice_por_function_name';
  END IF;
END;
$$;