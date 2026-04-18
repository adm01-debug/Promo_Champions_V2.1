
Próxima: **Melhoria #15/20 — Ghost Car (PR Pessoal)** (carro fantasma com seu melhor ritmo histórico).

## Problema
Não há comparação contra você mesmo. Falta o "PR pessoal" — o ritmo da sua melhor season, renderizado como referência translúcida na pista. Sem isso, não dá pra saber se hoje você está acima ou abaixo do seu próprio teto.

## Solução
Calcular o ritmo histórico do usuário (melhor progresso por % de tempo decorrido em seasons anteriores) e renderizar um carro fantasma semi-transparente na pista, junto com badge de status ("+12% acima do seu PR" / "-5% abaixo").

### Hook `useGhostCar.ts` (~120L) em `src/hooks/race/`
- Recebe `{ mySalespersonId, currentSeason, leaderboard }`
- Query Supabase: busca seasons anteriores do usuário (`race_seasons` finalizadas) + snapshots de progresso histórico (usa `race_leaderboard_entries` ou agregação de `race_events`)
- `useMemo` calcula:
  - `bestPaceProgress`: melhor progresso registrado na mesma % de tempo decorrido da season atual
  - `ghostProgress`: onde o ghost estaria agora
  - `myProgress`: progresso atual do usuário
  - `delta`: diferença em pp (percentage points)
  - `status`: 'ahead' | 'behind' | 'tied' | 'no-data'
- Pure, com fallback gracioso quando não há histórico

### Componente `GhostCar.tsx` (~80L) em `src/components/race/`
- Reutiliza `RaceCar` com opacity 0.35 e filtro grayscale
- Renderiza apenas se `status !== 'no-data'`
- Posicionado via `getPositionOnTrack(ghostProgress, lane específica)`
- Pequeno emoji 👻 acima do carro

### Componente `GhostStatusBadge.tsx` (~60L) em `src/components/race/`
- Badge no header: "👻 +12% vs PR" (verde) ou "-5% vs PR" (amber)
- Tooltip explicando o que é o ghost
- Hidden quando `status === 'no-data'`

### Integração
- `RaceArenaView.tsx`: instancia hook, passa ghost como `overlayChildren` adicional para `RaceArena`, badge no header actions
- `RaceArena.tsx`: nenhuma mudança (ghost vem via overlayChildren)

### Arquivos
- **Criar**: `src/hooks/race/useGhostCar.ts`, `src/components/race/GhostCar.tsx`, `src/components/race/GhostStatusBadge.tsx`
- **Editar**: `src/pages/RaceArenaView.tsx`, `src/components/race/index.ts`

### Padrões
Semantic tokens, Sora/Inter, ≤200L por arquivo, strict TS, `useMemo` no hook, fallback gracioso, opacity reduzida no ghost, sem cores hardcoded.

### Próximas (preview)
#16 Replay da season → #17 Voice celebrations → #18 Heatmap de overtakes → ... até #20.
