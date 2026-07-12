import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Activity, RefreshCw, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TopQuery {
  query: string;
  calls: number;
  total_exec_ms: number;
  mean_exec_ms: number;
  max_exec_ms: number;
  rows_returned: number;
  hit_ratio: number | null;
}

const fmt = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}s` : `${n.toFixed(1)}ms`;

const fmtNum = (n: number) => new Intl.NumberFormat("pt-BR").format(n);

export function TopQueriesPanel() {
  const qc = useQueryClient();
  const [limit] = useState(15);

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["admin-top-queries", limit],
    queryFn: async (): Promise<TopQuery[]> => {
      const { data, error } = await supabase.rpc("admin_top_queries" as never, {
        _limit: limit,
      } as never);
      if (error) throw error;
      return (data ?? []) as TopQuery[];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("admin_reset_query_stats" as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Estatísticas de queries reiniciadas");
      qc.invalidateQueries({ queryKey: ["admin-top-queries"] });
    },
    onError: (e: Error) => toast.error(`Falha ao reiniciar: ${e.message}`),
  });

  const totalTime = data?.reduce((acc, q) => acc + q.total_exec_ms, 0) ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" />
            Top {limit} queries por custo
          </CardTitle>
          <CardDescription className="text-xs">
            Consultas mais caras desde o último reset · fonte: pg_stat_statements
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" className="font-mono text-xs">
            Σ {fmt(totalTime)}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Atualizar"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Reiniciar contadores de pg_stat_statements? Métricas históricas serão perdidas.")) {
                resetMutation.mutate();
              }
            }}
            disabled={resetMutation.isPending}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">
            Erro ao carregar métricas: {(error as Error).message}
          </p>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Nenhuma query registrada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[45%]">Query</TableHead>
                  <TableHead className="text-right">Chamadas</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Média</TableHead>
                  <TableHead className="text-right">Máx</TableHead>
                  <TableHead className="text-right">Cache hit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((q, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs max-w-md">
                      <div className="truncate" title={q.query}>
                        {q.query}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {fmtNum(q.calls)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {fmt(q.total_exec_ms)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      <span
                        className={
                          q.mean_exec_ms > 100
                            ? "text-destructive"
                            : q.mean_exec_ms > 20
                              ? "text-warning"
                              : ""
                        }
                      >
                        {q.mean_exec_ms.toFixed(2)}ms
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {q.max_exec_ms.toFixed(1)}ms
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {q.hit_ratio !== null ? (
                        <span
                          className={
                            q.hit_ratio < 90
                              ? "text-warning"
                              : "text-muted-foreground"
                          }
                        >
                          {q.hit_ratio}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
