import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function TeamRankingWidget() {
  const { data, isLoading } = useGoalsDashboard();

  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  const ranked = (data?.salespeople || []).slice(0, 5);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-amber-500" />
          Ranking do Time
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {ranked.length > 0 ? ranked.map((sp, i) => (
          <div key={sp.id} className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-bold w-5 text-center",
              i === 0 && "text-amber-500",
              i === 1 && "text-slate-400",
              i === 2 && "text-amber-700"
            )}>
              {i + 1}º
            </span>
            <span className="text-sm truncate flex-1">{sp.name}</span>
            <span className="text-xs font-semibold text-primary">
              R$ {sp.currentSales.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </span>
          </div>
        )) : (
          <p className="text-xs text-muted-foreground text-center py-4">Sem dados do time</p>
        )}
      </CardContent>
    </Card>
  );
}
