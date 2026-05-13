import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays, differenceInHours } from "date-fns";

interface SLAIndicatorProps {
  stageEnteredAt: string;
  stage: string;
  className?: string;
}

const SLA_LIMITS: Record<string, number> = {
  lead: 1, // 24h
  qualified: 2, // 48h
  proposal: 3, // 72h
  negotiation: 4, // 96h
  won: 7, // 168h
};

function SLAIndicatorComponent({ stageEnteredAt, stage, className }: SLAIndicatorProps) {
  const normalizedStage = stage.toLowerCase().replace(/[^a-z]/g, "");
  const limit = SLA_LIMITS[normalizedStage];
  if (!limit) return null;

  const daysInStage = differenceInDays(new Date(), new Date(stageEnteredAt));
  const hoursInStage = differenceInHours(new Date(), new Date(stageEnteredAt));
  const pct = (daysInStage / limit) * 100;

  const isOverdue = daysInStage >= limit;
  const isWarning = pct >= 70 && !isOverdue;

  if (pct < 50) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "text-[9px] gap-1 cursor-default",
            isOverdue && "bg-destructive/10 text-destructive border-destructive/30 animate-pulse",
            isWarning && "bg-status-warning/10 text-status-warning border-status-warning/30",
            className
          )}
        >
          {isOverdue ? <AlertTriangle className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
          {daysInStage}d/{limit}d
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">
          {isOverdue
            ? `⚠️ SLA excedido! ${daysInStage - limit} dia(s) além do limite de ${limit} dias`
            : `${daysInStage} de ${limit} dias (${pct.toFixed(0)}%)`}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export const SLAIndicator = React.memo(SLAIndicatorComponent);
