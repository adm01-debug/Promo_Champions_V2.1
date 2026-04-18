
Pipeline Coverage (2/4) entregue. Próxima atômica do Revenue Intelligence Hub.

**Revenue Intelligence — 3/4: Win Probability Calibrator**

Calibra a probabilidade de fechamento de cada deal aberto comparando a probabilidade declarada (`stage weight` ou `probability` manual) com a taxa real histórica de conversão por estágio/segmento/owner. Detecta deals "super-otimistas" (probabilidade declarada >> real) e "subestimados", e emite probabilidade calibrada via regressão logística simples + isotonic-like binning.

## Entregáveis

### 1. Migration
- `win_probability_calibrations`: `id`, `sale_id FK UNIQUE`, `stage text`, `segment text`, `owner_id uuid`, `declared_probability numeric`, `historical_win_rate numeric`, `calibrated_probability numeric`, `calibration_delta numeric` (gen: calibrated - declared), `confidence text` (low|medium|high), `flag text` (overconfident|underconfident|aligned), `sample_size int`, `computed_at timestamptz`.
- `win_calibration_buckets`: `id`, `stage text`, `segment text`, `bucket_min numeric`, `bucket_max numeric`, `actual_win_rate numeric`, `sample_size int`, `computed_at timestamptz`. Único `(stage, segment, bucket_min)`.
- RLS read authenticated, write admin/manager. Realtime + índices `(sale_id)`, `(flag)`, `(stage, segment)`.

### 2. Edge function (verify_jwt=true)
- `calibrate-win-probabilities`:
  - Para cada combinação `(stage, segment)` com ≥ 20 deals fechados nos últimos 180d, calcula `actual_win_rate = won / (won+lost)` e cria buckets de probabilidade declarada (0-20, 20-40, 40-60, 60-80, 80-100) com `actual_win_rate` por bucket → upsert `win_calibration_buckets`.
  - Para cada deal aberto: lookup do bucket correspondente; `calibrated_probability = bucket.actual_win_rate`; `flag = overconfident` se `declared - calibrated > 0.15`, `underconfident` se `calibrated - declared > 0.15`, senão `aligned`; `confidence` baseado em `sample_size` (≥100 high, ≥30 medium, senão low) → upsert `win_probability_calibrations`.

### 3. Hooks `src/hooks/revenue/useWinProbabilityCalibrator.ts`
- `useCalibrations(filters?)` — calibrations + join sale_id.
- `useCalibrationBuckets(stage?, segment?)` — buckets para curva.
- `useCalibrationSummary()` — KPIs: total overconfident, underconfident, gap médio, accuracy global.
- `useRunCalibration()` — mutation.

### 4. Componentes `src/components/revenue-intelligence/calibration/`
- `CalibrationSummaryCard.tsx` (≤180L) — 4 KPIs + ação refresh.
- `CalibrationCurveChart.tsx` (≤180L) — line chart: declared (diagonal) vs actual por bucket.
- `OverconfidentDealsTable.tsx` (≤200L) — top 20 deals super-otimistas (gap descendente).
- `CalibrationFlagDistribution.tsx` (≤140L) — donut overconfident/aligned/underconfident.
- `WinProbabilityCalibrationPanel.tsx` (container).
- `calibrationHelpers.ts` — labels flag, cores, formatadores.

### 5. Integração
- Nova aba "Calibração de Win" em `RevenueIntelligenceHub.tsx`.
- `supabase/config.toml`: bloco `verify_jwt = true` para `calibrate-win-probabilities`.

### 6. Validação
- `supabase--linter` zero novos warnings.
- Após calibrate: KPIs preenchem, curva mostra desvio do ideal, tabela lista deals super-otimistas.

## Arquivos
- **Migration**: 1 (2 tabelas + RLS + realtime + índices).
- **Edge function**: 1.
- **Criar**: 4 hooks (1 arquivo), 5 componentes + 1 helper.
- **Editar**: `RevenueIntelligenceHub.tsx`, `supabase/config.toml`.

Após esta entrega, sigo para **4/4: Quota Attainment Predictor**, fechando Revenue Intelligence em 10/10.
