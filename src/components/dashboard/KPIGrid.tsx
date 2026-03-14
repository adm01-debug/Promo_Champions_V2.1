import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { useDetailedKPIs } from "@/hooks/useDashboardKPIs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const KPIGrid = () => {
  const { data: kpis, isLoading } = useDetailedKPIs();

  // Show top 3 KPIs
  const displayKpis = kpis?.slice(0, 3) || [];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          KPIs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))
        ) : displayKpis.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Registre vendas para ver seus KPIs
          </p>
        ) : (
          displayKpis.map((kpi, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
            >
              <span className="text-xs text-muted-foreground">{kpi.title}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tabular-nums">{kpi.value}</span>
                {kpi.change !== 0 && (
                  <span className={cn(
                    "flex items-center text-[10px] font-medium",
                    kpi.change > 0 ? "text-success" : "text-destructive"
                  )}>
                    {kpi.change > 0 ? (
                      <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                    ) : (
                      <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
                    )}
                    {kpi.change > 0 ? "+" : ""}{kpi.change.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
