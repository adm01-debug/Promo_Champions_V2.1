import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateLevelFromXP, getLevelInfo } from "@/hooks/useSalespersonXP";
import { Sparkles } from "lucide-react";

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
    md: "h-2",
    lg: "h-3",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="space-y-1">
            {showDetails && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Badge 
                    className={`bg-gradient-to-r ${levelInfo.color} text-primary-foreground border-0 text-[10px] px-1.5 py-0`}
                  >
                    {levelInfo.emoji} Nv.{level}
                  </Badge>
                  <span className="text-muted-foreground">{levelInfo.title}</span>
                </div>
                <span className="text-muted-foreground">
                  {totalXP.toLocaleString()} XP
                </span>
              </div>
            )}
            <div className="relative">
              <Progress 
                value={progress} 
                className={`${sizeClasses[size]} bg-muted/50`}
              />
              {progress > 0 && (
                <div 
                  className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full bg-gradient-to-r ${levelInfo.color} transition-all duration-500`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              )}
            </div>
            {showDetails && level < 20 && (
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{xpInLevel.toLocaleString()} / {xpToNext.toLocaleString()} XP</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {(xpToNext - xpInLevel).toLocaleString()} para Nv.{level + 1}
                </span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{levelInfo.emoji}</span>
              <div>
                <p className="font-medium">{levelInfo.title}</p>
                <p className="text-xs text-muted-foreground">Nível {level}</p>
              </div>
            </div>
            <div className="text-xs space-y-1">
              <p>XP Total: <span className="font-medium">{totalXP.toLocaleString()}</span></p>
              {level < 20 && (
                <p>Próximo nível: <span className="font-medium">{(xpToNext - xpInLevel).toLocaleString()} XP</span></p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
