import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, MinusCircle, User2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useReplayAuditForDeadLetter, type ReplayAuditEntry } from "@/hooks/win-loss/useReplayAudit";

interface ReplayAuditTrailProps {
  deadLetterId: string;
}

function StatusIcon({ entry }: { entry: ReplayAuditEntry }) {
  if (entry.status_label === "succeeded") {
    return <CheckCircle2 className="h-3.5 w-3.5 text-status-success shrink-0" aria-hidden />;
  }
  if (entry.status_label === "skipped") {
    return <MinusCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden />;
  }
  return <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" aria-hidden />;
}

export function ReplayAuditTrail({ deadLetterId }: ReplayAuditTrailProps) {
  const { data, isLoading } = useReplayAuditForDeadLetter(deadLetterId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground py-2">
        <Loader2 className="h-3 w-3 animate-spin" />
        Carregando trilha…
      </div>
    );
  }

  const entries = (data ?? []) as ReplayAuditEntry[];
  if (entries.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground italic py-1">
        Nenhum reprocessamento manual registrado.
      </p>
    );
  }

  return (
    <ScrollArea className="max-h-56 pr-2">
      <ol className="space-y-2" aria-label="Trilha de auditoria de replays">
        {entries.map((e, i) => (
          <li
            key={e.id}
            className="rounded-md border bg-muted/20 px-2.5 py-1.5 text-[11px]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 shrink-0">
                  #{entries.length - i}
                </Badge>
                <StatusIcon entry={e} />
                <span className="font-medium text-foreground capitalize">
                  {e.status_label === "succeeded"
                    ? "Sucesso"
                    : e.status_label === "skipped"
                    ? "Ignorado"
                    : "Falha"}
                </span>
                {e.http_status > 0 && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                    HTTP {e.http_status}
                  </Badge>
                )}
                {typeof e.attempts === "number" && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                    {e.attempts}× retry
                  </Badge>
                )}
              </div>
              <span className="text-muted-foreground shrink-0 text-[10px]">
                {formatDistanceToNow(new Date(e.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-muted-foreground">
              <User2 className="h-3 w-3" />
              <span className="truncate">
                {e.actor_email ?? e.actor_user_id.slice(0, 8) + "…"}
              </span>
            </div>
            {e.error && (
              <p className="mt-1 text-destructive break-words line-clamp-2">{e.error}</p>
            )}
            <p className="mt-0.5 text-muted-foreground">
              requestId: <code className="text-[10px]">{e.request_id}</code>
            </p>
          </li>
        ))}
      </ol>
    </ScrollArea>
  );
}
