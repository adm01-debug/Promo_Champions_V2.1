import { useState } from "react";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Bell,
  Trophy,
  Kanban,
  ClipboardList,
  BookOpen,
  Phone,
  Activity,
  Handshake,
  GitBranch,
  Target,
  Crosshair,
  Bot,
  Swords,
  TrendingUp,
  Settings,
  Link2,
  Briefcase,
  LucideIcon,
  ShieldCheck,
  LineChart,
  BarChart2,
  Zap,
  UserCheck,
  Search,
  FileText,
  Users2,
  Building2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PieChart
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { UserRoleBadge } from "@/components/layout/UserRoleBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useAlerts } from "@/hooks/useAlerts";
import { useUserRoles } from "@/hooks/useUserRoles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
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

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

type ViewMode = 'sdr' | 'closer' | 'gestao';

// ============================================
// ITENS POR CONTEXTO
// ============================================

const sdrContextItems: MenuItem[] = [
  { title: "Dashboard SDR", url: "/sdr", icon: Phone },
  { title: "BI SDR", url: "/bi-sdr", icon: LineChart },
  { title: "Pipeline", url: "/pipeline", icon: Kanban },
  { title: "Cadências", url: "/cadencias", icon: GitBranch },
  { title: "Atividades", url: "/atividades", icon: Activity },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Tarefas", url: "/tarefas", icon: ClipboardList },
];

const closerContextItems: MenuItem[] = [
  { title: "Dashboard Closer", url: "/closer", icon: Handshake },
  { title: "BI Closer", url: "/bi-closer", icon: LineChart },
  { title: "Pipeline", url: "/pipeline", icon: Kanban },
  { title: "Vendas", url: "/vendas", icon: ShoppingCart },
  { title: "Atividades", url: "/atividades", icon: Activity },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Assinatura Digital", url: "/assinatura-digital", icon: FileText },
  { title: "Tarefas", url: "/tarefas", icon: ClipboardList },
];

const gestaoContextItems: MenuItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "BI Gestão", url: "/bi-gestor", icon: BarChart2 },
  { title: "Vendedores", url: "/vendedores", icon: Users2 },
  { title: "Times", url: "/times", icon: Building2 },
  { title: "Metas", url: "/metas", icon: Target },
  { title: "Metas Atividades", url: "/metas-atividades", icon: Crosshair },
  { title: "Portfólio", url: "/portfolio", icon: Briefcase },
  { title: "ICP", url: "/icp", icon: UserCheck },
  { title: "Playbooks", url: "/playbooks", icon: BookOpen },
  { title: "Fonte de Leads", url: "/fonte-leads", icon: Search },
  { title: "Analytics", url: "/analytics", icon: PieChart },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
];

const gamificationItems: MenuItem[] = [
  { title: "Ranking", url: "/ranking", icon: Swords },
  { title: "Desafios", url: "/desafios", icon: Trophy },
  { title: "Assistente IA", url: "/assistente", icon: Bot },
];

const systemItems: MenuItem[] = [
  { title: "Configurações", url: "/configuracoes", icon: Settings },
  { title: "Notificações", url: "/notificacoes", icon: Bell },
];

const adminOnlyItems: MenuItem[] = [
  { title: "Admin", url: "/admin", icon: ShieldCheck },
  { title: "Bitrix24", url: "/bitrix24", icon: Link2 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { data: alerts } = useAlerts();
  const alertCount = alerts?.length || 0;
  const { salesperson } = useAuth();
  const { currentUserRole, isLoadingCurrentRole } = useUserRoles();

  // Determinar o tipo de usuário
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

  // Para admin/manager: modo de visualização selecionável
  // Para outros: fixo no seu contexto
  const getDefaultViewMode = (): ViewMode => {
    if (userType === 'sdr') return 'sdr';
    if (userType === 'closer') return 'closer';
    return 'gestao'; // admin/manager começam em gestão
  };

  const [viewMode, setViewMode] = useState<ViewMode>(getDefaultViewMode());

  // Obter itens baseado no modo de visualização
  const getContextItems = (): MenuItem[] => {
    switch (viewMode) {
      case 'sdr': return sdrContextItems;
      case 'closer': return closerContextItems;
      case 'gestao': return gestaoContextItems;
    }
  };

  const contextItems = getContextItems();

  // View mode tabs config
  const viewModes: { mode: ViewMode; label: string; icon: LucideIcon; color: string }[] = [
    { mode: 'sdr', label: 'SDR', icon: Phone, color: 'text-blue-400 bg-blue-400/10' },
    { mode: 'closer', label: 'Closer', icon: Handshake, color: 'text-green-400 bg-green-400/10' },
    { mode: 'gestao', label: 'Gestão', icon: Building2, color: 'text-purple-400 bg-purple-400/10' },
  ];

  const currentViewConfig = viewModes.find(v => v.mode === viewMode)!;

  const renderMenuItem = (item: MenuItem, showNotificationBadge = false) => {
    const isNotifications = item.title === "Notificações";
    const hasAlerts = isNotifications && alertCount > 0;
    
    return (
      <SidebarMenuItem key={item.title + item.url}>
        <SidebarMenuButton asChild tooltip={item.title}>
          <NavLink 
            to={item.url} 
            end 
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/50 group/item"
            activeClassName="bg-primary/10 text-primary border-l-2 border-primary"
          >
            <div className="relative">
              <item.icon className={cn(
                "h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover/item:scale-110",
                hasAlerts && "text-warning"
              )} />
              {hasAlerts && (
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <span className="text-sm font-medium truncate">{item.title}</span>
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
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded-lg" />
            ))}
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-sidebar">
      {/* Header com Logo */}
      <SidebarHeader className="p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-sm">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold text-foreground">SalesPro</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {currentViewConfig.label}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* View Mode Switcher - Apenas para Admin/Manager */}
      {isAdminOrManager && !isCollapsed && (
        <div className="p-2 border-b border-border/50">
          <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
            {viewModes.map((vm) => (
              <TooltipProvider key={vm.mode}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode(vm.mode)}
                      className={cn(
                        "flex-1 h-8 text-xs font-medium transition-all",
                        viewMode === vm.mode 
                          ? "bg-background shadow-sm text-foreground" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <vm.icon className="h-3.5 w-3.5 mr-1.5" />
                      {vm.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Ver como {vm.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}

      {/* Collapsed View Mode Indicator */}
      {isAdminOrManager && isCollapsed && (
        <div className="p-2 flex flex-col gap-1">
          {viewModes.map((vm) => (
            <TooltipProvider key={vm.mode}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode(vm.mode)}
                    className={cn(
                      "h-8 w-8",
                      viewMode === vm.mode && "bg-muted"
                    )}
                  >
                    <vm.icon className={cn(
                      "h-4 w-4",
                      viewMode === vm.mode ? "text-primary" : "text-muted-foreground"
                    )} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{vm.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}

      <SidebarContent className="px-2">
        <ScrollArea className="flex-1">
          {/* Contexto Principal */}
          <SidebarGroup>
            <div className={cn(
              "text-[10px] uppercase tracking-widest font-medium px-3 py-2 flex items-center gap-2",
              currentViewConfig.color.split(' ')[0]
            )}>
              <currentViewConfig.icon className="h-3 w-3" />
              {!isCollapsed && currentViewConfig.label}
            </div>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {contextItems.map(item => renderMenuItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Gamificação - Sempre visível */}
          <SidebarGroup className="mt-4">
            <div className="text-[10px] uppercase tracking-widest font-medium px-3 py-2 text-yellow-400 flex items-center gap-2">
              <Trophy className="h-3 w-3" />
              {!isCollapsed && "Gamificação"}
            </div>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {gamificationItems.map(item => renderMenuItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Sistema */}
          <SidebarGroup className="mt-4">
            <div className="text-[10px] uppercase tracking-widest font-medium px-3 py-2 text-muted-foreground/60 flex items-center gap-2">
              <Settings className="h-3 w-3" />
              {!isCollapsed && "Sistema"}
            </div>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {systemItems.map(item => renderMenuItem(item, item.title === "Notificações"))}
                {userType === 'admin' && adminOnlyItems.map(item => renderMenuItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      {/* Footer com usuário */}
      <SidebarFooter className="p-2 border-t border-border/50">
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center mx-auto cursor-default",
                  userType === 'sdr' ? "bg-blue-500/20" :
                  userType === 'closer' ? "bg-green-500/20" :
                  userType === 'admin' ? "bg-red-500/20" :
                  userType === 'manager' ? "bg-purple-500/20" :
                  "bg-primary/20"
                )}>
                  {userType === 'sdr' ? <Phone className="h-4 w-4 text-blue-500" /> :
                   userType === 'closer' ? <Handshake className="h-4 w-4 text-green-500" /> :
                   userType === 'admin' ? <ShieldCheck className="h-4 w-4 text-red-500" /> :
                   userType === 'manager' ? <Building2 className="h-4 w-4 text-purple-500" /> :
                   <Users className="h-4 w-4 text-primary" />}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium">{salesperson?.name || "Usuário"}</p>
                <p className="text-xs text-muted-foreground">{salesperson?.email}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
              userType === 'sdr' ? "bg-blue-500/20" :
              userType === 'closer' ? "bg-green-500/20" :
              userType === 'admin' ? "bg-red-500/20" :
              userType === 'manager' ? "bg-purple-500/20" :
              "bg-primary/20"
            )}>
              {userType === 'sdr' ? <Phone className="h-3.5 w-3.5 text-blue-500" /> :
               userType === 'closer' ? <Handshake className="h-3.5 w-3.5 text-green-500" /> :
               userType === 'admin' ? <ShieldCheck className="h-3.5 w-3.5 text-red-500" /> :
               userType === 'manager' ? <Building2 className="h-3.5 w-3.5 text-purple-500" /> :
               <Users className="h-3.5 w-3.5 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium truncate">{salesperson?.name || "Usuário"}</p>
                <UserRoleBadge />
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{salesperson?.email || ""}</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
