import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { RechartsTooltipProps } from "@/types/recharts";

interface Props {
  data: { label: string; count: number }[];
}

const Tip = ({ active, payload }: RechartsTooltipProps) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <div className="font-medium">{String(p.payload.label)}</div>
      <div className="text-muted-foreground">{p.value} ocorrências</div>
    </div>
  );
};

export const ObjectionsTrendChart = ({ data }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top objeções recorrentes</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Nenhuma objeção identificada ainda.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(180, data.length * 38)}>
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
              <YAxis
                dataKey="label"
                type="category"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                width={140}
                tickFormatter={(v: string) => (v.length > 22 ? `${v.slice(0, 22)}…` : v)}
              />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
