import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import { useMemo } from "react";
import type { DeadLetter } from "@/hooks/win-loss/useWebhookDeadLetters";

export const BULK_REPLAY_HARD_CAP = 200;
export const BULK_REPLAY_CHUNK_SIZE = 50;

interface BulkReplayConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  items: DeadLetter[];
  isReplaying?: boolean;
}

export function BulkReplayConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  items,
  isReplaying = false,
}: BulkReplayConfirmDialogProps) {
  const summary = useMemo(() => {
    const byEvent = new Map<string, number>();
    const bySub = new Map<string, number>();
    let alreadyReplayed = 0;
    for (const it of items) {
      byEvent.set(it.event, (byEvent.get(it.event) ?? 0) + 1);
      const subKey = it.subscription_url ?? it.subscription_id;
      bySub.set(subKey, (bySub.get(subKey) ?? 0) + 1);
      if (it.replay_count > 0) alreadyReplayed += 1;
    }
    return {
      total: items.length,
      events: Array.from(byEvent.entries()).sort((a, b) => b[1] - a[1]),
      subs: Array.from(bySub.entries()).sort((a, b) => b[1] - a[1]),
      alreadyReplayed,
      chunks: Math.ceil(items.length / BULK_REPLAY_CHUNK_SIZE),
    };
  }, [items]);

  const overCap = summary.total > BULK_REPLAY_HARD_CAP;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            Confirmar reprocessamento em lote
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm">
              <p>
                Você está prestes a reenviar{" "}
                <strong className="text-foreground">{summary.total}</strong>{" "}
                webhook(s) em dead-letter. Cada item será disparado novamente para a
                URL da assinatura correspondente.
              </p>

              {overCap && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-destructive">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="text-xs">
                    Limite máximo de <strong>{BULK_REPLAY_HARD_CAP}</strong> itens por
                    operação excedido. Reduza a seleção para continuar.
                  </span>
                </div>
              )}

              {!overCap && summary.alreadyReplayed > 0 && (
                <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2.5">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
                  <span className="text-xs text-foreground">
                    <strong>{summary.alreadyReplayed}</strong> item(ns) já foram
                    reprocessados anteriormente. Reenviar pode causar entregas duplicadas
                    no destino.
                  </span>
                </div>
              )}

              <ScrollArea className="max-h-48 rounded-md border bg-muted/20 p-3">
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">
                      Por evento
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {summary.events.map(([ev, n]) => (
                        <Badge key={ev} variant="outline" className="text-[10px]">
                          {ev} · {n}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">
                      Por assinatura
                    </p>
                    <ul className="space-y-1">
                      {summary.subs.map(([sub, n]) => (
                        <li
                          key={sub}
                          className="flex items-center justify-between gap-2 text-[11px]"
                        >
                          <span className="truncate text-muted-foreground">{sub}</span>
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            {n}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollArea>

              {!overCap && summary.chunks > 1 && (
                <p className="text-[11px] text-muted-foreground">
                  Será processado em <strong>{summary.chunks}</strong> lote(s) de até{" "}
                  {BULK_REPLAY_CHUNK_SIZE} itens.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isReplaying}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              if (overCap || isReplaying) return;
              onConfirm();
            }}
            disabled={overCap || isReplaying}
          >
            {isReplaying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Reprocessando…
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Confirmar reenvio ({summary.total})
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
