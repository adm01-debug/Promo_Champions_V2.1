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
import { CheckCircle2, XCircle, Clock, RotateCw, Loader2, X, SkipForward, Copy } from "lucide-react";
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
  /**
   * Tempo (ms) que o status de cada linha (Reenviado/Falhou/Já entregue)
   * permanece visível após o replay. `0` ou `Infinity` mantêm até reload.
   * Default: 30s. Pode ser sobrescrito pelo usuário via seletor no header
   * (persistido em localStorage).
   */
  resultRetentionMs?: number;
}

import { toast } from "sonner";
import { MAX_REPLAY_IDS, validateReplayIds } from "@/hooks/win-loss/validateReplayIds";

const MAX_REPLAY = MAX_REPLAY_IDS;

const RETENTION_STORAGE_KEY = "winloss.replay.resultRetentionMs";
const RETENTION_OPTIONS: Array<{ label: string; value: number }> = [
  { label: "10s", value: 10_000 },
  { label: "30s", value: 30_000 },
  { label: "2min", value: 120_000 },
  { label: "10min", value: 600_000 },
  { label: "Manter", value: Number.POSITIVE_INFINITY },
];
const DEFAULT_RETENTION_MS = 30_000;

// Mapeamento de event → rótulo amigável (PT-BR).
// Eventos não mapeados (ou ausentes) caem no fallback "Evento desconhecido".
const EVENT_LABELS: Record<string, string> = {
  "winloss.deal.won": "Negócio ganho",
  "winloss.deal.lost": "Negócio perdido",
  "winloss.deal.updated": "Negócio atualizado",
  "winloss.deal.stage_changed": "Mudança de estágio",
  "winloss.deal.at_risk": "Negócio em risco",
  "winloss.forecast.updated": "Forecast atualizado",
  "winloss.battlecard.created": "Battlecard criado",
  "quote.created": "Orçamento criado",
  "quote.updated": "Orçamento atualizado",
  "quote.accepted": "Orçamento aceito",
  "quote.rejected": "Orçamento rejeitado",
};

function getEventLabel(event: string | null | undefined): string {
  if (!event || event.trim().length === 0 || event === "unknown") {
    return "Evento desconhecido";
  }
  return EVENT_LABELS[event] ?? event;
}


function readStoredRetention(): number | null {
  try {
    const raw = localStorage.getItem(RETENTION_STORAGE_KEY);
    if (!raw) return null;
    if (raw === "Infinity") return Number.POSITIVE_INFINITY;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : null;
  } catch {
    return null;
  }
}

export function WebhookDeliveriesDrawer({
  subscriptionId,
  open,
  onOpenChange,
  url,
  resultRetentionMs,
}: Props) {
  const { data, isLoading, replay, isReplaying } = useWebhookDeliveries(subscriptionId);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [lastResults, setLastResults] = useState<Map<string, "ok" | "skipped" | "fail">>(
    new Map(),
  );
  const [requestIds, setRequestIds] = useState<Map<string, string>>(new Map());
  const [resultTimestamps, setResultTimestamps] = useState<Map<string, number>>(new Map());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Retention configurável (prop > localStorage > default)
  const [retentionMs, setRetentionMs] = useState<number>(
    () => resultRetentionMs ?? readStoredRetention() ?? DEFAULT_RETENTION_MS,
  );
  // Mantém em ref para uso dentro de callbacks sem recriar handlers
  const retentionRef = useRef(retentionMs);
  useEffect(() => {
    retentionRef.current = retentionMs;
  }, [retentionMs]);

  const updateRetention = (ms: number) => {
    setRetentionMs(ms);
    try {
      localStorage.setItem(
        RETENTION_STORAGE_KEY,
        ms === Number.POSITIVE_INFINITY ? "Infinity" : String(ms),
      );
    } catch {
      // localStorage indisponível — ok, mantém em memória
    }
  };

  // Reset selection when drawer closes (mantém lastResults p/ revisão posterior)
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
    const ms = retentionRef.current;
    if (!Number.isFinite(ms) || ms <= 0) {
      // Modo "manter": não agenda expiração
      timersRef.current.delete(id);
      return;
    }
    const t = setTimeout(() => {
      setLastResults((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      setResultTimestamps((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      setRequestIds((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      timersRef.current.delete(id);
    }, ms);
    timersRef.current.set(id, t);
  };

  // Quando o usuário muda a retenção, reagenda timers existentes
  useEffect(() => {
    timersRef.current.forEach((t, id) => {
      clearTimeout(t);
      timersRef.current.delete(id);
      const baseTs = resultTimestamps.get(id) ?? Date.now();
      const elapsed = Date.now() - baseTs;
      const remaining = retentionMs - elapsed;
      if (!Number.isFinite(retentionMs) || retentionMs <= 0) return;
      if (remaining <= 0) {
        setLastResults((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        setResultTimestamps((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        return;
      }
      const handle = setTimeout(() => {
        setLastResults((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        setResultTimestamps((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        timersRef.current.delete(id);
      }, remaining);
      timersRef.current.set(id, handle);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retentionMs]);


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
    const empty = {
      count: 0,
      byEvent: [] as { event: string; label: string; count: number; unknown: boolean }[],
      items: [] as { id: string; event: string; label: string; unknown: boolean }[],
      missingCount: 0,
      unknownCount: 0,
      single: null as null | {
        id: string;
        event: string;
        label: string;
        unknown: boolean;
        attempt: number;
        status: number;
        error: string | null;
      },
    };
    if (!confirm || !data) return empty;
    const idSet = new Set(confirm.ids);
    const byId = new Map(data.map((d) => [d.id, d] as const));
    const map = new Map<string, number>();
    const items: { id: string; event: string; label: string; unknown: boolean }[] = [];
    let missingCount = 0;
    let unknownCount = 0;
    for (const id of confirm.ids) {
      const d = byId.get(id);
      const rawEvent = d?.event;
      const event = rawEvent && rawEvent.trim().length > 0 ? rawEvent : "unknown";
      const unknown = !d || !rawEvent || rawEvent.trim().length === 0;
      if (!d) missingCount++;
      if (unknown) unknownCount++;
      map.set(event, (map.get(event) ?? 0) + 1);
      items.push({ id, event, label: getEventLabel(event), unknown });
    }
    let single: typeof empty.single = null;
    if (confirm.ids.length === 1) {
      const id = confirm.ids[0];
      const d = byId.get(id);
      const rawEvent = d?.event;
      const event = rawEvent && rawEvent.trim().length > 0 ? rawEvent : "unknown";
      const unknown = !d || !rawEvent || rawEvent.trim().length === 0;
      single = {
        id,
        event,
        label: getEventLabel(event),
        unknown,
        attempt: d?.attempt ?? 0,
        status: d?.status ?? 0,
        error: d?.error_message ?? (unknown ? "Detalhes da entrega indisponíveis (pode ter sido removida)." : null),
      };
    }
    return {
      count: confirm.ids.length,
      byEvent: Array.from(map, ([event, count]) => ({
        event,
        label: getEventLabel(event),
        count,
        unknown: event === "unknown",
      })).sort((a, b) => b.count - a.count),
      items,
      missingCount,
      unknownCount,
      single,
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

  // --- Batch tracking (para resumo "X/Y reenviando, Z falhou") ---
  interface BatchState {
    id: string;
    ids: string[];
    startedAt: number;
    results: Map<string, "ok" | "skipped" | "fail">;
  }
  const [activeBatch, setActiveBatch] = useState<BatchState | null>(null);

  // --- Histórico local de replays (últimos N) ---
  interface ReplayHistoryEntry {
    id: string;
    at: number;
    total: number;
    ok: number;
    skipped: number;
    fail: number;
    byEvent: Array<{ event: string; ok: number; skipped: number; fail: number }>;
  }
  const MAX_HISTORY = 8;
  const [replayHistory, setReplayHistory] = useState<ReplayHistoryEntry[]>([]);

  const recordHistory = (
    ids: string[],
    payload:
      | {
          results: Array<{ id: string; succeeded: boolean; skipped?: boolean }>;
        }
      | undefined,
  ) => {
    if (!data) return;
    const idToEvent = new Map<string, string>();
    for (const d of data) idToEvent.set(d.id, d.event);
    const statusById = new Map<string, "ok" | "skipped" | "fail">();
    const returned = new Set<string>();
    for (const r of payload?.results ?? []) {
      const status: "ok" | "skipped" | "fail" = r.skipped
        ? "skipped"
        : r.succeeded
          ? "ok"
          : "fail";
      statusById.set(r.id, status);
      returned.add(r.id);
    }
    for (const id of ids) if (!returned.has(id)) statusById.set(id, "fail");

    const eventMap = new Map<string, { ok: number; skipped: number; fail: number }>();
    let ok = 0;
    let skipped = 0;
    let fail = 0;
    for (const id of ids) {
      const s = statusById.get(id) ?? "fail";
      const ev = idToEvent.get(id) ?? "unknown";
      const cur = eventMap.get(ev) ?? { ok: 0, skipped: 0, fail: 0 };
      cur[s]++;
      eventMap.set(ev, cur);
      if (s === "ok") ok++;
      else if (s === "skipped") skipped++;
      else fail++;
    }
    const entry: ReplayHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      at: Date.now(),
      total: ids.length,
      ok,
      skipped,
      fail,
      byEvent: Array.from(eventMap, ([event, v]) => ({ event, ...v })).sort(
        (a, b) => b.ok + b.skipped + b.fail - (a.ok + a.skipped + a.fail),
      ),
    };
    setReplayHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));
  };

  const executeReplay = () => {
    if (!confirm) return;
    const ids = confirm.ids;
    // Mantém o modal aberto durante o replay para mostrar spinner inline.
    // Será fechado em onSettled abaixo.

    if (ids.length === 1) {
      setPendingId(ids[0]);
    }
    setProcessingIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      return next;
    });
    if (ids.length > 1) clearSelection();

    // Só rastreamos lotes (>1) — uma única linha já tem feedback inline
    const batchId =
      ids.length > 1
        ? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        : null;
    if (batchId) {
      setActiveBatch({
        id: batchId,
        ids,
        startedAt: Date.now(),
        results: new Map(),
      });
    }

    replay(ids, {
      onSuccess: (payload) => {
        recordResults(ids, payload);
        recordHistory(ids, payload);
        if (batchId) {
          setActiveBatch((prev) => {
            if (!prev || prev.id !== batchId) return prev;
            const next = new Map(prev.results);
            const returned = new Set<string>();
            for (const r of payload?.results ?? []) {
              const status: "ok" | "skipped" | "fail" = r.skipped
                ? "skipped"
                : r.succeeded
                  ? "ok"
                  : "fail";
              next.set(r.id, status);
              returned.add(r.id);
            }
            for (const id of ids) {
              if (!returned.has(id) && !next.has(id)) next.set(id, "fail");
            }
            return { ...prev, results: next };
          });
        }
      },
      onSettled: () => {
        if (ids.length === 1) setPendingId(null);
        clearProcessing(ids);
        setConfirm(null);
        // Auto-clear do resumo após pequeno delay para o usuário ler
        if (batchId) {
          window.setTimeout(() => {
            setActiveBatch((prev) => (prev && prev.id === batchId ? null : prev));
          }, 6000);
        }
      },
    });
  };

  const handleReplay = (id: string) => {
    // Bloqueio por linha: ignora cliques repetidos enquanto este ID já está em voo
    if (processingIds.has(id)) {
      toast.info("Esta entrega já está sendo reenviada…");
      return;
    }
    requestReplay([id]);
  };

  const handleReplaySelected = () => {
    if (selected.size === 0) return;
    // Bloqueio por linha: filtra IDs já em processamento para não duplicar
    const ids = Array.from(selected).filter((id) => !processingIds.has(id));
    if (ids.length === 0) {
      toast.info("As entregas selecionadas já estão sendo reenviadas.");
      return;
    }
    requestReplay(ids);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <DrawerTitle className="text-base">Histórico de entregas</DrawerTitle>
              <DrawerDescription className="truncate text-xs">{url ?? subscriptionId}</DrawerDescription>
            </div>
            <label className="flex items-center gap-1.5 shrink-0 text-[10px] text-muted-foreground">
              <span className="hidden sm:inline">Manter status por</span>
              <select
                className="h-7 rounded-md border bg-background px-1.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                value={Number.isFinite(retentionMs) ? String(retentionMs) : "Infinity"}
                onChange={(e) =>
                  updateRetention(
                    e.target.value === "Infinity"
                      ? Number.POSITIVE_INFINITY
                      : Number(e.target.value),
                  )
                }
                aria-label="Tempo de retenção do status de replay nas linhas"
              >
                {RETENTION_OPTIONS.map((opt) => (
                  <option
                    key={opt.label}
                    value={Number.isFinite(opt.value) ? String(opt.value) : "Infinity"}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </DrawerHeader>

        <TooltipProvider delayDuration={200}>
          {/* Batch progress summary (lote >1) */}
          {activeBatch && (() => {
            const total = activeBatch.ids.length;
            let ok = 0;
            let skipped = 0;
            let fail = 0;
            for (const s of activeBatch.results.values()) {
              if (s === "ok") ok++;
              else if (s === "skipped") skipped++;
              else fail++;
            }
            const done = ok + skipped + fail;
            const pending = total - done;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const allDone = pending === 0;
            return (
              <div
                className="sticky top-0 z-20 border-b bg-background/95 px-4 py-2 backdrop-blur"
                role="status"
                aria-live="polite"
                aria-label={`Resumo do reenvio em lote: ${pending} reenviando, ${ok} sucesso, ${skipped} já entregues, ${fail} falhou de ${total}`}
              >
                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <div className="flex items-center gap-2 min-w-0">
                    {allDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" aria-hidden />
                    ) : (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" aria-hidden />
                    )}
                    <span className="font-medium text-foreground">
                      {allDone ? "Reenvio concluído" : `Reenviando ${done}/${total}`}
                    </span>
                    <span className="text-muted-foreground tabular-nums">·</span>
                    {pending > 0 && (
                      <span className="text-muted-foreground tabular-nums">
                        {pending} pendente{pending === 1 ? "" : "s"}
                      </span>
                    )}
                    {ok > 0 && (
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-success/15 text-success">
                        {ok} sucesso
                      </Badge>
                    )}
                    {skipped > 0 && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground">
                        {skipped} já entregue{skipped === 1 ? "" : "s"}
                      </Badge>
                    )}
                    {fail > 0 && (
                      <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                        {fail} falhou
                      </Badge>
                    )}
                  </div>
                  {allDone && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-[10px]"
                      onClick={() => setActiveBatch(null)}
                      aria-label="Dispensar resumo"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div
                  className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted"
                  aria-hidden
                >
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      allDone
                        ? fail > 0
                          ? "bg-destructive"
                          : "bg-success"
                        : "bg-primary",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })()}

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

          {replayHistory.length > 0 && (
            <div className="border-b bg-muted/10 px-4 py-2">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-[11px] font-semibold text-foreground uppercase tracking-wide">
                  Histórico do replay
                </h4>
                <button
                  type="button"
                  onClick={() => setReplayHistory([])}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Limpar histórico de replays"
                >
                  Limpar
                </button>
              </div>
              <ScrollArea className="max-h-32">
                <ol className="space-y-1.5 pr-2" aria-label="Últimos reenvios">
                  {replayHistory.map((h) => (
                    <li
                      key={h.id}
                      className="rounded-md border bg-background/60 px-2 py-1.5 text-[10px]"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-foreground">
                            {h.total} {h.total === 1 ? "entrega" : "entregas"}
                          </span>
                          {h.ok > 0 && (
                            <Badge variant="secondary" className="text-[9px] py-0 px-1 bg-success/15 text-success">
                              {h.ok} ok
                            </Badge>
                          )}
                          {h.skipped > 0 && (
                            <Badge variant="outline" className="text-[9px] py-0 px-1 text-muted-foreground">
                              {h.skipped} já entregue{h.skipped === 1 ? "" : "s"}
                            </Badge>
                          )}
                          {h.fail > 0 && (
                            <Badge variant="destructive" className="text-[9px] py-0 px-1">
                              {h.fail} falhou
                            </Badge>
                          )}
                        </div>
                        <span className="text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(h.at), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {h.byEvent.map((e) => {
                          const variant: "secondary" | "destructive" | "outline" =
                            e.fail > 0 ? "destructive" : e.ok > 0 ? "secondary" : "outline";
                          const cls =
                            e.fail > 0
                              ? ""
                              : e.ok > 0
                                ? "bg-success/15 text-success"
                                : "text-muted-foreground";
                          return (
                            <Badge
                              key={e.event}
                              variant={variant}
                              className={cn("text-[9px] py-0 px-1 font-mono", cls)}
                            >
                              {e.event}
                              {e.ok > 0 && <span className="ml-1 opacity-80">✓{e.ok}</span>}
                              {e.skipped > 0 && <span className="ml-1 opacity-80">↷{e.skipped}</span>}
                              {e.fail > 0 && <span className="ml-1 opacity-80">✕{e.fail}</span>}
                            </Badge>
                          );
                        })}
                      </div>
                    </li>
                  ))}
                </ol>
              </ScrollArea>
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
                  d.succeeded || isProcessing || (atLimit && !isChecked);
                const result = lastResults.get(d.id);
                const reqId = requestIds.get(d.id);
                return (
                  <li
                    key={d.id}
                    aria-busy={isProcessing}
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
                            <>
                              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 text-destructive px-2 py-0.5 text-[10px] font-medium">
                                <XCircle className="h-3 w-3" />
                                Falhou
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="ml-1 h-5 px-2 text-[10px] gap-1 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleReplay(d.id)}
                                disabled={d.succeeded || isProcessing}
                                aria-label={`Tentar reenviar novamente entrega ${d.event}`}
                              >
                                <RotateCw className="h-2.5 w-2.5" />
                                Tentar novamente
                              </Button>
                            </>
                          )}
                          {reqId && !isProcessing && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() => {
                                    void navigator.clipboard?.writeText(reqId).then(
                                      () => toast.success("requestId copiado"),
                                      () => toast.error("Falha ao copiar"),
                                    );
                                  }}
                                  className="ml-1 inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/40 px-2 py-0.5 text-[10px] font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                  aria-label={`Copiar requestId ${reqId}`}
                                >
                                  <span className="opacity-70">req</span>
                                  <span>{reqId.slice(0, 8)}</span>
                                  <Copy className="h-2.5 w-2.5 opacity-60" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs font-mono">
                                {reqId}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      )}
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span aria-busy={isProcessing}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 shrink-0"
                            // Bloqueio por linha: só desabilita se ESTA delivery está em voo
                            // (não bloqueia mais quando outra linha está sendo reenviada)
                            disabled={d.succeeded || isProcessing}
                            onClick={() => handleReplay(d.id)}
                            aria-label={
                              isProcessing
                                ? "Reenvio em andamento para esta entrega"
                                : "Reenviar entrega"
                            }
                          >
                            {isProcessing ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <RotateCw className="h-3 w-3" />
                            )}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-xs">
                        {d.succeeded
                          ? "Já entregue com sucesso"
                          : isProcessing
                            ? "Reenvio em andamento — aguarde…"
                            : "Reenviar este evento"}
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

      <AlertDialog
        open={!!confirm}
        onOpenChange={(o) => {
          if (o) return;
          if (isReplaying) return; // bloqueia ESC/overlay enquanto replay roda
          setConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmSummary.count > 1 ? "Confirmar reenvio em lote" : "Confirmar reenvio"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                {confirmSummary.single ? (
                  <div className="rounded-md border bg-muted/30 px-3 py-2 space-y-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant={confirmSummary.single.unknown ? "outline" : "outline"}
                        className={cn(
                          "text-[10px] py-0 px-1.5",
                          confirmSummary.single.unknown && "border-warning/40 text-warning",
                        )}
                      >
                        {confirmSummary.single.label}
                      </Badge>
                      {!confirmSummary.single.unknown && (
                        <code className="text-[10px] text-muted-foreground font-mono">
                          {confirmSummary.single.event}
                        </code>
                      )}
                      <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                        HTTP {confirmSummary.single.status || "—"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                        tentativa {confirmSummary.single.attempt}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono break-all">
                      ID: <span className="text-foreground">{confirmSummary.single.id.slice(0, 8)}</span>
                      <span className="opacity-60">…{confirmSummary.single.id.slice(-4)}</span>
                    </div>
                    {confirmSummary.single.error && (
                      <p className="text-[11px] text-destructive line-clamp-2 break-words">
                        {confirmSummary.single.error}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <p>
                      <span className="font-semibold text-foreground">{confirmSummary.count}</span>{" "}
                      {confirmSummary.count === 1 ? "entrega será reenviada." : "entregas serão reenviadas."}
                    </p>
                    {confirmSummary.byEvent.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {confirmSummary.byEvent.map((b) => (
                          <Badge
                            key={b.event}
                            variant="outline"
                            className={cn(
                              "text-[10px] py-0 px-1.5",
                              b.unknown && "border-warning/40 text-warning",
                            )}
                            title={b.unknown ? "Evento sem rótulo conhecido" : b.event}
                          >
                            {b.label} · {b.count}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {confirmSummary.unknownCount > 0 && (
                      <p className="text-[11px] text-warning flex items-start gap-1">
                        <span aria-hidden>⚠</span>
                        <span>
                          {confirmSummary.unknownCount}{" "}
                          {confirmSummary.unknownCount === 1
                            ? "entrega tem evento desconhecido"
                            : "entregas têm evento desconhecido"}
                          {confirmSummary.missingCount > 0 &&
                            ` (${confirmSummary.missingCount} sem detalhes carregados)`}
                          . O reenvio prosseguirá normalmente.
                        </span>
                      </p>
                    )}
                    {confirmSummary.items.length > 0 && (
                      <details className="rounded-md border bg-muted/20 px-2 py-1.5">
                        <summary className="cursor-pointer text-[11px] font-medium text-foreground hover:text-primary transition-colors">
                          Ver mapeamento por entrega ({confirmSummary.items.length})
                        </summary>
                        <ScrollArea className="mt-1.5 max-h-40">
                          <ul className="space-y-1 pr-2" aria-label="Mapeamento de eventos por entrega">
                            {confirmSummary.items.map((it) => (
                              <li
                                key={it.id}
                                className="flex items-center justify-between gap-2 text-[10px]"
                              >
                                <span className="font-mono text-muted-foreground shrink-0">
                                  {it.id.slice(0, 8)}…{it.id.slice(-4)}
                                </span>
                                <span className="text-muted-foreground">→</span>
                                <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
                                  <span
                                    className={cn(
                                      "truncate font-medium",
                                      it.unknown ? "text-warning" : "text-foreground",
                                    )}
                                  >
                                    {it.label}
                                  </span>
                                  {!it.unknown && (
                                    <code className="text-muted-foreground font-mono shrink-0 opacity-70">
                                      {it.event}
                                    </code>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      </details>
                    )}
                  </>
                )}
                <p className="text-xs text-muted-foreground">
                  {confirmSummary.single
                    ? "Uma nova tentativa será criada no histórico."
                    : "Cada entrega criará uma nova tentativa no histórico."}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          {isReplaying && (
            <div
              className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-[11px] text-primary"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" aria-hidden />
              <span>Reenviando {confirmSummary.count}… aguarde a conclusão.</span>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReplaying}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                executeReplay();
              }}
              disabled={isReplaying}
            >
              {isReplaying ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" aria-hidden />
              ) : (
                <RotateCw className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              )}
              {isReplaying ? "Reenviando…" : `Reenviar ${confirmSummary.count}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Drawer>
  );
}
