import { Card } from "@/components/ui/card";
import { Users, UserCheck, FileText, CircleDollarSign } from "lucide-react";

const funnelData = [
  { label: "Leads", value: 2480, icon: Users, color: "bg-info" },
  { label: "Qualificados", value: 1856, icon: UserCheck, color: "bg-primary" },
  { label: "Propostas", value: 743, icon: FileText, color: "bg-warning" },
  { label: "Fechados", value: 312, icon: CircleDollarSign, color: "bg-success" },
];

export function FunnelChart() {
  const maxValue = funnelData[0].value;

  return (
    <Card className="p-6 shadow-soft">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Funil de Vendas</h3>
        <p className="text-sm text-muted-foreground">Taxa de conversão por etapa</p>
      </div>
      <div className="space-y-4">
        {funnelData.map((item, index) => {
          const width = (item.value / maxValue) * 100;
          const conversionRate =
            index > 0
              ? ((item.value / funnelData[index - 1].value) * 100).toFixed(1)
              : null;

          return (
            <div key={item.label} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.color}/10`}>
                    <item.icon className={`h-4 w-4 ${item.color.replace('bg-', 'text-')}`} />
                  </div>
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-foreground">
                    {item.value.toLocaleString("pt-BR")}
                  </span>
                  {conversionRate && (
                    <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                      {conversionRate}%
                    </span>
                  )}
                </div>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500 ease-out group-hover:opacity-80`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Taxa de conversão total</span>
          <span className="font-bold text-success text-lg">
            {((funnelData[3].value / funnelData[0].value) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </Card>
  );
}