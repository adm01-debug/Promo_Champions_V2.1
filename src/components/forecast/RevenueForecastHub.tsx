import { FC, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, TrendingUp, Target, Activity } from "lucide-react";
import { useRevenueForecast } from "@/hooks/forecast/useRevenueForecast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  type ForecastHorizon,
  formatCompactBRL,
  horizonOptions,
  confidenceLabel,
} from "./forecastHelpers";
import { ScenarioCard } from "./ScenarioCard";
import { ForecastNarrativeCard } from "./ForecastNarrativeCard";
import { PipelineContributionChart } from "./PipelineContributionChart";
import { ForecastScenarioSimulator } from "./ForecastScenarioSimulator";

export const RevenueForecastHub: FC = () => {
  const [horizon, setHorizon] = useState<ForecastHorizon>(30);
  const { data, isLoading, isFetching, refetch } = useRevenueForecast({ horizonDays: horizon });

  const { data: salespeople } = useQuery({
    queryKey: ["salespeople-public-names"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salespeople_public")
        .select("id, name");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10 * 60_000,
  });

  const ownerNames = useMemo(() => {
    const map: Record<string, string> = {};
    (salespeople ?? []).forEach((s) => {
      if (s.id && s.name) map[s.id] = s.name;
    });
    return map;
  }, [salespeople]);

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const conf = confidenceLabel(data.confidence);
  const goalProgress = data.metrics.goal_for_horizon > 0
    ? Math.min(100, (data.scenarios.realistic / data.metrics.goal_for_horizon) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Revenue Forecast Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Projeção de receita combinando pipeline ponderado, ciclo de venda e meta.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex h-9 items-center rounded-lg border bg-background/60 p-1">
            {horizonOptions.map((o) => (
              <button
                key={o.value}
                onClick={() => setHorizon(o.value)}
                className={`px-3 h-7 rounded-md text-xs font-medium transition-colors ${
                  horizon === o.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </motion.div>
      
      <div className="flex justify-end mb-2">
        <Button 
          variant="glow" 
          size="sm" 
          className="h-8 text-[10px] font-black uppercase tracking-widest gap-2"
          onClick={async () => {
             const { error } = await (supabase as any).from('forecast_snapshots').insert({
               horizon_days: horizon,
               pessimistic_value: data.scenarios.pessimistic,
               realistic_value: data.scenarios.realistic,
               optimistic_value: data.scenarios.optimistic,
               confidence_at_time: data.confidence,
               metadata: { source: 'manual_trigger' }
             });
             if (!error) refetch();
          }}
        >
          <Activity className="h-3 w-3" />
          Registrar Snapshot
        </Button>
      </div>

      {/* KPIs principais */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Pipeline aberto</div>
            <div className="font-display text-xl font-semibold mt-1">
              {formatCompactBRL(data.metrics.total_open_pipeline)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {data.metrics.open_deals_count} deals
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Forecast ponderado</div>
            <div className="font-display text-xl font-semibold mt-1 text-primary">
              {formatCompactBRL(data.metrics.weighted_forecast)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              ciclo médio {data.metrics.avg_cycle_days}d
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Ganho 90d</div>
            <div className="font-display text-xl font-semibold mt-1 text-emerald-500">
              {formatCompactBRL(data.metrics.won_amount_90d)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {data.metrics.won_count_90d} fechamentos
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Confiança</div>
              <Badge variant="outline" className={`h-5 text-[10px] ${conf.color}`}>
                {conf.label}
              </Badge>
            </div>
            <div className="font-display text-xl font-semibold mt-1">{data.confidence}%</div>
            <Progress value={data.confidence} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        {data.accuracy && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Precisão histórica</div>
                <Badge variant="outline" className="h-5 text-[10px] bg-success/10 text-success">
                  {data.accuracy.last_period_accuracy}%
                </Badge>
              </div>
              <div className="font-display text-xl font-semibold mt-1">
                {100 - data.accuracy.avg_deviation}%
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                Tendência: <span className="font-bold text-primary">{data.accuracy.trend === 'improving' ? 'Melhorando' : 'Estável'}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cenários */}
      <div className="grid gap-3 md:grid-cols-3">
        <ScenarioCard
          scenario="pessimistic"
          value={data.scenarios.pessimistic}
          goal={data.metrics.goal_for_horizon}
          index={0}
        />
        <ScenarioCard
          scenario="realistic"
          value={data.scenarios.realistic}
          goal={data.metrics.goal_for_horizon}
          index={1}
        />
        <ScenarioCard
          scenario="optimistic"
          value={data.scenarios.optimistic}
          goal={data.metrics.goal_for_horizon}
          index={2}
        />
      </div>

      {/* Meta vs Forecast */}
      {data.metrics.goal_for_horizon > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Meta de {horizon} dias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Realista: <strong className="text-foreground">{formatCompactBRL(data.scenarios.realistic)}</strong>
              </span>
              <span className="text-muted-foreground">
                Meta: <strong className="text-foreground">{formatCompactBRL(data.metrics.goal_for_horizon)}</strong>
              </span>
            </div>
            <Progress value={goalProgress} className="h-2" />
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Activity className="h-3 w-3" />
              Gap: {data.metrics.gap_to_goal > 0
                ? `faltam ${formatCompactBRL(data.metrics.gap_to_goal)}`
                : `superávit de ${formatCompactBRL(Math.abs(data.metrics.gap_to_goal))}`}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simulador What-If */}
      <ForecastScenarioSimulator 
        baseForecast={data.scenarios.realistic}
        baseCoverage={data.metrics.total_open_pipeline / (data.metrics.goal_for_horizon || 1)}
        baseWinRate={data.metrics.goal_for_horizon > 0 ? (data.scenarios.realistic / data.metrics.total_open_pipeline) : 0.2}
      />

      {/* Insights IA */}
      <ForecastNarrativeCard
        narrative={data.narrative}
        risks={data.risks}
        opportunities={data.opportunities}
      />

      {/* Contribuição por vendedor */}
      <PipelineContributionChart perOwner={data.per_owner} ownerNames={ownerNames} />
    </div>
  );
};
