import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TrendingUp, TrendingDown, Target, FileText as FileTextIcon, Download, RefreshCw, Smartphone, Mail, Hash } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { type KPIPeriod } from "@/hooks/useDashboardKPIsPeriod";

export interface SpeedometerProps {
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

const PERIOD_OPTIONS: { value: KPIPeriod; label: string }[] = [
  { value: "current_month", label: "Mês Atual" },
  { value: "last_month", label: "Último Mês" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Ano" },
];

const accentMap = {
  primary: { stroke: "hsl(var(--primary))", glow: "hsl(var(--primary) / 0.5)", text: "text-primary" },
  success: { stroke: "hsl(var(--success))", glow: "hsl(var(--success) / 0.5)", text: "text-success" },
  warning: { stroke: "hsl(var(--warning))", glow: "hsl(var(--warning) / 0.5)", text: "text-warning" },
  destructive: { stroke: "hsl(var(--destructive))", glow: "hsl(var(--destructive) / 0.5)", text: "text-destructive" },
};

export const Speedometer = ({
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
  const [drilldownPeriod, setDrilldownPeriod] = useState<KPIPeriod>("current_month");
  
  const colors = accentMap[accent];
  const range = max - min;
  const animatedPct = Math.min(1, Math.max(0, range > 0 ? (animatedValue - min) / range : 0));

  const statusLabel = animatedPct >= 0.8 ? "Excelente" : animatedPct >= 0.5 ? "Bom" : animatedPct >= 0.3 ? "Atenção" : "Crítico";
  const statusColor = animatedPct >= 0.8 ? "text-success" : animatedPct >= 0.5 ? "text-primary" : animatedPct >= 0.3 ? "text-warning" : "text-destructive";

  const [displayData, setDisplayData] = useState(drilldownData);

  const handleExportCSV = () => {
    if (!displayData.length) return;
    const headers = ["Period", "Value"];
    const rows = displayData.map(d => [d.name, d.value]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `drilldown_${label.toLowerCase()}_${drilldownPeriod}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!displayData.length) return;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(accentMap[accent].stroke);
    doc.text(`Relatório de Drill-down: ${label}`, 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Período: ${PERIOD_OPTIONS.find(p => p.value === drilldownPeriod)?.label}`, 14, 32);
    doc.text(`Data de Geração: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 38);

    doc.setFontSize(14);
    doc.setTextColor(50);
    doc.text("Resumo de Performance", 14, 50);
    doc.setFontSize(11);
    const summaryVal = displayData.reduce((acc, curr) => acc + curr.value, 0);
    doc.text(`Valor Acumulado no Período: ${formatValue ? formatValue(summaryVal) : summaryVal}`, 14, 58);
    doc.text(`Meta (Max): ${formatValue ? formatValue(max) : max}`, 14, 64);
    doc.text(`Eficiência: ${Math.round(animatedPct * 100)}%`, 14, 70);

    autoTable(doc, {
      startY: 80,
      head: [["Período", "Valor"]],
      body: displayData.map(d => [d.name, d.value]),
      theme: 'grid',
      headStyles: { fillColor: accentMap[accent].stroke },
    });

    doc.save(`drilldown_${label.toLowerCase()}_${drilldownPeriod}.pdf`);
  };

  const s = currentSize;
  const isSmallScreen = s < 200;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
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
    if (!drilldownData.length) return;
    
    const multiplier = 
      drilldownPeriod === "year" ? 12 : 
      drilldownPeriod === "quarter" ? 3 : 
      drilldownPeriod === "last_month" ? 1.1 : 1;
    
    const newData = drilldownData.map(d => ({
      ...d,
      value: d.value * multiplier * (0.9 + Math.random() * 0.2)
    }));
    
    setDisplayData(newData);
  }, [drilldownPeriod, drilldownData]);

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
        <DialogTrigger asChild>
          <div className="relative cursor-pointer hover:brightness-110 transition-all flex flex-col items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative" style={{ width: s, height: s }}>
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
                    </svg>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className={cn("text-3xl font-black font-mono tracking-tighter mb-0", colors.text)}>
                        {displayValue}
                        <span className="text-xs ml-0.5 opacity-60">{unit}</span>
                      </div>
                      <div className={cn("text-[10px] font-bold font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-background/40 border border-border/20", statusColor)}>
                        {statusLabel}
                      </div>
                      <div className="mt-2 text-[8px] font-mono text-muted-foreground/60 uppercase tracking-[0.2em]">
                        Performance: {percentStr}
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px] bg-background/95 backdrop-blur-xl border-primary/20 p-3">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Detalhamento</p>
                    <p className="text-[10px] leading-relaxed text-muted-foreground">{explanation || `Análise de ${label} em tempo real.`}</p>
                    <div className="pt-2 flex items-center justify-between border-t border-border/20">
                      <span className="text-[9px] text-muted-foreground">Clique para drill-down</span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-background/95 backdrop-blur-3xl border-primary/20 p-0 flex flex-col">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-black font-mono uppercase tracking-tighter flex items-center gap-3">
                  <div className={cn("p-2 rounded-xl bg-background border border-border/40", colors.text)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  Drill-down: {label}
                </DialogTitle>
                <DialogDescription className="text-[10px] uppercase font-mono tracking-widest">
                  Análise detalhada de performance por período
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={drilldownPeriod} onValueChange={(v) => setDrilldownPeriod(v as KPIPeriod)}>
                  <SelectTrigger className="w-[140px] h-9 text-[10px] font-mono uppercase bg-background/40 border-border/40">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-3xl border-border/40">
                    {PERIOD_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-[10px] font-mono uppercase">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9 bg-background/40 border-border/40">
                      <Download className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-40 p-2 bg-background/95 backdrop-blur-3xl border-border/40">
                    <div className="grid gap-1">
                      <Button variant="ghost" size="sm" className="justify-start gap-2 text-[10px] font-mono uppercase" onClick={handleExportCSV}>
                        <FileTextIcon className="h-3 w-3" /> Exportar CSV
                      </Button>
                      <Button variant="ghost" size="sm" className="justify-start gap-2 text-[10px] font-mono uppercase" onClick={handleExportPDF}>
                        <FileTextIcon className="h-3 w-3" /> Exportar PDF
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 rounded-2xl bg-background/40 border border-border/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Meta do Período</span>
                </div>
                <div className="text-2xl font-black font-mono tracking-tighter">
                  {formatValue ? formatValue(max) : max}
                </div>
                <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                  />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-background/40 border border-border/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-success" />
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Realizado</span>
                </div>
                <div className="text-2xl font-black font-mono tracking-tighter">
                  {displayValue}
                </div>
                <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-success"
                    initial={{ width: 0 }}
                    animate={{ width: percentStr }}
                  />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-background/40 border border-border/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-warning" />
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Eficiência</span>
                </div>
                <div className="text-2xl font-black font-mono tracking-tighter">
                  {percentStr}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-success">
                  <TrendingUp className="h-3 w-3" /> +4.2% vs prev.
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-6 rounded-2xl bg-background/40 border border-border/40">
                <h4 className="text-[11px] font-black font-mono uppercase tracking-[0.2em] text-muted-foreground mb-6">Tendência Temporal</h4>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.2)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: 'hsl(var(--muted-foreground))' }} />
                      <RechartsTooltip
                        cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-background/95 backdrop-blur-xl border border-border/40 p-3 rounded-xl shadow-2xl">
                                <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">{payload[0].payload.name}</p>
                                <p className="text-sm font-black font-mono text-primary">{formatValue ? formatValue(Number(payload[0].value)) : payload[0].value}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24}>
                        {displayData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={colors.stroke} fillOpacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-background/40 border border-border/40">
                  <h4 className="text-[11px] font-black font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">Composição de Canais</h4>
                  <div className="space-y-4">
                    {[
                      { label: "Direto", val: 45, icon: Smartphone, color: "text-primary" },
                      { label: "E-mail", val: 30, icon: Mail, color: "text-success" },
                      { label: "Outros", val: 25, icon: Hash, color: "text-warning" }
                    ].map((channel, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className={cn("p-2 rounded-lg bg-background border border-border/20", channel.color)}>
                          <channel.icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="uppercase">{channel.label}</span>
                            <span>{channel.val}%</span>
                          </div>
                          <div className="h-1 w-full bg-muted/20 rounded-full overflow-hidden">
                            <motion.div
                              className={cn("h-full", channel.color.replace("text-", "bg-"))}
                              initial={{ width: 0 }}
                              animate={{ width: `${channel.val}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-background/40 border border-border/40">
                  <h4 className="text-[11px] font-black font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">Ações Recomendadas</h4>
                  <div className="space-y-3">
                    {[
                      "Otimizar tempo de resposta em canais digitais",
                      "Revisar metas do próximo trimestre baseado no histórico",
                      "Aumentar frequência de follow-up em deals qualificados"
                    ].map((action, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-background/40 border border-border/20 hover:border-primary/30 transition-colors group cursor-pointer">
                        <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0 group-hover:scale-150 transition-transform" />
                        <span className="text-[10px] font-medium leading-relaxed">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t border-border/40 flex justify-between items-center bg-background/60">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-3 w-3 text-muted-foreground animate-spin-slow" />
                <span className="text-[9px] font-mono text-muted-foreground uppercase">Live Data Stream: Active</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="text-[9px] font-mono text-muted-foreground">
                ÚLTIMA ATUALIZAÇÃO: {format(new Date(), "HH:mm:ss")}
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-[10px] font-mono uppercase gap-2" onClick={() => setIsDrilldownOpen(false)}>
              Fechar Insight
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Re-add these constants as they are needed by the component
import { Zap, Activity, Target as LucideTarget } from "lucide-react";
