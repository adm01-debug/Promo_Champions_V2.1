import { Receipt, Percent, Clock, RotateCcw, CreditCard, Wallet, LucideIcon } from "lucide-react";
import { useDetailedKPIs } from "@/hooks/useDashboardKPIs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, LucideIcon> = {
  Receipt,
  Percent,
  Clock,
  RotateCcw,
  CreditCard,
  Wallet,
};

export const KPIGrid = () => {
  const { data: kpis, isLoading } = useDetailedKPIs();

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="mb-6">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">KPIs Principais</h3>
        <p className="text-sm text-muted-foreground">Comparativo com mês anterior</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {kpis?.map((kpi) => {
          const isPositive = kpi.change > 0;
          const Icon = iconMap[kpi.icon] || Receipt;

          return (
            <TooltipProvider key={kpi.title}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group cursor-help">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-xs text-muted-foreground">{kpi.title}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-lg font-semibold">{kpi.value}</span>
                      <span
                        className={`text-xs font-medium ${
                          isPositive ? "text-success" : "text-destructive"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {kpi.change}%
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-popover border border-border">
                  <div className="text-xs">
                    <p className="text-muted-foreground">vs. mês anterior</p>
                    <p className="font-medium">Anterior: {kpi.previousValue}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};
