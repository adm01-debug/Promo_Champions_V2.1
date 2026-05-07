import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, Legend, ComposedChart, ReferenceLine } from "recharts";
import { BarChart3 } from "lucide-react";

interface GoalComparisonChartProps {
  salespeople: {
    id: string;
    name: string;
    currentSales: number;
    goalAmount: number;
    progress: number;
    projection: number;
  }[];
}

export const GoalComparisonChart: FC<GoalComparisonChartProps> = ({ salespeople }) => {
  const data = salespeople
    .filter(sp => sp.goalAmount > 0)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 8)
    .map(sp => ({
      name: sp.name.split(" ")[0],
      vendido: sp.currentSales,
      meta: sp.goalAmount,
      progress: sp.progress,
      projecao: sp.projection,
    }));

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">Sem dados de metas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/40 card-elevated">
      <CardHeader className="pb-2 border-b border-border/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Vendido vs Meta por Vendedor
          </CardTitle>
          <div className="flex items-center gap-4 text-[10px] uppercase font-bold text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-primary/20" />
              <span>Meta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
              <span>Vendido</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-primary/40 border border-primary/20 border-dashed" />
              <span>Forecast</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 5, left: 5 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fontWeight: 600, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={50}
              tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--primary)/0.05)' }}
              formatter={(v: number, name: string) => [
                `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
                name === "vendido" ? "Vendido" : name === "meta" ? "Meta" : "Forecast",
              ]}
              contentStyle={{ 
                borderRadius: 12, 
                border: "1px solid hsl(var(--border)/0.5)", 
                backgroundColor: "hsl(var(--background)/0.95)",
                backdropFilter: "blur(4px)",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", 
                fontSize: 12 
              }}
            />
            <Bar dataKey="meta" fill="hsl(var(--muted-foreground)/0.15)" radius={[4, 4, 0, 0]} barSize={32} name="meta" />
            <Bar dataKey="projecao" fill="hsl(var(--primary)/0.2)" radius={[4, 4, 0, 0]} barSize={16} name="forecast" dx={0} />
            <Bar dataKey="vendido" radius={[4, 4, 0, 0]} barSize={16} name="vendido" dx={-8}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.progress >= 100
                      ? "hsl(var(--success))"
                      : entry.progress >= 70
                      ? "hsl(var(--primary))"
                      : entry.progress >= 40
                      ? "hsl(var(--warning))"
                      : "hsl(var(--destructive))"
                  }
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
