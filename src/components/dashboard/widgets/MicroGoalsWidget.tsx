import React from "react";
import { useMicroGoals, MicroGoal } from "@/hooks/useMicroGoals";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const MicroGoalsWidget = React.memo(function MicroGoalsWidget() {
  const { salesperson } = useAuth();
  const { data: goals, isLoading } = useMicroGoals(salesperson?.id);

  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  if (!goals || goals.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-primary" />
            Micro-Metas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground text-center py-4">
            Sem metas ativas no momento
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-primary" />
          Micro-Metas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence mode="popLayout">
          {goals.map((goal, i) => (
            <MicroGoalItem key={goal.id} goal={goal} index={i} />
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
});

MicroGoalsWidget.displayName = "MicroGoalsWidget";

function MicroGoalItem({ goal, index }: { goal: MicroGoal; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ delay: index * 0.05 }}
      className="space-y-1"
    >
      <div className="flex items-start gap-2">
        <span className="text-sm leading-none mt-0.5">{goal.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground leading-tight">
            {goal.message}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Progress
              value={goal.progress}
              className={cn(
                "h-1.5 flex-1",
                goal.progress >= 75 && "[&>div]:bg-success",
                goal.progress >= 50 && goal.progress < 75 && "[&>div]:bg-warning",
                goal.progress < 50 && "[&>div]:bg-primary"
              )}
            />
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {goal.remaining}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
