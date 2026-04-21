import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Area, Line, Legend, CartesianGrid } from "recharts";
import { Sparkles } from "lucide-react";
import { useWinLossScenarios } from "@/hooks/win-loss/useWinLossScenarios";
import type { TrendPoint } from "@/hooks/win-loss/useWinLossAggregations";

interface Props {
  points: TrendPoint[];
}

export const ScenarioForecastChart = memo(function ScenarioForecastChart({ points }: Props) {
  const { series, stdDev } = useWinLossScenarios(points, 3);
  const data = useMemo(
    () =>
      series.map(p => ({
        period: p.period,
        realistic: Number(p.realistic.toFixed(1)),
        optimistic: Number(p.optimistic.toFixed(1)),
        pessimistic: Number(p.pessimistic.toFixed(1)),
        band: Number((p.optimistic - p.pessimistic).toFixed(1)),
        baseline: Number(p.pessimistic.toFixed(1)),
        isForecast: p.isForecast,
      })),
    [series],
  );

  if (!data.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          Forecast com cenários
          <span className="text-xs text-muted-foreground font-normal ml-auto">σ ±{stdDev.toFixed(1)}pp</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[260px] p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} unit="%" />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              formatter={(v: number, n: string) => [`${v}%`, n]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area dataKey="baseline" stackId="band" stroke="transparent" fill="transparent" legendType="none" />
            <Area dataKey="band" stackId="band" stroke="transparent" fill="hsl(var(--primary))" fillOpacity={0.12} name="Faixa otimista↔pessimista" />
            <Line type="monotone" dataKey="optimistic" stroke="hsl(160 84% 39%)" strokeWidth={2} dot={false} name="Otimista" />
            <Line type="monotone" dataKey="realistic" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} name="Realista" />
            <Line type="monotone" dataKey="pessimistic" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="Pessimista" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});
