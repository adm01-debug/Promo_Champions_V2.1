import { FC } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuotaForecasts } from "@/hooks/revenue/useQuotaAttainmentPredictor";
import { RISK_HSL, RISK_LABEL, fmtPct } from "./quotaPredictorAdvancedHelpers";

export const QuotaRiskHeatmap: FC = () => {
  const { data: forecasts = [] } = useQuotaForecasts();
  const sorted = [...forecasts].sort((a, b) => a.attainment_probability - b.attainment_probability);

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Heatmap de risco</CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Sem dados.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {sorted.map((f) => (
              <div
                key={f.id}
                className="rounded-lg p-3 text-center border border-border/50"
                style={{ background: `${RISK_HSL[f.risk_level]} / 0.12`, backgroundColor: `color-mix(in hsl, ${RISK_HSL[f.risk_level]} 18%, hsl(var(--card)))` }}
              >
                <p className="text-xs font-medium truncate" title={f.salesperson?.name ?? ""}>
                  {f.salesperson?.name ?? "—"}
                </p>
                <p className="text-lg font-display font-semibold mt-1">{fmtPct(f.attainment_probability)}</p>
                <Badge variant="outline" className="text-[10px] mt-1 border-0" style={{ color: RISK_HSL[f.risk_level] }}>
                  {RISK_LABEL[f.risk_level]}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
