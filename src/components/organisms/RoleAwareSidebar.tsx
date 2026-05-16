import React, { memo } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings, 
  Gamepad2,
  Package,
  ShoppingCart,
  Zap,
  Bot,
  PieChart,
  Search,
  MessageSquare,
  Network,
  Truck,
  HeartPulse,
  Award,
  Library,
  Layers,
  Globe,
  Database,
  ShieldCheck,
  Terminal,
  Trophy,
  History,
  Rocket,
  Flag,
  Share2,
  Cpu,
  LineChart,
  TrendingUp,
  Brain,
  ShoppingCart as ShoppingCartIcon,
  Briefcase,
  UserCheck,
  Mail,
  Smartphone,
  CheckCircle2,
  Workflow,
  Activity,
  UserPlus,
  Compass,
  CreditCard,
  Building,
  TableProperties
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavItem } from "@/components/navigation/NavItem";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as Pages from "@/routes/lazyPages";

export const RoleAwareSidebar = memo(() => {
  const { userRole } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isAdmin = userRole === "admin";
  const isManager = userRole === "admin" || userRole === "manager";

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-sidebar/40 backdrop-blur-xl">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Trophy className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-bold tracking-tight text-foreground">Promo Champions</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          {/* Main Dashboard */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 px-4 mb-2">Visão Geral</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem title="Dashboard" url="/dashboard" icon={LayoutDashboard} isCollapsed={isCollapsed} component={Pages.Index} />
                <NavItem title="Atividades" url="/atividades" icon={Activity} isCollapsed={isCollapsed} component={Pages.Atividades} />
                <NavItem title="Calendário" url="/calendario" icon={Calendar} isCollapsed={isCollapsed} component={Pages.Calendario} />
                <NavItem title="Tarefas" url="/tarefas" icon={CheckCircle2} isCollapsed={isCollapsed} component={Pages.Tarefas} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* CRM Core */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 px-4 mb-2">CRM Core</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem title="Vendas" url="/vendas" icon={ShoppingCart} isCollapsed={isCollapsed} component={Pages.Vendas} />
                <NavItem title="Clientes" url="/clientes" icon={Users} isCollapsed={isCollapsed} component={Pages.Clientes} />
                <NavItem title="Produtos" url="/produtos" icon={Package} isCollapsed={isCollapsed} component={Pages.Produtos} />
                <NavItem title="Pipeline" url="/pipeline" icon={Target} isCollapsed={isCollapsed} component={Pages.Pipeline} />
                <NavItem title="Estoque" url="/estoque" icon={Database} isCollapsed={isCollapsed} component={Pages.Estoque} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Prospecção e Engajamento */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 px-4 mb-2">Engajamento</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem title="Cadências" url="/cadencias" icon={Network} isCollapsed={isCollapsed} component={Pages.Cadencias} />
                <NavItem title="Follow-up" url="/follow-up" icon={History} isCollapsed={isCollapsed} component={Pages.FollowUpInteligente} />
                <NavItem title="Dialer" url="/engagement/dialer" icon={Smartphone} isCollapsed={isCollapsed} component={Pages.PowerDialer} />
                <NavItem title="Automações" url="/automacoes" icon={Zap} isCollapsed={isCollapsed} component={Pages.Automacoes} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Inteligência & AI */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 px-4 mb-2">Inteligência</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem title="Assistente IA" url="/assistente" icon={Bot} isCollapsed={isCollapsed} component={Pages.Assistente} />
                <NavItem title="Busca Semântica" url="/semantic-search" icon={Search} isCollapsed={isCollapsed} component={Pages.SemanticSearch} />
                <NavItem title="Conversational" url="/conversational-intelligence" icon={MessageSquare} isCollapsed={isCollapsed} component={Pages.ConversationalIntelligence} />
                <NavItem title="Revenue Intel" url="/revenue-intelligence" icon={TrendingUp} isCollapsed={isCollapsed} component={Pages.RevenueIntelligence} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Analytics e BI */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 px-4 mb-2">Performance</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem title="Analytics" url="/analytics" icon={BarChart3} isCollapsed={isCollapsed} component={Pages.Analytics} />
                <NavItem title="Relatórios" url="/relatorios" icon={FileText} isCollapsed={isCollapsed} component={Pages.Relatorios} />
                <NavItem title="BI Gestor" url="/bi-gestor" icon={PieChart} isCollapsed={isCollapsed} component={Pages.BIGestor} />
                <NavItem title="NPS" url="/nps" icon={HeartPulse} isCollapsed={isCollapsed} component={Pages.NPSDashboard} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Gamificação */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 px-4 mb-2">Gamificação</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem title="Ranking" url="/ranking" icon={Award} isCollapsed={isCollapsed} component={Pages.RankingCompetitivo} />
                <NavItem title="Race Arena" url="/race-arena" icon={Rocket} isCollapsed={isCollapsed} component={Pages.RaceArena} />
                <NavItem title="Badges" url="/gamificacao/badges" icon={Trophy} isCollapsed={isCollapsed} component={Pages.BadgesGalleryPage} />
                <NavItem title="Desafios" url="/desafios" icon={Gamepad2} isCollapsed={isCollapsed} component={Pages.DesafiosSemanais} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Gestão e Estratégia */}
          {isManager && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 px-4 mb-2">Gestão</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem title="Vendedores" url="/vendedores" icon={UserCheck} isCollapsed={isCollapsed} component={Pages.Vendedores} />
                  <NavItem title="Times" url="/times" icon={Users} isCollapsed={isCollapsed} component={Pages.Times} />
                  <NavItem title="Metas" url="/metas" icon={Target} isCollapsed={isCollapsed} component={Pages.Metas} />
                  <NavItem title="Territórios" url="/territorios" icon={Compass} isCollapsed={isCollapsed} component={Pages.Territorios} />
                </NavItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          )}

          {/* Admin e Config */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 px-4 mb-2">Sistema</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isAdmin && <NavItem title="Admin" url="/admin" icon={ShieldCheck} isCollapsed={isCollapsed} component={Pages.AdminDashboard} />}
                <NavItem title="Configurações" url="/configuracoes" icon={Settings} isCollapsed={isCollapsed} component={Pages.Configuracoes} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-foreground">Usuário Logado</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">{userRole}</span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
});

RoleAwareSidebar.displayName = "RoleAwareSidebar";