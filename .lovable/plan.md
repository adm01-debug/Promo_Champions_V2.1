
Frente A entregue. Próxima onda: **Frente B (Loop diário 30s)** + **Frente D (Acessibilidade real)** — alto impacto, pouco risco.

## Iterações sequenciais

### 1. Daily Briefing cinemático (5s) 🎬
- `useDailyBriefing.ts`: gera mensagem personalizada com dados existentes (rank atual, gap líder, streak, próximo objetivo, melhor janela horária heurística baseada em activities por hora).
- `DailyBriefingModal.tsx`: overlay full-screen com 4 slides animados (saudação → posição → janela ouro → CTA), auto-dismiss em 5s, "skip" disponível. Mostrado 1x/dia (localStorage `briefing_last_shown`).
- Integrado em `RaceArenaHub` no mount.

### 2. "1 ação sugerida" sticky 🎯
- `NextRaceActionCard.tsx`: card compacto top-right do Hub com a próxima jogada (lead mais quente do pipeline + CTA "Trabalhar agora"). Reusa `useNextBestAction` existente.
- Persistente até clicado/dispensado; reaparece após nova season.

### 3. Streak proeminente no Briefing 🔥
- Slide dedicado no Briefing: "🔥 Você acendeu o motor 12 dias seguidos" com chama animada proporcional (3+ dias = laranja, 7+ = vermelha, 30+ = azul plasma).
- Reusa `useStreak` existente.

### 4. Modo Calm ♿
- Toggle persistente em `RaceAudioPreferences` (renomear para `RaceAccessibilityPreferences`): "Modo Calm" desliga partículas, screen-shake, fireworks, neon trails, exhaust chamas. Mantém toda informação.
- Provider `RaceCalmContext` consumido pelos componentes decorativos via hook `useCalmMode()`.

### 5. Hierarquia sem cor (forma + ícone por rank) 🏆
- `RankBadge.tsx`: P1 = Crown, P2 = Trophy, P3 = Medal, P4-10 = número em hexágono. Substitui dependência de cor pura nos leaderboards e timing tower.
- Integra em `RaceArena` Live Timing tower e `LeaderboardSidebar`.

### 6. Densidade adaptativa anti-fadiga 🧘
- `useSessionDuration.ts`: track tempo na arena. Após 10min contínuos, automaticamente reduz: desliga commentary loop, baixa intensidade de animações, mostra toast sutil "Modo descanso ativado — recarregue você também ☕".

## Arquivos

**Novos:**
- `src/hooks/race/useDailyBriefing.ts`
- `src/hooks/race/useCalmMode.ts`
- `src/hooks/race/useSessionDuration.ts`
- `src/contexts/RaceCalmContext.tsx`
- `src/components/race/DailyBriefingModal.tsx`
- `src/components/race/NextRaceActionCard.tsx`
- `src/components/race/RankBadge.tsx`

**Editados:**
- `src/pages/RaceArenaHub.tsx` (montar Briefing + ActionCard + provider Calm + session tracking)
- `src/components/race/RaceAudioPreferences.tsx` → renomear conceito + add toggle Calm
- `src/components/race/RaceArena.tsx` (consumir `useCalmMode`, integrar `RankBadge` na timing tower)
- `src/components/race/LeaderboardSidebar.tsx` (usar `RankBadge`)
- `src/index.css` (keyframes briefing-slide, flame-pulse-strong)

## Garantias
Tokens HSL · `useReducedMotion` respeitado · Briefing skipável e 1x/dia · arquivos < 200 linhas · zero erros de console · retrocompatível · `RankBadge` com `aria-label` semântico.
