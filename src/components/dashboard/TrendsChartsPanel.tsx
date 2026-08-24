import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, DollarSign, ShoppingBag, Target, LineChart, Activity } from "lucide-react";
import { useTrendsData } from "@/hooks/useTrendsData";
import { cn } from "@/lib/utils";

type MetricKey = "revenue" | "sales" | "conversion";

const METRIC_CONFIG: Record<
  MetricKey,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    glow: string;
    accentClass: string;
    format: (v: number) => string;
  }
> = {
  revenue: {
    label: "Faturamento",
    icon: DollarSign,
    color: "hsl(var(--primary))",
    glow: "rgba(14, 165, 233, 0.4)",
    accentClass: "text-primary",
    format: (v) =>
      `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0, notation: v >= 100000 ? "compact" : "standard" })}`,
  },
  sales: {
    label: "Vendas",
    icon: ShoppingBag,
    color: "hsl(var(--success))",
    glow: "rgba(34, 197, 94, 0.4)",
    accentClass: "text-success",
    format: (v) => v.toLocaleString("pt-BR"),
  },
  conversion: {
    label: "Conversão",
    icon: Target,
    color: "hsl(var(--warning))",
    glow: "rgba(234, 179, 8, 0.4)",
    accentClass: "text-warning",
    format: (v) => `${v.toFixed(1)}%`,
  },
};

const WEEK_OPTIONS = [
  { value: 4, label: "4 sem" },
  { value: 8, label: "8 sem" },
  { value: 12, label: "12 sem" },
] as const;

const CustomTooltip = ({
  active,
  payload,
  metric,
}: {
  active?: boolean;
  payload?: Array<{ payload: { weekFull: string; [k: string]: unknown } }>;
  metric: MetricKey;
}) => {
  if (!active || !payload?.length) return null;
  const cfg = METRIC_CONFIG[metric];
  const data = payload[0].payload;
  const value = Number(data[metric] ?? 0);
  return (
    <div className="rounded-lg border border-white/10 bg-black/80 backdrop-blur-xl px-4 py-3 shadow-2xl border-l-4" style={{ borderLeftColor: cfg.color }}>
      <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
        {data.weekFull}
      </div>
      <div className={cn("font-mono font-black text-lg tabular-nums tracking-tighter", cfg.accentClass)} style={{ textShadow: `0 0 10px ${cfg.glow}` }}>
        {cfg.format(value)}
      </div>
    </div>
  );
};

export const TrendsChartsPanel = () => {
  const [weeks, setWeeks] = useState<number>(8);
  const [metric, setMetric] = useState<MetricKey>("revenue");
  const { data: points = [], isLoading } = useTrendsData(weeks);

  const cfg = METRIC_CONFIG[metric];
  const Icon = cfg.icon;

  const stats = useMemo(() => {
    if (!points.length) return { current: 0, previous: 0, delta: 0, peak: 0 };
    const current = Number(points[points.length - 1][metric] ?? 0);
    const previous = points.length > 1 ? Number(points[points.length - 2][metric] ?? 0) : 0;
    const peak = Math.max(...points.map((p) => Number(p[metric] ?? 0)));
    const delta = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
    return { current, previous, delta, peak };
  }, [points, metric]);

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative group"
    >
      {/* Header with neon glow */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-primary/30 blur-xl rounded-full"
            />
            <div className="relative p-2.5 rounded-xl bg-black/40 border border-primary/40 shadow-[inset_0_0_15px_rgba(14,165,233,0.1)]">
              <LineChart className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-mono font-black uppercase tracking-tighter text-primary group-hover:text-primary transition-colors">
              Trend Telemetry
            </h2>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary/60 animate-pulse" />
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
                Weekly Analysis · <span className="text-foreground/70">{weeks} Weeks</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Metric Selector - Cyber Style */}
          <div className="flex p-1 rounded-lg bg-black/40 border border-white/5 backdrop-blur-md">
            {(Object.keys(METRIC_CONFIG) as MetricKey[]).map((key) => {
              const m = METRIC_CONFIG[key];
              const MIcon = m.icon;
              const active = metric === key;
              return (
                <button
                  key={key}
                  onClick={() => setMetric(key)}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md transition-all",
                    active
                      ? cn("text-foreground", m.accentClass)
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <MIcon className="h-3.5 w-3.5" />
                  {m.label}
                  {active && (
                    <motion.div
                      layoutId="activeMetric"
                      className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-md shadow-inner"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Weeks Selector */}
          <div className="flex p-1 rounded-lg bg-black/40 border border-white/5 backdrop-blur-md">
            {WEEK_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setWeeks(opt.value)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md transition-all",
                  weeks === opt.value
                    ? "text-primary bg-primary/10 border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Panel Card */}
      <div className="relative rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl p-6 overflow-hidden shadow-2xl">
        {/* Dynamic ambient glow based on selected metric */}
        <AnimatePresence mode="wait">
          <motion.div
            key={metric}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="absolute -top-[20%] -right-[10%] w-[50%] h-[60%] blur-[120px] rounded-full pointer-events-none"
            style={{ backgroundColor: cfg.color }}
          />
        </AnimatePresence>

        {/* Futuristic grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Scanline Sweep */}
        <motion.div
          className="absolute inset-x-0 h-[2px] pointer-events-none opacity-[0.15] z-10"
          style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }}
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        {/* Stats strip - Cyber Module Style */}
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatPill label="Current Level" value={cfg.format(stats.current)} accent={cfg.accentClass} icon={Icon} color={cfg.color} />
          <StatPill label="Previous Base" value={cfg.format(stats.previous)} accent="text-foreground/70" />
          <StatPill
            label="Delta Variance"
            value={`${stats.delta >= 0 ? "+" : ""}${stats.delta.toFixed(1)}%`}
            accent={stats.delta >= 0 ? "text-success" : "text-destructive"}
            icon={TrendingUp}
            color={stats.delta >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"}
          />
          <StatPill label="Peak Potential" value={cfg.format(stats.peak)} accent={cfg.accentClass} color={cfg.color} />
        </div>

        {/* Chart Container */}
        <div className="relative h-[300px] rounded-xl bg-black/30 border border-white/5 p-4 shadow-inner">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="relative flex flex-col items-center gap-4">
                <Activity className="h-10 w-10 text-primary animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary/60 animate-pulse">Initializing Telemetry</span>
              </div>
            </div>
          ) : points.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm font-mono uppercase tracking-widest text-muted-foreground/50">
              No Data Records Found
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-trend-${metric}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cfg.color} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={cfg.color} stopOpacity={0} />
                  </linearGradient>
                  <filter id="areaGlow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    metric === "revenue"
                      ? `${Math.round(Number(v) / 1000)}k`
                      : metric === "conversion"
                      ? `${v}%`
                      : String(v)
                  }
                  width={50}
                />
                <Tooltip content={<CustomTooltip metric={metric} />} cursor={{ stroke: cfg.color, strokeOpacity: 0.3, strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke={cfg.color}
                  strokeWidth={4}
                  fill={`url(#grad-trend-${metric})`}
                  dot={{ fill: cfg.color, r: 4, strokeWidth: 2, stroke: "black" }}
                  activeDot={{ r: 8, fill: cfg.color, stroke: "white", strokeWidth: 2, filter: "url(#areaGlow)" }}
                  isAnimationActive
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.section>
  );
};

const StatPill = ({
  label,
  value,
  accent,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  accent: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}) => (
  <div className="group relative rounded-xl bg-black/40 border border-white/5 p-4 transition-all hover:bg-white/[0.02]">
    <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 flex items-center gap-2 group-hover:text-muted-foreground transition-colors">
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </div>
    <div className={cn("font-mono font-black text-lg tracking-tighter tabular-nums truncate", accent)} style={{ textShadow: color ? `0 0 10px ${color}33` : "none" }}>
      {value}
    </div>
    
    {/* Micro Decoration Brackets */}
    <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-white/10 group-hover:border-white/30 transition-colors" />
    <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-white/10 group-hover:border-white/30 transition-colors" />
  </div>
);

export default TrendsChartsPanel;