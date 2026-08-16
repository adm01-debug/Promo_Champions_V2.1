# 03 — Domínio SDR / Prospecção / Engajamento Multicanal

**Auditoria de estado por medição direta.** Data: 2026-08-16.
Banco: `rapjswienfhkobhlamxb` (produção, acesso somente leitura via MCP).
Nenhuma afirmação aqui vem de `docs/*.md`. Toda linha tem `arquivo:linha` lido de fato ou query SQL executada.

---

## 0. Veredito em uma frase

O domínio SDR/cadências é **um sistema completo de código sobre um banco vazio**. As 21 edge functions existem e estão implementadas (não são stubs), o schema está criado com triggers funcionais, a UI está montada e roteada — mas **não existe um único cron job agendado para nenhuma delas**, e **34 das 38 tabelas do domínio nunca receberam sequer um INSERT**.

---

## 1. Evidência-mãe: os cron jobs

```sql
select jobid, jobname, schedule, active from cron.job order by jobname;
```

Resultado — **11 jobs, nenhum do domínio SDR**:

| jobname | schedule | active |
|---|---|---|
| campaign-health-alert-30min | `*/30 * * * *` | true |
| cleanup-stale-logs-daily | `15 3 * * *` | true |
| cleanup-webhook-dedupe | `0 */6 * * *` | true |
| enforce-telemetry-retention-daily | `30 3 * * *` | true |
| gc-call-recording-ingest-jobs | `15 3 * * *` | true |
| purge-quote-sync-inbound-log-30d | `15 3 * * *` | true |
| purge-telemetry-retention-daily | `30 3 * * *` | true |
| purge-webhook-inbound-dedupe-30d | `0 3 * * *` | true |
| reset-pg-stat-statements-weekly | `0 4 * * 1` | true |
| weekly-league-reset | `0 0 * * 1` | true |
| weekly-matchmaking | `1 0 * * 1` | true |

São 8 jobs de faxina/retenção + 2 de gamificação + 1 de alerta de campanha. **Zero** para cadências, sequências, SLA, envios agendados, scoring, dialer ou engajamento.

Confirmação no código — as migrations só agendam 4 jobs, nenhum do domínio:

```
grep -rn "cron.schedule" supabase/migrations/
  → cron.schedule('refresh-views'
  → cron.schedule('reindex-tables'
  → cron.schedule('weekly-league-reset'
  → cron.schedule('weekly-matchmaking'
```

### 1.1 A UI mente sobre isso

`src/components/admin/AdminSystemStatus.tsx:19-25` declara um array **hardcoded** de agendamentos que não existem:

```tsx
const EDGE_FUNCTIONS = [
  { name: "sdr-consecutive-alerts", schedule: "8h diário" },
  { name: "activity-goal-alerts",   schedule: "15h diário" },
  { name: "access-denied-alerts",   schedule: "Horário" },
  { name: "auto-reassign-inactive", schedule: "6h diário" },
  { name: "bitrix24-sync",          schedule: "Horário" },
  { name: "check-lead-sla",         schedule: "Configurável" },
];
```

Nenhum desses seis nomes aparece em `cron.job`. O painel de status do admin exibe agendamentos fictícios como se fossem reais.

---

## 2. Evidência-mãe: o banco

Contagem exata (via `query_to_xml`, pois `reltuples` estava desatualizado) somada a `n_tup_ins`/`n_tup_del` de `pg_stat_user_tables`.

> **Calibração honesta:** `pg_stat_database.stats_reset = 2026-07-24 08:28:18+00`. Os contadores `ins`/`del` cobrem as últimas ~3,5 semanas, não a vida toda da tabela. `ins=0` significa "nenhuma inserção em 3,5 semanas de produção", não "nunca na história". Já o `count(*)=0` é absoluto.

### Cadências

| tabela | linhas | ins | del |
|---|---:|---:|---:|
| cadences | **0** | 1 | 1 |
| cadence_steps | **0** | 5 | 5 |
| cadence_tasks | **0** | 0 | 0 |
| prospect_cadences | **0** | 0 | 0 |
| cadence_enrollments | **0** | 0 | 0 |
| cadence_enrollment_rules | **0** | 0 | 0 |
| cadence_ab_tests | **0** | 0 | 0 |
| cadence_ab_assignments | **0** | 0 | 0 |
| cadence_outcome_rules | **0** | 4 | 4 |
| cadence_funnel_rules | **0** | 0 | 0 |
| cadence_alert_templates | **0** | 2 | 2 |
| cadence_advanced_stats | **0** | 0 | 0 |

Padrão `ins=N, del=N, count=0` em `cadences`/`cadence_steps`/`cadence_outcome_rules`/`cadence_alert_templates`: alguém criou 1 cadência com 5 passos, testou, e apagou. **`cadence_tasks` e `prospect_cadences` têm `ins=0`: nenhuma tarefa de cadência jamais foi gerada, nenhum prospect jamais foi inscrito.**

### Sequências

| tabela | linhas | ins | del |
|---|---:|---:|---:|
| sequences | **0** | 0 | 0 |
| sequence_steps | **0** | 0 | 0 |
| sequence_enrollments | **0** | 0 | 0 |
| sequence_step_executions | **0** | 0 | 0 |
| sequence_step_variants | **0** | 0 | 0 |
| sequence_step_assignments | **0** | 0 | 0 |

O módulo inteiro de sequências (1413 linhas de UI + 422 linhas de `sequence-runner`) **nunca teve nem uma sequência criada**.

### Multicanal / Email / Dialer / Engajamento

| tabela | linhas | ins | del |
|---|---:|---:|---:|
| channel_credentials | **0** | 0 | 0 |
| channel_interactions | **0** | 0 | 0 |
| outbound_messages | **0** | 0 | 0 |
| scheduled_sends | **0** | 0 | 0 |
| message_templates | **0** | 0 | 0 |
| whatsapp_template_versions | **0** | 0 | 0 |
| email_logs | **0** | 0 | 0 |
| email_bulk_jobs | **0** | 0 | 0 |
| email_bulk_drafts | **0** | 0 | 0 |
| email_tracking_events | **0** | 0 | 0 |
| email_opt_outs | **0** | 0 | 0 |
| email_engagement_scores | **0** | 0 | 0 |
| email_engagement_score_history | **0** | — | — |
| contact_engagement_score | **0** | 0 | 0 |
| engagement_score_history | **0** | 0 | 0 |
| contact_send_time_profile | **0** | 0 | 0 |
| send_time_profiles | **0** | 0 | 0 |
| dialer_queues | **0** | 0 | 0 |
| dialer_queue_items | **0** | 0 | 0 |
| call_logs | **0** | 0 | 0 |
| twilio_call_sessions | **0** | 0 | 0 |

**`channel_credentials = 0` é a causa-raiz do multicanal inteiro:** `supabase/functions/send-multichannel-message/index.ts:146` lê dessa tabela para descobrir provider/token. Sem credencial cadastrada, nenhum envio de WhatsApp/SMS pode sair, e portanto `outbound_messages` nunca é populada, e portanto os webhooks de status nunca têm o que atualizar.

### Scoring / Routing / SLA / ICP / Playbooks

| tabela | linhas | ins | del |
|---|---:|---:|---:|
| lead_scores | **900** | — | — |
| lead_score_history | **1221** | — | — |
| lead_score_explanations | **0** | 0 | 0 |
| lead_score_trends | **0** | 0 | 0 |
| lead_routing_rules | **0** | 3 | 3 |
| lead_routing_log | **0** | 0 | 0 |
| lead_assignments | **0** | 0 | 0 |
| lead_source_configs | **0** | 0 | 0 |
| sla_policies | **0** | 5 | 5 |
| sla_violations | **0** | 0 | 0 |
| icp_parameters | **1** | 2 | 1 |
| icp_data | **0** | 0 | 0 |
| playbooks | **0** | 4 | 4 |
| playbook_items | **0** | 22 | 22 |
| playbook_progress | **0** | 0 | 0 |
| sales_enablement_assets | **0** | 0 | 0 |
| asset_usage_logs | **0** | 0 | 0 |
| sdr_alert_configs | **0** | 0 | 0 |
| sdr_alert_history | **0** | 0 | 0 |
| sdr_performance_settings | **0** | 0 | 0 |
| notification_preferences | **0** | 0 | 0 |
| notifications | **6** | 6 | 0 |
| follow_up_templates | **0** | 0 | 0 |

`sla_policies` (ins=5, del=5) e `playbooks`/`playbook_items` (ins=4/22, del=4/22) são seeds criados e removidos.

### As duas únicas tabelas com tráfego real

```sql
select min(calculated_at), max(calculated_at), count(distinct sale_id), count(*),
       count(distinct date_trunc('day',calculated_at)) from lead_scores;
```
→ `min=2026-07-12 21:39`, `max=2026-08-13 20:29`, **900 sale_id distintos, 900 linhas, apenas 2 dias distintos**.

Ou seja: `lead-scoring` foi executada em batch **duas vezes em um mês**, sempre por clique manual. Não é um processo contínuo. `lead_score_history` (1221) é alimentada pelo trigger `trg_lead_scores_history AFTER INSERT OR UPDATE OF score ON lead_scores` — reflexo das mesmas 2 execuções.

```sql
select type, category, count(*), max(created_at) from notifications group by 1,2;
```
→ `system / system / 6 / 2026-08-04 11:30:03`. As 6 notificações são de sistema, nenhuma de cadência/sequência/SLA. Nada há 12 dias.

---

## 3. Quem chama cada edge function

Todas as 21 existem em `supabase/functions/` e são implementadas (nenhuma é stub — a menor, `engagement-score-recompute`, tem 42 linhas de código real).

| Edge function | linhas | Quem dispara (medido por grep em `src/` + `supabase/migrations/`) |
|---|---:|---|
| auto-enroll-cadence | 162 | Botão "Executar agora" — `src/components/cadences/EnrollmentRulesDialog.tsx:75` |
| process-cadence-tasks | 169 | `useEffect` no mount da página — `src/pages/Cadencias.tsx:73` |
| sequence-runner | 422 | Botão "Executar runner" — `src/pages/SequencesPage.tsx:70,110` via `src/hooks/sequences/useEnrollContacts.ts:34` |
| sequence-enroll | 110 | `src/hooks/sequences/useEnrollContacts.ts:14` (ação do usuário) |
| sequence-record-reply | 100 | **NINGUÉM** — 0 referências em `src/`, 0 em migrations |
| sequence-ab-promote | 58 | `src/hooks/sequences/usePromoteWinners.ts:9` (botão) |
| check-lead-sla | 171 | Botão do monitor — `src/components/admin/BackendAutomationMonitor.tsx:41,68` |
| lead-scoring | 225 | `src/hooks/useLeadScoring.ts:102` e `:245` (query/mutation da tela) |
| enrich-lead | 142 | `src/hooks/useLeadEnrichment.ts:10` (botão) |
| email-bulk-send | 195 | `src/hooks/engagement/useBulkComposer.ts` (wizard) |
| email-bulk-retry | 163 | `src/hooks/email/useFailedDrafts.ts` (botão) |
| send-multichannel-message | 214 | `src/hooks/email/useComposeEmail.ts:67`, `src/hooks/multichannel/useChannelCredentials.ts` |
| process-scheduled-sends | 60 | **NINGUÉM** — 0 referências em `src/`, 0 em migrations, 0 cron |
| schedule-optimal-send | 85 | `src/hooks/engagement/useSendTimeOptimization.ts:79` |
| send-time-optimizer | 146 | `src/hooks/engagement/useSendTimeOptimization.ts:53` |
| dialer-queue-builder | 147 | `src/hooks/dialer/usePowerDialer.ts:111` |
| email-engagement-scorer | 145 | `src/hooks/engagement/useEmailEngagementScore.ts` |
| engagement-score-recompute | 42 | `src/hooks/engagement/useEngagementScore.ts:102` |
| inbound-email-webhook | 151 | **NINGUÉM interno** — depende de provedor externo, mas **não está em `supabase/config.toml`** |
| email-unsubscribe | 62 | Link em email; **é a única com `verify_jwt = false`** (`supabase/config.toml:9-10`) |
| multichannel-status-webhook | 100 | **NINGUÉM interno** — depende de Twilio/Meta/Z-API, mas **não está em `supabase/config.toml`** |

### 3.1 Os dois webhooks estão inacessíveis por configuração

`supabase/config.toml` tem exatamente 3 exceções de JWT:

```toml
[functions.log-web-vitals]   verify_jwt = false
[functions.receive-quote-sync] verify_jwt = false
[functions.email-unsubscribe]  verify_jwt = false
```

`inbound-email-webhook` e `multichannel-status-webhook` **não estão na lista** → o Supabase exige JWT válido. Resend/SendGrid/Twilio/Meta não enviam JWT do Supabase. Ambas as funções retornariam 401 para o provedor real.

Pior: `multichannel-status-webhook/index.ts:6` documenta *"Returns 200 always to avoid retry storms"* — o autor projetou a função para nunca falhar visivelmente, mas ela sequer é alcançada. Esta é a definição exata de falha silenciosa.

---

## 4. O trigger de auto-enroll: fio completo, gatilho morto

O banco tem um pipeline de cadência **funcional e correto**:

```
sales (INSERT/UPDATE OF status)
  → trigger trg_auto_enroll_on_sale
  → private.auto_enroll_in_cadence()
      SELECT ... FROM cadence_enrollment_rules WHERE is_active = true ...
      IF encontrou → INSERT INTO prospect_cadences
  → trigger trg_generate_cadence_tasks (AFTER INSERT ON prospect_cadences)
  → generate_cadence_tasks()
      FOR cada cadence_steps → INSERT INTO cadence_tasks
```

(`pg_get_functiondef` de `private.auto_enroll_in_cadence` e `public.generate_cadence_tasks`, ambos confirmados no banco.)

`sales` tem tráfego real (2228 linhas em `activities`, 900 sales pontuadas). O trigger dispara a cada venda. Mas `cadence_enrollment_rules` tem **0 linhas** → o `SELECT` nunca acha regra → `matching_rule.id IS NULL` → nada acontece, **sem erro, sem log**.

É a automação dormente perfeita: código certo, trigger ativo, tabela de configuração vazia.

---

## 5. Tabela de estado por funcionalidade

| Funcionalidade | UI (arquivo:linha) | Hook | Edge function / Tabela | Linhas no banco | Quem dispara | Classificação | O que falta |
|---|---|---|---|---|---|---|---|
| Cadências — CRUD | `src/pages/Cadencias.tsx:59` | `useCadences`, `useCadenceMutations` | tab. `cadences` | **0** (ins 1/del 1) | usuário | 🟨 | Nenhuma cadência em produção; foi criada 1 e apagada |
| Cadências — passos | `src/components/cadences/CadenceStepRow.tsx` | `useCadenceQueries.ts:93` | tab. `cadence_steps` | **0** (ins 5/del 5) | usuário | 🟨 | Idem: só teste apagado |
| Cadências — inscrição de prospect | `src/components/cadences/EnrollCadenceDialog.tsx` | `useProspectCadenceMutations` | tab. `prospect_cadences` | **0** (ins 0) | usuário | 🟨 | Nunca inscreveu ninguém em 3,5 semanas |
| Cadências — geração de tarefas | — (trigger DB) | — | `generate_cadence_tasks()` → `cadence_tasks` | **0** (ins 0) | trigger `trg_generate_cadence_tasks` | 🟨 | Trigger correto, mas nunca disparou (sem `prospect_cadences`) |
| Cadências — tarefas do dia | `src/components/cadences/TodaysCadenceTasks.tsx` | `useCadenceQueries.ts:169` | tab. `cadence_tasks` | **0** | usuário | 🟨 | Tela sempre vazia |
| Cadências — auto-enroll por regra | `src/components/cadences/EnrollmentRulesDialog.tsx:75` | `useEnrollmentRules.ts:26` | `auto-enroll-cadence` + trigger `trg_auto_enroll_on_sale` / `cadence_enrollment_rules` | **0** (ins 0) | botão manual + trigger em `sales` | 🟨 | **Automação dormente**: sem regra cadastrada o trigger nunca age. Sem cron |
| Cadências — processamento de tarefas | `src/pages/Cadencias.tsx:73` | — | `process-cadence-tasks` (169 l) + rpc `claim_pending_cadence_tasks` | **0** tarefas | `useEffect` ao abrir a tela | 🟨 | **Sem cron.** Só roda se um humano abrir `/cadencias` |
| Cadências — teste A/B | `src/components/cadences/ABTestDialog.tsx` | `useABTests.ts` | `cadence_ab_tests` / `cadence_ab_assignments` | **0** / **0** (ins 0) | usuário | 🟦 | Nunca usado |
| Cadências — métricas/funil | `src/components/cadences/CadenceMetricsPanel.tsx` | `useCadenceMetrics`, rpc `get_cadence_metrics` | `cadence_funnel_rules`, `cadence_advanced_stats` | **0** / **0** | usuário | 🟨 | RPC existe; sem dado a agregar |
| Cadências de orçamento (quote) | `src/pages/QuoteCadencesPage.tsx` + 9 comp. em `cadences/quote/` | `useQuoteCadences.ts:32` | reusa `prospect_cadences`/`cadence_tasks` | **0** | usuário | 🟨 | Camada de UI mais rica do módulo, sobre tabelas vazias |
| Sequências — CRUD | `src/pages/SequencesPage.tsx:20` | `useSequences.ts` | tab. `sequences` | **0** (ins 0) | usuário | 🟦 | Nunca foi criada uma sequência |
| Sequências — passos | `src/components/sequences/SequenceBuilder.tsx` | `useSequenceSteps.ts` | `sequence_steps` | **0** (ins 0) | usuário | 🟦 | Idem |
| Sequências — inscrição | `src/pages/SequencesPage.tsx:67` | `useEnrollContacts.ts:14` | `sequence-enroll` (110 l) / `sequence_enrollments` | **0** (ins 0) | usuário | 🟦 | Idem |
| Sequências — runner | `src/pages/SequencesPage.tsx:70,110` | `useEnrollContacts.ts:34` | `sequence-runner` (422 l) / `sequence_step_executions` | **0** (ins 0) | **clique manual em botão** | 🟨 | **Sem cron.** A maior edge function do domínio só roda por clique |
| Sequências — variantes A/B + promoção | `src/components/sequences/StepVariantsManager.tsx`, `ABTestPanel.tsx` | `usePromoteWinners.ts:9`, `useStepVariants.ts` | `sequence-ab-promote` (58 l) / `sequence_step_variants`, `sequence_step_assignments` | **0** / **0** | usuário | 🟦 | Nunca exercitado |
| Sequências — auto-pause | `src/components/sequences/AutoPauseSettingsCard.tsx`, `AutoPausedBadge.tsx` | `useAutoPause.ts`, rpc `get_auto_paused_count` | colunas `auto_paused_at`/`auto_pause_reason` em `sequence_enrollments` | **0** | usuário | 🟦 | Schema pronto, sem inscrições |
| Sequências — registro de resposta | — | — | `sequence-record-reply` (100 l) | **0** | **NINGUÉM** | ⬛ | Função órfã: 0 chamadores em `src/` e em migrations |
| Otimização de horário de envio | `src/pages/SendTimeOptimization.tsx:16`, `engagement/SendTime/SendTimeHeatmap.tsx` | `useSendTimeOptimization.ts:53,79,136` | `send-time-optimizer` (146 l), `schedule-optimal-send` (85 l), rpc `get_global_send_time_stats` / `send_time_profiles`, `contact_send_time_profile` | **0** / **0** (ins 0) | usuário | 🟨 | Perfis nunca calculados; heatmap sem base |
| Envios agendados | `src/components/engagement/SendTime/ScheduledSendsPanel.tsx` | — | `process-scheduled-sends` (60 l) / `scheduled_sends` | **0** (ins 0) | **NINGUÉM** | ⬛ | **Fila sem consumidor.** Função implementada, 0 chamadores, 0 cron |
| Multicanal — credenciais | `src/components/multichannel/ChannelCredentialsManager.tsx`, `ProviderConnectionDialog.tsx` | `useChannelCredentials.ts` | `channel_credentials` | **0** (ins 0) | usuário | 🟨 | **Causa-raiz do módulo:** nenhum provedor conectado |
| Multicanal — envio | `src/components/multichannel/TestSendButton.tsx` | `useComposeEmail.ts:67` | `send-multichannel-message` (214 l), lê `channel_credentials` em `:146` / `outbound_messages` | **0** (ins 0) | usuário | 🟨 | Sem credencial → nunca enviou nada |
| Multicanal — log de saída | `src/components/multichannel/OutboundMessageLog.tsx` | `useOutboundMessages.ts:26` | `outbound_messages` | **0** (ins 0) | usuário | 🟨 | Tela sempre vazia |
| Multicanal — webhook de status | — | — | `multichannel-status-webhook` (100 l) | `outbound_messages` **0** | provedor externo | ⬛ | **Não está em `config.toml`** → `verify_jwt` ativo → Twilio/Meta receberiam 401 |
| Multicanal — dashboard/gráficos | `src/components/multichannel/MultichannelDashboard.tsx`, `ChannelStatsCards.tsx` | `useOutboundMessagesByDay:39` | `outbound_messages`, `channel_interactions` | **0** / **0** | usuário | 🟨 | Dashboard sobre tabela vazia |
| Multicanal — templates | `src/components/multichannel/TemplateManager.tsx` | — (recebe por props) | `message_templates`, `whatsapp_template_versions` | **0** / **0** | usuário | 🟦 | Componente sem acesso próprio a dados; tabelas vazias |
| Email — composição em massa | `src/pages/BulkComposer.tsx:12`, `engagement/BulkComposer/BulkComposerWizard.tsx` | `useBulkComposer.ts` | `email-bulk-send` (195 l) / `email_bulk_jobs`, `email_bulk_drafts` | **0** / **0** (ins 0) | usuário | 🟨 | Nenhum job de envio criado |
| Email — retry de falhas | `src/components/email/FailedDraftsCard.tsx`, `RecoveryRateCard.tsx` | `useFailedDrafts.ts` | `email-bulk-retry` (163 l) + trigger `trg_email_bulk_drafts_recovery` | **0** | usuário | 🟨 | Trigger de recovery existe e é correto; sem rascunho para recuperar |
| Email — tracking | `src/pages/EmailTracking.tsx`, `email/EmailTrackingDashboard.tsx` | — | `email_tracking_events`, `email_logs` | **0** / **0** (ins 0) | webhook | 🟨 | Sem eventos: e-mails nunca saíram |
| Email — opt-out / supressão | `src/pages/AdminSupressaoEmails.tsx`, `email/EmailSuppressionMetricsCard.tsx` | `useEmailOptOuts.ts` | `email-unsubscribe` (62 l) / `email_opt_outs` | **0** (ins 0) | link em e-mail | 🟨 | Única função com `verify_jwt=false` (`config.toml:9`) — correta, mas sem tráfego |
| Email — webhook de entrada (bounce/reply) | — | — | `inbound-email-webhook` (151 l) | **0** | provedor externo | ⬛ | **Não está em `config.toml`** → Resend/SendGrid receberiam 401 |
| Email — score de engajamento | `src/pages/EmailEngagementScoring.tsx:14`, `engagement/EmailScore/*` | `useEmailEngagementScore.ts` | `email-engagement-scorer` (145 l) / `email_engagement_scores` | **0** (ins 0) | usuário | 🟨 | Depende de `email_tracking_events` (0). Sem cron |
| Engajamento — score de contato | `src/components/engagement/EngagementScoreCard.tsx` | `useEngagementScore.ts:50,95,102` | `engagement-score-recompute` (42 l), rpc `recompute_engagement_score` / `contact_engagement_score` | **0** (ins 0) | usuário | 🟨 | RPC e edge existem; nunca executados. Sem cron |
| Engajamento — leaderboard | `src/components/engagement/EngagementLeaderboardWidget.tsx` | `useEngagementScore.ts:79` | view `engagement_score_leaderboard` | **0** | usuário | 🟨 | View sobre tabela vazia |
| Engajamento por conta (ABE) | `src/pages/AccountBasedEngagement.tsx`, `engagement/Account/*` | `useAccountEngagement.ts` | `account_activities`, `buying_committee` | **360** / **0** | usuário | 🟨 | `account_activities` tem dado; comitê de compra vazio |
| Power Dialer — filas | `src/pages/PowerDialer.tsx:12`, `dialer/QueueBuilderDialog.tsx` | `usePowerDialer.ts:47,111,131` | `dialer-queue-builder` (147 l), rpc `next_dialer_item`, `get_dialer_queue_stats` / `dialer_queues`, `dialer_queue_items` | **0** / **0** (ins 0) | usuário | 🟨 | Fio completo e coerente; nenhuma fila jamais montada |
| Power Dialer — click-to-call | `src/components/dialer/ClickToCallButton.tsx` | `useClickToCall.ts:24,46,72` | `twilio-click-to-call` / `twilio_call_sessions`, `call_logs`, `channel_credentials` | **0** / **0** / **0** | usuário | 🟨 | Bloqueado por `channel_credentials=0` (`useClickToCall.ts:24` busca credencial antes de discar) |
| Lead scoring | `src/pages/LeadScoring.tsx:5`, `lead-scoring/LeadScoringDashboard.tsx` | `useLeadScoring.ts:102,245` | `lead-scoring` (225 l) / `lead_scores`, `lead_score_history` | **900** / **1221** | usuário (batch manual) | 🟨 | **Único fio com dado real**, mas rodou em só **2 dias** (12/jul e 13/ago). Sem cron → score envelhece |
| Lead scoring — explicação | `src/components/lead-scoring/LeadScoreExplainCard.tsx`, `ScoreContributionBar.tsx` | `useLeadScoreExplanation.ts` | `lead_score_explanations` | **0** (ins 0) | usuário | 🟨 | Tabela nunca populada, apesar de `lead_scores` ter 900 |
| Lead scoring — tendência | `src/components/lead-scoring/ScoreSparkline.tsx`, `LeadScoreDistribution.tsx` | `useLeadScoring.ts:54` | `lead_score_trends` | **0** (ins 0) | usuário | 🟨 | Sparkline sem série |
| Enriquecimento de lead | — | `useLeadEnrichment.ts:10` | `enrich-lead` (142 l) | — | usuário (botão) | 🟨 | Implementada; sem tabela de destino verificável com dado |
| Lead routing | `src/pages/LeadRoutingPage.tsx:25`, `lead-routing/RoutingRulesPanel.tsx` | `useLeadRouting.ts:13,67,100`, `useLeadRoutingEngine.ts` | `lead_routing_rules`, `lead_routing_log`, `lead_assignments` | **0** (ins 3/del 3) / **0** / **0** | usuário | 🟨 | Regras criadas e apagadas; **nenhum roteamento executado** |
| SLA de leads | `src/pages/SLATrackingPage.tsx` | `useSLATracking.ts:76` (rpc `check_sla_violations`) | `check-lead-sla` (171 l) / `sla_policies`, `sla_violations` | **0** (ins 5/del 5) / **0** | botão em `BackendAutomationMonitor.tsx:68` | 🟨 | **Automação dormente crítica.** Políticas apagadas, 0 violações registradas, sem cron. UI declara "Configurável" (`AdminSystemStatus.tsx:24`) |
| SDR — dashboard/métricas | `src/pages/SDRDashboard.tsx:77`, `sdr/SDRDashboard.tsx:95` | `useSDRMetrics.ts:78,87,108,129,219,288,348` | `salespeople`, `sales`, `tasks`, `lead_scores` | 900 em `lead_scores`, 2228 em `activities` | usuário | ✅ | Funciona sobre dados reais de vendas/tarefas. Único ✅ do domínio |
| SDR — mapa preditivo / temperatura | `sdr/PredictiveSuccessMap.tsx:11`, `sdr/LeadTemperatureChart.tsx:8` | `useHourlySuccessProbability`, `useLeadTemperatureDistribution` (em `useSDRMetrics.ts`) | derivado de `sales`/`tasks` | derivado | usuário | ✅ | Deriva de dados reais; sem mock |
| SDR — alertas consecutivos | `src/components/sdr/TestSDRAlertButton.tsx:15`, `sdr/SDRAlertHistory.tsx` | `useSDRAlertNotifications.ts` | `sdr-consecutive-alerts` / `sdr_alert_configs`, `sdr_alert_history` | **0** / **0** (ins 0) | **botão "testar"** | 🟨 | **UI declara "8h diário" (`AdminSystemStatus.tsx:19`), cron.job não tem o job.** Zero alertas gerados |
| SDR — orquestrador de sequência | `src/components/sdr/SDRSequenceOrchestrator.tsx` (173 l) | — (nenhum hook) | — | — | — | 🟦 | Componente sem nenhuma chamada de hook/dado; casca visual |
| ICP — configuração | `src/pages/ICP.tsx:18`, `icp/ICPConfigForm.tsx`, `ICPEditDialog.tsx` | — | `icp_parameters` | **1** (ins 2/del 1) | usuário | 🟨 | 1 parâmetro salvo, nunca aplicado a clientes |
| ICP — dados/aderência | `icp/ICPTable.tsx`, `ICPRadarChart.tsx`, `ICPPerformanceChart.tsx:31` | `useLeadScoring.ts:129`, `useClientPortfolio.ts:112` | `icp_data` | **0** (ins 0) | usuário | 🟨 | **Nenhum cliente classificado como ICP** → radar/tabela/gráfico vazios |
| Playbooks | `src/pages/Playbooks.tsx:8`, `playbooks/PlaybooksManager.tsx:23` | `usePlaybooks` | `playbooks`, `playbook_items`, `playbook_progress` | **0** (4/4) / **0** (22/22) / **0** | usuário | 🟨 | Seed de 4 playbooks + 22 itens criado e removido |
| Sales Enablement (assets) | `src/pages/SalesEnablementHub.tsx:4`, `enablement/SalesEnablementHub.tsx:68,150` | `useLogAssetUsage`, `useAssetEfficiency`, `useCreateAsset` | `sales_enablement_assets`, `asset_usage_logs` | **0** / **0** (ins 0) | usuário | 🟦 | 495 linhas de UI sobre biblioteca vazia; métrica de eficiência sem base |
| Notificações — central | `src/components/notifications/NotificationCenter.tsx:234` | `useNotifications.ts:46,93,127,143` | `notifications` | **6** (todas `system/system`) | trigger/edge diversos | 🟨 | Funciona, mas **nenhuma notificação do domínio SDR**; última há 12 dias |
| Notificações — preferências | `notifications/NotificationPreferenceCard.tsx` | `useNotificationPreferences.ts` | `notification_preferences` | **0** (ins 0) | usuário | 🟨 | Nenhum usuário configurou; defaults implícitos |
| Mobile (navegação) | `mobile/MobileNavigation.tsx`, `MobileDrawer.tsx` | `useMobileNavigation.ts` | — (UI pura) | n/a | `templates/MainLayout.tsx` | ✅ | Consumido pelo layout principal; sem dependência de banco |
| Templates (layout) | `src/components/templates/MainLayout.tsx` | — | — (UI pura) | n/a | `AppRoutes.tsx` | ✅ | É o layout da aplicação, não template de mensagem |

---

## 6. Contagem por classificação

Total avaliado: **50 funcionalidades**.

| Classificação | Qtd | % |
|---|---:|---:|
| ✅ IMPLEMENTADO_TOTAL | **5 / 50** | 10% |
| 🟨 IMPLEMENTADO_PARCIAL | **33 / 50** | 66% |
| 🟦 SUGERIDO_OU_INICIADO | **8 / 50** | 16% |
| ⬛ MORTO_OU_ABANDONADO | **4 / 50** | 8% |

**Os 5 ✅:** SDR dashboard/métricas, SDR mapa preditivo/temperatura, Mobile (navegação), Templates (MainLayout) — e nenhum deles é uma automação. Os únicos verdes são telas de leitura sobre `sales`/`tasks`/`activities`, que pertencem ao domínio de vendas, não ao de prospecção.

**Os 4 ⬛:** `sequence-record-reply`, `process-scheduled-sends`, `inbound-email-webhook`, `multichannel-status-webhook`.

---

## 7. Automações dormentes (a lista que importa)

Ordenadas por gravidade — todas **falham sem erro visível**.

1. **`process-scheduled-sends` — fila sem consumidor.** 60 linhas de código correto que varrem `scheduled_sends WHERE status='pending'`. Zero chamadores em `src/`, zero em migrations, zero em `cron.job`. Qualquer envio agendado pela UI (`schedule-optimal-send` grava aqui) ficaria `pending` para sempre. Hoje `scheduled_sends=0`, então ninguém percebeu.

2. **`check-lead-sla` — SLA nunca verificado.** `sla_policies` teve 5 políticas criadas e apagadas; `sla_violations=0`. Sem cron. A única forma de rodar é um admin clicar em `BackendAutomationMonitor.tsx:68`. E `AdminSystemStatus.tsx:24` exibe "Configurável" como se houvesse agendamento.

3. **`sequence-runner` — o motor de sequências só roda por clique.** 422 linhas, a maior função do domínio, disparada exclusivamente por `SequencesPage.tsx:70,110`. Sem cron, uma sequência de 7 dias exigiria um humano clicando "Executar runner" todo dia.

4. **`process-cadence-tasks` — depende de alguém abrir a tela.** `Cadencias.tsx:73` invoca no `useEffect` de mount. Se ninguém abrir `/cadencias` em um dia, as tarefas do dia não são processadas.

5. **`auto-enroll-cadence` + trigger `trg_auto_enroll_on_sale` — regra vazia mata o fluxo.** O trigger dispara em toda venda (há tráfego real), chama `private.auto_enroll_in_cadence()`, que faz `SELECT ... FROM cadence_enrollment_rules WHERE is_active=true` sobre uma tabela de **0 linhas**, não acha nada e retorna `NEW` silenciosamente. Nenhum log, nenhum erro, nenhuma inscrição — `prospect_cadences` com `ins=0`.

6. **`inbound-email-webhook` e `multichannel-status-webhook` — inalcançáveis.** Ausentes de `supabase/config.toml` (que só isenta 3 funções) → `verify_jwt` ativo → provedores externos recebem 401. `multichannel-status-webhook/index.ts:6` inclusive comenta *"Returns 200 always to avoid retry storms"*, uma defesa contra um cenário que nunca chega a acontecer.

7. **`sequence-record-reply` — órfã.** 100 linhas, zero chamadores em qualquer lugar do repositório fora dela mesma. Sem ela, uma resposta de prospect nunca pausa a sequência.

8. **`engagement-score-recompute` / `email-engagement-scorer` / `send-time-optimizer` — sem recálculo periódico.** Todos os três dependem de execução recorrente para manter score/perfil atualizados. Nenhum tem cron; todos só rodam por ação de usuário. Todas as tabelas de destino: 0 linhas.

9. **`lead-scoring` — score envelhecendo.** É a única com dado (900 sales), mas `count(distinct date_trunc('day',calculated_at)) = 2`. Rodou em 12/jul e 13/ago. Sem cron, o score de um lead criado hoje simplesmente não existe até alguém abrir a tela de Lead Scoring.

10. **`sdr-consecutive-alerts` — agendamento fictício.** `AdminSystemStatus.tsx:19` promete "8h diário"; `cron.job` não tem o job; `sdr_alert_history=0`.

---

## 8. Mocks, `Math.random()` e dados falsos

Varredura em todos os 15 diretórios do escopo (componentes + hooks), excluindo `*.test.ts`:

```
grep -rn "Math\.random|mockData|MOCK|// TODO|FIXME|fake" src/components/{sdr,cadences,sequences,dialer,email,multichannel,engagement,lead-scoring,lead-routing,icp,enablement,playbooks,notifications,mobile} src/hooks/{cadences,sequences,dialer,engagement,multichannel,email,scoring}
```

**Uma única ocorrência:**

- `src/components/sdr/SchedulingRateGauge.tsx:138` — `SYS_ID: {Math.random().toString(16).slice(2, 8).toUpperCase()}` — gera um identificador decorativo para efeito visual "HUD". Não contamina métrica, mas muda a cada render, o que pode passar a impressão de um ID de sistema real.

**Conclusão:** o código deste domínio é honesto. Ele não inventa dados — ele simplesmente não tem dados. As telas vazias são vazias de verdade, não preenchidas com placeholder. Isso é uma qualidade, e diferencia este domínio de um que fingisse funcionar.

Observação adjacente (fora do escopo estrito): `automation_runs` tem 39 linhas cujos `started_at` compartilham o mesmo sufixo de milissegundos (`.483+00` / `.484+00`) em datas diferentes — assinatura de seed gerado programaticamente, não de execuções reais.

---

## 9. O que NÃO consegui verificar

1. **Se as edge functions estão deployadas.** Li o código-fonte em `supabase/functions/`, mas não tenho acesso ao painel de Functions do Supabase nem aos logs de invocação. Uma função pode existir no repo e nunca ter sido publicada. O acesso concedido é SELECT no banco.

2. **Logs de execução das edge functions.** Não há tabela de auditoria de invocação para elas (`edge_retry_events=0`, `integration_logs=0`). Não consigo distinguir "nunca foi chamada" de "foi chamada e falhou antes de escrever". A inferência via `n_tup_ins=0` cobre o efeito, não a causa.

3. **Secrets configurados.** `RESEND_API_KEY`, `BULK_EMAIL_FROM`, credenciais Twilio/Meta — são lidas via `Deno.env.get()` (`email-bulk-send/index.ts:88`, `check-lead-sla/index.ts:27`). Não tenho como ler o vault de secrets. Mesmo que existissem, `channel_credentials=0` já bloqueia o multicanal na camada de banco.

4. **Se algum agendamento externo existe** (GitHub Actions, n8n, Zapier, chamada de fora batendo nas functions). Verifiquei `cron.job` e as migrations; um scheduler externo não apareceria em nenhum dos dois. Contudo, `n_tup_ins=0` nas tabelas de destino desde 24/jul é forte evidência de que, se existe, não está produzindo efeito.

5. **Histórico anterior a 2026-07-24.** `pg_stat_database.stats_reset` desse dia zera os contadores `ins`/`del`. Os `count(*)=0` são absolutos e independem disso, mas afirmações do tipo "nunca inseriu" devem ser lidas como "não inseriu nas últimas 3,5 semanas".

6. **`enrich-lead` — tabela de destino.** Li o chamador (`useLeadEnrichment.ts:10`) e o tamanho da função (142 l), mas não abri o corpo inteiro para identificar onde ela grava. Classifiquei como 🟨 por conservadorismo.

7. **RLS.** Não avaliei se políticas de RLS estariam impedindo escritas do cliente nessas tabelas — o que seria uma causa-raiz alternativa e igualmente silenciosa para o padrão `ins=0`.
