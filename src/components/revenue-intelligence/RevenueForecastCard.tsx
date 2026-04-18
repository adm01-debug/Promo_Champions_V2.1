import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, RefreshCw, Target, TrendingUp, TrendingDown } from "lucide-react";
import {
  useRevenueForecast,
  useGenerateForecast,
  ForecastPeriodType,
} from "@/hooks/revenue-intelligence/useRevenueForecast";
import { PeriodSelector } from "./PeriodSelector";
import { ForecastScenarioBar } from "./ForecastScenarioBar";
import { formatBRL } from "./forecastHelpers";

interface Props {
  periodType: ForecastPeriodType;
  periodStart: string;
  onChangeType: (t: ForecastPeriodType) => void;
  onChangeStart: (s: string) => void;
  ownerId?: string | null;
}

export const RevenueForecastCard: FC<Props> = ({
  periodType,
  periodStart,
  onChangeType,
  onChangeStart,
  ownerId,
}) => {
  const { data, isLoading } = useRevenueForecast(periodType, periodStart, ownerId);
  const gen = useGenerateForecast();

  const handleRefresh = () =>
    gen.mutate({ period_type: periodType, period_start: periodStart, owner_id: ownerId ?? null });

  const gap = data?.gap_to_goal ?? 0;
  const isAboveGoal = gap <= 0;

  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="font-display">AI Forecast Engine</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <PeriodSelector
              periodType={periodType}
              periodStart={periodStart}
              onChangeType={onChangeType}
              onChangeStart={onChangeStart}
            />
            <Button onClick={handleRefresh} disabled={gen.isPending} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${gen.isPending ? "animate-spin" : ""}`} />
              Recalcular
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-12" />
          </div>
        ) : !data ? (
          <div className="text-center py-10 space-y-3">
            <p className="text-sm text-muted-foreground">
              Nenhum forecast gerado para este período. Clique em "Recalcular" para gerar com IA.
            </p>
            <Button onClick={handleRefresh} disabled={gen.isPending}>
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Forecast
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                <div className="text-xs uppercase tracking-wide text-emerald-600 font-medium">Commit</div>
                <div className="text-2xl font-display font-bold mt-1">{formatBRL(data.commit_amount)}</div>
                <div className="text-xs text-muted-foreground mt-1">Alta confiança</div>
              </div>
              <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
                <div className="text-xs uppercase tracking-wide text-blue-600 font-medium">Best Case</div>
                <div className="text-2xl font-display font-bold mt-1">{formatBRL(data.best_case_amount)}</div>
                <div className="text-xs text-muted-foreground mt-1">Provável</div>
              </div>
              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <div className="text-xs uppercase tracking-wide text-amber-600 font-medium">Upside</div>
                <div className="text-2xl font-display font-bold mt-1">{formatBRL(data.upside_amount)}</div>
                <div className="text-xs text-muted-foreground mt-1">Cenário otimista</div>
              </div>
            </div>

            <ForecastScenarioBar
              commit={data.commit_amount}
              best={data.best_case_amount}
              upside={data.upside_amount}
              goal={data.goal_amount}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Meta: {formatBRL(data.goal_amount)}</span>
                <Badge variant={isAboveGoal ? "default" : "destructive"} className="gap-1">
                  {isAboveGoal ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {isAboveGoal ? "+" : ""}
                  {formatBRL(Math.abs(gap))}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Confiança</span>
                <div className="relative h-2 w-24 rounded-full bg-muted overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary"
                    style={{ width: `${data.confidence_score}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{data.confidence_score}%</span>
              </div>
              <Badge variant="outline">{data.deals_count} deals</Badge>
            </div>

            {data.ai_summary && (
              <div className="p-3 rounded-md bg-primary/5 border border-primary/20 text-sm">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-foreground/90">{data.ai_summary}</p>
                </div>
              </div>
            )}

            {data.factors && data.factors.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Fatores principais
                </p>
                <div className="grid gap-2 md:grid-cols-3">
                  {data.factors.slice(0, 3).map((f, i) => (
                    <div key={i} className="p-2 rounded-md bg-muted/50 border border-border/40 text-xs">
                      <div className="font-medium flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className={
                            f.impact === "positive"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                              : f.impact === "negative"
                              ? "bg-destructive/10 text-destructive border-destructive/30"
                              : ""
                          }
                        >
                          {f.impact}
                        </Badge>
                        <span>{f.label}</span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{f.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
