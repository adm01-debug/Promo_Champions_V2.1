import { memo, useEffect, useMemo, useState } from "react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWinLossScenarios, type BandMode } from "@/hooks/win-loss/useWinLossScenarios";
import { ScenarioForecastAuditPanel } from "./ScenarioForecastAuditPanel";
import type { TrendPoint } from "@/hooks/win-loss/useWinLossAggregations";

type ForecastHorizon = 3 | 6 | 12;

interface Props {
  points: TrendPoint[];
  horizon?: ForecastHorizon;
  onHorizonChange?: (h: ForecastHorizon) => void;
}

const BAND_MODE_KEY = "winloss-scenario-bandmode";
const SEE_OLS_KEY = "winloss-scenario-see-ols-inflation";

function readBandMode(): BandMode {
  if (typeof window === "undefined") return "see";
  const v = window.localStorage.getItem(BAND_MODE_KEY);
  return v === "pi95" ? "pi95" : "see";
}

function readSeeOlsInflation(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SEE_OLS_KEY) === "1";
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
  mode?: BandMode;
}

function CustomTooltip({ active, payload, label, mode }: CustomTooltipProps) {
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
      {isForecast && mode && (
        <p className="mt-1 pt-1 border-t border-border/50 text-[10px] text-muted-foreground">
          Modo: {mode === "pi95" ? "PI 95%" : "SEE ±σ"}
        </p>
      )}
    </div>
  );
}

export const ScenarioForecastChart = memo(function ScenarioForecastChart({
  points,
  horizon = 3,
  onHorizonChange,
}: Props) {
  const [bandMode, setBandMode] = useState<BandMode>(() => readBandMode());
  const [seeUseOlsInflation, setSeeUseOlsInflation] = useState<boolean>(() => readSeeOlsInflation());

  useEffect(() => {
    try {
      window.localStorage.setItem(BAND_MODE_KEY, bandMode);
    } catch {
      /* ignore */
    }
  }, [bandMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SEE_OLS_KEY, seeUseOlsInflation ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [seeUseOlsInflation]);

  const { series, stdDev, slope, intercept, sse, dof, meanX, sxx, fitN, tCritical, bandLabel } =
    useWinLossScenarios(points, {
      forecastSteps: horizon,
      bandMode,
      seeUseOlsInflation,
    });

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

  // Stable key: forces Recharts to fully reset internals (axes, scales, tooltip
  // cache) when filters change the underlying dataset. Includes a compact
  // signature of every point so two distinct series of equal length cannot
  // collide on the same key.
  const chartKey = useMemo(() => {
    const signature = data
      .map((d) => `${d.period}:${d.realistic}:${d.pessimistic}:${d.optimistic}:${d.isForecast ? 1 : 0}`)
      .join("|");
    return `scenario-${bandMode}-h${horizon}-${data.length}-${fitN}-${stdDev.toFixed(2)}-${signature}`;
  }, [data, stdDev, fitN, bandMode, horizon]);

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
        <CardTitle className="flex items-center gap-2 text-base flex-wrap">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          Forecast com cenários
          <TooltipProvider delayDuration={150}>
            <div className="ml-auto flex items-center gap-1.5">
              <ToggleGroup
                type="single"
                size="sm"
                value={String(horizon)}
                onValueChange={(v) => {
                  if (!v) return;
                  const n = Number(v) as ForecastHorizon;
                  if ([3, 6, 12].includes(n)) onHorizonChange?.(n);
                }}
                aria-label="Horizonte de previsão"
              >
                {([3, 6, 12] as const).map((h) => (
                  <UITooltip key={h}>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem
                        value={String(h)}
                        className="h-6 px-2 text-[10px] font-medium tabular-nums"
                        aria-label={`${h} períodos`}
                      >
                        {h}
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Projetar {h} períodos à frente
                    </TooltipContent>
                  </UITooltip>
                ))}
              </ToggleGroup>
              <ToggleGroup
                type="single"
                size="sm"
                value={bandMode}
                onValueChange={(v) => v && setBandMode(v as BandMode)}
                aria-label="Modo de banda de incerteza"
              >
                <UITooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="see" className="h-6 px-2 text-[10px] font-medium" aria-label="Modo SEE (1σ)">
                      SEE
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-[220px]">
                    Banda ±σ residual (Standard Error of Estimate). Mais estreita, ~68% de confiança.
                  </TooltipContent>
                </UITooltip>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="pi95" className="h-6 px-2 text-[10px] font-medium" aria-label="Modo PI 95%">
                      PI 95%
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-[240px]">
                    Intervalo de previsão 95% (t·σ·√(1+1/n+(x−x̄)²/Sxx)). Mais conservador, leva em conta a distância do centro dos dados.
                  </TooltipContent>
                </UITooltip>
              </ToggleGroup>
            </div>
          </TooltipProvider>
          <span
            className="text-xs text-muted-foreground font-normal tabular-nums w-full sm:w-auto"
            title={`${bandLabel} sobre a tendência ajustada com ${fitN} períodos`}
          >
            {bandMode === "pi95" && tCritical != null
              ? `PI 95% · t=${tCritical.toFixed(2)} · σ ±${stdDev.toFixed(1)}pp · fit em ${fitN}`
              : `σ ±${stdDev.toFixed(1)}pp · fit em ${fitN}`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[260px] p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart key={chartKey} data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} unit="%" domain={[0, 100]} />
            <Tooltip content={<CustomTooltip mode={bandMode} />} />
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
      <ScenarioForecastAuditPanel
        slope={slope}
        intercept={intercept}
        stdDev={stdDev}
        sse={sse}
        dof={dof}
        fitN={fitN}
        meanX={meanX}
        sxx={sxx}
        bandMode={bandMode}
        tCritical={tCritical}
      />
    </Card>
  );
});
