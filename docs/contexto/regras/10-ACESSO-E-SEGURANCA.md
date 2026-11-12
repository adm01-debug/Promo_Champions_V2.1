# 10 · ACESSO E SEGURANÇA — quem pode o quê

> Gerado automaticamente por AI Context Sync v1.3.2 · commit `7884531319` · branch `main` · 2026-11-12 19:08 UTC
> Não edite à mão — regras humanas vão em `manual/`.

## Perfis / roles identificados

`admin`, `assistant`, `authenticated`, `blocker`, `champion`, `closer`, `create`, `decision_maker`, `default`, `denied`, `dev`, `economic`, `granted`, `hybrid`, `manager`, `permission`, `role`, `salesperson`, `sdr`, `string`, `technical`, `user`

- Tabelas de perfil/permissão: `user_roles`, `permissions`, `role_permissions`, `league_members`, `buying_committee_members`, `squad_members`, `race_team_members`
- Colunas de perfil: `salespeople.role` (salesperson_role NOT NULL DEFAULT 'hybrid'), `user_roles.role` (TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'sales', 'viewer'))), `chat_messages.role` (TEXT NOT NULL CHECK (role IN ('user', 'assistant'))), `role_permissions.role` (app_role NOT NULL), `buying_committee.role` (TEXT NOT NULL)
- Claims do JWT usados em políticas/funções: `email`, `iat`, `role`
- Funções usadas dentro de políticas RLS (a regra real está no corpo delas — veja `06`): `get_current_salesperson_id`, `get_current_user_email`, `has_role`, `is_admin_or_manager`, `is_authenticated`, `user_owns_engagement_contact`, `user_owns_sequence_step`

## Matriz tabela × operação → quem pode (derivada das políticas RLS)

| Tabela | RLS | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|---|
| `_internal_secrets` | não encontrado | anon, authenticated: false | anon, authenticated: false | anon, authenticated: false | anon, authenticated: false |
| `ab_tests` | não encontrado | sem RLS | sem RLS | sem RLS | sem RLS |
| `access_denied_logs` | enabled | authenticated: has_role(auth.uid(), 'admin') | authenticated: user_id = auth.uid()<br>authenticated: auth.uid() = user_id | — | — |
| `account_activities` | enabled | authenticated: is_admin_or_manager(auth.uid()) OR EXISTS ( SELECT 1 FROM public.accounts a WHERE a.id = account_activities.account_id AND a. | authenticated: is_admin_or_manager(auth.uid()) OR EXISTS ( SELECT 1 FROM public.accounts a WHERE a.id = account_activities.account_id AND a. | — | — |
| `account_contacts` | enabled | authenticated: is_admin_or_manager(auth.uid()) OR EXISTS ( SELECT 1 FROM public.accounts a WHERE a.id = account_contacts.account_id AND a.ow<br>authenticated: is_admin_or_manager(auth.uid()) OR EXISTS ( SELECT 1 FROM public.accounts a WHERE a.id = account_contacts.account_id AND a.ow | authenticated: is_admin_or_manager(auth.uid()) OR EXISTS ( SELECT 1 FROM public.accounts a WHERE a.id = account_contacts.account_id AND a.ow | authenticated: is_admin_or_manager(auth.uid()) OR EXISTS ( SELECT 1 FROM public.accounts a WHERE a.id = account_contacts.account_id AND a.ow | authenticated: is_admin_or_manager(auth.uid()) OR EXISTS ( SELECT 1 FROM public.accounts a WHERE a.id = account_contacts.account_id AND a.ow |
| `account_plans` | enabled | public: public.is_admin_or_manager(auth.uid()) OR created_by = auth.uid() | authenticated: created_by = auth.uid() AND (is_admin_or_manager(auth.uid()) OR created_by = auth.uid()) | public: public.is_admin_or_manager(auth.uid()) OR created_by = auth.uid() | — |
| `accounts` | enabled | authenticated: is_admin_or_manager(auth.uid()) OR owner_id = get_current_salesperson_id()<br>authenticated: is_admin_or_manager(auth.uid()) OR owner_id = get_current_salesperson_id() | authenticated: is_admin_or_manager(auth.uid()) OR owner_id = get_current_salesperson_id() | authenticated: is_admin_or_manager(auth.uid()) OR owner_id = get_current_salesperson_id() | authenticated: is_admin_or_manager(auth.uid()) OR owner_id = get_current_salesperson_id() |
| `achievements` | enabled | authenticated: true | authenticated: salesperson_id = public.get_current_salesperson_id() | — | — |
| `active_power_ups` | enabled | authenticated: salesperson_id IN ( SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid() ) OR public.has_role(auth.uid(), 'admin | authenticated: salesperson_id = public.get_current_salesperson_id() | — | — |
| `active_sessions` | enabled | public: auth.uid() = user_id<br>public: public.has_role(auth.uid(), 'admin')<br>authenticated: user_id = auth.uid() | authenticated: user_id = auth.uid() | authenticated: user_id = auth.uid() | authenticated: user_id = auth.uid() |
| `activities` | enabled | public: deleted_at IS NOT NULL AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true)<br>public: salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())<br>public: auth.uid() = user_id<br>public: EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin' )<br>public: user_id = auth.uid() OR EXISTS ( SELECT 1 FROM deals WHERE deals.id = activities.deal_id AND (deals.assigned_to = auth.uid() OR deal | public: auth.uid() = user_id<br>public: EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin' )<br>public: user_id = auth.uid() | public: auth.uid() = user_id<br>public: EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin' )<br>public: user_id = auth.uid() | public: auth.uid() = user_id<br>public: EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin' ) |
| `activity_audit_logs` | enabled | public: auth.uid() IN ( SELECT salesperson_id FROM public.activities WHERE id = activity_id ) OR EXISTS ( SELECT 1 FROM public.user_roles WH | — | — | — |
| `activity_goals` | enabled | authenticated: salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()) | authenticated: salesperson_id = public.get_current_salesperson_id() | authenticated: salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) |
| `agenda_events` | enabled | public: salesperson_id = public.get_current_salesperson_id()<br>public: public.is_admin_or_manager(auth.uid()) | public: salesperson_id = public.get_current_salesperson_id() | public: salesperson_id = public.get_current_salesperson_id() | public: salesperson_id = public.get_current_salesperson_id() |
| `ai_agent_actions` | enabled | authenticated: EXISTS ( SELECT 1 FROM public.ai_agent_runs r WHERE r.id = ai_agent_actions.run_id AND ( r.salesperson_id = public.get_curren | — | — | — |
| `ai_agent_runs` | enabled | authenticated: salesperson_id = public.get_current_salesperson_id() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), ' | authenticated: ( salesperson_id = public.get_current_salesperson_id() OR public.has_role(auth.uid(), 'admin') ) AND status = 'pending' AND a | authenticated: salesperson_id = public.get_current_salesperson_id() OR public.has_role(auth.uid(), 'admin') | — |
| `ai_narrative_cache` | enabled | authenticated: true<br>service_role: true | service_role: true | service_role: true | service_role: true |
| `ai_sales_insights` | enabled | public: EXISTS ( SELECT 1 FROM public.sales WHERE sales.id = ai_sales_insights.sale_id AND (sales.salesperson_id = auth.uid()) ) | — | — | — |
| `api_tokens` | enabled | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `app_config` | enabled | — | — | — | — |
| `approval_decisions` | enabled | authenticated: EXISTS ( SELECT 1 FROM public.approval_requests ar WHERE ar.id = request_id AND (ar.requester_id = auth.uid() OR public.is_ad | authenticated: public.is_admin_or_manager(auth.uid()) AND approver_id = auth.uid() | — | — |
| `approval_requests` | enabled | authenticated: requester_id = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: requester_id = auth.uid() | authenticated: public.is_admin_or_manager(auth.uid()) | — |
| `approval_workflows` | enabled | authenticated: is_active = true<br>authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) |
| `asset_usage_logs` | enabled | authenticated: user_id = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: user_id = auth.uid() | — | — |
| `audit_log` | enabled | public: auth.uid() = user_id<br>public: EXISTS ( SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin' ) | — | — | — |
| `audit_logs` | enabled | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: auth.uid() = actor_id | — | — |
| `auto_task_queue_settings` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `automation_runs` | enabled | authenticated: true<br>authenticated: public.is_admin_or_manager(auth.uid()) | — | — | — |
| `automation_workflows` | enabled | authenticated: is_admin_or_manager(auth.uid())<br>public: auth.uid() IS NOT NULL | authenticated: is_admin_or_manager(auth.uid()) | authenticated: is_admin_or_manager(auth.uid()) | authenticated: is_admin_or_manager(auth.uid()) |
| `available_spins` | enabled | authenticated: salesperson_id IN ( SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid() ) OR public.has_role(auth.uid(), 'admin | — | — | — |
| `battle_participants` | enabled | public: auth.uid() IS NOT NULL | authenticated: salesperson_id = public.get_current_salesperson_id() | authenticated: public.is_admin_or_manager(auth.uid()) | — |
| `bitrix24_sync_logs` | enabled | public: is_admin_or_manager(auth.uid()) | — | — | — |
| `blocked_ips` | enabled | public: public.has_role(auth.uid(), 'admin') | public: public.has_role(auth.uid(), 'admin') | public: public.has_role(auth.uid(), 'admin') | public: public.has_role(auth.uid(), 'admin') |
| `buying_committee` | enabled | — | — | — | — |
| `buying_committee_members` | enabled | public: is_admin_or_manager(auth.uid()) OR EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.salesperson_id = get_current_sale | public: is_admin_or_manager(auth.uid()) OR EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.salesperson_id = get_current_sale | public: is_admin_or_manager(auth.uid()) OR EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.salesperson_id = get_current_sale | public: is_admin_or_manager(auth.uid()) OR EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.salesperson_id = get_current_sale |
| `buying_signals` | enabled | public: EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager')) | — | — | — |
| `cadence_ab_assignments` | enabled | authenticated: true<br>authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) |
| `cadence_ab_tests` | enabled | authenticated: true<br>authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) |
| `cadence_advanced_stats` | enabled | public: auth.role() = 'authenticated' | — | — | — |
| `cadence_alert_templates` | enabled | public: true<br>authenticated: true | public: true | public: true | public: true |
| `cadence_enrollment_rules` | enabled | authenticated: true<br>authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) |
| `cadence_funnel_rules` | enabled | authenticated: is_admin_or_manager(auth.uid())<br>authenticated: true | authenticated: is_admin_or_manager(auth.uid()) | authenticated: is_admin_or_manager(auth.uid()) | authenticated: is_admin_or_manager(auth.uid()) |
| `cadence_outcome_rules` | enabled | public: true<br>authenticated: true | public: true | public: true | public: true |
| `cadence_steps` | enabled | authenticated: true | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) |
| `cadence_tasks` | enabled | authenticated: prospect_cadence_id IN ( SELECT id FROM public.prospect_cadences WHERE salesperson_id = public.get_current_salesperson_id() ) | authenticated: prospect_cadence_id IN ( SELECT id FROM public.prospect_cadences WHERE salesperson_id = public.get_current_salesperson_id() ) | authenticated: prospect_cadence_id IN ( SELECT id FROM public.prospect_cadences WHERE salesperson_id = public.get_current_salesperson_id() ) | authenticated: prospect_cadence_id IN ( SELECT id FROM public.prospect_cadences WHERE salesperson_id = public.get_current_salesperson_id() ) |
| `cadences` | enabled | authenticated: true | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) |
| `call_coaching_scorecards` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `call_conversation_metrics` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') | authenticated: public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') | authenticated: public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') | authenticated: public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') |
| `call_critical_moments` | enabled | public: owner_id = auth.uid() OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role)<br>authenticated: get_current_salesperson_id() = salesperson_id OR is_admin_or_manager(auth.uid()) | public: auth.uid() = owner_id | public: owner_id = auth.uid() OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) | public: has_role(auth.uid(), 'admin'::app_role) OR owner_id = auth.uid() |
| `call_insights` | enabled | public: EXISTS ( SELECT 1 FROM public.call_recordings r WHERE r.id = recording_id AND (r.salesperson_id = public.get_current_salesperson_id( | public: EXISTS ( SELECT 1 FROM public.call_recordings r WHERE r.id = recording_id AND (r.salesperson_id = public.get_current_salesperson_id( | — | — |
| `call_intelligence_triggers` | enabled | public: auth.role() = 'authenticated' | — | — | — |
| `call_logs` | enabled | public: owner_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager') | public: owner_id = auth.uid() | public: owner_id = auth.uid() OR has_role(auth.uid(),'admin') | public: owner_id = auth.uid() OR has_role(auth.uid(),'admin') |
| `call_metric_benchmarks` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(),'admin') | authenticated: public.has_role(auth.uid(),'admin') | authenticated: public.has_role(auth.uid(),'admin') | authenticated: public.has_role(auth.uid(),'admin') |
| `call_objection_analysis` | enabled | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')<br>authenticated: (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)) | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `call_objections` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `call_question_analysis` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `call_questions` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `call_recording_ingest_jobs` | enabled | authenticated: salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid())<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()) | — | — |
| `call_recordings` | enabled | public: salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()) | public: salesperson_id = public.get_current_salesperson_id() | public: salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) |
| `call_sentiment_timeline` | enabled | public: EXISTS ( SELECT 1 FROM public.call_recordings cr WHERE cr.id = call_sentiment_timeline.recording_id AND ( cr.salesperson_id = public<br>public: auth.role() = 'service_role' | public: auth.role() = 'service_role' | public: auth.role() = 'service_role' | public: auth.role() = 'service_role' |
| `call_tracking` | enabled | public: auth.uid() = user_id | — | — | — |
| `call_transcripts` | enabled | public: EXISTS ( SELECT 1 FROM public.call_recordings r WHERE r.id = recording_id AND (r.salesperson_id = public.get_current_salesperson_id( | public: EXISTS ( SELECT 1 FROM public.call_recordings r WHERE r.id = recording_id AND (r.salesperson_id = public.get_current_salesperson_id( | — | — |
| `campaign_health_alerts` | enabled | authenticated: owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role) | — | — | authenticated: public.has_role(auth.uid(), 'admin'::app_role) |
| `category_metrics` | enabled | authenticated: true | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) |
| `challenge_progress` | enabled | authenticated: salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()) | — | — | — |
| `channel_credentials` | enabled | authenticated: owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: owner_id = auth.uid() | authenticated: owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()) |
| `channel_interactions` | enabled | public: salesperson_id = public.get_current_salesperson_id() | public: salesperson_id = public.get_current_salesperson_id() | public: salesperson_id = public.get_current_salesperson_id() | public: salesperson_id = public.get_current_salesperson_id() |
| `chat_conversations` | enabled | authenticated: salesperson_id = public.get_current_salesperson_id() | authenticated: salesperson_id = public.get_current_salesperson_id() | authenticated: salesperson_id = public.get_current_salesperson_id() | authenticated: salesperson_id = public.get_current_salesperson_id() |
| `chat_messages` | enabled | authenticated: conversation_id IN ( SELECT id FROM public.chat_conversations WHERE salesperson_id = public.get_current_salesperson_id() ) | authenticated: conversation_id IN ( SELECT id FROM public.chat_conversations WHERE salesperson_id = public.get_current_salesperson_id() ) | — | — |
| `churn_alert_settings` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `circuit_breaker_events` | enabled | public: is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | — | public: has_role(auth.uid(), 'admin'::app_role) |
| `client_churn_alerts_state` | enabled | authenticated: public.has_role(auth.uid(), 'admin')<br>authenticated: salesperson_id = auth.uid() | — | — | — |
| `client_interactions` | enabled | authenticated: auth.uid() = user_id OR is_admin_or_manager(auth.uid())<br>public: public.is_admin_or_manager(auth.uid()) OR auth.uid() = user_id OR client_id IN ( SELECT client_id FROM public.client_portfolio WHERE | public: auth.role() = 'authenticated'<br>authenticated: auth.uid() = user_id | — | — |
| `client_portfolio` | enabled | authenticated: salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()) | — | — | public: is_admin_or_manager(auth.uid()) |
| `client_renewals` | enabled | public: public.is_admin_or_manager(auth.uid()) OR client_id IN ( SELECT client_id FROM public.client_portfolio WHERE salesperson_id = public | — | — | — |
| `clients` | enabled | public: deleted_at IS NOT NULL AND EXISTS ( SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true )<br>public: auth.uid() = user_id<br>public: EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin' )<br>public: EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('manager', 'admin') )<br>public: assigned_to = auth.uid() OR created_by = auth.uid()<br>authenticated: id IN ( SELECT client_id FROM public.client_portfolio WHERE salesperson_id = public.get_current_salesperson_id() ) OR public. | public: is_admin_or_manager(auth.uid())<br>public: auth.uid() = user_id<br>public: EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin' )<br>public: created_by = auth.uid() | public: is_admin_or_manager(auth.uid())<br>public: auth.uid() = user_id<br>public: EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin' )<br>public: assigned_to = auth.uid() | public: is_admin_or_manager(auth.uid())<br>public: auth.uid() = user_id<br>public: EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin' ) |
| `coaching_actions` | enabled | public: salesperson_id = public.get_current_salesperson_id() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager | public: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | public: salesperson_id = public.get_current_salesperson_id() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager | public: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `coaching_opportunities` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `coaching_scorecard_config` | enabled | public: auth.role() = 'authenticated' | — | — | — |
| `coaching_sessions` | enabled | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')<br>authenticated: coach_id = auth.uid()<br>authenticated: salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()) | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')<br>authenticated: coach_id = auth.uid() | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')<br>authenticated: coach_id = auth.uid() | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')<br>authenticated: coach_id = auth.uid() |
| `coaching_skill_benchmarks` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `cohort_analyses` | enabled | authenticated: owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()) |
| `collectible_badges` | enabled | public: auth.uid() IS NOT NULL | — | — | — |
| `combo_tracking` | enabled | authenticated: true | authenticated: salesperson_id = (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid() LIMIT 1) | authenticated: is_admin_or_manager(auth.uid()) | — |
| `commercial_approval_requests` | enabled | authenticated: true<br>authenticated: auth.uid() = requester_id OR is_admin_or_manager(auth.uid()) | authenticated: auth.uid() = requester_id<br>authenticated: auth.uid() = requester_id | authenticated: is_admin_or_manager(auth.uid()) | — |
| `commission_bonus_awards` | enabled | authenticated: salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') |
| `commission_bonuses` | enabled | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')<br>authenticated: is_active = true AND ( salesperson_id IS NULL OR salesperson_id IN ( SELECT id FROM public.salespeople WHERE auth_user_id = a | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `commission_rules` | enabled | public: public.is_admin_or_manager(auth.uid())<br>public: is_active = true AND ( salesperson_id = public.get_current_salesperson_id() OR salesperson_id IS NULL ) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) |
| `commissions` | enabled | public: public.is_admin_or_manager(auth.uid())<br>public: salesperson_id = public.get_current_salesperson_id() | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) |
| `committee_coverage_history` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `committee_extraction_runs` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `competitive_chat_messages` | enabled | public: squad_id IS NULL OR squad_id IN ( SELECT squad_id FROM public.salespeople WHERE auth_user_id = auth.uid() ) | public: (squad_id IS NULL OR squad_id IN ( SELECT squad_id FROM public.salespeople WHERE auth_user_id = auth.uid() )) AND salesperson_id IN  | public: squad_id IS NULL OR squad_id IN ( SELECT squad_id FROM public.salespeople WHERE auth_user_id = auth.uid() ) | — |
| `competitive_seasons` | enabled | authenticated: public.is_admin_or_manager(auth.uid())<br>public: auth.uid() IS NOT NULL | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) |
| `competitor_mentions` | enabled | authenticated: EXISTS ( SELECT 1 FROM public.call_recordings cr JOIN public.salespeople sp ON sp.id = cr.salesperson_id WHERE cr.id = compet | authenticated: EXISTS ( SELECT 1 FROM public.call_recordings cr JOIN public.salespeople sp ON sp.id = cr.salesperson_id WHERE cr.id = compet | — | authenticated: EXISTS ( SELECT 1 FROM public.call_recordings cr JOIN public.salespeople sp ON sp.id = cr.salesperson_id WHERE cr.id = compet |
| `competitors_pricing` | enabled | public: auth.role() = 'authenticated' | — | — | — |
| `competitors_registry` | enabled | public: auth.uid() IS NOT NULL | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') |
| `consent_records` | enabled | authenticated: public.is_admin_or_manager(auth.uid())<br>authenticated: subject_id = auth.uid() OR lower(subject_email) = lower(auth.jwt() ->> 'email') | authenticated: public.is_admin_or_manager(auth.uid())<br>authenticated: subject_id = auth.uid() OR lower(subject_email) = lower(auth.jwt() ->> 'email') | authenticated: public.is_admin_or_manager(auth.uid())<br>authenticated: subject_id = auth.uid() OR lower(subject_email) = lower(auth.jwt() ->> 'email') | authenticated: public.is_admin_or_manager(auth.uid()) |
| `contact_engagement_score` | enabled | public: public.user_owns_engagement_contact(contact_id, contact_type)<br>public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) |
| `contact_send_time_profile` | enabled | authenticated: public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'manager'::app_role) OR public.has_role(auth.ui<br>authenticated: public.has_role(auth.uid(), 'admin'::app_role) | authenticated: public.has_role(auth.uid(), 'admin'::app_role) | authenticated: public.has_role(auth.uid(), 'admin'::app_role) | authenticated: public.has_role(auth.uid(), 'admin'::app_role) |
| `conversation_analyses` | enabled | public: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR analyzed_by = auth.uid() OR EXISTS ( SELECT 1 FROM | public: auth.uid() IS NOT NULL AND analyzed_by = auth.uid() | public: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR analyzed_by = auth.uid() | public: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR analyzed_by = auth.uid() |
| `critical_moment_notifications` | enabled | public: recipient_user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)<br>authenticated: auth.uid() = recipient_user_id | public: auth.uid() = recipient_user_id | public: recipient_user_id = auth.uid() | — |
| `cron_failure_alerts` | enabled | authenticated: public.has_role(auth.uid(), 'admin') | — | — | — |
| `cs_tickets` | enabled | public: public.is_admin_or_manager(auth.uid()) OR assigned_to = public.get_current_salesperson_id() OR client_id IN ( SELECT client_id FROM  | — | — | — |
| `csat_ces_surveys` | enabled | public: public.is_admin_or_manager(auth.uid()) OR EXISTS ( SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.owner_id = public.g<br>public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) |
| `custom_reports` | enabled | authenticated: owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid())<br>authenticated: is_shared = true | authenticated: owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()) |
| `daily_challenge_progress` | enabled | authenticated: salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()) | — | — | — |
| `daily_challenge_rotations` | enabled | — | — | — | — |
| `daily_challenges` | enabled | public: auth.uid() = user_id<br>authenticated: true | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) |
| `daily_metrics` | enabled | authenticated: public.is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) |
| `daily_streak_achievements` | enabled | authenticated: salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()) | — | — | — |
| `dashboard_layouts` | enabled | authenticated: salesperson_id = public.get_current_salesperson_id() | authenticated: salesperson_id = public.get_current_salesperson_id() | authenticated: salesperson_id = public.get_current_salesperson_id() | authenticated: salesperson_id = public.get_current_salesperson_id() |
| `data_access_log` | enabled | public: auth.uid() = user_id | — | — | — |
| `data_retention_policies` | enabled | authenticated: public.is_admin_or_manager(auth.uid()) | — | — | — |
| `data_subject_requests` | enabled | authenticated: public.is_admin_or_manager(auth.uid())<br>authenticated: subject_id = auth.uid() OR lower(subject_email) = lower(auth.jwt() ->> 'email') | authenticated: public.is_admin_or_manager(auth.uid())<br>authenticated: subject_id = auth.uid() AND lower(subject_email) = lower(auth.jwt() ->> 'email') | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) |
| `db_rollback_snapshots` | enabled | authenticated: public.has_role(auth.uid(), 'admin') | — | — | — |
| `dead_letter_replay_audit` | enabled | authenticated: public.has_role(auth.uid(), 'admin') | — | — | — |
| `deal_chat_history` | enabled | authenticated: salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()) | authenticated: salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()) | — | public: salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid()) |
| `deal_committee_coverage` | enabled | public: auth.uid() = owner_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')<br>public: auth.uid() = owner_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') | public: auth.uid() = owner_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') | public: auth.uid() = owner_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') | public: auth.uid() = owner_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') |
| `deal_health_history` | enabled | public: owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)<br>authenticated: true | public: auth.uid() = owner_id | — | — |
| `deal_health_scores` | enabled | public: EXISTS ( SELECT 1 FROM public.sales s WHERE s.id = sale_id AND (s.salesperson_id = public.get_current_salesperson_id() OR public.is_<br>public: owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)<br>public: has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) | public: auth.uid() IS NOT NULL<br>public: has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) | public: has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) | public: has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) |
| `deal_outcomes` | enabled | public: salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid()) | public: salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid()) | public: salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid()) | public: salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid()) |
| `deal_probability_scores` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `deal_risk_signals` | enabled | public: EXISTS ( SELECT 1 FROM public.sales s WHERE s.id = sale_id AND (s.salesperson_id = public.get_current_salesperson_id() OR public.is_ | public: auth.uid() IS NOT NULL | public: EXISTS ( SELECT 1 FROM public.sales s WHERE s.id = sale_id AND (s.salesperson_id = public.get_current_salesperson_id() OR public.is_ | — |
| `deal_stage_history` | enabled | authenticated: sale_id IN (SELECT id FROM public.sales WHERE salesperson_id = public.get_current_salesperson_id()) OR public.is_admin_or_man | authenticated: sale_id IN ( SELECT id FROM public.sales WHERE salesperson_id = public.get_current_salesperson_id() ) OR public.is_admin_or_m | authenticated: sale_id IN ( SELECT id FROM public.sales WHERE salesperson_id = public.get_current_salesperson_id() ) OR public.is_admin_or_m | — |
| `deal_stage_transitions` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `deal_stakeholders` | enabled | public: auth.uid() = owner_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') | public: auth.uid() = owner_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') | public: auth.uid() = owner_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') | public: auth.uid() = owner_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') |
| `deal_velocity_alerts` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `deal_velocity_predictions` | enabled | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR EXISTS ( SELECT 1 FROM public.sales s JOIN <br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `deals` | enabled | public: deleted_at IS NULL AND ( true )<br>public: deleted_at IS NOT NULL AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true)<br>public: has_permission(auth.uid(), 'deals', 'read') OR assigned_to = auth.uid()<br>public: auth.uid() = user_id<br>public: EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin' )<br>public: EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('manager', 'admin') )<br>public: assigned_to = auth.uid() OR created_by = auth.uid() | public: has_permission(auth.uid(), 'deals', 'create')<br>public: auth.uid() = user_id<br>public: EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin' )<br>public: created_by = auth.uid() | public: has_permission(auth.uid(), 'deals', 'update') OR assigned_to = auth.uid()<br>public: EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin' )<br>public: assigned_to = auth.uid() OR created_by = auth.uid() | public: auth.uid() = user_id<br>public: EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin' ) |
| `demand_forecasts` | enabled | public: public.is_authenticated() | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) |
| `dialer_queue_items` | enabled | public: EXISTS (SELECT 1 FROM public.dialer_queues q WHERE q.id = queue_id AND (q.owner_id = auth.uid() OR has_role(auth.uid(),'admin') OR h<br>public: EXISTS (SELECT 1 FROM public.dialer_queues q WHERE q.id = queue_id AND (q.owner_id = auth.uid() OR has_role(auth.uid(),'admin'))) | public: EXISTS (SELECT 1 FROM public.dialer_queues q WHERE q.id = queue_id AND (q.owner_id = auth.uid() OR has_role(auth.uid(),'admin'))) | public: EXISTS (SELECT 1 FROM public.dialer_queues q WHERE q.id = queue_id AND (q.owner_id = auth.uid() OR has_role(auth.uid(),'admin'))) | public: EXISTS (SELECT 1 FROM public.dialer_queues q WHERE q.id = queue_id AND (q.owner_id = auth.uid() OR has_role(auth.uid(),'admin'))) |
| `dialer_queues` | enabled | public: owner_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager')<br>public: owner_id = auth.uid() OR has_role(auth.uid(),'admin') | public: owner_id = auth.uid() OR has_role(auth.uid(),'admin') | public: owner_id = auth.uid() OR has_role(auth.uid(),'admin') | public: owner_id = auth.uid() OR has_role(auth.uid(),'admin') |
| `digital_signatures` | enabled | authenticated: created_by = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()) | authenticated: created_by = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()) | authenticated: created_by = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) |
| `document_signers` | enabled | authenticated: document_id IN ( SELECT id FROM public.digital_signatures WHERE created_by = public.get_current_salesperson_id() ) OR public. | authenticated: document_id IN ( SELECT id FROM public.digital_signatures WHERE created_by = public.get_current_salesperson_id() ) OR public. | authenticated: document_id IN ( SELECT id FROM public.digital_signatures WHERE created_by = public.get_current_salesperson_id() ) OR public. | public: is_admin_or_manager(auth.uid()) |
| `duplicate_block_logs` | enabled | authenticated: true | — | — | — |
| `edge_call_failures` | enabled | authenticated: public.has_role(auth.uid(), 'admin'::app_role) | — | — | — |
| `edge_job_locks` | enabled | service_role: true | service_role: true | service_role: true | service_role: true |
| `edge_retry_events` | enabled | authenticated: public.has_role(auth.uid(), 'admin') | service_role: true | — | — |
| `email_bulk_drafts` | enabled | public: EXISTS ( SELECT 1 FROM public.email_bulk_jobs j WHERE j.id = email_bulk_drafts.job_id AND (j.owner_id = auth.uid() OR public.has_rol | public: EXISTS ( SELECT 1 FROM public.email_bulk_jobs j WHERE j.id = email_bulk_drafts.job_id AND (j.owner_id = auth.uid() OR public.has_rol | public: EXISTS ( SELECT 1 FROM public.email_bulk_jobs j WHERE j.id = email_bulk_drafts.job_id AND (j.owner_id = auth.uid() OR public.has_rol | public: EXISTS ( SELECT 1 FROM public.email_bulk_jobs j WHERE j.id = email_bulk_drafts.job_id AND (j.owner_id = auth.uid() OR public.has_rol |
| `email_bulk_jobs` | enabled | public: owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin') | public: owner_id = auth.uid() | public: owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin') | public: owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin') |
| `email_engagement_score_history` | enabled | public: EXISTS ( SELECT 1 FROM public.sales s JOIN public.salespeople sp ON sp.id = s.salesperson_id WHERE s.id = email_engagement_score_his | — | — | — |
| `email_engagement_scores` | enabled | public: EXISTS ( SELECT 1 FROM public.sales s JOIN public.salespeople sp ON sp.id = s.salesperson_id WHERE s.id = email_engagement_scores.sa<br>public: public.has_role(auth.uid(), 'admin') | public: public.has_role(auth.uid(), 'admin') | public: public.has_role(auth.uid(), 'admin') | public: public.has_role(auth.uid(), 'admin') |
| `email_logs` | enabled | public: is_admin_or_manager(auth.uid()) | — | — | — |
| `email_opt_outs` | enabled | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | — | authenticated: public.has_role(auth.uid(), 'admin') |
| `email_tracking_events` | enabled | authenticated: salesperson_id = public.get_current_salesperson_id() | authenticated: salesperson_id = public.get_current_salesperson_id() | authenticated: salesperson_id = public.get_current_salesperson_id() | authenticated: salesperson_id = public.get_current_salesperson_id() |
| `embedded_report_tokens` | enabled | authenticated: created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()) |
| `engagement_score_history` | enabled | public: public.user_owns_engagement_contact(contact_id, contact_type)<br>public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) |
| `enriched_company_intelligence` | enabled | public: EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager')) | — | — | — |
| `entity_versions` | enabled | authenticated: true | public: auth.uid() = changed_by OR changed_by IS NULL | — | — |
| `error_logs` | enabled | authenticated: public.has_role(auth.uid(), 'admin')<br>authenticated: is_admin_or_manager(auth.uid()) | authenticated: auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()) | — | — |
| `executive_briefings` | enabled | authenticated: true | authenticated: public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'manager'::app_role) | authenticated: public.has_role(auth.uid(), 'admin'::app_role) | authenticated: public.has_role(auth.uid(), 'admin'::app_role) |
| `expansion_opportunities` | enabled | public: public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id() OR EXISTS ( SELECT 1 FROM publi<br>public: public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id() | public: public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id() | public: public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id() | public: public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id() |
| `expansion_playbooks` | enabled | public: public.is_admin_or_manager(auth.uid())<br>authenticated: true | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) |
| `experiment_assignments` | não encontrado | sem RLS | sem RLS | sem RLS | sem RLS |
| `experiment_variants` | não encontrado | sem RLS | sem RLS | sem RLS | sem RLS |
| `experiments` | não encontrado | sem RLS | sem RLS | sem RLS | sem RLS |
| `external_seller_map` | enabled | authenticated: is_admin_or_manager(auth.uid())<br>authenticated: true | authenticated: is_admin_or_manager(auth.uid()) | authenticated: is_admin_or_manager(auth.uid()) | authenticated: is_admin_or_manager(auth.uid()) |
| `feature_flags` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `feed_comments` | enabled | public: auth.uid() IS NOT NULL | authenticated: salesperson_id = public.get_current_salesperson_id() | — | — |
| `feed_reactions` | enabled | public: auth.uid() IS NOT NULL | authenticated: salesperson_id = public.get_current_salesperson_id() | — | authenticated: salesperson_id = public.get_current_salesperson_id() |
| `follow_up_audit_logs` | enabled | public: auth.uid() IS NOT NULL | public: auth.uid() IS NOT NULL | — | — |
| `follow_up_notifications` | enabled | public: user_id = auth.uid() | public: user_id = auth.uid() | public: user_id = auth.uid() | public: user_id = auth.uid() |
| `follow_up_settings` | enabled | authenticated: true | — | public: EXISTS ( SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager') ) | — |
| `follow_up_templates` | enabled | public: EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')<br>authenticated: is_active = true | public: EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') | public: EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') | public: EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') |
| `follow_up_territory_rules` | enabled | public: EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')<br>public: salesperson_id = auth.uid() OR salesperson_id IS NULL | public: EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') | public: EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') | public: EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') |
| `forecast_accuracy` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')<br>public: auth.role() = 'authenticated' | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `forecast_confidence_scores` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `forecast_deal_contributions` | enabled | public: EXISTS ( SELECT 1 FROM public.revenue_forecasts rf WHERE rf.id = forecast_id AND ( public.has_role(auth.uid(), 'admin') OR public.ha<br>public: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | public: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | public: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | public: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `forecast_narrative_dead_letters` | enabled | authenticated: public.has_role(auth.uid(), 'admin') | — | — | — |
| `forecast_snapshots` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')<br>public: auth.role() = 'authenticated' | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `geo_access_logs` | não encontrado | sem RLS | sem RLS | sem RLS | sem RLS |
| `geo_blocked_regions` | não encontrado | authenticated: public.is_admin_or_manager(auth.uid()) | sem RLS | sem RLS | sem RLS |
| `geocode_cache` | enabled | — | — | — | — |
| `icp_data` | enabled | authenticated: client_id IN (SELECT client_id FROM public.client_portfolio WHERE salesperson_id = public.get_current_salesperson_id()) OR pu | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | — |
| `icp_parameters` | enabled | authenticated: is_admin_or_manager(auth.uid())<br>authenticated: true | authenticated: is_admin_or_manager(auth.uid()) | authenticated: is_admin_or_manager(auth.uid()) | authenticated: is_admin_or_manager(auth.uid()) |
| `inbound_reply_events` | enabled | authenticated: public.has_role(auth.uid(), 'admin'::app_role) | — | — | — |
| `integration_autotest_jobs` | enabled | authenticated: public.has_role(auth.uid(),'admin') | authenticated: public.has_role(auth.uid(),'admin') | authenticated: public.has_role(auth.uid(),'admin') | authenticated: public.has_role(auth.uid(),'admin') |
| `integration_autotest_settings` | enabled | authenticated: public.has_role(auth.uid(),'admin') | authenticated: public.has_role(auth.uid(),'admin') | authenticated: public.has_role(auth.uid(),'admin') | authenticated: public.has_role(auth.uid(),'admin') |
| `integration_connections` | enabled | authenticated: public.has_role(auth.uid(),'admin') | authenticated: public.has_role(auth.uid(),'admin') | authenticated: public.has_role(auth.uid(),'admin') | authenticated: public.has_role(auth.uid(),'admin') |
| `integration_health_checks` | enabled | authenticated: public.has_role(auth.uid(),'admin') | authenticated: public.has_role(auth.uid(),'admin') | — | — |
| `integration_logs` | enabled | public: is_admin_or_manager(auth.uid()) | — | — | — |
| `integration_secret_refs` | enabled | authenticated: owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) |
| `intent_audit_logs` | enabled | public: auth.role() = 'authenticated'<br>authenticated: true | authenticated: true | — | — |
| `inventory_levels` | enabled | authenticated: is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) |
| `ip_whitelist` | enabled | public: public.has_role(auth.uid(), 'admin') | public: public.has_role(auth.uid(), 'admin') | public: public.has_role(auth.uid(), 'admin') | public: public.has_role(auth.uid(), 'admin') |
| `known_devices` | enabled | public: auth.uid() = user_id | public: auth.uid() = user_id | public: auth.uid() = user_id | public: auth.uid() = user_id |
| `kudos` | enabled | authenticated: true | authenticated: from_salesperson_id = public.get_current_salesperson_id() | authenticated: public.is_admin_or_manager(auth.uid()) | — |
| `lead_assignments` | enabled | authenticated: public.is_admin_or_manager(auth.uid()) OR salesperson_id = public.get_current_salesperson_id()<br>authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) |
| `lead_churn_risk` | enabled | authenticated: public.is_admin_or_manager(auth.uid())<br>authenticated: EXISTS ( SELECT 1 FROM public.sales s JOIN public.salespeople sp ON sp.id = s.salesperson_id WHERE s.id = lead_churn_risk.sal | — | — | — |
| `lead_detailed_logs` | enabled | public: EXISTS ( SELECT 1 FROM public.clients c WHERE c.id = lead_detailed_logs.client_id AND (c.user_id = auth.uid() OR auth.uid() IN (SELE<br>authenticated: auth.uid() = created_by OR is_admin_or_manager(auth.uid()) | authenticated: auth.uid() = created_by AND ( is_admin_or_manager(auth.uid()) OR EXISTS ( SELECT 1 FROM public.clients c WHERE c.id = lead_de | — | — |
| `lead_intelligence_metrics` | enabled | authenticated: true | — | — | — |
| `lead_routing_log` | enabled | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | — | — |
| `lead_routing_rules` | enabled | authenticated: true<br>authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) |
| `lead_score_explanations` | enabled | public: EXISTS ( SELECT 1 FROM public.sales s JOIN public.salespeople sp ON sp.id = s.salesperson_id WHERE s.id = lead_score_explanations.sa<br>public: auth.role() = 'service_role'<br>public: public.has_role(auth.uid(), 'admin') | public: auth.role() = 'service_role'<br>public: public.has_role(auth.uid(), 'admin') | public: auth.role() = 'service_role'<br>public: public.has_role(auth.uid(), 'admin') | public: auth.role() = 'service_role'<br>public: public.has_role(auth.uid(), 'admin') |
| `lead_score_history` | enabled | public: EXISTS ( SELECT 1 FROM public.sales s JOIN public.salespeople sp ON sp.id = s.salesperson_id WHERE s.id = lead_score_history.sale_id | public: auth.role() = 'service_role' | — | — |
| `lead_score_trends` | enabled | public: auth.role() = 'authenticated' | — | — | — |
| `lead_scores` | enabled | public: EXISTS ( SELECT 1 FROM public.sales s WHERE s.id = lead_scores.sale_id AND (s.salesperson_id = get_current_salesperson_id() OR is_ad | public: EXISTS ( SELECT 1 FROM public.sales s WHERE s.id = lead_scores.sale_id AND (s.salesperson_id = get_current_salesperson_id() OR is_ad | public: EXISTS ( SELECT 1 FROM public.sales s WHERE s.id = lead_scores.sale_id AND (s.salesperson_id = get_current_salesperson_id() OR is_ad | public: EXISTS ( SELECT 1 FROM public.sales s WHERE s.id = lead_scores.sale_id AND (s.salesperson_id = get_current_salesperson_id() OR is_ad |
| `lead_source_configs` | enabled | public: auth.role() = 'authenticated' | — | — | — |
| `league_history` | enabled | — | — | — | — |
| `league_members` | enabled | authenticated: true | authenticated: salesperson_id = (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid() LIMIT 1) | authenticated: is_admin_or_manager(auth.uid()) | — |
| `leagues` | enabled | authenticated: true | — | — | — |
| `login_alerts` | enabled | public: auth.uid() = user_id | — | public: auth.uid() = user_id | — |
| `login_attempts` | enabled | public: EXISTS ( SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin' )<br>authenticated: public.has_role(auth.uid(), 'admin'::public.app_role) | service_role: true | — | — |
| `maintenance_log` | forced | authenticated: public.has_role(auth.uid(), 'admin')<br>anon, authenticated: true | anon, authenticated: true | anon, authenticated: true | anon, authenticated: true |
| `message_templates` | enabled | public: salesperson_id = public.get_current_salesperson_id() | public: salesperson_id = public.get_current_salesperson_id() | public: salesperson_id = public.get_current_salesperson_id() | public: salesperson_id = public.get_current_salesperson_id() |
| `mfa_verification_attempts` | enabled | public: auth.uid() = user_id | — | — | — |
| `migration_log` | não encontrado | sem RLS | sem RLS | sem RLS | sem RLS |
| `monthly_sales_summary` | enabled | authenticated: public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'manager'::app_role) | — | — | — |
| `mood_entries` | enabled | authenticated: salesperson_id IN ( SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid() ) | authenticated: salesperson_id IN ( SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid() ) | authenticated: salesperson_id IN ( SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid() ) | — |
| `mql_qualifications` | enabled | authenticated: auth.uid() = qualified_by OR is_admin_or_manager(auth.uid()) | authenticated: auth.uid() = qualified_by OR is_admin_or_manager(auth.uid()) | authenticated: auth.uid() = qualified_by OR is_admin_or_manager(auth.uid()) | authenticated: auth.uid() = qualified_by OR is_admin_or_manager(auth.uid()) |
| `notification_preferences` | enabled | public: auth.uid() = user_id<br>authenticated: user_id = auth.uid() | public: auth.uid() = user_id<br>authenticated: user_id = auth.uid() | public: auth.uid() = user_id<br>authenticated: user_id = auth.uid() | public: auth.uid() = user_id<br>authenticated: user_id = auth.uid() |
| `notifications` | enabled | public: auth.uid() = user_id<br>authenticated: user_id = auth.uid()<br>authenticated: type = 'churn_alert' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')) | authenticated: user_id = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: user_id = auth.uid() | authenticated: user_id = auth.uid() |
| `nps_surveys` | enabled | authenticated: true<br>authenticated: salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()) | authenticated: salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid())<br>authenticated: get_current_salesperson_id() = salesperson_id | authenticated: salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid())<br>authenticated: get_current_salesperson_id() = salesperson_id OR is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid())<br>authenticated: get_current_salesperson_id() = salesperson_id OR is_admin_or_manager(auth.uid()) |
| `objection_library` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `objections_library` | enabled | authenticated: true | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) |
| `onboarding_journeys` | enabled | public: public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id() OR EXISTS ( SELECT 1 FROM publi<br>public: public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id() | public: public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id() | public: public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id() | public: public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id() |
| `onboarding_steps` | enabled | public: EXISTS (SELECT 1 FROM public.onboarding_journeys j WHERE j.id = journey_id AND ( public.is_admin_or_manager(auth.uid()) OR j.owner_s<br>public: EXISTS (SELECT 1 FROM public.onboarding_journeys j WHERE j.id = journey_id AND ( public.is_admin_or_manager(auth.uid()) OR j.owner_s | public: EXISTS (SELECT 1 FROM public.onboarding_journeys j WHERE j.id = journey_id AND ( public.is_admin_or_manager(auth.uid()) OR j.owner_s | public: EXISTS (SELECT 1 FROM public.onboarding_journeys j WHERE j.id = journey_id AND ( public.is_admin_or_manager(auth.uid()) OR j.owner_s | public: EXISTS (SELECT 1 FROM public.onboarding_journeys j WHERE j.id = journey_id AND ( public.is_admin_or_manager(auth.uid()) OR j.owner_s |
| `order_items` | enabled | public: EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin')))<br>authenticated: is_admin_or_manager(auth.uid()) | public: EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())<br>authenticated: is_admin_or_manager(auth.uid()) | authenticated: is_admin_or_manager(auth.uid()) | authenticated: is_admin_or_manager(auth.uid()) |
| `order_status_events` | enabled | public: EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin')))<br>authenticated: is_admin_or_manager(auth.uid()) | — | — | — |
| `orders` | enabled | authenticated: is_admin_or_manager(auth.uid())<br>authenticated: auth.uid() = user_id<br>authenticated: salesperson_id IS NOT NULL AND salesperson_id = get_current_salesperson_id() | public: auth.uid() = user_id<br>authenticated: is_admin_or_manager(auth.uid()) | authenticated: is_admin_or_manager(auth.uid()) | authenticated: is_admin_or_manager(auth.uid()) |
| `outbound_messages` | enabled | authenticated: owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: owner_id = auth.uid() OR public.is_admin_or_manager(auth.uid()) | — |
| `page_analytics` | enabled | authenticated: salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()) | authenticated: salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()) | authenticated: salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()) | — |
| `password_history` | enabled | public: auth.uid() = user_id | — | — | — |
| `password_reset_requests` | enabled | authenticated: auth.uid() IS NOT NULL AND user_email = get_current_user_email()<br>authenticated: has_role(auth.uid(), 'admin'::app_role) | authenticated: user_id = auth.uid() AND user_email = public.get_current_user_email() AND status = 'pending'<br>authenticated: has_role(auth.uid(), 'admin'::app_role) | authenticated: has_role(auth.uid(), 'admin'::app_role) | authenticated: has_role(auth.uid(), 'admin'::app_role) |
| `performance_bets` | enabled | authenticated: salesperson_id = (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid() LIMIT 1) OR public.is_admin_or_manager(au | authenticated: salesperson_id = public.get_current_salesperson_id() | authenticated: salesperson_id = public.get_current_salesperson_id() | — |
| `performance_impact_factors` | enabled | public: auth.role() = 'authenticated' | — | — | — |
| `permissions` | enabled | public: public.has_role(auth.uid(), 'admin')<br>authenticated: public.is_admin_or_manager(auth.uid()) | public: public.has_role(auth.uid(), 'admin') | public: public.has_role(auth.uid(), 'admin') | public: public.has_role(auth.uid(), 'admin') |
| `person_intelligence` | enabled | public: EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager')) | — | — | — |
| `personal_assistant_briefings` | enabled | authenticated: salesperson_id IN (SELECT s.id FROM public.salespeople s WHERE s.auth_user_id = auth.uid())<br>authenticated: public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'manager'::app_role) | authenticated: salesperson_id IN (SELECT s.id FROM public.salespeople s WHERE s.auth_user_id = auth.uid()) | authenticated: salesperson_id IN (SELECT s.id FROM public.salespeople s WHERE s.auth_user_id = auth.uid()) | — |
| `personal_assistant_nudges` | enabled | authenticated: salesperson_id IN ( SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid() )<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: salesperson_id IN ( SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid() ) | authenticated: salesperson_id IN ( SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid() ) | — |
| `pipeline_coverage_recommendations` | enabled | authenticated: true | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: true | authenticated: public.has_role(auth.uid(), 'admin') |
| `pipeline_coverage_snapshots` | enabled | authenticated: true | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') |
| `pipeline_inspection_snapshots` | enabled | public: is_admin_or_manager(auth.uid()) OR EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.salesperson_id = get_current_sale | public: is_admin_or_manager(auth.uid()) | — | — |
| `pipeline_inspections` | enabled | — | — | — | — |
| `pipeline_stages` | enabled | authenticated: true<br>authenticated: true<br>authenticated: is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid())<br>authenticated: is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid())<br>authenticated: is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid())<br>authenticated: is_admin_or_manager(auth.uid()) |
| `pipelines` | enabled | authenticated: true<br>authenticated: true | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) |
| `plan_rollback_ddl` | não encontrado | sem RLS | sem RLS | sem RLS | sem RLS |
| `playbook_items` | enabled | authenticated: true | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) |
| `playbook_progress` | enabled | authenticated: completed_by = public.get_current_salesperson_id() OR sale_id IN ( SELECT id FROM public.sales WHERE salesperson_id = public.<br>public: auth.role() = 'authenticated'<br>public: auth.uid() = completed_by | authenticated: completed_by = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid())<br>public: auth.uid() = completed_by | authenticated: completed_by = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid())<br>public: auth.uid() = completed_by | authenticated: completed_by = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid())<br>public: auth.uid() = completed_by |
| `playbooks` | enabled | authenticated: true | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) |
| `portfolio_settings` | enabled | public: has_role(auth.uid(), 'admin')<br>authenticated: setting_key NOT ILIKE '%token%' AND setting_key NOT ILIKE '%secret%' AND setting_key NOT ILIKE '%webhook%' AND setting_key NO<br>authenticated: has_role(auth.uid(), 'admin') | public: has_role(auth.uid(), 'admin') | public: has_role(auth.uid(), 'admin') | public: has_role(auth.uid(), 'admin') |
| `price_alerts` | enabled | authenticated: is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | — |
| `price_history` | enabled | authenticated: is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | — | — |
| `price_protection_rules` | enabled | public: auth.role() = 'authenticated' | — | — | — |
| `pricing_rules` | enabled | public: auth.role() = 'authenticated' | — | — | — |
| `prize_wheel_spins` | enabled | authenticated: salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid()) | — | — | — |
| `product_stock_log` | enabled | public: auth.role() = 'authenticated' | — | — | — |
| `product_usage` | enabled | public: public.is_admin_or_manager(auth.uid()) OR client_id IN ( SELECT client_id FROM public.client_portfolio WHERE salesperson_id = public | — | — | — |
| `product_usage_events` | enabled | public: public.is_admin_or_manager(auth.uid()) OR EXISTS ( SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.owner_id = public.g | public: public.is_admin_or_manager(auth.uid()) | — | — |
| `product_usage_summary` | enabled | public: public.is_admin_or_manager(auth.uid()) OR EXISTS ( SELECT 1 FROM public.accounts a WHERE a.id = account_id AND a.owner_id = public.g<br>public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) |
| `products` | enabled | authenticated: true<br>public: deleted_at IS NOT NULL AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true)<br>public: active = true | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) |
| `progressive_goals` | enabled | authenticated: salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()) | authenticated: salesperson_id = public.get_current_salesperson_id() | authenticated: is_admin_or_manager(auth.uid()) | — |
| `prospect_cadences` | enabled | authenticated: salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid())<br>authenticated: quote_id IS NOT NULL AND EXISTS ( SELECT 1 FROM public.quotes q JOIN public.salespeople sp ON sp.id = COALESCE(prospect_caden | authenticated: salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()) | authenticated: salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()) | authenticated: salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()) |
| `push_subscriptions` | enabled | public: auth.uid() = user_id<br>authenticated: user_id = auth.uid() | public: auth.uid() = user_id<br>authenticated: user_id = auth.uid() | public: auth.uid() = user_id<br>authenticated: user_id = auth.uid() | public: auth.uid() = user_id<br>authenticated: user_id = auth.uid() |
| `qbr_reports` | enabled | public: is_admin_or_manager(auth.uid()) OR salesperson_id = get_current_salesperson_id() | public: is_admin_or_manager(auth.uid()) | — | public: is_admin_or_manager(auth.uid()) |
| `qbr_schedule` | enabled | public: public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id() OR EXISTS ( SELECT 1 FROM publi<br>public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) |
| `query_telemetry` | enabled | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: auth.uid() IS NOT NULL | — | authenticated: public.is_admin_or_manager(auth.uid()) |
| `quota_attainment_actions` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `quota_attainment_alerts` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `quota_attainment_forecasts` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `quota_attainment_predictions` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')<br>public: auth.role() = 'authenticated' | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `quote_conversion_audit` | enabled | authenticated: public.has_role(auth.uid(), 'admin') | — | — | — |
| `quote_items` | enabled | public: auth.role() = 'authenticated' | public: EXISTS ( SELECT 1 FROM public.quotes q WHERE q.id = quote_items.quote_id AND ( public.is_admin_or_manager(auth.uid()) OR q.created_b | public: EXISTS ( SELECT 1 FROM public.quotes q WHERE q.id = quote_items.quote_id AND ( public.is_admin_or_manager(auth.uid()) OR q.created_b | public: public.is_admin_or_manager(auth.uid()) |
| `quote_sync_inbound_log` | enabled | authenticated: public.has_role(auth.uid(), 'admin'::app_role) | — | — | — |
| `quote_sync_logs` | enabled | authenticated: public.has_role(auth.uid(), 'admin')<br>public: is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | — | — |
| `quotes` | enabled | public: is_admin_or_manager(auth.uid()) OR created_by = get_current_salesperson_id()<br>authenticated: get_current_salesperson_id() IS NOT NULL AND created_by IS NOT NULL AND created_by = get_current_salesperson_id()<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | public: is_admin_or_manager(auth.uid()) OR created_by = get_current_salesperson_id() | public: is_admin_or_manager(auth.uid()) OR created_by = get_current_salesperson_id() | public: is_admin_or_manager(auth.uid()) |
| `quotes_inbound` | enabled | authenticated: public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'manager'::app_role)<br>authenticated: seller_email = ( SELECT email FROM public.salespeople WHERE auth_user_id = auth.uid() AND is_active = true LIMIT 1 ) | — | — | — |
| `race_badges` | enabled | authenticated: true | — | — | — |
| `race_cars` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid())<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid())<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `race_daily_snapshots` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `race_events` | enabled | authenticated: true | — | — | — |
| `race_overlay_telemetry` | enabled | authenticated: auth.uid() = user_id<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: auth.uid() = user_id | authenticated: auth.uid() = user_id | — |
| `race_powerups` | enabled | authenticated: true | — | — | — |
| `race_reactions` | enabled | authenticated: true | authenticated: auth.uid() = reactor_user_id | — | — |
| `race_rivalries_persistent` | enabled | authenticated: true<br>authenticated: EXISTS ( SELECT 1 FROM public.race_cars rc JOIN public.salespeople sp ON sp.id = rc.salesperson_id WHERE rc.id = race_rivalri<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: EXISTS ( SELECT 1 FROM public.race_cars rc JOIN public.salespeople sp ON sp.id = rc.salesperson_id WHERE rc.id = race_rivalri<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: EXISTS ( SELECT 1 FROM public.race_cars rc JOIN public.salespeople sp ON sp.id = rc.salesperson_id WHERE rc.id = race_rivalri<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: EXISTS ( SELECT 1 FROM public.race_cars rc JOIN public.salespeople sp ON sp.id = rc.salesperson_id WHERE rc.id = race_rivalri<br>authenticated: public.has_role(auth.uid(), 'admin') |
| `race_scoring_rules` | enabled | authenticated: true<br>authenticated: has_role(auth.uid(), 'admin'::app_role) | authenticated: has_role(auth.uid(), 'admin'::app_role) | authenticated: has_role(auth.uid(), 'admin'::app_role) | authenticated: has_role(auth.uid(), 'admin'::app_role) |
| `race_seasons` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `race_team_members` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `race_teams` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `race_unlocks` | enabled | public: auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') | public: auth.uid() = user_id | — | — |
| `race_user_daily_checkins` | enabled | authenticated: auth.uid() = user_id | authenticated: auth.uid() = user_id | — | — |
| `race_user_preferences` | enabled | public: auth.uid() = user_id | public: auth.uid() = user_id | public: auth.uid() = user_id | public: auth.uid() = user_id |
| `rank_change_notifications` | enabled | authenticated: salesperson_id = public.get_current_salesperson_id() | authenticated: salesperson_id = public.get_current_salesperson_id() | authenticated: salesperson_id = public.get_current_salesperson_id() | — |
| `ranking_notifications` | enabled | authenticated: salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin': | authenticated: public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'manager'::app_role) | authenticated: salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()) | authenticated: public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'manager'::app_role) |
| `rate_limit_logs` | enabled | public: public.is_admin_or_manager(auth.uid())<br>authenticated: public.is_admin_or_manager(auth.uid()) | — | — | — |
| `rate_limit_settings` | enabled | public: public.has_role(auth.uid(), 'admin')<br>authenticated: public.is_admin_or_manager(auth.uid()) | public: public.has_role(auth.uid(), 'admin') | public: public.has_role(auth.uid(), 'admin') | public: public.has_role(auth.uid(), 'admin') |
| `reauthentication_requests` | enabled | public: auth.uid() = user_id | public: auth.uid() = user_id | — | public: auth.uid() = user_id |
| `renewals` | enabled | public: public.is_admin_or_manager(auth.uid()) OR owner_salesperson_id = public.get_current_salesperson_id() OR EXISTS ( SELECT 1 FROM publi<br>public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) | public: public.is_admin_or_manager(auth.uid()) |
| `report_embed_tokens` | enabled | public: created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'manager'::app_role) | public: created_by = auth.uid() | public: created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'manager'::app_role) | public: created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'manager'::app_role) |
| `report_executions` | enabled | authenticated: EXISTS ( SELECT 1 FROM public.custom_reports r WHERE r.id = report_executions.report_id AND (r.owner_id = auth.uid() OR publi | — | — | — |
| `report_schedules` | enabled | authenticated: created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()) | authenticated: created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()) |
| `revenue_forecasts` | enabled | public: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR owner_id = public.get_current_salesperson_id()<br>public: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | public: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | public: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') | public: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') |
| `role_permissions` | enabled | public: public.has_role(auth.uid(), 'admin')<br>authenticated: public.is_admin_or_manager(auth.uid()) | public: public.has_role(auth.uid(), 'admin') | public: public.has_role(auth.uid(), 'admin') | public: public.has_role(auth.uid(), 'admin') |
| `sale_notifications_audit` | enabled | — | — | — | — |
| `sales` | enabled | public: salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())<br>public: public.is_admin_or_manager()<br>public: EXISTS ( SELECT 1 FROM public.salespeople WHERE salespeople.auth_user_id = auth.uid() AND salespeople.id = sales.salesperson_id )<br>public: sdr_id IN (SELECT id FROM salespeople WHERE auth_user_id = auth.uid())<br>public: closer_id IN (SELECT id FROM salespeople WHERE auth_user_id = auth.uid()) | public: salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())<br>public: EXISTS ( SELECT 1 FROM public.salespeople WHERE salespeople.auth_user_id = auth.uid() AND salespeople.id = salesperson_id )<br>public: public.is_admin_or_manager() | authenticated: is_admin_or_manager(auth.uid())<br>public: auth.uid() = salesperson_id<br>public: EXISTS ( SELECT 1 FROM public.salespeople WHERE salespeople.auth_user_id = auth.uid() AND salespeople.id = sales.salesperson_id )<br>public: public.is_admin_or_manager() | public: salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())<br>public: public.is_admin_or_manager() |
| `sales_battles` | enabled | authenticated: public.is_admin_or_manager(auth.uid())<br>public: auth.uid() IS NOT NULL | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) |
| `sales_enablement_assets` | enabled | authenticated: is_active = true OR public.is_admin_or_manager(auth.uid())<br>authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) |
| `sales_goals` | enabled | public: salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) | public: is_admin_or_manager(auth.uid()) |
| `sales_streaks` | enabled | authenticated: true | authenticated: salesperson_id = public.get_current_salesperson_id() | authenticated: is_admin_or_manager(auth.uid()) | — |
| `sales_territories` | enabled | authenticated: true | authenticated: public.is_admin_or_manager(auth.uid()) | authenticated: public.is_admin_or_manager(auth.uid()) | — |
| … +108 linhas — lista completa em `context.json` | | | | | |

> `—` com RLS ligado = ninguém além de service_role. `sem RLS` = qualquer chave anon lê/escreve tudo.

## Onde o RLS é IGNORADO (service_role) — 310 arquivo(s)

- `scripts/ai-context/cenarios.mjs`
- `scripts/ai-context/gerar.unit.mjs`
- `scripts/deno-test-suite.mjs`
- `scripts/gen-api-catalog.mjs`
- `scripts/inventario/gerar-banco.mjs`
- `scripts/lib/requireSupabaseAdminEnv.ts`
- `scripts/regras_negocio/generate.py`
- `scripts/run-win-loss-analysis.ts`
- `scripts/security/check-no-committed-service-role.ts`
- `scripts/seed-august-sales.ts`
- `scripts/seed-deal-outcomes.ts`
- `scripts/seed-fake-data.ts`
- `scripts/seed-probe.ts`
- `scripts/seed-race-cars.ts`
- `scripts/seed-real-people.ts`
- `scripts/supabase_snapshot/snapshot.py`
- `src/test/security/fn-cleanup-webhook-dedupe-privileges.test.ts`
- `supabase/functions/_shared/auth-client.ts`
- `supabase/functions/_shared/circuit-breaker.ts`
- `supabase/functions/_shared/cron-job-auth.ts`
- `supabase/functions/_shared/cron-request-auth.ts`
- `supabase/functions/_shared/edge-runtime-regressions_contract_test.ts`
- `supabase/functions/_shared/internal-service-auth.ts`
- `supabase/functions/_shared/privileged-churn-auth_contract_test.ts`
- `supabase/functions/_shared/rate-limit.ts`
- `supabase/functions/_shared/retry.ts`
- `supabase/functions/_shared/secret-refs.ts`
- `supabase/functions/_shared/transactional-email-sender.ts`
- `supabase/functions/_shared/unsubscribe.ts`
- `supabase/functions/_shared/webhook-auth.ts`
- `supabase/functions/_shared/webhook-auth_test.ts`
- `supabase/functions/access-denied-alerts/index.ts`
- `supabase/functions/account-engagement-aggregator/index.ts`
- `supabase/functions/activity-goal-alerts/index.ts`
- `supabase/functions/aggregate-coaching-scorecard/index.ts`
- `supabase/functions/ai-agent-orchestrator/index.ts`
- `supabase/functions/ai-copilot/index.ts`
- `supabase/functions/analyze-call/index.ts`
- `supabase/functions/analyze-conversation/index.ts`
- `supabase/functions/analyze-pipeline-coverage/index.ts`
- `supabase/functions/analyze-skill-gaps/index.ts`
- `supabase/functions/analyze-stage-conversion/index.ts`
- `supabase/functions/analyze-win-loss/index.ts`
- `supabase/functions/auto-reassign-inactive/contract_test.ts`
- `supabase/functions/auto-reassign-inactive/index.ts`
- `supabase/functions/behavioral-analysis/index.ts`
- `supabase/functions/bitrix24-oauth/index.ts`
- `supabase/functions/bitrix24-sync/index.ts`
- `supabase/functions/broadcast-sale-notification/index.ts`
- `supabase/functions/calculate-committee-coverage/index.ts`
- `supabase/functions/calculate-deal-health/index.ts`
- `supabase/functions/calibrate-win-probability/index.ts`
- `supabase/functions/campaign-health-alert/authz_test.ts`
- `supabase/functions/campaign-health-alert/index.ts`
- `supabase/functions/challenge-expiration-alerts/index.ts`
- `supabase/functions/check-lead-sla/index.ts`
- `supabase/functions/check-quote-expiration/index.ts`
- `supabase/functions/check-v4-callback-alerts/index.ts`
- `supabase/functions/coaching-intelligence/index.ts`
- `supabase/functions/conversational-intelligence/index.ts`
- `supabase/functions/cron-failure-alerter/dead-letter-rbac.test.ts`
- `supabase/functions/cron-failure-alerter/index.test.ts`
- `supabase/functions/cron-failure-alerter/index.ts`
- `supabase/functions/customer-success-360/index.ts`
- `supabase/functions/customer-success-hub/index.ts`
- `supabase/functions/deal-risk-digest/index.ts`
- `supabase/functions/demand-forecast/index.ts`
- `supabase/functions/detect-client-churn-alerts/index.ts`
- `supabase/functions/detect-coaching-opportunities/index.ts`
- `supabase/functions/detect-stuck-deals/index.ts`
- `supabase/functions/dispatch-webhook/authz_test.ts`
- `supabase/functions/dispatch-webhook/index.ts`
- `supabase/functions/edge-retry-threshold-alert/index.ts`
- `supabase/functions/email-bulk-retry/authz_test.ts`
- `supabase/functions/email-bulk-retry/index.ts`
- `supabase/functions/email-bulk-send/index.ts`
- `supabase/functions/email-composer-bulk/index.ts`
- `supabase/functions/email-unsubscribe/index.ts`
- `supabase/functions/external-db-bridge/index.ts`
- `supabase/functions/extract-committee-from-call/index.ts`
- `supabase/functions/extract-deal-stakeholders/index.ts`
- `supabase/functions/forecast-narrative/index.ts`
- `supabase/functions/generate-coaching-actions/index.ts`
- `supabase/functions/generate-executive-briefing/index.ts`
- `supabase/functions/generate-loss-coaching/index.ts`
- `supabase/functions/generate-urgent-client-tasks/index.ts`
- `supabase/functions/helpdesk-sync/index.ts`
- `supabase/functions/inbound-email-webhook/index.ts`
- `supabase/functions/lead-scoring/index.ts`
- `supabase/functions/log-web-vitals/index.ts`
- `supabase/functions/mine-win-loss-patterns/index.ts`
- `supabase/functions/multichannel-status-webhook/index.ts`
- `supabase/functions/new-device-alert/index.ts`
- `supabase/functions/next-best-action/index.ts`
- `supabase/functions/notify-v4-quote-status/index.ts`
- `supabase/functions/personal-assistant-stream/personal-assistant-stream_test.ts`
- `supabase/functions/pipeline-pulse-aggregator/index.ts`
- `supabase/functions/predict-deal-velocity/index.ts`
- `supabase/functions/predict-quota-attainment/index.ts`
- `supabase/functions/predictive-intelligence/index.ts`
- `supabase/functions/predictive-scoring-explain/index.ts`
- `supabase/functions/pricing-intelligence/index.ts`
- `supabase/functions/process-cadence-tasks/index.ts`
- `supabase/functions/process-call-recording-ingest/index.ts`
- `supabase/functions/process-race-event/index.ts`
- `supabase/functions/process-scheduled-sends/index.ts`
- `supabase/functions/ranking-api/index.ts`
- `supabase/functions/receive-quote-sync/index.ts`
- `supabase/functions/receive-quote-webhook/index.ts`
- `supabase/functions/report-embed-public/index.ts`
- `supabase/functions/revenue-forecast-ai/index.ts`
- `supabase/functions/revops-hub/index.ts`
- `supabase/functions/sales-assistant-chat/index.ts`
- `supabase/functions/salesperson-coaching/index.ts`
- `supabase/functions/schedule-optimal-send/index.ts`
- `supabase/functions/scheduled-report-trigger/index.ts`
- `supabase/functions/scheduled-reports-runner/index.ts`
- `supabase/functions/sdr-consecutive-alerts/index.ts`
- `supabase/functions/semantic-index-entity/index.ts`
- `supabase/functions/semantic-reindex-batch/index.ts`
- `supabase/functions/semantic-search/index.ts`
- `supabase/functions/send-alert-notifications/index.ts`
- `supabase/functions/send-churn-alert-email/index.ts`
- `supabase/functions/send-multichannel-message/authz_test.ts`
- `supabase/functions/send-multichannel-message/index.ts`
- `supabase/functions/send-password-reset/authz_test.ts`
- `supabase/functions/send-password-reset/index.ts`
- `supabase/functions/send-push-notification/index.ts`
- `supabase/functions/send-quote-to-client/authz_test.ts`
- `supabase/functions/send-quote-to-client/index.ts`
- `supabase/functions/send-transactional-email/contract_test.ts`
- `supabase/functions/send-transactional-email/index.ts`
- `supabase/functions/sequence-enroll/index.ts`
- `supabase/functions/sequence-record-reply/index.ts`
- `supabase/functions/sequence-runner/index.ts`
- `supabase/functions/sequence-runner/integrity_test.ts`
- `supabase/functions/simulate-load/index.ts`
- `supabase/functions/territory-optimization/index.ts`
- `supabase/functions/test-integration-connection/index.ts`
- `supabase/functions/twilio-call-status/index.ts`
- `supabase/functions/twilio-call-twiml/index.ts`
- `supabase/functions/twilio-click-to-call/index.ts`
- `supabase/functions/visual-search/index.ts`
- `supabase/functions/wal-health-alert/index.ts`
- `supabase/functions/webauthn/index.ts`
- `supabase/functions/webvitals-regression-alert/index.ts`
- `supabase/functions/whatsapp-inbound-webhook/index.ts`
- `supabase/functions/winloss-webhook-dispatcher/index.ts`
- `supabase/functions/winloss-webhook-dispatcher/retry_persist_status_test.ts`
- `supabase/functions/winloss-webhook-health-monitor/index.ts`
- … +160 (lista completa em `context.json`)

## Funções SQL `SECURITY DEFINER` (rodam com privilégio do dono, ignoram RLS)

- `add_league_weekly_xp`
- `add_salesperson_xp`
- `admin_capture_rollback_snapshot`
- `admin_edge_cron_status`
- `admin_get_cron_job_stats`
- `admin_get_rollback_rate_series`
- `admin_reset_query_stats`
- `admin_top_queries`
- `anonymize_data_subject`
- `append_agent_step`
- `approve_agent_run`
- `assign_cadence_variant`
- `assign_task_to_squad`
- `audit_log_row_change`
- `audit_trigger`
- `audit_trigger_func`
- `audit_user_roles_change`
- `auto_add_client_to_portfolio`
- `auto_assign_lead`
- `auto_create_commission`
- `auto_enroll_in_cadence`
- `auto_enroll_quote_cadence`
- `auto_link_sale_to_account`
- `auto_pause_cadence_on_response`
- `auto_promote_sequence_winners`
- `auto_set_forecast_category`
- `auto_victory_post`
- `award_achievement_if_not_exists`
- `award_bonus_if_eligible`
- `award_sale_xp`
- `award_salesperson_xp`
- `award_xp_on_quote_approved_via_cadence`
- `award_xp_on_quote_cadence_task_complete`
- `backfill_orders_conversion_seq`
- `broadcast_sale_completed`
- `bulk_approve_assignments`
- `bulk_recompute_engagement`
- `calculate_account_score`
- `calculate_daily_challenge_streak`
- `calculate_deal_health`
- `calculate_deal_risk_score`
- `check_2fa_failed_attempts`
- `check_battle_achievements`
- `check_is_first_activation`
- `check_is_first_sale`
- `check_quote_expirations`
- `check_rate_limit`
- `check_sla_violations`
- `claim_daily_challenge_reward`
- `claim_pending_cadence_tasks`
- `claim_streak_achievements`
- `claim_weekly_challenge_reward`
- `cleanup_expired_narrative_cache`
- `coaching_progress_by_salesperson`
- `complete_agent_run`
- `complete_call_recording_ingest_job`
- `compute_challenge_progress_value`
- `compute_cohort_retention`
- `compute_customer_health_v2`
- `compute_forecast_rollup`
- `compute_optimal_send_time`
- `compute_pipeline_inspection`
- `compute_salesperson_retention_cohort`
- `compute_scheduled_report_next_run`
- `convert_quote_to_order`
- `count_failed_login_attempts`
- `count_reset_requests_24h`
- `create_activities_from_action_items`
- `create_agent_run`
- `data_subject_requests_guard_payload`
- `declare_step_winner`
- `dequeue_call_recording_ingest_jobs`
- `detect_renewal_risks`
- `detect_slow_queries`
- `detect_stalled_cron_jobs`
- `disable_sms`
- `disable_totp`
- `enforce_telemetry_retention`
- `enqueue_v4_callback`
- `enrich_lead_data`
- `enroll_quote_in_cadence`
- `ensure_single_default_filter`
- `finalize_race_season`
- `find_matching_cadence_rule`
- `fn_admin_cleanup_stale_logs`
- `fn_admin_conversion_trail`
- `fn_admin_cron_alert_breakdown`
- `fn_admin_cron_alert_metrics`
- `fn_admin_get_new_cron_failures`
- `fn_admin_list_dead_letter_ingest_jobs`
- `fn_admin_mark_cron_failure_alerted`
- `fn_admin_platform_slo`
- `fn_admin_replay_dead_letter_ingest_job`
- `fn_admin_reset_circuit`
- `fn_admin_security_definer_exposure`
- `fn_admin_wal_health`
- `fn_admin_web_vitals_p75`
- `fn_apply_data_retention`
- `fn_auto_map_inbound_seller`
- `fn_backfill_orders_conversion_seq`
- `fn_calculate_icp_score`
- `fn_check_slo_burn_rate`
- `fn_cleanup_stale_logs`
- `fn_cleanup_webhook_dedupe`
- `fn_convert_quote_to_sale`
- `fn_gc_call_recording_ingest_jobs`
- `fn_get_orders_conversion_seq_last`
- `fn_list_cron_jobs`
- `fn_purge_rollback_snapshots`
- `fn_record_conversion_attempt`
- `fn_slo_burn_rate`
- `fn_test_backdate_cron_alert`
- `fn_test_cleanup_cron_alerts`
- `fn_test_mark_cron_failure`
- `fn_test_simulate_stalled_check`
- `generate_api_token`
- `generate_cadence_tasks`
- `generate_device_fingerprint`
- `generate_mfa_backup_codes`
- `get_ab_test_results`
- `get_account_engagement_summary`
- `get_active_salespeople`
- `get_auto_paused_count`
- `get_bulk_job_summary`
- `get_cadence_metrics`
- `get_campaign_delivery_stats`
- `get_campaign_optout_rates`
- `get_campaign_recovery_rates`
- `get_client_purchase_heatmap`
- `get_client_seasonality`
- `get_client_top_products`
- `get_current_salesperson_id`
- `get_current_user_email`
- `get_deleted_records`
- `get_dialer_queue_stats`
- `get_embedded_report_by_token`
- `get_engagement_leaderboard`
- `get_global_send_time_stats`
- `get_industry_benchmark_stats`
- `get_industry_seasonality`
- `get_industry_top_products`
- `get_login_lockout_status`
- `get_mfa_status`
- `get_purchase_intelligence_summary`
- `get_recovery_by_failure_type`
- `get_score_trend`
- `get_semantic_coverage`
- `get_top_accounts`
- `get_user_permissions`
- `get_user_role`
- `grant_task_xp`
- `handle_audit_logging`
- `handle_new_user_role`
- `handle_performance_update`
- `handle_sale_commissions`
- `handle_template_versioning`
- `handle_territory_conquest`
- `hard_delete_record`
- `has_pending_reset_request`
- `has_role`
- `increment_asset_view_count`
- `increment_combo`
- `increment_goal_progress`
- `increment_race_car_overtakes`
- `increment_race_car_wins`
- `increment_sales_streak`
- `increment_v4_callback_metric`
- `initialize_totp`
- `is_admin_or_manager`
- `is_authenticated`
- `is_email_opted_out`
- `is_ip_blocked`
- `is_ip_whitelisted`
- `is_known_device`
- `is_mfa_enabled`
- `is_salesperson_active`
- `log_audit_event`
- `log_data_access`
- `log_lead_stage_transition`
- `log_order_creation`
- `log_order_status_change`
- `log_rate_limit`
- `log_security_event`
- `maintain_sales_streaks`
- `manage_stock_on_sale`
- `manual_xp_adjustment`
- `mark_all_notifications_read`
- `mark_entity_for_reindex`
- `match_reply_to_enrollment`
- `match_semantic`
- `match_weekly_players`
- `match_whatsapp_reply_to_enrollment`
- `next_dialer_item`
- `notify_critical_moment_created`
- `notify_critical_winloss_pattern`
- `notify_sale_completion`
- `notify_salesperson_on_bonus_paid`
- `pick_step_variant`
- `process_audit_log`
- `process_lead_intent_event`
- `process_race_event_on_sale`
- `process_weekly_league_reset`
- `protect_pa_nudge_content`
- `purge_old_telemetry`
- `purge_telemetry_retention`
- `reassign_inactive_client_portfolio`
- `recompute_engagement_score`
- `record_email_opt_out`
- `record_engagement_signal`
- `record_failed_login_attempt`
- `record_lead_score_history`
- `record_login_attempt`
- `record_outbound_message`
- `record_price_history`
- `record_sale_stage_transition`
- `record_successful_login_attempt`
- `refresh_competitive_ranking`
- `refresh_monthly_sales_summary`
- `refresh_session`
- `regenerate_backup_codes`
- `register_race_daily_checkin`
- `release_edge_job_lock`
- `reset_pg_stat_statements_weekly`
- `resolve_weekly_matchups`
- `restore_deleted_record`
- `restore_record`
- `route_unassigned_client_portfolio`
- `schedule_next_qbrs`
- `search_call_library`
- `search_products_semantic`
- `search_products_vector`
- `send_notification`
- `set_mfa_preferred_method`
- `set_sdr_id_on_insert`
- `settle_performance_bets`
- `setup_sms_mfa`
- `snapshot_committee_coverage`
- `snapshot_engagement_score`
- `snapshot_race_daily`
- `soft_delete_record`
- `spin_prize_wheel`
- `sync_battle_score`
- `sync_challenge_progress`
- `sync_performance_bets`
- `sync_quote_from_webhook`
- `sync_quote_to_sale_status`
- `sync_territory_ownership`
- `sync_total_xp`
- `sync_weekly_xp`
- `toggle_workflow_active`
- `track_deal_health_change`
- `transition_commission_status`
- `transition_sale_status`
- `trg_activities_auto_pause_sequences`
- `trg_deal_stage_history`
- `trg_invalidate_forecast_narrative_cache`
- `trg_recompute_engagement`
- `trg_refresh_ranking_on_sale`
- `trigger_campaign_health_alert`
- `trigger_detect_client_churn_alerts`
- `trigger_generate_urgent_client_tasks`
- `trigger_internal_edge_job`
- `trigger_recalculate_deal_health`
- `trigger_refresh_monthly_summary`
- `trigger_update_performance_bets`
- `trigger_update_territories`
- `try_edge_job_lock`
- `unlock_race_item`
- `update_call_recording_diarization`
- `update_call_recording_summary`
- `update_call_recording_transcript`
- `update_client_portfolio_status`
- `update_own_profile`
- `update_own_sale`
- `update_performance_bet_progress`
- `update_territory_conquests`
- `update_user_mfa_settings`
- `upsert_client_from_quote`
- `upsert_semantic_entry`
- `user_owns_engagement_contact`
- `user_owns_sequence_step`
- `validate_api_token`
- `validate_race_event`
- `validate_session`
- `verify_and_enable_sms`
- `verify_and_enable_totp`
- `verify_mfa_code`
- `verify_reauth_request`
- `win_rate_breakdown`

## Edge functions públicas (sem JWT — qualquer um chama)

- `campaign-health-alert`
- `detect-client-churn-alerts`
- `generate-urgent-client-tasks`
- `notify-v4-quote-status`
- `check-v4-callback-alerts`
- `cron-failure-alerter`
- `process-call-recording-ingest`
- `edge-retry-threshold-alert`
- `deal-risk-digest`
- `email-bulk-retry`
- `log-web-vitals`
- `receive-quote-sync`
- `receive-quote-webhook`
- `report-embed-public`
- `email-unsubscribe`
- `inbound-email-webhook`
- `bitrix24-oauth`
- `whatsapp-inbound-webhook`
- `multichannel-status-webhook`
- `twilio-call-status`
- `twilio-call-twiml`
- `health`

## Rotas protegidas no front

| Rota | Guard | Roles | Arquivo |
|---|---|---|---|
| /acompanhamento-pedidos | ProtectedRoute |  | `src/routes/AppRoutes.tsx` |
| /acompanhamento-pedidos/:id | ProtectedRoute |  | `src/routes/AppRoutes.tsx` |
| /app | ProtectedRoute |  | `scripts/ai-context/gerar.unit.mjs` |
| /meus-pedidos/:id | ProtectedRoute |  | `src/routes/AppRoutes.tsx` |
| /race-arena/tv | ProtectedRoute |  | `src/routes/AppRoutes.tsx` |
| /relatorios/vendas | ProtectedRoute |  | `src/routes/AppRoutes.tsx` |

Guards usados: Protected, ProtectedRoute

Middleware matcher (Next.js): nenhum

## Grants / Revokes (agrupados por role e privilégio)

| Ação | Para/De | Privilégios | Objetos |
|---|---|---|---|
| grant | anon | execute | `fn_test_cleanup_dedupe_privileges`, `get_current_salesperson_id`, `get_user_role`, `is_admin_or_manager`, `is_admin_or_manager` |
| grant | anon, authenticated | execute | `get_embedded_report_by_token`, `get_current_salesperson_id`, `is_admin_or_manager`, `is_admin_or_manager`, `get_current_salesperson_id` |
| grant | anon, authenticated | select | `race_spectator_view`, `mv_competitive_ranking`, `race_spectator_view` |
| grant | anon, authenticated, service_role | execute | `get_login_lockout_status`, `record_failed_login_attempt` |
| grant | authenticated | execute | `compute_cohort_retention`, `get_semantic_coverage`, `mark_entity_for_reindex`, `auto_promote_sequence_winners`, `get_bulk_job_summary`, `get_client_purchase_heatmap`, `get_purchase_intelligence_summary`, `finalize_race_season`, `snapshot_race_daily`, `register_race_daily_checkin`, `log_audit_event`, `get_current_salesperson_id`, `has_role`, `is_admin_or_manager`, `public` … +33 |
| grant | authenticated | insert | `email_opt_outs` |
| grant | authenticated | select | `salespeople_public`, `salespeople_public`, `salespeople_public`, `salespeople_public`, `salespeople_public`, `salespeople_public`, `client_purchase_seasonality`, `coaching_impact_metrics`, `revenue_forecast_view`, `conversation_insights_summary`, `race_rivalries_view`, `mv_competitive_ranking`, `competitive_ranking`, `web_vitals_samples`, `web_vitals_p75_last7d` … +41 |
| grant | authenticated | select, delete | `email_opt_outs` |
| grant | authenticated | select, insert | `call_recording_ingest_jobs` |
| grant | authenticated | select, insert, update | `password_reset_requests`, `password_reset_requests`, `v4_callback_alerts`, `personal_assistant_nudges` |
| grant | authenticated | select, insert, update, delete | `external_seller_map`, `v4_callback_dead_letters`, `v4_callback_alert_settings`, `personal_assistant_briefings`, `commission_bonuses`, `commission_bonus_awards`, `client_churn_alerts_state` |
| grant | authenticated | select, update | `slow_query_alerts` |
| grant | authenticated, anon | execute | `get_current_salesperson_id` |
| grant | authenticated, anon, service_role | execute | `fn_cron_expected_interval`, `fn_cron_stalled_threshold`, `fn_test_simulate_stalled_check`, `fn_test_cleanup_cron_alerts`, `fn_test_backdate_cron_alert`, `fn_test_mark_cron_failure` |
| grant | authenticated, service_role | execute | `compute_optimal_send_time`, `record_engagement_signal`, `get_global_send_time_stats`, `get_client_top_products`, `get_industry_top_products`, `get_industry_benchmark_stats`, `get_client_seasonality`, `get_industry_seasonality`, `get_dashboard_kpis`, `fn_test_cleanup_dedupe_privileges`, `fn_list_cron_jobs`, `fn_convert_quote_to_sale`, `fn_convert_quote_to_sale`, `fn_convert_quote_to_sale`, `fn_convert_quote_to_sale` … +57 |
| grant | authenticated, service_role | select | `v_quote_conversion_history`, `v_quote_conversion_metrics_daily`, `activities_active`, `clients_active`, `tasks_active`, `v_active_activities`, `v_active_clients`, `v_active_products`, `v_active_suppliers`, `v_active_teams`, `mv_competitive_ranking` |
| grant | authenticated, service_role | usage, select | `orders_conversion_seq` |
| grant | postgres, service_role | execute | `log_audit_event` |
| grant | service_role | all | `web_vitals_samples`, `password_reset_requests`, `mv_competitive_ranking`, `competitive_ranking`, `password_reset_requests`, `external_seller_map`, `v4_callback_dead_letters`, `v4_callback_metrics`, `v4_callback_alert_settings`, `v4_callback_alerts`, `webhook_inbound_dedupe`, `quote_sync_inbound_log`, `quotes_inbound`, `webhook_inbound_log`, `maintenance_log` … +28 |
| grant | service_role | execute | `increment_race_car_wins`, `increment_race_car_overtakes`, `public`, `public`, `upsert_client_from_quote`, `upsert_client_from_quote`, `convert_quote_to_order`, `enqueue_v4_callback`, `auto_add_client_to_portfolio`, `increment_v4_callback_metric`, `fn_cleanup_webhook_dedupe`, `fn_cleanup_webhook_dedupe`, `fn_auto_map_inbound_seller`, `fn_convert_quote_to_sale`, `fn_convert_quote_to_sale` … +66 |
| grant | service_role | select | `v_quote_to_sale_invariants`, `v_security_definer_exposure`, `v_platform_wal_health`, `v_platform_slo`, `v_web_vitals_p75`, `sales_with_markup`, `v_deleted_clients`, `sales_with_markup`, `v_quote_to_sale_invariants` |
| revoke | PUBLIC | all | `get_semantic_coverage`, `mark_entity_for_reindex`, `auto_promote_sequence_winners`, `increment_race_car_wins`, `increment_race_car_overtakes`, `increment_v4_callback_metric`, `fn_cleanup_webhook_dedupe`, `webhook_inbound_dedupe`, `v_platform_slo`, `dequeue_call_recording_ingest_jobs`, `complete_call_recording_ingest_job`, `record_login_attempt`, `fn_cleanup_webhook_dedupe`, `award_bonus_if_eligible`, `notify_salesperson_on_bonus_paid` … +8 |
| revoke | PUBLIC | execute | `public`, `disable_totp`, `initialize_totp`, `disable_sms`, `has_pending_reset_request`, `get_mfa_status`, `public`, `public`, `fn_cleanup_webhook_dedupe`, `fn_auto_map_inbound_seller`, `detect_stalled_cron_jobs`, `verify_reauth_request`, `get_mfa_status` |
| revoke | PUBLIC, anon | all | `get_dashboard_kpis`, `fn_test_cleanup_dedupe_privileges`, `fn_convert_quote_to_sale`, `fn_convert_quote_to_sale`, `orders_conversion_seq`, `fn_convert_quote_to_sale`, `fn_admin_platform_slo`, `fn_record_conversion_attempt`, `v_quote_conversion_history`, `v_quote_conversion_metrics_daily`, `fn_admin_conversion_trail`, `fn_admin_cleanup_stale_logs`, `fn_admin_web_vitals_p75`, `fn_admin_reset_circuit`, `admin_get_cron_job_stats` … +55 |
| revoke | PUBLIC, anon | execute | `fn_list_cron_jobs`, `fn_convert_quote_to_sale`, `fn_convert_quote_to_sale`, `fn_convert_quote_to_sale`, `fn_convert_quote_to_sale`, `fn_get_orders_conversion_seq_last`, `fn_backfill_orders_conversion_seq`, `fn_admin_security_definer_exposure`, `fn_admin_wal_health`, `compute_salesperson_retention_cohort`, `compute_salesperson_retention_cohort` |
| revoke | PUBLIC, anon, authenticated | all | `private.add_salesperson_xp`, `private.refresh_competitive_ranking`, `private.refresh_monthly_sales_summary`, `private.snapshot_race_daily`, `private.award_achievement_if_not_exists`, `private.check_is_first_activation`, `private.update_performance_bet_progress`, `private.update_territory_conquests`, `upsert_client_from_quote`, `convert_quote_to_order`, `enqueue_v4_callback`, `auto_add_client_to_portfolio`, `v_quote_to_sale_invariants`, `v_security_definer_exposure`, `v_platform_wal_health` … +67 |
| revoke | PUBLIC, anon, authenticated | execute | `check_battle_achievements`, `compute_scheduled_report_next_run`, `fn_calculate_icp_score`, `increment_asset_view_count`, `maintain_sales_streaks`, `manage_stock_on_sale`, `generate_mfa_backup_codes`, `get_current_user_email`, `record_engagement_signal`, `is_authenticated`, `backfill_orders_conversion_seq`, `fn_slo_burn_rate`, `fn_check_slo_burn_rate`, `increment_race_car_wins`, `increment_race_car_overtakes` … +6 |
| revoke | PUBLIC, anon, authenticated | insert, update, delete | `maintenance_log` |
| revoke | anon | all | `salespeople_public`, `salespeople_public`, `salespeople_public`, `fn_cleanup_webhook_dedupe`, `webhook_inbound_dedupe`, `fn_cleanup_webhook_dedupe`, `edge_call_failures` |
| revoke | anon | execute | `public`, `public`, `get_current_salesperson_id`, `handle_sale_commissions`, `set_sdr_id_on_insert`, `fn_cleanup_webhook_dedupe`, `fn_auto_map_inbound_seller`, `log_audit_event`, `verify_reauth_request`, `get_mfa_status` |
| revoke | anon | select | `monthly_sales_summary`, `territories` |
| revoke | anon, authenticated | all | `mv_competitive_ranking`, `mv_competitive_ranking`, `mv_competitive_ranking`, `geocode_cache` |
| revoke | anon, authenticated | execute | `detect_stalled_cron_jobs` |
| revoke | anon, authenticated | insert, update | `quotes_inbound` |
| revoke | anon, authenticated | truncate | `public` |
| revoke | authenticated | all | `fn_cleanup_webhook_dedupe`, `webhook_inbound_dedupe`, `fn_cleanup_webhook_dedupe` |
| revoke | authenticated | execute | `log_audit_event`, `fn_cleanup_webhook_dedupe`, `fn_auto_map_inbound_seller` |
| revoke | authenticated | insert, update, delete, truncate, references, trigger | `maintenance_log`, `login_attempts` |
| revoke | public | all | `fn_admin_list_dead_letter_ingest_jobs`, `fn_admin_replay_dead_letter_ingest_job`, `fn_admin_cron_alert_breakdown`, `fn_gc_call_recording_ingest_jobs` |
| revoke | public | execute | `log_audit_event`, `get_current_salesperson_id`, `has_role`, `is_admin_or_manager`, `log_audit_event` |

## Riscos de acesso detectados

| Tabela | Problema | Arquivos |
|---|---|---|
| `app_config` | RLS ligado sem nenhuma política → só service_role acessa |  |
| `chat_messages` | front faz DELETE mas nenhuma política RLS permite DELETE → vai falhar/retornar vazio para usuários | `src/hooks/sales/useSalesAssistant.ts` |
| `client_portfolio` | front faz UPDATE mas nenhuma política RLS permite UPDATE → vai falhar/retornar vazio para usuários | `src/hooks/crm/useClientPortfolio.ts` |
| `daily_challenge_rotations` | RLS ligado sem nenhuma política → só service_role acessa |  |
| `follow_up_audit_logs` | front faz UPDATE mas nenhuma política RLS permite UPDATE → vai falhar/retornar vazio para usuários | `src/pages/FollowUpAudit.tsx` |
| `geo_access_logs` | acessada do front (1 arquivo(s)) sem RLS (não encontrado) | `src/components/security/GeoBlockingManager.tsx` |
| `geo_blocked_regions` | acessada do front (2 arquivo(s)) sem RLS (não encontrado) | `src/components/security/GeoBlockingManager.tsx`<br>`src/components/security/GeoBlockingMap.tsx` |
| `geocode_cache` | RLS ligado sem nenhuma política → só service_role acessa |  |
| `integration_logs` | front faz INSERT mas nenhuma política RLS permite INSERT → vai falhar/retornar vazio para usuários | `src/components/dashboard/IntegrationStatusPanel.tsx` |
| `sale_notifications_audit` | RLS ligado sem nenhuma política → só service_role acessa | `src/hooks/useSaleNotificationAudits.ts` |

## Multi-tenancy

- Chave de tenant: **`account_id`** presente em 12 tabela(s): `sales`, `account_contacts`, `account_activities`, `support_tickets`, `renewals`, `product_usage_events`, `product_usage_summary`, `onboarding_journeys`, `expansion_opportunities`, `csat_ces_surveys`, `qbr_schedule`, `account_plans`
- Cobertura: 3% das tabelas. Abaixo de 60% — isolamento provavelmente por usuário (auth.uid()) ou misto; não flagado por tabela.

## Soft delete (registros 'apagados' continuam na tabela — filtre!)

| Tabela | Coluna |
|---|---|
| `sales` | `deleted_at` |
| `salespeople` | `is_active` |
| `notification_preferences` | `is_active` |
| `tasks` | `deleted_at` |
| `activities` | `deleted_at` |
| `cadences` | `is_active` |
| `clients` | `deleted_at` |
| `products` | `deleted_at` |
| `teams` | `is_active` |
| `teams` | `deleted_at` |
| `client_portfolio` | `is_active` |
| `client_portfolio` | `deleted_at` |
| `weekly_challenges` | `is_active` |
| `daily_challenges` | `is_active` |
| `suppliers` | `is_active` |
| `suppliers` | `deleted_at` |
| `deals` | `deleted_at` |
| `rate_limit_settings` | `is_active` |
| `webhooks` | `is_active` |
| `notifications` | `archived_at` |
| `experiments` | `is_active` |
| `quotes` | `deleted_at` |
| `workflow_rules` | `is_active` |
| `active_power_ups` | `is_active` |
| `api_tokens` | `is_active` |
| `team_custom_fields` | `is_active` |
| `message_templates` | `is_active` |
| `pipelines` | `is_active` |
| `commission_rules` | `is_active` |
| `approval_workflows` | `is_active` |
| `sla_policies` | `is_active` |
| `lead_routing_rules` | `is_active` |
| `workflows` | `is_active` |
| `cadence_enrollment_rules` | `is_active` |
| `automation_workflows` | `is_active` |
| `sales_enablement_assets` | `is_active` |
| `expansion_playbooks` | `is_active` |
| `qbr_schedule` | `is_active` |
| `report_schedules` | `is_active` |
| `embedded_report_tokens` | `is_active` |
| `dialer_queues` | `is_active` |
| `competitors_registry` | `is_active` |
| `task_catalog` | `active` |
| `winloss_webhook_subscriptions` | `active` |
| `whatsapp_template_versions` | `is_active` |
| `follow_up_templates` | `is_active` |
| `cadence_funnel_rules` | `is_active` |
| `sdr_alert_configs` | `is_active` |
| `lead_source_configs` | `is_active` |
| `price_protection_rules` | `is_active` |
| `coaching_scorecard_config` | `is_active` |
| `call_intelligence_triggers` | `is_active` |
| `pricing_rules` | `active` |
| `v4_callback_alert_settings` | `is_active` |
| `commission_bonuses` | `is_active` |
| `geo_blocked_regions` | `is_active` |

## Auditoria (colunas de rastreio)

| Tabela | Colunas |
|---|---|
| `saved_filters` | `created_at`, `updated_at` |
| `audit_log` | `created_at` |
| `sales` | `created_at`, `deleted_by`, `updated_at` |
| `daily_metrics` | `created_at` |
| `category_metrics` | `created_at` |
| `salespeople` | `created_at`, `updated_at` |
| `sales_goals` | `created_at` |
| `deal_outcomes` | `created_at` |
| `objections_library` | `created_at`, `created_by`, `updated_at` |
| `notification_preferences` | `created_at`, `updated_at` |
| `tasks` | `created_at`, `deleted_by`, `updated_at` |
| `playbooks` | `created_at`, `updated_at` |
| `playbook_items` | `created_at` |
| `lead_scores` | `created_at`, `updated_at` |
| `activities` | `created_at`, `deleted_by` |
| `cadences` | `created_at`, `created_by`, `updated_at` |
| `cadence_steps` | `created_at` |
| `prospect_cadences` | `created_at`, `updated_at` |
| `cadence_tasks` | `created_at` |
| `activity_goals` | `created_at`, `updated_at` |
| `achievements` | `created_at` |
| `salesperson_xp` | `created_at`, `updated_at` |
| `xp_history` | `created_at` |
| `clients` | `created_at`, `deleted_by`, `updated_at` |
| `products` | `created_at`, `deleted_by`, `updated_at` |
| `user_roles` | `created_at`, `updated_at` |
| `access_denied_logs` | `created_at` |
| `security_alert_settings` | `created_at`, `updated_at` |
| `security_alert_history` | `created_at` |
| `circuit_breaker_events` | `created_at` |
| `teams` | `created_at`, `deleted_by`, `updated_at` |
| `team_closers` | `created_at` |
| `icp_data` | `created_at`, `updated_at` |
| `client_portfolio` | `created_at`, `deleted_by`, `updated_at` |
| `lead_routing_log` | `created_at` |
| `portfolio_settings` | `updated_at` |
| `bitrix24_sync_logs` | `created_at` |
| `sdr_alert_history` | `created_at` |
| `email_logs` | `created_at` |
| `chat_conversations` | `created_at`, `updated_at` |
| `chat_messages` | `created_at` |
| `deal_chat_history` | `created_at` |
| `weekly_challenges` | `created_at`, `updated_at` |
| `challenge_progress` | `created_at`, `updated_at` |
| `daily_challenges` | `created_at`, `updated_at` |
| `daily_challenge_progress` | `created_at`, `updated_at` |
| `daily_streak_achievements` | `created_at` |
| `push_subscriptions` | `created_at`, `updated_at` |
| `demand_forecasts` | `created_at`, `updated_at` |
| `inventory_levels` | `created_at`, `updated_at` |
| `stock_movements` | `created_at` |
| `suppliers` | `created_at`, `deleted_by`, `updated_at` |
| `supplier_products` | `created_at`, `updated_at` |
| `supplier_orders` | `created_at`, `created_by`, `updated_at` |
| `supplier_order_items` | `created_at` |
| `supplier_risk_assessments` | `created_at` |
| `digital_signatures` | `created_at`, `created_by`, `updated_at` |
| `document_signers` | `created_at` |
| `price_history` | `created_at` |
| `price_alerts` | `created_at` |
| `login_attempts` | `created_at` |
| `rate_limit_logs` | `created_at` |
| `blocked_ips` | `created_at`, `updated_at` |
| `ip_whitelist` | `created_at`, `updated_at` |
| `rate_limit_settings` | `created_at`, `updated_at` |
| `active_sessions` | `created_at` |
| `user_mfa_settings` | `created_at`, `updated_at` |
| `mfa_verification_attempts` | `created_at` |
| `sms_verification_codes` | `created_at` |
| `reauthentication_requests` | `created_at` |
| `known_devices` | `created_at` |
| `login_alerts` | `created_at` |
| `webauthn_credentials` | `created_at` |
| `webauthn_challenges` | `created_at` |
| `permissions` | `created_at` |
| `role_permissions` | `created_at` |
| `password_reset_requests` | `created_at`, `updated_at` |
| `salesperson_preferences` | `created_at`, `updated_at` |
| `user_2fa` | `created_at`, `updated_at` |
| `webhooks` | `created_at`, `created_by`, `updated_at` |
| `webhook_logs` | `created_at` |
| `webhook_events` | `created_at` |
| `call_tracking` | `created_at` |
| `notifications` | `created_at` |
| `experiments` | `created_at` |
| `password_history` | `created_at` |
| `session_activity` | `created_at` |
| `data_access_log` | `created_at` |
| `user_2fa_log` | `created_at` |
| `user_2fa_backup_codes` | `created_at` |
| `security_events` | `created_at` |
| `ab_tests` | `created_at` |
| `feature_flags` | `created_at`, `updated_at` |
| `quotes` | `created_at`, `created_by`, `deleted_by`, `updated_at` |
| `quote_sync_logs` | `created_at` |
| `workflow_rules` | `created_at`, `updated_at` |
| `email_tracking_events` | `created_at` |
| `dashboard_layouts` | `created_at`, `updated_at` |
| `victory_feed` | `created_at` |
| `feed_reactions` | `created_at` |
| `feed_comments` | `created_at` |
| `sales_battles` | `created_at`, `created_by` |
| `competitive_seasons` | `created_at` |
| `rank_change_notifications` | `created_at` |
| `salesperson_leagues` | `created_at`, `updated_at` |
| `sales_streaks` | `updated_at` |
| `weekly_matchups` | `created_at` |
| `available_spins` | `updated_at` |
| `collectible_badges` | `created_at` |
| `progressive_goals` | `created_at`, `updated_at` |
| `competitive_chat_messages` | `created_at` |
| `kudos` | `created_at` |
| `tournaments` | `created_at`, `created_by` |
| `tournament_participants` | `created_at` |
| `tournament_matches` | `created_at` |
| `performance_bets` | `created_at` |
| `sales_territories` | `created_at`, `updated_at` |
| `territory_history` | `created_at` |
| `query_telemetry` | `created_at` |
| `api_tokens` | `created_at`, `created_by` |
| `score_change_logs` | `created_at` |
| `team_custom_fields` | `created_at`, `updated_at` |
| `salesperson_custom_field_values` | `updated_at` |
| `mood_entries` | `created_at` |
| `combo_tracking` | `created_at`, `updated_at` |
| `leagues` | `created_at` |
| `league_members` | `updated_at` |
| `page_analytics` | `created_at` |
| `message_templates` | `created_at`, `updated_at` |
| `channel_interactions` | `created_at` |
| `error_logs` | `created_at` |
| `pipelines` | `created_at`, `updated_at` |
| `pipeline_stages` | `created_at` |
| `nps_surveys` | `created_at` |
| `commission_rules` | `created_at`, `created_by`, `updated_at` |
| `commissions` | `created_at`, `updated_at` |
| `agenda_events` | `created_at`, `updated_at` |
| `approval_workflows` | `created_at`, `created_by`, `updated_at` |
| `approval_requests` | `created_at`, `updated_at` |
| `webhook_deliveries` | `created_at` |
| `audit_logs` | `created_at` |
| `sla_policies` | `created_at`, `created_by`, `updated_at` |
| `sla_violations` | `created_at`, `updated_at` |
| `lead_routing_rules` | `created_at`, `created_by`, `updated_at` |
| `workflows` | `created_at`, `created_by`, `updated_at` |
| `cadence_enrollment_rules` | `created_at`, `created_by`, `updated_at` |
| `cadence_ab_tests` | `created_at`, `created_by`, `updated_at` |
| `call_recordings` | `created_at`, `updated_at` |
| `call_transcripts` | `created_at` |
| `call_insights` | `created_at` |
| `deal_health_scores` | `created_at`, `updated_at` |
| `accounts` | `created_at`, `updated_at` |
| `account_contacts` | `created_at`, `updated_at` |
| `account_activities` | `created_at` |
| `automation_workflows` | `created_at`, `created_by`, `updated_at` |
| `sales_enablement_assets` | `created_at`, `created_by`, `updated_at` |
| `asset_usage_logs` | `created_at` |
| `buying_committee_members` | `created_at`, `created_by`, `updated_at` |
| `support_tickets` | `created_at`, `updated_at` |
| `renewals` | `created_at`, `updated_at` |
| `onboarding_journeys` | `created_at`, `updated_at` |
| `onboarding_steps` | `created_at` |
| `expansion_playbooks` | `created_at`, `updated_at` |
| `expansion_opportunities` | `created_at`, `updated_at` |
| `qbr_schedule` | `created_at`, `updated_at` |
| `custom_reports` | `created_at`, `updated_at` |
| `report_schedules` | `created_at`, `created_by`, `updated_at` |
| `embedded_report_tokens` | `created_at`, `created_by` |
| `cohort_analyses` | `created_at`, `updated_at` |
| `scheduled_reports` | `created_at`, `created_by`, `updated_at` |
| `report_embed_tokens` | `created_at`, `created_by` |
| `sequences` | `created_at`, `updated_at` |
| `sequence_steps` | `created_at` |
| `sequence_enrollments` | `created_at`, `updated_at` |
| `sequence_step_executions` | `created_at` |
| `sequence_step_variants` | `created_at` |
| `contact_send_time_profile` | `updated_at` |
| `contact_engagement_score` | `updated_at` |
| `engagement_score_history` | `created_at` |
| `inbound_reply_events` | `created_at` |
| `channel_credentials` | `created_at`, `updated_at` |
| `outbound_messages` | `created_at`, `updated_at` |
| `semantic_index` | `updated_at` |
| `ai_agent_runs` | `created_at`, `updated_at` |
| `lead_score_explanations` | `created_at`, `updated_at` |
| `email_bulk_jobs` | `created_at`, `updated_at` |
| `email_bulk_drafts` | `created_at`, `updated_at` |
| `send_time_profiles` | `created_at` |
| `scheduled_sends` | `created_at` |
| `email_engagement_scores` | `created_at` |
| `dialer_queues` | `created_at`, `updated_at` |
| `call_logs` | `created_at` |
| `twilio_call_sessions` | `created_at` |
| `competitors_registry` | `created_at`, `updated_at` |
| `competitor_mentions` | `created_at` |
| `coaching_actions` | `created_at`, `updated_at` |
| `call_sentiment_timeline` | `created_at` |
| `call_critical_moments` | `created_at`, `updated_at` |
| `critical_moment_notifications` | `created_at` |
| `deal_stakeholders` | `created_at`, `updated_at` |
| `deal_committee_coverage` | `created_at`, `updated_at` |
| `deal_velocity_predictions` | `created_at`, `updated_at` |
| `stage_velocity_baselines` | `created_at`, `updated_at` |
| `stage_conversion_metrics` | `created_at`, `updated_at` |
| `stage_bottleneck_insights` | `created_at`, `updated_at` |
| `revenue_forecasts` | `created_at`, `updated_at` |
| `forecast_deal_contributions` | `created_at` |
| `race_seasons` | `created_at`, `updated_at` |
| `race_cars` | `created_at`, `updated_at` |
| `race_events` | `created_at` |
| `pipeline_coverage_snapshots` | `created_at` |
| `pipeline_coverage_recommendations` | `created_at` |
| `quota_attainment_alerts` | `created_at` |
| `call_metric_benchmarks` | `updated_at` |
| `call_questions` | `created_at` |
| `call_objections` | `created_at` |
| `objection_library` | `updated_at` |
| `committee_extraction_runs` | `created_at` |
| `deal_stage_transitions` | `created_at` |
| `win_loss_analyses` | `created_at` |
| `win_loss_insights` | `created_at` |
| `forecast_snapshots` | `created_at` |
| `forecast_accuracy` | `created_at` |
| `quota_attainment_actions` | `created_at` |
| `skill_assessments` | `created_at`, `updated_at` |
| `skill_development_tracks` | `created_at`, `updated_at` |
| `ranking_notifications` | `created_at` |
| `coaching_sessions` | `created_at`, `updated_at` |
| `race_scoring_rules` | `created_at` |
| `conversation_analyses` | `created_at` |
| `executive_briefings` | `created_at`, `created_by` |
| `task_catalog` | `created_at`, `created_by`, `updated_at` |
| `task_assignments` | `created_at`, `updated_at` |
| `xp_adjustments` | `created_at` |
| `squads` | `created_at`, `created_by`, `updated_at` |
| `race_daily_snapshots` | `created_at` |
| `race_user_daily_checkins` | `created_at` |
| `race_reactions` | `created_at` |
| `race_teams` | `created_at`, `updated_at` |
| `race_rivalries_persistent` | `created_at`, `updated_at` |
| `race_overlay_telemetry` | `created_at` |
| `race_user_preferences` | `created_at`, `updated_at` |
| `win_loss_insight_comments` | `created_at` |
| `user_winloss_preferences` | `updated_at` |
| `winloss_webhook_subscriptions` | `created_at`, `created_by` |
| `winloss_webhook_deliveries` | `created_at` |
| `winloss_webhook_dead_letters` | `created_at`, `updated_at` |
| `user_app_settings` | `created_at`, `updated_at` |
| `orders` | `created_at`, `updated_at` |
| `order_items` | `created_at` |
| `order_status_events` | `created_at` |
| `winloss_alert_settings` | `updated_at`, `updated_by` |
| `winloss_webhook_replay_audit` | `created_at` |
| `winloss_webhook_replay_invocations` | `created_at` |
| `winloss_webhook_dispatch_metrics` | `created_at` |
| `integration_connections` | `created_at`, `created_by`, `updated_at` |
| `integration_autotest_settings` | `updated_at`, `updated_by` |
| `salesperson_commission_configs` | `created_at`, `updated_at` |
| `commercial_approval_requests` | `created_at`, `updated_at` |
| `follow_up_settings` | `created_at`, `updated_at` |
| `follow_up_audit_logs` | `created_at` |
| `whatsapp_template_versions` | `created_at`, `created_by` |
| `follow_up_templates` | `created_at`, `created_by`, `updated_at` |
| `follow_up_territory_rules` | `created_at`, `updated_at` |
| `follow_up_notifications` | `created_at` |
| `intent_audit_logs` | `created_at` |
| `cadence_funnel_rules` | `created_at`, `updated_at` |
| `lead_detailed_logs` | `created_at`, `created_by` |
| `cadence_alert_templates` | `created_at`, `updated_at` |
| `cadence_outcome_rules` | `created_at`, `updated_at` |
| `duplicate_block_logs` | `created_at` |
| `client_interactions` | `created_at`, `created_by` |
| `product_stock_log` | `created_at` |
| `activity_audit_logs` | `created_at` |
| `sdr_alert_configs` | `created_at`, `updated_at` |
| `sdr_performance_settings` | `created_at`, `updated_at` |
| `mql_qualifications` | `created_at`, `updated_at` |
| `lead_source_configs` | `created_at` |
| `price_protection_rules` | `created_at` |
| `coaching_scorecard_config` | `created_at` |
| `call_intelligence_triggers` | `created_at` |
| `icp_parameters` | `created_at`, `updated_at` |
| `league_history` | `created_at` |
| `territories` | `updated_at` |
| `monthly_sales_summary` | `updated_at` |
| `sale_notifications_audit` | `created_at` |
| `enriched_company_intelligence` | `created_at`, `updated_at` |
| `buying_signals` | `created_at` |
| `person_intelligence` | `created_at`, `updated_at` |
| `account_plans` | `created_at`, `created_by`, `updated_at` |
| `cs_tickets` | `created_at`, `updated_at` |
| `client_renewals` | `created_at`, `updated_at` |
| `quote_items` | `created_at` |
| `pricing_rules` | `created_at` |
| `buying_committee` | `created_at`, `updated_at` |
| `pipeline_inspections` | `created_at` |
| `ai_sales_insights` | `created_at` |
| `whatsapp_conversations` | `created_at` |
| `web_vitals_samples` | `created_at` |
| `external_seller_map` | `created_at`, `updated_at` |
| … +36 linhas — lista completa em `context.json` | |

## Dados pessoais / sensíveis (LGPD — cuidado em logs, exports, prompts de IA)

| Tabela | Coluna |
|---|---|
| `audit_log` | `ip_address` |
| `salespeople` | `email` |
| `notification_preferences` | `email` |
| `clients` | `email` |
| `clients` | `phone` |
| `access_denied_logs` | `ip_address` |
| `suppliers` | `email` |
| `suppliers` | `phone` |
| `suppliers` | `address` |
| `suppliers` | `cnpj` |
| `document_signers` | `email` |
| `login_attempts` | `email` |
| `login_attempts` | `ip_address` |
| `blocked_ips` | `ip_address` |
| `ip_whitelist` | `ip_address` |
| `active_sessions` | `ip_address` |
| `mfa_verification_attempts` | `ip_address` |
| `reauthentication_requests` | `ip_address` |
| `known_devices` | `ip_address` |
| `login_alerts` | `ip_address` |
| `password_reset_requests` | `ip_address` |
| `session_activity` | `ip_address` |
| `user_2fa_log` | `ip_address` |
| `security_events` | `ip_address` |
| `audit_logs` | `ip_address` |
| `account_contacts` | `email` |
| `account_contacts` | `phone` |
| `deal_stakeholders` | `email` |
| `deal_stakeholders` | `phone` |
| `person_intelligence` | `email` |
| `website_visitor_logs` | `ip_address` |
| `email_opt_outs` | `email` |
| `geo_access_logs` | `ip_address` |

## Colunas de dinheiro (tipo importa: numeric ✅ / float ❌)

| Tabela | Coluna | Tipo |
|---|---|---|
| `sales` | `amount` | `DECIMAL(12,2)` |
| `sales` | `cost_source` | `string` |
| `sales` | `cost_synced_at` | `string` |
| `sales` | `total_cost` | `number` |
| `daily_metrics` | `total_sales` | `INTEGER` |
| `salespeople` | `commission_rate` | `DECIMAL(5,2)` |
| `salesperson_xp` | `total_xp` | `INTEGER` |
| `clients` | `total_value` | `NUMERIC` |
| `products` | `price` | `NUMERIC` |
| `products` | `cost_synced_at` | `string` |
| `supplier_orders` | `total_amount` | `NUMERIC(12,2)` |
| `supplier_order_items` | `total_price` | `NUMERIC(12,2)` |
| `price_history` | `price_change_percent` | `NUMERIC` |
| `price_alerts` | `price_change_percent` | `NUMERIC` |
| `quotes` | `total_value` | `NUMERIC` |
| `quotes` | `discount_amount` | `number` |
| `quotes` | `discount_percent` | `number` |
| `quotes` | `subtotal` | `number` |
| `progressive_goals` | `total_xp_earned` | `INTEGER` |
| `tournaments` | `total_rounds` | `INTEGER` |
| `sales_territories` | `total_revenue` | `NUMERIC` |
| `sales_territories` | `total_deals` | `INTEGER` |
| `commissions` | `commission_amount` | `NUMERIC(12,2)` |
| `approval_requests` | `discount_percentage` | `NUMERIC(5,2)` |
| `onboarding_journeys` | `total_steps` | `int` |
| `contact_engagement_score` | `total_opens` | `INTEGER` |
| `contact_engagement_score` | `total_clicks` | `INTEGER` |
| `contact_engagement_score` | `total_replies` | `INTEGER` |
| `email_engagement_scores` | `total_sent` | `INT` |
| `email_engagement_scores` | `total_opens` | `INT` |
| `email_engagement_scores` | `total_clicks` | `INT` |
| `email_engagement_scores` | `total_replies` | `INT` |
| `twilio_call_sessions` | `price` | `NUMERIC` |
| `race_cars` | `total_races` | `INT` |
| `race_cars` | `total_wins` | `INT` |
| `race_cars` | `total_overtakes` | `INT` |
| `call_question_analysis` | `total_questions` | `INT` |
| `call_objection_analysis` | `total_objections` | `int` |
| `win_loss_analyses` | `amount` | `numeric` |
| `ranking_notifications` | `total_sales` | `NUMERIC` |
| `xp_adjustments` | `amount` | `INTEGER` |
| `race_daily_snapshots` | `total_sales` | `NUMERIC` |
| `winloss_webhook_dead_letters` | `total_latency_ms` | `INTEGER` |
| `orders` | `subtotal` | `NUMERIC(12,2)` |
| `orders` | `shipping` | `NUMERIC(12,2)` |
| `orders` | `total` | `NUMERIC(12,2)` |
| `integration_autotest_jobs` | `total` | `INTEGER` |
| `competitors_pricing` | `price` | `DECIMAL(12,2)` |
| `territories` | `total_revenue` | `NUMERIC` |
| `territories` | `total_deals` | `INTEGER` |
| `enriched_company_intelligence` | `total_funding` | `TEXT` |
| `quote_items` | `discount_amount` | `NUMERIC(15,2)` |
| `quote_items` | `total_price` | `NUMERIC(15,2)` |
| `pricing_rules` | `discount_percentage` | `NUMERIC(5,2)` |
| `pipeline_inspections` | `amount_at_inspection` | `NUMERIC` |
| `quotes_inbound` | `total` | `NUMERIC(14,2)` |
| `slow_query_alerts` | `total_exec_ms` | `double` |
| `edge_retry_events` | `total_attempts` | `INTEGER` |
| `personal_assistant_nudges` | `feedback` | `TEXT` |
| `personal_assistant_nudges` | `feedback_at` | `TIMESTAMPTZ` |
