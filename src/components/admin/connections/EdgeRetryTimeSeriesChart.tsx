import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

type Outcome = "retry" | "success_after_retry" | "exhausted" | "non_retryable";

interface Row {
  outcome: Outcome;
  created_at: string;
}

interface Props {
  rows: Row[] | undefined;
}

const OUTCOMES: Outcome[] = ["retry", "success_after_retry", "exhausted", "non_retryable"];

const labels: Record<Outcome, string> = {
  retry: "Retry",
  success_after_retry: "Sucesso",
  exhausted: "Esgotado",
  non_retryable: "Não-retriável",
};

// Semantic tokens for chart series (HSL via CSS vars)
const colors: Record<Outcome, string> = {
  retry: "hsl(var(--muted-foreground))",
  success_after_retry: "hsl(var(--primary))",
  exhausted: "hsl(var(--destructive))",
  non_retryable: "hsl(var(--border))",
};

export function EdgeRetryTimeSeriesChart({ rows }: Props) {
  const data = useMemo(() => {
    const now = new Date();
    const buckets: Array<Record<string, number | string>> = [];
    // Last 24 hourly buckets (oldest → newest)
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now);
      d.setMinutes(0, 0, 0);
      d.setHours(d.getHours() - i);
      buckets.push({
        hour: `${d.getHours().toString().padStart(2, "0")}h`,
        _ts: d.getTime(),
        retry: 0,
        success_after_retry: 0,
        exhausted: 0,
        non_retryable: 0,
      });
    }
    const first = buckets[0]._ts as number;
    const last = (buckets[buckets.length - 1]._ts as number) + 60 * 60 * 1000;
    for (const r of rows ?? []) {
      const t = new Date(r.created_at).getTime();
      if (t < first || t >= last) continue;
      const idx = Math.floor((t - first) / (60 * 60 * 1000));
      const bucket = buckets[idx];
      if (!bucket) continue;
      bucket[r.outcome] = (bucket[r.outcome] as number) + 1;
    }
    return buckets;
  }, [rows]);

  const hasData = useMemo(
    () => data.some((b) => OUTCOMES.some((o) => (b[o] as number) > 0)),
    [data],
  );

  if (!hasData) {
    return (
      <p className="text-xs text-muted-foreground">
        Sem eventos suficientes nas últimas 24h para exibir a série temporal.
      </p>
    );
  }

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            interval={2}
          />
          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {OUTCOMES.map((o) => (
            <Bar key={o} dataKey={o} name={labels[o]} stackId="a" fill={colors[o]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
