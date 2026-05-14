import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type LeagueTier = "bronze" | "silver" | "gold" | "diamond" | "legendary";

export interface LeagueMember {
  id: string;
  salesperson_id: string;
  name: string;
  avatar_url: string | null;
  league: LeagueTier;
  points: number;
  league_id: string | null;
  promoted_at?: string | null;
  demoted_at?: string | null;
}

export const LEAGUE_CONFIG: Record<LeagueTier, { label: string; emoji: string; color: string; gradient: string; minPoints: number; xpBonus: number }> = {
  bronze: { label: "Bronze", emoji: "🥉", color: "#CD7F32", gradient: "from-amber-700 to-orange-900", minPoints: 0, xpBonus: 0 },
  silver: { label: "Prata", emoji: "🥈", color: "#C0C0C0", gradient: "from-slate-300 to-slate-500", minPoints: 500, xpBonus: 5 },
  gold: { label: "Ouro", emoji: "🥇", color: "#FFD700", gradient: "from-amber-400 to-yellow-600", minPoints: 1500, xpBonus: 10 },
  diamond: { label: "Diamante", emoji: "💎", color: "#B9F2FF", gradient: "from-cyan-300 to-blue-500", minPoints: 3000, xpBonus: 15 },
  legendary: { label: "Lendário", emoji: "👑", color: "#FF6B35", gradient: "from-orange-400 to-red-600", minPoints: 5000, xpBonus: 25 },
};

function getLeagueTier(points: number): LeagueTier {
  if (points >= 5000) return "legendary";
  if (points >= 3000) return "diamond";
  if (points >= 1500) return "gold";
  if (points >= 500) return "silver";
  return "bronze";
}

export function useLeagues() {
  return useQuery({
    queryKey: ["salesperson-leagues"],
    queryFn: async (): Promise<LeagueMember[]> => {
      const { data: salespeople, error: spErr } = await supabase
        .from("salespeople")
        .select("id, name, avatar_url")
        .eq("is_active", true);
      if (spErr) throw spErr;

      // Try to get league members from new table
      const { data: members, error: membersErr } = await supabase
        .from("league_members")
        .select("*, leagues(*)");
      
      if (membersErr) {
        console.error("Error fetching league members:", membersErr);
      }

      return (salespeople || []).map((sp) => {
        const member = members?.find((m) => m.salesperson_id === sp.id);
        const points = member?.weekly_xp || 0;
        const leagueTier = member?.leagues?.tier;
        const leagueKey = leagueTier === 5 ? "legendary" : 
                        leagueTier === 4 ? "diamond" : 
                        leagueTier === 3 ? "gold" : 
                        leagueTier === 2 ? "silver" : "bronze";

        return {
          id: member?.id || sp.id,
          salesperson_id: sp.id,
          name: sp.name,
          avatar_url: sp.avatar_url,
          league: leagueKey as LeagueTier,
          points,
          league_id: member?.league_id || null,
          promoted_at: member?.promoted_at || null,
          demoted_at: member?.demoted_at || null,
        };
      }).sort((a, b) => b.points - a.points);
    },
    staleTime: 60000,
  });
}

export function useLeagueDefinitions() {
  return useQuery({
    queryKey: ["league-definitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leagues")
        .select("*")
        .order("tier", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useJoinLeague() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ salespersonId, leagueId }: { salespersonId: string; leagueId: string }) => {
      const { data, error } = await supabase
        .from("league_members")
        .upsert({
          salesperson_id: salespersonId,
          league_id: leagueId,
          weekly_xp: 0,
        }, { onConflict: "salesperson_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salesperson-leagues"] });
    },
  });
}
