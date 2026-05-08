import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Users } from "lucide-react";
import { format, startOfWeek, subDays, subMonths, eachDayOfInterval, eachWeekOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PeriodFilter = 'week' | 'month' | 'quarter';

interface CloserRevenueEvolutionProps {
  period: PeriodFilter;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(142, 76%, 36%)",
  "hsl(280, 65%, 60%)",
  "hsl(30, 80%, 55%)",
];

const useCloserRevenueEvolution = (period: PeriodFilter) => {
  return useQuery({
    queryKey: ['closer-revenue-evolution', period],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      let groupBy: 'day' | 'week';
      
      switch (period) {
        case 'week':
          startDate = subDays(now, 7);
          groupBy = 'day';
          break;
        case 'month':
          startDate = subMonths(now, 1);
          groupBy = 'day';
          break;
        case 'quarter':
          startDate = subMonths(now, 3);
          groupBy = 'week';
          break;
      }

      // Get closers
      const { data: closers } = await supabase
        .from('salespeople')
        .select('id, name')
        .in('role', ['closer', 'hybrid'])
        .eq('is_active', true);

      if (!closers?.length) return { chartData: [], closers: [] };

      // Get sales data
      const { data: sales } = await supabase
        .from('sales')
        .select('salesperson_id, amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .in('salesperson_id', closers.map(c => c.id));

      // Generate time intervals
      let intervals: Date[];
      if (groupBy === 'day') {
        intervals = eachDayOfInterval({ start: startDate, end: now });
      } else {
        intervals = eachWeekOfInterval({ start: startDate, end: now });
      }

      // Aggregate data by time period and closer
      const chartData = intervals.map(date => {
        const periodStart = groupBy === 'week' ? startOfWeek(date, { weekStartsOn: 1 }) : date;
        const periodEnd = groupBy === 'week' 
          ? new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
          : new Date(date.getTime() + 24 * 60 * 60 * 1000 - 1);

        const label = groupBy === 'week'
          ? format(periodStart, "dd/MM", { locale: ptBR })
          : format(date, "dd/MM", { locale: ptBR });

        const dataPoint: Record<string, string | number> = { date: label };

        closers.forEach(closer => {
          const closerSales = sales?.filter(sale => {
            const saleDate = new Date(sale.created_at);
            return sale.salesperson_id === closer.id &&
                   saleDate >= periodStart &&
                   saleDate <= periodEnd;
          }) || [];

          const revenue = closerSales.reduce((sum, sale) => sum + Number(sale.amount), 0);
          dataPoint[closer.id] = revenue;
        });

        return dataPoint;
      });

      return { chartData, closers };
    },
    staleTime: 60000,
  });
};

const formatCurrency = (value: any) => {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1)}k`;
  }
  return `R$ ${value.toFixed(0)}`;
};

export function CloserRevenueEvolution({ period }: CloserRevenueEvolutionProps) {
  const [selectedCloser, setSelectedCloser] = useState<string>("all");
  const { data, isLoading } = useCloserRevenueEvolution(period);

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const { chartData = [], closers = [] } = data || {};

  // Filter closers based on selection
  const displayedClosers = selectedCloser === "all" 
    ? closers 
    : closers.filter(c => c.id === selectedCloser);

  if (!chartData.length || !closers.length) {
    return (
      <Card className="glass border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            Evolução de Receita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Sem dados de receita no período
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/40 hover-lift">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 font-display">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          Evolução de Receita
        </CardTitle>
        <Select value={selectedCloser} onValueChange={setSelectedCloser}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <Users className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filtrar Closer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Closers</SelectItem>
            {closers.map(closer => (
              <SelectItem key={closer.id} value={closer.id}>
                {closer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
              formatter={(value: any, name: any) => {
                const closer = closers.find(c => c.id === name);
                return [
                  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  closer?.name || name
                ];
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend 
              formatter={(value: string) => {
                const closer = closers.find(c => c.id === value);
                return closer?.name || value;
              }}
              wrapperStyle={{ paddingTop: '20px' }}
            />
            {displayedClosers.map((closer, _index) => {
              const colorIndex = closers.findIndex(c => c.id === closer.id);
              return (
                <Line
                  key={closer.id}
                  type="monotone"
                  dataKey={closer.id}
                  name={closer.id}
                  stroke={COLORS[colorIndex % COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: COLORS[colorIndex % COLORS.length], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
