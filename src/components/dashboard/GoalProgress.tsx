import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/useCountUp";
import { motion } from "framer-motion";

interface GoalProgressProps {
  current: number;
  goal: number;
}

export const GoalProgress = ({ current, goal }: GoalProgressProps) => {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const remaining = Math.max(goal - current, 0);
  const animatedPercentage = useCountUp(percentage, { duration: 1600, decimals: 0 });

  const getProgressColor = () => {
    if (percentage >= 100) return "from-success to-success/80";
    if (percentage >= 75) return "from-primary to-primary/80";
    if (percentage >= 50) return "from-warning to-warning/80";
    return "from-destructive to-destructive/80";
  };

  const getMotivationalText = () => {
    if (goal === 0) return "Configure sua meta mensal para acompanhar seu progresso";
    if (percentage >= 100) return "🎉 Meta batida! Você é um campeão!";
    if (percentage >= 75) return "Quase lá! Falta pouco para bater a meta!";
    if (percentage >= 50) return "Bom progresso! Continue assim!";
    if (percentage >= 25) return "Você está no caminho certo!";
    return "Hora de acelerar as vendas!";
  };

  const getIcon = () => {
    if (percentage >= 100) return Trophy;
    if (percentage >= 50) return Flame;
    return Target;
  };

  const ProgressIcon = getIcon();

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <ProgressIcon className={cn(
            "h-5 w-5",
            percentage >= 100 ? "text-success" : percentage >= 50 ? "text-status-warning" : "text-primary"
          )} />
          Meta do Mês
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <motion.p 
            className="text-4xl font-bold font-display gradient-text tabular-nums"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {animatedPercentage}%
          </motion.p>
          <p className="text-sm text-muted-foreground mt-1">da meta atingida</p>
        </div>

        <div className="space-y-2">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full bg-gradient-to-r",
                getProgressColor()
              )}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>R$ {current.toLocaleString("pt-BR")}</span>
            <span>R$ {goal.toLocaleString("pt-BR")}</span>
          </div>
        </div>

        {/* Motivational micro-copy */}
        <div className={cn(
          "text-center p-2.5 rounded-lg",
          percentage >= 100 ? "bg-success/10" : "bg-muted/50"
        )}>
          <p className="text-xs font-medium text-muted-foreground">
            {getMotivationalText()}
          </p>
          {remaining > 0 && goal > 0 && (
            <p className="text-sm font-semibold text-foreground mt-1">
              Faltam <span className="gradient-text">R$ {remaining.toLocaleString("pt-BR")}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
