import { Users, UserCheck, FileText, Handshake, TrendingUp } from "lucide-react";

const funnelData = [
  { stage: "Leads", value: 1250, icon: Users, color: "from-primary to-primary" },
  { stage: "Qualificados", value: 840, icon: UserCheck, color: "from-primary to-secondary" },
  { stage: "Propostas", value: 420, icon: FileText, color: "from-secondary to-accent" },
  { stage: "Fechados", value: 312, icon: Handshake, color: "from-accent to-status-success" },
];

export const FunnelChart = () => {
  const maxValue = funnelData[0].value;
  const totalConversion = ((funnelData[funnelData.length - 1].value / funnelData[0].value) * 100).toFixed(1);

  return (
    <div className="glass rounded-xl p-6 border border-border/40 dark:border-glow card-elevated">
      <div className="mb-6">
        <h3 className="text-lg font-semibold font-display gradient-text">Funil de Vendas</h3>
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
            <div key={item.stage} className="relative group">
              <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} shadow-lg group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium font-display">{item.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold gradient-text">
                        {item.value.toLocaleString("pt-BR")}
                      </span>
                      {conversionRate && (
                        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border/40">
                          {conversionRate}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-2.5 bg-muted/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000 ease-out`}
                      style={{ 
                        width: `${width}%`,
                        boxShadow: "0 0 8px hsl(var(--primary) / 0.3)"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-xl glass border border-status-success/30 hover-lift cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-status-success/20">
              <TrendingUp className="h-4 w-4 text-status-success" />
            </div>
            <span className="text-sm text-muted-foreground">Taxa de conversão total</span>
          </div>
          <span className="text-xl font-bold text-status-success font-display">
            {totalConversion}%
          </span>
        </div>
      </div>
    </div>
  );
};
