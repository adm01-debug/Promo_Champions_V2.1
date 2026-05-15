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
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Fetch all data in parallel for better performance
      const [salespeopleResult, salesResult, leadsResult] = await Promise.all([
        supabase
          .from("salespeople")
          .select("id, name, avatar_url, role")
          .eq("is_active", true),
        supabase
          .from("sales")
          .select("salesperson_id, amount")
          .eq("status", "completed")
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString()),
        supabase
          .from("sales")
          .select("salesperson_id")
          .neq("status", "completed")
          .neq("status", "lost"),
      ]);

      if (salespeopleResult.error) throw salespeopleResult.error;
      if (salesResult.error) throw salesResult.error;
      if (leadsResult.error) throw leadsResult.error;

      const salespeople = salespeopleResult.data;
      const sales = salesResult.data;
      const leads = leadsResult.data;

      // Calculate stats per salesperson
      const statsMap = new Map<string, { totalSales: number; dealsCount: number; leadsCount: number }>();
      
      (salespeople || []).forEach(sp => {
        const spSales = (sales || []).filter(s => s.salesperson_id === sp.id);
        const spLeads = (leads || []).filter(l => l.salesperson_id === sp.id);
        
        statsMap.set(sp.id, {
          totalSales: spSales.reduce((sum, s) => sum + Number(s.amount), 0),
          dealsCount: spSales.length,
          leadsCount: spLeads.length,
        });
      });

      // Sort by total sales and assign ranks
      const sorted = (salespeople || [])
        .map(sp => {
          const stats = statsMap.get(sp.id) || { totalSales: 0, dealsCount: 0, leadsCount: 0 };
          return {
            id: sp.id,
            name: sp.name,
            avatar_url: sp.avatar_url,
            role: sp.role,
            ...stats,
          };
        })
        .sort((a, b) => b.totalSales - a.totalSales);

      const firstPlaceSales = sorted[0]?.totalSales || 0;

      return sorted.map((sp, index) => {
        const rank = index + 1;
        const titleInfo = RANK_TITLES[rank] || null;
        const nextSales = index > 0 ? sorted[index - 1].totalSales : sp.totalSales;
        
        return {
          ...sp,
          rank,
          title: titleInfo?.title || null,
          emoji: titleInfo?.emoji || null,
          color: titleInfo?.color || null,
          gapToFirst: firstPlaceSales - sp.totalSales,
          gapToNext: nextSales - sp.totalSales,
          leadsCount: sp.leadsCount,
        };
      });
    },
    refetchInterval: false, // Optimize: manual refresh or on-stale only
    staleTime: 60 * 1000, 
    gcTime: 10 * 60 * 1000,
  });
}
