import { FC, useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  RefreshCw, 
  TrendingUp, 
  Target, 
  Activity, 
  Zap, 
  History, 
  ChevronRight, 
  ShieldCheck,
  BrainCircuit,
  Workflow,
  Sparkles,
  BarChart3,
  CalendarDays,
  Microchip,
  Waves,
  LucideIcon
} from "lucide-react";
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
import { CategoryForecastCard } from "./CategoryForecastCard";
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
      <div className="space-y-6">
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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Neural Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary animate-pulse">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <Badge variant="live" className="h-6 gap-1.5 px-3 bg-primary/20 text-primary border-primary/30 font-black tracking-widest uppercase text-[10px]">
              <Sparkles className="h-3 w-3" /> Neural Forecast Hub
            </Badge>
          </div>
          <h1 className="font-display text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground">
            Revenue Intelligence 10/10
          </h1>
          <p className="text-muted-foreground max-w-lg leading-relaxed font-medium">
            Projeção neural multivariada combinando telemetria de pipeline, ciclo de vida de deals e metas estratégicas.
          </p>
        </motion.div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm p-1 rounded-xl border border-white/10 shadow-sm">
            {horizonOptions.map((o) => (
              <button
                key={o.value}
                onClick={() => setHorizon(o.value)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                  horizon === o.value
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-9 w-9 p-0 rounded-xl border-white/10 bg-background/50"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </Button>
            <Button 
              variant="glow" 
              size="sm" 
              className="h-9 px-4 text-[10px] font-black uppercase tracking-widest gap-2 rounded-xl"
              onClick={async () => {
                 const start = new Date().toISOString().split('T')[0];
                 const end = new Date(Date.now() + horizon * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                 const { error } = await supabase.from('forecast_snapshots').insert([{
                   period_start: start,
                   period_end: end,
                   commit_amount: data.scenarios.pessimistic,
                   weighted_amount: data.scenarios.realistic,
                   best_case_amount: data.scenarios.optimistic,
                   forecast_amount: data.scenarios.realistic,
                   forecast_deals: data.metrics.open_deals_count,
                   source: 'manual_trigger',
                   segment: 'all'
                 }]);
                 if (!error) refetch();
              }}
            >
              <Workflow className="h-3.5 w-3.5" />
               Snapshot Neural
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Core Metrics */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <ForecastKpiCard 
              label="Pipeline Neural" 
              value={data.metrics.total_open_pipeline} 
              subtitle={`${data.metrics.open_deals_count} conexões ativas`}
              isCurrency
              icon={Waves}
              color="text-primary"
            />
            <ForecastKpiCard 
              label="Forecast Ponderado" 
              value={data.metrics.weighted_forecast} 
              subtitle={`Ciclo: ${data.metrics.avg_cycle_days} dias`}
              isCurrency
              icon={Zap}
              color="text-info"
            />
            <ForecastKpiCard 
              label="Performance 90d" 
              value={data.metrics.won_amount_90d} 
              subtitle={`${data.metrics.won_count_90d} fechamentos`}
              isCurrency
              icon={BarChart3}
              color="text-emerald-500"
            />
          </div>

          {/* Scenarios - Neural Layout */}
          <div className="grid gap-4 md:grid-cols-4">
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
            <CategoryForecastCard 
              categories={data.metrics.categories}
              goal={data.metrics.goal_for_horizon}
            />
          </div>

          {/* Simulator & Forecast Chart */}
          <div className="grid grid-cols-1 gap-6">
            <ForecastScenarioSimulator 
              baseForecast={data.scenarios.realistic}
              baseCoverage={data.metrics.total_open_pipeline / (data.metrics.goal_for_horizon || 1)}
              baseWinRate={data.metrics.goal_for_horizon > 0 ? (data.scenarios.realistic / data.metrics.total_open_pipeline) : 0.2}
            />
            <PipelineContributionChart perOwner={data.per_owner} ownerNames={ownerNames} />
          </div>
        </div>

        {/* Right Column - IA Insights & Meta */}
        <div className="space-y-6">
          {/* Confidence Shield */}
          <Card className="glass overflow-hidden border-primary/20 relative group p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Motor de Confiança</span>
              <Badge variant="outline" className={cn("h-5 text-[10px] font-bold border-white/10", conf.color)}>
                {conf.label}
              </Badge>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <div className="relative h-24 w-24 flex items-center justify-center">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="45" 
                      fill="none" stroke="currentColor" 
                      strokeWidth="8" className="text-white/5" 
                    />
                    <motion.circle 
                      cx="50" cy="50" r="45" 
                      fill="none" stroke="currentColor" 
                      strokeWidth="8" strokeDasharray="283"
                      strokeDashoffset={283 - (283 * data.confidence) / 100}
                      className="text-primary"
                      initial={{ strokeDashoffset: 283 }}
                      animate={{ strokeDashoffset: 283 - (283 * data.confidence) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black">{data.confidence}%</span>
                    <span className="text-[8px] font-bold uppercase tracking-tighter opacity-50 text-muted-foreground">Neural Score</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed px-4">
                O modelo de predição processou {data.metrics.open_deals_count} variáveis para este horizonte.
              </p>
            </div>
          </Card>

          {/* Goal Progress Shield */}
          {data.metrics.goal_for_horizon > 0 && (
            <Card className="glass border-white/5 p-6 overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 opacity-5">
                <Target className="h-24 w-24" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <Target className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Meta Estratégica</span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground">{horizon} dias</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground font-medium">Progresso Realista</span>
                    <span className="font-black text-primary">{goalProgress.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={goalProgress} 
                    className="h-2 bg-white/5" 
                    indicatorClassName="bg-gradient-to-r from-primary/50 to-primary shadow-[0_0_10px_rgba(147,51,234,0.3)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold uppercase tracking-tighter text-muted-foreground">Meta Alvo</span>
                    <div className="text-xs font-black">{formatCompactBRL(data.metrics.goal_for_horizon)}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold uppercase tracking-tighter text-muted-foreground">Gap Atual</span>
                    <div className={cn("text-xs font-black", data.metrics.gap_to_goal > 0 ? "text-destructive" : "text-emerald-500")}>
                      {data.metrics.gap_to_goal > 0 ? `-${formatCompactBRL(data.metrics.gap_to_goal)}` : "META OK"}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Accuracy Pulse */}
          {data.accuracy && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-12 w-12" />
              </div>
              <div className="flex flex-col gap-3 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500">
                    <Microchip className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Acurácia Histórica</span>
                </div>
                <div>
                  <div className="text-3xl font-black text-emerald-500 tracking-tighter">{100 - data.accuracy.avg_deviation}%</div>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-tight font-medium">
                    Desvio médio de apenas {data.accuracy.avg_deviation}% em relação ao faturamento real.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* IA Insights Container */}
          <ForecastNarrativeCard
            narrative={data.narrative}
            risks={data.risks}
            opportunities={data.opportunities}
          />
        </div>
      </div>
    </div>
  );
};

function ForecastKpiCard({
  label,
  value,
  subtitle,
  isCurrency = false,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  subtitle?: string;
  isCurrency?: boolean;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <Card className="glass overflow-hidden border-white/5 relative group p-6">
      <div className={cn("absolute -right-6 -top-6 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-full", color.replace('text-', 'bg-'))} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">{label}</span>
          <div className={cn("p-2 rounded-xl bg-background/50 border border-white/5 shadow-inner", color)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            {isCurrency && <span className="text-xl font-bold opacity-30">R$</span>}
            <CountUp value={value} isCompact className="text-4xl font-black font-display tracking-tighter" />
          </div>
          {subtitle && (
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
              <CalendarDays className="h-3 w-3" />
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

const CountUp = ({ value, className, isCompact = false }: { value: number; className?: string; isCompact?: boolean }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      const current = easeOutExpo * (end - start) + start;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const formatted = isCompact 
    ? formatCompactBRL(displayValue).replace('R$', '').trim()
    : Math.round(displayValue).toLocaleString("pt-BR");

  return (
    <span className={className}>
      {formatted}
    </span>
  );
};
