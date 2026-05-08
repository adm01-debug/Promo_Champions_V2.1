import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeadTemperatureDistribution } from "@/hooks/useSDRMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Flame, Thermometer, Snowflake, IceCream2 } from "lucide-react";

export function LeadTemperatureChart() {
  const { data: distribution, isLoading } = useLeadTemperatureDistribution();

  if (isLoading) {
    return (
      <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated animate-fade-in">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-streak to-status-error shadow-lg shadow-streak/20 animate-pulse">
              <Thermometer className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="gradient-text">Temperatura dos Leads</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full rounded-full mx-auto max-w-[160px] animate-shimmer" />
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-full animate-shimmer" style={{ animationDelay: `${i * 50}ms` }} />
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
    <Card variant="elevated" className="glass border-border/40 dark:border-glow card-elevated transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group/title">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-streak to-status-error shadow-lg shadow-streak/20 transition-all duration-300 group-hover/title:scale-110 group-hover/title:shadow-streak/40">
            <Thermometer className="h-4 w-4 text-primary-foreground" />
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
                    style={{ filter: `drop-shadow(0 4px 8px ${entry.color}40)` }}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border) / 0.5)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'
                }}
                formatter={(value: any, name: any) => [`${value} leads`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {distribution?.map((item, index) => (
            <div 
              key={item.name} 
              className="flex items-center gap-2 text-xs p-2 rounded-lg glass border border-border/30 hover:border-primary/40 transition-all duration-300 group animate-fade-in cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div 
                className="h-2.5 w-2.5 rounded-full shadow-md transition-all duration-300 group-hover:scale-150" 
                style={{ backgroundColor: item.color, boxShadow: `0 0 12px ${item.color}60` }}
              />
              <span className="flex items-center gap-1 font-display font-medium group-hover:text-primary transition-colors">
                {getIcon(item.name)}
                {item.name}
              </span>
              <span className="text-muted-foreground ml-auto font-display font-semibold transition-transform duration-300 group-hover:scale-110">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
