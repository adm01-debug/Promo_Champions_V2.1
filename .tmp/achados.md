# Achados fora do escopo (para os blocos seguintes da Onda C)

- Candidatos a dead-code (bloco `dead-code`): `RoleManager` (dup de `RoleManagement`), `IPWhitelistPanel` (dup de `IPWhitelistManager`), `MFAVerification` (dup do MFA nativo do login em `useAuthForm`), `ReauthDialog` (sem caller), `useOrderTrackingDetail` (export legado documentado).
- `KnownDevices.tsx`: loading infinito quando `user` é undefined (pré-existente).
- Parte do "montável" da auditoria já estava roteada em `main`: `/conversational-intelligence`, `/deal-intelligence`, `/seguranca`, `PasskeySettings`, `GeoBlockingManager`, `MFASetup`.
- `AuthFormCard` tinha outros `animate-spin` sem `motion-safe:` pré-existentes (botão Google, submit, MFA) — padronizar em bloco futuro.
- Passkey depende do backend `webauthn` deployado; sem validação manual em browser nesta tarefa.

## Bloco dead-code + dedupe (executado nesta sessão)

- REMOVIDOS: RoleManager, IPWhitelistPanel, MFAVerification, ReauthDialog (813 linhas, zero refs, zero testes).
- FIX: KnownDevices travava em skeleton infinito sem usuario autenticado (early return sem setIsLoading(false)).
- FIX: AuthFormCard — 4 animate-spin sem motion-safe: (prefers-reduced-motion).
- DEDUPE: src/lib/winRate.ts criada — 12 call-sites reimplementavam wins/(wins+losses) a mao.
- FIX SEMANTICO: useSentimentTrend dividia wins por TODAS as vendas vinculadas (incluindo abertas) — winRate subestimado vs restante do CRM.

### Divida registrada (fora de escopo / bloqueada)
- ~240 arquivos com animate-spin sem motion-safe: — padronizacao sistemica, cartao proprio (sed em massa seguro mas churn grande).
- E2E quebrado (/configuracoes, /automation-builder, win-loss): precisa de banco — pacote do Claude.
- Sondagem do ledger de migrations (.tmp/probe.sql): adiada por decisao do Joaquim — resolver com Claude.
- avgTicket/avgDealSize replicado em 3 hooks (useVendasMacro, usePerformanceComparison, useSalespersonCoaching): mesma formula, denominadores com filtros diferentes — dedupe requer revisao de semantica de cada um.

## Auditoria pos-implementacao (rodada 2)

- DEDUPE COMPLETADO: mais 6 call-sites migrados para lib winRate (useScriptABTest, useSelfBenchmark,
  useWinLoss deal-intel, ICPPerformanceChart 2x, useBICloser, WinLossDrillDown barras).
- FIX: KnownDevices — fetch agora cancela setState apos desmontagem/troca de usuario (isCancelled flag).
- A11Y: AuthFormCard — useReducedMotion nas animacoes framer-motion (entrada x:40, gradiente infinito,
  shine do botao, banner lockout) + motion-safe: nas 8 transitions Tailwind.
- DOCS: DOCUMENTACAO_SISTEMA.md — removidas entradas de componentes deletados; RoleManager ->
  settings/RoleManagement; SessionManager nao existia (fantasma).
- PROVA MUTACAO: removido setIsLoading(false) -> teste falhou; restaurado -> verde.

### Divergencias NAO refatoradas (semantica diferente — revisao de negocio)
- usePipelineVelocity.ts: fracao won/criadas (inclui abertas), retorna 0-1, componente de velocity
  score — metrica distinta de winRate, NAO e win rate.
- HistoricalBenchmark.tsx: won_deals/deals onde deals=COUNT(*) inclui abertas (RPC
  get_monthly_sales_benchmark nao retorna lost_deals) — divergencia real, corrigir exige migration.
- ConversionAnalysis.tsx: wonDeals/totalDeals do funil (1o -> ultimo estagio) — conversao de funil,
  nao win rate.

## Auditoria adversarial rodada 3 (2 agentes + simulacoes)

- FIX REAL: winRate() agora sanitiza entradas (NaN/Infinity/negativos -> 0) — contrato 0-100.
- FIX REAL: useWinByHourMatrix e useScriptABTest consultavam so 'won'/'lost' literais na tabela
  sales — omitiam completed/closed/cancelled do enum canonico (subcontagem real). Agora usam
  WON_SALE_STATUSES + LOST_SALE_STATUSES.
- FIX REAL: useInsightsImpact ignorava error das 2 queries — falha virava "sem dados".
- FIX REAL: useSalespersonCoaching — comparisonToTeam forcava 0 quando equipe=0 mesmo com taxa
  pessoal >0 (escondia a diferenca real).
- FIX REAL: pricing-intelligence (edge fn) — win_rate incluia vendas abertas nos denominadores
  (buckets de desconto, elasticidade, win_rate por produto, fallback); tambem omitia
  closed/cancelled do enum. decidedRows introduzido.
- FIX: HistoricalBenchmark — rotulo "Win Rate" renomeado para "Taxa de Ganho" (metrica e
  won_deals/deals com COUNT(*) incluindo abertas; conversao do pipeline, nao win rate decidido).
  Correcao semantica real exige lost_deals na RPC (migration) — registrado.
- FIX: gen-migration-probes — strip de comentarios SQL (4 probes fantasmas provadas) +
  CREATE OR REPLACE TRIGGER capturado.
- FIX: migrations-drift — falha explicita quando zero versoes extraidas (gate cego).

### Divida registrada (fora de escopo seguro / exige migration ou bloco proprio)
- SQL: aggregate_sales_stats, calculate_team_performance, calculate_asset_efficiency dividem
  por todas as vendas (inclui abertas) — mexer exige migration em prod.
- ~12 edge functions + run-win-loss-analysis.ts duplicam a formula wins/(wins+losses) — a lib
  TS nao alcanca Deno; criar _shared/winRate.ts e migrar em bloco proprio.
- Status canonicos incompletos em edge functions: revops-hub classifica so 'completed' como
  ganho e trata won/closed como OPEN (bug invertido real); qbr-generator, coaching-intelligence,
  predictive-intelligence, calibrate-win-probability(ies), pipeline-pulse-aggregator com
  listas literais incompletas — revisao dedicada necessaria (risco de mudar numeros de prod).
