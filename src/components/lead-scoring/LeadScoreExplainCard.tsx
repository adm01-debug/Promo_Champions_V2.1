import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Brain, Sparkles, TrendingUp, Target, Lightbulb, Zap, 
  AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight,
  ChevronDown, ChevronUp, Layers, History, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeadScoreExplanation } from "@/hooks/scoring/useLeadScoreExplanation";
import { useScoreTrend } from "@/hooks/scoring/useScoreTrend";
import { ScoreContributionBar } from "./ScoreContributionBar";
import { ScoreSparkline } from "./ScoreSparkline";
import { formatDelta, priorityBadge } from "./predictiveScoringHelpers";
import { ChurnRisk } from "@/hooks/useLeadScoring";

interface Props {
  saleId: string;
  churnRisk?: ChurnRisk;
  onActionComplete?: () => void;
}

export const LeadScoreExplainCard = React.memo(({ saleId, churnRisk, onActionComplete }: Props) => {
  const { data: exp, isLoading } = useLeadScoreExplanation(saleId);
  const { data: trend = [] } = useScoreTrend(saleId, 30);
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-60 w-full rounded-xl" />
      </div>
    );
  }

  if (!exp) {
    return (
      <Card className="p-8 text-center border-dashed border-2">
        <Brain className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
        <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
          Análise Neural em Processamento...
        </p>
        <p className="text-[10px] text-muted-foreground mt-2">
          A IA está escaneando este lead para gerar insights estratégicos.
        </p>
      </Card>
    );
  }

  const steps = [
    {
      title: "Ponto de Partida: Baseline Neural",
      description: `O modelo inicia com uma pontuação base de ${exp.baseline_score} pontos, calculada a partir da performance histórica média de perfis similares no ICP.`,
      icon: Layers,
      color: "text-blue-500",
      impact: exp.baseline_score
    },
    {
      title: "Análise de Drivers Comportamentais",
      description: "Avaliamos múltiplos sinais de engajamento, fit geográfico e firmográfico para ajustar a pontuação em tempo real.",
      icon: Activity,
      color: "text-primary",
      impact: exp.top_drivers.reduce((acc, d) => acc + d.contribution, 0)
    },
    {
      title: "Resultado Estratégico Final",
      description: `O Lead foi classificado com score de ${exp.score}, representando um desvio de ${formatDelta(exp.score, exp.baseline_score)}.`,
      icon: Target,
      color: "text-emerald-500",
      impact: exp.score
    }
  ];

  const scoreColor =
    exp.score >= 70 ? "text-emerald-500" : exp.score >= 40 ? "text-status-warning" : "text-status-error";

  return (
    <div className="space-y-8">
      {/* Risk Alert if Churn Risk is high/critical */}
      {churnRisk && churnRisk.risk_score > 50 && (
        <Card className="bg-status-error/5 border-status-error/20 overflow-hidden relative shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldAlert className="h-16 w-16 text-status-error" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-status-error flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerta Crítico de Churn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Probabilidade de Evasão</span>
              <span className="text-xl font-black text-status-error italic">{churnRisk.risk_score}%</span>
            </div>
            <Progress value={churnRisk.risk_score} className="h-2 bg-status-error/10" indicatorClassName="bg-status-error shadow-[0_0_10px_rgba(var(--status-error-rgb),0.5)]" />
            <div className="pt-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Brain className="h-3 w-3 text-status-error" /> Principais Fatores de Risco:
              </p>
              <ul className="grid grid-cols-1 gap-1.5">
                {churnRisk.factors.map((f, i) => (
                  <li key={i} className="text-[10px] text-muted-foreground bg-background/50 p-2 rounded border border-status-error/10 flex items-start gap-2 italic">
                    <span className="text-status-error mt-0.5">•</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Neural Explanation Steps */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Como chegamos a este Score?</h4>
        </div>
        
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isExpanded = expandedStep === idx;
            
            return (
              <div 
                key={idx}
                className={cn(
                  "relative p-4 rounded-xl border transition-all duration-300",
                  isExpanded ? "bg-primary/5 border-primary/20" : "bg-card/40 border-white/5 hover:bg-primary/5"
                )}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedStep(isExpanded ? null : idx)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg bg-background/50", step.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black uppercase tracking-widest">{step.title}</h5>
                      <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">Impacto: {step.impact > 0 ? "+" : ""}{step.impact} pts</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
                
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium italic mb-4">
                      {step.description}
                    </p>
                    {idx === 1 && (
                      <div className="grid grid-cols-1 gap-2.5">
                        {exp.top_drivers.map((d) => (
                          <ScoreContributionBar key={d.factor} driver={d} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5">
          <Card className="h-full glass border-white/5 bg-gradient-to-br from-card/80 to-card/40 flex flex-col items-center justify-center p-6 relative overflow-hidden group">
             <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             <div className="relative mb-4">
               <Brain className="h-8 w-8 text-primary/20 absolute -top-4 -right-4 animate-pulse" />
               <span className={cn("text-7xl font-display font-black tracking-tighter italic z-10", scoreColor)}>
                 {exp.score}
               </span>
             </div>
             <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-4 z-10">Intelligence Index</p>
             <div className="w-full space-y-4 z-10">
               <div className="text-center">
                 <p className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 py-1 rounded-full">
                   {formatDelta(exp.score, exp.baseline_score)}
                 </p>
               </div>
               <div className="pt-4 border-t border-white/5">
                 <div className="flex items-center gap-2 mb-2">
                   <History className="h-3 w-3 text-muted-foreground" />
                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Trajetória Recente</span>
                 </div>
                 <ScoreSparkline points={trend} />
               </div>
             </div>
          </Card>
        </div>

        <div className="md:col-span-7 space-y-6">
          {exp.narrative && (
            <Card className="glass border-white/5 bg-primary/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <CardContent className="p-4 flex gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5 animate-pulse" />
                <p className="text-xs leading-relaxed font-medium italic text-muted-foreground">
                  {exp.narrative}
                </p>
              </CardContent>
            </Card>
          )}

          {/* NBA Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-black uppercase tracking-widest text-primary italic">
                  Próxima Melhor Ação
                </h4>
              </div>
              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20">
                IA STRATEGY
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {exp.recommendations.map((r, i) => (
                <Card key={i} className="group relative overflow-hidden hover:border-primary/40 transition-all duration-300 bg-card/40 border-white/5">
                  <CardContent className="p-4 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={cn("text-[9px] font-black uppercase tracking-widest", priorityBadge(r.priority))}>
                        {r.priority === "high" ? "URGENTE" : r.priority === "medium" ? "ESTRATÉGICO" : "MANUTENÇÃO"}
                      </Badge>
                      <span className="text-[10px] text-emerald-500 font-black italic">
                        +{r.expected_lift} LIFT PROJETADO
                      </span>
                    </div>
                    
                    <p className="text-xs font-bold leading-relaxed mb-4">
                      {r.action}
                    </p>

                    <Button 
                      onClick={() => onActionComplete?.()}
                      className="w-full h-9 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-[10px] font-black uppercase tracking-widest transition-all duration-500"
                    >
                      <Zap className="h-3 w-3 mr-2" />
                      Executar Estratégia
                      <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

LeadScoreExplainCard.displayName = "LeadScoreExplainCard";

LeadScoreExplainCard.displayName = "LeadScoreExplainCard";
