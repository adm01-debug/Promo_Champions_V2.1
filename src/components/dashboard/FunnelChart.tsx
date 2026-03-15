import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";

const funnelData = [
  { stage: "Leads", value: 100, color: "bg-primary" },
  { stage: "Qualificados", value: 65, color: "bg-secondary" },
  { stage: "Proposta", value: 40, color: "bg-accent" },
  { stage: "Fechados", value: 20, color: "bg-success" },
];

export const FunnelChart = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          Funil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {funnelData.map((item, index) => (
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
    </Card>
  );
};
