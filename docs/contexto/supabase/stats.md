# Métricas (voláteis — mudam sem alteração de schema)

Valores aproximados de propósito, para não gerar commits a cada coleta. Fora de `snapshot.json`; o bruto está em `stats.json`.

## Banco

| métrica | valor |
|---|---|
| tamanho | 257.6 MB |
| schema public | 160.3 MB |


## Tabelas (ordenadas por tamanho)

| tabela | linhas (~) | total | heap | índices | linhas mortas (~) | seq scans (~) | idx scans (~) | último autovacuum |
|---|---|---|---|---|---|---|---|---|
| public.audit_logs | ~36.5k | 99.5 MB | 67.1 MB | 16.8 MB | ~3.6k | ~10 | ~40 | 2026-11-20 |
| public.web_vitals_samples | ~15.8k | 15.1 MB | 8.4 MB | 6.7 MB | 2 | 6 | ~20 |  |
| public.notifications | ~7.2k | 5.1 MB | 2.9 MB | 2.2 MB | 0 | 7 | ~160 |  |
| public.sales | ~960 | 2.3 MB | 424.0 KB | 1.8 MB | ~90 | ~16.4k | ~429.2k | 2026-11-20 |
| public.db_rollback_snapshots | ~8.8k | 1.7 MB | 864.0 KB | 880.0 KB | ~580 | 4 | 2 |  |
| public.activities | ~2.2k | 1.6 MB | 384.0 KB | 1.2 MB | 1 | ~20 | ~3.2k |  |
| public.error_logs | 3 | 1.6 MB | 1.2 MB | 192.0 KB | ~60 | 7 | ~140 |  |
| public.maintenance_log | ~3.1k | 1.4 MB | 792.0 KB | 568.0 KB | 0 | 6 | 0 |  |
| public.semantic_index | 0 | 1.2 MB | 0 B | 1.2 MB | 0 | 8 | 0 |  |
| public.tasks | ~1.6k | 920.0 KB | 376.0 KB | 504.0 KB | 1 | ~20 | ~370 |  |
| public.cron_failure_alerts | ~1.7k | 808.0 KB | 280.0 KB | 488.0 KB | ~90 | ~40 | ~4.9k | 2026-11-20 |
| public.quotes | ~510 | 792.0 KB | 304.0 KB | 448.0 KB | ~90 | ~200 | ~22.6k | 2026-11-20 |
| public.territories | ~40 | 736.0 KB | 464.0 KB | 232.0 KB | 0 | 6 | ~355k | 2026-11-21 |
| public.lead_score_history | ~1.2k | 728.0 KB | 544.0 KB | 144.0 KB | 0 | 5 | ~330 |  |
| public.clients | ~100 | 720.0 KB | 40.0 KB | 640.0 KB | ~20 | ~30 | ~60 |  |
| public.lead_scores | ~900 | 640.0 KB | 448.0 KB | 160.0 KB | ~50 | 6 | ~330 |  |
| public.login_attempts | ~740 | 640.0 KB | 264.0 KB | 336.0 KB | ~400 | 7 | ~2.6k | 2026-11-20 |
| public.deal_health_scores | ~900 | 632.0 KB | 400.0 KB | 200.0 KB | 0 | 7 | ~330 |  |
| public.orders | ~360 | 608.0 KB | 264.0 KB | 304.0 KB | 0 | ~30 | ~22.1k | 2026-11-20 |
| public.commissions | ~940 | 600.0 KB | 200.0 KB | 360.0 KB | 0 | ~10 | ~330 | 2026-11-20 |
| public.deal_stage_transitions | ~1.4k | 592.0 KB | 208.0 KB | 344.0 KB | 0 | 7 | ~420 | 2026-11-21 |
| public.audit_log | ~340 | 584.0 KB | 304.0 KB | 248.0 KB | 4 | ~10 | 8 |  |
| public.quote_sync_inbound_log | ~770 | 584.0 KB | 136.0 KB | 272.0 KB | ~40 | 9 | 4 |  |
| public.win_loss_analyses | ~500 | 544.0 KB | 208.0 KB | 296.0 KB | 0 | ~10 | ~330 |  |
| public.deal_stage_history | ~1.4k | 520.0 KB | 168.0 KB | 312.0 KB | 0 | 7 | ~4.5k | 2026-11-21 |
| public.page_analytics | ~180 | 440.0 KB | 208.0 KB | 192.0 KB | ~60 | ~20 | 1 |  |
| public.deal_velocity_predictions | ~900 | 408.0 KB | 240.0 KB | 136.0 KB | 0 | 7 | ~330 |  |
| public.quote_items | ~1.1k | 408.0 KB | 168.0 KB | 200.0 KB | 0 | 7 | ~15.2k | 2026-11-20 |
| public.quotes_inbound | ~150 | 352.0 KB | 48.0 KB | 136.0 KB | ~20 | ~10 | 0 |  |
| public.deal_stakeholders | ~600 | 336.0 KB | 136.0 KB | 168.0 KB | 0 | 7 | ~420 |  |
| public.webhook_inbound_dedupe | 0 | 312.0 KB | 72.0 KB | 72.0 KB | ~190 | 9 | ~20 |  |
| public.order_items | ~640 | 288.0 KB | 128.0 KB | 120.0 KB | ~100 | 5 | ~4.4k | 2026-11-20 |
| public.order_status_events | ~370 | 280.0 KB | 96.0 KB | 144.0 KB | 0 | 5 | ~320 | 2026-11-20 |
| public.deal_outcomes | ~500 | 256.0 KB | 88.0 KB | 136.0 KB | 0 | 8 | ~340 |  |
| public.quote_conversion_audit | ~280 | 248.0 KB | 80.0 KB | 136.0 KB | 0 | 7 | 0 |  |
| public.bitrix24_sync_logs | ~720 | 240.0 KB | 104.0 KB | 104.0 KB | 0 | 4 | 4 |  |
| public.deal_health_history | ~900 | 240.0 KB | 96.0 KB | 112.0 KB | 0 | 5 | ~330 |  |
| public.account_activities | ~360 | 200.0 KB | 56.0 KB | 112.0 KB | 0 | 9 | 0 |  |
| public.products | ~20 | 200.0 KB | 8.0 KB | 184.0 KB | 4 | ~30 | 0 |  |
| public.accounts | ~120 | 184.0 KB | 24.0 KB | 120.0 KB | 0 | 9 | ~12k | 2026-11-20 |
| public.client_portfolio | ~100 | 168.0 KB | 16.0 KB | 120.0 KB | 1 | ~10 | 7 |  |
| public.stock_movements | ~480 | 168.0 KB | 48.0 KB | 88.0 KB | 1 | 6 | 0 |  |
| public.race_powerups | ~50 | 152.0 KB | 32.0 KB | 88.0 KB | 0 | ~40 | ~70 |  |
| public.price_history | ~200 | 144.0 KB | 32.0 KB | 80.0 KB | 0 | ~10 | 0 |  |
| public.salespeople | ~20 | 144.0 KB | 8.0 KB | 128.0 KB | ~40 | ~480.8k | ~950 |  |
| public.suppliers | 6 | 136.0 KB | 8.0 KB | 120.0 KB | 8 | ~10 | 0 |  |
| public.renewals | ~100 | 128.0 KB | 16.0 KB | 80.0 KB | 0 | 9 | 0 |  |
| public.battle_participants | 1 | 120.0 KB | 16.0 KB | 64.0 KB | 0 | 8 | 0 |  |
| public.monthly_sales_summary | ~30 | 120.0 KB | 64.0 KB | 16.0 KB | 0 | 3 | ~8.7k | 2026-11-21 |
| public.nps_surveys | ~250 | 120.0 KB | 40.0 KB | 48.0 KB | 0 | 7 | ~330 |  |
| public.client_churn_alerts_state | 3 | 112.0 KB | 8.0 KB | 64.0 KB | ~50 | ~50 | 4 |  |
| public.data_access_log | ~120 | 112.0 KB | 16.0 KB | 64.0 KB | 1 | 7 | 8 |  |
| public.feed_reactions | ~150 | 112.0 KB | 16.0 KB | 64.0 KB | 0 | 8 | 0 |  |
| public.onboarding_journeys | ~100 | 112.0 KB | 16.0 KB | 64.0 KB | 0 | 8 | 0 |  |
| public.slow_query_alerts | 9 | 112.0 KB | 8.0 KB | 64.0 KB | 2 | ~40 | ~40 | 2026-11-21 |
| public.supplier_products | ~40 | 112.0 KB | 16.0 KB | 64.0 KB | ~40 | 8 | 0 |  |
| public.support_tickets | ~150 | 112.0 KB | 24.0 KB | 56.0 KB | 0 | 7 | 0 |  |
| public.teams | 3 | 112.0 KB | 8.0 KB | 96.0 KB | 0 | ~10 | 0 |  |
| public.weekly_matchups | ~60 | 112.0 KB | 16.0 KB | 64.0 KB | ~30 | 9 | 0 |  |
| public.victory_feed | ~80 | 104.0 KB | 24.0 KB | 48.0 KB | 8 | 6 | 0 |  |
| public.winloss_webhook_deliveries | 1 | 104.0 KB | 8.0 KB | 56.0 KB | ~40 | ~80 | 0 | 2026-11-20 |
| public.access_denied_logs | ~10 | 96.0 KB | 16.0 KB | 48.0 KB | ~40 | 7 | ~20 |  |
| public.achievements | 4 | 96.0 KB | 8.0 KB | 80.0 KB | ~30 | ~10 | 0 |  |
| public.csat_ces_surveys | ~110 | 96.0 KB | 16.0 KB | 48.0 KB | 0 | 6 | 0 |  |
| public.expansion_opportunities | ~10 | 96.0 KB | 8.0 KB | 80.0 KB | 0 | ~10 | 0 |  |
| public.feed_comments | ~90 | 96.0 KB | 16.0 KB | 48.0 KB | 0 | 7 | 0 |  |
| public.race_badges | 0 | 96.0 KB | 8.0 KB | 80.0 KB | 0 | 9 | ~30 |  |
| public.race_seasons | 3 | 96.0 KB | 8.0 KB | 80.0 KB | 2 | ~1k | 0 |  |
| public.territory_history | ~20 | 96.0 KB | 8.0 KB | 48.0 KB | ~50 | ~40 | 0 |  |
| public.win_loss_patterns | 4 | 96.0 KB | 8.0 KB | 80.0 KB | ~40 | 7 | 0 |  |
| public.daily_challenge_progress | ~60 | 88.0 KB | 8.0 KB | 80.0 KB | 0 | 9 | ~60 |  |
| public.integration_logs | 0 | 88.0 KB | 8.0 KB | 72.0 KB | 2 | ~10 | 0 |  |
| public.plan_rollback_ddl | ~80 | 88.0 KB | 40.0 KB | 16.0 KB | 0 | 3 | 0 |  |
| public.sales_goals | ~10 | 88.0 KB | 8.0 KB | 80.0 KB | 5 | ~10 | ~90 |  |
| public.cadence_outcome_rules | 0 | 80.0 KB | 8.0 KB | 64.0 KB | 4 | 8 | 0 |  |
| public.contact_engagement_score | 0 | 80.0 KB | 8.0 KB | 64.0 KB | 4 | 6 | 0 |  |
| public.contact_send_time_profile | 0 | 80.0 KB | 8.0 KB | 64.0 KB | 4 | 6 | 0 |  |
| public.daily_challenges | 0 | 80.0 KB | 8.0 KB | 64.0 KB | 0 | ~110 | 0 |  |
| public.forecast_snapshots | 6 | 80.0 KB | 8.0 KB | 64.0 KB | 0 | 6 | 0 |  |
| public.price_alerts | ~20 | 80.0 KB | 8.0 KB | 64.0 KB | 0 | 8 | 0 |  |
| public.prospect_cadences | 0 | 80.0 KB | 0 B | 72.0 KB | 0 | ~2.7k | 0 |  |
| public.revenue_forecasts | 3 | 80.0 KB | 8.0 KB | 64.0 KB | 0 | 7 | 0 |  |
| public.stage_conversion_metrics | 6 | 80.0 KB | 8.0 KB | 64.0 KB | 0 | 6 | 0 |  |
| public.call_recordings | 0 | 72.0 KB | 0 B | 64.0 KB | 0 | ~340 | 0 |  |
| public.email_bulk_drafts | 0 | 72.0 KB | 0 B | 64.0 KB | 0 | ~10 | 0 |  |
| public.qbr_schedule | ~20 | 72.0 KB | 8.0 KB | 64.0 KB | 0 | 8 | 0 |  |
| public.role_permissions | ~30 | 72.0 KB | 8.0 KB | 48.0 KB | ~10 | 6 | 0 |  |
| public.team_closers | 6 | 72.0 KB | 8.0 KB | 64.0 KB | 0 | 8 | 0 |  |
| public.v4_callback_dead_letters | 2 | 72.0 KB | 8.0 KB | 56.0 KB | 0 | ~3.2k | 0 |  |
| public.winloss_webhook_subscriptions | 1 | 72.0 KB | 8.0 KB | 24.0 KB | 5 | ~210 | 0 | 2026-11-20 |
| public.active_power_ups | 4 | 64.0 KB | 8.0 KB | 48.0 KB | 0 | 6 | 1 |  |
| public.automation_runs | ~40 | 64.0 KB | 8.0 KB | 48.0 KB | 0 | 6 | 0 |  |
| public.automation_workflows | 7 | 64.0 KB | 8.0 KB | 48.0 KB | 0 | 6 | 0 |  |
| public.conversation_analyses | 0 | 64.0 KB | 0 B | 56.0 KB | 0 | ~340 | 0 |  |
| public.data_subject_requests | 1 | 64.0 KB | 8.0 KB | 48.0 KB | 2 | 7 | 0 |  |
| public.email_tracking_events | 0 | 64.0 KB | 8.0 KB | 48.0 KB | 3 | ~340 | 0 |  |
| public.engagement_score_history | 0 | 64.0 KB | 8.0 KB | 48.0 KB | 4 | 5 | 0 |  |
| public.external_seller_map | 1 | 64.0 KB | 8.0 KB | 48.0 KB | 0 | 6 | 0 |  |
| public.icp_data | 0 | 64.0 KB | 0 B | 56.0 KB | 0 | ~20 | 0 |  |
| public.permissions | ~10 | 64.0 KB | 8.0 KB | 48.0 KB | ~30 | 5 | 0 |  |
| public.playbook_items | 0 | 64.0 KB | 8.0 KB | 48.0 KB | ~20 | 7 | 0 |  |
| public.product_usage_summary | ~100 | 64.0 KB | 16.0 KB | 16.0 KB | 0 | 4 | 0 |  |
| public.race_reactions | 1 | 64.0 KB | 8.0 KB | 48.0 KB | 0 | 5 | 0 |  |
| public.sales_battles | 3 | 64.0 KB | 8.0 KB | 48.0 KB | 2 | ~7.9k | 0 |  |
| public.saved_filters | 0 | 64.0 KB | 0 B | 56.0 KB | 0 | 9 | 1 |  |
| public.win_loss_insights | 0 | 64.0 KB | 8.0 KB | 48.0 KB | 4 | 5 | 0 |  |
| public.winloss_alert_settings | 0 | 64.0 KB | 8.0 KB | 48.0 KB | 1 | ~70 | 0 |  |
| public.activity_goals | 9 | 56.0 KB | 8.0 KB | 48.0 KB | ~20 | 8 | 1 |  |
| public.agenda_events | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~340 | 0 |  |
| public.cadence_tasks | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~530 | 0 |  |
| public.channel_interactions | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~340 | 0 |  |
| public.combo_tracking | 0 | 56.0 KB | 8.0 KB | 48.0 KB | 1 | 6 | 0 |  |
| public.daily_metrics | ~30 | 56.0 KB | 8.0 KB | 48.0 KB | 7 | 5 | ~20 |  |
| public.inventory_levels | ~20 | 56.0 KB | 8.0 KB | 48.0 KB | ~20 | 6 | 0 |  |
| public.query_telemetry | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~10 | 0 |  |
| public.security_events | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~10 | 0 |  |
| public.skill_assessments | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | 9 | 0 |  |
| public.task_assignments | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~10 | 0 |  |
| public.twilio_call_sessions | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~340 | 0 |  |
| public.user_roles | ~10 | 56.0 KB | 8.0 KB | 48.0 KB | 5 | ~208.1k | ~80 |  |
| public.webhook_inbound_log | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~10 | 0 |  |
| public.ai_narrative_cache | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 7 | 0 |  |
| public.auto_task_queue_settings | 1 | 48.0 KB | 8.0 KB | 32.0 KB | 0 | ~50 | 0 |  |
| public.blocked_ips | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 8 | 0 |  |
| public.cadence_steps | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 5 | 5 | 0 |  |
| public.cadences | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 1 | ~20 | 0 |  |
| public.call_logs | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~340 | 0 |  |
| public.call_metric_benchmarks | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 5 | 4 | 0 |  |
| public.call_recording_ingest_jobs | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~1.1k | 0 |  |
| public.category_metrics | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 8 | 4 | 0 |  |
| public.coaching_opportunities | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 8 | 0 |  |
| public.coaching_sessions | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 8 | 0 |  |
| public.deal_chat_history | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~340 | 0 |  |
| public.email_opt_outs | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 7 | 0 |  |
| public.entity_versions | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 8 | 0 |  |
| public.feature_flags | 1 | 48.0 KB | 8.0 KB | 32.0 KB | 0 | ~80 | 0 |  |
| public.follow_up_settings | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 1 | 5 | 0 |  |
| public.inbound_reply_events | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~10 | 0 |  |
| public.lead_assignments | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~340 | 0 |  |
| public.outbound_messages | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 9 | 0 |  |
| public.pipeline_stages | 7 | 48.0 KB | 8.0 KB | 32.0 KB | ~20 | 6 | 0 |  |
| public.portfolio_settings | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 3 | 6 | 0 |  |
| public.quota_attainment_forecasts | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 8 | 0 |  |
| public.race_cars | 8 | 48.0 KB | 8.0 KB | 32.0 KB | 0 | ~360 | ~1.3k |  |
| public.race_events | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~530 | 0 |  |
| public.rate_limit_settings | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 5 | 4 | 0 |  |
| public.reauthentication_requests | 1 | 48.0 KB | 8.0 KB | 32.0 KB | 1 | 4 | 1 |  |
| public.sales_territories | 8 | 48.0 KB | 8.0 KB | 32.0 KB | 8 | 5 | 0 |  |
| public.sequence_enrollments | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~450 | 0 |  |
| public.sequence_step_assignments | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~10 | 0 |  |
| public.skill_development_tracks | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 8 | 0 |  |
| public.sla_policies | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 5 | 4 | 0 |  |
| public.sla_violations | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~340 | 0 |  |
| public.stage_inactivity_rules | 6 | 48.0 KB | 8.0 KB | 32.0 KB | 0 | 4 | 0 |  |
| public.tournament_matches | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~10 | 0 |  |
| public.v4_callback_alert_settings | 1 | 48.0 KB | 8.0 KB | 32.0 KB | 0 | ~210 | 0 |  |
| public.weekly_challenges | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 5 | ~50 | 0 |  |
| public.win_probability_deal_calibrations | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~340 | 0 |  |
| public.winloss_webhook_alerts | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~40 | 0 |  |
| public.winloss_webhook_replay_audit | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 8 | 0 |  |
| public.workflow_rules | ~20 | 48.0 KB | 8.0 KB | 32.0 KB | 0 | 5 | 0 |  |
| public.account_contacts | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~340 | 0 |  |
| public.account_plans | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 8 | 0 |  |
| public.ai_agent_runs | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.approval_requests | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~340 | 0 |  |
| public.cadence_ab_assignments | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 8 | 0 |  |
| public.call_coaching_scorecards | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.call_critical_moments | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 8 | 0 |  |
| public.call_question_analysis | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.campaign_health_alerts | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.circuit_breaker_events | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.commission_bonus_awards | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 8 | 0 |  |
| public.commission_rules | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~3.9k | 0 |  |
| public.competitive_chat_messages | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 9 | 0 |  |
| public.consent_records | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 8 | 0 |  |
| public.deal_risk_signals | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~340 | 0 |  |
| public.deal_velocity_alerts | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~340 | 0 |  |
| public.dialer_queue_items | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~340 | 0 |  |
| public.email_engagement_scores | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~340 | 0 |  |
| public.email_logs | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.embedded_report_tokens | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.follow_up_notifications | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~530 | 0 |  |
| public.forecast_confidence_scores | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.geo_blocked_regions | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.integration_autotest_settings | 0 | 40.0 KB | 8.0 KB | 32.0 KB | 1 | 4 | 0 |  |
| public.integration_secret_refs | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.known_devices | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.lead_routing_log | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 9 | 0 |  |
| public.lead_score_explanations | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~340 | 0 |  |
| public.message_templates | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.objection_library | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.objections_library | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.pipeline_coverage_snapshots | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.playbook_progress | 0 | 40.0 KB | 0 B | 40.0 KB | 0 | ~1.3k | 0 |  |
| public.quota_attainment_alerts | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 8 | 0 |  |
| public.quote_sync_logs | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.race_daily_snapshots | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.race_overlay_telemetry | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.race_rivalries_persistent | 0 | 40.0 KB | 0 B | 40.0 KB | 0 | ~10 | 0 |  |
| public.race_team_members | 0 | 40.0 KB | 0 B | 40.0 KB | 0 | 9 | 0 |  |
| public.ranking_notifications | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 9 | 0 |  |
| public.report_embed_tokens | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.sale_notifications_audit | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~360 | 0 |  |
| public.sales_streaks | 9 | 40.0 KB | 8.0 KB | 32.0 KB | 2 | ~80 | 0 |  |
| public.salesperson_coaching_aggregates | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.salesperson_custom_field_values | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 8 | 0 |  |
| public.scheduled_reports | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~20 | 0 |  |
| public.scheduled_sends | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~400 | 0 |  |
| public.sequence_step_executions | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 9 | 0 |  |
| public.stage_bottleneck_insights | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.stage_velocity_baselines | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.user_2fa | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.v4_callback_metrics | 1 | 40.0 KB | 8.0 KB | 32.0 KB | 0 | 4 | 0 |  |
| public.webauthn_credentials | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.webhook_events | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.webhook_logs | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.whatsapp_conversations | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~340 | 0 |  |
| public.win_probability_calibrations | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.winloss_webhook_dead_letters | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~40 | 0 |  |
| public.winloss_webhook_replay_invocations | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.xp_adjustments | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public._internal_secrets | 3 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | ~19.8k | 0 |  |
| public.active_sessions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.activity_audit_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 9 | 0 |  |
| public.api_tokens | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.app_config | ~10 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | ~70 | 0 |  |
| public.approval_decisions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 1 |  |
| public.asset_usage_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.cadence_ab_tests | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 7 | 0 |  |
| public.cadence_alert_templates | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 2 | 3 | 0 |  |
| public.cadence_enrollment_rules | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~4.1k | 0 |  |
| public.call_conversation_metrics | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.call_objections | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.call_questions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.challenge_progress | 0 | 32.0 KB | 0 B | 32.0 KB | 0 | 8 | 0 |  |
| public.chat_messages | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.churn_alert_settings | 1 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | ~50 | 0 |  |
| public.client_interactions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 7 | 0 |  |
| public.coaching_actions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~40 | 0 |  |
| public.coaching_scorecard_config | 4 | 32.0 KB | 8.0 KB | 16.0 KB | 4 | 3 | 0 |  |
| public.collectible_badges | 0 | 32.0 KB | 8.0 KB | 16.0 KB | ~10 | 3 | 0 |  |
| public.commercial_approval_requests | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 7 | 0 |  |
| public.commission_bonuses | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.committee_extraction_runs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~340 | 0 |  |
| public.competitive_seasons | 1 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | 4 | 0 |  |
| public.competitor_mentions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 7 | 0 |  |
| public.competitors_pricing | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 7 | 0 |  |
| public.cs_tickets | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 7 | 0 |  |
| public.custom_reports | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.daily_streak_achievements | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.data_retention_policies | ~20 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | 5 | 0 |  |
| public.deal_committee_coverage | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~340 | 0 |  |
| public.deal_probability_scores | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~340 | 0 |  |
| public.demand_forecasts | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.digital_signatures | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.document_signers | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.duplicate_block_logs | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 4 | 9 | 0 |  |
| public.edge_retry_events | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.email_bulk_jobs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~100 | 0 |  |
| public.executive_briefings | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.follow_up_audit_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~360 | 0 |  |
| public.follow_up_territory_rules | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 7 | 0 |  |
| public.forecast_accuracy | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.forecast_deal_contributions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~340 | 0 |  |
| public.forecast_narrative_dead_letters | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.geo_access_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~10 | 0 |  |
| public.icp_parameters | 1 | 32.0 KB | 8.0 KB | 16.0 KB | 1 | 3 | 0 |  |
| public.integration_connections | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.ip_whitelist | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.kudos | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 7 | 0 |  |
| public.lead_detailed_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 7 | 0 |  |
| public.lead_routing_rules | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 3 | 3 | 0 |  |
| public.leagues | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 5 | 3 | 0 |  |
| public.migration_log | 5 | 32.0 KB | 8.0 KB | 16.0 KB | 1 | 3 | 0 |  |
| public.mql_qualifications | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~340 | 0 |  |
| public.password_reset_requests | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~170 | 0 |  |
| public.performance_bets | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~24.2k | 0 |  |
| public.personal_assistant_briefings | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~40 | 0 |  |
| public.personal_assistant_nudges | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.pipeline_coverage_recommendations | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.pipeline_inspection_snapshots | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~340 | 0 |  |
| public.pipeline_inspections | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~340 | 0 |  |
| public.pipelines | 1 | 32.0 KB | 8.0 KB | 16.0 KB | 4 | 4 | 0 |  |
| public.playbooks | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 4 | ~10 | 0 |  |
| public.prize_wheel_spins | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.product_usage_events | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.progressive_goals | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.qbr_reports | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.quota_attainment_actions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.quota_attainment_predictions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 9 | 0 |  |
| public.race_scoring_rules | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~1.7k | 0 |  |
| public.race_teams | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.race_unlocks | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.race_user_daily_checkins | 0 | 32.0 KB | 0 B | 32.0 KB | 0 | 7 | 1 |  |
| public.race_user_preferences | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.rank_change_notifications | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 8 | 0 |  |
| public.rate_limit_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~10 | 0 |  |
| public.report_executions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 7 | 0 |  |
| public.report_schedules | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.sales_enablement_assets | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.salesperson_badges | 0 | 32.0 KB | 0 B | 32.0 KB | 0 | 8 | 0 |  |
| public.score_change_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 7 | 0 |  |
| public.sequence_step_variants | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.sequence_steps | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.sequences | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.session_activity | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 8 | 0 |  |
| public.squads | 3 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | 3 | 0 |  |
| public.stage_probabilities | ~10 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | 9 | 6 |  |
| public.status_transitions | ~100 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | 3 | 0 |  |
| public.supplier_orders | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.team_custom_fields | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.tournament_participants | 0 | 32.0 KB | 0 B | 32.0 KB | 0 | 8 | 0 |  |
| public.user_2fa_backup_codes | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 1 |  |
| public.user_2fa_log | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 1 |  |
| public.user_mfa_settings | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 8 | 0 |  |
| public.webauthn_challenges | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.webhook_deliveries | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 8 | 0 |  |
| public.webhooks | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.website_visitor_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 8 | 0 |  |
| public.win_calibration_buckets | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.winloss_webhook_dispatch_metrics | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.workflow_executions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.workflows | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.ai_agent_actions | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.ai_sales_insights | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~340 | 0 |  |
| public.approval_workflows | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.buying_committee | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~340 | 0 |  |
| public.buying_committee_members | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~340 | 0 |  |
| public.buying_signals | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.cadence_advanced_stats | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.cadence_funnel_rules | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.call_insights | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.call_intelligence_triggers | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.call_objection_analysis | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.call_sentiment_timeline | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.call_transcripts | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.channel_credentials | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.chat_conversations | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.client_renewals | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.coaching_skill_benchmarks | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.cohort_analyses | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.committee_coverage_history | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~340 | 0 |  |
| public.competitors_registry | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.critical_moment_notifications | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.daily_challenge_rotations | 0 | 24.0 KB | 8.0 KB | 16.0 KB | 0 | 3 | 1 |  |
| public.dashboard_layouts | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.dead_letter_replay_audit | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.edge_call_failures | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.email_engagement_score_history | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~340 | 0 |  |
| public.enriched_company_intelligence | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.experiment_assignments | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | 7 | 1 |  |
| public.experiment_variants | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.follow_up_templates | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.geocode_cache | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.integration_autotest_jobs | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.integration_health_checks | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.intent_audit_logs | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.lead_churn_risk | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~340 | 0 |  |
| public.lead_source_configs | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.league_history | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | 7 | 0 |  |
| public.league_members | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | 7 | 0 |  |
| public.login_alerts | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~160 | 0 |  |
| public.mfa_verification_attempts | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 9 | 0 |  |
| public.mood_entries | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.notification_preferences | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.onboarding_steps | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.password_history | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 1 |  |
| public.person_intelligence | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.price_protection_rules | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.pricing_rules | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.product_stock_log | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.product_usage | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.push_subscriptions | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 1 |  |
| public.salesperson_commission_configs | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.salesperson_leagues | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.salesperson_preferences | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.scheduled_report_runs | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.sdr_alert_configs | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 1 |  |
| public.sdr_alert_history | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.sdr_performance_settings | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.security_alert_history | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.security_alert_settings | 0 | 24.0 KB | 8.0 KB | 16.0 KB | 1 | 3 | 0 |  |
| public.send_time_profiles | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~340 | 0 |  |
| public.sms_verification_codes | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 1 |  |
| public.squad_members | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.supplier_order_items | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | 7 | 0 |  |
| public.supplier_risk_assessments | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.tournaments | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.user_app_settings | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 1 |  |
| public.v4_callback_alerts | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.webhook_allowed_domains | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.win_loss_insight_comments | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.xp_history | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.available_spins | 0 | 16.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.dialer_queues | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 5 | 0 |  |
| public.edge_job_locks | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 3 | 0 |  |
| public.expansion_playbooks | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 3 | 0 |  |
| public.experiments | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 3 | 0 |  |
| public.lead_intelligence_metrics | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 3 | 0 |  |
| public.performance_impact_factors | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 3 | 0 |  |
| public.salesperson_performance_telemetry | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 3 | 0 |  |
| public.salesperson_xp | 0 | 16.0 KB | 0 B | 16.0 KB | 0 | 6 | 0 |  |
| public.task_catalog | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 3 | 0 |  |
| public.user_winloss_preferences | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 3 | 0 |  |
| public.webhook_dispatch_rate | 0 | 16.0 KB | 0 B | 16.0 KB | 0 | ~40 | 0 |  |
| public.whatsapp_template_versions | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 3 | 0 |  |
| public.ab_tests | 0 | 8.0 KB | 0 B | 8.0 KB | 0 | 3 | 0 |  |
| public.lead_score_trends | 0 | 8.0 KB | 0 B | 8.0 KB | 0 | 4 | 0 |  |


## Índices nunca usados (candidatos a remoção; ignore PK/UNIQUE)

| índice | tabela | tamanho |
|---|---|---|
| idx_activities_active | public.activities | 136.0 KB |
| idx_activities_client_date | public.activities | 120.0 KB |
| idx_audit_logs_action | public.audit_logs | 560.0 KB |
| idx_audit_logs_actor_id | public.audit_logs | 536.0 KB |
| idx_audit_logs_changed_by_changed | public.audit_logs | 2.0 MB |
| idx_audit_logs_record_id | public.audit_logs | 2.0 MB |
| idx_audit_logs_table_changed | public.audit_logs | 2.6 MB |
| idx_audit_logs_table_name | public.audit_logs | 2.6 MB |
| idx_clients_email_trgm | public.clients | 152.0 KB |
| idx_clients_name_trgm | public.clients | 96.0 KB |
| idx_cron_failure_alerts_jobname_alerted | public.cron_failure_alerts | 208.0 KB |
| idx_deal_stage_history_sale | public.deal_stage_history | 128.0 KB |
| idx_login_attempts_email_created | public.login_attempts | 88.0 KB |
| idx_maintenance_log_job_started | public.maintenance_log | 272.0 KB |
| idx_maintenance_log_started_at | public.maintenance_log | 136.0 KB |
| idx_notifications_category | public.notifications | 640.0 KB |
| idx_notifications_user_created | public.notifications | 528.0 KB |
| idx_notifications_user_unread | public.notifications | 640.0 KB |
| idx_qs_inbound_log_source_status_time | public.quote_sync_inbound_log | 112.0 KB |
| idx_sales_account_id | public.sales | 72.0 KB |
| idx_sales_client_name_trgm | public.sales | 288.0 KB |
| idx_sales_product_name_trgm | public.sales | 280.0 KB |
| idx_sales_status_created_at | public.sales | 80.0 KB |
| idx_semantic_index_embedding | public.semantic_index | 1.2 MB |
| idx_web_vitals_route_metric_created | public.web_vitals_samples | 2.5 MB |
| idx_web_vitals_user_created | public.web_vitals_samples | 1.6 MB |


## Storage

_nenhum_


## Auth (agregados)

| métrica | valor |
|---|---|
| usuários (~) | 7 |
| confirmados (~) | 6 |
| criados últimos 30d (~) | 0 |

| provider | usuários (~) |
|---|---|
| email | 6 |


## Consultas mais custosas (pg_stat_statements, desde o último reset)
| role | chamadas (~) | total ms (~) | média ms | query |
|---|---|---|---|---|
| postgres | ~190 | ~1.1M | 5720.09 | `SELECT public.detect_stalled_cron_jobs()` |
| service_role | ~280 | ~428.3k | 1507.98 | `WITH pgrst_source AS (SELECT "pgrst_call".* FROM (SELECT $1 AS json_data) pgrst_payload, LATERAL (SELECT "_since_minutes" FROM json_to_record(pgrst_payload.json_data) AS _("_since_minutes" integer) LIMIT $4) pgrst_body ,` |
| authenticated | ~530 | ~280.2k | 529.60 | `WITH pgrst_source AS (SELECT pgrst_call.pgrst_scalar FROM (SELECT $1 AS json_data) pgrst_payload, LATERAL (SELECT "_quote_id" FROM json_to_record(pgrst_payload.json_data) AS _("_quote_id" uuid) LIMIT $4) pgrst_body , LAT` |
| postgres | ~50 | ~194.6k | 3971.70 | `SELECT jobid, runid, status, start_time, end_time, EXTRACT($2 FROM (end_time - start_time))::numeric(10,2) AS seconds, left(return_message, $3) AS return_message FROM (SELECT *, row_number() OVER (PARTITION BY jobid ORDE` |
| postgres | ~7.5k | ~192.7k | 25.71 | `SELECT public.trigger_internal_edge_job($1)` |
| authenticated | ~160 | ~75.3k | 456.32 | `WITH pgrst_source AS (DELETE FROM "public"."sales" WHERE "public"."sales"."id" = ANY ($1) RETURNING $2) SELECT $3 AS total_result_set, pg_catalog.count(_postgrest_t) AS page_total, array[]::text[] AS header, $4::text AS ` |
| authenticated | ~90 | ~73k | 802.28 | `WITH pgrst_source AS ( SELECT "public"."quotes".*, row_to_json("quotes_salespeople_1".*)::jsonb AS "salespeople", row_to_json("quotes_sales_1".*)::jsonb AS "sales" FROM "public"."quotes" LEFT JOIN LATERAL ( SELECT "sales` |
| authenticated | ~90 | ~60k | 659.38 | `WITH pgrst_source AS ( SELECT "public"."quotes"."status", "public"."quotes"."total_value", "public"."quotes"."valid_until" FROM "public"."quotes" WHERE "public"."quotes"."deleted_at" IS NULL LIMIT $1 OFFSET $2 ) SELECT $` |
| authenticated | ~80 | ~52.8k | 676.65 | `WITH pgrst_source AS ( SELECT "public"."notifications"."id" FROM "public"."notifications" WHERE "public"."notifications"."user_id" = $1 AND "public"."notifications"."read_at" IS NULL AND "public"."notifications"."archive` |
| postgres | ~50 | ~30.2k | 616.31 | `SELECT n.nspname AS schema, c.relname AS "table", a.attnum AS position, a.attname AS name, format_type(a.atttypid, a.atttypmod) AS type, NOT a.attnotnull AS nullable, pg_get_expr(d.adbin, d.adrelid) AS "default", NULLIF(` |
| authenticated | ~220 | ~26.1k | 121.41 | `WITH pgrst_source AS (INSERT INTO "public"."quotes"("client_name", "source", "status", "subtotal", "title", "total_value") SELECT "pgrst_body"."client_name", "pgrst_body"."source", "pgrst_body"."status", "pgrst_body"."su` |
| authenticated | ~70 | ~25.6k | 376.30 | `WITH pgrst_source AS ( SELECT "public"."sales"."client_name", "public"."sales"."created_at", "public"."sales"."status" FROM "public"."sales" WHERE "public"."sales"."status" = ANY ($1) ORDER BY "public"."sales"."created_a` |
| authenticated | ~70 | ~24.7k | 333.94 | `WITH pgrst_source AS ( SELECT "public"."sales".* FROM "public"."sales" WHERE "public"."sales"."status" = ANY ($1) LIMIT $2 OFFSET $3 ) SELECT $4::bigint AS total_result_set, pg_catalog.count(_postgrest_t) AS page_total, ` |
| postgres | ~570 | ~23.3k | 40.70 | `SELECT public.admin_capture_rollback_snapshot()` |
| service_role | ~440 | ~21.9k | 49.95 | `WITH pgrst_source AS (SELECT "pgrst_call".* FROM (SELECT $1 AS json_data) pgrst_payload, LATERAL (SELECT "p_today", "p_limit" FROM json_to_record(pgrst_payload.json_data) AS _("p_today" date, "p_limit" integer) LIMIT $4)` |


## Conexões
| usuário | estado | n |
|---|---|---|
| authenticator | idle | 11 |
| pgbouncer | idle | 2 |
| postgres | active | 1 |
| postgres | idle | 1 |
| supabase_admin | idle | 2 |
| supabase_admin |  | 1 |
