import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Flame, Target } from "lucide-react";
import { SalespersonLevelBadge } from "@/components/gamification/SalespersonLevelBadge";

interface SalespersonGoalCardProps {
  id?: string;
  name: string;
  avatar_url: string | null;
  role: string;
  goalAmount: number;
  currentSales: number;
  progress: number;
  projection: number;
  onTrack: boolean;
  dailyAverage: number;
  requiredDailyAverage: number;
  rank: number;
  level?: number;
  totalXP?: number;
}

const roleLabels: Record<string, string> = {
  sdr: "SDR",
  closer: "Closer",
  hybrid: "Híbrido",
};

function _SalespersonGoalCard({
  name,
  avatar_url,
  role,
  goalAmount,
  currentSales,
  progress,
  projection,
  onTrack,
  dailyAverage,
  requiredDailyAverage,
  rank,
  level = 1,
  totalXP = 0,
}: SalespersonGoalCardProps) {
  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  const progressCapped = Math.min(progress, 100);
  const isTopPerformer = rank <= 3;
  const hasExceededGoal = progress >= 100;
  
  // Calculate trend: if projection is 10% higher than goal, it's strong
  const isStrongTrend = projection > goalAmount * 1.1;

  return (
    <div className={`group p-5 rounded-2xl border transition-all duration-500 hover:scale-[1.02] cursor-pointer relative overflow-hidden ${
      hasExceededGoal 
        ? "bg-gradient-to-br from-status-success/10 via-background to-background border-status-success/40 shadow-xl shadow-status-success/10" 
        : onTrack 
          ? "glass bg-card/80 border-border/40 hover:border-primary/40" 
          : "bg-gradient-to-br from-status-warning/10 via-background to-background border-status-warning/30 shadow-lg shadow-status-warning/5"
    }`}>
      {/* Dynamic Background Glow */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[80px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-40 ${
        hasExceededGoal ? "bg-status-success" : onTrack ? "bg-primary" : "bg-status-warning"
      }`} />

      <div className="flex items-start gap-4 relative z-10">
        {/* Rank & Avatar */}
        {/* Rank & Avatar with XP Ring */}
        <div className="relative">
          <div className={`absolute -inset-1 rounded-full blur-sm opacity-0 group-hover:opacity-60 transition-opacity ${
            hasExceededGoal ? "bg-status-success" : "bg-primary"
          }`} />
          <Avatar className={`h-14 w-14 shadow-2xl relative border-2 transition-transform duration-500 group-hover:scale-110 ${
            isTopPerformer ? "border-primary" : "border-background"
          }`}>
            <AvatarImage src={avatar_url || undefined} className="object-cover" />
            <AvatarFallback className="text-base font-display font-black gradient-primary text-primary-foreground">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {rank <= 3 && (
            <div className={`absolute -top-1 -left-1 h-7 w-7 rounded-full flex items-center justify-center shadow-lg border-2 border-background z-20 ${
              rank === 1 ? "bg-rank-gold" : rank === 2 ? "bg-rank-silver" : "bg-rank-bronze"
            }`}>
              <span className="text-[10px] font-black text-white">{rank}º</span>
            </div>
          )}
        </div>

        {/* Info & Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-display font-black tracking-tight truncate group-hover:text-primary transition-colors">
              {name}
            </h3>
            <SalespersonLevelBadge level={level} totalXP={totalXP} size="xs" />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-background/50 border-border/40">
              {roleLabels[role] || role}
            </Badge>
            {isStrongTrend && (
              <Badge className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-status-success/20 text-status-success border-none animate-pulse">
                Ritmo Acelerado
              </Badge>
            )}
            {hasExceededGoal && (
              <Badge className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-rank-gold/20 text-rank-gold border-none">
                Bônus Ativo
              </Badge>
            )}
          </div>
        </div>

        {/* Progress % */}
        <div className="text-right">
          <p className={`text-xl font-display font-bold ${hasExceededGoal ? "text-status-success" : "gradient-text"}`}>
            {progress.toFixed(0)}%
          </p>
          <p className="text-overline font-medium">da meta</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 space-y-2">
        <div className="relative">
          <Progress 
            value={progressCapped} 
            className={`h-2.5 ${hasExceededGoal ? "[&>div]:bg-gradient-to-r [&>div]:from-status-success [&>div]:to-status-success/70" : ""}`} 
          />
          {progress >= 100 && (
            <div className="absolute inset-0 animate-xp-shimmer opacity-50 rounded-full" />
          )}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span className="font-medium">{formatCurrency(currentSales)}</span>
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            Meta: <span className="font-medium text-foreground">{formatCurrency(goalAmount)}</span>
          </span>
        </div>
      </div>

      {/* Stats Row */}
      {goalAmount > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl glass border border-border/30 text-center hover:bg-muted/30 transition-colors">
            <p className="text-sm font-display font-bold gradient-text">{formatCurrency(dailyAverage)}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Média/dia</p>
          </div>
          <div className="p-2.5 rounded-xl glass border border-border/30 text-center hover:bg-muted/30 transition-colors">
            <p className={`text-sm font-display font-bold ${requiredDailyAverage > dailyAverage ? "text-status-warning" : "text-status-success"}`}>
              {formatCurrency(requiredDailyAverage)}
            </p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Precisa/dia</p>
          </div>
        </div>
      )}
    </div>
  );
}

export const SalespersonGoalCard = React.memo(_SalespersonGoalCard);
