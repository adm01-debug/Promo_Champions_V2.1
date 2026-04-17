import { TrendingUp, TrendingDown } from "lucide-react";
import type { DealHealthFactor } from "@/hooks/deal-intelligence/useDealHealth";

interface Props {
  factors: DealHealthFactor[];
}

export function DealHealthFactorsList({ factors }: Props) {
  if (!factors || factors.length === 0) {
    return <p className="text-xs text-muted-foreground">Sem fatores identificados</p>;
  }

  const sorted = [...factors].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return (
    <div className="space-y-1.5">
      {sorted.map((f, i) => {
        const positive = f.impact > 0;
        const Icon = positive ? TrendingUp : TrendingDown;
        const color = positive ? "text-status-success" : "text-destructive";
        return (
          <div key={`${f.key}-${i}`} className="flex items-center gap-2 text-sm p-2 rounded-lg glass border border-border/30">
            <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
            <span className="flex-1 truncate">{f.label}</span>
            <span className={`text-xs font-display font-bold ${color} tabular-nums`}>
              {positive ? "+" : ""}{f.impact}
            </span>
          </div>
        );
      })}
    </div>
  );
}
