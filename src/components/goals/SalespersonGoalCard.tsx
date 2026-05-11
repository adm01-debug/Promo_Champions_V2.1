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
  predictedAttainment?: number;
  paceStatus?: 'ahead' | 'on_track' | 'behind';
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
  predictedAttainment,
  paceStatus,
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

      {/* Enhanced Progress Section */}
      <div className="mt-6 space-y-3">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Resultado Real</span>
            <span className="text-sm font-black tracking-tight">{formatCurrency(currentSales)}</span>
          </div>
          <div className="text-right flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Objetivo</span>
            <span className="text-sm font-black tracking-tight">{formatCurrency(goalAmount)}</span>
          </div>
        </div>
        
        <div className="relative h-3 w-full bg-muted/40 rounded-full overflow-hidden shadow-inner border border-border/5">
          <div 
            className={`absolute h-full transition-all duration-1000 ease-out ${
              hasExceededGoal 
                ? "bg-gradient-to-r from-status-success via-status-success/80 to-rank-gold animate-xp-shimmer" 
                : "bg-gradient-to-r from-primary via-primary/80 to-accent"
            }`} 
            style={{ width: `${progressCapped}%` }} 
          />
          {hasExceededGoal && (
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          )}
        </div>
      </div>

      {/* Strategic Insights Grid */}
      {goalAmount > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 relative z-10">
          <div className="p-3 rounded-2xl bg-muted/30 border border-border/10 flex flex-col items-center justify-center group/stat transition-all hover:bg-muted/50">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3 w-3 text-primary group-hover/stat:scale-110 transition-transform" />
              <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Performance</span>
            </div>
            <p className="text-sm font-black gradient-text">{formatCurrency(dailyAverage)}/dia</p>
          </div>
          
          <div className={`p-3 rounded-2xl border flex flex-col items-center justify-center group/stat transition-all ${
            requiredDailyAverage > dailyAverage 
              ? "bg-status-warning/5 border-status-warning/20 hover:bg-status-warning/10" 
              : "bg-status-success/5 border-status-success/20 hover:bg-status-success/10"
          }`}>
            <div className="flex items-center gap-1.5 mb-1">
              <Target className={`h-3 w-3 group-hover/stat:scale-110 transition-transform ${
                requiredDailyAverage > dailyAverage ? "text-status-warning" : "text-status-success"
              }`} />
              <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Target</span>
            </div>
            <p className={`text-sm font-black ${
              requiredDailyAverage > dailyAverage ? "text-status-warning" : "text-status-success"
            }`}>
              {formatCurrency(requiredDailyAverage)}/dia
            </p>
          </div>
        </div>
      )}

      {/* Floating Rank Indicator */}
      <div className="absolute top-4 right-4 text-right flex flex-col items-end">
        <span className={`text-2xl font-display font-black tracking-tighter italic leading-none ${
          hasExceededGoal ? "text-status-success drop-shadow-glow-sm" : "text-foreground/80"
        }`}>
          {progress.toFixed(0)}%
        </span>
        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1">Rank #{rank}</span>
      </div>
    </div>
  );
}

export const SalespersonGoalCard = React.memo(_SalespersonGoalCard);
