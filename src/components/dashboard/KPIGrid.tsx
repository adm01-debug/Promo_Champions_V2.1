import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const kpis = [
  { label: "Ticket Médio", value: "R$ 2.450" },
  { label: "Ciclo de Venda", value: "18 dias" },
  { label: "Leads Ativos", value: "127" },
];

export const KPIGrid = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          KPIs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
          >
            <span className="text-xs text-muted-foreground">{kpi.label}</span>
            <span className="text-sm font-semibold">{kpi.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
