import { FC } from "react";
import { formatBRL } from "./forecastHelpers";

interface Props {
  commit: number;
  best: number;
  upside: number;
  goal: number;
}

export const ForecastScenarioBar: FC<Props> = ({ commit, best, upside, goal }) => {
  const total = commit + best + upside;
  const max = Math.max(total, goal, 1);
  const pct = (n: number) => (n / max) * 100;

  return (
    <div className="space-y-2">
      <div className="relative h-8 w-full rounded-md bg-muted overflow-hidden border border-border">
        <div className="absolute inset-y-0 left-0 bg-emerald-500/70" style={{ width: `${pct(commit)}%` }} />
        <div
          className="absolute inset-y-0 bg-blue-500/60"
          style={{ left: `${pct(commit)}%`, width: `${pct(best)}%` }}
        />
        <div
          className="absolute inset-y-0 bg-amber-500/50"
          style={{ left: `${pct(commit + best)}%`, width: `${pct(upside)}%` }}
        />
        {goal > 0 && (
          <div
            className="absolute inset-y-0 w-0.5 bg-foreground"
            style={{ left: `${pct(goal)}%` }}
            title={`Meta: ${formatBRL(goal)}`}
          />
        )}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Commit {formatBRL(commit)}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-blue-500" /> Best {formatBRL(best)}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-amber-500" /> Upside {formatBRL(upside)}
        </span>
        {goal > 0 && (
          <span className="flex items-center gap-1">
            <span className="h-3 w-0.5 bg-foreground" /> Meta {formatBRL(goal)}
          </span>
        )}
      </div>
    </div>
  );
};
