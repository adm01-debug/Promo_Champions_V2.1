# CHANGELOG do snapshot Supabase

Diff semântico gerado a cada coleta em que algo mudou.

## 2026-11-26 16:21 UTC

- **functions** alterado (3): `public.get_current_salesperson_id()`, `public.is_admin_or_manager()`, `public.is_admin_or_manager(_user_id uuid)`
- **lints** adicionado (3): `policy_auth_fn_not_wrapped:public.cadence_alert_templates.Admins/managers can manage alert templates`, `policy_auth_fn_not_wrapped:public.cadence_outcome_rules.Admins/managers can manage outcome rules`, `policy_auth_fn_not_wrapped:public.follow_up_audit_logs.Admins and managers can update audit logs`
- **migrations** adicionado (1): `20261128120000_20261128120000_restaura_escrita_bloqueada_por_rls`
- **policies (RLS)** adicionado (4): `public.cadence_alert_templates.Admins/managers can manage alert templates`, `public.cadence_outcome_rules.Admins/managers can manage outcome rules`, `public.chat_messages.Users can delete own chat_messages`, `public.follow_up_audit_logs.Admins and managers can update audit logs`

## 2026-11-26 14:17 UTC

- **realtime** adicionado (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_29`
- **realtime** removido (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_22`

## 2026-11-25 11:14 UTC

- **realtime** removido (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_21`

## 2026-11-25 10:15 UTC

- **realtime** adicionado (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_28`

## 2026-11-24 17:13 UTC

- **colunas** alterado (3204): `public._internal_secrets.key`, `public._internal_secrets.updated_at`, `public._internal_secrets.value`, `public.ab_tests.created_at`, `public.ab_tests.id`, `public.account_plans.account_id`, `public.account_plans.account_strategy`, `public.account_plans.action_plan`, `public.account_plans.created_at`, `public.account_plans.created_by`, `public.account_plans.executive_summary`, `public.account_plans.fiscal_year`, `public.account_plans.id`, `public.account_plans.key_objectives`, `public.account_plans.main_challenges`, `public.account_plans.revenue_target`, `public.account_plans.swot_opportunities`, `public.account_plans.swot_strengths`, `public.account_plans.swot_threats`, `public.account_plans.swot_weaknesses`, `public.account_plans.updated_at`, `public.active_power_ups.activated_at`, `public.active_power_ups.expires_at`, `public.active_power_ups.id`, `public.active_power_ups.is_active`, `public.active_power_ups.multiplier`, `public.active_power_ups.power_up_type`, `public.active_power_ups.salesperson_id`, `public.active_power_ups.source`, `public.activity_audit_logs.action`, `public.activity_audit_logs.activity_id`, `public.activity_audit_logs.changed_by`, `public.activity_audit_logs.created_at`, `public.activity_audit_logs.id`, `public.activity_audit_logs.new_data`, `public.activity_audit_logs.old_data`, `public.activity_goals.calls_goal`, `public.activity_goals.created_at`, `public.activity_goals.emails_goal`, `public.activity_goals.id` … (+3164)
- **tabelas** alterado (326): `public._internal_secrets`, `public.ab_tests`, `public.account_plans`, `public.active_power_ups`, `public.activity_audit_logs`, `public.activity_goals`, `public.agenda_events`, `public.ai_agent_actions`, `public.ai_agent_runs`, `public.ai_narrative_cache`, `public.ai_sales_insights`, `public.api_tokens`, `public.approval_decisions`, `public.approval_requests`, `public.approval_workflows`, `public.asset_usage_logs`, `public.audit_logs`, `public.auto_task_queue_settings`, `public.available_spins`, `public.bitrix24_sync_logs`, `public.buying_committee`, `public.buying_committee_members`, `public.buying_signals`, `public.cadence_ab_assignments`, `public.cadence_ab_tests`, `public.cadence_advanced_stats`, `public.cadence_alert_templates`, `public.cadence_enrollment_rules`, `public.cadence_funnel_rules`, `public.cadence_outcome_rules`, `public.call_coaching_scorecards`, `public.call_conversation_metrics`, `public.call_critical_moments`, `public.call_insights`, `public.call_intelligence_triggers`, `public.call_logs`, `public.call_metric_benchmarks`, `public.call_objection_analysis`, `public.call_objections`, `public.call_question_analysis` … (+286)

## 2026-11-24 16:15 UTC

- **colunas** alterado (394): `public.access_denied_logs.attempted_path`, `public.access_denied_logs.created_at`, `public.access_denied_logs.id`, `public.access_denied_logs.ip_address`, `public.access_denied_logs.required_role`, `public.access_denied_logs.user_agent`, `public.access_denied_logs.user_email`, `public.access_denied_logs.user_id`, `public.access_denied_logs.user_role`, `public.account_activities.account_id`, `public.account_activities.activity_type`, `public.account_activities.contact_id`, `public.account_activities.created_at`, `public.account_activities.description`, `public.account_activities.id`, `public.account_activities.metadata`, `public.account_activities.occurred_at`, `public.account_activities.salesperson_id`, `public.account_activities.title`, `public.account_contacts.account_id`, `public.account_contacts.buying_role`, `public.account_contacts.created_at`, `public.account_contacts.department`, `public.account_contacts.email`, `public.account_contacts.id`, `public.account_contacts.influence_level`, `public.account_contacts.is_primary`, `public.account_contacts.job_title`, `public.account_contacts.last_contacted_at`, `public.account_contacts.linkedin_url`, `public.account_contacts.name`, `public.account_contacts.notes`, `public.account_contacts.phone`, `public.account_contacts.sale_id`, `public.account_contacts.seniority`, `public.account_contacts.sentiment`, `public.account_contacts.updated_at`, `public.accounts.account_score`, `public.accounts.annual_revenue`, `public.accounts.champion_count` … (+354)
- **tabelas** alterado (42): `public.access_denied_logs`, `public.account_activities`, `public.account_contacts`, `public.accounts`, `public.achievements`, `public.automation_runs`, `public.automation_workflows`, `public.battle_participants`, `public.blocked_ips`, `public.challenge_progress`, `public.client_portfolio`, `public.daily_challenge_progress`, `public.daily_challenges`, `public.dashboard_layouts`, `public.feature_flags`, `public.feed_comments`, `public.feed_reactions`, `public.ip_whitelist`, `public.lead_routing_log`, `public.lead_scores`, `public.onboarding_journeys`, `public.qbr_schedule`, `public.renewals`, `public.sales_battles`, `public.sales_streaks`, `public.sales_territories`, `public.salesperson_preferences`, `public.salesperson_xp`, `public.security_alert_history`, `public.security_alert_settings`, `public.security_events`, `public.support_tickets`, `public.team_closers`, `public.teams`, `public.territories`, `public.territory_history`, `public.victory_feed`, `public.weekly_challenges`, `public.workflow_executions`, `public.workflow_rules` … (+2)

## 2026-11-24 15:14 UTC

- **colunas** alterado (132): `public.active_sessions.created_at`, `public.active_sessions.device_info`, `public.active_sessions.expires_at`, `public.active_sessions.id`, `public.active_sessions.ip_address`, `public.active_sessions.last_activity`, `public.active_sessions.last_refresh_at`, `public.active_sessions.max_lifetime_hours`, `public.active_sessions.refresh_count`, `public.active_sessions.session_token`, `public.active_sessions.user_agent`, `public.active_sessions.user_id`, `public.activities.activity_type`, `public.activities.client_id`, `public.activities.contact_name`, `public.activities.created_at`, `public.activities.delete_reason`, `public.activities.deleted_by`, `public.activities.duration_minutes`, `public.activities.id`, `public.activities.lead_status`, `public.activities.mql_qualified_at`, `public.activities.notes`, `public.activities.outcome`, `public.activities.qualification_score`, `public.activities.sale_id`, `public.activities.salesperson_id`, `public.cadence_steps.action_type`, `public.cadence_steps.cadence_id`, `public.cadence_steps.created_at`, `public.cadence_steps.day_number`, `public.cadence_steps.description`, `public.cadence_steps.id`, `public.cadence_steps.needs_approval`, `public.cadence_steps.singu_variables`, `public.cadence_steps.step_order`, `public.cadence_steps.task_type`, `public.cadence_steps.template_content`, `public.cadence_steps.title`, `public.cadence_tasks.cadence_step_id` … (+92)
- **functions** alterado (1): `public.internal_edge_job_timeout_ms(p_function_name text)`
- **migrations** adicionado (3): `20261127000000_20261127000000_supply_dispatch_timeout_60s`, `20261127001000_20261127001000_restaura_timeouts_dns_lento`, `20261127100000_20261127100000_backfill_supply_outbox_pedidos_pendentes`
- **tabelas** alterado (12): `public.active_sessions`, `public.activities`, `public.cadence_steps`, `public.cadence_tasks`, `public.cadences`, `public.login_attempts`, `public.notification_preferences`, `public.password_history`, `public.prospect_cadences`, `public.sms_verification_codes`, `public.user_mfa_settings`, `public.webauthn_credentials`

## 2026-11-24 13:15 UTC

- **colunas** adicionado (12): `public.supply_outbox.attempts`, `public.supply_outbox.created_at`, `public.supply_outbox.delivered_at`, `public.supply_outbox.event`, `public.supply_outbox.id`, `public.supply_outbox.last_error`, `public.supply_outbox.next_attempt_at`, `public.supply_outbox.order_id`, `public.supply_outbox.order_item_id`, `public.supply_outbox.payload`, `public.supply_outbox.status`, `public.supply_outbox.updated_at`
- **colunas** alterado (328): `public.audit_log.action`, `public.audit_log.created_at`, `public.audit_log.id`, `public.audit_log.new_data`, `public.audit_log.old_data`, `public.audit_log.record_id`, `public.audit_log.table_name`, `public.audit_log.user_id`, `public.category_metrics.category`, `public.category_metrics.created_at`, `public.category_metrics.date`, `public.category_metrics.id`, `public.category_metrics.percentage`, `public.clients.activated_at`, `public.clients.company`, `public.clients.created_at`, `public.clients.delete_reason`, `public.clients.deleted_by`, `public.clients.email`, `public.clients.email_verified`, `public.clients.id`, `public.clients.is_activated`, `public.clients.last_enrichment_id`, `public.clients.last_interaction_at`, `public.clients.lat`, `public.clients.lead_source`, `public.clients.lng`, `public.clients.name`, `public.clients.phone`, `public.clients.phone_verified`, `public.clients.ramo_atividade`, `public.clients.total_value`, `public.clients.updated_at`, `public.clients.user_id`, `public.daily_metrics.avg_ticket`, `public.daily_metrics.conversion_rate`, `public.daily_metrics.created_at`, `public.daily_metrics.date`, `public.daily_metrics.id`, `public.daily_metrics.new_clients` … (+288)
- **constraints** adicionado (4): `public.supply_outbox.supply_outbox_item_event_key`, `public.supply_outbox.supply_outbox_order_id_fkey`, `public.supply_outbox.supply_outbox_pkey`, `public.supply_outbox.supply_outbox_status_check`
- **cron jobs** adicionado (1): `125:supply-dispatch-1min`
- **functions** adicionado (3): `public.claim_supply_outbox(p_limit integer)`, `public.finish_supply_outbox(p_ids uuid[], p_ok boolean, p_error text)`, `public.tg_supply_enqueue_from_order_item()`
- **functions** alterado (4): `public.is_admin_or_manager()`, `public.is_admin_or_manager(_user_id uuid)`, `public.post_internal_edge_job(p_function_name text, p_attempt integer, p_max_attempts integer)`, `public.trigger_internal_edge_job(p_function_name text)`
- **grants** adicionado (2): `public.supply_outbox:authenticated`, `public.supply_outbox:service_role`
- **indexes** adicionado (4): `public.idx_supply_outbox_due`, `public.idx_supply_outbox_order`, `public.supply_outbox_item_event_key`, `public.supply_outbox_pkey`
- **lints** adicionado (1): `policy_auth_fn_not_wrapped:public.supply_outbox.supply_outbox_admin_read`
- **migrations** adicionado (1): `20261126090000_20261126090000_champions_supply_outbox`
- **policies (RLS)** adicionado (1): `public.supply_outbox.supply_outbox_admin_read`
- **tabelas** adicionado (1): `public.supply_outbox`
- **tabelas** alterado (24): `public.category_metrics`, `public.clients`, `public.daily_metrics`, `public.deal_outcomes`, `public.deal_stage_history`, `public.digital_signatures`, `public.document_signers`, `public.entity_versions`, `public.inventory_levels`, `public.price_alerts`, `public.price_history`, `public.products`, `public.quote_items`, `public.quotes`, `public.sales`, `public.sales_goals`, `public.salespeople`, `public.saved_filters`, `public.stock_movements`, `public.supplier_order_items`, `public.supplier_orders`, `public.supplier_products`, `public.suppliers`, `public.tasks`
- **triggers** adicionado (1): `public.order_items.trg_supply_enqueue_from_order_item`

## 2026-11-24 10:13 UTC

- **lints** removido (5): `policy_auth_fn_not_wrapped:public.commercial_approval_requests.Criar solicitações`, `policy_auth_fn_not_wrapped:public.salespeople.Users can read own salesperson record`, `policy_auth_fn_not_wrapped:public.saved_filters.Users can delete their own saved filters`, `policy_auth_fn_not_wrapped:public.saved_filters.Users can insert own filters`, `policy_auth_fn_not_wrapped:public.saved_filters.Users can view their own saved filters`
- **policies (RLS)** removido (12): `public.commercial_approval_requests.Criar solicitações`, `public.pipeline_stages.pipeline_stages_select_authenticated`, `public.pipelines.pipelines_select_authenticated`, `public.salespeople.Users can read own salesperson record`, `public.salesperson_xp.Authenticated users can view XP`, `public.saved_filters.Users can delete their own saved filters`, `public.saved_filters.Users can insert own filters`, `public.saved_filters.Users can view their own saved filters`, `public.sms_verification_codes.Deny insert on sms_verification_codes`, `public.sms_verification_codes.Deny select on sms_verification_codes`, `public.sms_verification_codes.Deny update on sms_verification_codes`, `public.stage_velocity_baselines.svb_select_authenticated`

## 2026-11-24 05:15 UTC

- **realtime** removido (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_20`

## 2026-11-24 02:20 UTC

- **functions** alterado (2): `public.is_admin_or_manager()`, `public.is_admin_or_manager(_user_id uuid)`
- **realtime** adicionado (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_27`

## 2026-11-24 00:32 UTC

- **colunas** adicionado (15): `public.designs_inbound.created_at`, `public.designs_inbound.design_id`, `public.designs_inbound.id`, `public.designs_inbound.last_correlation_key`, `public.designs_inbound.last_event`, `public.designs_inbound.name`, `public.designs_inbound.product_name`, `public.designs_inbound.product_sku`, `public.designs_inbound.raw_payload`, `public.designs_inbound.received_at`, `public.designs_inbound.seller_email`, `public.designs_inbound.source`, `public.designs_inbound.source_updated_at`, `public.designs_inbound.thumbnail_url`, `public.designs_inbound.updated_at`
- **constraints** adicionado (2): `public.designs_inbound.designs_inbound_design_id_key`, `public.designs_inbound.designs_inbound_pkey`
- **functions** adicionado (1): `public.set_designs_inbound_updated_at()`
- **grants** adicionado (3): `public.designs_inbound:anon`, `public.designs_inbound:authenticated`, `public.designs_inbound:service_role`
- **indexes** adicionado (5): `public.designs_inbound_design_id_key`, `public.designs_inbound_pkey`, `public.idx_designs_inbound_product_sku`, `public.idx_designs_inbound_received_at`, `public.idx_designs_inbound_seller_email`
- **lints** adicionado (1): `policy_auth_fn_not_wrapped:public.designs_inbound.Admins e managers podem ler designs_inbound`
- **migrations** adicionado (1): `20261125150000_20261125150000_designs_inbound`
- **policies (RLS)** adicionado (1): `public.designs_inbound.Admins e managers podem ler designs_inbound`
- **policies (RLS)** removido (3): `public.automation_runs.Authenticated users can view runs`, `public.commercial_approval_requests.Ver solicitações`, `public.committee_extraction_runs.auth read extraction runs`
- **tabelas** adicionado (1): `public.designs_inbound`
- **triggers** adicionado (1): `public.designs_inbound.trg_designs_inbound_updated_at`

## 2026-11-23 23:19 UTC

- **functions** alterado (48): `public.audit_log_row_change()`, `public.audit_trigger()`, `public.audit_trigger_func()`, `public.auto_add_client_to_portfolio()`, `public.auto_victory_post()`, `public.check_battle_achievements()`, `public.check_failed_attempts(p_email text, p_minutes integer)`, `public.cleanup_deleted_records()`, `public.cleanup_old_audit_logs()`, `public.convert_quote_to_order()`, `public.create_version()`, `public.data_subject_requests_guard_payload()`, `public.enqueue_v4_callback()`, `public.ensure_single_default_filter()`, `public.fn_auto_map_inbound_seller()`, `public.fn_calculate_icp_score()`, `public.fn_quotes_inbound_ordering_guard()`, `public.generate_cadence_tasks()`, `public.increment_asset_view_count()`, `public.log_audit_event()`, `public.log_data_access()`, `public.log_soft_delete()`, `public.maintain_sales_streaks()`, `public.manage_stock_on_sale()`, `public.notify_salesperson_on_bonus_paid()`, `public.process_audit_log()`, `public.protect_pa_nudge_content()`, `public.record_lead_score_history()`, `public.record_price_history()`, `public.record_sale_stage_transition()`, `public.refresh_materialized_views()`, `public.reindex_tables()`, `public.set_sdr_id_on_insert()`, `public.snapshot_committee_coverage()`, `public.snapshot_engagement_score()`, `public.sync_battle_score()`, `public.sync_performance_bets()`, `public.sync_quote_to_sale_status()`, `public.sync_territory_ownership()`, `public.sync_total_xp()` … (+8)
- **indexes** adicionado (5): `public.idx_consent_records_subject_client_id`, `public.idx_data_subject_requests_subject_client_id`, `public.idx_data_subject_requests_subject_id`, `public.idx_webhook_allowed_domains_created_by`, `public.idx_website_visitor_logs_consent_record_id`
- **indexes** removido (12): `public.idx_activities_deleted_at`, `public.idx_audit_created`, `public.idx_audit_user`, `public.idx_clients_created_at`, `public.idx_clients_deleted_at`, `public.idx_conv_analyses_analyzed_by`, `public.idx_error_logs_created_at`, `public.idx_products_deleted_at`, `public.idx_saved_filters_user_entity`, `public.idx_security_events_user`, `public.idx_suppliers_deleted_at`, `public.idx_teams_deleted_at`
- **lints** removido (8): `fk_without_index:public.consent_records.consent_records_subject_client_id_fkey`, `fk_without_index:public.data_subject_requests.data_subject_requests_subject_client_id_fkey`, `fk_without_index:public.data_subject_requests.data_subject_requests_subject_id_fkey`, `fk_without_index:public.webhook_allowed_domains.webhook_allowed_domains_created_by_fkey`, `fk_without_index:public.website_visitor_logs.website_visitor_logs_consent_record_id_fkey`, `policy_auth_fn_not_wrapped:public.client_interactions.Allow authenticated users to insert interactions`, `policy_auth_fn_not_wrapped:public.deal_health_scores.Authenticated insert health scores`, `policy_auth_fn_not_wrapped:public.deal_risk_signals.Authenticated insert signals`
- **policies (RLS)** adicionado (2): `public.deal_health_scores.Insert health scores for accessible sales`, `public.deal_risk_signals.Insert risk signals for accessible sales`
- **policies (RLS)** removido (7): `public.client_interactions.Allow authenticated users to insert interactions`, `public.deal_health_history.Authenticated users can view health history`, `public.deal_health_scores.Authenticated insert health scores`, `public.deal_risk_signals.Authenticated insert signals`, `public.icp_data.Authenticated users can read icp_data`, `public.nps_surveys.Authenticated users can view nps surveys`, `public.portfolio_settings.Authenticated can view portfolio settings`

## 2026-11-23 22:13 UTC

- **functions** alterado (1): `public.has_role(_user_id uuid, _role app_role)`

## 2026-11-23 13:16 UTC

- **constraints** alterado (4): `public.external_seller_map.external_seller_map_external_source_external_id_key`, `public.maintenance_log.chk_maintenance_log_completed_after_started`, `public.stage_inactivity_rules.stage_inactivity_rules_check`, `public.stage_inactivity_rules.stage_inactivity_rules_check1`
- **realtime** removido (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_19`

## 2026-11-23 11:17 UTC

- **realtime** adicionado (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_26`

## 2026-11-22 20:13 UTC

- **cron jobs** alterado (13): `13:capture-rollback-snapshot-5min`, `17:detect-stalled-cron-15min`, `26:email-bulk-retry-15min`, `36:notify-v4-quote-status-every-5min`, `37:check-v4-callback-alerts-every-5min`, `40:edge-retry-threshold-alert-15min`, `41:wal-health-alert-5min`, `42:winloss-webhook-health-monitor-15min`, `77:sequence-runner-5min`, `78:process-cadence-tasks-5min`, `79:process-scheduled-sends-15min`, `81:check-lead-sla-15min`, `85:send-alert-notifications-5min`
- **functions** alterado (7): `public.admin_capture_rollback_snapshot()`, `public.detect_stalled_cron_jobs()`, `public.fn_cron_expected_interval(_schedule text)`, `public.fn_cron_stalled_threshold(_schedule text)`, `public.internal_edge_job_timeout_ms(p_function_name text)`, `public.refresh_cron_job_last_run()`, `public.trigger_internal_edge_job(p_function_name text)`
- **migrations** adicionado (4): `20261124160000_timeout_por_funcao_no_dispatcher`, `20261125000000_timeout_pgnet_funcoes_com_dns_lento`, `20261125100000_cron_job_run_details_sem_seq_scan`, `20261125110000_espalha_schedules_cron_evita_startup_timeout`

## 2026-11-22 19:11 UTC

- **colunas** adicionado (6): `public.cron_job_last_run.jobid`, `public.cron_job_last_run.last_start`, `public.cron_job_last_run.updated_at`, `public.cron_job_last_run_cursor.id`, `public.cron_job_last_run_cursor.last_runid`, `public.cron_job_last_run_cursor.updated_at`
- **constraints** adicionado (3): `public.cron_job_last_run.cron_job_last_run_pkey`, `public.cron_job_last_run_cursor.cron_job_last_run_cursor_id_check`, `public.cron_job_last_run_cursor.cron_job_last_run_cursor_pkey`
- **functions** adicionado (1): `public.refresh_cron_job_last_run()`
- **functions** alterado (1): `public.detect_stalled_cron_jobs()`
- **grants** adicionado (2): `public.cron_job_last_run:service_role`, `public.cron_job_last_run_cursor:service_role`
- **indexes** adicionado (2): `public.cron_job_last_run_cursor_pkey`, `public.cron_job_last_run_pkey`
- **lints** adicionado (2): `rls_no_policies:public.cron_job_last_run`, `rls_no_policies:public.cron_job_last_run_cursor`
- **tabelas** adicionado (2): `public.cron_job_last_run`, `public.cron_job_last_run_cursor`

## 2026-11-22 18:15 UTC

- **functions** alterado (1): `public.internal_edge_job_timeout_ms(p_function_name text)`

## 2026-11-22 16:15 UTC

- **functions** alterado (1): `public.internal_edge_job_timeout_ms(p_function_name text)`

## 2026-11-22 15:12 UTC

- **functions** adicionado (1): `public.internal_edge_job_timeout_ms(p_function_name text)`
- **functions** alterado (1): `public.post_internal_edge_job(p_function_name text, p_attempt integer, p_max_attempts integer)`
- **realtime** removido (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_18`

## 2026-11-22 14:13 UTC

- **cron jobs** adicionado (1): `98:retry-pending-internal-edge-jobs-2min`
- **cron jobs** removido (1): `97:retry-pending-internal-edge-jobs-2min`
- **functions** alterado (2): `public.post_internal_edge_job(p_function_name text, p_attempt integer, p_max_attempts integer)`, `public.retry_pending_internal_edge_jobs()`
- **realtime** adicionado (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_25`

## 2026-11-22 13:12 UTC

- **cron jobs** adicionado (1): `97:retry-pending-internal-edge-jobs-2min`
- **functions** adicionado (2): `public.post_internal_edge_job(p_function_name text, p_attempt integer, p_max_attempts integer)`, `public.retry_pending_internal_edge_jobs()`
- **functions** alterado (1): `public.trigger_internal_edge_job(p_function_name text)`

## 2026-11-22 12:18 UTC

- **functions** alterado (1): `public.trigger_internal_edge_job(p_function_name text)`

## 2026-11-21 20:46 UTC

- **functions** alterado (2): `public.match_semantic(_query_embedding vector, _match_count integer, _entity_types text[])`, `public.upsert_semantic_entry(_entity_type text, _entity_id uuid, _salesperson_id uuid, _content text, _embedding vector, _metadata jsonb)`

## 2026-11-21 20:13 UTC

- **functions** alterado (1): `public.trigger_internal_edge_job(p_function_name text)`
- **indexes** adicionado (1): `public.idx_semantic_index_embedding_hnsw`
- **indexes** removido (1): `public.idx_semantic_index_embedding`
- **migrations** adicionado (3): `20261122000000_20261122000000_schedule_semantic_reindex_cron`, `20261123000000_semantic_index_hnsw_and_status_filters`, `20261123000100_fix_auth_users_token_columns_and_identities`

## 2026-11-21 19:12 UTC

- **cron jobs** adicionado (1): `95:semantic-reindex-daily`
- **functions** alterado (1): `public.trigger_internal_edge_job(p_function_name text)`
- **migrations** adicionado (1): `20261121000000_20261121000000_fix_search_path_similarity_e_pgvector`

## 2026-11-21 18:15 UTC

- **functions** alterado (3): `public.match_semantic(_query_embedding vector, _match_count integer, _entity_types text[])`, `public.search_products_semantic(_keywords text[], _query text, _limit integer)`, `public.search_products_vector(_query_embedding vector, _limit integer)`

## 2026-11-21 12:48 UTC

- Snapshot inicial.


## 2026-11-21 12:18 UTC

- **colunas** adicionado (2): `public.scheduled_sends.attempts`, `public.scheduled_sends.next_retry_at`
- **constraints** alterado (1): `public.scheduled_sends.scheduled_sends_status_check`
- **indexes** adicionado (1): `public.idx_scheduled_sends_retry`
- **migrations** adicionado (1): `20261120000000_20261120000000_t15_multichannel_retry`
- **realtime** adicionado (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_24`
- **realtime** removido (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_17`

## 2026-11-20 20:15 UTC

- **functions** alterado (2): `public.is_admin_or_manager()`, `public.is_admin_or_manager(_user_id uuid)`

## 2026-11-20 18:17 UTC

- **realtime** removido (2): `supabase_realtime_messages_publication:realtime.messages_2026_11_15`, `supabase_realtime_messages_publication:realtime.messages_2026_11_16`

## 2026-11-20 15:13 UTC

- **realtime** adicionado (2): `supabase_realtime_messages_publication:realtime.messages_2026_11_22`, `supabase_realtime_messages_publication:realtime.messages_2026_11_23`

## 2026-11-20 01:14 UTC

- **functions** alterado (2): `public.is_admin_or_manager()`, `public.is_admin_or_manager(_user_id uuid)`

## 2026-11-20 00:37 UTC

- **migrations** adicionado (1): `20261119700000_fix_rls_sales_activities_using_true`

## 2026-11-19 11:13 UTC

- **extensions** alterado (1): `supabase_vault`
- **views** alterado (3): `public.activities_active`, `public.clients_active`, `public.mv_competitive_ranking`

## 2026-11-18 15:13 UTC

- **realtime** removido (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_14`

## 2026-11-18 13:14 UTC

- **realtime** adicionado (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_21`

## 2026-11-17 18:18 UTC

- Snapshot inicial.


## 2026-11-14 15:51 UTC

- **functions** alterado (12): `private.handle_performance_update()`, `private.update_performance_bet_progress()`, `public.audit_activity_changes()`, `public.audit_log_row_change()`, `public.audit_trigger_func()`, `public.check_performance_bets_completion(p_salesperson_id uuid)`, `public.get_current_salesperson_id()`, `public.is_admin_or_manager()`, `public.is_admin_or_manager(_user_id uuid)`, `public.log_soft_delete()`, `public.process_performance_bet_event()`, `public.update_updated_at_column()`
- **realtime** removido (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_10`

## 2026-11-14 14:40 UTC

- **realtime** adicionado (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_17`

## 2026-11-14 13:54 UTC

- **functions** adicionado (3): `public.data_subject_requests_guard_payload()`, `public.match_whatsapp_reply_to_enrollment(_from_digits text, _owner_ids uuid[], _received_at timestamp with time zone)`, `public.release_edge_job_lock(_job_name text, _request_id text)`
- **functions** removido (1): `public.release_edge_job_lock(_job_name text)`
- **functions** alterado (12): `public.anonymize_data_subject(p_subject_email text, p_subject_id uuid, p_phone text, p_ip text, p_request_id uuid)`, `public.award_bonus_if_eligible(_bonus_id uuid, _computed_amount numeric, _bonus_kind text)`, `public.award_sale_xp(p_sale_id uuid)`, `public.broadcast_sale_completed()`, `public.compute_scheduled_report_next_run()`, `public.get_client_purchase_heatmap(_client_id uuid, _months integer)`, `public.get_current_salesperson_id()`, `public.get_purchase_intelligence_summary(_client_id uuid)`, `public.get_semantic_coverage()`, `public.is_admin_or_manager()`, `public.is_admin_or_manager(_user_id uuid)`, `public.notify_sale_completion()`
- **migrations** adicionado (3): `20261027140000_20261027140000_lgpd_gamificacao_r3`, `20261027210000_20261027210000_r3_db_kpis_fixes`, `20261027211000_20261027211000_match_whatsapp_reply_e_lock_release`
- **triggers** adicionado (1): `public.data_subject_requests.trg_data_subject_requests_guard_payload`
- **triggers** alterado (1): `public.sales.trg_broadcast_sale_completed`
- **views** alterado (2): `public.client_purchase_seasonality`, `public.revenue_forecast_view`

## 2026-11-14 13:34 UTC

- **colunas** adicionado (3): `public.edge_job_locks.job_name`, `public.edge_job_locks.locked_at`, `public.edge_job_locks.request_id`
- **constraints** adicionado (1): `public.edge_job_locks.edge_job_locks_pkey`
- **constraints** alterado (1): `public.ai_agent_actions.ai_agent_actions_status_check`
- **functions** adicionado (2): `public.release_edge_job_lock(_job_name text)`, `public.try_edge_job_lock(_job_name text, _ttl_seconds integer, _request_id text)`
- **functions** alterado (8): `public.append_agent_step(_run_id uuid, _tool_name text, _tool_input jsonb, _tool_output jsonb, _status text, _executed_by text)`, `public.approve_agent_run(_run_id uuid)`, `public.complete_agent_run(_run_id uuid, _result jsonb, _status text, _error text)`, `public.create_agent_run(_agent_type text, _goal text, _target_entity_type text, _target_entity_id uuid, _requires_approval boolean)`, `public.get_current_salesperson_id()`, `public.has_role(_user_id uuid, _role app_role)`, `public.is_admin_or_manager()`, `public.is_admin_or_manager(_user_id uuid)`
- **grants** adicionado (3): `public.edge_job_locks:anon`, `public.edge_job_locks:authenticated`, `public.edge_job_locks:service_role`
- **indexes** adicionado (1): `public.edge_job_locks_pkey`
- **lints** adicionado (2): `policy_auth_fn_not_wrapped:public.ai_agent_runs.Cancel own agent runs`, `policy_auth_fn_not_wrapped:public.ai_agent_runs.Insert own pending agent runs`
- **lints** removido (2): `policy_auth_fn_not_wrapped:public.ai_agent_actions.Insert actions of own runs`, `policy_auth_fn_not_wrapped:public.ai_agent_runs.System manages agent runs`
- **migrations** adicionado (3): `20261027120100_20261027120100_edge_job_lock_lease`, `20261027130000_20261027130000_agent_runs_owner_check_e_grants`, `20261027131000_20261027131000_agent_runs_r3_rls_lockdown`
- **policies (RLS)** adicionado (3): `public.ai_agent_runs.Cancel own agent runs`, `public.ai_agent_runs.Insert own pending agent runs`, `public.edge_job_locks.Service role can manage job locks`
- **policies (RLS)** removido (2): `public.ai_agent_actions.Insert actions of own runs`, `public.ai_agent_runs.System manages agent runs`
- **tabelas** adicionado (1): `public.edge_job_locks`

## 2026-11-14 13:24 UTC

- **colunas** alterado (1): `public.race_scoring_rules.month`
- **cron jobs** adicionado (1): `76:challenge-progress-sync`
- **functions** adicionado (5): `public.award_sale_xp(p_sale_id uuid)`, `public.compute_challenge_progress_value(p_salesperson_id uuid, p_challenge_type text, p_start date, p_end date)`, `public.is_salesperson_active(_salesperson_id uuid)`, `public.race_cars_guard_counters()`, `public.sync_challenge_progress(p_salesperson_id uuid)`
- **functions** removido (3): `public.calculate_performance_pace(_salesperson_id uuid)`, `public.get_detailed_kpis()`, `public.get_revenue_forecast(_days integer)`
- **functions** alterado (23): `public.add_salesperson_xp(p_salesperson_id uuid, p_xp_amount integer, p_source text)`, `public.anonymize_data_subject(p_subject_email text, p_subject_id uuid, p_phone text, p_ip text, p_request_id uuid)`, `public.auto_assign_lead(_sale_id uuid)`, `public.award_bonus_if_eligible(_bonus_id uuid, _computed_amount numeric, _bonus_kind text)`, `public.award_salesperson_xp(p_salesperson_id uuid, p_xp_amount integer, p_description text, p_source_type text, p_source_id uuid)`, `public.broadcast_sale_completed()`, `public.canonical_phone_key(p_phone text)`, `public.check_sla_violations()`, `public.compute_pipeline_inspection()`, `public.compute_salesperson_retention_cohort(_months_back integer)`, `public.compute_scheduled_report_next_run()`, `public.get_client_purchase_heatmap(_client_id uuid, _months integer)`, `public.get_current_salesperson_id()`, `public.get_purchase_intelligence_summary(_client_id uuid)`, `public.get_semantic_coverage()`, `public.increment_race_car_overtakes(_salesperson_id uuid)`, `public.increment_race_car_wins(_salesperson_id uuid)`, `public.is_admin_or_manager()`, `public.is_admin_or_manager(_user_id uuid)`, `public.notify_sale_completion()`, `public.refresh_materialized_views()`, `public.route_unassigned_client_portfolio(p_client_id uuid, p_strategy text, p_salesperson_id uuid, p_reason text)`, `public.win_rate_breakdown(_dimension text, _days integer)`
- **indexes** alterado (1): `public.uq_inbound_reply_events_provider_message_id`
- **migrations** adicionado (3): `20261013172000_20261013172000_inbound_reply_events_full_unique`, `20261019153000_20261019153000_lgpd_gamificacao_r2`, `20261027120000_20261027120000_sales_status_canonizacao_rpcs`
- **triggers** adicionado (1): `public.race_cars.trg_race_cars_guard_counters`
- **views** alterado (2): `public.client_purchase_seasonality`, `public.revenue_forecast_view`

## 2026-11-14 12:02 UTC

- **constraints** alterado (1): `public.channel_credentials.channel_credentials_provider_check`
- **migrations** adicionado (1): `20261013171000_20261013171000_channel_credentials_provider_evolution`

## 2026-11-14 01:30 UTC

- **functions** alterado (3): `public.get_current_salesperson_id()`, `public.is_admin_or_manager()`, `public.is_admin_or_manager(_user_id uuid)`

## 2026-11-13 16:09 UTC

- **functions** alterado (3): `public.get_current_salesperson_id()`, `public.is_admin_or_manager()`, `public.is_admin_or_manager(_user_id uuid)`

## 2026-11-13 14:22 UTC

- **grants** adicionado (2): `storage.bucket_lifecycle_states:service_role`, `storage.lifecycle_abandoned_artifacts:service_role`
- **triggers** adicionado (4): `storage.buckets.enforce_versioning_status_transition`, `storage.buckets.protect_active_lifecycle_states`, `storage.buckets.wake_lifecycle_on_policy_write`, `storage.buckets.wake_lifecycle_on_versioning_enable`

## 2026-11-13 10:20 UTC

- **functions** alterado (1): `public.get_current_salesperson_id()`

## 2026-11-13 09:55 UTC

- **functions** alterado (1): `public.get_current_salesperson_id()`

## 2026-11-13 08:43 UTC

- **functions** alterado (1): `public.get_current_salesperson_id()`

## 2026-11-13 02:19 UTC

- **realtime** adicionado (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_16`
- **realtime** removido (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_09`

## 2026-11-12 00:33 UTC

- **realtime** adicionado (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_15`
- **realtime** removido (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_08`

## 2026-11-11 22:36 UTC

- **realtime** removido (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_07`

## 2026-11-11 21:02 UTC

- **realtime** adicionado (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_14`

## 2026-11-10 20:18 UTC

- **realtime** removido (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_06`

## 2026-11-10 18:40 UTC

- **realtime** adicionado (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_13`

## 2026-11-09 21:06 UTC

- **grants** adicionado (1305): `public._internal_secrets:anon`, `public._internal_secrets:authenticated`, `public._internal_secrets:service_role`, `public.ab_tests:anon`, `public.ab_tests:authenticated`, `public.ab_tests:service_role`, `public.access_denied_logs:anon`, `public.access_denied_logs:authenticated`, `public.access_denied_logs:service_role`, `public.account_activities:anon`, `public.account_activities:authenticated`, `public.account_activities:service_role`, `public.account_contacts:anon`, `public.account_contacts:authenticated`, `public.account_contacts:service_role`, `public.account_plans:anon`, `public.account_plans:authenticated`, `public.account_plans:service_role`, `public.accounts:anon`, `public.accounts:authenticated`, `public.accounts:service_role`, `public.achievements:anon`, `public.achievements:authenticated`, `public.achievements:service_role`, `public.active_power_ups:anon`, `public.active_power_ups:authenticated`, `public.active_power_ups:service_role`, `public.active_sessions:anon`, `public.active_sessions:authenticated`, `public.active_sessions:service_role`, `public.activities:anon`, `public.activities:authenticated`, `public.activities:service_role`, `public.activities_active:authenticated`, `public.activities_active:service_role`, `public.activity_audit_logs:anon`, `public.activity_audit_logs:authenticated`, `public.activity_audit_logs:service_role`, `public.activity_goals:anon`, `public.activity_goals:authenticated` … (+1265)

## 2026-11-09 05:01 UTC

- **realtime** adicionado (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_12`
- **realtime** removido (2): `supabase_realtime_messages_publication:realtime.messages_2026_11_04`, `supabase_realtime_messages_publication:realtime.messages_2026_11_05`

## 2026-11-09 02:12 UTC

- **realtime** adicionado (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_11`

## 2026-11-07 01:15 UTC

- **realtime** adicionado (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_10`
- **realtime** removido (1): `supabase_realtime_messages_publication:realtime.messages_2026_11_03`

## 2026-11-06 06:49 UTC

- **realtime** adicionado (2): `supabase_realtime_messages_publication:realtime.messages_2026_11_08`, `supabase_realtime_messages_publication:realtime.messages_2026_11_09`
- **realtime** removido (2): `supabase_realtime_messages_publication:realtime.messages_2026_11_01`, `supabase_realtime_messages_publication:realtime.messages_2026_11_02`

## 2026-11-06 00:18 UTC

- Snapshot inicial.


## 2026-11-05 03:44 UTC

- Snapshot inicial.

