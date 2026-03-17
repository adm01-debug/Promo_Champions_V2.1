import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function GoalProgressWidget() {
  const { data: goalsData, isLoading: goalsLoading } = useGoalsDashboard();
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs();

  if (goalsLoading || kpisLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  const current = goalsData?.totalSales ?? kpis?.current.totalRevenue ?? 0;
  const goal = goalsData?.totalGoal || 0;
  const progress = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-primary" />
          Progresso da Meta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{progress.toFixed(0)}%</p>
        <Progress value={progress} className="h-2 mt-2" />
        <p className="text-xs text-muted-foreground mt-1">
          R$ {current.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} / R$ {goal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
        </p>
      </CardContent>
    </Card>
  );
}
