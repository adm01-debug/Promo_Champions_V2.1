import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const useForecastData = () => {
  return useQuery({
    queryKey: ["sales-forecast"],
    queryFn: async () => {
      const now = new Date();
      const currentStart = startOfMonth(now);
      const currentEnd = endOfMonth(now);
      const prevStart = startOfMonth(subMonths(now, 1));
      const prevEnd = endOfMonth(subMonths(now, 1));

      const [currentResult, prevResult] = await Promise.all([
        supabase
          .from("sales")
          .select("amount")
          .eq("status", "completed")
          .gte("created_at", format(currentStart, "yyyy-MM-dd"))
          .lte("created_at", format(currentEnd, "yyyy-MM-dd")),
        supabase
          .from("sales")
          .select("amount")
          .eq("status", "completed")
          .gte("created_at", format(prevStart, "yyyy-MM-dd"))
          .lte("created_at", format(prevEnd, "yyyy-MM-dd")),
      ]);

      const currentTotal = currentResult.data?.reduce((s, r) => s + Number(r.amount), 0) || 0;
      const prevTotal = prevResult.data?.reduce((s, r) => s + Number(r.amount), 0) || 0;

      // Forecast: extrapolate current month pace to full month
      const dayOfMonth = now.getDate();
      const daysInMonth = currentEnd.getDate();
      const dailyRate = dayOfMonth > 0 ? currentTotal / dayOfMonth : 0;
      const forecast = Math.round(dailyRate * daysInMonth);

      // Confidence based on how far into the month we are
      const confidence = Math.min(Math.round((dayOfMonth / daysInMonth) * 100), 95);

      return { forecast, previousMonth: prevTotal, confidence };
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const SalesForecast = () => {
  const { data, isLoading } = useForecastData();
  
  const forecast = data?.forecast ?? 0;
  const previousMonth = data?.previousMonth ?? 0;
  const confidence = data?.confidence ?? 0;
  
  const changePercent = previousMonth > 0 ? ((forecast - previousMonth) / previousMonth) * 100 : 0;
  const isPositive = changePercent >= 0;
  
  const animatedForecast = useCountUp(forecast, { duration: 1400, decimals: 0 });
  const animatedConfidence = useCountUp(confidence, { duration: 1200, decimals: 0 });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Previsão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto" />
          <Skeleton className="h-2 w-full rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Previsão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center">
          <p className="text-xl font-bold font-display tabular-nums">
            R$ {animatedForecast.toLocaleString("pt-BR")}
          </p>
          <p className="text-xs text-muted-foreground">projeção do mês</p>
        </div>
        
        {previousMonth > 0 && (
          <div className="flex items-center justify-center gap-1.5">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-success" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
            <span className={cn(
              "text-xs font-medium",
              isPositive ? "text-success" : "text-destructive"
            )}>
              {isPositive ? "+" : ""}{changePercent.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">
              vs R$ {previousMonth.toLocaleString("pt-BR")}
            </span>
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Confiança</span>
            <span className="font-semibold tabular-nums">{animatedConfidence}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out",
                confidence >= 70 ? "bg-success" : confidence >= 40 ? "bg-warning" : "bg-destructive"
              )}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            {confidence >= 70 ? "Alta confiança" : confidence >= 40 ? "Confiança moderada" : "Início do mês — dados limitados"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
