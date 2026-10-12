# Anexo D — Frontend (src/): funcionalidades planejadas e não executadas ou parciais

Base: HEAD `6f6b94a`. Análise estática de 2.022 arquivos de produção (`.ts`/`.tsx`, sem testes): grafo de imports a partir de `main.tsx`, `AppRoutes.tsx`/`lazyPages.ts` e `sidebarMenuData.ts`, cruzado com `supabase/functions/*` (172 pastas) e `types.ts` (403 tabelas, 36 views, 233 RPCs). Os botões e mocks listados foram conferidos no código-fonte. Legenda de impacto: **A** = alto (o usuário recebe dado falso ou uma ação que não acontece em fluxo de venda), **M** = médio, **B** = baixo.

Tipos usados: MOCK (dado fixo ou fictício na tela) · RANDOM (`Math.random` em métrica) · AÇÃO-FAKE (handler que só mostra toast ou animação) · BOTÃO-MORTO (botão sem `onClick`) · STUB · ÓRFÃO (arquivo ou página que nenhuma tela alcança) · ROTA-SEM-LINK · LINK-QUEBRADO · TABELA-AUSENTE · EDGE-SEM-UI · PENDÊNCIA (declarada em comentário) · BLOQUEADO (`disabled` fixo ou feature travada).

---

## 1. CRM core: vendas, pipeline, clientes, pedidos, cotações

| item | arquivo:linha | tipo | o que falta | impacto |
|---|---|---|---|---|
| "Enviar" cotação | src/components/quotes/QuoteCard.tsx:119 | AÇÃO-FAKE / EDGE-SEM-UI | Só muda `status` para `sent`. A edge `send-quote-to-client` existe e nada no front a chama, então a cotação não chega ao cliente | A |
| Envio WhatsApp em Vendas | src/hooks/useWhatsApp.ts:11-27 (usado por WhatsAppDialog em /vendas) | AÇÃO-FAKE | Grava em `whatsapp_conversations` com status `sent` ("simulated successful outbound") e não chama Evolution nem `send-multichannel-message`, que só aparece no teste de canal (`useChannelCredentials.ts:105`) | A |
| "Enviar Agora" no e-mail IA | src/components/sales/AIEmailDialog.tsx:108 | AÇÃO-FAKE | Mostra o toast "E-mail enviado para fila" e fecha o diálogo. Nenhum envio nem enfileiramento acontece | A |
| Ações da Client 360 | src/components/clients/Client360Header.tsx:44; Client360HealthNbaSection.tsx:148,155; Client360PredictiveCards.tsx:43,69,76 | AÇÃO-FAKE | "Sincronizar ERP", "Agendar follow-up", "Oportunidade adicionada ao pipeline!", "Lembrete agendado" e "Abrir canal" só mostram toast (/clientes) | A |
| Validação de CNPJ alfanumérico | src/lib/validators/brDocuments.ts:110 | PENDÊNCIA | Comentário: "Pendência conhecida, não implementada". A Receita emite CNPJs com letras desde 2026 e o validador os rejeita | A |
| Assinatura digital | src/pages/AssinaturaDigital.tsx:363,376; src/hooks/useDigitalSignatures.ts:36,123-143 | BLOQUEADO | Envio e confirmação de assinatura lançam `DIGITAL_SIGNATURE_INTEGRATION_MESSAGE`. Falta integrar um provedor de assinatura | A |
| "Enriquecer" no card do deal | src/components/pipeline/DealCard.tsx:199-202 | AÇÃO-FAKE | Apenas anima por 2 s ("Etapa 3"). Não chama `enrich-lead` (/pipeline) | M |
| Regras de território de follow-up | src/components/settings/FollowUpTerritoryRules.tsx:83 | TABELA-AUSENTE | `db.from('auth_users_view')`: a view não existe em types.ts nem em migrations, então o select de vendedor fica vazio ou dá erro (/configuracoes) | M |
| Link para detalhe de venda | src/components/deal-intelligence/health/CriticalDealsTable.tsx:150 | LINK-QUEBRADO | `/vendas/:id` não existe (/revenue-intelligence) | M |
| Link para conta | src/components/win-loss/VirtualDealsList.tsx:108; NextBestWinLossCard.tsx:44 | LINK-QUEBRADO | `/contas/:id` não existe. A rota real é `/engagement/abm/:accountId` | M |
| Lista "Meus pedidos" | src/pages/OrderDetailPage.tsx:49; src/hooks/orders/useOrderTracking.ts:104 | LINK-QUEBRADO / ÓRFÃO | Link para `/meus-pedidos`, mas só existe `/meus-pedidos/:id`. `useOrderTrackingDetail` é exportado e nunca usado | M |
| Página ABM duplicada | rota `/abm` (AccountBasedSelling) | ROTA-SEM-LINK | O menu aponta para `/engagement/abm`; `/abm` ficou sem nenhum link | B |
| Comparador de preços | rota `/comparador-precos` | ROTA-SEM-LINK | Só aparece em breadcrumb, sem item de menu | B |
| Menu de cadência de orçamento | src/components/cadences/quote/QuoteCadenceCard.tsx:182 | BLOQUEADO | Item fixo "Sem ações disponíveis" (disabled) | B |

## 2. BI por papel (BISDR, BICloser, BIVendedor, BIGestor)

| item | arquivo:linha | tipo | o que falta | impacto |
|---|---|---|---|---|
| Stubs que sombreiam componentes reais | src/components/bi/index.tsx:17-40 | STUB | O barrel exporta stubs `BIMetricsGrid`, `BIComparisonCard` e `BIPurchaseHistory` com o mesmo nome das versões reais (BIMetricCard.tsx:261, BIProjectionCard.tsx:193, BIClientList.tsx:150). Os stubs ignoram as props | A |
| BI Closer: comparativos e histórico | src/pages/BICloser.tsx:83,260-280,321 | STUB (efeito) | Os 3 cards "atual × período anterior × ano anterior" renderizam só o título. `BIPurchaseHistory data=…` sai vazio e `cols={6}` é ignorado | A |
| BI SDR: comparativos | src/pages/BISDR.tsx:178,219,331 | STUB (efeito) | O mesmo problema: card de comparação sem números e grid sem `cols` | A |
| Cliente × indústria | src/hooks/bi/useClientVsIndustry.ts:39-50 | MOCK | `client: 85` fixo ("Mock … don't have RPC yet") e fallback com array fixo (/ferramentas/bi) | A |
| Análise ABC: insights | src/hooks/bi/useABCAnalysis.ts:122-170 | MOCK | "Neural insights" com textos fixos ("segmento B cresceu 14%", "85% de chance") e `matrixShifts` com clientes fictícios (Cliente VIP S/A, Distribuidora Beta, Tech Solutions). As automações também são fixas (/analytics, /analytics/abc) | A |
| Painel de risco de churn | src/components/analytics/ChurnPredictionPanel.tsx:48,239; src/pages/Analytics.tsx:113,214 | MOCK | Analytics renderiza `<Component />` sem props, então o painel mostra sempre `DEFAULT_PREDICTIONS` ("Tech Solutions LTDA", risco 87) | A |
| Filtros da ABC | src/components/analytics/ABCAnalysis.tsx:87 | BOTÃO-MORTO | Botão "Filtros" sem ação | B |

## 3. Dashboards (/dashboard, /sdr, /closer)

| item | arquivo:linha | tipo | o que falta | impacto |
|---|---|---|---|---|
| Drill-down do velocímetro | src/components/dashboard/Speedometer.tsx:276-291 | RANDOM / MOCK | Os períodos ano, trimestre e mês anterior são o valor atual multiplicado por 12, 3 ou 1,1 e por um ruído `0.9+Math.random()*0.2`. Não há consulta por período | A |
| Tendência do velocímetro | src/components/dashboard/Speedometer.tsx:706 | MOCK | "+4.2% vs prev." fixo | M |
| Histórico de receita e vendas | src/components/dashboard/FuturisticSpeedometerDashboard.tsx:281-295 | MOCK | `mockRevenueHistory`/`mockSalesHistory` são frações fixas do total, com rótulos em espanhol (Lun, Mie, Jue) | M |
| Lead score do SDR | src/components/sdr/LeadScoreBreakdown.tsx:7-11 | MOCK | Default "Acme Corp", score 85 e fatores fixos (90/75/85) | A |
| Orquestrador de sequências do SDR | src/components/sdr/SDRSequenceOrchestrator.tsx:9-50,163 | MOCK / BOTÃO-MORTO | Sequências e "best actions" fictícias (Empresa XPTO, João Silva/TechCorp). "Ver todas as tarefas" não faz nada | A |
| Destaques de IA do SDR | src/components/sdr/SDRIntelligenceHighlights.tsx:7-30,84,107 | MOCK / BOTÃO-MORTO | Recomendações fictícias (Acme 92, TechFlow 78, Global Logistics 85) e botões sem ação | A |
| Insights de conversa do SDR | src/components/sdr/SDRConversationInsights.tsx:6-15 | MOCK | Sentimento 65/25/10 e objeções fixas ("Mock data for the demonstration") | A |
| Barra de comando do SDR | src/components/sdr/SDRCommandBar.tsx:17,27,36,45,60 | BOTÃO-MORTO | "Novo Lead", "Log Call", "Log Email", "Log Social" e "SDR Copilot" sem `onClick` | A |
| Limite de rejeição do SDR | src/components/sdr/SDRAlertHistory.tsx:188 | AÇÃO-FAKE | O "salvar" só mostra toast e não persiste | M |
| Pulse survey (eNPS) | src/components/engagement/PulseSurveyWidget.tsx:17,44-52 | AÇÃO-FAKE | As respostas ficam em estado local, nada vai para o banco | M |
| SYS_ID decorativo | src/components/sdr/SchedulingRateGauge.tsx:138 | RANDOM | ID aleatório puramente cosmético | B |

## 4. Inteligência (/inteligencia, também como seção de /dashboard)

A página inteira é maquete: nenhum componente de `src/components/intelligence/` importa hook de dados nem Supabase.

| item | arquivo:linha | tipo | o que falta | impacto |
|---|---|---|---|---|
| Cockpit | src/components/intelligence/IntelligenceCockpit.tsx:36-50,259,262,278,303 | MOCK / BOTÃO-MORTO | Estatísticas fixas ("94%", "78%", "+22% menções") e 3 botões sem ação | A |
| Relatório executivo | src/components/intelligence/ExecutiveSummaryReport.tsx:56,59,156,162,184,331 | MOCK / BOTÃO-MORTO | Valores fixos ("R$ 840k", "R$ 120k", "32% dos deals"). PDF, Compartilhar e Detalhes sem ação | A |
| Recomendações estratégicas | src/components/intelligence/StrategicRecommendations.tsx:18-41,146 | MOCK / BOTÃO-MORTO | Recomendações fictícias (Acme, Global Tech, "SDR João") e "Execute Action" sem ação | A |
| Tendências | src/components/intelligence/PerformanceTrends.tsx:19-25 | MOCK | Série fixa de Week 1 a Week 6 | M |
| Pulso de atividade | src/components/intelligence/ActivityPulse.tsx:4-30 | MOCK | Feed fictício ("Acme Corp assinou R$ 250k") | M |
| Grafo de relacionamentos | src/components/intelligence/RelationshipGraph.tsx:11-59 | MOCK | Nós e conexões fixos | M |
| Simulador de cenários | src/components/intelligence/ScenarioSimulator.tsx:40-60 | MOCK | Cenários fixos sem base real | M |
| Revisão do pipeline | src/components/intelligence/PipelineStrategicReview.tsx:97 | BOTÃO-MORTO | "Ver Detalhes Completos" sem ação | B |

## 5. Inteligência de compras (/inteligencia-compras) e pricing (/pricing-intelligence)

| item | arquivo:linha | tipo | o que falta | impacto |
|---|---|---|---|---|
| Configurações de inteligência | src/components/purchase-intelligence/IntelligenceSettings.tsx:101-108 | BOTÃO-MORTO | `Switch defaultChecked` sem estado. "Resetar" e "Salvar Alterações" sem ação, então nenhuma configuração é salva | A |
| Alertas de inteligência | src/components/dashboard/modules/IntelligenceAlerts.tsx:25-50 | MOCK | `staticAlerts` ("5 clientes VIP atingiram 85%") | A |
| Insight de LTV | src/components/purchase-intelligence/PurchaseIntelligenceHub.tsx:155-163 | MOCK | "LTV 15% acima do segmento" e "+R$ 12.400" fixos | M |
| Previsão de compra | src/components/purchase-intelligence/PurchasePredictionCard.tsx:292,298 | BOTÃO-MORTO | "Agendar" e "Proposta" sem ação | M |
| Histórico do cliente | src/components/purchase-intelligence/ClientPurchaseHistory.tsx:513 | BOTÃO-MORTO | "Ver Nota Fiscal" sem ação | M |
| Auditoria de duplicidade | src/components/purchase-intelligence/DuplicateBlockAudit.tsx:44,51 | BOTÃO-MORTO | "Filtros" e "Exportar" sem ação | B |
| Guia de onboarding | src/components/purchase-intelligence/EmptyStateGuide.tsx:69,76 | BOTÃO-MORTO | "Começar Configuração" e "Ver Documentação" sem ação | B |
| Price Guard: alertas de margem | src/components/pricing/MarginAlertsCard.tsx:20-62,113 | MOCK / BOTÃO-MORTO | "3 INCIDENTES CRÍTICOS" com clientes fictícios (Tech Solutions Inc, R$ 45.200). "REVISAR DEAL" sem ação | A |
| Recuperação de receita | src/components/pricing/RevenueLeakageCard.tsx:110 | AÇÃO-FAKE | `handleApplyRecovery` só mostra toast | M |
| Exportações de pricing | src/components/pricing/PricingHealthBanner.tsx:68; ProductRecommenderCard.tsx:99; TopDiscountersCard.tsx:101 | BOTÃO-MORTO | "Exportar Auditoria", "Exportar Sugestões" e "Ver Ranking" sem ação | M |

## 6. Cadências, sequências e automação

| item | arquivo:linha | tipo | o que falta | impacto |
|---|---|---|---|---|
| Fila de aprovação de mensagens | src/components/sales/cadence/ApprovalQueue.tsx:26-50,58,63,154,158 | MOCK / AÇÃO-FAKE / BOTÃO-MORTO | `MOCK_PENDING` (Gabriel Medeiros, Juliana Silva). Aprovar e rejeitar só mostram toast. "Visualizar Lead" e "Editar Texto" sem ação (/cadencias-orcamentos) | A |
| Gerenciador de templates | src/components/sales/cadence/CadenceTemplateManager.tsx:45,392,400 | AÇÃO-FAKE | Os templates ficam em `useState` com seed fixo e não persistem. Aprovar e rejeitar só mostram toast (/cadencias, /cadencias-orcamentos) | A |
| "One-Click Strategy: Aplicar Plano" | src/components/predictive/PredictiveScenarioPlanner.tsx:120-128,143 | AÇÃO-FAKE / MOCK | O toast afirma "Workflows de automação criados", mas nada é criado. Fórmulas fixas ("32% + boost", "12 reps") (/inteligencia-preditiva) | A |
| Analytics de cadência | src/components/sales/cadence/EliteCadenceAnalytics.tsx:57-61,95,112,280 | MOCK / BOTÃO-MORTO | `efficiencyScore: 88` ("Mock score"), `matrixShifts` fixos, textos "15% acima do setor" e "+22%". "Ver Log" sem ação (/cadencias) | M |
| Relatório de cadência | src/components/sales/cadence/CadenceReportPanel.tsx:7-60 | MOCK | Métricas fixas (abertura 42,5%, resposta 18,2% etc.) | M |
| Inscrição e controle manual de cadência | src/components/cadences/EnrollCadenceDialog.tsx, CadenceMetricsPanel.tsx, ProspectCadenceControls.tsx; src/hooks/cadences/useCadenceMetrics.ts | ÓRFÃO | UI construída e nunca montada | M |

## 7. Conversation intelligence, coaching e dialer

| item | arquivo:linha | tipo | o que falta | impacto |
|---|---|---|---|---|
| Pipeline de gravação de chamadas (upload, transcrição, diarização) | src/pages/ConversationalIntelligence.tsx (420 linhas, sem rota) | ÓRFÃO | É o único lugar que monta CallRecordingUploader, TranscribeButton, DiarizeButton, TranscriptViewer, CallRecordingPlayer e CallStatsPanel. Por isso `process-call-recording-ingest`, `transcribe-call-recording` e `diarize-call-recording` só são chamadas por hooks mortos. A rota /conversational-intelligence usa o Hub, que não oferece upload | A |
| Feed "ao vivo" | src/components/conversational/LiveIntelligenceFeed.tsx:18-50 | MOCK | "Simulation of live detection" com insights fixos ("Concorrente Detectado: SalesForce") | A |
| Resumo da gravação | src/components/conversational/RecordingSummaryDrawer.tsx:44-47 | MOCK | `timestamp_sec: 120 + idx*45 // mock timestamp` e `confidence 0.85` fixa | M |
| Battle card na timeline de sentimento | src/components/conversational/SentimentTimelineChart.tsx:235 | MOCK | `battleCardId="mock-id"` e "Concorrente Direto" | M |
| Talking points | src/components/conversational/ConversationalIntelligenceHub.tsx:386 | BOTÃO-MORTO | "Ver Talking Points" sem ação | B |
| Next Best Action do deal | src/components/deal-intelligence/NextBestActionPanel.tsx:145-160,181 | BOTÃO-MORTO / MOCK | "Concluir" e "Executar Play" sem ação. Playbook com "case da TechCorp" fixo e fallback de IA "65% de chance" (/deal-intelligence) | A |
| Timeline do comitê | src/components/deal-intelligence/committee/RelationshipHealthGraph.tsx:306 | BOTÃO-MORTO | "Ver Timeline" sem ação | B |
| Progresso de coaching | src/components/conversational/CoachingProgressCard.tsx; src/hooks/conversational/useCoachingProgress.ts | ÓRFÃO | Construído e não montado | M |
| Coaching de perda e ações de coaching | edges `generate-loss-coaching`, `generate-coaching-actions` | EDGE-SEM-UI | Sem chamador no front e sem referência em migrations ou cron | M |
| Voz do assistente | src/hooks/useElevenLabsVoice.ts:74-75; src/components/assistant/SalesAssistantChat.tsx:80-81 | PENDÊNCIA / handler vazio | `isApiConfigured = true` fixo ("assume it is for now") e `onSpeakStart`/`onSpeakEnd` vazios. A edge `elevenlabs-stt` não é chamada; o STT usa o Web Speech do navegador | M |
| Dialer (Twilio) | — | — | `twilio-click-to-call` é chamada (`useClickToCall.ts:46`). `twilio-call-status` e `twilio-call-twiml` são webhooks, então a ausência de chamada no front é esperada | — |

## 8. Deal intelligence, win-loss e forecast

| item | arquivo:linha | tipo | o que falta | impacto |
|---|---|---|---|---|
| Saúde do deal, comitê e velocity | src/components/deal-intelligence/ (17 arquivos: DealHealthCard, BuyingCommitteeCard, DealVelocityCard, StakeholderFormDialog, CommitteeCoverageRing, RoleCoverageMatrix, StageVelocityCard, VelocityForecastTimeline…); src/hooks/deal-intelligence/useDealVelocity.ts | ÓRFÃO | Componentes construídos e não montados. `predict-deal-velocity` só é chamada por hook morto | A |
| Componentes de IA do pipeline | src/components/pipeline/ExplainableWinProbability.tsx, DealAutoSummary.tsx, AIEmailWriter.tsx, DealTimeline.tsx, SLAIndicator.tsx, QuickActions.tsx | ÓRFÃO | Explicação de win probability, resumo automático e SLA visual não aparecem em nenhuma tela | M |
| Página de análise win-loss | src/pages/WinLossAnalysisPage.tsx:40,48,79-105 | BOTÃO-MORTO / MOCK | "Exportar Dados" e "Filtros Avançados" sem ação. Insights fixos ("70% das vitórias", "Player Y 30%", "Win Rate subirá para…") (/analytics/win-loss) | A |
| Biblioteca de objeções | src/pages/ObjectionsLibraryPage.tsx:58,67 | MOCK | "45% das perdas" e "+12% menções ao Player X" fixos | M |
| Analytics de e-mail | src/pages/EmailAnalyticsPage.tsx:105 | MOCK | "Perguntas no assunto geram aberturas 40% maiores" fixo. A rota /analytics/emails também não tem link | M |
| Curvas de evolução | src/pages/EvolutionCurvesPage.tsx:40,48,75-78 | BOTÃO-MORTO / MOCK | "Compartilhar" e "Filtrar" sem ação. "Líderes de Crescimento" fictícios (Carlos Silva +24%, Mariana Costa…) | M |
| Deal velocity | src/pages/DealVelocityPage.tsx:67 | BOTÃO-MORTO | "Exportar" sem ação | B |
| Upsell e layout personalizável de win-loss | src/components/win-loss/UpsellSuggestionCard.tsx, DashboardLayoutEditor.tsx, WebhookReplayHistory.tsx, WebhookDeliveryItem.tsx; hooks useUpsellSuggestions.ts, useUserDashboardLayout.ts | ÓRFÃO | Construídos e não montados | M |
| Cobertura de pipeline | edge `analyze-pipeline-coverage` | EDGE-SEM-UI | Sem chamador no front | M |
| Forecast e analytics legados | src/components/analytics/SalesForecast.tsx, DemandForecast.tsx, ConversionAnalysis.tsx, ProductMix.tsx | ÓRFÃO | Duplicatas abandonadas | B |
| Defaults do battle card | src/components/win-loss/CompetitorBattleCardModal.tsx:24 | MOCK | Objeções padrão fixas | B |

## 9. Customer Success e relatórios

| item | arquivo:linha | tipo | o que falta | impacto |
|---|---|---|---|---|
| Detalhe de risco de churn | src/components/customer-success/ChurnRiskDetailDialog.tsx:71-80 | MOCK | Fatores fixos ("-42% vs mês anterior", "Score 0.22") iguais para todo cliente (/customer-success) | A |
| Onboarding de clientes | src/pages/OnboardingTracking.tsx:41-68 | MOCK / AÇÃO-FAKE | Trilhas em `useState` com clientes fictícios (Empresa Alpha, Corp Beta). Adicionar e concluir não persistem (/onboarding-tracking) | A |
| Narrativa do QBR | src/components/reports/QBRStoryGenerator.tsx:120-130 | MOCK | "A IA detectou vazamento em Proposta Técnica" e "10%" fixos (/relatorios-executivos) | M |
| Widget de relatório customizado | src/components/dashboard/widgets/CustomReportWidget.tsx:37 | LINK-QUEBRADO | Aponta para `/relatorios/builder`, que não existe. A rota real é `/relatorios-custom` | M |
| Admin comercial | src/pages/admin/AdminComercial.tsx:717,724 | BOTÃO-MORTO | "Filtrar" e "Exportar" sem ação | M |
| Relatório de atividades | rota `/relatorio-atividades` | ROTA-SEM-LINK | Sem link em nenhum lugar | B |

## 10. Gamificação: Race, Arena e badges

| item | arquivo:linha | tipo | o que falta | impacto |
|---|---|---|---|---|
| Dica "preditiva" de tendência de queda | src/components/activities/ArenaAITips.tsx:27,142,148 | RANDOM / BOTÃO-MORTO | `isDownwardTrend = Math.random() > 0.7`. "Executar Protocolo" e "Arquivar" sem ação (/metas-atividades) | A |
| Reações no card de atividade | src/components/arena/EnhancedActivityCard.tsx:18 | RANDOM | Contagem de reações = `Math.random()*12` | M |
| Vitrine de badges | src/components/activities/AchievementBadgeDisplay.tsx:13-50 | MOCK | 4 badges fixos, sem vínculo com conquistas reais | M |
| Comparativo de features e roadmap | src/components/competitive/FeatureComparison.tsx:83-112,189,230,489 | MOCK / AÇÃO-FAKE / BOTÃO-MORTO | Roadmap fixo. `handleExportPDF` promete PDF e só mostra toast. "Share Intel" e "Executar Roadmap" sem ação (/arena) | M |
| Plano de melhoria | src/components/competitive/ImprovementPlan.tsx:30-60,215 | MOCK / BOTÃO-MORTO | Plano fixo e "Iniciar Transformação" sem ação | M |
| Ligas | src/components/competitive/LeagueSystem.tsx:180-190 | PENDÊNCIA / AÇÃO-FAKE | "Sistema de ligas será ativado na próxima temporada". "Entrar na Liga" só mostra toast | M |
| Histórico de batalhas e status | src/components/competitive/BattleArena.tsx:233; CompetitiveStatusBar.tsx:42 | BOTÃO-MORTO | Botões sem ação | B |
| Desafios | src/components/gamification/DailyChallengesCard.tsx:108; WeeklyChallengesCard.tsx:238 | PENDÊNCIA (estado vazio) | "Novos desafios em breve!" dependente de `rotate-daily-challenges` | B |
| Componentes de gamificação | src/components/gamification/ (15 arquivos: XPBar, CompetitiveLeaderboard, RealtimeXPRanking, FlashSalesBanner, SeasonalEventBanner, StreakCounter, XPHistoryTimeline, LeaderboardCard, PointsDisplay…); src/hooks/useCombo.ts; src/services/comboService.ts | ÓRFÃO | Sistema de combo, flash sales, eventos sazonais e ranking em tempo real construídos e não montados | M |
| Componentes da Race | src/components/race/SeasonReplayModal.tsx, MiniMap.tsx, RaceAchievementShareCard.tsx, ProportionalFireworks.tsx; exports TrackWeatherOverlay e RivalryBadge | ÓRFÃO | Replay de temporada, minimapa, compartilhamento de conquista, clima e rivalidade construídos e não usados | B |
| Página legada | src/pages/RaceArena.tsx | ÓRFÃO | Re-export legado para o Hub | B |
| Perfil gamer e desafios diários | rotas `/perfil-gamer`, `/desafios-diarios` | ROTA-SEM-LINK | Sem link | B |
| Ranking e broadcast | edges `ranking-api`, `broadcast-sale-notification` | EDGE-SEM-UI | Sem chamador no front; podem ser disparadas por trigger | B |

## 11. Segurança, admin e plataforma

| item | arquivo:linha | tipo | o que falta | impacto |
|---|---|---|---|---|
| Painéis de segurança | src/components/security/ (BlockedIPsPanel, IPWhitelistPanel, KnownDevices, MFAVerification, RateLimitDashboard, RateLimitStatsCards, ReauthDialog, RoleManager, PushNotificationSettings); hooks useIPBlocking, useRateLimit, useReauthentication; src/services/knownDeviceService.ts | ÓRFÃO | Bloqueio e whitelist de IP, rate limit, reautenticação, dispositivos conhecidos e gestão de papéis construídos e não expostos | A |
| Restrição de flag por papel | src/hooks/useFeatureFlags.ts:71-75 | PENDÊNCIA | `allowed_roles` é ignorado ("for now allow if flag is enabled"). Uma flag ligada vale para todos os papéis | A |
| Mapa de geobloqueio | src/components/security/GeoBlockingMap.tsx:8,123 | MOCK | Paths SVG "Mock" com poucos países (/seguranca) | M |
| Logs de segurança | src/pages/SecurityDashboard.tsx:149 | BOTÃO-MORTO | "Ver Logs Detalhados" sem ação | B |
| Passkeys | src/hooks/useWebAuthn.ts:24; src/components/security/PasskeySettings.tsx:87-97 | BLOQUEADO (kill-switch) | Constante `PASSKEYS_AVAILABLE` (hoje `true`) com tela de "manutenção" pronta | B |
| Rotas admin sem link | `/admin/fila-tarefas-automaticas`, `/admin/regras-inatividade`, `/admin/alertas-churn`, `/admin/supressao-emails`, `/admin/quote-sync-inbound`, `/admin/tarefas`, `/admin/webhooks-alert-history`, `/admin/webhooks-alert-settings` | ROTA-SEM-LINK | Telas funcionais que só abrem digitando a URL | M |
| Metas | src/services/goalsService.ts (só importado em teste); src/components/goals/GoalTracker.tsx | ÓRFÃO | Construídos e não usados | B |
| Configurações legadas | src/components/settings/SettingsPanel.tsx, SecurityAlertSoundSettings.tsx | ÓRFÃO | Construídos e não usados | B |
| Feature flags ativas no front | MainLayout.tsx:81 (`ai_copilot`, que liga o PersonalAssistantDrawer); useRaceSmartNotifications.ts:38 | FLAG | O estado depende da tabela `feature_flags`, que não foi lida aqui. A edge `ai-copilot` não tem chamador; o drawer usa `personal-assistant-stream` | M |

## 12. Visão transversal

### 12.1 Marcadores (item 1)
- **Zero** `TODO`, `FIXME`, `HACK` ou `XXX` literais em src/ de produção: os marcadores foram removidos, mas as pendências continuam no código como mocks e textos.
- Marcadores semânticos relevantes, já incluídos nas tabelas: `brDocuments.ts:110` ("não implementada"), `useClientVsIndustry.ts:39` ("Mock … for now"), `EliteCadenceAnalytics.tsx:57` ("Mock score"), `SDRConversationInsights.tsx:6` ("Mock data for demonstration"), `ProfilePerformanceCard.tsx:10` ("Mock data", arquivo morto), `LiveIntelligenceFeed.tsx:18` ("Simulation"), `useABCAnalysis.ts:122` ("Simulated"), `useWhatsApp.ts:11` ("simulated"), `RecordingSummaryDrawer.tsx:47`, `GeoBlockingMap.tsx:8`, `useFeatureFlags.ts:75`, `useElevenLabsVoice.ts:74`, `LeagueSystem.tsx:182`, `components/bi/index.tsx:17` ("Stub components").

### 12.2 Rotas (item 4)
- 173 arquivos em `src/pages`, 170 lazy pages e 175 `path=`. **Todas as lazy pages estão roteadas.**
- Páginas órfãs: `src/pages/ConversationalIntelligence.tsx` (funcional, 420 linhas) e `src/pages/RaceArena.tsx` (legado). `RaceArenaView.tsx` é usada indiretamente pelas rotas SDR e Closer.
- O menu (`sidebarMenuData.ts`, 115 itens) não aponta para nenhuma rota inexistente.
- **16 rotas sem nenhum link** no código: as 14 citadas nas seções acima, mais `/reset-password` e `/embed/report/:token`, que são esperadas.
- 45 rotas são alcançáveis por link interno, mas não estão no menu.
- **6 links quebrados:** `/relatorios/builder`, `/meus-pedidos`, `/vendas/:id`, `/contas/:id` (2×) e `/404`. O último cai no catch-all; `Index.tsx:147` navega para `/404`, que é tratado pelo `*` (aceitável).

### 12.3 Código exportado e nunca usado (item 5)
- **148 arquivos de produção inalcançáveis** a partir de `main.tsx`, com cerca de 19 mil linhas: components 122 (17 deles em ui/atoms, primitivas não usadas), hooks 15, services 3, lib 3, pages 2, types 2, config 1.
  - Maiores grupos: deal-intelligence 17, gamification 15, ui 12, dashboard 9, security 9, conversational 8, pipeline 7, atoms 5, race 5, win-loss 5, analytics 4, hooks/conversational 4.
- **264 exports nunca importados**: 169 deles em arquivos que estão vivos (components 65, hooks 52, lib 39, config 9, contexts 2, utils 2).
  - Hooks `use*` exportados e não importados: `useOrderTrackingDetail`, `useDealSummaries`, `useCommandPalette` e 13 de uso só interno.
  - Componentes: 13 variantes de `EmptyState` (NoDeals, EmptyClients…), `LevelUpNotification`, `RivalryBadge`, `TrackWeatherOverlay`, `ICPIndicator`, `PageTransitionProvider` etc.

### 12.4 Edge functions, tabelas e RPCs (item 6)
- 137 nomes literais de edge function referenciados no front existem em `supabase/functions`. **Correção da consolidação:** o invoke dinâmico de `src/hooks/pipeline-pulse/useQuickAction.ts:15,20` aponta para `deal-health-scorer` e `smart-lead-router`, que **não existem**. Os botões "Recomputar health" e "Rotear leads pendentes" do Pipeline Pulse sempre falham (ver Anexo E).
  - Invokes dinâmicos: `BackendAutomationMonitor.tsx:72` e `useQuickAction.ts:42`.
- **35 edge functions sem chamador no front.** A maioria é webhook ou cron, o que é esperado: inbound-email-webhook, twilio-*, winloss-webhook-*, *-alert, process-scheduled-sends, receive-quote-*, health, simulate-load.
  - Sem UI e com cara de feature do usuário: `send-quote-to-client`, `ai-copilot`, `generate-loss-coaching`, `generate-coaching-actions`, `analyze-pipeline-coverage`, `elevenlabs-stt`, `ranking-api`, `deal-risk-digest`, `send-push-notification`.
- **4 edges chamadas só por código morto:** `transcribe-call-recording`, `diarize-call-recording`, `process-call-recording-ingest`, `predict-deal-velocity`.
- `.from()`: 1 tabela ausente, `auth_users_view`, que também não existe em migrations. O `'tabela'` em `parseRows.ts:12` é um comentário (falso positivo).
- `.rpc()`: 0 ausentes. `fn_admin_conversion_trail`, chamada sem tipagem, existe.

### 12.5 Handlers vazios, `disabled` fixo e `Math.random` (itens 2 e 3)
- Handlers vazios: 2 (`SalesAssistantChat.tsx:80-81`). Nenhum `console.log` no lugar de ação.
- Handlers que só mostram toast: 14 (ver seções 1, 3, 5, 6 e 10).
- Botões sem `onClick`: cerca de 55 confirmados nas telas listadas. O scan bruto deu 67; o restante eram falsos positivos (triggers e combobox).
- `disabled` fixo: 4 com efeito de negócio (AssinaturaDigital 2×, NextBestWinLossCard "Sem conta", QuoteCadenceCard).
- `Math.random`: 87 ocorrências.
  - 4 em métricas ou negócio: ArenaAITips:27, Speedometer:288, EnhancedActivityCard:18 e TournamentBrackets:123 (sorteio de seeds, aceitável).
  - O resto é visual (partículas, confete) ou geração de ID.

---

## Contagens por tipo (itens distintos nas tabelas)

| tipo | qtd |
|---|---|
| MOCK (dado fixo ou fictício em tela de produção) | 38 |
| BOTÃO-MORTO (telas afetadas; cerca de 55 botões) | 30 |
| AÇÃO-FAKE (handler só com toast ou animação) | 16 |
| ÓRFÃO (grupos de feature; 148 arquivos no total) | 16 |
| ROTA-SEM-LINK | 14 |
| EDGE-SEM-UI (feature do usuário) + edges só em código morto | 9 + 4 |
| LINK-QUEBRADO | 5 |
| PENDÊNCIA declarada | 6 |
| BLOQUEADO / disabled fixo | 4 |
| STUB | 1 (afeta 2 páginas de BI) |
| RANDOM em métrica | 3 |
| TABELA-AUSENTE | 1 |
| RPC ausente / edge inexistente | 0 / 2 (via invoke dinâmico; ver §12.4) |

## Top 20 por impacto de negócio

1. **Cotação "Enviar" não envia nada** (`QuoteCard.tsx:119`; `send-quote-to-client` sem chamador). O status vira `sent` sem o cliente receber.
2. **WhatsApp em /vendas registra "sent" sem enviar** (`useWhatsApp.ts:11`).
3. **"Enviar Agora" do e-mail IA só mostra toast** (`AIEmailDialog.tsx:108`).
4. **BI Closer e BI SDR com cards de comparação e histórico vazios** por stubs que sombreiam os componentes reais (`components/bi/index.tsx:17-40`).
5. **Client 360: ações de follow-up, oportunidade, lembrete e sincronização ERP são falsas** (`Client360*`).
6. **Dashboard SDR quase todo fictício:** lead score, sequências, recomendações, sentimento e 5 botões mortos da command bar.
7. **Velocímetro do /dashboard inventa números por período** (multiplicador × `Math.random`, `Speedometer.tsx:288`).
8. **Pipeline de gravação de chamadas (upload, transcrição, diarização) inacessível:** a página não está roteada.
9. **Validação de CNPJ alfanumérico não implementada** (`brDocuments.ts:110`). Bloqueia cadastro de novos CNPJs em 2026.
10. **Assinatura digital sem provedor:** envio e confirmação bloqueados.
11. **Fila de aprovação de cadência e gerenciador de templates são mock e não persistem** (`ApprovalQueue`, `CadenceTemplateManager`).
12. **Painel de risco de churn em /analytics mostra sempre clientes fictícios** (`ChurnPredictionPanel` sem props), e o diálogo de CS tem fatores fixos.
13. **/inteligencia é maquete integral:** Cockpit, relatório executivo, recomendações, tendências e grafo.
14. **Price Guard mostra "3 incidentes críticos" fictícios** (`MarginAlertsCard`), e as exportações de pricing são botões mortos.
15. **"One-Click Strategy" afirma criar workflows e não cria nada** (`PredictiveScenarioPlanner.tsx:143`).
16. **Análise ABC e "Cliente × indústria" com insights, clientes e valores fixos** (`useABCAnalysis`, `useClientVsIndustry`).
17. **Restrição de feature flag por papel não implementada** (`useFeatureFlags.ts:75`).
18. **Controles de segurança construídos e não expostos:** bloqueio de IP, rate limit, reautenticação, dispositivos conhecidos e RoleManager.
19. **Deal health, comitê de compra e velocity construídos e não montados** (17 componentes; `predict-deal-velocity` órfã), e o NBA do deal tem botões mortos.
20. **Onboarding de clientes (/onboarding-tracking) é estado local com clientes fictícios**, sem persistência.
