import React from "react";
import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressRing } from "@/components/ui/ProgressRing";

export const GoalProgressWidget = React.memo(function GoalProgressWidget() {
  const { data: goalsData, isLoading: goalsLoading } = useGoalsDashboard();
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs();

  if (goalsLoading || kpisLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  const current = goalsData?.totalSales ?? kpis?.current.totalRevenue ?? 0;
  const goal = goalsData?.totalGoal || 0;
  const progress = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const remaining = Math.max(goal - current, 0);
  const variant = progress >= 100 ? "success" : progress >= 60 ? "primary" : progress >= 30 ? "warning" : "destructive";

  return (
    <Card className="h-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-primary" />
          Progresso da Meta
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2 pt-2">
        <ProgressRing
          value={progress}
          size={80}
          strokeWidth={6}
          variant={variant}
        />
        <div className="text-center">
          <p className="text-sm font-semibold">
            R$ {current.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[11px] text-muted-foreground">
            de R$ {goal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
          </p>
          {remaining > 0 && (
            <p className="text-[10px] text-muted-foreground mt-1">
              Faltam R$ {remaining.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

GoalProgressWidget.displayName = "GoalProgressWidget";
