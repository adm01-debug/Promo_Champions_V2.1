
Win Calibration 3/4 entregue. Última atômica do Revenue Intelligence para fechar 10/10.

**Revenue Intelligence — 4/4: Quota Attainment Predictor**

Predição probabilística de atingimento de quota por vendedor até o fim do período, combinando: pipeline calibrado (já temos via Win Calibration), velocity histórica, run-rate atual e pace requerido. Saída: % de chance de bater quota + cenários (pessimista/realista/otimista) + alertas de quem precisa de intervenção.

## O que entregar

### 1. Migration
- `quota_attainment_predictions`: `id`, `salesperson_id` FK, `period_start`, `period_end`, `quota_amount numeric`, `closed_amount numeric`, `weighted_pipeline numeric`, `predicted_amount numeric`, `attainment_probability numeric` (0-1), `scenario_pessimistic numeric`, `scenario_realistic numeric`, `scenario_optimistic numeric`, `pace_required_per_day numeric`, `current_pace_per_day numeric`, `risk_level` (`safe|on_track|at_risk|critical`), `factors jsonb`, `calculated_at timestamptz`. RLS authenticated read; admin/manager write.
- `quota_attainment_alerts`: `id`, `prediction_id` FK, `salesperson_id`, `severity` (`info|warning|critical`), `message`, `recommended_action`, `acknowledged bool`, `created_at`. RLS.
- Índices em `(salesperson_id, period_start desc)` e realtime nas duas.

### 2. Edge function `predict-quota-attainment` (verify_jwt=true)
- Input: `{ period?: 'month'|'quarter', salesperson_id?: string|null }`.
- Para cada vendedor (ou um específico): calcula closed no período + weighted pipeline (usando `deal_probability_scores` quando disponível, fallback STAGE_PROBABILITY) + run-rate (closed/dias decorridos) + pace required ((quota - closed)/dias restantes).
- Monte Carlo simplificado: 1000 simulações somando deals abertos com `Bernoulli(calibrated_probability)`; deriva P10 (pessimista), P50 (realista), P90 (otimista) e probabilidade de ≥ quota.
- Classifica risco: prob ≥ 0.8 safe, 0.5-0.8 on_track, 0.25-0.5 at_risk, <0.25 critical.
- Gera alertas para `at_risk`/`critical` com ação recomendada (ex: "precisa fechar R$X em Y dias — focar em N deals em Negotiation").
- Upsert predictions + insert alerts novos.

### 3. Hooks `src/hooks/revenue/`
- `useQuotaAttainmentPredictions(filters?)` — query + realtime.
- `useQuotaAttainmentAlerts()` — query alertas não-acknowledged + realtime.
- `useRunQuotaPrediction()` — mutation invocando edge function.
- `useAcknowledgeQuotaAlert()` — mutation marca alert como visto.

### 4. Componentes `src/components/revenue-intelligence/quota/`
- `QuotaAttainmentPredictor.tsx` (≤260L) — container com botão "Recalcular predições" + sub-componentes.
- `QuotaAttainmentSummaryCards.tsx` (≤160L) — KPIs: % time on track, vendedores at-risk, gap total, prob média de bater quota.
- `QuotaScenarioChart.tsx` (≤200L) — Recharts bar + reference line da quota: para cada vendedor, barras P10/P50/P90 lado a lado com linha de quota.
- `QuotaRiskTable.tsx` (≤200L) — tabela: vendedor, closed, weighted pipeline, prob bater quota (badge color), pace atual vs requerido, risco.
- `QuotaAttainmentAlertsPanel.tsx` (≤180L) — lista de alertas críticos com botão "Ack" e ação recomendada.
- `quotaPredictorHelpers.ts` — `classifyRisk`, `monteCarloAttainment` (client-side fallback), `formatPace`, paleta de cores.

### 5. Integração
- Nova aba **"Quota Predictor"** no `RevenueIntelligenceHub.tsx` ao final (depois de "Pipeline Inspection").
- `supabase/config.toml`: `[functions.predict-quota-attainment] verify_jwt = true`.

### 6. Validação
- `supabase--linter` zero novos warnings.
- Botão "Recalcular" gera predictions + alertas; cards/tabela/chart renderizam; alertas podem ser acknowledged.

## Arquivos
- **Migration**: 1 (2 tabelas + RLS + realtime + índices).
- **Edge function**: `predict-quota-attainment`.
- **Criar**: 4 hooks, 5 componentes + 1 helper.
- **Editar**: `RevenueIntelligenceHub.tsx`, `supabase/config.toml`.

Após esta entrega, **Revenue Intelligence fecha 4/4 (10/10)** e sigo automaticamente para o próximo bloco do roadmap mestre.
