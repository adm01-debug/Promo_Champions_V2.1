-- 99 falhas de 'job startup timeout' desde 2026-10-06 em cron.job_run_details,
-- concentradas nos minutos redondos: :15 = 25, :20 = 14, :35 = 10, :5 = 10.
--
-- Causa: 7 jobs usam '*/5' e 6 usam '*/15'. Ambos os padroes comecam no minuto
-- zero, entao nos minutos multiplos de 15 os 13 disparam juntos e o pg_cron nao
-- consegue abrir worker para todos -- os excedentes recebem
-- 'job startup timeout' e o trabalho daquele ciclo nao acontece. Em
-- 2026-11-20 20:15 isso derrubou 15 jobs no mesmo instante
-- (start_time = 20:15:00.000138 em todos).
--
-- Correcao: distribuir o minuto inicial de cada job. A frequencia nao muda
-- (continue com */5 ou */15, a partir de outro minuto). Pico por minuto cai
-- de 13 para 3 jobs, medido por simulacao dos 60 minutos.
--
-- cron.schedule(jobname, schedule, command) reagenda o job existente sem
-- recriar; o comando original de cada job e' preservado abaixo.
-- Idempotente.

SELECT cron.schedule('capture-rollback-snapshot-5min',           '0-59/5 * * * *',  'SELECT public.admin_capture_rollback_snapshot()');
SELECT cron.schedule('notify-v4-quote-status-every-5min',        '1-59/5 * * * *',  'SELECT public.trigger_internal_edge_job(''notify-v4-quote-status'');');
SELECT cron.schedule('check-v4-callback-alerts-every-5min',      '2-59/5 * * * *',  'SELECT public.trigger_internal_edge_job(''check-v4-callback-alerts'');');
SELECT cron.schedule('wal-health-alert-5min',                    '3-59/5 * * * *',  'SELECT public.trigger_internal_edge_job(''wal-health-alert'');');
SELECT cron.schedule('sequence-runner-5min',                     '4-59/5 * * * *',  'SELECT public.trigger_internal_edge_job(''sequence-runner'');');
SELECT cron.schedule('process-cadence-tasks-5min',               '0-59/5 * * * *',  'SELECT public.trigger_internal_edge_job(''process-cadence-tasks'');');
SELECT cron.schedule('send-alert-notifications-5min',            '2-59/5 * * * *',  'SELECT public.trigger_internal_edge_job(''send-alert-notifications'');');

SELECT cron.schedule('detect-stalled-cron-15min',                '0-59/15 * * * *', 'SELECT public.detect_stalled_cron_jobs()');
SELECT cron.schedule('email-bulk-retry-15min',                   '1-59/15 * * * *', 'SELECT net.http_post(
    url := (SELECT value FROM public._internal_secrets WHERE key=''functions_base_url'') || ''/email-bulk-retry'',
    headers := jsonb_build_object(''Content-Type'',''application/json'',''apikey'',(SELECT value FROM public._internal_secrets WHERE key=''anon_key'')),
    body := ''{}''::jsonb
  );');
SELECT cron.schedule('edge-retry-threshold-alert-15min',         '2-59/15 * * * *', 'SELECT public.trigger_internal_edge_job(''edge-retry-threshold-alert'');');
SELECT cron.schedule('winloss-webhook-health-monitor-15min',     '3-59/15 * * * *', 'SELECT public.trigger_internal_edge_job(''winloss-webhook-health-monitor'');');
SELECT cron.schedule('process-scheduled-sends-15min',            '4-59/15 * * * *', 'SELECT public.trigger_internal_edge_job(''process-scheduled-sends'');');
SELECT cron.schedule('check-lead-sla-15min',                     '5-59/15 * * * *', 'SELECT public.trigger_internal_edge_job(''check-lead-sla'');');