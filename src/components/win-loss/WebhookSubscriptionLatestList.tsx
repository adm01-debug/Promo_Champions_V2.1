import { Link } from "react-router-dom";
import { CheckCircle2, ExternalLink, XCircle, Copy } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useWebhookSubscriptionLatest,
  type SubscriptionLatestRow,
} from "@/hooks/win-loss/useWebhookSubscriptionLatest";
import type { WebhookStatsWindow } from "@/hooks/win-loss/useWebhookDeliveryStats";

const WINDOW_LABEL: Record<WebhookStatsWindow, string> = {
  "24h": "últimas 24h",
  "7d": "últimos 7d",
  "30d": "últimos 30d",
};

function statusToneClass(status: number | null): string {
  if (status === null) return "text-muted-foreground";
  if (status >= 500 || status === 0) return "text-destructive";
  if (status >= 400) return "text-warning";
  if (status >= 200 && status < 300) return "text-success";
  return "text-muted-foreground";
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d}d atrás`;
}

function copy(value: string, label: string) {
  void navigator.clipboard?.writeText(value).then(
    () => toast.success(`${label} copiado`),
    () => toast.error("Falha ao copiar"),
  );
}

function Row({ row }: { row: SubscriptionLatestRow }) {
  const ok = row.last_succeeded === true;
  const timelineHref = row.last_request_id
    ? `/admin/webhooks-timeline?requestId=${row.last_request_id}`
    : `/admin/webhooks-timeline?subscriptionId=${row.subscription_id}`;

  return (
    <li className="rounded-md border bg-card p-2.5 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        {ok ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" aria-hidden />
        ) : (
          <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" aria-hidden />
        )}
        <span className="font-medium truncate min-w-0 max-w-[260px]" title={row.subscription_url ?? row.subscription_id}>
          {row.subscription_url ?? row.subscription_id}
        </span>
        {row.last_event && (
          <span className="font-mono text-[10px] text-muted-foreground">{row.last_event}</span>
        )}
        {row.last_attempt !== null && (
          <Badge variant="outline" className="font-normal">tent. {row.last_attempt}</Badge>
        )}
        {row.last_status !== null && (
          <span className={cn("font-semibold tabular-nums", statusToneClass(row.last_status))}>
            {row.last_status === 0 ? "rede/timeout" : `HTTP ${row.last_status}`}
          </span>
        )}
        {row.last_duration_ms !== null && (
          <span className="text-muted-foreground tabular-nums">{row.last_duration_ms}ms</span>
        )}
        <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
          {relativeTime(row.last_at)}
        </span>
      </div>

      {row.last_error_message && (
        <p className="mt-1 text-[11px] text-destructive/80 break-words line-clamp-2">
          {row.last_error_message}
        </p>
      )}

      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        <span className="font-mono">sub: {row.subscription_id.slice(0, 8)}…</span>
        {row.last_request_id && (
          <button
            type="button"
            onClick={() => copy(row.last_request_id!, "requestId")}
            className="font-mono inline-flex items-center gap-1 hover:text-foreground transition-colors"
            aria-label="Copiar requestId"
          >
            req: {row.last_request_id.slice(0, 8)}…
            <Copy className="h-2.5 w-2.5" aria-hidden />
          </button>
        )}
        <span className="tabular-nums">
          {row.failures}/{row.total} falha{row.failures === 1 ? "" : "s"}
        </span>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-5 ml-auto px-1.5 text-[10px] gap-1"
        >
          <Link to={timelineHref}>
            Timeline <ExternalLink className="h-2.5 w-2.5" aria-hidden />
          </Link>
        </Button>
      </div>
    </li>
  );
}

export function WebhookSubscriptionLatestList({ windowKey }: { windowKey: WebhookStatsWindow }) {
  const { data, isLoading } = useWebhookSubscriptionLatest(windowKey);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-xs text-muted-foreground">
          Subscriptions · última execução
        </p>
        <p className="text-[10px] text-muted-foreground/70">
          {WINDOW_LABEL[windowKey]} · maiores gargalos primeiro
        </p>
      </div>
      {isLoading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-xs text-muted-foreground py-6 text-center">
          Nenhuma subscription com atividade na janela.
        </p>
      ) : (
        <ul className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
          {data.map((row) => (
            <Row key={row.subscription_id} row={row} />
          ))}
        </ul>
      )}
    </div>
  );
}
