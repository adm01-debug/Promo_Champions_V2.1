import { RadialBar, RadialBarChart, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { healthHsl, type ScorecardHealth } from "./coachingHelpers";

interface Props { score: number; health: ScorecardHealth; size?: number }

export const ScorecardRadial = ({ score, health, size = 160 }: Props) => {
  const data = [{ name: "score", value: Math.max(0, Math.min(100, score)), fill: healthHsl(health) }];
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={225} endAngle={-45}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background={{ fill: "hsl(var(--muted))" }} dataKey="value" cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums font-display" style={{ color: healthHsl(health) }}>
          {Math.round(score)}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">overall</span>
      </div>
    </div>
  );
};
