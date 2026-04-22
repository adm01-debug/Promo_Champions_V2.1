import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Clock, Link2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  useWebhookAttemptSlice,
  type AttemptDeliveryRow,
} from "@/hooks/win-loss/useWebhookAttemptSlice";
import type { WebhookStatsWindow } from "@/hooks/win-loss/useWebhookDeliveryStats";
import { useMemo } from "react";

const WINDOW_LABEL: Record<WebhookStatsWindow, string> = {
  "24h": "últimas 24 horas",
  "7d": "últimos 7 dias",
  "30d": "últimos 30 dias",
};

interface Props {
  attempt: number | null;
  windowKey: WebhookStatsWindow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function shortUrl(url: string | null, fallback: string): string {
  if (!url) return fallback;
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname === "/" ? "" : u.pathname}`;
  } catch {
    return url;
  }
}

function DeliveryRow({ row }: { row: AttemptDeliveryRow }) {
  const Icon = row.succeeded ? CheckCircle2 : XCircle;
  const color = row.succeeded ? "text-success" : "text-destructive";
  return (
    <li className="flex items-start gap-3 rounded-md border bg-muted/20 px-3 py-2">
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] py-0 px-1.5">
            {row.event}
          </Badge>
          <Badge
            variant={row.succeeded ? "secondary" : "destructive"}
            className="text-[10px] py-0 px-1.5"
          >
            HTTP {row.status || "—"}
          </Badge>
          <span className="text-[10px] text-muted-foreground inline-flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {row.duration_ms}ms
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1 inline-flex items-center gap-1 min-w-0 max-w-full">
          <Link2 className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate" title={row.subscription_url ?? row.subscription_id}>
            {shortUrl(row.subscription_url, row.subscription_id)}
          </span>
        </p>
        {row.error_message && (
          <p className="text-[11px] text-destructive mt-1 break-words">{row.error_message}</p>
        )}
        <p className="text-[10px] text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(row.created_at), { addSuffix: true, locale: ptBR })}
        </p>
      </div>
    </li>
  );
}

export function WebhookAttemptSliceDrawer({ attempt, windowKey, open, onOpenChange }: Props) {
  const { data, isLoading, isError } = useWebhookAttemptSlice(attempt, windowKey);

  const totalFailures = data?.rows.length ?? 0;
  const totalSubs = data?.subscriptions.length ?? 0;

  const description = useMemo(() => {
    if (attempt === null) return "";
    return `Tentativa ${attempt} · ${WINDOW_LABEL[windowKey]}`;
  }, [attempt, windowKey]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
      >
        <SheetHeader className="border-b px-4 py-3 space-y-1">
          <SheetTitle className="text-base">Falhas por tentativa</SheetTitle>
          <SheetDescription className="text-xs">{description}</SheetDescription>
          {!isLoading && !isError && totalFailures > 0 && (
            <p className="text-[11px] text-muted-foreground">
              <strong className="text-foreground">{totalFailures}</strong> falha
              {totalFailures === 1 ? "" : "s"} em{" "}
              <strong className="text-foreground">{totalSubs}</strong> assinatura
              {totalSubs === 1 ? "" : "s"}
              {data?.truncated && " (mostrando primeiras 500)"}
            </p>
          )}
        </SheetHeader>

        {isLoading ? (
          <div className="px-4 py-3 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : isError ? (
          <p className="px-4 py-8 text-xs text-destructive text-center">
            Erro ao carregar entregas.
          </p>
        ) : totalFailures === 0 ? (
          <p className="px-4 py-8 text-xs text-muted-foreground text-center">
            Nenhuma falha registrada nessa tentativa para a janela selecionada.
          </p>
        ) : (
          <ScrollArea className="flex-1">
            <div className="px-4 py-3 space-y-4 pb-6">
              {totalSubs > 1 && (
                <section aria-labelledby="subs-heading">
                  <h3
                    id="subs-heading"
                    className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5"
                  >
                    Assinaturas afetadas
                  </h3>
                  <ul className="space-y-1">
                    {data!.subscriptions.map((s) => (
                      <li
                        key={s.subscription_id}
                        className="flex items-center justify-between gap-2 rounded-md border bg-muted/10 px-2.5 py-1.5 text-[11px]"
                      >
                        <span
                          className="truncate text-muted-foreground"
                          title={s.subscription_url ?? s.subscription_id}
                        >
                          {shortUrl(s.subscription_url, s.subscription_id)}
                        </span>
                        <Badge variant="destructive" className="text-[10px] py-0 px-1.5 shrink-0">
                          {s.failures} falha{s.failures === 1 ? "" : "s"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section aria-labelledby="rows-heading">
                <h3
                  id="rows-heading"
                  className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5"
                >
                  Entregas
                </h3>
                <ul className="space-y-2" role="list">
                  {data!.rows.map((row) => (
                    <DeliveryRow key={row.id} row={row} />
                  ))}
                </ul>
              </section>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}
