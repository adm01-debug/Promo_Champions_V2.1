import React, { forwardRef, memo, useCallback, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, Copy, Check, MoreHorizontal, FileText, Share2, Printer, ExternalLink, Search, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { triggerHaptic } from '@/lib/haptics';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const routeLabels: Record<string, string> = {
  '': 'Início',
  'visao-geral': 'Resumo Geral',
  'performance': 'Minha Performance',
  'analises': 'Tendências e Insights',
  'competicao': 'Arena e Rankings',
  'inteligencia': 'Inteligência IA',
  'engajamento': 'Clima e Feedback',
  'dashboard': 'Painel',
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
  const navigate = useNavigate();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const [copied, setCopied] = useState(false);

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

  const getSiblings = (path: string) => {
    // In a real app, this would be a lookup of the route tree
    return Object.entries(routeLabels)
      .filter(([key]) => key !== '' && key !== path.split('/').pop())
      .slice(0, 8);
  };

  const handleCopyLink = useCallback(() => {
    triggerHaptic('light');
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copiado!', {
      description: 'Endereço pronto para compartilhamento.',
      duration: 3000,
    });
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleShare = useCallback(async () => {
    triggerHaptic('light');
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Erro ao compartilhar:", err);
      }
    } else {
      handleCopyLink();
    }
  }, [handleCopyLink]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1.5 max-w-full overflow-hidden bg-background/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border/20 shadow-sm transition-all duration-500 hover:shadow-lg hover:border-primary/30 hover:bg-background/60 group/nav">
        <nav 
          ref={ref}
          aria-label="Breadcrumb" 
          className="flex items-center gap-1 text-sm text-muted-foreground overflow-hidden"
        >
          <ol className="flex items-center gap-1.5 flex-nowrap overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap">
            <AnimatePresence mode="popLayout">
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;
                const isFirst = index === 0;
                
                return (
                  <motion.li 
                    key={item.href}
                    initial={{ opacity: 0, scale: 0.9, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 10 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      delay: index * 0.03 
                    }}
                    className="flex items-center gap-1.5"
                  >
                    {index > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-4 w-4 flex items-center justify-center text-muted-foreground/20 hover:text-primary/40 transition-colors">
                            <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 p-1 glass">
                          <DropdownMenuLabel className="text-[9px] uppercase tracking-widest opacity-50 px-2 py-1.5">Mudar para</DropdownMenuLabel>
                          {getSiblings(item.href).map(([slug, label]) => (
                            <DropdownMenuItem 
                              key={slug} 
                              onClick={() => {
                                triggerHaptic('light');
                                navigate(`/${slug}`);
                              }}
                              className="text-xs gap-2 cursor-pointer"
                            >
                              <LayoutGrid className="h-3 w-3" />
                              {label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    
                    {isLast ? (
                      <div className="flex items-center gap-1">
                        <motion.span 
                          layoutId="active-breadcrumb"
                          className="font-bold text-foreground tracking-tight px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/5"
                          aria-current="page"
                        >
                          {item.label}
                        </motion.span>
                        
                        <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon-sm" 
                                  onClick={() => triggerHaptic('light')}
                                  className="h-7 w-7 opacity-40 hover:opacity-100 hover:bg-primary/10 transition-all duration-300 rounded-md"
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[10px] font-medium">Ações da página</TooltipContent>
                          </Tooltip>
                          
                          <DropdownMenuContent 
                            align="end" 
                            className="w-56 p-1.5 backdrop-blur-2xl bg-background/90 border-primary/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                          >
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 py-1.5">Contexto</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={handleCopyLink} 
                              className="gap-2.5 p-2 rounded-md focus:bg-primary focus:text-primary-foreground transition-all cursor-pointer"
                            >
                              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold">Copiar URL</span>
                                <span className="text-[9px] opacity-70">Salvar link desta página</span>
                              </div>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={handleShare} 
                              className="gap-2.5 p-2 rounded-md focus:bg-primary focus:text-primary-foreground transition-all cursor-pointer"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold">Compartilhar</span>
                                <span className="text-[9px] opacity-70">Enviar para alguém</span>
                              </div>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-primary/10 my-1" />

                            <DropdownMenuItem 
                              onClick={() => { triggerHaptic(); window.print(); }} 
                              className="gap-2.5 p-2 rounded-md focus:bg-primary focus:text-primary-foreground transition-all cursor-pointer"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold">Imprimir</span>
                                <span className="text-[9px] opacity-70">Gerar PDF ou cópia física</span>
                              </div>
                            </DropdownMenuItem>

                            <DropdownMenuItem 
                              onClick={() => { triggerHaptic(); window.open(window.location.href, '_blank'); }} 
                              className="gap-2.5 p-2 rounded-md focus:bg-primary focus:text-primary-foreground transition-all cursor-pointer"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold">Nova Aba</span>
                                <span className="text-[9px] opacity-70">Abrir separadamente</span>
                              </div>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            to={item.href}
                            onClick={() => triggerHaptic('light')}
                            className={cn(
                              "hover:text-primary transition-all duration-300 flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-primary/5 active:scale-95 group/item",
                              isFirst && "text-muted-foreground/60"
                            )}
                          >
                            {isFirst ? (
                              <Home className="h-3.5 w-3.5 group-hover/item:scale-110 transition-transform duration-300" aria-hidden="true" />
                            ) : (
                              <span className="font-medium">{item.label}</span>
                            )}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[10px] font-medium">Ir para {item.label}</TooltipContent>
                      </Tooltip>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
        </nav>
      </div>
    </TooltipProvider>
  );
}));

Breadcrumbs.displayName = "Breadcrumbs";
