import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, AlertTriangle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageTransition } from "@/components/transitions/PageTransition";
import { WebhookDeadLetterPanel } from "@/components/win-loss/WebhookDeadLetterPanel";
import { useWebhookSubscriptions } from "@/hooks/win-loss/useWebhookSubscriptions";
import { useDeadLettersCounts } from "@/hooks/win-loss/useDeadLettersCounts";
import { useQueryClient } from "@tanstack/react-query";

type DateRange = "all" | "24h" | "7d" | "30d";

function StatusStat({ label, value, tone }: { label: string; value: number; tone: "warn" | "muted" | "ok" }) {
  const toneClass =
    tone === "warn"
      ? "text-destructive"
      : tone === "ok"
      ? "text-success"
      : "text-muted-foreground";
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${toneClass}`}>{value}</p>
    </div>
  );
}

function WebhooksDeadLettersAdminContent() {
  const qc = useQueryClient();
  const { list: subsList } = useWebhookSubscriptions();
  const { data: counts } = useDeadLettersCounts();

  const [filterText, setFilterText] = useState("");
  const [filterSubscriptionId, setFilterSubscriptionId] = useState<string>("all");
  const [filterEvent, setFilterEvent] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");

  const subscriptions = subsList.data ?? [];
  const eventOptions = useMemo(() => {
    const set = new Set<string>();
    subscriptions.forEach((s) => s.events?.forEach((e) => set.add(e)));
    return Array.from(set).sort();
  }, [subscriptions]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["winloss-dead-letters"] });
  };

  return (
    <>
      <Helmet>
        <title>Dead-Letters de Webhooks | Admin · Promo Champions</title>
        <meta
          name="description"
          content="Gerencie e reprocesse webhooks com falha persistente: filtros por status, assinatura e evento, ações em lote."
        />
      </Helmet>

      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="-ml-2 h-8">
                <Link to="/admin">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-display font-bold gradient-text flex items-center gap-2">
              <AlertTriangle className="h-7 w-7 text-amber-500" aria-hidden />
              Dead-Letters de Webhooks
            </h1>
            <p className="text-muted-foreground text-sm">
              Webhooks que esgotaram retries. Filtre, inspecione o payload e reprocesse em lote.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatusStat label="Pendentes" value={counts?.pending ?? 0} tone="warn" />
          <StatusStat label="Em replay" value={counts?.replaying ?? 0} tone="muted" />
          <StatusStat label="Reprocessados" value={counts?.replayed ?? 0} tone="ok" />
          <StatusStat label="Arquivados" value={counts?.archived ?? 0} tone="muted" />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4" />
              Filtros
              {(filterText || filterSubscriptionId !== "all" || filterEvent !== "all" || dateRange !== "all") && (
                <Badge variant="secondary" className="text-[10px]">Ativos</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Input
                placeholder="Buscar evento, URL, request_id ou erro…"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                aria-label="Buscar dead-letters"
              />
            </div>
            <Select value={filterSubscriptionId} onValueChange={setFilterSubscriptionId}>
              <SelectTrigger aria-label="Filtrar por assinatura">
                <SelectValue placeholder="Assinatura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as assinaturas</SelectItem>
                {subscriptions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.url.length > 50 ? `${s.url.slice(0, 50)}…` : s.url}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Select value={filterEvent} onValueChange={setFilterEvent}>
                <SelectTrigger aria-label="Filtrar por evento">
                  <SelectValue placeholder="Evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos eventos</SelectItem>
                  {eventOptions.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                <SelectTrigger aria-label="Filtrar por período">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tudo</SelectItem>
                  <SelectItem value="24h">Últimas 24h</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <WebhookDeadLetterPanel
          fullWidth
          filterText={filterText}
          filterSubscriptionId={filterSubscriptionId === "all" ? undefined : filterSubscriptionId}
          filterEvent={filterEvent === "all" ? undefined : filterEvent}
          dateRange={dateRange}
        />
      </div>
    </>
  );
}

export default function WebhooksDeadLettersAdmin() {
  return (
    <ProtectedRoute requireAdminOrManager>
      <PageTransition>
        <WebhooksDeadLettersAdminContent />
      </PageTransition>
    </ProtectedRoute>
  );
}
