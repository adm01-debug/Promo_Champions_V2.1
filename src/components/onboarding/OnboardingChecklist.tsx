import { useNavigate } from 'react-router-dom';
import { useOnboardingChecklist } from '@/hooks/useOnboardingChecklist';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Rocket, X, ChevronRight, Sparkles } from 'lucide-react';
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
      initial={{ opacity: 0, scale: 0.98, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, height: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="rounded-[2.5rem] border border-white/[0.05] bg-[#0d1117]/30 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group hover:border-white/[0.1] transition-all duration-700">
        {/* Animated accent background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        {/* Compact Header */}
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-2xl backdrop-blur-xl group transition-all duration-500 hover:scale-110 hover:border-primary/30 shrink-0">
            <Rocket className="h-8 w-8 text-primary/80 group-hover:text-primary transition-colors" />
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xl font-black uppercase tracking-tightest text-white/90 flex items-center gap-2">
                  Launch Sequence
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                </h3>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Initialize your performance trajectory</p>
              </div>
              <div className="flex items-center gap-4 bg-white/[0.03] px-5 py-2 rounded-full border border-white/[0.05]">
                <span className="text-xs font-black text-white/40 tabular-nums tracking-widest uppercase">
                  {completedCount} / {totalSteps} Core Tasks
                </span>
                <div className="w-24">
                  <Progress value={progress} className="h-1.5 bg-white/5" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2">
                  <button
                    onClick={() => !step.completed && navigate(step.route)}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap border",
                      step.completed
                        ? "bg-success/10 text-success border-success/20 opacity-40 hover:opacity-100"
                        : step === nextStep
                          ? "bg-primary/20 text-primary border-primary/40 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]"
                          : "bg-white/[0.02] text-white/20 border-white/[0.05] hover:border-white/20"
                    )}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <span className="h-3.5 w-3.5 rounded-full border border-current flex items-center justify-center text-[8px]">
                        {i + 1}
                      </span>
                    )}
                    {step.title}
                  </button>
                  {i < steps.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-white/5 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
             <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-12 w-12 rounded-2xl border-white/5 bg-white/[0.02] transition-all duration-500",
                expanded ? "bg-white/[0.08] text-white" : "text-white/20 hover:text-white"
              )}
              onClick={() => setExpanded(!expanded)}
            >
              <ChevronRight className={cn("h-5 w-5 transition-transform duration-500", expanded && "rotate-90")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-2xl text-white/10 hover:text-white/40 hover:bg-white/[0.05] transition-all"
              onClick={() => setDismissed(true)}
            >
              <X className="h-5 w-5" />
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
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/[0.05]">
                {steps.map((step, i) => {
                  const isNext = step === nextStep;
                  return (
                    <motion.button
                      key={step.id}
                      className={cn(
                        "flex flex-col gap-4 p-6 rounded-3xl text-left transition-all duration-500 border",
                        step.completed
                          ? "bg-white/[0.01] border-transparent opacity-30 hover:opacity-60"
                          : isNext
                            ? "bg-primary/5 border-primary/20 shadow-xl"
                            : "bg-white/[0.02] border-white/[0.03] hover:border-white/[0.1] hover:bg-white/[0.04]"
                      )}
                      onClick={() => !step.completed && navigate(step.route)}
                    >
                      <div className="flex items-center justify-between w-full">
                        {step.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                        ) : (
                          <span className={cn(
                            "h-6 w-6 rounded-lg border-2 flex items-center justify-center text-[10px] font-black shrink-0",
                            isNext ? "border-primary text-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" : "border-white/10 text-white/20"
                          )}>
                            {i + 1}
                          </span>
                        )}
                        {isNext && <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">Execute Now</span>}
                      </div>
                      <div className="space-y-1">
                        <p className={cn("text-xs font-black uppercase tracking-tightest", step.completed ? "text-white/40" : "text-white")}>{step.title}</p>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-relaxed line-clamp-2">{step.description}</p>
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
