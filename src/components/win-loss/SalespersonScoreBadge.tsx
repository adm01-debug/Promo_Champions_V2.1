import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Gem } from "lucide-react";
import type { SalespersonScore } from "@/hooks/win-loss/useWinLossSalespersonScore";
import { tierLabel, tierClasses } from "@/hooks/win-loss/useWinLossSalespersonScore";

interface Props {
  score: SalespersonScore | undefined;
}

export function SalespersonScoreBadge({ score }: Props) {
  if (!score) return <span className="text-muted-foreground">—</span>;
  const tier = score.tier;
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`${tierClasses[tier]} text-[10px] tabular-nums gap-1`}>
            <Gem className="h-2.5 w-2.5" />
            {score.score}
            <span className="opacity-70">· {tierLabel[tier]}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-[11px]">
          Win rate: {score.factors.winRate.toFixed(0)}<br />
          Ticket: {score.factors.ticket.toFixed(0)}<br />
          Ciclo: {score.factors.cycle.toFixed(0)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
