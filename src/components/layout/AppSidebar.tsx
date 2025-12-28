import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Users2,
  Package, 
  BarChart3, 
  Bell,
  Trophy,
  PieChart,
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
  Sparkles,
  TrendingUp,
  Settings,
  Link2,
  Briefcase,
  LucideIcon,
  ShieldCheck,
  LineChart,
  BarChart2,
  Zap
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { UserRoleBadge } from "@/components/layout/UserRoleBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useAlerts } from "@/hooks/useAlerts";
import { useUserRoles } from "@/hooks/useUserRoles";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
  requireAdminOrManager?: boolean;
}

const mainItems: MenuItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Meu BI", url: "/bi-vendedor", icon: LineChart },
  { title: "BI Gestão", url: "/bi-gestor", icon: BarChart2, requireAdminOrManager: true },
  { title: "Pipeline", url: "/pipeline", icon: Kanban },
  { title: "Metas", url: "/metas", icon: Target, requireAdminOrManager: true },
  { title: "Vendas", url: "/vendas", icon: ShoppingCart },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3, requireAdminOrManager: true },
];

const teamItems: MenuItem[] = [
  { title: "Vendedores", url: "/vendedores", icon: Trophy, requireAdminOrManager: true },
  { title: "Atribuições SDR", url: "/times", icon: GitBranch, requireAdminOrManager: true },
  { title: "Portfólio", url: "/portfolio", icon: Briefcase, requireAdminOrManager: true },
  { title: "ICP", url: "/icp", icon: Target, requireAdminOrManager: true },
  { title: "Ranking Competitivo", url: "/ranking", icon: Swords },
  { title: "Desafios Semanais", url: "/desafios", icon: Trophy },
  { title: "Desafios Diários", url: "/desafios-diarios", icon: Zap },
  { title: "SDR Dashboard", url: "/sdr", icon: Phone },
  { title: "Closer Dashboard", url: "/closer", icon: Handshake },
  { title: "Cadências", url: "/cadencias", icon: GitBranch },
  { title: "Atividades", url: "/atividades", icon: Activity },
  { title: "Metas Atividades", url: "/metas-atividades", icon: Crosshair },
  { title: "Relatório Atividades", url: "/relatorio-atividades", icon: BarChart3, requireAdminOrManager: true },
  { title: "Tarefas", url: "/tarefas", icon: ClipboardList },
  { title: "Playbooks", url: "/playbooks", icon: BookOpen, requireAdminOrManager: true },
  { title: "Fonte de Leads", url: "/fonte-leads", icon: Target, requireAdminOrManager: true },
  { title: "Analytics", url: "/analytics", icon: PieChart, requireAdminOrManager: true },
  { title: "Assistente IA", url: "/assistente", icon: Bot },
];

const systemItems: MenuItem[] = [
  { title: "Admin", url: "/admin", icon: ShieldCheck, requireAdminOrManager: true },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
  { title: "Bitrix24", url: "/bitrix24", icon: Link2, requireAdminOrManager: true },
  { title: "Notificações", url: "/notificacoes", icon: Bell },
  { title: "Animações", url: "/animacoes", icon: Sparkles },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { data: alerts } = useAlerts();
  const alertCount = alerts?.length || 0;
  const { salesperson } = useAuth();
  const { isAdminOrManager, isLoadingCurrentRole } = useUserRoles();

  // Filter items based on user permissions
  const filterItems = (items: MenuItem[]) => {
    if (isLoadingCurrentRole) return items; // Show all while loading
    return items.filter(item => !item.requireAdminOrManager || isAdminOrManager);
  };

  const visibleMainItems = filterItems(mainItems);
  const visibleTeamItems = filterItems(teamItems);
  const visibleSystemItems = filterItems(systemItems);

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-gradient-to-b from-sidebar to-sidebar/95">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-glow-primary transition-shadow duration-300">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold gradient-text">SalesPro</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Dashboard</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 uppercase text-[10px] tracking-widest font-medium mb-2">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {visibleMainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink 
                      to={item.url} 
                      end 
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/50 group/item"
                      activeClassName="bg-primary/10 text-primary border-l-2 border-primary shadow-sm"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover/item:scale-110" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 uppercase text-[10px] tracking-widest font-medium mb-2">
            Equipe
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {visibleTeamItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink 
                      to={item.url} 
                      end 
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/50 group/item"
                      activeClassName="bg-primary/10 text-primary border-l-2 border-primary shadow-sm"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover/item:scale-110" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 uppercase text-[10px] tracking-widest font-medium mb-2">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {visibleSystemItems.map((item) => {
                const isNotifications = item.title === "Notificações";
                const hasAlerts = isNotifications && alertCount > 0;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink 
                        to={item.url} 
                        end 
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/50 group/item"
                        activeClassName="bg-primary/10 text-primary border-l-2 border-primary shadow-sm"
                      >
                        <div className="relative">
                          <item.icon className={cn(
                            "h-4 w-4 flex-shrink-0 transition-all duration-200 group-hover/item:scale-110",
                            hasAlerts && "text-warning animate-bounce"
                          )} />
                          {hasAlerts && (
                            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center shadow-sm animate-pulse">
                              {alertCount > 9 ? "9+" : alertCount}
                            </span>
                          )}
                        </div>
                        {!isCollapsed && <span className="font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!isCollapsed && (
          <div className="glass rounded-xl p-3 border border-border/30 hover:border-primary/30 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-sm">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{salesperson?.name || "Usuário"}</p>
                  <UserRoleBadge />
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{salesperson?.email || ""}</p>
              </div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
