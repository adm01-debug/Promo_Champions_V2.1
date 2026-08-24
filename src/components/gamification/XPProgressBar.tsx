import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateLevelFromXP, getLevelInfo } from "@/hooks/gamification/useSalespersonXP";
import { Sparkles, Star, Zap, Trophy, ArrowUp } from "lucide-react";

interface XPProgressBarProps {
  totalXP: number;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
}

export function XPProgressBar({ totalXP, showDetails = true, size = "md" }: XPProgressBarProps) {
  const { level, xpInLevel, xpToNext, progress } = calculateLevelFromXP(totalXP);
  const levelInfo = getLevelInfo(level);
  const nextLevelInfo = getLevelInfo(level + 1);

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  };

  const isMaxLevel = level >= 20;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="space-y-2 animate-fade-in">
            {showDetails && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`bg-gradient-to-r ${levelInfo.color} text-primary-foreground border-0 text-[10px] px-1.5 py-0 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-1 group`}
                  >
                    <Star className="h-2.5 w-2.5 fill-current group-hover:animate-pulse" />
                    <span className="font-display font-bold">{levelInfo.emoji} Nv.{level}</span>
                  </Badge>
                  <span className="text-muted-foreground font-medium">{levelInfo.title}</span>
                </div>
                <span className="font-display font-bold text-xp flex items-center gap-1 group">
                  <Zap className="h-3 w-3 group-hover:animate-pulse" />
                  {totalXP.toLocaleString()} XP
                </span>
              </div>
            )}
            <div className="relative group">
              <div className={`${sizeClasses[size]} rounded-full bg-muted/50 overflow-hidden border border-border/30 shadow-inner`}>
                {progress > 0 && (
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${levelInfo.color} transition-all duration-700 ease-out relative overflow-hidden`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                )}
              </div>
              {/* Progress indicator dot */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-background shadow-lg border-2 border-primary opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100"
                style={{ left: `calc(${Math.min(progress, 100)}% - 6px)` }}
              />
            </div>
            {showDetails && !isMaxLevel && (
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="font-medium text-foreground">{xpInLevel.toLocaleString()}</span>
                  <span>/</span>
                  <span>{xpToNext.toLocaleString()} XP</span>
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors cursor-default group">
                  <ArrowUp className="h-3 w-3 group-hover:animate-bounce" />
                  {(xpToNext - xpInLevel).toLocaleString()} para Nv.{level + 1}
                </span>
              </div>
            )}
            {showDetails && isMaxLevel && (
              <div className="flex items-center justify-center gap-2 text-[10px] text-rank-gold font-medium">
                <Trophy className="h-3 w-3 animate-pulse" />
                <span>Nível Máximo Alcançado!</span>
                <Trophy className="h-3 w-3 animate-pulse" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="glass border-border/40 dark:border-glow max-w-xs p-4" sideOffset={8}>
          <div className="space-y-3">
            {/* Current Level */}
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${levelInfo.color} shadow-lg`}>
                <span className="text-xl">{levelInfo.emoji}</span>
              </div>
              <div>
                <p className="font-display font-bold text-base gradient-text">{levelInfo.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3 text-primary fill-primary" />
                  Nível {level}
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="text-xs space-y-2 pt-3 border-t border-border/30">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  XP Total
                </span>
                <span className="font-display font-bold text-xp">{totalXP.toLocaleString()}</span>
              </div>
              {!isMaxLevel && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ArrowUp className="h-3 w-3" />
                      Próximo nível
                    </span>
                    <span className="font-medium text-primary">{(xpToNext - xpInLevel).toLocaleString()} XP</span>
                  </div>
                  <div className="pt-2 border-t border-border/20">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                      <span>Próximo: </span>
                      <span className="font-medium text-foreground">{nextLevelInfo.emoji} {nextLevelInfo.title}</span>
                    </div>
                  </div>
                </>
              )}
              {isMaxLevel && (
                <div className="flex items-center justify-center gap-2 text-rank-gold pt-1">
                  <Trophy className="h-4 w-4" />
                  <span className="font-display font-bold">Mestre Supremo!</span>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}