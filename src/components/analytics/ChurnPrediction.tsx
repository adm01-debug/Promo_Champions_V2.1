import React, { FC, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, UserX, Shield, TrendingDown, Clock, Mail, Phone, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChurnPrediction, ChurnPredictionItem } from './useChurnPrediction';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ChurnPredictionProps {
  clientId?: string;
  timeframe?: 'month' | 'quarter' | 'year';
  onClientClick?: (clientId: string) => void;
}

const riskConfig = {
  high: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', label: 'Alto', icon: AlertTriangle },
  medium: { color: 'text-streak', bg: 'bg-streak/10', border: 'border-streak/30', label: 'Médio', icon: TrendingDown },
  low: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', label: 'Baixo', icon: Shield },
};

const CHART_COLORS = ['hsl(var(--destructive))', 'hsl(var(--warning, 45 93% 47%))', 'hsl(var(--success))'];

export const ChurnPrediction: FC<ChurnPredictionProps> = ({
  clientId,
  timeframe = 'quarter',
  onClientClick,
}) => {
  const { data, isLoading, error } = useChurnPrediction({ clientId, timeframe });

  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;
    const high = data.filter(c => c.riskLevel === 'high');
    const medium = data.filter(c => c.riskLevel === 'medium');
    const low = data.filter(c => c.riskLevel === 'low');
    const avgScore = Math.round(data.reduce((sum, c) => sum + c.riskScore, 0) / data.length);
    const pieData = [
      { name: 'Alto', value: high.length },
      { name: 'Médio', value: medium.length },
      { name: 'Baixo', value: low.length },
    ].filter(d => d.value > 0);
    return { high, medium, low, avgScore, pieData, total: data.length };
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto text-destructive mb-2" />
          <p className="text-sm text-destructive">Erro ao carregar dados de churn</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <Shield className="h-10 w-10 mx-auto text-success/50 mb-3" />
          <p className="text-sm font-semibold text-foreground">Nenhum cliente em risco</p>
          <p className="text-xs text-muted-foreground mt-1">Todos os clientes estão ativos! 🎉</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-none shadow-sm">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <UserX className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-lg font-bold font-display text-destructive">{stats.high.length}</p>
              <p className="text-xs text-muted-foreground">Alto Risco</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-streak/10 flex items-center justify-center shrink-0">
              <TrendingDown className="h-4 w-4 text-streak" />
            </div>
            <div>
              <p className="text-lg font-bold font-display text-streak">{stats.medium.length}</p>
              <p className="text-xs text-muted-foreground">Risco Médio</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-bold font-display">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Monitorados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold font-display">{stats.avgScore}%</p>
              <p className="text-xs text-muted-foreground">Score Médio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Distribution chart */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Distribuição de Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {stats.pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs">
              {stats.pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                  <span className="text-muted-foreground">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Client list */}
        <Card className="border-none shadow-lg lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Clientes em Risco
              </CardTitle>
              <Badge variant="outline" className="text-xs">{stats.high.length + stats.medium.length} alertas</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[320px] overflow-y-auto scrollbar-thin">
              {[...stats.high, ...stats.medium].slice(0, 10).map((client, i) => {
                const config = riskConfig[client.riskLevel];
                const Icon = config.icon;
                return (
                  <motion.div
                    key={client.clientId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm',
                      config.bg, config.border
                    )}
                    onClick={() => onClientClick?.(client.clientId)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className={cn('h-4 w-4 shrink-0', config.color)} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{client.clientName}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{client.daysSinceLastPurchase}d sem atividade</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <Badge variant={client.riskLevel === 'high' ? 'destructive' : 'secondary'} className="text-[10px] h-5">
                            {config.label}
                          </Badge>
                        </div>
                        <div className="w-12">
                          <Progress value={client.riskScore} className="h-1.5" />
                          <p className={cn('text-[10px] font-mono text-right mt-0.5', config.color)}>{client.riskScore}%</p>
                        </div>
                      </div>
                    </div>
                    {client.factors.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {client.factors.map((f, j) => (
                          <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-background/50 text-muted-foreground">{f}</span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
