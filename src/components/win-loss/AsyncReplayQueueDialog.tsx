import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  MinusCircle,
  RotateCcw,
  X,
} from "lucide-react";
import {
  useAsyncReplayQueue,
  ASYNC_REPLAY_CHUNK_SIZE,
  type ChunkStatus,
} from "@/hooks/win-loss/useAsyncReplayQueue";

interface AsyncReplayQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: string[];
  /** Auto-start when dialog opens */
  autoStart?: boolean;
  onFinished?: () => void;
}

const statusConfig: Record<ChunkStatus, { icon: typeof CheckCircle2; tone: string; label: string }> = {
  pending: { icon: Clock, tone: "text-muted-foreground", label: "Aguardando" },
  running: { icon: Loader2, tone: "text-primary animate-spin", label: "Em execução" },
  succeeded: { icon: CheckCircle2, tone: "text-status-success", label: "Concluído" },
  failed: { icon: XCircle, tone: "text-destructive", label: "Falhou" },
  cancelled: { icon: MinusCircle, tone: "text-muted-foreground", label: "Cancelado" },
};

export function AsyncReplayQueueDialog({
  open,
  onOpenChange,
  ids,
  autoStart = true,
  onFinished,
}: AsyncReplayQueueDialogProps) {
  const { state, start, cancel, reset } = useAsyncReplayQueue();

  useEffect(() => {
    if (open && autoStart && !state.isRunning && state.startedAt === null && ids.length > 0) {
      void start(ids);
    }
  }, [open, autoStart, ids, start, state.isRunning, state.startedAt]);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (state.finishedAt && onFinished) onFinished();
  }, [state.finishedAt, onFinished]);

  const progress = state.totalIds > 0 ? Math.round((state.processedIds / state.totalIds) * 100) : 0;
  const elapsedMs = state.startedAt
    ? (state.finishedAt ?? Date.now()) - state.startedAt
    : 0;
  const isDone = state.finishedAt !== null;

  return (
    <Dialog open={open} onOpenChange={(v) => !state.isRunning && onOpenChange(v)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            Fila assíncrona de reprocessamento
          </DialogTitle>
          <DialogDescription>
            {state.totalIds} itens em {state.totalChunks} lote(s) de até {ASYNC_REPLAY_CHUNK_SIZE}.
            Você pode acompanhar o progresso em tempo real.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">
                {state.processedIds} / {state.totalIds} processados
              </span>
              <span className="tabular-nums text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Aggregate stats */}
          <div className="grid grid-cols-4 gap-2">
            <Stat label="Sucesso" value={state.succeededIds} tone="text-status-success" />
            <Stat label="Falhas" value={state.failedIds} tone="text-destructive" />
            <Stat
              label="Lotes"
              value={`${state.chunks.filter((c) => c.status === "succeeded" || c.status === "failed").length}/${state.totalChunks}`}
              tone="text-foreground"
            />
            <Stat
              label="Tempo"
              value={`${(elapsedMs / 1000).toFixed(1)}s`}
              tone="text-muted-foreground"
            />
          </div>

          {/* Chunk list */}
          <ScrollArea className="max-h-64 rounded-md border bg-muted/20 p-2">
            <ul className="space-y-1" role="list" aria-label="Lotes da fila">
              {state.chunks.map((chunk) => {
                const cfg = statusConfig[chunk.status];
                const Icon = cfg.icon;
                return (
                  <li
                    key={chunk.index}
                    className="flex items-center gap-2 rounded-md bg-background/60 px-2.5 py-1.5 text-xs"
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${cfg.tone}`} aria-hidden />
                    <span className="font-medium tabular-nums shrink-0">
                      Lote {chunk.index + 1}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 shrink-0">
                      {chunk.ids.length} itens
                    </Badge>
                    <span className="text-muted-foreground shrink-0">{cfg.label}</span>
                    <div className="ml-auto flex items-center gap-1.5 shrink-0">
                      {chunk.status === "succeeded" && (
                        <>
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                            ✓ {chunk.succeeded}
                          </Badge>
                          {chunk.failed > 0 && (
                            <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                              ✗ {chunk.failed}
                            </Badge>
                          )}
                        </>
                      )}
                      {chunk.durationMs !== undefined && (
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {chunk.durationMs}ms
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
              {state.chunks.length === 0 && (
                <li className="py-4 text-center text-xs text-muted-foreground">
                  Aguardando início da fila…
                </li>
              )}
            </ul>
          </ScrollArea>

          {/* Per-chunk error details */}
          {state.chunks.some((c) => c.status === "failed" && c.error) && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2.5 space-y-1">
              <p className="text-[11px] font-medium text-destructive">Erros por lote:</p>
              <ul className="space-y-0.5">
                {state.chunks
                  .filter((c) => c.status === "failed" && c.error)
                  .map((c) => (
                    <li key={c.index} className="text-[11px] text-destructive break-words">
                      Lote {c.index + 1}: {c.error}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          {state.isRunning ? (
            <Button variant="destructive" onClick={cancel} disabled={state.isCancelling}>
              <X className="h-4 w-4 mr-1.5" />
              {state.isCancelling ? "Cancelando…" : "Cancelar fila"}
            </Button>
          ) : (
            <Button variant="default" onClick={() => onOpenChange(false)} disabled={!isDone && state.startedAt !== null}>
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <div className="rounded-md border bg-background/60 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-base font-bold tabular-nums font-display ${tone}`}>{value}</p>
    </div>
  );
}
