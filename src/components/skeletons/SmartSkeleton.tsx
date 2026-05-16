import { FC, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  DashboardLoadingSkeleton,
  VendedorDashboardLoadingSkeleton,
  AnalyticsLoadingSkeleton,
  PipelineLoadingSkeleton,
  RankingLoadingSkeleton,
  SDRDashboardLoadingSkeleton,
  CloserDashboardLoadingSkeleton,
  MetasLoadingSkeleton,
  PlaybooksLoadingSkeleton,
  CadenciasLoadingSkeleton,
  TimesLoadingSkeleton,
  NotificacoesLoadingSkeleton,
  VendasLoadingSkeleton,
  TarefasLoadingSkeleton,
  RelatoriosLoadingSkeleton,
  AtividadesLoadingSkeleton,
  PortfolioLoadingSkeleton,
  ClientesLoadingSkeleton,
  ProdutosLoadingSkeleton,
  VendedoresLoadingSkeleton,
  ConfiguracoesLoadingSkeleton,
  IndexLoadingSkeleton,
  GamificationLoadingSkeleton,
} from './PageLoadingSkeleton';

/**
 * SmartSkeleton - Renders a content-specific skeleton based on the current URL path.
 * This provides a more seamless "perceived performance" experience.
 */
export const SmartSkeleton: FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const skeleton = useMemo(() => {
    // Exact matches or prefixes
    if (path === '/' || path === '/dashboard/visao-geral') return <DashboardLoadingSkeleton />;
    if (path.startsWith('/dashboard/performance')) return <VendedorDashboardLoadingSkeleton />;
    if (path.startsWith('/dashboard/analises') || path.startsWith('/analytics')) return <AnalyticsLoadingSkeleton />;
    if (path.startsWith('/pipeline')) return <PipelineLoadingSkeleton />;
    if (path.startsWith('/ranking')) return <RankingLoadingSkeleton />;
    if (path.startsWith('/sdr')) return <SDRDashboardLoadingSkeleton />;
    if (path.startsWith('/closer')) return <CloserDashboardLoadingSkeleton />;
    if (path.startsWith('/metas')) return <MetasLoadingSkeleton />;
    if (path.startsWith('/playbooks')) return <PlaybooksLoadingSkeleton />;
    if (path.startsWith('/cadencias')) return <CadenciasLoadingSkeleton />;
    if (path.startsWith('/times')) return <TimesLoadingSkeleton />;
    if (path.startsWith('/notificacoes')) return <NotificacoesLoadingSkeleton />;
    if (path.startsWith('/vendas')) return <VendasLoadingSkeleton />;
    if (path.startsWith('/tarefas')) return <TarefasLoadingSkeleton />;
    if (path.startsWith('/relatorios')) return <RelatoriosLoadingSkeleton />;
    if (path.startsWith('/atividades')) return <AtividadesLoadingSkeleton />;
    if (path.startsWith('/portfolio')) return <PortfolioLoadingSkeleton />;
    if (path.startsWith('/clientes')) return <ClientesLoadingSkeleton />;
    if (path.startsWith('/produtos')) return <ProdutosLoadingSkeleton />;
    if (path.startsWith('/vendedores')) return <VendedoresLoadingSkeleton />;
    if (path.startsWith('/configuracoes')) return <ConfiguracoesLoadingSkeleton />;
    if (path.startsWith('/gamificacao')) return <GamificationLoadingSkeleton />;
    
    // Default fallback (Index skeleton is a good all-rounder)
    return <IndexLoadingSkeleton />;
  }, [path]);

  return (
    <div className="w-full animate-in fade-in duration-300">
      {skeleton}
    </div>
  );
};
