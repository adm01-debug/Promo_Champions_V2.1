import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell,
} from "recharts";

const ROLE_LABELS: Record<string, string> = { sdr: "SDRs", closer: "Closers", hybrid: "Híbridos" };
const ROLE_COLORS: Record<string, string> = { sdr: "hsl(var(--status-info))", closer: "hsl(var(--status-success))", hybrid: "hsl(var(--status-purple))" };

function formatCurrency(value: any): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(value);
}

interface Benchmark {
  role: string;
  avgRevenue: number;
  avgActivities: number;
  avgWinRate: number;
  avgDealSize: number;
  salespeople: { name: string; totalRevenue: number }[];
}

interface PerformanceChartsProps {
  benchmarks: Benchmark[];
}

export const PerformanceCharts = React.memo(function PerformanceCharts({ benchmarks }: PerformanceChartsProps) {
  const revenueChartData = benchmarks.flatMap(b =>
    b.salespeople.map(sp => ({
      name: sp.name.split(" ")[0],
      revenue: sp.totalRevenue,
      role: b.role,
      fill: ROLE_COLORS[b.role],
    }))
  ).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  const radarData = [
    { metric: "Receita", ...Object.fromEntries(benchmarks.map(b => [b.role, b.avgRevenue / 1000])) },
    { metric: "Atividades", ...Object.fromEntries(benchmarks.map(b => [b.role, b.avgActivities])) },
    { metric: "Win Rate", ...Object.fromEntries(benchmarks.map(b => [b.role, b.avgWinRate])) },
    { metric: "Ticket Médio", ...Object.fromEntries(benchmarks.map(b => [b.role, b.avgDealSize / 1000])) },
  ];

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "12px",
    boxShadow: "0 10px 40px -10px hsl(var(--primary) / 0.2)",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass dark:border-glow card-elevated">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <span className="gradient-text font-display">Ranking de Receita</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-fade-in">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} layout="vertical" margin={{ left: 60, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [formatCurrency(value), "Receita"]} />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                  {revenueChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="glass dark:border-glow card-elevated">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <span className="gradient-text font-display">Perfil por Função</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-fade-in">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                {benchmarks.map((b) => (
                  <Radar key={b.role} name={ROLE_LABELS[b.role]} dataKey={b.role} stroke={ROLE_COLORS[b.role]} fill={ROLE_COLORS[b.role]} fillOpacity={0.2} />
                ))}
                <Legend formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
