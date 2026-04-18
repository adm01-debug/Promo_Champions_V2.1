
# Plano: Pista ocupando toda a área verde com serpentina vertical

## Diagnóstico
Pista atual ocupa ~50% da viewport (centralizada, deixa muito gramado vazio em cima/baixo). Carros estão no tamanho ideal e devem permanecer iguais.

## Solução
Reescrever apenas o **path SVG** da pista em `raceTrackHelpers.ts` para serpentear verticalmente do topo (y≈40) ao fundo (y≈560), usando toda a largura útil (x: 60→940). Sem mexer em carros, viewBox ou componentes.

### Novo traçado (serpentina vertical fechada)
- **Reta superior**: x 200→800 em y≈70
- **Curva direita topo** descendo até y≈200
- **S horizontal** indo para esquerda em y≈230
- **Curva esquerda** descendo até y≈360
- **S horizontal** voltando para direita em y≈390
- **Curva direita** descendo até y≈500
- **Reta inferior** x 800→200 em y≈530
- **Subida esquerda** fechando o circuito de volta ao start

Path com bezier cúbicas mantendo o sampling existente (`parsePath` + `resampleByLength` já cuidam do resto — carros, barreiras, lago, cenário e linha de chegada se reposicionam automaticamente via `getPositionOnTrack`).

### Ajustes secundários
- Reposicionar **lago** (`TrackPond`): mover para área central livre da nova serpentina (~cx 500, cy 300)
- Reposicionar **prédios pit** (`TrackScenery` layer inner): centralizar em região segura entre as voltas
- Reposicionar **árvores externas**: redistribuir nas 4 bordas e nas "ilhas" entre as serpentinas

### O que NÃO muda
- `RaceCar.tsx` (tamanho dos carros preservado)
- `TRACK_VIEWBOX` (1000x600)
- Largura do asfalto, run-off, barreiras zebradas
- Lógica de overtake/checkpoint/spotlight

## Arquivos
1. `src/components/race/raceTrackHelpers.ts` — novo `TRACK_PATH_D`
2. `src/components/race/track/TrackPond.tsx` — recentralizar lago
3. `src/components/race/track/TrackScenery.tsx` — recolocar prédios e árvores

## Validação
Após implementação, verificar visualmente em `/race-arena/closer` que:
- Pista cobre topo→base sem grandes faixas verdes vazias
- Carros não se sobrepõem ao lago/prédios
- Linha de chegada visível e perpendicular
- Barreiras zebradas nas curvas certas
