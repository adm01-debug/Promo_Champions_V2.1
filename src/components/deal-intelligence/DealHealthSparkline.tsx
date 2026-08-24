import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from "recharts";
import type { DealHealthHistoryEntry } from "@/hooks/deal-intelligence/useDealHealth";

interface Props {
  history: DealHealthHistoryEntry[];
  height?: number;
}

export function DealHealthSparkline({ history, height = 60 }: Props) {
  if (!history || history.length < 2) {
    return (
      <div className="text-xs text-muted-foreground text-center py-4 glass rounded-lg border border-dashed border-border/40">
        Histórico insuficiente
      </div>
    );
  }

  const data = history.map((h) => ({
    date: new Date(h.snapshot_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    score: h.score,
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 11,
            }}
            labelStyle={{ color: "hsl(var(--muted-foreground))" }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 2, fill: "hsl(var(--primary))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
