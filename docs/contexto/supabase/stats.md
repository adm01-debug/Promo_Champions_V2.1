# Métricas (voláteis — mudam sem alteração de schema)

Valores aproximados de propósito, para não gerar commits a cada coleta. Fora de `snapshot.json`; o bruto está em `stats.json`.

## Banco

| métrica | valor |
|---|---|
| tamanho | 251.8 MB |
| schema public | 156.2 MB |


## Tabelas (ordenadas por tamanho)

| tabela | linhas (~) | total | heap | índices | linhas mortas (~) | seq scans (~) | idx scans (~) | último autovacuum |
|---|---|---|---|---|---|---|---|---|
| public.audit_logs | ~33.7k | 96.0 MB | 65.2 MB | 16.0 MB | ~6k | ~10 | 6 |  |
| public.web_vitals_samples | ~15.8k | 15.1 MB | 8.4 MB | 6.7 MB | 2 | 5 | ~10 |  |
| public.notifications | ~7.2k | 5.0 MB | 2.8 MB | 2.1 MB | 0 | 6 | ~10 |  |
| public.sales | ~960 | 2.3 MB | 424.0 KB | 1.8 MB | 0 | ~4.5k | ~108k | 2026-11-20 |
| public.db_rollback_snapshots | ~8.7k | 1.7 MB | 864.0 KB | 880.0 KB | ~290 | 3 | 1 |  |
| public.activities | ~2.2k | 1.6 MB | 384.0 KB | 1.2 MB | 1 | ~20 | ~10 |  |
| public.error_logs | 3 | 1.6 MB | 1.2 MB | 192.0 KB | ~60 | 6 | ~20 |  |
| public.maintenance_log | ~3.1k | 1.4 MB | 784.0 KB | 568.0 KB | 0 | 5 | 0 |  |
| public.semantic_index | 0 | 1.2 MB | 0 B | 1.2 MB | 0 | 7 | 0 |  |
| public.tasks | ~1.6k | 920.0 KB | 376.0 KB | 504.0 KB | 1 | ~20 | ~10 |  |
| public.quotes | ~490 | 784.0 KB | 304.0 KB | 440.0 KB | 0 | ~20 | ~5.5k | 2026-11-20 |
| public.cron_failure_alerts | ~1.6k | 752.0 KB | 240.0 KB | 472.0 KB | ~90 | ~20 | ~2.3k | 2026-11-20 |
| public.lead_score_history | ~1.2k | 728.0 KB | 544.0 KB | 144.0 KB | 0 | 4 | 0 |  |
| public.territories | ~40 | 728.0 KB | 456.0 KB | 232.0 KB | 0 | 5 | ~96.8k | 2026-11-20 |
| public.clients | ~100 | 720.0 KB | 40.0 KB | 640.0 KB | ~20 | ~30 | ~60 |  |
| public.lead_scores | ~900 | 640.0 KB | 448.0 KB | 160.0 KB | ~50 | 5 | 0 |  |
| public.login_attempts | ~740 | 640.0 KB | 264.0 KB | 336.0 KB | ~80 | 6 | ~800 | 2026-11-20 |
| public.deal_health_scores | ~900 | 632.0 KB | 400.0 KB | 200.0 KB | 0 | 6 | 0 |  |
| public.orders | ~340 | 608.0 KB | 264.0 KB | 304.0 KB | 0 | ~10 | ~5.5k | 2026-11-20 |
| public.commissions | ~940 | 600.0 KB | 200.0 KB | 360.0 KB | ~200 | ~10 | 0 | 2026-11-20 |
| public.deal_stage_transitions | ~1.3k | 592.0 KB | 208.0 KB | 344.0 KB | ~200 | 6 | 0 | 2026-11-20 |
| public.audit_log | ~340 | 584.0 KB | 304.0 KB | 248.0 KB | 4 | ~10 | 4 |  |
| public.quote_sync_inbound_log | ~770 | 584.0 KB | 136.0 KB | 272.0 KB | ~40 | 7 | 2 |  |
| public.win_loss_analyses | ~500 | 544.0 KB | 208.0 KB | 296.0 KB | 0 | 9 | 0 |  |
| public.deal_stage_history | ~1.3k | 488.0 KB | 136.0 KB | 312.0 KB | ~200 | 6 | ~1.1k | 2026-11-20 |
| public.page_analytics | ~180 | 440.0 KB | 208.0 KB | 192.0 KB | ~60 | ~10 | 0 |  |
| public.deal_velocity_predictions | ~900 | 408.0 KB | 240.0 KB | 136.0 KB | 0 | 6 | 0 |  |
| public.quote_items | ~1.1k | 408.0 KB | 168.0 KB | 200.0 KB | ~200 | 6 | ~3.9k | 2026-11-20 |
| public.quotes_inbound | ~150 | 352.0 KB | 48.0 KB | 136.0 KB | ~20 | ~10 | 0 |  |
| public.deal_stakeholders | ~600 | 336.0 KB | 136.0 KB | 168.0 KB | 0 | 6 | ~90 |  |
| public.webhook_inbound_dedupe | 0 | 312.0 KB | 72.0 KB | 72.0 KB | ~190 | 7 | ~10 |  |
| public.order_items | ~620 | 288.0 KB | 128.0 KB | 120.0 KB | 0 | 4 | ~1.1k | 2026-11-20 |
| public.order_status_events | ~350 | 280.0 KB | 96.0 KB | 144.0 KB | 0 | 4 | 0 | 2026-11-20 |
| public.deal_outcomes | ~500 | 256.0 KB | 88.0 KB | 136.0 KB | 0 | 7 | 6 |  |
| public.bitrix24_sync_logs | ~720 | 240.0 KB | 104.0 KB | 104.0 KB | 0 | 3 | 2 |  |
| public.deal_health_history | ~900 | 240.0 KB | 96.0 KB | 112.0 KB | 0 | 4 | 0 |  |
| public.quote_conversion_audit | ~280 | 208.0 KB | 72.0 KB | 104.0 KB | 0 | 6 | 0 |  |
| public.account_activities | ~360 | 200.0 KB | 56.0 KB | 112.0 KB | 0 | 8 | 0 |  |
| public.products | ~20 | 200.0 KB | 8.0 KB | 184.0 KB | 4 | ~30 | 0 |  |
| public.accounts | ~120 | 184.0 KB | 24.0 KB | 120.0 KB | 0 | 8 | ~3.3k | 2026-11-20 |
| public.client_portfolio | ~100 | 168.0 KB | 16.0 KB | 120.0 KB | 1 | ~10 | 7 |  |
| public.stock_movements | ~480 | 168.0 KB | 48.0 KB | 88.0 KB | 1 | 5 | 0 |  |
| public.price_history | ~200 | 144.0 KB | 32.0 KB | 80.0 KB | 0 | 9 | 0 |  |
| public.salespeople | ~20 | 144.0 KB | 8.0 KB | 128.0 KB | ~40 | ~71.6k | ~70 |  |
| public.suppliers | 6 | 136.0 KB | 8.0 KB | 120.0 KB | 8 | ~10 | 0 |  |
| public.renewals | ~100 | 128.0 KB | 16.0 KB | 80.0 KB | 0 | 8 | 0 |  |
| public.battle_participants | 1 | 120.0 KB | 16.0 KB | 64.0 KB | 0 | 7 | 0 |  |
| public.monthly_sales_summary | ~30 | 120.0 KB | 64.0 KB | 16.0 KB | 0 | 2 | ~2.2k | 2026-11-20 |
| public.nps_surveys | ~250 | 120.0 KB | 40.0 KB | 48.0 KB | 0 | 6 | 0 |  |
| public.client_churn_alerts_state | 3 | 112.0 KB | 8.0 KB | 64.0 KB | ~50 | ~40 | 4 |  |
| public.data_access_log | ~120 | 112.0 KB | 16.0 KB | 64.0 KB | 1 | 6 | 4 |  |
| public.feed_reactions | ~150 | 112.0 KB | 16.0 KB | 64.0 KB | 0 | 7 | 0 |  |
| public.onboarding_journeys | ~100 | 112.0 KB | 16.0 KB | 64.0 KB | 0 | 7 | 0 |  |
| public.slow_query_alerts | 9 | 112.0 KB | 8.0 KB | 64.0 KB | ~20 | ~10 | 4 |  |
| public.supplier_products | ~40 | 112.0 KB | 16.0 KB | 64.0 KB | ~40 | 7 | 0 |  |
| public.support_tickets | ~150 | 112.0 KB | 24.0 KB | 56.0 KB | 0 | 6 | 0 |  |
| public.teams | 3 | 112.0 KB | 8.0 KB | 96.0 KB | 0 | ~10 | 0 |  |
| public.weekly_matchups | ~60 | 112.0 KB | 16.0 KB | 64.0 KB | ~30 | 8 | 0 |  |
| public.victory_feed | ~80 | 104.0 KB | 24.0 KB | 48.0 KB | 8 | 5 | 0 |  |
| public.winloss_webhook_deliveries | 1 | 104.0 KB | 8.0 KB | 56.0 KB | ~20 | ~30 | 0 | 2026-11-19 |
| public.access_denied_logs | ~10 | 96.0 KB | 16.0 KB | 48.0 KB | ~40 | 5 | ~10 |  |
| public.achievements | 4 | 96.0 KB | 8.0 KB | 80.0 KB | ~30 | 9 | 0 |  |
| public.csat_ces_surveys | ~110 | 96.0 KB | 16.0 KB | 48.0 KB | 0 | 5 | 0 |  |
| public.expansion_opportunities | ~10 | 96.0 KB | 8.0 KB | 80.0 KB | 0 | 9 | 0 |  |
| public.feed_comments | ~90 | 96.0 KB | 16.0 KB | 48.0 KB | 0 | 6 | 0 |  |
| public.race_seasons | 3 | 96.0 KB | 8.0 KB | 80.0 KB | 2 | 7 | 0 |  |
| public.territory_history | ~20 | 96.0 KB | 8.0 KB | 48.0 KB | ~30 | ~20 | 0 |  |
| public.win_loss_patterns | 4 | 96.0 KB | 8.0 KB | 80.0 KB | ~40 | 6 | 0 |  |
| public.integration_logs | 0 | 88.0 KB | 8.0 KB | 72.0 KB | 2 | 8 | 0 |  |
| public.plan_rollback_ddl | ~80 | 88.0 KB | 40.0 KB | 16.0 KB | 0 | 2 | 0 |  |
| public.sales_goals | ~10 | 88.0 KB | 8.0 KB | 80.0 KB | 5 | 9 | ~10 |  |
| public.cadence_outcome_rules | 0 | 80.0 KB | 8.0 KB | 64.0 KB | 4 | 7 | 0 |  |
| public.contact_engagement_score | 0 | 80.0 KB | 8.0 KB | 64.0 KB | 4 | 5 | 0 |  |
| public.contact_send_time_profile | 0 | 80.0 KB | 8.0 KB | 64.0 KB | 4 | 5 | 0 |  |
| public.forecast_snapshots | 6 | 80.0 KB | 8.0 KB | 64.0 KB | 0 | 5 | 0 |  |
| public.price_alerts | ~20 | 80.0 KB | 8.0 KB | 64.0 KB | 0 | 7 | 0 |  |
| public.prospect_cadences | 0 | 80.0 KB | 0 B | 72.0 KB | 0 | ~580 | 0 |  |
| public.revenue_forecasts | 3 | 80.0 KB | 8.0 KB | 64.0 KB | 0 | 6 | 0 |  |
| public.stage_conversion_metrics | 6 | 80.0 KB | 8.0 KB | 64.0 KB | 0 | 5 | 0 |  |
| public.call_recordings | 0 | 72.0 KB | 0 B | 64.0 KB | 0 | ~10 | 0 |  |
| public.email_bulk_drafts | 0 | 72.0 KB | 0 B | 64.0 KB | 0 | ~10 | 0 |  |
| public.qbr_schedule | ~20 | 72.0 KB | 8.0 KB | 64.0 KB | 0 | 7 | 0 |  |
| public.role_permissions | ~30 | 72.0 KB | 8.0 KB | 48.0 KB | ~10 | 5 | 0 |  |
| public.team_closers | 6 | 72.0 KB | 8.0 KB | 64.0 KB | 0 | 7 | 0 |  |
| public.v4_callback_dead_letters | 2 | 72.0 KB | 8.0 KB | 56.0 KB | 0 | ~690 | 0 |  |
| public.winloss_webhook_subscriptions | 1 | 72.0 KB | 8.0 KB | 24.0 KB | ~30 | ~50 | 0 |  |
| public.active_power_ups | 4 | 64.0 KB | 8.0 KB | 48.0 KB | 0 | 5 | 1 |  |
| public.automation_runs | ~40 | 64.0 KB | 8.0 KB | 48.0 KB | 0 | 5 | 0 |  |
| public.automation_workflows | 7 | 64.0 KB | 8.0 KB | 48.0 KB | 0 | 5 | 0 |  |
| public.conversation_analyses | 0 | 64.0 KB | 0 B | 56.0 KB | 0 | 9 | 0 |  |
| public.data_subject_requests | 1 | 64.0 KB | 8.0 KB | 48.0 KB | 2 | 6 | 0 |  |
| public.email_tracking_events | 0 | 64.0 KB | 8.0 KB | 48.0 KB | 3 | 9 | 0 |  |
| public.engagement_score_history | 0 | 64.0 KB | 8.0 KB | 48.0 KB | 4 | 4 | 0 |  |
| public.external_seller_map | 1 | 64.0 KB | 8.0 KB | 48.0 KB | 0 | 5 | 0 |  |
| public.icp_data | 0 | 64.0 KB | 0 B | 56.0 KB | 0 | ~10 | 0 |  |
| public.permissions | ~10 | 64.0 KB | 8.0 KB | 48.0 KB | ~30 | 4 | 0 |  |
| public.playbook_items | 0 | 64.0 KB | 8.0 KB | 48.0 KB | ~20 | 6 | 0 |  |
| public.product_usage_summary | ~100 | 64.0 KB | 16.0 KB | 16.0 KB | 0 | 3 | 0 |  |
| public.race_reactions | 1 | 64.0 KB | 8.0 KB | 48.0 KB | 0 | 4 | 0 |  |
| public.sales_battles | 3 | 64.0 KB | 8.0 KB | 48.0 KB | 2 | ~2.2k | 0 |  |
| public.saved_filters | 0 | 64.0 KB | 0 B | 56.0 KB | 0 | 8 | 1 |  |
| public.win_loss_insights | 0 | 64.0 KB | 8.0 KB | 48.0 KB | 4 | 4 | 0 |  |
| public.winloss_alert_settings | 0 | 64.0 KB | 8.0 KB | 48.0 KB | 1 | 5 | 0 |  |
| public.activity_goals | 9 | 56.0 KB | 8.0 KB | 48.0 KB | ~20 | 6 | 1 |  |
| public.agenda_events | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~10 | 0 |  |
| public.cadence_tasks | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~230 | 0 |  |
| public.channel_interactions | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~10 | 0 |  |
| public.combo_tracking | 0 | 56.0 KB | 8.0 KB | 48.0 KB | 1 | 5 | 0 |  |
| public.daily_metrics | ~30 | 56.0 KB | 8.0 KB | 48.0 KB | 7 | 4 | ~20 |  |
| public.inventory_levels | ~20 | 56.0 KB | 8.0 KB | 48.0 KB | ~20 | 5 | 0 |  |
| public.query_telemetry | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | ~10 | 0 |  |
| public.security_events | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | 9 | 0 |  |
| public.skill_assessments | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | 8 | 0 |  |
| public.task_assignments | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | 9 | 0 |  |
| public.twilio_call_sessions | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | 9 | 0 |  |
| public.user_roles | ~10 | 56.0 KB | 8.0 KB | 48.0 KB | 5 | ~18.5k | 3 |  |
| public.webhook_inbound_log | 0 | 56.0 KB | 0 B | 48.0 KB | 0 | 8 | 0 |  |
| public.ai_narrative_cache | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 6 | 0 |  |
| public.auto_task_queue_settings | 1 | 48.0 KB | 8.0 KB | 32.0 KB | 0 | ~30 | 0 |  |
| public.blocked_ips | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 7 | 0 |  |
| public.cadence_steps | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 5 | 4 | 0 |  |
| public.cadences | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 1 | 3 | 0 |  |
| public.call_logs | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 8 | 0 |  |
| public.call_metric_benchmarks | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 5 | 3 | 0 |  |
| public.call_recording_ingest_jobs | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~20 | 0 |  |
| public.category_metrics | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 8 | 3 | 0 |  |
| public.coaching_opportunities | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 7 | 0 |  |
| public.coaching_sessions | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 7 | 0 |  |
| public.deal_chat_history | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 8 | 0 |  |
| public.email_opt_outs | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 6 | 0 |  |
| public.entity_versions | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 7 | 0 |  |
| public.feature_flags | 1 | 48.0 KB | 8.0 KB | 32.0 KB | 0 | 5 | 0 |  |
| public.follow_up_settings | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 1 | 4 | 0 |  |
| public.inbound_reply_events | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 8 | 0 |  |
| public.lead_assignments | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 9 | 0 |  |
| public.outbound_messages | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 8 | 0 |  |
| public.pipeline_stages | 7 | 48.0 KB | 8.0 KB | 32.0 KB | ~20 | 5 | 0 |  |
| public.portfolio_settings | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 3 | 4 | 0 |  |
| public.quota_attainment_forecasts | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 7 | 0 |  |
| public.race_badges | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 8 | 0 |  |
| public.race_cars | 8 | 48.0 KB | 8.0 KB | 32.0 KB | 0 | 4 | 0 |  |
| public.race_events | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 8 | 0 |  |
| public.rate_limit_settings | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 5 | 3 | 0 |  |
| public.reauthentication_requests | 1 | 48.0 KB | 8.0 KB | 32.0 KB | 1 | 3 | 1 |  |
| public.sales_territories | 8 | 48.0 KB | 8.0 KB | 32.0 KB | 8 | 4 | 0 |  |
| public.sequence_enrollments | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~220 | 0 |  |
| public.sequence_step_assignments | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 9 | 0 |  |
| public.skill_development_tracks | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 7 | 0 |  |
| public.sla_policies | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 5 | 3 | 0 |  |
| public.sla_violations | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 8 | 0 |  |
| public.stage_inactivity_rules | 6 | 48.0 KB | 8.0 KB | 32.0 KB | 0 | 3 | 0 |  |
| public.tournament_matches | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~10 | 0 |  |
| public.v4_callback_alert_settings | 1 | 48.0 KB | 8.0 KB | 32.0 KB | 0 | 3 | 0 |  |
| public.weekly_challenges | 0 | 48.0 KB | 8.0 KB | 32.0 KB | 5 | ~20 | 0 |  |
| public.win_probability_deal_calibrations | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 7 | 0 |  |
| public.winloss_webhook_alerts | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | ~20 | 0 |  |
| public.winloss_webhook_replay_audit | 0 | 48.0 KB | 0 B | 40.0 KB | 0 | 7 | 0 |  |
| public.workflow_rules | ~20 | 48.0 KB | 8.0 KB | 32.0 KB | 0 | 4 | 0 |  |
| public.account_contacts | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.account_plans | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.ai_agent_runs | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 5 | 0 |  |
| public.approval_requests | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 8 | 0 |  |
| public.cadence_ab_assignments | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.call_coaching_scorecards | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.call_critical_moments | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.call_question_analysis | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.campaign_health_alerts | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.circuit_breaker_events | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 5 | 0 |  |
| public.commission_bonus_awards | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.commission_rules | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~1.1k | 0 |  |
| public.competitive_chat_messages | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 8 | 0 |  |
| public.consent_records | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.daily_challenge_progress | 0 | 40.0 KB | 0 B | 40.0 KB | 0 | 8 | 0 |  |
| public.daily_challenges | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~30 | 0 |  |
| public.deal_risk_signals | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.deal_velocity_alerts | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.dialer_queue_items | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.email_engagement_scores | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.email_logs | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 5 | 0 |  |
| public.embedded_report_tokens | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.follow_up_notifications | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 8 | 0 |  |
| public.forecast_confidence_scores | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 5 | 0 |  |
| public.geo_blocked_regions | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.integration_autotest_settings | 0 | 40.0 KB | 8.0 KB | 32.0 KB | 1 | 3 | 0 |  |
| public.integration_secret_refs | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.known_devices | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.lead_routing_log | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 8 | 0 |  |
| public.lead_score_explanations | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.message_templates | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.objection_library | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.objections_library | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 5 | 0 |  |
| public.pipeline_coverage_snapshots | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 5 | 0 |  |
| public.playbook_progress | 0 | 40.0 KB | 0 B | 40.0 KB | 0 | ~970 | 0 |  |
| public.quota_attainment_alerts | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.quote_sync_logs | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 5 | 0 |  |
| public.race_daily_snapshots | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.race_overlay_telemetry | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 5 | 0 |  |
| public.race_powerups | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.race_rivalries_persistent | 0 | 40.0 KB | 0 B | 40.0 KB | 0 | 9 | 0 |  |
| public.race_team_members | 0 | 40.0 KB | 0 B | 40.0 KB | 0 | 8 | 0 |  |
| public.ranking_notifications | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 8 | 0 |  |
| public.report_embed_tokens | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.sale_notifications_audit | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 8 | 0 |  |
| public.sales_streaks | 9 | 40.0 KB | 8.0 KB | 32.0 KB | 2 | 9 | 0 |  |
| public.salesperson_coaching_aggregates | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 5 | 0 |  |
| public.salesperson_custom_field_values | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.scheduled_reports | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.scheduled_sends | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.sequence_step_executions | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 8 | 0 |  |
| public.stage_bottleneck_insights | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 5 | 0 |  |
| public.stage_velocity_baselines | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 5 | 0 |  |
| public.user_2fa | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.v4_callback_metrics | 1 | 40.0 KB | 8.0 KB | 32.0 KB | 0 | 3 | 0 |  |
| public.webauthn_credentials | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.webhook_events | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.webhook_logs | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public.whatsapp_conversations | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.win_probability_calibrations | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 5 | 0 |  |
| public.winloss_webhook_dead_letters | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | ~20 | 0 |  |
| public.winloss_webhook_replay_invocations | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 5 | 0 |  |
| public.xp_adjustments | 0 | 40.0 KB | 0 B | 32.0 KB | 0 | 6 | 0 |  |
| public._internal_secrets | 3 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | ~8.2k | 0 |  |
| public.active_sessions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.activity_audit_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 7 | 0 |  |
| public.api_tokens | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.app_config | ~10 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | 2 | 0 |  |
| public.approval_decisions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 1 |  |
| public.asset_usage_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.cadence_ab_tests | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.cadence_alert_templates | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 2 | 2 | 0 |  |
| public.cadence_enrollment_rules | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~1.1k | 0 |  |
| public.call_conversation_metrics | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.call_objections | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.call_questions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.challenge_progress | 0 | 32.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.chat_messages | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.churn_alert_settings | 1 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | ~30 | 0 |  |
| public.client_interactions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.coaching_actions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~10 | 0 |  |
| public.coaching_scorecard_config | 4 | 32.0 KB | 8.0 KB | 16.0 KB | 4 | 2 | 0 |  |
| public.collectible_badges | 0 | 32.0 KB | 8.0 KB | 16.0 KB | ~10 | 2 | 0 |  |
| public.commercial_approval_requests | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.commission_bonuses | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.committee_extraction_runs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.competitive_seasons | 1 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | 3 | 0 |  |
| public.competitor_mentions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.competitors_pricing | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.cs_tickets | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.custom_reports | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 4 | 0 |  |
| public.daily_streak_achievements | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.data_retention_policies | ~20 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | 3 | 0 |  |
| public.deal_committee_coverage | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.deal_probability_scores | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.demand_forecasts | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.digital_signatures | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.document_signers | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.duplicate_block_logs | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 4 | 5 | 0 |  |
| public.edge_retry_events | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 4 | 0 |  |
| public.email_bulk_jobs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~60 | 0 |  |
| public.executive_briefings | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 4 | 0 |  |
| public.follow_up_audit_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.follow_up_territory_rules | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.forecast_accuracy | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.forecast_deal_contributions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.forecast_narrative_dead_letters | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 4 | 0 |  |
| public.geo_access_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 7 | 0 |  |
| public.icp_parameters | 1 | 32.0 KB | 8.0 KB | 16.0 KB | 1 | 2 | 0 |  |
| public.integration_connections | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 4 | 0 |  |
| public.ip_whitelist | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.kudos | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.lead_detailed_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.lead_routing_rules | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 3 | 2 | 0 |  |
| public.leagues | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 5 | 2 | 0 |  |
| public.migration_log | 5 | 32.0 KB | 8.0 KB | 16.0 KB | 1 | 2 | 0 |  |
| public.mql_qualifications | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.password_reset_requests | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~20 | 0 |  |
| public.performance_bets | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | ~6.6k | 0 |  |
| public.personal_assistant_briefings | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 9 | 0 |  |
| public.personal_assistant_nudges | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.pipeline_coverage_recommendations | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.pipeline_inspection_snapshots | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.pipeline_inspections | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.pipelines | 1 | 32.0 KB | 8.0 KB | 16.0 KB | 4 | 3 | 0 |  |
| public.playbooks | 0 | 32.0 KB | 8.0 KB | 16.0 KB | 4 | 9 | 0 |  |
| public.prize_wheel_spins | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.product_usage_events | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.progressive_goals | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.qbr_reports | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.quota_attainment_actions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.quota_attainment_predictions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 7 | 0 |  |
| public.race_scoring_rules | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.race_teams | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.race_unlocks | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 4 | 0 |  |
| public.race_user_daily_checkins | 0 | 32.0 KB | 0 B | 32.0 KB | 0 | 6 | 1 |  |
| public.race_user_preferences | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 4 | 0 |  |
| public.rank_change_notifications | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 7 | 0 |  |
| public.rate_limit_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 8 | 0 |  |
| public.report_executions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.report_schedules | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.sales_enablement_assets | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 4 | 0 |  |
| public.salesperson_badges | 0 | 32.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.score_change_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.sequence_step_variants | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.sequence_steps | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.sequences | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 4 | 0 |  |
| public.session_activity | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.squads | 3 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | 2 | 0 |  |
| public.stage_probabilities | ~10 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | 7 | 4 |  |
| public.status_transitions | ~100 | 32.0 KB | 8.0 KB | 16.0 KB | 0 | 2 | 0 |  |
| public.supplier_orders | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.team_custom_fields | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.tournament_participants | 0 | 32.0 KB | 0 B | 32.0 KB | 0 | 7 | 0 |  |
| public.user_2fa_backup_codes | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 4 | 1 |  |
| public.user_2fa_log | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 4 | 1 |  |
| public.user_mfa_settings | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.webauthn_challenges | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.webhook_deliveries | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.webhooks | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.website_visitor_logs | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.win_calibration_buckets | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 4 | 0 |  |
| public.winloss_webhook_dispatch_metrics | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 4 | 0 |  |
| public.workflow_executions | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.workflows | 0 | 32.0 KB | 0 B | 24.0 KB | 0 | 4 | 0 |  |
| public.ai_agent_actions | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.ai_sales_insights | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.approval_workflows | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.buying_committee | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.buying_committee_members | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.buying_signals | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.cadence_advanced_stats | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.cadence_funnel_rules | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.call_insights | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.call_intelligence_triggers | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.call_objection_analysis | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.call_sentiment_timeline | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.call_transcripts | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.channel_credentials | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 0 |  |
| public.chat_conversations | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.client_renewals | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.coaching_skill_benchmarks | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 0 |  |
| public.cohort_analyses | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 0 |  |
| public.committee_coverage_history | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.competitors_registry | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 0 |  |
| public.critical_moment_notifications | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.dashboard_layouts | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.dead_letter_replay_audit | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 0 |  |
| public.edge_call_failures | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 0 |  |
| public.email_engagement_score_history | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.enriched_company_intelligence | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 0 |  |
| public.experiment_assignments | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | 6 | 1 |  |
| public.experiment_variants | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.follow_up_templates | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.geocode_cache | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 0 |  |
| public.integration_autotest_jobs | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 0 |  |
| public.integration_health_checks | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.intent_audit_logs | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 0 |  |
| public.lead_churn_risk | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~10 | 0 |  |
| public.lead_source_configs | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 0 |  |
| public.league_history | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.league_members | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.login_alerts | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | ~20 | 0 |  |
| public.mfa_verification_attempts | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 6 | 0 |  |
| public.mood_entries | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.notification_preferences | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 0 |  |
| public.onboarding_steps | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.password_history | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 1 |  |
| public.person_intelligence | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 0 |  |
| public.price_protection_rules | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.pricing_rules | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.product_stock_log | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.product_usage | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.push_subscriptions | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 1 |  |
| public.salesperson_commission_configs | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.salesperson_leagues | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.salesperson_preferences | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.scheduled_report_runs | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.sdr_alert_configs | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 1 |  |
| public.sdr_alert_history | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 0 |  |
| public.sdr_performance_settings | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.security_alert_history | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 0 |  |
| public.security_alert_settings | 0 | 24.0 KB | 8.0 KB | 16.0 KB | 1 | 2 | 0 |  |
| public.send_time_profiles | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.sms_verification_codes | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 1 |  |
| public.squad_members | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | 5 | 0 |  |
| public.supplier_order_items | 0 | 24.0 KB | 0 B | 24.0 KB | 0 | 6 | 0 |  |
| public.supplier_risk_assessments | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.tournaments | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.user_app_settings | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 1 |  |
| public.v4_callback_alerts | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 3 | 0 |  |
| public.webhook_allowed_domains | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.win_loss_insight_comments | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.xp_history | 0 | 24.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.available_spins | 0 | 16.0 KB | 0 B | 16.0 KB | 0 | 4 | 0 |  |
| public.dialer_queues | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 4 | 0 |  |
| public.edge_job_locks | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 2 | 0 |  |
| public.expansion_playbooks | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 2 | 0 |  |
| public.experiments | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 2 | 0 |  |
| public.lead_intelligence_metrics | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 2 | 0 |  |
| public.performance_impact_factors | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 2 | 0 |  |
| public.salesperson_performance_telemetry | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 2 | 0 |  |
| public.salesperson_xp | 0 | 16.0 KB | 0 B | 16.0 KB | 0 | 5 | 0 |  |
| public.task_catalog | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 2 | 0 |  |
| public.user_winloss_preferences | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 2 | 0 |  |
| public.webhook_dispatch_rate | 0 | 16.0 KB | 0 B | 16.0 KB | 0 | ~20 | 0 |  |
| public.whatsapp_template_versions | 0 | 16.0 KB | 0 B | 8.0 KB | 0 | 2 | 0 |  |
| public.ab_tests | 0 | 8.0 KB | 0 B | 8.0 KB | 0 | 2 | 0 |  |
| public.daily_challenge_rotations | 0 | 8.0 KB | 0 B | 8.0 KB | 0 | 2 | 0 |  |
| public.lead_score_trends | 0 | 8.0 KB | 0 B | 8.0 KB | 0 | 3 | 0 |  |


## Índices nunca usados (candidatos a remoção; ignore PK/UNIQUE)

| índice | tabela | tamanho |
|---|---|---|
| idx_activities_active | public.activities | 136.0 KB |
| idx_activities_client_date | public.activities | 120.0 KB |
| idx_activities_sale_id | public.activities | 88.0 KB |
| idx_activities_salesperson_created | public.activities | 200.0 KB |
| idx_audit_logs_action | public.audit_logs | 544.0 KB |
| idx_audit_logs_actor_id | public.audit_logs | 496.0 KB |
| idx_audit_logs_changed_by_changed | public.audit_logs | 2.0 MB |
| idx_audit_logs_entity | public.audit_logs | 2.7 MB |
| idx_audit_logs_record_id | public.audit_logs | 2.0 MB |
| idx_audit_logs_table_changed | public.audit_logs | 2.5 MB |
| idx_audit_logs_table_name | public.audit_logs | 2.4 MB |
| idx_clients_email_trgm | public.clients | 152.0 KB |
| idx_clients_name_trgm | public.clients | 96.0 KB |
| idx_cron_failure_alerts_jobname_alerted | public.cron_failure_alerts | 200.0 KB |
| idx_deal_stage_history_sale | public.deal_stage_history | 128.0 KB |
| idx_dst_open | public.deal_stage_transitions | 88.0 KB |
| idx_dst_sale_entered | public.deal_stage_transitions | 120.0 KB |
| idx_lead_score_history_sale_time | public.lead_score_history | 88.0 KB |
| idx_login_attempts_email_created | public.login_attempts | 88.0 KB |
| idx_maintenance_log_job_started | public.maintenance_log | 272.0 KB |
| idx_maintenance_log_started_at | public.maintenance_log | 136.0 KB |
| idx_notifications_category | public.notifications | 624.0 KB |
| idx_notifications_user_created | public.notifications | 504.0 KB |
| idx_notifications_user_unread | public.notifications | 624.0 KB |
| idx_order_status_events_order | public.order_status_events | 80.0 KB |
| idx_page_analytics_salesperson_route | public.page_analytics | 80.0 KB |
| idx_qs_inbound_log_source_status_time | public.quote_sync_inbound_log | 112.0 KB |
| idx_sales_account_id | public.sales | 72.0 KB |
| idx_sales_client_name_trgm | public.sales | 288.0 KB |
| idx_sales_product_name_trgm | public.sales | 280.0 KB |
| idx_sales_status_created_at | public.sales | 80.0 KB |
| idx_semantic_index_embedding | public.semantic_index | 1.2 MB |
| idx_tasks_sale_id | public.tasks | 80.0 KB |
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
| postgres | ~120 | ~619.2k | 5384.33 | `SELECT public.detect_stalled_cron_jobs()` |
| service_role | ~170 | ~227k | 1319.63 | `WITH pgrst_source AS (SELECT "pgrst_call".* FROM (SELECT $1 AS json_data) pgrst_payload, LATERAL (SELECT "_since_minutes" FROM json_to_record(pgrst_payload.json_data) AS _("_since_minutes" integer) LIMIT $4) pgrst_body ,` |
| postgres | ~4.5k | ~100.6k | 22.25 | `SELECT public.trigger_internal_edge_job($1)` |
| postgres | ~30 | ~89.1k | 2971.19 | `SELECT jobid, runid, status, start_time, end_time, EXTRACT($2 FROM (end_time - start_time))::numeric(10,2) AS seconds, left(return_message, $3) AS return_message FROM (SELECT *, row_number() OVER (PARTITION BY jobid ORDE` |
| postgres | ~30 | ~17.3k | 578.14 | `SELECT n.nspname AS schema, c.relname AS "table", a.attnum AS position, a.attname AS name, format_type(a.atttypid, a.atttypmod) AS type, NOT a.attnotnull AS nullable, pg_get_expr(d.adbin, d.adrelid) AS "default", NULLIF(` |
| postgres | ~340 | ~12.2k | 35.44 | `SELECT public.admin_capture_rollback_snapshot()` |
| postgres | ~30 | ~11.5k | 382.74 | `SELECT n.nspname AS schema, c.relname AS name, GREATEST(c.reltuples::bigint, $1) AS est_rows, pg_total_relation_size(c.oid) AS total_bytes, pg_relation_size(c.oid) AS heap_bytes, pg_indexes_size(c.oid) AS index_bytes, s.` |
| postgres | ~30 | ~9.9k | 328.82 | `SELECT e.extname AS name, e.extversion AS version, n.nspname AS schema, (SELECT default_version FROM pg_available_extensions a WHERE a.name = e.extname) AS available_version FROM pg_extension e JOIN pg_namespace n ON n.o` |
| service_role | ~210 | ~9.5k | 44.91 | `WITH pgrst_source AS (SELECT "pgrst_call".* FROM (SELECT $1 AS json_data) pgrst_payload, LATERAL (SELECT "p_today", "p_limit" FROM json_to_record(pgrst_payload.json_data) AS _("p_today" date, "p_limit" integer) LIMIT $4)` |
| authenticator | ~10 | ~6.4k | 585.32 | `WITH -- Recursively get the base types of domains base_types AS ( WITH RECURSIVE recurse AS ( SELECT oid, typbasetype, typnamespace AS base_namespace, COALESCE(NULLIF(typbasetype, $2), oid) AS base_type FROM pg_type UNIO` |
| postgres | ~30 | ~6k | 199.65 | `SELECT n.nspname AS schema, t.relname AS "table", ic.relname AS name, pg_get_indexdef(ix.indexrelid) AS definition, ix.indisunique AS is_unique, ix.indisprimary AS is_primary, ix.indisvalid AS is_valid, am.amname AS meth` |
| postgres | ~30 | ~5.5k | 183.64 | `SELECT n.nspname AS schema, p.proname AS name, pg_get_function_identity_arguments(p.oid) AS args, pg_get_function_result(p.oid) AS returns, l.lanname AS language, CASE p.prokind WHEN $1 THEN $2 WHEN $3 THEN $4 WHEN $5 TH` |
| postgres | ~30 | ~4.5k | 150.53 | `SELECT n.nspname AS schema, c.relname AS name, CASE c.relkind WHEN $1 THEN $2 ELSE $3 END AS kind, pg_get_viewdef(c.oid, $4) AS definition, c.reloptions AS options, pg_get_userbyid(c.relowner) AS owner, obj_description(c` |
| postgres | ~5k | ~4.2k | 0.83 | `WITH rows AS ( SELECT ctid FROM net._http_response WHERE created < now() - $1 ORDER BY created LIMIT $2 ) DELETE FROM net._http_response r USING rows WHERE r.ctid = rows.ctid` |
| postgres | ~30 | ~3.8k | 127.55 | `SELECT n.nspname AS schema, c.relname AS name, CASE c.relkind WHEN $1 THEN $2 WHEN $3 THEN $4 WHEN $5 THEN $6 END AS kind, c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced, pg_get_userbyid(c.relowner)` |


## Conexões
| usuário | estado | n |
|---|---|---|
| authenticator | idle | 11 |
| pgbouncer | idle | 2 |
| postgres | active | 1 |
| postgres | idle | 1 |
| supabase_admin | active | 1 |
| supabase_admin | idle | 7 |
| supabase_admin |  | 1 |
