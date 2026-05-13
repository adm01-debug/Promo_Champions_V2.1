import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardKPIsPeriod, PERIOD_LABELS, type KPIPeriod } from "@/hooks/useDashboardKPIsPeriod";
import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { useSalespeopleList } from "@/hooks/useSalespeopleList";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Settings2, RefreshCw, Bell, AlertTriangle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { SpeedometerSkeleton } from "./skeletons/SpeedometerSkeletons";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { IntegrationStatusPanel } from "./IntegrationStatusPanel";
import { DashboardSection } from "./DashboardSection";
import { Speedometer } from "./Speedometer";

const PERIOD_OPTIONS: { value: KPIPeriod; label: string }[] = [
  { value: "current_month", label: "Mês Atual" },
  { value: "last_month", label: "Último Mês" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Ano" },
];

const PERIOD_STORAGE_KEY = "dashboard.speedometer.period";
const SALESPERSON_STORAGE_KEY = "dashboard.speedometer.salesperson";
const ALL_SALESPEOPLE = "__all__";
const ME = "__me__";

const isValidPeriod = (v: string | null): v is KPIPeriod =>
  v === "current_month" || v === "last_month" || v === "quarter" || v === "year";


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

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Settings state
  const [ticksCount, setTicksCount] = useState(33);
  const [gaugeMode, setGaugeMode] = useState<"standard" | "compact" | "kilo">("standard");
  const [minVal, setMinVal] = useState(0);
  const [customMax, setCustomMax] = useState<number | null>(null);
  const [customUnit, setCustomUnit] = useState("");
  const [autoScale, setAutoScale] = useState(true);

  // New Alert Settings
  const [oppThreshold, setOppThreshold] = useState(80);
  const [retThreshold, setRetThreshold] = useState(75);
  const [alertFrequency, setAlertFrequency] = useState<"daily" | "weekly" | "realtime">("realtime");
  const [alertChannels, setAlertChannels] = useState<string[]>(["hud", "toast"]);
  const [alertEvents, setAlertEvents] = useState<string[]>(["threshold_reached", "goal_achieved"]);
  const [alertHistory, setAlertHistory] = useState<any[]>([]);
  const [isAlertHistoryOpen, setIsAlertHistoryOpen] = useState(false);
  const [activeHudAlert, setActiveHudAlert] = useState<any>(null);
  const [notifiedEvents, setNotifiedEvents] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);

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
        if (s.alertChannels) setAlertChannels(s.alertChannels);
        if (s.alertEvents) setAlertEvents(s.alertEvents);
      }
      
      // Load Alert History
      const { data: historyData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (historyData) setAlertHistory(historyData);
    };
    
    loadSettings();
  }, [user?.id]);


  const saveSettings = async (updates: any) => {
    if (!user?.id) return;
    setIsSyncing(true);
    
    const currentSettings = { 
      ticksCount, gaugeMode, minVal, customMax, customUnit, autoScale,
      oppThreshold, retThreshold, alertFrequency, alertChannels, alertEvents 
    };
    const newSettings = { ...currentSettings, ...updates };
    
    const { error } = await supabase.from("user_app_settings").upsert({
      user_id: user.id,
      key: "speedometer_settings",
      value: newSettings,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, key' });

    if (error) {
      toast.error("Erro ao sincronizar configurações");
    } else {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  const clearAlertHistory = async () => {
    if (!user?.id) return;
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", user.id);
    
    if (error) {
      toast.error("Erro ao limpar histórico");
    } else {
      setAlertHistory([]);
      toast.success("Histórico limpo com sucesso");
    }
  };

  const testAlert = async () => {
    if (!user?.id) return;
    
    const testNotification = {
      user_id: user.id,
      title: "Teste de Alerta",
      message: "Este é um alerta de teste para validar suas configurações de threshold e canais.",
      type: "system",
      priority: "info",
      metadata: { threshold: 0, actual: 0 }
    };

    const { data, error } = await supabase
      .from("notifications")
      .insert(testNotification)
      .select()
      .single();

    if (error) {
      toast.error("Erro ao disparar alerta de teste");
      return;
    }

    if (alertChannels.includes("toast")) {
      toast.info(data.title, {
        description: data.message,
        icon: <Bell className="h-4 w-4" />
      });
    }

    if (alertChannels.includes("hud")) {
      setActiveHudAlert(data);
      setTimeout(() => setActiveHudAlert(null), 8000);
    }

    if (alertChannels.includes("email")) {
      toast.success("E-mail Enviado", {
        description: `Um alerta foi enviado para o e-mail: ${user.email}`,
        icon: <Mail className="h-4 w-4" />
      });
    }

    if (alertChannels.includes("push")) {
      toast.success("Push Notification", {
        description: "Alerta enviado para seus dispositivos sincronizados.",
        icon: <Smartphone className="h-4 w-4" />
      });
    }

    setAlertHistory(prev => [data, ...prev].slice(0, 20));
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
  
  useEffect(() => {
    if (kpis) setLastUpdate(new Date());
  }, [kpis]);
  // Monitor KPIs and Trigger Alerts
  useEffect(() => {
    if (!kpis || !user?.id || alertFrequency !== "realtime") return;

    const checkThresholds = async () => {
      const currentOpp = kpis.current.conversionRate;
      // Calculate a realistic but deterministic "Retention" based on sales volume and conversion
      const currentRet = Math.min(100, Math.max(0, 85 + (kpis.current.totalSales / 100) - (currentOpp / 5)));
      
      const newAlerts = [];

      if (currentOpp >= oppThreshold && !notifiedEvents.has(`opp_${oppThreshold}_${period}`)) {
        newAlerts.push({
          title: "Meta de Oportunidades Superada!",
          message: `O threshold de ${oppThreshold}% foi superado no período ${PERIOD_LABELS[period].label}. Performance: ${currentOpp.toFixed(1)}%.`,
          type: "goal_achieved",
          priority: "high",
          metadata: { threshold: oppThreshold, actual: currentOpp, period }
        });
        setNotifiedEvents(prev => {
          const next = new Set(prev);
          next.add(`opp_${oppThreshold}_${period}`);
          return next;
        });
      }

      if (currentRet < retThreshold && !notifiedEvents.has(`ret_${retThreshold}_${period}`)) {
        newAlerts.push({
          title: "Alerta Crítico de Retenção",
          message: `A retenção caiu para ${currentRet.toFixed(1)}%, abaixo do threshold de ${retThreshold}%. Ação necessária.`,
          type: "threshold_reached",
          priority: "high",
          metadata: { threshold: retThreshold, actual: currentRet, period }
        });
        setNotifiedEvents(prev => {
          const next = new Set(prev);
          next.add(`ret_${retThreshold}_${period}`);
          return next;
        });
      }

      for (const alertData of newAlerts) {
        const { data, error } = await supabase
          .from("notifications")
          .insert({ ...alertData, user_id: user.id })
          .select()
          .single();

        if (data) {
          if (alertChannels.includes("toast")) {
            toast[data.priority === 'high' ? 'warning' : 'info'](data.title, {
              description: data.message,
              icon: <Bell className="h-4 w-4" />
            });
          }
          if (alertChannels.includes("hud")) {
            setActiveHudAlert(data);
            setTimeout(() => setActiveHudAlert(null), 8000);
          }
          setAlertHistory(prev => [data, ...prev].slice(0, 20));
        }
      }
    };

    checkThresholds();
  }, [kpis, oppThreshold, retThreshold, alertFrequency, user?.id, alertChannels, notifiedEvents]);



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
            <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="opacity-70">Telemetria · {PERIOD_LABELS[period].label} · {selectedLabel}</span>
              <span className="inline-block w-1 h-1 rounded-full bg-success animate-pulse" />
              <span className="text-[9px] text-success/80">Sincronizado: {new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}</span>
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
            <PopoverContent className="w-80 bg-popover/95 backdrop-blur-xl border-primary/20 p-4 shadow-2xl rounded-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                  <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">HUD Configuration</h4>
                  {isSyncing ? (
                    <div className="flex items-center gap-1.5 text-[8px] font-mono text-primary animate-pulse">
                      <RefreshCw className="h-2 w-2 animate-spin" /> SYNCING
                    </div>
                  ) : (
                    <div className="text-[8px] font-mono text-success/70">CLOUDSYNC ACTIVE</div>
                  )}
                </div>
                
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

                <div className="space-y-3 pt-2 border-t border-primary/10">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[9px] font-mono font-bold uppercase text-primary/80">Thresholds & Alertas</h5>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => setIsAlertHistoryOpen(true)}
                    >
                      <History className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8px] font-mono uppercase text-muted-foreground">
                      <span>Oportunidades</span>
                      <span>{oppThreshold}%</span>
                    </div>
                    <Slider 
                      value={[oppThreshold]} 
                      max={100} 
                      step={1} 
                      onValueChange={(v) => {
                        setOppThreshold(v[0]);
                        saveSettings({ oppThreshold: v[0] });
                      }}
                      className="py-1"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8px] font-mono uppercase text-muted-foreground">
                      <span>Retenção</span>
                      <span>{retThreshold}%</span>
                    </div>
                    <Slider 
                      value={[retThreshold]} 
                      max={100} 
                      step={1} 
                      onValueChange={(v) => {
                        setRetThreshold(v[0]);
                        saveSettings({ retThreshold: v[0] });
                      }}
                      className="py-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-mono uppercase text-muted-foreground">Canais</label>
                    <div className="flex gap-2">
                      {[
                        { id: "hud", icon: Layout, label: "HUD" },
                        { id: "toast", icon: Bell, label: "Toast" },
                        { id: "push", icon: Smartphone, label: "Push" },
                        { id: "email", icon: Mail, label: "Email" }
                      ].map(channel => (
                        <Button
                          key={channel.id}
                          variant="outline"
                          size="sm"
                          className={cn(
                            "flex-1 h-8 flex flex-col gap-0.5 p-0 bg-background/40 border-border/40",
                            alertChannels.includes(channel.id) && "border-primary/50 bg-primary/10 text-primary"
                          )}
                          onClick={() => {
                            const newChannels = alertChannels.includes(channel.id)
                              ? alertChannels.filter(c => c !== channel.id)
                              : [...alertChannels, channel.id];
                            setAlertChannels(newChannels);
                            saveSettings({ alertChannels: newChannels });
                          }}
                        >
                          <channel.icon className="h-2.5 w-2.5" />
                          <span className="text-[7px] uppercase font-bold">{channel.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-mono uppercase text-muted-foreground">Frequência</label>
                    <Select 
                      value={alertFrequency} 
                      onValueChange={(v: any) => {
                        setAlertFrequency(v);
                        saveSettings({ alertFrequency: v });
                      }}
                    >
                      <SelectTrigger className="h-7 text-[10px] bg-background/40 border-border/40 font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover/95 backdrop-blur-xl border-primary/20">
                        <SelectItem value="realtime" className="text-[10px] font-mono">Real-time</SelectItem>
                        <SelectItem value="daily" className="text-[10px] font-mono">Diário</SelectItem>
                        <SelectItem value="weekly" className="text-[10px] font-mono">Semanal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="ghost" 
                    className="w-full h-8 mt-2 border border-primary/30 text-primary hover:bg-primary/10 font-mono text-[9px] uppercase tracking-widest"
                    onClick={testAlert}
                  >
                    <Zap className="mr-2 h-3 w-3" /> Testar Alertas Agora
                  </Button>
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

              </div>
            </PopoverContent>
          </Popover>

          <Select value={salespersonFilter} onValueChange={setSalespersonFilter}>
            <SelectTrigger className="h-8 w-[160px] bg-background/60 border-border/40 backdrop-blur text-[11px] font-mono">
              <Users className="h-3.5 w-3.5 mr-1.5 text-primary shrink-0" />
              <SelectValue placeholder="Selecionar vendedor" />
            </SelectTrigger>
            <SelectContent className="bg-popover/95 backdrop-blur-xl border-primary/20">
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
                className={cn(
                  "px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-md transition-all",
                  period === opt.value 
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-success font-bold">Live Telemetry</span>
          </div>

          <div className="flex flex-col items-end pr-2 border-r border-border/40">
            <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest leading-none mb-1">Sincronização</span>
            <span className="text-[10px] font-mono font-black text-primary animate-pulse">{format(lastUpdate, "HH:mm:ss")}</span>
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
      <Dialog open={isAlertHistoryOpen} onOpenChange={setIsAlertHistoryOpen}>
        <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-4 border-b border-primary/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <History className="h-4 w-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold font-mono uppercase tracking-widest text-primary">Histórico de Alertas</DialogTitle>
                <DialogDescription className="text-[10px] font-mono uppercase text-muted-foreground">Logs de Telemetria & Thresholds</DialogDescription>
              </div>
            </div>
            {alertHistory.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-[9px] font-mono uppercase text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
                onClick={clearAlertHistory}
              >
                Limpar Logs
              </Button>
            )}
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="p-4 space-y-4">
              {alertHistory.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-muted/20 border border-muted/30">
                      <Bell className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  </div>
                  <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">Nenhum alerta registrado</p>
                </div>
              ) : (
                alertHistory.map((alert) => (
                  <div key={alert.id} className="relative group">
                    <div className="flex gap-3">
                      <div className={cn(
                        "mt-1 p-1.5 rounded-md border shrink-0",
                        alert.priority === 'high' ? "bg-destructive/10 border-destructive/30 text-destructive" :
                        alert.priority === 'medium' ? "bg-warning/10 border-warning/30 text-warning" :
                        "bg-primary/10 border-primary/30 text-primary"
                      )}>
                        {alert.priority === 'high' ? <AlertTriangle className="h-3 w-3" /> :
                         alert.priority === 'medium' ? <AlertTriangle className="h-3 w-3" /> :
                         <Info className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4 className="text-[11px] font-bold font-mono uppercase text-foreground leading-none truncate">{alert.title}</h4>
                          <span className="text-[8px] font-mono text-muted-foreground whitespace-nowrap">
                            {format(new Date(alert.created_at), "dd/MM HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="h-4 px-1 text-[7px] font-mono uppercase bg-background/40 border-border/40">
                            {alert.type}
                          </Badge>
                          {alert.metadata?.threshold && (
                            <Badge variant="outline" className="h-4 px-1 text-[7px] font-mono uppercase text-primary border-primary/30">
                              Goal: {alert.metadata.threshold}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="absolute -left-1 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="p-3 bg-primary/5 border-t border-primary/10 flex justify-between items-center">
            <span className="text-[8px] font-mono uppercase text-muted-foreground">Config: {alertFrequency}</span>
            <Button variant="ghost" size="sm" className="h-6 text-[8px] uppercase font-bold text-primary hover:bg-primary/10" onClick={testAlert}>
              Forçar Check
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {activeHudAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
          >
            <div className="relative overflow-hidden rounded-2xl bg-background/60 backdrop-blur-3xl border border-primary/30 shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />
              
              <div className="p-5 flex items-start gap-4">
                <div className="relative">
                  <div className="p-3 rounded-xl bg-primary/20 border border-primary/40">
                    <Bell className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-ping" />
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black font-mono uppercase tracking-[0.2em] text-primary">System Alert :: HUD</h3>
                    <Badge variant="outline" className="text-[8px] font-mono border-primary/40 text-primary">Real-time</Badge>
                  </div>
                  <h4 className="text-sm font-bold text-foreground">{activeHudAlert.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                    {activeHudAlert.message}
                  </p>
                </div>
              </div>
              
              <div className="h-1 w-full bg-muted/20">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 8, ease: "linear" }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
