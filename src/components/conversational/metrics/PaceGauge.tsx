import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { formatWPM } from "./metricsHelpers";

interface Props {
  wpm: number;
  paceScore: number;
}

export function PaceGauge({ wpm, paceScore }: Props) {
  const inRange = wpm >= 130 && wpm <= 160;
  const color = inRange ? "hsl(var(--success, var(--primary)))" : wpm === 0
    ? "hsl(var(--muted-foreground))"
    : Math.abs(wpm - 145) > 40 ? "hsl(var(--destructive))" : "hsl(var(--warning))";

  const data = [{ name: "pace", value: Math.round(paceScore), fill: color }];

  return (
    <div className="relative h-40 w-full">
      <ResponsiveContainer>
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={180} endAngle={0}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background={{ fill: "hsl(var(--muted))" }} dataKey="value" cornerRadius={6} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-4">
        <div className="text-2xl font-semibold text-foreground">{formatWPM(wpm)}</div>
        <div className="text-[11px] text-muted-foreground">Cadência ideal 130–160</div>
      </div>
    </div>
  );
}
