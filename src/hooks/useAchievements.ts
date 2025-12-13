import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { Json } from "@/integrations/supabase/types";

export interface Achievement {
  id: string;
  salesperson_id: string;
  achievement_type: string;
  achievement_date: string;
  details: Json;
  created_at: string;
  salesperson?: {
    name: string;
    avatar_url: string | null;
    role: string;
  };
}

export function useAchievements(limit = 50) {
  return useQuery({
    queryKey: ["achievements", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select(`
          *,
          salesperson:salespeople(name, avatar_url, role)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Achievement[];
    },
  });
}

export function useRecordAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      salespersonId,
      achievementType = "daily_goal",
      details = {},
    }: {
      salespersonId: string;
      achievementType?: string;
      details?: Json;
    }) => {
      const today = format(new Date(), "yyyy-MM-dd");
      
      // Check if achievement already recorded today
      const { data: existing } = await supabase
        .from("achievements")
        .select("id")
        .eq("salesperson_id", salespersonId)
        .eq("achievement_type", achievementType)
        .eq("achievement_date", today)
        .maybeSingle();

      if (existing) {
        return existing; // Already recorded today
      }

      const { data, error } = await supabase
        .from("achievements")
        .insert([{
          salesperson_id: salespersonId,
          achievement_type: achievementType,
          achievement_date: today,
          details,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}
