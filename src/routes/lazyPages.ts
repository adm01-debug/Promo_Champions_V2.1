import { lazy } from "react";

// ─── Auth & System ──────────────────────────────────────────────────
export const Auth = lazy(() => import("@/pages/Auth"));
export const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
export const NotFound = lazy(() => import("@/pages/NotFound"));
export const AccessDenied = lazy(() => import("@/pages/AccessDenied"));
export const Docs = lazy(() => import("@/pages/Docs"));

// ─── Dashboards ─────────────────────────────────────────────────────
export const SDRDashboard = lazy(() => import("@/pages/SDRDashboard"));
export const CloserDashboard = lazy(() => import("@/pages/CloserDashboard"));
export const DashboardCustom = lazy(() => import("@/pages/DashboardCustom"));
export const VendedorDashboard = lazy(() => import("@/pages/VendedorDashboard"));

// ─── CRM Core ───────────────────────────────────────────────────────
export const Vendas = lazy(() => import("@/pages/Vendas"));
export const Clientes = lazy(() => import("@/pages/Clientes"));
export const Produtos = lazy(() => import("@/pages/Produtos"));
export const Pipeline = lazy(() => import("@/pages/Pipeline"));
export const KanbanClientes = lazy(() => import("@/pages/KanbanClientes"));
export const MapaClientes = lazy(() => import("@/pages/MapaClientes"));
export const Calendario = lazy(() => import("@/pages/Calendario"));
export const Portfolio = lazy(() => import("@/pages/Portfolio"));

// ─── Prospecção & Atividades ────────────────────────────────────────
export const Atividades = lazy(() => import("@/pages/Atividades"));
export const Cadencias = lazy(() => import("@/pages/Cadencias"));
export const QuoteCadencias = lazy(() => import("@/pages/QuoteCadencesPage"));
export const Tarefas = lazy(() => import("@/pages/Tarefas"));
export const ICP = lazy(() => import("@/pages/ICP"));
export const FonteLeads = lazy(() => import("@/pages/FonteLeads"));
export const Playbooks = lazy(() => import("@/pages/Playbooks"));
export const FollowUpInteligente = lazy(() => import("@/pages/FollowUpInteligente"));
export const FollowUpAudit = lazy(() => import("@/pages/FollowUpAudit"));
export const Sequences = lazy(() => import("@/pages/SequencesPage"));
export const BulkComposer = lazy(() => import("@/pages/BulkComposer"));
export const SendTimeOptimization = lazy(() => import("@/pages/SendTimeOptimization"));
export const EmailEngagementScoring = lazy(() => import("@/pages/EmailEngagementScoring"));
export const PowerDialer = lazy(() => import("@/pages/PowerDialer"));
export const LeadScoring = lazy(() => import("@/pages/LeadScoring"));
export const Multichannel = lazy(() => import("@/pages/Multichannel"));
export const EmailTracking = lazy(() => import("@/pages/EmailTracking"));
export const Automacoes = lazy(() => import("@/pages/Automacoes"));
export const ConversationalIntelligence = lazy(() => import("@/pages/ConversationalIntelligenceHub"));
export const RevenueIntelligence = lazy(() => import("@/pages/RevenueIntelligence"));
export const RevenueForecast = lazy(() => import("@/pages/RevenueForecast"));
export const AccountBasedSelling = lazy(() => import("@/pages/AccountBasedSelling"));
export const AccountBasedEngagement = lazy(() => import("@/pages/AccountBasedEngagement"));
export const AccountDetail = lazy(() => import("@/pages/AccountDetail"));
export const AutomationBuilder = lazy(() => import("@/pages/AutomationBuilder"));
export const AutomacaoInteligente = lazy(() => import("@/pages/AutomacaoInteligente"));

// ─── Vendas & Comercial ─────────────────────────────────────────────
export const Orcamentos = lazy(() => import("@/pages/Orcamentos"));
export const AssinaturaDigital = lazy(() => import("@/pages/AssinaturaDigital"));
export const Fornecedores = lazy(() => import("@/pages/Fornecedores"));
export const ComparadorPrecos = lazy(() => import("@/pages/ComparadorPrecos"));
export const Comissoes = lazy(() => import("@/pages/Comissoes"));
export const Agenda = lazy(() => import("@/pages/Agenda"));
export const AdminComissoes = lazy(() => import("@/pages/AdminComissoes"));
export const ApprovalWorkflows = lazy(() => import("@/pages/ApprovalWorkflowsPage"));
export const CommissionRules = lazy(() => import("@/pages/CommissionRules"));
export const Webhooks = lazy(() => import("@/pages/WebhooksPage"));
export const AuditLogs = lazy(() => import("@/pages/AuditLogsPage"));
export const SLATracking = lazy(() => import("@/pages/SLATrackingPage"));
export const LeadRouting = lazy(() => import("@/pages/LeadRoutingPage"));
export const Workflows = lazy(() => import("@/pages/WorkflowsPage"));

// ─── Analytics & BI ─────────────────────────────────────────────────
export const Analytics = lazy(() => import("@/pages/Analytics"));
export const Relatorios = lazy(() => import("@/pages/Relatorios"));
export const BIVendedor = lazy(() => import("@/pages/BIVendedor"));
export const BIGestor = lazy(() => import("@/pages/BIGestor"));
export const BISDR = lazy(() => import("@/pages/BISDR"));
export const BICloser = lazy(() => import("@/pages/BICloser"));
export const RelatorioAtividades = lazy(() => import("@/pages/RelatorioAtividades"));
export const RelatoriosEmail = lazy(() => import("@/pages/RelatoriosEmail"));
export const EmailAnalyticsPage = lazy(() => import("@/pages/EmailAnalyticsPage"));
export const RelatoriosExecutivos = lazy(() => import("@/pages/RelatoriosExecutivos"));
export const ScheduledReports = lazy(() => import("@/pages/ScheduledReports"));
export const CustomReports = lazy(() => import("@/pages/CustomReports"));
export const ROIDashboard = lazy(() => import("@/pages/ROIDashboard"));
export const ForecastPonderado = lazy(() => import("@/pages/ForecastPonderado"));
export const PrevisaoDemanda = lazy(() => import("@/pages/PrevisaoDemanda"));
export const FunnelAnalysis = lazy(() => import("@/pages/FunnelAnalysis"));
export const FunnelReport = lazy(() => import("@/pages/FunnelReportPage"));
export const CohortReport = lazy(() => import("@/pages/CohortReportPage"));
export const EmbedReport = lazy(() => import("@/pages/EmbedReportPage"));
export const TopProductsRanking = lazy(() => import("@/pages/TopProductsRanking"));
export const PriceEvolution = lazy(() => import("@/pages/PriceEvolution"));
export const CategoryMetrics = lazy(() => import("@/pages/CategoryMetrics"));
export const HistoricalBenchmark = lazy(() => import("@/pages/HistoricalBenchmark"));
export const ClientHealthScore = lazy(() => import("@/pages/ClientHealthScore"));
export const InteligenciaPreditiva = lazy(() => import("@/pages/InteligenciaPreditiva"));
export const PurchaseIntelligence = lazy(() => import("@/pages/PurchaseIntelligence"));
export const CoachingInteligente = lazy(() => import("@/pages/CoachingInteligente"));
export const RevOpsHub = lazy(() => import("@/pages/RevOpsHub"));
export const DealIntelligence = lazy(() => import("@/pages/DealIntelligence"));
export const WinLossIntelligence = lazy(() => import("@/pages/WinLossIntelligence"));
export const WinLossAnalysisPage = lazy(() => import("@/pages/WinLossAnalysisPage"));
export const ABCAnalysisPage = lazy(() => import("@/pages/ABCAnalysisPage"));
export const ClosingTimePage = lazy(() => import("@/pages/ClosingTimePage"));
export const DealVelocityPage = lazy(() => import("@/pages/DealVelocityPage"));
export const EvolutionCurvesPage = lazy(() => import("@/pages/EvolutionCurvesPage"));
export const ObjectionsLibraryPage = lazy(() => import("@/pages/ObjectionsLibraryPage"));
export const Intelligence = lazy(() => import("@/pages/Intelligence"));

// ─── Gamificação & Social ───────────────────────────────────────────
export const RankingCompetitivo = lazy(() => import("@/pages/RankingCompetitivo"));
export const ArenaCompetitiva = lazy(() => import("@/pages/ArenaCompetitiva"));
export const RaceArena = lazy(() => import("@/pages/RaceArenaHub"));
export const RaceArenaCloser = lazy(() => import("@/pages/RaceArenaCloser"));
export const RaceArenaSDR = lazy(() => import("@/pages/RaceArenaSDR"));
export const GamifiedProfilePage = lazy(() => import("@/pages/GamifiedProfilePage"));
export const BadgesGalleryPage = lazy(() => import("@/pages/BadgesGalleryPage"));
export const RaceArenaAdmin = lazy(() => import("@/pages/admin/RaceArenaAdmin"));
export const RaceArenaTV = lazy(() => import("@/pages/RaceArenaTV"));
export const RaceArenaGarage = lazy(() => import("@/pages/RaceArenaGarage"));
export const RaceArenaCareer = lazy(() => import("@/pages/RaceArenaCareer"));
export const DesafiosSemanais = lazy(() => import("@/pages/DesafiosSemanais"));
export const HistoricoDesafiosDiarios = lazy(() => import("@/pages/HistoricoDesafiosDiarios"));
export const VictoryFeedPage = lazy(() => import("@/pages/VictoryFeedPage"));
export const CompetitiveSeasonsAdmin = lazy(() => import("@/pages/CompetitiveSeasonsAdmin"));
export const TeamActivityFeed = lazy(() => import("@/pages/TeamActivityFeed"));

// ─── Gestão ─────────────────────────────────────────────────────────
export const Vendedores = lazy(() => import("@/pages/Vendedores"));
export const Metas = lazy(() => import("@/pages/Metas"));
export const MetasAtividades = lazy(() => import("@/pages/MetasAtividades"));
export const Times = lazy(() => import("@/pages/Times"));
export const Territorios = lazy(() => import("@/pages/Territorios"));
export const Estoque = lazy(() => import("@/pages/Estoque"));
export const NPSDashboard = lazy(() => import("@/pages/NPSDashboard"));
export const Deduplication = lazy(() => import("@/pages/Deduplication"));
export const ImportExport = lazy(() => import("@/pages/ImportExport"));
export const OnboardingTracking = lazy(() => import("@/pages/OnboardingTracking"));
export const InactivityTriggers = lazy(() => import("@/pages/InactivityTriggers"));
export const Bitrix24 = lazy(() => import("@/pages/Bitrix24"));

// ─── Ferramentas & IA ───────────────────────────────────────────────
export const Assistente = lazy(() => import("@/pages/Assistente"));
export const SmartSearch = lazy(() => import("@/pages/SmartSearch"));
export const AskAnything = lazy(() => import("@/pages/AskAnything"));
export const SemanticSearch = lazy(() => import("@/pages/SemanticSearch"));
export const AIAgents = lazy(() => import("@/pages/AIAgents"));
export const Notificacoes = lazy(() => import("@/pages/Notificacoes"));
export const Configuracoes = lazy(() => import("@/pages/Configuracoes"));

// ─── Admin ──────────────────────────────────────────────────────────
export const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
export const AdminTelemetria = lazy(() => import("@/pages/AdminTelemetria"));
export const UsageAnalytics = lazy(() => import("@/pages/UsageAnalytics"));
export const FeatureFlagsAdmin = lazy(() => import("@/pages/FeatureFlagsAdmin"));
export const SecurityDashboard = lazy(() => import("@/pages/SecurityDashboard"));
export const WebhooksDeadLettersAdmin = lazy(() => import("@/pages/admin/WebhooksDeadLettersAdmin"));
export const WebhookTimelinePage = lazy(() => import("@/pages/admin/WebhookTimelinePage"));
export const WebhookAlertHistoryPage = lazy(() => import("@/pages/admin/WebhookAlertHistoryPage"));
export const WebhookAlertSettingsPage = lazy(() => import("@/pages/admin/WebhookAlertSettingsPage"));
export const CustomerSuccessHubPage = lazy(() => import("@/pages/CustomerSuccessHub"));
export const SalesEnablementHubPage = lazy(() => import("@/pages/SalesEnablementHub"));
export const PricingIntelligenceHubPage = lazy(() => import("@/pages/PricingIntelligenceHub"));
export const TerritoryOptimizationHubPage = lazy(() => import("@/pages/TerritoryOptimizationHub"));
export const CustomerSuccess360Page = lazy(() => import("@/pages/CustomerSuccess360"));
export const AdminConexoesPage = lazy(() => import("@/pages/admin/AdminConexoesPage"));
export const AdminComercial = lazy(() => import("@/pages/admin/AdminComercial"));
export const Competencias = lazy(() => import("@/pages/Competencias"));
