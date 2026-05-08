import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, DollarSign, ShoppingBag, Target, LineChart } from "lucide-react";
import { useTrendsData } from "@/hooks/useTrendsData";
import { cn } from "@/lib/utils";

type MetricKey = "revenue" | "sales" | "conversion";

const METRIC_CONFIG: Record<
  MetricKey,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    accentClass: string;
    format: (v: number) => string;
  }
> = {
  revenue: {
    label: "Faturamento",
    icon: DollarSign,
    color: "hsl(var(--primary))",
    accentClass: "text-primary",
    format: (v) =>
      `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0, notation: v >= 100000 ? "compact" : "standard" })}`,
  },
  sales: {
    label: "Vendas",
    icon: ShoppingBag,
    color: "hsl(var(--success))",
    accentClass: "text-success",
    format: (v) => v.toLocaleString("pt-BR"),
  },
  conversion: {
    label: "Conversão",
    icon: Target,
    color: "hsl(var(--warning))",
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
    <div className="rounded-lg border border-border/60 bg-background/95 backdrop-blur-xl px-3 py-2 shadow-lg">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-0.5">
        {data.weekFull}
      </div>
      <div className={cn("font-mono font-bold text-sm tabular-nums", cfg.accentClass)}>
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-label="Gráficos de tendência semanal"
      className="relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/40 blur-lg rounded-full animate-pulse" />
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
              <LineChart className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">Tendências</h2>
            <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
              Últimas {weeks} semanas · evolução semanal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric switch */}
          <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-background/60 border border-border/40 backdrop-blur">
            {(Object.keys(METRIC_CONFIG) as MetricKey[]).map((key) => {
              const m = METRIC_CONFIG[key];
              const MIcon = m.icon;
              const active = metric === key;
              return (
                <button
                  key={key}
                  onClick={() => setMetric(key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-md transition-all",
                    active
                      ? cn("bg-background border border-border/60", m.accentClass)
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <MIcon className="h-3 w-3" />
                  {m.label}
                </button>
              );
            })}
          </div>
          {/* Weeks switch */}
          <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-background/60 border border-border/40 backdrop-blur">
            {WEEK_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setWeeks(opt.value)}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-md transition-all",
                  weeks === opt.value
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="relative rounded-2xl border border-border/50 bg-gradient-to-b from-card/95 via-card to-card/80 backdrop-blur-xl p-5 overflow-hidden">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Stats strip */}
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <StatPill label="Atual" value={cfg.format(stats.current)} accent={cfg.accentClass} icon={Icon} />
          <StatPill label="Anterior" value={cfg.format(stats.previous)} accent="text-foreground" />
          <StatPill
            label="Variação"
            value={`${stats.delta >= 0 ? "+" : ""}${stats.delta.toFixed(1)}%`}
            accent={stats.delta >= 0 ? "text-success" : "text-destructive"}
            icon={TrendingUp}
          />
          <StatPill label="Pico" value={cfg.format(stats.peak)} accent={cfg.accentClass} />
        </div>

        {/* Chart */}
        <div className="relative h-[280px]">
          {isLoading ? (
            <div className="h-full rounded-xl bg-muted/20 animate-pulse" />
          ) : points.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Sem dados para exibir.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-trend-${metric}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cfg.color} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={cfg.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.2} vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    metric === "revenue"
                      ? `${Math.round(Number(v) / 1000)}k`
                      : metric === "conversion"
                      ? `${v}%`
                      : String(v)
                  }
                  width={45}
                />
                <Tooltip content={<CustomTooltip metric={metric} />} cursor={{ stroke: cfg.color, strokeOpacity: 0.3, strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke={cfg.color}
                  strokeWidth={2.5}
                  fill={`url(#grad-trend-${metric})`}
                  dot={{ fill: cfg.color, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: cfg.color, stroke: "hsl(var(--background))", strokeWidth: 2 }}
                  isAnimationActive
                  animationDuration={900}
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
}: {
  label: string;
  value: string;
  accent: string;
  icon?: React.ComponentType<{ className?: string }>;
}) => (
  <div className="rounded-lg bg-background/50 border border-border/40 p-2.5">
    <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
      {Icon && <Icon className="h-2.5 w-2.5" />}
      {label}
    </div>
    <div className={cn("font-mono font-bold text-sm tabular-nums truncate", accent)}>{value}</div>
  </div>
);

export default TrendsChartsPanel;
