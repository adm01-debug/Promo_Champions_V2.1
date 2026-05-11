import { FC, useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, TrendingUp, Target, Activity, Zap, History, ChevronRight } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ForecastKpiCard 
          label="Pipeline Aberto" 
          value={data.metrics.total_open_pipeline} 
          subtitle={`${data.metrics.open_deals_count} deals em andamento`}
          isCurrency
          icon={Activity}
          color="text-primary"
        />
        <ForecastKpiCard 
          label="Forecast Ponderado" 
          value={data.metrics.weighted_forecast} 
          subtitle={`Ciclo médio: ${data.metrics.avg_cycle_days} dias`}
          isCurrency
          icon={Zap}
          color="text-info"
        />
        <ForecastKpiCard 
          label="Realizado 90d" 
          value={data.metrics.won_amount_90d} 
          subtitle={`${data.metrics.won_count_90d} fechamentos`}
          isCurrency
          icon={Target}
          color="text-emerald-500"
        />
        <Card className="glass overflow-hidden border-white/5 relative">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80">Confiança IA</span>
              <Badge variant="outline" className={cn("h-5 text-[10px]", conf.color)}>
                {conf.label}
              </Badge>
            </div>
            <div className="flex items-baseline gap-1">
              <CountUp value={data.confidence} className="text-3xl font-black font-display tracking-tight" />
              <span className="text-xl font-bold opacity-50">%</span>
            </div>
            <Progress value={data.confidence} className="h-1.5 mt-4" />
          </CardContent>
        </Card>
      </div>

      {data.accuracy && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-success/20 bg-success/5 p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/20 text-success">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold">Alta Precisão de Forecast Detectada</div>
              <div className="text-xs text-muted-foreground">
                O modelo divergiu apenas <span className="text-success font-bold">{data.accuracy.avg_deviation}%</span> no último período.
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-success">{100 - data.accuracy.avg_deviation}%</div>
            <div className="text-[10px] font-bold uppercase tracking-tighter opacity-70">Acurácia Histórica</div>
          </div>
        </motion.div>
      )}

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
