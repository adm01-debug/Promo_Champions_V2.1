import { useNavigate } from 'react-router-dom';
import { useOnboardingChecklist } from '@/hooks/useOnboardingChecklist';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Rocket, X, ChevronRight } from 'lucide-react';
import { useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const OnboardingChecklist = forwardRef<HTMLDivElement>((_, ref) => {
  const { steps, completedCount, totalSteps, progress, isComplete } = useOnboardingChecklist();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (dismissed || isComplete) return null;

  const nextStep = steps.find((s, i) => !s.completed && steps.slice(0, i).every(st => st.completed));

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rounded-xl border border-primary/30 bg-black/40 backdrop-blur-md p-5 shadow-[0_0_30px_rgba(14,165,233,0.05)] group relative overflow-hidden">
        {/* Animated accent line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        
        {/* Compact Header — always visible */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 relative z-10">
          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
            <Rocket className="h-5 w-5 text-primary" />
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-1.5">
                <button
                  onClick={() => !step.completed && navigate(step.route)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all whitespace-nowrap",
                    step.completed
                      ? "bg-success/15 text-success"
                      : step === nextStep
                        ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                        : "bg-muted/50 text-muted-foreground"
                  )}
                  aria-label={step.title}
                >
                  {step.completed ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-current flex items-center justify-center text-[9px] font-bold">
                      {i + 1}
                    </span>
                  )}
                  <span className="hidden lg:inline">{step.title}</span>
                </button>
                {i < steps.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0 hidden sm:block" />
                )}
              </div>
            ))}
          </div>

          {/* Progress & actions */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {completedCount}/{totalSteps}
            </span>
            <div className="w-16 hidden sm:block">
              <Progress value={progress} className="h-1.5" />
            </div>
            {nextStep && (
              <Button
                size="sm"
                variant="default"
                className="h-7 gap-1 text-xs hidden md:flex"
                onClick={() => navigate(nextStep.route)}
              >
                Próximo
                <ArrowRight className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? "Recolher detalhes" : "Expandir detalhes"}
            >
              <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-90")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setDismissed(true)}
              aria-label="Fechar onboarding"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Expandable detail panel */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3 pt-3 border-t border-border/50">
                {steps.map((step, i) => {
                  const isNext = step === nextStep;
                  return (
                    <motion.button
                      key={step.id}
                      className={cn(
                        "flex items-start gap-2.5 p-3 rounded-lg text-left transition-colors",
                        step.completed
                          ? "opacity-60"
                          : isNext
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-muted/50"
                      )}
                      onClick={() => !step.completed && navigate(step.route)}
                      whileHover={{ scale: step.completed ? 1 : 1.02 }}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      ) : (
                        <span className={cn(
                          "h-4 w-4 rounded-full border-2 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5",
                          isNext ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground"
                        )}>
                          {i + 1}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className={cn("text-xs font-medium", step.completed && "line-through")}>{step.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{step.description}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});
OnboardingChecklist.displayName = "OnboardingChecklist";
