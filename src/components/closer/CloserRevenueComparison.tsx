import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Swords, TrendingUp, DollarSign, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
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

      const { data: closers } = await supabase
        .from("salespeople")
        .select("id, name, avatar_url")
        .in("role", ["closer", "hybrid"])
        .eq("is_active", true);

      if (!closers || closers.length === 0) return [];

      const { data: sales } = await supabase
        .from("sales")
        .select("salesperson_id, amount")
        .eq("status", "completed")
        .gte("created_at", range.start.toISOString())
        .lte("created_at", range.end.toISOString());

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

      const result = closers.map(closer => ({
        id: closer.id,
        name: closer.name,
        avatar_url: closer.avatar_url,
        revenue: revenueMap.get(closer.id) || 0,
        deals: dealsMap.get(closer.id) || 0,
      }));

      return result.sort((a, b) => b.revenue - a.revenue);
    },
    staleTime: 60000,
  });
}

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

  const periodLabel = period === "week" ? "ESTA SEMANA" : period === "month" ? "ESTE MÊS" : "ESTE TRIMESTRE";

  const formatCurrencyFull = (value: number | string) =>
    `R$ ${Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  const totalRevenue = closers?.reduce((sum, c) => sum + c.revenue, 0) || 0;

  if (isLoading) {
    return (
      <Card className="glass border-border/40 h-[450px] flex items-center justify-center">
         <div className="flex flex-col items-center gap-2">
           <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
           <span className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Benchmarking Closers...</span>
         </div>
      </Card>
    );
  }

  return (
    <Card className="glass border-primary/20 bg-black/40 backdrop-blur-xl relative overflow-hidden group">
      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-primary/20 group-hover:border-primary/40 transition-colors" />
      </div>

      <CardHeader className="pb-6 border-b border-white/5 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Swords className="h-3.5 w-3.5" />
              </div>
              Revenue Battle
            </CardTitle>
            <p className="text-[10px] font-mono font-bold text-muted-foreground tracking-[0.1em] uppercase">
              COMPARAÇÃO COMPETITIVA {periodLabel}
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[9px] font-black uppercase tracking-widest bg-primary/10 border-primary/30 text-primary py-1 px-3 shadow-[0_0_15px_rgba(14,165,233,0.15)]">
            <DollarSign className="h-3 w-3 mr-1" />
            TOTAL: {formatCurrencyFull(totalRevenue)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-8 relative z-10">
        {/* Futuristic grid background */}
        <div className="absolute inset-x-6 top-0 bottom-6 opacity-[0.03] pointer-events-none border border-white/10 rounded-xl"
             style={{
               backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
               backgroundSize: "20px 20px"
             }} />

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={closers || []}
              layout="vertical"
              margin={{ top: 10, right: 80, left: -20, bottom: 10 }}
            >
              <CartesianGrid 
                strokeDasharray="5 5" 
                horizontal={true}
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis 
                type="number" 
                hide
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100}
                axisLine={false}
                tickLine={false}
                fontSize={9}
                tick={{ fill: "rgba(255,255,255,0.4)", fontWeight: 800, fontFamily: "var(--font-mono)" }}
              />
              <Tooltip 
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="glass p-4 border-primary/30 rounded-xl shadow-2xl backdrop-blur-xl">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1">{data.name}</p>
                        <p className="text-xl font-mono font-black text-primary italic tracking-tighter">{formatCurrencyFull(data.revenue)}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${(data.revenue / (closers?.[0]?.revenue || 1)) * 100}%` }} />
                           </div>
                           <p className="text-[10px] font-mono font-bold text-primary">{data.deals} DEALS</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="revenue" 
                radius={[0, 8, 8, 0]}
                maxBarSize={24}
              >
                {closers?.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.6}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={1}
                    className="hover:fill-opacity-100 transition-all duration-300"
                  />
                ))}
                <LabelList 
                  dataKey="revenue" 
                  position="right" 
                  formatter={(value: any) => formatCurrencyFull(Number(value))}
                  style={{ 
                    fill: "rgba(255,255,255,0.8)", 
                    fontSize: 9,
                    fontWeight: 900,
                    fontFamily: "var(--font-mono)"
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Competition Stats - Top 3 highlight */}
        <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-white/5">
          {closers?.slice(0, 3).map((closer, index) => (
            <div 
              key={closer.id}
              className={`p-3 rounded-xl transition-all group/item hover:scale-105 ${
                index === 0 
                  ? "bg-primary/10 border border-primary/30 shadow-[0_0_20px_rgba(14,165,233,0.1)]" 
                  : "bg-white/[0.03] border border-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-mono font-black ${
                  index === 0 ? "text-primary animate-pulse" : "text-muted-foreground"
                }`}>
                  #{index + 1}
                </span>
                {index === 0 && <Zap className="h-3 w-3 text-primary" />}
              </div>
              <p className="text-[10px] font-mono font-bold truncate uppercase tracking-tighter mb-1">{closer.name}</p>
              <p className={`text-xs font-mono font-black ${index === 0 ? "text-primary" : "text-foreground/80"}`}>
                {closer.deals} DEALS
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
