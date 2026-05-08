import React, { useState } from "react";
import { useBenchmarkData, BenchmarkPeriod, BenchmarkResult } from "@/hooks/useBenchmarkData";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 backdrop-blur-xl p-5 space-y-5 group">
      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-primary/20 group-hover:border-primary/40 transition-colors" />
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
           <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Activity className="h-3.5 w-3.5 text-primary" />
           </div>
           <h3 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-primary">Global Benchmark</h3>
        </div>
        
        <div className="flex gap-1 bg-black/40 rounded-lg p-1 border border-white/5 backdrop-blur-md">
          {(Object.keys(PERIOD_LABELS) as BenchmarkPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1 rounded-md text-[9px] font-mono font-bold uppercase tracking-widest transition-all",
                p === period
                  ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(14,165,233,0.1)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
              aria-label={`Period ${PERIOD_LABELS[p]}`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 relative z-10">
          {benchmarks.map((b, idx) => (
            <motion.div
              key={b.metric}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "relative rounded-xl p-4 border transition-all duration-300 group/item overflow-hidden",
                b.trend === "up" ? "border-success/30 bg-success/5 hover:border-success/50" : 
                b.trend === "down" ? "border-destructive/30 bg-destructive/5 hover:border-destructive/50" : 
                "border-white/5 bg-white/[0.03] hover:border-white/20"
              )}
            >
              <div className="relative z-10">
                <p className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-1 group-hover/item:text-muted-foreground transition-colors">{b.metric}</p>
                <p className="text-xl font-mono font-black tracking-tighter tabular-nums">{formatValue(b.current, b.format)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded border text-[8px] font-mono font-black uppercase",
                    b.trend === "up" ? "text-success border-success/30 bg-success/10" :
                    b.trend === "down" ? "text-destructive border-destructive/30 bg-destructive/10" :
                    "text-muted-foreground border-white/10 bg-white/5"
                  )}>
                    {b.trend === "up" ? (
                      <ArrowUpRight className="h-2.5 w-2.5" />
                    ) : b.trend === "down" ? (
                      <ArrowDownRight className="h-2.5 w-2.5" />
                    ) : (
                      <Minus className="h-2.5 w-2.5" />
                    )}
                    {b.changePercent > 0 ? "+" : ""}{b.changePercent.toFixed(1)}%
                  </div>
                  <span className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-tighter">
                    VS {formatValue(b.previous, b.format)}
                  </span>
                </div>
              </div>

              {/* Decorative mini zap icon for positive trends */}
              {b.trend === "up" && (
                <Zap className="absolute -bottom-1 -right-1 h-8 w-8 text-success/10 rotate-12 group-hover/item:text-success/20 transition-all" />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Decorative vertical scanline */}
      <motion.div 
        className="absolute top-0 right-0 w-[1px] h-full bg-primary/10"
        animate={{ opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
    </div>
  );
});

BenchmarkPanel.displayName = "BenchmarkPanel";