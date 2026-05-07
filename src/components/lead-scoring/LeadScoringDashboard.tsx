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


      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass border-border/40">
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <ScoreRing score={avgScore} />
            <div>
              <p className="text-xs text-muted-foreground">Score Médio</p>
              <p className="font-display font-bold text-lg">{avgScore}</p>
            </div>
          </CardContent>
        </Card>
        {([
          { cat: "Hot" as const, count: hotCount },
          { cat: "Warm" as const, count: warmCount },
          { cat: "Cold" as const, count: coldCount },
        ]).map(({ cat, count }) => {
          const cfg = categoryConfig[cat];
          const Icon = cfg.icon;
          return (
            <Card key={cat} className={cn("glass border", cfg.bg)}>
              <CardContent className="pt-4 pb-3 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", cfg.bg)}>
                  <Icon className={cn("h-5 w-5", cfg.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{cfg.label}</p>
                  <p className="font-display font-bold text-lg">{count}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ranking Table */}
      <Card className="glass border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-primary" />
            Ranking de Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                      "flex items-center gap-4 p-3 rounded-lg border transition-all hover:bg-accent/50",
                      idx === 0 && "bg-primary/5 border-primary/20",
                      idx > 0 && "border-border/40"
                    )}
                  >
                    {/* Rank */}
                    <span className={cn(
                      "font-display font-bold text-sm w-6 text-center shrink-0",
                      idx < 3 ? "text-primary" : "text-muted-foreground"
                    )}>
                      #{idx + 1}
                    </span>

                    {/* Score Ring */}
                    <ScoreRing score={lead.score} size={44} />

                    {/* Lead Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm truncate">{lead.name}</h4>
                        <Badge variant="outline" className={cn("text-[10px] shrink-0", cfg.bg)}>
                          <Icon className={cn("h-3 w-3 mr-1", cfg.color)} />
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {lead.company || lead.email || "Sem empresa"}
                      </p>
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
