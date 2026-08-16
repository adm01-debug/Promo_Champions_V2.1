# 09 — Estado da Camada Lógica (hooks / services / lib / utils / config / constants / types)

> **Método**: tudo abaixo foi **medido** por `grep`/`rg`/`find` sobre a árvore em `/home/user/promo-champions-v2.1`
> e por `SELECT` no banco de produção via MCP (`information_schema.tables`, `pg_proc`).
> Nenhum `docs/*.md` foi usado como fonte. Data da medição: **2026-08-16**.
> Onde a evidência não fecha, está marcado como **INFERIDO** ou como **não verificado** (seção final).

---

## 0. Inventário bruto do escopo (VERIFICADO)

| Diretório | Arquivos `.ts/.tsx` | Linhas |
|---|---:|---:|
| `src/hooks/` | 485 | 53.177 |
| `src/lib/` (total) | 54 | 6.266 |
| `src/lib/` **excluindo `src/lib/winloss/`** (escopo deste doc) | 44 | 4.399 |
| `src/lib/winloss/` (escopo de outro agente) | 10 | 1.867 |
| `src/services/` | 6 | 795 |
| `src/utils/` | 7 | 725 |
| `src/types/` | 6 | 634 |
| `src/config/` | 3 | 127 |
| `src/constants/` | 1 | 109 |

Comando de contagem: `find <dir> -type f \( -name '*.ts' -o -name '*.tsx' \) -exec cat {} + | wc -l`.

> ⚠️ **Divergência com o briefing**: o briefing informava `src/lib` = 2.379 linhas. A medição real é **4.399 linhas
> fora de `winloss/`** e **6.266 no total**. O número do briefing não bate com nenhum dos dois recortes.

`src/services/` tem apenas **6 arquivos** (`biService.ts`, `clientService.ts`, `comboService.ts`, `goalsService.ts`,
`salesService.ts`, `salesService.test.ts`) — ou seja, a "camada de service" é vestigial: **99% do acesso a dados
mora em `src/hooks/`**, não em services.

---

## 1. Mapa hook → destino

### 1.1 Por subpasta (VERIFICADO)

Contagens de **destinos distintos** por pasta (`.from('x')`, `.rpc('x')`, `functions.invoke('x')`).
`src/hooks` na primeira linha = **apenas os 146 arquivos na raiz**, sem subpastas.

| Pasta | Arquivos | Tabelas distintas | RPCs distintas | Edge distintas |
|---|---:|---:|---:|---:|
| `src/hooks` (raiz) | 146 | 104 | 23 | 16 |
| `src/hooks/win-loss` | 54 | 17 | 0 | 4 |
| `src/hooks/race` | 41 | 15 | 2 | 3 |
| `src/hooks/bi` | 19 | 15 | 5 | 0 |
| `src/hooks/cadences` | 18 | 11 | 4 | 0 |
| `src/hooks/conversational` | 17 | 17 | 4 | **13** |
| `src/hooks/gamification` | 17 | 25 | 2 | 0 |
| `src/hooks/sales` | 17 | 20 | 1 | 0 |
| `src/hooks/email` | 16 | 4 | 0 | 3 |
| `src/hooks/dashboard` | 12 | 11 | 7 | 0 |
| `src/hooks/deal-intelligence` | 10 | 17 | 0 | **11** |
| `src/hooks/reporting` | 10 | 8 | 0 | 2 |
| `src/hooks/sequences` | 10 | 11 | 1 | 5 |
| `src/hooks/revenue` | 7 | 13 | 4 | 4 |
| `src/hooks/admin-tasks` | 6 | 5 | 4 | 0 |
| `src/hooks/admin` | 5 | 19 | 1 | 2 |
| `src/hooks/assistant` | 5 | 2 | 0 | 0 |
| `src/hooks/engagement` | 5 | 11 | 5 | 7 |
| `src/hooks/suppliers` | 5 | 3 | 0 | 0 |
| `src/hooks/agents` | 4 | 2 | 1 | 0 |
| `src/hooks/coaching` | 4 | 5 | 0 | 4 |
| `src/hooks/crm` | 4 | 6 | 0 | 0 |
| `src/hooks/reports` | 4 | 2 | 0 | 0 |
| `src/hooks/scoring` | 4 | 3 | 1 | 1 |
| `src/hooks/semantic` | 4 | **0** | **0** | 4 (via `invoke`) |
| `src/hooks/tasks` | 4 | 1 | 0 | 0 |
| `src/hooks/activities` | 3 | 5 | 0 | 0 |
| `src/hooks/automation` | 3 | 4 | 2 | 2 |
| `src/hooks/conversation-intelligence` | 3 | 1 | 0 | 1 |
| `src/hooks/executive-briefing` | 3 | 1 | 0 | 1 |
| `src/hooks/orders` | 3 | 5 | 0 | 0 |
| `src/hooks/playbooks` | 3 | 3 | 0 | 0 |
| `src/hooks/customer-success` | 2 | **0** | **0** | **0** |
| `src/hooks/dialer` | 2 | 5 | 2 | 2 |
| `src/hooks/multichannel` | 2 | 2 | 0 | 1 |
| `src/hooks/pipeline-pulse` | 2 | 0 | 0 | 1 (dinâmico) |
| `src/hooks/revenue-intelligence` | 2 | 5 | 0 | 1 |
| `src/hooks/abm` | 1 | 4 | 1 | 0 |
| `src/hooks/ai` | 1 | 1 | 0 | 1 |
| `src/hooks/auth` | 1 | **0** | **0** | **0** |
| `src/hooks/calendar` | 1 | 1 | 1 | 0 |
| `src/hooks/follow-up` | 1 | 5 | 0 | 0 |
| `src/hooks/forecast` | 1 | 0 | 0 | 1 |
| `src/hooks/nlq` | 1 | 0 | 0 | 1 |
| `src/hooks/notifications` | 1 | 3 | 0 | 0 |
| `src/hooks/purchase-intelligence` | 1 | 1 | 2 | 1 |
| `src/services` | 6 | 10 | 0 | 0 |
| `src/lib` | 54 | 7 | 1 | 0 |
| `src/utils` | 7 | 5 | 0 | 0 |
| `src/config` / `src/constants` / `src/types` | 10 | 0 | 0 | 0 |

**Leitura**: `src/hooks/deal-intelligence` (10 arquivos, 11 edge functions) e `src/hooks/conversational`
(17 arquivos, 13 edge functions) são os módulos mais dependentes de backend serverless.
`src/config`, `src/constants` e `src/types` são puramente declarativos — zero acesso a dados, como esperado.

### 1.2 Totais de destinos referenciados pelo front (VERIFICADO)

| Categoria | Referenciado pelo front (distinto) | Existente no banco/repo | Cobertura |
|---|---:|---:|---:|
| Tabelas/views (`.from('…')`) | **323** | 432 (`information_schema.tables`, schema `public`) | 323/432 = **74,8%** |
| Funções do banco (`.rpc('…')`) | **80** | 278 (`pg_proc`, schema `public`) | 80/278 = **28,8%** |
| Edge functions (`functions.invoke('…')`) | **104** | 168 diretórios em `supabase/functions/` | 104/168 = **61,9%** |

Ocorrências brutas (não-distintas): 142 chamadas `functions.invoke(` em `src/`.

### 1.3 Views do banco consumidas diretamente pelo front (VERIFICADO — 9/9 encontradas)

`competitive_ranking`, `follow_up_audit_view`, `race_leaderboard_view`, `race_spectator_view`,
`revenue_forecast_view`, `sales_with_markup`, `salespeople_public`, `v_quote_conversion_history`,
`v_quote_conversion_metrics_daily`.

---

## 2. HOOKS ÓRFÃOS

### 2.1 Critério usado — e sua taxa de falso-positivo medida

**Universo**: 485 arquivos em `src/hooks/`. Destes, **443** exportam ao menos um símbolo `use*`
(`^export function use…` / `^export const use…`) e **42 não exportam nenhum** — são helpers puros,
testes e barrels (`useBICloserTransformers.ts`, `campaignDeliveryHelpers.ts`, `cadences/index.ts`, etc.).
Total de símbolos `use*` exportados: **876 declarações**, **857 nomes distintos**.

**Critério (declarado explicitamente)**:
1. Busca por **fronteira de palavra** (`rg -w`) do identificador em todo `src/**/*.{ts,tsx}` — **não** por `useFoo(`.
   Isso captura `useFoo<T>()`, `import { useFoo }`, re-export em barrel, e uso em JSX.
2. Exclui o(s) arquivo(s) que **define(m)** o símbolo.
3. **Segunda passada**: para os candidatos com zero uso externo, conta-se o uso **dentro do próprio arquivo**
   (ocorrências totais menos as linhas de declaração). Se >0, o hook é chamado internamente e **não é órfão**.

**Teste do critério contra a armadilha do regex (VERIFICADO)**:
Existem no repo hooks próprios do projeto invocados **com genérico**:
`usePagination<`, `useQueryPerformance<`, `useRetryMutation<`, `useSyncedSetting<`, `useDebouncedValue<`
(evidência: `src/hooks/useSyncedSetting.ts:80`, uso em `src/hooks/win-loss/useAtRiskSettings.ts:95`).
Um regex ingênuo `useFoo(` classificaria esses como órfãos. O critério de fronteira de palavra os
classifica corretamente como vivos. **Armadilha evitada e comprovada.**

**Falso-positivo medido**: o critério "sem uso externo" (passo 1+2) produziu **55 candidatos**.
A terceira passada (uso interno) eliminou **6** deles → **FP medido = 6/55 = 10,9%** do critério ingênuo,
corrigido para **0 FP conhecido** no critério final.

Os 6 falsos-positivos eliminados (são **VIVOS**, chamados dentro do próprio arquivo):
`useSales`, `useDailyMetrics`, `useCategoryMetrics` (`src/hooks/useReportData.ts` — consumidos internamente
por `useReportMetrics`, que é o único símbolo importado por `src/pages/Relatorios.tsx:10`),
`useDetailedKPIs` (`src/hooks/dashboard/useDashboardKPIs.ts:125`), `useChallengeProgress`
(`src/hooks/gamification/useWeeklyChallenges.ts`), `useStageInactivityRules` (`src/hooks/useInactiveDeals.ts`).

**Verificações de robustez adicionais (todas VERIFICADAS)**:
- Nenhum dos 49 órfãos finais está na lista de nomes duplicados (§6) → sem ambiguidade de resolução.
- Busca repo-wide em `tests/` e `scripts/`: **zero** ocorrências dos 49 nomes.
- Apenas **1** `export default` existe em todo `src/hooks/` (`useElevenLabsVoice.ts:284`) — não está na lista.
- Único risco residual conhecido: acesso por string dinâmica / reflexão. Nenhum caso desse tipo foi
  encontrado para hooks (só para `functions.invoke`, ver §3.3).

### 2.2 ÓRFÃOS CONFIRMADOS — 49 de 857 símbolos (5,7%)

Zero referência em `src/`, `tests/` e `scripts/`, inclusive dentro do próprio arquivo.

| # | Símbolo | Arquivo de definição |
|---:|---|---|
| 1 | `useAISuggestions` | `src/hooks/sales/useSalesAssistant.ts` |
| 2 | `useAccountActivities` | `src/hooks/abm/useAccounts.ts` |
| 3 | `useApprovalDecisions` | `src/hooks/admin/useApprovalWorkflows.ts` |
| 4 | `useAutoAssignLead` | `src/hooks/useLeadRoutingEngine.ts` |
| 5 | `useCallTranscript` | `src/hooks/conversational/useCallRecordings.ts` |
| 6 | `useCanAccess` | `src/hooks/usePermissions.ts:89` |
| 7 | `useCircuitBreakerNames` | `src/hooks/useCircuitBreakerHistory.ts` |
| 8 | `useCircuitBreakerTrends` | `src/hooks/useCircuitBreakerHistory.ts` |
| 9 | `useCoachingActionsBySalesperson` | `src/hooks/conversational/useCoachingActions.ts` |
| 10 | `useCoachingBenchmarks` | `src/hooks/coaching/useCoachingOpportunities.ts` |
| 11 | `useCreateBonusAward` | `src/hooks/useCommissionBonusAwards.ts` |
| 12 | `useCreateInteraction` | `src/hooks/useMultichannel.ts` |
| 13 | `useDealAssistant` | `src/hooks/sales/useSalesAssistant.ts` |
| 14 | `useDealVelocityBatch` | `src/hooks/deal-intelligence/useDealVelocity.ts` |
| 15 | `useDeleteOldCircuitBreakerEvents` | `src/hooks/useCircuitBreakerHistory.ts:82` |
| 16 | `useDeleteStepVariants` | `src/hooks/sequences/useStepVariants.ts` |
| 17 | `useDeleteTask` | `src/hooks/tasks/useTaskMutations.ts` |
| 18 | `useEnrollmentExecutions` | `src/hooks/sequences/useSequenceEnrollments.ts` |
| 19 | `useForecastSnapshots` | `src/hooks/revenue-intelligence/useForecastAccuracy.ts` |
| 20 | `useGoals` | `src/hooks/sales/useGoals.ts` |
| 21 | `useHasPermission` | `src/hooks/usePermissions.ts:94` |
| 22 | `useICPDataByClientId` | `src/hooks/useICPData.ts` |
| 23 | `useIsDesktop` | `src/hooks/useMediaQuery.ts` |
| 24 | `useIsTablet` | `src/hooks/useMediaQuery.ts` |
| 25 | `useIsTouchDevice` | `src/hooks/useMediaQuery.ts` |
| 26 | `useLeagueDefinitions` | `src/hooks/gamification/useLeagues.ts` |
| 27 | `useLogCircuitBreakerEvent` | `src/hooks/useCircuitBreakerHistory.ts` |
| 28 | `useLogEmailEvent` | `src/hooks/useEmailTracking.ts` |
| 29 | `usePersistHealthSnapshot` | `src/hooks/revenue/useRevenueIntelligence.ts` |
| 30 | `usePlaybookProgress` | `src/hooks/sales/useSalesEnablement.ts` |
| 31 | `usePrefersDarkMode` | `src/hooks/useMediaQuery.ts` |
| 32 | `usePriceEvolution` | `src/hooks/usePriceHistory.ts` |
| 33 | `useQueryMetricsLive` | `src/hooks/useQueryPerformance.ts` |
| 34 | `useQueueItems` | `src/hooks/dialer/usePowerDialer.ts` |
| 35 | `useRateLimitCheck` | `src/hooks/useRateLimit.ts` |
| 36 | `useRegisterComboAction` | `src/hooks/useCombo.ts` |
| 37 | `useResolveRiskSignal` | `src/hooks/revenue/useRevenueIntelligence.ts` |
| 38 | `useRiskSignals` | `src/hooks/revenue/useRevenueIntelligence.ts` |
| 39 | `useSalesGoals` | `src/hooks/sales/useSalespeople.ts` |
| 40 | `useSalespersonCoachingAggregate` | `src/hooks/conversational/useCoachingScorecard.ts` |
| 41 | `useSalespersonGamification` | `src/hooks/gamification/useGamificationData.ts` |
| 42 | `useSetMyRival` | `src/hooks/race/useMyRival.ts` |
| 43 | `useStageBaselinesAll` | `src/hooks/deal-intelligence/useStageVelocity.ts` |
| 44 | `useUpdateAgendaEvent` | `src/hooks/calendar/useAgendaEvents.ts` |
| 45 | `useUpdateChallengeProgress` | `src/hooks/gamification/useWeeklyChallenges.ts` |
| 46 | `useUpdateScheduledReport` | `src/hooks/reporting/useScheduledReports.ts` |
| 47 | `useUpdateTemplate` | `src/hooks/useMultichannel.ts` |
| 48 | `useWinLossAnalyses` | `src/hooks/deal-intelligence/useWinLoss.ts` |
| 49 | `useWorkflow` | `src/hooks/useWorkflows.ts` |

**Achados de maior peso nesta lista**:
- **`useCanAccess` e `useHasPermission` (`src/hooks/usePermissions.ts:89` e `:94`) nunca são chamados.**
  A checagem granular de permissão existe como código e não é exercida em lugar nenhum da UI.
  Apenas `usePermissions` (linha 28) é consumido.
- **4 dos 5 hooks de `useCircuitBreakerHistory.ts` são órfãos** (`useCircuitBreakerNames`,
  `useCircuitBreakerTrends`, `useLogCircuitBreakerEvent`, `useDeleteOldCircuitBreakerEvents`).
  O arquivo está praticamente todo morto.
- **`useMediaQuery.ts`: 4 helpers de breakpoint órfãos** (`useIsDesktop`, `useIsTablet`, `useIsTouchDevice`,
  `usePrefersDarkMode`).
- **`useDeleteTask`** (`src/hooks/tasks/useTaskMutations.ts`) — mutação de exclusão de tarefa sem UI.
- **`useUpdateAgendaEvent`** — edição de evento de agenda sem consumidor.

### 2.3 Candidatos a órfão de 2º grau — 15 de 857 (1,8%)

Hooks usados **apenas por outros hooks** (nenhum componente/página os toca diretamente).
Vivos se e somente se o hook-pai for vivo. **Requerem confirmação caso a caso — não são órfãos confirmados.**

| Símbolo | Definição | Consumidores (todos em `src/hooks/`) |
|---|---|---:|
| `useCheckIPStatus` | `src/hooks/useSecurityMonitoring.ts` | 1 |
| `useConversationAnalyses` | `src/hooks/conversation-intelligence/useConversationAnalyses.ts` | 1 |
| `useCreatePlaybook` | `src/hooks/playbooks/usePlaybookMutations.ts` | 1 |
| `useIndexEntity` | `src/hooks/semantic/useIndexEntity.ts` | 3 |
| `useLogLoginAttempt` | `src/hooks/useSecurityMonitoring.ts` | 1 |
| `useLoginRateLimiter` | `src/hooks/useLoginRateLimiter.ts` | 1 |
| `useQueryPerformance` | `src/hooks/useQueryPerformance.ts` | 1 |
| `useRecordAchievement` | `src/hooks/gamification/useAchievements.ts` | 1 |
| `useRetryMutation` | `src/hooks/useRetryMutation.ts` | 1 |
| `useRiskAssessments` | `src/hooks/suppliers/useSupplierQueries.ts` | 1 |
| `useSendNotification` | `src/hooks/useNotifications.ts` | 1 |
| `useSupplierList` | `src/hooks/suppliers/useSupplierQueries.ts` | 1 |
| `useSupplierMutations` | `src/hooks/suppliers/useSupplierMutations.ts` | 1 + barrel |
| `useSupplierProducts` | `src/hooks/suppliers/useSupplierQueries.ts` | 1 |
| `useSyncedSetting` | `src/hooks/useSyncedSetting.ts` | 1 |

### 2.4 Resumo

| Classificação | Símbolos | % de 857 |
|---|---:|---:|
| VIVO (consumido por componente/página/contexto) | 787 | 91,8% |
| Candidato a órfão de 2º grau (só outros hooks) | 15 | 1,8% |
| **ÓRFÃO CONFIRMADO** | **49** | **5,7%** |
| Falsos-positivos capturados e descartados | 6 | 0,7% |

---

## 3. Referências quebradas (FIO QUEBRADO)

### 3.1 Tabelas inexistentes — 1 de 323 (VERIFICADO)

| Tabela chamada | Existe no banco? | Onde |
|---|---|---|
| **`auth_users_view`** | **NÃO** (não está nas 432 do schema `public`) | `src/components/settings/FollowUpTerritoryRules.tsx:82` (`db.from('auth_users_view').select('id, display_name')`) e `:60` (join embutido `salesperson:auth_users_view(display_name)`) |

**Impacto**: a tela de regras de território de follow-up faz duas chamadas a uma view que não existe.
Ambas retornam erro do PostgREST. O arquivo está em `src/components/`, portanto **fora do meu escopo de
correção** — reportado aqui porque foi encontrado pelo cruzamento código↔banco desta auditoria.
As outras 322 tabelas/views referenciadas **existem**.

### 3.2 RPCs inexistentes — 0 de 80 (VERIFICADO)

Todas as 80 funções chamadas via `.rpc('…')` existem em `pg_proc` no schema `public`. **Nenhum fio quebrado.**

### 3.3 Edge functions inexistentes — 0 de 104 literais (VERIFICADO)

Todos os 104 nomes literais passados a `functions.invoke('…')` têm diretório correspondente em
`supabase/functions/`. **Nenhum fio quebrado nas chamadas literais.**

**Ponto cego declarado**: 2 chamadas usam nome **dinâmico** e não puderam ser validadas estaticamente:
- `src/hooks/pipeline-pulse/useQuickAction.ts:19` → `supabase.functions.invoke(meta.fn, …)`
- `src/components/admin/BackendAutomationMonitor.tsx:68` → `supabase.functions.invoke(functionName, …)`

---

## 4. O inverso: edge functions sem invocador no front — 64 de 168 (38,1%)

Existem em `supabase/functions/` mas **nenhum** `functions.invoke` literal em `src/` as chama.
São candidatas a **dormentes** ou **backend-only** (cron / webhook / trigger).

**Classificação abaixo é INFERIDA a partir do nome** — não verifiquei `pg_cron`, `supabase/config.toml`
nem os webhooks configurados no painel.

| Grupo (INFERIDO) | Funções |
|---|---|
| Cron / alertas agendados (provável backend-only) | `activity-goal-alerts`, `auto-reassign-inactive`, `campaign-health-alert`, `challenge-expiration-alerts`, `check-lead-sla`, `check-quote-expiration`, `check-v4-callback-alerts`, `cron-failure-alerter`, `compute-forecast-accuracy`, `deal-risk-digest`, `notify-critical-pattern`, `process-scheduled-sends`, `scheduled-reports-runner`, `wal-health-alert`, `new-device-alert` |
| Webhooks de entrada (chamados por terceiros, não pelo front) | `inbound-email-webhook`, `multichannel-status-webhook`, `receive-quote-sync`, `receive-quote-webhook`, `twilio-call-status`, `twilio-call-twiml`, `sequence-record-reply`, `email-unsubscribe`, `report-embed-public`, `get-client-ip`, `log-web-vitals` |
| Pipeline win-loss / webhook dispatcher | `winloss-webhook-dispatcher`, `winloss-webhook-health-monitor`, `winloss-webhook-replay-batch`, `winloss-webhook-timeline` |
| Semântica (4 de 6 sem invocador direto) | `semantic-coverage`, `semantic-search`, `semantic-search-universal`, `visual-search` |
| Voz ElevenLabs (3 funções, zero invocação) | `elevenlabs-stt`, `elevenlabs-tts`, `elevenlabs-voice` |
| **Aparentemente dormentes — sem cron nem webhook óbvio** | `admin-conversion-trail`, `ai-agent-orchestrator`, `analyze-pipeline-coverage`, `broadcast-sale-notification`, `conversational-intelligence`, `customer-success-360`, `customer-success-hub`, `extract-deal-stakeholders`, `forecast-narrative`, `generate-coaching-actions`, `generate-loss-coaching`, `generate-revenue-forecast`, `lead-scoring`, `personal-assistant-stream`, `pricing-intelligence`, `process-race-event`, `ranking-api`, `revenue-intelligence`, `revops-hub`, `run-retry-tests`, `sales-assistant-chat`, `send-push-notification`, `send-quote-to-client`, `simulate-load`, `stress-test-contracts`*, `territory-optimization` |

\* `stress-test-contracts` **é** invocada (aparece na lista de 104) — está aqui só para contraste; foi
removida da contagem de 64.

**Sinais fortes**:
- `elevenlabs-*` (3 funções) tem `src/hooks/useElevenLabsVoice.ts` no front, mas o hook **não usa
  `functions.invoke`** com esses nomes literais — a integração de voz está desconectada ou usa outro caminho.
  **Não verifiquei** o interior de `useElevenLabsVoice.ts` além dos greps.
- `customer-success-360` e `customer-success-hub` existem no backend enquanto
  `src/hooks/customer-success/` (2 arquivos) tem **zero** `.from`, `.rpc` e `.invoke` — módulo de
  Customer Success desconectado dos dois lados.
- `src/hooks/auth/` (1 arquivo) também tem zero acesso a dados.

### 4.1 Tabelas no banco sem nenhum consumidor no front — 110 de 432 (25,5%) — VERIFICADO

Amostra relevante (lista completa obtida por `comm -13`):
`ab_tests`, `ai_narrative_cache`, `ai_sales_insights`, `buying_committee`, `buying_signals`,
`cadence_enrollments`, `cohort_analyses`, `csat_ces_surveys`, `experiments`, `experiment_variants`,
`experiment_assignments`, `expansion_opportunities`, `expansion_playbooks`, `mql_qualifications`,
`onboarding_journeys`, `onboarding_steps`, `person_intelligence`, `pipeline_inspections`,
`pipeline_coverage_snapshots`, `pricing_rules`, `push_subscriptions`, `qbr_schedule`, `quote_items`,
`renewals`, `report_schedules`, `report_executions`, `semantic_index`, `support_tickets`, `territories`,
`user_2fa`, `user_2fa_backup_codes`, `user_mfa_settings`, `webauthn_challenges`, `webauthn_credentials`,
`web_vitals_samples`, `website_visitor_logs`, `win_loss_insight_comments`, além de 12 views `v_*` de
administração e as views de soft-delete (`activities_active`, `clients_active`, `tasks_active`,
`v_active_*`, `v_deleted_clients`).

**Nota**: parte dessas tabelas é legitimamente escrita só por edge functions/triggers. A lista **não**
prova código morto — prova apenas ausência de leitura pelo front.

### 4.2 RPCs no banco sem consumidor no front — 198 de 278 (71,2%) — VERIFICADO

Esperado em boa medida (triggers, funções internas `handle_*`, `trg_*`, `fn_test_*`, RLS helpers
`has_role`, `is_authenticated`). Não é achado de per si; registrado para dimensionamento.

---

## 5. Dado fictício na camada lógica (VERIFICADO — arquivo:linha)

### 5.1 Mocks que chegam à UI de produção — ACHADO GRAVE

| Arquivo:linha | O que é | Chega à tela? |
|---|---|---|
| `src/lib/bi/mockData.ts:1-13` | `MOCK_CLIENT_STATS` — LTV `125000`, ticket médio `2450`, 5 pedidos com datas e valores inventados (`2026-05-20`, `3200`…) | **SIM** |
| `src/lib/bi/mockData.ts:16-21` | `getMockIndustryTrends()` — produtos fixos: *MacBook Pro M3 +24%*, *Dell XPS 15 +18%*, *Monitor LG 34" Curved +32%*, *Cadeira Herman Miller +12%*. **Produtos que não são do catálogo de brindes promocionais.** | **SIM** |
| `src/lib/bi/mockData.ts:23-30` | `getMockSeasonality(seed)` — 12 meses sintéticos gerados de hash de string | **SIM** |
| `src/hooks/bi/useClientBI.ts:4,39,40,45` | importa e devolve `MOCK_CLIENT_STATS.avgTicket`, `.recency`, `.lastOrders` | consumido por `src/pages/BusinessIntelligencePage.tsx:16` |
| `src/hooks/bi/useIndustryTrends.ts:3` | importa `getMockIndustryTrends`, `getMockSeasonality` | consumido por `src/pages/BusinessIntelligencePage.tsx` |
| `src/hooks/bi/useClientVsIndustry.ts:39` | `client: 85, // Mock client value for now as we don't have a specific client metric RPC yet` — **valor 85 hardcoded** | consumido por `src/pages/BusinessIntelligencePage.tsx` |
| `src/hooks/dashboard/useIntelligenceZones.ts:109-126` | `getDeterministicMockSeasonality()` — gera sazonalidade com `Math.sin/Math.cos` de seed. Fallback silencioso quando `clientSeasonality.length < 3` ou `companyIds.length < 3` | **SIM** — `src/components/dashboard/modules/IntelligenceZones.tsx:20` |
| `src/hooks/orders/useOrderTracking.ts:180-192` | `MOCK_CLIENTS` — 10 nomes fictícios: *"Acme Corp"*, *"Tech Solutions Ltda"*, *"Inovação Brasil"*, *"Grupo Vértice"*… | **SIM** |
| `src/hooks/orders/useOrderTracking.ts:193-205` | `buildMockOrders()` — pedidos falsos `mock-order-N`, número `10000+i`, total `5000 + (seed % 95000)` | **SIM** |
| `src/hooks/orders/useOrderTracking.ts:212,236-240` | mistura real+falso: `const mocks = buildMockOrders(Math.max(0, 8 - real.length)); return [...real, ...mocks];` e `catch { return buildMockOrders(12) }` | **SIM** — `src/pages/AcompanhamentoPedidos.tsx`, `src/pages/AcompanhamentoPedidoDetalhe.tsx`, `src/components/order-tracking/OrderTrackingCard.tsx`, `src/components/order-tracking/TrackTimeline.tsx` |
| `src/hooks/orders/usePurchaseHistory.ts:76` | `// Mocking some fields if they don't exist yet to fulfill the "Intelligence" requirement` | `src/components/purchase-intelligence/ClientPurchaseHistory.tsx` |

**Conclusão desta seção**: a tela de **Acompanhamento de Pedidos** sempre exibe no mínimo alguns pedidos
inventados, e sempre 12 pedidos falsos quando não há usuário autenticado ou quando a query falha — sem
nenhum indicador visual de que o dado é sintético. A página de **Business Intelligence** e o módulo
**Intelligence Zones** do dashboard exibem sazonalidade e benchmark de indústria gerados por seed.

### 5.2 `Math.random()` — 19 ocorrências, quase todas legítimas

16 das 19 são geração de ID único para canal Realtime ou item de UI
(`` `${Date.now()}-${Math.random().toString(36).slice(2)}` ``) — padrão em
`src/hooks/useNotifications.ts:68`, `src/hooks/dashboard/useDashboardKPIs.ts:60`,
`src/hooks/sales/useSalesRealtime.ts:71`, `src/lib/analytics.ts:15`, etc. **Não é dado fictício.**

Os 3 usos que afetam lógica de negócio (aparentemente por design, sorteio real):
- `src/hooks/gamification/usePrizeWheel.ts:33` — `let random = Math.random() * totalWeight;` (roleta de prêmios)
- `src/hooks/useLeadAssignment.ts:26` — `let random = Math.random() * totalWeight;` (**distribuição ponderada de leads no cliente** — não determinística, não auditável)
- `src/hooks/gamification/useLevelUpCelebration.ts:121-127` — confete, puramente visual

### 5.3 `TODO` / `FIXME` / `HACK` / `XXX`

**Zero ocorrências** em todo o escopo (`src/hooks`, `src/services`, `src/lib`, `src/utils`, `src/config`,
`src/constants`, `src/types`). Isso é notável: o débito técnico **não** está sinalizado por comentário —
está escondido em fallbacks silenciosos como os de §5.1.

### 5.4 `@deprecated` — 2 ocorrências

- `src/hooks/tasks/types.ts:24` — `/** @deprecated Use TaskRecord instead */`
- `src/hooks/win-loss/useWinLossScenarios.ts:169` — `/** @deprecated Use tCritical(dof, 0.95) instead. Mantido para compat. */`

---

## 6. Refactor abandonado

### 6.1 Sufixos v2/new/legacy/old — praticamente ausentes (VERIFICADO)

- Arquivos com `v2|new|legacy|old|deprecated|copy|backup|_bak` no nome, em todo o escopo: **1**
  (`src/hooks/deal-intelligence/useDealStakeholders.ts` — casa por conter "**old**ers", falso positivo).
- Símbolos exportados com sufixo `V2/New/Legacy/Old`: **1** (`useDeleteOldCircuitBreakerEvents` — "Old"
  refere-se a *eventos antigos*, não a versão).

**Conclusão: não existe padrão de nomenclatura v2/legacy neste repo.** Se alguma documentação afirma o
contrário, está errada.

### 6.2 O refactor abandonado real: 18 nomes de hook definidos em 2+ arquivos (VERIFICADO)

De 876 declarações para 857 nomes distintos → **18 nomes colidem**. Este é o sintoma real de refatorações
paradas no meio: o módulo foi movido para uma subpasta nova, mas o original nunca foi removido.

| Nome duplicado | Definições | Qual roda de fato (evidência de `import`) |
|---|---|---|
| `useSemanticSearch` | `src/hooks/semantic/useSemanticSearch.ts` **e** `src/hooks/useSemanticSearch.ts` | **AMBOS**. `semantic/` → `CommandPalette.tsx:46`, `SemanticSearchDialog.tsx:8`. Raiz → `src/pages/SmartSearch.tsx:9`. **Duas implementações de busca semântica rodando em telas diferentes.** |
| `useBIDossierExport` | `src/hooks/bi/` **e** `src/hooks/dashboard/` | **AMBOS**. `bi/` → `BusinessIntelligencePage.tsx:16`; `dashboard/` → `IntelligenceZones.tsx:20` |
| `useBriefingHistory` | `src/hooks/assistant/` **e** `src/hooks/executive-briefing/` | **AMBOS**. `assistant/` → `BriefingHistoryTimeline.tsx:9`; `executive-briefing/` → `BriefingHub.tsx:9` |
| `useWebhookDeliveries` | `src/hooks/useWebhooks.ts` **e** `src/hooks/win-loss/useWebhookDeliveries.ts` | **AMBOS**. Raiz → `QualityReportView.tsx:6`; win-loss → `WebhookDeliveriesDrawer.tsx:14` |
| `useActivityGoals` | `src/hooks/activities/useActivities.ts` **e** `activities/useActivityGoals.ts` | **AMBOS**. `useActivityGoals.ts` → `ActivityGoalEditDialog.tsx:15`; `useActivities.ts` → `ActivityStats.tsx:2` |
| `useDealHealth` | `deal-intelligence/useDealHealth.ts` **e** `revenue/useRevenueIntelligence.ts` | **`deal-intelligence/` vence** (`DealHealthCard.tsx:6`, `NextBestActionPanel.tsx:2`). A cópia em `revenue/` não tem importador → **morta** |
| `useAccountContacts` | `abm/useAccounts.ts` **e** `engagement/useAccountEngagement.ts` | **`engagement/` vence** (`BuyingCommitteeCard.tsx:4`). Cópia em `abm/` sem importador |
| `useDebouncedValue` | `conversational/useCallLibrarySearch.ts:16` **e** `src/hooks/useDebouncedValue.ts:11` | **Raiz vence** (`ClientSelector.tsx:19`, `ScenarioForecastChart.tsx:37`, `Vendas.tsx:11`). Cópia em `conversational/` é local |
| `useStageBottlenecks` | `deal-intelligence/useStageConversion.ts` **e** `deal-intelligence/useStageVelocity.ts` | **`useStageVelocity.ts` vence** (`StageBottlenecksChart.tsx:15`). Duas implementações no **mesmo** módulo |
| `usePlaybooks` | `playbooks/usePlaybookQueries.ts` **e** `sales/useSalesEnablement.ts` | **`playbooks/` vence**, via barrel de compatibilidade `src/hooks/usePlaybooks.ts` (`// Re-export from refactored modules for backwards compatibility`), usado por `PlaybooksManager.tsx:3` e `Playbooks.tsx:3`. **Este barrel é a prova documental de um refactor que não terminou.** |
| `useTogglePlaybookItem` | `playbooks/usePlaybookMutations.ts` **e** `sales/useSalesEnablement.ts` | mesma situação de `usePlaybooks` |
| `useScheduleOptimalSend` | `engagement/useSendTimeOptimization.ts` **e** `sequences/useSendTimeOptimization.ts` | **`sequences/` vence** (`BulkComposerWizard.tsx:18`) |
| `useSendTimeProfile` | idem | **`sequences/` vence** (`SendTimeBadge.tsx:4`) |
| `useCancelScheduledSend` | idem | **nenhum importador direto** — arquivo `engagement/useSendTimeOptimization.ts` é cópia duplicada inteira de `sequences/useSendTimeOptimization.ts` |
| `useScheduledSends` | idem | idem |
| `useRevenueForecast` | **3 definições**: `forecast/`, `revenue-intelligence/`, `revenue/useRevenueIntelligence.ts` | Nenhum `import` nominal encontrado apontando para um deles especificamente — **ambíguo, requer confirmação** |
| `useCreateWorkflow` | `admin/useApprovalWorkflows.ts` **e** `automation/useAutomationWorkflows.ts` | domínios diferentes (aprovação vs automação) — colisão de nome, não duplicação |
| `useExecuteWorkflow` | `automation/useAutomationWorkflows.ts` **e** `src/hooks/useWorkflows.ts` | ambíguo — requer confirmação |

**Refactor abandonado mais claro**: `src/hooks/engagement/useSendTimeOptimization.ts` vs
`src/hooks/sequences/useSendTimeOptimization.ts` — **4 nomes idênticos nos dois arquivos**, com a UI
importando consistentemente de `sequences/`. A cópia em `engagement/` é código morto integral.

### 6.3 Barrels

Apenas 4 barrels `index.ts` em `src/hooks/`: `cadences/`, `playbooks/`, `suppliers/`, `tasks/`.
Mais o barrel de compatibilidade `src/hooks/usePlaybooks.ts` (§6.2).
44 de 485 arquivos (9,1%) exportam algo que não é um `use*` — helpers e testes.

---

## 7. VERIFICADO vs INFERIDO — separação explícita

### VERIFICADO (medido, com arquivo:linha ou query SQL)
- Todas as contagens de arquivos e linhas (§0).
- Mapa pasta→tabelas/RPCs/edge (§1.1) — via `grep -oE` por pasta.
- 323 tabelas, 80 RPCs, 104 edge functions referenciadas (§1.2).
- 432 tabelas e 278 funções no banco (`SELECT` em `information_schema.tables` e `pg_proc`).
- 168 diretórios em `supabase/functions/` (`ls`).
- Os 49 órfãos, os 15 de 2º grau, os 6 falsos-positivos e a taxa de FP de 10,9% (§2).
- `auth_users_view` inexistente + suas 2 chamadas (§3.1).
- Zero RPCs quebradas, zero edge functions literais quebradas (§3.2, §3.3).
- As 64 edge functions sem invocador (§4) e as 110 tabelas sem leitor (§4.1) — a **lista** é verificada.
- Todos os mocks de §5.1 com arquivo:linha, e a cadeia até a página consumidora.
- Zero `TODO/FIXME/HACK/XXX` em todo o escopo (§5.3).
- Os 18 nomes duplicados e, quando há `import` nominal, qual arquivo vence (§6.2).

### INFERIDO (raciocínio, não medição)
- A **classificação por grupo** das 64 edge functions dormentes em §4 (cron / webhook / dormente) — deduzida
  do nome. Não abri `pg_cron`, `supabase/config.toml`, nem os webhooks configurados.
- "Módulo de Customer Success desconectado" — inferido de `src/hooks/customer-success/` ter 0 acessos a dados
  e as 2 edge functions correspondentes não serem invocadas.
- "A integração ElevenLabs está desconectada" — inferido de 3 funções sem invocação literal; **não li**
  `src/hooks/useElevenLabsVoice.ts` por dentro.
- Para os nomes duplicados sem `import` nominal encontrado (`useRevenueForecast`, `useExecuteWorkflow`,
  `useCreateWorkflow`, `useCancelScheduledSend`, `useScheduledSends`), qual definição roda é **ambíguo**.

---

## 8. O que NÃO consegui verificar

1. **Se as 64 edge functions sem invocador são realmente dormentes.** Faltou ler `pg_cron.job`,
   `supabase/config.toml` e a configuração de webhooks/triggers do banco. A classificação em §4 é um chute
   informado pelo nome. **Este é o maior buraco deste relatório.**
2. **Os 2 `functions.invoke` dinâmicos** (`useQuickAction.ts:19`, `BackendAutomationMonitor.tsx:68`):
   não sei quais nomes chegam em runtime, logo não posso afirmar que não há fio quebrado ali.
3. **Se os 49 órfãos "sempre foram" órfãos ou se a UI que os consumia foi removida.** Não consultei
   histórico do git.
4. **Qual definição roda** para `useRevenueForecast` (3 definições), `useExecuteWorkflow`, `useCreateWorkflow`,
   `useCancelScheduledSend`, `useScheduledSends` — sem `import` nominal localizado, a resolução depende de
   ler os consumidores caso a caso.
5. **Se as 110 tabelas sem leitor no front são escritas por edge functions/triggers.** Só medi o front.
6. **Cobertura semântica das colunas**: verifiquei que a *tabela* existe, não que as *colunas* selecionadas
   em cada `.select(...)` existam. Um `.select('coluna_que_nao_existe')` passaria despercebido — esta é uma
   classe inteira de fio quebrado que **não** foi auditada.
7. **`src/contexts/`** — fora do escopo por atribuição, mas 6 arquivos ali podem conter hooks que mudariam
   a classificação de órfãos. Meu scan **incluiu** `src/contexts/` como consumidor, então isso não gera
   falso órfão; mas hooks *definidos* lá não foram inventariados.
8. **Conteúdo de `src/lib/winloss/`** (10 arquivos, 1.867 linhas) — excluído por atribuição a outro agente.
9. **Se os mocks de §5.1 estão atrás de alguma feature flag.** Li o caminho do código, não o estado das flags
   em produção (`feature_flags` tem 11 referências no front, não cruzei).
