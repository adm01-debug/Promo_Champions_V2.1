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
  Legend,
} from "recharts";
import { useConfidenceScores } from "@/hooks/revenue-intelligence/useForecastAccuracy";
import { sourceLabel } from "./forecastHelpers";

export const ForecastBiasChart: FC = () => {
  const { data, isLoading } = useConfidenceScores();

  const chartData = useMemo(() => {
    if (!data) return [];
    const bySource = new Map<
      string,
      { source: string; optimistic: number; pessimistic: number; accurate: number }
    >();
    for (const s of data) {
      const e = bySource.get(s.source) ?? {
        source: sourceLabel[s.source] ?? s.source,
        optimistic: 0,
        pessimistic: 0,
        accurate: 0,
      };
      e[s.bias_trend] += 1;
      bySource.set(s.source, e);
    }
    return Array.from(bySource.values());
  }, [data]);

  if (isLoading) return <Skeleton className="h-72" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Viés por Source</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            Sem dados de confiança ainda.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="source" className="text-xs" />
              <YAxis className="text-xs" allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="accurate" name="Preciso" fill="hsl(142 76% 36%)" />
              <Bar dataKey="optimistic" name="Otimista" fill="hsl(38 92% 50%)" />
              <Bar dataKey="pessimistic" name="Pessimista" fill="hsl(217 91% 60%)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
