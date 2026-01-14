import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3, Trophy, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalespersonData {
  id: string;
  name: string;
  totalSales: number;
  goalAmount: number;
  goalProgress: number;
}

interface SalesChartProps {
  salespeople: SalespersonData[];
}
// Chart gradient colors are defined in the SVG defs below
// Custom tooltip content component (not using forwardRef since Recharts Tooltip handles the wrapper)
const CustomTooltipContent = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass rounded-xl p-4 border border-border/50 shadow-xl animate-fade-in">
        <p className="font-semibold text-sm gradient-text">{data.name}</p>
        <div className="mt-2 space-y-1">
          <p className="text-xs text-muted-foreground flex justify-between gap-4">
            Vendas: 
            <span className="text-foreground font-medium">
              R$ {data.totalSales.toLocaleString("pt-BR")}
            </span>
          </p>
          <p className="text-xs text-muted-foreground flex justify-between gap-4">
            Meta: 
            <span className="text-foreground font-medium">
              R$ {data.goalAmount.toLocaleString("pt-BR")}
            </span>
          </p>
          <p className="text-xs text-muted-foreground flex justify-between gap-4">
            Progresso: 
            <span className={`font-medium ${data.goalProgress >= 100 ? "text-status-success" : "text-foreground"}`}>
              {data.goalProgress.toFixed(1)}%
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function SalesChart({ salespeople }: SalesChartProps) {
  const chartData = salespeople.map((sp) => ({
    ...sp,
    shortName: sp.name.split(" ")[0],
  }));

  return (
    <Card className="glass dark:border-glow card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <span className="gradient-text">Vendas por Vendedor</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Comparativo de vendas vs meta mensal</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] animate-fade-in">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1}/>
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                </linearGradient>
                <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--status-success))" stopOpacity={1}/>
                  <stop offset="100%" stopColor="hsl(var(--status-success))" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="shortName" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={CustomTooltipContent} cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }} />
              <Bar 
                dataKey="totalSales" 
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.goalProgress >= 100 ? "url(#successGradient)" : "url(#barGradient)"}
                    style={{
                      filter: entry.goalProgress >= 100 
                        ? "drop-shadow(0 4px 12px hsl(var(--status-success) / 0.3))" 
                        : "drop-shadow(0 4px 12px hsl(var(--primary) / 0.2))"
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/40 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
            <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-primary to-primary/60" />
            <Target className="h-3 w-3 text-primary" />
            <span>Vendas</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-status-success/5 hover:bg-status-success/10 transition-colors">
            <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-status-success to-status-success/60" />
            <Trophy className="h-3 w-3 text-status-success" />
            <span>Meta atingida</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
