import { Receipt, Percent, Clock, RotateCcw, CreditCard, Wallet } from "lucide-react";

const kpis = [
  {
    title: "Ticket Médio",
    value: "R$ 2.716",
    change: 8.2,
    icon: Receipt,
  },
  {
    title: "Taxa de Conversão",
    value: "24.9%",
    change: 3.1,
    icon: Percent,
  },
  {
    title: "Tempo Médio",
    value: "12 dias",
    change: -15.3,
    icon: Clock,
  },
  {
    title: "Taxa de Retorno",
    value: "18.5%",
    change: 5.7,
    icon: RotateCcw,
  },
  {
    title: "Ticket Recorrente",
    value: "R$ 1.890",
    change: 12.4,
    icon: CreditCard,
  },
  {
    title: "LTV Médio",
    value: "R$ 8.250",
    change: 9.8,
    icon: Wallet,
  },
];

export const KPIGrid = () => {
  return (
    <div className="glass rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">KPIs Principais</h3>
        <p className="text-sm text-muted-foreground">Indicadores de performance</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {kpis.map((kpi) => {
          const isPositive = kpi.change > 0;
          const Icon = kpi.icon;

          return (
            <div
              key={kpi.title}
              className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
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
          );
        })}
      </div>
    </div>
  );
};
