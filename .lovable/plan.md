
**Objetivo:** Remover número fixo do carro; mostrar apenas o RANK (posição na corrida) com destaque visual.

**Investigação rápida:**
- `RaceCar` aceita prop `number` que renderiza o número no chassi
- Componentes que renderizam carros na pista: `RaceCarOnTrack` (provável), `GhostCar`, `RaceGhostDemo`, `CarPresetCard`, `CarCustomizer`
- Leaderboard já calcula `rank` (1..N) em `useRaceLeaderboard`

**Plano:**

1. **`RaceCar.tsx`** — tornar `number` opcional. Quando ausente/null, não renderizar o numeral no chassi (manter o círculo limpo ou remover o círculo do número).

2. **Componentes na pista (corrida ao vivo)** — onde os carros dos vendedores aparecem correndo:
   - Não passar mais `number={car_number}` para `<RaceCar>`.
   - Adicionar um **badge de RANK** flutuante acima do carro (ex: `P1`, `P2`, `P3`…) com:
     - Visual destacado: círculo dourado para P1, prata P2, bronze P3, neutro demais
     - Fonte bold, contorno para legibilidade sobre a pista
     - Posicionado acima do nome/avatar do piloto

3. **`GhostCar.tsx`** — já usa `number={0}`; trocar para sem número (carro fantasma também sem numeral).

4. **`RaceGhostDemo.tsx`** — demo: remover números (carros limpos, apenas livery).

5. **MANTER número** em:
   - `CarPresetCard` (preview de seleção) — usuário ainda escolhe número customizado? → Decisão: manter input mas o número **não aparece mais na pista**. Apenas no customizer como referência interna / histórico. *Alternativa: remover totalmente o input "Número 1-99" do `CarCustomizer`.*
   - **Decisão proposta:** remover também o input de número do `CarCustomizer` (já que nunca mais aparecerá em lugar nenhum visualmente). Simplifica UX.

**Arquivos a editar:**
- `src/components/race/RaceCar.tsx` — number opcional
- `src/components/race/RaceCarOnTrack.tsx` (ou equivalente que renderiza carros vivos) — adicionar badge de rank, remover number
- `src/components/race/GhostCar.tsx` — remover number
- `src/components/race/RaceGhostDemo.tsx` — remover number do demo
- `src/components/race/CarCustomizer.tsx` — remover input de número
- `src/components/race/CarPresetCard.tsx` — remover prop carNumber/preview sem número

**Badge de Rank (novo elemento SVG sobre o carro):**
```
<g transform="translate(0,-36)">
  <circle r="11" fill={rankColor} stroke="hsl(var(--background))" strokeWidth="2"/>
  <text textAnchor="middle" dy="4" fontSize="12" fontWeight="900" fill="white">P{rank}</text>
</g>
```
- P1: gold `hsl(var(--rank-gold))`
- P2: silver `#C0C0C0`
- P3: bronze `#CD7F32`
- P4+: `hsl(var(--muted))`

**Resultado esperado:** carros limpos sem o "7", "11", "23" no chassi. Em vez disso, um badge "P1/P2/P3…" acima do carro indicando posição em tempo real na corrida — atualizado dinamicamente conforme leaderboard muda.
