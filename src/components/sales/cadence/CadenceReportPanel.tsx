import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  TrendingUp,
  Mail,
  Phone,
  MessageSquare,
  Users,
  ListChecks,
  CalendarCheck,
  MoreHorizontal,
} from 'lucide-react';
import { useState, type ComponentType } from 'react';
import { Linkedin } from '@/components/icons/Linkedin';
import { motion } from 'framer-motion';
import { useCadenceMetrics } from '@/hooks/cadences/useCadenceMetrics';
import {
  CADENCE_REPORT_PERIOD_DAYS,
  aggregateCadenceReport,
  useCadenceChannelExecution,
  type CadenceChannel,
  type CadenceReportPeriod,
} from '@/hooks/cadences/useCadenceReport';

const CHANNEL_META: Record<
  CadenceChannel,
  { label: string; icon: ComponentType<{ className?: string }>; color: string }
> = {
  whatsapp: { label: 'WhatsApp', icon: MessageSquare, color: 'bg-green-500' },
  call: { label: 'Ligação', icon: Phone, color: 'bg-blue-500' },
  email: { label: 'E-mail', icon: Mail, color: 'bg-purple-500' },
  linkedin: { label: 'Linkedin', icon: Linkedin, color: 'bg-sky-500' },
  meeting: { label: 'Reunião', icon: CalendarCheck, color: 'bg-orange-500' },
  other: { label: 'Outro', icon: MoreHorizontal, color: 'bg-muted-foreground' },
};

function formatPct(value: number): string {
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

export function CadenceReportPanel() {
  const [period, setPeriod] = useState<CadenceReportPeriod>('weekly');
  const days = CADENCE_REPORT_PERIOD_DAYS[period];

  const metricsQuery = useCadenceMetrics(undefined, days);
  const channelsQuery = useCadenceChannelExecution(days);

  const totals = aggregateCadenceReport(metricsQuery.data ?? []);
  const channels = channelsQuery.data ?? [];

  const metrics = [
    {
      label: 'Inscrições no Período',
      value: String(totals.enrolled),
      sub: `${totals.active} ativas`,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Conclusão de Tarefas',
      value: formatPct(totals.completionRate),
      sub: `${totals.tasksCompleted}/${totals.tasksTotal} tarefas`,
      icon: ListChecks,
      color: 'text-orange-500',
    },
    {
      label: 'Taxa de Resposta',
      value: formatPct(totals.replyRate),
      sub: `${totals.replied} responderam`,
      icon: MessageSquare,
      color: 'text-purple-500',
    },
    {
      label: 'Conversão Final',
      value: formatPct(totals.conversionRate),
      sub: `${totals.converted} vendas concluídas`,
      icon: TrendingUp,
      color: 'text-green-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Relatórios de Desempenho
        </h3>
        <Select value={period} onValueChange={v => setPeriod(v as CadenceReportPeriod)}>
          <SelectTrigger
            className="w-[140px] h-8 text-xs"
            aria-label="Período do relatório"
          >
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="quarterly">Trimestral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {metricsQuery.isLoading ? (
        <Skeleton className="h-28 w-full rounded-lg" />
      ) : metricsQuery.isError ? (
        <p className="text-xs text-destructive text-center py-4">
          Não foi possível carregar as métricas de cadência.
        </p>
      ) : totals.enrolled === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          Nenhuma inscrição em cadência nos últimos {days} dias.
        </p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-lg ${metric.color}/10`}>
                      <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {metric.sub}
                    </span>
                  </div>
                  <p className="text-xl font-bold">{metric.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                    {metric.label}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Card className="glass border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-section-title text-xs text-muted-foreground uppercase tracking-wider">
            Execução por Canal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {channelsQuery.isLoading ? (
            <Skeleton className="h-20 w-full rounded-lg" />
          ) : channelsQuery.isError ? (
            <p className="text-xs text-destructive text-center py-4">
              Não foi possível carregar a execução por canal.
            </p>
          ) : channels.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Nenhuma tarefa de cadência vencida nos últimos {days} dias.
            </p>
          ) : (
            channels.map(item => {
              const meta = CHANNEL_META[item.channel];
              return (
                <div key={item.channel} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-md ${meta.color}/20`}>
                        <meta.icon
                          className={`h-3 w-3 ${meta.color.replace('bg-', 'text-')}`}
                        />
                      </div>
                      <span className="font-medium">{meta.label}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {item.completed}/{item.total} concluídas ·{' '}
                      <span className="text-foreground font-bold">
                        {formatPct(item.rate)}
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.rate}%` }}
                      className={`h-full ${meta.color}`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
