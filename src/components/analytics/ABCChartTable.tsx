import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Line, ComposedChart } from "recharts";
import { TrendingUp, MousePointer2, Tag, MessageSquare, Send } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { RechartsTooltipProps } from "@/types/recharts";

interface ABCItem {
  name: string;
  revenue: number;
  percentage: number;
  cumulativePercentage: number;
  classification: "A" | "B" | "C";
}

const COLORS = {
  A: "hsl(var(--status-success))",
  B: "hsl(var(--status-warning))",
  C: "hsl(var(--status-error))",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

function ABCTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload as unknown as ABCItem;
  return (
    <div className="glass rounded-xl p-4 border border-border/50 shadow-xl animate-fade-in">
      <p className="font-display font-semibold text-foreground gradient-text">{data.name}</p>
      <div className="mt-2 space-y-1">
        <p className="text-sm text-muted-foreground">Receita: <span className="text-foreground font-medium">{formatCurrency(data.revenue)}</span></p>
        <p className="text-sm text-muted-foreground">Participação: <span className="text-foreground font-medium">{data.percentage.toFixed(1)}%</span></p>
        <p className="text-sm text-muted-foreground">Acumulado: <span className="text-foreground font-medium">{data.cumulativePercentage.toFixed(1)}%</span></p>
      </div>
      <Badge variant="outline" className="mt-2 font-bold" style={{ borderColor: COLORS[data.classification], color: COLORS[data.classification] }}>
        Classe {data.classification}
      </Badge>
    </div>
  );
}

interface ABCChartTableProps {
  items: ABCItem[];
  chartTitle: string;
  tableTitle: string;
  chartIcon: React.ReactNode;
  tableIcon: React.ReactNode;
  emptyIcon: React.ReactNode;
}

export const ABCChartTable = React.memo(function ABCChartTable({ items, chartTitle, tableTitle, chartIcon, tableIcon, emptyIcon }: ABCChartTableProps) {
  const hasData = items && items.length > 0;

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground glass rounded-xl border border-dashed border-border/50">
      <div className="p-3 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 mb-2 shadow-inner animate-pulse">
        {emptyIcon}
      </div>
      <p className="text-sm font-display gradient-text">Sem dados disponíveis</p>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group/title">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md transition-all duration-300 group-hover/title:scale-110">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="gradient-text">{chartTitle}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <div className="animate-fade-in">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={items.slice(0, 15)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} height={80} />
                  <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<ABCTooltip />} />
                  <Bar yAxisId="left" dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {items.slice(0, 15).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.classification]} style={{ filter: `drop-shadow(0 4px 8px ${COLORS[entry.classification]}40)` }} />
                    ))}
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="cumulativePercentage" stroke="url(#lineGradient)" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : emptyState}
        </CardContent>
      </Card>
      <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group/title">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md transition-all duration-300 group-hover/title:scale-110">
              {tableIcon}
            </div>
            <span className="gradient-text">{tableTitle}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <div className="max-h-[300px] overflow-y-auto rounded-xl">
              <table className="w-full text-sm">
                <thead className="sticky top-0 glass">
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-3 text-muted-foreground font-display font-medium">Nome</th>
                    <th className="text-right py-3 px-3 text-muted-foreground font-display font-medium">Receita</th>
                    <th className="text-right py-3 px-3 text-muted-foreground font-display font-medium">%</th>
                    <th className="text-center py-3 px-3 text-muted-foreground font-display font-medium">Classe</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-primary/5 transition-all duration-300 cursor-pointer animate-fade-in group" style={{ animationDelay: `${i * 30}ms` }}>
                      <td className="py-2.5 px-3 font-medium text-foreground transition-colors group-hover:text-primary">{item.name}</td>
                      <td className="text-right py-2.5 px-3 text-foreground">{formatCurrency(item.revenue)}</td>
                      <td className="text-right py-2.5 px-3 text-muted-foreground">{item.percentage.toFixed(1)}%</td>
                      <td className="text-center py-2.5 px-3">
                        <Badge variant="outline" className="font-bold transition-transform group-hover:scale-105" style={{ borderColor: COLORS[item.classification], color: COLORS[item.classification], backgroundColor: `${COLORS[item.classification]}15` }}>
                          {item.classification}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : emptyState}
        </CardContent>
      </Card>
    </div>
  );
});
