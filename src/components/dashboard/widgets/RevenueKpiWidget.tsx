import React from "react";
import { useDashboardKPIs } from "@/hooks/dashboard/useDashboardKPIs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const RevenueKpiWidget = React.memo(function RevenueKpiWidget() {
  const { data: kpis, isLoading } = useDashboardKPIs();

  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  const revenue = kpis?.current.totalRevenue ?? 0;
  const change = kpis?.changes.revenue ?? 0;
  const isPositive = change >= 0;

  return (
    <Card className="h-full border-primary/10 bg-gradient-to-br from-primary/5 via-transparent to-transparent hover:border-primary/20 transition-all duration-300">
      <CardHeader className="pb-0 pt-3 px-4">
        <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="h-3 w-3 text-primary/70" />
          Receita do Mês
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <p className="text-xl font-extrabold text-foreground tracking-tight">
          R$ {revenue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
        </p>
        <div className={cn("flex items-center gap-1 text-[10px] font-medium mt-0.5", isPositive ? "text-success/90" : "text-destructive/90")}>
          {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
          {isPositive ? "+" : ""}{change}% <span className="text-muted-foreground/60 font-normal">vs anterior</span>
        </div>
      </CardContent>
    </Card>
  );
});

RevenueKpiWidget.displayName = "RevenueKpiWidget";
