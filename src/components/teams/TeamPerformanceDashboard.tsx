import { useState } from "react";
import { 
  Users, TrendingUp, DollarSign, Calendar, 
  Activity, ChevronLeft, ChevronRight 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamPerformanceCard } from "./TeamPerformanceCard";
import { useTeamPerformance } from "@/hooks/useTeamPerformance";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

export function TeamPerformanceDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { data: teams, isLoading } = useTeamPerformance(selectedMonth);

  const handlePreviousMonth = () => setSelectedMonth((m) => subMonths(m, 1));
  const handleNextMonth = () => setSelectedMonth((m) => addMonths(m, 1));

  // Calculate consolidated metrics
  const consolidatedMetrics = teams?.reduce(
    (acc, team) => ({
      totalRevenue: acc.totalRevenue + team.totals.totalRevenue,
      totalDeals: acc.totalDeals + team.totals.totalDeals,
      totalActivities: acc.totalActivities + team.totals.totalActivities,
      totalMeetings: acc.totalMeetings + team.totals.totalMeetings,
      teamsCount: acc.teamsCount + 1,
    }),
    { totalRevenue: 0, totalDeals: 0, totalActivities: 0, totalMeetings: 0, teamsCount: 0 }
  ) || { totalRevenue: 0, totalDeals: 0, totalActivities: 0, totalMeetings: 0, teamsCount: 0 };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-96 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl gradient-primary">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text font-display">
              Performance por Time
            </h1>
            <p className="text-muted-foreground">
              Métricas consolidadas SDR + Closers
            </p>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePreviousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[120px] text-center font-medium capitalize">
            {format(selectedMonth, "MMMM yyyy", { locale: ptBR })}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Consolidated Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-status-success">
                  {formatCurrency(consolidatedMetrics.totalRevenue)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-status-success/10">
                <DollarSign className="h-5 w-5 text-status-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deals Fechados</p>
                <p className="text-2xl font-bold gradient-text">
                  {consolidatedMetrics.totalDeals}
                </p>
              </div>
              <div className="p-2 rounded-lg gradient-primary">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Atividades</p>
                <p className="text-2xl font-bold text-status-info">
                  {consolidatedMetrics.totalActivities}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-status-info/10">
                <Activity className="h-5 w-5 text-status-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reuniões Agendadas</p>
                <p className="text-2xl font-bold text-accent">
                  {consolidatedMetrics.totalMeetings}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-accent/10">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams Grid */}
      {teams && teams.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teams.map((team, index) => (
            <div
              key={team.teamId}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <TeamPerformanceCard team={team} />
            </div>
          ))}
        </div>
      ) : (
        <Card className="card-elevated">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum time cadastrado</h3>
            <p className="text-muted-foreground">
              Cadastre times na página de Gestão de Times para visualizar a performance.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
