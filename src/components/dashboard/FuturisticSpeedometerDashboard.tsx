import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardKPIsPeriod, PERIOD_LABELS, type KPIPeriod } from "@/hooks/useDashboardKPIsPeriod";
import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { useSalespeopleList } from "@/hooks/useSalespeopleList";
import { useAuth } from "@/contexts/AuthContext";
import { Gauge, TrendingUp, TrendingDown, Zap, Target, DollarSign, Activity, Users, Settings2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { SpeedometerSkeleton, ComparativeStripSkeleton } from "./skeletons/SpeedometerSkeletons";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

const PERIOD_OPTIONS: { value: KPIPeriod; label: string }[] = [
  { value: "current_month", label: "Mês Atual" },
  { value: "last_month", label: "Último Mês" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Ano" },
];

interface SpeedometerProps {
  value: number;
  min?: number;
  max: number;
  label: string;
  unit?: string;
  formatValue?: (v: number) => string;
  accent: "primary" | "success" | "warning" | "destructive";
  icon: React.ComponentType<{ className?: string }>;
  delta?: number;
  size?: number;
  ticksCount?: number;
}

const accentMap = {
  primary: { stroke: "hsl(var(--primary))", glow: "hsl(var(--primary) / 0.5)", text: "text-primary" },
  success: { stroke: "hsl(var(--success))", glow: "hsl(var(--success) / 0.5)", text: "text-success" },
  warning: { stroke: "hsl(var(--warning))", glow: "hsl(var(--warning) / 0.5)", text: "text-warning" },
  destructive: { stroke: "hsl(var(--destructive))", glow: "hsl(var(--destructive) / 0.5)", text: "text-destructive" },
};

const Speedometer = ({ value, max, label, unit, formatValue, accent, icon: Icon, delta, size = 280, ticksCount = 33 }: SpeedometerProps) => {
  const { theme } = useDashboardTheme();
  const [animatedValue, setAnimatedValue] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSize, setCurrentSize] = useState(size);
  
  const colors = accentMap[accent];
  const animatedPct = Math.min(1, max > 0 ? animatedValue / max : 0);

  // Auto-resize logic
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          setCurrentSize(Math.min(width, size));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [size]);

  const s = currentSize;
  const cx = s / 2;
  const cy = s / 2;
  const outerRadius = s / 2 - 8;
  const arcRadius = s / 2 - 28;
  const innerRadius = s / 2 - 50;
  const startAngle = -225;
  const endAngle = 45;
  const arcLength = endAngle - startAngle; // 270
  const circumference = 2 * Math.PI * arcRadius;
  const arcRatio = arcLength / 360;
  const dashArc = circumference * arcRatio;
  const dashOffset = dashArc * (1 - animatedPct);

  // Needle angle (vertical up = -90°)
  const needleAngle = startAngle + arcLength * animatedPct;

  // Tick marks
  const ticks = useMemo(() => {
    return Array.from({ length: ticksCount }).map((_, i) => {
      const tickPct = i / (ticksCount - 1);
      const angle = (startAngle + arcLength * tickPct) * (Math.PI / 180);
      const isMajor = i % (ticksCount > 20 ? 4 : 2) === 0;
      const inner = arcRadius - (isMajor ? 18 * (s / 280) : 10 * (s / 280));
      const outer = arcRadius - 4 * (s / 280);
      const labelRadius = arcRadius - 30 * (s / 280);
      return {
        x1: cx + inner * Math.cos(angle),
        y1: cy + inner * Math.sin(angle),
        x2: cx + outer * Math.cos(angle),
        y2: cy + outer * Math.sin(angle),
        labelX: cx + labelRadius * Math.cos(angle),
        labelY: cy + labelRadius * Math.sin(angle),
        active: tickPct <= animatedPct,
        major: isMajor,
        labelValue: Math.round(max * tickPct),
      };
    });
  }, [arcRadius, cx, cy, startAngle, arcLength, animatedPct, max, ticksCount, s]);

  useEffect(() => {
    const startValue = animatedValue;
    const endValue = value;
    const start = performance.now();
    const duration = 1200; // Slightly faster for responsiveness
    let raf = 0;
    
    const tick = (t: number) => {
      const elapsed = t - start;
      const p = Math.min(1, elapsed / duration);
      // Smoother elastic-like easing
      const eased = 1 - Math.pow(1 - p, 4);
      setAnimatedValue(startValue + (endValue - startValue) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const display = formatValue ? formatValue(animatedValue) : Math.round(animatedValue).toLocaleString("pt-BR");
  const percentStr = `${Math.round(animatedPct * 100)}%`;


  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.03, transition: { type: "spring", stiffness: 300, damping: 20 } }}
      className="relative group flex flex-col items-center w-full max-w-full"
    >
      {/* Header above the gauge */}
      <div className="relative flex items-center justify-between w-full mb-3 px-2">
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

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* Circular gauge container */}
            <div className="relative cursor-help" style={{ width: s, height: s }}>
              {/* Pulsing ambient glow */}
              {theme === "cyber" && (
                <motion.div
                  className="absolute inset-0 rounded-full blur-3xl pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${colors.glow}, transparent 65%)` }}
                  animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* Rotating outer neon ring */}
              {theme === "cyber" && (
                <motion.div
                  className="absolute inset-0 rounded-full opacity-70 pointer-events-none"
                  style={{
                    background: `conic-gradient(from 0deg, transparent 0deg, ${colors.stroke} 50deg, transparent 130deg, transparent 230deg, ${colors.stroke} 310deg, transparent 360deg)`,
                    WebkitMask: "radial-gradient(circle, transparent 47%, #000 49%, #000 50%, transparent 51%)",
                    mask: "radial-gradient(circle, transparent 47%, #000 49%, #000 50%, transparent 51%)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                />
              )}

              {/* Counter-rotating inner ring */}
              {theme === "cyber" && (
                <motion.div
                  className="absolute rounded-full opacity-40 pointer-events-none"
                  style={{
                    inset: "10%",
                    background: `conic-gradient(from 180deg, transparent 0deg, ${colors.stroke} 80deg, transparent 180deg, transparent 270deg, ${colors.stroke} 350deg, transparent 360deg)`,
                    WebkitMask: "radial-gradient(circle, transparent 78%, #000 80%, #000 81%, transparent 82%)",
                    mask: "radial-gradient(circle, transparent 78%, #000 80%, #000 81%, transparent 82%)",
                  }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                />
              )}

              {/* Main circular card */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full transition-all duration-300 overflow-hidden border",
                  theme === "cyber"
                    ? "bg-gradient-radial from-card/60 via-background/95 to-background/100 backdrop-blur-xl border-border/40"
                    : "bg-card border-border shadow-lg"
                )}
                style={
                  theme === "cyber"
                    ? {
                        background: `radial-gradient(circle at 50% 50%, ${colors.glow.replace(/[\d.]+\)$/, "0.08)")}, hsl(var(--background)) 70%)`,
                        boxShadow: `inset 0 0 60px ${colors.glow}, 0 0 30px ${colors.glow}, 0 0 0 1px ${colors.glow}`,
                      }
                    : {}
                }
              />

              {/* Gauge SVG */}
              <svg
                width={s}
                height={s}
                viewBox={`0 0 ${s} ${s}`}
                className="absolute inset-0"
              >
                <defs>
                  <linearGradient id={`grad-${accent}-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.4" />
                    <stop offset="50%" stopColor={colors.stroke} stopOpacity="1" />
                    <stop offset="100%" stopColor={colors.stroke} stopOpacity="0.7" />
                  </linearGradient>
                  <filter id={`glow-${accent}-${label}`}>
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <radialGradient id={`hub-${accent}-${label}`}>
                    <stop offset="0%" stopColor={colors.stroke} stopOpacity="1" />
                    <stop offset="60%" stopColor={colors.stroke} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={colors.stroke} stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Outer decorative ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={outerRadius}
                  fill="none"
                  stroke={colors.stroke}
                  strokeOpacity="0.25"
                  strokeWidth="1"
                />

                {/* Track arc */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={arcRadius}
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeOpacity="0.25"
                  strokeWidth="6"
                  strokeDasharray={`${dashArc} ${circumference}`}
                  transform={`rotate(${startAngle} ${cx} ${cy})`}
                  strokeLinecap="round"
                />

                {/* Active arc */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={arcRadius}
                  fill="none"
                  stroke={`url(#grad-${accent}-${label})`}
                  strokeWidth="6"
                  strokeDasharray={`${dashArc} ${circumference}`}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(${startAngle} ${cx} ${cy})`}
                  strokeLinecap="round"
                  filter={`url(#glow-${accent}-${label})`}
                  style={{ transition: "stroke-dashoffset 0.1s linear" }}
                />

                {/* Tick marks with labels */}
                {ticks.map((t, i) => (
                  <g key={i}>
                    <line
                      x1={t.x1}
                      y1={t.y1}
                      x2={t.x2}
                      y2={t.y2}
                      stroke={t.active ? colors.stroke : "hsl(var(--muted-foreground))"}
                      strokeOpacity={t.active ? 0.9 : 0.35}
                      strokeWidth={t.major ? 2 : 1}
                      strokeLinecap="round"
                    />
                    {t.major && (
                      <text
                        x={t.labelX}
                        y={t.labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={9 * (s / 280)}
                        fontFamily="var(--font-mono)"
                        fill={t.active ? colors.stroke : "hsl(var(--muted-foreground))"}
                        fillOpacity={t.active ? 0.95 : 0.45}
                        className="font-bold"
                      >
                        {t.labelValue >= 1000 ? `${Math.round(t.labelValue / 1000)}k` : t.labelValue}
                      </text>
                    )}
                  </g>
                ))}

                {/* Inner decorative ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={innerRadius}
                  fill="none"
                  stroke={colors.stroke}
                  strokeOpacity="0.3"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />

                {/* Inner solid ring (around digital readout) */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={innerRadius - 12}
                  fill="hsl(var(--background))"
                  fillOpacity="0.6"
                  stroke={colors.stroke}
                  strokeOpacity="0.4"
                  strokeWidth="1.5"
                />

                {/* Needle */}
                <g
                  transform={`rotate(${needleAngle} ${cx} ${cy})`}
                  style={{ transition: "transform 0.1s linear" }}
                >
                  <line
                    x1={cx}
                    y1={cy}
                    x2={cx + arcRadius - 4}
                    y2={cy}
                    stroke={colors.stroke}
                    strokeWidth="3"
                    strokeLinecap="round"
                    filter={`url(#glow-${accent}-${label})`}
                    opacity="0.95"
                  />
                  {/* Needle tip glow */}
                  <circle
                    cx={cx + arcRadius - 4}
                    cy={cy}
                    r="5"
                    fill={colors.stroke}
                    filter={`url(#glow-${accent}-${label})`}
                  >
                    <animate attributeName="r" values="4;7;4" dur="1.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                </g>

                {/* Center hub */}
                <circle cx={cx} cy={cy} r="20" fill={`url(#hub-${accent}-${label})`} />
                <circle
                  cx={cx}
                  cy={cy}
                  r="10"
                  fill="hsl(var(--background))"
                  stroke={colors.stroke}
                  strokeWidth="2"
                  filter={`url(#glow-${accent}-${label})`}
                />
                <circle cx={cx} cy={cy} r="3" fill={colors.stroke}>
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
              </svg>

              {/* Digital readout - centered */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={display}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className={cn("font-mono font-black tabular-nums tracking-tight leading-none", colors.text)}
                    style={{
                      fontSize: s * 0.13,
                      textShadow: `0 0 12px ${colors.glow}, 0 0 24px ${colors.glow}`,
                    }}
                  >
                    {display}
                  </motion.div>
                </AnimatePresence>
                <div 
                  className="text-muted-foreground/70 font-mono uppercase tracking-[0.2em] mt-1"
                  style={{ fontSize: Math.max(7, s * 0.035) }}
                >
                  max {formatValue ? formatValue(max) : max.toLocaleString("pt-BR")}
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-popover/95 backdrop-blur-xl border-primary/20 p-3 shadow-2xl">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Status</span>
                <span className={cn("text-xs font-mono font-bold", colors.text)}>{label}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Telemetria</span>
                <span className="text-xs font-mono font-bold text-foreground">
                  {formatValue ? formatValue(value) : value.toLocaleString("pt-BR")} {unit}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Eficiência</span>
                <span className="text-xs font-mono font-bold text-foreground">{percentStr}</span>
              </div>
              <div className="w-full h-1 bg-muted/30 rounded-full mt-1 overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: percentStr }}
                  style={{ backgroundColor: colors.stroke }}
                />
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
  const { theme } = useDashboardTheme();
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

  const [ticksCount, setTicksCount] = useState(33);
  const [gaugeMode, setGaugeMode] = useState<"standard" | "compact" | "kilo">("standard");

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

  const fmtBRL = (v: number) => {
    if (gaugeMode === "compact") return `R$ ${v.toLocaleString("pt-BR", { notation: "compact" })}`;
    if (gaugeMode === "kilo") return `R$ ${(v / 1000).toFixed(1)}k`;
    return `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0, notation: v >= 1000000 ? "compact" : "standard" })}`;
  };


  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      aria-label="Painel futurista de velocímetros de vendas"
      className={cn("relative p-6 rounded-3xl transition-all duration-500", theme === "cyber" ? "border border-white/5 bg-black/20 backdrop-blur-sm" : "bg-card shadow-sm border border-border/40")}
    >
      {/* Decorative HUD Elements - Cyber Only */}
      {theme === "cyber" && (
        <>
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-xl pointer-events-none" />
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-primary/40 rounded-tr-xl pointer-events-none" />
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-primary/40 rounded-bl-xl pointer-events-none" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-primary/40 rounded-br-xl pointer-events-none" />
          
          {/* Status Tags */}
          <div className="absolute -top-3 left-10 flex items-center gap-4 pointer-events-none">
            <div className="px-2 py-0.5 rounded bg-black border border-primary/30 text-[8px] font-mono font-bold text-primary tracking-[0.2em] uppercase shadow-[0_0_10px_rgba(14,165,233,0.2)]">
              System: Online
            </div>
            <div className="px-2 py-0.5 rounded bg-black border border-success/30 text-[8px] font-mono font-bold text-success tracking-[0.2em] uppercase">
              Signal: Stable
            </div>
          </div>

          <div className="absolute -bottom-3 right-10 flex items-center gap-3 pointer-events-none opacity-40">
            <div className="text-[7px] font-mono text-muted-foreground uppercase tracking-widest">
              Telemetry Version 4.0.8 // CRC: OK
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/40 blur-lg rounded-full animate-pulse" />
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
              <Gauge className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <h2
              className="font-display text-lg font-bold tracking-tight text-primary"
              style={{ textShadow: "0 0 10px hsl(var(--primary) / 0.6), 0 0 22px hsl(var(--primary) / 0.35)" }}
            >
              Performance HUD
            </h2>
            <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
              Telemetria · {PERIOD_LABELS[period].label} · {selectedLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-background/60 border border-border/40 hover:bg-background/80 transition-colors">
                <Settings2 className="h-3.5 w-3.5 text-primary" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-popover/95 backdrop-blur-xl border-primary/20">
              <div className="space-y-4">
                <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">HUD Configuration</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono uppercase text-muted-foreground">
                    <span>Ticks Density</span>
                    <span className="text-primary">{ticksCount}</span>
                  </div>
                  <Slider 
                    value={[ticksCount]} 
                    min={5} 
                    max={65} 
                    step={4} 
                    onValueChange={(val) => setTicksCount(val[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1.5">Format Display</div>
                  <div className="grid grid-cols-3 gap-1">
                    {(["standard", "compact", "kilo"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setGaugeMode(m)}
                        className={cn(
                          "px-1 py-1 text-[8px] font-mono uppercase rounded border transition-all",
                          gaugeMode === m 
                            ? "bg-primary/20 border-primary text-primary" 
                            : "bg-background/40 border-border/40 text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Salesperson selector */}
          <Select value={salespersonFilter} onValueChange={setSalespersonFilter}>
            <SelectTrigger
              className="h-8 w-[180px] bg-background/60 border-border/40 backdrop-blur text-[11px] font-mono"
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-6 relative overflow-hidden rounded-xl transition-all duration-500 p-5 transition-opacity duration-300",
            kpisFetching && "opacity-60",
            theme === "cyber" ? "border border-border/40 bg-card/40 backdrop-blur-xl" : "bg-card border border-border shadow-sm"
          )}
        >
          {/* Subtle animated scanline for the strip - Cyber Only */}
          {theme === "cyber" && (
            <motion.div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: "linear-gradient(transparent 50%, rgba(255,255,255,0.1) 50%)",
                backgroundSize: "100% 4px",
              }}
              animate={{ backgroundPositionY: ["0px", "20px"] }}
              transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
            />
          )}

          <div className="relative flex items-center gap-4 mb-4">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-primary/50" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-primary/80">
              Comparative Telemetry · {PERIOD_LABELS[period].comparison}
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/50 via-border/20 to-transparent" />
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Faturamento", curr: revenue, prev: prevRevenue, fmt: fmtBRL, color: "hsl(var(--primary))", glow: "rgba(14, 165, 233, 0.2)" },
              { label: "Vendas", curr: sales, prev: prevSales, fmt: (v: number) => String(v), color: "hsl(var(--success))", glow: "rgba(34, 197, 94, 0.2)" },
              { label: "Conversão", curr: conversion, prev: (kpis?.previous.conversionRate ?? 0), fmt: (v: number) => `${v.toFixed(1)}%`, color: "hsl(var(--warning))", glow: "rgba(234, 179, 8, 0.2)" },
              { label: "Ticket Médio", curr: ticket, prev: prevTicket, fmt: fmtBRL, color: "hsl(var(--destructive))", glow: "rgba(239, 68, 68, 0.2)" },
            ].map((row, idx) => {
              const delta = row.prev > 0 ? ((row.curr - row.prev) / row.prev) * 100 : 100;
              const isPositive = delta >= 0;
              
              return (
                <div key={row.label} className="group relative">
                  <div className="flex justify-between items-end mb-1.5">
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                        {row.label}
                      </div>
                      <div className="text-lg font-mono font-black tracking-tighter" style={{ color: row.color, textShadow: `0 0 10px ${row.glow}` }}>
                        {row.fmt(row.curr)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-mono text-muted-foreground/60">PRV: {row.fmt(row.prev)}</div>
                      <div className={cn(
                        "text-[10px] font-mono font-bold flex items-center justify-end gap-1",
                        isPositive ? "text-success" : "text-destructive"
                      )}>
                        {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                        {isPositive ? "+" : ""}{delta.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar background */}
                  <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden relative">
                    {/* Ghost progress (previous) */}
                    <div 
                      className="absolute inset-y-0 left-0 bg-white/5 border-r border-white/20 transition-all duration-1000"
                      style={{ width: `${Math.min(100, (row.prev / Math.max(row.curr, row.prev, 1)) * 100)}%` }}
                    />
                    {/* Active progress */}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (row.curr / Math.max(row.curr, row.prev, 1)) * 100)}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="absolute inset-y-0 left-0 transition-all"
                      style={{ 
                        backgroundColor: row.color,
                        boxShadow: `0 0 10px ${row.color}`
                      }}
                    />
                  </div>

                  {/* Micro bracket decoration */}
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-gradient-to-b from-transparent via-muted-foreground/20 to-transparent group-hover:via-primary/40 transition-colors" />
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.section>
  );
};

export default FuturisticSpeedometerDashboard;
