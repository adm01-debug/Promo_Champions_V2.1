

## Win/Loss Intelligence — Fase 3: Excelência absoluta (10 melhorias finais)

Módulo já completo (rota, filtros, KPIs, drill-down, atalhos, export, skeletons, empty state, SEO, docs). Agora elevar do 9.5/10 atual para **10/10 absoluto** com refinamentos de profundidade.

---

### #1 — Comparativo período anterior (Δ vs. anterior)
KPIs ganham delta real comparando período atual vs. janela equivalente anterior. Setas ▲▼ coloridas + tooltip "vs. últimos N dias".

### #2 — Forecast IA da próxima janela
Card no banner com projeção de Win Rate dos próximos 14/30 dias usando regressão linear sobre os últimos 8 períodos. Badge "IA" + intervalo de confiança.

### #3 — Sentimento da última conversa no drawer
`WinLossDealsDrawer` faz join com `conversation_insights_summary` (se existir) e mostra emoji + score por deal. Link "Ver timeline" para a página do cliente.

### #4 — Top 3 Insights destacados
`ActionableInsightsPanel` ganha seção "Pin do dia" no topo com os 3 insights de maior impacto/severidade, cards expandidos com CTA "Gerar plano de ação" → Copilot.

### #5 — Compare Mode (vendedor vs. vendedor)
Botão "Comparar" na `SalespersonWinLossTable` permite selecionar até 3 vendedores e abrir modal lado-a-lado com radar chart (win rate, ciclo, ticket, motivo top).

### #6 — Histórico de execuções de análise
Painel colapsável "Última análise" mostrando quando rodou pela última vez, deals processados, padrões encontrados (lê `win_loss_analyses.analyzed_at` mais recente).

### #7 — Saved Views (filtros salvos)
Botão "Salvar visão" persiste combinação atual em `saved_filters` (tabela já existe). Dropdown "Minhas visões" carrega presets. Suporta default por usuário.

### #8 — Battle card modal completo
Clique em "Ver battle card" no `CompetitorBattleCard` abre modal full-screen com: pontos fortes/fracos, objeções comuns, scripts de resposta, win rate histórico, casos perdidos recentes.

### #9 — Print/PDF executivo
Botão "Imprimir relatório" no header → layout otimizado para impressão (A4, sem sidebar/header, KPIs + charts + top insights). Window.print() + CSS @media print.

### #10 — Telemetria + a11y audit
- Track `winloss_view`, `winloss_drill`, `winloss_export`, `winloss_run` via `analytics`.
- Audit ARIA: roles, labels, focus trap no drawer/modal, navegação por teclado em todas as tabelas.
- Anúncios via `aria-live` para mudanças de filtro e conclusão de análise.

---

### Detalhes técnicos

**Arquivos novos**
```
src/hooks/win-loss/usePreviousPeriodKpis.ts
src/hooks/win-loss/useWinLossForecast.ts
src/hooks/win-loss/useWinLossSavedViews.ts
src/hooks/win-loss/useWinLossTelemetry.ts
src/components/win-loss/WinLossKpiDelta.tsx
src/components/win-loss/WinLossLastRunCard.tsx
src/components/win-loss/WinLossSavedViews.tsx
src/components/win-loss/WinLossCompareModal.tsx
src/components/win-loss/CompetitorBattleCardModal.tsx
src/components/win-loss/WinLossPrintLayout.tsx
src/components/win-loss/InsightPinCard.tsx
src/styles/winloss-print.css
```

**Arquivos modificados**
- `WinLossKpiBanner.tsx` — integra delta + forecast.
- `WinLossDealsDrawer.tsx` — join sentimento + link timeline.
- `ActionableInsightsPanel.tsx` — seção Pin do dia + CTA Copilot.
- `SalespersonWinLossTable.tsx` — checkboxes de comparação + botão "Comparar".
- `CompetitorBattleCard.tsx` — botão abre modal completo.
- `WinLossPageHeader.tsx` — botões Imprimir, Salvar visão, dropdown visões.
- `WinLossIntelligence.tsx` — orquestra todos os novos componentes.

**Sem migrations** — usa `saved_filters` e `conversation_insights_summary` existentes; insights/analyses já têm colunas necessárias.

**Padrões mantidos**: tokens semânticos · Sora/Inter · ≤400 linhas · TS strict · Framer Motion + `useReducedMotion` · zero warnings · RLS preservada · react-helmet-async.

### Ordem de execução (sequencial, sem perguntas)
1. #1 Delta período anterior
2. #2 Forecast IA
3. #3 Sentimento no drawer
4. #4 Pin de insights
5. #5 Compare mode
6. #6 Última execução
7. #7 Saved Views
8. #8 Battle card modal
9. #9 Print/PDF
10. #10 Telemetria + a11y
11. Build check + relatório 10/10

