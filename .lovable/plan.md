
# Continuação: Race Arena 10/10 — Etapas 5-10

Sigo de onde parei. Já entreguei 1-4 (spotlight/overtakes, commentary IA, daily check-in, modo TV). Agora as 6 restantes, uma por vez.

## Etapa 5 — Tokens semânticos + Skin engine
- Adicionar `--race-grass`, `--race-asphalt`, `--race-checkered`, `--race-curb`, `--race-pond` em `index.css` (light + dark)
- Substituir `#5fa358` e demais cores hardcoded em `RaceArena.tsx`, `RaceTrack.tsx`, `TrackPond.tsx`, `TrackScenery.tsx`, `TrackBarriers.tsx`, `raceTrackHelpers.ts`
- Variantes do skin engine existente: skin "cyberpunk" → grama roxa neon, "minimal" → cinza, default → verde

## Etapa 6 — Modos de visualização (Imersivo / Competitivo / Análise)
- Componente `RaceViewModeToggle` no header da arena (3 botões inset, padrão view-switcher)
- Hook `useRaceViewMode` com persistência em localStorage
- `RaceArenaView` condiciona visibilidade: Imersivo = pista + leaderboard mínimo; Competitivo = + commentary + feed + podium; Análise = + ScoreBreakdown + PredictedRank

## Etapa 7 — Onboarding inline + demo ghost-race
- `RaceEmptyState` ganha 3 carros animados em loop (reutiliza `RaceCar` + `RaceTrack` em modo demo)
- `RaceOnboardingTour` custom (sem dep externa): array de steps com `position`, render via portal, persiste `seen` no localStorage
- Checklist flutuante `RaceOnboardingChecklist` (4-5 etapas: customizar carro, definir nickname, fechar 1 deal, ver leaderboard)

## Etapa 8 — Rivalidades + Highlights timeline
- View `race_rivalries_view` (SQL): pares com ≥3 trocas de posição via `race_events` tipo `overtake`
- Hook `useRaceRivalries(seasonId)` + componente `RivalryBadge` no leaderboard
- `RaceHighlightsTimeline` lateral: top 5 eventos (maior comeback, ultrapassagem decisiva, líder novo) clicáveis

## Etapa 9 — Garagem + skins desbloqueáveis
- Tabela `race_unlocks` (user_id, unlock_key, unlocked_at) + RPC `unlock_race_item` validando liga atual
- Rota `/race-arena/garage` com 3 abas: Troféus (lifetime), Carros (skins desbloqueadas/bloqueadas), Stats (deals, vendas, posições históricas)
- Estender `CarCustomizer` com decals/neons gateados por liga + campos `nickname` e `victory_quote` em `race_cars`

## Etapa 10 — Acessibilidade + Reactions ao vivo
- Modo daltônico: setting em Configurações → Skins; carros ganham `pattern` SVG (listras/pontos/xadrez) sobreposto à cor
- Reduced motion total: hook `useRaceMotion` que troca interpolação contínua por saltos discretos quando `prefers-reduced-motion`
- `aria-live="polite"` region central anunciando "líder mudou", "season acaba em X"
- Reactions: tabela `race_reactions` (event_id ou car_id, emoji, user_id) + componente `ReactionBar` em cima dos carros + realtime channel
- Aumentar `fontSize` SVG mínimo 11→13

## Padrões em todas
- ≤400 linhas/arquivo, helpers em `*Helpers.ts`
- Tokens semânticos (sem cores hardcoded)
- Framer Motion + haptics + skeleton
- Zero erros de console
- React Query + RLS quando tocar DB
- RPCs SECURITY DEFINER para escritas sensíveis
- Edge functions seguem pattern shared/cors

## Ordem de execução
5 → 6 → 7 → 8 → 9 → 10. Cada etapa = commit completo testável. Sem pausas, sem perguntas. Ao concluir 10, declaro 10/10 e listo todas as 10 entregas.
