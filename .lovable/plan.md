
Próxima: **Melhoria #6/20 — Combo Streak Indicator** (sequência de vendas/dias ativos do piloto).

## Plano

### Problema
Não há feedback visual de "momentum" — quando o piloto está em sequência quente de vendas/dias, isso passa despercebido. Falta gatilho de dopamina.

### Solução
Novo componente `ComboStreakBadge.tsx` (~150L) em `src/components/race/`, exibido no `NextGoalPanel` (canto superior direito) e replicável no `RaceArenaHeader`.

**Lógica do streak**:
- Hook `useRaceStreak.ts` (~90L) em `src/hooks/race/`:
  - Query Supabase: vendas do piloto na temporada (`sales` table filtrada por `salesperson_id` + `created_at` dentro de `season.start_date/end_date`)
  - Agrupa por dia → calcula sequência consecutiva atual de dias com ≥1 venda
  - Retorna `{ streakDays, lastSaleAt, isOnFire (≥3), isLegendary (≥7), salesCount }`
  - Memoizado, `staleTime: 30s`, realtime invalidation via canal `sales` (já existe)

**Visual do badge**:
- Tiers: 🔥 (3-6 dias, accent warning), ⚡ (7-13, gradient warning→destructive), 👑 (14+, gradient destructive→primary com glow pulse)
- Nº grande em Sora black + label "DIAS"
- Motion: pulse contínuo quando `isOnFire`, shimmer sweep quando `isLegendary`
- Sem streak (0-2 dias): mostra dot pequeno cinza com "Comece sua sequência"
- A11y: `aria-label="Sequência de N dias consecutivos"`

### Integração
- `NextGoalPanel.tsx`: receber `salespersonId` e renderizar `<ComboStreakBadge salespersonId={...} seasonStart={...} seasonEnd={...} />` no header (substitui o `P{rank}` simples ou ao lado dele)
- `RaceLeaderboardSidebar.tsx`: passar `season` (start/end) já disponível
- Exportar em `src/components/race/index.ts`

### Arquivos
- **Criar**: `src/hooks/race/useRaceStreak.ts`, `src/components/race/ComboStreakBadge.tsx`
- **Editar**: `src/components/race/NextGoalPanel.tsx`, `src/components/race/RaceLeaderboardSidebar.tsx`, `src/components/race/index.ts`

### Padrões
Semantic tokens, Sora/Inter, ≤200L, strict TS, `useMemo`+React Query, framer-motion respeitando `prefers-reduced-motion`.

### Próximas (preview)
#7 Mini-podium animado no header → #8 Histórico de campeões mensais → #9 Highlight Reel de ultrapassagens → ... até #20.
