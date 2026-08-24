import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Inbox, CheckCircle2, XCircle, Copy, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";

type LogRow = {
  id: string;
  correlation_key: string | null;
  event: string | null;
  status: string;
  http_status: number;
  error_message: string | null;
  external_quote_id: string | null;
  quote_id: string | null;
  payload: unknown;
  received_at: string;
};

const SUCCESS_STATUSES = new Set(["created", "updated"]);
const DUPE_STATUSES = new Set(["duplicate_ignored"]);

function statusMeta(status: string, http: number) {
  if (SUCCESS_STATUSES.has(status)) {
    return {
      icon: <CheckCircle2 className="h-4 w-4 text-success" />,
      cls: "bg-success/10 text-success border-success/20",
      label: status,
    };
  }
  if (DUPE_STATUSES.has(status)) {
    return {
      icon: <Copy className="h-4 w-4 text-muted-foreground" />,
      cls: "bg-muted text-muted-foreground",
      label: "duplicate ignored",
    };
  }
  return {
    icon: <XCircle className="h-4 w-4 text-destructive" />,
    cls: "bg-destructive/10 text-destructive border-destructive/20",
    label: `${status} · ${http}`,
  };
}

function AdminQuoteSyncInboundContent() {
  const { data = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["quote-sync-inbound-log"],
    queryFn: async (): Promise<LogRow[]> => {
      const { data, error } = await supabase
        .from("quote_sync_inbound_log" as never)
        .select("*")
        .order("received_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as LogRow[];
    },
    refetchInterval: 30000,
  });

  const counts = data.reduce(
    (acc, r) => {
      if (SUCCESS_STATUSES.has(r.status)) acc.ok += 1;
      else if (DUPE_STATUSES.has(r.status)) acc.dupe += 1;
      else acc.err += 1;
      return acc;
    },
    { ok: 0, dupe: 0, err: 0 },
  );

  return (
    <>
      <Helmet>
        <title>Sync V4 Inbound | Promo Champions</title>
        <meta
          name="description"
          content="Últimos eventos recebidos em /receive-quote-sync, incluindo duplicatas e falhas."
        />
      </Helmet>
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Inbox className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-page-title gradient-text">Sync V4 · Inbound</h1>
              <p className="text-muted-foreground mt-1">
                Últimos 100 eventos recebidos em <code>/receive-quote-sync</code>.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Processados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-success">{counts.ok}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Duplicatas ignoradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{counts.dupe}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Falhas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-destructive">{counts.err}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="space-y-4">
          <TabsList>
            <TabsTrigger value="events">Eventos recentes</TabsTrigger>
            <TabsTrigger value="mirror">Espelho PromoGifts</TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle className="text-section-title">Últimos 100 eventos</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-sm text-muted-foreground py-4 text-center">Carregando…</div>
                ) : data.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-8 text-center">
                    Nenhum evento recebido ainda.
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2 pr-2">
                      {data.map((row) => {
                        const meta = statusMeta(row.status, row.http_status);
                        return (
                          <div
                            key={row.id}
                            className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                          >
                            <div className="mt-0.5">{meta.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className={`text-xs ${meta.cls}`}>
                                  {meta.label}
                                </Badge>
                                {row.event && (
                                  <span className="text-xs font-mono text-foreground">
                                    {row.event}
                                  </span>
                                )}
                                {row.external_quote_id && (
                                  <span className="text-xs text-muted-foreground">
                                    quote: <code>{row.external_quote_id}</code>
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {format(new Date(row.received_at), "dd/MM/yyyy HH:mm:ss", {
                                    locale: ptBR,
                                  })}
                                </span>
                              </div>
                              {row.correlation_key && (
                                <div className="text-[11px] text-muted-foreground mt-1 truncate">
                                  corr: <code>{row.correlation_key}</code>
                                </div>
                              )}
                              {row.error_message && (
                                <p className="text-xs text-destructive mt-1">
                                  {row.error_message}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mirror">
            <QuotesInboundTable />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

type MirrorRow = {
  id: string;
  quote_id: string;
  quote_number: string | null;
  status: string | null;
  client_name: string | null;
  total: number | null;
  seller_email: string | null;
  source: string;
  last_event: string | null;
  received_at: string;
};

function QuotesInboundTable() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["quotes-inbound-mirror"],
    queryFn: async (): Promise<MirrorRow[]> => {
      const { data, error } = await supabase
        .from("quotes_inbound" as never)
        .select("id, quote_id, quote_number, status, client_name, total, seller_email, source, last_event, received_at")
        .order("received_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as MirrorRow[];
    },
    refetchInterval: 30000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-section-title">Últimos 100 orçamentos espelhados</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground py-4 text-center">Carregando…</div>
        ) : data.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            Nenhum orçamento recebido do PromoGifts ainda.
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-2 pr-2">
              {data.map((row) => (
                <div key={row.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        {row.quote_number ?? row.quote_id.slice(0, 8)}
                      </span>
                      {row.status && (
                        <Badge variant="outline" className="text-xs">
                          {row.status}
                        </Badge>
                      )}
                      {row.last_event && (
                        <span className="text-xs font-mono text-muted-foreground">
                          {row.last_event}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {format(new Date(row.received_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                      {row.client_name && <span>Cliente: {row.client_name}</span>}
                      {row.total != null && (
                        <span>
                          Total: {row.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                      )}
                      {row.seller_email && <span>Vendedor: {row.seller_email}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminQuoteSyncInboundPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <PageTransition>
        <AdminQuoteSyncInboundContent />
      </PageTransition>
    </ProtectedRoute>
  );
}
