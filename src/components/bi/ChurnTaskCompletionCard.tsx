import { memo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertOctagon, CheckCircle2, Clock, TimerOff, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChurnTaskCompletion } from '@/hooks/bi/useChurnTaskCompletion';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  days?: number;
}

interface SalespersonOption {
  id: string;
  name: string;
}

export const ChurnTaskCompletionCard = memo(({ className, days = 30 }: Props) => {
  const [salespersonId, setSalespersonId] = useState<string>('all');
  const navigate = useNavigate();
  const { data, isLoading } = useChurnTaskCompletion(
    days,
    salespersonId === 'all' ? null : salespersonId,
  );

  const { data: sellers } = useQuery<SalespersonOption[]>({
    queryKey: ['bi', 'salespeople-for-churn-widget'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salespeople')
        .select('id,name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return (data ?? []) as SalespersonOption[];
    },
    staleTime: 5 * 60_000,
  });

  const rate = data?.completionRate ?? 0;
  const rateTone =
    rate >= 80 ? 'text-emerald-500' : rate >= 50 ? 'text-amber-500' : 'text-destructive';

  const goToOverdue = () => {
    const params = new URLSearchParams({ churn: '1', status: 'overdue' });
    if (salespersonId !== 'all') params.set('salesperson_id', salespersonId);
    navigate(`/tarefas?${params.toString()}`);
  };

  return (
    <Card className={cn('border-border/60', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertOctagon className="h-4 w-4 text-destructive" />
            Tarefas de Churn — últimos {days} dias
          </CardTitle>
          <Select value={salespersonId} onValueChange={setSalespersonId}>
            <SelectTrigger className="h-8 w-[180px] text-xs">
              <SelectValue placeholder="Vendedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os vendedores</SelectItem>
              {sellers?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
            {data.overdue > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={goToOverdue}
                className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                Ver {data.overdue} tarefa{data.overdue > 1 ? 's' : ''} atrasada
                {data.overdue > 1 ? 's' : ''}
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            )}
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
