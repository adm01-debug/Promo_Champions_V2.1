import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { ProgressRing } from "@/components/ui/ProgressRing";

interface GoalProgressProps {
  current: number;
  goal: number;
}

export const GoalProgress = React.memo(function GoalProgress({ current, goal }: GoalProgressProps) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const remaining = Math.max(goal - current, 0);

  const variant = percentage >= 100 ? "success" : percentage >= 75 ? "primary" : percentage >= 50 ? "warning" : "destructive";

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Meta do Mês
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <ProgressRing
          value={percentage}
          size={100}
          strokeWidth={7}
          variant={variant}
          label="meta"
        />

        <div className="flex justify-between text-xs text-muted-foreground/80 w-full">
          <span>R$ {current.toLocaleString("pt-BR")}</span>
          <span>R$ {goal.toLocaleString("pt-BR")}</span>
        </div>

        {remaining > 0 && (
          <p className="text-sm text-center text-muted-foreground/80">
            Faltam <span className="font-semibold text-foreground">R$ {remaining.toLocaleString("pt-BR")}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
});
