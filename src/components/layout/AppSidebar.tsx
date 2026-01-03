import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
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
  Zap,
  UserCheck,
  Search,
  Mail,
  Calendar,
  FileText,
  DollarSign,
  Percent,
  Users2,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle
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
  roles?: ('admin' | 'manager' | 'sdr' | 'closer' | 'salesperson')[];
  badge?: string;
}

// ============================================
// SDR - Foco em Prospecção e Qualificação
// ============================================
const sdrItems: MenuItem[] = [
  { title: "SDR Dashboard", url: "/sdr", icon: Phone, roles: ['sdr', 'admin', 'manager'] },
  { title: "Meu BI", url: "/bi-vendedor", icon: LineChart, roles: ['sdr', 'closer', 'salesperson', 'admin', 'manager'] },
  { title: "Pipeline", url: "/pipeline", icon: Kanban, roles: ['sdr', 'closer', 'salesperson', 'admin', 'manager'] },
  { title: "Cadências", url: "/cadencias", icon: GitBranch, roles: ['sdr', 'closer', 'admin', 'manager'] },
  { title: "Atividades", url: "/atividades", icon: Activity, roles: ['sdr', 'closer', 'salesperson', 'admin', 'manager'] },
  { title: "Metas Atividades", url: "/metas-atividades", icon: Crosshair, roles: ['sdr', 'closer', 'salesperson', 'admin', 'manager'] },
  { title: "Clientes", url: "/clientes", icon: Users, roles: ['sdr', 'closer', 'salesperson', 'admin', 'manager'] },
  { title: "Tarefas", url: "/tarefas", icon: ClipboardList, roles: ['sdr', 'closer', 'salesperson', 'admin', 'manager'] },
];

// ============================================
// CLOSER - Foco em Fechamento
// ============================================
const closerItems: MenuItem[] = [
  { title: "Closer Dashboard", url: "/closer", icon: Handshake, roles: ['closer', 'admin', 'manager'] },
  { title: "Vendas", url: "/vendas", icon: ShoppingCart, roles: ['closer', 'salesperson', 'admin', 'manager'] },
  { title: "Assinatura Digital", url: "/assinatura-digital", icon: FileText, roles: ['closer', 'admin', 'manager'] },
];

// ============================================
// GAMIFICAÇÃO - Comum a todos
// ============================================
const gamificationItems: MenuItem[] = [
  { title: "Ranking", url: "/ranking", icon: Swords },
  { title: "Desafios Semanais", url: "/desafios", icon: Trophy },
  { title: "Desafios Diários", url: "/desafios-diarios", icon: Zap },
  { title: "Assistente IA", url: "/assistente", icon: Bot },
];

// ============================================
// GESTÃO - Admin e Manager
// ============================================
const managementItems: MenuItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ['admin', 'manager'] },
  { title: "BI Gestão", url: "/bi-gestor", icon: BarChart2, roles: ['admin', 'manager'] },
  { title: "Vendedores", url: "/vendedores", icon: Users2, roles: ['admin', 'manager'] },
  { title: "Times", url: "/times", icon: Building2, roles: ['admin', 'manager'] },
  { title: "Metas", url: "/metas", icon: Target, roles: ['admin', 'manager'] },
  { title: "Portfólio", url: "/portfolio", icon: Briefcase, roles: ['admin', 'manager'] },
  { title: "ICP", url: "/icp", icon: UserCheck, roles: ['admin', 'manager'] },
  { title: "Playbooks", url: "/playbooks", icon: BookOpen, roles: ['admin', 'manager'] },
  { title: "Fonte de Leads", url: "/fonte-leads", icon: Search, roles: ['admin', 'manager'] },
];

// ============================================
// RELATÓRIOS - Admin e Manager
// ============================================
const reportItems: MenuItem[] = [
  { title: "Analytics", url: "/analytics", icon: PieChart, roles: ['admin', 'manager'] },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3, roles: ['admin', 'manager'] },
  { title: "Relatório Atividades", url: "/relatorio-atividades", icon: Activity, roles: ['admin', 'manager'] },
  { title: "Previsão Demanda", url: "/previsao-demanda", icon: TrendingUp, roles: ['admin', 'manager'] },
];

// ============================================
// SISTEMA - Configurações
// ============================================
const systemItems: MenuItem[] = [
  { title: "Admin", url: "/admin", icon: ShieldCheck, roles: ['admin'] },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
  { title: "Bitrix24", url: "/bitrix24", icon: Link2, roles: ['admin', 'manager'] },
  { title: "Notificações", url: "/notificacoes", icon: Bell },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { data: alerts } = useAlerts();
  const alertCount = alerts?.length || 0;
  const { salesperson } = useAuth();
  const { currentUserRole, isAdminOrManager, isLoadingCurrentRole } = useUserRoles();

  // Determinar o tipo de usuário baseado no role ou nome
  const getUserType = (): 'admin' | 'manager' | 'sdr' | 'closer' | 'salesperson' => {
    const role = currentUserRole?.role;
    if (role === 'admin') return 'admin';
    if (role === 'manager') return 'manager';
    
    // Verificar pelo nome do salesperson (pode ser customizado)
    const name = salesperson?.name?.toLowerCase() || '';
    if (name.includes('sdr')) return 'sdr';
    if (name.includes('closer')) return 'closer';
    
    return 'salesperson';
  };

  const userType = getUserType();

  // Filtrar items baseado no tipo de usuário
  const filterItems = (items: MenuItem[]) => {
    if (isLoadingCurrentRole) return [];
    return items.filter(item => {
      if (!item.roles) return true; // Item visível para todos
      return item.roles.includes(userType);
    });
  };

  // Definir quais seções mostrar baseado no tipo de usuário
  const showSDRSection = ['sdr', 'closer', 'admin', 'manager'].includes(userType);
  const showCloserSection = ['closer', 'admin', 'manager'].includes(userType);
  const showManagementSection = ['admin', 'manager'].includes(userType);
  const showReportsSection = ['admin', 'manager'].includes(userType);

  const visibleSdrItems = filterItems(sdrItems);
  const visibleCloserItems = filterItems(closerItems);
  const visibleGamificationItems = gamificationItems;
  const visibleManagementItems = filterItems(managementItems);
  const visibleReportItems = filterItems(reportItems);
  const visibleSystemItems = filterItems(systemItems);

  const renderMenuSection = (
    label: string, 
    items: MenuItem[], 
    icon?: LucideIcon,
    accentColor?: string
  ) => {
    if (items.length === 0) return null;

    const Icon = icon;

    return (
      <SidebarGroup>
        <SidebarGroupLabel className={cn(
          "text-muted-foreground/60 uppercase text-[10px] tracking-widest font-medium mb-2 flex items-center gap-2",
          accentColor
        )}>
          {Icon && <Icon className="h-3 w-3" />}
          {label}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="space-y-1">
            {items.map((item) => {
              const isNotifications = item.title === "Notificações";
              const hasAlerts = isNotifications && alertCount > 0;
              
              return (
                <SidebarMenuItem key={item.title + item.url}>
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
                      {!isCollapsed && (
                        <span className="font-medium flex-1">{item.title}</span>
                      )}
                      {!isCollapsed && item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  // Determinar o dashboard inicial baseado no tipo de usuário
  const getHomeDashboard = () => {
    switch (userType) {
      case 'sdr': return { title: "SDR Home", url: "/sdr", icon: Phone };
      case 'closer': return { title: "Closer Home", url: "/closer", icon: Handshake };
      case 'admin':
      case 'manager': return { title: "Dashboard", url: "/", icon: LayoutDashboard };
      default: return { title: "Meu BI", url: "/bi-vendedor", icon: LineChart };
    }
  };

  const homeDashboard = getHomeDashboard();

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
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {userType === 'sdr' ? 'SDR' : 
                 userType === 'closer' ? 'Closer' : 
                 userType === 'admin' ? 'Admin' : 
                 userType === 'manager' ? 'Gestão' : 'Vendas'}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Home Dashboard */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={homeDashboard.title}>
                  <NavLink 
                    to={homeDashboard.url} 
                    end 
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/50 group/item"
                    activeClassName="bg-primary/10 text-primary border-l-2 border-primary shadow-sm"
                  >
                    <homeDashboard.icon className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover/item:scale-110" />
                    {!isCollapsed && <span className="font-medium">{homeDashboard.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SDR Section */}
        {showSDRSection && renderMenuSection("Prospecção", visibleSdrItems, Search, "text-blue-400")}

        {/* Closer Section */}
        {showCloserSection && renderMenuSection("Fechamento", visibleCloserItems, Handshake, "text-green-400")}

        {/* Gamification - All users */}
        {renderMenuSection("Gamificação", visibleGamificationItems, Trophy, "text-yellow-400")}

        {/* Management - Admin/Manager only */}
        {showManagementSection && renderMenuSection("Gestão", visibleManagementItems, Building2, "text-purple-400")}

        {/* Reports - Admin/Manager only */}
        {showReportsSection && renderMenuSection("Relatórios", visibleReportItems, BarChart3, "text-orange-400")}

        {/* System */}
        {renderMenuSection("Sistema", visibleSystemItems, Settings)}
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!isCollapsed && (
          <div className="glass rounded-xl p-3 border border-border/30 hover:border-primary/30 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center shadow-sm",
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
