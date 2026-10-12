# F — Camada de dados: funcionalidades planejadas no schema e não concluídas

Método: scripts Node temporários da sessão de auditoria (não versionados) que tokenizam as 644 migrations em ordem, separando corpos `$$`, blocos `DO` (recursivo), `CREATE/DROP TABLE|FUNCTION|VIEW|TRIGGER|TYPE`, `ALTER TABLE ... ADD/DROP/RENAME COLUMN`, `ENABLE RLS`, `cron.schedule/unschedule` e `ALTER FUNCTION ... SET SCHEMA private`. O estado final foi cruzado com índices de palavras de `src/` (sem `types.ts` e sem testes) e de `supabase/functions/` (sem testes). Testes, `scripts/` e `tools/` entram só como evidência secundária.

Uma função conta como "viva" quando é alcançada por pelo menos um destes caminhos: código (`.rpc`/string), trigger final, comando de cron, policy, expressão de DDL, bloco `DO` que cria trigger/policy dinamicamente, corpo de função `private.*`, ou outra função/view viva (ponto fixo).

Abreviação: `mig/<timestamp>` = `supabase/migrations/<timestamp>_*.sql`.

Números do estado final no repo: **400 tabelas**, **46 views**, **345 funções em public** (mais 54 movidas para `private`), **230 triggers**, **25 enums**, **30 jobs cron com nome**.

Limitações:
- O grep não enxerga escritores externos (n8n, gateway, ferramenta de desanonimização).
- Colunas criadas por `EXECUTE format()` dentro de loops `DO` não são capturadas (ex.: soft-delete em 20261001193000).
- Produção não tem ledger de migrations (docs/estado/11_DADOS_BANCO.md §5), então "aplicada" ≠ "existe no repo". Usei o `types.ts` (regerado em 2026-10-05, commit 40a7076) como espelho de produção.

---

## 1. Tabelas sem nenhum uso (código, edge, SQL vivo, view ou cron) — **36 de 400**

Mais **26** tabelas não têm leitor no app, mas são escritas/lidas por SQL vivo (ver 1.2). As 36 abaixo só aparecem nas próprias DDL/policies, em funções mortas ou em testes.

### 1.1 Abandonadas, por domínio

| Domínio (qtd) | Tabela | Evidência (CREATE) | Interpretação |
|---|---|---|---|
| Segurança / 2FA / sessão custom (7) | `user_2fa` | mig/20260104143929:2 (recriada 3x) | 2FA custom v1 substituído por `user_mfa_settings` e depois por MFA nativo GoTrue (mig/20261001203500). |
| | `user_2fa_log` | mig/20260104200000:30 | Idem. Só aparece em tests/e2e/rls-authorization-edge-cases.spec.ts:24. Ficou sem RLS até mig/20261001150000:19. |
| | `user_2fa_backup_codes` | mig/20260104200000:42 | Idem (backup codes nunca implementados). |
| | `password_history` | mig/20260104183000:4 | Política de reuso de senha nunca ligada (Auth gerencia senha). |
| | `session_activity` | mig/20260104183000:36 | Tracking de sessão abandonado. Só aparece em `anonymize_data_subject` (morta). |
| | `active_sessions` | mig/20251231120039:86 | Controle de sessão custom. `validate_session`/`refresh_session` também mortas. |
| | `data_subject_requests` | mig/20261001150100:96 | LGPD (DSAR) criado em 2026-10, sem UI nem edge. Só aparece em teste de contrato. |
| Experimentos A/B (4) | `experiments`, `experiment_variants`, `experiment_assignments` | mig/20260104182000:73/83/91 | Framework de experimentos genérico. Sem policies até hoje (deny-all). O app usa `cadence_ab_tests`. |
| | `ab_tests` | mig/20260105000006:2 | Idem (deny-all). |
| BI / relatórios agendados (4) | `report_schedules`, `report_executions` | mig/20260416234424:37/71 | Agendamento de relatórios via tabela nunca usado. O edge `scheduled-reports-runner` usa `scheduled_reports`. |
| | `embedded_report_tokens` | mig/20260416234424:102 | Embed de relatório v1. A função `get_embedded_report_by_token` está morta e o app usa `report_embed_tokens`. |
| | `cohort_analyses` | mig/20260416234424:128 | `compute_cohort_retention` foi movida para `private` (mig/20260619144542) e não tem chamador. |
| Voz / Conversation Intel (3) | `call_tracking` | mig/20260104182000:4 | Ausente em produção (não está em types.ts). Twilio usa `twilio_call_sessions`. |
| | `call_metric_benchmarks` | mig/20260418113523:31 | Benchmarks de chamada sem produtor. |
| | `call_intelligence_triggers` | mig/20260511191805:12 | Gatilhos de CI de chamadas nunca implementados. |
| Pipeline / Deals (3) | `deal_risk_signals` | mig/20260416195725:31 | Sinais de risco por deal. `calculate_deal_health` e `get_revenue_forecast` (mesma migration) também mortas. |
| | `buying_committee` | mig/20260513194107:76 | v1 substituída por `buying_committee_members`. |
| | `pipeline_inspections` | mig/20260513194107:108 | Inspeção de pipeline (snapshot por deal) sem UI. |
| Comercial / preço / estoque (5) | `pricing_rules` | mig/20260513180157:25 | Motor de precificação planejado. |
| | `product_stock_log` | mig/20260509153607:60 | Redundante com `stock_movements`. A trigger fn `handle_stock_on_sale` nunca foi anexada. |
| | `product_usage_events` | mig/20260416232618:82 | Product analytics (CS) sem produtor. |
| | `ai_sales_insights` | mig/20260515113801:9 | Insights de IA sem produtor. |
| | `salesperson_performance_telemetry` | mig/20260511192130:24 | Telemetria de pace. `calculate_performance_pace` também morta. |
| Leads / enriquecimento / SDR (4) | `enriched_company_intelligence`, `person_intelligence` | mig/20260513164208:2/32 | Enriquecimento persistido planejado. `enrich-lead` não grava (só contract_test.ts:30/34). |
| | `mql_qualifications` | mig/20260511141928:2 | Fluxo MQL. As colunas `activities.mql_qualified_at`/`qualification_score` também não têm uso (§5). |
| | `sdr_performance_settings` | mig/20260511141834:2 | Settings SDR sem leitor. |
| Cadências (1) | `cadence_advanced_stats` | mig/20260508134301:31 | O comentário diz "no futuro" (mig/20260508134301:29). |
| Coaching (1) | `coaching_scorecard_config` | mig/20260511191805:2 | Configuração de scorecard sem leitor. |
| Gamificação (1) | `race_user_preferences` | mig/20260419022222:2 | Preferências de corrida sem leitor. |
| Infra / integração (3) | `entity_versions` | mig/20241231000001:2 | Versionamento genérico. A trigger fn `create_version` nunca foi anexada. |
| | `migration_log` | mig/20251228000003:257 | Log de migrations caseiro, só INSERT one-shot. Deny-all. |
| | `webhook_logs` | mig/20260104143931:13 | Log v1 de webhooks, substituído por `webhook_deliveries` e outras. |

Diferença em relação a docs/DEAD_TABLES.md (24 "candidatas fortes"):
- **Entram na minha lista:** `entity_versions`, `migration_log`, `active_sessions`, `user_2fa*`, `session_activity`, `deal_risk_signals`, `report_*`, `embedded_report_tokens`, `cohort_analyses`, `call_metric_benchmarks`, `coaching_scorecard_config`, `enriched_company_intelligence`, `person_intelligence`, `data_subject_requests`. Motivo: as funções que as tocam também estão mortas.
- **Saem da minha lista:** `cadence_ab_assignments`, `price_protection_rules`, `website_visitor_logs`, `webhook_inbound_log`, `competitors_pricing`, `webauthn_*`. Motivo: têm escritor SQL vivo ou palavra no edge `webauthn`.

### 1.2 Sem leitor no app, só SQL interno — 26

Lista:
- Segurança e auditoria: `audit_log`, `mfa_verification_attempts`, `sms_verification_codes`, `data_access_log`, `security_events`, `dead_letter_replay_audit`, `consent_records`.
- Cadência e engajamento: `cadence_ab_assignments`, `contact_send_time_profile`, `lead_score_history`, `critical_moment_notifications`.
- Gamificação: `race_daily_snapshots`, `race_user_daily_checkins`, `league_history`.
- Comercial: `price_protection_rules`, `monthly_sales_summary`, `external_seller_map`, `quote_conversion_audit`.
- Integração e ops: `website_visitor_logs`, `webhook_inbound_log`, `maintenance_log`, `cron_failure_alerts`, `db_rollback_snapshots`, `data_retention_policies`, `edge_call_failures`, `status_transitions`.

Observações:
- `audit_log` está marcada como superseded por `audit_logs` (mig/20261001193100:117).
- `sms_verification_codes` e `mfa_verification_attempts` pertencem ao MFA custom, que foi descontinuado.

---

## 2. Funções SQL/RPC nunca chamadas — **90 de 345** em public (+2 RPCs quebradas por mudança de schema)

| Grupo (qtd) | Funções | Evidência | Interpretação |
|---|---|---|---|
| Stored procedures v1 sobre a tabela `deals`, que nunca foi criada (15) | `calculate_deal_probability`, `update_client_score`, `aggregate_sales_stats`, `cleanup_old_records`, `archive_old_data`, `calculate_team_performance`, `bulk_update_deal_stages`, `archive_old_activities`, `calculate_deal_health_score`, `generate_sales_forecast`, `reindex_tables`, `refresh_materialized_views`, `cleanup_deleted_records`, `cleanup_old_audit_logs`, `check_failed_attempts` | mig/20260105000005:6-90, mig/20260104181001:4-123, mig/20260104170153:53, mig/20260104184000:48 | Primeira geração do schema (modelo `deals`), abandonada quando o app passou a usar `sales`. As duas últimas tinham cron só em comentário (mig/20260104181000:100, mig/20260104184000:64). |
| Auth / MFA / sessão / dispositivo custom (17) | `count_failed_login_attempts`, `check_rate_limit`, `log_rate_limit`*, `is_mfa_enabled`, `validate_session`, `refresh_session`, `generate_device_fingerprint`, `is_known_device`, `get_user_permissions`, `has_pending_reset_request`, `count_reset_requests_24h`, `initialize_totp`, `verify_and_enable_totp`, `update_user_mfa_settings`, `check_2fa_failed_attempts`, `log_security_event`, `record_login_attempt` | mig/20251231120039:202-261, mig/20251231120846:137-186, mig/20251231121413:75-90, mig/20260321195552:16, mig/20260402114944:1 | Camada de segurança paralela ao GoTrue. O TOTP custom "aceitava qualquer código" (mig/20261001203500:3-6). `get_user_permissions` ficou para "pacote futuro" (mig/20261001203100:16). |
| Soft delete genérico via RPC (5) | `soft_delete_record`, `restore_deleted_record`, `get_deleted_records`, `hard_delete_record`, `restore_record` | mig/20260831130000:442-586 | Endurecidas em 2026-08-31, mas sem UI de lixeira. Só aparecem em canonical_hardening_contract_test.ts:104-108. |
| Gamificação (6) | `increment_sales_streak`, `increment_combo`*, `increment_goal_progress`*, `add_league_weekly_xp`*, `settle_performance_bets`*, `check_is_first_sale`* | mig/20260412115439:53-140, mig/20260512174528:54 | Combos, metas progressivas e liquidação de apostas sem chamador nem cron. `settle_performance_bets` foi desenhada para cron e nunca agendada. |
| Forecast / BI / CS (12) | `calculate_deal_health`, `get_revenue_forecast`, `compute_customer_health_v2`*, `compute_cohort_retention`*, `get_embedded_report_by_token`, `calculate_source_roi`, `reconcile_forecast_accuracy`, `calculate_performance_pace`, `calculate_lead_distribution`, `get_historical_benchmark`, `calculate_deal_risk_score`*, `get_stage_probability` | mig/20260416195725:69/156, mig/20260416232618:329, mig/20260513192524:158, mig/20261001220000:51 | O lado SQL de várias features de IA/BI foi substituído por edge functions ou nunca conectado. `reconcile_forecast_accuracy` deveria fechar o ciclo de acurácia do forecast. |
| Comercial (8) | `check_quote_expirations`*, `update_own_sale`, `enrich_lead_data`*, `assign_cadence_variant`*, `backfill_orders_conversion_seq`, `fn_backfill_orders_conversion_seq`, `fn_get_orders_conversion_seq_last`, `handle_stock_on_sale` (T) | mig/20260513192406:36/266, mig/20260412115357:13, mig/20260513192039:16, mig/20260708134149:7 | A expiração de cotações por SQL foi movida para `private` e nunca agendada; o edge `check-quote-expiration` também não está agendado (§3). O trigger de baixa de estoque nunca foi anexado. |
| Trigger functions nunca anexadas (6) | `log_audit`, `create_version`, `audit_trigger`, `log_lead_stage_transition`, `notify_sale_completion`, `handle_stock_on_sale` | mig/20250102000001:16, mig/20250102000003:16, mig/20260104200100:21, mig/20260513192607:20, mig/20260512192931:37 | Auditoria v1-v3 superseded por `audit_log_row_change` (mig/20261001193100:120-137). Notificação de venda foi substituída por `broadcast_sale_completed`. |
| Ops / admin / observabilidade (13) | `fn_list_cron_jobs`, `fn_admin_security_definer_exposure`, `fn_admin_cleanup_stale_logs`, `fn_admin_reset_circuit`, `cleanup_expired_narrative_cache`, `detect_stalled_cron_jobs`, `fn_cron_expected_interval`, `fn_cron_stalled_threshold`, `fn_slo_burn_rate`, `fn_check_slo_burn_rate`, `mark_entity_for_reindex`, `get_bulk_job_summary`, `get_user_role` | mig/20260707114840:21, mig/20260711153757:50/137, mig/20260712222949:45, mig/20260831130001:212, mig/20261002000100:63/101 | Painéis admin e detectores sem consumidor. O detector de cron travado (`detect_stalled_cron_jobs`) e o SLO burn-rate não têm cron. |
| Funções de teste em produção (5) | `fn_test_cleanup_dedupe_privileges`, `fn_test_simulate_stalled_check`, `fn_test_cleanup_cron_alerts`, `fn_test_backdate_cron_alert`, `fn_test_mark_cron_failure` | mig/20260712230734:70-125, mig/20260712230906:2 | Usadas só por testes Deno. Ainda existem em public. |
| LGPD (3) | `has_active_consent`, `anonymize_data_subject`, `is_email_opted_out` | mig/20261001150100:184/251, mig/20260726200015:56 | LGPD criado em 2026-10 sem chamador: o consentimento não é checado no envio e não existe fluxo de DSAR. O edge de email não chama `is_email_opted_out`. |

\* = função movida para o schema `private` (mig/20260619143950, mig/20260619144542, mig/20260619145322 — 54 funções no total).

### RPC quebradas detectadas no cruzamento

- `auto_pause_enrollment` é chamada em `supabase/functions/inbound-email-webhook/index.ts:159`, e `auto_promote_sequence_winners` em `supabase/functions/sequence-ab-promote/index.ts:42`. Ambas foram movidas para `private` em mig/20260619143950:9-24, sem recriação em public. O `config.toml` não expõe `private`, então o **auto-pause de cadência por reply/bounce e a promoção A/B de sequências falham**.
- `enqueue_email` é chamada em `supabase/functions/email-bulk-retry/index.ts:193`, mas **não existe em nenhuma migration nem em types.ts**. Isso quebra o retry de bulk email, e esse job está agendado (§3).
- `.from()` aponta para tabelas inexistentes:
  - `leads` (ai-agent-orchestrator/index.ts:300)
  - `team_members` (ranking-api/index.ts:89)
  - `auth_users_view` (src/components/settings/FollowUpTerritoryRules.tsx:83)
  - `geo_blocked_regions` e `geo_access_logs` (src/components/security/GeoBlockingManager.tsx:123/135) — existem só em produção, criadas fora do repo.

---

## 3. Jobs cron

### 3.1 Jobs declarados nas migrations (estado final no repo) — 30

| Job | Schedule | Alvo | Alvo existe? | Evidência / histórico |
|---|---|---|---|---|
| weekly-league-reset | `0 0 * * 1` | `process_weekly_league_reset()` | sim | mig/20260512144635:7; restaurado em mig/20260913150000:33 |
| weekly-matchmaking | `1 0 * * 1` | `match_weekly_players()` | sim no repo (recriada em mig/20260831130001:290). Em produção falhava com "does not exist" porque foi movida para `private` em mig/20260619144542:10 | mig/20260512144635:58. **Excluído de propósito do restore** (mig/20260913150000:12). Após o sumiço dos jobs em 2026-08-30, provavelmente não está agendado. |
| purge-webhook-inbound-dedupe-30d | `0 3 * * *` | DELETE `webhook_inbound_dedupe` | sim | mig/20260706211149:48 + restore |
| purge-quote-sync-inbound-log-30d | `15 3 * * *` | DELETE `quote_sync_inbound_log` | sim | mig/20260706211149:54 + restore |
| cleanup-webhook-dedupe | `0 */6 * * *` | `fn_cleanup_webhook_dedupe()` | sim | mig/20260706222315:51 → 20260707114840:14 → restore |
| cleanup-stale-logs-daily | `15 3 * * *` | `fn_cleanup_stale_logs(90)` | sim | mig/20260711153757:71 + restore |
| purge-telemetry-retention-daily | `30 3 * * *` | `purge_telemetry_retention()` | sim, mas com bug ("table_name ambiguous") | mig/20260712212417:47. **Excluído do restore** (mig/20260913150000:14). Sobrepõe-se a enforce-telemetry-retention. |
| reset-pg-stat-statements-weekly | `0 4 * * 1` | `reset_pg_stat_statements_weekly()` | sim, mas a extensão `pg_stat_statements` está ausente (11_DADOS §6.3) | mig/20260712212750:23 + restore (falha conhecida) |
| enforce-telemetry-retention-daily | `30 3 * * *` | `enforce_telemetry_retention()` | sim | mig/20260712213509:74 + restore |
| gc-call-recording-ingest-jobs | `15 3 * * *` | `fn_gc_call_recording_ingest_jobs()` | sim | mig/20260712232346:37 + restore |
| rollback-snapshot-5min | `*/5 * * * *` | `admin_capture_rollback_snapshot()` | sim | só no restore (mig/20260913150000:33). Não há migration original: o job foi criado fora do repo. |
| purge-rollback-snapshots-daily | `20 3 * * *` | `fn_purge_rollback_snapshots()` | sim | idem (só no restore) |
| purge-old-telemetry-daily | `15 3 * * *` | `purge_old_telemetry(90)` | sim | idem (só no restore) |
| detect-slow-queries-hourly | `20 * * * *` | `detect_slow_queries(500,100)` | sim | idem (só no restore) |
| data-retention-purge-daily | `45 3 * * *` | `fn_apply_data_retention()` | sim | mig/20261001151000:221 |
| campaign-health-alert-30min | `*/30 * * * *` | `trigger_campaign_health_alert()` → edge campaign-health-alert | fn sim; edge sim | mig/20260726202421:34. URL corrigida em mig/20261001160000 (antes apontava para o projeto antigo `rapjswienfhkobhlamxb`). |
| auto-task-queue-hourly | `0 * * * *` | `trigger_generate_urgent_client_tasks()` → edge generate-urgent-client-tasks | sim | mig/20260831163000:97 |
| detect-client-churn-alerts-hourly | `15 * * * *` | `trigger_detect_client_churn_alerts()` → edge | sim | mig/20260831163000:107 |
| notify-v4-quote-status-every-5min | `*/5` | `trigger_internal_edge_job('notify-v4-quote-status')` | sim | mig/20260910153000:70 |
| check-v4-callback-alerts-every-5min | `*/5` | edge check-v4-callback-alerts | sim | mig/20260910153000:78 |
| cron-failure-alerter-10min | `*/10` | edge cron-failure-alerter | sim | mig/20260910153000:86 |
| process-call-recording-ingest-1min | `* * * * *` | edge process-call-recording-ingest | sim | mig/20260910153000:94 |
| edge-retry-threshold-alert-15min | `*/15` | edge edge-retry-threshold-alert | sim | mig/20260831170000:109. **Não foi reagendado** no reconcile de 20260910 (permanece da versão 08-31). |
| deal-risk-digest-daily | `0 11 * * *` | edge deal-risk-digest | sim | mig/20260910153000:103 |
| email-bulk-retry-15min | `*/15` | edge email-bulk-retry | edge sim, mas chama a RPC `enqueue_email`, que não existe | mig/20260910153000:111 |
| wal-health-alert-5min | `*/5` | edge wal-health-alert | sim | mig/20261001144000:77 |
| winloss-webhook-health-monitor-15min | `*/15` | edge winloss-webhook-health-monitor | sim | mig/20261001144000:85 |
| webvitals-regression-alert-daily | `15 11 * * *` | edge webvitals-regression-alert | sim | mig/20261002010000:82 |

Todo `cron.unschedule` no repo é seguido de reschedule (padrão idempotente). Não existe unschedule definitivo.

**Bloqueio transversal.** Os 10 jobs via `trigger_internal_edge_job` e os 3 jobs SQL→HTTP leem `public._internal_secrets` (`functions_base_url`, `anon_key`, `coaching_cron_secret`) e lançam `internal_edge_job_secrets_missing` se alguma chave faltar (mig/20260910153000:31-38). docs/estado/IDENTIDADE_BANCO_2026-09-13.md:93-97 registra que `functions_base_url` e `anon_key` **não existem** na tabela.

Consequências:
- Esses 13 jobs HTTP não fazem nada útil.
- `_internal_secrets` não tem `CREATE TABLE` no repo.
- mig/20260913150000:2-3 registra que **os 25 jobs de produção sumiram em 2026-08-30**. Só os 12 SQL foram restaurados, e os jobs HTTP ficaram para "migration própria".

### 3.2 Jobs que o código/docs pressupõem e que nunca foram agendados

**Edges prontas para cron, sem agendamento.** Estas 10 importam `isAuthorizedCronRequest`/`X-Cron-Secret`, mas não têm `cron.schedule` nem entrada na allowlist de `trigger_internal_edge_job` (mig/20261002010000:27-38):

| Edge | Evidência de intenção | Impacto |
|---|---|---|
| `check-quote-expiration` | `isAuthorizedCronRequest` em supabase/functions/check-quote-expiration/index.ts; plano de auditoria em docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26 | Cotações nunca expiram automaticamente. A função SQL `check_quote_expirations` também está morta em `private`. |
| `check-lead-sla` | idem; docs/estado/03_DOMINIO_SDR_CADENCIAS.md | O SLA de leads não é verificado. |
| `bitrix24-sync` | idem; docs/FUNCIONALIDADES_SISTEMA.md | O sync com Bitrix24 só acontece manualmente (invoke no front). |
| `helpdesk-sync` | idem; docs/estado/07 | Sync de helpdesk só manual. |
| `scheduled-reports-runner` | idem; docs/REPORTING_BI_COMPLETE.md | Relatórios agendados nunca rodam (tabelas `scheduled_reports`/`scheduled_report_runs` com 0 linhas, 11_DADOS). |
| `activity-goal-alerts`, `challenge-expiration-alerts`, `sdr-consecutive-alerts`, `send-alert-notifications` | idem; docs/FUNCIONALIDADES_SEM_UI.md | Alertas de meta, desafio e SDR nunca disparam. |
| `winloss-webhook-dispatcher` | idem | O dispatch de webhooks win/loss só acontece por chamada interna. |

**Edges batch citadas, sem cron e sem auth de cron.** Rodam só por invoke manual no front, ou nunca:
- Com invoke no front: `process-scheduled-sends`, `sequence-runner`, `qbr-scheduler`, `renewal-automation`, `rotate-daily-challenges`, `snapshot-forecast`, `process-cadence-tasks`, `scheduled-report-trigger`, `start-race-season`, `recompute-stage-baselines`, `refresh-stage-baselines`, `calibrate-win-probabilities`, `compute-forecast-accuracy`, `email-engagement-scorer`, `expansion-detector`, `detect-stuck-deals`.
- Sem invoke nenhum: `auto-reassign-inactive`, `semantic-reindex-batch`, `lead-scoring`, `winloss-webhook-replay-batch`.

Em especial:
- `process-scheduled-sends` e `sequence-runner` sem cron significam que **envios agendados e passos de sequência não avançam sozinhos** (`scheduled_sends` tem 0 linhas).
- `rotate-daily-challenges` sem cron significa que os desafios diários não giram.
- `snapshot-forecast` sem cron significa que não há série histórica para medir acurácia.

**Funções SQL desenhadas para cron e nunca agendadas:**
- `check_quote_expirations`, `settle_performance_bets` (ambas em `private`)
- `detect_stalled_cron_jobs`: existia como jobid 20 em produção (fora do repo) e falhava 3.928/4.672 vezes (mig/20260913150000:15)
- `fn_check_slo_burn_rate`, `cleanup_expired_narrative_cache`, `cleanup_old_audit_logs`, `archive_old_data`
- `refresh_materialized_views` e `reindex_tables` (cron só em comentário: mig/20260104181000:100, mig/20260104184000:64)

---

## 4. Violações de docs/SCHEMA_CONVENTIONS.md (estado final do repo)

| Regra | Contagem | Exemplos (evidência) | Leitura |
|---|---|---|---|
| RLS ausente no CREATE | 7 tabelas sem `ENABLE RLS` estático: `migration_log`, `experiments`, `experiment_variants`, `experiment_assignments`, `ab_tests`, `security_events`, `user_2fa_log` | Corrigidas tardiamente por loops `DO`: mig/20260902221500:25, mig/20261001150000:19 (e o loop global mig/20260514211844:36) | Hoje 0 tabelas sem RLS (produção mediu 397/397). Restam **9 tabelas deny-all** (RLS sem nenhuma policy no repo): as 7 acima, mais `webhook_events` e `geocode_cache`. |
| Policy `USING (true)` | 1 grave | mig/20260903000001:5-10: `leads_authenticated_all USING(true) WITH CHECK(true)`, com o comentário "tighten per-role later" | A tabela `public.leads` não existe no repo nem em types.ts, então a migration falha num banco limpo. |
| Sem `updated_at` | **234/400**. Excluindo nomes de log/evento/histórico, **146** tabelas mutáveis | `activities`, `sales_goals`, `cadence_steps`, `cadence_tasks`, `notifications`, `pipeline_stages`, `order_items`, `quote_items`, `api_tokens`, `webauthn_credentials`, `achievements`, `leagues`, `tournaments`, `pricing_rules` | A regra "updated_at em toda tabela" não é cumprida pela maioria. |
| `updated_at` sem trigger | **37** | `orders`, `pipelines`, `territories`, `daily_challenges`, `scheduled_reports`, `app_config`, `stage_probabilities`, `data_retention_policies`, `buying_committee` | A coluna existe, mas nunca é atualizada automaticamente. |
| Sem `created_at` | 87 | — | — |
| Dinheiro fora de `NUMERIC(15,2)` | **77 colunas** (só **6** conformes): 34 `numeric` sem precisão, 21 `numeric(12,2)`, 15 `decimal(12,2)`, 7 `numeric(14,2)` | `sales.amount numeric(12,2)` (mig/20260530000003:5), `sales.total_cost`/`margin_amount numeric(14,2)` (mig/20260723172148:7/29), `quotes.total_value numeric` (mig/20260224122543:3), `quotes.subtotal decimal(12,2)`, `orders.total numeric(12,2)` (mig/20260422151947:2), `commissions.commission_amount numeric(12,2)` (mig/20260416170135:47), `commissions.sdr_commission_amount numeric` (mig/20260517132342:5), `products.price decimal(12,2)` (mig/20260509162133:9), `revenue_forecasts.*_amount numeric` (mig/20260418102425:2) | Mistura de três precisões na mesma cadeia venda→pedido→comissão. A regra é posterior e não houve migração. |
| `TIMESTAMP` sem TZ | **0 colunas**. 6 ocorrências em parâmetros e variáveis | mig/20260104181001:6-7 (parâmetros de `calculate_team_performance`), mig/20260512144912:130, mig/20260512163542:70, mig/20260513192406:102, mig/20260712194744:9 (`v_last_activity TIMESTAMP`) | Conforme nas colunas. |

---

## 5. Colunas, enums e status planejados que o código nunca usa

### 5.1 Colunas sem uso em tabelas vivas

São **87 de 3.533** colunas (338 tabelas), sem uso em código nem em SQL vivo. As mais reveladoras:

| Coluna(s) | Evidência | Interpretação |
|---|---|---|
| `quotes.exchange_rate`, `billing_status`, `contract_start_date` | ADD COLUMN (types.ts:14001) | Multimoeda, faturamento e contrato recorrente planejados na cotação. |
| `quote_items.is_recurring`, `billing_period` | — | Receita recorrente (MRR) nunca implementada. |
| `approval_workflows.min_mrr_threshold`, `auto_approve_below_discount` | mig/20260513180157:37 | Aprovação automática por desconto/MRR. |
| `activities.lead_status`, `mql_qualified_at`, `qualification_score` | ADD COLUMN | Qualificação MQL (casa com a tabela morta `mql_qualifications`). |
| `clients.email_verified`, `phone_verified`, `last_enrichment_id` | ADD COLUMN | Verificação de contato e enriquecimento. |
| `sales.enrichment_status`, `competitor_price_at_deal` | mig/20260511191456:24 | Inteligência competitiva por venda. |
| `commissions.sdr_commission_amount` | mig/20260517132342:5 | Split de comissão SDR/closer. |
| `pipeline_coverage_recommendations.acted_on`, `acted_on_at`, `acted_on_by` | — | Loop de feedback das recomendações. |
| `notification_preferences.push_enabled`, `deal_updates`, `task_reminders`, `team_mentions`, `daily_digest` | mig/20260104182000:35 | Preferências granulares (fantasmas, ver 5.3). |
| `tournament_participants.is_eliminated`, `eliminated_in_round`, `final_position`; `tournaments.bracket_type` | mig/20260317215431:3 | Chaveamento eliminatório de torneio nunca implementado. |
| `nps_surveys.score_ces`, `lead_source_configs.target_cpl`, `user_roles.role_id`/`granted_by` | — | — |

### 5.2 Valores de enum e CHECK nunca usados

Dos 25 enums, 6 têm valores sem nenhuma ocorrência literal no código:

| Enum | Valores sem uso | Evidência |
|---|---|---|
| `renewal_status` | `renewed` | mig/20260416232618:14 |
| `onboarding_status` | `not_started` | :18 |
| `expansion_type` | `upsell`, `cross_sell` | :22 |
| `qbr_frequency` | `biannual`, `annual` | :34 |
| `integration_health_status` | `degraded` | mig/20260425134635:5 |

Em CHECKs de status/tipo, 9 de 156 têm valores mortos:
- `tournaments.bracket_type` (single/double_elimination, 2/2)
- `login_alerts.alert_type` (new_ip/new_location/suspicious, mig/20251231121413:19)
- `daily_challenges.challenge_type` = `demos`
- `user_roles.role` = `viewer` (mig/20260104182000:65)
- `sales_territories.territory_type` = `niche`
- `quote_sync_inbound_log.status` = `not_found`

### 5.3 Colunas fantasmas — 98

São colunas declaradas em um **segundo `CREATE TABLE IF NOT EXISTS` divergente**, que vira no-op silencioso. Nenhuma está em types.ts:

| Tabela | Colunas | Evidência |
|---|---|---|
| `forecast_snapshots` | `pessimistic_value`, `realistic_value`, `optimistic_value`, `actual_realized_value`, `horizon_days`… | 1º CREATE mig/20260418123911:2; 2º mig/20260511191606:2 |
| `forecast_accuracy` | 7 colunas | 1º mig/20260418123911:32; 2º mig/20260511191606:16 |
| `quota_attainment_predictions` | 6 colunas | 1º mig/20260418112932; 2º mig/20260511192130 |
| `notification_preferences` | 9 colunas | 2º mig/20260104182000:35 |
| `notifications` | `is_read`, `severity`, `read`… | 2º mig/20260509113031 |
| `audit_log`, `user_roles`, `user_2fa`, `webhooks`, `daily_challenges`, `cadence_steps`, `whatsapp_template_versions` | — | — |

Interpretação: features de cenário de forecast e preferências de notificação "implementadas" só no papel.

---

## 6. Marcadores (TODO/placeholder/futuro) e features criadas e depois desfeitas

| Item | Evidência | Interpretação |
|---|---|---|
| Policies `true -- placeholder` | mig/20251228000001:253-293 | Removidas só em mig/20260831130000:48. |
| `growth_rate` fixo em 15.5 | mig/20260524194411:48, definição final de `get_industry_top_products` | **Exibido na UI** como "+15.5%" (src/hooks/bi/useIndustryTrends.ts:35). |
| Seed `MOCK-CAD-0001..0012` dentro de migration | mig/20260420172633:17-72 | Dados de teste aplicados em produção (cadências/cotações). |
| Recompensas de giro/XP desabilitadas "até a mecânica existir" | mig/20260814190000:24,142,155; mig/20260815110000:6,34 | `salespeople.available_spins`/`xp` nunca existiram. A gamificação de roleta/XP em vendas está desligada. |
| `tr_auto_create_commission` desabilitado | mig/20261001220100:60 (desligado em 20260517141803) | Substituído por `tr_handle_sale_commissions`. |
| TOTP custom que aceitava qualquer código; secret em plaintext | mig/20261001203500:3-13 | O drop de `totp_secret`/`backup_codes` ficou para "migration futura". |
| RBAC paralelo (`roles`, `user_permissions_cache`, `has_permission`) | criado em mig/20251228000002:7/25/57; **dropado** em mig/20261001203100:40-43 | Causava `/clientes` vazio. `permissions`/`role_permissions`/`get_user_permissions` ficaram como "pacote futuro" (:16). |
| `cadence_enrollments` | criada em mig/20260104182000:119; **dropada** em mig/20261001203300:37 | — |
| `audit_log` (singular) + 5 funções de audit | mig/20261001193100:117-137 | Superseded, mantidas read-only. |
| 54 funções movidas para `private` | mig/20260619143950, :144542, :145322 | Quebrou `match_weekly_players` (cron) e 2 RPCs de edge (§2). |
| Migrations que alteram tabelas nunca criadas: `deals`, `notes`, `users`, `leads` (e `admin_actions`, mas com guarda) | mig/20251228000001:18, mig/20260104165753:5, mig/20260104210000:2, mig/20260105000003:7/173/204, mig/20260903000001:3 | Modelo v1 baseado em `deals` abandonado. O repo **não reconstrói o banco** do zero. |
| Views do modelo v1 inexistentes em produção | `v_active_deals`, `v_deleted_deals`, `deals_active`, `mv_sales_summary`, `mv_client_metrics`, `mv_sales_performance` e mais 4 (mig/20251228000001:425, mig/20260104144330:2, mig/20260104181000:4) | — |
| Outros "futuro" | mig/20260712220049:2 (particionamento de telemetria), mig/20260508134301:29 (`cadence_advanced_stats`), mig/20260508124844:19 (`cadence_id` placeholder), mig/20261001203300:33 (`webhook_events` deny-all, "escrita futura") | — |

---

## 7. Divergência entre types.ts e migrations

types.ts tem 403 tabelas, 36 views, 232 funções e 25 enums; as migrations, 400 / 46 / 345 / 25.

| Divergência | Itens | Leitura |
|---|---|---|
| Tabelas só em types.ts (criadas fora do repo) | `_internal_secrets`, `geo_access_logs`, `geo_blocked_regions`, `plan_rollback_ddl` | DDL manual em produção. A UI de Geo Blocking (GeoBlockingManager.tsx) depende delas. |
| Tabela só nas migrations | `call_tracking` | A migration não foi aplicada ou a tabela foi dropada manualmente. |
| Views só nas migrations | 10: `v_active_deals`, `v_deleted_deals`, `deals_active`, `mv_sales_summary`, `mv_client_metrics`, `mv_sales_performance`, `mv_monthly_revenue`, `mv_product_performance`, `mv_client_ltv`, `mv_pipeline_health` | Dependem de `deals`, então nunca existiram. |
| Funções | Só em types.ts: `is_country_blocked` (geo, fora do repo). Em `private` no repo, mas listadas em types.ts: `log_rate_limit`, `add_league_weekly_xp`, `increment_combo`, `increment_goal_progress`, `add_salesperson_xp` | Ou produção não aplicou a mudança de schema, ou types.ts está defasado. Trigger functions não entram nos types (normal). |
| Enums | 0 divergências de nome/valor | — |
| Colunas | **24 tabelas** divergem. **98 colunas fantasmas** só nas migrations (§5.3). `sales.forecast_category` só nas migrations. Soft-delete (`deleted_at`/`deleted_by`/`delete_reason`/`version`) em `sales`/`quotes`/`tasks`/`client_portfolio` só em types.ts | O soft-delete vem de DDL dinâmica (mig/20261001193000/193200), invisível ao parser — não é drift real. |
| Desatualização | 9 migrations posteriores a 2026-10-05; types.ts regerado em 40a7076 (2026-10-05) | Baixa defasagem. |

---

## Top 15 por impacto de negócio

1. **Os crons HTTP não funcionam.** 13 jobs dependem de `_internal_secrets.functions_base_url`/`anon_key`, que estão ausentes (IDENTIDADE_BANCO_2026-09-13.md:93-97; mig/20260910153000:31-38). Os 25 jobs sumiram em 2026-08-30 e só os 12 SQL foram restaurados (mig/20260913150000).
2. **Cotações não expiram.** `check-quote-expiration` e `check_quote_expirations` nunca foram agendados; a função SQL ainda foi movida para `private`.
3. **Cadências e envios agendados não avançam sozinhos.** `sequence-runner`, `process-scheduled-sends` e `process-cadence-tasks` não têm cron (`scheduled_sends` está vazia).
4. **O auto-pause de cadência por reply/bounce está quebrado.** RPC `auto_pause_enrollment` em `private` (inbound-email-webhook/index.ts:159). A promoção A/B (`auto_promote_sequence_winners`) também.
5. **O retry de bulk email está agendado a cada 15 min, mas chama a RPC inexistente `enqueue_email`** (email-bulk-retry/index.ts:193).
6. **SLA de lead e alertas SDR, meta e desafio** (`check-lead-sla`, `sdr-consecutive-alerts`, `activity-goal-alerts`, `challenge-expiration-alerts`) estão prontos para cron e não agendados.
7. **Os syncs Bitrix24 e Helpdesk só rodam manualmente**, sem cron.
8. **Relatórios agendados nunca rodam.** `scheduled-reports-runner` está sem cron, e `report_schedules`/`report_executions` são tabelas mortas.
9. **Forecast:** o snapshot e a acurácia não são automáticos (`snapshot-forecast`, `reconcile_forecast_accuracy`), e as colunas de cenário pessimista/realista/otimista são fantasmas (mig/20260511191606).
10. **Dinheiro em 4 precisões diferentes na cadeia venda→pedido→comissão** (77 colunas; só 6 em NUMERIC(15,2)).
11. **BI exibe crescimento fictício "+15.5%"** (placeholder em `get_industry_top_products`, mig/20260524194411:48).
12. **A gamificação de vendas está parcialmente desligada:**
    - roleta/XP desabilitados (mig/20260814190000);
    - `weekly-matchmaking` está quebrado ou fora do restore;
    - desafios diários não giram;
    - `settle_performance_bets` nunca roda.
13. **O repo não reconstrói o banco.**
    - Há migrations sobre `deals`/`notes`/`users`/`leads` inexistentes.
    - 4 tabelas foram criadas fora do repo.
    - `public.leads` tem policy `USING(true)` (mig/20260903000001).
    - Código chama `.from('leads'|'team_members'|'auth_users_view')`.
14. **LGPD, consentimento e opt-out estão criados sem chamador** (`has_active_consent`, `is_email_opted_out`, `anonymize_data_subject`, `data_subject_requests`). O risco é de compliance em envios.
15. **O schema está inflado:** 36 tabelas abandonadas e 90 funções mortas. Inclui:
    - 2FA/sessão custom;
    - framework de experimentos;
    - stored procedures v1;
    - 5 `fn_test_*` em produção.

    Somam-se 146 tabelas mutáveis sem `updated_at` e 37 com `updated_at` sem trigger.
