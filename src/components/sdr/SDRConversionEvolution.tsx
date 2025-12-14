import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Users } from "lucide-react";
import { format, subDays, subMonths, eachDayOfInterval, eachWeekOfInterval, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PeriodFilter = 'week' | 'month' | 'quarter';

interface SDRConversionEvolutionProps {
  period: PeriodFilter;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

interface SDR {
  id: string;
  name: string;
}

interface ChartDataPoint {
  date: string;
  label: string;
  [key: string]: number | string;
}

const useSDRConversionEvolution = (period: PeriodFilter) => {
  return useQuery({
    queryKey: ['sdr-conversion-evolution', period],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'week':
          startDate = subDays(now, 7);
          break;
        case 'month':
          startDate = subMonths(now, 1);
          break;
        case 'quarter':
          startDate = subMonths(now, 3);
          break;
      }

      // Fetch SDRs
      const { data: sdrs } = await supabase
        .from('salespeople')
        .select('id, name')
        .eq('is_active', true)
        .in('role', ['sdr', 'hybrid']);

      if (!sdrs?.length) return { chartData: [], sdrs: [] };

      // Fetch activities (meetings scheduled)
      const { data: activities } = await supabase
        .from('activities')
        .select('salesperson_id, created_at, outcome')
        .gte('created_at', startDate.toISOString())
        .in('salesperson_id', sdrs.map(s => s.id));

      // Fetch sales (total leads)
      const { data: sales } = await supabase
        .from('sales')
        .select('salesperson_id, created_at')
        .gte('created_at', startDate.toISOString())
        .in('salesperson_id', sdrs.map(s => s.id));

      // Generate date intervals
      const useWeeklyAggregation = period === 'quarter';
      const intervals = useWeeklyAggregation
        ? eachWeekOfInterval({ start: startDate, end: now }, { weekStartsOn: 1 })
        : eachDayOfInterval({ start: startDate, end: now });

      // Build chart data
      const chartData: ChartDataPoint[] = intervals.map(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const label = useWeeklyAggregation
          ? `Sem ${format(date, 'dd/MM', { locale: ptBR })}`
          : format(date, 'dd/MM', { locale: ptBR });

        const point: ChartDataPoint = { date: dateKey, label };

        sdrs.forEach(sdr => {
          // Count meetings scheduled
          const meetings = activities?.filter(a => {
            const actDate = new Date(a.created_at);
            const matchDate = useWeeklyAggregation
              ? format(startOfWeek(actDate, { weekStartsOn: 1 }), 'yyyy-MM-dd') === dateKey
              : format(actDate, 'yyyy-MM-dd') === dateKey;
            return a.salesperson_id === sdr.id && 
                   a.outcome === 'scheduled' && 
                   matchDate;
          }).length ?? 0;

          // Count total leads
          const leads = sales?.filter(s => {
            const saleDate = new Date(s.created_at);
            const matchDate = useWeeklyAggregation
              ? format(startOfWeek(saleDate, { weekStartsOn: 1 }), 'yyyy-MM-dd') === dateKey
              : format(saleDate, 'yyyy-MM-dd') === dateKey;
            return s.salesperson_id === sdr.id && matchDate;
          }).length ?? 0;

          // Calculate conversion rate
          const conversionRate = leads > 0 ? Math.round((meetings / leads) * 100) : 0;
          point[sdr.id] = conversionRate;
        });

        return point;
      });

      return { chartData, sdrs };
    },
    staleTime: 60000,
  });
};

export function SDRConversionEvolution({ period }: SDRConversionEvolutionProps) {
  const [selectedSDR, setSelectedSDR] = useState<string>("all");
  const { data, isLoading } = useSDRConversionEvolution(period);

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

  const { chartData = [], sdrs = [] } = data || {};

  const displayedSDRs = selectedSDR === "all" 
    ? sdrs 
    : sdrs.filter(s => s.id === selectedSDR);

  if (!chartData.length || !sdrs.length) {
    return (
      <Card className="glass border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            Evolução de Conversão SDR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível para o período selecionado
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
          Evolução de Conversão SDR
        </CardTitle>
        <Select value={selectedSDR} onValueChange={setSelectedSDR}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <Users className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filtrar SDR" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os SDRs</SelectItem>
            {sdrs.map(sdr => (
              <SelectItem key={sdr.id} value={sdr.id}>
                {sdr.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="label" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
              formatter={(value: number, name: string) => {
                const sdr = sdrs.find(s => s.id === name);
                return [`${value}%`, sdr?.name || name];
              }}
            />
            <Legend 
              formatter={(value) => {
                const sdr = sdrs.find(s => s.id === value);
                return sdr?.name || value;
              }}
              wrapperStyle={{ paddingTop: '20px' }}
            />
            {displayedSDRs.map((sdr, index) => {
              const colorIndex = sdrs.findIndex(s => s.id === sdr.id);
              return (
                <Line
                  key={sdr.id}
                  type="monotone"
                  dataKey={sdr.id}
                  name={sdr.id}
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
