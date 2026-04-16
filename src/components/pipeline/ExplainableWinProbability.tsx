import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Brain, TrendingUp, TrendingDown, Clock, DollarSign, Activity, Users, Zap } from "lucide-react";

interface WinProbabilityFactor {
  name: string;
  impact: number; // -100 to +100
  icon: React.ElementType;
  description: string;
}

interface ExplainableWinProbabilityProps {
  probability: number;
  dealAmount: number;
  daysInPipeline: number;
  stage: string;
  hasRecentActivity: boolean;
  isICPMatch: boolean;
  dealCategory?: string;
}

export const ExplainableWinProbability = React.memo(({
  probability,
  dealAmount,
  daysInPipeline,
  stage,
  hasRecentActivity,
  isICPMatch,
  dealCategory,
}: ExplainableWinProbabilityProps) => {
  const factors = useMemo((): WinProbabilityFactor[] => {
    const f: WinProbabilityFactor[] = [];

    // Stage progression
    const stageWeights: Record<string, number> = {
      lead: -20, prospecting: -10, qualified: 10, proposal: 20, negotiation: 30, won: 50,
    };
    const stageImpact = stageWeights[stage] || 0;
    f.push({
      name: "Estágio do Funil",
      impact: stageImpact,
      icon: TrendingUp,
      description: `Deal em "${stage}" — ${stageImpact > 0 ? "avançado" : "estágio inicial"}`,
    });

    // Deal velocity
    const velocityImpact = daysInPipeline < 14 ? 15 : daysInPipeline < 30 ? 0 : daysInPipeline < 60 ? -15 : -30;
    f.push({
      name: "Velocidade do Deal",
      impact: velocityImpact,
      icon: Clock,
      description: `${daysInPipeline} dias no pipeline — ${velocityImpact >= 0 ? "ritmo saudável" : "ciclo longo"}`,
    });

    // Deal size
    const sizeImpact = dealAmount > 100000 ? -10 : dealAmount > 50000 ? -5 : dealAmount > 10000 ? 5 : 10;
    f.push({
      name: "Valor do Deal",
      impact: sizeImpact,
      icon: DollarSign,
      description: `Deals ${dealAmount > 50000 ? "maiores" : "menores"} têm ${sizeImpact > 0 ? "maior" : "menor"} taxa de conversão`,
    });

    // Recent activity
    f.push({
      name: "Atividade Recente",
      impact: hasRecentActivity ? 15 : -20,
      icon: Activity,
      description: hasRecentActivity ? "Interação recente registrada" : "Sem atividade recente — risco de esfriar",
    });

    // ICP match
    f.push({
      name: "Fit com ICP",
      impact: isICPMatch ? 20 : -10,
      icon: Users,
      description: isICPMatch ? "Cliente alinhado ao perfil ideal" : "Cliente fora do perfil ideal",
    });

    return f.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }, [probability, dealAmount, daysInPipeline, stage, hasRecentActivity, isICPMatch]);

  const probColor = probability >= 70
    ? "text-status-success"
    : probability >= 40
      ? "text-status-warning"
      : "text-destructive";

  return (
    <Card className="p-4 glass border-border/40 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h4 className="font-display font-semibold text-sm">Win Probability</h4>
        </div>
        <span className={cn("text-2xl font-display font-bold", probColor)}>
          {probability}%
        </span>
      </div>

      <Progress
        value={probability}
        className="h-2"
      />

      <div className="space-y-2">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Fatores de Influência</p>
        {factors.map((factor) => {
          const Icon = factor.icon;
          const isPositive = factor.impact > 0;
          return (
            <div key={factor.name} className="flex items-start gap-2 py-1">
              <div className={cn(
                "p-1 rounded",
                isPositive ? "bg-status-success/10" : "bg-destructive/10"
              )}>
                <Icon className={cn("h-3 w-3", isPositive ? "text-status-success" : "text-destructive")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{factor.name}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-1",
                      isPositive
                        ? "text-status-success border-status-success/30"
                        : "text-destructive border-destructive/30"
                    )}
                  >
                    {isPositive ? "+" : ""}{factor.impact}%
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{factor.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
});
ExplainableWinProbability.displayName = "ExplainableWinProbability";
