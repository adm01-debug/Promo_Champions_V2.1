import { RefObject } from "react";
import { useLocation, Link } from "react-router-dom";
import { Bell, Sparkles, FileText } from "lucide-react";
import { useTodaysQuoteCadenceTasks } from "@/hooks/cadences/useTodaysQuoteCadenceTasks";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { FocusModeToggle } from "@/components/focus/FocusModeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { NotificationBadge } from "@/components/ui/NotificationBadge";
import { NotificationPopover } from "@/components/notifications";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { cn } from "@/lib/utils";
import { useUnreadNotificationsCount } from "@/hooks/useUnreadNotificationsCount";
import type { GlobalSearchHandle } from "./GlobalSearch";
import { useMemo } from "react";

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/pipeline': 'Pipeline',
  '/vendas': 'Vendas',
  '/clientes': 'Clientes',
  '/produtos': 'Produtos',
  '/tarefas': 'Tarefas',
  '/atividades': 'Atividades',
  '/cadencias': 'Cadências',
  '/cadencias-orcamentos': 'Cadências de Orçamento',
  '/metas': 'Metas',
  '/analytics': 'Analytics',
  '/relatorios': 'Relatórios',
  '/ranking': 'Ranking',
  '/vendedores': 'Vendedores',
  '/forecast': 'Forecast',
  '/inteligencia-preditiva': 'Inteligência Preditiva',
  '/revops': 'Revenue Operations Hub',
  '/calendario': 'Calendário',
  '/automacoes': 'Automações',
  '/automacao-inteligente': 'Automação Inteligente',
  '/coaching-inteligente': 'Coaching Inteligente',
  '/configuracoes': 'Configurações',
  '/notificacoes': 'Notificações',
  '/assistente': 'Assistente IA',
  '/admin': 'Admin',
  '/customer-success': 'Customer Success',
  '/sales-enablement': 'Sales Enablement',
  '/conversational-intelligence': 'Conversational Intelligence',
  '/pricing-intelligence': 'Pricing Intelligence',
  '/territory-optimization': 'Territory Optimization',
};

interface DesktopTopBarProps {
  searchRef: RefObject<GlobalSearchHandle>;
}

export function DesktopTopBar({ searchRef }: DesktopTopBarProps) {
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const { data: todaysQuoteTasks } = useTodaysQuoteCadenceTasks();
  const quoteTasksCount = todaysQuoteTasks?.count ?? 0;
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isTopLevel = pathSegments.length < 2;
  const pageTitle = useMemo(() => PAGE_TITLES[location.pathname] ?? null, [location.pathname]);
  return (
    <div className="sticky top-0 z-40 hidden md:flex items-center justify-between h-14 px-4 lg:px-6 backdrop-blur-xl bg-background/70 border-b border-border/50 transition-all duration-200">
      {/* LEFT CLUSTER: Sidebar Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger className="h-9 w-9 shrink-0 rounded-lg hover:bg-muted/80 transition-colors" />
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>Alternar menu lateral</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Page title chip (top-level) or Breadcrumbs (nested) */}
        <div className="min-w-0 overflow-hidden">
          {isTopLevel && pageTitle ? (
            <span className="text-sm font-semibold text-foreground">{pageTitle}</span>
          ) : (
            <Breadcrumbs />
          )}
        </div>
      </div>

      {/* RIGHT CLUSTER: Actions */}
      <TooltipProvider delayDuration={300}>
        <div className="flex items-center gap-0.5">
          {/* Search — visually prominent */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => searchRef.current?.open()}
                className="h-8 flex items-center gap-2 px-3 rounded-lg bg-muted/50 hover:bg-muted/80 border border-border/40 text-muted-foreground hover:text-foreground transition-all duration-200 text-xs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <span className="hidden lg:inline">Buscar...</span>
                <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border/50 bg-background/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground/70">
                  ⌘K
                </kbd>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>Buscar (⌘K)</p></TooltipContent>
          </Tooltip>

          {/* Semantic Search trigger */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("semantic-search:open"))}
                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted/80 transition-colors"
                aria-label="Busca semântica"
              >
                <Sparkles className="h-4 w-4 text-primary" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>Busca semântica (⌘⇧F)</p></TooltipContent>
          </Tooltip>

          {/* Divider */}
          <div className="w-px h-5 bg-border/50 mx-1.5" />

          {/* Quote cadence tasks for today */}
          {quoteTasksCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/cadencias-orcamentos?filter=today"
                  className="relative h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted/80 transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none"
                  aria-label={`${quoteTasksCount} tarefa${quoteTasksCount > 1 ? "s" : ""} de cadência de orçamento para hoje`}
                >
                  <FileText className="h-4 w-4 text-primary" />
                  <NotificationBadge
                    count={quoteTasksCount}
                    size="sm"
                    pulse={quoteTasksCount > 3}
                    variant="info"
                    className="absolute -top-1 -right-1"
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Tarefas de cadência de orçamento para hoje ({quoteTasksCount})</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Notifications */}
          <Tooltip>
            <TooltipTrigger asChild>
              <NotificationPopover>
                <button
                  type="button"
                  className="relative h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted/80 transition-colors"
                  aria-label="Notificações"
                >
                  <Bell className={cn(
                    "h-4 w-4 transition-colors",
                    unreadCount > 5 ? "text-destructive" : unreadCount > 0 ? "text-warning" : "text-muted-foreground"
                  )} />
                  <NotificationBadge
                    count={unreadCount}
                    size="sm"
                    pulse={unreadCount > 5}
                    variant={unreadCount > 5 ? "destructive" : unreadCount > 0 ? "warning" : "default"}
                    className="absolute -top-1 -right-1"
                  />
                </button>
              </NotificationPopover>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Notificações{unreadCount > 0 ? ` (${unreadCount} novas)` : ''}</p>
            </TooltipContent>
          </Tooltip>

          {/* Focus Mode */}
          <FocusModeToggle />

          {/* Divider */}
          <div className="w-px h-5 bg-border/50 mx-1.5" />

          {/* Settings cluster */}
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </TooltipProvider>
    </div>
  );
}
