

## Win/Loss Intelligence — Fase 5 (conclusão): fechar os 3 itens restantes + build check

Fase 5 já tem migration aplicada, 8 hooks, 8 componentes novos, edge function `notify-critical-pattern` e `ActionableInsightsPanel` modernizado (comentários, atribuição, criar tarefa, pin, explicação IA). Faltam 3 integrações + verificação final.

---

### #1 — Score do vendedor na `SalespersonWinLossTable`
- Aplicar `useWinLossSalespersonScore(stats)` para derivar score 0-100 + tier (Bronze/Prata/Ouro/Diamante).
- Adicionar coluna **"Score"** com `<SalespersonScoreBadge />` (já criado).
- Adicionar checkboxes de seleção (até 3) e botão **"Comparar"** que abre `WinLossCompareModal` (já existente).
- Persistir seleção em estado local; desabilitar checkbox quando 3 já selecionados.

### #2 — Timeline expandível no `WinLossDealsDrawer`
- Cada linha de deal ganha botão chevron para expandir.
- Ao expandir, renderiza `<DealTimelineExpand saleId={deal.id} />` (já criado, usa `useDealTimeline`).
- Estado `expandedIds: Set<string>` controla quais estão abertos.
- Animação `AnimatePresence` com `useReducedMotion` guard.

### #3 — Orquestração no `WinLossIntelligence.tsx`
Adicionar 4 componentes novos na página, em ordem visual coerente:
- `<NextBestWinLossCard />` — logo após o `WinLossKpiBanner` (chamada para ação imediata).
- `<InsightsImpactPanel />` — dentro da seção de insights, ao lado do `ActionableInsightsPanel`.
- `<WinByHourHeatmap />` — nova grid junto aos charts existentes (cohort/cycle/loss-flow).
- `<ScriptABPanel />` — abaixo do `CompetitorBattleCard`, fechando o bloco de "abordagens".

### #4 — Build check final
- Rodar `tsc --noEmit` para garantir zero erros.
- Verificar console (zero warnings esperados).
- Atualizar memória `mem://features/win-loss-intelligence-module` com: comentários, atribuição, tarefas, score badge, timeline expand, next best, impact, win-by-hour, script A/B, notify-critical-pattern.
- Confirmar que as 3 integrações respeitam `≤400 linhas`, tokens semânticos, Sora/Inter, Framer Motion + `useReducedMotion`.

---

### Detalhes técnicos

**Arquivos modificados (3)**
- `src/components/win-loss/SalespersonWinLossTable.tsx` — coluna Score + checkboxes + botão Comparar.
- `src/components/win-loss/WinLossDealsDrawer.tsx` — chevron + expansão de timeline por deal.
- `src/pages/WinLossIntelligence.tsx` — orquestração dos 4 novos componentes.

**Sem novas migrations · sem novos hooks/componentes · sem secrets adicionais.**

**Padrões mantidos**: tokens semânticos, Sora/Inter, ≤400 linhas, TS strict, Framer Motion + `useReducedMotion`, zero warnings, RLS preservada.

### Ordem de execução (sequencial, sem pausas)
1. SalespersonWinLossTable — Score + Compare
2. WinLossDealsDrawer — Timeline expand
3. WinLossIntelligence.tsx — orquestração final
4. Build check (`tsc --noEmit`) + atualização de memória + relatório 10/10

