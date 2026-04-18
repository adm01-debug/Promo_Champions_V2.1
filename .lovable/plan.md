
**Race Arena — Fase 2/3: Eventos automáticos, badges e victory lap**

Continuando a Race Arena. MVP visual já entregue (pista, carros, customizador, leaderboard, sons sintéticos, temporada seedada). Faltam os ingredientes que transformam em "videogame de verdade": eventos disparados por vendas reais, badges automáticos e celebração de vitória.

## O que entregar nesta atômica

### 1. Edge function `process-race-event` (verify_jwt=true)
- Input: `{ sale_id }` (chamada após inserir venda).
- Lê venda + temporada ativa + leaderboard antes/depois.
- Insere `race_events` (`boost`).
- Detecta ultrapassagens via `detectOvertakes` (porta server-side) → insere `overtake` events e incrementa `total_overtakes`.
- Detecta cruzamento de checkpoint (25/50/75%) → insere `checkpoint`.
- Detecta vitória (progresso ≥ 1.0 e nenhum vencedor ainda) → insere `victory`, marca `winner_id` na season, `total_wins++`.
- Concede badges automáticos via INSERT idempotente:
  - **velocista**: 3 vendas em 1h
  - **comeback_king**: era último, virou top 3
  - **bandeira_quadriculada**: 1º a bater meta
  - **drift_master**: 5 ultrapassagens acumuladas na season
  - **pole_position**: 1º colocado no fechamento da season (job futuro)

### 2. Edge function `start-race-season` (verify_jwt=true, admin only)
- Input: `{ name, start_date, end_date, goal_amount, track_type? }`.
- Finaliza season ativa anterior (se houver) → status `finished`.
- Cria nova season `active` + auto-cria `race_cars` default para vendedores sem carro (número aleatório livre, cor randômica do preset).

### 3. Integração com vendas
- Hook `useRaceTrigger` invocado após `useCreateSale` sucesso → fire-and-forget para `process-race-event`. Sem bloquear UX.

### 4. UI nova
- `VictoryLapOverlay.tsx` (≤180L) — overlay tela cheia com confete (canvas-confetti já no projeto se existir, ou SVG procedural), ícone troféu, nome + carro do vencedor, som `victory`, botão "Continuar". Trigger: realtime quando `race_events` recebe `victory`.
- `RaceBadgeShowcase.tsx` (≤160L) — galeria de 6 badges com locked/unlocked, descrição, data conquistada. Aba dentro de `/race-arena` ou modal acessível pelo header.
- `StartSeasonDialog.tsx` (≤200L) — modal admin (visível só com `has_role admin`) no header da página: nome, datas, meta, tipo de pista. Chama `start-race-season`.
- Hook `useRaceBadges(salespersonId?)` + `useStartRaceSeason()`.

### 5. Configuração
- `supabase/config.toml`: blocos para `process-race-event` e `start-race-season` (verify_jwt=true).

### 6. Validação
- `supabase--curl_edge_functions /process-race-event` com sale_id de teste.
- `supabase--linter` zero novos warnings.
- Inserir venda manual → carro avança + som de boost + evento aparece no feed.

## Arquivos
- **Criar**: `supabase/functions/process-race-event/index.ts`, `supabase/functions/start-race-season/index.ts`
- **Criar**: `src/hooks/race/useRaceBadges.ts`, `useStartRaceSeason.ts`, `useRaceTrigger.ts`
- **Criar**: `VictoryLapOverlay.tsx`, `RaceBadgeShowcase.tsx`, `StartSeasonDialog.tsx`
- **Editar**: `src/pages/RaceArena.tsx` (overlay + tabs badges + botão admin), `src/hooks/sales/useCreateSale.ts` (trigger), `supabase/config.toml`, `src/components/race/index.ts`

Após esta entrega, sigo automaticamente para **Race Arena Fase 3/3**: power-ups coletáveis na pista + countdown 3-2-1-GO + mini-card "Meu Carro" no `GamifiedProfile` — fechando o módulo em 10/10. Depois retomo **Revenue Intelligence 2/4: Pipeline Coverage Analyzer**.
