
**Objetivo:** Aumentar tamanho e contraste do badge P1/P2/P3 sobre os carros na pista.

**Localização:** `src/components/race/RaceCar.tsx` linhas 499–520 (bloco "Rank badge").

**Estado atual:**
- Círculo `r=6.5`, fonte `7.5`, posicionado à direita do carro (`xPos = bodyW/2 + 8`, `y = -bodyH/2 - 6`).
- Cores OK (gold/silver/bronze) mas pequenas e sem contorno escuro — somem sobre asfalto cinza.
- Sem prefixo "P", apenas o número.

**Mudanças propostas (apenas SVG, sem nova lógica):**

1. **Maior**: `r` 6.5 → **11**; fonte 7.5 → **11**.
2. **Reposicionar centralizado acima do carro** (mais visível durante corrida): `xPos = 0` (em vez de à direita), `y = -bodyH/2 - 14`.
3. **Contraste duplo (halo escuro + anel branco)**:
   - Sombra/halo: `<circle r=12.5 fill="hsl(0 0% 0% / 0.55)" />` atrás do badge.
   - Anel externo branco: `strokeWidth` 1.2 → **2.2**.
   - Top-3 ganham segundo anel da própria cor (gold/silver/bronze) com leve glow via `filter="url(#glow)"` se já existir, senão usar `drop-shadow` CSS.
4. **Prefixo "P"** para clareza semântica (P1, P2, P3, P4…) — fonte black, `letter-spacing: -0.02em` para caber.
5. **Pulse contínuo só para o líder (P1)**: animar `scale: [1, 1.08, 1]` em loop 1.6s para chamar atenção. Demais ranks mantêm o pop inicial atual.
6. **Fundo do número (top-3)**: manter cor da medalha. **P4+**: trocar `hsl(var(--muted))` por `hsl(0 0% 15%)` com texto branco — muito mais legível que o cinza atual.

**Arquivo único editado:** `src/components/race/RaceCar.tsx` (apenas o bloco linhas 499–520).

**Sem impacto em:** `RankBadge.tsx` (usado nos painéis laterais — já está bom), leaderboard, hooks, lógica de rank.

**Resultado:** badges visivelmente maiores, centralizados acima do carro, com halo escuro garantindo legibilidade sobre qualquer cor de pista, prefixo "P" e pulso dourado contínuo no líder.
