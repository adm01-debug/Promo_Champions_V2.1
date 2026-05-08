import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useDashboardKPIsPeriod, PERIOD_LABELS, type KPIPeriod } from "@/hooks/useDashboardKPIsPeriod";
import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { useSalespeopleList } from "@/hooks/useSalespeopleList";
import { useAuth } from "@/contexts/AuthContext";
import { Gauge, TrendingUp, TrendingDown, Zap, Target, DollarSign, Activity, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SpeedometerSkeleton, ComparativeStripSkeleton } from "./skeletons/SpeedometerSkeletons";

const PERIOD_OPTIONS: { value: KPIPeriod; label: string }[] = [
  { value: "current_month", label: "Mês Atual" },
  { value: "last_month", label: "Último Mês" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Ano" },
];

interface SpeedometerProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  formatValue?: (v: number) => string;
  accent: "primary" | "success" | "warning" | "destructive";
  icon: React.ComponentType<{ className?: string }>;
  delta?: number;
  size?: number;
}

const accentMap = {
  primary: { stroke: "hsl(var(--primary))", glow: "hsl(var(--primary) / 0.5)", text: "text-primary" },
  success: { stroke: "hsl(var(--success))", glow: "hsl(var(--success) / 0.5)", text: "text-success" },
  warning: { stroke: "hsl(var(--warning))", glow: "hsl(var(--warning) / 0.5)", text: "text-warning" },
  destructive: { stroke: "hsl(var(--destructive))", glow: "hsl(var(--destructive) / 0.5)", text: "text-destructive" },
};

const Speedometer = ({ value, max, label, formatValue, accent, icon: Icon, delta, size = 220 }: SpeedometerProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const colors = accentMap[accent];
  const pct = Math.min(1, max > 0 ? value / max : 0);
  const animatedPct = Math.min(1, max > 0 ? animatedValue / max : 0);

  // Arc geometry: 240° arc from -210° to +30°
  const radius = size / 2 - 24;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = -210;
  const endAngle = 30;
  const arcLength = endAngle - startAngle; // 240
  const circumference = 2 * Math.PI * radius;
  const arcRatio = arcLength / 360;
  const dashArc = circumference * arcRatio;
  const dashOffset = dashArc * (1 - animatedPct);

  // Needle angle
  const needleAngle = startAngle + arcLength * animatedPct;

  // Tick marks
  const ticks = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => {
      const tickPct = i / 24;
      const angle = (startAngle + arcLength * tickPct) * (Math.PI / 180);
      const isMajor = i % 6 === 0;
      const inner = radius - (isMajor ? 14 : 8);
      const outer = radius - 2;
      return {
        x1: cx + inner * Math.cos(angle),
        y1: cy + inner * Math.sin(angle),
        x2: cx + outer * Math.cos(angle),
        y2: cy + outer * Math.sin(angle),
        active: tickPct <= animatedPct,
        major: isMajor,
      };
    });
  }, [radius, cx, cy, startAngle, arcLength, animatedPct]);

  useEffect(() => {
    const start = performance.now();
    const duration = 1400;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      // ease out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimatedValue(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const display = formatValue ? formatValue(animatedValue) : Math.round(animatedValue).toLocaleString("pt-BR");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { type: "spring", stiffness: 300, damping: 20 } }}
      className="relative group"
    >
      {/* Pulsing ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl blur-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 60%, ${colors.glow}, transparent 70%)` }}
        animate={{ opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Rotating conic neon ring */}
      <motion.div
        className="absolute -inset-px rounded-2xl opacity-60 pointer-events-none"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, ${colors.stroke} 60deg, transparent 140deg, transparent 220deg, ${colors.stroke} 300deg, transparent 360deg)`,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1px",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />

      {/* Card */}
      <div
        className="relative rounded-2xl border border-border/50 bg-gradient-to-b from-card/95 via-card to-card/80 backdrop-blur-xl p-5 overflow-hidden"
        style={{ boxShadow: `inset 0 0 30px ${colors.glow}, 0 0 0 1px ${colors.glow}` }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${colors.stroke} 1px, transparent 1px), linear-gradient(90deg, ${colors.stroke} 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Scanline sweep */}
        <motion.div
          className="absolute inset-x-0 h-[2px] pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${colors.stroke}, transparent)`, opacity: 0.5 }}
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />

        {/* Corner brackets */}
        {(["top-2 left-2 border-t border-l", "top-2 right-2 border-t border-r", "bottom-2 left-2 border-b border-l", "bottom-2 right-2 border-b border-r"] as const).map((pos, i) => (
          <div
            key={i}
            className={cn("absolute w-3 h-3 pointer-events-none", pos)}
            style={{ borderColor: colors.stroke, opacity: 0.7 }}
          />
        ))}

        {/* Header */}
        <div className="relative flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg bg-background/60 border border-border/40", colors.text)}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </span>
          </div>
          {delta !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border",
                delta >= 0
                  ? "text-success border-success/30 bg-success/10"
                  : "text-destructive border-destructive/30 bg-destructive/10"
              )}
            >
              {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {delta >= 0 ? "+" : ""}
              {delta.toFixed(1)}%
            </div>
          )}
        </div>

        {/* Gauge SVG */}
        <div className="relative flex items-center justify-center" style={{ height: size * 0.75 }}>
          <svg width={size} height={size * 0.85} viewBox={`0 0 ${size} ${size * 0.85}`} className="overflow-visible">
            <defs>
              <linearGradient id={`grad-${accent}-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.3" />
                <stop offset="100%" stopColor={colors.stroke} stopOpacity="1" />
              </linearGradient>
              <filter id={`glow-${accent}-${label}`}>
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Track */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="hsl(var(--border))"
              strokeOpacity="0.3"
              strokeWidth="10"
              strokeDasharray={`${dashArc} ${circumference}`}
              strokeDashoffset="0"
              transform={`rotate(${startAngle} ${cx} ${cy})`}
              strokeLinecap="round"
            />

            {/* Active arc */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={`url(#grad-${accent}-${label})`}
              strokeWidth="10"
              strokeDasharray={`${dashArc} ${circumference}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(${startAngle} ${cx} ${cy})`}
              strokeLinecap="round"
              filter={`url(#glow-${accent}-${label})`}
              style={{ transition: "stroke-dashoffset 0.1s linear" }}
            />

            {/* Tick marks */}
            {ticks.map((t, i) => (
              <line
                key={i}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.active ? colors.stroke : "hsl(var(--border))"}
                strokeOpacity={t.active ? 0.9 : 0.4}
                strokeWidth={t.major ? 2 : 1}
                strokeLinecap="round"
              />
            ))}

            {/* Needle */}
            <g transform={`rotate(${needleAngle} ${cx} ${cy})`} style={{ transition: "transform 0.1s linear" }}>
              <line
                x1={cx}
                y1={cy}
                x2={cx + radius - 6}
                y2={cy}
                stroke={colors.stroke}
                strokeWidth="3"
                strokeLinecap="round"
                filter={`url(#glow-${accent}-${label})`}
              />
              <circle cx={cx + radius - 6} cy={cy} r="4" fill={colors.stroke} filter={`url(#glow-${accent}-${label})`} />
            </g>

            {/* Center hub */}
            <circle cx={cx} cy={cy} r="12" fill="hsl(var(--background))" stroke={colors.stroke} strokeWidth="2" />
            <circle cx={cx} cy={cy} r="4" fill={colors.stroke} />
          </svg>

          {/* Digital readout */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
            <div className={cn("font-mono font-bold text-2xl tabular-nums tracking-tight", colors.text)}>
              {display}
            </div>
            <div className="text-[10px] text-muted-foreground/70 font-mono uppercase tracking-wider mt-0.5">
              max {formatValue ? formatValue(max) : max.toLocaleString("pt-BR")}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PERIOD_STORAGE_KEY = "dashboard.speedometer.period";
const SALESPERSON_STORAGE_KEY = "dashboard.speedometer.salesperson";
const ALL_SALESPEOPLE = "__all__";
const ME = "__me__";

const isValidPeriod = (v: string | null): v is KPIPeriod =>
  v === "current_month" || v === "last_month" || v === "quarter" || v === "year";

export const FuturisticSpeedometerDashboard = () => {
  const { salesperson: currentUser } = useAuth();
  const { data: salespeople = [] } = useSalespeopleList();

  const [period, setPeriodState] = useState<KPIPeriod>(() => {
    if (typeof window === "undefined") return "current_month";
    const saved = window.localStorage.getItem(PERIOD_STORAGE_KEY);
    return isValidPeriod(saved) ? saved : "current_month";
  });

  const [salespersonFilter, setSalespersonFilterState] = useState<string>(() => {
    if (typeof window === "undefined") return ME;
    return window.localStorage.getItem(SALESPERSON_STORAGE_KEY) || ME;
  });

  const setPeriod = (p: KPIPeriod) => {
    setPeriodState(p);
    try {
      window.localStorage.setItem(PERIOD_STORAGE_KEY, p);
    } catch {
      /* ignore quota / privacy errors */
    }
  };

  const setSalespersonFilter = (id: string) => {
    setSalespersonFilterState(id);
    try {
      window.localStorage.setItem(SALESPERSON_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  };

  // Resolve actual id sent to the query
  const resolvedSalespersonId = useMemo(() => {
    if (salespersonFilter === ALL_SALESPEOPLE) return null;
    if (salespersonFilter === ME) return currentUser?.id ?? null;
    return salespersonFilter;
  }, [salespersonFilter, currentUser?.id]);

  const selectedLabel = useMemo(() => {
    if (salespersonFilter === ALL_SALESPEOPLE) return "Toda Equipe";
    if (salespersonFilter === ME) return currentUser?.name ? `Eu (${currentUser.name})` : "Eu";
    return salespeople.find((s) => s.id === salespersonFilter)?.name ?? "Vendedor";
  }, [salespersonFilter, salespeople, currentUser?.name]);

  const { data: kpis, isLoading: kpisLoading, isFetching: kpisFetching } = useDashboardKPIsPeriod(period, resolvedSalespersonId);
  const { data: goals } = useGoalsDashboard();

  const revenue = kpis?.current.totalRevenue ?? 0;
  const sales = kpis?.current.totalSales ?? 0;
  const conversion = kpis?.current.conversionRate ?? 0;
  const ticket = kpis?.current.avgTicket ?? 0;

  const prevRevenue = kpis?.previous.totalRevenue ?? 0;
  const prevSales = kpis?.previous.totalSales ?? 0;
  const prevTicket = kpis?.previous.avgTicket ?? 0;

  const goalAmount = goals?.totalGoal || Math.max(revenue * 1.3, 50000);
  const salesMax = Math.max(sales * 1.5, prevSales * 1.5, 20);
  const ticketMax = Math.max(ticket * 1.5, prevTicket * 1.5, 1000);

  const fmtBRL = (v: number) =>
    `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0, notation: v >= 100000 ? "compact" : "standard" })}`;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      aria-label="Painel futurista de velocímetros de vendas"
      className="relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/40 blur-lg rounded-full animate-pulse" />
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
              <Gauge className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">Performance HUD</h2>
            <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
              Telemetria · {PERIOD_LABELS[period].label} · {selectedLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Salesperson selector */}
          <Select value={salespersonFilter} onValueChange={setSalespersonFilter}>
            <SelectTrigger
              className="h-8 w-[200px] bg-background/60 border-border/40 backdrop-blur text-[11px] font-mono"
              aria-label="Filtrar por vendedor"
            >
              <Users className="h-3.5 w-3.5 mr-1.5 text-primary shrink-0" />
              <SelectValue placeholder="Selecionar vendedor" />
            </SelectTrigger>
            <SelectContent className="bg-popover/95 backdrop-blur-xl">
              <SelectItem value={ME}>
                <span className="font-mono text-xs">Eu{currentUser?.name ? ` (${currentUser.name})` : ""}</span>
              </SelectItem>
              <SelectItem value={ALL_SALESPEOPLE}>
                <span className="font-mono text-xs">Toda Equipe</span>
              </SelectItem>
              {salespeople.map((sp) => (
                <SelectItem key={sp.id} value={sp.id}>
                  <span className="font-mono text-xs">{sp.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-background/60 border border-border/40 backdrop-blur">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-md transition-all",
                  period === opt.value
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/30">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-success font-bold">Live</span>
          </div>
        </div>
      </div>

      {/* Refreshing indicator */}
      {kpisFetching && !kpisLoading && (
        <div className="absolute top-0 right-0 -mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 backdrop-blur z-10">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
            Atualizando
          </span>
        </div>
      )}

      {/* Speedometers grid */}
      {kpisLoading || !kpis ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SpeedometerSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity duration-300",
            kpisFetching && "opacity-60"
          )}
        >
          <Speedometer
            label="Faturamento"
            value={revenue}
            max={goalAmount}
            formatValue={fmtBRL}
            accent="primary"
            icon={DollarSign}
            delta={kpis?.changes.revenue}
          />
          <Speedometer
            label="Vendas"
            value={sales}
            max={salesMax}
            accent="success"
            icon={Zap}
            delta={kpis?.changes.sales}
          />
          <Speedometer
            label="Conversão"
            value={conversion}
            max={100}
            formatValue={(v) => `${v.toFixed(1)}%`}
            accent="warning"
            icon={Target}
            delta={kpis?.changes.conversion}
          />
          <Speedometer
            label="Ticket Médio"
            value={ticket}
            max={ticketMax}
            formatValue={fmtBRL}
            accent="destructive"
            icon={Activity}
            delta={kpis?.changes.avgTicket}
          />
        </div>
      )}

      {/* Comparative strip */}
      {kpisLoading || !kpis ? (
        <ComparativeStripSkeleton className="mt-5" />
      ) : (
        <div
          className={cn(
            "mt-5 rounded-xl border border-border/50 bg-gradient-to-r from-card/80 via-card to-card/80 backdrop-blur-xl p-4 transition-opacity duration-300",
            kpisFetching && "opacity-60"
          )}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Comparativo vs {PERIOD_LABELS[period].comparison}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Faturamento", curr: fmtBRL(revenue), prev: fmtBRL(prevRevenue), delta: kpis?.changes.revenue ?? 0 },
              { label: "Vendas", curr: String(sales), prev: String(prevSales), delta: kpis?.changes.sales ?? 0 },
              { label: "Conversão", curr: `${conversion.toFixed(1)}%`, prev: `${(kpis?.previous.conversionRate ?? 0).toFixed(1)}%`, delta: kpis?.changes.conversion ?? 0 },
              { label: "Ticket", curr: fmtBRL(ticket), prev: fmtBRL(prevTicket), delta: kpis?.changes.avgTicket ?? 0 },
            ].map((row) => (
              <div key={row.label} className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{row.label}</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-bold text-sm tabular-nums">{row.curr}</span>
                  <span className="text-[10px] text-muted-foreground/70 font-mono">← {row.prev}</span>
                </div>
                <div
                  className={cn(
                    "text-[10px] font-mono font-bold flex items-center gap-1",
                    row.delta >= 0 ? "text-success" : "text-destructive"
                  )}
                >
                  {row.delta >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  {row.delta >= 0 ? "+" : ""}
                  {row.delta.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default FuturisticSpeedometerDashboard;
