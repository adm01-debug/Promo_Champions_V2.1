# 07 · REGRAS DE NEGÓCIO

> Gerado automaticamente por AI Context Sync v1.3.2 · commit `21eae42a81` · branch `main` · 2026-11-13 05:35 UTC
> Não edite à mão — regras humanas vão em `manual/`.

## A. Regras escritas por humanos (`manual/` — prioridade máxima, nunca sobrescrito)

_Nenhum arquivo em `manual/`. Copie `manual/TEMPLATE-regras-de-negocio.md` para `manual/regras.md` e preencha._

## B. Quem pode ver/alterar o quê (RLS — conforme migrations do repo; schema real em `06`)

| Tabela | Política | Comando | Roles | Modo | USING | WITH CHECK |
|---|---|---|---|---|---|---|
| `saved_filters` | Users can view own filters | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `saved_filters` | Users can insert own filters | INSERT | public | permissive |  | `auth.uid() = user_id` |
| `saved_filters` | Users can update own filters | UPDATE | public | permissive | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `saved_filters` | Users can delete own filters | DELETE | public | permissive | `auth.uid() = user_id` |  |
| `entity_versions` | Users can insert versions | INSERT | public | permissive |  | `auth.uid() = changed_by OR changed_by IS NULL` |
| `saved_filters` | Users manage own filters | ALL | public | permissive | `auth.uid() = user_id` |  |
| `salespeople` | Users can delete own salesperson record | DELETE | authenticated | permissive | `auth_user_id = auth.uid()` |  |
| `achievements` | Authenticated users can read achievements | SELECT | authenticated | permissive | `true` |  |
| `salesperson_xp` | Authenticated users can read salesperson_xp | SELECT | authenticated | permissive | `true` |  |
| `cadence_steps` | Authenticated users can read cadence_steps | SELECT | authenticated | permissive | `true` |  |
| `cadences` | Authenticated users can read cadences | SELECT | authenticated | permissive | `true` |  |
| `category_metrics` | Authenticated users can read category_metrics | SELECT | authenticated | permissive | `true` |  |
| `products` | Authenticated users can read products | SELECT | authenticated | permissive | `true` |  |
| `playbooks` | Authenticated users can read playbooks | SELECT | authenticated | permissive | `true` |  |
| `playbook_items` | Authenticated users can read playbook_items | SELECT | authenticated | permissive | `true` |  |
| `objections_library` | Authenticated users can read objections_library | SELECT | authenticated | permissive | `true` |  |
| `user_roles` | Admins can manage all roles | ALL | authenticated | permissive | `public.has_role(auth.uid(), 'admin')` | `public.has_role(auth.uid(), 'admin')` |
| `access_denied_logs` | Admins can view access logs | SELECT | authenticated | permissive | `has_role(auth.uid(), 'admin')` |  |
| `access_denied_logs` | Authenticated users can log access denied | INSERT | authenticated | permissive |  | `user_id = auth.uid()` |
| `security_alert_settings` | Admins can view security settings | SELECT | authenticated | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `security_alert_settings` | Admins can update security settings | UPDATE | authenticated | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `security_alert_settings` | Admins can insert security settings | INSERT | authenticated | permissive |  | `public.is_admin_or_manager(auth.uid())` |
| `security_alert_history` | Admins can view alert history | SELECT | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `clients` | Admins and managers can insert clients | INSERT | public | permissive |  | `is_admin_or_manager(auth.uid())` |
| `clients` | Admins and managers can update clients | UPDATE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `clients` | Admins and managers can delete clients | DELETE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `products` | Admins and managers can insert products | INSERT | public | permissive |  | `is_admin_or_manager(auth.uid())` |
| `products` | Admins and managers can update products | UPDATE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `products` | Admins and managers can delete products | DELETE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `playbooks` | Admins and managers can insert playbooks | INSERT | public | permissive |  | `is_admin_or_manager(auth.uid())` |
| `playbooks` | Admins and managers can update playbooks | UPDATE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `playbooks` | Admins and managers can delete playbooks | DELETE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `playbook_items` | Admins and managers can insert playbook_items | INSERT | public | permissive |  | `is_admin_or_manager(auth.uid())` |
| `playbook_items` | Admins and managers can update playbook_items | UPDATE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `playbook_items` | Admins and managers can delete playbook_items | DELETE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `cadences` | Admins and managers can insert cadences | INSERT | public | permissive |  | `is_admin_or_manager(auth.uid())` |
| `cadences` | Admins and managers can update cadences | UPDATE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `cadences` | Admins and managers can delete cadences | DELETE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `cadence_steps` | Admins and managers can insert cadence_steps | INSERT | public | permissive |  | `is_admin_or_manager(auth.uid())` |
| `cadence_steps` | Admins and managers can update cadence_steps | UPDATE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `cadence_steps` | Admins and managers can delete cadence_steps | DELETE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `objections_library` | Admins and managers can insert objections_library | INSERT | public | permissive |  | `is_admin_or_manager(auth.uid())` |
| `objections_library` | Admins and managers can update objections_library | UPDATE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `objections_library` | Admins and managers can delete objections_library | DELETE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `circuit_breaker_events` | Admins and managers can view circuit breaker events | SELECT | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `circuit_breaker_events` | Admins can delete circuit breaker events | DELETE | public | permissive | `has_role(auth.uid(), 'admin'::app_role)` |  |
| `teams` | Admins and managers can insert teams | INSERT | public | permissive |  | `is_admin_or_manager(auth.uid())` |
| `teams` | Admins and managers can update teams | UPDATE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `teams` | Admins and managers can delete teams | DELETE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `team_closers` | Admins and managers can insert team_closers | INSERT | public | permissive |  | `is_admin_or_manager(auth.uid())` |
| `team_closers` | Admins and managers can delete team_closers | DELETE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `client_portfolio` | Admins and managers can delete client_portfolio | DELETE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `portfolio_settings` | Admins can manage portfolio_settings | ALL | public | permissive | `has_role(auth.uid(), 'admin')` | `has_role(auth.uid(), 'admin')` |
| `bitrix24_sync_logs` | Admins and managers can view sync logs | SELECT | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `daily_metrics` | Admins and managers can insert daily_metrics | INSERT | public | permissive |  | `is_admin_or_manager(auth.uid())` |
| `daily_metrics` | Admins and managers can update daily_metrics | UPDATE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `daily_metrics` | Admins and managers can delete daily_metrics | DELETE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `category_metrics` | Admins and managers can insert category_metrics | INSERT | public | permissive |  | `is_admin_or_manager(auth.uid())` |
| `category_metrics` | Admins and managers can update category_metrics | UPDATE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `category_metrics` | Admins and managers can delete category_metrics | DELETE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `email_logs` | Admins and managers can view email_logs | SELECT | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `deal_chat_history` | Users can delete own chat history | DELETE | public | permissive | `salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())` |  |
| `weekly_challenges` | Admins and managers can insert weekly_challenges | INSERT | public | permissive |  | `is_admin_or_manager(auth.uid())` |
| `weekly_challenges` | Admins and managers can update weekly_challenges | UPDATE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `weekly_challenges` | Admins and managers can delete weekly_challenges | DELETE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `daily_challenges` | Admins and managers can insert daily_challenges | INSERT | public | permissive |  | `is_admin_or_manager(auth.uid())` |
| `daily_challenges` | Admins and managers can update daily_challenges | UPDATE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `daily_challenges` | Admins and managers can delete daily_challenges | DELETE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `push_subscriptions` | Users can view their own push subscription | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `push_subscriptions` | Users can create their own push subscription | INSERT | public | permissive |  | `auth.uid() = user_id` |
| `push_subscriptions` | Users can update their own push subscription | UPDATE | public | permissive | `auth.uid() = user_id` |  |
| `push_subscriptions` | Users can delete their own push subscription | DELETE | public | permissive | `auth.uid() = user_id` |  |
| `demand_forecasts` | Authenticated users can view demand forecasts | SELECT | public | permissive | `public.is_authenticated()` |  |
| `demand_forecasts` | Admins and managers can insert demand forecasts | INSERT | public | permissive |  | `public.is_admin_or_manager(auth.uid())` |
| `demand_forecasts` | Admins and managers can update demand forecasts | UPDATE | public | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `demand_forecasts` | Admins and managers can delete demand forecasts | DELETE | public | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `inventory_levels` | Admins and managers can insert inventory levels | INSERT | public | permissive |  | `public.is_admin_or_manager(auth.uid())` |
| `inventory_levels` | Admins and managers can update inventory levels | UPDATE | public | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `inventory_levels` | Admins and managers can delete inventory levels | DELETE | public | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `stock_movements` | Admins and managers can insert stock movements | INSERT | public | permissive |  | `public.is_admin_or_manager(auth.uid())` |
| `suppliers` | Admins and managers can insert suppliers | INSERT | public | permissive |  | `public.is_admin_or_manager(auth.uid())` |
| `suppliers` | Admins and managers can update suppliers | UPDATE | public | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `suppliers` | Admins and managers can delete suppliers | DELETE | public | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `supplier_products` | Admins and managers can insert supplier_products | INSERT | public | permissive |  | `public.is_admin_or_manager(auth.uid())` |
| `supplier_products` | Admins and managers can update supplier_products | UPDATE | public | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `supplier_products` | Admins and managers can delete supplier_products | DELETE | public | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `supplier_orders` | Admins and managers can insert supplier_orders | INSERT | public | permissive |  | `public.is_admin_or_manager(auth.uid())` |
| `supplier_orders` | Admins and managers can update supplier_orders | UPDATE | public | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `supplier_orders` | Admins and managers can delete supplier_orders | DELETE | public | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `supplier_order_items` | Admins and managers can insert supplier_order_items | INSERT | public | permissive |  | `public.is_admin_or_manager(auth.uid())` |
| `supplier_risk_assessments` | Admins and managers can insert supplier_risk_assessments | INSERT | public | permissive |  | `public.is_admin_or_manager(auth.uid())` |
| `supplier_risk_assessments` | Admins and managers can update supplier_risk_assessments | UPDATE | public | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `digital_signatures` | Admins and managers can delete digital_signatures | DELETE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `document_signers` | Admins and managers can delete document_signers | DELETE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `deals` | Users can view active deals | SELECT | public | permissive | `deleted_at IS NULL AND ( true )` |  |
| `clients` | Admins can view deleted records | SELECT | public | permissive | `deleted_at IS NOT NULL AND EXISTS ( SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true )` |  |
| `deals` | Admins can view deleted deals | SELECT | public | permissive | `deleted_at IS NOT NULL AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true)` |  |
| `activities` | Admins can view deleted activities | SELECT | public | permissive | `deleted_at IS NOT NULL AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true)` |  |
| `products` | Admins can view deleted products | SELECT | public | permissive | `deleted_at IS NOT NULL AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true)` |  |
| `suppliers` | Admins can view deleted suppliers | SELECT | public | permissive | `deleted_at IS NOT NULL AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true)` |  |
| `teams` | Admins can view deleted teams | SELECT | public | permissive | `deleted_at IS NOT NULL AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND is_admin = true)` |  |
| `deals` | Users can read deals if has permission | SELECT | public | permissive | `has_permission(auth.uid(), 'deals', 'read') OR assigned_to = auth.uid()` |  |
| `deals` | Users can create deals if has permission | INSERT | public | permissive |  | `has_permission(auth.uid(), 'deals', 'create')` |
| `deals` | Users can update deals if has permission | UPDATE | public | permissive | `has_permission(auth.uid(), 'deals', 'update') OR assigned_to = auth.uid()` |  |
| `rate_limit_logs` | Admins can view rate_limit_logs | SELECT | public | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `blocked_ips` | Admins can manage blocked_ips | ALL | public | permissive | `public.has_role(auth.uid(), 'admin')` | `public.has_role(auth.uid(), 'admin')` |
| `ip_whitelist` | Admins can manage ip_whitelist | ALL | public | permissive | `public.has_role(auth.uid(), 'admin')` | `public.has_role(auth.uid(), 'admin')` |
| `rate_limit_settings` | Admins can manage rate_limit_settings | ALL | public | permissive | `public.has_role(auth.uid(), 'admin')` | `public.has_role(auth.uid(), 'admin')` |
| `active_sessions` | Users can view own sessions | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `active_sessions` | Admins can view all sessions | SELECT | public | permissive | `public.has_role(auth.uid(), 'admin')` |  |
| `user_mfa_settings` | Users can update own MFA settings | UPDATE | public | permissive | `auth.uid() = user_id` |  |
| `mfa_verification_attempts` | Users can view own MFA attempts | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `reauthentication_requests` | Users can view own reauth requests | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `reauthentication_requests` | Users can insert own reauth requests | INSERT | public | permissive |  | `auth.uid() = user_id` |
| `known_devices` | Users can view own devices | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `known_devices` | Users can insert own devices | INSERT | public | permissive |  | `auth.uid() = user_id` |
| `known_devices` | Users can update own devices | UPDATE | public | permissive | `auth.uid() = user_id` |  |
| `known_devices` | Users can delete own devices | DELETE | public | permissive | `auth.uid() = user_id` |  |
| `login_alerts` | Users can view own alerts | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `login_alerts` | Users can update own alerts | UPDATE | public | permissive | `auth.uid() = user_id` |  |
| `webauthn_credentials` | Users can view own webauthn credentials | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `webauthn_credentials` | Users can insert own webauthn credentials | INSERT | public | permissive |  | `auth.uid() = user_id` |
| `webauthn_credentials` | Users can update own webauthn credentials | UPDATE | public | permissive | `auth.uid() = user_id` |  |
| `webauthn_credentials` | Users can delete own webauthn credentials | DELETE | public | permissive | `auth.uid() = user_id` |  |
| `permissions` | Admins can manage permissions | ALL | public | permissive | `public.has_role(auth.uid(), 'admin')` | `public.has_role(auth.uid(), 'admin')` |
| `role_permissions` | Admins can manage role_permissions | ALL | public | permissive | `public.has_role(auth.uid(), 'admin')` | `public.has_role(auth.uid(), 'admin')` |
| `salesperson_preferences` | Users can read own preferences | SELECT | public | permissive | `salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())` |  |
| `salesperson_preferences` | Users can insert own preferences | INSERT | public | permissive |  | `salesperson_id = get_current_salesperson_id()` |
| `salesperson_preferences` | Users can update own preferences | UPDATE | public | permissive | `salesperson_id = get_current_salesperson_id()` |  |
| `sales` | Users can read own sales or admins all | SELECT | public | permissive | `salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())` |  |
| `sales` | Users can insert own sales | INSERT | public | permissive |  | `salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())` |
| `sales` | Users can delete own sales | DELETE | public | permissive | `salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())` |  |
| `activities` | Users can read own activities or admins all | SELECT | public | permissive | `salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())` |  |
| `sales_goals` | Users can read own goals or admins all | SELECT | public | permissive | `salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())` |  |
| `sales_goals` | Admins can insert goals | INSERT | public | permissive |  | `is_admin_or_manager(auth.uid())` |
| `sales_goals` | Admins can update goals | UPDATE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `sales_goals` | Admins can delete goals | DELETE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `deal_outcomes` | Users can read own outcomes or admins all | SELECT | public | permissive | `salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())` |  |
| `deal_outcomes` | Users can insert own outcomes | INSERT | public | permissive |  | `salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())` |
| `deal_outcomes` | Users can update own outcomes | UPDATE | public | permissive | `salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())` |  |
| `deal_outcomes` | Users can delete own outcomes | DELETE | public | permissive | `salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())` |  |
| `lead_scores` | Users can read own lead scores or admins all | SELECT | public | permissive | `EXISTS ( SELECT 1 FROM public.sales s WHERE s.id = lead_scores.sale_id AND (s.salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())) )` |  |
| `lead_scores` | Users can insert lead scores for own sales | INSERT | public | permissive |  | `EXISTS ( SELECT 1 FROM public.sales s WHERE s.id = lead_scores.sale_id AND (s.salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())) )` |
| `lead_scores` | Users can update own lead scores | UPDATE | public | permissive | `EXISTS ( SELECT 1 FROM public.sales s WHERE s.id = lead_scores.sale_id AND (s.salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())) )` |  |
| `lead_scores` | Users can delete own lead scores | DELETE | public | permissive | `EXISTS ( SELECT 1 FROM public.sales s WHERE s.id = lead_scores.sale_id AND (s.salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())) )` |  |
| `tasks` | Users can read own tasks or admins all | SELECT | public | permissive | `salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())` |  |
| `tasks` | Users can update own tasks | UPDATE | public | permissive | `salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())` |  |
| `audit_log` | Users can view own audit logs | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `audit_log` | Admins can view all audit logs | SELECT | public | permissive | `EXISTS ( SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin' )` |  |
| `webhooks` | Admins can manage webhooks | ALL | public | permissive | `EXISTS ( SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin' )` |  |
| `webhook_logs` | Admins can view webhook logs | SELECT | public | permissive | `EXISTS ( SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin' )` |  |
| `clients` | Users can view own clients | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `clients` | Users can insert own clients | INSERT | public | permissive |  | `auth.uid() = user_id` |
| `clients` | Users can update own clients | UPDATE | public | permissive | `auth.uid() = user_id` |  |
| `clients` | Users can delete own clients | DELETE | public | permissive | `auth.uid() = user_id` |  |
| `deals` | Users can view own deals | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `deals` | Users can insert own deals | INSERT | public | permissive |  | `auth.uid() = user_id` |
| `deals` | Users can delete own deals | DELETE | public | permissive | `auth.uid() = user_id` |  |
| `activities` | Users can view own activities | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `activities` | Users can insert own activities | INSERT | public | permissive |  | `auth.uid() = user_id` |
| `activities` | Users can update own activities | UPDATE | public | permissive | `auth.uid() = user_id` |  |
| `activities` | Users can delete own activities | DELETE | public | permissive | `auth.uid() = user_id` |  |
| `products` | Everyone can view active products | SELECT | public | permissive | `active = true` |  |
| `tasks` | Users can view own or assigned tasks | SELECT | public | permissive | `auth.uid() = user_id OR auth.uid() = assigned_to` |  |
| `tasks` | Users can insert own tasks | INSERT | public | permissive |  | `auth.uid() = user_id` |
| `tasks` | Users can update assigned tasks | UPDATE | public | permissive | `auth.uid() = user_id OR auth.uid() = assigned_to` |  |
| `tasks` | Users can delete own tasks | DELETE | public | permissive | `auth.uid() = user_id` |  |
| `webhooks` | Users can view their own webhooks | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `webhooks` | Users can create their own webhooks | INSERT | public | permissive |  | `auth.uid() = user_id` |
| `webhooks` | Users can update their own webhooks | UPDATE | public | permissive | `auth.uid() = user_id` |  |
| `webhooks` | Users can delete their own webhooks | DELETE | public | permissive | `auth.uid() = user_id` |  |
| `call_tracking` | Users can view their own call tracking | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `notifications` | Users can view their own notifications | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `notification_preferences` | Users can update their notification preferences | ALL | public | permissive | `auth.uid() = user_id` |  |
| `daily_challenges` | Users can view their own challenges | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `password_history` | Users can view own password history | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `login_attempts` | Admins can view login attempts | SELECT | public | permissive | `EXISTS ( SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin' )` |  |
| `session_activity` | Users can view own session activity | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `data_access_log` | Users can view own data access | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `user_2fa` | Users can view own 2FA settings | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `user_2fa` | Users can insert own 2FA settings | INSERT | public | permissive |  | `auth.uid() = user_id` |
| `user_2fa` | Users can update own 2FA settings | UPDATE | public | permissive | `auth.uid() = user_id` |  |
| `user_2fa_backup_codes` | Users can view own backup codes | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `user_2fa_backup_codes` | Users can update own backup codes | UPDATE | public | permissive | `auth.uid() = user_id` |  |
| `deals` | Admins can do anything on deals | ALL | public | permissive | `EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin' )` |  |
| `deals` | Managers can view all deals | SELECT | public | permissive | `EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('manager', 'admin') )` |  |
| `deals` | Users can view assigned deals | SELECT | public | permissive | `assigned_to = auth.uid() OR created_by = auth.uid()` |  |
| `deals` | Users can update own deals | UPDATE | public | permissive | `assigned_to = auth.uid() OR created_by = auth.uid()` |  |
| `deals` | Users can create deals | INSERT | public | permissive |  | `created_by = auth.uid()` |
| `clients` | Admins full access clients | ALL | public | permissive | `EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin' )` |  |
| `clients` | Managers view all clients | SELECT | public | permissive | `EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('manager', 'admin') )` |  |
| `clients` | Users view assigned clients | SELECT | public | permissive | `assigned_to = auth.uid() OR created_by = auth.uid()` |  |
| `clients` | Users modify own clients | UPDATE | public | permissive | `assigned_to = auth.uid()` |  |
| `clients` | Users create clients | INSERT | public | permissive |  | `created_by = auth.uid()` |
| `activities` | Admins activities | ALL | public | permissive | `EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin' )` |  |
| `activities` | View activities of accessible deals | SELECT | public | permissive | `user_id = auth.uid() OR EXISTS ( SELECT 1 FROM deals WHERE deals.id = activities.deal_id AND (deals.assigned_to = auth.uid() OR deals.created_by = auth.uid()) ) OR EXISTS ( SELECT 1 FROM clients WHERE clients.id = activities.client_id AND (clients.assigned_to = auth.uid() OR clients.created_by = aut …` |  |
| `activities` | Create own activities | INSERT | public | permissive |  | `user_id = auth.uid()` |
| `activities` | Update own activities | UPDATE | public | permissive | `user_id = auth.uid()` |  |
| `tasks` | View assigned tasks | SELECT | public | permissive | `assigned_to = auth.uid() OR created_by = auth.uid() OR EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager') )` |  |
| `tasks` | Create tasks | INSERT | public | permissive |  | `created_by = auth.uid()` |
| `tasks` | Update tasks | UPDATE | public | permissive | `assigned_to = auth.uid() OR created_by = auth.uid()` |  |
| `notes` | View own notes | SELECT | public | permissive | `user_id = auth.uid() OR is_public = true OR EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin' )` |  |
| `notes` | Create notes | INSERT | public | permissive |  | `user_id = auth.uid()` |
| `notes` | Update own notes | UPDATE | public | permissive | `user_id = auth.uid()` |  |
| `notes` | Delete own notes | DELETE | public | permissive | `user_id = auth.uid()` |  |
| `users` | Users view own profile | SELECT | public | permissive | `id = auth.uid() OR EXISTS ( SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager') )` |  |
| `users` | Users update own profile | UPDATE | public | permissive | `id = auth.uid()` |  |
| `users` | Admins full users access | ALL | public | permissive | `EXISTS ( SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin' )` |  |
| `saved_filters` | Users can view their own saved filters | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `saved_filters` | Users can create their own saved filters | INSERT | public | permissive |  | `auth.uid() = user_id` |
| `saved_filters` | Users can update their own saved filters | UPDATE | public | permissive | `auth.uid() = user_id` |  |
| `saved_filters` | Users can delete their own saved filters | DELETE | public | permissive | `auth.uid() = user_id` |  |
| `quotes` | Closers can read quotes | SELECT | public | permissive | `is_admin_or_manager(auth.uid()) OR created_by = get_current_salesperson_id()` |  |
| `quotes` | Closers can insert quotes | INSERT | public | permissive |  | `is_admin_or_manager(auth.uid()) OR created_by = get_current_salesperson_id()` |
| `quotes` | Closers can update quotes | UPDATE | public | permissive | `is_admin_or_manager(auth.uid()) OR created_by = get_current_salesperson_id()` |  |
| `quotes` | Admins can delete quotes | DELETE | public | permissive | `is_admin_or_manager(auth.uid())` |  |
| `workflow_rules` | Users can manage own workflow rules | ALL | authenticated | permissive | `salesperson_id = public.get_current_salesperson_id()` | `salesperson_id = public.get_current_salesperson_id()` |
| `email_tracking_events` | Users can view own email tracking | ALL | authenticated | permissive | `salesperson_id = public.get_current_salesperson_id()` | `salesperson_id = public.get_current_salesperson_id()` |
| `dashboard_layouts` | Users can manage own dashboard layout | ALL | authenticated | permissive | `salesperson_id = public.get_current_salesperson_id()` | `salesperson_id = public.get_current_salesperson_id()` |
| `feed_reactions` | Authenticated can delete own reactions | DELETE | authenticated | permissive | `salesperson_id = public.get_current_salesperson_id()` |  |
| `sales_battles` | Admins can manage battles | ALL | authenticated | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `battle_participants` | Admins can update participants | UPDATE | authenticated | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `competitive_seasons` | Admins can manage seasons | ALL | authenticated | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `rank_change_notifications` | Users can update own notifications | UPDATE | authenticated | permissive | `salesperson_id = public.get_current_salesperson_id()` |  |
| `salesperson_leagues` | Anyone can read leagues | SELECT | authenticated | permissive | `true` |  |
| `salesperson_leagues` | System can manage leagues | ALL | authenticated | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `sales_streaks` | Anyone can read streaks | SELECT | authenticated | permissive | `true` |  |
| `sales_streaks` | Insert own streak | INSERT | authenticated | permissive |  | `salesperson_id = public.get_current_salesperson_id()` |
| `weekly_matchups` | Anyone can read matchups | SELECT | authenticated | permissive | `true` |  |
| `weekly_matchups` | Admins manage matchups | ALL | authenticated | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `salesperson_badges` | Authenticated can view earned badges | SELECT | authenticated | permissive | `true` |  |
| `salesperson_badges` | Users can update own badges | UPDATE | authenticated | permissive | `salesperson_id = public.get_current_salesperson_id()` |  |
| `salesperson_badges` | System can insert badges | INSERT | authenticated | permissive |  | `salesperson_id = public.get_current_salesperson_id()` |
| `progressive_goals` | Users can insert own goals | INSERT | authenticated | permissive |  | `salesperson_id = public.get_current_salesperson_id()` |
| `kudos` | Authenticated can view kudos | SELECT | authenticated | permissive | `true` |  |
| `kudos` | Users can send kudos | INSERT | authenticated | permissive |  | `from_salesperson_id = public.get_current_salesperson_id()` |
| `kudos` | Admins can update kudos | UPDATE | authenticated | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `tournaments` | Auth users can read tournaments | SELECT | authenticated | permissive | `true` |  |
| `tournament_participants` | Auth users can read participants | SELECT | authenticated | permissive | `true` |  |
| `tournament_matches` | Auth users can read matches | SELECT | authenticated | permissive | `true` |  |
| `sales_territories` | Auth users can read territories | SELECT | authenticated | permissive | `true` |  |
| `territory_history` | Auth users can read territory history | SELECT | authenticated | permissive | `true` |  |
| `active_sessions` | Users can read own sessions | SELECT | authenticated | permissive | `user_id = auth.uid()` |  |
| `active_sessions` | Users can insert own sessions | INSERT | authenticated | permissive |  | `user_id = auth.uid()` |
| `active_sessions` | Users can update own sessions | UPDATE | authenticated | permissive | `user_id = auth.uid()` |  |
| `active_sessions` | Users can delete own sessions | DELETE | authenticated | permissive | `user_id = auth.uid()` |  |
| `push_subscriptions` | Users can read own push subscriptions | SELECT | authenticated | permissive | `user_id = auth.uid()` |  |
| `push_subscriptions` | Users can insert own push subscriptions | INSERT | authenticated | permissive |  | `user_id = auth.uid()` |
| `push_subscriptions` | Users can update own push subscriptions | UPDATE | authenticated | permissive | `user_id = auth.uid()` |  |
| `push_subscriptions` | Users can delete own push subscriptions | DELETE | authenticated | permissive | `user_id = auth.uid()` |  |
| `webauthn_challenges` | Users can read own webauthn challenges | SELECT | authenticated | permissive | `user_id = auth.uid()` |  |
| `webauthn_challenges` | Users can insert own webauthn challenges | INSERT | authenticated | permissive |  | `user_id = auth.uid()` |
| `webauthn_challenges` | Users can delete own webauthn challenges | DELETE | authenticated | permissive | `user_id = auth.uid()` |  |
| `rate_limit_logs` | Admins can read rate_limit_logs | SELECT | authenticated | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `activity_goals` | Users can insert own activity_goals | INSERT | authenticated | permissive |  | `salesperson_id = public.get_current_salesperson_id()` |
| `activity_goals` | Users can update own activity_goals | UPDATE | authenticated | permissive | `salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid())` |  |
| `activity_goals` | Admins can delete activity_goals | DELETE | authenticated | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `achievements` | Users can insert own achievements | INSERT | authenticated | permissive |  | `salesperson_id = public.get_current_salesperson_id()` |
| `active_power_ups` | Users can insert own power_ups | INSERT | authenticated | permissive |  | `salesperson_id = public.get_current_salesperson_id()` |
| `deal_stage_history` | Users can insert own deal_stage_history | INSERT | authenticated | permissive |  | `sale_id IN ( SELECT id FROM public.sales WHERE salesperson_id = public.get_current_salesperson_id() ) OR public.is_admin_or_manager(auth.uid())` |
| `deal_stage_history` | Users can update own deal_stage_history | UPDATE | authenticated | permissive | `sale_id IN ( SELECT id FROM public.sales WHERE salesperson_id = public.get_current_salesperson_id() ) OR public.is_admin_or_manager(auth.uid())` |  |
| `cadence_tasks` | Users can insert own cadence_tasks | INSERT | authenticated | permissive |  | `prospect_cadence_id IN ( SELECT id FROM public.prospect_cadences WHERE salesperson_id = public.get_current_salesperson_id() ) OR public.is_admin_or_manager(auth.uid())` |
| `cadence_tasks` | Users can update own cadence_tasks | UPDATE | authenticated | permissive | `prospect_cadence_id IN ( SELECT id FROM public.prospect_cadences WHERE salesperson_id = public.get_current_salesperson_id() ) OR public.is_admin_or_manager(auth.uid())` |  |
| `cadence_tasks` | Users can delete own cadence_tasks | DELETE | authenticated | permissive | `prospect_cadence_id IN ( SELECT id FROM public.prospect_cadences WHERE salesperson_id = public.get_current_salesperson_id() ) OR public.is_admin_or_manager(auth.uid())` |  |
| `icp_data` | Admins can insert icp_data | INSERT | authenticated | permissive |  | `public.is_admin_or_manager(auth.uid())` |
| `icp_data` | Admins can update icp_data | UPDATE | authenticated | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `playbook_progress` | Users can insert own playbook_progress | INSERT | authenticated | permissive |  | `completed_by = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid())` |
| `playbook_progress` | Users can update own playbook_progress | UPDATE | authenticated | permissive | `completed_by = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid())` |  |
| `playbook_progress` | Users can delete own playbook_progress | DELETE | authenticated | permissive | `completed_by = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid())` |  |
| `prospect_cadences` | Users can insert own prospect_cadences | INSERT | authenticated | permissive |  | `salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid())` |
| `prospect_cadences` | Users can update own prospect_cadences | UPDATE | authenticated | permissive | `salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid())` |  |
| `prospect_cadences` | Users can delete own prospect_cadences | DELETE | authenticated | permissive | `salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid())` |  |
| `performance_bets` | Users can insert own bets | INSERT | authenticated | permissive |  | `salesperson_id = public.get_current_salesperson_id()` |
| `performance_bets` | Users can update own bets | UPDATE | authenticated | permissive | `salesperson_id = public.get_current_salesperson_id()` |  |
| `battle_participants` | Users can join battles as self | INSERT | authenticated | permissive |  | `salesperson_id = public.get_current_salesperson_id()` |
| `feed_comments` | Users can insert own feed_comments | INSERT | authenticated | permissive |  | `salesperson_id = public.get_current_salesperson_id()` |
| `feed_reactions` | Users can insert own feed_reactions | INSERT | authenticated | permissive |  | `salesperson_id = public.get_current_salesperson_id()` |
| `sales_territories` | Admins can insert territories | INSERT | authenticated | permissive |  | `public.is_admin_or_manager(auth.uid())` |
| `sales_territories` | Admins can update territories | UPDATE | authenticated | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `tournaments` | Admins can insert tournaments | INSERT | authenticated | permissive |  | `public.is_admin_or_manager(auth.uid())` |
| `tournaments` | Admins can update tournaments | UPDATE | authenticated | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `tournament_matches` | Admins can insert matches | INSERT | authenticated | permissive |  | `public.is_admin_or_manager(auth.uid())` |
| `tournament_matches` | Admins can update matches | UPDATE | authenticated | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `tournament_participants` | Users can insert own tournament_participants | INSERT | authenticated | permissive |  | `salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid())` |
| `tournament_participants` | Users can update own tournament_participants | UPDATE | authenticated | permissive | `salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid())` |  |
| `territory_history` | Admins can insert territory_history | INSERT | authenticated | permissive |  | `public.is_admin_or_manager(auth.uid())` |
| `salespeople` | Admins can insert salespeople | INSERT | authenticated | permissive |  | `public.is_admin_or_manager(auth.uid())` |
| `lead_routing_log` | Admins can insert lead_routing_log | INSERT | authenticated | permissive |  | `public.is_admin_or_manager(auth.uid())` |
| `rank_change_notifications` | Users can insert own rank_notifications | INSERT | authenticated | permissive |  | `salesperson_id = public.get_current_salesperson_id()` |
| `victory_feed` | Users can insert own victory_feed | INSERT | authenticated | permissive |  | `salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid())` |
| `quote_sync_logs` | Admins can insert quote_sync_logs | INSERT | authenticated | permissive |  | `public.is_admin_or_manager(auth.uid())` |
| `clients` | Users can read assigned clients | SELECT | authenticated | permissive | `id IN ( SELECT client_id FROM public.client_portfolio WHERE salesperson_id = public.get_current_salesperson_id() ) OR public.is_admin_or_manager(auth.uid())` |  |
| `suppliers` | Admin and managers can read suppliers | SELECT | authenticated | permissive | `public.is_admin_or_manager(auth.uid())` |  |
| `chat_conversations` | Users can read own chat_conversations | SELECT | authenticated | permissive | `salesperson_id = public.get_current_salesperson_id()` |  |
| `chat_messages` | Users can read own chat_messages | SELECT | authenticated | permissive | `conversation_id IN ( SELECT id FROM public.chat_conversations WHERE salesperson_id = public.get_current_salesperson_id() )` |  |
| `document_signers` | Users can read own document_signers | SELECT | authenticated | permissive | `document_id IN ( SELECT id FROM public.digital_signatures WHERE created_by = public.get_current_salesperson_id() ) OR public.is_admin_or_manager(auth.uid())` |  |
| `deal_chat_history` | Users can read own deal_chat_history | SELECT | authenticated | permissive | `salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid())` |  |
| `client_portfolio` | Users can read own client_portfolio | SELECT | authenticated | permissive | `salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid())` |  |
| `document_signers` | Authenticated users can insert document_signers | INSERT | authenticated | permissive |  | `document_id IN ( SELECT id FROM public.digital_signatures WHERE created_by = public.get_current_salesperson_id() ) OR public.is_admin_or_manager(auth.uid())` |
| `document_signers` | Authenticated users can update document_signers | UPDATE | authenticated | permissive | `document_id IN ( SELECT id FROM public.digital_signatures WHERE created_by = public.get_current_salesperson_id() ) OR public.is_admin_or_manager(auth.uid())` |  |
| … +741 linhas — lista completa em `context.json` | | | | | | |

## C. Restrições de dados (obrigatório / único / default / CHECK / FK / calculada)

| Tabela | Coluna | Regra |
|---|---|---|
| `saved_filters` | `id` | PK; default gen_random_uuid() |
| `saved_filters` | `user_id` | obrigatório |
| `saved_filters` | `entity_type` | obrigatório |
| `saved_filters` | `name` | obrigatório |
| `saved_filters` | `filters` | default '{}' |
| `saved_filters` | `is_default` | default false |
| `saved_filters` | `created_at` | default now() |
| `saved_filters` | `updated_at` | default now() |
| `entity_versions` | `id` | PK; default gen_random_uuid() |
| `entity_versions` | `entity_type` | obrigatório |
| `entity_versions` | `entity_id` | obrigatório |
| `entity_versions` | `version_number` | obrigatório |
| `entity_versions` | `data` | obrigatório |
| `entity_versions` | `changed_by` | FK → users.id |
| `entity_versions` | `changed_at` | default NOW() |
| `entity_versions` | `(tabela)` | CONSTRAINT unique_version UNIQUE (entity_type, entity_id, version_number) |
| `audit_log` | `id` | PK; default uuid_generate_v4() |
| `audit_log` | `user_id` | FK → users.id |
| `audit_log` | `action` | obrigatório; CHECK action IN ('INSERT', 'UPDATE', 'DELETE') |
| `audit_log` | `table_name` | obrigatório |
| `audit_log` | `record_id` | obrigatório |
| `audit_log` | `created_at` | default now() |
| `sales` | `id` | PK; default gen_random_uuid() |
| `sales` | `client_name` | obrigatório |
| `sales` | `product_name` | obrigatório |
| `sales` | `amount` | obrigatório |
| `sales` | `status` | default 'pending'; CHECK status IN ('completed', 'pending', 'cancelled') |
| `sales` | `category` | default 'subscription'; CHECK category IN ('subscription', 'service', 'project', 'other') |
| `sales` | `created_at` | default now() |
| `sales` | `updated_at` | default now() |
| `sales` | `salesperson_id` | FK → salespeople.id |
| `sales` | `source` | default 'other' |
| `sales` | `pipeline_id` | FK → pipelines.id |
| `sales` | `account_id` | FK → accounts.id ON DELETE SET NULL |
| `sales` | `client_id` | FK → clients.id ON DELETE SET NULL |
| `sales` | `product_id` | FK → products.id |
| `sales` | `enrichment_data` | default '{}'::jsonb |
| `sales` | `lost_to_competitor_id` | FK → competitors_registry.id |
| `sales` | `territory_id` | FK → territories.id |
| `sales` | `ai_prediction_score` | default 0 |
| `sales` | `sdr_id` | FK → salespeople.id |
| `sales` | `is_first_sale` | default false |
| `sales` | `closer_id` | FK → salespeople.id |
| `sales` | `deal_status` | CALCULADA = CASE WHEN status IN ('completed', 'won', 'closed') THEN 'completed'::public.deal_status WHEN status IN ('lost', 'cancelled') THEN 'lost'::public.deal_status WHEN status = 'qualified' THEN 'qualified'::public.deal_status WHEN status = 'proposal' THEN 'proposal'::public.deal_status WHEN status = 'negotiation' THEN 'negotiation'::public.deal_status WHEN status IN ('pending', 'lead', 'prospecting', 'open', 'in_progress') THEN 'pending'::public.deal_status ELSE NULL END |
| `sales` | `version` | obrigatório |
| `sales` | `(tabela)` | constraint sales_category_check CHECK (category = ANY (ARRAY['subscription', 'service', 'project', 'other', 'brindes'])) |
| `sales` | `(tabela)` | constraint sales_status_check CHECK (status = ANY (ARRAY['completed', 'pending', 'cancelled', 'lead', 'qualified', 'proposal', 'negotiation', 'closed', 'prospecting', 'won', 'lost'])) |
| `sales` | `(tabela)` | constraint sales_amount_positive CHECK (amount >= 0) |
| `daily_metrics` | `id` | PK; default gen_random_uuid() |
| `daily_metrics` | `date` | obrigatório; único |
| `daily_metrics` | `revenue` | default 0 |
| `daily_metrics` | `revenue_goal` | default 0 |
| `daily_metrics` | `new_clients` | default 0 |
| `daily_metrics` | `total_sales` | default 0 |
| `daily_metrics` | `conversion_rate` | default 0 |
| `daily_metrics` | `avg_ticket` | default 0 |
| `daily_metrics` | `created_at` | default now() |
| `category_metrics` | `id` | PK; default gen_random_uuid() |
| `category_metrics` | `date` | obrigatório |
| `category_metrics` | `category` | obrigatório |
| `category_metrics` | `percentage` | default 0 |
| `category_metrics` | `created_at` | default now() |
| `category_metrics` | `(tabela)` | UNIQUE(date, category) |
| `salespeople` | `id` | PK; default gen_random_uuid() |
| `salespeople` | `name` | obrigatório |
| `salespeople` | `email` | único |
| `salespeople` | `commission_rate` | default 10.00 |
| `salespeople` | `is_active` | default true |
| `salespeople` | `created_at` | default now() |
| `salespeople` | `updated_at` | default now() |
| `salespeople` | `role` | default 'hybrid' |
| `salespeople` | `auth_user_id` | único |
| `salespeople` | `squad_id` | FK → squads.id |
| `salespeople` | `notify_sales_in_app` | default true |
| `salespeople` | `score_total` | obrigatório |
| `sales_goals` | `id` | PK; default gen_random_uuid() |
| `sales_goals` | `salesperson_id` | obrigatório; FK → salespeople.id ON DELETE CASCADE |
| `sales_goals` | `month` | obrigatório |
| `sales_goals` | `goal_amount` | default 0 |
| `sales_goals` | `created_at` | default now() |
| `sales_goals` | `(tabela)` | UNIQUE(salesperson_id, month) |
| `deal_outcomes` | `id` | PK; default gen_random_uuid() |
| `deal_outcomes` | `sale_id` | FK → sales.id ON DELETE CASCADE |
| `deal_outcomes` | `salesperson_id` | FK → salespeople.id ON DELETE CASCADE |
| `deal_outcomes` | `outcome` | obrigatório; CHECK outcome IN ('won', 'lost') |
| `deal_outcomes` | `reason` | obrigatório |
| `deal_outcomes` | `created_at` | default now() |
| `deal_stage_history` | `id` | PK; default gen_random_uuid() |
| `deal_stage_history` | `sale_id` | FK → sales.id ON DELETE CASCADE |
| `deal_stage_history` | `stage` | obrigatório |
| `deal_stage_history` | `entered_at` | default now() |
| `deal_stage_history` | `is_backfilled` | default false |
| `objections_library` | `id` | PK; default gen_random_uuid() |
| `objections_library` | `objection` | obrigatório |
| `objections_library` | `response` | obrigatório |
| `objections_library` | `category` | default 'general' |
| `objections_library` | `effectiveness_score` | default 0 |
| `objections_library` | `usage_count` | default 0 |
| `objections_library` | `created_by` | FK → salespeople.id |
| `objections_library` | `created_at` | default now() |
| `objections_library` | `updated_at` | default now() |
| `objections_library` | `tags` | default '{}' |
| `notification_preferences` | `user_id` | PK; FK → users.id ON DELETE CASCADE |
| `notification_preferences` | `email_enabled` | default true |
| `notification_preferences` | `push_enabled` | default true |
| `notification_preferences` | `sms_enabled` | default false |
| `notification_preferences` | `deal_updates` | default true |
| `notification_preferences` | `task_reminders` | default true |
| `notification_preferences` | `team_mentions` | default true |
| `notification_preferences` | `daily_digest` | default false |
| `notification_preferences` | `updated_at` | default now() |
| `notification_preferences` | `consecutive_days_threshold` | obrigatório |
| `notification_preferences` | `created_at` | obrigatório |
| `notification_preferences` | `email` | obrigatório |
| `notification_preferences` | `frequency` | obrigatório |
| `notification_preferences` | `id` | obrigatório |
| `notification_preferences` | `inactive_threshold_days` | obrigatório |
| `notification_preferences` | `is_active` | obrigatório |
| `notification_preferences` | `notify_at_risk_goals` | obrigatório |
| `notification_preferences` | `notify_inactive_clients` | obrigatório |
| `notification_preferences` | `notify_stagnant_deals` | obrigatório |
| `notification_preferences` | `preferred_time` | obrigatório |
| `notification_preferences` | `stagnant_threshold_days` | obrigatório |
| `tasks` | `id` | PK; default gen_random_uuid() |
| `tasks` | `title` | obrigatório |
| `tasks` | `salesperson_id` | FK → salespeople.id ON DELETE CASCADE |
| `tasks` | `sale_id` | FK → sales.id ON DELETE SET NULL |
| `tasks` | `priority` | default 'medium' |
| `tasks` | `status` | default 'pending' |
| `tasks` | `task_type` | default 'other' |
| `tasks` | `due_date` | default CURRENT_DATE |
| `tasks` | `created_at` | default now() |
| `tasks` | `updated_at` | default now() |
| `tasks` | `source_insight_id` | FK → win_loss_insights.id on delete set null |
| `tasks` | `client_id` | FK → clients.id ON DELETE CASCADE |
| `tasks` | `(tabela)` | constraint tasks_due_date_check CHECK (due_date >= '2020-01-01') |
| `playbooks` | `id` | PK; default gen_random_uuid() |
| `playbooks` | `stage` | obrigatório |
| `playbooks` | `title` | obrigatório |
| `playbooks` | `created_at` | default now() |
| `playbooks` | `updated_at` | default now() |
| `playbook_items` | `id` | PK; default gen_random_uuid() |
| `playbook_items` | `playbook_id` | obrigatório; FK → playbooks.id ON DELETE CASCADE |
| `playbook_items` | `content` | obrigatório |
| `playbook_items` | `item_order` | default 0 |
| `playbook_items` | `is_required` | default false |
| `playbook_items` | `item_type` | default 'checklist' |
| `playbook_items` | `created_at` | default now() |
| `playbook_items` | `asset_id` | FK → sales_enablement_assets.id |
| `playbook_progress` | `id` | PK; default gen_random_uuid() |
| `playbook_progress` | `playbook_item_id` | obrigatório; FK → playbook_items.id ON DELETE CASCADE |
| `playbook_progress` | `sale_id` | obrigatório; FK → sales.id ON DELETE CASCADE |
| `playbook_progress` | `completed_at` | default now() |
| `playbook_progress` | `completed_by` | FK → salespeople.id |
| `playbook_progress` | `(tabela)` | UNIQUE(playbook_item_id, sale_id) |
| `lead_scores` | `id` | PK; default gen_random_uuid() |
| `lead_scores` | `sale_id` | obrigatório; FK → sales.id ON DELETE CASCADE |
| `lead_scores` | `score` | default 0 |
| `lead_scores` | `factors` | default '{}' |
| `lead_scores` | `calculated_at` | default now() |
| `lead_scores` | `created_at` | default now() |
| `lead_scores` | `updated_at` | default now() |
| `lead_scores` | `(tabela)` | UNIQUE(sale_id) |
| `activities` | `id` | PK; default gen_random_uuid() |
| `activities` | `sale_id` | FK → sales.id ON DELETE CASCADE |
| `activities` | `salesperson_id` | FK → salespeople.id ON DELETE SET NULL |
| `activities` | `activity_type` | obrigatório |
| `activities` | `outcome` | obrigatório |
| `activities` | `created_at` | default now() |
| `activities` | `client_id` | FK → clients.id |
| `activities` | `lead_status` | default 'prospect' |
| `cadences` | `id` | PK; default uuid_generate_v4() |
| `cadences` | `name` | obrigatório |
| `cadences` | `is_active` | default true |
| `cadences` | `created_by` | FK → users.id |
| `cadences` | `created_at` | default now() |
| `cadences` | `cadence_type` | default 'prospecting' |
| `cadences` | `updated_at` | obrigatório |
| `cadence_steps` | `id` | PK; default uuid_generate_v4() |
| `cadence_steps` | `cadence_id` | obrigatório; FK → cadences.id ON DELETE CASCADE |
| `cadence_steps` | `step_order` | obrigatório |
| `cadence_steps` | `step_type` | obrigatório; CHECK step_type IN ('email', 'call', 'linkedin', 'task') |
| `cadence_steps` | `delay_days` | obrigatório |
| `cadence_steps` | `created_at` | default now() |
| `cadence_steps` | `needs_approval` | default false |
| `cadence_steps` | `task_type` | default 'manual' |
| `cadence_steps` | `action_type` | obrigatório |
| `cadence_steps` | `day_number` | obrigatório |
| `cadence_steps` | `title` | obrigatório |
| `prospect_cadences` | `id` | PK; default gen_random_uuid() |
| `prospect_cadences` | `sale_id` | FK → sales.id ON DELETE CASCADE |
| `prospect_cadences` | `cadence_id` | obrigatório; FK → cadences.id ON DELETE CASCADE |
| `prospect_cadences` | `salesperson_id` | FK → salespeople.id |
| `prospect_cadences` | `status` | default 'active'; CHECK status IN ('active', 'paused', 'completed', 'cancelled') |
| `prospect_cadences` | `started_at` | default now() |
| `prospect_cadences` | `current_step` | default 0 |
| `prospect_cadences` | `created_at` | default now() |
| `prospect_cadences` | `updated_at` | default now() |
| `prospect_cadences` | `enrolled_via_rule_id` | FK → cadence_enrollment_rules.id ON DELETE SET NULL |
| `prospect_cadences` | `quote_id` | FK → quotes.id ON DELETE CASCADE |
| `prospect_cadences` | `funnel_stage` | default 'new'; CHECK funnel_stage IN ('new', 'high_interest', 'waiting_approval', 'scheduled') |
| `prospect_cadences` | `enrollment_source` | obrigatório |
| `prospect_cadences` | `(tabela)` | UNIQUE(sale_id, cadence_id) |
| `prospect_cadences` | `(tabela)` | constraint prospect_cadences_target_check CHECK ((sale_id IS NOT NULL) OR (quote_id IS NOT NULL)) |
| `cadence_tasks` | `id` | PK; default gen_random_uuid() |
| `cadence_tasks` | `prospect_cadence_id` | obrigatório; FK → prospect_cadences.id ON DELETE CASCADE |
| `cadence_tasks` | `cadence_step_id` | obrigatório; FK → cadence_steps.id ON DELETE CASCADE |
| `cadence_tasks` | `scheduled_date` | obrigatório |
| `cadence_tasks` | `status` | default 'pending'; CHECK status IN ('pending', 'completed', 'skipped') |
| `cadence_tasks` | `created_at` | default now() |
| `cadence_tasks` | `task_type` | default 'manual' |
| `activity_goals` | `id` | PK; default gen_random_uuid() |
| `activity_goals` | `salesperson_id` | obrigatório; FK → salespeople.id ON DELETE CASCADE |
| `activity_goals` | `calls_goal` | default 30 |
| `activity_goals` | `emails_goal` | default 20 |
| `activity_goals` | `meetings_goal` | default 3 |
| `activity_goals` | `linkedin_goal` | default 10 |
| `activity_goals` | `whatsapp_goal` | default 15 |
| `activity_goals` | `created_at` | default now() |
| `activity_goals` | `updated_at` | default now() |
| `activity_goals` | `(tabela)` | UNIQUE(salesperson_id) |
| `achievements` | `id` | PK; default gen_random_uuid() |
| `achievements` | `salesperson_id` | obrigatório; FK → salespeople.id ON DELETE CASCADE |
| `achievements` | `achievement_type` | default 'daily_goal' |
| `achievements` | `achievement_date` | default CURRENT_DATE |
| `achievements` | `details` | default '{}' |
| `achievements` | `created_at` | default now() |
| `salesperson_xp` | `id` | PK; default gen_random_uuid() |
| `salesperson_xp` | `salesperson_id` | obrigatório; único; FK → salespeople.id ON DELETE CASCADE |
| `salesperson_xp` | `total_xp` | default 0 |
| `salesperson_xp` | `current_level` | default 1 |
| `salesperson_xp` | `xp_to_next_level` | default 100 |
| `salesperson_xp` | `created_at` | default now() |
| `salesperson_xp` | `updated_at` | default now() |
| `xp_history` | `id` | PK; default gen_random_uuid() |
| `xp_history` | `salesperson_id` | obrigatório; FK → salespeople.id ON DELETE CASCADE |
| `xp_history` | `xp_amount` | obrigatório |
| `xp_history` | `source_type` | obrigatório |
| `xp_history` | `created_at` | default now() |
| `clients` | `id` | PK; default gen_random_uuid() |
| `clients` | `name` | obrigatório |
| `clients` | `total_value` | default 0 |
| `clients` | `created_at` | default now() |
| `clients` | `updated_at` | default now() |
| `clients` | `is_activated` | default false |
| `products` | `id` | PK; default gen_random_uuid() |
| `products` | `name` | obrigatório |
| `products` | `category` | default 'subscription' |
| `products` | `price` | default 0 |
| `products` | `sales_count` | default 0 |
| `products` | `rating` | default 0 |
| `products` | `status` | default 'ativo' |
| `products` | `created_at` | default now() |
| `products` | `updated_at` | default now() |
| `products` | `sku` | único |
| `products` | `stock_quantity` | default 0 |
| `products` | `(tabela)` | constraint products_price_positive CHECK (price >= 0) |
| `products` | `(tabela)` | constraint products_stock_positive CHECK (stock_quantity >= 0) |
| `user_roles` | `user_id` | PK; FK → users.id ON DELETE CASCADE |
| `user_roles` | `role` | obrigatório; CHECK role IN ('admin', 'manager', 'sales', 'viewer') |
| `user_roles` | `assigned_at` | default now() |
| `user_roles` | `assigned_by` | FK → users.id |
| `user_roles` | `created_at` | obrigatório |
| `user_roles` | `id` | obrigatório |
| `user_roles` | `updated_at` | obrigatório |
| `access_denied_logs` | `id` | PK; default gen_random_uuid() |
| `access_denied_logs` | `user_id` | obrigatório |
| `access_denied_logs` | `attempted_path` | obrigatório |
| `access_denied_logs` | `created_at` | default now() |
| `security_alert_settings` | `id` | PK; default gen_random_uuid() |
| `security_alert_settings` | `spike_threshold` | default 5 |
| `security_alert_settings` | `time_window_hours` | default 1 |
| `security_alert_settings` | `cooldown_hours` | default 24 |
| `security_alert_settings` | `created_at` | default now() |
| `security_alert_settings` | `updated_at` | default now() |
| `security_alert_history` | `id` | PK; default gen_random_uuid() |
| `security_alert_history` | `alert_type` | default 'access_denied_spike' |
| `security_alert_history` | `recipients` | obrigatório |
| `security_alert_history` | `access_count` | obrigatório |
| `security_alert_history` | `time_window_hours` | obrigatório |
| `security_alert_history` | `threshold_used` | obrigatório |
| `security_alert_history` | `created_at` | default now() |
| `circuit_breaker_events` | `id` | PK; default gen_random_uuid() |
| `circuit_breaker_events` | `circuit_name` | obrigatório |
| `circuit_breaker_events` | `event_type` | obrigatório |
| `circuit_breaker_events` | `failure_count` | default 0 |
| `circuit_breaker_events` | `details` | default '{}'::jsonb |
| `circuit_breaker_events` | `created_at` | default now() |
| `teams` | `id` | PK; default gen_random_uuid() |
| `teams` | `name` | obrigatório |
| `teams` | `sdr_id` | FK → salespeople.id ON DELETE SET NULL |
| `teams` | `is_active` | default true |
| `teams` | `inactivity_days` | default 365 |
| `teams` | `created_at` | default now() |
| `teams` | `updated_at` | default now() |
| `team_closers` | `id` | PK; default gen_random_uuid() |
| `team_closers` | `team_id` | obrigatório; FK → teams.id ON DELETE CASCADE |
| `team_closers` | `closer_id` | obrigatório; FK → salespeople.id ON DELETE CASCADE |
| `team_closers` | `created_at` | default now() |
| `team_closers` | `(tabela)` | UNIQUE(team_id, closer_id) |
| … +2940 linhas — lista completa em `context.json` | | |

## D. Automações no banco (triggers e funções — regras que rodam sozinhas)

| Trigger | Quando | Tabela | Executa | Condição |
|---|---|---|---|---|
| trigger_saved_filters_updated_at | BEFORE UPDATE | `saved_filters` | `update_saved_filters_updated_at` |  |
| trigger_single_default_filter | BEFORE INSERT OR UPDATE OF IS_DEFAULT | `saved_filters` | `ensure_single_default_filter` | `NEW.is_default = true` |
| on_auth_user_created_role | AFTER INSERT | `auth.users` | `handle_new_user_role` |  |
| update_salespeople_updated_at | BEFORE UPDATE | `salespeople` | `update_updated_at_column` |  |
| update_clients_updated_at | BEFORE UPDATE | `clients` | `update_updated_at_column` |  |
| update_sales_updated_at | BEFORE UPDATE | `sales` | `update_updated_at_column` |  |
| update_products_updated_at | BEFORE UPDATE | `products` | `update_updated_at_column` |  |
| update_tasks_updated_at | BEFORE UPDATE | `tasks` | `update_updated_at_column` |  |
| update_cadences_updated_at | BEFORE UPDATE | `cadences` | `update_updated_at_column` |  |
| update_teams_updated_at | BEFORE UPDATE | `teams` | `update_updated_at_column` |  |
| update_playbooks_updated_at | BEFORE UPDATE | `playbooks` | `update_updated_at_column` |  |
| update_objections_library_updated_at | BEFORE UPDATE | `objections_library` | `update_updated_at_column` |  |
| update_activity_goals_updated_at | BEFORE UPDATE | `activity_goals` | `update_updated_at_column` |  |
| update_notification_preferences_updated_at | BEFORE UPDATE | `notification_preferences` | `update_updated_at_column` |  |
| update_security_alert_settings_updated_at | BEFORE UPDATE | `security_alert_settings` | `update_updated_at_column` |  |
| update_portfolio_settings_updated_at | BEFORE UPDATE | `portfolio_settings` | `update_updated_at_column` |  |
| update_icp_data_updated_at | BEFORE UPDATE | `icp_data` | `update_updated_at_column` |  |
| update_lead_scores_updated_at | BEFORE UPDATE | `lead_scores` | `update_updated_at_column` |  |
| update_client_portfolio_updated_at | BEFORE UPDATE | `client_portfolio` | `update_updated_at_column` |  |
| update_prospect_cadences_updated_at | BEFORE UPDATE | `prospect_cadences` | `update_updated_at_column` |  |
| update_salesperson_xp_updated_at | BEFORE UPDATE | `salesperson_xp` | `update_updated_at_column` |  |
| update_user_roles_updated_at | BEFORE UPDATE | `user_roles` | `update_updated_at_column` |  |
| update_chat_conversations_updated_at | BEFORE UPDATE | `chat_conversations` | `update_updated_at_column` |  |
| update_weekly_challenges_updated_at | BEFORE UPDATE | `weekly_challenges` | `update_updated_at_column` |  |
| update_challenge_progress_updated_at | BEFORE UPDATE | `challenge_progress` | `update_updated_at_column` |  |
| update_push_subscriptions_updated_at | BEFORE UPDATE | `push_subscriptions` | `update_updated_at_column` |  |
| update_demand_forecasts_updated_at | BEFORE UPDATE | `demand_forecasts` | `update_updated_at_column` |  |
| update_inventory_levels_updated_at | BEFORE UPDATE | `inventory_levels` | `update_updated_at_column` |  |
| update_suppliers_updated_at | BEFORE UPDATE | `suppliers` | `update_updated_at_column` |  |
| update_supplier_products_updated_at | BEFORE UPDATE | `supplier_products` | `update_updated_at_column` |  |
| update_supplier_orders_updated_at | BEFORE UPDATE | `supplier_orders` | `update_updated_at_column` |  |
| update_digital_signatures_updated_at | BEFORE UPDATE | `digital_signatures` | `update_updated_at_column` |  |
| trigger_record_price_history | AFTER UPDATE | `supplier_products` | `record_price_history` |  |
| audit_soft_delete_clients | AFTER UPDATE | `clients` | `log_soft_delete` |  |
| audit_soft_delete_deals | AFTER UPDATE | `deals` | `log_soft_delete` |  |
| audit_soft_delete_activities | AFTER UPDATE | `activities` | `log_soft_delete` |  |
| audit_soft_delete_products | AFTER UPDATE | `products` | `log_soft_delete` |  |
| audit_soft_delete_suppliers | AFTER UPDATE | `suppliers` | `log_soft_delete` |  |
| audit_soft_delete_teams | AFTER UPDATE | `teams` | `log_soft_delete` |  |
| update_blocked_ips_updated_at | BEFORE UPDATE | `blocked_ips` | `update_updated_at_column` |  |
| update_ip_whitelist_updated_at | BEFORE UPDATE | `ip_whitelist` | `update_updated_at_column` |  |
| update_rate_limit_settings_updated_at | BEFORE UPDATE | `rate_limit_settings` | `update_updated_at_column` |  |
| update_mfa_settings_updated_at | BEFORE UPDATE | `user_mfa_settings` | `update_updated_at_column` |  |
| update_password_reset_requests_updated_at | BEFORE UPDATE | `password_reset_requests` | `update_updated_at_column` |  |
| update_salesperson_preferences_updated_at | BEFORE UPDATE | `salesperson_preferences` | `update_updated_at_column` |  |
| log_clients_access | AFTER INSERT OR UPDATE OR DELETE | `clients` | `log_data_access` |  |
| log_deals_access | AFTER INSERT OR UPDATE OR DELETE | `deals` | `log_data_access` |  |
| user_2fa_updated_at | BEFORE UPDATE | `user_2fa` | `update_2fa_updated_at` |  |
| audit_deals | AFTER INSERT OR UPDATE OR DELETE | `deals` | `audit_trigger_func` |  |
| audit_clients | AFTER INSERT OR UPDATE OR DELETE | `clients` | `audit_trigger_func` |  |
| audit_users | AFTER INSERT OR UPDATE OR DELETE | `users` | `audit_trigger_func` |  |
| audit_activities | AFTER INSERT OR UPDATE OR DELETE | `activities` | `audit_trigger_func` |  |
| update_saved_filters_updated_at | BEFORE UPDATE | `saved_filters` | `update_updated_at_column` |  |
| ensure_single_default_filter_trigger | BEFORE INSERT OR UPDATE | `saved_filters` | `ensure_single_default_filter` |  |
| update_quotes_updated_at | BEFORE UPDATE | `quotes` | `update_updated_at_column` |  |
| check_mood_value | BEFORE INSERT OR UPDATE | `mood_entries` | `validate_mood_value` |  |
| update_message_templates_updated_at | BEFORE UPDATE | `message_templates` | `update_updated_at_column` |  |
| update_feature_flags_updated_at | BEFORE UPDATE | `feature_flags` | `update_updated_at_column` |  |
| update_commission_rules_updated_at | BEFORE UPDATE | `commission_rules` | `update_updated_at_column` |  |
| update_commissions_updated_at | BEFORE UPDATE | `commissions` | `update_updated_at_column` |  |
| update_agenda_events_updated_at | BEFORE UPDATE | `agenda_events` | `update_updated_at_column` |  |
| trg_auto_create_commission | AFTER INSERT OR UPDATE OF STATUS | `sales` | `auto_create_commission` |  |
| update_approval_workflows_updated_at | BEFORE UPDATE | `approval_workflows` | `update_updated_at_column` |  |
| update_approval_requests_updated_at | BEFORE UPDATE | `approval_requests` | `update_updated_at_column` |  |
| update_webhooks_updated_at | BEFORE UPDATE | `webhooks` | `update_updated_at_column` |  |
| trg_sla_policies_updated | BEFORE UPDATE | `sla_policies` | `update_updated_at_column` |  |
| trg_sla_violations_updated | BEFORE UPDATE | `sla_violations` | `update_updated_at_column` |  |
| trg_lead_routing_rules_updated | BEFORE UPDATE | `lead_routing_rules` | `update_updated_at_column` |  |
| workflows_updated_at | BEFORE UPDATE | `workflows` | `update_updated_at_column` |  |
| update_enrollment_rules_updated_at | BEFORE UPDATE | `cadence_enrollment_rules` | `update_updated_at_column` |  |
| trg_auto_pause_cadence_on_response | AFTER INSERT | `channel_interactions` | `auto_pause_cadence_on_response` |  |
| update_ab_tests_updated_at | BEFORE UPDATE | `cadence_ab_tests` | `update_updated_at_column` |  |
| update_call_recordings_updated_at | BEFORE UPDATE | `call_recordings` | `update_updated_at_column` |  |
| trg_accounts_updated_at | BEFORE UPDATE | `accounts` | `update_updated_at_column` |  |
| trg_account_contacts_updated_at | BEFORE UPDATE | `account_contacts` | `update_updated_at_column` |  |
| trg_automation_workflows_updated_at | BEFORE UPDATE | `automation_workflows` | `update_updated_at_column` |  |
| trg_sea_updated_at | BEFORE UPDATE | `sales_enablement_assets` | `update_updated_at_column` |  |
| trg_asset_view_increment | AFTER INSERT | `asset_usage_logs` | `increment_asset_view_count` |  |
| trg_auto_forecast_category | BEFORE INSERT OR UPDATE OF STATUS | `sales` | `auto_set_forecast_category` |  |
| trg_bcm_updated_at | BEFORE UPDATE | `buying_committee_members` | `update_updated_at_column` |  |
| update_custom_reports_updated_at | BEFORE UPDATE | `custom_reports` | `update_updated_at_column` |  |
| update_report_schedules_updated_at | BEFORE UPDATE | `report_schedules` | `update_updated_at_column` |  |
| update_cohort_analyses_updated_at | BEFORE UPDATE | `cohort_analyses` | `update_updated_at_column` |  |
| trg_sequences_updated_at | BEFORE UPDATE | `sequences` | `update_updated_at_column` |  |
| trg_seq_enrollments_updated_at | BEFORE UPDATE | `sequence_enrollments` | `update_updated_at_column` |  |
| trg_recompute_engagement_on_signal | AFTER INSERT OR UPDATE | `contact_send_time_profile` | `trg_recompute_engagement` |  |
| trg_activities_auto_pause | AFTER INSERT | `activities` | `trg_activities_auto_pause_sequences` |  |
| trg_channel_credentials_updated_at | BEFORE UPDATE | `channel_credentials` | `update_updated_at_column` |  |
| trg_outbound_messages_updated_at | BEFORE UPDATE | `outbound_messages` | `update_updated_at_column` |  |
| trg_ai_agent_runs_updated_at | BEFORE UPDATE | `ai_agent_runs` | `update_updated_at_column` |  |
| trg_lead_scores_history | AFTER INSERT OR UPDATE OF SCORE | `lead_scores` | `record_lead_score_history` |  |
| trg_lead_score_explanations_updated | BEFORE UPDATE | `lead_score_explanations` | `update_updated_at_column` |  |
| trg_email_bulk_jobs_updated | BEFORE UPDATE | `email_bulk_jobs` | `update_updated_at_column` |  |
| trg_email_bulk_drafts_updated | BEFORE UPDATE | `email_bulk_drafts` | `update_updated_at_column` |  |
| trg_snapshot_engagement_score | AFTER INSERT OR UPDATE | `email_engagement_scores` | `snapshot_engagement_score` |  |
| trg_auto_link_sale_to_account | BEFORE INSERT OR UPDATE OF CLIENT_NAME | `sales` | `auto_link_sale_to_account` |  |
| trg_dialer_queues_updated | BEFORE UPDATE | `dialer_queues` | `update_updated_at_column` |  |
| trg_competitors_registry_updated_at | BEFORE UPDATE | `competitors_registry` | `update_updated_at_column` |  |
| trg_coaching_actions_updated_at | BEFORE UPDATE | `coaching_actions` | `update_updated_at_column` |  |
| trg_ccm_updated_at | BEFORE UPDATE | `call_critical_moments` | `update_updated_at_column` |  |
| trg_notify_critical_moment | AFTER INSERT | `call_critical_moments` | `notify_critical_moment_created` |  |
| trg_deal_health_scores_updated | BEFORE UPDATE | `deal_health_scores` | `update_updated_at_column` |  |
| update_deal_stakeholders_updated_at | BEFORE UPDATE | `deal_stakeholders` | `update_updated_at_column` |  |
| update_committee_coverage_updated_at | BEFORE UPDATE | `deal_committee_coverage` | `update_updated_at_column` |  |
| trg_dvp_updated_at | BEFORE UPDATE | `deal_velocity_predictions` | `update_updated_at_column` |  |
| trg_svb_updated_at | BEFORE UPDATE | `stage_velocity_baselines` | `update_updated_at_column` |  |
| update_stage_conversion_metrics_updated_at | BEFORE UPDATE | `stage_conversion_metrics` | `update_updated_at_column` |  |
| update_stage_bottleneck_insights_updated_at | BEFORE UPDATE | `stage_bottleneck_insights` | `update_updated_at_column` |  |
| update_revenue_forecasts_updated_at | BEFORE UPDATE | `revenue_forecasts` | `update_updated_at_column` |  |
| trg_race_seasons_updated | BEFORE UPDATE | `race_seasons` | `update_updated_at_column` |  |
| trg_race_cars_updated | BEFORE UPDATE | `race_cars` | `update_updated_at_column` |  |
| trg_snapshot_committee_coverage | AFTER INSERT OR UPDATE | `deal_committee_coverage` | `snapshot_committee_coverage` |  |
| trg_record_sale_stage_transition | AFTER INSERT OR UPDATE OF STATUS | `sales` | `record_sale_stage_transition` |  |
| update_skill_assessments_updated_at | BEFORE UPDATE | `skill_assessments` | `update_updated_at_column` |  |
| update_skill_tracks_updated_at | BEFORE UPDATE | `skill_development_tracks` | `update_updated_at_column` |  |
| update_coaching_sessions_updated_at | BEFORE UPDATE | `coaching_sessions` | `update_updated_at_column` |  |
| trg_task_catalog_updated | BEFORE UPDATE | `task_catalog` | `update_updated_at_column` |  |
| trg_task_assignments_updated | BEFORE UPDATE | `task_assignments` | `update_updated_at_column` |  |
| trg_squads_updated_at | BEFORE UPDATE | `squads` | `update_updated_at_column` |  |
| update_race_teams_updated_at | BEFORE UPDATE | `race_teams` | `update_updated_at_column` |  |
| update_race_rivalries_persistent_updated_at | BEFORE UPDATE | `race_rivalries_persistent` | `update_updated_at_column` |  |
| trg_race_user_preferences_updated_at | BEFORE UPDATE | `race_user_preferences` | `update_updated_at_column` |  |
| validate_race_event_trigger | BEFORE INSERT | `race_events` | `validate_race_event` |  |
| trg_auto_enroll_quote_cadence | AFTER INSERT OR UPDATE OF STATUS | `quotes` | `auto_enroll_quote_cadence` |  |
| trg_award_xp_on_quote_cadence_task_complete | AFTER UPDATE | `cadence_tasks` | `award_xp_on_quote_cadence_task_complete` |  |
| trg_award_xp_on_quote_approved_via_cadence | AFTER UPDATE | `quotes` | `award_xp_on_quote_approved_via_cadence` |  |
| trg_notify_critical_winloss | AFTER INSERT | `win_loss_patterns` | `notify_critical_winloss_pattern` |  |
| update_winloss_dlq_updated_at | BEFORE UPDATE | `winloss_webhook_dead_letters` | `update_updated_at_column` |  |
| user_app_settings_touch_updated_at | BEFORE UPDATE | `user_app_settings` | `update_updated_at_column` |  |
| trg_log_order_status_change | BEFORE UPDATE OF STATUS | `orders` | `log_order_status_change` |  |
| trg_log_order_creation | AFTER INSERT | `orders` | `log_order_creation` |  |
| trg_touch_winloss_alert_settings | BEFORE UPDATE | `winloss_alert_settings` | `touch_winloss_alert_settings` |  |
| trg_integration_connections_updated | BEFORE UPDATE | `integration_connections` | `update_updated_at_column` |  |
| trg_integration_autotest_settings_updated | BEFORE UPDATE | `integration_autotest_settings` | `update_updated_at_column` |  |
| update_follow_up_templates_updated_at | BEFORE UPDATE | `follow_up_templates` | `update_updated_at_column` |  |
| update_follow_up_territory_rules_updated_at | BEFORE UPDATE | `follow_up_territory_rules` | `update_updated_at_column` |  |
| update_cadence_funnel_rules_updated_at | BEFORE UPDATE | `cadence_funnel_rules` | `update_updated_at_column` |  |
| trg_email_tracking_to_cadence_intent | AFTER INSERT | `email_tracking_events` | `trg_process_email_tracking_event` |  |
| tr_update_client_value | AFTER INSERT OR UPDATE OR DELETE | `sales` | `update_client_total_value` |  |
| tr_manage_stock | BEFORE INSERT OR UPDATE | `sales` | `manage_stock_on_sale` |  |
| tr_update_client_ltv | AFTER INSERT OR UPDATE | `sales` | `update_client_ltv_on_sale` |  |
| tr_auto_add_client_portfolio | AFTER INSERT | `clients` | `auto_add_client_to_portfolio` |  |
| tr_update_product_stock | AFTER INSERT OR UPDATE | `sales` | `update_product_stock` |  |
| tr_update_client_total_value | AFTER INSERT OR UPDATE OR DELETE | `sales` | `handle_client_ltv_update` |  |
| tr_handle_stock_on_sale | AFTER UPDATE | `sales` | `handle_stock_management` |  |
| tr_auto_followup_on_sale | AFTER UPDATE | `sales` | `auto_create_sale_followup` |  |
| audit_activities_trigger | AFTER UPDATE OR DELETE | `activities` | `audit_activity_changes` |  |
| update_mql_qualifications_updated_at | BEFORE UPDATE | `mql_qualifications` | `handle_updated_at` |  |
| audit_sales_changes | AFTER UPDATE | `sales` | `handle_audit_logging` |  |
| audit_tasks_changes | AFTER UPDATE | `tasks` | `handle_audit_logging` |  |
| trg_generate_cadence_tasks | AFTER INSERT | `prospect_cadences` | `generate_cadence_tasks` |  |
| trg_auto_enroll_on_sale | AFTER INSERT OR UPDATE OF STATUS | `sales` | `auto_enroll_in_cadence` |  |
| on_competitor_price_update | AFTER INSERT | `competitors_pricing` | `check_price_threats` |  |
| on_asset_ai_activation | AFTER UPDATE OF VIEW_COUNT | `sales_enablement_assets` | `notify_asset_ai_status` |  |
| on_asset_influence_boost | AFTER INSERT | `asset_usage_logs` | `notify_asset_influence_boost` |  |
| tr_competitor_mention_health | AFTER INSERT OR UPDATE | `competitor_mentions` | `trigger_recalculate_deal_health` |  |
| tr_critical_moment_health | AFTER INSERT OR UPDATE | `call_critical_moments` | `trigger_recalculate_deal_health` |  |
| trig_update_icp_score | BEFORE INSERT OR UPDATE | `icp_data` | `fn_calculate_icp_score` |  |
| tr_check_battle_achievements | AFTER UPDATE OF WINNER_ID | `weekly_matchups` | `check_battle_achievements` |  |
| tr_sync_battle_score_sales | AFTER INSERT OR UPDATE | `sales` | `sync_battle_score` |  |
| tr_sync_battle_score_activities | AFTER INSERT OR UPDATE | `activities` | `sync_battle_score` |  |
| tr_victory_battle | AFTER UPDATE | `sales_battles` | `auto_victory_post` | `OLD.status IS DISTINCT FROM NEW.status` |
| tr_maintain_streaks | AFTER INSERT | `activities` | `maintain_sales_streaks` |  |
| tr_notify_battle_victory | AFTER UPDATE | `sales_battles` | `fn_notify_victory` | `NEW.status = 'completed'` |
| tr_sync_total_xp | AFTER INSERT | `xp_history` | `sync_total_xp` |  |
| tr_sync_bets_sales | AFTER INSERT OR UPDATE OR DELETE | `sales` | `sync_performance_bets` |  |
| tr_sync_bets_activities | AFTER INSERT OR UPDATE OR DELETE | `activities` | `sync_performance_bets` |  |
| tr_sync_territory | AFTER INSERT OR UPDATE OR DELETE | `sales` | `sync_territory_ownership` |  |
| update_bets_on_sale | AFTER INSERT OR UPDATE | `sales` | `trigger_update_performance_bets` |  |
| update_bets_on_activity | AFTER INSERT OR UPDATE | `activities` | `trigger_update_performance_bets` |  |
| update_territories_on_sale | AFTER INSERT OR UPDATE | `sales` | `trigger_update_territories` |  |
| refresh_monthly_summary_on_sale | AFTER INSERT OR UPDATE OR DELETE | `sales` | `trigger_refresh_monthly_summary` |  |
| tr_update_bets_on_sale | AFTER INSERT | `sales` | `process_performance_bet_event` |  |
| tr_update_bets_on_activity | AFTER INSERT | `activities` | `process_performance_bet_event` |  |
| tr_performance_update_sales | AFTER INSERT OR UPDATE | `sales` | `handle_performance_update` |  |
| tr_performance_update_activities | AFTER INSERT OR UPDATE | `activities` | `handle_performance_update` |  |
| tr_territory_conquest | AFTER INSERT | `sales` | `handle_territory_conquest` | `NEW.status = 'won' OR NEW.status = 'completed'` |
| update_enriched_company_intelligence_updated_at | BEFORE UPDATE | `enriched_company_intelligence` | `update_updated_at_column` |  |
| update_person_intelligence_updated_at | BEFORE UPDATE | `person_intelligence` | `update_updated_at_column` |  |
| update_account_plans_updated_at | BEFORE UPDATE | `account_plans` | `update_updated_at_column` |  |
| update_cs_tickets_updated_at | BEFORE UPDATE | `cs_tickets` | `update_updated_at_column` |  |
| update_client_renewals_updated_at | BEFORE UPDATE | `client_renewals` | `update_updated_at_column` |  |
| trg_refresh_ranking_on_sale_change | AFTER INSERT OR UPDATE OR DELETE | `sales` | `trg_refresh_ranking_on_sale` |  |
| tr_set_sdr_id | BEFORE INSERT | `sales` | `set_sdr_id_on_insert` |  |
| tr_handle_sale_commissions | AFTER INSERT OR UPDATE | `sales` | `handle_sale_commissions` |  |
| set_updated_at | BEFORE UPDATE | `external_seller_map` | `handle_updated_at` |  |
| set_updated_at | BEFORE UPDATE | `v4_callback_dead_letters` | `handle_updated_at` |  |
| trg_convert_quote_to_order | AFTER INSERT OR UPDATE OF STATUS | `quotes` | `convert_quote_to_order` |  |
| trg_enqueue_v4_callback | AFTER UPDATE OF STATUS | `quotes` | `enqueue_v4_callback` |  |
| v4_callback_metrics_updated_at | BEFORE UPDATE | `v4_callback_metrics` | `update_updated_at_column` |  |
| trg_quotes_inbound_updated_at | BEFORE UPDATE | `quotes_inbound` | `set_quotes_inbound_updated_at` |  |
| trg_normalize_quotes_inbound | BEFORE INSERT OR UPDATE | `quotes_inbound` | `fn_normalize_quotes_inbound` |  |
| trg_auto_map_inbound_seller | AFTER INSERT OR UPDATE OF SELLER_EMAIL | `quotes_inbound` | `fn_auto_map_inbound_seller` |  |
| trg_ai_narrative_cache_updated_at | BEFORE UPDATE | `ai_narrative_cache` | `update_updated_at_column` |  |
| call_recording_ingest_jobs_updated_at | BEFORE UPDATE | `call_recording_ingest_jobs` | `update_updated_at_column` |  |
| trg_forecast_cache_invalidate | AFTER UPDATE | `revenue_forecasts` | `trg_invalidate_forecast_narrative_cache` |  |
| trg_pab_updated_at | BEFORE UPDATE | `personal_assistant_briefings` | `update_updated_at_column` |  |
| trg_pa_nudges_updated_at | BEFORE UPDATE | `personal_assistant_nudges` | `update_updated_at_column` |  |
| trg_pa_nudges_protect | BEFORE UPDATE | `personal_assistant_nudges` | `protect_pa_nudge_content` |  |
| update_commission_bonuses_updated_at | BEFORE UPDATE | `commission_bonuses` | `update_updated_at_column` |  |
| update_commission_bonus_awards_updated_at | BEFORE UPDATE | `commission_bonus_awards` | `update_updated_at_column` |  |
| trg_notify_bonus_paid | AFTER INSERT OR UPDATE OF STATUS | `commission_bonus_awards` | `notify_salesperson_on_bonus_paid` | `NEW.status = 'paid'` |
| trg_auto_task_queue_settings_updated_at | BEFORE UPDATE | `auto_task_queue_settings` | `update_updated_at_column` |  |
| trg_stage_inactivity_rules_updated | BEFORE UPDATE | `stage_inactivity_rules` | `update_updated_at_column` |  |
| trg_campaign_health_alerts_updated | BEFORE UPDATE | `campaign_health_alerts` | `update_updated_at_column` |  |
| trg_email_bulk_drafts_recovery | BEFORE UPDATE | `email_bulk_drafts` | `track_bulk_draft_recovery` |  |
| trg_website_visitor_log_consent | BEFORE INSERT | `website_visitor_logs` | `fn_website_visitor_log_consent` |  |
| trg_audit_user_roles | AFTER INSERT OR UPDATE OR DELETE | `user_roles` | `audit_user_roles_change` |  |
| trg_enforce_status_transition | BEFORE UPDATE OF STATUS | `sales` | `enforce_status_transition` |  |
| trg_enforce_status_transition | BEFORE UPDATE OF STATUS | `commissions` | `enforce_status_transition` |  |
| tr_victory_sale | AFTER UPDATE | `sales` | `auto_victory_post` | `OLD.deal_status IS DISTINCT FROM NEW.deal_status` |
| tr_notify_sale_victory | AFTER UPDATE | `sales` | `fn_notify_victory` | `NEW.deal_status = 'completed'` |
| trg_sales_stamp_closed_at | BEFORE INSERT OR UPDATE OF STATUS | `sales` | `trg_sales_stamp_closed_at` |  |
| trg_deal_stage_history | AFTER INSERT OR UPDATE OF STATUS | `sales` | `trg_deal_stage_history` |  |
| trg_integration_secret_refs_updated_at | BEFORE UPDATE | `integration_secret_refs` | `update_updated_at_column` |  |
| trg_race_cars_guard_counters | BEFORE INSERT OR UPDATE | `race_cars` | `race_cars_guard_counters` |  |
| trg_data_subject_requests_guard_payload | BEFORE INSERT OR UPDATE OF PAYLOAD | `data_subject_requests` | `data_subject_requests_guard_payload` |  |

Erros lançados por funções SQL (`RAISE EXCEPTION` = regra de negócio no banco):

| Função | Mensagem | Origem |
|---|---|---|
| `validate_mood_value` | mood_score must be between 1 and 5 | `supabase/migrations/20260402110711_bc8566d0-e7aa-476b-870c-7d517defb199.sql` |
| `update_user_mfa_settings` | Not authenticated | `supabase/migrations/20260404155258_7109bf7e-3093-412b-97a9-e67436fd98ba.sql` |
| `update_user_mfa_settings` | Invalid preferred_method. Must be totp, sms, or none. | `supabase/migrations/20260404155258_7109bf7e-3093-412b-97a9-e67436fd98ba.sql` |
| `update_own_sale` | Not authenticated as a salesperson | `supabase/migrations/20260412115357_dcf9ab46-7f4b-484f-bf6f-7a87bcbc40f7.sql` |
| `update_own_sale` | Sale not found or not owned by you | `supabase/migrations/20260412115357_dcf9ab46-7f4b-484f-bf6f-7a87bcbc40f7.sql` |
| `increment_sales_streak` | Not authorized | `supabase/migrations/20260412115439_2c138808-113d-4264-aa0d-82a9a94875fa.sql` |
| `increment_combo` | Not authorized | `supabase/migrations/20260412115439_2c138808-113d-4264-aa0d-82a9a94875fa.sql` |
| `increment_goal_progress` | Not authorized | `supabase/migrations/20260412115439_2c138808-113d-4264-aa0d-82a9a94875fa.sql` |
| `increment_goal_progress` | Invalid increment (must be 1-100) | `supabase/migrations/20260412115439_2c138808-113d-4264-aa0d-82a9a94875fa.sql` |
| `add_league_weekly_xp` | Not authorized | `supabase/migrations/20260412115439_2c138808-113d-4264-aa0d-82a9a94875fa.sql` |
| `add_league_weekly_xp` | Invalid XP amount | `supabase/migrations/20260412115439_2c138808-113d-4264-aa0d-82a9a94875fa.sql` |
| `toggle_workflow_active` | Not authorized | `supabase/migrations/20260416200128_9a349ada-690b-440b-b745-6f94b7e4160e.sql` |
| `compute_cohort_retention` | Cohort não encontrado ou sem permissão | `supabase/migrations/20260416234424_66fbe1df-5677-4a6c-bea6-daf700e06009.sql` |
| `declare_step_winner` | Not authorized | `supabase/migrations/20260417004724_5b69c678-9bcb-4757-afa3-c7f08a0bd49c.sql` |
| `declare_step_winner` | Variant not found | `supabase/migrations/20260417004724_5b69c678-9bcb-4757-afa3-c7f08a0bd49c.sql` |
| `update_call_recording_transcript` | Recording not found | `supabase/migrations/20260417115509_514f0fe4-af62-4b72-aec8-3ce37b4ed9ac.sql` |
| `update_call_recording_transcript` | Not authorized to update this recording | `supabase/migrations/20260417115509_514f0fe4-af62-4b72-aec8-3ce37b4ed9ac.sql` |
| `update_call_recording_diarization` | Recording not found | `supabase/migrations/20260417120210_00a66fee-a4de-44a1-97ab-db5926583629.sql` |
| `update_call_recording_diarization` | Not authorized | `supabase/migrations/20260417120210_00a66fee-a4de-44a1-97ab-db5926583629.sql` |
| `update_call_recording_summary` | Recording not found | `supabase/migrations/20260417122626_dc9224cc-f218-47fe-8306-93dcad7150f4.sql` |
| `update_call_recording_summary` | Not authorized | `supabase/migrations/20260417122626_dc9224cc-f218-47fe-8306-93dcad7150f4.sql` |
| `update_call_recording_summary` | Invalid sentiment value | `supabase/migrations/20260417122626_dc9224cc-f218-47fe-8306-93dcad7150f4.sql` |
| `create_activities_from_action_items` | Recording not found | `supabase/migrations/20260417122626_dc9224cc-f218-47fe-8306-93dcad7150f4.sql` |
| `create_activities_from_action_items` | Not authorized | `supabase/migrations/20260417122626_dc9224cc-f218-47fe-8306-93dcad7150f4.sql` |
| `mark_entity_for_reindex` | forbidden | `supabase/migrations/20260417155732_08d9a90e-f30b-4744-8c96-8f455d1b5a03.sql` |
| `next_dialer_item` | Not authorized for queue % | `supabase/migrations/20260417181059_373308ac-cd9e-4c9f-b695-1c5b3ba6d799.sql` |
| `grant_task_xp` | Only admins can grant XP | `supabase/migrations/20260418150311_9352a6b4-c8a3-4503-a0ff-c3fc0f22d8f3.sql` |
| `grant_task_xp` | Assignment not found | `supabase/migrations/20260418150311_9352a6b4-c8a3-4503-a0ff-c3fc0f22d8f3.sql` |
| `manual_xp_adjustment` | Only admins can adjust XP | `supabase/migrations/20260418150311_9352a6b4-c8a3-4503-a0ff-c3fc0f22d8f3.sql` |
| `manual_xp_adjustment` | Reason is required (min 3 chars) | `supabase/migrations/20260418150311_9352a6b4-c8a3-4503-a0ff-c3fc0f22d8f3.sql` |
| `assign_task_to_squad` | Only admins can assign tasks to squads | `supabase/migrations/20260418151200_f3721bce-9ab4-4188-aacd-524d2fbc3ffe.sql` |
| `bulk_approve_assignments` | Only admins can bulk approve | `supabase/migrations/20260418151200_f3721bce-9ab4-4188-aacd-524d2fbc3ffe.sql` |
| `finalize_race_season` | Apenas administradores podem finalizar temporadas | `supabase/migrations/20260418162310_4e1bd709-f02a-48bd-a65e-c9a4f0036498.sql` |
| `finalize_race_season` | Temporada não encontrada | `supabase/migrations/20260418162310_4e1bd709-f02a-48bd-a65e-c9a4f0036498.sql` |
| `validate_race_event` | race_event rejected: season % does not exist | `supabase/migrations/20260419145440_18e5089e-576c-497e-8cb9-3fce68746a1b.sql` |
| `validate_race_event` | race_event rejected: season % is not active (status=%) | `supabase/migrations/20260419145440_18e5089e-576c-497e-8cb9-3fce68746a1b.sql` |
| `validate_race_event` | race_event rejected: no race_car found for salesperson % | `supabase/migrations/20260419145440_18e5089e-576c-497e-8cb9-3fce68746a1b.sql` |
| `send_notification` | Not authorized to send notification to other users | `supabase/migrations/20260512213357_15e3dcb3-7cf3-4f6e-9af2-21233a6401d4.sql` |
| `get_dashboard_kpis` | not_authenticated | `supabase/migrations/20260627185517_2ad2ea8a-25bf-4972-a0fe-c533b2571a13.sql` |
| `increment_v4_callback_metric` | invalid metric column: % | `supabase/migrations/20260706163053_2452df1f-1769-439c-87fd-46103e8bedbc.sql` |
| `fn_backfill_orders_conversion_seq` | [NOT_AUTHENTICATED] Sessão ausente | `supabase/migrations/20260708134842_fd3e5f78-b315-4078-8bb1-315778671975.sql` |
| `fn_backfill_orders_conversion_seq` | [FORBIDDEN] Apenas administradores podem reexecutar o backfill | `supabase/migrations/20260708134842_fd3e5f78-b315-4078-8bb1-315778671975.sql` |
| `fn_convert_quote_to_sale` | [NOT_AUTHENTICATED] Sessão inválida ou expirada | `supabase/migrations/20260710142606_502f6e24-0b43-463f-9cc3-202ff44796a6.sql` |
| `fn_convert_quote_to_sale` | [QUOTE_NOT_FOUND] Orçamento não encontrado | `supabase/migrations/20260710142606_502f6e24-0b43-463f-9cc3-202ff44796a6.sql` |
| `fn_convert_quote_to_sale` | [FORBIDDEN] Você não tem permissão para converter este orçamento | `supabase/migrations/20260710142606_502f6e24-0b43-463f-9cc3-202ff44796a6.sql` |
| `fn_convert_quote_to_sale` | [INVALID_STATUS] Orçamento precisa estar aprovado/aceito. Status atual: % | `supabase/migrations/20260710142606_502f6e24-0b43-463f-9cc3-202ff44796a6.sql` |
| `fn_convert_quote_to_sale` | [INVALID_TOTAL] Valor total do orçamento inválido | `supabase/migrations/20260710142606_502f6e24-0b43-463f-9cc3-202ff44796a6.sql` |
| `fn_convert_quote_to_sale` | [EMPTY_ITEMS] Orçamento sem itens não pode virar venda | `supabase/migrations/20260710142606_502f6e24-0b43-463f-9cc3-202ff44796a6.sql` |
| `fn_convert_quote_to_sale` | [TOTAL_MISMATCH] Total do orçamento (%) não bate com a soma dos itens (%) | `supabase/migrations/20260710142606_502f6e24-0b43-463f-9cc3-202ff44796a6.sql` |
| `fn_admin_platform_slo` | permission denied: admin role required | `supabase/migrations/20260711145130_b2c8eda9-8da9-46fe-aefe-3b950fa412d1.sql` |
| `fn_record_conversion_attempt` | [NOT_AUTHENTICATED] auth.uid() ausente | `supabase/migrations/20260711151406_fd14194a-1b24-422f-bd8a-c274b1fe60e6.sql` |
| `fn_admin_conversion_trail` | [NOT_AUTHENTICATED] auth.uid() ausente | `supabase/migrations/20260711151406_fd14194a-1b24-422f-bd8a-c274b1fe60e6.sql` |
| `fn_admin_conversion_trail` | [FORBIDDEN] admin role requerido | `supabase/migrations/20260711151406_fd14194a-1b24-422f-bd8a-c274b1fe60e6.sql` |
| `fn_admin_conversion_trail` | [INVALID_INPUT] informe quote_id ou sale_id | `supabase/migrations/20260711151406_fd14194a-1b24-422f-bd8a-c274b1fe60e6.sql` |
| `fn_admin_cleanup_stale_logs` | permission denied: admin role required | `supabase/migrations/20260711153757_a957a586-25a5-45a6-8ace-6f4e9f859d0f.sql` |
| `fn_admin_web_vitals_p75` | permission denied: admin role required | `supabase/migrations/20260711153757_a957a586-25a5-45a6-8ace-6f4e9f859d0f.sql` |
| `fn_admin_reset_circuit` | permission denied: admin role required | `supabase/migrations/20260711153757_a957a586-25a5-45a6-8ace-6f4e9f859d0f.sql` |
| `fn_admin_reset_circuit` | circuit_name required | `supabase/migrations/20260711153757_a957a586-25a5-45a6-8ace-6f4e9f859d0f.sql` |
| `admin_get_cron_job_stats` | FORBIDDEN | `supabase/migrations/20260712213630_85d48e51-71fa-4a2f-8161-ece309fe0345.sql` |
| `purge_old_telemetry` | refusing to purge with retention < 7 days (got %) | `supabase/migrations/20260712220130_4232377c-8085-469d-af1b-ea13afa5219a.sql` |
| `admin_top_queries` | access denied | `supabase/migrations/20260712220239_7d875e88-07c9-45c0-a739-7cc51a5dce4a.sql` |
| `admin_reset_query_stats` | access denied | `supabase/migrations/20260712220239_7d875e88-07c9-45c0-a739-7cc51a5dce4a.sql` |
| `complete_call_recording_ingest_job` | job % not found | `supabase/migrations/20260712230117_598d71a5-beaa-46b3-876a-df1bde70d0f7.sql` |
| `fn_test_simulate_stalled_check` | fn_test_simulate_stalled_check requires negative synthetic jobid | `supabase/migrations/20260712230734_420fceb1-d58c-42bb-bf6e-5b61c50d6020.sql` |
| `fn_test_cleanup_cron_alerts` | requires negative synthetic jobid | `supabase/migrations/20260712230734_420fceb1-d58c-42bb-bf6e-5b61c50d6020.sql` |
| `fn_test_backdate_cron_alert` | requires negative synthetic jobid | `supabase/migrations/20260712230734_420fceb1-d58c-42bb-bf6e-5b61c50d6020.sql` |
| `fn_test_mark_cron_failure` | fn_test_mark_cron_failure requires negative synthetic jobid | `supabase/migrations/20260712230906_1031d7dd-3d6d-4eca-9312-36fdb4432c9b.sql` |
| `fn_admin_cron_alert_metrics` | access denied | `supabase/migrations/20260712231310_b4d39c3c-b39d-45f4-a1f5-ae4cb06587aa.sql` |
| `fn_admin_get_new_cron_failures` | access denied | `supabase/migrations/20260712231501_204c3ba6-97ac-4159-9d75-4785991db844.sql` |
| `fn_admin_list_dead_letter_ingest_jobs` | access_denied | `supabase/migrations/20260712231649_1cc215fd-80c1-4e9e-badb-b88ef75c6317.sql` |
| `fn_admin_replay_dead_letter_ingest_job` | access_denied | `supabase/migrations/20260712232718_6cfc1884-5c14-4d44-b3b3-ba91edde064a.sql` |
| `protect_pa_nudge_content` | nudge.content is immutable | `supabase/migrations/20260723122258_04332939-3a35-43e1-b47e-9ec896a02355.sql` |
| `protect_pa_nudge_content` | nudge.salesperson_id is immutable | `supabase/migrations/20260723122258_04332939-3a35-43e1-b47e-9ec896a02355.sql` |
| `record_email_opt_out` | invalid_email | `supabase/migrations/20260726200015_4da82c03-38f9-4478-b6f8-5ba0e25d9cbe.sql` |
| `update_client_portfolio_status` | not_authenticated | `supabase/migrations/20260827000001_harden_webhooks_portfolio_and_idempotency.sql` |
| `update_client_portfolio_status` | portfolio_not_found | `supabase/migrations/20260827000001_harden_webhooks_portfolio_and_idempotency.sql` |
| `update_client_portfolio_status` | forbidden | `supabase/migrations/20260827000001_harden_webhooks_portfolio_and_idempotency.sql` |
| `reassign_inactive_client_portfolio` | Esta operação é exclusiva do serviço interno | `supabase/migrations/20260830000002_harden_lead_routing.sql` |
| `reassign_inactive_client_portfolio` | Limite de inatividade inválido | `supabase/migrations/20260830000002_harden_lead_routing.sql` |
| `reassign_inactive_client_portfolio` | Carteira não encontrada | `supabase/migrations/20260830000002_harden_lead_routing.sql` |
| `reassign_inactive_client_portfolio` | Carteira foi alterada desde a seleção do job | `supabase/migrations/20260830000002_harden_lead_routing.sql` |
| `reassign_inactive_client_portfolio` | Carteira não atingiu o limite de inatividade observado | `supabase/migrations/20260830000002_harden_lead_routing.sql` |
| `reassign_inactive_client_portfolio` | Vendedor de destino inválido | `supabase/migrations/20260830000002_harden_lead_routing.sql` |
| `reassign_inactive_client_portfolio` | Vendedor de destino inválido ou inativo | `supabase/migrations/20260830000002_harden_lead_routing.sql` |
| `get_login_lockout_status` | email_invalid | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `record_failed_login_attempt` | email_invalid | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `record_failed_login_attempt` | rate_limit_exceeded | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `record_successful_login_attempt` | not_authenticated | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `check_2fa_failed_attempts` | forbidden | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `log_security_event` | not_authenticated | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `log_security_event` | severity_invalid | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `log_security_event` | event_payload_invalid | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `soft_delete_record` | forbidden | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `soft_delete_record` | actor_mismatch | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `soft_delete_record` | unsupported_soft_delete_table | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `restore_deleted_record` | forbidden | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `restore_deleted_record` | actor_mismatch | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `restore_deleted_record` | unsupported_soft_delete_table | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `get_deleted_records` | forbidden | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `get_deleted_records` | unsupported_soft_delete_table | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `get_deleted_records` | limit_out_of_range | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `hard_delete_record` | forbidden | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `hard_delete_record` | unsupported_hard_delete_table | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `restore_record` | forbidden | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `restore_record` | unsupported_soft_delete_table | `supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql` |
| `detect_slow_queries` | thresholds_must_be_positive | `supabase/migrations/20260831130001_repair_cron_and_fk_indexes.sql` |
| `trigger_generate_urgent_client_tasks` | auto_task_queue_cron_secrets_missing | `supabase/migrations/20260831163000_secure_churn_and_task_crons.sql` |
| `trigger_generate_urgent_client_tasks` | auto_task_queue_cron_base_url_must_be_https | `supabase/migrations/20260831163000_secure_churn_and_task_crons.sql` |
| `trigger_detect_client_churn_alerts` | detect_client_churn_cron_secrets_missing | `supabase/migrations/20260831163000_secure_churn_and_task_crons.sql` |
| `trigger_detect_client_churn_alerts` | detect_client_churn_cron_base_url_must_be_https | `supabase/migrations/20260831163000_secure_churn_and_task_crons.sql` |
| `enforce_status_transition` | Transição de status inválida em %: % → % | `supabase/migrations/20261001213000_status_transitions_state_machine.sql` |
| `transition_commission_status` | Comissão não encontrada: % | `supabase/migrations/20261001213000_status_transitions_state_machine.sql` |
| `transition_commission_status` | not_authorized | `supabase/migrations/20261001213000_status_transitions_state_machine.sql` |
| `transition_commission_status` | Transição de status inválida em commissions: % → % | `supabase/migrations/20261001213000_status_transitions_state_machine.sql` |
| `add_salesperson_xp` | Not authorized | `supabase/migrations/20261001214000_app_config_sla_xp.sql` |
| `add_salesperson_xp` | Invalid XP amount (must be 1-10000) | `supabase/migrations/20261001214000_app_config_sla_xp.sql` |
| `transition_sale_status` | Venda não encontrada: % | `supabase/migrations/20261002020100_transition_sale_status_closer_owner.sql` |
| `transition_sale_status` | not_authorized | `supabase/migrations/20261002020100_transition_sale_status_closer_owner.sql` |
| `transition_sale_status` | optimistic_lock_conflict: versão esperada %, versão atual % | `supabase/migrations/20261002020100_transition_sale_status_closer_owner.sql` |
| `transition_sale_status` | Transição de status inválida em sales: % → % | `supabase/migrations/20261002020100_transition_sale_status_closer_owner.sql` |
| `fn_admin_cron_alert_breakdown` | access_denied | `supabase/migrations/20261005150000_fix_fn_admin_cron_alert_breakdown.sql` |
| `admin_edge_cron_status` | forbidden | `supabase/migrations/20261013122000_admin_edge_cron_status.sql` |
| `spin_prize_wheel` | Autenticação obrigatória para girar a roda | `supabase/migrations/20261014000000_gamificacao_server_side.sql` |
| `spin_prize_wheel` | Identificador idempotente obrigatório | `supabase/migrations/20261014000000_gamificacao_server_side.sql` |
| `spin_prize_wheel` | Perfil comercial não encontrado para o usuário autenticado | `supabase/migrations/20261014000000_gamificacao_server_side.sql` |
| `spin_prize_wheel` | Nenhum giro disponível | `supabase/migrations/20261014000000_gamificacao_server_side.sql` |
| `spin_prize_wheel` | Nenhum giro disponível | `supabase/migrations/20261014000000_gamificacao_server_side.sql` |
| `trigger_internal_edge_job` | internal_edge_job_not_allowed | `supabase/migrations/20261014000001_fix_allowlist_bitrix24_gamificacao.sql` |
| `trigger_internal_edge_job` | internal_edge_job_secrets_missing | `supabase/migrations/20261014000001_fix_allowlist_bitrix24_gamificacao.sql` |
| `trigger_internal_edge_job` | internal_edge_job_base_url_must_be_https | `supabase/migrations/20261014000001_fix_allowlist_bitrix24_gamificacao.sql` |
| `claim_weekly_challenge_reward` | Autenticação obrigatória para resgatar recompensa | `supabase/migrations/20261018190100_gamificacao_claim_matchups_rotations.sql` |
| `claim_weekly_challenge_reward` | Perfil comercial não encontrado para o usuário autenticado | `supabase/migrations/20261018190100_gamificacao_claim_matchups_rotations.sql` |
| `claim_weekly_challenge_reward` | Desafio não encontrado | `supabase/migrations/20261018190100_gamificacao_claim_matchups_rotations.sql` |
| `claim_weekly_challenge_reward` | Desafio não concluído ou recompensa já resgatada | `supabase/migrations/20261018190100_gamificacao_claim_matchups_rotations.sql` |
| `claim_daily_challenge_reward` | Autenticação obrigatória para resgatar recompensa | `supabase/migrations/20261018190100_gamificacao_claim_matchups_rotations.sql` |
| `claim_daily_challenge_reward` | Perfil comercial não encontrado para o usuário autenticado | `supabase/migrations/20261018190100_gamificacao_claim_matchups_rotations.sql` |
| `claim_daily_challenge_reward` | Desafio não encontrado | `supabase/migrations/20261018190100_gamificacao_claim_matchups_rotations.sql` |
| `claim_daily_challenge_reward` | Desafio não concluído ou recompensa já resgatada | `supabase/migrations/20261018190100_gamificacao_claim_matchups_rotations.sql` |
| `claim_streak_achievements` | Autenticação obrigatória para resgatar conquistas | `supabase/migrations/20261018190100_gamificacao_claim_matchups_rotations.sql` |
| `claim_streak_achievements` | Perfil comercial não encontrado para o usuário autenticado | `supabase/migrations/20261018190100_gamificacao_claim_matchups_rotations.sql` |
| `award_salesperson_xp` | forbidden: award_salesperson_xp é interno (service_role) | `supabase/migrations/20261019153000_lgpd_gamificacao_r2.sql` |
| `race_cars_guard_counters` | Contadores de corrida são gerenciados pelo servidor | `supabase/migrations/20261019153000_lgpd_gamificacao_r2.sql` |
| `race_cars_guard_counters` | Contadores de corrida são gerenciados pelo servidor | `supabase/migrations/20261019153000_lgpd_gamificacao_r2.sql` |
| `sync_challenge_progress` | Perfil comercial não encontrado | `supabase/migrations/20261019153000_lgpd_gamificacao_r2.sql` |
| `sync_challenge_progress` | forbidden: só o próprio progresso pode ser sincronizado | `supabase/migrations/20261019153000_lgpd_gamificacao_r2.sql` |
| `compute_pipeline_inspection` | Not authorized | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `route_unassigned_client_portfolio` | Apenas administradores e gestores podem rotear clientes | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `route_unassigned_client_portfolio` | client_id é obrigatório | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `route_unassigned_client_portfolio` | Estratégia de roteamento inválida: % | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `route_unassigned_client_portfolio` | salesperson_id é obrigatório para atribuição manual | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `route_unassigned_client_portfolio` | Cliente não encontrado | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `route_unassigned_client_portfolio` | Cliente já possui uma carteira; use o fluxo explícito de transferência | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `route_unassigned_client_portfolio` | Nenhum closer ou híbrido ativo está disponível para roteamento | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `route_unassigned_client_portfolio` | Vendedor de destino inválido ou inativo | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `auto_assign_lead` | Apenas administradores e gestores podem atribuir leads | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `auto_assign_lead` | sale_id é obrigatório | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `auto_assign_lead` | Venda não encontrada | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `auto_assign_lead` | Nenhuma regra ativa é compatível com a venda | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `auto_assign_lead` | Estratégia de regra não suportada: % | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `auto_assign_lead` | Nenhum vendedor ativo está disponível para atribuição | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `auto_assign_lead` | A venda já foi atribuída por outra operação | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `append_agent_step` | Run not found | `supabase/migrations/20261027130000_agent_runs_owner_check_e_grants.sql` |
| `append_agent_step` | Not authorized | `supabase/migrations/20261027130000_agent_runs_owner_check_e_grants.sql` |
| `complete_agent_run` | Run not found | `supabase/migrations/20261027130000_agent_runs_owner_check_e_grants.sql` |
| `complete_agent_run` | Not authorized | `supabase/migrations/20261027130000_agent_runs_owner_check_e_grants.sql` |
| `approve_agent_run` | Run not found | `supabase/migrations/20261027130000_agent_runs_owner_check_e_grants.sql` |
| `approve_agent_run` | Not authorized | `supabase/migrations/20261027130000_agent_runs_owner_check_e_grants.sql` |
| `create_agent_run` | No salesperson context | `supabase/migrations/20261027131000_agent_runs_r3_rls_lockdown.sql` |
| `create_agent_run` | Target entity not found | `supabase/migrations/20261027131000_agent_runs_r3_rls_lockdown.sql` |
| `create_agent_run` | Target entity not owned by caller | `supabase/migrations/20261027131000_agent_runs_r3_rls_lockdown.sql` |
| `anonymize_data_subject` | forbidden: somente admin/manager ou service_role podem anonimizar titulares | `supabase/migrations/20261027140000_lgpd_gamificacao_r3.sql` |
| `anonymize_data_subject` | pelo menos um identificador do titular é obrigatório (email, subject_id, phone ou ip) | `supabase/migrations/20261027140000_lgpd_gamificacao_r3.sql` |
| `award_sale_xp` | Autenticação obrigatória | `supabase/migrations/20261027140000_lgpd_gamificacao_r3.sql` |
| `award_sale_xp` | Venda não encontrada | `supabase/migrations/20261027140000_lgpd_gamificacao_r3.sql` |
| `get_semantic_coverage` | forbidden | `supabase/migrations/20261027210000_r3_db_kpis_fixes.sql` |
| `award_bonus_if_eligible` | not authenticated | `supabase/migrations/20261027210000_r3_db_kpis_fixes.sql` |

## E. Estados, máquinas de estado e transições

### E.1 Colunas de status no banco

| Tabela | Coluna | Valores permitidos (enum/CHECK) | Default |
|---|---|---|---|
| `sales` | `status` | `cancelled`, `closed`, `completed`, `lead`, `lost`, `negotiation`, `pending`, `proposal`, `prospecting`, `qualified`, `won` | `pending` |
| `sales` | `stage` | **livre (sem enum/CHECK)** |  |
| `sales` | `deal_status` | **livre (sem enum/CHECK)** |  |
| `sales` | `enrichment_status` | **livre (sem enum/CHECK)** |  |
| `sales` | `whatsapp_status` | **livre (sem enum/CHECK)** |  |
| `deal_stage_history` | `stage` | **livre (sem enum/CHECK)** |  |
| `tasks` | `status` | `pending`, `in_progress`, `completed`, `cancelled` | `pending` |
| `playbooks` | `stage` | **livre (sem enum/CHECK)** |  |
| `activities` | `lead_status` | **livre (sem enum/CHECK)** | `prospect` |
| `cadence_steps` | `step_order` | **livre (sem enum/CHECK)** |  |
| `cadence_steps` | `step_type` | `call`, `email`, `linkedin`, `task` |  |
| `prospect_cadences` | `status` | `active`, `cancelled`, `completed`, `paused` | `active` |
| `prospect_cadences` | `current_step` | **livre (sem enum/CHECK)** | `0` |
| `prospect_cadences` | `funnel_stage` | `high_interest`, `new`, `scheduled`, `waiting_approval` | `new` |
| `cadence_tasks` | `status` | `completed`, `pending`, `skipped` | `pending` |
| `products` | `status` | **livre (sem enum/CHECK)** | `ativo` |
| `circuit_breaker_events` | `previous_state` | **livre (sem enum/CHECK)** |  |
| `circuit_breaker_events` | `new_state` | **livre (sem enum/CHECK)** |  |
| `client_portfolio` | `status` | `active`, `at_risk`, `churned`, `inactive`, `nurturing` | `inactive` |
| `bitrix24_sync_logs` | `status` | **livre (sem enum/CHECK)** | `success` |
| `email_logs` | `status` | **livre (sem enum/CHECK)** | `sent` |
| `suppliers` | `state` | **livre (sem enum/CHECK)** |  |
| `supplier_orders` | `status` | `cancelled`, `confirmed`, `delivered`, `pending`, `shipped` | `pending` |
| `digital_signatures` | `status` | `draft`, `expired`, `pending`, `rejected`, `signed` | `draft` |
| `document_signers` | `status` | `pending`, `rejected`, `signed` | `pending` |
| `migration_log` | `status` | **livre (sem enum/CHECK)** |  |
| `password_reset_requests` | `status` | `approved`, `completed`, `expired`, `pending`, `rejected` | `pending` |
| `webhook_logs` | `response_status` | **livre (sem enum/CHECK)** |  |
| `webhook_logs` | `status` | **livre (sem enum/CHECK)** |  |
| `webhook_events` | `status` | `failed`, `pending`, `success` | `pending` |
| `quotes` | `status` | **livre (sem enum/CHECK)** | `draft` |
| `quotes` | `billing_status` | **livre (sem enum/CHECK)** | `pending` |
| `quotes` | `sync_status` | **livre (sem enum/CHECK)** |  |
| `quote_sync_logs` | `status` | **livre (sem enum/CHECK)** |  |
| `sales_battles` | `status` | **livre (sem enum/CHECK)** | `active` |
| `competitive_seasons` | `status` | **livre (sem enum/CHECK)** | `active` |
| `weekly_matchups` | `status` | **livre (sem enum/CHECK)** | `active` |
| `tournaments` | `status` | `active`, `completed`, `upcoming` | `upcoming` |
| `tournament_matches` | `status` | `active`, `completed`, `pending` | `pending` |
| `performance_bets` | `status` | `active`, `cancelled`, `lost`, `won` | `active` |
| `message_templates` | `pipeline_stage` | **livre (sem enum/CHECK)** |  |
| `channel_interactions` | `status` | `delivered`, `failed`, `read`, `replied`, `scheduled`, `sent` | `sent` |
| `pipeline_stages` | `stage_order` | **livre (sem enum/CHECK)** | `0` |
| `nps_surveys` | `status` | `pending`, `responded`, `sent` | `pending` |
| `commissions` | `status` | `approved`, `cancelled`, `paid`, `pending` | `pending` |
| `agenda_events` | `status` | `cancelled`, `completed`, `in_progress`, `pending` | `pending` |
| `approval_requests` | `status` | `approved`, `cancelled`, `expired`, `pending`, `rejected` | `pending` |
| `webhook_deliveries` | `response_status` | **livre (sem enum/CHECK)** |  |
| `sla_policies` | `stage` | **livre (sem enum/CHECK)** |  |
| `sla_violations` | `stage` | **livre (sem enum/CHECK)** |  |
| `sla_violations` | `hours_in_stage` | **livre (sem enum/CHECK)** | `0` |
| `sla_violations` | `status` | **livre (sem enum/CHECK)** | `warning` |
| `lead_routing_rules` | `filter_state` | **livre (sem enum/CHECK)** |  |
| `workflow_executions` | `status` | **livre (sem enum/CHECK)** | `pending` |
| `workflow_executions` | `step_log` | **livre (sem enum/CHECK)** |  |
| `cadence_enrollment_rules` | `trigger_stage` | **livre (sem enum/CHECK)** |  |
| `cadence_ab_tests` | `status` | **livre (sem enum/CHECK)** | `draft` |
| `call_recordings` | `status` | `analyzing`, `failed`, `pending`, `ready`, `transcribing` | `pending` |
| `deal_health_scores` | `days_in_stage` | **livre (sem enum/CHECK)** |  |
| `accounts` | `health_status` | `at_risk`, `critical`, `healthy`, `unknown` | `unknown` |
| `automation_runs` | `status` | `failed`, `partial`, `skipped`, `success` | `success` |
| `sales_enablement_assets` | `funnel_stage` | **livre (sem enum/CHECK)** |  |
| `pipeline_inspection_snapshots` | `stage` | **livre (sem enum/CHECK)** |  |
| `pipeline_inspection_snapshots` | `days_in_stage` | **livre (sem enum/CHECK)** | `0` |
| `support_tickets` | `status` | **livre (sem enum/CHECK)** | `open` |
| `renewals` | `status` | **livre (sem enum/CHECK)** | `upcoming` |
| `onboarding_journeys` | `status` | **livre (sem enum/CHECK)** | `not_started` |
| `onboarding_journeys` | `current_step` | **livre (sem enum/CHECK)** | `0` |
| `onboarding_steps` | `status` | **livre (sem enum/CHECK)** | `pending` |
| `expansion_opportunities` | `status` | **livre (sem enum/CHECK)** | `identified` |
| `report_executions` | `status` | `failed`, `pending`, `running`, `success` | `pending` |
| `scheduled_report_runs` | `status` | `failed`, `running`, `success` | `running` |
| `sequence_steps` | `step_order` | **livre (sem enum/CHECK)** |  |
| `sequence_enrollments` | `status` | `active`, `completed`, `exited`, `failed`, `paused` | `active` |
| `sequence_enrollments` | `current_step` | **livre (sem enum/CHECK)** | `0` |
| `sequence_step_executions` | `status` | `failed`, `queued`, `sent`, `skipped` |  |
| `outbound_messages` | `status` | `delivered`, `failed`, `queued`, `read`, `sent` | `queued` |
| `ai_agent_runs` | `status` | `awaiting_approval`, `cancelled`, `completed`, `failed`, `pending`, `running` | `pending` |
| `ai_agent_actions` | `step_index` | **livre (sem enum/CHECK)** |  |
| `ai_agent_actions` | `status` | `error`, `executing`, `pending_approval`, `skipped`, `success` | `success` |
| `email_bulk_jobs` | `status` | **livre (sem enum/CHECK)** | `draft` |
| `scheduled_sends` | `status` | `cancelled`, `failed`, `pending`, `sent` | `pending` |
| `dialer_queue_items` | `status` | `calling`, `done`, `pending`, `skipped`, `snoozed` | `pending` |
| `twilio_call_sessions` | `status` | **livre (sem enum/CHECK)** | `initiated` |
| `coaching_actions` | `status` | `accepted`, `dismissed`, `pending`, `practiced` | `pending` |
| `call_critical_moments` | `status` | `acknowledged`, `actioned`, `dismissed`, `new` | `new` |
| `deal_velocity_predictions` | `velocity_status` | `ahead`, `on_track`, `slow`, `stalled` | `on_track` |
| `deal_velocity_predictions` | `current_stage` | **livre (sem enum/CHECK)** |  |
| `deal_velocity_predictions` | `days_in_stage` | **livre (sem enum/CHECK)** |  |
| `deal_velocity_predictions` | `expected_days_in_stage` | **livre (sem enum/CHECK)** |  |
| `deal_velocity_predictions` | `stage_velocity_ratio` | **livre (sem enum/CHECK)** |  |
| `stage_velocity_baselines` | `stage` | **livre (sem enum/CHECK)** |  |
| `stage_conversion_metrics` | `from_stage` | **livre (sem enum/CHECK)** |  |
| `stage_conversion_metrics` | `to_stage` | **livre (sem enum/CHECK)** |  |
| `stage_bottleneck_insights` | `stage` | **livre (sem enum/CHECK)** |  |
| `race_seasons` | `status` | `active`, `finished`, `upcoming` | `upcoming` |
| `pipeline_coverage_snapshots` | `stage` | **livre (sem enum/CHECK)** |  |
| `win_probability_calibrations` | `stage` | **livre (sem enum/CHECK)** |  |
| `quota_attainment_predictions` | `pace_status` | **livre (sem enum/CHECK)** |  |
| `call_objections` | `resolution_status` | **livre (sem enum/CHECK)** | `unresolved` |
| `deal_stage_transitions` | `from_stage` | **livre (sem enum/CHECK)** |  |
| `deal_stage_transitions` | `to_stage` | **livre (sem enum/CHECK)** |  |
| `deal_velocity_alerts` | `current_stage` | **livre (sem enum/CHECK)** |  |
| `deal_velocity_alerts` | `hours_in_stage` | **livre (sem enum/CHECK)** | `0` |
| `win_loss_analyses` | `lost_stage` | **livre (sem enum/CHECK)** |  |
| `win_calibration_buckets` | `stage` | **livre (sem enum/CHECK)** |  |
| `win_probability_deal_calibrations` | `stage` | **livre (sem enum/CHECK)** |  |
| `coaching_sessions` | `status` | `canceled`, `completed`, `scheduled` | `scheduled` |
| `task_assignments` | `status` | `pending`, `in_progress`, `submitted`, `approved`, `rejected` | `pending` |
| `winloss_webhook_subscriptions` | `last_status` | **livre (sem enum/CHECK)** |  |
| `winloss_webhook_deliveries` | `status` | **livre (sem enum/CHECK)** | `0` |
| `winloss_webhook_dead_letters` | `last_status` | **livre (sem enum/CHECK)** |  |
| `winloss_webhook_dead_letters` | `status` | `archived`, `pending`, `replayed`, `replaying` | `pending` |
| `winloss_webhook_dead_letters` | `last_replay_status` | **livre (sem enum/CHECK)** |  |
| `orders` | `status` | `cancelled`, `confirmed`, `delivered`, `pending`, `preparing`, `shipped` | `pending` |
| `order_status_events` | `status` | **livre (sem enum/CHECK)** |  |
| `winloss_webhook_replay_audit` | `http_status` | **livre (sem enum/CHECK)** | `0` |
| `integration_health_checks` | `status` | `success`, `failure`, `degraded`, `pending` |  |
| `integration_autotest_jobs` | `status` | **livre (sem enum/CHECK)** | `running` |
| `commercial_approval_requests` | `status` | `approved`, `pending`, `rejected` | `pending` |
| `follow_up_audit_logs` | `status` | **livre (sem enum/CHECK)** | `pending` |
| `follow_up_notifications` | `status` | **livre (sem enum/CHECK)** | `unread` |
| `cadence_funnel_rules` | `from_stage` | `high_interest`, `new`, `scheduled`, `waiting_approval` |  |
| `cadence_funnel_rules` | `to_stage` | `high_interest`, `new`, `scheduled`, `waiting_approval` |  |
| `cadence_outcome_rules` | `to_stage` | **livre (sem enum/CHECK)** |  |
| `duplicate_block_logs` | `status` | **livre (sem enum/CHECK)** | `Blocked` |
| `integration_logs` | `status` | **livre (sem enum/CHECK)** |  |
| `mql_qualifications` | `qualification_status` | **livre (sem enum/CHECK)** | `pending` |
| `lead_churn_risk` | `status` | `active`, `ignored`, `resolved` | `active` |
| `sale_notifications_audit` | `status` | **livre (sem enum/CHECK)** | `sent` |
| `enriched_company_intelligence` | `funding_stage` | **livre (sem enum/CHECK)** |  |
| `cs_tickets` | `status` | **livre (sem enum/CHECK)** | `open` |
| `client_renewals` | `status` | **livre (sem enum/CHECK)** | `pending` |
| `whatsapp_conversations` | `status` | **livre (sem enum/CHECK)** |  |
| `quote_sync_inbound_log` | `status` | `accepted`, `bad_request`, `duplicate`, `error`, `ignored`, `method_not_allowed`, `not_found`, `processed`, `rejected`, `unauthorized` |  |
| `quote_sync_inbound_log` | `http_status` | **livre (sem enum/CHECK)** |  |
| `quotes_inbound` | `status` | `approved`, `cancelled`, `converted`, `draft`, `expired`, `lost`, `open`, `pending`, `rejected`, `sent`, `won` |  |
| `webhook_inbound_log` | `http_status` | **livre (sem enum/CHECK)** |  |
| `maintenance_log` | `status` | `completed`, `failed`, `running`, `skipped` | `running` |
| `quote_conversion_audit` | `previous_status` | **livre (sem enum/CHECK)** |  |
| `quote_conversion_audit` | `new_status` | **livre (sem enum/CHECK)** |  |
| `cron_failure_alerts` | `status` | **livre (sem enum/CHECK)** |  |
| `call_recording_ingest_jobs` | `status` | `dead_letter`, `failed`, `pending`, `processing`, `succeeded` | `pending` |
| `forecast_narrative_dead_letters` | `http_status` | **livre (sem enum/CHECK)** |  |
| `commission_bonus_awards` | `status` | `cancelled`, `paid`, `pending` | `pending` |
| `stage_inactivity_rules` | `stage` | **livre (sem enum/CHECK)** |  |
| `data_subject_requests` | `status` | `completed`, `in_progress`, `pending`, `rejected` | `pending` |
| `status_transitions` | `status_origem` | **livre (sem enum/CHECK)** |  |
| `status_transitions` | `status_destino` | **livre (sem enum/CHECK)** |  |
| `stage_probabilities` | `stage` | **livre (sem enum/CHECK)** |  |
| `plan_rollback_ddl` | `etapa` | **livre (sem enum/CHECK)** |  |

### E.2 Mapas de transição declarados no código

_nenhum mapa explícito encontrado — transições só existem implicitamente nos `if`s (veja E.3)_

### E.3 Valores de status usados no código (escreve / compara / filtra)

| Campo | Valor | Uso | Onde |
|---|---|---|---|
| `type` | `ADD` | compara | `supabase/functions/ranking-api/index.ts` |
| `type` | `Permanent` | escreve | `supabase/functions/_shared/unsubscribe_test.ts` |
| `type` | `SET` | compara | `supabase/functions/ranking-api/index.ts` |
| `type` | `SKIP_WAITING` | compara, escreve | `public/sw.js`<br>`src/lib/swUpdater.ts` |
| `type` | `Transient` | escreve | `supabase/functions/_shared/unsubscribe_test.ts` |
| `type` | `action` | compara, escreve | `src/pages/WorkflowsPage.tsx`<br>`supabase/functions/workflow-executor/index.ts` |
| `type` | `activities_today` | escreve | `src/hooks/dashboard/useDashboardLayout.ts` |
| `type` | `activity` | compara, escreve | `src/components/win-loss/DealTimelineExpand.tsx`<br>`src/hooks/useDealTimeline.ts`<br>`src/hooks/useTeamActivityFeed.ts`<br>`supabase/functions/semantic-index-entity/index.ts` |
| `type` | `admin_summary` | escreve | `supabase/functions/sdr-consecutive-alerts/index.ts` |
| `type` | `ai_sales_coach` | escreve | `src/hooks/dashboard/useDashboardLayout.ts` |
| `type` | `analysis` | escreve | `src/components/assistant/constants.ts` |
| `type` | `array` | escreve | `supabase/functions/ai-agent-orchestrator/index.ts`<br>`supabase/functions/ai-email-composer/index.ts`<br>`supabase/functions/analyze-pipeline-coverage/index.ts`<br>`supabase/functions/analyze-sentiment-timeline/index.ts`<br>`supabase/functions/analyze-skill-gaps/index.ts`<br>… +21 |
| `type` | `assign_owner` | escreve | `supabase/functions/territory-optimization/index.ts` |
| `type` | `at_risk_goal` | escreve | `src/hooks/notifications/useAlerts.ts`<br>`supabase/functions/send-alert-notifications/index.ts` |
| `type` | `authentication` | escreve | `supabase/functions/webauthn/index.ts` |
| `type` | `badge` | escreve | `src/hooks/gamification/usePrizeWheel.ts` |
| `type` | `battlecard` | escreve | `src/components/conversational/LiveIntelligenceFeed.tsx` |
| `type` | `bool` | escreve | `src/hooks/reporting/reportBuilderHelpers.ts` |
| `type` | `boolean` | compara, escreve | `src/components/engagement/PulseSurveyWidget.tsx` |
| `type` | `boost` | compara | `src/hooks/race/useRaceSounds.ts` |
| `type` | `bounce` | compara | `supabase/functions/_shared/unsubscribe.ts` |
| `type` | `calendar_preview` | escreve | `src/hooks/dashboard/useDashboardLayout.ts` |
| `type` | `call` | compara, escreve | `src/components/pipeline/QuickActionsMenu.tsx`<br>`src/components/sales/cadence/ApprovalQueue.tsx`<br>`src/components/sales/cadence/CadenceTemplateManager.tsx`<br>`src/components/tasks/NextBestAction.tsx`<br>`src/types/index.ts` |
| `type` | `call_now` | compara | `src/components/tasks/NextBestAction.tsx` |
| `type` | `call_recording` | compara | `supabase/functions/semantic-index-entity/index.ts` |
| `type` | `change_stage` | compara, escreve | `src/components/pipeline/QuickActionsMenu.tsx` |
| `type` | `chat` | compara, escreve | `src/components/win-loss/DealTimelineExpand.tsx`<br>`src/hooks/useDealTimeline.ts` |
| `type` | `checkpoint` | compara, escreve | `src/hooks/race/useRaceSounds.ts`<br>`supabase/functions/process-race-event/index.ts` |
| `type` | `churn_alert` | escreve, filtra | `src/components/admin/churn/ChurnHistoryChart.tsx`<br>`src/pages/AdminHistoricoAlertasChurn.tsx`<br>`supabase/functions/detect-client-churn-alerts/index.ts` |
| `type` | `client` | compara, escreve | `src/components/molecules/GlobalSearch.tsx`<br>`supabase/functions/semantic-index-entity/index.ts` |
| `type` | `clients` | compara | `src/components/dashboard/DashboardEmptyState.tsx` |
| `type` | `closing` | escreve | `src/components/assistant/constants.ts` |
| `type` | `combo_tier` | compara | `src/hooks/race/useRaceSounds.ts` |
| `type` | `commission` | compara, escreve | `src/pages/admin/AdminComercial.tsx` |
| `type` | `comparison` | escreve | `src/components/conversational/NeuralSentimentTimeline.tsx`<br>`src/components/conversational/RecordingSummaryDrawer.tsx` |
| `type` | `competitor` | compara, escreve | `src/components/conversational/LiveIntelligenceFeed.tsx` |
| `type` | `complaint` | compara | `supabase/functions/_shared/unsubscribe.ts` |
| `type` | `condition` | compara, escreve | `src/pages/WorkflowsPage.tsx`<br>`supabase/functions/workflow-executor/index.ts` |
| `type` | `context` | escreve | `supabase/functions/wal-health-alert/index.ts`<br>`supabase/functions/webvitals-regression-alert/index.ts` |
| `type` | `conversion` | compara | `src/components/dashboard/DashboardEmptyState.tsx` |
| `type` | `conversion_rate` | escreve | `src/hooks/dashboard/useDashboardLayout.ts` |
| `type` | `countdown` | compara | `src/hooks/race/useRaceSounds.ts` |
| `type` | `create_task` | compara, escreve | `src/components/pipeline/QuickActionsMenu.tsx`<br>`supabase/functions/automation-suggestions/index.ts`<br>`supabase/functions/execute-workflow/index.ts` |
| `type` | `csat` | compara | `src/components/customer-success/SurveyTriggerDialog.tsx` |
| `type` | `currency` | compara | `src/components/reporting/funnelReportHelpers.ts` |
| `type` | `custom_report` | compara, escreve | `src/components/dashboard/CustomizableDashboard.tsx`<br>`src/hooks/dashboard/useDashboardLayout.ts` |
| `type` | `date` | escreve | `src/hooks/reporting/reportBuilderHelpers.ts` |
| `type` | `deal` | compara, escreve | `src/components/molecules/GlobalSearch.tsx`<br>`supabase/functions/semantic-index-entity/index.ts` |
| `type` | `default` | escreve | `src/pages/WorkflowsPage.tsx` |
| `type` | `discount` | compara | `src/components/tasks/NextBestAction.tsx` |
| `type` | `drs` | compara | `src/components/race/raceTrackHelpers.ts` |
| `type` | `email` | compara, escreve | `src/components/dashboard/IntegrationStatusPanel.tsx`<br>`src/components/pipeline/QuickActionsMenu.tsx`<br>`src/components/sales/cadence/ApprovalQueue.tsx`<br>`src/components/sales/cadence/CadenceAlertConfig.tsx`<br>`src/components/sales/cadence/CadenceOutcomeConfig.tsx`<br>… +3 |
| `type` | `email_message` | compara | `supabase/functions/semantic-index-entity/index.ts` |
| `type` | `enps` | compara, escreve | `src/components/engagement/PulseSurveyWidget.tsx` |
| `type` | `enum` | escreve | `src/hooks/reporting/reportBuilderHelpers.ts` |
| `type` | `eq` | compara | `supabase/functions/external-db-bridge/index.ts` |
| `type` | `expansion` | compara, escreve | `src/components/analytics/ABCActionableAutomations.tsx`<br>`src/hooks/bi/useABCAnalysis.ts` |
| `type` | `finale` | compara, escreve | `src/components/race/RaceArena.tsx`<br>`src/components/race/raceTrackHelpers.ts` |
| `type` | `follow_up` | compara | `src/components/tasks/NextBestAction.tsx` |
| `type` | `forbidden` | compara, escreve | `supabase/functions/personal-assistant-stream/fallback.ts`<br>`supabase/functions/personal-assistant-stream/fallback_test.ts` |
| `type` | `forecast_summary` | escreve | `src/hooks/dashboard/useDashboardLayout.ts` |
| `type` | `fps` | compara, escreve | `src/components/performance/PerformanceMonitor.tsx` |
| `type` | `function` | escreve | `supabase/functions/ai-agent-orchestrator/index.ts`<br>`supabase/functions/ai-email-composer/index.ts`<br>`supabase/functions/analyze-pipeline-coverage/index.ts`<br>`supabase/functions/analyze-sentiment-timeline/index.ts`<br>`supabase/functions/analyze-skill-gaps/index.ts`<br>… +23 |
| `type` | `general` | escreve | `src/components/assistant/constants.ts` |
| `type` | `generic` | escreve | `supabase/functions/detect-winloss-at-risk/scoring.ts` |
| `type` | `goal` | compara, escreve | `src/pages/admin/AdminComercial.tsx` |
| `type` | `goal_progress` | escreve | `src/hooks/dashboard/useDashboardLayout.ts` |
| `type` | `growth` | escreve | `src/components/analytics/AIPerformanceInsights.tsx` |
| `type` | `gt` | compara | `supabase/functions/external-db-bridge/index.ts` |
| `type` | `gte` | compara | `supabase/functions/external-db-bridge/index.ts` |
| `type` | `history` | escreve | `src/lib/revenueForecast/csvExport.ts` |
| `type` | `hour` | compara | `supabase/functions/schedule-optimal-send/index.ts`<br>`supabase/functions/send-time-optimizer/index.ts` |
| `type` | `ilike` | compara | `supabase/functions/external-db-bridge/index.ts` |
| `type` | `image_url` | escreve | `supabase/functions/visual-search/index.ts` |
| `type` | `in` | compara | `supabase/functions/external-db-bridge/index.ts` |
| `type` | `inactive_client` | escreve | `src/hooks/notifications/useAlerts.ts`<br>`supabase/functions/send-alert-notifications/index.ts` |
| `type` | `inactivity_alert` | escreve | `src/pages/InactivityTriggers.tsx` |
| `type` | `inbound` | compara | `supabase/functions/_shared/webhook-integrity.ts` |
| `type` | `info` | compara, escreve | `src/components/dashboard/AlertsPanel.tsx`<br>`src/components/intelligence/PipelineStrategicReview.tsx`<br>`src/pages/RelatoriosExecutivos.tsx`<br>`supabase/functions/_shared/notification-categories_test.ts` |
| `type` | `input_audio` | escreve | `supabase/functions/transcribe-call-recording/index.ts` |
| `type` | `integer` | escreve | `supabase/functions/analyze-sentiment-timeline/index.ts`<br>`supabase/functions/detect-critical-moments/index.ts`<br>`supabase/functions/predict-deal-velocity/index.ts`<br>`supabase/functions/predict-quota-attainment/index.ts` |
| `type` | `json_object` | escreve | `supabase/functions/behavioral-analysis/index.ts`<br>`supabase/functions/detect-coaching-opportunities/index.ts`<br>`supabase/functions/generate-coaching-actions/index.ts`<br>`supabase/functions/generate-loss-coaching/index.ts`<br>`supabase/functions/qbr-generator/index.ts` |
| `type` | `lead` | compara | `supabase/functions/semantic-index-entity/index.ts` |
| `type` | `lead_handoff` | escreve | `src/components/sdr/MQLQualificationForm.tsx` |
| `type` | `leader` | compara, escreve | `src/components/race/raceTrackHelpers.ts`<br>`src/hooks/race/useRaceDetection.ts` |
| `type` | `leader_takeover` | compara | `src/hooks/race/useRaceSounds.ts` |
| `type` | `levelUp` | compara, escreve | `src/components/gamification/CelebrationOverlayProvider.tsx` |
| `type` | `level_up` | compara | `src/components/gamification/XPToast.tsx` |
| `type` | `lightning` | escreve | `supabase/functions/start-race-season/index.ts` |
| `type` | `like` | compara | `supabase/functions/external-db-bridge/index.ts` |
| `type` | `linkedin` | compara | `src/components/tasks/NextBestAction.tsx` |
| `type` | `log_activity` | compara, escreve | `src/components/pipeline/QuickActionsMenu.tsx`<br>`supabase/functions/automation-suggestions/index.ts`<br>`supabase/functions/execute-workflow/index.ts` |
| `type` | `loss_factor` | escreve | `supabase/functions/detect-winloss-at-risk/scoring.ts` |
| `type` | `lt` | compara | `supabase/functions/external-db-bridge/index.ts` |
| `type` | `lte` | compara | `supabase/functions/external-db-bridge/index.ts` |
| `type` | `magiclink` | escreve | `supabase/functions/webauthn/index.ts` |
| `type` | `meeting` | compara, escreve | `src/components/pipeline/QuickActionsMenu.tsx`<br>`src/components/tasks/NextBestAction.tsx` |
| `type` | `milestone` | escreve | `src/components/activities/ArenaPulseFeed.tsx`<br>`src/hooks/useMicroGoals.ts` |
| `type` | `month` | compara | `src/components/revenue-intelligence/forecastHelpers.ts`<br>`supabase/functions/generate-revenue-forecast/index.ts` |
| `type` | `mrkdwn` | escreve | `supabase/functions/wal-health-alert/index.ts`<br>`supabase/functions/webvitals-regression-alert/index.ts` |
| `type` | `neq` | compara | `supabase/functions/external-db-bridge/index.ts` |
| `type` | `new_device` | escreve | `supabase/functions/new-device-alert/index.ts` |
| `type` | `note` | compara | `supabase/functions/semantic-index-entity/index.ts` |
| `type` | `number` | escreve | `src/hooks/reporting/reportBuilderHelpers.ts`<br>`supabase/functions/ai-agent-orchestrator/index.ts`<br>`supabase/functions/analyze-pipeline-coverage/index.ts`<br>`supabase/functions/analyze-sentiment-timeline/index.ts`<br>`supabase/functions/analyze-skill-gaps/index.ts`<br>… +7 |
| `type` | `object` | escreve | `supabase/functions/ai-agent-orchestrator/index.ts`<br>`supabase/functions/ai-email-composer/index.ts`<br>`supabase/functions/analyze-pipeline-coverage/index.ts`<br>`supabase/functions/analyze-sentiment-timeline/index.ts`<br>`supabase/functions/analyze-skill-gaps/index.ts`<br>… +23 |
| `type` | `objection` | compara, escreve | `src/components/conversational/LiveIntelligenceFeed.tsx`<br>`src/components/conversational/NeuralSentimentTimeline.tsx` |
| `type` | `objections` | escreve | `src/components/assistant/constants.ts` |
| `type` | `opportunity` | compara, escreve | `src/components/analytics/ABCNeuralInsights.tsx`<br>`src/components/intelligence/PipelineStrategicReview.tsx`<br>`src/hooks/bi/useABCAnalysis.ts` |
| `type` | `order` | compara | `supabase/functions/external-db-bridge/index.ts` |
| `type` | `outcome` | compara, escreve | `src/components/win-loss/DealTimelineExpand.tsx`<br>`src/hooks/useDealTimeline.ts` |
| `type` | `overtake` | compara, escreve | `src/components/race/raceTrackHelpers.ts`<br>`src/hooks/race/useRaceSounds.ts`<br>`src/hooks/useMicroGoals.ts`<br>`supabase/functions/process-race-event/index.ts` |
| `type` | `pct` | compara, escreve | `src/components/reporting/funnelReportHelpers.ts` |
| `type` | `pipeline_funnel` | escreve | `src/hooks/dashboard/useDashboardLayout.ts` |
| `type` | `pitstop` | compara | `src/hooks/race/useRaceSounds.ts` |
| `type` | `playbook` | compara | `supabase/functions/semantic-index-entity/index.ts` |
| `type` | `power_up` | escreve | `src/hooks/gamification/usePrizeWheel.ts` |
| `type` | `powerup` | compara | `src/hooks/race/useRaceSounds.ts` |
| `type` | `product` | compara | `supabase/functions/semantic-index-entity/index.ts` |
| `type` | `products` | compara, escreve | `src/components/analytics/ABCAnalysis.tsx` |
| `type` | `proposal` | compara | `src/components/tasks/NextBestAction.tsx`<br>`supabase/functions/semantic-index-entity/index.ts` |
| `type` | `prospects` | compara | `src/components/bi/BIClientList.tsx` |
| `type` | `push` | compara, escreve | `src/components/dashboard/IntegrationStatusPanel.tsx`<br>`src/components/sales/cadence/CadenceAlertConfig.tsx`<br>`src/components/sales/cadence/CadenceOutcomeConfig.tsx` |
| `type` | `qbr_scheduled` | escreve | `supabase/functions/qbr-scheduler/index.ts` |
| `type` | `quarter` | compara | `src/components/revenue-intelligence/forecastHelpers.ts` |
| `type` | `quote_expiring` | escreve | `supabase/functions/check-quote-expiration/index.ts` |
| `type` | `reactivation` | escreve | `src/hooks/bi/useABCAnalysis.ts` |
| `type` | `reassign` | escreve | `supabase/functions/territory-optimization/index.ts` |
| `type` | `rebalance` | escreve | `supabase/functions/territory-optimization/index.ts` |
| `type` | `recent_activities` | escreve | `src/hooks/dashboard/useDashboardLayout.ts` |
| `type` | `record` | escreve | `src/hooks/useMicroGoals.ts` |
| `type` | `recovery` | escreve | `supabase/functions/send-password-reset/index.ts` |
| `type` | `registration` | escreve | `supabase/functions/webauthn/index.ts` |
| `type` | `reply` | escreve | `supabase/functions/whatsapp-inbound-webhook/index.ts` |
| `type` | `retention` | compara, escreve | `src/components/analytics/ABCActionableAutomations.tsx`<br>`src/hooks/bi/useABCAnalysis.ts` |
| `type` | `revenue` | compara, escreve | `src/components/dashboard/DashboardEmptyState.tsx`<br>`src/types/index.ts` |
| `type` | `revenue_kpi` | escreve | `src/hooks/dashboard/useDashboardLayout.ts` |
| `type` | `sale` | escreve | `src/hooks/useTeamActivityFeed.ts` |
| `type` | `sale_alert` | compara | `src/components/notifications/NotificationCenter.tsx` |
| `type` | `sales` | compara | `src/components/dashboard/DashboardEmptyState.tsx` |
| `type` | `sales_milestone` | escreve | `src/hooks/sales/useSalesEnablement.ts` |
| `type` | `scale` | compara, escreve | `src/components/engagement/PulseSurveyWidget.tsx` |
| `type` | `scoring_rule` | compara, escreve | `src/pages/admin/AdminComercial.tsx` |
| `type` | `season_end` | compara | `src/hooks/race/useRaceSounds.ts` |
| `type` | `section` | escreve | `supabase/functions/wal-health-alert/index.ts`<br>`supabase/functions/webvitals-regression-alert/index.ts` |
| `type` | `sector` | compara, escreve | `src/components/race/raceTrackHelpers.ts`<br>`src/hooks/race/useRaceDetection.ts` |
| `type` | `send_notification` | escreve | `supabase/functions/automation-suggestions/index.ts` |
| `type` | `sentiment` | compara, escreve | `src/components/conversational/LiveIntelligenceFeed.tsx` |
| `type` | `shield` | escreve | `supabase/functions/start-race-season/index.ts` |
| `type` | `social` | compara, escreve | `src/components/activities/ArenaPulseFeed.tsx` |
| `type` | `spamreport` | compara | `supabase/functions/_shared/webhook-integrity.ts` |
| `type` | `split` | escreve | `supabase/functions/territory-optimization/index.ts` |
| `type` | `spring` | escreve | `src/App.tsx`<br>`src/components/auth/AuthBrandPanel.tsx`<br>`src/components/competitive/BadgesGallery.tsx`<br>`src/components/competitive/LiveScoreboard.tsx`<br>`src/components/dashboard/DashboardEmptyState.tsx`<br>… +45 |
| `type` | `stage_change` | compara, escreve | `src/components/win-loss/DealTimelineExpand.tsx`<br>`src/hooks/useDealTimeline.ts` |
| `type` | `stagnant_deal` | escreve | `src/hooks/notifications/useAlerts.ts`<br>`supabase/functions/send-alert-notifications/index.ts` |
| `type` | `start` | compara, escreve | `src/components/customer-success/CS360Filters.tsx`<br>`src/components/customer-success/CustomerSuccess360Hub.tsx` |
| `type` | `status` | escreve | `supabase/functions/whatsapp-inbound-webhook/index.ts` |
| `type` | `stealth` | compara, escreve | `src/components/activities/ArenaPulseFeed.tsx` |
| `type` | `strategy` | escreve | `src/components/assistant/constants.ts` |
| `type` | `streak` | compara, escreve | `src/components/activities/ArenaPulseFeed.tsx`<br>`src/components/gamification/CelebrationOverlayProvider.tsx`<br>`src/components/gamification/XPToast.tsx`<br>`src/hooks/useMicroGoals.ts` |
| `type` | `streak_14` | escreve | `src/hooks/gamification/useDailyStreakAchievements.ts` |
| `type` | `streak_3` | escreve | `src/hooks/gamification/useDailyStreakAchievements.ts` |
| `type` | `streak_30` | escreve | `src/hooks/gamification/useDailyStreakAchievements.ts` |
| `type` | `streak_7` | escreve | `src/hooks/gamification/useDailyStreakAchievements.ts` |
| `type` | `string` | compara, escreve | `supabase/functions/ai-agent-orchestrator/index.ts`<br>`supabase/functions/ai-email-composer/index.ts`<br>`supabase/functions/analyze-pipeline-coverage/index.ts`<br>`supabase/functions/analyze-sentiment-timeline/index.ts`<br>`supabase/functions/analyze-skill-gaps/index.ts`<br>… +24 |
| `type` | `stuck_stage` | escreve | `supabase/functions/detect-winloss-at-risk/scoring.ts` |
| `type` | `success` | compara, escreve | `src/components/analytics/AIPerformanceInsights.tsx`<br>`src/components/intelligence/ActivityPulse.tsx`<br>`src/components/reports/ExecInsightsBanner.tsx`<br>`src/pages/RelatoriosExecutivos.tsx` |
| `type` | `system` | escreve | `supabase/functions/_shared/notification-categories_test.ts`<br>`supabase/functions/cron-failure-alerter/index.ts` |
| `type` | `task` | compara | `supabase/functions/semantic-index-entity/index.ts` |
| `type` | `task_completed` | compara, escreve | `src/components/win-loss/DealTimelineExpand.tsx`<br>`src/hooks/useDealTimeline.ts` |
| `type` | `taunt` | escreve | `src/components/competitive/CompetitiveChat.tsx` |
| `type` | `team_ranking` | escreve | `src/hooks/dashboard/useDashboardLayout.ts` |
| `type` | `template` | escreve | `supabase/functions/send-multichannel-message/index.ts` |
| `type` | `text` | escreve | `src/hooks/reporting/reportBuilderHelpers.ts`<br>`supabase/functions/send-multichannel-message/index.ts`<br>`supabase/functions/transcribe-call-recording/index.ts`<br>`supabase/functions/visual-search/index.ts` |
| `type` | `top-ticket` | compara | `src/components/bi/BIClientList.tsx` |
| `type` | `top-value` | compara | `src/components/bi/BIClientList.tsx` |
| `type` | `top_deals` | escreve | `src/hooks/dashboard/useDashboardLayout.ts` |
| `type` | `totp` | compara | `src/hooks/useMFA.ts` |
| `type` | `trend` | compara, escreve | `src/components/analytics/ABCNeuralInsights.tsx`<br>`src/hooks/bi/useABCAnalysis.ts` |
| `type` | `trigger` | compara, escreve | `src/pages/WorkflowsPage.tsx`<br>`supabase/functions/workflow-executor/index.ts` |
| `type` | `trophy` | compara | `src/pages/MetasAtividades.tsx` |
| `type` | `turbo` | escreve | `src/components/race/PowerUpIcon.tsx`<br>`supabase/functions/start-race-season/index.ts` |
| `type` | `tween` | escreve | `src/components/race/RaceArena.tsx` |
| `type` | `unsubscribe` | compara | `supabase/functions/_shared/unsubscribe.ts` |
| `type` | `update_stage` | compara | `supabase/functions/execute-workflow/index.ts` |
| `type` | `victory` | compara, escreve | `src/components/activities/ArenaPulseFeed.tsx`<br>`src/components/gamification/CelebrationOverlayProvider.tsx`<br>`src/hooks/race/useRaceSounds.ts`<br>`supabase/functions/process-race-event/index.ts` |
| `type` | `warning` | compara, escreve | `src/components/analytics/ABCNeuralInsights.tsx`<br>`src/components/analytics/AIPerformanceInsights.tsx`<br>`src/components/dashboard/AlertsPanel.tsx`<br>`src/components/intelligence/PipelineStrategicReview.tsx`<br>`src/hooks/bi/useABCAnalysis.ts`<br>… +1 |
| `type` | `week` | compara, escreve | `src/components/revenue-intelligence/forecastHelpers.ts`<br>`supabase/functions/generate-revenue-forecast/index.ts` |
| `type` | `weekday` | compara | `supabase/functions/schedule-optimal-send/index.ts`<br>`supabase/functions/send-time-optimizer/index.ts` |
| `type` | `whatsapp` | compara, escreve | `src/components/sales/cadence/ApprovalQueue.tsx`<br>`src/components/sales/cadence/CadenceTemplateManager.tsx`<br>`src/components/tasks/NextBestAction.tsx` |
| `type` | `whatsapp_message` | compara | `supabase/functions/semantic-index-entity/index.ts` |
| `type` | `win_factor` | compara | `src/lib/winloss/riskSeverity.ts`<br>`supabase/functions/detect-winloss-at-risk/action_matrix_combinations_test.ts` |
| `type` | `window` | escreve | `public/sw.js` |
| `type` | `xp` | escreve | `src/components/gamification/XPToast.tsx`<br>`src/hooks/gamification/usePrizeWheel.ts` |
| `last_status` | `succeeded` | compara | `src/components/admin/AdminSystemStatus.tsx` |
| `status` | `Active` | escreve | `src/components/clients/Client360PredictiveCards.tsx` |
| `status` | `Backlog` | escreve | `src/components/competitive/FeatureComparison.tsx` |
| `status` | `Blocked` | compara | `src/components/purchase-intelligence/DuplicateBlockAudit.tsx` |
| `status` | `CHANNEL_ERROR` | compara | `src/components/lead-scoring/LeadScoringDashboard.tsx` |
| `status` | `CLOSED` | compara | `src/components/lead-scoring/LeadScoringDashboard.tsx` |
| `status` | `Cancelado` | escreve | `src/components/customer-success/CustomerSuccess360Hub.tsx` |
| `status` | `Critical` | compara, escreve | `src/components/pricing/MarginAlertsCard.tsx` |
| `status` | `Fechado` | compara | `supabase/functions/pricing-intelligence/index.ts` |
| `status` | `Pendente` | escreve | `src/components/customer-success/CustomerSuccess360Hub.tsx` |
| `status` | `Perdido` | filtra | `supabase/functions/dialer-queue-builder/index.ts` |
| `status` | `Planning` | escreve | `src/components/competitive/FeatureComparison.tsx` |
| `status` | `Proposta` | compara | `src/hooks/useNextBestAction.ts` |
| `status` | `Research` | escreve | `src/components/competitive/FeatureComparison.tsx` |
| `status` | `SUBSCRIBED` | compara | `src/components/lead-scoring/LeadScoringDashboard.tsx` |
| `status` | `Vendido` | filtra | `supabase/functions/dialer-queue-builder/index.ts` |
| `status` | `Warning` | escreve | `src/components/pricing/MarginAlertsCard.tsx` |
| `status` | `abaixo` | compara | `src/pages/admin/AdminPlatformSLOPage.tsx` |
| `status` | `abandoned` | compara | `src/pages/RelatoriosExecutivos.tsx` |
| `status` | `accepted` | compara, escreve | `src/components/conversational/CoachingActionsList.tsx`<br>`src/hooks/conversational/useCoachingActions.ts` |
| `status` | `actioned` | compara, escreve | `src/components/conversational/CriticalMomentsList.tsx` |
| `status` | `active` | compara, escreve, filtra | `src/components/analytics/ClientHealthPanel.tsx`<br>`src/components/cadences/ProspectCadenceControls.tsx`<br>`src/components/cadences/quote/QuoteCadenceCard.tsx`<br>`src/components/clients/ClientKanban.tsx`<br>`src/components/competitive/BattleArena.tsx`<br>… +37 |
| `status` | `ahead` | compara | `src/components/race/GhostStatusBadge.tsx` |
| `status` | `all` | compara, escreve | `src/components/sdr/RecentProspects.tsx`<br>`src/components/sdr/SDRAdvancedFilters.tsx`<br>`src/hooks/admin/useDataSubjectRequests.ts`<br>`src/hooks/sequences/useSendTimeOptimization.ts`<br>`src/hooks/useMyBonusAwards.ts`<br>… +2 |
| `status` | `analyzing` | escreve | `supabase/functions/analyze-call/index.ts` |
| `status` | `approved` | compara, escreve, filtra | `src/components/quotes/QuoteCard.tsx`<br>`src/components/security/PasswordResetApproval.tsx`<br>`src/hooks/cadences/useQuoteCadenceComparison.ts`<br>`src/hooks/cadences/useQuoteCadenceConversion.ts`<br>`src/hooks/cadences/useQuoteCadences.ts`<br>… +7 |
| `status` | `archived` | compara, escreve | `src/components/win-loss/ReplayStatusByIdPanel.tsx`<br>`src/hooks/win-loss/useWebhookDeadLetters.ts` |
| `status` | `at_risk` | compara | `src/pages/AccountBasedSelling.tsx`<br>`supabase/functions/customer-success-360/index.ts` |
| `status` | `ativo` | escreve | `src/hooks/useProducts.ts` |
| `status` | `attempted` | escreve | `src/pages/FollowUpInteligente.tsx` |
| `status` | `awaiting_approval` | compara | `src/pages/AIAgents.tsx` |
| `status` | `behind` | compara | `src/components/race/GhostStatusBadge.tsx` |
| `status` | `breached` | compara | `src/components/pipeline/SLADashboard.tsx`<br>`src/hooks/useDealSLAs.ts` |
| `status` | `busy` | compara | `supabase/functions/twilio-call-status/index.ts` |
| `status` | `canceled` | compara | `supabase/functions/twilio-call-status/index.ts` |
| `status` | `cancelled` | compara, escreve, filtra | `src/components/cadences/ProspectCadenceControls.tsx`<br>`src/components/cadences/quote/QuoteCadenceCard.tsx`<br>`src/components/customer-success/CustomerSuccess360Hub.tsx`<br>`src/components/orders/orderHelpers.ts`<br>`src/components/vendedor/VendedorBottomRow.tsx`<br>… +15 |
| `status` | `churned` | compara | `supabase/functions/customer-success-360/index.ts` |
| `status` | `closed` | compara | `supabase/migrations/20260105000004_performance_indexes.sql` |
| `status` | `closed_lost` | compara | `src/components/assistant/DealPreviewCard.tsx`<br>`src/components/assistant/dealRiskCalculator.ts` |
| `status` | `closed_won` | compara | `src/components/assistant/DealPreviewCard.tsx`<br>`src/components/assistant/dealRiskCalculator.ts` |
| `status` | `completed` | compara, escreve, filtra | `src/components/analytics/LTVBySegment.tsx`<br>`src/components/assistant/AssistantTodayTasks.tsx`<br>`src/components/cadences/ABTestDialog.tsx`<br>`src/components/cadences/ProspectCadenceControls.tsx`<br>`src/components/cadences/quote/QuoteCadenceCard.tsx`<br>… +64 |
| `status` | `confirmed` | compara | `src/components/orders/orderHelpers.ts` |
| `status` | `correlation_key_required` | escreve | `supabase/functions/receive-quote-sync/index.ts` |
| `status` | `critical` | compara | `src/components/sdr/PredictiveSuccessMap.tsx`<br>`src/pages/AccountBasedSelling.tsx` |
| `status` | `data_required` | escreve | `supabase/functions/receive-quote-sync/index.ts` |
| `status` | `dead_letter` | filtra | `src/components/admin/connections/DeadLetterIngestPanel.tsx` |
| `status` | `dedupe_failed` | escreve | `supabase/functions/receive-quote-sync/index.ts` |
| `status` | `delivered` | compara | `src/components/customer-success/CustomerSuccess360Hub.tsx`<br>`src/components/multichannel/multichannelHelpers.ts`<br>`src/components/orders/orderHelpers.ts`<br>`src/hooks/dashboard/useBIDossierExport.ts`<br>`src/pages/AcompanhamentoPedidos.tsx` |
| `status` | `dismissed` | compara, escreve | `src/components/conversational/CoachingActionsList.tsx`<br>`src/components/conversational/CriticalMomentsList.tsx` |
| `status` | `done` | escreve | `src/hooks/dialer/usePowerDialer.ts` |
| `status` | `draft` | compara, escreve | `src/components/cadences/ABTestDialog.tsx`<br>`src/components/quotes/QuoteCard.tsx`<br>`src/components/quotes/QuoteDetailDialog.tsx`<br>`src/hooks/cadences/useABTests.ts`<br>`src/hooks/useDigitalSignatures.ts`<br>… +2 |
| `status` | `duplicate_ignored` | escreve | `supabase/functions/receive-quote-sync/index.ts` |
| `status` | `erro` | compara | `src/components/admin/AdminSystemStatus.tsx` |
| `status` | `error` | compara, escreve | `src/components/admin/BackendAutomationMonitor.tsx`<br>`src/components/admin/QuoteSyncLogsPanel.tsx`<br>`src/components/dashboard/DevKpiDebugPanel.tsx`<br>`src/components/dashboard/IntegrationStatusPanel.tsx`<br>`src/hooks/useQueryPerformance.ts`<br>… +4 |
| `status` | `etapa_inexistente` | escreve | `supabase/functions/_shared/deal-probability-calc_test.ts` |
| `status` | `event_required` | escreve | `supabase/functions/receive-quote-sync/index.ts` |
| `status` | `executing` | escreve | `supabase/functions/ai-agent-orchestrator/index.ts` |
| `status` | `exhausted` | compara | `src/hooks/admin/useV4Callbacks.ts`<br>`src/hooks/email/failedDraftsHelpers.ts` |
| `status` | `exited` | compara | `src/components/sequences/sequenceHelpers.ts` |
| `status` | `expired` | compara, escreve | `src/components/security/PasswordResetApproval.tsx`<br>`src/hooks/useQuotes.ts`<br>`supabase/functions/check-quote-expiration/index.ts`<br>`supabase/functions/send-password-reset/index.ts` |
| `status` | `external_quote_id_required` | escreve | `supabase/functions/receive-quote-sync/index.ts` |
| `status` | `fail` | compara, escreve | `src/components/admin/connections/SmokeTestChecklist.tsx`<br>`src/components/admin/connections/smokeTestHelpers.ts` |
| `status` | `failed` | compara, escreve | `src/components/conversational/TranscribeButton.tsx`<br>`src/components/engagement/SendTime/ScheduledSendsPanel.tsx`<br>`src/components/multichannel/multichannelHelpers.ts`<br>`src/components/reporting/ScheduledReportRunsDrawer.tsx`<br>`src/components/sequences/sequenceHelpers.ts`<br>… +20 |
| `status` | `finished` | compara, escreve, filtra | `src/components/race/admin/SeasonsManagerTable.tsx`<br>`src/hooks/race/useChampionsHistory.ts`<br>`src/hooks/race/useGhostCar.ts`<br>`src/hooks/race/useMonthlyChampion.ts`<br>`src/hooks/race/useMyCareer.ts`<br>… +2 |
| `status` | `fired` | compara | `src/hooks/win-loss/useWebhookAlertHistory.ts` |
| `status` | `fulfilled` | compara | `supabase/functions/process-call-recording-ingest/index.ts`<br>`supabase/functions/send-push-notification/index.ts` |
| `status` | `full` | compara, escreve | `src/components/competitive/FeatureComparison.tsx` |
| `status` | `gap` | compara, escreve | `src/components/competitive/FeatureComparison.tsx` |
| `status` | `generating` | escreve | `supabase/functions/email-composer-bulk/index.ts` |
| `status` | `good` | compara, escreve | `src/components/customer-success/CustomerSuccessHub.tsx`<br>`src/hooks/useCustomerSuccess.ts`<br>`supabase/functions/customer-success-hub/index.ts` |
| `status` | `healthy` | compara, escreve | `src/components/atoms/SystemHealthBadge.tsx`<br>`src/components/pipeline-pulse/pulseHelpers.ts`<br>`src/pages/AccountBasedSelling.tsx`<br>`supabase/functions/territory-optimization/index.ts` |
| `status` | `high` | compara | `src/components/dashboard/modules/OverviewModule.tsx`<br>`src/components/sdr/PredictiveSuccessMap.tsx` |
| `status` | `hmac_mismatch` | escreve | `supabase/functions/receive-quote-sync/index.ts` |
| `status` | `hmac_missing` | escreve | `supabase/functions/receive-quote-sync/index.ts` |
| `status` | `hot` | escreve | `supabase/functions/run-retry-tests/contract_test.ts` |
| `status` | `identified` | compara, escreve, filtra | `supabase/functions/customer-success-360/index.ts`<br>`supabase/functions/expansion-detector/index.ts` |
| `status` | `idle` | compara, escreve | `src/components/admin/connections/SmokeTestChecklist.tsx`<br>`src/components/admin/connections/smokeTestHelpers.ts`<br>`src/components/dashboard/DevKpiDebugPanel.tsx` |
| `status` | `ignored` | compara, escreve | `src/pages/RetryTestStatusPage.tsx`<br>`supabase/functions/run-retry-tests/index.ts` |
| `status` | `in_progress` | compara, escreve | `src/hooks/admin/useDataSubjectRequests.ts`<br>`src/pages/AdminSolicitacoesTitular.tsx`<br>`src/pages/OnboardingTracking.tsx`<br>`supabase/functions/customer-success-360/index.ts`<br>`supabase/functions/onboarding-launcher/index.ts` |
| `status` | `inactive` | compara, filtra | `src/components/portfolio/PortfolioCloserGrid.tsx`<br>`src/hooks/crm/useClientPortfolio.ts`<br>`supabase/functions/auto-reassign-inactive/index.ts` |
| `status` | `inativo` | compara | `src/components/admin/AdminSystemStatus.tsx` |
| `status` | `initiated` | escreve | `supabase/functions/twilio-click-to-call/index.ts` |
| `status` | `invalid_json` | escreve | `supabase/functions/receive-quote-sync/index.ts` |
| `status` | `invalid_payload` | escreve | `supabase/functions/receive-quote-sync/index.ts` |
| `status` | `invalid_signature` | escreve | `supabase/functions/receive-quote-sync/index.ts` |
| `status` | `lead` | compara, escreve, filtra | `src/components/dashboard/widgets/TopDealsWidget.tsx`<br>`src/components/lead-routing/CapacityDashboard.tsx`<br>`src/components/pipeline/DealSummaryCard.tsx`<br>`src/components/sdr/RecentProspects.tsx`<br>`src/components/sdr/TopSDRsRanking.tsx`<br>… +6 |
| `status` | `loading` | escreve | `src/components/dashboard/DevKpiDebugPanel.tsx` |
| `status` | `lookup_failed` | escreve | `supabase/functions/receive-quote-sync/index.ts` |
| `status` | `lost` | compara, filtra | `src/services/salesService.ts`<br>`supabase/functions/coaching-intelligence/index.ts`<br>`supabase/functions/nlq-query/queryResolvers.ts`<br>`supabase/functions/pipeline-pulse-aggregator/index.ts`<br>`supabase/functions/predict-deal-velocity/index.ts`<br>… +2 |
| `status` | `medium` | compara | `src/components/sdr/PredictiveSuccessMap.tsx` |
| `status` | `meta` | compara | `src/pages/admin/AdminPlatformSLOPage.tsx` |
| `status` | `method_not_allowed` | escreve | `supabase/functions/receive-quote-sync/index.ts` |
| `status` | `missing_signature` | escreve | `supabase/functions/receive-quote-sync/index.ts` |
| `status` | `negotiation` | compara, escreve | `src/components/pipeline/DealSummaryCard.tsx`<br>`src/components/sdr/SDRConversionRanking.tsx`<br>`src/hooks/useCloserMetrics.ts`<br>`src/lib/winloss/atRiskFixtures.ts`<br>`src/pages/VendedorDashboard.tsx`<br>… +8 |
| `status` | `new` | compara, escreve, filtra | `src/components/conversational/CriticalMomentsList.tsx`<br>`supabase/functions/calculate-deal-health/index.ts`<br>`supabase/functions/detect-critical-moments/index.ts` |
| `status` | `no-answer` | compara | `supabase/functions/twilio-call-status/index.ts` |
| `status` | `no-data` | compara, escreve | `src/components/race/GhostCar.tsx`<br>`src/components/race/GhostStatusBadge.tsx`<br>`src/hooks/race/useGhostCar.ts` |
| `status` | `offline` | compara | `src/components/arena/ArenaStatusBadge.tsx` |
| `status` | `ok` | compara, escreve | `src/components/admin/AdminSystemStatus.tsx`<br>`src/components/admin/connections/SmokeTestChecklist.tsx`<br>`src/components/admin/connections/smokeTestHelpers.ts`<br>`src/components/dashboard/DevKpiDebugPanel.tsx`<br>`src/components/pipeline/SLADashboard.tsx`<br>… +7 |
| `status` | `online` | escreve | `src/components/arena/ArenaStatusBadge.tsx` |
| `status` | `open` | compara, filtra | `src/pages/ClientHealthScore.tsx`<br>`supabase/functions/ai-copilot/index.ts`<br>`supabase/functions/customer-success-360/index.ts` |
| `status` | `overdue` | escreve | `src/components/bi/ChurnTaskCompletionCard.tsx` |
| `status` | `overloaded` | compara | `supabase/functions/territory-optimization/index.ts` |
| `status` | `paid` | compara, escreve | `src/components/customer-success/CustomerSuccess360Hub.tsx`<br>`src/hooks/useCommissionBonusAwards.ts`<br>`src/hooks/useCommissions.ts`<br>`src/pages/AdminAuditoriaPremiacoes.tsx`<br>`src/pages/Comissoes.tsx`<br>… +2 |
| `status` | `partial` | compara, escreve | `src/components/competitive/FeatureComparison.tsx` |
| `status` | `passed` | compara, escreve | `src/hooks/useRetryTestRun.ts`<br>`src/pages/RetryTestStatusPage.tsx`<br>`supabase/functions/run-retry-tests/index.ts` |
| `status` | `paused` | compara, escreve, filtra | `src/components/cadences/ABTestDialog.tsx`<br>`src/components/cadences/ProspectCadenceControls.tsx`<br>`src/components/cadences/TodaysCadenceTasks.tsx`<br>`src/components/cadences/quote/QuoteCadenceCard.tsx`<br>`src/components/sequences/sequenceHelpers.ts`<br>… +4 |
| … +136 linhas — lista completa em `context.json` | | | |

### E.4 Enums e listas de valores

| Nome | Valores | Onde |
|---|---|---|
| task_priority | `high`, `medium`, `low`, `urgent` | banco |
| task_status | `pending`, `in_progress`, `completed`, `cancelled` | banco |
| task_type | `call`, `meeting`, `follow_up`, `email`, `proposal`, `other`, `discount` | banco |
| activity_type | `call`, `email`, `meeting`, `linkedin`, `whatsapp`, `other`, `note` | banco |
| activity_outcome | `connected`, `no_answer`, `scheduled`, `voicemail`, `busy`, `callback`, `not_interested`, `qualified` | banco |
| salesperson_role | `sdr`, `closer`, `hybrid` | banco |
| app_role | `admin`, `manager`, `salesperson` | banco |
| sales_league | `bronze`, `silver`, `gold`, `diamond` | banco |
| task_difficulty | `easy`, `medium`, `hard`, `epic` | banco |
| task_assignment_status | `pending`, `in_progress`, `submitted`, `approved`, `rejected` | banco |
| integration_kind | `database`, `bitrix24`, `n8n`, `mcp`, `webhook`, `other` | banco |
| integration_source | `db`, `env`, `secret` | banco |
| integration_health_status | `success`, `failure`, `degraded`, `pending` | banco |
| integration_trigger | `manual`, `auto` | banco |
| CredentialsSource | all \| db \| env \| secret | `src/components/admin/connections/CredentialsSourceContext.ts` |
| HealthStatusFilter | all \| healthy \| warning \| failing | `src/components/admin/connections/CredentialsSourceContext.ts` |
| TaskDifficulty | easy \| medium \| hard \| epic | `src/components/admin/task-console/taskConsoleHelpers.ts` |
| TaskAssignmentStatus | pending \| in_progress \| submitted \| approved \| rejected | `src/components/admin/task-console/taskConsoleHelpers.ts` |
| RecurrenceRule | daily \| weekly \| monthly | `src/components/admin/task-console/taskConsoleHelpers.ts` |
| AgentType | qualify_lead \| build_proposal \| schedule_followup \| enrich_client \| recover_cold_lead | `src/components/agents/agentHelpers.ts` |
| AgentTargetType | lead \| client \| deal \| activity | `src/components/agents/agentHelpers.ts` |
| PeriodFilter | all \| week \| month \| 3months | `src/components/assistant/constants.ts` |
| SkillKey | discovery \| qualification \| objection_handling \| closing \| prospecting \| negotiation | `src/components/coaching/skills/skillGapHelpers.ts` |
| SkillLevel | beginner \| intermediate \| advanced \| expert | `src/components/coaching/skills/skillGapHelpers.ts` |
| SkillTrend | improving \| stable \| declining | `src/components/coaching/skills/skillGapHelpers.ts` |
| ArenaCategoryId | all \| ranking \| competitions \| profile \| broadcast \| tools | `src/components/competitive/ArenaCategoryHub.tsx` |
| ConvSource | call \| email \| meeting \| whatsapp | `src/components/conversation-intelligence/conversationHelpers.ts` |
| CoachingSeverity | info \| warning \| critical | `src/components/conversational/coachingHelpers.ts` |
| CoachingStatus | pending \| accepted \| dismissed \| practiced | `src/components/conversational/coachingHelpers.ts` |
| MomentType | objection \| buying_signal \| price_mention \| discount_request \| churn_signal \| competitor \| commitment \| next_step | `src/components/conversational/criticalMomentsHelpers.ts` |
| MomentSeverity | low \| medium \| high \| critical | `src/components/conversational/criticalMomentsHelpers.ts` |
| MomentStatus | new \| acknowledged \| actioned \| dismissed | `src/components/conversational/criticalMomentsHelpers.ts` |
| Sentiment | positive \| neutral \| negative \| mixed | `src/components/conversational/meetingSummaryHelpers.ts` |
| ScorecardHealth | poor \| fair \| good \| excellent | `src/components/conversational/coaching/coachingHelpers.ts` |
| ObjectionType | price \| timing \| authority \| need \| competition \| trust \| other | `src/components/conversational/objections/objectionHelpers.ts` |
| QuestionCategory | open \| closed \| discovery \| impact \| leading \| other | `src/components/conversational/questions/questionHelpers.ts` |
| DMURole | decision_maker \| economic_buyer \| champion \| influencer \| user \| blocker \| unknown | `src/components/deal-intelligence/committeeHelpers.ts` |
| InfluenceLevel | low \| medium \| high | `src/components/deal-intelligence/committeeHelpers.ts` |
| Sentiment | positive \| neutral \| negative | `src/components/deal-intelligence/committeeHelpers.ts` |
| CoverageTier | weak \| partial \| strong \| complete | `src/components/deal-intelligence/committeeHelpers.ts` |
| Severity | low \| medium \| high \| critical | `src/components/deal-intelligence/conversionHelpers.ts` |
| VelocityStatus | ahead \| on_track \| slow \| stalled | `src/components/deal-intelligence/velocityHelpers.ts` |
| ConfidenceTier | low \| medium \| high | `src/components/deal-intelligence/velocityHelpers.ts` |
| StageSeverity | watch \| stuck \| critical | `src/components/deal-intelligence/velocity/velocityHelpers.ts` |
| Severity | info \| opportunity \| risk | `src/components/deal-intelligence/winloss/winLossHelpers.ts` |
| DISPOSITION_OPTIONS | { value: 'connected', label: 'Conectou', icon: Phone, color: 'text-success' }, { value: 'voicemail', label: 'Caixa postal', icon: Voicemail, color: 'text-info' }, { value: 'no_answer', label: 'Não atendeu', icon: PhoneMissed, color: 'text-warning' }, { value: 'busy', label: 'Ocupado', icon: PhoneOff … | `src/components/dialer/dialerHelpers.ts` |
| OUTCOME_OPTIONS | { value: 'meeting_set', label: 'Reunião marcada', icon: CalendarCheck, color: 'text-success', }, { value: 'interested', label: 'Interessado', icon: ThumbsUp, color: 'text-success' }, { value: 'not_interested', label: 'Não interessado', icon: ThumbsDown, color: 'text-destructive', }, { value: 'callba … | `src/components/dialer/dialerHelpers.ts` |
| STRATEGY_OPTIONS | { value: 'hybrid', label: 'Híbrido (recomendado)' }, { value: 'score', label: 'Score de email' }, { value: 'recency', label: 'Recência (esfriando)' }, { value: 'send_time', label: 'Horário ideal' }, | `src/components/dialer/dialerHelpers.ts` |
| ComposeGoal | intro \| follow_up \| meeting \| reactivation \| breakup \| proposal \| thanks | `src/components/email/aiEmailHelpers.ts` |
| ComposeTone | formal \| casual \| consultivo \| direto | `src/components/email/aiEmailHelpers.ts` |
| ComposeLanguage | pt-BR \| en | `src/components/email/aiEmailHelpers.ts` |
| ComposeLength | short \| medium \| long | `src/components/email/aiEmailHelpers.ts` |
| RecipientType | client \| contact \| manual | `src/components/email/aiEmailHelpers.ts` |
| AccountTier | tier1 \| tier2 \| tier3 | `src/components/engagement/Account/accountHelpers.ts` |
| TONE_OPTIONS | { value: 'consultivo', label: 'Consultivo' }, { value: 'direto', label: 'Direto' }, { value: 'casual', label: 'Casual' }, { value: 'formal', label: 'Formal' }, | `src/components/engagement/BulkComposer/bulkComposerHelpers.ts` |
| LANGUAGE_OPTIONS | { value: 'pt-BR', label: 'Português (BR)' }, { value: 'en', label: 'English' }, | `src/components/engagement/BulkComposer/bulkComposerHelpers.ts` |
| EngagementTier | cold \| warm \| hot \| champion | `src/components/engagement/EmailScore/engagementScoreHelpers.ts` |
| ScenarioKey | pessimistic \| realistic \| optimistic | `src/components/forecast/forecastHelpers.ts` |
| ViewMode | sdr \| closer \| gestao | `src/components/layout/sidebar/sidebarMenuData.ts` |
| LeadConnectionStatus | connected \| connecting \| error | `src/components/lead-scoring/scoring-ui.tsx` |
| SUGGESTED_QUESTIONS | 'Quanto vendi em março?', 'Minha taxa de conversão essa semana', 'Top 5 clientes do trimestre', 'Quantas atividades fiz nos últimos 7 dias', 'Receita por categoria este mês', 'Pipeline aberto agora', | `src/components/nlq/nlqHelpers.ts` |
| OrderStatus | pending \| confirmed \| preparing \| shipped \| delivered \| cancelled | `src/components/orders/orderHelpers.ts` |
| RaceFlag | green \| yellow \| red \| checkered | `src/components/race/RaceControlPanel.tsx` |
| LiveryPattern | solid \| stripes \| flames \| checkers \| dots \| pride-rainbow \| pride-rainbow-diagonal \| pride-trans \| pride-bi | `src/components/race/raceColors.ts` |
| ScheduleFrequency | daily \| weekly \| monthly | `src/components/reporting/scheduledReportHelpers.ts` |
| ScheduleFormat | csv \| json | `src/components/reporting/scheduledReportHelpers.ts` |
| SemanticEntityType | client \| lead \| deal \| activity \| call_recording \| note \| email_message \| whatsapp_message \| proposal \| task \| playbook | `src/components/semantic/semanticSearchHelpers.ts` |
| EmailGoal | intro \| follow_up \| meeting \| reactivation \| breakup | `src/components/sequences/emailComposerHelpers.ts` |
| EmailTone | formal \| casual \| consultivo \| direto | `src/components/sequences/emailComposerHelpers.ts` |
| EmailLanguage | pt-BR \| en | `src/components/sequences/emailComposerHelpers.ts` |
| EmailLength | short \| medium \| long | `src/components/sequences/emailComposerHelpers.ts` |
| PeriodFilter | week \| month \| quarter | `src/components/vendedores/PeriodFilter.tsx` |
| SalespersonRole | sdr \| closer \| hybrid | `src/components/vendedores/SalespersonForm.tsx` |
| SaleStatus | pending \| lead \| prospecting \| qualified \| proposal \| negotiation \| completed \| won \| closed \| lost \| cancelled \| open | `src/constants/index.ts` |
| WON_SALE_STATUSES | 'completed', 'won', 'closed' | `src/constants/index.ts` |
| LOST_SALE_STATUSES | 'lost', 'cancelled' | `src/constants/index.ts` |
| OPEN_SALE_STATUSES | 'lead', 'prospecting', 'qualified', 'proposal', 'negotiation', 'pending', | `src/constants/index.ts` |
| CircuitState | CLOSED \| OPEN \| HALF_OPEN | `src/hooks/circuitBreakerUtils.ts` |
| ConvertQuoteErrorCode | NOT_AUTHENTICATED \| QUOTE_NOT_FOUND \| FORBIDDEN \| INVALID_STATUS \| INVALID_TOTAL \| EMPTY_ITEMS \| TOTAL_MISMATCH \| UNKNOWN | `src/hooks/quoteErrorMessages.ts` |
| BenchmarkPeriod | mom \| qoq \| yoy | `src/hooks/useBenchmarkData.ts` |
| ContactUrgency | critical \| high \| medium \| low | `src/hooks/useClientsNeedingContact.ts` |
| PeriodFilter | week \| month \| quarter | `src/hooks/useCloserMetrics.ts` |
| AwardStatus | pending \| paid \| cancelled | `src/hooks/useCommissionBonusAwards.ts` |
| BonusType | first_sale \| milestone \| ranking \| streak \| other | `src/hooks/useCommissionBonuses.ts` |
| BonusKind | fixed \| percentage | `src/hooks/useCommissionBonuses.ts` |
| CommissionStatus | pending \| approved \| paid \| cancelled | `src/hooks/useCommissions.ts` |
| AccentColor | purple \| blue \| green \| orange \| pink \| cyan \| amber \| rose | `src/hooks/useCustomTheme.ts` |
| ThemeMode | light \| dark \| system | `src/hooks/useCustomTheme.ts` |
| QuestionType | general \| analysis \| objections \| closing \| strategy | `src/hooks/useDealChatHistory.ts` |
| LeadSource | linkedin \| referral \| inbound \| outbound \| event \| website \| paid_ads \| other | `src/hooks/useLeadSourceAnalysis.ts` |
| Channel | whatsapp \| email \| linkedin \| sms \| phone | `src/hooks/useMultichannel.ts` |
| NotificationCategory | general \| sales \| goals \| gamification \| security \| system \| team \| ai \| approval \| commission | `src/hooks/useNotifications.ts` |
| NotificationPriority | low \| medium \| high \| critical | `src/hooks/useNotifications.ts` |
| PipelineStageId | lead \| qualified \| proposal \| negotiation \| won \| lost \| closed | `src/hooks/usePipeline.ts` |
| PricingHealth | excellent \| healthy \| warning \| critical | `src/hooks/usePricingIntelligence.ts` |
| PeriodFilter | week \| month \| quarter | `src/hooks/useSDRActivityTrend.ts` |
| ViewMode | activity \| comparison | `src/hooks/useSDRActivityTrend.ts` |
| ActivityTypeFilter | all \| call \| email \| meeting \| linkedin \| whatsapp | `src/hooks/useSDRActivityTrend.ts` |
| SDRAlertSoundType | warning \| notification \| gentle \| chime \| none | `src/hooks/useSDRAlertSoundSettings.ts` |
| PeriodFilter | week \| month \| quarter | `src/hooks/useSDRMetrics.ts` |
| SecurityAlertSoundType | alarm \| siren \| beep \| urgent \| none | `src/hooks/useSecurityAlertSoundSettings.ts` |
| SoundType | fanfare \| chime \| bell \| success \| none | `src/hooks/useSoundSettings.ts` |
| SyncStatus | idle \| loading \| syncing \| synced \| offline \| error | `src/hooks/useSyncedSetting.ts` |
| SystemSoundType | ding \| pop \| chime \| swoosh \| none | `src/hooks/useSystemSoundSettings.ts` |
| TerritoryHealth | excellent \| healthy \| warning \| critical | `src/hooks/useTerritoryOptimization.ts` |
| TerritoryStatus | healthy \| underserved \| overloaded \| stagnant \| unowned | `src/hooks/useTerritoryOptimization.ts` |
| RecommendationPriority | high \| medium \| low | `src/hooks/useTerritoryOptimization.ts` |
| AppRole | admin \| manager \| salesperson | `src/hooks/useUserRoles.ts` |
| TriggerType | deal_stagnant \| stage_change \| task_overdue \| no_activity \| proposal_opened \| price_clicked_repeatedly | `src/hooks/useWorkflowRules.ts` |
| ActionType | create_task \| send_notification \| change_stage \| add_note \| call_now | `src/hooks/useWorkflowRules.ts` |
| AccountTier | strategic \| enterprise \| mid_market \| smb | `src/hooks/abm/useAccounts.ts` |
| BuyingRole | decision_maker \| champion \| influencer \| blocker \| user \| technical | `src/hooks/abm/useAccounts.ts` |
| ActivityType | call \| email \| meeting \| linkedin \| whatsapp \| note \| other | `src/hooks/activities/useActivities.ts` |
| ActivityOutcome | connected \| no_answer \| scheduled \| voicemail \| busy \| callback \| not_interested \| qualified \| bad_timing \| wrong_person \| unsubscribed | `src/hooks/activities/useActivities.ts` |
| V4DeadLetterStatus | pending \| exhausted \| resolved | `src/hooks/admin/useV4Callbacks.ts` |
| AssistantMode | briefing \| chat \| proactive_nudge | `src/hooks/assistant/usePersonalAssistantHelpers.ts` |
| TriggerType | deal_created \| stage_changed \| activity_logged \| scheduled \| manual \| no_activity_days \| proposal_opened \| price_clicked | `src/hooks/automation/useAutomationWorkflows.ts` |
| ActionType | create_task \| send_notification \| update_stage \| log_activity \| assign_owner \| create_call_now_task | `src/hooks/automation/useAutomationWorkflows.ts` |
| PeriodType | today \| yesterday \| last_week \| this_month \| last_month \| last_quarter \| last_semester \| last_year \| this_year \| custom | `src/hooks/bi/useBIFilters.ts` |
| ActionType | email \| call \| linkedin \| whatsapp \| meeting \| task \| other | `src/hooks/cadences/useCadenceQueries.ts` |
| CadenceStatus | active \| paused \| completed \| cancelled | `src/hooks/cadences/useCadenceQueries.ts` |
| CadenceTaskStatus | pending \| completed \| skipped | `src/hooks/cadences/useCadenceQueries.ts` |
| AgendaEventType | reminder \| follow_up \| meeting \| call \| task | `src/hooks/calendar/useAgendaEvents.ts` |
| AgendaEventStatus | pending \| in_progress \| completed \| cancelled | `src/hooks/calendar/useAgendaEvents.ts` |
| AgendaEventPriority | low \| medium \| high \| urgent | `src/hooks/calendar/useAgendaEvents.ts` |
| CoachingSeverity | low \| medium \| high \| critical | `src/hooks/coaching/useCoachingOpportunities.ts` |
| CoachingSkillFocus | discovery \| qualification \| objection_handling \| closing \| prospecting \| negotiation | `src/hooks/coaching/useCoachingOpportunities.ts` |
| CoachingSessionStatus | scheduled \| completed \| canceled | `src/hooks/coaching/useCoachingSessions.ts` |
| KPIPeriod | week \| current_month \| last_month \| quarter \| year | `src/hooks/dashboard/useDashboardKPIsPeriod.ts` |
| HealthTier | healthy \| watch \| at_risk \| critical | `src/hooks/deal-intelligence/useDealHealth.ts` |
| DeliveryHealth | ok \| lento \| travado \| falhando | `src/hooks/email/campaignDeliveryHelpers.ts` |
| DraftFailureStatus | permanent \| exhausted \| scheduled \| pending | `src/hooks/email/failedDraftsHelpers.ts` |
| EngagementTier | cold \| warm \| hot \| on_fire | `src/hooks/engagement/useEngagementScore.ts` |
| ContactType | lead \| client | `src/hooks/engagement/useEngagementScore.ts` |
| LeagueTier | bronze \| silver \| gold \| diamond \| legendary | `src/hooks/gamification/useLeagues.ts` |
| ChannelKind | whatsapp \| sms | `src/hooks/multichannel/useChannelCredentials.ts` |
| ProviderKind | twilio \| meta_cloud \| zapi \| messagebird \| evolution | `src/hooks/multichannel/useChannelCredentials.ts` |
| QuickActionId | recompute-health \| route-pending-leads \| refresh-forecast \| analyze-recent-calls | `src/hooks/pipeline-pulse/useQuickAction.ts` |
| REACTION_EMOJIS | '🔥', '👏', '😱', '🚀' | `src/hooks/race/useRaceReactions.ts` |
| MetricCode | sales_value \| markup_pct \| new_clients_activated \| routine_compliance \| stakeholders_captured \| conversations_initiated \| sales_value_originated | `src/hooks/race/useRaceScoringRules.ts` |
| RoleType | closer \| sdr | `src/hooks/race/useRaceSeasonByRole.ts` |
| RaceSoundType | boost \| overtake \| checkpoint \| victory \| countdown \| pitstop \| powerup \| leader_takeover \| combo_tier \| season_end | `src/hooks/race/useRaceSounds.ts` |
| RaceViewMode | focus \| immersive \| competitive \| analysis | `src/hooks/race/useRaceViewMode.ts` |
| TrackCondition | sunny \| cloudy \| rainy \| storm | `src/hooks/race/useTrackConditions.ts` |
| ReportEntity | sales \| accounts \| activities \| leads \| salespeople \| clients \| cross | `src/hooks/reporting/reportBuilderHelpers.ts` |
| FilterOp | eq \| neq \| gt \| gte \| lt \| lte \| like \| ilike \| in \| is | `src/hooks/reporting/reportBuilderHelpers.ts` |
| VizType | table \| bar \| line \| pie \| funnel \| heatmap \| kpi | `src/hooks/reporting/reportBuilderHelpers.ts` |
| CrossBaseEntity | sales \| activities \| leads | `src/hooks/reporting/reportBuilderHelpers.ts` |
| CrossJoinableEntity | accounts \| salespeople \| clients \| sales | `src/hooks/reporting/reportBuilderHelpers.ts` |
| CohortMetric | orders \| revenue | `src/hooks/reporting/useCohortRetention.ts` |
| ReportPeriod | weekly \| monthly | `src/hooks/reports/salesReportHelpers.ts` |
| MIN_SAMPLE_OPTIONS | 1, 3, 5 | `src/hooks/reports/useMarkupMinSamplePreference.ts` |
| RiskLevel | safe \| on_track \| at_risk \| critical | `src/hooks/revenue/useQuotaAttainment.ts` |
| QuotaRiskLevel | safe \| on_track \| at_risk \| critical | `src/hooks/revenue/useQuotaAttainmentPredictor.ts` |
| QuotaActionType | close_deal \| generate_pipeline \| increase_ticket \| accelerate_stage | `src/hooks/revenue/useQuotaAttainmentPredictor.ts` |
| ForecastCategory | commit \| best_case \| pipeline \| omitted \| closed | `src/hooks/revenue/useRevenueIntelligenceHub.ts` |
| ForecastPeriodType | week \| month \| quarter | `src/hooks/revenue-intelligence/useRevenueForecast.ts` |
| ForecastCategory | commit \| best \| upside \| omitted | `src/hooks/revenue-intelligence/useRevenueForecast.ts` |
| SalespersonRole | sdr \| closer \| hybrid | `src/hooks/sales/useSalespeople.ts` |
| ResponseMode | text \| audio \| both | `src/hooks/sales/useSalespersonPreferences.ts` |
| TaskPriority | low \| medium \| high \| urgent | `src/hooks/tasks/types.ts` |
| TaskType | call \| email \| meeting \| follow_up \| other \| proposal \| discount \| linkedin \| whatsapp | `src/hooks/tasks/types.ts` |
| TaskStatus | pending \| in_progress \| completed \| cancelled | `src/hooks/tasks/types.ts` |
| AtRiskPresetId | all \| low \| medium \| high \| critical | `src/hooks/win-loss/atRiskPresets.ts` |
| ChunkStatus | pending \| running \| succeeded \| failed \| cancelled | `src/hooks/win-loss/useAsyncReplayQueue.ts` |
| RiskSeverity | low \| medium \| high \| critical | `src/hooks/win-loss/useAtRiskFromPatterns.ts` |
| WebhookAlertKind | consecutive_failures \| high_retry_rate \| attempts_exhausted | `src/hooks/win-loss/useWebhookAlerts.ts` |
| DeadLetterStatus | pending \| replaying \| replayed \| archived | `src/hooks/win-loss/useWebhookDeadLetters.ts` |
| WebhookStatsWindow | 24h \| 7d \| 30d | `src/hooks/win-loss/useWebhookDeliveryStats.ts` |
| TimelineSource | delivery \| dead_letter \| alert | `src/hooks/win-loss/useWebhookTimeline.ts` |
| BandMode | see \| pi95 | `src/hooks/win-loss/useWinLossScenarios.ts` |
| WLGranularity | week \| month | `src/hooks/win-loss/useWinLossViewPrefs.ts` |
| MarkupTier | excellent \| healthy \| critical \| unknown | `src/lib/markupHelpers.ts` |
| StageState | done \| current \| pending \| blocked | `src/lib/orderTracking/stages.ts` |
| EASE_F1_BRAKE | 0.16, 1, 0.3, 1 | `src/lib/race/easings.ts` |
| RiskSeverity | low \| medium \| high \| critical | `src/lib/winloss/atRiskFixtures.ts` |
| LSEIntensity | light \| strong \| edge | `src/lib/winloss/atRiskFixtures.ts` |
| RiskSeverity | low \| medium \| high \| critical | `src/lib/winloss/riskSeverity.ts` |
| ActionMatrixKind | matrix \| win-override \| default-fallback | `src/lib/winloss/riskSeverity.ts` |
| ClientSortKey | name_asc \| name_desc \| value_desc \| value_asc \| date_desc \| date_asc | `src/services/clientService.ts` |
| SalesSortKey | date_desc \| date_asc \| value_desc \| value_asc \| client_asc \| markup_desc \| markup_asc | `src/services/salesService.ts` |
| TemplateType | whatsapp \| email \| call | `src/types/sales.ts` |
| CampaignAlertType | opt_out_rate \| stalled \| failure_rate | `supabase/functions/_shared/campaign-health.ts` |
| CampaignAlertSeverity | info \| warning \| critical | `supabase/functions/_shared/campaign-health.ts` |
| CircuitState | CLOSED \| OPEN \| HALF_OPEN | `supabase/functions/_shared/circuit-breaker.ts` |
| FileSignature | wav \| mp3 \| ogg \| webm \| mp4 | `supabase/functions/_shared/file-signature.ts` |
| ErrorCode | BAD_REQUEST \| UNAUTHORIZED \| FORBIDDEN \| NOT_FOUND \| CONFLICT \| RATE_LIMITED \| UPSTREAM_ERROR \| INTERNAL_ERROR | `supabase/functions/_shared/http-envelope.ts` |
| NOTIFICATION_CATEGORIES | "general", "sales", "goals", "gamification", "security", "system", "team", "ai", "approval", | `supabase/functions/_shared/notification-categories.ts` |
| NOTIFICATION_PRIORITIES | "low", "medium", "high", "critical", | `supabase/functions/_shared/notification-categories.ts` |
| WON_SALE_STATUSES | "completed", "won", "closed" | `supabase/functions/_shared/sale-statuses.ts` |
| LOST_SALE_STATUSES | "lost", "cancelled" | `supabase/functions/_shared/sale-statuses.ts` |
| OPEN_SALE_STATUSES | "lead", "prospecting", "qualified", "proposal", "negotiation", "pending", | `supabase/functions/_shared/sale-statuses.ts` |
| SuppressionReason | hard_bounce \| complaint \| unsubscribe | `supabase/functions/_shared/unsubscribe.ts` |
| NormalizedMessageStatus | sent \| delivered \| read \| failed | `supabase/functions/_shared/webhook-integrity.ts` |
| InboundEmailProvider | resend \| sendgrid \| generic | `supabase/functions/_shared/webhook-integrity.ts` |
| InboundEventType | reply \| bounce \| complaint \| unsubscribe \| other | `supabase/functions/_shared/webhook-integrity.ts` |
| RiskSeverity | low \| medium \| high \| critical | `supabase/functions/_shared/winloss-contract.ts` |
| RiskReasonCode | STAGNATION_HIGH \| STAGNATION_LOW \| AMOUNT_ALIGNED \| STAGE_STUCK \| COMPETITOR_PRESSURE \| CROSSED_SIGNALS | `supabase/functions/_shared/winloss-contract.ts` |
| RiskReasonSource | stagnation \| amount \| stage \| competitor \| generic | `supabase/functions/_shared/winloss-contract.ts` |
| AlertKind | high_failure_rate \| exhausted_spike \| pending_backlog | `supabase/functions/check-v4-callback-alerts/alerts.ts` |
| AssistantFallbackMode | briefing \| chat \| proactive_nudge | `supabase/functions/personal-assistant-stream/fallback.ts` |
| LogLevel | info \| warn \| error | `supabase/functions/run-retry-tests/retry.ts` |
| LogLevel | info \| warn \| error | `supabase/functions/winloss-webhook-dispatcher/retry.ts` |

## F. Validações de entrada

### F.1 Schemas Zod

- **activityGoalSchema** (`src/components/activities/ActivityGoalEditDialog.tsx`, z.object):
  ```ts
  { calls_goal: z .string() .refine(val => !isNaN(parseInt(val)), 'Valor inválido') .refine(val => parseInt(val) >= 0, 'Valor deve ser positivo') .refine(val => parseInt(val) <= 200, 'Valor máximo é 200'), emails_goal: z .string() .refine(val => !isNaN(parseInt(val)), 'Valor inválido') .refine(val => parseInt(val) >= 0, 'Valor deve ser positivo') .refine(val => parseInt(val) <= 200, 'Valor máximo é 200'), meetings_goal: z .string() .refine(val => !isNaN(parseInt(val)), 'Valor inválido') .refine(val => parseInt(val) >= 0, 'Valor deve ser positivo') .refine(val => parseInt(val) <= 50, 'Valor máximo é 50'), linkedin_goal: z .string() .refine(val => !isNaN(parseInt(val)), 'Valor inválido') .refine(val => parseInt(val) >= 0, 'Valor deve ser positivo') .refine(val => parseInt(val) <= 200, 'Valor m …
  ```
  - Regras cruzadas (refine): “Valor inválido” · “Valor deve ser positivo” · “Valor máximo é 200” · “Valor inválido” · “Valor deve ser positivo” · “Valor máximo é 200” · “Valor inválido” · “Valor deve ser positivo” · “Valor máximo é 50” · “Valor inválido”
- **activitySchema** (`src/components/activities/ActivityLogForm.tsx`, z.object):
  ```ts
  { activity_type: z.enum([ 'call', 'email', 'meeting', 'linkedin', 'whatsapp', 'note', 'other', ]), outcome: z.enum([ 'connected', 'no_answer', 'scheduled', 'voicemail', 'busy', 'callback', 'not_interested', 'qualified', 'bad_timing', 'wrong_person', 'unsubscribed', ]), salesperson_id: z.string().optional(), client_id: z.string().optional(), contact_name: z .string() .max(100, 'Nome do contato deve ter no máximo 100 caracteres') .optional(), duration_minutes: z .string() .optional() .refine(val => { if (!val) return true; const num = parseInt(val); return !isNaN(num) && num >= 1 && num <= 480; }, 'Duração deve ser entre 1 e 480 minutos'), notes: z .string() .max(1000, 'Observações devem ter no máximo 1000 caracteres') .optional(), // MQL Qualification Fields pain_points: z.string().optional …
  ```
  - Regras cruzadas (refine): “Duração deve ser entre 1 e 480 minutos”
- **stepInputSchema** (`src/components/cadences/CreateCadenceDialog.tsx`, z.object, encadeia refine):
  ```ts
  { day_number: z.number().min(1, 'Dia deve ser pelo menos 1'), action_type: z.enum([ 'email', 'call', 'linkedin', 'whatsapp', 'task', 'meeting', 'other', ]), title: z.string().trim().min(3, 'Título deve ter pelo menos 3 caracteres').max(100), template_content: z.string().optional(), needs_approval: z.boolean().default(false), task_type: z.enum(['manual', 'automatic']).default('manual'), }
  ```
  - Regras cruzadas (refine): “whatsapp”
- **cadenceSchema** (`src/components/cadences/CreateCadenceDialog.tsx`, z.object):
  ```ts
  { name: z .string() .trim() .min(1, 'Nome é obrigatório') .max(100, 'Nome deve ter no máximo 100 caracteres'), description: z .string() .max(500, 'Descrição deve ter no máximo 500 caracteres') .optional(), }
  ```
- **cadenceSchema** (`src/components/cadences/EditCadenceDialog.tsx`, z.object):
  ```ts
  { name: z.string().trim().min(1, 'Nome é obrigatório').max(100), description: z.string().max(500).optional(), }
  ```
- **stepInputSchema** (`src/components/cadences/EditCadenceDialog.tsx`, z.object, encadeia refine):
  ```ts
  { day_number: z.number().min(1, 'Dia deve ser pelo menos 1'), action_type: z.enum([ 'email', 'call', 'linkedin', 'whatsapp', 'task', 'meeting', 'other', ]), title: z.string().trim().min(3, 'Título deve ter pelo menos 3 caracteres').max(100), description: z.string().optional(), needs_approval: z.boolean().default(false), task_type: z.enum(['manual', 'automatic']).default('manual'), }
  ```
  - Regras cruzadas (refine): “whatsapp”
- **clientSchema** (`src/components/clients/CreateClientDialog.tsx`, z.object):
  ```ts
  { name: z .string() .trim() .min(1, 'Nome é obrigatório') .max(100, 'Nome deve ter no máximo 100 caracteres'), email: z .string() .trim() .email('E-mail inválido') .max(255, 'E-mail deve ter no máximo 255 caracteres') .or(z.literal('')), phone: brPhoneField().optional().or(z.literal('')), company: z .string() .trim() .max(100, 'Empresa deve ter no máximo 100 caracteres') .optional() .or(z.literal('')), lead_source: z.string().optional().or(z.literal('')), lat: z.string().optional().or(z.literal('')), lng: z.string().optional().or(z.literal('')), }
  ```
- **editClientSchema** (`src/components/clients/EditClientDialog.tsx`, z.object):
  ```ts
  { name: z .string() .trim() .min(1, 'Nome é obrigatório') .max(100, 'Nome deve ter no máximo 100 caracteres'), email: z .string() .trim() .email('E-mail inválido') .max(255, 'E-mail deve ter no máximo 255 caracteres') .or(z.literal('')), phone: brPhoneField(), company: z.string().trim().max(100, 'Empresa deve ter no máximo 100 caracteres'), total_value: z .string() .refine(val => !val || !isNaN(parseFloat(val)), 'Valor inválido') .refine(val => !val || parseFloat(val) >= 0, 'Valor deve ser positivo'), lead_source: z.string().optional(), lat: z.string().optional(), lng: z.string().optional(), }
  ```
  - Regras cruzadas (refine): “Valor inválido” · “Valor deve ser positivo”
- **composeFormSchema** (`src/components/email/aiEmailHelpers.ts`, z.object):
  ```ts
  { goal: z.enum([ 'intro', 'follow_up', 'meeting', 'reactivation', 'breakup', 'proposal', 'thanks', ]), tone: z.enum(['formal', 'casual', 'consultivo', 'direto']), language: z.enum(['pt-BR', 'en']), length: z.enum(['short', 'medium', 'long']), custom_instructions: z.string().max(500).optional(), }
  ```
- **productSchema** (`src/components/products/CreateProductDialog.tsx`, z.object):
  ```ts
  { name: z .string() .trim() .min(1, 'Nome é obrigatório') .max(100, 'Nome deve ter no máximo 100 caracteres'), sku: z.string().trim().min(1, 'SKU é obrigatório'), category: z.string(), price: z .string() .min(1, 'Preço é obrigatório') .refine(val => { const num = parseFloat(val); return !isNaN(num) && num >= 0; }, 'Preço deve ser um valor válido'), stock_quantity: z.string(), }
  ```
  - Regras cruzadas (refine): “Preço deve ser um valor válido”
- **editProductSchema** (`src/components/products/EditProductDialog.tsx`, z.object):
  ```ts
  { name: z .string() .trim() .min(1, 'Nome é obrigatório') .max(100, 'Nome deve ter no máximo 100 caracteres'), sku: z.string().trim().min(1, 'SKU é obrigatório'), category: z.string(), price: z .string() .min(1, 'Preço é obrigatório') .refine(val => !isNaN(parseFloat(val)), 'Preço inválido') .refine(val => parseFloat(val) >= 0, 'Preço deve ser positivo'), stock_quantity: z.string(), }
  ```
  - Regras cruzadas (refine): “Preço inválido” · “Preço deve ser positivo”
- **saleSchema** (`src/components/sales/CreateSaleDialog.tsx`, z.object):
  ```ts
  { client_id: z.string().optional(), client_name: z.string().trim().min(1, 'Nome do cliente é obrigatório'), product_id: z.string().optional(), product_name: z.string().trim().min(1, 'Produto é obrigatório'), amount: z .string() .min(1, 'Valor é obrigatório') .refine(val => { const num = parseFloat(val); return !isNaN(num) && num > 0; }, 'Valor deve ser maior que zero'), sdr_id: z.string().optional(), closer_id: z.string().optional(), is_first_sale: z.boolean(), source: z.string(), }
  ```
  - Regras cruzadas (refine): “Valor deve ser maior que zero”
- **ipSchema** (`src/components/security/BlockedIPsPanel.tsx`, z.string):
  ```ts
  
  ```
- **ipSchema** (`src/components/security/IPWhitelistManager.tsx`, z.object):
  ```ts
  { ip_address: z .string() .trim() .min(7, 'IP inválido') .max(45, 'IP muito longo') .regex( /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:[0-9]|[1-2][0-9]|3[0-2]))?$|^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/, 'Formato de IP inválido. Use IPv4 (ex: 192.168.1.1) ou CIDR (ex: 192.168.1.0/24)' ), description: z.string().trim().max(500, 'Descrição muito longa').optional(), }
  ```
- **taskSchema** (`src/components/tasks/CreateTaskDialog.tsx`, z.object):
  ```ts
  { title: z .string() .trim() .min(1, 'Título é obrigatório') .max(200, 'Título deve ter no máximo 200 caracteres'), description: z .string() .max(1000, 'Descrição deve ter no máximo 1000 caracteres') .optional(), salesperson_id: z.string().optional(), client_id: z.string().optional(), sale_id: z.string().optional(), priority: z.enum(['high', 'medium', 'low']), task_type: z.enum([ 'call', 'meeting', 'follow_up', 'email', 'proposal', 'linkedin', 'whatsapp', 'other', ]), due_date: z.string().min(1, 'Data é obrigatória'), due_time: z.string().optional(), }
  ```
- **teamSchema** (`src/components/teams/CreateTeamDialog.tsx`, z.object):
  ```ts
  { name: z .string() .trim() .min(1, 'Nome é obrigatório') .max(100, 'Nome deve ter no máximo 100 caracteres'), sdr_id: z.string().min(1, 'SDR é obrigatório'), inactivity_days: z.string(), }
  ```
- **editTeamSchema** (`src/components/teams/EditTeamDialog.tsx`, z.object):
  ```ts
  { name: z.string().trim().min(1, 'Nome é obrigatório').max(100), sdr_id: z.string().min(1, 'SDR é obrigatório'), inactivity_days: z.string(), is_active: z.boolean(), }
  ```
- **goalEditSchema** (`src/components/vendedores/GoalEditDialog.tsx`, z.object):
  ```ts
  { commission_rate: z .string() .min(1, 'Taxa de comissão é obrigatória') .refine(val => !isNaN(parseFloat(val)), 'Taxa inválida') .refine(val => parseFloat(val) >= 0, 'Taxa deve ser positiva') .refine(val => parseFloat(val) <= 100, 'Taxa deve ser no máximo 100%'), goal_amount: z .string() .min(1, 'Meta é obrigatória') .refine(val => !isNaN(parseFloat(val)), 'Valor inválido') .refine(val => parseFloat(val) >= 0, 'Meta deve ser positiva') .refine( val => parseFloat(val) <= 100000000, 'Meta deve ser no máximo R$ 100.000.000' ), }
  ```
  - Regras cruzadas (refine): “Taxa inválida” · “Taxa deve ser positiva” · “Taxa deve ser no máximo 100%” · “Valor inválido” · “Meta deve ser positiva” · “Meta deve ser no máximo R$ 100.000.000”
- **salespersonSchema** (`src/components/vendedores/SalespersonForm.tsx`, z.object):
  ```ts
  { name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'), email: z .string() .trim() .email('Email inválido') .max(255, 'Email muito longo') .or(z.literal('')), commission_rate: z .string() .refine(val => !isNaN(parseFloat(val)), 'Valor inválido') .refine(val => parseFloat(val) >= 0, 'Taxa mínima é 0%') .refine(val => parseFloat(val) <= 100, 'Taxa máxima é 100%'), goal_amount: z .string() .refine(val => !isNaN(parseFloat(val)), 'Valor inválido') .refine(val => parseFloat(val) >= 0, 'Meta deve ser positiva'), role: z.enum(['sdr', 'closer', 'hybrid']), }
  ```
  - Regras cruzadas (refine): “Valor inválido” · “Taxa mínima é 0%” · “Taxa máxima é 100%” · “Valor inválido” · “Meta deve ser positiva”
- **emailSchema** (`src/hooks/auth/useAuthForm.ts`, z.string):
  ```ts
  
  ```
- **passwordSchema** (`src/hooks/auth/useAuthForm.ts`, z.string):
  ```ts
  
  ```
- **passwordSchema** (`src/pages/ResetPassword.tsx`, z.string):
  ```ts
  
  ```
- **CRMEventContract** (`supabase/functions/_shared/contracts.ts`, z.object):
  ```ts
  { event_id: z.string().uuid({ message: "event_id deve ser um UUID válido" }), timestamp: z.string().datetime({ message: "timestamp deve estar no formato ISO-8601" }), source: z.enum(["bitrix24", "salesforce", "hubspot", "custom"]), payload: z.record(z.unknown()).describe("Dados específicos do evento"), actor: z.object({ id: z.string().optional(), email: z.string().email().optional(), }).optional(), }
  ```
- **LeadUpdateContract** (`supabase/functions/_shared/contracts.ts`, z.object):
  ```ts
  { lead_id: z.string().min(1, "lead_id é obrigatório"), score: z.number().min(0).max(100).optional(), status: z.string().optional(), metadata: z.record(z.unknown()).optional(), }
  ```
- **AIAnalysisContract** (`supabase/functions/_shared/contracts.ts`, z.object):
  ```ts
  { entity_id: z.string().min(1), entity_type: z.enum(["deal", "call", "lead", "salesperson"]), analysis_type: z.string(), options: z.object({ temperature: z.number().min(0).max(1).optional(), model: z.string().optional(), }).optional(), }
  ```
- **notificationCategorySchema** (`supabase/functions/_shared/notification-categories.ts`, z.enum):
  ```ts
  NOTIFICATION_CATEGORIES
  ```
- **notificationPrioritySchema** (`supabase/functions/_shared/notification-categories.ts`, z.enum):
  ```ts
  NOTIFICATION_PRIORITIES
  ```
- **notificationRowSchema** (`supabase/functions/_shared/notification-categories.ts`, z.object):
  ```ts
  { user_id: z.string().uuid(), type: z.string().min(1).max(64), title: z.string().min(1).max(200), category: notificationCategorySchema.optional(), priority: notificationPrioritySchema.optional(), message: z.string().max(2000).nullish(), icon: z.string().max(64).nullish(), action_url: z.string().max(500).nullish(), action_label: z.string().max(100).nullish(), metadata: z.record(z.unknown()).nullish(), expires_at: z.string().nullish(), }
  ```
- **UUID** (`supabase/functions/winloss-webhook-dispatcher/schema.ts`, z.string):
  ```ts
  
  ```
- **DispatcherPayloadSchema** (`supabase/functions/winloss-webhook-dispatcher/schema.ts`, z.object):
  ```ts
  { event: z .string({ required_error: "event required" }) .trim() .min(1, "event required") .max(200, "event too long") // event names should look like "winloss.deal.lost" / "ping" / "deal_won" .regex(/^[a-z0-9][a-z0-9._-]{0,199}$/i, "event must match [a-z0-9._-]"), __target_subscription_id: UUID.optional(), __replay_of: UUID.optional(), __request_id: UUID.optional(), }
  ```
- **idArray** (`supabase/functions/winloss-webhook-replay/schema.ts`, z.array):
  ```ts
  z.string().uuid()
  ```
- **RawBodySchema** (`supabase/functions/winloss-webhook-replay/schema.ts`, z.object):
  ```ts
  { dead_letter_ids: z.array(z.string()).optional(), dead_letter_id: z.string().optional(), delivery_ids: z.array(z.string()).optional(), delivery_id: z.string().optional(), }
  ```
- **idArray** (`supabase/functions/winloss-webhook-replay-batch/schema.ts`, z.array):
  ```ts
  z.string().uuid()
  ```
- **RawBodySchema** (`supabase/functions/winloss-webhook-replay-batch/schema.ts`, z.object):
  ```ts
  { dead_letter_ids: z.array(z.string()).optional(), delivery_ids: z.array(z.string()).optional(), chunk_size: z.number().int().min(1).max(MAX_CHUNK_SIZE).optional(), stop_on_error: z.boolean().optional(), }
  ```
- **InputSchema** (`supabase/functions/winloss-webhook-timeline/index.ts`, z.object, encadeia refine):
  ```ts
  { requestId: z.string().uuid().optional(), subscriptionId: z.string().uuid().optional(), /** ISO timestamp lower bound. Defaults to now-7d when omitted. */ since: z.string().datetime().optional(), /** Hard cap on items returned (default 200, max 500). */ limit: z.number().int().min(1).max(500).optional(), }
  ```
  - Regras cruzadas (refine): “Provide at least one of requestId or subscriptionId.”

### F.2 react-hook-form (register/rules)

_nenhum item encontrado_

### F.3 Restrições em inputs HTML (required/min/max/pattern)

| Campo | Restrições | Arquivo |
|---|---|---|
| `email` | type=email | `src/components/auth/AuthFormCard.tsx` |
| `when` | type=datetime-local | `src/components/coaching/sessions/SessionScheduleDialog.tsx` |
| `dur` | type=number, min=15, max=240, step=15 | `src/components/coaching/sessions/SessionScheduleDialog.tsx` |
| `sh-email` | type=email | `src/components/deal-intelligence/StakeholderFormDialog.tsx` |
| `ai-to` | type=email | `src/components/email/AIEmailComposerDialog.tsx` |
| `target` | type=number, min=1 | `src/components/gamification/CreateChallengeDialog.tsx` |
| `xp` | type=number, min=1 | `src/components/gamification/CreateChallengeDialog.tsx` |
| `startDate` | type=date | `src/components/gamification/CreateChallengeDialog.tsx` |
| `endDate` | type=date | `src/components/gamification/CreateChallengeDialog.tsx` |
| `min_capital` | min, type=number, min | `src/components/icp/ICPConfigForm.tsx` |
| `min_employees` | min, type=number, min | `src/components/icp/ICPConfigForm.tsx` |
| `capital` | type=number | `src/components/icp/ICPEditDialog.tsx` |
| `colaboradores` | type=number | `src/components/icp/ICPEditDialog.tsx` |
| `car-nick` | max | `src/components/race/CarCustomizer.tsx` |
| `password` | type=password | `src/components/security/ReauthDialog.tsx` |
| `spike-threshold` | type=number, min=1, max=100 | `src/components/settings/SecurityAlertSettings.tsx` |
| `time-window` | type=number, min=1, max=48 | `src/components/settings/SecurityAlertSettings.tsx` |
| `cooldown` | type=number, min=1, max=168 | `src/components/settings/SecurityAlertSettings.tsx` |
| `newDate` | type=date | `src/components/tasks/RescheduleDialog.tsx` |
| `webhook-success-threshold` | type=number, min=0, max=100, step=1 | `src/components/win-loss/WebhookHealthPanel.tsx` |
| `max` | max, type=number, min=1, max=50, max | `src/pages/AdminFilaTarefasAutomaticas.tsx` |
| `filter-from` | type=date | `src/pages/AdminHistoricoAlertasChurn.tsx` |
| `filter-to` | type=date | `src/pages/AdminHistoricoAlertasChurn.tsx` |
| `amount` | type=number, min=0, step=form.bonus_kind ===  | `src/pages/AdminPremiacoes.tsx` |
| `priority` | type=number | `src/pages/AdminPremiacoes.tsx` |
| `dsr-email` | type=email | `src/pages/AdminSolicitacoesTitular.tsx` |
| `optout-email` | type=email | `src/pages/AdminSupressaoEmails.tsx` |
| `ev-when` | type=datetime-local | `src/pages/Agenda.tsx` |
| `email` | type=email | `src/pages/Notificacoes.tsx` |
| `password` | type=password | `src/pages/ResetPassword.tsx` |
| `confirm-password` | type=password | `src/pages/ResetPassword.tsx` |
| `f.key` | type=number, min=f.min, max=f.max, step=f.step | `src/pages/admin/WebhookAlertSettingsPage.tsx` |

## G. Fórmulas e derivações (como valores são calculados)

### G.1 Colunas calculadas no banco

| Tabela | Coluna | Expressão |
|---|---|---|
| `sales` | `deal_status` | `CASE WHEN status IN ('completed', 'won', 'closed') THEN 'completed'::public.deal_status WHEN status IN ('lost', 'cancelled') THEN 'lost'::public.deal_status WHEN status = 'qualified' THEN 'qualified'::public.deal_status WHEN status = 'proposal' THEN 'proposal'::public.deal_status WHEN status = 'negotiation' THEN 'negotiation'::public.deal_status WHEN status IN ('pending', 'lead', 'prospecting', 'open', 'in_progress') THEN 'pending'::public.deal_status ELSE NULL END` |
| `contact_send_time_profile` | `score` | `opens * 1.0 + clicks * 2.0 + replies * 5.0` |
| `win_probability_deal_calibrations` | `calibration_delta` | `calibrated_probability - declared_probability` |

### G.2 Views (consultas derivadas)

| View | SELECT |
|---|---|
| `v_active_clients` | `SELECT * FROM clients WHERE deleted_at IS NULL` |
| `v_deleted_clients` | `SELECT c.*, u.email as deleted_by_email FROM clients c LEFT JOIN auth.users u ON u.id = c.deleted_by WHERE c.deleted_at IS NOT NULL` |
| `v_active_deals` | `SELECT * FROM deals WHERE deleted_at IS NULL` |
| `v_deleted_deals` | `SELECT d.*, u.email as deleted_by_email FROM deals d LEFT JOIN auth.users u ON u.id = d.deleted_by WHERE d.deleted_at IS NOT NULL` |
| `v_active_activities` | `SELECT * FROM activities WHERE deleted_at IS NULL` |
| `v_active_products` | `SELECT * FROM products WHERE deleted_at IS NULL` |
| `v_active_suppliers` | `SELECT * FROM suppliers WHERE deleted_at IS NULL` |
| `v_active_teams` | `SELECT * FROM teams WHERE deleted_at IS NULL` |
| `deals_active` | `SELECT * FROM deals WHERE deleted_at IS NULL` |
| `clients_active` | `SELECT * FROM clients WHERE deleted_at IS NULL` |
| `activities_active` | `SELECT * FROM activities WHERE deleted_at IS NULL` |
| `tasks_active` | `SELECT * FROM tasks WHERE deleted_at IS NULL` |
| `salespeople_public` | `SELECT id, name, avatar_url, role, is_active FROM public.salespeople WHERE (is_active = true)` |
| `sequence_variant_performance` | `SELECT v.step_id, v.id AS variant_id, v.label, (count(e.id))::integer AS sent, (count(e.replied_at))::integer AS replied, CASE WHEN (count(e.id) > 0) THEN round(((100.0 * (count(e.replied_at))::numeric) / (count(e.id))::numeric), 2) ELSE (0)::numeric END AS reply_rate FROM (sequence_step_variants v …` |
| `contact_best_send_window` | `SELECT contact_id, contact_type, hour_of_day, day_of_week, opens, clicks, replies, score, rank FROM ( SELECT p.id, p.contact_id, p.contact_type, p.hour_of_day, p.day_of_week, p.opens, p.clicks, p.replies, p.score, p.updated_at, row_number() OVER (PARTITION BY p.contact_id, p.contact_type ORDER BY p. …` |
| `engagement_score_leaderboard` | `SELECT id, contact_id, contact_type, score, tier, total_opens, total_clicks, total_replies, last_signal_at, updated_at, CASE WHEN (contact_type = 'lead'::text) THEN ( SELECT sales.client_name FROM sales WHERE (sales.id = ces.contact_id)) WHEN (contact_type = 'client'::text) THEN ( SELECT clients.nam …` |
| `call_sentiment_summary` | `SELECT recording_id, count(*) AS segments_count, (avg(score))::numeric(4,3) AS avg_score, (avg(score) FILTER (WHERE (speaker = 'salesperson'::text)))::numeric(4,3) AS avg_score_salesperson, (avg(score) FILTER (WHERE (speaker = 'client'::text)))::numeric(4,3) AS avg_score_client, count(*) FILTER (WHE …` |
| `client_purchase_seasonality` | `SELECT c.id AS client_id, c.name AS client_name, EXTRACT(MONTH FROM s.created_at AT TIME ZONE 'America/Sao_Paulo')::int AS month_of_year, EXTRACT(DOW FROM s.created_at AT TIME ZONE 'America/Sao_Paulo')::int AS day_of_week, COUNT(*)::int AS deal_count, COALESCE(AVG(s.amount), 0)::numeric AS avg_reven …` |
| `race_leaderboard_view` | `WITH season_metrics AS ( SELECT rs.id AS season_id, rs.role_type, rs.start_date, rs.end_date, rs.goal_amount, rc.id AS car_id, rc.salesperson_id, sp.name AS salesperson_name, sp.avatar_url, rc.car_number, rc.primary_color, rc.secondary_color, rc.car_style, rc.nickname, COALESCE(sum(s.amount) FILTER …` |
| `v_pipeline_coverage_summary` | `SELECT DISTINCT ON (COALESCE((owner_id)::text, 'global'::text)) COALESCE((owner_id)::text, 'global'::text) AS owner_key, owner_id, period_start, period_end, sum(quota_amount) OVER (PARTITION BY COALESCE((owner_id)::text, 'global'::text), calculated_at) AS total_quota, sum(weighted_pipeline) OVER (PA …` |
| `coaching_impact_metrics` | `WITH base AS ( SELECT cs.id AS session_id, cs.salesperson_id, cs.coach_id, cs.completed_at, cs.focus_skills, cs.outcome_rating FROM coaching_sessions cs WHERE ((cs.status = 'completed'::text) AND (cs.completed_at IS NOT NULL) AND (cs.salesperson_id IS NOT NULL)) ), score_pre AS ( SELECT b_1.session_ …` |
| `revenue_forecast_view` | `WITH open_deals AS ( SELECT s.id, s.salesperson_id, s.amount, s.status, s.forecast_category, s.created_at, s.updated_at, sp.probability AS stage_probability FROM public.sales s JOIN public.stage_probabilities sp ON sp.stage = s.status WHERE sp.probability > 0 AND sp.probability < 1 ), category_agg A …` |
| `conversation_insights_summary` | `SELECT analyzed_by AS user_id, (count(*))::integer AS total_analyses, (count(*) FILTER (WHERE (sentiment = 'positive'::text)))::integer AS positive_count, (count(*) FILTER (WHERE (sentiment = 'negative'::text)))::integer AS negative_count, (count(*) FILTER (WHERE (sentiment = 'neutral'::text)))::int …` |
| `latest_briefing_view` | `SELECT id, briefing_date, pulse_score, headline, narrative, key_wins, key_risks, recommended_actions, generated_by, created_by, created_at FROM public.executive_briefings ORDER BY briefing_date DESC, created_at DESC LIMIT 1` |
| `race_rivalries_view` | `WITH overtake_pairs AS ( SELECT race_events.season_id, race_events.salesperson_id AS overtaker_id, ((race_events.metadata ->> 'overtaken_id'::text))::uuid AS overtaken_id, race_events.created_at FROM race_events WHERE ((race_events.event_type = 'overtake'::text) AND (race_events.metadata ? 'overtake …` |
| `race_spectator_view` | `SELECT season_id, car_id, salesperson_id, salesperson_name, avatar_url, car_number, primary_color, secondary_color, car_style, nickname, role_type, total_sales, deals_count, score, progress FROM public.race_leaderboard_view` |
| `follow_up_audit_view` | `SELECT al.id, al.sale_id, s.client_name AS lead_name, al.user_id, sp.name AS user_name, al.action_type, al.details, al.status, al.retry_count, al.created_at FROM ((follow_up_audit_logs al LEFT JOIN sales s ON ((al.sale_id = s.id))) LEFT JOIN salespeople sp ON ((al.user_id = sp.auth_user_id)))` |
| `competitive_ranking` | `SELECT * FROM public.mv_competitive_ranking` |
| `web_vitals_p75_last7d` | `SELECT route, metric, COUNT(*) AS samples, percentile_cont(0.75) WITHIN GROUP (ORDER BY value) AS p75, percentile_cont(0.95) WITHIN GROUP (ORDER BY value) AS p95, AVG(value) AS avg_value, SUM(CASE WHEN rating = 'poor' THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*),0) AS poor_ratio FROM public.web_vital …` |
| `v_rate_limit_blocked_sellers` | `SELECT identifier, identifier_type, action AS endpoint, request_count, window_start, window_end AS blocked_until, EXTRACT(EPOCH FROM (window_end - now())) AS seconds_until_unblock, created_at FROM public.rate_limit_logs WHERE action = 'quote-sync-promo-champions' AND blocked = true AND window_end IS …` |
| `v_quote_to_sale_invariants` | `WITH dup AS ( SELECT COUNT(*)::BIGINT AS n FROM ( SELECT order_number FROM public.orders WHERE order_number IS NOT NULL GROUP BY order_number HAVING COUNT(*) > 1 ) d ), orphans AS ( SELECT COUNT(*)::BIGINT AS n FROM public.sales s WHERE s.source IN ('quote_conversion', 'gift_store') AND NOT EXISTS ( …` |
| `v_security_definer_exposure` | `SELECT n.nspname AS schema_name, p.proname AS function_name, pg_get_function_identity_arguments(p.oid) AS args, has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_can_execute, has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_can_execute, has_function_privilege('servic …` |
| `v_platform_wal_health` | `SELECT (SELECT pg_size_pretty(sum(size)) FROM pg_ls_waldir()) AS wal_dir_size, (SELECT pg_size_pretty(pg_database_size(current_database()))) AS db_size, (SELECT count(*) FROM pg_replication_slots WHERE active) AS active_slots, (SELECT count(*) FROM pg_replication_slots WHERE NOT active) AS inactive_ …` |
| `v_platform_slo` | `WITH days AS ( SELECT generate_series( (current_date - INTERVAL '29 days')::date, current_date, '1 day'::interval )::date AS day ), dispatch AS ( SELECT date_trunc('day', wd.created_at)::date AS day, COUNT(*) FILTER (WHERE wd.succeeded IS TRUE) AS sent_ok, COUNT(*) FILTER (WHERE wd.succeeded IS FALS …` |
| `v_quote_conversion_history` | `SELECT a.id AS audit_id, a.created_at AS occurred_at, a.quote_id, q.title AS quote_title, q.client_name AS quote_client, a.sale_id, a.order_id, a.order_number, a.previous_status, a.new_status, a.reused_order, a.idempotent, a.success, a.error_code, a.error_message, a.latency_ms, a.request_id, a.actor …` |
| `v_quote_conversion_metrics_daily` | `SELECT date_trunc('day', created_at)::date AS day, COUNT(*) AS attempts, COUNT(*) FILTER (WHERE success) AS successes, COUNT(*) FILTER (WHERE NOT success) AS failures, COUNT(*) FILTER (WHERE idempotent) AS idempotent_hits, COUNT(*) FILTER (WHERE reused_order) AS reused_orders, ROUND( COUNT(*) FILTER …` |
| `v_web_vitals_p75` | `SELECT date_trunc('day', created_at)::date AS day, COALESCE(NULLIF(route, ''), '/') AS route, CASE WHEN viewport_width IS NULL THEN 'unknown' WHEN viewport_width < 768 THEN 'mobile' WHEN viewport_width < 1024 THEN 'tablet' ELSE 'desktop' END AS device_type, metric AS metric_name, COUNT(*)::int AS sa …` |
| `sales_with_markup` | `SELECT s.id, s.client_id, s.client_name, s.product_id, s.product_name, s.sku, s.amount, s.status, s.salesperson_id, s.sdr_id, s.closer_id, s.created_at, s.updated_at, s.markup_pct, s.cost_source, s.cost_synced_at, CASE WHEN public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid() …` |
| `mv_competitive_ranking` | `WITH monthly_sales AS ( SELECT salesperson_id, SUM(amount) as total_sales, COUNT(*) as deals_count FROM public.sales WHERE status IN ('completed', 'won', 'closed') AND COALESCE(closed_at, updated_at) >= date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo' AND …` |

### G.3 Funções de cálculo/decisão no código

- **applyTemplate(text: string)** — `src/components/activities/ActivityLogForm.tsx`
  ```
  const currentNotes = form.getValues('notes'); form.setValue('notes', currentNotes ? `${currentNotes}\n\n${text}` : text); toast.success('Template aplicado!');
  ```
- **computeHealthScore(client: { total_value: number; last_purchase_date: string | null; activity_count: number; })** — `src/components/analytics/ClientHealthPanel.tsx`
  ```
  score: number; category: 'healthy' | 'at_risk' | 'critical'; factors: string[]
  ```
- **formatCurrency(value: number)** — `src/components/analytics/PerformanceComparison.tsx`
  ```
  return formatBRL(value);
  ```
- **formatCurrency(value: number)** — `src/components/analytics/performance/PerformanceCharts.tsx`
  ```
  return formatBRL(value);
  ```
- **formatCurrency(value: number)** — `src/components/analytics/performance/SalespersonCard.tsx`
  ```
  return formatBRL(value);
  ```
- **calculateRiskLevel(daysWithoutActivity: number | null, daysInStage: number | null, status: string)** — `src/components/assistant/dealRiskCalculator.ts`
  ```
  const reasons: string[] = []; let riskScore = 0; if (status === 'closed_won' || status === 'closed_lost') { return { level: 'low', label: 'Concluído', color: 'text-muted-foreground', bgColor: 'bg-muted/50', icon: React.createElement(CheckCircle, { className: 'h-3.5 w-3.5' }), reasons: ['Deal já foi concluído'], action: { text: 'Deal finalizado - nenhuma ação necessária', icon: '✅' }, }; } if (daysWithoutActivity !== null) { if (daysWithoutActivity >= 14) { riskScore += 3; reasons.push(`${daysWit …
  ```
- **calculateChange(current: number, previous: number)** — `src/components/bi/BIMetricCard.tsx`
  ```
  if (previous === 0) return current > 0 ? 100 : 0; return ((current - previous) / previous) * 100;
  ```
- **formatCurrency(value: number)** — `src/components/bi/BIVendedorCharts.tsx`
  ```
  return `${formatBRL(value)}`;
  ```
- **validateSteps()** — `src/components/cadences/CreateCadenceDialog.tsx`
  ```
  const errors: Record<number, string[]> = {}; let isValid = true; steps.forEach((s, index) => { const result = stepInputSchema.safeParse(s); if (!result.success) { errors[index] = result.error.issues.map(err => err.message); isValid = false; } }); let lastDay = 0; steps.forEach((s, index) => { if (s.day_number <= lastDay) { const e = errors[index] || []; e.push(`Dia deve ser maior que ${lastDay}`); errors[index] = e; isValid = false; } lastDay = s.day_number; }); setStepErrors(errors); return isV …
  ```
- **applyOutcomeRules(outcome: string, saleId: string, prospectCadenceId: string)** — `src/components/cadences/TodaysCadenceTasks.tsx`
  ```
  try { const { data: rules } = await supabase .from('cadence_outcome_rules') .select('*') .eq('outcome', outcome); if (rules && rules.length > 0) { const rule = rules[0]; // 1. Atualizar etapa do funil if (rule.to_stage) { await updateStage.mutateAsync({ saleId, stage: rule.to_stage }); } // 2. Ações de Cadência (Próximos Passos) if (rule.next_action === 'pause') { await supabase .from('prospect_cadences') .update({ status: 'paused' }) .eq('id', prospectCadenceId); } else if (rule.next_action === …
  ```
- **formatCurrency(value: number)** — `src/components/clients/Client360ViewHelpers.ts`
  ```
  
  ```
- **computeSegmentDiff(value: number, segmentAverage: number)** — `src/components/clients/Client360ViewHelpers.ts`
  ```
  if (!segmentAverage) return 0; return ((value - segmentAverage) / segmentAverage) * 100;
  ```
- **formatCurrencyFull(value: number | string)** — `src/components/closer/CloserRevenueComparison.tsx`
  ```
  formatBRL(Number(value))
  ```
- **formatCurrency(value: number | string)** — `src/components/closer/CloserRevenueEvolution.tsx`
  ```
  const num = Number(value); if (num >= 1000) { return `R$ ${(num / 1000).toFixed(0)}k`; } return `R$ ${num.toFixed(0)}`;
  ```
- **formatCurrency(v: number)** — `src/components/coaching/impact/impactHelpers.ts`
  ```
  return formatBRL(v || 0);
  ```
- **PriceAlertsPanel({ alerts, unreadCount, onMarkAllRead, formatCurrency, }: PriceAlertsPanelProps)** — `src/components/comparador/PriceAlertsPanel.tsx`
  ```
  return ( <Card className="glass border-status-warning/30 bg-status-warning/5"> <CardHeader className="pb-2"> <div className="flex items-center justify-between"> <CardTitle className="text-section-title flex items-center gap-2"> <AlertTriangle className="h-5 w-5 text-status-warning" /> Alertas de Preço </CardTitle> {unreadCount > 0 && ( <Button variant="ghost" size="sm" onClick={onMarkAllRead}> Marcar todos como lidos </Button> )} </div> </CardHeader> <CardContent> {alerts.length > 0 ? ( <div cla …
  ```
- **PriceHistoryTable({ priceHistory, formatCurrency, }: PriceHistoryTableProps)** — `src/components/comparador/PriceHistoryTable.tsx`
  ```
  if (!priceHistory || priceHistory.length === 0) return null; return ( <Card className="glass border-border/40"> <CardHeader> <CardTitle className="text-section-title flex items-center gap-2"> <History className="h-5 w-5" /> Histórico Recente de Preços </CardTitle> <CardDescription>Últimas alterações de preço dos fornecedores</CardDescription> </CardHeader> <CardContent> <Table> <TableHeader> <TableRow> <TableHead>Produto</TableHead> <TableHead>Fornecedor</TableHead> <TableHead className="text-ri …
  ```
- **ScorecardDimensionsBar({ talk, questions, objections, sentiment, moments, }: Props)** — `src/components/conversational/coaching/ScorecardDimensionsBar.tsx`
  ```
  const rows = [ { key: 'talk', score: talk }, { key: 'questions', score: questions }, { key: 'objections', score: objections }, { key: 'sentiment', score: sentiment }, { key: 'moments', score: moments }, ]; return ( <div className="space-y-2"> {rows.map(r => { const h = classifyHealth(r.score); const pct = Math.max(0, Math.min(100, r.score)); return ( <div key={r.key} className="flex items-center gap-2"> <span className="text-xs w-28 shrink-0 text-muted-foreground"> {DIMENSION_LABELS[r.key]} </sp …
  ```
- **ScorecardRadial({ score, health, size = 160 }: Props)** — `src/components/conversational/coaching/ScorecardRadial.tsx`
  ```
  const data = [ { name: 'score', value: Math.max(0, Math.min(100, score)), fill: healthHsl(health) }, ]; return ( <div className="relative" style={{ width: size, height: size }}> <ResponsiveContainer width="100%" height="100%"> <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={225} endAngle={-45} > <PolarAngleAxis type="number" domain={[0, 100]} tick={false} /> <RadialBar background={{ fill: 'hsl(var(--muted))' }} dataKey="value" cornerRadius={8} /> </RadialBarChart> </ …
  ```
- **RankingRowCard({ row, maxRevenue, index, }: { row: RankingRow; maxRevenue: number; index: number; })** — `src/components/dashboard/FuturisticRanking.tsx`
  ```
  const accent = positionAccent(row.position); const Icon = accent.icon; const pct = maxRevenue > 0 ? (row.revenue / maxRevenue) * 100 : 0; const isTop3 = row.position <= 3; return ( <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }} className="relative group" > {isTop3 && ( <div className="absolute inset-0 rounded-xl opacity-30 blur-xl pointer-events-none transition-opacity group-hover:op …
  ```
- **formatCurrencyCompact(v: number)** — `src/components/dashboard/PeriodTrendChart.tsx`
  ```
  
  ```
- **scoreTone(score: number)** — `src/components/executive-briefing/briefingHelpers.ts`
  ```
  if (score >= 75) return { label: 'Excelente', color: 'text-status-success', bg: 'bg-status-success/10', border: 'border-status-success/30', }; if (score >= 50) return { label: 'Saudável', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', }; if (score >= 30) return { label: 'Atenção', color: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/30', }; return { label: 'Crítico', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border- …
  ```
- **calculateRevenue()** — `src/components/intelligence/ScenarioSimulator.tsx`
  ```
  return formatBRL(pipeline[0] * conversion[0] * dealSize[0] * 100, { decimals: 2 });
  ```
- **ScoreRing({ score, size = 56 }: { score: number; size?: number })** — `src/components/lead-scoring/scoring-ui.tsx`
  ```
  const radius = (size - 8) / 2; const circumference = 2 * Math.PI * radius; const offset = circumference - (score / 100) * circumference; const color = score >= 80 ? 'stroke-status-error' : score >= 50 ? 'stroke-status-warning' : 'stroke-blue-500'; return ( <div className="relative" style={{ width: size, height: size }}> <svg width={size} height={size} className="-rotate-90"> <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={4} className="text-muted/30" …
  ```
- **formatCurrency(value: number)** — `src/components/pipeline/DealRow.tsx`
  ```
  formatBRL(value, { decimals: 2 });
  ```
- **generateLocalSummary(deal: { client_name: string; amount: number | null; status: string; created_at: string; updated_at: string; })** — `src/components/pipeline/DealSummaryCard.tsx`
  ```
  summary: string; next_steps: string[]; risks: string[]
  ```
- **DiscountOptimizer({ baseWinRate, discountElasticity, avgDealValue, avgMargin, }: Props)** — `src/components/pricing/DiscountOptimizer.tsx`
  ```
  const [discount, setDiscount] = useState([10]); // Parâmetros medidos no histórico (edge pricing-intelligence); sem dados // suficientes exibimos nota em vez de simular com números inventados. const hasData = baseWinRate != null && discountElasticity != null && avgDealValue != null && avgMargin != null && avgDealValue > 0; const wrBase = baseWinRate ?? 0; const elasticity = discountElasticity ?? 0; const dealValue = avgDealValue ?? 0; const marginBase = avgMargin ?? 0; const d = discount[0] / 10 …
  ```
- **PriceElasticityChart({ data, optimalPrice, productName, }: Props)** — `src/components/pricing/PriceElasticityChart.tsx`
  ```
  // Sem fallback sintético: só exibimos pontos medidos no histórico real. const chartData = useMemo(() => data ?? [], [data]); const hasData = chartData.length > 0 && optimalPrice != null; const optPrice = optimalPrice ?? 0; return ( <Card className="glass border-white/5 overflow-hidden shadow-2xl bg-slate-950/40 relative"> {/* Background Decor */} <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(var(--primary),0.1),transparent)] pointer-events-none …
  ```
- **RankBadge({ rank, size = 'sm', className }: RankBadgeProps)** — `src/components/race/RankBadge.tsx`
  ```
  const dims = size === 'md' ? 'h-6 w-6 text-xs' : 'h-5 w-5 text-[10px]'; const iconSize = size === 'md' ? 14 : 11; const ariaLabel = RANK_LABELS[rank] ?? `Posição ${rank}`; if (rank === 1) { return ( <span aria-label={ariaLabel} className={cn( 'inline-flex items-center justify-center rounded-full bg-warning/20 ring-1 ring-warning/60', dims, className )} > <Crown className="text-warning" strokeWidth={2.5} width={iconSize} height={iconSize} /> </span> ); } if (rank === 2) { return ( <span aria-labe …
  ```
- **ScoreBreakdownCard({ entry, rules }: Props)** — `src/components/race/ScoreBreakdownCard.tsx`
  ```
  const breakdown = rules.map(r => { const raw = rawValueFor(entry, r.metric_code as MetricCode); const points = raw * Number(r.points_per_unit) * Number(r.weight); return { ...r, raw, points }; }); const totalPoints = breakdown.reduce((s, b) => s + b.points, 0) || 1; return ( <Card className="border-border/60"> <CardHeader className="pb-2"> <CardTitle className="text-section-title text-sm flex items-center gap-2"> Composição do score <TooltipProvider> <Tooltip> <TooltipTrigger asChild> <Info clas …
  ```
- **computeLapInfo(progress: number, totalLaps = 10)** — `src/components/race/raceTrackHelpers.ts`
  ```
  current: number; total: number
  ```
- **applyPreset(preset: 'volume' | 'qualidade' | 'equilibrado')** — `src/components/race/admin/ScoringRulesEditor.tsx`
  ```
  const p = PRESETS[roleType][preset]; setRules( ROLE_METRICS[roleType].map(mc => ({ metric_code: mc, weight: p[mc]?.weight ?? 1, points_per_unit: p[mc]?.points_per_unit ?? 1, label: METRIC_LABELS[mc].label, })) );
  ```
- **rankIcon(rank: number)** — `src/components/ranking/RankingPositionBanner.tsx`
  ```
  if (rank === 1) return <Crown className="h-5 w-5" />; if (rank <= 3) return <Trophy className="h-5 w-5" />; return <TrendingUp className="h-5 w-5" />;
  ```
- **rankAccent(rank: number)** — `src/components/ranking/RankingPositionBanner.tsx`
  ```
  if (rank === 1) return 'from-yellow-500/20 to-amber-600/10 border-yellow-500/40 text-yellow-500'; if (rank === 2) return 'from-purple-500/20 to-violet-600/10 border-purple-500/40 text-purple-400'; if (rank === 3) return 'from-amber-500/20 to-orange-600/10 border-amber-500/40 text-amber-500'; return 'from-primary/15 to-primary/5 border-primary/30 text-primary';
  ```
- **RankingPositionBanne(r)** — `src/components/ranking/RankingPositionBanner.tsx`
  ```
  className?: string
  ```
- **RankingTab({ ranking, leader, formatCurrency, }: RankingTabProps)** — `src/components/ranking/RankingTab.tsx`
  ```
  const top3 = ranking.slice(0, 3).map(p => ({ id: p.id, name: p.name, avatar_url: p.avatar_url, totalSales: p.totalSales, completedSales: p.dealsCount, goalProgress: leader ? (p.totalSales / leader.totalSales) * 100 : 100, })); const others = ranking.slice(3); return ( <div className="space-y-8"> {/* Cinematic Podium */} {ranking.length >= 3 && ( <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10" > <RankingPodium top3={top3} /> </motion.div> )} {/* Rankin …
  ```
- **generateEmbedToken()** — `src/components/reporting/embedHelpers.ts`
  ```
  const arr = new Uint8Array(24); crypto.getRandomValues(arr); return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  ```
- **computeStageDeltas(current: FunnelStageBasic[], previous: FunnelStageBasic[])** — `src/components/reporting/funnelReportHelpers.ts`
  ```
  const prevMap = new Map(previous.map(p => [p.stage, p])); return current.map(c => { const p = prevMap.get(c.stage); const prevCount = p?.count ?? 0; const countDelta = c.count - prevCount; const countDeltaPct = prevCount > 0 ? (countDelta / prevCount) * 100 : c.count > 0 ? 100 : 0; return { stage: c.stage, countDelta, countDeltaPct: Math.round(countDeltaPct * 10) / 10, valueDelta: c.value - (p?.value ?? 0), conversionDelta: Math.round((c.conversionRate - (p?.conversionRate ?? 0)) * 10) / 10, }; …
  ```
- **formatCurrency(value: number)** — `src/components/revenue-intelligence/calibration/calibrationHelpers.ts`
  ```
  return formatBRL(value);
  ```
- **formatCurrency(v: number)** — `src/components/revenue-intelligence/quota/quotaPredictorHelpers.ts`
  ```
  return formatBRL(v);
  ```
- **generateEmail()** — `src/components/sales/AIEmailDialog.tsx`
  ```
  setLoading(true); try { const { data, error } = await supabase.functions.invoke('ai-email-composer', { body: { mode: 'single', recipient_id: sale.client_id || sale.fullId, recipient_type: 'client', goal: 'follow_up', tone: 'consultivo', custom_instructions: instructions, }, }); if (error) throw error; setEmail(data); toast.success('E-mail personalizado gerado pela IA!'); } catch (err) { console.error(err); toast.error('Erro ao gerar e-mail com IA'); } finally { setLoading(false); }
  ```
- **generateInsights()** — `src/components/sdr/PerformanceCoaching.tsx`
  ```
  if (!metrics) return { strengths: [], improvements: [] }; const schedulingRate = metrics.current.schedulingRate; const leads = metrics.current.totalLeads; const qualified = metrics.current.qualifiedLeads; const active = metrics.current.activeProspects; const strengths = []; const improvements = []; // Dinamic insights based on real metrics if (schedulingRate > 20) { strengths.push( `Alta taxa de agendamento (${schedulingRate.toFixed(1)}%) - Acima da média do setor` ); } else if (schedulingRate > …
  ```
- **EligibleBonusesCard({ salespersonId }: Props)** — `src/components/vendedor/EligibleBonusesCard.tsx`
  ```
  const { data: bonuses = [], isLoading } = useEligibleBonuses(salespersonId); const { achieved, inProgress } = useMemo(() => { const a: EligibleBonus[] = []; const p: EligibleBonus[] = []; for (const b of bonuses) (b.achieved ? a : p).push(b); p.sort((x, y) => y.progress - x.progress); return { achieved: a, inProgress: p }; }, [bonuses]); useAutoAwardBonuses(achieved, salespersonId); if (isLoading) { return ( <Card className="p-4"> <div className="h-24 animate-pulse rounded-lg bg-muted/30" /> </C …
  ```
- **RankingGridItem({ id, name, avatar_url, rank, totalSales, goalAmount, goalProgress, completedSales, role, index, }: RankingGridItemProps)** — `src/components/vendedores/RankingGridItem.tsx`
  ```
  const decor = getRankDecor(rank); const remaining = Math.max(goalAmount - totalSales, 0); return ( <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.03, duration: 0.4 }} > <Link to={`/vendedor/${id}`} className={cn( 'flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 group relative overflow-hidden', decor.border, decor.bg )} > {/* Scanline Effect */} <div className …
  ```
- **RankingPodium({ top3 }: RankingPodiumProps)** — `src/components/vendedores/RankingPodium.tsx`
  ```
  if (top3.length < 3) return null; const maxSales = top3[0]?.totalSales || 1; return ( <div className="relative rounded-2xl border border-border/20 overflow-hidden bg-linear-to-b from-background via-background to-background/95 shadow-sm"> <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" /> <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.05),transparent_60%)]" /> <div className="absolute inse …
  ```
- **apply(id: string)** — `src/components/win-loss/ActionableInsightsPanel.tsx`
  ```
  const { error } = await supabase .from('win_loss_insights') .update({ applied_at: new Date().toISOString() }) .eq('id', id); if (error) { toast.error('Erro ao aplicar insight'); return; } toast.success('Insight marcado como aplicado'); qc.invalidateQueries({ queryKey: ['win-loss-insights'] });
  ```
- **scoreLabel(score: number)** — `src/components/win-loss/AtRiskDealsFromPatterns.tsx`
  ```
  
  ```
- **applyPreset(id: string)** — `src/components/win-loss/AtRiskSettingsPopover.tsx`
  ```
  if (!id) return; const preset = getPresetById(id as AtRiskPresetId); if (preset) onUpdate({ threshold: preset.threshold, limit: preset.limit });
  ```
- **parseConvertQuoteError(message: string)** — `src/hooks/quoteErrorMessages.ts`
  ```
  const match = /^\[([A-Z_]+)\]/.exec(message.trim()); const code = match?.[1] as ConvertQuoteErrorCode | undefined; if (code && code in CONVERT_QUOTE_ERROR_MESSAGES) return code; return 'UNKNOWN';
  ```
- **calc(sales: typeof currentSales)** — `src/hooks/useBenchmarkData.ts`
  ```
  const closed = sales.filter(s => isWonSaleStatus(s.status)); const revenue = closed.reduce((sum, s) => sum + (s.amount || 0), 0); const avgTicket = closed.length > 0 ? revenue / closed.length : 0; const convRate = sales.length > 0 ? (closed.length / sales.length) * 100 : 0; return { revenue, deals: closed.length, avgTicket, conversionRate: convRate };
  ```
- **calculateMetrics(sales: Array<{ status: string; amount: number | null }>)** — `src/hooks/useCloserMetrics.ts`
  ```
  const totalDeals = sales.length; const closedDeals = sales.filter(s => isWonSaleStatus(s.status)).length; const totalValue = sales.reduce((sum, s) => sum + Number(s.amount || 0), 0); const closedValue = sales .filter(s => isWonSaleStatus(s.status)) .reduce((sum, s) => sum + Number(s.amount || 0), 0); const conversionRate = totalDeals > 0 ? (closedDeals / totalDeals) * 100 : 0; const avgDealSize = closedDeals > 0 ? closedValue / closedDeals : 0; const inNegotiation = sales.filter(s => s.status == …
  ```
- **calcChange(curr: number, prev: number)** — `src/hooks/useCloserMetrics.ts`
  ```
  
  ```
- **calculateStageScore(status: string, stageProbabilities: Record<string, number>)** — `src/hooks/useDealProbability.ts`
  ```
  return (stageProbabilities[status] ?? 0.2) * 100;
  ```
- **calculateValueScore(value: number)** — `src/hooks/useDealProbability.ts`
  ```
  return Math.min(value / 1000, 100);
  ```
- **calculateTimeScore(createdAt: string)** — `src/hooks/useDealProbability.ts`
  ```
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24); return Math.max(100 - days * 2, 0);
  ```
- **calculateEngagementScore(activityCount: number)** — `src/hooks/useDealProbability.ts`
  ```
  return Math.min(activityCount * 5, 100);
  ```
- **useEligibleBonuses(salespersonId: string | undefined)** — `src/hooks/useEligibleBonuses.ts`
  ```
  return useQuery({ queryKey: ['eligible-bonuses', salespersonId], enabled: !!salespersonId, staleTime: 60_000, queryFn: async (): Promise<EligibleBonus[]> => { if (!salespersonId) return []; const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0); const [bonusesRes, salesRes, streakRes, allSalesRes] = await Promise.all([ supabase .from('commission_bonuses') .select('*') .eq('is_active', true) .or(`salesperson_id.eq.${salespersonId},salesperson_id.is.null`) .order('pr …
  ```
- **invalidateFlagQueries(queryClient: ReturnType<typeof useQueryClient>)** — `src/hooks/useFeatureFlagsAdmin.ts`
  ```
  FLAG_QUERY_KEYS.forEach(queryKey => queryClient.invalidateQueries({ queryKey: [...queryKey] }) );
  ```
- **invalidateRoutingQueries(queryClient: QueryClient)** — `src/hooks/useLeadRouting.ts`
  ```
  queryClient.invalidateQueries({ queryKey: ['clients'] }); queryClient.invalidateQueries({ queryKey: ['client_portfolio'] }); queryClient.invalidateQueries({ queryKey: ['unassigned_clients'] }); queryClient.invalidateQueries({ queryKey: ['routing_history'] }); queryClient.invalidateQueries({ queryKey: ['salesperson_performance'] });
  ```
- **calculateCompanySizeScore(numColaboradores?: number | null)** — `src/hooks/useLeadScoring.ts`
  ```
  if (!numColaboradores) return 5; if (numColaboradores > 500) return 20; if (numColaboradores > 100) return 15; if (numColaboradores > 20) return 10; return 5;
  ```
- **generateLocalSuggestions(salespersonId: string)** — `src/hooks/useNextBestAction.ts`
  ```
  const { data: sp } = await supabase .from('salespeople') .select('name') .eq('id', salespersonId) .maybeSingle(); const { data: sales } = await supabase .from('sales') .select('id, client_name, amount, status, created_at, updated_at') .eq('salesperson_id', salespersonId) .order('created_at', { ascending: false }) .limit(20); const { data: activities } = await supabase .from('activities') .select('id, activity_type, outcome, created_at') .eq('salesperson_id', salespersonId) .order('created_at', { …
  ```
- **canAccess(resource: string, action: 'read' | 'write' | 'delete')** — `src/hooks/usePermissions.ts`
  ```
  return hasPermission(`${resource}:${action}`);
  ```
- **usePriceHistory(productId?: string)** — `src/hooks/usePriceHistory.ts`
  ```
  return useQuery({ queryKey: ['price-history', productId], queryFn: async () => { let query = supabase .from('price_history') .select( ` *, products:product_id (name), suppliers:supplier_id (name) ` ) .order('recorded_at', { ascending: false }) .limit(100); if (productId) { query = query.eq('product_id', productId); } const { data, error } = await query; if (error) throw error; return data as (PriceHistory & { products: { name: string }; suppliers: { name: string }; })[]; }, });
  ```
- **usePriceAlerts()** — `src/hooks/usePriceHistory.ts`
  ```
  const queryClient = useQueryClient(); const { data: alerts = [], isLoading } = useQuery({ queryKey: ['price-alerts'], queryFn: async () => { const { data, error } = await supabase .from('price_alerts') .select( ` *, products:product_id (name), suppliers:supplier_id (name) ` ) .order('created_at', { ascending: false }) .limit(50); if (error) throw error; return data as PriceAlert[]; }, }); const unreadCount = alerts.filter(a => !a.is_read).length; const markAsRead = useMutation({ mutationFn: asyn …
  ```
- **shouldAlert(queryKey: string)** — `src/hooks/useQueryPerformance.ts`
  ```
  if (!alertConfig.enabled) return false; const lastAlerted = alertedQueries.get(queryKey); if (lastAlerted && Date.now() - lastAlerted < ALERT_COOLDOWN_MS) { return false; } return true;
  ```
- **calculateBackoffDelay(attemptNumber: number, baseDelay: number, maxDelay: number, multiplier: number, rand: ()** — `src/hooks/useRetryMutation.ts`
  ```
  number = Math.random
  ```
- **computeRunRateProjection(params: { mtdRevenue: number; goal: number; now?: Date; commissionRate?: number; })** — `src/hooks/useRunRateProjection.ts`
  ```
  const now = params.now ?? new Date(); const mtdRevenue = Math.max(0, params.mtdRevenue || 0); const goal = Math.max(0, params.goal || 0); const commissionRate = Math.max(0, params.commissionRate || 0); const monthStart = startOfMonth(now); const monthEnd = endOfMonth(now); const msPerDay = 24 * 60 * 60 * 1000; // Dias corridos: dia 1 do mês => daysElapsed = 1 (não 0), para paceDaily fazer sentido. const daysElapsed = Math.max( 1, Math.floor((now.getTime() - monthStart.getTime()) / msPerDay) + 1 …
  ```
- **calculateMetrics(sales: Array<{ id: string; status: string }>, tasks: Array<{ id: string }>)** — `src/hooks/useSDRMetrics.ts`
  ```
  const totalLeads = sales.length; const qualifiedLeads = sales.filter(s => ['qualified', 'proposal', 'negotiation', 'completed'].includes(s.status) ).length; const meetingsScheduled = tasks.length; const schedulingRate = totalLeads > 0 ? (meetingsScheduled / totalLeads) * 100 : 0; let coldLeads = 0, warmLeads = 0, hotLeads = 0; sales.forEach(sale => { const score = scoreMap.get(sale.id) || 0; if (score >= 75) hotLeads++; else if (score >= 50) warmLeads++; else coldLeads++; }); const activeProspec …
  ```
- **calcChange(curr: number, prev: number)** — `src/hooks/useSDRMetrics.ts`
  ```
  
  ```
- **apply()** — `src/hooks/useScrollRestoration.ts`
  ```
  window.scrollTo({ top: target, behavior: 'instant' }); lastApplied = window.scrollY;
  ```
- **calcProgress(current: number, goal: number)** — `src/hooks/activities/useActivityGoals.ts`
  ```
  
  ```
- **invalidate()** — `src/hooks/admin/useV4Callbacks.ts`
  ```
  qc.invalidateQueries({ queryKey: ['v4-dead-letters'] }); qc.invalidateQueries({ queryKey: ['v4-callback-kpis'] });
  ```
- **clientTotal(s)** — `src/hooks/bi/useBICloserTransformers.ts`
  ```
  value: number; count: number
  ```
- **invalidate(qc: ReturnType<typeof useQueryClient>)** — `src/hooks/cadences/useBulkQuoteCadenceMutations.ts`
  ```
  qc.invalidateQueries({ queryKey: ['quote-cadences'] }); qc.invalidateQueries({ queryKey: ['quote-cadence-stats'] }); qc.invalidateQueries({ queryKey: ['todays-cadence-tasks'] });
  ```
- **invalidateQuoteCadences(qc: ReturnType<typeof useQueryClient>)** — `src/hooks/cadences/useQuoteCadenceMutations.ts`
  ```
  qc.invalidateQueries({ queryKey: ['quote-cadences'] }); qc.invalidateQueries({ queryKey: ['quote-cadence-stats'] }); qc.invalidateQueries({ queryKey: ['cadence-tasks-by-enrollment'] }); qc.invalidateQueries({ queryKey: ['todays-cadence-tasks'] });
  ```
- **calculateChange(current: number, previous: number)** — `src/hooks/dashboard/useDashboardKPIs.ts`
  ```
  if (previous === 0) return current > 0 ? 100 : 0; return Number((((current - previous) / previous) * 100).toFixed(1));
  ```
- **rank(map: Map<string, { revenue: number; deals: number }>)** — `src/hooks/gamification/useFuturisticRanking.ts`
  ```
  const entries = Array.from(map.entries()).sort((a, b) => b[1].revenue - a[1].revenue); const positions = new Map<string, number>(); entries.forEach(([id], i) => positions.set(id, i + 1)); return positions;
  ```
- **calculateLevelFromXP(totalXP: number)** — `src/hooks/gamification/useSalespersonXP.ts`
  ```
  level: number; xpInLevel: number; xpToNext: number; progress: number;
  ```
- **applyLevelThresholds(value: unknown)** — `src/hooks/gamification/useSalespersonXP.ts`
  ```
  if (!Array.isArray(value)) return; const thresholds = value.filter( (v): v is number => typeof v === 'number' && Number.isFinite(v) ); if (thresholds.length > 0) { LEVEL_THRESHOLDS.splice(0, LEVEL_THRESHOLDS.length, ...thresholds); }
  ```
- **applyLevelInfo(value: unknown)** — `src/hooks/gamification/useSalespersonXP.ts`
  ```
  if (!isPlainObject(value)) return; const entries = value as Record< string, { title?: string; color?: string; emoji?: string } >; for (const [lvl, info] of Object.entries(entries)) { const n = Number(lvl); if (!Number.isInteger(n) || n < 1 || !info || typeof info !== 'object') continue; LEVEL_INFO[n] = { title: info.title ?? LEVEL_INFO[n]?.title ?? '', color: info.color ?? LEVEL_INFO[n]?.color ?? '', emoji: info.emoji ?? LEVEL_INFO[n]?.emoji ?? '', }; }
  ```
- **applyXpRewards(value: unknown)** — `src/hooks/gamification/useSalespersonXP.ts`
  ```
  if (!isPlainObject(value)) return; Object.assign(XP_REWARDS, value);
  ```
- **applyXpConfig(rows: AppConfigRow[])** — `src/hooks/gamification/useSalespersonXP.ts`
  ```
  for (const row of rows) { XP_CONFIG_APPLIERS[row.key as (typeof XP_CONFIG_KEYS)[number]]?.(row.value); }
  ```
- **computeStreak(saleDates: string[])** — `src/hooks/race/useRaceStreak.ts`
  ```
  if (saleDates.length === 0) return 0; const days = new Set(saleDates.map(toDayKey)); let streak = 0; const cursor = new Date(); // Allow grace: if no sale today, start from yesterday let startKey = getLocalISODate(cursor); if (!days.has(startKey)) { cursor.setDate(cursor.getDate() - 1); startKey = getLocalISODate(cursor); if (!days.has(startKey)) return 0; } while (days.has(getLocalISODate(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); } return streak;
  ```
- **calcDelta(current: number, previous: number)** — `src/hooks/reports/salesReportHelpers.ts`
  ```
  if (previous === 0) return current > 0 ? 100 : 0; return Math.round(((current - previous) / previous) * 100);
  ```
- **calcAvgTicket(sales: typeof currentSales)** — `src/hooks/sales/useSalesInsights.ts`
  ```
  if (sales.length === 0) return 0; return sales.reduce((sum, s) => sum + Number(s.amount), 0) / sales.length;
  ```
- **computeKpiDelta(current: WLKpis, previous: WLKpis)** — `src/hooks/win-loss/usePreviousPeriodKpis.ts`
  ```
  const pct = (cur: number, prev: number): number => { if (!prev) return cur ? 100 : 0; return ((cur - prev) / Math.abs(prev)) * 100; }; return { winRate: pct(current.winRate, previous.winRate), total: pct(current.total, previous.total), avgCycleWon: -pct(current.avgCycleWon, previous.avgCycleWon), // menor é melhor avgAmountWon: pct(current.avgAmountWon, previous.avgAmountWon), };
  ```
- **computeStats(rows: WLAnalysisRow[], label: string)** — `src/hooks/win-loss/useSeasonComparison.ts`
  ```
  const total = rows.length; const wins = rows.filter(r => r.outcome === 'won').length; const totalAmount = rows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0); const cycles = rows.map(r => Number(r.cycle_days) || 0).filter(v => v > 0); const avgCycle = cycles.length ? cycles.reduce((a, b) => a + b, 0) / cycles.length : 0; return { label, total, wins, winRate: total ? (wins / total) * 100 : 0, totalAmount, avgCycle, };
  ```
- **validateReplayIds(ids: readonly string[])** — `src/hooks/win-loss/validateReplayIds.ts`
  ```
  const deduped = Array.from(new Set(ids ?? [])); if (deduped.length === 0) { return { ok: false, message: 'Selecione ao menos 1 entrega para reenviar.' }; } if (deduped.length > MAX_REPLAY_IDS) { return { ok: false, message: `Máximo de ${MAX_REPLAY_IDS} por reenvio (selecionado: ${deduped.length}).`, }; } const invalid = deduped.filter(id => typeof id !== 'string' || !UUID_RE.test(id)); if (invalid.length > 0) { const sample = invalid .slice(0, 3) .map(id => (id.length > 8 ? `${id.slice(0, 8)}…` …
  ```
- **generateCurrentMonthReport()** — `src/lib/generateMonthlyReport.ts`
  ```
  const now = new Date(); const currentStart = startOfMonth(now); const currentEnd = endOfMonth(now); const prevStart = startOfMonth(subMonths(now, 1)); const prevEnd = endOfMonth(subMonths(now, 1)); const cs = format(currentStart, 'yyyy-MM-dd'); const ce = format(currentEnd, 'yyyy-MM-dd'); const ps = format(prevStart, 'yyyy-MM-dd'); const pe = format(prevEnd, 'yyyy-MM-dd'); const [curSales, prevSales, curMetrics, prevMetrics, topDeals, spData, goals] = await Promise.all([ supabase .from('sales') …
  ```
- **calcChange(c: number, p: number)** — `src/lib/generateMonthlyReport.ts`
  ```
  
  ```
- **computeMarkupPct(amount: number | null | undefined, totalCost: number | null | undefined)** — `src/lib/markupHelpers.ts`
  ```
  if (amount === null || amount === undefined) return null; if (totalCost === null || totalCost === undefined) return null; if (totalCost <= 0) return null; const raw = ((amount - totalCost) / totalCost) * 100; return Math.round(raw * 100) / 100;
  ```
- **computeMarginAmount(amount: number | null | undefined, totalCost: number | null | undefined)** — `src/lib/markupHelpers.ts`
  ```
  if (amount === null || amount === undefined) return null; if (totalCost === null || totalCost === undefined) return null; return Math.round((amount - totalCost) * 100) / 100;
  ```
- **applyMergeTags(template: string, ctx: MergeTagContext)** — `src/lib/mergeTags.ts`
  ```
  if (!template) return ''; return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key) => resolveTag(key, ctx) );
  ```
- **generateQuotePDF(quote: Quote, items: QuoteItem[])** — `src/lib/quotePdfExporter.ts`
  ```
  const { default: jsPDF } = await import('jspdf'); const { default: autoTable } = await import('jspdf-autotable'); const doc = new jsPDF(); const pageWidth = doc.internal.pageSize.getWidth(); // Header doc.setFontSize(18); doc.setFont('helvetica', 'bold'); doc.text(quote.quote_number ? `Orçamento ${quote.quote_number}` : quote.title, 14, 22); doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(100); doc.text( `Criado em ${format(new Date(quote.created_at), "dd 'de' MMMM 'de' …
  ```
- **generateSalesReport(data: ReportData)** — `src/lib/salesReportPdf.ts`
  ```
  try { const { default: jsPDF } = await import('jspdf'); const { default: autoTable } = await import('jspdf-autotable'); const doc = new jsPDF(); // Page 1 addHeader(doc, 'Relatório de Performance', data.period); let y = addKPISection(doc, data, 38); y = addTopDeals(doc, autoTable, data.topDeals, y + 4); // Check if team ranking fits, otherwise new page if (y > 220) { addFooter(doc, 1); doc.addPage(); addHeader(doc, 'Relatório de Performance', data.period); y = 38; } addTeamRanking(doc, autoTable …
  ```
- **generateDossierPDF(clientData: unknown, comparisonData: unknown, trendsData: unknown, seasonalityData: unknown, expertData: unknown, client)** — `src/lib/bi/dossierPdfGenerator.ts`
  ```
  // Casts locais tipados para os dados dinâmicos vindos do BI. const client = clientData as DossierClientData; const comparison = comparisonData as DossierComparisonItem[]; const seasonality = seasonalityData as DossierSeasonalityData; const expert = expertData as DossierExpertItem[]; void trendsData; const doc = new jsPDF(); const timestamp = format(new Date(), 'yyyy-MM-dd'); const clientSlug = (clientName || 'cliente').toLowerCase().replace(/\s+/g, '-'); const primaryColor = [76, 29, 149]; // D …
  ```
- **computeRevenueForecast(history: HistoricalPoint[], opts: EnsembleOptions = {})** — `src/lib/revenueForecast/forecastEngine.ts`
  ```
  const horizon = Math.max(1, Math.min(24, opts.horizon ?? 3)); const sims = Math.max(50, Math.min(5000, opts.simulations ?? 1000)); const rng = opts.rng ?? Math.random; const values = history.map(h => h.revenue); const hw = holtWintersForecast(values, horizon); const lin = linearForecast(values, horizon); const mc = monteCarloForecast(values, horizon, sims, rng); const mapeHw = mape(values, hw.fit); const mapeLin = mape(values, lin.fit); const mapeMc = mape(values, mc.fit); // Peso ∝ 1 / (MAPE + …
  ```
- **applyWhatIf(base: ForecastResult, inputs: WhatIfInputs)** — `src/lib/revenueForecast/forecastEngine.ts`
  ```
  const wr = 1 + (inputs.winRateDelta ?? 0); const at = 1 + (inputs.avgTicketDelta ?? 0); const vel = 1 + (inputs.velocityDelta ?? 0); const multiplier = Math.max(0, wr * at * vel); const forecast = base.forecast.map(f => ({ ...f, p10: f.p10 * multiplier, p50: f.p50 * multiplier, p90: f.p90 * multiplier, })); const horizonTotalP50 = forecast.reduce((s, f) => s + f.p50, 0); const horizonTotalP10 = forecast.reduce((s, f) => s + f.p10, 0); const horizonTotalP90 = forecast.reduce((s, f) => s + f.p90, …
  ```
- **calculateCheckDigit(digits: string, weights: number[])** — `src/lib/validators/brDocuments.ts`
  ```
  const sum = digits .split('') .reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0); const remainder = sum % 11; return remainder < 2 ? 0 : 11 - remainder;
  ```
- **calculateCnpjCheckDigit(values: number[], weights: number[])** — `src/lib/validators/brDocuments.ts`
  ```
  const sum = values.reduce((acc, v, i) => acc + v * Number(weights[i]), 0); const remainder = sum % 11; return remainder < 2 ? 0 : 11 - remainder;
  ```
- **TotalValueDisplay({ value }: { value: number })** — `src/pages/Clientes.tsx`
  ```
  const animated = useCountUp(value, { duration: 1200 }); return ( <span className="font-display font-black text-xl text-primary tracking-tighter"> {formatBRLCompact(animated)} </span> );
  ```
- **Comissoes()** — `src/pages/Comissoes.tsx`
  ```
  const { data: commissions = [], isLoading } = useMyCommissions(); const totals = useMemo(() => { const t = { pending: 0, approved: 0, paid: 0, all: 0 }; for (const c of commissions) { t.all += c.commission_amount; if (c.status === 'pending') t.pending += c.commission_amount; else if (c.status === 'approved') t.approved += c.commission_amount; else if (c.status === 'paid') t.paid += c.commission_amount; } return t; }, [commissions]); const renderList = (filter?: CommissionStatus) => { const list …
  ```
- **calculateStreak(dates: string[], grouped: Record<string, DailyChallengeWithProgress[]>)** — `src/pages/HistoricoDesafiosDiarios.tsx`
  ```
  let streak = 0; for (const date of dates) { const d = grouped[date]; if (d.every(c => c.progress?.completed_at) && d.length > 0) streak++; else break; } return streak;
  ```
- **ScoreSelector({ value, onChange, }: { value: number | null; onChange: (v: number)** — `src/pages/NPSDashboard.tsx`
  ```
  void;
  ```
- **formIsBaseline(f: Record<string, unknown>)** — `src/pages/Orcamentos.tsx`
  ```
  
  ```
- **PriceEvolution()** — `src/pages/PriceEvolution.tsx`
  ```
  const [selectedProduct, setSelectedProduct] = useState<string>(''); const { data: products, isLoading: _productsLoading } = useProducts(); const { data: history, isLoading: historyLoading } = usePriceHistory( selectedProduct || undefined ); const { alerts, unreadCount, markAsRead, markAllAsRead } = usePriceAlerts(); const chartData = React.useMemo(() => { if (!history?.length) return []; const grouped = new Map< string, { date: string; [supplier: string]: number | string } >(); history.forEach(h …
  ```
- **RankingCompetitivo()** — `src/pages/RankingCompetitivo.tsx`
  ```
  const { data: ranking, isLoading } = useCompetitiveRanking(); const { data: xpData } = useAllSalespeopleXP(); const { data: monthlyHistory } = useQuery({ queryKey: ['ranking-monthly-history'], queryFn: async () => { const monthRanges: { date: Date; start: Date; end: Date }[] = []; for (let i = 5; i >= 0; i--) { const date = subMonths(new Date(), i); monthRanges.push({ date, start: startOfMonth(date), end: endOfMonth(date), }); } const firstMonth = monthRanges[0]; const lastMonth = monthRanges[mo …
  ```
- **generateSecret()** — `src/pages/WebhooksPage.tsx`
  ```
  const arr = new Uint8Array(24); crypto.getRandomValues(arr); const secret = Array.from(arr) .map(b => b.toString(16).padStart(2, '0')) .join(''); setForm(p => ({ ...p, secret }));
  ```
- **apply(e: React.FormEvent)** — `src/pages/admin/WebhookTimelinePage.tsx`
  ```
  e.preventDefault(); const next = new URLSearchParams(); if (requestIdInput.trim()) next.set('requestId', requestIdInput.trim()); if (subIdInput.trim()) next.set('subscriptionId', subIdInput.trim()); setSearchParams(next, { replace: true });
  ```
- **computePipelineHealth(pipelineDeals: SaleRecord[], now: Date)** — `src/utils/bi-helpers.ts`
  ```
  const totalPipelineValue = pipelineDeals.reduce((sum, d) => sum + Number(d.amount), 0); const atRiskDeals = pipelineDeals.filter( d => differenceInDays(now, parseISO(d.created_at)) > 14 ).length; const avgDaysInPipeline = pipelineDeals.length > 0 ? pipelineDeals.reduce( (sum, d) => sum + differenceInDays(now, parseISO(d.created_at)), 0 ) / pipelineDeals.length : 0; const stages = ['pending', 'qualified', 'proposal', 'negotiation']; const dealsByStage = stages.map(stage => ({ stage, count: pipeli …
  ```
- **computeForecast(pipelineDeals: SaleRecord[], totalTeamRevenue: number, totalTeamGoal: number, daysRemaining: number, daysPassed: number,)** — `src/utils/bi-helpers.ts`
  ```
  const weightedForecast = pipelineDeals.reduce( (sum, d) => sum + Number(d.amount) * (stageProbabilities[d.status] ?? 0.1), 0 ); const dailyAvg = daysPassed > 0 ? totalTeamRevenue / daysPassed : 0; const projectedRevenue = totalTeamRevenue + dailyAvg * daysRemaining; const goalRatio = totalTeamGoal > 0 ? totalTeamRevenue / totalTeamGoal : 0; const confidenceLevel = Math.min(100, goalRatio * 100 + 20); return { weightedForecast, projectedRevenue, confidenceLevel };
  ```
- **computeRanking(rankingData: Array<{ salesperson_id?: string | null; amount: number }>, salespersonId: string, totalSalespeople: number)** — `src/utils/bi-helpers.ts`
  ```
  const salesBySp: Record<string, number> = {}; rankingData.forEach(sale => { if (sale.salesperson_id) { salesBySp[sale.salesperson_id] = (salesBySp[sale.salesperson_id] || 0) + Number(sale.amount); } }); const rankings = Object.entries(salesBySp) .sort((a, b) => b[1] - a[1]) .map(([id], index) => ({ id, rank: index + 1 })); return rankings.find(r => r.id === salespersonId)?.rank || totalSalespeople;
  ```
- **computeActivitiesByType(activities: ActivityRecord[])** — `src/utils/bi-helpers.ts`
  ```
  const counts: Record<string, number> = {}; activities.forEach(a => { counts[a.activity_type] = (counts[a.activity_type] || 0) + 1; }); return Object.entries(counts).map(([type, count]) => ({ type, count }));
  ```
- **computeStreak(achievementDates: string[], now: Date)** — `src/utils/bi-helpers.ts`
  ```
  currentStreak: number; bestStreak: number
  ```
- **computePipelineByStage(pipelineDeals: SaleRecord[], now: Date)** — `src/utils/bi-helpers.ts`
  ```
  const pipelineValue = pipelineDeals.reduce((sum, s) => sum + Number(s.amount), 0); const dealsByStage = ['pending', 'qualified', 'proposal', 'negotiation'].map(stage => ({ stage, count: pipelineDeals.filter(d => d.status === stage).length, value: pipelineDeals .filter(d => d.status === stage) .reduce((sum, d) => sum + Number(d.amount), 0), })); const avgDaysInPipeline = pipelineDeals.length > 0 ? pipelineDeals.reduce( (sum, d) => sum + differenceInDays(now, parseISO(d.created_at)), 0 ) / pipelin …
  ```
- **formatCurrencyForExport(value: number)** — `src/utils/csvExport.ts`
  ```
  return formatBRL(value, { decimals: 2 });
  ```
- **generateCSV(data: Record<string, unknown>[], columns: { key: string; label: string }[])** — `src/utils/reportDownload.ts`
  ```
  const header = columns.map(c => c.label).join(','); const rows = data.map(item => columns .map(c => { const value = item[c.key]; if (value === null || value === undefined) return ''; // Neutralize CSV formula injection (CWE-1236) then quote/escape. const safe = sanitizeCsvCell(String(value)); return `"${safe.replace(/"/g, '""')}"`; }) .join(',') ); return [header, ...rows].join('\n');
  ```
- **generateMalformedData(schema: z.ZodObject<z.ZodRawShape>)** — `supabase/functions/_shared/fuzz_test.ts`
  ```
  const base: Record<string, unknown> = {}; // Start empty const malformed: unknown[] = [ null, undefined, {}, 'not-an-object', 12345, true, { extra_unknown_field: 'should be stripped or ignored depending on zod config' }, ]; // For each key in schema, try missing it, wrong type, or empty const shape = schema.shape; for (const key in shape) { // Missing field const missing = { ...base }; delete missing[key]; malformed.push(missing); // Wrong types malformed.push({ ...base, [key]: 123 }); malformed …
  ```
- **validateNotificationBatch(rows: unknown[])** — `supabase/functions/_shared/notification-categories.ts`
  ```
  const validated: NotificationRow[] = []; const errors: string[] = []; for (let i = 0; i < rows.length; i++) { const parsed = notificationRowSchema.safeParse(rows[i]); if (!parsed.success) errors.push(describe(i, parsed.error)); else validated.push(parsed.data); } if (errors.length > 0) { throw new Error(`Invalid notification rows:\n${errors.join("\n")}`); } return validated;
  ```
- **defaultIsRetryable(err: unknown)** — `supabase/functions/_shared/retry.ts`
  ```
  if (err instanceof Response) { return err.status === 429 || err.status >= 500; } if (err && typeof err === "object" && "status" in err) { const s = Number((err as { status: unknown }).status); if (Number.isFinite(s)) return s === 429 || s >= 500; } // AbortError (timeout), TypeError (fetch failed), network — retry const name = (err as { name?: string })?.name ?? ""; if (name === "AbortError" || name === "TypeError") return true; return true; // conservador: retry por padrão em erros desconhecido …
  ```
- **computeDelay(attempt: number, base: number, max: number)** — `supabase/functions/_shared/retry.ts`
  ```
  const expo = Math.min(max, base * Math.pow(2, attempt)); // Full jitter (AWS Architecture Blog): uniform(0, expo) return Math.floor(Math.random() * expo);
  ```
- **computeDelayMs(config: ThrottleConfig, sentInWindow: number, windowStart: number, now: number,)** — `supabase/functions/_shared/send-pacer.ts`
  ```
  if (sentInWindow < config.maxPerMinute) { // Dentro da cota: só pausa a cada lote, e nunca mais que o resto da janela. if (sentInWindow === 0 || sentInWindow % config.batchSize !== 0) return 0; } const elapsed = now - windowStart; if (elapsed >= 60_000) return 0; const remaining = 60_000 - elapsed; if (sentInWindow >= config.maxPerMinute) return remaining; // Pausa proporcional entre lotes para distribuir os envios na janela. const perBatchMs = Math.ceil((60_000 * config.batchSize) / config.maxP …
  ```
- **validateString(value: unknown, field: string, opts?: { required?: boolean; maxLength?: number; minLength?: number })** — `supabase/functions/_shared/validation.ts`
  ```
  const { required = false, maxLength = 10000, minLength = 0 } = opts ?? {}; if (value === undefined || value === null || value === "") { return required ? { field, message: `${field} é obrigatório` } : null; } if (typeof value !== "string") { return { field, message: `${field} deve ser uma string` }; } if (value.length < minLength) { return { field, message: `${field} deve ter pelo menos ${minLength} caracteres` }; } if (value.length > maxLength) { return { field, message: `${field} excede o limi …
  ```
- **validateUUID(value: unknown, field: string, required = false)** — `supabase/functions/_shared/validation.ts`
  ```
  if (!value) return required ? { field, message: `${field} é obrigatório` } : null; if (typeof value !== "string") return { field, message: `${field} deve ser uma string` }; const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i; return uuidRegex.test(value) ? null : { field, message: `${field} não é um UUID válido` };
  ```
- **validateArray(value: unknown, field: string, opts?: { required?: boolean; maxLength?: number })** — `supabase/functions/_shared/validation.ts`
  ```
  const { required = false, maxLength = 100 } = opts ?? {}; if (!value) return required ? { field, message: `${field} é obrigatório` } : null; if (!Array.isArray(value)) return { field, message: `${field} deve ser um array` }; if (value.length > maxLength) return { field, message: `${field} excede o limite de ${maxLength} itens` }; return null;
  ```
- **validateNumber(value: unknown, field: string, opts?: { required?: boolean; min?: number; max?: number; integer?: boolean })** — `supabase/functions/_shared/validation.ts`
  ```
  const { required = false, min, max, integer = false } = opts ?? {}; if (value === undefined || value === null) { return required ? { field, message: `${field} é obrigatório` } : null; } if (typeof value !== "number" || !Number.isFinite(value)) { return { field, message: `${field} deve ser um número` }; } if (integer && !Number.isInteger(value)) { return { field, message: `${field} deve ser um número inteiro` }; } if (min !== undefined && value < min) { return { field, message: `${field} deve ser …
  ```
- **validateEnum(value: unknown, field: string, allowed: string[], required = false)** — `supabase/functions/_shared/validation.ts`
  ```
  if (!value) return required ? { field, message: `${field} é obrigatório` } : null; if (typeof value !== "string") return { field, message: `${field} deve ser uma string` }; return allowed.includes(value) ? null : { field, message: `${field} deve ser: ${allowed.join(", ")}` };
  ```
- **validationErrorResponse(errors: ValidationError[], corsHeaders: Record<string, string>)** — `supabase/functions/_shared/validation.ts`
  ```
  return new Response( JSON.stringify({ error: "Dados inválidos", details: errors }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } } );
  ```
- **canAdvanceMessageStatus(current: string | null | undefined, next: NormalizedMessageStatus,)** — `supabase/functions/_shared/webhook-integrity.ts`
  ```
  return current !== null && current !== undefined && PREVIOUS_STATUSES[next].includes(current as PersistedMessageStatus);
  ```
- **shouldMatchAndPauseEnrollment(eventType: InboundEventType,)** — `supabase/functions/_shared/webhook-integrity.ts`
  ```
  return eventType !== "other";
  ```
- **createValidationErrorResponse(error: string, details: WebhookValidationError[], contractVersion: string, corsHeaders: Record<string, string>)** — `supabase/functions/_shared/webhook-validator.ts`
  ```
  return new Response( JSON.stringify({ error, code: "VALIDATION_ERROR", details, contract_version: contractVersion, timestamp: new Date().toISOString() }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } } );
  ```
- **calcProgress(current: number, goal: number)** — `supabase/functions/activity-goal-alerts/index.ts`
  ```
  
  ```
- **skillScore(s)** — `supabase/functions/analyze-skill-gaps/index.ts`
  ```
  skill: string; score: number; gaps90: number; current_level: string;
  ```
- **aiScore(ctx: DealContext)** — `supabase/functions/calculate-deal-health/index.ts`
  ```
  score: number; factors: HealthFactor[]; recommended_actions: RecommendedAction[]; recommendation: string;
  ```
- **computeLevel(daysSince: number, expectedInterval: number | null)** — `supabase/functions/detect-client-churn-alerts/index.ts`
  ```
  if (!expectedInterval || expectedInterval <= 0) { if (daysSince >= ABSOLUTE_THRESHOLDS.critical) return 'critical'; if (daysSince >= ABSOLUTE_THRESHOLDS.high) return 'high'; if (daysSince >= ABSOLUTE_THRESHOLDS.medium) return 'medium'; return 'low'; } const ratio = daysSince / expectedInterval; if (ratio >= RATIO_THRESHOLDS.critical) return 'critical'; if (ratio >= RATIO_THRESHOLDS.high) return 'high'; if (ratio >= RATIO_THRESHOLDS.medium) return 'medium'; return 'low';
  ```
- **validateGroup(family: DealHistoryFamily, group: ScenarioGroup)** — `supabase/functions/detect-winloss-at-risk/history_catalog_test.ts`
  ```
  return group.cases.map(c => buildCaseReport(family, group, c));
  ```
- **stagnationScore(daysStagnant: number, avgLossCycleDays: number | null)** — `supabase/functions/detect-winloss-at-risk/scoring.ts`
  ```
  if (!avgLossCycleDays || avgLossCycleDays <= 0) { // Fallback: 30 days = 50 pts. return Math.min(50, Math.round((daysStagnant / 30) * 50)); } const ratio = daysStagnant / avgLossCycleDays; return Math.min(50, Math.round(ratio * 50));
  ```
- **computeDealRisk(deal: OpenDeal, patterns: LossPattern[], now: Date, threshold = DEAL_RISK_THRESHOLD,)** — `supabase/functions/detect-winloss-at-risk/scoring.ts`
  ```
  const dealAmount = Number(deal.amount) || 0; const days = daysBetween(deal.updated_at ?? deal.created_at, now); const lossPatterns = patterns.filter(p => p.outcome === "lost" || p.pattern_type === "loss_factor"); const stuckPatterns = patterns.filter(p => p.pattern_type === "stuck_stage"); const competitorPatterns = patterns.filter(p => p.pattern_type === "competitor"); // Pick the loss pattern whose avg_amount is closest to deal amount (best signal). let bestLoss: LossPattern | null = null; if …
  ```
- **computeAtRiskDeals(deals: OpenDeal[], patterns: LossPattern[], now: Date, opts: { threshold?: number; limit?: number } = {},)** — `supabase/functions/detect-winloss-at-risk/scoring.ts`
  ```
  const { threshold = DEAL_RISK_THRESHOLD, limit = 20 } = opts; const results: RiskResult[] = []; for (const d of deals) { const r = computeDealRisk(d, patterns, now, threshold); if (r) results.push(r); } results.sort((a, b) => b.risk_score - a.risk_score); return results.slice(0, limit);
  ```
- **computeStats(turns: Turn[])** — `supabase/functions/diarize-call-recording/index.ts`
  ```
  const sellerSec = turns .filter(t => t.speaker === 'seller') .reduce((a, t) => a + t.duration_estimate, 0); const clientSec = turns .filter(t => t.speaker === 'client') .reduce((a, t) => a + t.duration_estimate, 0); const total = sellerSec + clientSec || 1; let longestSeller = 0; for (const t of turns) { if (t.speaker === 'seller' && t.duration_estimate > longestSeller) { longestSeller = t.duration_estimate; } } let interruptions = 0; for (let i = 1; i < turns.length; i++) { const prev = turns[i …
  ```
- **generateOne(ctx: EmailContext, prompt: string, tone: string, language: string)** — `supabase/functions/email-composer-bulk/index.ts`
  ```
  const toneHint = TONE_HINT[tone] ?? TONE_HINT.consultivo; const sys = `Você é um copywriter B2B de elite. Gere um e-mail individual e personalizado em ${language}, com tom ${toneHint}. NUNCA use placeholders genéricos como {{nome}} — sempre escreva o nome real do destinatário. Sempre retorne JSON válido.`; const userPrompt = `Briefing do remetente:\n${prompt}\n\nContexto do destinatário:\n${JSON.stringify(ctx, null, 2)}\n\nTarefa: gere um e-mail único, com gancho específico baseado no contexto a …
  ```
- **computeUrgency(daysSince: number, avgInterval: number)** — `supabase/functions/generate-urgent-client-tasks/index.ts`
  ```
  urgency: Urgency; risk: number
  ```
- **score(s)** — `supabase/functions/lead-scoring/index.ts`
  ```
  score: number; factors: ScoringFactors; labels: Record<string, string>
  ```
- **generateInsights(patterns: Array<Record<string, unknown>>, totalRows: number,)** — `supabase/functions/mine-win-loss-patterns/index.ts`
  ```
  if (!LOVABLE_API_KEY || patterns.length === 0) return []; try { const top = patterns .slice() .sort((a, b) => (b.frequency as number) - (a.frequency as number)) .slice(0, 20); const resp = await fetchWithTimeout( "https://ai.gateway.lovable.dev/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json", }, body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: [ { role: "system", content: "Você é um analista de ve …
  ```
- **generateEmailHTML(data: NewDeviceAlertRequest)** — `supabase/functions/new-device-alert/index.ts`
  ```
  `
  ```
- **generateAdvancedActions(supabase: SupabaseClient, params: { forecastId: string; salespersonName: string; quota: number; p50: number; prob: numbe)** — `supabase/functions/predict-quota-attainment/index.ts`
  ```
  const apiKey = Deno.env.get("LOVABLE_API_KEY"); if (!apiKey) return; const gap = Math.max(0, params.quota - params.p50); const sys = "Você é um head of sales experiente. Gere de 1 a 3 ações táticas e específicas para o vendedor atingir a meta. Responda em pt-BR."; const usr = `Vendedor: ${params.salespersonName}\nMeta: R$ ${params.quota.toFixed(0)}\nProjeção P50: R$ ${params.p50.toFixed(0)}\nGap: R$ ${gap.toFixed(0)}\nProbabilidade: ${(params.prob * 100).toFixed(0)}%\nRisco: ${params.risk}`; try …
  ```
- **generateNarrative(score: number, baseline: number, topDrivers: Driver[], recommendations: Recommendation[])** — `supabase/functions/predictive-scoring-explain/index.ts`
  ```
  const apiKey = Deno.env.get('LOVABLE_API_KEY'); const fallback = `Score ${score} (${score >= baseline ? '+' : ''}${(score - baseline).toFixed(0)} pts vs média da carteira de ${baseline.toFixed(0)}). Principal alavanca: ${topDrivers[0]?.label ?? 'n/d'}. Próximo passo: ${recommendations[0]?.action ?? 'manter cadência'}.`; if (!apiKey) return fallback; try { const prompt = `Score do deal: ${score}/100. Baseline da carteira: ${baseline.toFixed(0)}. Top drivers: ${topDrivers.map(d => `${d.label} (${d …
  ```
- **scoreFor(rules: ScoringRule[] | null, m: ScoreMetrics)** — `supabase/functions/process-race-event/index.ts`
  ```
  
  ```
- **validateToken(token: string)** — `supabase/functions/ranking-api/index.ts`
  ```
  const supabase = createClient( Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! ); const { data, error } = await supabase.rpc("validate_api_token", { p_token: token }); if (error || !data || data.length === 0) return null; return data[0];
  ```
- **generateEmbedding(text: string, apiKey: string)** — `supabase/functions/semantic-index-entity/index.ts`
  ```
  const res = await fetchWithTimeout(LOVABLE_AI_EMBEDDINGS_URL, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'google/text-embedding-004', input: text.slice(0, 8000), }), }); if (!res.ok) throw new Error(`Embedding error ${res.status}: ${await res.text()}`); const json = await res.json(); const emb = json?.data?.[0]?.embedding; if (!Array.isArray(emb)) throw new Error('Invalid embedding response'); return emb;
  ```
- **generateEmbedding(text: string, apiKey: string)** — `supabase/functions/semantic-search-universal/index.ts`
  ```
  const res = await fetchWithTimeout("https://ai.gateway.lovable.dev/v1/embeddings", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "google/text-embedding-004", input: text.slice(0, 4000) }), }); if (!res.ok) { if (res.status === 429) throw new Error("RATE_LIMIT"); if (res.status === 402) throw new Error("CREDITS_EXHAUSTED"); throw new Error(`Embedding error ${res.status}`); } const json = await res.json(); return …
  ```
- **generateAnswer(query: string, results: Array<{ entity_type: string; content: string }>, apiKey: string)** — `supabase/functions/semantic-search-universal/index.ts`
  ```
  if (!results.length) return null; const ctx = results.slice(0, 5).map((r, i) => `[${i + 1}] (${r.entity_type}) ${r.content.slice(0, 400)}`).join("\n"); try { const res = await fetchWithTimeout("https://ai.gateway.lovable.dev/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: [ { role: "system", content: "Você é um assistente de CRM. Responda em português, ci …
  ```
- **generateAlerts(supabase: SupabaseClient, pref: NotificationPreference)** — `supabase/functions/send-alert-notifications/index.ts`
  ```
  const alerts: Alert[] = []; const now = new Date(); // Check for stagnant deals if (pref.notify_stagnant_deals) { const { data: pendingDeals } = await supabase .from('sales') .select('updated_at, client_name, product_name, amount') .in('status', [...OPEN_SALE_STATUSES]) .limit(500); pendingDeals?.forEach( (deal: { updated_at: string; client_name: string; product_name: string; amount: number | string; }) => { const updatedAt = new Date(deal.updated_at); const daysSinceUpdate = differenceInDays(no …
  ```

### G.4 Percentuais e multiplicadores no código

| Trecho | Arquivo |
|---|---|
| `// Medido em 2026-09-28 com vitest v5 (all: false): lines 3.59%, branches 3.07%,` | `vitest.config.ts` |
| `// functions 2.65%, statements 3.53%. Vitest v5 instrumenta branches de forma` | `vitest.config.ts` |
| `// ~99% sobre <1% do código e circulava como se fosse a cobertura do sistema.` | `vitest.config.ts` |
| `85%` | `src/components/activities/AchievementBadgeDisplay.tsx` |
| `transition={{ delay: index * 0.05 }}` | `src/components/activities/ActivityLeaderboard.tsx` |
| `fillOpacity={1 - index * 0.15}` | `src/components/activities/ActivityStatsCharts.tsx` |
| `transition={{ delay: index * 0.1 }}` | `src/components/analytics/ABCNeuralInsights.tsx` |
| `transition={{ delay: index * 0.1 }}` | `src/components/analytics/AIPerformanceInsights.tsx` |
| `delay: weekIndex * 0.005 + dayIndex * 0.01,` | `src/components/analytics/ActivityHeatmap.tsx` |
| `transition={{ delay: idx * 0.05 }}` | `src/components/analytics/BenchmarkPanel.tsx` |
| `transition={{ delay: i * 0.03 }}` | `src/components/analytics/ChurnPrediction.tsx` |
| `transition={{ delay: index * 0.1 }}` | `src/components/analytics/ChurnPredictionPanel.tsx` |
| `transition={{ delay: idx * 0.05 }}` | `src/components/analytics/ClientHealthPanel.tsx` |
| `* 0% → muted, 100% → primary.` | `src/components/analytics/CohortRetentionHeatmap.tsx` |
| `transition={{ delay: index * 0.05 }}` | `src/components/analytics/CompetencyRadar.tsx` |
| `const thresholdHigh = maxLTV * 0.6;` | `src/components/analytics/LTVBySegment.tsx` |
| `const thresholdMed = maxLTV * 0.25;` | `src/components/analytics/LTVBySegment.tsx` |
| `// Combined forecast (60% linear + 40% pipeline)` | `src/components/analytics/RevenueForecast.tsx` |
| `Math.max(20, (daysPassed / totalDays) * 50 + Math.min(50, paceScore * 0.5))` | `src/components/analytics/RevenueForecast.tsx` |
| `linearProjection * 0.6 + (currentRevenue + weightedPipeline) * 0.4;` | `src/components/analytics/RevenueForecast.tsx` |
| `transition={{ delay: index * 0.05 }}` | `src/components/analytics/WeeklyPerformanceComparison.tsx` |
| `} else if (daysInStage >= threshold * 0.7) {` | `src/components/assistant/dealRiskCalculator.ts` |
| `transition={{ delay: 0.5 + i * 0.1 }}` | `src/components/auth/AuthBrandPanel.tsx` |
| `transition={{ delay: 0.8 + i * 0.1, type: 'spring' }}` | `src/components/auth/AuthBrandPanel.tsx` |
| `transition={{ delay: index * 0.05 }}` | `src/components/bi/BIClientList.tsx` |
| `<p>Nenhum vendedor atingiu 100% da meta</p>` | `src/components/bi/BIGestorTeamSection.tsx` |
| `transition={{ duration: 0.4, delay: delay * 0.1 }}` | `src/components/bi/BIMetricCard.tsx` |
| `transition={{ delay: idx * 0.04 }}` | `src/components/bi/BISalesInsights.tsx` |
| `transition={{ delay: idx * 0.04 }}` | `src/components/bi/BITopClientsSection.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/bi/ClientOverview360.tsx` |
| `transition={{ duration: 1, delay: i * 0.1 }}` | `src/components/bi/ClientVsIndustryComparison.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/bi/EmpiricalRecommendations.tsx` |
| `transition={{ delay: idx * 0.04 }}` | `src/components/bi/TopSellersRankList.tsx` |
| `transition={{ delay: idx * 0.03 }}` | `src/components/cadences/quote/QuoteCadenceDetailDrawer.tsx` |
| `transition={{ delay: 0.5 + i * 0.1 }}` | `src/components/clients/Client360AffinityCard.tsx` |
| `85% Confiança` | `src/components/clients/Client360HealthNbaSection.tsx` |
| `92% Probabilidade` | `src/components/clients/Client360PredictiveCards.tsx` |
| `transition={{ delay: idx * 0.05 }}` | `src/components/clients/OrdersTimeline.tsx` |
| `transition={{ duration: 1.5, ease: 'easeOut', delay: index * 0.1 }}` | `src/components/closer/CloserPipeline.tsx` |
| `transition={{ duration: 0.25, delay: index * 0.04 }}` | `src/components/coaching/impact/ImpactSessionCard.tsx` |
| `transition={{ duration: 0.2, delay: i * 0.03 }}` | `src/components/coaching/impact/SkillImpactHeatmap.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/components/coaching/sessions/CoachingSessionPlanner.tsx` |
| `transition={{ delay: index * 0.05 }}` | `src/components/collaboration/TeamActivityFeed.tsx` |
| `variam mais de 5%.` | `src/components/comparador/PriceAlertsPanel.tsx` |
| `transition={{ delay: (di * 12 + hi) * 0.005 }}` | `src/components/competitive/ActivityHeatmap.tsx` |
| `transition={{ delay: idx * 0.05, duration: 0.35 }}` | `src/components/competitive/ArenaCategoryHub.tsx` |
| `transition={{ delay: Math.min(i * 0.03, 0.4) }}` | `src/components/competitive/BadgesGallery.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/competitive/BattleCardItem.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/competitive/Benchmarking.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/competitive/CompetitiveTVDashboard.tsx` |
| `transition={{ delay: i * 0.15 }}` | `src/components/competitive/CompetitiveTVDashboard.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/competitive/DailyMissions.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/components/competitive/EnhancedTVMode.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/competitive/EnhancedTVMode.tsx` |
| `transition={{ delay: index * 0.1 }}` | `src/components/competitive/FeatureComparison.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/components/competitive/GamifiedProfile.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/competitive/HeadToHead.tsx` |
| `transition={{ delay: idx * 0.05 }}` | `src/components/competitive/ImprovementPlan.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/components/competitive/LeagueSystem.tsx` |
| `delay: i * 0.1 + 0.3,` | `src/components/competitive/LiveScoreboard.tsx` |
| `transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}` | `src/components/competitive/LiveScoreboard.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/components/competitive/PerformanceBets.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/competitive/ProgressiveGoals.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/components/competitive/RankNotifications.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/competitive/SeasonAndPowerUps.tsx` |
| `transition={{ delay: i * 0.08 }}` | `src/components/competitive/StreakTracker.tsx` |
| `const isContested = challenger && challenger.revenue > currentOwner.revenue * 0.7;` | `src/components/competitive/TerritoryWars.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/components/competitive/TerritoryWars.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/competitive/TerritoryWars.tsx` |
| `transition={{ delay: index * 0.05 }}` | `src/components/competitive/VictoryFeed.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/components/competitive/WallOfFame.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/competitive/WeeklyRanking.tsx` |
| `Prob. Sucesso: 88%` | `src/components/conversational/ConversationalIntelligenceHub.tsx` |
| `transition={{ delay: idx * 0.1 }}` | `src/components/conversational/LiveIntelligenceFeed.tsx` |
| `ofereça o plano trimestral antecipado com 12% off.` | `src/components/conversational/NeuralSentimentTimeline.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/conversational/NeuralSentimentTimeline.tsx` |
| `duration: 0.5 + Math.random() * 0.5,` | `src/components/conversational/NeuralSoundwave.tsx` |
| `Ideal: 40–55%` | `src/components/conversational/TalkRatioBar.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/components/customer-success/CustomerSuccessHub.tsx` |
| `transition={{ duration: 1, delay: i * 0.1 }}` | `src/components/customer-success/CustomerSuccessHub.tsx` |
| `transition={{ duration: 0.3, delay: idx * 0.1 }}` | `src/components/dashboard/AlertsPanel.tsx` |
| `transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}` | `src/components/dashboard/AlertsPanel.tsx` |
| `100%` | `src/components/dashboard/DailyMissionsPanel.tsx` |
| `delay: 0.15 + state.staggerIndex * 0.08,` | `src/components/dashboard/DashboardEmptyState.tsx` |
| `delay: state.staggerIndex * 0.08,` | `src/components/dashboard/DashboardEmptyState.tsx` |
| `delay: state.staggerIndex * 0.5,` | `src/components/dashboard/DashboardEmptyState.tsx` |
| `delay: 0.2 + index * 0.04,` | `src/components/dashboard/FuturisticRanking.tsx` |
| `transition={{ duration: 0.4, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}` | `src/components/dashboard/FuturisticRanking.tsx` |
| `transition={{ duration: 1, delay: idx * 0.1 }}` | `src/components/dashboard/FuturisticSpeedometerDashboard.tsx` |
| `transition={{ delay: index * 0.1 }}` | `src/components/dashboard/KPIGrid.tsx` |
| `transition={{ delay: index * 0.1 }}` | `src/components/dashboard/MiniLeaderboard.tsx` |
| `transition={{ delay: idx * 0.1 }}` | `src/components/dashboard/RecentDeals.tsx` |
| `const confidence = Math.min(95, Math.max(30, 40 + totalDeals * 0.5));` | `src/components/dashboard/SalesForecast.tsx` |
| `forecast: Math.round(weightedTotal + closedTotal * 0.15),` | `src/components/dashboard/SalesForecast.tsx` |
| `94% CONFIDENCE` | `src/components/dashboard/StatCard.tsx` |
| `delay: 0.3 + index * 0.1,` | `src/components/dashboard/TopProducts.tsx` |
| `delay: index * 0.5,` | `src/components/dashboard/TopProducts.tsx` |
| `transition={{ delay: index * 0.1 }}` | `src/components/dashboard/TopProducts.tsx` |
| `transition={{ delay: index * 0.1 }}` | `src/components/dashboard/modules/IntelligenceAlerts.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/dashboard/modules/IntelligenceZones.tsx` |
| `transition={{ duration: 1, delay: i * 0.1 }}` | `src/components/dashboard/modules/IntelligenceZones.tsx` |
| `transition={{ delay: index * 0.05 }}` | `src/components/dashboard/widgets/MicroGoalsWidget.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/deal-intelligence/NextBestActionPanel.tsx` |
| `delay: i * 0.1,` | `src/components/deal-intelligence/committee/RelationshipHealthGraph.tsx` |
| `transition={{ delay: 0.2 + i * 0.1 }}` | `src/components/deal-intelligence/committee/RelationshipHealthGraph.tsx` |
| `transition={{ duration: 0.3, delay: i * 0.05 }}` | `src/components/deal-intelligence/health/HealthKpiCards.tsx` |
| `speedY: -(Math.random() * 0.5 + 0.2),` | `src/components/effects/CyberArenaBackground.tsx` |
| `88%` | `src/components/enablement/SalesEnablementHub.tsx` |
| `transition={{ delay: index * 0.03 }}` | `src/components/follow-up/FollowUpLeadCard.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/components/follow-up/FollowUpStatsGrid.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/forecast/ForecastNarrativeCard.tsx` |
| `transition={{ duration: 0.5, delay: index * 0.1 }}` | `src/components/forecast/ScenarioCard.tsx` |
| `transition={{ delay: index * 0.08 }}` | `src/components/gamification/DailyChallengesCard.tsx` |
| `transition={{ delay: idx * 0.05 }}` | `src/components/gamification/LeagueCard.tsx` |
| `delay: i * 0.12,` | `src/components/gamification/StreakWidget.tsx` |
| `delay: 0.1 + i * 0.05,` | `src/components/gamification/XPToast.tsx` |
| `transition={{ delay: index * 0.05 }}` | `src/components/goals/CommissionCalculator.tsx` |
| `// Calculate trend: if projection is 10% higher than goal, it's strong` | `src/components/goals/SalespersonGoalCard.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/intelligence/ActivityPulse.tsx` |
| `12.4% drop in SQL quality` | `src/components/intelligence/ScenarioSimulator.tsx` |
| `CONFIDENCE: 84%` | `src/components/intelligence/ScenarioSimulator.tsx` |
| `Increasing conversion by 20%+ without scaling SDR capacity will lead to a{' '}` | `src/components/intelligence/ScenarioSimulator.tsx` |
| `MAX: 100%` | `src/components/intelligence/ScenarioSimulator.tsx` |
| `setConversion([Math.round(conversion[0] * 0.9)]); // volume reduces quality slightly` | `src/components/intelligence/ScenarioSimulator.tsx` |
| `setPipeline([Math.round(pipeline[0] * 0.95)]);` | `src/components/intelligence/ScenarioSimulator.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/intelligence/StrategicRecommendations.tsx` |
| `Confidence: 98.4%` | `src/components/lead-scoring/LeadNeuralDossier.tsx` |
| `Projected Lift: +14%` | `src/components/lead-scoring/LeadNeuralDossier.tsx` |
| `border-radius: 50%;` | `src/components/map/ClientsMap.tsx` |
| `delay: index * 0.03,` | `src/components/navigation/Breadcrumbs.tsx` |
| `transition={{ delay: index * 0.04 }}` | `src/components/order-tracking/OrderTrackingCard.tsx` |
| `transition={{ delay: idx * 0.07 }}` | `src/components/orders/OrderStatusTimeline.tsx` |
| `(renderTime * 0.9 + frameDuration * 0.1).toFixed(2)` | `src/components/performance/PerformanceMonitor.tsx` |
| `92.4%` | `src/components/pipeline/PipelineBoard.tsx` |
| `transition={{ delay: i * 0.03 }}` | `src/components/pipeline-pulse/CriticalAlertsFeed.tsx` |
| `transition={{ delay: index * 0.05, duration: 0.3 }}` | `src/components/pipeline-pulse/PulseKpiGrid.tsx` |
| `transition={{ delay: 0.1 + idx * 0.08, duration: 0.35 }}` | `src/components/playbooks/PlaybookEmptyState.tsx` |
| `transition={{ delay: idx * 0.05 }}` | `src/components/playbooks/PlaybooksManager.tsx` |
| `{(32 + conversionBoost[0] * 0.5).toFixed(1)}%` | `src/components/predictive/PredictiveScenarioPlanner.tsx` |
| `/** Win-rate medido na faixa de ~0% de desconto (0-1). */` | `src/components/pricing/DiscountOptimizer.tsx` |
| `// (varre 0-40% em passos de 1 ponto percentual).` | `src/components/pricing/DiscountOptimizer.tsx` |
| `x={optPrice * 0.9}` | `src/components/pricing/PriceElasticityChart.tsx` |
| `competitorLost={data.leakage_segments?.competitor ?? k.revenue_lost * 0.3}` | `src/components/pricing/PricingIntelligenceHub.tsx` |
| `discountLost={data.leakage_segments?.discount ?? k.revenue_lost * 0.55}` | `src/components/pricing/PricingIntelligenceHub.tsx` |
| `marginErosion={data.leakage_segments?.erosion ?? k.revenue_lost * 0.15}` | `src/components/pricing/PricingIntelligenceHub.tsx` |
| `delay: i * 0.2,` | `src/components/pricing/RevenueLeakageCard.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/pricing/RevenueLeakageCard.tsx` |
| `+12.4% no ticket médio` | `src/components/purchase-intelligence/ClientPurchaseHistory.tsx` |
| `transition={{ delay: 0.2 + i * 0.1 }}` | `src/components/purchase-intelligence/EmptyStateGuide.tsx` |
| `if (cell.totalRevenue < avgMonthly * 0.3 && avgMonthly > 1000) cell.anomaly = 'low';` | `src/components/purchase-intelligence/PurchaseHeatmapGrid.tsx` |
| `transition={{ delay: idx * 0.02 }}` | `src/components/purchase-intelligence/PurchaseHeatmapGrid.tsx` |
| `+4.2% mês` | `src/components/purchase-intelligence/PurchaseIntelligenceHub.tsx` |
| `{cell && cell.revenue > matrix.max * 0.7 && (` | `src/components/purchase-intelligence/SeasonalityHeatmap.tsx` |
| `const alpha = 0.15 + ratio * 0.8;` | `src/components/purchase-intelligence/purchaseIntelligenceHelpers.ts` |
| `const flameLen = w * 0.55;` | `src/components/race/CarLiveryOverlay.tsx` |
| `const gap = w * 0.18;` | `src/components/race/CarLiveryOverlay.tsx` |
| `const py = y + (i % 2 === 0 ? h * 0.15 : h * 0.45);` | `src/components/race/CarLiveryOverlay.tsx` |
| `const py = y + h - (i % 2 === 0 ? h * 0.15 : h * 0.45);` | `src/components/race/CarLiveryOverlay.tsx` |
| `points.push(`${x + flameLen},${y + h * 0.5}`);` | `src/components/race/CarLiveryOverlay.tsx` |
| `points={`${x},${y + h * 0.3} ${x + flameLen * 0.6},${y + h * 0.4} ${x + flameLen * 0.4},${y + h * 0.5} ${x + flameLen * 0.6},${y + h * 0.6} ${x},${y + h * 0.7}` …` | `src/components/race/CarLiveryOverlay.tsx` |
| `x={x - w * 0.5 + i * period}` | `src/components/race/CarLiveryOverlay.tsx` |
| `y={y - h * 0.5}` | `src/components/race/CarLiveryOverlay.tsx` |
| `transition={{ delay: Math.min(i * 0.04, 0.4) }}` | `src/components/race/CareerTimeline.tsx` |
| `delay={prefersReduced ? 0 : Math.min(i * 0.05, 0.4)}` | `src/components/race/ChampionsHistoryPanel.tsx` |
| `animationDelay: `${idx * 0.4}s`,` | `src/components/race/DRSZoneOverlay.tsx` |
| `const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;` | `src/components/race/Fireworks.tsx` |
| `* Conversão arbitrária consistente com SpeedHUD: 1% de progresso ≈ 0.45s` | `src/components/race/LeaderGapIndicator.tsx` |
| `/** Limite máximo (em fração) para exibir o badge — padrão 5%. */` | `src/components/race/LeaderGapIndicator.tsx` |
| `delay: i * 0.12,` | `src/components/race/PitLane.tsx` |
| `const smooth = prev.smoothDelta * 0.85 + delta * 0.15;` | `src/components/race/RaceArena.tsx` |
| `setLeaderSpeed(s => (s > 1 ? s * 0.92 : 0));` | `src/components/race/RaceArena.tsx` |
| `setLeaderSpeed(s => s * 0.7 + Math.min(360, kmh) * 0.3);` | `src/components/race/RaceArena.tsx` |
| `const angle = (i - 2) * 0.35;` | `src/components/race/RaceCar.tsx` |
| `const barW = bodyW * 0.7;` | `src/components/race/RaceCar.tsx` |
| `delay: i * 0.04,` | `src/components/race/RaceCar.tsx` |
| `delay: i * 0.05,` | `src/components/race/RaceCar.tsx` |
| `delay: i * 0.12,` | `src/components/race/RaceCar.tsx` |
| `delay: i * 0.25,` | `src/components/race/RaceCar.tsx` |
| `duration: 0.5 + i * 0.05,` | `src/components/race/RaceCar.tsx` |
| `r={2.2 + (i % 2) * 0.6}` | `src/components/race/RaceCar.tsx` |
| `rx={bodyW * 0.55}` | `src/components/race/RaceCar.tsx` |
| `rx={bodyW * 0.75}` | `src/components/race/RaceCar.tsx` |
| `transition={{ duration: 0.35, repeat: Infinity, delay: i * 0.08 }}` | `src/components/race/RaceCar.tsx` |
| `/** Quando true, mostra fogos de artifício (ex: 100% da season). */` | `src/components/race/RaceEasterEggs.tsx` |
| `delay: i * 0.6,` | `src/components/race/RaceEmptyState.tsx` |
| `strokeDasharray={`${4 * (1 - t * 0.5)} ${3 * (1 - t * 0.5)}`}` | `src/components/race/RaceEmptyState.tsx` |
| `transition={{ delay: idx * 0.05 }}` | `src/components/race/RaceHighlightsTimeline.tsx` |
| `* Some quando 100% completo OU usuário dispensa explicitamente.` | `src/components/race/RaceOnboardingChecklist.tsx` |
| `* cena ampliada (800x1333) para ocupar ~75% da área visível, com grama nas bordas.` | `src/components/race/RaceTrack.tsx` |
| `r={3 + i * 0.5}` | `src/components/race/RaceTrackEffects.tsx` |
| `transition={{ duration: 1.1, ease: 'easeOut', delay: i * 0.04 }}` | `src/components/race/RaceTrackEffects.tsx` |
| `return Number(entry.total_sales ?? 0) * 0.3;` | `src/components/race/ScoreBreakdownCard.tsx` |
| `/** Distância máxima em progresso para mostrar slipstream — padrão 3%. */` | `src/components/race/SlipstreamLines.tsx` |
| `animationDelay: `${i * 0.08 + 0.04}s`,` | `src/components/race/SlipstreamLines.tsx` |
| `animationDelay: `${i * 0.08}s`,` | `src/components/race/SlipstreamLines.tsx` |
| `transition={{ delay: i * 0.04 }}` | `src/components/race/TeamLeaderboard.tsx` |
| `delay: Math.random() * 0.5,` | `src/components/race/VictoryLapOverlay.tsx` |
| `// DRS zone vai começar em breve se está dentro de ~5% antes do início de uma DRS_ZONE` | `src/components/race/raceTrackHelpers.ts` |
| `// para reduzir visualmente a pista em ~25% e dar espaço a paddock/pit lane externos.` | `src/components/race/raceTrackHelpers.ts` |
| `const speed = 0.25 + Math.random() * 0.55;` | `src/components/race/track/TrackDustParticles.tsx` |
| `life: LIFE_MS * (0.7 + Math.random() * 0.6),` | `src/components/race/track/TrackDustParticles.tsx` |
| `* para a pista (600x1000 centralizada) ocupar ~75% e ter grama ao redor.` | `src/components/race/track/TrackGrass.tsx` |
| `ry={r * 0.55}` | `src/components/race/track/TrackGrass.tsx` |
| `ry={r * 0.6}` | `src/components/race/track/TrackGrass.tsx` |
| `// ~25% dos torcedores levantam plaquinhas (sign)` | `src/components/race/track/TrackScenery.tsx` |
| `animation: `race-bird-flap ${0.35 + i * 0.05}s ease-in-out infinite`,` | `src/components/race/track/TrackScenery.tsx` |
| `animationDelay: `${i * 0.18}s`,` | `src/components/race/track/TrackScenery.tsx` |
| `y1={doorW * 0.33}` | `src/components/race/track/TrackScenery.tsx` |
| `y1={doorW * 0.66}` | `src/components/race/track/TrackScenery.tsx` |
| `y2={doorW * 0.33}` | `src/components/race/track/TrackScenery.tsx` |
| `y2={doorW * 0.66}` | `src/components/race/track/TrackScenery.tsx` |
| `transition={{ delay: idx * 0.05 }}` | `src/components/ranking/RankingTab.tsx` |
| `delay: rIdx * 0.03,` | `src/components/reporting/CohortHeatmap.tsx` |
| `delay: i * 0.08 + 0.1,` | `src/components/reporting/FunnelReportView.tsx` |
| `transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}` | `src/components/reporting/FunnelReportView.tsx` |
| `const isPositiveQuarter = metrics.totalRevenue > metrics.pipelineValue * 0.3; // Simplistic logic` | `src/components/reports/QBRStoryGenerator.tsx` |
| `etapa de Proposta Técnica. Se tivéssemos convertido 10% desses deals` | `src/components/reports/QBRStoryGenerator.tsx` |
| `metrics.lostCount * 0.1) /` | `src/components/reports/QBRStoryGenerator.tsx` |
| `{/* Limiares de rentabilidade: 20% (crítico) e 40% (excelente) */}` | `src/components/reports/sales/SalesMarkupTrendChart.tsx` |
| `transition={{ delay: index * 0.07, duration: 0.35 }}` | `src/components/reports/sales/SalesReportKpis.tsx` |
| `// Reduz o bundle inicial da rota /revenue-intelligence em ~70%.` | `src/components/revenue-intelligence/RevenueIntelligenceHub.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/components/roi/ROIRankingList.tsx` |
| `transition={{ delay: index * 0.1 }}` | `src/components/sales/cadence/CadenceFunnel.tsx` |
| `transition={{ delay: index * 0.1 }}` | `src/components/sales/cadence/CadenceReportPanel.tsx` |
| `Sua cadência está performando 15% acima da média do setor. O canal{' '}` | `src/components/sales/cadence/EliteCadenceAnalytics.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/sdr/LeadScoreBreakdown.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/sdr/PerformanceCoaching.tsx` |
| `+24% conversão esperada` | `src/components/sdr/PredictiveSuccessMap.tsx` |
| `transition={{ delay: index * 0.05 }}` | `src/components/sdr/PredictiveSuccessMap.tsx` |
| `transition={{ delay: index * 0.1 }}` | `src/components/sdr/SDRIntelligenceHighlights.tsx` |
| `transition={{ delay: i * 0.1 }}` | `src/components/sdr/SDRSequenceOrchestrator.tsx` |
| `const currentConv = 12; // 12%` | `src/components/sdr/TargetSimulator.tsx` |
| `90% confiança).` | `src/components/sequences/ABTestPanel.tsx` |
| `* Threshold: 90% confidence, min 30 sends per variant.` | `src/components/sequences/abTestHelpers.ts` |
| `transition={{ delay: i * 0.03 }}` | `src/components/settings/ApiIntegrationSettings.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/components/settings/ApiIntegrationSettings.tsx` |
| `transition={{ delay: i * 0.04 }}` | `src/components/settings/CustomFieldsManager.tsx` |
| `Escolha o som e volume que toca quando um vendedor atinge 100% da meta` | `src/components/settings/SoundSettings.tsx` |
| `transition={{ duration: durationSec * 0.6, ease: 'easeOut' }}` | `src/components/skeletons/SkeletonTransition.tsx` |
| `y: { duration: durationSec * 0.8 },` | `src/components/skeletons/SkeletonTransition.tsx` |
| `transition={{ delay: idx * 0.04 }}` | `src/components/territory-optimization/TerritoryOptimizationHub.tsx` |
| `const outT = { duration: duration * 0.7, ease };` | `src/components/transitions/PageTransition.tsx` |
| `x: d > 0 ? -distance * 0.6 : distance * 0.6,` | `src/components/transitions/PageTransition.tsx` |
| `x: d > 0 ? distance * 0.6 : -distance * 0.6,` | `src/components/transitions/PageTransition.tsx` |
| `transition={{ duration: 1, delay: i * 0.1, repeat: 2 }}` | `src/components/ui/gamified-toast.tsx` |
| `delay: (index % 8) * 0.03, // Tighter stagger for faster feel` | `src/components/ui/virtualized-list.tsx` |
| `transition={{ delay: index * 0.03, duration: 0.4 }}` | `src/components/vendedores/RankingGridItem.tsx` |
| `transition={{ delay: config.delay + 1 + i * 0.1, type: 'spring' }}` | `src/components/vendedores/podium/PodiumCard.tsx` |
| `transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}` | `src/components/vendedores/podium/PodiumCard.tsx` |
| `transition={{ duration: 0.25, delay: idx * 0.04 }}` | `src/components/win-loss/CompetitorBattleCard.tsx` |
| `90% = banda mais estreita · 95% = padrão · 99% = mais ampla. O` | `src/components/win-loss/ScenarioForecastChart.tsx` |
| `Multiplicador z aplicado à largura da banda SEE. 1.96 ≈ 95% de` | `src/components/win-loss/ScenarioForecastChart.tsx` |
| `PI 95%` | `src/components/win-loss/ScenarioForecastChart.tsx` |
| `~68% de confiança, abre com horizonte.` | `src/components/win-loss/ScenarioForecastChart.tsx` |
| `<span>0%</span>` | `src/components/win-loss/WinByHourHeatmap.tsx` |
| `<span>100%</span>` | `src/components/win-loss/WinByHourHeatmap.tsx` |
| `Verde ≥50% · Âmbar 30-49% · Rosa &lt;30% — clique para drill-down.` | `src/components/win-loss/WinLossCohortHeatmap.tsx` |
| `transition={{ duration: 0.3, delay: idx * 0.05 }}` | `src/components/win-loss/WinLossKpiBanner.tsx` |
| `? `hsl(var(--destructive) / ${0.1 + intensity * 0.6})`` | `src/components/win-loss/WinLossReasonMatrix.tsx` |
| `particleCount: Math.floor(count * 0.1),` | `src/hooks/salesRealtimeUtils.ts` |
| `particleCount: Math.floor(count * 0.2),` | `src/hooks/salesRealtimeUtils.ts` |
| `particleCount: Math.floor(count * 0.25),` | `src/hooks/salesRealtimeUtils.ts` |
| `particleCount: Math.floor(count * 0.35),` | `src/hooks/salesRealtimeUtils.ts` |
| `particleCount: Math.floor(count * 0.1),` | `src/hooks/useCelebration.ts` |
| `particleCount: Math.floor(count * 0.2),` | `src/hooks/useCelebration.ts` |
| `particleCount: Math.floor(count * 0.25),` | `src/hooks/useCelebration.ts` |
| `particleCount: Math.floor(count * 0.35),` | `src/hooks/useCelebration.ts` |
| `if (gap > 0 && gap < mySales * 0.5) {` | `src/hooks/useMicroGoals.ts` |
| `const worstCase = deals.reduce((s, d) => s + d.amount * d.probability * 0.6, 0);` | `src/hooks/useWeightedForecast.ts` |
| `const leadGoal = totalActivityGoal * 0.15;` | `src/hooks/bi/useBISDRTransformers.ts` |
| `confidence: Math.min(dates.length * 0.2, 0.95),` | `src/hooks/crm/useClientPredictions.ts` |
| `drift: (Math.random() - 0.5) * 0.5,` | `src/hooks/gamification/useLevelUpCelebration.ts` |
| `origin: { x: 0.3 + Math.random() * 0.4, y: 0.9 },` | `src/hooks/gamification/useLevelUpCelebration.ts` |
| `origin: { x: 0.3 + i * 0.2, y: 0.5 },` | `src/hooks/gamification/useLevelUpCelebration.ts` |
| `commit: agg.total_pipeline * 0.4, // Simplified logic for commit` | `src/hooks/pipeline/usePipelineHealthScore.ts` |
| `upside: agg.total_pipeline * 0.7, // Simplified logic for upside` | `src/hooks/pipeline/usePipelineHealthScore.ts` |
| `// Checkpoint: 25/50/75/100% do progresso` | `src/hooks/race/useRaceAudioEngine.ts` |
| `const t = now + i * 0.08;` | `src/hooks/race/useRaceSounds.ts` |
| `const t = now + i * 0.15;` | `src/hooks/race/useRaceSounds.ts` |
| `const t = now + i * 0.22;` | `src/hooks/race/useRaceSounds.ts` |
| `const base = Math.max(gap * 0.15, leaderTotal * 0.02, 500);` | `src/hooks/race/useRaceWhatIf.ts` |
| `* Vendedores sem nenhuma venda com custo são omitidos (evita 0% enganoso).` | `src/hooks/reports/salesReportHelpers.ts` |
| `const forecastWinRate = winRate * 0.4 + recentWinRate * 0.6;` | `src/hooks/win-loss/useWinLossAggregations.ts` |
| `const score = Math.round(wr * 0.5 + ticketNorm * 0.25 + cycleNorm * 0.25);` | `src/hooks/win-loss/useWinLossSalespersonScore.ts` |
| `* (default) ≈ 68% confidence; configurable via `confidenceZ` for other coverages.` | `src/hooks/win-loss/useWinLossScenarios.ts` |
| `* 1.00=68% · 1.28=80% · 1.645=90% · 1.96=95%` | `src/hooks/win-loss/useWinLossScenarios.ts` |
| `* 90% → 1.645 · 95% → 1.960 · 99% → 2.576` | `src/hooks/win-loss/useWinLossScenarios.ts` |
| `* Default `1` (≈68% de cobertura). Presets úteis:` | `src/hooks/win-loss/useWinLossScenarios.ts` |
| `* INSERT (na entrada) + UPDATE (no flush) por 1 INSERT final, cortando ~50%` | `src/lib/analytics.ts` |
| `* 20 – 40% → saudável (warning)` | `src/lib/markupHelpers.ts` |
| `* < 20% → crítico (destructive)` | `src/lib/markupHelpers.ts` |
| `* >= 40% → excelente (success)` | `src/lib/markupHelpers.ts` |
| `Math.abs(delta) < lastHist * 0.02 ? 'flat' : delta > 0 ? 'up' : 'down';` | `src/lib/revenueForecast/forecastEngine.ts` |
| `avgTicketDelta?: number; // ex.: +0.15 = +15%` | `src/lib/revenueForecast/forecastEngine.ts` |
| `velocityDelta?: number; // ex.: -0.2 = -20% (mais lento reduz receita no horizonte)` | `src/lib/revenueForecast/forecastEngine.ts` |
| `// Pode entrar marginal: 10/44*50≈11 + 25*0.81≈20 = 31 raw, *0.81 = 25 → null. Excluído.` | `src/lib/winloss/atRiskFixtures.ts` |
| `delay: index * 0.05,` | `src/pages/Clientes.tsx` |
| `levando 40% a mais que a média histórica. Recomendamos revisar o` | `src/pages/ClosingTimePage.tsx` |
| `regras aplicáveis, o padrão é <strong>5%</strong>.` | `src/pages/CommissionRules.tsx` |
| `Competências acima de 80%` | `src/pages/Competencias.tsx` |
| … +65 linhas — lista completa em `context.json` | |

## H. Parâmetros de negócio (constantes, prazos, limites)

### H.1 Constantes

| Constante | Valor | Arquivo |
|---|---|---|
| `HEATMAP_DAYS` | `35` | `src/components/activities/ActivityHeatmap.tsx` |
| `ROLLBACK_ALERT_THRESHOLD` | `50` | `src/components/admin/connections/DbRollbackRatePanel.tsx` |
| `PAGE_LIMIT` | `100` | `src/components/admin/connections/DeadLetterIngestPanel.tsx` |
| `FAILING_REFETCH_MS` | `15` | `src/components/admin/connections/IntegrationHealthCard.tsx` |
| `HEALTHY_REFETCH_MS` | `60` | `src/components/admin/connections/IntegrationHealthCard.tsx` |
| `DAYS_TO_SHOW` | `365` | `src/components/analytics/ActivityHeatmap.tsx` |
| `NUDGE_INTERVAL_MS` | `5` | `src/components/assistant/PersonalAssistantDrawer.tsx` |
| `DEV_EMAIL` | `'dev@promobrindes.com.br'` | `src/components/auth/DevOnly.tsx` |
| `MAX_RECENT` | `5` | `src/components/command/CommandPalette.tsx` |
| `SLIDE_DURATION` | `8000` | `src/components/competitive/CompetitiveTVDashboard.tsx` |
| `ROTATION_INTERVAL` | `15000` | `src/components/competitive/EnhancedTVMode.tsx` |
| `XP_PER_LEVEL` | `500` | `src/components/competitive/GamifiedProfile.tsx` |
| `MAX_BYTES` | `50` | `src/components/conversational/CallRecordingUploader.tsx` |
| `ALL_SALESPEOPLE` | `'__all__'` | `src/components/dashboard/FuturisticSpeedometerDashboard.tsx` |
| `WINDOW_DAYS` | `90` | `src/components/email/RecoveryRateCard.tsx` |
| `MAX` | `25` | `src/components/lead-routing/CapacityDashboard.tsx` |
| `DEFAULT_FPS_THRESHOLD` | `45` | `src/components/performance/PerformanceMonitor.tsx` |
| `DEFAULT_RENDER_THRESHOLD` | `32` | `src/components/performance/PerformanceMonitor.tsx` |
| `SLIDE_DURATION` | `1400` | `src/components/race/DailyBriefingModal.tsx` |
| `PROGRESS_TO_SECONDS` | `45` | `src/components/race/LeaderGapIndicator.tsx` |
| `DURATION_MS` | `2800` | `src/components/race/LeaderTakeoverCelebration.tsx` |
| `PIT_STOP_SECONDS` | `30` | `src/components/race/PitStopPanel.tsx` |
| `STEPS` | `60` | `src/components/race/RaceGhostDemo.tsx` |
| `SEG` | `40` | `src/components/race/raceTrackHelpers.ts` |
| `TRACK_WIDTH` | `72` | `src/components/race/track/TrackAsphalt.tsx` |
| `RUNOFF_EXTRA` | `22` | `src/components/race/track/TrackAsphalt.tsx` |
| `OFFSET_OUTER` | `60` | `src/components/race/track/TrackBarriers.tsx` |
| `OFFSET_INNER` | `-60` | `src/components/race/track/TrackBarriers.tsx` |
| `MAX_PARTICLES` | `120` | `src/components/race/track/TrackDustParticles.tsx` |
| `LIFE_MS` | `700` | `src/components/race/track/TrackDustParticles.tsx` |
| `FRAME_MS` | `33` | `src/components/race/track/TrackDustParticles.tsx` |
| `TRACK_HALF` | `32` | `src/components/race/track/TrackStartGantry.tsx` |
| `STRIPE_W` | `22` | `src/components/race/track/TrackStartGantry.tsx` |
| `MAX_MARKS` | `30` | `src/components/race/track/TrackTireMarks.tsx` |
| `FADE_MS` | `1500` | `src/components/race/track/TrackTireMarks.tsx` |
| `SIDEBAR_COOKIE_MAX_AGE` | `60` | `src/components/ui/sidebar.tsx` |
| `SIDEBAR_WIDTH` | `'16rem'` | `src/components/ui/sidebar.tsx` |
| `SIDEBAR_WIDTH_MOBILE` | `'18rem'` | `src/components/ui/sidebar.tsx` |
| `NEW_THRESHOLD_MS` | `7` | `src/components/win-loss/ActionableInsightsPanel.tsx` |
| `BULK_REPLAY_HARD_CAP` | `200` | `src/components/win-loss/BulkReplayConfirmDialog.tsx` |
| `BULK_REPLAY_CHUNK_SIZE` | `50` | `src/components/win-loss/BulkReplayConfirmDialog.tsx` |
| `Z_MIN` | `0.5` | `src/components/win-loss/ScenarioForecastChart.tsx` |
| `Z_MAX` | `3.0` | `src/components/win-loss/ScenarioForecastChart.tsx` |
| `ROW_BASE` | `132` | `src/components/win-loss/VirtualDealsList.tsx` |
| `ROW_EXPANDED` | `360` | `src/components/win-loss/VirtualDealsList.tsx` |
| `DEFAULT_THRESHOLD` | `95` | `src/components/win-loss/WebhookHealthPanel.tsx` |
| `VIRTUAL_HEIGHT` | `560` | `src/components/win-loss/WinLossDealsDrawer.tsx` |
| `TOAST_LIMIT` | `5` | `src/hooks/use-toast.ts` |
| `TOAST_REMOVE_DELAY` | `5000` | `src/hooks/use-toast.ts` |
| `DIALOG_SELECTOR` | `'[role="` | `src/hooks/useBackNavigation.ts` |
| `CHUNK_SIZE` | `500` | `src/hooks/useLeadScoring.ts` |
| `MAX_ATTEMPTS` | `5` | `src/hooks/useLoginRateLimiter.ts` |
| `CHUNK` | `1000` | `src/hooks/useMyBonusAwards.ts` |
| `MAX_STORED_METRICS` | `100` | `src/hooks/useQueryPerformance.ts` |
| `ALERT_COOLDOWN_MS` | `30000` | `src/hooks/useQueryPerformance.ts` |
| `JITTER_FACTOR` | `0.3` | `src/hooks/useRetryMutation.ts` |
| `MAX_ENTRIES` | `50` | `src/hooks/useScrollRestoration.ts` |
| `MAX_ATTEMPTS` | `5` | `src/hooks/admin/useV4Callbacks.ts` |
| `DEFAULT_DAYS` | `30` | `src/hooks/bi/useChurnPeriodPreference.ts` |
| `CALL_RECORDINGS_PAGE_SIZE` | `50` | `src/hooks/conversational/useCallRecordings.ts` |
| `BASE_SALARY_MONTHLY` | `3500` | `src/hooks/dashboard/useROIDashboard.ts` |
| `DAY_MS` | `86` | `src/hooks/email/emailOptOutMetricsHelpers.ts` |
| `MAX_RETRIES` | `4` | `src/hooks/email/failedDraftsHelpers.ts` |
| `RECOVERY_RISK_THRESHOLD` | `70` | `src/hooks/email/recoveryRateHelpers.ts` |
| `OPT_OUT_RISK_THRESHOLD` | `2` | `src/hooks/email/useCampaignOptOutRates.ts` |
| `MAX_ROWS` | `5000` | `src/hooks/email/useEmailOptOutMetrics.ts` |
| `WINDOW_DAYS` | `90` | `src/hooks/email/useEmailOptOutMetrics.ts` |
| `READ_LIMIT` | `200` | `src/hooks/email/useFailedDrafts.ts` |
| `MAX_HISTORY` | `10` | `src/hooks/nlq/useNLQ.ts` |
| `STAGNANT_WARNING_DAYS` | `7` | `src/hooks/notifications/useAlerts.ts` |
| `STAGNANT_CRITICAL_DAYS` | `14` | `src/hooks/notifications/useAlerts.ts` |
| `INACTIVE_CLIENT_DAYS` | `30` | `src/hooks/notifications/useAlerts.ts` |
| `EVENT` | `'race-calm-mode-change'` | `src/hooks/race/useCalmMode.ts` |
| `AUTO_DISMISS_MS` | `5500` | `src/hooks/race/useOvertakeDetector.ts` |
| `MAX_QUEUE` | `2` | `src/hooks/race/useOvertakeDetector.ts` |
| `DEBOUNCE_MS` | `800` | `src/hooks/race/useRaceAudioEngine.ts` |
| `PERIODIC_INTERVAL_MS` | `90` | `src/hooks/race/useRaceCommentary.ts` |
| `MAX_HISTORY` | `8` | `src/hooks/race/useRaceCommentary.ts` |
| `COOLDOWN_MS` | `8` | `src/hooks/race/useRaceCommentary.ts` |
| `MS_PER_DAY` | `86` | `src/hooks/race/useRacePredictions.ts` |
| `MAX_SNAPSHOTS` | `10` | `src/hooks/race/useRaceReplay.ts` |
| `REPLAY_DURATION_MS` | `4000` | `src/hooks/race/useRaceReplay.ts` |
| `DEFAULT_MODE` | `'focus'` | `src/hooks/race/useRaceViewMode.ts` |
| `DEFAULT_SAMPLE` | `1` | `src/hooks/reports/useMarkupMinSamplePreference.ts` |
| `DEFAULT_RESPONSE_MODE` | `'text'` | `src/hooks/sales/useSalespersonPreferences.ts` |
| `STALE_MS` | `1000` | `src/hooks/scoring/useLeadScoreExplanation.ts` |
| `ASYNC_REPLAY_CHUNK_SIZE` | `25` | `src/hooks/win-loss/useAsyncReplayQueue.ts` |
| `SCHEMA_VERSION` | `4` | `src/hooks/win-loss/useAtRiskSettings.ts` |
| `TABLE` | `'win_loss_insight_comments'` | `src/hooks/win-loss/useInsightComments.ts` |
| `TTL_MS` | `24` | `src/hooks/win-loss/useInsightExplanation.ts` |
| `WINDOW_DAYS` | `30` | `src/hooks/win-loss/useInsightsImpact.ts` |
| `RECENT_HOURS` | `24` | `src/hooks/win-loss/useWebhookAlerts.ts` |
| `ACTIVE_MINUTES` | `60` | `src/hooks/win-loss/useWebhookAlerts.ts` |
| `HARD_LIMIT` | `500` | `src/hooks/win-loss/useWebhookAttemptSlice.ts` |
| `CHUNK` | `50` | `src/hooks/win-loss/useWebhookDeadLetters.ts` |
| `MAX_REASON_BUCKETS` | `6` | `src/hooks/win-loss/useWebhookDeliveryStats.ts` |
| `SELECTION_MAX_AGE_MS` | `24` | `src/hooks/win-loss/useWebhookReplayPersistence.ts` |
| `DEFAULT_RETENTION_MS` | `30` | `src/hooks/win-loss/useWebhookReplayPersistence.ts` |
| `DEBOUNCE_MS` | `250` | `src/hooks/win-loss/useWinLossFilters.ts` |
| `ENTITY` | `'win_loss'` | `src/hooks/win-loss/useWinLossSavedViews.ts` |
| `Z_MIN` | `0.1` | `src/hooks/win-loss/useWinLossScenarios.ts` |
| `Z_MAX` | `5` | `src/hooks/win-loss/useWinLossScenarios.ts` |
| `SCHEMA_VERSION` | `1` | `src/hooks/win-loss/useWinLossViewPrefs.ts` |
| `MAX_REPLAY_IDS` | `50` | `src/hooks/win-loss/validateReplayIds.ts` |
| `BOM` | `'\ufeff'` | `src/lib/csv.ts` |
| `SEP` | `';'` | `src/lib/csv.ts` |
| `EOL` | `'\r\n'` | `src/lib/csv.ts` |
| `FLUSH_INTERVAL` | `30` | `src/lib/errorTracking.ts` |
| `MAX_BUFFER` | `50` | `src/lib/errorTracking.ts` |
| `CACHE_TTL_MS` | `10` | `src/lib/stageProbabilities.ts` |
| `RECOVERY_WINDOW_MS` | `30` | `src/lib/staleAssetRecovery.ts` |
| `MAX_RECOVERY_ATTEMPTS` | `1` | `src/lib/staleAssetRecovery.ts` |
| `KILL_SWITCH_FLAG` | `'promo-champions:sw-killed'` | `src/lib/swUpdater.ts` |
| `CRITICAL_MARKUP_THRESHOLD` | `20` | `src/lib/bi/markupOverviewHelpers.ts` |
| `PAGE_SIZE` | `25` | `src/pages/AdminHistoricoAlertasChurn.tsx` |
| `PAGE_SIZE` | `25` | `src/pages/AdminSolicitacoesTitular.tsx` |
| `PAGE_SIZE` | `25` | `src/pages/AdminSupressaoEmails.tsx` |
| `PAGE_SIZE` | `10` | `src/pages/MinhasPremiacoes.tsx` |
| `ROTATION_MS` | `30` | `src/pages/RaceArenaTV.tsx` |
| `BUSINESS_TZ` | `"America/Sao_Paulo"` | `supabase/functions/_shared/business-date.ts` |
| `CANONICAL_FILE` | `"_shared/cors.ts"` | `supabase/functions/_shared/cors_lint_test.ts` |
| `MS_PER_DAY` | `1000` | `supabase/functions/_shared/deal-probability-calc.ts` |
| `DAY_MS` | `1000` | `supabase/functions/_shared/deal-probability-calc_test.ts` |
| `REQ_ID_HEADER` | `"X-Request-Id"` | `supabase/functions/_shared/http-envelope.ts` |
| `REQ_ID_HEADER` | `"X-Request-Id"` | `supabase/functions/_shared/request-id.ts` |
| `MAX_RETRIES` | `4` | `supabase/functions/_shared/retry-policy.ts` |
| `BASE_DELAY_MIN` | `5` | `supabase/functions/_shared/retry-policy.ts` |
| `BACKOFF_FACTOR` | `3` | `supabase/functions/_shared/retry-policy.ts` |
| `MAX_DELAY_MIN` | `240` | `supabase/functions/_shared/retry-policy.ts` |
| `CACHE_TTL_MS` | `5` | `supabase/functions/_shared/stage-probabilities.ts` |
| `MAX_SIGNATURE_AGE_MS` | `5` | `supabase/functions/_shared/webhook-auth.ts` |
| `SEVERITY_CRITICAL_MIN` | `80` | `supabase/functions/_shared/winloss-contract.ts` |
| `SEVERITY_HIGH_MIN` | `65` | `supabase/functions/_shared/winloss-contract.ts` |
| `SEVERITY_MEDIUM_MIN` | `50` | `supabase/functions/_shared/winloss-contract.ts` |
| `CRITICAL_CONFIDENCE_MIN` | `0.7` | `supabase/functions/_shared/winloss-contract.ts` |
| `DEAL_RISK_THRESHOLD` | `40` | `supabase/functions/_shared/winloss-contract.ts` |
| `DEFAULT_SPIKE_THRESHOLD` | `5` | `supabase/functions/access-denied-alerts/index.ts` |
| `DEFAULT_TIME_WINDOW_HOURS` | `1` | `supabase/functions/access-denied-alerts/index.ts` |
| `DEFAULT_COOLDOWN_HOURS` | `24` | `supabase/functions/access-denied-alerts/index.ts` |
| `MAX_STEPS` | `10` | `supabase/functions/ai-agent-orchestrator/index.ts` |
| `MAX_CUSTOM_INSTRUCTIONS` | `500` | `supabase/functions/ai-email-composer/index.ts` |
| `MAX_TRANSCRIPT_LENGTH` | `20` | `supabase/functions/analyze-call/index.ts` |
| `WINDOW_SECONDS` | `30` | `supabase/functions/analyze-sentiment-timeline/index.ts` |
| `REASSIGNMENT_BATCH_SIZE` | `20` | `supabase/functions/auto-reassign-inactive/index.ts` |
| `OAUTH_STATE_TTL_MS` | `10` | `supabase/functions/bitrix24-oauth/index.ts` |
| `BITRIX_FIELD_RAMO_ATIVIDADE` | `'UF_CRM_1590780873288'` | `supabase/functions/bitrix24-sync/index.ts` |
| `BITRIX_FIELD_NICHO_SEGMENTO` | `'UF_CRM_1631795570468'` | `supabase/functions/bitrix24-sync/index.ts` |
| `SYNC_LOCK_TTL_SECONDS` | `15` | `supabase/functions/bitrix24-sync/index.ts` |
| `PENDING_CLAIM_STALE_MS` | `60` | `supabase/functions/bitrix24-sync/index.ts` |
| `BITRIX_LIST_MAX_PAGES` | `40` | `supabase/functions/bitrix24-sync/index.ts` |
| `MAX_ATTEMPTS` | `5` | `supabase/functions/check-v4-callback-alerts/index.ts` |
| `DIGEST_TYPE` | `'deal_risk_digest'` | `supabase/functions/deal-risk-digest/index.ts` |
| `HEALTH_THRESHOLD` | `50` | `supabase/functions/deal-risk-digest/index.ts` |
| `TOP_N` | `5` | `supabase/functions/deal-risk-digest/index.ts` |
| `SLACK_CIRCUIT` | `'slack:deal-risk-digest'` | `supabase/functions/deal-risk-digest/index.ts` |
| `STAGE` | `"negotiation"` | `supabase/functions/detect-winloss-at-risk/action_matrix_combinations_test.ts` |
| `RISK_THRESHOLD` | `40` | `supabase/functions/detect-winloss-at-risk/lse_fixtures_test.ts` |
| `MIN_ACTION` | `15` | `supabase/functions/detect-winloss-at-risk/non_empty_strings_test.ts` |
| `STAGE` | `"negotiation"` | `supabase/functions/detect-winloss-at-risk/urgency_scale_outcome_symmetry_test.ts` |
| `MAX_AUDIO_BASE64_LENGTH` | `10` | `supabase/functions/elevenlabs-stt/index.ts` |
| `MAX_TEXT_LENGTH` | `2000` | `supabase/functions/elevenlabs-tts/index.ts` |
| `SCAN_LIMIT` | `500` | `supabase/functions/email-bulk-retry/index.ts` |
| `HIT_TTL_MS` | `90` | `supabase/functions/geocode-proxy/index.ts` |
| `MISS_TTL_MS` | `14` | `supabase/functions/geocode-proxy/index.ts` |
| `MAX_INBOUND_EMAIL_BODY_BYTES` | `256` | `supabase/functions/inbound-email-webhook/index.ts` |
| `DB_CHUNK` | `100` | `supabase/functions/lead-scoring/index.ts` |
| `MAX_BODY_BYTES` | `32` | `supabase/functions/log-web-vitals/index.ts` |
| `MAX_BODY_BYTES` | `32` | `supabase/functions/log-web-vitals/security_test.ts` |
| `MAX_MULTICHANNEL_STATUS_BODY_BYTES` | `256` | `supabase/functions/multichannel-status-webhook/index.ts` |
| `MAX_LIMIT` | `10` | `supabase/functions/next-best-action/index.ts` |
| `MAX_QUESTION_LENGTH` | `1000` | `supabase/functions/nlq-query/index.ts` |
| `MAX_ATTEMPTS` | `5` | `supabase/functions/notify-v4-quote-status/index.ts` |
| `BASE_BACKOFF_MS` | `30` | `supabase/functions/notify-v4-quote-status/index.ts` |
| `HTTP_TIMEOUT_MS` | `8000` | `supabase/functions/notify-v4-quote-status/index.ts` |
| `BATCH_SIZE` | `20` | `supabase/functions/notify-v4-quote-status/index.ts` |
| `MODEL` | `"google/gemini-2.5-flash"` | `supabase/functions/personal-assistant-stream/index.ts` |
| `BUCKETS` | `8` | `supabase/functions/pricing-intelligence/index.ts` |
| `BATCH_SIZE` | `20` | `supabase/functions/process-call-recording-ingest/index.ts` |
| `COMMENTARY_CACHE_TTL_MS` | `60` | `supabase/functions/race-commentary/index.ts` |
| `MAX_WEBHOOK_BODY_BYTES` | `240` | `supabase/functions/receive-quote-sync/index.ts` |
| `MAX_EVENT_LENGTH` | `120` | `supabase/functions/receive-quote-sync/index.ts` |
| `MAX_EXTERNAL_QUOTE_ID_LENGTH` | `128` | `supabase/functions/receive-quote-sync/index.ts` |
| `MAX_WEBHOOK_BODY_BYTES` | `240` | `supabase/functions/receive-quote-sync/security_test.ts` |
| `MAX_PDF_BYTES` | `10` | `supabase/functions/receive-quote-webhook/index.ts` |
| `RATE_LIMIT_MAX` | `60` | `supabase/functions/report-embed-public/index.ts` |
| `RATE_LIMIT_WINDOW_MS` | `60` | `supabase/functions/report-embed-public/index.ts` |
| `MAX_ATTEMPTS` | `3` | `supabase/functions/run-retry-tests/retry.ts` |
| `TIMEOUT_MS` | `8000` | `supabase/functions/run-retry-tests/retry.ts` |
| `PAGE` | `1000` | `supabase/functions/scheduled-reports-runner/index.ts` |
| `TTL_MS` | `5` | `supabase/functions/semantic-search/index.ts` |
| `MAX_RESULT_LIMIT` | `50` | `supabase/functions/semantic-search-universal/index.ts` |
| `TTL_MS` | `2` | `supabase/functions/semantic-search-universal/index.ts` |
| `MAX_MESSAGE_LENGTH` | `4` | `supabase/functions/send-multichannel-message/index.ts` |
| `VAPID_EXPIRATION_SECONDS` | `12` | `supabase/functions/send-push-notification/index.ts` |
| `MAX_EMAIL_LENGTH` | `254` | `supabase/functions/send-transactional-email/index.ts` |
| `MAX_SUBJECT_LENGTH` | `200` | `supabase/functions/send-transactional-email/index.ts` |
| `MAX_BODY_LENGTH` | `100` | `supabase/functions/send-transactional-email/index.ts` |
| `DIRECT_SEND_LIMIT` | `15` | `supabase/functions/send-transactional-email/index.ts` |
| `CLAIM_LEASE_MS` | `5` | `supabase/functions/sequence-runner/index.ts` |
| `DELIVERY_RETRY_MS` | `15` | `supabase/functions/sequence-runner/index.ts` |
| `SKIPPED_RETRY_MS` | `24` | `supabase/functions/sequence-runner/index.ts` |
| `MAX_ITERATIONS` | `1000` | `supabase/functions/stress-test-contracts/index.ts` |
| `DEFAULT_SLOT_LAG` | `64` | `supabase/functions/wal-health-alert/index.ts` |
| `DEFAULT_WAL_SIZE` | `500` | `supabase/functions/wal-health-alert/index.ts` |
| `RP_ID_HEADER` | `'x-rp-id'` | `supabase/functions/webauthn/index.ts` |
| `CHALLENGE_TTL_MS` | `5` | `supabase/functions/webauthn/index.ts` |
| `LOOKBACK_DAYS` | `9` | `supabase/functions/webvitals-regression-alert/index.ts` |
| `MAX_BODY_BYTES` | `256` | `supabase/functions/whatsapp-inbound-webhook/index.ts` |
| `MAX_INBOUND_TEXT` | `4` | `supabase/functions/whatsapp-inbound-webhook/index.ts` |
| `MAX_ATTEMPTS` | `3` | `supabase/functions/winloss-webhook-dispatcher/retry.ts` |
| `TIMEOUT_MS` | `8000` | `supabase/functions/winloss-webhook-dispatcher/retry.ts` |
| `BASE` | `250` | `supabase/functions/winloss-webhook-dispatcher/retry_backoff_sleep_test.ts` |
| `MAX_BASE_CAP` | `8000` | `supabase/functions/winloss-webhook-dispatcher/retry_backoff_sleep_test.ts` |
| `MAX_RAND` | `0.9999999` | `supabase/functions/winloss-webhook-dispatcher/retry_backoff_sleep_test.ts` |
| `MSG` | `"The signal has been aborted"` | `supabase/functions/winloss-webhook-dispatcher/retry_error_naming_test.ts` |
| `MSG` | `"signal timed out after 8000ms"` | `supabase/functions/winloss-webhook-dispatcher/retry_error_naming_test.ts` |
| `MSG` | `"aborted by deadline"` | `supabase/functions/winloss-webhook-dispatcher/retry_error_naming_test.ts` |
| `ABORT_MSG` | `"aborted by deadline"` | `supabase/functions/winloss-webhook-dispatcher/retry_error_naming_test.ts` |
| `TIMEOUT_MSG` | `"signal timed out after 8000ms"` | `supabase/functions/winloss-webhook-dispatcher/retry_error_naming_test.ts` |
| `NET_MSG` | `"tcp connect ECONNREFUSED 10.0.0.1:443"` | `supabase/functions/winloss-webhook-dispatcher/retry_error_naming_test.ts` |
| `MSG` | `"aborted by upstream deadline"` | `supabase/functions/winloss-webhook-dispatcher/retry_insert_failure_dlq_test.ts` |
| `MSG` | `"signal timed out after 8000ms"` | `supabase/functions/winloss-webhook-dispatcher/retry_insert_failure_dlq_test.ts` |
| `MSG` | `"error sending request: connection reset by peer"` | `supabase/functions/winloss-webhook-dispatcher/retry_insert_failure_dlq_test.ts` |
| `EVENT` | `"winloss.deal.lost"` | `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` |
| `HARD_CAP_MS` | `8000` | `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` |
| `FAIL_EVERY` | `7` | `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` |
| `RAND` | `0` | `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` |
| `UUID_A` | `"11111111-1111-4111-8111-111111111111"` | `supabase/functions/winloss-webhook-replay/schema_test.ts` |
| `UUID_B` | `"22222222-2222-4222-8222-222222222222"` | `supabase/functions/winloss-webhook-replay/schema_test.ts` |
| `UUID_C` | `"33333333-3333-4333-8333-333333333333"` | `supabase/functions/winloss-webhook-replay/schema_test.ts` |
| `MAX_BATCH_TOTAL` | `500` | `supabase/functions/winloss-webhook-replay-batch/schema.ts` |
| `MAX_CHUNK_SIZE` | `50` | `supabase/functions/winloss-webhook-replay-batch/schema.ts` |
| `DEFAULT_CHUNK_SIZE` | `25` | `supabase/functions/winloss-webhook-replay-batch/schema.ts` |

### H.2 Prazos, expirações e janelas de tempo

| Trecho | Arquivo |
|---|---|
| `timeout: 60_000,` | `playwright.a11y.config.ts` |
| `timeout: 120000,` | `playwright.config.ts` |
| `setTimeout(() => { setActiveReactions(prev => prev.filter(r => r.id !== id)); }, 1000);` | `src/components/activities/DailyActivityRanking.tsx` |
| `const cutoff = Date.now() - 24 * 60 * 60 * 1000;` | `src/components/admin/connections/EdgeRetryEventsPanel.tsx` |
| `const idx = Math.floor((t - first) / (60 * 60 * 1000));` | `src/components/admin/connections/EdgeRetryTimeSeriesChart.tsx` |
| `const last = (buckets[buckets.length - 1]._ts as number) + 60 * 60 * 1000;` | `src/components/admin/connections/EdgeRetryTimeSeriesChart.tsx` |
| `const cutoff = Date.now() - 24 * 60 * 60 * 1000;` | `src/components/admin/connections/ForecastNarrativeDlqPanel.tsx` |
| `: 6 * 60 * 60000;` | `src/components/admin/telemetry/TelemetryCharts.tsx` |
| `toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {` | `src/components/analytics/ABCActionableAutomations.tsx` |
| `if (age > SLA_HOURS * 60 * 60 * 1000) {` | `src/components/analytics/LeadSLAMonitor.tsx` |
| `const sixMonthsAgo = subMonths(now, 6);` | `src/components/analytics/RevenueForecast.tsx` |
| `staleTime: 5 * 60 * 1000,` | `src/components/analytics/RevenueForecast.tsx` |
| `(now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)` | `src/components/analytics/useChurnPrediction.ts` |
| `cutoffDate = subDays(now, 7);` | `src/components/assistant/ConversationHistory.tsx` |
| `cutoffDate = subMonths(now, 1);` | `src/components/assistant/ConversationHistory.tsx` |
| `cutoffDate = subMonths(now, 3);` | `src/components/assistant/ConversationHistory.tsx` |
| `const NUDGE_INTERVAL_MS = 5 * 60 * 1000;` | `src/components/assistant/PersonalAssistantDrawer.tsx` |
| `onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}` | `src/components/calendar/ActivityCalendar.tsx` |
| `onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}` | `src/components/calendar/ActivityCalendar.tsx` |
| `? `${Math.floor((new Date().getTime() - new Date(data.orders[0]!.created_at).getTime()) / (1000 * 60 * 60 * 24))} dias`` | `src/components/clients/Client360HealthNbaSection.tsx` |
| `toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {` | `src/components/clients/Client360View.tsx` |
| `? `${Math.floor((new Date().getTime() - new Date(data.orders[data.orders.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))} meses`` | `src/components/clients/InsightBanner.tsx` |
| `: new Date(date.getTime() + 24 * 60 * 60 * 1000 - 1);` | `src/components/closer/CloserRevenueEvolution.tsx` |
| `? new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)` | `src/components/closer/CloserRevenueEvolution.tsx` |
| `startDate = subDays(now, 7);` | `src/components/closer/CloserRevenueEvolution.tsx` |
| `startDate = subMonths(now, 1);` | `src/components/closer/CloserRevenueEvolution.tsx` |
| `startDate = subMonths(now, 3);` | `src/components/closer/CloserRevenueEvolution.tsx` |
| `const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);` | `src/components/coaching/sessions/SessionScheduleDialog.tsx` |
| `const diffH = Math.round((d - now) / (1000 * 60 * 60));` | `src/components/coaching/sessions/sessionPlannerHelpers.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/components/competitive/ActivityHeatmap.tsx` |
| `staleTime: 5 * 60 * 1000,` | `src/components/competitive/PerformanceBets.tsx` |
| `staleTime: 5 * 60 * 1000,` | `src/components/competitive/TerritoryWars.tsx` |
| `staleTime: 5 * 60 * 1000,` | `src/components/competitive/TournamentBrackets.tsx` |
| `const timer = setTimeout(() => { setInsights(mockInsights); }, 1000);` | `src/components/conversational/LiveIntelligenceFeed.tsx` |
| `return Math.floor((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));` | `src/components/customer-success/cs360Helpers.ts` |
| `const nextWeek = format(addDays(new Date(), 7), 'yyyy-MM-dd');` | `src/components/dashboard/widgets/CalendarPreviewWidget.tsx` |
| `new Date(Date.now() + horizon * 24 * 60 * 60 * 1000)` | `src/components/forecast/RevenueForecastHub.tsx` |
| `const timer = setTimeout(() => onComplete(), 4000);` | `src/components/gamification/LevelUpOverlay.tsx` |
| `const timer = setTimeout(() => onComplete(), 4500);` | `src/components/gamification/StreakMilestoneOverlay.tsx` |
| `const date = subDays(today, 6 - i);` | `src/components/gamification/StreakWidget.tsx` |
| `const timer = setTimeout(() => onComplete(), 6000);` | `src/components/gamification/VictoryOverlay.tsx` |
| `setTimeout(() => { setNotifications(prev => prev.filter(n => n.id !== id)); }, 3000);` | `src/components/gamification/XPToast.tsx` |
| `const since = startOfWeek(subWeeks(new Date(), 5), { locale: ptBR });` | `src/components/intelligence/PerformanceTrends.tsx` |
| `const start = startOfWeek(subWeeks(new Date(), 5 - i), { locale: ptBR });` | `src/components/intelligence/PerformanceTrends.tsx` |
| `staleTime: 5 * 60 * 1000,` | `src/components/intelligence/PerformanceTrends.tsx` |
| `gTimerRef.current = setTimeout(() => setIsGKeyDown(false), 1500); // 1.5s window` | `src/components/keyboard/KeyboardShortcutsProvider.tsx` |
| `setTimeout(() => setCopied(false), 2000);` | `src/components/navigation/Breadcrumbs.tsx` |
| `setTimeout(() => setHasAlert(false), 3000);` | `src/components/performance/PerformanceMonitor.tsx` |
| `(Date.now() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24) > 10;` | `src/components/pipeline/DealCard.tsx` |
| `setTimeout(() => setIsEnriching(false), 2000);` | `src/components/pipeline/DealCard.tsx` |
| `setTimeout(() => setCopied(false), 2000);` | `src/components/pipeline/DealSummaryCard.tsx` |
| `(Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)` | `src/components/pipeline/SLACountdown.tsx` |
| `return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));` | `src/components/pipeline/StagnantDealAlert.tsx` |
| `const timer = window.setTimeout(() => setBursts([]), 2400);` | `src/components/race/Fireworks.tsx` |
| `const t = window.setTimeout(() => setZoomActive(false), 2000);` | `src/components/race/RaceArena.tsx` |
| `const t1 = window.setTimeout(() => setShowFinaleFlag(false), 2200);` | `src/components/race/RaceArena.tsx` |
| `const t2 = window.setTimeout(() => setShowFireworks(false), 2600);` | `src/components/race/RaceArena.tsx` |
| `window.setTimeout(() => setReplayOverlay(false), 3200);` | `src/components/race/RaceArena.tsx` |
| `const urgent = ms > 0 && ms < 6 * 60 * 60 * 1000; // <6h` | `src/components/race/RaceCountdownBadge.tsx` |
| `const t = setTimeout(() => { setVisible(prev => prev.filter(r => r.id !== newest.id)); }, 1600);` | `src/components/race/ReactionFloater.tsx` |
| `const t = setTimeout(() => markRead.mutate(notif.id), 4000);` | `src/components/ranking/RankingPositionBanner.tsx` |
| `staleTime: 5 * 60 * 1000,` | `src/components/sdr/LeadScoreBreakdown.tsx` |
| `return startOfDay(subDays(new Date(), 30)).toISOString();` | `src/components/sdr/SDRAlertHistory.tsx` |
| `return startOfDay(subDays(new Date(), 7)).toISOString();` | `src/components/sdr/SDRAlertHistory.tsx` |
| `return startOfDay(subMonths(new Date(), 3)).toISOString();` | `src/components/sdr/SDRAlertHistory.tsx` |
| `: subMonths(now, 3);` | `src/components/sdr/SDRConversionEvolution.tsx` |
| `? subDays(now, 7)` | `src/components/sdr/SDRConversionEvolution.tsx` |
| `? subMonths(now, 1)` | `src/components/sdr/SDRConversionEvolution.tsx` |
| `staleTime: 5 * 60 * 1000,` | `src/components/sdr/SDRIntelligenceHighlights.tsx` |
| `staleTime: 5 * 60 * 1000,` | `src/components/sdr/SDRSequenceOrchestrator.tsx` |
| `: new Date(Date.now() + parseInt(expiresIn) * 60 * 60 * 1000).toISOString();` | `src/components/security/BlockedIPsPanel.tsx` |
| `const [dateFrom, setDateFrom] = useState<Date \| undefined>(subDays(new Date(), 7));` | `src/components/settings/AccessDeniedLogs.tsx` |
| `dateFrom?.toDateString() !== subDays(new Date(), 7).toDateString() \|\|` | `src/components/settings/AccessDeniedLogs.tsx` |
| `setDateFrom(subDays(new Date(), 7));` | `src/components/settings/AccessDeniedLogs.tsx` |
| `setTimeout(() => setActiveCelebration(null), 2000);` | `src/components/settings/sound/CelebrationTab.tsx` |
| `setTimeout(() => setActiveCelebration(null), 2500);` | `src/components/settings/sound/CelebrationTab.tsx` |
| `setTimeout(() => setActiveCelebration(null), 3500);` | `src/components/settings/sound/CelebrationTab.tsx` |
| `const NEW_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;` | `src/components/win-loss/ActionableInsightsPanel.tsx` |
| `setTimeout(() => void refetch(), 1500);` | `src/components/win-loss/ReplayStatusByIdPanel.tsx` |
| `GC_TIME_MS: 10 * 60 * 1000,` | `src/config/constants.ts` |
| `STALE_TIME_MS: 1 * 60 * 1000,` | `src/config/constants.ts` |
| `TOKEN_REFRESH_INTERVAL_MS: 4 * 60 * 1000,` | `src/config/constants.ts` |
| `gcTime: 60 * 60 * 1000, // 1h` | `src/config/queryOptions.ts` |
| `staleTime: 30 * 60 * 1000, // 30min` | `src/config/queryOptions.ts` |
| `GC_TIME: 10 * 60 * 1000, // 10 minutos` | `src/constants/index.ts` |
| `REFETCH_INTERVAL: 30 * 60 * 1000, // 30 minutos` | `src/constants/index.ts` |
| `STALE_TIME: 5 * 60 * 1000, // 5 minutos` | `src/constants/index.ts` |
| `currentStart = startOfMonth(subMonths(now, 2));` | `src/hooks/useBenchmarkData.ts` |
| `previousEnd = endOfMonth(subMonths(now, 1));` | `src/hooks/useBenchmarkData.ts` |
| `previousEnd = endOfMonth(subMonths(now, 3));` | `src/hooks/useBenchmarkData.ts` |
| `previousStart = startOfMonth(subMonths(now, 1));` | `src/hooks/useBenchmarkData.ts` |
| `previousStart = startOfMonth(subMonths(now, 5));` | `src/hooks/useBenchmarkData.ts` |
| `previousStart = startOfYear(subYears(now, 1));` | `src/hooks/useBenchmarkData.ts` |
| `setTimeout(() => clearInterval(pollInterval), 120000);` | `src/hooks/useBitrix24.ts` |
| `setTimeout(() => setActiveCelebration(null), 2000);` | `src/hooks/useCelebrationEffects.ts` |
| `setTimeout(() => setActiveCelebration(null), 2500);` | `src/hooks/useCelebrationEffects.ts` |
| `setTimeout(() => setActiveCelebration(null), 3500);` | `src/hooks/useCelebrationEffects.ts` |
| `const sixtyDaysAgo = subDays(new Date(), 60);` | `src/hooks/useCloserMetrics.ts` |
| `staleTime: 10 * 60 * 1000,` | `src/hooks/useCloserMetrics.ts` |
| `staleTime: 30 * 60 * 1000,` | `src/hooks/useCloserMetrics.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/useCloserMetrics.ts` |
| `Math.ceil((exited.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24))` | `src/hooks/useClosingTime.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/useCoachingIntelligence.ts` |
| `staleTime: 10 * 60 * 1000,` | `src/hooks/useCompetencyData.ts` |
| `gcTime: 10 * 60 * 1000,` | `src/hooks/useCompetitiveRanking.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/useConversationalIntelligence.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/useCustomerSuccess.ts` |
| `const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);` | `src/hooks/useDealProbability.ts` |
| `durationHours = Math.round((exited - entered) / (1000 * 60 * 60));` | `src/hooks/useDealTimeline.ts` |
| `const last = subMonths(now, 1);` | `src/hooks/usePeriodTrend.ts` |
| `curr = new Date(curr.getTime() + 24 * 60 * 60 * 1000);` | `src/hooks/usePeriodTrend.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/usePeriodTrend.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/usePricingIntelligence.ts` |
| `staleTime: 1000 * 60 * 60, // 1 hour` | `src/hooks/useProductRecommendations.ts` |
| `return diff <= 3 * 24 * 60 * 60 * 1000; // ≤ 3 days (including expired)` | `src/hooks/useQuotes.ts` |
| `const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);` | `src/hooks/useRateLimit.ts` |
| `const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);` | `src/hooks/useRateLimit.ts` |
| `const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos` | `src/hooks/useReauthentication.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/useRevOpsHub.ts` |
| `const msPerDay = 24 * 60 * 60 * 1000;` | `src/hooks/useRunRateProjection.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/useRunRateProjection.ts` |
| `startDate = subDays(now, 7);` | `src/hooks/useSDRActivityTrend.ts` |
| `startDate = subMonths(now, 1);` | `src/hooks/useSDRActivityTrend.ts` |
| `startDate = subMonths(now, 3);` | `src/hooks/useSDRActivityTrend.ts` |
| `const ninetyDaysAgo = subDays(new Date(), 90);` | `src/hooks/useSDRMetrics.ts` |
| `const thirtyDaysAgo = subDays(new Date(), 30);` | `src/hooks/useSDRMetrics.ts` |
| `staleTime: 10 * 60 * 1000,` | `src/hooks/useSDRMetrics.ts` |
| `staleTime: 15 * 60 * 1000,` | `src/hooks/useSDRMetrics.ts` |
| `staleTime: 30 * 60 * 1000,` | `src/hooks/useSDRMetrics.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/useSDRMetrics.ts` |
| `const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);` | `src/hooks/useSecurityMonitoring.ts` |
| `? new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000)` | `src/hooks/useStockForecast.ts` |
| `const thirtyDaysAgo = subDays(new Date(), 30).toISOString();` | `src/hooks/useStockForecast.ts` |
| `const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');` | `src/hooks/useTeamAchievementStats.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/useTerritoryOptimization.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/useTrendsData.ts` |
| `const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });` | `src/hooks/useWeeklyComparison.ts` |
| `const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });` | `src/hooks/useWeeklyComparison.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/useWeeklyComparison.ts` |
| `(now - new Date(sale.created_at).getTime()) / (1000 * 60 * 60 * 24)` | `src/hooks/useWeightedForecast.ts` |
| `? Math.round((now - new Date(enteredAt).getTime()) / (1000 * 60 * 60 * 24))` | `src/hooks/useWeightedForecast.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/useWeightedForecast.ts` |
| `const sevenDaysAgo = startOfDay(subDays(new Date(), 7)).toISOString();` | `src/hooks/admin/useAdminStats.ts` |
| `expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),` | `src/hooks/admin/useApprovalWorkflows.ts` |
| `const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();` | `src/hooks/admin/useV4Callbacks.ts` |
| `const since = new Date(Date.now() - 24 * 60 * 60_000).toISOString();` | `src/hooks/admin/useV4Callbacks.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/assistant/useBriefingHistory.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/automation/useAutomationIntelligence.ts` |
| `gcTime: 10 * 60 * 1000,` | `src/hooks/automation/useAutomationRules.ts` |
| `const lastMonth = subMonths(now, 1);` | `src/hooks/bi/useBIFilters.ts` |
| `const lastYear = subYears(now, 1);` | `src/hooks/bi/useBIFilters.ts` |
| `const sixMonthsAgo = subMonths(now, 6);` | `src/hooks/bi/useBIFilters.ts` |
| `const weekEnd = endOfWeek(subWeeks(now, 1), { locale: ptBR });` | `src/hooks/bi/useBIFilters.ts` |
| `const weekStart = startOfWeek(subWeeks(now, 1), { locale: ptBR });` | `src/hooks/bi/useBIFilters.ts` |
| `const yesterday = subDays(now, 1);` | `src/hooks/bi/useBIFilters.ts` |
| `end: subYears(dateRange.end, 1),` | `src/hooks/bi/useBIFilters.ts` |
| `return { start: startOfMonth(sixMonthsAgo), end: endOfMonth(subMonths(now, 1)) };` | `src/hooks/bi/useBIFilters.ts` |
| `start: subYears(dateRange.start, 1),` | `src/hooks/bi/useBIFilters.ts` |
| `gcTime: 10 * 60 * 1000,` | `src/hooks/bi/useBITopClients.ts` |
| `return (b - a) / (1000 * 60 * 60 * 24);` | `src/hooks/cadences/useQuoteCadenceComparison.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/coaching/useCoachingImpact.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/coaching/useCoachingSessions.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/conversational/useCompetitorsRegistry.ts` |
| `(new Date().getTime() - lastPurchaseDate) / (1000 * 60 * 60 * 24);` | `src/hooks/crm/useClient360.ts` |
| `intervals.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));` | `src/hooks/crm/useClient360.ts` |
| `staleTime: 1000 * 60 * 60, // 1 hour` | `src/hooks/crm/useClientPredictions.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/customer-success/useCustomerSuccess360.ts` |
| `start = startDate ? parseISO(startDate) : subDays(now, 30);` | `src/hooks/customer-success/useFilteredCS360Data.ts` |
| `gcTime: 30 * 60 * 1000,` | `src/hooks/dashboard/useDashboardKPIs.ts` |
| `previousMonthEnd: endOfMonth(subMonths(now, 1)),` | `src/hooks/dashboard/useDashboardKPIs.ts` |
| `previousMonthStart: startOfMonth(subMonths(now, 1)),` | `src/hooks/dashboard/useDashboardKPIs.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/dashboard/useDashboardKPIs.ts` |
| `const last = subMonths(now, 1);` | `src/hooks/dashboard/useDashboardKPIsPeriod.ts` |
| `gcTime: 10 * 60 * 1000,` | `src/hooks/dashboard/useDashboardKPIsPeriod.ts` |
| `prevEnd: endOfMonth(subMonths(now, 1)),` | `src/hooks/dashboard/useDashboardKPIsPeriod.ts` |
| `prevEnd: endOfMonth(subMonths(now, 2)),` | `src/hooks/dashboard/useDashboardKPIsPeriod.ts` |
| `prevEnd: endOfWeek(subWeeks(now, 1), { locale: ptBR }),` | `src/hooks/dashboard/useDashboardKPIsPeriod.ts` |
| `prevEnd: endOfYear(subYears(now, 1)),` | `src/hooks/dashboard/useDashboardKPIsPeriod.ts` |
| `prevStart: startOfMonth(subMonths(now, 1)),` | `src/hooks/dashboard/useDashboardKPIsPeriod.ts` |
| `prevStart: startOfMonth(subMonths(now, 2)),` | `src/hooks/dashboard/useDashboardKPIsPeriod.ts` |
| `prevStart: startOfWeek(subWeeks(now, 1), { locale: ptBR }),` | `src/hooks/dashboard/useDashboardKPIsPeriod.ts` |
| `prevStart: startOfYear(subYears(now, 1)),` | `src/hooks/dashboard/useDashboardKPIsPeriod.ts` |
| `gcTime: 10 * 60 * 1000,` | `src/hooks/dashboard/useGoalsDashboard.ts` |
| `const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();` | `src/hooks/deal-intelligence/useCommitteeCoverage.ts` |
| `(exited.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24)` | `src/hooks/deal-intelligence/useDealAnalyticsVelocity.ts` |
| `Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))` | `src/hooks/deal-intelligence/useDealAnalyticsVelocity.ts` |
| `staleTime: 1000 * 60 * 60,` | `src/hooks/deal-intelligence/useDealAnalyticsVelocity.ts` |
| `staleTime: 2 * 60 * 1000,` | `src/hooks/follow-up/useFollowUpData.ts` |
| `gcTime: 10 * 60 * 1000,` | `src/hooks/gamification/useAchievements.ts` |
| `gcTime: 15 * 60 * 1000,` | `src/hooks/gamification/useAchievements.ts` |
| `staleTime: 5 * 60 * 1000, // Optimize: Ranking doesn't need to be hyper-reactive` | `src/hooks/gamification/useAchievements.ts` |
| `const prev = subMonths(now, 1);` | `src/hooks/gamification/useFuturisticRanking.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/gamification/useFuturisticRanking.ts` |
| `const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');` | `src/hooks/gamification/useGamificationData.ts` |
| `gcTime: 10 * 60 * 1000,` | `src/hooks/gamification/useSalespersonXP.ts` |
| `gcTime: 15 * 60 * 1000,` | `src/hooks/gamification/useSalespersonXP.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/gamification/useSalespersonXP.ts` |
| `Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))` | `src/hooks/gamification/useWeeklyChallenges.ts` |
| `gcTime: 15 * 60 * 1000,` | `src/hooks/notifications/useAlerts.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/notifications/useAlerts.ts` |
| `gcTime: 6 * 60 * 60_000,` | `src/hooks/purchase-intelligence/usePurchaseIntelligence.ts` |
| `staleTime: 4 * 60 * 60_000, // 4h` | `src/hooks/purchase-intelligence/usePurchaseIntelligence.ts` |
| `const t = window.setTimeout(() => { void trigger(); }, 1200);` | `src/hooks/race/useDailyRaceCheckin.ts` |
| `commentaryTimerRef.current = window.setTimeout(() => { setCommentary(cur => (cur?.id === line.id ? null : cur)); }, 3000);` | `src/hooks/race/useRaceCommentaryLogic.ts` |
| `cinematicTimerRef.current = window.setTimeout( () => setCinematicFocus(false), 1800` | `src/hooks/race/useRaceDetection.ts` |
| `fastestTimerRef.current = window.setTimeout(() => { setFlashSectorIdx(null); setFastestCarId(null); }, 2000);` | `src/hooks/race/useRaceDetection.ts` |
| `setTimeout(() => { setDustBursts(d => d.filter(b => !newDust.find(nb => nb.id === b.id))); }, 1200);` | `src/hooks/race/useRaceDetection.ts` |
| `if (msToEnd <= 0 \|\| msToEnd > 60 * 60 * 1000) return;` | `src/hooks/race/useRaceSmartNotifications.ts` |
| `fatigueThresholdMs = 10 * 60 * 1000,` | `src/hooks/race/useSessionDuration.ts` |
| `const twoHoursMs = 2 * 60 * 60 * 1000;` | `src/hooks/race/useTrackConditions.ts` |
| `gcTime: 10 * 60 * 1000,` | `src/hooks/reporting/useCohortRetention.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/reporting/useCohortRetention.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/reporting/useCustomReports.ts` |
| `const prevEnd = endOfWeek(subWeeks(refDate, 1), { weekStartsOn: 1 });` | `src/hooks/reports/useSalesReport.ts` |
| `const prevStart = startOfWeek(subWeeks(refDate, 1), { weekStartsOn: 1 });` | `src/hooks/reports/useSalesReport.ts` |
| `prevEnd: endOfMonth(subMonths(refDate, 1)),` | `src/hooks/reports/useSalesReport.ts` |
| `prevStart: startOfMonth(subMonths(refDate, 1)),` | `src/hooks/reports/useSalesReport.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/reports/useSalesReport.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/revenue/useRevenueHistory.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/revenue/useRevenueIntelligenceHub.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/revenue/useWinProbabilityCalibration.ts` |
| `(nowWeekStart.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)` | `src/hooks/sales/useSalesChartData.ts` |
| `gcTime: 10 * 60 * 1000,` | `src/hooks/sales/useSalesChartData.ts` |
| `const prevMonthEnd = endOfMonth(subMonths(now, 1));` | `src/hooks/sales/useSalesInsights.ts` |
| `const prevMonthStart = startOfMonth(subMonths(now, 1));` | `src/hooks/sales/useSalesInsights.ts` |
| `staleTime: 5 * 60 * 1000, // 5 minutes cache` | `src/hooks/sales/useSalesRealtime.ts` |
| `staleTime: 10 * 60 * 1000,` | `src/hooks/sales/useSalespeopleList.ts` |
| `staleTime: 10 * 60 * 1000,` | `src/hooks/sales/useSalespeopleMin.ts` |
| `(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)` | `src/hooks/sales/useSalespersonActivityReport.ts` |
| `const STALE_MS = 1000 * 60 * 60 * 6; // 6h` | `src/hooks/scoring/useLeadScoreExplanation.ts` |
| `setTimeout(() => qc.invalidateQueries({ queryKey: ['semantic-coverage'] }), 2500);` | `src/hooks/semantic/useReindexBatch.ts` |
| `const TTL_MS = 24 * 60 * 60 * 1000;` | `src/hooks/win-loss/useInsightExplanation.ts` |
| `(Date.now() - new Date(row.updated_at).getTime()) / (1000 * 60 * 60 * 24)` | `src/hooks/win-loss/useNextBestWinLossDeal.ts` |
| `filters.since ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();` | `src/hooks/win-loss/useWebhookAlertHistory.ts` |
| `const since = new Date(Date.now() - RECENT_HOURS * 60 * 60 * 1000).toISOString();` | `src/hooks/win-loss/useWebhookAlerts.ts` |
| `Date.now() - WINDOW_HOURS[windowKey] * 60 * 60 * 1000` | `src/hooks/win-loss/useWebhookAttemptSlice.ts` |
| `const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();` | `src/hooks/win-loss/useWebhookDeliveryStats.ts` |
| `const SELECTION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h` | `src/hooks/win-loss/useWebhookReplayPersistence.ts` |
| `Date.now() - WINDOW_HOURS[windowKey] * 60 * 60 * 1000` | `src/hooks/win-loss/useWebhookSubscriptionLatest.ts` |
| `const prevEnd = endOfMonth(subMonths(now, 1));` | `src/lib/generateMonthlyReport.ts` |
| `const prevStart = startOfMonth(subMonths(now, 1));` | `src/lib/generateMonthlyReport.ts` |
| `const CACHE_TTL_MS = 10 * 60 * 1000;` | `src/lib/stageProbabilities.ts` |
| `flushTimer = setTimeout(flushQueue, 5000);` | `src/lib/webVitals.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/pages/ArenaCompetitiva.tsx` |
| `const thirtyDaysAgo = getLocalISODate(subDays(new Date(), 30));` | `src/pages/HistoricoDesafiosDiarios.tsx` |
| `setTimeout(cb, 1500);` | `src/pages/Index.tsx` |
| `w.requestIdleCallback(cb, { timeout: 2500 });` | `src/pages/Index.tsx` |
| `setTimeout(() => setEmojiEffect(null), 1000);` | `src/pages/MetasAtividades.tsx` |
| `useSessionDuration({ fatigueThresholdMs: 10 * 60 * 1000, notify: true });` | `src/pages/RaceArenaHub.tsx` |
| `setTimeout(() => { setBoostingIds(prev => { const n = new Set(prev); n.delete(newest.salesperson_id); return n; }); }, 1500);` | `src/pages/RaceArenaView.tsx` |
| `from: subDays(new Date(), 30),` | `src/pages/Relatorios.tsx` |
| `staleTime: 5 * 60 * 1000,` | `src/pages/RelatoriosExecutivos.tsx` |
| `setTimeout(() => { navigate('/'); }, 2000);` | `src/pages/ResetPassword.tsx` |
| `const prevMonthEnd = endOfMonth(subMonths(new Date(), 1));` | `src/pages/VendedorDashboard.tsx` |
| `const prevMonthStart = startOfMonth(subMonths(new Date(), 1));` | `src/pages/VendedorDashboard.tsx` |
| `setTimeout(() => setPulse(false), 3000);` | `src/pages/WinLossIntelligence.tsx` |
| `since: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),` | `src/pages/admin/WebhookAlertHistoryPage.tsx` |
| `.gte('created_at', subMonths(now, 6).toISOString()),` | `src/services/biService.ts` |
| `const prevMonthEnd = endOfMonth(subMonths(now, 1));` | `src/services/biService.ts` |
| `const prevMonthStart = startOfMonth(subMonths(now, 1));` | `src/services/biService.ts` |
| `const thirtyDaysAgo = format(subDays(now, 30), 'yyyy-MM-dd');` | `src/services/biService.ts` |
| `const MS_PER_DAY = 1000 * 60 * 60 * 24;` | `supabase/functions/_shared/deal-probability-calc.ts` |
| `const DAY_MS = 1000 * 60 * 60 * 24;` | `supabase/functions/_shared/deal-probability-calc_test.ts` |
| `const CACHE_TTL_MS = 5 * 60 * 1000;` | `supabase/functions/_shared/stage-probabilities.ts` |
| `const MAX_SIGNATURE_AGE_MS = 5 * 60 * 1000;` | `supabase/functions/_shared/webhook-auth.ts` |
| `Date.now() + 6 * 60 * 1000,` | `supabase/functions/_shared/webhook-auth_test.ts` |
| `const since = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();` | `supabase/functions/analyze-win-loss/index.ts` |
| `.gte("updated_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())` | `supabase/functions/auto-enroll-cadence/index.ts` |
| `const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;` | `supabase/functions/bitrix24-oauth/index.ts` |
| `const PENDING_CLAIM_STALE_MS = 60 * 60 * 1000;` | `supabase/functions/bitrix24-sync/index.ts` |
| `const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;` | `supabase/functions/bitrix24-sync/index.ts` |
| `(now.getTime() - new Date(referenceTime).getTime()) / (1000 * 60 * 60)` | `supabase/functions/check-lead-sla/index.ts` |
| `const dayStart = new Date(now - 24 * 60 * 60_000).toISOString();` | `supabase/functions/check-v4-callback-alerts/index.ts` |
| `const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();` | `supabase/functions/coaching-session-prep/index.ts` |
| `(Date.now() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24)` | `supabase/functions/create-stagnant-tasks/index.ts` |
| `const days = Math.floor((new Date(accRenewal.renewal_date).getTime() - now) / (1000 * 60 * 60 * 24));` | `supabase/functions/customer-success-360/index.ts` |
| `const days = Math.floor((new Date(r.renewal_date).getTime() - now) / (1000 * 60 * 60 * 24));` | `supabase/functions/customer-success-360/index.ts` |
| `const daysSince = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));` | `supabase/functions/customer-success-hub/index.ts` |
| `expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),` | `supabase/functions/deal-risk-digest/index.ts` |
| `(1000 * 60 * 60 * 24)` | `supabase/functions/detect-at-risk-deals/index.ts` |
| `(1000 * 60 * 60)` | `supabase/functions/detect-at-risk-deals/index.ts` |
| `(now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)` | `supabase/functions/detect-at-risk-deals/index.ts` |
| `(now.getTime() - new Date(h.entered_at).getTime()) / (1000 * 60 * 60 * 24)` | `supabase/functions/detect-at-risk-deals/index.ts` |
| `(now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)` | `supabase/functions/detect-at-risk-deals/index.ts` |
| `const since = new Date(Date.now() - windowH * 60 * 60 * 1000).toISOString();` | `supabase/functions/edge-retry-threshold-alert/index.ts` |
| `const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();` | `supabase/functions/forecast-narrative/index.ts` |
| `const HIT_TTL_MS = 90 * 24 * 60 * 60 * 1000;` | `supabase/functions/geocode-proxy/index.ts` |
| `const MISS_TTL_MS = 14 * 24 * 60 * 60 * 1000;` | `supabase/functions/geocode-proxy/index.ts` |
| `const daysInPipeline = Math.floor((Date.now() - new Date(firstEntry.entered_at).getTime()) / (1000 * 60 * 60 * 24));` | `supabase/functions/lead-scoring/index.ts` |
| `const tasksSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();` | `supabase/functions/lead-scoring/index.ts` |
| `const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)` | `supabase/functions/pipeline-pulse-aggregator/index.ts` |
| `const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();` | `supabase/functions/pipeline-pulse-aggregator/index.ts` |
| `const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();` | `supabase/functions/process-race-event/index.ts` |
| `const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s cap` | `supabase/functions/race-commentary/index.ts` |
| `const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();` | `supabase/functions/recompute-stage-baselines/index.ts` |
| `const TTL_MS = 5 * 60 * 1000;` | `supabase/functions/semantic-search/index.ts` |
| `const TTL_MS = 2 * 60 * 1000;` | `supabase/functions/semantic-search-universal/index.ts` |
| `const VAPID_EXPIRATION_SECONDS = 12 * 60 * 60;` | `supabase/functions/send-push-notification/index.ts` |
| `const CLAIM_LEASE_MS = 5 * 60 * 1000;` | `supabase/functions/sequence-runner/index.ts` |
| `const DELIVERY_RETRY_MS = 15 * 60 * 1000;` | `supabase/functions/sequence-runner/index.ts` |
| … +147 linhas — lista completa em `context.json` | |

### H.3 Limites de paginação

| Limite | Arquivo |
|---|---|
| 50 | `src/components/admin/QuoteSyncLogsPanel.tsx` |
| 5000 | `src/components/admin/churn/ChurnHistoryChart.tsx` |
| 1 | `src/components/admin/connections/AutoTestIntervalCard.tsx` |
| 1 | `src/components/admin/connections/AutoTestJobStatusCard.tsx` |
| 100 | `src/components/admin/connections/EdgeRetryEventsPanel.tsx` |
| 1 | `src/components/admin/connections/FailureWindowCard.tsx` |
| 50 | `src/components/admin/connections/ForecastNarrativeDlqPanel.tsx` |
| 20 | `src/components/admin/connections/SlowQueryAlertsPanel.tsx` |
| 50 | `src/components/analytics/ClientHealthPanel.tsx` |
| 100 | `src/components/analytics/LeadSLAMonitor.tsx` |
| 3 | `src/components/analytics/WeightedForecastDashboard.tsx` |
| 20 | `src/components/analytics/useChurnPrediction.ts` |
| 50 | `src/components/assistant/DealContextSelector.tsx` |
| 1 | `src/components/assistant/DealPreviewCard.tsx` |
| 1 | `src/components/atoms/SystemHealthBadge.tsx` |
| 1 | `src/components/clients/ClientChurnJustificationCard.tsx` |
| 100 | `src/components/clients/ClientTimeline.tsx` |
| 10 | `src/components/competitive/EnhancedTVMode.tsx` |
| 20 | `src/components/dashboard/FuturisticSpeedometerDashboard.tsx` |
| 20 | `src/components/dashboard/IntegrationStatusPanel.tsx` |
| 30 | `src/components/dashboard/IntegrationStatusPanel.tsx` |
| 5 | `src/components/dashboard/RecentDeals.tsx` |
| 5 | `src/components/dashboard/widgets/CalendarPreviewWidget.tsx` |
| 6 | `src/components/dashboard/widgets/RecentActivitiesWidget.tsx` |
| 5 | `src/components/dashboard/widgets/TopDealsWidget.tsx` |
| 1 | `src/components/dialer/CurrentCallCard.tsx` |
| 4 | `src/components/intelligence/ActivityPulse.tsx` |
| 100 | `src/components/molecules/GlobalSearch.tsx` |
| 100 | `src/components/purchase-intelligence/ClientSelector.tsx` |
| 100 | `src/components/race/admin/RaceAuditFeed.tsx` |
| 1 | `src/components/reports/EmailReportConfig.tsx` |
| 50 | `src/components/sales/cadence/RuleAuditLogs.tsx` |
| 1 | `src/components/sdr/LeadScoreBreakdown.tsx` |
| 6 | `src/components/sdr/RecentProspects.tsx` |
| 1 | `src/components/sdr/SDRAlertHistory.tsx` |
| 50 | `src/components/sdr/SDRAlertHistory.tsx` |
| 3 | `src/components/sdr/SDRIntelligenceHighlights.tsx` |
| 1000 | `src/components/sdr/SDRSequenceOrchestrator.tsx` |
| 50 | `src/components/security/GeoBlockingManager.tsx` |
| 100 | `src/components/settings/AccessDeniedLogs.tsx` |
| 100 | `src/components/settings/SecurityAlertHistory.tsx` |
| 1 | `src/components/settings/SecurityAlertSettings.tsx` |
| 1 | `src/components/win-loss/WinLossLastRunCard.tsx` |
| 20 | `src/hooks/useBitrix24.ts` |
| 10 | `src/hooks/useCloserMetrics.ts` |
| 500 | `src/hooks/useCommissionBonusAwards.ts` |
| 200 | `src/hooks/useCompetencyData.ts` |
| 500 | `src/hooks/useCompetencyData.ts` |
| 50 | `src/hooks/useCompetitiveChat.ts` |
| 20 | `src/hooks/useDealChatHistory.ts` |
| 100 | `src/hooks/useDemandForecast.ts` |
| 1 | `src/hooks/useDigitalSignatures.ts` |
| 200 | `src/hooks/useEmailTracking.ts` |
| 1 | `src/hooks/useICPConfig.ts` |
| 30 | `src/hooks/useKudos.ts` |
| 50 | `src/hooks/useLeadRouting.ts` |
| 1 | `src/hooks/useMicroGoals.ts` |
| 200 | `src/hooks/useMultichannel.ts` |
| 200 | `src/hooks/useNPSSurveys.ts` |
| 20 | `src/hooks/useNextBestAction.ts` |
| 30 | `src/hooks/useNextBestAction.ts` |
| 1 | `src/hooks/useOnboardingChecklist.ts` |
| 1 | `src/hooks/usePermissions.ts` |
| 100 | `src/hooks/usePriceHistory.ts` |
| 50 | `src/hooks/usePriceHistory.ts` |
| 3 | `src/hooks/useProductRecommendations.ts` |
| 500 | `src/hooks/useQuotes.ts` |
| 20 | `src/hooks/useRankNotifications.ts` |
| 1 | `src/hooks/useRankingNotifications.ts` |
| 4 | `src/hooks/useReportData.ts` |
| 1000 | `src/hooks/useSDRMetrics.ts` |
| 100 | `src/hooks/useSLATracking.ts` |
| 1 | `src/hooks/useUserRoles.ts` |
| 50 | `src/hooks/useWebhooks.ts` |
| 20 | `src/hooks/useWorkflows.ts` |
| 1 | `src/hooks/admin/useAdminStats.ts` |
| 10 | `src/hooks/admin/useAdminStats.ts` |
| 5 | `src/hooks/admin/useAdminStats.ts` |
| 10 | `src/hooks/admin/useUsageAnalytics.ts` |
| 100 | `src/hooks/admin/useV4Callbacks.ts` |
| 200 | `src/hooks/admin/useV4Callbacks.ts` |
| 7 | `src/hooks/admin/useV4Callbacks.ts` |
| 30 | `src/hooks/assistant/useBriefingHistory.ts` |
| 20 | `src/hooks/automation/useAutomationWorkflows.ts` |
| 500 | `src/hooks/bi/useBICloser.ts` |
| 10 | `src/hooks/bi/useBISDR.ts` |
| 10 | `src/hooks/bi/useClientSearch.ts` |
| 5000 | `src/hooks/bi/useMarkupOverview.ts` |
| 500 | `src/hooks/coaching/useCoachingOpportunities.ts` |
| 100 | `src/hooks/coaching/useCoachingSessions.ts` |
| 1000 | `src/hooks/coaching/useSkillGapAnalyzer.ts` |
| 500 | `src/hooks/coaching/useSkillGapAnalyzer.ts` |
| 50 | `src/hooks/conversational/useConversationMetrics.ts` |
| 1000 | `src/hooks/crm/useDeduplicationScan.ts` |
| 50 | `src/hooks/deal-intelligence/useCommitteeCoverage.ts` |
| 100 | `src/hooks/deal-intelligence/useDealHealth.ts` |
| 30 | `src/hooks/deal-intelligence/useDealHealth.ts` |
| 20 | `src/hooks/deal-intelligence/useWinLoss.ts` |
| 200 | `src/hooks/deal-intelligence/useWinLoss.ts` |
| 1 | `src/hooks/dialer/useClickToCall.ts` |
| 5 | `src/hooks/dialer/usePowerDialer.ts` |
| 50 | `src/hooks/engagement/useBulkComposer.ts` |
| 1 | `src/hooks/executive-briefing/useLatestBriefing.ts` |
| 10 | `src/hooks/gamification/usePrizeWheel.ts` |
| 100 | `src/hooks/orders/useOrderTracking.ts` |
| 1 | `src/hooks/pipeline-pulse/useQuickAction.ts` |
| 10 | `src/hooks/race/useGhostCar.ts` |
| 1 | `src/hooks/race/useMonthlyChampion.ts` |
| 30 | `src/hooks/race/useRaceEvents.ts` |
| 200 | `src/hooks/race/useRaceReactions.ts` |
| 1 | `src/hooks/race/useRaceSeason.ts` |
| 1 | `src/hooks/race/useRaceSeasonByRole.ts` |
| 50 | `src/hooks/reporting/useScheduledReportRuns.ts` |
| 200 | `src/hooks/revenue/useQuotaAttainment.ts` |
| 50 | `src/hooks/revenue/useQuotaAttainment.ts` |
| 200 | `src/hooks/revenue/useQuotaAttainmentPredictor.ts` |
| 20 | `src/hooks/revenue/useRevenueIntelligenceHub.ts` |
| 500 | `src/hooks/revenue/useWinProbabilityCalibration.ts` |
| 200 | `src/hooks/sales/useSalesAssistant.ts` |
| 50 | `src/hooks/sales/useSalesAssistant.ts` |
| 10 | `src/hooks/sales/useSalesBattles.ts` |
| 1 | `src/hooks/scoring/useLeadScoringMetrics.ts` |
| 200 | `src/hooks/sequences/useSendTimeOptimization.ts` |
| 2000 | `src/hooks/tasks/useTaskQueries.ts` |
| 500 | `src/hooks/win-loss/useDeadLetterErrorGroups.ts` |
| 100 | `src/hooks/win-loss/useInsightsImpact.ts` |
| 1 | `src/hooks/win-loss/useNextBestWinLossDeal.ts` |
| 2000 | `src/hooks/win-loss/usePreviousPeriodKpis.ts` |
| 50 | `src/hooks/win-loss/useReplayAudit.ts` |
| 500 | `src/hooks/win-loss/useReplayAudit.ts` |
| 2000 | `src/hooks/win-loss/useScriptABTest.ts` |
| 200 | `src/hooks/win-loss/useWebhookAlerts.ts` |
| 50 | `src/hooks/win-loss/useWebhookAlerts.ts` |
| 100 | `src/hooks/win-loss/useWebhookDeadLetters.ts` |
| 2000 | `src/hooks/win-loss/useWebhookDeliveryStats.ts` |
| 2000 | `src/hooks/win-loss/useWebhookSubscriptionLatest.ts` |
| 2000 | `src/hooks/win-loss/useWinByHourMatrix.ts` |
| 2000 | `src/hooks/win-loss/useWinLossData.ts` |
| 500 | `src/hooks/win-loss/useWinLossData.ts` |
| 10 | `src/lib/generateMonthlyReport.ts` |
| 20 | `src/pages/AdminAlertasChurn.tsx` |
| 10000 | `src/pages/AdminSupressaoEmails.tsx` |
| 500 | `src/pages/AdminTelemetria.tsx` |
| 100 | `src/pages/FollowUpAudit.tsx` |
| 20 | `src/pages/RankingCompetitivo.tsx` |
| 50 | `src/pages/TeamActivityFeed.tsx` |
| 50 | `src/pages/admin/AdminComercial.tsx` |
| 100 | `src/pages/admin/AdminQuoteConversionsPage.tsx` |
| 30 | `src/pages/admin/AdminQuoteConversionsPage.tsx` |
| 100 | `src/pages/admin/AdminQuoteSyncInboundPage.tsx` |
| 10 | `src/services/biService.ts` |
| 100 | `src/services/biService.ts` |
| 10 | `src/services/clientService.ts` |
| 1000 | `src/services/clientService.ts` |
| 100 | `src/services/salesService.ts` |
| 1 | `supabase/functions/access-denied-alerts/index.ts` |
| 100 | `supabase/functions/access-denied-alerts/index.ts` |
| 10000 | `supabase/functions/access-denied-alerts/index.ts` |
| 500 | `supabase/functions/account-engagement-aggregator/index.ts` |
| 1 | `supabase/functions/activity-goal-alerts/index.ts` |
| 500 | `supabase/functions/activity-goal-alerts/index.ts` |
| 50000 | `supabase/functions/activity-goal-alerts/index.ts` |
| 1000 | `supabase/functions/aggregate-coaching-scorecard/index.ts` |
| 2000 | `supabase/functions/aggregate-coaching-scorecard/index.ts` |
| 500 | `supabase/functions/aggregate-coaching-scorecard/index.ts` |
| 3 | `supabase/functions/ai-copilot/index.ts` |
| 5 | `supabase/functions/ai-copilot/index.ts` |
| 1 | `supabase/functions/ai-email-composer/index.ts` |
| 10000 | `supabase/functions/analyze-pipeline-coverage/index.ts` |
| 5000 | `supabase/functions/analyze-pipeline-coverage/index.ts` |
| 500 | `supabase/functions/analyze-skill-gaps/index.ts` |
| 50000 | `supabase/functions/analyze-skill-gaps/index.ts` |
| 50000 | `supabase/functions/analyze-stage-conversion/index.ts` |
| 500 | `supabase/functions/analyze-win-loss/index.ts` |
| 200 | `supabase/functions/auto-enroll-cadence/index.ts` |
| 100 | `supabase/functions/auto-reassign-inactive/index.ts` |
| 10000 | `supabase/functions/auto-reassign-inactive/index.ts` |
| 2000 | `supabase/functions/auto-reassign-inactive/index.ts` |
| 500 | `supabase/functions/auto-reassign-inactive/index.ts` |
| 5000 | `supabase/functions/auto-reassign-inactive/index.ts` |
| 1000 | `supabase/functions/automation-suggestions/index.ts` |
| 10000 | `supabase/functions/automation-suggestions/index.ts` |
| 50 | `supabase/functions/automation-suggestions/index.ts` |
| 1000 | `supabase/functions/bitrix24-sync/index.ts` |
| 50 | `supabase/functions/bitrix24-sync/index.ts` |
| 500 | `supabase/functions/broadcast-sale-notification/index.ts` |
| 50000 | `supabase/functions/broadcast-sale-notification/index.ts` |
| 200 | `supabase/functions/calculate-committee-coverage/index.ts` |
| 1 | `supabase/functions/calculate-deal-health/index.ts` |
| 100 | `supabase/functions/calculate-deal-health/index.ts` |
| 50 | `supabase/functions/calculate-deal-health/index.ts` |
| 50000 | `supabase/functions/calibrate-win-probability/index.ts` |
| 10000 | `supabase/functions/campaign-health-alert/index.ts` |
| 200 | `supabase/functions/campaign-health-alert/index.ts` |
| 5000 | `supabase/functions/campaign-health-alert/index.ts` |
| 500 | `supabase/functions/challenge-expiration-alerts/index.ts` |
| 10000 | `supabase/functions/check-lead-sla/index.ts` |
| 50000 | `supabase/functions/check-lead-sla/index.ts` |
| 1000 | `supabase/functions/check-quote-expiration/index.ts` |
| 200 | `supabase/functions/coaching-impact-summary/index.ts` |
| 10000 | `supabase/functions/coaching-intelligence/index.ts` |
| 500 | `supabase/functions/coaching-intelligence/index.ts` |
| 5000 | `supabase/functions/coaching-intelligence/index.ts` |
| 50000 | `supabase/functions/coaching-intelligence/index.ts` |
| 10 | `supabase/functions/coaching-session-prep/index.ts` |
| 500 | `supabase/functions/coaching-session-prep/index.ts` |
| 5000 | `supabase/functions/coaching-session-prep/index.ts` |
| 1000 | `supabase/functions/compute-forecast-accuracy/index.ts` |
| 500 | `supabase/functions/compute-forecast-accuracy/index.ts` |
| 50000 | `supabase/functions/compute-forecast-accuracy/index.ts` |
| 200 | `supabase/functions/conversational-intelligence/index.ts` |
| 1 | `supabase/functions/create-stagnant-tasks/index.ts` |
| 5000 | `supabase/functions/create-stagnant-tasks/index.ts` |
| 100 | `supabase/functions/cron-failure-alerter/index.ts` |
| 1 | `supabase/functions/csat-ces-trigger/index.ts` |
| 100 | `supabase/functions/customer-success-360/index.ts` |
| 200 | `supabase/functions/customer-success-360/index.ts` |
| 500 | `supabase/functions/customer-success-360/index.ts` |
| 100 | `supabase/functions/customer-success-hub/index.ts` |
| 2000 | `supabase/functions/deal-risk-digest/index.ts` |
| 1 | `supabase/functions/demand-forecast/index.ts` |
| 2000 | `supabase/functions/demand-forecast/index.ts` |
| 50000 | `supabase/functions/demand-forecast/index.ts` |
| 100 | `supabase/functions/detect-at-risk-deals/index.ts` |
| 500 | `supabase/functions/detect-at-risk-deals/index.ts` |
| 1 | `supabase/functions/detect-client-churn-alerts/index.ts` |
| 10000 | `supabase/functions/detect-coaching-opportunities/index.ts` |
| 500 | `supabase/functions/detect-coaching-opportunities/index.ts` |
| 50000 | `supabase/functions/detect-coaching-opportunities/index.ts` |
| 200 | `supabase/functions/detect-competitor-mentions/index.ts` |
| 80 | `supabase/functions/detect-critical-moments/index.ts` |
| 5000 | `supabase/functions/detect-stuck-deals/index.ts` |
| 100 | `supabase/functions/detect-winloss-at-risk/index.ts` |
| 300 | `supabase/functions/detect-winloss-at-risk/index.ts` |
| 500 | `supabase/functions/dialer-queue-builder/index.ts` |
| 100 | `supabase/functions/dispatch-webhook/index.ts` |
| 5000 | `supabase/functions/edge-retry-threshold-alert/index.ts` |
| 10000 | `supabase/functions/email-bulk-send/index.ts` |
| 3 | `supabase/functions/email-composer-bulk/index.ts` |
| 5000 | `supabase/functions/email-engagement-scorer/index.ts` |
| 200 | `supabase/functions/expansion-detector/index.ts` |
| 2000 | `supabase/functions/expansion-detector/index.ts` |
| 5000 | `supabase/functions/expansion-detector/index.ts` |
| 500 | `supabase/functions/export-winloss-pdf/index.ts` |
| 500 | `supabase/functions/extract-committee-from-call/index.ts` |
| 500 | `supabase/functions/extract-deal-stakeholders/index.ts` |
| 7 | `supabase/functions/generate-executive-briefing/index.ts` |
| 10000 | `supabase/functions/generate-revenue-forecast/index.ts` |
| 5000 | `supabase/functions/generate-revenue-forecast/index.ts` |
| 1 | `supabase/functions/helpdesk-sync/index.ts` |
| 1 | `supabase/functions/inbound-email-webhook/index.ts` |
| 2000 | `supabase/functions/lead-scoring/index.ts` |
| 5000 | `supabase/functions/mine-win-loss-patterns/index.ts` |
| 100 | `supabase/functions/new-device-alert/index.ts` |
| 1 | `supabase/functions/next-best-action/index.ts` |
| 10 | `supabase/functions/next-best-action/index.ts` |
| 15 | `supabase/functions/next-best-action/index.ts` |
| 20 | `supabase/functions/next-best-action/index.ts` |
| 25 | `supabase/functions/next-best-action/index.ts` |
| 5000 | `supabase/functions/nlq-query/queryResolvers.ts` |
| 500 | `supabase/functions/notify-ranking-position/index.ts` |
| 50000 | `supabase/functions/notify-ranking-position/index.ts` |
| 1 | `supabase/functions/onboarding-launcher/index.ts` |
| 1000 | `supabase/functions/onboarding-launcher/index.ts` |
| 1 | `supabase/functions/personal-assistant-stream/index.ts` |
| 20 | `supabase/functions/personal-assistant-stream/index.ts` |
| 3 | `supabase/functions/personal-assistant-stream/index.ts` |
| 500 | `supabase/functions/personal-assistant-stream/index.ts` |
| 1000 | `supabase/functions/pipeline-pulse-aggregator/index.ts` |
| 200 | `supabase/functions/pipeline-pulse-aggregator/index.ts` |
| 500 | `supabase/functions/pipeline-pulse-aggregator/index.ts` |
| 1 | `supabase/functions/predict-deal-velocity/index.ts` |
| 10000 | `supabase/functions/predict-quota-attainment/index.ts` |
| 500 | `supabase/functions/predict-quota-attainment/index.ts` |
| 5000 | `supabase/functions/predict-quota-attainment/index.ts` |
| 1000 | `supabase/functions/predictive-intelligence/index.ts` |
| 500 | `supabase/functions/predictive-intelligence/index.ts` |
| 5000 | `supabase/functions/predictive-scoring-explain/index.ts` |
| 500 | `supabase/functions/pricing-intelligence/index.ts` |
| 5000 | `supabase/functions/pricing-intelligence/index.ts` |
| 1 | `supabase/functions/process-race-event/index.ts` |
| 3 | `supabase/functions/process-race-event/index.ts` |
| 50 | `supabase/functions/process-scheduled-sends/index.ts` |
| 10000 | `supabase/functions/qbr-generator/index.ts` |
| 200 | `supabase/functions/qbr-scheduler/index.ts` |
| 100 | `supabase/functions/ranking-api/index.ts` |
| 200 | `supabase/functions/ranking-api/index.ts` |
| 500 | `supabase/functions/ranking-api/index.ts` |
| 50000 | `supabase/functions/recompute-stage-baselines/index.ts` |
| 1000 | `supabase/functions/renewal-automation/index.ts` |
| 500 | `supabase/functions/report-embed-public/index.ts` |
| 500 | `supabase/functions/revenue-forecast-ai/index.ts` |
| 200 | `supabase/functions/revenue-intelligence/index.ts` |
| 5000 | `supabase/functions/revenue-intelligence/index.ts` |
| 10000 | `supabase/functions/revops-hub/index.ts` |
| 5000 | `supabase/functions/revops-hub/index.ts` |
| 50000 | `supabase/functions/revops-hub/index.ts` |
| 100 | `supabase/functions/rotate-daily-challenges/index.ts` |
| 10 | `supabase/functions/sales-assistant-chat/index.ts` |
| 10000 | `supabase/functions/sales-assistant-chat/index.ts` |
| … +34 linhas — lista completa em `context.json` | |

## I. Regras implícitas em mensagens de erro/validação

| Mensagem | Arquivo |
|---|---|
| Esta reprodução exige o runtime real Graphify 0.9.48 instalado na raiz informada. | `docs/graphify/revisao-20260911/reproduzir.mjs` |
| falha fixture | `scripts/automation.unit.mjs` |
| protocolo inválido: ${parsedUrl.protocol} | `scripts/e2e-precheck.mjs` |
| no sales | `scripts/seed-fake-data.ts` |
| Nenhum vendedor real encontrado. Rode seed-real-people.ts primeiro. | `scripts/seed-race-cars.ts` |
| ${msg}: esperado ${JSON.stringify(b)} obtido ${JSON.stringify(a)} | `scripts/ai-context/cenarios.mjs` |
| Artifact-id sem arquivo correspondente | `scripts/ci/contexto-publicacao.unit.mjs` |
| Download simulado falhou: ${failDownload} | `scripts/ci/contexto-publicacao.unit.mjs` |
| ${key} é obrigatório. | `scripts/graphify/catalog-adapter.mjs` |
| ${label} ausente ou inválido. | `scripts/graphify/catalog-adapter.mjs` |
| --out deve ser JSON novo dentro de .graphify-local/. | `scripts/graphify/catalog-adapter.mjs` |
| Catálogo bruto inválido. | `scripts/graphify/catalog-adapter.mjs` |
| Catálogo contém ${label} inválido ou duplicado. | `scripts/graphify/catalog-adapter.mjs` |
| O adaptador aceita apenas metadados, nunca linhas de negócio. | `scripts/graphify/catalog-adapter.mjs` |
| O catálogo precisa declarar sessão somente leitura. | `scripts/graphify/catalog-adapter.mjs` |
| Projeto do catálogo não confere com o projeto esperado. | `scripts/graphify/catalog-adapter.mjs` |
| Reconciliação exige catálogo íntegro e verificado por coletor RO confiável. | `scripts/graphify/catalog-adapter.mjs` |
| ${flag} é obrigatório. | `scripts/graphify/docs-index.mjs` |
| --out deve ser JSON novo dentro de .graphify-local/. | `scripts/graphify/docs-index.mjs` |
| Diretório de documentação fora do repositório. | `scripts/graphify/docs-index.mjs` |
| Documentação contém link simbólico: ${entryPath} | `scripts/graphify/docs-index.mjs` |
| ${flag} deve receber um inteiro entre 1 e ${maximum}. | `scripts/graphify/graphify-utils.mjs` |
| ${flag} deve receber um inteiro positivo. | `scripts/graphify/graphify-utils.mjs` |
| --out deve apontar para um diretório novo dentro de .graphify-local/. | `scripts/graphify/graphify-utils.mjs` |
| --out não pode atravessar link simbólico ou arquivo. | `scripts/graphify/graphify-utils.mjs` |
| --out não pode atravessar link simbólico. | `scripts/graphify/graphify-utils.mjs` |
| --out possui um ancestral que não é diretório. | `scripts/graphify/graphify-utils.mjs` |
| Arquivo do escopo excede o limite de ${maximumFileBytes} bytes. | `scripts/graphify/graphify-utils.mjs` |
| Diretório de staging fora de .graphify-local/. | `scripts/graphify/graphify-utils.mjs` |
| Diretório de staging inválido. | `scripts/graphify/graphify-utils.mjs` |
| Escopo contém arquivo sensível e não pode ser analisado. | `scripts/graphify/graphify-utils.mjs` |
| Escopo contém entrada não regular: ${entryPath} | `scripts/graphify/graphify-utils.mjs` |
| Escopo contém link simbólico: ${entryPath} | `scripts/graphify/graphify-utils.mjs` |
| Escopo deve ser arquivo regular ou diretório. | `scripts/graphify/graphify-utils.mjs` |
| Escopo excede o limite total de ${maximumTotalBytes} bytes. | `scripts/graphify/graphify-utils.mjs` |
| Escopo não pode ser link simbólico. | `scripts/graphify/graphify-utils.mjs` |
| Já existe conteúdo neste --out; use um destino novo. | `scripts/graphify/graphify-utils.mjs` |
| graph.json contém aresta com endpoint ausente. | `scripts/graphify/graphify-utils.mjs` |
| graph.json contém aresta sem relação declarada. | `scripts/graphify/graphify-utils.mjs` |
| graph.json contém aresta sem source/target textual. | `scripts/graphify/graphify-utils.mjs` |
| graph.json contém id de nó duplicado: ${node.id} | `scripts/graphify/graphify-utils.mjs` |
| graph.json contém nível de confiança inválido. | `scripts/graphify/graphify-utils.mjs` |
| graph.json contém nó sem id textual. | `scripts/graphify/graphify-utils.mjs` |
| graph.json deve conter arrays nodes e edges. | `scripts/graphify/graphify-utils.mjs` |
| graph.json não contém um objeto JSON. | `scripts/graphify/graphify-utils.mjs` |
| graph.json não pode estar vazio. | `scripts/graphify/graphify-utils.mjs` |
| Árvore contém link simbólico ou entrada especial. | `scripts/graphify/graphify-utils.mjs` |
| É exigido graphify ${expectedVersion}; versão encontrada: ${found ??  | `scripts/graphify/graphify-utils.mjs` |
| --changed exige ao menos um id de nó. | `scripts/graphify/impact-report.mjs` |
| --snapshot exige um caminho. | `scripts/graphify/impact-report.mjs` |
| Escopo do snapshot não está disponível neste checkout. | `scripts/graphify/impact-report.mjs` |
| Há ids alterados que não existem no snapshot. Execute a suíte completa e gere um snapshot novo. | `scripts/graphify/impact-report.mjs` |
| Informe ${flag} <valor>. | `scripts/graphify/impact-report.mjs` |
| Não foi possível validar o estado Git atual. | `scripts/graphify/impact-report.mjs` |
| Snapshot está obsoleto para este checkout; gere uma nova extração ou use --allow-stale com suíte completa. | `scripts/graphify/impact-report.mjs` |
| multigraph.json ausente; impacto exige geração identificada. | `scripts/graphify/impact-report.mjs` |
| multigraph.json não confere com snapshot.json. | `scripts/graphify/impact-report.mjs` |
| snapshot.json ausente; impacto exige geração identificada. | `scripts/graphify/impact-report.mjs` |
| snapshot.json não informa escopo de origem. | `scripts/graphify/impact-report.mjs` |
| multigraph.json contém aresta inválida ou duplicada. | `scripts/graphify/multigraph.mjs` |
| multigraph.json contém nó inválido ou duplicado. | `scripts/graphify/multigraph.mjs` |
| multigraph.json contém relação sem endpoints ou tipo válido. | `scripts/graphify/multigraph.mjs` |
| multigraph.json não atende ao esquema suportado. | `scripts/graphify/multigraph.mjs` |
| multigraph.json perdeu relações da fonte. | `scripts/graphify/multigraph.mjs` |
| ${flag} é obrigatório. | `scripts/graphify/reconcile-catalog.mjs` |
| --out deve ser JSON novo dentro de .graphify-local/. | `scripts/graphify/reconcile-catalog.mjs` |
| --out deve ser um JSON dentro de .graphify-local/. | `scripts/graphify/static-contracts.mjs` |
| Execute o comando dentro de um repositório Git. | `scripts/graphify/static-contracts.mjs` |
| Informe --out <arquivo-relativo-em-.graphify-local>. | `scripts/graphify/static-contracts.mjs` |
| Artefato recusado por ${signals.join( | `scripts/graphify/verify-output.mjs` |
| Informe ${flag} <caminho>. | `scripts/graphify/verify-output.mjs` |
| ${arquivo} sem o bloco public.Tables | `scripts/inventario/gerar-banco.mjs` |
| --entrada exige o caminho do arquivo com a resposta do banco.sql | `scripts/inventario/gerar-banco.mjs` |
| Management API ${caminho} respondeu HTTP ${res.status} | `scripts/inventario/gerar-banco.mjs` |
| SUPABASE_PROJECT_REF=${ref} nao e o banco oficial (${PROJETO_OFICIAL}). | `scripts/inventario/gerar-banco.mjs` |
| a resposta nao parece ser do banco oficial: ${comuns} tabelas em comum com src/integrations/supabase/types.ts  | `scripts/inventario/gerar-banco.mjs` |
| a resposta nao parece ser do banco oficial: ledger com ${registros} registros e maior versao ${max};  | `scripts/inventario/gerar-banco.mjs` |
| a resposta nao parece ser do banco oficial: ledger com ${registros} registros;  | `scripts/inventario/gerar-banco.mjs` |
| a resposta nao traz resumo.ledger_versao_max/ledger_registros; rode o banco.sql atual. | `scripts/inventario/gerar-banco.mjs` |
| a saida tem algo com cara de credencial; nada foi gravado. Revise banco.sql. | `scripts/inventario/gerar-banco.mjs` |
| entrada sem as chaves: ${faltando.join( | `scripts/inventario/gerar-banco.mjs` |
| entrada sem tabelas | `scripts/inventario/gerar-banco.mjs` |
| format_version ${dado.format_version} desconhecido (esperado 1) | `scripts/inventario/gerar-banco.mjs` |
| sem --entrada e sem SUPABASE_ACCESS_TOKEN: nada para ler (veja o cabecalho do script). | `scripts/inventario/gerar-banco.mjs` |
| ripgrep (rg) falhou com exit ${status}; o inventário não foi gerado. | `scripts/inventario/gerar-repo.mjs` |
| ripgrep (rg) não encontrado; o inventário não pode ser gerado com segurança. | `scripts/inventario/gerar-repo.mjs` |
| ${name} é obrigatório. Defina-o no ambiente ou no gerenciador de segredos antes de executar este script. | `scripts/lib/requireSupabaseAdminEnv.ts` |
| Este script pode alterar dados. Defina CONFIRM_SUPABASE_ADMIN_WRITE=EXECUTAR_ESCRITA_ADMINISTRATIVA somente após confirmar o projeto, o escopo e o backup. | `scripts/lib/requireSupabaseAdminEnv.ts` |
| SUPABASE_URL precisa ser uma URL HTTP(S) válida. | `scripts/lib/requireSupabaseAdminEnv.ts` |
| SUPABASE_URL precisa usar HTTPS; HTTP é aceito somente para um Supabase local em loopback. | `scripts/lib/requireSupabaseAdminEnv.ts` |
| caminho de  | `scripts/lib/seguranca-processo.mjs` |
| comando nao encontrado no PATH:  | `scripts/lib/seguranca-processo.mjs` |
| failed | `scripts/maintenance/lib.mjs` |
| missing_dependencies | `scripts/maintenance/lib.mjs` |
| skipped_busy | `scripts/maintenance/lib.mjs` |
| formatter fixture failed | `scripts/maintenance/maintenance.unit.mjs` |
| blocked_network_sandbox | `scripts/maintenance/run.mjs` |
| pending_patch | `scripts/maintenance/run.mjs` |
| O teste offline não permite consultas ao banco | `scripts/supabase_snapshot/test_snapshot.py` |
| banco indisponível na fixture | `scripts/supabase_snapshot/test_snapshot.py` |
| catálogo indisponível na fixture | `scripts/supabase_snapshot/test_snapshot.py` |
| permission denied for schema auth | `scripts/supabase_snapshot/test_snapshot.py` |
| relation  | `scripts/supabase_snapshot/test_snapshot.py` |
| statement timeout simulado | `scripts/supabase_snapshot/test_snapshot.py` |
| view removida depois da consulta ao catálogo | `scripts/supabase_snapshot/test_snapshot.py` |
| view sem permissão na fixture | `scripts/supabase_snapshot/test_snapshot.py` |
| candidato com ${Buffer.byteLength(candidato)} bytes (< ${TAMANHO_MINIMO}): geração vazia ou quebrada | `scripts/types-sync/validar.mjs` |
| candidato sem o bloco public.Tables | `scripts/types-sync/validar.mjs` |
| candidato tem só ${comuns} de ${tabAtuais.length} tabelas atuais: parece outro projeto, nada substituído | `scripts/types-sync/validar.mjs` |
| uso: validar.mjs <candidato.ts> [--atual <types.ts>] [--resumo <saida.md>] | `scripts/types-sync/validar.mjs` |
| Erro na operação | `src/App.tsx` |
|  className= | `src/main.tsx` |
| Root element not found | `src/main.tsx` |
| Cliente sem telefone cadastrado | `src/components/activities/ActivityLogForm.tsx` |
| Erro ao salvar: Ocorreu um erro ao tentar salvar suas configurações. | `src/components/activities/SDRAlertSettings.tsx` |
| Erro ao executar automação | `src/components/admin/BackendAutomationMonitor.tsx` |
| Falha:  | `src/components/admin/ExternalDBSettings.tsx` |
| )         .gte( | `src/components/admin/churn/ChurnHistoryChart.tsx` |
| Falha ao carregar jobs em dead-letter | `src/components/admin/connections/DeadLetterIngestPanel.tsx` |
| Falha ao reenfileirar | `src/components/admin/connections/DeadLetterIngestPanel.tsx` |
| Job não encontrado ou já reprocessado | `src/components/admin/connections/DeadLetterIngestPanel.tsx` |
| Circuit breaker do Slack aberto — alerta suprimido | `src/components/admin/connections/EdgeRetryThresholdCard.tsx` |
| Falha ao executar: ${(e as Error).message} | `src/components/admin/connections/EdgeRetryThresholdCard.tsx` |
| Slack indisponível: ${result.reason} | `src/components/admin/connections/EdgeRetryThresholdCard.tsx` |
|                aria-live= | `src/components/admin/connections/IntegrationHealthCard.tsx` |
| ; import {   Tooltip,   TooltipContent,   TooltipProvider,   TooltipTrigger, } from  | `src/components/admin/connections/IntegrationHealthCard.tsx` |
| Falha: ${e.message} | `src/components/admin/connections/SlowQueryAlertsPanel.tsx` |
| Não foi possível copiar | `src/components/admin/connections/SmokeTestChecklist.tsx` |
| Falha ao reiniciar: ${e.message} | `src/components/admin/connections/TopQueriesPanel.tsx` |
| useCredentialsSource must be used inside CredentialsSourceFilterProvider | `src/components/admin/connections/useCredentialsSource.ts` |
| Nenhum dado disponível para exportação | `src/components/analytics/ABCAnalysis.tsx` |
| Preencha todos os campos | `src/components/analytics/ObjectionsLibrary.tsx` |
|                  className= | `src/components/assistant/PersonalAssistantDrawer.tsx` |
| Erro de voz | `src/components/assistant/SalesAssistantChat.tsx` |
| Ações automáticas exigem template preenchido | `src/components/cadences/CadenceStepRow.tsx` |
| Título deve ter pelo menos 3 caracteres | `src/components/cadences/CadenceStepRow.tsx` |
| Erro: ${e instanceof Error ? e.message : String(e)} | `src/components/cadences/ContactRulesDialog.tsx` |
| Usuário não autenticado | `src/components/cadences/ContactRulesDialog.tsx` |
| Vendedor não encontrado | `src/components/cadences/ContactRulesDialog.tsx` |
| Corrija os erros nas etapas | `src/components/cadences/CreateCadenceDialog.tsx` |
| Corrija os erros nas novas etapas | `src/components/cadences/EditCadenceDialog.tsx` |
| Cadência e nome são obrigatórios | `src/components/cadences/EnrollmentRulesDialog.tsx` |
| Erro ao executar auto-enrollment | `src/components/cadences/EnrollmentRulesDialog.tsx` |
| Erro ao aceitar lead | `src/components/closer/CloserHandoffs.tsx` |
| Erro ao iniciar batalha | `src/components/competitive/CreateBattleDialog.tsx` |
| Selecione pelo menos 2 gladiadores | `src/components/competitive/CreateBattleDialog.tsx` |
| Selecione uma data de encerramento | `src/components/competitive/CreateBattleDialog.tsx` |
| Usuário não identificado | `src/components/competitive/CreateBattleDialog.tsx` |
| Erro ao entrar na liga | `src/components/competitive/LeagueSystem.tsx` |
| Erro ao criar aposta | `src/components/competitive/PerformanceBets.tsx` |
| No salesperson | `src/components/competitive/PerformanceBets.tsx` |
| Erro ao girar a roda | `src/components/competitive/PrizeWheel.tsx` |
| Erro ao criar torneio | `src/components/competitive/TournamentBrackets.tsx` |
| Erro ao enviar kudos | `src/components/competitive/WallOfFame.tsx` |
| Erro ao enviar feedback. | `src/components/conversational/CallFeedbackForm.tsx` |
| Por favor, adicione um comentário. | `src/components/conversational/CallFeedbackForm.tsx` |
| Arquivo excede 50MB | `src/components/conversational/CallRecordingUploader.tsx` |
| Formato não suportado. Use MP3, WAV, WEBM, OGG ou M4A. | `src/components/conversational/CallRecordingUploader.tsx` |
| Intervalo inválido | `src/components/customer-success/CustomerSuccess360Hub.tsx` |
| Falha em ${provider}: ${err instanceof Error ? err.message :  | `src/components/customer-success/HelpdeskConnectorPanel.tsx` |
| Falha: ${err instanceof Error ? err.message :  | `src/components/customer-success/HelpdeskConnectorPanel.tsx` |
| Falha: ${err instanceof Error ? err.message :  | `src/components/customer-success/SurveyTriggerDialog.tsx` |
| Informe o email do contato | `src/components/customer-success/SurveyTriggerDialog.tsx` |
|                    >                     <X className= | `src/components/dashboard/AlertsPanel.tsx` |
| Erro ao limpar histórico | `src/components/dashboard/FuturisticSpeedometerDashboard.tsx` |
| Erro ao salvar configurações | `src/components/dashboard/FuturisticSpeedometerDashboard.tsx` |
| Erro ao carregar logs de integração | `src/components/dashboard/IntegrationStatusPanel.tsx` |
| Erro ao executar simulação | `src/components/debug/WebhookSimulationPanel.tsx` |
| Número de telefone ausente | `src/components/dialer/ClickToCallButton.tsx` |
| Twilio não configurado | `src/components/dialer/ClickToCallButton.tsx` |
| Erro ao criar desafio | `src/components/gamification/CreateChallengeDialog.tsx` |
| Preencha todos os campos obrigatórios | `src/components/gamification/CreateChallengeDialog.tsx` |
| Erro ao gerar desafios | `src/components/gamification/DailyChallengesCard.tsx` |
| Erro na extração de dados. | `src/components/lead-scoring/LeadNeuralDossier.tsx` |
| Erro ao gerar relatório CSV. | `src/components/lead-scoring/LeadScoringDashboard.tsx` |
|  \|\| n.metadata?.is_competition_alert;    return (     <div       className={cn(          | `src/components/notifications/NotificationCenter.tsx` |
| Erro ao enviar:  | `src/components/notifications/NotificationPreferenceCard.tsx` |
| High Render Latency | `src/components/performance/PerformanceMonitor.tsx` |
| Performance Drop Detected | `src/components/performance/PerformanceMonitor.tsx` |
| Créditos de IA esgotados. | `src/components/pipeline/AtRiskDealsPanel.tsx` |
| Erro ao analisar deal | `src/components/pipeline/AtRiskDealsPanel.tsx` |
| Limite de requisições atingido. Tente novamente em alguns minutos. | `src/components/pipeline/AtRiskDealsPanel.tsx` |
|  className= | `src/components/pipeline/InactivityPanel.tsx` |
| Erro ao encaminhar lead | `src/components/pipeline/QuickActionsMenu.tsx` |
| Erro ao executar macro | `src/components/pipeline/QuickActionsMenu.tsx` |
| ,                               title:  | `src/components/purchase-intelligence/PurchaseIntelligenceHub.tsx` |
| Falha ao enviar orçamento: ${e instanceof Error ? e.message :  | `src/components/quotes/QuoteCard.tsx` |
| Orçamento não enviado — ${detail \|\|  | `src/components/quotes/QuoteCard.tsx` |
| Sem acesso ao PDF desta cotação | `src/components/quotes/QuoteDetailDialog.tsx` |
|              >               <motion.div                 aria-hidden                 className= | `src/components/race/LeaderTakeoverCelebration.tsx` |
|                  >                   <motion.div                     aria-hidden                     className= | `src/components/race/OvertakeHighlight.tsx` |
|  className= | `src/components/race/RacePanelErrorBoundary.tsx` |
| Cópia para clipboard não suportada neste navegador. | `src/components/race/SeasonRecapCard.tsx` |
| Erro: ${e instanceof Error ? e.message :  | `src/components/race/admin/SeasonRulesPanel.tsx` |
| Falha ao enviar | `src/components/ranking/SendRankingNotificationsButton.tsx` |
| Nome obrigatório | `src/components/reporting/ReportBuilder.tsx` |
| Selecione ao menos uma coluna | `src/components/reporting/ReportBuilder.tsx` |
| Email inválido | `src/components/reporting/ScheduledReportFormDialog.tsx` |
| Email já adicionado | `src/components/reporting/ScheduledReportFormDialog.tsx` |
| Não foi possível gerar link | `src/components/reporting/ScheduledReportRunsDrawer.tsx` |
| Erro ao salvar configurações | `src/components/reports/EmailReportConfig.tsx` |
| Informe um email | `src/components/reports/EmailReportConfig.tsx` |
| Forecast ainda não calculado | `src/components/revenue-intelligence/ForecastNarrative.tsx` |
| Resposta vazia da IA | `src/components/revenue-intelligence/ForecastNarrative.tsx` |
| Cliente sem e-mail cadastrado. | `src/components/sales/AIEmailDialog.tsx` |
| Cliente sem vínculo cadastrado. | `src/components/sales/AIEmailDialog.tsx` |
| Erro ao gerar e-mail com IA | `src/components/sales/AIEmailDialog.tsx` |
| Falha ao enviar e-mail | `src/components/sales/AIEmailDialog.tsx` |
| Mensagem descartada. | `src/components/sales/cadence/ApprovalQueue.tsx` |
| Erro ao carregar templates | `src/components/sales/cadence/CadenceAlertConfig.tsx` |
| Erro ao excluir | `src/components/sales/cadence/CadenceAlertConfig.tsx` |
| Erro ao salvar:  | `src/components/sales/cadence/CadenceAlertConfig.tsx` |
| Nome e conteúdo são obrigatórios | `src/components/sales/cadence/CadenceAlertConfig.tsx` |
| Preencha todos os campos obrigatórios | `src/components/sales/cadence/CadenceFunnelConfig.tsx` |
| Erro ao carregar regras | `src/components/sales/cadence/CadenceOutcomeConfig.tsx` |
| Erro ao excluir | `src/components/sales/cadence/CadenceOutcomeConfig.tsx` |
| Erro:  | `src/components/sales/cadence/CadenceOutcomeConfig.tsx` |
| Erro ao processar evento no banco | `src/components/sales/cadence/CadenceSimulationDialog.tsx` |
| Selecione um lead para a simulação | `src/components/sales/cadence/CadenceSimulationDialog.tsx` |
| Ação rejeitada | `src/components/sales/cadence/CadenceTemplateManager.tsx` |
| Por favor, preencha o nome e o conteúdo do template. | `src/components/sales/cadence/CadenceTemplateManager.tsx` |
| ; import { Clock, ShieldAlert, Zap, Save, Loader2 } from  | `src/components/sales/cadence/ContactFrequencyRules.tsx` |
| Erro ao salvar regras de frequência: ${e instanceof Error ? e.message : String(e)} | `src/components/sales/cadence/ContactFrequencyRules.tsx` |
| Erro ao salvar qualificação:  | `src/components/sdr/MQLQualificationForm.tsx` |
| Handoff necessário | `src/components/sdr/MQLQualificationForm.tsx` |
| Nenhum lead selecionado | `src/components/sdr/MQLQualificationForm.tsx` |
| Preencha os campos obrigatórios | `src/components/sdr/MQLQualificationForm.tsx` |
| Erro ao agendar bloco de foco. | `src/components/sdr/PredictiveSuccessMap.tsx` |
| Você precisa estar logado para agendar blocos. | `src/components/sdr/PredictiveSuccessMap.tsx` |
| Erro ao atualizar threshold | `src/components/sdr/SDRAlertHistory.tsx` |
| Valor inválido | `src/components/sdr/SDRAlertHistory.tsx` |
| Erro ao testar alertas | `src/components/sdr/TestSDRAlertButton.tsx` |
| Arquivo inválido | `src/components/search/VisualSearchButton.tsx` |
| Falha na busca visual | `src/components/search/VisualSearchButton.tsx` |
| Imagem muito grande | `src/components/search/VisualSearchButton.tsx` |
| Endereço IP inválido | `src/components/security/BlockedIPsPanel.tsx` |
| Informe o motivo do bloqueio | `src/components/security/BlockedIPsPanel.tsx` |
| Erro ao atualizar:  | `src/components/security/GeoBlockingManager.tsx` |
| Erro ao remover país:  | `src/components/security/GeoBlockingManager.tsx` |
| País não encontrado | `src/components/security/GeoBlockingManager.tsx` |
| Erro: ${error.message} | `src/components/security/GeoBlockingMap.tsx` |
| Erro ao remover IP | `src/components/security/IPWhitelistManager.tsx` |
| ; import { knownDeviceService } from  | `src/components/security/KnownDevices.tsx` |
| Erro ao atualizar dispositivo | `src/components/security/KnownDevices.tsx` |
| Erro ao remover dispositivo | `src/components/security/KnownDevices.tsx` |
| ; import { Skeleton } from  | `src/components/security/MFASetup.tsx` |
| Código deve ter 6 dígitos | `src/components/security/MFASetup.tsx` |
| Número de telefone inválido | `src/components/security/MFASetup.tsx` |
| ; import { CheckCircle2, Smartphone } from  | `src/components/security/MFATotpTab.tsx` |
| Código deve ter 6 dígitos | `src/components/security/MFATotpTab.tsx` |
| Código inválido | `src/components/security/MFAVerification.tsx` |
| Erro ao aprovar:  | `src/components/security/PasswordResetApproval.tsx` |
| Erro ao rejeitar:  | `src/components/security/PasswordResetApproval.tsx` |
| ; import { useReauthentication } from  | `src/components/security/ReauthDialog.tsx` |
| API não configurada | `src/components/settings/AIAssistantSettings.tsx` |
| Erro ao testar voz | `src/components/settings/AIAssistantSettings.tsx` |
| Erro ao testar alerta | `src/components/settings/AccessDeniedLogs.tsx` |
| Nome da companhia é obrigatório | `src/components/settings/ApiIntegrationSettings.tsx` |
| Preencha todos os campos | `src/components/settings/CustomFieldsManager.tsx` |
| Erro ao criar flag | `src/components/settings/FeatureFlagsAdmin.tsx` |
| Erro ao salvar | `src/components/settings/FeatureFlagsAdmin.tsx` |
| Apenas administradores podem alterar as configurações. | `src/components/settings/FollowUpSettings.tsx` |
| Erro ao atualizar configurações:  | `src/components/settings/FollowUpSettings.tsx` |
| Acesso negado. | `src/components/settings/FollowUpTerritoryRules.tsx` |
| Erro ao adicionar regra:  | `src/components/settings/FollowUpTerritoryRules.tsx` |
| Erro ao atualizar permissão | `src/components/settings/PermissionMatrix.tsx` |
| Erro ao atualizar permissões | `src/components/settings/PermissionMatrix.tsx` |
| Erro ao salvar | `src/components/settings/SecurityAlertSettings.tsx` |
| Settings not found | `src/components/settings/SecurityAlertSettings.tsx` |
| Valores inválidos | `src/components/settings/SecurityAlertSettings.tsx` |
|            aria-live= | `src/components/shared/GlobalErrorBoundary.tsx` |
| Selecione pelo menos uma tarefa | `src/components/tasks/RescheduleDialog.tsx` |
|      className={cn(alertVariants({ variant }), className)}     {...props}   /> )); Alert.displayName =  | `src/components/ui/alert.tsx` |
| useChart must be used within a <ChartContainer /> | `src/components/ui/chart.tsx` |
| useFormField should be used within <FormField> | `src/components/ui/form.tsx` |
| useSidebar must be used within a SidebarProvider. | `src/components/ui/sidebar.tsx` |
| Erro ao atualizar | `src/components/vendedores/GoalEditDialog.tsx` |
| Vendedor não selecionado | `src/components/vendedores/GoalEditDialog.tsx` |
| Erro ao cadastrar | `src/components/vendedores/SalespersonForm.tsx` |
| Erro ao aplicar insight | `src/components/win-loss/ActionableInsightsPanel.tsx` |
| Falha ao copiar | `src/components/win-loss/ReplayInvocationsPanel.tsx` |
| Cole o ID do dead-letter para buscar. | `src/components/win-loss/ReplayStatusByIdPanel.tsx` |
| Falha ao copiar | `src/components/win-loss/ReplayStatusByIdPanel.tsx` |
| ID inválido — esperado um UUID. | `src/components/win-loss/ReplayStatusByIdPanel.tsx` |
| Limite de ${BULK_REPLAY_HARD_CAP} itens por reenvio (selecionado: ${ids.length}). | `src/components/win-loss/WebhookDeadLetterPanel.tsx` |
| Erro ao reenviar webhooks. | `src/components/win-loss/WebhookDeliveriesDrawer.tsx` |
|              className= | `src/components/win-loss/WebhookHealthPanel.tsx` |
| Falha ao copiar | `src/components/win-loss/WebhookSubscriptionLatestList.tsx` |
|        aria-live= | `src/components/win-loss/WinLossAnomalyBanner.tsx` |
| useAudio must be used within an AudioProvider | `src/contexts/AudioContext.tsx` |
| useAuth must be used within an AuthProvider | `src/contexts/AuthContext.tsx` |
| useDashboardTheme must be used within a DashboardThemeProvider | `src/contexts/DashboardThemeContext.tsx` |
| Serviço temporariamente indisponível. Tentando novamente em ${resetTimeout / 1000}s... | `src/hooks/circuitBreakerUtils.ts` |
| Não autenticado | `src/hooks/useApiTokens.ts` |
| Créditos de IA esgotados. | `src/hooks/useBehavioralAnalysis.ts` |
| Falha na análise comportamental | `src/hooks/useBehavioralAnalysis.ts` |
| Limite de análises atingido. Tente novamente em instantes. | `src/hooks/useBehavioralAnalysis.ts` |
| Erro ao atualizar token | `src/hooks/useBitrix24.ts` |
| Erro ao iniciar autorização | `src/hooks/useBitrix24.ts` |
| Erro na sincronização | `src/hooks/useBitrix24.ts` |
| … +636 linhas — lista completa em `context.json` | |

## J. Controle de acesso no código (checagens de perfil/permissão)

| Valor comparado | Arquivo |
|---|---|
| `selectedRole` | `src/components/analytics/PerformanceComparison.tsx` |
| `user` | `src/components/assistant/MessageBubble.tsx` |
| `user` | `src/components/assistant/PersonalAssistantDrawer.tsx` |
| `assistant` | `src/components/assistant/SalesAssistantChat.tsx` |
| `dev` | `src/components/auth/DevOnly.tsx` |
| `role` | `src/components/auth/ProtectedRoute.tsx` |
| `sdr` | `src/components/closer/SDRHandoffContext.tsx` |
| `closer` | `src/components/dashboard/DashboardHeader.tsx` |
| `hybrid` | `src/components/dashboard/DashboardHeader.tsx` |
| `sdr` | `src/components/dashboard/DashboardHeader.tsx` |
| `champion` | `src/components/deal-intelligence/committee/RelationshipHealthGraph.tsx` |
| `economic` | `src/components/deal-intelligence/committee/RelationshipHealthGraph.tsx` |
| `technical` | `src/components/deal-intelligence/committee/RelationshipHealthGraph.tsx` |
| `role` | `src/components/deal-intelligence/committee/RoleCoverageMatrix.tsx` |
| `admin` | `src/components/mobile/MobileDrawer.tsx` |
| `manager` | `src/components/mobile/MobileDrawer.tsx` |
| `admin` | `src/components/organisms/AppSidebar.tsx` |
| `manager` | `src/components/organisms/AppSidebar.tsx` |
| `closer` | `src/components/pipeline/QuickActionsMenu.tsx` |
| `hybrid` | `src/components/pipeline/QuickActionsMenu.tsx` |
| `closer` | `src/components/portfolio/AssignClientDialog.tsx` |
| `hybrid` | `src/components/portfolio/AssignClientDialog.tsx` |
| `sdr` | `src/components/roi/ROIRankingList.tsx` |
| `closer` | `src/components/sales/CreateSaleDialog.tsx` |
| `hybrid` | `src/components/sales/CreateSaleDialog.tsx` |
| `sdr` | `src/components/sales/CreateSaleDialog.tsx` |
| `closer` | `src/components/sdr/MQLQualificationForm.tsx` |
| `hybrid` | `src/components/sdr/MQLQualificationForm.tsx` |
| `denied` | `src/components/security/PushNotificationSettings.tsx` |
| `denied` | `src/components/settings/BrowserPushSettings.tsx` |
| `granted` | `src/components/settings/BrowserPushSettings.tsx` |
| `permissionId` | `src/components/settings/PermissionMatrix.tsx` |
| `role` | `src/components/settings/PermissionMatrix.tsx` |
| `hybrid` | `src/components/teams/CreateTeamDialog.tsx` |
| `sdr` | `src/components/teams/CreateTeamDialog.tsx` |
| `hybrid` | `src/components/teams/EditTeamDialog.tsx` |
| `sdr` | `src/components/teams/EditTeamDialog.tsx` |
| `closer` | `src/components/vendedores/RankingGridItem.tsx` |
| `sdr` | `src/components/vendedores/RankingGridItem.tsx` |
| `default` | `src/hooks/useCelebration.ts` |
| `granted` | `src/hooks/useCelebration.ts` |
| `closer` | `src/hooks/useLeadAssignment.ts` |
| `admin` | `src/hooks/usePermissions.ts` |
| `manager` | `src/hooks/usePermissions.ts` |
| `permission` | `src/hooks/usePermissions.ts` |
| `granted` | `src/hooks/usePushNotifications.ts` |
| `default` | `src/hooks/useSDRAlertNotifications.ts` |
| `granted` | `src/hooks/useSDRAlertNotifications.ts` |
| `granted` | `src/hooks/useSecurityAlertNotifications.ts` |
| `admin` | `src/hooks/useUserRoles.ts` |
| `closer` | `src/hooks/useUserRoles.ts` |
| `hybrid` | `src/hooks/useUserRoles.ts` |
| `manager` | `src/hooks/useUserRoles.ts` |
| `role` | `src/hooks/useUserRoles.ts` |
| `sdr` | `src/hooks/useUserRoles.ts` |
| `closer` | `src/hooks/dashboard/useDashboardKPIsPeriod.ts` |
| `sdr` | `src/hooks/dashboard/useDashboardKPIsPeriod.ts` |
| `closer` | `src/hooks/dashboard/useDashboardRedirect.ts` |
| `hybrid` | `src/hooks/dashboard/useDashboardRedirect.ts` |
| `sdr` | `src/hooks/dashboard/useDashboardRedirect.ts` |
| `default` | `src/hooks/sales/useSalesRealtime.ts` |
| `granted` | `src/hooks/sales/useSalesRealtime.ts` |
| `null` | `src/pages/FeatureFlagsAdmin.tsx` |
| `sdr` | `src/pages/Index.tsx` |
| `admin` | `src/pages/Metas.tsx` |
| `manager` | `src/pages/Metas.tsx` |
| `user` | `src/pages/MeuAssistente.tsx` |
| `closer` | `src/pages/Portfolio.tsx` |
| `hybrid` | `src/pages/Portfolio.tsx` |
| `authenticated` | `supabase/functions/_shared/auth-client.ts` |
| `champion` | `supabase/functions/account-engagement-aggregator/index.ts` |
| `decision_maker` | `supabase/functions/account-engagement-aggregator/index.ts` |
| `blocker` | `supabase/functions/calculate-committee-coverage/index.ts` |
| `string` | `supabase/functions/nlq-query/index.ts` |
| `null` | `supabase/functions/ranking-api/index.ts` |
| `assistant` | `supabase/functions/sales-assistant-chat/index.ts` |
| `closer` | `supabase/functions/sales-assistant-chat/index.ts` |
| `sdr` | `supabase/functions/sales-assistant-chat/index.ts` |
| `user` | `supabase/functions/sales-assistant-chat/index.ts` |
| `create` | `supabase/migrations/20251228000002_advanced_permissions.sql` |
| `admin` | `supabase/migrations/20260417193322_744fd297-7c0e-4c6d-8ce7-79fb68e00dca.sql` |
| `manager` | `supabase/migrations/20260417193322_744fd297-7c0e-4c6d-8ce7-79fb68e00dca.sql` |
| `admin` | `supabase/migrations/20260417195120_e6042ca1-c9ed-4411-ad92-08f88fff9a24.sql` |
| `manager` | `supabase/migrations/20260417195120_e6042ca1-c9ed-4411-ad92-08f88fff9a24.sql` |
| `admin` | `supabase/migrations/20260708125556_bff05f17-7b7e-4b33-a72e-b37ea1147c87.sql` |
| `admin` | `supabase/migrations/20260708125950_37e29cae-9643-4f28-8d79-8e53d534207c.sql` |
| `admin` | `supabase/migrations/20260708131452_51c83881-2872-405e-b486-a81d212174e6.sql` |
| `admin` | `supabase/migrations/20260708132809_4962962a-5310-4b63-9686-b7952f4b3ce3.sql` |
| `admin` | `supabase/migrations/20260708132928_792c1922-0e95-43a9-a639-0e0a6ea7897b.sql` |
| `admin` | `supabase/migrations/20260708133041_2f01ba16-b10f-4769-87d3-bff881b9ac57.sql` |
| `admin` | `supabase/migrations/20260708133313_898cab6d-d606-4161-8094-150091e9e683.sql` |
| `admin` | `supabase/migrations/20260710142058_6b19ba08-4a71-42a5-8e9e-b029b6f72f4d.sql` |
| `admin` | `supabase/migrations/20260710142606_502f6e24-0b43-463f-9cc3-202ff44796a6.sql` |
| `admin` | `supabase/migrations/20260711151406_fd14194a-1b24-422f-bd8a-c274b1fe60e6.sql` |
| `admin` | `supabase/migrations/20260712232718_6cfc1884-5c14-4d44-b3b3-ba91edde064a.sql` |
| `admin` | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `manager` | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `admin` | `supabase/migrations/20261027210000_r3_db_kpis_fixes.sql` |
| `manager` | `supabase/migrations/20261027210000_r3_db_kpis_fixes.sql` |

## K. Testes como especificação (1281 testes em 141 arquivos — nomes completos em `context.json`)

| Arquivo | Testes | Exemplos do que o sistema DEVE fazer |
|---|---|---|
| `tests/e2e/pages-reports-hubs.spec.ts` | 61 | Dashboard — Visão Geral · carrega sem crash · title da página correto · Relatórios … |
| `tests/e2e/pages-admin-config.spec.ts` | 54 | Configurações — System Core · carrega heading  · title da página correto · mostra tabs de configuração … |
| `tests/e2e/pages-bi-analytics.spec.ts` | 45 | BI Vendedor · carrega heading  · title da página correto · BI SDR … |
| `src/hooks/reports/salesReportHelpers.test.ts` | 44 | salesReportHelpers.buildKpis · agrega apenas vendas ganhas (completed/won/closed) na receita · devolve zeros num array vazio · trata amount nulo como zero … |
| `src/lib/mergeTags.test.ts` | 33 | applyMergeTags · substitui tags de cliente · faz fallback para sale.client_name se client.name ausente · mostra placeholder [x] quando ausente … |
| `tests/e2e/pages-customer-success.spec.ts` | 31 | Customer Success Hub · carrega página sem crash · title da página correto · NPS & Satisfação … |
| `src/lib/revenueForecast/forecastEngine.test.ts` | 28 | computeRevenueForecast · produz horizonte solicitado · respeita bounds do horizonte (1-24) · usa defaults quando opts não fornecido (cobre horizon ?? 3 e simulations ?? 1000) … |
| `tests/e2e/pages-automation-ai.spec.ts` | 26 | Automation Builder · carrega heading  · title da página correto · mostra botão Novo Workflow … |
| `src/lib/staleAssetRecovery.test.ts` | 24 | isRecoverableAssetError · recognizes failed dynamic import pattern · recognizes importing module script failed · recognizes loading chunk errors … |
| `src/lib/validators/brDocuments.test.ts` | 24 | isValidCPF · aceita CPF válido: %s · rejeita CPF com dígito verificador errado: %s · rejeita CPF com tamanho ou conteúdo inválido: %s … |
| `tests/e2e/pages-gamification.spec.ts` | 23 | Ranking Competitivo — Circuito de Vencedores · carrega heading · title da página correto · mostra tabs de ranking … |
| `src/lib/markupHelpers.test.ts` | 22 | markupHelpers · computeMarkupPct · calcula markup positivo · retorna 0 quando amount = custo … |
| `src/lib/gamification.test.ts` | 20 | getLevelFromXP · retorna nível 1 para XP 0 · retorna nível correto no limiar inferior · progressPercent aumenta dentro do nível … |
| `tests/e2e/pages-critical-routes.spec.ts` | 20 | Dashboard SDR · carrega heading · title da página correto · Dashboard Closer … |
| `src/hooks/email/failedDraftsHelpers.test.ts` | 19 | isPermanentError · não classifica ausência de erro como permanente · marca  · mantém  … |
| `src/hooks/email/recoveryRateHelpers.test.ts` | 19 | failureTypeLabel · traduz códigos conhecidos · devolve o código bruto quando desconhecido · isPermanentFailureType … |
| `tests/e2e/pages-crm-core.spec.ts` | 18 | Vendas — Deals Pipeline · carrega heading e filtros · title da página correto · Clientes — Client Hub … |
| `scripts/db-audit/gen-migration-probes.test.mjs` | 17 | ALTER TABLE com vários ADD em uma linha carrega a tabela em todos · ALTER TABLE IF EXISTS não captura  · ALTER TABLE IF EXISTS com , ADD encadeado resolve a tabela certa · DROP CONSTRAINT + ADD CONSTRAINT na mesma statement resolve a tabela … |
| `src/hooks/abm/useAccounts.test.tsx` | 17 | useUpdateAccount · atualiza a conta pelo id, sem enviar o id no payload, e invalida a lista · RLS com 0 linhas vira erro de permissão em PT-BR (sem mensagem crua do PostgREST) · nome duplicado (23505) mostra mensagem amigável … |
| `src/lib/orderTracking/stages.test.ts` | 17 | stages catálogo · OPERATIONAL_STAGES tem 8 estágios com order 1-8 · FINANCIAL_STAGES tem 4 estágios · POST_SALE_STAGES tem 3 estágios … |
| `src/components/reporting/funnelReportHelpers.test.ts` | 16 | funnelReportHelpers.computeStageDeltas · calcula delta absoluto, percentual, valor e conversão por estágio · trata previous ausente como zero (novo estágio ganha 100%) · retorna 0% quando previous é 0 e current também … |
| `src/hooks/assistant/usePersonalAssistantHelpers.test.ts` | 16 | parseSSELine · extrai delta.content de linha data: · retorna string vazia para [DONE] · retorna string vazia para linha sem prefixo data: … |
| `supabase/functions/cron-failure-alerter/index.test.ts` | 16 | fn_cron_expected_interval → cada schedule mapeia para o intervalo correto · fn_cron_stalled_threshold → 5min job usa piso de 30min · fn_cron_stalled_threshold → 15min job usa 30min (2× intervalo) · fn_cron_stalled_threshold → 30min job usa 60min (2× intervalo) … |
| `src/lib/winloss/riskReasons.test.ts` | 15 | getReasonKindMeta · todos os códigos retornam meta com label + variant · STAGNATION_HIGH tem contribMax=50 e source=stagnation · COMPETITOR_PRESSURE tem source=competitor e variant=destructive … |
| `src/test/quote-conversion-errors.test.ts` | 15 | parseConvertQuoteError · extrai código de  · devolve UNKNOWN para mensagens sem prefixo, vazias ou desconhecidas · tolera espaços em branco antes do prefixo … |
| `src/lib/winloss/riskSeverity.test.ts` | 14 | deriveSeverity — matriz de severidade Win/Loss · classifica como critical apenas quando final≥80 E conf≥0.7 · classifica como high para final entre 65 e 79 (independente de conf) · classifica como medium para final entre 50 e 64 … |
| `src/lib/winloss/winlossContract.test.ts` | 14 | contrato front/edge — severity · deriveSeverity (front) === severityFromScore (edge) para toda a grade · adapter score-only do front (conf=1) === edge com conf plena · SEVERITY_RULES (tabela UI) bate com o contrato em toda a grade … |
| `src/test/regressions.test.ts` | 14 | Regression: ABC Analysis · handles empty performance array · handles zero total revenue · classifies by Pareto 80/15/5 … |
| `src/test/smoke-target-helpers.test.ts` | 14 | isAccessDenied · detecta códigos de negação do PostgREST · detecta mensagens de RLS/JWT · ignora erros não relacionados a acesso … |
| `scripts/graphify/graphify-utils.test.mjs` | 13 | aceita caminho dentro da raiz e recusa travessia · valida inteiro positivo · exige a versão completa e exata do Graphify · recusa arestas órfãs e ids repetidos … |
| `src/hooks/email/campaignDeliveryHelpers.test.ts` | 13 | campaignDeliveryHelpers · toFiniteNumber trata nulos, strings e NaN · normalizeDeliveryRow preenche defaults seguros · failureRate calcula sobre o total processado … |
| `src/hooks/email/emailOptOutMetricsHelpers.test.ts` | 13 | aggregateOptOutMetrics · retorna estrutura vazia coerente sem registros · conta janelas de 7 e 30 dias corretamente · calcula delta percentual contra os 7 dias anteriores … |
| `src/lib/validators/brSchemas.test.ts` | 13 | brPhoneField · aceita campo vazio (opcional):  · brCpfOrCnpjField · aceita documento válido: %s … |
| `src/services/salesService.test.ts` | 13 | salesService.getSales · mapeia rows do Supabase para o formato do domínio · faz fallback para client_name/product_name quando joins vêm nulos · sanitiza o searchTerm (remove vírgulas/parênteses) e chama .or() … |
| `supabase/functions/_shared/retry-policy.test.ts` | 13 | erros permanentes são reconhecidos · erros transitórios não são permanentes · já enviado é ignorado · sem erro é ignorado … |
| `tests/e2e/pages-sales-commerce.spec.ts` | 13 | Orçamentos — CPQ Engine · carrega heading  · title da página correto · mostra filtros de status … |
| `src/lib/bi/markupOverviewHelpers.test.ts` | 12 | aggregateMarkupOverview · lista vazia → resumo zerado e sem vendedores · agrupa média por vendedor e ordena desc · conta vendas críticas abaixo do limiar … |
| `src/lib/log/pii.test.ts` | 12 | maskEmail · preserva primeira e última letra do local + domínio · retorna vazio para entrada nula e *** para formato inválido · maskPhone … |
| `supabase/functions/_shared/campaign-health.test.ts` | 12 | percent protege contra divisão por zero · campanha saudável não gera alertas · snapshot inválido não gera alertas · opt-out acima do limiar gera warning e crítico … |
| `scripts/lib/seguranca-processo.test.mjs` | 11 | resolverExecutavel devolve caminho absoluto existente igual ao do shell · resolverExecutavel lanca para comando inexistente · estaDentro aceita a raiz e subpastas · estaDentro recusa  … |
| `src/hooks/useRunRateProjection.test.ts` | 11 | computeRunRateProjection · primeiro dia do mês: paceDaily = mtd, projeta para todos os dias do mês · meio do mês com bom ritmo: confidence media, projeção acima da meta · gap grande: dailyPaceRequired calculado corretamente … |
| `src/hooks/sales/useContactFrequencyRules.test.tsx` | 11 | parseContactRules / serializeContactRules · retorna null quando não há regras salvas · lê o formato gravado por ContactRulesDialog e completa o que falta com o padrão · ignora valores inválidos no jsonb … |
| `src/lib/navigationGuard.test.tsx` | 11 | navigationGuard · requestNavigation executa direto sem sujeira · requestNavigation confirma antes de sair com sujeira · requestNavigation bloqueia quando o usuário cancela … |
| `src/lib/auth/passwordErrorMessages.test.ts` | 11 | classifyPasswordError · returns unknown for null/undefined · detects HIBP leaked password via message · detects HIBP via weak_password code even when message is empty … |
| `src/lib/winloss/scenarioChartKey.test.ts` | 11 | buildScenarioChartKey · retorna scenario-empty quando data vazia · retorna scenario-empty quando fitN=0 mesmo com data · retorna scenario-insufficient com fitN < 3 … |
| `tests/e2e/pages-navigation.spec.ts` | 11 | Auth Page · mostra título de login · não redireciona para /auth quando já autenticado (redireciona para /) · Protected Routes — redirect anonymous users to /auth … |
| `scripts/graphify/extract-code-only.test.mjs` | 10 | publica somente snapshot validado com metadados de origem · aceita escopo de arquivo regular e registra uma única entrada · recusa link simbólico intermediário antes de criar saída externa · recusa link simbólico aninhado no escopo antes de chamar o extrator … |
| `src/hooks/useEligibleBonuses.test.ts` | 9 | evaluateBonus · rejects inactive · rejects individual bonus for other salesperson · milestone: achieved when mtdRevenue >= threshold … |
| `src/components/sales/cadence/ContactFrequencyRules.test.tsx` | 8 | ContactFrequencyRules · avisa que as regras ainda não são aplicadas automaticamente · marca os valores como padrão quando nada foi salvo · mostra as regras salvas no banco … |
| `src/hooks/useFormDraft.test.tsx` | 8 | useFormDraft · restaura rascunho existente uma vez · não restaura nem grava com chave nula · primeira edição antes do debounce é gravada (baseline da montagem) … |
| `src/lib/draftMigration.test.ts` | 8 | migrateLegacyDraft · retorna none quando não há legado · migra quando o destino não existe · migra por cima de destino que é só baseline vazio … |
| `src/lib/markupSummary.test.ts` | 8 | summarizeMarkup · lista vazia → tudo zerado e sem média · classifica por faixa e ignora nulos na média · mediana com quantidade par usa a média central … |
| `src/hooks/dashboard/__tests__/useDashboardKPIs.contract.test.ts` | 7 | get_dashboard_kpis RPC contract · returns a fully-shaped KPI payload for authorized callers · surfaces  · returns zeroed metrics for a salesperson with no own sales (RLS scoping) … |
| `src/lib/winloss/severityFromScore.test.ts` | 7 | severityFromScore · classifica critical em score >= 80 · classifica high entre 65 e 79 · classifica medium entre 50 e 64 … |
| `src/hooks/useBackNavigation.test.ts` | 6 | resolveBackFallback · sobe um nível quando o último segmento é uuid (página de detalhe) · sobe um nível quando o último segmento é numérico · usa o override quando o prefixo não é rota de listagem … |
| `src/hooks/useLoginRateLimiter.test.tsx` | 6 | useLoginRateLimiter · consome somente o resumo agregado e normaliza o e-mail · bloqueia enquanto lockout_until estiver no futuro · falha aberta quando o resumo não está disponível … |
| `src/hooks/useScrollRestoration.test.tsx` | 6 | useScrollRestoration · vai ao topo em navegação PUSH · restaura posição salva ao voltar (POP) · retentativas reaplicam a posição quando não há scroll externo … |
| `src/hooks/reports/useMarkupMinSamplePreference.test.tsx` | 6 | useMarkupMinSamplePreference · começa com a amostra padrão 1 e expõe as opções · lê valor válido persistido no localStorage · ignora valor inválido persistido e volta ao padrão … |
| `src/lib/supabase/chunkedIn.test.ts` | 6 | chunkedIn · short-circuits on empty array · splits into chunks of chunkSize and concatenates data · preserves order in sequential mode … |
| `src/pages/Index.test.tsx` | 6 | Dashboard Integration Tests · recalculates KPIs when period is changed · shows skeleton states while loading · handles data fetch failure and recovery … |
| `supabase/functions/_shared/retry.test.ts` | 6 | withRetry — sucesso na primeira tentativa não retorna RetryError · withRetry — success_after_retry após 5xx transient · withRetry — retry_exhausted lança RetryError com attempts=maxAttempts · withRetry — non_retryable (4xx) não faz retry … |
| `supabase/functions/check-v4-callback-alerts/index.test.ts` | 6 | no alerts when under thresholds · skips failure rate when below min_events · fires high_failure_rate · fires exhausted_spike … |
| `supabase/functions/notify-v4-quote-status/index.test.ts` | 6 | isValidUrl rejeita string vazia e valores mal formados · isValidUrl aceita https e http · backoff cresce exponencialmente até saturar · MAX_ATTEMPTS é 5 (contrato do painel) … |
| `tests/e2e/auth-navigation.spec.ts` | 6 | Authentication and Navigation Flows · should redirect unauthenticated users from /dashboard to /auth · should allow a user to login and see the dashboard · should navigate between pages after login … |
| `tests/e2e/dashboard-navigation.spec.ts` | 6 | Dashboard — navegação entre módulos · rota raiz carrega sem erro para usuário autenticado · rota /analytics/win-loss é acessível diretamente · rota /competencias é acessível diretamente … |
| `tests/e2e/quote-to-sale-validations.spec.ts` | 6 | Conversão de orçamento — validações e concorrência · EMPTY_ITEMS: orçamento sem itens é bloqueado e mensagem PT-BR na UI · Tolerância ±R$ 0,02: 3× 33,33 vs total 100,00 converte (0,01 de diff) · TOTAL_MISMATCH: diferença de R$ 0,05 é bloqueada … |
| `tests/e2e/rls-authorization-edge-cases.spec.ts` | 6 | SEC-02 — RLS edge cases (anon) · anon não lê ${table} (select cru) · anon não lê ${table} com filtro user_id fabricado · apikey ausente é bloqueado pelo gateway … |
| `tests/e2e/rls-scope-salesperson.spec.ts` | 6 | SEC-RLS-Scope — salesperson não cruza escopo · sessão é salesperson (skip se admin/manager) · ${c.table}: filtro ${c.ownerCol}=neq.<meu> não retorna linhas de terceiros · ${c.table}: INSERT com dono fabricado é rejeitado … |
| `src/components/pipeline/InactivityPanel.test.tsx` | 5 | InactivityPanel · mostra skeleton durante o carregamento, sem estado vazio · mostra erro com retry quando a consulta falha, sem estado vazio · mostra estado vazio só quando carregou sem deals inativos … |
| `src/components/sales/SaleHUDCard.test.tsx` | 5 | SaleHUDCard · renders sale information correctly · shows AI insights when brain icon is clicked · applies correct color for high prediction scores … |
| `src/components/security/KnownDevices.test.tsx` | 5 | KnownDevices · sai do estado de loading quando não há usuário autenticado · lista dispositivos quando o usuário está autenticado · não atualiza estado quando o componente desmonta durante o fetch … |
| `src/hooks/useInactiveDeals.test.tsx` | 5 | useInactiveDeals · começa carregando e expõe o vendedor real do deal para notificação · sinaliza erro quando a consulta de vendas falha (não mostra  · começa em loading e termina com os deals inativos reais … |
| `src/lib/safeNavigation.test.ts` | 5 | isSafeInternalPath · aceita rota interna com query e hash · safeNavigationHref · preserva somente HTTP(S), hash e rotas internas seguras … |
| `src/lib/revenueForecast/csvExport.test.ts` | 5 | buildRevenueForecastCsv · emite header + linhas de história e forecast · escapa períodos com vírgula · adiciona prefixo  … |
| `src/pages/InactivityTriggers.test.tsx` | 5 | InactivityTriggers · não afirma  · mostra erro com nova tentativa real quando a consulta falha · notifica o vendedor via send_notification e só confirma após sucesso … |
| `src/test/csv-export.test.ts` | 5 | CSV Export Utils · formatDateForExport should format correctly · formatPercentForExport should format correctly · formatCurrencyForExport should format correctly … |
| `src/test/quote-error-messages.test.ts` | 5 | parseConvertQuoteError (módulo standalone) · normaliza espaços em branco antes do prefixo · devolve UNKNOWN para prefixo inválido ou desconhecido · todos os códigos têm mensagem PT-BR não-vazia mapeada … |
| `src/test/sale-status.test.ts` | 5 | sale status helpers · treats manual and integration successful statuses as won · recognises lost statuses · treats pipeline stages as open (neither won nor lost) … |
| `supabase/functions/create-stagnant-tasks/index.test.ts` | 5 | create-stagnant-tasks - should respond with valid structure · lead-scoring - should respond to invocation · deal-probability - should respond to invocation · next-best-action - should respond to invocation … |
| `supabase/functions/receive-quote-sync/index.test.ts` | 5 | GET is not allowed · body não-JSON retorna 400 · PromoGifts sem x-webhook-signature retorna 401 · PromoGifts com signature inválida retorna 401 … |
| `tests/e2e/pipeline-flows.spec.ts` | 5 | Pipeline — fluxos críticos · redireciona anônimo de /pipeline para /auth · carrega board com heading e descrição · painel lateral de risco alterna visibilidade … |
| `tests/e2e/sales-markup-rls-salesperson.spec.ts` | 5 | SEC-Markup — salesperson não vê custos · sessão é de salesperson (skip se admin/manager) · sales_with_markup expõe markup_pct e mascara unit_cost/total_cost · tabela base sales não retorna unit_cost/total_cost com valor > 0 … |
| `tests/e2e/win-loss-analysis.spec.ts` | 5 | Win/Loss Analysis — página dedicada · redireciona usuário anônimo para /auth · renderiza header, título e ações principais quando autenticado · exibe painéis laterais de Estratégia e Projeção … |
| `scripts/graphify/multigraph.test.mjs` | 4 | preserva relações múltiplas dirigidas entre os mesmos nós · materializa importações externas e mantém todas as relações da fonte · impacto reverso conserva evidência e informa relações ambíguas · rejeita documento que perde uma relação da fonte |
| `scripts/graphify/static-contracts.test.mjs` | 4 | extrai referências literais entre código e Supabase · registra SQL dinâmico em corpo de função como lacuna e não como objeto comprovado · não interpreta comentário ou string como DDL e expõe ACL/RLS como lacuna · não confunde delimitadores de comentário dentro de literal com comentário SQL |
| `src/components/email/aiEmailComposer.test.ts` | 4 | AIEmailComposer mapping logic · should map form values to API input correctly · should include contact_context for manual recipient type · should use fallback values for missing fields |
| `src/hooks/rolePermissions.test.ts` | 4 | fonte única de permissões (role-permissions.json) · migration versionada é idêntica ao SQL gerado do JSON (sem drift) · toda permissão declarada tem policy viva cobrindo a ação na tabela mapeada · papeis e recursos declarados usam o vocabulário esperado |
| `src/hooks/useLeadRouting.test.tsx` | 4 | useLeadRouting · delega round-robin à RPC transacional sem gravar estado no navegador · mantém as estratégias de melhor desempenho e manual no contrato do servidor · recusa estratégia sem implementação no servidor em vez de escolher um vendedor arbitrário |
| `src/pages/AccountBasedSelling.test.tsx` | 4 | AccountBasedSelling — editar/excluir conta · vendedor (dono) vê Editar mas não vê Excluir · dono edita a conta: envia id e campos do formulário · admin/gestor vê Excluir, com aviso da cascata, e confirma a exclusão |
| `src/test/bi-helpers.test.ts` | 4 | BI Helpers · buildSalespeoplePerformance should calculate correct metrics · computePipelineHealth should calculate health metrics · computeForecast should calculate forecast metrics |
| `src/utils/dateHelpers.test.ts` | 4 | getLocalISODate · formata data no formato YYYY-MM-DD · usa Date.now() como default · mês/dia com zero-pad |
| `supabase/functions/forecast-narrative/index.test.ts` | 4 | GET → 405 Method not allowed · OPTIONS → 200 CORS preflight · Sem Authorization → 401 · Bearer inválido → 401 Invalid or expired token |
| `tests/e2e/core-flows.spec.ts` | 4 | Freight Quest - Core User Flows · should navigate to dashboard and check for sale cards · should open AI Insights on a Sale card · should show validation error on invalid login |
| `tests/e2e/quote-to-sale-audit-log.spec.ts` | 4 | audit_logs: convert_quote_to_sale grava histórico corretamente · reuso (approved/PED-*): grava audit com order_number e reused_order=true · criação (won/ORC-*): grava audit com order_number e reused_order=false · idempotente: 2ª chamada NÃO grava audit_log duplicado |
| `tests/e2e/reset-password-hibp.spec.ts` | 4 | /reset-password — HIBP end-to-end · senha vazada Password123! é bloqueada com mensagem PT-BR · senha forte é aceita e mostra estado de sucesso · rejeita senha curta antes de chamar backend |
| `tests/e2e/revenue-forecast-v2.spec.ts` | 4 | Revenue Forecast v2 — /revenue-forecast-v2 · renderiza header, sliders what-if e cards P10/P50/P90 · mover slider what-if de win rate recalcula os cards P50 · export CSV baixa arquivo com header P10/P50/P90 e linhas de forecast |
| `tests/e2e/v4-callbacks-admin.spec.ts` | 4 | Admin V4 Callbacks · rota /admin/v4-callbacks carrega sem crash · dispatcher notify-v4-quote-status responde 200 com secrets ativos · cron de alertas check-v4-callback-alerts responde 200 |
| `scripts/graphify/catalog-adapter.test.mjs` | 3 | normaliza catálogo rico sem incluir linhas de negócio · recusa projeto, sessão e linhas não comprovados · reconciliação trata ausência como pendência, não como remoção |
| `scripts/graphify/docs-index.test.mjs` | 3 | indexa links explícitos sem concluir implementação · recusa documentação alcançada por link simbólico · não classifica como local um link para symlink externo |
| `src/hooks/useDigitalSignatures.test.tsx` | 3 | useDigitalSignatures sem provedor configurado · não altera o status ao tentar enviar um documento · não permite registrar assinatura ou recusa pelo cliente |
| `src/hooks/useProductRecommendations.test.tsx` | 3 | useProductRecommendations — regressão Onda J/K · particiona 250 client IDs em 3 chunks (100/100/50) via chunkedIn · agrega counts ignorando product_id null e tolera product_name/amount nulos |
| `src/hooks/email/useFailedDrafts.test.tsx` | 3 | mutações de rascunhos com falha · particiona o reenvio manual e mantém o mesmo horário para todos os chunks · particiona o descarte manual de rascunhos |
| `src/hooks/gamification/useStreakRanking.test.tsx` | 3 | useStreakRanking — agregação sem N+1 · busca conquistas de todos os vendedores em uma única query .in() · monta ranking correto com múltiplos vendedores e conquistas |
| `src/hooks/orders/useOrderTracking.test.tsx` | 3 | useOrderTracking · retorna somente pedidos persistidos, sem complementar a listagem com mocks · consulta o detalhe diretamente, sem depender do limite da listagem |
| `src/hooks/race/useGhostCar.test.tsx` | 3 | useGhostCar — histórico sem N+1 · busca progresso de todas as seasons em uma única query .in() · usa a melhor season do usuário como referência do ghost |
| `src/lib/usageAnalytics.test.ts` | 3 | usage analytics · agrega visualizações a partir de eventos reais · mantém somente a última atividade observada por usuário |
| `src/services/callFeedbackService.test.ts` | 3 | callFeedbackService.submitCallFeedback · insere evento call_feedback em lead_detailed_logs · propaga erro do insert |
| `tests/e2e/quote-to-sale-error-payload-ui.spec.ts` | 3 | Payload de erro padronizado + toast UI (TOTAL_MISMATCH, FORBIDDEN) · TOTAL_MISMATCH: RPC devolve [TOTAL_MISMATCH] e UI mostra mensagem padronizada · FORBIDDEN: RPC devolve [FORBIDDEN] e UI mostra mensagem padronizada |
| `tests/e2e/quote-to-sale-seq-no-advance.spec.ts` | 3 | Sequence: falha de conversão não avança sequence · TOTAL_MISMATCH: sequence estável e zero orders/sales · FORBIDDEN: sequence estável e zero orders/sales |
| `tests/e2e/quote-to-sale-won-path.spec.ts` | 3 | Path novo (won): RPC cria ORC-* e avança sequence · won: 1 conversão gera ORC-* e sequence +1 · won x3 quotes independentes: sequence avança exatamente +3, números únicos |
| `tests/e2e/smoke.spec.ts` | 3 | Smoke Tests · should load the home page · should redirect to auth if not logged in |
| `src/hooks/useClientsNeedingContact.test.tsx` | 2 | useClientsNeedingContact · particiona a busca de contatos para carteiras grandes |
| `src/hooks/useLeadAssignment.test.ts` | 2 | assignLeadRoundRobin · não mantém cursor de round-robin no módulo do navegador |
| `src/hooks/bi/useChurnOverdueBySeller.test.tsx` | 2 | useChurnOverdueBySeller · particiona a consulta de vendedores quando há mais de 100 IDs |
| `src/hooks/crm/useClientPortfolio.test.tsx` | 2 | useAssignClient · usa a RPC de atribuição manual, que é idempotente e registra auditoria no banco |
| `src/hooks/dashboard/useDashboardKPIsPeriod.test.tsx` | 2 | useDashboardKPIsPeriod · deve buscar KPIs corretamente |
| `src/lib/supabase/all-in-calls.test.ts` | 2 | chunkedInClient guard-rail · no high-cardinality .in() call escapes chunkedInClient |
| `src/test/security/fn-cleanup-webhook-dedupe-privileges.test.ts` | 2 | has_function_privilege confirma bloqueio de anon/authenticated/public e permite service_role · anon executando fn_cleanup_webhook_dedupe recebe permission denied |
| `supabase/functions/cron-failure-alerter/dead-letter-rbac.test.ts` | 2 | fn_admin_list_dead_letter_ingest_jobs — anon (403) · fn_admin_replay_dead_letter_ingest_job — anon (403) |
| `tests/e2e/auth-logout.spec.ts` | 2 | Auth — logout desktop · signOut limpa sessão e redireciona para /auth |
| `tests/e2e/mobile-auth-smoke.spec.ts` | 2 | Mobile smoke • ${name} · redireciona deep link → /auth → faz login → volta ao deep link → sign-out |
| `tests/e2e/quote-to-sale-api-forbidden.spec.ts` | 2 | API: 403 + [FORBIDDEN] via chamada REST direta · POST /rest/v1/rpc/fn_convert_quote_to_sale devolve [FORBIDDEN] |
| `tests/e2e/quote-to-sale-approved-reuse.spec.ts` | 2 | Fluxo approved: reuso exato de order existente · approved cria PED-*; RPC reusa exatamente a mesma order/order_number |
| `tests/e2e/quote-to-sale-backfill.spec.ts` | 2 | Backfill orders_conversion_seq: reexecução segura · reexecução mantém last_value monotônico e ORC-* únicos |
| `tests/e2e/quote-to-sale-cleanup-contract.spec.ts` | 2 | Contract: cleanupQuote não deixa órfãos após triggers · cleanup remove sale_notifications_audit, follow_up_notifications e follow_up_audit_logs |
| `tests/e2e/quote-to-sale-concurrent-won.spec.ts` | 2 | Concorrência x5 (path won → ORC-*) · 5 RPCs paralelas em won → 1 ORC-*, sequence +1, 4 idempotentes |
| `tests/e2e/quote-to-sale-concurrent-x5.spec.ts` | 2 | Concorrência: 5 chamadas simultâneas da RPC · 5 RPCs em paralelo produzem 1 order + 1 sale sem colisão |
| `tests/e2e/quote-to-sale-concurrent.spec.ts` | 2 | Concorrência: duas conversões simultâneas · duas RPCs em paralelo produzem 1 sale + 1 order sem colisão |
| `tests/e2e/quote-to-sale-forbidden.spec.ts` | 2 | Validação: conversão sem permissão retorna [FORBIDDEN] · RPC bloqueia com [FORBIDDEN] e não cria sales/orders |
| `tests/e2e/quote-to-sale-idempotencia-sequencial.spec.ts` | 2 | Idempotência sequencial: 2 conversões seguidas do mesmo quote · 2 RPCs sequenciais devolvem mesmo order_id/order_number sem duplicar |
| `tests/e2e/quote-to-sale-invalid-total.spec.ts` | 2 | Validação: total_value divergente da soma dos itens · RPC bloqueia conversão com código [TOTAL_MISMATCH] |
| `tests/e2e/quote-to-sale-order-reuse.spec.ts` | 2 | Conversão: reuso de order existente (trigger legado) · trigger cria 1 order ao aprovar; RPC reusa a mesma order |
| `tests/e2e/quote-to-sale-race-approved-plus-ui.spec.ts` | 2 | Race: approved-trigger + botão UI no mesmo quote · approved + UI quase simultâneos → 1 order (reuso) + 1 sale |
| `tests/e2e/quote-to-sale-race-trigger-vs-rpc.spec.ts` | 2 | Race trigger×RPC no mesmo quote · UPDATE→approved paralelo com fn_convert produz 1 order + 1 sale |
| `tests/e2e/quote-to-sale-reenvio.spec.ts` | 2 | Idempotência: reenviar conversão 3x · 3 chamadas sequenciais: 1 real + 2 idempotentes, todas com order_number |
| `tests/e2e/quote-to-sale-ui-error-alt.spec.ts` | 2 | UI alternativa: TOTAL_MISMATCH via ação do card · fluxo alternativo exibe toast padronizado de TOTAL_MISMATCH |
| `tests/e2e/quote-to-sale-ui-error.spec.ts` | 2 | UI: mensagem padronizada para [TOTAL_MISMATCH] · exibe toast PT-BR mapeado para TOTAL_MISMATCH e não cria sale |
| `tests/e2e/quote-to-sale-ui-plus-rpc.spec.ts` | 2 | Concorrência: UI + RPC direta no mesmo quote · UI + RPC simultâneos convergem para o mesmo order/sale |
| `tests/e2e/quote-to-sale.spec.ts` | 2 | Fluxo: aprovar orçamento e converter em venda · converte via UI e é idempotente na segunda chamada |
| `tests/e2e/security-definer-rpc-access.spec.ts` | 2 | SEC-01/02 — SECURITY DEFINER access matrix · anon é bloqueado em toda função internal/user e não é bloqueado em funções públicas |
| `tests/a11y/axe-sweep.spec.ts` | 1 | Onda Q — a11y sweep (axe-core) |

## L. Eventos de webhook tratados (contratos com sistemas externos)

| Evento | Arquivo |
|---|---|
| `SKIP_WAITING` | `public/sw.js` |
| `social` | `src/components/activities/ArenaPulseFeed.tsx` |
| `stealth` | `src/components/activities/ArenaPulseFeed.tsx` |
| `victory` | `src/components/activities/ArenaPulseFeed.tsx` |
| `cliente.email` | `src/lib/mergeTags.ts` |
| `cliente.empresa` | `src/lib/mergeTags.ts` |
| `cliente.nome` | `src/lib/mergeTags.ts` |
| `cliente.telefone` | `src/lib/mergeTags.ts` |
| `data.amanha` | `src/lib/mergeTags.ts` |
| `data.hoje` | `src/lib/mergeTags.ts` |
| `negocio.categoria` | `src/lib/mergeTags.ts` |
| `negocio.estagio` | `src/lib/mergeTags.ts` |
| `negocio.fonte` | `src/lib/mergeTags.ts` |
| `negocio.valor` | `src/lib/mergeTags.ts` |
| `singu.noticia_empresa` | `src/lib/mergeTags.ts` |
| `singu.primeira_frase` | `src/lib/mergeTags.ts` |
| `singu.tecnologias` | `src/lib/mergeTags.ts` |
| `vendedor.email` | `src/lib/mergeTags.ts` |
| `vendedor.nome` | `src/lib/mergeTags.ts` |

## M. Efeitos colaterais (e-mail, SMS, cobrança, fila — não são idempotentes por padrão)

| Chamada | Arquivo |
|---|---|
| `invoke(` | `src/components/admin/BackendAutomationMonitor.tsx` |
| `invoke(` | `src/components/admin/ExternalDBSettings.tsx` |
| `invoke(` | `src/components/admin/connections/EdgeRetryThresholdCard.tsx` |
| `invoke(` | `src/components/analytics/CoachingComparison.tsx` |
| `.add('printing-briefings'` | `src/components/assistant/BriefingHistoryTimeline.tsx` |
| `invoke(` | `src/components/cadences/EnrollmentRulesDialog.tsx` |
| `invoke(` | `src/components/customer-success/HelpdeskConnectorPanel.tsx` |
| `invoke(` | `src/components/customer-success/SurveyTriggerDialog.tsx` |
| `invoke(` | `src/components/dashboard/PredictiveRevenueForecast.tsx` |
| `invoke(` | `src/components/debug/WebhookSimulationPanel.tsx` |
| `invoke(` | `src/components/gamification/DailyChallengesCard.tsx` |
| `invoke(` | `src/components/map/ClientsMap.tsx` |
| `notify_sales_email` | `src/components/notifications/NotificationCenter.tsx` |
| `notify_sales_in_app` | `src/components/notifications/NotificationCenter.tsx` |
| `invoke(` | `src/components/notifications/NotificationPreferenceCard.tsx` |
| `notify_at_risk_goals` | `src/components/notifications/NotificationPreferenceCard.tsx` |
| `notify_inactive_clients` | `src/components/notifications/NotificationPreferenceCard.tsx` |
| `notify_stagnant_deals` | `src/components/notifications/NotificationPreferenceCard.tsx` |
| `invoke(` | `src/components/quotes/QuoteCard.tsx` |
| `notify_at_risk_goals` | `src/components/reports/EmailReportConfig.tsx` |
| `notify_inactive_clients` | `src/components/reports/EmailReportConfig.tsx` |
| `notify_stagnant_deals` | `src/components/reports/EmailReportConfig.tsx` |
| `invoke(` | `src/components/sales/AIEmailDialog.tsx` |
| `sendEmail` | `src/components/sales/AIEmailDialog.tsx` |
| `notify_email` | `src/components/sales/cadence/CadenceFunnelConfig.tsx` |
| `notify_push` | `src/components/sales/cadence/CadenceFunnelConfig.tsx` |
| `invoke(` | `src/components/sdr/TestSDRAlertButton.tsx` |
| `invoke(` | `src/components/security/PasswordResetApproval.tsx` |
| `invoke(` | `src/components/settings/AccessDeniedLogs.tsx` |
| `invoke(` | `src/components/win-loss/ExportPdfButton.tsx` |
| `notify_sales_email` | `src/contexts/AuthContext.tsx` |
| `notify_sales_in_app` | `src/contexts/AuthContext.tsx` |
| `invoke(` | `src/hooks/useBehavioralAnalysis.ts` |
| `invoke(` | `src/hooks/useBitrix24.ts` |
| `sendPush` | `src/hooks/useCelebration.ts` |
| `invoke(` | `src/hooks/useCoachingIntelligence.ts` |
| `.add('high-contrast'` | `src/hooks/useCustomTheme.ts` |
| `.add('reduce-motion'` | `src/hooks/useCustomTheme.ts` |
| `invoke(` | `src/hooks/useDealProbability.ts` |
| `invoke(` | `src/hooks/useDemandForecast.ts` |
| `.add('focus-dim-inactive'` | `src/hooks/useFocusMode.ts` |
| `.add('focus-hide-gamification'` | `src/hooks/useFocusMode.ts` |
| `.add('focus-hide-notifications'` | `src/hooks/useFocusMode.ts` |
| `.add('focus-hide-sidebar'` | `src/hooks/useFocusMode.ts` |
| `.add('focus-mode'` | `src/hooks/useFocusMode.ts` |
| `invoke(` | `src/hooks/useLeadEnrichment.ts` |
| `invoke(` | `src/hooks/useNextBestAction.ts` |
| `notify_at_risk_goals` | `src/hooks/useNotificationPreferences.ts` |
| `notify_inactive_clients` | `src/hooks/useNotificationPreferences.ts` |
| `notify_stagnant_deals` | `src/hooks/useNotificationPreferences.ts` |
| `invoke(` | `src/hooks/usePredictiveIntelligence.ts` |
| `invoke(` | `src/hooks/usePushNotifications.ts` |
| `invoke(` | `src/hooks/useQuotes.ts` |
| `notify` | `src/hooks/useQuotes.ts` |
| `invoke(` | `src/hooks/useRankingNotifications.ts` |
| `notify` | `src/hooks/useRankingNotifications.ts` |
| `invoke(` | `src/hooks/useStagnantTasks.ts` |
| `invoke(` | `src/hooks/useWebAuthn.ts` |
| `invoke(` | `src/hooks/useWebhooks.ts` |
| `invoke(` | `src/hooks/useWhatsApp.ts` |
| `invoke(` | `src/hooks/useWorkflows.ts` |
| `invoke(` | `src/hooks/admin/useIntegrationConnections.ts` |
| `invoke(` | `src/hooks/admin/useV4Callbacks.ts` |
| `notify` | `src/hooks/admin/useV4Callbacks.ts` |
| `invoke(` | `src/hooks/automation/useAutomationIntelligence.ts` |
| `invoke(` | `src/hooks/automation/useAutomationWorkflows.ts` |
| `notify_email` | `src/hooks/cadences/useCadenceQueries.ts` |
| `notify_push` | `src/hooks/cadences/useCadenceQueries.ts` |
| `invoke(` | `src/hooks/coaching/useCoachingImpact.ts` |
| `invoke(` | `src/hooks/coaching/useCoachingOpportunities.ts` |
| `invoke(` | `src/hooks/coaching/useCoachingSessions.ts` |
| `invoke(` | `src/hooks/coaching/useSkillGapAnalyzer.ts` |
| `invoke(` | `src/hooks/conversation-intelligence/useAnalyzeConversation.ts` |
| `invoke(` | `src/hooks/conversational/useCallRecordings.ts` |
| `invoke(` | `src/hooks/conversational/useCoachingActions.ts` |
| `invoke(` | `src/hooks/conversational/useCoachingScorecard.ts` |
| `invoke(` | `src/hooks/conversational/useCompetitorMentions.ts` |
| `invoke(` | `src/hooks/conversational/useConversationMetrics.ts` |
| `invoke(` | `src/hooks/conversational/useCriticalMoments.ts` |
| `invoke(` | `src/hooks/conversational/useDiarizeRecording.ts` |
| `invoke(` | `src/hooks/conversational/useObjectionAnalysis.ts` |
| `invoke(` | `src/hooks/conversational/useQuestionAnalysis.ts` |
| `invoke(` | `src/hooks/conversational/useSentimentTimeline.ts` |
| `invoke(` | `src/hooks/conversational/useSummarizeRecording.ts` |
| `invoke(` | `src/hooks/conversational/useTranscribeRecording.ts` |
| `invoke(` | `src/hooks/conversational/useUploadCallRecording.ts` |
| `invoke(` | `src/hooks/deal-intelligence/useAtRiskDeals.ts` |
| `invoke(` | `src/hooks/deal-intelligence/useCommitteeCoverage.ts` |
| `invoke(` | `src/hooks/deal-intelligence/useDealHealth.ts` |
| `invoke(` | `src/hooks/deal-intelligence/useDealStakeholders.ts` |
| `invoke(` | `src/hooks/deal-intelligence/useDealVelocity.ts` |
| `invoke(` | `src/hooks/deal-intelligence/useStageBaselines.ts` |
| `invoke(` | `src/hooks/deal-intelligence/useStageConversion.ts` |
| `invoke(` | `src/hooks/deal-intelligence/useStageVelocity.ts` |
| `invoke(` | `src/hooks/deal-intelligence/useWinLoss.ts` |
| `invoke(` | `src/hooks/dialer/useClickToCall.ts` |
| `invoke(` | `src/hooks/dialer/usePowerDialer.ts` |
| `invoke(` | `src/hooks/email/useComposeEmail.ts` |
| `invoke(` | `src/hooks/email/useFailedDrafts.ts` |
| `invoke(` | `src/hooks/engagement/useAccountEngagement.ts` |
| `invoke(` | `src/hooks/engagement/useBulkComposer.ts` |
| `invoke(` | `src/hooks/engagement/useEmailEngagementScore.ts` |
| `invoke(` | `src/hooks/engagement/useSendTimeOptimization.ts` |
| `invoke(` | `src/hooks/executive-briefing/useGenerateBriefing.ts` |
| `invoke(` | `src/hooks/forecast/useRevenueForecast.ts` |
| `sendPush` | `src/hooks/gamification/useLevelUpCelebration.ts` |
| `invoke(` | `src/hooks/multichannel/useChannelCredentials.ts` |
| `invoke(` | `src/hooks/nlq/useNLQ.ts` |
| `invoke(` | `src/hooks/pipeline-pulse/usePipelinePulse.ts` |
| `invoke(` | `src/hooks/pipeline-pulse/useQuickAction.ts` |
| `invoke(` | `src/hooks/purchase-intelligence/usePurchaseIntelligence.ts` |
| `invoke(` | `src/hooks/race/useRaceCommentary.ts` |
| `invoke(` | `src/hooks/race/useRacePowerups.ts` |
| `invoke(` | `src/hooks/race/useRaceTrigger.ts` |
| `notify` | `src/hooks/race/useSessionDuration.ts` |
| `invoke(` | `src/hooks/race/useStartRaceSeason.ts` |
| `invoke(` | `src/hooks/reporting/useReportExecution.ts` |
| `invoke(` | `src/hooks/reporting/useTriggerScheduledReport.ts` |
| `invoke(` | `src/hooks/revenue/useQuotaAttainment.ts` |
| `invoke(` | `src/hooks/revenue/useRevenueIntelligenceHub.ts` |
| `invoke(` | `src/hooks/revenue/useWinProbabilityCalibration.ts` |
| `invoke(` | `src/hooks/revenue-intelligence/useForecastAccuracy.ts` |
| `invoke(` | `src/hooks/revenue-intelligence/useRevenueForecast.ts` |
| `sendNotification` | `src/hooks/sales/useSalesEnablement.ts` |
| `notify_sales_email` | `src/hooks/sales/useSalespeople.ts` |
| `notify_sales_in_app` | `src/hooks/sales/useSalespeople.ts` |
| `invoke(` | `src/hooks/scoring/useExplainBatch.ts` |
| `invoke(` | `src/hooks/scoring/useLeadScoreExplanation.ts` |
| `invoke(` | `src/hooks/semantic/useIndexEntity.ts` |
| `invoke(` | `src/hooks/sequences/useAIEmailComposer.ts` |
| `invoke(` | `src/hooks/sequences/useEnrollContacts.ts` |
| `invoke(` | `src/hooks/sequences/usePromoteWinners.ts` |
| `invoke(` | `src/hooks/sequences/useSendTimeOptimization.ts` |
| `invoke(` | `src/hooks/win-loss/useAsyncReplayQueue.ts` |
| `invoke(` | `src/hooks/win-loss/useAtRiskFromPatterns.ts` |
| `invoke(` | `src/hooks/win-loss/useInsightExplanation.ts` |
| `invoke(` | `src/hooks/win-loss/useRunWinLossAnalysis.ts` |
| `invoke(` | `src/hooks/win-loss/useWebhookDeadLetters.ts` |
| `invoke(` | `src/hooks/win-loss/useWebhookDeliveries.ts` |
| `invoke(` | `src/pages/AdminAlertasChurn.tsx` |
| `invoke(` | `src/pages/AdminFilaTarefasAutomaticas.tsx` |
| `invoke(` | `src/pages/Cadencias.tsx` |
| `sendWhatsApp` | `src/pages/FollowUpInteligente.tsx` |
| `invoke(` | `src/pages/HistoricoDesafiosDiarios.tsx` |
| `notifyingId` | `src/pages/InactivityTriggers.tsx` |
| `sendNotification` | `src/pages/InactivityTriggers.tsx` |
| `notify_at_risk_goals` | `src/pages/Notificacoes.tsx` |
| `notify_inactive_clients` | `src/pages/Notificacoes.tsx` |
| `notify_stagnant_deals` | `src/pages/Notificacoes.tsx` |
| `notify` | `src/pages/RaceArenaHub.tsx` |
| `notify` | `supabase/functions/_shared/operational-cron-auth_contract_test.ts` |
| `notify` | `supabase/functions/access-denied-alerts/index.ts` |
| `resend.emails.send` | `supabase/functions/access-denied-alerts/index.ts` |
| `notify_sales_email` | `supabase/functions/broadcast-sale-notification/index.ts` |
| `notify_sales_in_app` | `supabase/functions/broadcast-sale-notification/index.ts` |
| `resend.emails.send` | `supabase/functions/broadcast-sale-notification/index.ts` |
| `notifyError` | `supabase/functions/campaign-health-alert/index.ts` |
| `notifyEmail` | `supabase/functions/check-lead-sla/index.ts` |
| `resend.emails.send` | `supabase/functions/check-lead-sla/index.ts` |
| `notifyError` | `supabase/functions/check-quote-expiration/index.ts` |
| `notify_failed` | `supabase/functions/check-quote-expiration/index.ts` |
| `slack.attempted` | `supabase/functions/deal-risk-digest/index.ts` |
| `slack.error` | `supabase/functions/deal-risk-digest/index.ts` |
| `slack.ok` | `supabase/functions/deal-risk-digest/index.ts` |
| `.add('high'` | `supabase/functions/detect-winloss-at-risk/scenarios_test.ts` |
| `invoke(` | `supabase/functions/extract-committee-from-call/index.ts` |
| `resend.emails.send` | `supabase/functions/new-device-alert/index.ts` |
| `notify` | `supabase/functions/notify-critical-pattern/index.ts` |
| `notify_critical_pattern_failed` | `supabase/functions/notify-critical-pattern/index.ts` |
| `notify` | `supabase/functions/notify-quote-conversion/index.ts` |
| `notify` | `supabase/functions/notify-ranking-position/index.ts` |
| `notify` | `supabase/functions/notify-v4-quote-status/index.ts` |
| `enqueue(` | `supabase/functions/personal-assistant-stream/fallback.ts` |
| `enqueue(` | `supabase/functions/personal-assistant-stream/index.ts` |
| `invoke(` | `supabase/functions/process-cadence-tasks/index.ts` |
| `invoke(` | `supabase/functions/process-scheduled-sends/index.ts` |
| `resend.emails.send` | `supabase/functions/sdr-consecutive-alerts/index.ts` |
| `sendNotification` | `supabase/functions/sdr-consecutive-alerts/index.ts` |
| `notify_at_risk_goals` | `supabase/functions/send-alert-notifications/index.ts` |
| `notify_inactive_clients` | `supabase/functions/send-alert-notifications/index.ts` |
| `notify_stagnant_deals` | `supabase/functions/send-alert-notifications/index.ts` |
| `resend.emails.send` | `supabase/functions/send-alert-notifications/index.ts` |
| `resend.emails.send` | `supabase/functions/send-password-reset/index.ts` |
| `invoke(` | `supabase/functions/send-quote-to-client/index.ts` |
| `invoke(` | `supabase/functions/send-transactional-email/callers_test.ts` |
| `invoke(` | `supabase/functions/sequence-runner/index.ts` |
| `invoke(` | `supabase/functions/winloss-webhook-replay/index.ts` |
| `notify_at_risk_goals` | `supabase/migrations/20251213010319_3edab12d-13d1-46fb-bdb6-e1a8edac611a.sql` |
| `notify_inactive_clients` | `supabase/migrations/20251213010319_3edab12d-13d1-46fb-bdb6-e1a8edac611a.sql` |
| `notify_stagnant_deals` | `supabase/migrations/20251213010319_3edab12d-13d1-46fb-bdb6-e1a8edac611a.sql` |
| `notify_critical_moment_created` | `supabase/migrations/20260417202813_6803938d-e003-42c1-8b38-f8515132e8f5.sql` |
| `notify` | `supabase/migrations/20260420210849_5e5fd280-33bb-4015-9d44-9aea02b83b83.sql` |
| `notify_critical_winloss_pattern` | `supabase/migrations/20260420210849_5e5fd280-33bb-4015-9d44-9aea02b83b83.sql` |
| `notify_email` | `supabase/migrations/20260508141126_292b6f0c-6a25-4221-b648-8a5e4e4f3585.sql` |
| `notify_push` | `supabase/migrations/20260508141126_292b6f0c-6a25-4221-b648-8a5e4e4f3585.sql` |
| `notify_asset_ai_status` | `supabase/migrations/20260511193055_5e3b9a97-97de-4f2d-af49-4b5fc1d4672c.sql` |
| `notify_asset_influence_boost` | `supabase/migrations/20260511193055_5e3b9a97-97de-4f2d-af49-4b5fc1d4672c.sql` |
| `notify` | `supabase/migrations/20260512162448_b9eaf42a-cff1-4a89-97f7-ef4de13a96e7.sql` |
| `notify` | `supabase/migrations/20260512192519_769ada8c-cdd4-4329-a74f-b884464f38bf.sql` |
| `notify_sale_completion` | `supabase/migrations/20260512192519_769ada8c-cdd4-4329-a74f-b884464f38bf.sql` |
| `notify_sale_completion` | `supabase/migrations/20260512192535_e29eeb89-47d4-42fc-8bb8-1d358014d73d.sql` |
| `notify_sale_completion` | `supabase/migrations/20260512192603_9ecb3ed1-a9bf-4da5-8fbb-f5f524f305ba.sql` |
| `notify` | `supabase/migrations/20260512192931_a3224c81-646c-41f5-9efe-bf59c6850c9c.sql` |
| `notify_sale_completion` | `supabase/migrations/20260512192931_a3224c81-646c-41f5-9efe-bf59c6850c9c.sql` |
| `notify_sales_email` | `supabase/migrations/20260512213243_8e4190b5-be17-4171-bb9c-614b97b107a7.sql` |
| `notify_sales_in_app` | `supabase/migrations/20260512213243_8e4190b5-be17-4171-bb9c-614b97b107a7.sql` |
| `notify_asset_ai_status` | `supabase/migrations/20260513192607_6ac577a4-6ab2-4c3e-b5c7-656f81de14b1.sql` |
| `notify_critical_winloss_pattern` | `supabase/migrations/20260514211202_a6925846-148b-41a2-a354-f5391d6c5051.sql` |
| `notify_critical_moment_created` | `supabase/migrations/20260619143950_d6aae558-c974-4edc-b5e5-6e64b8ab8be0.sql` |
| `notify_critical_winloss_pattern` | `supabase/migrations/20260619143950_d6aae558-c974-4edc-b5e5-6e64b8ab8be0.sql` |
| `notify_salesperson_on_bonus_paid` | `supabase/migrations/20260723132212_21cd0f38-cda7-4ffd-9fff-31d375ce1722.sql` |
| `notify` | `supabase/migrations/20260723145549_1d9beb05-6f0b-4c9e-8f9f-985fc1c9d301.sql` |
| `notify` | `supabase/migrations/20260831170000_secure_operational_edge_crons.sql` |
| `notify` | `supabase/migrations/20260910153000_reconcile_operational_edge_crons.sql` |
| `notify` | `supabase/migrations/20261001144000_schedule_wal_and_webhook_health_crons.sql` |
| `notify` | `supabase/migrations/20261002010000_webvitals_regression_alert_cron.sql` |
| `notify` | `supabase/migrations/20261013120000_agenda_crons_maquina_vendas.sql` |
| `notify` | `supabase/migrations/20261013170000_bitrix24_sync_cron.sql` |
| `notify` | `supabase/migrations/20261014000000_gamificacao_server_side.sql` |
| `notify` | `supabase/migrations/20261014000001_fix_allowlist_bitrix24_gamificacao.sql` |
| `notify_sale_completion` | `supabase/migrations/20261027120000_sales_status_canonizacao_rpcs.sql` |
| `notify_sale_completion` | `supabase/migrations/20261027210000_r3_db_kpis_fixes.sql` |
| `notify` | `tests/migrations/canonical_hardening_contract_test.ts` |

## N. Regras citadas em comentários do código

| Comentário | Arquivo |
|---|---|
| apenas quando o teste falha definitivamente (Playwright já descarta | `playwright.config.ts` |
| Page-level smoke tests — all pages must load with correct title/heading | `playwright.config.ts` |
| `vendor-????????.js` casa apenas o hash de 8 chars, excluindo os | `vite.config.ts` |
| Somente exportações em PDF e o assistente de IA carregado via React.lazy() | `vite.config.ts` |
| regra o Rollup o alocava dentro de vendor-pdf, arrastando 591 KB de | `vite.config.ts` |
| shadcn/ui: primitivas geradas, sem lógica de negócio própria. | `vitest.config.ts` |
| // Registro do Service Worker (produção apenas — um SW em dev cacheia chunks | `public/register-sw.js` |
| Regra real: gap entre líder e lanterna indica desempenho disperso | `src/components/activities/ArenaAITips.tsx` |
| * Limite acima do qual o sistema deve alertar (rollbacks/min). */ | `src/components/admin/connections/DbRollbackRatePanel.tsx` |
| chunked-in-safe: leadIds já capados por .limit() upstream | `src/components/analytics/LeadSLAMonitor.tsx` |
| admin/manager) — o seletor espelha a mesma regra para não oferecer 403. | `src/components/assistant/SalesAssistantChat.tsx` |
| que o LIMIT 1 sem filtro que rodava antes. | `src/components/atoms/SystemHealthBadge.tsx` |
| Daily Required */} | `src/components/bi/BIProjectionCard.tsx` |
| Ranking completo para exportação (sem limite) | `src/components/bi/ChurnOverdueRankingCard.tsx` |
| Validation before save | `src/components/cadences/CadenceStepRow.tsx` |
| Filtra apenas cadências de quote_followup ativas | `src/components/cadences/quote/EnrollQuoteCadenceDialog.tsx` |
| Extracted to keep the main component below the 400-LoC limit. | `src/components/clients/Client360ViewHelpers.ts` |
| Simula disparo de teste e loga no banco para validação | `src/components/dashboard/IntegrationStatusPanel.tsx` |
| * Conversor minimalista de markdown -> HTML seguro (apenas h2/h3, parágrafos, bold, lista). | `src/components/executive-briefing/briefingHelpers.ts` |
| Generate 7-day mini heatmap data (must be before early returns) | `src/components/gamification/StreakWidget.tsx` |
| TabsList escondida — usada apenas para a11y (linkagem tab↔panel) */} | `src/components/playbooks/PlaybooksManager.tsx` |
| * Win-rate medido na faixa de ~0% de desconto (0-1). */ | `src/components/pricing/DiscountOptimizer.tsx` |
| * Variação de win-rate por ponto percentual de desconto (slope medido). */ | `src/components/pricing/DiscountOptimizer.tsx` |
| Desconto que maximiza lucro esperado sob o modelo medido | `src/components/pricing/DiscountOptimizer.tsx` |
| Aparece somente se houver eventos. Posicionado no rodapé, acima do MiniMap. | `src/components/race/BroadcastOverlay.tsx` |
| * Limite máximo (em fração) para exibir o badge — padrão 5%. */ | `src/components/race/LeaderGapIndicator.tsx` |
| * Nome do piloto em pit (mostra apenas o primeiro). */ | `src/components/race/PitLane.tsx` |
| ===== Número do piloto (renderizado apenas quando explicitamente passado > 0) ===== */} | `src/components/race/RaceCar.tsx` |
| * Memoizado com comparator custom: re-renderiza apenas quando props visualmente | `src/components/race/RaceCar.tsx` |
| eventos da corrida. Cada item entra com fade + slide e expira após 12s. | `src/components/race/RaceEventTicker.tsx` |
| ---------- Parser mínimo + amostragem De Casteljau ---------- | `src/components/race/raceTrackHelpers.ts` |
| borda branca fina visível (limite interno do curb) */} | `src/components/race/track/TrackAsphalt.tsx` |
| Base: apenas vendas ganhas com custo conhecido — vendedores sem custo não aparecem. | `src/components/reports/sales/SalesMarkupRankingTable.tsx` |
| Permission Denied Warning */} | `src/components/security/PushNotificationSettings.tsx` |
| Writes agregados em até 2 queries (evita N+1 por permissão). | `src/components/settings/PermissionMatrix.tsx` |
| Validation: must have exactly 2 Closers | `src/components/teams/CreateTeamDialog.tsx` |
| * Percentual de comissão do vendedor (ex.: 5 para 5%). */ | `src/components/vendedor/RunRateProjectionCard.tsx` |
| Comissão projetada no bolso do vendedor */} | `src/components/vendedor/RunRateProjectionCard.tsx` |
| Severidade — qual regra acionou e qual matriz produziu a action */} | `src/components/win-loss/RiskDebugPanel.tsx` |
| Falha em um chart/painel não derruba a página inteira — apenas a seção. | `src/components/win-loss/WinLossErrorBoundary.tsx` |
| * Bloco visível APENAS na impressão (CSS @media print). | `src/components/win-loss/WinLossPrintLayout.tsx` |
| * Intervalo entre geocodificações (ms) — respeita rate limit Nominatim */ | `src/config/constants.ts` |
| ===== VALIDAÇÃO ===== | `src/constants/index.ts` |
| sales_status_check constraint, so revenue/conversion logic must treat them | `src/constants/index.ts` |
| banco — apenas 'won'/'lost'). Centraliza as comparações de resultado. | `src/constants/index.ts` |
| - Executa apenas quando o dashboard exibido pertence ao usuário autenticado | `src/hooks/useAutoAwardBonuses.ts` |
| Request notification permission on mount | `src/hooks/useCelebration.ts` |
| - `clearDraft()` deve ser chamado após submit bem-sucedido. | `src/hooks/useFormDraft.ts` |
| SEM .limit deliberadamente: Estoque.tsx calcula criticalCount/lowCount/ | `src/hooks/useInventory.ts` |
| * Calcula somente uma sugestão para a interface. A atribuição persistente de | `src/hooks/useLeadAssignment.ts` |
| leads deve passar pela RPC `auto_assign_lead`, que serializa a estratégia | `src/hooks/useLeadAssignment.ts` |
| Limit batch size | `src/hooks/useLeadScoring.ts` |
| Contrato do webhook aceita no máximo 500 dealIds por chamada. | `src/hooks/useLeadScoring.ts` |
| Request notification permission | `src/hooks/usePushNotifications.ts` |
| sem limite, o teto de 1000 linhas do PostgREST truncava silencioso. | `src/hooks/useQuotes.ts` |
| A função no banco cuida de: lock, idempotência, autorização, validação | `src/hooks/useQuotes.ts` |
| Hook para gerenciar configurações de rate limit | `src/hooks/useRateLimit.ts` |
| Hook para logs de rate limit | `src/hooks/useRateLimit.ts` |
| Hook para estatísticas de rate limit | `src/hooks/useRateLimit.ts` |
| de 5 minutos — o cliente não pode mais fazer UPDATE direto na tabela. | `src/hooks/useReauthentication.ts` |
| Tests must reference these instead of duplicating literals. | `src/hooks/useRetryMutation.ts` |
| Comissão pessoal (opcional — só populado quando commissionRate > 0) | `src/hooks/useRunRateProjection.ts` |
| * Comissão como fração (0.05 = 5%). Se omitido, campos de comissão vêm zerados. */ | `src/hooks/useRunRateProjection.ts` |
| Request notification permission on mount | `src/hooks/useSDRAlertNotifications.ts` |
| Limit to recent activities for speed | `src/hooks/useSDRMetrics.ts` |
| O cache de módulo não expira sozinho: no logout/troca de conta a | `src/hooks/useUnreadNotificationsCount.ts` |
| - Limite defensivo de 30 registros para não pesar o Hub. | `src/hooks/assistant/useBriefingHistory.ts` |
| - staleTime alto pois histórico muda no máximo 1x por dia. | `src/hooks/assistant/useBriefingHistory.ts` |
| Check if MFA upgrade is required (AAL1 → AAL2) | `src/hooks/auth/useAuthForm.ts` |
| Fonte: view `sales_with_markup` (mascara custos absolutos conforme permissão). | `src/hooks/bi/useMarkupOverview.ts` |
| * Número máximo de tentativas automáticas — espelha MAX_RETRIES do backend. */ | `src/hooks/email/failedDraftsHelpers.ts` |
| `public.normalize_bulk_failure_reason`; aqui apenas traduzimos os códigos | `src/hooks/email/recoveryRateHelpers.ts` |
| * Limite (%) abaixo do qual uma falha transitória indica problema operacional. */ | `src/hooks/email/recoveryRateHelpers.ts` |
| * Limite de risco (%) acima do qual a campanha deve ser revisada. */ | `src/hooks/email/useCampaignOptOutRates.ts` |
| * Limite defensivo para não trazer páginas gigantes ao cliente. */ | `src/hooks/email/useEmailOptOutMetrics.ts` |
| * Lista somente pedidos existentes e autorizados pelas políticas RLS. | `src/hooks/orders/useOrderTracking.ts` |
| sem depender do limite da listagem. | `src/hooks/orders/useOrderTracking.ts` |
| revenue-forecast-ai é somente leitura e não "atualiza" nada. | `src/hooks/pipeline-pulse/useQuickAction.ts` |
| * Hook do Daily Briefing cinemático. Decide se deve mostrar (1x/dia) | `src/hooks/race/useDailyBriefing.ts` |
| Primeiro snapshot: apenas registra, não dispara | `src/hooks/race/useLeaderTakeoverDetector.ts` |
| pace vs. required pace, and a contextual recommendation string. | `src/hooks/race/usePitStopAnalysis.ts` |
| * Telemetria detalhada. Em focus, mostramos apenas 1 KPI dominante. */ | `src/hooks/race/useRaceViewMode.ts` |
| * Notifica via toast 1x quando atingir o limite. */ | `src/hooks/race/useSessionDuration.ts` |
| Markup médio considera apenas vendas ganhas com custo conhecido (markup_pct != null). | `src/hooks/reports/salesReportHelpers.ts` |
| Considera apenas vendas ganhas com custo conhecido (markup_pct != null). | `src/hooks/reports/salesReportHelpers.ts` |
| * Série temporal do markup médio (apenas vendas ganhas com custo conhecido). | `src/hooks/reports/salesReportHelpers.ts` |
| Janela por DATA, não por limit cego: com order ASC + limit, as 1000 | `src/hooks/tasks/useTaskQueries.ts` |
| * Returns the preset id whose (threshold, limit) match exactly; null otherwise. */ | `src/hooks/win-loss/atRiskPresets.ts` |
| production no-console rule. In production it's a no-op aside from | `src/hooks/win-loss/replayValidationDiagnostics.ts` |
| is required; the hook stays disabled until that is satisfied. | `src/hooks/win-loss/useWebhookTimeline.ts` |
| - n < 3 → bandas colapsam (sem regressão); o caller deve tratar como | `src/hooks/win-loss/useWinLossScenarios.ts` |
| * Client-side validation for webhook replay IDs. | `src/hooks/win-loss/validateReplayIds.ts` |
| * Falhas são engolidas — analytics jamais deve quebrar o app. | `src/lib/analytics.ts` |
| NÃO grava mais no DB na entrada; apenas registra estado em memória. | `src/lib/analytics.ts` |
| * Datas de negócio (America/Sao_Paulo) para o frontend. | `src/lib/date.ts` |
| * Re-exporta o contrato compartilhado `supabase/functions/_shared/business-date.ts` | `src/lib/date.ts` |
| agregações e campos de negócio. | `src/lib/date.ts` |
| Deve ser instalada uma única vez pelo `NavigationGuardBridge`. | `src/lib/navigationGuard.ts` |
| swallow — telemetry must never break UX */ | `src/lib/webVitals.ts` |
| * Limite de markup considerado crítico (espelha classifyMarkup). */ | `src/lib/bi/markupOverviewHelpers.ts` |
| // Único ponto de saída para logs de aplicação (a regra eslint `no-console` | `src/lib/log/logger.ts` |
| * NÃO reintroduzir `as unknown as T` nas chamadas: a regra | `src/lib/supabase/parseRows.ts` |
| Validação de dígito verificador de CPF e CNPJ (módulo 11), sem dependência externa. | `src/lib/validators/brDocuments.ts` |
| * Inclusive lower bound on `risk_score`. Required when included. */ | `src/lib/winloss/atRiskFixtures.ts` |
| * Inclusive upper bound on `risk_score`. Required when included. */ | `src/lib/winloss/atRiskFixtures.ts` |
| * `breakdown.matched_pattern_type` must equal one of these. */ | `src/lib/winloss/atRiskFixtures.ts` |
| * Each substring must appear in at least one of `result.reasons` (case-insensitive). */ | `src/lib/winloss/atRiskFixtures.ts` |
| * Substring(s) that must appear in `result.suggested_action` (case-insensitive). | `src/lib/winloss/atRiskFixtures.ts` |
| - `string`: substring must appear. | `src/lib/winloss/atRiskFixtures.ts` |
| - `string[]`: OR semantics — at least one substring must appear. | `src/lib/winloss/atRiskFixtures.ts` |
| * Optional substring (case-insensitive) that must appear in `result.matched_pattern`. | `src/lib/winloss/atRiskFixtures.ts` |
| mas o matched_pattern.label deve carregar a família "Pressão competitiva". | `src/lib/winloss/atRiskFixtures.ts` |
| Cases here should ALL be excluded — pipeline não pode marcar deals saudáveis | `src/lib/winloss/atRiskFixtures.ts` |
| * Substring that must appear in `result.matched_pattern` for every | `src/lib/winloss/atRiskFixtures.ts` |
| * Plain-text expression of the rule, monospace-friendly. */ | `src/lib/winloss/riskSeverity.ts` |
| Front-end validation mirroring DB CHECK constraints | `src/pages/admin/WebhookAlertSettingsPage.tsx` |
| * ''/undefined = todas exceto 'lost'; 'lost' = apenas perdidas; demais = eq. */ | `src/services/salesService.ts` |
| Seleciona apenas `markup_pct` e percorre janelas de `.range()`. | `src/services/salesService.ts` |
| - Este arquivo mantém apenas aliases compatíveis com o schema gerado e | `src/types/index.ts` |
| * Representa uma oportunidade de negócio no pipeline de vendas | `src/types/index.ts` |
| * Representa uma oportunidade de negócio no pipeline de vendas | `src/types/index.ts` |
| // Remetente Resend: ALERT_FROM_EMAIL deve apontar para um remetente do domínio | `supabase/functions/_shared/alert-escalation.ts` |
| // Regra de bolso: | `supabase/functions/_shared/auth-client.ts` |
| em tabelas de auditoria que o usuário não pode escrever direto) → | `supabase/functions/_shared/auth-client.ts` |
| * Client com service_role. USE APENAS quando o fluxo precisa bypass de RLS | `supabase/functions/_shared/auth-client.ts` |
| Usado apenas como documentação inline; não é enviado. | `supabase/functions/_shared/auth-client.ts` |
| * Datas de negócio no fuso canônico da operação (America/Sao_Paulo). | `supabase/functions/_shared/business-date.ts` |
| filtros, agregações, chaves de período ou campos de negócio (due_date, | `supabase/functions/_shared/business-date.ts` |
| * Fuso canônico do negócio. */ | `supabase/functions/_shared/business-date.ts` |
| * "YYYY-MM-DD" no fuso de negócio. Aceita Date, ISO string ou epoch ms. */ | `supabase/functions/_shared/business-date.ts` |
| * Alias pedido pela auditoria: data de negócio para usecases/serviços. */ | `supabase/functions/_shared/business-date.ts` |
| * "YYYY-MM" no fuso de negócio. */ | `supabase/functions/_shared/business-date.ts` |
| * "YYYY-MM-01" — primeiro dia do mês de negócio (chave de metas/quotas). */ | `supabase/functions/_shared/business-date.ts` |
| * Instante (Date) da virada do mês corrente no fuso de negócio — | `supabase/functions/_shared/business-date.ts` |
| * Último dia do mês de negócio ("YYYY-MM-DD"). */ | `supabase/functions/_shared/business-date.ts` |
| * "YYYY-MM-DDTHH" — bucket de hora no fuso de negócio (agregações por hora). */ | `supabase/functions/_shared/business-date.ts` |
| * Mínimo de envios para a taxa ser estatisticamente relevante. */ | `supabase/functions/_shared/campaign-health.ts` |
| // Contexto: PostgREST (via edge gateway) impõe um limite prático de ~8KB na URL. | `supabase/functions/_shared/chunked-in.ts` |
| limite e o edge runtime derruba a conexão com | `supabase/functions/_shared/chunked-in.ts` |
| // Chunk padrão de 100 UUIDs mantém a URL confortavelmente abaixo do limite | `supabase/functions/_shared/chunked-in.ts` |
| * Se true, executa chunks em paralelo com Promise.all (sem limite). Padrão: false (sequencial, mais gentil com o DB). Preferir maxConcurrency com limite explícito. */ | `supabase/functions/_shared/chunked-in.ts` |
| * Limite de chunks simultâneos (pool). Tem precedência sobre `parallel` quando > 0. */ | `supabase/functions/_shared/chunked-in.ts` |
| * Rule: dentro de `supabase/functions/**`, chamadas `.in('coluna', arrayDinamico)` | `supabase/functions/_shared/chunked_in_lint_test.ts` |
| Testes in-process e runtimes sem permissão de ambiente mantêm o | `supabase/functions/_shared/cors.ts` |
| * Rule: `corsHeaders` MUST be declared exactly once across the entire | `supabase/functions/_shared/cors_lint_test.ts` |
| 1. The canonical declaration must exist. | `supabase/functions/_shared/cors_lint_test.ts` |
| * Heurística (somente sinais já persistidos): | `supabase/functions/_shared/deal-probability-calc.ts` |
| 2 entradas não acionam o fator (regra exige > 2 registros) | `supabase/functions/_shared/deal-probability-calc_test.ts` |
| ["']forbidden["']/); | `supabase/functions/_shared/edge-runtime-regressions_contract_test.ts` |
| Validação de "magic bytes" (assinatura binária) para uploads. | `supabase/functions/_shared/file-signature.ts` |
| O Content-Type declarado pelo cliente é apenas um header — o servidor | `supabase/functions/_shared/file-signature.ts` |
| Regra: assinatura conhecida fora do conjunto OU assinatura desconhecida | `supabase/functions/_shared/file-signature.ts` |
| missing required page | `supabase/functions/_shared/fuzz_test.ts` |
| service_role. Não substitui a autenticação de usuário: só deve ser usada | `supabase/functions/_shared/internal-service-auth.ts` |
| inteiro deve falhar (ex.: cron-failure-alerter — nada é melhor que dado ruim). | `supabase/functions/_shared/notification-categories.ts` |
| * Split-based: separa válidas de inválidas. Use quando o job deve continuar | `supabase/functions/_shared/notification-categories.ts` |
| Todo edge function que insere em `notifications` DEVE passar por | `supabase/functions/_shared/notification-inserters_test.ts` |
| _shared/rate-limit.ts | `supabase/functions/_shared/rate-limit.ts` |
| limiter — the effective global limit is (instances × limit). For basic abuse | `supabase/functions/_shared/rate-limit.ts` |
| como chave de bucket de rate limit. A verificação de identidade continua | `supabase/functions/_shared/rate-limit.ts` |
| A presença de um Bearer não prova autenticação. A validação de JWT é | `supabase/functions/_shared/rate-limit.ts` |
| * Convenience: enforce a limit and return a 429 Response when exceeded. | `supabase/functions/_shared/rate-limit.ts` |
| mensagem real ("simulated_failure") vai apenas para o log estruturado. | `supabase/functions/_shared/request-id-fuzz_test.ts` |
| Serve apenas para correlação em logs — nunca para decisão de autorização. | `supabase/functions/_shared/request-id.ts` |
| * Número máximo de tentativas adicionais após a falha inicial. */ | `supabase/functions/_shared/retry-policy.ts` |
| 'unsafe-inline' apenas para style (as páginas usam <style>/style=). | `supabase/functions/_shared/security-headers.ts` |
| * Objetivo: nunca estourar o limite por minuto do provedor nem monopolizar a | `supabase/functions/_shared/send-pacer.ts` |
| * Máximo de mensagens enfileiradas por minuto. */ | `supabase/functions/_shared/send-pacer.ts` |
| * Regra: bounce permanente (hard), reclamação de spam e descadastro no | `supabase/functions/_shared/unsubscribe.ts` |
| * Shared validation utilities for Edge Functions | `supabase/functions/_shared/validation.ts` |
| Uses Zod-like manual validation for Deno edge runtime. | `supabase/functions/_shared/validation.ts` |
| * Collect validation errors, returning a 400 response if any | `supabase/functions/_shared/validation.ts` |
| * Testes do validador compartilhado de payloads (AUD-VALIDACAO). | `supabase/functions/_shared/validation_test.ts` |
| * A validação precisa ocorrer sobre o corpo bruto, antes de qualquer parse ou | `supabase/functions/_shared/webhook-auth.ts` |
| * Score mínimo para um deal entrar na lista de at-risk (lente win-loss | `supabase/functions/_shared/winloss-contract.ts` |
| Rate limit por usuário autenticado (fallback: IP) — endpoint de IA consome créditos | `supabase/functions/ai-agent-orchestrator/index.ts` |
| Rate limit por usuário autenticado (fallback: IP) — endpoint de IA consome créditos | `supabase/functions/ai-copilot/index.ts` |
| Contract validation | `supabase/functions/ai-copilot/index.ts` |
| Rate limit por usuário autenticado (fallback: IP) — endpoint de IA consome créditos | `supabase/functions/ai-email-composer/index.ts` |
| Rate limit por usuário autenticado (fallback: IP) — endpoint de IA consome créditos | `supabase/functions/analyze-call/index.ts` |
| Rate limit por usuário autenticado (fallback: IP) — endpoint de IA consome créditos | `supabase/functions/analyze-conversation/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos | `supabase/functions/analyze-pipeline-coverage/index.ts` |
| anônimo não pode gravar snapshots gerenciais nem gastar créditos de IA. | `supabase/functions/analyze-pipeline-coverage/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador) | `supabase/functions/analyze-sentiment-timeline/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador) | `supabase/functions/analyze-skill-gaps/index.ts` |
| Generate AI tracks (limit concurrency: sequential to avoid rate limits) | `supabase/functions/analyze-skill-gaps/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador) | `supabase/functions/analyze-stage-conversion/index.ts` |
| Rate limit por usuário autenticado (fallback: IP) — endpoint de IA consome créditos | `supabase/functions/analyze-win-loss/index.ts` |
| Phase 1: run all rule-match RPCs in parallel (was sequential per saleId) | `supabase/functions/auto-enroll-cadence/index.ts` |
| 86400000).toISOString()).limit(50), | `supabase/functions/automation-suggestions/index.ts` |
| 86400000).toISOString()).limit(10000), | `supabase/functions/automation-suggestions/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador) | `supabase/functions/behavioral-analysis/index.ts` |
| Refresh token — apenas chamadas internas (service_role) ou admin/manager. | `supabase/functions/bitrix24-oauth/index.ts` |
| Margem de segurança: o access token do Bitrix24 expira em ~1h; renovamos | `supabase/functions/bitrix24-sync/index.ts` |
| Os métodos *.list do Bitrix24 retornam no máximo 50 itens por chamada e | `supabase/functions/bitrix24-sync/index.ts` |
| Paginação completa com ORDER estável: `.limit(1000)` solto lia só a | `supabase/functions/bitrix24-sync/index.ts` |
| os dois, o marcador expira e o próximo run reclama. | `supabase/functions/bitrix24-sync/index.ts` |
| ux_icp_data_bitrix_id. O lease expira por TTL — um run morto não | `supabase/functions/bitrix24-sync/index.ts` |
| não pode apagar o lock do run que o herdou. | `supabase/functions/bitrix24-sync/index.ts` |
| A consulta com o JWT do chamador aplica RLS e prova acesso ao negócio | `supabase/functions/calculate-committee-coverage/index.ts` |
| Rate limit por usuário autenticado (fallback: IP) — endpoint de IA consome créditos | `supabase/functions/calculate-deal-health/index.ts` |
| ["']forbidden["']/.test(source), | `supabase/functions/campaign-health-alert/authz_test.ts` |
| Autorização: apenas chamada interna (service_role ou X-Cron-Secret do pg_cron). | `supabase/functions/check-quote-expiration/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador) | `supabase/functions/coaching-session-prep/index.ts` |
| Deals parados = status ABERTO apenas — .neq('completed') marcava | `supabase/functions/create-stagnant-tasks/index.ts` |
| anon key deve receber 401. | `supabase/functions/csat-ces-trigger/index.ts` |
| name/company casa com accounts.name (mesma regra do trigger | `supabase/functions/customer-success-360/index.ts` |
| continuaria resolvendo para null. Busca separada, sem limite. | `supabase/functions/customer-success-360/index.ts` |
| 1. Pull all at-risk deals with owner (RLS bypassed via service role — required for cross-user cron). | `supabase/functions/deal-risk-digest/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador) | `supabase/functions/detect-at-risk-deals/index.ts` |
| Pull recent sales (limit to last 3 years to keep memory bounded) | `supabase/functions/detect-client-churn-alerts/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador) | `supabase/functions/detect-coaching-opportunities/index.ts` |
| Rate limit por usuário autenticado (fallback: IP) — endpoint de IA consome créditos | `supabase/functions/detect-critical-moments/index.ts` |
| Singular/plural folding (root must stay ≥4 chars to avoid mangling short stems). | `supabase/functions/detect-winloss-at-risk/_testHelpers.ts` |
| 1. `string`              — substring must appear (single AND). | `supabase/functions/detect-winloss-at-risk/_testHelpers.ts` |
| 2. `string[]`            — at least one substring must appear (pure OR). | `supabase/functions/detect-winloss-at-risk/_testHelpers.ts` |
| 3. `{ all; anyOf? }`     — every `all` substring must appear AND, when | `supabase/functions/detect-winloss-at-risk/_testHelpers.ts` |
| Use this when an action must mention a core | `supabase/functions/detect-winloss-at-risk/_testHelpers.ts` |
| concept ("desconto") together with one of | `supabase/functions/detect-winloss-at-risk/_testHelpers.ts` |
| 2. Token fallback — every significant token of the expected label must | `supabase/functions/detect-winloss-at-risk/_testHelpers.ts` |
| 'desconto' (required) + at least one of [ROI, valor] | `supabase/functions/detect-winloss-at-risk/_testHelpers_test.ts` |
| missing required token | `supabase/functions/detect-winloss-at-risk/_testHelpers_test.ts` |
| required token present but no anyOf qualifier → still fails | `supabase/functions/detect-winloss-at-risk/_testHelpers_test.ts` |
| Calibration: medium/low must NEVER carry urgency markers. | `supabase/functions/detect-winloss-at-risk/action_matrix_combinations_test.ts` |
| mas ainda deve carregar prazo concreto | `supabase/functions/detect-winloss-at-risk/competitor_critical_test.ts` |
| Engine deve calcular severity critical (score alto + confidence alta). | `supabase/functions/detect-winloss-at-risk/competitor_critical_test.ts` |
| breakdown deve expor matches do competitor com pelo menos uma keyword. | `supabase/functions/detect-winloss-at-risk/competitor_critical_test.ts` |
| The suggested action MUST contain at least one of the canonical imperative | `supabase/functions/detect-winloss-at-risk/critical_imperative_tokens_test.ts` |
| Per-family fragments that MUST appear, and fragments that must NOT appear | `supabase/functions/detect-winloss-at-risk/fallback_determinism_test.ts` |
| outcome must NOT be "won" (which would override to win-string) | `supabase/functions/detect-winloss-at-risk/fallback_determinism_test.ts` |
| * History-driven catalog validation. For each family in `DEAL_HISTORY_FIXTURES` | `supabase/functions/detect-winloss-at-risk/history_catalog_test.ts` |
| Either explicit override or group default must be non-empty. | `supabase/functions/detect-winloss-at-risk/history_catalog_test.ts` |
| (1) Every included case must declare patternTypeOneOf. | `supabase/functions/detect-winloss-at-risk/lse_fixtures_test.ts` |
| (2) Declared union must equal expected set (no extras, no omissions). | `supabase/functions/detect-winloss-at-risk/lse_fixtures_test.ts` |
| * End-to-end scenario validation: each fixture deal goes through `computeDealRisk` | `supabase/functions/detect-winloss-at-risk/scenarios_test.ts` |
| Reasons include all required substrings | `supabase/functions/detect-winloss-at-risk/scenarios_test.ts` |
| Limit is respected | `supabase/functions/detect-winloss-at-risk/scenarios_test.ts` |
| reasonsInclude → all needles must hit some reason (AND). | `supabase/functions/detect-winloss-at-risk/scenarios_test.ts` |
| Sanity invariants — must always hold. | `supabase/functions/detect-winloss-at-risk/scenarios_test.ts` |
| - excluded scenarios (filtered at threshold=40) must resolve to "low" | `supabase/functions/detect-winloss-at-risk/scenarios_test.ts` |
| - included scenarios must land in a severity bucket that is reachable from | `supabase/functions/detect-winloss-at-risk/scenarios_test.ts` |
| 1. The computed severity must be reachable from the declared score band. | `supabase/functions/detect-winloss-at-risk/scenarios_test.ts` |
| 2. The computed severity must be coherent with the actual score: | `supabase/functions/detect-winloss-at-risk/scenarios_test.ts` |
| And the bucket must overlap the declared band. | `supabase/functions/detect-winloss-at-risk/scenarios_test.ts` |
| 1. Urgency must decrease monotonically as severity drops (lost outcome). | `supabase/functions/detect-winloss-at-risk/urgency_scale_outcome_symmetry_test.ts` |
| critical must always be the strongest tier (3). | `supabase/functions/detect-winloss-at-risk/urgency_scale_outcome_symmetry_test.ts` |
| critical must be strictly more urgent than low (real differentiation). | `supabase/functions/detect-winloss-at-risk/urgency_scale_outcome_symmetry_test.ts` |
| At least one intermediate step must drop (no flat 3,3,3,X scale). | `supabase/functions/detect-winloss-at-risk/urgency_scale_outcome_symmetry_test.ts` |
| Rate limit por usuário autenticado (fallback: IP) — endpoint de IA consome créditos | `supabase/functions/diarize-call-recording/index.ts` |
| Guard-rail estático: disparos externos não podem voltar a aceitar somente | `supabase/functions/dispatch-webhook/authz_test.ts` |
| mesma regra antes de usar service_role e disparar destinos externos. | `supabase/functions/dispatch-webhook/index.ts` |
| Rate limit por usuário autenticado (fallback: IP) — endpoint de IA consome créditos | `supabase/functions/elevenlabs-stt/index.ts` |
| Rate limit por usuário autenticado (fallback: IP) — endpoint de IA consome créditos | `supabase/functions/elevenlabs-tts/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador) | `supabase/functions/elevenlabs-voice/index.ts` |
| Filtra antes do LIMIT para que reprocessamentos futuros não ocupem a | `supabase/functions/email-bulk-retry/index.ts` |
| Vazão controlada: protege o limite do provedor e a fila compartilhada. | `supabase/functions/email-bulk-send/index.ts` |
| Rate limit por usuário autenticado (fallback: IP) — endpoint de IA consome créditos | `supabase/functions/email-composer-bulk/index.ts` |
| O token limita o efeito, mas a rota ainda é pública e não deve permitir | `supabase/functions/email-unsubscribe/index.ts` |
| Contract validation | `supabase/functions/execute-workflow/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador) | `supabase/functions/extract-coaching-actions/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador) | `supabase/functions/extract-committee-from-call/index.ts` |
| Resolve owner_id (required by deal_stakeholders) | `supabase/functions/extract-committee-from-call/index.ts` |
| Rate limit por usuário autenticado (fallback: IP) — endpoint de IA consome créditos | `supabase/functions/extract-deal-stakeholders/index.ts` |
| Auth: requer JWT do usuário. Rate-limit: 20 req/min por usuário. | `supabase/functions/forecast-narrative/index.ts` |
| Retry apenas em 429 / 5xx. 402/4xx não-retryable — throw como Response e isRetryable filtra. | `supabase/functions/forecast-narrative/index.ts` |
| Rate limit por usuário autenticado (fallback: IP) — endpoint de IA consome créditos | `supabase/functions/generate-coaching-actions/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador) | `supabase/functions/generate-executive-briefing/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos | `supabase/functions/generate-loss-coaching/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador) | `supabase/functions/generate-revenue-forecast/index.ts` |
| • não tinha rate limit nem cache; | `supabase/functions/geocode-proxy/index.ts` |
| Forma/limite dos campos via validador compartilhado; as regras de | `supabase/functions/geocode-proxy/index.ts` |
| negócio abaixo (granularidade, dígitos do CEP, city+uf em par) ficam. | `supabase/functions/geocode-proxy/index.ts` |
| Marca APENAS a execução enviada mais recente — senão uma | `supabase/functions/inbound-email-webhook/index.ts` |
| Contract validation | `supabase/functions/lead-scoring/index.ts` |
| PostgREST `?id=in.(...)` has a URL length limit (~8KB gateway cap); | `supabase/functions/lead-scoring/index.ts` |
| For this simulation, we'll focus on contract validation and logic coverage | `supabase/functions/lead-scoring/lead-scoring_test.ts` |
| Telemetria pública não deve aceitar um Bearer sintático como bypass de limite. | `supabase/functions/log-web-vitals/index.ts` |
| Rate limit por usuário autenticado (fallback: IP) — endpoint de IA consome créditos | `supabase/functions/mine-win-loss-patterns/index.ts` |
| * Faz o parse somente depois de validar a assinatura sobre o corpo bruto. */ | `supabase/functions/multichannel-status-webhook/index.ts` |
| Input validation | `supabase/functions/new-device-alert/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador) | `supabase/functions/next-best-action/index.ts` |
| Auth required (verify_jwt = true). Uses caller JWT so RLS applies. | `supabase/functions/nlq-query/index.ts` |
| Rate limit por usuário autenticado (fallback: IP) — endpoint de IA consome créditos | `supabase/functions/nlq-query/index.ts` |
| Guarda de configuração: sem secrets, apenas conta o backlog e retorna | `supabase/functions/notify-v4-quote-status/index.ts` |
| *Dica do Coach**\n${coachTip ?? "Faça um contato objetivo com o próximo passo e prazo claramente combinados."}\n\nQual prioridade você quer atacar primeiro?`; | `supabase/functions/personal-assistant-stream/fallback.ts` |
| Rate limit por usuário autenticado (fallback: IP) — endpoint de IA consome créditos | `supabase/functions/personal-assistant-stream/index.ts` |
| externa (Lovable AI Gateway), aqui testamos apenas as unidades puras | `supabase/functions/personal-assistant-stream/personal-assistant-stream_test.ts` |
| (validação de modo e prompt building) exportadas se disponíveis, além de | `supabase/functions/personal-assistant-stream/personal-assistant-stream_test.ts` |
| simular a checagem de erros de validação/CORS via chamada direta ao handler | `supabase/functions/personal-assistant-stream/personal-assistant-stream_test.ts` |
| Não deve declarar um objeto corsHeaders próprio (regra do lint compartilhado). | `supabase/functions/personal-assistant-stream/personal-assistant-stream_test.ts` |
| O agregado retorna indicadores de todo o time e, portanto, não pode usar | `supabase/functions/pipeline-pulse-aggregator/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador) | `supabase/functions/predict-deal-velocity/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador) | `supabase/functions/predict-quota-attainment/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador) | `supabase/functions/predictive-intelligence/index.ts` |
| Rate limit por IP — endpoint de IA consome créditos (função não autentica chamador) | `supabase/functions/predictive-scoring-explain/index.ts` |
| Win-rate por faixa de desconto → slope linear (elasticidade medida). | `supabase/functions/pricing-intelligence/index.ts` |
| Validação mínima defensiva — dados vêm de cliente autenticado, mas nunca confiar. | `supabase/functions/process-call-recording-ingest/index.ts` |
| 6. eventos derivados (overtake/checkpoint/victory) emitem no máximo uma | `supabase/functions/process-race-event/index.ts` |
| vendas antigas não pode farmar boosts sem nova sequência. | `supabase/functions/process-race-event/index.ts` |
| Rate limit por usuário autenticado (fallback: IP) — endpoint de IA consome créditos | `supabase/functions/purchase-intelligence-forecast/index.ts` |
| … +104 linhas — lista completa em `context.json` | |
