
Build corrigido. Sigo com a próxima atômica do Deal Intelligence Hub.

**Deal Intelligence Hub — 2/4: Buying Committee Coverage**

Já existe `deal_committee_coverage` + `deal_stakeholders` + `BuyingCommitteeCard` + `WeakCoverageDealsTable`. Falta o **AI extractor real**, **histórico de evolução**, **role coverage matrix visual** e **insights agregados no hub**.

## Entregáveis

### 1. Migration
- `committee_coverage_history`: `id`, `sale_id` FK, `coverage_score numeric`, `tier text`, `stakeholder_count int`, `gaps jsonb`, `snapshot_at timestamptz`. Para sparkline.
- `committee_extraction_runs`: `id`, `recording_id` FK, `sale_id` FK, `extracted_count int`, `created_count int`, `updated_count int`, `confidence numeric`, `raw_output jsonb`, `created_at timestamptz`. Auditoria de extrações IA.
- Trigger `after upsert deal_committee_coverage` → insert snapshot history.
- RLS read authenticated, write admin/manager. Realtime + índices.

### 2. Edge function `extract-committee-from-call` (verify_jwt=true)
- Input: `{ recording_id }`. Lê transcript + sale.
- Lovable AI (`google/gemini-2.5-flash`) com prompt PT-BR estruturado: extrai nome, cargo, dmu_role, influence, sentiment, evidência (quote).
- Schema Zod no servidor para validar saída.
- Upsert `deal_stakeholders` (match por nome+sale_id), insert `committee_extraction_runs`, dispara `calculate-committee-coverage`.

### 3. Hooks `src/hooks/deal-intelligence/useCommitteeCoverage.ts` (estender)
- `useCommitteeCoverageHistory(saleId)` — sparkline 30d.
- `useCommitteeInsights()` — agregados: % deals com champion, % com EB, gap mais comum, evolução média.
- `useExtractCommitteeFromCall()` — mutation chamada do drawer da call.

### 4. Componentes `src/components/deal-intelligence/committee/`
- `CommitteeCoverageSparkline.tsx` (≤120L) — line chart histórico no card existente.
- `RoleCoverageMatrix.tsx` (≤180L) — grid visual 7 roles × status (mapped/missing) com ícones e influência.
- `CommitteeInsightsPanel.tsx` (≤220L) — hub: 4 KPIs (% champion, % EB, single-threaded count, avg coverage), gap mais comum, deals que melhoraram.
- `CommitteeExtractionBadge.tsx` (≤80L) — badge no stakeholder mostrando "Extraído de call" + tooltip com quote.

### 5. Integração
- `BuyingCommitteeCard.tsx`: adicionar `<CommitteeCoverageSparkline />` e `<RoleCoverageMatrix />`.
- `RecordingSummaryDrawer.tsx`: botão "Extrair comitê" chamando `extract-committee-from-call`.
- `DealIntelligence.tsx` aba "Comitê de Compra": adicionar `<CommitteeInsightsPanel />` acima do `<WeakCoverageDealsTable />`.
- `supabase/config.toml`: `[functions.extract-committee-from-call] verify_jwt = true`.

### 6. Validação
- `supabase--linter` zero novos warnings.
- Após extrair: stakeholders aparecem com badge de origem; sparkline mostra evolução; hub mostra insights agregados.

## Arquivos
- **Migration**: 1 (2 tabelas + trigger + RLS + realtime).
- **Edge function**: `extract-committee-from-call`.
- **Estender**: `useCommitteeCoverage.ts` (3 hooks).
- **Criar**: 4 componentes.
- **Editar**: `BuyingCommitteeCard.tsx`, `RecordingSummaryDrawer.tsx`, `DealIntelligence.tsx`, `supabase/config.toml`.

Após esta entrega, sigo para **3/4: Stage Velocity Analyzer** → **4/4: Win/Loss Pattern Miner**, fechando Deal Intelligence em 10/10.
