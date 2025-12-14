import { Users, UserCheck, FileText, Handshake, TrendingUp, Loader2 } from "lucide-react";
import { useFunnelData } from "@/hooks/useFunnelData";

const ICONS = {
  Leads: Users,
  Qualificados: UserCheck,
  Propostas: FileText,
  Fechados: Handshake,
};

const COLORS = {
  Leads: "from-primary to-primary",
  Qualificados: "from-primary to-secondary",
  Propostas: "from-secondary to-accent",
  Fechados: "from-accent to-status-success",
};

export const FunnelChart = () => {
  const { data: funnelData, isLoading } = useFunnelData();

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 border border-border/40 dark:border-glow card-elevated">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const data = funnelData || [];
  const maxValue = data.length > 0 ? data[0].value : 1;
  const totalConversion = data.length >= 2 && data[0].value > 0 
    ? ((data[data.length - 1].value / data[0].value) * 100).toFixed(1)
    : "0.0";

  if (data.every(d => d.value === 0)) {
    return (
      <div className="glass rounded-xl p-6 border border-border/40 dark:border-glow card-elevated">
        <div className="mb-6">
          <h3 className="text-lg font-semibold font-display gradient-text">Funil de Vendas</h3>
          <p className="text-sm text-muted-foreground">Conversão por etapa</p>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>Nenhum lead no funil ainda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 border border-border/40 dark:border-glow card-elevated">
      <div className="mb-6">
        <h3 className="text-lg font-semibold font-display gradient-text">Funil de Vendas</h3>
        <p className="text-sm text-muted-foreground">Conversão por etapa</p>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const width = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const prevValue = index > 0 ? data[index - 1].value : null;
          const conversionRate = prevValue && prevValue > 0
            ? ((item.value / prevValue) * 100).toFixed(1)
            : null;
          
          const IconComponent = ICONS[item.stage as keyof typeof ICONS] || Users;
          const color = COLORS[item.stage as keyof typeof COLORS] || "from-primary to-primary";

          return (
            <div key={item.stage} className="relative group">
              <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform`}>
                  <IconComponent className="h-4 w-4 text-primary-foreground" />
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
                      className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
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
