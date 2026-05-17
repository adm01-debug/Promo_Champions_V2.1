import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth } from "date-fns";

interface RankedSalesperson {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
  totalSales: number;
  dealsCount: number;
  rank: number;
  title: string | null;
  emoji: string | null;
  color: string | null;
  gapToFirst: number;
  gapToNext: number;
  leadsCount: number;
}

const RANK_TITLES: Record<number, { title: string; emoji: string; color: string }> = {
  1: { title: "Lenda", emoji: "👑", color: "from-yellow-500 to-amber-600" },
  2: { title: "Elite", emoji: "⚔️", color: "from-purple-500 to-violet-600" },
  3: { title: "Veterano", emoji: "🏆", color: "from-amber-500 to-orange-600" },
};

export function useCompetitiveRanking() {
  return useQuery({
    queryKey: ["competitive-ranking"],
    queryFn: async (): Promise<RankedSalesperson[]> => {
      // Use the optimized materialized view
      const { data, error } = await supabase
        .from("mv_competitive_ranking")
        .select("*")
        .order("rank", { ascending: true });

      if (error) {
        console.error("Error fetching competitive ranking from view:", error);
        throw error;
      }

      const firstPlaceSales = data[0]?.total_sales || 0;

      return data.map((sp, index) => {
        const rank = sp.rank;
        const titleInfo = RANK_TITLES[rank] || null;
        const nextSales = index > 0 ? data[index - 1].total_sales : sp.total_sales;
        
        return {
          id: sp.id,
          name: sp.name,
          avatar_url: sp.avatar_url,
          role: sp.role,
          totalSales: sp.total_sales,
          dealsCount: sp.deals_count,
          leadsCount: sp.leads_count,
          rank,
          title: titleInfo?.title || null,
          emoji: titleInfo?.emoji || null,
          color: titleInfo?.color || null,
          gapToFirst: firstPlaceSales - sp.total_sales,
          gapToNext: nextSales - sp.total_sales,
        };
      });
    },
    refetchInterval: false, // Optimize: manual refresh or on-stale only
    staleTime: 60 * 1000, 
    gcTime: 10 * 60 * 1000,
  });
}
