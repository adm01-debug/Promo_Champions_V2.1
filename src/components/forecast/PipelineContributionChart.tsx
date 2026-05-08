import { FC, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCompactBRL, scenarioChartColor } from "./forecastHelpers";

interface OwnerRow {
  salesperson_id: string | null;
  weighted_forecast: number;
  pessimistic_30d: number;
  optimistic_30d: number;
}

interface Props {
  perOwner: OwnerRow[];
  ownerNames?: Record<string, string>;
}

export const PipelineContributionChart: FC<Props> = ({ perOwner, ownerNames = {} }) => {
  const data = useMemo(
    () =>
      [...perOwner]
        .filter((r) => r.salesperson_id)
        .sort((a, b) => Number(b.weighted_forecast) - Number(a.weighted_forecast))
        .slice(0, 8)
        .map((r) => ({
          name: ownerNames[r.salesperson_id ?? ""] ?? (r.salesperson_id ?? "").slice(0, 6),
          pessimista: Math.round(Number(r.pessimistic_30d)),
          realista: Math.round(Number(r.weighted_forecast)),
          otimista: Math.round(Number(r.optimistic_30d)),
        })),
    [perOwner, ownerNames],
  );

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contribuição por Vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-12">
            Sem dados de pipeline para exibir.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Contribuição por Vendedor (Top 8)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v) => formatCompactBRL(Number(v))}
                className="text-xs fill-muted-foreground"
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                className="text-xs fill-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: any) => formatCompactBRL(v)}
              />
              <Bar dataKey="pessimista" fill={scenarioChartColor.pessimistic} radius={[0, 4, 4, 0]} />
              <Bar dataKey="realista" fill={scenarioChartColor.realistic} radius={[0, 4, 4, 0]} />
              <Bar dataKey="otimista" fill={scenarioChartColor.optimistic} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
