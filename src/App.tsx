import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { QueryPerformancePanel } from "@/components/debug/QueryPerformancePanel";
import { PageErrorBoundary } from "@/components/errors/PageErrorBoundary";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";

// Generic page loading fallback
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

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Vendas = lazy(() => import("./pages/Vendas"));
const Clientes = lazy(() => import("./pages/Clientes"));
const Produtos = lazy(() => import("./pages/Produtos"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const Vendedores = lazy(() => import("./pages/Vendedores"));
const VendedorDashboard = lazy(() => import("./pages/VendedorDashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Notificacoes = lazy(() => import("./pages/Notificacoes"));
const Pipeline = lazy(() => import("./pages/Pipeline"));
const Tarefas = lazy(() => import("./pages/Tarefas"));
const Playbooks = lazy(() => import("./pages/Playbooks"));
const SDRDashboard = lazy(() => import("./pages/SDRDashboard"));
const CloserDashboard = lazy(() => import("./pages/CloserDashboard"));
const Atividades = lazy(() => import("./pages/Atividades"));
const Cadencias = lazy(() => import("./pages/Cadencias"));
const Metas = lazy(() => import("./pages/Metas"));
const FonteLeads = lazy(() => import("./pages/FonteLeads"));
const RelatorioAtividades = lazy(() => import("./pages/RelatorioAtividades"));
const MetasAtividades = lazy(() => import("./pages/MetasAtividades"));
const RankingCompetitivo = lazy(() => import("./pages/RankingCompetitivo"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const AnimacoesDemo = lazy(() => import("./pages/AnimacoesDemo"));
const Times = lazy(() => import("./pages/Times"));
const Bitrix24 = lazy(() => import("./pages/Bitrix24"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AccessDenied = lazy(() => import("./pages/AccessDenied"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const ICP = lazy(() => import("./pages/ICP"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Assistente = lazy(() => import("./pages/Assistente"));
const BIVendedor = lazy(() => import("./pages/BIVendedor"));
const BIGestor = lazy(() => import("./pages/BIGestor"));
const DesafiosSemanais = lazy(() => import("./pages/DesafiosSemanais"));
const HistoricoDesafiosDiarios = lazy(() => import("./pages/HistoricoDesafiosDiarios"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes - data considered fresh
      gcTime: 1000 * 60 * 10, // 10 minutes - cache retention
      refetchOnWindowFocus: false, // Don't refetch on tab focus
      refetchOnReconnect: true, // Refetch on network reconnect
      retry: 1, // Single retry on failure
      refetchInterval: false, // Disable automatic refetching by default
    },
  },
});

const App = () => (
  <PageErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
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
                            <ProtectedRoute requireAdminOrManager>
                              <Relatorios />
                            </ProtectedRoute>
                          } />
                          <Route path="/vendedores" element={
                            <ProtectedRoute requireAdminOrManager>
                              <Vendedores />
                            </ProtectedRoute>
                          } />
                          <Route path="/vendedor/:id" element={<VendedorDashboard />} />
                          <Route path="/analytics" element={
                            <ProtectedRoute requireAdminOrManager>
                              <Analytics />
                            </ProtectedRoute>
                          } />
                          <Route path="/notificacoes" element={<Notificacoes />} />
                          <Route path="/pipeline" element={<Pipeline />} />
                          <Route path="/tarefas" element={<Tarefas />} />
                          <Route path="/playbooks" element={
                            <ProtectedRoute requireAdminOrManager>
                              <Playbooks />
                            </ProtectedRoute>
                          } />
                          <Route path="/sdr" element={<SDRDashboard />} />
                          <Route path="/closer" element={<CloserDashboard />} />
                          <Route path="/atividades" element={<Atividades />} />
                          <Route path="/cadencias" element={<Cadencias />} />
                          <Route path="/metas" element={
                            <ProtectedRoute requireAdminOrManager>
                              <Metas />
                            </ProtectedRoute>
                          } />
                          <Route path="/fonte-leads" element={
                            <ProtectedRoute requireAdminOrManager>
                              <FonteLeads />
                            </ProtectedRoute>
                          } />
                          <Route path="/relatorio-atividades" element={
                            <ProtectedRoute requireAdminOrManager>
                              <RelatorioAtividades />
                            </ProtectedRoute>
                          } />
                          <Route path="/metas-atividades" element={<MetasAtividades />} />
                          <Route path="/ranking" element={<RankingCompetitivo />} />
                          <Route path="/configuracoes" element={<Configuracoes />} />
                          <Route path="/animacoes" element={<AnimacoesDemo />} />
                          <Route path="/times" element={
                            <ProtectedRoute requireAdminOrManager>
                              <Times />
                            </ProtectedRoute>
                          } />
                          <Route path="/bitrix24" element={
                            <ProtectedRoute requireAdminOrManager>
                              <Bitrix24 />
                            </ProtectedRoute>
                          } />
                          <Route path="/acesso-negado" element={<AccessDenied />} />
                          <Route path="/portfolio" element={
                            <ProtectedRoute requireAdminOrManager>
                              <Portfolio />
                            </ProtectedRoute>
                          } />
                          <Route path="/icp" element={
                            <ProtectedRoute requireAdminOrManager>
                              <ICP />
                            </ProtectedRoute>
                          } />
                          <Route path="/admin" element={<AdminDashboard />} />
                          <Route path="/assistente" element={<Assistente />} />
                          <Route path="/bi-vendedor" element={<BIVendedor />} />
                          <Route path="/bi-gestor" element={
                            <ProtectedRoute requireAdminOrManager>
                              <BIGestor />
                            </ProtectedRoute>
                          } />
                          <Route path="/desafios" element={<DesafiosSemanais />} />
                          <Route path="/desafios-diarios" element={<HistoricoDesafiosDiarios />} />
                          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                  </MainLayout>
                }
              />
            </Routes>
            </Suspense>
          </AuthProvider>
          <QueryPerformancePanel />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </HelmetProvider>
  </PageErrorBoundary>
);

export default App;
