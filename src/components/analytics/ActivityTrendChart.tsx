import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import { ActivityTrendData } from "@/hooks/useSalespersonActivityReport";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActivityTrendChartProps {
  data: ActivityTrendData[];
}

export function ActivityTrendChart({ data }: ActivityTrendChartProps) {
  const chartData = data.map(d => ({
    ...d,
    date: format(parseISO(d.date), "dd/MM", { locale: ptBR }),
  }));

  return (
    <Card className="glass dark:border-glow card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <span className="gradient-text">Tendência de Atividades (30 dias)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] animate-fade-in">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--status-success))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--status-success))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--status-info))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--status-info))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--status-purple))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--status-purple))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={9}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "0 10px 40px -10px hsl(var(--primary) / 0.2)",
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: "10px" }}
                formatter={(value) => <span className="text-muted-foreground">{value}</span>}
              />
              <Area 
                type="monotone" 
                dataKey="calls" 
                name="Calls"
                stroke="hsl(var(--status-success))" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCalls)" 
              />
              <Area 
                type="monotone" 
                dataKey="emails" 
                name="Emails"
                stroke="hsl(var(--status-info))" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorEmails)" 
              />
              <Area 
                type="monotone" 
                dataKey="meetings" 
                name="Reuniões"
                stroke="hsl(var(--status-purple))" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorMeetings)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
