
Próxima: **Melhoria #9/20 — Highlight Reel de Ultrapassagens** (replay visual de overtakes recentes).

## Problema
Quando um piloto ultrapassa outro no ranking, o evento é silencioso — só aparece no feed textual. Falta um momento "TV de corrida" que celebre overtakes em tempo real.

## Solução
Toast/banner cinematográfico que dispara quando um overtake é detectado, mostrando os 2 avatares envolvidos com animação de troca de posição.

### Hook `useOvertakeDetector.ts` (~80L) em `src/hooks/race/`
- Recebe `entries: RaceLeaderboardEntry[]` da season ativa
- Mantém ref do snapshot anterior do ranking (Map<salesperson_id, rank>)
- Em cada update, compara: se piloto X subiu ≥1 posição E piloto Y caiu correspondente → registra overtake
- Retorna `{ recentOvertakes: Overtake[] }` (queue com auto-expire 6s) + `dismissOvertake(id)`
- Ignora primeiro snapshot (evita falsos positivos no mount)

### Componente `OvertakeHighlight.tsx` (~150L) em `src/components/race/`
- Banner fixo top-center, z-index alto, max-w-md
- Layout: Avatar overtaker (esquerda, com seta ↗ verde) → ícone "vs" → Avatar overtaken (direita, com seta ↘ vermelho)
- Texto: "{Nome A} ULTRAPASSOU {Nome B}!" em Sora black
- Subtexto: "P{newRank} ← P{oldRank}" tabular-nums
- Animação: entrada slide-down + glow pulse; avatares fazem swap (x: -40 ↔ x: +40) em 0.6s
- Cores das cars (primary_color) como ring nos avatares
- Auto-dismiss em 5s; clique fecha
- Som opcional reutilizando `RaceSoundToggle` state (whoosh)
- Respeita `prefers-reduced-motion`

### Integração
- `RaceArenaView.tsx`: instanciar `useOvertakeDetector(entries)` e renderizar `<OvertakeHighlight overtakes={recentOvertakes} onDismiss={dismissOvertake} />` no nível root
- Empilhar até 2 simultâneos (segundo desce 80px)

### Arquivos
- **Criar**: `src/hooks/race/useOvertakeDetector.ts`, `src/components/race/OvertakeHighlight.tsx`
- **Editar**: `src/pages/RaceArenaView.tsx`, `src/components/race/index.ts`

### Padrões
Semantic tokens, Sora/Inter, ≤200L, strict TS, framer-motion com `useReducedMotion`, AnimatePresence para queue.

### Próximas (preview)
#10 Predictive ranking IA → #11 Confetti em P1 → #12 Sound effects polish → ... até #20.
