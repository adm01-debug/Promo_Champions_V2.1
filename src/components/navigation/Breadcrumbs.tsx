import React, { forwardRef, memo, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home, Copy, Check, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BackButton } from './BackButton';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

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
  'cadencias-orcamentos': 'Orçamentos',
  'metas': 'Metas',
  'metas-atividades': 'Metas de Atividades',
  'analytics': 'Analytics',
  'relatorios': 'Relatórios',
  'ranking': 'Ranking',
  'desafios': 'Desafios',
  'desafios-semanais': 'Desafios Semanais',
  'historico-desafios': 'Histórico',
  'times': 'Times',
  'vendedores': 'Vendedores',
  'playbooks': 'Playbooks',
  'portfolio': 'Portfólio',
  'fornecedores': 'Fornecedores',
  'comparador-precos': 'Comparador',
  'previsao-demanda': 'Previsão',
  'forecast': 'Forecast',
  'calendario': 'Calendário',
  'automacoes': 'Automações',
  'email-tracking': 'Rastreamento',
  'dashboard-custom': 'Personalizado',
  'kanban-clientes': 'Kanban',
  'relatorios-email': 'Relatórios Email',
  'assinatura-digital': 'Assinatura',
  'assistente': 'Assistente IA',
  'notificacoes': 'Notificações',
  'configuracoes': 'Configurações',
  'icp': 'ICP',
  'fonte-leads': 'Fontes',
  'bi-gestor': 'BI Gestor',
  'bi-vendedor': 'BI Vendedor',
  'bitrix24': 'Bitrix24',
  'admin': 'Admin',
  'sdr': 'SDR',
  'closer': 'Closer',
  'vendedor': 'Vendedor',
  'revenue-intelligence': 'Revenue Intelligence',
  'revenue-forecast': 'Previsão de Receita',
  'customer-success': 'Customer Success',
  'sales-enablement': 'Enablement',
  'pricing-intelligence': 'Pricing',
  'territory-optimization': 'Territórios',
};

export const Breadcrumbs = memo(forwardRef<HTMLElement>(function Breadcrumbs(_props, ref) {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const [copied, setCopied] = React.useState(false);
  
  // Only show breadcrumbs when depth >= 2 (not on top-level pages)
  if (pathSegments.length < 1) return null;
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ];
  
  let currentPath = '';
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ label, href: currentPath });
  });

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copiado para a área de transferência');
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="flex items-center gap-2 max-w-full overflow-hidden">
      <nav 
        ref={ref}
        aria-label="Breadcrumb" 
        className="flex items-center gap-1 text-sm text-muted-foreground overflow-hidden"
      >
        <ol className="flex items-center gap-1.5 flex-nowrap overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap px-1">
          <AnimatePresence mode="popLayout">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              const isFirst = index === 0;
              
              return (
                <motion.li 
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center gap-1.5"
                >
                  {index > 0 && (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" aria-hidden="true" />
                  )}
                  
                  {isLast ? (
                    <div className="flex items-center gap-1">
                      <span 
                        className="font-semibold text-foreground tracking-tight px-1.5 py-0.5 rounded-md bg-accent/50"
                        aria-current="page"
                      >
                        {item.label}
                      </span>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="h-7 w-7 opacity-50 hover:opacity-100">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
                            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>Copiar Link</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={cn(
                        "hover:text-primary transition-all duration-200 flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-accent/50",
                        isFirst && "text-muted-foreground/80"
                      )}
                    >
                      {isFirst ? <Home className="h-3.5 w-3.5" aria-hidden="true" /> : item.label}
                    </Link>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      </nav>
    </div>
  );
}));

Breadcrumbs.displayName = "Breadcrumbs";
