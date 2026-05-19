import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useDashboardKPIs } from "@/hooks/dashboard/useDashboardKPIs";

export const ConversionRateWidget = React.memo(function ConversionRateWidget() {
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs();

  // Fetch weekly conversion trend (last 8 weeks)
  const { data: trend, isLoading: trendLoading } = useQuery({
    queryKey: ["conversion-trend-widget"],
    queryFn: async () => {
      const weeks: { week: string; rate: number }[] = [];
      const now = new Date();
      for (let i = 7; i >= 0; i--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - i * 7);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 7);

        const { data: sales } = await supabase
          .from("sales")
          .select("status")
          .gte("created_at", weekStart.toISOString())
          .lte("created_at", weekEnd.toISOString());

        const total = sales?.length || 0;
        const won = sales?.filter(s => s.status === "completed").length || 0;
        const rate = total > 0 ? Math.round((won / total) * 100) : 0;
        weeks.push({
          week: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
          rate,
        });
      }
      return weeks;
    },
    staleTime: 120_000,
  });

  const isLoading = kpisLoading || trendLoading;
  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  const rate = kpis?.current.conversionRate ?? 0;
  const change = kpis?.changes.conversion ?? 0;
  const isPositive = change >= 0;

  return (
    <Card className="h-full border-primary/10 bg-gradient-to-br from-primary/5 via-transparent to-transparent hover:border-primary/20 transition-all duration-300">
      <CardHeader className="pb-0 pt-3 px-4">
        <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="h-3 w-3 text-primary/70" />
          Taxa de Conversão
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-1">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xl font-extrabold text-foreground tracking-tight">{rate.toFixed(1)}%</p>
            <div className={cn("flex items-center gap-1 text-[10px] font-medium", isPositive ? "text-success/90" : "text-destructive/90")}>
              {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
              {isPositive ? "+" : ""}{change}% <span className="text-muted-foreground/60 font-normal ml-0.5">vs anterior</span>
            </div>
          </div>
        </div>

        {trend && trend.length > 0 && (
          <div className="h-[50px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" hide />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background/95 border border-border/50 p-1.5 rounded-lg shadow-xl backdrop-blur-sm">
                          <p className="text-[10px] font-bold text-foreground">{payload[0].value}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  fill="url(#convGrad)" 
                  dot={false} 
                  activeDot={{ r: 3, strokeWidth: 0, fill: "hsl(var(--primary))" }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ConversionRateWidget.displayName = "ConversionRateWidget";
