import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Database,
  Activity,
  Server,
  CheckCircle2,
  XCircle,
  BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminSystemStatusProps {
  edgeStatus:
    | {
        bitrixLastSync: { status: string; created_at: string } | null;
        openCircuits: Array<{ circuit_name: string }>;
      }
    | undefined;
  queryMetrics: {
    totalQueries: number;
    avgDuration: number;
    slowQueries: number;
  };
}

interface CronJobStatus {
  jobid: number;
  jobname: string;
  schedule: string;
  active: boolean;
  function_name: string | null;
  last_status: string | null;
  last_run_at: string | null;
  last_return_code: number | null;
  run_count: number;
}

function cronJobStatus(j: CronJobStatus): 'ok' | 'erro' | 'pendente' | 'inativo' {
  if (!j.active) return 'inativo';
  if (!j.last_status) return 'pendente';
  if (j.last_status === 'succeeded' && (j.last_return_code === null || j.last_return_code < 400))
    return 'ok';
  return 'erro';
}

export function AdminSystemStatus({ edgeStatus, queryMetrics }: AdminSystemStatusProps) {
  const { data: cronJobs } = useQuery({
    queryKey: ['admin-edge-cron-status'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        'admin_edge_cron_status' as never,
      );
      if (error) throw error;
      return (data ?? []) as CronJobStatus[];
    },
    refetchInterval: 60_000,
    retry: 1,
  });

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-section-title flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-chart-3/20 to-chart-3/5">
            <Server className="h-4 w-4 text-chart-3" />
          </div>
          Status do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Edge Functions
          </h4>
          {cronJobs && cronJobs.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {cronJobs.map(job => {
                const status = cronJobStatus(job);
                return (
                  <div
                    key={job.jobname}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/30"
                  >
                    {status === 'ok' && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success flex-shrink-0" />
                    )}
                    {status === 'erro' && (
                      <XCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                    )}
                    {(status === 'pendente' || status === 'inativo') && (
                      <Activity className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {job.function_name ?? job.jobname}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {job.schedule}
                        {job.last_run_at
                          ? ` · ${format(new Date(job.last_run_at), 'dd/MM HH:mm', { locale: ptBR })}`
                          : ' · sem execuções'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Nenhum job de edge function agendado encontrado.
            </p>
          )}
        </div>

        <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Bitrix24 Sync</span>
            </div>
            {edgeStatus?.bitrixLastSync ? (
              <Badge
                variant={
                  edgeStatus.bitrixLastSync.status === 'success'
                    ? 'default'
                    : 'destructive'
                }
              >
                {edgeStatus.bitrixLastSync.status === 'success' ? 'OK' : 'Erro'}
              </Badge>
            ) : (
              <Badge variant="secondary">Sem dados</Badge>
            )}
          </div>
          {edgeStatus?.bitrixLastSync && (
            <p className="text-xs text-muted-foreground mt-2">
              Última sync:{' '}
              {format(new Date(edgeStatus.bitrixLastSync.created_at), 'dd/MM HH:mm', {
                locale: ptBR,
              })}
            </p>
          )}
        </div>

        <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-chart-4" />
              <span className="text-sm font-medium">Circuit Breakers</span>
            </div>
            {edgeStatus?.openCircuits?.length === 0 ? (
              <Badge
                variant="default"
                className="bg-success/20 text-success border-success/30"
              >
                Todos fechados
              </Badge>
            ) : (
              <Badge variant="destructive">
                {edgeStatus?.openCircuits?.length} aberto(s)
              </Badge>
            )}
          </div>
          {edgeStatus?.openCircuits && edgeStatus.openCircuits.length > 0 && (
            <div className="space-y-1">
              {edgeStatus.openCircuits.map((circuit, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs text-destructive">
                  <XCircle className="h-3 w-3" />
                  {circuit.circuit_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-chart-5" />
              <span className="text-sm font-medium">Performance Queries</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold">{queryMetrics.totalQueries}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </div>
            <div>
              <p className="text-lg font-bold">{queryMetrics.avgDuration}ms</p>
              <p className="text-[10px] text-muted-foreground">Média</p>
            </div>
            <div>
              <p className="text-lg font-bold text-warning">{queryMetrics.slowQueries}</p>
              <p className="text-[10px] text-muted-foreground">Lentas</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
