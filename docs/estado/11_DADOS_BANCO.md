# 11 — DADOS E BANCO (evidência de runtime)

> **Auditoria por medição direta em PRODUÇÃO.** Todas as consultas foram `SELECT` puro via MCP `SUPABASE_PROMO_CHAMPIONS_-_V2_MCP`. Nenhum DDL, DML, `ANALYZE` ou `VACUUM` foi executado.
> **Data da coleta:** 2026-08-16 (referência de relógio do banco: última execução de cron às `2026-08-16 13:30:00+00`).
> **Instância:** PostgreSQL 17.6 on x86_64-pc-linux-gnu (gcc 15.2.0).

---

## 0. Confirmação dos fatos previamente reportados — `VERIFICADO`

Query de verificação executada contra `information_schema` / `pg_catalog`:

| Fato reportado | Medido agora | Status |
|---|---|---|
| 397 tabelas no schema `public` | **397** | ✅ confirmado |
| 35 views no schema `public` | **35** | ✅ confirmado |
| 281 funções no schema `public` | **281** | ✅ confirmado |
| 70 MB de banco | **70 MB** (`pg_database_size`) | ✅ confirmado |
| 584 arquivos de migration no repo | **584** (`ls supabase/migrations/`) | ✅ confirmado |
| 11 jobs pg_cron ativos | **11 jobs, 11 ativos** | ✅ confirmado |

Complementos medidos não presentes no relatório anterior:

| Objeto | Quantidade |
|---|---|
| Materialized views (`public`) | 1 (`mv_competitive_ranking`) |
| Triggers de usuário (`public`) | 371 |
| Índices (`public`) | 1.350 |
| Policies de RLS (`public`) | 1.019 |
| Schemas não-sistema | 12 (`auth`, `cron`, `extensions`, `graphql`, `graphql_public`, `net`, `private`, `public`, `realtime`, `storage`, `vault`, `information_schema`) |
| Edge functions no repo (`supabase/functions/`) | 169 diretórios |

---

## 1. CENSO DE USO REAL — contagem exata de linhas — `VERIFICADO`

**Método (importante para reprodutibilidade):** `reltuples` foi **descartado deliberadamente**. Medição comprobatória: **335 das 397 tabelas (84,4%) têm `reltuples = -1`** (nunca analisadas) e **345 das 397 (86,9%) nunca passaram por `ANALYZE` nem `autoanalyze`** — qualquer estimativa por estatística do planner seria lixo. A contagem foi feita com `count(*)` real, via `query_to_xml(format('select count(*) as cnt from public.%I', table_name))` aplicado às 397 tabelas em uma única passagem.

### 1.1 Veredito do censo

| Métrica | Valor | Denominador |
|---|---|---|
| Tabelas com **pelo menos 1 linha** | **95** | de 397 (**23,9%**) |
| Tabelas com **exatamente 0 linhas** | **302** | de 397 (**76,1%**) |
| **Total de linhas em todo o schema `public`** | **33.636** | — |

> **Leitura executiva:** três em cada quatro tabelas do sistema nunca receberam um único registro. O banco inteiro tem 33.636 linhas — menos do que uma única tabela de log de um sistema em produção real. O schema descreve um produto muito maior do que o produto que efetivamente roda.

### 1.2 Tabelas populadas — ordenado por contagem DESC (95 de 397)

| # | Tabela | Linhas |
|---:|---|---:|
| 1 | `audit_logs` | 6.933 |
| 2 | `db_rollback_snapshots` | 6.501 |
| 3 | `activities` | 2.228 |
| 4 | `deal_stage_transitions` | 1.254 |
| 5 | `lead_score_history` | 1.221 |
| 6 | `error_logs` | 1.208 |
| 7 | `sales` | 954 |
| 8 | `commissions` | 942 |
| 9 | `deal_health_history` | 900 |
| 10 | `deal_health_scores` | 900 |
| 11 | `deal_velocity_predictions` | 900 |
| 12 | `lead_scores` | 900 |
| 13 | `quote_items` | 900 |
| 14 | `maintenance_log` | 732 |
| 15 | `deal_stakeholders` | 600 |
| 16 | `tasks` | 600 |
| 17 | `order_items` | 540 |
| 18 | `deal_outcomes` | 500 |
| 19 | `win_loss_analyses` | 500 |
| 20 | `stock_movements` | 478 |
| 21 | `account_activities` | 360 |
| 22 | `audit_log` | 329 |
| 23 | `quotes` | 301 |
| 24 | `order_status_events` | 267 |
| 25 | `orders` | 267 |
| 26 | `nps_surveys` | 250 |
| 27 | `price_history` | 200 |
| 28 | `quotes_inbound` | 154 |
| 29 | `feed_reactions` | 151 |
| 30 | `support_tickets` | 146 |
| 31 | `csat_ces_surveys` | 108 |
| 32 | `data_access_log` | 101 |
| 33 | `accounts` | 100 |
| 34 | `client_portfolio` | 100 |
| 35 | `clients` | 100 |
| 36 | `onboarding_journeys` | 100 |
| 37 | `product_usage_summary` | 100 |
| 38 | `renewals` | 100 |
| 39 | `feed_comments` | 90 |
| 40 | `victory_feed` | 80 |
| 41 | `page_analytics` | 75 |
| 42 | `supplier_products` | 41 |
| 43 | `automation_runs` | 39 |
| 44 | `daily_metrics` | 30 |
| 45 | `cron_failure_alerts` | 28 |
| 46 | `monthly_sales_summary` | 25 |
| 47 | `workflow_rules` | 23 |
| 48 | `qbr_schedule` | 20 |
| 49 | `price_alerts` | 18 |
| 50 | `salespeople` | 18 |
| 51 | `territories` | 18 |
| 52 | `inventory_levels` | 17 |
| 53 | `products` | 17 |
| 54 | `expansion_opportunities` | 14 |
| 55 | `sales_goals` | 12 |
| 56 | `activity_goals` | 9 |
| 57 | `sales_streaks` | 9 |
| 58 | `race_cars` | 8 |
| 59 | `sales_territories` | 8 |
| 60 | `automation_workflows` | 7 |
| 61 | `pipeline_stages` | 7 |
| 62 | `forecast_snapshots` | 6 |
| 63 | `notifications` | 6 |
| 64 | `stage_conversion_metrics` | 6 |
| 65 | `stage_inactivity_rules` | 6 |
| 66 | `suppliers` | 6 |
| 67 | `team_closers` | 6 |
| 68 | `access_denied_logs` | 4 |
| 69 | `achievements` | 4 |
| 70 | `active_power_ups` | 4 |
| 71 | `coaching_scorecard_config` | 4 |
| 72 | `win_loss_patterns` | 4 |
| 73 | `migration_log` | 3 |
| 74 | `race_seasons` | 3 |
| 75 | `revenue_forecasts` | 3 |
| 76 | `roles` | 3 |
| 77 | `sales_battles` | 3 |
| 78 | `slow_query_alerts` | 3 |
| 79 | `squads` | 3 |
| 80 | `teams` | 3 |
| 81 | `user_roles` | 3 |
| 82 | `v4_callback_dead_letters` | 2 |
| 83 | `_internal_secrets` | 1 |
| 84 | `auto_task_queue_settings` | 1 |
| 85 | `battle_participants` | 1 |
| 86 | `churn_alert_settings` | 1 |
| 87 | `competitive_seasons` | 1 |
| 88 | `external_seller_map` | 1 |
| 89 | `icp_parameters` | 1 |
| 90 | `pipelines` | 1 |
| 91 | `quote_sync_inbound_log` | 1 |
| 92 | `race_reactions` | 1 |
| 93 | `v4_callback_alert_settings` | 1 |
| 94 | `v4_callback_metrics` | 1 |
| 95 | `webhook_inbound_dedupe` | 1 |

**Observações de qualidade do dado (medidas, não inferidas):**

- As duas maiores tabelas do banco — `audit_logs` (6.933) e `db_rollback_snapshots` (6.501) — são **infraestrutura de auditoria/rollback**, não dado de negócio. Somadas: 13.434 de 33.636 linhas = **39,9% de todo o banco é meta-dado sobre o próprio banco.**
- O bloco de tabelas com exatamente **900 / 600 / 500 / 100 linhas** (`deal_health_scores`, `lead_scores`, `quote_items`, `tasks`, `deal_stakeholders`, `deal_outcomes`, `win_loss_analyses`, `clients`, `accounts`, `renewals`, `onboarding_journeys`, `client_portfolio`, `product_usage_summary`) tem a assinatura numérica redonda típica de **seed sintético**, não de acúmulo orgânico.
- `sales` tem `max(created_at) = 2026-08-29`, **13 dias no futuro** em relação à data de coleta (2026-08-16). Dado gerado, não transacionado.

### 1.3 LISTA COMPLETA — 302 tabelas com 0 linhas (de 397) — `VERIFICADO`

> Esta é a prova mais barata e mais direta de feature dormente do sistema. Cada nome abaixo é uma tabela criada, com RLS ligado, com policies, com índices — e sem um único registro.

`ab_tests` · `account_contacts` · `account_plans` · `active_sessions` · `activity_audit_logs`
`agenda_events` · `ai_agent_actions` · `ai_agent_runs` · `ai_narrative_cache` · `ai_sales_insights`
`api_tokens` · `approval_decisions` · `approval_requests` · `approval_workflows` · `asset_usage_logs`
`available_spins` · `bitrix24_sync_logs` · `blocked_ips` · `buying_committee` · `buying_committee_members`
`buying_signals` · `cadence_ab_assignments` · `cadence_ab_tests` · `cadence_advanced_stats` · `cadence_alert_templates`
`cadence_enrollment_rules` · `cadence_enrollments` · `cadence_funnel_rules` · `cadence_outcome_rules` · `cadence_steps`
`cadence_tasks` · `cadences` · `call_coaching_scorecards` · `call_conversation_metrics` · `call_critical_moments`
`call_insights` · `call_intelligence_triggers` · `call_logs` · `call_metric_benchmarks` · `call_objection_analysis`
`call_objections` · `call_question_analysis` · `call_questions` · `call_recording_ingest_jobs` · `call_recordings`
`call_sentiment_timeline` · `call_transcripts` · `campaign_health_alerts` · `category_metrics` · `challenge_progress`
`channel_credentials` · `channel_interactions` · `chat_conversations` · `chat_messages` · `circuit_breaker_events`
`client_churn_alerts_state` · `client_interactions` · `client_renewals` · `coaching_actions` · `coaching_opportunities`
`coaching_sessions` · `coaching_skill_benchmarks` · `cohort_analyses` · `collectible_badges` · `combo_tracking`
`commercial_approval_requests` · `commission_bonus_awards` · `commission_bonuses` · `commission_rules` · `committee_coverage_history`
`committee_extraction_runs` · `competitive_chat_messages` · `competitor_mentions` · `competitors_pricing` · `competitors_registry`
`contact_engagement_score` · `contact_send_time_profile` · `conversation_analyses` · `critical_moment_notifications` · `cs_tickets`
`custom_reports` · `daily_challenge_progress` · `daily_challenges` · `daily_streak_achievements` · `dashboard_layouts`
`dead_letter_replay_audit` · `deal_chat_history` · `deal_committee_coverage` · `deal_probability_scores` · `deal_risk_signals`
`deal_stage_history` · `deal_velocity_alerts` · `demand_forecasts` · `dialer_queue_items` · `dialer_queues`
`digital_signatures` · `document_signers` · `duplicate_block_logs` · `edge_retry_events` · `email_bulk_drafts`
`email_bulk_jobs` · `email_engagement_score_history` · `email_engagement_scores` · `email_logs` · `email_opt_outs`
`email_tracking_events` · `embedded_report_tokens` · `engagement_score_history` · `enriched_company_intelligence` · `entity_versions`
`executive_briefings` · `expansion_playbooks` · `experiment_assignments` · `experiment_variants` · `experiments`
`feature_flags` · `follow_up_audit_logs` · `follow_up_notifications` · `follow_up_settings` · `follow_up_templates`
`follow_up_territory_rules` · `forecast_accuracy` · `forecast_confidence_scores` · `forecast_deal_contributions` · `forecast_narrative_dead_letters`
`geo_access_logs` · `geo_blocked_regions` · `icp_data` · `inbound_reply_events` · `integration_autotest_jobs`
`integration_autotest_settings` · `integration_connections` · `integration_health_checks` · `integration_logs` · `intent_audit_logs`
`ip_whitelist` · `known_devices` · `kudos` · `lead_assignments` · `lead_churn_risk`
`lead_detailed_logs` · `lead_intelligence_metrics` · `lead_routing_log` · `lead_routing_rules` · `lead_score_explanations`
`lead_score_trends` · `lead_source_configs` · `league_history` · `league_members` · `leagues`
`login_alerts` · `login_attempts` · `message_templates` · `mfa_verification_attempts` · `mood_entries`
`mql_qualifications` · `notification_preferences` · `objection_library` · `objections_library` · `onboarding_steps`
`outbound_messages` · `password_history` · `password_reset_requests` · `performance_bets` · `performance_impact_factors`
`permissions` · `person_intelligence` · `personal_assistant_briefings` · `personal_assistant_nudges` · `pipeline_coverage_recommendations`
`pipeline_coverage_snapshots` · `pipeline_inspection_snapshots` · `pipeline_inspections` · `playbook_items` · `playbook_progress`
`playbooks` · `portfolio_settings` · `price_protection_rules` · `pricing_rules` · `prize_wheel_spins`
`product_stock_log` · `product_usage` · `product_usage_events` · `progressive_goals` · `prospect_cadences`
`push_subscriptions` · `qbr_reports` · `query_telemetry` · `quota_attainment_actions` · `quota_attainment_alerts`
`quota_attainment_forecasts` · `quota_attainment_predictions` · `quote_conversion_audit` · `quote_sync_logs` · `race_badges`
`race_daily_snapshots` · `race_events` · `race_overlay_telemetry` · `race_powerups` · `race_rivalries_persistent`
`race_scoring_rules` · `race_team_members` · `race_teams` · `race_unlocks` · `race_user_daily_checkins`
`race_user_preferences` · `rank_change_notifications` · `ranking_notifications` · `rate_limit_logs` · `rate_limit_settings`
`reauthentication_requests` · `report_embed_tokens` · `report_executions` · `report_schedules` · `role_permissions`
`sale_notifications_audit` · `sales_enablement_assets` · `salesperson_badges` · `salesperson_coaching_aggregates` · `salesperson_commission_configs`
`salesperson_custom_field_values` · `salesperson_leagues` · `salesperson_performance_telemetry` · `salesperson_preferences` · `salesperson_xp`
`saved_filters` · `scheduled_report_runs` · `scheduled_reports` · `scheduled_sends` · `score_change_logs`
`sdr_alert_configs` · `sdr_alert_history` · `sdr_performance_settings` · `security_alert_history` · `security_alert_settings`
`security_events` · `semantic_index` · `send_time_profiles` · `sequence_enrollments` · `sequence_step_assignments`
`sequence_step_executions` · `sequence_step_variants` · `sequence_steps` · `sequences` · `session_activity`
`skill_assessments` · `skill_development_tracks` · `sla_policies` · `sla_violations` · `sms_verification_codes`
`squad_members` · `stage_bottleneck_insights` · `stage_velocity_baselines` · `supplier_order_items` · `supplier_orders`
`supplier_risk_assessments` · `task_assignments` · `task_catalog` · `team_custom_fields` · `territory_history`
`tournament_matches` · `tournament_participants` · `tournaments` · `twilio_call_sessions` · `user_2fa`
`user_2fa_backup_codes` · `user_2fa_log` · `user_app_settings` · `user_mfa_settings` · `user_permissions_cache`
`user_winloss_preferences` · `v4_callback_alerts` · `web_vitals_samples` · `webauthn_challenges` · `webauthn_credentials`
`webhook_deliveries` · `webhook_events` · `webhook_inbound_log` · `webhook_logs` · `webhooks`
`website_visitor_logs` · `weekly_challenges` · `weekly_matchups` · `whatsapp_conversations` · `whatsapp_template_versions`
`win_calibration_buckets` · `win_loss_insight_comments` · `win_loss_insights` · `win_probability_calibrations` · `win_probability_deal_calibrations`
`winloss_alert_settings` · `winloss_webhook_alerts` · `winloss_webhook_dead_letters` · `winloss_webhook_deliveries` · `winloss_webhook_dispatch_metrics`
`winloss_webhook_replay_audit` · `winloss_webhook_replay_invocations` · `winloss_webhook_subscriptions` · `workflow_executions` · `workflows`
`xp_adjustments` · `xp_history`

#### Agrupamentos dormentes de maior peso (todos com 0 linhas)

| Domínio funcional | Tabelas zeradas | Amostra |
|---|---:|---|
| **Call Intelligence / gravação de chamada** | 18 | `call_transcripts`, `call_recordings`, `call_insights`, `call_sentiment_timeline`, `call_objections`, `call_questions`, `call_coaching_scorecards`, `twilio_call_sessions` |
| **Cadences / sequências de prospecção** | 22 | `cadences`, `cadence_steps`, `cadence_enrollments`, `cadence_tasks`, `sequences`, `sequence_steps`, `sequence_enrollments`, `prospect_cadences` |
| **Win/Loss + webhooks de win-loss** | 12 | `winloss_webhook_subscriptions`, `winloss_webhook_deliveries`, `winloss_webhook_dead_letters`, `win_loss_insights`, `win_probability_calibrations` |
| **Gamificação (race / liga / torneio / XP)** | 24 | `leagues`, `league_members`, `tournaments`, `race_teams`, `race_events`, `xp_history`, `salesperson_xp`, `prize_wheel_spins` |
| **Segurança avançada (2FA / WebAuthn / MFA / geo)** | 14 | `user_2fa`, `webauthn_credentials`, `mfa_verification_attempts`, `sms_verification_codes`, `known_devices`, `blocked_ips`, `ip_whitelist` |
| **E-mail / mensageria outbound** | 11 | `email_logs`, `email_bulk_jobs`, `email_tracking_events`, `outbound_messages`, `scheduled_sends`, `whatsapp_conversations` |
| **Webhooks e integrações genéricas** | 9 | `webhooks`, `webhook_events`, `webhook_deliveries`, `webhook_logs`, `integration_connections`, `integration_logs`, `bitrix24_sync_logs` |
| **Coaching / desenvolvimento** | 8 | `coaching_sessions`, `coaching_actions`, `skill_assessments`, `playbooks`, `playbook_progress` |
| **Aprovações / assinatura digital** | 7 | `approval_workflows`, `approval_requests`, `approval_decisions`, `digital_signatures`, `document_signers` |
| **Relatórios agendados / embed** | 8 | `scheduled_reports`, `report_executions`, `report_schedules`, `embedded_report_tokens`, `custom_reports` |

---

## 2. VIEWS — as 35 views retornam linhas? — `VERIFICADO`

Cada view foi consultada com `count(*)` real (mesmo método do censo).

| View | Linhas |
|---|---:|
| `activities_active` | 2.228 |
| `v_active_activities` | 2.228 |
| `sales_with_markup` | 954 |
| `tasks_active` | 600 |
| `v_security_definer_exposure` | 217 |
| `clients_active` | 100 |
| `v_active_clients` | 100 |
| `client_purchase_seasonality` | 83 |
| `v_platform_slo` | 30 |
| `v_active_products` | 17 |
| `race_leaderboard_view` | 16 |
| `race_spectator_view` | 16 |
| `revenue_forecast_view` | 12 |
| `salespeople_public` | 9 |
| `competitive_ranking` | 8 |
| `v_active_suppliers` | 6 |
| `v_active_teams` | 3 |
| `v_platform_wal_health` | 1 |
| `v_quote_to_sale_invariants` | 1 |
| `call_sentiment_summary` | **0** |
| `coaching_impact_metrics` | **0** |
| `contact_best_send_window` | **0** |
| `conversation_insights_summary` | **0** |
| `engagement_score_leaderboard` | **0** |
| `follow_up_audit_view` | **0** |
| `latest_briefing_view` | **0** |
| `race_rivalries_view` | **0** |
| `sequence_variant_performance` | **0** |
| `v_deleted_clients` | **0** |
| `v_pipeline_coverage_summary` | **0** |
| `v_quote_conversion_history` | **0** |
| `v_quote_conversion_metrics_daily` | **0** |
| `v_rate_limit_blocked_sellers` | **0** |
| `v_web_vitals_p75` | **0** |
| `web_vitals_p75_last7d` | **0** |

**Veredito:** **19 de 35 views (54,3%) retornam linhas; 16 de 35 (45,7%) retornam vazio.** As views vazias são consistentes com o censo — apoiam-se exclusivamente em tabelas zeradas (call intelligence, cadences, web vitals, pipeline coverage, quote conversion).

Nota relevante: existe uma view chamada **`v_security_definer_exposure` com 217 linhas** — exatamente o número de funções `SECURITY DEFINER` medido na seção 3. O próprio banco já instrumenta essa superfície de risco; a informação existe e não está sendo usada.

Materialized view: `mv_competitive_ranking` (1 de 1). **Não foi consultada com `REFRESH`** — auditoria não altera estado; a contagem de uma matview reflete o último refresh, não a realidade atual.

---

## 3. FUNÇÕES DO BANCO — 281 em `public` — `VERIFICADO`

### 3.1 Classificação por prefixo (prefixos com ≥ 3 funções)

| Prefixo | Funções | Dessas, `SECURITY DEFINER` | Tema |
|---|---:|---:|---|
| `get_*` | 35 | 32 | Leitura/consulta de agregados para o front |
| `fn_*` | 34 | 29 | Rotinas internas / manutenção / cron |
| `update_*` | 15 | 6 | Mutação de estado |
| `calculate_*` | 10 | 3 | Cálculo (score, comissão, forecast) |
| `is_*` | 9 | 9 | Predicados de autorização (usados em RLS) |
| `increment_*` | 7 | 7 | Contadores de gamificação |
| `log_*` | 7 | 5 | Auditoria |
| `check_*` | 7 | 4 | Validação/guarda |
| `record_*` | 7 | 7 | Registro de eventos |
| `sync_*` | 6 | 5 | Integrações |
| `handle_*` | 5 | 0 | Triggers de aplicação |
| `compute_*` | 5 | 5 | Cálculo derivado |
| `generate_*` | 5 | 4 | Geração de artefatos |
| `admin_*` | 5 | 5 | Operações administrativas |
| `has_*` | 4 | 4 | Predicados de papel (RLS) |
| `auto_*` | 4 | 3 | Automação |
| `cleanup_*` | 4 | 1 | Limpeza/retention |
| `notify_*` | 4 | 1 | Notificação |
| `process_*` | 4 | 3 | Processamento em lote |
| `trg_*` | 4 | 2 | Triggers |
| `validate_*` | 4 | 3 | Validação |
| `set_*` | 4 | 2 | Configuração |
| `detect_*`, `verify_*`, `search_*` | 3 cada | 3 cada | Detecção / verificação / busca |
| `audit_*`, `bulk_*`, `create_*` | 3 cada | 2 cada | Auditoria / lote / criação |

Restante (prefixos com < 3 ocorrências): 64 funções não agrupáveis por prefixo.

### 3.2 `SECURITY DEFINER` — superfície total

| Métrica | Valor | Denominador |
|---|---:|---|
| Funções `SECURITY DEFINER` | **217** | de 281 (**77,2%**) |
| Funções executáveis por `anon` | **46** | de 281 (16,4%) |
| Funções **`SECURITY DEFINER` E executáveis por `anon`** | **30** | de 281 (10,7%) — **superfície de risco** |

### 3.3 As 30 funções `SECURITY DEFINER` executáveis por `anon` — `VERIFICADO`

Cruzamento: `p.prosecdef = true AND has_function_privilege('anon', p.oid, 'EXECUTE')`.

| Função | Assinatura | Como `anon` chega nela |
|---|---|---|
| `add_league_weekly_xp` | `(p_salesperson_id uuid, p_xp integer)` | `PUBLIC` (default nunca revogado) |
| `add_salesperson_xp` | `(p_salesperson_id uuid, p_xp_amount integer, p_source text)` | `PUBLIC` |
| `audit_trigger` | `()` | `PUBLIC` |
| `auto_victory_post` | `()` | `PUBLIC` |
| `check_2fa_failed_attempts` | `(p_user_id uuid)` | `PUBLIC` |
| `claim_pending_cadence_tasks` | `(p_today date, p_limit integer)` | `PUBLIC` |
| `cleanup_expired_narrative_cache` | `()` | `PUBLIC` |
| `ensure_single_default_filter` | `()` | `PUBLIC` |
| `fn_quotes_inbound_ordering_guard` | `()` | `PUBLIC` |
| **`fn_test_backdate_cron_alert`** | `(_jobid bigint, _hours numeric)` | `PUBLIC` |
| **`fn_test_cleanup_cron_alerts`** | `(_jobid bigint)` | `PUBLIC` |
| **`fn_test_mark_cron_failure`** | `(_jobid bigint, _jobname text, _start_time timestamptz, _status text, _return_message text, _notified_admin_count integer)` | **`anon=X` — GRANT EXPLÍCITO a `anon`** |
| **`fn_test_simulate_stalled_check`** | `(_jobid bigint, _jobname text, _schedule text, _last_run timestamptz)` | `PUBLIC` |
| **`get_deleted_records`** | `(p_table_name text, p_limit integer)` | `PUBLIC` |
| `hard_delete_record` | `(p_table_name text, p_record_id uuid, p_admin_user_id uuid)` | `PUBLIC` |
| `has_role` | `(_user_id uuid, _role app_role)` | **`anon=X` — GRANT EXPLÍCITO a `anon`** |
| `increment_combo` | `(p_salesperson_id uuid)` | `PUBLIC` |
| `increment_goal_progress` | `(p_goal_id uuid, p_increment integer)` | `PUBLIC` |
| `is_country_blocked` | `(check_country_code text)` | `PUBLIC` |
| `is_email_opted_out` | `(_email text)` | `PUBLIC` |
| `log_audit_event` | `()` | `PUBLIC` |
| `log_data_access` | `()` | `PUBLIC` |
| `log_security_event` | `(p_event_type text, p_severity text, p_description text, p_metadata jsonb)` | `PUBLIC` |
| `protect_pa_nudge_content` | `()` | `PUBLIC` |
| **`restore_deleted_record`** | `(p_table_name text, p_record_id uuid, p_user_id uuid)` | `PUBLIC` |
| **`restore_record`** | `(table_name text, record_id uuid)` | `PUBLIC` |
| **`soft_delete_record`** | `(p_table_name text, p_record_id uuid, p_user_id uuid, p_reason text)` | `PUBLIC` |
| `trg_invalidate_forecast_narrative_cache` | `()` | `PUBLIC` |
| `trg_recording_generate_coaching` | `()` | `PUBLIC` |
| `trigger_auto_coaching_on_recording` | `()` | `PUBLIC` |

### 3.4 Análise de risco desta lista — `VERIFICADO`

Foi inspecionado o `proacl` e o corpo (`pg_get_functiondef`) de uma amostra dirigida:

| Função | ACL medido | Tem guarda interna (`auth.uid` / `has_role` / `is_admin`)? |
|---|---|---|
| `hard_delete_record` | `{=X/postgres,...}` → PUBLIC | **sim** |
| `add_salesperson_xp` | PUBLIC | **sim** |
| `increment_goal_progress` | PUBLIC | **sim** |
| `log_security_event` | PUBLIC | **sim** |
| `has_role` | **`anon=X` explícito** | **sim** |
| **`soft_delete_record`** | PUBLIC | **NÃO** |
| **`restore_record`** | PUBLIC | **NÃO** |
| **`restore_deleted_record`** | PUBLIC | **NÃO** |
| **`get_deleted_records`** | PUBLIC | **NÃO** |
| **`fn_test_mark_cron_failure`** | **`anon=X` explícito** | **NÃO** |

**Achados:**

1. **Vetor de escalonamento de privilégio confirmado por medição.** Quatro funções — `soft_delete_record`, `restore_record`, `restore_deleted_record`, `get_deleted_records` — são `SECURITY DEFINER` (rodam como `postgres`, **ignorando RLS**), recebem **`table_name` como texto arbitrário**, estão executáveis por `anon` via o `GRANT EXECUTE ... TO PUBLIC` default do PostgreSQL que nunca foi revogado, e **não têm nenhuma checagem interna de identidade ou papel**. Um chamador anônimo pode nomear qualquer tabela do schema. Os 1.019 policies de RLS não protegem nada nesse caminho — `SECURITY DEFINER` passa por cima deles.
2. **Funções de teste em produção, uma delas explicitamente concedida a `anon`.** As quatro `fn_test_*` são helpers de teste do subsistema de alerta de cron. `fn_test_mark_cron_failure` tem `anon=X/postgres` — um `GRANT` **deliberado**, não o default — e permite injetar registros falsos de falha de cron sem autenticação.
3. **Distinção importante para a remediação:** 28 das 30 exposições vêm do default `PUBLIC` do PostgreSQL (correção em bloco: `REVOKE EXECUTE ... FROM PUBLIC`), mas **2 são `GRANT` explícito a `anon`** (`has_role`, `fn_test_mark_cron_failure`) — essas foram concedidas por alguém, de propósito, e exigem decisão individual.

---

## 4. RLS — cobertura — `VERIFICADO`

| Métrica | Valor | Denominador |
|---|---:|---|
| Tabelas com RLS **habilitado** | **397** | de 397 (**100%**) |
| Tabelas **SEM** RLS | **0** | de 397 (0%) |
| Tabelas com RLS habilitado e **ZERO policies** | **0** | de 397 (0%) |
| Total de policies em `public` | **1.019** | — |
| Média de policies por tabela | 2,57 | — |

### (a) Tabelas SEM RLS
**NENHUMA.** As 397 tabelas do schema `public` têm `relrowsecurity = true`.

### (b) Tabelas COM RLS e ZERO policies (bug silencioso de inacessibilidade)
**NENHUMA.** Todas as 397 tabelas com RLS têm ao menos uma policy associada em `pg_policies`.

**Veredito da seção:** este é o único subsistema do banco que passa na auditoria **sem ressalva**. A cobertura de RLS é literalmente completa: 397/397 com RLS, 397/397 com policy. Não há tabela exposta e não há tabela acidentalmente inacessível.

**Ressalva obrigatória, porém:** essa cobertura de 100% **é contornada** pelas 217 funções `SECURITY DEFINER` (77,2% do total de funções), das quais 30 são alcançáveis por `anon` (seção 3.3). RLS impecável na porta da frente não compensa 30 portas laterais que rodam como superusuário. As duas seções devem ser lidas juntas.

---

## 5. DRIFT DE MIGRATIONS — nos dois sentidos — `VERIFICADO` (com um achado bloqueante)

### 5.1 Migrations aplicadas registradas no banco

```sql
select version, name from supabase_migrations.schema_migrations order by version;
```

**Resultado: `ERROR: 42P01: relation "supabase_migrations.schema_migrations" does not exist`**

Confirmado por listagem direta de schemas (`select nspname from pg_namespace`): os 12 schemas existentes são `auth`, `cron`, `extensions`, `graphql`, `graphql_public`, `information_schema`, `net`, `private`, `public`, `realtime`, `storage`, `vault`. **O schema `supabase_migrations` NÃO EXISTE neste banco.**

Confirmado também pelo endpoint de migrations do MCP, que retornou `"No migrations table found"`.

### 5.2 O achado

> ### 🔴 **O banco de produção não possui NENHUM registro de quais migrations foram aplicadas.**
>
> **Migrations versionadas no repositório: 584.**
> **Migrations com aplicação registrada no banco: 0 de 584 (0%).**
>
> Não existe drift "de N migrations". Existe **ausência total do livro-razão**. O ledger que tornaria a pergunta "o que já rodou aqui?" respondível simplesmente não está no banco.

**Consequências diretas, medidas:**

- É **impossível** determinar quais das 584 migrations foram aplicadas e quais não foram — não por dificuldade, por inexistência do registro.
- Rodar `supabase db push` contra este banco tentaria aplicar **as 584 do zero**, porque o CLI consulta exatamente a tabela que não existe.
- Não há como detectar se alguém aplicou SQL manualmente — não existe baseline contra o qual comparar.
- O `rollback` versionado é inoperante. Sintomaticamente, o banco mantém uma tabela própria `db_rollback_snapshots` com **6.501 linhas** (a 2ª maior do banco) — um mecanismo de rollback **caseiro**, construído por fora do fluxo de migrations, o que é evidência circunstancial de que a equipe já operava sem confiar no ledger.

### 5.3 Reforço — objetos VIVOS × objetos DECLARADOS

Como o ledger não existe, o drift foi medido pelo único caminho disponível: **comparar o conjunto de tabelas vivas no banco com o conjunto de tabelas declaradas por `CREATE TABLE` nas 584 migrations do repo.**

Método: extração de `CREATE TABLE [IF NOT EXISTS] [public.]<nome>` sobre `supabase/migrations/*.sql`, normalizada, comparada por `comm` com a lista de 397 tabelas vivas.

| Direção | Quantidade | Denominador |
|---|---:|---|
| Tabelas vivas no banco **sem nenhum `CREATE TABLE` em migration** | **3** | de 397 |
| Tabelas com `CREATE TABLE` em migration **que não existem no banco** | **1** | de 397 declaradas |

#### (a) Vivas em produção, criadas FORA do fluxo versionado — 3

| Tabela | Linhas | Evidência |
|---|---:|---|
| **`_internal_secrets`** | **1** | Nenhum `CREATE TABLE` no repo. Aparece apenas em `20260715184427_....sql`, que **cria uma policy sobre ela** (`CREATE POLICY "Deny all access to _internal_secrets"`) — ou seja, uma migration posterior corrige RLS de uma tabela que o repo nunca criou. |
| **`geo_access_logs`** | 0 | Nenhum `CREATE TABLE` no repo. Referenciada em 3 migrations, todas apenas manipulando policies. |
| **`geo_blocked_regions`** | 0 | Nenhum `CREATE TABLE` no repo. Em `20260317231542_....sql` há `DROP POLICY IF EXISTS ... ON public.geo_blocked_regions` — o repo dropa uma policy de uma tabela que ele nunca declarou existir. |

> **`_internal_secrets` é o caso mais grave:** uma tabela chamada "segredos internos", **com 1 registro dentro**, criada manualmente em produção, fora de todo controle de versão. Não há como saber quem a criou, quando, com qual estrutura, nem o que contém o registro. Sua única aparição no repo é uma migration de julho/2026 tapando um buraco de RLS que ela mesma abriu.

#### (b) Declaradas no repo, ausentes do banco — 1

| Tabela | Migration que a declara |
|---|---|
| `call_tracking` | `supabase/migrations/20260104182000_additional_tables.sql:4` → `CREATE TABLE IF NOT EXISTS call_tracking (...)` |

Uma migration versionada declara `call_tracking` e a tabela não existe em produção. Ou a migration nunca rodou, ou rodou e a tabela foi derrubada manualmente depois. **Sem o ledger, é indecidível qual das duas.**

*(Nota metodológica: a extração regex produziu 2 falsos positivos — `for` e `to` — provenientes de comentários do tipo `-- Create table for ...`. Foram identificados por inspeção e descartados. Não são tabelas.)*

### 5.4 Resposta direta: **o ambiente é reconstruível a partir do repositório?**

> ## **NÃO.**

Três razões independentes, cada uma suficiente por si:

1. **Não há ledger.** 0 de 584 migrations têm registro de aplicação. Não existe ponto de partida conhecido para uma reconstrução — nem sequer para verificar se a reconstrução deu certo.
2. **Há objetos de produção que o repositório não sabe criar.** 3 tabelas (`_internal_secrets`, `geo_access_logs`, `geo_blocked_regions`) existem em produção e nenhuma migration as cria. Um `db reset` a partir do repo produziria um banco **sem** essas três tabelas — e as migrations que aplicam policies sobre elas **falhariam**, quebrando a cadeia.
3. **Há divergência na direção oposta.** `call_tracking` é declarada e não existe, o que significa que o repo e a produção já divergiram estruturalmente pelo menos uma vez sem rastro.

**Classificação:** produção e repositório são **dois artefatos independentes que se parecem**, não um artefato versionado e sua cópia executada.

---

## 6. CRON — 11 jobs — `VERIFICADO`

### 6.1 Inventário completo com `command`

| jobid | jobname | schedule | active | command |
|---:|---|---|:---:|---|
| 1 | `weekly-league-reset` | `0 0 * * 1` | ✅ | `SELECT public.process_weekly_league_reset()` |
| 2 | `weekly-matchmaking` | `1 0 * * 1` | ✅ | `SELECT public.match_weekly_players()` |
| 3 | `purge-webhook-inbound-dedupe-30d` | `0 3 * * *` | ✅ | `DELETE FROM public.webhook_inbound_dedupe WHERE received_at < now() - interval '30 days';` |
| 4 | `purge-quote-sync-inbound-log-30d` | `15 3 * * *` | ✅ | `DELETE FROM public.quote_sync_inbound_log WHERE received_at < now() - interval '30 days';` |
| 6 | `cleanup-webhook-dedupe` | `0 */6 * * *` | ✅ | `SELECT public.fn_cleanup_webhook_dedupe();` |
| 7 | `cleanup-stale-logs-daily` | `15 3 * * *` | ✅ | `SELECT public.fn_cleanup_stale_logs(90);` |
| 8 | `purge-telemetry-retention-daily` | `30 3 * * *` | ✅ | `SELECT public.purge_telemetry_retention();` |
| 9 | `reset-pg-stat-statements-weekly` | `0 4 * * 1` | ✅ | `SELECT public.reset_pg_stat_statements_weekly();` |
| 10 | `enforce-telemetry-retention-daily` | `30 3 * * *` | ✅ | `SELECT public.enforce_telemetry_retention();` |
| 11 | `gc-call-recording-ingest-jobs` | `15 3 * * *` | ✅ | `SELECT public.fn_gc_call_recording_ingest_jobs();` |
| 12 | `campaign-health-alert-30min` | `*/30 * * * *` | ✅ | `SELECT public.trigger_campaign_health_alert();` |

**Nota:** os `jobid` vão de 1 a 12 com o **5 ausente** — um job foi removido em algum momento. Nenhum job dispara Edge Function diretamente por `net.http_post` no `command`; todos chamam funções `public.*`, e a chamada HTTP (quando há) acontece dentro do corpo da função — confirmado pelo tráfego em `net._http_response` (seção 8).

### 6.2 Histórico de execução — `cron.job_run_details` legível — `VERIFICADO`

| jobid | jobname | status | execuções | primeira | última |
|---:|---|---|---:|---|---|
| 1 | `weekly-league-reset` | succeeded | 1 | 2026-08-10 00:00 | 2026-08-10 00:00 |
| **2** | **`weekly-matchmaking`** | **failed** | **1** | 2026-08-10 00:01 | 2026-08-10 00:01 |
| 3 | `purge-webhook-inbound-dedupe-30d` | succeeded | 12 | 2026-08-05 03:00 | 2026-08-16 03:00 |
| 4 | `purge-quote-sync-inbound-log-30d` | succeeded | 12 | 2026-08-05 03:15 | 2026-08-16 03:15 |
| 6 | `cleanup-webhook-dedupe` | succeeded | 49 | 2026-08-04 12:00 | 2026-08-16 12:00 |
| 7 | `cleanup-stale-logs-daily` | succeeded | 12 | 2026-08-05 03:15 | 2026-08-16 03:15 |
| **8** | **`purge-telemetry-retention-daily`** | **failed** | **12** | 2026-08-05 03:30 | 2026-08-16 03:30 |
| **9** | **`reset-pg-stat-statements-weekly`** | **failed** | **1** | 2026-08-10 04:00 | 2026-08-10 04:00 |
| 10 | `enforce-telemetry-retention-daily` | succeeded | 12 | 2026-08-05 03:30 | 2026-08-16 03:30 |
| 11 | `gc-call-recording-ingest-jobs` | succeeded | 12 | 2026-08-05 03:15 | 2026-08-16 03:15 |
| 12 | `campaign-health-alert-30min` | succeeded | 581 | 2026-08-04 11:30 | 2026-08-16 13:30 |

- **Jobs que nunca rodaram: 0 de 11.** Todos têm histórico.
- **Jobs com falha: 3 de 11 (27,3%).** Todos os três com **100% de taxa de falha** — nunca tiveram uma execução bem-sucedida.
- Retenção do histórico: a janela observável começa em 2026-08-04 (≈12 dias). Contagens são dessa janela, não desde a criação dos jobs.

### 6.3 Os 3 jobs que FALHARAM — causa raiz medida (`return_message`)

| jobid | job | Taxa | Erro exato |
|---:|---|---|---|
| **2** | `weekly-matchmaking` | **1/1 = 100%** | `ERROR: function public.match_weekly_players() does not exist` |
| **8** | `purge-telemetry-retention-daily` | **12/12 = 100%** | `ERROR: column reference "table_name" is ambiguous` — `DETAIL: It could refer to either a PL/pgSQL variable or a table column` — `QUERY: EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name...` |
| **9** | `reset-pg-stat-statements-weekly` | **1/1 = 100%** | `ERROR: function pg_stat_statements_reset() does not exist` |

**Interpretação:**

1. **`weekly-matchmaking` (jobid 2) chama uma função que não existe no banco.** O job foi agendado apontando para `public.match_weekly_players()`, que não está entre as 281 funções de `public`. Este é **mais um sintoma direto do drift da seção 5**: o agendamento foi aplicado, a função não. Sem ledger de migrations, essa dessincronia é indetectável a não ser por falha em runtime.
2. **`reset-pg-stat-statements-weekly` (jobid 9) chama `pg_stat_statements_reset()`, que não existe** — a extensão `pg_stat_statements` não está instalada/exposta no `search_path` da função. O job de higiene de estatísticas nunca funcionou.
3. **`purge-telemetry-retention-daily` (jobid 8) é um bug de código PL/pgSQL**: uma variável local chamada `table_name` colide com a coluna `information_schema.tables.table_name`. Falha há 12 dias seguidos, todo dia às 03:30. **Nenhuma linha de telemetria foi purgada nessa janela.**
4. **Sobreposição perigosa:** os jobs 8 e 10 rodam **no mesmo minuto** (`30 3 * * *`) e fazem trabalho relacionado (`purge_telemetry_retention` e `enforce_telemetry_retention`). O 10 tem sucedido, o 8 falha — a retenção está sendo aplicada por metade do mecanismo desenhado.
5. **O sistema de alerta de falha de cron existe e registrou eventos:** `cron_failure_alerts` tem **28 linhas**, com `max(created_at) = 2026-08-04 11:30`. **Ou seja: o alerta parou de registrar em 04/08, mas o job 8 continuou falhando todo dia até 16/08.** O detector de falha de cron está, ele próprio, silencioso há 12 dias.

---

## 7. FILAS / OUTBOX / WEBHOOKS / INTEGRAÇÕES — há tráfego real? — `VERIFICADO`

Tabelas de fila, outbox, dedupe, dead-letter e log de integração identificadas por nome e conferidas com `count(*)` e `max(<timestamp>)`.

### 7.1 Com algum tráfego (7 tabelas)

| Tabela | Linhas | Último registro | Idade (vs. 2026-08-16) |
|---|---:|---|---|
| `quotes_inbound` | 154 | 2026-07-19 03:30:05 | **28 dias** |
| `automation_runs` | 39 | 2026-08-15 13:32:45 | 1 dia |
| `cron_failure_alerts` | 28 | 2026-08-04 11:30:03 | **12 dias** |
| `v4_callback_dead_letters` | 2 | 2026-07-06 20:56:36 | **41 dias** |
| `quote_sync_inbound_log` | 1 | 2026-07-19 03:30:06 | **28 dias** |
| `webhook_inbound_dedupe` | 1 | 2026-07-19 03:30:05 | **28 dias** |
| `v4_callback_metrics` | 1 | — | — |

### 7.2 Com ZERO tráfego — todo o restante da camada de integração

| Tabela | Linhas |
|---|---:|
| `webhooks` | 0 |
| `webhook_events` | 0 |
| `webhook_deliveries` | 0 |
| `webhook_logs` | 0 |
| `webhook_inbound_log` | 0 |
| `winloss_webhook_subscriptions` | 0 |
| `winloss_webhook_alerts` | 0 |
| `winloss_webhook_deliveries` | 0 |
| `winloss_webhook_dead_letters` | 0 |
| `winloss_webhook_dispatch_metrics` | 0 |
| `winloss_webhook_replay_audit` | 0 |
| `winloss_webhook_replay_invocations` | 0 |
| `integration_connections` | 0 |
| `integration_logs` | 0 |
| `integration_health_checks` | 0 |
| `integration_autotest_jobs` | 0 |
| `integration_autotest_settings` | 0 |
| `bitrix24_sync_logs` | 0 |
| `quote_sync_logs` | 0 |
| `email_logs` | 0 |
| `email_bulk_jobs` | 0 |
| `email_tracking_events` | 0 |
| `outbound_messages` | 0 |
| `scheduled_sends` | 0 |
| `edge_retry_events` | 0 |
| `dead_letter_replay_audit` | 0 |
| `circuit_breaker_events` | 0 |
| `forecast_narrative_dead_letters` | 0 |
| `v4_callback_alerts` | 0 |

**Veredito:** **7 de 36 tabelas de fila/integração (19,4%) já viram um registro; 29 de 36 (80,6%) estão em zero absoluto.** Das 7 com tráfego, **5 têm o último registro há 28–41 dias**. A única com movimento nas últimas 24h é `automation_runs` (39 linhas).

O quadro medido é: **o pipeline de webhook inbound rodou uma vez em 19/07 e parou.** As três tabelas dessa cadeia (`quotes_inbound`, `quote_sync_inbound_log`, `webhook_inbound_dedupe`) carimbam o **mesmo segundo** — `2026-07-19 03:30:05/06` — o que caracteriza um único evento de ingestão, não fluxo contínuo. Toda a infraestrutura de webhook genérica, de winloss webhooks (7 tabelas), de e-mail outbound e de integração com Bitrix24 nunca processou nada.

---

## 8. `pg_net` — o banco faz chamadas HTTP para fora? — `VERIFICADO`

| Métrica | Valor |
|---|---|
| `select count(*) from net._http_response` | **12** |
| `max(created)` em `net._http_response` | **2026-08-16 13:30:00.359+00** (mesmo dia da coleta) |
| `select count(*) from net.http_request_queue` (fila pendente) | **0** |
| Respostas com `status_code >= 400` ou nulo | **0 de 12** |

**Sim, há chamadas HTTP saindo do banco, e são atuais.** A última ocorreu às 13:30 do dia da auditoria — o mesmo minuto da última execução do job `campaign-health-alert-30min` (`*/30 * * * *`, última em `2026-08-16 13:30:00.28+00`). A correlação temporal identifica esse job como a origem do tráfego: `public.trigger_campaign_health_alert()` dispara HTTP via `pg_net` para uma Edge Function.

Ressalva metodológica obrigatória: `net._http_response` tem **TTL curto** (o `pg_net` expurga respostas antigas automaticamente). As 12 linhas são a **janela recente**, não o histórico total. A contagem prova *que há tráfego vivo*; **não** serve para medir volume histórico. Fila pendente em 0 e nenhuma resposta 4xx/5xx na janela indicam que o canal está saudável.

---

## 9. ÍNDICES E ESTATÍSTICAS (secundário) — `VERIFICADO`

| Métrica | Valor | Denominador |
|---|---:|---|
| Índices totais em `public` | 1.350 | — |
| Índices **nunca usados** (`idx_scan = 0`, excluindo PK e UNIQUE) | **497** | de 1.350 (**36,8%**) |
| Espaço ocupado pelos índices ociosos | **8.360 kB** (~8,2 MB) | de 70 MB (11,7% do banco) |
| Tabelas com `reltuples = -1` (nunca analisadas pelo planner) | **335** | de 397 (84,4%) |
| Tabelas sem `ANALYZE` nem `autoanalyze` | **345** | de 397 (86,9%) |
| Triggers de usuário | 371 | — |

**Interpretação:** 497 índices sem um único scan. A leitura, porém, precisa de cautela: como 302 das 397 tabelas estão vazias, boa parte desses índices simplesmente **nunca teve oportunidade de ser usada** — são índices sobre tabelas mortas, não índices mal projetados. O custo real hoje é modesto (8,2 MB), mas é custo de escrita permanente em cada `INSERT`/`UPDATE` futuro caso essas features sejam ativadas.

O número mais relevante desta seção é o de **335 tabelas com `reltuples = -1`**: é a prova quantitativa de que a instrução de não confiar em `reltuples` estava correta. Um censo baseado em estatística do planner teria reportado `-1` (ou zero) para 84,4% do schema, invertendo completamente o resultado.

*Nenhum `ANALYZE` foi executado para corrigir isso — auditoria observa, não altera.*

---

## 10. Síntese dos achados por severidade

| # | Achado | Severidade | Evidência |
|---:|---|---|---|
| 1 | **Ausência total do ledger de migrations.** `supabase_migrations.schema_migrations` não existe. 0 de 584 migrations com aplicação registrada. Ambiente **não reconstruível** a partir do repo. | 🔴 **Bloqueante** | §5.1, §5.2, §5.4 |
| 2 | **3 tabelas vivas em produção sem `CREATE TABLE` em nenhuma migration**, incluindo `_internal_secrets` (com 1 registro dentro). Drift manual confirmado. | 🔴 **Crítico** | §5.3(a) |
| 3 | **4 funções `SECURITY DEFINER` sem guarda interna, executáveis por `anon`, aceitando `table_name` arbitrário** (`soft_delete_record`, `restore_record`, `restore_deleted_record`, `get_deleted_records`) — contornam os 1.019 policies de RLS. | 🔴 **Crítico** | §3.3, §3.4 |
| 4 | **3 de 11 jobs de cron falham com 100% de taxa**, dois deles chamando funções inexistentes. `purge-telemetry-retention-daily` falha há 12 dias consecutivos. | 🟠 **Alto** | §6.3 |
| 5 | **O detector de falha de cron está ele próprio silencioso**: `cron_failure_alerts` parou em 04/08 enquanto o job 8 seguiu falhando até 16/08. | 🟠 **Alto** | §6.3 |
| 6 | **4 funções de teste (`fn_test_*`) em produção**, uma com `GRANT EXECUTE` **explícito** para `anon` e sem guarda (`fn_test_mark_cron_failure`). | 🟠 **Alto** | §3.3, §3.4 |
| 7 | **302 de 397 tabelas (76,1%) com zero linhas.** Domínios inteiros dormentes: call intelligence (18), cadences (22), gamificação (24), 2FA/WebAuthn (14), winloss webhooks (12). | 🟡 **Médio (dívida)** | §1.3 |
| 8 | **80,6% da camada de integração (29 de 36 tabelas) nunca processou nada**; o pipeline de webhook inbound rodou uma vez em 19/07 e parou. | 🟡 **Médio** | §7.2 |
| 9 | **16 de 35 views retornam vazio** por dependerem de tabelas zeradas. | 🟡 **Médio** | §2 |
| 10 | **1 tabela declarada em migration não existe no banco** (`call_tracking`) — divergência indecidível sem ledger. | 🟡 **Médio** | §5.3(b) |
| 11 | **39,9% de todo o volume do banco é meta-dado sobre o próprio banco** (`audit_logs` + `db_rollback_snapshots` = 13.434 de 33.636 linhas). | 🔵 **Observação** | §1.2 |
| 12 | **497 de 1.350 índices nunca usados** (8,2 MB) — majoritariamente sobre tabelas vazias. | 🔵 **Observação** | §9 |
| 13 | **RLS com cobertura literalmente completa**: 397/397 com RLS, 0 tabelas sem policy. Único subsistema sem ressalva estrutural. | ✅ **Positivo** | §4 |
| 14 | **`pg_net` com tráfego vivo e saudável**: última chamada no dia da coleta, fila em 0, zero respostas 4xx/5xx. | ✅ **Positivo** | §8 |

---

## 11. Registro de método e limitações

**Consultas executadas:** exclusivamente `SELECT`. Nenhum `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER`, `DROP`, `ANALYZE`, `VACUUM` ou `REFRESH MATERIALIZED VIEW`. Nenhuma migration aplicada. Nenhum arquivo do repositório alterado além deste.

**O que foi medido e o que não foi:**

| Item | Status |
|---|---|
| Contagem exata de linhas das 397 tabelas | `VERIFICADO` (`count(*)` real) |
| Contagem das 35 views | `VERIFICADO` |
| Classificação e ACL das 281 funções | `VERIFICADO` |
| RLS: cobertura e policies | `VERIFICADO` |
| Ledger de migrations aplicadas | `VERIFICADO` — **inexistente** (não é "não verificado": a ausência foi confirmada por 3 caminhos independentes) |
| Drift vivo × declarado (tabelas) | `VERIFICADO` (extração regex sobre 584 arquivos + `comm`) |
| Cron: jobs, schedules, commands | `VERIFICADO` |
| Cron: histórico e falhas (`cron.job_run_details`) | `VERIFICADO` — tabela legível |
| Filas/webhooks/integrações | `VERIFICADO` |
| `pg_net` | `VERIFICADO` (com ressalva de TTL — janela recente, não histórico) |
| Índices ociosos e estatísticas | `VERIFICADO` |
| Drift de **funções/views/policies** declaradas × vivas | `NAO_VERIFICADO` — a comparação foi feita apenas para **tabelas**. Comparar as 281 funções e 1.019 policies contra as 584 migrations exigiria parsing de SQL (não regex) e ficou fora do orçamento desta coleta. |
| Conteúdo de `_internal_secrets` | `NAO_VERIFICADO` — deliberadamente não lido. Auditoria não extrai segredos. |
| Volume histórico total de `pg_net` | `NAO_VERIFICADO` — impossível: `net._http_response` tem TTL e expurga automaticamente. |
| Estado real da matview `mv_competitive_ranking` | `NAO_VERIFICADO` — sua contagem reflete o último `REFRESH`, e `REFRESH` altera estado. Não executado. |
