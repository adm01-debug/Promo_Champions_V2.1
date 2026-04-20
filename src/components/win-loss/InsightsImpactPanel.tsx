import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useInsightsImpact } from "@/hooks/win-loss/useInsightsImpact";

export function InsightsImpactPanel() {
  const { data = [], isLoading } = useInsightsImpact();

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Impacto dos Insights aplicados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : !data.length ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Marque insights como aplicados para começar a medir o uplift.
          </p>
        ) : (
          <ul className="space-y-2">
            {data.slice(0, 6).map((it) => {
              const positive = it.uplift > 1;
              const negative = it.uplift < -1;
              const Icon = positive ? TrendingUp : negative ? TrendingDown : Minus;
              const color = positive
                ? "text-emerald-600"
                : negative
                  ? "text-rose-600"
                  : "text-muted-foreground";
              return (
                <li key={it.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                  <div className={`shrink-0 mt-0.5 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{it.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Antes: {it.beforeWinRate.toFixed(0)}% ({it.beforeCount}) → Depois: {it.afterWinRate.toFixed(0)}% ({it.afterCount})
                    </p>
                  </div>
                  <div className={`text-sm font-semibold tabular-nums shrink-0 ${color}`}>
                    {it.uplift > 0 ? "+" : ""}{it.uplift.toFixed(1)}pp
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
