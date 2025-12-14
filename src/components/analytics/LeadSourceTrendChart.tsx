import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLeadSourceTrend, sourceLabels, sourceColors, LeadSource } from "@/hooks/useLeadSourceAnalysis";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function LeadSourceTrendChart() {
  const { data, isLoading } = useLeadSourceTrend();

  if (isLoading) {
    return (
      <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
              <TrendingUp className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <span className="gradient-text">Tendência por Fonte</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-xl animate-shimmer" />
        </CardContent>
      </Card>
    );
  }

  // Transform data for stacked bar chart
  const chartData = data?.map(month => ({
    month: month.month,
    ...month.data,
  })) || [];

  // Get sources that have at least some data
  const activeSources = Object.keys(sourceLabels).filter(source => 
    chartData.some(d => (d as any)[source] > 0)
  ) as LeadSource[];

  // Calculate total deals for badge
  const totalDeals = chartData.reduce((sum, month) => {
    return sum + activeSources.reduce((monthSum, source) => monthSum + ((month as any)[source] || 0), 0);
  }, 0);

  return (
    <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <span className="gradient-text">Tendência de Fechamentos por Fonte</span>
          </CardTitle>
          {totalDeals > 0 && (
            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary shadow-sm">
              <BarChart3 className="h-3 w-3 mr-1" />
              {totalDeals} fechamentos
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] animate-fade-in" style={{ animationDelay: '100ms' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.3)',
                  backdropFilter: 'blur(8px)',
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: 'hsl(var(--foreground))' }}
                cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                formatter={(value: string) => (
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    {sourceLabels[value as LeadSource] || value}
                  </span>
                )}
              />
              {activeSources.map((source, index) => (
                <Bar 
                  key={source}
                  dataKey={source}
                  name={source}
                  stackId="a"
                  fill={sourceColors[source]}
                  radius={index === activeSources.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  className="transition-all hover:opacity-80"
                  style={{
                    filter: `drop-shadow(0 2px 4px ${sourceColors[source]}30)`
                  }}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {chartData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground glass rounded-xl border border-dashed border-border/50 animate-fade-in">
            <div className="p-4 rounded-full bg-gradient-to-br from-muted/30 to-muted/10 mb-3 shadow-lg">
              <BarChart3 className="h-10 w-10 opacity-50 animate-pulse" />
            </div>
            <p className="text-sm font-display font-medium gradient-text">Nenhum dado de tendência</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Dados aparecerão conforme vendas são registradas</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
