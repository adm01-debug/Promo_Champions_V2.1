import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ForecastRollupRow } from "@/hooks/revenue/useRevenueIntelligenceHub";

const labels: Record<string, string> = {
  commit: "Commit",
  best_case: "Best Case",
  pipeline: "Pipeline",
  closed: "Closed",
  omitted: "Omitted",
};

const colors: Record<string, string> = {
  commit: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  best_case: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  pipeline: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  closed: "bg-primary/10 text-primary border-primary/30",
  omitted: "bg-muted text-muted-foreground border-border",
};

interface Props {
  rollup: ForecastRollupRow[];
  variance: Record<string, number>;
}

export const ForecastCategoriesPanel: FC<Props> = ({ rollup, variance }) => {
  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <CardTitle className="font-display">Forecast Roll-Up por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-5">
        {rollup.map((r) => {
          const v = variance[r.category] ?? 0;
          const Icon = v > 0 ? TrendingUp : v < 0 ? TrendingDown : Minus;
          return (
            <div key={r.category} className={`p-4 rounded-lg border ${colors[r.category] ?? ""}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium uppercase tracking-wide">{labels[r.category]}</span>
                <Badge variant="outline" className="text-xs">{r.deal_count}</Badge>
              </div>
              <div className="text-xl font-display font-bold">{fmt(Number(r.weighted_amount))}</div>
              <div className="text-xs text-muted-foreground mt-1">Total: {fmt(Number(r.total_amount))}</div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <Icon className="h-3 w-3" />
                <span>{v > 0 ? "+" : ""}{v.toFixed(1)}% vs anterior</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
