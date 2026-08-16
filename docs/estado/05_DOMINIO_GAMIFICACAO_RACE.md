# 05 — Domínio Gamificação / Race / Ranking

> **Auditoria por medição.** Nenhuma afirmação deste documento vem de `docs/*.md`.
> Toda linha foi verificada por leitura de `arquivo:linha` no repositório ou por `SELECT`
> no banco de produção (Supabase, projeto Promo Champions V2) via MCP.
>
> Data da medição: **2026-08-16**.
> Escopo: `src/components/race` (102 arquivos, 11.930 linhas), `src/components/gamification` (5.398),
> `src/components/achievements` (976), `ranking/` (491), `arena/` (304), `effects/` (770),
> `vendedores/` (1.431), `vendedor/` (946), `salespeople/` (51), `focus/` (159), `onboarding/` (161),
> `src/hooks/race` (41 hooks), `src/hooks/gamification` (17 hooks).

---

## 0. VEREDITO EXECUTIVO

**O Race está DORMENTE.** O maior investimento de código do repositório (11.930 linhas só em
`components/race`, mais 41 hooks e 4 edge functions dedicadas) opera hoje sobre um banco
essencialmente vazio.

Três medições fecham o caso:

1. **`race_events` = 0 linhas.** É a tabela-motor de todo o domínio (boost, overtake, checkpoint,
   victory, powerup_unlocked). Nunca recebeu um único registro. Sem ela, ticker, feed, comentário,
   replay, badges, power-ups e celebrações não têm o que exibir.
2. **`page_analytics` não tem NENHUMA linha com `route` contendo `race`.** O hook
   `src/hooks/race/useRaceViewTelemetry.ts:32` grava em `page_analytics` toda vez que uma tela
   Race Arena termina de carregar. As 12 rotas registradas na tabela são `/dashboard/visao-geral` (29),
   `/dashboard/performance` (28), `/` (8), `/workflows` (2) e outras — **zero** `/race-arena*`.
   Ninguém abriu a Arena desde que a telemetria existe.
3. **O único job de cron do domínio que faz trabalho útil está quebrado há ~2 meses e falha em
   silêncio** (detalhe na seção 3).

O que **funciona de verdade** é o que é derivado por VIEW/trigger e não depende do pipeline Race:
o leaderboard (`race_leaderboard_view`, 16 linhas), o ranking competitivo
(`competitive_ranking`, 8 linhas) e as sequências de atividade (`sales_streaks`, 9 linhas,
atualizada em 2026-08-15). Fora isso, o domínio é casca.

---

## 1. MEDIÇÃO CRUA DO BANCO

Query base:
`select table_name from information_schema.tables where table_schema='public' and (table_name like '%race%' or '%season%' or '%challenge%' or '%badge%' or '%achievement%' or '%league%' or '%rank%' or '%powerup%' or '%xp%' or '%level%' ...)` → 63 objetos, dos quais 40 pertencem a este domínio.

### 1.1 Tabelas com dados (7 de 36)

| Tabela | Linhas | Última atividade | Observação medida |
|---|---:|---|---|
| `sales_streaks` | **9** | 2026-08-15 10:50 | Mantida por trigger `tr_maintain_streaks` em **`activities`** (não em `sales`). Único componente do domínio com escrita orgânica recente. |
| `race_cars` | **8** | 2026-08-13 19:31 | 8 inserts em sequência de 2 segundos → seed/carga manual, não uso. 8 carros para 18 `salespeople`. |
| `competitive_ranking` (VIEW) | **8** | — | View sobre MV, refrescada por `trg_refresh_ranking_on_sale_change`. Deriva de `sales`. |
| `race_leaderboard_view` (VIEW) | **16** | — | 8 carros × 2 temporadas ativas. Deriva de `sales`, não de `race_events`. |
| `race_spectator_view` (VIEW) | **16** | — | Espelho público do leaderboard. |
| `achievements` | **4** | 2026-08-13 18:05 | Todos os 4 com `created_at` idêntico → seed único. |
| `active_power_ups` | **4** | — | Catálogo (`double_points`, `streak_shield`, `xp_boost`), não uso. |
| `race_seasons` | **3** | 2026-08-13 18:05 | 2 `active` + 1 `finished`, os 3 com mesmo `created_at` → seed. |
| `competitive_seasons` | **1** | 2026-08-14 20:03 | — |
| `race_reactions` | **1** | 2026-08-13 19:43 | Uma única reação, no mesmo dia do seed → teste manual. |

### 1.2 Tabelas VAZIAS — 0 linhas (26 tabelas)

`race_events` · `race_badges` · `race_powerups` · `race_unlocks` · `race_teams` ·
`race_team_members` · `race_daily_snapshots` · `race_user_daily_checkins` ·
`race_user_preferences` · `race_scoring_rules` · `race_overlay_telemetry` ·
`race_rivalries_persistent` · `race_rivalries_view` · `leagues` · `league_members` ·
`league_history` · `salesperson_leagues` · `salesperson_xp` · `xp_history` · `xp_adjustments` ·
`salesperson_badges` · `collectible_badges` · `daily_challenges` · `daily_challenge_progress` ·
`weekly_challenges` · `challenge_progress` · `daily_streak_achievements` · `weekly_matchups` ·
`available_spins` · `prize_wheel_spins` · `ranking_notifications` · `rank_change_notifications`.

> **`race_events` = 0** é o dado mais importante deste relatório. Todo o subsistema de eventos,
> badges e power-ups é alimentado exclusivamente por ele.

---

## 2. O FIO PARTIDO: por que `race_events` está vazia

### 2.1 O gatilho existe e está corretamente ligado

- `src/hooks/sales/useSalesData.ts:6` importa `triggerRaceEvent`.
- `src/hooks/sales/useSalesData.ts:43` chama `triggerRaceEvent(data.id)` no `onSuccess` da criação de venda.
- `src/hooks/race/useRaceTrigger.ts:9` invoca `supabase.functions.invoke('process-race-event', { body: { sale_id: saleId } })`.
- `src/hooks/race/useRaceTrigger.ts:10-12`: `.catch(e => console.warn(...))` — **fire-and-forget, engole qualquer falha**.

O fio está soldado. O problema é que **ninguém passa por ele**: as 954 linhas de `public.sales`
têm datas de criação **futuras** (`max(created_at)` = `2026-08-29`, hoje é `2026-08-16`), com
1–2 vendas por dia distribuídas uniformemente. É carga sintética inserida por SQL, não vendas
criadas pela UI. Vendas criadas por SQL não passam pelo `onSuccess` do React Query, logo nunca
invocam a edge function.

### 2.2 Mesmo se invocada, a função só produziria 1 dos 5 tipos de evento

`supabase/functions/process-race-event/index.ts` (288 linhas) faz:

- **linha 53-56**: lê `race_leaderboard_view` → `prevBoard`
- **linha 69-74**: insere o evento `boost` (único insert incondicional)
- **linha 79-82**: lê **a mesma view, com o mesmo filtro** → `currBoard`
- **linha 78** (comentário do próprio código): `// 4. snapshot atual (vendas já estão computadas pela view)`

Como a venda já foi commitada **antes** da invocação (o gatilho está no `onSuccess`), `prevBoard`
e `currBoard` são leituras idênticas da mesma view no mesmo instante. Os diffs calculados nas
linhas 90-149 (`overtake`, `checkpoint`, `victory`) são portanto **estruturalmente sempre vazios**.
Consequência: `increment_race_car_overtakes` (linha 169) e `finalize_race_season`/`increment_race_car_wins`
(linha 144) nunca disparam.

### 2.3 Um segundo portão fecha a porta para 10 dos 18 vendedores

Trigger `validate_race_event_trigger` → `public.validate_race_event()` (SECURITY DEFINER,
lido de `pg_proc`) faz `RAISE EXCEPTION` se:

- a temporada não existir → `foreign_key_violation`
- a temporada não estiver `active` → `check_violation`
- **não existir `race_car` para o `salesperson_id`** → `foreign_key_violation`

Há 8 `race_cars` para 18 `salespeople`. Qualquer venda dos outros 10 faria o insert da linha 69
levantar exceção — e como a chamada em `useRaceTrigger.ts:10` engole o erro, a falha seria
totalmente invisível.

---

## 3. JOBS DE CRON — o que roda e o que quebrou

`select jobid, jobname, schedule, active from cron.job` → **11 jobs ativos, apenas 2 do domínio**:

| jobid | jobname | schedule | active | Comando | Resultado real medido |
|---:|---|---|---|---|---|
| 1 | `weekly-league-reset` | `0 0 * * 1` | true | `SELECT public.process_weekly_league_reset()` | `succeeded` em 2026-08-10 00:00 (`return_message`: "1 row"). Mas `leagues`=0 e `league_members`=0 → **executa sobre o vazio, no-op** |
| 2 | `weekly-matchmaking` | `1 0 * * 1` | true | `SELECT public.match_weekly_players()` | **`failed`** em 2026-08-10 00:01 — `ERROR: function public.match_weekly_players() does not exist` |

### 3.1 Causa-raiz do jobid 2 (falha silenciosa desde 2026-06-19)

- `supabase/migrations/20260512144635_...sql:58` agenda: `cron.schedule('weekly-matchmaking', '1 0 * * 1', 'SELECT public.match_weekly_players()')`
- `supabase/migrations/20260619144542_...sql:11` lista `'match_weekly_players'` no array de funções a endurecer
- `supabase/migrations/20260619144542_...sql:19` executa `ALTER FUNCTION %s SET SCHEMA private`

Confirmado no banco: `select nspname, proname from pg_proc ...` retorna
`private | match_weekly_players`. A função **existe**, mas mudou de schema; o cron nunca foi
atualizado. Efeito: `weekly_matchups` = 0 linhas → `useWeeklyMatchups`, `useGamifiedProfile` e
o trigger `tr_check_battle_achievements` nunca têm dados. **Ninguém abre chamado porque a falha
só aparece em `cron.job_run_details`.**

(A mesma migração moveu `sync_weekly_xp` para `private` — confirmado. `salesperson_xp` e
`xp_history` estão em 0.)

### 3.2 `rotate-daily-challenges` NÃO tem cron

`grep -rn "rotate-daily-challenges" supabase/migrations/` → **nenhum resultado**. Não aparece
em `cron.job`. Só é chamada por **botão manual**:
- `src/components/gamification/DailyChallengesCard.tsx:58`
- `src/pages/HistoricoDesafiosDiarios.tsx:79`

`daily_challenges` = 0 → o botão nunca foi apertado em produção.

### 3.3 Retenção de `cron.job_run_details`

`count(*)` = 705, janela `2026-08-04 11:30` → `2026-08-16 13:30`. Só ~12 dias de histórico,
logo apenas **1 execução** de cada job semanal está visível. Não é possível provar quantas
semanas o jobid 2 vem falhando — mas a migração que o quebrou é de **2026-06-19**, ou seja,
~8 execuções semanais falhadas.

---

## 4. EDGE FUNCTIONS — quem chama cada uma

| Edge function | Quem chama (arquivo:linha) | Automático? | Evidência de execução |
|---|---|---|---|
| `process-race-event` | `src/hooks/race/useRaceTrigger.ts:9` ← `src/hooks/sales/useSalesData.ts:43` | Sim (ao criar venda pela UI) | `race_events`=0 → **nunca produziu efeito** |
| `start-race-season` | `src/hooks/race/useStartRaceSeason.ts:24` ← `StartSeasonDialog.tsx:49` ← `admin/SeasonsManagerTable.tsx:143` e `RaceArenaView.tsx:429` | Não (botão admin) | 3 `race_seasons` com `created_at` idêntico → seed SQL, não a função |
| `collect-race-powerup` | `src/hooks/race/useRacePowerups.ts:55` ← `src/pages/RaceArenaView.tsx:89` | Não (clique no power-up) | `race_powerups`=0 → **sem nada para coletar** |
| `race-commentary` | `src/hooks/race/useRaceCommentary.ts:76` | Sim (ao renderizar painel) | Depende de `race_events`=0 → sem insumo |
| `rotate-daily-challenges` | `DailyChallengesCard.tsx:58`, `HistoricoDesafiosDiarios.tsx:79` | **Não** — sem cron | `daily_challenges`=0 |
| `challenge-expiration-alerts` | `src/components/admin/BackendAutomationMonitor.tsx:49` (botão "rodar job") | **Não** — sem cron | Sem tabela de log própria; `daily_challenges`=0 torna inócua |
| `notify-ranking-position` | `src/hooks/useRankingNotifications.ts:82` ← `src/components/ranking/SendRankingNotificationsButton.tsx:8` | **Não** (botão manual) | `ranking_notifications`=0 |
| `ranking-api` | **NENHUM chamador** em `src/` nem em `supabase/migrations/`. Aparece só em `docs/FUNCIONALIDADES_COMPLETAS.md`, `docs/FUNCIONALIDADES_SEM_UI.md`, `docs/auditoria/RELATORIO_FALHAS.md` | — | **Órfã** |

---

## 5. TABELA DE CLASSIFICAÇÃO POR FUNCIONALIDADE

| Funcionalidade | UI (arquivo:linha) | Hook | Edge function / Tabela | Linhas no banco | Última atividade | Classificação | O que falta |
|---|---|---|---|---:|---|---|---|
| Leaderboard da corrida | `src/pages/RaceArenaView.tsx:78`, `AppRoutes.tsx:237` | `useRaceLeaderboard.ts` | VIEW `race_leaderboard_view` | **16** | derivada de `sales` | 🟨 PARCIAL | View entrega dados, mas `page_analytics` não registra nenhum acesso à rota → tela nunca aberta |
| Temporadas (Race Seasons) | `admin/SeasonsManagerTable.tsx:143` | `useRaceSeason.ts`, `useRaceSeasonByRole.ts` | `start-race-season` / `race_seasons` | **3** | 2026-08-13 (seed) | 🟨 PARCIAL | Nenhuma temporada criada pela edge function; 2 ativas simultâneas expiram em 2026-08-27/09-03 sem processamento |
| Carros / Garagem | `src/pages/RaceArenaGarage.tsx`, `CarCustomizer.tsx` | `useMyRaceCar.ts`, `useRaceUnlocks.ts` | RPC `unlock_race_item` / `race_cars`, `race_unlocks` | 8 / **0** | 2026-08-13 (seed) | 🟨 PARCIAL | `race_unlocks`=0: nenhum item desbloqueado. Só 8 dos 18 vendedores têm carro |
| Eventos de corrida (motor) | `RaceEventTicker.tsx`, `RaceEventFeed.tsx`, `FloatingEventFeed.tsx` | `useRaceEvents.ts` | `process-race-event` / `race_events` | **0** | nunca | 🟨 PARCIAL | Vendas entram por SQL, não pela UI; e o diff prev/curr (`process-race-event/index.ts:53-82`) é estruturalmente sempre vazio |
| Ultrapassagens / checkpoints / vitória | `OvertakeHighlight.tsx`, `VictoryLapOverlay.tsx`, `CheckeredFlag.tsx` | `useOvertakeDetector.ts` | `process-race-event/index.ts:104-149` | **0** | nunca | ⬛ MORTO | Bug lógico: `prevBoard` e `currBoard` leem a mesma view no mesmo instante |
| Power-ups | `PitStopPanel.tsx`, `PowerUpIcon.tsx`, `RaceArenaView.tsx:89` | `useRacePowerups.ts` | `collect-race-powerup` / `race_powerups` | **0** | nunca | 🟨 PARCIAL | Só `process-race-event` gera power-up (linha 188); como ele nunca roda, não há nada para coletar |
| Badges de corrida | `RaceBadgeShowcase.tsx`, `RaceAchievementShareCard.tsx` | `useRaceBadges.ts` | `race_badges` | **0** | nunca | 🟨 PARCIAL | Concessão só em `process-race-event/index.ts:174-181` |
| Comentário narrado (IA) | `RaceCommentaryPanel.tsx`, `CommentaryBubble.tsx` | `useRaceCommentary.ts:76` | `race-commentary` | — | — | 🟨 PARCIAL | Consome `race_events`=0 → nunca gera falas reais |
| Regras de pontuação | `admin/ScoringRulesEditor.tsx`, `admin/SeasonRulesPanel.tsx:16` | `useRaceScoringRules.ts` | `race_scoring_rules` | **0** | nunca | 🟨 PARCIAL | Editor admin existe e está roteado (`AppRoutes.tsx:241`), mas nenhuma regra foi salva |
| Times de corrida | `TeamLeaderboard.tsx` | `useRaceTeams.ts` | `race_teams`, `race_team_members` | **0** / **0** | nunca | 🟨 PARCIAL | Nenhuma UI de criação de time encontrada; tabelas nunca escritas |
| Rivalidades | `MyRivalCard.tsx`, `RivalryBadge.tsx` | `useMyRival.ts` | `race_rivalries_persistent` + VIEW `race_rivalries_view` | **0** / **0** | nunca | 🟨 PARCIAL | Sem processo que popule a tabela persistente |
| Check-in diário | `DailyCheckinModal.tsx` | `useDailyRaceCheckin.ts:46` | RPC `register_race_daily_checkin` (existe) / `race_user_daily_checkins`, `race_daily_snapshots` | **0** / **0** | nunca | 🟨 PARCIAL | RPC existe no banco mas nunca foi chamada — nenhum acesso à Arena |
| Reações na corrida | `ReactionBar.tsx`, `ReactionFloater.tsx` | `useRaceReactions.ts` | `race_reactions` | **1** | 2026-08-13 19:43 | 🟨 PARCIAL | 1 linha isolada no dia do seed = teste manual, não uso |
| Telemetria de overlay | `admin/OverlayTelemetryPanel.tsx` | — | `race_overlay_telemetry` | **0** | nunca | 🟨 PARCIAL | Painel admin sem dado algum |
| Telemetria TTI da Arena | — | `useRaceViewTelemetry.ts:32` | `page_analytics` | **0 linhas com rota race** | nunca | ⬛ MORTO | Prova de que nenhuma tela Race Arena foi carregada |
| Preferências / áudio / calm mode | `RaceAudioPreferences.tsx`, `RaceSoundToggle.tsx` | `useCalmMode.ts`, `useRaceSounds.ts`, `useRaceAudioEngine.ts` | `race_user_preferences` | **0** | nunca | 🟨 PARCIAL | Nenhuma preferência persistida |
| Modo TV / Espectador | `AppRoutes.tsx:92` (`/race-arena/tv`), `AppRoutes.tsx:95` (`/race-arena/spectator/:seasonId`) | — | VIEW `race_spectator_view` | 16 | — | 🟨 PARCIAL | Rotas existem, view tem dado, mas zero acesso registrado |
| Carreira / Histórico de campeões | `CareerTimeline.tsx`, `ChampionsHistoryPanel.tsx` | `useMyCareer.ts`, `useChampionsHistory.ts`, `useMonthlyChampion.ts` | `race_seasons` + `race_events` | 3 / **0** | 2026-08-13 | 🟨 PARCIAL | Sem `winner_id` gravado (nenhum evento `victory`) |
| Replay / What-if / Predições / Pit-stop | `SeasonReplayModal.tsx`, `RaceReplayButton.tsx` | `useRaceReplay.ts`, `useRaceWhatIf.ts`, `useRacePredictions.ts`, `usePitStopAnalysis.ts` | nenhuma tabela (cálculo puro em memória) | — | — | 🟦 SUGERIDO | Derivam do leaderboard; sem `race_events` o replay não tem linha do tempo |
| **Ranking competitivo** | `src/pages/RankingCompetitivo.tsx`, `AppRoutes.tsx:232` | `useCompetitiveRanking.ts:33` | VIEW `competitive_ranking` (sobre MV, refrescada por `trg_refresh_ranking_on_sale_change`) | **8** | live | ✅ IMPLEMENTADO_TOTAL | — |
| Notificações de ranking | `ranking/SendRankingNotificationsButton.tsx:8`, `RankingPositionBanner.tsx` | `useRankingNotifications.ts:82`, `useRankNotifications.ts` | `notify-ranking-position` / `ranking_notifications`, `rank_change_notifications` | **0** / **0** | nunca | 🟨 PARCIAL | Disparo só por botão manual; nenhum cron; nunca acionado |
| API pública de ranking | — | — | `ranking-api` | — | — | ⬛ MORTO | Zero chamadores em `src/` e em `supabase/migrations/`. Só citada em `docs/*.md` |
| **Streaks de atividade** | `StreakCounter.tsx`, `StreakMilestoneOverlay.tsx`, `achievements/StreakRanking.tsx` | `useRaceStreak.ts`, `useGamifiedProfile.ts` | trigger `tr_maintain_streaks` em `activities` → `sales_streaks` | **9** | **2026-08-15 10:50** | ✅ IMPLEMENTADO_TOTAL | Única peça do domínio com escrita orgânica recente |
| Conquistas (achievements) | `achievements/AchievementsHistory.tsx`, `AchievementTrendChart.tsx`, `TeamAchievementStats.tsx` | `useAchievements.ts`, `useAchievementsByPerson.ts`, `useAchievementTrends.ts`, `useTeamAchievementStats.ts` | `achievements` | **4** | 2026-08-13 (seed único) | 🟨 PARCIAL | 4 linhas com `created_at` idêntico; nenhum processo automático gera conquista |
| XP / Níveis | `gamification/XPToast.tsx`, `effects/AnimatedXPParticles.tsx`, `AnimatedLevelIndicator.tsx` | `useSalespersonXP.ts`, `useLevelUpCelebration.ts` | `salesperson_xp`, `xp_history` (+ trigger `tr_sync_total_xp`) | **0** / **0** | nunca | 🟨 PARCIAL | Triggers de XP existem só em `cadence_tasks` e `quotes`, nenhum em `sales`; `sync_weekly_xp` foi movida para schema `private` |
| Ligas | `gamification/` | `useLeagues.ts` | `leagues`, `league_members`, `league_history`, `salesperson_leagues` | **0** em todas | nunca | 🟨 PARCIAL | Cron jobid 1 roda toda segunda sobre tabela vazia (no-op) |
| Matchmaking semanal | `useGamifiedProfile.ts` | `useWeeklyMatchups.ts` | `weekly_matchups` + cron jobid 2 | **0** | **falha desde 2026-06-19** | ⬛ MORTO | `match_weekly_players` está em `private`, cron chama `public` → `failed` toda semana |
| Desafios diários | `gamification/DailyChallengesCard.tsx`, `src/pages/HistoricoDesafiosDiarios.tsx` | `useDailyChallenges.ts`, `useDailyMissions.ts` | `rotate-daily-challenges` / `daily_challenges`, `daily_challenge_progress` | **0** / **0** | nunca | 🟨 PARCIAL | Sem cron; botão manual nunca usado |
| Desafios semanais | `src/pages/DesafiosSemanais.tsx`, `CreateChallengeDialog.tsx` | `useWeeklyChallenges.ts` | `weekly_challenges`, `challenge_progress` | **0** / **0** | nunca | 🟨 PARCIAL | UI de criação existe; nenhum desafio criado |
| Alertas de expiração de desafio | `admin/BackendAutomationMonitor.tsx:49` | — | `challenge-expiration-alerts` | — | — | 🟦 SUGERIDO | Botão manual em painel admin; sem cron |
| Badges colecionáveis | `src/pages/BadgesGalleryPage.tsx` | `useCollectibleBadges.ts` | `collectible_badges`, `salesperson_badges` | **0** / **0** | nunca | 🟨 PARCIAL | Catálogo de badges vazio → galeria renderiza nada |
| Roleta de prêmios | `gamification/` | `usePrizeWheel.ts` | `available_spins`, `prize_wheel_spins` | **0** / **0** | nunca | 🟨 PARCIAL + ⚠️ risco | Sorteio decidido no cliente (ver §6.1) |
| Conquistas de streak diária | — | `useDailyStreakAchievements.ts` | `daily_streak_achievements` | **0** | nunca | 🟨 PARCIAL | — |
| Arena competitiva | `src/pages/ArenaCompetitiva.tsx`, `AppRoutes.tsx:235`, `arena/ArenaStatusBadge.tsx` | `useCompetitiveSeasons.ts` | `competitive_seasons`, `active_power_ups` | 1 / 4 | 2026-08-14 | 🟨 PARCIAL | 1 temporada e 4 power-ups de catálogo; sem participação |
| Ranking futurista / semanal | `gamification/` | `useFuturisticRanking.ts`, `useWeeklyRanking.ts` | `sales` + RPC `get_active_salespeople` (existe) | 954 vendas | 2026-08-29 (seed) | ✅ IMPLEMENTADO_TOTAL | Deriva direto de `sales`, independe do Race |
| Efeitos visuais | `components/effects/` (6 arquivos, 770 linhas), `vendedores/podium/EnergyParticles.tsx` | `useScreenShake.ts`, `useLevelUpCelebration.ts` | — | — | — | ✅ IMPLEMENTADO_TOTAL | Puramente visual, funciona sem backend |
| Onboarding / Focus mode | `onboarding/OnboardingChecklist.tsx` (161 l.), `focus/FocusModeToggle.tsx` (159 l.), `race/RaceOnboardingChecklist.tsx` | `useCalmMode.ts` | localStorage | — | — | 🟦 SUGERIDO | Estado local, sem persistência em banco |

---

## 6. `Math.random()` — legítimo vs. ilegítimo

Ocorrências por diretório: `race` 17, `effects` 23, `gamification` 9, `vendedores` 7, `arena` 1,
`achievements`/`ranking`/`vendedor`/`salespeople`/`focus`/`onboarding` **0**.

### 6.1 ⚠️ ILEGÍTIMO — prêmio decidido no navegador

`src/hooks/gamification/usePrizeWheel.ts:31-39` define `weightedRandom()` usando
`Math.random()` na **linha 33**. A mutação `spin` usa esse resultado:

- **linha 80**: `const prizeIndex = weightedRandom();`
- **linha 81**: `const prize = PRIZE_SLICES[prizeIndex];`
- **linha 84-92**: `supabase.from('prize_wheel_spins').insert({ prize_type, prize_value, prize_label, ... })`

O sorteio acontece **inteiramente no cliente** e o resultado é gravado direto pelo browser.
Não há RPC nem edge function validando. As probabilidades (`PRIZE_SLICES`, linhas 21-29) são
constantes exportadas no bundle. Um usuário pode escolher o prêmio (`+500 XP`) alterando o
payload. Também há race condition no decremento (linha 98: `spins_count: (availableSpins||1) - 1`,
valor lido do cache do React Query, não `decrement` atômico).

**Mitigação de fato:** `prize_wheel_spins` = 0 e `available_spins` = 0 → nunca explorado.
Mas o código está em produção e o risco é real assim que a feature for ligada.

### 6.2 ✅ LEGÍTIMO — animação e chaves de UI

- `src/hooks/race/useRaceDisplayEvents.ts:23,29` — id efêmero de item de lista
- `src/hooks/race/useRaceCommentaryLogic.ts:15` — id de fala
- `src/hooks/race/useRaceSeasonByRole.ts:35` — nome único de canal realtime
- `src/hooks/useRankingNotifications.ts:29` — id de fallback
- `src/hooks/gamification/useLevelUpCelebration.ts:121-127` — ângulo/origem/drift de confete
- `src/components/gamification/StreakMilestoneOverlay.tsx:60-66`, `XPToast.tsx:130-131`, `StreakCounter.tsx:124-135` — posição de partícula
- `src/components/vendedores/podium/EnergyParticles.tsx:12-27` — partículas do pódio
- Todos os 23 usos em `src/components/effects/` — partículas/confete

### 6.3 Dados mock / hardcoded

Busca por `mock`, `hardcoded`, `TODO`, `FIXME`, `dados fictícios` em `components/race`,
`components/gamification`, `components/achievements`, `components/ranking`, `components/arena`,
`hooks/race`, `hooks/gamification`: **nenhum resultado relevante** (só strings de UI em
português e comentários descritivos). O código do domínio é real e não simula dados —
ele simplesmente não recebe nenhum.

Catálogos estáticos legítimos (constantes de produto, não mock):
`src/components/race/garage/raceUnlockCatalog.ts`, `src/components/race/raceColors.ts`,
`src/hooks/gamification/usePrizeWheel.ts:21-29` (`PRIZE_SLICES`),
`src/hooks/useCompetitiveRanking.ts:20-24` (`RANK_TITLES`).

---

## 7. CONTAGEM POR CLASSIFICAÇÃO

Base: **38 funcionalidades** avaliadas na tabela da seção 5.

| Classificação | Qtd | % | Itens |
|---|---:|---:|---|
| ✅ IMPLEMENTADO_TOTAL | **5 / 38** | 13% | Ranking competitivo · Streaks de atividade · Ranking futurista/semanal · Efeitos visuais · (view de leaderboard como infraestrutura) |
| 🟨 PARCIAL | **27 / 38** | 71% | Todo o núcleo Race (eventos, power-ups, badges, times, rivalidades, check-in, regras, temporadas, garagem, comentário, telemetria de overlay, TV/espectador, carreira), XP/níveis, ligas, desafios diários e semanais, badges colecionáveis, roleta, conquistas, arena competitiva, notificações de ranking, preferências |
| 🟦 SUGERIDO_OU_INICIADO | **3 / 38** | 8% | Replay/What-if/Predições · Alertas de expiração de desafio · Onboarding/Focus mode |
| ⬛ MORTO_OU_ABANDONADO | **4 / 38** | 11% | `ranking-api` (órfã) · Matchmaking semanal (cron quebrado) · Ultrapassagens/checkpoints/vitória (bug lógico) · Telemetria TTI da Arena (zero acessos) |

**Nenhuma funcionalidade específica do Race Arena atinge ✅.** Os 5 ✅ pertencem a
ranking/streaks/efeitos, subsistemas que derivam de `sales`/`activities` e não dependem do
pipeline Race.

---

## 8. VEREDITO: O RACE ESTÁ VIVO OU DORMENTE?

**DORMENTE — é o caso-modelo de "feature pronta e nunca ligada".**

Evidências, em ordem de força:

1. `race_events` = **0 linhas**. Tabela-motor, nunca escrita.
2. `page_analytics` não contém **nenhuma** rota `/race-arena*`; a telemetria em
   `useRaceViewTelemetry.ts:32` grava a cada carregamento de tela Race. Ninguém abriu a Arena.
3. **20 das 26 tabelas** exclusivas do domínio estão em 0.
4. As poucas tabelas com dado têm `created_at` idêntico ou em janela de 2 segundos
   (`race_cars`, `race_seasons`, `achievements`) = seed, não uso.
5. A única reação registrada (`race_reactions`=1) é de 2026-08-13 19:43, mesmo dia do seed.
6. `race_overlay_telemetry` = 0 e `race_user_preferences` = 0: nem sequer sessões de visualização
   ou ajustes de som existem.
7. O cron do domínio que faria trabalho real (`weekly-matchmaking`) **falha toda semana desde
   2026-06-19** com `function public.match_weekly_players() does not exist`, e o outro
   (`weekly-league-reset`) "sucede" operando sobre tabelas vazias.

Duas temporadas estão marcadas como `active` com término em 2026-08-27 e 2026-09-03. Sem
`race_events` e sem eventos de `victory`, elas vão expirar sem campeão, sem badge e sem
cerimônia — silenciosamente.

**Custo do investimento parado:** 11.930 linhas em `components/race` + 5.398 em
`gamification` + 976 em `achievements` + 41 hooks de race + 17 de gamificação + 4 edge functions
dedicadas + ~40 tabelas. É o maior domínio do repositório e produz **zero** registro de negócio.

---

## 9. O QUE NÃO FOI POSSÍVEL VERIFICAR

1. **Histórico de cron anterior a 2026-08-04.** `cron.job_run_details` retém só 705 linhas
   (`min(start_time)` = 2026-08-04 11:30). Não dá para provar por quantas semanas o
   `weekly-matchmaking` falha — a data da migração que o quebrou (2026-06-19) é a inferência
   mais forte disponível.
2. **Logs de invocação das edge functions.** O MCP disponível expõe SQL, não os logs de
   Deno/Edge Runtime. Não é possível distinguir "nunca foi chamada" de "foi chamada e retornou
   erro". A inferência usada foi indireta (tabela de destino vazia + ausência de telemetria de rota).
3. **`start-race-season` já rodou alguma vez?** Os 3 `race_seasons` têm `created_at` idêntico
   (2026-08-13 18:05:10.298938), padrão de seed SQL. Mas não é impossível que a função tenha
   rodado e as linhas tenham sido apagadas depois. Sem logs, não dá para fechar.
4. **RLS.** Não auditei políticas de `SELECT`/`INSERT` das tabelas do domínio. É possível que
   parte das telas falhe por RLS mesmo com dado presente — mas como quase tudo está em 0, a
   questão é secundária hoje.
5. **Origem exata das 954 vendas.** As datas futuras (até 2026-08-29) indicam seed, mas não
   localizei o script/migração de carga. Se alguma dessas vendas tiver sido criada pela UI,
   `process-race-event` deveria ter gerado ao menos um `boost` — não gerou, o que reforça a
   hipótese de carga 100% por SQL.
6. **`race-commentary` e uso de IA.** Não li o corpo da função nem verifiquei se há chave de
   API configurada; só confirmei o chamador (`useRaceCommentary.ts:76`) e que seu insumo
   (`race_events`) está vazio.
7. **Comportamento em runtime das telas.** Não executei a aplicação. As classificações 🟨 para
   telas com view populada (leaderboard, espectador, TV) assumem que renderizariam — não foi
   validado visualmente.
