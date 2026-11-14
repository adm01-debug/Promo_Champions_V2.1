# Métricas (voláteis — mudam sem alteração de schema)

Valores aproximados de propósito, para não gerar commits a cada coleta. Fora de `snapshot.json`; o bruto está em `stats.json`.

## Banco

| métrica | valor |
|---|---|
| tamanho | 251.2 MB |
| schema public | 153.9 MB |


## Tabelas (ordenadas por tamanho)

| tabela | linhas (~) | total | heap | índices | linhas mortas (~) | seq scans (~) | idx scans (~) | último autovacuum |
|---|---|---|---|---|---|---|---|---|
| public.audit_logs | ~24.7k | 95.3 MB | 64.9 MB | 15.9 MB | ~2.6k | ~50 | ~1.5k | 2026-11-13 |
| public.web_vitals_samples | ~25.5k | 15.1 MB | 8.4 MB | 6.7 MB | ~510 | ~60 | ~560 | 2026-11-13 |
| public.notifications | ~5.6k | 4.0 MB | 2.3 MB | 1.7 MB | 0 | ~60 | ~45.3k | 2026-11-06 |
| public.sales | ~720 | 2.3 MB | 424.0 KB | 1.8 MB | ~100 | ~178.4k | ~4.3M | 2026-11-14 |
| public.db_rollback_snapshots | ~8.8k | 1.7 MB | 864.0 KB | 880.0 KB | ~290 | ~40 | ~6.6k | 2026-11-13 |
| public.activities | ~2.2k | 1.6 MB | 384.0 KB | 1.2 MB | 0 | ~2.7k | ~10.8k | 2026-08-15 |
| public.error_logs | ~60 | 1.6 MB | 1.2 MB | 192.0 KB | ~60 | ~60 | ~32.7k | 2026-10-22 |
| public.maintenance_log | ~2.9k | 1.3 MB | 744.0 KB | 528.0 KB | 0 | ~60 | ~690 | 2026-11-06 |
| public.semantic_index | 0 | 1.2 MB | 0 B | 1.2 MB | 0 | ~70 | 0 |  |
| public.tasks | ~1.6k | 920.0 KB | 376.0 KB | 504.0 KB | 1 | ~220 | ~8.8k | 2026-08-13 |
| public.quotes | ~490 | 752.0 KB | 304.0 KB | 408.0 KB | 0 | ~2.3k | ~395.3k | 2026-11-14 |
| public.lead_score_history | ~1.2k | 728.0 KB | 544.0 KB | 144.0 KB | 0 | ~40 | ~7.4k | 2026-08-04 |
| public.territories | ~40 | 728.0 KB | 456.0 KB | 232.0 KB | 0 | ~620 | ~3.4M | 2026-11-14 |
| public.clients | ~100 | 704.0 KB | 40.0 KB | 624.0 KB | ~20 | ~580 | ~6.8k | 2026-08-14 |
| public.cron_failure_alerts | ~1.3k | 672.0 KB | 208.0 KB | 424.0 KB | ~160 | ~1.6k | ~103k | 2026-11-13 |
| public.lead_scores | ~900 | 640.0 KB | 448.0 KB | 160.0 KB | ~50 | ~90 | ~8.5k |  |
| public.login_attempts | ~1.3k | 640.0 KB | 264.0 KB | 336.0 KB | ~500 | ~1.7k | ~42.6k | 2026-11-13 |
| public.deal_health_scores | ~900 | 632.0 KB | 400.0 KB | 200.0 KB | 0 | ~80 | ~7.1k |  |
| public.orders | ~340 | 608.0 KB | 264.0 KB | 304.0 KB | 0 | ~520 | ~385.4k | 2026-11-14 |
| public.commissions | ~940 | 600.0 KB | 200.0 KB | 360.0 KB | ~100 | ~80 | ~2.5k | 2026-11-14 |
| public.deal_stage_transitions | ~1.3k | 592.0 KB | 208.0 KB | 344.0 KB | ~300 | ~60 | ~9.6k | 2026-11-13 |
| public.audit_log | ~330 | 584.0 KB | 304.0 KB | 248.0 KB | 4 | ~80 | ~210 |  |
| public.quote_sync_inbound_log | ~450 | 544.0 KB | 128.0 KB | 248.0 KB | ~310 | ~160 | ~310 |  |
| public.win_loss_analyses | ~500 | 544.0 KB | 208.0 KB | 296.0 KB | 0 | ~110 | ~11.3k | 2026-08-14 |
| public.deal_stage_history | ~1.3k | 496.0 KB | 144.0 KB | 312.0 KB | ~300 | ~90 | ~71.3k | 2026-11-13 |
| public.deal_velocity_predictions | ~900 | 408.0 KB | 240.0 KB | 136.0 KB | 0 | ~70 | ~8k |  |
| public.quote_items | ~1.1k | 408.0 KB | 168.0 KB | 200.0 KB | ~100 | ~60 | ~269.6k | 2026-11-14 |
| public.quotes_inbound | ~150 | 352.0 KB | 48.0 KB | 136.0 KB | ~20 | ~80 | ~340 |  |
| public.page_analytics | ~160 | 344.0 KB | 136.0 KB | 176.0 KB | ~480 | ~440 | ~740 |  |
| public.deal_stakeholders | ~600 | 336.0 KB | 136.0 KB | 168.0 KB | 0 | ~70 | ~7.4k |  |
| public.webhook_inbound_dedupe | 0 | 312.0 KB | 72.0 KB | 72.0 KB | ~190 | ~190 | ~1.3k |  |
| public.order_items | ~620 | 288.0 KB | 128.0 KB | 120.0 KB | ~100 | ~60 | ~76.7k | 2026-11-14 |
| public.order_status_events | ~350 | 280.0 KB | 96.0 KB | 144.0 KB | 0 | ~60 | ~4.4k | 2026-11-14 |
| public.deal_outcomes | ~500 | 256.0 KB | 88.0 KB | 136.0 KB | 0 | ~80 | ~6.5k |  |
| public.deal_health_history | ~900 | 240.0 KB | 96.0 KB | 112.0 KB | 0 | ~70 | ~7.1k |  |
| public.quote_conversion_audit | ~240 | 208.0 KB | 72.0 KB | 104.0 KB | 0 | ~70 | 0 |  |
| public.account_activities | ~360 | 200.0 KB | 56.0 KB | 112.0 KB | 0 | ~80 | ~20 |  |
| public.products | ~20 | 200.0 KB | 8.0 KB | 184.0 KB | 4 | ~3k | ~2.8k |  |
| public.bitrix24_sync_logs | ~500 | 192.0 KB | 80.0 KB | 80.0 KB | 0 | ~80 | ~90 |  |
| public.accounts | ~120 | 184.0 KB | 24.0 KB | 120.0 KB | 0 | ~130 | ~146.5k | 2026-11-14 |
| public.client_portfolio | ~100 | 168.0 KB | 16.0 KB | 120.0 KB | 1 | ~100 | ~490 |  |
| public.stock_movements | ~480 | 168.0 KB | 48.0 KB | 88.0 KB | 1 | ~70 | ~10 |  |
| public.price_history | ~200 | 144.0 KB | 32.0 KB | 80.0 KB | 0 | ~100 | 5 |  |
| public.salespeople | 9 | 144.0 KB | 8.0 KB | 128.0 KB | ~40 | ~17.4M | ~60.2k |  |
| public.renewals | ~100 | 128.0 KB | 16.0 KB | 80.0 KB | 0 | ~70 | ~30 |  |
| public.battle_participants | 1 | 120.0 KB | 16.0 KB | 64.0 KB | 0 | ~1.3k | ~80.1k | 2026-08-14 |
| public.monthly_sales_summary | ~30 | 120.0 KB | 64.0 KB | 16.0 KB | 0 | ~40 | ~90.8k | 2026-11-14 |
| public.nps_surveys | ~250 | 120.0 KB | 40.0 KB | 48.0 KB | 0 | ~80 | ~6.2k |  |
| public.client_churn_alerts_state | 3 | 112.0 KB | 8.0 KB | 64.0 KB | ~30 | ~1.8k | ~90 | 2026-10-28 |
| public.data_access_log | ~120 | 112.0 KB | 16.0 KB | 64.0 KB | 1 | ~70 | ~120 |  |
| public.feed_reactions | ~150 | 112.0 KB | 16.0 KB | 64.0 KB | 0 | ~70 | ~4.4k |  |
| public.onboarding_journeys | ~100 | 112.0 KB | 16.0 KB | 64.0 KB | 0 | ~80 | ~10 |  |
| public.slow_query_alerts | 9 | 112.0 KB | 8.0 KB | 64.0 KB | ~30 | ~2.2k | ~2.1k | 2026-11-14 |
| public.supplier_products | 0 | 112.0 KB | 16.0 KB | 64.0 KB | ~40 | ~80 | ~200 |  |
| public.suppliers | 6 | 112.0 KB | 8.0 KB | 96.0 KB | 8 | ~90 | ~1.4k |  |
| public.support_tickets | ~150 | 112.0 KB | 24.0 KB | 56.0 KB | 0 | ~80 | 5 |  |
| public.weekly_matchups | ~40 | 112.0 KB | 16.0 KB | 64.0 KB | ~40 | ~140 | ~380 |  |
| public.victory_feed | ~80 | 104.0 KB | 24.0 KB | 48.0 KB | 8 | ~70 | ~420 |  |
| public.winloss_webhook_deliveries | 1 | 104.0 KB | 8.0 KB | 56.0 KB | ~20 | ~1.7k | ~20 | 2026-11-13 |
| public.access_denied_logs | 0 | 96.0 KB | 16.0 KB | 48.0 KB | 9 | ~120 | ~360 |  |
| public.achievements | 4 | 96.0 KB | 8.0 KB | 80.0 KB | ~30 | ~490 | ~40 |  |
| public.csat_ces_surveys | ~110 | 96.0 KB | 16.0 KB | 48.0 KB | 0 | ~90 | 5 |  |
| public.expansion_opportunities | 0 | 96.0 KB | 8.0 KB | 80.0 KB | 0 | ~80 | ~10 |  |
| public.feed_comments | ~90 | 96.0 KB | 16.0 KB | 48.0 KB | 0 | ~90 | ~4.4k |  |
| public.race_seasons | 0 | 96.0 KB | 8.0 KB | 80.0 KB | 2 | ~90 | ~290 |  |
| public.teams | 3 | 96.0 KB | 8.0 KB | 80.0 KB | 0 | ~80 | ~20 |  |
| public.territory_history | ~20 | 96.0 KB | 8.0 KB | 48.0 KB | ~30 | ~700 | ~90 | 2026-11-13 |
| public.win_loss_patterns | 4 | 96.0 KB | 8.0 KB | 80.0 KB | ~40 | ~110 | ~40 |  |
| public.integration_logs | 0 | 88.0 KB | 8.0 KB | 72.0 KB | 2 | ~110 | ~90 |  |
| public.plan_rollback_ddl | ~80 | 88.0 KB | 40.0 KB | 16.0 KB | 0 | ~50 | 0 |  |
| public.sales_goals | 5 | 88.0 KB | 8.0 KB | 80.0 KB | 5 | ~130 | ~14.9k |  |
| public.cadence_outcome_rules | 4 | 80.0 KB | 8.0 KB | 64.0 KB | 4 | ~80 | 0 |  |
| public.forecast_snapshots | 0 | 80.0 KB | 8.0 KB | 64.0 KB | 0 | ~70 | 7 |  |
| public.price_alerts | 0 | 80.0 KB | 8.0 KB | 64.0 KB | 0 | ~100 | 2 |  |
| public.prospect_cadences | 0 | 80.0 KB | 0 B | 72.0 KB | 0 | ~660 | ~47.9k |  |
| public.revenue_forecasts | 0 | 80.0 KB | 8.0 KB | 64.0 KB | 0 | ~70 | ~20 |  |
| public.stage_conversion_metrics | 0 | 80.0 KB | 8.0 KB | 64.0 KB | 0 | ~70 | ~10 |  |
| public.call_recordings | 0 | 72.0 KB | 0 B | 64.0 KB | 0 | ~80 | ~6.2k |  |
| public.email_bulk_drafts | 0 | 72.0 KB | 0 B | 64.0 KB | 0 | ~80 | ~110 |  |
| public.qbr_schedule | 0 | 72.0 KB | 8.0 KB | 64.0 KB | 0 | ~70 | ~30 |  |
| public.role_permissions | 0 | 72.0 KB | 8.0 KB | 48.0 KB | 0 | ~70 | ~20 | 2026-08-04 |
| public.team_closers | 0 | 72.0 KB | 8.0 KB | 64.0 KB | 0 | ~70 | ~20 |  |
| public.v4_callback_dead_letters | 0 | 72.0 KB | 8.0 KB | 56.0 KB | 0 | ~80 | ~28.7k |  |
| public.winloss_webhook_subscriptions | 1 | 72.0 KB | 8.0 KB | 24.0 KB | ~30 | ~3.2k | ~100 | 2026-11-13 |
| public.active_power_ups | 0 | 64.0 KB | 8.0 KB | 48.0 KB | 0 | ~70 | ~20 |  |
| public.automation_runs | 0 | 64.0 KB | 8.0 KB | 48.0 KB | 0 | ~90 | 4 |  |
| public.automation_workflows | 0 | 64.0 KB | 8.0 KB | 48.0 KB | 0 | ~130 | ~40 |  |
| public.conversation_analyses | 0 | 64.0 KB | 0 B | 56.0 KB | 0 | ~80 | ~6.3k |  |
| public.data_subject_requests | 0 | 64.0 KB | 8.0 KB | 48.0 KB | 2 | ~50 | ~60 |  |
| public.external_seller_map | 0 | 64.0 KB | 8.0 KB | 48.0 KB | 0 | ~70 | 3 |  |
| public.icp_data | 0 | 64.0 KB | 0 B | 56.0 KB | 0 | ~130 | ~20 |  |
| public.permissions | 0 | 64.0 KB | 8.0 KB | 48.0 KB | ~30 | ~100 | ~70 |  |
| public.playbook_items | ~20 | 64.0 KB | 8.0 KB | 48.0 KB | ~20 | ~70 | 0 |  |
| public.product_usage_summary | ~100 | 64.0 KB | 16.0 KB | 16.0 KB | 0 | ~80 | 5 |  |
| public.race_reactions | 0 | 64.0 KB | 8.0 KB | 48.0 KB | 0 | ~60 | ~20 |  |
| public.sales_battles | 0 | 64.0 KB | 8.0 KB | 48.0 KB | 2 | ~80 | ~4.7k |  |
| public.saved_filters | 0 | 64.0 KB | 0 B | 56.0 KB | 0 | ~70 | ~30 |  |
| public.win_loss_insights | 0 | 64.0 KB | 8.0 KB | 48.0 KB | 4 | ~100 | ~40 |  |
| public.winloss_alert_settings | 1 | 64.0 KB | 8.0 KB | 48.0 KB | 1 | ~70 | 1 |  |
| public.activity_goals | 0 | 56.0 KB | 8.0 KB | 48.0 KB | ~20 | ~120 | ~320 |  |
| public.agenda_events | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~80 | ~6.2k |  |
| public.cadence_tasks | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~80 | ~1.9k |  |
| public.channel_interactions | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~70 | ~6.2k |  |
| public.daily_metrics | 7 | 56.0 KB | 8.0 KB | 48.0 KB | 7 | ~80 | ~2k |  |
| public.inventory_levels | 0 | 56.0 KB | 8.0 KB | 48.0 KB | ~20 | ~80 | 2 |  |
| public.query_telemetry | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~110 | ~160 |  |
| public.security_events | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~110 | 1 |  |
| public.skill_assessments | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~70 | 9 |  |
| public.task_assignments | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~70 | 0 |  |
| public.twilio_call_sessions | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~70 | ~6.2k |  |
| public.user_roles | 2 | 56.0 KB | 8.0 KB | 48.0 KB | 5 | ~15.5M | 4 |  |
| public.webhook_inbound_log | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~110 | 0 |  |
| public.ai_narrative_cache | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~70 | 0 |  |
| public.auto_task_queue_settings | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 0 | ~70 | ~1.8k |  |
| public.blocked_ips | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~80 | 1 |  |
| public.cadence_steps | 5 | 48.0 KB | 8.0 KB | 32.0 KB | 5 | ~80 | 0 |  |
| public.cadences | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 1 | ~760 | ~150 |  |
| public.call_logs | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~80 | ~6.2k |  |
| public.call_metric_benchmarks | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 5 | ~70 | 5 |  |
| public.call_recording_ingest_jobs | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~1.1k | 0 |  |
| public.category_metrics | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 8 | ~70 | ~20 |  |
| public.coaching_opportunities | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~70 | ~10 |  |
| public.coaching_sessions | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~70 | ~20 |  |
| public.deal_chat_history | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~70 | ~6.2k |  |
| public.email_opt_outs | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~70 | ~10 |  |
| public.entity_versions | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~60 | 2 |  |
| public.feature_flags | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 0 | ~70 | ~21.2k |  |
| public.follow_up_settings | 1 | 48.0 KB | 8.0 KB | 32.0 KB | 1 | ~70 | 0 |  |
| public.inbound_reply_events | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~180 | 0 |  |
| public.lead_assignments | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~70 | ~6.2k |  |
| public.outbound_messages | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~70 | ~40 |  |
| public.pipeline_stages | ~20 | 48.0 KB | 8.0 KB | 32.0 KB | ~20 | ~80 | 7 |  |
| public.portfolio_settings | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 3 | ~70 | 0 |  |
| public.quota_attainment_forecasts | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~60 | ~10 |  |
| public.race_badges | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~60 | ~10 |  |
| public.race_cars | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 0 | ~70 | ~3.2k |  |
| public.race_events | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~70 | ~50 |  |
| public.rate_limit_settings | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 5 | ~70 | 5 |  |
| public.reauthentication_requests | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 1 | ~60 | 4 |  |
| public.sales_territories | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 8 | ~80 | 9 |  |
| public.sequence_enrollments | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~70 | 1 |  |
| public.sequence_step_assignments | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~70 | 0 |  |
| public.skill_development_tracks | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~60 | 9 |  |
| public.sla_policies | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 5 | ~70 | 9 |  |
| public.sla_violations | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~70 | ~6.2k |  |
| public.stage_inactivity_rules | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 0 | ~70 | ~20 |  |
| public.tournament_matches | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~70 | ~30 |  |
| public.v4_callback_alert_settings | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 0 | ~60 | ~10 |  |
| public.weekly_challenges | 5 | 48.0 KB | 8.0 KB | 32.0 KB | 5 | ~80 | 0 |  |
| public.win_probability_deal_calibrations | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~70 | ~6.1k |  |
| public.winloss_webhook_alerts | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~70 | ~820 |  |
| public.winloss_webhook_replay_audit | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~70 | 0 |  |
| public.workflow_rules | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 0 | ~60 | ~80 |  |
| public.account_contacts | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | ~6.2k |  |
| public.ai_agent_runs | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~120 | 1 |  |
| public.approval_requests | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~110 | ~6.2k |  |
| public.cadence_ab_assignments | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 1 |  |
| public.call_coaching_scorecards | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 2 |  |
| public.call_critical_moments | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | ~20 |  |
| public.call_question_analysis | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 1 |  |
| public.campaign_health_alerts | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~80 | 1 |  |
| public.circuit_breaker_events | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | ~20 |  |
| public.commission_bonus_awards | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~80 | 1 |  |
| public.commission_rules | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~80 | ~140.8k |  |
| public.competitive_chat_messages | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | ~20 |  |
| public.consent_records | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~40 | 0 |  |
| public.contact_engagement_score | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~80 | 1 |  |
| public.contact_send_time_profile | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 2 |  |
| public.daily_challenge_progress | 0 | 40.0 KB | 0 B | 40.0 KB | 0 | ~70 | ~10 |  |
| public.daily_challenges | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | ~60 |  |
| public.deal_risk_signals | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | ~6.2k |  |
| public.deal_velocity_alerts | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | ~6.2k |  |
| public.dialer_queue_items | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | ~6.2k |  |
| public.email_engagement_scores | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | ~6.1k |  |
| public.email_logs | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 0 |  |
| public.embedded_report_tokens | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~60 | 0 |  |
| public.follow_up_notifications | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | ~8.8k |  |
| public.forecast_confidence_scores | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 1 |  |
| public.geo_blocked_regions | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 1 |  |
| public.integration_autotest_settings | 0 | 40.0 KB | 8.0 KB | 32.0 KB | 1 | ~70 | 0 |  |
| public.integration_secret_refs | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~40 | 0 |  |
| public.known_devices | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~60 | 5 |  |
| public.lead_routing_log | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | ~20 |  |
| public.lead_score_explanations | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | ~6.2k |  |
| public.message_templates | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | ~50 |  |
| public.objection_library | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 1 |  |
| public.objections_library | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~60 | ~10 |  |
| public.pipeline_coverage_snapshots | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 0 |  |
| public.playbook_progress | 0 | 40.0 KB | 0 B | 40.0 KB | 0 | ~70 | ~11.9k |  |
| public.quota_attainment_alerts | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~60 | ~10 |  |
| public.quote_sync_logs | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 0 |  |
| public.race_daily_snapshots | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~60 | 1 |  |
| public.race_overlay_telemetry | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~60 | 1 |  |
| public.race_powerups | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | ~10 |  |
| public.race_rivalries_persistent | 0 | 40.0 KB | 0 B | 40.0 KB | 0 | ~60 | 1 |  |
| public.race_team_members | 0 | 40.0 KB | 0 B | 40.0 KB | 0 | ~60 | 0 |  |
| public.ranking_notifications | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~60 | ~200 |  |
| public.report_embed_tokens | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 0 |  |
| public.sale_notifications_audit | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~150 | ~6.6k |  |
| public.sales_streaks | 0 | 40.0 KB | 8.0 KB | 32.0 KB | 1 | ~10.6k | ~440 |  |
| public.salesperson_coaching_aggregates | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~60 | 2 |  |
| public.salesperson_custom_field_values | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~60 | ~10 |  |
| public.scheduled_reports | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 0 |  |
| public.scheduled_sends | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | ~6.1k |  |
| public.sequence_step_executions | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 0 |  |
| public.stage_bottleneck_insights | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 0 |  |
| public.stage_velocity_baselines | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 3 |  |
| public.user_2fa | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~60 | 1 |  |
| public.v4_callback_metrics | 0 | 40.0 KB | 8.0 KB | 32.0 KB | 0 | ~60 | ~10 |  |
| public.webauthn_credentials | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 4 |  |
| public.webhook_events | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~60 | 0 |  |
| public.webhook_logs | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~60 | 0 |  |
| public.whatsapp_conversations | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | ~6.1k |  |
| public.win_probability_calibrations | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 3 |  |
| public.winloss_webhook_dead_letters | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | ~900 |  |
| public.winloss_webhook_replay_invocations | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 1 |  |
| public.xp_adjustments | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~70 | 0 |  |
| public._internal_secrets | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | ~260.9k | ~51.1k |  |
| public.account_plans | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~80 | 9 |  |
| public.active_sessions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 3 |  |
| public.activity_audit_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~180 | 7 |  |
| public.api_tokens | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 2 |  |
| public.app_config | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | ~40 | ~10 |  |
| public.approval_decisions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 5 |  |
| public.asset_usage_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 3 |  |
| public.cadence_ab_tests | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~90 | 2 |  |
| public.cadence_alert_templates | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 2 | ~70 | 1 |  |
| public.cadence_enrollment_rules | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~90 | ~72.5k |  |
| public.call_conversation_metrics | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 1 |  |
| public.call_objections | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 1 |  |
| public.call_questions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 1 |  |
| public.challenge_progress | 0 | 32.0 KB | 0 B | 32.0 KB | 0 | ~70 | ~10 |  |
| public.chat_messages | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 2 |  |
| public.churn_alert_settings | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | ~1.8k | 3 |  |
| public.client_interactions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 4 |  |
| public.coaching_actions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | ~160 |  |
| public.coaching_scorecard_config | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 4 | ~70 | 5 |  |
| public.collectible_badges | 0 | 32.0 KB | 8.0 KB | 16.0 KB | ~10 | ~130 | 1 |  |
| public.commercial_approval_requests | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~100 | 2 |  |
| public.commission_bonuses | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | ~40 |  |
| public.committee_extraction_runs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | ~6.2k |  |
| public.competitive_seasons | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | ~80 | 2 |  |
| public.competitor_mentions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 1 |  |
| public.competitors_pricing | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 2 |  |
| public.cs_tickets | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 3 |  |
| public.custom_reports | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~80 | 0 |  |
| public.daily_streak_achievements | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | ~10 |  |
| public.data_retention_policies | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | ~40 | ~80 |  |
| public.deal_committee_coverage | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | ~6.2k |  |
| public.deal_probability_scores | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | ~6.7k |  |
| public.demand_forecasts | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 2 |  |
| public.digital_signatures | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 9 |  |
| public.document_signers | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 0 |  |
| public.duplicate_block_logs | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 4 | ~350 | 1 |  |
| public.edge_retry_events | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 0 |  |
| public.email_bulk_jobs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~4.1k | ~20 |  |
| public.email_tracking_events | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~350 | ~6.2k |  |
| public.engagement_score_history | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 0 |  |
| public.executive_briefings | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | ~60 |  |
| public.follow_up_audit_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | ~6.6k |  |
| public.follow_up_territory_rules | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 1 |  |
| public.forecast_accuracy | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 0 |  |
| public.forecast_deal_contributions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | ~6.2k |  |
| public.forecast_narrative_dead_letters | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | 7 |  |
| public.geo_access_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | ~280 |  |
| public.icp_parameters | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 1 | ~70 | 1 |  |
| public.integration_connections | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~80 | ~10 |  |
| public.ip_whitelist | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 1 |  |
| public.kudos | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | ~180 |  |
| public.lead_detailed_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 3 |  |
| public.lead_routing_rules | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 3 | ~70 | 3 |  |
| public.leagues | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 5 | ~80 | 0 |  |
| public.migration_log | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 1 | ~70 | 4 |  |
| public.mql_qualifications | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | ~6.2k |  |
| public.password_reset_requests | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | ~44.9k |  |
| public.performance_bets | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | ~385.5k |  |
| public.personal_assistant_briefings | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | ~180 |  |
| public.personal_assistant_nudges | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | 0 |  |
| public.pipeline_coverage_recommendations | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | 0 |  |
| public.pipeline_inspection_snapshots | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | ~6.2k |  |
| public.pipeline_inspections | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | ~6.1k |  |
| public.pipelines | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 4 | ~80 | ~40 |  |
| public.playbooks | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 4 | ~110 | ~20 |  |
| public.prize_wheel_spins | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 9 |  |
| public.product_usage_events | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 5 |  |
| public.progressive_goals | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | 9 |  |
| public.qbr_reports | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | ~10 |  |
| public.quota_attainment_actions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | 0 |  |
| public.quota_attainment_predictions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | ~370 |  |
| public.race_scoring_rules | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~80 | ~1k |  |
| public.race_teams | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | ~20 |  |
| public.race_unlocks | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | 3 |  |
| public.race_user_daily_checkins | 0 | 32.0 KB | 0 B | 32.0 KB | 0 | ~60 | 2 |  |
| public.race_user_preferences | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | 0 |  |
| public.rank_change_notifications | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | ~20 |  |
| public.rate_limit_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~390 | 2 |  |
| public.report_executions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | 0 |  |
| public.report_schedules | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | 0 |  |
| public.sales_enablement_assets | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | 3 |  |
| public.salesperson_badges | 0 | 32.0 KB | 0 B | 32.0 KB | 0 | ~120 | ~230 |  |
| public.score_change_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | ~10 |  |
| public.sequence_step_variants | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 1 |  |
| public.sequence_steps | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 0 |  |
| public.sequences | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~120 | 0 |  |
| public.session_activity | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~100 | 2 |  |
| public.squads | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | ~70 | ~40 |  |
| public.stage_probabilities | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | ~70 | ~10 |  |
| public.status_transitions | ~100 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | ~40 | ~100 |  |
| public.supplier_orders | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 0 |  |
| public.team_custom_fields | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | 0 |  |
| public.tournament_participants | 0 | 32.0 KB | 0 B | 32.0 KB | 0 | ~60 | 9 |  |
| public.user_2fa_backup_codes | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | 1 |  |
| public.user_2fa_log | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | 1 |  |
| public.user_mfa_settings | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | ~210 |  |
| public.webauthn_challenges | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | 0 |  |
| public.webhook_deliveries | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | ~110 |  |
| public.webhooks | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 1 |  |
| public.website_visitor_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~110 | 0 |  |
| public.win_calibration_buckets | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | 0 |  |
| public.winloss_webhook_dispatch_metrics | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | 0 |  |
| public.workflow_executions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~70 | 0 |  |
| public.workflows | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | 0 |  |
| public.ai_agent_actions | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 2 |  |
| public.ai_sales_insights | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | ~6.1k |  |
| public.approval_workflows | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~110 | 3 |  |
| public.buying_committee | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | ~6.1k |  |
| public.buying_committee_members | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | ~6.2k |  |
| public.buying_signals | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 1 |  |
| public.cadence_advanced_stats | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 0 |  |
| public.cadence_funnel_rules | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 0 |  |
| public.call_insights | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 1 |  |
| public.call_intelligence_triggers | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 1 |  |
| public.call_objection_analysis | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 1 |  |
| public.call_sentiment_timeline | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 4 |  |
| public.call_transcripts | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 1 |  |
| public.channel_credentials | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~110 | 1 |  |
| public.chat_conversations | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | ~10 |  |
| public.client_renewals | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 1 |  |
| public.coaching_skill_benchmarks | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 2 |  |
| public.cohort_analyses | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 1 |  |
| public.combo_tracking | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | ~70 | ~10 |  |
| public.committee_coverage_history | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | ~6.2k |  |
| public.competitors_registry | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 0 |  |
| public.critical_moment_notifications | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | ~70 | 0 |  |
| public.dashboard_layouts | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 9 |  |
| public.dead_letter_replay_audit | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 1 |  |
| public.edge_call_failures | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~40 | 1 |  |
| public.email_engagement_score_history | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | ~6.2k |  |
| public.enriched_company_intelligence | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | 0 |  |
| public.experiment_assignments | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | ~80 | 1 |  |
| public.experiment_variants | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 0 |  |
| public.follow_up_templates | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 1 |  |
| public.geocode_cache | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~40 | 0 |  |
| public.integration_autotest_jobs | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | 7 |  |
| public.integration_health_checks | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~80 | 0 |  |
| public.intent_audit_logs | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 1 |  |
| public.lead_churn_risk | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | ~6.2k |  |
| public.lead_source_configs | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 1 |  |
| public.league_history | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | ~70 | ~10 |  |
| public.league_members | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | ~140 | 9 |  |
| public.login_alerts | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~110 | ~44.9k |  |
| public.mfa_verification_attempts | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~240 | 1 |  |
| public.mood_entries | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | ~60 | ~10 |  |
| public.notification_preferences | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | ~180 |  |
| public.onboarding_steps | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | 0 |  |
| public.password_history | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | 1 |  |
| public.person_intelligence | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | 0 |  |
| public.price_protection_rules | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | 3 |  |
| public.pricing_rules | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | 2 |  |
| public.product_stock_log | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | 3 |  |
| public.product_usage | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | 1 |  |
| public.push_subscriptions | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | 2 |  |
| public.salesperson_commission_configs | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | ~20 |  |
| public.salesperson_leagues | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | ~60 | ~180 |  |
| public.salesperson_preferences | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | ~180 |  |
| public.scheduled_report_runs | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 0 |  |
| public.sdr_alert_configs | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | 1 |  |
| public.sdr_alert_history | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | ~40 |  |
| public.sdr_performance_settings | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | 1 |  |
| public.security_alert_history | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | ~40 |  |
| public.security_alert_settings | 0 | 24.0 KB | 8.0 KB | 16.0 KB | 1 | ~60 | 0 |  |
| public.send_time_profiles | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | ~6.2k |  |
| public.sms_verification_codes | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | 1 |  |
| public.squad_members | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | ~60 | 0 |  |
| public.supplier_order_items | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | ~70 | 2 |  |
| public.supplier_risk_assessments | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 0 |  |
| public.tournaments | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | 9 |  |
| public.user_app_settings | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | ~30 |  |
| public.v4_callback_alerts | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | 8 |  |
| public.win_loss_insight_comments | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~70 | 4 |  |
| public.xp_history | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~60 | ~140 |  |
| public.available_spins | 0 | 16.0 KB | 0 B | 16.0 KB | 0 | ~70 | ~10 |  |
| public.dialer_queues | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | ~240 | 0 |  |
| public.expansion_playbooks | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | ~70 | 0 |  |
| public.experiments | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | ~60 | 0 |  |
| public.lead_intelligence_metrics | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | ~70 | 2 |  |
| public.performance_impact_factors | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | ~80 | 0 |  |
| public.salesperson_performance_telemetry | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | ~60 | 1 |  |
| public.salesperson_xp | 0 | 16.0 KB | 0 B | 16.0 KB | 0 | ~210 | ~10 |  |
| public.task_catalog | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | ~70 | 0 |  |
| public.user_winloss_preferences | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | ~60 | 0 |  |
| public.whatsapp_template_versions | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | ~60 | 0 |  |
| public.ab_tests | 0 | 8.0 KB | 0 B | 8.0 KB | 0 | ~70 | 0 |  |
| public.daily_challenge_rotations | 0 | 8.0 KB | 0 B | 8.0 KB | 0 | ~40 | 0 |  |
| public.lead_score_trends | 0 | 8.0 KB | 0 B | 8.0 KB | 0 | ~100 | 2 |  |


## Índices nunca usados (candidatos a remoção; ignore PK/UNIQUE)

| índice | tabela | tamanho |
|---|---|---|
| idx_audit_logs_changed_by_changed | public.audit_logs | 2.0 MB |
| idx_audit_logs_record_id | public.audit_logs | 2.0 MB |
| idx_audit_logs_table_name | public.audit_logs | 2.4 MB |
| idx_clients_email_trgm | public.clients | 152.0 KB |
| idx_clients_name_trgm | public.clients | 96.0 KB |
| idx_cron_failure_alerts_jobname_alerted | public.cron_failure_alerts | 168.0 KB |
| idx_dst_open | public.deal_stage_transitions | 88.0 KB |
| idx_login_attempts_email_created | public.login_attempts | 88.0 KB |
| idx_notifications_category | public.notifications | 488.0 KB |
| idx_notifications_user_unread | public.notifications | 488.0 KB |
| idx_page_analytics_salesperson_route | public.page_analytics | 72.0 KB |
| idx_qs_inbound_log_source_status_time | public.quote_sync_inbound_log | 96.0 KB |
| idx_sales_status_created_at | public.sales | 80.0 KB |
| idx_semantic_index_embedding | public.semantic_index | 1.2 MB |
| idx_web_vitals_user_created | public.web_vitals_samples | 1.6 MB |


## Storage

_nenhum_


## Auth (agregados)

| métrica | valor |
|---|---|
| usuários (~) | 7 |
| confirmados (~) | 6 |
| criados últimos 30d (~) | 1 |

| provider | usuários (~) |
|---|---|
| email | 6 |


## Consultas mais custosas (pg_stat_statements, desde o último reset)
| role | chamadas (~) | total ms (~) | média ms | query |
|---|---|---|---|---|
| postgres | ~500 | ~2.6M | 5255.33 | `SELECT public.detect_stalled_cron_jobs()` |
| postgres | ~420 | ~1.3M | 3025.91 | `SELECT jobid, runid, status, start_time, end_time, EXTRACT($2 FROM (end_time - start_time))::numeric(10,2) AS seconds, left(return_message, $3) AS return_message FROM (SELECT *, row_number() OVER (PARTITION BY jobid ORDE` |
| service_role | ~740 | ~1.2M | 1661.82 | `WITH pgrst_source AS (SELECT "pgrst_call".* FROM (SELECT $1 AS json_data) pgrst_payload, LATERAL (SELECT "_since_minutes" FROM json_to_record(pgrst_payload.json_data) AS _("_since_minutes" integer) LIMIT $4) pgrst_body ,` |
| authenticated | ~1.2k | ~585.5k | 470.25 | `WITH pgrst_source AS (SELECT pgrst_call.pgrst_scalar FROM (SELECT $1 AS json_data) pgrst_payload, LATERAL (SELECT "_quote_id" FROM json_to_record(pgrst_payload.json_data) AS _("_quote_id" uuid) LIMIT $4) pgrst_body , LAT` |
| postgres | ~13.9k | ~438.5k | 31.52 | `SELECT public.trigger_internal_edge_job($1)` |
| postgres | ~420 | ~337.7k | 813.62 | `SELECT n.nspname AS schema, c.relname AS "table", a.attnum AS position, a.attname AS name, format_type(a.atttypid, a.atttypmod) AS type, NOT a.attnotnull AS nullable, pg_get_expr(d.adbin, d.adrelid) AS "default", NULLIF(` |
| authenticated | ~220 | ~175k | 795.36 | `WITH pgrst_source AS ( SELECT "public"."quotes".*, row_to_json("quotes_salespeople_1".*)::jsonb AS "salespeople", row_to_json("quotes_sales_1".*)::jsonb AS "sales" FROM "public"."quotes" LEFT JOIN LATERAL ( SELECT "sales` |
| postgres | ~420 | ~167.2k | 402.88 | `SELECT n.nspname AS schema, c.relname AS name, GREATEST(c.reltuples::bigint, $1) AS est_rows, pg_total_relation_size(c.oid) AS total_bytes, pg_relation_size(c.oid) AS heap_bytes, pg_indexes_size(c.oid) AS index_bytes, s.` |
| authenticated | ~390 | ~147.6k | 376.57 | `WITH pgrst_source AS (DELETE FROM "public"."sales" WHERE "public"."sales"."id" = ANY ($1) RETURNING $2) SELECT $3 AS total_result_set, pg_catalog.count(_postgrest_t) AS page_total, array[]::text[] AS header, $4::text AS ` |
| authenticated | ~220 | ~141.6k | 646.73 | `WITH pgrst_source AS ( SELECT "public"."quotes"."status", "public"."quotes"."total_value", "public"."quotes"."valid_until" FROM "public"."quotes" WHERE "public"."quotes"."deleted_at" IS NULL LIMIT $1 OFFSET $2 ) SELECT $` |
| postgres | ~420 | ~120.4k | 290.21 | `SELECT e.extname AS name, e.extversion AS version, n.nspname AS schema, (SELECT default_version FROM pg_available_extensions a WHERE a.name = e.extname) AS available_version FROM pg_extension e JOIN pg_namespace n ON n.o` |
| postgres | ~420 | ~94.9k | 228.66 | `SELECT n.nspname AS schema, p.proname AS name, pg_get_function_identity_arguments(p.oid) AS args, pg_get_function_result(p.oid) AS returns, l.lanname AS language, CASE p.prokind WHEN $1 THEN $2 WHEN $3 THEN $4 WHEN $5 TH` |
| postgres | ~420 | ~92.7k | 223.26 | `SELECT n.nspname AS schema, c.relname AS name, CASE c.relkind WHEN $1 THEN $2 ELSE $3 END AS kind, pg_get_viewdef(c.oid, $4) AS definition, c.reloptions AS options, pg_get_userbyid(c.relowner) AS owner, obj_description(c` |
| postgres | ~420 | ~81.7k | 196.91 | `SELECT n.nspname AS schema, t.relname AS "table", ic.relname AS name, pg_get_indexdef(ix.indexrelid) AS definition, ix.indisunique AS is_unique, ix.indisprimary AS is_primary, ix.indisvalid AS is_valid, am.amname AS meth` |
| postgres | ~1.5k | ~81.2k | 54.08 | `SELECT public.admin_capture_rollback_snapshot()` |


## Conexões
| usuário | estado | n |
|---|---|---|
| authenticator | idle | 11 |
| pgbouncer | idle | 1 |
| postgres | active | 1 |
| postgres | idle | 1 |
| supabase_admin | idle | 2 |
| supabase_admin |  | 1 |
