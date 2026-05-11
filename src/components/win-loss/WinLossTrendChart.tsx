import { memo, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import type { TrendPoint } from "@/hooks/win-loss/useWinLossAggregations";
import type { WLGranularity } from "@/hooks/win-loss/useWinLossViewPrefs";

interface Props {
  monthly: TrendPoint[];
  weekly: TrendPoint[];
  granularity: WLGranularity;
  onGranularityChange: (g: WLGranularity) => void;
  onPointClick?: (period: string) => void;
}

export const WinLossTrendChart = memo(function WinLossTrendChart({
  monthly,
  weekly,
  granularity,
  onGranularityChange,
  onPointClick,
}: Props) {
  const [compare, setCompare] = useState(false);
  const data = granularity === "week" ? weekly : monthly;

  // Build the comparison series by aligning the previous half with current periods.
  const merged = useMemo(() => {
    if (!compare || data.length < 2) return data.map(d => ({ ...d, prevWinRate: null as number | null }));
    const half = Math.floor(data.length / 2);
    const prev = data.slice(0, half);
    const curr = data.slice(half);
    return curr.map((c, i) => ({ ...c, prevWinRate: prev[i]?.winRate ?? null }));
  }, [data, compare]);

  return (
    <Card className="glass border-border/40 hover:border-primary/40 transition-all duration-300">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2 gap-2 flex-wrap">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-primary" />
          Tendência Win/Loss
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={compare ? "default" : "ghost"}
            className="h-6 px-2 text-[11px]"
            onClick={() => setCompare(c => !c)}
            aria-pressed={compare}
          >
            vs. anterior
          </Button>
          <div className="flex gap-1 rounded-md border border-border/50 p-0.5">
            {(["week", "month"] as const).map(g => (
              <Button
                key={g}
                size="sm"
                variant={granularity === g ? "default" : "ghost"}
                className="h-6 px-2 text-[11px]"
                onClick={() => onGranularityChange(g)}
                aria-pressed={granularity === g}
              >
                {g === "week" ? "Semanal" : "Mensal"}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!data.length ? (
          <p className="text-sm text-muted-foreground py-12 text-center">Sem dados no período.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart
              data={merged}
              onClick={(e: any) => {
                const period = (e?.activePayload?.[0]?.payload as TrendPoint | undefined)?.period;
                if (period && onPointClick) onPointClick(period);
              }}
              style={{ cursor: onPointClick ? "pointer" : undefined }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="period" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="wins" name="Wins" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="losses" name="Losses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="winRate" name="Win Rate %" stroke="hsl(var(--accent-foreground))" strokeWidth={2} dot={{ r: 3 }} />
              {compare && (
                <Line yAxisId="right" type="monotone" dataKey="prevWinRate" name="Win Rate % (anterior)" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
});
