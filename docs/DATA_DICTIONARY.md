# Dicionário de Dados — Promo Champions V2.1

> Gerado por `scripts/gen-data-dict.mjs` varrendo `supabase/migrations/*.sql`
> em ordem. Reflete o último estado declarado — guards `IF EXISTS`/
> `to_regclass` não são avaliados, então divergências pontuais com o banco
> podem existir. Regenerar: `node scripts/gen-data-dict.mjs`.

Total: **393 tabelas** no schema `public`.

## Índice

- [`ab_tests`](#ab_tests) — 2 col · ⚠️ sem RLS declarado · 0 policies
- [`access_denied_logs`](#access_denied_logs) — 9 col · 🔒 · 1 policies
- [`account_activities`](#account_activities) — 10 col · 🔒 · 2 policies
- [`account_contacts`](#account_contacts) — 18 col · 🔒 · 2 policies
- [`account_plans`](#account_plans) — 16 col · 🔒 · 3 policies
- [`accounts`](#accounts) — 22 col · 🔒 · 2 policies
- [`achievements`](#achievements) — 6 col · 🔒 · 2 policies
- [`active_power_ups`](#active_power_ups) — 8 col · 🔒 · 2 policies
- [`active_sessions`](#active_sessions) — 12 col · 🔒 · 6 policies
- [`activities`](#activities) — 16 col · 🔒 · 6 policies
- [`activity_audit_logs`](#activity_audit_logs) — 7 col · 🔒 · 1 policies
- [`activity_goals`](#activity_goals) — 9 col · 🔒 · 4 policies
- [`agenda_events`](#agenda_events) — 14 col · 🔒 · 2 policies
- [`ai_agent_actions`](#ai_agent_actions) — 9 col · 🔒 · 2 policies
- [`ai_agent_runs`](#ai_agent_runs) — 15 col · 🔒 · 2 policies
- [`ai_narrative_cache`](#ai_narrative_cache) — 12 col · 🔒 · 2 policies
- [`ai_sales_insights`](#ai_sales_insights) — 6 col · 🔒 · 1 policies
- [`api_tokens`](#api_tokens) — 10 col · 🔒 · 1 policies
- [`approval_decisions`](#approval_decisions) — 7 col · 🔒 · 2 policies
- [`approval_requests`](#approval_requests) — 15 col · 🔒 · 3 policies
- [`approval_workflows`](#approval_workflows) — 14 col · 🔒 · 2 policies
- [`asset_usage_logs`](#asset_usage_logs) — 8 col · 🔒 · 2 policies
- [`audit_log`](#audit_log) — 14 col · 🔒 · 2 policies
- [`audit_logs`](#audit_logs) — 17 col · 🔒 · 1 policies
- [`auto_task_queue_settings`](#auto_task_queue_settings) — 11 col · 🔒 · 2 policies
- [`automation_runs`](#automation_runs) — 9 col · 🔒 · 2 policies
- [`automation_workflows`](#automation_workflows) — 13 col · 🔒 · 1 policies
- [`available_spins`](#available_spins) — 4 col · 🔒 · 2 policies
- [`battle_participants`](#battle_participants) — 6 col · 🔒 · 2 policies
- [`bitrix24_sync_logs`](#bitrix24_sync_logs) — 11 col · 🔒 · 1 policies
- [`blocked_ips`](#blocked_ips) — 10 col · 🔒 · 1 policies
- [`buying_committee`](#buying_committee) — 12 col · 🔒 · 2 policies
- [`buying_committee_members`](#buying_committee_members) — 13 col · 🔒 · 0 policies
- [`buying_signals`](#buying_signals) — 7 col · 🔒 · 1 policies
- [`cadence_ab_assignments`](#cadence_ab_assignments) — 5 col · 🔒 · 2 policies
- [`cadence_ab_tests`](#cadence_ab_tests) — 14 col · 🔒 · 2 policies
- [`cadence_advanced_stats`](#cadence_advanced_stats) — 5 col · 🔒 · 1 policies
- [`cadence_alert_templates`](#cadence_alert_templates) — 12 col · 🔒 · 1 policies
- [`cadence_enrollment_rules`](#cadence_enrollment_rules) — 14 col · 🔒 · 2 policies
- [`cadence_enrollments`](#cadence_enrollments) — 7 col · 🔒 · 0 policies
- [`cadence_funnel_rules`](#cadence_funnel_rules) — 13 col · 🔒 · 2 policies
- [`cadence_outcome_rules`](#cadence_outcome_rules) — 9 col · 🔒 · 1 policies
- [`cadence_steps`](#cadence_steps) — 15 col · 🔒 · 4 policies
- [`cadence_tasks`](#cadence_tasks) — 10 col · 🔒 · 4 policies
- [`cadences`](#cadences) — 8 col · 🔒 · 4 policies
- [`call_coaching_scorecards`](#call_coaching_scorecards) — 15 col · 🔒 · 2 policies
- [`call_conversation_metrics`](#call_conversation_metrics) — 14 col · 🔒 · 2 policies
- [`call_critical_moments`](#call_critical_moments) — 13 col · 🔒 · 4 policies
- [`call_insights`](#call_insights) — 15 col · 🔒 · 2 policies
- [`call_intelligence_triggers`](#call_intelligence_triggers) — 4 col · 🔒 · 1 policies
- [`call_logs`](#call_logs) — 11 col · 🔒 · 4 policies
- [`call_metric_benchmarks`](#call_metric_benchmarks) — 8 col · 🔒 · 2 policies
- [`call_objection_analysis`](#call_objection_analysis) — 11 col · 🔒 · 1 policies
- [`call_objections`](#call_objections) — 11 col · 🔒 · 2 policies
- [`call_question_analysis`](#call_question_analysis) — 14 col · 🔒 · 2 policies
- [`call_questions`](#call_questions) — 8 col · 🔒 · 2 policies
- [`call_recording_ingest_jobs`](#call_recording_ingest_jobs) — 16 col · 🔒 · 3 policies
- [`call_recordings`](#call_recordings) — 33 col · 🔒 · 4 policies
- [`call_sentiment_timeline`](#call_sentiment_timeline) — 11 col · 🔒 · 2 policies
- [`call_tracking`](#call_tracking) — 9 col · 🔒 · 1 policies
- [`call_transcripts`](#call_transcripts) — 8 col · 🔒 · 2 policies
- [`campaign_health_alerts`](#campaign_health_alerts) — 10 col · 🔒 · 2 policies
- [`category_metrics`](#category_metrics) — 5 col · 🔒 · 4 policies
- [`challenge_progress`](#challenge_progress) — 8 col · 🔒 · 3 policies
- [`channel_credentials`](#channel_credentials) — 11 col · 🔒 · 4 policies
- [`channel_interactions`](#channel_interactions) — 12 col · 🔒 · 4 policies
- [`chat_conversations`](#chat_conversations) — 5 col · 🔒 · 4 policies
- [`chat_messages`](#chat_messages) — 5 col · 🔒 · 2 policies
- [`churn_alert_settings`](#churn_alert_settings) — 16 col · 🔒 · 2 policies
- [`circuit_breaker_events`](#circuit_breaker_events) — 7 col · 🔒 · 3 policies
- [`client_churn_alerts_state`](#client_churn_alerts_state) — 12 col · 🔒 · 2 policies
- [`client_interactions`](#client_interactions) — 7 col · 🔒 · 4 policies
- [`client_portfolio`](#client_portfolio) — 12 col · 🔒 · 2 policies
- [`client_renewals`](#client_renewals) — 10 col · 🔒 · 1 policies
- [`clients`](#clients) — 22 col · 🔒 · 9 policies
- [`coaching_actions`](#coaching_actions) — 14 col · 🔒 · 4 policies
- [`coaching_opportunities`](#coaching_opportunities) — 12 col · 🔒 · 2 policies
- [`coaching_scorecard_config`](#coaching_scorecard_config) — 5 col · 🔒 · 1 policies
- [`coaching_sessions`](#coaching_sessions) — 14 col · 🔒 · 3 policies
- [`coaching_skill_benchmarks`](#coaching_skill_benchmarks) — 6 col · 🔒 · 2 policies
- [`cohort_analyses`](#cohort_analyses) — 10 col · 🔒 · 1 policies
- [`collectible_badges`](#collectible_badges) — 10 col · 🔒 · 0 policies
- [`combo_tracking`](#combo_tracking) — 9 col · 🔒 · 3 policies
- [`commercial_approval_requests`](#commercial_approval_requests) — 14 col · 🔒 · 5 policies
- [`commission_bonus_awards`](#commission_bonus_awards) — 12 col · 🔒 · 4 policies
- [`commission_bonuses`](#commission_bonuses) — 12 col · 🔒 · 2 policies
- [`commission_rules`](#commission_rules) — 13 col · 🔒 · 2 policies
- [`commissions`](#commissions) — 17 col · 🔒 · 2 policies
- [`committee_coverage_history`](#committee_coverage_history) — 7 col · 🔒 · 2 policies
- [`committee_extraction_runs`](#committee_extraction_runs) — 9 col · 🔒 · 2 policies
- [`competitive_chat_messages`](#competitive_chat_messages) — 9 col · 🔒 · 3 policies
- [`competitive_seasons`](#competitive_seasons) — 9 col · 🔒 · 1 policies
- [`competitor_mentions`](#competitor_mentions) — 8 col · 🔒 · 3 policies
- [`competitors_pricing`](#competitors_pricing) — 7 col · 🔒 · 1 policies
- [`competitors_registry`](#competitors_registry) — 8 col · 🔒 · 3 policies
- [`contact_engagement_score`](#contact_engagement_score) — 11 col · 🔒 · 2 policies
- [`contact_send_time_profile`](#contact_send_time_profile) — 10 col · 🔒 · 2 policies
- [`conversation_analyses`](#conversation_analyses) — 15 col · 🔒 · 4 policies
- [`critical_moment_notifications`](#critical_moment_notifications) — 6 col · 🔒 · 3 policies
- [`cron_failure_alerts`](#cron_failure_alerts) — 9 col · 🔒 · 1 policies
- [`cs_tickets`](#cs_tickets) — 11 col · 🔒 · 1 policies
- [`csat_ces_surveys`](#csat_ces_surveys) — 10 col · 🔒 · 2 policies
- [`custom_reports`](#custom_reports) — 9 col · 🔒 · 2 policies
- [`daily_challenge_progress`](#daily_challenge_progress) — 8 col · 🔒 · 3 policies
- [`daily_challenges`](#daily_challenges) — 15 col · 🔒 · 5 policies
- [`daily_metrics`](#daily_metrics) — 9 col · 🔒 · 4 policies
- [`daily_streak_achievements`](#daily_streak_achievements) — 6 col · 🔒 · 3 policies
- [`dashboard_layouts`](#dashboard_layouts) — 5 col · 🔒 · 1 policies
- [`data_access_log`](#data_access_log) — 6 col · 🔒 · 1 policies
- [`db_rollback_snapshots`](#db_rollback_snapshots) — 7 col · 🔒 · 1 policies
- [`dead_letter_replay_audit`](#dead_letter_replay_audit) — 6 col · 🔒 · 1 policies
- [`deal_chat_history`](#deal_chat_history) — 7 col · 🔒 · 3 policies
- [`deal_committee_coverage`](#deal_committee_coverage) — 11 col · 🔒 · 2 policies
- [`deal_health_history`](#deal_health_history) — 7 col · 🔒 · 1 policies
- [`deal_health_scores`](#deal_health_scores) — 16 col · 🔒 · 2 policies
- [`deal_outcomes`](#deal_outcomes) — 7 col · 🔒 · 4 policies
- [`deal_probability_scores`](#deal_probability_scores) — 7 col · 🔒 · 2 policies
- [`deal_risk_signals`](#deal_risk_signals) — 9 col · 🔒 · 3 policies
- [`deal_stage_history`](#deal_stage_history) — 5 col · 🔒 · 3 policies
- [`deal_stage_transitions`](#deal_stage_transitions) — 9 col · 🔒 · 2 policies
- [`deal_stakeholders`](#deal_stakeholders) — 20 col · 🔒 · 4 policies
- [`deal_velocity_alerts`](#deal_velocity_alerts) — 9 col · 🔒 · 2 policies
- [`deal_velocity_predictions`](#deal_velocity_predictions) — 17 col · 🔒 · 2 policies
- [`demand_forecasts`](#demand_forecasts) — 10 col · 🔒 · 4 policies
- [`dialer_queue_items`](#dialer_queue_items) — 9 col · 🔒 · 2 policies
- [`dialer_queues`](#dialer_queues) — 9 col · 🔒 · 2 policies
- [`digital_signatures`](#digital_signatures) — 10 col · 🔒 · 4 policies
- [`document_signers`](#document_signers) — 8 col · 🔒 · 2 policies
- [`duplicate_block_logs`](#duplicate_block_logs) — 8 col · 🔒 · 1 policies
- [`edge_retry_events`](#edge_retry_events) — 12 col · 🔒 · 2 policies
- [`email_bulk_drafts`](#email_bulk_drafts) — 19 col · 🔒 · 4 policies
- [`email_bulk_jobs`](#email_bulk_jobs) — 11 col · 🔒 · 4 policies
- [`email_engagement_score_history`](#email_engagement_score_history) — 5 col · 🔒 · 1 policies
- [`email_engagement_scores`](#email_engagement_scores) — 15 col · 🔒 · 2 policies
- [`email_logs`](#email_logs) — 8 col · 🔒 · 1 policies
- [`email_opt_outs`](#email_opt_outs) — 7 col · 🔒 · 0 policies
- [`email_tracking_events`](#email_tracking_events) — 9 col · 🔒 · 1 policies
- [`embedded_report_tokens`](#embedded_report_tokens) — 10 col · 🔒 · 1 policies
- [`engagement_score_history`](#engagement_score_history) — 7 col · 🔒 · 2 policies
- [`enriched_company_intelligence`](#enriched_company_intelligence) — 14 col · 🔒 · 1 policies
- [`entity_versions`](#entity_versions) — 8 col · 🔒 · 2 policies
- [`error_logs`](#error_logs) — 11 col · 🔒 · 2 policies
- [`executive_briefings`](#executive_briefings) — 11 col · 🔒 · 4 policies
- [`expansion_opportunities`](#expansion_opportunities) — 11 col · 🔒 · 2 policies
- [`expansion_playbooks`](#expansion_playbooks) — 10 col · 🔒 · 2 policies
- [`experiment_assignments`](#experiment_assignments) — 4 col · ⚠️ sem RLS declarado · 0 policies
- [`experiment_variants`](#experiment_variants) — 5 col · ⚠️ sem RLS declarado · 0 policies
- [`experiments`](#experiments) — 7 col · ⚠️ sem RLS declarado · 0 policies
- [`external_seller_map`](#external_seller_map) — 8 col · 🔒 · 2 policies
- [`feature_flags`](#feature_flags) — 9 col · 🔒 · 2 policies
- [`feed_comments`](#feed_comments) — 5 col · 🔒 · 1 policies
- [`feed_reactions`](#feed_reactions) — 5 col · 🔒 · 2 policies
- [`follow_up_audit_logs`](#follow_up_audit_logs) — 7 col · 🔒 · 2 policies
- [`follow_up_notifications`](#follow_up_notifications) — 6 col · 🔒 · 1 policies
- [`follow_up_settings`](#follow_up_settings) — 7 col · 🔒 · 2 policies
- [`follow_up_templates`](#follow_up_templates) — 9 col · 🔒 · 2 policies
- [`follow_up_territory_rules`](#follow_up_territory_rules) — 8 col · 🔒 · 2 policies
- [`forecast_accuracy`](#forecast_accuracy) — 16 col · 🔒 · 3 policies
- [`forecast_confidence_scores`](#forecast_confidence_scores) — 8 col · 🔒 · 2 policies
- [`forecast_deal_contributions`](#forecast_deal_contributions) — 8 col · 🔒 · 2 policies
- [`forecast_narrative_dead_letters`](#forecast_narrative_dead_letters) — 8 col · 🔒 · 1 policies
- [`forecast_snapshots`](#forecast_snapshots) — 21 col · 🔒 · 3 policies
- [`icp_data`](#icp_data) — 11 col · 🔒 · 3 policies
- [`icp_parameters`](#icp_parameters) — 11 col · 🔒 · 2 policies
- [`inbound_reply_events`](#inbound_reply_events) — 10 col · 🔒 · 0 policies
- [`integration_autotest_jobs`](#integration_autotest_jobs) — 8 col · 🔒 · 1 policies
- [`integration_autotest_settings`](#integration_autotest_settings) — 7 col · 🔒 · 1 policies
- [`integration_connections`](#integration_connections) — 10 col · 🔒 · 1 policies
- [`integration_health_checks`](#integration_health_checks) — 8 col · 🔒 · 2 policies
- [`integration_logs`](#integration_logs) — 6 col · 🔒 · 1 policies
- [`intent_audit_logs`](#intent_audit_logs) — 5 col · 🔒 · 3 policies
- [`inventory_levels`](#inventory_levels) — 10 col · 🔒 · 4 policies
- [`ip_whitelist`](#ip_whitelist) — 6 col · 🔒 · 1 policies
- [`known_devices`](#known_devices) — 12 col · 🔒 · 4 policies
- [`kudos`](#kudos) — 7 col · 🔒 · 3 policies
- [`lead_assignments`](#lead_assignments) — 7 col · 🔒 · 2 policies
- [`lead_churn_risk`](#lead_churn_risk) — 6 col · 🔒 · 2 policies
- [`lead_detailed_logs`](#lead_detailed_logs) — 6 col · 🔒 · 3 policies
- [`lead_intelligence_metrics`](#lead_intelligence_metrics) — 7 col · 🔒 · 1 policies
- [`lead_routing_log`](#lead_routing_log) — 7 col · 🔒 · 2 policies
- [`lead_routing_rules`](#lead_routing_rules) — 15 col · 🔒 · 2 policies
- [`lead_score_explanations`](#lead_score_explanations) — 11 col · 🔒 · 3 policies
- [`lead_score_history`](#lead_score_history) — 5 col · 🔒 · 2 policies
- [`lead_score_trends`](#lead_score_trends) — 4 col · 🔒 · 1 policies
- [`lead_scores`](#lead_scores) — 7 col · 🔒 · 4 policies
- [`lead_source_configs`](#lead_source_configs) — 6 col · 🔒 · 1 policies
- [`league_history`](#league_history) — 9 col · 🔒 · 1 policies
- [`league_members`](#league_members) — 11 col · 🔒 · 3 policies
- [`leagues`](#leagues) — 10 col · 🔒 · 1 policies
- [`login_alerts`](#login_alerts) — 13 col · 🔒 · 2 policies
- [`login_attempts`](#login_attempts) — 7 col · 🔒 · 1 policies
- [`maintenance_log`](#maintenance_log) — 8 col · 🔒 · 1 policies
- [`message_templates`](#message_templates) — 13 col · 🔒 · 4 policies
- [`mfa_verification_attempts`](#mfa_verification_attempts) — 7 col · 🔒 · 1 policies
- [`migration_log`](#migration_log) — 5 col · ⚠️ sem RLS declarado · 0 policies
- [`monthly_sales_summary`](#monthly_sales_summary) — 5 col · 🔒 · 1 policies
- [`mood_entries`](#mood_entries) — 5 col · 🔒 · 3 policies
- [`mql_qualifications`](#mql_qualifications) — 14 col · 🔒 · 1 policies
- [`notification_preferences`](#notification_preferences) — 23 col · 🔒 · 1 policies
- [`notifications`](#notifications) — 17 col · 🔒 · 7 policies
- [`nps_surveys`](#nps_surveys) — 12 col · 🔒 · 8 policies
- [`objection_library`](#objection_library) — 8 col · 🔒 · 2 policies
- [`objections_library`](#objections_library) — 10 col · 🔒 · 4 policies
- [`onboarding_journeys`](#onboarding_journeys) — 11 col · 🔒 · 2 policies
- [`onboarding_steps`](#onboarding_steps) — 9 col · 🔒 · 2 policies
- [`order_items`](#order_items) — 6 col · 🔒 · 2 policies
- [`order_status_events`](#order_status_events) — 5 col · 🔒 · 1 policies
- [`orders`](#orders) — 15 col · 🔒 · 1 policies
- [`outbound_messages`](#outbound_messages) — 18 col · 🔒 · 3 policies
- [`page_analytics`](#page_analytics) — 12 col · 🔒 · 3 policies
- [`password_history`](#password_history) — 4 col · 🔒 · 1 policies
- [`password_reset_requests`](#password_reset_requests) — 13 col · 🔒 · 0 policies
- [`performance_bets`](#performance_bets) — 13 col · 🔒 · 3 policies
- [`performance_impact_factors`](#performance_impact_factors) — 5 col · 🔒 · 1 policies
- [`permissions`](#permissions) — 6 col · 🔒 · 2 policies
- [`person_intelligence`](#person_intelligence) — 11 col · 🔒 · 1 policies
- [`personal_assistant_briefings`](#personal_assistant_briefings) — 9 col · 🔒 · 4 policies
- [`personal_assistant_nudges`](#personal_assistant_nudges) — 9 col · 🔒 · 4 policies
- [`pipeline_coverage_recommendations`](#pipeline_coverage_recommendations) — 11 col · 🔒 · 4 policies
- [`pipeline_coverage_snapshots`](#pipeline_coverage_snapshots) — 16 col · 🔒 · 4 policies
- [`pipeline_inspection_snapshots`](#pipeline_inspection_snapshots) — 9 col · 🔒 · 0 policies
- [`pipeline_inspections`](#pipeline_inspections) — 10 col · 🔒 · 2 policies
- [`pipeline_stages`](#pipeline_stages) — 9 col · 🔒 · 6 policies
- [`pipelines`](#pipelines) — 9 col · 🔒 · 5 policies
- [`playbook_items`](#playbook_items) — 9 col · 🔒 · 4 policies
- [`playbook_progress`](#playbook_progress) — 5 col · 🔒 · 6 policies
- [`playbooks`](#playbooks) — 6 col · 🔒 · 4 policies
- [`portfolio_settings`](#portfolio_settings) — 5 col · 🔒 · 3 policies
- [`price_alerts`](#price_alerts) — 9 col · 🔒 · 3 policies
- [`price_history`](#price_history) — 9 col · 🔒 · 2 policies
- [`price_protection_rules`](#price_protection_rules) — 6 col · 🔒 · 1 policies
- [`pricing_rules`](#pricing_rules) — 8 col · 🔒 · 1 policies
- [`prize_wheel_spins`](#prize_wheel_spins) — 8 col · 🔒 · 1 policies
- [`product_stock_log`](#product_stock_log) — 5 col · 🔒 · 1 policies
- [`product_usage`](#product_usage) — 7 col · 🔒 · 1 policies
- [`product_usage_events`](#product_usage_events) — 7 col · 🔒 · 2 policies
- [`product_usage_summary`](#product_usage_summary) — 8 col · 🔒 · 2 policies
- [`products`](#products) — 18 col · 🔒 · 6 policies
- [`progressive_goals`](#progressive_goals) — 11 col · 🔒 · 3 policies
- [`prospect_cadences`](#prospect_cadences) — 17 col · 🔒 · 4 policies
- [`push_subscriptions`](#push_subscriptions) — 7 col · 🔒 · 8 policies
- [`qbr_reports`](#qbr_reports) — 10 col · 🔒 · 0 policies
- [`qbr_schedule`](#qbr_schedule) — 10 col · 🔒 · 2 policies
- [`query_telemetry`](#query_telemetry) — 13 col · 🔒 · 3 policies
- [`quota_attainment_actions`](#quota_attainment_actions) — 8 col · 🔒 · 2 policies
- [`quota_attainment_alerts`](#quota_attainment_alerts) — 8 col · 🔒 · 2 policies
- [`quota_attainment_forecasts`](#quota_attainment_forecasts) — 16 col · 🔒 · 2 policies
- [`quota_attainment_predictions`](#quota_attainment_predictions) — 22 col · 🔒 · 3 policies
- [`quote_conversion_audit`](#quote_conversion_audit) — 16 col · 🔒 · 1 policies
- [`quote_items`](#quote_items) — 11 col · 🔒 · 1 policies
- [`quote_sync_inbound_log`](#quote_sync_inbound_log) — 12 col · 🔒 · 1 policies
- [`quote_sync_logs`](#quote_sync_logs) — 10 col · 🔒 · 3 policies
- [`quotes`](#quotes) — 39 col · 🔒 · 4 policies
- [`quotes_inbound`](#quotes_inbound) — 16 col · 🔒 · 2 policies
- [`race_badges`](#race_badges) — 5 col · 🔒 · 2 policies
- [`race_cars`](#race_cars) — 14 col · 🔒 · 4 policies
- [`race_daily_snapshots`](#race_daily_snapshots) — 10 col · 🔒 · 2 policies
- [`race_events`](#race_events) — 6 col · 🔒 · 2 policies
- [`race_overlay_telemetry`](#race_overlay_telemetry) — 6 col · 🔒 · 4 policies
- [`race_powerups`](#race_powerups) — 7 col · 🔒 · 3 policies
- [`race_reactions`](#race_reactions) — 6 col · 🔒 · 0 policies
- [`race_rivalries_persistent`](#race_rivalries_persistent) — 6 col · 🔒 · 3 policies
- [`race_scoring_rules`](#race_scoring_rules) — 8 col · 🔒 · 2 policies
- [`race_seasons`](#race_seasons) — 11 col · 🔒 · 2 policies
- [`race_team_members`](#race_team_members) — 4 col · 🔒 · 2 policies
- [`race_teams`](#race_teams) — 8 col · 🔒 · 2 policies
- [`race_unlocks`](#race_unlocks) — 4 col · 🔒 · 0 policies
- [`race_user_daily_checkins`](#race_user_daily_checkins) — 7 col · 🔒 · 2 policies
- [`race_user_preferences`](#race_user_preferences) — 8 col · 🔒 · 4 policies
- [`rank_change_notifications`](#rank_change_notifications) — 8 col · 🔒 · 3 policies
- [`ranking_notifications`](#ranking_notifications) — 11 col · 🔒 · 4 policies
- [`rate_limit_logs`](#rate_limit_logs) — 9 col · 🔒 · 2 policies
- [`rate_limit_settings`](#rate_limit_settings) — 8 col · 🔒 · 2 policies
- [`reauthentication_requests`](#reauthentication_requests) — 9 col · 🔒 · 3 policies
- [`renewals`](#renewals) — 12 col · 🔒 · 2 policies
- [`report_embed_tokens`](#report_embed_tokens) — 10 col · 🔒 · 4 policies
- [`report_executions`](#report_executions) — 10 col · 🔒 · 1 policies
- [`report_schedules`](#report_schedules) — 14 col · 🔒 · 1 policies
- [`revenue_forecasts`](#revenue_forecasts) — 19 col · 🔒 · 2 policies
- [`role_permissions`](#role_permissions) — 4 col · 🔒 · 2 policies
- [`roles`](#roles) — 5 col · ⚠️ sem RLS declarado · 0 policies
- [`sale_notifications_audit`](#sale_notifications_audit) — 14 col · 🔒 · 1 policies
- [`sales`](#sales) — 44 col · 🔒 · 13 policies
- [`sales_battles`](#sales_battles) — 12 col · 🔒 · 1 policies
- [`sales_enablement_assets`](#sales_enablement_assets) — 14 col · 🔒 · 2 policies
- [`sales_goals`](#sales_goals) — 5 col · 🔒 · 4 policies
- [`sales_streaks`](#sales_streaks) — 7 col · 🔒 · 3 policies
- [`sales_territories`](#sales_territories) — 10 col · 🔒 · 3 policies
- [`salespeople`](#salespeople) — 14 col · 🔒 · 3 policies
- [`salesperson_badges`](#salesperson_badges) — 5 col · 🔒 · 3 policies
- [`salesperson_coaching_aggregates`](#salesperson_coaching_aggregates) — 14 col · 🔒 · 2 policies
- [`salesperson_commission_configs`](#salesperson_commission_configs) — 5 col · 🔒 · 2 policies
- [`salesperson_custom_field_values`](#salesperson_custom_field_values) — 7 col · 🔒 · 2 policies
- [`salesperson_leagues`](#salesperson_leagues) — 9 col · 🔒 · 2 policies
- [`salesperson_performance_telemetry`](#salesperson_performance_telemetry) — 4 col · 🔒 · 1 policies
- [`salesperson_preferences`](#salesperson_preferences) — 10 col · 🔒 · 3 policies
- [`salesperson_xp`](#salesperson_xp) — 7 col · 🔒 · 4 policies
- [`saved_filters`](#saved_filters) — 8 col · 🔒 · 9 policies
- [`scheduled_report_runs`](#scheduled_report_runs) — 8 col · 🔒 · 1 policies
- [`scheduled_reports`](#scheduled_reports) — 15 col · 🔒 · 4 policies
- [`scheduled_sends`](#scheduled_sends) — 11 col · 🔒 · 3 policies
- [`sdr_alert_configs`](#sdr_alert_configs) — 6 col · 🔒 · 1 policies
- [`sdr_alert_history`](#sdr_alert_history) — 9 col · 🔒 · 0 policies
- [`sdr_performance_settings`](#sdr_performance_settings) — 6 col · 🔒 · 1 policies
- [`security_alert_settings`](#security_alert_settings) — 6 col · 🔒 · 3 policies
- [`security_events`](#security_events) — 9 col · ⚠️ sem RLS declarado · 0 policies
- [`semantic_index`](#semantic_index) — 10 col · 🔒 · 1 policies
- [`send_time_profiles`](#send_time_profiles) — 11 col · 🔒 · 1 policies
- [`sequence_enrollments`](#sequence_enrollments) — 18 col · 🔒 · 4 policies
- [`sequence_step_assignments`](#sequence_step_assignments) — 6 col · 🔒 · 2 policies
- [`sequence_step_executions`](#sequence_step_executions) — 11 col · 🔒 · 1 policies
- [`sequence_step_variants`](#sequence_step_variants) — 7 col · 🔒 · 4 policies
- [`sequence_steps`](#sequence_steps) — 12 col · 🔒 · 2 policies
- [`sequences`](#sequences) — 13 col · 🔒 · 4 policies
- [`session_activity`](#session_activity) — 7 col · 🔒 · 1 policies
- [`skill_assessments`](#skill_assessments) — 12 col · 🔒 · 4 policies
- [`skill_development_tracks`](#skill_development_tracks) — 11 col · 🔒 · 4 policies
- [`sla_policies`](#sla_policies) — 9 col · 🔒 · 2 policies
- [`sla_violations`](#sla_violations) — 11 col · 🔒 · 2 policies
- [`slow_query_alerts`](#slow_query_alerts) — 15 col · 🔒 · 2 policies
- [`sms_verification_codes`](#sms_verification_codes) — 7 col · 🔒 · 11 policies
- [`squad_members`](#squad_members) — 3 col · 🔒 · 2 policies
- [`squads`](#squads) — 7 col · 🔒 · 2 policies
- [`stage_bottleneck_insights`](#stage_bottleneck_insights) — 11 col · 🔒 · 3 policies
- [`stage_conversion_metrics`](#stage_conversion_metrics) — 14 col · 🔒 · 3 policies
- [`stage_inactivity_rules`](#stage_inactivity_rules) — 9 col · 🔒 · 2 policies
- [`stage_velocity_baselines`](#stage_velocity_baselines) — 15 col · 🔒 · 4 policies
- [`stock_movements`](#stock_movements) — 8 col · 🔒 · 2 policies
- [`supplier_order_items`](#supplier_order_items) — 7 col · 🔒 · 2 policies
- [`supplier_orders`](#supplier_orders) — 12 col · 🔒 · 4 policies
- [`supplier_products`](#supplier_products) — 10 col · 🔒 · 4 policies
- [`supplier_risk_assessments`](#supplier_risk_assessments) — 12 col · 🔒 · 3 policies
- [`suppliers`](#suppliers) — 21 col · 🔒 · 5 policies
- [`support_tickets`](#support_tickets) — 16 col · 🔒 · 4 policies
- [`task_assignments`](#task_assignments) — 15 col · 🔒 · 4 policies
- [`task_catalog`](#task_catalog) — 10 col · 🔒 · 3 policies
- [`tasks`](#tasks) — 16 col · 🔒 · 6 policies
- [`team_closers`](#team_closers) — 4 col · 🔒 · 3 policies
- [`team_custom_fields`](#team_custom_fields) — 8 col · 🔒 · 1 policies
- [`teams`](#teams) — 10 col · 🔒 · 4 policies
- [`territories`](#territories) — 7 col · 🔒 · 1 policies
- [`territory_history`](#territory_history) — 8 col · 🔒 · 3 policies
- [`tournament_matches`](#tournament_matches) — 13 col · 🔒 · 3 policies
- [`tournament_participants`](#tournament_participants) — 8 col · 🔒 · 3 policies
- [`tournaments`](#tournaments) — 14 col · 🔒 · 3 policies
- [`twilio_call_sessions`](#twilio_call_sessions) — 15 col · 🔒 · 3 policies
- [`user_2fa`](#user_2fa) — 9 col · 🔒 · 3 policies
- [`user_2fa_backup_codes`](#user_2fa_backup_codes) — 6 col · 🔒 · 2 policies
- [`user_2fa_log`](#user_2fa_log) — 6 col · ⚠️ sem RLS declarado · 0 policies
- [`user_app_settings`](#user_app_settings) — 5 col · 🔒 · 4 policies
- [`user_mfa_settings`](#user_mfa_settings) — 13 col · 🔒 · 3 policies
- [`user_permissions_cache`](#user_permissions_cache) — 3 col · ⚠️ sem RLS declarado · 0 policies
- [`user_roles`](#user_roles) — 10 col · 🔒 · 5 policies
- [`user_winloss_preferences`](#user_winloss_preferences) — 3 col · 🔒 · 4 policies
- [`v4_callback_alert_settings`](#v4_callback_alert_settings) — 11 col · 🔒 · 1 policies
- [`v4_callback_alerts`](#v4_callback_alerts) — 6 col · 🔒 · 3 policies
- [`v4_callback_dead_letters`](#v4_callback_dead_letters) — 11 col · 🔒 · 1 policies
- [`v4_callback_metrics`](#v4_callback_metrics) — 7 col · 🔒 · 1 policies
- [`victory_feed`](#victory_feed) — 8 col · 🔒 · 1 policies
- [`web_vitals_samples`](#web_vitals_samples) — 12 col · 🔒 · 1 policies
- [`webauthn_challenges`](#webauthn_challenges) — 7 col · 🔒 · 3 policies
- [`webauthn_credentials`](#webauthn_credentials) — 11 col · 🔒 · 4 policies
- [`webhook_deliveries`](#webhook_deliveries) — 11 col · 🔒 · 1 policies
- [`webhook_events`](#webhook_events) — 9 col · 🔒 · 0 policies
- [`webhook_inbound_dedupe`](#webhook_inbound_dedupe) — 9 col · 🔒 · 1 policies
- [`webhook_inbound_log`](#webhook_inbound_log) — 10 col · 🔒 · 0 policies
- [`webhook_logs`](#webhook_logs) — 10 col · 🔒 · 1 policies
- [`webhooks`](#webhooks) — 16 col · 🔒 · 7 policies
- [`website_visitor_logs`](#website_visitor_logs) — 8 col · 🔒 · 1 policies
- [`weekly_challenges`](#weekly_challenges) — 11 col · 🔒 · 4 policies
- [`weekly_matchups`](#weekly_matchups) — 10 col · 🔒 · 2 policies
- [`whatsapp_conversations`](#whatsapp_conversations) — 9 col · 🔒 · 2 policies
- [`whatsapp_template_versions`](#whatsapp_template_versions) — 9 col · 🔒 · 3 policies
- [`win_calibration_buckets`](#win_calibration_buckets) — 8 col · 🔒 · 2 policies
- [`win_loss_analyses`](#win_loss_analyses) — 12 col · 🔒 · 1 policies
- [`win_loss_insight_comments`](#win_loss_insight_comments) — 5 col · 🔒 · 0 policies
- [`win_loss_insights`](#win_loss_insights) — 11 col · 🔒 · 1 policies
- [`win_loss_patterns`](#win_loss_patterns) — 10 col · 🔒 · 2 policies
- [`win_probability_calibrations`](#win_probability_calibrations) — 10 col · 🔒 · 2 policies
- [`win_probability_deal_calibrations`](#win_probability_deal_calibrations) — 13 col · 🔒 · 2 policies
- [`winloss_alert_settings`](#winloss_alert_settings) — 10 col · 🔒 · 3 policies
- [`winloss_webhook_alerts`](#winloss_webhook_alerts) — 8 col · 🔒 · 1 policies
- [`winloss_webhook_dead_letters`](#winloss_webhook_dead_letters) — 17 col · 🔒 · 2 policies
- [`winloss_webhook_deliveries`](#winloss_webhook_deliveries) — 11 col · 🔒 · 1 policies
- [`winloss_webhook_dispatch_metrics`](#winloss_webhook_dispatch_metrics) — 8 col · 🔒 · 1 policies
- [`winloss_webhook_replay_audit`](#winloss_webhook_replay_audit) — 13 col · 🔒 · 1 policies
- [`winloss_webhook_replay_invocations`](#winloss_webhook_replay_invocations) — 12 col · 🔒 · 1 policies
- [`winloss_webhook_subscriptions`](#winloss_webhook_subscriptions) — 9 col · 🔒 · 1 policies
- [`workflow_executions`](#workflow_executions) — 10 col · 🔒 · 3 policies
- [`workflow_rules`](#workflow_rules) — 13 col · 🔒 · 1 policies
- [`workflows`](#workflows) — 13 col · 🔒 · 2 policies
- [`xp_adjustments`](#xp_adjustments) — 8 col · 🔒 · 2 policies
- [`xp_history`](#xp_history) — 6 col · 🔒 · 2 policies

### `ab_tests`

**RLS não declarado nas migrations** · 0 policies

| Coluna       | Tipo                     | Nulo     | Default              | Constraints | Comentário |
| ------------ | ------------------------ | -------- | -------------------- | ----------- | ---------- |
| `id`         | UUID                     | NOT NULL | `uuid_generate_v4()` | PK          | —          |
| `created_at` | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —           | —          |

### `access_denied_logs`

**RLS habilitada** · 1 policies: `Authenticated users can log access denied`

| Coluna           | Tipo        | Nulo     | Default             | Constraints          | Comentário |
| ---------------- | ----------- | -------- | ------------------- | -------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `user_id`        | UUID        | sim      | —                   | FK → `auth.users.id` | —          |
| `user_email`     | TEXT        | sim      | —                   | —                    | —          |
| `attempted_path` | TEXT        | sim      | —                   | —                    | —          |
| `user_role`      | TEXT        | sim      | —                   | —                    | —          |
| `required_role`  | TEXT        | sim      | —                   | —                    | —          |
| `ip_address`     | TEXT        | sim      | —                   | —                    | —          |
| `user_agent`     | TEXT        | sim      | —                   | —                    | —          |
| `created_at`     | TIMESTAMPTZ | sim      | `now()`             | —                    | —          |

### `account_activities`

**RLS habilitada** · 2 policies: `View activities of accessible accounts`, `Insert activities for accessible accounts`

| Coluna           | Tipo        | Nulo     | Default             | Constraints                | Comentário |
| ---------------- | ----------- | -------- | ------------------- | -------------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                         | —          |
| `account_id`     | UUID        | NOT NULL | —                   | FK → `accounts.id`         | —          |
| `contact_id`     | UUID        | sim      | —                   | FK → `account_contacts.id` | —          |
| `salesperson_id` | UUID        | sim      | —                   | FK → `salespeople.id`      | —          |
| `activity_type`  | TEXT        | NOT NULL | —                   | —                          | —          |
| `title`          | TEXT        | NOT NULL | —                   | —                          | —          |
| `description`    | TEXT        | sim      | —                   | —                          | —          |
| `occurred_at`    | TIMESTAMPTZ | NOT NULL | `now()`             | —                          | —          |
| `metadata`       | JSONB       | sim      | `'{}'::jsonb`       | —                          | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                          | —          |

### `account_contacts`

**RLS habilitada** · 2 policies: `View contacts of accessible accounts`, `Manage contacts of accessible accounts`

| Coluna              | Tipo        | Nulo     | Default             | Constraints        | Comentário |
| ------------------- | ----------- | -------- | ------------------- | ------------------ | ---------- |
| `id`                | UUID        | NOT NULL | `gen_random_uuid()` | PK                 | —          |
| `account_id`        | UUID        | NOT NULL | —                   | FK → `accounts.id` | —          |
| `name`              | TEXT        | NOT NULL | —                   | —                  | —          |
| `email`             | TEXT        | sim      | —                   | —                  | —          |
| `phone`             | TEXT        | sim      | —                   | —                  | —          |
| `job_title`         | TEXT        | sim      | —                   | —                  | —          |
| `department`        | TEXT        | sim      | —                   | —                  | —          |
| `buying_role`       | TEXT        | NOT NULL | `'user'`            | —                  | —          |
| `influence_level`   | INTEGER     | NOT NULL | `3`                 | —                  | —          |
| `sentiment`         | TEXT        | NOT NULL | `'neutral'`         | —                  | —          |
| `linkedin_url`      | TEXT        | sim      | —                   | —                  | —          |
| `last_contacted_at` | TIMESTAMPTZ | sim      | —                   | —                  | —          |
| `notes`             | TEXT        | sim      | —                   | —                  | —          |
| `created_at`        | TIMESTAMPTZ | NOT NULL | `now()`             | —                  | —          |
| `updated_at`        | TIMESTAMPTZ | NOT NULL | `now()`             | —                  | —          |
| `sale_id`           | uuid        | sim      | —                   | FK → `sales.id`    | —          |
| `seniority`         | text        | sim      | —                   | —                  | —          |
| `is_primary`        | boolean     | sim      | `false`             | —                  | —          |

### `account_plans`

**RLS habilitada** · 3 policies: `Account plans owner or admin can read`, `Account plans owner or admin can update`, `Owners or admins can insert account plans`

| Coluna               | Tipo                     | Nulo     | Default             | Constraints          | Comentário |
| -------------------- | ------------------------ | -------- | ------------------- | -------------------- | ---------- |
| `id`                 | UUID                     | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `account_id`         | UUID                     | NOT NULL | —                   | FK → `accounts.id`   | —          |
| `fiscal_year`        | TEXT                     | sim      | —                   | —                    | —          |
| `revenue_target`     | NUMERIC(15,2)            | sim      | —                   | —                    | —          |
| `executive_summary`  | TEXT                     | sim      | —                   | —                    | —          |
| `key_objectives`     | TEXT[]                   | sim      | —                   | —                    | —          |
| `main_challenges`    | TEXT[]                   | sim      | —                   | —                    | —          |
| `swot_strengths`     | TEXT[]                   | sim      | —                   | —                    | —          |
| `swot_weaknesses`    | TEXT[]                   | sim      | —                   | —                    | —          |
| `swot_opportunities` | TEXT[]                   | sim      | —                   | —                    | —          |
| `swot_threats`       | TEXT[]                   | sim      | —                   | —                    | —          |
| `account_strategy`   | TEXT                     | sim      | —                   | —                    | —          |
| `action_plan`        | JSONB                    | sim      | —                   | —                    | —          |
| `created_by`         | UUID                     | sim      | —                   | FK → `auth.users.id` | —          |
| `created_at`         | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                    | —          |
| `updated_at`         | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                    | —          |

### `accounts`

**RLS habilitada** · 2 policies: `Owners and managers can view accounts`, `Owners and managers can manage accounts`

| Coluna                 | Tipo          | Nulo     | Default             | Constraints           | Comentário |
| ---------------------- | ------------- | -------- | ------------------- | --------------------- | ---------- |
| `id`                   | UUID          | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `name`                 | TEXT          | NOT NULL | —                   | —                     | —          |
| `parent_account_id`    | UUID          | sim      | —                   | FK → `accounts.id`    | —          |
| `industry`             | TEXT          | sim      | —                   | —                     | —          |
| `tier`                 | TEXT          | NOT NULL | `'smb'`             | —                     | —          |
| `annual_revenue`       | NUMERIC(15,2) | sim      | —                   | —                     | —          |
| `employee_count`       | INTEGER       | sim      | —                   | —                     | —          |
| `website`              | TEXT          | sim      | —                   | —                     | —          |
| `country`              | TEXT          | sim      | —                   | —                     | —          |
| `account_score`        | INTEGER       | NOT NULL | `0`                 | —                     | —          |
| `health_status`        | TEXT          | NOT NULL | `'unknown'`         | —                     | —          |
| `owner_id`             | UUID          | sim      | —                   | FK → `salespeople.id` | —          |
| `notes`                | TEXT          | sim      | —                   | —                     | —          |
| `created_at`           | TIMESTAMPTZ   | NOT NULL | `now()`             | —                     | —          |
| `updated_at`           | TIMESTAMPTZ   | NOT NULL | `now()`             | —                     | —          |
| `domain`               | text          | sim      | —                   | —                     | —          |
| `size_bucket`          | text          | sim      | —                   | —                     | —          |
| `coverage`             | numeric       | sim      | `0`                 | —                     | —          |
| `engaged_contacts`     | integer       | sim      | `0`                 | —                     | —          |
| `champion_count`       | integer       | sim      | `0`                 | —                     | —          |
| `decision_maker_count` | integer       | sim      | `0`                 | —                     | —          |
| `last_aggregated_at`   | timestamptz   | sim      | —                   | —                     | —          |

### `achievements`

**RLS habilitada** · 2 policies: `Authenticated users can read achievements`, `Users can insert own achievements`

| Coluna             | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ------------------ | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`               | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id`   | UUID        | sim      | —                   | FK → `salespeople.id` | —          |
| `achievement_type` | TEXT        | NOT NULL | —                   | —                     | —          |
| `achievement_date` | TEXT        | NOT NULL | —                   | —                     | —          |
| `details`          | JSONB       | sim      | `'{}'`              | —                     | —          |
| `created_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |

### `active_power_ups`

**RLS habilitada** · 2 policies: `Users can insert own power_ups`, `Users can view own or admin can view all power-ups`

| Coluna           | Tipo               | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID               | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id` | UUID               | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `power_up_type`  | TEXT               | NOT NULL | —                   | —                     | —          |
| `double_points`  | multiplier NUMERIC | NOT NULL | `2.0`               | —                     | —          |
| `activated_at`   | TIMESTAMPTZ        | NOT NULL | `now()`             | —                     | —          |
| `expires_at`     | TIMESTAMPTZ        | NOT NULL | —                   | —                     | —          |
| `source`         | TEXT               | sim      | `'streak'`          | —                     | —          |
| `admin`          | is_active BOOLEAN  | NOT NULL | `true`              | —                     | —          |

### `active_sessions`

**RLS habilitada** · 6 policies: `Users can view own sessions`, `Admins can view all sessions`, `Users can read own sessions`, `Users can insert own sessions`, `Users can update own sessions`, `Users can delete own sessions`

| Coluna               | Tipo        | Nulo     | Default             | Constraints          | Comentário |
| -------------------- | ----------- | -------- | ------------------- | -------------------- | ---------- |
| `id`                 | UUID        | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `user_id`            | UUID        | sim      | —                   | FK → `auth.users.id` | —          |
| `session_token`      | TEXT        | sim      | —                   | —                    | —          |
| `ip_address`         | TEXT        | sim      | —                   | —                    | —          |
| `user_agent`         | TEXT        | sim      | —                   | —                    | —          |
| `device_info`        | JSONB       | sim      | `'{}'`              | —                    | —          |
| `last_activity`      | TIMESTAMPTZ | sim      | `NOW()`             | —                    | —          |
| `created_at`         | TIMESTAMPTZ | sim      | `NOW()`             | —                    | —          |
| `expires_at`         | TIMESTAMPTZ | sim      | —                   | —                    | —          |
| `refresh_count`      | INTEGER     | sim      | `0`                 | —                    | —          |
| `last_refresh_at`    | TIMESTAMPTZ | sim      | —                   | —                    | —          |
| `max_lifetime_hours` | INTEGER     | sim      | `24`                | —                    | —          |

### `activities`

**RLS habilitada** · 6 policies: `Admins can view deleted activities`, `Users can read own activities or admins all`, `Users can insert own activities`, `Users can update own activities`, `Users can delete own activities`, `Users can view own activities`

| Coluna                | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| --------------------- | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`                  | UUID                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `sale_id`             | UUID                     | sim      | —                   | FK → `sales.id`       | —          |
| `salesperson_id`      | UUID                     | sim      | —                   | FK → `salespeople.id` | —          |
| `activity_type`       | TEXT                     | NOT NULL | —                   | —                     | —          |
| `outcome`             | TEXT                     | sim      | —                   | —                     | —          |
| `notes`               | TEXT                     | sim      | —                   | —                     | —          |
| `duration_minutes`    | INTEGER                  | sim      | —                   | —                     | —          |
| `contact_name`        | TEXT                     | sim      | —                   | —                     | —          |
| `created_at`          | TIMESTAMPTZ              | NOT NULL | `now()`             | —                     | —          |
| `deleted_at`          | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                     | —          |
| `deleted_by`          | UUID                     | sim      | —                   | —                     | —          |
| `delete_reason`       | TEXT                     | sim      | —                   | —                     | —          |
| `client_id`           | UUID                     | sim      | —                   | FK → `clients.id`     | —          |
| `lead_status`         | TEXT                     | sim      | `'prospect'`        | —                     | —          |
| `mql_qualified_at`    | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                     | —          |
| `qualification_score` | INTEGER                  | sim      | `0`                 | —                     | —          |

### `activity_audit_logs`

**RLS habilitada** · 1 policies: `Users can view audit logs for their activities`

| Coluna        | Tipo                     | Nulo     | Default             | Constraints          | Comentário |
| ------------- | ------------------------ | -------- | ------------------- | -------------------- | ---------- |
| `id`          | UUID                     | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `activity_id` | UUID                     | NOT NULL | —                   | FK → `activities.id` | —          |
| `changed_by`  | UUID                     | sim      | —                   | FK → `auth.users.id` | —          |
| `old_data`    | JSONB                    | sim      | —                   | —                    | —          |
| `new_data`    | JSONB                    | sim      | —                   | —                    | —          |
| `action`      | TEXT                     | NOT NULL | —                   | —                    | —          |
| `created_at`  | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                    | —          |

### `activity_goals`

**RLS habilitada** · 4 policies: `Users can insert own activity_goals`, `Users can update own activity_goals`, `Admins can delete activity_goals`, `Users can view own activity_goals or admin`

| Coluna           | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id` | UUID                     | sim      | —                   | FK → `salespeople.id` | —          |
| `calls_goal`     | INTEGER                  | NOT NULL | `0`                 | —                     | —          |
| `emails_goal`    | INTEGER                  | NOT NULL | `0`                 | —                     | —          |
| `meetings_goal`  | INTEGER                  | NOT NULL | `0`                 | —                     | —          |
| `linkedin_goal`  | INTEGER                  | NOT NULL | `0`                 | —                     | —          |
| `whatsapp_goal`  | INTEGER                  | NOT NULL | `0`                 | —                     | —          |
| `created_at`     | TIMESTAMPTZ              | NOT NULL | `now()`             | —                     | —          |
| `updated_at`     | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |

### `agenda_events`

**RLS habilitada** · 2 policies: `Salespeople manage own agenda events`, `Admins/Managers view all agenda events`

| Coluna                    | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ------------------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`                      | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id`          | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `sale_id`                 | UUID        | sim      | —                   | FK → `sales.id`       | —          |
| `client_id`               | UUID        | sim      | —                   | FK → `clients.id`     | —          |
| `title`                   | TEXT        | NOT NULL | —                   | —                     | —          |
| `description`             | TEXT        | sim      | —                   | —                     | —          |
| `event_type`              | TEXT        | NOT NULL | `'reminder'`        | —                     | —          |
| `status`                  | TEXT        | NOT NULL | `'pending'`         | —                     | —          |
| `priority`                | TEXT        | NOT NULL | `'medium'`          | —                     | —          |
| `scheduled_at`            | TIMESTAMPTZ | NOT NULL | —                   | —                     | —          |
| `completed_at`            | TIMESTAMPTZ | sim      | —                   | —                     | —          |
| `reminder_minutes_before` | INTEGER     | sim      | `15`                | —                     | —          |
| `created_at`              | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `updated_at`              | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |

### `ai_agent_actions`

**RLS habilitada** · 2 policies: `View actions of accessible runs`, `Insert actions of own runs`

| Coluna        | Tipo        | Nulo     | Default             | Constraints             | Comentário |
| ------------- | ----------- | -------- | ------------------- | ----------------------- | ---------- |
| `id`          | uuid        | NOT NULL | `gen_random_uuid()` | PK                      | —          |
| `run_id`      | uuid        | NOT NULL | —                   | FK → `ai_agent_runs.id` | —          |
| `step_index`  | integer     | NOT NULL | —                   | —                       | —          |
| `tool_name`   | text        | NOT NULL | —                   | —                       | —          |
| `tool_input`  | jsonb       | NOT NULL | `'{}'::jsonb`       | —                       | —          |
| `tool_output` | jsonb       | sim      | —                   | —                       | —          |
| `status`      | text        | NOT NULL | `'success'`         | —                       | —          |
| `executed_by` | text        | NOT NULL | `'ai'`              | —                       | —          |
| `executed_at` | timestamptz | NOT NULL | `now()`             | —                       | —          |

### `ai_agent_runs`

**RLS habilitada** · 2 policies: `Salespeople view own agent runs`, `System manages agent runs`

| Coluna               | Tipo        | Nulo     | Default             | Constraints | Comentário |
| -------------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`                 | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `salesperson_id`     | uuid        | NOT NULL | —                   | —           | —          |
| `agent_type`         | text        | NOT NULL | —                   | —           | —          |
| `goal`               | text        | sim      | —                   | —           | —          |
| `target_entity_type` | text        | sim      | —                   | —           | —          |
| `target_entity_id`   | uuid        | sim      | —                   | —           | —          |
| `status`             | text        | NOT NULL | `'pending'`         | —           | —          |
| `steps`              | jsonb       | NOT NULL | `'[]'::jsonb`       | —           | —          |
| `result`             | jsonb       | sim      | —                   | —           | —          |
| `requires_approval`  | boolean     | NOT NULL | `true`              | —           | —          |
| `approved_by`        | uuid        | sim      | —                   | —           | —          |
| `error_message`      | text        | sim      | —                   | —           | —          |
| `created_at`         | timestamptz | NOT NULL | `now()`             | —           | —          |
| `updated_at`         | timestamptz | NOT NULL | `now()`             | —           | —          |
| `completed_at`       | timestamptz | sim      | —                   | —           | —          |

### `ai_narrative_cache`

**RLS habilitada** · 2 policies: `Authenticated users can read cache`, `Service role manages cache`

| Coluna           | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `cache_key`      | TEXT        | NOT NULL | —                   | UNIQUE      | —          |
| `narrative_type` | TEXT        | NOT NULL | —                   | —           | —          |
| `payload_hash`   | TEXT        | NOT NULL | —                   | —           | —          |
| `narrative`      | TEXT        | NOT NULL | —                   | —           | —          |
| `model`          | TEXT        | sim      | —                   | —           | —          |
| `tokens_input`   | INTEGER     | sim      | —                   | —           | —          |
| `tokens_output`  | INTEGER     | sim      | —                   | —           | —          |
| `hit_count`      | INTEGER     | NOT NULL | `0`                 | —           | —          |
| `expires_at`     | TIMESTAMPTZ | NOT NULL | —                   | —           | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `updated_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `ai_sales_insights`

**RLS habilitada** · 1 policies: `Users can view insights for their sales`

| Coluna             | Tipo                     | Nulo     | Default             | Constraints     | Comentário |
| ------------------ | ------------------------ | -------- | ------------------- | --------------- | ---------- |
| `id`               | UUID                     | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `sale_id`          | UUID                     | sim      | —                   | FK → `sales.id` | —          |
| `insight_type`     | TEXT                     | NOT NULL | —                   | —               | —          |
| `insight_content`  | JSONB                    | NOT NULL | —                   | —               | —          |
| `confidence_score` | FLOAT                    | sim      | `0`                 | —               | —          |
| `created_at`       | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —               | —          |

### `api_tokens`

**RLS habilitada** · 1 policies: `Admins can manage API tokens`

| Coluna         | Tipo        | Nulo     | Default             | Constraints     | Comentário |
| -------------- | ----------- | -------- | ------------------- | --------------- | ---------- |
| `id`           | uuid        | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `token`        | text        | NOT NULL | —                   | UNIQUE          | —          |
| `company_name` | text        | NOT NULL | `'Default'`         | —               | —          |
| `team_id`      | uuid        | sim      | —                   | FK → `teams.id` | —          |
| `created_by`   | uuid        | NOT NULL | —                   | —               | —          |
| `is_active`    | boolean     | NOT NULL | `true`              | —               | —          |
| `last_used_at` | timestamptz | sim      | —                   | —               | —          |
| `usage_count`  | integer     | NOT NULL | `0`                 | —               | —          |
| `created_at`   | timestamptz | NOT NULL | `now()`             | —               | —          |
| `expires_at`   | timestamptz | sim      | —                   | —               | —          |

### `approval_decisions`

**RLS habilitada** · 2 policies: `Users can view decisions on their requests`, `Admins and managers can create decisions`

| Coluna        | Tipo        | Nulo     | Default             | Constraints                 | Comentário |
| ------------- | ----------- | -------- | ------------------- | --------------------------- | ---------- |
| `id`          | UUID        | NOT NULL | `gen_random_uuid()` | PK                          | —          |
| `request_id`  | UUID        | NOT NULL | —                   | FK → `approval_requests.id` | —          |
| `approver_id` | UUID        | NOT NULL | —                   | FK → `auth.users.id`        | —          |
| `decision`    | TEXT        | NOT NULL | —                   | —                           | —          |
| `comments`    | TEXT        | sim      | —                   | —                           | —          |
| `level`       | INTEGER     | NOT NULL | `1`                 | —                           | —          |
| `decided_at`  | TIMESTAMPTZ | NOT NULL | `now()`             | —                           | —          |

### `approval_requests`

**RLS habilitada** · 3 policies: `Users can view own requests`, `Users can create requests`, `Admins and managers can update requests`

| Coluna                | Tipo          | Nulo     | Default             | Constraints                  | Comentário |
| --------------------- | ------------- | -------- | ------------------- | ---------------------------- | ---------- |
| `id`                  | UUID          | NOT NULL | `gen_random_uuid()` | PK                           | —          |
| `workflow_id`         | UUID          | NOT NULL | —                   | FK → `approval_workflows.id` | —          |
| `requester_id`        | UUID          | NOT NULL | —                   | FK → `auth.users.id`         | —          |
| `deal_id`             | UUID          | sim      | —                   | FK → `sales.id`              | —          |
| `deal_name`           | TEXT          | sim      | —                   | —                            | —          |
| `requested_value`     | NUMERIC(12,2) | NOT NULL | —                   | —                            | —          |
| `original_value`      | NUMERIC(12,2) | sim      | —                   | —                            | —          |
| `discount_percentage` | NUMERIC(5,2)  | sim      | —                   | —                            | —          |
| `justification`       | TEXT          | sim      | —                   | —                            | —          |
| `status`              | TEXT          | NOT NULL | `'pending'`         | —                            | —          |
| `current_level`       | INTEGER       | NOT NULL | `1`                 | —                            | —          |
| `expires_at`          | TIMESTAMPTZ   | sim      | —                   | —                            | —          |
| `resolved_at`         | TIMESTAMPTZ   | sim      | —                   | —                            | —          |
| `created_at`          | TIMESTAMPTZ   | NOT NULL | `now()`             | —                            | —          |
| `updated_at`          | TIMESTAMPTZ   | NOT NULL | `now()`             | —                            | —          |

### `approval_workflows`

**RLS habilitada** · 2 policies: `Authenticated users can view active workflows`, `Admins and managers can manage workflows`

| Coluna                        | Tipo          | Nulo     | Default             | Constraints          | Comentário |
| ----------------------------- | ------------- | -------- | ------------------- | -------------------- | ---------- |
| `id`                          | UUID          | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `name`                        | TEXT          | NOT NULL | —                   | —                    | —          |
| `workflow_type`               | TEXT          | NOT NULL | `'discount'`        | —                    | —          |
| `description`                 | TEXT          | sim      | —                   | —                    | —          |
| `threshold_amount`            | NUMERIC(12,2) | sim      | —                   | —                    | —          |
| `threshold_percentage`        | NUMERIC(5,2)  | sim      | —                   | —                    | —          |
| `required_approvers`          | INTEGER       | NOT NULL | `1`                 | —                    | —          |
| `auto_approve_below`          | NUMERIC(12,2) | sim      | —                   | —                    | —          |
| `is_active`                   | BOOLEAN       | NOT NULL | `true`              | —                    | —          |
| `created_by`                  | UUID          | sim      | —                   | FK → `auth.users.id` | —          |
| `created_at`                  | TIMESTAMPTZ   | NOT NULL | `now()`             | —                    | —          |
| `updated_at`                  | TIMESTAMPTZ   | NOT NULL | `now()`             | —                    | —          |
| `min_mrr_threshold`           | NUMERIC(15,2) | sim      | —                   | —                    | —          |
| `auto_approve_below_discount` | NUMERIC(5,2)  | sim      | —                   | —                    | —          |

### `asset_usage_logs`

**RLS habilitada** · 2 policies: `Users insert own usage logs`, `Users see own logs, managers see all`

| Coluna           | Tipo        | Nulo     | Default             | Constraints                       | Comentário |
| ---------------- | ----------- | -------- | ------------------- | --------------------------------- | ---------- |
| `id`             | uuid        | NOT NULL | `gen_random_uuid()` | PK                                | —          |
| `asset_id`       | uuid        | NOT NULL | —                   | FK → `sales_enablement_assets.id` | —          |
| `salesperson_id` | uuid        | sim      | —                   | —                                 | —          |
| `user_id`        | uuid        | NOT NULL | —                   | —                                 | —          |
| `action`         | text        | NOT NULL | `'view'`            | —                                 | —          |
| `deal_id`        | uuid        | sim      | —                   | —                                 | —          |
| `metadata`       | jsonb       | sim      | `'{}'::jsonb`       | —                                 | —          |
| `created_at`     | timestamptz | NOT NULL | `now()`             | —                                 | —          |

### `audit_log`

**RLS habilitada** · 2 policies: `Users can view own audit logs`, `Admins can view all audit logs`

| Coluna          | Tipo                     | Nulo     | Default              | Constraints          | Comentário |
| --------------- | ------------------------ | -------- | -------------------- | -------------------- | ---------- |
| `id`            | UUID                     | NOT NULL | `uuid_generate_v4()` | PK                   | —          |
| `table_name`    | TEXT                     | NOT NULL | —                    | —                    | —          |
| `record_id`     | TEXT                     | NOT NULL | —                    | —                    | —          |
| `action`        | TEXT                     | NOT NULL | —                    | —                    | —          |
| `old_data`      | JSONB                    | sim      | —                    | —                    | —          |
| `new_data`      | JSONB                    | sim      | —                    | —                    | —          |
| `user_id`       | UUID                     | sim      | —                    | FK → `auth.users.id` | —          |
| `created_at`    | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —                    | —          |
| `resource_type` | TEXT                     | NOT NULL | —                    | —                    | —          |
| `resource_id`   | TEXT                     | sim      | —                    | —                    | —          |
| `ip_address`    | INET                     | sim      | —                    | —                    | —          |
| `user_agent`    | TEXT                     | sim      | —                    | —                    | —          |
| `old_values`    | JSONB                    | sim      | —                    | —                    | —          |
| `new_values`    | JSONB                    | sim      | —                    | —                    | —          |

### `audit_logs`

**RLS habilitada** · 1 policies: `Users can insert own audit entries`

| Coluna        | Tipo                     | Nulo     | Default             | Constraints          | Comentário |
| ------------- | ------------------------ | -------- | ------------------- | -------------------- | ---------- |
| `id`          | UUID                     | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `actor_id`    | UUID                     | sim      | —                   | —                    | —          |
| `actor_email` | TEXT                     | sim      | —                   | —                    | —          |
| `action`      | TEXT                     | NOT NULL | —                   | —                    | —          |
| `entity_type` | TEXT                     | NOT NULL | —                   | —                    | —          |
| `entity_id`   | TEXT                     | sim      | —                   | —                    | —          |
| `changes`     | JSONB                    | sim      | `'{}'::jsonb`       | —                    | —          |
| `ip_address`  | TEXT                     | sim      | —                   | —                    | —          |
| `user_agent`  | TEXT                     | sim      | —                   | —                    | —          |
| `metadata`    | JSONB                    | sim      | `'{}'::jsonb`       | —                    | —          |
| `created_at`  | TIMESTAMPTZ              | NOT NULL | `now()`             | —                    | —          |
| `table_name`  | TEXT                     | NOT NULL | —                   | —                    | —          |
| `record_id`   | UUID                     | NOT NULL | —                   | —                    | —          |
| `old_data`    | JSONB                    | sim      | —                   | —                    | —          |
| `new_data`    | JSONB                    | sim      | —                   | —                    | —          |
| `changed_by`  | UUID                     | sim      | —                   | FK → `auth.users.id` | —          |
| `changed_at`  | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                    | —          |

### `auto_task_queue_settings`

**RLS habilitada** · 2 policies: `auto_task_queue_settings_read_auth`, `auto_task_queue_settings_admin_write`

| Coluna                      | Tipo        | Nulo     | Default               | Constraints | Comentário |
| --------------------------- | ----------- | -------- | --------------------- | ----------- | ---------- |
| `id`                        | UUID        | NOT NULL | `gen_random_uuid()`   | PK          | —          |
| `singleton`                 | BOOLEAN     | NOT NULL | `true`                | UNIQUE      | —          |
| `enabled`                   | BOOLEAN     | NOT NULL | `false`               | —           | —          |
| `cutoff_time`               | TIME        | NOT NULL | `'09:00'`             | —           | —          |
| `timezone`                  | TEXT        | NOT NULL | `'America/Sao_Paulo'` | —           | —          |
| `min_urgency`               | TEXT        | NOT NULL | `'high'`              | —           | —          |
| `max_tasks_per_salesperson` | INTEGER     | NOT NULL | `5`                   | —           | —          |
| `last_run_date`             | DATE        | sim      | —                     | —           | —          |
| `last_run_created_count`    | INTEGER     | sim      | —                     | —           | —          |
| `created_at`                | TIMESTAMPTZ | NOT NULL | `now()`               | —           | —          |
| `updated_at`                | TIMESTAMPTZ | NOT NULL | `now()`               | —           | —          |

### `automation_runs`

**RLS habilitada** · 2 policies: `Authenticated users can view runs`, `automation_runs_select_admin_manager`

| Coluna             | Tipo        | Nulo     | Default             | Constraints                    | Comentário |
| ------------------ | ----------- | -------- | ------------------- | ------------------------------ | ---------- |
| `id`               | UUID        | NOT NULL | `gen_random_uuid()` | PK                             | —          |
| `workflow_id`      | UUID        | NOT NULL | —                   | FK → `automation_workflows.id` | —          |
| `status`           | TEXT        | NOT NULL | `'success'`         | —                              | —          |
| `trigger_payload`  | JSONB       | sim      | `'{}'::jsonb`       | —                              | —          |
| `actions_executed` | JSONB       | sim      | `'[]'::jsonb`       | —                              | —          |
| `error_message`    | TEXT        | sim      | —                   | —                              | —          |
| `duration_ms`      | INTEGER     | sim      | —                   | —                              | —          |
| `started_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —                              | —          |
| `completed_at`     | TIMESTAMPTZ | sim      | —                   | —                              | —          |

### `automation_workflows`

**RLS habilitada** · 1 policies: `Admins/managers manage workflows`

| Coluna           | Tipo        | Nulo     | Default             | Constraints          | Comentário |
| ---------------- | ----------- | -------- | ------------------- | -------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `name`           | TEXT        | NOT NULL | —                   | —                    | —          |
| `description`    | TEXT        | sim      | —                   | —                    | —          |
| `trigger_type`   | TEXT        | NOT NULL | —                   | —                    | —          |
| `trigger_config` | JSONB       | NOT NULL | `'{}'::jsonb`       | —                    | —          |
| `conditions`     | JSONB       | NOT NULL | `'[]'::jsonb`       | —                    | —          |
| `actions`        | JSONB       | NOT NULL | `'[]'::jsonb`       | —                    | —          |
| `is_active`      | BOOLEAN     | NOT NULL | `true`              | —                    | —          |
| `created_by`     | UUID        | sim      | —                   | FK → `auth.users.id` | —          |
| `run_count`      | INTEGER     | NOT NULL | `0`                 | —                    | —          |
| `last_run_at`    | TIMESTAMPTZ | sim      | —                   | —                    | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                    | —          |
| `updated_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                    | —          |

### `available_spins`

**RLS habilitada** · 2 policies: `Users can view own or admin can view all spins`, `Users can view their own spins`

| Coluna           | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `spins_count`    | INTEGER     | NOT NULL | `0`                 | —                     | —          |
| `updated_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |

### `battle_participants`

**RLS habilitada** · 2 policies: `Admins can update participants`, `Users can join battles as self`

| Coluna           | Tipo        | Nulo     | Default             | Constraints             | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ----------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                      | —          |
| `battle_id`      | UUID        | NOT NULL | —                   | FK → `sales_battles.id` | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id`   | —          |
| `team_name`      | TEXT        | sim      | —                   | —                       | —          |
| `current_score`  | INTEGER     | NOT NULL | `0`                 | —                       | —          |
| `joined_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                       | —          |

### `bitrix24_sync_logs`

**RLS habilitada** · 1 policies: `Admins and managers can view sync logs`

| Coluna                  | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ----------------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`                    | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `sync_type`             | TEXT                     | NOT NULL | `'sync-all'`        | —           | —          |
| `status`                | TEXT                     | NOT NULL | `'success'`         | —           | —          |
| `companies_from_bitrix` | INTEGER                  | sim      | `0`                 | —           | —          |
| `companies_to_bitrix`   | INTEGER                  | sim      | `0`                 | —           | —          |
| `deals_from_bitrix`     | INTEGER                  | sim      | `0`                 | —           | —          |
| `deals_to_bitrix`       | INTEGER                  | sim      | `0`                 | —           | —          |
| `error_message`         | TEXT                     | sim      | —                   | —           | —          |
| `duration_ms`           | INTEGER                  | sim      | —                   | —           | —          |
| `triggered_by`          | TEXT                     | sim      | `'manual'`          | —           | —          |
| `created_at`            | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |

### `blocked_ips`

**RLS habilitada** · 1 policies: `Admins can manage blocked_ips`

| Coluna         | Tipo        | Nulo     | Default             | Constraints          | Comentário |
| -------------- | ----------- | -------- | ------------------- | -------------------- | ---------- |
| `id`           | UUID        | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `ip_address`   | TEXT        | NOT NULL | —                   | UNIQUE               | —          |
| `reason`       | TEXT        | NOT NULL | —                   | —                    | —          |
| `blocked_by`   | UUID        | sim      | —                   | FK → `auth.users.id` | —          |
| `blocked_at`   | TIMESTAMPTZ | sim      | `NOW()`             | —                    | —          |
| `expires_at`   | TIMESTAMPTZ | sim      | —                   | —                    | —          |
| `is_permanent` | BOOLEAN     | sim      | `FALSE`             | —                    | —          |
| `block_count`  | INTEGER     | sim      | `1`                 | —                    | —          |
| `created_at`   | TIMESTAMPTZ | sim      | `NOW()`             | —                    | —          |
| `updated_at`   | TIMESTAMPTZ | sim      | `NOW()`             | —                    | —          |

### `buying_committee`

**RLS habilitada** · 2 policies: `Users can view committee for their sales`, `Users can manage committee for their sales`

| Coluna         | Tipo                    | Nulo     | Default             | Constraints     | Comentário |
| -------------- | ----------------------- | -------- | ------------------- | --------------- | ---------- |
| `id`           | UUID                    | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `sale_id`      | UUID                    | sim      | —                   | FK → `sales.id` | —          |
| `contact_name` | TEXT                    | NOT NULL | —                   | —               | —          |
| `role`         | TEXT                    | NOT NULL | —                   | —               | —          |
| `decision`     | Maker                   | sim      | —                   | —               | —          |
| `economic`     | Buyer                   | sim      | —                   | —               | —          |
| `technical`    | Buyer                   | sim      | —                   | —               | —          |
| `influencer`   | sentiment TEXT          | sim      | `'neutral'`         | —               | —          |
| `negative`     | influence_level INTEGER | sim      | `3`                 | —               | —          |
| `notes`        | TEXT                    | sim      | —                   | —               | —          |
| `created_at`   | TIMESTAMPTZ             | sim      | `now()`             | —               | —          |
| `updated_at`   | TIMESTAMPTZ             | sim      | `now()`             | —               | —          |

### `buying_committee_members`

**RLS habilitada** · 0 policies

| Coluna               | Tipo        | Nulo     | Default             | Constraints     | Comentário |
| -------------------- | ----------- | -------- | ------------------- | --------------- | ---------- |
| `id`                 | uuid        | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `sale_id`            | uuid        | NOT NULL | —                   | FK → `sales.id` | —          |
| `contact_name`       | text        | NOT NULL | —                   | —               | —          |
| `contact_email`      | text        | sim      | —                   | —               | —          |
| `job_title`          | text        | sim      | —                   | —               | —          |
| `committee_role`     | text        | NOT NULL | `'user'`            | —               | —          |
| `influence_level`    | integer     | NOT NULL | `3`                 | —               | —          |
| `sentiment`          | text        | NOT NULL | `'neutral'`         | —               | —          |
| `is_single_threaded` | boolean     | sim      | `false`             | —               | —          |
| `notes`              | text        | sim      | —                   | —               | —          |
| `created_by`         | uuid        | sim      | —                   | —               | —          |
| `created_at`         | timestamptz | NOT NULL | `now()`             | —               | —          |
| `updated_at`         | timestamptz | NOT NULL | `now()`             | —               | —          |

### `buying_signals`

**RLS habilitada** · 1 policies: `Admins e Managers podem ver sinais de compra`

| Coluna               | Tipo                     | Nulo     | Default             | Constraints                             | Comentário |
| -------------------- | ------------------------ | -------- | ------------------- | --------------------------------------- | ---------- |
| `id`                 | UUID                     | NOT NULL | `gen_random_uuid()` | PK                                      | —          |
| `company_id`         | UUID                     | sim      | —                   | FK → `enriched_company_intelligence.id` | —          |
| `signal_type`        | TEXT                     | NOT NULL | —                   | —                                       | —          |
| `source_url`         | TEXT                     | sim      | —                   | —                                       | —          |
| `significance_score` | INTEGER                  | sim      | —                   | —                                       | —          |
| `occurred_at`        | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                                       | —          |
| `created_at`         | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                                       | —          |

### `cadence_ab_assignments`

**RLS habilitada** · 2 policies: `Authenticated can view ab assignments`, `Admins/managers manage ab assignments`

| Coluna                | Tipo        | Nulo     | Default             | Constraints                 | Comentário |
| --------------------- | ----------- | -------- | ------------------- | --------------------------- | ---------- |
| `id`                  | UUID        | NOT NULL | `gen_random_uuid()` | PK                          | —          |
| `ab_test_id`          | UUID        | NOT NULL | —                   | FK → `cadence_ab_tests.id`  | —          |
| `prospect_cadence_id` | UUID        | NOT NULL | —                   | FK → `prospect_cadences.id` | —          |
| `variant`             | TEXT        | NOT NULL | —                   | —                           | —          |
| `assigned_at`         | TIMESTAMPTZ | NOT NULL | `now()`             | —                           | —          |

### `cadence_ab_tests`

**RLS habilitada** · 2 policies: `Authenticated can view ab tests`, `Admins/managers manage ab tests`

| Coluna           | Tipo        | Nulo     | Default             | Constraints        | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ------------------ | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                 | —          |
| `name`           | TEXT        | NOT NULL | —                   | —                  | —          |
| `description`    | TEXT        | sim      | —                   | —                  | —          |
| `variant_a_id`   | UUID        | NOT NULL | —                   | FK → `cadences.id` | —          |
| `variant_b_id`   | UUID        | NOT NULL | —                   | FK → `cadences.id` | —          |
| `traffic_split`  | INTEGER     | NOT NULL | `50`                | —                  | —          |
| `status`         | TEXT        | NOT NULL | `'draft'`           | —                  | —          |
| `hypothesis`     | TEXT        | sim      | —                   | —                  | —          |
| `winner_variant` | TEXT        | sim      | —                   | —                  | —          |
| `started_at`     | TIMESTAMPTZ | sim      | —                   | —                  | —          |
| `ended_at`       | TIMESTAMPTZ | sim      | —                   | —                  | —          |
| `created_by`     | UUID        | sim      | —                   | —                  | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                  | —          |
| `updated_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                  | —          |

### `cadence_advanced_stats`

**RLS habilitada** · 1 policies: `Leitura pública autenticada para stats`

| Coluna           | Tipo                     | Nulo     | Default             | Constraints        | Comentário |
| ---------------- | ------------------------ | -------- | ------------------- | ------------------ | ---------- |
| `id`             | UUID                     | NOT NULL | `gen_random_uuid()` | PK                 | —          |
| `cadence_id`     | UUID                     | sim      | —                   | FK → `cadences.id` | —          |
| `click_rate`     | DECIMAL                  | sim      | `0`                 | —                  | —          |
| `bookings_count` | INTEGER                  | sim      | `0`                 | —                  | —          |
| `recorded_at`    | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                  | —          |

### `cadence_alert_templates`

**RLS habilitada** · 1 policies: `Authenticated read for alert templates`

| Coluna         | Tipo                     | Nulo     | Default               | Constraints | Comentário |
| -------------- | ------------------------ | -------- | --------------------- | ----------- | ---------- |
| `id`           | UUID                     | NOT NULL | `gen_random_uuid()`   | PK          | —          |
| `name`         | TEXT                     | NOT NULL | —                     | —           | —          |
| `type`         | TEXT                     | NOT NULL | —                     | —           | —          |
| `subject`      | TEXT                     | sim      | —                     | —           | —          |
| `content`      | TEXT                     | NOT NULL | —                     | —           | —          |
| `is_default`   | BOOLEAN                  | sim      | `false`               | —           | —          |
| `created_at`   | TIMESTAMP WITH TIME ZONE | sim      | `now()`               | —           | —          |
| `updated_at`   | TIMESTAMP WITH TIME ZONE | sim      | `now()`               | —           | —          |
| `start_time`   | TIME                     | sim      | `'09:00:00'`          | —           | —          |
| `end_time`     | TIME                     | sim      | `'18:00:00'`          | —           | —          |
| `days_of_week` | TEXT[]                   | sim      | `ARRAY['Monday'`      | —           | —          |
| `timezone`     | TEXT                     | sim      | `'America/Sao_Paulo'` | —           | —          |

### `cadence_enrollment_rules`

**RLS habilitada** · 2 policies: `Authenticated can view enrollment rules`, `Admins/managers can manage enrollment rules`

| Coluna             | Tipo          | Nulo     | Default             | Constraints        | Comentário |
| ------------------ | ------------- | -------- | ------------------- | ------------------ | ---------- |
| `id`               | UUID          | NOT NULL | `gen_random_uuid()` | PK                 | —          |
| `cadence_id`       | UUID          | NOT NULL | —                   | FK → `cadences.id` | —          |
| `name`             | TEXT          | NOT NULL | —                   | —                  | —          |
| `description`      | TEXT          | sim      | —                   | —                  | —          |
| `is_active`        | BOOLEAN       | NOT NULL | `true`              | —                  | —          |
| `priority`         | INTEGER       | NOT NULL | `100`               | —                  | —          |
| `trigger_stage`    | TEXT          | sim      | —                   | —                  | —          |
| `trigger_category` | TEXT          | sim      | —                   | —                  | —          |
| `trigger_source`   | TEXT          | sim      | —                   | —                  | —          |
| `min_amount`       | NUMERIC(12,2) | sim      | —                   | —                  | —          |
| `max_amount`       | NUMERIC(12,2) | sim      | —                   | —                  | —          |
| `created_by`       | UUID          | sim      | —                   | —                  | —          |
| `created_at`       | TIMESTAMPTZ   | NOT NULL | `now()`             | —                  | —          |
| `updated_at`       | TIMESTAMPTZ   | NOT NULL | `now()`             | —                  | —          |

### `cadence_enrollments`

**RLS habilitada** · 0 policies

| Coluna         | Tipo                     | Nulo     | Default              | Constraints        | Comentário |
| -------------- | ------------------------ | -------- | -------------------- | ------------------ | ---------- |
| `id`           | UUID                     | NOT NULL | `uuid_generate_v4()` | PK                 | —          |
| `cadence_id`   | UUID                     | NOT NULL | —                    | FK → `cadences.id` | —          |
| `client_id`    | UUID                     | NOT NULL | —                    | FK → `clients.id`  | —          |
| `current_step` | INTEGER                  | sim      | `0`                  | —                  | —          |
| `status`       | TEXT                     | sim      | `'active'`           | —                  | —          |
| `enrolled_at`  | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —                  | —          |
| `completed_at` | TIMESTAMP WITH TIME ZONE | sim      | —                    | —                  | —          |

### `cadence_funnel_rules`

**RLS habilitada** · 2 policies: `Only admins can manage funnel rules`, `Authenticated users can view funnel rules`

| Coluna              | Tipo                     | Nulo     | Default             | Constraints        | Comentário |
| ------------------- | ------------------------ | -------- | ------------------- | ------------------ | ---------- |
| `id`                | UUID                     | NOT NULL | `gen_random_uuid()` | PK                 | —          |
| `cadence_id`        | UUID                     | sim      | —                   | FK → `cadences.id` | —          |
| `from_stage`        | TEXT                     | NOT NULL | —                   | —                  | —          |
| `to_stage`          | TEXT                     | NOT NULL | —                   | —                  | —          |
| `condition_type`    | TEXT                     | NOT NULL | —                   | —                  | —          |
| `condition_value`   | INTEGER                  | sim      | `1`                 | —                  | —          |
| `is_active`         | BOOLEAN                  | sim      | `true`              | —                  | —          |
| `created_at`        | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                  | —          |
| `updated_at`        | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                  | —          |
| `time_window_hours` | INTEGER                  | sim      | `24`                | —                  | —          |
| `notify_push`       | BOOLEAN                  | sim      | `false`             | —                  | —          |
| `notify_email`      | BOOLEAN                  | sim      | `false`             | —                  | —          |
| `alert_priority`    | TEXT                     | sim      | `'normal'`          | —                  | —          |

### `cadence_outcome_rules`

**RLS habilitada** · 1 policies: `Authenticated read for outcome rules`

| Coluna              | Tipo                     | Nulo     | Default               | Constraints                       | Comentário |
| ------------------- | ------------------------ | -------- | --------------------- | --------------------------------- | ---------- |
| `id`                | UUID                     | NOT NULL | `gen_random_uuid()`   | PK                                | —          |
| `outcome`           | TEXT                     | NOT NULL | —                     | —                                 | —          |
| `max_retries`       | INTEGER                  | sim      | `1`                   | —                                 | —          |
| `fallback_action`   | TEXT                     | sim      | —                     | —                                 | —          |
| `created_at`        | TIMESTAMP WITH TIME ZONE | sim      | `now()`               | —                                 | —          |
| `updated_at`        | TIMESTAMP WITH TIME ZONE | sim      | `now()`               | —                                 | —          |
| `push_template_id`  | UUID                     | sim      | —                     | FK → `cadence_alert_templates.id` | —          |
| `email_template_id` | UUID                     | sim      | —                     | FK → `cadence_alert_templates.id` | —          |
| `timezone`          | TEXT                     | sim      | `'America/Sao_Paulo'` | —                                 | —          |

### `cadence_steps`

**RLS habilitada** · 4 policies: `Authenticated users can read cadence_steps`, `Admins and managers can insert cadence_steps`, `Admins and managers can update cadence_steps`, `Admins and managers can delete cadence_steps`

| Coluna             | Tipo                     | Nulo     | Default              | Constraints        | Comentário |
| ------------------ | ------------------------ | -------- | -------------------- | ------------------ | ---------- |
| `id`               | UUID                     | NOT NULL | `uuid_generate_v4()` | PK                 | —          |
| `cadence_id`       | UUID                     | NOT NULL | —                    | FK → `cadences.id` | —          |
| `day_number`       | INTEGER                  | NOT NULL | `1`                  | —                  | —          |
| `action_type`      | TEXT                     | NOT NULL | —                    | —                  | —          |
| `title`            | TEXT                     | NOT NULL | —                    | —                  | —          |
| `description`      | TEXT                     | sim      | —                    | —                  | —          |
| `template_content` | TEXT                     | sim      | —                    | —                  | —          |
| `step_order`       | INTEGER                  | NOT NULL | —                    | —                  | —          |
| `created_at`       | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —                  | —          |
| `step_type`        | TEXT                     | NOT NULL | —                    | —                  | —          |
| `delay_days`       | INTEGER                  | NOT NULL | —                    | —                  | —          |
| `template`         | TEXT                     | sim      | —                    | —                  | —          |
| `needs_approval`   | BOOLEAN                  | sim      | `false`              | —                  | —          |
| `singu_variables`  | JSONB                    | sim      | `'[]'::jsonb`        | —                  | —          |
| `task_type`        | TEXT                     | sim      | `'manual'`           | —                  | —          |

### `cadence_tasks`

**RLS habilitada** · 4 policies: `Users can insert own cadence_tasks`, `Users can update own cadence_tasks`, `Users can delete own cadence_tasks`, `Users can view own cadence_tasks or admin`

| Coluna                | Tipo                     | Nulo     | Default             | Constraints                 | Comentário |
| --------------------- | ------------------------ | -------- | ------------------- | --------------------------- | ---------- |
| `id`                  | UUID                     | NOT NULL | `gen_random_uuid()` | PK                          | —          |
| `prospect_cadence_id` | UUID                     | NOT NULL | —                   | FK → `prospect_cadences.id` | —          |
| `cadence_step_id`     | UUID                     | NOT NULL | —                   | FK → `cadence_steps.id`     | —          |
| `scheduled_date`      | DATE                     | NOT NULL | —                   | —                           | —          |
| `status`              | TEXT                     | NOT NULL | `'pending'`         | —                           | —          |
| `completed_at`        | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                           | —          |
| `notes`               | TEXT                     | sim      | —                   | —                           | —          |
| `created_at`          | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                           | —          |
| `call_result`         | TEXT                     | sim      | —                   | —                           | —          |
| `task_type`           | TEXT                     | sim      | `'manual'`          | —                           | —          |

### `cadences`

**RLS habilitada** · 4 policies: `Authenticated users can read cadences`, `Admins and managers can insert cadences`, `Admins and managers can update cadences`, `Admins and managers can delete cadences`

| Coluna         | Tipo                     | Nulo     | Default              | Constraints          | Comentário |
| -------------- | ------------------------ | -------- | -------------------- | -------------------- | ---------- |
| `id`           | UUID                     | NOT NULL | `uuid_generate_v4()` | PK                   | —          |
| `name`         | TEXT                     | NOT NULL | —                    | —                    | —          |
| `description`  | TEXT                     | sim      | —                    | —                    | —          |
| `is_active`    | BOOLEAN                  | sim      | `true`               | —                    | —          |
| `created_at`   | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —                    | —          |
| `updated_at`   | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`              | —                    | —          |
| `created_by`   | UUID                     | sim      | —                    | FK → `auth.users.id` | —          |
| `cadence_type` | public.cadence_type      | NOT NULL | `'prospecting'`      | —                    | —          |

### `call_coaching_scorecards`

**RLS habilitada** · 2 policies: `ccs_read_authenticated`, `ccs_write_admin_manager`

| Coluna            | Tipo        | Nulo     | Default             | Constraints                        | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ---------------------------------- | ---------- |
| `id`              | uuid        | NOT NULL | `gen_random_uuid()` | PK                                 | —          |
| `recording_id`    | uuid        | NOT NULL | —                   | UNIQUE · FK → `call_recordings.id` | —          |
| `salesperson_id`  | uuid        | sim      | —                   | —                                  | —          |
| `overall_score`   | numeric     | NOT NULL | `0`                 | —                                  | —          |
| `talk_score`      | numeric     | NOT NULL | `0`                 | —                                  | —          |
| `question_score`  | numeric     | NOT NULL | `0`                 | —                                  | —          |
| `objection_score` | numeric     | NOT NULL | `0`                 | —                                  | —          |
| `sentiment_score` | numeric     | NOT NULL | `0`                 | —                                  | —          |
| `moments_score`   | numeric     | NOT NULL | `0`                 | —                                  | —          |
| `health`          | text        | NOT NULL | `'fair'`            | —                                  | —          |
| `top_strengths`   | jsonb       | NOT NULL | `'[]'::jsonb`       | —                                  | —          |
| `top_gaps`        | jsonb       | NOT NULL | `'[]'::jsonb`       | —                                  | —          |
| `recommendations` | jsonb       | NOT NULL | `'[]'::jsonb`       | —                                  | —          |
| `factors`         | jsonb       | NOT NULL | `'{}'::jsonb`       | —                                  | —          |
| `calculated_at`   | timestamptz | NOT NULL | `now()`             | —                                  | —          |

### `call_conversation_metrics`

**RLS habilitada** · 2 policies: `ccm_select_authenticated`, `ccm_write_admin_manager`

| Coluna                      | Tipo        | Nulo     | Default             | Constraints                        | Comentário |
| --------------------------- | ----------- | -------- | ------------------- | ---------------------------------- | ---------- |
| `id`                        | uuid        | NOT NULL | `gen_random_uuid()` | PK                                 | —          |
| `recording_id`              | uuid        | NOT NULL | —                   | UNIQUE · FK → `call_recordings.id` | —          |
| `seller_talk_ratio`         | numeric     | NOT NULL | `0`                 | —                                  | —          |
| `client_talk_ratio`         | numeric     | NOT NULL | `0`                 | —                                  | —          |
| `silence_ratio`             | numeric     | NOT NULL | `0`                 | —                                  | —          |
| `longest_monologue_seconds` | integer     | NOT NULL | `0`                 | —                                  | —          |
| `interruptions_count`       | integer     | NOT NULL | `0`                 | —                                  | —          |
| `seller_words_per_minute`   | integer     | NOT NULL | `0`                 | —                                  | —          |
| `client_words_per_minute`   | integer     | NOT NULL | `0`                 | —                                  | —          |
| `pace_score`                | numeric     | NOT NULL | `0`                 | —                                  | —          |
| `engagement_score`          | numeric     | NOT NULL | `0`                 | —                                  | —          |
| `health`                    | text        | NOT NULL | `'fair'`            | —                                  | —          |
| `factors`                   | jsonb       | NOT NULL | `'{}'::jsonb`       | —                                  | —          |
| `calculated_at`             | timestamptz | NOT NULL | `now()`             | —                                  | —          |

### `call_critical_moments`

**RLS habilitada** · 4 policies: `ccm_owner_read`, `ccm_owner_update`, `ccm_admin_delete`, `Users can view own critical moments`

| Coluna             | Tipo        | Nulo     | Default             | Constraints               | Comentário |
| ------------------ | ----------- | -------- | ------------------- | ------------------------- | ---------- |
| `id`               | uuid        | NOT NULL | `gen_random_uuid()` | PK                        | —          |
| `recording_id`     | uuid        | NOT NULL | —                   | FK → `call_recordings.id` | —          |
| `owner_id`         | uuid        | NOT NULL | —                   | —                         | —          |
| `salesperson_id`   | uuid        | NOT NULL | —                   | FK → `salespeople.id`     | —          |
| `moment_type`      | text        | NOT NULL | —                   | —                         | —          |
| `severity`         | text        | NOT NULL | `'medium'`          | —                         | —          |
| `timestamp_sec`    | integer     | NOT NULL | `0`                 | —                         | —          |
| `quote`            | text        | sim      | —                   | —                         | —          |
| `context`          | text        | sim      | —                   | —                         | —          |
| `suggested_action` | text        | sim      | —                   | —                         | —          |
| `status`           | text        | NOT NULL | `'new'`             | —                         | —          |
| `created_at`       | timestamptz | NOT NULL | `now()`             | —                         | —          |
| `updated_at`       | timestamptz | NOT NULL | `now()`             | —                         | —          |

### `call_insights`

**RLS habilitada** · 2 policies: `View insights via recording access`, `System inserts insights`

| Coluna                   | Tipo         | Nulo     | Default                     | Constraints               | Comentário |
| ------------------------ | ------------ | -------- | --------------------------- | ------------------------- | ---------- |
| `id`                     | UUID         | NOT NULL | `gen_random_uuid()`         | PK                        | —          |
| `recording_id`           | UUID         | NOT NULL | —                           | FK → `call_recordings.id` | —          |
| `sentiment_score`        | NUMERIC(4,3) | sim      | —                           | —                         | —          |
| `sentiment_label`        | TEXT         | sim      | —                           | —                         | —          |
| `talk_ratio_salesperson` | NUMERIC(5,2) | sim      | —                           | —                         | —          |
| `talk_ratio_client`      | NUMERIC(5,2) | sim      | —                           | —                         | —          |
| `topics`                 | JSONB        | sim      | `'[]'::jsonb`               | —                         | —          |
| `objections`             | JSONB        | sim      | `'[]'::jsonb`               | —                         | —          |
| `next_steps`             | JSONB        | sim      | `'[]'::jsonb`               | —                         | —          |
| `key_moments`            | JSONB        | sim      | `'[]'::jsonb`               | —                         | —          |
| `coaching_tips`          | JSONB        | sim      | `'[]'::jsonb`               | —                         | —          |
| `summary`                | TEXT         | sim      | —                           | —                         | —          |
| `questions_asked`        | INTEGER      | sim      | `0`                         | —                         | —          |
| `ai_model`               | TEXT         | sim      | `'google/gemini-2.5-flash'` | —                         | —          |
| `created_at`             | TIMESTAMPTZ  | NOT NULL | `now()`                     | —                         | —          |

### `call_intelligence_triggers`

**RLS habilitada** · 1 policies: `Allow read for all authenticated users`

| Coluna            | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ----------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`              | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `trigger_keyword` | TEXT                     | NOT NULL | —                   | —           | —          |
| `is_active`       | BOOLEAN                  | sim      | `true`              | —           | —          |
| `created_at`      | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —          |

### `call_logs`

**RLS habilitada** · 4 policies: `View call logs`, `Insert own call logs`, `Update own call logs`, `Delete own call logs`

| Coluna             | Tipo        | Nulo     | Default             | Constraints                  | Comentário |
| ------------------ | ----------- | -------- | ------------------- | ---------------------------- | ---------- |
| `id`               | uuid        | NOT NULL | `gen_random_uuid()` | PK                           | —          |
| `owner_id`         | uuid        | NOT NULL | —                   | —                            | —          |
| `sale_id`          | uuid        | sim      | —                   | FK → `sales.id`              | —          |
| `queue_item_id`    | uuid        | sim      | —                   | FK → `dialer_queue_items.id` | —          |
| `disposition`      | text        | NOT NULL | —                   | —                            | —          |
| `outcome`          | text        | sim      | —                   | —                            | —          |
| `duration_seconds` | integer     | sim      | `0`                 | —                            | —          |
| `notes`            | text        | sim      | —                   | —                            | —          |
| `next_action_at`   | timestamptz | sim      | —                   | —                            | —          |
| `created_at`       | timestamptz | NOT NULL | `now()`             | —                            | —          |
| `call_sid`         | TEXT        | sim      | —                   | —                            | —          |

### `call_metric_benchmarks`

**RLS habilitada** · 2 policies: `cmb_select_authenticated`, `cmb_write_admin`

| Coluna       | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------ | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`         | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `metric`     | text        | NOT NULL | —                   | UNIQUE      | —          |
| `p25`        | numeric     | NOT NULL | `0`                 | —           | —          |
| `p50`        | numeric     | NOT NULL | `0`                 | —           | —          |
| `p75`        | numeric     | NOT NULL | `0`                 | —           | —          |
| `target_min` | numeric     | NOT NULL | `0`                 | —           | —          |
| `target_max` | numeric     | NOT NULL | `0`                 | —           | —          |
| `updated_at` | timestamptz | NOT NULL | `now()`             | —           | —          |

### `call_objection_analysis`

**RLS habilitada** · 1 policies: `Admin/manager write objection analysis`

| Coluna                      | Tipo        | Nulo     | Default             | Constraints                        | Comentário |
| --------------------------- | ----------- | -------- | ------------------- | ---------------------------------- | ---------- |
| `id`                        | uuid        | NOT NULL | `gen_random_uuid()` | PK                                 | —          |
| `recording_id`              | uuid        | NOT NULL | —                   | UNIQUE · FK → `call_recordings.id` | —          |
| `total_objections`          | int         | NOT NULL | `0`                 | —                                  | —          |
| `resolved_count`            | int         | NOT NULL | `0`                 | —                                  | —          |
| `partially_resolved_count`  | int         | NOT NULL | `0`                 | —                                  | —          |
| `unresolved_count`          | int         | NOT NULL | `0`                 | —                                  | —          |
| `avg_response_time_seconds` | numeric     | NOT NULL | `0`                 | —                                  | —          |
| `handling_score`            | numeric     | NOT NULL | `0`                 | —                                  | —          |
| `health`                    | text        | NOT NULL | `'fair'`            | —                                  | —          |
| `factors`                   | jsonb       | NOT NULL | `'{}'::jsonb`       | —                                  | —          |
| `calculated_at`             | timestamptz | NOT NULL | `now()`             | —                                  | —          |

### `call_objections`

**RLS habilitada** · 2 policies: `Authenticated read call objections`, `Admin/manager write call objections`

| Coluna                 | Tipo        | Nulo     | Default             | Constraints               | Comentário |
| ---------------------- | ----------- | -------- | ------------------- | ------------------------- | ---------- |
| `id`                   | uuid        | NOT NULL | `gen_random_uuid()` | PK                        | —          |
| `recording_id`         | uuid        | NOT NULL | —                   | FK → `call_recordings.id` | —          |
| `client_turn_index`    | int         | NOT NULL | `0`                 | —                         | —          |
| `objection_text`       | text        | NOT NULL | —                   | —                         | —          |
| `objection_type`       | text        | NOT NULL | `'other'`           | —                         | —          |
| `seller_response_text` | text        | sim      | —                   | —                         | —          |
| `response_quality`     | text        | NOT NULL | `'ignored'`         | —                         | —          |
| `resolution_status`    | text        | NOT NULL | `'unresolved'`      | —                         | —          |
| `start_estimate`       | numeric     | NOT NULL | `0`                 | —                         | —          |
| `factors`              | jsonb       | NOT NULL | `'{}'::jsonb`       | —                         | —          |
| `created_at`           | timestamptz | NOT NULL | `now()`             | —                         | —          |

### `call_question_analysis`

**RLS habilitada** · 2 policies: `auth read question analysis`, `managers write question analysis`

| Coluna                | Tipo        | Nulo     | Default             | Constraints                        | Comentário |
| --------------------- | ----------- | -------- | ------------------- | ---------------------------------- | ---------- |
| `id`                  | UUID        | NOT NULL | `gen_random_uuid()` | PK                                 | —          |
| `recording_id`        | UUID        | NOT NULL | —                   | UNIQUE · FK → `call_recordings.id` | —          |
| `total_questions`     | INT         | NOT NULL | `0`                 | —                                  | —          |
| `open_questions`      | INT         | NOT NULL | `0`                 | —                                  | —          |
| `closed_questions`    | INT         | NOT NULL | `0`                 | —                                  | —          |
| `discovery_questions` | INT         | NOT NULL | `0`                 | —                                  | —          |
| `impact_questions`    | INT         | NOT NULL | `0`                 | —                                  | —          |
| `leading_questions`   | INT         | NOT NULL | `0`                 | —                                  | —          |
| `avg_depth`           | NUMERIC     | NOT NULL | `0`                 | —                                  | —          |
| `question_density`    | NUMERIC     | NOT NULL | `0`                 | —                                  | —          |
| `quality_score`       | NUMERIC     | NOT NULL | `0`                 | —                                  | —          |
| `health`              | TEXT        | NOT NULL | `'fair'`            | —                                  | —          |
| `factors`             | JSONB       | NOT NULL | `'{}'::jsonb`       | —                                  | —          |
| `calculated_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —                                  | —          |

### `call_questions`

**RLS habilitada** · 2 policies: `auth read questions`, `managers write questions`

| Coluna           | Tipo        | Nulo     | Default             | Constraints               | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ------------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                        | —          |
| `recording_id`   | UUID        | NOT NULL | —                   | FK → `call_recordings.id` | —          |
| `turn_index`     | INT         | NOT NULL | `0`                 | —                         | —          |
| `text`           | TEXT        | NOT NULL | —                   | —                         | —          |
| `category`       | TEXT        | NOT NULL | `'other'`           | —                         | —          |
| `depth`          | INT         | NOT NULL | `1`                 | —                         | —          |
| `start_estimate` | NUMERIC     | NOT NULL | `0`                 | —                         | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                         | —          |

### `call_recording_ingest_jobs`

**RLS habilitada** · 3 policies: `salesperson_can_read_own_ingest_jobs`, `salesperson_can_enqueue_own_ingest_jobs`, `admin_can_read_all_ingest_jobs`

| Coluna            | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `idempotency_key` | TEXT        | NOT NULL | —                   | UNIQUE      | —          |
| `recording_id`    | UUID        | NOT NULL | —                   | —           | —          |
| `salesperson_id`  | UUID        | NOT NULL | —                   | —           | —          |
| `payload`         | JSONB       | NOT NULL | —                   | —           | —          |
| `status`          | TEXT        | NOT NULL | `'pending'`         | —           | —          |
| `attempts`        | INTEGER     | NOT NULL | `0`                 | —           | —          |
| `max_attempts`    | INTEGER     | NOT NULL | `5`                 | —           | —          |
| `next_attempt_at` | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `locked_at`       | TIMESTAMPTZ | sim      | —                   | —           | —          |
| `locked_by`       | TEXT        | sim      | —                   | —           | —          |
| `last_error`      | TEXT        | sim      | —                   | —           | —          |
| `last_error_at`   | TIMESTAMPTZ | sim      | —                   | —           | —          |
| `completed_at`    | TIMESTAMPTZ | sim      | —                   | —           | —          |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `updated_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `call_recordings`

**RLS habilitada** · 4 policies: `Salespeople view own recordings`, `Salespeople create own recordings`, `Salespeople update own recordings`, `Admins delete recordings`

| Coluna                  | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ----------------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`                    | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id`        | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `sale_id`               | UUID        | sim      | —                   | FK → `sales.id`       | —          |
| `client_id`             | UUID        | sim      | —                   | FK → `clients.id`     | —          |
| `title`                 | TEXT        | NOT NULL | —                   | —                     | —          |
| `audio_url`             | TEXT        | sim      | —                   | —                     | —          |
| `duration_seconds`      | INTEGER     | sim      | `0`                 | —                     | —          |
| `recorded_at`           | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `status`                | TEXT        | NOT NULL | `'pending'`         | —                     | —          |
| `participants`          | JSONB       | sim      | `'[]'::jsonb`       | —                     | —          |
| `metadata`              | JSONB       | sim      | `'{}'::jsonb`       | —                     | —          |
| `created_at`            | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `updated_at`            | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `transcript`            | text        | sim      | —                   | —                     | —          |
| `transcript_language`   | text        | sim      | `'pt'`              | —                     | —          |
| `transcribed_at`        | timestamptz | sim      | —                   | —                     | —          |
| `transcription_error`   | text        | sim      | —                   | —                     | —          |
| `talk_ratio_seller`     | numeric     | sim      | —                   | —                     | —          |
| `talk_ratio_client`     | numeric     | sim      | —                   | —                     | —          |
| `longest_monologue_sec` | integer     | sim      | —                   | —                     | —          |
| `interruptions_count`   | integer     | sim      | —                   | —                     | —          |
| `turns_count`           | integer     | sim      | —                   | —                     | —          |
| `diarization`           | jsonb       | sim      | —                   | —                     | —          |
| `diarized_at`           | timestamptz | sim      | —                   | —                     | —          |
| `summary`               | text        | sim      | —                   | —                     | —          |
| `action_items`          | jsonb       | NOT NULL | `'[]'::jsonb`       | —                     | —          |
| `decisions`             | jsonb       | NOT NULL | `'[]'::jsonb`       | —                     | —          |
| `objections_summary`    | jsonb       | NOT NULL | `'[]'::jsonb`       | —                     | —          |
| `next_steps`            | jsonb       | NOT NULL | `'[]'::jsonb`       | —                     | —          |
| `key_topics`            | text[]      | NOT NULL | `ARRAY[]::text[]`   | —                     | —          |
| `sentiment`             | text        | sim      | —                   | —                     | —          |
| `summarized_at`         | timestamptz | sim      | —                   | —                     | —          |
| `transcript_tsv`        | tsvector    | sim      | —                   | —                     | —          |

### `call_sentiment_timeline`

**RLS habilitada** · 2 policies: `View sentiment of own/managed recordings`, `Service role manages sentiment timeline`

| Coluna          | Tipo        | Nulo     | Default             | Constraints               | Comentário |
| --------------- | ----------- | -------- | ------------------- | ------------------------- | ---------- |
| `id`            | uuid        | NOT NULL | `gen_random_uuid()` | PK                        | —          |
| `recording_id`  | uuid        | NOT NULL | —                   | FK → `call_recordings.id` | —          |
| `segment_index` | int         | NOT NULL | —                   | —                         | —          |
| `start_sec`     | int         | NOT NULL | `0`                 | —                         | —          |
| `end_sec`       | int         | NOT NULL | `0`                 | —                         | —          |
| `speaker`       | text        | NOT NULL | `'unknown'`         | —                         | —          |
| `sentiment`     | text        | NOT NULL | `'neutral'`         | —                         | —          |
| `score`         | numeric     | NOT NULL | `0`                 | —                         | —          |
| `confidence`    | numeric     | NOT NULL | `0.5`               | —                         | —          |
| `excerpt`       | text        | sim      | —                   | —                         | —          |
| `created_at`    | timestamptz | NOT NULL | `now()`             | —                         | —          |

### `call_tracking`

**RLS habilitada** · 1 policies: `Users can view their own call tracking`

| Coluna          | Tipo                     | Nulo     | Default              | Constraints          | Comentário |
| --------------- | ------------------------ | -------- | -------------------- | -------------------- | ---------- |
| `id`            | UUID                     | NOT NULL | `uuid_generate_v4()` | PK                   | —          |
| `user_id`       | UUID                     | NOT NULL | —                    | FK → `auth.users.id` | —          |
| `client_id`     | UUID                     | sim      | —                    | FK → `clients.id`    | —          |
| `deal_id`       | UUID                     | sim      | —                    | FK → `deals.id`      | —          |
| `duration`      | INTEGER                  | NOT NULL | —                    | —                    | —          |
| `outcome`       | TEXT                     | sim      | —                    | —                    | —          |
| `recording_url` | TEXT                     | sim      | —                    | —                    | —          |
| `notes`         | TEXT                     | sim      | —                    | —                    | —          |
| `created_at`    | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —                    | —          |

### `call_transcripts`

**RLS habilitada** · 2 policies: `View transcripts via recording access`, `System inserts transcripts`

| Coluna             | Tipo        | Nulo     | Default             | Constraints               | Comentário |
| ------------------ | ----------- | -------- | ------------------- | ------------------------- | ---------- |
| `id`               | UUID        | NOT NULL | `gen_random_uuid()` | PK                        | —          |
| `recording_id`     | UUID        | NOT NULL | —                   | FK → `call_recordings.id` | —          |
| `full_text`        | TEXT        | NOT NULL | —                   | —                         | —          |
| `segments`         | JSONB       | NOT NULL | `'[]'::jsonb`       | —                         | —          |
| `language`         | TEXT        | sim      | `'pt-BR'`           | —                         | —          |
| `word_count`       | INTEGER     | sim      | `0`                 | —                         | —          |
| `created_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —                         | —          |
| `ai_live_insights` | JSONB       | sim      | `'[]'::jsonb`       | —                         | —          |

### `campaign_health_alerts`

**RLS habilitada** · 2 policies: `owner or admin can view campaign health alerts`, `admin can delete campaign health alerts`

| Coluna          | Tipo                     | Nulo     | Default             | Constraints               | Comentário |
| --------------- | ------------------------ | -------- | ------------------- | ------------------------- | ---------- |
| `id`            | uuid                     | NOT NULL | `gen_random_uuid()` | PK                        | —          |
| `job_id`        | uuid                     | NOT NULL | —                   | FK → `email_bulk_jobs.id` | —          |
| `owner_id`      | uuid                     | NOT NULL | —                   | —                         | —          |
| `alert_type`    | text                     | NOT NULL | —                   | —                         | —          |
| `severity`      | text                     | NOT NULL | `'warning'`         | —                         | —          |
| `message`       | text                     | NOT NULL | —                   | —                         | —          |
| `metrics`       | jsonb                    | NOT NULL | `'{}'::jsonb`       | —                         | —          |
| `created_at`    | timestamp with time zone | NOT NULL | `now()`             | —                         | —          |
| `updated_at`    | timestamp with time zone | NOT NULL | `now()`             | —                         | —          |
| `dedupe_bucket` | timestamptz              | sim      | —                   | —                         | —          |

### `category_metrics`

**RLS habilitada** · 4 policies: `Authenticated users can read category_metrics`, `Admins and managers can insert category_metrics`, `Admins and managers can update category_metrics`, `Admins and managers can delete category_metrics`

| Coluna       | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ------------ | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`         | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `date`       | DATE                     | NOT NULL | —                   | —           | —          |
| `category`   | TEXT                     | NOT NULL | —                   | —           | —          |
| `percentage` | DECIMAL(5,2)             | NOT NULL | `0`                 | —           | —          |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |

### `challenge_progress`

**RLS habilitada** · 3 policies: `Users can insert own challenge_progress`, `Users can update own challenge_progress`, `Users can read own challenge_progress`

| Coluna           | Tipo                     | Nulo     | Default             | Constraints                 | Comentário |
| ---------------- | ------------------------ | -------- | ------------------- | --------------------------- | ---------- |
| `id`             | UUID                     | NOT NULL | `gen_random_uuid()` | PK                          | —          |
| `challenge_id`   | UUID                     | NOT NULL | —                   | FK → `weekly_challenges.id` | —          |
| `salesperson_id` | UUID                     | NOT NULL | —                   | FK → `salespeople.id`       | —          |
| `current_value`  | INTEGER                  | NOT NULL | `0`                 | —                           | —          |
| `completed_at`   | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                           | —          |
| `xp_claimed`     | BOOLEAN                  | NOT NULL | `false`             | —                           | —          |
| `created_at`     | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                           | —          |
| `updated_at`     | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                           | —          |

### `channel_credentials`

**RLS habilitada** · 4 policies: `Owners can view their credentials`, `Owners can insert their credentials`, `Owners can update their credentials`, `Owners can delete their credentials`

| Coluna        | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`          | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `owner_id`    | uuid        | NOT NULL | —                   | —           | —          |
| `channel`     | text        | NOT NULL | —                   | —           | —          |
| `provider`    | text        | NOT NULL | —                   | —           | —          |
| `label`       | text        | sim      | —                   | —           | —          |
| `credentials` | jsonb       | NOT NULL | `'{}'::jsonb`       | —           | —          |
| `from_number` | text        | sim      | —                   | —           | —          |
| `enabled`     | boolean     | NOT NULL | `true`              | —           | —          |
| `verified_at` | timestamptz | sim      | —                   | —           | —          |
| `created_at`  | timestamptz | NOT NULL | `now()`             | —           | —          |
| `updated_at`  | timestamptz | NOT NULL | `now()`             | —           | —          |

### `channel_interactions`

**RLS habilitada** · 4 policies: `Users can view own interactions`, `Users can create own interactions`, `Users can update own interactions`, `Users can delete own interactions`

| Coluna            | Tipo        | Nulo     | Default             | Constraints                 | Comentário |
| ----------------- | ----------- | -------- | ------------------- | --------------------------- | ---------- |
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK                          | —          |
| `salesperson_id`  | UUID        | NOT NULL | —                   | FK → `salespeople.id`       | —          |
| `channel`         | TEXT        | NOT NULL | `'whatsapp'`        | —                           | —          |
| `direction`       | TEXT        | NOT NULL | `'outbound'`        | —                           | —          |
| `contact_name`    | TEXT        | NOT NULL | —                   | —                           | —          |
| `contact_info`    | TEXT        | sim      | —                   | —                           | —          |
| `message_preview` | TEXT        | sim      | —                   | —                           | —          |
| `status`          | TEXT        | sim      | `'sent'`            | —                           | —          |
| `template_id`     | UUID        | sim      | —                   | FK → `message_templates.id` | —          |
| `deal_id`         | UUID        | sim      | —                   | FK → `sales.id`             | —          |
| `metadata`        | JSONB       | sim      | `'{}'`              | —                           | —          |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                           | —          |

### `chat_conversations`

**RLS habilitada** · 4 policies: `Users can read own chat_conversations`, `Users can insert own chat_conversations`, `Users can update own chat_conversations`, `Users can delete own chat_conversations`

| Coluna           | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id` | UUID                     | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `title`          | TEXT                     | NOT NULL | `'Nova`             | —                     | —          |
| `created_at`     | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |
| `updated_at`     | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |

### `chat_messages`

**RLS habilitada** · 2 policies: `Users can read own chat_messages`, `Users can insert own chat_messages`

| Coluna            | Tipo                     | Nulo     | Default             | Constraints                  | Comentário |
| ----------------- | ------------------------ | -------- | ------------------- | ---------------------------- | ---------- |
| `id`              | UUID                     | NOT NULL | `gen_random_uuid()` | PK                           | —          |
| `conversation_id` | UUID                     | NOT NULL | —                   | FK → `chat_conversations.id` | —          |
| `role`            | TEXT                     | NOT NULL | —                   | —                            | —          |
| `content`         | TEXT                     | NOT NULL | —                   | —                            | —          |
| `created_at`      | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                            | —          |

### `churn_alert_settings`

**RLS habilitada** · 2 policies: `Anyone authenticated can read churn alert settings`, `Admins manage churn alert settings`

| Coluna                     | Tipo        | Nulo     | Default        | Constraints | Comentário |
| -------------------------- | ----------- | -------- | -------------- | ----------- | ---------- |
| `id`                       | boolean     | NOT NULL | `true`         | PK          | —          |
| `enabled`                  | boolean     | NOT NULL | `true`         | —           | —          |
| `min_level`                | text        | NOT NULL | `'high'`       | —           | —          |
| `cooldown_hours`           | integer     | NOT NULL | `24`           | —           | —          |
| `updated_at`               | timestamptz | NOT NULL | `now()`        | —           | —          |
| `email_enabled`            | boolean     | NOT NULL | `false`        | —           | —          |
| `email_from`               | text        | sim      | —              | —           | —          |
| `email_reply_to`           | text        | sim      | —              | —           | —          |
| `email_recipients`         | text[]      | NOT NULL | `'{}'::text[]` | —           | —          |
| `email_subject_template`   | text        | NOT NULL | `'[Churn]`     | —           | —          |
| `email_provider`           | text        | NOT NULL | `'lovable'`    | —           | —          |
| `auto_task_enabled`        | BOOLEAN     | NOT NULL | `false`        | —           | —          |
| `auto_task_min_level`      | TEXT        | NOT NULL | `'high'`       | —           | —          |
| `auto_task_cooldown_hours` | INTEGER     | NOT NULL | `48`           | —           | —          |
| `auto_task_priority`       | TEXT        | NOT NULL | `'high'`       | —           | —          |
| `auto_task_due_in_days`    | INTEGER     | NOT NULL | `1`            | —           | —          |

### `circuit_breaker_events`

**RLS habilitada** · 3 policies: `Admins and managers can view circuit breaker events`, `Admins can delete circuit breaker events`, `Admin/manager can log circuit breaker events`

| Coluna          | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| --------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`            | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `circuit_name`  | TEXT                     | NOT NULL | —                   | —           | —          |
| `event_type`    | TEXT                     | NOT NULL | —                   | —           | —          |
| `new_state`     | TEXT                     | sim      | —                   | —           | —          |
| `failure_count` | INTEGER                  | sim      | `0`                 | —           | —          |
| `details`       | JSONB                    | sim      | `'{}'::jsonb`       | —           | —          |
| `created_at`    | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |

### `client_churn_alerts_state`

**RLS habilitada** · 2 policies: `Admins can view all churn alert state`, `Users can view their own churn alert state`

| Coluna                        | Tipo        | Nulo     | Default             | Constraints     | Comentário |
| ----------------------------- | ----------- | -------- | ------------------- | --------------- | ---------- |
| `id`                          | uuid        | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `salesperson_id`              | uuid        | NOT NULL | —                   | UNIQUE          | —          |
| `client_name`                 | text        | NOT NULL | —                   | UNIQUE          | —          |
| `last_level`                  | text        | NOT NULL | —                   | —               | —          |
| `last_days_since`             | integer     | NOT NULL | —                   | —               | —          |
| `last_alerted_at`             | timestamptz | NOT NULL | `now()`             | —               | —          |
| `created_at`                  | timestamptz | NOT NULL | `now()`             | —               | —          |
| `updated_at`                  | timestamptz | NOT NULL | `now()`             | —               | —          |
| `last_expected_interval_days` | integer     | sim      | —                   | —               | —          |
| `last_threshold_days`         | integer     | sim      | —                   | —               | —          |
| `last_task_id`                | UUID        | sim      | —                   | FK → `tasks.id` | —          |
| `last_task_created_at`        | TIMESTAMPTZ | sim      | —                   | —               | —          |

### `client_interactions`

**RLS habilitada** · 4 policies: `Allow authenticated users to insert interactions`, `Users can insert own interactions`, `Users can view own interactions`, `Portfolio interactions readable`

| Coluna       | Tipo                     | Nulo     | Default             | Constraints          | Comentário |
| ------------ | ------------------------ | -------- | ------------------- | -------------------- | ---------- |
| `id`         | UUID                     | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `client_id`  | UUID                     | sim      | —                   | FK → `clients.id`    | —          |
| `user_id`    | UUID                     | sim      | —                   | FK → `auth.users.id` | —          |
| `type`       | TEXT                     | NOT NULL | —                   | —                    | —          |
| `metadata`   | JSONB                    | sim      | `'{}'::jsonb`       | —                    | —          |
| `created_at` | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                    | —          |
| `created_by` | UUID                     | sim      | —                   | —                    | —          |

### `client_portfolio`

**RLS habilitada** · 2 policies: `Admins and managers can delete client_portfolio`, `Users can read own client_portfolio`

| Coluna               | Tipo                                | Nulo     | Default             | Constraints           | Comentário |
| -------------------- | ----------------------------------- | -------- | ------------------- | --------------------- | ---------- |
| `id`                 | UUID                                | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `client_id`          | UUID                                | NOT NULL | —                   | FK → `clients.id`     | —          |
| `salesperson_id`     | UUID                                | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `status`             | TEXT                                | NOT NULL | `'inactive'`        | —                     | —          |
| `last_purchase_date` | DATE                                | sim      | —                   | —                     | —          |
| `assigned_at`        | TIMESTAMP WITH TIME ZONE            | NOT NULL | `now()`             | —                     | —          |
| `assigned_by`        | UUID                                | sim      | —                   | FK → `salespeople.id` | —          |
| `source`             | TEXT                                | sim      | `'database'`        | —                     | —          |
| `performance_reward` | created_at TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |
| `updated_at`         | TIMESTAMP WITH TIME ZONE            | NOT NULL | `now()`             | —                     | —          |
| `is_active`          | BOOLEAN                             | sim      | `true`              | —                     | —          |
| `lead_source`        | TEXT                                | sim      | —                   | —                     | —          |

### `client_renewals`

**RLS habilitada** · 1 policies: `Client renewals scoped visibility`

| Coluna              | Tipo                     | Nulo     | Default             | Constraints       | Comentário |
| ------------------- | ------------------------ | -------- | ------------------- | ----------------- | ---------- |
| `id`                | UUID                     | NOT NULL | `gen_random_uuid()` | PK                | —          |
| `client_id`         | UUID                     | NOT NULL | —                   | FK → `clients.id` | —          |
| `contract_end_date` | DATE                     | NOT NULL | —                   | —                 | —          |
| `renewal_value`     | NUMERIC(15,2)            | sim      | —                   | —                 | —          |
| `status`            | TEXT                     | sim      | `'pending'`         | —                 | —          |
| `canceled`          | probability INTEGER      | sim      | `70`                | —                 | —          |
| `risk_level`        | TEXT                     | sim      | `'low'`             | —                 | —          |
| `high`              | notes TEXT               | sim      | —                   | —                 | —          |
| `created_at`        | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                 | —          |
| `updated_at`        | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                 | —          |

### `clients`

**RLS habilitada** · 9 policies: `Admins and managers can insert clients`, `Admins and managers can update clients`, `Admins and managers can delete clients`, `Admins can view deleted records`, `Users can read clients if has permission`, `Users can create clients if has permission`, `Users can update clients if has permission`, `Users can delete clients if has permission`…

| Coluna                | Tipo                     | Nulo     | Default             | Constraints          | Comentário                                                       |
| --------------------- | ------------------------ | -------- | ------------------- | -------------------- | ---------------------------------------------------------------- |
| `id`                  | UUID                     | NOT NULL | `gen_random_uuid()` | PK                   | —                                                                |
| `name`                | TEXT                     | NOT NULL | —                   | —                    | —                                                                |
| `email`               | TEXT                     | sim      | —                   | —                    | —                                                                |
| `phone`               | TEXT                     | sim      | —                   | —                    | —                                                                |
| `company`             | TEXT                     | sim      | —                   | —                    | —                                                                |
| `total_value`         | DECIMAL(12,2)            | sim      | `0`                 | —                    | —                                                                |
| `created_at`          | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                    | —                                                                |
| `updated_at`          | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                    | —                                                                |
| `deleted_at`          | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                    | —                                                                |
| `deleted_by`          | UUID                     | sim      | —                   | —                    | Usuário que deletou                                              |
| `delete_reason`       | TEXT                     | sim      | —                   | —                    | Motivo do delete                                                 |
| `lat`                 | DOUBLE PRECISION         | sim      | —                   | —                    | —                                                                |
| `lng`                 | DOUBLE PRECISION         | sim      | —                   | —                    | —                                                                |
| `user_id`             | UUID                     | sim      | —                   | FK → `auth.users.id` | —                                                                |
| `last_interaction_at` | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                    | —                                                                |
| `lead_source`         | TEXT                     | sim      | —                   | —                    | —                                                                |
| `email_verified`      | BOOLEAN                  | sim      | `false`             | —                    | —                                                                |
| `phone_verified`      | BOOLEAN                  | sim      | `false`             | —                    | —                                                                |
| `last_enrichment_id`  | UUID                     | sim      | —                   | —                    | —                                                                |
| `is_activated`        | BOOLEAN                  | sim      | `false`             | —                    | —                                                                |
| `activated_at`        | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                    | —                                                                |
| `ramo_atividade`      | TEXT                     | sim      | —                   | —                    | Setor de atuação do cliente (Tecnologia, Indústria, Varejo, etc) |

### `coaching_actions`

**RLS habilitada** · 4 policies: `Salesperson views own coaching`, `Salesperson updates own coaching status`, `Admin or manager insert coaching`, `Admin or manager delete coaching`

| Coluna           | Tipo        | Nulo     | Default             | Constraints               | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ------------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                        | —          |
| `recording_id`   | UUID        | NOT NULL | —                   | FK → `call_recordings.id` | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id`     | —          |
| `tip`            | TEXT        | NOT NULL | —                   | —                         | —          |
| `category`       | TEXT        | NOT NULL | `'discovery'`       | —                         | —          |
| `severity`       | TEXT        | NOT NULL | `'info'`            | —                         | —          |
| `timestamp_sec`  | INTEGER     | sim      | —                   | —                         | —          |
| `quote`          | TEXT        | sim      | —                   | —                         | —          |
| `status`         | TEXT        | NOT NULL | `'pending'`         | —                         | —          |
| `manager_note`   | TEXT        | sim      | —                   | —                         | —          |
| `accepted_at`    | TIMESTAMPTZ | sim      | —                   | —                         | —          |
| `created_by_ai`  | BOOLEAN     | NOT NULL | `true`              | —                         | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                         | —          |
| `updated_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                         | —          |

### `coaching_opportunities`

**RLS habilitada** · 2 policies: `coaching_opp_read_authenticated`, `coaching_opp_write_admin_manager`

| Coluna               | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| -------------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`                 | uuid        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id`     | uuid        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `metric_key`         | text        | NOT NULL | —                   | —                     | —          |
| `metric_label`       | text        | NOT NULL | —                   | —                     | —          |
| `current_value`      | numeric     | NOT NULL | `0`                 | —                     | —          |
| `team_benchmark`     | numeric     | NOT NULL | `0`                 | —                     | —          |
| `gap_pct`            | numeric     | sim      | —                   | —                     | —          |
| `severity`           | text        | NOT NULL | `'low'`             | —                     | —          |
| `skill_focus`        | text        | NOT NULL | —                   | —                     | —          |
| `recommended_action` | text        | sim      | —                   | —                     | —          |
| `priority`           | int         | NOT NULL | `1`                 | —                     | —          |
| `detected_at`        | timestamptz | NOT NULL | `now()`             | —                     | —          |

### `coaching_scorecard_config`

**RLS habilitada** · 1 policies: `Allow read for all authenticated users`

| Coluna           | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ---------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`             | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `dimension_name` | TEXT                     | NOT NULL | —                   | —           | —          |
| `description`    | TEXT                     | sim      | —                   | —           | —          |
| `is_active`      | BOOLEAN                  | sim      | `true`              | —           | —          |
| `created_at`     | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —          |

### `coaching_sessions`

**RLS habilitada** · 3 policies: `Admins and managers manage all coaching sessions`, `Coaches manage their own sessions`, `Salespeople view their own sessions`

| Coluna           | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `coach_id`       | UUID        | NOT NULL | —                   | —                     | —          |
| `scheduled_at`   | TIMESTAMPTZ | NOT NULL | —                   | —                     | —          |
| `duration_min`   | INTEGER     | NOT NULL | `30`                | —                     | —          |
| `status`         | TEXT        | NOT NULL | `'scheduled'`       | —                     | —          |
| `focus_skills`   | TEXT[]      | NOT NULL | `'{}'`              | —                     | —          |
| `agenda`         | JSONB       | NOT NULL | `'{}'::jsonb`       | —                     | —          |
| `notes`          | TEXT        | sim      | —                   | —                     | —          |
| `action_items`   | JSONB       | NOT NULL | `'[]'::jsonb`       | —                     | —          |
| `outcome_rating` | INTEGER     | sim      | —                   | —                     | —          |
| `completed_at`   | TIMESTAMPTZ | sim      | —                   | —                     | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `updated_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |

### `coaching_skill_benchmarks`

**RLS habilitada** · 2 policies: `coaching_bench_read_authenticated`, `coaching_bench_write_admin_manager`

| Coluna         | Tipo        | Nulo     | Default             | Constraints | Comentário |
| -------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`           | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `metric_key`   | text        | NOT NULL | —                   | UNIQUE      | —          |
| `team_avg`     | numeric     | NOT NULL | `0`                 | —           | —          |
| `top_quartile` | numeric     | NOT NULL | `0`                 | —           | —          |
| `sample_size`  | int         | NOT NULL | `0`                 | —           | —          |
| `computed_at`  | timestamptz | NOT NULL | `now()`             | —           | —          |

### `cohort_analyses`

**RLS habilitada** · 1 policies: `owner_full_access_cohorts`

| Coluna         | Tipo        | Nulo     | Default             | Constraints | Comentário |
| -------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`           | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `owner_id`     | UUID        | NOT NULL | —                   | —           | —          |
| `name`         | TEXT        | NOT NULL | —                   | —           | —          |
| `description`  | TEXT        | sim      | —                   | —           | —          |
| `cohort_field` | TEXT        | NOT NULL | `'created_at'`      | —           | —          |
| `metric_field` | TEXT        | NOT NULL | `'amount'`          | —           | —          |
| `period_type`  | TEXT        | NOT NULL | `'month'`           | —           | —          |
| `config`       | JSONB       | NOT NULL | `'{}'::jsonb`       | —           | —          |
| `created_at`   | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `updated_at`   | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `collectible_badges`

**RLS habilitada** · 0 policies

| Coluna             | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------ | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`               | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `name`             | TEXT        | NOT NULL | —                   | —           | —          |
| `description`      | TEXT        | sim      | —                   | —           | —          |
| `icon`             | TEXT        | NOT NULL | `'🏅'`              | —           | —          |
| `category`         | TEXT        | NOT NULL | `'general'`         | —           | —          |
| `rarity`           | TEXT        | NOT NULL | `'common'`          | —           | —          |
| `unlock_condition` | TEXT        | NOT NULL | —                   | —           | —          |
| `unlock_threshold` | INTEGER     | NOT NULL | `1`                 | —           | —          |
| `xp_reward`        | INTEGER     | NOT NULL | `50`                | —           | —          |
| `created_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `combo_tracking`

**RLS habilitada** · 3 policies: `Anyone can read combo_tracking`, `Users can insert own combo_tracking`, `Admins can update combo_tracking`

| Coluna               | Tipo         | Nulo     | Default             | Constraints           | Comentário |
| -------------------- | ------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`                 | UUID         | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id`     | UUID         | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `combo_date`         | DATE         | NOT NULL | `CURRENT_DATE`      | —                     | —          |
| `actions_count`      | INTEGER      | NOT NULL | `0`                 | —                     | —          |
| `current_multiplier` | NUMERIC(3,1) | NOT NULL | `1.0`               | —                     | —          |
| `current_tier`       | INTEGER      | NOT NULL | `0`                 | —                     | —          |
| `max_tier_today`     | INTEGER      | NOT NULL | `0`                 | —                     | —          |
| `created_at`         | TIMESTAMPTZ  | NOT NULL | `now()`             | —                     | —          |
| `updated_at`         | TIMESTAMPTZ  | NOT NULL | `now()`             | —                     | —          |

### `commercial_approval_requests`

**RLS habilitada** · 5 policies: `Ver solicitações`, `Criar solicitações`, `Only admins and managers can update approval requests`, `Users can view their own approval requests`, `Users can create approval requests`

| Coluna             | Tipo                     | Nulo     | Default             | Constraints          | Comentário                                                          |
| ------------------ | ------------------------ | -------- | ------------------- | -------------------- | ------------------------------------------------------------------- |
| `id`               | UUID                     | NOT NULL | `gen_random_uuid()` | PK                   | —                                                                   |
| `requester_id`     | UUID                     | sim      | —                   | FK → `auth.users.id` | —                                                                   |
| `type`             | TEXT                     | NOT NULL | —                   | —                    | —                                                                   |
| `entity_id`        | UUID                     | sim      | —                   | —                    | —                                                                   |
| `competence_month` | DATE                     | NOT NULL | —                   | —                    | —                                                                   |
| `new_values`       | JSONB                    | NOT NULL | —                   | —                    | —                                                                   |
| `old_values`       | JSONB                    | sim      | —                   | —                    | —                                                                   |
| `status`           | TEXT                     | NOT NULL | `'pending'`         | —                    | —                                                                   |
| `approver_id`      | UUID                     | sim      | —                   | FK → `auth.users.id` | —                                                                   |
| `justification`    | TEXT                     | sim      | —                   | —                    | —                                                                   |
| `created_at`       | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                    | —                                                                   |
| `updated_at`       | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                    | —                                                                   |
| `effective_at`     | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                    | When the approved change should actually take effect in the system. |
| `approved_at`      | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                    | —                                                                   |

### `commission_bonus_awards`

**RLS habilitada** · 4 policies: `Salespeople view own awards`, `Admins insert awards`, `Admins update awards`, `Admins delete awards`

| Coluna            | Tipo          | Nulo     | Default             | Constraints                           | Comentário |
| ----------------- | ------------- | -------- | ------------------- | ------------------------------------- | ---------- |
| `id`              | UUID          | NOT NULL | `gen_random_uuid()` | PK                                    | —          |
| `bonus_id`        | UUID          | NOT NULL | —                   | UNIQUE · FK → `commission_bonuses.id` | —          |
| `salesperson_id`  | UUID          | NOT NULL | —                   | UNIQUE · FK → `salespeople.id`        | —          |
| `period_month`    | DATE          | NOT NULL | —                   | UNIQUE                                | —          |
| `computed_amount` | NUMERIC(14,2) | NOT NULL | `0`                 | —                                     | —          |
| `bonus_kind`      | TEXT          | NOT NULL | —                   | —                                     | —          |
| `status`          | TEXT          | NOT NULL | `'pending'`         | —                                     | —          |
| `awarded_at`      | TIMESTAMPTZ   | NOT NULL | `now()`             | —                                     | —          |
| `paid_at`         | TIMESTAMPTZ   | sim      | —                   | —                                     | —          |
| `admin_notes`     | TEXT          | sim      | —                   | —                                     | —          |
| `created_at`      | TIMESTAMPTZ   | NOT NULL | `now()`             | —                                     | —          |
| `updated_at`      | TIMESTAMPTZ   | NOT NULL | `now()`             | —                                     | —          |

### `commission_bonuses`

**RLS habilitada** · 2 policies: `Admins and managers manage commission_bonuses`, `Salespeople view applicable active bonuses`

| Coluna              | Tipo          | Nulo     | Default             | Constraints           | Comentário |
| ------------------- | ------------- | -------- | ------------------- | --------------------- | ---------- |
| `id`                | UUID          | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `name`              | TEXT          | NOT NULL | —                   | —                     | —          |
| `description`       | TEXT          | sim      | —                   | —                     | —          |
| `bonus_type`        | TEXT          | NOT NULL | —                   | —                     | —          |
| `trigger_condition` | JSONB         | NOT NULL | `'{}'::jsonb`       | —                     | —          |
| `bonus_amount`      | NUMERIC(14,2) | NOT NULL | `0`                 | —                     | —          |
| `bonus_kind`        | TEXT          | NOT NULL | `'fixed'`           | —                     | —          |
| `salesperson_id`    | UUID          | sim      | —                   | FK → `salespeople.id` | —          |
| `priority`          | INTEGER       | NOT NULL | `0`                 | —                     | —          |
| `is_active`         | BOOLEAN       | NOT NULL | `true`              | —                     | —          |
| `created_at`        | TIMESTAMPTZ   | NOT NULL | `now()`             | —                     | —          |
| `updated_at`        | TIMESTAMPTZ   | NOT NULL | `now()`             | —                     | —          |

### `commission_rules`

**RLS habilitada** · 2 policies: `Admins/Managers manage commission rules`, `Salespeople view own rules`

| Coluna           | Tipo          | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ------------- | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID          | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `name`           | TEXT          | NOT NULL | —                   | —                     | —          |
| `description`    | TEXT          | sim      | —                   | —                     | —          |
| `salesperson_id` | UUID          | sim      | —                   | FK → `salespeople.id` | —          |
| `category`       | TEXT          | sim      | —                   | —                     | —          |
| `percentage`     | NUMERIC(5,2)  | NOT NULL | `5.00`              | —                     | —          |
| `min_amount`     | NUMERIC(12,2) | sim      | `0`                 | —                     | —          |
| `max_amount`     | NUMERIC(12,2) | sim      | —                   | —                     | —          |
| `priority`       | INTEGER       | NOT NULL | `0`                 | —                     | —          |
| `is_active`      | BOOLEAN       | NOT NULL | `true`              | —                     | —          |
| `created_by`     | UUID          | sim      | —                   | —                     | —          |
| `created_at`     | TIMESTAMPTZ   | NOT NULL | `now()`             | —                     | —          |
| `updated_at`     | TIMESTAMPTZ   | NOT NULL | `now()`             | —                     | —          |

### `commissions`

**RLS habilitada** · 2 policies: `Admins/Managers manage all commissions`, `Salespeople view own commissions`

| Coluna                  | Tipo          | Nulo     | Default             | Constraints                | Comentário |
| ----------------------- | ------------- | -------- | ------------------- | -------------------------- | ---------- |
| `id`                    | UUID          | NOT NULL | `gen_random_uuid()` | PK                         | —          |
| `sale_id`               | UUID          | NOT NULL | —                   | FK → `sales.id`            | —          |
| `salesperson_id`        | UUID          | NOT NULL | —                   | FK → `salespeople.id`      | —          |
| `rule_id`               | UUID          | sim      | —                   | FK → `commission_rules.id` | —          |
| `base_amount`           | NUMERIC(12,2) | NOT NULL | —                   | —                          | —          |
| `percentage`            | NUMERIC(5,2)  | NOT NULL | —                   | —                          | —          |
| `commission_amount`     | NUMERIC(12,2) | NOT NULL | —                   | —                          | —          |
| `status`                | TEXT          | NOT NULL | `'pending'`         | —                          | —          |
| `approved_at`           | TIMESTAMPTZ   | sim      | —                   | —                          | —          |
| `approved_by`           | UUID          | sim      | —                   | —                          | —          |
| `paid_at`               | TIMESTAMPTZ   | sim      | —                   | —                          | —          |
| `paid_by`               | UUID          | sim      | —                   | —                          | —          |
| `payment_notes`         | TEXT          | sim      | —                   | —                          | —          |
| `created_at`            | TIMESTAMPTZ   | NOT NULL | `now()`             | —                          | —          |
| `updated_at`            | TIMESTAMPTZ   | NOT NULL | `now()`             | —                          | —          |
| `sdr_commission_amount` | NUMERIC       | sim      | `0`                 | —                          | —          |
| `is_first_sale`         | BOOLEAN       | sim      | `false`             | —                          | —          |

### `committee_coverage_history`

**RLS habilitada** · 2 policies: `auth read coverage history`, `admin manager write coverage history`

| Coluna              | Tipo        | Nulo     | Default             | Constraints     | Comentário |
| ------------------- | ----------- | -------- | ------------------- | --------------- | ---------- |
| `id`                | uuid        | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `sale_id`           | uuid        | NOT NULL | —                   | FK → `sales.id` | —          |
| `coverage_score`    | numeric     | NOT NULL | `0`                 | —               | —          |
| `tier`              | text        | NOT NULL | `'weak'`            | —               | —          |
| `stakeholder_count` | integer     | NOT NULL | `0`                 | —               | —          |
| `gaps`              | jsonb       | NOT NULL | `'[]'::jsonb`       | —               | —          |
| `snapshot_at`       | timestamptz | NOT NULL | `now()`             | —               | —          |

### `committee_extraction_runs`

**RLS habilitada** · 2 policies: `auth read extraction runs`, `admin manager write extraction runs`

| Coluna            | Tipo        | Nulo     | Default             | Constraints               | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ------------------------- | ---------- |
| `id`              | uuid        | NOT NULL | `gen_random_uuid()` | PK                        | —          |
| `recording_id`    | uuid        | sim      | —                   | FK → `call_recordings.id` | —          |
| `sale_id`         | uuid        | sim      | —                   | FK → `sales.id`           | —          |
| `extracted_count` | integer     | NOT NULL | `0`                 | —                         | —          |
| `created_count`   | integer     | NOT NULL | `0`                 | —                         | —          |
| `updated_count`   | integer     | NOT NULL | `0`                 | —                         | —          |
| `confidence`      | numeric     | NOT NULL | `0`                 | —                         | —          |
| `raw_output`      | jsonb       | NOT NULL | `'{}'::jsonb`       | —                         | —          |
| `created_at`      | timestamptz | NOT NULL | `now()`             | —                         | —          |

### `competitive_chat_messages`

**RLS habilitada** · 3 policies: `Competitive Chat - SELECT`, `Competitive Chat - INSERT`, `Competitive Chat - UPDATE`

| Coluna                  | Tipo        | Nulo     | Default             | Constraints               | Comentário |
| ----------------------- | ----------- | -------- | ------------------- | ------------------------- | ---------- |
| `id`                    | UUID        | NOT NULL | `gen_random_uuid()` | PK                        | —          |
| `salesperson_id`        | UUID        | NOT NULL | —                   | FK → `salespeople.id`     | —          |
| `message`               | TEXT        | NOT NULL | —                   | —                         | —          |
| `message_type`          | TEXT        | NOT NULL | `'chat'`            | —                         | —          |
| `target_salesperson_id` | UUID        | sim      | —                   | FK → `salespeople.id`     | —          |
| `matchup_id`            | UUID        | sim      | —                   | FK → `weekly_matchups.id` | —          |
| `reactions`             | JSONB       | sim      | `'{}'`              | —                         | —          |
| `created_at`            | TIMESTAMPTZ | NOT NULL | `now()`             | —                         | —          |
| `squad_id`              | UUID        | sim      | —                   | —                         | —          |

### `competitive_seasons`

**RLS habilitada** · 1 policies: `Admins can manage seasons`

| Coluna          | Tipo                  | Nulo     | Default             | Constraints | Comentário |
| --------------- | --------------------- | -------- | ------------------- | ----------- | ---------- |
| `id`            | UUID                  | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `name`          | TEXT                  | NOT NULL | —                   | —           | —          |
| `season_number` | INTEGER               | NOT NULL | `1`                 | —           | —          |
| `starts_at`     | TIMESTAMPTZ           | NOT NULL | —                   | —           | —          |
| `ends_at`       | TIMESTAMPTZ           | NOT NULL | —                   | —           | —          |
| `status`        | TEXT                  | NOT NULL | `'active'`          | —           | —          |
| `completed`     | xp_multiplier NUMERIC | NOT NULL | `1.0`               | —           | —          |
| `metadata`      | JSONB                 | sim      | `'{}'`              | —           | —          |
| `created_at`    | TIMESTAMPTZ           | NOT NULL | `now()`             | —           | —          |

### `competitor_mentions`

**RLS habilitada** · 3 policies: `Owners view mentions of their recordings`, `Owners insert mentions on their recordings`, `Owners delete mentions on their recordings`

| Coluna            | Tipo        | Nulo     | Default             | Constraints                    | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ------------------------------ | ---------- |
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK                             | —          |
| `recording_id`    | UUID        | NOT NULL | —                   | FK → `call_recordings.id`      | —          |
| `competitor_id`   | UUID        | sim      | —                   | FK → `competitors_registry.id` | —          |
| `competitor_name` | TEXT        | NOT NULL | —                   | —                              | —          |
| `timestamp_sec`   | INTEGER     | sim      | —                   | —                              | —          |
| `context_snippet` | TEXT        | sim      | —                   | —                              | —          |
| `battle_card_id`  | UUID        | sim      | —                   | —                              | —          |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                              | —          |

### `competitors_pricing`

**RLS habilitada** · 1 policies: `Allow read for all authenticated users`

| Coluna          | Tipo                     | Nulo     | Default             | Constraints                    | Comentário |
| --------------- | ------------------------ | -------- | ------------------- | ------------------------------ | ---------- |
| `id`            | UUID                     | NOT NULL | `gen_random_uuid()` | PK                             | —          |
| `product_id`    | UUID                     | sim      | —                   | FK → `products.id`             | —          |
| `competitor_id` | UUID                     | sim      | —                   | FK → `competitors_registry.id` | —          |
| `price`         | DECIMAL(12,2)            | NOT NULL | —                   | —                              | —          |
| `source_url`    | TEXT                     | sim      | —                   | —                              | —          |
| `is_promotion`  | BOOLEAN                  | sim      | `false`             | —                              | —          |
| `recorded_at`   | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                              | —          |

### `competitors_registry`

**RLS habilitada** · 3 policies: `Admins and managers can insert competitors`, `Admins and managers can update competitors`, `Admins can delete competitors`

| Coluna                   | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------------ | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`                     | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `owner_id`               | UUID        | sim      | —                   | —           | —          |
| `name`                   | TEXT        | NOT NULL | —                   | —           | —          |
| `aliases`                | TEXT[]      | NOT NULL | `'{}'`              | —           | —          |
| `default_battle_card_id` | UUID        | sim      | —                   | —           | —          |
| `is_active`              | BOOLEAN     | NOT NULL | `true`              | —           | —          |
| `created_at`             | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `updated_at`             | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `contact_engagement_score`

**RLS habilitada** · 2 policies: `ces_select_owner`, `ces_admin_all`

| Coluna             | Tipo         | Nulo     | Default             | Constraints | Comentário |
| ------------------ | ------------ | -------- | ------------------- | ----------- | ---------- |
| `id`               | UUID         | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `contact_id`       | UUID         | NOT NULL | —                   | UNIQUE      | —          |
| `contact_type`     | TEXT         | NOT NULL | —                   | UNIQUE      | —          |
| `score`            | NUMERIC(5,2) | NOT NULL | `0`                 | —           | —          |
| `tier`             | TEXT         | NOT NULL | `'cold'`            | —           | —          |
| `total_opens`      | INTEGER      | NOT NULL | `0`                 | —           | —          |
| `total_clicks`     | INTEGER      | NOT NULL | `0`                 | —           | —          |
| `total_replies`    | INTEGER      | NOT NULL | `0`                 | —           | —          |
| `last_signal_at`   | TIMESTAMPTZ  | sim      | —                   | —           | —          |
| `decay_applied_at` | TIMESTAMPTZ  | NOT NULL | `now()`             | —           | —          |
| `updated_at`       | TIMESTAMPTZ  | NOT NULL | `now()`             | —           | —          |

### `contact_send_time_profile`

**RLS habilitada** · 2 policies: `STO profiles readable by managers and admins`, `STO profiles writable by service role only`

| Coluna         | Tipo        | Nulo     | Default             | Constraints | Comentário |
| -------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`           | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `contact_id`   | uuid        | NOT NULL | —                   | UNIQUE      | —          |
| `contact_type` | text        | NOT NULL | —                   | UNIQUE      | —          |
| `hour_of_day`  | smallint    | NOT NULL | —                   | UNIQUE      | —          |
| `day_of_week`  | smallint    | NOT NULL | —                   | UNIQUE      | —          |
| `opens`        | int         | NOT NULL | `0`                 | —           | —          |
| `clicks`       | int         | NOT NULL | `0`                 | —           | —          |
| `replies`      | int         | NOT NULL | `0`                 | —           | —          |
| `score`        | numeric     | sim      | —                   | —           | —          |
| `updated_at`   | timestamptz | NOT NULL | `now()`             | —           | —          |

### `conversation_analyses`

**RLS habilitada** · 4 policies: `Salesperson sees own deal conversations`, `Authenticated can insert conversations`, `Owner or manager can update`, `Owner or manager can delete`

| Coluna            | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ----------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `sale_id`         | uuid        | sim      | —                   | FK → `sales.id`       | —          |
| `client_id`       | uuid        | sim      | —                   | —                     | —          |
| `source`          | text        | NOT NULL | —                   | —                     | —          |
| `transcript`      | TEXT        | sim      | —                   | —                     | —          |
| `summary`         | text        | sim      | —                   | —                     | —          |
| `sentiment`       | TEXT        | sim      | —                   | —                     | —          |
| `objections`      | jsonb       | NOT NULL | `'[]'::jsonb`       | —                     | —          |
| `next_steps`      | jsonb       | NOT NULL | `'[]'::jsonb`       | —                     | —          |
| `buying_signals`  | JSONB       | sim      | `'[]'::jsonb`       | —                     | —          |
| `risk_signals`    | JSONB       | sim      | `'[]'::jsonb`       | —                     | —          |
| `decision_makers` | text[]      | NOT NULL | `'{}'`              | —                     | —          |
| `ai_model`        | text        | sim      | —                   | —                     | —          |
| `analyzed_by`     | UUID        | sim      | —                   | FK → `salespeople.id` | —          |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |

### `critical_moment_notifications`

**RLS habilitada** · 3 policies: `cmn_recipient_read`, `cmn_recipient_update`, `Users can view own critical moment notifications`

| Coluna              | Tipo        | Nulo     | Default             | Constraints                     | Comentário |
| ------------------- | ----------- | -------- | ------------------- | ------------------------------- | ---------- |
| `id`                | uuid        | NOT NULL | `gen_random_uuid()` | PK                              | —          |
| `moment_id`         | uuid        | NOT NULL | —                   | FK → `call_critical_moments.id` | —          |
| `recipient_user_id` | uuid        | NOT NULL | —                   | —                               | —          |
| `delivered`         | boolean     | NOT NULL | `true`              | —                               | —          |
| `read_at`           | timestamptz | sim      | —                   | —                               | —          |
| `created_at`        | timestamptz | NOT NULL | `now()`             | —                               | —          |

### `cron_failure_alerts`

**RLS habilitada** · 1 policies: `Admins can view cron failure alerts`

| Coluna                 | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ---------------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`                   | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `jobid`                | BIGINT      | NOT NULL | —                   | UNIQUE      | —          |
| `jobname`              | TEXT        | sim      | —                   | —           | —          |
| `start_time`           | TIMESTAMPTZ | NOT NULL | —                   | UNIQUE      | —          |
| `status`               | TEXT        | NOT NULL | —                   | —           | —          |
| `return_message`       | TEXT        | sim      | —                   | —           | —          |
| `alerted_at`           | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `notified_admin_count` | INTEGER     | NOT NULL | `0`                 | —           | —          |
| `created_at`           | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `cs_tickets`

**RLS habilitada** · 1 policies: `CS tickets scoped visibility`

| Coluna        | Tipo                     | Nulo     | Default             | Constraints          | Comentário |
| ------------- | ------------------------ | -------- | ------------------- | -------------------- | ---------- |
| `id`          | UUID                     | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `client_id`   | UUID                     | sim      | —                   | FK → `clients.id`    | —          |
| `external_id` | TEXT                     | sim      | —                   | —                    | —          |
| `source`      | TEXT                     | sim      | `'internal'`        | —                    | —          |
| `internal`    | subject TEXT             | NOT NULL | —                   | —                    | —          |
| `description` | TEXT                     | sim      | —                   | —                    | —          |
| `status`      | TEXT                     | sim      | `'open'`            | —                    | —          |
| `closed`      | priority TEXT            | sim      | `'medium'`          | —                    | —          |
| `urgent`      | assigned_to UUID         | sim      | —                   | FK → `auth.users.id` | —          |
| `created_at`  | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                    | —          |
| `updated_at`  | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                    | —          |

### `csat_ces_surveys`

**RLS habilitada** · 2 policies: `cs_sv_select`, `cs_sv_modify`

| Coluna          | Tipo                  | Nulo     | Default             | Constraints        | Comentário |
| --------------- | --------------------- | -------- | ------------------- | ------------------ | ---------- |
| `id`            | uuid                  | NOT NULL | `gen_random_uuid()` | PK                 | —          |
| `account_id`    | uuid                  | sim      | —                   | FK → `accounts.id` | —          |
| `contact_email` | text                  | sim      | —                   | —                  | —          |
| `survey_type`   | public.cs_survey_type | NOT NULL | `'csat'`            | —                  | —          |
| `score`         | int                   | sim      | —                   | —                  | —          |
| `comment`       | text                  | sim      | —                   | —                  | —          |
| `trigger_event` | text                  | sim      | —                   | —                  | —          |
| `sent_at`       | timestamptz           | NOT NULL | `now()`             | —                  | —          |
| `responded_at`  | timestamptz           | sim      | —                   | —                  | —          |
| `metadata`      | jsonb                 | NOT NULL | `'{}'::jsonb`       | —                  | —          |

### `custom_reports`

**RLS habilitada** · 2 policies: `owner_full_access`, `shared_select`

| Coluna        | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`          | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `owner_id`    | UUID        | NOT NULL | —                   | —           | —          |
| `name`        | TEXT        | NOT NULL | —                   | —           | —          |
| `description` | TEXT        | sim      | —                   | —           | —          |
| `entity`      | TEXT        | NOT NULL | —                   | —           | —          |
| `config`      | JSONB       | NOT NULL | `'{}'::jsonb`       | —           | —          |
| `is_shared`   | BOOLEAN     | NOT NULL | `false`             | —           | —          |
| `created_at`  | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `updated_at`  | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `daily_challenge_progress`

**RLS habilitada** · 3 policies: `Users can insert own daily_challenge_progress`, `Users can update own daily_challenge_progress`, `Users can read own daily_challenge_progress`

| Coluna           | Tipo                     | Nulo     | Default             | Constraints                | Comentário |
| ---------------- | ------------------------ | -------- | ------------------- | -------------------------- | ---------- |
| `id`             | UUID                     | NOT NULL | `gen_random_uuid()` | PK                         | —          |
| `challenge_id`   | UUID                     | NOT NULL | —                   | FK → `daily_challenges.id` | —          |
| `salesperson_id` | UUID                     | NOT NULL | —                   | FK → `salespeople.id`      | —          |
| `current_value`  | INTEGER                  | NOT NULL | `0`                 | —                          | —          |
| `completed_at`   | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                          | —          |
| `xp_claimed`     | BOOLEAN                  | NOT NULL | `false`             | —                          | —          |
| `created_at`     | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                          | —          |
| `updated_at`     | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                          | —          |

### `daily_challenges`

**RLS habilitada** · 5 policies: `Admins and managers can insert daily_challenges`, `Admins and managers can update daily_challenges`, `Admins and managers can delete daily_challenges`, `Users can view their own challenges`, `Authenticated can view daily challenges`

| Coluna           | Tipo                     | Nulo     | Default              | Constraints          | Comentário |
| ---------------- | ------------------------ | -------- | -------------------- | -------------------- | ---------- |
| `id`             | UUID                     | NOT NULL | `uuid_generate_v4()` | PK                   | —          |
| `title`          | TEXT                     | NOT NULL | —                    | —                    | —          |
| `description`    | TEXT                     | sim      | —                    | —                    | —          |
| `challenge_type` | TEXT                     | NOT NULL | —                    | —                    | —          |
| `target_value`   | INTEGER                  | NOT NULL | `5`                  | —                    | —          |
| `xp_reward`      | INTEGER                  | NOT NULL | `25`                 | —                    | —          |
| `challenge_date` | DATE                     | NOT NULL | `CURRENT_DATE`       | —                    | —          |
| `is_active`      | BOOLEAN                  | NOT NULL | `true`               | —                    | —          |
| `created_at`     | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —                    | —          |
| `updated_at`     | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`              | —                    | —          |
| `user_id`        | UUID                     | NOT NULL | —                    | FK → `auth.users.id` | —          |
| `target`         | INTEGER                  | NOT NULL | —                    | —                    | —          |
| `progress`       | INTEGER                  | sim      | `0`                  | —                    | —          |
| `date`           | DATE                     | NOT NULL | `CURRENT_DATE`       | —                    | —          |
| `completed`      | BOOLEAN                  | sim      | `false`              | —                    | —          |

### `daily_metrics`

**RLS habilitada** · 4 policies: `Admins and managers can insert daily_metrics`, `Admins and managers can update daily_metrics`, `Admins and managers can delete daily_metrics`, `Admin and managers can read daily_metrics`

| Coluna            | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ----------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`              | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `date`            | DATE                     | NOT NULL | —                   | UNIQUE      | —          |
| `revenue`         | DECIMAL(12,2)            | NOT NULL | `0`                 | —           | —          |
| `revenue_goal`    | DECIMAL(12,2)            | NOT NULL | `0`                 | —           | —          |
| `new_clients`     | INTEGER                  | NOT NULL | `0`                 | —           | —          |
| `total_sales`     | INTEGER                  | NOT NULL | `0`                 | —           | —          |
| `conversion_rate` | DECIMAL(5,2)             | NOT NULL | `0`                 | —           | —          |
| `avg_ticket`      | DECIMAL(12,2)            | NOT NULL | `0`                 | —           | —          |
| `created_at`      | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |

### `daily_streak_achievements`

**RLS habilitada** · 3 policies: `Users can insert own daily_streak_achievements`, `Users can update own daily_streak_achievements`, `Users can read own daily_streak_achievements`

| Coluna           | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`             | uuid                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id` | uuid                     | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `streak_type`    | text                     | NOT NULL | —                   | —                     | —          |
| `streak_count`   | integer                  | NOT NULL | —                   | —                     | —          |
| `xp_awarded`     | integer                  | NOT NULL | `0`                 | —                     | —          |
| `created_at`     | timestamp with time zone | NOT NULL | `now()`             | —                     | —          |

### `dashboard_layouts`

**RLS habilitada** · 1 policies: `Users can manage own dashboard layout`

| Coluna           | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `layout_config`  | JSONB       | NOT NULL | `'[]'`              | —                     | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `updated_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |

### `data_access_log`

**RLS habilitada** · 1 policies: `Users can view own data access`

| Coluna       | Tipo                     | Nulo     | Default              | Constraints          | Comentário |
| ------------ | ------------------------ | -------- | -------------------- | -------------------- | ---------- |
| `id`         | UUID                     | NOT NULL | `uuid_generate_v4()` | PK                   | —          |
| `user_id`    | UUID                     | sim      | —                    | FK → `auth.users.id` | —          |
| `table_name` | TEXT                     | NOT NULL | —                    | —                    | —          |
| `record_id`  | UUID                     | sim      | —                    | —                    | —          |
| `action`     | TEXT                     | NOT NULL | —                    | —                    | —          |
| `created_at` | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —                    | —          |

### `db_rollback_snapshots`

**RLS habilitada** · 1 policies: `Admins can view rollback snapshots`

| Coluna          | Tipo        | Nulo     | Default             | Constraints | Comentário |
| --------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`            | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `captured_at`   | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `xact_commit`   | BIGINT      | NOT NULL | —                   | —           | —          |
| `xact_rollback` | BIGINT      | NOT NULL | —                   | —           | —          |
| `deadlocks`     | BIGINT      | NOT NULL | `0`                 | —           | —          |
| `temp_files`    | BIGINT      | NOT NULL | `0`                 | —           | —          |
| `temp_bytes`    | BIGINT      | NOT NULL | `0`                 | —           | —          |

### `dead_letter_replay_audit`

**RLS habilitada** · 1 policies: `admins read dlq replay audit`

| Coluna           | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`             | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `job_id`         | uuid        | NOT NULL | —                   | —           | —          |
| `performed_by`   | uuid        | sim      | —                   | —           | —          |
| `performed_role` | text        | NOT NULL | —                   | —           | —          |
| `outcome`        | text        | NOT NULL | —                   | —           | —          |
| `created_at`     | timestamptz | NOT NULL | `now()`             | —           | —          |

### `deal_chat_history`

**RLS habilitada** · 3 policies: `Users can delete own chat history`, `Users can read own deal_chat_history`, `Users can insert own deal_chat_history`

| Coluna           | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `deal_id`        | UUID                     | NOT NULL | —                   | FK → `sales.id`       | —          |
| `salesperson_id` | UUID                     | sim      | —                   | FK → `salespeople.id` | —          |
| `question`       | TEXT                     | NOT NULL | —                   | —                     | —          |
| `response`       | TEXT                     | sim      | —                   | —                     | —          |
| `created_at`     | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |
| `question_type`  | text                     | NOT NULL | `'general'`         | —                     | —          |

### `deal_committee_coverage`

**RLS habilitada** · 2 policies: `Owners view own coverage`, `Service can upsert coverage`

| Coluna              | Tipo        | Nulo     | Default             | Constraints              | Comentário |
| ------------------- | ----------- | -------- | ------------------- | ------------------------ | ---------- |
| `id`                | uuid        | NOT NULL | `gen_random_uuid()` | PK                       | —          |
| `sale_id`           | uuid        | NOT NULL | —                   | UNIQUE · FK → `sales.id` | —          |
| `owner_id`          | uuid        | NOT NULL | —                   | —                        | —          |
| `coverage_score`    | int         | NOT NULL | `0`                 | —                        | —          |
| `tier`              | text        | NOT NULL | `'weak'`            | —                        | —          |
| `gaps`              | jsonb       | NOT NULL | `'[]'::jsonb`       | —                        | —          |
| `risks`             | jsonb       | NOT NULL | `'[]'::jsonb`       | —                        | —          |
| `stakeholder_count` | int         | NOT NULL | `0`                 | —                        | —          |
| `calculated_at`     | timestamptz | NOT NULL | `now()`             | —                        | —          |
| `created_at`        | timestamptz | NOT NULL | `now()`             | —                        | —          |
| `updated_at`        | timestamptz | NOT NULL | `now()`             | —                        | —          |

### `deal_health_history`

**RLS habilitada** · 1 policies: `Authenticated users can view health history`

| Coluna        | Tipo        | Nulo     | Default             | Constraints     | Comentário |
| ------------- | ----------- | -------- | ------------------- | --------------- | ---------- |
| `id`          | uuid        | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `sale_id`     | uuid        | NOT NULL | —                   | FK → `sales.id` | —          |
| `owner_id`    | uuid        | NOT NULL | —                   | —               | —          |
| `score`       | int         | NOT NULL | —                   | —               | —          |
| `tier`        | text        | NOT NULL | —                   | —               | —          |
| `delta`       | int         | NOT NULL | `0`                 | —               | —          |
| `snapshot_at` | timestamptz | NOT NULL | `now()`             | —               | —          |

### `deal_health_scores`

**RLS habilitada** · 2 policies: `View health via sale access`, `Authenticated insert health scores`

| Coluna                | Tipo        | Nulo     | Default             | Constraints     | Comentário |
| --------------------- | ----------- | -------- | ------------------- | --------------- | ---------- |
| `id`                  | UUID        | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `sale_id`             | UUID        | NOT NULL | —                   | FK → `sales.id` | —          |
| `health_score`        | INTEGER     | NOT NULL | —                   | —               | —          |
| `health_label`        | TEXT        | NOT NULL | —                   | —               | —          |
| `positive_factors`    | JSONB       | sim      | `'[]'::jsonb`       | —               | —          |
| `negative_factors`    | JSONB       | sim      | `'[]'::jsonb`       | —               | —          |
| `ai_recommendation`   | TEXT        | sim      | —                   | —               | —          |
| `computed_at`         | TIMESTAMPTZ | NOT NULL | `now()`             | —               | —          |
| `created_at`          | TIMESTAMPTZ | NOT NULL | `now()`             | —               | —          |
| `owner_id`            | uuid        | sim      | —                   | —               | —          |
| `tier`                | text        | NOT NULL | `'watch'`           | —               | —          |
| `factors`             | jsonb       | NOT NULL | `'[]'::jsonb`       | —               | —          |
| `recommended_actions` | jsonb       | NOT NULL | `'[]'::jsonb`       | —               | —          |
| `last_activity_at`    | timestamptz | sim      | —                   | —               | —          |
| `days_in_stage`       | int         | sim      | `0`                 | —               | —          |
| `updated_at`          | timestamptz | NOT NULL | `now()`             | —               | —          |

### `deal_outcomes`

**RLS habilitada** · 4 policies: `Users can read own outcomes or admins all`, `Users can insert own outcomes`, `Users can update own outcomes`, `Users can delete own outcomes`

| Coluna           | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `sale_id`        | UUID                     | sim      | —                   | FK → `sales.id`       | —          |
| `salesperson_id` | UUID                     | sim      | —                   | FK → `salespeople.id` | —          |
| `outcome`        | TEXT                     | NOT NULL | —                   | —                     | —          |
| `reason`         | TEXT                     | NOT NULL | —                   | —                     | —          |
| `notes`          | TEXT                     | sim      | —                   | —                     | —          |
| `created_at`     | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |

### `deal_probability_scores`

**RLS habilitada** · 2 policies: `Authenticated read deal scores`, `Admin/manager write deal scores`

| Coluna                   | Tipo        | Nulo     | Default             | Constraints     | Comentário |
| ------------------------ | ----------- | -------- | ------------------- | --------------- | ---------- |
| `id`                     | uuid        | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `sale_id`                | uuid        | NOT NULL | —                   | FK → `sales.id` | —          |
| `raw_probability`        | numeric     | NOT NULL | `0`                 | —               | —          |
| `calibrated_probability` | numeric     | NOT NULL | `0`                 | —               | —          |
| `confidence`             | numeric     | NOT NULL | `0`                 | —               | —          |
| `factors`                | jsonb       | NOT NULL | `'{}'::jsonb`       | —               | —          |
| `calculated_at`          | timestamptz | NOT NULL | `now()`             | —               | —          |

### `deal_risk_signals`

**RLS habilitada** · 3 policies: `View signals via sale access`, `Authenticated insert signals`, `Owners resolve own signals`

| Coluna        | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`          | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `sale_id`     | UUID        | NOT NULL | —                   | FK → `sales.id`       | —          |
| `signal_type` | TEXT        | NOT NULL | —                   | —                     | —          |
| `severity`    | TEXT        | NOT NULL | —                   | —                     | —          |
| `description` | TEXT        | NOT NULL | —                   | —                     | —          |
| `detected_at` | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `resolved_at` | TIMESTAMPTZ | sim      | —                   | —                     | —          |
| `resolved_by` | UUID        | sim      | —                   | FK → `salespeople.id` | —          |
| `metadata`    | JSONB       | sim      | `'{}'::jsonb`       | —                     | —          |

### `deal_stage_history`

**RLS habilitada** · 3 policies: `Users can insert own deal_stage_history`, `Users can update own deal_stage_history`, `Users can read own deal_stage_history`

| Coluna       | Tipo                     | Nulo     | Default             | Constraints     | Comentário |
| ------------ | ------------------------ | -------- | ------------------- | --------------- | ---------- |
| `id`         | UUID                     | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `sale_id`    | UUID                     | sim      | —                   | FK → `sales.id` | —          |
| `stage`      | TEXT                     | NOT NULL | —                   | —               | —          |
| `entered_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —               | —          |
| `exited_at`  | TIMESTAMP WITH TIME ZONE | sim      | —                   | —               | —          |

### `deal_stage_transitions`

**RLS habilitada** · 2 policies: `auth read stage transitions`, `admin manager write stage transitions`

| Coluna            | Tipo        | Nulo     | Default             | Constraints     | Comentário |
| ----------------- | ----------- | -------- | ------------------- | --------------- | ---------- |
| `id`              | uuid        | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `sale_id`         | uuid        | NOT NULL | —                   | FK → `sales.id` | —          |
| `from_stage`      | text        | sim      | —                   | —               | —          |
| `to_stage`        | text        | NOT NULL | —                   | —               | —          |
| `entered_at`      | timestamptz | NOT NULL | `now()`             | —               | —          |
| `exited_at`       | timestamptz | sim      | —                   | —               | —          |
| `duration_hours`  | numeric     | NOT NULL | —                   | —               | —          |
| `transitioned_by` | uuid        | sim      | —                   | —               | —          |
| `created_at`      | timestamptz | NOT NULL | `now()`             | —               | —          |

### `deal_stakeholders`

**RLS habilitada** · 4 policies: `Owners view own stakeholders`, `Owners insert own stakeholders`, `Owners update own stakeholders`, `Owners delete own stakeholders`

| Coluna                | Tipo        | Nulo     | Default             | Constraints     | Comentário |
| --------------------- | ----------- | -------- | ------------------- | --------------- | ---------- |
| `id`                  | uuid        | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `sale_id`             | uuid        | NOT NULL | —                   | FK → `sales.id` | —          |
| `owner_id`            | uuid        | NOT NULL | —                   | —               | —          |
| `name`                | text        | NOT NULL | —                   | —               | —          |
| `role_title`          | text        | sim      | —                   | —               | —          |
| `dmu_role`            | text        | NOT NULL | `'unknown'`         | —               | —          |
| `influence_level`     | text        | NOT NULL | `'medium'`          | —               | —          |
| `engagement_score`    | int         | NOT NULL | `0`                 | —               | —          |
| `sentiment`           | text        | NOT NULL | `'neutral'`         | —               | —          |
| `email`               | text        | sim      | —                   | —               | —          |
| `phone`               | text        | sim      | —                   | —               | —          |
| `linkedin_url`        | text        | sim      | —                   | —               | —          |
| `notes`               | text        | sim      | —                   | —               | —          |
| `signals`             | jsonb       | NOT NULL | `'[]'::jsonb`       | —               | —          |
| `last_interaction_at` | timestamptz | sim      | —                   | —               | —          |
| `source`              | text        | NOT NULL | `'manual'`          | —               | —          |
| `created_at`          | timestamptz | NOT NULL | `now()`             | —               | —          |
| `updated_at`          | timestamptz | NOT NULL | `now()`             | —               | —          |
| `evidence_quote`      | text        | sim      | —                   | —               | —          |
| `confidence`          | numeric     | sim      | —                   | —               | —          |

### `deal_velocity_alerts`

**RLS habilitada** · 2 policies: `auth read velocity alerts`, `admin manager write velocity alerts`

| Coluna           | Tipo        | Nulo     | Default             | Constraints              | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ------------------------ | ---------- |
| `id`             | uuid        | NOT NULL | `gen_random_uuid()` | PK                       | —          |
| `sale_id`        | uuid        | NOT NULL | —                   | UNIQUE · FK → `sales.id` | —          |
| `current_stage`  | text        | NOT NULL | —                   | —                        | —          |
| `hours_in_stage` | numeric     | NOT NULL | `0`                 | —                        | —          |
| `baseline_p75`   | numeric     | NOT NULL | `0`                 | —                        | —          |
| `baseline_p90`   | numeric     | NOT NULL | `0`                 | —                        | —          |
| `severity`       | text        | NOT NULL | `'watch'`           | —                        | —          |
| `recommendation` | text        | sim      | —                   | —                        | —          |
| `detected_at`    | timestamptz | NOT NULL | `now()`             | —                        | —          |

### `deal_velocity_predictions`

**RLS habilitada** · 2 policies: `dvp_select_own_or_admin`, `dvp_admin_write`

| Coluna                     | Tipo        | Nulo     | Default             | Constraints              | Comentário |
| -------------------------- | ----------- | -------- | ------------------- | ------------------------ | ---------- |
| `id`                       | UUID        | NOT NULL | `gen_random_uuid()` | PK                       | —          |
| `sale_id`                  | UUID        | NOT NULL | —                   | UNIQUE · FK → `sales.id` | —          |
| `owner_id`                 | UUID        | sim      | —                   | —                        | —          |
| `predicted_close_date`     | DATE        | sim      | —                   | —                        | —          |
| `predicted_days_remaining` | INT         | sim      | —                   | —                        | —          |
| `confidence_score`         | INT         | NOT NULL | `0`                 | —                        | —          |
| `confidence_tier`          | TEXT        | NOT NULL | `'low'`             | —                        | —          |
| `velocity_status`          | TEXT        | NOT NULL | `'on_track'`        | —                        | —          |
| `current_stage`            | TEXT        | sim      | —                   | —                        | —          |
| `days_in_stage`            | INT         | sim      | —                   | —                        | —          |
| `expected_days_in_stage`   | NUMERIC     | sim      | —                   | —                        | —          |
| `stage_velocity_ratio`     | NUMERIC     | sim      | —                   | —                        | —          |
| `factors`                  | JSONB       | NOT NULL | `'{"drivers":[]`    | —                        | —          |
| `model_version`            | TEXT        | NOT NULL | `'v1'`              | —                        | —          |
| `calculated_at`            | TIMESTAMPTZ | NOT NULL | `now()`             | —                        | —          |
| `created_at`               | TIMESTAMPTZ | NOT NULL | `now()`             | —                        | —          |
| `updated_at`               | TIMESTAMPTZ | NOT NULL | `now()`             | —                        | —          |

### `demand_forecasts`

**RLS habilitada** · 4 policies: `Authenticated users can view demand forecasts`, `Admins and managers can insert demand forecasts`, `Admins and managers can update demand forecasts`, `Admins and managers can delete demand forecasts`

| Coluna               | Tipo                     | Nulo     | Default             | Constraints        | Comentário |
| -------------------- | ------------------------ | -------- | ------------------- | ------------------ | ---------- |
| `id`                 | UUID                     | NOT NULL | `gen_random_uuid()` | PK                 | —          |
| `product_id`         | UUID                     | sim      | —                   | FK → `products.id` | —          |
| `forecast_date`      | DATE                     | NOT NULL | —                   | —                  | —          |
| `predicted_quantity` | INTEGER                  | NOT NULL | `0`                 | —                  | —          |
| `predicted_revenue`  | NUMERIC(12,2)            | NOT NULL | `0`                 | —                  | —          |
| `confidence_score`   | NUMERIC(5,2)             | sim      | `0.80`              | —                  | —          |
| `factors`            | JSONB                    | sim      | `'{}'`              | —                  | —          |
| `model_version`      | TEXT                     | sim      | `'v1'`              | —                  | —          |
| `created_at`         | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                  | —          |
| `updated_at`         | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                  | —          |

### `dialer_queue_items`

**RLS habilitada** · 2 policies: `View items via queue ownership`, `Manage items via queue ownership`

| Coluna           | Tipo        | Nulo     | Default             | Constraints                      | Comentário |
| ---------------- | ----------- | -------- | ------------------- | -------------------------------- | ---------- |
| `id`             | uuid        | NOT NULL | `gen_random_uuid()` | PK                               | —          |
| `queue_id`       | uuid        | NOT NULL | —                   | UNIQUE · FK → `dialer_queues.id` | —          |
| `sale_id`        | uuid        | NOT NULL | —                   | UNIQUE · FK → `sales.id`         | —          |
| `score`          | numeric     | NOT NULL | `0`                 | —                                | —          |
| `queue_position` | integer     | NOT NULL | `0`                 | —                                | —          |
| `status`         | text        | NOT NULL | `'pending'`         | —                                | —          |
| `snooze_until`   | timestamptz | sim      | —                   | —                                | —          |
| `added_at`       | timestamptz | NOT NULL | `now()`             | —                                | —          |
| `completed_at`   | timestamptz | sim      | —                   | —                                | —          |

### `dialer_queues`

**RLS habilitada** · 2 policies: `Owners view own queues`, `Owners manage own queues`

| Coluna              | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`                | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `owner_id`          | uuid        | NOT NULL | —                   | —           | —          |
| `name`              | text        | NOT NULL | —                   | —           | —          |
| `filter`            | jsonb       | NOT NULL | `'{}'::jsonb`       | —           | —          |
| `priority_strategy` | text        | NOT NULL | `'hybrid'`          | —           | —          |
| `is_active`         | boolean     | NOT NULL | `true`              | —           | —          |
| `last_built_at`     | timestamptz | sim      | —                   | —           | —          |
| `created_at`        | timestamptz | NOT NULL | `now()`             | —           | —          |
| `updated_at`        | timestamptz | NOT NULL | `now()`             | —           | —          |

### `digital_signatures`

**RLS habilitada** · 4 policies: `Admins and managers can delete digital_signatures`, `Users can read own digital_signatures`, `Users can update own digital_signatures`, `Users can insert own digital_signatures`

| Coluna        | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| ------------- | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`          | UUID                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `title`       | TEXT                     | NOT NULL | —                   | —                     | —          |
| `description` | TEXT                     | sim      | —                   | —                     | —          |
| `status`      | TEXT                     | NOT NULL | `'draft'`           | —                     | —          |
| `file_url`    | TEXT                     | sim      | —                   | —                     | —          |
| `created_by`  | UUID                     | sim      | —                   | FK → `salespeople.id` | —          |
| `created_at`  | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |
| `updated_at`  | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |
| `expires_at`  | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                     | —          |
| `signed_at`   | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                     | —          |

### `document_signers`

**RLS habilitada** · 2 policies: `Admins and managers can delete document_signers`, `Users can read own document_signers`

| Coluna        | Tipo                     | Nulo     | Default             | Constraints                  | Comentário |
| ------------- | ------------------------ | -------- | ------------------- | ---------------------------- | ---------- |
| `id`          | UUID                     | NOT NULL | `gen_random_uuid()` | PK                           | —          |
| `document_id` | UUID                     | NOT NULL | —                   | FK → `digital_signatures.id` | —          |
| `name`        | TEXT                     | NOT NULL | —                   | —                            | —          |
| `email`       | TEXT                     | NOT NULL | —                   | —                            | —          |
| `status`      | TEXT                     | NOT NULL | `'pending'`         | —                            | —          |
| `signed_at`   | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                            | —          |
| `sign_order`  | INTEGER                  | sim      | `1`                 | —                            | —          |
| `created_at`  | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                            | —          |

### `duplicate_block_logs`

**RLS habilitada** · 1 policies: `Authenticated users can view duplicate block logs`

| Coluna             | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------ | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`               | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `created_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `entity_name`      | TEXT        | NOT NULL | —                   | —           | —          |
| `block_type`       | TEXT        | NOT NULL | —                   | —           | —          |
| `status`           | TEXT        | NOT NULL | `'Blocked'`         | —           | —          |
| `auditor`          | TEXT        | NOT NULL | `'System`           | —           | —          |
| `confidence_score` | FLOAT8      | NOT NULL | `1.0`               | —           | —          |
| `details`          | JSONB       | sim      | `'{}'::jsonb`       | —           | —          |

### `edge_retry_events`

**RLS habilitada** · 2 policies: `admins_can_read_edge_retry_events`, `service_role_can_insert_edge_retry_events`

| Coluna           | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `function_name`  | TEXT        | NOT NULL | —                   | —           | —          |
| `operation`      | TEXT        | NOT NULL | —                   | —           | —          |
| `attempt`        | INTEGER     | NOT NULL | —                   | —           | —          |
| `total_attempts` | INTEGER     | sim      | —                   | —           | —          |
| `outcome`        | TEXT        | NOT NULL | —                   | —           | —          |
| `status_code`    | INTEGER     | sim      | —                   | —           | —          |
| `error_name`     | TEXT        | sim      | —                   | —           | —          |
| `error_message`  | TEXT        | sim      | —                   | —           | —          |
| `delay_ms`       | INTEGER     | sim      | —                   | —           | —          |
| `request_id`     | TEXT        | sim      | —                   | —           | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `email_bulk_drafts`

**RLS habilitada** · 4 policies: `draft access via parent job`, `draft insert via parent job`, `draft update via parent job`, `draft delete via parent job`

| Coluna                  | Tipo        | Nulo     | Default             | Constraints               | Comentário |
| ----------------------- | ----------- | -------- | ------------------- | ------------------------- | ---------- |
| `id`                    | uuid        | NOT NULL | `gen_random_uuid()` | PK                        | —          |
| `job_id`                | uuid        | NOT NULL | —                   | FK → `email_bulk_jobs.id` | —          |
| `sale_id`               | uuid        | sim      | —                   | —                         | —          |
| `client_id`             | uuid        | sim      | —                   | —                         | —          |
| `recipient_email`       | text        | sim      | —                   | —                         | —          |
| `recipient_name`        | text        | sim      | —                   | —                         | —          |
| `subject`               | text        | NOT NULL | `''`                | —                         | —          |
| `body`                  | text        | NOT NULL | `''`                | —                         | —          |
| `personalization_notes` | text        | sim      | —                   | —                         | —          |
| `approved`              | boolean     | NOT NULL | `false`             | —                         | —          |
| `sent_at`               | timestamptz | sim      | —                   | —                         | —          |
| `error`                 | text        | sim      | —                   | —                         | —          |
| `created_at`            | timestamptz | NOT NULL | `now()`             | —                         | —          |
| `updated_at`            | timestamptz | NOT NULL | `now()`             | —                         | —          |
| `retry_count`           | INTEGER     | NOT NULL | `0`                 | —                         | —          |
| `next_retry_at`         | TIMESTAMPTZ | sim      | —                   | —                         | —          |
| `last_error_at`         | TIMESTAMPTZ | sim      | —                   | —                         | —          |
| `last_error_message`    | text        | sim      | —                   | —                         | —          |
| `recovered_at`          | timestamptz | sim      | —                   | —                         | —          |

### `email_bulk_jobs`

**RLS habilitada** · 4 policies: `owner can view own bulk jobs`, `owner can insert own bulk jobs`, `owner can update own bulk jobs`, `owner can delete own bulk jobs`

| Coluna          | Tipo        | Nulo     | Default             | Constraints | Comentário |
| --------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`            | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `owner_id`      | uuid        | NOT NULL | —                   | —           | —          |
| `prompt`        | text        | NOT NULL | —                   | —           | —          |
| `tone`          | text        | NOT NULL | `'consultivo'`      | —           | —          |
| `language`      | text        | NOT NULL | `'pt-BR'`           | —           | —          |
| `target_count`  | int         | NOT NULL | `0`                 | —           | —          |
| `status`        | text        | NOT NULL | `'draft'`           | —           | —          |
| `error_message` | text        | sim      | —                   | —           | —          |
| `created_at`    | timestamptz | NOT NULL | `now()`             | —           | —          |
| `updated_at`    | timestamptz | NOT NULL | `now()`             | —           | —          |
| `completed_at`  | timestamptz | sim      | —                   | —           | —          |

### `email_engagement_score_history`

**RLS habilitada** · 1 policies: `Owners view own engagement history`

| Coluna        | Tipo        | Nulo     | Default             | Constraints     | Comentário |
| ------------- | ----------- | -------- | ------------------- | --------------- | ---------- |
| `id`          | UUID        | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `sale_id`     | UUID        | NOT NULL | —                   | FK → `sales.id` | —          |
| `score`       | INT         | NOT NULL | —                   | —               | —          |
| `tier`        | TEXT        | NOT NULL | —                   | —               | —          |
| `captured_at` | TIMESTAMPTZ | NOT NULL | `now()`             | —               | —          |

### `email_engagement_scores`

**RLS habilitada** · 2 policies: `Owners view own engagement scores`, `Admins manage engagement scores`

| Coluna                 | Tipo         | Nulo     | Default             | Constraints              | Comentário |
| ---------------------- | ------------ | -------- | ------------------- | ------------------------ | ---------- |
| `id`                   | UUID         | NOT NULL | `gen_random_uuid()` | PK                       | —          |
| `sale_id`              | UUID         | NOT NULL | —                   | UNIQUE · FK → `sales.id` | —          |
| `score`                | INT          | NOT NULL | `0`                 | —                        | —          |
| `tier`                 | TEXT         | NOT NULL | `'cold'`            | —                        | —          |
| `open_rate`            | NUMERIC(5,2) | NOT NULL | `0`                 | —                        | —          |
| `click_rate`           | NUMERIC(5,2) | NOT NULL | `0`                 | —                        | —          |
| `reply_rate`           | NUMERIC(5,2) | NOT NULL | `0`                 | —                        | —          |
| `avg_response_minutes` | INT          | sim      | —                   | —                        | —          |
| `recency_days`         | INT          | sim      | —                   | —                        | —          |
| `total_sent`           | INT          | NOT NULL | `0`                 | —                        | —          |
| `total_opens`          | INT          | NOT NULL | `0`                 | —                        | —          |
| `total_clicks`         | INT          | NOT NULL | `0`                 | —                        | —          |
| `total_replies`        | INT          | NOT NULL | `0`                 | —                        | —          |
| `last_calculated_at`   | TIMESTAMPTZ  | NOT NULL | `now()`             | —                        | —          |
| `created_at`           | TIMESTAMPTZ  | NOT NULL | `now()`             | —                        | —          |

### `email_logs`

**RLS habilitada** · 1 policies: `Admins and managers can view email_logs`

| Coluna            | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ----------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`              | uuid                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `function_name`   | text                     | NOT NULL | —                   | —           | —          |
| `recipient_email` | text                     | NOT NULL | —                   | —           | —          |
| `subject`         | text                     | sim      | —                   | —           | —          |
| `status`          | text                     | NOT NULL | `'sent'`            | —           | —          |
| `error_message`   | text                     | sim      | —                   | —           | —          |
| `metadata`        | jsonb                    | sim      | `'{}'::jsonb`       | —           | —          |
| `created_at`      | timestamp with time zone | NOT NULL | `now()`             | —           | —          |

### `email_opt_outs`

**RLS habilitada** · 0 policies

| Coluna       | Tipo        | Nulo     | Default              | Constraints | Comentário |
| ------------ | ----------- | -------- | -------------------- | ----------- | ---------- |
| `id`         | uuid        | NOT NULL | `gen_random_uuid()`  | PK          | —          |
| `email`      | text        | NOT NULL | —                    | —           | —          |
| `reason`     | text        | sim      | —                    | —           | —          |
| `source`     | text        | NOT NULL | `'unsubscribe_link'` | —           | —          |
| `owner_id`   | uuid        | sim      | —                    | —           | —          |
| `metadata`   | jsonb       | NOT NULL | `'{}'::jsonb`        | —           | —          |
| `created_at` | timestamptz | NOT NULL | `now()`              | —           | —          |

### `email_tracking_events`

**RLS habilitada** · 1 policies: `Users can view own email tracking`

| Coluna            | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ----------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `sale_id`         | UUID        | sim      | —                   | FK → `sales.id`       | —          |
| `salesperson_id`  | UUID        | sim      | —                   | FK → `salespeople.id` | —          |
| `recipient_email` | TEXT        | NOT NULL | —                   | —                     | —          |
| `subject`         | TEXT        | NOT NULL | —                   | —                     | —          |
| `event_type`      | TEXT        | NOT NULL | `'sent'`            | —                     | —          |
| `tracked_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `metadata`        | JSONB       | sim      | `'{}'`              | —                     | —          |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |

### `embedded_report_tokens`

**RLS habilitada** · 1 policies: `creator_full_access_tokens`

| Coluna            | Tipo        | Nulo     | Default             | Constraints              | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ------------------------ | ---------- |
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK                       | —          |
| `report_id`       | UUID        | NOT NULL | —                   | FK → `custom_reports.id` | —          |
| `public_token`    | UUID        | NOT NULL | `gen_random_uuid()` | UNIQUE                   | —          |
| `expires_at`      | TIMESTAMPTZ | sim      | —                   | —                        | —          |
| `allowed_domains` | TEXT[]      | sim      | `'{}'`              | —                        | —          |
| `view_count`      | INTEGER     | NOT NULL | `0`                 | —                        | —          |
| `last_viewed_at`  | TIMESTAMPTZ | sim      | —                   | —                        | —          |
| `is_active`       | BOOLEAN     | NOT NULL | `true`              | —                        | —          |
| `created_by`      | UUID        | NOT NULL | —                   | —                        | —          |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                        | —          |

### `engagement_score_history`

**RLS habilitada** · 2 policies: `esh_select_owner`, `esh_admin_all`

| Coluna         | Tipo         | Nulo     | Default             | Constraints | Comentário |
| -------------- | ------------ | -------- | ------------------- | ----------- | ---------- |
| `id`           | UUID         | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `contact_id`   | UUID         | NOT NULL | —                   | UNIQUE      | —          |
| `contact_type` | TEXT         | NOT NULL | —                   | UNIQUE      | —          |
| `score`        | NUMERIC(5,2) | NOT NULL | —                   | —           | —          |
| `tier`         | TEXT         | NOT NULL | —                   | —           | —          |
| `captured_at`  | DATE         | NOT NULL | `CURRENT_DATE`      | UNIQUE      | —          |
| `created_at`   | TIMESTAMPTZ  | NOT NULL | `now()`             | —           | —          |

### `enriched_company_intelligence`

**RLS habilitada** · 1 policies: `Admins e Managers podem ver inteligência de empresas`

| Coluna                     | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| -------------------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`                       | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `company_name`             | TEXT                     | NOT NULL | —                   | UNIQUE      | —          |
| `domain`                   | TEXT                     | sim      | —                   | —           | —          |
| `headcount_range`          | TEXT                     | sim      | —                   | —           | —          |
| `estimated_annual_revenue` | TEXT                     | sim      | —                   | —           | —          |
| `funding_stage`            | TEXT                     | sim      | —                   | —           | —          |
| `total_funding`            | TEXT                     | sim      | —                   | —           | —          |
| `tech_stack`               | TEXT[]                   | sim      | —                   | —           | —          |
| `industry`                 | TEXT                     | sim      | —                   | —           | —          |
| `hq_location`              | TEXT                     | sim      | —                   | —           | —          |
| `linkedin_url`             | TEXT                     | sim      | —                   | —           | —          |
| `last_enriched_at`         | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —          |
| `created_at`               | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —          |
| `updated_at`               | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —          |

### `entity_versions`

**RLS habilitada** · 2 policies: `Users can insert versions`, `Authenticated users can view versions`

| Coluna           | Tipo        | Nulo     | Default             | Constraints          | Comentário |
| ---------------- | ----------- | -------- | ------------------- | -------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `entity_type`    | TEXT        | NOT NULL | —                   | UNIQUE               | —          |
| `entity_id`      | UUID        | NOT NULL | —                   | UNIQUE               | —          |
| `version_number` | INT         | NOT NULL | —                   | UNIQUE               | —          |
| `data`           | JSONB       | NOT NULL | —                   | —                    | —          |
| `changed_by`     | UUID        | sim      | —                   | FK → `auth.users.id` | —          |
| `changed_at`     | TIMESTAMPTZ | sim      | `NOW()`             | —                    | —          |
| `change_summary` | TEXT        | sim      | —                   | —                    | —          |

### `error_logs`

**RLS habilitada** · 2 policies: `Only admins can view error logs`, `Authenticated users can insert their own error logs`

| Coluna        | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`          | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `message`     | TEXT                     | NOT NULL | —                   | —           | —          |
| `stack_trace` | TEXT                     | sim      | —                   | —           | —          |
| `severity`    | TEXT                     | NOT NULL | `'medium'`          | —           | —          |
| `category`    | TEXT                     | NOT NULL | `'unknown'`         | —           | —          |
| `component`   | TEXT                     | sim      | —                   | —           | —          |
| `metadata`    | JSONB                    | sim      | `'{}'`              | —           | —          |
| `url`         | TEXT                     | sim      | —                   | —           | —          |
| `user_agent`  | TEXT                     | sim      | —                   | —           | —          |
| `user_id`     | UUID                     | sim      | `auth.uid()`        | —           | —          |
| `created_at`  | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |

### `executive_briefings`

**RLS habilitada** · 4 policies: `Authenticated users can view briefings`, `Managers and admins can create briefings`, `Admins can update briefings`, `Admins can delete briefings`

| Coluna                | Tipo        | Nulo     | Default             | Constraints | Comentário |
| --------------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`                  | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `briefing_date`       | DATE        | NOT NULL | `CURRENT_DATE`      | UNIQUE      | —          |
| `pulse_score`         | INTEGER     | NOT NULL | `0`                 | —           | —          |
| `headline`            | TEXT        | NOT NULL | —                   | —           | —          |
| `narrative`           | TEXT        | NOT NULL | `''`                | —           | —          |
| `key_wins`            | JSONB       | NOT NULL | `'[]'::jsonb`       | —           | —          |
| `key_risks`           | JSONB       | NOT NULL | `'[]'::jsonb`       | —           | —          |
| `recommended_actions` | JSONB       | NOT NULL | `'[]'::jsonb`       | —           | —          |
| `generated_by`        | TEXT        | NOT NULL | `'manual'`          | —           | —          |
| `created_by`          | UUID        | sim      | —                   | —           | —          |
| `created_at`          | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `expansion_opportunities`

**RLS habilitada** · 2 policies: `cs_eo_select`, `cs_eo_modify`

| Coluna                 | Tipo                        | Nulo     | Default             | Constraints                   | Comentário |
| ---------------------- | --------------------------- | -------- | ------------------- | ----------------------------- | ---------- |
| `id`                   | uuid                        | NOT NULL | `gen_random_uuid()` | PK                            | —          |
| `account_id`           | uuid                        | NOT NULL | —                   | FK → `accounts.id`            | —          |
| `playbook_id`          | uuid                        | sim      | —                   | FK → `expansion_playbooks.id` | —          |
| `type`                 | public.expansion_type       | NOT NULL | `'upsell'`          | —                             | —          |
| `estimated_value`      | numeric(14,2)               | NOT NULL | `0`                 | —                             | —          |
| `status`               | public.expansion_opp_status | NOT NULL | `'identified'`      | —                             | —          |
| `confidence_score`     | int                         | NOT NULL | `50`                | —                             | —          |
| `notes`                | text                        | sim      | —                   | —                             | —          |
| `owner_salesperson_id` | uuid                        | sim      | —                   | FK → `salespeople.id`         | —          |
| `created_at`           | timestamptz                 | NOT NULL | `now()`             | —                             | —          |
| `updated_at`           | timestamptz                 | NOT NULL | `now()`             | —                             | —          |

### `expansion_playbooks`

**RLS habilitada** · 2 policies: `cs_ep_modify`, `Authenticated users can view expansion playbooks`

| Coluna               | Tipo                  | Nulo     | Default             | Constraints | Comentário |
| -------------------- | --------------------- | -------- | ------------------- | ----------- | ---------- |
| `id`                 | uuid                  | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `name`               | text                  | NOT NULL | —                   | —           | —          |
| `description`        | text                  | sim      | —                   | —           | —          |
| `trigger_type`       | text                  | NOT NULL | `'usage_threshold'` | —           | —          |
| `trigger_config`     | jsonb                 | NOT NULL | `'{}'::jsonb`       | —           | —          |
| `recommended_action` | text                  | sim      | —                   | —           | —          |
| `expansion_type`     | public.expansion_type | NOT NULL | `'upsell'`          | —           | —          |
| `is_active`          | boolean               | NOT NULL | `true`              | —           | —          |
| `created_at`         | timestamptz           | NOT NULL | `now()`             | —           | —          |
| `updated_at`         | timestamptz           | NOT NULL | `now()`             | —           | —          |

### `experiment_assignments`

**RLS não declarado nas migrations** · 0 policies

| Coluna          | Tipo                     | Nulo     | Default | Constraints                   | Comentário |
| --------------- | ------------------------ | -------- | ------- | ----------------------------- | ---------- |
| `user_id`       | UUID                     | NOT NULL | —       | PK · FK → `auth.users.id`     | —          |
| `experiment_id` | UUID                     | NOT NULL | —       | PK · FK → `experiments.id`    | —          |
| `variant_id`    | UUID                     | NOT NULL | —       | FK → `experiment_variants.id` | —          |
| `assigned_at`   | TIMESTAMP WITH TIME ZONE | sim      | `now()` | —                             | —          |

### `experiment_variants`

**RLS não declarado nas migrations** · 0 policies

| Coluna          | Tipo    | Nulo     | Default              | Constraints           | Comentário |
| --------------- | ------- | -------- | -------------------- | --------------------- | ---------- |
| `id`            | UUID    | NOT NULL | `uuid_generate_v4()` | PK                    | —          |
| `experiment_id` | UUID    | NOT NULL | —                    | FK → `experiments.id` | —          |
| `name`          | TEXT    | NOT NULL | —                    | —                     | —          |
| `weight`        | INTEGER | NOT NULL | `50`                 | —                     | —          |
| `config`        | JSONB   | sim      | —                    | —                     | —          |

### `experiments`

**RLS não declarado nas migrations** · 0 policies

| Coluna        | Tipo                     | Nulo     | Default              | Constraints | Comentário |
| ------------- | ------------------------ | -------- | -------------------- | ----------- | ---------- |
| `id`          | UUID                     | NOT NULL | `uuid_generate_v4()` | PK          | —          |
| `name`        | TEXT                     | NOT NULL | —                    | —           | —          |
| `description` | TEXT                     | sim      | —                    | —           | —          |
| `is_active`   | BOOLEAN                  | sim      | `true`               | —           | —          |
| `start_date`  | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —           | —          |
| `end_date`    | TIMESTAMP WITH TIME ZONE | sim      | —                    | —           | —          |
| `created_at`  | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —           | —          |

### `external_seller_map`

**RLS habilitada** · 2 policies: `Admins manage seller map`, `Authenticated read seller map`

| Coluna            | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ----------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `external_id`     | TEXT        | NOT NULL | —                   | UNIQUE                | —          |
| `external_source` | TEXT        | NOT NULL | `'gift_store'`      | UNIQUE                | —          |
| `salesperson_id`  | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `external_name`   | TEXT        | sim      | —                   | —                     | —          |
| `external_email`  | TEXT        | sim      | —                   | —                     | —          |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `updated_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |

### `feature_flags`

**RLS habilitada** · 2 policies: `Authenticated users can view feature flags`, `Only admins can manage feature flags`

| Coluna               | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| -------------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`                 | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `created_at`         | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |
| `key`                | TEXT                     | NOT NULL | —                   | UNIQUE      | —          |
| `description`        | TEXT                     | sim      | —                   | —           | —          |
| `is_enabled`         | BOOLEAN                  | NOT NULL | `false`             | —           | —          |
| `rollout_percentage` | INTEGER                  | NOT NULL | `100`               | —           | —          |
| `allowed_roles`      | TEXT[]                   | sim      | `'{}'`              | —           | —          |
| `metadata`           | JSONB                    | sim      | `'{}'`              | —           | —          |
| `updated_at`         | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |

### `feed_comments`

**RLS habilitada** · 1 policies: `Users can insert own feed_comments`

| Coluna           | Tipo        | Nulo     | Default             | Constraints            | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ---------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                     | —          |
| `feed_item_id`   | UUID        | NOT NULL | —                   | FK → `victory_feed.id` | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id`  | —          |
| `content`        | TEXT        | NOT NULL | —                   | —                      | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                      | —          |

### `feed_reactions`

**RLS habilitada** · 2 policies: `Authenticated can delete own reactions`, `Users can insert own feed_reactions`

| Coluna           | Tipo        | Nulo     | Default             | Constraints            | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ---------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                     | —          |
| `feed_item_id`   | UUID        | NOT NULL | —                   | FK → `victory_feed.id` | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id`  | —          |
| `reaction`       | TEXT        | NOT NULL | `'🔥'`              | —                      | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                      | —          |

### `follow_up_audit_logs`

**RLS habilitada** · 2 policies: `Users can read audit logs`, `Authenticated users can insert audit logs`

| Coluna        | Tipo                     | Nulo     | Default             | Constraints          | Comentário |
| ------------- | ------------------------ | -------- | ------------------- | -------------------- | ---------- |
| `id`          | UUID                     | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `sale_id`     | UUID                     | sim      | —                   | FK → `sales.id`      | —          |
| `user_id`     | UUID                     | sim      | —                   | FK → `auth.users.id` | —          |
| `action_type` | TEXT                     | NOT NULL | —                   | —                    | —          |
| `created_at`  | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                    | —          |
| `status`      | TEXT                     | sim      | `'success'`         | —                    | —          |
| `retry_count` | INTEGER                  | sim      | `0`                 | —                    | —          |

### `follow_up_notifications`

**RLS habilitada** · 1 policies: `Users can manage their own notifications`

| Coluna         | Tipo                     | Nulo     | Default             | Constraints                    | Comentário |
| -------------- | ------------------------ | -------- | ------------------- | ------------------------------ | ---------- |
| `id`           | UUID                     | NOT NULL | `gen_random_uuid()` | PK                             | —          |
| `user_id`      | UUID                     | sim      | —                   | FK → `auth.users.id`           | —          |
| `sale_id`      | UUID                     | sim      | —                   | FK → `sales.id`                | —          |
| `audit_log_id` | UUID                     | sim      | —                   | FK → `follow_up_audit_logs.id` | —          |
| `type`         | TEXT                     | NOT NULL | —                   | —                              | —          |
| `created_at`   | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                              | —          |

### `follow_up_settings`

**RLS habilitada** · 2 policies: `Admins can update follow_up_settings`, `Authenticated users can read follow_up_settings`

| Coluna                        | Tipo                     | Nulo     | Default             | Constraints                          | Comentário |
| ----------------------------- | ------------------------ | -------- | ------------------- | ------------------------------------ | ---------- |
| `id`                          | UUID                     | NOT NULL | `gen_random_uuid()` | PK                                   | —          |
| `cadence_days`                | INTEGER[]                | sim      | `'{3`               | —                                    | —          |
| `whatsapp_template`           | TEXT                     | sim      | `'Olá`              | —                                    | —          |
| `auto_reactivate_class_a`     | BOOLEAN                  | sim      | `false`             | —                                    | —          |
| `created_at`                  | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                                    | —          |
| `updated_at`                  | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                                    | —          |
| `current_whatsapp_version_id` | UUID                     | sim      | —                   | FK → `whatsapp_template_versions.id` | —          |

### `follow_up_templates`

**RLS habilitada** · 2 policies: `Admins can manage templates`, `Authenticated users can view active templates`

| Coluna       | Tipo                     | Nulo     | Default             | Constraints          | Comentário |
| ------------ | ------------------------ | -------- | ------------------- | -------------------- | ---------- |
| `id`         | UUID                     | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `name`       | TEXT                     | NOT NULL | —                   | —                    | —          |
| `content`    | TEXT                     | NOT NULL | —                   | —                    | —          |
| `variables`  | JSONB                    | sim      | `'[]'`              | —                    | —          |
| `version`    | INTEGER                  | sim      | `1`                 | —                    | —          |
| `is_active`  | BOOLEAN                  | sim      | `true`              | —                    | —          |
| `created_at` | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                    | —          |
| `updated_at` | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                    | —          |
| `created_by` | UUID                     | sim      | —                   | FK → `auth.users.id` | —          |

### `follow_up_territory_rules`

**RLS habilitada** · 2 policies: `Admins can manage territory rules`, `Users can view their own territory rules`

| Coluna           | Tipo                                     | Nulo     | Default             | Constraints                   | Comentário |
| ---------------- | ---------------------------------------- | -------- | ------------------- | ----------------------------- | ---------- |
| `id`             | UUID                                     | NOT NULL | `gen_random_uuid()` | PK                            | —          |
| `territory`      | TEXT                                     | sim      | —                   | —                             | —          |
| `salesperson_id` | UUID                                     | sim      | —                   | FK → `auth.users.id`          | —          |
| `cadence_id`     | UUID                                     | sim      | —                   | —                             | —          |
| `otherwise`      | using settings whatsapp_template_id UUID | sim      | —                   | FK → `follow_up_templates.id` | —          |
| `priority`       | INTEGER                                  | sim      | `0`                 | —                             | —          |
| `created_at`     | TIMESTAMP WITH TIME ZONE                 | sim      | `now()`             | —                             | —          |
| `updated_at`     | TIMESTAMP WITH TIME ZONE                 | sim      | `now()`             | —                             | —          |

### `forecast_accuracy`

**RLS habilitada** · 3 policies: `fa_read_auth`, `fa_write_admin_manager`, `Allow read for all authenticated users`

| Coluna             | Tipo                     | Nulo     | Default             | Constraints                           | Comentário |
| ------------------ | ------------------------ | -------- | ------------------- | ------------------------------------- | ---------- |
| `id`               | UUID                     | NOT NULL | `gen_random_uuid()` | PK                                    | —          |
| `snapshot_id`      | uuid                     | NOT NULL | —                   | UNIQUE · FK → `forecast_snapshots.id` | —          |
| `actual_amount`    | numeric                  | NOT NULL | `0`                 | —                                     | —          |
| `actual_deals`     | int                      | NOT NULL | `0`                 | —                                     | —          |
| `variance_amount`  | numeric                  | sim      | —                   | —                                     | —          |
| `variance_pct`     | numeric                  | NOT NULL | `0`                 | —                                     | —          |
| `mape`             | DECIMAL(5,2)             | sim      | —                   | —                                     | —          |
| `bias`             | text                     | NOT NULL | `'accurate'`        | —                                     | —          |
| `computed_at`      | timestamptz              | NOT NULL | `now()`             | —                                     | —          |
| `period_start`     | DATE                     | NOT NULL | —                   | —                                     | —          |
| `period_end`       | DATE                     | NOT NULL | —                   | —                                     | —          |
| `forecasted_value` | DECIMAL(12,2)            | sim      | —                   | —                                     | —          |
| `actual_value`     | DECIMAL(12,2)            | sim      | —                   | —                                     | —          |
| `deviation_pct`    | DECIMAL(5,2)             | sim      | —                   | —                                     | —          |
| `bias_score`       | DECIMAL(5,2)             | sim      | —                   | —                                     | —          |
| `created_at`       | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                                     | —          |

### `forecast_confidence_scores`

**RLS habilitada** · 2 policies: `fcs_read_auth`, `fcs_write_admin_manager`

| Coluna             | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------ | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`               | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `owner_id`         | uuid        | sim      | —                   | UNIQUE      | —          |
| `source`           | text        | NOT NULL | —                   | UNIQUE      | —          |
| `period_count`     | int         | NOT NULL | `0`                 | —           | —          |
| `avg_mape`         | numeric     | NOT NULL | `0`                 | —           | —          |
| `bias_trend`       | text        | NOT NULL | `'accurate'`        | —           | —          |
| `confidence_score` | numeric     | NOT NULL | `0`                 | —           | —          |
| `computed_at`      | timestamptz | NOT NULL | `now()`             | —           | —          |

### `forecast_deal_contributions`

**RLS habilitada** · 2 policies: `View forecast contributions via forecast access`, `Managers manage contributions`

| Coluna            | Tipo        | Nulo     | Default             | Constraints                 | Comentário |
| ----------------- | ----------- | -------- | ------------------- | --------------------------- | ---------- |
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK                          | —          |
| `forecast_id`     | UUID        | NOT NULL | —                   | FK → `revenue_forecasts.id` | —          |
| `sale_id`         | UUID        | NOT NULL | —                   | FK → `sales.id`             | —          |
| `category`        | TEXT        | NOT NULL | —                   | —                           | —          |
| `weighted_amount` | NUMERIC     | NOT NULL | `0`                 | —                           | —          |
| `probability`     | NUMERIC     | NOT NULL | `0`                 | —                           | —          |
| `reasoning`       | TEXT        | sim      | —                   | —                           | —          |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                           | —          |

### `forecast_narrative_dead_letters`

**RLS habilitada** · 1 policies: `admins read forecast narrative dlq`

| Coluna         | Tipo        | Nulo     | Default             | Constraints | Comentário |
| -------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`           | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `forecast_id`  | uuid        | sim      | —                   | —           | —          |
| `user_id`      | uuid        | sim      | —                   | —           | —          |
| `reason`       | text        | NOT NULL | —                   | —           | —          |
| `http_status`  | int         | sim      | —                   | —           | —          |
| `error_detail` | text        | sim      | —                   | —           | —          |
| `request_id`   | text        | sim      | —                   | —           | —          |
| `created_at`   | timestamptz | NOT NULL | `now()`             | —           | —          |

### `forecast_snapshots`

**RLS habilitada** · 3 policies: `fs_read_auth`, `fs_write_admin_manager`, `Allow read for all authenticated users`

| Coluna                  | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ----------------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`                    | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `period_start`          | date                     | NOT NULL | —                   | —           | —          |
| `period_end`            | date                     | NOT NULL | —                   | —           | —          |
| `owner_id`              | uuid                     | sim      | —                   | —           | —          |
| `segment`               | text                     | sim      | —                   | —           | —          |
| `forecast_amount`       | numeric                  | NOT NULL | `0`                 | —           | —          |
| `forecast_deals`        | int                      | NOT NULL | `0`                 | —           | —          |
| `weighted_amount`       | numeric                  | NOT NULL | `0`                 | —           | —          |
| `commit_amount`         | numeric                  | NOT NULL | `0`                 | —           | —          |
| `best_case_amount`      | numeric                  | NOT NULL | `0`                 | —           | —          |
| `source`                | text                     | NOT NULL | `'weighted'`        | —           | —          |
| `snapshot_at`           | timestamptz              | NOT NULL | `now()`             | —           | —          |
| `created_at`            | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —          |
| `snapshot_date`         | DATE                     | NOT NULL | `CURRENT_DATE`      | —           | —          |
| `horizon_days`          | INTEGER                  | NOT NULL | —                   | —           | —          |
| `pessimistic_value`     | DECIMAL(12,2)            | sim      | —                   | —           | —          |
| `realistic_value`       | DECIMAL(12,2)            | sim      | —                   | —           | —          |
| `optimistic_value`      | DECIMAL(12,2)            | sim      | —                   | —           | —          |
| `actual_realized_value` | DECIMAL(12,2)            | sim      | `0`                 | —           | —          |
| `confidence_at_time`    | INTEGER                  | sim      | —                   | —           | —          |
| `metadata`              | JSONB                    | sim      | —                   | —           | —          |

### `icp_data`

**RLS habilitada** · 3 policies: `Admins can insert icp_data`, `Admins can update icp_data`, `Users can read own client icp_data`

| Coluna              | Tipo                     | Nulo     | Default             | Constraints                | Comentário |
| ------------------- | ------------------------ | -------- | ------------------- | -------------------------- | ---------- |
| `id`                | UUID                     | NOT NULL | `gen_random_uuid()` | PK                         | —          |
| `client_id`         | UUID                     | NOT NULL | —                   | UNIQUE · FK → `clients.id` | —          |
| `ramo_atividade`    | TEXT                     | sim      | —                   | —                          | —          |
| `grupo_nicho`       | TEXT                     | sim      | —                   | —                          | —          |
| `capital_social`    | DECIMAL(15,2)            | sim      | —                   | —                          | —          |
| `num_colaboradores` | INTEGER                  | sim      | —                   | —                          | —          |
| `is_icp_match`      | BOOLEAN                  | sim      | `false`             | —                          | —          |
| `bitrix_id`         | TEXT                     | sim      | —                   | —                          | —          |
| `created_at`        | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                          | —          |
| `updated_at`        | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                          | —          |
| `icp_score`         | INTEGER                  | sim      | `0`                 | —                          | —          |

### `icp_parameters`

**RLS habilitada** · 2 policies: `Admins can manage ICP parameters`, `All authenticated can view ICP parameters`

| Coluna              | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ------------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`                | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `target_industries` | TEXT[]                   | sim      | `'{}'`              | —           | —          |
| `min_capital`       | NUMERIC                  | sim      | `0`                 | —           | —          |
| `min_employees`     | INTEGER                  | sim      | `0`                 | —           | —          |
| `preferred_niches`  | TEXT[]                   | sim      | `'{}'`              | —           | —          |
| `weight_industry`   | INTEGER                  | sim      | `30`                | —           | —          |
| `weight_capital`    | INTEGER                  | sim      | `20`                | —           | —          |
| `weight_employees`  | INTEGER                  | sim      | `20`                | —           | —          |
| `weight_niche`      | INTEGER                  | sim      | `30`                | —           | —          |
| `created_at`        | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —          |
| `updated_at`        | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —          |

### `inbound_reply_events`

**RLS habilitada** · 0 policies

| Coluna                  | Tipo        | Nulo     | Default             | Constraints                    | Comentário |
| ----------------------- | ----------- | -------- | ------------------- | ------------------------------ | ---------- |
| `id`                    | uuid        | NOT NULL | `gen_random_uuid()` | PK                             | —          |
| `provider`              | text        | NOT NULL | —                   | —                              | —          |
| `message_id`            | text        | sim      | —                   | —                              | —          |
| `from_email`            | text        | sim      | —                   | —                              | —          |
| `subject`               | text        | sim      | —                   | —                              | —          |
| `received_at`           | timestamptz | NOT NULL | `now()`             | —                              | —          |
| `matched_enrollment_id` | uuid        | sim      | —                   | FK → `sequence_enrollments.id` | —          |
| `event_type`            | text        | NOT NULL | `'reply'`           | —                              | —          |
| `payload`               | jsonb       | NOT NULL | `'{}'::jsonb`       | —                              | —          |
| `created_at`            | timestamptz | NOT NULL | `now()`             | —                              | —          |

### `integration_autotest_jobs`

**RLS habilitada** · 1 policies: `admins manage autotest jobs`

| Coluna        | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`          | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `started_at`  | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `finished_at` | TIMESTAMPTZ | sim      | —                   | —           | —          |
| `status`      | TEXT        | NOT NULL | `'running'`         | —           | —          |
| `total`       | INTEGER     | sim      | `0`                 | —           | —          |
| `succeeded`   | INTEGER     | sim      | `0`                 | —           | —          |
| `failed`      | INTEGER     | sim      | `0`                 | —           | —          |
| `results`     | JSONB       | sim      | —                   | —           | —          |

### `integration_autotest_settings`

**RLS habilitada** · 1 policies: `admins manage autotest settings`

| Coluna                   | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------------ | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`                     | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `singleton`              | BOOLEAN     | NOT NULL | `true`              | UNIQUE      | —          |
| `interval_minutes`       | INTEGER     | NOT NULL | `60`                | —           | —          |
| `failure_window_minutes` | INTEGER     | NOT NULL | `15`                | —           | —          |
| `enabled`                | BOOLEAN     | NOT NULL | `true`              | —           | —          |
| `updated_by`             | UUID        | sim      | —                   | —           | —          |
| `updated_at`             | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `integration_connections`

**RLS habilitada** · 1 policies: `admins manage connections`

| Coluna        | Tipo                      | Nulo     | Default             | Constraints | Comentário |
| ------------- | ------------------------- | -------- | ------------------- | ----------- | ---------- |
| `id`          | UUID                      | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `kind`        | public.integration_kind   | NOT NULL | —                   | —           | —          |
| `label`       | TEXT                      | NOT NULL | —                   | —           | —          |
| `config`      | JSONB                     | NOT NULL | `'{}'::jsonb`       | —           | —          |
| `secret_refs` | TEXT[]                    | NOT NULL | `ARRAY[]::TEXT[]`   | —           | —          |
| `source`      | public.integration_source | NOT NULL | `'db'`              | —           | —          |
| `enabled`     | BOOLEAN                   | NOT NULL | `true`              | —           | —          |
| `created_by`  | UUID                      | sim      | —                   | —           | —          |
| `created_at`  | TIMESTAMPTZ               | NOT NULL | `now()`             | —           | —          |
| `updated_at`  | TIMESTAMPTZ               | NOT NULL | `now()`             | —           | —          |

### `integration_health_checks`

**RLS habilitada** · 2 policies: `admins read health`, `admins write health`

| Coluna          | Tipo                             | Nulo     | Default             | Constraints                       | Comentário |
| --------------- | -------------------------------- | -------- | ------------------- | --------------------------------- | ---------- |
| `id`            | UUID                             | NOT NULL | `gen_random_uuid()` | PK                                | —          |
| `connection_id` | UUID                             | NOT NULL | —                   | FK → `integration_connections.id` | —          |
| `status`        | public.integration_health_status | NOT NULL | —                   | —                                 | —          |
| `latency_ms`    | INTEGER                          | sim      | —                   | —                                 | —          |
| `error`         | TEXT                             | sim      | —                   | —                                 | —          |
| `details`       | JSONB                            | sim      | —                   | —                                 | —          |
| `triggered_by`  | public.integration_trigger       | NOT NULL | `'manual'`          | —                                 | —          |
| `checked_at`    | TIMESTAMPTZ                      | NOT NULL | `now()`             | —                                 | —          |

### `integration_logs`

**RLS habilitada** · 1 policies: `Admins and managers can view integration logs`

| Coluna             | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------ | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`               | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `timestamp`        | TIMESTAMPTZ | sim      | `now()`             | —           | —          |
| `integration_type` | TEXT        | NOT NULL | —                   | —           | —          |
| `recipient`        | TEXT        | sim      | —                   | —           | —          |
| `error_message`    | TEXT        | sim      | —                   | —           | —          |
| `metadata`         | JSONB       | sim      | `'{}'::jsonb`       | —           | —          |

### `intent_audit_logs`

**RLS habilitada** · 3 policies: `Permitir leitura para todos autenticados`, `Authenticated users can view intent audit logs`, `Users can only insert their own intent logs`

| Coluna         | Tipo                     | Nulo     | Default             | Constraints | Comentário                                             |
| -------------- | ------------------------ | -------- | ------------------- | ----------- | ------------------------------------------------------ |
| `id`           | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —                                                      |
| `lead_id`      | UUID                     | sim      | —                   | —           | —                                                      |
| `event_type`   | TEXT                     | NOT NULL | —                   | —           | —                                                      |
| `created_at`   | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —                                                      |
| `rule_applied` | JSONB                    | sim      | —                   | —           | JSON containing the rule that triggered this log entry |

### `inventory_levels`

**RLS habilitada** · 4 policies: `Admins and managers can insert inventory levels`, `Admins and managers can update inventory levels`, `Admins and managers can delete inventory levels`, `Admin/manager can view inventory levels`

| Coluna              | Tipo                     | Nulo     | Default             | Constraints                 | Comentário |
| ------------------- | ------------------------ | -------- | ------------------- | --------------------------- | ---------- |
| `id`                | UUID                     | NOT NULL | `gen_random_uuid()` | PK                          | —          |
| `product_id`        | UUID                     | sim      | —                   | UNIQUE · FK → `products.id` | —          |
| `current_stock`     | INTEGER                  | NOT NULL | `0`                 | —                           | —          |
| `min_stock_level`   | INTEGER                  | NOT NULL | `10`                | —                           | —          |
| `max_stock_level`   | INTEGER                  | NOT NULL | `100`               | —                           | —          |
| `reorder_point`     | INTEGER                  | NOT NULL | `20`                | —                           | —          |
| `lead_time_days`    | INTEGER                  | sim      | `7`                 | —                           | —          |
| `last_restock_date` | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                           | —          |
| `created_at`        | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                           | —          |
| `updated_at`        | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                           | —          |

### `ip_whitelist`

**RLS habilitada** · 1 policies: `Admins can manage ip_whitelist`

| Coluna        | Tipo        | Nulo     | Default             | Constraints          | Comentário |
| ------------- | ----------- | -------- | ------------------- | -------------------- | ---------- |
| `id`          | UUID        | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `ip_address`  | TEXT        | NOT NULL | —                   | UNIQUE               | —          |
| `description` | TEXT        | sim      | —                   | —                    | —          |
| `added_by`    | UUID        | sim      | —                   | FK → `auth.users.id` | —          |
| `created_at`  | TIMESTAMPTZ | sim      | `NOW()`             | —                    | —          |
| `updated_at`  | TIMESTAMPTZ | sim      | `NOW()`             | —                    | —          |

### `known_devices`

**RLS habilitada** · 4 policies: `Users can view own devices`, `Users can insert own devices`, `Users can update own devices`, `Users can delete own devices`

| Coluna               | Tipo        | Nulo     | Default             | Constraints          | Comentário |
| -------------------- | ----------- | -------- | ------------------- | -------------------- | ---------- |
| `id`                 | UUID        | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `user_id`            | UUID        | NOT NULL | —                   | FK → `auth.users.id` | —          |
| `device_fingerprint` | TEXT        | NOT NULL | —                   | —                    | —          |
| `device_name`        | TEXT        | sim      | —                   | —                    | —          |
| `browser`            | TEXT        | sim      | —                   | —                    | —          |
| `os`                 | TEXT        | sim      | —                   | —                    | —          |
| `ip_address`         | TEXT        | sim      | —                   | —                    | —          |
| `location`           | TEXT        | sim      | —                   | —                    | —          |
| `first_seen_at`      | TIMESTAMPTZ | sim      | `NOW()`             | —                    | —          |
| `last_seen_at`       | TIMESTAMPTZ | sim      | `NOW()`             | —                    | —          |
| `is_trusted`         | BOOLEAN     | sim      | `FALSE`             | —                    | —          |
| `created_at`         | TIMESTAMPTZ | sim      | `NOW()`             | —                    | —          |

### `kudos`

**RLS habilitada** · 3 policies: `Authenticated can view kudos`, `Users can send kudos`, `Admins can update kudos`

| Coluna                | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| --------------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`                  | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `from_salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `to_salesperson_id`   | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `message`             | TEXT        | NOT NULL | —                   | —                     | —          |
| `kudos_type`          | TEXT        | NOT NULL | `'recognition'`     | —                     | —          |
| `is_pinned`           | BOOLEAN     | NOT NULL | `false`             | —                     | —          |
| `created_at`          | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |

### `lead_assignments`

**RLS habilitada** · 2 policies: `View own assignments`, `Admin/manager manage assignments`

| Coluna           | Tipo        | Nulo     | Default             | Constraints                  | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ---------------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                           | —          |
| `sale_id`        | UUID        | NOT NULL | —                   | FK → `sales.id`              | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id`        | —          |
| `rule_id`        | UUID        | sim      | —                   | FK → `lead_routing_rules.id` | —          |
| `strategy_used`  | TEXT        | NOT NULL | —                   | —                            | —          |
| `assigned_at`    | TIMESTAMPTZ | NOT NULL | `now()`             | —                            | —          |
| `metadata`       | JSONB       | sim      | `'{}'::jsonb`       | —                            | —          |

### `lead_churn_risk`

**RLS habilitada** · 2 policies: `Admins and managers can read lead_churn_risk`, `Salespeople can read churn risk of their sales`

| Coluna       | Tipo    | Nulo     | Default             | Constraints     | Comentário |
| ------------ | ------- | -------- | ------------------- | --------------- | ---------- |
| `id`         | UUID    | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `sale_id`    | UUID    | NOT NULL | —                   | FK → `sales.id` | —          |
| `risk_level` | TEXT    | sim      | —                   | —               | —          |
| `risk_score` | NUMERIC | sim      | —                   | —               | —          |
| `factors`    | JSONB   | sim      | —                   | —               | —          |
| `status`     | TEXT    | sim      | `'active'`          | —               | —          |

### `lead_detailed_logs`

**RLS habilitada** · 3 policies: `Users can view logs of their clients`, `Users can view own logs`, `Users can insert logs for their clients`

| Coluna       | Tipo                     | Nulo     | Default             | Constraints          | Comentário |
| ------------ | ------------------------ | -------- | ------------------- | -------------------- | ---------- |
| `id`         | UUID                     | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `client_id`  | UUID                     | NOT NULL | —                   | FK → `clients.id`    | —          |
| `event_type` | TEXT                     | NOT NULL | —                   | —                    | —          |
| `details`    | JSONB                    | sim      | `'{}'::jsonb`       | —                    | —          |
| `created_at` | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                    | —          |
| `created_by` | UUID                     | sim      | —                   | FK → `auth.users.id` | —          |

### `lead_intelligence_metrics`

**RLS habilitada** · 1 policies: `Authenticated read lead_intelligence_metrics`

| Coluna         | Tipo                                 | Nulo     | Default             | Constraints | Comentário |
| -------------- | ------------------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`           | UUID                                 | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `captured_at`  | TIMESTAMP WITH TIME ZONE             | sim      | `now()`             | —           | —          |
| `avg_score`    | NUMERIC                              | sim      | —                   | —           | —          |
| `hot_count`    | INTEGER                              | sim      | —                   | —           | —          |
| `warm_count`   | INTEGER                              | sim      | —                   | —           | —          |
| `cold_count`   | INTEGER                              | sim      | —                   | —           | —          |
| `distribution` | JSONB -- Histogram data: { "0-20": 5 | sim      | —                   | —           | —          |

### `lead_routing_log`

**RLS habilitada** · 2 policies: `Admins can insert lead_routing_log`, `Admin and managers can read lead_routing_log`

| Coluna                | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| --------------------- | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`                  | UUID                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `client_id`           | UUID                     | sim      | —                   | FK → `clients.id`     | —          |
| `from_salesperson_id` | UUID                     | sim      | —                   | FK → `salespeople.id` | —          |
| `to_salesperson_id`   | UUID                     | sim      | —                   | FK → `salespeople.id` | —          |
| `routing_reason`      | TEXT                     | NOT NULL | —                   | —                     | —          |
| `performance_reward`  | notes TEXT               | sim      | —                   | —                     | —          |
| `created_at`          | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |

### `lead_routing_rules`

**RLS habilitada** · 2 policies: `Authenticated view routing rules`, `Admin/manager manage routing rules`

| Coluna              | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`                | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `name`              | TEXT        | NOT NULL | —                   | —           | —          |
| `strategy`          | TEXT        | NOT NULL | `'round_robin'`     | —           | —          |
| `priority`          | INTEGER     | NOT NULL | `0`                 | —           | —          |
| `is_active`         | BOOLEAN     | NOT NULL | `true`              | —           | —          |
| `filter_state`      | TEXT        | sim      | —                   | —           | —          |
| `filter_min_value`  | NUMERIC     | sim      | —                   | —           | —          |
| `filter_source`     | TEXT        | sim      | —                   | —           | —          |
| `filter_role`       | TEXT        | sim      | —                   | —           | —          |
| `description`       | TEXT        | sim      | —                   | —           | —          |
| `created_by`        | UUID        | sim      | —                   | —           | —          |
| `created_at`        | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `updated_at`        | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `filter_job_titles` | TEXT[]      | sim      | —                   | —           | —          |
| `filter_products`   | TEXT[]      | sim      | —                   | —           | —          |

### `lead_score_explanations`

**RLS habilitada** · 3 policies: `Salespeople view own deal explanations`, `Service role manages explanations`, `Admins manage explanations`

| Coluna            | Tipo        | Nulo     | Default             | Constraints     | Comentário |
| ----------------- | ----------- | -------- | ------------------- | --------------- | ---------- |
| `id`              | uuid        | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `sale_id`         | uuid        | NOT NULL | —                   | FK → `sales.id` | —          |
| `score`           | integer     | NOT NULL | —                   | —               | —          |
| `baseline_score`  | numeric     | NOT NULL | `0`                 | —               | —          |
| `top_drivers`     | jsonb       | NOT NULL | `'[]'::jsonb`       | —               | —          |
| `recommendations` | jsonb       | NOT NULL | `'[]'::jsonb`       | —               | —          |
| `narrative`       | text        | sim      | —                   | —               | —          |
| `model_version`   | text        | NOT NULL | `'v1'`              | —               | —          |
| `calculated_at`   | timestamptz | NOT NULL | `now()`             | —               | —          |
| `created_at`      | timestamptz | NOT NULL | `now()`             | —               | —          |
| `updated_at`      | timestamptz | NOT NULL | `now()`             | —               | —          |

### `lead_score_history`

**RLS habilitada** · 2 policies: `Salespeople view own deal history`, `Service role inserts history`

| Coluna        | Tipo        | Nulo     | Default             | Constraints     | Comentário |
| ------------- | ----------- | -------- | ------------------- | --------------- | ---------- |
| `id`          | uuid        | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `sale_id`     | uuid        | NOT NULL | —                   | FK → `sales.id` | —          |
| `score`       | integer     | NOT NULL | —                   | —               | —          |
| `factors`     | jsonb       | NOT NULL | `'{}'::jsonb`       | —               | —          |
| `recorded_at` | timestamptz | NOT NULL | `now()`             | —               | —          |

### `lead_score_trends`

**RLS habilitada** · 1 policies: `Allow read for all authenticated users`

| Coluna        | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`          | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `sale_id`     | UUID                     | NOT NULL | —                   | —           | —          |
| `score`       | INTEGER                  | NOT NULL | —                   | —           | —          |
| `captured_at` | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —          |

### `lead_scores`

**RLS habilitada** · 4 policies: `Users can read own lead scores or admins all`, `Users can insert lead scores for own sales`, `Users can update own lead scores`, `Users can delete own lead scores`

| Coluna          | Tipo                     | Nulo     | Default             | Constraints     | Comentário |
| --------------- | ------------------------ | -------- | ------------------- | --------------- | ---------- |
| `id`            | UUID                     | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `sale_id`       | UUID                     | NOT NULL | —                   | FK → `sales.id` | —          |
| `score`         | INTEGER                  | NOT NULL | `0`                 | —               | —          |
| `factors`       | JSONB                    | NOT NULL | `'{}'`              | —               | —          |
| `calculated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —               | —          |
| `created_at`    | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —               | —          |
| `updated_at`    | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —               | —          |

### `lead_source_configs`

**RLS habilitada** · 1 policies: `Allow read for all authenticated users`

| Coluna           | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ---------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`             | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `source_name`    | TEXT                     | NOT NULL | —                   | UNIQUE      | —          |
| `monthly_budget` | DECIMAL(12,2)            | sim      | `0`                 | —           | —          |
| `target_cpl`     | DECIMAL(12,2)            | sim      | `0`                 | —           | —          |
| `is_active`      | BOOLEAN                  | sim      | `true`              | —           | —          |
| `created_at`     | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —          |

### `league_history`

**RLS habilitada** · 1 policies: `Users can view their own league history`

| Coluna           | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `league_id`      | UUID        | sim      | —                   | FK → `leagues.id`     | —          |
| `rank_achieved`  | INT         | sim      | —                   | —                     | —          |
| `xp_earned`      | INT         | sim      | —                   | —                     | —          |
| `season_date`    | DATE        | sim      | `CURRENT_DATE`      | —                     | —          |
| `promoted`       | BOOLEAN     | sim      | `false`             | —                     | —          |
| `demoted`        | BOOLEAN     | sim      | `false`             | —                     | —          |
| `created_at`     | TIMESTAMPTZ | sim      | `now()`             | —                     | —          |

### `league_members`

**RLS habilitada** · 3 policies: `Anyone can read league_members`, `Users can insert own league_members`, `Admins can update league_members`

| Coluna           | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `league_id`      | UUID        | NOT NULL | —                   | FK → `leagues.id`     | —          |
| `weekly_xp`      | INTEGER     | NOT NULL | `0`                 | —                     | —          |
| `joined_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `updated_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `last_reset_xp`  | INT         | sim      | `0`                 | —                     | —          |
| `current_streak` | INT         | sim      | `0`                 | —                     | —          |
| `max_streak`     | INT         | sim      | `0`                 | —                     | —          |
| `promoted_at`    | TIMESTAMPTZ | sim      | —                   | —                     | —          |
| `demoted_at`     | TIMESTAMPTZ | sim      | —                   | —                     | —          |

### `leagues`

**RLS habilitada** · 1 policies: `Anyone can read leagues`

| Coluna             | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------ | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`               | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `name`             | TEXT        | NOT NULL | —                   | —           | —          |
| `tier`             | INTEGER     | NOT NULL | `1`                 | —           | —          |
| `icon`             | TEXT        | NOT NULL | `'🥉'`              | —           | —          |
| `color`            | TEXT        | NOT NULL | `'#94a3b8'`         | —           | —          |
| `min_xp`           | INTEGER     | NOT NULL | `0`                 | —           | —          |
| `xp_bonus_percent` | INTEGER     | NOT NULL | `0`                 | —           | —          |
| `promotion_slots`  | INTEGER     | NOT NULL | `3`                 | —           | —          |
| `demotion_slots`   | INTEGER     | NOT NULL | `3`                 | —           | —          |
| `created_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `login_alerts`

**RLS habilitada** · 2 policies: `Users can view own alerts`, `Users can update own alerts`

| Coluna               | Tipo        | Nulo     | Default             | Constraints          | Comentário |
| -------------------- | ----------- | -------- | ------------------- | -------------------- | ---------- |
| `id`                 | UUID        | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `user_id`            | UUID        | NOT NULL | —                   | FK → `auth.users.id` | —          |
| `device_fingerprint` | TEXT        | NOT NULL | —                   | —                    | —          |
| `ip_address`         | TEXT        | sim      | —                   | —                    | —          |
| `browser`            | TEXT        | sim      | —                   | —                    | —          |
| `os`                 | TEXT        | sim      | —                   | —                    | —          |
| `location`           | TEXT        | sim      | —                   | —                    | —          |
| `alert_type`         | TEXT        | sim      | `'new_device'`      | —                    | —          |
| `email_sent`         | BOOLEAN     | sim      | `FALSE`             | —                    | —          |
| `email_sent_at`      | TIMESTAMPTZ | sim      | —                   | —                    | —          |
| `acknowledged`       | BOOLEAN     | sim      | `FALSE`             | —                    | —          |
| `acknowledged_at`    | TIMESTAMPTZ | sim      | —                   | —                    | —          |
| `created_at`         | TIMESTAMPTZ | sim      | `NOW()`             | —                    | —          |

### `login_attempts`

**RLS habilitada** · 1 policies: `Admins can view login attempts`

| Coluna           | Tipo                     | Nulo     | Default              | Constraints | Comentário |
| ---------------- | ------------------------ | -------- | -------------------- | ----------- | ---------- |
| `id`             | UUID                     | NOT NULL | `uuid_generate_v4()` | PK          | —          |
| `email`          | TEXT                     | NOT NULL | —                    | —           | —          |
| `ip_address`     | INET                     | sim      | —                    | —           | —          |
| `user_agent`     | TEXT                     | sim      | —                    | —           | —          |
| `success`        | BOOLEAN                  | NOT NULL | —                    | —           | —          |
| `failure_reason` | TEXT                     | sim      | —                    | —           | —          |
| `created_at`     | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —           | —          |

### `maintenance_log`

**RLS **forced**** · 1 policies: `Deny writes to non-service on maintenance_log`

| Coluna          | Tipo        | Nulo     | Default             | Constraints | Comentário |
| --------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`            | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `job_name`      | TEXT        | NOT NULL | —                   | —           | —          |
| `started_at`    | TIMESTAMPTZ | NOT NULL | `NOW()`             | —           | —          |
| `completed_at`  | TIMESTAMPTZ | sim      | —                   | —           | —          |
| `rows_affected` | BIGINT      | sim      | `0`                 | —           | —          |
| `status`        | TEXT        | NOT NULL | `'running'`         | —           | —          |
| `error_message` | TEXT        | sim      | —                   | —           | —          |
| `metadata`      | JSONB       | sim      | `'{}'::jsonb`       | —           | —          |

### `message_templates`

**RLS habilitada** · 4 policies: `Users can view own templates`, `Users can create own templates`, `Users can update own templates`, `Users can delete own templates`

| Coluna           | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `name`           | TEXT        | NOT NULL | —                   | —                     | —          |
| `channel`        | TEXT        | NOT NULL | `'whatsapp'`        | —                     | —          |
| `subject`        | TEXT        | sim      | —                   | —                     | —          |
| `body`           | TEXT        | NOT NULL | —                   | —                     | —          |
| `variables`      | TEXT[]      | sim      | `'{}'`              | —                     | —          |
| `category`       | TEXT        | sim      | `'geral'`           | —                     | —          |
| `is_active`      | BOOLEAN     | sim      | `true`              | —                     | —          |
| `usage_count`    | INTEGER     | NOT NULL | `0`                 | —                     | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `updated_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `pipeline_stage` | TEXT        | sim      | —                   | —                     | —          |

### `mfa_verification_attempts`

**RLS habilitada** · 1 policies: `Users can view own MFA attempts`

| Coluna       | Tipo        | Nulo     | Default             | Constraints          | Comentário |
| ------------ | ----------- | -------- | ------------------- | -------------------- | ---------- |
| `id`         | UUID        | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `user_id`    | UUID        | sim      | —                   | FK → `auth.users.id` | —          |
| `method`     | TEXT        | NOT NULL | —                   | —                    | —          |
| `success`    | BOOLEAN     | sim      | `FALSE`             | —                    | —          |
| `ip_address` | TEXT        | sim      | —                   | —                    | —          |
| `user_agent` | TEXT        | sim      | —                   | —                    | —          |
| `created_at` | TIMESTAMPTZ | sim      | `NOW()`             | —                    | —          |

### `migration_log`

**RLS não declarado nas migrations** · 0 policies

| Coluna           | Tipo                     | Nulo     | Default | Constraints | Comentário |
| ---------------- | ------------------------ | -------- | ------- | ----------- | ---------- |
| `id`             | SERIAL                   | NOT NULL | —       | PK          | —          |
| `migration_name` | TEXT                     | NOT NULL | —       | —           | —          |
| `executed_at`    | TIMESTAMP WITH TIME ZONE | sim      | `NOW()` | —           | —          |
| `status`         | TEXT                     | NOT NULL | —       | —           | —          |
| `notes`          | TEXT                     | sim      | —       | —           | —          |

### `monthly_sales_summary`

**RLS habilitada** · 1 policies: `Managers e admins podem ver monthly_sales_summary`

| Coluna       | Tipo                     | Nulo     | Default | Constraints | Comentário |
| ------------ | ------------------------ | -------- | ------- | ----------- | ---------- |
| `month`      | TEXT                     | NOT NULL | —       | PK          | —          |
| `revenue`    | NUMERIC                  | sim      | `0`     | —           | —          |
| `deals`      | INTEGER                  | sim      | `0`     | —           | —          |
| `won_deals`  | INTEGER                  | sim      | `0`     | —           | —          |
| `updated_at` | TIMESTAMP WITH TIME ZONE | sim      | `now()` | —           | —          |

### `mood_entries`

**RLS habilitada** · 3 policies: `Users can read own mood entries`, `Users can insert own mood entries`, `Users can update own mood entries`

| Coluna           | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `entry_date`     | DATE        | NOT NULL | `CURRENT_DATE`      | —                     | —          |
| `mood_value`     | INTEGER     | NOT NULL | —                   | —                     | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |

### `mql_qualifications`

**RLS habilitada** · 1 policies: `Users can manage own qualifications`

| Coluna                 | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| ---------------------- | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`                   | UUID                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `sale_id`              | UUID                     | sim      | —                   | FK → `sales.id`       | —          |
| `qualified_by`         | UUID                     | sim      | —                   | FK → `salespeople.id` | —          |
| `authority_level`      | TEXT                     | sim      | —                   | —                     | —          |
| `need_urgency`         | TEXT                     | sim      | —                   | —                     | —          |
| `timeline`             | TEXT                     | sim      | —                   | —                     | —          |
| `pain_points`          | TEXT[]                   | sim      | —                   | —                     | —          |
| `competitors`          | TEXT[]                   | sim      | —                   | —                     | —          |
| `decision_process`     | TEXT                     | sim      | —                   | —                     | —          |
| `qualification_status` | TEXT                     | sim      | `'pending'`         | —                     | —          |
| `nurture`              | unqualified_reason TEXT  | sim      | —                   | —                     | —          |
| `nurture_reason`       | TEXT                     | sim      | —                   | —                     | —          |
| `created_at`           | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                     | —          |
| `updated_at`           | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                     | —          |

### `notification_preferences`

**RLS habilitada** · 1 policies: `Users can update their notification preferences`

| Coluna                       | Tipo                     | Nulo     | Default             | Constraints | Comentário                                                        |
| ---------------------------- | ------------------------ | -------- | ------------------- | ----------- | ----------------------------------------------------------------- |
| `id`                         | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —                                                                 |
| `email`                      | TEXT                     | NOT NULL | —                   | —           | —                                                                 |
| `is_active`                  | BOOLEAN                  | NOT NULL | `true`              | —           | —                                                                 |
| `frequency`                  | TEXT                     | NOT NULL | `'daily'`           | —           | —                                                                 |
| `notify_stagnant_deals`      | BOOLEAN                  | NOT NULL | `true`              | —           | —                                                                 |
| `notify_inactive_clients`    | BOOLEAN                  | NOT NULL | `true`              | —           | —                                                                 |
| `notify_at_risk_goals`       | BOOLEAN                  | NOT NULL | `true`              | —           | —                                                                 |
| `stagnant_threshold_days`    | INTEGER                  | NOT NULL | `14`                | —           | —                                                                 |
| `inactive_threshold_days`    | INTEGER                  | NOT NULL | `60`                | —           | —                                                                 |
| `preferred_time`             | TIME                     | NOT NULL | `'08:00:00'`        | —           | —                                                                 |
| `created_at`                 | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —                                                                 |
| `updated_at`                 | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —                                                                 |
| `consecutive_days_threshold` | integer                  | NOT NULL | `3`                 | —           | Number of consecutive days below goal before triggering SDR alert |
| `user_id`                    | uuid                     | sim      | —                   | PK          | —                                                                 |
| `email_enabled`              | BOOLEAN                  | sim      | `true`              | —           | —                                                                 |
| `push_enabled`               | BOOLEAN                  | sim      | `true`              | —           | —                                                                 |
| `sms_enabled`                | BOOLEAN                  | sim      | `false`             | —           | —                                                                 |
| `deal_updates`               | BOOLEAN                  | sim      | `true`              | —           | —                                                                 |
| `task_reminders`             | BOOLEAN                  | sim      | `true`              | —           | —                                                                 |
| `team_mentions`              | BOOLEAN                  | sim      | `true`              | —           | —                                                                 |
| `daily_digest`               | BOOLEAN                  | sim      | `false`             | —           | —                                                                 |
| `quiet_hours_start`          | TIME                     | sim      | —                   | —           | —                                                                 |
| `quiet_hours_end`            | TIME                     | sim      | —                   | —           | —                                                                 |

### `notifications`

**RLS habilitada** · 7 policies: `Users can view their own notifications`, `notifications_select_own`, `notifications_update_own`, `notifications_delete_own`, `notifications_insert_own_or_admin`, `Users can insert their own notifications`, `Admins and managers can view churn alert notifications`

| Coluna         | Tipo                     | Nulo     | Default             | Constraints          | Comentário |
| -------------- | ------------------------ | -------- | ------------------- | -------------------- | ---------- |
| `id`           | UUID                     | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `user_id`      | UUID                     | NOT NULL | —                   | FK → `auth.users.id` | —          |
| `title`        | TEXT                     | NOT NULL | —                   | —                    | —          |
| `message`      | TEXT                     | NOT NULL | —                   | —                    | —          |
| `type`         | TEXT                     | NOT NULL | —                   | —                    | —          |
| `read`         | BOOLEAN                  | sim      | `false`             | —                    | —          |
| `action_url`   | text                     | sim      | —                   | —                    | —          |
| `created_at`   | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                    | —          |
| `category`     | text                     | NOT NULL | `'general'`         | —                    | —          |
| `priority`     | text                     | NOT NULL | `'medium'`          | —                    | —          |
| `icon`         | text                     | sim      | —                   | —                    | —          |
| `action_label` | text                     | sim      | —                   | —                    | —          |
| `metadata`     | jsonb                    | sim      | `'{}'::jsonb`       | —                    | —          |
| `read_at`      | timestamptz              | sim      | —                   | —                    | —          |
| `archived_at`  | timestamptz              | sim      | —                   | —                    | —          |
| `expires_at`   | timestamptz              | sim      | —                   | —                    | —          |
| `is_read`      | BOOLEAN                  | sim      | `false`             | —                    | —          |

### `nps_surveys`

**RLS habilitada** · 8 policies: `Authenticated users can view nps surveys`, `nps_surveys_select_owner_or_manager`, `nps_surveys_insert_owner_or_manager`, `nps_surveys_update_owner_or_manager`, `nps_surveys_delete_admin_manager`, `Salespeople can create their own nps surveys`, `Salespeople can update their own nps surveys`, `Salespeople can delete their own nps surveys`

| Coluna           | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `sale_id`        | UUID                     | sim      | —                   | FK → `sales.id`       | —          |
| `client_name`    | TEXT                     | NOT NULL | —                   | —                     | —          |
| `salesperson_id` | UUID                     | sim      | —                   | FK → `salespeople.id` | —          |
| `survey_type`    | TEXT                     | sim      | `'nps'`             | —                     | —          |
| `score`          | INTEGER                  | sim      | —                   | —                     | —          |
| `comment`        | TEXT                     | sim      | —                   | —                     | —          |
| `status`         | TEXT                     | NOT NULL | `'pending'`         | —                     | —          |
| `sent_at`        | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                     | —          |
| `responded_at`   | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                     | —          |
| `created_at`     | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |
| `score_ces`      | INTEGER                  | sim      | —                   | —                     | —          |

### `objection_library`

**RLS habilitada** · 2 policies: `Authenticated read objection library`, `Admin/manager write objection library`

| Coluna                       | Tipo        | Nulo     | Default             | Constraints               | Comentário |
| ---------------------------- | ----------- | -------- | ------------------- | ------------------------- | ---------- |
| `id`                         | uuid        | NOT NULL | `gen_random_uuid()` | PK                        | —          |
| `objection_type`             | text        | NOT NULL | —                   | UNIQUE                    | —          |
| `pattern_text`               | text        | NOT NULL | —                   | UNIQUE                    | —          |
| `frequency_count`            | int         | NOT NULL | `1`                 | —                         | —          |
| `best_response_text`         | text        | sim      | —                   | —                         | —          |
| `best_response_recording_id` | uuid        | sim      | —                   | FK → `call_recordings.id` | —          |
| `last_seen_at`               | timestamptz | NOT NULL | `now()`             | —                         | —          |
| `updated_at`                 | timestamptz | NOT NULL | `now()`             | —                         | —          |

### `objections_library`

**RLS habilitada** · 4 policies: `Authenticated users can read objections_library`, `Admins and managers can insert objections_library`, `Admins and managers can update objections_library`, `Admins and managers can delete objections_library`

| Coluna                | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| --------------------- | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`                  | UUID                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `objection`           | TEXT                     | NOT NULL | —                   | —                     | —          |
| `response`            | TEXT                     | NOT NULL | —                   | —                     | —          |
| `category`            | TEXT                     | NOT NULL | `'general'`         | —                     | —          |
| `effectiveness_score` | INTEGER                  | sim      | `0`                 | —                     | —          |
| `usage_count`         | INTEGER                  | sim      | `0`                 | —                     | —          |
| `created_by`          | UUID                     | sim      | —                   | FK → `salespeople.id` | —          |
| `created_at`          | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |
| `updated_at`          | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |
| `tags`                | TEXT[]                   | sim      | `'{}'`              | —                     | —          |

### `onboarding_journeys`

**RLS habilitada** · 2 policies: `cs_oj_select`, `cs_oj_modify`

| Coluna                 | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| ---------------------- | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`                   | uuid                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `account_id`           | uuid                     | NOT NULL | —                   | FK → `accounts.id`    | —          |
| `template_key`         | text                     | NOT NULL | `'standard'`        | —                     | —          |
| `status`               | public.onboarding_status | NOT NULL | `'not_started'`     | —                     | —          |
| `current_step`         | int                      | NOT NULL | `0`                 | —                     | —          |
| `total_steps`          | int                      | NOT NULL | `0`                 | —                     | —          |
| `owner_salesperson_id` | uuid                     | sim      | —                   | FK → `salespeople.id` | —          |
| `started_at`           | timestamptz              | sim      | —                   | —                     | —          |
| `completed_at`         | timestamptz              | sim      | —                   | —                     | —          |
| `created_at`           | timestamptz              | NOT NULL | `now()`             | —                     | —          |
| `updated_at`           | timestamptz              | NOT NULL | `now()`             | —                     | —          |

### `onboarding_steps`

**RLS habilitada** · 2 policies: `cs_os_select`, `cs_os_modify`

| Coluna         | Tipo        | Nulo     | Default             | Constraints                   | Comentário |
| -------------- | ----------- | -------- | ------------------- | ----------------------------- | ---------- |
| `id`           | uuid        | NOT NULL | `gen_random_uuid()` | PK                            | —          |
| `journey_id`   | uuid        | NOT NULL | —                   | FK → `onboarding_journeys.id` | —          |
| `title`        | text        | NOT NULL | —                   | —                             | —          |
| `description`  | text        | sim      | —                   | —                             | —          |
| `order_index`  | int         | NOT NULL | `0`                 | —                             | —          |
| `status`       | text        | NOT NULL | `'pending'`         | —                             | —          |
| `due_date`     | date        | sim      | —                   | —                             | —          |
| `completed_at` | timestamptz | sim      | —                   | —                             | —          |
| `created_at`   | timestamptz | NOT NULL | `now()`             | —                             | —          |

### `order_items`

**RLS habilitada** · 2 policies: `Users view own order items`, `Users insert own order items`

| Coluna         | Tipo          | Nulo     | Default             | Constraints      | Comentário |
| -------------- | ------------- | -------- | ------------------- | ---------------- | ---------- |
| `id`           | UUID          | NOT NULL | `gen_random_uuid()` | PK               | —          |
| `order_id`     | UUID          | NOT NULL | —                   | FK → `orders.id` | —          |
| `product_name` | TEXT          | NOT NULL | —                   | —                | —          |
| `quantity`     | INTEGER       | NOT NULL | `1`                 | —                | —          |
| `unit_price`   | NUMERIC(12,2) | NOT NULL | `0`                 | —                | —          |
| `created_at`   | TIMESTAMPTZ   | NOT NULL | `now()`             | —                | —          |

### `order_status_events`

**RLS habilitada** · 1 policies: `Users view own order events`

| Coluna        | Tipo        | Nulo     | Default             | Constraints      | Comentário |
| ------------- | ----------- | -------- | ------------------- | ---------------- | ---------- |
| `id`          | UUID        | NOT NULL | `gen_random_uuid()` | PK               | —          |
| `order_id`    | UUID        | NOT NULL | —                   | FK → `orders.id` | —          |
| `status`      | TEXT        | NOT NULL | —                   | —                | —          |
| `description` | TEXT        | sim      | —                   | —                | —          |
| `created_at`  | TIMESTAMPTZ | NOT NULL | `now()`             | —                | —          |

### `orders`

**RLS habilitada** · 1 policies: `Users insert own orders`

| Coluna                | Tipo          | Nulo     | Default             | Constraints           | Comentário |
| --------------------- | ------------- | -------- | ------------------- | --------------------- | ---------- |
| `id`                  | UUID          | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `user_id`             | UUID          | sim      | —                   | —                     | —          |
| `order_number`        | TEXT          | NOT NULL | —                   | UNIQUE                | —          |
| `status`              | TEXT          | NOT NULL | `'pending'`         | —                     | —          |
| `subtotal`            | NUMERIC(12,2) | NOT NULL | `0`                 | —                     | —          |
| `shipping`            | NUMERIC(12,2) | NOT NULL | `0`                 | —                     | —          |
| `total`               | NUMERIC(12,2) | NOT NULL | `0`                 | —                     | —          |
| `cancellation_reason` | TEXT          | sim      | —                   | —                     | —          |
| `created_at`          | TIMESTAMPTZ   | NOT NULL | `now()`             | —                     | —          |
| `updated_at`          | TIMESTAMPTZ   | NOT NULL | `now()`             | —                     | —          |
| `quote_id`            | UUID          | sim      | —                   | FK → `quotes.id`      | —          |
| `client_id`           | UUID          | sim      | —                   | FK → `clients.id`     | —          |
| `salesperson_id`      | UUID          | sim      | —                   | FK → `salespeople.id` | —          |
| `notes`               | TEXT          | sim      | —                   | —                     | —          |
| `metadata`            | JSONB         | sim      | `'{}'::jsonb`       | —                     | —          |

### `outbound_messages`

**RLS habilitada** · 3 policies: `Owners can view their outbound messages`, `Owners can insert their outbound messages`, `Owners can update their outbound messages`

| Coluna                | Tipo        | Nulo     | Default             | Constraints                    | Comentário |
| --------------------- | ----------- | -------- | ------------------- | ------------------------------ | ---------- |
| `id`                  | uuid        | NOT NULL | `gen_random_uuid()` | PK                             | —          |
| `owner_id`            | uuid        | NOT NULL | —                   | —                              | —          |
| `enrollment_id`       | uuid        | sim      | —                   | FK → `sequence_enrollments.id` | —          |
| `step_id`             | uuid        | sim      | —                   | FK → `sequence_steps.id`       | —          |
| `channel`             | text        | NOT NULL | —                   | —                              | —          |
| `provider`            | text        | NOT NULL | —                   | —                              | —          |
| `to_number`           | text        | NOT NULL | —                   | —                              | —          |
| `body`                | text        | sim      | —                   | —                              | —          |
| `template_id`         | text        | sim      | —                   | —                              | —          |
| `provider_message_id` | text        | sim      | —                   | —                              | —          |
| `status`              | text        | NOT NULL | `'queued'`          | —                              | —          |
| `error`               | text        | sim      | —                   | —                              | —          |
| `metadata`            | jsonb       | NOT NULL | `'{}'::jsonb`       | —                              | —          |
| `sent_at`             | timestamptz | sim      | —                   | —                              | —          |
| `delivered_at`        | timestamptz | sim      | —                   | —                              | —          |
| `read_at`             | timestamptz | sim      | —                   | —                              | —          |
| `created_at`          | timestamptz | NOT NULL | `now()`             | —                              | —          |
| `updated_at`          | timestamptz | NOT NULL | `now()`             | —                              | —          |

### `page_analytics`

**RLS habilitada** · 3 policies: `Users can insert own analytics`, `Users can view own analytics`, `Users can update own analytics`

| Coluna             | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| ------------------ | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`               | UUID                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id`   | UUID                     | sim      | —                   | FK → `salespeople.id` | —          |
| `route`            | TEXT                     | NOT NULL | —                   | —                     | —          |
| `page_title`       | TEXT                     | sim      | —                   | —                     | —          |
| `duration_seconds` | INTEGER                  | sim      | `0`                 | —                     | —          |
| `interactions`     | INTEGER                  | sim      | `0`                 | —                     | —          |
| `session_id`       | TEXT                     | sim      | —                   | —                     | —          |
| `device_type`      | TEXT                     | sim      | `'desktop'`         | —                     | —          |
| `referrer_route`   | TEXT                     | sim      | —                   | —                     | —          |
| `entered_at`       | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |
| `exited_at`        | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                     | —          |
| `created_at`       | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |

### `password_history`

**RLS habilitada** · 1 policies: `Users can view own password history`

| Coluna          | Tipo                     | Nulo     | Default              | Constraints          | Comentário |
| --------------- | ------------------------ | -------- | -------------------- | -------------------- | ---------- |
| `id`            | UUID                     | NOT NULL | `uuid_generate_v4()` | PK                   | —          |
| `user_id`       | UUID                     | NOT NULL | —                    | FK → `auth.users.id` | —          |
| `password_hash` | TEXT                     | NOT NULL | —                    | —                    | —          |
| `created_at`    | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —                    | —          |

### `password_reset_requests`

**RLS habilitada** · 0 policies

| Coluna             | Tipo                     | Nulo     | Default             | Constraints          | Comentário |
| ------------------ | ------------------------ | -------- | ------------------- | -------------------- | ---------- |
| `id`               | UUID                     | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `user_email`       | TEXT                     | NOT NULL | —                   | —                    | —          |
| `user_id`          | UUID                     | sim      | —                   | FK → `auth.users.id` | —          |
| `status`           | TEXT                     | NOT NULL | `'pending'`         | —                    | —          |
| `requested_at`     | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                    | —          |
| `reviewed_at`      | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                    | —          |
| `reviewed_by`      | UUID                     | sim      | —                   | —                    | —          |
| `rejection_reason` | TEXT                     | sim      | —                   | —                    | —          |
| `expires_at`       | TIMESTAMP WITH TIME ZONE | NOT NULL | `(now()`            | —                    | —          |
| `ip_address`       | TEXT                     | sim      | —                   | —                    | —          |
| `user_agent`       | TEXT                     | sim      | —                   | —                    | —          |
| `created_at`       | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                    | —          |
| `updated_at`       | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                    | —          |

### `performance_bets`

**RLS habilitada** · 3 policies: `Users can insert own bets`, `Users can update own bets`, `Users can read own or all bets`

| Coluna           | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `bet_type`       | TEXT        | NOT NULL | —                   | —                     | —          |
| `target_value`   | NUMERIC     | NOT NULL | —                   | —                     | —          |
| `xp_wagered`     | INTEGER     | NOT NULL | `100`               | —                     | —          |
| `xp_multiplier`  | NUMERIC     | NOT NULL | `2.0`               | —                     | —          |
| `current_value`  | NUMERIC     | NOT NULL | `0`                 | —                     | —          |
| `status`         | TEXT        | NOT NULL | `'active'`          | —                     | —          |
| `description`    | TEXT        | sim      | —                   | —                     | —          |
| `starts_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `ends_at`        | TIMESTAMPTZ | NOT NULL | —                   | —                     | —          |
| `resolved_at`    | TIMESTAMPTZ | sim      | —                   | —                     | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |

### `performance_impact_factors`

**RLS habilitada** · 1 policies: `Allow read for all authenticated users`

| Coluna           | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ---------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`             | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `salesperson_id` | UUID                     | NOT NULL | —                   | —           | —          |
| `factor_name`    | TEXT                     | sim      | —                   | —           | —          |
| `description`    | TEXT                     | sim      | —                   | —           | —          |
| `recorded_at`    | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —          |

### `permissions`

**RLS habilitada** · 2 policies: `Admins can manage permissions`, `Admin and managers can read permissions`

| Coluna        | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`          | uuid                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `name`        | text                     | NOT NULL | —                   | UNIQUE      | —          |
| `description` | text                     | sim      | —                   | —           | —          |
| `resource`    | text                     | NOT NULL | —                   | —           | —          |
| `action`      | text                     | NOT NULL | —                   | —           | —          |
| `created_at`  | timestamp with time zone | NOT NULL | `now()`             | —           | —          |

### `person_intelligence`

**RLS habilitada** · 1 policies: `Admins e Managers podem ver inteligência de pessoas`

| Coluna                   | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ------------------------ | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`                     | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `email`                  | TEXT                     | NOT NULL | —                   | UNIQUE      | —          |
| `full_name`              | TEXT                     | sim      | —                   | —           | —          |
| `current_title`          | TEXT                     | sim      | —                   | —           | —          |
| `previous_titles`        | JSONB                    | sim      | —                   | —           | —          |
| `linkedin_url`           | TEXT                     | sim      | —                   | —           | —          |
| `job_change_detected_at` | TIMESTAMP WITH TIME ZONE | sim      | —                   | —           | —          |
| `promotion_detected_at`  | TIMESTAMP WITH TIME ZONE | sim      | —                   | —           | —          |
| `last_verified_at`       | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —          |
| `created_at`             | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —          |
| `updated_at`             | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —          |

### `personal_assistant_briefings`

**RLS habilitada** · 4 policies: `pab_owner_select`, `pab_owner_insert`, `pab_owner_update`, `pab_admin_manager_select`

| Coluna             | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------ | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`               | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `salesperson_id`   | UUID        | NOT NULL | —                   | —           | —          |
| `briefing_date`    | DATE        | NOT NULL | `(now()`            | —           | —          |
| `content`          | TEXT        | NOT NULL | —                   | —           | —          |
| `model`            | TEXT        | sim      | —                   | —           | —          |
| `token_count`      | INT         | sim      | —                   | —           | —          |
| `context_snapshot` | JSONB       | sim      | —                   | —           | —          |
| `created_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `updated_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `personal_assistant_nudges`

**RLS habilitada** · 4 policies: `Salesperson reads own nudges`, `Salesperson inserts own nudges`, `Salesperson updates own nudge feedback`, `Admins and managers can read all nudges`

| Coluna             | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ------------------ | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`               | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id`   | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `content`          | TEXT        | NOT NULL | —                   | —                     | —          |
| `model`            | TEXT        | sim      | —                   | —                     | —          |
| `feedback`         | TEXT        | NOT NULL | `'pending'`         | —                     | —          |
| `feedback_at`      | TIMESTAMPTZ | sim      | —                   | —                     | —          |
| `context_snapshot` | JSONB       | sim      | —                   | —                     | —          |
| `created_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `updated_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |

### `pipeline_coverage_recommendations`

**RLS habilitada** · 4 policies: `Authenticated users can view coverage recommendations`, `Admins/managers can insert coverage recommendations`, `Admins can delete coverage recommendations`, `Managers can update coverage recommendations`

| Coluna                   | Tipo        | Nulo     | Default             | Constraints                           | Comentário |
| ------------------------ | ----------- | -------- | ------------------- | ------------------------------------- | ---------- |
| `id`                     | UUID        | NOT NULL | `gen_random_uuid()` | PK                                    | —          |
| `snapshot_id`            | UUID        | NOT NULL | —                   | FK → `pipeline_coverage_snapshots.id` | —          |
| `priority`               | TEXT        | NOT NULL | `'medium'`          | —                                     | —          |
| `title`                  | TEXT        | NOT NULL | —                   | —                                     | —          |
| `action`                 | TEXT        | NOT NULL | —                   | —                                     | —          |
| `expected_impact_amount` | NUMERIC     | NOT NULL | `0`                 | —                                     | —          |
| `ai_generated`           | BOOLEAN     | NOT NULL | `true`              | —                                     | —          |
| `acted_on`               | BOOLEAN     | NOT NULL | `false`             | —                                     | —          |
| `acted_on_at`            | TIMESTAMPTZ | sim      | —                   | —                                     | —          |
| `acted_on_by`            | UUID        | sim      | —                   | —                                     | —          |
| `created_at`             | TIMESTAMPTZ | NOT NULL | `now()`             | —                                     | —          |

### `pipeline_coverage_snapshots`

**RLS habilitada** · 4 policies: `Authenticated users can view coverage snapshots`, `Admins/managers can insert coverage snapshots`, `Admins/managers can update coverage snapshots`, `Admins can delete coverage snapshots`

| Coluna              | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`                | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `period_start`      | DATE        | NOT NULL | —                   | —           | —          |
| `period_end`        | DATE        | NOT NULL | —                   | —           | —          |
| `owner_id`          | UUID        | sim      | —                   | —           | —          |
| `segment`           | TEXT        | sim      | —                   | —           | —          |
| `stage`             | TEXT        | sim      | —                   | —           | —          |
| `quota_amount`      | NUMERIC     | NOT NULL | `0`                 | —           | —          |
| `pipeline_amount`   | NUMERIC     | NOT NULL | `0`                 | —           | —          |
| `weighted_pipeline` | NUMERIC     | NOT NULL | `0`                 | —           | —          |
| `coverage_ratio`    | NUMERIC     | NOT NULL | `0`                 | —           | —          |
| `target_ratio`      | NUMERIC     | NOT NULL | `3.0`               | —           | —          |
| `health`            | TEXT        | NOT NULL | `'critical'`        | —           | —          |
| `gap_to_target`     | NUMERIC     | NOT NULL | `0`                 | —           | —          |
| `deals_count`       | INTEGER     | NOT NULL | `0`                 | —           | —          |
| `calculated_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `created_at`        | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `pipeline_inspection_snapshots`

**RLS habilitada** · 0 policies

| Coluna                | Tipo        | Nulo     | Default             | Constraints     | Comentário |
| --------------------- | ----------- | -------- | ------------------- | --------------- | ---------- |
| `id`                  | uuid        | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `sale_id`             | uuid        | NOT NULL | —                   | FK → `sales.id` | —          |
| `stage`               | text        | NOT NULL | —                   | —               | —          |
| `days_in_stage`       | integer     | NOT NULL | `0`                 | —               | —          |
| `last_activity_at`    | timestamptz | sim      | —                   | —               | —          |
| `days_since_activity` | integer     | sim      | —                   | —               | —          |
| `risk_flags`          | jsonb       | NOT NULL | `'[]'::jsonb`       | —               | —          |
| `health_score`        | integer     | sim      | —                   | —               | —          |
| `inspected_at`        | timestamptz | NOT NULL | `now()`             | —               | —          |

### `pipeline_inspections`

**RLS habilitada** · 2 policies: `Users can view inspections for their sales`, `Managers can create inspections`

| Coluna                            | Tipo                     | Nulo     | Default             | Constraints          | Comentário |
| --------------------------------- | ------------------------ | -------- | ------------------- | -------------------- | ---------- |
| `id`                              | UUID                     | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `sale_id`                         | UUID                     | sim      | —                   | FK → `sales.id`      | —          |
| `inspector_id`                    | UUID                     | sim      | —                   | FK → `auth.users.id` | —          |
| `status_at_inspection`            | TEXT                     | sim      | —                   | —                    | —          |
| `amount_at_inspection`            | NUMERIC                  | sim      | —                   | —                    | —          |
| `forecast_category_at_inspection` | public.forecast_category | sim      | —                   | —                    | —          |
| `notes`                           | TEXT                     | sim      | —                   | —                    | —          |
| `risk_signals`                    | JSONB                    | sim      | —                   | —                    | —          |
| `next_steps_agreed`               | TEXT[]                   | sim      | —                   | —                    | —          |
| `created_at`                      | TIMESTAMPTZ              | sim      | `now()`             | —                    | —          |

### `pipeline_stages`

**RLS habilitada** · 6 policies: `Authenticated users can view pipeline stages`, `pipeline_stages_select_authenticated`, `pipeline_stages_insert_admin_manager`, `pipeline_stages_update_admin_manager`, `pipeline_stages_delete_admin_manager`, `Only admins can manage pipeline stages`

| Coluna        | Tipo                     | Nulo     | Default             | Constraints         | Comentário |
| ------------- | ------------------------ | -------- | ------------------- | ------------------- | ---------- |
| `id`          | UUID                     | NOT NULL | `gen_random_uuid()` | PK                  | —          |
| `pipeline_id` | UUID                     | NOT NULL | —                   | FK → `pipelines.id` | —          |
| `name`        | TEXT                     | NOT NULL | —                   | —                   | —          |
| `label`       | TEXT                     | NOT NULL | —                   | —                   | —          |
| `color`       | TEXT                     | NOT NULL | `'bg-blue-500'`     | —                   | —          |
| `stage_order` | INTEGER                  | NOT NULL | `0`                 | —                   | —          |
| `probability` | INTEGER                  | NOT NULL | `0`                 | —                   | —          |
| `is_final`    | BOOLEAN                  | NOT NULL | `false`             | —                   | —          |
| `created_at`  | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                   | —          |

### `pipelines`

**RLS habilitada** · 5 policies: `Authenticated users can view pipelines`, `pipelines_select_authenticated`, `pipelines_insert_admin_manager`, `pipelines_update_admin_manager`, `pipelines_delete_admin_manager`

| Coluna          | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| --------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`            | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `name`          | TEXT                     | NOT NULL | —                   | —           | —          |
| `description`   | TEXT                     | sim      | —                   | —           | —          |
| `color`         | TEXT                     | NOT NULL | `'bg-blue-500'`     | —           | —          |
| `icon`          | TEXT                     | NOT NULL | `'kanban'`          | —           | —          |
| `is_active`     | BOOLEAN                  | NOT NULL | `true`              | —           | —          |
| `display_order` | INTEGER                  | NOT NULL | `0`                 | —           | —          |
| `created_at`    | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |
| `updated_at`    | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |

### `playbook_items`

**RLS habilitada** · 4 policies: `Authenticated users can read playbook_items`, `Admins and managers can insert playbook_items`, `Admins and managers can update playbook_items`, `Admins and managers can delete playbook_items`

| Coluna           | Tipo                     | Nulo     | Default             | Constraints                       | Comentário |
| ---------------- | ------------------------ | -------- | ------------------- | --------------------------------- | ---------- |
| `id`             | UUID                     | NOT NULL | `gen_random_uuid()` | PK                                | —          |
| `playbook_id`    | UUID                     | NOT NULL | —                   | FK → `playbooks.id`               | —          |
| `content`        | TEXT                     | NOT NULL | —                   | —                                 | —          |
| `item_order`     | INTEGER                  | NOT NULL | `0`                 | —                                 | —          |
| `is_required`    | BOOLEAN                  | NOT NULL | `false`             | —                                 | —          |
| `item_type`      | TEXT                     | NOT NULL | `'checklist'`       | —                                 | —          |
| `created_at`     | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                                 | —          |
| `asset_id`       | UUID                     | sim      | —                   | FK → `sales_enablement_assets.id` | —          |
| `target_outcome` | TEXT                     | sim      | —                   | —                                 | —          |

### `playbook_progress`

**RLS habilitada** · 6 policies: `Users can insert own playbook_progress`, `Users can update own playbook_progress`, `Users can delete own playbook_progress`, `Users can view own playbook_progress or admin`, `Allow read for all authenticated`, `Allow update for own completion`

| Coluna             | Tipo                     | Nulo     | Default             | Constraints              | Comentário |
| ------------------ | ------------------------ | -------- | ------------------- | ------------------------ | ---------- |
| `id`               | UUID                     | NOT NULL | `gen_random_uuid()` | PK                       | —          |
| `playbook_item_id` | UUID                     | NOT NULL | —                   | FK → `playbook_items.id` | —          |
| `sale_id`          | UUID                     | NOT NULL | —                   | FK → `sales.id`          | —          |
| `completed_at`     | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                        | —          |
| `completed_by`     | UUID                     | sim      | —                   | FK → `salespeople.id`    | —          |

### `playbooks`

**RLS habilitada** · 4 policies: `Authenticated users can read playbooks`, `Admins and managers can insert playbooks`, `Admins and managers can update playbooks`, `Admins and managers can delete playbooks`

| Coluna        | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`          | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `stage`       | TEXT                     | NOT NULL | —                   | —           | —          |
| `title`       | TEXT                     | NOT NULL | —                   | —           | —          |
| `description` | TEXT                     | sim      | —                   | —           | —          |
| `created_at`  | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |
| `updated_at`  | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |

### `portfolio_settings`

**RLS habilitada** · 3 policies: `Admins can manage portfolio_settings`, `Authenticated users can read non-sensitive portfolio settings`, `Admins can read all portfolio settings including credentials`

| Coluna          | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| --------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`            | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `setting_key`   | TEXT                     | NOT NULL | —                   | UNIQUE      | —          |
| `setting_value` | TEXT                     | NOT NULL | —                   | —           | —          |
| `description`   | TEXT                     | sim      | —                   | —           | —          |
| `updated_at`    | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |

### `price_alerts`

**RLS habilitada** · 3 policies: `Admin and managers can update price_alerts`, `Admin/manager can insert price_alerts`, `Admin/manager can view price_alerts`

| Coluna                 | Tipo                     | Nulo     | Default             | Constraints         | Comentário |
| ---------------------- | ------------------------ | -------- | ------------------- | ------------------- | ---------- |
| `id`                   | UUID                     | NOT NULL | `gen_random_uuid()` | PK                  | —          |
| `product_id`           | UUID                     | sim      | —                   | FK → `products.id`  | —          |
| `supplier_id`          | UUID                     | sim      | —                   | FK → `suppliers.id` | —          |
| `alert_type`           | TEXT                     | NOT NULL | —                   | —                   | —          |
| `old_price`            | NUMERIC                  | sim      | —                   | —                   | —          |
| `new_price`            | NUMERIC                  | NOT NULL | —                   | —                   | —          |
| `price_change_percent` | NUMERIC                  | sim      | —                   | —                   | —          |
| `is_read`              | BOOLEAN                  | NOT NULL | `false`             | —                   | —          |
| `created_at`           | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                   | —          |

### `price_history`

**RLS habilitada** · 2 policies: `Admin and managers can insert price_history`, `Admin/manager can view price_history`

| Coluna                 | Tipo                     | Nulo     | Default             | Constraints                 | Comentário |
| ---------------------- | ------------------------ | -------- | ------------------- | --------------------------- | ---------- |
| `id`                   | UUID                     | NOT NULL | `gen_random_uuid()` | PK                          | —          |
| `supplier_product_id`  | UUID                     | sim      | —                   | FK → `supplier_products.id` | —          |
| `product_id`           | UUID                     | sim      | —                   | FK → `products.id`          | —          |
| `supplier_id`          | UUID                     | sim      | —                   | FK → `suppliers.id`         | —          |
| `old_price`            | NUMERIC                  | NOT NULL | —                   | —                           | —          |
| `new_price`            | NUMERIC                  | NOT NULL | —                   | —                           | —          |
| `price_change_percent` | NUMERIC                  | sim      | —                   | —                           | —          |
| `recorded_at`          | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                           | —          |
| `created_at`           | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                           | —          |

### `price_protection_rules`

**RLS habilitada** · 1 policies: `Allow read for all authenticated users`

| Coluna            | Tipo                     | Nulo     | Default             | Constraints        | Comentário |
| ----------------- | ------------------------ | -------- | ------------------- | ------------------ | ---------- |
| `id`              | UUID                     | NOT NULL | `gen_random_uuid()` | PK                 | —          |
| `product_id`      | UUID                     | sim      | —                   | FK → `products.id` | —          |
| `min_margin_pct`  | DECIMAL(5,2)             | sim      | `10.0`              | —                  | —          |
| `target_position` | TEXT                     | sim      | `'match'`           | —                  | —          |
| `is_active`       | BOOLEAN                  | sim      | `true`              | —                  | —          |
| `created_at`      | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                  | —          |

### `pricing_rules`

**RLS habilitada** · 1 policies: `Pricing rules are viewable by authenticated users`

| Coluna                | Tipo                     | Nulo     | Default             | Constraints        | Comentário |
| --------------------- | ------------------------ | -------- | ------------------- | ------------------ | ---------- |
| `id`                  | UUID                     | NOT NULL | `gen_random_uuid()` | PK                 | —          |
| `name`                | TEXT                     | NOT NULL | —                   | —                  | —          |
| `rule_type`           | TEXT                     | NOT NULL | —                   | —                  | —          |
| `tier_pricing`        | product_id UUID          | sim      | —                   | FK → `products.id` | —          |
| `min_quantity`        | INTEGER                  | sim      | —                   | —                  | —          |
| `discount_percentage` | NUMERIC(5,2)             | sim      | —                   | —                  | —          |
| `active`              | BOOLEAN                  | sim      | `true`              | —                  | —          |
| `created_at`          | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                  | —          |

### `prize_wheel_spins`

**RLS habilitada** · 1 policies: `Own or admin can view spins`

| Coluna           | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `prize_type`     | TEXT        | NOT NULL | —                   | —                     | —          |
| `prize_value`    | INTEGER     | NOT NULL | `0`                 | —                     | —          |
| `prize_label`    | TEXT        | NOT NULL | —                   | —                     | —          |
| `trigger_type`   | TEXT        | NOT NULL | `'mission'`         | —                     | —          |
| `spun_at`        | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `request_id`     | uuid        | sim      | —                   | —                     | —          |

### `product_stock_log`

**RLS habilitada** · 1 policies: `Allow authenticated users to read stock logs`

| Coluna          | Tipo                     | Nulo     | Default             | Constraints        | Comentário |
| --------------- | ------------------------ | -------- | ------------------- | ------------------ | ---------- |
| `id`            | UUID                     | NOT NULL | `gen_random_uuid()` | PK                 | —          |
| `product_id`    | UUID                     | sim      | —                   | FK → `products.id` | —          |
| `change_amount` | INTEGER                  | NOT NULL | —                   | —                  | —          |
| `reason`        | TEXT                     | sim      | —                   | —                  | —          |
| `created_at`    | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                  | —          |

### `product_usage`

**RLS habilitada** · 1 policies: `Product usage scoped visibility`

| Coluna         | Tipo                     | Nulo     | Default             | Constraints       | Comentário |
| -------------- | ------------------------ | -------- | ------------------- | ----------------- | ---------- |
| `id`           | UUID                     | NOT NULL | `gen_random_uuid()` | PK                | —          |
| `client_id`    | UUID                     | NOT NULL | —                   | FK → `clients.id` | —          |
| `feature_name` | TEXT                     | NOT NULL | —                   | —                 | —          |
| `usage_count`  | INTEGER                  | sim      | `0`                 | —                 | —          |
| `last_used_at` | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                 | —          |
| `period_start` | DATE                     | sim      | —                   | —                 | —          |
| `period_end`   | DATE                     | sim      | —                   | —                 | —          |

### `product_usage_events`

**RLS habilitada** · 2 policies: `cs_pue_select`, `cs_pue_insert`

| Coluna        | Tipo        | Nulo     | Default             | Constraints        | Comentário |
| ------------- | ----------- | -------- | ------------------- | ------------------ | ---------- |
| `id`          | uuid        | NOT NULL | `gen_random_uuid()` | PK                 | —          |
| `account_id`  | uuid        | NOT NULL | —                   | FK → `accounts.id` | —          |
| `user_email`  | text        | sim      | —                   | —                  | —          |
| `feature_key` | text        | NOT NULL | —                   | —                  | —          |
| `event_type`  | text        | NOT NULL | `'feature_use'`     | —                  | —          |
| `occurred_at` | timestamptz | NOT NULL | `now()`             | —                  | —          |
| `metadata`    | jsonb       | NOT NULL | `'{}'::jsonb`       | —                  | —          |

### `product_usage_summary`

**RLS habilitada** · 2 policies: `cs_pus_select`, `cs_pus_modify`

| Coluna           | Tipo        | Nulo     | Default       | Constraints             | Comentário |
| ---------------- | ----------- | -------- | ------------- | ----------------------- | ---------- |
| `account_id`     | uuid        | NOT NULL | —             | PK · FK → `accounts.id` | —          |
| `dau`            | int         | NOT NULL | `0`           | —                       | —          |
| `wau`            | int         | NOT NULL | `0`           | —                       | —          |
| `mau`            | int         | NOT NULL | `0`           | —                       | —          |
| `last_login_at`  | timestamptz | sim      | —             | —                       | —          |
| `top_features`   | jsonb       | NOT NULL | `'[]'::jsonb` | —                       | —          |
| `adoption_score` | int         | NOT NULL | `0`           | —                       | —          |
| `computed_at`    | timestamptz | NOT NULL | `now()`       | —                       | —          |

### `products`

**RLS habilitada** · 6 policies: `Authenticated users can read products`, `Admins and managers can insert products`, `Admins and managers can update products`, `Admins and managers can delete products`, `Admins can view deleted products`, `Everyone can view active products`

| Coluna            | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ----------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`              | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `name`            | TEXT                     | NOT NULL | —                   | —           | —          |
| `category`        | TEXT                     | sim      | `'Assinatura'`      | —           | —          |
| `price`           | DECIMAL(12,2)            | sim      | `0`                 | —           | —          |
| `sales_count`     | INTEGER                  | NOT NULL | `0`                 | —           | —          |
| `rating`          | NUMERIC                  | NOT NULL | `0`                 | —           | —          |
| `status`          | TEXT                     | NOT NULL | `'ativo'`           | —           | —          |
| `created_at`      | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |
| `updated_at`      | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |
| `deleted_at`      | TIMESTAMP WITH TIME ZONE | sim      | —                   | —           | —          |
| `deleted_by`      | UUID                     | sim      | —                   | —           | —          |
| `delete_reason`   | TEXT                     | sim      | —                   | —           | —          |
| `sku`             | TEXT                     | sim      | —                   | —           | —          |
| `stock_quantity`  | INTEGER                  | sim      | `0`                 | —           | —          |
| `min_stock_level` | INTEGER                  | sim      | `5`                 | —           | —          |
| `description`     | TEXT                     | sim      | —                   | —           | —          |
| `default_cost`    | NUMERIC(12,2)            | sim      | —                   | —           | —          |
| `cost_synced_at`  | TIMESTAMPTZ              | sim      | —                   | —           | —          |

### `progressive_goals`

**RLS habilitada** · 3 policies: `Users can insert own goals`, `Users can view own goals or admin`, `Admins can update progressive_goals`

| Coluna             | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ------------------ | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`               | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id`   | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `goal_type`        | TEXT        | NOT NULL | `'revenue'`         | —                     | —          |
| `current_level`    | INTEGER     | NOT NULL | `1`                 | —                     | —          |
| `current_target`   | NUMERIC     | NOT NULL | `10000`             | —                     | —          |
| `current_progress` | NUMERIC     | NOT NULL | `0`                 | —                     | —          |
| `multiplier`       | NUMERIC     | NOT NULL | `1.3`               | —                     | —          |
| `completed_levels` | INTEGER     | NOT NULL | `0`                 | —                     | —          |
| `total_xp_earned`  | INTEGER     | NOT NULL | `0`                 | —                     | —          |
| `updated_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `created_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |

### `prospect_cadences`

**RLS habilitada** · 4 policies: `Users can insert own prospect_cadences`, `Users can update own prospect_cadences`, `Users can delete own prospect_cadences`, `Users can read own prospect_cadences`

| Coluna                 | Tipo                     | Nulo     | Default             | Constraints                        | Comentário |
| ---------------------- | ------------------------ | -------- | ------------------- | ---------------------------------- | ---------- |
| `id`                   | UUID                     | NOT NULL | `gen_random_uuid()` | PK                                 | —          |
| `sale_id`              | UUID                     | sim      | —                   | FK → `sales.id`                    | —          |
| `cadence_id`           | UUID                     | NOT NULL | —                   | FK → `cadences.id`                 | —          |
| `salesperson_id`       | UUID                     | sim      | —                   | FK → `salespeople.id`              | —          |
| `status`               | TEXT                     | NOT NULL | `'active'`          | —                                  | —          |
| `started_at`           | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                                  | —          |
| `current_step`         | INTEGER                  | NOT NULL | `0`                 | —                                  | —          |
| `next_action_date`     | DATE                     | sim      | —                   | —                                  | —          |
| `completed_at`         | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                                  | —          |
| `created_at`           | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                                  | —          |
| `updated_at`           | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                                  | —          |
| `enrolled_via_rule_id` | UUID                     | sim      | —                   | FK → `cadence_enrollment_rules.id` | —          |
| `enrollment_source`    | TEXT                     | NOT NULL | `'manual'`          | —                                  | —          |
| `paused_reason`        | TEXT                     | sim      | —                   | —                                  | —          |
| `paused_at`            | TIMESTAMPTZ              | sim      | —                   | —                                  | —          |
| `quote_id`             | uuid                     | sim      | —                   | FK → `quotes.id`                   | —          |
| `funnel_stage`         | TEXT                     | sim      | `'new'`             | —                                  | —          |

### `push_subscriptions`

**RLS habilitada** · 8 policies: `Users can view their own push subscription`, `Users can create their own push subscription`, `Users can update their own push subscription`, `Users can delete their own push subscription`, `Users can read own push subscriptions`, `Users can insert own push subscriptions`, `Users can update own push subscriptions`, `Users can delete own push subscriptions`

| Coluna       | Tipo                     | Nulo     | Default             | Constraints          | Comentário |
| ------------ | ------------------------ | -------- | ------------------- | -------------------- | ---------- |
| `id`         | UUID                     | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `user_id`    | UUID                     | NOT NULL | —                   | FK → `auth.users.id` | —          |
| `endpoint`   | TEXT                     | NOT NULL | —                   | —                    | —          |
| `p256dh`     | TEXT                     | NOT NULL | —                   | —                    | —          |
| `auth`       | TEXT                     | NOT NULL | —                   | —                    | —          |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                    | —          |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                    | —          |

### `qbr_reports`

**RLS habilitada** · 0 policies

| Coluna            | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ----------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`              | uuid        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `period_label`    | text        | NOT NULL | —                   | —                     | —          |
| `period_start`    | date        | NOT NULL | —                   | —                     | —          |
| `period_end`      | date        | NOT NULL | —                   | —                     | —          |
| `salesperson_id`  | uuid        | sim      | —                   | FK → `salespeople.id` | —          |
| `metrics`         | jsonb       | NOT NULL | `'{}'::jsonb`       | —                     | —          |
| `ai_narrative`    | text        | sim      | —                   | —                     | —          |
| `recommendations` | jsonb       | NOT NULL | `'[]'::jsonb`       | —                     | —          |
| `generated_by`    | uuid        | sim      | —                   | —                     | —          |
| `generated_at`    | timestamptz | NOT NULL | `now()`             | —                     | —          |

### `qbr_schedule`

**RLS habilitada** · 2 policies: `cs_qbr_select`, `cs_qbr_modify`

| Coluna                 | Tipo                 | Nulo     | Default             | Constraints           | Comentário |
| ---------------------- | -------------------- | -------- | ------------------- | --------------------- | ---------- |
| `id`                   | uuid                 | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `account_id`           | uuid                 | NOT NULL | —                   | FK → `accounts.id`    | —          |
| `frequency`            | public.qbr_frequency | NOT NULL | `'quarterly'`       | —                     | —          |
| `next_qbr_at`          | date                 | sim      | —                   | —                     | —          |
| `last_qbr_at`          | date                 | sim      | —                   | —                     | —          |
| `owner_salesperson_id` | uuid                 | sim      | —                   | FK → `salespeople.id` | —          |
| `auto_generate`        | boolean              | NOT NULL | `true`              | —                     | —          |
| `is_active`            | boolean              | NOT NULL | `true`              | —                     | —          |
| `created_at`           | timestamptz          | NOT NULL | `now()`             | —                     | —          |
| `updated_at`           | timestamptz          | NOT NULL | `now()`             | —                     | —          |

### `query_telemetry`

**RLS habilitada** · 3 policies: `Admins can view telemetry`, `Admins can delete telemetry`, `Authenticated users can insert own telemetry`

| Coluna          | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| --------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`            | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `operation`     | TEXT                     | NOT NULL | `'select'`          | —           | —          |
| `table_name`    | TEXT                     | sim      | —                   | —           | —          |
| `rpc_name`      | TEXT                     | sim      | —                   | —           | —          |
| `duration_ms`   | INTEGER                  | NOT NULL | `0`                 | —           | —          |
| `record_count`  | INTEGER                  | sim      | —                   | —           | —          |
| `query_limit`   | INTEGER                  | sim      | —                   | —           | —          |
| `query_offset`  | INTEGER                  | sim      | —                   | —           | —          |
| `count_mode`    | TEXT                     | sim      | —                   | —           | —          |
| `severity`      | TEXT                     | NOT NULL | `'normal'`          | —           | —          |
| `error_message` | TEXT                     | sim      | —                   | —           | —          |
| `user_id`       | UUID                     | sim      | —                   | —           | —          |
| `created_at`    | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |

### `quota_attainment_actions`

**RLS habilitada** · 2 policies: `Authenticated can view quota actions`, `Admins/managers manage quota actions`

| Coluna            | Tipo        | Nulo     | Default             | Constraints                          | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ------------------------------------ | ---------- |
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK                                   | —          |
| `forecast_id`     | UUID        | NOT NULL | —                   | FK → `quota_attainment_forecasts.id` | —          |
| `action_type`     | TEXT        | NOT NULL | —                   | —                                    | —          |
| `title`           | TEXT        | NOT NULL | —                   | —                                    | —          |
| `description`     | TEXT        | sim      | —                   | —                                    | —          |
| `expected_impact` | NUMERIC     | NOT NULL | `0`                 | —                                    | —          |
| `priority`        | INT         | NOT NULL | `1`                 | —                                    | —          |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                                    | —          |

### `quota_attainment_alerts`

**RLS habilitada** · 2 policies: `Authenticated read alerts`, `Admin/manager write alerts`

| Coluna               | Tipo        | Nulo     | Default             | Constraints                            | Comentário |
| -------------------- | ----------- | -------- | ------------------- | -------------------------------------- | ---------- |
| `id`                 | UUID        | NOT NULL | `gen_random_uuid()` | PK                                     | —          |
| `prediction_id`      | UUID        | NOT NULL | —                   | FK → `quota_attainment_predictions.id` | —          |
| `salesperson_id`     | UUID        | NOT NULL | —                   | FK → `salespeople.id`                  | —          |
| `severity`           | TEXT        | NOT NULL | `'info'`            | —                                      | —          |
| `message`            | TEXT        | NOT NULL | —                   | —                                      | —          |
| `recommended_action` | TEXT        | sim      | —                   | —                                      | —          |
| `acknowledged`       | BOOLEAN     | NOT NULL | `false`             | —                                      | —          |
| `created_at`         | TIMESTAMPTZ | NOT NULL | `now()`             | —                                      | —          |

### `quota_attainment_forecasts`

**RLS habilitada** · 2 policies: `Authenticated can view quota forecasts`, `Admins/managers manage quota forecasts`

| Coluna                   | Tipo        | Nulo     | Default             | Constraints                    | Comentário |
| ------------------------ | ----------- | -------- | ------------------- | ------------------------------ | ---------- |
| `id`                     | UUID        | NOT NULL | `gen_random_uuid()` | PK                             | —          |
| `salesperson_id`         | UUID        | NOT NULL | —                   | UNIQUE · FK → `salespeople.id` | —          |
| `period_start`           | DATE        | NOT NULL | —                   | UNIQUE                         | —          |
| `period_end`             | DATE        | NOT NULL | —                   | —                              | —          |
| `quota`                  | NUMERIC     | NOT NULL | `0`                 | —                              | —          |
| `closed`                 | NUMERIC     | NOT NULL | `0`                 | —                              | —          |
| `weighted_open`          | NUMERIC     | NOT NULL | `0`                 | —                              | —          |
| `pace_per_day`           | NUMERIC     | NOT NULL | `0`                 | —                              | —          |
| `days_remaining`         | INT         | NOT NULL | `0`                 | —                              | —          |
| `p10`                    | NUMERIC     | NOT NULL | `0`                 | —                              | —          |
| `p50`                    | NUMERIC     | NOT NULL | `0`                 | —                              | —          |
| `p90`                    | NUMERIC     | NOT NULL | `0`                 | —                              | —          |
| `attainment_probability` | NUMERIC     | NOT NULL | `0`                 | —                              | —          |
| `risk_level`             | TEXT        | NOT NULL | `'on_track'`        | —                              | —          |
| `simulations`            | INT         | NOT NULL | `1000`              | —                              | —          |
| `computed_at`            | TIMESTAMPTZ | NOT NULL | `now()`             | —                              | —          |

### `quota_attainment_predictions`

**RLS habilitada** · 3 policies: `Authenticated read predictions`, `Admin/manager write predictions`, `Allow read for all authenticated users`

| Coluna                     | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| -------------------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`                       | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `salesperson_id`           | UUID                     | NOT NULL | —                   | —           | —          |
| `period_start`             | DATE                     | NOT NULL | —                   | —           | —          |
| `period_end`               | DATE                     | NOT NULL | —                   | —           | —          |
| `quota_amount`             | NUMERIC                  | NOT NULL | `0`                 | —           | —          |
| `closed_amount`            | NUMERIC                  | NOT NULL | `0`                 | —           | —          |
| `weighted_pipeline`        | NUMERIC                  | NOT NULL | `0`                 | —           | —          |
| `predicted_amount`         | NUMERIC                  | NOT NULL | `0`                 | —           | —          |
| `attainment_probability`   | NUMERIC                  | NOT NULL | `0`                 | —           | —          |
| `scenario_pessimistic`     | NUMERIC                  | NOT NULL | `0`                 | —           | —          |
| `scenario_realistic`       | NUMERIC                  | NOT NULL | `0`                 | —           | —          |
| `scenario_optimistic`      | NUMERIC                  | NOT NULL | `0`                 | —           | —          |
| `pace_required_per_day`    | NUMERIC                  | NOT NULL | `0`                 | —           | —          |
| `current_pace_per_day`     | NUMERIC                  | NOT NULL | `0`                 | —           | —          |
| `risk_level`               | TEXT                     | NOT NULL | `'on_track'`        | —           | —          |
| `factors`                  | JSONB                    | NOT NULL | `'{}'::jsonb`       | —           | —          |
| `calculated_at`            | TIMESTAMPTZ              | NOT NULL | `now()`             | —           | —          |
| `period_date`              | DATE                     | NOT NULL | `CURRENT_DATE`      | —           | —          |
| `current_attainment_pct`   | DECIMAL(5,2)             | sim      | —                   | —           | —          |
| `predicted_attainment_pct` | DECIMAL(5,2)             | sim      | —                   | —           | —          |
| `pace_status`              | TEXT                     | sim      | —                   | —           | —          |
| `last_calculated_at`       | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —          |

### `quote_conversion_audit`

**RLS habilitada** · 1 policies: `admins can read conversion audit`

| Coluna            | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `quote_id`        | UUID        | NOT NULL | —                   | —           | —          |
| `sale_id`         | UUID        | sim      | —                   | —           | —          |
| `order_id`        | UUID        | sim      | —                   | —           | —          |
| `order_number`    | TEXT        | sim      | —                   | —           | —          |
| `previous_status` | TEXT        | sim      | —                   | —           | —          |
| `new_status`      | TEXT        | sim      | —                   | —           | —          |
| `reused_order`    | BOOLEAN     | NOT NULL | `false`             | —           | —          |
| `idempotent`      | BOOLEAN     | NOT NULL | `false`             | —           | —          |
| `success`         | BOOLEAN     | NOT NULL | —                   | —           | —          |
| `error_code`      | TEXT        | sim      | —                   | —           | —          |
| `error_message`   | TEXT        | sim      | —                   | —           | —          |
| `latency_ms`      | INTEGER     | sim      | —                   | —           | —          |
| `request_id`      | TEXT        | sim      | —                   | —           | —          |
| `actor_user_id`   | UUID        | sim      | —                   | —           | —          |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `quote_items`

**RLS habilitada** · 1 policies: `Quote items are viewable by authenticated users`

| Coluna            | Tipo                                | Nulo     | Default             | Constraints        | Comentário |
| ----------------- | ----------------------------------- | -------- | ------------------- | ------------------ | ---------- |
| `id`              | UUID                                | NOT NULL | `gen_random_uuid()` | PK                 | —          |
| `quote_id`        | UUID                                | NOT NULL | —                   | FK → `quotes.id`   | —          |
| `product_id`      | UUID                                | sim      | —                   | FK → `products.id` | —          |
| `product_name`    | TEXT                                | NOT NULL | —                   | —                  | —          |
| `quantity`        | INTEGER                             | NOT NULL | `1`                 | —                  | —          |
| `unit_price`      | NUMERIC(15,2)                       | NOT NULL | —                   | —                  | —          |
| `discount_amount` | NUMERIC(15,2)                       | sim      | `0`                 | —                  | —          |
| `total_price`     | NUMERIC(15,2)                       | NOT NULL | —                   | —                  | —          |
| `is_recurring`    | BOOLEAN                             | sim      | `false`             | —                  | —          |
| `billing_period`  | TEXT                                | sim      | —                   | —                  | —          |
| `annual`          | created_at TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                  | —          |

### `quote_sync_inbound_log`

**RLS habilitada** · 1 policies: `Admins can read quote sync inbound log`

| Coluna              | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`                | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `correlation_key`   | TEXT        | sim      | —                   | —           | —          |
| `event`             | TEXT        | sim      | —                   | —           | —          |
| `status`            | TEXT        | NOT NULL | —                   | —           | —          |
| `http_status`       | INTEGER     | NOT NULL | —                   | —           | —          |
| `error_message`     | TEXT        | sim      | —                   | —           | —          |
| `external_quote_id` | TEXT        | sim      | —                   | —           | —          |
| `quote_id`          | UUID        | sim      | —                   | —           | —          |
| `payload`           | JSONB       | NOT NULL | `'{}'::jsonb`       | —           | —          |
| `source`            | TEXT        | NOT NULL | `'v4'`              | —           | —          |
| `received_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `created_at`        | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `quote_sync_logs`

**RLS habilitada** · 3 policies: `Admins can insert quote_sync_logs`, `Admins can view quote sync logs`, `Admins can view sync logs`

| Coluna              | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ------------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`                | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `external_quote_id` | TEXT                     | sim      | —                   | —           | —          |
| `quote_number`      | TEXT                     | sim      | —                   | —           | —          |
| `action`            | TEXT                     | NOT NULL | —                   | —           | —          |
| `status`            | TEXT                     | NOT NULL | —                   | —           | —          |
| `details`           | JSONB                    | sim      | —                   | —           | —          |
| `error_message`     | TEXT                     | sim      | —                   | —           | —          |
| `created_at`        | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |
| `source`            | TEXT                     | sim      | `'gift_store'`      | —           | —          |
| `payload`           | JSONB                    | sim      | —                   | —           | —          |

### `quotes`

**RLS habilitada** · 4 policies: `Closers can read quotes`, `Closers can insert quotes`, `Closers can update quotes`, `Admins can delete quotes`

| Coluna                 | Tipo                     | Nulo     | Default             | Constraints           | Comentário                                    |
| ---------------------- | ------------------------ | -------- | ------------------- | --------------------- | --------------------------------------------- |
| `id`                   | UUID                     | NOT NULL | `gen_random_uuid()` | PK                    | —                                             |
| `sale_id`              | UUID                     | sim      | —                   | FK → `sales.id`       | —                                             |
| `client_name`          | TEXT                     | NOT NULL | —                   | —                     | —                                             |
| `title`                | TEXT                     | NOT NULL | —                   | —                     | —                                             |
| `description`          | TEXT                     | sim      | —                   | —                     | —                                             |
| `total_value`          | NUMERIC                  | NOT NULL | `0`                 | —                     | —                                             |
| `status`               | TEXT                     | NOT NULL | `'draft'`           | —                     | —                                             |
| `external_reference`   | TEXT                     | sim      | —                   | —                     | —                                             |
| `valid_until`          | DATE                     | sim      | —                   | —                     | —                                             |
| `sent_at`              | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                     | —                                             |
| `approved_at`          | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                     | —                                             |
| `rejected_at`          | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                     | —                                             |
| `rejection_reason`     | TEXT                     | sim      | —                   | —                     | —                                             |
| `created_by`           | UUID                     | sim      | —                   | FK → `salespeople.id` | —                                             |
| `notes`                | TEXT                     | sim      | —                   | —                     | —                                             |
| `created_at`           | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —                                             |
| `updated_at`           | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —                                             |
| `quote_number`         | TEXT                     | sim      | —                   | —                     | —                                             |
| `subtotal`             | DECIMAL(12,2)            | sim      | —                   | —                     | —                                             |
| `discount_percent`     | DECIMAL(5,2)             | sim      | —                   | —                     | —                                             |
| `discount_amount`      | DECIMAL(12,2)            | sim      | —                   | —                     | —                                             |
| `client_email`         | TEXT                     | sim      | —                   | —                     | —                                             |
| `client_phone`         | TEXT                     | sim      | —                   | —                     | —                                             |
| `seller_name`          | TEXT                     | sim      | —                   | —                     | —                                             |
| `items`                | JSONB                    | sim      | `'[]'::jsonb`       | —                     | —                                             |
| `source`               | TEXT                     | sim      | `'manual'`          | —                     | —                                             |
| `synced_from_external` | BOOLEAN                  | sim      | `false`             | —                     | —                                             |
| `external_quote_id`    | TEXT                     | sim      | —                   | —                     | —                                             |
| `last_synced_at`       | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                     | Data da última sincronização com o GIFT STORE |
| `sync_status`          | TEXT                     | sim      | `'none'`            | —                     | Status de sincronização: none, synced, failed |
| `pdf_url`              | TEXT                     | sim      | —                   | —                     | —                                             |
| `currency`             | TEXT                     | sim      | `'BRL'`             | —                     | —                                             |
| `exchange_rate`        | NUMERIC(15,6)            | sim      | `1.0`               | —                     | —                                             |
| `billing_status`       | TEXT                     | sim      | `'pending'`         | —                     | —                                             |
| `contract_start_date`  | DATE                     | sim      | —                   | —                     | —                                             |
| `contract_end_date`    | DATE                     | sim      | —                   | —                     | —                                             |
| `subscription_type`    | TEXT                     | sim      | —                   | —                     | —                                             |
| `external_seller_id`   | TEXT                     | sim      | —                   | —                     | —                                             |
| `client_id`            | UUID                     | sim      | —                   | FK → `clients.id`     | —                                             |

### `quotes_inbound`

**RLS habilitada** · 2 policies: `Admins e managers podem ler quotes_inbound`, `Vendedores podem ver seus próprios orçamentos inbound`

| Coluna                 | Tipo          | Nulo     | Default             | Constraints | Comentário |
| ---------------------- | ------------- | -------- | ------------------- | ----------- | ---------- |
| `id`                   | UUID          | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `quote_id`             | UUID          | NOT NULL | —                   | UNIQUE      | —          |
| `quote_number`         | TEXT          | sim      | —                   | —           | —          |
| `status`               | TEXT          | sim      | —                   | —           | —          |
| `client_id`            | TEXT          | sim      | —                   | —           | —          |
| `client_name`          | TEXT          | sim      | —                   | —           | —          |
| `total`                | NUMERIC(14,2) | sim      | —                   | —           | —          |
| `seller_email`         | TEXT          | sim      | —                   | —           | —          |
| `source`               | TEXT          | NOT NULL | `'promogifts'`      | —           | —          |
| `source_updated_at`    | TIMESTAMPTZ   | sim      | —                   | —           | —          |
| `last_event`           | TEXT          | sim      | —                   | —           | —          |
| `last_correlation_key` | TEXT          | sim      | —                   | —           | —          |
| `raw_payload`          | JSONB         | NOT NULL | `'{}'::jsonb`       | —           | —          |
| `received_at`          | TIMESTAMPTZ   | NOT NULL | `now()`             | —           | —          |
| `created_at`           | TIMESTAMPTZ   | NOT NULL | `now()`             | —           | —          |
| `updated_at`           | TIMESTAMPTZ   | NOT NULL | `now()`             | —           | —          |

### `race_badges`

**RLS habilitada** · 2 policies: `view_race_badges`, `insert_race_badges_admin`

| Coluna           | Tipo        | Nulo     | Default             | Constraints                     | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ------------------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                              | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | UNIQUE · FK → `salespeople.id`  | —          |
| `badge_code`     | TEXT        | NOT NULL | —                   | UNIQUE                          | —          |
| `season_id`      | UUID        | sim      | —                   | UNIQUE · FK → `race_seasons.id` | —          |
| `earned_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                               | —          |

### `race_cars`

**RLS habilitada** · 4 policies: `view_race_cars`, `insert_own_car`, `update_own_car`, `admin_manage_cars`

| Coluna            | Tipo        | Nulo     | Default             | Constraints                    | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ------------------------------ | ---------- |
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK                             | —          |
| `salesperson_id`  | UUID        | NOT NULL | —                   | UNIQUE · FK → `salespeople.id` | —          |
| `car_number`      | INT         | NOT NULL | —                   | —                              | —          |
| `primary_color`   | TEXT        | NOT NULL | `'#ef4444'`         | —                              | —          |
| `secondary_color` | TEXT        | NOT NULL | `'#ffffff'`         | —                              | —          |
| `car_style`       | TEXT        | NOT NULL | `'f1'`              | —                              | —          |
| `nickname`        | text        | sim      | —                   | —                              | —          |
| `total_races`     | INT         | NOT NULL | `0`                 | —                              | —          |
| `total_wins`      | INT         | NOT NULL | `0`                 | —                              | —          |
| `total_overtakes` | INT         | NOT NULL | `0`                 | —                              | —          |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                              | —          |
| `updated_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                              | —          |
| `victory_quote`   | text        | sim      | —                   | —                              | —          |
| `preset_id`       | text        | sim      | —                   | —                              | —          |

### `race_daily_snapshots`

**RLS habilitada** · 2 policies: `race_daily_snapshots_select_authenticated`, `race_daily_snapshots_admin_manage`

| Coluna           | Tipo        | Nulo     | Default             | Constraints                     | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ------------------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                              | —          |
| `season_id`      | UUID        | NOT NULL | —                   | UNIQUE · FK → `race_seasons.id` | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | UNIQUE                          | —          |
| `snapshot_date`  | DATE        | NOT NULL | `(now()`            | UNIQUE                          | —          |
| `rank`           | INTEGER     | NOT NULL | —                   | —                               | —          |
| `progress`       | NUMERIC     | NOT NULL | `0`                 | —                               | —          |
| `total_sales`    | NUMERIC     | NOT NULL | `0`                 | —                               | —          |
| `deals_count`    | INTEGER     | NOT NULL | `0`                 | —                               | —          |
| `score`          | NUMERIC     | sim      | —                   | —                               | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                               | —          |

### `race_events`

**RLS habilitada** · 2 policies: `view_race_events`, `insert_race_events_own_or_admin`

| Coluna           | Tipo        | Nulo     | Default             | Constraints            | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ---------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                     | —          |
| `season_id`      | UUID        | NOT NULL | —                   | FK → `race_seasons.id` | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id`  | —          |
| `event_type`     | TEXT        | NOT NULL | —                   | —                      | —          |
| `metadata`       | JSONB       | NOT NULL | `'{}'::jsonb`       | —                      | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                      | —          |

### `race_overlay_telemetry`

**RLS habilitada** · 4 policies: `Users insert their overlay telemetry`, `Users update their overlay telemetry`, `Users read their overlay telemetry`, `Admins read all overlay telemetry`

| Coluna           | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `user_id`        | UUID        | NOT NULL | —                   | UNIQUE      | —          |
| `overlay_name`   | TEXT        | NOT NULL | —                   | UNIQUE      | —          |
| `viewed_count`   | INTEGER     | NOT NULL | `1`                 | —           | —          |
| `last_viewed_at` | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `race_powerups`

**RLS habilitada** · 3 policies: `view_powerups`, `insert_own_powerups`, `update_own_powerups`

| Coluna           | Tipo        | Nulo     | Default             | Constraints            | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ---------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                     | —          |
| `season_id`      | UUID        | NOT NULL | —                   | FK → `race_seasons.id` | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id`  | —          |
| `powerup_type`   | TEXT        | NOT NULL | —                   | —                      | —          |
| `collected_at`   | TIMESTAMPTZ | NOT NULL | `now()`             | —                      | —          |
| `used_at`        | TIMESTAMPTZ | sim      | —                   | —                      | —          |
| `effect_data`    | JSONB       | NOT NULL | `'{}'::jsonb`       | —                      | —          |

### `race_reactions`

**RLS habilitada** · 0 policies

| Coluna            | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`              | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `season_id`       | uuid        | sim      | —                   | —           | —          |
| `target_car_id`   | uuid        | NOT NULL | —                   | —           | —          |
| `reactor_user_id` | uuid        | NOT NULL | —                   | —           | —          |
| `emoji`           | text        | NOT NULL | —                   | —           | —          |
| `created_at`      | timestamptz | NOT NULL | `now()`             | —           | —          |

### `race_rivalries_persistent`

**RLS habilitada** · 3 policies: `Authenticated users can view rivalries`, `Owners can manage own rivalry`, `Admins manage all rivalries`

| Coluna         | Tipo        | Nulo     | Default             | Constraints                     | Comentário |
| -------------- | ----------- | -------- | ------------------- | ------------------------------- | ---------- |
| `id`           | UUID        | NOT NULL | `gen_random_uuid()` | PK                              | —          |
| `season_id`    | UUID        | NOT NULL | —                   | UNIQUE · FK → `race_seasons.id` | —          |
| `car_id`       | UUID        | NOT NULL | —                   | UNIQUE · FK → `race_cars.id`    | —          |
| `rival_car_id` | UUID        | NOT NULL | —                   | FK → `race_cars.id`             | —          |
| `created_at`   | TIMESTAMPTZ | NOT NULL | `now()`             | —                               | —          |
| `updated_at`   | TIMESTAMPTZ | NOT NULL | `now()`             | —                               | —          |

### `race_scoring_rules`

**RLS habilitada** · 2 policies: `read_scoring_rules_authenticated`, `admin_manage_scoring_rules`

| Coluna            | Tipo        | Nulo     | Default              | Constraints                     | Comentário |
| ----------------- | ----------- | -------- | -------------------- | ------------------------------- | ---------- |
| `id`              | uuid        | NOT NULL | `gen_random_uuid()`  | PK                              | —          |
| `season_id`       | uuid        | NOT NULL | —                    | UNIQUE · FK → `race_seasons.id` | —          |
| `metric_code`     | text        | NOT NULL | —                    | UNIQUE                          | —          |
| `weight`          | numeric     | NOT NULL | `1.0`                | —                               | —          |
| `points_per_unit` | numeric     | NOT NULL | `1.0`                | —                               | —          |
| `label`           | text        | sim      | —                    | —                               | —          |
| `created_at`      | timestamptz | NOT NULL | `now()`              | —                               | —          |
| `month`           | DATE        | sim      | `date_trunc('month'` | —                               | —          |

### `race_seasons`

**RLS habilitada** · 2 policies: `view_race_seasons`, `admin_manage_race_seasons`

| Coluna        | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`          | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `name`        | TEXT        | NOT NULL | —                   | —                     | —          |
| `start_date`  | DATE        | NOT NULL | —                   | —                     | —          |
| `end_date`    | DATE        | NOT NULL | —                   | —                     | —          |
| `track_type`  | TEXT        | NOT NULL | `'oval'`            | —                     | —          |
| `goal_amount` | NUMERIC     | NOT NULL | `0`                 | —                     | —          |
| `status`      | TEXT        | NOT NULL | `'upcoming'`        | —                     | —          |
| `winner_id`   | UUID        | sim      | —                   | FK → `salespeople.id` | —          |
| `created_at`  | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `updated_at`  | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `role_type`   | text        | NOT NULL | `'closer'`          | —                     | —          |

### `race_team_members`

**RLS habilitada** · 2 policies: `Authenticated users can view team members`, `Admins manage team members`

| Coluna      | Tipo        | Nulo     | Default             | Constraints                   | Comentário |
| ----------- | ----------- | -------- | ------------------- | ----------------------------- | ---------- |
| `id`        | UUID        | NOT NULL | `gen_random_uuid()` | PK                            | —          |
| `team_id`   | UUID        | NOT NULL | —                   | UNIQUE · FK → `race_teams.id` | —          |
| `car_id`    | UUID        | NOT NULL | —                   | UNIQUE · FK → `race_cars.id`  | —          |
| `joined_at` | TIMESTAMPTZ | NOT NULL | `now()`             | —                             | —          |

### `race_teams`

**RLS habilitada** · 2 policies: `Authenticated users can view teams`, `Admins manage teams`

| Coluna            | Tipo        | Nulo     | Default             | Constraints                     | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ------------------------------- | ---------- |
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK                              | —          |
| `season_id`       | UUID        | NOT NULL | —                   | UNIQUE · FK → `race_seasons.id` | —          |
| `name`            | TEXT        | NOT NULL | —                   | UNIQUE                          | —          |
| `color_primary`   | TEXT        | NOT NULL | `'#dc2626'`         | —                               | —          |
| `color_secondary` | TEXT        | NOT NULL | `'#fbbf24'`         | —                               | —          |
| `emoji`           | TEXT        | sim      | `'🏎️'`              | —                               | —          |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                               | —          |
| `updated_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                               | —          |

### `race_unlocks`

**RLS habilitada** · 0 policies

| Coluna        | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`          | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `user_id`     | uuid        | NOT NULL | —                   | UNIQUE      | —          |
| `unlock_key`  | text        | NOT NULL | —                   | UNIQUE      | —          |
| `unlocked_at` | timestamptz | NOT NULL | `now()`             | —           | —          |

### `race_user_daily_checkins`

**RLS habilitada** · 2 policies: `race_user_daily_checkins_own_select`, `race_user_daily_checkins_own_insert`

| Coluna           | Tipo        | Nulo     | Default             | Constraints                     | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ------------------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                              | —          |
| `user_id`        | UUID        | NOT NULL | —                   | UNIQUE · FK → `auth.users.id`   | —          |
| `season_id`      | UUID        | NOT NULL | —                   | UNIQUE · FK → `race_seasons.id` | —          |
| `checkin_date`   | DATE        | NOT NULL | `(now()`            | UNIQUE                          | —          |
| `streak_days`    | INTEGER     | NOT NULL | `1`                 | —                               | —          |
| `reward_granted` | BOOLEAN     | NOT NULL | `false`             | —                               | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                               | —          |

### `race_user_preferences`

**RLS habilitada** · 4 policies: `Users read own race preferences`, `Users insert own race preferences`, `Users update own race preferences`, `Users delete own race preferences`

| Coluna           | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `user_id`        | UUID        | NOT NULL | —                   | UNIQUE      | —          |
| `view_mode`      | TEXT        | NOT NULL | `'focus'`           | —           | —          |
| `calm_mode`      | BOOLEAN     | NOT NULL | `false`             | —           | —          |
| `audio_muted`    | BOOLEAN     | NOT NULL | `true`              | —           | —          |
| `tour_completed` | BOOLEAN     | NOT NULL | `false`             | —           | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `updated_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `rank_change_notifications`

**RLS habilitada** · 3 policies: `Users can update own notifications`, `Users can insert own rank_notifications`, `Users can read own rank notifications`

| Coluna            | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| ----------------- | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`              | UUID                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id`  | UUID                     | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `overtaken_by_id` | UUID                     | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `old_rank`        | INTEGER                  | NOT NULL | —                   | —                     | —          |
| `new_rank`        | INTEGER                  | NOT NULL | —                   | —                     | —          |
| `context`         | TEXT                     | sim      | `'monthly'`         | —                     | —          |
| `is_read`         | BOOLEAN                  | sim      | `false`             | —                     | —          |
| `created_at`      | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |

### `ranking_notifications`

**RLS habilitada** · 4 policies: `Salesperson reads own ranking notifications`, `Salesperson updates own ranking notifications`, `Admin manager insert ranking notifications`, `Admin manager delete ranking notifications`

| Coluna                 | Tipo        | Nulo     | Default             | Constraints                    | Comentário |
| ---------------------- | ----------- | -------- | ------------------- | ------------------------------ | ---------- |
| `id`                   | UUID        | NOT NULL | `gen_random_uuid()` | PK                             | —          |
| `salesperson_id`       | UUID        | NOT NULL | —                   | UNIQUE · FK → `salespeople.id` | —          |
| `rank`                 | INT         | NOT NULL | —                   | —                              | —          |
| `total_sales`          | NUMERIC     | NOT NULL | `0`                 | —                              | —          |
| `gap_to_first`         | NUMERIC     | NOT NULL | `0`                 | —                              | —          |
| `gap_to_next`          | NUMERIC     | NOT NULL | `0`                 | —                              | —          |
| `next_competitor_name` | TEXT        | sim      | —                   | —                              | —          |
| `period_start`         | DATE        | NOT NULL | —                   | UNIQUE                         | —          |
| `message`              | TEXT        | NOT NULL | —                   | —                              | —          |
| `read_at`              | TIMESTAMPTZ | sim      | —                   | —                              | —          |
| `created_at`           | TIMESTAMPTZ | NOT NULL | `now()`             | —                              | —          |

### `rate_limit_logs`

**RLS habilitada** · 2 policies: `Admins can view rate_limit_logs`, `Admins can read rate_limit_logs`

| Coluna            | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `identifier`      | TEXT        | NOT NULL | —                   | —           | —          |
| `identifier_type` | TEXT        | NOT NULL | `'ip'`              | —           | —          |
| `action`          | TEXT        | NOT NULL | —                   | —           | —          |
| `request_count`   | INTEGER     | sim      | `1`                 | —           | —          |
| `window_start`    | TIMESTAMPTZ | sim      | `NOW()`             | —           | —          |
| `window_end`      | TIMESTAMPTZ | sim      | —                   | —           | —          |
| `blocked`         | BOOLEAN     | sim      | `FALSE`             | —           | —          |
| `created_at`      | TIMESTAMPTZ | sim      | `NOW()`             | —           | —          |

### `rate_limit_settings`

**RLS habilitada** · 2 policies: `Admins can manage rate_limit_settings`, `Admin can read rate_limit_settings`

| Coluna                   | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------------ | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`                     | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `action`                 | TEXT        | NOT NULL | —                   | UNIQUE      | —          |
| `max_requests`           | INTEGER     | NOT NULL | `100`               | —           | —          |
| `window_seconds`         | INTEGER     | NOT NULL | `3600`              | —           | —          |
| `block_duration_seconds` | INTEGER     | NOT NULL | `3600`              | —           | —          |
| `is_active`              | BOOLEAN     | sim      | `TRUE`              | —           | —          |
| `created_at`             | TIMESTAMPTZ | sim      | `NOW()`             | —           | —          |
| `updated_at`             | TIMESTAMPTZ | sim      | `NOW()`             | —           | —          |

### `reauthentication_requests`

**RLS habilitada** · 3 policies: `Users can view own reauth requests`, `Users can insert own reauth requests`, `Users can update own reauth requests`

| Coluna        | Tipo        | Nulo     | Default             | Constraints          | Comentário |
| ------------- | ----------- | -------- | ------------------- | -------------------- | ---------- |
| `id`          | UUID        | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `user_id`     | UUID        | NOT NULL | —                   | FK → `auth.users.id` | —          |
| `action_type` | TEXT        | NOT NULL | —                   | —                    | —          |
| `verified`    | BOOLEAN     | sim      | `FALSE`             | —                    | —          |
| `verified_at` | TIMESTAMPTZ | sim      | —                   | —                    | —          |
| `expires_at`  | TIMESTAMPTZ | NOT NULL | —                   | —                    | —          |
| `ip_address`  | TEXT        | sim      | —                   | —                    | —          |
| `user_agent`  | TEXT        | sim      | —                   | —                    | —          |
| `created_at`  | TIMESTAMPTZ | sim      | `NOW()`             | —                    | —          |

### `renewals`

**RLS habilitada** · 2 policies: `cs_rn_select`, `cs_rn_modify`

| Coluna                 | Tipo                  | Nulo     | Default             | Constraints           | Comentário |
| ---------------------- | --------------------- | -------- | ------------------- | --------------------- | ---------- |
| `id`                   | uuid                  | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `account_id`           | uuid                  | NOT NULL | —                   | FK → `accounts.id`    | —          |
| `contract_value`       | numeric(14,2)         | NOT NULL | `0`                 | —                     | —          |
| `currency`             | text                  | NOT NULL | `'BRL'`             | —                     | —          |
| `renewal_date`         | date                  | NOT NULL | —                   | —                     | —          |
| `notice_period_days`   | int                   | NOT NULL | `30`                | —                     | —          |
| `auto_renew`           | boolean               | NOT NULL | `false`             | —                     | —          |
| `status`               | public.renewal_status | NOT NULL | `'upcoming'`        | —                     | —          |
| `owner_salesperson_id` | uuid                  | sim      | —                   | FK → `salespeople.id` | —          |
| `notes`                | text                  | sim      | —                   | —                     | —          |
| `created_at`           | timestamptz           | NOT NULL | `now()`             | —                     | —          |
| `updated_at`           | timestamptz           | NOT NULL | `now()`             | —                     | —          |

### `report_embed_tokens`

**RLS habilitada** · 4 policies: `Owners and managers can view embed tokens`, `Owners can create embed tokens`, `Owners and managers can update embed tokens`, `Owners and managers can delete embed tokens`

| Coluna            | Tipo        | Nulo     | Default             | Constraints              | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ------------------------ | ---------- |
| `id`              | uuid        | NOT NULL | `gen_random_uuid()` | PK                       | —          |
| `report_id`       | uuid        | NOT NULL | —                   | FK → `custom_reports.id` | —          |
| `token`           | text        | NOT NULL | —                   | UNIQUE                   | —          |
| `created_by`      | uuid        | NOT NULL | —                   | —                        | —          |
| `expires_at`      | timestamptz | sim      | —                   | —                        | —          |
| `allowed_origins` | text[]      | NOT NULL | `'{}'`              | —                        | —          |
| `view_count`      | integer     | NOT NULL | `0`                 | —                        | —          |
| `last_viewed_at`  | timestamptz | sim      | —                   | —                        | —          |
| `revoked`         | boolean     | NOT NULL | `false`             | —                        | —          |
| `created_at`      | timestamptz | NOT NULL | `now()`             | —                        | —          |

### `report_executions`

**RLS habilitada** · 1 policies: `report_owner_view`

| Coluna            | Tipo        | Nulo     | Default             | Constraints                | Comentário |
| ----------------- | ----------- | -------- | ------------------- | -------------------------- | ---------- |
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK                         | —          |
| `schedule_id`     | UUID        | sim      | —                   | FK → `report_schedules.id` | —          |
| `report_id`       | UUID        | NOT NULL | —                   | FK → `custom_reports.id`   | —          |
| `executed_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                          | —          |
| `status`          | TEXT        | NOT NULL | `'pending'`         | —                          | —          |
| `file_url`        | TEXT        | sim      | —                   | —                          | —          |
| `recipients_sent` | TEXT[]      | sim      | `'{}'`              | —                          | —          |
| `error_message`   | TEXT        | sim      | —                   | —                          | —          |
| `rows_count`      | INTEGER     | sim      | —                   | —                          | —          |
| `duration_ms`     | INTEGER     | sim      | —                   | —                          | —          |

### `report_schedules`

**RLS habilitada** · 1 policies: `creator_full_access`

| Coluna         | Tipo        | Nulo     | Default             | Constraints              | Comentário |
| -------------- | ----------- | -------- | ------------------- | ------------------------ | ---------- |
| `id`           | UUID        | NOT NULL | `gen_random_uuid()` | PK                       | —          |
| `report_id`    | UUID        | NOT NULL | —                   | FK → `custom_reports.id` | —          |
| `frequency`    | TEXT        | NOT NULL | —                   | —                        | —          |
| `day_of_week`  | SMALLINT    | sim      | —                   | —                        | —          |
| `day_of_month` | SMALLINT    | sim      | —                   | —                        | —          |
| `time_of_day`  | TIME        | NOT NULL | `'08:00'`           | —                        | —          |
| `recipients`   | TEXT[]      | NOT NULL | `'{}'`              | —                        | —          |
| `format`       | TEXT        | NOT NULL | `'csv'`             | —                        | —          |
| `is_active`    | BOOLEAN     | NOT NULL | `true`              | —                        | —          |
| `last_run_at`  | TIMESTAMPTZ | sim      | —                   | —                        | —          |
| `next_run_at`  | TIMESTAMPTZ | sim      | —                   | —                        | —          |
| `created_by`   | UUID        | NOT NULL | —                   | —                        | —          |
| `created_at`   | TIMESTAMPTZ | NOT NULL | `now()`             | —                        | —          |
| `updated_at`   | TIMESTAMPTZ | NOT NULL | `now()`             | —                        | —          |

### `revenue_forecasts`

**RLS habilitada** · 2 policies: `Managers and admins view all forecasts`, `System can manage forecasts`

| Coluna              | Tipo        | Nulo     | Default              | Constraints           | Comentário |
| ------------------- | ----------- | -------- | -------------------- | --------------------- | ---------- |
| `id`                | UUID        | NOT NULL | `gen_random_uuid()`  | PK                    | —          |
| `owner_id`          | UUID        | sim      | —                    | FK → `salespeople.id` | —          |
| `period_type`       | TEXT        | NOT NULL | —                    | —                     | —          |
| `period_start`      | DATE        | NOT NULL | —                    | —                     | —          |
| `period_end`        | DATE        | NOT NULL | —                    | —                     | —          |
| `commit_amount`     | NUMERIC     | NOT NULL | `0`                  | —                     | —          |
| `best_case_amount`  | NUMERIC     | NOT NULL | `0`                  | —                     | —          |
| `upside_amount`     | NUMERIC     | NOT NULL | `0`                  | —                     | —          |
| `confidence_score`  | INT         | NOT NULL | `0`                  | —                     | —          |
| `goal_amount`       | NUMERIC     | NOT NULL | `0`                  | —                     | —          |
| `gap_to_goal`       | NUMERIC     | NOT NULL | `0`                  | —                     | —          |
| `deals_count`       | INT         | NOT NULL | `0`                  | —                     | —          |
| `weighted_pipeline` | NUMERIC     | NOT NULL | `0`                  | —                     | —          |
| `factors`           | JSONB       | NOT NULL | `'[]'::jsonb`        | —                     | —          |
| `ai_summary`        | TEXT        | sim      | —                    | —                     | —          |
| `model_version`     | TEXT        | sim      | `'gemini-2.5-flash'` | —                     | —          |
| `calculated_at`     | TIMESTAMPTZ | NOT NULL | `now()`              | —                     | —          |
| `created_at`        | TIMESTAMPTZ | NOT NULL | `now()`              | —                     | —          |
| `updated_at`        | TIMESTAMPTZ | NOT NULL | `now()`              | —                     | —          |

### `role_permissions`

**RLS habilitada** · 2 policies: `Admins can manage role_permissions`, `Admin and managers can read role_permissions`

| Coluna          | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| --------------- | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`            | uuid                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `role`          | app_role                 | NOT NULL | —                   | —                     | —          |
| `permission_id` | uuid                     | NOT NULL | —                   | FK → `permissions.id` | —          |
| `created_at`    | timestamp with time zone | NOT NULL | `now()`             | —                     | —          |

### `roles`

**RLS não declarado nas migrations** · 0 policies

| Coluna        | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`          | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `name`        | TEXT                     | NOT NULL | —                   | UNIQUE      | —          |
| `description` | TEXT                     | sim      | —                   | —           | —          |
| `permissions` | JSONB                    | sim      | `'{}'::jsonb`       | —           | —          |
| `created_at`  | TIMESTAMP WITH TIME ZONE | sim      | `NOW()`             | —           | —          |

### `sale_notifications_audit`

**RLS habilitada** · 1 policies: `Managers can view sale notification audits`

| Coluna                   | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| ------------------------ | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`                     | UUID                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `sale_id`                | UUID                     | sim      | —                   | FK → `sales.id`       | —          |
| `seller_id`              | UUID                     | sim      | —                   | FK → `salespeople.id` | —          |
| `seller_name`            | TEXT                     | sim      | —                   | —                     | —          |
| `sale_amount`            | NUMERIC                  | sim      | —                   | —                     | —          |
| `seller_rank_at_time`    | INT                      | sim      | —                   | —                     | —          |
| `recipient_id`           | UUID                     | sim      | —                   | FK → `salespeople.id` | —          |
| `recipient_rank_at_time` | INT                      | sim      | —                   | —                     | —          |
| `notification_type`      | TEXT                     | sim      | `'in-app'`          | —                     | —          |
| `status`                 | TEXT                     | sim      | `'sent'`            | —                     | —          |
| `created_at`             | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                     | —          |
| `message_sent`           | TEXT                     | sim      | —                   | —                     | —          |
| `channel`                | TEXT                     | sim      | —                   | —                     | —          |
| `error_log`              | TEXT                     | sim      | —                   | —                     | —          |

### `sales`

**RLS habilitada** · 13 policies: `Users can read own sales or admins all`, `Users can insert own sales`, `Users can delete own sales`, `Admins can update any sale`, `Users can enrich their own leads`, `Admins and Managers can view all sales`, `Salespeople can insert their own sales`, `Salespeople can update their own sales`…

| Coluna                      | Tipo                     | Nulo     | Default             | Constraints                    | Comentário                                                                  |
| --------------------------- | ------------------------ | -------- | ------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| `id`                        | UUID                     | NOT NULL | `gen_random_uuid()` | PK                             | —                                                                           |
| `client_name`               | TEXT                     | NOT NULL | —                   | —                              | —                                                                           |
| `product_name`              | TEXT                     | NOT NULL | —                   | —                              | —                                                                           |
| `amount`                    | NUMERIC(12,2)            | NOT NULL | `0`                 | —                              | —                                                                           |
| `status`                    | TEXT                     | NOT NULL | `'pending'`         | —                              | —                                                                           |
| `category`                  | TEXT                     | sim      | —                   | —                              | —                                                                           |
| `created_at`                | TIMESTAMPTZ              | NOT NULL | `now()`             | —                              | —                                                                           |
| `updated_at`                | TIMESTAMPTZ              | NOT NULL | `now()`             | —                              | —                                                                           |
| `salesperson_id`            | UUID                     | sim      | —                   | FK → `salespeople.id`          | —                                                                           |
| `source`                    | TEXT                     | sim      | —                   | —                              | —                                                                           |
| `pipeline_id`               | UUID                     | sim      | —                   | FK → `pipelines.id`            | —                                                                           |
| `forecast_category`         | public.forecast_category | sim      | —                   | —                              | —                                                                           |
| `account_id`                | uuid                     | sim      | —                   | FK → `accounts.id`             | —                                                                           |
| `broadcast_sent_at`         | timestamptz              | sim      | —                   | —                              | —                                                                           |
| `script_variant`            | text                     | sim      | —                   | —                              | —                                                                           |
| `deal_status`               | deal_status              | sim      | `'pending'`         | —                              | —                                                                           |
| `client_id`                 | UUID                     | sim      | —                   | —                              | —                                                                           |
| `product_id`                | UUID                     | sim      | —                   | FK → `products.id`             | —                                                                           |
| `sku`                       | TEXT                     | sim      | —                   | —                              | —                                                                           |
| `stock_reduced`             | BOOLEAN                  | sim      | `FALSE`             | —                              | —                                                                           |
| `enrichment_data`           | JSONB                    | sim      | `'{}'::jsonb`       | —                              | —                                                                           |
| `enrichment_status`         | TEXT                     | sim      | `'pending'`         | —                              | —                                                                           |
| `lost_to_competitor_id`     | UUID                     | sim      | —                   | FK → `competitors_registry.id` | —                                                                           |
| `competitor_price_at_deal`  | DECIMAL(12,2)            | sim      | —                   | —                              | —                                                                           |
| `territory_id`              | UUID                     | sim      | —                   | FK → `territories.id`          | —                                                                           |
| `ai_prediction_score`       | FLOAT                    | sim      | `0`                 | —                              | —                                                                           |
| `ai_prediction_reasoning`   | TEXT                     | sim      | —                   | —                              | —                                                                           |
| `whatsapp_last_interaction` | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                              | —                                                                           |
| `whatsapp_status`           | TEXT                     | sim      | `'not_connected'`   | —                              | —                                                                           |
| `sdr_id`                    | UUID                     | sim      | —                   | FK → `salespeople.id`          | ID do SDR que realizou a ativação/prospecção                                |
| `closer_id`                 | UUID                     | sim      | —                   | FK → `salespeople.id`          | ID do Closer responsável pelo fechamento e gestão                           |
| `is_first_sale`             | BOOLEAN                  | sim      | `false`             | —                              | Indica se é a primeira venda do cliente (ativação)                          |
| `unit_cost`                 | NUMERIC(12,2)            | sim      | —                   | —                              | Custo unitário snapshot no momento da venda (fonte: Promo Gifts ou manual). |
| `total_cost`                | NUMERIC(14,2)            | sim      | —                   | —                              | Custo total da venda (unit_cost * quantidade quando aplicável).             |
| `cost_source`               | TEXT                     | sim      | —                   | —                              | —                                                                           |
| `cost_synced_at`            | TIMESTAMPTZ              | sim      | —                   | —                              | —                                                                           |
| `margin_amount`             | NUMERIC(14,2)            | sim      | —                   | —                              | Coluna calculada: amount - total_cost.                                      |
| `markup_pct`                | NUMERIC(8,2)             | sim      | —                   | —                              | Coluna calculada: ((amount - total_cost) / total_cost) * 100.               |
| `stage`                     | text                     | sim      | —                   | —                              | —                                                                           |
| `segment`                   | text                     | sim      | —                   | —                              | —                                                                           |
| `notes`                     | text                     | sim      | —                   | —                              | —                                                                           |
| `loss_reason`               | text                     | sim      | —                   | —                              | —                                                                           |
| `competitor_name`           | text                     | sim      | —                   | —                              | —                                                                           |
| `closed_at`                 | timestamp with time zone | sim      | —                   | —                              | —                                                                           |

### `sales_battles`

**RLS habilitada** · 1 policies: `Admins can manage battles`

| Coluna        | Tipo                 | Nulo     | Default             | Constraints           | Comentário |
| ------------- | -------------------- | -------- | ------------------- | --------------------- | ---------- |
| `id`          | UUID                 | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `title`       | TEXT                 | NOT NULL | —                   | —                     | —          |
| `battle_type` | TEXT                 | NOT NULL | `'1v1'`             | —                     | —          |
| `team`        | metric TEXT          | NOT NULL | `'calls'`           | —                     | —          |
| `deals`       | target_value INTEGER | sim      | `0`                 | —                     | —          |
| `starts_at`   | TIMESTAMPTZ          | NOT NULL | `now()`             | —                     | —          |
| `ends_at`     | TIMESTAMPTZ          | NOT NULL | —                   | —                     | —          |
| `status`      | TEXT                 | NOT NULL | `'active'`          | —                     | —          |
| `cancelled`   | winner_id UUID       | sim      | —                   | FK → `salespeople.id` | —          |
| `xp_reward`   | INTEGER              | NOT NULL | `100`               | —                     | —          |
| `created_by`  | UUID                 | sim      | —                   | FK → `salespeople.id` | —          |
| `created_at`  | TIMESTAMPTZ          | NOT NULL | `now()`             | —                     | —          |

### `sales_enablement_assets`

**RLS habilitada** · 2 policies: `Authenticated users can view active assets`, `Managers can manage assets`

| Coluna          | Tipo        | Nulo     | Default             | Constraints | Comentário |
| --------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`            | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `title`         | text        | NOT NULL | —                   | —           | —          |
| `description`   | text        | sim      | —                   | —           | —          |
| `category`      | text        | NOT NULL | `'general'`         | —           | —          |
| `asset_type`    | text        | NOT NULL | `'document'`        | —           | —          |
| `file_url`      | text        | sim      | —                   | —           | —          |
| `thumbnail_url` | text        | sim      | —                   | —           | —          |
| `tags`          | text[]      | sim      | `ARRAY[]::text[]`   | —           | —          |
| `funnel_stage`  | text        | sim      | —                   | —           | —          |
| `is_active`     | boolean     | NOT NULL | `true`              | —           | —          |
| `view_count`    | integer     | NOT NULL | `0`                 | —           | —          |
| `created_by`    | uuid        | sim      | —                   | —           | —          |
| `created_at`    | timestamptz | NOT NULL | `now()`             | —           | —          |
| `updated_at`    | timestamptz | NOT NULL | `now()`             | —           | —          |

### `sales_goals`

**RLS habilitada** · 4 policies: `Users can read own goals or admins all`, `Admins can insert goals`, `Admins can update goals`, `Admins can delete goals`

| Coluna           | Tipo          | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ------------- | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID          | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id` | UUID          | sim      | —                   | FK → `salespeople.id` | —          |
| `month`          | TEXT          | NOT NULL | —                   | —                     | —          |
| `goal_amount`    | NUMERIC(12,2) | NOT NULL | `0`                 | —                     | —          |
| `created_at`     | TIMESTAMPTZ   | NOT NULL | `now()`             | —                     | —          |

### `sales_streaks`

**RLS habilitada** · 3 policies: `Anyone can read streaks`, `Insert own streak`, `Admins can update sales_streaks`

| Coluna           | Tipo         | Nulo     | Default             | Constraints                    | Comentário |
| ---------------- | ------------ | -------- | ------------------- | ------------------------------ | ---------- |
| `id`             | UUID         | NOT NULL | `gen_random_uuid()` | PK                             | —          |
| `salesperson_id` | UUID         | NOT NULL | —                   | UNIQUE · FK → `salespeople.id` | —          |
| `current_streak` | INTEGER      | NOT NULL | `0`                 | —                              | —          |
| `longest_streak` | INTEGER      | NOT NULL | `0`                 | —                              | —          |
| `last_sale_date` | DATE         | sim      | —                   | —                              | —          |
| `xp_multiplier`  | NUMERIC(3,1) | NOT NULL | `1.0`               | —                              | —          |
| `updated_at`     | TIMESTAMPTZ  | NOT NULL | `now()`             | —                              | —          |

### `sales_territories`

**RLS habilitada** · 3 policies: `Auth users can read territories`, `Admins can insert territories`, `Admins can update territories`

| Coluna             | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ------------------ | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`               | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `territory_name`   | TEXT        | NOT NULL | —                   | —                     | —          |
| `territory_type`   | TEXT        | NOT NULL | `'segment'`         | —                     | —          |
| `current_owner_id` | UUID        | sim      | —                   | FK → `salespeople.id` | —          |
| `total_revenue`    | NUMERIC     | NOT NULL | `0`                 | —                     | —          |
| `total_deals`      | INTEGER     | NOT NULL | `0`                 | —                     | —          |
| `conquered_at`     | TIMESTAMPTZ | sim      | —                   | —                     | —          |
| `is_contested`     | BOOLEAN     | NOT NULL | `false`             | —                     | —          |
| `created_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `updated_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |

### `salespeople`

**RLS habilitada** · 3 policies: `Users can delete own salesperson record`, `Admins can insert salespeople`, `Admin can update any salesperson`

| Coluna                | Tipo                     | Nulo     | Default             | Constraints      | Comentário |
| --------------------- | ------------------------ | -------- | ------------------- | ---------------- | ---------- |
| `id`                  | UUID                     | NOT NULL | `gen_random_uuid()` | PK               | —          |
| `name`                | TEXT                     | NOT NULL | —                   | —                | —          |
| `email`               | TEXT                     | sim      | —                   | UNIQUE           | —          |
| `avatar_url`          | TEXT                     | sim      | —                   | —                | —          |
| `commission_rate`     | DECIMAL(5,2)             | NOT NULL | `10.00`             | —                | —          |
| `is_active`           | BOOLEAN                  | NOT NULL | `true`              | —                | —          |
| `created_at`          | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                | —          |
| `updated_at`          | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                | —          |
| `role`                | salesperson_role         | NOT NULL | `'hybrid'`          | —                | —          |
| `auth_user_id`        | UUID                     | sim      | —                   | UNIQUE           | —          |
| `score_total`         | numeric                  | NOT NULL | `0`                 | —                | —          |
| `squad_id`            | UUID                     | sim      | —                   | FK → `squads.id` | —          |
| `notify_sales_in_app` | BOOLEAN                  | sim      | `true`              | —                | —          |
| `notify_sales_email`  | BOOLEAN                  | sim      | `false`             | —                | —          |

### `salesperson_badges`

**RLS habilitada** · 3 policies: `Authenticated can view earned badges`, `Users can update own badges`, `System can insert badges`

| Coluna           | Tipo        | Nulo     | Default             | Constraints                  | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ---------------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                           | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id`        | —          |
| `badge_id`       | UUID        | NOT NULL | —                   | FK → `collectible_badges.id` | —          |
| `earned_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                            | —          |
| `is_showcase`    | BOOLEAN     | NOT NULL | `false`             | —                            | —          |

### `salesperson_coaching_aggregates`

**RLS habilitada** · 2 policies: `sca_read_authenticated`, `sca_write_admin_manager`

| Coluna               | Tipo        | Nulo     | Default             | Constraints | Comentário |
| -------------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`                 | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `salesperson_id`     | uuid        | NOT NULL | —                   | UNIQUE      | —          |
| `period_start`       | date        | NOT NULL | —                   | —           | —          |
| `period_end`         | date        | NOT NULL | —                   | —           | —          |
| `calls_analyzed`     | int         | NOT NULL | `0`                 | —           | —          |
| `avg_overall`        | numeric     | NOT NULL | `0`                 | —           | —          |
| `avg_talk`           | numeric     | NOT NULL | `0`                 | —           | —          |
| `avg_questions`      | numeric     | NOT NULL | `0`                 | —           | —          |
| `avg_objections`     | numeric     | NOT NULL | `0`                 | —           | —          |
| `avg_sentiment`      | numeric     | NOT NULL | `0`                 | —           | —          |
| `trend_direction`    | text        | NOT NULL | `'flat'`            | —           | —          |
| `trend_delta`        | numeric     | NOT NULL | `0`                 | —           | —          |
| `top_recurring_gap`  | text        | sim      | —                   | —           | —          |
| `last_calculated_at` | timestamptz | NOT NULL | `now()`             | —           | —          |

### `salesperson_commission_configs`

**RLS habilitada** · 2 policies: `Admins can manage commission configs`, `Salespeople can view their own commission config`

| Coluna           | Tipo                     | Nulo     | Default | Constraints                | Comentário |
| ---------------- | ------------------------ | -------- | ------- | -------------------------- | ---------- |
| `salesperson_id` | UUID                     | NOT NULL | —       | PK · FK → `salespeople.id` | —          |
| `month`          | DATE                     | NOT NULL | —       | PK                         | —          |
| `rate`           | NUMERIC                  | NOT NULL | —       | —                          | —          |
| `created_at`     | TIMESTAMP WITH TIME ZONE | sim      | `now()` | —                          | —          |
| `updated_at`     | TIMESTAMP WITH TIME ZONE | sim      | `now()` | —                          | —          |

### `salesperson_custom_field_values`

**RLS habilitada** · 2 policies: `Admins can manage field values`, `Own or admin can view field values`

| Coluna           | Tipo        | Nulo     | Default             | Constraints                  | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ---------------------------- | ---------- |
| `id`             | uuid        | NOT NULL | `gen_random_uuid()` | PK                           | —          |
| `salesperson_id` | uuid        | NOT NULL | —                   | FK → `salespeople.id`        | —          |
| `field_id`       | uuid        | NOT NULL | —                   | FK → `team_custom_fields.id` | —          |
| `numeric_value`  | numeric     | sim      | `0`                 | —                            | —          |
| `text_value`     | text        | sim      | —                   | —                            | —          |
| `boolean_value`  | boolean     | sim      | `false`             | —                            | —          |
| `updated_at`     | timestamptz | NOT NULL | `now()`             | —                            | —          |

### `salesperson_leagues`

**RLS habilitada** · 2 policies: `Anyone can read leagues`, `System can manage leagues`

| Coluna           | Tipo         | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID         | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id` | UUID         | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `league`         | sales_league | NOT NULL | `'bronze'`          | —                     | —          |
| `season_number`  | INTEGER      | NOT NULL | `1`                 | —                     | —          |
| `promoted_at`    | TIMESTAMPTZ  | sim      | —                   | —                     | —          |
| `demoted_at`     | TIMESTAMPTZ  | sim      | —                   | —                     | —          |
| `points`         | INTEGER      | NOT NULL | `0`                 | —                     | —          |
| `created_at`     | TIMESTAMPTZ  | NOT NULL | `now()`             | —                     | —          |
| `updated_at`     | TIMESTAMPTZ  | NOT NULL | `now()`             | —                     | —          |

### `salesperson_performance_telemetry`

**RLS habilitada** · 1 policies: `Own telemetry or admin can read`

| Coluna           | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ---------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`             | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `salesperson_id` | UUID                     | NOT NULL | —                   | —           | —          |
| `metric_type`    | TEXT                     | sim      | —                   | —           | —          |
| `captured_at`    | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —          |

### `salesperson_preferences`

**RLS habilitada** · 3 policies: `Users can read own preferences`, `Users can insert own preferences`, `Users can update own preferences`

| Coluna                | Tipo                     | Nulo     | Default                  | Constraints                    | Comentário                                                |
| --------------------- | ------------------------ | -------- | ------------------------ | ------------------------------ | --------------------------------------------------------- |
| `id`                  | UUID                     | NOT NULL | `gen_random_uuid()`      | PK                             | —                                                         |
| `salesperson_id`      | UUID                     | NOT NULL | —                        | UNIQUE · FK → `salespeople.id` | —                                                         |
| `ai_assistant_name`   | TEXT                     | NOT NULL | `'Coach`                 | —                              | —                                                         |
| `ai_assistant_avatar` | TEXT                     | sim      | —                        | —                              | —                                                         |
| `created_at`          | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`                  | —                              | —                                                         |
| `updated_at`          | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`                  | —                              | —                                                         |
| `response_mode`       | TEXT                     | NOT NULL | `'text'`                 | —                              | How the AI should respond: text only, audio only, or both |
| `voice_id`            | TEXT                     | sim      | `'CwhRBWXzGAHq8TQ4Fs17'` | —                              | ElevenLabs voice ID for TTS                               |
| `voice_name`          | TEXT                     | sim      | `'Roger'`                | —                              | Human-readable name of the selected voice                 |
| `contact_rules`       | JSONB                    | sim      | `'{`                     | —                              | —                                                         |

### `salesperson_xp`

**RLS habilitada** · 4 policies: `Authenticated users can read salesperson_xp`, `Users can insert own salesperson_xp`, `Admins can update salesperson_xp`, `Authenticated users can view XP`

| Coluna             | Tipo                     | Nulo     | Default             | Constraints                    | Comentário |
| ------------------ | ------------------------ | -------- | ------------------- | ------------------------------ | ---------- |
| `id`               | UUID                     | NOT NULL | `gen_random_uuid()` | PK                             | —          |
| `salesperson_id`   | UUID                     | NOT NULL | —                   | UNIQUE · FK → `salespeople.id` | —          |
| `total_xp`         | INTEGER                  | NOT NULL | `0`                 | —                              | —          |
| `current_level`    | INTEGER                  | NOT NULL | `1`                 | —                              | —          |
| `xp_to_next_level` | INTEGER                  | NOT NULL | `100`               | —                              | —          |
| `created_at`       | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                              | —          |
| `updated_at`       | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                              | —          |

### `saved_filters`

> Filtros salvos por usuários para diferentes entidades

**RLS habilitada** · 9 policies: `Users can view own filters`, `Users can insert own filters`, `Users can update own filters`, `Users can delete own filters`, `Users manage own filters`, `Users can view their own saved filters`, `Users can create their own saved filters`, `Users can update their own saved filters`…

| Coluna        | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`          | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `user_id`     | UUID                     | NOT NULL | —                   | —           | —          |
| `entity_type` | TEXT                     | NOT NULL | —                   | —           | —          |
| `name`        | TEXT                     | NOT NULL | —                   | —           | —          |
| `filters`     | JSONB                    | NOT NULL | `'{}'`              | —           | —          |
| `is_default`  | BOOLEAN                  | NOT NULL | `false`             | —           | —          |
| `created_at`  | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |
| `updated_at`  | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |

### `scheduled_report_runs`

**RLS habilitada** · 1 policies: `owner or manager can view scheduled_report_runs`

| Coluna          | Tipo        | Nulo     | Default             | Constraints                 | Comentário |
| --------------- | ----------- | -------- | ------------------- | --------------------------- | ---------- |
| `id`            | UUID        | NOT NULL | `gen_random_uuid()` | PK                          | —          |
| `schedule_id`   | UUID        | NOT NULL | —                   | FK → `scheduled_reports.id` | —          |
| `started_at`    | TIMESTAMPTZ | NOT NULL | `now()`             | —                           | —          |
| `finished_at`   | TIMESTAMPTZ | sim      | —                   | —                           | —          |
| `status`        | TEXT        | NOT NULL | `'running'`         | —                           | —          |
| `rows_count`    | INTEGER     | sim      | —                   | —                           | —          |
| `file_path`     | TEXT        | sim      | —                   | —                           | —          |
| `error_message` | TEXT        | sim      | —                   | —                           | —          |

### `scheduled_reports`

**RLS habilitada** · 4 policies: `owner or manager can view scheduled_reports`, `owner can insert scheduled_reports`, `owner or manager can update scheduled_reports`, `owner or manager can delete scheduled_reports`

| Coluna         | Tipo        | Nulo     | Default             | Constraints              | Comentário |
| -------------- | ----------- | -------- | ------------------- | ------------------------ | ---------- |
| `id`           | UUID        | NOT NULL | `gen_random_uuid()` | PK                       | —          |
| `created_by`   | UUID        | NOT NULL | `auth.uid()`        | —                        | —          |
| `report_id`    | UUID        | NOT NULL | —                   | FK → `custom_reports.id` | —          |
| `name`         | TEXT        | NOT NULL | —                   | —                        | —          |
| `frequency`    | TEXT        | NOT NULL | `'daily'`           | —                        | —          |
| `hour_of_day`  | INTEGER     | NOT NULL | `8`                 | —                        | —          |
| `day_of_week`  | INTEGER     | sim      | —                   | —                        | —          |
| `day_of_month` | INTEGER     | sim      | —                   | —                        | —          |
| `recipients`   | TEXT[]      | NOT NULL | `'{}'`              | —                        | —          |
| `format`       | TEXT        | NOT NULL | `'csv'`             | —                        | —          |
| `enabled`      | BOOLEAN     | NOT NULL | `true`              | —                        | —          |
| `last_run_at`  | TIMESTAMPTZ | sim      | —                   | —                        | —          |
| `next_run_at`  | TIMESTAMPTZ | sim      | —                   | —                        | —          |
| `created_at`   | TIMESTAMPTZ | NOT NULL | `now()`             | —                        | —          |
| `updated_at`   | TIMESTAMPTZ | NOT NULL | `now()`             | —                        | —          |

### `scheduled_sends`

**RLS habilitada** · 3 policies: `owners read own scheduled_sends`, `owners insert scheduled_sends`, `owners update own scheduled_sends`

| Coluna                | Tipo        | Nulo     | Default             | Constraints     | Comentário |
| --------------------- | ----------- | -------- | ------------------- | --------------- | ---------- |
| `id`                  | uuid        | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `owner_id`            | uuid        | NOT NULL | —                   | —               | —          |
| `sale_id`             | uuid        | NOT NULL | —                   | FK → `sales.id` | —          |
| `channel`             | text        | NOT NULL | —                   | —               | —          |
| `payload`             | jsonb       | NOT NULL | `'{}'::jsonb`       | —               | —          |
| `scheduled_for`       | timestamptz | NOT NULL | —                   | —               | —          |
| `status`              | text        | NOT NULL | `'pending'`         | —               | —          |
| `optimization_source` | text        | NOT NULL | `'manual'`          | —               | —          |
| `sent_at`             | timestamptz | sim      | —                   | —               | —          |
| `error`               | text        | sim      | —                   | —               | —          |
| `created_at`          | timestamptz | NOT NULL | `now()`             | —               | —          |

### `sdr_alert_configs`

**RLS habilitada** · 1 policies: `Users can manage their own alert configs`

| Coluna        | Tipo                     | Nulo     | Default             | Constraints          | Comentário |
| ------------- | ------------------------ | -------- | ------------------- | -------------------- | ---------- |
| `id`          | UUID                     | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `user_id`     | UUID                     | NOT NULL | —                   | FK → `auth.users.id` | —          |
| `metric_type` | TEXT                     | NOT NULL | —                   | —                    | —          |
| `is_active`   | BOOLEAN                  | sim      | `true`              | —                    | —          |
| `created_at`  | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                    | —          |
| `updated_at`  | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                    | —          |

### `sdr_alert_history`

**RLS habilitada** · 0 policies

| Coluna           | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ---------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`             | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `created_at`     | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —          |
| `triggered_by`   | TEXT                     | NOT NULL | —                   | —           | —          |
| `alert_type`     | TEXT                     | sim      | `'performance'`     | —           | —          |
| `sdrs_notified`  | INTEGER                  | sim      | `0`                 | —           | —          |
| `threshold_used` | DECIMAL                  | sim      | —                   | —           | —          |
| `actual_value`   | DECIMAL                  | sim      | —                   | —           | —          |
| `sdr_details`    | JSONB                    | sim      | —                   | —           | —          |
| `admin_emails`   | TEXT[]                   | sim      | —                   | —           | —          |

### `sdr_performance_settings`

**RLS habilitada** · 1 policies: `Users can manage their own performance settings`

| Coluna                      | Tipo                     | Nulo     | Default             | Constraints          | Comentário |
| --------------------------- | ------------------------ | -------- | ------------------- | -------------------- | ---------- |
| `id`                        | UUID                     | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `user_id`                   | UUID                     | sim      | —                   | FK → `auth.users.id` | —          |
| `rejection_rate_threshold`  | DECIMAL                  | sim      | `30`                | —                    | —          |
| `outcome_mix_alert_enabled` | BOOLEAN                  | sim      | `true`              | —                    | —          |
| `created_at`                | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                    | —          |
| `updated_at`                | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                    | —          |

### `security_alert_settings`

**RLS habilitada** · 3 policies: `Admins can view security settings`, `Admins can update security settings`, `Admins can insert security settings`

| Coluna              | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ------------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`                | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `spike_threshold`   | INTEGER                  | NOT NULL | `5`                 | —           | —          |
| `time_window_hours` | INTEGER                  | NOT NULL | `1`                 | —           | —          |
| `cooldown_hours`    | INTEGER                  | NOT NULL | `24`                | —           | —          |
| `created_at`        | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |
| `updated_at`        | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |

### `security_events`

**RLS não declarado nas migrations** · 0 policies

| Coluna        | Tipo                     | Nulo     | Default              | Constraints          | Comentário |
| ------------- | ------------------------ | -------- | -------------------- | -------------------- | ---------- |
| `id`          | UUID                     | NOT NULL | `uuid_generate_v4()` | PK                   | —          |
| `event_type`  | TEXT                     | NOT NULL | —                    | —                    | —          |
| `user_id`     | UUID                     | sim      | —                    | FK → `auth.users.id` | —          |
| `severity`    | TEXT                     | NOT NULL | —                    | —                    | —          |
| `description` | TEXT                     | NOT NULL | —                    | —                    | —          |
| `metadata`    | JSONB                    | sim      | —                    | —                    | —          |
| `ip_address`  | INET                     | sim      | —                    | —                    | —          |
| `created_at`  | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —                    | —          |
| `user_agent`  | TEXT                     | sim      | —                    | —                    | —          |

### `semantic_index`

**RLS habilitada** · 1 policies: `semantic_index_select_own_or_admin`

| Coluna              | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`                | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `entity_type`       | TEXT        | NOT NULL | —                   | UNIQUE      | —          |
| `entity_id`         | UUID        | NOT NULL | —                   | UNIQUE      | —          |
| `salesperson_id`    | UUID        | sim      | —                   | —           | —          |
| `content`           | TEXT        | NOT NULL | —                   | —           | —          |
| `embedding`         | vector(768) | sim      | —                   | —           | —          |
| `metadata`          | JSONB       | NOT NULL | `'{}'::jsonb`       | —           | —          |
| `updated_at`        | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `source_updated_at` | timestamptz | sim      | —                   | —           | —          |
| `content_hash`      | text        | sim      | —                   | —           | —          |

### `send_time_profiles`

**RLS habilitada** · 1 policies: `owners and managers read send_time_profiles`

| Coluna               | Tipo        | Nulo     | Default               | Constraints              | Comentário |
| -------------------- | ----------- | -------- | --------------------- | ------------------------ | ---------- |
| `id`                 | uuid        | NOT NULL | `gen_random_uuid()`   | PK                       | —          |
| `sale_id`            | uuid        | NOT NULL | —                     | UNIQUE · FK → `sales.id` | —          |
| `best_hour`          | integer     | NOT NULL | `10`                  | —                        | —          |
| `best_dow`           | integer     | NOT NULL | `2`                   | —                        | —          |
| `confidence`         | numeric     | NOT NULL | `0`                   | —                        | —          |
| `sample_size`        | integer     | NOT NULL | `0`                   | —                        | —          |
| `tz`                 | text        | NOT NULL | `'America/Sao_Paulo'` | —                        | —          |
| `hour_distribution`  | jsonb       | NOT NULL | `'[]'::jsonb`         | —                        | —          |
| `dow_distribution`   | jsonb       | NOT NULL | `'[]'::jsonb`         | —                        | —          |
| `last_calculated_at` | timestamptz | NOT NULL | `now()`               | —                        | —          |
| `created_at`         | timestamptz | NOT NULL | `now()`               | —                        | —          |

### `sequence_enrollments`

**RLS habilitada** · 4 policies: `View enrollments of accessible sequences`, `Insert enrollments to own sequences`, `Update enrollments of own sequences`, `Delete enrollments of own sequences`

| Coluna              | Tipo        | Nulo     | Default             | Constraints                  | Comentário |
| ------------------- | ----------- | -------- | ------------------- | ---------------------------- | ---------- |
| `id`                | UUID        | NOT NULL | `gen_random_uuid()` | PK                           | —          |
| `sequence_id`       | UUID        | NOT NULL | —                   | UNIQUE · FK → `sequences.id` | —          |
| `contact_id`        | UUID        | NOT NULL | —                   | UNIQUE                       | —          |
| `contact_type`      | TEXT        | NOT NULL | —                   | UNIQUE                       | —          |
| `enrolled_by`       | UUID        | sim      | —                   | —                            | —          |
| `status`            | TEXT        | NOT NULL | `'active'`          | —                            | —          |
| `current_step`      | INTEGER     | NOT NULL | `0`                 | —                            | —          |
| `next_action_at`    | TIMESTAMPTZ | sim      | —                   | —                            | —          |
| `started_at`        | TIMESTAMPTZ | NOT NULL | `now()`             | —                            | —          |
| `last_executed_at`  | TIMESTAMPTZ | sim      | —                   | —                            | —          |
| `completed_at`      | TIMESTAMPTZ | sim      | —                   | —                            | —          |
| `exit_reason`       | TEXT        | sim      | —                   | —                            | —          |
| `metadata`          | JSONB       | NOT NULL | `'{}'::jsonb`       | —                            | —          |
| `created_at`        | TIMESTAMPTZ | NOT NULL | `now()`             | —                            | —          |
| `updated_at`        | TIMESTAMPTZ | NOT NULL | `now()`             | —                            | —          |
| `optimized_for_at`  | timestamptz | sim      | —                   | —                            | —          |
| `auto_paused_at`    | timestamptz | sim      | —                   | —                            | —          |
| `auto_pause_reason` | text        | sim      | —                   | —                            | —          |

### `sequence_step_assignments`

**RLS habilitada** · 2 policies: `view assignments via sequence owner`, `insert assignments via sequence owner`

| Coluna          | Tipo        | Nulo     | Default             | Constraints                             | Comentário |
| --------------- | ----------- | -------- | ------------------- | --------------------------------------- | ---------- |
| `id`            | uuid        | NOT NULL | `gen_random_uuid()` | PK                                      | —          |
| `enrollment_id` | uuid        | NOT NULL | —                   | UNIQUE · FK → `sequence_enrollments.id` | —          |
| `step_id`       | uuid        | NOT NULL | —                   | UNIQUE · FK → `sequence_steps.id`       | —          |
| `variant_id`    | uuid        | sim      | —                   | FK → `sequence_step_variants.id`        | —          |
| `variant_label` | text        | sim      | —                   | —                                       | —          |
| `assigned_at`   | timestamptz | NOT NULL | `now()`             | —                                       | —          |

### `sequence_step_executions`

**RLS habilitada** · 1 policies: `View executions of accessible sequences`

| Coluna          | Tipo        | Nulo     | Default             | Constraints                      | Comentário |
| --------------- | ----------- | -------- | ------------------- | -------------------------------- | ---------- |
| `id`            | UUID        | NOT NULL | `gen_random_uuid()` | PK                               | —          |
| `enrollment_id` | UUID        | NOT NULL | —                   | FK → `sequence_enrollments.id`   | —          |
| `step_id`       | UUID        | NOT NULL | —                   | FK → `sequence_steps.id`         | —          |
| `executed_at`   | TIMESTAMPTZ | NOT NULL | `now()`             | —                                | —          |
| `status`        | TEXT        | NOT NULL | —                   | —                                | —          |
| `channel`       | TEXT        | sim      | —                   | —                                | —          |
| `error_message` | TEXT        | sim      | —                   | —                                | —          |
| `engagement`    | JSONB       | NOT NULL | `'{}'::jsonb`       | —                                | —          |
| `created_at`    | TIMESTAMPTZ | NOT NULL | `now()`             | —                                | —          |
| `variant_id`    | uuid        | sim      | —                   | FK → `sequence_step_variants.id` | —          |
| `replied_at`    | timestamptz | sim      | —                   | —                                | —          |

### `sequence_step_variants`

**RLS habilitada** · 4 policies: `view variants`, `insert variants`, `update variants`, `delete variants`

| Coluna           | Tipo        | Nulo     | Default             | Constraints                       | Comentário |
| ---------------- | ----------- | -------- | ------------------- | --------------------------------- | ---------- |
| `id`             | uuid        | NOT NULL | `gen_random_uuid()` | PK                                | —          |
| `step_id`        | uuid        | NOT NULL | —                   | UNIQUE · FK → `sequence_steps.id` | —          |
| `label`          | text        | NOT NULL | —                   | UNIQUE                            | —          |
| `subject`        | text        | sim      | —                   | —                                 | —          |
| `body`           | text        | sim      | —                   | —                                 | —          |
| `traffic_weight` | integer     | NOT NULL | `50`                | —                                 | —          |
| `created_at`     | timestamptz | NOT NULL | `now()`             | —                                 | —          |

### `sequence_steps`

**RLS habilitada** · 2 policies: `View steps of accessible sequences`, `Manage steps of own sequences`

| Coluna                 | Tipo        | Nulo     | Default             | Constraints                  | Comentário |
| ---------------------- | ----------- | -------- | ------------------- | ---------------------------- | ---------- |
| `id`                   | UUID        | NOT NULL | `gen_random_uuid()` | PK                           | —          |
| `sequence_id`          | UUID        | NOT NULL | —                   | UNIQUE · FK → `sequences.id` | —          |
| `step_order`           | INTEGER     | NOT NULL | —                   | UNIQUE                       | —          |
| `channel`              | TEXT        | NOT NULL | —                   | —                            | —          |
| `delay_days`           | INTEGER     | NOT NULL | `0`                 | —                            | —          |
| `delay_hours`          | INTEGER     | NOT NULL | `0`                 | —                            | —          |
| `template_id`          | UUID        | sim      | —                   | —                            | —          |
| `subject`              | TEXT        | sim      | —                   | —                            | —          |
| `body`                 | TEXT        | sim      | —                   | —                            | —          |
| `conditions`           | JSONB       | NOT NULL | `'{}'::jsonb`       | —                            | —          |
| `created_at`           | TIMESTAMPTZ | NOT NULL | `now()`             | —                            | —          |
| `whatsapp_template_id` | text        | sim      | —                   | —                            | —          |

### `sequences`

**RLS habilitada** · 4 policies: `Owners view their sequences`, `Authenticated users create sequences`, `Owners update their sequences`, `Owners delete their sequences`

| Coluna                   | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------------ | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`                     | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `owner_id`               | UUID        | NOT NULL | —                   | —           | —          |
| `name`                   | TEXT        | NOT NULL | —                   | —           | —          |
| `description`            | TEXT        | sim      | —                   | —           | —          |
| `channel_mix`            | TEXT[]      | NOT NULL | `ARRAY[]::TEXT[]`   | —           | —          |
| `enabled`                | BOOLEAN     | NOT NULL | `true`              | —           | —          |
| `exit_on_reply`          | BOOLEAN     | NOT NULL | `true`              | —           | —          |
| `exit_on_meeting`        | BOOLEAN     | NOT NULL | `true`              | —           | —          |
| `created_at`             | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `updated_at`             | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `send_time_optimization` | boolean     | NOT NULL | `true`              | —           | —          |
| `auto_pause_on_reply`    | boolean     | NOT NULL | `true`              | —           | —          |
| `auto_pause_on_bounce`   | boolean     | NOT NULL | `true`              | —           | —          |

### `session_activity`

**RLS habilitada** · 1 policies: `Users can view own session activity`

| Coluna       | Tipo                     | Nulo     | Default              | Constraints          | Comentário |
| ------------ | ------------------------ | -------- | -------------------- | -------------------- | ---------- |
| `id`         | UUID                     | NOT NULL | `uuid_generate_v4()` | PK                   | —          |
| `user_id`    | UUID                     | NOT NULL | —                    | FK → `auth.users.id` | —          |
| `action`     | TEXT                     | NOT NULL | —                    | —                    | —          |
| `ip_address` | INET                     | sim      | —                    | —                    | —          |
| `user_agent` | TEXT                     | sim      | —                    | —                    | —          |
| `metadata`   | JSONB                    | sim      | —                    | —                    | —          |
| `created_at` | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —                    | —          |

### `skill_assessments`

**RLS habilitada** · 4 policies: `Authenticated read skill_assessments`, `Admin/manager insert skill_assessments`, `Admin/manager update skill_assessments`, `Admin/manager delete skill_assessments`

| Coluna             | Tipo        | Nulo     | Default             | Constraints                    | Comentário |
| ------------------ | ----------- | -------- | ------------------- | ------------------------------ | ---------- |
| `id`               | UUID        | NOT NULL | `gen_random_uuid()` | PK                             | —          |
| `salesperson_id`   | UUID        | NOT NULL | —                   | UNIQUE · FK → `salespeople.id` | —          |
| `skill`            | TEXT        | NOT NULL | —                   | UNIQUE                         | —          |
| `current_level`    | TEXT        | NOT NULL | `'beginner'`        | —                              | —          |
| `score`            | NUMERIC     | NOT NULL | `0`                 | —                              | —          |
| `trend`            | TEXT        | NOT NULL | `'stable'`          | —                              | —          |
| `gap_count_30d`    | INT         | NOT NULL | `0`                 | —                              | —          |
| `gap_count_90d`    | INT         | NOT NULL | `0`                 | —                              | —          |
| `last_assessed_at` | TIMESTAMPTZ | NOT NULL | `now()`             | —                              | —          |
| `factors`          | JSONB       | NOT NULL | `'{}'::jsonb`       | —                              | —          |
| `created_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —                              | —          |
| `updated_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —                              | —          |

### `skill_development_tracks`

**RLS habilitada** · 4 policies: `Authenticated read skill_tracks`, `Admin/manager insert skill_tracks`, `Admin/manager update skill_tracks`, `Admin/manager delete skill_tracks`

| Coluna            | Tipo        | Nulo     | Default             | Constraints                    | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ------------------------------ | ---------- |
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK                             | —          |
| `salesperson_id`  | UUID        | NOT NULL | —                   | UNIQUE · FK → `salespeople.id` | —          |
| `skill`           | TEXT        | NOT NULL | —                   | UNIQUE                         | —          |
| `priority`        | INT         | NOT NULL | `1`                 | —                              | —          |
| `current_level`   | TEXT        | NOT NULL | `'beginner'`        | —                              | —          |
| `target_level`    | TEXT        | NOT NULL | `'intermediate'`    | —                              | —          |
| `milestones`      | JSONB       | NOT NULL | `'[]'::jsonb`       | —                              | —          |
| `estimated_weeks` | INT         | NOT NULL | `4`                 | —                              | —          |
| `ai_plan`         | TEXT        | sim      | —                   | —                              | —          |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                              | —          |
| `updated_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                              | —          |

### `sla_policies`

**RLS habilitada** · 2 policies: `Authenticated can view SLA policies`, `Admin/manager can manage SLA policies`

| Coluna          | Tipo        | Nulo     | Default             | Constraints | Comentário |
| --------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`            | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `stage`         | TEXT        | NOT NULL | —                   | UNIQUE      | —          |
| `max_hours`     | INTEGER     | NOT NULL | `72`                | —           | —          |
| `warning_hours` | INTEGER     | NOT NULL | `48`                | —           | —          |
| `is_active`     | BOOLEAN     | NOT NULL | `true`              | —           | —          |
| `description`   | TEXT        | sim      | —                   | —           | —          |
| `created_by`    | UUID        | sim      | —                   | —           | —          |
| `created_at`    | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `updated_at`    | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `sla_violations`

**RLS habilitada** · 2 policies: `Salespeople view own violations`, `Admin/manager manage violations`

| Coluna           | Tipo          | Nulo     | Default             | Constraints            | Comentário |
| ---------------- | ------------- | -------- | ------------------- | ---------------------- | ---------- |
| `id`             | UUID          | NOT NULL | `gen_random_uuid()` | PK                     | —          |
| `sale_id`        | UUID          | NOT NULL | —                   | FK → `sales.id`        | —          |
| `policy_id`      | UUID          | sim      | —                   | FK → `sla_policies.id` | —          |
| `stage`          | TEXT          | NOT NULL | —                   | —                      | —          |
| `hours_in_stage` | NUMERIC(10,2) | NOT NULL | `0`                 | —                      | —          |
| `status`         | TEXT          | NOT NULL | `'warning'`         | —                      | —          |
| `detected_at`    | TIMESTAMPTZ   | NOT NULL | `now()`             | —                      | —          |
| `resolved_at`    | TIMESTAMPTZ   | sim      | —                   | —                      | —          |
| `metadata`       | JSONB         | sim      | `'{}'::jsonb`       | —                      | —          |
| `created_at`     | TIMESTAMPTZ   | NOT NULL | `now()`             | —                      | —          |
| `updated_at`     | TIMESTAMPTZ   | NOT NULL | `now()`             | —                      | —          |

### `slow_query_alerts`

> G6: consultas SQL detectadas como lentas. Dedupe por query_hash enquanto não reconhecidas.

**RLS habilitada** · 2 policies: `Admins view slow query alerts`, `Admins ack slow query alerts`

| Coluna                | Tipo             | Nulo     | Default             | Constraints          | Comentário |
| --------------------- | ---------------- | -------- | ------------------- | -------------------- | ---------- |
| `id`                  | uuid             | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `query_hash`          | text             | NOT NULL | —                   | —                    | —          |
| `query_preview`       | text             | NOT NULL | —                   | —                    | —          |
| `mean_exec_ms`        | double precision | NOT NULL | —                   | —                    | —          |
| `max_exec_ms`         | double precision | NOT NULL | —                   | —                    | —          |
| `calls`               | bigint           | NOT NULL | —                   | —                    | —          |
| `total_exec_ms`       | double precision | NOT NULL | —                   | —                    | —          |
| `threshold_mean_ms`   | double precision | NOT NULL | —                   | —                    | —          |
| `threshold_min_calls` | bigint           | NOT NULL | —                   | —                    | —          |
| `first_detected_at`   | timestamptz      | NOT NULL | `now()`             | —                    | —          |
| `last_detected_at`    | timestamptz      | NOT NULL | `now()`             | —                    | —          |
| `detection_count`     | integer          | NOT NULL | `1`                 | —                    | —          |
| `acknowledged_at`     | timestamptz      | sim      | —                   | —                    | —          |
| `acknowledged_by`     | uuid             | sim      | —                   | FK → `auth.users.id` | —          |
| `created_at`          | timestamptz      | NOT NULL | `now()`             | —                    | —          |

### `sms_verification_codes`

**RLS habilitada** · 11 policies: `Deny direct SELECT - use RPCs`, `Deny direct INSERT - use RPCs`, `Deny select on sms_verification_codes`, `Deny insert on sms_verification_codes`, `Deny update on sms_verification_codes`, `Deny delete on sms_verification_codes`, `Deny anon select on sms_verification_codes`, `Deny anon insert on sms_verification_codes`…

| Coluna         | Tipo        | Nulo     | Default             | Constraints          | Comentário |
| -------------- | ----------- | -------- | ------------------- | -------------------- | ---------- |
| `id`           | UUID        | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `user_id`      | UUID        | NOT NULL | —                   | FK → `auth.users.id` | —          |
| `phone_number` | TEXT        | NOT NULL | —                   | —                    | —          |
| `code`         | TEXT        | NOT NULL | —                   | —                    | —          |
| `expires_at`   | TIMESTAMPTZ | NOT NULL | —                   | —                    | —          |
| `used_at`      | TIMESTAMPTZ | sim      | —                   | —                    | —          |
| `created_at`   | TIMESTAMPTZ | sim      | `NOW()`             | —                    | —          |

### `squad_members`

**RLS habilitada** · 2 policies: `Squad members viewable by authenticated`, `Squad members admin manage`

| Coluna     | Tipo        | Nulo     | Default | Constraints           | Comentário |
| ---------- | ----------- | -------- | ------- | --------------------- | ---------- |
| `squad_id` | UUID        | NOT NULL | —       | PK · FK → `squads.id` | —          |
| `user_id`  | UUID        | NOT NULL | —       | PK                    | —          |
| `added_at` | TIMESTAMPTZ | NOT NULL | `now()` | —                     | —          |

### `squads`

**RLS habilitada** · 2 policies: `Squads viewable by authenticated`, `Squads admin manage`

| Coluna        | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`          | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `name`        | TEXT        | NOT NULL | —                   | —           | —          |
| `description` | TEXT        | sim      | —                   | —           | —          |
| `color`       | TEXT        | NOT NULL | `'#6366f1'`         | —           | —          |
| `created_by`  | UUID        | sim      | —                   | —           | —          |
| `created_at`  | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `updated_at`  | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `stage_bottleneck_insights`

**RLS habilitada** · 3 policies: `Users view own and global bottleneck insights`, `Admins manage bottleneck insights insert`, `Admins manage bottleneck insights update`

| Coluna             | Tipo         | Nulo     | Default             | Constraints | Comentário |
| ------------------ | ------------ | -------- | ------------------- | ----------- | ---------- |
| `id`               | UUID         | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `stage`            | TEXT         | NOT NULL | —                   | —           | —          |
| `owner_id`         | UUID         | sim      | —                   | —           | —          |
| `severity`         | TEXT         | NOT NULL | `'low'`             | —           | —          |
| `conversion_rate`  | NUMERIC(5,2) | NOT NULL | `0`                 | —           | —          |
| `top_loss_reasons` | JSONB        | NOT NULL | `'[]'::jsonb`       | —           | —          |
| `recommendations`  | JSONB        | NOT NULL | `'[]'::jsonb`       | —           | —          |
| `ai_summary`       | TEXT         | sim      | —                   | —           | —          |
| `calculated_at`    | TIMESTAMPTZ  | NOT NULL | `now()`             | —           | —          |
| `created_at`       | TIMESTAMPTZ  | NOT NULL | `now()`             | —           | —          |
| `updated_at`       | TIMESTAMPTZ  | NOT NULL | `now()`             | —           | —          |

### `stage_conversion_metrics`

**RLS habilitada** · 3 policies: `Users view own and global conversion metrics`, `Service role manages conversion metrics insert`, `Service role manages conversion metrics update`

| Coluna                | Tipo         | Nulo     | Default             | Constraints | Comentário |
| --------------------- | ------------ | -------- | ------------------- | ----------- | ---------- |
| `id`                  | UUID         | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `from_stage`          | TEXT         | NOT NULL | —                   | —           | —          |
| `to_stage`            | TEXT         | NOT NULL | —                   | —           | —          |
| `owner_id`            | UUID         | sim      | —                   | —           | —          |
| `entered_count`       | INT          | NOT NULL | `0`                 | —           | —          |
| `converted_count`     | INT          | NOT NULL | `0`                 | —           | —          |
| `lost_count`          | INT          | NOT NULL | `0`                 | —           | —          |
| `conversion_rate`     | NUMERIC(5,2) | NOT NULL | `0`                 | —           | —          |
| `avg_transition_days` | NUMERIC(8,2) | NOT NULL | `0`                 | —           | —          |
| `period_start`        | DATE         | NOT NULL | —                   | —           | —          |
| `period_end`          | DATE         | NOT NULL | —                   | —           | —          |
| `calculated_at`       | TIMESTAMPTZ  | NOT NULL | `now()`             | —           | —          |
| `created_at`          | TIMESTAMPTZ  | NOT NULL | `now()`             | —           | —          |
| `updated_at`          | TIMESTAMPTZ  | NOT NULL | `now()`             | —           | —          |

### `stage_inactivity_rules`

**RLS habilitada** · 2 policies: `Authenticated can read stage inactivity rules`, `Only admins can manage stage inactivity rules`

| Coluna          | Tipo        | Nulo     | Default             | Constraints | Comentário |
| --------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`            | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `stage`         | TEXT        | NOT NULL | —                   | UNIQUE      | —          |
| `label`         | TEXT        | NOT NULL | —                   | —           | —          |
| `mild_days`     | INTEGER     | NOT NULL | —                   | —           | —          |
| `moderate_days` | INTEGER     | NOT NULL | —                   | —           | —          |
| `critical_days` | INTEGER     | NOT NULL | —                   | —           | —          |
| `enabled`       | BOOLEAN     | NOT NULL | `true`              | —           | —          |
| `created_at`    | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `updated_at`    | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `stage_velocity_baselines`

**RLS habilitada** · 4 policies: `svb_select_authenticated`, `svb_admin_write`, `auth read baselines`, `admin manager write baselines`

| Coluna          | Tipo        | Nulo     | Default             | Constraints | Comentário |
| --------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`            | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `stage`         | text        | NOT NULL | —                   | UNIQUE      | —          |
| `owner_id`      | UUID        | sim      | —                   | —           | —          |
| `avg_days`      | NUMERIC     | NOT NULL | `0`                 | —           | —          |
| `median_days`   | NUMERIC     | NOT NULL | `0`                 | —           | —          |
| `p75_days`      | NUMERIC     | NOT NULL | `0`                 | —           | —          |
| `sample_size`   | integer     | NOT NULL | `0`                 | —           | —          |
| `calculated_at` | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `created_at`    | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `updated_at`    | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `segment`       | text        | NOT NULL | `'all'`             | UNIQUE      | —          |
| `p50_hours`     | numeric     | NOT NULL | `0`                 | —           | —          |
| `p75_hours`     | numeric     | NOT NULL | `0`                 | —           | —          |
| `p90_hours`     | numeric     | NOT NULL | `0`                 | —           | —          |
| `computed_at`   | timestamptz | NOT NULL | `now()`             | —           | —          |

### `stock_movements`

**RLS habilitada** · 2 policies: `Admins and managers can insert stock movements`, `Admin/manager can view stock movements`

| Coluna          | Tipo                     | Nulo     | Default             | Constraints        | Comentário |
| --------------- | ------------------------ | -------- | ------------------- | ------------------ | ---------- |
| `id`            | UUID                     | NOT NULL | `gen_random_uuid()` | PK                 | —          |
| `product_id`    | UUID                     | sim      | —                   | FK → `products.id` | —          |
| `movement_type` | TEXT                     | NOT NULL | —                   | —                  | —          |
| `quantity`      | INTEGER                  | NOT NULL | —                   | —                  | —          |
| `reason`        | TEXT                     | sim      | —                   | —                  | —          |
| `reference_id`  | UUID                     | sim      | —                   | —                  | —          |
| `performed_by`  | UUID                     | sim      | —                   | —                  | —          |
| `created_at`    | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                  | —          |

### `supplier_order_items`

**RLS habilitada** · 2 policies: `Admins and managers can insert supplier_order_items`, `Admin/manager can view supplier_order_items`

| Coluna        | Tipo                     | Nulo     | Default             | Constraints               | Comentário |
| ------------- | ------------------------ | -------- | ------------------- | ------------------------- | ---------- |
| `id`          | UUID                     | NOT NULL | `gen_random_uuid()` | PK                        | —          |
| `order_id`    | UUID                     | sim      | —                   | FK → `supplier_orders.id` | —          |
| `product_id`  | UUID                     | sim      | —                   | FK → `products.id`        | —          |
| `quantity`    | INTEGER                  | NOT NULL | —                   | —                         | —          |
| `unit_price`  | NUMERIC(12,2)            | NOT NULL | —                   | —                         | —          |
| `total_price` | NUMERIC(12,2)            | NOT NULL | —                   | —                         | —          |
| `created_at`  | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                         | —          |

### `supplier_orders`

**RLS habilitada** · 4 policies: `Admins and managers can insert supplier_orders`, `Admins and managers can update supplier_orders`, `Admins and managers can delete supplier_orders`, `Admin/manager can view supplier_orders`

| Coluna              | Tipo                     | Nulo     | Default             | Constraints         | Comentário |
| ------------------- | ------------------------ | -------- | ------------------- | ------------------- | ---------- |
| `id`                | UUID                     | NOT NULL | `gen_random_uuid()` | PK                  | —          |
| `supplier_id`       | UUID                     | sim      | —                   | FK → `suppliers.id` | —          |
| `order_number`      | TEXT                     | sim      | —                   | —                   | —          |
| `status`            | TEXT                     | sim      | `'pending'`         | —                   | —          |
| `total_amount`      | NUMERIC(12,2)            | NOT NULL | `0`                 | —                   | —          |
| `order_date`        | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                   | —          |
| `expected_delivery` | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                   | —          |
| `actual_delivery`   | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                   | —          |
| `notes`             | TEXT                     | sim      | —                   | —                   | —          |
| `created_by`        | UUID                     | sim      | —                   | —                   | —          |
| `created_at`        | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                   | —          |
| `updated_at`        | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                   | —          |

### `supplier_products`

**RLS habilitada** · 4 policies: `Admins and managers can insert supplier_products`, `Admins and managers can update supplier_products`, `Admins and managers can delete supplier_products`, `Admin/manager can view supplier_products`

| Coluna               | Tipo                     | Nulo     | Default             | Constraints         | Comentário |
| -------------------- | ------------------------ | -------- | ------------------- | ------------------- | ---------- |
| `id`                 | UUID                     | NOT NULL | `gen_random_uuid()` | PK                  | —          |
| `supplier_id`        | UUID                     | sim      | —                   | FK → `suppliers.id` | —          |
| `product_id`         | UUID                     | sim      | —                   | FK → `products.id`  | —          |
| `unit_price`         | NUMERIC(12,2)            | NOT NULL | —                   | —                   | —          |
| `min_order_quantity` | INTEGER                  | sim      | `1`                 | —                   | —          |
| `currency`           | TEXT                     | sim      | `'BRL'`             | —                   | —          |
| `last_price_update`  | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                   | —          |
| `is_preferred`       | BOOLEAN                  | sim      | `false`             | —                   | —          |
| `created_at`         | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                   | —          |
| `updated_at`         | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                   | —          |

### `supplier_risk_assessments`

**RLS habilitada** · 3 policies: `Admins and managers can insert supplier_risk_assessments`, `Admins and managers can update supplier_risk_assessments`, `Admin/manager can view supplier_risk_assessments`

| Coluna            | Tipo                     | Nulo     | Default             | Constraints         | Comentário |
| ----------------- | ------------------------ | -------- | ------------------- | ------------------- | ---------- |
| `id`              | UUID                     | NOT NULL | `gen_random_uuid()` | PK                  | —          |
| `supplier_id`     | UUID                     | sim      | —                   | FK → `suppliers.id` | —          |
| `assessment_date` | DATE                     | NOT NULL | `CURRENT_DATE`      | —                   | —          |
| `financial_risk`  | NUMERIC(3,2)             | sim      | `0.5`               | —                   | —          |
| `delivery_risk`   | NUMERIC(3,2)             | sim      | `0.5`               | —                   | —          |
| `quality_risk`    | NUMERIC(3,2)             | sim      | `0.5`               | —                   | —          |
| `overall_risk`    | NUMERIC(3,2)             | sim      | `0.5`               | —                   | —          |
| `risk_level`      | TEXT                     | sim      | `'medium'`          | —                   | —          |
| `factors`         | JSONB                    | sim      | `'{}'`              | —                   | —          |
| `recommendations` | TEXT                     | sim      | —                   | —                   | —          |
| `assessed_by`     | UUID                     | sim      | —                   | —                   | —          |
| `created_at`      | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                   | —          |

### `suppliers`

**RLS habilitada** · 5 policies: `Admins and managers can insert suppliers`, `Admins and managers can update suppliers`, `Admins and managers can delete suppliers`, `Admins can view deleted suppliers`, `Admin and managers can read suppliers`

| Coluna              | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ------------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`                | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `name`              | TEXT                     | NOT NULL | —                   | —           | —          |
| `contact_name`      | TEXT                     | sim      | —                   | —           | —          |
| `email`             | TEXT                     | sim      | —                   | —           | —          |
| `phone`             | TEXT                     | sim      | —                   | —           | —          |
| `address`           | TEXT                     | sim      | —                   | —           | —          |
| `city`              | TEXT                     | sim      | —                   | —           | —          |
| `state`             | TEXT                     | sim      | —                   | —           | —          |
| `country`           | TEXT                     | sim      | `'Brasil'`          | —           | —          |
| `cnpj`              | TEXT                     | sim      | —                   | —           | —          |
| `category`          | TEXT                     | sim      | `'geral'`           | —           | —          |
| `payment_terms`     | TEXT                     | sim      | `'30`               | —           | —          |
| `lead_time_days`    | INTEGER                  | sim      | `7`                 | —           | —          |
| `reliability_score` | NUMERIC(3,2)             | sim      | `0.85`              | —           | —          |
| `is_active`         | BOOLEAN                  | sim      | `true`              | —           | —          |
| `notes`             | TEXT                     | sim      | —                   | —           | —          |
| `created_at`        | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |
| `updated_at`        | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |
| `deleted_at`        | TIMESTAMP WITH TIME ZONE | sim      | —                   | —           | —          |
| `deleted_by`        | UUID                     | sim      | —                   | —           | —          |
| `delete_reason`     | TEXT                     | sim      | —                   | —           | —          |

### `support_tickets`

**RLS habilitada** · 4 policies: `cs_st_select`, `cs_st_insert`, `cs_st_update`, `cs_st_delete`

| Coluna            | Tipo                           | Nulo     | Default             | Constraints        | Comentário |
| ----------------- | ------------------------------ | -------- | ------------------- | ------------------ | ---------- |
| `id`              | uuid                           | NOT NULL | `gen_random_uuid()` | PK                 | —          |
| `account_id`      | uuid                           | NOT NULL | —                   | FK → `accounts.id` | —          |
| `external_id`     | text                           | sim      | —                   | —                  | —          |
| `source`          | text                           | NOT NULL | `'internal'`        | —                  | —          |
| `subject`         | text                           | NOT NULL | —                   | —                  | —          |
| `description`     | text                           | sim      | —                   | —                  | —          |
| `status`          | public.support_ticket_status   | NOT NULL | `'open'`            | —                  | —          |
| `priority`        | public.support_ticket_priority | NOT NULL | `'normal'`          | —                  | —          |
| `sentiment`       | text                           | sim      | —                   | —                  | —          |
| `requester_email` | text                           | sim      | —                   | —                  | —          |
| `assignee_email`  | text                           | sim      | —                   | —                  | —          |
| `tags`            | text[]                         | sim      | —                   | —                  | —          |
| `metadata`        | jsonb                          | NOT NULL | `'{}'::jsonb`       | —                  | —          |
| `created_at`      | timestamptz                    | NOT NULL | `now()`             | —                  | —          |
| `updated_at`      | timestamptz                    | NOT NULL | `now()`             | —                  | —          |
| `resolved_at`     | timestamptz                    | sim      | —                   | —                  | —          |

### `task_assignments`

**RLS habilitada** · 4 policies: `Users view own or admin views all assignments`, `Admin can insert assignments`, `Admin updates any, user updates own progress`, `Admin can delete assignments`

| Coluna                 | Tipo                          | Nulo     | Default             | Constraints            | Comentário |
| ---------------------- | ----------------------------- | -------- | ------------------- | ---------------------- | ---------- |
| `id`                   | UUID                          | NOT NULL | `gen_random_uuid()` | PK                     | —          |
| `catalog_id`           | UUID                          | NOT NULL | —                   | FK → `task_catalog.id` | —          |
| `assigned_to`          | UUID                          | NOT NULL | —                   | —                      | —          |
| `assigned_by`          | UUID                          | NOT NULL | —                   | —                      | —          |
| `due_date`             | DATE                          | sim      | —                   | —                      | —          |
| `status`               | public.task_assignment_status | NOT NULL | `'pending'`         | —                      | —          |
| `submission_note`      | TEXT                          | sim      | —                   | —                      | —          |
| `reviewed_by`          | UUID                          | sim      | —                   | —                      | —          |
| `reviewed_at`          | TIMESTAMPTZ                   | sim      | —                   | —                      | —          |
| `xp_granted`           | INTEGER                       | sim      | `0`                 | —                      | —          |
| `created_at`           | TIMESTAMPTZ                   | NOT NULL | `now()`             | —                      | —          |
| `updated_at`           | TIMESTAMPTZ                   | NOT NULL | `now()`             | —                      | —          |
| `squad_id`             | UUID                          | sim      | —                   | FK → `squads.id`       | —          |
| `recurrence_rule`      | TEXT                          | sim      | —                   | —                      | —          |
| `parent_recurrence_id` | UUID                          | sim      | —                   | —                      | —          |

### `task_catalog`

**RLS habilitada** · 3 policies: `Admin can insert catalog`, `Admin can update catalog`, `Admin can delete catalog`

| Coluna        | Tipo                   | Nulo     | Default             | Constraints | Comentário |
| ------------- | ---------------------- | -------- | ------------------- | ----------- | ---------- |
| `id`          | UUID                   | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `title`       | TEXT                   | NOT NULL | —                   | —           | —          |
| `description` | TEXT                   | sim      | —                   | —           | —          |
| `category`    | TEXT                   | NOT NULL | `'general'`         | —           | —          |
| `difficulty`  | public.task_difficulty | NOT NULL | `'medium'`          | —           | —          |
| `xp_reward`   | INTEGER                | NOT NULL | `50`                | —           | —          |
| `active`      | BOOLEAN                | NOT NULL | `true`              | —           | —          |
| `created_by`  | UUID                   | sim      | —                   | —           | —          |
| `created_at`  | TIMESTAMPTZ            | NOT NULL | `now()`             | —           | —          |
| `updated_at`  | TIMESTAMPTZ            | NOT NULL | `now()`             | —           | —          |

### `tasks`

**RLS habilitada** · 6 policies: `Users can read own tasks or admins all`, `Users can insert own tasks`, `Users can update own tasks`, `Users can delete own tasks`, `Users can view own or assigned tasks`, `Users can update assigned tasks`

| Coluna              | Tipo                     | Nulo     | Default             | Constraints                 | Comentário |
| ------------------- | ------------------------ | -------- | ------------------- | --------------------------- | ---------- |
| `id`                | UUID                     | NOT NULL | `gen_random_uuid()` | PK                          | —          |
| `title`             | TEXT                     | NOT NULL | —                   | —                           | —          |
| `description`       | TEXT                     | sim      | —                   | —                           | —          |
| `salesperson_id`    | UUID                     | sim      | —                   | FK → `salespeople.id`       | —          |
| `sale_id`           | UUID                     | sim      | —                   | FK → `sales.id`             | —          |
| `priority`          | task_priority            | NOT NULL | `'medium'`          | —                           | —          |
| `status`            | task_status              | NOT NULL | `'pending'`         | —                           | —          |
| `task_type`         | task_type                | NOT NULL | `'other'`           | —                           | —          |
| `due_date`          | DATE                     | NOT NULL | `CURRENT_DATE`      | —                           | —          |
| `due_time`          | TIME                     | sim      | —                   | —                           | —          |
| `completed_at`      | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                           | —          |
| `created_at`        | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                           | —          |
| `updated_at`        | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                           | —          |
| `deleted_at`        | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                           | —          |
| `source_insight_id` | uuid                     | sim      | —                   | FK → `win_loss_insights.id` | —          |
| `client_id`         | UUID                     | sim      | —                   | FK → `clients.id`           | —          |

### `team_closers`

**RLS habilitada** · 3 policies: `Admins and managers can insert team_closers`, `Admins and managers can delete team_closers`, `Authenticated can view team closers`

| Coluna       | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| ------------ | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`         | UUID                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `team_id`    | UUID                     | NOT NULL | —                   | FK → `teams.id`       | —          |
| `closer_id`  | UUID                     | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |

### `team_custom_fields`

**RLS habilitada** · 1 policies: `Admins can manage custom fields`

| Coluna        | Tipo        | Nulo     | Default             | Constraints     | Comentário |
| ------------- | ----------- | -------- | ------------------- | --------------- | ---------- |
| `id`          | uuid        | NOT NULL | `gen_random_uuid()` | PK              | —          |
| `team_id`     | uuid        | NOT NULL | —                   | FK → `teams.id` | —          |
| `field_key`   | text        | NOT NULL | —                   | —               | —          |
| `field_label` | text        | NOT NULL | —                   | —               | —          |
| `field_type`  | text        | NOT NULL | `'number'`          | —               | —          |
| `is_active`   | boolean     | NOT NULL | `true`              | —               | —          |
| `created_at`  | timestamptz | NOT NULL | `now()`             | —               | —          |
| `updated_at`  | timestamptz | NOT NULL | `now()`             | —               | —          |

### `teams`

**RLS habilitada** · 4 policies: `Admins and managers can insert teams`, `Admins and managers can update teams`, `Admins and managers can delete teams`, `Admins can view deleted teams`

| Coluna            | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| ----------------- | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`              | UUID                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `name`            | TEXT                     | NOT NULL | —                   | —                     | —          |
| `sdr_id`          | UUID                     | sim      | —                   | FK → `salespeople.id` | —          |
| `is_active`       | BOOLEAN                  | NOT NULL | `true`              | —                     | —          |
| `inactivity_days` | INTEGER                  | NOT NULL | `365`               | —                     | —          |
| `created_at`      | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |
| `updated_at`      | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |
| `deleted_at`      | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                     | —          |
| `deleted_by`      | UUID                     | sim      | —                   | —                     | —          |
| `delete_reason`   | TEXT                     | sim      | —                   | —                     | —          |

### `territories`

**RLS habilitada** · 1 policies: `Anyone can view territories`

| Coluna             | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| ------------------ | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`               | UUID                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `name`             | TEXT                     | NOT NULL | —                   | UNIQUE                | —          |
| `current_owner_id` | UUID                     | sim      | —                   | FK → `salespeople.id` | —          |
| `total_revenue`    | NUMERIC                  | sim      | `0`                 | —                     | —          |
| `total_deals`      | INTEGER                  | sim      | `0`                 | —                     | —          |
| `conquered_at`     | TIMESTAMP WITH TIME ZONE | sim      | —                   | —                     | —          |
| `updated_at`       | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                     | —          |

### `territory_history`

**RLS habilitada** · 3 policies: `Auth users can read territory history`, `Admins can insert territory_history`, `Users can read own territory_history`

| Coluna                 | Tipo        | Nulo     | Default             | Constraints                 | Comentário |
| ---------------------- | ----------- | -------- | ------------------- | --------------------------- | ---------- |
| `id`                   | UUID        | NOT NULL | `gen_random_uuid()` | PK                          | —          |
| `territory_id`         | UUID        | NOT NULL | —                   | FK → `sales_territories.id` | —          |
| `salesperson_id`       | UUID        | NOT NULL | —                   | FK → `salespeople.id`       | —          |
| `revenue_contribution` | NUMERIC     | NOT NULL | `0`                 | —                           | —          |
| `deals_count`          | INTEGER     | NOT NULL | `0`                 | —                           | —          |
| `conquered_at`         | TIMESTAMPTZ | sim      | —                   | —                           | —          |
| `lost_at`              | TIMESTAMPTZ | sim      | —                   | —                           | —          |
| `created_at`           | TIMESTAMPTZ | NOT NULL | `now()`             | —                           | —          |

### `tournament_matches`

**RLS habilitada** · 3 policies: `Auth users can read matches`, `Admins can insert matches`, `Admins can update matches`

| Coluna          | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| --------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`            | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `tournament_id` | UUID        | NOT NULL | —                   | FK → `tournaments.id` | —          |
| `round_number`  | INTEGER     | NOT NULL | —                   | —                     | —          |
| `match_order`   | INTEGER     | NOT NULL | `0`                 | —                     | —          |
| `player1_id`    | UUID        | sim      | —                   | FK → `salespeople.id` | —          |
| `player2_id`    | UUID        | sim      | —                   | FK → `salespeople.id` | —          |
| `player1_score` | NUMERIC     | NOT NULL | `0`                 | —                     | —          |
| `player2_score` | NUMERIC     | NOT NULL | `0`                 | —                     | —          |
| `winner_id`     | UUID        | sim      | —                   | FK → `salespeople.id` | —          |
| `status`        | TEXT        | NOT NULL | `'pending'`         | —                     | —          |
| `started_at`    | TIMESTAMPTZ | sim      | —                   | —                     | —          |
| `completed_at`  | TIMESTAMPTZ | sim      | —                   | —                     | —          |
| `created_at`    | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |

### `tournament_participants`

**RLS habilitada** · 3 policies: `Auth users can read participants`, `Users can insert own tournament_participants`, `Users can update own tournament_participants`

| Coluna                | Tipo        | Nulo     | Default             | Constraints                    | Comentário |
| --------------------- | ----------- | -------- | ------------------- | ------------------------------ | ---------- |
| `id`                  | UUID        | NOT NULL | `gen_random_uuid()` | PK                             | —          |
| `tournament_id`       | UUID        | NOT NULL | —                   | UNIQUE · FK → `tournaments.id` | —          |
| `salesperson_id`      | UUID        | NOT NULL | —                   | UNIQUE · FK → `salespeople.id` | —          |
| `seed`                | INTEGER     | sim      | —                   | —                              | —          |
| `is_eliminated`       | BOOLEAN     | NOT NULL | `false`             | —                              | —          |
| `eliminated_in_round` | INTEGER     | sim      | —                   | —                              | —          |
| `final_position`      | INTEGER     | sim      | —                   | —                              | —          |
| `created_at`          | TIMESTAMPTZ | NOT NULL | `now()`             | —                              | —          |

### `tournaments`

**RLS habilitada** · 3 policies: `Auth users can read tournaments`, `Admins can insert tournaments`, `Admins can update tournaments`

| Coluna                | Tipo        | Nulo     | Default                | Constraints           | Comentário |
| --------------------- | ----------- | -------- | ---------------------- | --------------------- | ---------- |
| `id`                  | UUID        | NOT NULL | `gen_random_uuid()`    | PK                    | —          |
| `name`                | TEXT        | NOT NULL | —                      | —                     | —          |
| `description`         | TEXT        | sim      | —                      | —                     | —          |
| `status`              | TEXT        | NOT NULL | `'upcoming'`           | —                     | —          |
| `bracket_type`        | TEXT        | NOT NULL | `'single_elimination'` | —                     | —          |
| `metric_type`         | TEXT        | NOT NULL | `'revenue'`            | —                     | —          |
| `round_duration_days` | INTEGER     | NOT NULL | `7`                    | —                     | —          |
| `current_round`       | INTEGER     | NOT NULL | `0`                    | —                     | —          |
| `total_rounds`        | INTEGER     | NOT NULL | `3`                    | —                     | —          |
| `xp_reward`           | INTEGER     | NOT NULL | `500`                  | —                     | —          |
| `starts_at`           | TIMESTAMPTZ | NOT NULL | —                      | —                     | —          |
| `ends_at`             | TIMESTAMPTZ | sim      | —                      | —                     | —          |
| `created_at`          | TIMESTAMPTZ | NOT NULL | `now()`                | —                     | —          |
| `created_by`          | UUID        | sim      | —                      | FK → `salespeople.id` | —          |

### `twilio_call_sessions`

**RLS habilitada** · 3 policies: `Owners can view own twilio sessions`, `Owners can insert own twilio sessions`, `Owners can update own twilio sessions`

| Coluna             | Tipo        | Nulo     | Default             | Constraints                  | Comentário |
| ------------------ | ----------- | -------- | ------------------- | ---------------------------- | ---------- |
| `id`               | UUID        | NOT NULL | `gen_random_uuid()` | PK                           | —          |
| `owner_id`         | UUID        | NOT NULL | —                   | —                            | —          |
| `sale_id`          | UUID        | sim      | —                   | FK → `sales.id`              | —          |
| `queue_item_id`    | UUID        | sim      | —                   | FK → `dialer_queue_items.id` | —          |
| `call_sid`         | TEXT        | sim      | —                   | UNIQUE                       | —          |
| `from_number`      | TEXT        | sim      | —                   | —                            | —          |
| `to_number`        | TEXT        | NOT NULL | —                   | —                            | —          |
| `status`           | TEXT        | NOT NULL | `'initiated'`       | —                            | —          |
| `duration_seconds` | INT         | sim      | —                   | —                            | —          |
| `recording_url`    | TEXT        | sim      | —                   | —                            | —          |
| `recording_sid`    | TEXT        | sim      | —                   | —                            | —          |
| `price`            | NUMERIC     | sim      | —                   | —                            | —          |
| `started_at`       | TIMESTAMPTZ | sim      | —                   | —                            | —          |
| `ended_at`         | TIMESTAMPTZ | sim      | —                   | —                            | —          |
| `created_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —                            | —          |

### `user_2fa`

**RLS habilitada** · 3 policies: `Users can view own 2FA settings`, `Users can update own 2FA settings`, `Users can insert own 2FA settings`

| Coluna              | Tipo                     | Nulo     | Default              | Constraints          | Comentário |
| ------------------- | ------------------------ | -------- | -------------------- | -------------------- | ---------- |
| `id`                | UUID                     | NOT NULL | `uuid_generate_v4()` | PK                   | —          |
| `user_id`           | UUID                     | NOT NULL | —                    | FK → `auth.users.id` | —          |
| `secret`            | TEXT                     | NOT NULL | —                    | —                    | —          |
| `enabled`           | BOOLEAN                  | sim      | `false`              | —                    | —          |
| `backup_codes`      | TEXT[]                   | sim      | —                    | —                    | —          |
| `created_at`        | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —                    | —          |
| `updated_at`        | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —                    | —          |
| `verified_at`       | TIMESTAMP WITH TIME ZONE | sim      | —                    | —                    | —          |
| `backup_codes_used` | INTEGER                  | sim      | `0`                  | —                    | —          |

### `user_2fa_backup_codes`

**RLS habilitada** · 2 policies: `Users can view own backup codes`, `Users can update own backup codes`

| Coluna       | Tipo                     | Nulo     | Default              | Constraints          | Comentário |
| ------------ | ------------------------ | -------- | -------------------- | -------------------- | ---------- |
| `id`         | UUID                     | NOT NULL | `uuid_generate_v4()` | PK                   | —          |
| `user_id`    | UUID                     | NOT NULL | —                    | FK → `auth.users.id` | —          |
| `code`       | TEXT                     | NOT NULL | —                    | —                    | —          |
| `used`       | BOOLEAN                  | sim      | `false`              | —                    | —          |
| `used_at`    | TIMESTAMP WITH TIME ZONE | sim      | —                    | —                    | —          |
| `created_at` | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —                    | —          |

### `user_2fa_log`

**RLS não declarado nas migrations** · 0 policies

| Coluna       | Tipo                     | Nulo     | Default              | Constraints          | Comentário |
| ------------ | ------------------------ | -------- | -------------------- | -------------------- | ---------- |
| `id`         | UUID                     | NOT NULL | `uuid_generate_v4()` | PK                   | —          |
| `user_id`    | UUID                     | NOT NULL | —                    | FK → `auth.users.id` | —          |
| `success`    | BOOLEAN                  | NOT NULL | —                    | —                    | —          |
| `ip_address` | INET                     | sim      | —                    | —                    | —          |
| `user_agent` | TEXT                     | sim      | —                    | —                    | —          |
| `created_at` | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —                    | —          |

### `user_app_settings`

**RLS habilitada** · 4 policies: `users select own app settings`, `users insert own app settings`, `users update own app settings`, `users delete own app settings`

| Coluna       | Tipo        | Nulo     | Default       | Constraints               | Comentário |
| ------------ | ----------- | -------- | ------------- | ------------------------- | ---------- |
| `user_id`    | uuid        | NOT NULL | —             | PK · FK → `auth.users.id` | —          |
| `key`        | text        | NOT NULL | —             | PK                        | —          |
| `value`      | jsonb       | NOT NULL | `'{}'::jsonb` | —                         | —          |
| `created_at` | timestamptz | NOT NULL | `now()`       | —                         | —          |
| `updated_at` | timestamptz | NOT NULL | `now()`       | —                         | —          |

### `user_mfa_settings`

**RLS habilitada** · 3 policies: `Deny direct SELECT - use RPCs`, `Authenticated users can insert their own MFA settings`, `Users can update their own MFA settings`

| Coluna                      | Tipo        | Nulo     | Default             | Constraints          | Comentário |
| --------------------------- | ----------- | -------- | ------------------- | -------------------- | ---------- |
| `id`                        | UUID        | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `user_id`                   | UUID        | NOT NULL | —                   | FK → `auth.users.id` | —          |
| `totp_enabled`              | BOOLEAN     | sim      | `FALSE`             | —                    | —          |
| `totp_secret`               | TEXT        | sim      | —                   | —                    | —          |
| `totp_verified_at`          | TIMESTAMPTZ | sim      | —                   | —                    | —          |
| `sms_enabled`               | BOOLEAN     | sim      | `FALSE`             | —                    | —          |
| `phone_number`              | TEXT        | sim      | —                   | —                    | —          |
| `phone_verified_at`         | TIMESTAMPTZ | sim      | —                   | —                    | —          |
| `backup_codes`              | TEXT[]      | sim      | —                   | —                    | —          |
| `backup_codes_generated_at` | TIMESTAMPTZ | sim      | —                   | —                    | —          |
| `preferred_method`          | TEXT        | sim      | `'totp'`            | —                    | —          |
| `created_at`                | TIMESTAMPTZ | sim      | `NOW()`             | —                    | —          |
| `updated_at`                | TIMESTAMPTZ | sim      | `NOW()`             | —                    | —          |

### `user_permissions_cache`

**RLS não declarado nas migrations** · 0 policies

| Coluna        | Tipo                     | Nulo     | Default | Constraints | Comentário |
| ------------- | ------------------------ | -------- | ------- | ----------- | ---------- |
| `user_id`     | UUID                     | NOT NULL | —       | PK          | —          |
| `permissions` | JSONB                    | NOT NULL | —       | —           | —          |
| `updated_at`  | TIMESTAMP WITH TIME ZONE | sim      | `NOW()` | —           | —          |

### `user_roles`

**RLS habilitada** · 5 policies: `Admins can manage all roles`, `Users can view own role`, `Only admins can insert roles`, `Only admins can update roles`, `Only admins can delete roles`

| Coluna        | Tipo                     | Nulo     | Default             | Constraints               | Comentário |
| ------------- | ------------------------ | -------- | ------------------- | ------------------------- | ---------- |
| `id`          | UUID                     | NOT NULL | `gen_random_uuid()` | PK                        | —          |
| `user_id`     | UUID                     | NOT NULL | —                   | PK · FK → `auth.users.id` | —          |
| `role`        | TEXT                     | NOT NULL | —                   | —                         | —          |
| `created_at`  | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                         | —          |
| `updated_at`  | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                         | —          |
| `role_id`     | UUID                     | NOT NULL | —                   | PK                        | —          |
| `granted_by`  | UUID                     | sim      | —                   | —                         | —          |
| `granted_at`  | TIMESTAMP WITH TIME ZONE | sim      | `NOW()`             | —                         | —          |
| `assigned_at` | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                         | —          |
| `assigned_by` | UUID                     | sim      | —                   | FK → `auth.users.id`      | —          |

### `user_winloss_preferences`

**RLS habilitada** · 4 policies: `own prefs select`, `own prefs insert`, `own prefs update`, `own prefs delete`

| Coluna       | Tipo        | Nulo     | Default       | Constraints | Comentário |
| ------------ | ----------- | -------- | ------------- | ----------- | ---------- |
| `user_id`    | UUID        | NOT NULL | —             | PK          | —          |
| `layout`     | JSONB       | NOT NULL | `'[]'::jsonb` | —           | —          |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `now()`       | —           | —          |

### `v4_callback_alert_settings`

**RLS habilitada** · 1 policies: `Admins manage v4 callback alert settings`

| Coluna                    | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`                      | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `singleton`               | BOOLEAN     | NOT NULL | `true`              | UNIQUE      | —          |
| `is_active`               | BOOLEAN     | NOT NULL | `true`              | —           | —          |
| `failure_rate_threshold`  | NUMERIC     | NOT NULL | `20`                | —           | —          |
| `exhausted_threshold_24h` | INTEGER     | NOT NULL | `5`                 | —           | —          |
| `pending_threshold`       | INTEGER     | NOT NULL | `50`                | —           | —          |
| `window_minutes`          | INTEGER     | NOT NULL | `60`                | —           | —          |
| `min_events`              | INTEGER     | NOT NULL | `10`                | —           | —          |
| `suppress_minutes`        | INTEGER     | NOT NULL | `30`                | —           | —          |
| `updated_at`              | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `updated_by`              | UUID        | sim      | —                   | —           | —          |

### `v4_callback_alerts`

**RLS habilitada** · 3 policies: `Admins read v4 callback alerts`, `Admins ack v4 callback alerts`, `Service role writes v4 callback alerts`

| Coluna            | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `kind`            | TEXT        | NOT NULL | —                   | —           | —          |
| `details`         | JSONB       | NOT NULL | `'{}'::jsonb`       | —           | —          |
| `fired_at`        | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `acknowledged_at` | TIMESTAMPTZ | sim      | —                   | —           | —          |
| `acknowledged_by` | UUID        | sim      | —                   | —           | —          |

### `v4_callback_dead_letters`

**RLS habilitada** · 1 policies: `Admins manage v4 dlq`

| Coluna              | Tipo        | Nulo     | Default             | Constraints      | Comentário |
| ------------------- | ----------- | -------- | ------------------- | ---------------- | ---------- |
| `id`                | UUID        | NOT NULL | `gen_random_uuid()` | PK               | —          |
| `external_quote_id` | TEXT        | NOT NULL | —                   | —                | —          |
| `quote_id`          | UUID        | sim      | —                   | FK → `quotes.id` | —          |
| `event_type`        | TEXT        | NOT NULL | —                   | —                | —          |
| `payload`           | JSONB       | NOT NULL | —                   | —                | —          |
| `last_error`        | TEXT        | sim      | —                   | —                | —          |
| `attempts`          | INT         | NOT NULL | `0`                 | —                | —          |
| `next_retry_at`     | TIMESTAMPTZ | sim      | —                   | —                | —          |
| `resolved_at`       | TIMESTAMPTZ | sim      | —                   | —                | —          |
| `created_at`        | TIMESTAMPTZ | NOT NULL | `now()`             | —                | —          |
| `updated_at`        | TIMESTAMPTZ | NOT NULL | `now()`             | —                | —          |

### `v4_callback_metrics`

**RLS habilitada** · 1 policies: `Admins can read v4 callback metrics`

| Coluna       | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------ | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`         | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `day`        | date        | NOT NULL | `(now()`            | —           | —          |
| `sent_ok`    | integer     | NOT NULL | `0`                 | —           | —          |
| `failed`     | integer     | NOT NULL | `0`                 | —           | —          |
| `exhausted`  | integer     | NOT NULL | `0`                 | —           | —          |
| `created_at` | timestamptz | NOT NULL | `now()`             | —           | —          |
| `updated_at` | timestamptz | NOT NULL | `now()`             | —           | —          |

### `victory_feed`

**RLS habilitada** · 1 policies: `Users can insert own victory_feed`

| Coluna           | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `event_type`     | TEXT        | NOT NULL | `'sale'`            | —                     | —          |
| `challenge`      | title TEXT  | NOT NULL | —                   | —                     | —          |
| `description`    | TEXT        | sim      | —                   | —                     | —          |
| `value`          | NUMERIC     | sim      | `0`                 | —                     | —          |
| `metadata`       | JSONB       | sim      | `'{}'`              | —                     | —          |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |

### `web_vitals_samples`

**RLS habilitada** · 1 policies: `Admins can read web vitals`

| Coluna            | Tipo             | Nulo     | Default             | Constraints | Comentário |
| ----------------- | ---------------- | -------- | ------------------- | ----------- | ---------- |
| `id`              | UUID             | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `route`           | TEXT             | NOT NULL | —                   | —           | —          |
| `metric`          | TEXT             | NOT NULL | —                   | —           | —          |
| `value`           | DOUBLE PRECISION | NOT NULL | —                   | —           | —          |
| `rating`          | TEXT             | NOT NULL | —                   | —           | —          |
| `navigation_type` | TEXT             | sim      | —                   | —           | —          |
| `user_id`         | UUID             | sim      | —                   | —           | —          |
| `session_id`      | TEXT             | sim      | —                   | —           | —          |
| `user_agent`      | TEXT             | sim      | —                   | —           | —          |
| `viewport_width`  | INTEGER          | sim      | —                   | —           | —          |
| `connection_type` | TEXT             | sim      | —                   | —           | —          |
| `created_at`      | TIMESTAMPTZ      | NOT NULL | `now()`             | —           | —          |

### `webauthn_challenges`

**RLS habilitada** · 3 policies: `Users can read own webauthn challenges`, `Users can insert own webauthn challenges`, `Users can delete own webauthn challenges`

| Coluna       | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ------------ | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`         | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `user_id`    | UUID                     | sim      | —                   | —           | —          |
| `user_email` | TEXT                     | sim      | —                   | —           | —          |
| `challenge`  | TEXT                     | NOT NULL | —                   | —           | —          |
| `type`       | TEXT                     | NOT NULL | —                   | —           | —          |
| `expires_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | —                   | —           | —          |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |

### `webauthn_credentials`

**RLS habilitada** · 4 policies: `Users can view own webauthn credentials`, `Users can insert own webauthn credentials`, `Users can update own webauthn credentials`, `Users can delete own webauthn credentials`

| Coluna          | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| --------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`            | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `user_id`       | UUID                     | NOT NULL | —                   | —           | —          |
| `credential_id` | TEXT                     | NOT NULL | —                   | UNIQUE      | —          |
| `public_key`    | TEXT                     | NOT NULL | —                   | —           | —          |
| `counter`       | INTEGER                  | NOT NULL | `0`                 | —           | —          |
| `device_type`   | TEXT                     | sim      | —                   | —           | —          |
| `backed_up`     | BOOLEAN                  | sim      | `false`             | —           | —          |
| `transports`    | TEXT[]                   | sim      | —                   | —           | —          |
| `created_at`    | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |
| `last_used_at`  | TIMESTAMP WITH TIME ZONE | sim      | —                   | —           | —          |
| `friendly_name` | TEXT                     | sim      | —                   | —           | —          |

### `webhook_deliveries`

**RLS habilitada** · 1 policies: `Admins and managers can view deliveries`

| Coluna            | Tipo        | Nulo     | Default             | Constraints        | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ------------------ | ---------- |
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK                 | —          |
| `webhook_id`      | UUID        | NOT NULL | —                   | FK → `webhooks.id` | —          |
| `event_type`      | TEXT        | NOT NULL | —                   | —                  | —          |
| `payload`         | JSONB       | NOT NULL | —                   | —                  | —          |
| `response_status` | INTEGER     | sim      | —                   | —                  | —          |
| `response_body`   | TEXT        | sim      | —                   | —                  | —          |
| `error_message`   | TEXT        | sim      | —                   | —                  | —          |
| `attempts`        | INTEGER     | NOT NULL | `1`                 | —                  | —          |
| `success`         | BOOLEAN     | NOT NULL | `false`             | —                  | —          |
| `duration_ms`     | INTEGER     | sim      | —                   | —                  | —          |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                  | —          |

### `webhook_events`

**RLS habilitada** · 0 policies

| Coluna            | Tipo                     | Nulo     | Default              | Constraints        | Comentário |
| ----------------- | ------------------------ | -------- | -------------------- | ------------------ | ---------- |
| `id`              | UUID                     | NOT NULL | `uuid_generate_v4()` | PK                 | —          |
| `webhook_id`      | UUID                     | NOT NULL | —                    | FK → `webhooks.id` | —          |
| `event_type`      | TEXT                     | NOT NULL | —                    | —                  | —          |
| `payload`         | JSONB                    | NOT NULL | —                    | —                  | —          |
| `status`          | TEXT                     | NOT NULL | `'pending'`          | —                  | —          |
| `attempts`        | INTEGER                  | sim      | `0`                  | —                  | —          |
| `last_attempt_at` | TIMESTAMP WITH TIME ZONE | sim      | —                    | —                  | —          |
| `next_retry_at`   | TIMESTAMP WITH TIME ZONE | sim      | —                    | —                  | —          |
| `created_at`      | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —                  | —          |

### `webhook_inbound_dedupe`

**RLS **forced**** · 1 policies: `Admins can read inbound dedupe`

| Coluna            | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`              | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `correlation_key` | text        | NOT NULL | —                   | —           | —          |
| `event`           | text        | NOT NULL | —                   | —           | —          |
| `source`          | text        | NOT NULL | `'v4'`              | —           | —          |
| `payload`         | jsonb       | NOT NULL | `'{}'::jsonb`       | —           | —          |
| `received_at`     | timestamptz | NOT NULL | `now()`             | —           | —          |
| `created_at`      | timestamptz | NOT NULL | `now()`             | —           | —          |
| `first_seen_at`   | timestamptz | NOT NULL | `now()`             | —           | —          |
| `hit_count`       | integer     | NOT NULL | `1`                 | —           | —          |

### `webhook_inbound_log`

**RLS habilitada** · 0 policies

| Coluna            | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`              | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `received_at`     | timestamptz | NOT NULL | `now()`             | —           | —          |
| `source`          | text        | NOT NULL | `'promogifts'`      | —           | —          |
| `event`           | text        | sim      | —                   | —           | —          |
| `correlation_key` | text        | sim      | —                   | —           | —          |
| `outcome`         | text        | NOT NULL | —                   | —           | —          |
| `http_status`     | integer     | NOT NULL | —                   | —           | —          |
| `request_id`      | text        | sim      | —                   | —           | —          |
| `error_message`   | text        | sim      | —                   | —           | —          |
| `payload_size`    | integer     | sim      | —                   | —           | —          |

### `webhook_logs`

**RLS habilitada** · 1 policies: `Admins can view webhook logs`

| Coluna             | Tipo                     | Nulo     | Default              | Constraints              | Comentário |
| ------------------ | ------------------------ | -------- | -------------------- | ------------------------ | ---------- |
| `id`               | UUID                     | NOT NULL | `uuid_generate_v4()` | PK                       | —          |
| `webhook_id`       | UUID                     | sim      | —                    | FK → `webhooks.id`       | —          |
| `status`           | TEXT                     | NOT NULL | —                    | —                        | —          |
| `request_body`     | JSONB                    | sim      | —                    | —                        | —          |
| `response_status`  | INTEGER                  | sim      | —                    | —                        | —          |
| `response_body`    | TEXT                     | sim      | —                    | —                        | —          |
| `error_message`    | TEXT                     | sim      | —                    | —                        | —          |
| `attempt`          | INTEGER                  | sim      | `1`                  | —                        | —          |
| `created_at`       | TIMESTAMP WITH TIME ZONE | sim      | `now()`              | —                        | —          |
| `webhook_event_id` | UUID                     | NOT NULL | —                    | FK → `webhook_events.id` | —          |

### `webhooks`

**RLS habilitada** · 7 policies: `Admins can manage webhooks`, `Users can view their own webhooks`, `Users can create their own webhooks`, `Users can update their own webhooks`, `Users can delete their own webhooks`, `Admins and managers can view webhooks`, `Admins and managers can manage webhooks`

| Coluna              | Tipo        | Nulo     | Default             | Constraints          | Comentário |
| ------------------- | ----------- | -------- | ------------------- | -------------------- | ---------- |
| `id`                | UUID        | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `name`              | TEXT        | NOT NULL | —                   | —                    | —          |
| `url`               | TEXT        | NOT NULL | —                   | —                    | —          |
| `secret`            | TEXT        | sim      | —                   | —                    | —          |
| `events`            | TEXT[]      | NOT NULL | `ARRAY[]::TEXT[]`   | —                    | —          |
| `enabled`           | BOOLEAN     | sim      | `TRUE`              | —                    | —          |
| `created_at`        | TIMESTAMPTZ | NOT NULL | `now()`             | —                    | —          |
| `updated_at`        | TIMESTAMPTZ | NOT NULL | `now()`             | —                    | —          |
| `user_id`           | UUID        | NOT NULL | —                   | FK → `auth.users.id` | —          |
| `is_active`         | BOOLEAN     | NOT NULL | `true`              | —                    | —          |
| `headers`           | JSONB       | sim      | `'{}'::jsonb`       | —                    | —          |
| `failure_count`     | INTEGER     | NOT NULL | `0`                 | —                    | —          |
| `last_triggered_at` | TIMESTAMPTZ | sim      | —                   | —                    | —          |
| `last_success_at`   | TIMESTAMPTZ | sim      | —                   | —                    | —          |
| `last_failure_at`   | TIMESTAMPTZ | sim      | —                   | —                    | —          |
| `created_by`        | UUID        | sim      | —                   | FK → `auth.users.id` | —          |

### `website_visitor_logs`

**RLS habilitada** · 1 policies: `Admins e Managers podem ver logs de visitantes`

| Coluna             | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ------------------ | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`               | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `ip_address`       | TEXT                     | sim      | —                   | —           | —          |
| `company_name`     | TEXT                     | sim      | —                   | —           | —          |
| `domain`           | TEXT                     | sim      | —                   | —           | —          |
| `page_viewed`      | TEXT                     | sim      | —                   | —           | —          |
| `referrer`         | TEXT                     | sim      | —                   | —           | —          |
| `duration_seconds` | INTEGER                  | sim      | —                   | —           | —          |
| `identified_at`    | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —           | —          |

### `weekly_challenges`

**RLS habilitada** · 4 policies: `Admins and managers can insert weekly_challenges`, `Admins and managers can update weekly_challenges`, `Admins and managers can delete weekly_challenges`, `Authenticated can view weekly challenges`

| Coluna           | Tipo                     | Nulo     | Default             | Constraints | Comentário |
| ---------------- | ------------------------ | -------- | ------------------- | ----------- | ---------- |
| `id`             | UUID                     | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `title`          | TEXT                     | NOT NULL | —                   | —           | —          |
| `description`    | TEXT                     | sim      | —                   | —           | —          |
| `challenge_type` | TEXT                     | NOT NULL | `'activity'`        | —           | —          |
| `target_value`   | INTEGER                  | NOT NULL | `10`                | —           | —          |
| `xp_reward`      | INTEGER                  | NOT NULL | `100`               | —           | —          |
| `start_date`     | DATE                     | NOT NULL | —                   | —           | —          |
| `end_date`       | DATE                     | NOT NULL | —                   | —           | —          |
| `is_active`      | BOOLEAN                  | NOT NULL | `true`              | —           | —          |
| `created_at`     | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |
| `updated_at`     | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —           | —          |

### `weekly_matchups`

**RLS habilitada** · 2 policies: `Anyone can read matchups`, `Admins manage matchups`

| Coluna             | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ------------------ | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`               | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_a_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `salesperson_b_id` | UUID        | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `week_start`       | DATE        | NOT NULL | —                   | —                     | —          |
| `score_a`          | NUMERIC     | NOT NULL | `0`                 | —                     | —          |
| `score_b`          | NUMERIC     | NOT NULL | `0`                 | —                     | —          |
| `winner_id`        | UUID        | sim      | —                   | FK → `salespeople.id` | —          |
| `status`           | TEXT        | NOT NULL | `'active'`          | —                     | —          |
| `xp_reward`        | INTEGER     | NOT NULL | `100`               | —                     | —          |
| `created_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |

### `whatsapp_conversations`

**RLS habilitada** · 2 policies: `Users can view WhatsApp conversations for their sales`, `Users can log WhatsApp messages`

| Coluna                | Tipo                     | Nulo     | Default             | Constraints          | Comentário |
| --------------------- | ------------------------ | -------- | ------------------- | -------------------- | ---------- |
| `id`                  | UUID                     | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `sale_id`             | UUID                     | sim      | —                   | FK → `sales.id`      | —          |
| `sender_id`           | UUID                     | sim      | —                   | FK → `auth.users.id` | —          |
| `external_message_id` | TEXT                     | sim      | —                   | UNIQUE               | —          |
| `direction`           | TEXT                     | sim      | —                   | —                    | —          |
| `body`                | TEXT                     | sim      | —                   | —                    | —          |
| `status`              | TEXT                     | sim      | —                   | —                    | —          |
| `sent_at`             | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                    | —          |
| `created_at`          | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                    | —          |

### `whatsapp_template_versions`

**RLS habilitada** · 3 policies: `Versions are viewable by authenticated users`, `Only admins can create versions`, `Admins can manage template versions`

| Coluna           | Tipo                     | Nulo     | Default             | Constraints          | Comentário |
| ---------------- | ------------------------ | -------- | ------------------- | -------------------- | ---------- |
| `id`             | UUID                     | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `template_id`    | UUID                     | NOT NULL | —                   | —                    | —          |
| `body`           | TEXT                     | NOT NULL | —                   | —                    | —          |
| `version_number` | INTEGER                  | NOT NULL | —                   | —                    | —          |
| `created_by`     | UUID                     | sim      | —                   | FK → `auth.users.id` | —          |
| `created_at`     | TIMESTAMP WITH TIME ZONE | sim      | `now()`             | —                    | —          |
| `template_text`  | TEXT                     | NOT NULL | —                   | —                    | —          |
| `version`        | INTEGER                  | NOT NULL | —                   | —                    | —          |
| `is_active`      | BOOLEAN                  | sim      | `false`             | —                    | —          |

### `win_calibration_buckets`

**RLS habilitada** · 2 policies: `Authenticated read win_calibration_buckets`, `Admin/manager manage win_calibration_buckets`

| Coluna            | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`              | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `stage`           | text        | NOT NULL | —                   | UNIQUE      | —          |
| `segment`         | text        | NOT NULL | `'all'`             | UNIQUE      | —          |
| `bucket_min`      | numeric     | NOT NULL | —                   | UNIQUE      | —          |
| `bucket_max`      | numeric     | NOT NULL | —                   | —           | —          |
| `actual_win_rate` | numeric     | NOT NULL | `0`                 | —           | —          |
| `sample_size`     | integer     | NOT NULL | `0`                 | —           | —          |
| `computed_at`     | timestamptz | NOT NULL | `now()`             | —           | —          |

### `win_loss_analyses`

**RLS habilitada** · 1 policies: `wla write admin/manager`

| Coluna              | Tipo        | Nulo     | Default             | Constraints              | Comentário |
| ------------------- | ----------- | -------- | ------------------- | ------------------------ | ---------- |
| `id`                | uuid        | NOT NULL | `gen_random_uuid()` | PK                       | —          |
| `sale_id`           | uuid        | NOT NULL | —                   | UNIQUE · FK → `sales.id` | —          |
| `outcome`           | text        | NOT NULL | —                   | —                        | —          |
| `primary_reason`    | text        | sim      | —                   | —                        | —          |
| `secondary_reasons` | jsonb       | NOT NULL | `'[]'::jsonb`       | —                        | —          |
| `competitor`        | text        | sim      | —                   | —                        | —          |
| `lost_stage`        | text        | sim      | —                   | —                        | —          |
| `cycle_days`        | numeric     | sim      | —                   | —                        | —          |
| `amount`            | numeric     | sim      | —                   | —                        | —          |
| `segment`           | text        | sim      | —                   | —                        | —          |
| `analyzed_at`       | timestamptz | NOT NULL | `now()`             | —                        | —          |
| `created_at`        | timestamptz | NOT NULL | `now()`             | —                        | —          |

### `win_loss_insight_comments`

**RLS habilitada** · 0 policies

| Coluna       | Tipo        | Nulo     | Default             | Constraints                 | Comentário |
| ------------ | ----------- | -------- | ------------------- | --------------------------- | ---------- |
| `id`         | uuid        | NOT NULL | `gen_random_uuid()` | PK                          | —          |
| `insight_id` | uuid        | NOT NULL | —                   | FK → `win_loss_insights.id` | —          |
| `author_id`  | uuid        | NOT NULL | —                   | —                           | —          |
| `body`       | text        | NOT NULL | —                   | —                           | —          |
| `created_at` | timestamptz | NOT NULL | `now()`             | —                           | —          |

### `win_loss_insights`

**RLS habilitada** · 1 policies: `wli write admin/manager`

| Coluna         | Tipo        | Nulo     | Default             | Constraints | Comentário |
| -------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`           | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `insight_type` | text        | NOT NULL | —                   | —           | —          |
| `title`        | text        | NOT NULL | —                   | —           | —          |
| `description`  | text        | NOT NULL | —                   | —           | —          |
| `severity`     | text        | NOT NULL | `'info'`            | —           | —          |
| `evidence`     | jsonb       | NOT NULL | `'{}'::jsonb`       | —           | —          |
| `created_at`   | timestamptz | NOT NULL | `now()`             | —           | —          |
| `applied_at`   | timestamptz | sim      | —                   | —           | —          |
| `applied_by`   | uuid        | sim      | —                   | —           | —          |
| `assigned_to`  | uuid        | sim      | —                   | —           | —          |
| `assigned_at`  | timestamptz | sim      | —                   | —           | —          |

### `win_loss_patterns`

**RLS habilitada** · 2 policies: `wlp read auth`, `wlp write admin/manager`

| Coluna           | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ---------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`             | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `pattern_type`   | text        | NOT NULL | —                   | —           | —          |
| `label`          | text        | NOT NULL | —                   | —           | —          |
| `outcome`        | text        | sim      | —                   | —           | —          |
| `frequency`      | int         | NOT NULL | `0`                 | —           | —          |
| `win_rate`       | numeric     | NOT NULL | `0`                 | —           | —          |
| `avg_cycle_days` | numeric     | NOT NULL | `0`                 | —           | —          |
| `avg_amount`     | numeric     | NOT NULL | `0`                 | —           | —          |
| `confidence`     | numeric     | NOT NULL | `0`                 | —           | —          |
| `computed_at`    | timestamptz | NOT NULL | `now()`             | —           | —          |

### `win_probability_calibrations`

**RLS habilitada** · 2 policies: `Authenticated read calibrations`, `Admin/manager write calibrations`

| Coluna                   | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------------ | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`                     | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `scope`                  | text        | NOT NULL | —                   | UNIQUE      | —          |
| `scope_value`            | text        | sim      | —                   | UNIQUE      | —          |
| `stage`                  | text        | NOT NULL | —                   | UNIQUE      | —          |
| `historical_win_rate`    | numeric     | NOT NULL | `0`                 | —           | —          |
| `sample_size`            | integer     | NOT NULL | `0`                 | —           | —          |
| `confidence`             | numeric     | NOT NULL | `0`                 | —           | —          |
| `calibrated_probability` | numeric     | NOT NULL | `0`                 | —           | —          |
| `baseline_probability`   | numeric     | NOT NULL | `0`                 | —           | —          |
| `calculated_at`          | timestamptz | NOT NULL | `now()`             | —           | —          |

### `win_probability_deal_calibrations`

**RLS habilitada** · 2 policies: `Authenticated read wpdc`, `Admin/manager manage wpdc`

| Coluna                   | Tipo        | Nulo     | Default             | Constraints              | Comentário |
| ------------------------ | ----------- | -------- | ------------------- | ------------------------ | ---------- |
| `id`                     | uuid        | NOT NULL | `gen_random_uuid()` | PK                       | —          |
| `sale_id`                | uuid        | NOT NULL | —                   | UNIQUE · FK → `sales.id` | —          |
| `stage`                  | text        | NOT NULL | —                   | —                        | —          |
| `segment`                | text        | NOT NULL | `'all'`             | —                        | —          |
| `owner_id`               | uuid        | sim      | —                   | —                        | —          |
| `declared_probability`   | numeric     | NOT NULL | `0`                 | —                        | —          |
| `historical_win_rate`    | numeric     | NOT NULL | `0`                 | —                        | —          |
| `calibrated_probability` | numeric     | NOT NULL | `0`                 | —                        | —          |
| `calibration_delta`      | numeric     | sim      | —                   | —                        | —          |
| `confidence`             | text        | NOT NULL | `'low'`             | —                        | —          |
| `flag`                   | text        | NOT NULL | `'aligned'`         | —                        | —          |
| `sample_size`            | integer     | NOT NULL | `0`                 | —                        | —          |
| `computed_at`            | timestamptz | NOT NULL | `now()`             | —                        | —          |

### `winloss_alert_settings`

**RLS habilitada** · 3 policies: `Admins read winloss_alert_settings`, `Admins insert winloss_alert_settings`, `Admins update winloss_alert_settings`

| Coluna                 | Tipo        | Nulo     | Default             | Constraints          | Comentário |
| ---------------------- | ----------- | -------- | ------------------- | -------------------- | ---------- |
| `id`                   | uuid        | NOT NULL | `gen_random_uuid()` | PK                   | —          |
| `singleton`            | boolean     | NOT NULL | `true`              | UNIQUE               | —          |
| `consecutive_failures` | integer     | NOT NULL | `5`                 | —                    | —          |
| `retry_rate_threshold` | numeric     | NOT NULL | `0.5`               | —                    | —          |
| `window_minutes`       | integer     | NOT NULL | `30`                | —                    | —          |
| `min_deliveries`       | integer     | NOT NULL | `10`                | —                    | —          |
| `suppress_minutes`     | integer     | NOT NULL | `60`                | —                    | —          |
| `max_attempts`         | integer     | NOT NULL | `3`                 | —                    | —          |
| `updated_at`           | timestamptz | NOT NULL | `now()`             | —                    | —          |
| `updated_by`           | uuid        | sim      | —                   | FK → `auth.users.id` | —          |

### `winloss_webhook_alerts`

**RLS habilitada** · 1 policies: `admin read webhook alerts`

| Coluna            | Tipo        | Nulo     | Default             | Constraints                             | Comentário |
| ----------------- | ----------- | -------- | ------------------- | --------------------------------------- | ---------- |
| `id`              | uuid        | NOT NULL | `gen_random_uuid()` | PK                                      | —          |
| `subscription_id` | uuid        | NOT NULL | —                   | FK → `winloss_webhook_subscriptions.id` | —          |
| `kind`            | text        | NOT NULL | —                   | —                                       | —          |
| `details`         | jsonb       | NOT NULL | `'{}'::jsonb`       | —                                       | —          |
| `fired_at`        | timestamptz | NOT NULL | `now()`             | —                                       | —          |
| `request_id`      | uuid        | sim      | —                   | —                                       | —          |
| `suppressed`      | boolean     | NOT NULL | `false`             | —                                       | —          |
| `suppress_reason` | text        | sim      | —                   | —                                       | —          |

### `winloss_webhook_dead_letters`

**RLS habilitada** · 2 policies: `Admins can view dead letters`, `Admins can update dead letters`

| Coluna                   | Tipo        | Nulo     | Default             | Constraints                             | Comentário |
| ------------------------ | ----------- | -------- | ------------------- | --------------------------------------- | ---------- |
| `id`                     | UUID        | NOT NULL | `gen_random_uuid()` | PK                                      | —          |
| `subscription_id`        | UUID        | NOT NULL | —                   | FK → `winloss_webhook_subscriptions.id` | —          |
| `event`                  | TEXT        | NOT NULL | —                   | —                                       | —          |
| `payload`                | JSONB       | NOT NULL | —                   | —                                       | —          |
| `last_status`            | SMALLINT    | NOT NULL | —                   | —                                       | —          |
| `last_error`             | TEXT        | sim      | —                   | —                                       | —          |
| `attempts`               | SMALLINT    | NOT NULL | —                   | —                                       | —          |
| `total_latency_ms`       | INTEGER     | NOT NULL | —                   | —                                       | —          |
| `request_id`             | UUID        | sim      | —                   | —                                       | —          |
| `status`                 | TEXT        | NOT NULL | `'pending'`         | —                                       | —          |
| `replay_count`           | SMALLINT    | NOT NULL | `0`                 | —                                       | —          |
| `last_replay_at`         | TIMESTAMPTZ | sim      | —                   | —                                       | —          |
| `last_replay_status`     | SMALLINT    | sim      | —                   | —                                       | —          |
| `last_replay_error`      | TEXT        | sim      | —                   | —                                       | —          |
| `created_at`             | TIMESTAMPTZ | NOT NULL | `now()`             | —                                       | —          |
| `updated_at`             | TIMESTAMPTZ | NOT NULL | `now()`             | —                                       | —          |
| `last_replay_request_id` | uuid        | sim      | —                   | —                                       | —          |

### `winloss_webhook_deliveries`

**RLS habilitada** · 1 policies: `Admins read webhook deliveries`

| Coluna            | Tipo        | Nulo     | Default             | Constraints                             | Comentário |
| ----------------- | ----------- | -------- | ------------------- | --------------------------------------- | ---------- |
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK                                      | —          |
| `subscription_id` | UUID        | NOT NULL | —                   | FK → `winloss_webhook_subscriptions.id` | —          |
| `event`           | TEXT        | NOT NULL | —                   | —                                       | —          |
| `payload`         | JSONB       | NOT NULL | `'{}'::jsonb`       | —                                       | —          |
| `attempt`         | SMALLINT    | NOT NULL | —                   | —                                       | —          |
| `status`          | SMALLINT    | NOT NULL | `0`                 | —                                       | —          |
| `error_message`   | TEXT        | sim      | —                   | —                                       | —          |
| `duration_ms`     | INTEGER     | NOT NULL | `0`                 | —                                       | —          |
| `succeeded`       | BOOLEAN     | NOT NULL | `false`             | —                                       | —          |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | —                                       | —          |
| `request_id`      | UUID        | sim      | —                   | —                                       | —          |

### `winloss_webhook_dispatch_metrics`

**RLS habilitada** · 1 policies: `Admins can view dispatch metrics`

| Coluna                         | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------------------ | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`                           | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `metric`                       | text        | NOT NULL | —                   | —           | —          |
| `event`                        | text        | NOT NULL | —                   | —           | —          |
| `request_id`                   | text        | sim      | —                   | —           | —          |
| `active_subscriptions_count`   | integer     | NOT NULL | `0`                 | —           | —          |
| `matching_subscriptions_count` | integer     | NOT NULL | `0`                 | —           | —          |
| `metadata`                     | jsonb       | NOT NULL | `'{}'::jsonb`       | —           | —          |
| `created_at`                   | timestamptz | NOT NULL | `now()`             | —           | —          |

### `winloss_webhook_replay_audit`

**RLS habilitada** · 1 policies: `Admins/Managers can view replay audit`

| Coluna           | Tipo        | Nulo     | Default             | Constraints                            | Comentário |
| ---------------- | ----------- | -------- | ------------------- | -------------------------------------- | ---------- |
| `id`             | uuid        | NOT NULL | `gen_random_uuid()` | PK                                     | —          |
| `dead_letter_id` | uuid        | sim      | —                   | FK → `winloss_webhook_dead_letters.id` | —          |
| `delivery_id`    | uuid        | sim      | —                   | —                                      | —          |
| `source`         | text        | NOT NULL | —                   | —                                      | —          |
| `request_id`     | uuid        | NOT NULL | —                   | —                                      | —          |
| `actor_user_id`  | uuid        | NOT NULL | —                   | —                                      | —          |
| `actor_email`    | text        | sim      | —                   | —                                      | —          |
| `succeeded`      | boolean     | NOT NULL | —                   | —                                      | —          |
| `status_label`   | text        | NOT NULL | —                   | —                                      | —          |
| `http_status`    | integer     | NOT NULL | `0`                 | —                                      | —          |
| `error`          | text        | sim      | —                   | —                                      | —          |
| `attempts`       | integer     | sim      | —                   | —                                      | —          |
| `created_at`     | timestamptz | NOT NULL | `now()`             | —                                      | —          |

### `winloss_webhook_replay_invocations`

**RLS habilitada** · 1 policies: `Admins/Managers can view replay invocations`

| Coluna            | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ----------------- | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`              | uuid        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `request_id`      | text        | NOT NULL | —                   | —           | —          |
| `actor_user_id`   | uuid        | NOT NULL | —                   | —           | —          |
| `actor_email`     | text        | sim      | —                   | —           | —          |
| `source`          | text        | NOT NULL | —                   | —           | —          |
| `item_count`      | integer     | NOT NULL | `0`                 | —           | —          |
| `succeeded_count` | integer     | NOT NULL | `0`                 | —           | —          |
| `failed_count`    | integer     | NOT NULL | `0`                 | —           | —          |
| `skipped_count`   | integer     | NOT NULL | `0`                 | —           | —          |
| `duration_ms`     | integer     | sim      | —                   | —           | —          |
| `ids`             | uuid[]      | NOT NULL | `'{}'`              | —           | —          |
| `created_at`      | timestamptz | NOT NULL | `now()`             | —           | —          |

### `winloss_webhook_subscriptions`

**RLS habilitada** · 1 policies: `admin manage webhooks`

| Coluna             | Tipo        | Nulo     | Default                    | Constraints | Comentário |
| ------------------ | ----------- | -------- | -------------------------- | ----------- | ---------- |
| `id`               | UUID        | NOT NULL | `gen_random_uuid()`        | PK          | —          |
| `url`              | TEXT        | NOT NULL | —                          | —           | —          |
| `events`           | TEXT[]      | NOT NULL | `ARRAY['critical_pattern'` | —           | —          |
| `active`           | BOOLEAN     | NOT NULL | `true`                     | —           | —          |
| `secret`           | TEXT        | sim      | —                          | —           | —          |
| `last_dispatch_at` | TIMESTAMPTZ | sim      | —                          | —           | —          |
| `last_status`      | INT         | sim      | —                          | —           | —          |
| `created_by`       | UUID        | NOT NULL | —                          | —           | —          |
| `created_at`       | TIMESTAMPTZ | NOT NULL | `now()`                    | —           | —          |

### `workflow_executions`

**RLS habilitada** · 3 policies: `Admins view all executions`, `Admins update executions`, `Users insert own executions`

| Coluna          | Tipo        | Nulo     | Default             | Constraints         | Comentário |
| --------------- | ----------- | -------- | ------------------- | ------------------- | ---------- |
| `id`            | UUID        | NOT NULL | `gen_random_uuid()` | PK                  | —          |
| `workflow_id`   | UUID        | NOT NULL | —                   | FK → `workflows.id` | —          |
| `triggered_by`  | UUID        | sim      | —                   | —                   | —          |
| `status`        | TEXT        | NOT NULL | `'pending'`         | —                   | —          |
| `input_payload` | JSONB       | sim      | `'{}'::jsonb`       | —                   | —          |
| `step_log`      | JSONB       | NOT NULL | `'[]'::jsonb`       | —                   | —          |
| `error_message` | TEXT        | sim      | —                   | —                   | —          |
| `duration_ms`   | INTEGER     | sim      | —                   | —                   | —          |
| `started_at`    | TIMESTAMPTZ | NOT NULL | `now()`             | —                   | —          |
| `finished_at`   | TIMESTAMPTZ | sim      | —                   | —                   | —          |

### `workflow_rules`

**RLS habilitada** · 1 policies: `Users can manage own workflow rules`

| Coluna             | Tipo        | Nulo     | Default             | Constraints           | Comentário |
| ------------------ | ----------- | -------- | ------------------- | --------------------- | ---------- |
| `id`               | UUID        | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `name`             | TEXT        | NOT NULL | —                   | —                     | —          |
| `description`      | TEXT        | sim      | —                   | —                     | —          |
| `trigger_type`     | TEXT        | NOT NULL | `'deal_stagnant'`   | —                     | —          |
| `trigger_config`   | JSONB       | NOT NULL | `'{}'`              | —                     | —          |
| `action_type`      | TEXT        | NOT NULL | `'create_task'`     | —                     | —          |
| `action_config`    | JSONB       | NOT NULL | `'{}'`              | —                     | —          |
| `is_active`        | BOOLEAN     | NOT NULL | `true`              | —                     | —          |
| `salesperson_id`   | UUID        | sim      | —                   | FK → `salespeople.id` | —          |
| `executions_count` | INTEGER     | NOT NULL | `0`                 | —                     | —          |
| `last_executed_at` | TIMESTAMPTZ | sim      | —                   | —                     | —          |
| `created_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |
| `updated_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —                     | —          |

### `workflows`

**RLS habilitada** · 2 policies: `Admins/managers can manage workflows`, `Authenticated can view active workflows`

| Coluna             | Tipo        | Nulo     | Default             | Constraints | Comentário |
| ------------------ | ----------- | -------- | ------------------- | ----------- | ---------- |
| `id`               | UUID        | NOT NULL | `gen_random_uuid()` | PK          | —          |
| `name`             | TEXT        | NOT NULL | —                   | —           | —          |
| `description`      | TEXT        | sim      | —                   | —           | —          |
| `trigger_type`     | TEXT        | NOT NULL | `'manual'`          | —           | —          |
| `trigger_config`   | JSONB       | NOT NULL | `'{}'::jsonb`       | —           | —          |
| `nodes`            | JSONB       | NOT NULL | `'[]'::jsonb`       | —           | —          |
| `edges`            | JSONB       | NOT NULL | `'[]'::jsonb`       | —           | —          |
| `is_active`        | BOOLEAN     | NOT NULL | `false`             | —           | —          |
| `execution_count`  | INTEGER     | NOT NULL | `0`                 | —           | —          |
| `last_executed_at` | TIMESTAMPTZ | sim      | —                   | —           | —          |
| `created_by`       | UUID        | sim      | —                   | —           | —          |
| `created_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |
| `updated_at`       | TIMESTAMPTZ | NOT NULL | `now()`             | —           | —          |

### `xp_adjustments`

**RLS habilitada** · 2 policies: `Admin can view xp adjustments`, `Admin can insert xp adjustments`

| Coluna                  | Tipo        | Nulo     | Default             | Constraints                | Comentário |
| ----------------------- | ----------- | -------- | ------------------- | -------------------------- | ---------- |
| `id`                    | UUID        | NOT NULL | `gen_random_uuid()` | PK                         | —          |
| `user_id`               | UUID        | NOT NULL | —                   | —                          | —          |
| `amount`                | INTEGER     | NOT NULL | —                   | —                          | —          |
| `reason`                | TEXT        | NOT NULL | —                   | —                          | —          |
| `source`                | TEXT        | NOT NULL | `'manual'`          | —                          | —          |
| `related_assignment_id` | UUID        | sim      | —                   | FK → `task_assignments.id` | —          |
| `adjusted_by`           | UUID        | NOT NULL | —                   | —                          | —          |
| `created_at`            | TIMESTAMPTZ | NOT NULL | `now()`             | —                          | —          |

### `xp_history`

**RLS habilitada** · 2 policies: `Users can insert own xp_history`, `Users can read own xp_history`

| Coluna           | Tipo                     | Nulo     | Default             | Constraints           | Comentário |
| ---------------- | ------------------------ | -------- | ------------------- | --------------------- | ---------- |
| `id`             | UUID                     | NOT NULL | `gen_random_uuid()` | PK                    | —          |
| `salesperson_id` | UUID                     | NOT NULL | —                   | FK → `salespeople.id` | —          |
| `xp_amount`      | INTEGER                  | NOT NULL | —                   | —                     | —          |
| `source_type`    | TEXT                     | NOT NULL | —                   | —                     | —          |
| `description`    | TEXT                     | sim      | —                   | —                     | —          |
| `created_at`     | TIMESTAMP WITH TIME ZONE | NOT NULL | `now()`             | —                     | —          |
