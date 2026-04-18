
Deal Intelligence 3/4 entregue. Última atômica do bloco.

**Deal Intelligence — 4/4: Win/Loss Pattern Miner**

Analisa deals fechados (won/lost) para extrair padrões: fatores de vitória/derrota, perfis de cliente que convertem, estágios onde mais se perde, objeções recorrentes, ticket médio por outcome. Gera insights acionáveis e recomendações de ICP.

## Entregáveis

### 1. Migration
- `win_loss_analyses`: `id`, `sale_id` FK UNIQUE, `outcome` (`won|lost`), `primary_reason text`, `secondary_reasons jsonb`, `competitor text`, `lost_stage text`, `cycle_days numeric`, `amount numeric`, `segment text`, `analyzed_at`. Snapshot por deal.
- `win_loss_patterns`: `id`, `pattern_type` (`win_factor|loss_factor|stuck_stage|competitor|icp_match`), `label text`, `outcome text`, `frequency int`, `win_rate numeric`, `avg_cycle_days numeric`, `avg_amount numeric`, `confidence numeric`, `computed_at`. Agregados.
- `win_loss_insights`: `id`, `insight_type text`, `title text`, `description text`, `severity` (`info|opportunity|risk`), `evidence jsonb`, `created_at`. IA-driven.
- RLS read authenticated, write admin/manager. Realtime + índices `(outcome)`, `(pattern_type)`, `(severity)`.

### 2. Edge functions (verify_jwt=true)
- `analyze-win-loss`: lê `sales` com status `completed|lost` últimos 180d. Para cada um: extrai motivo (campos existentes ou via Lovable AI `gemini-2.5-flash` se houver notas), classifica primary/secondary, upsert `win_loss_analyses`.
- `mine-win-loss-patterns`: agrega `win_loss_analyses` em `win_loss_patterns` (top fatores, win_rate por segmento/competitor, estágio onde mais se perde, ticket médio). Gera 3-5 insights acionáveis em `win_loss_insights` via IA.

### 3. Hooks `src/hooks/deal-intelligence/useWinLoss.ts`
- `useWinLossAnalyses(filters?)` — análises individuais.
- `useWinLossPatterns(type?)` — padrões agregados.
- `useWinLossInsights()` — insights IA.
- `useWinLossSummary()` — KPIs: win rate, avg cycle won/lost, top win/loss reason, top competitor.
- `useAnalyzeWinLoss()` / `useMinePatterns()` — mutations.

### 4. Componentes `src/components/deal-intelligence/winloss/`
- `WinLossSummaryCard.tsx` (≤180L) — 4 KPIs principais com sparkline.
- `WinFactorsChart.tsx` (≤160L) — Recharts bar horizontal: top 8 fatores de vitória.
- `LossFactorsChart.tsx` (≤160L) — Recharts bar horizontal: top 8 fatores de derrota.
- `CompetitorAnalysisTable.tsx` (≤180L) — concorrentes: encontros, win rate vs cada um, ticket médio.
- `WinLossInsightsPanel.tsx` (≤200L) — cards de insights IA com severidade e evidências.
- `LostStageBreakdown.tsx` (≤140L) — pie/donut: distribuição de perdas por estágio.
- `winLossHelpers.ts` — labels, cores severidade, formatadores.

### 5. Integração
- `DealIntelligence.tsx`: nova aba "Win/Loss" com:
  - Linha 1: `<WinLossSummaryCard />`
  - Linha 2: `<WinFactorsChart />` + `<LossFactorsChart />` (grid 2 cols)
  - Linha 3: `<LostStageBreakdown />` + `<CompetitorAnalysisTable />` (grid 2 cols)
  - Linha 4: `<WinLossInsightsPanel />`
- `supabase/config.toml`: blocos `verify_jwt = true` para as duas funções.

### 6. Validação
- `supabase--linter` zero novos warnings.
- Após analyze + mine: KPIs preenchem, gráficos mostram top fatores, insights aparecem com recomendações.

## Arquivos
- **Migration**: 1 (3 tabelas + RLS + realtime + índices).
- **Edge functions**: 2 (`analyze-win-loss`, `mine-win-loss-patterns`).
- **Criar**: 5 hooks (1 arquivo), 6 componentes + 1 helper.
- **Editar**: `DealIntelligence.tsx`, `supabase/config.toml`.

Após esta entrega, **Deal Intelligence fecha 4/4 (10/10)** e sigo automaticamente para o próximo bloco do roadmap mestre.
