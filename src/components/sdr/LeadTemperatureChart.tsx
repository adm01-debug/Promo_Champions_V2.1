import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeadTemperatureDistribution } from "@/hooks/useSDRMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Flame, Thermometer, Snowflake, IceCream2 } from "lucide-react";

export function LeadTemperatureChart() {
  const { data: distribution, isLoading } = useLeadTemperatureDistribution();

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Temperatura dos Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getIcon = (name: string) => {
    switch (name) {
      case "Quentes": return <Flame className="h-3 w-3" />;
      case "Mornos": return <Thermometer className="h-3 w-3" />;
      case "Frios": return <Snowflake className="h-3 w-3" />;
      default: return <IceCream2 className="h-3 w-3" />;
    }
  };

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Temperatura dos Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distribution}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={4}
                dataKey="value"
              >
                {distribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string) => [`${value} leads`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {distribution?.map(item => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <div 
                className="h-2 w-2 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="flex items-center gap-1">
                {getIcon(item.name)}
                {item.name}
              </span>
              <span className="text-muted-foreground ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
