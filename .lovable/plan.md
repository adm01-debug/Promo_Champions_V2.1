
Status atual: Race Arena está em **10/10 + Hardening Round 2** — todos os bugs (B1–B5) e as 6 melhorias da última rodada já estão aplicados. Para continuar evoluindo rumo a "perfeição contínua", proponho **Hardening Round 3** focado em observabilidade, performance e DX.

## Plano: Race Arena Hardening Round 3

**Melhoria 1 — Trigger DB que valida `race_events`**
- Função `validate_race_event()` + trigger BEFORE INSERT em `race_events`:
  - Bloqueia eventos com `season_id` de temporada inativa/encerrada.
  - Bloqueia eventos sem `race_car` correspondente para o `salesperson_id`.
  - Garante `points >= 0`.
- Substitui a query de auditoria semanal (Round 2) por prevenção em tempo real.

**Melhoria 2 — Índice composto para leaderboard**
- Migration: `CREATE INDEX race_events_season_salesperson_idx ON race_events (season_id, salesperson_id, created_at DESC)` para acelerar agregações do leaderboard (hoje sequential scan em ~milhares de eventos).

**Melhoria 3 — Realtime opt-in nos hooks Race**
- `useRaceLeaderboard` e `useRaceEvents` hoje fazem subscribe sem `cleanup` defensivo se o componente desmonta durante reconnect. Adicionar `AbortController` + dedupe de canais por `seasonId`.

**Melhoria 4 — Skeleton states padronizados**
- HUD do Closer/SDR mostra "Carregando…" texto puro durante fetch inicial. Substituir por `<Skeleton>` shimmer (padrão UX 10/10 do projeto) em `RaceLeaderboardCard`, `MyCarStatusCard`, `CommentaryFeed`.

**Melhoria 5 — Telemetria de performance**
- Instrumentar `track('race_view_loaded', { route, ms })` em `RaceArenaCloser`, `RaceArenaSdr`, `RaceArenaTV`, `RaceArenaAdmin` para medir TTI por rota (consumido pelo Product Analytics existente).

**Melhoria 6 — Documentação operacional**
- Criar `docs/runbooks/race-arena.md` com:
  - Como criar nova temporada (admin UI + SQL fallback)
  - Como reprocessar eventos órfãos
  - Como invalidar cache da `race-commentary`
  - Troubleshooting realtime/RLS
- Atualizar `docs/reports/race-arena-test-report.md` para **10/10 + Hardening Round 3**.

## Entregáveis
- 1 migration (trigger validação + índice composto)
- 2 hooks editados (`useRaceLeaderboard`, `useRaceEvents`)
- 3 componentes editados (skeletons)
- 4 páginas instrumentadas (telemetria)
- 1 runbook novo + relatório atualizado

Execução sequencial e autônoma após aprovação.
