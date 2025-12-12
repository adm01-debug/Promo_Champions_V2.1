import { Users, UserCheck, FileText, Handshake } from "lucide-react";

const funnelData = [
  { stage: "Leads", value: 1250, icon: Users, color: "from-primary to-primary" },
  { stage: "Qualificados", value: 840, icon: UserCheck, color: "from-primary to-secondary" },
  { stage: "Propostas", value: 420, icon: FileText, color: "from-secondary to-secondary" },
  { stage: "Fechados", value: 312, icon: Handshake, color: "from-secondary to-chart-3" },
];

export const FunnelChart = () => {
  const maxValue = funnelData[0].value;

  return (
    <div className="glass rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Funil de Vendas</h3>
        <p className="text-sm text-muted-foreground">Conversão por etapa</p>
      </div>

      <div className="space-y-4">
        {funnelData.map((item, index) => {
          const width = (item.value / maxValue) * 100;
          const prevValue = index > 0 ? funnelData[index - 1].value : null;
          const conversionRate = prevValue
            ? ((item.value / prevValue) * 100).toFixed(1)
            : null;

          return (
            <div key={item.stage} className="relative">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color}`}>
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{item.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {item.value.toLocaleString("pt-BR")}
                      </span>
                      {conversionRate && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {conversionRate}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-success/10 border border-success/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Taxa de conversão total</span>
          <span className="text-lg font-bold text-success">
            {((funnelData[funnelData.length - 1].value / funnelData[0].value) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};
