-- Timeout do pg_net para o cron supply-dispatch.
--
-- Causa: internal_edge_job_timeout_ms nao lista 'supply-dispatch', entao o cron
-- supply-dispatch-1min (1x/min) cai no ELSE 5000. O supply-dispatch entrega o lote
-- ao Supply (receive-os-sync) dentro da mesma invocacao; quando a entrega passa de
-- 5s o pg_net grava timed_out=true, o reconciliador classifica como
-- 'non_retryable'/'timeout_after_send' e o disparo fica registrado em
-- edge_retry_events como falha de envio — ruido que pode acionar
-- edge-retry-threshold-alert sem falha real (a function continua rodando e fecha a
-- fila; o timeout apenas interrompe a espera da resposta).
--
-- Prova: a definicao vigente (20261124160000) cobre apenas semantic-reindex-batch
-- (120000) e process-call-recording-ingest (60000); todo o resto, incluindo
-- 'supply-dispatch', retorna 5000.
--
-- Correcao: mesma funcao com timeout explicito de 60s para 'supply-dispatch',
-- igual ao outro worker que faz chamada HTTP externa por lote
-- (process-call-recording-ingest). Default 5000 inalterado para as funcoes curtas.

CREATE OR REPLACE FUNCTION public.internal_edge_job_timeout_ms(p_function_name text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT CASE p_function_name
    WHEN 'semantic-reindex-batch' THEN 120000
    WHEN 'process-call-recording-ingest' THEN 60000
    WHEN 'supply-dispatch' THEN 60000
    ELSE 5000
  END;
$function$;

REVOKE ALL ON FUNCTION public.internal_edge_job_timeout_ms(text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.internal_edge_job_timeout_ms(text)
  TO service_role;