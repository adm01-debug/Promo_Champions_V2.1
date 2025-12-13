import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeadSourceTrend, sourceLabels, sourceColors, LeadSource } from "@/hooks/useLeadSourceAnalysis";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function LeadSourceTrendChart() {
  const { data, isLoading } = useLeadSourceTrend();

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Tendência por Fonte</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
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

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Tendência de Fechamentos por Fonte
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
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
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px' }}
                formatter={(value: string) => sourceLabels[value as LeadSource] || value}
              />
              {activeSources.map((source) => (
                <Bar 
                  key={source}
                  dataKey={source}
                  name={source}
                  stackId="a"
                  fill={sourceColors[source]}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
