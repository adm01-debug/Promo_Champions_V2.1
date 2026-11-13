# Grants


Roles da API: `anon` (sem login), `authenticated` (logado), `service_role` (bypass RLS). Grants de sistema (postgres, supabase_*) omitidos.

## Tabelas e views

| objeto | role | privilégios |
|---|---|---|
| public._internal_secrets | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public._internal_secrets | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public._internal_secrets | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.ab_tests | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.ab_tests | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.ab_tests | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.access_denied_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.access_denied_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.access_denied_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.account_activities | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.account_activities | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.account_activities | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.account_contacts | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.account_contacts | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.account_contacts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.account_plans | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.account_plans | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.account_plans | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.accounts | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.accounts | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.accounts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.achievements | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.achievements | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.achievements | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.active_power_ups | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.active_power_ups | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.active_power_ups | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.active_sessions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.active_sessions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.active_sessions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.activities | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.activities | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.activities | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.activities_active | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.activities_active | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.activity_audit_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.activity_audit_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.activity_audit_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.activity_goals | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.activity_goals | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.activity_goals | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.agenda_events | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.agenda_events | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.agenda_events | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.ai_agent_actions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.ai_agent_actions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.ai_agent_actions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.ai_agent_runs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.ai_agent_runs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.ai_agent_runs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.ai_narrative_cache | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.ai_narrative_cache | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.ai_narrative_cache | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.ai_sales_insights | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.ai_sales_insights | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.ai_sales_insights | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.api_tokens | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.api_tokens | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.api_tokens | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.app_config | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.app_config | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.app_config | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.approval_decisions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.approval_decisions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.approval_decisions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.approval_requests | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.approval_requests | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.approval_requests | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.approval_workflows | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.approval_workflows | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.approval_workflows | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.asset_usage_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.asset_usage_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.asset_usage_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.audit_log | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.audit_log | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.audit_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.audit_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.audit_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.auto_task_queue_settings | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.auto_task_queue_settings | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.auto_task_queue_settings | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.automation_runs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.automation_runs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.automation_runs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.automation_workflows | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.automation_workflows | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.automation_workflows | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.available_spins | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.available_spins | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.available_spins | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.battle_participants | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.battle_participants | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.battle_participants | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.bitrix24_sync_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.bitrix24_sync_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.bitrix24_sync_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.blocked_ips | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.blocked_ips | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.blocked_ips | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.buying_committee | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.buying_committee | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.buying_committee | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.buying_committee_members | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.buying_committee_members | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.buying_committee_members | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.buying_signals | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.buying_signals | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.buying_signals | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.cadence_ab_assignments | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadence_ab_assignments | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadence_ab_assignments | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.cadence_ab_tests | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadence_ab_tests | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadence_ab_tests | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.cadence_advanced_stats | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadence_advanced_stats | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadence_advanced_stats | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.cadence_alert_templates | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadence_alert_templates | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadence_alert_templates | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.cadence_enrollment_rules | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadence_enrollment_rules | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadence_enrollment_rules | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.cadence_funnel_rules | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadence_funnel_rules | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadence_funnel_rules | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.cadence_outcome_rules | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadence_outcome_rules | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadence_outcome_rules | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.cadence_steps | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadence_steps | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadence_steps | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.cadence_tasks | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadence_tasks | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadence_tasks | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.cadences | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadences | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cadences | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.call_coaching_scorecards | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_coaching_scorecards | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_coaching_scorecards | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.call_conversation_metrics | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_conversation_metrics | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_conversation_metrics | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.call_critical_moments | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_critical_moments | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_critical_moments | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.call_insights | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_insights | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_insights | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.call_intelligence_triggers | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_intelligence_triggers | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_intelligence_triggers | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.call_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.call_metric_benchmarks | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_metric_benchmarks | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_metric_benchmarks | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.call_objection_analysis | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_objection_analysis | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_objection_analysis | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.call_objections | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_objections | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_objections | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.call_question_analysis | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_question_analysis | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_question_analysis | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.call_questions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_questions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_questions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.call_recording_ingest_jobs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_recording_ingest_jobs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_recording_ingest_jobs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.call_recordings | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_recordings | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_recordings | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.call_sentiment_summary | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_sentiment_summary | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_sentiment_summary | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.call_sentiment_timeline | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_sentiment_timeline | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_sentiment_timeline | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.call_transcripts | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_transcripts | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.call_transcripts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.campaign_health_alerts | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.campaign_health_alerts | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.campaign_health_alerts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.category_metrics | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.category_metrics | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.category_metrics | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.challenge_progress | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.challenge_progress | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.challenge_progress | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.channel_credentials | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.channel_credentials | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.channel_credentials | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.channel_interactions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.channel_interactions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.channel_interactions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.chat_conversations | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.chat_conversations | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.chat_conversations | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.chat_messages | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.chat_messages | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.chat_messages | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.churn_alert_settings | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.churn_alert_settings | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.churn_alert_settings | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.circuit_breaker_events | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.circuit_breaker_events | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.circuit_breaker_events | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.client_churn_alerts_state | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.client_churn_alerts_state | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.client_churn_alerts_state | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.client_interactions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.client_interactions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.client_interactions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.client_portfolio | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.client_portfolio | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.client_portfolio | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.client_purchase_seasonality | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.client_purchase_seasonality | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.client_purchase_seasonality | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.client_renewals | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.client_renewals | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.client_renewals | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.clients | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.clients | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.clients | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.clients_active | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.clients_active | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.coaching_actions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.coaching_actions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.coaching_actions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.coaching_impact_metrics | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.coaching_impact_metrics | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.coaching_impact_metrics | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.coaching_opportunities | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.coaching_opportunities | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.coaching_opportunities | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.coaching_scorecard_config | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.coaching_scorecard_config | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.coaching_scorecard_config | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.coaching_sessions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.coaching_sessions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.coaching_sessions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.coaching_skill_benchmarks | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.coaching_skill_benchmarks | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.coaching_skill_benchmarks | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.cohort_analyses | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cohort_analyses | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cohort_analyses | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.collectible_badges | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.collectible_badges | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.collectible_badges | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.combo_tracking | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.combo_tracking | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.combo_tracking | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.commercial_approval_requests | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.commercial_approval_requests | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.commercial_approval_requests | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.commission_bonus_awards | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.commission_bonus_awards | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.commission_bonus_awards | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.commission_bonuses | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.commission_bonuses | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.commission_bonuses | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.commission_rules | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.commission_rules | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.commission_rules | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.commissions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.commissions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.commissions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.committee_coverage_history | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.committee_coverage_history | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.committee_coverage_history | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.committee_extraction_runs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.committee_extraction_runs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.committee_extraction_runs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.competitive_chat_messages | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.competitive_chat_messages | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.competitive_chat_messages | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.competitive_ranking | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.competitive_ranking | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.competitive_ranking | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.competitive_seasons | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.competitive_seasons | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.competitive_seasons | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.competitor_mentions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.competitor_mentions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.competitor_mentions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.competitors_pricing | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.competitors_pricing | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.competitors_pricing | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.competitors_registry | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.competitors_registry | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.competitors_registry | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.consent_records | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.consent_records | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.consent_records | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.contact_best_send_window | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.contact_best_send_window | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.contact_best_send_window | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.contact_engagement_score | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.contact_engagement_score | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.contact_engagement_score | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.contact_send_time_profile | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.contact_send_time_profile | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.contact_send_time_profile | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.conversation_analyses | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.conversation_analyses | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.conversation_analyses | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.conversation_insights_summary | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.conversation_insights_summary | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.conversation_insights_summary | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.critical_moment_notifications | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.critical_moment_notifications | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.critical_moment_notifications | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.cron_failure_alerts | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cron_failure_alerts | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cron_failure_alerts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.cs_tickets | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cs_tickets | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.cs_tickets | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.csat_ces_surveys | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.csat_ces_surveys | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.csat_ces_surveys | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.custom_reports | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.custom_reports | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.custom_reports | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.daily_challenge_progress | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.daily_challenge_progress | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.daily_challenge_progress | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.daily_challenge_rotations | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.daily_challenge_rotations | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.daily_challenge_rotations | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.daily_challenges | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.daily_challenges | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.daily_challenges | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.daily_metrics | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.daily_metrics | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.daily_metrics | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.daily_streak_achievements | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.daily_streak_achievements | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.daily_streak_achievements | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.dashboard_layouts | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.dashboard_layouts | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.dashboard_layouts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.data_access_log | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.data_access_log | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.data_retention_policies | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.data_retention_policies | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.data_retention_policies | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.data_subject_requests | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.data_subject_requests | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.data_subject_requests | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.db_rollback_snapshots | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.db_rollback_snapshots | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.db_rollback_snapshots | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.dead_letter_replay_audit | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.dead_letter_replay_audit | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.dead_letter_replay_audit | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.deal_chat_history | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_chat_history | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_chat_history | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.deal_committee_coverage | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_committee_coverage | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_committee_coverage | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.deal_health_history | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_health_history | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_health_history | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.deal_health_scores | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_health_scores | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_health_scores | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.deal_outcomes | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_outcomes | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_outcomes | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.deal_probability_scores | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_probability_scores | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_probability_scores | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.deal_risk_signals | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_risk_signals | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_risk_signals | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.deal_stage_history | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_stage_history | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_stage_history | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.deal_stage_transitions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_stage_transitions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_stage_transitions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.deal_stakeholders | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_stakeholders | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_stakeholders | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.deal_velocity_alerts | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_velocity_alerts | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_velocity_alerts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.deal_velocity_predictions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_velocity_predictions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.deal_velocity_predictions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.demand_forecasts | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.demand_forecasts | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.demand_forecasts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.dialer_queue_items | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.dialer_queue_items | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.dialer_queue_items | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.dialer_queues | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.dialer_queues | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.dialer_queues | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.digital_signatures | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.digital_signatures | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.digital_signatures | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.document_signers | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.document_signers | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.document_signers | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.duplicate_block_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.duplicate_block_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.duplicate_block_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.edge_call_failures | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.edge_call_failures | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.edge_retry_events | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.edge_retry_events | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.edge_retry_events | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.email_bulk_drafts | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.email_bulk_drafts | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.email_bulk_drafts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.email_bulk_jobs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.email_bulk_jobs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.email_bulk_jobs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.email_engagement_score_history | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.email_engagement_score_history | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.email_engagement_score_history | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.email_engagement_scores | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.email_engagement_scores | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.email_engagement_scores | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.email_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.email_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.email_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.email_opt_outs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.email_opt_outs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.email_opt_outs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.email_tracking_events | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.email_tracking_events | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.email_tracking_events | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.embedded_report_tokens | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.embedded_report_tokens | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.embedded_report_tokens | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.engagement_score_history | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.engagement_score_history | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.engagement_score_history | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.engagement_score_leaderboard | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.engagement_score_leaderboard | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.engagement_score_leaderboard | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.enriched_company_intelligence | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.enriched_company_intelligence | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.enriched_company_intelligence | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.entity_versions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.entity_versions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.error_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.error_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.error_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.executive_briefings | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.executive_briefings | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.executive_briefings | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.expansion_opportunities | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.expansion_opportunities | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.expansion_opportunities | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.expansion_playbooks | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.expansion_playbooks | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.expansion_playbooks | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.experiment_assignments | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.experiment_assignments | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.experiment_assignments | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.experiment_variants | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.experiment_variants | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.experiment_variants | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.experiments | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.experiments | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.experiments | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.external_seller_map | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.external_seller_map | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.external_seller_map | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.feature_flags | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.feature_flags | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.feature_flags | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.feed_comments | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.feed_comments | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.feed_comments | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.feed_reactions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.feed_reactions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.feed_reactions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.follow_up_audit_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.follow_up_audit_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.follow_up_audit_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.follow_up_audit_view | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.follow_up_audit_view | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.follow_up_audit_view | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.follow_up_notifications | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.follow_up_notifications | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.follow_up_notifications | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.follow_up_settings | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.follow_up_settings | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.follow_up_settings | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.follow_up_templates | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.follow_up_templates | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.follow_up_templates | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.follow_up_territory_rules | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.follow_up_territory_rules | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.follow_up_territory_rules | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.forecast_accuracy | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.forecast_accuracy | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.forecast_accuracy | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.forecast_confidence_scores | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.forecast_confidence_scores | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.forecast_confidence_scores | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.forecast_deal_contributions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.forecast_deal_contributions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.forecast_deal_contributions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.forecast_narrative_dead_letters | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.forecast_narrative_dead_letters | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.forecast_narrative_dead_letters | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.forecast_snapshots | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.forecast_snapshots | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.forecast_snapshots | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.geo_access_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.geo_access_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.geo_access_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.geo_blocked_regions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.geo_blocked_regions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.geo_blocked_regions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.geocode_cache | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.icp_data | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.icp_data | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.icp_data | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.icp_parameters | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.icp_parameters | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.icp_parameters | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.inbound_reply_events | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.inbound_reply_events | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.inbound_reply_events | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.integration_autotest_jobs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.integration_autotest_jobs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.integration_autotest_jobs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.integration_autotest_settings | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.integration_autotest_settings | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.integration_autotest_settings | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.integration_connections | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.integration_connections | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.integration_connections | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.integration_health_checks | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.integration_health_checks | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.integration_health_checks | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.integration_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.integration_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.integration_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.integration_secret_refs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.integration_secret_refs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.integration_secret_refs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.intent_audit_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.intent_audit_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.intent_audit_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.inventory_levels | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.inventory_levels | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.inventory_levels | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.ip_whitelist | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.ip_whitelist | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.ip_whitelist | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.known_devices | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.known_devices | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.known_devices | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.kudos | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.kudos | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.kudos | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.latest_briefing_view | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.latest_briefing_view | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.latest_briefing_view | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.lead_assignments | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_assignments | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_assignments | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.lead_churn_risk | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_churn_risk | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_churn_risk | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.lead_detailed_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_detailed_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_detailed_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.lead_intelligence_metrics | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_intelligence_metrics | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_intelligence_metrics | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.lead_routing_log | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_routing_log | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_routing_log | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.lead_routing_rules | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_routing_rules | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_routing_rules | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.lead_score_explanations | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_score_explanations | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_score_explanations | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.lead_score_history | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_score_history | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_score_history | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.lead_score_trends | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_score_trends | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_score_trends | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.lead_scores | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_scores | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_scores | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.lead_source_configs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_source_configs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.lead_source_configs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.league_history | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.league_history | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.league_history | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.league_members | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.league_members | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.league_members | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.leagues | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.leagues | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.leagues | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.login_alerts | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.login_alerts | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.login_alerts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.login_attempts | authenticated | SELECT |
| public.login_attempts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.maintenance_log | authenticated | SELECT |
| public.maintenance_log | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.message_templates | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.message_templates | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.message_templates | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.mfa_verification_attempts | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.mfa_verification_attempts | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.mfa_verification_attempts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.migration_log | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.migration_log | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.migration_log | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.monthly_sales_summary | anon | DELETE, INSERT, REFERENCES, TRIGGER, UPDATE |
| public.monthly_sales_summary | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.monthly_sales_summary | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.mood_entries | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.mood_entries | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.mood_entries | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.mql_qualifications | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.mql_qualifications | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.mql_qualifications | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.notification_preferences | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.notification_preferences | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.notification_preferences | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.notifications | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.notifications | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.notifications | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.nps_surveys | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.nps_surveys | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.nps_surveys | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.objection_library | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.objection_library | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.objection_library | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.objections_library | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.objections_library | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.objections_library | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.onboarding_journeys | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.onboarding_journeys | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.onboarding_journeys | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.onboarding_steps | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.onboarding_steps | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.onboarding_steps | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.order_items | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.order_items | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.order_items | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.order_status_events | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.order_status_events | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.order_status_events | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.orders | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.orders | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.orders | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.outbound_messages | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.outbound_messages | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.outbound_messages | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.page_analytics | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.page_analytics | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.page_analytics | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.password_history | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.password_history | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.password_reset_requests | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.password_reset_requests | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.password_reset_requests | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.performance_bets | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.performance_bets | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.performance_bets | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.performance_impact_factors | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.performance_impact_factors | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.performance_impact_factors | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.permissions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.permissions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.permissions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.person_intelligence | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.person_intelligence | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.person_intelligence | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.personal_assistant_briefings | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.personal_assistant_briefings | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.personal_assistant_briefings | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.personal_assistant_nudges | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.personal_assistant_nudges | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.personal_assistant_nudges | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.pipeline_coverage_recommendations | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.pipeline_coverage_recommendations | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.pipeline_coverage_recommendations | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.pipeline_coverage_snapshots | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.pipeline_coverage_snapshots | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.pipeline_coverage_snapshots | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.pipeline_inspection_snapshots | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.pipeline_inspection_snapshots | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.pipeline_inspection_snapshots | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.pipeline_inspections | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.pipeline_inspections | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.pipeline_inspections | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.pipeline_stages | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.pipeline_stages | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.pipeline_stages | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.pipelines | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.pipelines | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.pipelines | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.plan_rollback_ddl | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.playbook_items | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.playbook_items | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.playbook_items | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.playbook_progress | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.playbook_progress | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.playbook_progress | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.playbooks | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.playbooks | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.playbooks | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.portfolio_settings | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.portfolio_settings | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.portfolio_settings | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.price_alerts | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.price_alerts | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.price_alerts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.price_history | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.price_history | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.price_history | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.price_protection_rules | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.price_protection_rules | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.price_protection_rules | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.pricing_rules | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.pricing_rules | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.pricing_rules | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.prize_wheel_spins | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.prize_wheel_spins | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.prize_wheel_spins | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.product_stock_log | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.product_stock_log | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.product_stock_log | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.product_usage | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.product_usage | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.product_usage | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.product_usage_events | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.product_usage_events | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.product_usage_events | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.product_usage_summary | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.product_usage_summary | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.product_usage_summary | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.products | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.products | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.products | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.progressive_goals | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.progressive_goals | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.progressive_goals | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.prospect_cadences | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.prospect_cadences | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.prospect_cadences | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.push_subscriptions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.push_subscriptions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.push_subscriptions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.qbr_reports | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.qbr_reports | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.qbr_reports | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.qbr_schedule | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.qbr_schedule | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.qbr_schedule | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.query_telemetry | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.query_telemetry | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.query_telemetry | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.quota_attainment_actions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.quota_attainment_actions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.quota_attainment_actions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.quota_attainment_alerts | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.quota_attainment_alerts | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.quota_attainment_alerts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.quota_attainment_forecasts | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.quota_attainment_forecasts | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.quota_attainment_forecasts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.quota_attainment_predictions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.quota_attainment_predictions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.quota_attainment_predictions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.quote_conversion_audit | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.quote_conversion_audit | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.quote_conversion_audit | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.quote_items | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.quote_items | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.quote_items | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.quote_sync_inbound_log | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.quote_sync_inbound_log | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.quote_sync_inbound_log | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.quote_sync_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.quote_sync_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.quote_sync_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.quotes | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.quotes | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.quotes | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.quotes_inbound | anon | DELETE, REFERENCES, SELECT, TRIGGER |
| public.quotes_inbound | authenticated | DELETE, REFERENCES, SELECT, TRIGGER |
| public.quotes_inbound | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.race_badges | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_badges | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_badges | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.race_cars | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_cars | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_cars | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.race_daily_snapshots | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_daily_snapshots | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_daily_snapshots | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.race_events | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_events | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_events | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.race_leaderboard_view | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_leaderboard_view | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_leaderboard_view | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.race_overlay_telemetry | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_overlay_telemetry | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_overlay_telemetry | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.race_powerups | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_powerups | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_powerups | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.race_reactions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_reactions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_reactions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.race_rivalries_persistent | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_rivalries_persistent | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_rivalries_persistent | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.race_rivalries_view | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_rivalries_view | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_rivalries_view | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.race_scoring_rules | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_scoring_rules | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_scoring_rules | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.race_seasons | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_seasons | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_seasons | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.race_spectator_view | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_spectator_view | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_spectator_view | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.race_team_members | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_team_members | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_team_members | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.race_teams | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_teams | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_teams | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.race_unlocks | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_unlocks | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_unlocks | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.race_user_daily_checkins | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_user_daily_checkins | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_user_daily_checkins | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.race_user_preferences | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_user_preferences | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.race_user_preferences | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.rank_change_notifications | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.rank_change_notifications | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.rank_change_notifications | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.ranking_notifications | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.ranking_notifications | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.ranking_notifications | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.rate_limit_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.rate_limit_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.rate_limit_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.rate_limit_settings | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.rate_limit_settings | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.rate_limit_settings | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.reauthentication_requests | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.reauthentication_requests | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.reauthentication_requests | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.renewals | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.renewals | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.renewals | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.report_embed_tokens | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.report_embed_tokens | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.report_embed_tokens | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.report_executions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.report_executions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.report_executions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.report_schedules | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.report_schedules | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.report_schedules | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.revenue_forecast_view | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.revenue_forecast_view | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.revenue_forecast_view | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.revenue_forecasts | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.revenue_forecasts | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.revenue_forecasts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.role_permissions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.role_permissions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.role_permissions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sale_notifications_audit | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sale_notifications_audit | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sale_notifications_audit | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sales | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sales | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sales | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sales_battles | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sales_battles | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sales_battles | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sales_enablement_assets | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sales_enablement_assets | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sales_enablement_assets | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sales_goals | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sales_goals | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sales_goals | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sales_streaks | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sales_streaks | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sales_streaks | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sales_territories | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sales_territories | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sales_territories | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sales_with_markup | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sales_with_markup | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sales_with_markup | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.salespeople | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salespeople | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salespeople | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.salespeople_public | anon | SELECT |
| public.salespeople_public | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salespeople_public | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.salesperson_badges | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salesperson_badges | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salesperson_badges | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.salesperson_coaching_aggregates | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salesperson_coaching_aggregates | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salesperson_coaching_aggregates | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.salesperson_commission_configs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salesperson_commission_configs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salesperson_commission_configs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.salesperson_custom_field_values | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salesperson_custom_field_values | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salesperson_custom_field_values | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.salesperson_leagues | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salesperson_leagues | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salesperson_leagues | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.salesperson_performance_telemetry | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salesperson_performance_telemetry | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salesperson_performance_telemetry | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.salesperson_preferences | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salesperson_preferences | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salesperson_preferences | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.salesperson_xp | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salesperson_xp | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.salesperson_xp | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.saved_filters | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.saved_filters | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.saved_filters | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.scheduled_report_runs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.scheduled_report_runs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.scheduled_report_runs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.scheduled_reports | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.scheduled_reports | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.scheduled_reports | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.scheduled_sends | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.scheduled_sends | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.scheduled_sends | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.score_change_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.score_change_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.score_change_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sdr_alert_configs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sdr_alert_configs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sdr_alert_configs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sdr_alert_history | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sdr_alert_history | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sdr_alert_history | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sdr_performance_settings | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sdr_performance_settings | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sdr_performance_settings | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.security_alert_history | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.security_alert_history | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.security_alert_history | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.security_alert_settings | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.security_alert_settings | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.security_alert_settings | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.security_events | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.security_events | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.semantic_index | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.semantic_index | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.semantic_index | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.send_time_profiles | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.send_time_profiles | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.send_time_profiles | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sequence_enrollments | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sequence_enrollments | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sequence_enrollments | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sequence_step_assignments | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sequence_step_assignments | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sequence_step_assignments | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sequence_step_executions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sequence_step_executions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sequence_step_executions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sequence_step_variants | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sequence_step_variants | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sequence_step_variants | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sequence_steps | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sequence_steps | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sequence_steps | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sequence_variant_performance | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sequence_variant_performance | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sequence_variant_performance | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sequences | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sequences | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sequences | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.session_activity | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.session_activity | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.skill_assessments | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.skill_assessments | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.skill_assessments | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.skill_development_tracks | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.skill_development_tracks | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.skill_development_tracks | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sla_policies | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sla_policies | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sla_policies | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sla_violations | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sla_violations | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sla_violations | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.slow_query_alerts | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.slow_query_alerts | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.slow_query_alerts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.sms_verification_codes | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sms_verification_codes | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.sms_verification_codes | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.squad_members | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.squad_members | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.squad_members | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.squads | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.squads | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.squads | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.stage_bottleneck_insights | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.stage_bottleneck_insights | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.stage_bottleneck_insights | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.stage_conversion_metrics | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.stage_conversion_metrics | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.stage_conversion_metrics | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.stage_inactivity_rules | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.stage_inactivity_rules | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.stage_inactivity_rules | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.stage_probabilities | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.stage_probabilities | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.stage_probabilities | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.stage_velocity_baselines | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.stage_velocity_baselines | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.stage_velocity_baselines | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.status_transitions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.status_transitions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.status_transitions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.stock_movements | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.stock_movements | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.stock_movements | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.supplier_order_items | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.supplier_order_items | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.supplier_order_items | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.supplier_orders | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.supplier_orders | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.supplier_orders | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.supplier_products | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.supplier_products | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.supplier_products | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.supplier_risk_assessments | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.supplier_risk_assessments | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.supplier_risk_assessments | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.suppliers | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.suppliers | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.suppliers | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.support_tickets | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.support_tickets | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.support_tickets | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.task_assignments | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.task_assignments | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.task_assignments | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.task_catalog | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.task_catalog | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.task_catalog | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.tasks | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.tasks | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.tasks | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.tasks_active | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.tasks_active | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.team_closers | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.team_closers | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.team_closers | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.team_custom_fields | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.team_custom_fields | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.team_custom_fields | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.teams | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.teams | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.teams | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.territories | anon | DELETE, INSERT, REFERENCES, TRIGGER, UPDATE |
| public.territories | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.territories | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.territory_history | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.territory_history | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.territory_history | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.tournament_matches | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.tournament_matches | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.tournament_matches | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.tournament_participants | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.tournament_participants | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.tournament_participants | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.tournaments | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.tournaments | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.tournaments | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.twilio_call_sessions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.twilio_call_sessions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.twilio_call_sessions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.user_2fa | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.user_2fa | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.user_2fa_backup_codes | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.user_2fa_backup_codes | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.user_2fa_log | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.user_app_settings | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.user_app_settings | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.user_app_settings | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.user_mfa_settings | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.user_mfa_settings | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.user_mfa_settings | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.user_roles | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.user_roles | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.user_roles | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.user_winloss_preferences | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.user_winloss_preferences | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.user_winloss_preferences | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v4_callback_alert_settings | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v4_callback_alert_settings | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v4_callback_alert_settings | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v4_callback_alerts | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v4_callback_alerts | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v4_callback_alerts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v4_callback_dead_letters | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v4_callback_dead_letters | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v4_callback_dead_letters | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v4_callback_metrics | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v4_callback_metrics | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v4_callback_metrics | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v_active_activities | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v_active_activities | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v_active_clients | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v_active_clients | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v_active_products | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v_active_products | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v_active_suppliers | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v_active_suppliers | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v_active_teams | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v_active_teams | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v_deleted_clients | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v_pipeline_coverage_summary | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v_pipeline_coverage_summary | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v_pipeline_coverage_summary | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v_platform_slo | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v_platform_slo | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v_platform_slo | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v_platform_wal_health | authenticated | SELECT |
| public.v_platform_wal_health | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v_quote_conversion_history | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v_quote_conversion_history | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v_quote_conversion_metrics_daily | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v_quote_conversion_metrics_daily | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v_quote_to_sale_invariants | authenticated | SELECT |
| public.v_quote_to_sale_invariants | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v_rate_limit_blocked_sellers | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v_rate_limit_blocked_sellers | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.v_rate_limit_blocked_sellers | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v_security_definer_exposure | authenticated | SELECT |
| public.v_security_definer_exposure | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.v_web_vitals_p75 | authenticated | SELECT |
| public.v_web_vitals_p75 | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.victory_feed | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.victory_feed | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.victory_feed | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.web_vitals_p75_last7d | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.web_vitals_p75_last7d | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.web_vitals_p75_last7d | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.web_vitals_samples | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.web_vitals_samples | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.web_vitals_samples | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.webauthn_challenges | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.webauthn_challenges | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.webauthn_challenges | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.webauthn_credentials | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.webauthn_credentials | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.webauthn_credentials | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.webhook_deliveries | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.webhook_deliveries | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.webhook_deliveries | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.webhook_events | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.webhook_inbound_dedupe | authenticated | SELECT |
| public.webhook_inbound_dedupe | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.webhook_inbound_log | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.webhook_inbound_log | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.webhook_inbound_log | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.webhook_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.webhook_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.webhook_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.webhooks | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.webhooks | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.webhooks | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.website_visitor_logs | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.website_visitor_logs | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.website_visitor_logs | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.weekly_challenges | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.weekly_challenges | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.weekly_challenges | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.weekly_matchups | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.weekly_matchups | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.weekly_matchups | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.whatsapp_conversations | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.whatsapp_conversations | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.whatsapp_conversations | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.whatsapp_template_versions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.whatsapp_template_versions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.whatsapp_template_versions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.win_calibration_buckets | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.win_calibration_buckets | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.win_calibration_buckets | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.win_loss_analyses | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.win_loss_analyses | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.win_loss_analyses | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.win_loss_insight_comments | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.win_loss_insight_comments | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.win_loss_insight_comments | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.win_loss_insights | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.win_loss_insights | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.win_loss_insights | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.win_loss_patterns | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.win_loss_patterns | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.win_loss_patterns | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.win_probability_calibrations | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.win_probability_calibrations | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.win_probability_calibrations | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.win_probability_deal_calibrations | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.win_probability_deal_calibrations | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.win_probability_deal_calibrations | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.winloss_alert_settings | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.winloss_alert_settings | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.winloss_alert_settings | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.winloss_webhook_alerts | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.winloss_webhook_alerts | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.winloss_webhook_alerts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.winloss_webhook_dead_letters | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.winloss_webhook_dead_letters | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.winloss_webhook_dead_letters | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.winloss_webhook_deliveries | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.winloss_webhook_deliveries | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.winloss_webhook_deliveries | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.winloss_webhook_dispatch_metrics | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.winloss_webhook_dispatch_metrics | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.winloss_webhook_dispatch_metrics | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.winloss_webhook_replay_audit | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.winloss_webhook_replay_audit | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.winloss_webhook_replay_audit | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.winloss_webhook_replay_invocations | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.winloss_webhook_replay_invocations | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.winloss_webhook_replay_invocations | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.winloss_webhook_subscriptions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.winloss_webhook_subscriptions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.winloss_webhook_subscriptions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.workflow_executions | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.workflow_executions | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.workflow_executions | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.workflow_rules | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.workflow_rules | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.workflow_rules | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.workflows | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.workflows | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.workflows | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.xp_adjustments | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.xp_adjustments | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.xp_adjustments | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| public.xp_history | anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.xp_history | authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| public.xp_history | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| storage.bucket_lifecycle_states | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| storage.buckets | anon | DELETE, INSERT, SELECT, UPDATE |
| storage.buckets | authenticated | DELETE, INSERT, SELECT, UPDATE |
| storage.buckets | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| storage.buckets_analytics | anon | DELETE, INSERT, SELECT, UPDATE |
| storage.buckets_analytics | authenticated | DELETE, INSERT, SELECT, UPDATE |
| storage.buckets_analytics | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| storage.buckets_vectors | anon | SELECT |
| storage.buckets_vectors | authenticated | SELECT |
| storage.buckets_vectors | service_role | SELECT |
| storage.lifecycle_abandoned_artifacts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| storage.objects | anon | DELETE, INSERT, SELECT, UPDATE |
| storage.objects | authenticated | DELETE, INSERT, SELECT, UPDATE |
| storage.objects | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| storage.s3_multipart_uploads | anon | SELECT |
| storage.s3_multipart_uploads | authenticated | SELECT |
| storage.s3_multipart_uploads | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| storage.s3_multipart_uploads_parts | anon | SELECT |
| storage.s3_multipart_uploads_parts | authenticated | SELECT |
| storage.s3_multipart_uploads_parts | service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
| storage.vector_indexes | anon | SELECT |
| storage.vector_indexes | authenticated | SELECT |
| storage.vector_indexes | service_role | SELECT |


## Colunas (grants parciais)

_nenhum_


## Sequences (roles da API)

| sequence | role | privilégios |
|---|---|---|
| public.migration_log_id_seq | anon | USAGE, SELECT, UPDATE |
| public.migration_log_id_seq | authenticated | USAGE, SELECT, UPDATE |
| public.migration_log_id_seq | service_role | USAGE, SELECT, UPDATE |
| public.orders_conversion_seq | authenticated | USAGE, SELECT, UPDATE |
| public.orders_conversion_seq | service_role | USAGE, SELECT, UPDATE |
| public.plan_rollback_ddl_id_seq | anon | USAGE, SELECT, UPDATE |
| public.plan_rollback_ddl_id_seq | authenticated | USAGE, SELECT, UPDATE |
| public.plan_rollback_ddl_id_seq | service_role | USAGE, SELECT, UPDATE |


## Default privileges (aplicam-se a objetos NOVOS)

| schema | owner | tipo | ACL |
|---|---|---|---|
| auth | supabase_auth_admin | functions | postgres=X/supabase_auth_admin, dashboard_user=X/supabase_auth_admin |
| auth | supabase_auth_admin | sequences | postgres=rwU/supabase_auth_admin, dashboard_user=rwU/supabase_auth_admin |
| auth | supabase_auth_admin | tables | postgres=arwdDxtm/supabase_auth_admin, dashboard_user=arwdDxtm/supabase_auth_admin |
| cron | supabase_admin | functions | postgres=X*/supabase_admin |
| cron | supabase_admin | sequences | postgres=r*w*U*/supabase_admin |
| cron | supabase_admin | tables | postgres=a*r*w*d*D*x*t*m*/supabase_admin |
| extensions | supabase_admin | functions | postgres=X*/supabase_admin |
| extensions | supabase_admin | sequences | postgres=r*w*U*/supabase_admin |
| extensions | supabase_admin | tables | postgres=a*r*w*d*D*x*t*m*/supabase_admin |
| graphql | supabase_admin | functions | postgres=X/supabase_admin, anon=X/supabase_admin, authenticated=X/supabase_admin, service_role=X/supabase_admin |
| graphql | supabase_admin | sequences | postgres=rwU/supabase_admin, anon=rwU/supabase_admin, authenticated=rwU/supabase_admin, service_role=rwU/supabase_admin |
| graphql | supabase_admin | tables | postgres=arwdDxtm/supabase_admin, anon=arwdDxtm/supabase_admin, authenticated=arwdDxtm/supabase_admin, service_role=arwdDxtm/supabase_admin |
| graphql_public | supabase_admin | functions | postgres=X/supabase_admin, anon=X/supabase_admin, authenticated=X/supabase_admin, service_role=X/supabase_admin |
| graphql_public | supabase_admin | sequences | postgres=rwU/supabase_admin, anon=rwU/supabase_admin, authenticated=rwU/supabase_admin, service_role=rwU/supabase_admin |
| graphql_public | supabase_admin | tables | postgres=arwdDxtm/supabase_admin, anon=arwdDxtm/supabase_admin, authenticated=arwdDxtm/supabase_admin, service_role=arwdDxtm/supabase_admin |
| public | postgres | functions | postgres=X/postgres, authenticated=X/postgres, service_role=X/postgres |
| public | postgres | sequences | postgres=rwU/postgres, anon=rwU/postgres, authenticated=rwU/postgres, service_role=rwU/postgres |
| public | postgres | tables | postgres=arwdDxtm/postgres, anon=arwdxtm/postgres, authenticated=arwdxtm/postgres, service_role=arwdDxtm/postgres |
| public | supabase_admin | functions | postgres=X/supabase_admin, anon=X/supabase_admin, authenticated=X/supabase_admin, service_role=X/supabase_admin |
| public | supabase_admin | sequences | postgres=rwU/supabase_admin, anon=rwU/supabase_admin, authenticated=rwU/supabase_admin, service_role=rwU/supabase_admin |
| public | supabase_admin | tables | postgres=arwdDxtm/supabase_admin, anon=arwdDxtm/supabase_admin, authenticated=arwdDxtm/supabase_admin, service_role=arwdDxtm/supabase_admin |
| realtime | supabase_admin | functions | postgres=X/supabase_admin, dashboard_user=X/supabase_admin |
| realtime | supabase_admin | sequences | postgres=rwU/supabase_admin, dashboard_user=rwU/supabase_admin |
| realtime | supabase_admin | tables | postgres=a*r*wdDxtm/supabase_admin, dashboard_user=arwdDxtm/supabase_admin |
| storage | postgres | functions | postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres |
| storage | postgres | sequences | postgres=rwU/postgres, anon=rwU/postgres, authenticated=rwU/postgres, service_role=rwU/postgres |
| storage | postgres | tables | postgres=arwdDxtm/postgres, anon=arwdDxtm/postgres, authenticated=arwdDxtm/postgres, service_role=arwdDxtm/postgres |
