import React from "react";
import { cn } from "@/lib/utils";
import { directionColor, directionBg, type ScoreDriver } from "./predictiveScoringHelpers";
import { ArrowUp, ArrowDown } from "lucide-react";

interface Props {
  driver: ScoreDriver;
}

export const ScoreContributionBar = React.memo(({ driver }: Props) => {
  const Icon = driver.direction === "positive" ? ArrowUp : ArrowDown;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon className={cn("h-3 w-3 shrink-0", directionColor(driver.direction))} />
          <span className="truncate font-medium">{driver.label}</span>
        </div>
        <span className={cn("font-mono font-semibold tabular-nums", directionColor(driver.direction))}>
          {driver.direction === "positive" ? "+" : "-"}
          {driver.contribution_pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full transition-all", directionBg(driver.direction))}
          style={{ width: `${Math.min(100, driver.contribution_pct)}%` }}
        />
      </div>
    </div>
  );
});
ScoreContributionBar.displayName = "ScoreContributionBar";
