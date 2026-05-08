import React, { FC, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, DollarSign, Target, AlertTriangle, ArrowUpRight, ArrowDownRight, Clock, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO, startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const STAGE_PROBABILITIES: Record<string, number> = {
  pending: 0.10,
  lead: 0.05,
  prospecting: 0.15,
  qualified: 0.30,
  proposal: 0.50,
  negotiation: 0.70,
};

interface SaleRow {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  salesperson_id: string | null;
}

interface GoalRow {
  salesperson_id: string;
  goal_amount: number;
}

function useRevenueForecastData() {
  return useQuery({
    queryKey: ['revenue-forecast-analytics'],
    queryFn: async () => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Fetch current month sales, pipeline deals, goals, and 6 months history in parallel
      const sixMonthsAgo = subMonths(now, 6);

      const [salesRes, pipelineRes, goalsRes, historyRes] = await Promise.all([
        supabase.from('sales').select('id, amount, status, created_at, salesperson_id')
          .eq('status', 'completed')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString()),
        supabase.from('sales').select('id, amount, status, created_at, salesperson_id')
          .not('status', 'in', '("completed","lost","cancelled")'),
        supabase.from('sales_goals').select('salesperson_id, goal_amount'),
        supabase.from('sales').select('id, amount, status, created_at')
          .eq('status', 'completed')
          .gte('created_at', sixMonthsAgo.toISOString()),
      ]);

      return {
        currentSales: (salesRes.data || []) as SaleRow[],
        pipeline: (pipelineRes.data || []) as SaleRow[],
        goals: (goalsRes.data || []) as GoalRow[],
        history: (historyRes.data || []) as SaleRow[],
        now,
        monthStart,
        monthEnd,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export const RevenueForecast: FC = () => {
  const { data, isLoading } = useRevenueForecastData();

  const forecast = useMemo(() => {
    if (!data) return null;
    const { currentSales, pipeline, goals, history, now, monthStart, monthEnd } = data;

    // Current month revenue
    const currentRevenue = currentSales.reduce((sum, s) => sum + Number(s.amount), 0);
    const totalGoal = goals.reduce((sum, g) => sum + Number(g.goal_amount), 0);

    // Time-based projection
    const daysPassed = Math.max(1, differenceInDays(now, monthStart));
    const daysRemaining = differenceInDays(monthEnd, now);
    const totalDays = daysPassed + daysRemaining;
    const dailyAvg = currentRevenue / daysPassed;
    const linearProjection = currentRevenue + dailyAvg * daysRemaining;

    // Weighted pipeline forecast
    const weightedPipeline = pipeline.reduce((sum, d) => {
      const prob = STAGE_PROBABILITIES[d.status] || 0.1;
      return sum + Number(d.amount) * prob;
    }, 0);

    // Combined forecast (60% linear + 40% pipeline)
    const combinedForecast = linearProjection * 0.6 + (currentRevenue + weightedPipeline) * 0.4;

    // Pipeline by stage
    const stages = Object.keys(STAGE_PROBABILITIES);
    const pipelineByStage = stages.map(stage => {
      const deals = pipeline.filter(d => d.status === stage);
      const total = deals.reduce((sum, d) => sum + Number(d.amount), 0);
      const weighted = total * (STAGE_PROBABILITIES[stage] || 0.1);
      return { stage, count: deals.length, total, weighted, probability: (STAGE_PROBABILITIES[stage] || 0.1) * 100 };
    }).filter(s => s.count > 0);

    // Historical monthly revenue for trend chart
    const monthlyHistory: Record<string, number> = {};
    history.forEach(s => {
      const key = format(parseISO(s.created_at), 'MMM/yy', { locale: ptBR });
      monthlyHistory[key] = (monthlyHistory[key] || 0) + Number(s.amount);
    });
    const currentMonthKey = format(now, 'MMM/yy', { locale: ptBR });
    monthlyHistory[currentMonthKey] = currentRevenue;

    const chartData = Object.entries(monthlyHistory).map(([month, revenue]) => ({
      month,
      revenue,
      forecast: month === currentMonthKey ? combinedForecast : undefined,
    }));

    // Confidence based on days passed and goal proximity
    const goalProgress = totalGoal > 0 ? (currentRevenue / totalGoal) * 100 : 0;
    const paceScore = totalGoal > 0 ? ((currentRevenue / daysPassed) * totalDays) / totalGoal * 100 : 100;
    const confidence = Math.min(95, Math.max(20, (daysPassed / totalDays) * 50 + Math.min(50, paceScore * 0.5)));

    // Pipeline velocity (avg days in pipeline)
    const avgDaysInPipeline = pipeline.length > 0
      ? pipeline.reduce((sum, d) => sum + differenceInDays(now, parseISO(d.created_at)), 0) / pipeline.length
      : 0;

    return {
      currentRevenue,
      totalGoal,
      goalProgress,
      linearProjection,
      weightedPipeline,
      combinedForecast,
      pipelineByStage,
      chartData,
      confidence: Math.round(confidence),
      dailyAvg,
      daysRemaining,
      pipelineTotal: pipeline.reduce((sum, d) => sum + Number(d.amount), 0),
      pipelineCount: pipeline.length,
      avgDaysInPipeline: Math.round(avgDaysInPipeline),
      willHitGoal: combinedForecast >= totalGoal,
      gapToGoal: totalGoal - combinedForecast,
    };
  }, [data]);

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 rounded-xl bg-muted/30 animate-pulse" />)}</div>;
  }

  if (!forecast) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Sem dados para projeção</p>
        </CardContent>
      </Card>
    );
  }

  const fmt = (v: any) => `R$ ${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-4">
      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard icon={DollarSign} label="Receita Atual" value={fmt(forecast.currentRevenue)} color="text-success" />
        <MetricCard icon={TrendingUp} label="Projeção Mês" value={fmt(forecast.combinedForecast)} color="text-primary" subtitle={`${forecast.confidence}% confiança`} />
        <MetricCard icon={Target} label="Meta Total" value={fmt(forecast.totalGoal)} color="text-accent" subtitle={`${forecast.goalProgress.toFixed(1)}% atingido`} />
        <MetricCard
          icon={forecast.willHitGoal ? ArrowUpRight : ArrowDownRight}
          label={forecast.willHitGoal ? 'Acima da Meta' : 'Gap para Meta'}
          value={fmt(Math.abs(forecast.gapToGoal))}
          color={forecast.willHitGoal ? 'text-success' : 'text-destructive'}
        />
      </div>

      {/* Forecast chart */}
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Tendência de Receita (6 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={forecast.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                formatter={(v: any) => [fmt(v), '']}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="forecast" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
              {forecast.totalGoal > 0 && (
                <ReferenceLine y={forecast.totalGoal} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ value: 'Meta', fill: 'hsl(var(--destructive))', fontSize: 10 }} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pipeline breakdown + velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline by stage */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-display">Pipeline Ponderado</CardTitle>
              <Badge variant="outline" className="text-xs">{forecast.pipelineCount} deals • {fmt(forecast.pipelineTotal)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {forecast.pipelineByStage.map(stage => (
              <div key={stage.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground capitalize">{stage.stage}</span>
                    <Badge variant="secondary" className="text-[10px] h-4">{stage.count}</Badge>
                    <span className="text-muted-foreground">{stage.probability}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground line-through mr-2">{fmt(stage.total)}</span>
                    <span className="font-semibold text-primary">{fmt(stage.weighted)}</span>
                  </div>
                </div>
                <Progress value={stage.probability} className="h-1.5" />
              </div>
            ))}
            <div className="pt-2 border-t border-border/30 flex justify-between text-sm">
              <span className="font-medium text-foreground">Total Ponderado</span>
              <span className="font-bold text-primary">{fmt(forecast.weightedPipeline)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Velocity & projections */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Velocidade & Projeções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <DollarSign className="h-3 w-3" /> Média Diária
                </div>
                <p className="text-lg font-bold font-display text-foreground">{fmt(forecast.dailyAvg)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" /> Dias Restantes
                </div>
                <p className="text-lg font-bold font-display text-foreground">{forecast.daysRemaining}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" /> Tempo no Pipeline
                </div>
                <p className="text-lg font-bold font-display text-foreground">{forecast.avgDaysInPipeline}d</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <TrendingUp className="h-3 w-3" /> Projeção Linear
                </div>
                <p className="text-lg font-bold font-display text-foreground">{fmt(forecast.linearProjection)}</p>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Nível de Confiança</span>
                <span className={cn('font-bold', forecast.confidence >= 70 ? 'text-success' : forecast.confidence >= 40 ? 'text-streak' : 'text-destructive')}>
                  {forecast.confidence}%
                </span>
              </div>
              <Progress value={forecast.confidence} className="h-2" />
            </div>

            {/* Goal status */}
            <div className={cn(
              'p-3 rounded-lg text-center text-xs font-semibold',
              forecast.willHitGoal ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            )}>
              {forecast.willHitGoal ? (
                <span className="flex items-center justify-center gap-1"><ArrowUpRight className="h-4 w-4" /> Projeção acima da meta em {fmt(Math.abs(forecast.gapToGoal))}</span>
              ) : (
                <span className="flex items-center justify-center gap-1"><AlertTriangle className="h-4 w-4" /> Faltam {fmt(Math.abs(forecast.gapToGoal))} para atingir a meta</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const MetricCard: FC<{ icon: typeof DollarSign; label: string; value: string; color: string; subtitle?: string }> = ({ icon: Icon, label, value, color, subtitle }) => (
  <Card className="border-none shadow-sm">
    <CardContent className="p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn('h-4 w-4', color)} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-bold font-display text-foreground">{value}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
    </CardContent>
  </Card>
);
