import { useQuery } from "@tanstack/react-query";
import { Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CronRun {
  jobid: number;
  jobname: string | null;
  status: string;
  return_message: string | null;
  start_time: string;
  end_time: string | null;
  duration_ms: number | null;
}

async function fetchCronStats(): Promise<CronRun[]> {
  const { data, error } = await supabase.rpc("admin_get_cron_job_stats", { _limit: 50 });
  if (error) throw error;
  return (data ?? []) as CronRun[];
}

function StatusBadge({ status }: { status: string }) {
  const ok = status === "succeeded";
  return (
    <Badge variant={ok ? "outline" : "destructive"} className="gap-1">
      {ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {status}
    </Badge>
  );
}

export function CronJobsPanel() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "cron-job-stats"],
    queryFn: fetchCronStats,
    staleTime: 30_000,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Jobs Agendados (pg_cron)</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Últimas 50 execuções — retenção diária, reset de estatísticas etc.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
          Atualizar
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px]">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Carregando histórico…</div>
          ) : !data || data.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              Nenhuma execução registrada ainda. Os jobs rodam nos horários agendados
              (ex.: retenção diária às 03:30 UTC).
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {data.map((r, i) => (
                <li
                  key={`${r.jobid}-${r.start_time}-${i}`}
                  className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {r.jobname ?? `job#${r.jobid}`}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>
                    {r.return_message ? (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {r.return_message}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(r.start_time), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>
                    <div className="text-[10px] text-muted-foreground/70 tabular-nums">
                      {r.duration_ms != null ? `${r.duration_ms} ms` : "—"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
