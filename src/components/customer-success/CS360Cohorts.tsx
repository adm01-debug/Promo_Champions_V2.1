import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--info))",
  "hsl(var(--accent))"
];

interface CohortData {
  month: string;
  retained: number;
  churned: number;
  revenue: number;
}

interface OrdersByStatus {
  status: string;
  count: number;
  value: number;
  color: string;
  key: string;
}

interface CS360CohortsProps {
  cohortData: CohortData[];
  ordersByStatus: OrdersByStatus[];
  onStatusClick: (status: string) => void;
}

export function CS360Cohorts({ cohortData, ordersByStatus, onStatusClick }: CS360CohortsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2 glass border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-bold">Análise de Coortes (Retenção por Mês de Renovação)</CardTitle>
          <CardDescription className="text-[10px]">Visualização da retenção baseada na primeira compra</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cohortData} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border)/0.3)" />
              <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="month" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="retained" name="Retidos (Health > 40)" stackId="a" fill="hsl(var(--success))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="churned" name="Risco/Churn" stackId="a" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-bold">Status de Pedidos</CardTitle>
          <CardDescription className="text-[10px]">Distribuição de faturamento por status</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col h-[400px]">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="status"
                >
                  {ordersByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {ordersByStatus.map((s, idx) => (
              <div 
                key={s.key} 
                className="flex items-center justify-between p-2 rounded-lg border border-border/40 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onStatusClick(s.key)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                  <span className="text-xs font-medium">{s.status}</span>
                </div>
                <div className="text-xs font-bold">{s.count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
