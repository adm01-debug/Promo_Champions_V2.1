import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Activity, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { usePeriodTrend } from "@/hooks/usePeriodTrend";
import { PERIOD_LABELS, type KPIPeriod } from "@/hooks/useDashboardKPIsPeriod";
import { cn } from "@/lib/utils";

const PERIOD_STORAGE_KEY = "dashboard.speedometer.period";
const VALID: KPIPeriod[] = ["current_month", "last_month", "quarter", "year"];

const isValidPeriod = (v: unknown): v is KPIPeriod =>
  typeof v === "string" && (VALID as string[]).includes(v);

const formatCurrencyCompact = (v: number) =>
  v >= 1000
    ? `R$ ${(v / 1000).toFixed(1)}k`
    : `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-border/60 bg-card/95 backdrop-blur-md px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold text-foreground mb-1.5">{point.fullLabel}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-muted-foreground">Faturamento:</span>
          <span className="font-mono font-bold text-primary">
            R$ {Number(point.revenue).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="text-muted-foreground">Vendas:</span>
          <span className="font-mono font-bold text-success">{point.sales}</span>
        </div>
      </div>
    </div>
  );
};

export const PeriodTrendChart = () => {
  const [period, setPeriod] = useState<KPIPeriod>(() => {
    if (typeof window === "undefined") return "current_month";
    const stored = window.localStorage.getItem(PERIOD_STORAGE_KEY);
    return isValidPeriod(stored) ? stored : "current_month";
  });

  // Sync if other component changes it (storage event + interval poll for same-tab)
  useEffect(() => {
    const sync = () => {
      const stored = window.localStorage.getItem(PERIOD_STORAGE_KEY);
      if (isValidPeriod(stored) && stored !== period) setPeriod(stored);
    };
    window.addEventListener("storage", sync);
    const id = window.setInterval(sync, 1500);
    return () => {
      window.removeEventListener("storage", sync);
      window.clearInterval(id);
    };
  }, [period]);

  const { data, isLoading } = usePeriodTrend(period);

  const totals = useMemo(() => {
    const arr = data ?? [];
    return {
      revenue: arr.reduce((s, p) => s + p.revenue, 0),
      sales: arr.reduce((s, p) => s + p.sales, 0),
      peakRevenue: arr.reduce((m, p) => Math.max(m, p.revenue), 0),
      peakSales: arr.reduce((m, p) => Math.max(m, p.sales), 0),
    };
  }, [data]);

  const chartData = data ?? [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/[0.03] shadow-lg"
    >
      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative p-5 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30"
            >
              <Activity className="h-5 w-5 text-primary" />
            </motion.div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight font-sora">
                Tendência do Período
              </h2>
              <p className="text-xs text-muted-foreground">
                Faturamento e vendas em{" "}
                <span className="font-semibold text-foreground">
                  {PERIOD_LABELS[period].label}
                </span>
              </p>
            </div>
          </div>

          {/* Period chips */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-muted/40 border border-border/40">
            {VALID.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPeriod(p);
                  try {
                    window.localStorage.setItem(PERIOD_STORAGE_KEY, p);
                  } catch {
                    /* ignore */
                  }
                }}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  period === p
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                )}
              >
                {PERIOD_LABELS[p].label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatPill
            icon={DollarSign}
            label="Faturamento Total"
            value={formatCurrencyCompact(totals.revenue)}
            accent="primary"
          />
          <StatPill
            icon={ShoppingBag}
            label="Vendas Totais"
            value={String(totals.sales)}
            accent="success"
          />
          <StatPill
            icon={TrendingUp}
            label="Pico Faturamento"
            value={formatCurrencyCompact(totals.peakRevenue)}
            accent="primary"
          />
          <StatPill
            icon={TrendingUp}
            label="Pico Vendas"
            value={String(totals.peakSales)}
            accent="success"
          />
        </div>

        {/* Chart */}
        <div className="relative h-[300px] sm:h-[340px] rounded-xl bg-background/40 border border-border/40 p-3">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Carregando tendência...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Sem dados no período selecionado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineRevenue" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="lineSales" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.3}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke="hsl(var(--primary))"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => formatCurrencyCompact(v as number)}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--success))"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.2, strokeWidth: 2 }} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  iconType="circle"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Faturamento"
                  stroke="url(#lineRevenue)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                  animationDuration={1200}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="sales"
                  name="Vendas"
                  stroke="url(#lineSales)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "hsl(var(--success))", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "hsl(var(--success))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.section>
  );
};

interface StatPillProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: "primary" | "success";
}

const StatPill = ({ icon: Icon, label, value, accent }: StatPillProps) => {
  const accentColor = accent === "primary" ? "text-primary" : "text-success";
  const accentBg = accent === "primary" ? "bg-primary/10 border-primary/20" : "bg-success/10 border-success/20";
  return (
    <div className={cn("rounded-xl border p-3 flex items-center gap-3", accentBg)}>
      <div className={cn("p-2 rounded-lg bg-background/50", accentColor)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
          {label}
        </p>
        <p className={cn("text-sm font-bold font-mono truncate", accentColor)}>{value}</p>
      </div>
    </div>
  );
};
