import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Rocket, Zap, ArrowUpRight } from "lucide-react";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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
    <Card className="h-full border-none bg-transparent shadow-none group">
      <CardHeader className="pb-6 pt-6 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-black uppercase tracking-tightest text-white/90">
              Objective
            </CardTitle>
          </div>
          <ArrowUpRight className="h-5 w-5 text-white/10 group-hover:text-primary transition-colors duration-500" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-8 px-6">
        {!hasGoal ? (
          <div className="flex flex-col items-center gap-6 py-8 text-center">
            <div className="relative">
              <div className="h-32 w-32 rounded-full border-2 border-dashed border-white/5 flex items-center justify-center">
                <Rocket className="h-10 w-10 text-white/10" />
              </div>
              <div className="absolute inset-0 rounded-full animate-ping border border-primary/20 opacity-20" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-black text-white/40 uppercase tracking-widest">Awaiting Trajectory</p>
              <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">
                Define sua meta mensal para ativar o rastreamento orbital de performance
              </p>
            </div>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 font-black border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500">
              <Link to="/metas">
                <Target className="h-4 w-4 mr-2" />
                DEFINIR META
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="relative">
              <ProgressRing
                value={percentage}
                size={180}
                strokeWidth={12}
                variant={variant}
                label="completion"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Status</span>
                <span className={cn(
                  "text-4xl font-black tracking-tightest",
                  percentage >= 100 ? "text-success" : "text-white"
                )}>
                  {Math.round(percentage)}%
                </span>
              </div>
              {/* Outer Glow Ring */}
              <div className={cn(
                "absolute inset-[-10px] rounded-full border border-white/[0.03] animate-[pulse_4s_infinite]",
                percentage >= 100 && "border-success/20 shadow-[0_0_30px_rgba(var(--success-rgb),0.2)]"
              )} />
            </div>

            <div className="w-full space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Current Volume</p>
                  <p className="text-lg font-black text-white">R$ {current.toLocaleString("pt-BR")}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Strategic Goal</p>
                  <p className="text-lg font-black text-white/60">R$ {goal.toLocaleString("pt-BR")}</p>
                </div>
              </div>

              {remaining > 0 ? (
                <div className="bg-white/[0.03] rounded-2xl p-4 flex items-center justify-between border border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-primary/60" />
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Gap to Target</span>
                  </div>
                  <span className="text-sm font-black text-primary">R$ {remaining.toLocaleString("pt-BR")}</span>
                </div>
              ) : (
                <div className="bg-success/10 rounded-2xl p-4 flex items-center justify-center border border-success/20 animate-bounce">
                  <p className="text-[10px] font-black text-success uppercase tracking-[0.3em]">
                    MISSION ACCOMPLISHED 🎉
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});
