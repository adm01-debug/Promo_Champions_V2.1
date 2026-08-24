import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CACHE_KEY = "wl-insight-explain-v1";
const TTL_MS = 24 * 60 * 60 * 1000;

interface CacheEntry { text: string; ts: number }
type Cache = Record<string, CacheEntry>;

const readCache = (): Cache => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}") as Cache; } catch { return {}; }
};
const writeCache = (c: Cache): void => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch { /* ignore */ }
};

export const useInsightExplanation = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>(() => {
    const cache = readCache();
    const out: Record<string, string> = {};
    Object.entries(cache).forEach(([k, v]) => {
      if (Date.now() - v.ts < TTL_MS) out[k] = v.text;
    });
    return out;
  });

  const explain = useCallback(async (insightId: string, title: string, description: string) => {
    if (explanations[insightId]) return;
    setLoading(insightId);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-win-loss", {
        body: { mode: "explain", insight_id: insightId, title, description },
      });
      if (error) throw error;
      const text = (data?.explanation as string | undefined) ?? "Sem explicação disponível.";
      setExplanations(prev => ({ ...prev, [insightId]: text }));
      const cache = readCache();
      cache[insightId] = { text, ts: Date.now() };
      writeCache(cache);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha ao gerar explicação";
      toast.error(msg);
    } finally {
      setLoading(null);
    }
  }, [explanations]);

  return { explain, explanations, loading };
};
