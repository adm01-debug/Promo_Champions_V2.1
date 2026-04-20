
**Objetivo:** Carro do líder (P1) com pulso dourado contínuo + glow exclusivo, separando-o visualmente dos demais.

**Localização:** `src/components/race/RaceCar.tsx` — componente raiz do carro (root `<g>` ou wrapper SVG).

**Estado atual:**
- Badge P1 já tem pulso dourado (feito no passo anterior).
- Carro em si do líder não tem distinção visual — mesma renderização dos outros.

**Mudanças (apenas em `RaceCar.tsx`):**

1. **Aura dourada pulsante embaixo do carro (P1 only):**
   - Adicionar `<motion.ellipse>` antes do chassi (atrás), `cx=0 cy=bodyH/2+2`, `rx=bodyW*0.7 ry=6`.
   - Fill: `radial-gradient` simulado via `fill="hsl(45 95% 55%)"` com `opacity` animado `[0.25, 0.6, 0.25]` em loop 1.6s (sincronizado com o badge).
   - `filter: blur(4px)` via style para suavizar.

2. **Glow dourado no chassi (P1 only):**
   - Wrapper `<motion.g>` no carro inteiro com `style={{ filter: 'drop-shadow(0 0 8px hsl(45 95% 55% / 0.7)) drop-shadow(0 0 16px hsl(45 95% 55% / 0.4))' }}` quando `rank === 1`.
   - Animar a intensidade do drop-shadow via `animate` em loop (alternar entre 0.5 e 0.9 de opacidade).

3. **Faíscas/partículas douradas atrás (opcional leve):**
   - 3 pequenos `<circle r=1.2>` com `animate={{ x: [-bodyW/2, -bodyW/2-15], opacity: [1, 0] }}` em loop 0.8s, com delay escalonado — simula rastro de brilho.
   - Cor `hsl(45 95% 65%)`.

4. **Coroa dourada flutuante acima do badge P1 (toque premium):**
   - Pequeno path SVG de coroa (~10px) acima do badge `(0, -bodyH/2 - 32)`.
   - `motion` com `y: [0, -2, 0]` em loop 2s — flutuação sutil.

**Sem impacto em:**
- Carros P2+ permanecem idênticos.
- Lógica de leaderboard/rank.
- Performance: animações CSS/SVG nativas, sem re-render React.

**Resultado:** o líder fica imediatamente identificável a 2m de distância da tela — aura dourada pulsando sob o carro, chassi com glow, coroinha flutuando. Estética "F1 race leader" premium.

**Arquivo único:** `src/components/race/RaceCar.tsx`.
