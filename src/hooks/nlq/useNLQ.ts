import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { NLQResponse } from "@/components/nlq/nlqHelpers";

const HISTORY_KEY = "nlq:history";
const MAX_HISTORY = 10;

export interface NLQHistoryItem {
  question: string;
  response: NLQResponse;
  at: number;
}

function readHistory(): NLQHistoryItem[] {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY) : [];
  } catch { return []; }
}

function writeHistory(items: NLQHistoryItem[]) {
  try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY))); } catch { /* noop */ }
}

export function useNLQ() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<NLQResponse | null>(null);
  const [history, setHistory] = useState<NLQHistoryItem[]>([]);

  useEffect(() => { setHistory(readHistory()); }, []);

  const ask = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return null;
    setLoading(true);
    try {
      const conversation = history.slice(0, 3).flatMap((h) => ([
        { role: "user", content: h.question },
        { role: "assistant", content: h.response.answer },
      ]));
      const { data, error } = await supabase.functions.invoke("nlq-query", {
        body: { question: trimmed, conversation },
      });
      if (error) {
        const msg = (error as { message?: string }).message ?? "Falha ao consultar IA";
        toast.error(msg);
        return null;
      }
      if ((data as { error?: string })?.error) {
        toast.error((data as { error: string }).error);
        return null;
      }
      const resp = data as NLQResponse;
      setResponse(resp);
      const next: NLQHistoryItem[] = [{ question: trimmed, response: resp, at: Date.now() }, ...history].slice(0, MAX_HISTORY);
      setHistory(next);
      writeHistory(next);
      return resp;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro inesperado");
      return null;
    } finally {
      setLoading(false);
    }
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setResponse(null);
    writeHistory([]);
  }, []);

  const restore = useCallback((item: NLQHistoryItem) => setResponse(item.response), []);

  return { loading, response, history, ask, clearHistory, restore };
}
