import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Search,
  Skull,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useWebhookTimeline,
  type TimelineItem,
  type TimelineSource,
} from "@/hooks/win-loss/useWebhookTimeline";
import { cn } from "@/lib/utils";

const SOURCE_LABEL: Record<TimelineSource, string> = {
  delivery: "Entrega",
  dead_letter: "Dead-letter",
  alert: "Alerta",
};

function SourceIcon({ item }: { item: TimelineItem }) {
  if (item.source === "dead_letter") return <Skull className="h-4 w-4 text-destructive" aria-hidden />;
  if (item.source === "alert") return <AlertCircle className="h-4 w-4 text-warning" aria-hidden />;
  if (item.succeeded) return <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />;
  return <XCircle className="h-4 w-4 text-destructive" aria-hidden />;
}

function statusToneClass(status: number | null): string {
  if (status === null) return "text-muted-foreground";
  if (status >= 500 || status === 0) return "text-destructive";
  if (status >= 400) return "text-warning";
  if (status >= 200 && status < 300) return "text-success";
  return "text-muted-foreground";
}

export default function WebhookTimelinePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requestIdInput, setRequestIdInput] = useState(searchParams.get("requestId") ?? "");
  const [subIdInput, setSubIdInput] = useState(searchParams.get("subscriptionId") ?? "");

  const filters = useMemo(
    () => ({
      requestId: searchParams.get("requestId") ?? null,
      subscriptionId: searchParams.get("subscriptionId") ?? null,
    }),
    [searchParams],
  );

  const { data, isLoading, isFetching, error } = useWebhookTimeline(filters);

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (requestIdInput.trim()) next.set("requestId", requestIdInput.trim());
    if (subIdInput.trim()) next.set("subscriptionId", subIdInput.trim());
    setSearchParams(next, { replace: true });
  };

  const items = data?.items ?? [];
  const hasFilter = !!(filters.requestId || filters.subscriptionId);

  return (
    <>
      <Helmet>
        <title>Timeline de webhooks · Win/Loss</title>
        <meta
          name="description"
          content="Linha do tempo correlacionada de entregas, dead-letters e alertas de webhooks por requestId e subscription."
        />
      </Helmet>

      <div className="container mx-auto p-4 md:p-6 space-y-4 max-w-5xl">
        <header className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" aria-hidden />
          <h1 className="text-page-title">Timeline de webhooks</h1>
        </header>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Correlação por requestId / subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={apply} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <div className="space-y-1">
                <Label htmlFor="rid" className="text-xs text-muted-foreground">
                  Request ID (UUID)
                </Label>
                <Input
                  id="rid"
                  value={requestIdInput}
                  onChange={(e) => setRequestIdInput(e.target.value)}
                  placeholder="ex: 771bdc95-e50b-476b-af27-528d7c7d910f"
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sid" className="text-xs text-muted-foreground">
                  Subscription ID (UUID)
                </Label>
                <Input
                  id="sid"
                  value={subIdInput}
                  onChange={(e) => setSubIdInput(e.target.value)}
                  placeholder="opcional"
                  className="font-mono text-xs"
                />
              </div>
              <Button type="submit" className="gap-1.5">
                <Search className="h-4 w-4" aria-hidden />
                Buscar
              </Button>
            </form>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Informe pelo menos um dos campos. Janela padrão: últimos 7 dias.
            </p>
          </CardContent>
        </Card>

        {!hasFilter ? (
          <Alert>
            <AlertDescription>
              Informe um requestId e/ou subscriptionId acima para carregar a timeline.
            </AlertDescription>
          </Alert>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>
              Falha ao carregar a timeline:{" "}
              {error instanceof Error ? error.message : "erro desconhecido"}.
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nenhum evento encontrado para os filtros selecionados.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">
                {items.length} evento{items.length === 1 ? "" : "s"}
              </CardTitle>
              {isFetching && <span className="text-xs text-muted-foreground">Atualizando…</span>}
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-border ml-3 space-y-3">
                {items.map((it) => (
                  <li key={`${it.source}:${it.ref_id}`} className="ml-4">
                    <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border bg-background flex items-center justify-center">
                      <SourceIcon item={it} />
                    </span>
                    <div className="rounded-md border bg-card p-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="outline" className="font-normal">
                          {SOURCE_LABEL[it.source]}
                        </Badge>
                        {it.event && (
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {it.event}
                          </span>
                        )}
                        {it.attempt !== null && (
                          <span className="text-muted-foreground">
                            tentativa {it.attempt}
                          </span>
                        )}
                        {it.status !== null && (
                          <span className={cn("font-semibold tabular-nums", statusToneClass(it.status))}>
                            {it.status === 0 ? "rede/timeout" : `HTTP ${it.status}`}
                          </span>
                        )}
                        {it.duration_ms !== null && (
                          <span className="text-muted-foreground tabular-nums">
                            {it.duration_ms}ms
                          </span>
                        )}
                        <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
                          {new Date(it.ts).toLocaleString()}
                        </span>
                      </div>
                      {it.message && (
                        <p className="mt-1.5 text-xs text-muted-foreground break-words">
                          {it.message}
                        </p>
                      )}
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-mono text-muted-foreground/80">
                        <span>sub: {it.subscription_id}</span>
                        {it.request_id && <span>req: {it.request_id}</span>}
                        <span>id: {it.ref_id}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
