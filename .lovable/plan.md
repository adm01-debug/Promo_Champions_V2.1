
Próxima: **Melhoria #14/20 — Weather & Track Conditions** (condições dinâmicas da pista baseadas em momentum coletivo).

## Problema
A pista é sempre igual — não há sinal ambiental que reflita o "clima" coletivo da season. Quando o time está em chamas (muitos deals fechando), nada muda visualmente. Quando está parado, a pista também não comunica isso. Falta um indicador atmosférico que torne o estado da corrida tangível.

## Solução
Calcular condição da pista a partir da atividade recente (deals últimas 2h vs. baseline), traduzir em 4 estados (☀️ Ensolarado / ⛅ Nublado / 🌧️ Chuvoso / ⛈️ Tempestade) e renderizar overlay visual sutil sobre a `RaceTrack` + badge no header.

### Hook `useTrackConditions.ts` (~80L) em `src/hooks/race/`
- Recebe `{ events: RaceEvent[], leaderboard }`
- `useMemo` calcula:
  - `recentDeals`: events tipo `deal_closed` nas últimas 2h
  - `baseline`: média de deals/2h da season
  - `intensity`: ratio recent/baseline
  - `condition`: 'sunny' (≥1.5x) | 'cloudy' (0.7-1.5x) | 'rainy' (0.3-0.7x) | 'storm' (<0.3x)
  - `label`, `emoji`, `description`, `colorToken` por estado
- Pure, zero side effects

### Componente `TrackConditionsBadge.tsx` (~60L) em `src/components/race/`
- Badge compacto com emoji + label + tooltip explicativa
- Pulsa suavemente (framer-motion) — respeita `useReducedMotion`
- Usa semantic tokens (warning/destructive/primary)

### Componente `TrackWeatherOverlay.tsx` (~120L) em `src/components/race/`
- `<div absolute inset-0 pointer-events-none>` sobre a track
- Renderiza efeito por condição:
  - **sunny**: gradient warm sutil (top opacity 0.05)
  - **cloudy**: gradient neutro
  - **rainy**: linhas SVG diagonais animadas (CSS animation)
  - **storm**: linhas mais densas + flash sutil periódico
- Opacity total ≤ 0.15 para não atrapalhar leitura
- Respeita `useReducedMotion` (versão estática)

### Integração
- `RaceArenaView.tsx`: instanciar hook, passar `condition` para `RaceTrack` (nova prop opcional `weatherOverlay?: ReactNode`) e `<TrackConditionsBadge />` no header actions
- `RaceTrack.tsx`: aceitar `weatherOverlay` e renderizar dentro do container da pista

### Arquivos
- **Criar**: `src/hooks/race/useTrackConditions.ts`, `src/components/race/TrackConditionsBadge.tsx`, `src/components/race/TrackWeatherOverlay.tsx`
- **Editar**: `src/pages/RaceArenaView.tsx`, `src/components/race/RaceTrack.tsx` (adicionar prop), `src/components/race/index.ts`

### Padrões
Semantic tokens, Sora/Inter, ≤200L por arquivo, strict TS, `useMemo` no hook, framer-motion com `useReducedMotion`, sem cores hardcoded, overlay com `pointer-events-none`.

### Próximas (preview)
#15 Ghost car (PR pessoal) → #16 Replay da season → #17 Voice celebrations → ... até #20.
