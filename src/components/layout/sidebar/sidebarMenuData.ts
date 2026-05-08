import {
  LayoutDashboard, ShoppingCart, Users, BarChart3, Bell, Trophy, Kanban,
  Phone, Activity, Handshake, Target, Bot, TrendingUp, Settings, LucideIcon,
  ShieldCheck, LineChart, Building2, Sparkles, FileText, Calendar, Zap,
  MailSearch, LayoutGrid, Columns, MailCheck, DollarSign, Swords, MapPin,
  Briefcase, Search, Gauge, MessageSquare, Package, Upload, Merge, Rocket,
  Filter, PartyPopper, Flag, Shield, Crown, ArrowUpDown, PieChart, Flame,
  Timer, HeartPulse, Rss, Wallet, CalendarClock, Webhook, ScrollText, Route, Workflow, Brain, BookOpen,
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
  { title: "Agenda", url: "/agenda", icon: CalendarClock },
  { title: "Ranking", url: "/ranking", icon: Trophy },
  { title: "Arena", url: "/arena", icon: Swords },
  { title: "Race Arena 🏎️", url: "/race-arena", icon: Flag },
];

export const closerMainItems: MenuItem[] = [
  { title: "Dashboard", url: "/closer", icon: LayoutDashboard },
  { title: "Pipeline", url: "/pipeline", icon: Kanban },
  { title: "Orçamentos", url: "/orcamentos", icon: FileText },
  { title: "Cadências de Orçamento", url: "/cadencias-orcamentos", icon: FileText },
  { title: "Vendas", url: "/vendas", icon: ShoppingCart },
  { title: "Comissões", url: "/comissoes", icon: Wallet },
  { title: "Agenda", url: "/agenda", icon: CalendarClock },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Arena", url: "/arena", icon: Swords },
  { title: "Race Arena 🏎️", url: "/race-arena", icon: Flag },
];

export const gestaoMainItems: MenuItem[] = [
  { title: "Vendedores", url: "/vendedores", icon: Users },
  { title: "Metas", url: "/metas", icon: Target },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Relatórios", url: "/relatorios", icon: LineChart },
  { title: "Race Arena 🏎️", url: "/race-arena", icon: Flag },
];

export const sdrGroupedItems: MenuGroup[] = [
  {
    label: "Prospecção", icon: Search,
    items: [
      { title: "Cadências", url: "/cadencias", icon: Activity },
      { title: "Sequências", url: "/sequences", icon: Activity },
      { title: "Composer IA (massa)", url: "/engagement/bulk-composer", icon: Sparkles },
      { title: "Send Time IA", url: "/engagement/send-time", icon: CalendarClock },
      { title: "Email Scoring", url: "/engagement/email-scoring", icon: Flame },
      { title: "ABM (Contas)", url: "/engagement/abm", icon: Building2 },
      { title: "Power Dialer", url: "/engagement/dialer", icon: Phone },
      { title: "Multichannel", url: "/multichannel", icon: MessageSquare },
      { title: "Email Tracking", url: "/email-tracking", icon: MailSearch },
      { title: "Conv. Intelligence", url: "/conversational-intelligence", icon: Sparkles },
      { title: "ABM (Contas)", url: "/abm", icon: Building2 },
      { title: "Automações", url: "/automacoes", icon: Zap },
      { title: "Sales Enablement", url: "/sales-enablement", icon: BookOpen },
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
      { title: "Perguntar à IA", url: "/perguntar", icon: Sparkles },
      { title: "Busca Inteligente", url: "/busca-inteligente", icon: Sparkles },
      { title: "Busca Semântica", url: "/busca", icon: Sparkles },
      { title: "Agentes IA", url: "/agentes", icon: Bot },
    ],
  },
];

export const closerGroupedItems: MenuGroup[] = [
  {
    label: "Vendas", icon: DollarSign,
    items: [
      { title: "Assinatura Digital", url: "/assinatura-digital", icon: Target },
      { title: "Aprovações", url: "/aprovacoes", icon: ShieldCheck },
      { title: "Multichannel", url: "/multichannel", icon: MessageSquare },
      { title: "Email Tracking", url: "/email-tracking", icon: MailSearch },
      { title: "Automações", url: "/automacoes", icon: Zap },
      { title: "Sales Enablement", url: "/sales-enablement", icon: BookOpen },
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
      { title: "Perguntar à IA", url: "/perguntar", icon: Sparkles },
      { title: "Busca Inteligente", url: "/busca-inteligente", icon: Sparkles },
      { title: "Busca Semântica", url: "/busca", icon: Sparkles },
      { title: "Agentes IA", url: "/agentes", icon: Bot },
    ],
  },
];

export const gestaoGroupedItems: MenuGroup[] = [
  {
    label: "Dashboard", icon: LayoutDashboard,
    items: [
      { title: "Visão Geral", url: "/", icon: LayoutDashboard },
      { title: "Performance", url: "/dashboard/performance", icon: Gauge },
      { title: "Análises", url: "/dashboard/analises", icon: BarChart3 },
      { title: "Competição", url: "/dashboard/competicao", icon: Trophy },
      { title: "Inteligência", url: "/dashboard/inteligencia", icon: Zap },
      { title: "Engajamento", url: "/dashboard/engajamento", icon: HeartPulse },
    ],
  },
  {
    label: "Análises", icon: Gauge,
    items: [
      { title: "BI Gestão", url: "/bi-gestor", icon: LineChart },
      { title: "Perguntar à IA", url: "/perguntar", icon: Sparkles },
      { title: "Busca Semântica", url: "/busca", icon: Sparkles },
      { title: "Agentes IA", url: "/agentes", icon: Bot },
      { title: "Análise de Funil", url: "/funil", icon: Filter },
      { title: "Relatório de Funil", url: "/relatorios/funil", icon: Filter },
      { title: "Cohort Heatmap", url: "/relatorios/cohort", icon: LayoutGrid },
      { title: "Lead Scoring", url: "/lead-scoring", icon: Target },
      { title: "Forecast", url: "/forecast", icon: TrendingUp },
      { title: "Inteligência Preditiva", url: "/inteligencia-preditiva", icon: Brain },
      { title: "Inteligência de Compras", url: "/inteligencia-compras", icon: Flame },
      { title: "Saúde dos Deals", url: "/deal-intelligence", icon: HeartPulse },
      { title: "Win/Loss Intelligence", url: "/win-loss-intelligence", icon: Crown },
      { title: "RevOps Hub", url: "/revops", icon: Gauge },
      { title: "Pricing Intelligence", url: "/pricing-intelligence", icon: DollarSign },
      { title: "Territory Optimization", url: "/territory-optimization", icon: MapPin },
      { title: "ROI Vendedores", url: "/roi", icon: DollarSign },
      { title: "Top Produtos", url: "/top-produtos", icon: Crown },
      { title: "Métricas Categoria", url: "/metricas-categoria", icon: PieChart },
      { title: "Evolução Preços", url: "/evolucao-precos", icon: ArrowUpDown },
      { title: "Benchmarking", url: "/benchmarking", icon: BarChart3 },
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
      { title: "Health Score", url: "/health-score", icon: HeartPulse },
      { title: "Customer Success", url: "/customer-success", icon: HeartPulse },
      { title: "Customer Success 360", url: "/customer-success-360", icon: HeartPulse },
    ],
  },
  {
    label: "Social", icon: PartyPopper,
    items: [
      { title: "Feed de Vitórias", url: "/feed-vitorias", icon: Trophy },
      { title: "Multichannel", url: "/multichannel", icon: MessageSquare },
      { title: "Temporadas", url: "/temporadas", icon: Flame },
    ],
  },
  {
    label: "Gestão de Equipe", icon: Building2,
    items: [
      { title: "Times", url: "/times", icon: Building2 },
      { title: "Metas Atividades", url: "/metas-atividades", icon: Target },
      { title: "Coaching Inteligente", url: "/coaching-inteligente", icon: Brain },
      { title: "Automação Inteligente", url: "/automacao-inteligente", icon: Sparkles },
      { title: "Automações", url: "/automacoes", icon: Zap },
      { title: "Workflow Builder", url: "/workflow-builder", icon: Workflow },
      { title: "Email Tracking", url: "/email-tracking", icon: MailSearch },
      { title: "Feed Equipe", url: "/feed-equipe", icon: Rss },
      { title: "Inatividade", url: "/gatilhos-inatividade", icon: Timer },
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
  { title: "Admin Race 🏎️", url: "/admin/race-arena", icon: Flag },
  { title: "Comissões (Admin)", url: "/admin/comissoes", icon: Wallet },
  { title: "Telemetria", url: "/admin/telemetria", icon: Activity },
  { title: "Audit Trail", url: "/audit-logs", icon: ScrollText },
  { title: "SLA Tracking", url: "/sla-tracking", icon: Timer },
  { title: "Lead Routing", url: "/lead-routing", icon: Route },
  { title: "Workflows", url: "/workflows", icon: Workflow },
  { title: "Usage Analytics", url: "/usage-analytics", icon: BarChart3 },
  { title: "Feature Flags", url: "/feature-flags", icon: Flag },
  { title: "Webhooks", url: "/webhooks", icon: Webhook },
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
