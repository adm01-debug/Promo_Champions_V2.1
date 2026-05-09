import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, TrendingUp, AlertCircle, Clock, Zap } from "lucide-react";
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

  // Advanced heuristic for estimation
  const now = new Date();
  const currentHour = now.getHours();
  const startHour = 8;
  const endHour = 18;
  const hoursElapsed = Math.max(0.5, currentHour - startHour);
  const hoursRemaining = Math.max(0, endHour - currentHour);
  
  const velocityPerHour = avgProgress / hoursElapsed;
  const projectedFinal = avgProgress + (velocityPerHour * hoursRemaining);
  const isOnTrack = projectedFinal >= 100;

  return (
    <Card variant="glass" className="overflow-hidden border-primary/20 bg-primary/5 group/velocity hover:shadow-glow-primary/10 transition-all duration-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary animate-spin-slow" />
          Projeção de Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Velocidade Arena</p>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-3xl font-display font-black group-hover:scale-110 transition-transform inline-block drop-shadow-glow",
                isOnTrack ? "text-status-success" : "text-status-warning"
              )}>
                {velocityPerHour.toFixed(1)}%
              </span>
              <span className="text-[10px] text-muted-foreground font-black italic">/ HR</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Projeção Final</p>
            <p className={cn("text-2xl font-display font-black drop-shadow-glow", isOnTrack ? "text-status-success" : "text-status-warning")}>
              {projectedFinal.toFixed(0)}%
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-background/50 border border-white/5 space-y-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">E.T.A (Meta 100%)</span>
            </div>
            <span className="text-xs font-black text-primary">
              {projectedFinal >= 100 ? "~17:30" : "Pós-Expediente"}
            </span>
          </div>
          <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden relative z-10 border border-white/5 shadow-inner">
            <div 
              className={cn("h-full transition-all duration-1000 relative overflow-hidden", isOnTrack ? "bg-status-success" : "bg-status-warning")}
              style={{ width: `${Math.min(avgProgress, 100)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="space-y-2 pt-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse shadow-glow-primary", isOnTrack ? "bg-status-success" : "bg-status-warning")} />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                Diretriz Estratégica <Zap className="h-2.5 w-2.5 text-primary" />
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed border-l-2 border-primary/20 pl-3 italic bg-primary/5 py-2 rounded-r-lg">
              {isOnTrack 
                ? "Ritmo excelente! Foque em QUALIDADE e ticket médio. O volume está estabilizado."
                : "Aceleração necessária: Aumentar taxa de prospecção em 15% para atingir a meta no horário."}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between px-1">
          <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/50">Confiança do Sistema Predictor</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={cn("w-2 h-1.5 rounded-full transition-all", i <= 4 ? "bg-primary shadow-glow-primary" : "bg-white/10")} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};