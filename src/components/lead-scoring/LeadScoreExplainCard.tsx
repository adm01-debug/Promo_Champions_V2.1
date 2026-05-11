import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Sparkles, TrendingUp, Target, Lightbulb, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeadScoreExplanation } from "@/hooks/scoring/useLeadScoreExplanation";
import { useScoreTrend } from "@/hooks/scoring/useScoreTrend";
import { ScoreContributionBar } from "./ScoreContributionBar";
import { ScoreSparkline } from "./ScoreSparkline";
import { formatDelta, priorityBadge } from "./predictiveScoringHelpers";

interface Props {
  saleId: string;
}

export const LeadScoreExplainCard = React.memo(({ saleId }: Props) => {
  const { data: exp, isLoading } = useLeadScoreExplanation(saleId);
  const { data: trend = [] } = useScoreTrend(saleId, 30);

  if (isLoading) {
    return (
      <Card className="p-5 space-y-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  if (!exp) {
    return (
      <Card className="p-5">
        <p className="text-sm text-muted-foreground">Explicação ainda não disponível para este deal.</p>
      </Card>
    );
  }

  const scoreColor =
    exp.score >= 70 ? "text-status-success" : exp.score >= 40 ? "text-status-warning" : "text-destructive";

  return (
    <Card className="p-5 glass border-border/40 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Predictive Score IA
            </h3>
          </div>
          <div className="flex items-baseline gap-3">
            <span className={cn("text-5xl font-display font-bold tabular-nums", scoreColor)}>
              {exp.score}
            </span>
            <span className="text-xs text-muted-foreground">{formatDelta(exp.score, exp.baseline_score)}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">30 dias</p>
          <ScoreSparkline points={trend} />
        </div>
      </div>

      {/* Narrative */}
      {exp.narrative && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 flex gap-2">
          <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed">{exp.narrative}</p>
        </div>
      )}

      {/* Drivers */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Por que esse score?
          </h4>
        </div>
        <div className="space-y-2.5">
          {exp.top_drivers.map((d) => (
            <ScoreContributionBar key={d.factor} driver={d} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {exp.recommendations.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-3.5 w-3.5 text-muted-foreground" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Próximas ações para subir o score
            </h4>
          </div>
          <ul className="space-y-2">
            {/* NBA Badge */}
            <div className="flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded bg-primary/10 w-fit">
              <Zap className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">Next Best Action (NBA)</span>
            </div>
            {exp.recommendations.map((r, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 p-2.5 rounded-md bg-muted/40 border border-border/40"
              >
                <Target className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-relaxed">{r.action}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", priorityBadge(r.priority))}>
                      {r.priority === "high" ? "Alta" : r.priority === "medium" ? "Média" : "Baixa"}
                    </Badge>
                    <span className="text-[10px] text-status-success font-mono">
                      lift esperado +{r.expected_lift} pts
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
});
LeadScoreExplainCard.displayName = "LeadScoreExplainCard";
