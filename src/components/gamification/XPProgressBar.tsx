import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateLevelFromXP, getLevelInfo } from "@/hooks/useSalespersonXP";
import { Sparkles, Star, Zap } from "lucide-react";

interface XPProgressBarProps {
  totalXP: number;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
}

export function XPProgressBar({ totalXP, showDetails = true, size = "md" }: XPProgressBarProps) {
  const { level, xpInLevel, xpToNext, progress } = calculateLevelFromXP(totalXP);
  const levelInfo = getLevelInfo(level);

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="space-y-2">
            {showDetails && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`bg-gradient-to-r ${levelInfo.color} text-primary-foreground border-0 text-[10px] px-1.5 py-0 shadow-sm hover:shadow-md transition-shadow flex items-center gap-1`}
                  >
                    <Star className="h-2.5 w-2.5 fill-current" />
                    {levelInfo.emoji} Nv.{level}
                  </Badge>
                  <span className="text-muted-foreground font-medium">{levelInfo.title}</span>
                </div>
                <span className="font-display font-bold text-xp flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {totalXP.toLocaleString()} XP
                </span>
              </div>
            )}
            <div className="relative group">
              <div className={`${sizeClasses[size]} rounded-full bg-muted/50 overflow-hidden border border-border/30`}>
                {progress > 0 && (
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${levelInfo.color} transition-all duration-700 ease-out relative overflow-hidden animate-xp-shimmer`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                )}
              </div>
              <div 
                className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white shadow-md border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${Math.min(progress, 100)}% - 4px)` }}
              />
            </div>
            {showDetails && level < 20 && (
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="font-medium text-foreground">{xpInLevel.toLocaleString()}</span>
                  <span>/</span>
                  <span>{xpToNext.toLocaleString()} XP</span>
                </span>
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  {(xpToNext - xpInLevel).toLocaleString()} para Nv.{level + 1}
                </span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="glass border-border/40 dark:border-glow max-w-xs p-3">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${levelInfo.color}`}>
                <span className="text-lg">{levelInfo.emoji}</span>
              </div>
              <div>
                <p className="font-display font-bold gradient-text">{levelInfo.title}</p>
                <p className="text-xs text-muted-foreground">Nível {level}</p>
              </div>
            </div>
            <div className="text-xs space-y-1 pt-2 border-t border-border/30">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">XP Total:</span>
                <span className="font-bold text-xp">{totalXP.toLocaleString()}</span>
              </div>
              {level < 20 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Próximo nível:</span>
                  <span className="font-medium text-primary">{(xpToNext - xpInLevel).toLocaleString()} XP</span>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
