
Conversation Intelligence fechado em 4/4 (10/10). Próximo bloco do roadmap mestre.

**Próximo bloco — Deal Intelligence Hub (1/4): Deal Health Scorer**

Já existem (base): pipeline, deals, stakeholders, atividades. Falta um **score de saúde por deal** que combine sinais multidimensionais (engajamento, momentum, fit, comitê, risco) em um indicador unificado por oportunidade, com drill-down e leaderboard de deals em risco.

## O que entregar

### 1. Migration
- `deal_health_scores`: `id`, `sale_id` FK UNIQUE, `overall_score numeric` (0-100), `engagement_score numeric`, `momentum_score numeric`, `fit_score numeric`, `committee_score numeric`, `risk_score numeric`, `health` (`critical|at_risk|healthy|excellent`), `top_risks jsonb` (top 2), `top_signals jsonb` (top 2 positivos), `recommendations jsonb` (3-5), `factors jsonb`, `calculated_at timestamptz`. RLS read authenticated, write admin/manager.
- `deal_health_history`: `id`, `sale_id` FK, `overall_score numeric`, `health text`, `snapshot_at timestamptz`. Para sparkline de tendência. RLS igual.
- Índices `(sale_id)`, `(overall_score desc)`, `(sale_id, snapshot_at desc)`. Realtime nas duas.

### 2. Edge function `score-deal-health` (verify_jwt=true)
- Input: `{ sale_id }`. Lê deal + activities + stakeholders + recordings recentes.
- **Engagement** (0-100): atividades últimos 14d / esperado por estágio.
- **Momentum** (0-100): tempo no estágio vs média + última interação.
- **Fit** (0-100): valor vs ticket médio + ICP score se disponível.
- **Committee** (0-100): nº stakeholders mapeados vs esperado por estágio + role coverage.
- **Risk** (0-100, invertido): silêncio, objeções não resolvidas, competidores mencionados, sentiment negativo.
- Pondera: `overall = engagement*0.20 + momentum*0.25 + fit*0.15 + committee*0.20 + risk*0.20`.
- Health: <40 critical, 40-60 at_risk, 60-80 healthy, >80 excellent.
- Top 2 risks (scores mais baixos), top 2 signals (mais altos), recomendações por gap.
- Upsert `deal_health_scores` + insert snapshot em `deal_health_history`.

### 3. Hooks `src/hooks/deal-intelligence/useDealHealth.ts`
- `useDealHealth(saleId)` — query + realtime.
- `useDealHealthHistory(saleId)` — sparkline.
- `useDealsAtRisk(limit?)` — leaderboard at_risk/critical.
- `useScoreDealHealth()` — mutation.

### 4. Componentes `src/components/deal-intelligence/health/`
- `DealHealthCard.tsx` (≤220L) — card no drawer do deal: radial overall, breakdown 5 dimensões, riscos/sinais, recomendações, botão recalcular.
- `DealHealthRadial.tsx` (≤140L) — radial Recharts color-coded.
- `DealHealthDimensions.tsx` (≤160L) — 5 barras horizontais.
- `DealHealthSparkline.tsx` (≤120L) — line chart histórico 30d.
- `DealsAtRiskPanel.tsx` (≤240L) — hub: top 10 deals em risco com score, gap principal, owner.
- `dealHealthHelpers.ts` — labels, paletas, classificação, recomendações por gap.

### 5. Integração
- Drawer do deal (Pipeline): `<DealHealthCard saleId={deal.id} />` no topo.
- `DealIntelligenceHub.tsx` (ou Pipeline page): `<DealsAtRiskPanel />`.
- `supabase/config.toml`: `[functions.score-deal-health] verify_jwt = true`.

### 6. Validação
- `supabase--linter` zero novos warnings.
- Após clicar "Calcular": card mostra score + breakdown + sparkline; painel hub lista deals em risco.

## Arquivos
- **Migration**: 1 (2 tabelas + RLS + realtime + índices).
- **Edge function**: `score-deal-health`.
- **Criar**: 4 hooks (1 arquivo), 5 componentes + 1 helper.
- **Editar**: drawer do deal, hub/Pipeline, `supabase/config.toml`.

Após esta entrega, sigo para **Deal Intelligence 2/4: Buying Committee Coverage** → **3/4: Stage Velocity Analyzer** → **4/4: Win/Loss Pattern Miner**, fechando o bloco em 10/10.
