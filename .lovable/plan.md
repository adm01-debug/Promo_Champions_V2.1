
Deal Intelligence Hub fechado em 4/4 (10/10). Próximo bloco do roadmap mestre.

**Próximo bloco — Revenue Intelligence Hub (1/4): Forecast Accuracy Tracker**

Mede a precisão das previsões de receita comparando forecast vs realizado por período/vendedor/segmento. Identifica viés sistemático (otimista/pessimista), calcula MAPE (Mean Absolute Percentage Error) e gera score de confiabilidade do forecast por origem.

## Entregáveis

### 1. Migration
- `forecast_snapshots`: `id`, `period_start date`, `period_end date`, `owner_id uuid`, `segment text`, `forecast_amount numeric`, `forecast_deals int`, `weighted_amount numeric`, `commit_amount numeric`, `best_case_amount numeric`, `snapshot_at timestamptz`, `source text` (manual|weighted|ai). Snapshot histórico.
- `forecast_accuracy`: `id`, `snapshot_id FK UNIQUE`, `actual_amount numeric`, `actual_deals int`, `variance_amount numeric` (gen), `variance_pct numeric`, `mape numeric`, `bias text` (optimistic|pessimistic|accurate), `computed_at timestamptz`.
- `forecast_confidence_scores`: `id`, `owner_id uuid`, `source text`, `period_count int`, `avg_mape numeric`, `bias_trend text`, `confidence_score numeric` (0-100), `computed_at`. Único `(owner_id, source)`.
- RLS read authenticated, write admin/manager. Realtime + índices.

### 2. Edge functions (verify_jwt=true)
- `snapshot-forecast`: captura forecast atual (deals abertos × stage weights) + commit/best-case manuais, insere em `forecast_snapshots` por owner+segment.
- `compute-forecast-accuracy`: para snapshots com período encerrado, calcula receita real (sales completed no período), MAPE, bias, atualiza `forecast_accuracy` e agrega `forecast_confidence_scores`.

### 3. Hooks `src/hooks/revenue-intelligence/useForecastAccuracy.ts`
- `useForecastSnapshots(filters?)` — histórico.
- `useForecastAccuracy(period?)` — accuracy por período.
- `useConfidenceScores()` — scores por owner/source.
- `useForecastSummary()` — KPIs: MAPE médio, bias geral, melhor source, accuracy trend.
- `useSnapshotForecast()` / `useComputeAccuracy()` — mutations.

### 4. Componentes `src/components/revenue-intelligence/forecast/`
- `ForecastAccuracySummary.tsx` (≤180L) — 4 KPIs + actions.
- `ForecastVsActualChart.tsx` (≤180L) — Recharts line: forecast vs actual ao longo do tempo.
- `ForecastBiasChart.tsx` (≤160L) — bar chart: viés por owner/source.
- `ConfidenceScoresTable.tsx` (≤180L) — ranking de confiabilidade por origem/owner.
- `MapeBySegmentChart.tsx` (≤140L) — MAPE por segmento (smb/mid/enterprise).
- `forecastHelpers.ts` — labels bias, cores, formatadores MAPE.

### 5. Integração
- `RevenueIntelligence.tsx` (criar se não existir) ou aba em hub existente: nova aba "Precisão do Forecast".
- `supabase/config.toml`: blocos `verify_jwt = true` para as 2 funções.

### 6. Validação
- `supabase--linter` zero novos warnings.
- Após snapshot + compute: KPIs preenchem, gráficos mostram histórico, tabela mostra confiabilidade.

## Arquivos
- **Migration**: 1 (3 tabelas + RLS + realtime + índices).
- **Edge functions**: 2.
- **Criar**: 5 hooks (1 arquivo), 5 componentes + 1 helper.
- **Editar**: hub de revenue intelligence, `supabase/config.toml`.

Após esta entrega, sigo para **2/4: Pipeline Coverage Forecaster** → **3/4: Revenue Leakage Detector** → **4/4: Quota Attainment Predictor**, fechando Revenue Intelligence em 10/10.
