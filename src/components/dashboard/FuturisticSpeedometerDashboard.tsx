import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
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

const Speedometer = ({ 
  value, 
  min = 0, 
  max, 
  label, 
  unit = "", 
  formatValue, 
  accent, 
  icon: Icon, 
  delta, 
  size = 280, 
  ticksCount = 33 
}: SpeedometerProps) => {
  const { theme } = useDashboardTheme();
  const [animatedValue, setAnimatedValue] = useState(min);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSize, setCurrentSize] = useState(size);
  
  const colors = accentMap[accent];
  const range = max - min;
  const animatedPct = Math.min(1, Math.max(0, range > 0 ? (animatedValue - min) / range : 0));

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          setCurrentSize(Math.min(width - 24, size));
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
  const arcLength = endAngle - startAngle;
  const circumference = 2 * Math.PI * arcRadius;
  const arcRatio = arcLength / 360;
  const dashArc = circumference * arcRatio;
  const dashOffset = dashArc * (1 - animatedPct);

  const needleAngle = startAngle + arcLength * animatedPct;

  const ticks = useMemo(() => {
    return Array.from({ length: ticksCount }).map((_, i) => {
      const tickPct = i / (ticksCount - 1);
      const angle = (startAngle + arcLength * tickPct) * (Math.PI / 180);
      const isMajor = i % (ticksCount > 20 ? 4 : 2) === 0;
      const inner = arcRadius - (isMajor ? 18 * (s / 280) : 10 * (s / 280));
      const outer = arcRadius - 4 * (s / 280);
      const labelRadius = arcRadius - 32 * (s / 280);
      return {
        x1: cx + inner * Math.cos(angle),
        y1: cy + inner * Math.sin(angle),
        x2: cx + outer * Math.cos(angle),
        y2: cy + outer * Math.sin(angle),
        labelX: cx + labelRadius * Math.cos(angle),
        labelY: cy + labelRadius * Math.sin(angle),
        active: tickPct <= animatedPct,
        major: isMajor,
        labelValue: min + range * tickPct,
      };
    });
  }, [arcRadius, cx, cy, startAngle, arcLength, animatedPct, min, range, ticksCount, s]);

  useEffect(() => {
    const startValue = animatedValue;
    const endValue = value;
    const startTime = performance.now();
    const duration = 1500; 
    
    let raf = 0;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 5);
      
      setAnimatedValue(startValue + (endValue - startValue) * eased);
      
      if (p < 1) {
        raf = requestAnimationFrame(animate);
      }
    };
    
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const displayValue = formatValue ? formatValue(animatedValue) : Math.round(animatedValue).toLocaleString("pt-BR");
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
            <div className="relative cursor-help" style={{ width: s, height: s }}>
              {theme === "cyber" && (
                <motion.div
                  className="absolute inset-0 rounded-full blur-3xl pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${colors.glow}, transparent 65%)` }}
                  animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
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
              <svg
                width={s}
                height={s}
                viewBox={`0 0 ${s} ${s}`}
                className="absolute inset-0"
              >
                <defs>
                  <linearGradient id={"grad-" + accent + "-" + label} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.4" />
                    <stop offset="50%" stopColor={colors.stroke} stopOpacity="1" />
                    <stop offset="100%" stopColor={colors.stroke} stopOpacity="0.7" />
                  </linearGradient>
                  <filter id={"glow-" + accent + "-" + label}>
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <radialGradient id={"hub-" + accent + "-" + label}>
                    <stop offset="0%" stopColor={colors.stroke} stopOpacity="1" />
                    <stop offset="60%" stopColor={colors.stroke} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={colors.stroke} stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx={cx} cy={cy} r={outerRadius} fill="none" stroke={colors.stroke} strokeOpacity="0.25" strokeWidth="1" />
                <circle cx={cx} cy={cy} r={arcRadius} fill="none" stroke="hsl(var(--border))" strokeOpacity="0.25" strokeWidth="6" strokeDasharray={dashArc + " " + circumference} transform={"rotate(" + startAngle + " " + cx + " " + cy + ")"} strokeLinecap="round" />
                <circle cx={cx} cy={cy} r={arcRadius} fill="none" stroke={"url(#grad-" + accent + "-" + label + ")"} strokeWidth="6" strokeDasharray={dashArc + " " + circumference} strokeDashoffset={dashOffset} transform={"rotate(" + startAngle + " " + cx + " " + cy + ")"} strokeLinecap="round" filter={"url(#glow-" + accent + "-" + label + ")"} style={{ transition: "stroke-dashoffset 0.1s linear" }} />
                {ticks.map((t, i) => (
                  <g key={i}>
                    <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.active ? colors.stroke : "hsl(var(--muted-foreground))"} strokeOpacity={t.active ? 0.9 : 0.35} strokeWidth={t.major ? 2 : 1} strokeLinecap="round" />
                    {t.major && (
                      <text x={t.labelX} y={t.labelY} textAnchor="middle" dominantBaseline="middle" fontSize={9 * (s / 280)} fontFamily="var(--font-mono)" fill={t.active ? colors.stroke : "hsl(var(--muted-foreground))"} fillOpacity={t.active ? 0.95 : 0.45} className="font-bold">
                        {t.labelValue >= 1000 ? Math.round(t.labelValue / 1000) + "k" : Math.round(t.labelValue)}
                      </text>
                    )}
                  </g>
                ))}
                <circle cx={cx} cy={cy} r={innerRadius} fill="none" stroke={colors.stroke} strokeOpacity="0.3" strokeWidth="1" strokeDasharray="2 4" />
                <circle cx={cx} cy={cy} r={innerRadius - 12} fill="hsl(var(--background))" fillOpacity="0.6" stroke={colors.stroke} strokeOpacity="0.4" strokeWidth="1.5" />
                <g transform={"rotate(" + needleAngle + " " + cx + " " + cy + ")"} style={{ transition: "transform 0.1s linear" }}>
                  <line x1={cx} y1={cy} x2={cx + arcRadius - 4} y2={cy} stroke={colors.stroke} strokeWidth="3" strokeLinecap="round" filter={"url(#glow-" + accent + "-" + label + ")"} opacity="0.95" />
                  <circle cx={cx + arcRadius - 4} cy={cy} r="5" fill={colors.stroke} filter={"url(#glow-" + accent + "-" + label + ")"}>
                    <animate attributeName="r" values="4;7;4" dur="1.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                </g>
                <circle cx={cx} cy={cy} r="20" fill={"url(#hub-" + accent + "-" + label + ")"} />
                <circle cx={cx} cy={cy} r="10" fill="hsl(var(--background))" stroke={colors.stroke} strokeWidth="2" filter={"url(#glow-" + accent + "-" + label + ")"} />
                <circle cx={cx} cy={cy} r="3" fill={colors.stroke}>
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div
                  className={cn("font-mono font-black tabular-nums tracking-tighter leading-none transition-all duration-300", colors.text)}
                  style={{
                    fontSize: s * 0.14,
                    textShadow: theme === "cyber" ? "0 0 12px " + colors.glow + ", 0 0 24px " + colors.glow : "none",
                  }}
                >
                  {displayValue}
                </div>
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
                  className="h-full"
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
