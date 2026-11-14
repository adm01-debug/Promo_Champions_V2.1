# CHANGELOG do snapshot Supabase

Diff semântico gerado a cada coleta em que algo mudou.

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

