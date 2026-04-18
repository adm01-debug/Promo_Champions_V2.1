
Próxima: **Melhoria #8/20 — Histórico de Campeões Mensais** (Hall da Fama).

## Problema
Não há registro visível dos vencedores de seasons passadas. O reconhecimento dos campeões evapora ao final de cada temporada, eliminando legado e prestígio histórico.

## Solução
Painel "Hall da Fama" expansível com lista cronológica dos campeões de cada season encerrada.

### Hook `useChampionsHistory.ts` (~70L) em `src/hooks/race/`
- Query Supabase: `race_seasons` com `status='completed'` ordenadas por `end_date DESC`
- Para cada season: join leve em `race_leaderboard_view` (ou `race_cars` + agregação) → pega top 1
- Retorna `Array<{ seasonId, seasonName, endDate, championName, avatarUrl, totalSales, carNumber, primaryColor, secondaryColor }>`
- `staleTime: 5min` (histórico é estável)

### Componente `ChampionsHistoryPanel.tsx` (~180L) em `src/components/race/`
- Card colapsável (Collapsible do shadcn) com header "🏆 Hall da Fama"
- Lista vertical compacta: cada item mostra avatar com ring dourado, nome do campeão, nome da season, data formatada (`pt-BR`), total em vendas (`fmtCompact`)
- Item do mais recente: highlight com `bg-warning/5 border-warning/30`
- Empty state: "Nenhuma temporada encerrada ainda — seja o primeiro lendário!"
- Skeleton de 3 itens enquanto carrega
- Animação stagger na entrada; respeitar `prefers-reduced-motion`
- A11y: `role="list"`, `aria-label="Campeões de temporadas anteriores"`

### Integração
- Renderizar no Hub `/race-arena` (RaceArenaHub) na coluna lateral ou abaixo dos cards de pista
- Localizar Hub primeiro via `code--search_files` para confirmar arquivo correto

### Arquivos
- **Criar**: `src/hooks/race/useChampionsHistory.ts`, `src/components/race/ChampionsHistoryPanel.tsx`
- **Editar**: Hub da Race Arena (a localizar), `src/components/race/index.ts`

### Padrões
Semantic tokens, Sora/Inter, ≤200L, strict TS, React Query memoizado, framer-motion com `useReducedMotion`.

### Próximas (preview)
#9 Highlight Reel de ultrapassagens → #10 Predictive ranking IA → #11 Confetti em P1 → ... até #20.
