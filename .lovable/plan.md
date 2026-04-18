
O ciclo 11-16 (linha de chegada shimmer, marshal posts, bandeiras patrocinador, shimmer no capô, skid marks, sombra) já foi entregue na rodada anterior. Para continuar rumo ao "10/10++", proponho um novo ciclo de micro-perfeição focado em movimento, atmosfera e detalhes que faltam.

# Ciclo 17-22 (próxima camada de polish)

**17. Drone/helicóptero de transmissão** — pequeno helicóptero estilizado sobrevoando o circuito em loop lento (translate ao longo de path elíptico, 20s), com sombra projetada na grama abaixo. Reforça sensação de evento.

**18. Pit lane visível** — faixa cinza paralela à reta principal com linha branca tracejada separando da pista, 4-6 garagens numeradas com cores dos times atrás. Hoje só temos paddock genérico.

**19. Partículas de poeira/fumaça nas curvas** — quando carro passa por checkpoint de curva, emitir 3-4 circulinhos cinza claro que sobem e dissipam (motion + opacity). Vida de circuito real.

**20. Placar lateral animado (tipo F1 timing tower)** — mini overlay no canto superior direito do SVG com top 3 posições, gap em segundos, cor do time. Glassmorphism leve, atualiza em tempo real.

**21. Iluminação ambiente dinâmica** — gradiente radial sutil seguindo o líder da corrida (spotlight cinematográfico que segue o 1º lugar), opacity 0.15, blur alto. Foco visual automático.

**22. Sound design visual (sem áudio)** — quando há ultrapassagem, flash branco de 200ms no carro que ultrapassou + pequeno "ping" visual (círculo expandindo). Feedback de evento épico.

## Arquivos a editar
- `src/components/race/track/TrackScenery.tsx` — helicóptero + pit lane com garagens
- `src/components/race/RaceArena.tsx` — placar timing tower + spotlight do líder + dust particles
- `src/components/race/RaceCar.tsx` — flash de ultrapassagem
- `src/components/race/track/TrackDefs.tsx` — gradient spotlight + filter para fumaça
- `src/index.css` — token para pit garage colors

Sem perguntas. Executo as 6 em sequência até finalizar.
