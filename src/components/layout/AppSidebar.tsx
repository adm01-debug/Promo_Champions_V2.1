/* sidebar v3 — grouped submenus */
import { useState } from "react";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Bell,
  Trophy,
  Kanban,
  Phone,
  Activity,
  Handshake,
  Target,
  Bot,
  TrendingUp,
  Settings,
  LucideIcon,
  ShieldCheck,
  LineChart,
  Building2,
  Sparkles,
  FileText,
  Calendar,
  Zap,
  MailSearch,
  LayoutGrid,
  Columns,
  MailCheck,
  DollarSign,
  Swords,
  Gift,
  Crown,
  MapPin,
  ChevronRight,
  Briefcase,
  Search,
  Gauge,
} from "lucide-react";
import { NavLink } from "@/components/navigation/NavLink";
import { UserRoleBadge } from "@/components/layout/UserRoleBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useAlerts } from "@/hooks/useAlerts";
import { useUserRoles } from "@/hooks/useUserRoles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Separator
} from "@/components/ui/separator";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface MenuGroup {
  label: string;
  icon: LucideIcon;
  items: MenuItem[];
}

type ViewMode = 'sdr' | 'closer' | 'gestao';

// ============================================
// ITENS PRINCIPAIS (5-6 por contexto)
// ============================================

const sdrMainItems: MenuItem[] = [
  { title: "Dashboard", url: "/sdr", icon: LayoutDashboard },
  { title: "Pipeline", url: "/pipeline", icon: Kanban },
  { title: "Atividades", url: "/atividades", icon: Activity },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Ranking", url: "/ranking", icon: Trophy },
  { title: "Arena", url: "/arena", icon: Swords },
];

const closerMainItems: MenuItem[] = [
  { title: "Dashboard", url: "/closer", icon: LayoutDashboard },
  { title: "Pipeline", url: "/pipeline", icon: Kanban },
  { title: "Orçamentos", url: "/orcamentos", icon: FileText },
  { title: "Vendas", url: "/vendas", icon: ShoppingCart },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Arena", url: "/arena", icon: Swords },
];

const gestaoMainItems: MenuItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Vendedores", url: "/vendedores", icon: Users },
  { title: "Metas", url: "/metas", icon: Target },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Relatórios", url: "/relatorios", icon: LineChart },
];

// Itens agrupados por categoria
const sdrGroupedItems: MenuGroup[] = [
  {
    label: "Prospecção",
    icon: Search,
    items: [
      { title: "Cadências", url: "/cadencias", icon: Activity },
      { title: "Email Tracking", url: "/email-tracking", icon: MailSearch },
      { title: "Automações", url: "/automacoes", icon: Zap },
    ],
  },
  {
    label: "CRM",
    icon: Briefcase,
    items: [
      { title: "Kanban Clientes", url: "/kanban-clientes", icon: Columns },
      { title: "Mapa Clientes", url: "/mapa-clientes", icon: MapPin },
      { title: "Calendário", url: "/calendario", icon: Calendar },
      { title: "Tarefas", url: "/tarefas", icon: Target },
    ],
  },
  {
    label: "Análises",
    icon: Gauge,
    items: [
      { title: "BI SDR", url: "/bi-sdr", icon: LineChart },
      { title: "Lead Scoring", url: "/lead-scoring", icon: Target },
      { title: "Meu Dashboard", url: "/dashboard-custom", icon: LayoutGrid },
      { title: "Desafios", url: "/desafios", icon: Sparkles },
      { title: "Assistente IA", url: "/assistente", icon: Bot },
    ],
  },
];

const closerGroupedItems: MenuGroup[] = [
  {
    label: "Vendas",
    icon: DollarSign,
    items: [
      { title: "Assinatura Digital", url: "/assinatura-digital", icon: Target },
      { title: "Email Tracking", url: "/email-tracking", icon: MailSearch },
      { title: "Automações", url: "/automacoes", icon: Zap },
    ],
  },
  {
    label: "CRM",
    icon: Briefcase,
    items: [
      { title: "Atividades", url: "/atividades", icon: Activity },
      { title: "Kanban Clientes", url: "/kanban-clientes", icon: Columns },
      { title: "Mapa Clientes", url: "/mapa-clientes", icon: MapPin },
      { title: "Calendário", url: "/calendario", icon: Calendar },
    ],
  },
  {
    label: "Análises",
    icon: Gauge,
    items: [
      { title: "BI Closer", url: "/bi-closer", icon: LineChart },
      { title: "Meu Dashboard", url: "/dashboard-custom", icon: LayoutGrid },
      { title: "Desafios", url: "/desafios", icon: Sparkles },
      { title: "Assistente IA", url: "/assistente", icon: Bot },
    ],
  },
];

const gestaoGroupedItems: MenuGroup[] = [
  {
    label: "Análises",
    icon: Gauge,
    items: [
      { title: "BI Gestão", url: "/bi-gestor", icon: LineChart },
      { title: "Forecast", url: "/forecast", icon: TrendingUp },
      { title: "ROI Vendedores", url: "/roi", icon: DollarSign },
      { title: "Meu Dashboard", url: "/dashboard-custom", icon: LayoutGrid },
      { title: "Relatórios Email", url: "/relatorios-email", icon: MailCheck },
    ],
  },
  {
    label: "CRM",
    icon: Briefcase,
    items: [
      { title: "Kanban Clientes", url: "/kanban-clientes", icon: Columns },
      { title: "Mapa Clientes", url: "/mapa-clientes", icon: MapPin },
      { title: "Calendário", url: "/calendario", icon: Calendar },
      { title: "Portfólio", url: "/portfolio", icon: Target },
    ],
  },
  {
    label: "Gestão de Equipe",
    icon: Building2,
    items: [
      { title: "Times", url: "/times", icon: Building2 },
      { title: "Metas Atividades", url: "/metas-atividades", icon: Target },
      { title: "Automações", url: "/automacoes", icon: Zap },
      { title: "Email Tracking", url: "/email-tracking", icon: MailSearch },
    ],
  },
  {
    label: "Prospecção",
    icon: Search,
    items: [
      { title: "ICP", url: "/icp", icon: Users },
      { title: "Playbooks", url: "/playbooks", icon: Target },
      { title: "Fonte de Leads", url: "/fonte-leads", icon: Target },
    ],
  },
];

const systemItems: MenuItem[] = [
  { title: "Configurações", url: "/configuracoes", icon: Settings },
  { title: "Notificações", url: "/notificacoes", icon: Bell },
];

const adminOnlyItems: MenuItem[] = [
  { title: "Admin", url: "/admin", icon: ShieldCheck },
  { title: "Telemetria", url: "/admin/telemetria", icon: Activity },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { data: alerts } = useAlerts();
  const alertCount = alerts?.length || 0;
  const { salesperson } = useAuth();
  const { currentUserRole, isLoadingCurrentRole } = useUserRoles();

  const getUserType = (): 'admin' | 'manager' | 'sdr' | 'closer' | 'salesperson' => {
    const role = currentUserRole?.role;
    if (role === 'admin') return 'admin';
    if (role === 'manager') return 'manager';
    
    const name = salesperson?.name?.toLowerCase() || '';
    if (name.includes('sdr')) return 'sdr';
    if (name.includes('closer')) return 'closer';
    
    return 'salesperson';
  };

  const userType = getUserType();
  const isAdminOrManager = ['admin', 'manager'].includes(userType);

  const getDefaultViewMode = (): ViewMode => {
    if (userType === 'sdr') return 'sdr';
    if (userType === 'closer') return 'closer';
    return 'gestao';
  };

  const [viewMode, setViewMode] = useState<ViewMode>(getDefaultViewMode());

  const getMainItems = (): MenuItem[] => {
    switch (viewMode) {
      case 'sdr': return sdrMainItems;
      case 'closer': return closerMainItems;
      case 'gestao': return gestaoMainItems;
    }
  };

  const getGroupedItems = (): MenuGroup[] => {
    switch (viewMode) {
      case 'sdr': return sdrGroupedItems;
      case 'closer': return closerGroupedItems;
      case 'gestao': return gestaoGroupedItems;
    }
  };

  const mainItems = getMainItems();
  const groupedItems = getGroupedItems();

  const viewModes: { mode: ViewMode; label: string; icon: LucideIcon; color: string }[] = [
    { mode: 'sdr', label: 'SDR', icon: Phone, color: 'text-info' },
    { mode: 'closer', label: 'Closer', icon: Handshake, color: 'text-success' },
    { mode: 'gestao', label: 'Gestão', icon: Building2, color: 'text-primary' },
  ];

  const userTypeAccentClasses = {
    sdr: 'bg-info/15 text-info',
    closer: 'bg-success/15 text-success',
    admin: 'bg-destructive/15 text-destructive',
    manager: 'bg-primary/15 text-primary',
    salesperson: 'bg-muted text-muted-foreground',
  } as const;

  const renderMenuItem = (item: MenuItem) => {
    const isNotifications = item.title === "Notificações";
    const hasAlerts = isNotifications && alertCount > 0;
    
    return (
      <SidebarMenuItem key={item.title + item.url}>
        <SidebarMenuButton asChild tooltip={item.title}>
          <NavLink 
            to={item.url} 
            end 
            className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/50 group/item"
            activeClassName="bg-primary/10 text-primary font-medium shadow-sm [&>.nav-indicator]:opacity-100 [&>.nav-indicator]:scale-y-100"
          >
            <span className="nav-indicator absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary opacity-0 scale-y-0 transition-all duration-300" />
            <div className="relative">
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover/item:scale-110",
                hasAlerts && "text-warning"
              )} />
              {hasAlerts && (
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center animate-pulse">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <span className="text-sm font-medium">{item.title}</span>
            )}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderGroupedMenu = (group: MenuGroup, index: number) => {
    // Auto-open if any child route is active
    const currentPath = window.location.pathname;
    const hasActiveChild = group.items.some(item => currentPath === item.url || currentPath.startsWith(item.url + '/'));

    return (
      <Collapsible key={group.label} defaultOpen={hasActiveChild} className="group/collapsible">
        <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-muted/30 transition-all duration-200 text-[11px] uppercase tracking-wider font-semibold">
          <group.icon className="h-3.5 w-3.5 flex-shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{group.label}</span>
              <ChevronRight className="h-3 w-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
          <SidebarMenu className="space-y-0.5 pl-2 mt-0.5">
            {group.items.map(item => renderMenuItem(item))}
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  if (isLoadingCurrentRole) {
    return (
      <Sidebar collapsible="icon" className="border-r-0 bg-sidebar">
        <SidebarContent className="flex items-center justify-center">
          <div className="animate-pulse space-y-3 p-4 w-full">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded-xl" />
            ))}
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border/30 bg-sidebar/95 backdrop-blur-sm">
      {/* Header com Logo */}
      <SidebarHeader className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
            <Crown className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-semibold text-foreground tracking-normal">
                Promo Champions
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                Realize seus sonhos!
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* View Mode Switcher */}
      {isAdminOrManager && !isCollapsed && (
        <div className="px-3 pb-3">
          <div className="flex gap-1 p-1.5 bg-background/60 rounded-xl border border-border/50 shadow-inner">
            {viewModes.map((vm) => {
              const isActive = viewMode === vm.mode;
              return (
                <Button
                  key={vm.mode}
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode(vm.mode)}
                  className={cn(
                    "flex-1 h-8 text-[11px] font-semibold rounded-lg transition-all duration-300 gap-1.5 px-2",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 border border-primary/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
                  )}
                >
                  <vm.icon className={cn(
                    "h-3.5 w-3.5 transition-colors duration-300",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )} />
                  {vm.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
      
      <Separator className="bg-border/30" />

      <SidebarContent className="px-3 py-2">
        <ScrollArea className="flex-1">
          {/* Menu Principal */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {mainItems.map(item => renderMenuItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Ferramentas - Agrupadas em submenus colapsáveis */}
          <Separator className="my-2 bg-border/30" />
          <SidebarGroup>
            <div className="space-y-1">
              {groupedItems.map((group, i) => renderGroupedMenu(group, i))}
            </div>
          </SidebarGroup>

          {/* Sistema */}
          <Separator className="my-2 bg-border/30" />
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {systemItems.map(item => renderMenuItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Admin */}
          {userType === 'admin' && (
            <>
              <Separator className="my-2 bg-border/30" />
              <SidebarGroup>
                <p className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                  Administração
                </p>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {adminOnlyItems.map(item => renderMenuItem(item))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          )}
        </ScrollArea>
      </SidebarContent>

      {/* Footer com usuário */}
      <SidebarFooter className="p-3 border-t border-border/30">
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center mx-auto cursor-default font-bold text-sm",
                  userTypeAccentClasses[userType]
                )}>
                  {salesperson?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium">{salesperson?.name || "Usuário"}</p>
                <p className="text-xs text-muted-foreground">{salesperson?.email}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors group">
            <div className={cn(
              "h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm",
              userTypeAccentClasses[userType]
            )}>
              {salesperson?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold truncate">{salesperson?.name || "Usuário"}</p>
                <UserRoleBadge />
              </div>
              <p className="text-[11px] text-muted-foreground truncate">{salesperson?.email || ""}</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
