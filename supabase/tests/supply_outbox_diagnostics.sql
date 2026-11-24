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