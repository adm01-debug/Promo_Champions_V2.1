
Próxima: **Melhoria #11/20 — Confetti Burst em P1** (celebração ao assumir liderança).

## Problema
Quando um piloto assume P1 da season, não há explosão visual celebrativa. O momento "tomei a liderança!" passa em silêncio — falta o gatilho dopaminérgico que define games competitivos.

## Solução
Disparar burst de confetti no instante em que o usuário logado entra em P1, com cores do carro do piloto e som opcional.

### Hook `useLeaderTakeoverDetector.ts` (~70L) em `src/hooks/race/`
- Recebe `entries: RaceLeaderboardEntry[]` + `currentUserSalespersonId`
- Mantém ref do P1 anterior (`prevLeaderIdRef`)
- Quando `entries[0].salesperson_id === currentUserSalespersonId` E mudou (não era antes) → emite evento `{ id, primaryColor, secondaryColor, timestamp }`
- Ignora primeiro snapshot (evita falso positivo no mount)
- Retorna `{ takeover: TakeoverEvent | null, clear: () => void }`

### Componente `LeaderTakeoverCelebration.tsx` (~120L) em `src/components/race/`
- Usa `canvas-confetti` (já no projeto) ou implementação manual com framer-motion
- Verifica via `code--search_files` se `canvas-confetti` está instalado; se não, usar partículas SVG animadas
- Burst central + 2 laterais com `colors: [primaryColor, secondaryColor, hsl(var(--warning))]`
- Banner overlay 2.5s: "🏆 LIDERANÇA ASSUMIDA!" Sora black + nome do piloto
- Auto-clear após animação; respeita `prefers-reduced-motion` (skip burst, só banner)
- Som opcional via toggle existente (`fanfare` curto)

### Integração
- `RaceArenaView.tsx`: instanciar `useLeaderTakeoverDetector(leaderboard, currentUserSalespersonId)` e renderizar `<LeaderTakeoverCelebration takeover={takeover} onClear={clear} />` no nível root, junto do `OvertakeHighlight`
- Garantir que não conflite visualmente com overtake banner (z-index e posição diferentes — celebração ao centro, overtake top)

### Arquivos
- **Criar**: `src/hooks/race/useLeaderTakeoverDetector.ts`, `src/components/race/LeaderTakeoverCelebration.tsx`
- **Editar**: `src/pages/RaceArenaView.tsx`, `src/components/race/index.ts`

### Padrões
Semantic tokens, Sora/Inter, ≤200L por arquivo, strict TS, framer-motion com `useReducedMotion`, sem cores hardcoded (exceto `primaryColor`/`secondaryColor` do car que são dados dinâmicos).

### Próximas (preview)
#12 Sound effects polish → #13 Pit Stop tactical pause → #14 Weather/track conditions → ... até #20.
