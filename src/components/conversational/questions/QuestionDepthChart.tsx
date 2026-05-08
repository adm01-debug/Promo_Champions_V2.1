import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import type { CallQuestion } from "./questionHelpers";
import { depthLabel } from "./questionHelpers";

interface Props {
  questions: CallQuestion[];
}

const COLORS = [
  "hsl(var(--muted-foreground))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--info))",
  "hsl(var(--primary))",
  "hsl(var(--success, var(--primary)))",
  "hsl(var(--success, var(--primary)))",
];

export const QuestionDepthChart = ({ questions }: Props) => {
  const buckets = [1, 2, 3, 4, 5].map((d) => ({
    depth: d,
    label: depthLabel(d),
    count: questions.filter((q) => q.depth === d).length,
  }));

  if (questions.length === 0) {
    return <div className="text-center text-sm text-muted-foreground py-8">Sem dados de profundidade.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={buckets} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} />
        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
        <Tooltip
          content={(props: any) => {
            const { active, payload } = props as { active?: boolean; payload?: Array<{ value: number; payload: { label: string } }> };
            if (!active || !payload?.length) return null;
            const p = payload[0];
            return (
              <div className="rounded-md border bg-popover px-2 py-1 text-xs shadow">
                {p.payload.label}: <span className="font-medium">{p.value}</span>
              </div>
            );
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {buckets.map((b) => (
            <Cell key={b.depth} fill={COLORS[b.depth]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
