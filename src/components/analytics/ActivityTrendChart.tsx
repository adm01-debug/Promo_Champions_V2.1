import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Phone, Mail, Calendar, Activity } from "lucide-react";
import { ActivityTrendData } from "@/hooks/sales/useSalespersonActivityReport";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { RechartsTooltipProps, RechartsTooltipPayloadEntry } from "@/types/recharts";

interface ActivityTrendChartProps {
  data: ActivityTrendData[];
}

export function ActivityTrendChart({ data }: ActivityTrendChartProps) {
  const chartData = data.map(d => ({
    ...d,
    date: format(parseISO(d.date), "dd/MM", { locale: ptBR }),
  }));

  const totalCalls = data.reduce((sum, d) => sum + d.calls, 0);
  const totalEmails = data.reduce((sum, d) => sum + d.emails, 0);
  const totalMeetings = data.reduce((sum, d) => sum + d.meetings, 0);
  const totalActivities = totalCalls + totalEmails + totalMeetings;

  const CustomTooltip = ({ active, payload, label }: RechartsTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass border border-border/50 rounded-xl p-3 shadow-xl backdrop-blur-md">
          <p className="text-xs font-display font-bold text-foreground mb-2">{label}</p>
          <div className="space-y-1.5">
            {payload.map((entry: RechartsTooltipPayloadEntry, index: number) => (
              <div key={index} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-2.5 h-2.5 rounded-full shadow-sm" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
                <span className="font-bold font-display" style={{ color: entry.color }}>
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass dark:border-glow card-elevated hover-lift transition-all animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display font-medium flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <span className="gradient-text">Tendência de Atividades (30 dias)</span>
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary shadow-sm">
            {totalActivities} atividades
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2 mb-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-status-success/5 hover:bg-status-success/10 transition-colors group cursor-default">
            <div className="p-1 rounded-md bg-status-success/10 group-hover:scale-110 transition-transform">
              <Phone className="h-3 w-3 text-status-success" />
            </div>
            <div>
              <p className="text-xs font-bold font-display text-status-success">{totalCalls}</p>
              <p className="text-[9px] text-muted-foreground">Calls</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-status-info/5 hover:bg-status-info/10 transition-colors group cursor-default">
            <div className="p-1 rounded-md bg-status-info/10 group-hover:scale-110 transition-transform">
              <Mail className="h-3 w-3 text-status-info" />
            </div>
            <div>
              <p className="text-xs font-bold font-display text-status-info">{totalEmails}</p>
              <p className="text-[9px] text-muted-foreground">Emails</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-status-purple/5 hover:bg-status-purple/10 transition-colors group cursor-default">
            <div className="p-1 rounded-md bg-status-purple/10 group-hover:scale-110 transition-transform">
              <Calendar className="h-3 w-3 text-status-purple" />
            </div>
            <div>
              <p className="text-xs font-bold font-display text-status-purple">{totalMeetings}</p>
              <p className="text-[9px] text-muted-foreground">Reuniões</p>
            </div>
          </div>
        </div>

        <div className="h-[220px] animate-fade-in" style={{ animationDelay: '100ms' }}>
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground glass rounded-xl border border-dashed border-border/50">
              <div className="p-4 rounded-full bg-gradient-to-br from-muted/30 to-muted/10 mb-3 shadow-lg">
                <Activity className="h-10 w-10 opacity-50 animate-pulse" />
              </div>
              <p className="text-sm font-display font-medium gradient-text">Nenhuma atividade registrada</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Registre atividades para ver a tendência</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--status-success))" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="hsl(var(--status-success))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--status-info))" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="hsl(var(--status-info))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--status-purple))" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="hsl(var(--status-purple))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: "10px", paddingTop: '8px' }}
                  formatter={(value) => (
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {value}
                    </span>
                  )}
                />
                <Area 
                  type="monotone" 
                  dataKey="calls" 
                  name="Calls"
                  stroke="hsl(var(--status-success))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCalls)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="emails" 
                  name="Emails"
                  stroke="hsl(var(--status-info))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorEmails)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="meetings" 
                  name="Reuniões"
                  stroke="hsl(var(--status-purple))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorMeetings)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
