
Coverage Analyzer 2/4 entregue. Próxima atômica do roadmap Revenue Intelligence.

**Revenue Intelligence — 3/4: Win Probability Calibration**

Hoje a probabilidade de cada deal vem de uma tabela estática de estágios (`STAGE_PROBABILITY`). Vamos calibrar com dados históricos reais por owner/segmento/source e expor a curva de calibração + score recalibrado por deal.

## O que entregar

### 1. Migration
- `win_probability_calibrations`: `id`, `scope` (`global|owner|segment|source`), `scope_value` (text nullable), `stage`, `historical_win_rate numeric`, `sample_size int`, `confidence numeric` (0-1, baseado em sample), `calibrated_probability numeric`, `baseline_probability numeric`, `calculated_at timestamptz`. RLS authenticated read; admin/manager write.
- `deal_probability_scores`: `id`, `sale_id` FK, `raw_probability`, `calibrated_probability`, `confidence`, `factors jsonb` (breakdown: stage, owner_adj, segment_adj, recency_adj), `calculated_at`. RLS authenticated read; admin/manager write.
- Índices em `(scope, scope_value, stage)` e `(sale_id, calculated_at desc)`.
- Realtime nas duas.

### 2. Edge function `calibrate-win-probability` (verify_jwt=true)
- Input: `{ lookback_days?: 180, min_sample?: 5 }`.
- Para cada `(scope, scope_value, stage)`: lê histórico de `sales` (closed_won/lost) → calcula `win_rate = won/(won+lost)`, `confidence = min(sample/30, 1)`, `calibrated = baseline*0.3 + win_rate*0.7*confidence + baseline*(1-confidence)*0.7`.
- Upsert calibrations.
- Para cada deal aberto: aplica fator owner + segment + source + recency (deals últimos 30d valem mais) → grava em `deal_probability_scores`.

### 3. Hooks `src/hooks/revenue/`
- `useWinProbabilityCalibration()` — query calibrations + realtime.
- `useDealProbabilityScores(filters?)` — query scores + realtime.
- `useRunWinCalibration()` — mutation invocando edge function.

### 4. Componentes `src/components/revenue-intelligence/calibration/`
- `WinProbabilityCalibrationPanel.tsx` (≤260L) — container com botão "Recalibrar agora" + sub-componentes.
- `CalibrationCurveChart.tsx` (≤180L) — Recharts line: baseline vs calibrated por estágio, com banda de confiança.
- `CalibrationVarianceTable.tsx` (≤180L) — top 10 maiores divergências (baseline vs real), badge de confidence, sample size.
- `RecalibratedDealsList.tsx` (≤200L) — top 15 deals com maior shift (Δ probabilidade), nome do deal, owner, valor, antes→depois com seta colorida.
- `calibrationHelpers.ts` — `calcConfidence`, `blendProbability`, `colorByDelta`, formatters.

### 5. Integração
- Nova aba **"Win Calibration"** no `RevenueIntelligenceHub.tsx` entre "Coverage Analyzer" e "Pipeline Inspection".
- `supabase/config.toml`: `[functions.calibrate-win-probability] verify_jwt = true`.

### 6. Validação
- `supabase--linter` zero novos warnings.
- Botão "Recalibrar" insere calibrations + scores; gráfico desenha curva; tabela e lista de deals renderizam sem erros.

## Arquivos
- **Migration**: 1 (2 tabelas + RLS + realtime + índices).
- **Edge function**: `calibrate-win-probability`.
- **Criar**: 3 hooks, 4 componentes + 1 helper.
- **Editar**: `RevenueIntelligenceHub.tsx`, `supabase/config.toml`.

Após esta entrega, sigo para **4/4: Quota Attainment Predictor** fechando Revenue Intelligence em 10/10.
