-- Restaura os timeouts das funcoes com DNS lento, perdidos na 20261127000000.
--
-- Causa: 20261127000000_supply_dispatch_timeout_60s recriou
-- public.internal_edge_job_timeout_ms a partir da definicao de
-- 20261124160000 (escrita antes da 20261125000000 existir) e acrescentou apenas
-- 'supply-dispatch'. Com isso as quatro funcoes que a
-- 20261125000000_timeout_pgnet_funcoes_com_dns_lento tinha elevado para 60000
-- voltaram ao ELSE 5000 em producao:
--   cron-failure-alerter, wal-health-alert, send-alert-notifications,
--   access-denied-alerts.
-- Sao exatamente as funcoes com timeout_dns medido em producao
-- (5003.771 ms gastos 100% em DNS, 2026-11-22) — com 5000 ms o pg_net volta a
-- abortar antes de abrir conexao.
--
-- Prova: supabase/tests/retry_dispatcher_assertions.sql abortou em producao com
--   ERROR: timeout_dns_cron-failure-alerter_expected_60000_got_5000
-- (validado no CI logo apos o apply da 20261127000000, 2026-11-24 14:29:57Z).
--
-- Correcao: uniao das duas listas — as 4 funcoes de DNS lento da
-- 20261125000000 + 'supply-dispatch' da 20261127000000. Default 5000 inalterado.
-- Nenhuma outra linha do arquivo anterior muda.

CREATE OR REPLACE FUNCTION public.internal_edge_job_timeout_ms(p_function_name text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT CASE p_function_name
    WHEN 'semantic-reindex-batch' THEN 120000
    WHEN 'process-call-recording-ingest' THEN 60000
    WHEN 'cron-failure-alerter' THEN 60000
    WHEN 'wal-health-alert' THEN 60000
    WHEN 'send-alert-notifications' THEN 60000
    WHEN 'access-denied-alerts' THEN 60000
    WHEN 'supply-dispatch' THEN 60000
    ELSE 5000
  END;
$function$;

REVOKE ALL ON FUNCTION public.internal_edge_job_timeout_ms(text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.internal_edge_job_timeout_ms(text)
  TO service_role;

COMMENT ON FUNCTION public.internal_edge_job_timeout_ms(text) IS
  'Timeout do pg_net por funcao. Default 5000ms do net.http_post; elevado apenas para funcoes com custo real acima disso (embeddings) ou que sofreram timeout_dns medido em producao.';
