import { useSelfBenchmark } from "@/hooks/useSelfBenchmark";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const TREND_CONFIG = {
  up: { icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
  down: { icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10" },
  stable: { icon: Minus, color: "text-muted-foreground", bg: "bg-muted" },
};

export function SelfBenchmarkWidget() {
  const { salesperson } = useAuth();
  const { data: metrics, isLoading } = useSelfBenchmark(salesperson?.id);

  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  if (!metrics || metrics.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
             <BarChart3 className="h-3.5 w-3.5 text-info" />
            Seu Benchmark
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground text-center py-4">
            Sem dados suficientes
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show top 4 most impactful metrics
  const displayed = metrics.slice(0, 4);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
          Seu Benchmark
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayed.map((metric) => {
          const trend = TREND_CONFIG[metric.trend];
          const TrendIcon = trend.icon;

          const formatValue = (val: number) => {
            if (metric.format === "currency") {
              return val >= 1000
                ? `R$ ${(val / 1000).toFixed(1)}k`
                : `R$ ${val}`;
            }
            if (metric.format === "percent") return `${val}%`;
            return String(val);
          };

          return (
            <div key={metric.label} className="flex items-center gap-2">
              <div className={cn("p-1 rounded", trend.bg)}>
                <TrendIcon className={cn("h-3 w-3", trend.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground truncate">
                  {metric.label}
                </p>
                <p className="text-xs font-semibold">{formatValue(metric.current)}</p>
              </div>
              <div className="text-right">
                <p className={cn("text-[10px] font-medium", trend.color)}>
                  {metric.change > 0 ? "+" : ""}
                  {metric.change}%
                </p>
                <p className="text-[9px] text-muted-foreground">
                  vs média
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
