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
    <Card className="glass border-border/40 card-elevated overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
      <CardHeader className="pb-2 border-b border-border/10 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-base font-display font-black flex items-center gap-2 uppercase italic tracking-tight">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-md group-hover:rotate-6 transition-transform">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <span className="gradient-text">Arena de Comparação</span>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase font-black tracking-widest text-muted-foreground">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30 border border-border/10">
              <div className="w-2 h-2 rounded-full bg-primary/20" />
              <span>Target Alvo</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30 border border-border/10">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
              <span>Realizado</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30 border border-border/10">
              <div className="w-2 h-2 rounded-full border border-primary/40 border-dashed" />
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
            <Bar 
              dataKey="meta" 
              fill="hsl(var(--primary)/0.05)" 
              radius={[6, 6, 0, 0]} 
              barSize={40} 
              name="meta" 
              stroke="hsl(var(--primary)/0.1)"
              strokeDasharray="4 2"
            />
            <Bar 
              dataKey="projecao" 
              fill="hsl(var(--primary)/0.15)" 
              radius={[6, 6, 0, 0]} 
              barSize={20} 
              name="forecast" 
              dx={0} 
            />
            <Bar dataKey="vendido" radius={[6, 6, 0, 0]} barSize={20} name="vendido" dx={-10}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  className="transition-all duration-500 hover:opacity-80"
                  fill={
                    entry.progress >= 100
                      ? "hsl(var(--success))"
                      : entry.progress >= 70
                      ? "hsl(var(--primary))"
                      : entry.progress >= 40
                      ? "hsl(var(--warning))"
                      : "hsl(var(--destructive))"
                  }
                  style={{ 
                    filter: `drop-shadow(0 0 4px ${
                      entry.progress >= 100 ? "rgba(34,197,94,0.3)" : "rgba(var(--primary),0.2)"
                    })` 
                  }}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
