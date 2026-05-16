import { lazy, Suspense } from "react";

/**
 * Enhanced Lazy Utility with Prefetch capabilities
 */
export const lazyWithPrefetch = (importStatement: () => Promise<any>) => {
  const Component = lazy(importStatement);
  (Component as any).prefetch = importStatement;
  return Component;
};

// ─── Auth & System ──────────────────────────────────────────────────
export const Auth = lazyWithPrefetch(() => import("@/pages/Auth"));
export const ResetPassword = lazyWithPrefetch(() => import("@/pages/ResetPassword"));
export const NotFound = lazyWithPrefetch(() => import("@/pages/NotFound"));
export const AccessDenied = lazyWithPrefetch(() => import("@/pages/AccessDenied"));
export const Docs = lazyWithPrefetch(() => import("@/pages/Docs"));

// ─── Dashboards ─────────────────────────────────────────────────────
export const SDRDashboard = lazyWithPrefetch(() => import("@/pages/SDRDashboard"));
export const CloserDashboard = lazyWithPrefetch(() => import("@/pages/CloserDashboard"));
export const DashboardCustom = lazyWithPrefetch(() => import("@/pages/DashboardCustom"));
export const VendedorDashboard = lazyWithPrefetch(() => import("@/pages/VendedorDashboard"));

// ─── CRM Core ───────────────────────────────────────────────────────
export const Vendas = lazyWithPrefetch(() => import("@/pages/Vendas"));
export const Clientes = lazyWithPrefetch(() => import("@/pages/Clientes"));
export const Produtos = lazyWithPrefetch(() => import("@/pages/Produtos"));
export const Pipeline = lazyWithPrefetch(() => import("@/pages/Pipeline"));
export const KanbanClientes = lazyWithPrefetch(() => import("@/pages/KanbanClientes"));
export const MapaClientes = lazyWithPrefetch(() => import("@/pages/MapaClientes"));
export const Calendario = lazyWithPrefetch(() => import("@/pages/Calendario"));
export const Portfolio = lazyWithPrefetch(() => import("@/pages/Portfolio"));

// ─── Prospecção & Atividades ────────────────────────────────────────
export const Atividades = lazyWithPrefetch(() => import("@/pages/Atividades"));
export const Cadencias = lazyWithPrefetch(() => import("@/pages/Cadencias"));
export const QuoteCadencias = lazyWithPrefetch(() => import("@/pages/QuoteCadencesPage"));
export const Tarefas = lazyWithPrefetch(() => import("@/pages/Tarefas"));
export const ICP = lazyWithPrefetch(() => import("@/pages/ICP"));
export const FonteLeads = lazyWithPrefetch(() => import("@/pages/FonteLeads"));
export const Playbooks = lazyWithPrefetch(() => import("@/pages/Playbooks"));
export const FollowUpInteligente = lazyWithPrefetch(() => import("@/pages/FollowUpInteligente"));
export const FollowUpAudit = lazyWithPrefetch(() => import("@/pages/FollowUpAudit"));
export const Sequences = lazyWithPrefetch(() => import("@/pages/SequencesPage"));
export const BulkComposer = lazyWithPrefetch(() => import("@/pages/BulkComposer"));
export const SendTimeOptimization = lazyWithPrefetch(() => import("@/pages/SendTimeOptimization"));
export const EmailEngagementScoring = lazyWithPrefetch(() => import("@/pages/EmailEngagementScoring"));
export const PowerDialer = lazyWithPrefetch(() => import("@/pages/PowerDialer"));
export const LeadScoring = lazyWithPrefetch(() => import("@/pages/LeadScoring"));
export const Multichannel = lazyWithPrefetch(() => import("@/pages/Multichannel"));
export const EmailTracking = lazyWithPrefetch(() => import("@/pages/EmailTracking"));
export const Automacoes = lazyWithPrefetch(() => import("@/pages/Automacoes"));
export const ConversationalIntelligence = lazyWithPrefetch(() => import("@/pages/ConversationalIntelligenceHub"));
export const RevenueIntelligence = lazyWithPrefetch(() => import("@/pages/RevenueIntelligence"));
export const RevenueForecast = lazyWithPrefetch(() => import("@/pages/RevenueForecast"));
export const AccountBasedSelling = lazyWithPrefetch(() => import("@/pages/AccountBasedSelling"));
export const AccountBasedEngagement = lazyWithPrefetch(() => import("@/pages/AccountBasedEngagement"));
export const AccountDetail = lazyWithPrefetch(() => import("@/pages/AccountDetail"));
export const AutomationBuilder = lazyWithPrefetch(() => import("@/pages/AutomationBuilder"));
export const AutomacaoInteligente = lazyWithPrefetch(() => import("@/pages/AutomacaoInteligente"));

// ─── Vendas & Comercial ─────────────────────────────────────────────
export const Orcamentos = lazyWithPrefetch(() => import("@/pages/Orcamentos"));
export const AssinaturaDigital = lazyWithPrefetch(() => import("@/pages/AssinaturaDigital"));
export const Fornecedores = lazyWithPrefetch(() => import("@/pages/Fornecedores"));
export const ComparadorPrecos = lazyWithPrefetch(() => import("@/pages/ComparadorPrecos"));
export const Comissoes = lazyWithPrefetch(() => import("@/pages/Comissoes"));
export const Agenda = lazyWithPrefetch(() => import("@/pages/Agenda"));
export const AdminComissoes = lazyWithPrefetch(() => import("@/pages/AdminComissoes"));
export const ApprovalWorkflows = lazyWithPrefetch(() => import("@/pages/ApprovalWorkflowsPage"));
export const CommissionRules = lazyWithPrefetch(() => import("@/pages/CommissionRules"));
export const Webhooks = lazyWithPrefetch(() => import("@/pages/WebhooksPage"));
export const AuditLogs = lazyWithPrefetch(() => import("@/pages/AuditLogsPage"));
export const SLATracking = lazyWithPrefetch(() => import("@/pages/SLATrackingPage"));
export const LeadRouting = lazyWithPrefetch(() => import("@/pages/LeadRoutingPage"));
export const Workflows = lazyWithPrefetch(() => import("@/pages/WorkflowsPage"));

// ─── Analytics & BI ─────────────────────────────────────────────────
export const Analytics = lazyWithPrefetch(() => import("@/pages/Analytics"));
export const Relatorios = lazyWithPrefetch(() => import("@/pages/Relatorios"));
export const BIVendedor = lazyWithPrefetch(() => import("@/pages/BIVendedor"));
export const BIGestor = lazyWithPrefetch(() => import("@/pages/BIGestor"));
export const BISDR = lazyWithPrefetch(() => import("@/pages/BISDR"));
export const BICloser = lazyWithPrefetch(() => import("@/pages/BICloser"));
export const RelatorioAtividades = lazyWithPrefetch(() => import("@/pages/RelatorioAtividades"));
export const RelatoriosEmail = lazyWithPrefetch(() => import("@/pages/RelatoriosEmail"));
export const EmailAnalyticsPage = lazyWithPrefetch(() => import("@/pages/EmailAnalyticsPage"));
export const RelatoriosExecutivos = lazyWithPrefetch(() => import("@/pages/RelatoriosExecutivos"));
export const ScheduledReports = lazyWithPrefetch(() => import("@/pages/ScheduledReports"));
export const CustomReports = lazyWithPrefetch(() => import("@/pages/CustomReports"));
export const ROIDashboard = lazyWithPrefetch(() => import("@/pages/ROIDashboard"));
export const ForecastPonderado = lazyWithPrefetch(() => import("@/pages/ForecastPonderado"));
export const PrevisaoDemanda = lazyWithPrefetch(() => import("@/pages/PrevisaoDemanda"));
export const FunnelAnalysis = lazyWithPrefetch(() => import("@/pages/FunnelAnalysis"));
export const FunnelReport = lazyWithPrefetch(() => import("@/pages/FunnelReportPage"));
export const CohortReport = lazyWithPrefetch(() => import("@/pages/CohortReportPage"));
export const EmbedReport = lazyWithPrefetch(() => import("@/pages/EmbedReportPage"));
export const TopProductsRanking = lazyWithPrefetch(() => import("@/pages/TopProductsRanking"));
export const PriceEvolution = lazyWithPrefetch(() => import("@/pages/PriceEvolution"));
export const CategoryMetrics = lazyWithPrefetch(() => import("@/pages/CategoryMetrics"));
export const HistoricalBenchmark = lazyWithPrefetch(() => import("@/pages/HistoricalBenchmark"));
export const ClientHealthScore = lazyWithPrefetch(() => import("@/pages/ClientHealthScore"));
export const InteligenciaPreditiva = lazyWithPrefetch(() => import("@/pages/InteligenciaPreditiva"));
export const PurchaseIntelligence = lazyWithPrefetch(() => import("@/pages/PurchaseIntelligence"));
export const CoachingInteligente = lazyWithPrefetch(() => import("@/pages/CoachingInteligente"));
export const RevOpsHub = lazyWithPrefetch(() => import("@/pages/RevOpsHub"));
export const DealIntelligence = lazyWithPrefetch(() => import("@/pages/DealIntelligence"));
export const WinLossIntelligence = lazyWithPrefetch(() => import("@/pages/WinLossIntelligence"));
export const WinLossAnalysisPage = lazyWithPrefetch(() => import("@/pages/WinLossAnalysisPage"));
export const ABCAnalysisPage = lazyWithPrefetch(() => import("@/pages/ABCAnalysisPage"));
export const ClosingTimePage = lazyWithPrefetch(() => import("@/pages/ClosingTimePage"));
export const DealVelocityPage = lazyWithPrefetch(() => import("@/pages/DealVelocityPage"));
export const EvolutionCurvesPage = lazyWithPrefetch(() => import("@/pages/EvolutionCurvesPage"));
export const ObjectionsLibraryPage = lazyWithPrefetch(() => import("@/pages/ObjectionsLibraryPage"));
export const Intelligence = lazyWithPrefetch(() => import("@/pages/Intelligence"));

// ─── Gamificação & Social ───────────────────────────────────────────
export const RankingCompetitivo = lazyWithPrefetch(() => import("@/pages/RankingCompetitivo"));
export const ArenaCompetitiva = lazyWithPrefetch(() => import("@/pages/ArenaCompetitiva"));
export const RaceArena = lazyWithPrefetch(() => import("@/pages/RaceArenaHub"));
export const RaceArenaCloser = lazyWithPrefetch(() => import("@/pages/RaceArenaCloser"));
export const RaceArenaSDR = lazyWithPrefetch(() => import("@/pages/RaceArenaSDR"));
export const GamifiedProfilePage = lazyWithPrefetch(() => import("@/pages/GamifiedProfilePage"));
export const BadgesGalleryPage = lazyWithPrefetch(() => import("@/pages/BadgesGalleryPage"));
export const RaceArenaAdmin = lazyWithPrefetch(() => import("@/pages/admin/RaceArenaAdmin"));
export const RaceArenaTV = lazyWithPrefetch(() => import("@/pages/RaceArenaTV"));
export const RaceArenaGarage = lazyWithPrefetch(() => import("@/pages/RaceArenaGarage"));
export const RaceArenaCareer = lazyWithPrefetch(() => import("@/pages/RaceArenaCareer"));
export const DesafiosSemanais = lazyWithPrefetch(() => import("@/pages/DesafiosSemanais"));
export const HistoricoDesafiosDiarios = lazyWithPrefetch(() => import("@/pages/HistoricoDesafiosDiarios"));
export const VictoryFeedPage = lazyWithPrefetch(() => import("@/pages/VictoryFeedPage"));
export const CompetitiveSeasonsAdmin = lazyWithPrefetch(() => import("@/pages/CompetitiveSeasonsAdmin"));
export const TeamActivityFeed = lazyWithPrefetch(() => import("@/pages/TeamActivityFeed"));

// ─── Gestão ─────────────────────────────────────────────────────────
export const Vendedores = lazyWithPrefetch(() => import("@/pages/Vendedores"));
export const Metas = lazyWithPrefetch(() => import("@/pages/Metas"));
export const MetasAtividades = lazyWithPrefetch(() => import("@/pages/MetasAtividades"));
export const Times = lazyWithPrefetch(() => import("@/pages/Times"));
export const Territorios = lazyWithPrefetch(() => import("@/pages/Territorios"));
export const Estoque = lazyWithPrefetch(() => import("@/pages/Estoque"));
export const NPSDashboard = lazyWithPrefetch(() => import("@/pages/NPSDashboard"));
export const Deduplication = lazyWithPrefetch(() => import("@/pages/Deduplication"));
export const ImportExport = lazyWithPrefetch(() => import("@/pages/ImportExport"));
export const OnboardingTracking = lazyWithPrefetch(() => import("@/pages/OnboardingTracking"));
export const InactivityTriggers = lazyWithPrefetch(() => import("@/pages/InactivityTriggers"));
export const Bitrix24 = lazyWithPrefetch(() => import("@/pages/Bitrix24"));

// ─── Ferramentas & IA ───────────────────────────────────────────────
export const Assistente = lazyWithPrefetch(() => import("@/pages/Assistente"));
export const SmartSearch = lazyWithPrefetch(() => import("@/pages/SmartSearch"));
export const AskAnything = lazyWithPrefetch(() => import("@/pages/AskAnything"));
export const SemanticSearch = lazyWithPrefetch(() => import("@/pages/SemanticSearch"));
export const AIAgents = lazyWithPrefetch(() => import("@/pages/AIAgents"));
export const Notificacoes = lazyWithPrefetch(() => import("@/pages/Notificacoes"));
export const Configuracoes = lazyWithPrefetch(() => import("@/pages/Configuracoes"));

// ─── Admin ──────────────────────────────────────────────────────────
export const AdminDashboard = lazyWithPrefetch(() => import("@/pages/AdminDashboard"));
export const AdminTelemetria = lazyWithPrefetch(() => import("@/pages/AdminTelemetria"));
export const UsageAnalytics = lazyWithPrefetch(() => import("@/pages/UsageAnalytics"));
export const FeatureFlagsAdmin = lazyWithPrefetch(() => import("@/pages/FeatureFlagsAdmin"));
export const SecurityDashboard = lazyWithPrefetch(() => import("@/pages/SecurityDashboard"));
export const WebhooksDeadLettersAdmin = lazyWithPrefetch(() => import("@/pages/admin/WebhooksDeadLettersAdmin"));
export const WebhookTimelinePage = lazyWithPrefetch(() => import("@/pages/admin/WebhookTimelinePage"));
export const WebhookAlertHistoryPage = lazyWithPrefetch(() => import("@/pages/admin/WebhookAlertHistoryPage"));
export const WebhookAlertSettingsPage = lazyWithPrefetch(() => import("@/pages/admin/WebhookAlertSettingsPage"));
export const CustomerSuccessHubPage = lazyWithPrefetch(() => import("@/pages/CustomerSuccessHub"));
export const SalesEnablementHubPage = lazyWithPrefetch(() => import("@/pages/SalesEnablementHub"));
export const PricingIntelligenceHubPage = lazyWithPrefetch(() => import("@/pages/PricingIntelligenceHub"));
export const TerritoryOptimizationHubPage = lazyWithPrefetch(() => import("@/pages/TerritoryOptimizationHub"));
export const CustomerSuccess360Page = lazyWithPrefetch(() => import("@/pages/CustomerSuccess360"));
export const AdminConexoesPage = lazyWithPrefetch(() => import("@/pages/admin/AdminConexoesPage"));
export const AdminComercial = lazyWithPrefetch(() => import("@/pages/admin/AdminComercial"));
export const Competencias = lazyWithPrefetch(() => import("@/pages/Competencias"));