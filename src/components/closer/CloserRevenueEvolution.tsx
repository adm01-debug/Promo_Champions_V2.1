import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { TrendingUp, Users, Activity, Zap } from "lucide-react";
import { format, startOfWeek, subDays, subMonths, eachDayOfInterval, eachWeekOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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

      const { data: closers } = await supabase
        .from('salespeople')
        .select('id, name')
        .in('role', ['closer', 'hybrid'])
        .eq('is_active', true);

      if (!closers?.length) return { chartData: [], closers: [] };

      const { data: sales } = await supabase
        .from('sales')
        .select('salesperson_id, amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .in('salesperson_id', closers.map(c => c.id));

      let intervals: Date[];
      if (groupBy === 'day') {
        intervals = eachDayOfInterval({ start: startDate, end: now });
      } else {
        intervals = eachWeekOfInterval({ start: startDate, end: now });
      }

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
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return `R$ ${value.toFixed(0)}`;
};

export function CloserRevenueEvolution({ period }: CloserRevenueEvolutionProps) {
  const [selectedCloser, setSelectedCloser] = useState<string>("all");
  const { data, isLoading } = useCloserRevenueEvolution(period);

  if (isLoading) {
    return (
      <Card className="glass border-border/40 h-[450px] flex items-center justify-center">
         <div className="flex flex-col items-center gap-2">
           <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
           <span className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Tracing Revenue Trajectory...</span>
         </div>
      </Card>
    );
  }

  const { chartData = [], closers = [] } = data || {};

  const displayedClosers = selectedCloser === "all" 
    ? closers 
    : closers.filter(c => c.id === selectedCloser);

  return (
    <Card className="glass border-primary/20 bg-black/40 backdrop-blur-xl relative overflow-hidden group h-full">
      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-primary/20 group-hover:border-primary/40 transition-colors" />
      </div>

      <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-4">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            Revenue Trajectory
          </CardTitle>
          <Badge variant="outline" className="font-mono text-[9px] uppercase tracking-widest bg-white/5 border-white/10">
            {period.toUpperCase()} PERFORMANCE
          </Badge>
        </div>
        
        <Select value={selectedCloser} onValueChange={setSelectedCloser}>
          <SelectTrigger className="w-[180px] h-8 text-[9px] font-mono font-bold uppercase tracking-widest bg-black/40 border-white/10">
            <SelectValue placeholder="All Closers" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl">
            <SelectItem value="all" className="text-[10px] font-mono uppercase">Entire Squad</SelectItem>
            {closers.map(closer => (
              <SelectItem key={closer.id} value={closer.id} className="text-[10px] font-mono uppercase">
                {closer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      
      <CardContent className="pt-8 relative z-10">
        {/* Futuristic grid background */}
        <div className="absolute inset-x-6 top-0 bottom-6 opacity-[0.03] pointer-events-none border border-white/10 rounded-xl"
             style={{
               backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
               backgroundSize: "20px 20px"
             }} />

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', fontWeight: 600 }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', fontWeight: 600 }} 
              tickFormatter={formatCurrency}
              width={40} 
            />
            <Tooltip
              cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="glass p-4 border-white/10 rounded-xl shadow-2xl backdrop-blur-xl min-w-[200px]">
                    <div className="flex items-center justify-between gap-4 mb-3 border-b border-white/5 pb-2">
                      <p className="font-mono font-black text-[10px] text-foreground uppercase tracking-widest">{label}</p>
                      <Badge variant="outline" className="font-mono text-[9px] border-primary/30 text-primary">TRAJECTORY</Badge>
                    </div>
                    <div className="space-y-3">
                      {[...payload].sort((a, b) => Number(b.value ?? 0) - Number(a.value ?? 0)).map((entry) => {
                        const closer = closers.find(c => c.id === entry.dataKey);
                        return (
                          <div key={String(entry.dataKey)} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: String(entry.stroke ?? entry.color ?? '') }} />
                            <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider truncate max-w-[120px]">{closer?.name || entry.dataKey}</span>
                            <span className="text-[10px] font-mono font-black ml-auto">R$ {Number(entry.value).toLocaleString('pt-BR')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }}
            />
            <Legend 
              verticalAlign="top" align="right" height={36} iconType="circle" iconSize={8}
              formatter={(value: string) => {
                const closer = closers.find(c => c.id === value);
                return <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">{closer?.name || value}</span>;
              }}
              wrapperStyle={{ paddingTop: '0px' }}
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
                  strokeWidth={3}
                  dot={{ fill: COLORS[colorIndex % COLORS.length], strokeWidth: 0, r: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: 'white' }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
