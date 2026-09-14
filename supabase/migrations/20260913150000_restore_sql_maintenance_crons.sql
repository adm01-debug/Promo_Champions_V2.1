-- Etapa 7 (parcial) do plano de 50 etapas — restaura os 12 cron jobs
-- puramente SQL que rodaram até 2026-08-30 14:44 UTC e sumiram de cron.job
-- (0 linhas em 2026-09-13; 25 jobids e 140.713 execuções no histórico).
--
-- Fonte dos comandos: cron.job_run_details (verbatim). Fonte dos schedules:
-- migrations originais quando existem; senão, o intervalo observado no
-- histórico (ex.: cleanup-webhook-dedupe rodou a cada 6h, não semanal como a
-- migration de 2026-07-06 dizia — prevalece o observado).
--
-- Excluídos DE PROPÓSITO (já falhavam antes da parada; restaurar = ruído):
--   jobid 2  match_weekly_players      — função não existe (10/15 falhas)
--   jobid 11 purge_telemetry_retention — "column reference table_name is
--                                        ambiguous" (49/49 falhas)
--   jobid 20 detect_stalled_cron_jobs  — viola cron_failure_alerts_unique
--                                        (3.928/4.672 falhas)
-- Os 10 jobs HTTP (net.http_post para edge functions) ficam para migration
-- própria: todos apontavam para rapjswienfhkobhlamxb (projeto antigo), e as
-- functions ainda não estão publicadas em usyxfpqlsspldubptrdl (etapas 2/10).
--
-- Idempotente: cada job é desagendado se existir e reagendado; funções e
-- tabelas ausentes são puladas com NOTICE em vez de abortar a transação.

DO $restore$
DECLARE
  j record;
  n_ok int := 0;
BEGIN
  FOR j IN SELECT * FROM (VALUES
    ('weekly-league-reset',              '0 0 * * 1',   'SELECT public.process_weekly_league_reset();',                                               'process_weekly_league_reset',      NULL),
    ('purge-webhook-inbound-dedupe-30d', '0 3 * * *',   'DELETE FROM public.webhook_inbound_dedupe WHERE received_at < now() - interval ''30 days'';', NULL,                               'public.webhook_inbound_dedupe'),
    ('purge-quote-sync-inbound-log-30d', '15 3 * * *',  'DELETE FROM public.quote_sync_inbound_log WHERE received_at < now() - interval ''30 days'';', NULL,                               'public.quote_sync_inbound_log'),
    ('cleanup-webhook-dedupe',           '0 */6 * * *', 'SELECT public.fn_cleanup_webhook_dedupe();',                                                 'fn_cleanup_webhook_dedupe',        NULL),
    ('cleanup-stale-logs-daily',         '15 3 * * *',  'SELECT public.fn_cleanup_stale_logs(90);',                                                   'fn_cleanup_stale_logs',            NULL),
    ('reset-pg-stat-statements-weekly',  '0 4 * * 1',   'SELECT public.reset_pg_stat_statements_weekly();',                                           'reset_pg_stat_statements_weekly',  NULL),
    ('enforce-telemetry-retention-daily','30 3 * * *',  'SELECT public.enforce_telemetry_retention();',                                               'enforce_telemetry_retention',      NULL),
    ('rollback-snapshot-5min',           '*/5 * * * *', 'SELECT public.admin_capture_rollback_snapshot();',                                           'admin_capture_rollback_snapshot',  NULL),
    ('purge-rollback-snapshots-daily',   '20 3 * * *',  'SELECT public.fn_purge_rollback_snapshots();',                                               'fn_purge_rollback_snapshots',      NULL),
    ('purge-old-telemetry-daily',        '15 3 * * *',  'SELECT public.purge_old_telemetry(90);',                                                     'purge_old_telemetry',              NULL),
    ('detect-slow-queries-hourly',       '20 * * * *',  'SELECT public.detect_slow_queries(500, 100);',                                               'detect_slow_queries',              NULL),
    ('gc-call-recording-ingest-jobs',    '15 3 * * *',  'SELECT public.fn_gc_call_recording_ingest_jobs();',                                          'fn_gc_call_recording_ingest_jobs', NULL)
  ) AS t(jobname, schedule, command, fn, tbl) LOOP
    IF j.fn IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
      WHERE ns.nspname = 'public' AND p.proname = j.fn
    ) THEN
      RAISE NOTICE 'skip %: função public.% não existe', j.jobname, j.fn;
      CONTINUE;
    END IF;
    IF j.tbl IS NOT NULL AND to_regclass(j.tbl) IS NULL THEN
      RAISE NOTICE 'skip %: tabela % não existe', j.jobname, j.tbl;
      CONTINUE;
    END IF;
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = j.jobname) THEN
      PERFORM cron.unschedule(j.jobname);
    END IF;
    PERFORM cron.schedule(j.jobname, j.schedule, j.command);
    n_ok := n_ok + 1;
  END LOOP;
  RAISE NOTICE 'restaurados: % jobs', n_ok;
END
$restore$;

-- Verificação pós-aplicação (colar a saída na PR, com now()):
--   SELECT jobname, schedule, active FROM cron.job ORDER BY jobname;
--   -- esperado: 12 linhas, todas active = true
--   SELECT jobid, status, count(*) FROM cron.job_run_details
--    WHERE start_time > now() - interval '1 hour' GROUP BY 1,2;
--   -- esperado após ~5 min: rollback-snapshot-5min com status 'succeeded'

-- DOWN (não executado pelo push; reverte para o estado de 2026-09-13 = 0 jobs):
--   SELECT cron.unschedule(jobname) FROM cron.job WHERE jobname IN (
--     'weekly-league-reset','purge-webhook-inbound-dedupe-30d',
--     'purge-quote-sync-inbound-log-30d','cleanup-webhook-dedupe',
--     'cleanup-stale-logs-daily','reset-pg-stat-statements-weekly',
--     'enforce-telemetry-retention-daily','rollback-snapshot-5min',
--     'purge-rollback-snapshots-daily','purge-old-telemetry-daily',
--     'detect-slow-queries-hourly','gc-call-recording-ingest-jobs');
