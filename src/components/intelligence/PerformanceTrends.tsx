import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { isWonSaleStatus } from '@/constants';

export const PerformanceTrends = () => {
  const { data } = useQuery({
    queryKey: ['intelligence-weekly-revenue'],
    queryFn: async () => {
      const since = startOfWeek(subWeeks(new Date(), 5), { locale: ptBR });
      const { data, error } = await supabase
        .from('sales')
        .select('amount, status, created_at')
        .gte('created_at', since.toISOString());
      if (error) throw error;

      const weeks = Array.from({ length: 6 }, (_, i) => {
        const start = startOfWeek(subWeeks(new Date(), 5 - i), { locale: ptBR });
        const end = endOfWeek(start, { locale: ptBR });
        return { name: format(start, 'dd/MM'), start, end, revenue: 0 };
      });

      (data ?? [])
        .filter(s => isWonSaleStatus(s.status))
        .forEach(s => {
          const d = new Date(s.created_at);
          const w = weeks.find(w => d >= w.start && d <= w.end);
          if (w) w.revenue += Number(s.amount);
        });

      return weeks.map(({ name, revenue }) => ({ name, revenue }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const chartData = data ?? [];
  const hasData = chartData.some(w => w.revenue > 0);

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-section-title text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              Revenue <span className="text-primary">Performance Trends</span>
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold opacity-60">
              Receita real das últimas 6 semanas
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[250px] pt-4">
        {!hasData ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              Sem receita registrada nas últimas 6 semanas
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
