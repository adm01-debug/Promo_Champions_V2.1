import { FC, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useCalibrations } from "@/hooks/revenue/useWinProbabilityCalibrator";
import { FLAG_COLOR, FLAG_LABEL } from "./calibratorHelpers";

export const CalibrationFlagDistribution: FC = () => {
  const { data } = useCalibrations();

  const chartData = useMemo(() => {
    const counts: Record<string, number> = { overconfident: 0, aligned: 0, underconfident: 0 };
    (data ?? []).forEach((c) => { counts[c.flag] = (counts[c.flag] ?? 0) + 1; });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: FLAG_LABEL[k], value: v, color: FLAG_COLOR[k] }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Distribuição de Calibração</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Sem dados.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
