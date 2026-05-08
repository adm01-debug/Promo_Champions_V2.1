import { FC, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, ComposedChart, Bar, ErrorBar, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from "recharts";
import { useQuotaForecasts } from "@/hooks/revenue/useQuotaAttainmentPredictor";
import { RISK_HSL, fmtBRL } from "./quotaPredictorAdvancedHelpers";

export const QuotaProbabilityChart: FC = () => {
  const { data: forecasts = [] } = useQuotaForecasts();
  const chart = useMemo(() => forecasts.map((f) => ({
    name: f.salesperson?.name ?? "—",
    p50: f.p50,
    quota: f.quota,
    fill: RISK_HSL[f.risk_level],
    error: [Math.max(0, f.p50 - f.p10), Math.max(0, f.p90 - f.p50)] as [number, number],
  })), [forecasts]);

  if (forecasts.length === 0) {
    return (
      <Card variant="elevated">
        <CardHeader><CardTitle>Projeção P10–P90 por vendedor</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground py-8 text-center">Sem forecasts ainda. Recalcule predições para gerar.</CardContent>
      </Card>
    );
  }

  const avgQuota = chart.reduce((s, c) => s + c.quota, 0) / Math.max(1, chart.length);

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Projeção P10–P90 por vendedor</CardTitle>
      </CardHeader>
      <CardContent className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chart} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={60} stroke="hsl(var(--muted-foreground))" />
            <YAxis tickFormatter={(v) => fmtBRL(Number(v))} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              formatter={(v: any, k: any) => [fmtBRL(v), k === "p50" ? "P50 (mediana)" : k === "quota" ? "Meta" : k]}
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
            />
            <ReferenceLine y={avgQuota} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label={{ value: "Meta média", fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
            <Bar dataKey="p50" radius={[4, 4, 0, 0]}>
              <ErrorBar dataKey="error" width={6} strokeWidth={2} stroke="hsl(var(--foreground))" direction="y" />
              {chart.map((c, i) => <rect key={i} fill={c.fill} />)}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
