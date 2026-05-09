import { FC, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, TrendingDown, TrendingUp, Minus, Clock, Maximize2 } from 'lucide-react';
import { useClosingTime, ClosingTimeData } from '@/hooks/useClosingTime';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import type { RechartsTooltipProps } from "@/types/recharts";

const CustomTooltip = ({ active, payload, label }: RechartsTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 shadow-lg border border-border/50">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">
          Média: <span className="font-semibold text-primary">{payload[0].value} dias</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {(payload[0].payload as Record<string, number>).deals} deals analisados
        </p>
      </div>
    );
  }
  return null;
};

export const ClosingTimeChart: FC = () => {
  const { data, isLoading } = useClosingTime();
  
  const chartData: ClosingTimeData[] = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [
        { stage: 'Qualificação', avgDays: 5, deals: 45 },
        { stage: 'Proposta', avgDays: 8, deals: 32 },
        { stage: 'Negociação', avgDays: 12, deals: 28 },
        { stage: 'Fechamento', avgDays: 4, deals: 20 },
      ];
    }
    return data;
  }, [data]);

  const averageClosingTime = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.round(chartData.reduce((acc, curr) => acc + curr.avgDays, 0) / chartData.length);
  }, [chartData]);

  const totalDeals = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.deals, 0);
  }, [chartData]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return 0;
    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b.avgDays, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b.avgDays, 0) / secondHalf.length;
    return Math.round(((avgSecond - avgFirst) / avgFirst) * 100);
  }, [chartData]);

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-destructive' : trend < 0 ? 'text-success' : 'text-muted-foreground';

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/40 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            Tempo Médio de Fechamento
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {totalDeals} deals
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Summary */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-metric">{averageClosingTime} dias</p>
              <p className="text-xs text-muted-foreground">Média geral</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{Math.abs(trend)}%</span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis 
                dataKey="stage" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}d`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                y={averageClosingTime} 
                stroke="hsl(var(--primary))" 
                strokeDasharray="5 5"
                strokeOpacity={0.5}
              />
              <Bar dataKey="avgDays" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.avgDays > averageClosingTime 
                      ? 'hsl(var(--warning))' 
                      : 'hsl(var(--primary))'
                    }
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary/80" />
            <span>Abaixo da média</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-warning/80" />
            <span>Acima da média</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
