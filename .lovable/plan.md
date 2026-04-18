
Próxima: **Melhoria #10/20 — Predictive Ranking IA** (projeção de posição final da season).

## Problema
O leaderboard mostra apenas a posição atual. Pilotos não conseguem visualizar a tendência: "estou subindo ou caindo?" e "onde vou terminar se mantiver esse ritmo?". Falta um sinal preditivo que crie urgência estratégica.

## Solução
Calcular projeção linear da posição final de cada piloto com base no ritmo atual (vendas/dia desde início da season) versus dias restantes, e exibir um indicador de tendência (▲▼─) ao lado do rank.

### Hook `useRacePredictions.ts` (~120L) em `src/hooks/race/`
- Recebe `entries: RaceLeaderboardEntry[]` + `season: { start_date, end_date }`
- Para cada piloto: calcula `paceDaily = total_sales / daysElapsed`
- Projeta `projectedTotal = total_sales + (paceDaily * daysRemaining)`
- Re-ranqueia entries pela projeção → `projectedRank`
- Retorna `Map<salesperson_id, { projectedRank, projectedTotal, trend: 'up' | 'down' | 'stable', deltaRanks }>`
- `useMemo` pesado, recalcula só quando entries/season mudam

### Componente `PredictedRankBadge.tsx` (~80L) em `src/components/race/`
- Pequeno badge inline: ícone `TrendingUp` (success) / `TrendingDown` (destructive) / `Minus` (muted)
- Tooltip com texto: "Projeção: P{projectedRank} ({±N posições)" e "Ritmo: R$ X/dia"
- Animação sutil ao mudar tendência

### Integração
- `RaceLeaderboardSidebar.tsx`: consumir hook e renderizar badge ao lado do rank de cada item
- `NextGoalPanel.tsx`: adicionar linha "Projeção final: P{n}" quando dados disponíveis
- Exportar em `src/components/race/index.ts`

### Arquivos
- **Criar**: `src/hooks/race/useRacePredictions.ts`, `src/components/race/PredictedRankBadge.tsx`
- **Editar**: `src/components/race/RaceLeaderboardSidebar.tsx`, `src/components/race/NextGoalPanel.tsx`, `src/components/race/index.ts`

### Padrões
Semantic tokens, Sora/Inter, ≤200L, strict TS, `useMemo` no hook, Tooltip do shadcn, sem cores hardcoded.

### Próximas (preview)
#11 Confetti em P1 → #12 Sound effects polish → #13 Pit Stop tactical pause → ... até #20.
