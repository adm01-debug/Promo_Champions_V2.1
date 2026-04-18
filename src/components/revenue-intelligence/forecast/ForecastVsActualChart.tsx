import { FC, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { useForecastAccuracy } from "@/hooks/revenue-intelligence/useForecastAccuracy";
import { formatBRL } from "./forecastHelpers";
import type { RechartsTooltipProps } from "@/types/recharts";

const CustomTooltip: FC<RechartsTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-2 text-xs shadow-md">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {formatBRL(p.value)}
        </p>
      ))}
    </div>
  );
};

export const ForecastVsActualChart: FC = () => {
  const { data, isLoading } = useForecastAccuracy(60);

  const chartData = useMemo(() => {
    if (!data) return [];
    const byPeriod = new Map<
      string,
      { period: string; forecast: number; actual: number }
    >();
    for (const row of data) {
      const snap = row.forecast_snapshots;
      if (!snap) continue;
      const key = snap.period_start.slice(0, 7);
      const e = byPeriod.get(key) ?? { period: key, forecast: 0, actual: 0 };
      e.forecast += Number(snap.weighted_amount ?? 0);
      e.actual += Number(row.actual_amount ?? 0);
      byPeriod.set(key, e);
    }
    return Array.from(byPeriod.values()).sort((a, b) =>
      a.period.localeCompare(b.period),
    );
  }, [data]);

  if (isLoading) return <Skeleton className="h-72" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Forecast vs Realizado</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            Sem snapshots avaliados ainda. Gere snapshots e rode "Calcular".
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="period" className="text-xs" />
              <YAxis
                className="text-xs"
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Realizado"
                stroke="hsl(var(--chart-2, 142 76% 36%))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
