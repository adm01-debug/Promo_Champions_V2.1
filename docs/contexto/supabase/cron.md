# Cron (pg_cron)

Horários em UTC. Execuções recentes em `cron-runs.md`.

| id | nome | schedule | ativo | database | usuário | comando |
|---|---|---|---|---|---|---|
| 1 | weekly-league-reset | `0 0 * * 1` | sim | postgres | postgres | `SELECT public.process_weekly_league_reset()` |
| 3 | purge-webhook-inbound-dedupe-30d | `0 3 * * *` | sim | postgres | postgres | `DELETE FROM public.webhook_inbound_dedupe WHERE received_at < now() - interval '30 days';` |
| 4 | purge-quote-sync-inbound-log-30d | `15 3 * * *` | sim | postgres | postgres | `DELETE FROM public.quote_sync_inbound_log WHERE received_at < now() - interval '30 days';` |
| 6 | cleanup-webhook-dedupe | `0 */6 * * *` | sim | postgres | postgres | `SELECT public.fn_cleanup_webhook_dedupe();` |
| 7 | cleanup-stale-logs-daily | `15 3 * * *` | sim | postgres | postgres | ` SELECT public.fn_cleanup_stale_logs(90); ` |
| 8 | purge-telemetry-retention-daily | `30 3 * * *` | sim | postgres | postgres | `SELECT public.purge_telemetry_retention();` |
| 9 | reset-pg-stat-statements-weekly | `0 4 * * 1` | sim | postgres | postgres | `SELECT public.reset_pg_stat_statements_weekly();` |
| 10 | enforce-telemetry-retention-daily | `30 3 * * *` | sim | postgres | postgres | `SELECT public.enforce_telemetry_retention();` |
| 11 | gc-call-recording-ingest-jobs | `15 3 * * *` | sim | postgres | postgres | ` SELECT public.fn_gc_call_recording_ingest_jobs(); ` |
| 12 | campaign-health-alert-30min | `*/30 * * * *` | sim | postgres | postgres | `SELECT public.trigger_campaign_health_alert();` |
| 13 | capture-rollback-snapshot-5min | `*/5 * * * *` | sim | postgres | postgres | `SELECT public.admin_capture_rollback_snapshot()` |
| 14 | purge-rollback-snapshots-daily | `20 3 * * *` | sim | postgres | postgres | `SELECT public.fn_purge_rollback_snapshots()` |
| 15 | purge_old_telemetry_daily | `15 3 * * *` | sim | postgres | postgres | `SELECT public.purge_old_telemetry(90)` |
| 16 | detect_slow_queries_hourly | `20 * * * *` | sim | postgres | postgres | `SELECT public.detect_slow_queries(500, 100)` |
| 17 | detect-stalled-cron-15min | `*/15 * * * *` | sim | postgres | postgres | `SELECT public.detect_stalled_cron_jobs()` |
| 21 | deal-risk-digest-daily | `0 11 * * *` | sim | postgres | postgres | `SELECT net.http_post(     url := (SELECT value FROM public._internal_secrets WHERE key='functions_base_url') \|\| '/deal-risk-digest',     headers := jsonb_build_object('Content-Type','application/json','apikey',(SELECT value FROM public._internal_secrets WHERE key='anon_key')),     body := jsonb_build_object('triggered_at', now())   );` |
| 26 | email-bulk-retry-15min | `*/15 * * * *` | sim | postgres | postgres | `SELECT net.http_post(     url := (SELECT value FROM public._internal_secrets WHERE key='functions_base_url') \|\| '/email-bulk-retry',     headers := jsonb_build_object('Content-Type','application/json','apikey',(SELECT value FROM public._internal_secrets WHERE key='anon_key')),     body := '{}'::jsonb   );` |
| 29 | auto-task-queue-hourly | `0 * * * *` | sim | postgres | postgres | `SELECT public.trigger_generate_urgent_client_tasks();` |
| 30 | detect-client-churn-alerts-hourly | `15 * * * *` | sim | postgres | postgres | `SELECT public.trigger_detect_client_churn_alerts();` |
| 36 | notify-v4-quote-status-every-5min | `*/5 * * * *` | sim | postgres | postgres | `SELECT public.trigger_internal_edge_job('notify-v4-quote-status');` |
| 37 | check-v4-callback-alerts-every-5min | `*/5 * * * *` | sim | postgres | postgres | `SELECT public.trigger_internal_edge_job('check-v4-callback-alerts');` |
| 38 | cron-failure-alerter-10min | `*/10 * * * *` | sim | postgres | postgres | `SELECT public.trigger_internal_edge_job('cron-failure-alerter');` |
| 39 | process-call-recording-ingest-1min | `* * * * *` | sim | postgres | postgres | `SELECT public.trigger_internal_edge_job('process-call-recording-ingest');` |
| 40 | edge-retry-threshold-alert-15min | `*/15 * * * *` | sim | postgres | postgres | `SELECT public.trigger_internal_edge_job('edge-retry-threshold-alert');` |
| 41 | wal-health-alert-5min | `*/5 * * * *` | sim | postgres | postgres | `SELECT public.trigger_internal_edge_job('wal-health-alert');` |
| 42 | winloss-webhook-health-monitor-15min | `*/15 * * * *` | sim | postgres | postgres | `SELECT public.trigger_internal_edge_job('winloss-webhook-health-monitor');` |
| 44 | webvitals-regression-alert-daily | `15 11 * * *` | sim | postgres | postgres | `SELECT public.trigger_internal_edge_job('webvitals-regression-alert');` |
| 45 | data-retention-purge-daily | `45 3 * * *` | sim | postgres | postgres | `SELECT public.fn_apply_data_retention();` |
| 46 | rotate-daily-challenges-daily | `10 3 * * *` | sim | postgres | postgres | `SELECT public.trigger_internal_edge_job('rotate-daily-challenges');` |
| 47 | weekly-matchmaking | `1 0 * * 1` | sim | postgres | postgres | `SELECT public.match_weekly_players()` |
| 48 | bitrix24-sync-hourly | `17 * * * *` | sim | postgres | postgres | `SELECT public.trigger_internal_edge_job('bitrix24-sync');` |
| 49 | weekly-matchups-resolution | `5 0 * * 1` | sim | postgres | postgres | `SELECT public.resolve_weekly_matchups()` |
