import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useDashboardKPIsPeriod, PERIOD_LABELS, type KPIPeriod } from "@/hooks/useDashboardKPIsPeriod";
import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { useSalespeopleList } from "@/hooks/useSalespeopleList";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Gauge, TrendingUp, TrendingDown, Zap, Target, DollarSign, Activity, Users, Settings2, Hash, RefreshCw, Download, FileJson, FileText as FileTextIcon } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
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
  drilldownData?: any[];
  explanation?: string;
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
  ticksCount = 33,
  drilldownData = [],
  explanation = ""
}: SpeedometerProps) => {
  const { theme } = useDashboardTheme();
  const [animatedValue, setAnimatedValue] = useState(min);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSize, setCurrentSize] = useState(size);
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);
  
  const colors = accentMap[accent];
  const range = max - min;
  const animatedPct = Math.min(1, Math.max(0, range > 0 ? (animatedValue - min) / range : 0));

  const statusLabel = animatedPct >= 0.8 ? "Excelente" : animatedPct >= 0.5 ? "Bom" : animatedPct >= 0.3 ? "Atenção" : "Crítico";
  const statusColor = animatedPct >= 0.8 ? "text-success" : animatedPct >= 0.5 ? "text-primary" : animatedPct >= 0.3 ? "text-warning" : "text-destructive";


  const s = currentSize;
  const isSmallScreen = s < 200;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          // Optimization: throttle resize updates by avoiding unnecessary state changes
          const newSize = Math.min(width - 24, size);
          setCurrentSize((prev) => (Math.abs(prev - newSize) > 5 ? newSize : prev));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [size]);

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

      <Dialog open={isDrilldownOpen} onOpenChange={setIsDrilldownOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <div className="relative cursor-pointer hover:brightness-110 transition-all" style={{ width: s, height: s }}>
              {theme === "cyber" && !isSmallScreen && (
                <motion.div
                  className="absolute inset-0 rounded-full blur-3xl pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${colors.glow}, transparent 65%)` }}
                  animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              {theme === "cyber" && !isSmallScreen && (
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
              {theme === "cyber" && !isSmallScreen && (
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
              <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="absolute inset-0">
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
            </div>
          </DialogTrigger>
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

      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl bg-background border border-border/40 shadow-inner", colors.text)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-display font-bold">{label}</DialogTitle>
                <DialogDescription className="text-sm font-medium mt-0.5">
                  Análise Detalhada de Performance e Origem dos Dados
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className={cn("px-3 py-1 font-mono uppercase tracking-wider border-current/20", statusColor, "bg-current/10")}>
              Status: {statusLabel}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <div className="p-6 pt-2 space-y-6">
            {explanation && (
              <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <Activity className="h-3 w-3" /> Explicação do Status
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed italic">
                  "{explanation}"
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border/40 shadow-sm flex flex-col items-center text-center">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Atual</span>
                <span className={cn("text-2xl font-mono font-black", colors.text)}>
                  {formatValue ? formatValue(value) : value.toLocaleString("pt-BR")}
                </span>
                <span className="text-[10px] text-muted-foreground mt-1">unidades ({unit})</span>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/40 shadow-sm flex flex-col items-center text-center">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Eficiência</span>
                <span className="text-2xl font-mono font-black text-foreground">
                  {percentStr}
                </span>
                <div className="w-full h-1 bg-muted/40 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: percentStr }} />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/40 shadow-sm flex flex-col items-center text-center">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Meta (MAX)</span>
                <span className="text-2xl font-mono font-black text-foreground">
                  {formatValue ? formatValue(max) : max.toLocaleString("pt-BR")}
                </span>
                <span className="text-[10px] text-muted-foreground mt-1">benchmark sugerido</span>
              </div>
            </div>

            {drilldownData && drilldownData.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <TrendingUp className="h-3 w-3" /> Histórico de Composição
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">Real-time Data</Badge>
                </div>
                
                <div className="h-[200px] w-full bg-card/50 rounded-xl p-4 border border-border/20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={drilldownData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}}
                      />
                      <RechartsTooltip 
                        cursor={{fill: 'hsl(var(--primary) / 0.05)'}}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          fontSize: '12px',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {drilldownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === drilldownData.length - 1 ? colors.stroke : 'hsl(var(--primary) / 0.3)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Últimas Atualizações</p>
                  <div className="rounded-xl border border-border/40 overflow-hidden bg-muted/20">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border/40">
                          <th className="px-4 py-2 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Data/Hora</th>
                          <th className="px-4 py-2 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Valor</th>
                          <th className="px-4 py-2 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Origem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                        {drilldownData.slice(-3).reverse().map((item, i) => (
                          <tr key={i} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{new Date().toLocaleDateString('pt-BR')} {10+i}:00</td>
                            <td className="px-4 py-2 font-bold">{formatValue ? formatValue(item.value) : item.value}</td>
                            <td className="px-4 py-2">
                              <Badge variant="outline" className="text-[9px] bg-background">Sincronização API</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-muted/20 rounded-2xl border border-dashed border-border/60">
                <RefreshCw className="h-10 w-10 text-muted-foreground/30 animate-spin-slow" />
                <p className="text-sm text-muted-foreground italic">Processando composição granular para este período...</p>
              </div>
            )}
            
            <Separator className="bg-border/20" />
            
            <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/10 rounded-xl">
              <Zap className="h-4 w-4 text-primary animate-pulse" />
              <p className="text-xs text-primary font-medium">
                Insight IA: {animatedPct < 0.5 ? "Acelere as atividades de topo de funil para normalizar este indicador." : "Performance saudável. Mantenha a cadência atual para atingir o benchmark."}
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>

      <div className="mt-4 flex flex-col items-center gap-1 w-full">
        <div
          className={cn("font-mono font-black tabular-nums tracking-tight leading-none transition-all duration-300", colors.text)}
          style={{
            fontSize: Math.max(22, s * 0.16),
            textShadow: theme === "cyber" ? `0 0 24px ${colors.glow}, 0 0 48px ${colors.glow}` : "none",
          }}
        >
          {displayValue}
        </div>
        <div
          className="text-muted-foreground/70 font-mono uppercase tracking-[0.2em]"
          style={{ fontSize: Math.max(8, s * 0.04) }}
        >
          max {formatValue ? formatValue(max) : max.toLocaleString("pt-BR")}
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
  const { theme } = useDashboardTheme();
  const { user, salesperson: currentUser } = useAuth();
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

  // Settings state
  const [ticksCount, setTicksCount] = useState(33);
  const [gaugeMode, setGaugeMode] = useState<"standard" | "compact" | "kilo">("standard");
  const [minVal, setMinVal] = useState(0);
  const [customMax, setCustomMax] = useState<number | null>(null);
  const [customUnit, setCustomUnit] = useState("");
  const [autoScale, setAutoScale] = useState(true);

  // New Alert Settings
  const [oppThreshold, setOppThreshold] = useState(10);
  const [retThreshold, setRetThreshold] = useState(5);
  const [alertFrequency, setAlertFrequency] = useState<"daily" | "weekly" | "realtime">("daily");


  // Persistence logic
  useEffect(() => {
    if (!user?.id) return;
    
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from("user_app_settings")
        .select("value")
        .eq("user_id", user.id)
        .eq("key", "speedometer_settings")
        .maybeSingle();
      
      if (data?.value && typeof data.value === 'object') {
        const s = data.value as any;
        if (s.ticksCount) setTicksCount(s.ticksCount);
        if (s.gaugeMode) setGaugeMode(s.gaugeMode);
        if (typeof s.minVal === 'number') setMinVal(s.minVal);
        if (typeof s.customMax !== 'undefined') setCustomMax(s.customMax);
        if (typeof s.customUnit !== 'undefined') setCustomUnit(s.customUnit);
        if (typeof s.autoScale !== 'undefined') setAutoScale(s.autoScale);
        if (typeof s.oppThreshold === 'number') setOppThreshold(s.oppThreshold);
        if (typeof s.retThreshold === 'number') setRetThreshold(s.retThreshold);
        if (s.alertFrequency) setAlertFrequency(s.alertFrequency);
      }
    };
    
    loadSettings();
  }, [user?.id]);

  const saveSettings = async (updates: any) => {
    if (!user?.id) return;
    
    const currentSettings = { 
      ticksCount, gaugeMode, minVal, customMax, customUnit, autoScale,
      oppThreshold, retThreshold, alertFrequency 
    };
    const newSettings = { ...currentSettings, ...updates };
    
    await supabase.from("user_app_settings").upsert({
      user_id: user.id,
      key: "speedometer_settings",
      value: newSettings,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, key' });
  };

  const setPeriod = (p: KPIPeriod) => {
    setPeriodState(p);
    try {
      window.localStorage.setItem(PERIOD_STORAGE_KEY, p);
    } catch { /* ignore */ }
  };

  const setSalespersonFilter = (id: string) => {
    setSalespersonFilterState(id);
    try {
      window.localStorage.setItem(SALESPERSON_STORAGE_KEY, id);
    } catch { /* ignore */ }
  };

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
  const prevConversion = kpis?.previous.conversionRate ?? 0;

  // Auto-scaling logic
  const goalAmount = customMax || (autoScale ? Math.max(revenue * 1.25, prevRevenue * 1.25, goals?.totalGoal || 50000) : (goals?.totalGoal || Math.max(revenue * 1.3, 50000)));
  const salesMax = customMax || (autoScale ? Math.max(sales * 1.5, prevSales * 1.5, 20) : Math.max(sales * 1.5, 20));
  const ticketMax = customMax || (autoScale ? Math.max(ticket * 1.5, prevTicket * 1.5, 1000) : Math.max(ticket * 1.5, 1000));
  const conversionMax = customMax || (autoScale ? Math.max(conversion * 1.2, prevConversion * 1.2, 100) : 100);

  const mockRevenueHistory = [
    { name: 'S1', value: revenue * 0.15 },
    { name: 'S2', value: revenue * 0.25 },
    { name: 'S3', value: revenue * 0.35 },
    { name: 'S4', value: revenue * 0.25 }
  ];

  const mockSalesHistory = [
    { name: 'Lun', value: Math.floor(sales * 0.1) },
    { name: 'Mar', value: Math.floor(sales * 0.2) },
    { name: 'Mie', value: Math.floor(sales * 0.3) },
    { name: 'Jue', value: Math.floor(sales * 0.1) },
    { name: 'Vie', value: Math.floor(sales * 0.3) }
  ];


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
      {theme === "cyber" && (
        <>
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-xl pointer-events-none" />
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-primary/40 rounded-tr-xl pointer-events-none" />
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-primary/40 rounded-bl-xl pointer-events-none" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-primary/40 rounded-br-xl pointer-events-none" />
          <div className="absolute -top-3 left-10 flex items-center gap-4 pointer-events-none">
            <div className="px-2 py-0.5 rounded bg-black border border-primary/30 text-[8px] font-mono font-bold text-primary tracking-[0.2em] uppercase shadow-[0_0_10px_rgba(14,165,233,0.2)]">
              System: Online
            </div>
            <div className="px-2 py-0.5 rounded bg-black border border-success/30 text-[8px] font-mono font-bold text-success tracking-[0.2em] uppercase">
              Signal: Stable
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
            <h2 className="font-display text-lg font-bold tracking-tight text-primary" style={{ textShadow: "0 0 10px hsl(var(--primary) / 0.6), 0 0 22px hsl(var(--primary) / 0.35)" }}>
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
            <PopoverContent className="w-80 bg-popover/95 backdrop-blur-xl border-primary/20 p-4">
              <div className="space-y-4">
                <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">HUD Configuration</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase text-muted-foreground">Minimo</label>
                    <Input 
                      type="number" 
                      value={minVal} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setMinVal(val);
                        saveSettings({ minVal: val });
                      }}
                      className="h-7 text-[10px] bg-background/40 border-border/40 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase text-muted-foreground">Maximo (Manual)</label>
                    <Input 
                      type="number" 
                      placeholder="Auto"
                      value={customMax || ""} 
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        setCustomMax(val);
                        saveSettings({ customMax: val });
                      }}
                      className="h-7 text-[10px] bg-background/40 border-border/40 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono uppercase text-muted-foreground">
                    <span>Densidade de Ticks</span>
                    <span className="text-primary">{ticksCount}</span>
                  </div>
                  <Slider value={[ticksCount]} min={5} max={65} step={4} onValueChange={(val) => {
                    setTicksCount(val[0]);
                    saveSettings({ ticksCount: val[0] });
                  }} />
                </div>

                <div className="space-y-1.5 pt-2 border-t border-primary/10">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-mono uppercase text-muted-foreground">Escala Automática</label>
                    <button 
                      onClick={() => {
                        const val = !autoScale;
                        setAutoScale(val);
                        saveSettings({ autoScale: val });
                      }}
                      className={cn(
                        "p-1 rounded transition-colors",
                        autoScale ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted/10"
                      )}
                    >
                      <RefreshCw className={cn("h-3 w-3", autoScale && "animate-spin-slow")} />
                    </button>
                  </div>
                  <p className="text-[8px] text-muted-foreground font-mono leading-tight">Ajusta min/max dinamicamente com base nos dados históricos.</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-primary/10">
                  <label className="text-[9px] font-mono uppercase text-muted-foreground">Unidade Personalizada</label>
                  <Input 
                    placeholder="ex: km/h, pts"
                    value={customUnit} 
                    onChange={(e) => {
                      setCustomUnit(e.target.value);
                      saveSettings({ customUnit: e.target.value });
                    }}
                    className="h-7 text-[10px] bg-background/40 border-border/40 font-mono"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-primary/10">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1.5">Format Display</div>
                  <div className="grid grid-cols-3 gap-1">
                    {(["standard", "compact", "kilo"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setGaugeMode(m);
                          saveSettings({ gaugeMode: m });
                        }}
                        className={cn("px-1 py-1 text-[8px] font-mono uppercase rounded border transition-all", gaugeMode === m ? "bg-primary/20 border-primary text-primary" : "bg-background/40 border-border/40 text-muted-foreground hover:border-primary/40")}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-primary/10">
                  <h5 className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary/80">Thresholds & Alerts</h5>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8px] font-mono uppercase text-muted-foreground">
                      <span>Threshold Oportunidades</span>
                      <span className="text-primary">{oppThreshold}%</span>
                    </div>
                    <Slider 
                      value={[oppThreshold]} 
                      min={1} max={50} step={1} 
                      onValueChange={(v) => {
                        setOppThreshold(v[0]);
                        saveSettings({ oppThreshold: v[0] });
                      }} 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8px] font-mono uppercase text-muted-foreground">
                      <span>Threshold Retenção</span>
                      <span className="text-primary">{retThreshold}%</span>
                    </div>
                    <Slider 
                      value={[retThreshold]} 
                      min={1} max={50} step={1} 
                      onValueChange={(v) => {
                        setRetThreshold(v[0]);
                        saveSettings({ retThreshold: v[0] });
                      }} 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-mono uppercase text-muted-foreground">Frequência de Alerta</label>
                    <Select 
                      value={alertFrequency} 
                      onValueChange={(v: any) => {
                        setAlertFrequency(v);
                        saveSettings({ alertFrequency: v });
                      }}
                    >
                      <SelectTrigger className="h-6 text-[9px] bg-background/40 border-border/40 font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover/95 backdrop-blur-xl">
                        <SelectItem value="realtime"><span className="text-[10px] font-mono">Real-time</span></SelectItem>
                        <SelectItem value="daily"><span className="text-[10px] font-mono">Daily</span></SelectItem>
                        <SelectItem value="weekly"><span className="text-[10px] font-mono">Weekly</span></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Select value={salespersonFilter} onValueChange={setSalespersonFilter}>
            <SelectTrigger className="h-8 w-[160px] bg-background/60 border-border/40 backdrop-blur text-[11px] font-mono">
              <Users className="h-3.5 w-3.5 mr-1.5 text-primary shrink-0" />
              <SelectValue placeholder="Selecionar vendedor" />
            </SelectTrigger>
            <SelectContent className="bg-popover/95 backdrop-blur-xl">
              <SelectItem value={ME}><span className="font-mono text-xs">Eu{currentUser?.name ? ` (${currentUser.name})` : ""}</span></SelectItem>
              <SelectItem value={ALL_SALESPEOPLE}><span className="font-mono text-xs">Toda Equipe</span></SelectItem>
              {salespeople.map((sp) => (
                <SelectItem key={sp.id} value={sp.id}><span className="font-mono text-xs">{sp.name}</span></SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-background/60 border border-border/40 backdrop-blur">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={cn("px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-md transition-all", period === opt.value ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-background/80")}
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

      {kpisLoading || !kpis ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SpeedometerSkeleton key={i} />)}
        </div>
      ) : (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity duration-300", kpisFetching && "opacity-60")}>
          <Speedometer 
            label="Faturamento" 
            value={revenue} 
            min={minVal} 
            max={goalAmount} 
            formatValue={fmtBRL} 
            accent="primary" 
            icon={DollarSign} 
            delta={kpis?.changes.revenue} 
            ticksCount={ticksCount} 
            unit={customUnit || "BRL"}
            drilldownData={mockRevenueHistory}
            explanation={`Faturamento total acumulado no período ${PERIOD_OPTIONS.find(o => o.value === period)?.label}. Baseado em pedidos confirmados e faturados.`}
          />
          <Speedometer 
            label="Vendas" 
            value={sales} 
            min={minVal} 
            max={salesMax} 
            accent="success" 
            icon={Zap} 
            delta={kpis?.changes.sales} 
            ticksCount={ticksCount} 
            unit={customUnit || "vendas"}
            drilldownData={mockSalesHistory}
            explanation="Volume total de transações aprovadas. Reflete a eficácia operacional do time de vendas no fechamento de negócios."
          />
          <Speedometer 
            label="Conversão" 
            value={conversion} 
            min={minVal} 
            max={conversionMax} 
            formatValue={(v) => `${v.toFixed(1)}%`} 
            accent="warning" 
            icon={Target} 
            delta={kpis?.changes.conversion} 
            ticksCount={ticksCount} 
            unit={customUnit || "%"}
            explanation="Razão entre oportunidades geradas e vendas concluídas. Indica a qualidade da qualificação e a eficiência do pitch de vendas."
          />
          <Speedometer 
            label="Ticket Médio" 
            value={ticket} 
            min={minVal} 
            max={ticketMax} 
            formatValue={fmtBRL} 
            accent="destructive" 
            icon={Activity} 
            delta={kpis?.changes.avgTicket} 
            ticksCount={ticksCount} 
            unit={customUnit || "BRL"}
            explanation="Valor médio por venda realizada. Estratégias de upsell e cross-sell impactam diretamente este indicador."
          />

        </div>
      )}

      {kpis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("mt-6 relative overflow-hidden rounded-xl transition-all duration-500 p-5", theme === "cyber" ? "border border-border/40 bg-card/40 backdrop-blur-xl" : "bg-card border border-border shadow-sm")}
        >
          <div className="relative flex items-center gap-4 mb-4">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-primary/50" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-primary/80">Comparative Telemetry · {PERIOD_LABELS[period].comparison}</span>
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
                      <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{row.label}</div>
                      <div className="text-lg font-mono font-black tracking-tighter" style={{ color: row.color, textShadow: `0 0 10px ${row.glow}` }}>{row.fmt(row.curr)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-mono text-muted-foreground/60">PRV: {row.fmt(row.prev)}</div>
                      <div className={cn("text-[10px] font-mono font-bold flex items-center justify-end gap-1", isPositive ? "text-success" : "text-destructive")}>
                        {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                        {isPositive ? "+" : ""}{delta.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-white/5 border-r border-white/20 transition-all duration-1000" style={{ width: `${Math.min(100, (row.prev / Math.max(row.curr, row.prev, 1)) * 100)}%` }} />
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (row.curr / Math.max(row.curr, row.prev, 1)) * 100)}%` }} transition={{ duration: 1, delay: idx * 0.1 }} className="absolute inset-y-0 left-0 transition-all" style={{ backgroundColor: row.color, boxShadow: `0 0 10px ${row.color}` }} />
                  </div>
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
