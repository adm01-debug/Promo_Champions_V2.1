import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Rocket } from "lucide-react";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface GoalProgressProps {
  current: number;
  goal: number;
}

export const GoalProgress = React.memo(function GoalProgress({ current, goal }: GoalProgressProps) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const remaining = Math.max(goal - current, 0);
  const hasGoal = goal > 0;

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
        {!hasGoal ? (
          // Premium empty state when no goal is set
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center">
                <Rocket className="h-8 w-8 text-primary/50" />
              </div>
              <div className="absolute inset-0 rounded-full animate-[pulse_3s_ease-in-out_infinite] border border-primary/10" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Defina sua meta</p>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[180px]">
                Configure uma meta mensal para acompanhar seu progresso
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="mt-1 gap-1.5">
              <Link to="/metas">
                <Target className="h-3.5 w-3.5" />
                Criar Meta
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ProgressRing
              value={percentage}
              size={100}
              strokeWidth={7}
              variant={variant}
              label="meta"
            />

            <div className="flex justify-between text-xs text-muted-foreground w-full">
              <span>R$ {current.toLocaleString("pt-BR")}</span>
              <span>R$ {goal.toLocaleString("pt-BR")}</span>
            </div>

            {remaining > 0 && (
              <p className="text-sm text-center text-muted-foreground">
                Faltam <span className="font-semibold text-foreground">R$ {remaining.toLocaleString("pt-BR")}</span>
              </p>
            )}

            {percentage >= 100 && (
              <p className="text-sm text-center font-semibold text-success">
                🎉 Meta atingida!
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
});
