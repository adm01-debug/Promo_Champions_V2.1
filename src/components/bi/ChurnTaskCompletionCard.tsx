import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertOctagon, CheckCircle2, Clock, TimerOff } from 'lucide-react';
import { useChurnTaskCompletion } from '@/hooks/bi/useChurnTaskCompletion';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  days?: number;
}

export const ChurnTaskCompletionCard = memo(({ className, days = 30 }: Props) => {
  const { data, isLoading } = useChurnTaskCompletion(days);

  const rate = data?.completionRate ?? 0;
  const rateTone =
    rate >= 80
      ? 'text-emerald-500'
      : rate >= 50
      ? 'text-amber-500'
      : 'text-destructive';

  return (
    <Card className={cn('border-border/60', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertOctagon className="h-4 w-4 text-destructive" />
          Tarefas de Churn — últimos {days} dias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : !data || data.total === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma tarefa gerada por alerta de churn no período.
          </p>
        ) : (
          <>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Taxa de conclusão
                </p>
                <p className={cn('text-3xl font-bold tabular-nums', rateTone)}>
                  {rate.toFixed(1)}%
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {data.completed}/{data.total}
              </Badge>
            </div>
            <Progress value={rate} className="h-2" />
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <MiniStat
                icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                label="Concluídas"
                value={data.completed}
              />
              <MiniStat
                icon={<Clock className="h-3.5 w-3.5 text-amber-500" />}
                label="Pendentes"
                value={data.pending}
              />
              <MiniStat
                icon={<TimerOff className="h-3.5 w-3.5 text-destructive" />}
                label="Atrasadas"
                value={data.overdue}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});

ChurnTaskCompletionCard.displayName = 'ChurnTaskCompletionCard';

const MiniStat = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) => (
  <div className="rounded-md border border-border/50 bg-muted/30 p-2">
    <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
      {icon}
      {label}
    </div>
    <p className="text-lg font-semibold tabular-nums">{value}</p>
  </div>
);
