import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp } from 'lucide-react';

type Level = 'low' | 'medium' | 'high' | 'critical' | 'all';

interface Props {
  from: string;
  to: string;
  level: Level;
  salespersonId: string;
}

const LEVEL_COLORS: Record<Exclude<Level, 'all'>, string> = {
  low: 'hsl(160 84% 39%)',
  medium: 'hsl(38 92% 50%)',
  high: 'hsl(25 95% 53%)',
  critical: 'hsl(var(--destructive))',
};

const LEVEL_LABEL: Record<Exclude<Level, 'all'>, string> = {
  low: 'Baixo',
  medium: 'Moderado',
  high: 'Alto',
  critical: 'Crítico',
};

interface Row {
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export const ChurnHistoryChart: React.FC<Props> = ({ from, to, level, salespersonId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['churn-history-chart', { from, to, level, salespersonId }],
    queryFn: async (): Promise<Row[]> => {
      let q = supabase
        .from('notifications')
        .select('metadata, created_at')
        .eq('type', 'churn_alert')
        .gte('created_at', new Date(from + 'T00:00:00').toISOString())
        .lte('created_at', new Date(to + 'T23:59:59').toISOString())
        .limit(5000);
      if (level !== 'all') q = q.eq('metadata->>level', level);
      if (salespersonId !== 'all') q = q.eq('user_id', salespersonId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    staleTime: 60_000,
  });

  const chartData = React.useMemo(() => {
    if (!data) return [];
    const days = eachDayOfInterval({ start: parseISO(from), end: parseISO(to) });
    const buckets = new Map<string, { low: number; medium: number; high: number; critical: number }>();
    days.forEach((d) =>
      buckets.set(format(d, 'yyyy-MM-dd'), { low: 0, medium: 0, high: 0, critical: 0 }),
    );
    data.forEach((r) => {
      const key = format(new Date(r.created_at), 'yyyy-MM-dd');
      const b = buckets.get(key);
      if (!b) return;
      const lvl = ((r.metadata ?? {}) as Record<string, unknown>).level as
        | Exclude<Level, 'all'>
        | undefined;
      if (lvl && lvl in b) b[lvl] += 1;
    });
    return Array.from(buckets.entries()).map(([date, v]) => ({
      date,
      label: format(parseISO(date), 'dd/MM', { locale: ptBR }),
      ...v,
    }));
  }, [data, from, to]);

  const total = chartData.reduce(
    (acc, d) => acc + d.low + d.medium + d.high + d.critical,
    0,
  );

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-black uppercase tracking-widest">
            Alertas por dia · nível
          </h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {total.toLocaleString('pt-BR')} alertas no período
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : total === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
          Nenhum alerta no período selecionado.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelFormatter={(l) => `Dia ${l}`}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {(['low', 'medium', 'high', 'critical'] as const).map((k) => (
                <Bar
                  key={k}
                  dataKey={k}
                  stackId="a"
                  name={LEVEL_LABEL[k]}
                  fill={LEVEL_COLORS[k]}
                  radius={k === 'critical' ? [4, 4, 0, 0] : 0}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default ChurnHistoryChart;
