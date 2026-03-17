import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function RevenueKpiWidget() {
  const { data: kpis, isLoading } = useDashboardKPIs();

  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  const revenue = kpis?.current.totalRevenue ?? 0;
  const change = kpis?.changes.revenue ?? 0;
  const isPositive = change >= 0;

  return (
    <Card className="h-full border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-primary" />
          Receita do Mês
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-primary">
          R$ {revenue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
        </p>
        <div className={cn("flex items-center gap-1 text-xs mt-1", isPositive ? "text-green-600" : "text-red-500")}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isPositive ? "+" : ""}{change}% vs mês anterior
        </div>
      </CardContent>
    </Card>
  );
}
