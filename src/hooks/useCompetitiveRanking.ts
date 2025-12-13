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

      // Fetch active salespeople
      const { data: salespeople, error: spError } = await supabase
        .from("salespeople")
        .select("*")
        .eq("is_active", true);

      if (spError) throw spError;

      // Fetch completed sales for current month
      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("*")
        .eq("status", "completed")
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", monthEnd.toISOString());

      if (salesError) throw salesError;

      // Fetch all leads (pending/in-progress sales) for each salesperson
      const { data: leads, error: leadsError } = await supabase
        .from("sales")
        .select("*")
        .neq("status", "completed")
        .neq("status", "lost");

      if (leadsError) throw leadsError;

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
    refetchInterval: 15000, // Refresh every 15 seconds for real-time feel
  });
}
