import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeadTemperatureDistribution } from "@/hooks/useSDRMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Flame, Thermometer, Snowflake, IceCream2 } from "lucide-react";

export function LeadTemperatureChart() {
  const { data: distribution, isLoading } = useLeadTemperatureDistribution();

  if (isLoading) {
    return (
      <Card className="glass border-border/40 dark:border-glow card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-streak to-status-error shadow-md animate-pulse">
              <Thermometer className="h-4 w-4 text-white" />
            </div>
            <span className="gradient-text">Temperatura dos Leads</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full rounded-full mx-auto max-w-[160px]" />
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
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
    <Card className="glass border-border/40 dark:border-glow card-elevated transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-streak to-status-error shadow-md">
            <Thermometer className="h-4 w-4 text-white" />
          </div>
          <span className="gradient-text">Temperatura dos Leads</span>
        </CardTitle>
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
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border) / 0.5)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
                formatter={(value: number, name: string) => [`${value} leads`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {distribution?.map((item, index) => (
            <div 
              key={item.name} 
              className="flex items-center gap-2 text-xs p-1.5 rounded-lg hover:bg-muted/30 transition-all duration-200 group animate-fade-in cursor-default"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div 
                className="h-2.5 w-2.5 rounded-full shadow-sm transition-transform duration-200 group-hover:scale-125" 
                style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}60` }}
              />
              <span className="flex items-center gap-1 font-medium group-hover:text-primary transition-colors">
                {getIcon(item.name)}
                {item.name}
              </span>
              <span className="text-muted-foreground ml-auto font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
