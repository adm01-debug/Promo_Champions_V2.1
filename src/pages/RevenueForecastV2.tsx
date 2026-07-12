import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { buildRevenueForecastCsv } from "@/lib/revenueForecast/csvExport";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { useRevenueHistory } from "@/hooks/revenue/useRevenueHistory";
import {
  computeRevenueForecast,
  applyWhatIf,
  type HistoricalPoint,
} from "@/lib/revenueForecast/forecastEngine";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export default function RevenueForecastV2() {
  const { data: history, isLoading } = useRevenueHistory();
  const [horizon, setHorizon] = useState(6);
  const [winRateDelta, setWinRateDelta] = useState(0);
  const [ticketDelta, setTicketDelta] = useState(0);
  const [velocityDelta, setVelocityDelta] = useState(0);

  const base = useMemo(
    () =>
      history && history.length > 0
        ? computeRevenueForecast(history as HistoricalPoint[], { horizon })
        : null,
    [history, horizon],
  );

  const adjusted = useMemo(() => {
    if (!base) return null;
    return applyWhatIf(base, {
      winRateDelta: winRateDelta / 100,
      avgTicketDelta: ticketDelta / 100,
      velocityDelta: velocityDelta / 100,
    });
  }, [base, winRateDelta, ticketDelta, velocityDelta]);

  const chartData = useMemo(() => {
    if (!adjusted) return [];
    return [
      ...adjusted.history.map((h) => ({
        period: h.period,
        actual: h.revenue,
        p10: null as number | null,
        p50: null as number | null,
        p90: null as number | null,
      })),
      ...adjusted.forecast.map((f) => ({
        period: f.period,
        actual: null as number | null,
        p10: f.p10,
        p50: f.p50,
        p90: f.p90,
      })),
    ];
  }, [adjusted]);

  const trendIcon =
    adjusted?.summary.trend === "up" ? (
      <TrendingUp className="h-5 w-5 text-success" />
    ) : adjusted?.summary.trend === "down" ? (
      <TrendingDown className="h-5 w-5 text-destructive" />
    ) : (
      <Minus className="h-5 w-5 text-muted-foreground" />
    );

  return (
    <>
      <Helmet>
        <title>Revenue Forecast v2 · Ensemble ML | Promo Champions</title>
        <meta
          name="description"
          content="Previsão de receita v2 com ensemble Holt-Winters, regressão linear e Monte Carlo. Bandas P10/P50/P90 e simulador what-if de win rate, ticket e velocity."
        />
      </Helmet>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Revenue Forecast v2
              </h1>
              <p className="text-sm text-muted-foreground">
                Ensemble Holt-Winters + Linear + Monte Carlo · bandas P10/P50/P90 · what-if
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!adjusted}
            onClick={() => {
              if (!adjusted) return;
              const csv = buildRevenueForecastCsv(adjusted);
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `revenue-forecast-v2-${horizon}m.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            aria-label="Exportar CSV"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </header>

        <div className="grid gap-4 md:grid-cols-4">
          <SummaryCard
            title="Próximo período (P50)"
            value={adjusted ? brl.format(adjusted.summary.nextPeriodP50) : "—"}
            icon={trendIcon}
            loading={isLoading}
          />
          <SummaryCard
            title={`Horizonte ${horizon}m · P50`}
            value={adjusted ? brl.format(adjusted.summary.horizonTotalP50) : "—"}
            loading={isLoading}
          />
          <SummaryCard
            title="Piso (P10 acumulado)"
            value={adjusted ? brl.format(adjusted.summary.horizonTotalP10) : "—"}
            loading={isLoading}
            muted
          />
          <SummaryCard
            title="Teto (P90 acumulado)"
            value={adjusted ? brl.format(adjusted.summary.horizonTotalP90) : "—"}
            loading={isLoading}
            muted
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Projeção com bandas de confiança
              {adjusted && (
                <Badge variant="outline">
                  HW {(adjusted.ensemble.weights.holtWinters * 100).toFixed(0)}% ·
                  Linear {(adjusted.ensemble.weights.linear * 100).toFixed(0)}% ·
                  MC {(adjusted.ensemble.weights.monteCarlo * 100).toFixed(0)}%
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Histórico em linha sólida · previsão em banda P10–P90 com mediana P50
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(v) => brl.format(v)} width={100} />
                  <Tooltip
                    formatter={(value: number | null) =>
                      value == null ? "—" : brl.format(value)
                    }
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="p90"
                    stroke="none"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.15}
                    name="Banda P10–P90"
                  />
                  <Area
                    type="monotone"
                    dataKey="p10"
                    stroke="none"
                    fill="hsl(var(--background))"
                    fillOpacity={1}
                    name=""
                    legendType="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--foreground))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Histórico"
                  />
                  <Line
                    type="monotone"
                    dataKey="p50"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={{ r: 3 }}
                    name="Previsão P50"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Horizonte de previsão</CardTitle>
              <CardDescription>
                Meses à frente (1–24)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Slider
                value={[horizon]}
                min={1}
                max={24}
                step={1}
                onValueChange={(v) => setHorizon(v[0])}
              />
              <p className="text-2xl font-semibold">{horizon} meses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Simulador what-if</CardTitle>
              <CardDescription>
                Ajuste win rate, ticket médio e velocity para ver o impacto imediato.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <WhatIfSlider
                label="Δ Win rate"
                value={winRateDelta}
                onChange={setWinRateDelta}
              />
              <WhatIfSlider
                label="Δ Ticket médio"
                value={ticketDelta}
                onChange={setTicketDelta}
              />
              <WhatIfSlider
                label="Δ Velocity (ciclo)"
                value={velocityDelta}
                onChange={setVelocityDelta}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  loading,
  muted,
}: {
  title: string;
  value: string;
  icon?: React.ReactNode;
  loading?: boolean;
  muted?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>
          {icon}
        </div>
        <p
          className={`mt-2 text-2xl font-semibold ${
            muted ? "text-muted-foreground" : ""
          } ${loading ? "opacity-40" : ""}`}
        >
          {loading ? "…" : value}
        </p>
      </CardContent>
    </Card>
  );
}

function WhatIfSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span
          className={`text-sm font-medium ${
            value > 0
              ? "text-success"
              : value < 0
                ? "text-destructive"
                : "text-muted-foreground"
          }`}
        >
          {value > 0 ? "+" : ""}
          {value}%
        </span>
      </div>
      <Slider
        value={[value]}
        min={-50}
        max={50}
        step={1}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}
