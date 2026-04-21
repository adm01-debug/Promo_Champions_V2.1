import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  Line,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Sparkles } from "lucide-react";
import { useWinLossScenarios } from "@/hooks/win-loss/useWinLossScenarios";
import type { TrendPoint } from "@/hooks/win-loss/useWinLossAggregations";

interface Props {
  points: TrendPoint[];
}

interface TooltipPayloadItem {
  value: number;
  name: string;
  color: string;
  dataKey: string;
  payload: { isForecast: boolean; period: string };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const isForecast = payload[0]?.payload?.isForecast;
  return (
    <div className="rounded-md border bg-popover p-2 text-xs shadow-md min-w-[180px]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-medium">{label}</span>
        <span
          className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
            isForecast
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isForecast ? "Previsão" : "Histórico"}
        </span>
      </div>
      {payload
        .filter((p) => p.dataKey === "realistic" || p.dataKey === "optimistic" || p.dataKey === "pessimistic")
        .map((p) => (
          <p key={p.dataKey} style={{ color: p.color }} className="tabular-nums">
            {p.name}: {p.value.toFixed(1)}%
          </p>
        ))}
    </div>
  );
}

export const ScenarioForecastChart = memo(function ScenarioForecastChart({ points }: Props) {
  const { series, stdDev, fitN } = useWinLossScenarios(points, 3);

  const data = useMemo(
    () =>
      series.map((p) => ({
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

  // Last historical period (junction marker between historical and forecast).
  const junctionPeriod = useMemo(() => {
    const lastHistorical = [...series].reverse().find((p) => !p.isForecast);
    return lastHistorical?.period ?? null;
  }, [series]);

  // Stable key: forces Recharts to fully reset internals when filters change
  // the underlying dataset shape or scale.
  const chartKey = useMemo(
    () => `scenario-${data.length}-${data[0]?.period ?? ""}-${stdDev.toFixed(2)}-${fitN}`,
    [data, stdDev, fitN],
  );

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            Forecast com cenários
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[260px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center">
            Sem dados suficientes para projeção.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (fitN < 3) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            Forecast com cenários
            <span className="text-xs text-muted-foreground font-normal ml-auto">
              {fitN} de 3 períodos
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[260px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center max-w-[260px]">
            Necessários ao menos <strong>3 períodos</strong> com dados para projeção confiável.
            Ajuste os filtros ou aguarde mais histórico.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          Forecast com cenários
          <span
            className="text-xs text-muted-foreground font-normal ml-auto tabular-nums"
            title={`Desvio residual sobre a tendência ajustada com ${fitN} períodos`}
          >
            σ ±{stdDev.toFixed(1)}pp · fit em {fitN}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[260px] p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart key={chartKey} data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} unit="%" domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {junctionPeriod && (
              <ReferenceLine
                x={junctionPeriod}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                label={{
                  value: "início da previsão",
                  position: "insideTopRight",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 10,
                }}
              />
            )}
            <Area
              dataKey="baseline"
              stackId="band"
              stroke="transparent"
              fill="transparent"
              legendType="none"
            />
            <Area
              dataKey="band"
              stackId="band"
              stroke="transparent"
              fill="hsl(var(--primary))"
              fillOpacity={0.12}
              name="Faixa otimista↔pessimista"
            />
            <Line
              type="monotone"
              dataKey="optimistic"
              stroke="hsl(160 84% 39%)"
              strokeWidth={2}
              dot={false}
              name="Otimista"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="realistic"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              name="Realista"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="pessimistic"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              dot={false}
              name="Pessimista"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});
