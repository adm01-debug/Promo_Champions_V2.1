
Expandir o catálogo de carros de corrida de 12 cores + 3 estilos para 20 presets visuais distintos (combinação modelo+cor+tema), incluindo 3 temas LGBT (Pride Rainbow, Trans Pride, Bi Pride). O usuário escolhe um preset completo via novo seletor visual no `CarCustomizer`.

## Estrutura

### Novos presets (`raceColors.ts`)
Substituir/expandir `RACE_CAR_COLORS` por `RACE_CAR_PRESETS` (20 entradas), cada uma com: `id`, `name`, `style` (f1|stock|kart), `primary`, `secondary`, `accent?`, `pattern?` (`solid` | `stripes` | `flames` | `checkers` | `pride-rainbow` | `pride-trans` | `pride-bi`), `emoji`.

20 presets propostos (modelo + cor + tema):
1. Ferrari Scuderia (F1, vermelho/branco)
2. Mercedes Silver Arrow (F1, prata/petróleo)
3. McLaren Papaya (F1, laranja/azul)
4. Williams Heritage (F1, azul/branco)
5. Lotus Classic (F1, preto/dourado)
6. Alpine Azure (F1, azul/rosa)
7. NASCAR Thunder (Stock, vermelho/preto, chamas)
8. Stock Lightning (Stock, amarelo/preto, listras)
9. Stock Patriot (Stock, azul/vermelho/branco)
10. Stock Forest (Stock, verde/branco)
11. Stock Midnight (Stock, preto/roxo)
12. Stock Sunset (Stock, laranja/rosa)
13. Kart Mario (Kart, vermelho/branco)
14. Kart Luigi (Kart, verde/branco)
15. Kart Peach (Kart, rosa/dourado)
16. Kart Toad (Kart, branco/vermelho, bolinhas)
17. Kart Shadow (Kart, preto/ciano)
18. **Pride Rainbow** (F1, listras arco-íris) 🏳️‍🌈
19. **Trans Pride** (Kart, azul/rosa/branco) 🏳️‍⚧️
20. **Bi Pride** (Stock, magenta/roxo/azul)

### DB
- Nova migração: adicionar coluna `preset_id text` em `race_cars` (nullable, p/ retrocompatibilidade). `primary_color`/`secondary_color`/`car_style` continuam derivados do preset.

### UI
- `CarCustomizer.tsx`: substituir grid de 12 cores + tabs de estilo por **grid 4×5 de preset cards** com mini-preview SVG do carro (usando `RaceCar` real), nome + emoji, badge "Pride" para temas LGBT. Manter campos número/apelido.
- `RaceCar.tsx`: estender p/ aceitar `pattern` opcional e renderizar overlay (listras pride, chamas, bolinhas, etc.) via `<defs>` + clipPath sobre o chassi.

### Hook
- `useMyRaceCar`: incluir `preset_id` no payload do upsert.

## Arquivos
**Editados:** `src/components/race/raceColors.ts`, `src/components/race/RaceCar.tsx`, `src/components/race/CarCustomizer.tsx`, `src/hooks/race/useMyRaceCar.ts`
**Novo:** `src/components/race/CarPresetCard.tsx` (mini-preview do preset)
**Migração:** add `preset_id` em `race_cars`

## Garantias
Tokens HSL, mini-previews acessíveis (`aria-label`), grid responsivo, retrocompatível com carros já salvos (fallback para preset inferido por cor/estilo).
