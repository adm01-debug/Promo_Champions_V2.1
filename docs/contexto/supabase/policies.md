# Policies (RLS)


Visão consolidada (inclui `storage.objects` e `realtime.messages`); detalhes por tabela em `tables/`.

| tabela | policy | cmd | tipo | roles | USING | WITH CHECK |
|---|---|---|---|---|---|---|
| public._internal_secrets | Deny all access to _internal_secrets | ALL | PERMISSIVE | anon, authenticated | `false` | `false` |
| public.ab_tests | Admins and managers can manage ab_tests | ALL | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.access_denied_logs | Admins can view access logs | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::app_role))))` |  |
| public.access_denied_logs | Authenticated users can log access denied | INSERT | PERMISSIVE | authenticated |  | `(user_id = auth.uid())` |
| public.access_denied_logs | Authenticated users can log access denied events | INSERT | PERMISSIVE | authenticated |  | `(auth.uid() = user_id)` |
| public.access_denied_logs | Users can insert their own access logs | INSERT | PERMISSIVE | public |  | `(auth.uid() = user_id)` |
| public.account_activities | Insert activities for accessible accounts | INSERT | PERMISSIVE | authenticated |  | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = account_activities.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |
| public.account_activities | View activities of accessible accounts | SELECT | PERMISSIVE | authenticated | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = account_activities.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |  |
| public.account_contacts | Manage contacts of accessible accounts | ALL | PERMISSIVE | authenticated | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = account_contacts.account_id) AND (a.owner_id = get_current_salesperson_id())))))` | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = account_contacts.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |
| public.account_contacts | View contacts of accessible accounts | SELECT | PERMISSIVE | authenticated | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = account_contacts.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |  |
| public.account_plans | Account plans owner or admin can read | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (created_by = auth.uid()))` |  |
| public.account_plans | Account plans owner or admin can update | UPDATE | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (created_by = auth.uid()))` |  |
| public.account_plans | Owners or admins can insert account plans | INSERT | PERMISSIVE | authenticated |  | `((created_by = auth.uid()) AND (is_admin_or_manager(auth.uid()) OR (created_by = auth.uid())))` |
| public.accounts | Owners and managers can manage accounts | ALL | PERMISSIVE | authenticated | `(is_admin_or_manager(auth.uid()) OR (owner_id = get_current_salesperson_id()))` | `(is_admin_or_manager(auth.uid()) OR (owner_id = get_current_salesperson_id()))` |
| public.accounts | Owners and managers can view accounts | SELECT | PERMISSIVE | authenticated | `(is_admin_or_manager(auth.uid()) OR (owner_id = get_current_salesperson_id()))` |  |
| public.achievements | Authenticated users can read achievements | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.achievements | Users can insert own achievements | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id = get_current_salesperson_id())` |
| public.active_power_ups | Users can insert own power_ups | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id = get_current_salesperson_id())` |
| public.active_power_ups | Users can view own or admin can view all power-ups | SELECT | PERMISSIVE | authenticated | `((salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid()))) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.active_sessions | Admins can view all sessions | SELECT | PERMISSIVE | public | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.active_sessions | Users can delete own sessions | DELETE | PERMISSIVE | authenticated | `(user_id = auth.uid())` |  |
| public.active_sessions | Users can insert own sessions | INSERT | PERMISSIVE | authenticated |  | `(user_id = auth.uid())` |
| public.active_sessions | Users can read own sessions | SELECT | PERMISSIVE | authenticated | `(user_id = auth.uid())` |  |
| public.active_sessions | Users can update own sessions | UPDATE | PERMISSIVE | authenticated | `(user_id = auth.uid())` |  |
| public.active_sessions | Users can view own sessions | SELECT | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.activities | Users can insert own activities | INSERT | PERMISSIVE | public |  | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| public.activities | Users can read own activities or admins all | SELECT | PERMISSIVE | public | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.activities | Users can update own activities | UPDATE | PERMISSIVE | public | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.activities | admin_delete_activities | DELETE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.activity_audit_logs | Users can view audit logs for their activities | SELECT | PERMISSIVE | public | `((auth.uid() IN ( SELECT activities.salesperson_id    FROM activities   WHERE (activities.id = activity_audit_logs.activity_id))) OR (EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role]))))))` |  |
| public.activity_goals | Admins can delete activity_goals | DELETE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.activity_goals | Users can insert own activity_goals | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id = get_current_salesperson_id())` |
| public.activity_goals | Users can update own activity_goals | UPDATE | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.activity_goals | Users can view own activity_goals or admin | SELECT | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.agenda_events | Admins/Managers view all agenda events | SELECT | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.agenda_events | Salespeople manage own agenda events | ALL | PERMISSIVE | public | `(salesperson_id = get_current_salesperson_id())` | `(salesperson_id = get_current_salesperson_id())` |
| public.ai_agent_actions | Insert actions of own runs | INSERT | PERMISSIVE | authenticated |  | `(EXISTS ( SELECT 1    FROM ai_agent_runs r   WHERE ((r.id = ai_agent_actions.run_id) AND ((r.salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role)))))` |
| public.ai_agent_actions | View actions of accessible runs | SELECT | PERMISSIVE | authenticated | `(EXISTS ( SELECT 1    FROM ai_agent_runs r   WHERE ((r.id = ai_agent_actions.run_id) AND ((r.salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |  |
| public.ai_agent_runs | Salespeople view own agent runs | SELECT | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.ai_agent_runs | System manages agent runs | ALL | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role))` | `((salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role))` |
| public.ai_narrative_cache | Authenticated users can read cache | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.ai_narrative_cache | Service role manages cache | ALL | PERMISSIVE | service_role | `true` | `true` |
| public.ai_sales_insights | Users can view insights for their sales | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM sales   WHERE ((sales.id = ai_sales_insights.sale_id) AND (sales.salesperson_id = auth.uid()))))` |  |
| public.api_tokens | Admins can manage API tokens | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.api_tokens | Users can see own tokens | SELECT | PERMISSIVE | authenticated | `((created_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |  |
| public.app_config | admin manager write app_config | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.app_config | authenticated read app_config | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.approval_decisions | Admins and managers can create decisions | INSERT | PERMISSIVE | authenticated |  | `(is_admin_or_manager(auth.uid()) AND (approver_id = auth.uid()))` |
| public.approval_decisions | Users can view decisions on their requests | SELECT | PERMISSIVE | authenticated | `(EXISTS ( SELECT 1    FROM approval_requests ar   WHERE ((ar.id = approval_decisions.request_id) AND ((ar.requester_id = auth.uid()) OR is_admin_or_manager(auth.uid())))))` |  |
| public.approval_requests | Admins and managers can update requests | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.approval_requests | Users can create requests | INSERT | PERMISSIVE | authenticated |  | `(requester_id = auth.uid())` |
| public.approval_requests | Users can view own requests | SELECT | PERMISSIVE | authenticated | `((requester_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |  |
| public.approval_workflows | Admins and managers can manage workflows | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.approval_workflows | Authenticated users can view active workflows | SELECT | PERMISSIVE | authenticated | `(is_active = true)` |  |
| public.asset_usage_logs | Users insert own usage logs | INSERT | PERMISSIVE | authenticated |  | `(user_id = auth.uid())` |
| public.asset_usage_logs | Users see own logs, managers see all | SELECT | PERMISSIVE | authenticated | `((user_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |  |
| public.audit_log | Admins can view all audit logs | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM auth.users   WHERE ((users.id = auth.uid()) AND ((users.raw_user_meta_data ->> 'role'::text) = 'admin'::text))))` |  |
| public.audit_log | Users can view own audit logs | SELECT | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.audit_logs | Admins can view audit logs | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.audit_logs | Users can insert own audit entries | INSERT | PERMISSIVE | authenticated |  | `(auth.uid() = actor_id)` |
| public.auto_task_queue_settings | auto_task_queue_settings_admin_write | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.auto_task_queue_settings | auto_task_queue_settings_read_auth | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.automation_runs | Authenticated users can view runs | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.automation_runs | automation_runs_select_admin_manager | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.automation_workflows | Admins/managers manage workflows | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.automation_workflows | Authenticated users can view active workflows | SELECT | PERMISSIVE | public | `(auth.uid() IS NOT NULL)` |  |
| public.available_spins | Own spins manage | ALL | PERMISSIVE | authenticated | `(salesperson_id = get_current_salesperson_id())` |  |
| public.available_spins | Users can view own or admin can view all spins | SELECT | PERMISSIVE | authenticated | `((salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid()))) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.available_spins | Users can view their own spins | SELECT | PERMISSIVE | public | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |  |
| public.battle_participants | Admins can update participants | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.battle_participants | Authenticated can read battle_participants | SELECT | PERMISSIVE | public | `(auth.uid() IS NOT NULL)` |  |
| public.battle_participants | Users can join battles as self | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id = get_current_salesperson_id())` |
| public.bitrix24_sync_logs | Admins and managers can view sync logs | SELECT | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.blocked_ips | Admins can manage blocked_ips | ALL | PERMISSIVE | public | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.buying_committee | Users can manage committee for their sales | ALL | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM sales   WHERE ((sales.id = buying_committee.sale_id) AND ((sales.salesperson_id = auth.uid()) OR (auth.uid() IN ( SELECT user_roles.user_id            FROM user_roles           WHERE (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role]))))))))` |  |
| public.buying_committee | Users can view committee for their sales | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM sales   WHERE ((sales.id = buying_committee.sale_id) AND ((sales.salesperson_id = auth.uid()) OR (auth.uid() IN ( SELECT user_roles.user_id            FROM user_roles           WHERE (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role]))))))))` |  |
| public.buying_committee_members | bcm_delete | DELETE | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = buying_committee_members.sale_id) AND (s.salesperson_id = get_current_salesperson_id())))))` |  |
| public.buying_committee_members | bcm_insert | INSERT | PERMISSIVE | public |  | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = buying_committee_members.sale_id) AND (s.salesperson_id = get_current_salesperson_id())))))` |
| public.buying_committee_members | bcm_select | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = buying_committee_members.sale_id) AND (s.salesperson_id = get_current_salesperson_id())))))` |  |
| public.buying_committee_members | bcm_update | UPDATE | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = buying_committee_members.sale_id) AND (s.salesperson_id = get_current_salesperson_id())))))` |  |
| public.buying_signals | Admins e Managers podem ver sinais de compra | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role])))))` |  |
| public.cadence_ab_assignments | Admins/managers manage ab assignments | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.cadence_ab_assignments | Authenticated can view ab assignments | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.cadence_ab_tests | Admins/managers manage ab tests | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.cadence_ab_tests | Authenticated can view ab tests | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.cadence_advanced_stats | Leitura pública autenticada para stats | SELECT | PERMISSIVE | public | `(auth.role() = 'authenticated'::text)` |  |
| public.cadence_alert_templates | Authenticated read for alert templates | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.cadence_enrollment_rules | Admins/managers can manage enrollment rules | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.cadence_enrollment_rules | Authenticated can view enrollment rules | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.cadence_funnel_rules | Authenticated users can view funnel rules | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.cadence_funnel_rules | Only admins can manage funnel rules | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.cadence_outcome_rules | Authenticated read for outcome rules | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.cadence_steps | Admins and managers can delete cadence_steps | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.cadence_steps | Admins and managers can insert cadence_steps | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.cadence_steps | Admins and managers can update cadence_steps | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.cadence_steps | Authenticated users can read cadence_steps | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.cadence_tasks | Users can delete own cadence_tasks | DELETE | PERMISSIVE | authenticated | `((prospect_cadence_id IN ( SELECT prospect_cadences.id    FROM prospect_cadences   WHERE (prospect_cadences.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |  |
| public.cadence_tasks | Users can insert own cadence_tasks | INSERT | PERMISSIVE | authenticated |  | `((prospect_cadence_id IN ( SELECT prospect_cadences.id    FROM prospect_cadences   WHERE (prospect_cadences.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |
| public.cadence_tasks | Users can update own cadence_tasks | UPDATE | PERMISSIVE | authenticated | `((prospect_cadence_id IN ( SELECT prospect_cadences.id    FROM prospect_cadences   WHERE (prospect_cadences.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |  |
| public.cadence_tasks | Users can view own cadence_tasks or admin | SELECT | PERMISSIVE | authenticated | `((prospect_cadence_id IN ( SELECT prospect_cadences.id    FROM prospect_cadences   WHERE (prospect_cadences.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |  |
| public.cadences | Admins and managers can delete cadences | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.cadences | Admins and managers can insert cadences | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.cadences | Admins and managers can update cadences | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.cadences | Authenticated users can read cadences | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.call_coaching_scorecards | ccs_read_authenticated | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.call_coaching_scorecards | ccs_write_admin_manager | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.call_conversation_metrics | ccm_select_authenticated | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.call_conversation_metrics | ccm_write_admin_manager | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.call_critical_moments | Authenticated users can insert critical moments | INSERT | PERMISSIVE | public |  | `(auth.uid() = owner_id)` |
| public.call_critical_moments | Users can view own critical moments | SELECT | PERMISSIVE | authenticated | `((get_current_salesperson_id() = salesperson_id) OR is_admin_or_manager(auth.uid()))` |  |
| public.call_critical_moments | ccm_admin_delete | DELETE | PERMISSIVE | public | `(has_role(auth.uid(), 'admin'::app_role) OR (owner_id = auth.uid()))` |  |
| public.call_critical_moments | ccm_owner_read | SELECT | PERMISSIVE | public | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role))` |  |
| public.call_critical_moments | ccm_owner_update | UPDATE | PERMISSIVE | public | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role))` |  |
| public.call_insights | System inserts insights | INSERT | PERMISSIVE | public |  | `(EXISTS ( SELECT 1    FROM call_recordings r   WHERE ((r.id = call_insights.recording_id) AND ((r.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |
| public.call_insights | View insights via recording access | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM call_recordings r   WHERE ((r.id = call_insights.recording_id) AND ((r.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |  |
| public.call_intelligence_triggers | Allow read for all authenticated users | SELECT | PERMISSIVE | public | `(auth.role() = 'authenticated'::text)` |  |
| public.call_logs | Delete own call logs | DELETE | PERMISSIVE | public | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |  |
| public.call_logs | Insert own call logs | INSERT | PERMISSIVE | public |  | `(owner_id = auth.uid())` |
| public.call_logs | Update own call logs | UPDATE | PERMISSIVE | public | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |  |
| public.call_logs | View call logs | SELECT | PERMISSIVE | public | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.call_metric_benchmarks | cmb_select_authenticated | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.call_metric_benchmarks | cmb_write_admin | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.call_objection_analysis | Admin/manager write objection analysis | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.call_objection_analysis | Authenticated read objection analysis | SELECT | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.call_objections | Admin/manager write call objections | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.call_objections | Authenticated read call objections | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.call_question_analysis | auth read question analysis | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.call_question_analysis | managers write question analysis | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.call_questions | auth read questions | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.call_questions | managers write questions | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.call_recording_ingest_jobs | admin_can_read_all_ingest_jobs | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.call_recording_ingest_jobs | salesperson_can_enqueue_own_ingest_jobs | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| public.call_recording_ingest_jobs | salesperson_can_read_own_ingest_jobs | SELECT | PERMISSIVE | authenticated | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |  |
| public.call_recordings | Admins delete recordings | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.call_recordings | Salespeople create own recordings | INSERT | PERMISSIVE | public |  | `(salesperson_id = get_current_salesperson_id())` |
| public.call_recordings | Salespeople update own recordings | UPDATE | PERMISSIVE | public | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.call_recordings | Salespeople view own recordings | SELECT | PERMISSIVE | public | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.call_sentiment_timeline | Service role manages sentiment timeline | ALL | PERMISSIVE | public | `(auth.role() = 'service_role'::text)` | `(auth.role() = 'service_role'::text)` |
| public.call_sentiment_timeline | View sentiment of own/managed recordings | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM call_recordings cr   WHERE ((cr.id = call_sentiment_timeline.recording_id) AND ((cr.salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |  |
| public.call_transcripts | System inserts transcripts | INSERT | PERMISSIVE | public |  | `(EXISTS ( SELECT 1    FROM call_recordings r   WHERE ((r.id = call_transcripts.recording_id) AND ((r.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |
| public.call_transcripts | View transcripts via recording access | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM call_recordings r   WHERE ((r.id = call_transcripts.recording_id) AND ((r.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |  |
| public.campaign_health_alerts | admin can delete campaign health alerts | DELETE | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.campaign_health_alerts | owner or admin can view campaign health alerts | SELECT | PERMISSIVE | authenticated | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |  |
| public.category_metrics | Admins and managers can delete category_metrics | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.category_metrics | Admins and managers can insert category_metrics | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.category_metrics | Admins and managers can update category_metrics | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.category_metrics | Authenticated users can read category_metrics | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.challenge_progress | Users can read own challenge_progress | SELECT | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.channel_credentials | Owners can delete their credentials | DELETE | PERMISSIVE | authenticated | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |  |
| public.channel_credentials | Owners can insert their credentials | INSERT | PERMISSIVE | authenticated |  | `(owner_id = auth.uid())` |
| public.channel_credentials | Owners can update their credentials | UPDATE | PERMISSIVE | authenticated | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |  |
| public.channel_credentials | Owners can view their credentials | SELECT | PERMISSIVE | authenticated | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |  |
| public.channel_interactions | Users can create own interactions | INSERT | PERMISSIVE | public |  | `(salesperson_id = get_current_salesperson_id())` |
| public.channel_interactions | Users can delete own interactions | DELETE | PERMISSIVE | public | `(salesperson_id = get_current_salesperson_id())` |  |
| public.channel_interactions | Users can update own interactions | UPDATE | PERMISSIVE | public | `(salesperson_id = get_current_salesperson_id())` |  |
| public.channel_interactions | Users can view own interactions | SELECT | PERMISSIVE | public | `(salesperson_id = get_current_salesperson_id())` |  |
| public.chat_conversations | Users can delete own chat_conversations | DELETE | PERMISSIVE | authenticated | `(salesperson_id = get_current_salesperson_id())` |  |
| public.chat_conversations | Users can insert own chat_conversations | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id = get_current_salesperson_id())` |
| public.chat_conversations | Users can read own chat_conversations | SELECT | PERMISSIVE | authenticated | `(salesperson_id = get_current_salesperson_id())` |  |
| public.chat_conversations | Users can update own chat_conversations | UPDATE | PERMISSIVE | authenticated | `(salesperson_id = get_current_salesperson_id())` |  |
| public.chat_messages | Users can insert own chat_messages | INSERT | PERMISSIVE | authenticated |  | `(conversation_id IN ( SELECT chat_conversations.id    FROM chat_conversations   WHERE (chat_conversations.salesperson_id = get_current_salesperson_id())))` |
| public.chat_messages | Users can read own chat_messages | SELECT | PERMISSIVE | authenticated | `(conversation_id IN ( SELECT chat_conversations.id    FROM chat_conversations   WHERE (chat_conversations.salesperson_id = get_current_salesperson_id())))` |  |
| public.churn_alert_settings | Admins manage churn alert settings | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.churn_alert_settings | Anyone authenticated can read churn alert settings | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.circuit_breaker_events | Admin/manager can log circuit breaker events | INSERT | PERMISSIVE | authenticated |  | `is_admin_or_manager(auth.uid())` |
| public.circuit_breaker_events | Admins and managers can view circuit breaker events | SELECT | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.circuit_breaker_events | Admins can delete circuit breaker events | DELETE | PERMISSIVE | public | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.client_churn_alerts_state | Admins can view all churn alert state | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.client_churn_alerts_state | Users can view their own churn alert state | SELECT | PERMISSIVE | authenticated | `(salesperson_id = auth.uid())` |  |
| public.client_interactions | Allow authenticated users to insert interactions | INSERT | PERMISSIVE | public |  | `(auth.role() = 'authenticated'::text)` |
| public.client_interactions | Portfolio interactions readable | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (auth.uid() = user_id) OR (client_id IN ( SELECT client_portfolio.client_id    FROM client_portfolio   WHERE (client_portfolio.salesperson_id = get_current_salesperson_id()))))` |  |
| public.client_interactions | Users can insert own interactions | INSERT | PERMISSIVE | authenticated |  | `(auth.uid() = user_id)` |
| public.client_interactions | Users can view own interactions | SELECT | PERMISSIVE | authenticated | `((auth.uid() = user_id) OR is_admin_or_manager(auth.uid()))` |  |
| public.client_portfolio | Users can insert own client_portfolio | INSERT | PERMISSIVE | authenticated |  | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| public.client_portfolio | Users can read own client_portfolio | SELECT | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.client_portfolio | Users can update own client_portfolio | UPDATE | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.client_portfolio | admin_delete_client_portfolio | DELETE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.client_renewals | Client renewals scoped visibility | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (client_id IN ( SELECT client_portfolio.client_id    FROM client_portfolio   WHERE (client_portfolio.salesperson_id = get_current_salesperson_id()))))` |  |
| public.clients | Admins and managers can insert clients | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.clients | Admins and managers can update clients | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.clients | Users can insert own clients | INSERT | PERMISSIVE | public |  | `(auth.uid() = user_id)` |
| public.clients | Users can read assigned clients | SELECT | PERMISSIVE | authenticated | `((id IN ( SELECT client_portfolio.client_id    FROM client_portfolio   WHERE (client_portfolio.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |  |
| public.clients | Users can update own clients | UPDATE | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.clients | Users can view own clients | SELECT | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.clients | admin_delete_clients | DELETE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.coaching_actions | Admin or manager delete coaching | DELETE | PERMISSIVE | public | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.coaching_actions | Admin or manager insert coaching | INSERT | PERMISSIVE | public |  | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.coaching_actions | Salesperson updates own coaching status | UPDATE | PERMISSIVE | public | `((salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.coaching_actions | Salesperson views own coaching | SELECT | PERMISSIVE | public | `((salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.coaching_opportunities | coaching_opp_read_authenticated | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.coaching_opportunities | coaching_opp_write_admin_manager | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.coaching_scorecard_config | Allow read for all authenticated users | SELECT | PERMISSIVE | public | `(auth.role() = 'authenticated'::text)` |  |
| public.coaching_sessions | Admins and managers manage all coaching sessions | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.coaching_sessions | Coaches manage their own sessions | ALL | PERMISSIVE | authenticated | `(coach_id = auth.uid())` | `(coach_id = auth.uid())` |
| public.coaching_sessions | Salespeople view their own sessions | SELECT | PERMISSIVE | authenticated | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |  |
| public.coaching_skill_benchmarks | coaching_bench_read_authenticated | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.coaching_skill_benchmarks | coaching_bench_write_admin_manager | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.cohort_analyses | owner_full_access_cohorts | ALL | PERMISSIVE | authenticated | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| public.collectible_badges | Anyone authenticated can view badges | SELECT | PERMISSIVE | public | `(auth.uid() IS NOT NULL)` |  |
| public.combo_tracking | Admins can update combo_tracking | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.combo_tracking | Anyone can read combo_tracking | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.combo_tracking | Users can insert own combo_tracking | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id = ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())  LIMIT 1))` |
| public.commercial_approval_requests | Criar solicitações | INSERT | PERMISSIVE | authenticated |  | `(auth.uid() = requester_id)` |
| public.commercial_approval_requests | Only admins and managers can update approval requests | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.commercial_approval_requests | Users can create approval requests | INSERT | PERMISSIVE | authenticated |  | `(auth.uid() = requester_id)` |
| public.commercial_approval_requests | Users can view their own approval requests | SELECT | PERMISSIVE | authenticated | `((auth.uid() = requester_id) OR is_admin_or_manager(auth.uid()))` |  |
| public.commercial_approval_requests | Ver solicitações | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.commission_bonus_awards | Admins delete awards | DELETE | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.commission_bonus_awards | Admins insert awards | INSERT | PERMISSIVE | authenticated |  | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.commission_bonus_awards | Admins update awards | UPDATE | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.commission_bonus_awards | Salespeople view own awards | SELECT | PERMISSIVE | authenticated | `((salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid()))) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.commission_bonuses | Admins and managers manage commission_bonuses | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.commission_bonuses | Salespeople view applicable active bonuses | SELECT | PERMISSIVE | authenticated | `((is_active = true) AND ((salesperson_id IS NULL) OR (salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))))` |  |
| public.commission_rules | Admins/Managers manage commission rules | ALL | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.commission_rules | Salespeople view own rules | SELECT | PERMISSIVE | public | `((is_active = true) AND ((salesperson_id = get_current_salesperson_id()) OR (salesperson_id IS NULL)))` |  |
| public.commissions | Admins/Managers manage all commissions | ALL | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.commissions | Salespeople view own commissions | SELECT | PERMISSIVE | public | `(salesperson_id = get_current_salesperson_id())` |  |
| public.committee_coverage_history | admin manager write coverage history | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.committee_coverage_history | auth read coverage history | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.committee_extraction_runs | admin manager write extraction runs | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.committee_extraction_runs | auth read extraction runs | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.competitive_chat_messages | Competitive Chat - INSERT | INSERT | PERMISSIVE | public |  | `(((squad_id IS NULL) OR (squad_id IN ( SELECT salespeople.squad_id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))) AND (salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid()))))` |
| public.competitive_chat_messages | Competitive Chat - SELECT | SELECT | PERMISSIVE | public | `((squad_id IS NULL) OR (squad_id IN ( SELECT salespeople.squad_id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid()))))` |  |
| public.competitive_chat_messages | Competitive Chat - UPDATE | UPDATE | PERMISSIVE | public | `((squad_id IS NULL) OR (squad_id IN ( SELECT salespeople.squad_id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid()))))` |  |
| public.competitive_seasons | Admins can manage seasons | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.competitive_seasons | Authenticated can read seasons | SELECT | PERMISSIVE | public | `(auth.uid() IS NOT NULL)` |  |
| public.competitor_mentions | Owners delete mentions on their recordings | DELETE | PERMISSIVE | authenticated | `(EXISTS ( SELECT 1    FROM (call_recordings cr      JOIN salespeople sp ON ((sp.id = cr.salesperson_id)))   WHERE ((cr.id = competitor_mentions.recording_id) AND ((sp.auth_user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |  |
| public.competitor_mentions | Owners insert mentions on their recordings | INSERT | PERMISSIVE | authenticated |  | `(EXISTS ( SELECT 1    FROM (call_recordings cr      JOIN salespeople sp ON ((sp.id = cr.salesperson_id)))   WHERE ((cr.id = competitor_mentions.recording_id) AND ((sp.auth_user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |
| public.competitor_mentions | Owners view mentions of their recordings | SELECT | PERMISSIVE | authenticated | `(EXISTS ( SELECT 1    FROM (call_recordings cr      JOIN salespeople sp ON ((sp.id = cr.salesperson_id)))   WHERE ((cr.id = competitor_mentions.recording_id) AND ((sp.auth_user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |  |
| public.competitors_pricing | Allow read for all authenticated users | SELECT | PERMISSIVE | public | `(auth.role() = 'authenticated'::text)` |  |
| public.competitors_registry | Admins and managers can insert competitors | INSERT | PERMISSIVE | authenticated |  | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.competitors_registry | Admins and managers can update competitors | UPDATE | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.competitors_registry | Admins can delete competitors | DELETE | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.competitors_registry | Anyone authenticated can view competitors | SELECT | PERMISSIVE | public | `(auth.uid() IS NOT NULL)` |  |
| public.consent_records | Admins gerenciam consent_records | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.consent_records | Titular lê próprio consentimento | SELECT | PERMISSIVE | authenticated | `((subject_id = auth.uid()) OR (lower(subject_email) = lower((auth.jwt() ->> 'email'::text))))` |  |
| public.consent_records | Titular registra próprio consentimento | INSERT | PERMISSIVE | authenticated |  | `((subject_id = auth.uid()) OR (lower(subject_email) = lower((auth.jwt() ->> 'email'::text))))` |
| public.consent_records | Titular revoga próprio consentimento | UPDATE | PERMISSIVE | authenticated | `((subject_id = auth.uid()) OR (lower(subject_email) = lower((auth.jwt() ->> 'email'::text))))` |  |
| public.contact_engagement_score | ces_admin_all | ALL | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.contact_engagement_score | ces_select_owner | SELECT | PERMISSIVE | public | `user_owns_engagement_contact(contact_id, contact_type)` |  |
| public.contact_send_time_profile | STO profiles readable by managers and admins | SELECT | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'salesperson'::app_role))` |  |
| public.contact_send_time_profile | STO profiles writable by service role only | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.conversation_analyses | Authenticated can insert conversations | INSERT | PERMISSIVE | public |  | `((auth.uid() IS NOT NULL) AND (analyzed_by = auth.uid()))` |
| public.conversation_analyses | Owner or manager can delete | DELETE | PERMISSIVE | public | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (analyzed_by = auth.uid()))` |  |
| public.conversation_analyses | Owner or manager can update | UPDATE | PERMISSIVE | public | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (analyzed_by = auth.uid()))` |  |
| public.conversation_analyses | Salesperson sees own deal conversations | SELECT | PERMISSIVE | public | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (analyzed_by = auth.uid()) OR (EXISTS ( SELECT 1    FROM (sales s      JOIN salespeople sp ON ((sp.id = s.salesperson_id)))   WHERE ((s.id = conversation_analyses.sale_id) AND (sp.auth_user_id = auth.uid())))))` |  |
| public.critical_moment_notifications | Authenticated users can insert critical moment notifications | INSERT | PERMISSIVE | public |  | `(auth.uid() = recipient_user_id)` |
| public.critical_moment_notifications | Users can view own critical moment notifications | SELECT | PERMISSIVE | authenticated | `(auth.uid() = recipient_user_id)` |  |
| public.critical_moment_notifications | cmn_recipient_read | SELECT | PERMISSIVE | public | `((recipient_user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |  |
| public.critical_moment_notifications | cmn_recipient_update | UPDATE | PERMISSIVE | public | `(recipient_user_id = auth.uid())` |  |
| public.cron_failure_alerts | Admins can view cron failure alerts | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.cs_tickets | CS tickets scoped visibility | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (assigned_to = get_current_salesperson_id()) OR (client_id IN ( SELECT client_portfolio.client_id    FROM client_portfolio   WHERE (client_portfolio.salesperson_id = get_current_salesperson_id()))))` |  |
| public.csat_ces_surveys | cs_sv_modify | ALL | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.csat_ces_surveys | cs_sv_select | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = csat_ces_surveys.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |  |
| public.custom_reports | owner_full_access | ALL | PERMISSIVE | authenticated | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| public.custom_reports | shared_select | SELECT | PERMISSIVE | authenticated | `(is_shared = true)` |  |
| public.daily_challenge_progress | Users can read own daily_challenge_progress | SELECT | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.daily_challenges | Admins and managers can delete daily_challenges | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.daily_challenges | Admins and managers can insert daily_challenges | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.daily_challenges | Admins and managers can update daily_challenges | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.daily_challenges | Authenticated can view daily challenges | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.daily_metrics | Admin and managers can read daily_metrics | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.daily_metrics | Admins and managers can delete daily_metrics | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.daily_metrics | Admins and managers can insert daily_metrics | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.daily_metrics | Admins and managers can update daily_metrics | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.daily_streak_achievements | Users can read own daily_streak_achievements | SELECT | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.dashboard_layouts | Users can manage own dashboard layout | ALL | PERMISSIVE | authenticated | `(salesperson_id = get_current_salesperson_id())` | `(salesperson_id = get_current_salesperson_id())` |
| public.data_access_log | Users can view own data access | SELECT | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.data_retention_policies | Admins leem data_retention_policies | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.data_subject_requests | Admins gerenciam data_subject_requests | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.data_subject_requests | Titular abre própria solicitação | INSERT | PERMISSIVE | authenticated |  | `((subject_id = auth.uid()) AND (lower(subject_email) = lower((auth.jwt() ->> 'email'::text))))` |
| public.data_subject_requests | Titular lê própria solicitação | SELECT | PERMISSIVE | authenticated | `((subject_id = auth.uid()) OR (lower(subject_email) = lower((auth.jwt() ->> 'email'::text))))` |  |
| public.db_rollback_snapshots | Admins can view rollback snapshots | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.dead_letter_replay_audit | admins read dlq replay audit | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.deal_chat_history | Users can delete own chat history | DELETE | PERMISSIVE | public | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.deal_chat_history | Users can insert own deal_chat_history | INSERT | PERMISSIVE | authenticated |  | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| public.deal_chat_history | Users can read own deal_chat_history | SELECT | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.deal_committee_coverage | Owners view own coverage | SELECT | PERMISSIVE | public | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.deal_committee_coverage | Service can upsert coverage | ALL | PERMISSIVE | public | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.deal_health_history | Authenticated users can insert health history | INSERT | PERMISSIVE | public |  | `(auth.uid() = owner_id)` |
| public.deal_health_history | Authenticated users can view health history | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.deal_health_history | Users see own deal health history | SELECT | PERMISSIVE | public | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.deal_health_scores | Authenticated insert health scores | INSERT | PERMISSIVE | public |  | `(auth.uid() IS NOT NULL)` |
| public.deal_health_scores | System can manage deal health | ALL | PERMISSIVE | public | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.deal_health_scores | Users see own deal health | SELECT | PERMISSIVE | public | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.deal_health_scores | View health via sale access | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = deal_health_scores.sale_id) AND ((s.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |  |
| public.deal_outcomes | Users can delete own outcomes | DELETE | PERMISSIVE | public | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.deal_outcomes | Users can insert own outcomes | INSERT | PERMISSIVE | public |  | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| public.deal_outcomes | Users can read own outcomes or admins all | SELECT | PERMISSIVE | public | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.deal_outcomes | Users can update own outcomes | UPDATE | PERMISSIVE | public | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.deal_probability_scores | Admin/manager write deal scores | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.deal_probability_scores | Authenticated read deal scores | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.deal_risk_signals | Authenticated insert signals | INSERT | PERMISSIVE | public |  | `(auth.uid() IS NOT NULL)` |
| public.deal_risk_signals | Owners resolve own signals | UPDATE | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = deal_risk_signals.sale_id) AND ((s.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |  |
| public.deal_risk_signals | View signals via sale access | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = deal_risk_signals.sale_id) AND ((s.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |  |
| public.deal_stage_history | Users can insert own deal_stage_history | INSERT | PERMISSIVE | authenticated |  | `((sale_id IN ( SELECT sales.id    FROM sales   WHERE (sales.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |
| public.deal_stage_history | Users can read own deal_stage_history | SELECT | PERMISSIVE | authenticated | `((sale_id IN ( SELECT sales.id    FROM sales   WHERE (sales.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |  |
| public.deal_stage_history | Users can update own deal_stage_history | UPDATE | PERMISSIVE | authenticated | `((sale_id IN ( SELECT sales.id    FROM sales   WHERE (sales.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |  |
| public.deal_stage_transitions | admin manager write stage transitions | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.deal_stage_transitions | auth read stage transitions | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.deal_stakeholders | Owners delete own stakeholders | DELETE | PERMISSIVE | public | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.deal_stakeholders | Owners insert own stakeholders | INSERT | PERMISSIVE | public |  | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.deal_stakeholders | Owners update own stakeholders | UPDATE | PERMISSIVE | public | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.deal_stakeholders | Owners view own stakeholders | SELECT | PERMISSIVE | public | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.deal_velocity_alerts | admin manager write velocity alerts | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.deal_velocity_alerts | auth read velocity alerts | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.deal_velocity_predictions | dvp_admin_write | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.deal_velocity_predictions | dvp_select_own_or_admin | SELECT | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (EXISTS ( SELECT 1    FROM (sales s      JOIN salespeople sp ON ((sp.id = s.salesperson_id)))   WHERE ((s.id = deal_velocity_predictions.sale_id) AND (sp.auth_user_id = auth.uid())))))` |  |
| public.demand_forecasts | Admins and managers can delete demand forecasts | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.demand_forecasts | Admins and managers can insert demand forecasts | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.demand_forecasts | Admins and managers can update demand forecasts | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.demand_forecasts | Authenticated users can view demand forecasts | SELECT | PERMISSIVE | public | `is_authenticated()` |  |
| public.dialer_queue_items | Manage items via queue ownership | ALL | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM dialer_queues q   WHERE ((q.id = dialer_queue_items.queue_id) AND ((q.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` | `(EXISTS ( SELECT 1    FROM dialer_queues q   WHERE ((q.id = dialer_queue_items.queue_id) AND ((q.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` |
| public.dialer_queue_items | View items via queue ownership | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM dialer_queues q   WHERE ((q.id = dialer_queue_items.queue_id) AND ((q.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |  |
| public.dialer_queues | Owners manage own queues | ALL | PERMISSIVE | public | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |
| public.dialer_queues | Owners view own queues | SELECT | PERMISSIVE | public | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.digital_signatures | Admins and managers can delete digital_signatures | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.digital_signatures | Users can insert own digital_signatures | INSERT | PERMISSIVE | authenticated |  | `((created_by = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| public.digital_signatures | Users can read own digital_signatures | SELECT | PERMISSIVE | authenticated | `((created_by = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.digital_signatures | Users can update own digital_signatures | UPDATE | PERMISSIVE | authenticated | `((created_by = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.document_signers | Admins and managers can delete document_signers | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.document_signers | Authenticated users can insert document_signers | INSERT | PERMISSIVE | authenticated |  | `((document_id IN ( SELECT digital_signatures.id    FROM digital_signatures   WHERE (digital_signatures.created_by = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |
| public.document_signers | Authenticated users can update document_signers | UPDATE | PERMISSIVE | authenticated | `((document_id IN ( SELECT digital_signatures.id    FROM digital_signatures   WHERE (digital_signatures.created_by = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |  |
| public.document_signers | Users can read own document_signers | SELECT | PERMISSIVE | authenticated | `((document_id IN ( SELECT digital_signatures.id    FROM digital_signatures   WHERE (digital_signatures.created_by = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |  |
| public.duplicate_block_logs | Authenticated users can view duplicate block logs | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.edge_call_failures | Admins can view edge call failures | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.edge_retry_events | admins_can_read_edge_retry_events | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.edge_retry_events | service_role_can_insert_edge_retry_events | INSERT | PERMISSIVE | service_role |  | `true` |
| public.email_bulk_drafts | draft access via parent job | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM email_bulk_jobs j   WHERE ((j.id = email_bulk_drafts.job_id) AND ((j.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` |  |
| public.email_bulk_drafts | draft delete via parent job | DELETE | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM email_bulk_jobs j   WHERE ((j.id = email_bulk_drafts.job_id) AND ((j.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` |  |
| public.email_bulk_drafts | draft insert via parent job | INSERT | PERMISSIVE | public |  | `(EXISTS ( SELECT 1    FROM email_bulk_jobs j   WHERE ((j.id = email_bulk_drafts.job_id) AND ((j.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` |
| public.email_bulk_drafts | draft update via parent job | UPDATE | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM email_bulk_jobs j   WHERE ((j.id = email_bulk_drafts.job_id) AND ((j.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` |  |
| public.email_bulk_jobs | owner can delete own bulk jobs | DELETE | PERMISSIVE | public | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |  |
| public.email_bulk_jobs | owner can insert own bulk jobs | INSERT | PERMISSIVE | public |  | `(owner_id = auth.uid())` |
| public.email_bulk_jobs | owner can update own bulk jobs | UPDATE | PERMISSIVE | public | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |  |
| public.email_bulk_jobs | owner can view own bulk jobs | SELECT | PERMISSIVE | public | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |  |
| public.email_engagement_score_history | Owners view own engagement history | SELECT | PERMISSIVE | public | `((EXISTS ( SELECT 1    FROM (sales s      JOIN salespeople sp ON ((sp.id = s.salesperson_id)))   WHERE ((s.id = email_engagement_score_history.sale_id) AND (sp.auth_user_id = auth.uid())))) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.email_engagement_scores | Admins manage engagement scores | ALL | PERMISSIVE | public | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.email_engagement_scores | Owners view own engagement scores | SELECT | PERMISSIVE | public | `((EXISTS ( SELECT 1    FROM (sales s      JOIN salespeople sp ON ((sp.id = s.salesperson_id)))   WHERE ((s.id = email_engagement_scores.sale_id) AND (sp.auth_user_id = auth.uid())))) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.email_logs | Admins and managers can view email_logs | SELECT | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.email_opt_outs | Admins can add opt-outs | INSERT | PERMISSIVE | authenticated |  | `has_role(auth.uid(), 'admin'::app_role)` |
| public.email_opt_outs | Admins can delete opt-outs | DELETE | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.email_opt_outs | Admins can view opt-outs | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.email_tracking_events | Users can view own email tracking | ALL | PERMISSIVE | authenticated | `(salesperson_id = get_current_salesperson_id())` | `(salesperson_id = get_current_salesperson_id())` |
| public.embedded_report_tokens | creator_full_access_tokens | ALL | PERMISSIVE | authenticated | `((created_by = auth.uid()) OR is_admin_or_manager(auth.uid()))` | `((created_by = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| public.engagement_score_history | esh_admin_all | ALL | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.engagement_score_history | esh_select_owner | SELECT | PERMISSIVE | public | `user_owns_engagement_contact(contact_id, contact_type)` |  |
| public.enriched_company_intelligence | Admins e Managers podem ver inteligência de empresas | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role])))))` |  |
| public.entity_versions | Authenticated users can view versions | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.entity_versions | Users can insert versions | INSERT | PERMISSIVE | public |  | `((auth.uid() = changed_by) OR (changed_by IS NULL))` |
| public.error_logs | Admins can view error logs | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.error_logs | Only admins can view error logs | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.error_logs | anon can insert error logs | INSERT | PERMISSIVE | anon |  | `((user_id IS NULL) OR (user_id = auth.uid()))` |
| public.executive_briefings | Admins can delete briefings | DELETE | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.executive_briefings | Admins can update briefings | UPDATE | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.executive_briefings | Authenticated users can view briefings | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.executive_briefings | Managers and admins can create briefings | INSERT | PERMISSIVE | authenticated |  | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.expansion_opportunities | cs_eo_modify | ALL | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (owner_salesperson_id = get_current_salesperson_id()))` | `(is_admin_or_manager(auth.uid()) OR (owner_salesperson_id = get_current_salesperson_id()))` |
| public.expansion_opportunities | cs_eo_select | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (owner_salesperson_id = get_current_salesperson_id()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = expansion_opportunities.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |  |
| public.expansion_playbooks | Authenticated users can view expansion playbooks | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.expansion_playbooks | cs_ep_modify | ALL | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.experiment_assignments | Admins and managers can manage experiment_assignments | ALL | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.experiment_assignments | Users can read their own experiment assignments | SELECT | PERMISSIVE | public | `((auth.uid() = user_id) OR is_admin_or_manager(auth.uid()))` |  |
| public.experiment_variants | Admins and managers can manage experiment_variants | ALL | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.experiment_variants | Authenticated users can read experiment_variants | SELECT | PERMISSIVE | public | `(auth.uid() IS NOT NULL)` |  |
| public.experiments | Admins and managers can manage experiments | ALL | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.experiments | Authenticated users can read experiments | SELECT | PERMISSIVE | public | `(auth.uid() IS NOT NULL)` |  |
| public.external_seller_map | Admins manage seller map | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.external_seller_map | Authenticated read seller map | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.feature_flags | Authenticated users can view feature flags | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.feature_flags | Only admins can manage feature flags | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.feed_comments | Authenticated can read feed_comments | SELECT | PERMISSIVE | public | `(auth.uid() IS NOT NULL)` |  |
| public.feed_comments | Users can insert own feed_comments | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id = get_current_salesperson_id())` |
| public.feed_reactions | Authenticated can delete own reactions | DELETE | PERMISSIVE | authenticated | `(salesperson_id = get_current_salesperson_id())` |  |
| public.feed_reactions | Authenticated can read feed_reactions | SELECT | PERMISSIVE | public | `(auth.uid() IS NOT NULL)` |  |
| public.feed_reactions | Users can insert own feed_reactions | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id = get_current_salesperson_id())` |
| public.follow_up_audit_logs | Authenticated users can insert audit logs | INSERT | PERMISSIVE | public |  | `(auth.uid() IS NOT NULL)` |
| public.follow_up_audit_logs | Users can read audit logs | SELECT | PERMISSIVE | public | `(auth.uid() IS NOT NULL)` |  |
| public.follow_up_notifications | Users can manage their own notifications | ALL | PERMISSIVE | public | `(user_id = auth.uid())` |  |
| public.follow_up_settings | Admins can update follow_up_settings | UPDATE | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role])))))` |  |
| public.follow_up_settings | Authenticated users can read follow_up_settings | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.follow_up_templates | Admins can manage templates | ALL | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::app_role))))` |  |
| public.follow_up_templates | Authenticated users can view active templates | SELECT | PERMISSIVE | authenticated | `(is_active = true)` |  |
| public.follow_up_territory_rules | Admins can manage territory rules | ALL | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::app_role))))` |  |
| public.follow_up_territory_rules | Users can view their own territory rules | SELECT | PERMISSIVE | public | `((salesperson_id = auth.uid()) OR (salesperson_id IS NULL))` |  |
| public.forecast_accuracy | Allow read for all authenticated users | SELECT | PERMISSIVE | public | `(auth.role() = 'authenticated'::text)` |  |
| public.forecast_accuracy | fa_read_auth | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.forecast_accuracy | fa_write_admin_manager | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.forecast_confidence_scores | fcs_read_auth | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.forecast_confidence_scores | fcs_write_admin_manager | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.forecast_deal_contributions | Managers manage contributions | ALL | PERMISSIVE | public | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.forecast_deal_contributions | View forecast contributions via forecast access | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM revenue_forecasts rf   WHERE ((rf.id = forecast_deal_contributions.forecast_id) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (rf.owner_id = get_current_salesperson_id())))))` |  |
| public.forecast_narrative_dead_letters | admins read forecast narrative dlq | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.forecast_snapshots | Allow read for all authenticated users | SELECT | PERMISSIVE | public | `(auth.role() = 'authenticated'::text)` |  |
| public.forecast_snapshots | fs_read_auth | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.forecast_snapshots | fs_write_admin_manager | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.geo_access_logs | Admins can read geo_access_logs | SELECT | PERMISSIVE | public | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.geo_blocked_regions | Admin and managers can read geo_blocked_regions | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.geo_blocked_regions | Admins can manage geo_blocked_regions | ALL | PERMISSIVE | public | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.icp_data | Admins can insert icp_data | INSERT | PERMISSIVE | authenticated |  | `is_admin_or_manager(auth.uid())` |
| public.icp_data | Admins can update icp_data | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.icp_data | Authenticated users can read icp_data | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.icp_data | Users can read own client icp_data | SELECT | PERMISSIVE | authenticated | `((client_id IN ( SELECT client_portfolio.client_id    FROM client_portfolio   WHERE (client_portfolio.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |  |
| public.icp_parameters | Admins can manage ICP parameters | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.icp_parameters | All authenticated can view ICP parameters | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.inbound_reply_events | Admins can view inbound reply events | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.integration_autotest_jobs | admins manage autotest jobs | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.integration_autotest_settings | admins manage autotest settings | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.integration_connections | admins manage connections | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.integration_health_checks | admins read health | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.integration_health_checks | admins write health | INSERT | PERMISSIVE | authenticated |  | `has_role(auth.uid(), 'admin'::app_role)` |
| public.integration_logs | Admins and managers can view integration logs | SELECT | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.integration_secret_refs | Admins can delete secret refs | DELETE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.integration_secret_refs | Admins can insert secret refs | INSERT | PERMISSIVE | authenticated |  | `is_admin_or_manager(auth.uid())` |
| public.integration_secret_refs | Admins can update secret refs | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.integration_secret_refs | Owners can view their secret refs | SELECT | PERMISSIVE | authenticated | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |  |
| public.intent_audit_logs | Authenticated users can insert intent audit logs | INSERT | PERMISSIVE | authenticated |  | `true` |
| public.intent_audit_logs | Authenticated users can view intent audit logs | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.intent_audit_logs | Permitir leitura para todos autenticados | SELECT | PERMISSIVE | public | `(auth.role() = 'authenticated'::text)` |  |
| public.intent_audit_logs | Users can only insert their own intent logs | INSERT | PERMISSIVE | public |  | `(auth.uid() IS NOT NULL)` |
| public.inventory_levels | Admin/manager can view inventory levels | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.inventory_levels | Admins and managers can delete inventory levels | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.inventory_levels | Admins and managers can insert inventory levels | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.inventory_levels | Admins and managers can update inventory levels | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.ip_whitelist | Admins can manage ip_whitelist | ALL | PERMISSIVE | public | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.known_devices | Users can delete own devices | DELETE | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.known_devices | Users can insert own devices | INSERT | PERMISSIVE | public |  | `(auth.uid() = user_id)` |
| public.known_devices | Users can update own devices | UPDATE | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.known_devices | Users can view own devices | SELECT | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.kudos | Admins can update kudos | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.kudos | Authenticated can view kudos | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.kudos | Users can send kudos | INSERT | PERMISSIVE | authenticated |  | `(from_salesperson_id = get_current_salesperson_id())` |
| public.lead_assignments | Admin/manager manage assignments | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.lead_assignments | View own assignments | SELECT | PERMISSIVE | authenticated | `(is_admin_or_manager(auth.uid()) OR (salesperson_id = get_current_salesperson_id()))` |  |
| public.lead_churn_risk | Admins and managers can read lead_churn_risk | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.lead_churn_risk | Salespeople can read churn risk of their sales | SELECT | PERMISSIVE | authenticated | `(EXISTS ( SELECT 1    FROM (sales s      JOIN salespeople sp ON ((sp.id = s.salesperson_id)))   WHERE ((s.id = lead_churn_risk.sale_id) AND (sp.auth_user_id = auth.uid()))))` |  |
| public.lead_detailed_logs | Users can insert logs for their clients | INSERT | PERMISSIVE | authenticated |  | `((auth.uid() = created_by) AND (is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM clients c   WHERE ((c.id = lead_detailed_logs.client_id) AND (c.user_id = auth.uid()))))))` |
| public.lead_detailed_logs | Users can insert own logs | INSERT | PERMISSIVE | authenticated |  | `(auth.uid() = created_by)` |
| public.lead_detailed_logs | Users can view logs of their clients | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM clients c   WHERE ((c.id = lead_detailed_logs.client_id) AND ((c.user_id = auth.uid()) OR (auth.uid() IN ( SELECT users.id            FROM auth.users           WHERE ((users.raw_user_meta_data ->> 'role'::text) = 'admin'::text)))))))` |  |
| public.lead_detailed_logs | Users can view own logs | SELECT | PERMISSIVE | authenticated | `((auth.uid() = created_by) OR is_admin_or_manager(auth.uid()))` |  |
| public.lead_intelligence_metrics | Authenticated read lead_intelligence_metrics | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.lead_routing_log | Admin and managers can read lead_routing_log | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.lead_routing_log | Admins can insert lead_routing_log | INSERT | PERMISSIVE | authenticated |  | `is_admin_or_manager(auth.uid())` |
| public.lead_routing_rules | Admin/manager manage routing rules | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.lead_routing_rules | Authenticated view routing rules | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.lead_score_explanations | Admins manage explanations | ALL | PERMISSIVE | public | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.lead_score_explanations | Salespeople view own deal explanations | SELECT | PERMISSIVE | public | `((EXISTS ( SELECT 1    FROM (sales s      JOIN salespeople sp ON ((sp.id = s.salesperson_id)))   WHERE ((s.id = lead_score_explanations.sale_id) AND (sp.auth_user_id = auth.uid())))) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.lead_score_explanations | Service role manages explanations | ALL | PERMISSIVE | public | `(auth.role() = 'service_role'::text)` | `(auth.role() = 'service_role'::text)` |
| public.lead_score_history | Salespeople view own deal history | SELECT | PERMISSIVE | public | `((EXISTS ( SELECT 1    FROM (sales s      JOIN salespeople sp ON ((sp.id = s.salesperson_id)))   WHERE ((s.id = lead_score_history.sale_id) AND (sp.auth_user_id = auth.uid())))) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.lead_score_history | Service role inserts history | INSERT | PERMISSIVE | public |  | `(auth.role() = 'service_role'::text)` |
| public.lead_score_trends | Allow read for all authenticated users | SELECT | PERMISSIVE | public | `(auth.role() = 'authenticated'::text)` |  |
| public.lead_scores | Users can delete own lead scores | DELETE | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = lead_scores.sale_id) AND ((s.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |  |
| public.lead_scores | Users can insert lead scores for own sales | INSERT | PERMISSIVE | public |  | `(EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = lead_scores.sale_id) AND ((s.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |
| public.lead_scores | Users can read own lead scores or admins all | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = lead_scores.sale_id) AND ((s.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |  |
| public.lead_scores | Users can update own lead scores | UPDATE | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = lead_scores.sale_id) AND ((s.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |  |
| public.lead_source_configs | Allow read for all authenticated users | SELECT | PERMISSIVE | public | `(auth.role() = 'authenticated'::text)` |  |
| public.league_history | Users can view their own league history | SELECT | PERMISSIVE | public | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |  |
| public.league_members | Admins can update league_members | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.league_members | Anyone can read league_members | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.league_members | Users can insert own league_members | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id = ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())  LIMIT 1))` |
| public.leagues | Anyone can read leagues | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.login_alerts | Users can update own alerts | UPDATE | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.login_alerts | Users can view own alerts | SELECT | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.login_attempts | Admins can view login_attempts | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.maintenance_log | Admins can view maintenance log | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.message_templates | Users can create own templates | INSERT | PERMISSIVE | public |  | `(salesperson_id = get_current_salesperson_id())` |
| public.message_templates | Users can delete own templates | DELETE | PERMISSIVE | public | `(salesperson_id = get_current_salesperson_id())` |  |
| public.message_templates | Users can update own templates | UPDATE | PERMISSIVE | public | `(salesperson_id = get_current_salesperson_id())` |  |
| public.message_templates | Users can view own templates | SELECT | PERMISSIVE | public | `(salesperson_id = get_current_salesperson_id())` |  |
| public.mfa_verification_attempts | Users can view own MFA attempts | SELECT | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.migration_log | Admins and managers can manage migration_log | ALL | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.monthly_sales_summary | Managers e admins podem ver monthly_sales_summary | SELECT | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.mood_entries | Users can insert own mood entries | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| public.mood_entries | Users can read own mood entries | SELECT | PERMISSIVE | authenticated | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |  |
| public.mood_entries | Users can update own mood entries | UPDATE | PERMISSIVE | authenticated | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |  |
| public.mql_qualifications | Users can manage own qualifications | ALL | PERMISSIVE | authenticated | `((auth.uid() = qualified_by) OR is_admin_or_manager(auth.uid()))` | `((auth.uid() = qualified_by) OR is_admin_or_manager(auth.uid()))` |
| public.notification_preferences | Users can delete own notification preferences | DELETE | PERMISSIVE | authenticated | `(user_id = auth.uid())` |  |
| public.notification_preferences | Users can insert own notification preferences | INSERT | PERMISSIVE | authenticated |  | `(user_id = auth.uid())` |
| public.notification_preferences | Users can update own notification preferences | UPDATE | PERMISSIVE | authenticated | `(user_id = auth.uid())` |  |
| public.notification_preferences | Users can update their notification preferences | ALL | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.notification_preferences | Users can view own notification preferences | SELECT | PERMISSIVE | authenticated | `(user_id = auth.uid())` |  |
| public.notifications | Admins and managers can view churn alert notifications | SELECT | PERMISSIVE | authenticated | `((type = 'churn_alert'::text) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))` |  |
| public.notifications | Users can insert their own notifications | INSERT | PERMISSIVE | public |  | `(auth.uid() = user_id)` |
| public.notifications | Users can view their own notifications | SELECT | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.notifications | notifications_delete_own | DELETE | PERMISSIVE | authenticated | `(user_id = auth.uid())` |  |
| public.notifications | notifications_insert_own_or_admin | INSERT | PERMISSIVE | authenticated |  | `((user_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| public.notifications | notifications_select_own | SELECT | PERMISSIVE | authenticated | `(user_id = auth.uid())` |  |
| public.notifications | notifications_update_own | UPDATE | PERMISSIVE | authenticated | `(user_id = auth.uid())` | `(user_id = auth.uid())` |
| public.nps_surveys | Authenticated users can view nps surveys | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.nps_surveys | Salespeople can create their own nps surveys | INSERT | PERMISSIVE | authenticated |  | `(get_current_salesperson_id() = salesperson_id)` |
| public.nps_surveys | Salespeople can delete their own nps surveys | DELETE | PERMISSIVE | authenticated | `((get_current_salesperson_id() = salesperson_id) OR is_admin_or_manager(auth.uid()))` |  |
| public.nps_surveys | Salespeople can update their own nps surveys | UPDATE | PERMISSIVE | authenticated | `((get_current_salesperson_id() = salesperson_id) OR is_admin_or_manager(auth.uid()))` |  |
| public.nps_surveys | nps_surveys_delete_admin_manager | DELETE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.nps_surveys | nps_surveys_insert_owner_or_manager | INSERT | PERMISSIVE | authenticated |  | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| public.nps_surveys | nps_surveys_select_owner_or_manager | SELECT | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.nps_surveys | nps_surveys_update_owner_or_manager | UPDATE | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| public.objection_library | Admin/manager write objection library | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.objection_library | Authenticated read objection library | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.objections_library | Admins and managers can delete objections_library | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.objections_library | Admins and managers can insert objections_library | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.objections_library | Admins and managers can update objections_library | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.objections_library | Authenticated users can read objections_library | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.onboarding_journeys | cs_oj_modify | ALL | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (owner_salesperson_id = get_current_salesperson_id()))` | `(is_admin_or_manager(auth.uid()) OR (owner_salesperson_id = get_current_salesperson_id()))` |
| public.onboarding_journeys | cs_oj_select | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (owner_salesperson_id = get_current_salesperson_id()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = onboarding_journeys.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |  |
| public.onboarding_steps | cs_os_modify | ALL | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM onboarding_journeys j   WHERE ((j.id = onboarding_steps.journey_id) AND (is_admin_or_manager(auth.uid()) OR (j.owner_salesperson_id = get_current_salesperson_id())))))` | `(EXISTS ( SELECT 1    FROM onboarding_journeys j   WHERE ((j.id = onboarding_steps.journey_id) AND (is_admin_or_manager(auth.uid()) OR (j.owner_salesperson_id = get_current_salesperson_id())))))` |
| public.onboarding_steps | cs_os_select | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM onboarding_journeys j   WHERE ((j.id = onboarding_steps.journey_id) AND (is_admin_or_manager(auth.uid()) OR (j.owner_salesperson_id = get_current_salesperson_id())))))` |  |
| public.order_items | Admins and managers manage order_items | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.order_items | Users insert own order items | INSERT | PERMISSIVE | public |  | `(EXISTS ( SELECT 1    FROM orders o   WHERE ((o.id = order_items.order_id) AND (o.user_id = auth.uid()))))` |
| public.order_items | Users view own order items | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM orders o   WHERE ((o.id = order_items.order_id) AND ((o.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` |  |
| public.order_status_events | Admins and managers view order events | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.order_status_events | Users view own order events | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM orders o   WHERE ((o.id = order_status_events.order_id) AND ((o.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` |  |
| public.orders | Admins and managers manage orders | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.orders | Salespeople view assigned orders | SELECT | PERMISSIVE | authenticated | `((salesperson_id IS NOT NULL) AND (salesperson_id = get_current_salesperson_id()))` |  |
| public.orders | Users insert own orders | INSERT | PERMISSIVE | public |  | `(auth.uid() = user_id)` |
| public.orders | Users view own orders | SELECT | PERMISSIVE | authenticated | `(auth.uid() = user_id)` |  |
| public.outbound_messages | Owners can insert their outbound messages | INSERT | PERMISSIVE | authenticated |  | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| public.outbound_messages | Owners can update their outbound messages | UPDATE | PERMISSIVE | authenticated | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |  |
| public.outbound_messages | Owners can view their outbound messages | SELECT | PERMISSIVE | authenticated | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |  |
| public.page_analytics | Users can insert own analytics | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| public.page_analytics | Users can update own analytics | UPDATE | PERMISSIVE | authenticated | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |  |
| public.page_analytics | Users can view own analytics | SELECT | PERMISSIVE | authenticated | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |  |
| public.password_history | Users can view own password history | SELECT | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.password_reset_requests | Admins can manage password_reset_requests | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.password_reset_requests | Users can insert own reset requests | INSERT | PERMISSIVE | authenticated |  | `((user_id = auth.uid()) AND (user_email = get_current_user_email()) AND (status = 'pending'::text))` |
| public.password_reset_requests | Users can view their own reset requests | SELECT | PERMISSIVE | authenticated | `((auth.uid() IS NOT NULL) AND (user_email = get_current_user_email()))` |  |
| public.performance_bets | Users can insert own bets | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id = get_current_salesperson_id())` |
| public.performance_bets | Users can read own or all bets | SELECT | PERMISSIVE | authenticated | `((salesperson_id = ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())  LIMIT 1)) OR is_admin_or_manager(auth.uid()))` |  |
| public.performance_bets | Users can update own bets | UPDATE | PERMISSIVE | authenticated | `(salesperson_id = get_current_salesperson_id())` |  |
| public.performance_impact_factors | Allow read for all authenticated users | SELECT | PERMISSIVE | public | `(auth.role() = 'authenticated'::text)` |  |
| public.permissions | Admin and managers can read permissions | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.permissions | Admins can manage permissions | ALL | PERMISSIVE | public | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.person_intelligence | Admins e Managers podem ver inteligência de pessoas | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role])))))` |  |
| public.personal_assistant_briefings | pab_admin_manager_select | SELECT | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.personal_assistant_briefings | pab_owner_insert | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id IN ( SELECT s.id    FROM salespeople s   WHERE (s.auth_user_id = auth.uid())))` |
| public.personal_assistant_briefings | pab_owner_select | SELECT | PERMISSIVE | authenticated | `(salesperson_id IN ( SELECT s.id    FROM salespeople s   WHERE (s.auth_user_id = auth.uid())))` |  |
| public.personal_assistant_briefings | pab_owner_update | UPDATE | PERMISSIVE | authenticated | `(salesperson_id IN ( SELECT s.id    FROM salespeople s   WHERE (s.auth_user_id = auth.uid())))` | `(salesperson_id IN ( SELECT s.id    FROM salespeople s   WHERE (s.auth_user_id = auth.uid())))` |
| public.personal_assistant_nudges | Admins and managers can read all nudges | SELECT | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.personal_assistant_nudges | Salesperson inserts own nudges | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| public.personal_assistant_nudges | Salesperson reads own nudges | SELECT | PERMISSIVE | authenticated | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |  |
| public.personal_assistant_nudges | Salesperson updates own nudge feedback | UPDATE | PERMISSIVE | authenticated | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| public.pipeline_coverage_recommendations | Admins can delete coverage recommendations | DELETE | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.pipeline_coverage_recommendations | Admins/managers can insert coverage recommendations | INSERT | PERMISSIVE | authenticated |  | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.pipeline_coverage_recommendations | Authenticated users can view coverage recommendations | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.pipeline_coverage_recommendations | Managers can update coverage recommendations | UPDATE | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.pipeline_coverage_snapshots | Admins can delete coverage snapshots | DELETE | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.pipeline_coverage_snapshots | Admins/managers can insert coverage snapshots | INSERT | PERMISSIVE | authenticated |  | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.pipeline_coverage_snapshots | Admins/managers can update coverage snapshots | UPDATE | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.pipeline_coverage_snapshots | Authenticated users can view coverage snapshots | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.pipeline_inspection_snapshots | pis_insert_admin | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.pipeline_inspection_snapshots | pis_select | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = pipeline_inspection_snapshots.sale_id) AND (s.salesperson_id = get_current_salesperson_id())))))` |  |
| public.pipeline_inspections | Managers can create inspections | INSERT | PERMISSIVE | public |  | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role])))))` |
| public.pipeline_inspections | Users can view inspections for their sales | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM sales   WHERE ((sales.id = pipeline_inspections.sale_id) AND ((sales.salesperson_id = auth.uid()) OR (auth.uid() IN ( SELECT user_roles.user_id            FROM user_roles           WHERE (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role]))))))))` |  |
| public.pipeline_stages | Authenticated users can view pipeline stages | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.pipeline_stages | Only admins can manage pipeline stages | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.pipeline_stages | pipeline_stages_delete_admin_manager | DELETE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.pipeline_stages | pipeline_stages_insert_admin_manager | INSERT | PERMISSIVE | authenticated |  | `is_admin_or_manager(auth.uid())` |
| public.pipeline_stages | pipeline_stages_select_authenticated | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.pipeline_stages | pipeline_stages_update_admin_manager | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.pipelines | Authenticated users can view pipelines | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.pipelines | pipelines_delete_admin_manager | DELETE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.pipelines | pipelines_insert_admin_manager | INSERT | PERMISSIVE | authenticated |  | `is_admin_or_manager(auth.uid())` |
| public.pipelines | pipelines_select_authenticated | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.pipelines | pipelines_update_admin_manager | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.plan_rollback_ddl | Internal admin only - service_role bypasses RLS | ALL | PERMISSIVE | service_role | `true` | `true` |
| public.playbook_items | Admins and managers can delete playbook_items | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.playbook_items | Admins and managers can insert playbook_items | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.playbook_items | Admins and managers can update playbook_items | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.playbook_items | Authenticated users can read playbook_items | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.playbook_progress | Allow read for all authenticated | SELECT | PERMISSIVE | public | `(auth.role() = 'authenticated'::text)` |  |
| public.playbook_progress | Allow update for own completion | ALL | PERMISSIVE | public | `(auth.uid() = completed_by)` |  |
| public.playbook_progress | Users can delete own playbook_progress | DELETE | PERMISSIVE | authenticated | `((completed_by = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.playbook_progress | Users can insert own playbook_progress | INSERT | PERMISSIVE | authenticated |  | `((completed_by = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| public.playbook_progress | Users can update own playbook_progress | UPDATE | PERMISSIVE | authenticated | `((completed_by = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.playbook_progress | Users can view own playbook_progress or admin | SELECT | PERMISSIVE | authenticated | `((completed_by = get_current_salesperson_id()) OR (sale_id IN ( SELECT sales.id    FROM sales   WHERE (sales.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |  |
| public.playbooks | Admins and managers can delete playbooks | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.playbooks | Admins and managers can insert playbooks | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.playbooks | Admins and managers can update playbooks | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.playbooks | Authenticated users can read playbooks | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.portfolio_settings | Admins can manage portfolio_settings | ALL | PERMISSIVE | public | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.portfolio_settings | Admins can read all portfolio settings including credentials | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.portfolio_settings | Authenticated can view portfolio settings | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.portfolio_settings | Authenticated users can read non-sensitive portfolio settings | SELECT | PERMISSIVE | authenticated | `((setting_key !~~* '%token%'::text) AND (setting_key !~~* '%secret%'::text) AND (setting_key !~~* '%webhook%'::text) AND (setting_key !~~* '%api_key%'::text) AND (setting_key !~~* '%password%'::text) AND (setting_key !~~* '%credential%'::text) AND (setting_key !~~* '%private%'::text))` |  |
| public.price_alerts | Admin and managers can update price_alerts | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.price_alerts | Admin/manager can insert price_alerts | INSERT | PERMISSIVE | authenticated |  | `is_admin_or_manager(auth.uid())` |
| public.price_alerts | Admin/manager can view price_alerts | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.price_history | Admin and managers can insert price_history | INSERT | PERMISSIVE | authenticated |  | `is_admin_or_manager(auth.uid())` |
| public.price_history | Admin/manager can view price_history | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.price_protection_rules | Allow read for all authenticated users | SELECT | PERMISSIVE | public | `(auth.role() = 'authenticated'::text)` |  |
| public.pricing_rules | Pricing rules are viewable by authenticated users | SELECT | PERMISSIVE | public | `(auth.role() = 'authenticated'::text)` |  |
| public.prize_wheel_spins | Insert own spins | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id = get_current_salesperson_id())` |
| public.prize_wheel_spins | Own or admin can view spins | SELECT | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.product_stock_log | Allow authenticated users to read stock logs | SELECT | PERMISSIVE | public | `(auth.role() = 'authenticated'::text)` |  |
| public.product_usage | Product usage scoped visibility | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (client_id IN ( SELECT client_portfolio.client_id    FROM client_portfolio   WHERE (client_portfolio.salesperson_id = get_current_salesperson_id()))))` |  |
| public.product_usage_events | cs_pue_insert | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.product_usage_events | cs_pue_select | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = product_usage_events.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |  |
| public.product_usage_summary | cs_pus_modify | ALL | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.product_usage_summary | cs_pus_select | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = product_usage_summary.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |  |
| public.products | Admins and managers can insert products | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.products | Admins and managers can update products | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.products | Authenticated users can read products | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.products | admin_delete_products | DELETE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.progressive_goals | Admins can update progressive_goals | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.progressive_goals | Users can insert own goals | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id = get_current_salesperson_id())` |
| public.progressive_goals | Users can view own goals or admin | SELECT | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.prospect_cadences | Salespeople view own quote cadences | SELECT | PERMISSIVE | authenticated | `((quote_id IS NOT NULL) AND (EXISTS ( SELECT 1    FROM (quotes q      JOIN salespeople sp ON ((sp.id = COALESCE(prospect_cadences.salesperson_id, sp.id))))   WHERE ((q.id = prospect_cadences.quote_id) AND ((q.created_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))))))` |  |
| public.prospect_cadences | Users can delete own prospect_cadences | DELETE | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.prospect_cadences | Users can insert own prospect_cadences | INSERT | PERMISSIVE | authenticated |  | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| public.prospect_cadences | Users can read own prospect_cadences | SELECT | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.prospect_cadences | Users can update own prospect_cadences | UPDATE | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.push_subscriptions | Users can create their own push subscription | INSERT | PERMISSIVE | public |  | `(auth.uid() = user_id)` |
| public.push_subscriptions | Users can delete own push subscriptions | DELETE | PERMISSIVE | authenticated | `(user_id = auth.uid())` |  |
| public.push_subscriptions | Users can delete their own push subscription | DELETE | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.push_subscriptions | Users can insert own push subscriptions | INSERT | PERMISSIVE | authenticated |  | `(user_id = auth.uid())` |
| public.push_subscriptions | Users can read own push subscriptions | SELECT | PERMISSIVE | authenticated | `(user_id = auth.uid())` |  |
| public.push_subscriptions | Users can update own push subscriptions | UPDATE | PERMISSIVE | authenticated | `(user_id = auth.uid())` |  |
| public.push_subscriptions | Users can update their own push subscription | UPDATE | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.push_subscriptions | Users can view their own push subscription | SELECT | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.qbr_reports | qbr_delete_admin | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.qbr_reports | qbr_insert_admin | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.qbr_reports | qbr_select | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (salesperson_id = get_current_salesperson_id()))` |  |
| public.qbr_schedule | cs_qbr_modify | ALL | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.qbr_schedule | cs_qbr_select | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (owner_salesperson_id = get_current_salesperson_id()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = qbr_schedule.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |  |
| public.query_telemetry | Admins can delete telemetry | DELETE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.query_telemetry | Admins can view telemetry | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.query_telemetry | Authenticated users can insert own telemetry | INSERT | PERMISSIVE | authenticated |  | `(auth.uid() IS NOT NULL)` |
| public.quota_attainment_actions | Admins/managers manage quota actions | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.quota_attainment_actions | Authenticated can view quota actions | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.quota_attainment_alerts | Admin/manager write alerts | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.quota_attainment_alerts | Authenticated read alerts | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.quota_attainment_forecasts | Admins/managers manage quota forecasts | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.quota_attainment_forecasts | Authenticated can view quota forecasts | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.quota_attainment_predictions | Admin/manager write predictions | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.quota_attainment_predictions | Allow read for all authenticated users | SELECT | PERMISSIVE | public | `(auth.role() = 'authenticated'::text)` |  |
| public.quota_attainment_predictions | Authenticated read predictions | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.quote_conversion_audit | admins can read conversion audit | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.quote_items | Admins delete quote items | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.quote_items | Closers insert own quote items | INSERT | PERMISSIVE | public |  | `(EXISTS ( SELECT 1    FROM quotes q   WHERE ((q.id = quote_items.quote_id) AND (is_admin_or_manager(auth.uid()) OR (q.created_by = get_current_salesperson_id())))))` |
| public.quote_items | Closers update own quote items | UPDATE | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM quotes q   WHERE ((q.id = quote_items.quote_id) AND (is_admin_or_manager(auth.uid()) OR (q.created_by = get_current_salesperson_id())))))` | `(EXISTS ( SELECT 1    FROM quotes q   WHERE ((q.id = quote_items.quote_id) AND (is_admin_or_manager(auth.uid()) OR (q.created_by = get_current_salesperson_id())))))` |
| public.quote_items | Quote items are viewable by authenticated users | SELECT | PERMISSIVE | public | `(auth.role() = 'authenticated'::text)` |  |
| public.quote_sync_inbound_log | Admins can read quote sync inbound log | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.quote_sync_logs | Admins can insert quote_sync_logs | INSERT | PERMISSIVE | authenticated |  | `is_admin_or_manager(auth.uid())` |
| public.quote_sync_logs | Admins can view quote sync logs | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.quote_sync_logs | Admins can view sync logs | SELECT | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.quotes | Admins and managers can view all quotes | SELECT | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.quotes | Closers can insert quotes | INSERT | PERMISSIVE | public |  | `(is_admin_or_manager(auth.uid()) OR (created_by = get_current_salesperson_id()))` |
| public.quotes | Closers can read quotes | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (created_by = get_current_salesperson_id()))` |  |
| public.quotes | Closers can update quotes | UPDATE | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (created_by = get_current_salesperson_id()))` |  |
| public.quotes | Salespeople can view own quotes | SELECT | PERMISSIVE | authenticated | `((get_current_salesperson_id() IS NOT NULL) AND (created_by IS NOT NULL) AND (created_by = get_current_salesperson_id()))` |  |
| public.quotes | admin_delete_quotes | DELETE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.quotes_inbound | Admins e managers podem ler quotes_inbound | SELECT | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.quotes_inbound | Vendedores podem ver seus próprios orçamentos inbound | SELECT | PERMISSIVE | authenticated | `(seller_email = ( SELECT salespeople.email    FROM salespeople   WHERE ((salespeople.auth_user_id = auth.uid()) AND (salespeople.is_active = true))  LIMIT 1))` |  |
| public.race_badges | view_race_badges | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.race_cars | admin_manage_cars | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.race_cars | insert_own_car | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| public.race_cars | update_own_car | UPDATE | PERMISSIVE | authenticated | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |  |
| public.race_cars | view_race_cars | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.race_daily_snapshots | race_daily_snapshots_admin_manage | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.race_daily_snapshots | race_daily_snapshots_select_authenticated | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.race_events | view_race_events | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.race_overlay_telemetry | Admins read all overlay telemetry | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.race_overlay_telemetry | Users insert their overlay telemetry | INSERT | PERMISSIVE | authenticated |  | `(auth.uid() = user_id)` |
| public.race_overlay_telemetry | Users read their overlay telemetry | SELECT | PERMISSIVE | authenticated | `(auth.uid() = user_id)` |  |
| public.race_overlay_telemetry | Users update their overlay telemetry | UPDATE | PERMISSIVE | authenticated | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |
| public.race_powerups | view_powerups | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.race_reactions | Reactions readable by authenticated | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.race_reactions | Users insert own reactions | INSERT | PERMISSIVE | authenticated |  | `(auth.uid() = reactor_user_id)` |
| public.race_rivalries_persistent | Admins manage all rivalries | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.race_rivalries_persistent | Authenticated users can view rivalries | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.race_rivalries_persistent | Owners can manage own rivalry | ALL | PERMISSIVE | authenticated | `(EXISTS ( SELECT 1    FROM (race_cars rc      JOIN salespeople sp ON ((sp.id = rc.salesperson_id)))   WHERE ((rc.id = race_rivalries_persistent.car_id) AND (sp.auth_user_id = auth.uid()))))` | `(EXISTS ( SELECT 1    FROM (race_cars rc      JOIN salespeople sp ON ((sp.id = rc.salesperson_id)))   WHERE ((rc.id = race_rivalries_persistent.car_id) AND (sp.auth_user_id = auth.uid()))))` |
| public.race_scoring_rules | admin_manage_scoring_rules | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.race_scoring_rules | read_scoring_rules_authenticated | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.race_seasons | admin_manage_race_seasons | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.race_seasons | view_race_seasons | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.race_team_members | Admins manage team members | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.race_team_members | Authenticated users can view team members | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.race_teams | Admins manage teams | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.race_teams | Authenticated users can view teams | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.race_unlocks | Users insert own unlocks | INSERT | PERMISSIVE | public |  | `(auth.uid() = user_id)` |
| public.race_unlocks | Users view own unlocks | SELECT | PERMISSIVE | public | `((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role))` |  |
| public.race_user_daily_checkins | race_user_daily_checkins_own_insert | INSERT | PERMISSIVE | authenticated |  | `(auth.uid() = user_id)` |
| public.race_user_daily_checkins | race_user_daily_checkins_own_select | SELECT | PERMISSIVE | authenticated | `(auth.uid() = user_id)` |  |
| public.race_user_preferences | Users delete own race preferences | DELETE | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.race_user_preferences | Users insert own race preferences | INSERT | PERMISSIVE | public |  | `(auth.uid() = user_id)` |
| public.race_user_preferences | Users read own race preferences | SELECT | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.race_user_preferences | Users update own race preferences | UPDATE | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.rank_change_notifications | Users can insert own rank_notifications | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id = get_current_salesperson_id())` |
| public.rank_change_notifications | Users can read own rank notifications | SELECT | PERMISSIVE | authenticated | `(salesperson_id = get_current_salesperson_id())` |  |
| public.rank_change_notifications | Users can update own notifications | UPDATE | PERMISSIVE | authenticated | `(salesperson_id = get_current_salesperson_id())` |  |
| public.ranking_notifications | Admin manager delete ranking notifications | DELETE | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.ranking_notifications | Admin manager insert ranking notifications | INSERT | PERMISSIVE | authenticated |  | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.ranking_notifications | Salesperson reads own ranking notifications | SELECT | PERMISSIVE | authenticated | `((salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid()))) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.ranking_notifications | Salesperson updates own ranking notifications | UPDATE | PERMISSIVE | authenticated | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |  |
| public.rate_limit_logs | Admins can read rate_limit_logs | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.rate_limit_logs | Admins can view rate_limit_logs | SELECT | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.rate_limit_settings | Admin can read rate_limit_settings | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.rate_limit_settings | Admins can manage rate_limit_settings | ALL | PERMISSIVE | public | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.reauthentication_requests | Users can delete own reauth requests | DELETE | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.reauthentication_requests | Users can insert own reauth requests | INSERT | PERMISSIVE | public |  | `(auth.uid() = user_id)` |
| public.reauthentication_requests | Users can view own reauth requests | SELECT | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.renewals | cs_rn_modify | ALL | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.renewals | cs_rn_select | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (owner_salesperson_id = get_current_salesperson_id()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = renewals.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |  |
| public.report_embed_tokens | Owners and managers can delete embed tokens | DELETE | PERMISSIVE | public | `((created_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.report_embed_tokens | Owners and managers can update embed tokens | UPDATE | PERMISSIVE | public | `((created_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.report_embed_tokens | Owners and managers can view embed tokens | SELECT | PERMISSIVE | public | `((created_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.report_embed_tokens | Owners can create embed tokens | INSERT | PERMISSIVE | public |  | `(created_by = auth.uid())` |
| public.report_executions | report_owner_view | SELECT | PERMISSIVE | authenticated | `(EXISTS ( SELECT 1    FROM custom_reports r   WHERE ((r.id = report_executions.report_id) AND ((r.owner_id = auth.uid()) OR is_admin_or_manager(auth.uid())))))` |  |
| public.report_schedules | creator_full_access | ALL | PERMISSIVE | authenticated | `((created_by = auth.uid()) OR is_admin_or_manager(auth.uid()))` | `((created_by = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| public.revenue_forecasts | Managers and admins view all forecasts | SELECT | PERMISSIVE | public | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (owner_id = get_current_salesperson_id()))` |  |
| public.revenue_forecasts | System can manage forecasts | ALL | PERMISSIVE | public | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.role_permissions | Admin and managers can read role_permissions | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.role_permissions | Admins can manage role_permissions | ALL | PERMISSIVE | public | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.sale_notifications_audit | Managers can view sale notification audits | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role])))))` |  |
| public.sales | Admins and Managers can insert sales | INSERT | PERMISSIVE | public |  | `is_admin_or_manager()` |
| public.sales | Admins and Managers can update sales | UPDATE | PERMISSIVE | public | `is_admin_or_manager()` |  |
| public.sales | Admins and Managers can view all sales | SELECT | PERMISSIVE | public | `is_admin_or_manager()` |  |
| public.sales | Admins can update any sale | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.sales | Closers can view leads assigned to them | SELECT | PERMISSIVE | public | `(closer_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |  |
| public.sales | SDRs can view leads they prospected | SELECT | PERMISSIVE | public | `(sdr_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |  |
| public.sales | Salespeople can insert their own sales | INSERT | PERMISSIVE | public |  | `(EXISTS ( SELECT 1    FROM salespeople   WHERE ((salespeople.auth_user_id = auth.uid()) AND (salespeople.id = sales.salesperson_id))))` |
| public.sales | Salespeople can update their own sales | UPDATE | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM salespeople   WHERE ((salespeople.auth_user_id = auth.uid()) AND (salespeople.id = sales.salesperson_id))))` | `(EXISTS ( SELECT 1    FROM salespeople   WHERE ((salespeople.auth_user_id = auth.uid()) AND (salespeople.id = sales.salesperson_id))))` |
| public.sales | Salespeople can view their own sales | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM salespeople   WHERE ((salespeople.auth_user_id = auth.uid()) AND (salespeople.id = sales.salesperson_id))))` |  |
| public.sales | Users can enrich their own leads | UPDATE | PERMISSIVE | public | `(auth.uid() = salesperson_id)` | `(auth.uid() = salesperson_id)` |
| public.sales | Users can insert own sales | INSERT | PERMISSIVE | public |  | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| public.sales | Users can read own sales or admins all | SELECT | PERMISSIVE | public | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.sales | admin_delete_sales | DELETE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.sales_battles | Admins can manage battles | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.sales_battles | Authenticated can read sales_battles | SELECT | PERMISSIVE | public | `(auth.uid() IS NOT NULL)` |  |
| public.sales_enablement_assets | Authenticated users can view active assets | SELECT | PERMISSIVE | authenticated | `((is_active = true) OR is_admin_or_manager(auth.uid()))` |  |
| public.sales_enablement_assets | Managers can manage assets | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.sales_goals | Admins can delete goals | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.sales_goals | Admins can insert goals | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.sales_goals | Admins can update goals | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.sales_goals | Users can read own goals or admins all | SELECT | PERMISSIVE | public | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.sales_streaks | Admins can update sales_streaks | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.sales_streaks | Anyone can read streaks | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.sales_streaks | Insert own streak | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id = get_current_salesperson_id())` |
| public.sales_territories | Admins can insert territories | INSERT | PERMISSIVE | authenticated |  | `is_admin_or_manager(auth.uid())` |
| public.sales_territories | Admins can update territories | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.sales_territories | Auth users can read territories | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.salespeople | Admin can update any salesperson | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.salespeople | Admins can insert salespeople | INSERT | PERMISSIVE | authenticated |  | `is_admin_or_manager(auth.uid())` |
| public.salespeople | Users can delete own salesperson record | DELETE | PERMISSIVE | authenticated | `(auth_user_id = auth.uid())` |  |
| public.salespeople | Users can read own full salesperson data | SELECT | PERMISSIVE | authenticated | `((auth_user_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |  |
| public.salespeople | Users can read own salesperson record | SELECT | PERMISSIVE | authenticated | `((auth_user_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |  |
| public.salesperson_badges | Authenticated can view earned badges | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.salesperson_badges | System can insert badges | INSERT | PERMISSIVE | authenticated |  | `(salesperson_id = get_current_salesperson_id())` |
| public.salesperson_badges | Users can update own badges | UPDATE | PERMISSIVE | authenticated | `(salesperson_id = get_current_salesperson_id())` |  |
| public.salesperson_coaching_aggregates | sca_read_authenticated | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.salesperson_coaching_aggregates | sca_write_admin_manager | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.salesperson_commission_configs | Admins can manage commission configs | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.salesperson_commission_configs | Salespeople can view their own commission config | SELECT | PERMISSIVE | authenticated | `(get_current_salesperson_id() = salesperson_id)` |  |
| public.salesperson_custom_field_values | Admins can manage field values | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.salesperson_custom_field_values | Own or admin can view field values | SELECT | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.salesperson_leagues | Anyone can read leagues | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.salesperson_leagues | System can manage leagues | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.salesperson_performance_telemetry | Own telemetry or admin can read | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (salesperson_id = get_current_salesperson_id()))` |  |
| public.salesperson_preferences | Users can insert own preferences | INSERT | PERMISSIVE | public |  | `(salesperson_id = get_current_salesperson_id())` |
| public.salesperson_preferences | Users can read own preferences | SELECT | PERMISSIVE | public | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.salesperson_preferences | Users can update own preferences | UPDATE | PERMISSIVE | public | `(salesperson_id = get_current_salesperson_id())` |  |
| public.salesperson_xp | Admins can update salesperson_xp | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.salesperson_xp | Authenticated users can read salesperson_xp | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.salesperson_xp | Authenticated users can view XP | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.saved_filters | Users can create their own saved filters | INSERT | PERMISSIVE | public |  | `(auth.uid() = user_id)` |
| public.saved_filters | Users can delete their own saved filters | DELETE | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.saved_filters | Users can update their own saved filters | UPDATE | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.saved_filters | Users can view their own saved filters | SELECT | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.scheduled_report_runs | owner or manager can view scheduled_report_runs | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM scheduled_reports sr   WHERE ((sr.id = scheduled_report_runs.schedule_id) AND ((sr.created_by = auth.uid()) OR is_admin_or_manager(auth.uid())))))` |  |
| public.scheduled_reports | owner can insert scheduled_reports | INSERT | PERMISSIVE | public |  | `(created_by = auth.uid())` |
| public.scheduled_reports | owner or manager can delete scheduled_reports | DELETE | PERMISSIVE | public | `((created_by = auth.uid()) OR is_admin_or_manager(auth.uid()))` |  |
| public.scheduled_reports | owner or manager can update scheduled_reports | UPDATE | PERMISSIVE | public | `((created_by = auth.uid()) OR is_admin_or_manager(auth.uid()))` |  |
| public.scheduled_reports | owner or manager can view scheduled_reports | SELECT | PERMISSIVE | public | `((created_by = auth.uid()) OR is_admin_or_manager(auth.uid()))` |  |
| public.scheduled_sends | owners insert scheduled_sends | INSERT | PERMISSIVE | authenticated |  | `(owner_id = auth.uid())` |
| public.scheduled_sends | owners read own scheduled_sends | SELECT | PERMISSIVE | authenticated | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.scheduled_sends | owners update own scheduled_sends | UPDATE | PERMISSIVE | authenticated | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |
| public.score_change_logs | Admins and managers can view score logs | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.score_change_logs | Authenticated can insert score logs | INSERT | PERMISSIVE | authenticated |  | `is_admin_or_manager(auth.uid())` |
| public.sdr_alert_configs | Users can manage their own alert configs | ALL | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.sdr_alert_history | Only admins can view SDR alert history | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.sdr_performance_settings | Users can manage their own performance settings | ALL | PERMISSIVE | public | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |
| public.security_alert_history | Admins can view alert history | SELECT | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.security_alert_settings | Admins can insert security settings | INSERT | PERMISSIVE | authenticated |  | `is_admin_or_manager(auth.uid())` |
| public.security_alert_settings | Admins can update security settings | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.security_alert_settings | Admins can view security settings | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.security_events | Admins and managers can read security_events | SELECT | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.semantic_index | semantic_index_select_own_or_admin | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (salesperson_id = get_current_salesperson_id()))` |  |
| public.send_time_profiles | owners and managers read send_time_profiles | SELECT | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (EXISTS ( SELECT 1    FROM (sales s      JOIN salespeople sp ON ((sp.id = s.salesperson_id)))   WHERE ((s.id = send_time_profiles.sale_id) AND (sp.auth_user_id = auth.uid())))))` |  |
| public.sequence_enrollments | Delete enrollments of own sequences | DELETE | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM sequences s   WHERE ((s.id = sequence_enrollments.sequence_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` |  |
| public.sequence_enrollments | Insert enrollments to own sequences | INSERT | PERMISSIVE | public |  | `(EXISTS ( SELECT 1    FROM sequences s   WHERE ((s.id = sequence_enrollments.sequence_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |
| public.sequence_enrollments | Update enrollments of own sequences | UPDATE | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM sequences s   WHERE ((s.id = sequence_enrollments.sequence_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |  |
| public.sequence_enrollments | View enrollments of accessible sequences | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM sequences s   WHERE ((s.id = sequence_enrollments.sequence_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |  |
| public.sequence_step_assignments | insert assignments via sequence owner | INSERT | PERMISSIVE | authenticated |  | `(EXISTS ( SELECT 1    FROM (sequence_enrollments e      JOIN sequences s ON ((s.id = e.sequence_id)))   WHERE ((e.id = sequence_step_assignments.enrollment_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |
| public.sequence_step_assignments | view assignments via sequence owner | SELECT | PERMISSIVE | authenticated | `(EXISTS ( SELECT 1    FROM (sequence_enrollments e      JOIN sequences s ON ((s.id = e.sequence_id)))   WHERE ((e.id = sequence_step_assignments.enrollment_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |  |
| public.sequence_step_executions | View executions of accessible sequences | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM (sequence_enrollments e      JOIN sequences s ON ((s.id = e.sequence_id)))   WHERE ((e.id = sequence_step_executions.enrollment_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |  |
| public.sequence_step_variants | delete variants | DELETE | PERMISSIVE | public | `user_owns_sequence_step(step_id)` |  |
| public.sequence_step_variants | insert variants | INSERT | PERMISSIVE | public |  | `user_owns_sequence_step(step_id)` |
| public.sequence_step_variants | update variants | UPDATE | PERMISSIVE | public | `user_owns_sequence_step(step_id)` |  |
| public.sequence_step_variants | view variants | SELECT | PERMISSIVE | public | `user_owns_sequence_step(step_id)` |  |
| public.sequence_steps | Manage steps of own sequences | ALL | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM sequences s   WHERE ((s.id = sequence_steps.sequence_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` | `(EXISTS ( SELECT 1    FROM sequences s   WHERE ((s.id = sequence_steps.sequence_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |
| public.sequence_steps | View steps of accessible sequences | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM sequences s   WHERE ((s.id = sequence_steps.sequence_id) AND ((s.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |  |
| public.sequences | Authenticated users create sequences | INSERT | PERMISSIVE | public |  | `(auth.uid() = owner_id)` |
| public.sequences | Owners delete their sequences | DELETE | PERMISSIVE | public | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role))` |  |
| public.sequences | Owners update their sequences | UPDATE | PERMISSIVE | public | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.sequences | Owners view their sequences | SELECT | PERMISSIVE | public | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.session_activity | Users can view own session activity | SELECT | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.skill_assessments | Admin/manager delete skill_assessments | DELETE | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.skill_assessments | Admin/manager insert skill_assessments | INSERT | PERMISSIVE | authenticated |  | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.skill_assessments | Admin/manager update skill_assessments | UPDATE | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.skill_assessments | Authenticated read skill_assessments | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.skill_development_tracks | Admin/manager delete skill_tracks | DELETE | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.skill_development_tracks | Admin/manager insert skill_tracks | INSERT | PERMISSIVE | authenticated |  | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.skill_development_tracks | Admin/manager update skill_tracks | UPDATE | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.skill_development_tracks | Authenticated read skill_tracks | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.sla_policies | Admin/manager can manage SLA policies | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.sla_policies | Authenticated can view SLA policies | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.sla_violations | Admin/manager manage violations | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.sla_violations | Salespeople view own violations | SELECT | PERMISSIVE | authenticated | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = sla_violations.sale_id) AND (s.salesperson_id = get_current_salesperson_id())))))` |  |
| public.slow_query_alerts | Admins ack slow query alerts | UPDATE | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.slow_query_alerts | Admins view slow query alerts | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.sms_verification_codes | Deny anon delete on sms_verification_codes | DELETE | PERMISSIVE | anon | `false` |  |
| public.sms_verification_codes | Deny anon insert on sms_verification_codes | INSERT | PERMISSIVE | anon |  | `false` |
| public.sms_verification_codes | Deny anon select on sms_verification_codes | SELECT | PERMISSIVE | anon | `false` |  |
| public.sms_verification_codes | Deny anon update on sms_verification_codes | UPDATE | PERMISSIVE | anon | `false` |  |
| public.sms_verification_codes | Deny authenticated update on sms_verification_codes | UPDATE | PERMISSIVE | authenticated | `false` |  |
| public.sms_verification_codes | Deny delete on sms_verification_codes | DELETE | PERMISSIVE | authenticated | `false` |  |
| public.sms_verification_codes | Deny direct INSERT - use RPCs | INSERT | PERMISSIVE | authenticated |  | `false` |
| public.sms_verification_codes | Deny direct SELECT - use RPCs | SELECT | PERMISSIVE | authenticated | `false` |  |
| public.sms_verification_codes | Deny insert on sms_verification_codes | INSERT | PERMISSIVE | authenticated |  | `false` |
| public.sms_verification_codes | Deny select on sms_verification_codes | SELECT | PERMISSIVE | authenticated | `false` |  |
| public.sms_verification_codes | Deny update on sms_verification_codes | UPDATE | PERMISSIVE | authenticated | `false` |  |
| public.squad_members | Squad members admin manage | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.squad_members | Squad members viewable by authenticated | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.squads | Squads admin manage | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.squads | Squads viewable by authenticated | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.stage_bottleneck_insights | Admins manage bottleneck insights insert | INSERT | PERMISSIVE | public |  | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.stage_bottleneck_insights | Admins manage bottleneck insights update | UPDATE | PERMISSIVE | public | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.stage_bottleneck_insights | Users view own and global bottleneck insights | SELECT | PERMISSIVE | public | `((owner_id IS NULL) OR (owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.stage_conversion_metrics | Service role manages conversion metrics insert | INSERT | PERMISSIVE | public |  | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.stage_conversion_metrics | Service role manages conversion metrics update | UPDATE | PERMISSIVE | public | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.stage_conversion_metrics | Users view own and global conversion metrics | SELECT | PERMISSIVE | public | `((owner_id IS NULL) OR (owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.stage_inactivity_rules | Authenticated can read stage inactivity rules | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.stage_inactivity_rules | Only admins can manage stage inactivity rules | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.stage_probabilities | stage_probabilities_select | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.stage_velocity_baselines | admin manager write baselines | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.stage_velocity_baselines | auth read baselines | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.stage_velocity_baselines | svb_admin_write | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.stage_velocity_baselines | svb_select_authenticated | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.status_transitions | admin manager write status transitions | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.status_transitions | authenticated read status transitions | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.stock_movements | Admin/manager can view stock movements | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.stock_movements | Admins and managers can insert stock movements | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.supplier_order_items | Admin/manager can view supplier_order_items | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.supplier_order_items | Admins and managers can insert supplier_order_items | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.supplier_orders | Admin/manager can view supplier_orders | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.supplier_orders | Admins and managers can delete supplier_orders | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.supplier_orders | Admins and managers can insert supplier_orders | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.supplier_orders | Admins and managers can update supplier_orders | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.supplier_products | Admin/manager can view supplier_products | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.supplier_products | Admins and managers can delete supplier_products | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.supplier_products | Admins and managers can insert supplier_products | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.supplier_products | Admins and managers can update supplier_products | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.supplier_risk_assessments | Admin/manager can view supplier_risk_assessments | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.supplier_risk_assessments | Admins and managers can insert supplier_risk_assessments | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.supplier_risk_assessments | Admins and managers can update supplier_risk_assessments | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.suppliers | Admin and managers can read suppliers | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.suppliers | Admins and managers can insert suppliers | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.suppliers | Admins and managers can update suppliers | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.suppliers | admin_delete_suppliers | DELETE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.support_tickets | cs_st_delete | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.support_tickets | cs_st_insert | INSERT | PERMISSIVE | public |  | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = support_tickets.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |
| public.support_tickets | cs_st_select | SELECT | PERMISSIVE | public | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = support_tickets.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |  |
| public.support_tickets | cs_st_update | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.task_assignments | Admin can delete assignments | DELETE | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.task_assignments | Admin can insert assignments | INSERT | PERMISSIVE | authenticated |  | `has_role(auth.uid(), 'admin'::app_role)` |
| public.task_assignments | Admin updates any, user updates own progress | UPDATE | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR ((assigned_to = auth.uid()) AND (status = ANY (ARRAY['pending'::task_assignment_status, 'in_progress'::task_assignment_status, 'submitted'::task_assignment_status]))))` |  |
| public.task_assignments | Users view own or admin views all assignments | SELECT | PERMISSIVE | authenticated | `((assigned_to = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |  |
| public.task_catalog | Admin can delete catalog | DELETE | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.task_catalog | Admin can insert catalog | INSERT | PERMISSIVE | authenticated |  | `has_role(auth.uid(), 'admin'::app_role)` |
| public.task_catalog | Admin can update catalog | UPDATE | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.task_catalog | Anyone authenticated can view catalog | SELECT | PERMISSIVE | public | `(auth.uid() IS NOT NULL)` |  |
| public.tasks | Users can insert own tasks | INSERT | PERMISSIVE | public |  | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| public.tasks | Users can read own tasks or admins all | SELECT | PERMISSIVE | public | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.tasks | Users can update own tasks | UPDATE | PERMISSIVE | public | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.tasks | admin_delete_tasks | DELETE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.team_closers | Admins and managers can delete team_closers | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.team_closers | Admins and managers can insert team_closers | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.team_closers | Authenticated can view team closers | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.team_custom_fields | Admins can manage custom fields | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.team_custom_fields | Authenticated can view custom fields | SELECT | PERMISSIVE | authenticated | `is_authenticated()` |  |
| public.teams | Admins and managers can insert teams | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.teams | Admins and managers can update teams | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.teams | Authenticated users can read teams | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.teams | admin_delete_teams | DELETE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.territories | Anyone can view territories | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.territory_history | Admins can insert territory_history | INSERT | PERMISSIVE | authenticated |  | `is_admin_or_manager(auth.uid())` |
| public.territory_history | Auth users can read territory history | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.territory_history | Users can read own territory_history | SELECT | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.tournament_matches | Admins can insert matches | INSERT | PERMISSIVE | authenticated |  | `is_admin_or_manager(auth.uid())` |
| public.tournament_matches | Admins can update matches | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.tournament_matches | Auth users can read matches | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.tournament_participants | Auth users can read participants | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.tournament_participants | Users can insert own tournament_participants | INSERT | PERMISSIVE | authenticated |  | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| public.tournament_participants | Users can update own tournament_participants | UPDATE | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| public.tournaments | Admins can insert tournaments | INSERT | PERMISSIVE | authenticated |  | `is_admin_or_manager(auth.uid())` |
| public.tournaments | Admins can update tournaments | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.tournaments | Auth users can read tournaments | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.twilio_call_sessions | Owners can insert own twilio sessions | INSERT | PERMISSIVE | public |  | `(auth.uid() = owner_id)` |
| public.twilio_call_sessions | Owners can update own twilio sessions | UPDATE | PERMISSIVE | public | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.twilio_call_sessions | Owners can view own twilio sessions | SELECT | PERMISSIVE | public | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.user_2fa | Users can insert own 2FA settings | INSERT | PERMISSIVE | public |  | `(auth.uid() = user_id)` |
| public.user_2fa | Users can update own 2FA settings | ALL | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.user_2fa | Users can view own 2FA settings | SELECT | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.user_2fa_backup_codes | Users can update own backup codes | UPDATE | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.user_2fa_backup_codes | Users can view own backup codes | SELECT | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.user_2fa_log | Users can read their own 2FA log | SELECT | PERMISSIVE | public | `((auth.uid() = user_id) OR is_admin_or_manager(auth.uid()))` |  |
| public.user_app_settings | users delete own app settings | DELETE | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.user_app_settings | users insert own app settings | INSERT | PERMISSIVE | public |  | `(auth.uid() = user_id)` |
| public.user_app_settings | users select own app settings | SELECT | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.user_app_settings | users update own app settings | UPDATE | PERMISSIVE | public | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |
| public.user_mfa_settings | Authenticated users can insert their own MFA settings | INSERT | PERMISSIVE | authenticated |  | `(auth.uid() = user_id)` |
| public.user_mfa_settings | Deny direct SELECT - use RPCs | SELECT | PERMISSIVE | authenticated | `false` |  |
| public.user_mfa_settings | Users can update their own MFA settings | UPDATE | PERMISSIVE | authenticated | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |
| public.user_roles | Admins can manage all roles | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.user_roles | Only admins can delete roles | DELETE | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.user_roles | Only admins can insert roles | INSERT | PERMISSIVE | authenticated |  | `has_role(auth.uid(), 'admin'::app_role)` |
| public.user_roles | Only admins can update roles | UPDATE | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.user_roles | Users can view own role | SELECT | PERMISSIVE | authenticated | `((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR is_admin_or_manager(auth.uid()))` |  |
| public.user_winloss_preferences | own prefs delete | DELETE | PERMISSIVE | authenticated | `(user_id = auth.uid())` |  |
| public.user_winloss_preferences | own prefs insert | INSERT | PERMISSIVE | authenticated |  | `(user_id = auth.uid())` |
| public.user_winloss_preferences | own prefs select | SELECT | PERMISSIVE | authenticated | `(user_id = auth.uid())` |  |
| public.user_winloss_preferences | own prefs update | UPDATE | PERMISSIVE | authenticated | `(user_id = auth.uid())` |  |
| public.v4_callback_alert_settings | Admins manage v4 callback alert settings | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.v4_callback_alerts | Admins ack v4 callback alerts | UPDATE | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.v4_callback_alerts | Admins read v4 callback alerts | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.v4_callback_alerts | Service role writes v4 callback alerts | INSERT | PERMISSIVE | service_role |  | `true` |
| public.v4_callback_dead_letters | Admins manage v4 dlq | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.v4_callback_metrics | Admins can read v4 callback metrics | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.victory_feed | Authenticated can read victory_feed | SELECT | PERMISSIVE | public | `(auth.uid() IS NOT NULL)` |  |
| public.victory_feed | Users can insert own victory_feed | INSERT | PERMISSIVE | authenticated |  | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| public.web_vitals_samples | Admins can read web vitals | SELECT | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.webauthn_challenges | Users can delete own webauthn challenges | DELETE | PERMISSIVE | authenticated | `(user_id = auth.uid())` |  |
| public.webauthn_challenges | Users can insert own webauthn challenges | INSERT | PERMISSIVE | authenticated |  | `(user_id = auth.uid())` |
| public.webauthn_challenges | Users can read own webauthn challenges | SELECT | PERMISSIVE | authenticated | `(user_id = auth.uid())` |  |
| public.webauthn_credentials | Users can delete own webauthn credentials | DELETE | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.webauthn_credentials | Users can insert own webauthn credentials | INSERT | PERMISSIVE | public |  | `(auth.uid() = user_id)` |
| public.webauthn_credentials | Users can update own webauthn credentials | UPDATE | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.webauthn_credentials | Users can view own webauthn credentials | SELECT | PERMISSIVE | public | `(auth.uid() = user_id)` |  |
| public.webhook_deliveries | Admins and managers can view deliveries | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.webhook_events | Admins and managers can manage webhook_events | ALL | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.webhook_inbound_dedupe | Admins can read inbound dedupe | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.webhook_inbound_dedupe | Deny writes to non-service | ALL | RESTRICTIVE | anon, authenticated | `false` | `false` |
| public.webhook_inbound_log | webhook_inbound_log_authenticated_read | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.webhook_inbound_log | webhook_inbound_log_service_all | ALL | PERMISSIVE | service_role | `true` | `true` |
| public.webhook_logs | Admins can view webhook logs | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM auth.users   WHERE ((users.id = auth.uid()) AND ((users.raw_user_meta_data ->> 'role'::text) = 'admin'::text))))` |  |
| public.webhooks | Admins and managers can manage webhooks | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` | `is_admin_or_manager(auth.uid())` |
| public.webhooks | Admins and managers can view webhooks | SELECT | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.webhooks | Admins can manage webhooks | ALL | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM auth.users   WHERE ((users.id = auth.uid()) AND ((users.raw_user_meta_data ->> 'role'::text) = 'admin'::text))))` |  |
| public.website_visitor_logs | Admins e Managers podem ver logs de visitantes | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role])))))` |  |
| public.weekly_challenges | Admins and managers can delete weekly_challenges | DELETE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.weekly_challenges | Admins and managers can insert weekly_challenges | INSERT | PERMISSIVE | public |  | `is_admin_or_manager(auth.uid())` |
| public.weekly_challenges | Admins and managers can update weekly_challenges | UPDATE | PERMISSIVE | public | `is_admin_or_manager(auth.uid())` |  |
| public.weekly_challenges | Authenticated can view weekly challenges | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.weekly_matchups | Admins manage matchups | ALL | PERMISSIVE | authenticated | `is_admin_or_manager(auth.uid())` |  |
| public.weekly_matchups | Anyone can read matchups | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.whatsapp_conversations | Users can log WhatsApp messages | INSERT | PERMISSIVE | public |  | `(EXISTS ( SELECT 1    FROM sales   WHERE ((sales.id = whatsapp_conversations.sale_id) AND (sales.salesperson_id = auth.uid()))))` |
| public.whatsapp_conversations | Users can view WhatsApp conversations for their sales | SELECT | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM sales   WHERE ((sales.id = whatsapp_conversations.sale_id) AND (sales.salesperson_id = auth.uid()))))` |  |
| public.whatsapp_template_versions | Admins can manage template versions | ALL | PERMISSIVE | public | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::app_role))))` |  |
| public.whatsapp_template_versions | Only admins can create versions | INSERT | PERMISSIVE | public |  | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::app_role))))` |
| public.whatsapp_template_versions | Versions are viewable by authenticated users | SELECT | PERMISSIVE | public | `(auth.role() = 'authenticated'::text)` |  |
| public.win_calibration_buckets | Admin/manager manage win_calibration_buckets | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.win_calibration_buckets | Authenticated read win_calibration_buckets | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.win_loss_analyses | wla read auth | SELECT | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = win_loss_analyses.sale_id) AND (s.salesperson_id = get_current_salesperson_id())))))` |  |
| public.win_loss_analyses | wla write admin/manager | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.win_loss_insight_comments | auth insert own comment | INSERT | PERMISSIVE | authenticated |  | `(author_id = auth.uid())` |
| public.win_loss_insight_comments | auth read comments | SELECT | PERMISSIVE | public | `(auth.uid() IS NOT NULL)` |  |
| public.win_loss_insight_comments | owner delete comment | DELETE | PERMISSIVE | authenticated | `(author_id = auth.uid())` |  |
| public.win_loss_insights | wli read auth | SELECT | PERMISSIVE | public | `(auth.uid() IS NOT NULL)` |  |
| public.win_loss_insights | wli write admin/manager | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.win_loss_patterns | wlp read auth | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.win_loss_patterns | wlp write admin/manager | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.win_probability_calibrations | Admin/manager write calibrations | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.win_probability_calibrations | Authenticated read calibrations | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.win_probability_deal_calibrations | Admin/manager manage wpdc | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.win_probability_deal_calibrations | Authenticated read wpdc | SELECT | PERMISSIVE | authenticated | `true` |  |
| public.winloss_alert_settings | Admins insert winloss_alert_settings | INSERT | PERMISSIVE | authenticated |  | `has_role(auth.uid(), 'admin'::app_role)` |
| public.winloss_alert_settings | Admins read winloss_alert_settings | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.winloss_alert_settings | Admins update winloss_alert_settings | UPDATE | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.winloss_webhook_alerts | admin read webhook alerts | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.winloss_webhook_dead_letters | Admins can update dead letters | UPDATE | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.winloss_webhook_dead_letters | Admins can view dead letters | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.winloss_webhook_deliveries | Admins read webhook deliveries | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.winloss_webhook_dispatch_metrics | Admins can view dispatch metrics | SELECT | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` |  |
| public.winloss_webhook_replay_audit | Admins/Managers can view replay audit | SELECT | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.winloss_webhook_replay_invocations | Admins/Managers can view replay invocations | SELECT | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.winloss_webhook_subscriptions | admin manage webhooks | ALL | PERMISSIVE | authenticated | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| public.workflow_executions | Admins update executions | UPDATE | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.workflow_executions | Admins view all executions | SELECT | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (triggered_by = auth.uid()))` |  |
| public.workflow_executions | Users insert own executions | INSERT | PERMISSIVE | authenticated |  | `((triggered_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.workflow_rules | Users can manage own workflow rules | ALL | PERMISSIVE | authenticated | `(salesperson_id = get_current_salesperson_id())` | `(salesperson_id = get_current_salesperson_id())` |
| public.workflows | Admins/managers can manage workflows | ALL | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| public.workflows | Authenticated can view active workflows | SELECT | PERMISSIVE | authenticated | `((is_active = true) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |  |
| public.xp_adjustments | Admin can insert xp adjustments | INSERT | PERMISSIVE | authenticated |  | `has_role(auth.uid(), 'admin'::app_role)` |
| public.xp_adjustments | Admin can view xp adjustments | SELECT | PERMISSIVE | authenticated | `(has_role(auth.uid(), 'admin'::app_role) OR (user_id = auth.uid()))` |  |
| public.xp_history | Users can read own xp_history | SELECT | PERMISSIVE | authenticated | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |  |
| realtime.messages | Authenticated users can use realtime | ALL | PERMISSIVE | authenticated | `true` | `true` |
| realtime.messages | Scoped realtime subscriptions | ALL | PERMISSIVE | authenticated | `((topic ~~ 'realtime:public:%'::text) OR (topic = ('user:'::text \|\| (auth.uid())::text)) OR (topic = ('presence:'::text \|\| (auth.uid())::text)))` | `((topic ~~ 'realtime:public:%'::text) OR (topic = ('user:'::text \|\| (auth.uid())::text)) OR (topic = ('presence:'::text \|\| (auth.uid())::text)))` |
| storage.objects | Authenticated users can upload their own avatar | INSERT | PERMISSIVE | authenticated |  | `((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]))` |
| storage.objects | Salespeople delete own call audio | DELETE | PERMISSIVE | authenticated | `((bucket_id = 'call-recordings'::text) AND (((auth.uid())::text = (storage.foldername(name))[1]) OR is_admin_or_manager(auth.uid())))` |  |
| storage.objects | Salespeople read own call audio | SELECT | PERMISSIVE | authenticated | `((bucket_id = 'call-recordings'::text) AND (((auth.uid())::text = (storage.foldername(name))[1]) OR is_admin_or_manager(auth.uid())))` |  |
| storage.objects | Salespeople upload own call audio | INSERT | PERMISSIVE | authenticated |  | `((bucket_id = 'call-recordings'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]))` |
| storage.objects | Service role can update quote PDFs | UPDATE | PERMISSIVE | service_role | `(bucket_id = 'quote-pdfs'::text)` |  |
| storage.objects | Service role can upload quote PDFs | INSERT | PERMISSIVE | service_role |  | `(bucket_id = 'quote-pdfs'::text)` |
| storage.objects | Users can delete own quote PDFs | DELETE | PERMISSIVE | authenticated | `((bucket_id = 'quote-pdfs'::text) AND (((auth.uid())::text = (storage.foldername(name))[1]) OR is_admin_or_manager(auth.uid())))` |  |
| storage.objects | Users can delete their own avatar | DELETE | PERMISSIVE | authenticated | `((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]))` |  |
| storage.objects | Users can list their own avatars | SELECT | PERMISSIVE | authenticated | `((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]))` |  |
| storage.objects | Users can read own quote PDFs | SELECT | PERMISSIVE | authenticated | `((bucket_id = 'quote-pdfs'::text) AND (((auth.uid())::text = (storage.foldername(name))[1]) OR is_admin_or_manager(auth.uid())))` |  |
| storage.objects | Users can update their own avatar | UPDATE | PERMISSIVE | authenticated | `((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]))` |  |
| storage.objects | owner can read own report snapshots | SELECT | PERMISSIVE | authenticated | `((bucket_id = 'report-snapshots'::text) AND (is_admin_or_manager(auth.uid()) OR ((storage.foldername(name))[1] = (auth.uid())::text)))` |  |
| storage.objects | report_owners_can_read_exports | SELECT | PERMISSIVE | authenticated | `((bucket_id = 'report-exports'::text) AND (((auth.uid())::text = (storage.foldername(name))[1]) OR is_admin_or_manager(auth.uid())))` |  |
| storage.objects | report_owners_can_write_exports | INSERT | PERMISSIVE | authenticated |  | `((bucket_id = 'report-exports'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]))` |
