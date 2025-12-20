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
import Index from "./pages/Index";
import Vendas from "./pages/Vendas";
import Clientes from "./pages/Clientes";
import Produtos from "./pages/Produtos";
import Relatorios from "./pages/Relatorios";
import Vendedores from "./pages/Vendedores";
import VendedorDashboard from "./pages/VendedorDashboard";
import Analytics from "./pages/Analytics";
import Notificacoes from "./pages/Notificacoes";
import Pipeline from "./pages/Pipeline";
import Tarefas from "./pages/Tarefas";
import Playbooks from "./pages/Playbooks";
import SDRDashboard from "./pages/SDRDashboard";
import CloserDashboard from "./pages/CloserDashboard";
import Atividades from "./pages/Atividades";
import Cadencias from "./pages/Cadencias";
import Metas from "./pages/Metas";
import FonteLeads from "./pages/FonteLeads";
import RelatorioAtividades from "./pages/RelatorioAtividades";
import MetasAtividades from "./pages/MetasAtividades";
import RankingCompetitivo from "./pages/RankingCompetitivo";
import Configuracoes from "./pages/Configuracoes";
import AnimacoesDemo from "./pages/AnimacoesDemo";
import Times from "./pages/Times";
import Bitrix24 from "./pages/Bitrix24";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import AccessDenied from "./pages/AccessDenied";
import Portfolio from "./pages/Portfolio";
import ICP from "./pages/ICP";
import AdminDashboard from "./pages/AdminDashboard";
import Assistente from "./pages/Assistente";
import BIVendedor from "./pages/BIVendedor";
import BIGestor from "./pages/BIGestor";
import DesafiosSemanais from "./pages/DesafiosSemanais";
import HistoricoDesafiosDiarios from "./pages/HistoricoDesafiosDiarios";

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
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/*"
                element={
                  <MainLayout>
                    <ErrorBoundary>
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
                    </ErrorBoundary>
                  </MainLayout>
                }
              />
            </Routes>
          </AuthProvider>
          <QueryPerformancePanel />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </HelmetProvider>
  </PageErrorBoundary>
);

export default App;
