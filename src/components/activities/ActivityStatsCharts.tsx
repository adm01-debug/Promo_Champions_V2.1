import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, ChevronDown, ChevronUp, PieChart as PieIcon, Activity, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Sector } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { ActivityType, ActivityOutcome } from "@/hooks/useActivities";
import { activityIcons, activityLabels, outcomeLabels } from "./activityConstants";
import { cn } from "@/lib/utils";

interface ActivityStatsChartsProps {
  typeStats: Record<string, number>;
  outcomeStats: Record<string, number>;
  showStats: boolean;
  onToggle: () => void;
}

export function ActivityStatsCharts({ typeStats, outcomeStats, showStats, onToggle }: ActivityStatsChartsProps) {
  return (
    <div className="mb-4">
      <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-muted-foreground hover:text-foreground mb-2" onClick={onToggle}>
        <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />Estatísticas e Gráficos</span>
        {showStats ? <ChevronUp className="h-4 w-4 transition-transform duration-200" /> : <ChevronDown className="h-4 w-4 transition-transform duration-200" />}
      </Button>
      <div className={cn("grid transition-all duration-300 ease-out", showStats ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Bar Chart */}
              <div className="lg:col-span-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">Distribuição por Tipo</p>
                <div className="h-[120px]">
                  <ChartContainer config={{ count: { label: "Quantidade", color: "hsl(var(--primary))" } }} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(typeStats).map(([type, count]) => ({ name: activityLabels[type as ActivityType], count, type }))} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
                          {Object.entries(typeStats).map(([, ], index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(var(--primary))`} fillOpacity={0.8 - (index * 0.1)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
              {/* Type Stats */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Por Tipo</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(typeStats).map(([type, count]) => {
                    const Icon = activityIcons[type as ActivityType];
                    return (
                      <Badge key={type} variant="secondary" className="text-[10px] gap-1">
                        <Icon className="h-3 w-3" />{activityLabels[type as ActivityType]}: {count}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              {/* Outcome Stats */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Por Resultado</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(outcomeStats).map(([outcome, count]) => {
                    const style = outcomeLabels[outcome as ActivityOutcome];
                    return (
                      <Badge key={outcome} variant="outline" className={`text-[10px] border ${style.color}`}>{style.label}: {count}</Badge>
                    );
                  })}
                </div>
              </div>
              {/* Pie Chart */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Resultados</p>
                <div className="h-[120px]">
                  <ChartContainer config={{ count: { label: "Quantidade", color: "hsl(var(--primary))" } }} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={Object.entries(outcomeStats).map(([outcome, count]) => ({ name: outcomeLabels[outcome as ActivityOutcome].label, value: count, outcome }))} cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={2} dataKey="value">
                          {Object.entries(outcomeStats).map(([, ], index) => {
                            const colors = ['hsl(var(--status-success))', 'hsl(var(--status-error))', 'hsl(var(--status-info))', 'hsl(var(--status-warning))', 'hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--muted-foreground))', 'hsl(var(--secondary))'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
