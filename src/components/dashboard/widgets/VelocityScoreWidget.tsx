import React from "react";
import { usePipelineVelocity } from "@/hooks/usePipelineVelocity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

const VELOCITY_COLORS = [
  "hsl(var(--success))",
  "hsl(var(--primary))",
  "hsl(262, 60%, 65%)",
  "hsl(var(--warning))",
  "hsl(var(--muted-foreground))",
];

export const VelocityScoreWidget = React.memo(function VelocityScoreWidget() {
  const { data, isLoading } = usePipelineVelocity();

  if (isLoading) return <Skeleton className="h-full w-full rounded-xl" />;

  const top5 = (data || []).slice(0, 5);

  const chartData = top5.map(sp => ({
    name: sp.salespersonName.split(" ")[0],
    velocity: sp.velocityScore,
    days: sp.avgCycleDays,
  }));

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-warning" />
          Velocity Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="space-y-2">
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(v: any, name: any) => {
                    if (name === "velocity") return [v.toLocaleString("pt-BR"), "Score"];
                    return [`${v}d`, "Ciclo"];
                  }}
                  contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 11 }}
                />
                <Bar dataKey="velocity" radius={[4, 4, 0, 0]} barSize={20}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={VELOCITY_COLORS[i % VELOCITY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
              <span>Maior = melhor</span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Ciclo curto
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            Sem dados de velocidade
          </p>
        )}
      </CardContent>
    </Card>
  );
});

VelocityScoreWidget.displayName = "VelocityScoreWidget";
