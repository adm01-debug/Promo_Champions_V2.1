
Revenue Forecast Intelligence entregue. Próximo bloco rumo a 10/10: **Deal Health Scoring** — score 0-100 por deal aberto combinando sinais de engajamento, velocidade no pipeline, valor vs ticket médio e estagnação, com explicação dos fatores e recomendações.

## Deal Health Scoring

### Conceito
Cada deal aberto recebe um score de saúde 0-100 (Crítico/Em Risco/Saudável/Excelente) calculado por edge function que pesa: dias no estágio atual vs benchmark, última atividade registrada, número de stakeholders, valor do deal vs ticket médio do vendedor, probabilidade de conversão histórica do estágio. O sistema explica o porquê de cada score com fatores positivos/negativos e sugere a próxima ação.

### Backend
**Migration** — tabela `deal_health_scores`:
- `id`, `deal_id` (FK sales), `score` (0-100), `health` (`critical`|`at_risk`|`healthy`|`excellent`), `factors` (jsonb com breakdown), `recommendation` (text), `calculated_at`
- Índices em `deal_id`, `health`, `calculated_at`
- RLS: vendedor vê apenas seus próprios; gestor/admin vê tudo
- View `deal_health_summary_view`: agrega contagem por health × salesperson + score médio

**Edge function `deal-health-scorer`**:
- Aceita `deal_id` (single) ou `recompute_all=true`
- Para cada deal aberto: busca atividades 30d, idade no estágio, ticket médio do vendedor (90d), benchmark do estágio
- Calcula score ponderado (40% atividade recente, 25% velocidade vs benchmark, 20% engajamento/stakeholders, 15% valor vs ticket)
- Chama Lovable AI (gemini-2.5-flash) APENAS para gerar `recommendation` quando score < 60 (otimização de custo)
- Upsert em `deal_health_scores`

**Cron** (opcional, pg_cron): recompute diário às 6am.

### Frontend (`src/components/deal-intelligence/health/`)
- `DealHealthHub.tsx` (≤300L): hub com 4 KPI cards (count por health), gráfico donut de distribuição, tabela ordenável de deals críticos
- `HealthScoreBadge.tsx`: badge colorido reutilizável (vermelho/laranja/azul/verde)
- `DealHealthCard.tsx`: card por deal com score ring, breakdown de fatores, recomendação IA
- `HealthDistributionChart.tsx`: donut recharts por status de saúde
- `healthHelpers.ts`: classify, color tokens, label maps
- Hook `useDealHealthScores.ts` (React Query) + `useRecomputeDealHealth.ts` (mutation)

### Integração
- Nova tab "Saúde dos Deals" no `RevenueIntelligenceHub`
- `HealthScoreBadge` exibido inline nos cards do Kanban e na lista de Sales

### Arquivos
- Migration: tabela `deal_health_scores` + view + RLS + índices
- Edge: `supabase/functions/deal-health-scorer/index.ts`
- Hooks: 2 em `src/hooks/deal-intelligence/`
- Componentes: 4 em `src/components/deal-intelligence/health/`
- Helpers: `healthHelpers.ts`
- Editar: `RevenueIntelligenceHub.tsx`, card do Kanban (badge inline opcional)

Padrões: semantic tokens, Sora/Inter, framer-motion, skeleton, ≤300L por arquivo, strict TS, recharts tipado, RLS com `has_role`.
