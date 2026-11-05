# Índices

Uso e tamanho em `stats.md`.

| tabela | índice | método | colunas | único | válido | predicado |
|---|---|---|---|---|---|---|
| public._internal_secrets | _internal_secrets_pkey | btree | key | sim | sim |  |
| public.ab_tests | ab_tests_pkey | btree | id | sim | sim |  |
| public.access_denied_logs | access_denied_logs_pkey | btree | id | sim | sim |  |
| public.access_denied_logs | idx_access_denied_created_at | btree | created_at | não | sim |  |
| public.access_denied_logs | idx_access_denied_logs_user_id | btree | user_id | não | sim |  |
| public.account_activities | account_activities_pkey | btree | id | sim | sim |  |
| public.account_activities | idx_account_activities_account | btree | account_id, occurred_at | não | sim |  |
| public.account_activities | idx_account_activities_contact_id | btree | contact_id | não | sim |  |
| public.account_activities | idx_account_activities_salesperson_id | btree | salesperson_id | não | sim |  |
| public.account_contacts | account_contacts_pkey | btree | id | sim | sim |  |
| public.account_contacts | idx_account_contacts_account | btree | account_id | não | sim |  |
| public.account_contacts | idx_account_contacts_role | btree | buying_role | não | sim |  |
| public.account_contacts | idx_account_contacts_sale_id | btree | sale_id | não | sim |  |
| public.account_plans | account_plans_pkey | btree | id | sim | sim |  |
| public.account_plans | idx_account_plans_account_id | btree | account_id | não | sim |  |
| public.account_plans | idx_account_plans_created_by | btree | created_by | não | sim |  |
| public.accounts | accounts_name_lower_uniq | btree |  | sim | sim |  |
| public.accounts | accounts_pkey | btree | id | sim | sim |  |
| public.accounts | idx_accounts_owner | btree | owner_id | não | sim |  |
| public.accounts | idx_accounts_parent | btree | parent_account_id | não | sim |  |
| public.accounts | idx_accounts_tier | btree | tier | não | sim |  |
| public.achievements | achievements_pkey | btree | id | sim | sim |  |
| public.achievements | idx_achievements_date | btree | achievement_date | não | sim |  |
| public.achievements | idx_achievements_salesperson | btree | salesperson_id | não | sim |  |
| public.achievements | idx_achievements_sp_type_date | btree | salesperson_id, achievement_type, achievement_date | não | sim |  |
| public.achievements | idx_achievements_type | btree | achievement_type | não | sim |  |
| public.active_power_ups | active_power_ups_pkey | btree | id | sim | sim |  |
| public.active_power_ups | idx_active_power_ups_active | btree | is_active, expires_at | não | sim |  |
| public.active_power_ups | idx_active_power_ups_salesperson | btree | salesperson_id | não | sim |  |
| public.active_sessions | active_sessions_pkey | btree | id | sim | sim |  |
| public.active_sessions | idx_active_sessions_activity | btree | last_activity | não | sim |  |
| public.active_sessions | idx_active_sessions_user | btree | user_id | não | sim |  |
| public.activities | activities_pkey | btree | id | sim | sim |  |
| public.activities | idx_activities_active | btree | id | não | sim | `(deleted_at IS NULL)` |
| public.activities | idx_activities_client_date | btree | client_id, created_at | não | sim |  |
| public.activities | idx_activities_client_id | btree | client_id | não | sim |  |
| public.activities | idx_activities_created_at | btree | created_at | não | sim |  |
| public.activities | idx_activities_created_brin | brin | created_at | não | sim |  |
| public.activities | idx_activities_deleted | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` |
| public.activities | idx_activities_deleted_at | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` |
| public.activities | idx_activities_deleted_by_fk | btree | deleted_by | não | sim |  |
| public.activities | idx_activities_outcome | btree | outcome | não | sim |  |
| public.activities | idx_activities_sale_id | btree | sale_id | não | sim |  |
| public.activities | idx_activities_salesperson_created | btree | salesperson_id, created_at | não | sim |  |
| public.activities | idx_activities_salesperson_type | btree | salesperson_id, activity_type | não | sim |  |
| public.activities | idx_activities_type | btree | activity_type | não | sim |  |
| public.activity_audit_logs | activity_audit_logs_pkey | btree | id | sim | sim |  |
| public.activity_audit_logs | idx_activity_audit_logs_activity_id | btree | activity_id | não | sim |  |
| public.activity_audit_logs | idx_activity_audit_logs_changed_by | btree | changed_by | não | sim |  |
| public.activity_goals | activity_goals_pkey | btree | id | sim | sim |  |
| public.activity_goals | activity_goals_salesperson_id_key | btree | salesperson_id | sim | sim |  |
| public.activity_goals | idx_activity_goals_salesperson_id | btree | salesperson_id | não | sim |  |
| public.agenda_events | agenda_events_pkey | btree | id | sim | sim |  |
| public.agenda_events | idx_agenda_events_client_id | btree | client_id | não | sim |  |
| public.agenda_events | idx_agenda_events_sale | btree | sale_id | não | sim | `(sale_id IS NOT NULL)` |
| public.agenda_events | idx_agenda_events_salesperson | btree | salesperson_id | não | sim |  |
| public.agenda_events | idx_agenda_events_scheduled | btree | scheduled_at | não | sim |  |
| public.agenda_events | idx_agenda_events_status | btree | status | não | sim |  |
| public.ai_agent_actions | ai_agent_actions_pkey | btree | id | sim | sim |  |
| public.ai_agent_actions | idx_ai_agent_actions_run | btree | run_id, step_index | não | sim |  |
| public.ai_agent_runs | ai_agent_runs_pkey | btree | id | sim | sim |  |
| public.ai_agent_runs | idx_ai_agent_runs_salesperson | btree | salesperson_id, created_at | não | sim |  |
| public.ai_agent_runs | idx_ai_agent_runs_status | btree | status | não | sim |  |
| public.ai_agent_runs | idx_ai_agent_runs_target | btree | target_entity_type, target_entity_id | não | sim |  |
| public.ai_narrative_cache | ai_narrative_cache_cache_key_key | btree | cache_key | sim | sim |  |
| public.ai_narrative_cache | ai_narrative_cache_pkey | btree | id | sim | sim |  |
| public.ai_narrative_cache | idx_ai_narrative_cache_expires | btree | expires_at | não | sim |  |
| public.ai_narrative_cache | idx_ai_narrative_cache_key | btree | cache_key | não | sim |  |
| public.ai_narrative_cache | idx_ai_narrative_cache_type | btree | narrative_type | não | sim |  |
| public.ai_sales_insights | ai_sales_insights_pkey | btree | id | sim | sim |  |
| public.ai_sales_insights | idx_ai_sales_insights_sale_id | btree | sale_id | não | sim |  |
| public.api_tokens | api_tokens_pkey | btree | id | sim | sim |  |
| public.api_tokens | api_tokens_token_key | btree | token | sim | sim |  |
| public.api_tokens | idx_api_tokens_team_id | btree | team_id | não | sim |  |
| public.app_config | app_config_pkey | btree | key | sim | sim |  |
| public.approval_decisions | approval_decisions_pkey | btree | id | sim | sim |  |
| public.approval_decisions | idx_approval_decisions_approver_id | btree | approver_id | não | sim |  |
| public.approval_decisions | idx_approval_decisions_request_id | btree | request_id | não | sim |  |
| public.approval_requests | approval_requests_pkey | btree | id | sim | sim |  |
| public.approval_requests | idx_approval_requests_deal_id | btree | deal_id | não | sim |  |
| public.approval_requests | idx_approval_requests_requester_id | btree | requester_id | não | sim |  |
| public.approval_requests | idx_approval_requests_workflow_id | btree | workflow_id | não | sim |  |
| public.approval_workflows | approval_workflows_pkey | btree | id | sim | sim |  |
| public.approval_workflows | idx_approval_workflows_created_by | btree | created_by | não | sim |  |
| public.asset_usage_logs | asset_usage_logs_pkey | btree | id | sim | sim |  |
| public.asset_usage_logs | idx_aul_asset | btree | asset_id, created_at | não | sim |  |
| public.asset_usage_logs | idx_aul_user | btree | user_id, created_at | não | sim |  |
| public.audit_log | audit_log_pkey | btree | id | sim | sim |  |
| public.audit_log | idx_audit_action | btree | action | não | sim |  |
| public.audit_log | idx_audit_created | btree | created_at | não | sim |  |
| public.audit_log | idx_audit_log_created_at | btree | created_at | não | sim |  |
| public.audit_log | idx_audit_log_created_brin | brin | created_at | não | sim |  |
| public.audit_log | idx_audit_log_user_id | btree | user_id | não | sim |  |
| public.audit_log | idx_audit_record | btree | record_id | não | sim |  |
| public.audit_log | idx_audit_table | btree | table_name, record_id | não | sim |  |
| public.audit_log | idx_audit_user | btree | user_id | não | sim |  |
| public.audit_logs | audit_logs_pkey | btree | id | sim | sim |  |
| public.audit_logs | idx_audit_logs_action | btree | action | não | sim |  |
| public.audit_logs | idx_audit_logs_actor_id | btree | actor_id | não | sim |  |
| public.audit_logs | idx_audit_logs_changed_by_changed | btree | actor_id, created_at | não | sim |  |
| public.audit_logs | idx_audit_logs_created_at | btree | created_at | não | sim |  |
| public.audit_logs | idx_audit_logs_entity | btree | entity_type, entity_id | não | sim |  |
| public.audit_logs | idx_audit_logs_record_id | btree | record_id | não | sim |  |
| public.audit_logs | idx_audit_logs_table_changed | btree | entity_type, created_at | não | sim |  |
| public.audit_logs | idx_audit_logs_table_name | btree | table_name, created_at | não | sim |  |
| public.auto_task_queue_settings | auto_task_queue_settings_pkey | btree | id | sim | sim |  |
| public.auto_task_queue_settings | auto_task_queue_settings_singleton_key | btree | singleton | sim | sim |  |
| public.automation_runs | automation_runs_pkey | btree | id | sim | sim |  |
| public.automation_runs | idx_automation_runs_status | btree | status, started_at | não | sim |  |
| public.automation_runs | idx_automation_runs_workflow | btree | workflow_id, started_at | não | sim |  |
| public.automation_workflows | automation_workflows_pkey | btree | id | sim | sim |  |
| public.automation_workflows | idx_automation_workflows_created_by | btree | created_by | não | sim |  |
| public.automation_workflows | idx_automation_workflows_trigger | btree | trigger_type | não | sim | `(is_active = true)` |
| public.available_spins | available_spins_pkey | btree | id | sim | sim |  |
| public.available_spins | available_spins_salesperson_id_key | btree | salesperson_id | sim | sim |  |
| public.battle_participants | battle_participants_battle_id_salesperson_id_key | btree | battle_id, salesperson_id | sim | sim |  |
| public.battle_participants | battle_participants_pkey | btree | id | sim | sim |  |
| public.battle_participants | idx_battle_participants_battle_id | btree | battle_id | não | sim |  |
| public.battle_participants | idx_champ_battle_participants_salesperson_id | btree | salesperson_id | não | sim |  |
| public.bitrix24_sync_logs | bitrix24_sync_logs_pkey | btree | id | sim | sim |  |
| public.bitrix24_sync_logs | idx_bitrix24_sync_logs_created_at | btree | created_at | não | sim |  |
| public.blocked_ips | blocked_ips_ip_address_key | btree | ip_address | sim | sim |  |
| public.blocked_ips | blocked_ips_pkey | btree | id | sim | sim |  |
| public.blocked_ips | idx_blocked_ips_address | btree | ip_address | não | sim |  |
| public.blocked_ips | idx_blocked_ips_blocked_by | btree | blocked_by | não | sim |  |
| public.blocked_ips | idx_blocked_ips_expires | btree | expires_at | não | sim |  |
| public.buying_committee | buying_committee_pkey | btree | id | sim | sim |  |
| public.buying_committee | idx_buying_committee_sale_id | btree | sale_id | não | sim |  |
| public.buying_committee_members | buying_committee_members_pkey | btree | id | sim | sim |  |
| public.buying_committee_members | idx_bcm_sale | btree | sale_id | não | sim |  |
| public.buying_signals | buying_signals_pkey | btree | id | sim | sim |  |
| public.buying_signals | idx_buying_signals_company_id | btree | company_id | não | sim |  |
| public.cadence_ab_assignments | cadence_ab_assignments_ab_test_id_prospect_cadence_id_key | btree | ab_test_id, prospect_cadence_id | sim | sim |  |
| public.cadence_ab_assignments | cadence_ab_assignments_pkey | btree | id | sim | sim |  |
| public.cadence_ab_assignments | idx_ab_assignments_test | btree | ab_test_id, variant | não | sim |  |
| public.cadence_ab_assignments | idx_champ_cadence_ab_assignments_cadence_id | btree | prospect_cadence_id | não | sim |  |
| public.cadence_ab_tests | cadence_ab_tests_pkey | btree | id | sim | sim |  |
| public.cadence_ab_tests | idx_cadence_ab_tests_variant_a_id | btree | variant_a_id | não | sim |  |
| public.cadence_ab_tests | idx_cadence_ab_tests_variant_b_id | btree | variant_b_id | não | sim |  |
| public.cadence_advanced_stats | cadence_advanced_stats_pkey | btree | id | sim | sim |  |
| public.cadence_advanced_stats | idx_cadence_advanced_stats_cadence_id | btree | cadence_id | não | sim |  |
| public.cadence_alert_templates | cadence_alert_templates_pkey | btree | id | sim | sim |  |
| public.cadence_enrollment_rules | cadence_enrollment_rules_pkey | btree | id | sim | sim |  |
| public.cadence_enrollment_rules | idx_enrollment_rules_active | btree | is_active, priority | não | sim | `(is_active = true)` |
| public.cadence_enrollment_rules | idx_enrollment_rules_cadence | btree | cadence_id | não | sim |  |
| public.cadence_funnel_rules | cadence_funnel_rules_pkey | btree | id | sim | sim |  |
| public.cadence_funnel_rules | idx_cadence_funnel_rules_cadence_id | btree | cadence_id | não | sim |  |
| public.cadence_outcome_rules | cadence_outcome_rules_pkey | btree | id | sim | sim |  |
| public.cadence_outcome_rules | idx_cadence_outcome_rules_email_template_id | btree | email_template_id | não | sim |  |
| public.cadence_outcome_rules | idx_cadence_outcome_rules_outcome | btree | outcome | não | sim |  |
| public.cadence_outcome_rules | idx_cadence_outcome_rules_push_template_id | btree | push_template_id | não | sim |  |
| public.cadence_steps | cadence_steps_pkey | btree | id | sim | sim |  |
| public.cadence_steps | idx_cadence_steps_cadence | btree | cadence_id, step_order | não | sim |  |
| public.cadence_tasks | cadence_tasks_pkey | btree | id | sim | sim |  |
| public.cadence_tasks | idx_cadence_tasks_cadence_step_id | btree | cadence_step_id | não | sim |  |
| public.cadence_tasks | idx_cadence_tasks_completed_at | btree | completed_at | não | sim |  |
| public.cadence_tasks | idx_cadence_tasks_prospect_cadence_id | btree | prospect_cadence_id | não | sim |  |
| public.cadence_tasks | idx_cadence_tasks_status | btree | status | não | sim |  |
| public.cadence_tasks | idx_cadence_tasks_status_date | btree | status, scheduled_date | não | sim |  |
| public.cadences | cadences_pkey | btree | id | sim | sim |  |
| public.cadences | idx_cadences_type | btree | cadence_type | não | sim |  |
| public.call_coaching_scorecards | call_coaching_scorecards_pkey | btree | id | sim | sim |  |
| public.call_coaching_scorecards | call_coaching_scorecards_recording_id_key | btree | recording_id | sim | sim |  |
| public.call_coaching_scorecards | idx_ccs_recording | btree | recording_id | não | sim |  |
| public.call_coaching_scorecards | idx_ccs_salesperson | btree | salesperson_id, calculated_at | não | sim |  |
| public.call_conversation_metrics | call_conversation_metrics_pkey | btree | id | sim | sim |  |
| public.call_conversation_metrics | call_conversation_metrics_recording_id_key | btree | recording_id | sim | sim |  |
| public.call_conversation_metrics | idx_ccm_health_calc | btree | health, calculated_at | não | sim |  |
| public.call_critical_moments | call_critical_moments_pkey | btree | id | sim | sim |  |
| public.call_critical_moments | idx_call_critical_moments_salesperson_id | btree | salesperson_id | não | sim |  |
| public.call_critical_moments | idx_ccm_owner_status_sev | btree | owner_id, status, severity, created_at | não | sim |  |
| public.call_critical_moments | idx_ccm_recording | btree | recording_id, timestamp_sec | não | sim |  |
| public.call_insights | call_insights_pkey | btree | id | sim | sim |  |
| public.call_insights | idx_call_insights_recording | btree | recording_id | sim | sim |  |
| public.call_intelligence_triggers | call_intelligence_triggers_pkey | btree | id | sim | sim |  |
| public.call_intelligence_triggers | idx_call_intelligence_triggers_target_asset_id | btree | target_asset_id | não | sim |  |
| public.call_logs | call_logs_pkey | btree | id | sim | sim |  |
| public.call_logs | idx_call_logs_call_sid | btree | call_sid | não | sim |  |
| public.call_logs | idx_call_logs_owner_created | btree | owner_id, created_at | não | sim |  |
| public.call_logs | idx_call_logs_queue_item_id | btree | queue_item_id | não | sim |  |
| public.call_logs | idx_call_logs_sale | btree | sale_id, created_at | não | sim |  |
| public.call_metric_benchmarks | call_metric_benchmarks_metric_key | btree | metric | sim | sim |  |
| public.call_metric_benchmarks | call_metric_benchmarks_pkey | btree | id | sim | sim |  |
| public.call_objection_analysis | call_objection_analysis_pkey | btree | id | sim | sim |  |
| public.call_objection_analysis | call_objection_analysis_recording_id_key | btree | recording_id | sim | sim |  |
| public.call_objections | call_objections_pkey | btree | id | sim | sim |  |
| public.call_objections | idx_call_objections_recording | btree | recording_id | não | sim |  |
| public.call_objections | idx_call_objections_type | btree | objection_type | não | sim |  |
| public.call_question_analysis | call_question_analysis_pkey | btree | id | sim | sim |  |
| public.call_question_analysis | call_question_analysis_recording_id_key | btree | recording_id | sim | sim |  |
| public.call_question_analysis | idx_call_question_analysis_health | btree | health, calculated_at | não | sim |  |
| public.call_question_analysis | idx_call_question_analysis_recording | btree | recording_id | não | sim |  |
| public.call_questions | call_questions_pkey | btree | id | sim | sim |  |
| public.call_questions | idx_call_questions_category | btree | category | não | sim |  |
| public.call_questions | idx_call_questions_recording | btree | recording_id | não | sim |  |
| public.call_recording_ingest_jobs | call_recording_ingest_jobs_idempotency_key_key | btree | idempotency_key | sim | sim |  |
| public.call_recording_ingest_jobs | call_recording_ingest_jobs_pending_idx | btree | status, next_attempt_at | não | sim | `(status = ANY (ARRAY['pending'::text, 'processing'::text]))` |
| public.call_recording_ingest_jobs | call_recording_ingest_jobs_pkey | btree | id | sim | sim |  |
| public.call_recording_ingest_jobs | call_recording_ingest_jobs_salesperson_idx | btree | salesperson_id, created_at | não | sim |  |
| public.call_recording_ingest_jobs | idx_call_recording_ingest_jobs_status_updated | btree | status, updated_at | não | sim |  |
| public.call_recordings | call_recordings_pkey | btree | id | sim | sim |  |
| public.call_recordings | call_recordings_uniq_sp_audio | btree | salesperson_id, audio_url | sim | sim | `(audio_url IS NOT NULL)` |
| public.call_recordings | idx_call_recordings_client_id | btree | client_id | não | sim |  |
| public.call_recordings | idx_call_recordings_recorded_at | btree | recorded_at | não | sim |  |
| public.call_recordings | idx_call_recordings_sale | btree | sale_id | não | sim |  |
| public.call_recordings | idx_call_recordings_salesperson | btree | salesperson_id | não | sim |  |
| public.call_recordings | idx_call_recordings_transcript_tsv | gin | transcript_tsv | não | sim |  |
| public.call_sentiment_timeline | call_sentiment_timeline_pkey | btree | id | sim | sim |  |
| public.call_sentiment_timeline | idx_sentiment_timeline_recording | btree | recording_id, start_sec | não | sim |  |
| public.call_transcripts | call_transcripts_pkey | btree | id | sim | sim |  |
| public.call_transcripts | idx_call_transcripts_recording | btree | recording_id | não | sim |  |
| public.campaign_health_alerts | campaign_health_alerts_pkey | btree | id | sim | sim |  |
| public.campaign_health_alerts | idx_campaign_health_alerts_job_type | btree | job_id, alert_type, created_at | não | sim |  |
| public.campaign_health_alerts | idx_campaign_health_alerts_owner_created | btree | owner_id, created_at | não | sim |  |
| public.campaign_health_alerts | uq_campaign_health_alerts_dedupe_bucket | btree | job_id, alert_type, dedupe_bucket | sim | sim | `(dedupe_bucket IS NOT NULL)` |
| public.category_metrics | category_metrics_date_category_key | btree | date, category | sim | sim |  |
| public.category_metrics | category_metrics_pkey | btree | id | sim | sim |  |
| public.challenge_progress | challenge_progress_challenge_id_salesperson_id_key | btree | challenge_id, salesperson_id | sim | sim |  |
| public.challenge_progress | challenge_progress_pkey | btree | id | sim | sim |  |
| public.challenge_progress | idx_challenge_progress_challenge_id | btree | challenge_id | não | sim |  |
| public.challenge_progress | idx_champ_challenge_progress_salesperson_id | btree | salesperson_id | não | sim |  |
| public.channel_credentials | channel_credentials_pkey | btree | id | sim | sim |  |
| public.channel_credentials | idx_channel_credentials_owner | btree | owner_id, channel, enabled | não | sim |  |
| public.channel_interactions | channel_interactions_pkey | btree | id | sim | sim |  |
| public.channel_interactions | idx_channel_interactions_channel | btree | channel | não | sim |  |
| public.channel_interactions | idx_channel_interactions_created | btree | created_at | não | sim |  |
| public.channel_interactions | idx_channel_interactions_deal | btree | deal_id | não | sim | `(deal_id IS NOT NULL)` |
| public.channel_interactions | idx_channel_interactions_salesperson | btree | salesperson_id | não | sim |  |
| public.channel_interactions | idx_channel_interactions_template_id | btree | template_id | não | sim |  |
| public.chat_conversations | chat_conversations_pkey | btree | id | sim | sim |  |
| public.chat_conversations | idx_chat_conversations_salesperson | btree | salesperson_id | não | sim |  |
| public.chat_messages | chat_messages_pkey | btree | id | sim | sim |  |
| public.chat_messages | idx_chat_messages_conversation | btree | conversation_id | não | sim |  |
| public.chat_messages | idx_chat_messages_created | btree | created_at | não | sim |  |
| public.churn_alert_settings | churn_alert_settings_pkey | btree | id | sim | sim |  |
| public.circuit_breaker_events | circuit_breaker_events_pkey | btree | id | sim | sim |  |
| public.circuit_breaker_events | idx_circuit_breaker_events_circuit_name | btree | circuit_name | não | sim |  |
| public.circuit_breaker_events | idx_circuit_breaker_events_created_at | btree | created_at | não | sim |  |
| public.circuit_breaker_events | idx_circuit_breaker_events_event_type | btree | event_type | não | sim |  |
| public.client_churn_alerts_state | client_churn_alerts_state_pkey | btree | id | sim | sim |  |
| public.client_churn_alerts_state | client_churn_alerts_state_salesperson_id_client_name_key | btree | salesperson_id, client_name | sim | sim |  |
| public.client_churn_alerts_state | idx_churn_alerts_state_salesperson | btree | salesperson_id | não | sim |  |
| public.client_churn_alerts_state | idx_client_churn_alerts_state_last_task_id_fk | btree | last_task_id | não | sim |  |
| public.client_interactions | client_interactions_pkey | btree | id | sim | sim |  |
| public.client_interactions | idx_client_interactions_client_id | btree | client_id | não | sim |  |
| public.client_interactions | idx_client_interactions_user_id | btree | user_id | não | sim |  |
| public.client_portfolio | client_portfolio_client_id_salesperson_id_key | btree | client_id, salesperson_id | sim | sim |  |
| public.client_portfolio | client_portfolio_pkey | btree | id | sim | sim |  |
| public.client_portfolio | idx_client_portfolio_assigned_by | btree | assigned_by | não | sim |  |
| public.client_portfolio | idx_client_portfolio_client_id | btree | client_id | não | sim |  |
| public.client_portfolio | idx_client_portfolio_deleted_at | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` |
| public.client_portfolio | idx_client_portfolio_last_purchase | btree | last_purchase_date | não | sim |  |
| public.client_portfolio | idx_client_portfolio_salesperson_status | btree | salesperson_id, status | não | sim |  |
| public.client_portfolio | idx_client_portfolio_status | btree | status | não | sim |  |
| public.client_renewals | client_renewals_pkey | btree | id | sim | sim |  |
| public.client_renewals | idx_client_renewals_client_id | btree | client_id | não | sim |  |
| public.clients | clients_pkey | btree | id | sim | sim |  |
| public.clients | idx_clients_active | btree | id | não | sim | `(deleted_at IS NULL)` |
| public.clients | idx_clients_company | gin |  | não | sim |  |
| public.clients | idx_clients_created | btree | created_at | não | sim |  |
| public.clients | idx_clients_created_at | btree | created_at | não | sim |  |
| public.clients | idx_clients_deleted | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` |
| public.clients | idx_clients_deleted_at | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` |
| public.clients | idx_clients_deleted_by | btree | deleted_by | não | sim |  |
| public.clients | idx_clients_email | btree | email | não | sim |  |
| public.clients | idx_clients_email_trgm | gin | email | não | sim |  |
| public.clients | idx_clients_is_activated | btree | is_activated | não | sim |  |
| public.clients | idx_clients_lat_lng | btree | lat, lng | não | sim | `((lat IS NOT NULL) AND (lng IS NOT NULL))` |
| public.clients | idx_clients_name_search | gin |  | não | sim |  |
| public.clients | idx_clients_name_trgm | gin | name | não | sim |  |
| public.clients | idx_clients_phone | btree | phone | não | sim |  |
| public.clients | idx_clients_total_value | btree | total_value | não | sim |  |
| public.clients | idx_clients_user_id | btree | user_id | não | sim |  |
| public.clients | ux_clients_email | btree |  | sim | sim | `((email IS NOT NULL) AND (deleted_at IS NULL))` |
| public.coaching_actions | coaching_actions_pkey | btree | id | sim | sim |  |
| public.coaching_actions | idx_coaching_actions_recording | btree | recording_id | não | sim |  |
| public.coaching_actions | idx_coaching_actions_sp_status | btree | salesperson_id, status, created_at | não | sim |  |
| public.coaching_opportunities | coaching_opportunities_pkey | btree | id | sim | sim |  |
| public.coaching_opportunities | coaching_opportunities_unique_per_day | btree | salesperson_id, metric_key | sim | sim |  |
| public.coaching_opportunities | idx_coaching_opp_detected | btree | detected_at | não | sim |  |
| public.coaching_opportunities | idx_coaching_opp_salesperson | btree | salesperson_id | não | sim |  |
| public.coaching_opportunities | idx_coaching_opp_severity | btree | severity | não | sim |  |
| public.coaching_scorecard_config | coaching_scorecard_config_pkey | btree | id | sim | sim |  |
| public.coaching_sessions | coaching_sessions_pkey | btree | id | sim | sim |  |
| public.coaching_sessions | idx_coaching_sessions_coach | btree | coach_id, scheduled_at | não | sim |  |
| public.coaching_sessions | idx_coaching_sessions_completed_sp | btree | salesperson_id, completed_at | não | sim | `((status = 'completed'::text) AND (completed_at IS NOT NULL))` |
| public.coaching_sessions | idx_coaching_sessions_salesperson | btree | salesperson_id, scheduled_at | não | sim |  |
| public.coaching_sessions | idx_coaching_sessions_status | btree | status | não | sim | `(status = 'scheduled'::text)` |
| public.coaching_skill_benchmarks | coaching_skill_benchmarks_metric_key_key | btree | metric_key | sim | sim |  |
| public.coaching_skill_benchmarks | coaching_skill_benchmarks_pkey | btree | id | sim | sim |  |
| public.cohort_analyses | cohort_analyses_pkey | btree | id | sim | sim |  |
| public.cohort_analyses | idx_cohort_analyses_owner | btree | owner_id | não | sim |  |
| public.collectible_badges | collectible_badges_pkey | btree | id | sim | sim |  |
| public.combo_tracking | combo_tracking_pkey | btree | id | sim | sim |  |
| public.combo_tracking | combo_tracking_salesperson_id_combo_date_key | btree | salesperson_id, combo_date | sim | sim |  |
| public.combo_tracking | idx_combo_tracking_salesperson_id | btree | salesperson_id | não | sim |  |
| public.commercial_approval_requests | commercial_approval_requests_pkey | btree | id | sim | sim |  |
| public.commercial_approval_requests | idx_commercial_approval_requests_approver_id | btree | approver_id | não | sim |  |
| public.commercial_approval_requests | idx_commercial_approval_requests_requester_id | btree | requester_id | não | sim |  |
| public.commission_bonus_awards | commission_bonus_awards_bonus_id_salesperson_id_period_mont_key | btree | bonus_id, salesperson_id, period_month | sim | sim |  |
| public.commission_bonus_awards | commission_bonus_awards_pkey | btree | id | sim | sim |  |
| public.commission_bonus_awards | idx_cba_salesperson_period | btree | salesperson_id, period_month | não | sim |  |
| public.commission_bonus_awards | idx_cba_status_pending | btree | status | não | sim | `(status = 'pending'::text)` |
| public.commission_bonuses | commission_bonuses_pkey | btree | id | sim | sim |  |
| public.commission_bonuses | idx_commission_bonuses_active | btree | is_active, priority | não | sim | `(is_active = true)` |
| public.commission_bonuses | idx_commission_bonuses_salesperson | btree | salesperson_id | não | sim | `(salesperson_id IS NOT NULL)` |
| public.commission_rules | commission_rules_pkey | btree | id | sim | sim |  |
| public.commission_rules | idx_commission_rules_category | btree | category | não | sim | `(is_active = true)` |
| public.commission_rules | idx_commission_rules_priority | btree | priority | não | sim | `(is_active = true)` |
| public.commission_rules | idx_commission_rules_salesperson | btree | salesperson_id | não | sim | `(is_active = true)` |
| public.commissions | commissions_pkey | btree | id | sim | sim |  |
| public.commissions | commissions_sale_salesperson_key | btree | sale_id, salesperson_id | sim | sim |  |
| public.commissions | idx_commissions_created | btree | created_at | não | sim |  |
| public.commissions | idx_commissions_rule_id | btree | rule_id | não | sim |  |
| public.commissions | idx_commissions_salesperson | btree | salesperson_id | não | sim |  |
| public.commissions | idx_commissions_status | btree | status | não | sim |  |
| public.committee_coverage_history | committee_coverage_history_pkey | btree | id | sim | sim |  |
| public.committee_coverage_history | idx_cch_sale_snapshot | btree | sale_id, snapshot_at | não | sim |  |
| public.committee_extraction_runs | committee_extraction_runs_pkey | btree | id | sim | sim |  |
| public.committee_extraction_runs | idx_cer_recording | btree | recording_id | não | sim |  |
| public.committee_extraction_runs | idx_cer_sale | btree | sale_id, created_at | não | sim |  |
| public.competitive_chat_messages | competitive_chat_messages_pkey | btree | id | sim | sim |  |
| public.competitive_chat_messages | idx_competitive_chat_messages_matchup_id | btree | matchup_id | não | sim |  |
| public.competitive_chat_messages | idx_competitive_chat_messages_salesperson_id | btree | salesperson_id | não | sim |  |
| public.competitive_chat_messages | idx_competitive_chat_messages_target_salesperson_id | btree | target_salesperson_id | não | sim |  |
| public.competitive_seasons | competitive_seasons_pkey | btree | id | sim | sim |  |
| public.competitor_mentions | competitor_mentions_pkey | btree | id | sim | sim |  |
| public.competitor_mentions | idx_competitor_mentions_competitor | btree | competitor_id | não | sim |  |
| public.competitor_mentions | idx_competitor_mentions_recording | btree | recording_id | não | sim |  |
| public.competitors_pricing | competitors_pricing_pkey | btree | id | sim | sim |  |
| public.competitors_pricing | idx_competitors_pricing_competitor_id | btree | competitor_id | não | sim |  |
| public.competitors_pricing | idx_competitors_pricing_product_id | btree | product_id | não | sim |  |
| public.competitors_registry | competitors_registry_pkey | btree | id | sim | sim |  |
| public.competitors_registry | idx_competitors_registry_active | btree | is_active | não | sim |  |
| public.consent_records | consent_records_pkey | btree | id | sim | sim |  |
| public.consent_records | idx_consent_records_purpose | btree | purpose, revoked_at | não | sim |  |
| public.consent_records | idx_consent_records_subject_email | btree |  | não | sim | `(revoked_at IS NULL)` |
| public.consent_records | idx_consent_records_subject_id | btree | subject_id | não | sim | `(revoked_at IS NULL)` |
| public.contact_engagement_score | contact_engagement_score_contact_id_contact_type_key | btree | contact_id, contact_type | sim | sim |  |
| public.contact_engagement_score | contact_engagement_score_pkey | btree | id | sim | sim |  |
| public.contact_engagement_score | idx_ces_contact | btree | contact_id, contact_type | não | sim |  |
| public.contact_engagement_score | idx_ces_score_tier | btree | tier, score | não | sim |  |
| public.contact_send_time_profile | contact_send_time_profile_contact_id_contact_type_hour_of_d_key | btree | contact_id, contact_type, hour_of_day, day_of_week | sim | sim |  |
| public.contact_send_time_profile | contact_send_time_profile_pkey | btree | id | sim | sim |  |
| public.contact_send_time_profile | idx_cstp_contact | btree | contact_id, contact_type | não | sim |  |
| public.contact_send_time_profile | idx_cstp_score | btree | contact_id, contact_type, score | não | sim |  |
| public.conversation_analyses | conversation_analyses_pkey | btree | id | sim | sim |  |
| public.conversation_analyses | idx_conv_analyses_analyzed_by | btree | analyzed_by | não | sim |  |
| public.conversation_analyses | idx_conv_analyses_created | btree | created_at | não | sim |  |
| public.conversation_analyses | idx_conv_analyses_sale | btree | sale_id | não | sim |  |
| public.conversation_analyses | idx_conv_analyses_sentiment | btree | sentiment | não | sim |  |
| public.conversation_analyses | idx_conversation_analyses_analyzed_by | btree | analyzed_by | não | sim |  |
| public.conversation_analyses | idx_conversation_analyses_created_at | btree | created_at | não | sim |  |
| public.critical_moment_notifications | critical_moment_notifications_pkey | btree | id | sim | sim |  |
| public.critical_moment_notifications | idx_cmn_recipient | btree | recipient_user_id, read_at, created_at | não | sim |  |
| public.critical_moment_notifications | idx_critical_moment_notifications_moment_id | btree | moment_id | não | sim |  |
| public.cron_failure_alerts | cron_failure_alerts_pkey | btree | id | sim | sim |  |
| public.cron_failure_alerts | cron_failure_alerts_unique | btree | jobid, start_time | sim | sim |  |
| public.cron_failure_alerts | idx_cron_failure_alerts_alerted_at | btree | alerted_at | não | sim |  |
| public.cron_failure_alerts | idx_cron_failure_alerts_jobname_alerted | btree | jobname, alerted_at | não | sim | `(jobname IS NOT NULL)` |
| public.cs_tickets | cs_tickets_pkey | btree | id | sim | sim |  |
| public.cs_tickets | idx_cs_tickets_assigned_to | btree | assigned_to | não | sim |  |
| public.cs_tickets | idx_cs_tickets_client_id | btree | client_id | não | sim |  |
| public.csat_ces_surveys | csat_ces_surveys_pkey | btree | id | sim | sim |  |
| public.csat_ces_surveys | idx_csatces_account | btree | account_id | não | sim |  |
| public.csat_ces_surveys | idx_csatces_type | btree | survey_type | não | sim |  |
| public.custom_reports | custom_reports_pkey | btree | id | sim | sim |  |
| public.custom_reports | idx_custom_reports_owner | btree | owner_id | não | sim |  |
| public.custom_reports | idx_custom_reports_shared | btree | is_shared | não | sim | `(is_shared = true)` |
| public.daily_challenge_progress | daily_challenge_progress_challenge_id_salesperson_id_key | btree | challenge_id, salesperson_id | sim | sim |  |
| public.daily_challenge_progress | daily_challenge_progress_pkey | btree | id | sim | sim |  |
| public.daily_challenge_progress | idx_daily_challenge_progress_challenge | btree | challenge_id | não | sim |  |
| public.daily_challenge_progress | idx_daily_challenge_progress_completed | btree | salesperson_id, completed_at | não | sim |  |
| public.daily_challenge_progress | idx_daily_challenge_progress_salesperson | btree | salesperson_id | não | sim |  |
| public.daily_challenge_rotations | daily_challenge_rotations_pkey | btree | challenge_date | sim | sim |  |
| public.daily_challenges | daily_challenges_pkey | btree | id | sim | sim |  |
| public.daily_challenges | idx_daily_challenges_active | btree | is_active | não | sim |  |
| public.daily_challenges | idx_daily_challenges_date | btree | challenge_date | não | sim |  |
| public.daily_challenges | idx_daily_challenges_date_active | btree | challenge_date, is_active | não | sim |  |
| public.daily_metrics | daily_metrics_date_key | btree | date | sim | sim |  |
| public.daily_metrics | daily_metrics_pkey | btree | id | sim | sim |  |
| public.daily_metrics | idx_daily_metrics_date | btree | date | não | sim |  |
| public.daily_streak_achievements | daily_streak_achievements_pkey | btree | id | sim | sim |  |
| public.daily_streak_achievements | daily_streak_achievements_salesperson_id_streak_type_key | btree | salesperson_id, streak_type | sim | sim |  |
| public.daily_streak_achievements | idx_daily_streak_achievements_salesperson | btree | salesperson_id | não | sim |  |
| public.dashboard_layouts | dashboard_layouts_pkey | btree | id | sim | sim |  |
| public.dashboard_layouts | dashboard_layouts_salesperson_id_key | btree | salesperson_id | sim | sim |  |
| public.data_access_log | data_access_log_pkey | btree | id | sim | sim |  |
| public.data_access_log | idx_data_access_log_created | btree | created_at | não | sim |  |
| public.data_access_log | idx_data_access_table | btree | table_name, created_at | não | sim |  |
| public.data_access_log | idx_data_access_user | btree | user_id, created_at | não | sim |  |
| public.data_retention_policies | data_retention_policies_pkey | btree | table_name | sim | sim |  |
| public.data_subject_requests | data_subject_requests_pkey | btree | id | sim | sim |  |
| public.data_subject_requests | idx_dsr_status_due | btree | status, due_at | não | sim |  |
| public.data_subject_requests | idx_dsr_subject_email | btree |  | não | sim |  |
| public.db_rollback_snapshots | db_rollback_snapshots_pkey | btree | id | sim | sim |  |
| public.db_rollback_snapshots | idx_db_rollback_snapshots_captured_at | btree | captured_at | não | sim |  |
| public.dead_letter_replay_audit | dead_letter_replay_audit_pkey | btree | id | sim | sim |  |
| public.dead_letter_replay_audit | idx_dlq_replay_audit_job_created | btree | job_id, created_at | não | sim |  |
| public.deal_chat_history | deal_chat_history_pkey | btree | id | sim | sim |  |
| public.deal_chat_history | idx_deal_chat_history_created_at | btree | created_at | não | sim |  |
| public.deal_chat_history | idx_deal_chat_history_deal_id | btree | deal_id | não | sim |  |
| public.deal_chat_history | idx_deal_chat_history_question_type | btree | question_type | não | sim |  |
| public.deal_chat_history | idx_deal_chat_history_salesperson_id | btree | salesperson_id | não | sim |  |
| public.deal_committee_coverage | deal_committee_coverage_pkey | btree | id | sim | sim |  |
| public.deal_committee_coverage | deal_committee_coverage_sale_id_key | btree | sale_id | sim | sim |  |
| public.deal_committee_coverage | idx_committee_coverage_owner_tier | btree | owner_id, tier | não | sim |  |
| public.deal_health_history | deal_health_history_pkey | btree | id | sim | sim |  |
| public.deal_health_history | idx_deal_health_history_sale_time | btree | sale_id, snapshot_at | não | sim |  |
| public.deal_health_scores | deal_health_scores_pkey | btree | id | sim | sim |  |
| public.deal_health_scores | idx_deal_health_sale | btree | sale_id, computed_at | não | sim |  |
| public.deal_health_scores | idx_deal_health_scores_owner_tier | btree | owner_id, tier, health_score | não | sim |  |
| public.deal_health_scores | idx_deal_health_scores_sale | btree | sale_id | não | sim |  |
| public.deal_outcomes | deal_outcomes_pkey | btree | id | sim | sim |  |
| public.deal_outcomes | idx_deal_outcomes_created | btree | created_at | não | sim |  |
| public.deal_outcomes | idx_deal_outcomes_sale | btree | sale_id | não | sim |  |
| public.deal_outcomes | idx_deal_outcomes_salesperson | btree | salesperson_id | não | sim |  |
| public.deal_probability_scores | deal_probability_scores_pkey | btree | id | sim | sim |  |
| public.deal_probability_scores | idx_dps_calculated_at | btree | calculated_at | não | sim |  |
| public.deal_probability_scores | idx_dps_sale_calculated | btree | sale_id, calculated_at | não | sim |  |
| public.deal_risk_signals | deal_risk_signals_pkey | btree | id | sim | sim |  |
| public.deal_risk_signals | idx_deal_risk_signals_resolved_by | btree | resolved_by | não | sim |  |
| public.deal_risk_signals | idx_risk_signals_sale | btree | sale_id, detected_at | não | sim |  |
| public.deal_risk_signals | idx_risk_signals_unresolved | btree | severity, detected_at | não | sim | `(resolved_at IS NULL)` |
| public.deal_stage_history | deal_stage_history_pkey | btree | id | sim | sim |  |
| public.deal_stage_history | idx_deal_stage_history_entered_at | btree | entered_at | não | sim | `(stage = ANY (ARRAY['completed'::text, 'Fechado'::text]))` |
| public.deal_stage_history | idx_deal_stage_history_sale | btree | sale_id, entered_at | não | sim |  |
| public.deal_stage_history | idx_deal_stage_history_sale_id | btree | sale_id | não | sim |  |
| public.deal_stage_transitions | deal_stage_transitions_pkey | btree | id | sim | sim |  |
| public.deal_stage_transitions | idx_dst_open | btree | sale_id | não | sim | `(exited_at IS NULL)` |
| public.deal_stage_transitions | idx_dst_sale_entered | btree | sale_id, entered_at | não | sim |  |
| public.deal_stage_transitions | idx_dst_to_stage | btree | to_stage | não | sim |  |
| public.deal_stakeholders | deal_stakeholders_pkey | btree | id | sim | sim |  |
| public.deal_stakeholders | idx_deal_stakeholders_owner | btree | owner_id | não | sim |  |
| public.deal_stakeholders | idx_deal_stakeholders_sale_role | btree | sale_id, dmu_role | não | sim |  |
| public.deal_stakeholders | idx_deal_stakeholders_unique_name | btree | sale_id | sim | sim |  |
| public.deal_velocity_alerts | deal_velocity_alerts_pkey | btree | id | sim | sim |  |
| public.deal_velocity_alerts | deal_velocity_alerts_sale_id_key | btree | sale_id | sim | sim |  |
| public.deal_velocity_alerts | idx_dva_severity | btree | severity, detected_at | não | sim |  |
| public.deal_velocity_alerts | idx_dva_stage | btree | current_stage | não | sim |  |
| public.deal_velocity_predictions | deal_velocity_predictions_pkey | btree | id | sim | sim |  |
| public.deal_velocity_predictions | deal_velocity_predictions_sale_id_key | btree | sale_id | sim | sim |  |
| public.deal_velocity_predictions | idx_dvp_calculated_at | btree | calculated_at | não | sim |  |
| public.deal_velocity_predictions | idx_dvp_owner_status | btree | owner_id, velocity_status | não | sim |  |
| public.demand_forecasts | demand_forecasts_pkey | btree | id | sim | sim |  |
| public.demand_forecasts | idx_demand_forecasts_date | btree | forecast_date | não | sim |  |
| public.demand_forecasts | idx_demand_forecasts_product_id | btree | product_id | não | sim |  |
| public.dialer_queue_items | dialer_queue_items_pkey | btree | id | sim | sim |  |
| public.dialer_queue_items | dialer_queue_items_queue_id_sale_id_key | btree | queue_id, sale_id | sim | sim |  |
| public.dialer_queue_items | idx_champ_dialer_queue_items_sale_id | btree | sale_id | não | sim |  |
| public.dialer_queue_items | idx_dialer_queue_items_queue_status_pos | btree | queue_id, status, queue_position | não | sim |  |
| public.dialer_queues | dialer_queues_pkey | btree | id | sim | sim |  |
| public.digital_signatures | digital_signatures_pkey | btree | id | sim | sim |  |
| public.digital_signatures | idx_digital_signatures_created_by | btree | created_by | não | sim |  |
| public.digital_signatures | idx_digital_signatures_status | btree | status | não | sim |  |
| public.document_signers | document_signers_pkey | btree | id | sim | sim |  |
| public.document_signers | idx_document_signers_document | btree | document_id | não | sim |  |
| public.document_signers | idx_document_signers_email | btree | email | não | sim |  |
| public.duplicate_block_logs | duplicate_block_logs_pkey | btree | id | sim | sim |  |
| public.edge_call_failures | edge_call_failures_pkey | btree | id | sim | sim |  |
| public.edge_call_failures | idx_edge_call_failures_created_at | btree | created_at | não | sim |  |
| public.edge_retry_events | edge_retry_events_pkey | btree | id | sim | sim |  |
| public.edge_retry_events | idx_edge_retry_events_fn_created | btree | function_name, created_at | não | sim |  |
| public.edge_retry_events | idx_edge_retry_events_outcome_created | btree | outcome, created_at | não | sim |  |
| public.email_bulk_drafts | email_bulk_drafts_pkey | btree | id | sim | sim |  |
| public.email_bulk_drafts | idx_email_bulk_drafts_ever_failed | btree | job_id | não | sim | `(last_error_message IS NOT NULL)` |
| public.email_bulk_drafts | idx_email_bulk_drafts_job | btree | job_id | não | sim |  |
| public.email_bulk_drafts | idx_email_bulk_drafts_job_sent_at | btree | job_id, sent_at | não | sim | `(sent_at IS NOT NULL)` |
| public.email_bulk_drafts | idx_email_bulk_drafts_pending | btree | job_id | não | sim | `(sent_at IS NULL)` |
| public.email_bulk_drafts | idx_email_bulk_drafts_recovered | btree | job_id, recovered_at | não | sim | `(recovered_at IS NOT NULL)` |
| public.email_bulk_drafts | idx_email_bulk_drafts_retry | btree | next_retry_at | não | sim | `((sent_at IS NULL) AND (error IS NOT NULL))` |
| public.email_bulk_drafts | idx_email_bulk_drafts_sent_email | btree | job_id | não | sim | `(sent_at IS NOT NULL)` |
| public.email_bulk_jobs | email_bulk_jobs_pkey | btree | id | sim | sim |  |
| public.email_bulk_jobs | idx_email_bulk_jobs_owner | btree | owner_id, created_at | não | sim |  |
| public.email_bulk_jobs | idx_email_bulk_jobs_status | btree | status | não | sim |  |
| public.email_engagement_score_history | email_engagement_score_history_pkey | btree | id | sim | sim |  |
| public.email_engagement_score_history | idx_eesh_sale_date | btree | sale_id, captured_at | não | sim |  |
| public.email_engagement_scores | email_engagement_scores_pkey | btree | id | sim | sim |  |
| public.email_engagement_scores | email_engagement_scores_sale_id_key | btree | sale_id | sim | sim |  |
| public.email_engagement_scores | idx_ees_score | btree | score | não | sim |  |
| public.email_engagement_scores | idx_ees_tier | btree | tier | não | sim |  |
| public.email_logs | email_logs_pkey | btree | id | sim | sim |  |
| public.email_logs | idx_email_logs_created_at | btree | created_at | não | sim |  |
| public.email_logs | idx_email_logs_function_name | btree | function_name | não | sim |  |
| public.email_logs | idx_email_logs_status | btree | status | não | sim |  |
| public.email_opt_outs | email_opt_outs_pkey | btree | id | sim | sim |  |
| public.email_opt_outs | idx_email_opt_outs_created_at | btree | created_at | não | sim |  |
| public.email_opt_outs | idx_email_opt_outs_email_lower_created | btree | created_at | não | sim |  |
| public.email_opt_outs | idx_email_opt_outs_source | btree | source | não | sim |  |
| public.email_opt_outs | uq_email_opt_outs_email | btree |  | sim | sim |  |
| public.email_tracking_events | email_tracking_events_pkey | btree | id | sim | sim |  |
| public.email_tracking_events | idx_email_tracking_events_sale_id | btree | sale_id | não | sim |  |
| public.email_tracking_events | idx_email_tracking_events_salesperson_id | btree | salesperson_id | não | sim |  |
| public.embedded_report_tokens | embedded_report_tokens_pkey | btree | id | sim | sim |  |
| public.embedded_report_tokens | embedded_report_tokens_public_token_key | btree | public_token | sim | sim |  |
| public.embedded_report_tokens | idx_embedded_tokens_report | btree | report_id | não | sim |  |
| public.embedded_report_tokens | idx_embedded_tokens_token | btree | public_token | não | sim |  |
| public.engagement_score_history | engagement_score_history_contact_id_contact_type_captured_a_key | btree | contact_id, contact_type, captured_at | sim | sim |  |
| public.engagement_score_history | engagement_score_history_pkey | btree | id | sim | sim |  |
| public.engagement_score_history | idx_esh_contact_date | btree | contact_id, contact_type, captured_at | não | sim |  |
| public.enriched_company_intelligence | enriched_company_intelligence_company_name_key | btree | company_name | sim | sim |  |
| public.enriched_company_intelligence | enriched_company_intelligence_pkey | btree | id | sim | sim |  |
| public.entity_versions | entity_versions_pkey | btree | id | sim | sim |  |
| public.entity_versions | idx_entity_versions_changed_by | btree | changed_by | não | sim |  |
| public.entity_versions | idx_versions_date | btree | changed_at | não | sim |  |
| public.entity_versions | idx_versions_entity | btree | entity_type, entity_id | não | sim |  |
| public.entity_versions | unique_entity_version | btree | entity_type, entity_id, version_number | sim | sim |  |
| public.error_logs | error_logs_pkey | btree | id | sim | sim |  |
| public.error_logs | idx_error_logs_created | btree | created_at | não | sim |  |
| public.error_logs | idx_error_logs_created_at | btree | created_at | não | sim |  |
| public.error_logs | idx_error_logs_severity_created_at | btree | severity, created_at | não | sim |  |
| public.error_logs | idx_error_logs_user_created | btree | user_id, created_at | não | sim |  |
| public.executive_briefings | executive_briefings_briefing_date_key | btree | briefing_date | sim | sim |  |
| public.executive_briefings | executive_briefings_pkey | btree | id | sim | sim |  |
| public.executive_briefings | idx_executive_briefings_date_desc | btree | briefing_date | não | sim |  |
| public.expansion_opportunities | expansion_opportunities_pkey | btree | id | sim | sim |  |
| public.expansion_opportunities | idx_expansion_opp_account | btree | account_id | não | sim |  |
| public.expansion_opportunities | idx_expansion_opp_status | btree | status | não | sim |  |
| public.expansion_opportunities | idx_expansion_opportunities_owner_salesperson_id | btree | owner_salesperson_id | não | sim |  |
| public.expansion_opportunities | idx_expansion_opportunities_playbook_id | btree | playbook_id | não | sim |  |
| public.expansion_playbooks | expansion_playbooks_pkey | btree | id | sim | sim |  |
| public.experiment_assignments | experiment_assignments_pkey | btree | user_id, experiment_id | sim | sim |  |
| public.experiment_assignments | idx_experiment_assignments_experiment_id_fk | btree | experiment_id | não | sim |  |
| public.experiment_assignments | idx_experiment_assignments_variant_id_fk | btree | variant_id | não | sim |  |
| public.experiment_variants | experiment_variants_pkey | btree | id | sim | sim |  |
| public.experiment_variants | idx_experiment_variants_experiment_id_fk | btree | experiment_id | não | sim |  |
| public.experiments | experiments_pkey | btree | id | sim | sim |  |
| public.external_seller_map | external_seller_map_external_source_external_id_key | btree | external_source, external_id | sim | sim |  |
| public.external_seller_map | external_seller_map_pkey | btree | id | sim | sim |  |
| public.external_seller_map | idx_champ_external_seller_map_salesperson_id | btree | salesperson_id | não | sim |  |
| public.feature_flags | feature_flags_key_key | btree | key | sim | sim |  |
| public.feature_flags | feature_flags_pkey | btree | id | sim | sim |  |
| public.feed_comments | feed_comments_pkey | btree | id | sim | sim |  |
| public.feed_comments | idx_feed_comments_feed_item_id | btree | feed_item_id | não | sim |  |
| public.feed_comments | idx_feed_comments_salesperson_id | btree | salesperson_id | não | sim |  |
| public.feed_reactions | feed_reactions_feed_item_id_salesperson_id_key | btree | feed_item_id, salesperson_id | sim | sim |  |
| public.feed_reactions | feed_reactions_pkey | btree | id | sim | sim |  |
| public.feed_reactions | idx_champ_feed_reactions_salesperson_id | btree | salesperson_id | não | sim |  |
| public.feed_reactions | idx_feed_reactions_feed_item_id | btree | feed_item_id | não | sim |  |
| public.follow_up_audit_logs | follow_up_audit_logs_pkey | btree | id | sim | sim |  |
| public.follow_up_audit_logs | idx_follow_up_audit_logs_sale_id | btree | sale_id | não | sim |  |
| public.follow_up_audit_logs | idx_follow_up_audit_logs_user_id | btree | user_id | não | sim |  |
| public.follow_up_notifications | follow_up_notifications_pkey | btree | id | sim | sim |  |
| public.follow_up_notifications | idx_follow_up_notifications_audit_log_id | btree | audit_log_id | não | sim |  |
| public.follow_up_notifications | idx_follow_up_notifications_sale_id | btree | sale_id | não | sim |  |
| public.follow_up_notifications | idx_follow_up_notifications_user_id | btree | user_id | não | sim |  |
| public.follow_up_settings | follow_up_settings_pkey | btree | id | sim | sim |  |
| public.follow_up_settings | idx_follow_up_settings_current_whatsapp_version_id | btree | current_whatsapp_version_id | não | sim |  |
| public.follow_up_templates | follow_up_templates_pkey | btree | id | sim | sim |  |
| public.follow_up_templates | idx_follow_up_templates_created_by | btree | created_by | não | sim |  |
| public.follow_up_territory_rules | follow_up_territory_rules_pkey | btree | id | sim | sim |  |
| public.follow_up_territory_rules | idx_follow_up_territory_rules_salesperson_id | btree | salesperson_id | não | sim |  |
| public.follow_up_territory_rules | idx_follow_up_territory_rules_whatsapp_template_id | btree | whatsapp_template_id | não | sim |  |
| public.forecast_accuracy | forecast_accuracy_pkey | btree | id | sim | sim |  |
| public.forecast_accuracy | forecast_accuracy_snapshot_id_key | btree | snapshot_id | sim | sim |  |
| public.forecast_accuracy | idx_forecast_accuracy_bias | btree | bias | não | sim |  |
| public.forecast_confidence_scores | forecast_confidence_scores_owner_id_source_key | btree | owner_id, source | sim | sim |  |
| public.forecast_confidence_scores | forecast_confidence_scores_pkey | btree | id | sim | sim |  |
| public.forecast_confidence_scores | idx_fcs_owner | btree | owner_id | não | sim |  |
| public.forecast_confidence_scores | idx_fcs_source | btree | source | não | sim |  |
| public.forecast_deal_contributions | forecast_deal_contributions_pkey | btree | id | sim | sim |  |
| public.forecast_deal_contributions | idx_forecast_contrib_forecast | btree | forecast_id, category | não | sim |  |
| public.forecast_deal_contributions | idx_forecast_contrib_sale | btree | sale_id | não | sim |  |
| public.forecast_narrative_dead_letters | forecast_narrative_dead_letters_pkey | btree | id | sim | sim |  |
| public.forecast_narrative_dead_letters | idx_fnd_dlq_created | btree | created_at | não | sim |  |
| public.forecast_narrative_dead_letters | idx_fnd_dlq_reason | btree | reason, created_at | não | sim |  |
| public.forecast_snapshots | forecast_snapshots_pkey | btree | id | sim | sim |  |
| public.forecast_snapshots | idx_forecast_snapshots_owner | btree | owner_id | não | sim |  |
| public.forecast_snapshots | idx_forecast_snapshots_period | btree | period_start, period_end | não | sim |  |
| public.forecast_snapshots | idx_forecast_snapshots_source | btree | source | não | sim |  |
| public.geo_access_logs | geo_access_logs_pkey | btree | id | sim | sim |  |
| public.geo_access_logs | idx_geo_access_logs_country_code | btree | country_code | não | sim |  |
| public.geo_access_logs | idx_geo_access_logs_created_at | btree | created_at | não | sim |  |
| public.geo_blocked_regions | geo_blocked_regions_country_code_key | btree | country_code | sim | sim |  |
| public.geo_blocked_regions | geo_blocked_regions_pkey | btree | id | sim | sim |  |
| public.geo_blocked_regions | idx_geo_blocked_regions_blocked_by | btree | blocked_by | não | sim |  |
| public.geo_blocked_regions | idx_geo_blocked_regions_country_code | btree | country_code | não | sim |  |
| public.geocode_cache | geocode_cache_created_at_idx | btree | created_at | não | sim |  |
| public.geocode_cache | geocode_cache_pkey | btree | query_key | sim | sim |  |
| public.icp_data | icp_data_client_id_key | btree | client_id | sim | sim |  |
| public.icp_data | icp_data_pkey | btree | id | sim | sim |  |
| public.icp_data | idx_icp_data_bitrix_id | btree | bitrix_id | não | sim |  |
| public.icp_data | idx_icp_data_client_id | btree | client_id | não | sim |  |
| public.icp_data | idx_icp_data_grupo | btree | grupo_nicho | não | sim |  |
| public.icp_data | idx_icp_data_ramo | btree | ramo_atividade | não | sim |  |
| public.icp_data | ux_icp_data_bitrix_id | btree | bitrix_id | sim | sim |  |
| public.icp_parameters | icp_parameters_pkey | btree | id | sim | sim |  |
| public.inbound_reply_events | idx_inbound_reply_events_from_email | btree |  | não | sim |  |
| public.inbound_reply_events | idx_inbound_reply_events_matched_enrollment_id | btree | matched_enrollment_id | não | sim |  |
| public.inbound_reply_events | idx_inbound_reply_events_received_at | btree | received_at | não | sim |  |
| public.inbound_reply_events | inbound_reply_events_pkey | btree | id | sim | sim |  |
| public.inbound_reply_events | uq_inbound_reply_events_provider_message_id | btree | provider, message_id | sim | sim | `(message_id IS NOT NULL)` |
| public.integration_autotest_jobs | idx_autotest_jobs_started | btree | started_at | não | sim |  |
| public.integration_autotest_jobs | integration_autotest_jobs_pkey | btree | id | sim | sim |  |
| public.integration_autotest_settings | integration_autotest_settings_pkey | btree | id | sim | sim |  |
| public.integration_autotest_settings | integration_autotest_settings_singleton_key | btree | singleton | sim | sim |  |
| public.integration_connections | idx_integration_connections_enabled | btree | enabled | não | sim |  |
| public.integration_connections | idx_integration_connections_kind | btree | kind | não | sim |  |
| public.integration_connections | integration_connections_pkey | btree | id | sim | sim |  |
| public.integration_health_checks | idx_health_conn_time | btree | connection_id, checked_at | não | sim |  |
| public.integration_health_checks | integration_health_checks_pkey | btree | id | sim | sim |  |
| public.integration_logs | idx_integration_logs_status | btree | status | não | sim |  |
| public.integration_logs | idx_integration_logs_timestamp | btree | timestamp | não | sim |  |
| public.integration_logs | idx_integration_logs_type | btree | integration_type | não | sim |  |
| public.integration_logs | idx_integration_logs_type_ts | btree | integration_type, timestamp | não | sim |  |
| public.integration_logs | integration_logs_pkey | btree | id | sim | sim |  |
| public.integration_secret_refs | idx_integration_secret_refs_credential | btree | credential_id | não | sim |  |
| public.integration_secret_refs | idx_integration_secret_refs_owner | btree | owner_id | não | sim |  |
| public.integration_secret_refs | integration_secret_refs_credential_id_key_key | btree | credential_id, key | sim | sim |  |
| public.integration_secret_refs | integration_secret_refs_pkey | btree | id | sim | sim |  |
| public.intent_audit_logs | idx_intent_audit_logs_lead_id | btree | lead_id | não | sim |  |
| public.intent_audit_logs | intent_audit_logs_pkey | btree | id | sim | sim |  |
| public.inventory_levels | idx_inventory_levels_product_id | btree | product_id | não | sim |  |
| public.inventory_levels | inventory_levels_pkey | btree | id | sim | sim |  |
| public.inventory_levels | inventory_levels_product_id_key | btree | product_id | sim | sim |  |
| public.ip_whitelist | idx_ip_whitelist_added_by | btree | added_by | não | sim |  |
| public.ip_whitelist | ip_whitelist_ip_address_key | btree | ip_address | sim | sim |  |
| public.ip_whitelist | ip_whitelist_pkey | btree | id | sim | sim |  |
| public.known_devices | idx_known_devices_fingerprint | btree | device_fingerprint | não | sim |  |
| public.known_devices | idx_known_devices_user | btree | user_id | não | sim |  |
| public.known_devices | known_devices_pkey | btree | id | sim | sim |  |
| public.known_devices | known_devices_user_id_device_fingerprint_key | btree | user_id, device_fingerprint | sim | sim |  |
| public.kudos | idx_kudos_from_salesperson_id | btree | from_salesperson_id | não | sim |  |
| public.kudos | idx_kudos_to_salesperson_id | btree | to_salesperson_id | não | sim |  |
| public.kudos | kudos_pkey | btree | id | sim | sim |  |
| public.lead_assignments | idx_lead_assignments_at | btree | assigned_at | não | sim |  |
| public.lead_assignments | idx_lead_assignments_rule_id | btree | rule_id | não | sim |  |
| public.lead_assignments | idx_lead_assignments_sale | btree | sale_id | não | sim |  |
| public.lead_assignments | idx_lead_assignments_sp | btree | salesperson_id | não | sim |  |
| public.lead_assignments | lead_assignments_pkey | btree | id | sim | sim |  |
| public.lead_churn_risk | lead_churn_risk_pkey | btree | id | sim | sim |  |
| public.lead_churn_risk | lead_churn_risk_sale_id_key | btree | sale_id | sim | sim |  |
| public.lead_detailed_logs | idx_lead_detailed_logs_client_id | btree | client_id | não | sim |  |
| public.lead_detailed_logs | idx_lead_detailed_logs_created_by | btree | created_by | não | sim |  |
| public.lead_detailed_logs | lead_detailed_logs_pkey | btree | id | sim | sim |  |
| public.lead_intelligence_metrics | lead_intelligence_metrics_pkey | btree | id | sim | sim |  |
| public.lead_routing_log | idx_lead_routing_log_client_id | btree | client_id | não | sim |  |
| public.lead_routing_log | idx_lead_routing_log_from_salesperson_id | btree | from_salesperson_id | não | sim |  |
| public.lead_routing_log | idx_lead_routing_log_to_salesperson_id | btree | to_salesperson_id | não | sim |  |
| public.lead_routing_log | lead_routing_log_pkey | btree | id | sim | sim |  |
| public.lead_routing_rules | lead_routing_rules_pkey | btree | id | sim | sim |  |
| public.lead_score_explanations | idx_lead_score_explanations_calculated | btree | calculated_at | não | sim |  |
| public.lead_score_explanations | idx_lead_score_explanations_sale | btree | sale_id | não | sim |  |
| public.lead_score_explanations | lead_score_explanations_pkey | btree | id | sim | sim |  |
| public.lead_score_explanations | lead_score_explanations_sale_id_key | btree | sale_id | sim | sim |  |
| public.lead_score_history | idx_lead_score_history_sale_time | btree | sale_id, recorded_at | não | sim |  |
| public.lead_score_history | lead_score_history_pkey | btree | id | sim | sim |  |
| public.lead_score_trends | lead_score_trends_pkey | btree | id | sim | sim |  |
| public.lead_scores | idx_lead_scores_sale_id | btree | sale_id | não | sim |  |
| public.lead_scores | lead_scores_pkey | btree | id | sim | sim |  |
| public.lead_scores | lead_scores_sale_id_key | btree | sale_id | sim | sim |  |
| public.lead_source_configs | lead_source_configs_pkey | btree | id | sim | sim |  |
| public.lead_source_configs | lead_source_configs_source_name_key | btree | source_name | sim | sim |  |
| public.league_history | idx_league_history_league_id | btree | league_id | não | sim |  |
| public.league_history | idx_league_history_salesperson_id | btree | salesperson_id | não | sim |  |
| public.league_history | league_history_pkey | btree | id | sim | sim |  |
| public.league_members | idx_league_members_league_id | btree | league_id | não | sim |  |
| public.league_members | league_members_pkey | btree | id | sim | sim |  |
| public.league_members | league_members_salesperson_id_key | btree | salesperson_id | sim | sim |  |
| public.leagues | leagues_pkey | btree | id | sim | sim |  |
| public.login_alerts | idx_login_alerts_user | btree | user_id, created_at | não | sim |  |
| public.login_alerts | login_alerts_pkey | btree | id | sim | sim |  |
| public.login_attempts | idx_login_attempts_created | btree | created_at | não | sim |  |
| public.login_attempts | idx_login_attempts_email | btree | email | não | sim |  |
| public.login_attempts | idx_login_attempts_email_created | btree | email, created_at | não | sim |  |
| public.login_attempts | idx_login_attempts_ip | btree | ip_address | não | sim |  |
| public.login_attempts | login_attempts_pkey | btree | id | sim | sim |  |
| public.maintenance_log | idx_maintenance_log_job_started | btree | job_name, started_at | não | sim |  |
| public.maintenance_log | idx_maintenance_log_started_at | btree | started_at | não | sim |  |
| public.maintenance_log | idx_maintenance_log_status | btree | status | não | sim | `(status = ANY (ARRAY['running'::text, 'failed'::text]))` |
| public.maintenance_log | maintenance_log_pkey | btree | id | sim | sim |  |
| public.message_templates | idx_message_templates_channel | btree | channel | não | sim |  |
| public.message_templates | idx_message_templates_salesperson | btree | salesperson_id | não | sim |  |
| public.message_templates | idx_message_templates_stage | btree | pipeline_stage | não | sim | `(pipeline_stage IS NOT NULL)` |
| public.message_templates | message_templates_pkey | btree | id | sim | sim |  |
| public.mfa_verification_attempts | idx_mfa_attempts_user | btree | user_id, created_at | não | sim |  |
| public.mfa_verification_attempts | mfa_verification_attempts_pkey | btree | id | sim | sim |  |
| public.migration_log | migration_log_pkey | btree | id | sim | sim |  |
| public.monthly_sales_summary | monthly_sales_summary_pkey | btree | month | sim | sim |  |
| public.mood_entries | idx_mood_entries_salesperson_id | btree | salesperson_id | não | sim |  |
| public.mood_entries | mood_entries_pkey | btree | id | sim | sim |  |
| public.mood_entries | mood_entries_salesperson_id_entry_date_key | btree | salesperson_id, entry_date | sim | sim |  |
| public.mql_qualifications | idx_mql_qualifications_qualified_by | btree | qualified_by | não | sim |  |
| public.mql_qualifications | idx_mql_qualifications_sale_id | btree | sale_id | não | sim |  |
| public.mql_qualifications | mql_qualifications_pkey | btree | id | sim | sim |  |
| public.mv_competitive_ranking | mv_competitive_ranking_id_idx | btree | id | sim | sim |  |
| public.notification_preferences | idx_notification_preferences_user | btree | user_id | não | sim |  |
| public.notification_preferences | notification_preferences_pkey | btree | id | sim | sim |  |
| public.notifications | idx_notifications_category | btree | user_id, category, created_at | não | sim |  |
| public.notifications | idx_notifications_user | btree | user_id | não | sim |  |
| public.notifications | idx_notifications_user_created | btree | user_id, created_at | não | sim |  |
| public.notifications | idx_notifications_user_unread | btree | user_id, read_at, created_at | não | sim |  |
| public.notifications | notifications_pkey | btree | id | sim | sim |  |
| public.nps_surveys | idx_nps_surveys_sale_id | btree | sale_id | não | sim |  |
| public.nps_surveys | idx_nps_surveys_salesperson_id | btree | salesperson_id | não | sim |  |
| public.nps_surveys | nps_surveys_pkey | btree | id | sim | sim |  |
| public.objection_library | idx_objection_library_best_response_recording_id | btree | best_response_recording_id | não | sim |  |
| public.objection_library | idx_objection_library_type_seen | btree | objection_type, last_seen_at | não | sim |  |
| public.objection_library | objection_library_objection_type_pattern_text_key | btree | objection_type, pattern_text | sim | sim |  |
| public.objection_library | objection_library_pkey | btree | id | sim | sim |  |
| public.objections_library | idx_objections_library_created_by | btree | created_by | não | sim |  |
| public.objections_library | idx_objections_library_tags | gin | tags | não | sim |  |
| public.objections_library | objections_library_pkey | btree | id | sim | sim |  |
| public.onboarding_journeys | idx_onboarding_account | btree | account_id | não | sim |  |
| public.onboarding_journeys | idx_onboarding_journeys_owner_salesperson_id | btree | owner_salesperson_id | não | sim |  |
| public.onboarding_journeys | idx_onboarding_status | btree | status | não | sim |  |
| public.onboarding_journeys | onboarding_journeys_pkey | btree | id | sim | sim |  |
| public.onboarding_steps | idx_onboarding_steps_journey | btree | journey_id, order_index | não | sim |  |
| public.onboarding_steps | onboarding_steps_pkey | btree | id | sim | sim |  |
| public.order_items | idx_order_items_order | btree | order_id | não | sim |  |
| public.order_items | order_items_pkey | btree | id | sim | sim |  |
| public.order_status_events | idx_order_status_events_order | btree | order_id, created_at | não | sim |  |
| public.order_status_events | order_status_events_pkey | btree | id | sim | sim |  |
| public.orders | idx_orders_client_id | btree | client_id | não | sim |  |
| public.orders | idx_orders_salesperson_id | btree | salesperson_id | não | sim |  |
| public.orders | idx_orders_status_created | btree | status, created_at | não | sim |  |
| public.orders | idx_orders_user | btree | user_id | não | sim |  |
| public.orders | orders_order_number_key | btree | order_number | sim | sim |  |
| public.orders | orders_pkey | btree | id | sim | sim |  |
| public.orders | ux_orders_quote_id | btree | quote_id | sim | sim | `(quote_id IS NOT NULL)` |
| public.outbound_messages | idx_outbound_messages_enrollment | btree | enrollment_id, created_at | não | sim |  |
| public.outbound_messages | idx_outbound_messages_owner | btree | owner_id, created_at | não | sim |  |
| public.outbound_messages | idx_outbound_messages_provider_msg | btree | provider_message_id | não | sim | `(provider_message_id IS NOT NULL)` |
| public.outbound_messages | idx_outbound_messages_step_id | btree | step_id | não | sim |  |
| public.outbound_messages | outbound_messages_pkey | btree | id | sim | sim |  |
| public.page_analytics | idx_page_analytics_entered | btree | entered_at | não | sim |  |
| public.page_analytics | idx_page_analytics_route | btree | route | não | sim |  |
| public.page_analytics | idx_page_analytics_salesperson | btree | salesperson_id | não | sim |  |
| public.page_analytics | idx_page_analytics_salesperson_route | btree | salesperson_id, route, entered_at | não | sim |  |
| public.page_analytics | page_analytics_pkey | btree | id | sim | sim |  |
| public.password_history | idx_password_history_user | btree | user_id | não | sim |  |
| public.password_history | password_history_pkey | btree | id | sim | sim |  |
| public.password_reset_requests | idx_password_reset_requests_status | btree | status, created_at | não | sim |  |
| public.password_reset_requests | idx_password_reset_requests_user_id | btree | user_id | não | sim |  |
| public.password_reset_requests | password_reset_requests_pkey | btree | id | sim | sim |  |
| public.performance_bets | idx_performance_bets_salesperson | btree | salesperson_id | não | sim |  |
| public.performance_bets | idx_performance_bets_status | btree | status | não | sim |  |
| public.performance_bets | performance_bets_pkey | btree | id | sim | sim |  |
| public.performance_impact_factors | performance_impact_factors_pkey | btree | id | sim | sim |  |
| public.permissions | permissions_name_key | btree | name | sim | sim |  |
| public.permissions | permissions_pkey | btree | id | sim | sim |  |
| public.permissions | permissions_resource_action_key | btree | resource, action | sim | sim |  |
| public.person_intelligence | person_intelligence_email_key | btree | email | sim | sim |  |
| public.person_intelligence | person_intelligence_pkey | btree | id | sim | sim |  |
| public.personal_assistant_briefings | idx_pab_salesperson_date_desc | btree | salesperson_id, briefing_date | não | sim |  |
| public.personal_assistant_briefings | personal_assistant_briefings_pkey | btree | id | sim | sim |  |
| public.personal_assistant_briefings | uq_pab_salesperson_date | btree | salesperson_id, briefing_date | sim | sim |  |
| public.personal_assistant_nudges | idx_pa_nudges_feedback | btree | feedback | não | sim | `(feedback <> 'pending'::text)` |
| public.personal_assistant_nudges | idx_pa_nudges_sp_created | btree | salesperson_id, created_at | não | sim |  |
| public.personal_assistant_nudges | personal_assistant_nudges_pkey | btree | id | sim | sim |  |
| public.pipeline_coverage_recommendations | idx_pcr_priority | btree | priority, acted_on | não | sim |  |
| public.pipeline_coverage_recommendations | idx_pcr_snapshot | btree | snapshot_id | não | sim |  |
| public.pipeline_coverage_recommendations | pipeline_coverage_recommendations_pkey | btree | id | sim | sim |  |
| public.pipeline_coverage_snapshots | idx_pcs_calculated_at | btree | calculated_at | não | sim |  |
| public.pipeline_coverage_snapshots | idx_pcs_health | btree | health | não | sim |  |
| public.pipeline_coverage_snapshots | idx_pcs_period_owner_stage | btree | period_start, owner_id, stage | não | sim |  |
| public.pipeline_coverage_snapshots | pipeline_coverage_snapshots_pkey | btree | id | sim | sim |  |
| public.pipeline_inspection_snapshots | idx_pis_inspected | btree | inspected_at | não | sim |  |
| public.pipeline_inspection_snapshots | idx_pis_sale | btree | sale_id | não | sim |  |
| public.pipeline_inspection_snapshots | pipeline_inspection_snapshots_pkey | btree | id | sim | sim |  |
| public.pipeline_inspections | idx_pipeline_inspections_inspector_id | btree | inspector_id | não | sim |  |
| public.pipeline_inspections | idx_pipeline_inspections_sale_id | btree | sale_id | não | sim |  |
| public.pipeline_inspections | pipeline_inspections_pkey | btree | id | sim | sim |  |
| public.pipeline_stages | idx_pipeline_stages_pipeline_id | btree | pipeline_id | não | sim |  |
| public.pipeline_stages | pipeline_stages_pkey | btree | id | sim | sim |  |
| public.pipelines | pipelines_pkey | btree | id | sim | sim |  |
| public.plan_rollback_ddl | plan_rollback_ddl_pkey | btree | id | sim | sim |  |
| public.playbook_items | idx_playbook_items_asset_id | btree | asset_id | não | sim |  |
| public.playbook_items | idx_playbook_items_playbook_id | btree | playbook_id | não | sim |  |
| public.playbook_items | playbook_items_pkey | btree | id | sim | sim |  |
| public.playbook_progress | idx_champ_playbook_progress_sale_id | btree | sale_id | não | sim |  |
| public.playbook_progress | idx_playbook_progress_completed_by | btree | completed_by | não | sim |  |
| public.playbook_progress | idx_playbook_progress_playbook_item_id | btree | playbook_item_id | não | sim |  |
| public.playbook_progress | playbook_progress_pkey | btree | id | sim | sim |  |
| public.playbook_progress | playbook_progress_playbook_item_id_sale_id_key | btree | playbook_item_id, sale_id | sim | sim |  |
| public.playbooks | playbooks_pkey | btree | id | sim | sim |  |
| public.portfolio_settings | portfolio_settings_pkey | btree | id | sim | sim |  |
| public.portfolio_settings | portfolio_settings_setting_key_key | btree | setting_key | sim | sim |  |
| public.price_alerts | idx_price_alerts_product | btree | product_id | não | sim |  |
| public.price_alerts | idx_price_alerts_supplier_id | btree | supplier_id | não | sim |  |
| public.price_alerts | idx_price_alerts_unread | btree | is_read | não | sim | `(is_read = false)` |
| public.price_alerts | price_alerts_pkey | btree | id | sim | sim |  |
| public.price_history | idx_price_history_product | btree | product_id | não | sim |  |
| public.price_history | idx_price_history_recorded_at | btree | recorded_at | não | sim |  |
| public.price_history | idx_price_history_supplier_id | btree | supplier_id | não | sim |  |
| public.price_history | idx_price_history_supplier_product | btree | supplier_product_id | não | sim |  |
| public.price_history | price_history_pkey | btree | id | sim | sim |  |
| public.price_protection_rules | idx_price_protection_rules_product_id | btree | product_id | não | sim |  |
| public.price_protection_rules | price_protection_rules_pkey | btree | id | sim | sim |  |
| public.pricing_rules | idx_pricing_rules_product_id | btree | product_id | não | sim |  |
| public.pricing_rules | pricing_rules_pkey | btree | id | sim | sim |  |
| public.prize_wheel_spins | idx_prize_wheel_spins_salesperson_id | btree | salesperson_id | não | sim |  |
| public.prize_wheel_spins | prize_wheel_spins_pkey | btree | id | sim | sim |  |
| public.prize_wheel_spins | prize_wheel_spins_salesperson_request_id_key | btree | salesperson_id, request_id | sim | sim | `(request_id IS NOT NULL)` |
| public.product_stock_log | idx_product_stock_log_product_id | btree | product_id | não | sim |  |
| public.product_stock_log | product_stock_log_pkey | btree | id | sim | sim |  |
| public.product_usage | idx_product_usage_client_id | btree | client_id | não | sim |  |
| public.product_usage | product_usage_pkey | btree | id | sim | sim |  |
| public.product_usage_events | idx_pue_account_time | btree | account_id, occurred_at | não | sim |  |
| public.product_usage_events | idx_pue_feature | btree | feature_key | não | sim |  |
| public.product_usage_events | product_usage_events_pkey | btree | id | sim | sim |  |
| public.product_usage_summary | product_usage_summary_pkey | btree | account_id | sim | sim |  |
| public.products | idx_products_active | btree | id | não | sim | `(deleted_at IS NULL)` |
| public.products | idx_products_category | btree | category | não | sim |  |
| public.products | idx_products_category_trgm | gin | category | não | sim |  |
| public.products | idx_products_deleted | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` |
| public.products | idx_products_deleted_at | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` |
| public.products | idx_products_deleted_by_fk | btree | deleted_by | não | sim |  |
| public.products | idx_products_name | btree | name | não | sim |  |
| public.products | idx_products_name_trgm | gin | name | não | sim |  |
| public.products | idx_products_sku | btree | sku | não | sim |  |
| public.products | products_pkey | btree | id | sim | sim |  |
| public.products | products_sku_key | btree | sku | sim | sim |  |
| public.progressive_goals | idx_progressive_goals_salesperson_id | btree | salesperson_id | não | sim |  |
| public.progressive_goals | progressive_goals_pkey | btree | id | sim | sim |  |
| public.progressive_goals | progressive_goals_salesperson_id_goal_type_key | btree | salesperson_id, goal_type | sim | sim |  |
| public.prospect_cadences | idx_champ_prospect_cadences_cadence_id | btree | cadence_id | não | sim |  |
| public.prospect_cadences | idx_prospect_cadences_active_status | btree | status, next_action_date | não | sim | `(status = 'active'::text)` |
| public.prospect_cadences | idx_prospect_cadences_enrolled_via_rule_id | btree | enrolled_via_rule_id | não | sim |  |
| public.prospect_cadences | idx_prospect_cadences_quote_id | btree | quote_id | não | sim |  |
| public.prospect_cadences | idx_prospect_cadences_sale_id | btree | sale_id | não | sim |  |
| public.prospect_cadences | idx_prospect_cadences_salesperson_id | btree | salesperson_id | não | sim |  |
| public.prospect_cadences | idx_prospect_cadences_status | btree | status | não | sim |  |
| public.prospect_cadences | prospect_cadences_pkey | btree | id | sim | sim |  |
| public.prospect_cadences | prospect_cadences_sale_id_cadence_id_key | btree | sale_id, cadence_id | sim | sim |  |
| public.push_subscriptions | push_subscriptions_pkey | btree | id | sim | sim |  |
| public.push_subscriptions | push_subscriptions_user_id_key | btree | user_id | sim | sim |  |
| public.qbr_reports | idx_qbr_period | btree | period_start | não | sim |  |
| public.qbr_reports | idx_qbr_sp | btree | salesperson_id | não | sim |  |
| public.qbr_reports | qbr_reports_pkey | btree | id | sim | sim |  |
| public.qbr_schedule | idx_qbr_schedule_account | btree | account_id | não | sim |  |
| public.qbr_schedule | idx_qbr_schedule_next | btree | next_qbr_at | não | sim |  |
| public.qbr_schedule | idx_qbr_schedule_owner_salesperson_id | btree | owner_salesperson_id | não | sim |  |
| public.qbr_schedule | qbr_schedule_pkey | btree | id | sim | sim |  |
| public.query_telemetry | idx_query_telemetry_created_at | btree | created_at | não | sim |  |
| public.query_telemetry | idx_query_telemetry_severity | btree | severity | não | sim |  |
| public.query_telemetry | idx_query_telemetry_table | btree | table_name | não | sim |  |
| public.query_telemetry | idx_query_telemetry_table_created | btree | table_name, created_at | não | sim |  |
| public.query_telemetry | idx_query_telemetry_user_created | btree | user_id, created_at | não | sim |  |
| public.query_telemetry | query_telemetry_pkey | btree | id | sim | sim |  |
| public.quota_attainment_actions | idx_quota_actions_forecast | btree | forecast_id | não | sim |  |
| public.quota_attainment_actions | idx_quota_actions_priority | btree | priority | não | sim |  |
| public.quota_attainment_actions | quota_attainment_actions_pkey | btree | id | sim | sim |  |
| public.quota_attainment_alerts | idx_qaa_salesperson | btree | salesperson_id, created_at | não | sim |  |
| public.quota_attainment_alerts | idx_qaa_unack | btree | acknowledged, created_at | não | sim |  |
| public.quota_attainment_alerts | idx_quota_attainment_alerts_prediction_id | btree | prediction_id | não | sim |  |
| public.quota_attainment_alerts | quota_attainment_alerts_pkey | btree | id | sim | sim |  |
| public.quota_attainment_forecasts | idx_quota_forecasts_computed | btree | computed_at | não | sim |  |
| public.quota_attainment_forecasts | idx_quota_forecasts_risk | btree | risk_level | não | sim |  |
| public.quota_attainment_forecasts | idx_quota_forecasts_salesperson | btree | salesperson_id | não | sim |  |
| public.quota_attainment_forecasts | quota_attainment_forecasts_pkey | btree | id | sim | sim |  |
| public.quota_attainment_forecasts | quota_forecasts_unique_period | btree | salesperson_id, period_start | sim | sim |  |
| public.quota_attainment_predictions | idx_qap_calculated | btree | calculated_at | não | sim |  |
| public.quota_attainment_predictions | idx_qap_salesperson_period | btree | salesperson_id, period_start | não | sim |  |
| public.quota_attainment_predictions | quota_attainment_predictions_pkey | btree | id | sim | sim |  |
| public.quote_conversion_audit | idx_quote_conversion_audit_created | btree | created_at | não | sim |  |
| public.quote_conversion_audit | idx_quote_conversion_audit_quote | btree | quote_id | não | sim |  |
| public.quote_conversion_audit | idx_quote_conversion_audit_request | btree | request_id | não | sim |  |
| public.quote_conversion_audit | idx_quote_conversion_audit_sale | btree | sale_id | não | sim |  |
| public.quote_conversion_audit | quote_conversion_audit_pkey | btree | id | sim | sim |  |
| public.quote_items | idx_quote_items_product_id | btree | product_id | não | sim |  |
| public.quote_items | idx_quote_items_quote_id | btree | quote_id | não | sim |  |
| public.quote_items | quote_items_pkey | btree | id | sim | sim |  |
| public.quote_sync_inbound_log | idx_qs_inbound_log_correlation | btree | correlation_key | não | sim |  |
| public.quote_sync_inbound_log | idx_qs_inbound_log_received_at | btree | received_at | não | sim |  |
| public.quote_sync_inbound_log | idx_qs_inbound_log_source_status_time | btree | source, status, received_at | não | sim |  |
| public.quote_sync_inbound_log | idx_qs_inbound_log_status | btree | status | não | sim |  |
| public.quote_sync_inbound_log | quote_sync_inbound_log_pkey | btree | id | sim | sim |  |
| public.quote_sync_logs | idx_quote_sync_logs_created_at | btree | created_at | não | sim |  |
| public.quote_sync_logs | idx_quote_sync_logs_external_id | btree | external_quote_id | não | sim |  |
| public.quote_sync_logs | idx_quote_sync_logs_source | btree | source | não | sim |  |
| public.quote_sync_logs | quote_sync_logs_pkey | btree | id | sim | sim |  |
| public.quotes | idx_quotes_client_id | btree | client_id | não | sim |  |
| public.quotes | idx_quotes_created_by | btree | created_by | não | sim |  |
| public.quotes | idx_quotes_deleted_at | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` |
| public.quotes | idx_quotes_external_quote_id | btree | external_quote_id | não | sim |  |
| public.quotes | idx_quotes_external_seller_id | btree | external_seller_id | não | sim |  |
| public.quotes | idx_quotes_quote_number | btree | quote_number | não | sim |  |
| public.quotes | idx_quotes_sale_id | btree | sale_id | não | sim |  |
| public.quotes | idx_quotes_source | btree | source | não | sim |  |
| public.quotes | idx_quotes_status | btree | status | não | sim |  |
| public.quotes | idx_quotes_sync_status | btree | sync_status | não | sim |  |
| public.quotes | idx_quotes_valid_until | btree | valid_until | não | sim |  |
| public.quotes | quotes_pkey | btree | id | sim | sim |  |
| public.quotes | ux_quotes_external_quote_id | btree | external_quote_id | sim | sim | `(external_quote_id IS NOT NULL)` |
| public.quotes_inbound | idx_quotes_inbound_client_id | btree | client_id | não | sim |  |
| public.quotes_inbound | idx_quotes_inbound_event_at | btree | event_at | não | sim |  |
| public.quotes_inbound | idx_quotes_inbound_last_event | btree | last_event | não | sim | `(last_event IS NOT NULL)` |
| public.quotes_inbound | idx_quotes_inbound_received_at | btree | received_at | não | sim |  |
| public.quotes_inbound | idx_quotes_inbound_seller_email | btree | seller_email | não | sim | `(seller_email IS NOT NULL)` |
| public.quotes_inbound | idx_quotes_inbound_source_status | btree | source, status | não | sim |  |
| public.quotes_inbound | idx_quotes_inbound_status | btree | status | não | sim |  |
| public.quotes_inbound | quotes_inbound_pkey | btree | id | sim | sim |  |
| public.quotes_inbound | quotes_inbound_quote_id_key | btree | quote_id | sim | sim |  |
| public.race_badges | idx_champ_race_badges_season_id | btree | season_id | não | sim |  |
| public.race_badges | idx_race_badges_sp | btree | salesperson_id | não | sim |  |
| public.race_badges | race_badges_pkey | btree | id | sim | sim |  |
| public.race_badges | race_badges_salesperson_id_badge_code_season_id_key | btree | salesperson_id, badge_code, season_id | sim | sim |  |
| public.race_badges | race_badges_unique_per_season | btree | salesperson_id, badge_code, season_id | sim | sim |  |
| public.race_cars | race_cars_pkey | btree | id | sim | sim |  |
| public.race_cars | race_cars_salesperson_id_key | btree | salesperson_id | sim | sim |  |
| public.race_daily_snapshots | idx_race_daily_snapshots_lookup | btree | salesperson_id, season_id, snapshot_date | não | sim |  |
| public.race_daily_snapshots | idx_race_daily_snapshots_season_id | btree | season_id | não | sim |  |
| public.race_daily_snapshots | race_daily_snapshots_pkey | btree | id | sim | sim |  |
| public.race_daily_snapshots | race_daily_snapshots_season_id_salesperson_id_snapshot_date_key | btree | season_id, salesperson_id, snapshot_date | sim | sim |  |
| public.race_events | idx_champ_race_events_salesperson_id | btree | salesperson_id | não | sim |  |
| public.race_events | idx_race_events_season | btree | season_id, created_at | não | sim |  |
| public.race_events | race_events_pkey | btree | id | sim | sim |  |
| public.race_events | race_events_sale_dedup_idx | btree | season_id, salesperson_id, event_type | sim | sim | `((metadata ->> 'sale_id'::text) IS NOT NULL)` |
| public.race_events | race_events_season_salesperson_idx | btree | season_id, salesperson_id, created_at | não | sim |  |
| public.race_overlay_telemetry | idx_race_overlay_telemetry_overlay | btree | overlay_name, last_viewed_at | não | sim |  |
| public.race_overlay_telemetry | idx_race_overlay_telemetry_user | btree | user_id | não | sim |  |
| public.race_overlay_telemetry | race_overlay_telemetry_pkey | btree | id | sim | sim |  |
| public.race_overlay_telemetry | race_overlay_telemetry_user_id_overlay_name_key | btree | user_id, overlay_name | sim | sim |  |
| public.race_powerups | idx_champ_race_powerups_salesperson_id | btree | salesperson_id | não | sim |  |
| public.race_powerups | idx_race_powerups_sp | btree | season_id, salesperson_id | não | sim |  |
| public.race_powerups | race_powerups_pkey | btree | id | sim | sim |  |
| public.race_powerups | race_powerups_source_sale_dedup_idx | btree | season_id, salesperson_id, powerup_type | sim | sim | `((effect_data ->> 'source_sale_id'::text) IS NOT NULL)` |
| public.race_reactions | idx_race_reactions_season | btree | season_id, created_at | não | sim |  |
| public.race_reactions | idx_race_reactions_target_created | btree | target_car_id, created_at | não | sim |  |
| public.race_reactions | race_reactions_pkey | btree | id | sim | sim |  |
| public.race_rivalries_persistent | idx_race_rivalries_persistent_car | btree | car_id | não | sim |  |
| public.race_rivalries_persistent | idx_race_rivalries_persistent_rival_car_id | btree | rival_car_id | não | sim |  |
| public.race_rivalries_persistent | idx_race_rivalries_persistent_season | btree | season_id | não | sim |  |
| public.race_rivalries_persistent | race_rivalries_persistent_pkey | btree | id | sim | sim |  |
| public.race_rivalries_persistent | race_rivalries_persistent_season_id_car_id_key | btree | season_id, car_id | sim | sim |  |
| public.race_scoring_rules | idx_race_scoring_rules_season | btree | season_id | não | sim |  |
| public.race_scoring_rules | race_scoring_rules_pkey | btree | id | sim | sim |  |
| public.race_scoring_rules | race_scoring_rules_season_id_metric_code_key | btree | season_id, metric_code | sim | sim |  |
| public.race_seasons | idx_race_seasons_role_status | btree | role_type, status | não | sim |  |
| public.race_seasons | idx_race_seasons_status | btree | status | não | sim |  |
| public.race_seasons | idx_race_seasons_winner_id | btree | winner_id | não | sim |  |
| public.race_seasons | race_seasons_one_active_per_role | btree | role_type | sim | sim | `(status = 'active'::text)` |
| public.race_seasons | race_seasons_pkey | btree | id | sim | sim |  |
| public.race_team_members | idx_race_team_members_car | btree | car_id | não | sim |  |
| public.race_team_members | idx_race_team_members_car_per_season | btree | car_id, team_id | sim | sim |  |
| public.race_team_members | idx_race_team_members_team | btree | team_id | não | sim |  |
| public.race_team_members | race_team_members_pkey | btree | id | sim | sim |  |
| public.race_team_members | race_team_members_team_id_car_id_key | btree | team_id, car_id | sim | sim |  |
| public.race_teams | idx_race_teams_season | btree | season_id | não | sim |  |
| public.race_teams | race_teams_pkey | btree | id | sim | sim |  |
| public.race_teams | race_teams_season_id_name_key | btree | season_id, name | sim | sim |  |
| public.race_unlocks | idx_race_unlocks_user | btree | user_id | não | sim |  |
| public.race_unlocks | race_unlocks_pkey | btree | id | sim | sim |  |
| public.race_unlocks | race_unlocks_user_key_unique | btree | user_id, unlock_key | sim | sim |  |
| public.race_user_daily_checkins | idx_champ_race_user_daily_checkins_season_id | btree | season_id | não | sim |  |
| public.race_user_daily_checkins | idx_race_user_daily_checkins_user | btree | user_id, season_id, checkin_date | não | sim |  |
| public.race_user_daily_checkins | race_user_daily_checkins_pkey | btree | id | sim | sim |  |
| public.race_user_daily_checkins | race_user_daily_checkins_user_id_season_id_checkin_date_key | btree | user_id, season_id, checkin_date | sim | sim |  |
| public.race_user_preferences | idx_race_user_preferences_user | btree | user_id | não | sim |  |
| public.race_user_preferences | race_user_preferences_pkey | btree | id | sim | sim |  |
| public.race_user_preferences | race_user_preferences_user_id_key | btree | user_id | sim | sim |  |
| public.rank_change_notifications | idx_rank_change_notifications_overtaken_by_id | btree | overtaken_by_id | não | sim |  |
| public.rank_change_notifications | idx_rank_change_notifications_salesperson_id | btree | salesperson_id | não | sim |  |
| public.rank_change_notifications | rank_change_notifications_pkey | btree | id | sim | sim |  |
| public.ranking_notifications | idx_ranking_notif_salesperson | btree | salesperson_id, created_at | não | sim |  |
| public.ranking_notifications | idx_ranking_notif_unread | btree | salesperson_id | não | sim | `(read_at IS NULL)` |
| public.ranking_notifications | ranking_notifications_pkey | btree | id | sim | sim |  |
| public.ranking_notifications | ranking_notifications_salesperson_id_period_start_key | btree | salesperson_id, period_start | sim | sim |  |
| public.rate_limit_logs | idx_rate_limit_identifier | btree | identifier, action | não | sim |  |
| public.rate_limit_logs | idx_rate_limit_window | btree | window_start, window_end | não | sim |  |
| public.rate_limit_logs | rate_limit_logs_pkey | btree | id | sim | sim |  |
| public.rate_limit_settings | rate_limit_settings_action_key | btree | action | sim | sim |  |
| public.rate_limit_settings | rate_limit_settings_pkey | btree | id | sim | sim |  |
| public.reauthentication_requests | idx_reauth_user | btree | user_id, expires_at | não | sim |  |
| public.reauthentication_requests | reauthentication_requests_pkey | btree | id | sim | sim |  |
| public.renewals | idx_renewals_account | btree | account_id | não | sim |  |
| public.renewals | idx_renewals_date | btree | renewal_date | não | sim |  |
| public.renewals | idx_renewals_owner_salesperson_id | btree | owner_salesperson_id | não | sim |  |
| public.renewals | idx_renewals_status | btree | status | não | sim |  |
| public.renewals | renewals_pkey | btree | id | sim | sim |  |
| public.report_embed_tokens | idx_report_embed_tokens_report_id | btree | report_id | não | sim |  |
| public.report_embed_tokens | idx_report_embed_tokens_token | btree | token | não | sim |  |
| public.report_embed_tokens | report_embed_tokens_pkey | btree | id | sim | sim |  |
| public.report_embed_tokens | report_embed_tokens_token_key | btree | token | sim | sim |  |
| public.report_executions | idx_report_executions_report | btree | report_id, executed_at | não | sim |  |
| public.report_executions | idx_report_executions_schedule | btree | schedule_id, executed_at | não | sim |  |
| public.report_executions | report_executions_pkey | btree | id | sim | sim |  |
| public.report_schedules | idx_report_schedules_next_run | btree | next_run_at | não | sim | `(is_active = true)` |
| public.report_schedules | idx_report_schedules_report | btree | report_id | não | sim |  |
| public.report_schedules | report_schedules_pkey | btree | id | sim | sim |  |
| public.revenue_forecasts | idx_revenue_forecasts_owner | btree | owner_id | não | sim |  |
| public.revenue_forecasts | idx_revenue_forecasts_period | btree | period_type, period_start | não | sim |  |
| public.revenue_forecasts | revenue_forecasts_pkey | btree | id | sim | sim |  |
| public.revenue_forecasts | revenue_forecasts_unique | btree | period_type, period_start | sim | sim |  |
| public.role_permissions | idx_champ_role_permissions_permission_id | btree | permission_id | não | sim |  |
| public.role_permissions | role_permissions_pkey | btree | id | sim | sim |  |
| public.role_permissions | role_permissions_role_permission_id_key | btree | role, permission_id | sim | sim |  |
| public.sale_notifications_audit | idx_sale_notifications_audit_recipient_id | btree | recipient_id | não | sim |  |
| public.sale_notifications_audit | idx_sale_notifications_audit_sale_id | btree | sale_id | não | sim |  |
| public.sale_notifications_audit | idx_sale_notifications_audit_seller_id | btree | seller_id | não | sim |  |
| public.sale_notifications_audit | sale_notifications_audit_pkey | btree | id | sim | sim |  |
| public.sales | idx_sales_account_id | btree | account_id | não | sim |  |
| public.sales | idx_sales_client_id | btree | client_id | não | sim |  |
| public.sales | idx_sales_client_name_status | btree | client_name, status | não | sim |  |
| public.sales | idx_sales_client_name_trgm | gin | client_name | não | sim |  |
| public.sales | idx_sales_closer_id | btree | closer_id | não | sim |  |
| public.sales | idx_sales_cost_source | btree | cost_source | não | sim |  |
| public.sales | idx_sales_created_at | btree | created_at | não | sim |  |
| public.sales | idx_sales_created_at_won | btree | created_at | não | sim | `(status = 'won'::text)` |
| public.sales | idx_sales_deleted_at | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` |
| public.sales | idx_sales_lost_to_competitor_id | btree | lost_to_competitor_id | não | sim |  |
| public.sales | idx_sales_markup_pct | btree | markup_pct | não | sim |  |
| public.sales | idx_sales_pipeline_id | btree | pipeline_id | não | sim |  |
| public.sales | idx_sales_product_id | btree | product_id | não | sim |  |
| public.sales | idx_sales_product_name_trgm | gin | product_name | não | sim |  |
| public.sales | idx_sales_salesperson_status | btree | salesperson_id, status | não | sim |  |
| public.sales | idx_sales_sdr_id | btree | sdr_id | não | sim |  |
| public.sales | idx_sales_source | btree | source | não | sim |  |
| public.sales | idx_sales_sp_created_status | btree | salesperson_id, created_at, status | não | sim |  |
| public.sales | idx_sales_status | btree | status | não | sim |  |
| public.sales | idx_sales_status_created_at | btree | status, created_at | não | sim |  |
| public.sales | idx_sales_status_created_at_desc | btree | status, created_at | não | sim |  |
| public.sales | idx_sales_status_is_first_sale | btree | status, is_first_sale | não | sim |  |
| public.sales | idx_sales_territory_id | btree | territory_id | não | sim |  |
| public.sales | sales_pkey | btree | id | sim | sim |  |
| public.sales | ux_sales_source_external_deal | btree | source, external_deal_id | sim | sim |  |
| public.sales_battles | idx_sales_battles_created_by | btree | created_by | não | sim |  |
| public.sales_battles | idx_sales_battles_winner_id | btree | winner_id | não | sim |  |
| public.sales_battles | sales_battles_pkey | btree | id | sim | sim |  |
| public.sales_enablement_assets | idx_sea_category | btree | category | não | sim | `(is_active = true)` |
| public.sales_enablement_assets | idx_sea_funnel_stage | btree | funnel_stage | não | sim | `(is_active = true)` |
| public.sales_enablement_assets | sales_enablement_assets_pkey | btree | id | sim | sim |  |
| public.sales_goals | idx_sales_goals_month | btree | month | não | sim |  |
| public.sales_goals | idx_sales_goals_salesperson_id | btree | salesperson_id | não | sim |  |
| public.sales_goals | idx_sales_goals_sp_month | btree | salesperson_id, month | não | sim |  |
| public.sales_goals | sales_goals_pkey | btree | id | sim | sim |  |
| public.sales_goals | sales_goals_salesperson_id_month_key | btree | salesperson_id, month | sim | sim |  |
| public.sales_streaks | sales_streaks_pkey | btree | id | sim | sim |  |
| public.sales_streaks | sales_streaks_salesperson_id_key | btree | salesperson_id | sim | sim |  |
| public.sales_territories | idx_sales_territories_current_owner_id | btree | current_owner_id | não | sim |  |
| public.sales_territories | sales_territories_pkey | btree | id | sim | sim |  |
| public.salespeople | idx_salespeople_active_role | btree | is_active, role | não | sim |  |
| public.salespeople | idx_salespeople_auth_user_id | btree | auth_user_id | não | sim |  |
| public.salespeople | idx_salespeople_lower_email | btree |  | não | sim | `(email IS NOT NULL)` |
| public.salespeople | idx_salespeople_role | btree | role | não | sim |  |
| public.salespeople | idx_salespeople_squad_id | btree | squad_id | não | sim |  |
| public.salespeople | salespeople_auth_user_id_key | btree | auth_user_id | sim | sim |  |
| public.salespeople | salespeople_email_key | btree | email | sim | sim |  |
| public.salespeople | salespeople_pkey | btree | id | sim | sim |  |
| public.salesperson_badges | idx_champ_salesperson_badges_badge_id | btree | badge_id | não | sim |  |
| public.salesperson_badges | idx_salesperson_badges_salesperson_id | btree | salesperson_id | não | sim |  |
| public.salesperson_badges | salesperson_badges_pkey | btree | id | sim | sim |  |
| public.salesperson_badges | salesperson_badges_salesperson_id_badge_id_key | btree | salesperson_id, badge_id | sim | sim |  |
| public.salesperson_coaching_aggregates | idx_sca_avg_overall | btree | avg_overall | não | sim |  |
| public.salesperson_coaching_aggregates | idx_sca_salesperson | btree | salesperson_id | não | sim |  |
| public.salesperson_coaching_aggregates | salesperson_coaching_aggregates_pkey | btree | id | sim | sim |  |
| public.salesperson_coaching_aggregates | salesperson_coaching_aggregates_salesperson_id_key | btree | salesperson_id | sim | sim |  |
| public.salesperson_commission_configs | idx_salesperson_commission_configs_salesperson_id | btree | salesperson_id | não | sim |  |
| public.salesperson_commission_configs | salesperson_commission_configs_pkey | btree | salesperson_id, month | sim | sim |  |
| public.salesperson_custom_field_values | idx_champ_salesperson_custom_field_values_field_id | btree | field_id | não | sim |  |
| public.salesperson_custom_field_values | idx_salesperson_custom_field_values_salesperson_id | btree | salesperson_id | não | sim |  |
| public.salesperson_custom_field_values | salesperson_custom_field_values_pkey | btree | id | sim | sim |  |
| public.salesperson_custom_field_values | salesperson_custom_field_values_salesperson_id_field_id_key | btree | salesperson_id, field_id | sim | sim |  |
| public.salesperson_leagues | idx_salesperson_leagues_salesperson_id | btree | salesperson_id | não | sim |  |
| public.salesperson_leagues | salesperson_leagues_pkey | btree | id | sim | sim |  |
| public.salesperson_leagues | salesperson_leagues_salesperson_id_season_number_key | btree | salesperson_id, season_number | sim | sim |  |
| public.salesperson_performance_telemetry | salesperson_performance_telemetry_pkey | btree | id | sim | sim |  |
| public.salesperson_preferences | salesperson_preferences_pkey | btree | id | sim | sim |  |
| public.salesperson_preferences | salesperson_preferences_salesperson_id_key | btree | salesperson_id | sim | sim |  |
| public.salesperson_xp | salesperson_xp_pkey | btree | id | sim | sim |  |
| public.salesperson_xp | salesperson_xp_salesperson_id_key | btree | salesperson_id | sim | sim |  |
| public.saved_filters | idx_saved_filters_default | btree | user_id, entity_type, is_default | não | sim | `(is_default = true)` |
| public.saved_filters | idx_saved_filters_entity_type | btree | entity_type | não | sim |  |
| public.saved_filters | idx_saved_filters_user | btree | user_id, entity_type | não | sim |  |
| public.saved_filters | idx_saved_filters_user_entity | btree | user_id, entity_type | não | sim |  |
| public.saved_filters | idx_saved_filters_user_id | btree | user_id | não | sim |  |
| public.saved_filters | saved_filters_pkey | btree | id | sim | sim |  |
| public.saved_filters | unique_filter_name_per_user_entity | btree | user_id, entity_type, name | sim | sim |  |
| public.scheduled_report_runs | idx_sched_runs_schedule | btree | schedule_id, started_at | não | sim |  |
| public.scheduled_report_runs | scheduled_report_runs_pkey | btree | id | sim | sim |  |
| public.scheduled_reports | idx_sched_reports_created_by | btree | created_by | não | sim |  |
| public.scheduled_reports | idx_sched_reports_next_run | btree | next_run_at | não | sim | `(enabled = true)` |
| public.scheduled_reports | idx_scheduled_reports_report_id | btree | report_id | não | sim |  |
| public.scheduled_reports | scheduled_reports_pkey | btree | id | sim | sim |  |
| public.scheduled_sends | idx_scheduled_sends_owner | btree | owner_id, created_at | não | sim |  |
| public.scheduled_sends | idx_scheduled_sends_pending | btree | status, scheduled_for | não | sim | `(status = 'pending'::text)` |
| public.scheduled_sends | idx_scheduled_sends_sale_id | btree | sale_id | não | sim |  |
| public.scheduled_sends | scheduled_sends_pkey | btree | id | sim | sim |  |
| public.score_change_logs | idx_score_change_logs_api_token_id | btree | api_token_id | não | sim |  |
| public.score_change_logs | idx_score_change_logs_salesperson_id | btree | salesperson_id | não | sim |  |
| public.score_change_logs | score_change_logs_pkey | btree | id | sim | sim |  |
| public.sdr_alert_configs | idx_sdr_alert_configs_user_id | btree | user_id | não | sim |  |
| public.sdr_alert_configs | sdr_alert_configs_pkey | btree | id | sim | sim |  |
| public.sdr_alert_history | idx_sdr_alert_history_created_at | btree | created_at | não | sim |  |
| public.sdr_alert_history | sdr_alert_history_pkey | btree | id | sim | sim |  |
| public.sdr_performance_settings | idx_sdr_performance_settings_user_id | btree | user_id | não | sim |  |
| public.sdr_performance_settings | sdr_performance_settings_pkey | btree | id | sim | sim |  |
| public.security_alert_history | idx_security_alert_history_created | btree | created_at | não | sim |  |
| public.security_alert_history | security_alert_history_pkey | btree | id | sim | sim |  |
| public.security_alert_settings | security_alert_settings_pkey | btree | id | sim | sim |  |
| public.security_events | idx_security_events_severity | btree | severity, created_at | não | sim |  |
| public.security_events | idx_security_events_type | btree | event_type | não | sim |  |
| public.security_events | idx_security_events_type_created | btree | event_type, created_at | não | sim |  |
| public.security_events | idx_security_events_user | btree | user_id, created_at | não | sim |  |
| public.security_events | idx_security_events_user_created | btree | user_id, created_at | não | sim |  |
| public.security_events | security_events_pkey | btree | id | sim | sim |  |
| public.semantic_index | idx_semantic_index_content_hash | btree | entity_type, entity_id, content_hash | não | sim |  |
| public.semantic_index | idx_semantic_index_embedding | ivfflat | embedding | não | sim |  |
| public.semantic_index | idx_semantic_index_entity | btree | entity_type, entity_id | não | sim |  |
| public.semantic_index | idx_semantic_index_salesperson | btree | salesperson_id | não | sim |  |
| public.semantic_index | semantic_index_entity_type_entity_id_key | btree | entity_type, entity_id | sim | sim |  |
| public.semantic_index | semantic_index_pkey | btree | id | sim | sim |  |
| public.send_time_profiles | send_time_profiles_pkey | btree | id | sim | sim |  |
| public.send_time_profiles | send_time_profiles_sale_id_key | btree | sale_id | sim | sim |  |
| public.sequence_enrollments | idx_seq_enrollments_contact | btree | contact_id, contact_type | não | sim |  |
| public.sequence_enrollments | idx_seq_enrollments_runner | btree | status, next_action_at | não | sim | `(status = 'active'::text)` |
| public.sequence_enrollments | idx_seq_enrollments_seq | btree | sequence_id | não | sim |  |
| public.sequence_enrollments | sequence_enrollments_pkey | btree | id | sim | sim |  |
| public.sequence_enrollments | sequence_enrollments_sequence_id_contact_id_contact_type_key | btree | sequence_id, contact_id, contact_type | sim | sim |  |
| public.sequence_step_assignments | idx_sequence_step_assignments_enrollment_id | btree | enrollment_id | não | sim |  |
| public.sequence_step_assignments | idx_ssa_step | btree | step_id | não | sim |  |
| public.sequence_step_assignments | idx_ssa_variant | btree | variant_id | não | sim |  |
| public.sequence_step_assignments | sequence_step_assignments_enrollment_id_step_id_key | btree | enrollment_id, step_id | sim | sim |  |
| public.sequence_step_assignments | sequence_step_assignments_pkey | btree | id | sim | sim |  |
| public.sequence_step_executions | idx_sequence_step_executions_step_id | btree | step_id | não | sim |  |
| public.sequence_step_executions | idx_sequence_step_executions_variant | btree | variant_id | não | sim |  |
| public.sequence_step_executions | idx_step_executions_enrollment | btree | enrollment_id, executed_at | não | sim |  |
| public.sequence_step_executions | sequence_step_executions_pkey | btree | id | sim | sim |  |
| public.sequence_step_variants | idx_sequence_step_variants_step | btree | step_id | não | sim |  |
| public.sequence_step_variants | sequence_step_variants_pkey | btree | id | sim | sim |  |
| public.sequence_step_variants | sequence_step_variants_step_id_label_key | btree | step_id, label | sim | sim |  |
| public.sequence_steps | idx_sequence_steps_seq | btree | sequence_id, step_order | não | sim |  |
| public.sequence_steps | sequence_steps_pkey | btree | id | sim | sim |  |
| public.sequence_steps | sequence_steps_sequence_id_step_order_key | btree | sequence_id, step_order | sim | sim |  |
| public.sequences | idx_sequences_enabled | btree | enabled | não | sim | `(enabled = true)` |
| public.sequences | idx_sequences_owner | btree | owner_id | não | sim |  |
| public.sequences | sequences_pkey | btree | id | sim | sim |  |
| public.session_activity | idx_session_activity_user | btree | user_id, created_at | não | sim |  |
| public.session_activity | idx_session_activity_user_created | btree | user_id, created_at | não | sim |  |
| public.session_activity | session_activity_pkey | btree | id | sim | sim |  |
| public.skill_assessments | idx_skill_assessments_assessed | btree | last_assessed_at | não | sim |  |
| public.skill_assessments | idx_skill_assessments_score | btree | score | não | sim |  |
| public.skill_assessments | idx_skill_assessments_skill | btree | skill | não | sim |  |
| public.skill_assessments | idx_skill_assessments_sp | btree | salesperson_id | não | sim |  |
| public.skill_assessments | skill_assessments_pkey | btree | id | sim | sim |  |
| public.skill_assessments | skill_assessments_salesperson_id_skill_key | btree | salesperson_id, skill | sim | sim |  |
| public.skill_development_tracks | idx_skill_tracks_created | btree | created_at | não | sim |  |
| public.skill_development_tracks | idx_skill_tracks_priority | btree | priority | não | sim |  |
| public.skill_development_tracks | idx_skill_tracks_sp | btree | salesperson_id | não | sim |  |
| public.skill_development_tracks | skill_development_tracks_pkey | btree | id | sim | sim |  |
| public.skill_development_tracks | skill_development_tracks_salesperson_id_skill_key | btree | salesperson_id, skill | sim | sim |  |
| public.sla_policies | sla_policies_pkey | btree | id | sim | sim |  |
| public.sla_policies | sla_policies_stage_key | btree | stage | sim | sim |  |
| public.sla_violations | idx_sla_violations_detected | btree | detected_at | não | sim |  |
| public.sla_violations | idx_sla_violations_policy_id | btree | policy_id | não | sim |  |
| public.sla_violations | idx_sla_violations_sale_id | btree | sale_id | não | sim |  |
| public.sla_violations | idx_sla_violations_status | btree | status | não | sim |  |
| public.sla_violations | sla_violations_pkey | btree | id | sim | sim |  |
| public.slow_query_alerts | idx_slow_query_alerts_acknowledged_by_fk | btree | acknowledged_by | não | sim |  |
| public.slow_query_alerts | idx_slow_query_alerts_last_detected | btree | last_detected_at | não | sim |  |
| public.slow_query_alerts | slow_query_alerts_active_uk | btree | query_hash | sim | sim | `(acknowledged_at IS NULL)` |
| public.slow_query_alerts | slow_query_alerts_pkey | btree | id | sim | sim |  |
| public.sms_verification_codes | idx_sms_codes_user | btree | user_id, expires_at | não | sim |  |
| public.sms_verification_codes | sms_verification_codes_pkey | btree | id | sim | sim |  |
| public.squad_members | idx_squad_members_squad_id | btree | squad_id | não | sim |  |
| public.squad_members | idx_squad_members_user | btree | user_id | não | sim |  |
| public.squad_members | squad_members_pkey | btree | squad_id, user_id | sim | sim |  |
| public.squads | squads_pkey | btree | id | sim | sim |  |
| public.stage_bottleneck_insights | idx_stage_bottleneck_owner | btree | owner_id | não | sim |  |
| public.stage_bottleneck_insights | idx_stage_bottleneck_severity | btree | severity | não | sim |  |
| public.stage_bottleneck_insights | stage_bottleneck_insights_pkey | btree | id | sim | sim |  |
| public.stage_bottleneck_insights | stage_bottleneck_insights_unique | btree | stage | sim | sim |  |
| public.stage_conversion_metrics | idx_stage_conversion_from | btree | from_stage | não | sim |  |
| public.stage_conversion_metrics | idx_stage_conversion_owner | btree | owner_id | não | sim |  |
| public.stage_conversion_metrics | stage_conversion_metrics_pkey | btree | id | sim | sim |  |
| public.stage_conversion_metrics | stage_conversion_metrics_unique | btree | from_stage, to_stage, period_start | sim | sim |  |
| public.stage_inactivity_rules | stage_inactivity_rules_pkey | btree | id | sim | sim |  |
| public.stage_inactivity_rules | stage_inactivity_rules_stage_key | btree | stage | sim | sim |  |
| public.stage_probabilities | stage_probabilities_pkey | btree | stage | sim | sim |  |
| public.stage_velocity_baselines | idx_svb_stage | btree | stage | não | sim |  |
| public.stage_velocity_baselines | stage_velocity_baselines_pkey | btree | id | sim | sim |  |
| public.stage_velocity_baselines | stage_velocity_baselines_stage_segment_key | btree | stage, segment | sim | sim |  |
| public.stage_velocity_baselines | uniq_svb_stage_owner | btree | stage | sim | sim |  |
| public.status_transitions | status_transitions_pkey | btree | entity, status_origem, status_destino | sim | sim |  |
| public.stock_movements | idx_stock_movements_created_at | btree | created_at | não | sim |  |
| public.stock_movements | idx_stock_movements_product_id | btree | product_id | não | sim |  |
| public.stock_movements | stock_movements_pkey | btree | id | sim | sim |  |
| public.supplier_order_items | idx_supplier_order_items_order_id | btree | order_id | não | sim |  |
| public.supplier_order_items | idx_supplier_order_items_product_id | btree | product_id | não | sim |  |
| public.supplier_order_items | supplier_order_items_pkey | btree | id | sim | sim |  |
| public.supplier_orders | idx_supplier_orders_status | btree | status | não | sim |  |
| public.supplier_orders | idx_supplier_orders_supplier | btree | supplier_id | não | sim |  |
| public.supplier_orders | supplier_orders_pkey | btree | id | sim | sim |  |
| public.supplier_products | idx_supplier_products_product | btree | product_id | não | sim |  |
| public.supplier_products | idx_supplier_products_supplier | btree | supplier_id | não | sim |  |
| public.supplier_products | supplier_products_pkey | btree | id | sim | sim |  |
| public.supplier_products | supplier_products_supplier_id_product_id_key | btree | supplier_id, product_id | sim | sim |  |
| public.supplier_risk_assessments | idx_supplier_risk_assessments_supplier | btree | supplier_id | não | sim |  |
| public.supplier_risk_assessments | supplier_risk_assessments_pkey | btree | id | sim | sim |  |
| public.suppliers | idx_suppliers_active | btree | id | não | sim | `(deleted_at IS NULL)` |
| public.suppliers | idx_suppliers_category | btree | category | não | sim |  |
| public.suppliers | idx_suppliers_deleted | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` |
| public.suppliers | idx_suppliers_deleted_at | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` |
| public.suppliers | idx_suppliers_deleted_by_fk | btree | deleted_by | não | sim |  |
| public.suppliers | idx_suppliers_is_active | btree | is_active | não | sim |  |
| public.suppliers | suppliers_pkey | btree | id | sim | sim |  |
| public.support_tickets | idx_support_tickets_account | btree | account_id | não | sim |  |
| public.support_tickets | idx_support_tickets_status | btree | status | não | sim |  |
| public.support_tickets | support_tickets_pkey | btree | id | sim | sim |  |
| public.support_tickets | uniq_support_tickets_external | btree | source, external_id | sim | sim | `(external_id IS NOT NULL)` |
| public.task_assignments | idx_task_assignments_assigned_to | btree | assigned_to | não | sim |  |
| public.task_assignments | idx_task_assignments_catalog | btree | catalog_id | não | sim |  |
| public.task_assignments | idx_task_assignments_parent_recurrence | btree | parent_recurrence_id | não | sim |  |
| public.task_assignments | idx_task_assignments_squad | btree | squad_id | não | sim |  |
| public.task_assignments | idx_task_assignments_status | btree | status | não | sim |  |
| public.task_assignments | task_assignments_pkey | btree | id | sim | sim |  |
| public.task_catalog | task_catalog_pkey | btree | id | sim | sim |  |
| public.tasks | idx_tasks_client_id | btree | client_id | não | sim |  |
| public.tasks | idx_tasks_created_at | btree | created_at | não | sim |  |
| public.tasks | idx_tasks_deleted_at | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` |
| public.tasks | idx_tasks_due_date | btree | due_date | não | sim |  |
| public.tasks | idx_tasks_priority | btree | priority | não | sim |  |
| public.tasks | idx_tasks_sale_id | btree | sale_id | não | sim |  |
| public.tasks | idx_tasks_salesperson_created_at | btree | salesperson_id, created_at | não | sim |  |
| public.tasks | idx_tasks_salesperson_status | btree | salesperson_id, status, due_date | não | sim |  |
| public.tasks | idx_tasks_salesperson_type | btree | salesperson_id, task_type | não | sim |  |
| public.tasks | idx_tasks_source_insight_id | btree | source_insight_id | não | sim |  |
| public.tasks | idx_tasks_status | btree | status | não | sim |  |
| public.tasks | idx_tasks_status_priority | btree | status, priority | não | sim |  |
| public.tasks | tasks_pkey | btree | id | sim | sim |  |
| public.team_closers | idx_team_closers_closer_id | btree | closer_id | não | sim |  |
| public.team_closers | idx_team_closers_team_id | btree | team_id | não | sim |  |
| public.team_closers | team_closers_pkey | btree | id | sim | sim |  |
| public.team_closers | team_closers_team_id_closer_id_key | btree | team_id, closer_id | sim | sim |  |
| public.team_custom_fields | idx_team_custom_fields_team_id | btree | team_id | não | sim |  |
| public.team_custom_fields | team_custom_fields_pkey | btree | id | sim | sim |  |
| public.team_custom_fields | team_custom_fields_team_id_field_key_key | btree | team_id, field_key | sim | sim |  |
| public.teams | idx_teams_active | btree | id | não | sim | `(deleted_at IS NULL)` |
| public.teams | idx_teams_deleted | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` |
| public.teams | idx_teams_deleted_at | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` |
| public.teams | idx_teams_deleted_by_fk | btree | deleted_by | não | sim |  |
| public.teams | idx_teams_sdr_id | btree | sdr_id | não | sim |  |
| public.teams | teams_pkey | btree | id | sim | sim |  |
| public.territories | idx_territories_current_owner_id | btree | current_owner_id | não | sim |  |
| public.territories | territories_name_key | btree | name | sim | sim |  |
| public.territories | territories_pkey | btree | id | sim | sim |  |
| public.territory_history | idx_territory_history_salesperson_id | btree | salesperson_id | não | sim |  |
| public.territory_history | idx_territory_history_territory_id | btree | territory_id | não | sim |  |
| public.territory_history | territory_history_pkey | btree | id | sim | sim |  |
| public.tournament_matches | idx_tournament_matches_player1_id | btree | player1_id | não | sim |  |
| public.tournament_matches | idx_tournament_matches_player2_id | btree | player2_id | não | sim |  |
| public.tournament_matches | idx_tournament_matches_tournament_id | btree | tournament_id | não | sim |  |
| public.tournament_matches | idx_tournament_matches_winner_id | btree | winner_id | não | sim |  |
| public.tournament_matches | tournament_matches_pkey | btree | id | sim | sim |  |
| public.tournament_participants | idx_champ_tournament_participants_salesperson_id | btree | salesperson_id | não | sim |  |
| public.tournament_participants | idx_tournament_participants_tournament_id | btree | tournament_id | não | sim |  |
| public.tournament_participants | tournament_participants_pkey | btree | id | sim | sim |  |
| public.tournament_participants | tournament_participants_tournament_id_salesperson_id_key | btree | tournament_id, salesperson_id | sim | sim |  |
| public.tournaments | idx_tournaments_created_by | btree | created_by | não | sim |  |
| public.tournaments | tournaments_pkey | btree | id | sim | sim |  |
| public.twilio_call_sessions | idx_twilio_call_sessions_queue_item_id | btree | queue_item_id | não | sim |  |
| public.twilio_call_sessions | idx_twilio_sessions_call_sid | btree | call_sid | não | sim |  |
| public.twilio_call_sessions | idx_twilio_sessions_owner_created | btree | owner_id, created_at | não | sim |  |
| public.twilio_call_sessions | idx_twilio_sessions_sale | btree | sale_id | não | sim |  |
| public.twilio_call_sessions | twilio_call_sessions_call_sid_key | btree | call_sid | sim | sim |  |
| public.twilio_call_sessions | twilio_call_sessions_pkey | btree | id | sim | sim |  |
| public.user_2fa | idx_user_2fa_enabled | btree | enabled | não | sim |  |
| public.user_2fa | idx_user_2fa_user_id | btree | user_id | não | sim |  |
| public.user_2fa | user_2fa_pkey | btree | id | sim | sim |  |
| public.user_2fa | user_2fa_user_id_key | btree | user_id | sim | sim |  |
| public.user_2fa_backup_codes | idx_backup_codes_used | btree | used, user_id | não | sim |  |
| public.user_2fa_backup_codes | idx_backup_codes_user | btree | user_id | não | sim |  |
| public.user_2fa_backup_codes | user_2fa_backup_codes_pkey | btree | id | sim | sim |  |
| public.user_2fa_log | idx_2fa_log_created | btree | created_at | não | sim |  |
| public.user_2fa_log | idx_2fa_log_user | btree | user_id, created_at | não | sim |  |
| public.user_2fa_log | user_2fa_log_pkey | btree | id | sim | sim |  |
| public.user_app_settings | idx_user_app_settings_user_key | btree | user_id, key | não | sim |  |
| public.user_app_settings | user_app_settings_pkey | btree | user_id, key | sim | sim |  |
| public.user_mfa_settings | idx_mfa_settings_user | btree | user_id | não | sim |  |
| public.user_mfa_settings | user_mfa_settings_pkey | btree | id | sim | sim |  |
| public.user_mfa_settings | user_mfa_settings_user_id_key | btree | user_id | sim | sim |  |
| public.user_roles | idx_user_roles_user_id | btree | user_id | não | sim |  |
| public.user_roles | user_roles_pkey | btree | id | sim | sim |  |
| public.user_roles | user_roles_user_id_role_key | btree | user_id, role | sim | sim |  |
| public.user_winloss_preferences | user_winloss_preferences_pkey | btree | user_id | sim | sim |  |
| public.v4_callback_alert_settings | v4_callback_alert_settings_pkey | btree | id | sim | sim |  |
| public.v4_callback_alert_settings | v4_callback_alert_settings_singleton_key | btree | singleton | sim | sim |  |
| public.v4_callback_alerts | idx_v4_callback_alerts_fired_at | btree | fired_at | não | sim |  |
| public.v4_callback_alerts | v4_callback_alerts_pkey | btree | id | sim | sim |  |
| public.v4_callback_dead_letters | idx_champ_v4_callback_dead_letters_quote_id | btree | quote_id | não | sim |  |
| public.v4_callback_dead_letters | idx_v4_dlq_external_quote | btree | external_quote_id | não | sim |  |
| public.v4_callback_dead_letters | idx_v4_dlq_pending | btree | next_retry_at | não | sim | `(resolved_at IS NULL)` |
| public.v4_callback_dead_letters | v4_callback_dead_letters_pkey | btree | id | sim | sim |  |
| public.v4_callback_metrics | v4_callback_metrics_day_key | btree | day | sim | sim |  |
| public.v4_callback_metrics | v4_callback_metrics_pkey | btree | id | sim | sim |  |
| public.victory_feed | idx_victory_feed_created | btree | created_at | não | sim |  |
| public.victory_feed | idx_victory_feed_salesperson_id | btree | salesperson_id | não | sim |  |
| public.victory_feed | victory_feed_pkey | btree | id | sim | sim |  |
| public.web_vitals_samples | idx_web_vitals_created_at | btree | created_at | não | sim |  |
| public.web_vitals_samples | idx_web_vitals_route_metric_created | btree | route, metric, created_at | não | sim |  |
| public.web_vitals_samples | idx_web_vitals_user_created | btree | user_id, created_at | não | sim |  |
| public.web_vitals_samples | web_vitals_samples_pkey | btree | id | sim | sim |  |
| public.webauthn_challenges | idx_webauthn_challenges_expires | btree | expires_at | não | sim |  |
| public.webauthn_challenges | idx_webauthn_challenges_user_id | btree | user_id | não | sim |  |
| public.webauthn_challenges | webauthn_challenges_pkey | btree | id | sim | sim |  |
| public.webauthn_credentials | idx_webauthn_credentials_credential_id | btree | credential_id | não | sim |  |
| public.webauthn_credentials | idx_webauthn_credentials_user_id | btree | user_id | não | sim |  |
| public.webauthn_credentials | webauthn_credentials_credential_id_key | btree | credential_id | sim | sim |  |
| public.webauthn_credentials | webauthn_credentials_pkey | btree | id | sim | sim |  |
| public.webhook_deliveries | idx_webhook_deliveries_created_at | btree | created_at | não | sim |  |
| public.webhook_deliveries | idx_webhook_deliveries_webhook_id | btree | webhook_id | não | sim |  |
| public.webhook_deliveries | webhook_deliveries_pkey | btree | id | sim | sim |  |
| public.webhook_events | idx_webhook_events_retry | btree | next_retry_at | não | sim | `(status = 'pending'::text)` |
| public.webhook_events | idx_webhook_events_status | btree | status | não | sim | `(status = 'pending'::text)` |
| public.webhook_events | idx_webhook_events_webhook_id | btree | webhook_id | não | sim |  |
| public.webhook_events | webhook_events_pkey | btree | id | sim | sim |  |
| public.webhook_inbound_dedupe | idx_webhook_dedupe_source_received | btree | source, received_at | não | sim |  |
| public.webhook_inbound_dedupe | idx_webhook_inbound_dedupe_received_at | btree | received_at | não | sim |  |
| public.webhook_inbound_dedupe | ux_webhook_inbound_dedupe_key | btree | correlation_key | sim | sim |  |
| public.webhook_inbound_dedupe | webhook_inbound_dedupe_first_seen_idx | btree | first_seen_at | não | sim |  |
| public.webhook_inbound_dedupe | webhook_inbound_dedupe_pkey | btree | id | sim | sim |  |
| public.webhook_inbound_log | idx_webhook_inbound_log_correlation_key | btree | correlation_key | não | sim | `(correlation_key IS NOT NULL)` |
| public.webhook_inbound_log | idx_webhook_inbound_log_received_at | btree | received_at | não | sim |  |
| public.webhook_inbound_log | idx_webhook_inbound_log_source_outcome_time | btree | source, outcome, received_at | não | sim |  |
| public.webhook_inbound_log | idx_webhook_inbound_log_source_received | btree | source, received_at | não | sim |  |
| public.webhook_inbound_log | webhook_inbound_log_outcome_idx | btree | outcome, received_at | não | sim |  |
| public.webhook_inbound_log | webhook_inbound_log_pkey | btree | id | sim | sim |  |
| public.webhook_logs | idx_webhook_logs_created_at | btree | created_at | não | sim |  |
| public.webhook_logs | idx_webhook_logs_status | btree | status | não | sim |  |
| public.webhook_logs | idx_webhook_logs_webhook_id | btree | webhook_id | não | sim |  |
| public.webhook_logs | webhook_logs_pkey | btree | id | sim | sim |  |
| public.webhooks | idx_webhooks_created_by | btree | created_by | não | sim |  |
| public.webhooks | idx_webhooks_enabled | btree | enabled | não | sim |  |
| public.webhooks | webhooks_pkey | btree | id | sim | sim |  |
| public.website_visitor_logs | idx_website_visitor_logs_domain_identified | btree | domain, identified_at | não | sim |  |
| public.website_visitor_logs | idx_website_visitor_logs_retention | btree | retention_expires_at | não | sim | `(consent_record_id IS NULL)` |
| public.website_visitor_logs | website_visitor_logs_pkey | btree | id | sim | sim |  |
| public.weekly_challenges | idx_weekly_challenges_active | btree | is_active, start_date, end_date | não | sim |  |
| public.weekly_challenges | weekly_challenges_pkey | btree | id | sim | sim |  |
| public.weekly_matchups | idx_weekly_matchups_salesperson_a_id | btree | salesperson_a_id | não | sim |  |
| public.weekly_matchups | idx_weekly_matchups_salesperson_b_id | btree | salesperson_b_id | não | sim |  |
| public.weekly_matchups | idx_weekly_matchups_winner_id | btree | winner_id | não | sim |  |
| public.weekly_matchups | weekly_matchups_pkey | btree | id | sim | sim |  |
| public.whatsapp_conversations | idx_whatsapp_conversations_sale_id | btree | sale_id | não | sim |  |
| public.whatsapp_conversations | idx_whatsapp_conversations_sender_id | btree | sender_id | não | sim |  |
| public.whatsapp_conversations | whatsapp_conversations_external_message_id_key | btree | external_message_id | sim | sim |  |
| public.whatsapp_conversations | whatsapp_conversations_pkey | btree | id | sim | sim |  |
| public.whatsapp_template_versions | whatsapp_template_versions_pkey | btree | id | sim | sim |  |
| public.win_calibration_buckets | idx_win_calibration_buckets_stage_segment | btree | stage, segment | não | sim |  |
| public.win_calibration_buckets | win_calibration_buckets_pkey | btree | id | sim | sim |  |
| public.win_calibration_buckets | win_calibration_buckets_stage_segment_bucket_min_key | btree | stage, segment, bucket_min | sim | sim |  |
| public.win_loss_analyses | idx_wla_analyzed_at | btree | analyzed_at | não | sim |  |
| public.win_loss_analyses | idx_wla_competitor | btree | competitor | não | sim |  |
| public.win_loss_analyses | idx_wla_outcome | btree | outcome | não | sim |  |
| public.win_loss_analyses | idx_wla_outcome_segment | btree | outcome, segment | não | sim |  |
| public.win_loss_analyses | idx_wla_segment | btree | segment | não | sim |  |
| public.win_loss_analyses | win_loss_analyses_pkey | btree | id | sim | sim |  |
| public.win_loss_analyses | win_loss_analyses_sale_id_key | btree | sale_id | sim | sim |  |
| public.win_loss_insight_comments | idx_wl_insight_comments_insight | btree | insight_id, created_at | não | sim |  |
| public.win_loss_insight_comments | win_loss_insight_comments_pkey | btree | id | sim | sim |  |
| public.win_loss_insights | idx_wli_created | btree | created_at | não | sim |  |
| public.win_loss_insights | idx_wli_severity | btree | severity | não | sim |  |
| public.win_loss_insights | win_loss_insights_pkey | btree | id | sim | sim |  |
| public.win_loss_patterns | idx_wlp_freq | btree | frequency | não | sim |  |
| public.win_loss_patterns | idx_wlp_pattern_type | btree | pattern_type, frequency | não | sim |  |
| public.win_loss_patterns | idx_wlp_type | btree | pattern_type | não | sim |  |
| public.win_loss_patterns | uq_wlp_type_label | btree | pattern_type, label | sim | sim |  |
| public.win_loss_patterns | win_loss_patterns_pkey | btree | id | sim | sim |  |
| public.win_probability_calibrations | idx_wpc_calculated_at | btree | calculated_at | não | sim |  |
| public.win_probability_calibrations | idx_wpc_scope_stage | btree | scope, scope_value, stage | não | sim |  |
| public.win_probability_calibrations | win_probability_calibrations_pkey | btree | id | sim | sim |  |
| public.win_probability_calibrations | win_probability_calibrations_scope_scope_value_stage_key | btree | scope, scope_value, stage | sim | sim |  |
| public.win_probability_deal_calibrations | idx_wpdc_flag | btree | flag | não | sim |  |
| public.win_probability_deal_calibrations | idx_wpdc_sale | btree | sale_id | não | sim |  |
| public.win_probability_deal_calibrations | idx_wpdc_stage_segment | btree | stage, segment | não | sim |  |
| public.win_probability_deal_calibrations | win_probability_deal_calibrations_pkey | btree | id | sim | sim |  |
| public.win_probability_deal_calibrations | win_probability_deal_calibrations_sale_id_key | btree | sale_id | sim | sim |  |
| public.winloss_alert_settings | idx_winloss_alert_settings_updated_by | btree | updated_by | não | sim |  |
| public.winloss_alert_settings | winloss_alert_settings_pkey | btree | id | sim | sim |  |
| public.winloss_alert_settings | winloss_alert_settings_singleton_key | btree | singleton | sim | sim |  |
| public.winloss_webhook_alerts | idx_winloss_webhook_alerts_fired_at | btree | fired_at | não | sim |  |
| public.winloss_webhook_alerts | idx_winloss_webhook_alerts_request_id | btree | request_id | não | sim |  |
| public.winloss_webhook_alerts | idx_winloss_webhook_alerts_sub | btree | subscription_id, fired_at | não | sim |  |
| public.winloss_webhook_alerts | idx_winloss_webhook_alerts_sub_kind_fired | btree | subscription_id, kind, fired_at | não | sim |  |
| public.winloss_webhook_alerts | winloss_webhook_alerts_pkey | btree | id | sim | sim |  |
| public.winloss_webhook_dead_letters | idx_winloss_dlq_status_created | btree | status, created_at | não | sim |  |
| public.winloss_webhook_dead_letters | idx_winloss_dlq_subscription | btree | subscription_id | não | sim |  |
| public.winloss_webhook_dead_letters | idx_winloss_webhook_dlq_last_replay_request_id | btree | last_replay_request_id | não | sim |  |
| public.winloss_webhook_dead_letters | winloss_webhook_dead_letters_pkey | btree | id | sim | sim |  |
| public.winloss_webhook_deliveries | idx_winloss_webhook_deliveries_event | btree | event, created_at | não | sim |  |
| public.winloss_webhook_deliveries | idx_winloss_webhook_deliveries_request_id | btree | request_id | não | sim | `(request_id IS NOT NULL)` |
| public.winloss_webhook_deliveries | idx_winloss_webhook_deliveries_sub | btree | subscription_id, created_at | não | sim |  |
| public.winloss_webhook_deliveries | winloss_webhook_deliveries_pkey | btree | id | sim | sim |  |
| public.winloss_webhook_dispatch_metrics | idx_winloss_webhook_dispatch_metrics_event_created | btree | event, created_at | não | sim |  |
| public.winloss_webhook_dispatch_metrics | idx_winloss_webhook_dispatch_metrics_metric_created | btree | metric, created_at | não | sim |  |
| public.winloss_webhook_dispatch_metrics | winloss_webhook_dispatch_metrics_pkey | btree | id | sim | sim |  |
| public.winloss_webhook_replay_audit | idx_wh_replay_audit_created | btree | created_at | não | sim |  |
| public.winloss_webhook_replay_audit | idx_wh_replay_audit_dead_letter | btree | dead_letter_id, created_at | não | sim |  |
| public.winloss_webhook_replay_audit | idx_wh_replay_audit_delivery | btree | delivery_id, created_at | não | sim |  |
| public.winloss_webhook_replay_audit | idx_wh_replay_audit_request | btree | request_id | não | sim |  |
| public.winloss_webhook_replay_audit | winloss_webhook_replay_audit_pkey | btree | id | sim | sim |  |
| public.winloss_webhook_replay_invocations | idx_wh_replay_inv_actor | btree | actor_user_id, created_at | não | sim |  |
| public.winloss_webhook_replay_invocations | idx_wh_replay_inv_created | btree | created_at | não | sim |  |
| public.winloss_webhook_replay_invocations | idx_wh_replay_inv_request | btree | request_id | não | sim |  |
| public.winloss_webhook_replay_invocations | winloss_webhook_replay_invocations_pkey | btree | id | sim | sim |  |
| public.winloss_webhook_subscriptions | idx_winloss_webhook_active | btree | active | não | sim | `(active = true)` |
| public.winloss_webhook_subscriptions | winloss_webhook_subscriptions_pkey | btree | id | sim | sim |  |
| public.workflow_executions | idx_wf_exec_status | btree | status | não | sim |  |
| public.workflow_executions | idx_wf_exec_workflow | btree | workflow_id, started_at | não | sim |  |
| public.workflow_executions | workflow_executions_pkey | btree | id | sim | sim |  |
| public.workflow_rules | idx_workflow_rules_salesperson_id | btree | salesperson_id | não | sim |  |
| public.workflow_rules | workflow_rules_pkey | btree | id | sim | sim |  |
| public.workflows | idx_workflows_active | btree | is_active | não | sim | `(is_active = true)` |
| public.workflows | idx_workflows_trigger | btree | trigger_type | não | sim |  |
| public.workflows | workflows_pkey | btree | id | sim | sim |  |
| public.xp_adjustments | idx_xp_adjustments_created | btree | created_at | não | sim |  |
| public.xp_adjustments | idx_xp_adjustments_related_assignment_id | btree | related_assignment_id | não | sim |  |
| public.xp_adjustments | idx_xp_adjustments_user | btree | user_id | não | sim |  |
| public.xp_adjustments | xp_adjustments_pkey | btree | id | sim | sim |  |
| public.xp_history | idx_xp_history_salesperson_id | btree | salesperson_id | não | sim |  |
| public.xp_history | xp_history_pkey | btree | id | sim | sim |  |
