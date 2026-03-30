import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ForecastWidget() {
  const { data, isLoading } = useGoalsDashboard();

  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  const projection = data?.projection ?? 0;
  const _goal = data?.totalGoal ?? 0;
  const onTrack = data?.onTrack ?? false;

  return (
    <Card className="h-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-green-500" />
          Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          R$ {projection.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
        </p>
        <p className={cn("text-xs mt-1 font-medium", onTrack ? "text-green-600" : "text-red-500")}>
          {onTrack ? "✓ No ritmo para a meta" : "⚠ Abaixo do ritmo"}
        </p>
      </CardContent>
    </Card>
  );
}
