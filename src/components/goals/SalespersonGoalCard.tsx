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

export function SalespersonGoalCard({
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

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      hasExceededGoal 
        ? "bg-status-success/5 border-status-success/30" 
        : onTrack 
          ? "bg-muted/30 border-border/40" 
          : "bg-streak/5 border-streak/20"
    }`}>
      <div className="flex items-start gap-3">
        {/* Rank & Avatar */}
        <div className="relative">
          <Avatar className={`h-12 w-12 ${isTopPerformer ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}>
            <AvatarImage src={avatar_url || undefined} />
            <AvatarFallback className="text-sm font-medium">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isTopPerformer && (
            <div className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary-foreground">{rank}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium truncate">{name}</span>
            <SalespersonLevelBadge level={level} totalXP={totalXP} size="xs" />
            {hasExceededGoal && <Flame className="h-4 w-4 text-streak animate-pulse" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
              {roleLabels[role] || role}
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-[9px] px-1.5 py-0 ${
                onTrack 
                  ? "bg-status-success/10 text-status-success border-status-success/20" 
                  : "bg-streak/10 text-streak border-streak/20"
              }`}
            >
              {onTrack ? <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> : <TrendingDown className="h-2.5 w-2.5 mr-0.5" />}
              {onTrack ? "No caminho" : "Atenção"}
            </Badge>
          </div>
        </div>

        {/* Progress % */}
        <div className="text-right">
          <p className={`text-lg font-bold ${hasExceededGoal ? "text-status-success" : ""}`}>
            {progress.toFixed(0)}%
          </p>
          <p className="text-[10px] text-muted-foreground">da meta</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 space-y-1.5">
        <div className="relative">
          <Progress 
            value={progressCapped} 
            className={`h-2 ${hasExceededGoal ? "[&>div]:bg-status-success" : ""}`} 
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{formatCurrency(currentSales)}</span>
          <span>Meta: {formatCurrency(goalAmount)}</span>
        </div>
      </div>

      {/* Stats Row */}
      {goalAmount > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-background/50 text-center">
            <p className="text-xs font-medium">{formatCurrency(dailyAverage)}</p>
            <p className="text-[9px] text-muted-foreground">Média/dia</p>
          </div>
          <div className="p-2 rounded-lg bg-background/50 text-center">
            <p className={`text-xs font-medium ${requiredDailyAverage > dailyAverage ? "text-streak" : "text-status-success"}`}>
              {formatCurrency(requiredDailyAverage)}
            </p>
            <p className="text-[9px] text-muted-foreground">Precisa/dia</p>
          </div>
        </div>
      )}
    </div>
  );
}
