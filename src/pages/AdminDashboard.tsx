import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, RefreshCw, LayoutDashboard, Database, Shield, Zap, Search, Activity, BarChart3, LineChart, Mail, RefreshCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TestSDRAlertButton } from "@/components/sdr/TestSDRAlertButton";
import { CircuitBreakerDashboard } from "@/components/debug/CircuitBreakerDashboard";
import { EmailMetricsDashboard } from "@/components/analytics/EmailMetricsDashboard";
import { BackendAutomationMonitor } from "@/components/admin/BackendAutomationMonitor";
import { AutomationRulesPanel } from "@/components/admin/AutomationRulesPanel";
import { QuoteSyncLogsPanel } from "@/components/admin/QuoteSyncLogsPanel";
import { InboundReplyLogPanel } from "@/components/admin/InboundReplyLogPanel";
import { ExternalDBSettings } from "@/components/admin/ExternalDBSettings";
import { AdminQuickStats } from "@/components/admin/AdminQuickStats";
import { AdminSecurityPanel } from "@/components/admin/AdminSecurityPanel";
import { AdminSystemStatus } from "@/components/admin/AdminSystemStatus";
import { AdminQuickLinks } from "@/components/admin/AdminQuickLinks";
import { SemanticReindexPanel } from "@/components/admin/SemanticReindexPanel";
import { useAdminStats } from "@/hooks/admin/useAdminStats";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

function AdminDashboardContent() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminStats();
  const edgeStatus = stats?.edgeStatus;
  const queryMetrics = stats?.queryMetrics;

  if (statsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-background/50">
      <Helmet>
        <title>Painel Administrativo | Promo Champions</title>
        <meta name="description" content="Gerenciamento e monitoramento do sistema" />
      </Helmet>

      {/* Header HUD Style */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-display font-black gradient-text uppercase tracking-tighter italic">
              Central de Controle
            </h1>
          </div>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] ml-10">
            System Operations & Business Integrity Dashboard
          </p>
        </motion.div>

        <div className="flex items-center gap-3">
          <TestSDRAlertButton />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchStats()} 
            className="gap-2 bg-background/40 backdrop-blur-sm border-border/40 hover:bg-muted/50 transition-all font-bold uppercase text-[10px]"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar Telemetria
          </Button>
          <Button asChild variant="default" size="sm" className="gap-2 shadow-lg shadow-primary/20 font-bold uppercase text-[10px]">
            <Link to="/configuracoes">
              <Settings className="h-3.5 w-3.5" /> Configurações
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      {stats && <AdminQuickStats stats={stats} />}

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/30 p-1 border border-border/40 backdrop-blur-sm">
            <TabsTrigger value="overview" className="gap-2 font-bold uppercase text-[10px]"><LayoutDashboard className="h-3.5 w-3.5" /> Visão Geral</TabsTrigger>
            <TabsTrigger value="infrastructure" className="gap-2 font-bold uppercase text-[10px]"><Database className="h-3.5 w-3.5" /> Infraestrutura</TabsTrigger>
            <TabsTrigger value="automations" className="gap-2 font-bold uppercase text-[10px]"><Zap className="h-3.5 w-3.5" /> Automações</TabsTrigger>
            <TabsTrigger value="intelligence" className="gap-2 font-bold uppercase text-[10px]"><Search className="h-3.5 w-3.5" /> IA & Busca</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 lg:grid-cols-2">
            <AdminSecurityPanel
              recentAccessDenied={stats?.recentAccessDenied ?? []}
              recentSecurityAlerts={stats?.recentSecurityAlerts ?? []}
              recentSDRAlerts={stats?.recentSDRAlerts ?? []}
            />
            <AdminSystemStatus edgeStatus={edgeStatus} queryMetrics={queryMetrics || { totalQueries: 0, avgDuration: 0, slowQueries: 0 }} />
          </div>
          <AdminQuickLinks />
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-display font-black uppercase tracking-widest italic">Performance & Health</h3>
              </div>
              <CircuitBreakerDashboard />
              <ExternalDBSettings />
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-display font-black uppercase tracking-widest italic">Análise de Dados</h3>
              </div>
              <EmailMetricsDashboard />
              <QuoteSyncLogsPanel />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="automations" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <AutomationRulesPanel />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <BackendAutomationMonitor />
              <InboundReplyLogPanel />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-4xl">
            <SemanticReindexPanel />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requireAdminOrManager>
      <PageTransition>
        <AdminDashboardContent />
      </PageTransition>
    </ProtectedRoute>
  );
}
