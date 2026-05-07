import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-lg">Evolução de Vendas</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    formatter={(value: number) => [formatCurrency(value), "Total"]}
                  />
                  <Line type="monotone" dataKey="totalSales" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader><CardTitle className="text-lg">Quantidade de Vendas</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="dealsCount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    {monthlyHistory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${0.5 + (index / 10)})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-border/50">
        <CardHeader><CardTitle className="text-lg">Resumo Mensal</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Mês</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Total Vendas</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Qtd Vendas</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Ticket Médio</th>
                </tr>
              </thead>
              <tbody>
                {monthlyHistory.map((month, index) => (
                  <tr key={index} className="border-b border-border/30 hover:bg-muted/30">
                    <td className="py-3 px-4 capitalize">{month.fullMonth}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(month.totalSales)}</td>
                    <td className="py-3 px-4 text-right">{month.dealsCount}</td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(month.dealsCount > 0 ? month.totalSales / month.dealsCount : 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
