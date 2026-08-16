# 07 — Domínio Win/Loss, Competitivo, Pricing e Customer Success

> **Auditoria por medição.** Nenhuma afirmação aqui vem de documentação. Cada linha foi
> obtida lendo o arquivo (`arquivo:linha`) ou executando `SELECT` no banco de produção via MCP.
> Data da medição: **2026-08-16**.
>
> Regra aplicada: *pronto = em produção com uso real*. Tabela vazia → 🟨, nunca ✅.

---

## 0. Sumário executivo (leia isto primeiro)

Três achados graves, todos comprovados:

1. **`src/lib/winloss/atRiskFixtures.ts` (1198 linhas de dados fictícios) está no bundle de
   produção e é renderizado na UI.** Não é só fixture de teste.
2. **A sub-infraestrutura de webhooks win/loss (5 edge functions, 7 tabelas, ~2.000 linhas
   de código) tem ZERO tráfego.** Todas as 7 tabelas têm `count(*) = 0`. Não existe produtor.
3. **Três componentes de Pricing renderizam números inventados** (`Math.random()`, constantes
   hardcoded, e razões fixas 0.58/0.27/0.15) apresentados como métricas reais ao usuário.

Além disso: **nenhum cron job dispara nenhuma edge function deste escopo** (11 jobs ativos em
`cron.job`, nenhum aponta para as funções auditadas).

---

## 1. VEREDITO — `src/lib/winloss/atRiskFixtures.ts`

### 1.1 Quem importa

```
src/lib/winloss/index.ts:6            export * from "./atRiskFixtures";
src/components/win-loss/AtRiskDealsFromPatterns.tsx:12   import { DOMINANT_PATTERNS_LIST } from "@/lib/winloss";
supabase/functions/detect-winloss-at-risk/fixtures.ts:7  export * from "../../../src/lib/winloss/atRiskFixtures.ts";
```

O barrel `src/lib/winloss/index.ts` re-exporta o arquivo inteiro, e
`AtRiskDealsFromPatterns.tsx` — componente **montado em produção** — importa dele.

### 1.2 Onde aparece na tela

`AtRiskDealsFromPatterns` é renderizado em `src/pages/WinLossIntelligence.tsx:433`
(rota `/win-loss-intelligence`, `src/routes/AppRoutes.tsx:211`).

Dentro dele:

- `AtRiskDealsFromPatterns.tsx:325` — rótulo *“Padrões dominantes considerados (5)”*, onde o `5`
  é `DOMINANT_PATTERNS_LIST.length`, ou seja, a contagem de **famílias fictícias**.
- `AtRiskDealsFromPatterns.tsx:332` — `.map()` sobre a lista fictícia, renderizando um `<li>` por família.
- `AtRiskDealsFromPatterns.tsx:~355` — a linha mais grave:
  ```
  ticket-alvo {fmtBRL(p.avg_amount ?? 0)} · ciclo {(p.avg_cycle_days ?? 0)}d · conf {Math.round((p.confidence ?? 0) * 100)}%
  ```
  `p` vem de `LOSS_PATTERNS_REALISTIC` (`atRiskFixtures.ts:52`), cujos valores são literais
  escritos à mão — por exemplo `avg_amount: 28500`, `avg_cycle_days: 38` (`atRiskFixtures.ts:52-104`).
  **O usuário vê “ticket-alvo R$ 28.500 · ciclo 38d” como se fosse métrica do negócio dele.**

### 1.3 Prova de que os dados fictícios nunca casam com os reais

Labels **fictícios** (`atRiskFixtures.ts:517,613,682,750,821`):
`"Preço alto"`, `"Negociação travada"`, `"Churn pós-trial"`, `"Pressão competitiva"`, `"Abordagem consultiva"`.

Labels **reais** em `win_loss_patterns` (medido no banco, 4 linhas):
`"Não classificado"`, `"Não informado"`, `"smb"`, `"mid"`.

`AtRiskDealsFromPatterns.tsx:116` faz `haystack.includes(entry.label.toLowerCase())` contra
`d.matched_pattern`, que vem do banco real. **Nenhum match é possível** — o badge “ativo”
(linha ~338) nunca acende, e o catálogo inteiro é decoração fictícia permanente.

### 1.4 Veredito

🟨 **PARCIAL / ACHADO GRAVE.** O arquivo é legitimamente a fonte canônica compartilhada com os
testes Deno (`supabase/functions/detect-winloss-at-risk/fixtures.ts:7`), mas **vazou para a UI de
produção** através do barrel. O cálculo de risco em si (`detect-winloss-at-risk/index.ts:49,54`)
lê dados reais (`win_loss_patterns`, `sales`); é **só o catálogo exibido** que é falso — o que é
pior do que ser todo falso, porque parece confiável ao lado de números verdadeiros.

**Correção mínima:** remover `export * from "./atRiskFixtures"` de `src/lib/winloss/index.ts:6` e
alimentar o catálogo com um `select` em `win_loss_patterns`.

---

## 2. VEREDITO — Webhooks Win/Loss

### 2.1 Medição de tráfego (banco de produção)

| Tabela | `count(*)` | `max(created_at)` |
|---|---:|---|
| `winloss_webhook_subscriptions` | **0** | — |
| `winloss_webhook_deliveries` | **0** | — |
| `winloss_webhook_dead_letters` | **0** | — |
| `winloss_webhook_alerts` | **0** | — (sem coluna de data) |
| `winloss_webhook_replay_audit` | **0** | — |
| `winloss_webhook_replay_invocations` | **0** | — |
| `winloss_webhook_dispatch_metrics` | **0** | — |
| `winloss_alert_settings` | **0** | — |
| `webhooks` (genérica) | **0** | — |
| `webhook_deliveries` | **0** | — |
| `webhook_events` | **0** | — |
| `webhook_logs` | **0** | — |

**Zero tráfego. Zero configuração. Zero em toda a superfície.**

### 2.2 Não existe produtor de eventos

`winloss-webhook-dispatcher` (318 linhas) é invocado por **exatamente um** chamador em todo o repo:

```
supabase/functions/winloss-webhook-replay/index.ts:348   'winloss-webhook-dispatcher',
```

…ou seja, só o *replay* o chama — e replay exige linhas em `winloss_webhook_deliveries`, que tem 0.
É um ciclo fechado sem entrada.

Em `src/`, a única ocorrência da string é **texto de UI**, não uma chamada:

```
src/pages/RetryTestStatusPage.tsx:157   supabase/functions/winloss-webhook-dispatcher/retry_test.ts
```

Nenhum trigger de banco chama o dispatcher (verificado em `pg_trigger` e em
`pg_get_functiondef` de todas as funções `public` contendo “webhook” — só há triggers de
`updated_at` e rotinas de limpeza de dedupe).

### 2.3 Nenhum agendamento

`cron.job` tem 11 jobs ativos. Os únicos relacionados a webhook são de **limpeza**:
`cleanup-webhook-dedupe` (`0 */6 * * *`) e `purge-webhook-inbound-dedupe-30d` (`0 3 * * *`).
`winloss-webhook-health-monitor` (608 linhas) **não tem cron e não tem chamador em `src/`**.

### 2.4 Veredito

🟦 **SUGERIDO_OU_INICIADO.** Cerca de **2.000 linhas** de edge functions + 7 tabelas + 12
componentes de UI + 15 hooks construídos com esmero (retry com backoff, DLQ, replay em lote,
timeline, health monitor, testes Deno parametrizados) para uma feature que **nunca processou um
único evento**. É infraestrutura de observabilidade sem nada para observar.

Não é ⬛ MORTO porque o código é coerente, testado e a UI está montada
(`WinLossIntelligence.tsx:437,438,442`) — falta apenas alguém publicar o primeiro evento.
Mas **jamais ✅**.

---

## 3. Tabela de funcionalidades

Legenda: ✅ IMPLEMENTADO_TOTAL · 🟨 PARCIAL · 🟦 SUGERIDO_OU_INICIADO · ⬛ MORTO_OU_ABANDONADO

### 3.1 Win/Loss — núcleo

| Funcionalidade | UI (arquivo:linha) | Hook | Edge function / Tabela | Linhas no banco | Classificação | O que falta |
|---|---|---|---|---|---|---|
| Dashboard Win/Loss (KPIs, tendência, matriz de motivos) | `src/pages/WinLossIntelligence.tsx:7-10` | `useWinLossData.ts`, `useWinLossAggregations.ts` | `win_loss_analyses` | **500** (397 won / 103 lost) | ✅ | — |
| Rodar análise (botão) | `WinLossIntelligence.tsx:56` | `useRunWinLossAnalysis.ts` | `analyze-win-loss` + `mine-win-loss-patterns` | `win_loss_patterns` **4**, última execução `2026-08-14 11:10` | ✅ | — |
| Padrões minerados | `WinLossReasonMatrix.tsx` | `useWinLossAggregations.ts` | `win_loss_patterns` | **4** | 🟨 | Labels degenerados (`"Não informado"`, `"smb"`): fonte `sales` sem motivo preenchido |
| Insights acionáveis | `ActionableInsightsPanel.tsx` (`WinLossIntelligence.tsx:12`) | `useInsightsImpact.ts` | `win_loss_insights` | **0** | 🟨 | `mine-win-loss-patterns/index.ts:160-161` apaga e reinsere; produziu zero |
| Comentários em insight | `InsightCommentsThread.tsx` | `useInsightComments.ts` | `win_loss_insight_comments` | **0** | 🟨 | Nunca usado |
| Atribuição de insight | `InsightAssignPopover.tsx` | `useInsightAssignment.ts` | `win_loss_insights` | **0** | 🟨 | Depende de insights inexistentes |
| Criar tarefa a partir de insight | `InsightCreateTaskModal.tsx` | `useInsightTaskCreation.ts` | `tasks` | 600 (nenhuma com `source_insight_id`) | 🟨 | Idem |
| Battle card de concorrentes | `WinLossIntelligence.tsx:399` | `useWinLossAggregations.ts:120,139` | `win_loss_analyses.competitor` | **0 de 500 não-nulas** | 🟨 | Coluna `competitor` 100% NULL → card sempre vazio |
| Tendência de sentimento | `WinLossIntelligence.tsx:424` | `useSentimentTrend.ts:49-51` | `call_recordings` | **0** | 🟨 | Sem gravações, gráfico sempre vazio |
| Matriz de correlação ICP | `WinLossIntelligence.tsx:418` | `useICPCorrelation.ts` (puro `useMemo`) | deriva de `win_loss_analyses` | 500 (`segment` 500/500) | ✅ | — |
| Comparação de temporadas | `WinLossIntelligence.tsx:427` | `useSeasonComparison.ts` (puro) | deriva de `win_loss_analyses` | 500 | ✅ | — |
| Heatmap de coorte / Histograma de ciclo / Win-by-hour / Loss reason flow | `WinLossIntelligence.tsx:20,22,23,385` | `useWinLossCohort.ts`, `useWinByHourMatrix.ts` | `sales` | **954** (461 ganhos) | ✅ | — |
| Teste A/B de script | `WinLossIntelligence.tsx:406` | `useScriptABTest.ts:55-56` | `sales.script_variant` | **0 não-nulas** | 🟨 | Coluna criada (migração `20260420210849`) mas nunca populada |
| Views salvas | `WinLossSavedViews.tsx` | `useWinLossSavedViews.ts` | `saved_filters` | **0** | 🟨 | Nunca usado |
| Layout de dashboard por usuário | `DashboardLayoutEditor.tsx` | `useUserDashboardLayout.ts` | `user_winloss_preferences` | **0** | 🟨 | Nunca usado |
| Exportar PDF | `WinLossIntelligence.tsx:281` | — | `export-winloss-pdf` (`ExportPdfButton.tsx:18`) | sem tabela de log | 🟨 | Sem persistência ⇒ uso real não verificável |
| Deals em risco por padrões | `WinLossIntelligence.tsx:433` | `useAtRiskFromPatterns.ts` | `detect-winloss-at-risk` → `win_loss_patterns` (4) + `sales` (954) | entrada real, catálogo fictício | 🟨 | Ver §1 — catálogo vem de fixtures |
| Configurações de risco (threshold, filtros) | `AtRiskSettingsPopover.tsx` | `useAtRiskSettings.ts` | `localStorage` (sem tabela) | n/a | ✅ | — |
| Painel de debug de risco | `RiskDebugPanel.tsx` | `riskSeverity.ts`, `riskReasons.ts` | puro (com testes) | n/a | ✅ | — |

### 3.2 Win/Loss — webhooks (todos 🟦, ver §2)

| Funcionalidade | UI (arquivo:linha) | Hook | Edge function / Tabela | Linhas no banco | Classificação | O que falta |
|---|---|---|---|---|---|---|
| Assinaturas de webhook | `WinLossIntelligence.tsx:438` | `useWebhookSubscriptions.ts` | `winloss_webhook_subscriptions` | **0** | 🟦 | Nenhuma assinatura cadastrada |
| Painel de saúde | `WinLossIntelligence.tsx:437` | `useWebhookDeliveryStats.ts` | `winloss-webhook-health-monitor` (608 l) / `winloss_webhook_deliveries` | **0** | 🟦 | Sem chamador e sem cron |
| Dead-letter queue | `WinLossIntelligence.tsx:442` | `useWebhookDeadLetters.ts`, `useDeadLetterErrorGroups.ts` | `winloss_webhook_dead_letters` | **0** | 🟦 | Nunca houve entrega |
| Entregas / drawer | `WebhookDeliveriesDrawer.tsx` | `useWebhookDeliveries.ts` | `winloss_webhook_deliveries` | **0** | 🟦 | Idem |
| Replay individual | `WebhookReplayHistory.tsx` | `useWebhookReplayPersistence.ts` | `winloss-webhook-replay` (445 l) / `winloss_webhook_replay_audit` | **0** | 🟦 | Idem |
| Replay em lote (assíncrono) | `AsyncReplayQueueDialog.tsx`, `BulkReplayConfirmDialog.tsx` | `useAsyncReplayQueue.ts` | `winloss-webhook-replay-batch` (299 l) | **0** | ⬛ | **Nenhum chamador em `src/` nem em `supabase/`** |
| Auditoria de replay | `ReplayAuditTrail.tsx` | `useReplayAudit.ts` | `winloss_webhook_replay_audit` | **0** | 🟦 | Idem |
| Invocações de replay | `ReplayInvocationsPanel.tsx` | `useReplayInvocations.ts` | `winloss_webhook_replay_invocations` | **0** | 🟦 | Idem |
| Timeline de webhook | `WebhookAttemptSliceDrawer.tsx` | `useWebhookTimeline.ts` | `winloss-webhook-timeline` (298 l) | **0** | 🟦 | Idem |
| Alertas de webhook | — | `useWebhookAlerts.ts`, `useWebhookAlertSettings.ts` | `winloss_webhook_alerts` / `winloss_alert_settings` | **0 / 0** | 🟦 | Nem as configurações foram criadas |
| Dispatcher | — (só texto em `RetryTestStatusPage.tsx:157`) | — | `winloss-webhook-dispatcher` (318 l) | **0** | 🟦 | **Nenhum produtor de eventos existe** |
| Webhooks genéricos | `src/pages/Webhooks.tsx` | `useWebhooks.ts` | `dispatch-webhook` / `webhooks` | **0** | 🟦 | Nenhum webhook cadastrado |
| Notificar padrão crítico | — | — | `notify-critical-pattern` + trigger `trg_notify_critical_winloss` | **0** | ⬛ | Trigger ativo mas **quebrado duas vezes**: `current_setting('app.functions_url')` = **NULL** (nunca faz POST) e o corpo referencia `NEW.name`, coluna **inexistente** em `win_loss_patterns`; erro engolido por `exception when others then null` (migração `20260420210849…sql:55-94`) |
| Coaching de perda | — | — | `generate-loss-coaching` | — | ⬛ | **Zero referências** em `src/` e em `supabase/migrations/` |

### 3.3 Competitivo

| Funcionalidade | UI (arquivo:linha) | Hook | Edge function / Tabela | Linhas no banco | Classificação | O que falta |
|---|---|---|---|---|---|---|
| Arena competitiva (hub) | `src/pages/ArenaCompetitiva.tsx:8` → `ArenaCategoryHub.tsx` (rota `AppRoutes.tsx:235`) | — | — | n/a | ✅ | — |
| Ranking semanal / Live scoreboard | `WeeklyRanking.tsx`, `LiveScoreboard.tsx` | `useWeeklyRanking`, `useCompetitiveRanking` | `sales`, `salespeople` | 954 / 18 | ✅ | — |
| Heatmap de atividade | `ActivityHeatmap.tsx` | `useQuery` → `activities`, `sales` | `activities` | **2.228** | ✅ | — |
| Feed de vitórias | `VictoryFeed.tsx` | `useVictoryFeed` | `victory_feed` | **80** | ✅ | — |
| Streaks | `StreakTracker.tsx`, `StreakIndicator.tsx` | `useSalesStreaks` | `sales_streaks` | **9** | ✅ | — |
| Temporadas competitivas | `SeasonAndPowerUps.tsx` | `useCompetitiveSeasons.ts` | `competitive_seasons` | **1** | 🟨 | Uma única temporada; sem histórico |
| Batalhas de vendas | `BattleArena.tsx`, `CreateBattleDialog.tsx` | `useSalesBattles` | `sales_battles` / `battle_participants` | **3 / 1** | 🟨 | 3 batalhas, 1 participante — uso incidental, não operacional |
| Confrontos semanais (H2H) | `HeadToHead.tsx` | `useWeeklyMatchups` | `weekly_matchups` | **0** | 🟨 | Cron `weekly-matchmaking` (`1 0 * * 1`) registra **1 execução falha** em `cron.job_run_details` |
| Chat competitivo | `CompetitiveChat.tsx` | `useCompetitiveChat.ts` | `competitive_chat_messages` | **0** | 🟦 | Nunca usado |
| Ligas | `LeagueSystem.tsx` | `useLeagues`, `useJoinLeague` | `leagues` | **0** | 🟦 | Cron `weekly-league-reset` ativo sobre tabela vazia |
| Torneios | `TournamentBrackets.tsx` | `useQuery` → `tournaments` | `tournaments` / `_matches` / `_participants` | **0 / 0 / 0** | 🟦 | Nunca usado |
| Apostas de performance | `PerformanceBets.tsx` | `useQuery` → `performance_bets` | `performance_bets` | **0** | 🟦 | Nunca usado |
| Wall of Fame / Kudos | `WallOfFame.tsx` | `useKudos` | `kudos` | **0** | 🟦 | Nunca usado |
| XP de vendedor (TV mode) | `EnhancedTVMode.tsx` | `useQuery` | `salesperson_xp` | **0** | 🟨 | Tabela vazia; `sales_goals` tem 12 |
| Comparação de features vs concorrente | `FeatureComparison.tsx:46,112` | — | **nenhuma** — arrays literais | n/a | ⬛ | 100% hardcoded; contém `image: 'tool-results://screenshots/20260508-130347-551351.png'` (`FeatureComparison.tsx:56`) — URL de artefato de ferramenta de IA, quebrada em produção |
| Plano de melhoria | `ImprovementPlan.tsx:27` | — | **nenhuma** — array literal | n/a | ⬛ | Conteúdo estático |
| Registro de concorrentes | — | `useCompetitorsRegistry.ts:21` | `competitors_registry` | **0** | 🟦 | Nunca usado |
| Preços de concorrentes | — | **nenhum consumidor** | `competitors_pricing` | **0** | ⬛ | Só aparece em `src/integrations/supabase/types.ts:5166` — tabela órfã |
| Menções a concorrentes | — | — | `competitor_mentions` / `detect-competitor-mentions` | **0** | 🟦 | Nunca usado |

### 3.4 Pricing

| Funcionalidade | UI (arquivo:linha) | Hook | Edge function / Tabela | Linhas no banco | Classificação | O que falta |
|---|---|---|---|---|---|---|
| KPIs de pricing (receita, ticket, desconto médio) | `PricingIntelligenceHub.tsx:89` (rota `AppRoutes.tsx:226`) | `usePricingIntelligence.ts:62` | `pricing-intelligence` → `sales`, `salespeople_public` | `sales` **954** | ✅ | — |
| Distribuição de descontos / top discounters | `PricingIntelligenceHub.tsx` | `usePricingIntelligence.ts` | idem | 954 | ✅ | — |
| Mapa de vazamento de receita | `PricingIntelligenceHub.tsx:294` | `usePricingIntelligence.ts` | `pricing-intelligence/index.ts:223-227` | derivado de 954 | 🟨 | **Segmentação inventada**: `discount = revenueLost * 0.58`, `competitor * 0.27`, `erosion * 0.15` — razões fixas no código, não medidas. UI ainda tem fallback próprio `0.55/0.3/0.15` (`PricingIntelligenceHub.tsx:296-298`) |
| Ameaças competitivas de preço | `PricingIntelligenceHub.tsx` | `usePricingIntelligence.ts` | `pricing-intelligence/index.ts:228-236` | — | 🟨 | `competitor_price = median_price * 0.85` — **preço do concorrente é fabricado**; `competitors_pricing` tem 0 linhas e não é lida |
| Curva de elasticidade de preço | `PricingIntelligenceHub.tsx:304` (`<PriceElasticityChart />`, **sem props**) | — | **nenhuma** | n/a | ⬛ | `PriceElasticityChart.tsx:35-51` gera 25 pontos com `Math.random()`; `:58` usa `data ?? generateMockData()` e nenhum chamador passa `data`. **Gráfico 100% aleatório em produção** |
| Simulador de desconto | `PricingIntelligenceHub.tsx:309` (`<DiscountOptimizer />`, sem props) | — | **nenhuma** | n/a | ⬛ | `DiscountOptimizer.tsx:23-31`: `// Mock elasticity logic`, `winRateBase = 0.35`, `dealValue = 50000` hardcoded |
| Histórico e alertas de preço | `src/pages/ComparadorPrecos.tsx` | `usePriceHistory.ts:64` | `price_history` / `price_alerts` | **200 / 18** | ✅ | — |
| Regras de preço / proteção | — | **nenhum consumidor** | `pricing_rules`, `price_protection_rules` | **0 / 0** | ⬛ | Só existem em `types.ts:11758,11796` — tabelas órfãs |

### 3.5 Purchase Intelligence

| Funcionalidade | UI (arquivo:linha) | Hook | Edge function / Tabela | Linhas no banco | Classificação | O que falta |
|---|---|---|---|---|---|---|
| Hub de inteligência de compras | `src/pages/PurchaseIntelligence.tsx` (rota `AppRoutes.tsx:209`) | `usePurchaseIntelligence.ts` | — | — | ✅ | — |
| Heatmap de compras (24 meses) | `PurchaseHeatmapGrid.tsx` | `usePurchaseIntelligence.ts:52` | RPC `get_client_purchase_heatmap` (existe) → `orders` | `orders` **267**, `clients` **100** | ✅ | — |
| Resumo por cliente | `PurchaseIntelligenceHub.tsx` | `usePurchaseIntelligence.ts:76` | RPC `get_purchase_intelligence_summary` (existe) | 267 | ✅ | — |
| Previsão de próxima compra | `PurchasePredictionCard.tsx` | `usePurchaseIntelligence.ts:70` | `purchase-intelligence-forecast` (`index.ts:43-44`, chama as 2 RPCs) | 267 | ✅ | — |
| Sazonalidade | `SeasonalityHeatmap.tsx` | `usePurchaseIntelligence.ts:103` | `client_purchase_seasonality` | **83** | ✅ | — |
| Auditoria de bloqueio de duplicatas | `DuplicateBlockAudit.tsx:26` | — | `duplicate_block_logs` | **0** | 🟨 | Nenhum bloqueio registrado |

### 3.6 Customer Success

| Funcionalidade | UI (arquivo:linha) | Hook | Edge function / Tabela | Linhas no banco | Classificação | O que falta |
|---|---|---|---|---|---|---|
| CS 360 (resumo, contas, tabs) | `src/pages/CustomerSuccess360.tsx:3` → `CustomerSuccess360Hub.tsx` (rota `AppRoutes.tsx:228`) | `useCustomerSuccess360.ts:138` | `customer-success-360` | `accounts` **100**, `renewals` **100**, `csat_ces_surveys` **108**, `support_tickets` **146**, `onboarding_journeys` **100**, `product_usage_summary` **100**, `qbr_schedule` **20**, `expansion_opportunities` **14** | ✅ | — |
| CS Hub (health score de contas) | `src/pages/CustomerSuccessHub.tsx:3` (rota `AppRoutes.tsx:224`) | `useCustomerSuccess.ts:43` | `customer-success-hub` → `accounts`, `account_activities` | 100 / **360** | ✅ | — |
| Coortes / Tendências CS360 | `CS360Tabs.tsx:150,154` | `useFilteredCS360Data.ts` | derivado do payload acima | 100 | ✅ | — |
| Detalhe de risco de churn | `CustomerSuccessHub.tsx:403` | `useCustomerSuccess.ts` | derivado de `accounts` | 100 | ✅ | — |
| Alertas de churn de cliente | `src/pages/AdminAlertasChurn.tsx` (rota `AppRoutes.tsx:173`) | `useChurnTaskCompletion.ts` | `detect-client-churn-alerts` | `client_churn_alerts_state` **0**, `churn_alert_settings` **1** | 🟨 | Configuração existe; **nenhum alerta jamais gerado**. Sem cron |
| E-mail de alerta de churn | `AdminAlertasChurn.tsx` | — | `send-churn-alert-email` | 0 | 🟨 | Depende do acima |
| Risco de churn de lead | — | — | `lead_churn_risk` | **0** | 🟦 | Nunca usado |
| Gatilho de pesquisa CSAT/CES | `CS360Tabs.tsx:412` | — | `csat-ces-trigger` → `csat_ces_surveys` | **108** | 🟨 | Tabela populada, mas não há como provar que veio da função (sem coluna de origem nem cron) |
| Automação de renovação | `CS360Tabs.tsx:495` (`HelpdeskConnectorPanel`) | — | `renewal-automation` → `renewals`, `tasks`, `notifications` | `renewals` **100**, `client_renewals` **0** | 🟨 | Sem cron; execução só manual pelo painel |
| Detector de expansão | `CS360Tabs.tsx:495` | — | `expansion-detector` → `expansion_opportunities`, `expansion_playbooks` | **14 / 0** | 🟨 | `expansion_playbooks` vazia ⇒ oportunidades sem playbook |
| Agendador de QBR | `CS360Tabs.tsx:495` | — | `qbr-scheduler` → `qbr_schedule` | **20** | 🟨 | Sem cron |
| Gerador de QBR | — (via `useRevenueIntelligenceHub.ts`) | `useRevenueIntelligenceHub.ts` | `qbr-generator` → `qbr_reports` | **0** | 🟨 | **Nenhum QBR jamais gerado** |
| Conector de helpdesk | `CS360Tabs.tsx:495` | — | `helpdesk-sync` → `cs_tickets` | **0** | 🟦 | Nunca sincronizou |

### 3.7 Portfolio

| Funcionalidade | UI (arquivo:linha) | Hook | Edge function / Tabela | Linhas no banco | Classificação | O que falta |
|---|---|---|---|---|---|---|
| Tabela / stats / gráficos de portfólio | `src/pages/Portfolio.tsx` (rota `AppRoutes.tsx:128`) | `useClientPortfolio.ts:35` | `client_portfolio` | **100** | ✅ | — |
| Atribuir cliente a vendedor | `AssignClientDialog.tsx` | `useClientPortfolio.ts:179` | `client_portfolio` | 100 | ✅ | — |
| Roteamento automático (round-robin / top performer) | `AutoRouteDialog.tsx` | `useLeadRouting.ts:56,162,189` | `client_portfolio` | 100 | 🟨 | Tabela `routing_history` **não existe** no banco, embora `useLeadRouting.ts:97` use a queryKey `routing_history` |
| Histórico de roteamento | `RoutingHistoryTable.tsx` | `useLeadRouting.ts:97` | — | tabela inexistente | 🟨 | Falta a tabela |
| Configurações de portfólio | — | `usePortfolioSettings.ts` | `portfolio_settings` | **0** | 🟨 | Nunca configurado |
| Auto-adicionar cliente ao portfólio | — | — | trigger `auto_add_client_to_portfolio` (ativo) | 100 | ✅ | — |

### 3.8 Deal Intelligence (edge functions do escopo)

| Funcionalidade | UI (arquivo:linha) | Hook | Edge function / Tabela | Linhas no banco | Classificação | O que falta |
|---|---|---|---|---|---|---|
| Health score de deal | `components/deal-intelligence/DealHealthScoreBadge.tsx` | `useDealHealth.ts` | `calculate-deal-health` → `deal_health_scores`, `deal_health_history` | **900 / 900** | ✅ | — |
| Previsão de velocidade | `src/pages/DealVelocityPage.tsx` | `useDealVelocity.ts` | `predict-deal-velocity` → `deal_velocity_predictions` | **900** | 🟨 | Depende de `deal_stage_history` (**0**) e `stage_velocity_baselines` (**0**) — previsões feitas sem histórico de estágio |
| Deals em risco (pipeline) | `components/pipeline/AtRiskDealsPanel.tsx` | `useAtRiskDeals.ts` | `detect-at-risk-deals` → `deal_risk_signals` | **0** | 🟨 | Nenhum sinal persistido |
| Deals travados | `components/deal-intelligence/velocity/StuckDealsPanel.tsx` | `useStageVelocity.ts` | `detect-stuck-deals` | `deal_stage_history` **0** | 🟨 | Sem histórico de estágio |
| Digest de risco de deals | — | — | `deal-risk-digest` | — | ⬛ | **Zero referências** em `src/` e em `supabase/migrations/` |
| Stakeholders do deal | `components/deal-intelligence/StakeholderListItem.tsx` | `useDealStakeholders.ts` | `extract-deal-stakeholders` → `deal_stakeholders` | **600** | ✅ | — |
| Cobertura de comitê | `src/pages/DealIntelligence.tsx` | `useCommitteeCoverage.ts` | `calculate-committee-coverage` → `deal_committee_coverage`, `committee_coverage_history` | **0 / 0** | 🟨 | Nunca calculado, apesar de 600 stakeholders |
| Extrair comitê de call | `components/conversational/RecordingSummaryDrawer.tsx` | `useCommitteeCoverage.ts` | `extract-committee-from-call` → `committee_extraction_runs` | **0** (e `call_recordings` **0**) | 🟦 | Sem gravações, sem execuções |
| Comitê de compra | `components/revenue-intelligence/BuyingCommitteeMap.tsx` | `useRevenueIntelligenceHub.ts` | `buying_committee`, `buying_committee_members` | **0 / 0** | 🟦 | Nunca usado |
| Engajamento de conta | `src/pages/AccountBasedEngagement.tsx` | `useAccountEngagement.ts` | `account-engagement-aggregator` → `contact_engagement_score`, `engagement_score_history` | **0 / 0** | 🟨 | Nunca agregado |
| Probabilidade de deal | `components/pipeline/PipelineBoard.tsx` | `useDealProbability.ts` | `deal-probability` | sem tabela de saída | 🟨 | Sem persistência ⇒ uso não verificável |
| Calibração de win probability | `components/revenue-intelligence/calibration/*` | `useWinProbabilityCalibration.ts`, `useWinProbabilityCalibrator.ts` | `calibrate-win-probability`, `calibrate-win-probabilities` → `win_probability_calibrations`, `win_probability_deal_calibrations`, `win_calibration_buckets` | **0 / 0 / 0** | 🟨 | Três tabelas de calibração vazias; painéis sempre em estado vazio |

---

## 4. Contagem por classificação

Total auditado: **86 funcionalidades**.

| Classificação | Qtd | % |
|---|---:|---:|
| ✅ IMPLEMENTADO_TOTAL | **26 / 86** | 30,2 % |
| 🟨 PARCIAL | **35 / 86** | 40,7 % |
| 🟦 SUGERIDO_OU_INICIADO | **17 / 86** | 19,8 % |
| ⬛ MORTO_OU_ABANDONADO | **8 / 86** | 9,3 % |

Por sub-domínio:

| Sub-domínio | ✅ | 🟨 | 🟦 | ⬛ | Total |
|---|---:|---:|---:|---:|---:|
| Win/Loss núcleo | 7 | 11 | 0 | 0 | 18 |
| Win/Loss webhooks | **0** | 0 | 11 | 3 | 14 |
| Competitivo | 5 | 4 | 6 | 4 | 19 |
| Pricing | 3 | 2 | 0 | 3 | 8 |
| Purchase Intelligence | 5 | 1 | 0 | 0 | 6 |
| Customer Success | 4 | 8 | 2 | 0 | 14 |
| Portfolio | 3 | 3 | 0 | 0 | 6 |
| Deal Intelligence | 3 | 6 | 2 | 1 | 12 |

**Nenhuma** das 14 funcionalidades de webhook win/loss atinge ✅.

---

## 5. Achados transversais

### 5.1 Zero automação agendada

`cron.job` tem 11 jobs ativos. **Nenhum** invoca qualquer edge function deste escopo.
Os 11 são: `campaign-health-alert-30min`, `cleanup-stale-logs-daily`, `cleanup-webhook-dedupe`,
`enforce-telemetry-retention-daily`, `gc-call-recording-ingest-jobs`,
`purge-quote-sync-inbound-log-30d`, `purge-telemetry-retention-daily`,
`purge-webhook-inbound-dedupe-30d`, `reset-pg-stat-statements-weekly`,
`weekly-league-reset`, `weekly-matchmaking`.

Consequência: `detect-client-churn-alerts`, `renewal-automation`, `qbr-scheduler`,
`csat-ces-trigger`, `expansion-detector`, `winloss-webhook-health-monitor`,
`deal-risk-digest`, `account-engagement-aggregator` só rodam se alguém clicar num botão.
Isso explica a maioria das tabelas vazias na coluna “Linhas no banco”.

Dois desses jobs também operam sobre o vazio: `weekly-league-reset` sobre `leagues` (0 linhas)
e `weekly-matchmaking` sobre `weekly_matchups` (0 linhas, com **1 execução falha** registrada
em `cron.job_run_details`).

### 5.2 Edge functions sem nenhum chamador (⬛)

Verificado com `grep -rn` em `src/` **e** `supabase/migrations/`:

- `generate-loss-coaching` — 0 referências
- `deal-risk-digest` — 0 referências
- `winloss-webhook-replay-batch` — 0 referências fora da própria pasta
- `winloss-webhook-health-monitor` — 0 referências fora da própria pasta (e sem cron)
- `notify-critical-pattern` — só a migração `20260420210849…sql:69`, cujo trigger está
  duplamente quebrado (ver §3.2)

### 5.3 Tabelas órfãs (existem no banco e em `types.ts`, sem consumidor no código)

`competitors_pricing`, `pricing_rules`, `price_protection_rules` — todas com 0 linhas e
nenhuma referência fora de `src/integrations/supabase/types.ts`.

### 5.4 Dados fictícios/inventados renderizados em produção — lista consolidada

| Origem | Arquivo:linha | O que o usuário vê |
|---|---|---|
| Fixtures de teste | `src/lib/winloss/atRiskFixtures.ts:52-104` via `AtRiskDealsFromPatterns.tsx:325,332,~355` | “ticket-alvo R$ 28.500 · ciclo 38d · conf 90%” — catálogo de 5 padrões inventados |
| `Math.random()` | `src/components/pricing/PriceElasticityChart.tsx:35-51,58` | Curva de elasticidade de preço inteira |
| Constantes hardcoded | `src/components/pricing/DiscountOptimizer.tsx:23-31` | Simulador de desconto (deal de R$ 50.000 fixo) |
| Razões fixas | `supabase/functions/pricing-intelligence/index.ts:223-227` + `PricingIntelligenceHub.tsx:296-298` | Mapa de vazamento de receita segmentado em 58/27/15 % |
| Fórmula inventada | `supabase/functions/pricing-intelligence/index.ts:232` | “Preço do concorrente” = 85 % do nosso preço mediano |
| Arrays literais + URL de artefato de IA | `src/components/competitive/FeatureComparison.tsx:46,56,112` | Comparativo de features com `tool-results://screenshots/…png` |
| Array literal | `src/components/competitive/ImprovementPlan.tsx:27` | Plano de melhoria estático |

---

## 6. O que NÃO foi possível verificar

1. **Se as edge functions estão de fato deployadas** no projeto Supabase. O acesso concedido é
   apenas `SELECT` no banco; não consultei o registro de funções nem os logs de invocação.
   Tudo que afirmo sobre “nunca executou” é inferido de **tabelas de saída vazias**, o que é
   forte mas não é prova direta para funções sem persistência.
2. **`export-winloss-pdf` e `deal-probability`** não gravam em tabela alguma. Não há como
   distinguir “nunca chamado” de “chamado e funcionando”. Classifiquei ambos 🟨 por precaução.
3. **`csat_ces_surveys` (108 linhas)** — não há coluna indicando origem. Não consigo provar se
   vieram de `csat-ces-trigger` ou de seed. Classifiquei 🟨.
4. **Se os 500 registros de `win_loss_analyses` são de produção real ou de seed.** Os números
   levantam suspeita: `avg_cycle_days ≈ 645` (quase dois anos por deal), `competitor` NULL em
   100 % das linhas e `primary_reason` degenerado em `"Não informado"` / `"Não classificado"`.
   Isso é consistente com dados sintéticos ou com uma origem (`sales`) que não preenche os
   campos qualitativos. Não investiguei a proveniência.
5. **Se a UI de webhooks é alcançável na prática** — os painéis estão montados em
   `WinLossIntelligence.tsx:437-442`, mas não verifiquei se há guarda de permissão/feature flag
   escondendo a aba.
6. **Logs de execução das edge functions** (`analytics.function_edge_logs` ou equivalente) — não
   estavam acessíveis pelas duas ferramentas MCP autorizadas.
7. **`match_weekly_players`** existe em algum schema (`pg_proc` retorna 1 ocorrência) mas não em
   `public`; o cron chama `public.match_weekly_players()` e registra falha. Não localizei em
   qual schema ela vive.
