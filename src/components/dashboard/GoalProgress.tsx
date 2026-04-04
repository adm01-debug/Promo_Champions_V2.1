import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalProgressProps {
  current: number;
  goal: number;
}

export const GoalProgress = React.memo(function GoalProgress({ current, goal }: GoalProgressProps) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const remaining = Math.max(goal - current, 0);

  const getProgressColor = () => {
    if (percentage >= 100) return "from-success to-success/80";
    if (percentage >= 75) return "from-primary to-primary/80";
    if (percentage >= 50) return "from-warning to-warning/80";
    return "from-destructive to-destructive/80";
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Meta do Mês
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-3xl font-bold gradient-text">{percentage.toFixed(0)}%</p>
          <p className="text-sm text-muted-foreground">da meta atingida</p>
        </div>

        <div className="space-y-2">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                getProgressColor()
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>R$ {current.toLocaleString("pt-BR")}</span>
            <span>R$ {goal.toLocaleString("pt-BR")}</span>
          </div>
        </div>

        {remaining > 0 && (
          <p className="text-sm text-center text-muted-foreground">
            Faltam <span className="font-semibold text-foreground">R$ {remaining.toLocaleString("pt-BR")}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};
