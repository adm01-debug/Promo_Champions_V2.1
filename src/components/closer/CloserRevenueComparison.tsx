import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Swords, TrendingUp, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { PeriodFilter } from "@/hooks/useCloserMetrics";

interface CloserRevenueComparisonProps {
  period: PeriodFilter;
}

function getPeriodRange(period: PeriodFilter) {
  const now = new Date();
  switch (period) {
    case "week":
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "quarter":
      return { start: startOfQuarter(now), end: endOfQuarter(now) };
  }
}

function useCloserRevenueComparison(period: PeriodFilter) {
  return useQuery({
    queryKey: ["closer-revenue-comparison", period],
    queryFn: async () => {
      const range = getPeriodRange(period);

      // Fetch closers
      const { data: closers } = await supabase
        .from("salespeople")
        .select("id, name, avatar_url")
        .in("role", ["closer", "hybrid"])
        .eq("is_active", true);

      if (!closers || closers.length === 0) return [];

      // Fetch completed sales in period
      const { data: sales } = await supabase
        .from("sales")
        .select("salesperson_id, amount")
        .eq("status", "completed")
        .gte("created_at", range.start.toISOString())
        .lte("created_at", range.end.toISOString());

      // Aggregate revenue per closer
      const revenueMap = new Map<string, number>();
      const dealsMap = new Map<string, number>();
      
      sales?.forEach(sale => {
        if (!sale.salesperson_id) return;
        revenueMap.set(
          sale.salesperson_id, 
          (revenueMap.get(sale.salesperson_id) || 0) + Number(sale.amount)
        );
        dealsMap.set(
          sale.salesperson_id,
          (dealsMap.get(sale.salesperson_id) || 0) + 1
        );
      });

      // Build result with all closers
      const result = closers.map(closer => ({
        id: closer.id,
        name: closer.name,
        avatar_url: closer.avatar_url,
        revenue: revenueMap.get(closer.id) || 0,
        deals: dealsMap.get(closer.id) || 0,
      }));

      // Sort by revenue descending
      return result.sort((a, b) => b.revenue - a.revenue);
    },
    staleTime: 60000,
  });
}

// Colors for the bars - gradient from best to others
const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(210, 80%, 55%)",
  "hsl(280, 70%, 50%)",
  "hsl(340, 70%, 50%)",
  "hsl(180, 60%, 45%)",
  "hsl(30, 80%, 50%)",
];

export function CloserRevenueComparison({ period }: CloserRevenueComparisonProps) {
  const { data: closers, isLoading } = useCloserRevenueComparison(period);

  const periodLabel = period === "week" ? "esta semana" : period === "month" ? "este mês" : "este trimestre";

  const formatCurrency = (value: any) => 
    `R$ ${(value / 1000).toFixed(0)}k`;

  const formatCurrencyFull = (value: any) =>
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  const maxRevenue = closers?.[0]?.revenue || 0;
  const totalRevenue = closers?.reduce((sum, c) => sum + c.revenue, 0) || 0;

  if (isLoading) {
    return (
      <Card className="card-elevated">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!closers || closers.length === 0) {
    return (
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="p-2 rounded-lg gradient-primary">
              <Swords className="h-4 w-4 text-primary-foreground" />
            </div>
            Competição de Receita
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          Nenhum Closer encontrado
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="p-2 rounded-lg gradient-primary">
              <Swords className="h-4 w-4 text-primary-foreground" />
            </div>
            Competição de Receita
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            <DollarSign className="h-3 w-3 mr-1" />
            {formatCurrencyFull(totalRevenue)} total
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Receita fechada por Closer {periodLabel}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={closers}
              layout="vertical"
              margin={{ top: 10, right: 80, left: 10, bottom: 10 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                horizontal={true}
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis 
                type="number" 
                tickFormatter={formatCurrency}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <Tooltip 
                formatter={(value: any) => [formatCurrencyFull(value), "Receita"]}
                labelFormatter={(label) => `${label}`}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
              />
              <Bar 
                dataKey="revenue" 
                radius={[0, 6, 6, 0]}
                maxBarSize={40}
              >
                {closers.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    style={{
                      filter: index === 0 ? "drop-shadow(0 0 8px hsl(var(--primary) / 0.5))" : "none",
                    }}
                  />
                ))}
                <LabelList 
                  dataKey="revenue" 
                  position="right" 
                  formatter={(value: any) => formatCurrencyFull(Number(value))}
                  style={{ 
                    fill: "hsl(var(--foreground))", 
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Competition Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50">
          {closers.slice(0, 3).map((closer, index) => (
            <div 
              key={closer.id}
              className={`p-3 rounded-lg ${
                index === 0 
                  ? "bg-primary/10 border border-primary/30" 
                  : "bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg font-bold ${
                  index === 0 ? "text-primary" : "text-muted-foreground"
                }`}>
                  #{index + 1}
                </span>
                <span className="text-sm font-medium truncate">{closer.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{closer.deals} vendas</span>
                {index === 0 && maxRevenue > 0 && (
                  <Badge className="bg-primary/20 text-primary text-[10px]">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Líder
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}