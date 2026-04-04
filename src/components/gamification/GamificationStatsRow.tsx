import React from "react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Flame, Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface GamificationStatsRowProps {
  streak: number;
  streakRecord: number;
  achievements: number;
}

export const GamificationStatsRow = React.memo(function GamificationStatsRow({ streak, streakRecord, achievements }: GamificationStatsRowProps) {
  return (
    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-default">
              <div className={cn("p-1.5 rounded-lg", streak >= 7 ? "bg-streak/20" : streak >= 3 ? "bg-primary/20" : "bg-muted")}>
                <Flame className={cn("h-3.5 w-3.5", streak >= 7 ? "text-streak animate-fire-pulse" : streak >= 3 ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="text-xs">
                <span className={cn("font-bold", streak >= 7 ? "text-streak" : streak >= 3 ? "text-primary" : "text-foreground")}>{streak}</span>
                <span className="text-muted-foreground ml-0.5">dias</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="glass border-border/40">
            <p className="text-xs">Sequência atual: <span className="font-bold">{streak} dias</span></p>
            <p className="text-[10px] text-muted-foreground">Recorde: {streakRecord} dias</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-default">
              <div className="p-1.5 rounded-lg bg-coins/20"><Trophy className="h-3.5 w-3.5 text-coins" /></div>
              <div className="text-xs">
                <span className="font-bold text-coins">{achievements}</span>
                <span className="text-muted-foreground ml-0.5">conquistas</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="glass border-border/40">
            <p className="text-xs">Total de conquistas: <span className="font-bold">{achievements}</span></p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-default ml-auto">
              <div className="p-1.5 rounded-lg bg-success/20"><Target className="h-3.5 w-3.5 text-success" /></div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="glass border-border/40">
            <p className="text-xs">Meta diária ativa</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
});
