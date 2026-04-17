import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Sparkles } from "lucide-react";
import { useDealHealth, useDealHealthHistory, useRecalculateDealHealth } from "@/hooks/deal-intelligence/useDealHealth";
import { DealHealthScoreBadge } from "./DealHealthScoreBadge";
import { DealHealthFactorsList } from "./DealHealthFactorsList";
import { DealHealthSparkline } from "./DealHealthSparkline";
import { tierLabel, tierRingColor, priorityColor, priorityLabel, formatScore } from "./dealHealthHelpers";

interface Props {
  saleId: string;
}

export function DealHealthCard({ saleId }: Props) {
  const { data, isLoading } = useDealHealth(saleId);
  const { data: history } = useDealHealthHistory(saleId);
  const recalc = useRecalculateDealHealth();

  if (isLoading) {
    return (
      <Card variant="elevated" className="glass border-border/40">
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card variant="elevated" className="glass border-border/40">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Saúde do Deal
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-3">Score ainda não calculado</p>
          <Button
            size="sm"
            onClick={() => recalc.mutate({ saleId })}
            disabled={recalc.isPending}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            Calcular agora
          </Button>
        </CardContent>
      </Card>
    );
  }

  const score = data.health_score;
  const tier = data.tier;
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="gradient-text">Saúde do Deal</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => recalc.mutate({ saleId })}
            disabled={recalc.isPending}
            className="h-7 w-7 p-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${recalc.isPending ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Ring */}
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
              <circle cx="44" cy="44" r="38" className="stroke-muted fill-none" strokeWidth="6" />
              <circle
                cx="44" cy="44" r="38"
                className={`fill-none ${tierRingColor(tier)} transition-all duration-700`}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-display font-bold tabular-nums">{Math.round(score)}</span>
              <span className="text-[10px] text-muted-foreground">{formatScore(score)}</span>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            <DealHealthScoreBadge score={score} tier={tier} size="md" showLabel />
            <p className="text-xs text-muted-foreground">{tierLabel(tier)} · {data.days_in_stage ?? 0} dias no estágio</p>
            {data.ai_recommendation && (
              <p className="text-xs text-foreground/80 line-clamp-2 italic">"{data.ai_recommendation}"</p>
            )}
          </div>
        </div>

        {/* Sparkline */}
        {history && history.length > 1 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Evolução</p>
            <DealHealthSparkline history={history} />
          </div>
        )}

        {/* Factors */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Fatores</p>
          <DealHealthFactorsList factors={data.factors || []} />
        </div>

        {/* Recommended Actions */}
        {data.recommended_actions && data.recommended_actions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Ações recomendadas</p>
            <div className="space-y-1.5">
              {data.recommended_actions.map((a, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg glass border border-border/30">
                  <Badge variant="outline" className={`text-[10px] ${priorityColor(a.priority)}`}>
                    {priorityLabel(a.priority)}
                  </Badge>
                  <span className="text-xs flex-1">{a.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
