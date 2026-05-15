import React, { forwardRef, memo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BackButton } from './BackButton';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const routeLabels: Record<string, string> = {
  '': 'Início',
  'dashboard': 'Dashboard',
  'performance': 'Performance',
  'analises': 'Análises',
  'competicao': 'Competição',
  'inteligencia': 'Inteligência',
  'engajamento': 'Engajamento',
  'visao-geral': 'Visão Geral',
  'pipeline': 'Pipeline',
  'vendas': 'Vendas',
  'clientes': 'Clientes',
  'produtos': 'Produtos',
  'tarefas': 'Tarefas',
  'atividades': 'Atividades',
  'cadencias': 'Cadências',
  'metas': 'Metas',
  'metas-atividades': 'Metas de Atividades',
  'analytics': 'Analytics',
  'relatorios': 'Relatórios',
  'ranking': 'Ranking',
  'desafios-semanais': 'Desafios',
  'historico-desafios': 'Histórico Desafios',
  'times': 'Times',
  'vendedores': 'Vendedores',
  'playbooks': 'Playbooks',
  'portfolio': 'Portfólio',
  'fornecedores': 'Fornecedores',
  'comparador-precos': 'Comparador',
  'previsao-demanda': 'Previsão',
  'forecast': 'Forecast Ponderado',
  'calendario': 'Calendário',
  'automacoes': 'Automações',
  'email-tracking': 'Email Tracking',
  'dashboard-custom': 'Meu Dashboard',
  'kanban-clientes': 'Kanban Clientes',
  'relatorios-email': 'Relatórios Email',
  'assinatura-digital': 'Assinatura Digital',
  'assistente': 'Assistente IA',
  'notificacoes': 'Notificações',
  'configuracoes': 'Configurações',
  'icp': 'ICP',
  'fonte-leads': 'Fonte de Leads',
  'bi-gestor': 'BI Gestor',
  'bi-vendedor': 'BI Vendedor',
  'bitrix24': 'Bitrix24',
  'admin': 'Admin',
  'sdr': 'SDR Dashboard',
  'closer': 'Closer Dashboard',
  'vendedor': 'Vendedor Dashboard',
};

export const Breadcrumbs = memo(forwardRef<HTMLElement>(function Breadcrumbs(_props, ref) {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Only show breadcrumbs when depth >= 2 (not on top-level pages)
  if (pathSegments.length < 2) return null;
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ];
  
  let currentPath = '';
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ label, href: currentPath });
  });

  return (
    <div className="flex items-center gap-2">
      {/* Back Button */}
      <BackButton className="hidden sm:flex" />

      <nav 
        ref={ref}
        aria-label="Breadcrumb" 
        className="flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ol className="flex items-center gap-1 flex-wrap">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isFirst = index === 0;
            
            return (
              <li key={item.href} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
                )}
                {isLast ? (
                  <span 
                    className="font-medium text-foreground"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className={cn(
                      "hover:text-primary transition-colors flex items-center gap-1",
                      isFirst && "text-primary"
                    )}
                  >
                    {isFirst && <Home className="h-3.5 w-3.5" aria-hidden="true" />}
                    {!isFirst && item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}));

Breadcrumbs.displayName = "Breadcrumbs";
