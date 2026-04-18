
Próxima: **Melhoria #13/20 — Pit Stop Tactical Pause** (pausa estratégica com insights do coach IA).

## Problema
Pilotos correm sem espaço para reflexão tática. Não há um momento "respira fundo, olha o mapa" — falta uma pausa intencional que mostre: o que já fiz, o que falta, qual a próxima jogada ótima. O resultado é decisão reativa em vez de estratégica.

## Solução
Botão "Pit Stop" no header da arena que abre um Sheet lateral com diagnóstico tático: stats da season até agora, gap pro rival imediato, sugestões acionáveis e um timer visual de 30s simbolizando a pausa estratégica. Som `pitstop` ao abrir.

### Hook `usePitStopAnalysis.ts` (~120L) em `src/hooks/race/`
- Recebe `{ leaderboard, mySalespersonId, season }`
- `useMemo` retorna:
  - `myStats`: total_sales, deals_closed, rank atual, progresso %
  - `nextRival`: piloto à frente (rank − 1) + gap em R$
  - `pace`: vendas/dia atual e necessárias para alcançar próximo rank
  - `recommendation`: string contextual ("Foque em fechar 2 deals para ultrapassar X" / "Mantenha ritmo — você está no pódio")
  - `daysRemaining`: do season
- Pure function, zero side effects

### Componente `PitStopPanel.tsx` (~180L) em `src/components/race/`
- `Sheet` lateral (right) shadcn
- Header: ícone wrench + "Pit Stop Estratégico" + countdown 30s
- Seções:
  1. **Status atual**: card com rank, total, progresso ring
  2. **Próximo alvo**: avatar do rival + gap + vendas necessárias
  3. **Recomendação tática**: alert com `Lightbulb` icon
  4. **Pace check**: comparação ritmo atual vs. necessário (mini barra)
- Botão "Voltar à pista" fecha sheet
- Som `pitstop` no `onOpen`
- Framer-motion stagger nas seções, respeita `useReducedMotion`

### Integração
- `RaceArenaView.tsx`: estado `pitStopOpen`, botão `<Button variant="outline"><Wrench /></Button>` no array de actions do header (antes do sound toggle), instancia o hook e renderiza `<PitStopPanel ... />`

### Arquivos
- **Criar**: `src/hooks/race/usePitStopAnalysis.ts`, `src/components/race/PitStopPanel.tsx`
- **Editar**: `src/pages/RaceArenaView.tsx`, `src/components/race/index.ts`

### Padrões
Semantic tokens, Sora/Inter, ≤200L por arquivo, strict TS, `useMemo` no hook, framer-motion com `useReducedMotion`, sem cores hardcoded, Sheet do shadcn já no projeto.

### Próximas (preview)
#14 Weather/track conditions → #15 Ghost car (PR pessoal) → #16 Replay da season → ... até #20.
