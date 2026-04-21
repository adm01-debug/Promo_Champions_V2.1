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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, XCircle, Clock, RotateCw, Loader2, X, SkipForward } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
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

interface Props {
  subscriptionId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  url?: string;
}

import { toast } from "sonner";
import { MAX_REPLAY_IDS, validateReplayIds } from "@/hooks/win-loss/validateReplayIds";

const MAX_REPLAY = MAX_REPLAY_IDS;

export function WebhookDeliveriesDrawer({ subscriptionId, open, onOpenChange, url }: Props) {
  const { data, isLoading, replay, isReplaying } = useWebhookDeliveries(subscriptionId);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [lastResults, setLastResults] = useState<Map<string, "ok" | "skipped" | "fail">>(
    new Map(),
  );
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Reset selection when drawer closes
  useEffect(() => {
    if (!open) {
      setSelected(new Set());
      setProcessingIds(new Set());
    }
  }, [open]);

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const scheduleClearResult = (id: string) => {
    const existing = timersRef.current.get(id);
    if (existing) clearTimeout(existing);
    const t = setTimeout(() => {
      setLastResults((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      timersRef.current.delete(id);
    }, 4000);
    timersRef.current.set(id, t);
  };

  const recordResults = (
    ids: string[],
    payload: { results: Array<{ id: string; succeeded: boolean; skipped?: boolean }> } | undefined,
  ) => {
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

  const clearProcessing = (ids: string[]) =>
    setProcessingIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.delete(id);
      return next;
    });

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
  const atLimit = selected.size >= MAX_REPLAY;

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
      // Select up to MAX_REPLAY of failed
      return new Set(failedIds.slice(0, MAX_REPLAY));
    });

  const clearSelection = () => setSelected(new Set());

  // --- Confirmation state ---
  const [confirm, setConfirm] = useState<{ ids: string[] } | null>(null);

  const confirmSummary = useMemo(() => {
    if (!confirm || !data) return { count: 0, byEvent: [] as { event: string; count: number }[] };
    const idSet = new Set(confirm.ids);
    const map = new Map<string, number>();
    for (const d of data) {
      if (idSet.has(d.id)) map.set(d.event, (map.get(d.event) ?? 0) + 1);
    }
    return {
      count: confirm.ids.length,
      byEvent: Array.from(map, ([event, count]) => ({ event, count })).sort((a, b) => b.count - a.count),
    };
  }, [confirm, data]);

  const requestReplay = (ids: string[]) => {
    const validation = validateReplayIds(ids);
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }
    setConfirm({ ids: validation.ids });
  };

  const executeReplay = () => {
    if (!confirm) return;
    const ids = confirm.ids;
    setConfirm(null);

    if (ids.length === 1) {
      setPendingId(ids[0]);
    }
    setProcessingIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      return next;
    });
    if (ids.length > 1) clearSelection();
    replay(ids, {
      onSuccess: (payload) => recordResults(ids, payload),
      onSettled: () => {
        if (ids.length === 1) setPendingId(null);
        clearProcessing(ids);
      },
    });
  };

  const handleReplay = (id: string) => requestReplay([id]);

  const handleReplaySelected = () => {
    if (selected.size === 0) return;
    requestReplay(Array.from(selected));
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle className="text-base">Histórico de entregas</DrawerTitle>
          <DrawerDescription className="truncate text-xs">{url ?? subscriptionId}</DrawerDescription>
        </DrawerHeader>

        <TooltipProvider delayDuration={200}>
          {/* Sticky selection toolbar */}
          {failedIds.length > 0 && (
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-2 backdrop-blur">
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                <Checkbox
                  checked={headerCheckState}
                  onCheckedChange={toggleAll}
                  aria-label="Selecionar todas as entregas falhas"
                />
                <span className="text-muted-foreground">
                  Selecionar todas as falhas ({failedIds.length})
                </span>
              </label>
              <div
                className="flex items-center gap-2"
                aria-live="polite"
              >
                {selected.size > 0 && (
                  <>
                    <span className="text-xs text-muted-foreground">
                      {selected.size} selecionado{selected.size === 1 ? "" : "s"}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={clearSelection}
                      disabled={isReplaying}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Limpar
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleReplaySelected}
                      disabled={isReplaying}
                    >
                      {isReplaying ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <RotateCw className="h-3 w-3 mr-1" />
                      )}
                      Reenviar selecionados
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          <ScrollArea className="flex-1 px-4 py-3">
            {isLoading && <p className="text-xs text-muted-foreground py-4 text-center">Carregando…</p>}
            {!isLoading && (data?.length ?? 0) === 0 && (
              <p className="text-xs text-muted-foreground py-6 text-center">Nenhuma entrega registrada ainda.</p>
            )}
            <ul className="space-y-2 pb-6" role="list" aria-label="Entregas de webhook">
              {(data ?? []).map((d) => {
                const Icon = d.succeeded ? CheckCircle2 : XCircle;
                const color = d.succeeded ? "text-emerald-500" : "text-destructive";
                const isProcessing = processingIds.has(d.id);
                const isPending = (pendingId === d.id && isReplaying) || isProcessing;
                const isChecked = selected.has(d.id);
                const checkboxDisabled =
                  d.succeeded || isReplaying || (atLimit && !isChecked);
                const result = lastResults.get(d.id);
                return (
                  <li
                    key={d.id}
                    className={cn(
                      "relative flex items-start gap-3 rounded-md border bg-muted/20 px-3 py-2 transition-colors overflow-hidden",
                      isProcessing && "bg-primary/5 border-primary/30",
                    )}
                  >
                    {d.succeeded ? (
                      <span className="w-4 shrink-0" aria-hidden />
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="mt-0.5 shrink-0">
                            <Checkbox
                              checked={isChecked}
                              disabled={checkboxDisabled}
                              onCheckedChange={() => toggleOne(d.id)}
                              aria-label={`Selecionar entrega de ${d.event}`}
                            />
                          </span>
                        </TooltipTrigger>
                        {atLimit && !isChecked && (
                          <TooltipContent side="right" className="text-xs">
                            Máx {MAX_REPLAY} por reenvio
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )}
                    <Icon className={`h-4 w-4 mt-0.5 ${color}`} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">{d.event}</Badge>
                        <Badge
                          variant={d.succeeded ? "secondary" : "destructive"}
                          className="text-[10px] py-0 px-1.5"
                        >
                          HTTP {d.status || "—"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                          tentativa {d.attempt}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground inline-flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {d.duration_ms}ms
                        </span>
                      </div>
                      {d.error_message && (
                        <p className="text-[11px] text-destructive mt-1 break-words">{d.error_message}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(d.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                      {(isProcessing || result) && (
                        <div
                          className="mt-1.5"
                          role="status"
                          aria-live="polite"
                        >
                          {isProcessing ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Reenviando…
                            </span>
                          ) : result === "ok" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success px-2 py-0.5 text-[10px] font-medium">
                              <CheckCircle2 className="h-3 w-3" />
                              Reenviado
                            </span>
                          ) : result === "skipped" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-medium">
                              <SkipForward className="h-3 w-3" />
                              Já entregue
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 text-destructive px-2 py-0.5 text-[10px] font-medium">
                              <XCircle className="h-3 w-3" />
                              Falhou
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 shrink-0"
                            disabled={d.succeeded || isPending || isReplaying}
                            onClick={() => handleReplay(d.id)}
                            aria-label="Reenviar entrega"
                          >
                            {isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <RotateCw className="h-3 w-3" />
                            )}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-xs">
                        {d.succeeded ? "Já entregue com sucesso" : "Reenviar este evento"}
                      </TooltipContent>
                    </Tooltip>
                    {isProcessing && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-primary/20 via-primary to-primary/20 animate-pulse"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </TooltipProvider>
      </DrawerContent>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmSummary.count > 1 ? "Confirmar reenvio em lote" : "Confirmar reenvio"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  <span className="font-semibold text-foreground">{confirmSummary.count}</span>{" "}
                  {confirmSummary.count === 1 ? "entrega será reenviada." : "entregas serão reenviadas."}
                </p>
                {confirmSummary.byEvent.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {confirmSummary.byEvent.map((b) => (
                      <Badge key={b.event} variant="outline" className="text-[10px] py-0 px-1.5">
                        {b.event} · {b.count}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Cada entrega criará uma nova tentativa no histórico.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeReplay}>
              <RotateCw className="h-3.5 w-3.5 mr-1.5" />
              Reenviar {confirmSummary.count}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Drawer>
  );
}
