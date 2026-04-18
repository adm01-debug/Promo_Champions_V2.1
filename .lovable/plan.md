
Ciclo 41-46 entregue. Próximo ciclo foca em micro-narrativa, presença sonora-visual e refinamentos finais aproveitando ao máximo o layout vertical.

# Ciclo 47-52 (rumo ao 10/10++ definitivo)

**47. Marshals com bandeiras animadas nos postos** — substituir os marshal posts estáticos por figurinhas SVG humanoides minimalistas (3px) segurando bandeiras que se agitam. Quando bandeira amarela ativa (Race Control), todos os marshals trocam para bandeira amarela sincronizadamente.

**48. Indicador de "Setor mais rápido" (purple sector)** — ao detectar que um carro fez o melhor tempo no setor (delta de progresso × tempo), pisca o setor correspondente em roxo (#9333ea) por 1.5s no timing tower e cria pequena badge "FASTEST" no carro por 2s. Estilo F1 oficial.

**49. Onda mexicana na arquibancada (La Ola)** — quando o líder cruza a linha de chegada (a cada lap completo), a arquibancada faz uma "ola" sequencial: blocos de espectadores se levantam em onda da esquerda para a direita ao longo de 1.2s. Vida real no estádio.

**50. Rajada de vento visual nos pneus dos carros** — pequenas linhas brancas translúcidas (3-4px) saindo da traseira dos carros em alta velocidade (gap > threshold), simulando turbulência aerodinâmica. Aparecem só nos top 3 e quando carro está em DRS.

**51. Painel de "Próxima Curva" para o usuário** — pequeno HUD no canto inferior direito (acima do ReplayButton) mostrando para o pilot logado: tipo da próxima curva (Curva 1, Chicane, etc), distância em % até ela, e se é DRS zone (badge verde). Telemetria pessoal estilo F1.

**52. Cinematic camera focus no líder em momentos chave** — quando líder cruza setor 3 (final da volta) ou abre gap >5%, o SVG aplica leve zoom (scale 1.04) + pan suave focando no líder por 1.8s, com vinheta nas bordas. Câmera de transmissão.

## Arquivos a editar
- `src/components/race/track/TrackScenery.tsx` — marshals com bandeiras animadas + ola na arquibancada
- `src/components/race/RaceArena.tsx` — fastest sector detection, integrar NextCornerHUD, cinematic camera focus, ola trigger
- `src/components/race/RaceCar.tsx` — badge "FASTEST" + linhas de turbulência aerodinâmica
- `src/components/race/NextCornerHUD.tsx` — novo HUD lateral pessoal
- `src/components/race/raceTrackHelpers.ts` — helper `getNextCornerInfo(progress)` retornando tipo+distância+DRS
- `src/index.css` — keyframes marshal-flag-wave + la-ola-wave + fastest-sector-flash + cinematic-zoom

Sem perguntas. Executo as 6 em sequência.
