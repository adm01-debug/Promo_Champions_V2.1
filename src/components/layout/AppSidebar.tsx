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

// Itens secundários acessíveis via "Mais"
const sdrMoreItems: MenuItem[] = [
  { title: "BI SDR", url: "/bi-sdr", icon: LineChart },
  { title: "Cadências", url: "/cadencias", icon: Activity },
  { title: "Tarefas", url: "/tarefas", icon: Target },
  { title: "Calendário", url: "/calendario", icon: Calendar },
  { title: "Automações", url: "/automacoes", icon: Zap },
  { title: "Email Tracking", url: "/email-tracking", icon: MailSearch },
  { title: "Meu Dashboard", url: "/dashboard-custom", icon: LayoutGrid },
  { title: "Kanban Clientes", url: "/kanban-clientes", icon: Columns },
  { title: "Desafios", url: "/desafios", icon: Sparkles },
  { title: "Assistente IA", url: "/assistente", icon: Bot },
];

const closerMoreItems: MenuItem[] = [
  { title: "BI Closer", url: "/bi-closer", icon: LineChart },
  { title: "Atividades", url: "/atividades", icon: Activity },
  { title: "Calendário", url: "/calendario", icon: Calendar },
  { title: "Automações", url: "/automacoes", icon: Zap },
  { title: "Email Tracking", url: "/email-tracking", icon: MailSearch },
  { title: "Meu Dashboard", url: "/dashboard-custom", icon: LayoutGrid },
  { title: "Kanban Clientes", url: "/kanban-clientes", icon: Columns },
  { title: "Assinatura Digital", url: "/assinatura-digital", icon: Target },
  { title: "Desafios", url: "/desafios", icon: Sparkles },
  { title: "Assistente IA", url: "/assistente", icon: Bot },
];

const gestaoMoreItems: MenuItem[] = [
  { title: "BI Gestão", url: "/bi-gestor", icon: LineChart },
  { title: "Forecast", url: "/forecast", icon: TrendingUp },
  { title: "ROI Vendedores", url: "/roi", icon: DollarSign },
  { title: "Automações", url: "/automacoes", icon: Zap },
  { title: "Email Tracking", url: "/email-tracking", icon: MailSearch },
  { title: "Meu Dashboard", url: "/dashboard-custom", icon: LayoutGrid },
  { title: "Times", url: "/times", icon: Building2 },
  { title: "Portfólio", url: "/portfolio", icon: Target },
  { title: "ICP", url: "/icp", icon: Users },
  { title: "Playbooks", url: "/playbooks", icon: Target },
  { title: "Fonte de Leads", url: "/fonte-leads", icon: Target },
  { title: "Metas Atividades", url: "/metas-atividades", icon: Target },
  { title: "Calendário", url: "/calendario", icon: Calendar },
  { title: "Kanban Clientes", url: "/kanban-clientes", icon: Columns },
  { title: "Relatórios Email", url: "/relatorios-email", icon: MailCheck },
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

  const getMoreItems = (): MenuItem[] => {
    switch (viewMode) {
      case 'sdr': return sdrMoreItems;
      case 'closer': return closerMoreItems;
      case 'gestao': return gestaoMoreItems;
    }
  };

  const mainItems = getMainItems();
  const moreItems = getMoreItems();

  const viewModes: { mode: ViewMode; label: string; icon: LucideIcon; color: string }[] = [
    { mode: 'sdr', label: 'SDR', icon: Phone, color: 'text-info' },
    { mode: 'closer', label: 'Closer', icon: Handshake, color: 'text-success' },
    { mode: 'gestao', label: 'Gestão', icon: Building2, color: 'text-primary' },
  ];

  const currentViewConfig = viewModes.find(v => v.mode === viewMode)!;

  const userTypeAccentClasses = {
    sdr: 'bg-info/15 text-info',
    closer: 'bg-success/15 text-success',
    admin: 'bg-destructive/15 text-destructive',
    manager: 'bg-primary/15 text-primary',
    salesperson: 'bg-muted text-muted-foreground',
  } as const;

  const renderUserTypeIcon = (type: typeof userType) => {
    switch (type) {
      case 'sdr':
        return <Phone className="h-4 w-4" />;
      case 'closer':
        return <Handshake className="h-4 w-4" />;
      case 'admin':
        return <ShieldCheck className="h-4 w-4" />;
      case 'manager':
        return <Building2 className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    const isNotifications = item.title === "Notificações";
    const hasAlerts = isNotifications && alertCount > 0;
    
    return (
      <SidebarMenuItem key={item.title + item.url}>
        <SidebarMenuButton asChild tooltip={item.title}>
          <NavLink 
            to={item.url} 
            end 
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/50 group/item"
            activeClassName="bg-primary/10 text-primary font-medium shadow-sm"
          >
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
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/25">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-bold text-foreground tracking-tight">
                PROMO CHAMPIONS
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* View Mode Switcher */}
      {isAdminOrManager && !isCollapsed && (
        <div className="px-3 pb-3">
          <div className="flex gap-0.5 p-1 bg-muted/40 rounded-full border border-border/20">
            {viewModes.map((vm) => (
              <Button
                key={vm.mode}
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(vm.mode)}
                className={cn(
                  "flex-1 h-8 text-xs font-semibold rounded-full transition-all duration-200 gap-1.5 px-3",
                  viewMode === vm.mode 
                    ? "bg-background shadow-md text-foreground border border-border/30" 
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent border border-transparent"
                )}
              >
                <vm.icon className={cn("h-3.5 w-3.5", viewMode === vm.mode && vm.color)} />
                {vm.label}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <Separator className="bg-border/30" />

      <SidebarContent className="px-3 py-2">
        <ScrollArea className="flex-1">
          {/* Menu Principal - 5 itens */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {mainItems.map(item => renderMenuItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Ferramentas */}
          <Separator className="my-2 bg-border/30" />
          <SidebarGroup>
            <p className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
              Ferramentas
            </p>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {moreItems.map(item => renderMenuItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Sistema */}
          <Separator className="my-2 bg-border/30" />
          <SidebarGroup>
            <p className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
              Sistema
            </p>
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
                  "h-10 w-10 rounded-xl flex items-center justify-center mx-auto cursor-default",
                  userTypeAccentClasses[userType]
                )}>
                  {renderUserTypeIcon(userType)}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium">{salesperson?.name || "Usuário"}</p>
                <p className="text-xs text-muted-foreground">{salesperson?.email}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
            <div className={cn(
              "h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0",
              userTypeAccentClasses[userType]
            )}>
              {renderUserTypeIcon(userType)}
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
