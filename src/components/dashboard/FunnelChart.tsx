import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Info } from "lucide-react";
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const funnelData = [
  { stage: "Leads", value: 100, color: "bg-primary" },
  { stage: "Qualificados", value: 65, color: "bg-secondary" },
  { stage: "Proposta", value: 40, color: "bg-accent" },
  { stage: "Fechados", value: 20, color: "bg-success" },
];

export const FunnelChart = () => {
  const { data: kpis } = useDashboardKPIs();
  const hasRealData = (kpis?.current.totalSales ?? 0) > 0;

  return (
    <Card className="h-full relative">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          Funil
          {!hasRealData && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-muted text-muted-foreground">
                    <Info className="h-2.5 w-2.5" />
                    Demo
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Dados de demonstração. Registre vendas para ver dados reais.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {funnelData.map((item) => (
          <div key={item.stage} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{item.stage}</span>
              <span className="font-medium">{item.value}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full transition-all duration-500`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
      {/* Subtle overlay for demo data */}
      {!hasRealData && (
        <div className="absolute inset-0 bg-background/5 rounded-lg pointer-events-none" />
      )}
    </Card>
  );
};
