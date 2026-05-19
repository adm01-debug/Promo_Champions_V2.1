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
import { Activity, DollarSign, ShoppingBag, TrendingUp, TrendingDown } from "lucide-react";
import { usePeriodTrend } from "@/hooks/usePeriodTrend";
import { TrendChartSkeleton } from "./skeletons/SpeedometerSkeletons";
import { PERIOD_LABELS, type KPIPeriod } from "@/hooks/dashboard/useDashboardKPIsPeriod";
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
    <div className="rounded-lg border border-white/10 bg-black/80 backdrop-blur-xl px-4 py-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] border-l-4 border-l-primary">
      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-2">
        {point.fullLabel}
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2 text-xs">
            <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
            <span className="text-muted-foreground font-mono uppercase tracking-tighter">Revenue</span>
          </div>
          <span className="font-mono font-bold text-primary tabular-nums">
            R$ {Number(point.revenue).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2 text-xs">
            <div className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_hsl(var(--success))]" />
            <span className="text-muted-foreground font-mono uppercase tracking-tighter">Volume</span>
          </div>
          <span className="font-mono font-bold text-success tabular-nums">{point.sales}</span>
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

  const { data, isLoading, isFetching } = usePeriodTrend(period);

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
      className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl"
    >
      {/* Deep ambient glow */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[40%] bg-success/5 blur-[80px] rounded-full" />
      </div>

      {/* Futuristic grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px), 
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px, 40px 40px, 10px 10px, 10px 10px",
        }}
      />

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-primary/40 blur-md rounded-xl"
              />
              <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/40 shadow-inner">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tighter font-mono uppercase text-primary">
                Period Trend Analysis
              </h2>
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary/60 animate-pulse" />
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  Temporal Telemetry · <span className="text-foreground/80">{PERIOD_LABELS[period].label}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Period selector */}
          <div className="flex gap-1 p-1 rounded-lg bg-black/40 border border-white/5 backdrop-blur-md">
            {VALID.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPeriod(p);
                  try {
                    window.localStorage.setItem(PERIOD_STORAGE_KEY, p);
                  } catch { /* ignore */ }
                }}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md transition-all relative overflow-hidden",
                  period === p
                    ? "text-primary border border-primary/40 bg-primary/10 shadow-[0_0_15px_rgba(14,165,233,0.1)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {PERIOD_LABELS[p].label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatPill
            icon={DollarSign}
            label="Gross Revenue"
            value={formatCurrencyCompact(totals.revenue)}
            accent="primary"
          />
          <StatPill
            icon={ShoppingBag}
            label="Sales Volume"
            value={String(totals.sales)}
            accent="success"
          />
          <StatPill
            icon={TrendingUp}
            label="Peak Revenue"
            value={formatCurrencyCompact(totals.peakRevenue)}
            accent="primary"
          />
          <StatPill
            icon={TrendingUp}
            label="Peak Volume"
            value={String(totals.peakSales)}
            accent="success"
          />
        </div>

        {/* Chart Area */}
        <div className="relative h-[340px] rounded-xl bg-black/40 border border-white/5 p-4 group">
          {/* Scanline Sweep */}
          <motion.div
            className="absolute inset-x-0 h-[20%] pointer-events-none z-10 opacity-[0.05]"
            style={{ background: "linear-gradient(to bottom, transparent, hsl(var(--primary)), transparent)" }}
            animate={{ top: ["-20%", "120%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          {isFetching && !isLoading && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/40 backdrop-blur-md">
              <div className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-primary">
                Syncing Data
              </span>
            </div>
          )}

          {isLoading ? (
            <TrendChartSkeleton />
          ) : chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-2 opacity-50">
              <Activity className="h-8 w-8 text-muted-foreground animate-pulse" />
              <p className="font-mono text-[10px] uppercase tracking-widest">No telemetry available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  stroke="hsl(var(--primary))"
                  tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 600 }}
                  tickFormatter={(v) => formatCurrencyCompact(v as number)}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--success))"
                  tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.3, strokeWidth: 1, strokeDasharray: "5 5" }} 
                />
                <Legend
                  wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-mono)", paddingTop: 20, textTransform: "uppercase", letterSpacing: "0.1em" }}
                  iconType="rect"
                  iconSize={10}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "black" }}
                  activeDot={{ r: 7, fill: "hsl(var(--primary))", stroke: "white", strokeWidth: 2 }}
                  animationDuration={1500}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="sales"
                  name="Volume"
                  stroke="hsl(var(--success))"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "hsl(var(--success))", strokeWidth: 2, stroke: "black" }}
                  activeDot={{ r: 7, fill: "hsl(var(--success))", stroke: "white", strokeWidth: 2 }}
                  animationDuration={1500}
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
  const accentBorder = accent === "primary" ? "border-primary/20" : "border-success/20";
  const accentBg = accent === "primary" ? "bg-primary/5" : "bg-success/5";

  return (
    <div className={cn(
      "relative group overflow-hidden rounded-xl border p-4 flex items-center gap-4 transition-all hover:bg-white/[0.02]",
      accentBorder,
      accentBg
    )}>
      <div className={cn(
        "relative p-2 rounded-lg bg-background/40 border border-white/5",
        accentColor
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
          {label}
        </p>
        <p className={cn("text-base font-bold font-mono tracking-tighter tabular-nums", accentColor)}>{value}</p>
      </div>
      
      {/* Mini scanline decoration */}
      <motion.div 
        className="absolute bottom-0 left-0 h-[1px] bg-current opacity-20"
        animate={{ width: ["0%", "100%", "0%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ color: accent === "primary" ? "hsl(var(--primary))" : "hsl(var(--success))" }}
      />
    </div>
  );
};