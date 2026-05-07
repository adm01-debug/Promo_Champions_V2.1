import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Calendar, ArrowUpRight } from "lucide-react";

interface MonthData {
  month: string;
  fullMonth: string;
  totalSales: number;
  dealsCount: number;
}

interface HistoryTabProps {
  monthlyHistory: MonthData[];
  formatCurrency: (value: number) => string;
}

export const HistoryTab = memo(function HistoryTab({ monthlyHistory, formatCurrency }: HistoryTabProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border/40 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              EVOLUÇÃO DE VENDAS
            </CardTitle>
            <ArrowUpRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyHistory}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "rgba(0,0,0,0.8)", 
                      backdropFilter: "blur(10px)",
                      border: "1px solid hsl(var(--border))", 
                      borderRadius: "12px",
                      color: "#fff"
                    }}
                    itemStyle={{ color: "hsl(var(--primary))" }}
                    formatter={(value: number) => [formatCurrency(value), "Total"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalSales" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/40 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              VOLUME DE CONTRATOS
            </CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground/30 group-hover:text-accent transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ 
                      backgroundColor: "rgba(0,0,0,0.8)", 
                      backdropFilter: "blur(10px)",
                      border: "1px solid hsl(var(--border))", 
                      borderRadius: "12px",
                      color: "#fff"
                    }}
                  />
                  <Bar dataKey="dealsCount" radius={[6, 6, 0, 0]} animationDuration={2000}>
                    {monthlyHistory.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === monthlyHistory.length - 1 ? "hsl(var(--accent))" : "hsl(var(--primary) / 0.4)"} 
                        className="transition-all duration-300 hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-border/40 overflow-hidden shadow-xl">
        <CardHeader className="bg-muted/30 border-b border-border/40">
          <CardTitle className="text-lg font-black tracking-tight">RESUMO ESTRATÉGICO</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-background/40">
                  <th className="text-left py-4 px-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Mês</th>
                  <th className="text-right py-4 px-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Total Volume</th>
                  <th className="text-right py-4 px-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Contratos</th>
                  <th className="text-right py-4 px-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Ticket Médio</th>
                </tr>
              </thead>
              <tbody>
                {monthlyHistory.map((month, index) => (
                  <tr key={index} className="border-b border-border/20 hover:bg-primary/5 transition-colors group">
                    <td className="py-4 px-6 capitalize font-bold text-sm">{month.fullMonth}</td>
                    <td className="py-4 px-6 text-right font-black text-primary">{formatCurrency(month.totalSales)}</td>
                    <td className="py-4 px-6 text-right font-medium text-muted-foreground group-hover:text-foreground">{month.dealsCount}</td>
                    <td className="py-4 px-6 text-right">
                      <Badge variant="outline" className="font-bold border-border/50 group-hover:border-primary/50">
                        {formatCurrency(month.dealsCount > 0 ? month.totalSales / month.dealsCount : 0)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
