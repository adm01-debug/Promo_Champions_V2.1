
Pista reduzida entregue (75% da área, grama nas bordas). Próximo ciclo aproveita o novo espaço de grama livre (topo e base) para enriquecer a ambientação e adicionar mais camadas narrativas F1.

# Ciclo 53-58 (rumo ao 10/10++ definitivo)

**53. Helicóptero de transmissão sobrevoando** — pequeno SVG de helicóptero (~24px) cruzando lentamente a faixa de grama superior da esquerda para a direita em loop de 18s, com sombra circular projetada no chão e rotor animado. Imersão de "transmissão ao vivo".

**54. Motorhomes/Paddock na faixa superior** — preencher o espaço de grama superior (0-166) com 4-5 motorhomes coloridos (caminhões de equipe) enfileirados com logos genéricos das equipes (cores dos top 4 carros), antenas parabólicas e bandeirinhas. Vida de paddock.

**55. Pit lane visual na faixa inferior** — preencher o espaço de grama inferior (1166-1333) com uma pit lane estilizada: 6 boxes alinhados com pneus empilhados, mecânicos minimalistas (bonecos 4px) e placas de número. Conta a história do "outro lado" da corrida.

**56. Drones de filmagem orbitando setor 2** — 2 pequenos drones (3px com 4 hélices animadas) flutuando em órbita lenta sobre a chicane central, com pequena luz vermelha piscante de "REC". Cobertura cinematográfica.

**57. Placar gigante de LED na arquibancada** — adicionar um telão LED estilizado acima da grandstand inferior mostrando em loop o nome do líder atual e gap em texto pixelado (estilo matriz LED), com leve flicker. Atualiza em real-time conforme líder muda.

**58. Pássaros voando ocasionalmente** — bando de 3-5 pássaros (V-shapes minúsculos animados) cruzando a tela diagonalmente a cada 25s, alternando direção. Microvida ambiental que faz a cena respirar.

## Arquivos a editar
- `src/components/race/track/TrackScenery.tsx` — helicóptero, motorhomes, pit lane, drones, telão LED, pássaros
- `src/components/race/RaceArena.tsx` — passar nome/gap do líder para telão LED via prop
- `src/components/race/raceTrackHelpers.ts` — exportar `TRACK_OFFSET_Y` se ainda não acessível p/ posicionar elementos nas faixas extras
- `src/index.css` — keyframes helicopter-fly, drone-orbit, rotor-spin, led-flicker, bird-flap

Sem perguntas. Executo as 6 em sequência.
