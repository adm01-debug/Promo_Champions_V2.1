
**Próximo bloco do GAPS_CLASSE_MUNDIAL.md — Deal Intelligence: Risk Scoring + Stalled Deals Auto-Detection**

Próxima atômica: detectar **deals em risco automaticamente** (estagnados, sem atividade, sem next-step, com sinais negativos da call) e gerar **score de saúde do deal (0-100)** com fatores explicáveis e ações recomendadas — primeiro item do bloco Deal Intelligence (1/4).

## Estado atual
- `sales` tem `stage`, `updated_at`, `final_value`, mas sem score de saúde calculado.
- `AtRiskDealsPanel` no Pipeline existe mas usa heurística simples (dias parado).
- `call_critical_moments`, `coaching_actions`, `competitor_mentions` já trazem sinais ricos por call — não estão cruzados com o deal.
- Sem score unificado, sem histórico de evolução do score, sem alertas proativos quando score cai.

## Mudanças

### 1. Migration
- Tabela `deal_health_scores`: `id`, `sale_id` (FK unique), `owner_id`, `score int` (0-100), `tier` (`healthy|watch|at_risk|critical`), `factors jsonb` (array `{key, label, impact, weight}`), `recommended_actions jsonb`, `last_activity_at`, `days_in_stage int`, `calculated_at`, `created_at`, `updated_at`. Index `(owner_id, tier, score)`.
- Tabela `deal_health_history`: `id`, `sale_id`, `score`, `tier`, `delta int`, `snapshot_at`. Index `(sale_id, snapshot_at desc)`.
- RLS: vendedor vê próprios; manager/admin vê tudo.
- Trigger `track_deal_health_change` que insere row em `history` quando score muda ≥5 pontos.
- Realtime nas duas tabelas.

### 2. Edge function `calculate-deal-health` (`verify_jwt = true`)
- Input: `{ sale_id }` ou `{ batch: true }` (recalcula todos os deals abertos do user).
- Lê: sale + última activity + critical_moments do recording associado + coaching_actions pendentes + dias em stage + próximo passo.
- Lovable AI (`google/gemini-2.5-flash`) com tool calling: `{score, tier, factors[], recommended_actions[]}`.
- Idempotente: upsert em `deal_health_scores` por `sale_id`.
- Trigger automático após mudança de stage ou nova activity.

### 3. Hooks `src/hooks/deal-intelligence/`
- `useDealHealth(saleId)` — query individual + realtime.
- `useDealHealthBatch(filters)` — lista filtrada por tier/owner.
- `useRecalculateDealHealth()` — mutation single ou batch.
- `useDealHealthHistory(saleId)` — sparkline de evolução.

### 4. UI
- `src/components/deal-intelligence/DealHealthScoreBadge.tsx` (≤100L) — pill colorida por tier com score numérico.
- `src/components/deal-intelligence/DealHealthCard.tsx` (≤220L) — card detalhado: ring de score, lista de fatores (positivos/negativos), ações recomendadas com botão "Criar activity", sparkline de histórico.
- `src/components/deal-intelligence/DealHealthFactorsList.tsx` (≤140L) — lista de fatores com impact visual (+/-).
- `src/components/deal-intelligence/DealHealthSparkline.tsx` (≤100L) — mini chart Recharts da evolução.
- `src/components/deal-intelligence/StalledDealsTable.tsx` (≤200L) — tabela priorizada de deals `at_risk`/`critical` com batch action "Recalcular todos".
- `src/components/deal-intelligence/dealHealthHelpers.ts` — labels PT-BR, cores por tier, formatadores.
- **Integração**:
  - `AtRiskDealsPanel`: substituir heurística por `useDealHealthBatch({tier: ['at_risk','critical']})`.
  - `KanbanCard`: adicionar `<DealHealthScoreBadge>` no canto.
  - `SaleDetailDrawer` (ou similar): nova seção embedando `<DealHealthCard>`.
  - Nova rota `/deal-intelligence` lazy com `<StalledDealsTable>` + filtros por tier/owner.
  - Sidebar: novo item "Saúde dos Deals" no grupo Analytics.

### 5. Configuração
- `supabase/config.toml`: `[functions.calculate-deal-health] verify_jwt = true`.

### 6. Validação
- `supabase--curl_edge_functions /calculate-deal-health` em sale real → confirma row + history.
- `supabase--linter` zero novos warnings.
- Badge aparece no Kanban; tabela `/deal-intelligence` lista deals em risco.

## Arquivos
- **Migration**: 1 (2 tabelas + trigger + realtime + RLS)
- **Criar**: `supabase/functions/calculate-deal-health/index.ts`
- **Criar**: 4 hooks em `src/hooks/deal-intelligence/`
- **Criar**: 6 componentes/helpers em `src/components/deal-intelligence/`
- **Criar**: `src/pages/DealIntelligence.tsx`
- **Editar**: `src/routes/AppRoutes.tsx`, `src/routes/lazyPages.ts`, `src/components/layout/sidebar/sidebarMenuData.ts`, `AtRiskDealsPanel`, `KanbanCard` (ou equivalente), `supabase/config.toml`

Após esta entrega, sigo automaticamente para 2/4 do bloco Deal Intelligence: **Buying Committee Mapping (DMU)** → 3/4 **Deal Velocity Predictor** → 4/4 **Stage Conversion Optimizer**, fechando o bloco em 10/10.
