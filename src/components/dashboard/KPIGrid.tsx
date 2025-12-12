import { Card } from "@/components/ui/card";
import { 
  Receipt, 
  UserCheck, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Percent
} from "lucide-react";

const kpis = [
  {
    title: "Ticket Médio",
    value: "R$ 4.850",
    change: "+8.2%",
    icon: Receipt,
    positive: true,
  },
  {
    title: "Taxa de Conversão",
    value: "12.6%",
    change: "+2.1%",
    icon: Percent,
    positive: true,
  },
  {
    title: "Tempo Médio de Fechamento",
    value: "18 dias",
    change: "-3 dias",
    icon: Clock,
    positive: true,
  },
  {
    title: "Clientes Recorrentes",
    value: "67%",
    change: "+5.4%",
    icon: UserCheck,
    positive: true,
  },
  {
    title: "Margem de Lucro",
    value: "32.5%",
    change: "+1.8%",
    icon: TrendingUp,
    positive: true,
  },
  {
    title: "Taxa de Inadimplência",
    value: "3.2%",
    change: "-0.5%",
    icon: AlertTriangle,
    positive: true,
  },
];

export function KPIGrid() {
  return (
    <Card className="p-6 shadow-soft">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">KPIs do Período</h3>
        <p className="text-sm text-muted-foreground">Indicadores-chave de performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.title}
            className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-background shadow-sm group-hover:shadow-md transition-shadow">
                <kpi.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{kpi.value}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{kpi.title}</p>
              <span
                className={`text-xs font-semibold ${
                  kpi.positive ? "text-success" : "text-destructive"
                }`}
              >
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}