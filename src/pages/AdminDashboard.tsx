import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TestSDRAlertButton } from "@/components/sdr/TestSDRAlertButton";
import { CircuitBreakerDashboard } from "@/components/debug/CircuitBreakerDashboard";
import { EmailMetricsDashboard } from "@/components/analytics/EmailMetricsDashboard";
import { getQueryMetrics } from "@/hooks/useQueryPerformance";
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
import { useAdminStats, useEdgeFunctionsStatus } from "@/hooks/useAdminStats";
import { PageTransition } from "@/components/transitions/PageTransition";

function AdminDashboardContent() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminStats();
  const edgeStatus = stats?.edgeStatus;
  const queryMetrics = stats?.queryMetrics;

  if (statsLoading) {
    return (
      <>
        <Helmet>
          <title>Painel Administrativo | Promo Champions</title>
          <meta name="description" content="Gerenciamento e monitoramento do sistema" />
        </Helmet>
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
      </>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold gradient-text">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-1">Visão geral do sistema, segurança e alertas</p>
        </div>
        <div className="flex items-center gap-2">
          <TestSDRAlertButton />
          <Button variant="outline" size="sm" onClick={() => refetchStats()} className="gap-2">
            <RefreshCw className="h-4 w-4" />Atualizar
          </Button>
          <Button asChild variant="default" size="sm" className="gap-2">
            <Link to="/configuracoes"><Settings className="h-4 w-4" />Configurações</Link>
          </Button>
        </div>
      </div>

      {stats && <AdminQuickStats stats={stats} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminSecurityPanel
          recentAccessDenied={stats?.recentAccessDenied ?? []}
          recentSecurityAlerts={stats?.recentSecurityAlerts ?? []}
          recentSDRAlerts={stats?.recentSDRAlerts ?? []}
        />
        <AdminSystemStatus edgeStatus={edgeStatus} queryMetrics={queryMetrics || { totalQueries: 0, avgDuration: 0, slowQueries: 0 }} />
      </div>

      <AdminQuickLinks />
      <SemanticReindexPanel />
      <AutomationRulesPanel />
      <BackendAutomationMonitor />
      <CircuitBreakerDashboard />
      <EmailMetricsDashboard />
      <QuoteSyncLogsPanel />
      <InboundReplyLogPanel />
      <ExternalDBSettings />
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
