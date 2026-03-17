import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function ConversionRateWidget() {
  const { data: kpis, isLoading } = useDashboardKPIs();

  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  const rate = kpis?.current.conversionRate ?? 0;
  const change = kpis?.changes.conversion ?? 0;
  const isPositive = change >= 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
          Taxa de Conversão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{rate.toFixed(1)}%</p>
        <Progress value={Math.min(rate, 100)} className="h-1.5 mt-2" />
        <div className={cn("flex items-center gap-1 text-xs mt-1", isPositive ? "text-green-600" : "text-red-500")}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isPositive ? "+" : ""}{change}%
        </div>
      </CardContent>
    </Card>
  );
}
