import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import type { TrendPoint } from "@/hooks/win-loss/useWinLossAggregations";

interface Props {
  monthly: TrendPoint[];
  weekly: TrendPoint[];
  onPointClick?: (period: string) => void;
}

export function WinLossTrendChart({ monthly, weekly, onPointClick }: Props) {
  const [gran, setGran] = useState<"week" | "month">("month");
  const data = gran === "week" ? weekly : monthly;

  return (
    <Card className="border-border/50">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-primary" />
          Tendência Win/Loss
        </CardTitle>
        <div className="flex gap-1 rounded-md border border-border/50 p-0.5">
          {(["week", "month"] as const).map(g => (
            <Button
              key={g}
              size="sm"
              variant={gran === g ? "default" : "ghost"}
              className="h-6 px-2 text-[11px]"
              onClick={() => setGran(g)}
            >
              {g === "week" ? "Semanal" : "Mensal"}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {!data.length ? (
          <p className="text-sm text-muted-foreground py-12 text-center">Sem dados no período.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart
              data={data}
              onClick={(e) => {
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
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
