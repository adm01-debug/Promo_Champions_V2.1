# CHANGELOG do snapshot Supabase

Diff semântico gerado a cada coleta em que algo mudou.

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

