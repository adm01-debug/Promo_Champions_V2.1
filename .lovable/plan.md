
Revenue Intelligence 3/4 entregue. Última atômica do bloco.

**Revenue Intelligence — 4/4: Quota Attainment Predictor (Avançado)**

Já existe um `QuotaAttainmentPredictor` básico. Esta atômica eleva-o a 10/10: simulação Monte Carlo, projeção end-of-period com intervalos de confiança (P10/P50/P90), recomendações de ação por vendedor e alertas automáticos.

## Entregáveis

### 1. Migration
- `quota_attainment_forecasts`: `id`, `salesperson_id`, `period_start`, `period_end`, `quota numeric`, `closed numeric`, `weighted_open numeric`, `pace_per_day numeric`, `days_remaining int`, `p10 numeric`, `p50 numeric`, `p90 numeric`, `attainment_probability numeric`, `risk_level text` (safe|on_track|at_risk|critical), `simulations int`, `computed_at timestamptz`. Único `(salesperson_id, period_start)`.
- `quota_attainment_actions`: `id`, `forecast_id FK`, `action_type` (`close_deal|generate_pipeline|increase_ticket|accelerate_stage`), `title`, `description`, `expected_impact numeric`, `priority`, `created_at`.
- RLS read authenticated, write admin/manager. Realtime + índices.

### 2. Edge function `predict-quota-attainment` (verify_jwt=true)
- Para cada vendedor ativo no período corrente:
  - `closed` = soma de `sales.completed` no período.
  - `weighted_open` = soma de `amount * stage_weight` para deals abertos com close esperado no período.
  - `pace` = closed / dias_decorridos.
  - Monte Carlo (1000 simulações): para cada deal aberto, sample Bernoulli(p=stage_weight) e adiciona `amount` se ganho. Adiciona projeção de novos deals via `pace * dias_restantes * fator_aleatório(0.7-1.3)`.
  - Calcula P10/P50/P90, `attainment_probability = P(total ≥ quota)`, `risk_level` por threshold.
  - Gera 1-3 ações via Lovable AI (gemini-2.5-flash) com base no gap.

### 3. Hooks `src/hooks/revenue/useQuotaAttainmentPredictor.ts`
- `useQuotaForecasts(filters?)`, `useQuotaActions(forecastId?)`, `useQuotaSummary()` (top 3 KPIs), `useRunQuotaPrediction()`.

### 4. Componentes `src/components/revenue-intelligence/quota/`
- `QuotaForecastSummary.tsx` — KPIs (% safe, % crítico, gap total, prob. média).
- `QuotaProbabilityChart.tsx` — bar/scatter por vendedor com bandas P10–P90.
- `QuotaRiskHeatmap.tsx` — heatmap risco por vendedor.
- `QuotaActionsPanel.tsx` — recomendações IA agrupadas.
- `QuotaPredictorAdvancedPanel.tsx` (container) — substitui ou complementa o atual.
- `quotaPredictorAdvancedHelpers.ts` — formatadores e cores de risco.

### 5. Integração
- Aba "Quota Predictor" (existente) recebe novo container avançado.
- `supabase/config.toml`: `verify_jwt = true` para `predict-quota-attainment`.

### 6. Validação
- `supabase--linter` zero novos warnings.
- Após run: KPIs preenchem, chart com bandas P10–P90, heatmap com cores semânticas, ações IA aparecem.

## Arquivos
- **Migration**: 1.
- **Edge function**: 1.
- **Criar**: 1 hook, 5 componentes + 1 helper.
- **Editar**: `RevenueIntelligenceHub.tsx`, `supabase/config.toml`.

Após esta entrega, **Revenue Intelligence fecha 4/4 (10/10)** e sigo automaticamente para o próximo bloco do roadmap mestre.
