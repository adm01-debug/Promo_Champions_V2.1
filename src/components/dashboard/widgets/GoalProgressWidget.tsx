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
    <Card className="h-full border-none shadow-sm bg-gradient-to-br from-card to-card/50 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Target className="h-12 w-12 text-primary rotate-12" />
      </div>
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Target className="h-3.5 w-3.5 text-primary" />
          </div>
          Progresso da Meta
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center pt-2 pb-6 relative z-10">
        <div className="relative mb-4 group-hover:scale-105 transition-transform duration-500">
          <ProgressRing
            value={progress}
            size={100}
            strokeWidth={8}
            variant={variant}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold tracking-tighter">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-black tracking-tight text-foreground/90">
            R$ {current.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
          </p>
          <div className="flex flex-col items-center gap-0.5">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide opacity-70">
              Objetivo: R$ {goal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </p>
            {remaining > 0 ? (
              <div className="mt-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold uppercase">
                Faltam R$ {remaining.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </div>
            ) : progress >= 100 && (
              <div className="mt-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase">
                Meta Atingida! 🚀
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

GoalProgressWidget.displayName = "GoalProgressWidget";
