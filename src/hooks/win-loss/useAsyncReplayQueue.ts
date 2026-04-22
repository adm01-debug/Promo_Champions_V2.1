import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const ASYNC_REPLAY_CHUNK_SIZE = 25;

export type ChunkStatus = "pending" | "running" | "succeeded" | "failed" | "cancelled";

export interface ChunkResult {
  index: number;
  ids: string[];
  status: ChunkStatus;
  succeeded: number;
  failed: number;
  requestId?: string;
  error?: string;
  durationMs?: number;
}

export interface AsyncReplayState {
  isRunning: boolean;
  isCancelling: boolean;
  totalIds: number;
  totalChunks: number;
  processedIds: number;
  succeededIds: number;
  failedIds: number;
  currentChunkIndex: number;
  chunks: ChunkResult[];
  startedAt: number | null;
  finishedAt: number | null;
}

const initialState = (): AsyncReplayState => ({
  isRunning: false,
  isCancelling: false,
  totalIds: 0,
  totalChunks: 0,
  processedIds: 0,
  succeededIds: 0,
  failedIds: 0,
  currentChunkIndex: -1,
  chunks: [],
  startedAt: null,
  finishedAt: null,
});

interface InvokeResult {
  requestId: string;
  results: Array<{ id: string; succeeded: boolean; status: number; error: string | null }>;
}

export function useAsyncReplayQueue() {
  const qc = useQueryClient();
  const [state, setState] = useState<AsyncReplayState>(initialState);
  const cancelRef = useRef(false);

  const reset = useCallback(() => {
    cancelRef.current = false;
    setState(initialState());
  }, []);

  const cancel = useCallback(() => {
    cancelRef.current = true;
    setState((s) => ({ ...s, isCancelling: true }));
  }, []);

  const start = useCallback(
    async (ids: string[], chunkSize = ASYNC_REPLAY_CHUNK_SIZE) => {
      const unique = Array.from(new Set(ids));
      if (unique.length === 0) return;

      cancelRef.current = false;
      const chunks: string[][] = [];
      for (let i = 0; i < unique.length; i += chunkSize) chunks.push(unique.slice(i, i + chunkSize));

      const initial: ChunkResult[] = chunks.map((c, i) => ({
        index: i,
        ids: c,
        status: "pending",
        succeeded: 0,
        failed: 0,
      }));

      setState({
        isRunning: true,
        isCancelling: false,
        totalIds: unique.length,
        totalChunks: chunks.length,
        processedIds: 0,
        succeededIds: 0,
        failedIds: 0,
        currentChunkIndex: 0,
        chunks: initial,
        startedAt: Date.now(),
        finishedAt: null,
      });

      for (let i = 0; i < chunks.length; i++) {
        if (cancelRef.current) {
          setState((s) => ({
            ...s,
            chunks: s.chunks.map((c, idx) =>
              idx >= i && c.status === "pending" ? { ...c, status: "cancelled" } : c,
            ),
          }));
          break;
        }

        setState((s) => ({
          ...s,
          currentChunkIndex: i,
          chunks: s.chunks.map((c, idx) => (idx === i ? { ...c, status: "running" } : c)),
        }));

        const t0 = performance.now();
        try {
          const { data, error } = await supabase.functions.invoke("winloss-webhook-replay", {
            body: { dead_letter_ids: chunks[i] },
          });
          if (error) throw error;
          const d = data as InvokeResult;
          const ok = d.results.filter((r) => r.succeeded).length;
          const fail = d.results.length - ok;
          const dur = Math.round(performance.now() - t0);

          setState((s) => ({
            ...s,
            processedIds: s.processedIds + chunks[i].length,
            succeededIds: s.succeededIds + ok,
            failedIds: s.failedIds + fail,
            chunks: s.chunks.map((c, idx) =>
              idx === i
                ? {
                    ...c,
                    status: "succeeded",
                    succeeded: ok,
                    failed: fail,
                    requestId: d.requestId,
                    durationMs: dur,
                  }
                : c,
            ),
          }));
        } catch (e) {
          const dur = Math.round(performance.now() - t0);
          const msg = e instanceof Error ? e.message : "Erro desconhecido";
          setState((s) => ({
            ...s,
            processedIds: s.processedIds + chunks[i].length,
            failedIds: s.failedIds + chunks[i].length,
            chunks: s.chunks.map((c, idx) =>
              idx === i
                ? { ...c, status: "failed", failed: chunks[i].length, error: msg, durationMs: dur }
                : c,
            ),
          }));
        }
      }

      setState((s) => ({ ...s, isRunning: false, isCancelling: false, finishedAt: Date.now() }));
      qc.invalidateQueries({ queryKey: ["winloss-dead-letters"] });
      qc.invalidateQueries({ queryKey: ["winloss-replay-audit"] });

      const finalSnap = await new Promise<AsyncReplayState>((resolve) => {
        setState((s) => {
          resolve(s);
          return s;
        });
      });
      const wasCancelled = cancelRef.current;
      if (wasCancelled) {
        toast.warning(
          `Fila cancelada · ${finalSnap.succeededIds} sucesso · ${finalSnap.failedIds} falha(s)`,
        );
      } else if (finalSnap.failedIds === 0) {
        toast.success(`Fila concluída · ${finalSnap.succeededIds} reprocessado(s) com sucesso`);
      } else {
        toast.warning(
          `Fila concluída · ${finalSnap.succeededIds} sucesso · ${finalSnap.failedIds} falha(s)`,
        );
      }
    },
    [qc],
  );

  return { state, start, cancel, reset };
}
