import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { ActivityGoalProgress } from "@/hooks/useActivityGoals";
import { cn } from "@/lib/utils";

interface PredictiveVelocityProps {
  data: ActivityGoalProgress[];
}

export const PredictiveVelocity: React.FC<PredictiveVelocityProps> = ({ data }) => {
  const withGoals = data.filter(p => p.hasGoals);
  const avgProgress = withGoals.length > 0
    ? withGoals.reduce((sum, p) => sum + p.progress.overall, 0) / withGoals.length
    : 0;

  // Simple heuristic for estimation
  const hoursRemaining = 18 - new Date().getHours(); // Assuming 18:00 is end of day
  const isOnTrack = avgProgress >= 70 || (avgProgress >= 40 && hoursRemaining > 4);

  return (
    <Card variant="glass" className="overflow-hidden border-primary/20 bg-primary/5 group/velocity hover:shadow-glow-primary/10 transition-all duration-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          Projeção de Fechamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Velocidade Atual</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-display font-black text-foreground gradient-text group-hover:scale-110 transition-transform inline-block">
                {(avgProgress / Math.max(1, new Date().getHours() - 8)).toFixed(1)}%
              </span>
              <span className="text-[10px] text-muted-foreground">/ hora</span>
            </div>
          </div>
          <div className={cn(
            "p-3 rounded-2xl transition-all duration-500",
            isOnTrack ? "bg-status-success/20 shadow-glow-success/20" : "bg-status-warning/20 shadow-glow-warning/20"
          )}>
            {isOnTrack ? (
              <TrendingUp className="h-6 w-6 text-status-success" />
            ) : (
              <AlertCircle className="h-6 w-6 text-status-warning" />
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-background/50 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">E.T.A (Meta 100%)</span>
            </div>
            <span className="text-xs font-black text-primary">~17:45</span>
          </div>
          <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-1000 relative overflow-hidden", isOnTrack ? "bg-status-success" : "bg-status-warning")}
              style={{ width: `${avgProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isOnTrack ? "bg-status-success" : "bg-status-warning")} />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Diretriz Estratégica</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed border-l-2 border-primary/20 pl-3 italic">
              {isOnTrack 
                ? "Ritmo excelente! Foque em QUALIDADE das reuniões. O volume já está garantido."
                : "URGENTE: Redirecionar time para prospecção ativa. Volume atual projeta 85% da meta."}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between px-1">
          <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/50">Confiança do Modelo</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={cn("w-2 h-1 rounded-full", i <= 4 ? "bg-primary" : "bg-white/10")} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};