
Race Arena fechou 3/3 (10/10). Retomando o roadmap **Revenue Intelligence — 2/4: Pipeline Coverage Analyzer**.

Já existem (Fase 1/4): `RevenueIntelligenceHub`, `CoverageRatioGauge` (cobertura simples ratio×target), forecast roll-up, win rate, pipeline inspection, QBR e AI Forecast. Falta o **Analyzer** completo: cobertura segmentada por estágio/owner/segmento, simulações what-if, alerta de gaps e recomendações IA.

---

**Próxima atômica — Pipeline Coverage Analyzer**

## O que entregar

### 1. Migration
- `pipeline_coverage_snapshots`: `id`, `period_start`, `period_end`, `owner_id` (nullable=global), `segment` (nullable), `stage` (nullable), `quota_amount numeric`, `pipeline_amount numeric`, `weighted_pipeline numeric`, `coverage_ratio numeric`, `target_ratio numeric` (default 3.0), `health` (`critical|weak|healthy|strong`), `gap_to_target numeric`, `deals_count int`, `calculated_at timestamptz`. RLS + realtime.
- `pipeline_coverage_recommendations`: `id`, `snapshot_id` FK, `priority` (`high|medium|low`), `title`, `action`, `expected_impact_amount numeric`, `ai_generated bool`, `created_at`. RLS.
- View `v_pipeline_coverage_summary` agregando por owner/global.
- Índices em `(period_start, owner_id, stage)`.

### 2. Edge function `analyze-pipeline-coverage` (verify_jwt=true)
- Input: `{ period_days?: 90, owner_id?: string|null, refresh?: bool }`.
- Calcula por (owner × stage × segment): pipeline aberto, pipeline ponderado por probabilidade do estágio, coverage_ratio = weighted_pipeline / quota_remaining.
- Classifica health: <1.5 critical, 1.5-2.5 weak, 2.5-4 healthy, >4 strong.
- Chama Lovable AI (`google/gemini-2.5-flash`) para gerar 3-5 recomendações priorizadas com estimativa de impacto $.
- Upsert em `pipeline_coverage_snapshots` + `pipeline_coverage_recommendations`.

### 3. Hooks `src/hooks/revenue/`
- `usePipelineCoverageAnalyzer(filters)` — query + realtime.
- `useRunCoverageAnalysis()` — mutation que invoca a edge function.
- `useCoverageWhatIf(snapshotId, deltas)` — recálculo client-side de cenários (adicionar X deals, mover Y%).

### 4. Componentes `src/components/revenue-intelligence/coverage/`
- `PipelineCoverageAnalyzer.tsx` (≤280L) — container com filtros (period, owner, segment) + sub-componentes.
- `CoverageHealthGrid.tsx` (≤200L) — heatmap owner × stage com cores semânticas (critical→strong) e tooltip de gap.
- `CoverageGapAlertList.tsx` (≤180L) — lista de gaps críticos ordenados por valor faltante, badge de severidade, botão "ver deals".
- `CoverageWhatIfSimulator.tsx` (≤240L) — sliders: "+N deals médios", "+X% conversão estágio", "antecipar fechamento Y dias". Mostra novo ratio em tempo real.
- `CoverageRecommendationsPanel.tsx` (≤180L) — cards de recomendações IA com prioridade + impacto $ + botão "marcar como atuada".
- `coverageHelpers.ts` — `classifyHealth`, `calcWeightedPipeline`, `simulateWhatIf`, paleta de cores por health.

### 5. Integração
- Nova aba **"Coverage Analyzer"** no `RevenueIntelligenceHub.tsx` (entre "Win Rate Drill-down" e "Pipeline Inspection") renderizando `PipelineCoverageAnalyzer`.
- Botão "Analisar agora" no header da aba que chama `useRunCoverageAnalysis`.

### 6. Configuração
- `supabase/config.toml`: bloco `[functions.analyze-pipeline-coverage] verify_jwt = true`.

### 7. Validação
- `supabase--linter` zero novos warnings.
- Aba renderiza heatmap + gaps + simulator + recomendações sem erros.
- What-if recalcula instantaneamente (<50ms) sem chamada de rede.

## Arquivos
- **Migration**: 1 (2 tabelas + view + RLS + realtime + índices).
- **Edge function**: `analyze-pipeline-coverage`.
- **Criar**: 3 hooks, 5 componentes + 1 helper.
- **Editar**: `RevenueIntelligenceHub.tsx`, `supabase/config.toml`, `src/components/revenue-intelligence/index.ts` (se existir).

Após esta entrega, sigo automaticamente para **Revenue Intelligence 3/4: Win Probability Calibration** → 4/4 **Quota Attainment Predictor**, fechando o bloco em 10/10.
