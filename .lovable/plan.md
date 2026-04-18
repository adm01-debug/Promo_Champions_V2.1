
Próxima: **Melhoria #5/20 — Painel "Próxima Meta" no sidebar do piloto**.

## Plano

### Problema atual
O `RaceLeaderboardSidebar` mostra ranking com gap em R$, mas falta um destaque motivacional sobre o objetivo imediato do piloto logado.

### Solução
Novo card `NextGoalPanel.tsx` (~180L) em `src/components/race/`, no topo da sidebar:

**Modos dinâmicos** (baseado no piloto logado):
1. **Caçando posição** (não-líder): mostra alvo à frente, gap em R$, % de progresso, barra com gradient `from-primary to-amber`
2. **Defendendo P1** (líder): mostra perseguidor + gap, ícone Crown dourada, mensagem "Defenda a P1"
3. **Meta da temporada** (sempre): % rumo ao `goal_amount` com CountUp, ETA estimado pelo ritmo dos últimos 7 dias

**Visual**: Sora para números grandes, Inter para labels, gradient sutil, pulse motion quando gap <5%, ícones (Target/Crown/TrendingUp/Flag), `aria-live="polite"`.

### Hook auxiliar
`useNextGoal.ts` (~80L) em `src/hooks/race/`:
- Input: `entries`, `currentUserSalespersonId`, `goalAmount`
- Output: `{ mode, target, gapAmount, gapPercent, seasonProgress, eta }`
- Pure + memoizado

### Integração
- `RaceLeaderboardSidebar.tsx`: renderiza `NextGoalPanel` acima do ranking quando há `currentUserSalespersonId`
- `RaceArenaView.tsx`: passa `currentUserSalespersonId` (resolver via `useAuth` + lookup salesperson)
- Exportar em `src/components/race/index.ts`

### Padrões
- Semantic tokens, Sora/Inter, ≤200L, strict TS, `useMemo` no hook, skeleton se piloto fora do leaderboard

### Próximas (preview)
#6 Combo Streak indicator → #7 Mini-podium no header → #8 Histórico de campeões → ... até #20.
