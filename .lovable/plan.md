
Análise exaustiva do RaceArena (Mario Kart / F1 Arcade) buscando gaps de design e melhorias de excelência visual/UX.

## Áreas inspecionadas
- `RaceArena.tsx` (orquestração, layers SVG)
- `track/` (TrackScenery, TrackTireMarks, TrackDustParticles, helicópteros, etc.)
- `raceTrackHelpers.ts` (CHECKPOINTS, getPositionOnTrack)
- Componentes de carro, HUD, leaderboard

## Gaps identificados (priorizados)

### 1. Imersão visual da pista
- **Sem sombra dos carros** no asfalto → carros parecem "flutuar". Adicionar elipse escura translúcida abaixo de cada carro.
- **Sem reflexo/brilho dinâmico no asfalto** quando há curva fechada (highlight especular).
- **Curvas sem rumble strips animados** (faixas vermelho/branco piscando como F1 real).
- **Linha de largada/chegada sem animação xadrez ondulando** quando líder se aproxima.

### 2. Feedback do líder e disputa
- **Sem destaque visual do carro do usuário logado** (já mencionado anteriormente, ainda pendente) — halo pulsante na cor do time.
- **Sem indicador "GAP +X.Xs"** flutuante entre 1º e 2º quando estão próximos (<5% de progresso).
- **Sem efeito DRS/Boost zone**: trecho da reta principal poderia ter overlay azul translúcido sinalizando "zona de ultrapassagem".
- **Sem "slipstream" visual**: linhas de vento atrás do líder quando 2º está colado.

### 3. Atmosfera arcade
- **Faltam bandeiras agitando** nas arquibancadas (SVG com `<animateTransform>` skew).
- **Torcedores estáticos demais**: adicionar 2-3 que levantam plaquinhas (cartazes coloridos).
- **Sem balões/dirigíveis** flutuando lentamente no céu (acompanhando helicópteros).
- **Sem fogos de artifício** no momento que alguém cruza a linha de chegada (já existe celebração, mas falta SVG fireworks na pista).
- **Sem "lap counter" visual estilo placar LED** no canto da pista.

### 4. Microinterações de corrida
- **Sem trilha de exhaust/escape** (pequena fumaça contínua atrás do carro em alta velocidade) — diferente do dust de curva.
- **Sem screen shake** sutil quando há ultrapassagem (mudança de posição entre top 3).
- **Sem "ghost trail"** colorido seguindo o líder (rastro de neon).
- **Sem indicador de aceleração**: carros poderiam ter pequena chama no escapamento que aumenta com velocidade.

### 5. HUD e leitura competitiva
- **Sem mini-mapa simplificado** (já tem a pista, mas falta versão compacta com só os pontinhos para leitura periférica).
- **Sem timeline de eventos** (ex: "🏁 Vendedor X tomou liderança às 10:32").
- **Sem countdown visual** para reset semanal ("⏱ Corrida termina em 2d 14h").

### 6. Polimento de partículas existentes
- `TrackDustParticles` está ótimo, mas:
  - Poderia variar cor por tipo de superfície (poeira mais clara em retas, mais escura em curvas com runoff).
  - Adicionar leve **blur SVG filter** nas partículas de fumaça para sensação volumétrica.

## Top 5 melhorias recomendadas (ordem de impacto)
1. **Sombra sob os carros** + **halo no carro do usuário logado** (imersão imediata + personalização).
2. **Slipstream + GAP flutuante** entre 1º e 2º (drama competitivo).
3. **Rumble strips animados nas curvas** + **xadrez ondulado na largada** (atmosfera F1).
4. **Exhaust trail contínua + chama no escapamento** (sensação de velocidade).
5. **Bandeiras agitando + plaquinhas dos torcedores + dirigível no céu** (vida na arquibancada).

## Próximo passo sugerido
Executar item #1 (sombra + halo do usuário) como primeira melhoria — alto impacto visual, baixo risco, completa o pedido pendente do "brilho no carro do vendedor logado".
