import { forwardRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSalespersonXP, calculateLevelFromXP, getLevelInfo } from "@/hooks/useSalespersonXP";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarXPBarProps {
  isCollapsed: boolean;
}

export const SidebarXPBar = forwardRef<HTMLDivElement, SidebarXPBarProps>(function SidebarXPBar({ isCollapsed }, _ref) {
  const { salesperson } = useAuth();
  const { data: xpData } = useSalespersonXP(salesperson?.id);

  if (!salesperson || !xpData) return null;

  const { level, progress, xpInLevel, xpToNext } = calculateLevelFromXP(xpData.total_xp);
  const levelInfo = getLevelInfo(level);

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center gap-1 px-1 py-2">
              <span className="text-xs font-bold">{levelInfo.emoji}</span>
              <div className="w-6 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full bg-gradient-to-r", levelInfo.color)}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-medium">Nível {level} — {levelInfo.title}</p>
            <p className="text-xs text-muted-foreground">{xpData.total_xp} XP total</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
          {levelInfo.emoji} Lv.{level} {levelInfo.title}
        </span>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {xpInLevel}/{xpToNext} XP
        </span>
      </div>
      <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", levelInfo.color)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
});
SidebarXPBar.displayName = "SidebarXPBar";
