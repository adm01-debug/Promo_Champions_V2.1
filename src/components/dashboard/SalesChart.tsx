import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, subMonths, startOfDay, eachDayOfInterval, eachWeekOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

type TimeRange = "7d" | "30d" | "90d";

const timeRangeLabels: Record<TimeRange, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
};

const useSalesChartData = (timeRange: TimeRange) => {
  return useQuery({
    queryKey: ["sales-chart", timeRange],
    queryFn: async () => {
      const now = new Date();
      const daysBack = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = startOfDay(subDays(now, daysBack));

      const [salesResult, goalsResult] = await Promise.all([
        supabase
          .from("sales")
          .select("amount, status, created_at")
          .gte("created_at", startDate.toISOString())
          .eq("status", "completed"),
        supabase
          .from("daily_metrics")
          .select("date, revenue_goal")
          .gte("date", format(startDate, "yyyy-MM-dd")),
      ]);

      const sales = salesResult.data || [];
      const goals = goalsResult.data || [];

      // Build goal lookup
      const goalByDate: Record<string, number> = {};
      goals.forEach(g => { goalByDate[g.date] = g.revenue_goal; });

      // Group sales by date/week depending on range
      if (timeRange === "90d") {
        const weeks = eachWeekOfInterval({ start: startDate, end: now }, { weekStartsOn: 1 });
        return weeks.map((weekStart, i) => {
          const weekEnd = i < weeks.length - 1 ? weeks[i + 1] : now;
          const weekSales = sales.filter(s => {
            const d = new Date(s.created_at);
            return d >= weekStart && d < weekEnd;
          });
          const revenue = weekSales.reduce((sum, s) => sum + Number(s.amount), 0);
          return {
            name: format(weekStart, "dd/MM", { locale: ptBR }),
            value: revenue,
            meta: 0,
          };
        });
      }

      const days = eachDayOfInterval({ start: startDate, end: now });
      return days.map(day => {
        const dateStr = format(day, "yyyy-MM-dd");
        const daySales = sales.filter(s => s.created_at.startsWith(dateStr));
        const revenue = daySales.reduce((sum, s) => sum + Number(s.amount), 0);
        return {
          name: format(day, timeRange === "7d" ? "EEE" : "dd/MM", { locale: ptBR }),
          value: revenue,
          meta: goalByDate[dateStr] || 0,
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const SalesChart = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const { data: chartData, isLoading } = useSalesChartData(timeRange);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolução de Vendas
          </CardTitle>
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
            {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200",
                  timeRange === range
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {timeRangeLabels[range]}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {isLoading ? (
          <Skeleton className="h-[200px] w-full rounded-lg" />
        ) : !chartData || chartData.every(d => d.value === 0) ? (
          <div className="h-[200px] flex flex-col items-center justify-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary/50" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Sem vendas no período</p>
              <p className="text-xs text-muted-foreground/60">Registre sua primeira venda para ver a evolução</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  padding: '10px 14px',
                }}
                formatter={(value: number, name: string) => [
                  `R$ ${value.toLocaleString('pt-BR')}`, 
                  name === 'value' ? 'Vendas' : 'Meta'
                ]}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              {chartData.some(d => d.meta > 0) && (
                <Area
                  type="monotone"
                  dataKey="meta"
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  fill="none"
                  dot={false}
                />
              )}
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorValue)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                activeDot={{ r: 5, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-3 h-0.5 bg-primary rounded-full" />
            Vendas
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-3 h-0.5 border-t border-dashed border-muted-foreground" />
            Meta
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
