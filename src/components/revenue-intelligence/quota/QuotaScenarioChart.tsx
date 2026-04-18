import { FC } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import type { QuotaPrediction } from "@/hooks/revenue/useQuotaAttainment";
import type { RechartsTooltipProps } from "@/types/recharts";
import { formatCurrency } from "./quotaPredictorHelpers";

interface Props {
  predictions: QuotaPrediction[];
}

const CustomTooltip: FC<RechartsTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover p-2 text-xs shadow-md">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export const QuotaScenarioChart: FC<Props> = ({ predictions }) => {
  const data = predictions.map((p) => ({
    name: p.salesperson?.name ?? "—",
    pessimistic: Math.round(p.scenario_pessimistic),
    realistic: Math.round(p.scenario_realistic),
    optimistic: Math.round(p.scenario_optimistic),
    quota: Math.round(p.quota_amount),
  }));

  const avgQuota = data.length > 0 ? data.reduce((s, d) => s + d.quota, 0) / data.length : 0;

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Cenários de fechamento por vendedor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine y={avgQuota} stroke="hsl(var(--destructive))" strokeDasharray="4 4" label={{ value: "Quota média", fill: "hsl(var(--destructive))", fontSize: 11 }} />
              <Bar dataKey="pessimistic" name="P10 (pessimista)" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="realistic" name="P50 (realista)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="optimistic" name="P90 (otimista)" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
