import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface SemanticProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  sales_count: number;
  status: string;
  similarity_score: number;
}

export interface SemanticSearchResponse {
  query: string;
  keywords: string[];
  intent: string;
  results: SemanticProduct[];
  count: number;
  cached?: boolean;
}

export function useSemanticSearch() {
  const [data, setData] = useState<SemanticSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/semantic-search`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ query, limit: 20 }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erro ${res.status}`);
      }

      const json = (await res.json()) as SemanticSearchResponse;
      setData(json);
      return json;
    } catch (err) {
      toast.error("Falha na busca semântica", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => setData(null), []);

  return { data, loading, search, reset };
}
