
Sale Broadcast entregue. Retomo o roadmap mestre.

**Revenue Intelligence Hub — 2/4: Pipeline Coverage Forecaster**

Mede se o pipeline atual cobre a meta do período (coverage ratio = pipeline_aberto / meta_restante). Identifica gaps por owner/segmento, projeta probabilidade de bater meta e recomenda quanto pipeline novo precisa ser gerado.

## Entregáveis

### 1. Migration
- `pipeline_coverage_snapshots`: `id`, `period_start date`, `period_end date`, `owner_id uuid`, `segment text`, `quota_amount numeric`, `closed_amount numeric`, `open_pipeline numeric`, `weighted_pipeline numeric`, `gap_amount numeric` (gen), `coverage_ratio numeric` (gen: weighted/gap), `health text` (healthy|at_risk|critical), `snapshot_at timestamptz`. Único `(period_start, owner_id, segment)`.
- `pipeline_coverage_recommendations`: `id`, `snapshot_id FK`, `recommendation_type` (`generate_pipeline|accelerate_deals|increase_avg_ticket`), `title text`, `description text`, `target_amount numeric`, `priority text`, `created_at`.
- RLS read authenticated, write admin/manager. Realtime + índices `(period_start, owner_id)`, `(health)`.

### 2. Edge function (verify_jwt=true)
- `analyze-pipeline-coverage`: para cada owner ativo + período corrente:
  - calcula `closed_amount` (sales completed no período).
  - calcula `open_pipeline` (sales abertos com expected_close no período).
  - calcula `weighted_pipeline` usando `STAGE_WEIGHTS`.
  - busca `quota_amount` de `goals` ou usa default.
  - classifica health: ratio ≥ 3x = healthy, 2-3x = at_risk, <2x = critical.
  - upsert em `pipeline_coverage_snapshots`.
  - gera 1-3 recomendações via Lovable AI (`gemini-2.5-flash`) baseadas no gap.

### 3. Hooks `src/hooks/revenue-intelligence/usePipelineCoverage.ts`
- `useCoverageSnapshots(filters?)` — snapshots por período.
- `useCoverageRecommendations(snapshotId?)` — recomendações.
- `useCoverageSummary()` — KPIs: coverage médio, owners críticos, gap total.
- `useAnalyzeCoverage()` — mutation.

### 4. Componentes `src/components/revenue-intelligence/coverage/`
- `CoverageSummaryCard.tsx` (≤180L) — 4 KPIs + ação refresh.
- `CoverageByOwnerTable.tsx` (≤200L) — tabela com ratio, health badge, gap.
- `CoverageGapChart.tsx` (≤160L) — bar chart: gap por owner/segmento.
- `CoverageHealthDistribution.tsx` (≤140L) — donut healthy/at_risk/critical.
- `CoverageRecommendationsPanel.tsx` (≤180L) — cards de recomendações IA.
- `coverageHelpers.ts` — labels health, cores, formatadores.

### 5. Integração
- Nova aba "Cobertura do Pipeline" em `RevenueIntelligenceHub.tsx`.
- `supabase/config.toml`: bloco `verify_jwt = true` para `analyze-pipeline-coverage`.

### 6. Validação
- `supabase--linter` zero novos warnings.
- Após analyze: cards preenchem, tabela mostra owners por health, recomendações aparecem.

## Arquivos
- **Migration**: 1 (2 tabelas + RLS + realtime + índices).
- **Edge function**: 1.
- **Criar**: 4 hooks (1 arquivo), 5 componentes + 1 helper.
- **Editar**: `RevenueIntelligenceHub.tsx`, `supabase/config.toml`.

Após esta entrega, sigo para **3/4: Win Probability Calibrator** → **4/4: Quota Attainment Predictor**, fechando Revenue Intelligence em 10/10.
