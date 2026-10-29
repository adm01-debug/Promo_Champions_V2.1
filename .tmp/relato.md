# Relato — Onda C: dead-code + dedupe de métricas

## O que fiz

1. **Bug — loading infinito em KnownDevices** (`src/components/security/KnownDevices.tsx`):
   early return `if (!user) return;` pulava `setIsLoading(false)` — componente ficava
   em skeleton para sempre na `/configuracoes` (montado no PR #272).
   Teste novo (`KnownDevices.test.tsx`): vermelho antes do fix, verde depois (2 testes).

2. **Dead-code — 4 componentes órfãos removidos** (813 linhas, zero referências,
   zero testes, confirmado por grep residual): `RoleManager` (dup de RoleManagement),
   `IPWhitelistPanel` (dup de IPWhitelistManager), `MFAVerification` (dup do MFA
   nativo), `ReauthDialog` (sem caller). `useOrderTrackingDetail` preservado
   (teste próprio, export legado vivo).

3. **A11y — AuthFormCard**: 4 `animate-spin` sem `motion-safe:` corrigidos
   (prefers-reduced-motion). ~240 arquivos com o mesmo padrão ficam como dívida
   registrada em `.tmp/achados.md` (churn sistêmico, cartão próprio).

4. **Dedupe de métricas — winRate centralizado** (`src/lib/winRate.ts` nova):
   12 call-sites reimplementavam `wins/(wins+losses)` à mão com duas grafias.
   Verificado que são equivalentes via CHECK constraints
   (`outcome IN ('won','lost')` em `deal_outcomes` e `win_loss_analyses`).
   Refatorados: useWinLossAnalysis (3x), useWinLossAggregations (4x),
   useSeasonComparison, useWinLossCohort, useICPCorrelation, useWinByHourMatrix,
   useInsightsImpact, useSalespersonCoaching, usePerformanceComparison.

5. **Fix semântico real — useSentimentTrend**: dividia `wins` por TODAS as
   vendas vinculadas às call_recordings (incluindo abertas/em andamento) —
   winRate sistematicamente menor que o restante do CRM para o mesmo rótulo.
   Alinhado para denominador decidido via `isLostSaleStatus`.

6. **Drift check cego corrigido** (`migrations-drift.yml`): `supabase migration
   list` retorna versões com crases; o awk `^[0-9]+$` rejeitava tudo → lista de
   pendentes sempre = repo inteiro (654) e drift real nunca detectado. Extração
   agora pega só dígitos. Provado localmente com o formato real do output.

7. **Workflow db-probe** (`db-probe.yml` + `gen-migration-probes.mjs`): sondagem
   read-only para reconciliar ledger de migrations — gerador extrai objetos-
   signature (funções, tabelas, triggers, crons, policies) por migration.
   Execução adiada por decisão do Joaquim (resolver com Claude).

8. **Fix backup diário** (`db-backup.yml`): Supabase migrou para Postgres 17.6 e
   o `pg_dump` 16 do runner falhava com version mismatch (backup off-site quebrado).
   Container `postgres:17` alinha a major do cliente com a do servidor.

9. **Correções da auditoria pós-implementação** (2 auditores independentes):
   - Dedupe completado: +6 call-sites migrados (useScriptABTest, useSelfBenchmark,
     useWinLoss deal-intel, ICPPerformanceChart 2x, useBICloser, WinLossDrillDown
     barras). Divergências NÃO migradas documentadas: usePipelineVelocity (fração
     0-1 de velocity score), HistoricalBenchmark (RPC sem lost_deals — exige
     migration), ConversionAnalysis (conversão de funil).
   - KnownDevices: cleanup no useEffect — setState não roda após desmontagem/
     troca de usuário (flag isCancelled).
   - AuthFormCard: useReducedMotion nas 4 animações framer-motion + motion-safe:
     nas 8 transitions Tailwind restantes (a11y completo do card).
   - DOCUMENTACAO_SISTEMA.md: removidas entradas de componentes deletados e
     fantasma (SessionManager nunca existiu).
   - Prova de mutação real: revertendo setIsLoading(false) o teste falha
     (vermelho), restaurando passa (verde).
   - Teste novo cobre call-sites reais: aggregateBySalesperson e
     aggregateByCompetitor (funções puras exportadas) — 5 testes.

## Prova

- `npx vitest run` — **680 testes, 72 arquivos, 0 falhas** (era 670; +5 lib
  winRate, +5 agregações)
- `npx tsc --noEmit` — 0 erros
- `npx eslint` nos arquivos tocados — 0 avisos
- `lint-ratchet` — baseline=0, atual=0, novas=0
- `npm run deps:check` — 0 errors (0 órfãos em 2097 módulos)
- Vermelho→verde com mutação real: removendo `setIsLoading(false)` o teste
  de KnownDevices falha; restaurando, passa
- winRate.test.ts cobre o contrato da fórmula única; simulação em massa com
  40.401 combinações: zero divergência vs grafias antigas
- Grep residual dos 4 componentes removidos: nenhuma referência

## Não verificado / limitações

- Validação remota do drift check corrigido: pendente (precisa do workflow na main)
- Sondagem do ledger de migrations: workflow criado, execução adiada
- E2E (/configuracoes, /automation-builder, win-loss): bloqueado sem banco — Claude
- O fix semântico de useSentimentTrend muda o número exibido no gráfico
  Sentimento×WinRate (sobe, pois deixa de contar vendas abertas como perda) —
  alinhamento intencional ao padrão do produto
