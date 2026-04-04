import React from "react";
import { TrendingUp, DollarSign, Users } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-lg p-3 border border-border/50">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? `R$ ${entry.value.toLocaleString("pt-BR")}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface ReportChartsProps {
  revenueData: Array<Record<string, string | number>>;
  categoryData: Array<Record<string, string | number>>;
  salesData: Array<Record<string, string | number>>;
  selectedPeriod: string;
}

export const ReportCharts = React.memo(function ReportCharts({ revenueData, categoryData, salesData, selectedPeriod }: ReportChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <div className="opacity-0 animate-fade-in-up glass rounded-xl p-6" style={{ animationDelay: "300ms" }}>
        <h3 className="text-lg font-semibold mb-1">Evolução de Receita</h3>
        <p className="text-sm text-muted-foreground mb-6">Receita vs Meta mensal</p>
        <div className="h-[280px]">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(24, 100%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(24, 100%, 55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(280, 80%, 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(280, 80%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
                <XAxis dataKey="mes" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="receita" stroke="hsl(24, 100%, 55%)" strokeWidth={2} fill="url(#colorReceita)" name="Receita" />
                <Area type="monotone" dataKey="meta" stroke="hsl(280, 80%, 60%)" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorMeta)" name="Meta" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <TrendingUp className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">Nenhum dado de receita disponível</p>
              <p className="text-xs">Configure métricas diárias para ver a evolução</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Pie Chart */}
      <div className="opacity-0 animate-fade-in-up glass rounded-xl p-6" style={{ animationDelay: "350ms" }}>
        <h3 className="text-lg font-semibold mb-1">Vendas por Categoria</h3>
        <p className="text-sm text-muted-foreground mb-6">Distribuição de receita</p>
        <div className="h-[280px] flex items-center">
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} contentStyle={{ background: 'hsl(222, 47%, 8%)', border: '1px solid hsl(222, 30%, 16%)', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <div className="flex-1"><p className="text-sm">{item.name}</p><p className="text-xs text-muted-foreground">{item.value}%</p></div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground">
              <DollarSign className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">Nenhuma categoria registrada</p>
              <p className="text-xs">Configure métricas de categoria para ver a distribuição</p>
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="opacity-0 animate-fade-in-up glass rounded-xl p-6" style={{ animationDelay: "400ms" }}>
        <h3 className="text-lg font-semibold mb-1">Vendas por Período</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {selectedPeriod === "7d" ? "Últimos 7 dias" : selectedPeriod === "30d" ? "Últimas 4 semanas" : selectedPeriod === "90d" ? "Últimos 3 meses" : "Período selecionado"}
        </p>
        <div className="h-[280px]">
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
                <XAxis dataKey="dia" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <Tooltip formatter={(value) => [`${value} vendas`, 'Vendas']} contentStyle={{ background: 'hsl(222, 47%, 8%)', border: '1px solid hsl(222, 30%, 16%)', borderRadius: '8px' }} />
                <Bar dataKey="vendas" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(24, 100%, 55%)" />
                    <stop offset="100%" stopColor="hsl(280, 80%, 60%)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Users className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">Nenhuma venda no período</p>
              <p className="text-xs">Registre vendas para ver a distribuição por período</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
