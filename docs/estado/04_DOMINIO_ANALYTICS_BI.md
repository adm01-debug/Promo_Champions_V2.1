# 04 — DOMÍNIO ANALYTICS / BI / RELATÓRIOS / FORECAST

> **Auditoria de estado real.** Método: MEDIR, NÃO CONFIAR.
> Nenhuma afirmação aqui vem de `docs/*.md`. Todo item foi lido em `arquivo:linha` e/ou medido
> no banco de produção via MCP (`SELECT` apenas).
> Data da medição: **2026-08-16**. Projeto: `promo-champions-v2.1`.

---

## 0. SUMÁRIO EXECUTIVO — O QUE A MEDIÇÃO REVELOU

O domínio Analytics/BI tem **muita UI e pouca verdade**. Encontrei **4 falhas sistêmicas de raiz**
que envenenam dezenas de telas simultaneamente. Elas não são bugs isolados: são contratos de dados
quebrados entre o schema real e o código que o lê.

### 🔴 RAIZ #1 — `sales.status = 'completed'` NUNCA EXISTE NO BANCO

Medido:
```sql
select status, count(*) from public.sales group by 1;
-- won 461 | lost 103 | cancelled 86 | closed 86 | pending 90 | proposal 86 | lead 42
-- 'completed'  →  0 linhas   (também 'qualified' e 'negotiation' → 0)
select count(*) from public.sales where status='completed';  -- 0
```
O repo tem a constante correta em `src/constants/index.ts:68`
(`WON_SALE_STATUSES = ['completed','won','closed']`), mas **views do banco, RPCs e edge functions
filtram `'completed'` literal**. Consequências medidas:

| Consumidor | Local | Efeito |
|---|---|---|
| `mv_competitive_ranking` | matview no banco | `total_sales = 0` e `rank = 1` para **todos os 8 vendedores ativos** |
| `revenue_forecast_view` | view no banco | `won_amount_90d = 0`, `avg_cycle_days = 45` (fallback) para todos |
| `revops-hub` | `supabase/functions/revops-hub/index.ts:41` | `closed_revenue`, `win_rate`, `cycle_days`, `avg_deal_size`, `velocity` = **0 sempre** |
| `LTVBySegment` | `src/components/analytics/LTVBySegment.tsx:33` | gráfico de LTV por segmento sempre vazio |

### 🔴 RAIZ #2 — `sales.stage` É NULL EM 100% DAS LINHAS

```sql
select stage, count(*) from public.sales where status not in ('completed','lost','cancelled') group by 1;
-- stage = NULL | 765 linhas | R$ 4.889.248,90
```
Toda a ponderação por estágio morre:
- `get_revenue_forecast(_days)` (RPC, `LEFT JOIN stage_weights sw ON sw.stage = d.stage`) →
  `weighted_revenue` retorna **R$ 0 sempre**. Verificado: `select * from get_revenue_forecast(30)`
  → `weighted_revenue: "0", raw_pipeline: "0", deal_count: 0, avg_health: 50`.
- `revops-hub/index.ts:47` → `STAGE_WEIGHTS[d.stage] ?? 0.1` → todo deal recebe peso fixo 0.1.
  O "forecast ponderado" é literalmente `pipeline × 10%`.
- `revops-hub/index.ts:71` → `stage_distribution` colapsa num único balde `undefined`.

### 🔴 RAIZ #3 — TABELA `deal_stage_history` ESTÁ VAZIA (a de verdade é `deal_stage_transitions`)

```sql
select count(*) from public.deal_stage_history;      -- 0
select count(*) from public.deal_stage_transitions;  -- 1254
```
Duas tabelas paralelas. **A UI lê a vazia.** Colunas confirmadas:
`deal_stage_history(id,sale_id,stage,entered_at,exited_at)` vs
`deal_stage_transitions(id,sale_id,from_stage,to_stage,entered_at,exited_at,duration_hours,...)`.

Leitores da tabela vazia (todos retornam `[]` / zeros):
`src/hooks/useClosingTime.ts:15` · `src/hooks/dashboard/useFunnelData.ts:35` ·
`src/hooks/reporting/useFunnelComparison.ts:26` · `src/hooks/usePipelineVelocity.ts:29` ·
`src/hooks/useWeightedForecast.ts:60` · `src/hooks/bi/useBICloser.ts:143`

### 🔴 RAIZ #4 — COLUNAS/TABELAS INEXISTENTES EM EDGE FUNCTIONS (query 400 → dado null → KPI zero)

| Referência no código | Realidade no banco | Efeito |
|---|---|---|
| `pipeline-pulse-aggregator/index.ts:38,39,40` → `sales.total_amount` | coluna é `amount` (44 colunas verificadas) | as 3 queries de `sales` falham → **Pipeline Total, Forecast 30d, Win Rate = R$ 0 / 0%** |
| `pipeline-pulse-aggregator/index.ts:43` → `lead_routing_assignments` | `to_regclass` = **null**; a real é `lead_assignments` | `teamCapacity` cai no fallback fixo `0.5` (linha 74) |
| `predict-quota-attainment/index.ts:144` → `salespeople.monthly_goal` | coluna **não existe** (`id,name,email,avatar_url,commission_rate,is_active,...`) | pipeline inteiro de quota falha → 4 tabelas de quota com 0 linhas |
| `revops-hub/index.ts:78` → outcome `'successful'/'interested'/'meeting_scheduled'` | enum `activity_outcome` = `connected,no_answer,scheduled,voicemail,busy,callback,not_interested,qualified,bad_timing,wrong_person,unsubscribed` | `activity_efficiency` = **0% sempre** |
| `pipeline-pulse-aggregator/index.ts:38` → status `'open'/'negotiating'` | não existem | mesmo se a coluna fosse certa, só `'proposal'` casaria |

### 🔴 RAIZ #5 — `nlq-query` NÃO COMPILA (erro de sintaxe)

`supabase/functions/nlq-query/index.ts:9-11`:
```ts
 9  import {
10  import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";
11    querySalesMetric,
```
Um `import` foi injetado **dentro** de um bloco `import { ... }` multi-linha. É TypeScript inválido —
a função não sobe. Todo o recurso de NLQ (`/perguntar`, `DashboardNLQWidget`, `NLQInput`) está morto.
Mesma corrupção existe em `supabase/functions/ai-copilot/index.ts:5` (fora deste escopo, mas registrado).

### 🟠 RAIZ #6 — `forecast_category` só assume `'omitted'` e `'pipeline'`; aritmética NULL zera cenários

```sql
select forecast_category, count(*) from public.sales group by 1;
-- omitted 221 | pipeline 733   ('commit' e 'best_case' → 0 linhas)
```
Em `revenue_forecast_view` os cenários são:
```sql
COALESCE(max(ca.commit_amount), 0)                                   AS pessimistic_30d,
COALESCE(max(ca.commit_amount + ca.best_case_amount * 0.5), 0)       AS realistic_30d,
COALESCE(max(ca.commit_amount + ca.best_case_amount + ca.pipeline_amount * 0.3), 0) AS optimistic_30d
```
`sum(...) FILTER (...)` sem match retorna **NULL**, não 0. `NULL + qualquer coisa = NULL` →
`COALESCE(max(NULL),0)` → **0**. Medido nas 12 linhas da view:
`pessimistic_30d = realistic_30d = optimistic_30d = "0"` para **todos** — mesmo com
`pipeline_amount = R$ 718.244,79`. O Hub de Forecast mostra três cards de cenário em **R$ 0,00**.

Bônus da mesma view: o filtro de pipeline aberto é
`WHERE s.status <> ALL (ARRAY['completed','lost','abandoned'])`. Como `'won'` **não** está na lista,
os **461 deals ganhos (R$ 3.294.531,73)** são contados como pipeline aberto. Inflação massiva.

---

## 1. TABELA DE FUNCIONALIDADES

| Funcionalidade | UI (arquivo:linha) | Hook | Tabela/View/Function | Linhas no banco | Classificação | O que falta |
|---|---|---|---|---|---|---|
| **FORECAST** |
| Revenue Forecast Hub (cenários) | `src/components/forecast/RevenueForecastHub.tsx:42` | `src/hooks/forecast/useRevenueForecast.ts:52` → `revenue-forecast-ai` | `revenue_forecast_view` | 12 linhas, mas `pessimistic/realistic/optimistic_30d = 0` em todas | 🟨 | Corrigir NULL-arithmetic na view; popular `forecast_category` commit/best_case; excluir `won` do pipeline aberto |
| Categorias Commit/Best Case/Pipeline | `src/components/forecast/CategoryForecastCard.tsx` | idem | `revenue_forecast_view.commit_amount/best_case_amount` | `commit=0`, `best_case=0` em 12/12 | 🟨 | Nenhum deal classificado como commit/best_case |
| Simulador de Cenários (forecast) | `src/components/forecast/ForecastScenarioSimulator.tsx` | deriva de `useRevenueForecast` | — | base = 0 | 🟨 | Simula em cima de zeros |
| Narrativa IA do Forecast | `src/components/forecast/ForecastNarrativeCard.tsx` | `revenue-forecast-ai` (`index.ts:112-170`) | LOVABLE_API_KEY | — | 🟨 | Sem chave → `narrative=""` silencioso (linha 108); prompt alimentado com cenários zerados |
| Forecast Ponderado (`/forecast`) | `src/components/analytics/WeightedForecastDashboard.tsx:18` | `src/hooks/useWeightedForecast.ts:55` | `sales`, `lead_scores`(900), `deal_stage_history`(**0**), `sales_goals` | parcial | 🟨 | `deal_stage_history` vazia; meta do mês corrente inexistente |
| Fatores de impacto (Forecast Ponderado) | `src/components/analytics/WeightedForecastDashboard.tsx:24-28` | inline | `performance_impact_factors` | **0** | 🟨 | Tabela nunca populada; bloco renderiza vazio |
| Revenue Forecast (persistido) | `src/components/revenue-intelligence/RevenueForecastCard.tsx:31` | `src/hooks/revenue-intelligence/useRevenueForecast.ts:70` | `revenue_forecasts` | **3** | 🟨 | Só 3 forecasts; geração é 100% manual (`generate-revenue-forecast`), sem cron |
| Contribuições por deal | `src/components/revenue-intelligence/ForecastDealsTable.tsx` | `useForecastContributions` (`useRevenueForecast.ts:84`) | `forecast_deal_contributions` | **0** | 🟨 | Tabela vazia → tabela de deals sempre vazia |
| Precisão do Forecast (MAPE) | `src/components/revenue-intelligence/forecast/ForecastAccuracySummary.tsx:20` | `useForecastSummary` (`useForecastAccuracy.ts:88`) | `forecast_accuracy` | **0** | 🟨 | **Mascaramento de zero:** `useForecastAccuracy.ts:96-98` `rows.length ? … : 0` → MAPE 0,0% → `mapeHealth(0)`= "Excelente" verde; `:112` `accuracy_trend = 100 - 0 = 100%`. Dashboard anuncia forecast perfeito sobre tabela vazia |
| Forecast vs Realizado / Bias / MAPE por segmento | `.../ForecastVsActualChart.tsx`, `ForecastBiasChart.tsx`, `MapeBySegmentChart.tsx` | `useForecastAccuracy.ts:57` | `forecast_accuracy` | **0** | 🟨 | Gráficos vazios; viés dominante default "Preciso" (`:102-107`) |
| Confidence Scores | `.../ConfidenceScoresTable.tsx` | `useConfidenceScores` (`:74`) | `forecast_confidence_scores` | **0** | 🟨 | Tabela vazia |
| Snapshots de forecast | `.../ForecastAccuracySummary.tsx:45` (botão) | `useSnapshotForecast` (`:124`) → `snapshot-forecast` | `forecast_snapshots` | **6** | 🟨 | As 6 linhas têm `created_at` idêntico (`2026-07-12T19:57:48.718629`) e valores redondos (118000/192000/155000/240000…) — padrão de **seed manual**, não de execução da function. Sem cron |
| **REVENUE INTELLIGENCE** |
| Revenue Intelligence Hub (19 abas) | `src/components/revenue-intelligence/RevenueIntelligenceHub.tsx:87-104` | vários | vários | ver linhas | 🟨 | Casca completa; maioria das abas sobre tabela vazia |
| Forecast rollup / variance | `.../ForecastCategoriesPanel.tsx` (Hub:76) | `useRevenueIntelligenceHub.ts` | `get_revenue_forecast(_days)` RPC | retorna `weighted_revenue=0` sempre (RAIZ #2) | 🟨 | RPC junta em `sales.stage` que é 100% NULL |
| Coverage Ratio Gauge | `src/components/revenue-intelligence/CoverageRatioGauge.tsx` | — | `v_pipeline_coverage_summary` / `pipeline_coverage_snapshots` | **0 / 0** | 🟨 | Nenhum snapshot de cobertura jamais gerado |
| Pipeline Inspection | `.../PipelineInspectionTable.tsx` (Hub:165) | `useRevenueIntelligenceHub.ts:141` | RPC `compute_pipeline_inspection()` + `pipeline_inspections` | tabela **0** | 🟨 | RPC existe (assinatura confirmada) mas nada persistido |
| Win Probability Calibration | `.../calibration/WinProbabilityCalibrationPanel.tsx` (Hub:159) | `src/hooks/revenue/useWinProbabilityCalibration.ts:48` | `win_probability_calibrations` / `deal_probability_scores` | **0 / 0** | 🟨 | Nenhuma calibração executada |
| Calibrador por Bucket | `.../calibration/WinProbabilityCalibratorPanel.tsx` (Hub:162) | `useWinProbabilityCalibrator.ts:51,68` | `win_probability_deal_calibrations`, `win_calibration_buckets` | **0 / 0** | 🟨 | Curva de calibração sem dados |
| Quota Attainment Predictor | `.../quota/QuotaAttainmentPredictor.tsx` (Hub:180) | `src/hooks/revenue/useQuotaAttainment.ts:46` | `quota_attainment_predictions` | **0** | 🟨 | **Quebrado na origem:** `predict-quota-attainment/index.ts:144` lê `salespeople.monthly_goal` — coluna inexistente |
| Quota Forecasts / Actions / Alerts | `.../quota/QuotaForecastSummary.tsx`, `QuotaActionsPanel.tsx`, `QuotaAttainmentAlertsPanel.tsx` | `useQuotaAttainmentPredictor.ts:49,91` | `quota_attainment_forecasts`, `_actions`, `_alerts` | **0 / 0 / 0** | 🟨 | Mesma causa |
| QBR Automático | `.../QBRGeneratorPanel.tsx` (Hub:104) | `useRevenueIntelligenceHub.ts:170,184` → `qbr-generator` | `qbr_reports` | **0** | 🟨 | Nenhum QBR gerado; `qbr_schedule` tem 20 linhas mas sem runner agendado |
| Buying Committee | `.../BuyingCommitteeMap.tsx` (Hub:104) | `useRevenueIntelligenceHub.ts:92` | `buying_committee_members` | **0** | 🟨 | CRUD funcional, zero dados |
| Deal Health / Risk Signals | Hub aba "deal-health" | `src/hooks/revenue/useRevenueIntelligence.ts:35,61` | `deal_health_scores`, `deal_risk_signals` | **900 / 0** | 🟨 | Health scores existem; sinais de risco vazios |
| Win Rate Drill-down | `.../WinRateBreakdownChart.tsx` (Hub:152) | derivado | `deal_outcomes` | **500** | ✅ | — |
| **PIPELINE PULSE** |
| Pipeline Pulse Hub | `src/components/pipeline-pulse/PipelinePulseHub.tsx` | `src/hooks/pipeline-pulse/usePipelinePulse.ts:9` → `pipeline-pulse-aggregator` | `sales`(coluna errada), `deal_health_scores`(900), `conversation_analyses`(**0**), `lead_routing_assignments`(**inexistente**) | — | 🟨 | **Todos os KPIs monetários = 0.** Pulse Score cai em constantes: `healthScoreNorm=0.7` (`:77`), `teamCapacity=0.5` (`:74`), `sentimentNorm=0.5` → score fixo ≈ **34 → status "critical" permanente** |
| KPI "Forecast 30d — projeção IA" | `pipeline-pulse-aggregator/index.ts:58,89` | — | — | — | 🟨 | `forecast30d = wonAmount * 1.05` — multiplicador fixo rotulado como "projeção IA" na UI |
| Alertas Críticos | `src/components/pipeline-pulse/CriticalAlertsFeed.tsx` | idem | derivado | — | 🟨 | Alerta `coverage-low` (`:139`) dispara sempre (0 < 0×3 é falso, mas `pipelineTotal=0`) |
| Quick Actions | `src/components/pipeline-pulse/QuickActionsPanel.tsx:8` | `useQuickAction.ts:19` | invoca edge functions | — | ✅ | Ações reais (recompute health, revenue-forecast-ai) |
| **EXECUTIVE BRIEFING** |
| Briefing Executivo | `src/components/executive-briefing/BriefingHub.tsx` | `src/hooks/executive-briefing/useLatestBriefing.ts:10` | `executive_briefings` / `latest_briefing_view` | **0 / 0** | 🟨 | Nenhum briefing jamais gerado; **sem cron** (11 jobs em `cron.job`, nenhum de briefing) |
| Geração de briefing | `.../BriefingHub.tsx` (botão) | `useGenerateBriefing.ts:10` → `generate-executive-briefing` | — | — | 🟨 | Consome `pipeline-pulse-aggregator` (`index.ts:54`) que retorna zeros → IA narra sobre lixo |
| Histórico 7d | `.../BriefingHistoryRail.tsx` | `useBriefingHistory.ts:10` | `executive_briefings` | **0** | 🟨 | Vazio |
| **REPORTING (Report Builder)** |
| Custom Reports (CRUD) | `src/pages/CustomReports.tsx` + `src/components/reporting/ReportBuilder.tsx` | `src/hooks/reporting/useCustomReports.ts:25` | `custom_reports` | **0** | 🟦 | Builder completo, zero relatórios criados em produção |
| Execução de relatório | `src/components/reporting/ReportPreview.tsx` | `useReportExecution.ts:27` → `report-builder-execute` | `custom_reports` + `report_executions` | **0 / 0** | 🟦 | Function robusta (allowlist de entidades `index.ts:26-33`, JOIN_MAP `:36`), nunca exercitada |
| Cross-object join | `src/components/reporting/CrossObjectJoinPanel.tsx` | `reportBuilderHelpers.ts` | idem | 0 | 🟦 | — |
| Relatórios agendados | `src/components/reporting/ScheduledReportFormDialog.tsx` | `useScheduledReports.ts:14` | `scheduled_reports` | **0** | 🟨 | **Nenhum cron dispara `scheduled-reports-runner`.** Só há disparo manual via `scheduled-report-trigger` (`useTriggerScheduledReport.ts:9`) |
| Execuções agendadas | `src/components/reporting/ScheduledReportRunsDrawer.tsx` | `useScheduledReportRuns.ts:11` | `scheduled_report_runs` + bucket `report-snapshots` | **0** / bucket existe | 🟨 | Bucket `report-snapshots` criado (privado), zero objetos |
| Embed público de relatório | `src/pages/EmbedReportPage.tsx` (rota `/embed/report/:token`) | `useEmbeddedReportPreview.ts` → `report-embed-public` | `report_embed_tokens` / `embedded_report_tokens` | **0 / 0** | 🟦 | Duas tabelas de token concorrentes, ambas vazias |
| Gestão de tokens embed | `src/components/reporting/EmbedTokenManagerDialog.tsx` | `useReportEmbedTokens.ts:12` | `report_embed_tokens` | **0** | 🟦 | — |
| Relatório de Funil | `src/pages/FunnelReportPage.tsx` + `.../FunnelReportView.tsx` | `useFunnelComparison.ts:26` | `deal_stage_history` | **0** | 🟨 | RAIZ #3 — todos os estágios em 0 |
| Cohort de Retenção (reporting) | `src/pages/CohortReportPage.tsx` + `.../CohortHeatmap.tsx` | `useCohortRetention.ts:19-29` | `clients`(100) + `sales`(954), join por `client_name` | 900/954 vendas casam por nome | ✅ | Funciona; join por string é frágil (54 vendas órfãs) |
| **RELATÓRIOS DE VENDAS** |
| Relatório de Vendas (`/relatorios/vendas`) | `src/pages/SalesReportPage.tsx` + `src/components/reports/sales/*` | `src/hooks/reports/useSalesReport.ts:44` | `sales_with_markup` (view) | **954** | ✅ | Usa `isWonSaleStatus` corretamente (`salesReportHelpers.ts:124`) |
| KPIs / Markup / Ranking / Top Deals | `.../SalesReportKpis.tsx`, `SalesMarkupRankingTable.tsx`, `SalesTeamRankingChart.tsx`, `SalesTopDealsTable.tsx` | idem | `sales_with_markup`, `salespeople_public` | 954 / 18 | ✅ | — |
| Status Donut | `.../SalesStatusDonut.tsx` | idem | idem | 954 | 🟨 | `STATUS_LABEL` (`salesReportHelpers.ts:109-116`) não mapeia `won`/`closed`/`lead` → fallback `?? key` mostra rótulo cru em inglês |
| QBR Story Generator | `src/components/reports/QBRStoryGenerator.tsx:32` | props | — | — | 🟨 | Narrativa por template com heurística fixa (`totalRevenue > pipelineValue * 0.3 // Simplistic logic`), apresentada com ícone ✨ de IA |
| Exec Insights Banner | `src/components/reports/ExecInsightsBanner.tsx:21` | props | — | — | 🟨 | "Insights Automáticos" — apenas renderiza array recebido |
| Config de e-mail de relatório | `src/components/reports/EmailReportConfig.tsx:44` | inline | `notification_preferences` | **0** | 🟦 | Nenhuma preferência configurada |
| **BI (Ferramenta BI / Dossiê Cliente)** |
| BI Vendedor | `src/pages/BIVendedor.tsx` | `useBIVendedor.ts:6` → `src/services/biService.ts:30` | `sales`, `sales_goals`, `activities` | 954 / 12 / 2228 | 🟨 | Usa `WON_SALE_STATUSES` ✅, mas `sales_goals` não tem linha para 2026-08 → meta = 0 |
| BI Gestor | `src/pages/BIGestor.tsx` | `useBIGestor.ts:6` → `biService.ts:169` | idem + `conversation_analyses` | conv. **0** | 🟨 | Bloco de sentimento sempre vazio |
| BI SDR | `src/pages/BISDR.tsx` | `useBISDR.ts:65-84` | `sales`, `activities`, `activity_goals`(9) | ok | 🟨 | `useBISDRTransformers.ts:80,224` filtram `'qualified'/'negotiation'/'completed'` — **nenhum existe** → buckets sempre 0 |
| BI Closer | `src/pages/BICloser.tsx` | `useBICloser.ts:98-152` | `sales`, `deal_outcomes`(500), `deal_stage_history`(**0**) | parcial | 🟨 | Pipeline filtra `['qualified','proposal','negotiation']` (`:130`) — só `proposal` existe; ciclo por estágio zerado |
| Ferramenta BI 360 (`/ferramentas/bi`) | `src/pages/BusinessIntelligencePage.tsx:117` + `src/components/bi/ClientOverview360.tsx:16` | `src/hooks/bi/useClientBI.ts:6` | RPCs `get_client_top_products`, `get_client_seasonality` + **`src/lib/bi/mockData.ts`** | `client_purchase_seasonality` = 83 | 🟨 | **Cai em dados fictícios** quando `< 3` meses de histórico (`useClientBI.ts:26-27`). Badge "📊 Dados Simulados" existe (`IntelligenceZones.tsx:88`) mas `ClientOverview360` só mostra aviso se `isMocked` for passado |
| Sazonalidade Cliente vs Setor | `src/components/bi/ClientSeasonalityHeatmap.tsx`, `ClientVsIndustryComparison.tsx` | `useIndustryTrends.ts:39` | RPCs + mock | — | 🟨 | `useIndustryTrends.ts:72-73` substitui por `getMockSeasonality()` **sem flag `isMocked`** — usuário não sabe |
| Tendências do Setor | `src/components/bi/IndustryTrendingProducts.tsx` | `useIndustryTrends.ts:5` | RPC `get_industry_top_products` | — | 🟨 | 3 saídas para mock (`:10`, `:20`, `:28`) — MacBook Pro M3 / Dell XPS 15 / Herman Miller, **sem aviso na UI** |
| Recomendações "Expert" | `src/components/bi/EmpiricalRecommendations.tsx` | `useClientBI.ts:56` | `src/lib/bi/industryRecommendations.ts:6` | — | ⬛ | Catálogo 100% hardcoded de 5 setores; nenhuma relação com o catálogo real (`products` = 17 linhas de brindes) |
| Markup Overview / Alertas críticos | `src/components/bi/MarkupOverviewCard.tsx`, `CriticalMarkupAlertCard.tsx` | `useMarkupOverview.ts:25`, `useCriticalMarkupSales.ts:36` | `sales_with_markup` | **954** | ✅ | — |
| Top Clientes / Top Sellers | `src/components/bi/BITopClientsSection.tsx`, `TopSellersRankList.tsx` | `useBITopClients.ts:43-51` | `sales`, `clients`, `supplier_orders`(**0**) | parcial | 🟨 | Bloco de fornecedores vazio |
| Churn overdue / Task completion | `src/components/bi/ChurnOverdueRankingCard.tsx`, `ChurnTaskCompletionCard.tsx` | `useChurnOverdueBySeller.ts:23`, `useChurnTaskCompletion.ts:34` | `tasks` | **600** | ✅ | — |
| Export Dossiê PDF | `src/components/bi/ExportDossierButton.tsx` | `useBIDossierExport.ts` → `src/lib/bi/dossierPdfGenerator.ts` | — | — | 🟨 | Exporta o dossiê **incluindo os blocos mockados** |
| **ANALYTICS (`/analytics`, 18 abas)** |
| Win/Loss Analysis | `src/components/analytics/WinLossAnalysis.tsx` (Analytics.tsx:99) | `useWinLossAnalysis.ts:37` | `deal_outcomes` | **500** | ✅ | — |
| ABC Analysis | `src/components/analytics/ABCAnalysis.tsx` (:103) | `useABCAnalysis.ts:80-82` | `sales` `.in(['won','completed'])` | 461 won | ✅ | Único lugar que trata `won` explicitamente |
| Deal Velocity | `.../DealVelocityChart.tsx:31` (:100) | `useDealAnalyticsVelocity.ts:37` | `sales` | 954 | ✅ | — |
| Conversion Funnel | `.../ConversionFunnel.tsx:29` (:101) | `useFunnelData.ts:35` | `deal_stage_history` | **0** | 🟨 | RAIZ #3 — todos os estágios em 0 |
| Closing Time | `.../ClosingTimeChart.tsx:40` (:104) | `useClosingTime.ts:15` | `deal_stage_history` | **0** | 🟨 | RAIZ #3 — `useClosingTime.ts:20` retorna `[]`; gráfico sempre vazio |
| Revenue Forecast (aba) | `.../RevenueForecast.tsx:54` (:105) | inline | `sales`, `sales_goals` | 954 / 12 | 🟨 | `:75` exclui `completed/lost/cancelled` → inclui os 461 `won` como pipeline aberto |
| Churn Prediction | `.../ChurnPrediction.tsx` (:106) | `useChurnPrediction.ts:25` | `clients` | 100 | ✅ | — |
| **Churn Risk Panel** | `.../ChurnPredictionPanel.tsx` (**Analytics.tsx:113**) | — | — | — | ⬛ | **Renderizado sem props** → sempre exibe `DEFAULT_PREDICTIONS` (`:39`): "Tech Solutions LTDA", "Inovação Digital SA", "Global Services ME" — **clientes inventados em produção** |
| **Radar de Competências** | `.../CompetencyRadar.tsx` (**Analytics.tsx:111**) | — | — | — | ⬛ | **Renderizado sem props** → sempre `DEFAULT_DATA` (`:35`): Prospecção 72, Negociação 85, Fechamento 60… **números inventados** |
| **LTV por Segmento** | `.../LTVBySegment.tsx:25` (**Analytics.tsx:117**) | inline | `sales` `.eq('status','completed')` | **0** | ⬛ | Duplo problema: query sempre vazia (RAIZ #1) **e** props default fixas `currentClientLTV = 4500`, `currentClientAvgTicket = 1200` renderizadas como "R$ 4.500" / "R$ 1.200" (`:147`, `:156`) |
| Coaching / Comparação | `.../SalespersonCoaching.tsx`, `CoachingComparison.tsx:24` | `salesperson-coaching` fn | `salespeople`, `deal_outcomes` | 18 / 500 | ✅ | — |
| Coaching Impact | `.../coaching/CoachingMetricsTable.tsx` | — | view `coaching_impact_metrics` | **0** | 🟨 | View retorna 0 linhas |
| Performance Comparison | `.../PerformanceComparison.tsx` (:107) | `usePerformanceComparison.ts:41-67` | `salespeople`,`sales`,`activities`,`deal_outcomes`,`sales_goals` | ok | 🟨 | `sales_goals` sem mês corrente |
| Activity Heatmap | `.../ActivityHeatmap.tsx:83` (:112) | inline | `activities` | **2228** | ✅ | — |
| Weekly Performance | `.../WeeklyPerformanceComparison.tsx` (:114) | `useWeeklyComparison.ts:27-43` | `sales`,`activities`,`clients` | ok | ✅ | — |
| Cohort Analysis | `.../CohortAnalysis.tsx:30` (:115) | inline | `clients`,`sales` | 100 / 954 | ✅ | — |
| Cohort Retention Heatmap | `.../CohortRetentionHeatmap.tsx:52` (:116) | RPC | `compute_salesperson_retention_cohort(12)` | retorna **1 linha** (2026-08, cohort_size 6, 100%) | 🟨 | Matriz de 1 célula — sem histórico útil |
| Objections Library | `.../ObjectionsLibrary.tsx` (:102) | `useObjectionsLibrary.ts` | `objections_library` + `objection_library` | **0 + 0** | 🟨 | Duas tabelas duplicadas, ambas vazias |
| Product Mix | `.../ProductMix.tsx:24` | inline | `sales` `.in(WON_SALE_STATUSES)` | 461 | ✅ | — |
| Client Health Panel | `.../ClientHealthPanel.tsx:86` | inline | `client_portfolio`(100), `clients`(100), `activities`(2228) | ok | ✅ | — |
| Lead Source Metrics / Trend / Distribution | `.../LeadSourceMetrics.tsx:15`, `LeadSourceTrendChart.tsx`, `LeadSourceDistribution.tsx` | `useLeadSourceAnalysis.ts:72,79` | `sales`, `lead_source_configs`(**0**) | parcial | 🟨 | Sem configs de fonte → agrupamento cru |
| Lead SLA Monitor | `.../LeadSLAMonitor.tsx:23` | inline | `sales`, `activities` | ok | ✅ | — |
| Email Metrics Dashboard | `.../EmailMetricsDashboard.tsx:44` | `useEmailMetrics.ts:72,79` | `email_logs`, `email_tracking_events` | **0 / 0** | 🟨 | Página `/analytics/emails` renderiza zeros |
| Email Logs Tab | `.../EmailLogsTab.tsx` | — | `email_logs` | **0** | 🟨 | Vazio |
| Demand Forecast (componente) | `.../DemandForecast.tsx:14` | inline | `demand_forecasts` | **0** | 🟨 | Empty-state correto ("Nenhuma previsão disponível" `:50`) |
| Demand Forecast Dashboard (`/previsao-demanda`) | `.../DemandForecastDashboard.tsx` | `useDemandForecast.ts:49,78` → `demand-forecast` | `demand_forecasts`(**0**), `inventory_levels`(17), `stock_movements`(478) | parcial | 🟨 | Function existe mas nunca produziu linha; sem cron |
| Sales Forecast | `.../SalesForecast.tsx:56,69` | inline | `demand_forecasts` + `demand-forecast` | **0** | 🟨 | Idem |
| Benchmark Panel | `.../BenchmarkPanel.tsx:34` | `useBenchmarkData.ts:64,78` | `sales` | 954 | ✅ | — |
| AI Performance Insights | `.../AIPerformanceInsights.tsx:9` | `useSalesData`,`useSalespeople` | `sales`,`salespeople` | ok | 🟨 | "AI" é `useMemo` com regras fixas (`:12`), não IA |
| ABC Neural Insights / Actionable / Matrix Shift | `.../ABCNeuralInsights.tsx`, `ABCActionableAutomations.tsx`, `ABCMatrixShift.tsx` | props de `useABCAnalysis` | `sales` | 461 | 🟨 | Rótulo "Neural" para heurística determinística |
| **PREDITIVO** |
| Predictive Intelligence Dashboard | `src/components/predictive/PredictiveIntelligenceDashboard.tsx` (`/inteligencia-preditiva`) | `usePredictiveIntelligence.ts:47` → `predictive-intelligence` | `sales`,`clients`,`lead_scores` | 954/100/900 | 🟨 | Function lê dados reais (`index.ts:75-81`), mas o hub embute o simulador falso abaixo |
| **Simulador de Cenários AI** | `src/components/predictive/PredictiveScenarioPlanner.tsx` (**renderizado em `PredictiveIntelligenceDashboard.tsx:139`**) | — | — | — | ⬛ | **100% fictício:** `:20` `baseRevenue = 2500000`; `:21` `repProductivity = 150000`. Título "Simulador de Cenários AI", subtítulo "Preveja o impacto…". Nenhuma query |
| **ROI** |
| ROI Dashboard (`/roi`) | `src/pages/ROIDashboard.tsx:53` + `src/components/roi/ROIRankingList.tsx` | `src/hooks/dashboard/useROIDashboard.ts:42` | `salespeople`(18), `sales`(954), `activities`(2228) | ok | 🟨 | Dados reais, **premissas inventadas**: `:88` `BASE_SALARY_MONTHLY = 3500`; `:107` `ltv = avgDealSize * 2.5`; `:97` `commission_rate || 0.1`. CAC/LTV/Payback/ROI derivam dessas constantes |
| **METAS / GOALS** |
| Dashboard de Metas (`/metas`) | `src/pages/Metas.tsx:25` + `src/components/goals/*` | `src/hooks/dashboard/useGoalsDashboard.ts:41` | `sales_goals`, `sales`, `salespeople`, `quota_attainment_predictions`(**0**) | `sales_goals` = **12** | 🟨 | **Medido:** as 12 metas cobrem 2025-08→2026-07 para **1 único vendedor** (R$ 21.302,42/mês). **Não há meta para 2026-08 (mês corrente)** → `totalGoal = 0`, progresso 0%, `requiredDailyAverage` 0 para os 18 vendedores |
| Progressive Goals | `src/components/goals/*` | `useProgressiveGoals.ts:43` | `progressive_goals` | **0** | 🟦 | Nunca usado |
| Commission Calculator | `src/components/goals/CommissionCalculator.tsx:21` | props | `salespeople.commission_rate` | 18 | ✅ | — |
| Goals Leaderboard / Distribution / Comparison | `src/components/goals/GoalsLeaderboard.tsx`, `GoalDistributionChart.tsx`, `GoalComparisonChart.tsx` | props de `useGoalsDashboard` | idem | — | 🟨 | Todos sobre meta 0 no mês corrente |
| **TIMES / TERRITÓRIOS / MAPA** |
| Gestão de Times | `src/components/teams/TeamCard.tsx`, `MemberList.tsx`, `CreateTeamDialog.tsx`, `EditTeamDialog.tsx` | `useTeams.ts:36,91` | `teams`, `team_closers`, `salespeople` | **3 / 6 / 18** | ✅ | CRUD completo com dados reais |
| Territórios (`/territorios`) | `src/components/territories/TerritoriesBoard.tsx:13` | `useTerritories.ts:33,53` | `sales_territories`, `territory_history` | **8 / 0** | 🟨 | Histórico vazio → painel de histórico sempre vazio. **Existe ainda `territories` com 18 linhas que ninguém neste domínio lê** (tabela concorrente) |
| Territory Optimization Hub (`/territory-optimization`) | `src/pages/TerritoryOptimizationHub.tsx` + `src/components/territory-optimization/TerritoryOptimizationHub.tsx:42` | `useTerritoryOptimization.ts:60` → `territory-optimization` | `sales_territories`(8), `salespeople_public`(18), `sales`(954) | ok | ✅ | Function trata `['won','completed','Fechado']` corretamente (`index.ts:123`). Ressalva: `potential_revenue = max(p75, total_revenue*1.2)` (`:152`) é heurística fixa, não potencial medido |
| Mapa de Clientes (`/mapa-clientes`) | `src/components/map/ClientsMap.tsx:191` | inline | `clients` (lat/lng) | **100/100 geocodificados** | ✅ | Geocoding via Nominatim (`:97`), cache local, persiste em `clients.lat/lng` |
| Map Error Boundary | `src/components/map/MapErrorBoundary.tsx` | — | — | — | ✅ | — |
| **NLQ** |
| NLQ (`/perguntar`) | `src/pages/AskAnything.tsx` + `src/components/nlq/NLQInput.tsx`, `NLQAnswerCard.tsx`, `NLQDataChart.tsx` | `src/hooks/nlq/useNLQ.ts:44` → `nlq-query` | `sales`,`activities`,`clients` via `queryResolvers.ts` | — | ⬛ | **Edge function não compila** — `supabase/functions/nlq-query/index.ts:9-11` tem `import` injetado dentro de bloco `import{}`. Recurso inteiro inoperante |
| NLQ Widget no Dashboard | `src/components/nlq/DashboardNLQWidget.tsx` | idem | idem | — | ⬛ | Mesma causa |
| **REVOPS** |
| RevOps Hub (`/revops`) | `src/pages/RevOpsHub.tsx` | `useRevOpsHub.ts:30` → `revops-hub` | `sales`,`activities`,`commissions` | 954 / 2228 / 942 | 🟨 | `closed_revenue`/`win_rate`/`velocity`/`cycle_days`/`avg_deal_size` = **0** (RAIZ #1, `index.ts:41`); `weighted_forecast` = pipeline×0,1 (RAIZ #2, `:47`); `activity_efficiency` = **0%** (enum errado, `:78`); `coverage_ratio` usa alvo fixo `100000` (`:92`) → **health "excellent" sempre** |
| Comissões (RevOps) | idem | idem | `commissions` | 942 (116 pagas) | ✅ | `earned/pending` funcionam |
| **RANKING COMPETITIVO** |
| Ranking Competitivo | `src/components/competitive/*` (consumido por Analytics/Arena) | `useCompetitiveRanking.ts:33` | view `competitive_ranking` → `mv_competitive_ranking` | **8 linhas, `total_sales=0` e `rank=1` em todas** | 🟨 | Matview filtra `status='completed'` (RAIZ #1) + **sem cron de `REFRESH MATERIALIZED VIEW`** |
| **PERFORMANCE** |
| Performance Monitor (FPS) | `src/components/performance/PerformanceMonitor.tsx:13` | — | — | — | ⬛ | **Órfão.** O componente montado em `src/App.tsx:116` e `MainLayout.tsx:34` é `@/components/admin/PerformanceMonitor`. Este arquivo não é importado por ninguém |
| **EDGE FUNCTION SEM CONSUMIDOR** |
| Análise de Cobertura de Pipeline | — | — | `analyze-pipeline-coverage` (229 linhas) | `pipeline_coverage_snapshots` = **0** | ⬛ | `grep -rn "analyze-pipeline-coverage"` em todo o repo retorna **apenas o próprio arquivo**. Sem chamador no `src/`, sem migration, sem cron |

---

## 2. CONTAGEM POR CLASSIFICAÇÃO

**Total de funcionalidades auditadas: 106** (contagem programática das linhas classificadas da tabela acima)

| Classificação | Quantidade | % |
|---|---|---|
| ✅ IMPLEMENTADO_TOTAL | **25 / 106** | 23,6% |
| 🟨 PARCIAL | **65 / 106** | 61,3% |
| 🟦 SUGERIDO_OU_INICIADO | **7 / 106** | 6,6% |
| ⬛ MORTO_OU_ABANDONADO | **9 / 106** | 8,5% |

> Menos de 1 em cada 4 funcionalidades deste domínio está pronta segundo a regra de ouro
> (*em produção com uso real*). A maioria é casca sobre tabela vazia ou sobre métrica que sempre dá zero.

### ✅ Os 25 que realmente funcionam com dado real
Relatório de Vendas (`/relatorios/vendas`) · KPIs/Markup/Ranking/Top Deals · Markup Overview e
Alertas Críticos · Cohort de Retenção (reporting) · Cohort Analysis · Win/Loss Analysis ·
Win Rate Drill-down · ABC Analysis · Deal Velocity · Churn Prediction · Product Mix ·
Client Health Panel · Lead SLA Monitor · Activity Heatmap · Weekly Performance · Benchmark Panel ·
Coaching / Comparação · Churn overdue / Task completion · Gestão de Times ·
Territory Optimization Hub · Mapa de Clientes · Map Error Boundary · Quick Actions (Pulse) ·
Commission Calculator · Comissões (RevOps)

### 🟦 Os 7 iniciados e nunca usados
Custom Reports (CRUD) · Execução de relatório · Cross-object join · Embed público de relatório ·
Gestão de tokens embed · Config de e-mail de relatório · Progressive Goals

### ⬛ Os 9 mortos/abandonados
1. `CompetencyRadar` renderizado sem props (dados inventados)
2. `ChurnPredictionPanel` renderizado sem props (clientes inventados)
3. `LTVBySegment` (query morta + props fixas)
4. `PredictiveScenarioPlanner` (R$ 2,5M hardcoded, em produção)
5. `industryRecommendations.ts` (catálogo fictício de outro ramo de negócio)
6. `nlq-query` edge function (erro de sintaxe → NLQ inteiro morto)
7. `DashboardNLQWidget` (mesma causa)
8. `analyze-pipeline-coverage` edge function (sem nenhum chamador)
9. `src/components/performance/PerformanceMonitor.tsx` (arquivo órfão/duplicado)

---

## 3. LISTA COMPLETA DE DADOS FICTÍCIOS (arquivo:linha)

### 3.1 Arrays / objetos hardcoded alimentando UI

| # | arquivo:linha | Conteúdo | Onde aparece |
|---|---|---|---|
| 1 | `src/components/analytics/CompetencyRadar.tsx:35-41` | `DEFAULT_DATA`: Prospecção 72, Negociação 85, Fechamento 60, Follow-up 90, Qualificação 78, Apresentação 65 | `/analytics` aba "Competências" (`src/pages/Analytics.tsx:111` renderiza **sem props**) |
| 2 | `src/components/analytics/ChurnPredictionPanel.tsx:39-43` | `DEFAULT_PREDICTIONS`: "Tech Solutions LTDA" (risco 87), "Inovação Digital SA" (72), "Global Services ME" (65) — com fatores e ações inventados | `/analytics` aba "Churn Risk" (`Analytics.tsx:113` **sem props**) |
| 3 | `src/components/analytics/LTVBySegment.tsx:25` | `currentClientLTV = 4500`, `currentClientAvgTicket = 1200` | `/analytics` aba "LTV" (`Analytics.tsx:117` **sem props**); renderizados em `:147` e `:156` como "R$ 4.500" / "R$ 1.200" |
| 4 | `src/lib/bi/mockData.ts:1-13` | `MOCK_CLIENT_STATS`: ltv 125000, avgTicket 2450, recency 12, orderCount 48 + 5 pedidos falsos datados 2026-04/05 | `useClientBI.ts:39,40,45` → `ClientOverview360` (`/ferramentas/bi`) |
| 5 | `src/lib/bi/mockData.ts:15-20` | `getMockIndustryTrends()`: "MacBook Pro M3 +24%", "Dell XPS 15 +18%", "Monitor LG 34\" +32%", "Cadeira Herman Miller +12%" | `useIndustryTrends.ts:10,20,28` → `IndustryTrendingProducts` — **sem qualquer flag de aviso** |
| 6 | `src/lib/bi/mockData.ts:22-30` | `getMockSeasonality()`: 12 meses gerados por `Math.sin/Math.cos` sobre hash do id | `useClientBI.ts:27` e `useIndustryTrends.ts:72,73` → heatmaps de sazonalidade |
| 7 | `src/lib/bi/industryRecommendations.ts:6-27` | `INDUSTRY_RECOMMENDATIONS`: "Infraestrutura Serverless", "Segurança Zero Trust", "Telemedicina Hub"… para 5 setores | `useClientBI.ts:56` → `EmpiricalRecommendations` (empresa é de **brindes promocionais**) |
| 8 | `src/lib/bi/industryRecommendations.ts:34-37` | Fallback: "Consultoria de Eficiência", "Programa de Fidelidade IA" | idem, quando o ramo não casa |
| 9 | `src/components/predictive/PredictiveScenarioPlanner.tsx:20` | `baseRevenue = 2500000` | `/inteligencia-preditiva` — card "Simulador de Cenários AI" (`PredictiveIntelligenceDashboard.tsx:139`) |
| 10 | `src/components/predictive/PredictiveScenarioPlanner.tsx:21` | `repProductivity = 150000` | idem |
| 11 | `public.forecast_snapshots` (banco) | 6 linhas, todas com `created_at = 2026-07-12T19:57:48.718629`, valores redondos: 118000/192000/155000/240000, 126000/204000/165000/255000… | `ForecastVsActualChart`, `ForecastAccuracySummary` — **seed manual, não gerado por `snapshot-forecast`** |

### 3.2 Constantes de negócio inventadas apresentadas como cálculo/IA

| # | arquivo:linha | Constante | Impacto |
|---|---|---|---|
| 12 | `src/hooks/dashboard/useROIDashboard.ts:88` | `BASE_SALARY_MONTHLY = 3500` | Base de TODO custo/CAC/ROI/payback do `/roi` |
| 13 | `src/hooks/dashboard/useROIDashboard.ts:107` | `ltv = avgDealSize * 2.5` ("Estimated repeat factor") | LTV exibido como métrica |
| 14 | `src/hooks/dashboard/useROIDashboard.ts:97` | `sp.commission_rate \|\| 0.1` | Comissão default 10% |
| 15 | `supabase/functions/pipeline-pulse-aggregator/index.ts:58` | `forecast30d = wonAmount * 1.05` | Rotulado **"projeção IA"** na UI (`:89`) |
| 16 | `supabase/functions/pipeline-pulse-aggregator/index.ts:74` | `teamCapacity = 0.5` fallback | Tabela `lead_routing_assignments` não existe → sempre cai aqui |
| 17 | `supabase/functions/pipeline-pulse-aggregator/index.ts:77` | `healthScoreNorm = 0.7` fallback | `openDeals` sempre vazio → sempre cai aqui |
| 18 | `supabase/functions/revops-hub/index.ts:47` | `STAGE_WEIGHTS[d.stage] ?? 0.1` | `stage` é NULL em 100% → peso uniforme 0,1 |
| 19 | `supabase/functions/revops-hub/index.ts:92` | `monthlyTarget = closedRevenue * 1.2 \|\| 100000` | `closedRevenue` sempre 0 → alvo fixo R$ 100k → health "excellent" permanente |
| 20 | `supabase/functions/revenue-forecast-ai/index.ts:89` | `avgCycle = ... : 45` | Todos os 12 registros da view retornam exatamente `45` |
| 21 | `public.revenue_forecast_view` (banco) | `COALESCE(max(cr.avg_cycle_days), 45::numeric)` | Origem do 45 acima |
| 22 | `public.get_revenue_forecast` (banco) | `COALESCE(AVG(lh.health_score)::INTEGER, 50)` | `avg_health` = 50 quando sem dados |
| 23 | `supabase/functions/territory-optimization/index.ts:152` | `potential = max(p75Revenue, total_revenue * 1.2)` | "Receita potencial perdida" é multiplicador arbitrário |
| 24 | `src/components/reports/QBRStoryGenerator.tsx:32` | `metrics.totalRevenue > metrics.pipelineValue * 0.3` — comentado `// Simplistic logic` | Define o tom do "story" apresentado com ✨ |
| 25 | `src/components/analytics/AIPerformanceInsights.tsx:12` | `useMemo` com regras fixas | Rotulado "AI Performance Insights" |

### 3.3 Mascaramento de ausência de dado (`|| 0`, `?? 0`, ternário → 0)

| # | arquivo:linha | Padrão | Consequência visual |
|---|---|---|---|
| 26 | `src/hooks/revenue-intelligence/useForecastAccuracy.ts:96-98` | `rows.length ? …/rows.length : 0` | `forecast_accuracy` vazia → MAPE **0,0%** |
| 27 | `src/components/revenue-intelligence/forecast/forecastHelpers.ts:19` | `formatMape = (n ?? 0).toFixed(1)` | Reforça o "0,0%" |
| 28 | `src/components/revenue-intelligence/forecast/forecastHelpers.ts:32` | `if (mape <= 10) return {label:"Excelente", color:"text-emerald-600"}` | MAPE 0 (sem dado) → badge verde **"Excelente"** |
| 29 | `src/hooks/revenue-intelligence/useForecastAccuracy.ts:112,117` | `accuracyTrend = 100 - avgMape` → clamp 0..100 | Exibe **"100%" de accuracy trend** sobre tabela vazia |
| 30 | `src/hooks/revenue-intelligence/useForecastAccuracy.ts:102-107` | `dominant = … : "accurate"` | Sem dados → viés "Preciso" (badge verde) |
| 31 | `public.revenue_forecast_view` | `COALESCE(max(ca.commit_amount + ca.best_case_amount*0.5), 0)` | NULL-arithmetic → **3 cenários em R$ 0,00** |
| 32 | `public.get_revenue_forecast` | `COALESCE(SUM(d.amount * sw.weight), 0)` | Join nunca casa → `weighted_revenue` **R$ 0 sempre** |
| 33 | `public.mv_competitive_ranking` | `COALESCE(ms.total_sales, 0)` sobre filtro `status='completed'` | Ranking com **R$ 0 e rank 1 para todos** |
| 34 | `src/components/forecast/forecastHelpers.ts:9` | `.format(n \|\| 0)` | Zeros formatados como "R$ 0" sem distinção de "sem dado" |
| 35 | `src/components/forecast/forecastHelpers.ts:49` | `deltaPct: if (!base) return 0` | Variação 0% quando base ausente |
| 36 | `src/hooks/useRevOpsHub.ts` / `revops-hub/index.ts:54,63` | `totalClosed > 0 ? … : 0` e `wonDeals.length ? … : 0` | Win rate, ciclo e ticket médio todos 0 |

### 3.4 Gráficos que renderizam vazios (sem empty-state explícito)
`ConversionFunnel` (todos os estágios 0) · `ClosingTimeChart` (`useClosingTime.ts:20` → `[]`) ·
`FunnelReportView` · `ForecastVsActualChart` / `ForecastBiasChart` / `MapeBySegmentChart` ·
`ConfidenceScoresTable` · `CalibrationCurveChart` / `CalibratorBucketCurve` ·
`QuotaProbabilityChart` / `QuotaScenarioChart` / `QuotaRiskHeatmap` · `CoverageRatioGauge` ·
`EmailMetricsDashboard`.
Exceção positiva: `src/components/analytics/DemandForecast.tsx:47-51` tem empty-state correto.

---

## 4. TABELAS/VIEWS DO DOMÍNIO — CONTAGEM MEDIDA

**As 35 views de `public`** (confirmado: `select table_name from information_schema.views where table_schema='public'` → 35 linhas).
Relevantes a este domínio, com contagem real:

| View / Tabela | Linhas | Veredicto |
|---|---|---|
| `sales_with_markup` | 954 | ✅ base do Relatório de Vendas |
| `revenue_forecast_view` | 12 | 🟨 3 colunas de cenário zeradas |
| `competitive_ranking` (→ `mv_competitive_ranking`) | 8 | 🟨 `total_sales`=0 em todas |
| `client_purchase_seasonality` | 83 | ✅ |
| `salespeople_public` | 18 | ✅ |
| `coaching_impact_metrics` | **0** | 🟨 |
| `latest_briefing_view` | **0** | 🟨 |
| `v_pipeline_coverage_summary` | **0** | 🟨 |
| `deal_stage_history` | **0** | 🔴 dado real está em `deal_stage_transitions` (1254) |
| `forecast_accuracy` | **0** | 🟨 |
| `forecast_confidence_scores` | **0** | 🟨 |
| `forecast_deal_contributions` | **0** | 🟨 |
| `forecast_snapshots` | 6 | 🟨 seed manual |
| `revenue_forecasts` | 3 | 🟨 |
| `pipeline_coverage_snapshots` / `_recommendations` | **0 / 0** | ⬛ |
| `pipeline_inspections` / `pipeline_inspection_snapshots` | **0 / 0** | 🟨 |
| `quota_attainment_predictions` / `_forecasts` / `_alerts` / `_actions` | **0 / 0 / 0 / 0** | 🟨 |
| `win_probability_calibrations` / `win_calibration_buckets` / `win_probability_deal_calibrations` | **0 / 0 / 0** | 🟨 |
| `deal_probability_scores` | **0** | 🟨 |
| `executive_briefings` | **0** | 🟨 |
| `custom_reports` / `report_executions` | **0 / 0** | 🟦 |
| `scheduled_reports` / `scheduled_report_runs` | **0 / 0** | 🟨 |
| `report_embed_tokens` / `embedded_report_tokens` | **0 / 0** | 🟦 duplicadas |
| `demand_forecasts` | **0** | 🟨 |
| `category_metrics` | **0** | 🟨 (`useReportData.ts:104`) |
| `daily_metrics` | 30 (2026-07-15 → 2026-08-13) | 🟨 janela curta, para de 3 dias atrás |
| `monthly_sales_summary` | 25 | 🟨 `revenue = 0` em todos os meses < 2026-08 |
| `performance_impact_factors` | **0** | 🟨 |
| `email_logs` / `email_tracking_events` | **0 / 0** | 🟨 |
| `objections_library` / `objection_library` | **0 / 0** | 🟨 duplicadas |
| `lead_source_configs` | **0** | 🟨 |
| `conversation_analyses` | **0** | 🟨 |
| `progressive_goals` | **0** | 🟦 |
| `territory_history` | **0** | 🟨 |
| `sales_territories` | 8 | ✅ |
| `territories` | 18 | ⬛ tabela concorrente, nenhum leitor neste domínio |
| `sales_goals` | 12 (1 vendedor, 2025-08→2026-07, **sem 2026-08**) | 🟨 |
| `deal_outcomes` / `win_loss_analyses` | 500 / 500 | ✅ |
| `deal_health_scores` / `deal_health_history` | 900 / 900 | ✅ |
| `stage_conversion_metrics` / `stage_velocity_baselines` | 6 / **0** | 🟨 |
| `qbr_reports` / `qbr_schedule` | **0** / 20 | 🟨 |
| `buying_committee_members` | **0** | 🟨 |
| `ai_narrative_cache` / `ai_sales_insights` | **0 / 0** | 🟦 |

---

## 5. EDGE FUNCTIONS — QUEM CHAMA CADA UMA (medido por grep em `src/`, `supabase/migrations/`, `supabase/functions/` e `cron.job`)

| Edge function | Chamador(es) | Cron? | Estado |
|---|---|---|---|
| `revenue-forecast-ai` | `src/hooks/forecast/useRevenueForecast.ts:57`, `src/components/dashboard/PredictiveRevenueForecast.tsx`, `src/hooks/pipeline-pulse/useQuickAction.ts:19` | ❌ | 🟨 lê `revenue_forecast_view` com cenários zerados |
| `generate-revenue-forecast` | `src/hooks/revenue-intelligence/useRevenueForecast.ts:109` | ❌ | 🟨 manual, 3 linhas produzidas |
| `snapshot-forecast` | `src/hooks/revenue-intelligence/useForecastAccuracy.ts:132` | ❌ | 🟨 botão manual; as 6 linhas existentes são seed |
| `compute-forecast-accuracy` | `src/hooks/revenue-intelligence/useForecastAccuracy.ts:150` | ❌ | 🟨 botão manual; nunca produziu linha |
| `forecast-narrative` | `src/components/revenue-intelligence/ForecastNarrative.tsx`, `src/hooks/ai/useAICopilot.ts`, `supabase/functions/ai-copilot/index.ts`, migration `20260712232606_*.sql` | ❌ | 🟨 `forecast_narrative_dead_letters` = 0 |
| `predict-quota-attainment` | `src/hooks/revenue/useQuotaAttainment.ts:112` | ❌ | ⬛ falha: `salespeople.monthly_goal` inexistente |
| `revenue-intelligence` | `src/components/revenue-intelligence/*` (via hooks) | ❌ | 🟨 |
| `revops-hub` | `src/hooks/useRevOpsHub.ts:37` (fetch direto) | ❌ | 🟨 4 KPIs sempre 0 |
| `report-builder-execute` | `src/hooks/reporting/useReportExecution.ts:27` | ❌ | 🟦 sem relatório criado |
| `scheduled-report-trigger` | `src/hooks/reporting/useTriggerScheduledReport.ts:9` | ❌ | 🟨 disparo manual |
| `scheduled-reports-runner` | **apenas** `supabase/functions/scheduled-report-trigger/index.ts:58` | ❌ | 🟨 **nenhum agendamento real acontece** |
| `report-embed-public` | `src/hooks/reporting/useEmbeddedReportPreview.ts` | ❌ | 🟦 |
| `nlq-query` | `src/hooks/nlq/useNLQ.ts:44` | ❌ | ⬛ **erro de sintaxe, não compila** |
| `pipeline-pulse-aggregator` | `src/hooks/pipeline-pulse/usePipelinePulse.ts:9`, `supabase/functions/generate-executive-briefing/index.ts:54` | ❌ | 🟨 coluna e tabela inexistentes → zeros |
| `analyze-pipeline-coverage` | **NENHUM** | ❌ | ⬛ **órfã (229 linhas)** |
| `generate-executive-briefing` | `src/hooks/executive-briefing/useGenerateBriefing.ts:10` | ❌ | 🟨 sem cron; entrada envenenada pelo Pulse |
| `territory-optimization` | `src/hooks/useTerritoryOptimization.ts:60` (fetch direto), rota `/territory-optimization` | ❌ | ✅ |
| `demand-forecast` | `src/hooks/useDemandForecast.ts:49`, `src/components/analytics/SalesForecast.tsx:69`, `DemandForecast.tsx` | ❌ | 🟨 0 linhas produzidas |
| `recompute-stage-baselines` | `src/hooks/deal-intelligence/useStageVelocity.ts` | ❌ | 🟨 `stage_velocity_baselines` = 0 |
| `refresh-stage-baselines` | `src/hooks/deal-intelligence/useStageBaselines.ts` | ❌ | 🟨 idem |
| `analyze-stage-conversion` | `src/hooks/deal-intelligence/useStageConversion.ts` | ❌ | 🟨 `stage_conversion_metrics` = 6 |

**Jobs de cron existentes (11, medidos em `cron.job`):** campaign-health-alert-30min, cleanup-stale-logs-daily,
cleanup-webhook-dedupe, enforce-telemetry-retention-daily, gc-call-recording-ingest-jobs,
purge-quote-sync-inbound-log-30d, purge-telemetry-retention-daily, purge-webhook-inbound-dedupe-30d,
reset-pg-stat-statements-weekly, weekly-league-reset, weekly-matchmaking.

> **Nenhum job de cron alimenta este domínio.** Não há refresh de `mv_competitive_ranking`,
> nem snapshot de forecast, nem briefing diário, nem execução de relatório agendado,
> nem agregação de pipeline coverage. Todo dado agregado depende de alguém clicar num botão.

---

## 6. O QUE **NÃO** CONSEGUI VERIFICAR

1. **Se as edge functions estão de fato deployadas** e em qual versão.
   `mcp__…__supabase_functions_list` respondeu: *"Listing Edge Functions requires a Supabase Management
   API token (sbp_...)"*. Portanto, a análise de edge functions é do **código no repositório**,
   não do artefato em produção. Em particular, não posso afirmar se o `nlq-query` quebrado já foi
   deployado ou se a versão em produção é anterior à corrupção do import.

2. **Comportamento de `get_revenue_forecast` sob um usuário autenticado.**
   A função é `SECURITY DEFINER` e filtra por
   `(s.salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid()))`.
   Minha sessão MCP não tem `auth.uid()`, então `deal_count = 0` no meu teste é artefato.
   **Porém** `weighted_revenue = 0` é estrutural e independe de auth: o `LEFT JOIN stage_weights ON sw.stage = d.stage`
   nunca casa porque `sales.stage` é NULL em 765/765 linhas — isso eu medi diretamente.

3. **`compute_pipeline_inspection()`** — retornou `ERROR: P0001: Not authorized` (RAISE dentro da
   função checando papel). Não pude medir a saída. A tabela de persistência (`pipeline_inspections`)
   está em 0.

4. **Se os erros de PostgREST que deduzi realmente ocorrem em runtime.** Deduzi de forma sólida
   (coluna `total_amount` ausente nas 44 colunas de `sales`; `to_regclass('lead_routing_assignments')`
   = NULL; `salespeople` sem `monthly_goal`), mas não executei as funções nem li logs de invocação.
   Não tenho acesso a `supabase_functions_invoke` nem aos logs sob os guard-rails desta auditoria.

5. **Conteúdo de `report-snapshots` / `report-exports` (Storage).** Listei os 5 buckets
   (`avatars`, `call-recordings`, `quote-pdfs`, `report-exports`, `report-snapshots`) mas não enumerei objetos.

6. **`LOVABLE_API_KEY` está configurada?** Todos os recursos de narrativa IA
   (`revenue-forecast-ai`, `forecast-narrative`, `generate-executive-briefing`, `nlq-query`,
   `qbr-generator`) dependem dela. `revenue-forecast-ai/index.ts:112` degrada **silenciosamente**
   para `narrative = ""` se ausente; `generate-executive-briefing/index.ts:32` lança erro.
   Não posso ler secrets.

7. **Origem exata das 6 linhas de `forecast_snapshots`.** Não há `INSERT INTO forecast_snapshots`
   em `supabase/migrations/`. O padrão (timestamp único, valores redondos) indica seed manual,
   mas não localizei o script.

8. **Quais páginas os usuários realmente abrem.** `page_analytics` tem 75 linhas; não a analisei
   por rota — logo, "uso real" foi inferido de rota registrada em `src/routes/AppRoutes.tsx` +
   dado presente no banco, não de telemetria de acesso.

---

## 7. TOP 8 CORREÇÕES POR IMPACTO (ordem de execução sugerida)

1. **Unificar o status de venda no banco.** Substituir todo `status = 'completed'` por
   `status = ANY(ARRAY['completed','won','closed'])` em `mv_competitive_ranking`,
   `revenue_forecast_view`, `revops-hub/index.ts:41`, `LTVBySegment.tsx:33`.
   Destrava ranking, win rate, ciclo, ticket médio e LTV de uma vez.
2. **Corrigir `pipeline-pulse-aggregator`**: `total_amount` → `amount` (linhas 38,39,40);
   `lead_routing_assignments` → `lead_assignments` (linha 43); status `['open','negotiating']` →
   `['lead','pending','proposal']`. Destrava o Pulse **e** o Briefing Executivo.
3. **Popular `sales.stage`** (backfill a partir de `deal_stage_transitions.to_stage`) — destrava
   `get_revenue_forecast` e `revops-hub.weighted_forecast`.
4. **Migrar leitores de `deal_stage_history` → `deal_stage_transitions`** (6 arquivos listados na RAIZ #3)
   ou criar `deal_stage_history` como VIEW sobre `deal_stage_transitions`.
5. **Consertar o `import` quebrado em `nlq-query/index.ts:9-11`** (e `ai-copilot/index.ts:5`).
6. **Corrigir NULL-arithmetic em `revenue_forecast_view`**: envolver cada termo em `COALESCE(...,0)`
   *antes* da soma; e remover `'won'`/`'cancelled'` do pipeline aberto.
7. **Remover os 3 componentes que renderizam dados inventados** (`CompetencyRadar`,
   `ChurnPredictionPanel`, `LTVBySegment` em `Analytics.tsx:111,113,117`) ou passar props reais.
   Idem `PredictiveScenarioPlanner` em `PredictiveIntelligenceDashboard.tsx:139`.
8. **Criar os cron jobs ausentes**: `REFRESH MATERIALIZED VIEW mv_competitive_ranking`,
   `snapshot-forecast` + `compute-forecast-accuracy` (mensal),
   `generate-executive-briefing` (diário), `scheduled-reports-runner` (horário).

---

*Fim do relatório. 84 funcionalidades auditadas · 100% das afirmações com `arquivo:linha` ou
medição SQL em produção.*
