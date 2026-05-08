import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLeadSourceAnalysis, sourceLabels, sourceColors, LeadSource } from "@/hooks/useLeadSourceAnalysis";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChartIcon, TrendingUp, CheckCircle, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function LeadSourceDistribution() {
  const { data, isLoading } = useLeadSourceAnalysis(3);

  if (isLoading) {
    return (
      <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
        <CardHeader>
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
              <PieChartIcon className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <span className="gradient-text">Distribuição por Fonte</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full rounded-xl animate-shimmer" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.sources
    .filter(s => s.totalLeads > 0)
    .map(s => ({
      name: sourceLabels[s.source],
      value: s.totalLeads,
      source: s.source,
    })) || [];

  const formatCurrency = (value: any) =>
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  const conversionRate = data?.totalLeads && data.totalLeads > 0 
    ? ((data.totalClosed / data.totalLeads) * 100).toFixed(1)
    : "0";

  return (
    <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg group-hover:scale-110 transition-transform">
              <PieChartIcon className="h-4 w-4 text-primary" />
            </div>
            <span className="gradient-text">Distribuição de Leads por Fonte</span>
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary shadow-sm">
            {conversionRate}% conversão
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] animate-fade-in" style={{ animationDelay: '100ms' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={sourceColors[entry.source as LeadSource]}
                    stroke="transparent"
                    className="transition-all hover:opacity-80"
                    style={{
                      filter: `drop-shadow(0 4px 12px ${sourceColors[entry.source as LeadSource]}40)`,
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: "0 10px 40px -10px hsl(var(--primary) / 0.3)",
                  backdropFilter: "blur(8px)",
                }}
                formatter={(value: any) => [`${value} leads`, 'Quantidade']}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px' }}
                layout="horizontal"
                align="center"
                formatter={(value) => (
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/40">
          <div 
            className="text-center p-3 rounded-xl glass hover-lift transition-all group cursor-default animate-fade-in shadow-sm"
            style={{ animationDelay: "150ms" }}
          >
            <div className="flex items-center justify-center gap-1 mb-1.5">
              <div className="p-1 rounded-md bg-primary/10 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
            <p className="text-xl font-bold font-display gradient-text group-hover:scale-105 transition-transform">
              {data?.totalLeads || 0}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">Total Leads</p>
          </div>
          <div 
            className="text-center p-3 rounded-xl glass hover-lift transition-all group cursor-default animate-fade-in shadow-sm"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex items-center justify-center gap-1 mb-1.5">
              <div className="p-1 rounded-md bg-status-success/10 group-hover:scale-110 transition-transform">
                <CheckCircle className="h-3.5 w-3.5 text-status-success" />
              </div>
            </div>
            <p className="text-xl font-bold font-display text-status-success group-hover:scale-105 transition-transform">
              {data?.totalClosed || 0}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">Fechados</p>
          </div>
          <div 
            className="text-center p-3 rounded-xl glass hover-lift transition-all group cursor-default animate-fade-in shadow-sm"
            style={{ animationDelay: "250ms" }}
          >
            <div className="flex items-center justify-center gap-1 mb-1.5">
              <div className="p-1 rounded-md bg-rank-gold/10 group-hover:scale-110 transition-transform">
                <DollarSign className="h-3.5 w-3.5 text-rank-gold" />
              </div>
            </div>
            <p className="text-xl font-bold font-display text-rank-gold group-hover:scale-105 transition-transform">
              {formatCurrency(data?.totalValue || 0)}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">Valor Total</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
