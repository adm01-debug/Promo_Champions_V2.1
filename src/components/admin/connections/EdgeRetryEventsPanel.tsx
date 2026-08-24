import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, RefreshCw, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EdgeRetryTimeSeriesChart } from "./EdgeRetryTimeSeriesChart";

type Outcome = "retry" | "success_after_retry" | "exhausted" | "non_retryable";

interface RetryRow {
  id: string;
  function_name: string;
  operation: string;
  attempt: number;
  total_attempts: number | null;
  outcome: Outcome;
  status_code: number | null;
  error_name: string | null;
  error_message: string | null;
  delay_ms: number | null;
  request_id: string | null;
  created_at: string;
}

const outcomeVariant: Record<Outcome, "default" | "destructive" | "secondary" | "outline"> = {
  retry: "secondary",
  success_after_retry: "default",
  exhausted: "destructive",
  non_retryable: "outline",
};

const outcomeLabel: Record<Outcome, string> = {
  retry: "Retry",
  success_after_retry: "Sucesso após retry",
  exhausted: "Esgotado",
  non_retryable: "Não-retriável",
};

async function fetchRetryEvents(fnFilter: string): Promise<RetryRow[]> {
  let query = supabase
    .from("edge_retry_events" as never)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (fnFilter.trim()) {
    query = query.ilike("function_name", `%${fnFilter.trim()}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as RetryRow[];
}

export function EdgeRetryEventsPanel() {
  const [fnFilter, setFnFilter] = useState("");
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "edge-retry-events", fnFilter],
    queryFn: () => fetchRetryEvents(fnFilter),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const stats = useMemo(() => {
    if (!data) return { total: 0, exhausted24h: 0, success24h: 0 };
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const recent = data.filter((r) => new Date(r.created_at).getTime() >= cutoff);
    return {
      total: data.length,
      exhausted24h: recent.filter((r) => r.outcome === "exhausted").length,
      success24h: recent.filter((r) => r.outcome === "success_after_retry").length,
    };
  }, [data]);

  return (
    <Card className="border-border/40">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" aria-hidden />
          <CardTitle className="text-base">Retries de Edge Functions</CardTitle>
          <Badge variant="outline" className="ml-2">
            {stats.total} eventos
          </Badge>
          {stats.exhausted24h > 0 && (
            <Badge variant="destructive" title="Falhas exauridas nas últimas 24h">
              {stats.exhausted24h} exaustos 24h
            </Badge>
          )}
          {stats.success24h > 0 && (
            <Badge variant="secondary" title="Retries que recuperaram nas últimas 24h">
              {stats.success24h} recuperados 24h
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Atualizar eventos de retry"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          <Input
            value={fnFilter}
            onChange={(e) => setFnFilter(e.target.value)}
            placeholder="Filtrar por função (ex.: forecast-narrative)"
            className="pl-7 h-8"
            aria-label="Filtrar por nome da função"
          />
        </div>

        <div className="rounded-md border border-border/40 bg-card/20 p-2">
          <p className="text-[11px] text-muted-foreground mb-1 px-1">
            Distribuição por hora (últimas 24h)
          </p>
          <EdgeRetryTimeSeriesChart rows={data} />
        </div>


        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">Erro ao carregar eventos: {(error as Error).message}</p>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum evento de retry registrado.</p>
        ) : (
          <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {data.map((row) => (
              <li
                key={row.id}
                className="rounded-md border border-border/40 bg-card/40 p-3 text-xs space-y-1"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={outcomeVariant[row.outcome]}>{outcomeLabel[row.outcome]}</Badge>
                    <span className="font-medium text-foreground">{row.function_name}</span>
                    <span className="text-muted-foreground">· {row.operation}</span>
                    <span className="text-muted-foreground">
                      · tentativa {row.attempt}
                      {row.total_attempts ? `/${row.total_attempts}` : ""}
                    </span>
                    {row.status_code != null && (
                      <Badge variant="outline">HTTP {row.status_code}</Badge>
                    )}
                    {row.delay_ms != null && row.outcome === "retry" && (
                      <span className="text-muted-foreground">· aguardou {row.delay_ms}ms</span>
                    )}
                  </div>
                  <span className="text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(row.created_at), { locale: ptBR, addSuffix: true })}
                  </span>
                </div>
                {(row.error_name || row.error_message) && (
                  <p className="text-muted-foreground break-words">
                    <span className="font-medium text-foreground">{row.error_name ?? "erro"}:</span>{" "}
                    {row.error_message ?? "—"}
                  </p>
                )}
                {row.request_id && (
                  <p className="text-muted-foreground font-mono text-[10px]">req: {row.request_id}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
