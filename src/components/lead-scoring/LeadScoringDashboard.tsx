import { useState } from "react";
import { useLeadScoring } from "@/hooks/useLeadScoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Flame, Thermometer, Snowflake, BarChart3, Info, Brain, RefreshCw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LeadScoreExplainCard } from "./LeadScoreExplainCard";
import { useExplainBatch } from "@/hooks/scoring/useExplainBatch";
import { cn } from "@/lib/utils";

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
  const { data: leads, isLoading } = useLeadScoring();
  const [explainSaleId, setExplainSaleId] = useState<string | null>(null);
  const explainBatch = useExplainBatch();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold">Lead Scoring</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const allLeads = leads || [];
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
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-12 px-6 rounded-xl border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            onClick={() => {
              const ids = allLeads.map((l) => l.bestDealId).filter(Boolean) as string[];
              if (ids.length > 0) explainBatch.mutate(ids.slice(0, 50));
            }}
            disabled={explainBatch.isPending}
          >
            <Brain className={cn("h-4 w-4 mr-2", explainBatch.isPending && "animate-spin")} />
            Neural Analysis
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


      {/* Elite Ranking Table */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border border-border/20 shadow-2xl backdrop-blur-md rounded-2xl">
        <CardHeader className="p-6 border-b border-border/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter italic">
              <BarChart3 className="h-5 w-5 text-primary" />
              Strategic Lead Ranking
            </CardTitle>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/30 border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">REAL-TIME DATA</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {allLeads.length === 0 ? (

            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhum lead pontuado</p>
              <p className="text-sm mt-1">Adicione clientes e deals para ver o scoring automático</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allLeads.map((lead, idx) => {
                const cfg = categoryConfig[lead.category];
                const Icon = cfg.icon;
                const isServerScore = "dealValue" in lead.factors;

                return (
                  <div key={lead.id}
                    className={cn(
                      "group relative flex items-center gap-6 p-4 rounded-xl transition-all duration-300",
                      "border border-transparent hover:border-border/50 hover:bg-accent/30 hover:shadow-xl",
                      idx === 0 && "bg-primary/5 border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.05)]"
                    )}
                  >
                    {/* Futuristic Rank Indicator */}
                    <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
                      <span className={cn(
                        "font-display font-black text-lg tracking-tighter z-10 italic",
                        idx < 3 ? "text-primary" : "text-muted-foreground/40"
                      )}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      {idx < 3 && <div className="absolute inset-0 bg-primary/10 rounded-lg rotate-45 scale-75 blur-[2px]" />}
                    </div>

                    {/* Enhanced Score Ring */}
                    <div className="shrink-0 scale-110 group-hover:scale-125 transition-transform duration-500">
                      <ScoreRing score={lead.score} size={48} />
                    </div>

                    {/* Strategic Lead Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-display font-black text-base uppercase tracking-tighter truncate group-hover:text-primary transition-colors">
                          {lead.name}
                        </h4>
                        <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-none", cfg.bg, cfg.color)}>
                          {cfg.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest truncate">
                          {lead.company || lead.email || "UNIDENTIFIED SECTOR"}
                        </p>
                      </div>
                    </div>


                    {/* Factors */}
                    {isServerScore ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-1.5 rounded-md hover:bg-muted shrink-0">
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <div className="space-y-2 p-1">
                            <p className="font-semibold text-xs mb-2">Fatores do Score</p>
                            {lead.labels && Object.entries(lead.labels).map(([key, val]) => (
                              <div key={key} className="text-xs">
                                <span className="text-muted-foreground">{key}: </span>
                                <span>{String(val)}</span>
                              </div>
                            ))}
                            {!lead.labels && (
                              <FactorBar label="Valor do Deal" value={((lead.factors as unknown as Record<string, number>)).dealValue} maxValue={25} />
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-1.5 rounded-md hover:bg-muted shrink-0">
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <div className="space-y-2 p-1">
                            <p className="font-semibold text-xs mb-2">Fatores Locais</p>
                            <FactorBar label="Empresa" value={((lead.factors as unknown as Record<string, number>)).companySize} maxValue={20} />
                            <FactorBar label="Indústria" value={((lead.factors as unknown as Record<string, number>)).industry} maxValue={15} />
                            <FactorBar label="Engajamento" value={((lead.factors as unknown as Record<string, number>)).engagement} maxValue={25} />
                            <FactorBar label="Origem" value={((lead.factors as unknown as Record<string, number>)).source} maxValue={10} />
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Explain IA */}
                    {lead.bestDealId && (
                      <button
                        onClick={() => setExplainSaleId(lead.bestDealId!)}
                        className="p-1.5 rounded-md hover:bg-primary/10 shrink-0 group"
                        aria-label="Explicar score com IA"
                      >
                        <Brain className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                      </button>
                    )}

                    {/* Trend */}
                    <div className="hidden md:flex items-center gap-1 text-xs text-status-success shrink-0">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>Ativo</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!explainSaleId} onOpenChange={(o) => !o && setExplainSaleId(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Explicação do Score
            </DialogTitle>
          </DialogHeader>
          {explainSaleId && <LeadScoreExplainCard saleId={explainSaleId} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LeadScoringDashboard;
