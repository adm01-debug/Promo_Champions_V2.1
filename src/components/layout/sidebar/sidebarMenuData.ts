import {
  LayoutDashboard, ShoppingCart, Users, BarChart3, Bell, Trophy, Kanban,
  Phone, Activity, Handshake, Target, Bot, TrendingUp, Settings, LucideIcon,
  ShieldCheck, LineChart, Building2, Sparkles, FileText, Calendar, Zap,
  MailSearch, LayoutGrid, Columns, MailCheck, DollarSign, Swords, MapPin,
  Briefcase, Search, Gauge, MessageSquare, Package, Upload, Merge, Rocket,
  Filter, PartyPopper, Flag, Shield, Crown,
} from "lucide-react";

export interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface MenuGroup {
  label: string;
  icon: LucideIcon;
  items: MenuItem[];
}

export type ViewMode = 'sdr' | 'closer' | 'gestao';

export const sdrMainItems: MenuItem[] = [
  { title: "Dashboard", url: "/sdr", icon: LayoutDashboard },
  { title: "Pipeline", url: "/pipeline", icon: Kanban },
  { title: "Atividades", url: "/atividades", icon: Activity },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Ranking", url: "/ranking", icon: Trophy },
  { title: "Arena", url: "/arena", icon: Swords },
];

export const closerMainItems: MenuItem[] = [
  { title: "Dashboard", url: "/closer", icon: LayoutDashboard },
  { title: "Pipeline", url: "/pipeline", icon: Kanban },
  { title: "Orçamentos", url: "/orcamentos", icon: FileText },
  { title: "Vendas", url: "/vendas", icon: ShoppingCart },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Arena", url: "/arena", icon: Swords },
];

export const gestaoMainItems: MenuItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Vendedores", url: "/vendedores", icon: Users },
  { title: "Metas", url: "/metas", icon: Target },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Relatórios", url: "/relatorios", icon: LineChart },
];

export const sdrGroupedItems: MenuGroup[] = [
  {
    label: "Prospecção", icon: Search,
    items: [
      { title: "Cadências", url: "/cadencias", icon: Activity },
      { title: "Multichannel", url: "/multichannel", icon: MessageSquare },
      { title: "Email Tracking", url: "/email-tracking", icon: MailSearch },
      { title: "Automações", url: "/automacoes", icon: Zap },
    ],
  },
  {
    label: "CRM", icon: Briefcase,
    items: [
      { title: "Kanban Clientes", url: "/kanban-clientes", icon: Columns },
      { title: "Mapa Clientes", url: "/mapa-clientes", icon: MapPin },
      { title: "Calendário", url: "/calendario", icon: Calendar },
      { title: "Tarefas", url: "/tarefas", icon: Target },
    ],
  },
  {
    label: "Análises", icon: Gauge,
    items: [
      { title: "BI SDR", url: "/bi-sdr", icon: LineChart },
      { title: "Lead Scoring", url: "/lead-scoring", icon: Target },
      { title: "Meu Dashboard", url: "/dashboard-custom", icon: LayoutGrid },
      { title: "Desafios", url: "/desafios", icon: Sparkles },
      { title: "Assistente IA", url: "/assistente", icon: Bot },
    ],
  },
];

export const closerGroupedItems: MenuGroup[] = [
  {
    label: "Vendas", icon: DollarSign,
    items: [
      { title: "Assinatura Digital", url: "/assinatura-digital", icon: Target },
      { title: "Multichannel", url: "/multichannel", icon: MessageSquare },
      { title: "Email Tracking", url: "/email-tracking", icon: MailSearch },
      { title: "Automações", url: "/automacoes", icon: Zap },
    ],
  },
  {
    label: "CRM", icon: Briefcase,
    items: [
      { title: "Atividades", url: "/atividades", icon: Activity },
      { title: "Kanban Clientes", url: "/kanban-clientes", icon: Columns },
      { title: "Mapa Clientes", url: "/mapa-clientes", icon: MapPin },
      { title: "Calendário", url: "/calendario", icon: Calendar },
    ],
  },
  {
    label: "Análises", icon: Gauge,
    items: [
      { title: "BI Closer", url: "/bi-closer", icon: LineChart },
      { title: "Lead Scoring", url: "/lead-scoring", icon: Target },
      { title: "Meu Dashboard", url: "/dashboard-custom", icon: LayoutGrid },
      { title: "Desafios", url: "/desafios", icon: Sparkles },
      { title: "Assistente IA", url: "/assistente", icon: Bot },
    ],
  },
];

export const gestaoGroupedItems: MenuGroup[] = [
  {
    label: "Análises", icon: Gauge,
    items: [
      { title: "BI Gestão", url: "/bi-gestor", icon: LineChart },
      { title: "Análise de Funil", url: "/funil", icon: Filter },
      { title: "Lead Scoring", url: "/lead-scoring", icon: Target },
      { title: "Forecast", url: "/forecast", icon: TrendingUp },
      { title: "ROI Vendedores", url: "/roi", icon: DollarSign },
      { title: "Top Produtos", url: "/top-produtos", icon: Crown },
      { title: "Meu Dashboard", url: "/dashboard-custom", icon: LayoutGrid },
      { title: "Relatórios Email", url: "/relatorios-email", icon: MailCheck },
      { title: "Relatórios Agendados", url: "/relatorios-agendados", icon: Calendar },
    ],
  },
  {
    label: "CRM", icon: Briefcase,
    items: [
      { title: "Kanban Clientes", url: "/kanban-clientes", icon: Columns },
      { title: "Mapa Clientes", url: "/mapa-clientes", icon: MapPin },
      { title: "Calendário", url: "/calendario", icon: Calendar },
      { title: "Portfólio", url: "/portfolio", icon: Target },
      { title: "Estoque", url: "/estoque", icon: Package },
      { title: "NPS", url: "/nps", icon: MessageSquare },
      { title: "Deduplicação", url: "/deduplicacao", icon: Merge },
      { title: "Import/Export", url: "/importar-exportar", icon: Upload },
      { title: "Onboarding", url: "/onboarding-tracking", icon: Rocket },
    ],
  },
  {
    label: "Social", icon: PartyPopper,
    items: [
      { title: "Feed de Vitórias", url: "/feed-vitorias", icon: Trophy },
      { title: "Multichannel", url: "/multichannel", icon: MessageSquare },
    ],
  },
  {
    label: "Gestão de Equipe", icon: Building2,
    items: [
      { title: "Times", url: "/times", icon: Building2 },
      { title: "Metas Atividades", url: "/metas-atividades", icon: Target },
      { title: "Automações", url: "/automacoes", icon: Zap },
      { title: "Email Tracking", url: "/email-tracking", icon: MailSearch },
    ],
  },
  {
    label: "Prospecção", icon: Search,
    items: [
      { title: "ICP", url: "/icp", icon: Users },
      { title: "Playbooks", url: "/playbooks", icon: Target },
      { title: "Fonte de Leads", url: "/fonte-leads", icon: Target },
    ],
  },
];

export const systemItems: MenuItem[] = [
  { title: "Configurações", url: "/configuracoes", icon: Settings },
  { title: "Notificações", url: "/notificacoes", icon: Bell },
];

export const adminOnlyItems: MenuItem[] = [
  { title: "Admin", url: "/admin", icon: ShieldCheck },
  { title: "Telemetria", url: "/admin/telemetria", icon: Activity },
  { title: "Usage Analytics", url: "/usage-analytics", icon: BarChart3 },
  { title: "Feature Flags", url: "/feature-flags", icon: Flag },
  { title: "Segurança", url: "/seguranca", icon: Shield },
];

export const viewModes: { mode: ViewMode; label: string; icon: LucideIcon; color: string }[] = [
  { mode: 'sdr', label: 'SDR', icon: Phone, color: 'text-info' },
  { mode: 'closer', label: 'Closer', icon: Handshake, color: 'text-success' },
  { mode: 'gestao', label: 'Gestão', icon: Building2, color: 'text-primary' },
];

export function getMainItems(viewMode: ViewMode): MenuItem[] {
  switch (viewMode) {
    case 'sdr': return sdrMainItems;
    case 'closer': return closerMainItems;
    case 'gestao': return gestaoMainItems;
  }
}

export function getGroupedItems(viewMode: ViewMode): MenuGroup[] {
  switch (viewMode) {
    case 'sdr': return sdrGroupedItems;
    case 'closer': return closerGroupedItems;
    case 'gestao': return gestaoGroupedItems;
  }
}
