import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, RefreshCw, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DlqRow {
  id: string;
  forecast_id: string;
  user_id: string | null;
  reason: string;
  http_status: number | null;
  error_detail: string | null;
  request_id: string | null;
  created_at: string;
}

const reasonVariant: Record<string, "destructive" | "secondary" | "outline"> = {
  rate_limited: "secondary",
  payment_required: "destructive",
  provider_error: "destructive",
  empty_narrative: "outline",
};

async function fetchDlq(reasonFilter: string): Promise<DlqRow[]> {
  let query = supabase
    .from("forecast_narrative_dead_letters" as never)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (reasonFilter.trim()) {
    query = query.ilike("reason", `%${reasonFilter.trim()}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as DlqRow[];
}

export function ForecastNarrativeDlqPanel() {
  const [reasonFilter, setReasonFilter] = useState("");
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "forecast-narrative-dlq", reasonFilter],
    queryFn: () => fetchDlq(reasonFilter),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const stats = useMemo(() => {
    if (!data) return { total: 0, last24h: 0 };
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return {
      total: data.length,
      last24h: data.filter((r) => new Date(r.created_at).getTime() >= cutoff).length,
    };
  }, [data]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Dead Letter Queue — Forecast Narrative
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Falhas persistidas do AI Gateway (rate-limit, 402, provider error, resposta vazia).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {stats.last24h} / 24h
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Recarregar"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filtrar por reason (rate_limited, provider_error...)"
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">Erro: {(error as Error).message}</p>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Nenhuma falha registrada ✅
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.map((row) => (
              <div
                key={row.id}
                className="border border-border/40 rounded-md p-3 text-xs space-y-1 bg-muted/20"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge variant={reasonVariant[row.reason] ?? "outline"}>{row.reason}</Badge>
                    {row.http_status && (
                      <Badge variant="outline" className="font-mono">
                        {row.http_status}
                      </Badge>
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(row.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground font-mono text-[10px]">
                  <span>forecast: {row.forecast_id.slice(0, 8)}…</span>
                  {row.request_id && <span>req: {row.request_id.slice(0, 12)}…</span>}
                </div>
                {row.error_detail && (
                  <p className="text-muted-foreground line-clamp-2 break-all">{row.error_detail}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
