import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthProvider } from "@/contexts/AuthContext";
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
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/vendas" element={<Vendas />} />
                    <Route path="/clientes" element={<Clientes />} />
                    <Route path="/produtos" element={<Produtos />} />
                    <Route path="/relatorios" element={<Relatorios />} />
                    <Route path="/vendedores" element={<Vendedores />} />
                    <Route path="/vendedor/:id" element={<VendedorDashboard />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/notificacoes" element={<Notificacoes />} />
                    <Route path="/pipeline" element={<Pipeline />} />
                    <Route path="/tarefas" element={<Tarefas />} />
                    <Route path="/playbooks" element={<Playbooks />} />
                    <Route path="/sdr" element={<SDRDashboard />} />
                    <Route path="/closer" element={<CloserDashboard />} />
                    <Route path="/atividades" element={<Atividades />} />
                    <Route path="/cadencias" element={<Cadencias />} />
                    <Route path="/metas" element={<Metas />} />
                    <Route path="/fonte-leads" element={<FonteLeads />} />
                    <Route path="/relatorio-atividades" element={<RelatorioAtividades />} />
                    <Route path="/metas-atividades" element={<MetasAtividades />} />
                    <Route path="/ranking" element={<RankingCompetitivo />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </MainLayout>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
