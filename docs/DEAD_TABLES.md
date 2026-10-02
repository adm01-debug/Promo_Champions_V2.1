# DEAD TABLES — Tabelas sem referência no código

> Gerado em 2026-10-01 pelo pacote de auditoria BANCO DE DADOS/INTEGRIDADE.
> Método: 397 tabelas extraídas dos `CREATE TABLE` de `supabase/migrations/`
> foram greppadas (word-boundary) em `src/`, `supabase/functions/`,
> `tests/`, `scripts/` e `tools/` — excluindo `src/integrations/supabase/types.ts`
> (tipos gerados citam todas as tabelas e mascaram uso real). Resultado:
> 333 vivas, 54 sem referência em código de aplicação.
>
> **Critério de drop:** candidata só pode ser dropada após **30 dias** de
> observação em produção (`SELECT count(*), max(created_at)` mensal) +
> confirmação de que nenhum job externo (n8n, Bitrix sync, ferramenta de
> desanonimização) escreve nela. O grep não enxerga escritores externos.

## A. Candidatas fortes — zero referência em código E zero escritor SQL interno

Nenhuma function/trigger/cron definida nas migrations alimenta estas tabelas:

| Tabela | Provável origem | Nota |
|---|---|---|
| `ab_tests` | experimentos A/B legado | app usa `cadence_ab_tests` |
| `ai_sales_insights` | insights de IA | sem produtor no repo |
| `buying_committee` | comitê de compra (v1) | substituída por `buying_committee_members` |
| `cadence_ab_assignments` | A/B de cadências | sem produtor/leitor |
| `cadence_advanced_stats` | stats de cadência | sem produtor |
| `call_intelligence_triggers` | gatilhos de CI de chamadas | sem produtor |
| `call_tracking` | tracking de ligações | Twilio usa `twilio_call_sessions` |
| `cohort_analyses` | cohort de BI | sem produtor |
| `competitors_pricing` | pricing de concorrentes | sem produtor |
| `experiment_assignments` | framework de experimentos | app usa `cadence_ab_tests` |
| `mql_qualifications` | qualificação MQL | sem produtor |
| `password_history` | histórico de senhas | Auth gerencia senhas |
| `pipeline_inspections` | inspeção de pipeline | sem produtor |
| `price_protection_rules` | precificação | verificar redundância vs. regras CPQ |
| `pricing_rules` | precificação | idem |
| `product_stock_log` | estoque | verificar redundância vs. `stock_movements` |
| `product_usage_events` | product analytics | sem produtor |
| `race_user_preferences` | prefs de gamificação | sem leitor |
| `sdr_performance_settings` | settings SDR | sem leitor |
| `webhook_inbound_log` | log de ingresso webhook | sem produtor SQL no repo (escritor pode ser externo/gateway) |
| `webhook_logs` | log de webhook | idem |
| `website_visitor_logs` | de-anon de visitantes | **populada por ferramenta externa — NÃO dropar**; retenção LGPD aplicada neste pacote |
| `webauthn_credentials` | passkeys | feature desabilitada (edge `webauthn` retorna 503) |
| `webauthn_challenges` | passkeys | idem — par mais seguro para drop após 30d |

## B. Sem leitor no app, mas escritas por SQL interno do banco

Não são "mortas" no Postgres — functions/triggers/crons definidos nas
migrations as alimentam —, mas nada no front/edge as consome. Revisar
utilidade antes de propor drop:

`cadence_enrollments`, `call_metric_benchmarks`, `coaching_scorecard_config`,
`contact_send_time_profile`, `critical_moment_notifications`,
`cron_failure_alerts`, `data_access_log`, `db_rollback_snapshots`,
`dead_letter_replay_audit`, `embedded_report_tokens`, `entity_versions`,
`experiment_variants`, `experiments`, `lead_score_history`, `league_history`,
`maintenance_log`, `mfa_verification_attempts`, `migration_log`,
`monthly_sales_summary`, `quote_conversion_audit`, `race_daily_snapshots`,
`race_user_daily_checkins`, `report_schedules`,
`salesperson_performance_telemetry`, `security_events`, `session_activity`,
`sms_verification_codes`, `user_permissions_cache`, `webhook_events`.

Notas:

- `migration_log`, `maintenance_log`, `cron_failure_alerts`,
  `data_access_log`, `security_events`, `session_activity` — infra interna
  de auditoria/ops. **Manter**: custo é o de logs, não de dead table;
  ganharam política de retenção neste pacote.
- `sms_verification_codes`, `mfa_verification_attempts` — escritas pelas
  funções SQL do fluxo 2FA (MFA customizado incompleto — ver auditoria).
  Manter até decisão sobre MFA.
- `user_permissions_cache` — populada por SQL de `advanced_permissions` e
  consumida por RPC no banco. Manter.

## C. Procedimento de drop (quando confirmado)

```sql
-- 1. observar 30 dias:
SELECT count(*), max(created_at) FROM public.<tabela>;

-- 2. snapshot antes do drop (backup lógico):
CREATE TABLE public._tomb_<tabela> AS SELECT * FROM public.<tabela>;

-- 3. drop em migration NOVA (nunca editar migration histórica):
--    arquivo 20261101HHMMSS_drop_dead_<tabela>.sql
--    DROP TABLE public.<tabela>;  -- + policies/triggers órfãos se houver
```
