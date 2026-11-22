-- Timeout do pg_net para as funcoes cujo custo real passa de 5s.
--
-- Causa medida em producao (2026-11-22):
--   * O default de 5000ms do net.http_post nao cobre o custo de rede/DNS do
--     pg_net quando o resolver esta lento. O erro registrado e explicito:
--       "Timeout of 5000 ms reached. Total time: 5003.771000 ms
--        (DNS time: 5003.771000 ms, TCP/SSL handshake time: 0.000000 ms,
--         HTTP Request/Response time: 0.000000 ms)"
--     ou seja: 100% do orcamento consumido em DNS, sem sequer abrir conexao.
--   * Nao e lentidao da edge function. Medicao direta por HTTP (curl, 4 runs):
--       send-alert-notifications  1.01s
--       wal-health-alert          1.74s
--       access-denied-alerts      ~1.3s
--       cron-failure-alerter      2.86s
--       check-lead-sla            1.31-1.67s (4.37s em cold start)
--     e a RPC mais pesada do cron-failure-alerter responde em 66ms:
--       Function Scan on fn_admin_get_new_cron_failures
--       Execution Time: 66.412 ms
--
-- Consequencia do timeout curto: a linha em edge_retry_events nasce em 'retry'
-- e o pg_net nunca gravou resposta (DNS morreu antes), entao o reconciler
-- reexecuta a funcao. Isso e' correto para funcoes idempotentes, mas gera
-- reexecucao desnecessaria e poluicao de auditoria.
--
-- Correcao: elevar o timeout apenas dessas funcoes. O default de 5000ms
-- continua valendo para as demais (nenhuma delas apresenta timeout_dns real).
--
-- 60000ms (nao 30000) porque o caso observado nao e' funcao lenta e sim
-- resolver travado: medido 5003-5016 ms consistentemente, o que indica scheduler
-- jogando a resolucao para o proximo tick. Margem de 12x cobre picos de
-- resolucao sem mascarar funcao genuinamente travada.

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
    ELSE 5000
  END;
$function$;

REVOKE ALL ON FUNCTION public.internal_edge_job_timeout_ms(text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.internal_edge_job_timeout_ms(text)
  TO service_role;

COMMENT ON FUNCTION public.internal_edge_job_timeout_ms(text) IS
  'Timeout do pg_net por funcao. Default 5000ms do net.http_post; elevado apenas para funcoes com custo real acima disso (embeddings) ou que sofreram timeout_dns medido em producao.';