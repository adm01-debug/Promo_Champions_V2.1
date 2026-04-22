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
import { Sparkles, HelpCircle, Sigma } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useWinLossScenarios, type BandMode, type ConfidenceLevel, CONFIDENCE_LEVELS } from "@/hooks/win-loss/useWinLossScenarios";
import { ScenarioForecastAuditPanel } from "./ScenarioForecastAuditPanel";
import { ScenarioFormulaExplainerDialog } from "./ScenarioFormulaExplainerDialog";
import type { TrendPoint } from "@/hooks/win-loss/useWinLossAggregations";
import { buildScenarioChartKey } from "@/lib/winloss/scenarioChartKey";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

type ForecastHorizon = 3 | 6 | 12;

interface Props {
  points: TrendPoint[];
  horizon?: ForecastHorizon;
  onHorizonChange?: (h: ForecastHorizon) => void;
}

const BAND_MODE_KEY = "winloss-scenario-bandmode";
const LEGACY_SEE_OLS_KEY = "winloss-scenario-see-ols-inflation";
const CONFIDENCE_Z_KEY = "winloss-scenario-confidence-z";
const PI_LEVEL_KEY = "winloss-scenario-pi-level";

const Z_PRESETS: ReadonlyArray<{ z: number; label: string; pct: string }> = [
  { z: 1.0, label: "68%", pct: "1 desvio-padrão" },
  { z: 1.28, label: "80%", pct: "z = 1.28" },
  { z: 1.645, label: "90%", pct: "z = 1.645" },
  { z: 1.96, label: "95%", pct: "z = 1.96" },
];

const PI_LEVEL_OPTIONS: ReadonlyArray<{ level: ConfidenceLevel; label: string; hint: string }> = [
  { level: 0.90, label: "90%", hint: "Banda mais estreita · maior risco de cobertura" },
  { level: 0.95, label: "95%", hint: "Padrão estatístico · recomendado" },
  { level: 0.99, label: "99%", hint: "Banda mais ampla · maior segurança" },
];

const Z_MIN = 0.5;
const Z_MAX = 3.0;

function readBandMode(): BandMode {
  if (typeof window === "undefined") return "see";
  const v = window.localStorage.getItem(BAND_MODE_KEY);
  return v === "pi95" ? "pi95" : "see";
}

function readConfidenceZ(): number {
  if (typeof window === "undefined") return 1;
  const raw = window.localStorage.getItem(CONFIDENCE_Z_KEY);
  if (!raw) return 1;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < Z_MIN || n > Z_MAX) return 1;
  return n;
}

function readConfidenceLevel(): ConfidenceLevel {
  if (typeof window === "undefined") return 0.95;
  const raw = window.localStorage.getItem(PI_LEVEL_KEY);
  if (!raw) return 0.95;
  const n = Number(raw);
  if (n === 0.90 || n === 0.95 || n === 0.99) return n;
  return 0.95;
}

function pctFromZ(z: number): string {
  // Approximation of the two-tailed normal CDF coverage for the chip label.
  const preset = Z_PRESETS.find((p) => Math.abs(p.z - z) < 0.01);
  if (preset) return preset.label;
  // Abramowitz & Stegun cheap approximation
  const erf = (x: number) => {
    const sign = x < 0 ? -1 : 1;
    const ax = Math.abs(x);
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const t = 1 / (1 + p * ax);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
    return sign * y;
  };
  return `${Math.round(erf(z / Math.SQRT2) * 100)}%`;
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
  bandLabel?: string;
}

function CustomTooltip({ active, payload, label, mode, bandLabel }: CustomTooltipProps) {
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
          Modo: {bandLabel ?? (mode === "pi95" ? "PI 95%" : "SEE ±σ")}
        </p>
      )}
    </div>
  );
}

interface ActiveFormulaBadgeProps {
  bandMode: BandMode;
  confidenceZ: number;
  zPctLabel: string;
  tCritical: number | null;
  dof: number;
  stdDev: number;
  fitN: number;
  confidenceLevel: ConfidenceLevel;
}

function ActiveFormulaBadge({
  bandMode,
  confidenceZ,
  zPctLabel,
  tCritical,
  dof,
  stdDev,
  fitN,
  confidenceLevel,
}: ActiveFormulaBadgeProps) {
  const isPi = bandMode === "pi95";
  const levelPct = Math.round(confidenceLevel * 100);
  const formula = isPi
    ? `PI ${levelPct}% · ±t·σ·√(1+1/n+(x−x̄)²/Sxx)`
    : "SEE · ±z·σ";
  const paramLine = isPi
    ? `t = ${(tCritical ?? 0).toFixed(2)}  (gl=${dof}, ${levelPct}%)`
    : `z = ${confidenceZ.toFixed(2)}  (${zPctLabel})`;
  const sigmaLine = `σ = ${stdDev.toFixed(1)} pp · fit n=${fitN}`;
  const a11y = `Fórmula ativa: ${isPi ? `PI ${levelPct}%` : "SEE"}, ${
    isPi
      ? `t crítico ${(tCritical ?? 0).toFixed(2)} com ${dof} graus de liberdade no nível ${levelPct} por cento`
      : `z ${confidenceZ.toFixed(2)} (${zPctLabel})`
  }, sigma ${stdDev.toFixed(1)} pontos percentuais em ${fitN} períodos`;

  return (
    <div
      className="hidden sm:block absolute top-2 right-3 z-10 max-w-[230px] rounded-md border border-border/60 bg-popover/85 backdrop-blur-sm px-2 py-1.5 shadow-sm pointer-events-none"
      role="status"
      aria-live="polite"
      aria-label={a11y}
    >
      <div className="flex items-center gap-1 text-[10px] font-medium text-foreground leading-tight">
        <Sigma className="h-3 w-3 text-primary shrink-0" aria-hidden />
        <span className="truncate" title={formula}>{formula}</span>
      </div>
      <div className="mt-0.5 text-[10px] font-mono tabular-nums text-muted-foreground leading-tight">
        {paramLine}
      </div>
      <div className="text-[10px] font-mono tabular-nums text-muted-foreground leading-tight">
        {sigmaLine}
      </div>
    </div>
  );
}

export const ScenarioForecastChart = memo(function ScenarioForecastChart({
  points,
  horizon = 3,
  onHorizonChange,
}: Props) {
  const [bandMode, setBandMode] = useState<BandMode>(() => readBandMode());
  const [confidenceZ, setConfidenceZ] = useState<number>(() => readConfidenceZ());
  const [confidenceLevel, setConfidenceLevel] = useState<ConfidenceLevel>(() => readConfidenceLevel());
  const [explainerOpen, setExplainerOpen] = useState(false);

  // Silent migration: drop the legacy `seeUseOlsInflation` key so that
  // users who previously opted into the √(1+step/n) approximation now get
  // the full OLS prediction-interval formula automatically.
  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_SEE_OLS_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(BAND_MODE_KEY, bandMode);
    } catch {
      /* ignore */
    }
  }, [bandMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CONFIDENCE_Z_KEY, confidenceZ.toString());
    } catch {
      /* ignore */
    }
  }, [confidenceZ]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PI_LEVEL_KEY, confidenceLevel.toString());
    } catch {
      /* ignore */
    }
  }, [confidenceLevel]);

  // Debounce only the data input. Internal toggles (horizon/mode/z) stay
  // instant; rapid filter changes from the parent (which mutate `points`)
  // are coalesced into a single OLS recomputation + chart remount.
  const debouncedPoints = useDebouncedValue(points, 200);

  const { series, stdDev, slope, intercept, sse, dof, meanX, sxx, fitN, tCritical, bandLabel, rSquared, residuals } =
    useWinLossScenarios(debouncedPoints, {
      forecastSteps: horizon,
      bandMode,
      confidenceZ,
      confidenceLevel,
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

  const zPctLabel = useMemo(() => pctFromZ(confidenceZ), [confidenceZ]);

  // Stable key: forces Recharts to fully reset internals only when meaningful
  // changes occur. Empty/insufficient datasets share constant keys to avoid
  // remount churn while filters/queries rehydrate. See buildScenarioChartKey.
  const chartKey = useMemo(
    () =>
      buildScenarioChartKey({
        data,
        fitN,
        bandMode,
        confidenceZ,
        horizon,
        stdDev,
        confidenceLevel,
      }),
    [data, stdDev, fitN, bandMode, horizon, confidenceZ, confidenceLevel],
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
                    Banda 1σ via prediction interval · σ · √(1 + 1/n + (x − x̄)² / Sxx). ~68% de confiança, abre com horizonte.
                  </TooltipContent>
                </UITooltip>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="pi95" className="h-6 px-2 text-[10px] font-medium" aria-label="Modo PI 95%">
                      PI 95%
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-[240px]">
                    Intervalo de previsão com multiplicador t-Student no nível escolhido (90/95/99%). Mais conservador, leva em conta a distância do centro dos dados.
                  </TooltipContent>
                </UITooltip>
              </ToggleGroup>
              {bandMode === "pi95" && (
                <Popover>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[10px] font-medium tabular-nums"
                          aria-label={`Nível de confiança PI: ${Math.round(confidenceLevel * 100)}% · t=${(tCritical ?? 0).toFixed(2)}`}
                        >
                          t={(tCritical ?? 0).toFixed(2)}{" "}
                          <span className="ml-1 text-muted-foreground">({Math.round(confidenceLevel * 100)}%)</span>
                        </Button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-[220px]">
                      Nível de confiança do intervalo de previsão. t-Student é recalculado conforme gl.
                    </TooltipContent>
                  </UITooltip>
                  <PopoverContent align="end" className="w-64 space-y-3">
                    <div>
                      <p className="text-xs font-medium mb-2">Nível de confiança PI</p>
                      <RadioGroup
                        value={confidenceLevel.toString()}
                        onValueChange={(v) => {
                          const n = Number(v);
                          if (n === 0.90 || n === 0.95 || n === 0.99) setConfidenceLevel(n);
                        }}
                      >
                        {PI_LEVEL_OPTIONS.map((opt) => (
                          <div key={opt.level} className="flex items-center gap-2">
                            <RadioGroupItem value={opt.level.toString()} id={`pi-level-${opt.label}`} />
                            <Label
                              htmlFor={`pi-level-${opt.label}`}
                              className="text-xs cursor-pointer flex-1"
                              title={opt.hint}
                            >
                              {opt.label}{" "}
                              <span className="text-muted-foreground tabular-nums">
                                (α={(1 - opt.level).toFixed(2)})
                              </span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed border-t pt-2">
                      90% = banda mais estreita · 95% = padrão · 99% = mais ampla. O multiplicador t é recalculado para cada nível conforme os graus de liberdade.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-xs"
                      onClick={() => setConfidenceLevel(0.95)}
                      disabled={confidenceLevel === 0.95}
                    >
                      Restaurar padrão (95%)
                    </Button>
                  </PopoverContent>
                </Popover>
              )}
              {bandMode === "see" && (
                <Popover>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[10px] font-medium tabular-nums"
                          aria-label={`Nível de confiança: z=${confidenceZ.toFixed(2)} (${zPctLabel})`}
                        >
                          z={confidenceZ.toFixed(2)} <span className="ml-1 text-muted-foreground">({zPctLabel})</span>
                        </Button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-[220px]">
                      Multiplicador z aplicado à largura da banda SEE. 1.96 ≈ 95% de cobertura.
                    </TooltipContent>
                  </UITooltip>
                  <PopoverContent align="end" className="w-64 space-y-3">
                    <div>
                      <p className="text-xs font-medium mb-2">Nível de confiança</p>
                      <RadioGroup
                        value={
                          Z_PRESETS.find((p) => Math.abs(p.z - confidenceZ) < 0.01)
                            ? confidenceZ.toString()
                            : ""
                        }
                        onValueChange={(v) => {
                          const n = Number(v);
                          if (Number.isFinite(n)) setConfidenceZ(n);
                        }}
                      >
                        {Z_PRESETS.map((p) => (
                          <div key={p.z} className="flex items-center gap-2">
                            <RadioGroupItem value={p.z.toString()} id={`z-${p.z}`} />
                            <Label htmlFor={`z-${p.z}`} className="text-xs cursor-pointer flex-1">
                              {p.label} <span className="text-muted-foreground tabular-nums">(z={p.z.toFixed(2)})</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <Label className="text-xs">Personalizado</Label>
                        <span className="text-xs font-mono tabular-nums text-muted-foreground">
                          z={confidenceZ.toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        value={[confidenceZ]}
                        min={Z_MIN}
                        max={Z_MAX}
                        step={0.05}
                        onValueChange={([v]) => setConfidenceZ(v)}
                        aria-label="Ajustar z personalizado"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-xs"
                      onClick={() => setConfidenceZ(1)}
                      disabled={confidenceZ === 1}
                    >
                      Restaurar padrão (z=1)
                    </Button>
                  </PopoverContent>
                </Popover>
              )}
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => setExplainerOpen(true)}
                    aria-label="Abrir explicação das bandas de incerteza"
                  >
                    <HelpCircle className="h-3.5 w-3.5" aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Como as bandas são calculadas?
                </TooltipContent>
              </UITooltip>
            </div>
          </TooltipProvider>
          <span
            className="sm:hidden text-xs text-muted-foreground font-normal tabular-nums w-full"
            title={`${bandLabel} sobre a tendência ajustada com ${fitN} períodos`}
          >
            {bandMode === "pi95" && tCritical != null
              ? `PI ${Math.round(confidenceLevel * 100)}% · t=${tCritical.toFixed(2)} · σ ±${stdDev.toFixed(1)}pp · fit em ${fitN}`
              : `σ ±${stdDev.toFixed(1)}pp · z=${confidenceZ.toFixed(2)} · fit em ${fitN}`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[260px] p-2">
        <div className="relative h-full w-full">
        <ActiveFormulaBadge
          bandMode={bandMode}
          confidenceZ={confidenceZ}
          zPctLabel={zPctLabel}
          tCritical={tCritical}
          dof={dof}
          stdDev={stdDev}
          fitN={fitN}
          confidenceLevel={confidenceLevel}
        />
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart key={chartKey} data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} unit="%" domain={[0, 100]} />
            <Tooltip content={<CustomTooltip mode={bandMode} bandLabel={bandLabel} />} />
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
        </div>
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
        confidenceZ={confidenceZ}
        bandLabel={bandLabel}
        confidenceLevel={confidenceLevel}
        rSquared={rSquared}
        residuals={residuals}
      />
      <ScenarioFormulaExplainerDialog
        open={explainerOpen}
        onOpenChange={setExplainerOpen}
        stats={{ stdDev, fitN, dof, meanX, confidenceZ, bandMode, tCritical }}
      />
    </Card>
  );
});
