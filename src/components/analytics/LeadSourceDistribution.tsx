import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeadSourceAnalysis, sourceLabels, sourceColors, LeadSource } from "@/hooks/useLeadSourceAnalysis";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChartIcon, TrendingUp, CheckCircle, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function LeadSourceDistribution() {
  const { data, isLoading } = useLeadSourceAnalysis(3);

  if (isLoading) {
    return (
      <Card className="glass dark:border-glow card-elevated">
        <CardHeader>
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
              <PieChartIcon className="h-4 w-4 text-primary" />
            </div>
            <span className="gradient-text">Distribuição por Fonte</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full rounded-xl animate-pulse" />
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

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  return (
    <Card className="glass dark:border-glow card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
            <PieChartIcon className="h-4 w-4 text-primary" />
          </div>
          <span className="gradient-text">Distribuição de Leads por Fonte</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] animate-fade-in">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={sourceColors[entry.source as LeadSource]}
                    stroke="transparent"
                    style={{
                      filter: "drop-shadow(0 4px 8px hsl(var(--primary) / 0.2))",
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
                  boxShadow: "0 10px 40px -10px hsl(var(--primary) / 0.2)",
                }}
                formatter={(value: number) => [`${value} leads`, 'Quantidade']}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px' }}
                layout="horizontal"
                align="center"
                formatter={(value) => <span className="text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/40">
          <div 
            className="text-center p-2 rounded-lg bg-card/50 hover-lift transition-all"
            style={{ animationDelay: "0ms" }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-primary" />
            </div>
            <p className="text-xl font-bold font-display gradient-text">{data?.totalLeads || 0}</p>
            <p className="text-[10px] text-muted-foreground">Total Leads</p>
          </div>
          <div 
            className="text-center p-2 rounded-lg bg-card/50 hover-lift transition-all animate-fade-in"
            style={{ animationDelay: "50ms" }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-3 w-3 text-status-success" />
            </div>
            <p className="text-xl font-bold font-display text-status-success">{data?.totalClosed || 0}</p>
            <p className="text-[10px] text-muted-foreground">Fechados</p>
          </div>
          <div 
            className="text-center p-2 rounded-lg bg-card/50 hover-lift transition-all animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-3 w-3 text-rank-gold" />
            </div>
            <p className="text-xl font-bold font-display text-rank-gold">{formatCurrency(data?.totalValue || 0)}</p>
            <p className="text-[10px] text-muted-foreground">Valor Total</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
