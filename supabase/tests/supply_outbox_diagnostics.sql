-- Sonda read-only da fila de entrega ao Supply (supply_outbox) e do cron que a drena.
--
-- Somente leitura: nenhum INSERT/UPDATE/DDL. É RELATÓRIO, não gate — ausência de
-- linhas é estado válido (nenhum pedido novo desde o deploy da #731), por isso
-- nada aqui aborta por contagem. Falha só se o próprio SQL quebrar (schema mudou).
--
-- Responde, com dado de produção, o que o deploy da #731 deixou em aberto:
--   1. o trigger do pedido enfileirou algo de verdade?
--   2. quantas linhas foram entregues e com quantas tentativas?
--   3. o cron supply-dispatch-1min está rodando e o que o pg_net devolveu?
--   4. houve timeout/DNS do dispatcher para supply-dispatch?
--   5. existe linha pendente travada (fila parada há mais de 15 min)?
--   6. os retries registrados em edge_retry_events chegaram a um desfecho?
--   7. o timeout dedicado de 60s do supply-dispatch está vigente em produção?

\echo '## 1. supply_outbox por status'
SELECT status,
       count(*)       AS linhas,
       min(created_at) AS mais_antiga,
       max(created_at) AS mais_recente,
       max(attempts)  AS max_attempts
FROM public.supply_outbox
GROUP BY status
ORDER BY status;

\echo '## 2. distribuicao de tentativas'
SELECT status, attempts, count(*) AS linhas, max(delivered_at) AS ultima_entrega
FROM public.supply_outbox
GROUP BY status, attempts
ORDER BY status, attempts;

\echo '## 3. ultimas 10 linhas (sem payload)'
SELECT left(id::text, 8)              AS id8,
       status,
       attempts,
       event,
       created_at,
       delivered_at,
       next_attempt_at,
       left(coalesce(last_error, ''), 120) AS erro
FROM public.supply_outbox
ORDER BY created_at DESC
LIMIT 10;

\echo '## 4. cron supply-dispatch-1min'
SELECT jobid, schedule, active
FROM cron.job
WHERE jobname = 'supply-dispatch-1min';

\echo '## 5. ultimas 8 execucoes do cron'
SELECT d.jobid,
       d.status,
       d.start_time,
       d.end_time,
       round(extract(epoch FROM (d.end_time - d.start_time))::numeric, 2) AS segundos,
       left(coalesce(d.return_message, ''), 160) AS retorno
FROM cron.job_run_details d
JOIN cron.job j ON j.jobid = d.jobid
WHERE j.jobname = 'supply-dispatch-1min'
ORDER BY d.start_time DESC
LIMIT 8;

\echo '## 6. edge_retry_events de supply-dispatch (24h)'
SELECT outcome, error_name, count(*) AS eventos, max(created_at) AS ultimo
FROM public.edge_retry_events
WHERE function_name = 'supply-dispatch'
  AND created_at > now() - interval '24 hours'
GROUP BY outcome, error_name
ORDER BY eventos DESC;

\echo '## 7. fila travada (pendente/processing ha mais de 15 min)'
SELECT count(*)        AS travadas,
       min(created_at) AS mais_antiga,
       max(attempts)   AS max_attempts
FROM public.supply_outbox
WHERE status IN ('pending', 'processing')
  AND created_at < now() - interval '15 minutes';

\echo '## 8. edge_retry_events de supply-dispatch por outcome (7 dias)'
SELECT outcome,
       count(*)        AS eventos,
       min(created_at) AS primeiro,
       max(created_at) AS ultimo
FROM public.edge_retry_events
WHERE function_name = 'supply-dispatch'
  AND created_at > now() - interval '7 days'
GROUP BY outcome
ORDER BY eventos DESC;

\echo '## 9. ultimos 12 eventos de supply-dispatch (detalhe)'
SELECT created_at,
       operation,
       outcome,
       attempt,
       total_attempts,
       left(coalesce(request_id, ''), 12)   AS req12,
       status_code,
       left(coalesce(error_name, ''), 40)   AS erro
FROM public.edge_retry_events
WHERE function_name = 'supply-dispatch'
ORDER BY created_at DESC
LIMIT 12;

-- `withRetry` grava um evento por tentativa: `retry` abre o ciclo e o mesmo
-- request_id recebe `success_after_retry` (concluiu), `exhausted` (esgotou) ou
-- `non_retryable` (não vale repetir). Um `retry` sem nenhum desses depois dele
-- significa que o processo morreu no meio (timeout do job do pg_net) e o ciclo
-- ficou aberto — é o que alimenta o edge-retry-threshold-alert sem falha real.
\echo '## 10. retries sem desfecho (7 dias)'
WITH r AS (
  SELECT request_id, created_at
  FROM public.edge_retry_events
  WHERE function_name = 'supply-dispatch'
    AND outcome = 'retry'
    AND created_at > now() - interval '7 days'
)
SELECT count(*)                                                     AS abertos,
       count(*) FILTER (WHERE r.request_id IS NULL)                 AS sem_request_id,
       round(100.0 * count(*) FILTER (WHERE r.request_id IS NULL)
             / greatest(count(*), 1), 1)                            AS pct_sem_request_id,
       min(r.created_at)                                            AS mais_antigo,
       max(r.created_at)                                            AS mais_recente,
       round(extract(epoch FROM (now() - min(r.created_at))) / 60)  AS idade_min_mais_antigo
FROM r
WHERE r.request_id IS NULL          -- sem request_id não há como correlacionar: fica aberto
   OR NOT EXISTS (
  SELECT 1
  FROM public.edge_retry_events e
  WHERE e.function_name = 'supply-dispatch'
    AND e.request_id = r.request_id
    AND e.outcome IN ('success_after_retry', 'exhausted', 'non_retryable')
    AND e.created_at >= r.created_at
);

\echo '## 11. timeout interno vigente por funcao (prova da 20261127000000)'
SELECT fn AS funcao,
       public.internal_edge_job_timeout_ms(fn) AS timeout_ms
FROM unnest(ARRAY[
  'supply-dispatch',
  'process-call-recording-ingest',
  'semantic-reindex-batch',
  'cron-failure-alerter',
  'wal-health-alert',
  'send-alert-notifications',
  'access-denied-alerts',
  'check-lead-sla'
]) AS fn;

\echo '## 12. ledger das migrations de timeout de 2026-11-27'
SELECT version,
       name,
       left(regexp_replace(coalesce(statements::text, ''), '\s+', ' ', 'g'), 90) AS comandos
FROM supabase_migrations.schema_migrations
WHERE version LIKE '20261127%'
ORDER BY version;