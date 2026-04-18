
Conversation Intelligence entregue (Fase 9/10). Bloco final rumo a 10/10: **Pipeline Health Command Center** — painel executivo unificado que consolida em uma única tela todos os sinais críticos do pipeline com alertas proativos, drill-down e ações rápidas.

## Pipeline Health Command Center (Fase 10/10)

### Conceito
Tela única "modo guerra" para gestor/admin abrir todo dia: status global do pipeline em tempo real combinando Deal Health, Win/Loss, Forecast, Routing, Conversation Intelligence e Coaching. Mostra o que está pegando fogo, o que está em risco e onde agir agora — com 1 clique para drill-down em cada módulo.

### Estrutura

**Header — Pulse Bar**
- Score global de saúde do pipeline (0-100, animado)
- Tendência 7d (sparkline)
- Badge de status: Saudável / Atenção / Crítico

**Grid de KPIs (6 cards)**
- Pipeline Total (R$) + Δ 30d
- Forecast 30d (IA) + confiança
- Deals Críticos (count + valor exposto)
- Win Rate 30d + tendência
- Sentimento médio das conversas
- Capacidade do time (% utilização)

**Coluna esquerda — Critical Alerts Feed**
- Lista priorizada de até 8 alertas IA agregando todos os módulos:
  - Deals com Health Score < 40 e ticket alto
  - Concorrentes ganhando >50% nas últimas semanas (Win/Loss)
  - Vendedores saturados (Routing) ou sem aceitar leads
  - Calls com sentimento negativo recente (Conversation)
  - Forecast caindo > 15% vs ciclo anterior
- Cada alerta: severidade, módulo origem, ação sugerida, botão "Abrir"

**Coluna direita — Quick Actions Panel**
- "Recomputar Health Scores" (chama edge existente)
- "Rotear leads pendentes" (auto-route batch)
- "Gerar forecast atualizado"
- "Analisar últimas calls" (atalho)
- Status de última execução de cada job

**Bottom — Mini Module Drill Cards**
- 4 mini-cards (Health, Win/Loss, Forecast, Routing) com 1 chart compacto e botão "Abrir hub completo"

### Backend
- Sem nova tabela; orquestra dados existentes
- Edge function `pipeline-pulse-aggregator`: agrega em paralelo (Promise.all) métricas de `deal_health_scores`, `win_loss_summary_view`, `revenue_forecast_view`, `routing_performance_view`, `conversation_insights_summary` → retorna payload único `{ pulse_score, kpis, alerts, trends }`
- Cálculo do `pulse_score` no servidor: média ponderada (Health 30% + Forecast 25% + Win Rate 20% + Routing 15% + Sentiment 10%)

### Frontend (`src/components/pipeline-pulse/`)
- `PipelinePulseHub.tsx` (≤300L): orquestrador com header + grid + colunas
- `PulseScoreHeader.tsx`: gauge animado com score global + sparkline
- `PulseKpiGrid.tsx`: 6 KPI cards memoizados
- `CriticalAlertsFeed.tsx`: feed priorizado com filtro por módulo
- `QuickActionsPanel.tsx`: ações com loading states e timestamp da última run
- `ModuleDrillCards.tsx`: 4 mini-cards de navegação rápida
- `pulseHelpers.ts`: score classifier, alert severity sorter, color tokens
- Hooks: `usePipelinePulse.ts` (query agregada), `useQuickAction.ts` (mutation genérica)

### Integração
- Nova rota `/comando` (ou tab "Comando" no `RevenueIntelligenceHub`)
- Card resumo "Pulso do Pipeline" no Dashboard executivo (chip de score + 3 alertas top)
- Atalho no menu Admin

### Arquivos
- Edge: `supabase/functions/pipeline-pulse-aggregator/index.ts`
- Hooks: 2 em `src/hooks/pipeline-pulse/`
- Componentes: 6 em `src/components/pipeline-pulse/`
- Helpers: `pulseHelpers.ts`
- Editar: `RevenueIntelligenceHub.tsx` (nova tab "Comando" como primeira)

Padrões: semantic tokens, Sora/Inter, framer-motion, skeleton, ≤300L, strict TS, recharts tipado, agregação server-side em paralelo.
