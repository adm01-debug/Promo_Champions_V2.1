import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { StageConversionMetric } from "@/hooks/deal-intelligence/useStageConversion";
import { severityFillHsl, stageLabel } from "./conversionHelpers";
import type { Severity } from "./conversionHelpers";

interface Props {
  metrics: StageConversionMetric[];
}

function severityFor(rate: number): Severity {
  if (rate >= 60) return "low";
  if (rate >= 40) return "medium";
  if (rate >= 20) return "high";
  return "critical";
}

export function ConversionFunnelChart({ metrics }: Props) {
  const data = metrics.map((m) => ({
    name: `${stageLabel(m.from_stage)} → ${stageLabel(m.to_stage)}`,
    rate: Number(m.conversion_rate),
    entered: m.entered_count,
    converted: m.converted_count,
    lost: m.lost_count,
    severity: severityFor(Number(m.conversion_rate)),
  }));

  return (
    <Card variant="elevated" className="glass border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-primary" />
          Funil de conversão por estágio
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!data.length ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Sem dados de conversão. Execute a análise para gerar.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, data.length * 56)}>
            <BarChart data={data} layout="vertical" margin={{ left: 16, right: 24 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={11} />
              <YAxis dataKey="name" type="category" width={140} fontSize={11} />
              <Tooltip
                formatter={(value: any, _n: any, p: any) => {
                  if (p.dataKey === "rate") return [`${value.toFixed(1)}%`, "Conversão"];
                  return [value, _n];
                }}
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={severityFillHsl[d.severity]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
