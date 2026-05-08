import React from "react";
import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AreaChart, Area, ResponsiveContainer, ReferenceLine, XAxis, Tooltip } from "recharts";

export const ForecastWidget = React.memo(function ForecastWidget() {
  const { data, isLoading } = useGoalsDashboard();

  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  const projection = data?.projection ?? 0;
  const goal = data?.totalGoal ?? 0;
  const current = data?.totalSales ?? 0;
  const onTrack = data?.onTrack ?? false;
  const daysElapsed = data?.daysElapsed ?? 1;
  const daysRemaining = data?.daysRemaining ?? 0;
  const totalDays = daysElapsed + daysRemaining;

  // Build projected trajectory line
  const dailyRate = daysElapsed > 0 ? current / daysElapsed : 0;
  const chartData = [];
  const points = Math.min(totalDays, 31);
  for (let i = 0; i <= points; i++) {
    const day = i;
    const actual = day <= daysElapsed ? dailyRate * day : undefined;
    const projected = dailyRate * day;
    const goalLine = goal;
    chartData.push({
      day: `D${day}`,
      actual: actual !== undefined ? Math.round(actual) : undefined,
      projected: Math.round(projected),
      meta: goalLine,
    });
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-success" />
          Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xl font-bold">
              R$ {projection.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </p>
            <p className={cn("text-[11px] font-medium", onTrack ? "text-success" : "text-destructive")}>
              {onTrack ? "✓ No ritmo" : "⚠ Abaixo do ritmo"}
            </p>
          </div>
        </div>

        {chartData.length > 2 && (
          <ResponsiveContainer width="100%" height={65}>
            <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <Tooltip
                formatter={(v: any, name: any) => [
                  `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
                  name === "actual" ? "Real" : "Projeção",
                ]}
                contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 11 }}
              />
              {goal > 0 && (
                <ReferenceLine y={goal} stroke="hsl(var(--warning))" strokeDasharray="4 4" strokeWidth={1} />
              )}
              <Area type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#actualGrad)" dot={false} connectNulls={false} />
              <Area type="monotone" dataKey="projected" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4 4" fill="none" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
});

ForecastWidget.displayName = "ForecastWidget";
