import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateLevelFromXP, getLevelInfo } from "@/hooks/useSalespersonXP";

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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={`bg-gradient-to-r ${levelInfo.color} text-primary-foreground border-0 ${sizeClasses[size]} cursor-default`}
          >
            {levelInfo.emoji} {showTitle ? levelInfo.title : `Nv.${level}`}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            <span className="font-medium">{levelInfo.title}</span>
            <span className="text-muted-foreground"> - Nível {level}</span>
          </p>
          <p className="text-xs text-muted-foreground">{totalXP.toLocaleString()} XP total</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
