## Onda C — dead-code, dedupe de métricas, drift check e fixes de CI

### Correções de bug
- **`KnownDevices`**: loading infinito quando `user` é `undefined` — early return pulava `setIsLoading(false)`. Afetava `/configuracoes` (montado no #272). Teste vermelho→verde incluído.
- **`useSentimentTrend`**: winRate dividia `wins` por **todas** as vendas vinculadas (incluindo abertas) — KPI sistematicamente menor que o restante do CRM. Alinhado para `wins/(wins+losses)` via `isLostSaleStatus`.

### Dead-code
- Removidos 4 componentes órfãos (813 linhas, zero refs, zero testes): `RoleManager`, `IPWhitelistPanel`, `MFAVerification`, `ReauthDialog`.

### Dedupe de métricas
- Nova `src/lib/winRate.ts` — fonte única da fórmula. **18 call-sites** reimplementavam `wins/(wins+losses)` à mão (equivalentes pelos CHECK constraints `outcome IN ('won','lost')`). Refatorados: useWinLossAnalysis, useWinLossAggregations, useSeasonComparison, useWinLossCohort, useICPCorrelation, useWinByHourMatrix, useInsightsImpact, useSalespersonCoaching, usePerformanceComparison, useScriptABTest, useSelfBenchmark, useWinLoss (deal-intel), ICPPerformanceChart (2×), useBICloser, WinLossDrillDown.
- **Não migrados, documentados**: `usePipelineVelocity` (fração 0–1 de velocity score, métrica distinta), `HistoricalBenchmark` (RPC `get_monthly_sales_benchmark` não expõe `lost_deals` — exige migration), `ConversionAnalysis` (conversão de funil).

### CI/Infra (achados da auditoria de sincronização)
- **`migrations-drift.yml` estava cego**: `supabase migration list` retorna versões com crases; o awk `^[0-9]+$` rejeitava tudo → "pendentes" = repo inteiro (654) e drift real nunca detectado. Parser agora extrai só dígitos.
- **`db-backup.yml` quebrado**: instalava `postgresql-client-16` mas o Supabase migrou para **Postgres 17.6** (server version mismatch). Job agora roda em container `postgres:17`.
- **`db-probe.yml`** (novo): sondagem read-only do ledger de migrations + gerador `gen-migration-probes.mjs`.

### A11y (prefers-reduced-motion)
- `AuthFormCard` completo: 4 `animate-spin` + 8 transitions Tailwind com `motion-safe:` + 4 animações framer-motion condicionadas a `useReducedMotion` (entrada, gradiente infinito, shine do botão, banner de lockout).
- `KnownDevices`: fetch cancela setState após desmontagem/troca de usuário.

### Robustez extra
- Prova de mutação real em `KnownDevices` (revertendo o fix, o teste falha).
- Teste de call-sites reais: `aggregateBySalesperson`/`aggregateByCompetitor` (5 testes).
- `DOCUMENTACAO_SISTEMA.md`: removidas entradas de componentes deletados e `SessionManager` fantasma (nunca existiu).

### Gates
- 680 testes (72 arquivos) · tsc 0 erros · eslint 0 avisos · lint-ratchet 0 · deps:check 0 órfãos (2097 módulos)
- Simulação massiva winRate: 40.401 combinações, zero divergência vs fórmulas antigas
- Auditoria adversarial por 2 agentes independentes: todas as lacunas reais corrigidas

### Não coberto (registrado em `.tmp/achados.md`)
- ~240 `animate-spin` sistêmicos — cartão próprio
- Sondagem do ledger (`probe.sql`) — execução agendada
- Edge function `cron-failure-alerter` retorna 401 no teste E2E — secret `SUPABASE_SERVICE_ROLE_KEY` do GitHub provavelmente diverge do valor real (formato `sb_secret_` vs JWT legado)
