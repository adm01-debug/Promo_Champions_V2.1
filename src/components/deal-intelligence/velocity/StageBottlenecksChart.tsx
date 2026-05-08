import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, RefreshCw } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStageBottlenecks, useRecomputeBaselines } from "@/hooks/deal-intelligence/useStageVelocity";
import { formatHours, stageLabel } from "./velocityHelpers";

export function StageBottlenecksChart() {
  const { data, isLoading } = useStageBottlenecks();
  const recompute = useRecomputeBaselines();

  const chartData = (data || []).map((d) => ({
    stage: stageLabel(d.stage),
    p50: Number(d.p50.toFixed(1)),
    p75: Number(d.p75.toFixed(1)),
    p90: Number(d.p90.toFixed(1)),
    stuck: d.stuck,
    sample: d.sample,
  }));

  const slowest = chartData.length ? [...chartData].sort((a, b) => b.p75 - a.p75)[0] : null;

  return (
    <Card variant="elevated" className="glass border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span>Gargalos por Estágio</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => recompute.mutate()}
            disabled={recompute.isPending}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${recompute.isPending ? "animate-spin" : ""}`} />
            Recalcular
          </Button>
        </div>
        {slowest && (
          <p className="text-xs text-muted-foreground">
            Estágio mais lento: <span className="font-medium text-foreground">{slowest.stage}</span> ·{" "}
            <span className="tabular-nums">{formatHours(slowest.p75)}</span> (p75)
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : !chartData.length ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Sem dados de baseline. Clique em "Recalcular" para gerar.
          </div>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                  label={{ value: "Horas", angle: -90, position: "insideLeft", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: any, name: any) => [formatHours(value), name.toUpperCase()]}
                />
                <Bar dataKey="p50" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="p75" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.stuck > 0 ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
                  ))}
                </Bar>
                <Bar dataKey="p90" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
