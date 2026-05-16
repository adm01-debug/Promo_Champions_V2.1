import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface PageInfo {
  title: string;
  subtitle?: string;
  parent?: string;
}

// Map of routes to their display information
const routeInfoMap: Record<string, PageInfo> = {
  '/': { title: 'Dashboard' },
  '/sdr': { title: 'Dashboard SDR' },
  '/closer': { title: 'Dashboard Closer' },
  '/pipeline': { title: 'Pipeline', subtitle: 'Gestão de negócios' },
  '/vendas': { title: 'Vendas', subtitle: 'Histórico de vendas' },
  '/clientes': { title: 'Clientes', subtitle: 'Base de clientes' },
  '/produtos': { title: 'Produtos', subtitle: 'Catálogo' },
  '/tarefas': { title: 'Tarefas', subtitle: 'Atividades do dia' },
  '/atividades': { title: 'Atividades', subtitle: 'Registro de contatos' },
  '/cadencias': { title: 'Cadências', subtitle: 'Fluxos de contato' },
  '/metas': { title: 'Metas', subtitle: 'Objetivos do mês' },
  '/metas-atividades': { title: 'Metas de Atividades' },
  '/analytics': { title: 'Analytics', subtitle: 'Métricas e insights' },
  '/relatorios': { title: 'Relatórios' },
  '/ranking': { title: 'Ranking', subtitle: 'Competição' },
  '/desafios': { title: 'Desafios', subtitle: 'Gamificação' },
  '/desafios-semanais': { title: 'Desafios Semanais' },
  '/times': { title: 'Times', subtitle: 'Gestão de equipes' },
  '/vendedores': { title: 'Vendedores' },
  '/playbooks': { title: 'Playbooks', subtitle: 'Guias de vendas' },
  '/portfolio': { title: 'Portfólio', subtitle: 'Gestão de carteira' },
  '/fornecedores': { title: 'Fornecedores' },
  '/previsao-demanda': { title: 'Previsão de Demanda' },
  '/assinatura-digital': { title: 'Assinaturas Digitais' },
  '/assistente': { title: 'Assistente IA', subtitle: 'Seu parceiro de vendas' },
  '/icp': { title: 'ICP', subtitle: 'Perfil ideal de cliente' },
  '/notificacoes': { title: 'Notificações' },
  '/configuracoes': { title: 'Configurações' },
  '/admin': { title: 'Administração' },
  '/bi-sdr': { title: 'BI SDR' },
  '/bi-closer': { title: 'BI Closer' },
  '/bi-gestor': { title: 'BI Gestão' },
  '/fonte-leads': { title: 'Fonte de Leads' },
  '/arena': { title: 'Arena', subtitle: 'Competição ao vivo' },
  '/roi': { title: 'ROI', subtitle: 'Retorno por vendedor' },
};

export function useMobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const currentPageInfo = useMemo((): PageInfo => {
    const path = location.pathname;
    
    // Exact match first
    if (routeInfoMap[path]) {
      return routeInfoMap[path];
    }
    
    // Try to match parent routes (e.g., /clientes/123 -> /clientes)
    const pathParts = path.split('/').filter(Boolean);
    if (pathParts.length > 1) {
      const parentPath = '/' + pathParts[0];
      if (routeInfoMap[parentPath]) {
        return {
          ...routeInfoMap[parentPath],
          subtitle: 'Detalhes'
        };
      }
    }
    
    // Fallback title
    return { title: "PROMO CHAMPIONS" };
  }, [location.pathname]);

  const goBack = useCallback(() => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const goHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const isHomePage = location.pathname === '/';
  const canGoBack = !isHomePage && window.history.length > 1;

  return {
    currentPageInfo,
    goBack,
    goHome,
    isHomePage,
    canGoBack,
    isMobile,
    currentPath: location.pathname
  };
}
