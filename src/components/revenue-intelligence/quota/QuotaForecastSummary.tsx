import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Target, ShieldCheck, AlertOctagon, TrendingUp } from "lucide-react";
import { useQuotaForecastSummary } from "@/hooks/revenue/useQuotaAttainmentPredictor";
import { fmtBRL, fmtPct } from "./quotaPredictorAdvancedHelpers";

export const QuotaForecastSummary: FC = () => {
  const s = useQuotaForecastSummary();
  const cards = [
    { icon: ShieldCheck, label: "Vendedores seguros", value: `${s.safe}/${s.total}`, sub: fmtPct(s.safePct), tint: "text-success" },
    { icon: AlertOctagon, label: "Em risco crítico", value: `${s.critical}/${s.total}`, sub: fmtPct(s.criticalPct), tint: "text-destructive" },
    { icon: Target, label: "Gap total (P50)", value: fmtBRL(s.gap), sub: "vs meta", tint: "text-warning" },
    { icon: TrendingUp, label: "Probabilidade média", value: fmtPct(s.avgProb), sub: "atingir quota", tint: "text-primary" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{c.label}</span>
              <c.icon className={`h-4 w-4 ${c.tint}`} />
            </div>
            <p className="text-2xl font-display font-semibold">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
