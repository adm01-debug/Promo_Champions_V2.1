# Estado Real — Domínio CRM / Pipeline / Vendas

> **Auditoria por medição.** Data: 2026-08-16. Repo `/home/user/promo-champions-v2.1`.
> Nenhuma afirmação aqui vem de `docs/*.md`. Cada linha foi obtida lendo o arquivo citado
> e/ou executando `SELECT` no banco de produção (Supabase `PROMO_CHAMPIONS_V2`, schema `public`).
> **Regra aplicada:** *pronto = em produção com uso real*. Tabela com 0 linhas ⇒ nunca ✅.

Escopo auditado: `src/components/` → `clients/`, `pipeline/`, `sales/`, `quotes/`, `orders/`,
`order-tracking/`, `activities/`, `tasks/`, `follow-up/`, `deal-intelligence/`, `closer/`,
`comparador/`, `products/`, `financeiro/`, `signature/`, `calendar/`, `collaboration/`
(≈ 27.900 linhas, 158 componentes) + hooks/services/tabelas correspondentes.

> ⚠️ **Contagens do banco:** as estimativas de `pg_class` estão desatualizadas neste projeto
> (ex.: `playbook_items` estima 22, `count(*)` = 0; `cadence_steps` estima 5, `count(*)` = 0).
> Todos os números abaixo são `count(*)` real, não estimativa.

---

## 1. Tabela de rastreamento (UI → hook/service → tabela → dado real)

| # | Funcionalidade | UI (arquivo:linha) | Hook/Service | Tabela/Function | Linhas no banco | Classificação | O que falta |
|---|---|---|---|---|---|---|---|
| **CLIENTES** |
| 1 | Lista + CRUD de clientes | `src/pages/Clientes.tsx:68` | `src/hooks/crm/useClients.ts:6` → `src/services/clientService.ts:6,14,20,26` | `clients` | **100** (upd. máx. 2026-08-14) | ✅ IMPLEMENTADO_TOTAL | — |
| 2 | Client 360 (KPIs, LTV, categorias, pedidos) | `src/pages/Clientes.tsx:481` → `src/components/clients/Client360View.tsx:2` | `src/hooks/crm/useClient360.ts:41,54,80` | `sales`, `activities` | 954 / 2.228 | ✅ IMPLEMENTADO_TOTAL | — |
| 3 | Kanban de portfólio de clientes | `src/pages/KanbanClientes.tsx:46` → `src/components/clients/ClientKanban.tsx:56,67` | inline `useQuery` | `client_portfolio` | **100** | ✅ IMPLEMENTADO_TOTAL | — |
| 4 | Timeline do cliente | `src/pages/Clientes.tsx:34` → `src/components/clients/ClientTimeline.tsx:93` | inline | `client_interactions` (primária) + fallback `sales`/`activities` | **client_interactions = 0** | 🟨 PARCIAL | Fonte primária vazia; a tela só mostra o fallback derivado de `sales`/`activities` |
| 5 | Card de justificativa de churn | `src/components/clients/ClientChurnJustificationCard.tsx:36` | inline `useQuery` | `client_churn_alerts_state` | **0** | 🟨 PARCIAL | Nenhum alerta de churn jamais persistido — card sempre vazio |
| **PIPELINE** |
| 6 | Kanban de pipeline (caminho legado) | `src/pages/Pipeline.tsx:70` → `src/components/pipeline/PipelineBoard.tsx:74` | `src/hooks/usePipeline.ts:51` | `sales` (agrupado por `status`) | **954** (7 status distintos) | ✅ IMPLEMENTADO_TOTAL | Estágios são **hardcoded** em `usePipeline.ts:17-25`, não lidos de `pipeline_stages` |
| 7 | Drag & drop de deal entre estágios | `src/components/pipeline/PipelineBoard.tsx` | `src/hooks/usePipeline.ts:88` (`useMoveDeal`) | `sales.status` | 954 | ✅ IMPLEMENTADO_TOTAL | — |
| 8 | **Multi-pipeline dinâmico (refactor)** | `src/components/pipeline/PipelineBoard.tsx:48,57-64` | `src/hooks/useMultiplePipelines.ts:32,50,88` | `pipelines`, `pipeline_stages`, `sales.pipeline_id` | pipelines=**1**, stages=**7**, `sales.pipeline_id` preenchido = **0** | 🟨 PARCIAL — **fio quebrado** | `DEFAULT_PIPELINE_ID='00000000-…-000000000001'` (PipelineBoard.tsx:48) **não existe** no banco (único pipeline real = `469ba7d8-8b8a-4c37-8d65-25ff4e8b924c` "Comercial B2B"). Selecionar o pipeline real filtra `sales.pipeline_id = …` → **0 deals**, board vazio. Refactor coexiste com o legado sem substituí-lo |
| 9 | Pipeline Health Score | `src/pages/Pipeline.tsx:59` → `src/components/pipeline/PipelineHealthScore.tsx:19` | inline | view `revenue_forecast_view` | **12** | ✅ IMPLEMENTADO_TOTAL | — |
| 10 | Painel de deals em risco | `src/pages/Pipeline.tsx:110` → `AtRiskDealsPanel.tsx:8` | `src/hooks/deal-intelligence/useAtRiskDeals.ts:39,52,164` | `sales`, `activities`, edge `detect-at-risk-deals`, `deal_risk_signals` | sales/activities OK; **`deal_risk_signals` = 0** | 🟨 PARCIAL | Risco é recalculado no cliente; a edge function nunca gravou sinais |
| 11 | Dashboard de SLA de estágio | `src/pages/Pipeline.tsx:113` → `SLADashboard.tsx:2` | `src/hooks/useDealSLAs.ts:39,53` | `deal_stage_history` | **0** | 🟨 PARCIAL | Tabela-fonte vazia (todo o histórico real está em `deal_stage_transitions`, 1.254 linhas, que este hook **não** lê) |
| 12 | Painel de inatividade por estágio | `src/pages/Pipeline.tsx:116` → `InactivityPanel.tsx:2` | `src/hooks/useInactiveDeals.ts:49,74,88` | `stage_inactivity_rules`, `sales`, `activities` | **6** regras | ✅ IMPLEMENTADO_TOTAL | — |
| 13 | Playbook por estágio no DealCard | `src/components/pipeline/DealCard.tsx:32` | `src/hooks/usePlaybooks.ts` → `hooks/playbooks/*` | `playbooks`, `playbook_items`, `playbook_progress` | **0 / 0 / 0** | 🟨 PARCIAL | Nenhum playbook cadastrado; modal nunca abre com conteúdo |
| 14 | Score de lead no card | `src/components/pipeline/PipelineBoard.tsx:44` | `src/hooks/useLeadScoring.ts:54,102` | `lead_scores` (900), `lead_score_trends` (**0**), `icp_data` (**0**) | parcial | 🟨 PARCIAL | Scores existem; tendências e ICP nunca populados |
| 15 | Probabilidade calibrada de deal | `src/components/pipeline/PipelineBoard.tsx:43` | `src/hooks/useDealProbability.ts:10,23` | `deal_probability_scores` + edge `deal-probability` | **0** | 🟨 PARCIAL | Edge existe, nada persistido |
| **VENDAS** |
| 16 | Lista + busca + CRUD de vendas | `src/pages/Vendas.tsx:64,188,280` | `src/hooks/sales/useSalesData.ts:18` → `src/services/salesService.ts` | `sales` | **954** (upd. máx. 2026-08-14) | ✅ IMPLEMENTADO_TOTAL | — |
| 17 | Cadências de venda / prospecção | `src/pages/Cadencias.tsx` | `src/hooks/cadences/useCadenceQueries.ts:77,93,109,169` | `cadences`, `cadence_steps`, `prospect_cadences`, `cadence_tasks` | **0 / 0 / 0 / 0** | 🟨 PARCIAL | Módulo inteiro (18 hooks, 12 componentes) sem uma única linha em produção |
| 18 | Analytics "Elite" de cadência | `src/pages/Cadencias.tsx:344` → `EliteCadenceAnalytics.tsx:55` | inline | — | — | 🟨 PARCIAL | `efficiencyScore: 88, // Mock score for overall engine` — métrica de negócio **hardcoded** |
| 19 | Fila de aprovação de mensagens | `src/pages/QuoteCadencesPage.tsx:282` → `ApprovalQueue.tsx:11,37` | nenhum | nenhuma | — | 🟦 SUGERIDO_OU_INICIADO | `MOCK_PENDING` com 2 leads fictícios ("Gabriel Medeiros", "Juliana Silva"); Aprovar/Rejeitar só faz `setQueue` local, **não persiste nada** |
| **ORÇAMENTOS** |
| 20 | Lista + CRUD de orçamentos | `src/pages/Orcamentos.tsx:58,606` | `src/hooks/useQuotes.ts:83,150,175,206` | `quotes`, `quote_items` | **301 / 900** | ✅ IMPLEMENTADO_TOTAL | Nenhum `updated_at` após 2026-07-06 — módulo parado |
| 21 | **Conversão orçamento → venda + pedido** | `src/components/quotes/QuoteDetailDialog.tsx:6` | `src/hooks/useQuotes.ts:311` (`rpc fn_convert_quote_to_sale`) | RPC existe (`fn_convert_quote_to_sale`, `convert_quote_to_order`); `quote_conversion_audit` | **0 linhas de auditoria**; 0 quotes em status convertido (`approved` 87, `sent` 86, `expired` 43, `rejected` 43, `draft` 42) | 🟨 PARCIAL | Fluxo completo e transacional em código+DB, mas **nunca executado em produção** |
| 22 | Notificação de conversão | `src/hooks/useQuotes.ts:257` | edge `notify-quote-conversion` | `quote_sync_logs` | **0** | 🟨 PARCIAL | Sem execução registrada |
| 23 | Ingestão de orçamentos externos | — (sem UI no escopo) | — | `quotes_inbound` | **154** (últ. 2026-07-19) | 🟨 PARCIAL | Dados chegam, mas `quote_sync_logs` = 0 e não há tela dedicada nos diretórios auditados |
| **PEDIDOS** |
| 24 | Detalhe do pedido (itens, timeline, resumo) | `src/pages/OrderDetailPage.tsx:16,67` → `components/orders/*` | `src/hooks/orders/useOrder.ts:51,61,62` | `orders`, `order_items`, `order_status_events` | **267 / 540 / 267** | ✅ IMPLEMENTADO_TOTAL | — |
| 25 | **Acompanhamento de pedidos (tracking 3 trilhas)** | `src/pages/AcompanhamentoPedidos.tsx:17,120` → `order-tracking/OrderTrackingCard.tsx` | `src/hooks/orders/useOrderTracking.ts:180-239` | lê **`quotes`** (não `orders`) | quotes=301, mas **tudo o que a tela mostra é fabricado** | 🟨 PARCIAL — dados fictícios | `MOCK_CLIENTS` (linha 180), `buildMockOrders()` (193), `buildInstallments()` (118), `health` por `seed % 10` (145), `invoiceNumber: NF-${seed}` (166), `estimatedDelivery` por seed (161). Ignora as 267 linhas reais de `orders`/`order_status_events`. Sem usuário → 12 pedidos 100% mock (linha 216) |
| **ATIVIDADES** |
| 26 | Registro/lista de atividades | `src/pages/Atividades.tsx:19,66` | `src/hooks/activities/useActivities.ts:75,102,342` | `activities` | **2.228** (últ. 2026-08-15) | ✅ IMPLEMENTADO_TOTAL | — |
| 27 | Stats / efetividade / heatmap / leaderboard | `src/pages/Atividades.tsx:4-8` | `useActivities.ts:342,440` | `activities` | 2.228 | ✅ IMPLEMENTADO_TOTAL | — |
| 28 | Metas de atividade (Arena) | `src/pages/MetasAtividades.tsx` | `src/hooks/activities/useActivityGoals.ts:53,72,80,87` | `activity_goals`, `salespeople`, `activities` | **9 / 18 / 2.228** | ✅ IMPLEMENTADO_TOTAL | — |
| 29 | "Arena AI Tips" | `src/pages/MetasAtividades.tsx:498` → `ArenaAITips.tsx:23` | — | nenhuma | — | 🟨 PARCIAL | `const isDownwardTrend = activeData.length > 2 && Math.random() > 0.7;` — o alerta "Inteligência detectou queda de ritmo nos últimos 15 min" (linha 40) é **sorteado**, não medido |
| 30 | "Projeção de Performance" (PredictiveVelocity) | `src/pages/MetasAtividades.tsx:499` → `PredictiveVelocity.tsx:20-28` | — | nenhuma | — | 🟨 PARCIAL | Jornada fixa 08h–18h hardcoded; projeção linear sem histórico. Rotulado como "preditivo" |
| 31 | Config. de alertas SDR | `src/components/activities/SDRAlertSettings.tsx:33` | inline | `sdr_alert_configs` | **0** | 🟨 PARCIAL | Nunca configurado |
| 32 | Auditoria de edição de atividade | `src/components/activities/ActivityItemRow.tsx:50` | inline | `activity_audit_logs` | **0** | 🟨 PARCIAL | Log nunca gravado |
| **TAREFAS / CALENDÁRIO** |
| 33 | Fila de tarefas do dia | `src/pages/Tarefas.tsx:15,68` → `TaskQueue.tsx:5` | `src/hooks/useTasks.ts` | `tasks` | **600** (nada novo desde 2026-07-12) | ✅ IMPLEMENTADO_TOTAL | Base parada há ~1 mês |
| 34 | Next Best Action | `src/pages/Tarefas.tsx:65` → `NextBestAction.tsx:4` | `src/hooks/useNextBestAction.ts:35,69,75,82` | edge `next-best-action` + `salespeople`/`sales`/`activities` | dados-fonte OK | ✅ IMPLEMENTADO_TOTAL | Resultado não é persistido (calculado on-the-fly) |
| 35 | Geração de tarefas por deal estagnado | `src/pages/Tarefas.tsx` | `src/hooks/useStagnantTasks.ts:19` | edge `create-stagnant-tasks` → `tasks` | 600 | ✅ IMPLEMENTADO_TOTAL | — |
| 36 | Calendário de atividades (drag de tarefas) | `src/pages/Calendario.tsx:14` → `calendar/ActivityCalendar.tsx:75` | `src/hooks/useTasks.ts` | `tasks` / `agenda_events` | tasks=600; **`agenda_events` = 0** | 🟨 PARCIAL | Calendário só reagenda `tasks`; a tabela `agenda_events` existe e nunca foi usada |
| **FOLLOW-UP** |
| 37 | Follow-up inteligente (leads frios) | `src/pages/FollowUpInteligente.tsx:63,351` | `src/hooks/follow-up/useFollowUpData.ts:22,33,49` | `sales`, `tasks`, `activities` | 954 / 600 / 2.228 | ✅ IMPLEMENTADO_TOTAL | `health_score` é fórmula hardcoded (`useFollowUpData.ts:75`: `100 - dias*5 + score/10`), não vem de `deal_health_scores` |
| 38 | Configurações de follow-up | `src/pages/FollowUpInteligente.tsx:21` | `useFollowUpData.ts:10` | `follow_up_settings` | **0** | 🟨 PARCIAL | `maybeSingle()` sempre retorna null → defaults implícitos |
| 39 | Auditoria de follow-up | `src/pages/FollowUpAudit.tsx` / `useFollowUpData.ts:108` | view `follow_up_audit_view` | `follow_up_audit_logs` | **0** | 🟨 PARCIAL | View existe, tabela-base vazia |
| 40 | Templates / notificações de follow-up | — | — | `follow_up_templates`, `follow_up_notifications` | **0 / 0** | 🟨 PARCIAL | Nunca usados |
| **DEAL INTELLIGENCE** |
| 41 | Deal Health Score + histórico | `src/pages/DealIntelligence.tsx` → `health/DealHealthHub.tsx` | `src/hooks/deal-intelligence/useDealHealth.ts:53,83,102,120` | `deal_health_scores`, `deal_health_history`, edge `calculate-deal-health` | **900 / 900** | ✅ IMPLEMENTADO_TOTAL | — |
| 42 | Stakeholders do deal | `deal-intelligence/StakeholderListItem.tsx` | `useDealStakeholders.ts:62,94,141` | `deal_stakeholders` | **600** | ✅ IMPLEMENTADO_TOTAL | — |
| 43 | Previsão de velocidade do deal | `deal-intelligence/VelocityForecastTimeline.tsx` | `useDealVelocity.ts:33,82` | `deal_velocity_predictions` | **900** | ✅ IMPLEMENTADO_TOTAL | — |
| 44 | Win/Loss (análises + padrões) | `src/pages/DealIntelligence.tsx:18` → `winloss/WinLossHub.tsx` | `useWinLoss.ts:46,59,122,139` | `win_loss_analyses` (**500**), `win_loss_patterns` (**4**), `win_loss_insights` (**0**) | parcial | 🟨 PARCIAL | Análises e padrões reais; painel de *insights* sempre vazio |
| 45 | Conversão entre estágios / gargalos | `src/pages/DealIntelligence.tsx:10` → `ConversionOptimizerPanel` | `useStageConversion.ts:37,51,65` | `stage_conversion_metrics` (**6**), `stage_bottleneck_insights` (**0**) | parcial | 🟨 PARCIAL | Métricas de conversão congeladas em 2026-07-12; gargalos nunca gerados |
| 46 | Comitê de compra / cobertura | `src/pages/DealIntelligence.tsx:87,93` → `committee/*` (6 componentes) | `useCommitteeCoverage.ts:37,53,78,139,160` | `deal_committee_coverage`, `committee_coverage_history`, `committee_extraction_runs`, `buying_committee_members` | **0 / 0 / 0 / 0** | 🟨 PARCIAL | Submódulo inteiro (UI + 2 edge functions) sem nenhum dado |
| 47 | Baselines de velocidade por estágio | `src/pages/DealIntelligence.tsx:103` → `StageBaselinesPanel.tsx` | `useStageBaselines.ts:21,35` / `useStageVelocity.ts:73,105` | `stage_velocity_baselines` | **0** | 🟨 PARCIAL | Edge `refresh-stage-baselines` nunca gravou |
| 48 | Deals travados / alertas de velocidade | `src/pages/DealIntelligence.tsx:97` → `velocity/StuckDealsPanel.tsx` | `useStageVelocity.ts:47,88,158` | `deal_velocity_alerts` (**0**), `deal_stage_transitions` (**1.254**) | parcial | 🟨 PARCIAL | Transições reais existem, mas nenhum alerta foi persistido |
| 49 | Timeline de deal (chat/eventos) | `src/components/pipeline/DealTimeline.tsx` | `src/hooks/useDealTimeline.ts:41,46,51,58,63` | `activities`, `deal_stage_history` (**0**), `tasks`, `deal_outcomes` (**500**), `deal_chat_history` (**0**) | parcial | ⬛ MORTO | Componente **sem nenhum importador** no repo (ver §3) |
| **CLOSER** |
| 50 | Dashboard do Closer (métricas/ranking/evolução) | `src/pages/CloserDashboard.tsx:28,182` | `src/hooks/useCloserMetrics.ts:74,83,156,210,256` | `salespeople`, `sales` | **18 / 954** | ✅ IMPLEMENTADO_TOTAL | — |
| 51 | Handoffs SDR → Closer | `src/pages/CloserDashboard.tsx:166` → `CloserHandoffs.tsx:29,37,52` | inline | `salespeople`, `sales` (`sdr_id`) | 954 | ✅ IMPLEMENTADO_TOTAL | — |
| 52 | Contexto de handoff do SDR | `closer/SDRHandoffContext.tsx:30` | inline | `activities` | 2.228 | ✅ IMPLEMENTADO_TOTAL | — |
| **COMPARADOR / PRODUTOS** |
| 53 | Comparador de preços por fornecedor | `src/pages/ComparadorPrecos.tsx:20` | `src/hooks/useSuppliers.ts:13` → `hooks/suppliers/*` | `suppliers` (**6**), `supplier_products` (**41**) | ✅ | ✅ IMPLEMENTADO_TOTAL | — |
| 54 | Alertas de variação de preço | `src/pages/ComparadorPrecos.tsx:22,67` → `comparador/PriceAlertsPanel.tsx` | `src/hooks/usePriceHistory.ts:64,83,96` | `price_alerts` | **18** (últ. 2026-08-13) | ✅ IMPLEMENTADO_TOTAL | — |
| 55 | Histórico de preços | `comparador/PriceHistoryTable.tsx` | `usePriceHistory.ts:37,123` | `price_history` | **200** (últ. 2026-08-14) | ✅ IMPLEMENTADO_TOTAL | — |
| 56 | CRUD de produtos | `src/pages/Produtos.tsx:52` → `products/CreateProductDialog.tsx:7`, `EditProductDialog.tsx:6` | `src/hooks/useProducts.ts:27,96,143,185` | `products` | **17** (upd. 2026-08-14) | ✅ IMPLEMENTADO_TOTAL | — |
| **FINANCEIRO / ASSINATURA / COLABORAÇÃO** |
| 57 | Extrato de comissões | `src/pages/Comissoes.tsx:14` | `src/hooks/useCommissions.ts:41,49,65` | `commissions` | **942** | ✅ IMPLEMENTADO_TOTAL | — |
| 58 | "Simulador de Ganhos" (calculadora de comissão) | `src/pages/Comissoes.tsx:273` → `financeiro/CommissionCalculator.tsx:10-11` | nenhum | nenhuma | — | 🟦 SUGERIDO_OU_INICIADO | Valores iniciais fixos (`5000`, `5%`); **não lê `commission_rules` (0 linhas) nem `salesperson_commission_configs`**; nada é salvo |
| 59 | Assinatura digital de documentos | `src/pages/AssinaturaDigital.tsx:30` → `signature/SignatureStatsCards.tsx` | `src/hooks/useDigitalSignatures.ts:44,67,89,147` | `digital_signatures`, `document_signers` | **0 / 0** | 🟨 PARCIAL | CRUD completo em código; **zero documentos** criados em produção |
| 60 | Feed de atividade do time | `components/dashboard/modules/AnalyticsModule.tsx:7` → `collaboration/TeamActivityFeed.tsx:76` | `src/hooks/useTeamActivityFeed.ts:83,99,106` | `salespeople`, `sales`, `activities` | 18 / 954 / 2.228 | ✅ IMPLEMENTADO_TOTAL | — |

---

## 2. Contagem por classificação

| Classificação | Quantidade | % (den. = **60** funcionalidades rastreadas) |
|---|---|---|
| ✅ IMPLEMENTADO_TOTAL | **29** / 60 | 48,3 % |
| 🟨 IMPLEMENTADO_PARCIAL | **28** / 60 | 46,7 % |
| 🟦 SUGERIDO_OU_INICIADO | **2** / 60 | 3,3 % |
| ⬛ MORTO_OU_ABANDONADO | **1** / 60 | 1,7 % |

Itens por classificação (nº da linha da tabela):
- ✅ 1,2,3,6,7,9,12,16,20,24,26,27,28,33,34,35,37,41,42,43,50,51,52,53,54,55,56,57,60
- 🟨 4,5,8,10,11,13,14,15,17,18,21,22,23,25,29,30,31,32,36,38,39,40,44,45,46,47,48,59
- 🟦 19 (ApprovalQueue), 58 (CommissionCalculator)
- ⬛ 49 (DealTimeline)

A contagem de **funcionalidades** mortas (1) é baixa porque a maioria do código morto não é
uma funcionalidade inteira, e sim **componente** órfão — ver §3: **14 arquivos** sem nenhum
importador em todo o `src/`.

**Leitura executiva:** metade do domínio CRM/Pipeline está em estado 🟨 — o código existe,
a UI renderiza, mas a camada de dados nunca foi alimentada em produção. Os módulos que
realmente rodam são os de núcleo transacional (clientes, vendas, atividades, pedidos,
comissões, comparador de preços) e os de *scoring* pré-calculado (deal health, velocity,
win/loss, lead scores).

---

## 3. Componentes mortos (nenhum importador em todo `src/`)

Verificado com `grep -rl "<NomeDoComponente>" src --include=*.tsx --include=*.ts`, excluindo o próprio arquivo.
**14 arquivos** com zero importadores:

| Arquivo | Observação |
|---|---|
| `src/components/pipeline/DealTimeline.tsx` | Único consumidor de `src/components/pipeline/dealTimelineConstants.tsx` (que fica morto por tabela) e de `src/hooks/useDealTimeline.ts` |
| `src/components/pipeline/dealTimelineConstants.tsx` | Referenciado só por `DealTimeline.tsx:16` |
| `src/components/pipeline/SLAIndicator.tsx` | Substituído por `SLACountdown.tsx` (vivo, usado em `DealCard.tsx`) — **refactor abandonado** |
| `src/components/pipeline/QuickActions.tsx` | Substituído por `QuickActionsMenu.tsx` (vivo em `DealCard.tsx`) — **refactor abandonado** |
| `src/components/pipeline/ExplainableWinProbability.tsx` | — |
| `src/components/pipeline/DealAutoSummary.tsx` | Convive com `DealSummaryCard.tsx` (vivo) |
| `src/components/pipeline/AIEmailWriter.tsx` | Convive com `src/components/sales/AIEmailDialog.tsx` e `components/email/AIEmailComposerButton` (vivos) |
| `src/components/activities/ActivityGoalCard.tsx` | — |
| `src/components/tasks/TaskCard.tsx` | Substituído por `DraggableTaskCard.tsx` (vivo) — **refactor abandonado** |
| `src/components/tasks/TaskListAdvanced.tsx` | Substituído por `TaskQueue.tsx` (vivo) — **refactor abandonado** |
| `src/components/deal-intelligence/DealHealthCard.tsx` | Substituído por `health/DealHealthHub.tsx` |
| `src/components/deal-intelligence/DealVelocityCard.tsx` | Substituído por `velocity/StuckDealsPanel.tsx` |
| `src/components/deal-intelligence/velocity/StageVelocityCard.tsx` | — |
| `src/components/collaboration/MentionInput.tsx` | — |

**Padrão de refatoração abandonada identificado 5×:** módulo novo criado, antigo permanece
no repo. Em `pipeline/` e `tasks/` o antigo está morto (bom); em `pipeline/` (multi-pipeline,
item 8) o **antigo é o que roda** e o novo é que está quebrado.

---

## 4. Dados fictícios / hardcoded encontrados (com arquivo:linha)

### Críticos — métrica de negócio fabricada apresentada como real

1. **`src/hooks/orders/useOrderTracking.ts:118-239`** — a página *Acompanhamento de Pedidos*
   inteira é sintética. Trecho-chave:
   - `:180` `const MOCK_CLIENTS = [ "Acme Corp", "Tech Solutions Ltda", "Inovação Brasil", … ]`
   - `:193` `function buildMockOrders(count)` — pedidos com número `10000+i`, valor `5000 + (seed % 95000)`
   - `:118` `buildInstallments(seed, …)` — parcelas e pagamentos derivados de `seed % 5`
   - `:145` `const health = healthRoll < 7 ? "on_track" : healthRoll < 9 ? "at_risk" : "delayed"` (`seed % 10`)
   - `:166` `invoiceNumber: \`NF-${String(seed).slice(0,6)}\`` — número de nota fiscal inventado
   - `:216` `if (!uid) return buildMockOrders(12)` e `:239` `catch { return buildMockOrders(12) }`
   - Lê `quotes` (`:219`) apenas para id/nome/valor e **ignora as 267 linhas reais de `orders`, `order_items` e `order_status_events`**.

2. **`src/components/activities/ArenaAITips.tsx:23`**
   `const isDownwardTrend = activeData.length > 2 && Math.random() > 0.7;`
   → dispara o card "Alerta de Desaceleração — *Inteligência detectou queda de ritmo no grupo
   nos últimos 15 min*" (`:40`) de forma **aleatória**, sem nenhuma série temporal.

3. **`src/components/sales/cadence/EliteCadenceAnalytics.tsx:55`**
   `efficiencyScore: 88, // Mock score for overall engine` — KPI fixo exibido no dashboard de cadências.

4. **`src/components/sales/cadence/ApprovalQueue.tsx:11-33`**
   `MOCK_PENDING` com leads fictícios ("Gabriel Medeiros", "Juliana Silva", menções a "SINGU VIP").
   `:37` `useState<PendingAction[]>(MOCK_PENDING)`; Aprovar/Rejeitar apenas removem do array local.

### Heurísticas hardcoded rotuladas como inteligência/predição

5. **`src/components/activities/PredictiveVelocity.tsx:20-28`** — "Projeção de Performance"
   assume jornada fixa `startHour = 8` / `endHour = 18` e extrapola linearmente o progresso.
6. **`src/hooks/follow-up/useFollowUpData.ts:75`**
   `const healthScore = Math.max(0, Math.min(100, 100 - daysInactive * 5 + score / 10));`
   — "health score" do lead é fórmula fixa, **não** vem de `deal_health_scores` (que tem 900 linhas).
7. **`src/hooks/usePipeline.ts:17-25`** — `PIPELINE_STAGES` com 7 estágios, rótulos, cores e
   probabilidades (10/25/50/75/100/0/0) **hardcoded**, apesar de `pipeline_stages` existir com 7 linhas.
8. **`src/components/pipeline/PipelineBoard.tsx:48`**
   `const DEFAULT_PIPELINE_ID = '00000000-0000-0000-0000-000000000001';` — UUID que **não existe**
   na tabela `pipelines` (único registro: `469ba7d8-8b8a-4c37-8d65-25ff4e8b924c`).
9. **`src/components/financeiro/CommissionCalculator.tsx:10-11`** — `saleAmount = 5000`,
   `percentage = 5` fixos; ignora `commission_rules` (0 linhas) e `salesperson_commission_configs`.

### Usos benignos de `Math.random()` (não são dados de negócio — registrados para descartar)

- `src/components/pipeline/PipelineBoard.tsx:204,213,219` — origem das partículas de confete.
- `src/components/sales/cadence/CadenceSimulationDialog.tsx:116` e
  `src/components/activities/DailyActivityRanking.tsx:101` — geração de `id` local de UI.
- `src/hooks/useQuotes.ts:295` — fallback de `crypto.randomUUID()` para `X-Request-Id`.

---

## 5. Tabelas do domínio com **0 linhas** (prova mais barata de feature dormente)

`agenda_events`, `buying_committee_members`, `cadences`, `cadence_steps`, `cadence_tasks`,
`cadence_enrollments`, `cadence_ab_tests`, `prospect_cadences`, `client_churn_alerts_state`,
`client_interactions`, `commercial_approval_requests`, `commission_rules`,
`committee_coverage_history`, `committee_extraction_runs`, `deal_chat_history`,
`deal_committee_coverage`, `deal_probability_scores`, `deal_risk_signals`, `deal_stage_history`,
`deal_velocity_alerts`, `digital_signatures`, `document_signers`, `follow_up_audit_logs`,
`follow_up_notifications`, `follow_up_settings`, `follow_up_templates`, `icp_data`,
`lead_score_trends`, `pipeline_inspections`, `playbooks`, `playbook_items`, `playbook_progress`,
`quote_conversion_audit`, `quote_sync_logs`, `sdr_alert_configs`, `activity_audit_logs`,
`sla_policies`, `sla_violations`, `stage_bottleneck_insights`, `stage_velocity_baselines`,
`task_assignments`, `win_loss_insights`, `account_contacts` — **43 tabelas**.

Tabelas com dado real relevante no domínio: `sales` 954, `activities` 2.228, `tasks` 600,
`quotes` 301, `quote_items` 900, `orders` 267, `order_items` 540, `order_status_events` 267,
`clients` 100, `client_portfolio` 100, `commissions` 942, `deal_health_scores` 900,
`deal_health_history` 900, `deal_stakeholders` 600, `deal_velocity_predictions` 900,
`deal_stage_transitions` 1.254, `deal_outcomes` 500, `lead_scores` 900, `win_loss_analyses` 500,
`price_history` 200, `price_alerts` 18, `supplier_products` 41, `products` 17,
`stage_inactivity_rules` 6, `stage_conversion_metrics` 6, `win_loss_patterns` 4,
`activity_goals` 9, `pipeline_stages` 7, `pipelines` 1.

**Sinal de "banco semeado, não operado":** a maioria das tabelas de núcleo tem `created_at`
máximo em **2026-07-12 19:xx–20:xx** (carga única). Só `activities` (2026-08-15),
`sales.updated_at` (2026-08-14), `clients.updated_at` (2026-08-14), `products` (2026-08-14),
`price_history` (2026-08-14), `activity_goals` (2026-08-15) e `salespeople` (2026-08-15)
mostram escrita posterior.

---

## 6. O que NÃO consegui verificar

1. **Se o app está de fato em produção com usuários reais.** Todos os `created_at` de núcleo
   concentram-se em 2026-07-12 (carga de seed). Não consegui distinguir, por SQL, dado de
   *seed* de dado de *operação* — não há coluna de origem. As datas de 2026-08-14/15 sugerem
   edição manual/scripts, não fluxo de usuário.
2. **Execução das Edge Functions.** Existem 170+ funções em `supabase/functions/`. Não tenho
   acesso de leitura aos logs de invocação (apenas SELECT no banco), então só pude inferir
   execução pela presença de linhas nas tabelas de destino. Uma função pode ter rodado e
   falhado sem gravar nada.
3. **RLS / autorização efetiva.** Todas as 380+ tabelas têm `rls_enabled = true`, mas não
   auditei políticas. Uma tabela com linhas pode estar invisível ao usuário final.
4. **`quotes_inbound` (154 linhas) e `quote_sync_inbound_log`** — não localizei tela consumidora
   dentro do meu escopo (`quotes/` tem só 2 componentes). O consumidor pode estar em
   `src/components/bitrix/` ou em páginas admin, fora do escopo atribuído.
5. **Feature flags.** `feature_flags` existe; não verifiquei se algum módulo do domínio está
   condicionado a flag desligada (não encontrei uso de flag nos componentes lidos, mas não li
   os 158 arquivos linha a linha — priorizei os pontos de entrada de dados).
6. **`sales/cadence/` (12 componentes) e `deal-intelligence/` (41 componentes)** — verifiquei
   fonte de dados de todos os hooks, mas não li integralmente cada componente de apresentação;
   podem existir outros valores hardcoded em subcomponentes de gráfico.
7. **`SaleHUDCard`, `AIEmailDialog`, `WhatsAppDialog`** — confirmei que são importados e usados,
   mas não tracei o fio completo até persistência (envio real de e-mail/WhatsApp depende de
   credenciais em `channel_credentials`, tabela que não consegui contar de forma conclusiva).
