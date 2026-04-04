import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Activity, 
  Bell, 
  Settings, 
  TrendingUp,
  Clock,
  
  Zap,
  Database,
  Server,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  UserCog,
  Lock,
  BarChart3,
  FileText
} from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TestSDRAlertButton } from "@/components/sdr/TestSDRAlertButton";
import { CircuitBreakerDashboard } from "@/components/debug/CircuitBreakerDashboard";
import { EmailMetricsDashboard } from "@/components/analytics/EmailMetricsDashboard";
import { getQueryMetrics } from "@/hooks/useQueryPerformance";
import { BackendAutomationMonitor } from "@/components/admin/BackendAutomationMonitor";
import { QuoteSyncLogsPanel } from "@/components/admin/QuoteSyncLogsPanel";

// Quick stats hook
function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const sevenDaysAgo = startOfDay(subDays(new Date(), 7)).toISOString();

      const [
        { count: totalUsers },
        { count: totalSalespeople },
        { count: accessDeniedCount },
        { count: securityAlertsCount },
        { count: sdrAlertsCount },
        { data: recentAccessDenied },
        { data: recentSecurityAlerts },
        { data: recentSDRAlerts },
        { data: userRoles }
      ] = await Promise.all([
        supabase.from("user_roles").select("*", { count: "exact", head: true }),
        supabase.from("salespeople").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("access_denied_logs").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
        supabase.from("security_alert_history").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
        supabase.from("sdr_alert_history").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
        supabase.from("access_denied_logs").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("security_alert_history").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("sdr_alert_history").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("user_roles").select("role")
      ]);

      // Count roles
      const roleDistribution = {
        admin: 0,
        manager: 0,
        salesperson: 0
      };
      userRoles?.forEach((r: { role: string }) => {
        if (r.role in roleDistribution) {
          roleDistribution[r.role as keyof typeof roleDistribution]++;
        }
      });

      return {
        totalUsers: totalUsers || 0,
        totalSalespeople: totalSalespeople || 0,
        accessDeniedCount: accessDeniedCount || 0,
        securityAlertsCount: securityAlertsCount || 0,
        sdrAlertsCount: sdrAlertsCount || 0,
        recentAccessDenied: recentAccessDenied || [],
        recentSecurityAlerts: recentSecurityAlerts || [],
        recentSDRAlerts: recentSDRAlerts || [],
        roleDistribution
      };
    },
    staleTime: 60000,
  });
}

// Edge functions status hook
function useEdgeFunctionsStatus() {
  return useQuery({
    queryKey: ["edge-functions-status"],
    queryFn: async () => {
      // Check recent sync logs for bitrix24
      const { data: bitrixLogs } = await supabase
        .from("bitrix24_sync_logs")
        .select("status, created_at")
        .order("created_at", { ascending: false })
        .limit(1);

      // Check circuit breaker events
      const { data: circuitEvents } = await supabase
        .from("circuit_breaker_events")
        .select("circuit_name, new_state, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      const openCircuits = circuitEvents?.filter(e => e.new_state === "OPEN") || [];

      return {
        bitrixLastSync: bitrixLogs?.[0] || null,
        openCircuits,
        circuitEvents: circuitEvents || []
      };
    },
    staleTime: 30000,
  });
}

function AdminDashboardContent() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { data: edgeStatus, isLoading: edgeLoading } = useEdgeFunctionsStatus();
  const queryMetrics = getQueryMetrics();

  if (statsLoading || edgeLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold gradient-text">
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do sistema, segurança e alertas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TestSDRAlertButton />
          <Button variant="outline" size="sm" onClick={() => refetchStats()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button asChild variant="default" size="sm" className="gap-2">
            <Link to="/configuracoes">
              <Settings className="h-4 w-4" />
              Configurações
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-border/40 hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Totais</p>
                <p className="text-3xl font-bold gradient-text">{stats?.totalUsers}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {stats?.roleDistribution.admin} admin
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {stats?.roleDistribution.manager} manager
                  </Badge>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/40 hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vendedores Ativos</p>
                <p className="text-3xl font-bold gradient-text">{stats?.totalSalespeople}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Contas de vendedores ativos
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/5">
                <UserCog className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/40 hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acessos Negados (7d)</p>
                <p className="text-3xl font-bold text-destructive">{stats?.accessDeniedCount}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Tentativas de acesso bloqueadas
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/5">
                <Lock className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/40 hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Enviados (7d)</p>
                <p className="text-3xl font-bold text-warning">
                  {(stats?.securityAlertsCount || 0) + (stats?.sdrAlertsCount || 0)}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs text-destructive">
                    {stats?.securityAlertsCount} segurança
                  </Badge>
                  <Badge variant="outline" className="text-xs text-warning">
                    {stats?.sdrAlertsCount} SDR
                  </Badge>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5">
                <Bell className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Security & Alerts */}
        <Card className="glass border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-display">
                <div className="p-1.5 rounded-md bg-gradient-to-br from-destructive/20 to-destructive/5">
                  <Shield className="h-4 w-4 text-destructive" />
                </div>
                Segurança & Alertas
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="gap-1.5">
                <Link to="/notificacoes">
                  Ver todos
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="access" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-4">
                <TabsTrigger value="access" className="text-xs">
                  Acessos Negados
                </TabsTrigger>
                <TabsTrigger value="security" className="text-xs">
                  Alertas Segurança
                </TabsTrigger>
                <TabsTrigger value="sdr" className="text-xs">
                  Alertas SDR
                </TabsTrigger>
              </TabsList>

              <TabsContent value="access">
                <ScrollArea className="h-[280px]">
                  {stats?.recentAccessDenied?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm">Nenhum acesso negado recente</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {stats?.recentAccessDenied?.map((log: any) => (
                        <div key={log.id} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium truncate max-w-[200px]">
                              {log.user_email || "Usuário desconhecido"}
                            </span>
                            <Badge variant="destructive" className="text-xs">
                              {log.user_role || "N/A"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Tentou acessar: <code className="text-destructive">{log.attempted_path}</code>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {format(new Date(log.created_at), "dd/MM HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="security">
                <ScrollArea className="h-[280px]">
                  {stats?.recentSecurityAlerts?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm">Nenhum alerta de segurança recente</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {stats?.recentSecurityAlerts?.map((alert: any) => (
                        <div key={alert.id} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Pico de Acessos Negados
                            </Badge>
                          </div>
                          <p className="text-sm">
                            <span className="font-medium">{alert.access_count}</span> acessos negados em{" "}
                            <span className="font-medium">{alert.time_window_hours}h</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {format(new Date(alert.created_at), "dd/MM HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="sdr">
                <ScrollArea className="h-[280px]">
                  {stats?.recentSDRAlerts?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm">Nenhum alerta SDR recente</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {stats?.recentSDRAlerts?.map((alert: any) => (
                        <div key={alert.id} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="gap-1 text-warning border-warning">
                              <Activity className="h-3 w-3" />
                              {alert.sdrs_notified} SDR(s) abaixo da meta
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {alert.triggered_by === "manual" ? "Manual" : "Automático"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Threshold: {alert.threshold_used} dias consecutivos
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {format(new Date(alert.created_at), "dd/MM HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="glass border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-chart-3/20 to-chart-3/5">
                <Server className="h-4 w-4 text-chart-3" />
              </div>
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Edge Functions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Edge Functions
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "sdr-consecutive-alerts", schedule: "8h diário" },
                  { name: "activity-goal-alerts", schedule: "15h diário" },
                  { name: "access-denied-alerts", schedule: "Horário" },
                  { name: "auto-reassign-inactive", schedule: "6h diário" },
                  { name: "bitrix24-sync", schedule: "Horário" },
                  { name: "check-lead-sla", schedule: "Configurável" },
                ].map((fn) => (
                  <div key={fn.name} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{fn.name}</p>
                      <p className="text-[10px] text-muted-foreground">{fn.schedule}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bitrix24 Sync Status */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Bitrix24 Sync</span>
                </div>
                {edgeStatus?.bitrixLastSync ? (
                  <Badge variant={edgeStatus.bitrixLastSync.status === "success" ? "default" : "destructive"}>
                    {edgeStatus.bitrixLastSync.status === "success" ? "OK" : "Erro"}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Sem dados</Badge>
                )}
              </div>
              {edgeStatus?.bitrixLastSync && (
                <p className="text-xs text-muted-foreground mt-2">
                  Última sync: {format(new Date(edgeStatus.bitrixLastSync.created_at), "dd/MM HH:mm", { locale: ptBR })}
                </p>
              )}
            </div>

            {/* Circuit Breaker Status */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-chart-4" />
                  <span className="text-sm font-medium">Circuit Breakers</span>
                </div>
                {edgeStatus?.openCircuits?.length === 0 ? (
                  <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/30">
                    Todos fechados
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    {edgeStatus?.openCircuits?.length} aberto(s)
                  </Badge>
                )}
              </div>
              {edgeStatus?.openCircuits && edgeStatus.openCircuits.length > 0 && (
                <div className="space-y-1">
                  {edgeStatus.openCircuits.map((circuit: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-destructive">
                      <XCircle className="h-3 w-3" />
                      {circuit.circuit_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Query Performance */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-chart-5" />
                  <span className="text-sm font-medium">Performance Queries</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold">{queryMetrics.totalQueries}</p>
                  <p className="text-[10px] text-muted-foreground">Total</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{queryMetrics.avgDuration}ms</p>
                  <p className="text-[10px] text-muted-foreground">Média</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-warning">{queryMetrics.slowQueries}</p>
                  <p className="text-[10px] text-muted-foreground">Lentas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="glass border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            Acesso Rápido
          </CardTitle>
          <CardDescription>Links para áreas administrativas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { to: "/configuracoes", icon: Settings, label: "Configurações", color: "text-muted-foreground" },
              { to: "/vendedores", icon: Users, label: "Vendedores", color: "text-chart-1" },
              { to: "/times", icon: Activity, label: "Atribuições SDR", color: "text-chart-2" },
              { to: "/portfolio", icon: FileText, label: "Portfólio", color: "text-chart-3" },
              { to: "/notificacoes", icon: Bell, label: "Notificações", color: "text-warning" },
              { to: "/bitrix24", icon: Database, label: "Bitrix24", color: "text-chart-4" },
              { to: "/analytics", icon: BarChart3, label: "Analytics", color: "text-chart-5" },
              { to: "/metas", icon: TrendingUp, label: "Metas", color: "text-primary" },
              { to: "/playbooks", icon: FileText, label: "Playbooks", color: "text-chart-1" },
              { to: "/fonte-leads", icon: TrendingUp, label: "Fonte Leads", color: "text-chart-2" },
              { to: "/relatorio-atividades", icon: BarChart3, label: "Rel. Atividades", color: "text-chart-3" },
              { to: "/icp", icon: TrendingUp, label: "ICP", color: "text-chart-4" },
            ].map((link) => (
              <Button
                key={link.to}
                asChild
                variant="outline"
                className="h-auto flex-col gap-2 py-4 hover:bg-muted/50"
              >
                <Link to={link.to}>
                  <link.icon className={`h-5 w-5 ${link.color}`} />
                  <span className="text-xs">{link.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backend Automation Monitor */}
      <BackendAutomationMonitor />

      {/* Circuit Breaker Dashboard */}
      <CircuitBreakerDashboard />

      {/* Email Metrics Dashboard */}
      <EmailMetricsDashboard />

      {/* Quote Sync Logs */}
      <QuoteSyncLogsPanel />
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requireAdminOrManager>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
