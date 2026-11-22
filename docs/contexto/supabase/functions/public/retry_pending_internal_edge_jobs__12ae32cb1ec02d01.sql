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
$function$
