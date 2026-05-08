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
          <div className="flex flex-wrap items-center gap-2 text-[9px] uppercase font-black tracking-widest">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary/80 backdrop-blur-sm shadow-sm hover:bg-primary/10 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
              <span>Target Alvo</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/5 border border-success/20 text-success backdrop-blur-sm shadow-sm hover:bg-success/10 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              <span>Realizado</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/30 border border-border/10 text-muted-foreground backdrop-blur-sm shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full border border-primary/40 border-dashed animate-spin-slow" />
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
              formatter={(v: any, name: any) => [
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
            <Bar dataKey="vendido" radius={[4, 4, 0, 0]} barSize={18} name="vendido" dx={-8}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  className="transition-all duration-700 hover:brightness-125"
                  fill={
                    entry.progress >= 100
                      ? "url(#colorSuccess)"
                      : entry.progress >= 70
                      ? "url(#colorPrimary)"
                      : entry.progress >= 40
                      ? "url(#colorWarning)"
                      : "url(#colorDestructive)"
                  }
                  style={{ 
                    filter: `drop-shadow(0 0 6px ${
                      entry.progress >= 100 ? "rgba(34,197,94,0.4)" : 
                      entry.progress >= 70 ? "rgba(var(--primary),0.3)" : 
                      entry.progress >= 40 ? "rgba(var(--warning),0.3)" : "rgba(var(--destructive),0.3)"
                    })` 
                  }}
                />
              ))}
            </Bar>
            <defs>
              <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="colorDestructive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
