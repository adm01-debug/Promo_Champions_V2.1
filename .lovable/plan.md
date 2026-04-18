
Deal Health Hub entregue. Próximo bloco rumo a 10/10: **Win/Loss Intelligence com IA** — análise automática de razões de ganho/perda usando padrões em deals fechados, gerando insights acionáveis para o time.

## Win/Loss Intelligence com IA

### Conceito
Quando um deal é marcado como ganho ou perdido, o sistema captura razão estruturada + contexto (estágio, valor, ciclo, atividades, concorrente). Uma IA analisa lotes de deals fechados e gera padrões: "Você perde 60% dos deals acima de R$50k para Concorrente X", "Deals ganhos têm 3+ contatos com decisor", etc.

### Backend
**Migration**:
- Tabela `deal_outcomes`: `id`, `sale_id`, `outcome` (won/lost), `primary_reason` (enum: price, timing, competitor, no_budget, no_decision, feature_gap, relationship, other), `secondary_reasons` (text[]), `competitor_name`, `lessons_learned` (text), `recorded_by`, `created_at`
- View `win_loss_summary_view`: agrega win rate por razão, valor médio perdido por concorrente, ciclo médio won vs lost
- RLS: vendedor vê só seus; gestor/admin vê tudo

**Edge function `win-loss-analyzer`**:
- Aceita período (30/60/90d) e filtros opcionais (salesperson, segment)
- Busca deals fechados + outcomes + atividades
- Chama Lovable AI (gemini-2.5-flash) com agregações para gerar padrões e recomendações
- Retorna `{ patterns: [], top_loss_reasons: [], competitor_insights: [], recommendations: [] }`

### Frontend (`src/components/win-loss/`)
- `WinLossHub.tsx` (≤300L): hub com KPIs (win rate, avg deal size won/lost, top reason), seletor de período
- `OutcomeReasonChart.tsx`: barras horizontais — razões de perda ordenadas por frequência
- `CompetitorAnalysisCard.tsx`: tabela de concorrentes com win rate vs cada um
- `WinLossInsightsCard.tsx`: card com narrativa IA (padrões + recomendações)
- `OutcomeFormDialog.tsx`: modal disparado ao mover deal para Won/Lost — captura razão estruturada
- `winLossHelpers.ts`: enums labels, color tokens, formatters
- Hooks: `useWinLossOutcomes.ts`, `useWinLossInsights.ts`, `useRecordOutcome.ts`

### Integração
- Trigger automático: quando deal passa para Won/Lost no Kanban → abre `OutcomeFormDialog`
- Nova tab "Win/Loss" no Analytics module
- Card resumo no `RevenueIntelligenceHub`

### Arquivos
- Migration: tabela `deal_outcomes` + view + RLS + índices
- Edge: `supabase/functions/win-loss-analyzer/index.ts`
- Hooks: 3 em `src/hooks/win-loss/`
- Componentes: 5 em `src/components/win-loss/`
- Helpers: `winLossHelpers.ts`
- Editar: `KanbanCard` (trigger dialog), `Analytics.tsx` (nova tab), `RevenueIntelligenceHub` (card)

Padrões: semantic tokens, Sora/Inter, framer-motion, skeleton, ≤300L, strict TS, recharts tipado, RLS com `has_role`.
