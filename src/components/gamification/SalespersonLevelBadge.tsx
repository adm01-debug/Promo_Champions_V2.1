import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getLevelInfo } from "@/hooks/gamification/useSalespersonXP";
import { Star, Zap } from "lucide-react";

interface SalespersonLevelBadgeProps {
  level?: number;
  totalXP?: number;
  showTitle?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}

export function SalespersonLevelBadge({ 
  level = 1, 
  totalXP = 0, 
  showTitle = false, 
  size = "sm" 
}: SalespersonLevelBadgeProps) {
  const levelInfo = getLevelInfo(level);

  const sizeClasses = {
    xs: "text-[9px] px-1 py-0 leading-tight",
    sm: "text-[10px] px-1.5 py-0",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-3 py-1",
  };

  const iconSizes = {
    xs: "h-2 w-2",
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={`bg-gradient-to-r ${levelInfo.color} text-primary-foreground border-0 shadow-sm hover:shadow-md transition-all duration-200 ${sizeClasses[size]} cursor-default flex-shrink-0 flex items-center gap-0.5 animate-bounce-in hover:animate-pop`}
          >
            <Star className={`${iconSizes[size]} fill-current group-hover:animate-wiggle`} />
            {levelInfo.emoji} {showTitle ? levelInfo.title : `${level}`}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="glass border-border/40 dark:border-glow p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg bg-gradient-to-r ${levelInfo.color}`}>
              <span className="text-sm">{levelInfo.emoji}</span>
            </div>
            <div>
              <p className="font-display font-medium gradient-text">{levelInfo.title}</p>
              <p className="text-xs text-muted-foreground">Nível {level}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="h-3 w-3 text-xp" />
              <span className="font-medium text-xp">{totalXP.toLocaleString()}</span> XP total
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
