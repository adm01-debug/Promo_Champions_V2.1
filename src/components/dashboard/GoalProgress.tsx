import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Rocket } from "lucide-react";
import { motion } from "framer-motion";
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
    <Card className="h-full relative overflow-hidden bg-black/40 border-white/5 backdrop-blur-md group">
      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-primary/20 group-hover:border-primary/40 transition-colors" />
      </div>

      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Target className="h-3.5 w-3.5" />
          </div>
          Mission Progress
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center gap-6 relative z-10 pt-4">
        {!hasGoal ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center bg-primary/5">
                <Rocket className="h-8 w-8 text-primary/30" />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 rounded-full border border-primary/20" 
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/80">Objectives Unset</p>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider max-w-[180px]">
                Define target parameters to initiate tracking
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="h-8 bg-black/40 border-primary/30 text-primary hover:bg-primary/10 text-[10px] font-mono font-bold uppercase tracking-widest">
              <Link to="/metas">
                <Target className="h-3 w-3 mr-1.5" />
                Set Goal
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="relative">
              {/* Extra glow for progress ring */}
              <div className="absolute inset-0 blur-[40px] opacity-40 bg-primary rounded-full animate-pulse" />
              <ProgressRing
                value={percentage}
                size={160}
                strokeWidth={12}
                variant={variant}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black font-display tracking-tighter text-foreground" style={{ textShadow: `0 0 25px hsl(var(--${variant}))` }}>
                  {Math.round(percentage)}<span className="text-sm opacity-60">%</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Complete</span>
              </div>
            </div>

            <div className="w-full space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-black/60 border border-white/10 shadow-inner">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Current</p>
                  <p className="text-sm font-mono font-black text-foreground truncate">R$ {current.toLocaleString("pt-BR")}</p>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-right shadow-inner">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Target</p>
                  <p className="text-sm font-mono font-black text-foreground truncate">R$ {goal.toLocaleString("pt-BR")}</p>
                </div>
              </div>

              {remaining > 0 ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <p className="text-[9px] font-mono uppercase tracking-widest text-primary/80">
                    Remaining: <span className="font-bold text-primary">R$ {remaining.toLocaleString("pt-BR")}</span>
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10 border border-success/30">
                  <div className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  <p className="text-[9px] font-mono uppercase tracking-widest text-success font-black">
                    Primary Objective Complete
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
      
      {/* Scanline decoration */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-[1px] bg-primary/20"
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </Card>
  );
});
