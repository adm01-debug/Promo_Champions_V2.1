import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Alert {
  id: string;
  query_preview: string;
  mean_exec_ms: number;
  max_exec_ms: number;
  calls: number;
  detection_count: number;
  first_detected_at: string;
  last_detected_at: string;
}

export function SlowQueryAlertsPanel() {
  const qc = useQueryClient();

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ['slow-query-alerts'],
    queryFn: async (): Promise<Alert[]> => {
      const { data, error } = await supabase
        .from('slow_query_alerts' as never)
        .select(
          'id, query_preview, mean_exec_ms, max_exec_ms, calls, detection_count, first_detected_at, last_detected_at'
        )
        .is('acknowledged_at', null)
        .order('mean_exec_ms', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as Alert[];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const ackMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('slow_query_alerts' as never)
        .update({
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: u.user?.id ?? null,
        } as never)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Alerta reconhecido');
      qc.invalidateQueries({ queryKey: ['slow-query-alerts'] });
    },
    onError: (e: Error) => toast.error(`Falha: ${e.message}`),
  });

  const count = data?.length ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle
              className={`h-4 w-4 ${count > 0 ? 'text-warning' : 'text-muted-foreground'}`}
            />
            Alertas de queries lentas
            {count > 0 && (
              <Badge variant="destructive" className="ml-1">
                {count}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-xs">
            Detector horário · threshold: média ≥ 500ms com ≥ 100 chamadas
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Atualizar"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">Erro: {(error as Error).message}</p>
        ) : count === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Check className="h-4 w-4 text-success" />
            Nenhuma query lenta pendente.
          </div>
        ) : (
          <ul className="space-y-2">
            {data!.map(a => (
              <li key={a.id} className="rounded-lg border bg-card/40 p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <code className="block text-xs font-mono break-all line-clamp-2 text-foreground/90">
                      {a.query_preview}
                    </code>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="text-destructive font-mono font-semibold">
                        média {a.mean_exec_ms.toFixed(1)}ms
                      </span>
                      <span className="font-mono">máx {a.max_exec_ms.toFixed(0)}ms</span>
                      <span className="font-mono">
                        {new Intl.NumberFormat('pt-BR').format(a.calls)} calls
                      </span>
                      <span>
                        detectada{' '}
                        {formatDistanceToNow(new Date(a.first_detected_at), {
                          locale: ptBR,
                          addSuffix: true,
                        })}
                      </span>
                      {a.detection_count > 1 && (
                        <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                          {a.detection_count}× reincidente
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => ackMutation.mutate(a.id)}
                    disabled={ackMutation.isPending}
                    className="shrink-0"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Reconhecer
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
