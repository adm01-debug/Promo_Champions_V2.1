import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEmailMetrics } from '@/hooks/useEmailMetrics';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, _Cell, __PieChart, Pie
} from 'recharts';
import { 
  Mail, Send, AlertTriangle, CheckCircle, TrendingUp, 
  Users, Activity, Clock, XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

const FUNCTION_LABELS: Record<string, string> = {
  'send-alert-notifications': 'Alertas Gerais',
  'sdr-consecutive-alerts': 'Alertas SDR',
  'activity-goal-alerts': 'Alertas Metas',
  'access-denied-alerts': 'Alertas Segurança',
  'check-lead-sla': 'Lead SLA'
};
const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--status-success))',
  'hsl(var(--status-warning))',
  'hsl(var(--status-info))',
  'hsl(var(--status-purple))',
];

export function EmailMetricsDashboard() {
  const [period, setPeriod] = useState<7 | 14 | 30>(30);
  const { data, isLoading } = useEmailMetrics(period);

  if (isLoading) {
    return (
      <Card variant="elevated" className="glass border-border/40 dark:border-glow animate-fade-in">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted/50 rounded-xl animate-shimmer" style={{ animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
            <div className="h-64 bg-muted/50 rounded-xl animate-shimmer" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = data && (data.totalSent > 0 || data.totalFailed > 0);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 group/header">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 transition-all duration-300 group-hover/header:scale-110">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-display font-semibold gradient-text">Métricas de Emails</span>
        </div>
        
        <div className="flex gap-2">
          {[7, 14, 30].map((days) => (
            <Badge
              key={days}
              variant={period === days ? 'default' : 'outline'}
              className={`cursor-pointer transition-all ${period === days ? 'bg-primary' : 'hover:bg-primary/10'}`}
              onClick={() => setPeriod(days as 7 | 14 | 30)}
            >
              {days}d
            </Badge>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="elevated" className="glass border-border/40 dark:border-glow hover-lift transition-all group animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-md transition-all duration-300 group-hover:scale-110">
                <Send className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display gradient-text">{data?.totalSent || 0}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="glass border-status-error/30 dark:border-glow hover-lift transition-all group animate-fade-in" style={{ animationDelay: '50ms' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-status-error/20 shadow-md transition-all duration-300 group-hover:scale-110">
                <XCircle className="h-4 w-4 text-status-error" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display text-status-error">{data?.totalFailed || 0}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">Falhas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="glass border-status-success/30 dark:border-glow hover-lift transition-all group animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-status-success/20 shadow-md transition-all duration-300 group-hover:scale-110">
                <CheckCircle className="h-4 w-4 text-status-success" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display text-status-success">{data?.successRate.toFixed(1) || 100}%</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">Taxa Sucesso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="glass border-status-info/30 dark:border-glow hover-lift transition-all group animate-fade-in" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-status-info/20 shadow-md transition-all duration-300 group-hover:scale-110">
                <Activity className="h-4 w-4 text-status-info" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display text-status-info">{data?.byFunction.length || 0}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">Funções Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!hasData ? (
        <Card variant="elevated" className="glass border-border/40 dark:border-glow">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <div className="p-4 rounded-full bg-muted/30 mb-3 animate-pulse">
                <Mail className="h-10 w-10 opacity-50" />
              </div>
              <p className="font-display font-medium gradient-text">Nenhum email enviado no período</p>
              <p className="text-xs text-muted-foreground mt-1">Os dados aparecerão conforme emails forem enviados</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="trend" className="space-y-4">
          <TabsList className="glass border border-border/50 p-1">
            <TabsTrigger value="trend" className="gap-2 font-display data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground">
              <TrendingUp className="h-4 w-4" />
              Tendência
            </TabsTrigger>
            <TabsTrigger value="functions" className="gap-2 font-display data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground">
              <Activity className="h-4 w-4" />
              Por Função
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2 font-display data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground">
              <Clock className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trend" className="animate-fade-in">
            <Card variant="elevated" className="glass border-border/40 dark:border-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <span className="gradient-text">Volume de Emails por Dia</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.dailyStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="emailSentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--status-success))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--status-success))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="emailFailedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--status-error))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--status-error))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                      />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '12px'
                        }}
                        labelFormatter={(date) => format(new Date(date), 'dd MMM yyyy', { locale: ptBR })}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sent" 
                        name="Enviados"
                        stroke="hsl(var(--status-success))" 
                        fillOpacity={1} 
                        fill="url(#emailSentGradient)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="failed" 
                        name="Falhas"
                        stroke="hsl(var(--status-error))" 
                        fillOpacity={1} 
                        fill="url(#emailFailedGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="functions" className="animate-fade-in">
            <div className="grid lg:grid-cols-2 gap-4">
              <Card variant="elevated" className="glass border-border/40 dark:border-glow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                    <span className="gradient-text">Emails por Função</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.byFunction} layout="vertical" margin={{ left: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <YAxis 
                          type="category" 
                          dataKey="function_name" 
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                          tickFormatter={(name) => FUNCTION_LABELS[name] || name}
                        />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '12px'
                          }}
                          labelFormatter={(name) => FUNCTION_LABELS[name] || name}
                        />
                        <Bar dataKey="sent" name="Enviados" fill="hsl(var(--status-success))" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="failed" name="Falhas" fill="hsl(var(--status-error))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated" className="glass border-border/40 dark:border-glow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <span className="gradient-text">Top Destinatários</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {data?.topRecipients.map((recipient, index) => (
                        <div 
                          key={recipient.email}
                          className="flex items-center justify-between p-3 rounded-xl glass border border-border/30 hover:border-primary/40 transition-all animate-fade-in group"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium truncate max-w-[200px] group-hover:text-primary transition-colors">
                              {recipient.email}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {recipient.count} emails
                          </Badge>
                        </div>
                      ))}
                      {(!data?.topRecipients || data.topRecipients.length === 0) && (
                        <div className="text-center text-muted-foreground py-8">
                          <Mail className="h-8 w-8 opacity-50 mx-auto mb-2" />
                          <p className="text-sm">Nenhum destinatário ainda</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="animate-fade-in">
            <Card variant="elevated" className="glass border-border/40 dark:border-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <span className="gradient-text">Histórico de Emails</span>
                  {data?.recentLogs && (
                    <Badge variant="secondary" className="text-xs ml-2">
                      {data.recentLogs.length} registros
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {data?.recentLogs.map((log, index) => (
                      <div 
                        key={log.id}
                        className={`p-3 rounded-xl glass border transition-all hover-lift cursor-default animate-fade-in ${
                          log.status === 'sent' 
                            ? 'border-status-success/30 hover:border-status-success/50' 
                            : 'border-status-error/30 hover:border-status-error/50'
                        }`}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {log.status === 'sent' ? (
                              <CheckCircle className="h-4 w-4 text-status-success" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-status-error" />
                            )}
                            <Badge variant="outline" className="text-[10px]">
                              {FUNCTION_LABELS[log.function_name] || log.function_name}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), "dd/MM HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate">{log.recipient_email}</p>
                        {log.subject && (
                          <p className="text-xs text-muted-foreground truncate mt-1">{log.subject}</p>
                        )}
                        {log.error_message && (
                          <p className="text-xs text-status-error mt-1">{log.error_message}</p>
                        )}
                      </div>
                    ))}
                    {(!data?.recentLogs || data.recentLogs.length === 0) && (
                      <div className="text-center text-muted-foreground py-12">
                        <Mail className="h-10 w-10 opacity-50 mx-auto mb-3" />
                        <p className="font-display font-medium">Nenhum email registrado</p>
                        <p className="text-xs mt-1">Os logs aparecerão conforme emails forem enviados</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
