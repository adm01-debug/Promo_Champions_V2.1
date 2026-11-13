import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Target, TrendingUp, Sparkles, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCadenceChannelStats } from '@/hooks/cadences/useCadenceChannelStats';

const PERIOD_DAYS = 30;

export function EliteCadenceAnalytics() {
  const { data: metrics, isLoading, isError } = useCadenceChannelStats(PERIOD_DAYS);

  if (isLoading)
    return (
      <div className="h-64 flex items-center justify-center">
        Calculando Insights Neurais...
      </div>
    );

  if (isError)
    return (
      <div className="h-64 flex items-center justify-center text-destructive">
        Não foi possível carregar as métricas de cadência. Tente novamente.
      </div>
    );

  if (!metrics || metrics.totalTasks === 0)
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Nenhuma tarefa de cadência agendada nos últimos {PERIOD_DAYS} dias.
      </div>
    );

  const top = metrics.topChannel;

  return (
    <div className="space-y-6">
      {/* Pareto Neural Insight Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 glass border-primary/20 bg-primary/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="h-24 w-24 text-primary" />
          </div>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 animate-pulse"
              >
                Pareto Neural Insight
              </Badge>
            </div>
            <CardTitle className="text-section-title flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              Otimização Estratégica
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground/80">
              Nos últimos {metrics.days} dias, o canal{' '}
              <span className="text-primary font-bold uppercase">{top?.type}</span> teve a
              maior taxa de conclusão de tarefas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/40">
              <div className="p-3 rounded-full bg-success/10 text-success">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">
                  {top ? `${top.rate.toFixed(1)}% de conclusão` : '—'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {top?.completed ?? 0} de {top?.total ?? 0} tarefas concluídas no canal{' '}
                  {top?.type}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/40">
          <CardHeader>
            <CardTitle className="text-section-title text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Taxa de conclusão geral
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pb-8">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="h-full w-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/20"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="364.4"
                  initial={{ strokeDashoffset: 364.4 }}
                  animate={{
                    strokeDashoffset: 364.4 - (364.4 * metrics.completionRate) / 100,
                  }}
                  className="text-primary"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">
                  {Math.round(metrics.completionRate)}%
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {metrics.completedTasks} de {metrics.totalTasks} tarefas
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Health Matrix */}
      <Card className="glass border-border/40">
        <CardHeader>
          <CardTitle className="text-section-title text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            Health Matrix por Canal (últimos {metrics.days} dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.channels.map(
              (channel: { type: string; rate: number; total: number }) => (
                <div key={channel.type} className="flex items-center gap-4">
                  <div className="w-20 text-[10px] font-bold uppercase text-muted-foreground">
                    {channel.type}
                  </div>
                  <div className="flex-1 h-8 bg-muted/20 rounded-lg overflow-hidden flex items-center px-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${channel.rate}%` }}
                      className={`h-6 rounded-md flex items-center justify-end px-2 transition-all ${
                        channel.rate > 70
                          ? 'bg-success/40 text-success'
                          : channel.rate > 40
                            ? 'bg-warning/40 text-warning'
                            : 'bg-destructive/40 text-destructive'
                      }`}
                    >
                      <span className="text-[10px] font-bold">
                        {channel.rate.toFixed(1)}%
                      </span>
                    </motion.div>
                  </div>
                  <div className="w-12 text-right">
                    <Badge variant="secondary" className="text-[10px]">
                      {channel.total}
                    </Badge>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
