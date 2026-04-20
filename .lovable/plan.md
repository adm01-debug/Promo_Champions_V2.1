

## Win/Loss Intelligence — Fase 2: Polimento até 10/10

Módulo já entregue com fundação sólida (rota, hooks, 8 componentes, migration + seeds). Agora elevar a "classe mundial" com 10 melhorias sequenciais.

---

### #1 — SEO + Helmet na página
Adicionar `<Helmet>` com title, description, canonical e OG em `WinLossIntelligence.tsx` (padrão do projeto via react-helmet-async).

### #2 — Skeleton loaders premium
Substituir "Carregando…" por skeletons animados em KPI Banner, Trend Chart, Reason Matrix, Salesperson Table e Competitor Cards. Padrão `animate-pulse` + `useReducedMotion`.

### #3 — Empty states ilustrados
Quando `analyses.length === 0`, exibir banner único com ícone, copy ("Nenhuma análise no período"), CTA "Ajustar filtros" + "Rodar análise agora" (chama edge `analyze-win-loss`).

### #4 — Drill-down clicável em todos os charts
- Clique em barra do TrendChart → abre `WinLossDealsDrawer` filtrado por período.
- Clique em célula do ReasonMatrix → abre drawer filtrado por motivo+estágio.
- Clique em CompetitorBattleCard → drawer filtrado por concorrente.
- Clique em linha do SalespersonTable → drawer filtrado por vendedor.

### #5 — Botão "Rodar análise agora" + toast com progresso
Header da página ganha botão `Sparkles` → invoca `analyze-win-loss` + `mine-win-loss-patterns` em paralelo, mostra toast com counter, invalida queries ao terminar.

### #6 — Marcar insight como aplicado
`ActionableInsightsPanel`: botão "✓ Aplicado" grava `applied_at`/`applied_by` (colunas já existentes). Badge "Novo" para `created_at < 7d`. Filtro por severidade (info/warn/danger).

### #7 — Export CSV dos deals filtrados
Botão no header → gera CSV com outcome, valor, ciclo, motivo, concorrente, vendedor, segmento. Reutiliza padrão de `quote-cadence-module`.

### #8 — Keyboard shortcuts
- `Ctrl+E` → export CSV
- `Ctrl+R` → rodar análise
- `Escape` → fecha drawer
- Hook `useWinLossShortcuts.ts` (ignora inputs).

### #9 — Mobile responsivo + safe-area
KPI Banner em 2×3 no mobile, charts stacked, drawer `max-h-[85vh]`, filtros colapsáveis, snap-x opcional nas competitor cards.

### #10 — Documentação + memória
- `mem://features/win-loss-intelligence-module` (novo).
- Atualizar `mem://analytics/sales-performance-analytics` referenciando rota dedicada.
- Atualizar `mem://index.md`.

---

### Detalhes técnicos

**Arquivos novos**
```
src/hooks/win-loss/useWinLossShortcuts.ts
src/hooks/win-loss/useWinLossExport.ts
src/hooks/win-loss/useRunWinLossAnalysis.ts
src/components/win-loss/WinLossEmptyState.tsx
src/components/win-loss/WinLossSkeletons.tsx
src/components/win-loss/WinLossPageHeader.tsx
```

**Arquivos modificados**
- `src/pages/WinLossIntelligence.tsx` (Helmet, header com botões, integração drill-down)
- `WinLossKpiBanner.tsx`, `WinLossTrendChart.tsx`, `WinLossReasonMatrix.tsx`, `SalespersonWinLossTable.tsx`, `CompetitorBattleCard.tsx`, `ActionableInsightsPanel.tsx` (drill-down + skeletons)
- `WinLossDealsDrawer.tsx` (aceita filtros adicionais: período/motivo/estágio/concorrente/vendedor)

**Padrões mantidos**
Tokens semânticos · Sora/Inter · ≤400 linhas/arquivo · TS strict · Framer Motion + `useReducedMotion` · react-helmet-async · zero warnings · RLS preservada.

**Sem mutações destrutivas.** Apenas leitura adicional + 2 colunas de update controlado em `win_loss_insights` (já existem).

### Ordem de execução (sequencial, sem perguntas)
1. #1 SEO/Helmet
2. #2 Skeletons
3. #3 Empty state
4. #4 Drill-down universal
5. #5 Run analysis + toast
6. #6 Insights aplicados + filtros
7. #7 Export CSV
8. #8 Keyboard shortcuts
9. #9 Mobile responsivo
10. #10 Documentação
11. Teste E2E final + relatório 10/10

