import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, TrendingUp } from "lucide-react";

interface MonthlyData {
  month: string;
  vendas: number;
  meta: number;
}

const useMonthlySalesData = () => {
  return useQuery({
    queryKey: ["monthly-sales-chart"],
    queryFn: async (): Promise<MonthlyData[]> => {
      const now = new Date();
      const months: MonthlyData[] = [];

      // Get last 12 months of data
      for (let i = 11; i >= 0; i--) {
        const targetDate = subMonths(now, i);
        const monthStart = startOfMonth(targetDate);
        const monthEnd = endOfMonth(targetDate);
        const monthStr = format(targetDate, "yyyy-MM") + "-01";

        // Fetch completed sales for the month
        const { data: sales } = await supabase
          .from("sales")
          .select("amount")
          .eq("status", "completed")
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString());

        // Fetch goals for the month
        const { data: goals } = await supabase
          .from("sales_goals")
          .select("goal_amount")
          .eq("month", monthStr);

        const totalSales = sales?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;
        const totalGoal = goals?.reduce((sum, g) => sum + Number(g.goal_amount), 0) || 0;

        months.push({
          month: format(targetDate, "MMM", { locale: ptBR }),
          vendas: totalSales,
          meta: totalGoal,
        });
      }

      return months;
    },
    staleTime: 5 * 60 * 1000,
  });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-4 border border-border/50 shadow-lg">
        <p className="text-sm font-semibold font-display text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            {entry.name}: <span className="font-semibold">R$ {entry.value.toLocaleString("pt-BR")}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const SalesChart = () => {
  const { data, isLoading } = useMonthlySalesData();

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 border border-border/40 dark:border-glow card-elevated">
        <div className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass rounded-xl p-6 border border-border/40 dark:border-glow card-elevated">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold font-display gradient-text">Performance de Vendas</h3>
            <p className="text-sm text-muted-foreground">Vendas vs Meta mensal</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
          <TrendingUp className="h-10 w-10 mb-3 opacity-50" />
          <p>Nenhum dado de vendas disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 border border-border/40 dark:border-glow card-elevated">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold font-display gradient-text">Performance de Vendas</h3>
          <p className="text-sm text-muted-foreground">Vendas vs Meta mensal</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full gradient-primary" />
            <span className="text-xs text-muted-foreground">Vendas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-xs text-muted-foreground">Meta</span>
          </div>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(24, 95%, 55%)" stopOpacity={0.4} />
                <stop offset="50%" stopColor="hsl(340, 80%, 55%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(24, 95%, 55%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(280, 80%, 60%)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(280, 80%, 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(24, 95%, 55%)" />
                <stop offset="100%" stopColor="hsl(340, 80%, 55%)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="vendas"
              stroke="url(#strokeGradient)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorVendas)"
              name="Vendas"
            />
            <Area
              type="monotone"
              dataKey="meta"
              stroke="hsl(280, 80%, 60%)"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorMeta)"
              name="Meta"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
