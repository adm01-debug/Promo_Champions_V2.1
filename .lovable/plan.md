
Os ciclos 1-22 já foram entregues. Próximo ciclo de micro-perfeição focado em narrativa de corrida e profundidade visual.

# Ciclo 23-28 (próxima camada rumo ao 10/10++)

**23. Mini-mapa do circuito** — radar circular no canto inferior esquerdo (80px) com pista simplificada + pontos coloridos representando posição de cada carro em tempo real. Glassmorphism, atualiza junto com main view.

**24. Setores cronometrados (S1/S2/S3)** — dividir pista em 3 setores; quando líder cruza fronteira, exibir badge flutuante "S1 ✓" verde por 800ms na posição do checkpoint. Estilo F1 timing.

**25. Volta atual + total de voltas** — overlay HUD no topo central: "LAP 3/10" com tipografia condensada, fundo glass. Calcular voltas a partir do progress acumulado.

**26. Tire wear / energia visual** — barra horizontal pequena (16px) abaixo de cada carro mostrando "energia" (proxy: consistência de progresso). Cores: verde→amarelo→vermelho conforme degrada.

**27. DRS zones (zonas de ultrapassagem)** — 2 trechos retos da pista marcados com listras verdes diagonais sutis no asfalto + label "DRS" pequeno. Quando carro entra nelas com gap < threshold, ícone DRS pisca no topo do carro.

**28. Cinematic intro de 1.2s** — ao montar a arena, câmera "zoom out" do start/finish line para o overview completo (transform scale 1.8 → 1.0 + opacity), uma única vez por sessão. Sensação de "broadcast começando".

## Arquivos a editar
- `src/components/race/RaceArena.tsx` — minimapa, lap counter HUD, sector badges, intro animation
- `src/components/race/RaceCar.tsx` — barra de tire wear + ícone DRS
- `src/components/race/track/TrackAsphalt.tsx` — DRS zone stripes
- `src/components/race/raceTrackHelpers.ts` — helper de setores + DRS zones positions
- `src/components/race/MiniMap.tsx` — novo componente radar
- `src/index.css` — keyframes cinematic intro + DRS pulse

Sem perguntas. Executo as 6 em sequência.
