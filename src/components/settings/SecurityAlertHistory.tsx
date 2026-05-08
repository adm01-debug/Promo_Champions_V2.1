import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Mail, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AlertHistory {
  id: string;
  alert_type: string;
  recipients: string[];
  access_count: number;
  time_window_hours: number;
  threshold_used: number;
  created_at: string;
}

type PeriodOption = "7" | "15" | "30" | "90";

const periodOptions: { value: PeriodOption; label: string }[] = [
  { value: "7", label: "7 dias" },
  { value: "15", label: "15 dias" },
  { value: "30", label: "30 dias" },
  { value: "90", label: "90 dias" },
];

export function SecurityAlertHistory() {
  const [period, setPeriod] = useState<PeriodOption>("30");

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['security-alert-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_alert_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as AlertHistory[];
    }
  });

  const chartData = useMemo(() => {
    if (!alerts || alerts.length === 0) return [];

    const days = parseInt(period);
    const today = new Date();
    const startDate = subDays(today, days - 1);
    
    const dateRange = eachDayOfInterval({ start: startDate, end: today });
    
    const alertsByDay = alerts.reduce((acc, alert) => {
      const day = format(new Date(alert.created_at), 'yyyy-MM-dd');
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return dateRange.map(day => {
      const key = format(day, 'yyyy-MM-dd');
      return {
        date: format(day, 'dd/MM', { locale: ptBR }),
        fullDate: format(day, 'dd/MM/yyyy', { locale: ptBR }),
        alertas: alertsByDay[key] || 0,
      };
    });
  }, [alerts, period]);

  if (isLoading) {
    return (
      <Card className="card-elevated border-border/40 dark:border-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="p-1.5 rounded-lg bg-gradient-primary">
              <History className="h-4 w-4 text-primary-foreground" />
            </div>
            Histórico de Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAlerts = alerts?.length || 0;
  const totalAccessCount = alerts?.reduce((sum, a) => sum + a.access_count, 0) || 0;

  return (
    <Card className="card-elevated border-border/40 dark:border-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="p-1.5 rounded-lg bg-gradient-primary">
              <History className="h-4 w-4 text-primary-foreground" />
            </div>
            Histórico de Alertas
          </CardTitle>
          {totalAlerts > 0 && (
            <div className="flex gap-3">
              <Badge variant="outline" className="bg-status-error/10 text-status-error border-status-error/30">
                {totalAlerts} alertas
              </Badge>
              <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning/30">
                {totalAccessCount} acessos negados
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trend Chart */}
        {chartData.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Tendência de alertas
              </div>
              <Select value={period} onValueChange={(v) => setPeriod(v as PeriodOption)}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--status-error))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--status-error))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: any) => [`${value} alerta(s)`, 'Alertas']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                  />
                  <Area
                    type="monotone"
                    dataKey="alertas"
                    stroke="hsl(var(--status-error))"
                    strokeWidth={2}
                    fill="url(#alertGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Alert List */}
        {!alerts || alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum alerta enviado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Alertas recentes</p>
            {alerts.slice(0, 10).map((alert, index) => (
              <div 
                key={alert.id} 
                className="p-4 rounded-lg border border-border/40 bg-card/50 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-status-error/20">
                      <AlertTriangle className="h-4 w-4 text-status-error" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Pico de Acessos Negados
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(alert.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-status-error/10 text-status-error border-status-error/30">
                    {alert.access_count} acessos
                  </Badge>
                </div>
                
                <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap gap-2 text-xs">
                  <span className="text-muted-foreground">
                    Threshold: <span className="text-foreground">{alert.threshold_used}</span>
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    Janela: <span className="text-foreground">{alert.time_window_hours}h</span>
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="text-foreground">{alert.recipients.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}