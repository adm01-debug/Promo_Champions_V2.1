import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useDashboardKPIsPeriod, PERIOD_LABELS, type KPIPeriod } from "@/hooks/dashboard/useDashboardKPIsPeriod";
import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { useSalespeopleList } from "@/hooks/useSalespeopleList";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Settings2, RefreshCw, Bell, AlertTriangle, Info, Gauge, TrendingUp, TrendingDown, Zap, Target, DollarSign, Activity, Users, Hash, Download, FileText as FileTextIcon, History, Smartphone, Mail, Layout } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SpeedometerSkeleton } from "./skeletons/SpeedometerSkeletons";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { IntegrationStatusPanel } from "./IntegrationStatusPanel";
import { DashboardSection } from "./DashboardSection";
import { Speedometer } from "./Speedometer";
import { DashboardSettings } from "./DashboardSettings";
import { AlertHistoryDialog } from "./AlertHistoryDialog";
import { HudAlert } from "./HudAlert";

const PERIOD_STORAGE_KEY = "dashboard.speedometer.period";
const SALESPERSON_STORAGE_KEY = "dashboard.speedometer.salesperson";
const ALL_SALESPEOPLE = "__all__";
const ME = "__me__";

const isValidPeriod = (v: string | null): v is KPIPeriod =>
  v === "current_month" || v === "last_month" || v === "quarter" || v === "year";

const PERIOD_OPTIONS: { value: KPIPeriod; label: string }[] = [
  { value: "current_month", label: "Mês Atual" },
  { value: "last_month", label: "Último Mês" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Ano" },
];

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

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Settings state
  const [ticksCount, setTicksCount] = useState(33);
  const [gaugeMode, setGaugeMode] = useState<"standard" | "compact" | "kilo">("standard");
  const [minVal, setMinVal] = useState(0);
  const [customMax, setCustomMax] = useState<number | null>(null);
  const [customUnit, setCustomUnit] = useState("");
  const [autoScale, setAutoScale] = useState(true);

  // Alert Settings
  const [oppThreshold, setOppThreshold] = useState(80);
  const [retThreshold, setRetThreshold] = useState(75);
  const [alertFrequency, setAlertFrequency] = useState<"daily" | "weekly" | "realtime">("realtime");
  const [alertHistory, setAlertHistory] = useState<any[]>([]);
  const [isAlertHistoryOpen, setIsAlertHistoryOpen] = useState(false);
  const [activeHudAlert, setActiveHudAlert] = useState<any>(null);
  const [notifiedEvents, setNotifiedEvents] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);

  const setPeriod = (p: KPIPeriod) => {
    setPeriodState(p);
    localStorage.setItem(PERIOD_STORAGE_KEY, p);
  };

  const setSalespersonFilter = (id: string) => {
    setSalespersonFilterState(id);
    localStorage.setItem(SALESPERSON_STORAGE_KEY, id);
  };

  const targetSalespersonId = salespersonFilter === ME ? currentUser?.id : salespersonFilter === ALL_SALESPEOPLE ? undefined : salespersonFilter;

  const { data: kpis, isLoading: kpisLoading, isFetching: kpisFetching } = useDashboardKPIsPeriod(period, targetSalespersonId);
  const { data: goals } = useGoalsDashboard();

  useEffect(() => {
    if (kpis) setLastUpdate(new Date());
  }, [kpis]);

  const saveSettings = useCallback(async (newSettings: any) => {
    if (!user?.id) return;
    setIsSyncing(true);
    
    const { data: existing } = await supabase
      .from("user_app_settings")
      .select("value")
      .eq("user_id", user.id)
      .eq("key", "speedometer_settings")
      .maybeSingle();
      
    const updatedValue = { ...(existing?.value as any || {}), ...newSettings };
    
    await supabase.from("user_app_settings").upsert({
      user_id: user.id,
      key: "speedometer_settings",
      value: updatedValue
    });
    
    setIsSyncing(false);
  }, [user?.id]);

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
      
      const { data: historyData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (historyData) {
        setAlertHistory(historyData.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          priority: n.priority as 'high' | 'medium' | 'low',
          type: n.type,
          created_at: n.created_at,
          metadata: n.metadata
        })));
      }
    };
    
    loadSettings();
  }, [user?.id]);

  const testAlert = useCallback(() => {
    const alert = {
      id: Math.random().toString(36).substr(2, 9),
      title: "Telemetria :: Alerta de Meta",
      message: "Faturamento atingiu 92% da meta projetada para o período atual.",
      priority: 'medium',
      type: 'threshold_reached',
      created_at: new Date().toISOString(),
      metadata: { threshold: 92 }
    };
    
    setActiveHudAlert(alert);
    setAlertHistory(prev => [alert, ...prev].slice(0, 20));
    setTimeout(() => setActiveHudAlert(null), 8000);
  }, []);

  const clearAlertHistory = useCallback(async () => {
    if (!user?.id) return;
    await supabase.from("notifications").delete().eq("user_id", user.id);
    setAlertHistory([]);
    toast.info("Histórico de alertas removido");
  }, [user?.id]);

  const revenue = kpis?.current.totalRevenue ?? 0;
  const prevRevenue = kpis?.previous.totalRevenue ?? 0;
  const sales = kpis?.current.totalSales ?? 0;
  const prevSales = kpis?.previous.totalSales ?? 0;
  const conversion = kpis?.current.conversionRate ?? 0;
  const ticket = kpis?.current.avgTicket ?? 0;
  const prevTicket = kpis?.previous.avgTicket ?? 0;

  const goalAmount = customMax || goals?.totalGoal || 100000;
  const salesMax = customMax || (goals ? Math.round(goals.totalGoal / 1000) : 100); 
  const conversionMax = customMax || 50; 
  const ticketMax = customMax || 5000;

  const selectedLabel = salespersonFilter === ALL_SALESPEOPLE ? "Todo o Time" : salespersonFilter === ME ? "Meus Dados" : salespeople.find(s => s.id === salespersonFilter)?.name || "Vendedor";

  const mockRevenueHistory = [
    { name: 'Lun', value: Math.floor(revenue * 0.1) },
    { name: 'Mar', value: Math.floor(revenue * 0.2) },
    { name: 'Mie', value: Math.floor(revenue * 0.15) },
    { name: 'Jue', value: Math.floor(revenue * 0.25) },
    { name: 'Vie', value: Math.floor(revenue * 0.3) }
  ];

  const mockSalesHistory = [
    { name: 'Lun', value: Math.floor(sales * 0.15) },
    { name: 'Mar', value: Math.floor(sales * 0.25) },
    { name: 'Mie', value: Math.floor(sales * 0.2) },
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
        </>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
            <Gauge className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-primary">Performance HUD</h2>
            <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider flex items-center gap-2">
              Telemetria · {PERIOD_LABELS[period].label} · {selectedLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <DashboardSettings 
            isSyncing={isSyncing}
            minVal={minVal}
            setMinVal={setMinVal}
            customMax={customMax}
            setCustomMax={setCustomMax}
            oppThreshold={oppThreshold}
            setOppThreshold={setOppThreshold}
            retThreshold={retThreshold}
            setRetThreshold={setRetThreshold}
            alertFrequency={alertFrequency}
            setAlertFrequency={setAlertFrequency}
            ticksCount={ticksCount}
            setTicksCount={setTicksCount}
            gaugeMode={gaugeMode}
            setGaugeMode={setGaugeMode}
            saveSettings={saveSettings}
            setIsAlertHistoryOpen={setIsAlertHistoryOpen}
          />
          
          <Select value={salespersonFilter} onValueChange={setSalespersonFilter}>
            <SelectTrigger className="w-[180px] h-8 text-[10px] font-mono uppercase bg-background/60 border-border/40 backdrop-blur">
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 text-primary" />
                <SelectValue placeholder="Vendedor" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-3xl border-border/40">
              <SelectItem value={ALL_SALESPEOPLE} className="text-[10px] font-mono uppercase">Equipe Completa</SelectItem>
              <SelectItem value={ME} className="text-[10px] font-mono uppercase">Meus Dados</SelectItem>
              {salespeople.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-[10px] font-mono uppercase">{s.name}</SelectItem>
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
                  period === opt.value ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col items-end pr-2 border-r border-border/40">
            <span className="text-[8px] font-mono text-muted-foreground uppercase">Sincronização</span>
            <span className="text-[10px] font-mono font-black text-primary">{format(lastUpdate, "HH:mm:ss")}</span>
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
          />
        </div>
      )}

      {kpis && (
        <div className={cn("mt-6 relative overflow-hidden rounded-xl p-5", theme === "cyber" ? "border border-border/40 bg-card/40 backdrop-blur-xl" : "bg-card border border-border shadow-sm")}>
           <div className="relative flex items-center gap-4 mb-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-primary/80">Comparative Telemetry · {PERIOD_LABELS[period].comparison}</span>
          </div>
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Faturamento", curr: revenue, prev: prevRevenue, fmt: fmtBRL, color: "hsl(var(--primary))" },
              { label: "Vendas", curr: sales, prev: prevSales, fmt: (v: number) => String(v), color: "hsl(var(--success))" },
              { label: "Conversão", curr: conversion, prev: (kpis?.previous.conversionRate ?? 0), fmt: (v: number) => `${v.toFixed(1)}%`, color: "hsl(var(--warning))" },
              { label: "Ticket Médio", curr: ticket, prev: prevTicket, fmt: fmtBRL, color: "hsl(var(--destructive))" },
            ].map((row, idx) => {
              const delta = row.prev > 0 ? ((row.curr - row.prev) / row.prev) * 100 : 100;
              const isPositive = delta >= 0;
              return (
                <div key={row.label} className="group relative">
                  <div className="flex justify-between items-end mb-1.5">
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{row.label}</div>
                      <div className="text-lg font-mono font-black tracking-tighter" style={{ color: row.color }}>{row.fmt(row.curr)}</div>
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
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (row.curr / Math.max(row.curr, row.prev, 1)) * 100)}%` }} transition={{ duration: 1, delay: idx * 0.1 }} className="absolute inset-y-0 left-0 transition-all" style={{ backgroundColor: row.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AlertHistoryDialog 
        isOpen={isAlertHistoryOpen}
        onOpenChange={setIsAlertHistoryOpen}
        alertHistory={alertHistory}
        clearAlertHistory={clearAlertHistory}
        alertFrequency={alertFrequency}
        testAlert={testAlert}
      />

      <HudAlert activeHudAlert={activeHudAlert} />

      <DashboardSection 
        title="Infraestrutura de Comunicação" 
        icon={<Settings2 className="h-4 w-4" />}
        teaser="Verificar status de entrega e logs de e-mail/push em tempo real"
      >
        <IntegrationStatusPanel />
      </DashboardSection>
    </motion.section>
  );
};

export default FuturisticSpeedometerDashboard;
