
**Objetivo:** Pílula com nome do piloto acima do carro ganha fundo na cor primária do preset do carro (livery), criando vínculo visual imediato.

**Investigação:** Preciso localizar onde o nome do piloto é renderizado acima do carro em `RaceCar.tsx` e confirmar o acesso à `primary_color` do preset.

**Mudanças (apenas `src/components/race/RaceCar.tsx`):**

1. **Pílula do nome** (atualmente provavelmente fundo escuro neutro):
   - `fill={primaryColor}` no `<rect>` da pílula.
   - `stroke="hsl(0 0% 100% / 0.85)"` `strokeWidth={1.2}` para destacar sobre a pista.
   - `rx={6}` para cantos arredondados.

2. **Cor do texto adaptativa** (contraste WCAG):
   - Helper `getReadableTextColor(hex)` que calcula luminância YIQ:
     - `(r*299 + g*587 + b*114) / 1000 >= 140` → texto preto `hsl(0 0% 8%)`
     - Caso contrário → texto branco `hsl(0 0% 98%)`
   - Garante leitura tanto em liveries claras (amarelo, branco) quanto escuras (preto, navy).

3. **Halo sutil** atrás da pílula: `<rect>` com mesma forma + 1.5px maior, `fill="hsl(0 0% 0% / 0.35)"` `filter="blur(2px)"` — mantém legibilidade sobre asfalto.

4. **Sem impacto** em: badge P1/P2/P3 (mantém medalha), aura dourada do líder, lógica de leaderboard, demais carros.

**Resultado:** olhando a pista, cada nome "vibra" na mesma cor do carro — vínculo visual instantâneo nome ↔ livery.
