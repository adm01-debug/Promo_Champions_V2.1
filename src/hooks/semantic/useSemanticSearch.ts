import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { SemanticEntityType, SemanticSearchResponse } from "@/components/semantic/semanticSearchHelpers";

export function useSemanticSearch() {
  const [data, setData] = useState<SemanticSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  const run = useCallback(async (query: string, entity_types?: SemanticEntityType[], with_answer = true) => {
    if (!query.trim()) {
      setData(null);
      return null;
    }
    const myReq = ++reqIdRef.current;
    setLoading(true);
    try {
      const { data: payload, error } = await supabase.functions.invoke<SemanticSearchResponse>(
        "semantic-search-universal",
        { body: { query, entity_types, limit: 20, with_answer } },
      );
      if (error) throw error;
      if (myReq !== reqIdRef.current) return null;
      setData(payload ?? null);
      return payload ?? null;
    } catch (e) {
      if (myReq === reqIdRef.current) {
        toast.error("Falha na busca semântica", {
          description: e instanceof Error ? e.message : "Tente novamente.",
        });
      }
      return null;
    } finally {
      if (myReq === reqIdRef.current) setLoading(false);
    }
  }, []);

  const search = useCallback((query: string, entity_types?: SemanticEntityType[], with_answer = true) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { void run(query, entity_types, with_answer); }, 350);
  }, [run]);

  const reset = useCallback(() => setData(null), []);

  return { data, loading, search, runImmediate: run, reset };
}
