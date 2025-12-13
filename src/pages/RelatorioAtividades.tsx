import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, Calendar, TrendingUp, Users, Percent } from "lucide-react";
import { useSalespersonActivityReport, useActivityTrend } from "@/hooks/useSalespersonActivityReport";
import { SalespersonActivityTable } from "@/components/analytics/SalespersonActivityTable";
import { ActivityVolumeChart } from "@/components/analytics/ActivityVolumeChart";
import { ActivityOutcomesChart } from "@/components/analytics/ActivityOutcomesChart";
import { ActivityTrendChart } from "@/components/analytics/ActivityTrendChart";
import { RelatorioAtividadesLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";

export default function RelatorioAtividades() {
  const { data, isLoading, error } = useSalespersonActivityReport(1);
  const { data: trendData, isLoading: trendLoading } = useActivityTrend(undefined, 30);

  if (isLoading || trendLoading) {
    return <RelatorioAtividadesLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Erro ao carregar relatório</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Atividades",
      value: data?.teamSummary.total_activities || 0,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Calls",
      value: data?.teamSummary.total_calls || 0,
      icon: Phone,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      label: "Emails",
      value: data?.teamSummary.total_emails || 0,
      icon: Mail,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "Reuniões",
      value: data?.teamSummary.total_meetings || 0,
      icon: Calendar,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      label: "Taxa Conexão",
      value: `${(data?.teamSummary.avg_connection_rate || 0).toFixed(0)}%`,
      icon: Percent,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      label: "Taxa Agendamento",
      value: `${(data?.teamSummary.avg_scheduling_rate || 0).toFixed(0)}%`,
      icon: TrendingUp,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Relatório de Atividades</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Volume de atividades vs resultados por vendedor
              </p>
            </div>
            {data?.teamSummary.top_performer_name && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-lg">🏆</span>
                <span className="text-xs font-medium text-primary">
                  Top: {data.teamSummary.top_performer_name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          {stats.map((stat, index) => (
            <Card key={index} className="glass border-border/40">
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
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <ActivityVolumeChart data={data?.salespeople || []} />
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            <ActivityOutcomesChart data={data?.salespeople || []} />
          </div>
        </div>

        {/* Trend Chart */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <ActivityTrendChart data={trendData || []} />
        </div>

        {/* Salesperson Table */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "350ms" }}>
          <SalespersonActivityTable data={data?.salespeople || []} />
        </div>
      </div>
    </div>
  );
}
