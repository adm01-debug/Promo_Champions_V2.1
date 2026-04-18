import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Trophy, AlertTriangle, Target } from "lucide-react";
import { useCoachingScorecard, useAggregateCoachingScorecard } from "@/hooks/conversational/useCoachingScorecard";
import { ScorecardRadial } from "./ScorecardRadial";
import { ScorecardDimensionsBar } from "./ScorecardDimensionsBar";
import { RecommendationsList } from "./RecommendationsList";
import { HEALTH_LABELS, healthBadgeVariant } from "./coachingHelpers";

interface Props { recordingId: string }

export const CoachingScorecardCard = ({ recordingId }: Props) => {
  const { data, isLoading } = useCoachingScorecard(recordingId);
  const aggregate = useAggregateCoachingScorecard();

  return (
    <Card className="p-4 space-y-4 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Coaching Scorecard</h3>
          {data && (
            <Badge variant={healthBadgeVariant(data.health) as "destructive" | "warning" | "info" | "high"}>
              {HEALTH_LABELS[data.health]}
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => aggregate.mutate(recordingId)}
          disabled={aggregate.isPending}
          className="gap-1 h-7"
        >
          <RefreshCw className={`h-3 w-3 ${aggregate.isPending ? "animate-spin" : ""}`} />
          {data ? "Recalcular" : "Calcular"}
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48" />
      ) : !data ? (
        <p className="text-xs text-muted-foreground py-4 text-center">
          Scorecard não calculado. Clique em "Calcular" para gerar.
        </p>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <ScorecardRadial score={data.overall_score} health={data.health} />
            <div className="flex-1 w-full">
              <ScorecardDimensionsBar
                talk={data.talk_score}
                questions={data.question_score}
                objections={data.objection_score}
                sentiment={data.sentiment_score}
                moments={data.moments_score}
              />
            </div>
          </div>

          {(data.top_strengths?.length || data.top_gaps?.length) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2 rounded-md border border-success/30 bg-success/5">
                <div className="flex items-center gap-1 mb-1">
                  <Trophy className="h-3 w-3 text-success" />
                  <span className="text-[10px] uppercase tracking-wider text-success font-medium">Forças</span>
                </div>
                <ul className="text-xs space-y-0.5">
                  {data.top_strengths?.map((s, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="truncate">{s.label}</span>
                      <span className="tabular-nums text-muted-foreground">{Math.round(s.score)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-2 rounded-md border border-warning/30 bg-warning/5">
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-3 w-3 text-warning" />
                  <span className="text-[10px] uppercase tracking-wider text-warning font-medium">Gaps</span>
                </div>
                <ul className="text-xs space-y-0.5">
                  {data.top_gaps?.map((g, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="truncate">{g.label}</span>
                      <span className="tabular-nums text-muted-foreground">{Math.round(g.score)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Recomendações priorizadas
            </p>
            <RecommendationsList recommendations={data.recommendations ?? []} />
          </div>
        </>
      )}
    </Card>
  );
};
