import { FC, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useForecastAccuracy } from "@/hooks/revenue-intelligence/useForecastAccuracy";
import { formatMape } from "./forecastHelpers";

export const MapeBySegmentChart: FC = () => {
  const { data, isLoading } = useForecastAccuracy(200);

  const chartData = useMemo(() => {
    if (!data) return [];
    const bySeg = new Map<string, { segment: string; mapes: number[] }>();
    for (const row of data) {
      const seg = row.forecast_snapshots?.segment ?? "geral";
      const e = bySeg.get(seg) ?? { segment: seg, mapes: [] };
      e.mapes.push(Number(row.mape ?? 0));
      bySeg.set(seg, e);
    }
    return Array.from(bySeg.values()).map((e) => ({
      segment: e.segment,
      mape:
        Math.round(
          (e.mapes.reduce((s, v) => s + v, 0) / Math.max(e.mapes.length, 1)) * 100,
        ) / 100,
    }));
  }, [data]);

  if (isLoading) return <Skeleton className="h-60" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">MAPE por Segmento</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Sem dados ainda.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="segment" className="text-xs" />
              <YAxis
                className="text-xs"
                tickFormatter={(v: any) => `${v}%`}
              />
              <Tooltip formatter={(v: any) => formatMape(v)} />
              <Bar dataKey="mape" name="MAPE" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
