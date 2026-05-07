import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Database, Plug, Webhook, Bot, Workflow, TestTube2, Loader2, History, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  useIntegrationHealth,
  useTestConnection,
  type IntegrationConnection,
} from "@/hooks/admin/useIntegrationConnections";
import { IntegrationHealthHistorySheet } from "./IntegrationHealthHistorySheet";
import { isHistoryOpenPersisted, setHistoryOpenPersisted } from "./historyOpenPersistence";

const KIND_ICON = {
  database: Database,
  bitrix24: Plug,
  n8n: Workflow,
  mcp: Bot,
  webhook: Webhook,
  other: Plug,
} as const;

const KIND_LABEL: Record<IntegrationConnection["kind"], string> = {
  database: "Banco",
  bitrix24: "Bitrix24",
  n8n: "n8n",
  mcp: "MCP",
  webhook: "Webhook",
  other: "Outro",
};

function truncate(s: string, n = 200) {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

const FAILING_REFETCH_MS = 15_000;
const HEALTHY_REFETCH_MS = 60_000;

export function IntegrationHealthCard({ connection }: { connection: IntegrationConnection }) {
  const [historyOpen, setHistoryOpenState] = useState<boolean>(() => isHistoryOpenPersisted(connection.id));
  const setHistoryOpen = (open: boolean) => {
    setHistoryOpenState(open);
    setHistoryOpenPersisted(connection.id, open);
  };
  useEffect(() => {
    const isPersisted = isHistoryOpenPersisted(connection.id);
    if (isPersisted !== historyOpen) {
      setHistoryOpenState(isPersisted);
    }
  }, [connection.id]);
  // First pass: no polling until we know status. Then adapt based on last check.
  const initial = useIntegrationHealth(connection.id, 10);
  const lastStatus = initial.data?.[0]?.status;
  const isFailing = connection.enabled && lastStatus && lastStatus !== "success";
  const refetchInterval: number | false = !connection.enabled
    ? false
    : isFailing
      ? FAILING_REFETCH_MS
      : HEALTHY_REFETCH_MS;
  const { data: checks = [] } = useIntegrationHealth(connection.id, 10, { refetchInterval });
  const test = useTestConnection();

  const Icon = KIND_ICON[connection.kind];
  const last = checks[0];

  const successRate = useMemo(() => {
    if (checks.length === 0) return null;
    const ok = checks.filter((c) => c.status === "success").length;
    return Math.round((ok / checks.length) * 100);
  }, [checks]);

  const statusBadge = (() => {
    if (!connection.enabled)
      return <Badge variant="warning" aria-label={`${connection.label}: integração desativada`}>Desativado</Badge>;
    if (!last)
      return <Badge variant="secondary" aria-label={`${connection.label}: ainda não testado`}>Não testado</Badge>;
    if (last.status === "success")
      return <Badge variant="success" aria-label={`${connection.label}: operacional`}>Operacional</Badge>;
    return <Badge variant="destructive" aria-label={`${connection.label}: com falha no último teste`}>Falhando</Badge>;
  })();

  const stop = (e: React.MouseEvent | React.KeyboardEvent) => e.stopPropagation();
  const openHistory = () => setHistoryOpen(true);

  return (
    <>
      <Card
        variant="glass"
        role="button"
        tabIndex={0}
        aria-label={`Abrir histórico de testes de ${connection.label}`}
        aria-busy={test.isPending}
        onClick={openHistory}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openHistory();
          }
        }}
        className="relative border-border/40 flex flex-col cursor-pointer transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {test.isPending && (
          <>
            <div className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-background/40 backdrop-blur-[1px] animate-in fade-in-0" />
            <div
              className="pointer-events-none absolute top-2 right-2 z-20 flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium"
              role="status"
              aria-live="polite"
              aria-label={`Testando conexão ${connection.label}`}
            >
              <Loader2 className="h-3 w-3 animate-spin text-primary" aria-hidden="true" />
              <span className="animate-pulse">Testando…</span>
            </div>
          </>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <div className="p-2 rounded-lg bg-muted/40 shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-semibold text-sm truncate">{connection.label}</h3>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-[10px]">{KIND_LABEL[connection.kind]}</Badge>
                  <Badge variant="secondary" className="text-[10px] uppercase">{connection.source}</Badge>
                </div>
              </div>
            </div>
            {statusBadge}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-md bg-muted/30 p-2 cursor-help transition-colors hover:bg-muted/50">
                    <div className="text-[10px] uppercase text-muted-foreground">Último teste</div>
                    <div className="text-xs font-medium mt-1 truncate">
                      {last ? formatDistanceToNow(new Date(last.checked_at), { addSuffix: true, locale: ptBR }) : "—"}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {last ? `Verificado em: ${new Date(last.checked_at).toLocaleString('pt-BR')}` : "Nenhum teste realizado"}
                  </p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-md bg-muted/30 p-2 cursor-help transition-colors hover:bg-muted/50">
                    <div className="text-[10px] uppercase text-muted-foreground">Latência</div>
                    <div className="text-xs font-medium mt-1">
                      {last?.latency_ms != null ? `${last.latency_ms}ms` : "—"}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Tempo de resposta da última requisição</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-md bg-muted/30 p-2 cursor-help transition-colors hover:bg-muted/50">
                    <div className="text-[10px] uppercase text-muted-foreground">Sucesso (10x)</div>
                    <div className="text-xs font-medium mt-1">{successRate != null ? `${successRate}%` : "—"}</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Taxa de sucesso baseada nas últimas 10 verificações</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {last && last.status !== "success" && last.error && (
            <Alert
              variant="destructive"
              className="py-2"
              onClick={stop}
              role="alert"
              aria-live="polite"
              aria-label={`Erro no último teste de ${connection.label}`}
            >
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              <AlertDescription className="text-xs">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className="cursor-help"
                        tabIndex={0}
                        aria-label={`Mensagem de erro: ${last.error}`}
                      >
                        {truncate(last.error)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p className="text-xs whitespace-pre-wrap break-words">{last.error}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 mt-auto pt-1" onClick={stop}>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                test.mutate(connection.id);
              }}
              disabled={test.isPending}
              aria-label={`Testar conexão ${connection.label}`}
            >
              {test.isPending ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" aria-hidden="true" />
              ) : (
                <TestTube2 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              )}
              Testar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                openHistory();
              }}
              aria-label={`Abrir histórico de testes de ${connection.label}`}
            >
              <History className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              Histórico
            </Button>
          </div>
        </CardContent>
      </Card>

      <IntegrationHealthHistorySheet
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        connectionId={connection.id}
        label={connection.label}
      />
    </>
  );
}
