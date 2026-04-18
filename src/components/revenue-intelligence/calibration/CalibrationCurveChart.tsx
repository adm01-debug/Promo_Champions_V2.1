import { FC, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart } from "recharts";
import { WinCalibrationRow } from "@/hooks/revenue/useWinProbabilityCalibration";
import { RechartsTooltipProps } from "@/types/recharts";

const STAGE_ORDER = ["lead", "pending", "prospecting", "qualified", "in_progress", "proposal", "negotiation", "completed", "won"];

interface Props {
  data: WinCalibrationRow[];
}

const CustomTooltip: FC<RechartsTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium mb-1 capitalize">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {Number(p.value).toFixed(1)}%
        </p>
      ))}
    </div>
  );
};

export const CalibrationCurveChart: FC<Props> = ({ data }) => {
  const chartData = useMemo(() => {
    const globalRows = data.filter((d) => d.scope === "global");
    return STAGE_ORDER
      .map((stage) => {
        const row = globalRows.find((r) => r.stage === stage);
        if (!row) return null;
        const margin = (1 - row.confidence) * 15;
        return {
          stage,
          baseline: row.baseline_probability,
          calibrated: row.calibrated_probability,
          historical: row.historical_win_rate,
          confidenceUpper: Math.min(100, row.calibrated_probability + margin),
          confidenceLower: Math.max(0, row.calibrated_probability - margin),
          band: margin * 2,
        };
      })
      .filter(Boolean) as Array<{
        stage: string;
        baseline: number;
        calibrated: number;
        historical: number;
        confidenceUpper: number;
        confidenceLower: number;
        band: number;
      }>;
  }, [data]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Curva de Calibração</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground py-8 text-center">
          Sem dados. Execute uma recalibração.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Curva de Calibração — Baseline vs Real</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="confidenceLower" stackId="band" fill="transparent" stroke="none" legendType="none" name="" />
            <Area type="monotone" dataKey="band" stackId="band" fill="hsl(var(--primary))" fillOpacity={0.12} stroke="none" name="Banda confiança" />
            <Line type="monotone" dataKey="baseline" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Baseline" />
            <Line type="monotone" dataKey="historical" stroke="hsl(var(--accent-foreground))" strokeWidth={2} dot={{ r: 3 }} name="Histórico real" />
            <Line type="monotone" dataKey="calibrated" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} name="Calibrado" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
