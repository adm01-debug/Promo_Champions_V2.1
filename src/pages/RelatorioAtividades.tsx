import { useState } from "react";
import { Helmet } from "react-helmet-async";
// MainLayout is already applied at route level in App.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, Calendar, TrendingUp, Users, Percent, Download, Filter } from "lucide-react";
import { useSalespersonActivityReport, useActivityTrend } from "@/hooks/sales/useSalespersonActivityReport";
import { SalespersonActivityTable } from "@/components/analytics/SalespersonActivityTable";
import { ActivityVolumeChart } from "@/components/analytics/ActivityVolumeChart";
import { ActivityOutcomesChart } from "@/components/analytics/ActivityOutcomesChart";
import { ActivityTrendChart } from "@/components/analytics/ActivityTrendChart";
import { RelatorioAtividadesLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { exportToCSV } from "@/utils/csvExport";
import { toast } from "sonner";
import { PageTransition } from "@/components/transitions/PageTransition";

type OutcomeFilter = 'all' | 'connected' | 'scheduled' | 'qualified' | 'no_answer' | 'not_interested';

const outcomeLabels: Record<OutcomeFilter, string> = {
  all: "Todos os outcomes",
  connected: "Conectou",
  scheduled: "Agendou",
  qualified: "Qualificado",
  no_answer: "Não atendeu",
  not_interested: "Não interessado",
};

export default function RelatorioAtividades() {
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('all');
  const { data, isLoading, error } = useSalespersonActivityReport(1);
  const { data: trendData, isLoading: trendLoading } = useActivityTrend(undefined, 30);

  if (error) {
    return (
      <PageTransition>
        <Helmet>
          <title>Relatório de Atividades | Promo Champions</title>
          <meta name="description" content="Relatórios detalhados de atividades" />
        </Helmet>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-destructive">Erro ao carregar relatório</p>
        </div>
      </PageTransition>
    );
  }

  // Filter salespeople data based on outcome filter
  const filteredSalespeople = data?.salespeople?.filter(sp => {
    if (outcomeFilter === 'all') return true;
    // Only show salespeople with at least 1 activity of the selected outcome
    return sp[outcomeFilter] > 0;
  }) || [];

  // Recalculate team summary based on filtered data
  const filteredTeamSummary = {
    total_activities: outcomeFilter === 'all' 
      ? data?.teamSummary.total_activities || 0
      : filteredSalespeople.reduce((sum, sp) => sum + sp[outcomeFilter], 0),
    total_calls: data?.teamSummary.total_calls || 0,
    total_emails: data?.teamSummary.total_emails || 0,
    total_meetings: data?.teamSummary.total_meetings || 0,
    avg_connection_rate: data?.teamSummary.avg_connection_rate || 0,
    avg_scheduling_rate: data?.teamSummary.avg_scheduling_rate || 0,
    top_performer_name: data?.teamSummary.top_performer_name,
  };

  const stats = [
    {
      label: outcomeFilter === 'all' ? "Total Atividades" : outcomeLabels[outcomeFilter],
      value: filteredTeamSummary.total_activities,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Calls",
      value: filteredTeamSummary.total_calls,
      icon: Phone,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Emails",
      value: filteredTeamSummary.total_emails,
      icon: Mail,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      label: "Reuniões",
      value: filteredTeamSummary.total_meetings,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Taxa Conexão",
      value: `${(filteredTeamSummary.avg_connection_rate).toFixed(0)}%`,
      icon: Percent,
      color: "text-success",
      bgColor: "bg-success/80/10",
    },
    {
      label: "Taxa Agendamento",
      value: `${(filteredTeamSummary.avg_scheduling_rate).toFixed(0)}%`,
      icon: TrendingUp,
      color: "text-rank-gold",
      bgColor: "bg-rank-gold/10",
    },
  ];

  const handleExportCSV = () => {
    if (!filteredSalespeople.length) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    exportToCSV(
      filteredSalespeople as unknown as Record<string, unknown>[],
      `relatorio-atividades-${outcomeFilter !== 'all' ? outcomeFilter + '-' : ''}${new Date().toISOString().split('T')[0]}`,
      ["salesperson_name", "calls", "emails", "meetings", "linkedin", "whatsapp", "total_activities", "connected", "scheduled", "no_answer", "connection_rate", "scheduling_rate"]
    );

    toast.success("Relatório exportado com sucesso!");
  };

  return (
    <PageTransition>
      <SkeletonTransition
        isLoading={isLoading || trendLoading}
        skeleton={<RelatorioAtividadesLoadingSkeleton />}
        duration={400}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="animate-fade-in" style={{ animationDelay: "0ms" }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-page-title gradient-text">Relatório de Atividades</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Volume de atividades vs resultados por vendedor
                </p>
              </div>
              <div className="flex items-center gap-3">
                {filteredTeamSummary.top_performer_name && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="text-lg">🏆</span>
                    <span className="text-xs font-medium text-primary">
                      Top: {filteredTeamSummary.top_performer_name}
                    </span>
                  </div>
                )}
                <Select value={outcomeFilter} onValueChange={(v) => setOutcomeFilter(v as OutcomeFilter)}>
                  <SelectTrigger className="w-[180px] gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(outcomeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={!filteredSalespeople.length}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
            {stats.map((stat, index) => (
              <Card key={index} className="glass border-border/40 hover-lift-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              <ActivityVolumeChart data={filteredSalespeople} />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "250ms" }}>
              <ActivityOutcomesChart data={filteredSalespeople} />
            </div>
          </div>

          {/* Trend Chart */}
          <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
            <ActivityTrendChart data={trendData || []} />
          </div>

          {/* Salesperson Table */}
          <div className="animate-fade-in" style={{ animationDelay: "350ms" }}>
            <SalespersonActivityTable data={filteredSalespeople} />
          </div>
        </div>
      </SkeletonTransition>
    </PageTransition>
  );
}
