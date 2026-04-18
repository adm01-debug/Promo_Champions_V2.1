
Executar sequencialmente todas as melhorias do top 5 + polimentos da análise exaustiva, em ordem de impacto. Cada item será uma intervenção cirúrgica e completa.

## Roadmap de execução (ordem)

**Já feito:** Sombra sob carros + halo do usuário logado (item #1).

### Próximas iterações

1. **Slipstream + GAP flutuante** (drama competitivo)
   - Novo `LeaderGapIndicator.tsx`: badge SVG flutuante "+X.Xs" entre 1º e 2º quando gap < 5%
   - Novo `SlipstreamLines.tsx`: 3 linhas de vento animadas atrás do líder quando 2º está colado
   - Cálculo de gap baseado em `progress` diff × tempo médio de volta

2. **Rumble strips animados nas curvas** + **xadrez ondulado na largada**
   - Em `TrackAsphalt.tsx`: adicionar `<animate>` no `strokeDashoffset` dos curbs vermelho/branco (movimento sutil)
   - Em `TrackStartGantry.tsx`: já tem shimmer, intensificar ondulação quando `leaderApproaching` prop = true

3. **Exhaust trail + chama no escapamento** (sensação de velocidade)
   - Novo `CarExhaust.tsx`: 2-3 partículas de fumaça contínuas atrás do carro (offset no rotation -180°)
   - Pequena chama SVG `<polygon>` laranja/amarela animada no escape
   - Renderizado dentro do `<motion.g>` de cada carro

4. **Bandeiras agitando + plaquinhas dos torcedores + dirigível**
   - Em `TrackScenery.tsx`: adicionar 4-6 bandeiras `<rect>` com `<animateTransform type="skewX">` nas arquibancadas
   - Modificar cluster de torcedores: 2-3 com plaquinhas coloridas levantadas
   - Novo dirigível `<ellipse>` no céu com translação lenta horizontal (60s loop)

5. **Polimentos finais**
   - `TrackDustParticles`: filtro `<feGaussianBlur stdDeviation="0.8">` nas partículas
   - Countdown visual no HUD: "⏱ Termina em Xd Yh" usando `useWeeklyResetCountdown`
   - Lap counter LED-style no canto inferior da pista

## Estrutura de arquivos

**Novos:**
- `src/components/race/LeaderGapIndicator.tsx`
- `src/components/race/SlipstreamLines.tsx`
- `src/components/race/CarExhaust.tsx`
- `src/components/race/track/TrackBlimp.tsx`
- `src/components/race/RaceCountdownBadge.tsx`

**Editados:**
- `src/components/race/RaceArena.tsx` (montar novos componentes)
- `src/components/race/track/TrackAsphalt.tsx` (rumble strips animados)
- `src/components/race/track/TrackScenery.tsx` (bandeiras + plaquinhas)
- `src/components/race/track/TrackDustParticles.tsx` (blur filter)
- `src/components/race/track/TrackStartGantry.tsx` (xadrez ondulado intensificado)

## Garantias de qualidade

- Tokens semânticos HSL (sem cores hardcoded)
- `pointerEvents="none"` em todos os elementos decorativos
- `aria-hidden` em SVGs decorativos
- Performance: limites de partículas, `useReducedMotion` respeitado
- Arquivos < 200 linhas cada (padrão do projeto)
- Zero erros de console

Execução será sequencial: 1 melhoria → próxima → próxima, sem pausas.
