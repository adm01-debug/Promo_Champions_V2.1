# Contexto do projeto para agentes de IA

GERADO AUTOMATICAMENTE por scripts/ai-context/gerar.mjs — não editar à mão; será sobrescrito.
Publicado em `docs/contexto/codigo/` na branch `contexto` (gerada, nunca abra PR dela) a cada push em `main` e a cada 10 minutos pelo workflow `contexto.yml`; índice único das três fontes em `docs/contexto/00-INDEX.md`. Gere local com `node scripts/ai-context/gerar.mjs`. Commit-base: `7535bb0ff75a1a606f66d4bf4584a5e49748615d` (2026-11-09T21:04:53Z).

## Como usar (leia antes de planejar ou executar qualquer tarefa)
1. **Tela/rota/menu** → `rotas.json` (url/vista/menu → arquivo → hooks → tabelas → edges; `rotas_http_backend` para APIs) e `modulos.json` (módulo inteiro + dependências entre módulos).
2. **Hook/serviço/lógica** → `hooks.json`, `logica.json` (quem usa, o que toca, se tem teste).
3. **Edge function / serverless** → `edge-functions.json` (verify_jwt, tabelas, env, quem chama, órfãs).
4. **Banco** → `banco.json` (colunas, RLS, policies, índices, FKs, triggers, cron jobs, buckets, drift migration×types, uso no código) — visão do código; para o banco vivo use o MCP.
5. **Antes de criar arquivo** → `convencoes.json` (onde ficam as coisas, nomenclatura, alias), `componentes.json` (nomes duplicados, órfãos), `grafo.json` (hubs, ciclos de import) e `grafo-graphify.json` (grafo por AST: comunidades, símbolos mais chamados, comunidade de cada arquivo).
6. **CI/scripts/deploy/env/integrações/permissões/flags** → `ferramentas.json` e `scripts.json`.
7. **Antes de abrir PR** → `testes.json` (o que tem e não tem teste, onde os testes ficam), `baseline.json` (alertas, TODOs, hotspots, últimos commits).
Os JSONs são grandes: filtre com `grep`/`jq` pelo caminho/arquivo/tabela da sua tarefa; não carregue tudo.

## Stack
- linguagens: TypeScript (2382), SQL (676), Markdown (203), JavaScript (65), JSON (29), YAML (27), Shell (6), Python (5)
- linguagem_principal: TypeScript
- framework: React
- backend_http: n/d
- bundler: Vite
- roteador: react-router
- banco: Supabase
- testes: vitest, playwright
- ui: tailwind, radix/shadcn
- estado: react-query
- gerenciador_pacotes: npm
- node: 22
- python: n/d
- deploy: vercel
- monorepo: n/d
- pastas_fonte: src

## Números
| item | qtd |
|---|---|
| arquivos_total | 3433 |
| arquivos_codigo | 2450 |
| linhas_codigo | 420249 |
| rotas | 170 |
| rotas_http_backend | 12 |
| vistas_por_id | 0 |
| itens_menu | 133 |
| modulos | 173 |
| componentes | 1276 |
| hooks | 472 |
| edge_functions | 171 |
| tabelas | 414 |
| migrations | 669 |
| cron_jobs | 28 |
| testes | 162 |
| workflows | 25 |
| scripts | 70 |
| docs_md | 203 |

## Onde ficam as coisas
- telas: src/pages (166)
- componentes: src/components (1096), src/pages (173), src/contexts (5)
- hooks: src/hooks (460), src/contexts (6), src/components (4)
- servicos_logica: src/lib (52), src/services (5), src/integrations (4)
- testes: co-localizado (*.test) (83), tests/ (59), outro (14)
- edge_functions: supabase/functions
- migrations: supabase/migrations
- scripts: scripts/graphify (9), scripts/inventario (5), scripts/ci (3)
- docs: docs (44), (raiz) (11), .github (2)
- nomenclatura: {"componentes":"PascalCase (97%)","hooks":"use + PascalCase","servicos":"camelCase (96%)","edge_functions":"kebab-case (99%)","tabelas":"snake_case (92%)"}
- instruções para agentes no repo: AGENTS.md, CLAUDE.md

## Módulos (menu → domínio)
| módulo | itens de menu | telas/rotas | arquivos | hooks locais | edges | tabelas |
|---|---|---|---|---|---|---|
| components/achievements | 0 | 0 | 5 | 7 | 0 | 4 |
| components/activities | 0 | 0 | 20 | 18 | 0 | 10 |
| components/admin | 0 | 0 | 59 | 38 | 7 | 26 |
| components/agents | 0 | 0 | 5 | 3 | 0 | 1 |
| components/analytics | 0 | 0 | 50 | 33 | 2 | 22 |
| components/assistant | 0 | 0 | 13 | 13 | 3 | 13 |
| components/atoms | 0 | 0 | 6 | 2 | 0 | 1 |
| components/auth | 0 | 0 | 5 | 3 | 0 | 3 |
| components/bi | 0 | 0 | 30 | 11 | 0 | 8 |
| components/cadences | 0 | 0 | 22 | 52 | 1 | 16 |
| components/clients | 0 | 0 | 20 | 8 | 1 | 6 |
| components/closer | 0 | 0 | 8 | 7 | 0 | 6 |
| components/coaching | 0 | 0 | 23 | 16 | 5 | 7 |
| components/competitive | 0 | 0 | 33 | 25 | 0 | 35 |
| components/conversation-intelligence | 0 | 0 | 6 | 3 | 1 | 1 |
| components/conversational | 0 | 0 | 58 | 47 | 15 | 24 |
| components/customer-success | 0 | 0 | 12 | 4 | 6 | 0 |
| components/dashboard | 0 | 0 | 56 | 94 | 8 | 71 |
| components/deal-intelligence | 0 | 0 | 47 | 30 | 10 | 15 |
| components/dialer | 0 | 0 | 7 | 9 | 2 | 7 |
| components/email | 0 | 0 | 10 | 15 | 3 | 5 |
| components/engagement | 0 | 0 | 18 | 23 | 5 | 12 |
| components/executive-briefing | 0 | 0 | 6 | 4 | 1 | 2 |
| components/follow-up | 0 | 0 | 6 | 1 | 0 | 1 |
| components/forecast | 0 | 0 | 7 | 1 | 1 | 2 |
| components/gamification | 0 | 0 | 21 | 22 | 1 | 11 |
| components/goals | 0 | 0 | 6 | 2 | 0 | 2 |
| components/icp | 0 | 0 | 5 | 6 | 0 | 3 |
| components/intelligence | 0 | 0 | 10 | 3 | 1 | 4 |
| components/lead-routing | 0 | 0 | 6 | 4 | 0 | 4 |
| components/lead-scoring | 0 | 0 | 13 | 5 | 1 | 8 |
| components/multichannel | 0 | 0 | 11 | 16 | 3 | 5 |
| components/navigation | 0 | 0 | 9 | 330 | 32 | 159 |
| components/nlq | 0 | 0 | 5 | 1 | 1 | 0 |
| components/pipeline | 0 | 0 | 16 | 57 | 3 | 26 |
| components/pipeline-pulse | 0 | 0 | 7 | 2 | 1 | 1 |
| components/playbooks | 0 | 0 | 5 | 7 | 0 | 3 |
| components/portfolio | 0 | 0 | 11 | 17 | 0 | 7 |
| components/pricing | 0 | 0 | 13 | 1 | 1 | 0 |
| components/purchase-intelligence | 0 | 0 | 10 | 5 | 1 | 7 |
| components/race | 0 | 0 | 102 | 45 | 3 | 16 |
| components/ranking | 0 | 0 | 5 | 4 | 1 | 2 |
| components/reporting | 0 | 0 | 15 | 19 | 1 | 7 |
| components/reports | 0 | 0 | 13 | 3 | 0 | 5 |
| components/revenue-intelligence | 0 | 0 | 37 | 59 | 19 | 32 |
| components/sales | 0 | 0 | 16 | 43 | 3 | 20 |
| components/sdr | 0 | 0 | 26 | 22 | 2 | 17 |
| components/security | 0 | 0 | 18 | 14 | 3 | 14 |
| components/sequences | 0 | 0 | 19 | 28 | 4 | 13 |
| components/settings | 0 | 0 | 25 | 28 | 4 | 25 |
| components/shared | 0 | 0 | 8 | 4 | 0 | 2 |
| components/skeletons | 0 | 0 | 5 | 1 | 0 | 0 |
| components/tasks | 0 | 0 | 7 | 16 | 1 | 9 |
| components/ui | 0 | 0 | 46 | 5 | 0 | 0 |
| components/vendedor | 0 | 0 | 6 | 8 | 0 | 8 |
| components/vendedores | 0 | 0 | 13 | 2 | 0 | 2 |
| components/win-loss | 0 | 0 | 60 | 43 | 5 | 21 |
| contexts | 0 | 0 | 6 | 5 | 0 | 1 |
| hooks | 0 | 0 | 145 | 200 | 23 | 107 |
| hooks/admin | 0 | 0 | 10 | 31 | 2 | 22 |
| hooks/admin-tasks | 0 | 0 | 6 | 0 | 0 | 5 |
| hooks/bi | 0 | 0 | 19 | 12 | 0 | 16 |
| hooks/cadences | 0 | 0 | 17 | 47 | 0 | 9 |
| hooks/conversational | 0 | 0 | 16 | 39 | 12 | 16 |
| hooks/crm | 0 | 0 | 6 | 7 | 0 | 5 |
| hooks/dashboard | 0 | 0 | 11 | 9 | 0 | 12 |
| hooks/deal-intelligence | 0 | 0 | 10 | 2 | 11 | 17 |
| hooks/email | 0 | 0 | 12 | 15 | 3 | 3 |
| hooks/engagement | 0 | 0 | 6 | 21 | 5 | 10 |
| hooks/gamification | 0 | 0 | 17 | 25 | 0 | 20 |
| hooks/race | 0 | 0 | 41 | 47 | 3 | 16 |
| hooks/reporting | 0 | 0 | 10 | 18 | 3 | 7 |
| hooks/revenue | 0 | 0 | 5 | 18 | 4 | 9 |
| hooks/sales | 0 | 0 | 15 | 32 | 2 | 26 |
| hooks/sequences | 0 | 0 | 10 | 27 | 5 | 8 |
| hooks/win-loss | 0 | 0 | 52 | 34 | 4 | 15 |
| lib | 0 | 0 | 27 | 10 | 2 | 9 |
| lib/supabase | 0 | 0 | 6 | 0 | 0 | 0 |
| lib/winloss | 0 | 0 | 6 | 0 | 0 | 3 |
| pages | 110 | 155 | 161 | 788 | 114 | 293 |
| pages/admin | 1 | 12 | 12 | 81 | 10 | 46 |
| services | 0 | 0 | 5 | 0 | 0 | 12 |

## Rotas (url → arquivo)
- `/*` [tela] → src/pages/Vendas.tsx (protegida)
- `/*` [tela] → src/pages/NotFound.tsx
- `/abm` [tela] → src/pages/AccountBasedSelling.tsx
- `/acesso-negado` [tela] → src/pages/AccessDenied.tsx
- `/acompanhamento-pedidos` [tela] → src/pages/AcompanhamentoPedidos.tsx (protegida)
- `/acompanhamento-pedidos/:id` [tela] → src/pages/AcompanhamentoPedidoDetalhe.tsx (protegida)
- `/admin` [tela] → src/pages/AdminDashboard.tsx (protegida)
- `/admin/alertas-churn` [tela] → src/pages/AdminAlertasChurn.tsx (protegida)
- `/admin/alertas-churn/historico` [tela] → src/pages/AdminHistoricoAlertasChurn.tsx (protegida)
- `/admin/comercial` [tela] → src/pages/admin/AdminComercial.tsx (protegida)
- `/admin/comissoes` [tela] → src/pages/AdminComissoes.tsx (protegida)
- `/admin/conexoes` [tela] → src/pages/admin/AdminConexoesPage.tsx (protegida)
- `/admin/fila-tarefas-automaticas` [tela] → src/pages/AdminFilaTarefasAutomaticas.tsx (protegida)
- `/admin/platform-slo` [tela] → src/pages/admin/AdminPlatformSLOPage.tsx (protegida)
- `/admin/premiacoes` [tela] → src/pages/AdminPremiacoes.tsx (protegida)
- `/admin/premiacoes/auditoria` [tela] → src/pages/AdminAuditoriaPremiacoes.tsx (protegida)
- `/admin/quote-conversions` [tela] → src/pages/admin/AdminQuoteConversionsPage.tsx (protegida)
- `/admin/quote-sync-inbound` [tela] → src/pages/admin/AdminQuoteSyncInboundPage.tsx (protegida)
- `/admin/race-arena` [tela] → src/pages/admin/RaceArenaAdmin.tsx (protegida)
- `/admin/regras-comissao` [tela] → src/pages/CommissionRules.tsx
- `/admin/regras-inatividade` [tela] → src/pages/AdminRegrasInatividade.tsx (protegida)
- `/admin/retry-test-status` [tela] → src/pages/RetryTestStatusPage.tsx (protegida)
- `/admin/solicitacoes-titular` [tela] → src/pages/AdminSolicitacoesTitular.tsx (protegida)
- `/admin/supressao-emails` [tela] → src/pages/AdminSupressaoEmails.tsx (protegida)
- `/admin/tarefas` [tela] → src/pages/AdminTasksPage.tsx (protegida)
- `/admin/telemetria` [tela] → src/pages/AdminTelemetria.tsx (protegida)
- `/admin/v4-callbacks` [tela] → src/pages/admin/AdminV4CallbacksPage.tsx (protegida)
- `/admin/web-vitals` [tela] → src/pages/admin/AdminWebVitalsPage.tsx (protegida)
- `/admin/webhooks-alert-history` [tela] → src/pages/admin/WebhookAlertHistoryPage.tsx (protegida)
- `/admin/webhooks-alert-settings` [tela] → src/pages/admin/WebhookAlertSettingsPage.tsx (protegida)
- `/admin/webhooks-dead-letters` [tela] → src/pages/admin/WebhooksDeadLettersAdmin.tsx (protegida)
- `/admin/webhooks-timeline` [tela] → src/pages/admin/WebhookTimelinePage.tsx (protegida)
- `/agenda` [tela] → src/pages/Agenda.tsx
- `/agentes` [tela] → src/pages/AIAgents.tsx
- `/analytics` [tela] → src/pages/Analytics.tsx
- `/analytics/abc` [tela] → src/pages/ABCAnalysisPage.tsx
- `/analytics/closing-time` [tela] → src/pages/ClosingTimePage.tsx
- `/analytics/deal-velocity` [tela] → src/pages/DealVelocityPage.tsx
- `/analytics/emails` [tela] → src/pages/EmailAnalyticsPage.tsx
- `/analytics/evolution` [tela] → src/pages/EvolutionCurvesPage.tsx
- `/analytics/objections` [tela] → src/pages/ObjectionsLibraryPage.tsx
- `/analytics/win-loss` [tela] → src/pages/WinLossAnalysisPage.tsx
- `/aprovacoes` [tela] → src/pages/ApprovalWorkflowsPage.tsx
- `/arena` [tela] → src/pages/ArenaCompetitiva.tsx
- `/assinatura-digital` [tela] → src/pages/AssinaturaDigital.tsx
- `/assistente` [tela] → src/pages/Assistente.tsx
- `/atividades` [tela] → src/pages/Atividades.tsx
- `/audit-logs` [tela] → src/pages/AuditLogsPage.tsx
- `/auth` [tela] → src/pages/Auth.tsx (protegida)
- `/automacao-inteligente` [tela] → src/pages/AutomacaoInteligente.tsx
- `/automacoes` [tela] → src/pages/Automacoes.tsx
- `/benchmarking` [tela] → src/pages/HistoricalBenchmark.tsx
- `/bi-closer` [tela] → src/pages/BICloser.tsx
- `/bi-gestor` [tela] → src/pages/BIGestor.tsx
- `/bi-sdr` [tela] → src/pages/BISDR.tsx
- `/bi-vendedor` [tela] → src/pages/BIVendedor.tsx
- `/bitrix24` [tela] → src/pages/Bitrix24.tsx
- `/busca` [tela] → src/pages/SemanticSearch.tsx
- `/busca-inteligente` [tela] → src/pages/SmartSearch.tsx
- `/cadencias` [tela] → src/pages/Cadencias.tsx
- `/cadencias-orcamentos` [tela] → src/pages/QuoteCadencesPage.tsx
- `/calendario` [tela] → src/pages/Calendario.tsx
- `/clientes` [tela] → src/pages/Clientes.tsx
- `/coaching-inteligente` [tela] → src/pages/CoachingInteligente.tsx
- `/comissoes` [tela] → src/pages/Comissoes.tsx
- `/comparador-precos` [tela] → src/pages/ComparadorPrecos.tsx
- `/competencias` [tela] → src/pages/Competencias.tsx
- `/competitive-seasons` [tela] → src/pages/CompetitiveSeasonsAdmin.tsx (protegida)
- `/configuracoes` [tela] → src/pages/Configuracoes.tsx
- `/contas/:id` [tela] → **ARQUIVO NÃO RESOLVIDO**
- `/conversational-intelligence` [tela] → src/pages/ConversationalIntelligenceHub.tsx
- `/conversational-intelligence/gravacoes` [tela] → src/pages/ConversationalIntelligence.tsx
- `/customer-success` [tela] → src/pages/CustomerSuccessHub.tsx
- `/customer-success-360` [tela] → src/pages/CustomerSuccess360.tsx
- `/deal-intelligence` [tela] → src/pages/DealIntelligence.tsx
- `/deduplicacao` [tela] → src/pages/Deduplication.tsx
- `/desafios` [tela] → src/pages/DesafiosSemanais.tsx
- `/desafios-diarios` [tela] → src/pages/HistoricoDesafiosDiarios.tsx
- `/email-tracking` [tela] → src/pages/EmailTracking.tsx
- `/embed/report/:token` [tela] → src/pages/EmbedReportPage.tsx
- `/engagement/abm` [tela] → src/pages/AccountBasedEngagement.tsx
- `/engagement/abm/:accountId` [tela] → src/pages/AccountDetail.tsx
- `/engagement/bulk-composer` [tela] → src/pages/BulkComposer.tsx
- `/engagement/dialer` [tela] → src/pages/PowerDialer.tsx
- `/engagement/email-scoring` [tela] → src/pages/EmailEngagementScoring.tsx
- `/engagement/send-time` [tela] → src/pages/SendTimeOptimization.tsx
- `/estoque` [tela] → src/pages/Estoque.tsx
- `/evolucao-precos` [tela] → src/pages/PriceEvolution.tsx
- `/feature-flags` [tela] → src/pages/FeatureFlagsAdmin.tsx (protegida)
- `/ferramentas/bi` [tela] → src/pages/BusinessIntelligencePage.tsx
- `/follow-up` [tela] → src/pages/FollowUpInteligente.tsx
- `/follow-up/audit` [tela] → src/pages/FollowUpAudit.tsx
- `/fonte-leads` [tela] → src/pages/FonteLeads.tsx
- `/forecast` [tela] → src/pages/ForecastPonderado.tsx
- `/fornecedores` [tela] → src/pages/Fornecedores.tsx
- `/funil` [tela] → src/pages/FunnelAnalysis.tsx
- `/gamificacao/badges` [tela] → src/pages/BadgesGalleryPage.tsx
- `/gatilhos-inatividade` [tela] → src/pages/InactivityTriggers.tsx
- `/health-score` [tela] → src/pages/ClientHealthScore.tsx
- `/icp` [tela] → src/pages/ICP.tsx
- `/importar-exportar` [tela] → src/pages/ImportExport.tsx
- `/inteligencia` [tela] → src/pages/Intelligence.tsx
- `/inteligencia-compras` [tela] → src/pages/PurchaseIntelligence.tsx
- `/inteligencia-preditiva` [tela] → src/pages/InteligenciaPreditiva.tsx
- `/kanban-clientes` [tela] → src/pages/KanbanClientes.tsx
- `/lead-routing` [tela] → src/pages/LeadRoutingPage.tsx
- `/lead-scoring` [tela] → src/pages/LeadScoring.tsx
- `/mapa-clientes` [tela] → src/pages/MapaClientes.tsx
- `/metas` [tela] → src/pages/Metas.tsx
- `/metas-atividades` [tela] → src/pages/MetasAtividades.tsx
- `/metricas-categoria` [tela] → src/pages/CategoryMetrics.tsx
- `/meu-assistente` [tela] → src/pages/MeuAssistente.tsx
- `/meus-pedidos` [redirect] → **ARQUIVO NÃO RESOLVIDO**
- `/meus-pedidos/:id` [tela] → src/pages/OrderDetailPage.tsx (protegida)
- `/minhas-premiacoes` [tela] → src/pages/MinhasPremiacoes.tsx
- `/multichannel` [tela] → src/pages/Multichannel.tsx
- `/notificacoes` [tela] → src/pages/Notificacoes.tsx
- `/nps` [tela] → src/pages/NPSDashboard.tsx
- `/onboarding-tracking` [tela] → src/pages/OnboardingTracking.tsx
- `/orcamentos` [tela] → src/pages/Orcamentos.tsx
- `/perfil-gamer` [tela] → src/pages/GamifiedProfilePage.tsx
- `/perguntar` [tela] → src/pages/AskAnything.tsx
- `/pipeline` [tela] → src/pages/Pipeline.tsx
- `/playbooks` [tela] → src/pages/Playbooks.tsx
- `/portfolio` [tela] → src/pages/Portfolio.tsx
- `/previsao-demanda` [tela] → src/pages/PrevisaoDemanda.tsx
- `/pricing-intelligence` [tela] → src/pages/PricingIntelligenceHub.tsx
- `/produtos` [tela] → src/pages/Produtos.tsx
- `/race-arena` [tela] → src/pages/RaceArenaHub.tsx
- `/race-arena/career` [tela] → src/pages/RaceArenaCareer.tsx
- `/race-arena/closer` [tela] → src/pages/RaceArenaCloser.tsx
- `/race-arena/garage` [tela] → src/pages/RaceArenaGarage.tsx
- `/race-arena/sdr` [tela] → src/pages/RaceArenaSDR.tsx
- `/race-arena/spectator/:seasonId` [tela] → src/pages/RaceSpectator.tsx
- `/race-arena/tv` [tela] → src/pages/RaceArenaTV.tsx (protegida)
- `/ranking` [tela] → src/pages/RankingCompetitivo.tsx
- `/relatorio-atividades` [tela] → src/pages/RelatorioAtividades.tsx
- `/relatorios` [tela] → src/pages/Relatorios.tsx
- `/relatorios-agendados` [tela] → src/pages/ScheduledReports.tsx
- `/relatorios-custom` [tela] → src/pages/CustomReports.tsx
- `/relatorios-custom/:id` [tela] → src/pages/CustomReports.tsx
- `/relatorios-email` [tela] → src/pages/RelatoriosEmail.tsx
- `/relatorios-executivos` [tela] → src/pages/RelatoriosExecutivos.tsx
- `/relatorios/cohort` [tela] → src/pages/CohortReportPage.tsx
- `/relatorios/funil` [tela] → src/pages/FunnelReportPage.tsx
- `/relatorios/vendas` [tela] → src/pages/SalesReportPage.tsx (protegida)
- `/reset-password` [tela] → src/pages/ResetPassword.tsx
- `/revenue-forecast` [tela] → src/pages/RevenueForecast.tsx
- `/revenue-forecast-v2` [tela] → src/pages/RevenueForecastV2.tsx
- `/revenue-intelligence` [tela] → src/pages/RevenueIntelligence.tsx
- `/revops` [tela] → src/pages/RevOpsHub.tsx
- `/roi` [tela] → src/pages/ROIDashboard.tsx
- `/sales-enablement` [tela] → src/pages/SalesEnablementHub.tsx
- `/seguranca` [tela] → src/pages/SecurityDashboard.tsx (protegida)
- `/sequences` [tela] → src/pages/SequencesPage.tsx
- `/sla-tracking` [tela] → src/pages/SLATrackingPage.tsx
- `/tarefas` [tela] → src/pages/Tarefas.tsx
- `/team-activity` [tela] → src/pages/TeamActivityFeed.tsx
- `/territorios` [tela] → src/pages/Territorios.tsx
- `/territory-optimization` [tela] → src/pages/TerritoryOptimizationHub.tsx
- `/times` [tela] → src/pages/Times.tsx
- `/top-produtos` [tela] → src/pages/TopProductsRanking.tsx
- `/usage-analytics` [tela] → src/pages/UsageAnalytics.tsx (protegida)
- `/vendas/:id` [redirect] → **ARQUIVO NÃO RESOLVIDO**
- `/vendedores` [tela] → src/pages/Vendedores.tsx
- `/victory-feed` [tela] → src/pages/VictoryFeedPage.tsx
- `/webhooks` [tela] → src/pages/WebhooksPage.tsx
- `/win-loss-intelligence` [tela] → src/pages/WinLossIntelligence.tsx
- `/workflow-builder` [tela] → src/pages/AutomationBuilder.tsx
- `/workflows` [tela] → src/pages/WorkflowsPage.tsx

## Rotas HTTP de backend
- `GET /{t}` → scripts/ai-context/cenarios.mjs
- `GET /a` → scripts/ai-context/cenarios.mjs
- `GET /a` → scripts/ai-context/cenarios.mjs
- `POST /b` → scripts/ai-context/cenarios.mjs
- `POST /b` → scripts/ai-context/cenarios.mjs
- `DELETE /c` → scripts/ai-context/cenarios.mjs
- `PUT /d` → scripts/ai-context/cenarios.mjs
- `GET /items` → scripts/ai-context/gerar.unit.mjs
- `GET /u` → scripts/ai-context/cenarios.mjs
- `GET /users` → scripts/ai-context/cenarios.mjs
- `POST /users/:id` → scripts/ai-context/cenarios.mjs
- `GET /x` → scripts/ai-context/cenarios.mjs

## Vistas por id (menu/ViewRouter → arquivo)
- (nenhum)

## Edge functions
- `access-denied-alerts` — tabelas: access_denied_logs, email_logs, notification_preferences, salespeople, security_alert_history, security_alert_settings, user_roles; chamada por 1 arquivo(s) do front
- `account-engagement-aggregator` — tabelas: account_contacts, accounts, email_engagement_scores; chamada por 1 arquivo(s) do front
- `activity-goal-alerts` — tabelas: _internal_secrets, activities, activity_goals, email_logs, notification_preferences, salespeople; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `admin-conversion-trail` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `aggregate-coaching-scorecard` — tabelas: call_coaching_scorecards, call_conversation_metrics, call_critical_moments, call_objection_analysis, call_question_analysis, call_recordings, call_sentiment_timeline, salespeople, salesperson_coaching_aggregates; chamada por 2 arquivo(s) do front
- `ai-agent-orchestrator` — tabelas: activities, agenda_events, ai_agent_actions, ai_agent_runs, client_portfolio, leads, salespeople; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `ai-copilot` — tabelas: activities, sales, salespeople, tasks; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `ai-email-composer` — tabelas: account_contacts, clients, sales; chamada por 3 arquivo(s) do front
- `analyze-call` — tabelas: call_insights, call_recordings, call_transcripts; chamada por 1 arquivo(s) do front
- `analyze-conversation` — tabelas: conversation_analyses; chamada por 1 arquivo(s) do front
- `analyze-conversation-metrics` — tabelas: call_conversation_metrics, call_recordings; chamada por 2 arquivo(s) do front
- `analyze-objection-handling` — tabelas: call_objection_analysis, call_objections, call_recordings, objection_library; chamada por 2 arquivo(s) do front
- `analyze-pipeline-coverage` — tabelas: _internal_secrets, pipeline_coverage_recommendations, pipeline_coverage_snapshots, sales, sales_goals; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `analyze-question-quality` — tabelas: call_question_analysis, call_questions, call_recordings; chamada por 2 arquivo(s) do front
- `analyze-sentiment-timeline` — tabelas: call_recordings, call_sentiment_timeline; chamada por 2 arquivo(s) do front
- `analyze-skill-gaps` — tabelas: coaching_opportunities, salespeople, skill_assessments, skill_development_tracks; chamada por 1 arquivo(s) do front
- `analyze-stage-conversion` — tabelas: deal_stage_history, sales, stage_bottleneck_insights, stage_conversion_metrics; chamada por 1 arquivo(s) do front
- `analyze-win-loss` — tabelas: sales, win_loss_analyses; chamada por 3 arquivo(s) do front
- `auto-enroll-cadence` — tabelas: cadence_steps, cadence_tasks, prospect_cadences, sales; chamada por 1 arquivo(s) do front
- `auto-reassign-inactive` — tabelas: client_portfolio, portfolio_settings, sales, salespeople; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `automation-suggestions` — tabelas: automation_runs, automation_workflows, sales; chamada por 1 arquivo(s) do front
- `behavioral-analysis` — tabelas: automation_runs; chamada por 1 arquivo(s) do front
- `bitrix24-oauth` (verify_jwt=false) — tabelas: audit_logs, portfolio_settings; chamada por 1 arquivo(s) do front
- `bitrix24-sync` — tabelas: _internal_secrets, bitrix24_sync_logs, clients, icp_data, portfolio_settings, sales; chamada por 1 arquivo(s) do front
- `broadcast-sale-notification` — tabelas: _internal_secrets, sale_notifications_audit, sales, salespeople, user_roles; chamada por 0 arquivo(s) do front, por SQL/cron
- `calculate-committee-coverage` — tabelas: deal_committee_coverage, deal_stakeholders, sales, salespeople; chamada por 1 arquivo(s) do front
- `calculate-deal-health` — tabelas: activities, call_critical_moments, call_recordings, coaching_actions, competitor_mentions, deal_health_scores, sales, salespeople; chamada por 1 arquivo(s) do front
- `calibrate-win-probability` — tabelas: deal_probability_scores, sales, win_probability_calibrations; chamada por 1 arquivo(s) do front
- `campaign-health-alert` (verify_jwt=false) — tabelas: _internal_secrets, campaign_health_alerts, email_bulk_drafts, email_bulk_jobs, email_opt_outs, notifications; chamada por 0 arquivo(s) do front, por SQL/cron
- `challenge-expiration-alerts` — tabelas: _internal_secrets, achievements, challenge_progress, salespeople, weekly_challenges; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `check-lead-sla` — tabelas: _internal_secrets, activities, app_config, email_logs, sales; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `check-quote-expiration` — tabelas: _internal_secrets, notifications, quotes; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `check-v4-callback-alerts` (verify_jwt=false) — tabelas: _internal_secrets, v4_callback_alert_settings, v4_callback_alerts, v4_callback_dead_letters; chamada por 0 arquivo(s) do front
- `coaching-impact-summary` — tabelas: coaching_impact_metrics; chamada por 1 arquivo(s) do front
- `coaching-intelligence` — tabelas: activities, sales, sales_goals, salespeople; chamada por 1 arquivo(s) do front
- `coaching-session-prep` — tabelas: activities, call_coaching_scorecards, sales, salespeople; chamada por 1 arquivo(s) do front
- `collect-race-powerup` — tabelas: race_badges, race_events, race_leaderboard_view, race_powerups, salespeople; chamada por 1 arquivo(s) do front
- `compute-forecast-accuracy` — tabelas: forecast_accuracy, forecast_confidence_scores, forecast_snapshots, sales; chamada por 1 arquivo(s) do front
- `conversational-intelligence` — tabelas: call_insights, call_recordings; chamada por 1 arquivo(s) do front
- `create-stagnant-tasks` — tabelas: notification_preferences, sales, tasks; chamada por 1 arquivo(s) do front
- `cron-failure-alerter` (verify_jwt=false) — tabelas: _internal_secrets, notifications, user_roles; chamada por 0 arquivo(s) do front
- `csat-ces-trigger` — tabelas: csat_ces_surveys; chamada por 1 arquivo(s) do front
- `customer-success-360` — tabelas: accounts, clients, csat_ces_surveys, expansion_opportunities, onboarding_journeys, orders, product_usage_summary, qbr_schedule, quotes, renewals, sales, support_tickets; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `customer-success-hub` — tabelas: account_activities, accounts; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `deal-probability` — tabelas: deal_outcomes, deal_stage_history, sales; chamada por 1 arquivo(s) do front
- `deal-risk-digest` (verify_jwt=false) — tabelas: _internal_secrets, deal_health_scores, notifications, salespeople; chamada por 0 arquivo(s) do front
- `demand-forecast` — tabelas: demand_forecasts, inventory_levels, products, sales; chamada por 1 arquivo(s) do front
- `detect-at-risk-deals` — tabelas: activities, deal_stage_history, sales; chamada por 1 arquivo(s) do front
- `detect-client-churn-alerts` (verify_jwt=false) — tabelas: _internal_secrets, churn_alert_settings, client_churn_alerts_state, notifications, sales, tasks; chamada por 1 arquivo(s) do front
- `detect-coaching-opportunities` — tabelas: activities, coaching_opportunities, coaching_skill_benchmarks, sales, salespeople; chamada por 1 arquivo(s) do front
- `detect-competitor-mentions` — tabelas: call_recordings, competitor_mentions, competitors_registry; chamada por 2 arquivo(s) do front
- `detect-critical-moments` — tabelas: call_critical_moments, call_recordings, call_sentiment_timeline; chamada por 2 arquivo(s) do front
- `detect-stuck-deals` — tabelas: deal_stage_transitions, deal_velocity_alerts, stage_velocity_baselines; chamada por 1 arquivo(s) do front
- `detect-winloss-at-risk` — tabelas: sales, win_loss_patterns; chamada por 1 arquivo(s) do front
- `dialer-queue-builder` — tabelas: dialer_queue_items, dialer_queues, email_engagement_scores, sales; chamada por 1 arquivo(s) do front
- `diarize-call-recording` — tabelas: call_recordings; chamada por 1 arquivo(s) do front
- `dispatch-webhook` — tabelas: webhook_deliveries, webhooks; chamada por 1 arquivo(s) do front
- `edge-retry-threshold-alert` (verify_jwt=false) — tabelas: _internal_secrets, edge_retry_events; chamada por 1 arquivo(s) do front
- `elevenlabs-stt` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `elevenlabs-tts` — tabelas: -; chamada por 1 arquivo(s) do front
- `elevenlabs-voice` — tabelas: -; chamada por 1 arquivo(s) do front
- `email-bulk-retry` (verify_jwt=false) — tabelas: _internal_secrets, churn_alert_settings, email_bulk_drafts; chamada por 1 arquivo(s) do front
- `email-bulk-send` — tabelas: churn_alert_settings, email_bulk_drafts, email_bulk_jobs; chamada por 1 arquivo(s) do front
- `email-composer-bulk` — tabelas: activities, clients, email_bulk_drafts, email_bulk_jobs, sales; chamada por 1 arquivo(s) do front
- `email-engagement-scorer` — tabelas: email_engagement_scores, email_tracking_events; chamada por 1 arquivo(s) do front
- `email-unsubscribe` (verify_jwt=false) — tabelas: -; chamada por 0 arquivo(s) do front
- `engagement-score-recompute` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `enrich-lead` — tabelas: -; chamada por 1 arquivo(s) do front
- `execute-workflow` — tabelas: activities, agenda_events, automation_runs, automation_workflows, sales; chamada por 1 arquivo(s) do front
- `expansion-detector` — tabelas: accounts, expansion_opportunities, expansion_playbooks, product_usage_summary; chamada por 1 arquivo(s) do front
- `export-winloss-pdf` — tabelas: win_loss_analyses; chamada por 1 arquivo(s) do front
- `external-db-bridge` — tabelas: query_telemetry; chamada por 1 arquivo(s) do front
- `extract-coaching-actions` — tabelas: call_insights, call_recordings, coaching_actions; chamada por 2 arquivo(s) do front
- `extract-committee-from-call` — tabelas: call_recordings, committee_extraction_runs, deal_stakeholders, sales; chamada por 1 arquivo(s) do front
- `extract-deal-stakeholders` — tabelas: call_recordings, deal_stakeholders, sales, salespeople; chamada por 1 arquivo(s) do front
- `forecast-narrative` — tabelas: ai_narrative_cache, forecast_narrative_dead_letters, revenue_forecasts; chamada por 0 arquivo(s) do front
- `generate-coaching-actions` — tabelas: _internal_secrets, call_recordings, coaching_actions; chamada por 0 arquivo(s) do front
- `generate-executive-briefing` — tabelas: executive_briefings; chamada por 1 arquivo(s) do front
- `generate-loss-coaching` — tabelas: coaching_sessions, win_loss_analyses; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `generate-revenue-forecast` — tabelas: forecast_deal_contributions, revenue_forecasts, sales, sales_goals, stage_probabilities; chamada por 1 arquivo(s) do front
- `generate-urgent-client-tasks` (verify_jwt=false) — tabelas: _internal_secrets, auto_task_queue_settings, sales, salespeople, tasks; chamada por 1 arquivo(s) do front
- `geocode-proxy` — tabelas: geocode_cache; chamada por 1 arquivo(s) do front
- `get-client-ip` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `health` (verify_jwt=false) — tabelas: -; chamada por 0 arquivo(s) do front
- `helpdesk-sync` — tabelas: _internal_secrets, accounts, support_tickets; chamada por 1 arquivo(s) do front
- `inbound-email-webhook` (verify_jwt=false) — tabelas: inbound_reply_events, sequence_step_executions; chamada por 0 arquivo(s) do front
- `lead-scoring` — tabelas: deal_stage_history, lead_scores, sales, tasks; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `log-web-vitals` (verify_jwt=false) — tabelas: web_vitals_samples; chamada por 1 arquivo(s) do front
- `mine-win-loss-patterns` — tabelas: win_loss_analyses, win_loss_insights, win_loss_patterns; chamada por 2 arquivo(s) do front
- `multichannel-status-webhook` (verify_jwt=false) — tabelas: outbound_messages, sequence_enrollments, webhook_inbound_dedupe; chamada por 0 arquivo(s) do front
- `new-device-alert` — tabelas: email_logs, known_devices, login_alerts, push_subscriptions; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `next-best-action` — tabelas: accounts, activities, deal_outcomes, lead_scores, sales, sales_goals, salespeople, sequence_enrollments, tasks; chamada por 1 arquivo(s) do front
- `nlq-query` — tabelas: activities, sales, salespeople_public; chamada por 1 arquivo(s) do front
- `notify-critical-pattern` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `notify-quote-conversion` — tabelas: -; chamada por 1 arquivo(s) do front
- `notify-ranking-position` — tabelas: ranking_notifications, sales, salespeople; chamada por 1 arquivo(s) do front
- `notify-v4-quote-status` (verify_jwt=false) — tabelas: _internal_secrets, v4_callback_dead_letters; chamada por 1 arquivo(s) do front
- `onboarding-launcher` — tabelas: accounts, onboarding_journeys, onboarding_steps; chamada por 1 arquivo(s) do front
- `personal-assistant-stream` — tabelas: coaching_actions, personal_assistant_briefings, sales, sales_goals, salespeople, tasks; chamada por 1 arquivo(s) do front
- `pipeline-pulse-aggregator` — tabelas: conversation_analyses, deal_health_scores, lead_routing_log, sales; chamada por 1 arquivo(s) do front
- `predict-deal-velocity` — tabelas: deal_committee_coverage, deal_health_scores, deal_stage_history, deal_velocity_predictions, sales, salespeople, stage_velocity_baselines; chamada por 1 arquivo(s) do front
- `predict-quota-attainment` — tabelas: deal_probability_scores, quota_attainment_actions, quota_attainment_alerts, quota_attainment_forecasts, quota_attainment_predictions, sales, sales_goals, salespeople; chamada por 1 arquivo(s) do front
- `predictive-intelligence` — tabelas: clients, lead_scores, sales; chamada por 1 arquivo(s) do front
- `predictive-scoring-explain` — tabelas: lead_score_explanations, lead_scores, sales, salespeople; chamada por 2 arquivo(s) do front
- `pricing-intelligence` — tabelas: competitors_pricing, products, sales, salespeople_public; chamada por 1 arquivo(s) do front
- `process-cadence-tasks` — tabelas: cadence_tasks; chamada por 1 arquivo(s) do front
- `process-call-recording-ingest` (verify_jwt=false) — tabelas: _internal_secrets, call_recordings; chamada por 0 arquivo(s) do front
- `process-race-event` — tabelas: race_badges, race_cars, race_events, race_leaderboard_view, race_powerups, race_scoring_rules, race_seasons, sales, salespeople; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `process-scheduled-sends` — tabelas: scheduled_sends; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `purchase-intelligence-forecast` — tabelas: -; chamada por 1 arquivo(s) do front
- `push-subscribe` — tabelas: push_subscriptions; chamada por 1 arquivo(s) do front
- `qbr-generator` — tabelas: qbr_reports, sales; chamada por 1 arquivo(s) do front
- `qbr-scheduler` — tabelas: accounts, agenda_events, notifications, qbr_schedule, salespeople; chamada por 1 arquivo(s) do front
- `race-commentary` — tabelas: -; chamada por 1 arquivo(s) do front
- `ranking-api` — tabelas: salespeople, salesperson_custom_field_values, score_change_logs, team_custom_fields, team_members, teams; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `receive-quote-sync` (verify_jwt=false) — tabelas: quote_sync_inbound_log, quotes, quotes_inbound, webhook_inbound_dedupe; chamada por 0 arquivo(s) do front
- `receive-quote-webhook` (verify_jwt=false) — tabelas: quote_sync_logs, quotes, salespeople; chamada por 0 arquivo(s) do front
- `recompute-stage-baselines` — tabelas: deal_stage_transitions, sales, stage_velocity_baselines; chamada por 2 arquivo(s) do front
- `renewal-automation` — tabelas: notifications, renewals, tasks; chamada por 1 arquivo(s) do front
- `report-builder-execute` — tabelas: custom_reports; chamada por 1 arquivo(s) do front
- `report-embed-public` (verify_jwt=false) — tabelas: report_embed_tokens; chamada por 1 arquivo(s) do front
- `revenue-forecast-ai` — tabelas: revenue_forecast_view; chamada por 2 arquivo(s) do front
- `revenue-intelligence` — tabelas: pipeline_inspection_snapshots, sales_goals; chamada por 1 arquivo(s) do front
- `revops-hub` — tabelas: activities, commissions, sales, sales_goals; chamada por 1 arquivo(s) do front
- `rotate-daily-challenges` — tabelas: daily_challenge_rotations, daily_challenges; chamada por 2 arquivo(s) do front
- `run-retry-tests` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `sales-assistant-chat` — tabelas: activities, activity_goals, deal_outcomes, deal_stage_history, lead_scores, objections_library, sales, sales_goals, salespeople; chamada por 1 arquivo(s) do front
- `salesperson-coaching` — tabelas: deal_outcomes, salespeople; chamada por 1 arquivo(s) do front
- `schedule-optimal-send` — tabelas: scheduled_sends, send_time_profiles; chamada por 1 arquivo(s) do front
- `scheduled-report-trigger` — tabelas: scheduled_reports; chamada por 1 arquivo(s) do front
- `scheduled-reports-runner` — tabelas: _internal_secrets, client_portfolio, clients, custom_reports, salespeople, scheduled_report_runs, scheduled_reports; chamada por 0 arquivo(s) do front
- `sdr-consecutive-alerts` — tabelas: _internal_secrets, activities, activity_goals, email_logs, notification_preferences, salespeople, sdr_alert_history, user_roles; chamada por 1 arquivo(s) do front
- `semantic-coverage` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `semantic-index-entity` — tabelas: client_portfolio, semantic_index; chamada por 0 arquivo(s) do front
- `semantic-reindex-batch` — tabelas: semantic_index; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `semantic-search` — tabelas: -; chamada por 1 arquivo(s) do front
- `semantic-search-universal` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `send-alert-notifications` — tabelas: _internal_secrets, email_logs, notification_preferences, sales, sales_goals, salespeople; chamada por 1 arquivo(s) do front
- `send-churn-alert-email` — tabelas: churn_alert_settings; chamada por 1 arquivo(s) do front
- `send-multichannel-message` — tabelas: channel_credentials; chamada por 2 arquivo(s) do front
- `send-password-reset` — tabelas: password_reset_requests; chamada por 1 arquivo(s) do front
- `send-push-notification` — tabelas: push_subscriptions; chamada por 0 arquivo(s) do front
- `send-quote-to-client` — tabelas: client_interactions, clients, quotes, salespeople; chamada por 1 arquivo(s) do front
- `send-time-optimizer` — tabelas: email_tracking_events, sales, send_time_profiles; chamada por 1 arquivo(s) do front
- `send-transactional-email` — tabelas: email_logs, salespeople; chamada por 2 arquivo(s) do front
- `sequence-ab-promote` — tabelas: -; chamada por 1 arquivo(s) do front
- `sequence-enroll` — tabelas: sequence_enrollments, sequence_steps, sequences; chamada por 1 arquivo(s) do front
- `sequence-record-reply` — tabelas: sequence_enrollments, sequence_step_executions; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `sequence-runner` — tabelas: account_contacts, agenda_events, clients, sales, salespeople, sequence_enrollments, sequence_step_assignments, sequence_step_executions, sequence_step_variants, sequence_steps; chamada por 1 arquivo(s) do front
- `simulate-load` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `snapshot-forecast` — tabelas: forecast_snapshots, sales; chamada por 1 arquivo(s) do front
- `start-race-season` — tabelas: race_cars, race_powerups, race_scoring_rules, race_seasons, salespeople; chamada por 1 arquivo(s) do front
- `stress-test-contracts` — tabelas: -; chamada por 1 arquivo(s) do front
- `summarize-call-recording` — tabelas: call_recordings, clients, sales; chamada por 2 arquivo(s) do front
- `territory-optimization` — tabelas: sales, sales_territories, salespeople_public; chamada por 1 arquivo(s) do front
- `test-integration-connection` — tabelas: integration_connections, integration_health_checks; chamada por 1 arquivo(s) do front
- `transcribe-call-recording` — tabelas: call_recordings, salespeople; chamada por 1 arquivo(s) do front
- `twilio-call-status` (verify_jwt=false) — tabelas: call_logs, channel_credentials, twilio_call_sessions, webhook_inbound_dedupe; chamada por 0 arquivo(s) do front
- `twilio-call-twiml` (verify_jwt=false) — tabelas: channel_credentials; chamada por 0 arquivo(s) do front
- `twilio-click-to-call` — tabelas: channel_credentials, twilio_call_sessions; chamada por 1 arquivo(s) do front
- `visual-search` — tabelas: -; chamada por 1 arquivo(s) do front
- `wal-health-alert` — tabelas: _internal_secrets, v_platform_wal_health; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `webauthn` — tabelas: webauthn_challenges, webauthn_credentials; chamada por 1 arquivo(s) do front
- `webvitals-regression-alert` — tabelas: _internal_secrets, v_web_vitals_p75; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `whatsapp-inbound-webhook` (verify_jwt=false) — tabelas: channel_credentials, inbound_reply_events, outbound_messages, sequence_step_executions; chamada por 0 arquivo(s) do front
- `winloss-webhook-dispatcher` — tabelas: _internal_secrets, winloss_webhook_dead_letters, winloss_webhook_deliveries, winloss_webhook_dispatch_metrics, winloss_webhook_subscriptions; chamada por 0 arquivo(s) do front
- `winloss-webhook-health-monitor` — tabelas: _internal_secrets, winloss_alert_settings, winloss_webhook_alerts, winloss_webhook_deliveries, winloss_webhook_subscriptions; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `winloss-webhook-replay` — tabelas: user_roles, winloss_webhook_dead_letters, winloss_webhook_deliveries, winloss_webhook_replay_audit, winloss_webhook_replay_invocations; chamada por 3 arquivo(s) do front
- `winloss-webhook-replay-batch` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `winloss-webhook-timeline` — tabelas: user_roles, winloss_webhook_alerts, winloss_webhook_dead_letters, winloss_webhook_deliveries; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `workflow-executor` — tabelas: workflow_executions, workflows; chamada por 1 arquivo(s) do front

## Cron jobs (pg_cron / vercel)
- `auto-task-queue-hourly` 0 * * * * (20260831163000_secure_churn_and_task_crons.sql)
- `bitrix24-sync-hourly` 17 * * * * (20261013170000_bitrix24_sync_cron.sql)
- `campaign-health-alert-30min` */30 * * * * → edge campaign-health-alert (20260726202421_0e6c60a8-07a3-4e75-9aa4-934a5fbafc09.sql)
- `challenge-progress-sync` 15 3 * * * (20261019153000_lgpd_gamificacao_r2.sql)
- `check-v4-callback-alerts-every-5min` */5 * * * * (20260831170000_secure_operational_edge_crons.sql)
- `cleanup-stale-logs-daily` 15 3 * * * (20260711153757_a957a586-25a5-45a6-8ace-6f4e9f859d0f.sql)
- `cleanup-webhook-dedupe` 0 */6 * * * (20260707114840_4586855c-9d65-4288-9eee-e06b1b311446.sql)
- `cron-failure-alerter-10min` */10 * * * * (20260831170000_secure_operational_edge_crons.sql)
- `data-retention-purge-daily` 45 3 * * * (20261001151000_log_retention_indexes_and_purge.sql)
- `deal-risk-digest-daily` 0 11 * * * (20260910153000_reconcile_operational_edge_crons.sql)
- `detect-client-churn-alerts-hourly` 15 * * * * (20260831163000_secure_churn_and_task_crons.sql)
- `edge-retry-threshold-alert-15min` */15 * * * * (20260831170000_secure_operational_edge_crons.sql)
- `email-bulk-retry-15min` */15 * * * * (20260910153000_reconcile_operational_edge_crons.sql)
- `enforce-telemetry-retention-daily` 30 3 * * * (20260712213509_3b994669-1c3f-47ef-90fa-a5e71a1093b2.sql)
- `gc-call-recording-ingest-jobs` 15 3 * * * (20260712232346_aec818ed-0486-4b47-8528-f607bf2d2811.sql)
- `notify-v4-quote-status-every-5min` */5 * * * * (20260831170000_secure_operational_edge_crons.sql)
- `process-call-recording-ingest-1min` * * * * * (20260831170000_secure_operational_edge_crons.sql)
- `purge-quote-sync-inbound-log-30d` 15 3 * * * (20260706211149_514488f9-74ea-402d-bfc2-4d30ee7ef21f.sql)
- `purge-telemetry-retention-daily` 30 3 * * * (20260712212417_ae1222eb-fbbd-453e-bc5f-b9c124c7af32.sql)
- `purge-webhook-inbound-dedupe-30d` 0 3 * * * (20260706211149_514488f9-74ea-402d-bfc2-4d30ee7ef21f.sql)
- `reset-pg-stat-statements-weekly` 0 4 * * 1 (20260712212750_1c79fa22-b782-498b-a765-b4766cd0a61a.sql)
- `rotate-daily-challenges-daily` 10 3 * * * (20261014000000_gamificacao_server_side.sql)
- `wal-health-alert-5min` */5 * * * * (20261001144000_schedule_wal_and_webhook_health_crons.sql)
- `webvitals-regression-alert-daily` 15 11 * * * (20261002010000_webvitals_regression_alert_cron.sql)
- `weekly-league-reset` 0 0 * * 1 (20260512144635_35f7f178-2af8-41cb-98c9-aabc4cdc043f.sql)
- `weekly-matchmaking` 1 0 * * 1 (20260512144635_35f7f178-2af8-41cb-98c9-aabc4cdc043f.sql)
- `weekly-matchups-resolution` 5 0 * * 1 (20261018190100_gamificacao_claim_matchups_rotations.sql)
- `winloss-webhook-health-monitor-15min` */15 * * * * (20261001144000_schedule_wal_and_webhook_health_crons.sql)

## Integrações externas
- SDKs: Sentry, Supabase, react-query, zod
- hosts mais citados: ai.gateway.lovable.dev, x.test, api.resend.com, example.test, usyxfpqlsspldubptrdl.supabase.co, api.elevenlabs.io, a.test, api.twilio.com, b.test, c.test, promo-champions-v2-1.vercel.app, promochampions.com.br, x.supabase.co, api.dicebear.com, api.intercom.io
- webhooks recebidos: bitrix24-oauth, campaign-health-alert, check-v4-callback-alerts, cron-failure-alerter, deal-risk-digest, detect-client-churn-alerts, edge-retry-threshold-alert, email-bulk-retry, email-unsubscribe, generate-urgent-client-tasks, health, inbound-email-webhook, log-web-vitals, multichannel-status-webhook, notify-v4-quote-status, process-call-recording-ingest, receive-quote-sync, receive-quote-webhook, report-embed-public, twilio-call-status, twilio-call-twiml, whatsapp-inbound-webhook
- env de integração (só nomes): BITRIX24_CLIENT_ID, BITRIX24_CLIENT_SECRET, BITRIX24_STATE_SECRET, ELEVENLABS_API_KEY, EVOLUTION_API_KEY, EVOLUTION_API_URL, EVOLUTION_INSTANCE, FRESHDESK_API_KEY, INTERCOM_ACCESS_TOKEN, LOVABLE_API_KEY, METRICS_INGEST_TOKEN, PROMOGIFTS_WEBHOOK_SECRET, QUOTE_CONVERSION_WEBHOOK_URL, QUOTE_SYNC_API_KEY, QUOTE_SYNC_WEBHOOK_SECRET, RESEND_API_KEY, SLACK_ALERT_WEBHOOK_URL, SLACK_DIGEST_WEBHOOK_URL, SLACK_WEBHOOK_URL, TEST_USER_ACCESS_TOKEN, TWILIO_ALLOWED_DIAL_PREFIXES, TWILIO_AUTH_TOKEN, TWILIO_CALL_STATUS_URL, TWILIO_TWIML_URL, UNSUBSCRIBE_SECRET, V4_CALLBACK_API_KEY, VITE_SENTRY_DSN, WHATSAPP_INBOUND_WEBHOOK_SECRET, ZENDESK_API_TOKEN

## Permissões / papéis
- papéis no código: user (52), system (43), closer (21), sdr (20), admin (19), hybrid (14), status (13), alert (11), region (10), authenticated (8), manager (8), list (7), assistant (5), img (5), main (5), button (3), grid (3), group (3), tablist (3), combobox (2), dialog (2), gridcell (2), listitem (2), presentation (2), radio (2), radiogroup (2), row (2), tab (2), tool (2), Roles (1), agent (1), alertdialog (1), anon (1), champion (1), columnheader (1), dev (1), economic (1), link (1), listbox (1), navigation (1), rowheader (1), sales_rep (1), salesperson (1), service_role (1), slider (1), string (1), sup (1), table (1), technical (1), toolbar (1), tooltip (1)
- enums de papel: salesperson_role: sdr|closer|hybrid; app_role: admin|manager|salesperson
- guards: src/components/auth/ProtectedRoute.tsx, src/components/navigation/NavigationGuard.tsx · rotas protegidas: 36 · públicas: /*, /abm, /acesso-negado, /admin/regras-comissao, /agenda, /agentes, /analytics, /analytics/abc, /analytics/closing-time, /analytics/deal-velocity, /analytics/emails, /analytics/evolution, /analytics/objections, /analytics/win-loss, /aprovacoes, /arena, /assinatura-digital, /assistente, /atividades, /audit-logs, /automacao-inteligente, /automacoes, /benchmarking, /bi-closer, /bi-gestor, /bi-sdr, /bi-vendedor, /bitrix24, /busca, /busca-inteligente, /cadencias, /cadencias-orcamentos, /calendario, /clientes, /coaching-inteligente, /comissoes, /comparador-precos, /competencias, /configuracoes, /contas/:id, /conversational-intelligence, /conversational-intelligence/gravacoes, /customer-success, /customer-success-360, /deal-intelligence, /deduplicacao, /desafios, /desafios-diarios, /email-tracking, /embed/report/:token, /engagement/abm, /engagement/abm/:accountId, /engagement/bulk-composer, /engagement/dialer, /engagement/email-scoring, /engagement/send-time, /estoque, /evolucao-precos, /ferramentas/bi, /follow-up, /follow-up/audit, /fonte-leads, /forecast, /fornecedores, /funil, /gamificacao/badges, /gatilhos-inatividade, /health-score, /icp, /importar-exportar, /inteligencia, /inteligencia-compras, /inteligencia-preditiva, /kanban-clientes, /lead-routing, /lead-scoring, /mapa-clientes, /metas, /metas-atividades, /metricas-categoria, /meu-assistente, /minhas-premiacoes, /multichannel, /notificacoes, /nps, /onboarding-tracking, /orcamentos, /perfil-gamer, /perguntar, /pipeline, /playbooks, /portfolio, /previsao-demanda, /pricing-intelligence, /produtos, /race-arena, /race-arena/career, /race-arena/closer, /race-arena/garage, /race-arena/sdr, /race-arena/spectator/:seasonId, /ranking, /relatorio-atividades, /relatorios, /relatorios-agendados, /relatorios-custom, /relatorios-custom/:id, /relatorios-email, /relatorios-executivos, /relatorios/cohort, /relatorios/funil, /reset-password, /revenue-forecast, /revenue-forecast-v2, /revenue-intelligence, /revops, /roi, /sales-enablement, /sequences, /sla-tracking, /tarefas, /team-activity, /territorios, /territory-optimization, /times, /top-produtos, /vendedores, /victory-feed, /webhooks, /win-loss-intelligence, /workflow-builder, /workflows
- feature flags: ENABLE_RLS, FEATURE_X, experimental_ui, nova-tela, novo-inbox

## Alertas (baseline.json → alertas)
- rotas_sem_arquivo: 1 — ex.: /contas/:id
- componentes_ambiguos: 0
- menu_sem_destino: 22 — ex.: Análises -> /dashboard/analises, Colete um power-up -> powerup, Competição -> /dashboard/competicao
- edges_orfas: 32 — ex.: activity-goal-alerts, admin-conversion-trail, ai-agent-orchestrator
- edges_chamadas_sem_pasta: 0
- tabelas_sem_rls: 6 — ex.: ab_tests, experiment_assignments, experiment_variants
- tabelas_usadas_sem_definicao: 3 — ex.: auth_users_view, table, team_members
- tabelas_com_drift_migration_vs_types: 0
- rpcs_sem_definicao: 0
- componentes_orfaos: 1 — ex.: src/components/ui/level-up-celebration.tsx
- componentes_com_nome_duplicado: 19 — ex.: ActivityHeatmap, BIProductCard, BuyingCommitteeCard
- scripts_orfaos: 4 — ex.: scripts/ci/lint-ratchet.mjs, scripts/ci/typecheck-ratchet.mjs, scripts/codemod-money.mjs
- env_usadas_nao_declaradas: 7 — ex.: DEV, MODE, VITE_APP_URL
- ciclos_de_import: 2
- possiveis_segredos_no_codigo: 2 — ex.: scripts/ai-context/cenarios.mjs:102, scripts/ci/inventario-banco.unit.mjs:165

## Grafo de código (graphify)
- 15946 nós · 58942 arestas · 620 comunidades · grafo do commit `7535bb0f`
- comunidades maiores: CardContent (453), Índice (341), cn (325), getCorsHeaders (274), Input (269), DialogContent (264), client.ts (256), Button (248), lucide-react (225), PageTransition (191), Badge (188), ref_node_fs (177)
- símbolos mais chamados: Card (src/components/ui/card.tsx), CardContent (src/components/ui/card.tsx), Badge (src/components/ui/badge.tsx), Button (src/components/ui/button.tsx), cn() (src/lib/utils.ts), CardHeader (src/components/ui/card.tsx), CardTitle (src/components/ui/card.tsx), Skeleton (src/components/ui/skeleton.tsx), Input (src/components/ui/input.tsx), formatBRL() (src/lib/money.ts), Label (src/components/ui/label.tsx), SelectContent (src/components/ui/select.tsx)
- consulta local: `graphify query "<pergunta>"`, `graphify path "<A>" "<B>"`, `graphify explain "<X>"`

## Hotspots (arquivos mais alterados, 90 dias)
- package-lock.json (91)
- package.json (91)
- .github/workflows/pr-checks.yml (35)
- deno.lock (22)
- .github/workflows/quote-to-sale-e2e.yml (18)
- RELATORIO_CI.md (18)
- .github/workflows/codeql.yml (15)
- CLAUDE.md (14)
- .github/workflows/cron-monitoring.yml (13)
- .github/workflows/qa-exhaustive.yml (12)
- PENDENCIAS.md (12)
- src/integrations/supabase/types.ts (12)
- supabase/config.toml (12)
- supabase/functions/bitrix24-sync/index.ts (12)
- .github/workflows/edge-functions-bundle.yml (10)

## Workflows
- `a11y-sweep.yml` — A11y Sweep (UI PRs) (pull_request, workflow_dispatch)
- `apply-migration.yml` — Apply Migration (workflow_dispatch)
- `ci-failure-alert.yml` — CI Failure Alert (workflow_dispatch, workflow_run)
- `codeql.yml` — CodeQL (pull_request, push, schedule, workflow_dispatch; cron 23 4 * * 1)
- `contexto-testes.yml` — Testes das automações de contexto (pull_request, push, workflow_dispatch)
- `contexto.yml` — Contexto para agentes de IA (10 min) (push, schedule, workflow_dispatch; cron 3-59/10 * * * *)
- `cron-monitoring.yml` — Cron Monitoring Regression (pull_request, push, schedule, workflow_dispatch; cron 0 6 * * *)
- `db-backup.yml` — DB Backup (off-site) (schedule, workflow_dispatch; cron 0 3 * * *)
- `db-probe.yml` — DB Probe (read-only) (workflow_dispatch)
- `dependabot-automerge.yml` — Dependabot Auto-merge (pull_request, schedule, workflow_dispatch; cron 30 11 * * *)
- `dependabot-fix-lockfile.yml` — Dependabot – Fix deno.lock (pull_request_target)
- `deploy.yml` — Deploy Pipeline (push, workflow_dispatch)
- `edge-functions-bundle.yml` — Edge Functions Bundle Check (pull_request, push)
- `edge-functions-input-validation.yml` — Edge Functions Input Validation Lint (pull_request, push)
- `edge-functions-request-id.yml` — Edge Functions X-Request-Id Lint (pull_request, push)
- `graphify.yml` — Graphify Foundation (pull_request, push, workflow_dispatch)
- `inventario-estado-semanal.yml` — Inventário do estado real (semanal) (schedule, workflow_dispatch; cron 23 10 * * 1)
- `main.yml` — CI/CD — Post-merge Main (push)
- `migrations-drift.yml` — Migrations Drift (pull_request, push, schedule, workflow_dispatch; cron 0 7 * * *)
- `pr-checks.yml` — PR Checks (pull_request, push, workflow_dispatch)
- `pr-review-sla.yml` — PR Review SLA (schedule, workflow_dispatch; cron 0 12 * * 1-5)
- `qa-exhaustive.yml` — QA Exhaustive (Weekly) (schedule, workflow_dispatch; cron 0 3 * * 1)
- `quote-to-sale-e2e.yml` — Quote-to-Sale Guard Rails (pull_request, workflow_dispatch)
- `release-please.yml` — Release Please (push, workflow_dispatch)
- `types-sync.yml` — types-sync (push, schedule, workflow_dispatch; cron 49 5 * * 1)

## Scripts npm
- `dev`: `vite --host`
- `dev:bun`: `bunx vite --host`
- `dev:node`: `vite --host`
- `build`: `vite build`
- `build:bun`: `bunx vite build`
- `build:node`: `vite build`
- `build:dev`: `vite build --mode development`
- `preview`: `vite preview`
- `test`: `vitest run`
- `test:watch`: `vitest`
- `test:coverage`: `vitest run --coverage`
- `coverage:ratchet`: `node scripts/check-coverage-ratchet.mjs`
- `coverage:ladder`: `node scripts/check-coverage-ladder.mjs`
- `test:config`: `tsx scripts/check-test-spec-patterns.ts`
- `coverage:baseline:update`: `node scripts/update-coverage-baseline.mjs`
- `test:e2e`: `playwright test`
- `test:e2e:ui`: `playwright test --ui`
- `lint`: `eslint . --report-unused-disable-directives --max-warnings 0`
- `lint:complexity`: `eslint . --report-unused-disable-directives --rule 'complexity: [warn, 20]' --rule 'max-lines: [warn, { max: 600, skipBlankLines: true, skipComments: true }]' --max-warnings 130`
- `lint:fix`: `eslint . --fix`
- `format`: `prettier --write "src/**/*.{ts,tsx,css,json}"`
- `format:check`: `prettier --check "src/**/*.{ts,tsx,css,json}"`
- `typecheck`: `tsc --noEmit`
- `typecheck:baseline`: `node scripts/check-typecheck-baseline.mjs`
- `typecheck:baseline:update`: `node scripts/update-typecheck-baseline.mjs`
- `prepare`: `husky`
- `deps:check`: `depcruise --config .dependency-cruiser.cjs src supabase/functions/_shared`
- `check:data-layer`: `node scripts/check-data-layer.mjs`
- `check:domain-boundaries`: `node scripts/check-domain-boundaries.mjs`
- `deps:graph`: `depcruise --config .dependency-cruiser.cjs --output-type dot src supabase/functions/_shared | dot -Tsvg -o dependency-graph.svg`
- `a11y:sweep`: `playwright test -c playwright.a11y.config.ts`
- `a11y:report`: `A11Y_REPORT_ONLY=1 playwright test -c playwright.a11y.config.ts`
- `test:deno`: `node scripts/deno-test-suite.mjs`
- `test:sql`: `scripts/run-sql-tests.sh`
- `test:load`: `k6 run scripts/load/k6-smoke.js`
- `flaky:report`: `node scripts/flaky-report.mjs`
- `smoke:target`: `tsx scripts/smoke-target-backend.ts`
- `security:secrets`: `tsx scripts/security/check-no-committed-service-role.ts`
- `graphify:test`: `node --test scripts/graphify/*.test.mjs`
- `check:migrations`: `node scripts/check-migrations.mjs`
- `graphify:verify`: `node scripts/graphify/verify-output.mjs`
- `graphify:impact`: `node scripts/graphify/impact-report.mjs`
- `graphify:contracts`: `node scripts/graphify/static-contracts.mjs`
- `graphify:catalog`: `node scripts/graphify/catalog-adapter.mjs`
- `graphify:reconcile`: `node scripts/graphify/reconcile-catalog.mjs`
- `graphify:docs`: `node scripts/graphify/docs-index.mjs`
- `contexto:ia`: `node scripts/ai-context/gerar.mjs --out docs/contexto/codigo`
- `contexto:ia:test`: `node --test scripts/ai-context/gerar.unit.mjs`
- `ci`: `npm run lint && npm run typecheck && npm run security:secrets && npm run graphify:test && npm run test:coverage && npm run build && node scripts/check-bundle-budget.mjs`
- `debt:report`: `node scripts/debt-report.mjs`

## Documentos (raiz e docs/)
- `.github/ENVIRONMENTS.md` — GitHub Environments — Modelo de Segurança (73 linhas)
- `.github/pull_request_template.md` (84 linhas)
- `AGENTS.md` — AGENTS.md — Promo_Champions_V2.1 (73 linhas)
- `CHANGELOG.md` — Changelog (104 linhas)
- `CLAUDE.md` (2 linhas)
- `CODE_OF_CONDUCT.md` — Código de Conduta — Promo Champions (38 linhas)
- `CONTRIBUTING.md` — Contribuindo com Promo Champions v2 (73 linhas)
- `PENDENCIAS.md` — PENDÊNCIAS — Workflows com bloqueio externo (333 linhas)
- `README.md` — 🏆 Promo Champions v2 — Sales Performance Platform (126 linhas)
- `RELATORIO_CI.md` — RELATORIO_CI.md — Promo Champions V2.1 (1017 linhas)
- `RELEASE_NOTES.md` — Release v2.1.0 — Mega-Jornada 10/10 (78 linhas)
- `SECURITY.md` — 🔒 Política de Segurança (195 linhas)
- `TEST_QUALITY_REPORT.md` — 📊 Relatório Real de Qualidade e Testes (61 linhas)
- `docs/API.md` — API — Promo Champions V2.1 (801 linhas)
- `docs/ARCHITECTURE.md` — Arquitetura — Promo Champions V2.1 (145 linhas)
- `docs/AUTH_CONFIG.md` — Checklist — Configuração server-side do Supabase Auth (56 linhas)
- `docs/DATA_DICTIONARY.md` — Dicionário de Dados — Promo Champions V2.1 (7105 linhas)
- `docs/DATA_RETENTION.md` — DATA RETENTION — Política de retenção e purge (90 linhas)
- `docs/DEAD_TABLES.md` — DEAD TABLES — Tabelas sem referência no código (92 linhas)
- `docs/DEAL_RISK_CRITERIA.md` — Critério canônico de "deal em risco" (26 linhas)
- `docs/DEPLOYMENT.md` — Deploy — Promo Champions V2.1 (110 linhas)
- `docs/DESIGN_SYSTEM.md` — Design System - Promo Champions (1183 linhas)
- `docs/DOCUMENTACAO_SISTEMA.md` — 📋 Documentação Completa do Sistema — Promo Champions (Sales Arena) (1741 linhas)
- `docs/DR_PLAN.md` — Plano de Recuperação de Desastres (DR Plan) (80 linhas)
- `docs/ENGINEERING_MANIFESTO.md` — Manifesto de Excelência em Engenharia de Software (Nível 10/10) (71 linhas)
- `docs/ER.md` — Diagrama ER — Promo Champions V2.1 (519 linhas)
- `docs/FAQ_TROUBLESHOOTING.md` — FAQ — Troubleshooting de integrações externas (71 linhas)
- `docs/FEATURE_SUMMARY.md` — 📊 Promo Champions - Complete Feature Summary (129 linhas)
- `docs/FUNCIONALIDADES_COMPLETAS.md` — 📋 PROMO CHAMPIONS — Mapeamento Completo de Funcionalidades (727 linhas)
- `docs/FUNCIONALIDADES_SEM_UI.md` — 🧩 Funcionalidades com Backend/Hook prontos mas SEM UI Completa (169 linhas)
- `docs/FUNCIONALIDADES_SISTEMA.md` — 📋 Levantamento Completo de Funcionalidades — Sales Arena (601 linhas)
- `docs/GAPS_CLASSE_MUNDIAL.md` — 🌍 Análise de Gaps — Promo Champions vs CRMs de Classe Mundial (283 linhas)
- `docs/HOTFIX.md` — Procedimento de hotfix (53 linhas)
- `docs/LGPD.md` — LGPD — Conformidade no Promo Champions V2.1 (142 linhas)
- `docs/PROCESSOS.md` — Processos — rituais que sobrevivem a uma pessoa (99 linhas)
- `docs/REPORTING_BI_COMPLETE.md` — Reporting & BI — estado em 2026-10-18 (71 linhas)
- `docs/RLS_AUDIT_QUERIES.md` — Queries de auditoria RLS / grants — executar no banco real (187 linhas)
- `docs/RLS_MATRIX.md` — Matriz RLS — tabela × papel (35 linhas)
- `docs/ROLLBACK.md` — Procedimento de Rollback (31 linhas)
- `docs/RUNBOOK.md` — 🚀 Runbook Operacional — Promo Champions (369 linhas)
- `docs/SCHEMA_CONVENTIONS.md` — SCHEMA CONVENTIONS — Convenções de banco (Promo Champions V2.1) (52 linhas)
- `docs/SEC-08_SERVICE_ROLE_AUDIT.md` — SEC-08 · Auditoria de uso de `SUPABASE_SERVICE_ROLE_KEY` (65 linhas)
- `docs/SECRETS_ROTATION.md` — Rotação de Secrets — Inventário e Política (133 linhas)
- `docs/SECURITY.md` — Security Guidelines (128 linhas)
- `docs/SECURITY_HARDENING.md` — Hardening de Segurança — SECURITY DEFINER, RLS, Edge Functions & WAL (240 linhas)
- `docs/SECURITY_HEADERS.md` — Headers de segurança — hosting e edge functions (48 linhas)
- `docs/SIZING.md` — Sizing — gatilhos de upgrade de plano (Supabase + Vercel) (34 linhas)
- `docs/STAGING.md` — Staging — Promo Champions V2.1 (70 linhas)
- `docs/TECH_DEBT.md` — Quadro de débito técnico — Promo Champions V2.1 (31 linhas)
- `docs/TELEMETRY_MODULE_DOCS.md` — 📊 Módulo de Telemetria de Queries — Documentação Completa (909 linhas)
- `docs/TYPE_DEBT.md` — TYPE_DEBT — débito de tipagem do frontend (104 linhas)
- `docs/ZERO_DOWNTIME_MIGRATIONS.md` — Migrations sem downtime — disciplina expand-contract (69 linhas)
- `docs/accessibility-checklist.md` — ♿ Accessibility Checklist — Promo Champions v2 (55 linhas)
- `docs/auditoria_enterprise_v5.md` — 🏆 PROMO CHAMPIONS - RELATÓRIO DE AUDITORIA ENTERPRISE (V5.0) (95 linhas)
- `docs/component-guidelines.md` — 🏗 Component Guidelines — Promo Champions v2 (42 linhas)
- `docs/soft-delete.md` — Soft delete — política por tabela (58 linhas)
- `docs/style-guide.md` — 🎨 Style Guide — Promo Champions v2 (36 linhas)
- subpastas de docs/: docs/auditoria (27), docs/estado (19), docs/runbooks (16), docs/decisions (11), docs/reports (11), docs/graphify (9), docs/execucao (8), docs/agentes (6), docs/contexto (2), docs/benchmark (1), docs/handoff (1), docs/planos (1), docs/postmortems (1), docs/testes (1)
- CHANGELOG topo: [1.1.0](https://github.com/adm01-debug/Promo_Champions_V2.1/compare/promo-champions-v2-v1.0.0...promo-champions-v2-v1.1.0) (2026-11-07)

## Últimos commits
- 2026-11-09 `7535bb0` fix: k6-smoke mira funções não deployadas e health sem chave (#388)
- 2026-11-09 `999a708` infra: valida restauracao do dump antes do upload no db-backup (#387)
- 2026-11-09 `95e8e8a` chore: inventario do estado real [auto] (#412)
- 2026-11-09 `053885b` chore(deps): bump github/codeql-action/analyze from 4.39.1 to 4.39.3 (#402)
- 2026-11-09 `adf0414` chore(deps): bump github/codeql-action/init from 4.39.1 to 4.39.3 (#403)
- 2026-11-09 `4424fde` chore(deps): bump supabase/setup-cli (#400)
- 2026-11-09 `407c311` chore(deps): bump actions/download-artifact (#399)
- 2026-11-08 `042d3e7` fix: corrige restore incondicional no hook de grafo e typo no count de workflows
- 2026-11-08 `37bccd8` fix: protege a saída do snapshot e o trabalho local na publicação do contexto
- 2026-11-08 `d67653a` chore: documenta perímetro de CI/Vercel e hook de grafo na nuvem (#393)
- 2026-11-08 `b38cfe6` chore: replica o padrão de instruções para agentes do Zapp Web V2 (skill enxuto + guard GA02) (#392)
- 2026-11-08 `d95348f` feat: workflow auto-corrige deno.lock em PRs do Dependabot (#368)
- 2026-11-08 `fa27151` fix: probe de tabela filtra table_type='BASE TABLE' (#381)
- 2026-11-08 `9500f87` chore: instruções enxutas para agentes (#380)
- 2026-11-07 `b80e879` fix: corrige relatório de impacto do graphify (#390)

## Arquivos deste diretório
- `docs/contexto/codigo/rotas.json`
- `docs/contexto/codigo/modulos.json`
- `docs/contexto/codigo/componentes.json`
- `docs/contexto/codigo/hooks.json`
- `docs/contexto/codigo/edge-functions.json`
- `docs/contexto/codigo/banco.json`
- `docs/contexto/codigo/ferramentas.json`
- `docs/contexto/codigo/scripts.json`
- `docs/contexto/codigo/testes.json`
- `docs/contexto/codigo/logica.json`
- `docs/contexto/codigo/grafo.json`
- `docs/contexto/codigo/grafo-arestas.json`
- `docs/contexto/codigo/convencoes.json`
- `docs/contexto/codigo/grafo-graphify.json`
- `docs/contexto/codigo/baseline.json`
- `docs/contexto/codigo/manifest.json` (commit, data, hashes, erros — único arquivo com data/hora)
