import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UpsellSuggestion {
  product: string;
  attachRate: number;
  basedOn: number;
}

interface SaleRow { id: string; segment: string | null; product_name: string | null; status: string | null }

export function useUpsellSuggestions(saleId: string | undefined) {
  return useQuery({
    queryKey: ["winloss-upsell", saleId],
    enabled: !!saleId,
    queryFn: async (): Promise<UpsellSuggestion[]> => {
      const { data: base } = await supabase
        .from("sales")
        .select("id, segment, product_name, status")
        .eq("id", saleId!)
        .maybeSingle();
      const seed = base as SaleRow | null;
      if (!seed?.segment || !seed.product_name) return [];

      const { data: peers } = await supabase
        .from("sales")
        .select("id, segment, product_name, status")
        .eq("segment", seed.segment)
        .eq("status", "won")
        .neq("product_name", seed.product_name)
        .limit(200);
      const list = (peers as SaleRow[] | null) ?? [];
      if (!list.length) return [];

      const total = list.length;
      const counts = new Map<string, number>();
      list.forEach(s => {
        const p = s.product_name ?? "—";
        counts.set(p, (counts.get(p) ?? 0) + 1);
      });
      return Array.from(counts.entries())
        .map(([product, c]) => ({ product, attachRate: (c / total) * 100, basedOn: total }))
        .sort((a, b) => b.attachRate - a.attachRate)
        .slice(0, 3);
    },
    staleTime: 5 * 60_000,
  });
}
