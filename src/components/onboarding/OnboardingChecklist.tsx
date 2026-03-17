import { useNavigate } from 'react-router-dom';
import { useOnboardingChecklist } from '@/hooks/useOnboardingChecklist';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ArrowRight, Rocket, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function OnboardingChecklist() {
  const { steps, completedCount, totalSteps, progress, isComplete } = useOnboardingChecklist();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || isComplete) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Primeiros Passos</CardTitle>
              <span className="text-xs text-muted-foreground">
                {completedCount}/{totalSteps}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDismissed(true)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Progress value={progress} className="h-1.5 mt-2" />
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {steps.map((step, i) => {
            const isNext = !step.completed && steps.slice(0, i).every(s => s.completed);
            return (
              <motion.div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-lg transition-colors cursor-pointer group",
                  step.completed ? "opacity-60" : isNext ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                )}
                onClick={() => !step.completed && navigate(step.route)}
                whileHover={{ x: step.completed ? 0 : 4 }}
              >
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <Circle className={cn("h-5 w-5 shrink-0", isNext ? "text-primary" : "text-muted-foreground")} />
                )}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", step.completed && "line-through")}>{step.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                </div>
                {!step.completed && isNext && (
                  <ArrowRight className="h-4 w-4 text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
                )}
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
