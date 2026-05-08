import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";

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
    <Card className="h-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          Taxa de Conversão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-metric">{rate.toFixed(1)}%</p>
            <div className={cn("flex items-center gap-1 text-xs", isPositive ? "text-success" : "text-destructive")}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? "+" : ""}{change}%
            </div>
          </div>
        </div>

        {/* Mini Area Chart */}
        {trend && trend.length > 0 && (
          <ResponsiveContainer width="100%" height={60}>
            <AreaChart data={trend} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" hide />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 11 }}
                formatter={(v: any) => [`${v}%`, "Conversão"]}
              />
              <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#convGrad)" dot={false} activeDot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
});

ConversionRateWidget.displayName = "ConversionRateWidget";
