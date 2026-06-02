import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCw, Loader2, X, SkipForward } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useWebhookDeliveries } from "@/hooks/win-loss/useWebhookDeliveries";
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
import { toast } from "sonner";
import { MAX_REPLAY_IDS, validateReplayIds } from "@/hooks/win-loss/validateReplayIds";
import { logReplayValidationFailure } from "@/hooks/win-loss/replayValidationDiagnostics";
import { getEventLabel } from "./webhookHelpers";
import { useWebhookReplayPersistence } from "@/hooks/win-loss/useWebhookReplayPersistence";
import { useWebhookResultTimers } from "@/hooks/win-loss/useWebhookResultTimers";
import { WebhookDeliveryRow } from "./webhook/WebhookDeliveryRow";

interface Props {
  subscriptionId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  url?: string;
  resultRetentionMs?: number;
}

const MAX_REPLAY = MAX_REPLAY_IDS;
const RETENTION_OPTIONS: Array<{ label: string; value: number }> = [
  { label: "10s", value: 10_000 },
  { label: "30s", value: 30_000 },
  { label: "2min", value: 120_000 },
  { label: "10min", value: 600_000 },
  { label: "Manter", value: Number.POSITIVE_INFINITY },
];

export function WebhookDeliveriesDrawer({
  subscriptionId,
  open,
  onOpenChange,
  url,
  resultRetentionMs,
}: Props) {
  const { data, isLoading, replay, isReplaying } = useWebhookDeliveries(subscriptionId);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<{ ids: string[]; requestedCount: number } | null>(null);

  const {
    selected,
    setSelected,
    retentionMs,
    updateRetention,
  } = useWebhookReplayPersistence(subscriptionId, data, open);

  const {
    lastResults,
    setLastResults,
    requestIds,
    setRequestIds,
    setResultTimestamps,
    scheduleClearResult,
  } = useWebhookResultTimers(retentionMs);

  useEffect(() => {
    if (!open) {
      setProcessingIds(new Set());
    }
  }, [open]);

  const recordResults = (
    ids: string[],
    payload:
      | {
          requestId?: string;
          results: Array<{ id: string; succeeded: boolean; skipped?: boolean }>;
        }
      | undefined,
  ) => {
    const reqId = payload?.requestId;
    if (reqId) {
      setRequestIds((prev) => {
        const next = new Map(prev);
        for (const id of ids) next.set(id, reqId);
        return next;
      });
    }
    const now = Date.now();
    setResultTimestamps((prev) => {
      const next = new Map(prev);
      for (const id of ids) next.set(id, now);
      return next;
    });
    setLastResults((prev) => {
      const next = new Map(prev);
      const returned = new Set<string>();
      for (const r of payload?.results ?? []) {
        const status: "ok" | "skipped" | "fail" = r.skipped
          ? "skipped"
          : r.succeeded
            ? "ok"
            : "fail";
        next.set(r.id, status);
        returned.add(r.id);
        scheduleClearResult(r.id);
      }
      for (const id of ids) {
        if (!returned.has(id)) {
          next.set(id, "fail");
          scheduleClearResult(id);
        }
      }
      return next;
    });
  };

  const failedIds = useMemo(
    () => (data ?? []).filter((d) => !d.succeeded).map((d) => d.id),
    [data],
  );
  
  const allFailedSelected = failedIds.length > 0 && failedIds.every((id) => selected.has(id));
  const someFailedSelected = failedIds.some((id) => selected.has(id));
  const headerCheckState: boolean | "indeterminate" = allFailedSelected
    ? true
    : someFailedSelected
      ? "indeterminate"
      : false;

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_REPLAY) next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) => {
      if (allFailedSelected) return new Set();
      return new Set(failedIds.slice(0, MAX_REPLAY));
    });

  const confirmSummary = useMemo(() => {
    if (!confirm || !data) return null;
    const byId = new Map(data.map((d) => [d.id, d] as const));
    const items = confirm.ids.map(id => {
      const d = byId.get(id);
      return { id, event: d?.event || 'unknown', label: getEventLabel(d?.event || 'unknown') };
    });
    return { count: confirm.ids.length, items };
  }, [confirm, data]);

  const requestReplay = (ids: string[]) => {
    if (isReplaying || confirm) return;
    
    const validation = validateReplayIds(ids);
    if (!validation.ok) {
      logReplayValidationFailure(ids, (validation as any).message, { subscriptionId });
      toast.error((validation as any).message);
      return;
    }
    
    setConfirm({ ids: validation.ids, requestedCount: ids.length });
  };

  const handleExecuteReplay = async () => {
    if (!confirm) return;
    const ids = confirm.ids;
    setConfirm(null);
    setProcessingIds((prev) => new Set([...prev, ...ids]));
    
    try {
      const res = await replay(ids);
      recordResults(ids, res);
      setSelected((prev) => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
      toast.success(`${ids.length} reenvio(s) processado(s).`);
    } catch (e) {
      toast.error("Erro ao reenviar webhooks.");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl font-bold">Entregas de Webhook</DrawerTitle>
              <DrawerDescription className="text-xs">
                Acompanhe e reenvie falhas de entrega para esta assinatura.
              </DrawerDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-muted-foreground uppercase">Retenção:</span>
              <div className="flex rounded-md border bg-muted/50 p-0.5">
                {RETENTION_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => updateRetention(opt.value)}
                    className={cn(
                      "px-2 py-1 text-[10px] font-bold transition-all rounded-[4px]",
                      retentionMs === opt.value
                        ? "bg-background text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex flex-1 flex-col overflow-hidden px-4 py-4">
          <div className="mb-4 flex items-center justify-between rounded-xl border bg-muted/30 p-3">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={headerCheckState === true}
                onCheckedChange={toggleAll}
                className={cn(headerCheckState === "indeterminate" && "opacity-70")}
              />
              <span className="text-xs font-semibold">
                {selected.size > 0 ? `${selected.size} selecionados` : "Selecionar falhas"}
              </span>
            </div>

            <Button
              size="sm"
              disabled={selected.size === 0 || isReplaying}
              onClick={() => requestReplay(Array.from(selected))}
              className="h-8 gap-2 px-4 font-bold"
            >
              {isReplaying ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCw className="h-3.5 w-3.5" />
              )}
              Reenviar Selecionados
            </Button>
          </div>

          <ScrollArea className="flex-1 -mx-4 px-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                <p className="text-sm text-muted-foreground font-medium italic">Buscando entregas...</p>
              </div>
            ) : data?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
                <SkipForward className="h-10 w-10 text-muted-foreground/20" />
                <p className="text-sm font-bold text-muted-foreground">Nenhuma entrega encontrada.</p>
                <p className="text-xs text-muted-foreground/60 max-w-[240px]">
                  Webhooks disparados recentemente aparecerão aqui para depuração.
                </p>
              </div>
            ) : (
              <div className="space-y-2 pb-10">
                {data?.map((delivery) => (
                  <WebhookDeliveryRow
                    key={delivery.id}
                    delivery={delivery}
                    isSelected={selected.has(delivery.id)}
                    onToggle={toggleOne}
                    isProcessing={processingIds.has(delivery.id)}
                    lastResult={lastResults.get(delivery.id)}
                    requestId={requestIds.get(delivery.id)}
                    onReplay={(id) => requestReplay([id])}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <AlertDialog open={!!confirm} onOpenChange={(v) => !v && setConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Reenvio</AlertDialogTitle>
              <AlertDialogDescription>
                Deseja reenviar {confirm?.ids.length} entrega(s) de webhook?
                Isso gerará novas tentativas imediatas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleExecuteReplay} className="bg-primary font-bold">
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DrawerContent>
    </Drawer>
  );
}
