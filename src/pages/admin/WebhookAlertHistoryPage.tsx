import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  ArrowLeft,
  BellOff,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  RefreshCw,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useWebhookSubscriptions } from "@/hooks/win-loss/useWebhookSubscriptions";
import {
  useWebhookAlertHistory,
  type AlertHistoryFilters,
} from "@/hooks/win-loss/useWebhookAlertHistory";
import type { WebhookAlertKind } from "@/hooks/win-loss/useWebhookAlerts";
import { cn } from "@/lib/utils";

const KIND_OPTIONS: Array<{ value: WebhookAlertKind | "all"; label: string }> = [
  { value: "all", label: "Todos os tipos" },
  { value: "consecutive_failures", label: "Falhas consecutivas" },
  { value: "high_retry_rate", label: "Taxa de retry alta" },
  { value: "attempts_exhausted", label: "Tentativas 1–3 esgotadas" },
];

const STATUS_OPTIONS: Array<{ value: "all" | "fired" | "suppressed"; label: string }> = [
  { value: "all", label: "Disparado e suprimido" },
  { value: "fired", label: "Apenas disparados" },
  { value: "suppressed", label: "Apenas suprimidos" },
];

const WINDOW_OPTIONS: Array<{ value: string; label: string; hours: number }> = [
  { value: "24h", label: "Últimas 24h", hours: 24 },
  { value: "7d", label: "Últimos 7 dias", hours: 24 * 7 },
  { value: "30d", label: "Últimos 30 dias", hours: 24 * 30 },
];

function kindLabel(k: WebhookAlertKind): string {
  return KIND_OPTIONS.find((o) => o.value === k)?.label ?? k;
}

function shortId(id: string | null): string {
  if (!id) return "—";
  return `${id.slice(0, 8)}…`;
}

export default function WebhookAlertHistoryPage() {
  const [subscriptionId, setSubscriptionId] = useState<string>("all");
  const [kind, setKind] = useState<WebhookAlertKind | "all">("all");
  const [status, setStatus] = useState<"all" | "fired" | "suppressed">("all");
  const [windowKey, setWindowKey] = useState<string>("7d");

  const { list: subsQuery } = useWebhookSubscriptions();

  const filters = useMemo<AlertHistoryFilters>(() => {
    const hours = WINDOW_OPTIONS.find((w) => w.value === windowKey)?.hours ?? 24 * 7;
    return {
      subscriptionId: subscriptionId === "all" ? null : subscriptionId,
      kind: kind === "all" ? null : kind,
      status,
      since: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
      limit: 300,
    };
  }, [subscriptionId, kind, status, windowKey]);

  const history = useWebhookAlertHistory(filters);

  const totals = useMemo(() => {
    const items = history.data ?? [];
    return {
      total: items.length,
      fired: items.filter((i) => !i.suppressed).length,
      suppressed: items.filter((i) => i.suppressed).length,
    };
  }, [history.data]);

  return (
    <>
      <Helmet>
        <title>Histórico de Alertas de Webhooks | Promo Champions</title>
        <meta
          name="description"
          content="Auditoria de alertas de webhooks Win/Loss com filtros por subscription, tipo e status (disparado/suprimido)."
        />
      </Helmet>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="h-8 -ml-2">
                <Link to="/admin">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Admin
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-display font-bold gradient-text">
              Histórico de Alertas de Webhooks
            </h1>
            <p className="text-muted-foreground">
              Auditoria completa: cada disparo (e cada supressão) ficou registrado para investigação.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => history.refetch()}
            className="gap-2"
            disabled={history.isFetching}
          >
            <RefreshCw className={cn("h-4 w-4", history.isFetching && "animate-spin")} />
            Atualizar
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4 text-primary" />
              Filtros
            </CardTitle>
            <CardDescription>
              Refine por assinatura, tipo de alerta, status e janela de tempo.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Assinatura</label>
              <Select value={subscriptionId} onValueChange={setSubscriptionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as assinaturas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as assinaturas</SelectItem>
                  {(subsQuery.data ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="truncate max-w-[260px] inline-block align-middle">
                        {s.url}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Tipo de alerta</label>
              <Select value={kind} onValueChange={(v) => setKind(v as WebhookAlertKind | "all")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KIND_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as "all" | "fired" | "suppressed")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Período</label>
              <Select value={windowKey} onValueChange={setWindowKey}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WINDOW_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid gap-3 md:grid-cols-3">
          <SummaryStat
            label="Eventos no período"
            value={totals.total}
            icon={<Clock className="h-4 w-4 text-primary" />}
          />
          <SummaryStat
            label="Alertas disparados"
            value={totals.fired}
            tone="warning"
            icon={<AlertTriangle className="h-4 w-4 text-warning" />}
          />
          <SummaryStat
            label="Suprimidos (anti-spam)"
            value={totals.suppressed}
            tone="muted"
            icon={<BellOff className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        {/* List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Linha do tempo</CardTitle>
            <CardDescription>
              Mais recentes primeiro. Clique em "Timeline" para correlacionar com as entregas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : history.isError ? (
              <p className="text-sm text-destructive">
                Falha ao carregar histórico:{" "}
                {history.error instanceof Error ? history.error.message : "erro desconhecido"}
              </p>
            ) : (history.data ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle2 className="h-10 w-10 text-success/60 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhum alerta nesse filtro. Sistema em dia. 🎉
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[640px] pr-2">
                <ul className="space-y-2">
                  {(history.data ?? []).map((row) => (
                    <li
                      key={row.id}
                      className={cn(
                        "rounded-lg border p-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between",
                        row.suppressed
                          ? "bg-muted/40 border-border/40"
                          : "bg-warning/5 border-warning/20",
                      )}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={row.suppressed ? "secondary" : "destructive"}
                            className="text-[10px]"
                          >
                            {row.suppressed ? "Suprimido" : "Disparado"}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {kindLabel(row.kind)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(row.fired_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70">
                            {new Date(row.fired_at).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <p className="text-sm truncate">
                          <span className="text-muted-foreground">URL:</span>{" "}
                          <span className="font-medium">{row.subscription_url ?? "—"}</span>
                        </p>
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                          <span>
                            sub: <code className="font-mono">{shortId(row.subscription_id)}</code>
                          </span>
                          <span>
                            req: <code className="font-mono">{shortId(row.request_id)}</code>
                          </span>
                          {row.suppressed && row.suppress_reason && (
                            <span>motivo: {row.suppress_reason}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {row.request_id ? (
                          <Button asChild variant="outline" size="sm" className="gap-1">
                            <Link
                              to={`/admin/webhooks-timeline?requestId=${row.request_id}`}
                              aria-label="Ver timeline correlacionada"
                            >
                              Timeline
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </Button>
                        ) : (
                          <Button asChild variant="ghost" size="sm" className="gap-1">
                            <Link
                              to={`/admin/webhooks-timeline?subscriptionId=${row.subscription_id}`}
                            >
                              Ver assinatura
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function SummaryStat({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone?: "default" | "warning" | "muted";
}) {
  return (
    <Card
      className={cn(
        "border",
        tone === "warning" && "bg-warning/5 border-warning/20",
        tone === "muted" && "bg-muted/40",
      )}
    >
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-md bg-background/60 border border-border/40">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-display font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
