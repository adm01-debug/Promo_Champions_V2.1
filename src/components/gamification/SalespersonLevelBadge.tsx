import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getLevelInfo } from "@/hooks/useSalespersonXP";

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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={`bg-gradient-to-r ${levelInfo.color} text-primary-foreground border-0 ${sizeClasses[size]} cursor-default flex-shrink-0`}
          >
            {levelInfo.emoji} {showTitle ? levelInfo.title : `${level}`}
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
