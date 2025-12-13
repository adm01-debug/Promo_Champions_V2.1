import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { TeamGoalProgress } from "@/components/goals/TeamGoalProgress";
import { GoalsLeaderboard } from "@/components/goals/GoalsLeaderboard";
import { CommissionCalculator } from "@/components/goals/CommissionCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Users, Zap, RefreshCw, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MetasLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";

export default function Metas() {
  const { data, isLoading, dataUpdatedAt } = useGoalsDashboard();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["goals-dashboard"] });
  };

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  const currentMonth = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });
  const lastUpdate = dataUpdatedAt ? format(new Date(dataUpdatedAt), "HH:mm:ss") : "--:--:--";

  const onTrackCount = data?.salespeople.filter(sp => sp.onTrack && sp.goalAmount > 0).length || 0;
  const totalWithGoals = data?.salespeople.filter(sp => sp.goalAmount > 0).length || 0;
  const exceededCount = data?.salespeople.filter(sp => sp.progress >= 100).length || 0;

  if (isLoading) {
    return <MetasLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Dashboard de Metas</h1>
              <p className="text-sm text-muted-foreground mt-1 capitalize">
                {currentMonth} • Atualizado às {lastUpdate}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary">Tempo Real</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <Card className="glass border-border/40">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(data?.totalGoal || 0)}</p>
                <p className="text-xs text-muted-foreground">Meta Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-border/40">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(data?.totalSales || 0)}</p>
                <p className="text-xs text-muted-foreground">Vendido</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-border/40">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{onTrackCount}/{totalWithGoals}</p>
                <p className="text-xs text-muted-foreground">No Caminho</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-border/40">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-500/10">
                <Zap className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{exceededCount}</p>
                <p className="text-xs text-muted-foreground">Metas Batidas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Progress */}
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <TeamGoalProgress
              totalGoal={data?.totalGoal || 0}
              totalSales={data?.totalSales || 0}
              progress={data?.progress || 0}
              projection={data?.projection || 0}
              onTrack={data?.onTrack || false}
              daysElapsed={data?.daysElapsed || 0}
              daysRemaining={data?.daysRemaining || 0}
              dailyAverage={data?.dailyAverage || 0}
              requiredDailyAverage={data?.requiredDailyAverage || 0}
            />
          </div>

          {/* Commission Calculator */}
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            <CommissionCalculator
              salespeople={data?.salespeople || []}
              totalCurrentCommission={data?.totalCurrentCommission || 0}
              totalProjectedCommission={data?.totalProjectedCommission || 0}
              isLoading={isLoading}
            />
          </div>

          {/* Leaderboard */}
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <GoalsLeaderboard
              salespeople={data?.salespeople || []}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
