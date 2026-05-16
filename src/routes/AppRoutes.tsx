import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/templates/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/transitions/PageTransition";
import { SmartSkeleton } from "@/components/skeletons/SmartSkeleton";
const Index = lazy(() => import("@/pages/Index"));
import { RaceTransitionWrapper } from "@/components/race";
const AdminTasksPage = lazy(() => import("@/pages/AdminTasksPage"));
const RaceSpectator = lazy(() => import("@/pages/RaceSpectator"));
const RetryTestStatusPage = lazy(() => import("@/pages/RetryTestStatusPage"));
const OrderDetailPage = lazy(() => import("@/pages/OrderDetailPage"));
const SalesReportPage = lazy(() => import("@/pages/SalesReportPage"));
import {
  // Auth & System
  Auth, ResetPassword, NotFound, AccessDenied, Docs,
  // Dashboards
  SDRDashboard, CloserDashboard, DashboardCustom, VendedorDashboard,
  // CRM Core
  Vendas, Clientes, Produtos, Pipeline, KanbanClientes, MapaClientes, Calendario, Portfolio,
  // Prospecção & Atividades
  Atividades, Cadencias, QuoteCadencias, Tarefas, ICP, FonteLeads, Playbooks, FollowUpInteligente, FollowUpAudit, Sequences, BulkComposer, SendTimeOptimization, EmailEngagementScoring, AccountBasedEngagement, AccountDetail, PowerDialer,
  LeadScoring, Multichannel, EmailTracking, Automacoes, ConversationalIntelligence, RevenueIntelligence, RevenueForecast, AccountBasedSelling, AutomationBuilder, AutomacaoInteligente,
  // Vendas & Comercial
  Orcamentos, AssinaturaDigital, Fornecedores, ComparadorPrecos, Comissoes, Agenda, AdminComissoes, CommissionRules, ApprovalWorkflows, Webhooks, AuditLogs, SLATracking, LeadRouting, Workflows,
  // Analytics & BI
  Analytics, Relatorios, BIVendedor, BIGestor, BISDR, BICloser,
  RelatorioAtividades, RelatoriosEmail, RelatoriosExecutivos, ScheduledReports, CustomReports,
  ROIDashboard, ForecastPonderado, PrevisaoDemanda, FunnelAnalysis, InteligenciaPreditiva,
  TopProductsRanking, PriceEvolution, CategoryMetrics, HistoricalBenchmark, ClientHealthScore, CoachingInteligente, RevOpsHub, FunnelReport, CohortReport, EmbedReport, PurchaseIntelligence, DealIntelligence, WinLossIntelligence, ABCAnalysisPage, ClosingTimePage, DealVelocityPage, EvolutionCurvesPage, ObjectionsLibraryPage, WinLossAnalysisPage, EmailAnalyticsPage, GamifiedProfilePage, BadgesGalleryPage, Intelligence,
  // Gamificação & Social
  RankingCompetitivo, ArenaCompetitiva, RaceArena, RaceArenaCloser, RaceArenaSDR, RaceArenaAdmin, RaceArenaTV, RaceArenaGarage, RaceArenaCareer, DesafiosSemanais, HistoricoDesafiosDiarios,
  VictoryFeedPage, CompetitiveSeasonsAdmin, TeamActivityFeed,
  // Gestão
  Vendedores, Metas, MetasAtividades, Times, Territorios, Estoque,
  NPSDashboard, Deduplication, ImportExport, OnboardingTracking, InactivityTriggers, Bitrix24,
  // Ferramentas & IA
  Assistente, Notificacoes, Configuracoes, SmartSearch, AskAnything, SemanticSearch, AIAgents,
  // Admin
  AdminDashboard, AdminTelemetria, UsageAnalytics, FeatureFlagsAdmin, SecurityDashboard, WebhooksDeadLettersAdmin, WebhookTimelinePage, WebhookAlertHistoryPage, WebhookAlertSettingsPage, AdminConexoesPage,
  AdminComercial, Competencias,
  CustomerSuccessHubPage, SalesEnablementHubPage, PricingIntelligenceHubPage, TerritoryOptimizationHubPage,
  CustomerSuccess360Page,
} from "./lazyPages";

const PageLoadingFallback = () => (
  <StaggeredContainer className="min-h-[400px] w-full bg-background/50">
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-2">
        <Shimmer className="h-8 w-64 rounded-lg" />
        <Shimmer className="h-4 w-96 rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
      </div>
      <div className="space-y-4">
        <ChartCardSkeleton className="w-full" />
        <div className="grid grid-cols-2 gap-4">
          <SkeletonCard className="w-full" />
          <SkeletonCard className="w-full" />
        </div>
      </div>
    </div>
  </StaggeredContainer>
);

export { PageLoadingFallback };

// Helper to wrap admin-only routes
const Admin = React.memo(({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
));
Admin.displayName = "AdminWrapper";

const Manager = React.memo(({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requireAdminOrManager>{children}</ProtectedRoute>
));
Manager.displayName = "ManagerWrapper";

export function AppRoutes() {
  return (
    <Suspense fallback={<SmartSkeleton />}>
      <Routes>
        {/* Public auth routes */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Public embedded report route (no layout, no auth) */}
        <Route path="/embed/report/:token" element={<EmbedReport />} />

        {/* Race Arena TV — fullscreen, sem MainLayout (autenticação herdada via ProtectedRoute) */}
        <Route path="/race-arena/tv" element={<ProtectedRoute><RaceArenaTV /></ProtectedRoute>} />

        {/* Race Arena Spectator — público, sem dados sensíveis */}
        <Route path="/race-arena/spectator/:seasonId" element={<RaceSpectator />} />

        {/* App routes within MainLayout — globally protected */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
              <ErrorBoundary>
                <Suspense fallback={null}>
                  <PageTransition>
                    <Routes>
                      {/* ─── Dashboards ────────────────────────────── */}
                      <Route path="/" element={<Navigate to="/dashboard/visao-geral" replace />} />
                      <Route path="/dashboard" element={<Index />} />
                      <Route path="/dashboard/:section" element={<Index />} />
                      <Route path="/dashboard/*" element={<NotFound />} />

                      <Route path="/sdr" element={<SDRDashboard />} />
                      <Route path="/closer" element={<CloserDashboard />} />
                      <Route path="/dashboard-custom" element={<DashboardCustom />} />
                      <Route path="/vendedor/:id" element={<VendedorDashboard />} />

                      <Route path="/docs" element={<Docs />} />

                      {/* ─── CRM Core ─────────────────────────────── */}
                      <Route path="/vendas" element={<Vendas />} />
                      <Route path="/clientes" element={<Clientes />} />
                      <Route path="/produtos" element={<Produtos />} />
                      <Route path="/pipeline" element={<Pipeline />} />
                      <Route path="/kanban-clientes" element={<KanbanClientes />} />
                      <Route path="/mapa-clientes" element={<MapaClientes />} />
                      <Route path="/calendario" element={<Calendario />} />
                      <Route path="/portfolio" element={<Manager><Portfolio /></Manager>} />

                      {/* ─── Prospecção & Atividades ───────────────── */}
                      <Route path="/atividades" element={<Atividades />} />
                      <Route path="/cadencias" element={<Cadencias />} />
                      <Route path="/cadencias-orcamentos" element={<QuoteCadencias />} />
                      <Route path="/tarefas" element={<Tarefas />} />
                      <Route path="/icp" element={<Manager><ICP /></Manager>} />
                      <Route path="/fonte-leads" element={<Manager><FonteLeads /></Manager>} />
                      <Route path="/playbooks" element={<Manager><Playbooks /></Manager>} />
                      <Route path="/follow-up" element={<FollowUpInteligente />} />
                      <Route path="/follow-up/audit" element={<Manager><FollowUpAudit /></Manager>} />
                      <Route path="/sequences" element={<Sequences />} />
                      <Route path="/engagement/bulk-composer" element={<BulkComposer />} />
                      <Route path="/engagement/send-time" element={<SendTimeOptimization />} />
                      <Route path="/engagement/email-scoring" element={<EmailEngagementScoring />} />
                      <Route path="/engagement/abm" element={<AccountBasedEngagement />} />
                      <Route path="/engagement/abm/:accountId" element={<AccountDetail />} />
                      <Route path="/engagement/dialer" element={<PowerDialer />} />
                      <Route path="/lead-scoring" element={<LeadScoring />} />
                      <Route path="/multichannel" element={<Multichannel />} />
                      <Route path="/email-tracking" element={<EmailTracking />} />
                      <Route path="/automacoes" element={<Automacoes />} />
                      <Route path="/conversational-intelligence" element={<ConversationalIntelligence />} />
                      <Route path="/revenue-intelligence" element={<Manager><RevenueIntelligence /></Manager>} />
                      <Route path="/revenue-forecast" element={<Manager><RevenueForecast /></Manager>} />
                      <Route path="/abm" element={<AccountBasedSelling />} />
                      <Route path="/workflow-builder" element={<Manager><AutomationBuilder /></Manager>} />
                      <Route path="/automacao-inteligente" element={<Manager><AutomacaoInteligente /></Manager>} />
                      <Route path="/coaching-inteligente" element={<Manager><CoachingInteligente /></Manager>} />

                      {/* ─── Vendas & Comercial ────────────────────── */}
                      <Route path="/orcamentos" element={<Orcamentos />} />
                      <Route path="/assinatura-digital" element={<Manager><AssinaturaDigital /></Manager>} />
                      <Route path="/fornecedores" element={<Manager><Fornecedores /></Manager>} />
                      <Route path="/comparador-precos" element={<Manager><ComparadorPrecos /></Manager>} />
                      <Route path="/comissoes" element={<Comissoes />} />
                      <Route path="/agenda" element={<Agenda />} />
                      <Route path="/admin/comissoes" element={<Manager><AdminComissoes /></Manager>} />
                      <Route path="/admin/regras-comissao" element={<Manager><CommissionRules /></Manager>} />
                      <Route path="/aprovacoes" element={<ApprovalWorkflows />} />
                      <Route path="/webhooks" element={<Manager><Webhooks /></Manager>} />
                      <Route path="/audit-logs" element={<Manager><AuditLogs /></Manager>} />
                      <Route path="/sla-tracking" element={<Manager><SLATracking /></Manager>} />
                      <Route path="/lead-routing" element={<Manager><LeadRouting /></Manager>} />
                      <Route path="/workflows" element={<Manager><Workflows /></Manager>} />

                      {/* ─── Analytics & BI ────────────────────────── */}
                      <Route path="/analytics" element={<Manager><Analytics /></Manager>} />
                      <Route path="/analytics/abc" element={<Manager><ABCAnalysisPage /></Manager>} />
                      <Route path="/analytics/closing-time" element={<Manager><ClosingTimePage /></Manager>} />
                      <Route path="/analytics/deal-velocity" element={<Manager><DealVelocityPage /></Manager>} />
                      <Route path="/analytics/evolution" element={<Manager><EvolutionCurvesPage /></Manager>} />
                      <Route path="/analytics/objections" element={<Manager><ObjectionsLibraryPage /></Manager>} />
                      <Route path="/analytics/win-loss" element={<Manager><WinLossAnalysisPage /></Manager>} />
                      <Route path="/relatorios" element={<Manager><Relatorios /></Manager>} />
                      <Route path="/bi-vendedor" element={<BIVendedor />} />
                      <Route path="/bi-sdr" element={<BISDR />} />
                      <Route path="/bi-closer" element={<BICloser />} />
                      <Route path="/bi-gestor" element={<Manager><BIGestor /></Manager>} />
                      <Route path="/relatorio-atividades" element={<Manager><RelatorioAtividades /></Manager>} />
                      <Route path="/relatorios-email" element={<RelatoriosEmail />} />
                      <Route path="/analytics/emails" element={<Manager><EmailAnalyticsPage /></Manager>} />
                      <Route path="/relatorios-executivos" element={<Manager><RelatoriosExecutivos /></Manager>} />
                      <Route path="/relatorios-agendados" element={<Manager><ScheduledReports /></Manager>} />
                      <Route path="/relatorios-custom" element={<CustomReports />} />
                      <Route path="/relatorios-custom/:id" element={<CustomReports />} />
                      <Route path="/roi" element={<Manager><ROIDashboard /></Manager>} />
                      <Route path="/forecast" element={<Manager><ForecastPonderado /></Manager>} />
                      <Route path="/previsao-demanda" element={<Manager><PrevisaoDemanda /></Manager>} />
                      <Route path="/inteligencia-preditiva" element={<InteligenciaPreditiva />} />
                      <Route path="/inteligencia-compras" element={<PurchaseIntelligence />} />
                      <Route path="/deal-intelligence" element={<DealIntelligence />} />
                      <Route path="/win-loss-intelligence" element={<WinLossIntelligence />} />
                      <Route path="/revops" element={<Manager><RevOpsHub /></Manager>} />
                      <Route path="/inteligencia" element={<Intelligence />} />
                      <Route path="/funil" element={<FunnelAnalysis />} />
                      <Route path="/relatorios/vendas" element={<ProtectedRoute><SalesReportPage /></ProtectedRoute>} />
                      <Route path="/relatorios/funil" element={<Manager><FunnelReport /></Manager>} />
                      <Route path="/relatorios/cohort" element={<Manager><CohortReport /></Manager>} />
                      <Route path="/top-produtos" element={<TopProductsRanking />} />
                      <Route path="/evolucao-precos" element={<Manager><PriceEvolution /></Manager>} />
                      <Route path="/metricas-categoria" element={<CategoryMetrics />} />
                      <Route path="/benchmarking" element={<HistoricalBenchmark />} />
                      <Route path="/health-score" element={<ClientHealthScore />} />
                      <Route path="/customer-success" element={<Manager><CustomerSuccessHubPage /></Manager>} />
                      <Route path="/sales-enablement" element={<SalesEnablementHubPage />} />
                      <Route path="/pricing-intelligence" element={<Manager><PricingIntelligenceHubPage /></Manager>} />
                      <Route path="/territory-optimization" element={<Manager><TerritoryOptimizationHubPage /></Manager>} />
                      <Route path="/customer-success-360" element={<Manager><CustomerSuccess360Page /></Manager>} />
                      <Route path="/competencias" element={<Competencias />} />

                      {/* ─── Gamificação & Social ──────────────────── */}
                      <Route path="/ranking" element={<RankingCompetitivo />} />
                      <Route path="/gamificacao/badges" element={<BadgesGalleryPage />} />
                      <Route path="/perfil-gamer" element={<GamifiedProfilePage />} />
                      <Route path="/arena" element={<ArenaCompetitiva />} />
                      <Route path="/race-arena" element={<RaceTransitionWrapper><RaceArena /></RaceTransitionWrapper>} />
                      <Route path="/race-arena/closer" element={<RaceTransitionWrapper><RaceArenaCloser /></RaceTransitionWrapper>} />
                      <Route path="/race-arena/sdr" element={<RaceTransitionWrapper><RaceArenaSDR /></RaceTransitionWrapper>} />
                      <Route path="/race-arena/garage" element={<RaceTransitionWrapper><RaceArenaGarage /></RaceTransitionWrapper>} />
                      <Route path="/race-arena/career" element={<RaceTransitionWrapper><RaceArenaCareer /></RaceTransitionWrapper>} />
                      <Route path="/admin/race-arena" element={<Admin><RaceArenaAdmin /></Admin>} />
                      <Route path="/desafios" element={<DesafiosSemanais />} />
                      <Route path="/desafios-diarios" element={<HistoricoDesafiosDiarios />} />
                      <Route path="/victory-feed" element={<VictoryFeedPage />} />
                      <Route path="/competitive-seasons" element={<Manager><CompetitiveSeasonsAdmin /></Manager>} />
                      <Route path="/team-activity" element={<TeamActivityFeed />} />

                      {/* ─── Gestão ────────────────────────────────── */}
                      <Route path="/vendedores" element={<Manager><Vendedores /></Manager>} />
                      <Route path="/metas" element={<Manager><Metas /></Manager>} />
                      <Route path="/metas-atividades" element={<MetasAtividades />} />
                      <Route path="/times" element={<Manager><Times /></Manager>} />
                      <Route path="/territorios" element={<Territorios />} />
                      <Route path="/estoque" element={<Manager><Estoque /></Manager>} />
                      <Route path="/nps" element={<NPSDashboard />} />
                      <Route path="/deduplicacao" element={<Manager><Deduplication /></Manager>} />
                      <Route path="/importar-exportar" element={<Manager><ImportExport /></Manager>} />
                      <Route path="/onboarding-tracking" element={<OnboardingTracking />} />
                      <Route path="/gatilhos-inatividade" element={<Manager><InactivityTriggers /></Manager>} />
                      <Route path="/bitrix24" element={<Manager><Bitrix24 /></Manager>} />

                      {/* ─── Ferramentas & IA ──────────────────────── */}
                      <Route path="/assistente" element={<Assistente />} />
                      <Route path="/perguntar" element={<AskAnything />} />
                      <Route path="/busca-inteligente" element={<SmartSearch />} />
                      <Route path="/busca" element={<SemanticSearch />} />
                      <Route path="/agentes" element={<AIAgents />} />
                      <Route path="/notificacoes" element={<Notificacoes />} />
                      <Route path="/configuracoes" element={<Configuracoes />} />

                      {/* ─── Admin ─────────────────────────────────── */}
                      <Route path="/admin" element={<Admin><AdminDashboard /></Admin>} />
                      <Route path="/admin/conexoes" element={<Admin><AdminConexoesPage /></Admin>} />
                      <Route path="/admin/telemetria" element={<Manager><AdminTelemetria /></Manager>} />
                      <Route path="/admin/comercial" element={<Manager><AdminComercial /></Manager>} />
                      <Route path="/usage-analytics" element={<Admin><UsageAnalytics /></Admin>} />
                      <Route path="/feature-flags" element={<Admin><FeatureFlagsAdmin /></Admin>} />
                      <Route path="/seguranca" element={<Admin><SecurityDashboard /></Admin>} />
                      <Route path="/admin/tarefas" element={<Admin><AdminTasksPage /></Admin>} />
                      <Route path="/admin/webhooks-dead-letters" element={<Admin><WebhooksDeadLettersAdmin /></Admin>} />
                      <Route path="/admin/webhooks-timeline" element={<Admin><WebhookTimelinePage /></Admin>} />
                      <Route path="/admin/webhooks-alert-history" element={<Admin><WebhookAlertHistoryPage /></Admin>} />
                      <Route path="/admin/webhooks-alert-settings" element={<Admin><WebhookAlertSettingsPage /></Admin>} />
                      <Route path="/admin/retry-test-status" element={<Admin><RetryTestStatusPage /></Admin>} />

                      {/* ─── Meus Pedidos ──────────────────────────── */}
                      <Route path="/meus-pedidos/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />

                      {/* ─── System ────────────────────────────────── */}
                      <Route path="/acesso-negado" element={<AccessDenied />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </PageTransition>
                </Suspense>
              </ErrorBoundary>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  </Suspense>
  );
}
