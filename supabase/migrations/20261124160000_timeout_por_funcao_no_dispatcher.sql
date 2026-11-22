-- Timeout do pg_net por funcao no dispatcher interno de crons.
--
-- Causa: net.http_post usa timeout_milliseconds default de 5s. semantic-reindex-batch
-- gasta ~30s por lote (gera embeddings), entao cada execucao diaria estourava o
-- timeout, era classificada como timeout_dns pelo reconciliador e re-executada 3x
-- (redundancia de custo de embedding), terminando em 'exhausted' com status_code nulo.
-- Prova: o mesmo payload com timeout_milliseconds=60000 retornou HTTP 200 em ~30s;
-- com o default retornou timed_out=true.
--
-- Correcao: timeout explicito por funcao. Default 5000 mantem o comportamento atual
-- das funcoes curtas (que ja respondem bem abaixo disso).

CREATE OR REPLACE FUNCTION public.internal_edge_job_timeout_ms(p_function_name text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT CASE p_function_name
    WHEN 'semantic-reindex-batch' THEN 120000
    WHEN 'process-call-recording-ingest' THEN 60000
    ELSE 5000
  END;
$function$;

REVOKE ALL ON FUNCTION public.internal_edge_job_timeout_ms(text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.internal_edge_job_timeout_ms(text)
  TO service_role;

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
    body := jsonb_build_object('scheduled_at', now()),
    timeout_milliseconds := public.internal_edge_job_timeout_ms(p_function_name)
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

REVOKE ALL ON FUNCTION public.post_internal_edge_job(text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.post_internal_edge_job(text, integer, integer)
  TO service_role;