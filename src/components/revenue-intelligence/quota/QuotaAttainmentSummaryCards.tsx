import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, Target, Activity } from "lucide-react";
import type { QuotaPrediction } from "@/hooks/revenue/useQuotaAttainment";
import { formatCurrency, formatPct } from "./quotaPredictorHelpers";

interface Props {
  predictions: QuotaPrediction[];
}

export const QuotaAttainmentSummaryCards: FC<Props> = ({ predictions }) => {
  const total = predictions.length;
  const onTrack = predictions.filter((p) => p.risk_level === "safe" || p.risk_level === "on_track").length;
  const atRisk = predictions.filter((p) => p.risk_level === "at_risk" || p.risk_level === "critical").length;
  const totalGap = predictions.reduce((s, p) => s + Math.max(0, p.quota_amount - p.predicted_amount), 0);
  const avgProb = total > 0 ? predictions.reduce((s, p) => s + p.attainment_probability, 0) / total : 0;
  const pctOnTrack = total > 0 ? onTrack / total : 0;

  const items = [
    {
      label: "Time no ritmo",
      value: `${onTrack}/${total}`,
      sub: formatPct(pctOnTrack),
      icon: TrendingUp,
      color: "text-success",
    },
    {
      label: "Vendedores em risco",
      value: String(atRisk),
      sub: total > 0 ? formatPct(atRisk / total) : "0%",
      icon: AlertTriangle,
      color: "text-destructive",
    },
    {
      label: "Gap projetado total",
      value: formatCurrency(totalGap),
      sub: "vs quota agregada",
      icon: Target,
      color: "text-warning",
    },
    {
      label: "Prob. média de atingimento",
      value: formatPct(avgProb),
      sub: "ponderada pelo time",
      icon: Activity,
      color: "text-primary",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Card key={it.label} variant="elevated">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{it.label}</p>
                  <p className="text-2xl font-display font-semibold mt-1">{it.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{it.sub}</p>
                </div>
                <Icon className={`h-5 w-5 ${it.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
