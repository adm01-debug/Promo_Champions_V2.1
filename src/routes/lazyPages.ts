import { lazy } from "react";

// ─── Auth & System ──────────────────────────────────────────────────
export const Auth = lazy(() => import("@/pages/Auth"));
export const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
export const NotFound = lazy(() => import("@/pages/NotFound"));
export const AccessDenied = lazy(() => import("@/pages/AccessDenied"));

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
export const Tarefas = lazy(() => import("@/pages/Tarefas"));
export const ICP = lazy(() => import("@/pages/ICP"));
export const FonteLeads = lazy(() => import("@/pages/FonteLeads"));
export const Playbooks = lazy(() => import("@/pages/Playbooks"));
export const FollowUpInteligente = lazy(() => import("@/pages/FollowUpInteligente"));
export const LeadScoring = lazy(() => import("@/pages/LeadScoring"));
export const Multichannel = lazy(() => import("@/pages/Multichannel"));
export const EmailTracking = lazy(() => import("@/pages/EmailTracking"));
export const Automacoes = lazy(() => import("@/pages/Automacoes"));

// ─── Vendas & Comercial ─────────────────────────────────────────────
export const Orcamentos = lazy(() => import("@/pages/Orcamentos"));
export const AssinaturaDigital = lazy(() => import("@/pages/AssinaturaDigital"));
export const Fornecedores = lazy(() => import("@/pages/Fornecedores"));
export const ComparadorPrecos = lazy(() => import("@/pages/ComparadorPrecos"));
export const Comissoes = lazy(() => import("@/pages/Comissoes"));
export const Agenda = lazy(() => import("@/pages/Agenda"));
export const AdminComissoes = lazy(() => import("@/pages/AdminComissoes"));
export const ApprovalWorkflows = lazy(() => import("@/pages/ApprovalWorkflowsPage"));

// ─── Analytics & BI ─────────────────────────────────────────────────
export const Analytics = lazy(() => import("@/pages/Analytics"));
export const Relatorios = lazy(() => import("@/pages/Relatorios"));
export const BIVendedor = lazy(() => import("@/pages/BIVendedor"));
export const BIGestor = lazy(() => import("@/pages/BIGestor"));
export const BISDR = lazy(() => import("@/pages/BISDR"));
export const BICloser = lazy(() => import("@/pages/BICloser"));
export const RelatorioAtividades = lazy(() => import("@/pages/RelatorioAtividades"));
export const RelatoriosEmail = lazy(() => import("@/pages/RelatoriosEmail"));
export const RelatoriosExecutivos = lazy(() => import("@/pages/RelatoriosExecutivos"));
export const ScheduledReports = lazy(() => import("@/pages/ScheduledReports"));
export const ROIDashboard = lazy(() => import("@/pages/ROIDashboard"));
export const ForecastPonderado = lazy(() => import("@/pages/ForecastPonderado"));
export const PrevisaoDemanda = lazy(() => import("@/pages/PrevisaoDemanda"));
export const FunnelAnalysis = lazy(() => import("@/pages/FunnelAnalysis"));
export const TopProductsRanking = lazy(() => import("@/pages/TopProductsRanking"));
export const PriceEvolution = lazy(() => import("@/pages/PriceEvolution"));
export const CategoryMetrics = lazy(() => import("@/pages/CategoryMetrics"));
export const HistoricalBenchmark = lazy(() => import("@/pages/HistoricalBenchmark"));
export const ClientHealthScore = lazy(() => import("@/pages/ClientHealthScore"));

// ─── Gamificação & Social ───────────────────────────────────────────
export const RankingCompetitivo = lazy(() => import("@/pages/RankingCompetitivo"));
export const ArenaCompetitiva = lazy(() => import("@/pages/ArenaCompetitiva"));
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
export const Notificacoes = lazy(() => import("@/pages/Notificacoes"));
export const Configuracoes = lazy(() => import("@/pages/Configuracoes"));

// ─── Admin ──────────────────────────────────────────────────────────
export const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
export const AdminTelemetria = lazy(() => import("@/pages/AdminTelemetria"));
export const UsageAnalytics = lazy(() => import("@/pages/UsageAnalytics"));
export const FeatureFlagsAdmin = lazy(() => import("@/pages/FeatureFlagsAdmin"));
export const SecurityDashboard = lazy(() => import("@/pages/SecurityDashboard"));
