# Frontend `.in()` Audit — Onda J

**Data:** 2026-07-22
**Escopo:** `src/**` — todas as 126 chamadas `.in(...)` em hooks/services/components.

## Metodologia

1. `rg -n "\.in\(['\"]"` catalogou 126 call-sites.
2. Cada call-site classificado por:
   - **Coluna** consultada
   - **Argumento**: array literal estático, whitelisted enum column, ou dinâmico (IDs UUID/email/token).
   - **Cardinalidade máxima** observada no código (limites via `.slice()`, `.limit()`, filtros de UI).
3. **P0** apenas quando array de IDs vem de estado dinâmico sem cap explícito e a fonte pode crescer (times inteiros, resultados de query anterior sem limite).

## Whitelist de colunas enumeráveis

Estas colunas têm domínio fechado e arrays literais nunca ultrapassam ~10 elementos — **sem risco de overflow**:

`status`, `role`, `severity`, `tier`, `stage`, `channel`, `type`, `outcome`, `event_type`, `kind`, `contact_type`, `objection_type`, `velocity_status`, `entity_type`, `segment`, `tiers`.

**Cobertura:** ~85 das 126 chamadas (67%). Zero risco.

## Já cobertas por `chunkedIn` (client)

29 call-sites já usam o helper `src/lib/supabase/chunkedIn.ts` via padrão `.in('id', chunk as string[])`. Exemplos:

- `useWinLossSalespersonStats`, `useWinLossData`, `useWinLossCohort`
- `useLeadScoring`, `useDealAnalyticsVelocity`, `useClientPortfolio`
- `useBulkQuoteCadenceMutations`, `useBulkApprovals`
- `useV4Callbacks` (3x), `usePlaybookQueries`
- `useReplayAudit`, `useWebhookDeadLetters`, `useInsightComments`
- `useCadenceQueries`, `useSequenceVariantsOverview`
- `useSalesAssistant` (conversation_id chunk), `useSentimentTrend`
- `DealSummaryCard`, `CohortAnalysis`

**Status:** ✅ Blindados.

## Call-sites com cap explícito (≤ 100)

Naturalmente seguros — `.slice(0, N)` ou `.limit(N)` antes do `.in()`:

- `WinLossDealsDrawer.tsx:68` — `saleIds` capado em `.slice(0, 100)` (linha 59).
- `LeadSLAMonitor.tsx:34` — fallback `['none']` quando vazio; leadIds vêm de query com `.limit()`.

**Status:** ✅ Aceitável.

## P0 residuais → refatorar

Arrays de IDs dinâmicos sem cap explícito que podem crescer com número de vendedores/temporadas/carros. Baixa probabilidade de overflow hoje (equipes pequenas), mas escala linear com o tamanho do time.

| # | Arquivo | Linha | Coluna | Fonte do array | Risco atual | Ação |
|---|---------|-------|--------|----------------|-------------|------|
| 1 | `hooks/useSDRMetrics.ts` | 89, 110 | `salesperson_id` | `sdrIds` (SDRs ativos) | Baixo (~50) | Aceitar — cardinalidade é limitada por RLS/time; adicionar comment de tolerância |
| 2 | `hooks/useSDRActivityTrend.ts` | 90, 112 | `salesperson_id` | `sdrs.map(s=>s.id)` | Baixo (~50) | Idem |
| 3 | `hooks/useCloserMetrics.ts` | 85, 164 | `salesperson_id` | `closerIds` | Baixo (~50) | Idem |
| 4 | `hooks/bi/useBISDR.ts` | 86 | `salesperson_id` | `allSDRs.map(s=>s.id)` | Baixo (~50) | Idem |
| 5 | `hooks/useProductRecommendations.ts` | 33 | `client_id` | `clientIds` | **Médio** — pode crescer com portfolio | ⚠️ Wrapear em `chunkedIn` |
| 6 | `hooks/revenue/useQuotaAttainmentPredictor.ts` | 93 | `forecast_id` | `forecastIds` | Baixo (~12/ano) | Aceitar |
| 7 | `hooks/race/useRaceTeams.ts` | 51, 61 | `team_id`, `car_id` | derivado | Baixo (~20) | Aceitar |
| 8 | `hooks/race/useChampionsHistory.ts` | 43, 44 | `season_id`, `salesperson_id` | histórico | Baixo | Aceitar |
| 9 | `hooks/race/useRaceReactions.ts` | 30 | `target_car_id` | `carIds` | Baixo | Aceitar |
| 10 | `hooks/sales/useSalesAssistant.ts` | 359 | `id` | `convIds` (últimas conversas) | Baixo (paginado) | Aceitar |

**Refatorações efetivas nesta onda:** #5 (`useProductRecommendations` — client portfolio pode exceder 200).

Demais casos ficam documentados como "aceitos por design" — cardinalidade fundamentalmente limitada pela cardinalidade de vendedores/times.

## Guard-rails complementares

- **Helper client `chunkedIn`**: existe em `src/lib/supabase/chunkedIn.ts` desde Onda I.
- **Testes Vitest**: `src/lib/supabase/chunkedIn.test.ts` — cobertura de empty/chunking/order/error/parallel.
- **Lint estático Deno**: `supabase/functions/_shared/chunked_in_lint_test.ts` — 0 ofensores.
- **Smoke test Deno**: `supabase/functions/_shared/chunked-in_smoke_test.ts` — 250 UUIDs, paralelo, erro.
- **Notification categories guard**: `supabase/functions/_shared/notification-categories.ts` + testes — previne regressão do `notifications_category_check`.

## Veredicto

Frontend está estruturalmente seguro. O único item ativo desta onda é #5. Todos os demais foram avaliados e classificados como "cardinalidade naturalmente limitada".
