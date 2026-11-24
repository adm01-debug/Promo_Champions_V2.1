# DEAD TABLES — Tabelas sem referência no código

> Gerado em 2026-10-01 pelo pacote de auditoria BANCO DE DADOS/INTEGRIDADE.
> Método: 397 tabelas extraídas dos `CREATE TABLE` de `supabase/migrations/`
> foram greppadas (word-boundary) em `src/`, `supabase/functions/`,
> `tests/`, `scripts/` e `tools/` — excluindo `src/integrations/supabase/types.ts`
> (tipos gerados citam todas as tabelas e mascaram uso real). Resultado:
> 333 vivas, 54 sem referência em código de aplicação.
>
> Revisão 2026-10-18: `webauthn_credentials` e `webauthn_challenges` foram
> retiradas da lista A — passkeys estão ativas (edge `webauthn` + UI
> `PasskeySettings.tsx`). As demais candidatas seguem sob observação.
>
> Revisão 2026-11-24 (etapa 206): as 31 órfãs do inventário foram classificadas uma a uma — seção D.
> Duas saem da lista por uso real no front e três são de autenticação, não de produto.
>
> **Critério de drop:** candidata só pode ser dropada após **30 dias** de
> observação em produção (`SELECT count(*), max(created_at)` mensal) +
> confirmação de que nenhum job externo (n8n, Bitrix sync, ferramenta de
> desanonimização) escreve nela. O grep não enxerga escritores externos.

## A. Candidatas fortes — zero referência em código E zero escritor SQL interno

Nenhuma function/trigger/cron definida nas migrations alimenta estas tabelas:

| Tabela                       | Provável origem            | Nota                                                                                                                                                |
| ---------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ab_tests`                   | experimentos A/B legado    | app usa `cadence_ab_tests`                                                                                                                          |
| `ai_sales_insights`          | insights de IA             | sem produtor no repo                                                                                                                                |
| `buying_committee`           | comitê de compra (v1)      | substituída por `buying_committee_members`                                                                                                          |
| `cadence_ab_assignments`     | A/B de cadências           | sem produtor/leitor                                                                                                                                 |
| `cadence_advanced_stats`     | stats de cadência          | sem produtor                                                                                                                                        |
| `call_intelligence_triggers` | gatilhos de CI de chamadas | sem produtor                                                                                                                                        |
| `call_tracking`              | tracking de ligações       | Twilio usa `twilio_call_sessions`                                                                                                                   |
| `cohort_analyses`            | cohort de BI               | sem produtor                                                                                                                                        |
| `competitors_pricing`        | pricing de concorrentes    | sem produtor                                                                                                                                        |
| `experiment_assignments`     | framework de experimentos  | app usa `cadence_ab_tests`                                                                                                                          |
| `mql_qualifications`         | qualificação MQL           | sem produtor                                                                                                                                        |
| `password_history`           | histórico de senhas        | Auth gerencia senhas                                                                                                                                |
| `pipeline_inspections`       | inspeção de pipeline       | sem produtor                                                                                                                                        |
| `price_protection_rules`     | precificação               | verificar redundância vs. regras CPQ                                                                                                                |
| `pricing_rules`              | precificação               | idem                                                                                                                                                |
| `product_stock_log`          | estoque                    | verificar redundância vs. `stock_movements`                                                                                                         |
| `product_usage_events`       | product analytics          | sem produtor                                                                                                                                        |
| `race_user_preferences`      | prefs de gamificação       | sem leitor                                                                                                                                          |
| `sdr_performance_settings`   | settings SDR               | sem leitor                                                                                                                                          |
| `webhook_inbound_log`        | log de ingresso webhook    | sem produtor SQL no repo (escritor pode ser externo/gateway)                                                                                        |
| `webhook_logs`               | log de webhook             | idem                                                                                                                                                |
| `website_visitor_logs`       | de-anon de visitantes      | **populada por ferramenta externa — NÃO dropar**; retenção LGPD aplicada neste pacote                                                               |
| `webauthn_credentials`       | passkeys                   | **VIVA — remover da lista de candidatas** (2026-10-18): a edge `webauthn` está ativa e `PasskeySettings.tsx`/`useWebAuthn.ts` gerenciam credenciais |
| `webauthn_challenges`        | passkeys                   | idem — **VIVA** (desafios transitórios do fluxo de passkeys)                                                                                        |

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

## D. Classificação das 31 órfãs do inventário (etapa 206 — snapshot `medido_em 2026-11-12T14:07:03Z`)

Fonte: `inventario/estado/banco.json` → `tabelas_orfas` (critério do gerador: **0 linhas** + não citada
em função/view do banco + nenhum `.from()` em `src/` ou `supabase/functions/`). Cada categoria foi conferida
no código em 2026-11-24. **Nada foi apagado** — a remoção é a etapa 207 e depende de aval do dono, porque
a operação é irreversível.

Total: **31 tabelas**, 901.120 bytes, **55 policies**, **15 gatilhos** de manutenção morta.

| Tabela | Categoria | Criada em (migration) | Bytes | Policies | Triggers | Por quê |
| --- | --- | --- | --- | --- | --- | --- |
| `user_winloss_preferences` | **Em uso — saiu da lista** | `20260421101729_9e60825c-1009-48b4-93e3-79030c85f9cd.sql` | 16.384 | 4 | 1 | `src/hooks/win-loss/useUserDashboardLayout.ts:52,80` usa `.from('user_winloss_preferences')`; o hook entrou em 2026-11-16, depois do snapshot |
| `win_loss_insight_comments` | **Em uso — saiu da lista** | `20260420210849_5e5fd280-33bb-4015-9d44-9aea02b83b83.sql` | 24.576 | 3 | 0 | `src/hooks/win-loss/useInsightComments.ts:26` define `const TABLE = 'win_loss_insight_comments'` e chama `.from(TABLE)` — a forma por variável que o gerador declara não resolver |
| `report_executions` | Manter (planejada) | `20260416234424_66fbe1df-5677-4a6c-bea6-daf700e06009.sql` | 32.768 | 1 | 0 | histórico de execução dos relatórios agendados |
| `report_schedules` | Manter (planejada) | `20260416234424_66fbe1df-5677-4a6c-bea6-daf700e06009.sql` | 32.768 | 1 | 2 | agenda de relatórios de BI (feature de relatórios) |
| `webhook_events` | Manter (planejada) | `20260104180000_webhooks_complete.sql` | 40.960 | 1 | 0 | log de ingresso de webhook; a migration de hardening exige `COMMENT`/`REVOKE` nela (`tests/migrations/authz_hardening_contract_test.ts:66-69`) |
| `webhook_logs` | Manter (planejada) | `20260104143931_webhooks_system.sql` (+1) | 40.960 | 1 | 0 | log de envio/recepção de webhook; o escritor pode ser gateway externo |
| `password_history` | Investigar | `20260104183000_security_enhancements.sql` | 24.576 | 1 | 0 | política de "não repetir senha" nunca implementada: 0 uso no código e nenhuma função do banco a cita |
| `user_2fa` | Investigar | `20260104143929_2fa_system.sql` (+2) | 40.960 | 3 | 2 | versão caseira do 2FA; o app hoje usa o MFA nativo (`src/hooks/useMFA.ts:83`, `auth.mfa.listFactors()`) e `user_mfa_settings` está em uso |
| `user_2fa_backup_codes` | Investigar | `20260104200000_2fa_complete.sql` (+1) | 32.768 | 2 | 0 | idem `user_2fa` — códigos de recuperação do 2FA caseiro |
| `ab_tests` | Apagar | `20260105000006_new_ab_tests.sql` | 8.192 | 1 | 0 | substituída por `cadence_ab_tests` (1 arquivo em `src/`), que está em uso |
| `ai_sales_insights` | Apagar | `20260515113801_7da2c363-ac4a-44a6-99ae-5da8daa78f95.sql` | 24.576 | 1 | 0 | 0 linhas, sem produtor e sem leitor em `src/`, `supabase/functions/` ou `tests/` |
| `cadence_advanced_stats` | Apagar | `20260508134301_7ab33b60-c0d0-45ec-bb02-1821ac71c3aa.sql` | 24.576 | 1 | 0 | 0 linhas, sem produtor e sem leitor em `src/`, `supabase/functions/` ou `tests/` |
| `call_intelligence_triggers` | Apagar | `20260511191805_e49c3187-79d7-47b1-8a93-24c9c11ca33b.sql` | 24.576 | 1 | 0 | substituída por `twilio_call_sessions` (3 arquivos), que está em uso |
| `call_metric_benchmarks` | Apagar | `20260418113523_148a16ea-d7a6-46cf-9ffc-ef8c5560b462.sql` | 49.152 | 2 | 1 | 0 linhas, sem produtor e sem leitor em `src/`, `supabase/functions/` ou `tests/` |
| `cohort_analyses` | Apagar | `20260416234424_66fbe1df-5677-4a6c-bea6-daf700e06009.sql` | 24.576 | 1 | 2 | 0 linhas, sem produtor e sem leitor em `src/`, `supabase/functions/` ou `tests/` |
| `critical_moment_notifications` | Apagar | `20260417202813_6803938d-e003-42c1-8b38-f8515132e8f5.sql` | 24.576 | 4 | 0 | 0 linhas, sem produtor e sem leitor em `src/`, `supabase/functions/` ou `tests/` |
| `deal_risk_signals` | Apagar | `20260416195725_4d7ca4a9-1812-4b95-83ca-d216d7fc129c.sql` | 40.960 | 3 | 0 | 0 linhas, sem produtor e sem leitor em `src/`, `supabase/functions/` ou `tests/` |
| `enriched_company_intelligence` | Apagar | `20260513164208_76631815-da68-40a2-a7f0-fa104eb5901f.sql` | 24.576 | 1 | 2 | 0 linhas, sem produtor e sem leitor em `src/`, `supabase/functions/` ou `tests/` |
| `experiment_assignments` | Apagar | `20260104182000_additional_tables.sql` | 24.576 | 2 | 0 | substituída por `cadence_ab_tests`, que está em uso |
| `experiment_variants` | Apagar | `20260104182000_additional_tables.sql` | 24.576 | 2 | 0 | substituída por `cadence_ab_tests`, que está em uso |
| `experiments` | Apagar | `20260104182000_additional_tables.sql` | 16.384 | 2 | 0 | substituída por `cadence_ab_tests`, que está em uso |
| `mql_qualifications` | Apagar | `20260511141928_1b5f75d8-ab43-4b45-bed6-e81c3d0a4169.sql` | 32.768 | 1 | 2 | 0 linhas, sem produtor e sem leitor em `src/`, `supabase/functions/` ou `tests/` |
| `pipeline_inspections` | Apagar | `20260513194107_bb8ad733-bca3-4702-82b3-f9eeffc3cd1a.sql` | 32.768 | 2 | 0 | 0 linhas, sem produtor e sem leitor em `src/`, `supabase/functions/` ou `tests/` |
| `pricing_rules` | Apagar | `20260513180157_7b569e65-7319-4292-af0f-834390a6d501.sql` | 24.576 | 1 | 0 | 0 linhas, sem produtor e sem leitor em `src/`, `supabase/functions/` ou `tests/` |
| `product_stock_log` | Apagar | `20260509153607_6ed3db5a-aaaf-4fe4-b1af-94fc3fd7846d.sql` | 24.576 | 1 | 0 | substituída por `stock_movements` (2 arquivos), que está em uso |
| `product_usage_events` | Apagar | `20260416232618_f6dcab79-5212-4086-b46f-7ff5f3532a80.sql` | 32.768 | 2 | 0 | 0 linhas, sem produtor e sem leitor em `src/`, `supabase/functions/` ou `tests/` |
| `race_user_preferences` | Apagar | `20260419022222_1e3af362-5ee7-465a-b3a4-247f2c0611f1.sql` | 32.768 | 4 | 2 | 0 linhas, sem produtor e sem leitor em `src/`, `supabase/functions/` ou `tests/` |
| `salesperson_performance_telemetry` | Apagar | `20260511192130_c4275dc5-b910-48d1-b4ac-77964f83aaee.sql` | 16.384 | 1 | 0 | 0 linhas, sem produtor e sem leitor em `src/`, `supabase/functions/` ou `tests/` |
| `sdr_performance_settings` | Apagar | `20260511141834_310eb6b0-f9b9-4a42-bac2-39a65a44f0e4.sql` | 24.576 | 1 | 1 | 0 linhas, sem produtor e sem leitor em `src/`, `supabase/functions/` ou `tests/` |
| `win_calibration_buckets` | Apagar | `20260418125205_353e42ff-a04d-4094-aff2-5aae8049e83c.sql` | 32.768 | 2 | 0 | 0 linhas, sem produtor e sem leitor em `src/`, `supabase/functions/` ou `tests/` |
| `win_probability_deal_calibrations` | Apagar | `20260418125205_353e42ff-a04d-4094-aff2-5aae8049e83c.sql` | 49.152 | 2 | 0 | substituída por `win_probability_calibrations` (2 arquivos), que está em uso |

### O que a classificação mudou

- **2 tabelas saem da lista por uso real**: o critério não enxerga `.from(variavel)` e o snapshot é de
  2026-11-12 — o hook de `user_winloss_preferences` entrou depois dele. Nenhuma das duas pode ser apagada.
- **4 são infra legítima** (ingresso e envio de webhook, agenda e execução de relatório): mantêm-se.
- **3 são de autenticação**: apagar só faz sentido depois de decidir se o 2FA caseiro e a política de senha
  serão retomados ou abandonados.
- **22 seguem candidatas a limpeza**: 7 porque a feature existe em outra tabela que está em uso, 15 porque
  não têm produtor nem leitor. O procedimento está na seção C.

Limite declarado: `.from(variavel)` não é resolvido e um job externo (n8n, Bitrix) pode escrever numa
tabela vazia no repo — por isso a seção C exige 30 dias de observação antes de qualquer drop.
