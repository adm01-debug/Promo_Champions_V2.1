import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import type { RechartsTooltipProps } from "@/types/recharts";

interface Props {
  data: { sentiment: string; label: string; value: number; color: string }[];
}

const Tip = ({ active, payload }: RechartsTooltipProps) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <div className="font-medium">{String(p.payload.label)}</div>
      <div className="text-muted-foreground">{p.value} análises</div>
    </div>
  );
};

export const SentimentDistributionCard = ({ data }: Props) => {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Distribuição de sentimento</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Sem análises ainda.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="label" innerRadius={48} outerRadius={80} paddingAngle={2}>
                {data.map((d) => (
                  <Cell key={d.sentiment} fill={d.color} />
                ))}
              </Pie>
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
