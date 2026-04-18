
**Novo bloco — Race Arena (Gamificação 3D estilo videogame)**

Módulo de corrida em tempo real onde cada vendedor é um carro disputando uma pista 2D top-down (estilo da imagem). Posição do carro = % de atingimento da meta no período. Quem está na frente é quem mais vendeu. Visual cartoon, sons, badges, boost, ultrapassagens animadas e narração.

## Inspiração visual (da imagem)
- Pista cinza com faixas brancas tracejadas, bordas curvas, gramado verde, bandeiras quadriculadas, árvores, espectadores, carros numerados (vermelho #5, verde #1, laranja #2, amarelo #4, azul listrado #3).
- Estética flat/cartoon top-down, cores saturadas, alegre.

## Conceito do jogo
- **Pista**: circuito ovalado animado com checkpoints (25%, 50%, 75%, meta). Linha de chegada quadriculada.
- **Carros**: 1 por vendedor ativo, cor + número escolhidos no perfil. Avatar pequeno do piloto na cabine.
- **Posição em tempo real**: `progress = vendas_periodo / meta_periodo` mapeado para coordenada na pista.
- **Speed boost**: cada nova venda dispara animação de aceleração + rastro de fogo + som "vrum".
- **Ultrapassagem**: quando carro A passa carro B, dispara animação slow-mo + som de pneu cantando + toast.
- **Pit stop**: vendedor sem venda há 24h aparece "parado no boxe" piscando.
- **Power-ups**: ícones na pista (turbo, escudo, raio) que vendedor pode "coletar" ao bater submetas diárias.
- **Volta vitória**: quem cruza a meta primeiro entra em "victory lap" com fogos, confetes e som de torcida.

## Sons (Web Audio API + arquivos públicos)
- `engine-loop.mp3` (loop ambiente baixo), `boost.mp3` (nova venda), `overtake.mp3` (ultrapassagem), `checkpoint.mp3` (25/50/75%), `victory.mp3` + `crowd-cheer.mp3` (chegada), `countdown.mp3` (3-2-1-GO no início), `pit-stop.mp3`. Toggle mute persistente.

## Badges exclusivos do módulo
- 🏎️ **Pole Position** (1º colocado fim de semana), ⚡ **Velocista** (3 vendas em 1h), 🔥 **Comeback King** (sair do último para top 3), 🏁 **Bandeira Quadriculada** (1º a bater meta), 🛞 **Drift Master** (5 ultrapassagens), 🏆 **Tri-Campeão** (3 corridas seguidas no pódio).

## Mudanças

### 1. Migration
- `race_seasons`: `id`, `name`, `start_date`, `end_date`, `track_type` (`oval|circuit|street`), `goal_amount`, `status` (`upcoming|active|finished`), `winner_id`, timestamps.
- `race_cars`: `id`, `salesperson_id` UNIQUE FK, `car_number int 1-99`, `primary_color hex`, `secondary_color hex`, `car_style` (`f1|stock|kart`), `nickname`, `total_races`, `total_wins`, `total_overtakes`, timestamps.
- `race_events`: `id`, `season_id`, `salesperson_id`, `event_type` (`boost|overtake|checkpoint|powerup|victory|pitstop`), `metadata jsonb`, `created_at`. Realtime ON.
- `race_powerups`: `id`, `season_id`, `salesperson_id`, `powerup_type` (`turbo|shield|lightning`), `collected_at`, `used_at`, `effect_data jsonb`.
- `race_badges`: `id`, `salesperson_id`, `badge_code`, `season_id`, `earned_at`. Unique `(salesperson_id, badge_code, season_id)`.
- View `race_leaderboard_view`: agrega progresso por carro (vendas no período / meta).
- RLS padrão + realtime em `race_events`, `race_cars`, `race_powerups`.

### 2. Edge function `process-race-event` (verify_jwt=true)
- Trigger via webhook quando nova venda é inserida.
- Calcula novo progresso, detecta ultrapassagens (compara ranking antes/depois), insere `race_events` + concede badges automaticamente.
- Retorna eventos para client tocar sons/animações.

### 3. Edge function `start-race-season` (verify_jwt=true, admin only)
- Cria nova season, gera carros default para vendedores sem `race_cars`, dispara countdown.

### 4. Hooks `src/hooks/race/`
- `useRaceSeason()` — season ativa + realtime.
- `useRaceLeaderboard(seasonId)` — posições em tempo real com cálculo de coordenadas da pista.
- `useRaceEvents(seasonId)` — feed de eventos (boost/overtake) para disparar animações.
- `useMyRaceCar()` — carro do usuário logado + customização.
- `useRaceSounds()` — Web Audio API com toggle mute (localStorage).
- `useRaceBadges(salespersonId)` — badges conquistados.

### 5. Componentes — `src/components/race/`
- `RaceTrack.tsx` (≤320L) — SVG pista top-down com curvas Bezier, faixas tracejadas animadas, checkpoints, linha de chegada quadriculada.
- `RaceCar.tsx` (≤200L) — SVG carro F1 cartoon, número, cores customizáveis, rastro animado durante boost (Framer Motion + path animation).
- `RaceArena.tsx` (≤280L) — composição: pista + todos carros + power-ups na pista + espectadores + árvores. Anima posições via Framer Motion.
- `RaceLeaderboardSidebar.tsx` (≤180L) — ranking lateral com posição, carro, % progresso, gap pro líder.
- `RaceEventFeed.tsx` (≤160L) — feed lateral de eventos ("João ultrapassou Maria!", "Pedro coletou turbo!").
- `CarCustomizer.tsx` (≤240L) — modal: escolher número, cores, estilo (F1/Stock/Kart), nickname. Preview em tempo real.
- `RaceCountdown.tsx` (≤120L) — overlay 3-2-1-GO no início da season com som.
- `VictoryLapOverlay.tsx` (≤180L) — confete + fogos + animação do vencedor com som de torcida.
- `PowerUpIcon.tsx` (≤80L) — turbo/shield/lightning na pista, pulsante.
- `RaceBadgeShowcase.tsx` (≤160L) — galeria de badges do módulo com estados locked/unlocked.
- `RaceSoundToggle.tsx` (≤80L) — botão mute/unmute persistente.
- `raceTrackHelpers.ts` — função `getPositionOnTrack(progress: 0-1)` retorna `{x, y, rotation}` ao longo do path SVG; cálculo de gap; detecção de ultrapassagem.
- `raceColors.ts` — paleta de 12 cores oficiais para carros.

### 6. Sons
- Adicionar em `public/sounds/race/`: 8 arquivos MP3 curtos (≤200KB cada). Fonte: Pixabay/Freesound (licença livre) ou gerar via Web Audio sintético como fallback.
- `useRaceSounds.ts` pré-carrega via `new Audio()`, gerencia volume e mute.

### 7. Página + rota
- `src/pages/RaceArena.tsx` — layout: pista central full-bleed, sidebar leaderboard direita, feed eventos esquerda, header com countdown season + toggle som + botão customizar carro.
- Rota `/race-arena` em `AppRoutes.tsx` + `lazyPages.ts`.
- Sidebar: novo item em `sidebarMenuData.ts` (grupo Gamificação, ícone `Flag` ou `Car` lucide-react).

### 8. Integrações
- Hook em `useCreateSale` (ou trigger SQL) → invoca `process-race-event` ao inserir venda.
- `GamifiedProfile` — adicionar mini-card "Meu Carro" com link pro Race Arena.
- `WallOfFame` — adicionar seção "Pole Positions" (vencedores de seasons passadas).

### 9. Configuração
- `supabase/config.toml`: `[functions.process-race-event] verify_jwt = true`, `[functions.start-race-season] verify_jwt = true`.

### 10. Validação
- `supabase--linter` zero novos warnings.
- Carro anima suavemente do checkpoint A→B em 800ms ao receber nova venda.
- Som toca em ultrapassagem; mute persiste no reload.
- Mobile responsivo (pista escala via viewBox).

## Arquivos
- **Migration**: 1 (5 tabelas + view + RLS + realtime)
- **Edge functions**: 2
- **Criar**: 6 hooks, 12 componentes/helpers, 1 página, 8 arquivos de som
- **Editar**: `AppRoutes.tsx`, `lazyPages.ts`, `sidebarMenuData.ts`, `supabase/config.toml`, `useCreateSale` (trigger), `GamifiedProfile.tsx`, `WallOfFame.tsx`

Após esta entrega, sigo automaticamente retomando o roadmap **Revenue Intelligence (2/4): Pipeline Coverage Analyzer**.
