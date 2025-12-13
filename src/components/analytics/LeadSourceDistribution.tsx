import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeadSourceAnalysis, sourceLabels, sourceColors, LeadSource } from "@/hooks/useLeadSourceAnalysis";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChartIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function LeadSourceDistribution() {
  const { data, isLoading } = useLeadSourceAnalysis(3);

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Distribuição por Fonte</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
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
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-primary" />
          Distribuição de Leads por Fonte
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
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
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value} leads`, 'Quantidade']}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px' }}
                layout="horizontal"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/40">
          <div className="text-center">
            <p className="text-xl font-bold">{data?.totalLeads || 0}</p>
            <p className="text-[10px] text-muted-foreground">Total Leads</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-green-500">{data?.totalClosed || 0}</p>
            <p className="text-[10px] text-muted-foreground">Fechados</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{formatCurrency(data?.totalValue || 0)}</p>
            <p className="text-[10px] text-muted-foreground">Valor Total</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
