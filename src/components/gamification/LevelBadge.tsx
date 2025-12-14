import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateLevelFromXP, getLevelInfo } from "@/hooks/useSalespersonXP";
import { Star, Sparkles, Zap } from "lucide-react";

interface LevelBadgeProps {
  totalXP: number;
  showTitle?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LevelBadge({ totalXP, showTitle = false, size = "md" }: LevelBadgeProps) {
  const { level, xpInLevel, xpToNext, progress } = calculateLevelFromXP(totalXP);
  const levelInfo = getLevelInfo(level);

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-3 py-1",
  };

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={`bg-gradient-to-r ${levelInfo.color} text-primary-foreground border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${sizeClasses[size]} cursor-default flex items-center gap-1 group animate-bounce-in hover:animate-pop`}
          >
            <Star className={`${iconSizes[size]} fill-current group-hover:animate-wiggle`} />
            <span className="font-display font-bold">
              {levelInfo.emoji} {showTitle ? levelInfo.title : `Nv.${level}`}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="glass border-border/40 dark:border-glow p-4 min-w-[200px]" sideOffset={8}>
          <div className="space-y-3">
            {/* Header with level info */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${levelInfo.color} shadow-lg group`}>
                <Star className="h-5 w-5 text-white fill-current" />
              </div>
              <div>
                <p className="font-display font-bold text-base gradient-text">{levelInfo.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Nível {level}
                </p>
              </div>
            </div>
            
            {/* XP Progress */}
            <div className="space-y-2 pt-2 border-t border-border/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">XP Total</span>
                <span className="font-display font-bold text-xp flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {totalXP.toLocaleString()}
                </span>
              </div>
              
              {level < 20 && (
                <>
                  <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${levelInfo.color} transition-all duration-500`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{xpInLevel.toLocaleString()} / {xpToNext.toLocaleString()}</span>
                    <span className="text-primary font-medium">
                      {(xpToNext - xpInLevel).toLocaleString()} para Nv.{level + 1}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}