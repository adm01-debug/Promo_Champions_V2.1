import { useState, useMemo, useCallback } from "react";
import { useLeadScoring, type ScoredLead } from "@/hooks/useLeadScoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Target, TrendingUp, Flame, Thermometer, Snowflake, 
  BarChart3, Info, Brain, RefreshCw, AlertTriangle, 
  ShieldAlert, Download, Search, Filter, CheckCircle2,
  Calendar, FileText, Activity, UserPlus, Zap
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LeadScoreExplainCard } from "./LeadScoreExplainCard";
import { LeadScoreDistribution } from "./LeadScoreDistribution";
import { useExplainBatch } from "@/hooks/scoring/useExplainBatch";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const categoryConfig = {
  Hot: { icon: Flame, color: "text-status-error", bg: "bg-status-error/10 border-status-error/20", label: "ELITE" },
  Warm: { icon: Thermometer, color: "text-status-warning", bg: "bg-status-warning/10 border-status-warning/20", label: "ACTIVE" },
  Cold: { icon: Snowflake, color: "text-info", bg: "bg-info/10 border-info/20", label: "STAGNANT" },
};


function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "stroke-status-error" : score >= 50 ? "stroke-status-warning" : "stroke-blue-500";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor"
          strokeWidth={4} className="text-muted/30" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          strokeWidth={4} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className={cn(color, "transition-all duration-700")} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-sm">
        {score}
      </span>
    </div>
  );
}

function FactorBar({ label, value, maxValue }: { label: string; value: number; maxValue: number }) {
  const pct = Math.round((value / maxValue) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}/{maxValue}</span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}

export function LeadScoringDashboard() {
  const { data: leads, isLoading, refetch } = useLeadScoring();
  const [explainSaleId, setExplainSaleId] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [churnFilter, setChurnFilter] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const [attendedAlerts, setAttendedAlerts] = useState<Set<string>>(new Set());
  const explainBatch = useExplainBatch();

  useMemo(() => {
    const channel = supabase
      .channel('lead-scoring-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lead_score_trends' }, () => {
        setIsLoadingLeads(true);
        refetch().finally(() => setIsLoadingLeads(false));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lead_churn_risk' }, () => {
        setIsLoadingLeads(true);
        refetch().finally(() => setIsLoadingLeads(false));
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setConnectionStatus("connected");
        else if (status === 'CLOSED') setConnectionStatus("connecting");
        else if (status === 'CHANNEL_ERROR') setConnectionStatus("error");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const allLeads = leads || [];
  
  const filteredLeads = useMemo(() => {
    return allLeads.filter(l => {
      const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (l.company?.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [allLeads, searchTerm]);

      const alerts = useMemo(() => {
        return allLeads.filter(l => 
          l.churnRisk && 
          l.churnRisk.risk_score > 50 && 
          !attendedAlerts.has(l.id) &&
          (churnFilter === "all" || l.churnRisk.risk_level === churnFilter)
        ).sort((a, b) => (b.churnRisk?.risk_score || 0) - (a.churnRisk?.risk_score || 0));
      }, [allLeads, attendedAlerts, churnFilter]);

      const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "error">("connecting");
      const [isLoadingLeads, setIsLoadingLeads] = useState(false);

      const exportToCSV = () => {
        setIsExporting(true);
        try {
          const headers = ["Rank", "Name", "Company", "Score", "Category", "Risk Level", "Risk Score"];
          // Use filteredLeads to respect current filters
          const rows = filteredLeads.map((l, i) => [
            i + 1,
            `"${l.name}"`,
            `"${l.company || "N/A"}"`,
            l.score,
            l.category,
            l.churnRisk?.risk_level || "low",
            l.churnRisk?.risk_score || 0
          ]);

          const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement("a");
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", `lead_ranking_filtered_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success("Ranking filtrado exportado para CSV com sucesso!");
        } catch (error) {
          toast.error("Erro ao exportar CSV.");
        } finally {
          setIsExporting(false);
        }
      };

      const exportToPDF = () => {
        setIsExporting(true);
        toast.info("Gerando PDF Estratégico com filtros atuais...");
        setTimeout(() => {
          // Capturing the current view state
          window.print();
          toast.success("Relatório PDF estratégico gerado!");
          setIsExporting(false);
        }, 1500);
      };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold italic uppercase tracking-tighter">Lead Intelligence</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Skeleton className="md:col-span-8 h-96 rounded-xl" />
          <Skeleton className="md:col-span-4 h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  const hotCount = allLeads.filter(l => l.category === "Hot").length;
  const warmCount = allLeads.filter(l => l.category === "Warm").length;
  const coldCount = allLeads.filter(l => l.category === "Cold").length;
  const avgScore = allLeads.length > 0 ? Math.round(allLeads.reduce((s, l) => s + l.score, 0) / allLeads.length) : 0;

  return (
    <div className="space-y-8 p-1 sm:p-0">
      {/* Header with Telemetry Style */}
      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <Target className="h-7 w-7 text-primary animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
          </div>
          <div>
            <h1 className="font-display font-black text-3xl uppercase tracking-tighter italic">Lead Intelligence</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Scoring Engine v4.0</span>
              <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                {allLeads.length} COMBATANTS DETECTED
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mr-2">
            <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", connectionStatus === "connected" ? "bg-emerald-500" : "bg-rose-500")} />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              {connectionStatus === "connected" ? "Neural Link Active" : "Link Error"}
            </span>
          </div>

          <Button
            variant="outline"
            className="h-12 px-6 rounded-xl border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-[0_0_15px_rgba(var(--primary-rgb),0.05)]"
            onClick={async () => {
              const ids = allLeads.map((l) => l.bestDealId).filter(Boolean) as string[];
              if (ids.length > 0) {
                await explainBatch.mutateAsync(ids.slice(0, 50));
                await supabase.from('lead_score_trends').insert(
                  allLeads.map(l => ({ sale_id: l.bestDealId || l.id, score: l.score }))
                );
              }
            }}
            disabled={explainBatch.isPending}
          >
            <Brain className={cn("h-4 w-4 mr-2", explainBatch.isPending && "animate-spin")} />
            Neural Analysis
          </Button>

          <Button
            variant="outline"
            onClick={exportToPDF}
            disabled={isExporting}
            className="h-12 px-6 rounded-xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
          >
            <FileText className="h-4 w-4 mr-2" />
            Full Report
          </Button>
        </div>
      </div>


      {/* Enhanced KPI Telemetry */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-none shadow-2xl backdrop-blur-md">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="relative group">
              <ScoreRing score={avgScore} size={64} />
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">Global Index</p>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display font-black text-3xl tracking-tighter">{avgScore}</span>
                <span className="text-[10px] font-bold text-primary italic">PCT</span>
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent opacity-20" />
        </Card>
        
        {([
          { cat: "Hot" as const, count: hotCount },
          { cat: "Warm" as const, count: warmCount },
          { cat: "Cold" as const, count: coldCount },
        ]).map(({ cat, count }) => {
          const cfg = categoryConfig[cat];
          const Icon = cfg.icon;
          return (
            <Card key={cat} className={cn("relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-none shadow-xl backdrop-blur-md transition-all hover:scale-[1.02]")}>
              <CardContent className="p-6 flex items-center gap-5">
                <div className={cn("p-4 rounded-2xl ring-1 ring-white/5 shadow-inner", cfg.bg)}>
                  <Icon className={cn("h-6 w-6", cfg.color)} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">{cfg.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-black text-3xl tracking-tighter">{count}</span>
                    <span className="text-[10px] font-bold text-muted-foreground">UNIT</span>
                  </div>
                </div>
              </CardContent>
              <div className={cn("absolute bottom-0 left-0 w-1/2 h-0.5 opacity-40", cfg.bg.split(' ')[0])} />
            </Card>
          );
        })}
      </div>


      {/* Analytics & Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <LeadScoreDistribution />
        </div>
        
        <div className="lg:col-span-4 space-y-6">
          <Card variant="modern" className="overflow-hidden border-l-4 border-l-status-error bg-card/40 backdrop-blur-xl">
            <CardHeader className="pb-2 border-b border-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-status-error" />
                  Alertas de Churn
                </CardTitle>
                <div className="flex gap-1">
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn("h-6 w-6 rounded-md", churnFilter === "critical" && "bg-status-error/20")}
                    onClick={() => setChurnFilter(churnFilter === "critical" ? "all" : "critical")}
                   >
                     <AlertTriangle className="h-3 w-3 text-status-error" />
                   </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
              {alerts.length > 0 ? (
                alerts.map(lead => (
                  <div key={lead.id} className="group p-4 rounded-xl bg-status-error/5 border border-status-error/10 space-y-3 hover:bg-status-error/10 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-black uppercase tracking-tighter truncate block max-w-[140px]">{lead.name}</span>
                        <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">{lead.company || "N/A"}</span>
                      </div>
                      <Badge variant="destructive" className={cn(
                        "text-[8px] px-1.5 h-4 font-black",
                        lead.churnRisk?.risk_level === 'critical' ? "bg-status-error animate-pulse" : "bg-status-warning"
                      )}>
                        {lead.churnRisk?.risk_level === 'critical' ? "CRÍTICO" : "ALTO RISCO"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-muted-foreground uppercase tracking-widest">Intensidade</span>
                        <span className="text-status-error">{lead.churnRisk?.risk_score}%</span>
                      </div>
                      <Progress value={lead.churnRisk?.risk_score} className="h-1.5 bg-status-error/10" indicatorClassName="bg-status-error shadow-[0_0_10px_rgba(var(--status-error-rgb),0.5)]" />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-status-error/10">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setAttendedAlerts(prev => new Set([...prev, lead.id]));
                          toast.success(`Alerta de ${lead.name} marcado como atendido.`);
                        }}
                        className="h-7 px-2 text-[9px] font-black uppercase tracking-widest hover:bg-status-success hover:text-white"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Atendido
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLeadId(lead.id);
                        }}
                        className="h-7 px-2 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary"
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="relative inline-block mb-4">
                    <ShieldAlert className="h-10 w-10 mx-auto text-emerald-500/20" />
                    <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full" />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Base Segura: Sem Riscos</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card variant="modern" className="overflow-hidden bg-primary/5 border-primary/20 glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary">Strategic Insight</h4>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Predição Neural</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground font-medium italic">
                {allLeads.length > 0 && hotCount > 0 
                  ? `Detectamos que ${hotCount} combatantes estão em ponto de conversão. Recomendamos foco total no fechamento imediato para bater as metas do período.`
                  : "O motor de inteligência está processando novos dados de mercado para gerar o próximo movimento estratégico."
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>


      {/* Elite Ranking Table */}
      <Card variant="modern" className="overflow-hidden bg-card/40 backdrop-blur-md border-white/5">
        <CardHeader className="p-6 border-b border-border/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tighter italic">
                <BarChart3 className="h-5 w-5 text-primary" />
                Strategic Lead Ranking
              </CardTitle>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Painel de Priorização de Ativos</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full md:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="LOCALIZAR COMBATANTE..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 pl-9 bg-background/50 border-white/5 text-[10px] font-black uppercase tracking-widest focus-visible:ring-primary/20"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                  disabled={isExporting}
                  className="h-9 px-4 rounded-lg border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground"
                >
                  <Download className={cn("h-3.5 w-3.5 mr-2", isExporting && "animate-bounce")} />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToPDF}
                  disabled={isExporting}
                  className="h-9 px-4 rounded-lg border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground"
                >
                  <FileText className={cn("h-3.5 w-3.5 mr-2", isExporting && "animate-bounce")} />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToPDF}
                  disabled={isExporting}
                  className="h-9 px-4 rounded-lg border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground"
                >
                  <FileText className={cn("h-3.5 w-3.5 mr-2", isExporting && "animate-bounce")} />
                  PDF
                </Button>
              </div>

              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-300",
                connectionStatus === "connected" ? "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : 
                connectionStatus === "error" ? "bg-rose-500/10 border-rose-500/20" : "bg-accent/30 border-white/5 shadow-inner"
              )}>
                {explainBatch.isPending || isLoadingLeads || isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
                ) : (
                  <Activity className={cn("w-3.5 h-3.5 animate-pulse", 
                    connectionStatus === "connected" ? "text-emerald-500" : 
                    connectionStatus === "error" ? "text-rose-500" : "text-primary"
                  )} />
                )}
                <span className={cn("text-[9px] font-black uppercase tracking-widest",
                  connectionStatus === "connected" ? "text-emerald-500" : 
                  connectionStatus === "error" ? "text-rose-500" : "text-muted-foreground"
                )}>
                  {connectionStatus === "connected" ? "Neural Link Active" : 
                   connectionStatus === "error" ? "Link Error" : "Connecting..."}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <div className="relative inline-block mb-4">
                <Target className="h-16 w-16 mx-auto opacity-10" />
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
              </div>
              <p className="font-display font-black uppercase tracking-widest text-sm italic">Nenhum combatante localizado</p>
              <p className="text-[10px] mt-2 font-medium uppercase tracking-widest">Ajuste os parâmetros de busca neural</p>
            </div>
          ) : (
            <div className="divide-y divide-border/5">
              {filteredLeads.map((lead, idx) => {
                const cfg = categoryConfig[lead.category];
                const Icon = cfg.icon;
                const isServerScore = "dealValue" in lead.factors;

                return (
                  <div key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={cn(
                      "group relative flex items-center gap-6 p-5 transition-all duration-500 cursor-pointer",
                      "hover:bg-primary/[0.04] hover:backdrop-blur-md",
                      idx === 0 && "bg-primary/[0.03] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary"
                    )}
                  >
                    {/* Futuristic Rank Indicator */}
                    <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
                      <span className={cn(
                        "font-display font-black text-2xl tracking-tighter z-10 italic transition-all duration-500",
                        idx < 3 ? "text-primary scale-110" : "text-muted-foreground/30"
                      )}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      {idx < 3 && (
                        <div className="absolute inset-0 bg-primary/5 rounded-2xl rotate-45 scale-90 border border-primary/20 group-hover:rotate-90 transition-transform duration-700" />
                      )}
                    </div>

                    {/* Enhanced Score Ring */}
                    <div className="shrink-0 scale-110 group-hover:scale-125 transition-all duration-500 relative">
                      <ScoreRing score={lead.score} size={52} />
                      <div className={cn("absolute -top-1 -right-1 p-0.5 rounded-full ring-2 ring-background", cfg.bg)}>
                        <Icon className={cn("h-2.5 w-2.5", cfg.color)} />
                      </div>
                    </div>

                    {/* Strategic Lead Info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-3">
                        <h4 className="font-display font-black text-lg uppercase tracking-tighter truncate group-hover:text-primary transition-all duration-300">
                          {lead.name}
                        </h4>
                        <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border border-white/5 shadow-sm", cfg.bg, cfg.color)}>
                          {cfg.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                          <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest truncate max-w-[200px]">
                            {lead.company || lead.email || "ANONYMOUS ENTITY"}
                          </p>
                        </div>
                        {lead.trend && lead.trend.length > 1 && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/30 border border-white/5">
                            {lead.trend[lead.trend.length - 1] > lead.trend[0] ? (
                              <TrendingUp className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <TrendingUp className="h-3 w-3 text-rose-500 rotate-180" />
                            )}
                            <span className={cn(
                              "text-[10px] font-black tracking-tighter",
                              lead.trend[lead.trend.length - 1] > lead.trend[0] ? "text-emerald-500" : "text-rose-500"
                            )}>
                              {Math.abs(lead.trend[lead.trend.length - 1] - lead.trend[0])}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>


                    {/* Risk & Intelligence Hub */}
                    <div className="flex items-center gap-3">
                      {lead.churnRisk && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={cn(
                              "p-2.5 rounded-xl cursor-help transition-all duration-300 ring-1 ring-inset",
                              lead.churnRisk.risk_level === 'critical' ? "bg-status-error/10 text-status-error ring-status-error/20" : 
                              lead.churnRisk.risk_level === 'high' ? "bg-status-warning/10 text-status-warning ring-status-warning/20" : "bg-info/10 text-info ring-info/20"
                            )}>
                              <AlertTriangle className="h-4 w-4" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="p-3 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
                            <div className="space-y-2">
                              <p className="font-black text-[10px] uppercase tracking-widest text-status-error">Risco de Churn Detectado</p>
                              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-status-error" style={{ width: `${lead.churnRisk.risk_score}%` }} />
                              </div>
                              {lead.churnRisk.factors.map((f, i) => (
                                <p key={i} className="text-[10px] font-medium leading-tight text-muted-foreground">• {f}</p>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {/* Factors Insight */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-2.5 rounded-xl bg-accent/50 hover:bg-accent text-muted-foreground transition-all duration-300 ring-1 ring-inset ring-white/5">
                            <Info className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="w-64 p-4 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-border/10 pb-2">
                              <Target className="h-4 w-4 text-primary" />
                              <p className="font-black text-[10px] uppercase tracking-widest">Matriz de Contribuição</p>
                            </div>
                            <div className="space-y-3">
                              {isServerScore ? (
                                <>
                                  {lead.labels && Object.entries(lead.labels).map(([key, val]) => (
                                    <div key={key} className="space-y-1">
                                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                                        <span className="text-muted-foreground">{key}</span>
                                        <span>{String(val)}</span>
                                      </div>
                                      <Progress value={70} className="h-1" />
                                    </div>
                                  ))}
                                  {!lead.labels && (
                                    <FactorBar label="Deal Momentum" value={((lead.factors as unknown as Record<string, number>)).dealValue} maxValue={25} />
                                  )}
                                </>
                              ) : (
                                <>
                                  <FactorBar label="Firmographics" value={((lead.factors as unknown as Record<string, number>)).companySize} maxValue={20} />
                                  <FactorBar label="ICP Fit" value={((lead.factors as unknown as Record<string, number>)).industry} maxValue={15} />
                                  <FactorBar label="Engajamento" value={((lead.factors as unknown as Record<string, number>)).engagement} maxValue={25} />
                                </>
                              )}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>

                      {/* Explain IA Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLeadId(lead.id);
                        }}
                        className="h-10 w-10 rounded-xl bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary transition-all duration-500 shadow-sm"
                      >
                        <Brain className="h-4 w-4" />
                      </Button>

                      {/* Quick Status */}
                      <div className="hidden md:flex flex-col items-end gap-1 px-3">
                        <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Priority Status</span>
                        <div className="flex items-center gap-1.5">
                           <div className={cn("w-1.5 h-1.5 rounded-full", lead.score > 70 ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30")} />
                           <span className={cn("text-[9px] font-black uppercase tracking-widest", lead.score > 70 ? "text-emerald-500" : "text-muted-foreground/60")}>
                             {lead.score > 70 ? "TOP PRIORITY" : "MONITORING"}
                           </span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!explainSaleId} onOpenChange={(o) => !o && setExplainSaleId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-background/95 backdrop-blur-2xl border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <DialogHeader className="border-b border-white/5 pb-4 mb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter italic">
                <Brain className="h-6 w-6 text-primary animate-pulse" />
                Intelligence Profile: {allLeads.find(l => l.bestDealId === explainSaleId)?.name}
              </DialogTitle>
            </div>
          </DialogHeader>
          {explainSaleId && (
            <LeadScoreExplainCard 
              saleId={explainSaleId} 
              churnRisk={allLeads.find(l => l.bestDealId === explainSaleId)?.churnRisk}
              onActionComplete={() => {
                setExplainSaleId(null);
                toast.success("Ação estratégica iniciada!");
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedLeadId} onOpenChange={(o) => !o && setSelectedLeadId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-background/95 backdrop-blur-2xl border-white/10 shadow-2xl">
          <DialogHeader className="border-b border-white/5 pb-4 mb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter italic">
                <UserPlus className="h-6 w-6 text-primary" />
                Dossiê Neural do Lead
              </DialogTitle>
            </div>
          </DialogHeader>
          
          {selectedLeadId && (
            <div className="space-y-8">
               {/* Resumo do Lead */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6 bg-primary/5 border-primary/20 flex flex-col items-center justify-center">
                    <ScoreRing score={allLeads.find(l => l.id === selectedLeadId)?.score || 0} size={100} />
                    <p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Intelligence Score</p>
                  </Card>
                  
                  <Card className="md:col-span-2 p-6 bg-card/40 border-white/5">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter italic">{allLeads.find(l => l.id === selectedLeadId)?.name}</h3>
                        <p className="text-sm text-primary font-bold">{allLeads.find(l => l.id === selectedLeadId)?.company || "Empresa Independente"}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Categoria</p>
                          <Badge className={cn("mt-1", categoryConfig[allLeads.find(l => l.id === selectedLeadId)?.category || 'Cold'].bg)}>
                            {allLeads.find(l => l.id === selectedLeadId)?.category}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Risco de Evasão</p>
                          <p className={cn("text-lg font-black italic", 
                            (allLeads.find(l => l.id === selectedLeadId)?.churnRisk?.risk_score || 0) > 50 ? "text-status-error" : "text-emerald-500"
                          )}>
                            {allLeads.find(l => l.id === selectedLeadId)?.churnRisk?.risk_score || 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
               </div>

               {/* Detalhes de IA - Reusando componente de explicação se tiver deal */}
               {allLeads.find(l => l.id === selectedLeadId)?.bestDealId ? (
                 <div className="pt-6 border-t border-white/5">
                    <LeadScoreExplainCard 
                      saleId={allLeads.find(l => l.id === selectedLeadId)!.bestDealId!} 
                      churnRisk={allLeads.find(l => l.id === selectedLeadId)?.churnRisk}
                      onActionComplete={() => {
                        setSelectedLeadId(null);
                        toast.success("Estratégia executada!");
                      }}
                    />
                 </div>
               ) : (
                 <div className="p-12 text-center bg-accent/5 rounded-2xl border border-dashed border-white/10">
                    <Brain className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Aguardando Primeira Negociação</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">Inicie uma proposta para ativar a análise neural profunda deste lead.</p>
                    <Button className="mt-6 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] px-8">
                      <Zap className="h-3 w-3 mr-2" />
                      Gerar Proposta Preditiva
                    </Button>
                 </div>
               )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LeadScoringDashboard;
