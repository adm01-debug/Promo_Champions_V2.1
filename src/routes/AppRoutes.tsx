import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import Index from "@/pages/Index";

const PageLoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md p-8">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl mt-4" />
    </div>
  </div>
);

// Lazy load all pages
const Vendas = lazy(() => import("@/pages/Vendas"));
const Clientes = lazy(() => import("@/pages/Clientes"));
const Produtos = lazy(() => import("@/pages/Produtos"));
const Relatorios = lazy(() => import("@/pages/Relatorios"));
const Vendedores = lazy(() => import("@/pages/Vendedores"));
const VendedorDashboard = lazy(() => import("@/pages/VendedorDashboard"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Notificacoes = lazy(() => import("@/pages/Notificacoes"));
const Pipeline = lazy(() => import("@/pages/Pipeline"));
const Tarefas = lazy(() => import("@/pages/Tarefas"));
const Playbooks = lazy(() => import("@/pages/Playbooks"));
const SDRDashboard = lazy(() => import("@/pages/SDRDashboard"));
const CloserDashboard = lazy(() => import("@/pages/CloserDashboard"));
const Atividades = lazy(() => import("@/pages/Atividades"));
const Cadencias = lazy(() => import("@/pages/Cadencias"));
const Metas = lazy(() => import("@/pages/Metas"));
const FonteLeads = lazy(() => import("@/pages/FonteLeads"));
const RelatorioAtividades = lazy(() => import("@/pages/RelatorioAtividades"));
const MetasAtividades = lazy(() => import("@/pages/MetasAtividades"));
const RankingCompetitivo = lazy(() => import("@/pages/RankingCompetitivo"));
const Configuracoes = lazy(() => import("@/pages/Configuracoes"));
const Times = lazy(() => import("@/pages/Times"));
const Bitrix24 = lazy(() => import("@/pages/Bitrix24"));
const Auth = lazy(() => import("@/pages/Auth"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AccessDenied = lazy(() => import("@/pages/AccessDenied"));
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const ICP = lazy(() => import("@/pages/ICP"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Assistente = lazy(() => import("@/pages/Assistente"));
const BIVendedor = lazy(() => import("@/pages/BIVendedor"));
const BIGestor = lazy(() => import("@/pages/BIGestor"));
const BISDR = lazy(() => import("@/pages/BISDR"));
const BICloser = lazy(() => import("@/pages/BICloser"));
const DesafiosSemanais = lazy(() => import("@/pages/DesafiosSemanais"));
const Territorios = lazy(() => import("@/pages/Territorios"));
const HistoricoDesafiosDiarios = lazy(() => import("@/pages/HistoricoDesafiosDiarios"));
const PrevisaoDemanda = lazy(() => import("@/pages/PrevisaoDemanda"));
const ForecastPonderado = lazy(() => import("@/pages/ForecastPonderado"));
const Calendario = lazy(() => import("@/pages/Calendario"));
const Fornecedores = lazy(() => import("@/pages/Fornecedores"));
const ComparadorPrecos = lazy(() => import("@/pages/ComparadorPrecos"));
const AssinaturaDigital = lazy(() => import("@/pages/AssinaturaDigital"));
const Orcamentos = lazy(() => import("@/pages/Orcamentos"));
const Automacoes = lazy(() => import("@/pages/Automacoes"));
const EmailTracking = lazy(() => import("@/pages/EmailTracking"));
const DashboardCustom = lazy(() => import("@/pages/DashboardCustom"));
const KanbanClientes = lazy(() => import("@/pages/KanbanClientes"));
const RelatoriosEmail = lazy(() => import("@/pages/RelatoriosEmail"));
const ROIDashboard = lazy(() => import("@/pages/ROIDashboard"));
const ArenaCompetitiva = lazy(() => import("@/pages/ArenaCompetitiva"));
const FollowUpInteligente = lazy(() => import("@/pages/FollowUpInteligente"));
const RelatoriosExecutivos = lazy(() => import("@/pages/RelatoriosExecutivos"));
const MapaClientes = lazy(() => import("@/pages/MapaClientes"));
const AdminTelemetria = lazy(() => import("@/pages/AdminTelemetria"));
const LeadScoring = lazy(() => import("@/pages/LeadScoring"));

export { PageLoadingFallback };

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/*"
          element={
            <MainLayout>
              <ErrorBoundary>
                <Suspense fallback={<PageLoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/vendas" element={<Vendas />} />
                    <Route path="/clientes" element={<Clientes />} />
                    <Route path="/produtos" element={<Produtos />} />
                    <Route path="/relatorios" element={
                      <ProtectedRoute requireAdminOrManager><Relatorios /></ProtectedRoute>
                    } />
                    <Route path="/vendedores" element={
                      <ProtectedRoute requireAdminOrManager><Vendedores /></ProtectedRoute>
                    } />
                    <Route path="/vendedor/:id" element={<VendedorDashboard />} />
                    <Route path="/analytics" element={
                      <ProtectedRoute requireAdminOrManager><Analytics /></ProtectedRoute>
                    } />
                    <Route path="/notificacoes" element={<Notificacoes />} />
                    <Route path="/pipeline" element={<Pipeline />} />
                    <Route path="/tarefas" element={<Tarefas />} />
                    <Route path="/playbooks" element={
                      <ProtectedRoute requireAdminOrManager><Playbooks /></ProtectedRoute>
                    } />
                    <Route path="/sdr" element={<SDRDashboard />} />
                    <Route path="/closer" element={<CloserDashboard />} />
                    <Route path="/atividades" element={<Atividades />} />
                    <Route path="/cadencias" element={<Cadencias />} />
                    <Route path="/metas" element={
                      <ProtectedRoute requireAdminOrManager><Metas /></ProtectedRoute>
                    } />
                    <Route path="/fonte-leads" element={
                      <ProtectedRoute requireAdminOrManager><FonteLeads /></ProtectedRoute>
                    } />
                    <Route path="/relatorio-atividades" element={
                      <ProtectedRoute requireAdminOrManager><RelatorioAtividades /></ProtectedRoute>
                    } />
                    <Route path="/metas-atividades" element={<MetasAtividades />} />
                    <Route path="/ranking" element={<RankingCompetitivo />} />
                    <Route path="/configuracoes" element={<Configuracoes />} />
                    <Route path="/times" element={
                      <ProtectedRoute requireAdminOrManager><Times /></ProtectedRoute>
                    } />
                    <Route path="/bitrix24" element={
                      <ProtectedRoute requireAdminOrManager><Bitrix24 /></ProtectedRoute>
                    } />
                    <Route path="/acesso-negado" element={<AccessDenied />} />
                    <Route path="/portfolio" element={
                      <ProtectedRoute requireAdminOrManager><Portfolio /></ProtectedRoute>
                    } />
                    <Route path="/icp" element={
                      <ProtectedRoute requireAdminOrManager><ICP /></ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                      <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
                    } />
                    <Route path="/admin/telemetria" element={
                      <ProtectedRoute requireAdminOrManager><AdminTelemetria /></ProtectedRoute>
                    } />
                    <Route path="/assistente" element={<Assistente />} />
                    <Route path="/bi-vendedor" element={<BIVendedor />} />
                    <Route path="/bi-sdr" element={<BISDR />} />
                    <Route path="/bi-closer" element={<BICloser />} />
                    <Route path="/bi-gestor" element={
                      <ProtectedRoute requireAdminOrManager><BIGestor /></ProtectedRoute>
                    } />
                    <Route path="/desafios" element={<DesafiosSemanais />} />
                    <Route path="/desafios-diarios" element={<HistoricoDesafiosDiarios />} />
                    <Route path="/previsao-demanda" element={
                      <ProtectedRoute requireAdminOrManager><PrevisaoDemanda /></ProtectedRoute>
                    } />
                    <Route path="/forecast" element={
                      <ProtectedRoute requireAdminOrManager><ForecastPonderado /></ProtectedRoute>
                    } />
                    <Route path="/calendario" element={<Calendario />} />
                    <Route path="/fornecedores" element={
                      <ProtectedRoute requireAdminOrManager><Fornecedores /></ProtectedRoute>
                    } />
                    <Route path="/comparador-precos" element={
                      <ProtectedRoute requireAdminOrManager><ComparadorPrecos /></ProtectedRoute>
                    } />
                    <Route path="/assinatura-digital" element={
                      <ProtectedRoute requireAdminOrManager><AssinaturaDigital /></ProtectedRoute>
                    } />
                    <Route path="/orcamentos" element={<Orcamentos />} />
                    <Route path="/automacoes" element={<Automacoes />} />
                    <Route path="/email-tracking" element={<EmailTracking />} />
                    <Route path="/dashboard-custom" element={<DashboardCustom />} />
                    <Route path="/kanban-clientes" element={<KanbanClientes />} />
                    <Route path="/relatorios-email" element={<RelatoriosEmail />} />
                    <Route path="/roi" element={
                      <ProtectedRoute requireAdminOrManager><ROIDashboard /></ProtectedRoute>
                    } />
                    <Route path="/arena" element={<ArenaCompetitiva />} />
                    <Route path="/follow-up" element={<FollowUpInteligente />} />
                    <Route path="/territorios" element={<Territorios />} />
                    <Route path="/mapa-clientes" element={<MapaClientes />} />
                    <Route path="/relatorios-executivos" element={
                      <ProtectedRoute requireAdminOrManager><RelatoriosExecutivos /></ProtectedRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </MainLayout>
          }
        />
      </Routes>
    </Suspense>
  );
}
