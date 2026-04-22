import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Loader2,
  Copy,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useWebhookDeadLetters, type DeadLetter } from "@/hooks/win-loss/useWebhookDeadLetters";
import { useReplayAuditForDeadLetter } from "@/hooks/win-loss/useReplayAudit";
import { ReplayAuditTrail } from "@/components/win-loss/ReplayAuditTrail";
import { toast } from "sonner";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface DeadLetterByIdRow extends Omit<DeadLetter, "subscription_url"> {
  subscription_url: string | null;
  winloss_webhook_subscriptions?: { url: string } | null;
}

function useDeadLetterById(id: string | null) {
  return useQuery({
    queryKey: ["winloss-dead-letter-by-id", id],
    enabled: !!id && UUID_RE.test(id ?? ""),
    staleTime: 10_000,
    queryFn: async (): Promise<DeadLetterByIdRow | null> => {
      const { data, error } = await (supabase as unknown as {
        from: (t: string) => {
          select: (c: string) => {
            eq: (col: string, v: string) => {
              maybeSingle: () => Promise<{ data: DeadLetterByIdRow | null; error: Error | null }>;
            };
          };
        };
      })
        .from("winloss_webhook_dead_letters")
        .select("*, winloss_webhook_subscriptions(url)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { ...data, subscription_url: data.winloss_webhook_subscriptions?.url ?? null };
    },
  });
}

export function ReplayStatusByIdPanel() {
  const [input, setInput] = useState("");
  const [searchId, setSearchId] = useState<string | null>(null);
  const { data: dl, isLoading, isError, error, refetch, isFetching } = useDeadLetterById(searchId);
  const { data: audit } = useReplayAuditForDeadLetter(searchId ?? undefined);
  // Use the same mutation hook so cache invalidation stays consistent.
  const { replay, isReplaying } = useWebhookDeadLetters("pending");

  const onSearch = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      toast.error("Cole o ID do dead-letter para buscar.");
      return;
    }
    if (!UUID_RE.test(trimmed)) {
      toast.error("ID inválido — esperado um UUID.");
      return;
    }
    setSearchId(trimmed);
  };

  const onReplay = () => {
    if (!dl) return;
    replay([dl.id]);
    setTimeout(() => void refetch(), 1500);
  };

  const onCopy = (value: string, label: string) => {
    void navigator.clipboard?.writeText(value).then(
      () => toast.success(`${label} copiado`),
      () => toast.error("Falha ao copiar"),
    );
  };

  const lastReplayBadge = (() => {
    if (!dl || dl.replay_count === 0) return null;
    const ok = dl.last_replay_status && dl.last_replay_status >= 200 && dl.last_replay_status < 300;
    return (
      <Badge variant={ok ? "secondary" : "destructive"} className="text-[10px]">
        {ok ? (
          <CheckCircle2 className="h-3 w-3 mr-1" />
        ) : (
          <XCircle className="h-3 w-3 mr-1" />
        )}
        Último replay HTTP {dl.last_replay_status ?? "—"}
      </Badge>
    );
  })();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" />
          Status de replay por ID
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="Cole o ID do dead-letter (UUID)…"
              className="pl-8 font-mono text-xs"
              aria-label="ID do dead-letter"
            />
          </div>
          <Button onClick={onSearch} disabled={isFetching} size="sm">
            {isFetching ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-1.5" />
            )}
            Buscar
          </Button>
        </div>

        {!searchId && (
          <p className="text-xs text-muted-foreground py-8 text-center">
            Informe um ID para visualizar o histórico de replays e reprocessar.
          </p>
        )}

        {searchId && isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {searchId && isError && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error instanceof Error ? error.message : "Erro ao buscar."}</span>
          </div>
        )}

        {searchId && !isLoading && !isError && !dl && (
          <div className="rounded-md border bg-muted/20 p-4 text-xs text-muted-foreground text-center">
            Nenhum dead-letter encontrado com este ID.
          </div>
        )}

        {dl && (
          <div className="space-y-4">
            {/* Identification */}
            <div className="rounded-md border bg-muted/20 p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="text-[10px]">{dl.event}</Badge>
                <Badge
                  variant={dl.status === "pending" ? "destructive" : "secondary"}
                  className="text-[10px] capitalize"
                >
                  {dl.status}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  HTTP {dl.last_status || "—"}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {dl.attempts} tentativas
                </Badge>
                {dl.replay_count > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    <History className="h-2.5 w-2.5 mr-1" />
                    {dl.replay_count}× replay
                  </Badge>
                )}
                {lastReplayBadge}
              </div>
              {dl.subscription_url && (
                <p className="text-[11px] text-muted-foreground truncate">
                  → {dl.subscription_url}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-[11px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-muted-foreground shrink-0">ID:</span>
                  <code className="font-mono truncate">{dl.id}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 shrink-0"
                    onClick={() => onCopy(dl.id, "ID")}
                    aria-label="Copiar ID"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                {dl.request_id && (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-muted-foreground shrink-0">requestId:</span>
                    <code className="font-mono truncate">{dl.request_id}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0 shrink-0"
                      onClick={() => onCopy(dl.request_id!, "requestId")}
                      aria-label="Copiar requestId"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Criado{" "}
                {formatDistanceToNow(new Date(dl.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </div>

            {/* Last replay summary */}
            {dl.replay_count > 0 && (
              <div className="rounded-md border bg-background/60 p-3 space-y-1 text-[11px]">
                <p className="font-medium text-foreground">Resumo do último replay</p>
                <p>
                  <span className="text-muted-foreground">Replays totais:</span>{" "}
                  <strong>{dl.replay_count}</strong>
                </p>
                {dl.last_replay_at && (
                  <p>
                    <span className="text-muted-foreground">Quando:</span>{" "}
                    {formatDistanceToNow(new Date(dl.last_replay_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">Status HTTP:</span>{" "}
                  <strong>{dl.last_replay_status ?? "—"}</strong>
                </p>
                {dl.last_replay_error && (
                  <p className="text-destructive break-words">
                    <span className="text-muted-foreground">Erro:</span>{" "}
                    {dl.last_replay_error}
                  </p>
                )}
              </div>
            )}

            {/* Original error */}
            {dl.last_error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-[11px] text-destructive break-words">
                <p className="font-medium mb-1">Erro original (antes dos replays)</p>
                {dl.last_error}
              </div>
            )}

            {/* Action */}
            <div className="flex items-center justify-between gap-2 rounded-md border bg-primary/5 px-3 py-2">
              <span className="text-xs text-muted-foreground">
                Reprocessar este dead-letter agora.
              </span>
              <Button
                size="sm"
                onClick={onReplay}
                disabled={isReplaying || dl.status === "archived"}
              >
                {isReplaying ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                )}
                Reprocessar novamente
              </Button>
            </div>

            {/* Full audit trail */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-foreground">
                Trilha de auditoria de replays{" "}
                {audit && audit.length > 0 && (
                  <span className="text-muted-foreground">({audit.length})</span>
                )}
              </p>
              <ScrollArea className="max-h-72 rounded-md border bg-muted/10 p-2">
                <ReplayAuditTrail deadLetterId={dl.id} />
              </ScrollArea>
            </div>

            {/* Payload */}
            <details className="rounded-md border bg-muted/20">
              <summary className="cursor-pointer px-3 py-2 text-xs font-medium">
                Ver payload
              </summary>
              <pre className="text-[11px] bg-muted/40 p-3 overflow-x-auto whitespace-pre-wrap break-words rounded-b-md">
{JSON.stringify(dl.payload, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
