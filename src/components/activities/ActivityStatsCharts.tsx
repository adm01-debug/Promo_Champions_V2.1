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
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <div className="mb-6">
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn(
          "w-full justify-between px-4 h-10 transition-all duration-300 rounded-xl",
          showStats ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted/50"
        )} 
        onClick={onToggle}
      >
        <span className="flex items-center gap-3 font-display font-black uppercase tracking-widest text-[10px] italic">
          <BarChart3 className={cn("h-4 w-4", showStats ? "text-primary" : "text-muted-foreground")} />
          Analytics & Performance Insights
        </span>
        {showStats ? (
          <ChevronUp className="h-4 w-4 text-primary animate-bounce-in" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
      
      <div className={cn(
        "grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]", 
        showStats ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <div className="p-6 rounded-2xl glass border border-border/40 shadow-xl bg-gradient-to-br from-background/50 to-muted/20 relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
              {/* Type Distribution - Enhanced Bar Chart */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">Mix de Atividades</h4>
                </div>
                
                <div className="h-[180px] w-full">
                  <ChartContainer config={{ count: { label: "Volume", color: "hsl(var(--primary))" } }} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={Object.entries(typeStats).map(([type, count]) => ({ 
                          name: activityLabels[type as ActivityType], 
                          count, 
                          type 
                        }))} 
                        layout="vertical" 
                        margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={80} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }} 
                          axisLine={false} 
                          tickLine={false} 
                        />
                        <Tooltip 
                          content={<ChartTooltipContent />} 
                          cursor={{ fill: 'hsl(var(--primary)/0.05)' }}
                        />
                        <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={24}>
                          {Object.entries(typeStats).map(([, ], index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`hsl(var(--primary))`} 
                              fillOpacity={1 - (index * 0.15)} 
                              className="transition-all duration-300 hover:fill-opacity-100"
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Object.entries(typeStats).map(([type, count]) => {
                    const Icon = activityIcons[type as ActivityType];
                    return (
                      <Badge key={type} variant="secondary" className="bg-background/40 hover:bg-background/60 transition-colors border-border/10 text-[9px] font-black uppercase py-1 px-2.5 gap-1.5 shadow-sm">
                        <Icon className="h-3 w-3 text-primary" />
                        {activityLabels[type as ActivityType]}
                        <span className="text-primary font-black ml-0.5">{count}</span>
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Outcome Analysis - Enhanced Pie Chart */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-accent/10">
                    <TrendingUp className="h-4 w-4 text-accent" />
                  </div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">Taxa de Conversão</h4>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="h-[180px] w-full md:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={Object.entries(outcomeStats).map(([outcome, count]) => ({ 
                            name: outcomeLabels[outcome as ActivityOutcome].label, 
                            value: count, 
                            outcome 
                          }))} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={45} 
                          outerRadius={65} 
                          paddingAngle={6} 
                          dataKey="value"
                          stroke="none"
                          onMouseEnter={(_, index) => setActiveIndex(index)}
                        >
                          {Object.entries(outcomeStats).map(([, ], index) => {
                            const colors = ['hsl(var(--status-success))', 'hsl(var(--status-error))', 'hsl(var(--status-info))', 'hsl(var(--status-warning))', 'hsl(var(--primary))'];
                            return (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={colors[index % colors.length]} 
                                className="transition-all duration-300"
                                style={{ filter: activeIndex === index ? `drop-shadow(0 0 6px ${colors[index % colors.length]})` : 'none' }}
                              />
                            );
                          })}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="glass p-2 px-3 rounded-lg border border-border/40 shadow-xl text-[10px] font-bold uppercase tracking-tight">
                                  {payload[0].name}: {payload[0].value}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full md:w-1/2 space-y-2">
                    {Object.entries(outcomeStats).map(([outcome, count], i) => {
                      const style = outcomeLabels[outcome as ActivityOutcome];
                      const colors = ['hsl(var(--status-success))', 'hsl(var(--status-error))', 'hsl(var(--status-info))', 'hsl(var(--status-warning))', 'hsl(var(--primary))'];
                      return (
                        <div 
                          key={outcome} 
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg border border-transparent transition-all",
                            activeIndex === i ? "bg-muted/50 border-border/20 shadow-sm translate-x-1" : "opacity-70"
                          )}
                          onMouseEnter={() => setActiveIndex(i)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                            <span className="text-[10px] font-black uppercase tracking-tight">{style.label}</span>
                          </div>
                          <span className="text-xs font-black">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
