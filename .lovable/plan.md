

## Win/Loss Intelligence — Fase 6: Polimento final, performance e a11y AAA (10 melhorias)

Módulo completo em features. Esta fase eleva qualidade técnica e percepção sensorial ao máximo: performance, acessibilidade AAA, mobile-first, observabilidade e testes.

---

### #1 — Virtualização do `WinLossDealsDrawer`
Listas de 100+ deals lagam. Trocar `map` por `react-window` (`FixedSizeList`) com altura dinâmica para itens expandidos. Mantém scroll suave em qualquer volume.

### #2 — Lazy load do módulo inteiro
`WinLossIntelligence.tsx` é grande (~25 componentes). Garantir `React.lazy` + `Suspense` com skeleton dedicado em `AppRoutes.tsx`. Reduz bundle inicial em ~80kb.

### #3 — Memoização agressiva dos charts
`WinLossTrendChart`, `CycleTimeHistogram`, `LossReasonFlow`, `WinLossCohortHeatmap`, `WinByHourHeatmap` recebem `React.memo` + `useMemo` profundo nos datasets derivados. Evita re-render em cada filtro.

### #4 — Debounce nos filtros
`useWinLossFilters` aplica debounce de 250ms nas mudanças de input/select para evitar re-fetch em cada keystroke. UX mantém feedback instantâneo via estado local.

### #5 — A11y AAA: navegação por teclado completa
- Todos os heatmaps (cohort, win-by-hour) ganham `role="grid"` + setas para navegar células.
- Drawer e modais com `focus-trap` e `Escape` consistente.
- Skip-link "Pular para insights" no topo da página.
- Contrast check: ajustar tons amber/rose se < 4.5:1.

### #6 — Mobile responsivo refinado
- KPI banner: 2 colunas no mobile (atualmente quebra).
- Charts com `ResponsiveContainer` + altura adaptativa.
- Drawer ocupa 100vw em telas <640px.
- Quick filter chips com scroll horizontal `snap-x` no mobile.

### #7 — Error boundaries por seção
Cada bloco maior (Insights, Charts, Tables) ganha `<ErrorBoundary>` próprio com fallback elegante. Falha em um chart não derruba a página inteira.

### #8 — Loading states unificados
Substituir skeletons soltos por componente `<WinLossSectionSkeleton variant="kpi|chart|table|insight">` reutilizável. Animação `shimmer` consistente em todo o módulo.

### #9 — Telemetria ampliada
`useWinLossTelemetry` ganha eventos: `filter_applied`, `quick_filter_clicked`, `digest_copied`, `view_saved`, `compare_opened`, `script_ab_viewed`, `next_best_clicked`. Permite medir adoção real de cada feature.

### #10 — Testes E2E críticos (Playwright)
3 specs novos em `tests/e2e/win-loss/`:
- `filters.spec.ts` — aplicar filtro, ver KPI mudar, drill-down funciona.
- `insights-flow.spec.ts` — comentar, atribuir, criar tarefa.
- `keyboard.spec.ts` — Ctrl+E exporta, Ctrl+R roda análise, Esc fecha drawer.

---

### Detalhes técnicos

**Arquivos novos**
```
src/components/win-loss/WinLossSectionSkeleton.tsx
src/components/win-loss/WinLossErrorBoundary.tsx
src/components/win-loss/VirtualDealsList.tsx
tests/e2e/win-loss/filters.spec.ts
tests/e2e/win-loss/insights-flow.spec.ts
tests/e2e/win-loss/keyboard.spec.ts
```

**Arquivos modificados**
- `src/routes/AppRoutes.tsx` — confirma `React.lazy` para `/win-loss-intelligence`.
- `src/pages/WinLossIntelligence.tsx` — error boundaries por seção, skip-link, skeleton unificado.
- `src/components/win-loss/WinLossDealsDrawer.tsx` — virtualização via `VirtualDealsList`.
- `src/components/win-loss/WinLossKpiBanner.tsx` — grid responsivo 2 cols mobile.
- `src/components/win-loss/WinLossQuickFilterChips.tsx` — `snap-x` mobile.
- `src/components/win-loss/WinByHourHeatmap.tsx` + `WinLossCohortHeatmap.tsx` — `role="grid"` + arrow keys.
- `src/components/win-loss/WinLossTrendChart.tsx`, `CycleTimeHistogram.tsx`, `LossReasonFlow.tsx` — `React.memo` + `useMemo`.
- `src/hooks/win-loss/useWinLossFilters.ts` — debounce 250ms.
- `src/hooks/win-loss/useWinLossTelemetry.ts` — 7 eventos novos.

**Dependência nova**
`react-window` (≈ 6kb) — única adição.

**Sem migrations · sem novas edge functions · sem secrets adicionais.**

**Padrões mantidos**: tokens semânticos, Sora/Inter, ≤400 linhas, TS strict, Framer Motion + `useReducedMotion`, zero warnings, RLS preservada, react-helmet-async.

### Ordem de execução (sequencial, sem pausas)
1. Lazy load + bundle check
2. Virtualização do drawer
3. Memoização de charts
4. Debounce nos filtros
5. A11y AAA (grid + focus-trap + skip-link)
6. Mobile responsivo refinado
7. Error boundaries por seção
8. Loading skeleton unificado
9. Telemetria ampliada
10. 3 specs E2E Playwright
11. Build check (`tsc --noEmit`) + atualização de memória + relatório 10/10

