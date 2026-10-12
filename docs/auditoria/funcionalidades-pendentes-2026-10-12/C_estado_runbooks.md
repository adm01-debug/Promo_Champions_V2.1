# Anexo C — Docs de estado, runbooks e postmortem: gaps verificados no código (HEAD 6f6b94a, 2026-10-11)

> Versão final. Base: 644 migrations, 172 edge functions (174 entradas em supabase/functions/, incluindo `_shared`), 175 `path=` em AppRoutes.tsx.
> Limite: banco de produção NÃO consultado (o MCP do projeto não estava disponível nesta sessão). "JÁ RESOLVIDO" quer dizer resolvido no repositório (migration ou código), não comprovado em produção. Há evidência forte de que migrations pós-agosto não foram aplicadas em prod (20260913150000:10-17; IDENTIDADE_BANCO §3).
> Escala: PARCIAL · NÃO INICIADO · DIVERGENTE (o doc ou o repo contradiz o código/prod) · JÁ RESOLVIDO · NÃO VERIFICÁVEL (depende só de banco, cofre ou painel) · OK (a referência do runbook existe).

## ESTADO_ATUAL.md (medição 2026-08-16)

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| 2 arquivos não compilam (nlq-query, ai-copilot: import dentro de bloco import) | ESTADO_ATUAL.md:124-131 | JÁ RESOLVIDO | supabase/functions/nlq-query/index.ts:3-15 e ai-copilot/index.ts:1-10 com imports bem-formados | — |
| useOrderTracking mistura pedidos falsos | ESTADO_ATUAL.md:164 | JÁ RESOLVIDO | src/hooks/orders/useOrderTracking.ts:88,112 lê `orders`; sem "Acme"/fallback (122 linhas) | — |
| Analytics.tsx monta CompetencyRadar/ChurnPredictionPanel/LTVBySegment sem props | ESTADO_ATUAL.md:165 | PARCIAL | LTVBySegment agora consulta supabase (LTVBySegment.tsx:38-50); mas Analytics.tsx:111,113 ainda mapeia `CompetencyRadar`/`ChurnPredictionPanel` sem props → `DEFAULT_DATA`/`DEFAULT_PREDICTIONS` ("Tech Solutions LTDA", ChurnPredictionPanel.tsx:47-51,244; CompetencyRadar.tsx:82) | Passar dados reais ou remover os defaults fictícios |
| src/lib/bi/mockData.ts ("MacBook/Herman Miller") em /ferramentas/bi | ESTADO_ATUAL.md:166 | JÁ RESOLVIDO | ausente: `src/lib/bi/` só tem dossierPdfGenerator/industryRecommendations/markupOverviewHelpers; grep "MacBook\|Herman Miller" em src/ = 0 | — |
| Simulador com baseRevenue = 2.500.000 fixo | ESTADO_ATUAL.md:167 | NÃO INICIADO | src/components/predictive/PredictiveScenarioPlanner.tsx:20 `const baseRevenue = 2500000;` renderizado em PredictiveIntelligenceDashboard.tsx:179 | Derivar de receita real (sales won) |
| atRiskFixtures renderizadas em /win-loss-intelligence | ESTADO_ATUAL.md:168 | NÃO INICIADO | src/lib/winloss/index.ts:6 `export * from './atRiskFixtures'`; src/components/win-loss/AtRiskDealsFromPatterns.tsx:30,152,419,429 ainda usa `DOMINANT_PATTERNS_LIST` fictício | Tirar do barrel; catálogo via `win_loss_patterns` |
| FollowUpAudit concatena leads inventados | ESTADO_ATUAL.md:169 | JÁ RESOLVIDO | src/pages/FollowUpAudit.tsx:79-105 consulta só `follow_up_audit_view` | — |
| UsageAnalytics `login_count = Math.random()` | ESTADO_ATUAL.md:170 | JÁ RESOLVIDO | grep `Math.random\|login_count` em src/pages/UsageAnalytics.tsx = 0 | — |
| usePrizeWheel sorteia no navegador e grava direto | ESTADO_ATUAL.md:171 | JÁ RESOLVIDO | src/hooks/gamification/usePrizeWheel.ts:77 `supabase.rpc('spin_prize_wheel')`; migration 20260830000001_secure_prize_wheel_spins.sql | — |
| `sales.status='completed'` inexistente filtrado em views/RPCs/hooks | ESTADO_ATUAL.md:181-183 | PARCIAL | Migration 20261001220100_sales_status_canonico.sql (deal_status GENERATED mapeia won/closed→completed); vários hooks migrados para `['won','completed']` (useABCAnalysis.ts:81, useLeadRouting.ts:124). Ainda só `'completed'`: LTVBySegment.tsx:45, useDealProbability.ts:68, useCloserMetrics.ts:170 | Centralizar constante WON_STATUSES e aplicar em todos os filtros de `sales.status` |
| `sales.stage` NULL em 100% → forecast ponderado R$0 | ESTADO_ATUAL.md:184 | PARCIAL | Tabela `stage_probabilities` + `get_stage_probability` (20261001220000_stage_probabilities.sql:17-58); não há backfill de `sales.stage` no repo | Backfill/derivação de stage; validar forecast com dado real |
| Hooks leem `deal_stage_history` (vazia) em vez de `deal_stage_transitions` | ESTADO_ATUAL.md:185-186 | NÃO INICIADO | Ainda leem `deal_stage_history`: useFunnelData.ts:35, useClosingTime.ts:15, usePipelineVelocity.ts:29, useWeightedForecast.ts:68, useDealSLAs.ts:39, useFunnelComparison.ts:30, useBICloser.ts:168, useDealTimeline.ts:50, useDealAnalyticsVelocity.ts:65, DealPreviewCard.tsx:70 + edge fns analyze-stage-conversion:181, deal-probability:51, predict-deal-velocity:177, refresh-stage-baselines:53, lead-scoring:71, sales-assistant-chat:294 | Trocar fonte para `deal_stage_transitions` ou popular `deal_stage_history` via trigger |
| pipeline-pulse-aggregator lê `sales.total_amount` | ESTADO_ATUAL.md:187 | JÁ RESOLVIDO | supabase/functions/pipeline-pulse-aggregator/contract_test.ts:36 assegura ausência de `total_amount` | — |
| predict-quota-attainment lê `salespeople.monthly_goal` (inexistente) | ESTADO_ATUAL.md:188 | NÃO INICIADO (sem prova de coluna) | supabase/functions/predict-quota-attainment/index.ts:155,231 ainda seleciona `monthly_goal`; nenhuma migration pós-auditoria cria a coluna (últimas citações 20260513*) | Ler meta de `goals`/`salesperson_goals` ou criar coluna |
| useForecastAccuracy: tabela vazia → "MAPE 0,0% Excelente" | ESTADO_ATUAL.md:190-191 | NÃO INICIADO | src/hooks/revenue-intelligence/useForecastAccuracy.ts:81-83 (`avgMape = rows.length ? … : 0`); ForecastAccuracySummary.tsx:27 chama `mapeHealth(0)` sem empty-state → forecastHelpers.ts:27 "Excelente" | Empty-state quando `sample_size === 0` |
| Exposição anônima de products/suppliers/teams | ESTADO_ATUAL.md:193-201 | JÁ RESOLVIDO (repo) | 20260831130000_harden_public_access_and_privileged_rpcs.sql:27-29,53-55 (REVOKE anon, DROP policies públicas) | Confirmar em prod com `SET ROLE anon` |
| Proteção de clients/activities "acidental" via has_permission quebrada | ESTADO_ATUAL.md:206-209 | JÁ RESOLVIDO (repo) / atenção | has_permission e policies dependentes removidas: 20261001203100_drop_legacy_rbac.sql:24-40. Porém 20261005140000_restore_anon_execute_rls_helpers.sql:13-16 faz exatamente o "GRANT EXECUTE a mais" para anon em helpers de RLS (mitigado por `auth.role()='anon'`→NULL) | Teste de regressão `SET ROLE anon` em clients/activities/sales no CI |
| Ledger de migrations ausente (schema_migrations) / 3 tabelas sem CREATE TABLE | ESTADO_ATUAL.md:90-104 | NÃO INICIADO | `_internal_secrets`, `geo_access_logs`, `geo_blocked_regions`: grep `CREATE TABLE` em supabase/migrations = 0, embora `_internal_secrets` seja lido por 20260910153000:31-35 e 20261001160000:8-10; existe workflow .github/workflows/migrations-drift.yml | Migration de baseline para as 3 tabelas; reconstruir ledger |
| `call_tracking` declarada no repo e ausente no banco | ESTADO_ATUAL.md:99 | DIVERGENTE (inalterado) | supabase/migrations/20260104182000_additional_tables.sql ainda declara; nenhum consumidor em src | Remover da migration-base ou aplicar |
| Cron `reset-pg-stat-statements-weekly` quebrado | ESTADO_ATUAL.md:152 | JÁ RESOLVIDO (repo) | wrapper `public.reset_pg_stat_statements_weekly()` (20260831130001_repair_cron_and_fk_indexes.sql:193-206) reagendado em 20260913150000_restore_sql_maintenance_crons.sql:33 | Confirmar `cron.job_run_details` |
| Crons `weekly-matchmaking` e `purge-telemetry-retention-daily` quebrados | ESTADO_ATUAL.md:150-151 | DIVERGENTE / NÃO INICIADO | Funções recriadas em 20260831130001:141,290, mas 20260913150000:10-14 declara que em 2026-09-13 elas **não existiam em prod** e exclui os 2 jobs "DE PROPÓSITO"; nenhuma migration posterior agenda `'weekly-matchmaking'` ou `'purge-telemetry-retention-daily'` | Aplicar 20260831130001 em prod e reagendar os 2 jobs |
| `detect_stalled_cron_jobs` viola `cron_failure_alerts_unique` (detector mudo) | ESTADO_ATUAL.md:154-155 | NÃO INICIADO | 20260913150000:13-14 exclui jobid 20 por 3.928/4.672 falhas; sem correção posterior | Corrigir upsert e reagendar |
| Jobs HTTP apontavam p/ projeto antigo; functions não publicadas no projeto oficial | (achado novo em 20260913150000:15-17) | PARCIAL | 20260910153000 e 20261001160000 centralizam URL via `_internal_secrets`; publicação das functions em `usyxfpqlsspldubptrdl` NÃO VERIFICÁVEL (limite de 100 deployadas, CLAUDE.md §4) | Inventário de functions deployadas vs. allowlist de crons |
| cron-failure-alerter nunca agendado | ESTADO_ATUAL.md:143-144 | JÁ RESOLVIDO (repo) | job `cron-failure-alerter-10min` em 20260910153000_reconcile_operational_edge_crons.sql | — |
| ~40 funções "jobs" nunca agendadas (check-lead-sla, sequence-runner, qbr-scheduler, detect-stuck-deals; process-cadence-tasks só via /cadencias) | ESTADO_ATUAL.md:139-141 | PARCIAL | Agendadas hoje (migrations): campaign-health-alert, check-v4-callback-alerts, cron-failure-alerter, deal-risk-digest, detect-client-churn-alerts, edge-retry-threshold-alert, email-bulk-retry, notify-v4-quote-status, process-call-recording-ingest, wal-health-alert, webvitals-regression-alert, winloss-webhook-health-monitor. Sem `cron.schedule`: check-lead-sla, sequence-runner, qbr-scheduler, detect-stuck-deals, process-cadence-tasks, rotate-daily-challenges | Agendar os jobs de negócio (SLA de lead, cadência, sequência, stuck deals, desafios diários, QBR) |
| npm ci quebrado (lock dessincronizado) | ESTADO_ATUAL.md:108-110 | JÁ RESOLVIDO (provável) | package-lock.json:16450 contém `node_modules/sucrase` | (lote 12 cobre CI) |
| `docs/TEST_QUALITY_REPORT.md` com números hardcoded | ESTADO_ATUAL.md:119-120 | JÁ RESOLVIDO | arquivo removido (ls → inexistente) | — |
| Deno tests sem runner / functions sem lint | ESTADO_ATUAL.md:121-122 | PARCIAL | `deno lint` em .github/workflows/pr-checks.yml:270; `deno test` só em cron-monitoring.yml:85, qa-exhaustive.yml:81-86, edge-functions-request-id.yml:57 | (detalhe no lote 12) |
| Próximo passo 10: decidir destino de Race (11.930 ln), webhooks Win/Loss, 24 EF órfãs, 16 integrações | ESTADO_ATUAL.md:342-346 | PARCIAL | winloss-webhook-health-monitor agora agendado (20261001144000); Race recebeu correções (20260830000000, 20260904190000, 20261005190000) — não há decisão documentada de arquivar | Registrar decisão (ativar/arquivar) por subsistema |

## README.md (docs/estado)

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| Medição de 2026-08-16 apresentada como estado; "comece por ESTADO_ATUAL" | README.md:3-5 | DIVERGENTE | ESTADO_ATUAL.md:3 cita banco `rapjswienfhkobhlamxb`; CLAUDE.md e IDENTIDADE_BANCO_2026-09-13.md fixam `usyxfpqlsspldubptrdl`; repo tem 644 migrations (ESTADO_ATUAL fala em 584) e 174 dirs de functions (doc: 168) | Carimbo "histórico/superado" no README + ponteiro para remediações pós-2026-08-30 |
| Contagens de unidades (174 rotas, 168 EF) | README.md:11-23 | DIVERGENTE | AppRoutes.tsx: 175 `path=`; `ls supabase/functions` = 174 entradas (inclui _shared) | Recontar ou marcar como snapshot |

## 01_FRONTEND_ROTAS.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| 20 rotas ⬛ sem nenhum link/menu: /race-arena/tv, /race-arena/spectator/:id, /abm, /fornecedores, /comparador-precos, /admin/fila-tarefas-automaticas, /admin/regras-inatividade, /admin/alertas-churn, /admin/supressao-emails, /bi-vendedor, /relatorio-atividades, /analytics/emails, /previsao-demanda, /perfil-gamer, /desafios-diarios, /territorios, /admin/quote-sync-inbound, /admin/tarefas, /admin/webhooks-alert-history, /admin/webhooks-alert-settings | 01:43-207, 233-264 | NÃO INICIADO (20/20) | grep `'<rota>'` em src/ (fora de AppRoutes/lazyPages) → só mapas de título/prefetch (useMobileNavigation.ts:34-35, NavLink.tsx:17,37 prefetch, Breadcrumbs.tsx) e telemetria (RaceArenaTV `useRaceViewTelemetry`); `MenuItem` sem nenhum desses `url` em sidebarMenuData.ts | Adicionar ao menu/AdminQuickLinks ou remover rota |
| Link quebrado `/desafios-semanais` na CommandPalette | 01:266-267 | NÃO INICIADO | src/components/command/CommandPalette.tsx:277 `guardedNavigate('/desafios-semanais')`; rota inexistente (AppRoutes.tsx:869 só `/desafios`) | Trocar para `/desafios` |
| Páginas órfãs `ConversationalIntelligence.tsx` (319 ln) e `RaceArena.tsx` | 01:217-231 | NÃO INICIADO | ambos os arquivos ainda existem em src/pages/ | Remover ou reaproveitar |
| Rotas só com entrada frágil (/follow-up, /analytics/closing-time, /deal-velocity, /evolution, /objections, /vendedor/:id) | 01:269-274 | NÃO INICIADO | `MenuItem` (sidebarMenuData.ts:61-65) não referencia; nenhuma alteração detectada | Entrada de menu |
| Menu não aplica RBAC (itens Manager visíveis a todos) | 01:299 | NÃO INICIADO | `interface MenuItem {title,url,icon}` sem papel (src/components/layout/sidebar/sidebarMenuData.ts:61-65); só `adminOnlyItems` filtrado (src/components/organisms/AppSidebar.tsx:287-296) | Metadado de papel por item + filtro |
| Guarda duplicada em páginas | 01:298 | NÃO INICIADO | `<ProtectedRoute` ainda dentro de AdminTasksPage, AutomacaoInteligente, CustomerSuccess360, CoachingInteligente, AdminDashboard, MeuAssistente, admin/* (grep src/pages) | Remover guard interno |
| /race-arena/tv só autenticado (sem papel) | 01:300 | NÃO INICIADO | src/routes/AppRoutes.tsx:251-255 `<ProtectedRoute>` sem `requiredRole` | Decidir papel (TV de ranking) |
| Mock crítico #1-4 BI (mockData.ts, useIndustryTrends, useClientBI) | 01:341-344 | JÁ RESOLVIDO | src/lib/bi/mockData.ts inexistente; nenhum `mock` em useIndustryTrends.ts/useClientBI.ts | — |
| Mock #5 `useClientVsIndustry` client: 85 | 01:345 | NÃO INICIADO | src/hooks/bi/useClientVsIndustry.ts:39 `client: 85, // Mock client value` | RPC de métrica do cliente |
| Mock #6 FollowUpAudit mockLogs | 01:346 | JÁ RESOLVIDO | FollowUpAudit.tsx:79-105 só `follow_up_audit_view` | — |
| Mock #7-8 UsageAnalytics random/`sales.status` como page views | 01:347-348 | JÁ RESOLVIDO | sem `Math.random`/`login_count` em src/pages/UsageAnalytics.tsx | — |
| Mock #9 SDRConversationInsights (sentimento 65/25/10, objeções) | 01:349 | NÃO INICIADO | src/components/sdr/SDRConversationInsights.tsx:8,14; carregado em SDRDashboard.tsx:69-70 | Ligar a `call_analyses`/`conversation_*` ou remover |
| Mock #10 EliteCadenceAnalytics efficiencyScore 88 | 01:350 | NÃO INICIADO | src/components/sales/cadence/EliteCadenceAnalytics.tsx:57 | Calcular ou ocultar |
| Mock #11 DiscountOptimizer "Mock elasticity" | 01:351 | JÁ RESOLVIDO | DiscountOptimizer.tsx:49-64 usa `discountElasticity` recebido | — |
| Mock #12 GeoBlockingMap paths fake | 01:352 | NÃO INICIADO | src/components/security/GeoBlockingMap.tsx:8 "Mock paths" | SVG/lib real ou remover |
| Mock #13 OnboardingTracking (Empresa Alpha/Corp Beta, sem persistência) | 01:353 | NÃO INICIADO | src/pages/OnboardingTracking.tsx:31 "Local state — can be migrated to DB later", :45,:58 | Tabela + hook |
| Componente morto ProfilePerformanceCard (Nível 42 hardcoded) | 01:363-364 | NÃO INICIADO | arquivo existe; 0 importadores | Apagar |
| 9 rotas 🟦 (/docs, /calendario, /playbooks, /inteligencia-compras, /inteligencia, /race-arena/closer, /race-arena/sdr, /onboarding-tracking, /busca-inteligente) | 01:53-186 | DIVERGENTE (falso 🟦 em 7) | Heurística de 2 níveis não segue re-export/wrapper: Playbooks.tsx:3 → hooks/playbooks/usePlaybookQueries; RaceArenaCloser.tsx:1-3 → RaceArenaView; SmartSearch.tsx:9 useSemanticSearch; Calendario → ActivityCalendar → useTasks. Real 🟦: /onboarding-tracking; /docs é estática por natureza | Reclassificar |
| 2 falsos 🟨 conhecidos (/auth, /reset-password) | 01:36 | DIVERGENTE (doc) | declarado no próprio doc | Ajustar contagem |

## 02_DOMINIO_CRM_PIPELINE.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| #8 Multi-pipeline: `DEFAULT_PIPELINE_ID` inexistente no banco; `sales.pipeline_id` nunca preenchido | 02:32, 02:172-173 | DIVERGENTE | src/components/pipeline/PipelineBoard.tsx:51,55,81 ainda usa `'00000000-…-0001'`; o UUID é semeado em 20260416104458_a8fc916a….sql:59 — mas prod tinha outro id (`469ba7d8…`), i.e. migration não aplicada | Resolver id do pipeline padrão por query (`is_default`), backfill de `sales.pipeline_id` |
| #10 at-risk: `detect-at-risk-deals` nunca grava `deal_risk_signals` | 02:34 | NÃO INICIADO | grep `insert/upsert` de `deal_risk_signals` em supabase/functions/detect-at-risk-deals = 0 | Persistir sinais ou remover tabela |
| #11/#49 SLA/timeline leem `deal_stage_history` | 02:35,80 | NÃO INICIADO | src/hooks/useDealSLAs.ts:39, useDealTimeline.ts:50 | Ler `deal_stage_transitions` |
| #15 Probabilidade calibrada nunca persistida por `deal-probability` | 02:39 | PARCIAL | `deal_probability_scores` só é inserida por calibrate-win-probability/index.ts:182; deal-probability não grava; nenhum cron | Agendar calibrate-win-probability |
| #17 Cadências 0 linhas / #18 efficiencyScore 88 | 02:42-43 | NÃO INICIADO | EliteCadenceAnalytics.tsx:57; `process-cadence-tasks`/`sequence-runner` sem cron.schedule | Agendar runners; remover mock |
| #19 ApprovalQueue `MOCK_PENDING`, aprovação só local | 02:44, 02:177-179 | NÃO INICIADO | src/components/sales/cadence/ApprovalQueue.tsx:26,54 | Tabela de aprovação + mutação |
| #21-22 Conversão orçamento→venda sem auditoria/notificação executada | 02:47-48 | PARCIAL | trigger grava `quote_conversion_audit` (20260711151406_…sql:68); suíte E2E quote-to-sale (.github/workflows/quote-to-sale-e2e.yml); execução em prod NÃO verificável | Validar 1 conversão real |
| #25 Acompanhamento de pedidos 100% fabricado | 02:52, 02:157-166 | JÁ RESOLVIDO | src/hooks/orders/useOrderTracking.ts:83-119 lê `orders` | — |
| #29 ArenaAITips alerta sorteado | 02:57, 02:168-170 | NÃO INICIADO | src/components/activities/ArenaAITips.tsx:27 `Math.random() > 0.7` | Série temporal real |
| #30 PredictiveVelocity jornada 08–18 hardcoded | 02:58, 02:174 | NÃO INICIADO | src/components/activities/PredictiveVelocity.tsx:22-24 | Usar histórico/config |
| #36 `agenda_events` nunca usada | 02:65 | PARCIAL | src/hooks/calendar/useAgendaEvents.ts:39-64 consumido por src/pages/Agenda.tsx (Calendário de atividades continua só em `tasks`) | Unificar calendário |
| #58 Simulador de comissão fixo (5000/5%), ignora `commission_rules` | 02:92, 02:183 | NÃO INICIADO | src/components/financeiro/CommissionCalculator.tsx:11-12 | Ler `salesperson_commission_configs` |
| Health score de follow-up por fórmula fixa (ignora `deal_health_scores`) | 02:175-176 | NÃO INICIADO | src/hooks/follow-up/useFollowUpData.ts:86-107 | Usar tabela de health |
| `PIPELINE_STAGES` hardcoded apesar de `pipeline_stages` | 02:177 | PARCIAL | src/hooks/usePipeline.ts:22-42 ainda fixo; nova tabela `stage_probabilities` (20261001220000) duplica a fonte | Uma fonte única de estágio/probabilidade |
| 14 componentes mortos (DealTimeline, dealTimelineConstants, SLAIndicator, QuickActions, ExplainableWinProbability, DealAutoSummary, AIEmailWriter, ActivityGoalCard, TaskCard, TaskListAdvanced, DealHealthCard, DealVelocityCard, StageVelocityCard, MentionInput) | 02:125-150 | NÃO INICIADO (14/14) | todos existem; grep de importadores = 0 (dealTimelineConstants só por DealTimeline) | Apagar |
| Features com tabela-destino vazia sem produtor (#4 client_interactions, #5 churn_alerts_state, #13 playbooks, #14 lead_score_trends/icp_data, #31 sdr_alert_configs, #32 activity_audit_logs, #38-40 follow_up_*, #44 win_loss_insights, #45 stage_bottleneck_insights, #46 comitê (4 tabelas), #47 stage_velocity_baselines, #48 deal_velocity_alerts, #59 assinaturas) | 02:27-93, 02:203-216 | PARCIAL (operacional) | Produtores existem mas não agendados: refresh-stage-baselines/index.ts:122 (upsert), detect-stuck-deals (grava `deal_velocity_alerts`) — nenhum em `cron.schedule`; detect-client-churn-alerts agora agendado (20260831163000) | Agendar produtores; contagem real só via DB |

## 03_DOMINIO_SDR_CADENCIAS.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| Zero cron do domínio SDR (cadência, sequência, SLA, envios, scoring, dialer, engajamento) | 03:15-46 | NÃO INICIADO | Nenhuma migration agenda check-lead-sla, sequence-runner, process-cadence-tasks, process-scheduled-sends, auto-enroll-cadence, lead-scoring, engagement-score-recompute, email-engagement-scorer, send-time-optimizer, sdr-consecutive-alerts (grep `cron.schedule`/`trigger_internal_edge_job` = 0 p/ cada); só GH cron-monitoring.yml:20 (roda testes, não invoca) | Jobs pg_cron via `trigger_internal_edge_job` + incluir nomes na allowlist |
| "A UI mente": AdminSystemStatus exibe agendamentos inexistentes | 03:49-66 | NÃO INICIADO | src/components/admin/AdminSystemStatus.tsx:29-36 `EDGE_FUNCTIONS` hardcoded (sdr-consecutive-alerts 8h, activity-goal-alerts 15h, access-denied-alerts horário, auto-reassign-inactive 6h, bitrix24-sync horário, check-lead-sla) — nenhum agendado | Ler de `cron.job` via RPC admin ou remover |
| `inbound-email-webhook` e `multichannel-status-webhook` inalcançáveis (sem `verify_jwt=false`) | 03:209-223, 03:332 | JÁ RESOLVIDO | supabase/config.toml:60 e :63 declaram as duas | (consumidor externo continua NÃO VERIFICADO) |
| `sequence-record-reply` órfã | 03:200, 03:338 | NÃO INICIADO | 0 refs em src/ e migrations | Chamar a partir de inbound-email-webhook |
| `process-scheduled-sends` fila sem consumidor | 03:203, 03:328 | NÃO INICIADO | 0 refs em src/, migrations, cron | Agendar |
| `process-cadence-tasks` só no mount de /cadencias | 03:255, 03:334 | NÃO INICIADO | src/pages/Cadencias.tsx:73 | Cron |
| Auto-enroll: trigger ativo, `cadence_enrollment_rules` vazia, sem log | 03:225-246, 03:336 | NÃO INICIADO | nenhuma migration pós-auditoria toca `cadence_enrollment_rules` | Seed de regra padrão + log quando nenhuma regra casa |
| Lead scoring roda só manual (2 dias) | 03:291, 03:340 | NÃO INICIADO | lead-scoring sem cron; ainda lê `deal_stage_history` (supabase/functions/lead-scoring/index.ts:71) | Cron + fonte correta |
| SDRSequenceOrchestrator casca visual sem dados | 03:298 | NÃO INICIADO | src/components/sdr/SDRSequenceOrchestrator.tsx sem hooks de dados; montado em SDRDashboard.tsx:78-79 | Ligar a `sequence_enrollments` ou remover |
| SchedulingRateGauge `SYS_ID` aleatório | 03:358 | NÃO INICIADO (cosmético) | src/components/sdr/SchedulingRateGauge.tsx:138 | Remover |
| Features 🟨/🟦 com tabelas vazias (cadências CRUD/passos/AB, sequências CRUD/variantes/auto-pause, multicanal credenciais/envio/log/templates, email bulk/tracking/opt-out/score, dialer, lead routing, ICP, playbooks, enablement, notificações) | 03:252-303 | PARCIAL (operacional) | Código de UI+hook+edge presente (sem mudança estrutural); dependem de credencial (`channel_credentials`) e de cron | Configurar provedores; NÃO VERIFICÁVEL sem DB |
| `automation_runs` com seed sintético (ms idênticos) | 03:366 | NÃO VERIFICÁVEL | só DB | Limpar seed |

## 04_DOMINIO_ANALYTICS_BI.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| RAIZ #1 `status='completed'` em `mv_competitive_ranking` | 04:16-35, 04:332, 04:479-482 | NÃO INICIADO | única definição: 20260517113746_ba2cd7eb….sql:2-20 (`WHERE status = 'completed'`); nenhuma migration posterior recria | Recriar MV com `status IN ('won','completed','closed')` |
| RAIZ #1 em `revops-hub` | 04:16-35, 04:336 | NÃO INICIADO | supabase/functions/revops-hub/index.ts:60-61 (`wonDeals = status === "completed"`) | Incluir `won`/`closed` |
| RAIZ #1 em `LTVBySegment` | 04:481 | NÃO INICIADO | src/components/analytics/LTVBySegment.tsx:45 `.eq('status','completed')` | idem |
| RAIZ #1 em `race_leaderboard_view` | (04/05) | JÁ RESOLVIDO | 20260830000000_fix_race_leaderboard_status.sql:1-5 | — |
| RAIZ #2 `sales.stage` NULL → pesos uniformes | 04:36-49, 04:483-484 | PARCIAL | pesos agora de `stage_probabilities` (20261001220000:1-58; revops-hub/index.ts:64-68 com fallback `?? 0.1`); nenhum backfill de `sales.stage` | Backfill a partir de `deal_stage_transitions.to_stage` |
| RAIZ #3 leitores de `deal_stage_history` | 04:50-64, 04:485-486 | NÃO INICIADO | 10 hooks + 6 edge fns ainda leem (ver ESTADO_ATUAL) | VIEW ou migração de leitores |
| RAIZ #4 pipeline-pulse-aggregator (`total_amount`, `lead_routing_assignments`, status `open/negotiating`) | 04:65-73, 04:482-483 | JÁ RESOLVIDO | index.ts:100-122 lê `amount`/`lead_routing_log`; contract_test.ts:36 | Fallback `0.7` de health ainda em index.ts:179 |
| RAIZ #4 predict-quota-attainment `monthly_goal` | 04:70, 04:400 | NÃO INICIADO | supabase/functions/predict-quota-attainment/index.ts:155,231 | Fonte de meta válida |
| RAIZ #4 revops-hub outcomes inexistentes (`successful/interested/meeting_scheduled`) | 04:71 | NÃO INICIADO | supabase/functions/revops-hub/index.ts:99 | Mapear para enum `activity_outcome` (connected/qualified/scheduled) |
| RAIZ #5 nlq-query não compila | 04:75-85 | JÁ RESOLVIDO | nlq-query/index.ts:3-15 | — |
| RAIZ #6 NULL-arithmetic em `revenue_forecast_view` + `won` contado como pipeline | 04:87-108, 04:487-488 | NÃO INICIADO | última definição 20260715184427_8e4ec70a….sql:23 `status NOT IN ('completed','lost','abandoned')` (sem `won`); nenhuma recriação posterior | COALESCE por termo; excluir `won/closed/cancelled` |
| ⬛ CompetencyRadar/ChurnPredictionPanel sem props | 04:269-270, 04:285-286 | NÃO INICIADO | src/pages/Analytics.tsx:111,113; DEFAULT_DATA/DEFAULT_PREDICTIONS | Props reais ou remoção |
| ⬛ LTVBySegment query morta + props fixas 4500/1200 | 04:271, 04:287 | PARCIAL | query agora existe (LTVBySegment.tsx:38-50) mas defaults `currentClientLTV = 4500, currentClientAvgTicket = 1200` (LTVBySegment.tsx:37) ainda renderizados sem props | Remover defaults |
| ⬛ PredictiveScenarioPlanner 2,5M / repProductivity 150000 | 04:272, 04:293-294 | NÃO INICIADO | src/components/predictive/PredictiveScenarioPlanner.tsx:20 | Base real |
| ⬛ industryRecommendations (Serverless/Zero Trust/Telemedicina) | 04:273, 04:291-292 | NÃO INICIADO | src/lib/bi/industryRecommendations.ts:9,13,49; importado em useClientBI.ts:3 e useIntelligenceZones.ts:3 | Catálogo do ramo de brindes ou remover |
| ⬛ mockData BI (MOCK_CLIENT_STATS, trends, sazonalidade senoidal) | 04:288-290 | JÁ RESOLVIDO | src/lib/bi/mockData.ts inexistente | — |
| ⬛ nlq-query/DashboardNLQWidget | 04:274-275 | JÁ RESOLVIDO | compila | — |
| ⬛ analyze-pipeline-coverage órfã | 04:276, 04:401 | NÃO INICIADO | grep em src/ = 0 (só citada em comentário de 20261001220000:7) | Chamador ou remoção |
| ⬛ PerformanceMonitor órfão | 04:277 | JÁ RESOLVIDO | src/App.tsx:20 importa `components/performance/PerformanceMonitor` (e há outro em components/admin, MainLayout.tsx:61 — duplicidade persiste) | Eliminar duplicata |
| `forecast_snapshots` com seed manual | 04:295 | NÃO VERIFICÁVEL | só DB; `snapshot-forecast` sem cron | Cron mensal + limpar seed |
| Constantes inventadas #12-14 ROI (`BASE_SALARY_MONTHLY=3500`, LTV×2.5, comissão 10%) | 04:301-303 | NÃO INICIADO | src/hooks/dashboard/useROIDashboard.ts:88,97,108 | Config em `app_config` |
| #15-17 pipeline-pulse `forecast30d = won*1.05`, capacity 0.5, health 0.7 | 04:304-306 | PARCIAL | `1.05` e `0.5` ausentes; `0.7` permanece (index.ts:179) | — |
| #18-19 revops-hub `STAGE_WEIGHTS ?? 0.1`, `monthlyTarget = closed*1.2` com fallback fixo 100000 | 04:307-308 | NÃO INICIADO | revops-hub/index.ts:68 (`?? 0.1`), :113 | Meta de `goals` |
| #20-21 avgCycle 45 fallback | 04:309-310 | NÃO INICIADO | supabase/functions/revenue-forecast-ai/index.ts:111 | Empty-state |
| #23 territory-optimization potencial = receita×1.2 | 04:312 | NÃO INICIADO | supabase/functions/territory-optimization/index.ts:182 | Modelo explícito |
| #24 QBRStoryGenerator "Simplistic logic" | 04:313 | NÃO INICIADO | src/components/reports/QBRStoryGenerator.tsx:31 | — |
| #26-30 Mascaramento MAPE 0% / trend 100% / viés "accurate" | 04:320-324 | NÃO INICIADO | useForecastAccuracy.ts:81-104; forecastHelpers.ts:27 | Empty-state |
| #33 ranking R$0 rank 1 | 04:327 | NÃO INICIADO | ver RAIZ #1 MV | — |
| §3.4 gráficos sem empty-state (ConversionFunnel, ClosingTime, Forecast*, Quota*, Coverage, EmailMetrics) | 04:334-341 | NÃO VERIFICADO item a item | — | Padronizar EmptyState |
| TOP 8 #8 crons: refresh `mv_competitive_ranking`, snapshot-forecast, compute-forecast-accuracy, generate-executive-briefing, scheduled-reports-runner | 04:493-495 | NÃO INICIADO | grep `cron.schedule`/`trigger_internal_edge_job` com esses nomes = 0; `REFRESH … mv_competitive_ranking` só em função de 20260517113746:44 sem job | Agendar |
| `scheduled-reports-runner` só chamado por `scheduled-report-trigger` (que não é agendado) | 04:399 | NÃO INICIADO | ambos sem cron | Agendar trigger |
| 🟦 Custom Reports/execução/cross-object/embed/tokens/email de relatório/Progressive Goals | 04:264-266 | PARCIAL (operacional) | código presente; uso só via DB | — |

## 05_DOMINIO_GAMIFICACAO_RACE.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| `triggerRaceEvent` fire-and-forget engole erro | 05:84-85 | NÃO INICIADO | src/hooks/race/useRaceTrigger.ts:7-12 (`.catch(console.warn)`) | Logar falha (edge_call_failures) / toast admin |
| Vendas entram por SQL e não passam pelo `onSuccess` → `race_events` vazia | 05:86-91 | NÃO INICIADO | nenhum trigger DB chama `process-race-event` (grep em migrations pós-08/30 = 0) | Trigger AFTER INSERT em `sales` → `trigger_internal_edge_job` |
| Diff prev/curr estruturalmente vazio (overtake/checkpoint/victory nunca disparam) | 05:93-105, 05:186 | NÃO INICIADO | supabase/functions/process-race-event/index.ts:61-64 e :87-90 continuam lendo a mesma view no mesmo instante, após o insert | Snapshot persistido anterior (race_daily_snapshots) |
| Gate `validate_race_event`: só 8 de 18 vendedores com `race_car` | 05:107-120 | NÃO INICIADO | nenhuma migration pós-auditoria cria `race_cars` automaticamente nem altera `validate_race_event` | Auto-provisionar carro por vendedor ativo |
| Cron `weekly-matchmaking` chama `public.match_weekly_players` (movida p/ private) | 05:131-145 | DIVERGENTE | função recriada em public (20260831130001:290) mas job excluído na restauração (20260913150000:11) | Reagendar |
| `rotate-daily-challenges` sem cron | 05:146-153 | NÃO INICIADO | 0 refs em migrations | Cron diário |
| `challenge-expiration-alerts` e `notify-ranking-position` só por botão | 05:171-172 | NÃO INICIADO | 0 refs em migrations | Cron |
| `ranking-api` órfã | 05:173, 05:210 | NÃO INICIADO | 0 refs em src/ e migrations | Remover ou documentar consumidor externo |
| Roleta decidida no cliente | 05:218, 05:228-245 | JÁ RESOLVIDO | usePrizeWheel.ts:77 → RPC `spin_prize_wheel`; 20260830000001_secure_prize_wheel_spins.sql | — |
| Leaderboard de corrida zerado por `status='completed'` | (05/04) | JÁ RESOLVIDO | 20260830000000_fix_race_leaderboard_status.sql | — |
| `unlock_race_item` sem `arena_user_stats` | (pós-auditoria) | JÁ RESOLVIDO | 20260904190000_fix_unlock_race_item_missing_arena_user_stats.sql | — |
| Times de corrida sem UI de criação | 05:192 | NÃO INICIADO | grep `race_teams` em src/**/*.tsx sem formulário de criação | UI admin |
| Rivalidades sem processo que popule `race_rivalries_persistent` | 05:193 | NÃO INICIADO | sem produtor em functions/migrations pós-auditoria | — |
| Replay/What-if/Predições, Onboarding/Focus em localStorage | 05:203, 05:220 | NÃO INICIADO | 🟦 inalterado | — |
| XP/níveis, ligas, desafios, badges colecionáveis, check-in, preferências | 05:194-219 | PARCIAL (operacional) | código presente; dependem de crons acima; tabelas NÃO VERIFICÁVEIS | — |
| Inconsistência de contagem (38 vs 39) | ESTADO_ATUAL.md:80 / 05:272-285 | DIVERGENTE (doc) | registrada, não corrigida | Corrigir |

## 06_DOMINIO_IA_COACHING.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| Indexação semântica fire-and-forget engole erro (3.746 escritas → 0 linhas) | 06:171-201 | NÃO INICIADO | src/hooks/semantic/useIndexEntity.ts:9-16 idêntico (e `.invoke` não rejeita em HTTP 4xx/5xx — `{error}` é ignorado); semantic-index-entity/index.ts:189-190 `throw` se sem LOVABLE_API_KEY | Checar `{error}`, gravar em `edge_call_failures`; indexar por trigger/fila no banco |
| `semantic_index` vazio — busca universal/visual/cobertura sempre 0 | 06:142-169, 06:250-253 | NÃO VERIFICÁVEL / provável NÃO INICIADO | nenhuma migration pós-auditoria toca `semantic_index`; reindex só por painel admin (SemanticReindexPanel.tsx) | Rodar `semantic-reindex-batch` e agendar |
| Secrets de IA (`LOVABLE_API_KEY`, `ELEVENLABS_API_KEY`) `NAO_VERIFICADO` | 06:50-82 | NÃO VERIFICÁVEL | cofre fora do repo | Health-check de secrets (função `health` existe em config.toml:77) |
| Nenhum cron dispara IA; `generate-coaching-actions` com `X-Cron-Secret` sem cron | 06:204-210, 06:239 | NÃO INICIADO | 0 refs em migrations | Agendar ou remover auth de cron |
| `elevenlabs-stt` órfã | 06:210, 06:263 | NÃO INICIADO | 0 refs em src/ e migrations | Remover ou ligar a uploader |
| Cascata de 10 funções a partir de `call_recordings` (0 gravações) | 06:212, 06:222-238 | PARCIAL | `process-call-recording-ingest-1min` agora agendado (20260910153000) — ingestão automatizada; demais análises continuam por clique em useTranscribeRecording.ts | Encadear análises após ingestão |
| "IA" que é heurística (metrics, question-quality, objection-handling, competitor-mentions, coaching-intelligence, automation-suggestions, coaching-impact) | 06:233-247, 06:257 | DIVERGENTE (rótulo) | sem mudança | Rotular como regras |
| Saídas efêmeras sem persistência (copilot, email composer, NBA, predictive, scoring-explain, salesperson-coaching) | 06:218-260 | NÃO INICIADO | sem tabela de log de uso | Log mínimo para auditar uso |
| NLQ/AI Copilot mortos por sintaxe | 06:252 | JÁ RESOLVIDO | ver ESTADO_ATUAL | — |
| 40 de 42 features 🟨 por tabelas vazias (chat_conversations, ai_agent_runs, coaching_*, skill_*, call_*) | 06:265-285 | PARCIAL (operacional) | código inalterado; NÃO VERIFICÁVEL sem DB | — |

## 07_DOMINIO_WINLOSS_COMPETITIVE.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| `atRiskFixtures` vaza para UI (catálogo "ticket-alvo R$ 28.500 · ciclo 38d") | 07:27-81 | NÃO INICIADO | src/lib/winloss/index.ts:6; AtRiskDealsFromPatterns.tsx:30,152,419,429 | Remover do barrel; `select` em `win_loss_patterns` |
| Webhooks Win/Loss sem produtor de eventos (dispatcher só chamado por replay) | 07:104-123, 07:183 | NÃO INICIADO | callers de `winloss-webhook-dispatcher`: só winloss-webhook-replay, run-retry-tests e texto em RetryTestStatusPage.tsx; nenhum trigger em migrations | Trigger/outbox em `win_loss_analyses` |
| `winloss-webhook-health-monitor` sem cron/chamador | 07:125-129, 07:177, 07:341 | JÁ RESOLVIDO (repo) | job `winloss-webhook-health-monitor-15min` (20261001144000_schedule_wal_and_webhook_health_crons.sql:77-90) | — (monitora tabela vazia) |
| `winloss-webhook-replay-batch` órfã | 07:178, 07:340 | NÃO INICIADO | 0 refs em src/ e migrations | Ligar AsyncReplayQueueDialog |
| `notify-critical-pattern` + trigger quebrado (`app.functions_url` NULL, `NEW.name` inexistente) | 07:185, 07:342 | NÃO INICIADO | só 20260420210849…sql:66-73; nenhuma correção posterior (padrão novo `_internal_secrets` não aplicado a este trigger) | Reescrever via `trigger_internal_edge_job` |
| `generate-loss-coaching` órfã | 07:186, 07:337 | NÃO INICIADO | 0 refs | — |
| `deal-risk-digest` órfã | 07:278, 07:338 | JÁ RESOLVIDO (repo) | job `deal-risk-digest-daily` (20260910153000) | — |
| Battle card: `win_loss_analyses.competitor` 100% NULL; `sales.script_variant` nunca populado | 07:156-158 | NÃO VERIFICÁVEL | só DB | Capturar campo no fluxo de perda |
| FeatureComparison 100% hardcoded com URL `tool-results://` | 07:198 | NÃO INICIADO | src/components/competitive/FeatureComparison.tsx:46,56 | Remover/alimentar |
| ImprovementPlan estático | 07:199 | NÃO INICIADO | src/components/competitive/ImprovementPlan.tsx existe | — |
| `competitors_pricing` órfã | 07:201 | JÁ RESOLVIDO | lida por supabase/functions/pricing-intelligence/index.ts:295-311 | — |
| Pricing: preço do concorrente fabricado (`median*0.85`) e segmentação fixa 0.58/0.27/0.15 | 07:203-204 | JÁ RESOLVIDO | pricing-intelligence/index.ts:301-314 (usa `competitors_pricing`), :407-410 (`competitor: competitorLost`, `erosion: marginErosion`) | — |
| Curva de elasticidade `Math.random` / Simulador de desconto mock | 07:205-206, 07:362 | PARCIAL | mocks removidos (PriceElasticityChart.tsx:44 `data ?? []`; DiscountOptimizer.tsx props), mas PricingIntelligenceHub.tsx:125,130 ainda monta ambos **sem props** → gráfico vazio/elasticidade 0, embora a edge devolva `elasticity.points` (index.ts:412-415) | Passar dados do hook |
| `pricing_rules`/`price_protection_rules` órfãs | 07:207 | NÃO VERIFICADO (não reexaminado) | — | — |
| `routing_history` inexistente usada como queryKey | 07:247-248 | DIVERGENTE (cosmético) | useLeadRouting.ts:63 e useClientPortfolio.ts:235 invalidam `['routing_history']`; dados vêm de `lead_routing_log` (useLeadRouting.ts:91) | Alinhar queryKey |
| CS sem cron: renewal-automation, qbr-scheduler, qbr-generator, expansion-detector, csat-ces-trigger, helpdesk-sync | 07:241-246 | NÃO INICIADO | só 1 chamador manual em src/ cada; 0 em migrations | Agendar |
| `detect-client-churn-alerts` nunca gerou alerta | 07:238 | JÁ RESOLVIDO (repo) | job `detect-client-churn-alerts-hourly` (20260831163000_secure_churn_and_task_crons.sql:97-107) | — |
| Previsão de velocidade baseada em `deal_stage_history` vazia | 07:271 | NÃO INICIADO | supabase/functions/predict-deal-velocity/index.ts:177,337 | Ver RAIZ #3 |
| Cobertura de comitê nunca calculada; extract-committee sem gravações | 07:280-281 | PARCIAL | `calculate-committee-coverage` com 2 chamadores em src/; sem cron | — |
| Competitivo social (chat, ligas, torneios, apostas, kudos) 🟦 | 07:190-197 | PARCIAL (operacional) | inalterado | Decidir manter/arquivar |

## 08_ADMIN_SEGURANCA.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| CRÍTICO 1 — 13 tabelas com policy `TO public` + `qual` sempre verdadeiro (products, suppliers, teams, entity_versions, salesperson_xp, follow_up_settings, follow_up_templates, cadence_alert/funnel/outcome_rules, expansion_playbooks; clients/activities) | 08:171-191 | JÁ RESOLVIDO (repo) | 20260831130000_harden_public_access_and_privileged_rpcs.sql:22-95 (REVOKE anon; DROP policies públicas; recriadas `TO authenticated`) + 20261001203300_deny_dead_tables_revoke_anon_grants.sql | Teste `SET ROLE anon` automatizado |
| CRÍTICO 2 — `has_permission(uuid,text,text)` quebrada (JOIN em `role_id` inexistente) governando `clients` | 08:193-202 | JÁ RESOLVIDO (repo) | 20261001203100_drop_legacy_rbac.sql:24-40 (DROP policies + DROP FUNCTION nas 2 sobrecargas) | — |
| Proteção acidental de clients/activities "a um GRANT de distância" | 08:41-48 (errata) | PARCIAL / risco materializado | 20261005140000_restore_anon_execute_rls_helpers.sql:13-16 concede EXECUTE a anon em `get_current_salesperson_id`, `get_user_role`, `is_admin_or_manager` (exatamente o cenário da errata), mitigado por `auth.role()='anon' → NULL` só em `get_user_role` | Teste de regressão anon em clients/activities/sales/leads |
| ALTO 3 — `login_attempts`: INSERT só anon, sucesso nunca gravado | 08:204-211, 08:108 | DIVERGENTE | migration revoga INSERT de anon **e** de authenticated (20260831130000:116-128, "substituir por RPCs"), mas o front ainda faz `supabase.from('login_attempts').insert(...)` direto (src/hooks/useSecurityMonitoring.ts:58) → falha silenciosa total | Trocar insert do front pela RPC criada |
| ALTO 3 — `error_logs` INSERT só anon (parado em 2026-08-04) | 08:206-208, 08:130 | DIVERGENTE (repo≠prod) | repo já tem policy `TO authenticated` desde 20260404154450_34762f2e….sql:2-5; prod medido anon-only ⇒ migration não aplicada (ledger) | Aplicar/reconciliar em prod |
| ALTO 4 — triggers de auditoria quebrados (`process_audit_log` em api_tokens; `audit_log` vs `audit_logs`) | 08:213-217, 08:127-129 | JÁ RESOLVIDO (repo) | 20261001193100_audit_log_canonical.sql:1-20 (consolida em `audit_logs`, migra `audit_log`) + 20261001203000_audit_trigger_user_roles.sql | Verificar em prod |
| MÉDIO 5 — 96 tabelas `TO authenticated USING (true)` sem segmentação por vendedor | 08:219-221 | NÃO VERIFICADO em detalhe / PARCIAL | hardening pontual (20261001203200_restrict_user_roles_select.sql, 20261005170000_quote_items_owner_write_policy.sql); sem varredura geral | Matriz de posse por tabela (ver RLS_MATRIX) |
| MÉDIO 6 — SEC-08 não executado (138/168 com service_role cru) | 08:223-233 | PARCIAL | hoje: 90 de 172 dirs ainda referenciam `SUPABASE_SERVICE_ROLE_KEY` fora de _shared; `getServiceClient` em 52; `getUserClient` em 112; flag `USE_USER_CLIENT_*` inexistente (grep = 0) | Concluir migração / remover promessa do canário |
| MÉDIO 7 — `roles.name='seller'` vs enum `salesperson`; matriz hardcoded no front | 08:235-241, 08:110-114 | PARCIAL | `role_permissions` agora semeada a partir de `src/config/role-permissions.json` (20261001211000_role_permissions_frontend_sync.sql:1,39; usePermissions.ts:14-16); RBAC legado removido (20261001203100) | Confirmar remoção de `roles` |
| MÉDIO 7 — fallback de papel `salesperson` inventado no cliente; papel por `order('role').limit(1)` | 08:238-240, 08:109 | NÃO INICIADO | src/hooks/useUserRoles.ts:52-53, 61-63 | Usar RPC `get_user_role` |
| BAIXO 8 — componentes de segurança mortos | 08:243-247, 08:139-153 | PARCIAL | Ainda 0 importadores: RoleManager, MFAVerification, KnownDevices, BlockedIPsPanel, IPWhitelistPanel, RateLimitDashboard, ReauthDialog, PushNotificationSettings, PermissionGate. Resolvidos: SessionManager (removido), MFASetup (importado em SecurityDashboard.tsx:27, Configuracoes.tsx:43) | Apagar ou montar |
| `new-device-alert` sem chamador | 08:143 | NÃO INICIADO | 0 refs em src/ e migrations | — |
| Feature flags: 0 consumidores reais; implementação duplicada (página + aba) | 08:116-118 | PARCIAL | 1 flag semeada (20261002000000_seed_race_smart_notifications_flag.sql) consumida em useRaceSmartNotifications.ts; src/pages/FeatureFlagsAdmin.tsx e src/components/settings/FeatureFlagsAdmin.tsx ainda coexistem | Unificar |
| Circuit breaker lê `circuit_breaker_state` inexistente | 08:157 | JÁ RESOLVIDO | hooks usam `circuit_breaker_events` (useAdminStats.ts:76, circuitBreakerUtils.ts:61) | — |
| `audit_logs` 100% seed; RPC `log_audit_event` nunca chamada | 08:249-263 | NÃO VERIFICÁVEL | só DB | — |
| `LiveRegion` sem consumidor | 08:158 | NÃO INICIADO | grep fora de components/accessibility = 0 | — |
| Telemetria de queries/web-vitals vazias | 08:132-133 | PARCIAL | `webvitals-regression-alert-daily` agendado (20261002010000) | Confirmar gravação |
| Login Google OAuth não verificável | 08:107 | NÃO VERIFICÁVEL | — | — |

## 09_HOOKS_SERVICES.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| 49 hooks órfãos confirmados (useCanAccess, useHasPermission, 4 de circuit breaker, 4 de media query, useUpdateAgendaEvent, …) | 09:159-226 | JÁ RESOLVIDO (49/49) | grep da definição de cada um dos 49 símbolos em src/ = 0 (removidos) | — |
| 15 candidatos a órfão de 2º grau (useLogLoginAttempt, useIndexEntity, useSupplier*, …) | 09:228-249 | NÃO VERIFICADO caso a caso | — | Revisão |
| `auth_users_view` inexistente usada por FollowUpTerritoryRules | 09:264-273 | NÃO INICIADO | src/components/settings/FollowUpTerritoryRules.tsx:61,83; nenhuma migration cria a view | Criar view segura ou usar `profiles` |
| Invocações dinâmicas não validáveis (`meta.fn`, `functionName`) | 09:283-286 | NÃO INICIADO (ponto cego) | useQuickAction.ts / BackendAutomationMonitor.tsx | Allowlist tipada |
| 64 de 168 EF sem invocador no front / 110 tabelas e 198 RPCs sem consumidor | 09:291-343 | NÃO VERIFICADO em lote (ver 10) | — | Inventário |
| Mocks BI (mockData, useClientBI, useIndustryTrends) | 09:349-354 | JÁ RESOLVIDO | src/lib/bi/mockData.ts inexistente | — |
| `useClientVsIndustry` client 85 | 09:355 | NÃO INICIADO | src/hooks/bi/useClientVsIndustry.ts:39 | — |
| `useIntelligenceZones` sazonalidade mock determinística | 09:356 | JÁ RESOLVIDO | grep `getDeterministicMockSeasonality\|Math.sin` em useIntelligenceZones.ts = 0 | — |
| useOrderTracking MOCK_CLIENTS/buildMockOrders | 09:357-359 | JÁ RESOLVIDO | useOrderTracking.ts (122 ln) lê `orders` | — |
| usePurchaseHistory "Mocking some fields" | 09:360 | PARCIAL (cosmético) | src/hooks/orders/usePurchaseHistory.ts:76-78 — `discount_amount || 0` e `category` = 1ª palavra do produto | Categoria real do produto |
| Distribuição ponderada de leads no cliente com `Math.random` | 09:376 | NÃO INICIADO | src/hooks/useLeadAssignment.ts:30 | Mover para RPC auditável (migration 20260830000002_harden_lead_routing.sql endureceu o servidor, mas o hook segue no cliente) |
| Roleta `Math.random` no cliente | 09:375 | JÁ RESOLVIDO | RPC `spin_prize_wheel` | — |
| 18 hooks duplicados (useSemanticSearch ×2, useBIDossierExport ×2, useBriefingHistory ×2, useSendTimeOptimization engagement/ vs sequences/, useRevenueForecast ×3, …) | 09:406-434 | PARCIAL | ainda duplicados: src/hooks/useSemanticSearch.ts + semantic/useSemanticSearch.ts; bi/ + dashboard/useBIDossierExport.ts; assistant/ + executive-briefing/useBriefingHistory.ts; engagement/ + sequences/useSendTimeOptimization.ts (engagement/ agora importado por src/pages/SendTimeOptimization.tsx); forecast/ + revenue-intelligence/useRevenueForecast.ts (3ª cópia removida) | Consolidar |
| `@deprecated` ainda presentes | 09:387-391 | NÃO VERIFICADO | — | — |

## 10_EDGE_FUNCTIONS.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| `config.toml` com `project_id = rapjswienfhkobhlamxb` e só 3 funções públicas | 10:39-58 | JÁ RESOLVIDO | supabase/config.toml:1 `project_id = "usyxfpqlsspldubptrdl"`; 20 blocos `[functions.*]` | — |
| 7 webhooks externos inalcançáveis (receive-quote-webhook, inbound-email-webhook, multichannel-status-webhook, twilio-call-status, twilio-call-twiml, report-embed-public, get-client-ip) | 10:67-94 | JÁ RESOLVIDO (6/7) | config.toml:46,51,60,63,68,71 declaram os 6; `get-client-ip` ausente (aceitável se só o front autenticado chama) | Confirmar `verify_jwt` efetivo no deploy |
| 5.1 JWT anon hard-coded em `trigger_campaign_health_alert` e em 5 migrations | 10:157-172 | PARCIAL | função reescrita via `_internal_secrets` (20261001160000_centralize_internal_edge_calls.sql:136-156); o JWT continua em 5 migrations antigas (grep `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9` = 5 arquivos, histórico imutável) | Rotacionar a chave do projeto antigo; registrar que a do projeto oficial nunca foi commitada |
| 5.2 service_role em 122/168 | 10:174-178 | PARCIAL | 90/172 dirs ainda referenciam `SUPABASE_SERVICE_ROLE_KEY`; `getUserClient` em 112 | ver SEC-08 |
| 5.3 ~140 funções sem verificação de identidade/papel | 10:180-196 | PARCIAL | 34 index.ts usam cron-secret/internal-service-auth; 64 dirs com checagem de papel (`has_role`/`is_admin_or_manager`/`requireRole`) — antes 8 | Matriz função→papel exigido |
| 5.4 `VITE_*` lidas no servidor; `TEST_USER_ACCESS_TOKEN` em forecast-narrative | 10:198-206 | JÁ RESOLVIDO | `Deno.env.get('VITE_` só em arquivos *test*; grep `TEST_USER_ACCESS_TOKEN` em index.ts = 0 | — |
| 5.5 segredo de cron em tabela (`_internal_secrets`) | 10:208-212 | NÃO INICIADO (ampliado) | generate-coaching-actions/index.ts:49-56 e agora toda a malha de crons (20260910153000:31-35, 20261001160000:8-10) depende de `_internal_secrets`, tabela sem CREATE TABLE no repo | Migrar para Vault; versionar a tabela |
| 5.6 `log-web-vitals` grava sem auth com service_role | 10:214-218 | NÃO VERIFICADO (sem mudança aparente) | config.toml:35 mantém `verify_jwt=false` | Aceito/documentar |
| 6.1 `calibrate-win-probabilities` vs `calibrate-win-probability` (2 esquemas) | 10:243-253 | NÃO INICIADO | ambos os diretórios existem | Escolher um |
| 6.2 `recompute-stage-baselines` vs `refresh-stage-baselines` (corrida; refresh lê tabela vazia) | 10:255-264 | NÃO INICIADO | ambos existem; refresh-stage-baselines/index.ts:53 lê `deal_stage_history` | Remover `refresh-` |
| 6.4 `objection_library` vs `objections_library` | 10:281-282 | NÃO INICIADO | analyze-objection-handling/index.ts:142-370 vs sales-assistant-chat/index.ts:157 | Unificar |
| 6.4 `retry.ts` vs `retry-policy.ts` | 10:285 | NÃO INICIADO | `retry-policy.ts` ainda importado em 3 arquivos | Unificar |
| 6.4 5 funções de forecast sobrepostas | 10:287-289 | NÃO INICIADO | sem consolidação | — |
| 8.1 24 funções ⬛ sem chamador | 10:489-497 | PARCIAL | Agora agendadas: check-v4-callback-alerts, cron-failure-alerter, deal-risk-digest, wal-health-alert, winloss-webhook-health-monitor (5). Só botão admin (BackendAutomationMonitor.tsx:34,51,59 / useStartAgentRun.ts:22): activity-goal-alerts, challenge-expiration-alerts, auto-reassign-inactive, check-lead-sla, ai-agent-orchestrator (5). **Ainda 0 chamadores (14)**: admin-conversion-trail, analyze-pipeline-coverage, check-quote-expiration, elevenlabs-stt, generate-loss-coaching, new-device-alert, notify-critical-pattern, process-scheduled-sends, ranking-api, send-quote-to-client, sequence-record-reply, simulate-load, winloss-webhook-dispatcher (só replay), winloss-webhook-replay-batch | Decidir: agendar, ligar ou remover (plano limita 100 deployadas) |
| `detect-stalled-cron-15min` nunca existiu em cron.job | 10:501-503 | NÃO INICIADO | ver ESTADO_ATUAL (jobid 20 excluído) | — |
| `check-quote-expiration` (CLAUDE.md §3.1 o cita como parte do fluxo de cotações) sem agendamento | 10:493 | NÃO INICIADO | 0 refs em src/ e migrations | Cron diário |

## 11_DADOS_BANCO.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| #1 Ledger `schema_migrations` inexistente; ambiente não reconstruível | 11:413-486, 11:640 | NÃO INICIADO (mitigado por detecção) | .github/workflows/migrations-drift.yml existe; nenhuma migration/baseline de reconciliação; evidência indireta de migrations não aplicadas em prod: 20260913150000:10-17 (funções de 20260831130001 ausentes em 2026-09-13), DEFAULT_PIPELINE_ID, policy de `error_logs` | Baseline `pg_dump --schema-only` + `supabase migration repair` |
| #2 3 tabelas vivas sem CREATE TABLE (`_internal_secrets`, `geo_access_logs`, `geo_blocked_regions`) | 11:454-462, 11:641 | NÃO INICIADO (agravado) | grep `CREATE TABLE.*_internal_secrets\|geo_access_logs\|geo_blocked_regions` = 0; `_internal_secrets` virou dependência de todos os crons HTTP (20260910153000:31-35, 20261001160000:8-10) | Migration `CREATE TABLE IF NOT EXISTS` + RLS deny-all |
| #3 `soft_delete_record`/`restore_record`/`restore_deleted_record`/`get_deleted_records` SECURITY DEFINER sem guarda, anon | 11:366-389, 11:642 | JÁ RESOLVIDO (repo) | recriadas com guarda e allowlist de tabela (20260831130000:442-621, `IF p_table_name NOT IN (...)`) + `REVOKE ALL` | Verificar ACL em prod |
| #4 3 crons 100% falha | 11:528-545, 11:643 | PARCIAL | ver ESTADO_ATUAL (1 resolvido, 2 excluídos da restauração) | — |
| #5 detector de falha de cron mudo | 11:644 | NÃO INICIADO | `detect_stalled_cron_jobs` excluído (20260913150000:13-14); `cron-failure-alerter-10min` agendado (20260910153000) mas depende de `_internal_secrets` e deploy | Corrigir conflito `cron_failure_alerts_unique` |
| #6 4 funções `fn_test_*` em prod, uma com GRANT anon | 11:645 | PARCIAL | REVOKE ALL + GRANT só p/ service_role (20260831130000:650-660); funções continuam existindo em prod | DROP em prod; mover para seed de teste |
| 28 SECURITY DEFINER executáveis via default PUBLIC | 11:329-389 | PARCIAL | `ALTER DEFAULT PRIVILEGES` em 20260902121000; REVOKE pontual de anon em 20261001203300:53; porém 20261005140000 re-concede anon em 4 helpers | Varredura `has_function_privilege('anon', …)` no CI |
| #7 302/397 tabelas vazias; #8 29/36 tabelas de integração sem tráfego; #9 16/35 views vazias | 11:155-237, 11:238-287, 11:546-600 | NÃO VERIFICÁVEL (operacional) | 20261001203300_deny_dead_tables_revoke_anon_grants.sql documenta tabelas mortas com COMMENT/REVOKE em vez de dropar | Decisão de arquivamento |
| #10 `call_tracking` declarada e ausente | 11:464-472 | NÃO INICIADO | 20260104182000_additional_tables.sql | — |
| #11 40% do volume é metadado (`audit_logs` + `db_rollback_snapshots`) | 11:647 | PARCIAL | retenção agora: `purge-rollback-snapshots-daily` (20260913150000:36) + `data-retention-purge-daily` (20261001151000) | — |
| #12 497 índices nunca usados | 11:617-634 | NÃO INICIADO | sem migration de limpeza (só FK indexes em 20260831130001) | Revisão de índices |
| Drift de funções/views/policies declaradas × vivas | 11:673 | NÃO VERIFICADO (lacuna mantida) | — | Diff de schema em CI |

## 14_VERIFICACAO_DA_AUDITORIA.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| Docs com evidência fabricada (10 arquivos que nunca existiram) seguem no repo sem aviso | 14:121-152 | NÃO INICIADO | docs/TELEMETRY_MODULE_DOCS.md, docs/reports/AUDIT_REPORT.md, docs/auditoria_enterprise_v5.md, docs/reports/BACKEND_ANALYSIS_REPORT.md, docs/DOCUMENTACAO_SISTEMA.md, docs/auditoria/RELATORIO_FALHAS.md existem; os 6 caminhos citados (AdminTelemetriaPage.tsx, useAuditLogs.ts, layout/SystemHealthBadge.tsx, activityService.ts, src/test/test-utils.tsx, src/main.ts) continuam inexistentes; nenhum cabeçalho de "obsoleto" nos 8 primeiros linhas do TELEMETRY | Arquivar em docs/_obsoleto ou carimbar |
| `deno.json` aponta para `src/main.ts` inexistente | 14:152, ESTADO_ATUAL.md:296-297 | NÃO VERIFICADO / provável JÁ RESOLVIDO | `deno.json` existe; grep `main.ts` nele = 0 | — |
| Contagens corrigidas (451/260/44) não propagadas a README/lotes | 14:156-172 | DIVERGENTE (doc) | README.md:11-23 mantém contagens antigas | — |
| Lacuna 1: 28 de 104 domínios de componentes sem citação (portfolio, shared, navigation, closer, conversation-intelligence, icp, lead-routing, playbooks, skeletons) | 14:180-183 | NÃO INICIADO | sem lote complementar (15_PLANO_COBERTURA_MODULOS.md fora desta fatia) | Auditar |
| Lacuna 2: `components.json` e `tailwind.config.ts` não auditados | 14:184 | NÃO INICIADO | arquivos existem | — |
| Lacuna 3: "quem chama" EF só estático (sem logs de invocação) | 14:185-187 | NÃO INICIADO | — | Ler logs via Management API |
| Lacuna 4: órfãos de hook não reverificados | 14:188-190 | JÁ RESOLVIDO | os 49 foram removidos (ver 09) | — |
| Lacuna 5: nenhuma suíte executada | 14:191-192 | FORA DESTA FATIA (lote 12) | — | — |

## IDENTIDADE_BANCO_2026-09-13.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| Etapa 2: token Management API para usyxf (gargalo para publicar ~170 functions e reagendar 10 crons HTTP) | IDENTIDADE:89-92 | NÃO VERIFICÁVEL / provável NÃO INICIADO | CLAUDE.md §4: "172 funções; plano limita a 100 deployadas"; crons HTTP já reescritos (20260910153000, 20261001144000, 20261001160000) mas dependem do deploy | Inventário de deploy em usyxf |
| Etapa 7 parte 1: 12 crons SQL "aguardando aplicação" (PR #144) | IDENTIDADE:93 | PARCIAL | migration 20260913150000_restore_sql_maintenance_crons.sql no repo (restaura 12, exclui 3); aplicação em prod NÃO VERIFICÁVEL | Aplicar |
| 4 funções SQL com ref antigo (broadcast_sale_completed, trigger_campaign_health_alert, trigger_auto_coaching_on_recording, trg_recording_generate_coaching) | IDENTIDADE:63-64, 94-97 | PARCIAL (2/4) | broadcast + campaign-health reescritas via `_internal_secrets` (20261001160000:1-10,134-156); `trigger_auto_coaching_on_recording` e `trg_recording_generate_coaching` **não têm nenhuma definição em supabase/migrations** (existem só em prod, com URL de rapjs) | Migration que recrie as 2 lendo `_internal_secrets` |
| `_internal_secrets.functions_base_url` e `anon_key` não existem na tabela (só `coaching_cron_secret`) | IDENTIDADE:94-97; CLAUDE.md §1 (nota de 2026-09-13) | DIVERGENTE / bloqueante | Todos os crons HTTP e triggers centralizados exigem as 3 chaves e levantam `internal_edge_job_secrets_missing` sem elas (20260910153000:37-39); nenhuma migration/runbook documenta como inseri-las | Runbook de bootstrap de `_internal_secrets` (sem commitar valor) |
| `20260903000002_fix_cron_project_ref.sql` nunca aplicada | IDENTIDADE:72-74 | DIVERGENTE | arquivo ainda no repo contendo `rapjswienfhkobhlamxb`; superado por 20260910153000 mas não removido/marcado | Marcar como superseded |
| Front publicado não aponta para o banco canônico (Vercel sem `VITE_SUPABASE_URL`) | IDENTIDADE:78-87, 98-100 | JÁ RESOLVIDO (código) | src/integrations/supabase/env.ts:5 fallback para `https://usyxfpqlsspldubptrdl.supabase.co` | Confirmar deploy Vercel |
| `championgifts.lovable.app` compilado para `saejqkojleeaxzrslzfg` | IDENTIDADE:82 | NÃO VERIFICÁVEL | grep `saejqkojleeaxzrslzfg` em src/ = 0 | Desativar/redirecionar o app Lovable |
| Sistema em pré-lançamento (2 usuários) | IDENTIDADE:84-87 | NÃO VERIFICÁVEL | — | — |

## docs/runbooks/* (exceto twilio, elevenlabs, bitrix24, whatsapp-multichannel, email-transacional, n8n)

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| access-denied: settings em tabela `access_denied_alert_settings`, limite default 10 | access-denied.md:8-10, :30 | DIVERGENTE | tabela inexistente (grep em migrations/functions = 0); função lê `security_alert_settings` (access-denied-alerts/index.ts:116-117) com `DEFAULT_SPIKE_THRESHOLD = 5` (:17) | Corrigir tabela/limite no runbook |
| access-denied: fonte `security_events` (`event_type='access_denied'`) e query de diagnóstico | access-denied.md:12-19 | DIVERGENTE | função lê `access_denied_logs` (index.ts:187), não `security_events`; a query do runbook não retorna os eventos reais | Trocar query para `access_denied_logs` |
| access-denied-alerts roda periodicamente (pressuposto do runbook) | access-denied.md:1-4 | NÃO INICIADO | sem `cron.schedule`; só botão/AdminSystemStatus.tsx:32 ("Horário" fictício) | Agendar |
| alertas-operacionais: SLO burn-rate "agendamento pendente" | alertas-operacionais.md:52-65 | NÃO INICIADO | `fn_check_slo_burn_rate()` criada em 20261002000100_slo_burn_rate.sql sem `cron.schedule` | Job pg_cron |
| alertas-operacionais: `ALERT_FROM_EMAIL` obrigatório em prod; fallback `onboarding@resend.dev` só entrega p/ conta Resend | alertas-operacionais.md:13-17 | NÃO VERIFICÁVEL | env lida em 1 arquivo de supabase/functions; valor no cofre | Checklist de secrets |
| alertas-operacionais: `METRICS_INGEST_URL` ausente = no-op silencioso | alertas-operacionais.md:23 | NÃO VERIFICÁVEL | lido em 2 arquivos | — |
| cron-failures: depende de `_internal_secrets.functions_base_url` | cron-failures.md:10-11 | DIVERGENTE / bloqueante | IDENTIDADE_BANCO:94-97 e CLAUDE.md §1: a chave **não existe** no banco | Runbook de bootstrap das 3 chaves |
| cron-failures: "recriar job conforme `*_reconcile_operational_edge_crons.sql`" | cron-failures.md:18-19 | OK | 20260910153000_reconcile_operational_edge_crons.sql existe | — |
| deal-risk-digest: logs `slack_post_failed` / `deal_risk_query_failed` | deal-risk-digest.md:10-11, :18, :22 | DIVERGENTE | deal-risk-digest/index.ts emite `slack_circuit_open`, `slack_retry_exhausted`, `slack_fallback_failed` (:67-75); `slack_post_failed` só existe em notify-quote-conversion/index.ts:116; `deal_risk_query_failed` não existe | Atualizar nomes de log |
| deal-risk-digest agendado diariamente | deal-risk-digest.md:3 | JÁ RESOLVIDO (repo) | `deal-risk-digest-daily` (20260910153000) | — |
| edge-retry: `edge_retry_events`, `EDGE_RETRY_EXHAUSTED_THRESHOLD`, send-pacer, circuit-breaker | edge-retry.md:3-30 | OK | tabela em 20260713104701_…sql; env lida; _shared/send-pacer.ts, circuit-breaker.ts existem | — |
| on-call: contatos com placeholders `{{ … }}` não preenchidos | on-call.md:15-23 | NÃO INICIADO | on-call.md:19-23 | Preencher escala |
| on-call: confirmação em `championgifts.lovable.app` e rollback "painel Lovable" | on-call.md:27-28, :46 | DIVERGENTE | IDENTIDADE_BANCO:82 mostra que esse app aponta para `saejqkojleeaxzrslzfg` (não o banco canônico); CLAUDE.md §2: deploy = Vercel | Trocar para URL Vercel e rollback Vercel |
| race-arena: "Status 10/10 production-ready" | race-arena.md:4 | DIVERGENTE | lote 05: `race_events` vazio, diff de ultrapassagem estruturalmente nulo (process-race-event/index.ts:61-90), 10/18 vendedores sem carro | Rebaixar status |
| race-arena: redeploy com `--project-ref saejqkojleeaxzrslzfg` / "Connectors → Lovable Cloud" | race-arena.md:91-92 | DIVERGENTE | projeto oficial é `usyxfpqlsspldubptrdl` (CLAUDE.md §1) | Corrigir ref |
| race-arena: migration Round 3 `20260419145449_*.sql` | race-arena.md:148 | DIVERGENTE (ref. inexistente) | arquivo não existe; o trigger/índice estão em 20260419145440_18e5089e….sql:34-41 e 20260419144054_cf429e7d….sql:1 | Corrigir nome |
| race-arena: ADR em `docs/decisions/` (Race Arena) | race-arena.md:150 | DIVERGENTE (ref. inexistente) | docs/decisions tem ADR-001..010 sem Race Arena (e dois ADR-010 com mesmo número) | Escrever ADR ou remover ref |
| race-arena: "carro não encontrado → criar via Meu Carro / RaceOnboardingChecklist" | race-arena.md:104-118 | PARCIAL | fluxo manual; nenhum auto-provisionamento (ver 05) | Auto-criar `race_cars` |
| smoke-target-backend: `npm run smoke:target`, helpers e teste | smoke-target-backend.md:12-38 | OK | package.json:42; scripts/smokeTargetHelpers.ts; src/test/smoke-target-helpers.test.ts existem | Não está em workflow de CI (não encontrado) |
| wal-health: `v_platform_wal_health`, envs, agendamento | wal-health.md:7-13 | JÁ RESOLVIDO (repo) | view em migration; `wal-health-alert-5min` (20261001144000) | — |
| winloss-webhooks: monitor + replay-batch como mitigação | winloss-webhooks.md:27-29 | PARCIAL | monitor agendado (20261001144000); `winloss-webhook-replay-batch` sem chamador; dispatcher sem produtor (ver 07) — runbook descreve fluxo que nunca recebeu evento | Produtor de eventos |

## docs/RUNBOOK.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| Deploy padrão "via Lovable / botão Publish"; rollback "Lovable → histórico"; contatos "Lovable Cloud" | RUNBOOK.md:22-27, :64, :176-177 | DIVERGENTE | CLAUDE.md §2: deploy = Vercel + GitHub; IDENTIDADE_BANCO:82 — app Lovable aponta para `saejqkojleeaxzrslzfg`; .github/workflows/deploy.yml:24-25 ainda diz "frontend feito pela Lovable Cloud" | Unificar narrativa de deploy (Vercel) |
| Monitor de uptime do frontend em `championgifts.lovable.app` | RUNBOOK.md:109, :128 | DIVERGENTE | idem — monitoraria um front que não usa o banco canônico | Trocar para URL Vercel |
| `ALLOWED_ORIGINS` sem domínio Vercel | RUNBOOK.md:47-49 | DIVERGENTE | lista só promochampions.com.br + 2 domínios lovable.app | Incluir domínio Vercel de produção |
| Secrets `coaching_cron_secret`, `anon_key`, `functions_base_url` em `_internal_secrets` | RUNBOOK.md:54-57 | NÃO INICIADO (bloqueante) | IDENTIDADE_BANCO:94-97: só `coaching_cron_secret` existe; nenhum procedimento de inserção | Procedimento + verificação (`SELECT key FROM _internal_secrets`) |
| "Existem functions no repo não publicadas (ex.: elevenlabs-stt 404)" | RUNBOOK.md:42-43 | NÃO INICIADO | supabase/functions/elevenlabs-stt existe, 0 chamadores; limite de 100 deployadas (CLAUDE.md §4) com 172 no repo | Lista oficial de functions deployadas |
| Status page pública "_pendente_" | RUNBOOK.md:117-119 | NÃO INICIADO | texto literal | — |
| Teste trimestral do monitor externo | RUNBOOK.md:121-124 | NÃO VERIFICÁVEL | sem registro | — |
| Quote→Sale: `EXCEPTION WHEN OTHERS THEN NULL` no INSERT de `audit_logs` (silencia falha) | RUNBOOK.md:258-262 | PARCIAL (aceito) | mitigado por tests/e2e/quote-to-sale-audit-log.spec.ts (existe) | Registrar falha em `edge_call_failures` em vez de NULL |
| Referências: scripts/verify-quote-to-sale-invariants.ts, specs concurrent-x5/won, FAQ/HOTFIX/DEPLOYMENT/ZERO_DOWNTIME | RUNBOOK.md:13-15, :296-317 | OK | todos existem | — |
| Callback V4: dispatcher `notify-v4-quote-status` por cron | RUNBOOK.md:184-187 | JÁ RESOLVIDO (repo) | `notify-v4-quote-status-every-5min` (20260910153000) | Depende de `_internal_secrets` |
| Contatos "Lead Dev: Configurar no README" | RUNBOOK.md:174-177 | NÃO INICIADO | placeholder | Preencher |

## docs/postmortems/2026-08-30_cron_outage.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| Ação 1 — restaurar 12 jobs SQL (PR #144, aplicar no SQL Editor) | postmortem:76 | PARCIAL | 20260913150000_restore_sql_maintenance_crons.sql no repo; aplicação NÃO VERIFICÁVEL | Colar evidência `SELECT count(*) FROM cron.job` |
| Ação 2 — heartbeat de cron fora do banco (GH Actions 15 min) | postmortem:77 | NÃO INICIADO | .github/workflows/cron-monitoring.yml:20 roda 1×/dia às 06:00 e executa testes Deno; não consulta `cron.job`/`job_run_details` | Workflow 15-min com `SUPABASE_DB_URL` read-only |
| Ação 3 — token Management API p/ usyxf | postmortem:78 | NÃO VERIFICÁVEL | deploy.yml:20-23 só documenta dependência de `SUPABASE_ACCESS_TOKEN` | Ação do operador |
| Ação 4 — publicar as ~170 functions em usyxf | postmortem:79 | PARCIAL / bloqueado | deploy.yml:128-144 tem passo condicional; limite do plano = 100 (CLAUDE.md §4) torna "publicar 170" impossível sem cortar functions | Decidir quais 100 deployar (ver órfãs em 10) |
| Ação 5 — reagendar 10 jobs HTTP via `trigger_internal_edge_job` | postmortem:80 | PARCIAL | 20260910153000, 20261001144000, 20261002010000 reagendam 10 jobs HTTP; dependem de `functions_base_url`/`anon_key` ausentes | Bootstrap de secrets |
| Ação 6 — corrigir jobs 2, 11, 20 | postmortem:81 | PARCIAL | funções corrigidas em 20260831130001 (match_weekly_players, purge_telemetry_retention); jobs 2 e 11 não reagendados (20260913150000:10-14); job 20 (`detect_stalled_cron_jobs`) sem correção encontrada | Reagendar + corrigir unique |
| Ação 7 — corrigir 4 funções SQL com ref antigo | postmortem:82 | PARCIAL (2/4) | broadcast_sale_completed e trigger_campaign_health_alert em 20261001160000; `trigger_auto_coaching_on_recording` e `trg_recording_generate_coaching` sem migration | Migration |
| Ação 8 — `deploy-db` com approval; **revogar DDL manual** | postmortem:83; causa-raiz 1 (:39-42) | PARCIAL / DIVERGENTE | deploy.yml:140-144 tem `supabase db push --linked` condicional a secrets; mas CLAUDE.md §1 regra 1 **ainda manda** "Usar `db_query` no MCP com DDL direto" — exatamente a regra apontada como causa do incidente | Alterar CLAUDE.md e revogar DDL via MCP |
| Ação 9 — snapshot vivo semanal por script | postmortem:84 | PARCIAL | .github/workflows/db-backup.yml:34-60 faz `pg_dump` mas pula se `SUPABASE_DB_URL` não configurado (:39-42) | Configurar secret |
| Critério de fechamento (25 jobs ativos, zero `rapjswienfhkobhlamxb`, falha < 1%, alerta em ≤15 min) | postmortem:86-91 | NÃO INICIADO | 6 migrations ainda contêm `rapjswienfhkobhlamxb` (histórico; 20260903000002 nunca aplicada) | Verificação em prod |
| Causa 5 — "migration de 03/09 sobre tabela `leads` inexistente" | postmortem:51-53 | DIVERGENTE | 20260903000001_enable_rls_leads.sql permanece no repo sem marcação | Marcar/remover |

## docs/SEC-08_SERVICE_ROLE_AUDIT.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| Migração das ~50 funções priorizadas para `getUserClient` ("⏳ ondas 6a-6f") | SEC-08:33-41, :63 | PARCIAL | das 25 listadas que existem, ~18 já usam `getUserClient`; ainda só com `SUPABASE_SERVICE_ROLE_KEY` e sem `getUserClient`: analyze-conversation, generate-loss-coaching, sequence-enroll, sequence-record-reply; mistas (user + service): analyze-call, customer-success-hub, customer-success-360, process-cadence-tasks, calculate-committee-coverage. Global: 90/172 dirs ainda citam a key | Concluir 4 + revisar mistas |
| Funções citadas que não existem: `page-analytics-writer`, `revenue-forecast`, `deal-committee-*` | SEC-08:30, :39-40 | DIVERGENTE (ref. inexistente) | `ls supabase/functions/` sem esses nomes | Corrigir lista |
| Canário `USE_USER_CLIENT_${FN_NAME}` | SEC-08:54 | NÃO INICIADO | grep `USE_USER_CLIENT_` em supabase/functions e src = 0 | Remover promessa ou implementar |
| "Rejeição CI se service_role usado sem getServiceClient" (⏳ Fase 3) | SEC-08:64 | NÃO INICIADO | nenhum lint/teste em scripts/ ou _shared/*lint_test.ts verifica isso (existem só chunked_in_lint_test e cors_lint_test) | Lint test análogo a cors_lint_test.ts |
| Jobs pg_cron "legítimos" listados (check-quote-expiration, challenge-expiration-alerts, csat-ces-trigger, rotate-daily-challenges, qbr-scheduler, scheduled-reports-runner) | SEC-08:28 | DIVERGENTE | nenhum desses tem `cron.schedule` (ver 03/04/05/07) — são classificados como "jobs pg_cron" mas não são agendados | Agendar ou reclassificar |
| `supabase/tests/rls_test_suite.sql` antes/depois | SEC-08:55 | OK | arquivo existe | — |

## docs/AUTH_CONFIG.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| Checklist de GoTrue (JWT ≤3600, refresh rotation, HIBP, rate limits, CAPTCHA, SMTP Resend) | AUTH_CONFIG:10-48 | NÃO VERIFICÁVEL | configuração só no dashboard; sem evidência registrada | Registrar evidência por release |
| CAPTCHA em sign-in/sign-up "requer chave site no frontend" | AUTH_CONFIG:40 | NÃO INICIADO | grep `captcha\|hcaptcha\|turnstile` em src/**/*.tsx = 0 | Integrar widget |
| `login_attempts` | (RLS_MATRIX:24 / AUTH) | DIVERGENTE | ver 08: front ainda insere direto (useSecurityMonitoring.ts:58) após REVOKE | — |
| Refs `SECRETS_ROTATION.md`, `SECURITY_HEADERS.md` | AUTH_CONFIG:52-55 | OK | existem | — |

## docs/RLS_MATRIX.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| Specs/testes de cobertura citados | RLS_MATRIX:6-10 | OK | tests/e2e/rls-scope-salesperson.spec.ts, sales-markup-rls-salesperson.spec.ts, rls-authorization-edge-cases.spec.ts, src/hooks/rolePermissions.test.ts existem | — |
| `login_attempts`: "Insert via service (auth hook)" | RLS_MATRIX:24 | DIVERGENTE | não há auth hook em supabase/functions que grave `login_attempts` (grep = 0); o front tenta `insert` direto (useSecurityMonitoring.ts:58) e é negado | Implementar hook/RPC |
| `clients`: "carteira própria + policies legadas — spec vigia" | RLS_MATRIX:17 | PARCIAL | policies `has_permission` removidas (20261001203100); 96 tabelas `USING (true)` para authenticated não aparecem na matriz (lote 08 risco 5) | Estender a matriz às 96 tabelas |
| Matriz cobre só 10 tabelas | RLS_MATRIX:12-25 | PARCIAL | lote 08: 96 tabelas legíveis por qualquer autenticado | Ampliar |

## docs/SECURITY_HARDENING.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| "Após a migração de hardening (2026-07-11) todas as SECURITY DEFINER têm EXECUTE revogado de PUBLIC/anon" (11 públicas) | SECURITY_HARDENING:3-4, :24-33 | DIVERGENTE | Auditoria de 2026-08-16 mediu 30 SECURITY DEFINER executáveis por anon (11_DADOS_BANCO:329-364) — migração 20260711134320 existe mas o estado de prod não batia; 20261005140000 re-concede anon a 4 helpers | Atualizar contagem/categorias após 20260831130000 e 20261005140000 |
| Tabela de autorização: `fn_test_*` não aparecem; API.md ainda lista `fn_test_*` com `anon` | SECURITY_HARDENING:56-67; API.md:587-591 | DIVERGENTE | repo já revoga (20260831130000:650-660) mas catálogo gerado continua dizendo `anon, authenticated, service_role` | Regenerar catálogo |
| Checklist de nova função SECURITY DEFINER (`[ ]`) | SECURITY_HARDENING:183-188 | NÃO VERIFICÁVEL por PR | template de checklist, sem gate automático; tests/e2e/security-definer-rpc-access.spec.ts existe | Gate em CI (ADR-008) |

## docs/PROCESSOS.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| "Pendente: post-mortem do incidente de cron" | PROCESSOS:26-28 | JÁ RESOLVIDO | docs/postmortems/2026-08-30_cron_outage.md existe | — |
| Revisão trimestral de segurança (issue com checklist) | PROCESSOS:30-41 | NÃO VERIFICÁVEL | nenhum artefato no repo (issues fora do escopo) | — |
| "Revisar as 13 edge functions com `verify_jwt=false`" | PROCESSOS:40 | DIVERGENTE | supabase/config.toml tem **20** `verify_jwt = false` | Atualizar número |
| CODEOWNERS com único handle | PROCESSOS:4-5, :41 | PARCIAL | .github/CODEOWNERS agora cita @adm01-debug, @organizacao, @promo-ops (verificar se os 2 novos são times reais) | — |
| Label `needs-review` automática "a implementar" | PROCESSOS:47-49 | JÁ RESOLVIDO | .github/workflows/pr-review-sla.yml (schedule) | — |
| release-please "não incluído" | PROCESSOS:79-88 | JÁ RESOLVIDO | .github/workflows/release-please.yml | — |
| SLOs dependem de observabilidade externa (Sentry/uptime) "Pendente" | PROCESSOS:75-77 | PARCIAL | Sentry opcional por `VITE_SENTRY_DSN` (src/lib/errorTracking.ts:35-43); `fn_check_slo_burn_rate` sem cron; monitor externo não evidenciado | Configurar DSN + monitor |
| Triagem semanal de PRs / revisão mensal de dependências | PROCESSOS:51-66 | NÃO VERIFICÁVEL | sem artefato no repo | — |

## docs/API.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| Catálogo "gerado automaticamente" desatualizado (gerado ≤ 2026-10-02) | API.md:3-4 | DIVERGENTE | faltam `geocode-proxy`, `health`, `webvitals-regression-alert` (existem em supabase/functions/); lista RPCs `fn_test_*` com `anon` (:587-591) e `audit_trigger_func` (:479) já superados | Rodar `node scripts/gen-api-catalog.mjs` no CI e falhar em drift |
| `log_audit`, `create_version` sem grants (—) | API.md:543, :666 | NÃO VERIFICADO | de migrations 2025 superadas por 20261001193100_audit_log_canonical.sql | — |

## docs/ARCHITECTURE.md

| item | fonte | estado hoje | evidência | o que falta |
|---|---|---|---|---|
| "SPA servida pela Lovable Cloud"; "Deploy: Lovable Cloud (não Vercel)"; "Não há Vercel… Sentry" | ARCHITECTURE:4, :17, :117, :123-124 | DIVERGENTE | CLAUDE.md §2: "Deploy Vercel + GitHub"; IDENTIDADE_BANCO:83 (`promo-champions-v2-1.vercel.app`); `@sentry/react` em package.json e src/lib/errorTracking.ts:37-43; não há vercel.json | Escolher e documentar o deploy real |
| "612 migrations", "~170 Edge Functions" | ARCHITECTURE:13, :35 | DIVERGENTE | 644 migrations; 172 functions | Atualizar |
| Migrations "via `db_query` com DDL direto" | ARCHITECTURE:119-120 | DIVERGENTE com postmortem | postmortem causa-raiz 1 / ação 8 pede revogar DDL manual | Atualizar após decisão |

---

## Contagem (304 itens verificados nesta fatia)

| Estado | Qtd |
|---|---:|
| NÃO INICIADO | 117 |
| PARCIAL | 56 |
| JÁ RESOLVIDO | 54 |
| DIVERGENTE | 40 |
| NÃO VERIFICÁVEL / NÃO VERIFICADO (só banco, cofre ou painel) | 29 |
| OK (referência de runbook confere) | 7 |
| Fora da fatia (lote 12) | 1 |

Itens agregados contam como 1 linha. Exemplos: as "20 rotas sem link", "os 14 componentes mortos" e "as 24 EF órfãs" são uma linha cada. Por unidade, ficam assim:
- **Rotas ⬛:** 20 de 20 continuam sem link.
- **EF ⬛:** 5 de 24 foram agendadas, 5 de 24 só têm botão de admin e 14 de 24 seguem com 0 chamadores.
- **Componentes mortos do lote 02:** 14 de 14 continuam no repo.
- **Hooks órfãos do lote 09:** 49 de 49 foram removidos.
- **Componentes de segurança mortos:** 9 de 11 continuam sem uso.
- **Mocks críticos de rota:** 6 de 13 foram resolvidos e 7 continuam.

## Top 15 por impacto de negócio

1. **Os crons dependem de segredos que não existem no banco.** Todos os crons HTTP e os triggers internos foram reescritos para ler `functions_base_url`, `anon_key` e `coaching_cron_secret` em `_internal_secrets` (20260910153000:31-39, 20261001160000:8-10). Hoje só `coaching_cron_secret` existe (IDENTIDADE_BANCO:94-97). Para piorar, a tabela não tem `CREATE TABLE` no repo. Sem essas chaves, toda automação levanta `internal_edge_job_secrets_missing`: callback V4, alerta de falha de cron, digest de risco, churn, retry de e-mail e ingestão de gravações. **DIVERGENTE/bloqueante.**
2. **O ambiente ainda não é reconstruível e as migrations comprovadamente não chegam a prod.** Não há ledger nem baseline. As funções corrigidas em 20260831130001 não existiam em prod em 2026-09-13 (20260913150000:10-17). `error_logs` e `DEFAULT_PIPELINE_ID` divergem entre repo e prod. A regra 1 do CLAUDE.md ("DDL direto via MCP") continua valendo, embora o postmortem a aponte como causa-raiz do incidente. **NÃO INICIADO.**
3. **Os KPIs de receita continuam errados por raiz de dado.** `mv_competitive_ranking` ainda filtra só `status='completed'` (20260517113746:9), o que dá ranking com rank 1 para todos. `revenue_forecast_view` ainda conta `won` como pipeline aberto e zera cenários por aritmética com NULL (20260715184427:23). `revops-hub` ignora `won` (index.ts:60-61). `sales.stage` segue sem backfill. **NÃO INICIADO/PARCIAL.**
4. **Funil, SLA, timeline, velocidade e lead scoring leem `deal_stage_history`, que está vazia.** São 10 hooks e 6 edge functions. Funil de Conversão, Tempo de Fechamento e baselines ficam permanentemente vazios. **NÃO INICIADO.**
5. **Automações de vendas sem agendamento.** Não têm cron: check-lead-sla, sequence-runner, process-cadence-tasks, process-scheduled-sends, lead-scoring, auto-enroll-cadence, rotate-daily-challenges, qbr-scheduler, renewal-automation, check-quote-expiration, snapshot-forecast e scheduled-reports-runner. Ao mesmo tempo, `AdminSystemStatus.tsx:29-36` exibe agendamentos que não existem. **NÃO INICIADO.**
6. **Dado fictício ainda chega à tela.** Casos ainda abertos:
   - **Analytics:** `CompetencyRadar`/`ChurnPredictionPanel` sem props, com "Tech Solutions LTDA".
   - **Previsão de receita:** `PredictiveScenarioPlanner` fixo em R$ 2,5M.
   - **Win/Loss:** `atRiskFixtures` no barrel, exibindo "ticket-alvo R$ 28.500".
   - **SDR:** `SDRConversationInsights` com 65/25/10 fixo.
   - **Cadências:** `efficiencyScore` 88 fixo; `ApprovalQueue` com `MOCK_PENDING`.
   - **Outros:** `ArenaAITips` com `Math.random`, `OnboardingTracking` com "Empresa Alpha", `useClientVsIndustry` com client 85 e `industryRecommendations` de outro ramo.
7. **Mascaramento "MAPE 0,0% Excelente" sobre tabela vazia.** `useForecastAccuracy.ts:81-104` junto com `forecastHelpers.ts:27`. O painel diz que está ótimo quando não há dado. **NÃO INICIADO.**
8. **A indexação semântica falha em silêncio.** `useIndexEntity.ts:9-16` ignora `{error}` do `invoke`. A busca universal, a visual e a cobertura ficam presas em 0. **NÃO INICIADO.**
9. **Race Arena tem a lógica de eventos quebrada, mas o runbook a chama de "10/10 production-ready".** O diff entre o placar anterior e o atual sai sempre vazio, porque os dois são lidos no mesmo instante (process-race-event/index.ts:61-90). Faltam carros para 10 de 18 vendedores. O matchmaking não foi reagendado. **NÃO INICIADO/DIVERGENTE.**
10. **A telemetria de login está morta por regressão.** A migration revogou o INSERT de anon e de authenticated (20260831130000:116-128), mas o front continua inserindo direto em `login_attempts` (useSecurityMonitoring.ts:58). O rate limit de login e a auditoria de auth ficam cegos. **DIVERGENTE.**
11. **O risco "clients/activities a um GRANT de distância" se materializou em parte.** 20261005140000:13-16 concede EXECUTE a anon em `get_current_salesperson_id`, `is_admin_or_manager` e `get_user_role`. Não existe teste de regressão `SET ROLE anon` no CI. **PARCIAL.**
12. **14 edge functions sem nenhum chamador, enquanto o plano permite 100 deployadas para 172 no repo.** Entre elas estão `winloss-webhook-dispatcher` (sem produtor de eventos), `notify-critical-pattern` (trigger quebrado), `send-quote-to-client` e `check-quote-expiration`. Também seguem os pares duplicados `calibrate-*` e `*-stage-baselines`. **NÃO INICIADO.**
13. **Os docs operacionais apontam para o lugar errado.** Exemplos:
   - **Deploy e monitoramento:** RUNBOOK, on-call e ARCHITECTURE ainda dizem "deploy/monitor/rollback via Lovable" e `championgifts.lovable.app`, um app compilado para outro projeto Supabase. O CLAUDE.md diz Vercel.
   - **Race Arena:** o runbook usa `--project-ref saejqkojleeaxzrslzfg`.
   - **Access-denied:** o runbook cita uma tabela e uma fonte que não existem.
   - **Deal-risk-digest:** o runbook cita logs que a função não emite.

   **DIVERGENTE.**
14. **As ações do postmortem do cron seguem abertas.** O heartbeat externo não existe (cron-monitoring.yml roda 1×/dia e não consulta `cron.job`). Os jobs 2, 11 e 20 não foram reagendados. Duas das quatro funções SQL com ref antiga (`trigger_auto_coaching_on_recording`, `trg_recording_generate_coaching`) nem existem no repo. O backup depende de um secret ausente. **PARCIAL.**
15. **SEC-08 e o service_role.** São 90 de 172 functions ainda com a key crua. Não há gate de CI. O canário `USE_USER_CLIENT_*` não existe. 4 das funções priorizadas não foram migradas. **PARCIAL.**

### O que melhorou de fato desde a auditoria (só repo)
- **Compilação:** nlq-query e ai-copilot voltam a compilar.
- **Mocks removidos:** useOrderTracking, BI mockData, FollowUpAudit, UsageAnalytics e a roleta (agora via RPC).
- **Exposição anônima:** fechada a de products/suppliers/teams e de 8 tabelas de config.
- **RBAC e auditoria:** `has_permission` quebrada removida e auditoria consolidada em `audit_logs`.
- **SECURITY DEFINER:** `soft_delete/restore` ganharam guarda e os `fn_test_*` foram revogados.
- **Configuração:** `config.toml` agora aponta para o projeto oficial, com webhooks públicos.
- **Código morto:** os 49 hooks órfãos foram removidos.
- **pricing-intelligence:** usa `competitors_pricing`.
- **Agendamentos:** 12 jobs HTTP e de alerta passaram a ter agendamento no repo.
