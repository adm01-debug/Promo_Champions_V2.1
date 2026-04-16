import React, { useState } from "react";
import { useBenchmarkData, BenchmarkPeriod, BenchmarkResult } from "@/hooks/useBenchmarkData";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const PERIOD_LABELS: Record<BenchmarkPeriod, string> = {
  mom: "MoM",
  qoq: "QoQ",
  yoy: "YoY",
};

const formatValue = (value: number, fmt: BenchmarkResult["format"]) => {
  switch (fmt) {
    case "currency":
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(value);
    case "percent":
      return `${value.toFixed(1)}%`;
    case "number":
      return value.toLocaleString("pt-BR");
  }
};

export const BenchmarkPanel = React.memo(() => {
  const [period, setPeriod] = useState<BenchmarkPeriod>("mom");
  const { benchmarks, isLoading } = useBenchmarkData(period);

  return (
    <div className="glass rounded-xl border border-border/40 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm">Benchmarking Histórico</h3>
        <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
          {(Object.keys(PERIOD_LABELS) as BenchmarkPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                p === period
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={`Período ${PERIOD_LABELS[p]}`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {benchmarks.map((b) => (
            <div
              key={b.metric}
              className={cn(
                "rounded-lg p-3 border transition-colors",
                b.trend === "up" && "border-green-500/20 bg-green-500/5",
                b.trend === "down" && "border-destructive/20 bg-destructive/5",
                b.trend === "stable" && "border-border/30 bg-muted/10"
              )}
            >
              <p className="text-[10px] text-muted-foreground mb-1">{b.metric}</p>
              <p className="text-lg font-display font-bold">{formatValue(b.current, b.format)}</p>
              <div className="flex items-center gap-1 mt-1">
                {b.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : b.trend === "down" ? (
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                ) : (
                  <Minus className="h-3 w-3 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    b.trend === "up" && "text-green-500",
                    b.trend === "down" && "text-destructive",
                    b.trend === "stable" && "text-muted-foreground"
                  )}
                >
                  {b.changePercent > 0 ? "+" : ""}
                  {b.changePercent.toFixed(1)}%
                </span>
                <span className="text-[10px] text-muted-foreground">
                  vs {formatValue(b.previous, b.format)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

BenchmarkPanel.displayName = "BenchmarkPanel";
