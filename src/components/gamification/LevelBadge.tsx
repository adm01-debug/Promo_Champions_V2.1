import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateLevelFromXP, getLevelInfo } from "@/hooks/useSalespersonXP";
import { Star } from "lucide-react";

interface LevelBadgeProps {
  totalXP: number;
  showTitle?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LevelBadge({ totalXP, showTitle = false, size = "md" }: LevelBadgeProps) {
  const { level } = calculateLevelFromXP(totalXP);
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
            className={`bg-gradient-to-r ${levelInfo.color} text-primary-foreground border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 ${sizeClasses[size]} cursor-default flex items-center gap-1`}
          >
            <Star className={`${iconSizes[size]} fill-current`} />
            {levelInfo.emoji} {showTitle ? levelInfo.title : `Nv.${level}`}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="glass border-border/40 dark:border-glow p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg bg-gradient-to-r ${levelInfo.color}`}>
              <Star className="h-3 w-3 text-white fill-current" />
            </div>
            <div>
              <p className="font-display font-bold gradient-text">{levelInfo.title}</p>
              <p className="text-xs text-muted-foreground">Nível {level}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="font-medium text-xp">{totalXP.toLocaleString()}</span> XP total
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
