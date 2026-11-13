# 11 · GLOSSÁRIO, DADOS DE REFERÊNCIA E LACUNAS

> Gerado automaticamente por AI Context Sync v1.3.2 · commit `c0af40180b` · branch `main` · 2026-11-13 17:03 UTC
> Não edite à mão — regras humanas vão em `manual/`.

## Glossário do domínio (entidades do sistema)

| Termo | Significado / valores | Tamanho | Origem |
|---|---|---|---|
| `_internal_secrets` | _(sem COMMENT ON TABLE — significado não documentado)_ | 3 colunas | types.ts |
| `ab_tests` | _(sem COMMENT ON TABLE — significado não documentado)_ | 2 colunas | migration |
| `access_denied_logs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `account_activities` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `account_contacts` | _(sem COMMENT ON TABLE — significado não documentado)_ | 18 colunas | migration |
| `account_plans` | _(sem COMMENT ON TABLE — significado não documentado)_ | 16 colunas | migration |
| `accounts` | _(sem COMMENT ON TABLE — significado não documentado)_ | 22 colunas | migration |
| `achievements` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `active_power_ups` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `active_sessions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `activities` | _(sem COMMENT ON TABLE — significado não documentado)_ | 16 colunas | migration |
| `activity_audit_logs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `activity_goals` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `agenda_events` | _(sem COMMENT ON TABLE — significado não documentado)_ | 14 colunas | migration |
| `ai_agent_actions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `ai_agent_runs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 15 colunas | migration |
| `ai_narrative_cache` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `ai_sales_insights` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `api_tokens` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `app_config` | Configuração de aplicação org-wide (SLA, XP, SLO burn-rate, etc). Chave estável, valor JSONB. | 4 colunas | migration |
| `approval_decisions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `approval_requests` | _(sem COMMENT ON TABLE — significado não documentado)_ | 15 colunas | migration |
| `approval_workflows` | _(sem COMMENT ON TABLE — significado não documentado)_ | 14 colunas | migration |
| `asset_usage_logs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `audit_log` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `audit_logs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 18 colunas | migration |
| `auto_task_queue_settings` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `automation_runs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `automation_workflows` | _(sem COMMENT ON TABLE — significado não documentado)_ | 13 colunas | migration |
| `available_spins` | _(sem COMMENT ON TABLE — significado não documentado)_ | 4 colunas | migration |
| `battle_participants` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `bitrix24_sync_logs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `blocked_ips` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `buying_committee` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `buying_committee_members` | _(sem COMMENT ON TABLE — significado não documentado)_ | 13 colunas | migration |
| `buying_signals` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `cadence_ab_assignments` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `cadence_ab_tests` | _(sem COMMENT ON TABLE — significado não documentado)_ | 14 colunas | migration |
| `cadence_advanced_stats` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `cadence_alert_templates` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `cadence_enrollment_rules` | _(sem COMMENT ON TABLE — significado não documentado)_ | 14 colunas | migration |
| `cadence_funnel_rules` | _(sem COMMENT ON TABLE — significado não documentado)_ | 13 colunas | migration |
| `cadence_outcome_rules` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `cadence_steps` | _(sem COMMENT ON TABLE — significado não documentado)_ | 15 colunas | migration |
| `cadence_tasks` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `cadences` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `call_coaching_scorecards` | _(sem COMMENT ON TABLE — significado não documentado)_ | 15 colunas | migration |
| `call_conversation_metrics` | _(sem COMMENT ON TABLE — significado não documentado)_ | 14 colunas | migration |
| `call_critical_moments` | _(sem COMMENT ON TABLE — significado não documentado)_ | 13 colunas | migration |
| `call_insights` | _(sem COMMENT ON TABLE — significado não documentado)_ | 15 colunas | migration |
| `call_intelligence_triggers` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `call_logs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `call_metric_benchmarks` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `call_objection_analysis` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `call_objections` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `call_question_analysis` | _(sem COMMENT ON TABLE — significado não documentado)_ | 14 colunas | migration |
| `call_questions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `call_recording_ingest_jobs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 16 colunas | migration |
| `call_recordings` | _(sem COMMENT ON TABLE — significado não documentado)_ | 33 colunas | migration |
| `call_sentiment_timeline` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `call_tracking` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `call_transcripts` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `campaign_health_alerts` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `category_metrics` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `challenge_progress` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `channel_credentials` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `channel_interactions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `chat_conversations` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `chat_messages` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `churn_alert_settings` | _(sem COMMENT ON TABLE — significado não documentado)_ | 16 colunas | migration |
| `circuit_breaker_events` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `client_churn_alerts_state` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `client_interactions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `client_portfolio` | _(sem COMMENT ON TABLE — significado não documentado)_ | 15 colunas | migration |
| `client_renewals` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `clients` | _(sem COMMENT ON TABLE — significado não documentado)_ | 22 colunas | migration |
| `coaching_actions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 14 colunas | migration |
| `coaching_opportunities` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `coaching_scorecard_config` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `coaching_sessions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 14 colunas | migration |
| `coaching_skill_benchmarks` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `cohort_analyses` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `collectible_badges` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `combo_tracking` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `commercial_approval_requests` | _(sem COMMENT ON TABLE — significado não documentado)_ | 14 colunas | migration |
| `commission_bonus_awards` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `commission_bonuses` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `commission_rules` | _(sem COMMENT ON TABLE — significado não documentado)_ | 13 colunas | migration |
| `commissions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 17 colunas | migration |
| `committee_coverage_history` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `committee_extraction_runs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `competitive_chat_messages` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `competitive_seasons` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `competitor_mentions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `competitors_pricing` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `competitors_registry` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `consent_records` | _(sem COMMENT ON TABLE — significado não documentado)_ | 13 colunas | migration |
| `contact_engagement_score` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `contact_send_time_profile` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `conversation_analyses` | _(sem COMMENT ON TABLE — significado não documentado)_ | 15 colunas | migration |
| `critical_moment_notifications` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `cron_failure_alerts` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `cs_tickets` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `csat_ces_surveys` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `custom_reports` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `daily_challenge_progress` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `daily_challenge_rotations` | _(sem COMMENT ON TABLE — significado não documentado)_ | 2 colunas | migration |
| `daily_challenges` | _(sem COMMENT ON TABLE — significado não documentado)_ | 15 colunas | migration |
| `daily_metrics` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `daily_streak_achievements` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `dashboard_layouts` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `data_access_log` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `data_retention_policies` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `data_subject_requests` | _(sem COMMENT ON TABLE — significado não documentado)_ | 16 colunas | migration |
| `db_rollback_snapshots` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `dead_letter_replay_audit` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `deal_chat_history` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `deal_committee_coverage` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `deal_health_history` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `deal_health_scores` | _(sem COMMENT ON TABLE — significado não documentado)_ | 16 colunas | migration |
| `deal_outcomes` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `deal_probability_scores` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `deal_risk_signals` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `deal_stage_history` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `deal_stage_transitions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `deal_stakeholders` | _(sem COMMENT ON TABLE — significado não documentado)_ | 20 colunas | migration |
| `deal_velocity_alerts` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `deal_velocity_predictions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 17 colunas | migration |
| `deals` | _(sem COMMENT ON TABLE — significado não documentado)_ | 1 colunas | migration |
| `demand_forecasts` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `dialer_queue_items` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `dialer_queues` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `digital_signatures` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `document_signers` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `duplicate_block_logs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `edge_call_failures` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `edge_job_locks` | _(sem COMMENT ON TABLE — significado não documentado)_ | 3 colunas | migration |
| `edge_retry_events` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `email_bulk_drafts` | _(sem COMMENT ON TABLE — significado não documentado)_ | 19 colunas | migration |
| `email_bulk_jobs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `email_engagement_score_history` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `email_engagement_scores` | _(sem COMMENT ON TABLE — significado não documentado)_ | 15 colunas | migration |
| `email_logs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `email_opt_outs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `email_tracking_events` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `embedded_report_tokens` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `engagement_score_history` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `enriched_company_intelligence` | _(sem COMMENT ON TABLE — significado não documentado)_ | 14 colunas | migration |
| `entity_versions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `error_logs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `executive_briefings` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `expansion_opportunities` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `expansion_playbooks` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `experiment_assignments` | _(sem COMMENT ON TABLE — significado não documentado)_ | 4 colunas | migration |
| `experiment_variants` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `experiments` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `external_seller_map` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `feature_flags` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `feed_comments` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `feed_reactions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `follow_up_audit_logs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `follow_up_notifications` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `follow_up_settings` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `follow_up_templates` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `follow_up_territory_rules` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `forecast_accuracy` | _(sem COMMENT ON TABLE — significado não documentado)_ | 16 colunas | migration |
| `forecast_confidence_scores` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `forecast_deal_contributions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `forecast_narrative_dead_letters` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `forecast_snapshots` | _(sem COMMENT ON TABLE — significado não documentado)_ | 21 colunas | migration |
| `geo_access_logs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | types.ts |
| `geo_blocked_regions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | types.ts |
| `geocode_cache` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `icp_data` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `icp_parameters` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `inbound_reply_events` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `integration_autotest_jobs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `integration_autotest_settings` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `integration_connections` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `integration_health_checks` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `integration_logs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `integration_secret_refs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `intent_audit_logs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `inventory_levels` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `ip_whitelist` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `known_devices` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `kudos` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `lead_assignments` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `lead_churn_risk` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `lead_detailed_logs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `lead_intelligence_metrics` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `lead_routing_log` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `lead_routing_rules` | _(sem COMMENT ON TABLE — significado não documentado)_ | 15 colunas | migration |
| `lead_score_explanations` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `lead_score_history` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `lead_score_trends` | _(sem COMMENT ON TABLE — significado não documentado)_ | 4 colunas | migration |
| `lead_scores` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `lead_source_configs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `league_history` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `league_members` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `leagues` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `login_alerts` | _(sem COMMENT ON TABLE — significado não documentado)_ | 13 colunas | migration |
| `login_attempts` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `maintenance_log` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `message_templates` | _(sem COMMENT ON TABLE — significado não documentado)_ | 13 colunas | migration |
| `mfa_verification_attempts` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `migration_log` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `monthly_sales_summary` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `mood_entries` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `mql_qualifications` | _(sem COMMENT ON TABLE — significado não documentado)_ | 15 colunas | migration |
| `notification_preferences` | _(sem COMMENT ON TABLE — significado não documentado)_ | 23 colunas | migration |
| `notifications` | _(sem COMMENT ON TABLE — significado não documentado)_ | 17 colunas | migration |
| `nps_surveys` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `objection_library` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `objections_library` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `onboarding_journeys` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `onboarding_steps` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `order_items` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `order_status_events` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `orders` | _(sem COMMENT ON TABLE — significado não documentado)_ | 15 colunas | migration |
| `outbound_messages` | _(sem COMMENT ON TABLE — significado não documentado)_ | 18 colunas | migration |
| `page_analytics` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `password_history` | _(sem COMMENT ON TABLE — significado não documentado)_ | 4 colunas | migration |
| `password_reset_requests` | _(sem COMMENT ON TABLE — significado não documentado)_ | 13 colunas | migration |
| `performance_bets` | _(sem COMMENT ON TABLE — significado não documentado)_ | 13 colunas | migration |
| `performance_impact_factors` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `permissions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `person_intelligence` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `personal_assistant_briefings` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `personal_assistant_nudges` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `pipeline_coverage_recommendations` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `pipeline_coverage_snapshots` | _(sem COMMENT ON TABLE — significado não documentado)_ | 16 colunas | migration |
| `pipeline_inspection_snapshots` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `pipeline_inspections` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `pipeline_stages` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `pipelines` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `plan_rollback_ddl` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | types.ts |
| `playbook_items` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `playbook_progress` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `playbooks` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `portfolio_settings` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `price_alerts` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `price_history` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `price_protection_rules` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `pricing_rules` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `prize_wheel_spins` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `product_stock_log` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `product_usage` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `product_usage_events` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `product_usage_summary` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `products` | _(sem COMMENT ON TABLE — significado não documentado)_ | 18 colunas | migration |
| `progressive_goals` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `prospect_cadences` | _(sem COMMENT ON TABLE — significado não documentado)_ | 17 colunas | migration |
| `push_subscriptions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `qbr_reports` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `qbr_schedule` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `query_telemetry` | _(sem COMMENT ON TABLE — significado não documentado)_ | 13 colunas | migration |
| `quota_attainment_actions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `quota_attainment_alerts` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `quota_attainment_forecasts` | _(sem COMMENT ON TABLE — significado não documentado)_ | 16 colunas | migration |
| `quota_attainment_predictions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 23 colunas | migration |
| `quote_conversion_audit` | _(sem COMMENT ON TABLE — significado não documentado)_ | 16 colunas | migration |
| `quote_items` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `quote_sync_inbound_log` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `quote_sync_logs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `quotes` | _(sem COMMENT ON TABLE — significado não documentado)_ | 43 colunas | migration |
| `quotes_inbound` | _(sem COMMENT ON TABLE — significado não documentado)_ | 17 colunas | migration |
| `race_badges` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `race_cars` | _(sem COMMENT ON TABLE — significado não documentado)_ | 14 colunas | migration |
| `race_daily_snapshots` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `race_events` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `race_overlay_telemetry` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `race_powerups` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `race_reactions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `race_rivalries_persistent` | _(sem COMMENT ON TABLE — significado não documentado)_ | 6 colunas | migration |
| `race_scoring_rules` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `race_seasons` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `race_team_members` | _(sem COMMENT ON TABLE — significado não documentado)_ | 4 colunas | migration |
| `race_teams` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `race_unlocks` | _(sem COMMENT ON TABLE — significado não documentado)_ | 4 colunas | migration |
| `race_user_daily_checkins` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `race_user_preferences` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `rank_change_notifications` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `ranking_notifications` | _(sem COMMENT ON TABLE — significado não documentado)_ | 11 colunas | migration |
| `rate_limit_logs` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `rate_limit_settings` | _(sem COMMENT ON TABLE — significado não documentado)_ | 8 colunas | migration |
| `reauthentication_requests` | _(sem COMMENT ON TABLE — significado não documentado)_ | 9 colunas | migration |
| `renewals` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `report_embed_tokens` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `report_executions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| `report_schedules` | _(sem COMMENT ON TABLE — significado não documentado)_ | 14 colunas | migration |
| `revenue_forecasts` | _(sem COMMENT ON TABLE — significado não documentado)_ | 19 colunas | migration |
| `role_permissions` | _(sem COMMENT ON TABLE — significado não documentado)_ | 4 colunas | migration |
| `sale_notifications_audit` | _(sem COMMENT ON TABLE — significado não documentado)_ | 14 colunas | migration |
| `sales` | _(sem COMMENT ON TABLE — significado não documentado)_ | 49 colunas | migration |
| `sales_battles` | _(sem COMMENT ON TABLE — significado não documentado)_ | 12 colunas | migration |
| `sales_enablement_assets` | _(sem COMMENT ON TABLE — significado não documentado)_ | 14 colunas | migration |
| `sales_goals` | _(sem COMMENT ON TABLE — significado não documentado)_ | 5 colunas | migration |
| `sales_streaks` | _(sem COMMENT ON TABLE — significado não documentado)_ | 7 colunas | migration |
| `sales_territories` | _(sem COMMENT ON TABLE — significado não documentado)_ | 10 colunas | migration |
| … +314 linhas — lista completa em `context.json` | | | |

## Dados de referência (seed — planos, categorias, perfis fixos)

| Tabela | Colunas | Valores | Origem |
|---|---|---|---|
| `feature_flags` | `key, description, is_enabled, rollout_percentage` | `('race_smart_notifications', 'Kill-switch das notificações contextuais da Arena (rival ultrapassou, perto do pódio, última hora)', true, 100) ON CONFLICT (key) DO NOTHING` | `supabase/migrations/20261002000000_seed_race_smart_notifications_flag.sql` |
| `auth.users` | `id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at` | `( '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin.seed@promobrindes.test', crypt('Password123!', gen_salt('bf')), '2026-01-01 00:00:00+00', '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, '2026-01-01 00:00:00+00', '2026-01-01 00:00:00+00' ) ON CONFLICT (id) DO NOTHING` | `supabase/seed.sql` |
| `auth.identities` | `id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at` | `( '00000000-0000-0000-0000-0000000000a1', 'admin.seed@promobrindes.test', '00000000-0000-0000-0000-000000000001', '{"sub":"00000000-0000-0000-0000-000000000001","email":"admin.seed@promobrindes.test"}'::jsonb, 'email', '2026-01-01 00:00:00+00', '2026-01-01 00:00:00+00', '2026-01-01 00:00:00+00' ) ON CONFLICT (id) DO NOTHING` | `supabase/seed.sql` |
| `user_roles` | `id, user_id, role, created_at, updated_at` | `( '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'admin', '2026-01-01 00:00:00+00', '2026-01-01 00:00:00+00' ) ON CONFLICT DO NOTHING` | `supabase/seed.sql` |
| `salespeople` | `id, name, email, avatar_url, created_at, updated_at` | `( '00000000-0000-0000-0000-000000000020', 'Admin Seed', 'admin.seed@promobrindes.test', NULL, '2026-01-01 00:00:00+00', '2026-01-01 00:00:00+00' ) ON CONFLICT (id) DO NOTHING` | `supabase/seed.sql` |
| `pipelines` | `id, name, description, color, icon, is_active, display_order, created_at, updated_at` | `( '00000000-0000-0000-0000-000000000100', 'Pipeline Comercial', 'Pipeline padrão de vendas (seed)', 'bg-blue-500', 'kanban', true, 0, '2026-01-01 00:00:00+00', '2026-01-01 00:00:00+00' ) ON CONFLICT (id) DO NOTHING` | `supabase/seed.sql` |
| `pipeline_stages` | `id, pipeline_id, name, label, color, stage_order, probability, is_final, created_at` | `('00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000100', 'prospeccao', 'Prospecção', 'bg-slate-500', 1, 10, false, '2026-01-01 00:00:00+00'), ('00000000-0000-0000-0000-000000000120', '00000000-0000-0000-0000-000000000100', 'qualificacao','Qualificação', 'bg-blue-500', 2, 25, false, '2026-01-01 00:00:00+00'), ('00000000-0000-0000-0000-000000000130', '00000000-0000-0000-0000- …` | `supabase/seed.sql` |
| `clients` | `id, name, email, phone, company, total_value, created_at, updated_at` | `('00000000-0000-0000-0000-000000000201', 'Cliente Seed Alfa', 'alfa@cliente-seed.test', '+5511999000001', 'Alfa Brindes LTDA', 12500.00, '2026-01-01 00:00:00+00', '2026-01-01 00:00:00+00'), ('00000000-0000-0000-0000-000000000202', 'Cliente Seed Beta', 'beta@cliente-seed.test', '+5511999000002', 'Beta Promoções SA', 8300.00, '2026-01-01 00:00:00+00', '2026-01-01 00:00:00+00'), ('00000000-0000-0000- …` | `supabase/seed.sql` |
| `sales` | `id, client_name, product_name, amount, status, category, created_at, updated_at` | `('00000000-0000-0000-0000-000000000301', 'Cliente Seed Alfa', 'Kit Brindes Corporativo', 12500.00, 'completed', 'service', '2026-01-10 00:00:00+00', '2026-01-10 00:00:00+00'), ('00000000-0000-0000-0000-000000000302', 'Cliente Seed Beta', 'Brindes Evento Anual', 8300.00, 'pending', 'project', '2026-01-15 00:00:00+00', '2026-01-15 00:00:00+00'), ('00000000-0000-0000-0000-000000000303', 'Cliente Seed …` | `supabase/seed.sql` |

## Auditoria de consistência (código × schema) — trate como NÃO VERIFICADO

> `status`: inclui estados só de UI/realtime (ex.: `uploading`, `SUBSCRIBED`) que nunca vão ao banco — confira o arquivo antes de concluir que falta valor no enum.

| Tipo | Problema | Onde |
|---|---|---|
| status | valor `erro` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/admin/AdminSystemStatus.tsx` |
| status | valor `pendente` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/admin/AdminSystemStatus.tsx` |
| status | valor `inativo` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/admin/AdminSystemStatus.tsx` |
| status | valor `fail` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/admin/connections/SmokeTestChecklist.tsx`<br>`compara:src/components/admin/connections/smokeTestHelpers.ts`<br>`escreve:src/components/admin/connections/SmokeTestChecklist.tsx` |
| status | valor `online` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:src/components/arena/ArenaStatusBadge.tsx` |
| status | valor `closed_won` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/assistant/DealPreviewCard.tsx`<br>`compara:src/components/assistant/dealRiskCalculator.ts` |
| status | valor `closed_lost` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/assistant/DealPreviewCard.tsx`<br>`compara:src/components/assistant/dealRiskCalculator.ts` |
| status | valor `overdue` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:src/components/bi/ChurnTaskCompletionCard.tsx` |
| status | valor `Pendente` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:src/components/customer-success/CustomerSuccess360Hub.tsx` |
| status | valor `Cancelado` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:src/components/customer-success/CustomerSuccess360Hub.tsx` |
| status | valor `SUBSCRIBED` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/lead-scoring/LeadScoringDashboard.tsx` |
| status | valor `CHANNEL_ERROR` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/lead-scoring/LeadScoringDashboard.tsx` |
| status | valor `breached` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/pipeline/SLADashboard.tsx`<br>`compara:src/hooks/useDealSLAs.ts` |
| status | valor `Blocked` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/purchase-intelligence/DuplicateBlockAudit.tsx` |
| status | valor `no-data` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/race/GhostCar.tsx`<br>`compara:src/components/race/GhostStatusBadge.tsx`<br>`escreve:src/hooks/race/useGhostCar.ts` |
| status | valor `behind` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/race/GhostStatusBadge.tsx` |
| status | valor `unqualified` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/sdr/MQLQualificationForm.tsx` |
| status | valor `verified` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/hooks/useMFA.ts` |
| status | valor `Proposta` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/hooks/useNextBestAction.ts` |
| status | valor `ativo` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:src/hooks/useProducts.ts` |
| status | valor `passed` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/pages/RetryTestStatusPage.tsx`<br>`compara:supabase/functions/run-retry-tests/index.ts`<br>`escreve:src/hooks/useRetryTestRun.ts`<br>`escreve:supabase/functions/run-retry-tests/index.ts` |
| status | valor `fired` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/hooks/win-loss/useWebhookAlertHistory.ts` |
| status | valor `suppressed` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/hooks/win-loss/useWebhookAlertHistory.ts` |
| status | valor `attempted` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:src/pages/FollowUpInteligente.tsx` |
| status | valor `abandoned` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/pages/RelatoriosExecutivos.tsx` |
| status | valor `violated` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/pages/SLATrackingPage.tsx` |
| status | valor `meta` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/pages/admin/AdminPlatformSLOPage.tsx` |
| status | valor `abaixo` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:src/pages/admin/AdminPlatformSLOPage.tsx` |
| status | valor `etapa_inexistente` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/_shared/deal-probability-calc_test.ts` |
| status | valor `identified` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:supabase/functions/customer-success-360/index.ts`<br>`escreve:supabase/functions/expansion-detector/index.ts`<br>`filtra:supabase/functions/expansion-detector/index.ts` |
| status | valor `proposed` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:supabase/functions/customer-success-360/index.ts` |
| status | valor `unknown_xyz` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/detect-winloss-at-risk/breakdown_invariants_test.ts` |
| status | valor `totally_unknown` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/detect-winloss-at-risk/breakdown_invariants_test.ts` |
| status | valor `Vendido` para `status` usado no código não existe em nenhum enum do banco/TS | `filtra:supabase/functions/dialer-queue-builder/index.ts` |
| status | valor `Perdido` para `status` usado no código não existe em nenhum enum do banco/TS | `filtra:supabase/functions/dialer-queue-builder/index.ts` |
| status | valor `sending` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/email-bulk-send/index.ts` |
| status | valor `generating` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/email-composer-bulk/index.ts` |
| status | valor `very_slow` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:supabase/functions/external-db-bridge/index.ts` |
| status | valor `Fechado` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:supabase/functions/pricing-intelligence/index.ts` |
| status | valor `fulfilled` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:supabase/functions/process-call-recording-ingest/index.ts`<br>`compara:supabase/functions/send-push-notification/index.ts` |
| status | valor `server_misconfigured` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/receive-quote-sync/index.ts` |
| status | valor `invalid_signature` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/receive-quote-sync/index.ts` |
| status | valor `invalid_json` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/receive-quote-sync/index.ts` |
| status | valor `event_required` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/receive-quote-sync/index.ts` |
| status | valor `correlation_key_required` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/receive-quote-sync/index.ts` |
| status | valor `data_required` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/receive-quote-sync/index.ts` |
| status | valor `external_quote_id_required` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/receive-quote-sync/index.ts` |
| status | valor `duplicate_ignored` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/receive-quote-sync/index.ts` |
| status | valor `dedupe_failed` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/receive-quote-sync/index.ts` |
| status | valor `lookup_failed` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/receive-quote-sync/index.ts` |
| status | valor `upsert_failed` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/receive-quote-sync/index.ts` |
| status | valor `secret_not_configured` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/receive-quote-sync/index.ts` |
| status | valor `hmac_missing` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/receive-quote-sync/index.ts` |
| status | valor `hmac_mismatch` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/receive-quote-sync/index.ts` |
| status | valor `invalid_payload` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/receive-quote-sync/index.ts` |
| status | valor `missing_signature` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/receive-quote-sync/index.ts` |
| status | valor `string` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:supabase/functions/receive-quote-sync/index.ts` |
| status | valor `transcribed` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/transcribe-call-recording/index.ts` |
| status | valor `no-answer` para `status` usado no código não existe em nenhum enum do banco/TS | `compara:supabase/functions/twilio-call-status/index.ts` |
| status | valor `initiated` para `status` usado no código não existe em nenhum enum do banco/TS | `escreve:supabase/functions/twilio-click-to-call/index.ts` |
| status | valor `Qualificação` para `stage` usado no código não existe em nenhum enum do banco/TS | `escreve:src/components/analytics/ClosingTimeChart.tsx` |
| status | valor `Proposta` para `stage` usado no código não existe em nenhum enum do banco/TS | `escreve:src/components/analytics/ClosingTimeChart.tsx`<br>`escreve:src/hooks/bi/useBISDRTransformers.ts`<br>`escreve:src/hooks/sdr/useProspectingFunnel.ts`<br>`escreve:src/hooks/useCloserMetrics.ts` |
| status | valor `Negociação` para `stage` usado no código não existe em nenhum enum do banco/TS | `escreve:src/components/analytics/ClosingTimeChart.tsx`<br>`escreve:src/hooks/sdr/useProspectingFunnel.ts`<br>`escreve:src/hooks/useCloserMetrics.ts`<br>`escreve:src/hooks/useSDRMetrics.ts` |
| status | valor `Fechamento` para `stage` usado no código não existe em nenhum enum do banco/TS | `escreve:src/components/analytics/ClosingTimeChart.tsx` |
| status | valor `Fechados` para `stage` usado no código não existe em nenhum enum do banco/TS | `escreve:src/hooks/bi/useBISDRTransformers.ts`<br>`escreve:src/hooks/sdr/useProspectingFunnel.ts`<br>`escreve:src/hooks/useCloserMetrics.ts`<br>`escreve:src/hooks/useSDRMetrics.ts` |
| status | valor `Leads` para `stage` usado no código não existe em nenhum enum do banco/TS | `escreve:src/hooks/sdr/useProspectingFunnel.ts`<br>`escreve:src/hooks/useSDRMetrics.ts` |
| status | valor `Qualificados` para `stage` usado no código não existe em nenhum enum do banco/TS | `escreve:src/hooks/bi/useBISDRTransformers.ts`<br>`escreve:src/hooks/sdr/useProspectingFunnel.ts`<br>`escreve:src/hooks/useSDRMetrics.ts` |
| status | valor `string` para `stage` usado no código não existe em nenhum enum do banco/TS | `compara:supabase/functions/nlq-query/queryResolvers.ts` |
| status | valor `GO` para `step` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/race/RaceCountdown.tsx` |
| status | valor `upload` para `step` usado no código não existe em nenhum enum do banco/TS | `compara:src/pages/ImportExport.tsx` |
| status | valor `mapping` para `step` usado no código não existe em nenhum enum do banco/TS | `compara:src/pages/ImportExport.tsx` |
| status | valor `preview` para `step` usado no código não existe em nenhum enum do banco/TS | `compara:src/pages/ImportExport.tsx` |
| status | valor `any` para `trigger_stage` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/cadences/EnrollmentRulesDialog.tsx`<br>`escreve:src/components/cadences/EnrollmentRulesDialog.tsx` |
| status | valor `collapsed` para `state` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/organisms/AppSidebar.tsx`<br>`compara:src/components/ui/sidebar.tsx` |
| status | valor `expanded` para `state` usado no código não existe em nenhum enum do banco/TS | `escreve:src/components/ui/sidebar.tsx` |
| status | valor `unblocked` para `state` usado no código não existe em nenhum enum do banco/TS | `escreve:src/hooks/useFormGuard.ts` |
| status | valor `suspended` para `state` usado no código não existe em nenhum enum do banco/TS | `compara:src/hooks/race/useRaceSounds.ts` |
| status | valor `activated` para `state` usado no código não existe em nenhum enum do banco/TS | `compara:src/lib/swUpdater.ts` |
| status | valor `lighting` para `phase` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/race/StartLights.tsx` |
| status | valor `go` para `phase` usado no código não existe em nenhum enum do banco/TS | `compara:src/components/race/StartLights.tsx` |
| status | valor `unresolved` para `resolution_status` usado no código não existe em nenhum enum do banco/TS | `compara:supabase/functions/analyze-objection-handling/index.ts` |
| status | valor `injected` para `lovable_browser_auth_status` usado no código não existe em nenhum enum do banco/TS | `compara:tests/a11y/routes.ts` |
| coluna | coluna `deal_name` usada no código não existe no schema de `sales` |  |
| coluna | coluna `lost_reason` usada no código não existe no schema de `sales` |  |
| coluna | coluna `next_action` usada no código não existe no schema de `sales` |  |
| coluna | coluna `score` usada no código não existe no schema de `sales` |  |
| coluna | coluna `title` usada no código não existe no schema de `sales` |  |
| coluna | coluna `value` usada no código não existe no schema de `sales` |  |
| coluna | coluna `active` usada no código não existe no schema de `salespeople` |  |
| coluna | coluna `level` usada no código não existe no schema de `salespeople` |  |
| coluna | coluna `user_id` usada no código não existe no schema de `salespeople` |  |
| coluna | coluna `xp` usada no código não existe no schema de `salespeople` |  |
| coluna | coluna `company_name` usada no código não existe no schema de `clients` |  |
| coluna | coluna `industry` usada no código não existe no schema de `clients` |  |
| coluna | coluna `notes` usada no código não existe no schema de `clients` |  |
| coluna | coluna `segment` usada no código não existe no schema de `clients` |  |
| coluna | coluna `season_id` usada no código não existe no schema de `race_cars` |  |
| coluna | coluna `assigned_to` usada no código não existe no schema de `tasks` |  |
| coluna | coluna `is_completed` usada no código não existe no schema de `tasks` |  |
| coluna | coluna `client_id` usada no código não existe no schema de `lead_scores` |  |
| coluna | coluna `temperature` usada no código não existe no schema de `lead_scores` |  |
| coluna | coluna `total_score` usada no código não existe no schema de `lead_scores` |  |
| coluna | coluna `salesperson_id` usada no código não existe no schema de `sequence_enrollments` |  |
| coluna | coluna `description` usada no código não existe no schema de `teams` |  |
| coluna | coluna `sentiment_score` usada no código não existe no schema de `call_recordings` |  |
| coluna | coluna `sale_id` usada no código não existe no schema de `coaching_actions` |  |
| coluna | coluna `sentiment_score` usada no código não existe no schema de `call_sentiment_timeline` |  |
| tabela | tabela `a` usada no código não existe nas migrations/types do repo | `scripts/ai-context/cenarios.mjs` |
| tabela | tabela `alem_do_limite` usada no código não existe nas migrations/types do repo | `scripts/ci/inventario-rotas.unit.mjs` |
| tabela | tabela `auth_users_view` usada no código não existe nas migrations/types do repo | `src/components/settings/FollowUpTerritoryRules.tsx` |
| tabela | tabela `contacts` usada no código não existe nas migrations/types do repo | `scripts/ai-context/gerar.unit.mjs` |
| tabela | tabela `contatos` usada no código não existe nas migrations/types do repo | `scripts/ci/inventario-banco.unit.mjs` |
| tabela | tabela `dashboard_table` usada no código não existe nas migrations/types do repo | `scripts/ai-context/gerar.unit.mjs` |
| tabela | tabela `emails` usada no código não existe nas migrations/types do repo | `scripts/ai-context/gerar.unit.mjs` |
| tabela | tabela `fantasma` usada no código não existe nas migrations/types do repo | `scripts/ai-context/cenarios.mjs` |
| tabela | tabela `fixture_table` usada no código não existe nas migrations/types do repo | `scripts/ai-context/gerar.unit.mjs` |
| tabela | tabela `fotos` usada no código não existe nas migrations/types do repo | `scripts/ci/inventario-rotas.unit.mjs` |
| tabela | tabela `ghost_table` usada no código não existe nas migrations/types do repo | `scripts/ai-context/gerar.unit.mjs` |
| tabela | tabela `leads` usada no código não existe nas migrations/types do repo | `supabase/functions/ai-agent-orchestrator/index.ts` |
| tabela | tabela `nivel1` usada no código não existe nas migrations/types do repo | `scripts/ci/inventario-rotas.unit.mjs` |
| tabela | tabela `nivel2` usada no código não existe nas migrations/types do repo | `scripts/ci/inventario-rotas.unit.mjs` |
| tabela | tabela `nivel3` usada no código não existe nas migrations/types do repo | `scripts/ci/inventario-rotas.unit.mjs` |
| tabela | tabela `outra` usada no código não existe nas migrations/types do repo | `scripts/ci/inventario-banco.unit.mjs` |
| tabela | tabela `payments` usada no código não existe nas migrations/types do repo | `scripts/ai-context/gerar.unit.mjs` |
| tabela | tabela `runtime_table` usada no código não existe nas migrations/types do repo | `scripts/ai-context/gerar.unit.mjs` |
| tabela | tabela `so_teste` usada no código não existe nas migrations/types do repo | `scripts/ai-context/cenarios.mjs` |
| tabela | tabela `stickers` usada no código não existe nas migrations/types do repo | `scripts/ci/inventario-rotas.unit.mjs` |
| tabela | tabela `t` usada no código não existe nas migrations/types do repo | `scripts/ai-context/cenarios.mjs` |
| tabela | tabela `t1` usada no código não existe nas migrations/types do repo | `scripts/ai-context/cenarios.mjs`<br>`scripts/ci/inventario-rotas.unit.mjs` |
| tabela | tabela `tabela` usada no código não existe nas migrations/types do repo | `scripts/inventario/gerar-banco.mjs`<br>`scripts/inventario/gerar-repo.mjs`<br>`src/lib/supabase/parseRows.ts` |
| tabela | tabela `table` usada no código não existe nas migrations/types do repo | `supabase/functions/_shared/chunked_in_lint_test.ts` |
| tabela | tabela `team_members` usada no código não existe nas migrations/types do repo | `supabase/functions/ranking-api/index.ts` |
| tabela | tabela `tools_runtime` usada no código não existe nas migrations/types do repo | `scripts/ai-context/gerar.unit.mjs` |
| tabela | tabela `tx` usada no código não existe nas migrations/types do repo | `scripts/ai-context/cenarios.mjs` |
| tabela | tabela `user_permissions_cache` usada no código não existe nas migrations/types do repo | `supabase/migrations/20251228000002_advanced_permissions.sql` |
| tabela | tabela `users` usada no código não existe nas migrations/types do repo | `scripts/graphify/static-contracts.test.mjs` |
| rls | `app_config`: RLS ligado sem nenhuma política → só service_role acessa |  |
| rls | `chat_messages`: front faz DELETE mas nenhuma política RLS permite DELETE → vai falhar/retornar vazio para usuários | `src/hooks/sales/useSalesAssistant.ts` |
| rls | `client_portfolio`: front faz UPDATE mas nenhuma política RLS permite UPDATE → vai falhar/retornar vazio para usuários | `src/hooks/crm/useClientPortfolio.ts` |
| rls | `daily_challenge_rotations`: RLS ligado sem nenhuma política → só service_role acessa |  |
| rls | `follow_up_audit_logs`: front faz UPDATE mas nenhuma política RLS permite UPDATE → vai falhar/retornar vazio para usuários | `src/pages/FollowUpAudit.tsx` |
| rls | `geo_access_logs`: acessada do front (1 arquivo(s)) sem RLS (não encontrado) | `src/components/security/GeoBlockingManager.tsx` |
| rls | `geo_blocked_regions`: acessada do front (2 arquivo(s)) sem RLS (não encontrado) | `src/components/security/GeoBlockingManager.tsx`<br>`src/components/security/GeoBlockingMap.tsx` |
| rls | `geocode_cache`: RLS ligado sem nenhuma política → só service_role acessa |  |
| rls | `integration_logs`: front faz INSERT mas nenhuma política RLS permite INSERT → vai falhar/retornar vazio para usuários | `src/components/dashboard/IntegrationStatusPanel.tsx` |
| rls | `sale_notifications_audit`: RLS ligado sem nenhuma política → só service_role acessa | `src/hooks/useSaleNotificationAudits.ts` |
| dinheiro | `slow_query_alerts.total_exec_ms` guarda dinheiro em `double precision NOT NULL` (ponto flutuante) — arredondamento imprevisível; padrão é numeric |  |
| edge | edge function `dashboard-edge` invocada mas não existe em supabase/functions/ | `scripts/ai-context/gerar.unit.mjs` |
| edge | edge function `fixture-edge` invocada mas não existe em supabase/functions/ | `scripts/ai-context/gerar.unit.mjs` |
| edge | edge function `ghost-edge` invocada mas não existe em supabase/functions/ | `scripts/ai-context/gerar.unit.mjs` |
| edge | edge function `inexistente` invocada mas não existe em supabase/functions/ | `scripts/ai-context/cenarios.mjs` |
| edge | edge function `notify-sale` invocada mas não existe em supabase/functions/ | `scripts/graphify/static-contracts.test.mjs` |
| edge | edge function `orphan-fn` invocada mas não existe em supabase/functions/ | `scripts/ai-context/gerar.unit.mjs` |
| edge | edge function `other` invocada mas não existe em supabase/functions/ | `scripts/ai-context/cenarios.mjs` |
| edge | edge function `runtime-fn` invocada mas não existe em supabase/functions/ | `scripts/ai-context/gerar.unit.mjs` |
| edge | edge function `runtime-missing` invocada mas não existe em supabase/functions/ | `scripts/ai-context/gerar.unit.mjs` |
| edge | edge function `send-email` invocada mas não existe em supabase/functions/ | `scripts/ai-context/gerar.unit.mjs` |
| edge | edge function `tools-edge` invocada mas não existe em supabase/functions/ | `scripts/ai-context/gerar.unit.mjs` |
| rpc | RPC `admin_rpc` chamada mas não definida nas migrations/types | `scripts/ci/inventario-rotas.unit.mjs` |
| rpc | RPC `dashboard_rpc` chamada mas não definida nas migrations/types | `scripts/ai-context/gerar.unit.mjs` |
| rpc | RPC `demo` chamada mas não definida nas migrations/types | `scripts/supabase_snapshot/test_snapshot.py` |
| rpc | RPC `fixture_rpc` chamada mas não definida nas migrations/types | `scripts/ai-context/gerar.unit.mjs` |
| rpc | RPC `fn` chamada mas não definida nas migrations/types | `scripts/supabase_snapshot/snapshot.py` |
| rpc | RPC `ghost_rpc` chamada mas não definida nas migrations/types | `scripts/ai-context/gerar.unit.mjs` |
| rpc | RPC `is_admin` chamada mas não definida nas migrations/types | `scripts/ai-context/gerar.unit.mjs` |
| rpc | RPC `login_lockout` chamada mas não definida nas migrations/types | `scripts/ci/inventario-rotas.unit.mjs` |
| rpc | RPC `nome` chamada mas não definida nas migrations/types | `scripts/supabase_snapshot/snapshot.py` |
| rpc | RPC `r1` chamada mas não definida nas migrations/types | `scripts/ai-context/cenarios.mjs`<br>`scripts/ci/inventario-rotas.unit.mjs` |
| rpc | RPC `runtime_rpc` chamada mas não definida nas migrations/types | `scripts/ai-context/gerar.unit.mjs` |
| rpc | RPC `sync_score` chamada mas não definida nas migrations/types | `scripts/graphify/static-contracts.test.mjs` |
| rpc | RPC `tools_rpc` chamada mas não definida nas migrations/types | `scripts/ai-context/gerar.unit.mjs` |
| rpc | RPC `x` chamada mas não definida nas migrations/types | `scripts/gen-api-catalog.mjs`<br>`scripts/inventario/gerar-rotas.mjs` |
| dinâmico | 2 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/smoke-target-backend.ts` |
| dinâmico | 4 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/ci/inventario-rotas.unit.mjs` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/inventario/gerar-banco.mjs` |
| dinâmico | 2 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `scripts/regras_negocio/generate.py` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `src/hooks/useMultichannel.test.tsx` |
| dinâmico | 3 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `src/hooks/win-loss/useInsightComments.ts` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `supabase/functions/ai-agent-orchestrator/index.ts` |
| dinâmico | 2 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `supabase/functions/export-winloss-pdf/index.ts` |
| dinâmico | 4 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `supabase/functions/external-db-bridge/index.ts` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `supabase/functions/report-builder-execute/index.ts` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `supabase/functions/report-embed-public/index.ts` |
| dinâmico | 2 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `supabase/functions/scheduled-reports-runner/index.ts` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `supabase/functions/semantic-index-entity/index.ts` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `supabase/functions/semantic-reindex-batch/index.ts` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `tests/e2e/quote-to-sale-cleanup-contract.spec.ts` |
| dinâmico | 1 chamada(s) `.from(variável)` — tabela só conhecida em runtime | `tests/e2e/helpers/quote-to-sale-helpers.ts` |
| segurança | função `log_data_access` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20260104183000_security_enhancements.sql` |
| segurança | função `audit_trigger` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20260104200100_audit_trail_complete.sql` |
| segurança | função `audit_trigger_func` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20260814210000_fix_clients_update_triggers.sql` |
| segurança | função `send_notification` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20260512213357_15e3dcb3-7cf3-4f6e-9af2-21233a6401d4.sql` |
| segurança | função `fn_calculate_icp_score` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20260511203112_2dd0b918-e14b-411d-bfd7-1c4018d0432d.sql` |
| segurança | função `process_weekly_league_reset` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20260512143013_d0ee44c6-25d4-42a1-8f86-4492bda7491c.sql` |
| segurança | função `auto_victory_post` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20260814190000_fix_broken_sales_triggers.sql` |
| segurança | função `maintain_sales_streaks` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20260815110000_fix_maintain_sales_streaks.sql` |
| segurança | função `handle_performance_update` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20260512191103_395a3146-26cb-43f1-904d-59fa4d441723.sql` |
| segurança | função `handle_territory_conquest` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20260512191103_395a3146-26cb-43f1-904d-59fa4d441723.sql` |
| segurança | função `calculate_deal_risk_score` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20260513194322_de774cc9-8b6f-4814-9c4e-3f80fbffaadb.sql` |
| segurança | função `refresh_competitive_ranking` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20260517113746_ba2cd7eb-24e5-40ef-a0e6-2b2a233dedb2.sql` |
| segurança | função `set_sdr_id_on_insert` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20260517131244_419ed71c-170d-4a29-a1b9-66aa785fd0ec.sql` |
| segurança | função `check_is_first_sale` é SECURITY DEFINER sem `set search_path` (risco de escalação) | `supabase/migrations/20260517132342_8859b5fc-de51-484f-ada7-1992f48a62c7.sql` |

## Lacunas — o que este contexto NÃO consegue responder (perguntas para o dono do negócio)

- Nenhuma regra manual em `manual/`: prazos, limites, exceções comerciais, quem aprova o quê — só o negócio sabe.
- `sales.status` tem valores ['cancelled', 'closed', 'completed', 'lead', 'lost', 'negotiation', 'pending', 'proposal', 'prospecting', 'qualified', 'won'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `sales.stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `sales.deal_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `sales.enrichment_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `sales.whatsapp_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `deal_stage_history.stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `tasks.status` tem valores ['pending', 'in_progress', 'completed', 'cancelled'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `playbooks.stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `activities.lead_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `cadence_steps.step_order` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `cadence_steps.step_type` tem valores ['call', 'email', 'linkedin', 'task'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `prospect_cadences.status` tem valores ['active', 'cancelled', 'completed', 'paused'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `prospect_cadences.current_step` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `prospect_cadences.funnel_stage` tem valores ['high_interest', 'new', 'scheduled', 'waiting_approval'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `cadence_tasks.status` tem valores ['completed', 'pending', 'skipped'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `products.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `circuit_breaker_events.previous_state` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `circuit_breaker_events.new_state` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `client_portfolio.status` tem valores ['active', 'at_risk', 'churned', 'inactive', 'nurturing'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `bitrix24_sync_logs.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `email_logs.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `suppliers.state` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `supplier_orders.status` tem valores ['cancelled', 'confirmed', 'delivered', 'pending', 'shipped'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `digital_signatures.status` tem valores ['draft', 'expired', 'pending', 'rejected', 'signed'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `document_signers.status` tem valores ['pending', 'rejected', 'signed'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `migration_log.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `password_reset_requests.status` tem valores ['approved', 'completed', 'expired', 'pending', 'rejected'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `webhook_logs.response_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `webhook_logs.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `webhook_events.status` tem valores ['failed', 'pending', 'success'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `quotes.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `quotes.billing_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `quotes.sync_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `quote_sync_logs.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `sales_battles.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `competitive_seasons.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `weekly_matchups.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `tournaments.status` tem valores ['active', 'completed', 'upcoming'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `tournament_matches.status` tem valores ['active', 'completed', 'pending'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `performance_bets.status` tem valores ['active', 'cancelled', 'lost', 'won'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `message_templates.pipeline_stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `channel_interactions.status` tem valores ['delivered', 'failed', 'read', 'replied', 'scheduled', 'sent'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `pipeline_stages.stage_order` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `nps_surveys.status` tem valores ['pending', 'responded', 'sent'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `commissions.status` tem valores ['approved', 'cancelled', 'paid', 'pending'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `agenda_events.status` tem valores ['cancelled', 'completed', 'in_progress', 'pending'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `approval_requests.status` tem valores ['approved', 'cancelled', 'expired', 'pending', 'rejected'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `webhook_deliveries.response_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `sla_policies.stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `sla_violations.stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `sla_violations.hours_in_stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `sla_violations.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `lead_routing_rules.filter_state` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `workflow_executions.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `workflow_executions.step_log` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `cadence_enrollment_rules.trigger_stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `cadence_ab_tests.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `call_recordings.status` tem valores ['analyzing', 'failed', 'pending', 'ready', 'transcribing'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `deal_health_scores.days_in_stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `accounts.health_status` tem valores ['at_risk', 'critical', 'healthy', 'unknown'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `automation_runs.status` tem valores ['failed', 'partial', 'skipped', 'success'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `sales_enablement_assets.funnel_stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `pipeline_inspection_snapshots.stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `pipeline_inspection_snapshots.days_in_stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `support_tickets.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `renewals.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `onboarding_journeys.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `onboarding_journeys.current_step` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `onboarding_steps.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `expansion_opportunities.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `report_executions.status` tem valores ['failed', 'pending', 'running', 'success'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `scheduled_report_runs.status` tem valores ['failed', 'running', 'success'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `sequence_steps.step_order` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `sequence_enrollments.status` tem valores ['active', 'completed', 'exited', 'failed', 'paused'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `sequence_enrollments.current_step` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `sequence_step_executions.status` tem valores ['failed', 'queued', 'sent', 'skipped'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `outbound_messages.status` tem valores ['delivered', 'failed', 'queued', 'read', 'sent'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `ai_agent_runs.status` tem valores ['awaiting_approval', 'cancelled', 'completed', 'failed', 'pending', 'running'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `ai_agent_actions.step_index` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `ai_agent_actions.status` tem valores ['error', 'executing', 'pending_approval', 'skipped', 'success'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `email_bulk_jobs.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `scheduled_sends.status` tem valores ['cancelled', 'failed', 'pending', 'sent'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `dialer_queue_items.status` tem valores ['calling', 'done', 'pending', 'skipped', 'snoozed'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `twilio_call_sessions.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `coaching_actions.status` tem valores ['accepted', 'dismissed', 'pending', 'practiced'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `call_critical_moments.status` tem valores ['acknowledged', 'actioned', 'dismissed', 'new'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `deal_velocity_predictions.velocity_status` tem valores ['ahead', 'on_track', 'slow', 'stalled'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `deal_velocity_predictions.current_stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `deal_velocity_predictions.days_in_stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `deal_velocity_predictions.expected_days_in_stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `deal_velocity_predictions.stage_velocity_ratio` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `stage_velocity_baselines.stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `stage_conversion_metrics.from_stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `stage_conversion_metrics.to_stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `stage_bottleneck_insights.stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `race_seasons.status` tem valores ['active', 'finished', 'upcoming'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `pipeline_coverage_snapshots.stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `win_probability_calibrations.stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `quota_attainment_predictions.pace_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `call_objections.resolution_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `deal_stage_transitions.from_stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `deal_stage_transitions.to_stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `deal_velocity_alerts.current_stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `deal_velocity_alerts.hours_in_stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `win_loss_analyses.lost_stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `win_calibration_buckets.stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `win_probability_deal_calibrations.stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `coaching_sessions.status` tem valores ['canceled', 'completed', 'scheduled'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `task_assignments.status` tem valores ['pending', 'in_progress', 'submitted', 'approved', 'rejected'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `winloss_webhook_subscriptions.last_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `winloss_webhook_deliveries.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `winloss_webhook_dead_letters.last_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `winloss_webhook_dead_letters.status` tem valores ['archived', 'pending', 'replayed', 'replaying'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `winloss_webhook_dead_letters.last_replay_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `orders.status` tem valores ['cancelled', 'confirmed', 'delivered', 'pending', 'preparing', 'shipped'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `order_status_events.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `winloss_webhook_replay_audit.http_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `integration_health_checks.status` tem valores ['success', 'failure', 'degraded', 'pending'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `integration_autotest_jobs.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `commercial_approval_requests.status` tem valores ['approved', 'pending', 'rejected'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `follow_up_audit_logs.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `follow_up_notifications.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `cadence_funnel_rules.from_stage` tem valores ['high_interest', 'new', 'scheduled', 'waiting_approval'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `cadence_funnel_rules.to_stage` tem valores ['high_interest', 'new', 'scheduled', 'waiting_approval'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `cadence_outcome_rules.to_stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `duplicate_block_logs.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `integration_logs.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `mql_qualifications.qualification_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `lead_churn_risk.status` tem valores ['active', 'ignored', 'resolved'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `sale_notifications_audit.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `enriched_company_intelligence.funding_stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `cs_tickets.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `client_renewals.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `whatsapp_conversations.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `quote_sync_inbound_log.status` tem valores ['accepted', 'bad_request', 'duplicate', 'error', 'ignored', 'method_not_allowed', 'not_found', 'processed', 'rejected', 'unauthorized'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `quote_sync_inbound_log.http_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `quotes_inbound.status` tem valores ['approved', 'cancelled', 'converted', 'draft', 'expired', 'lost', 'open', 'pending', 'rejected', 'sent', 'won'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `webhook_inbound_log.http_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `maintenance_log.status` tem valores ['completed', 'failed', 'running', 'skipped'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `quote_conversion_audit.previous_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `quote_conversion_audit.new_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `cron_failure_alerts.status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `call_recording_ingest_jobs.status` tem valores ['dead_letter', 'failed', 'pending', 'processing', 'succeeded'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `forecast_narrative_dead_letters.http_status` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `commission_bonus_awards.status` tem valores ['cancelled', 'paid', 'pending'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `stage_inactivity_rules.stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `data_subject_requests.status` tem valores ['completed', 'in_progress', 'pending', 'rejected'] mas nenhum mapa de transições foi encontrado no código — a ordem permitida (ex.: pago → cancelado?) não está declarada.
- `status_transitions.status_origem` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `status_transitions.status_destino` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `stage_probabilities.stage` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- `plan_rollback_ddl.etapa` é uma coluna de status sem enum/CHECK — os valores válidos e as transições permitidas não estão no banco.
- 403/408 tabelas sem `COMMENT ON TABLE` — o significado de negócio não está no schema: `entity_versions`, `audit_log`, `sales`, `daily_metrics`, `category_metrics`, `salespeople`, `sales_goals`, `deal_outcomes`, `deal_stage_history`, `objections_library`, `notification_preferences`, `tasks` …
- Há tabelas usadas no código sem migration no repo — o schema real pode ter sido alterado pelo painel.

## Regras manuais presentes

_nenhuma — copie `manual/TEMPLATE-regras-de-negocio.md`_
