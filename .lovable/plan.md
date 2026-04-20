

## Módulo Win/Loss Intelligence — Evolução robusta

### Estado atual
Já existem 7 componentes em `src/components/deal-intelligence/winloss/`, hook `useWinLoss.ts`, edge functions `analyze-win-loss` + `mine-win-loss-patterns`, e tabelas `win_loss_analyses`, `win_loss_patterns`, `win_loss_insights`, `competitors_registry`, `competitor_mentions` (todas vazias — só `deal_outcomes` tem 26 registros). Hoje vive como aba dentro de `/deal-intelligence`.

### Objetivo
Promover Win/Loss a **módulo dedicado de classe mundial** com rota própria, filtros avançados, séries temporais, drill-down e benchmarks por vendedor/segmento/origem.

---

## Entregas

### 1. Rota dedicada `/win-loss-intelligence`
- Nova página `src/pages/WinLossIntelligence.tsx` (lazy, com Helmet/SEO).
- Item no sidebar dentro de "Inteligência" + atalho no Cmd+K.
- A aba antiga em `/deal-intelligence` passa a redirecionar via link "Ver módulo completo".

### 2. Cabeçalho com filtros globais (`WinLossFilters.tsx`)
- Período (7/30/90/180/365 dias + custom).
- Vendedor (multi-select).
- Segmento / origem / categoria de produto.
- Faixa de ticket (slider).
- Persistência em URL params + `saved_filters`.

### 3. Banner de KPIs ampliado
Substitui `WinLossSummaryCard` atual com 6 KPIs animados (CountUp + sparkline):
Win Rate · Δ vs período anterior · Ciclo médio Won/Lost · Ticket médio Won · Total deals analisados · Win rate forecast (próx 30d).

### 4. Tendência temporal (`WinLossTrendChart.tsx`)
- Linha dupla (wins/losses) + barra empilhada de motivos por mês.
- Toggle: Mensal / Semanal / Trimestral.
- Tooltip rico com drill-down ao clicar em um ponto.

### 5. Matriz de motivos (heatmap) (`WinLossReasonMatrix.tsx`)
- Eixos: motivo × estágio (ou motivo × segmento).
- Cor = frequência; tooltip = win rate + ticket médio.

### 6. Comparativo por vendedor (`SalespersonWinLossTable.tsx`)
Tabela ordenável: vendedor · win rate · ciclo médio · ticket médio · top motivo win · top motivo loss · top concorrente. Linha do top performer destacada como benchmark.

### 7. Análise competitiva expandida (`CompetitorBattleCard.tsx`)
Substitui a tabela atual: card por concorrente com win rate contra ele, ticket médio perdido, motivos recorrentes e botão "Ver battle card" (`competitors_registry.default_battle_card_id`).

### 8. Drill-down de deals (`WinLossDealsDrawer.tsx`)
Drawer lateral abre ao clicar em qualquer KPI/barra/célula: lista de deals filtrados, sentimento da última conversa (join `conversation_insights_summary`), link para timeline do cliente.

### 9. Insights acionáveis aprimorados
`WinLossInsightsPanel` ganha:
- Filtro por severidade (info/oportunidade/risco).
- Botão "Marcar como aplicado" (nova coluna `applied_at` em `win_loss_insights`).
- Badge "novo" para insights < 7 dias.
- Botão "Gerar plano de ação" → abre próxima call-to-action no Copilot.

### 10. Auto-refresh + telemetria
- Realtime subscription nas 3 tabelas (`win_loss_analyses/patterns/insights`).
- Botão "Analisar" mostra progresso real (toast com counter).
- Cron diário sugerido via `pg_cron` chamando as 2 edge functions (migration).

### 11. Seed de demo (mocks)
Seed em `win_loss_analyses` (40 linhas baseadas nos 26 `deal_outcomes` reais + 14 sintéticos) e `competitors_registry` (5 concorrentes) para o módulo nascer "vivo". Marcados com prefixo `MOCK-WL-*`.

### 12. Documentação
- `mem://features/win-loss-intelligence-module` (novo).
- Atualizar `mem://analytics/sales-performance-analytics` e `mem://index.md`.

---

## Detalhes técnicos

**Arquivos novos**
```
src/pages/WinLossIntelligence.tsx
src/components/win-loss/
  WinLossFilters.tsx
  WinLossKpiBanner.tsx
  WinLossTrendChart.tsx
  WinLossReasonMatrix.tsx
  SalespersonWinLossTable.tsx
  CompetitorBattleCard.tsx
  WinLossDealsDrawer.tsx
  winLossFiltersHelpers.ts
src/hooks/win-loss/
  useWinLossFilters.ts
  useWinLossTrend.ts
  useWinLossBySalesperson.ts
  useCompetitorBattle.ts
  useWinLossRealtime.ts
```

**Arquivos modificados**
- `src/routes/lazyPages.ts` + `AppRoutes.tsx`: nova rota.
- `src/components/sidebar/*` ou `navigation`: novo item.
- `src/hooks/deal-intelligence/useWinLoss.ts`: aceitar filtros (período/vendedor/segmento).
- `src/pages/DealIntelligence.tsx`: aba Win/Loss vira teaser com botão "Abrir módulo completo".

**Migrations**
1. `ALTER TABLE win_loss_insights ADD COLUMN applied_at timestamptz, applied_by uuid`.
2. RLS policies + índices em `(analyzed_at)`, `(outcome, segment)`, `(competitor)`.
3. Seed `MOCK-WL-*` (insert tool).
4. (Opcional) cron diário `analyze-win-loss` 03:00 + `mine-win-loss-patterns` 04:00.

**Padrões mantidos**
Tokens semânticos, Sora/Inter, ≤400 linhas/arquivo, TS strict, Framer Motion, react-helmet-async, RLS, zero warnings, useReducedMotion.

**Sem impacto** em outros módulos — apenas novos artefatos + um teaser no `/deal-intelligence`.

### Ordem de execução
1. Migrations (schema + seed)
2. Hooks de filtros/trend/salesperson/competitor/realtime
3. Página + rota + sidebar
4. Componentes na ordem da seção "Entregas"
5. Atualização do teaser em DealIntelligence
6. Documentação
7. Teste E2E final

