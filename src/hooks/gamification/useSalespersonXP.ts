import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SalespersonXP {
  id: string;
  salesperson_id: string;
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
  created_at: string;
  updated_at: string;
}

interface XPHistory {
  id: string;
  salesperson_id: string;
  xp_amount: number;
  source_type: string;
  source_id: string | null;
  description: string | null;
  created_at: string;
}

// XP thresholds per level (exponential growth)
export const LEVEL_THRESHOLDS = [
  0,      // Level 1: 0 XP
  100,    // Level 2: 100 XP
  250,    // Level 3: 250 XP
  500,    // Level 4: 500 XP
  850,    // Level 5: 850 XP
  1300,   // Level 6: 1300 XP
  1900,   // Level 7: 1900 XP
  2700,   // Level 8: 2700 XP
  3700,   // Level 9: 3700 XP
  5000,   // Level 10: 5000 XP
  6500,   // Level 11: 6500 XP
  8500,   // Level 12: 8500 XP
  11000,  // Level 13: 11000 XP
  14000,  // Level 14: 14000 XP
  18000,  // Level 15: 18000 XP
  23000,  // Level 16: 23000 XP
  30000,  // Level 17: 30000 XP
  40000,  // Level 18: 40000 XP
  55000,  // Level 19: 55000 XP
  75000,  // Level 20: 75000 XP (Max)
];

// Level titles and colors
export const LEVEL_INFO: Record<number, { title: string; color: string; emoji: string }> = {
  1: { title: "Iniciante", color: "from-gray-400 to-gray-500", emoji: "🌱" },
  2: { title: "Aprendiz", color: "from-gray-500 to-gray-600", emoji: "📚" },
  3: { title: "Promissor", color: "from-green-400 to-green-500", emoji: "⭐" },
  4: { title: "Competente", color: "from-green-500 to-green-600", emoji: "💪" },
  5: { title: "Habilidoso", color: "from-blue-400 to-blue-500", emoji: "🎯" },
  6: { title: "Experiente", color: "from-blue-500 to-blue-600", emoji: "🔥" },
  7: { title: "Avançado", color: "from-purple-400 to-purple-500", emoji: "⚡" },
  8: { title: "Expert", color: "from-purple-500 to-purple-600", emoji: "🏅" },
  9: { title: "Mestre", color: "from-amber-400 to-amber-500", emoji: "👑" },
  10: { title: "Grão-Mestre", color: "from-amber-500 to-amber-600", emoji: "🎖️" },
  11: { title: "Campeão", color: "from-orange-400 to-orange-500", emoji: "🏆" },
  12: { title: "Lendário", color: "from-orange-500 to-red-500", emoji: "🌟" },
  13: { title: "Épico", color: "from-red-400 to-red-500", emoji: "💎" },
  14: { title: "Mítico", color: "from-red-500 to-pink-500", emoji: "🔮" },
  15: { title: "Imortal", color: "from-pink-400 to-purple-500", emoji: "⚔️" },
  16: { title: "Divino", color: "from-purple-500 to-indigo-500", emoji: "👼" },
  17: { title: "Celestial", color: "from-indigo-400 to-blue-500", emoji: "✨" },
  18: { title: "Supremo", color: "from-blue-500 to-cyan-500", emoji: "🌈" },
  19: { title: "Transcendente", color: "from-cyan-400 to-teal-500", emoji: "🚀" },
  20: { title: "O Vendedor", color: "from-yellow-400 to-amber-500", emoji: "👑" },
};

// XP rewards configuration
export const XP_REWARDS = {
  SALE_PER_1000: 10, // 10 XP per R$1000 in sales
  DAILY_GOAL: 25, // 25 XP for hitting daily activity goal
  STREAK_3_DAYS: 50, // 50 XP for 3-day streak
  STREAK_5_DAYS: 100, // 100 XP for 5-day streak
  STREAK_7_DAYS: 200, // 200 XP for 7-day streak
  STREAK_10_DAYS: 500, // 500 XP for 10-day streak
  STREAK_15_DAYS: 1000, // 1000 XP for 15-day streak
  NEW_RECORD: 250, // 250 XP for breaking personal record
};

export function calculateLevelFromXP(totalXP: number): { level: number; xpInLevel: number; xpToNext: number; progress: number } {
  let level = 1;
  
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelXP = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const xpInLevel = totalXP - currentLevelXP;
  const xpToNext = nextLevelXP - currentLevelXP;
  const progress = level >= 20 ? 100 : (xpInLevel / xpToNext) * 100;
  
  return { level, xpInLevel, xpToNext, progress };
}

export function getLevelInfo(level: number) {
  return LEVEL_INFO[Math.min(level, 20)] || LEVEL_INFO[1];
}

export function useSalespersonXP(salespersonId?: string) {
  return useQuery({
    queryKey: ["salesperson-xp", salespersonId],
    queryFn: async () => {
      if (!salespersonId) return null;
      
      const { data, error } = await supabase
        .from("salesperson_xp")
        .select("*")
        .eq("salesperson_id", salespersonId)
        .maybeSingle();
      
      if (error) throw error;
      return data as SalespersonXP | null;
    },
    enabled: !!salespersonId,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useAllSalespeopleXP() {
  return useQuery({
    queryKey: ["all-salespeople-xp"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salesperson_xp")
        .select(`
          *,
          salespeople:salesperson_id (id, name, avatar_url, role)
        `)
        .order("total_xp", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useXPHistory(salespersonId?: string) {
  return useQuery({
    queryKey: ["xp-history", salespersonId],
    queryFn: async () => {
      if (!salespersonId) return [];
      
      const { data, error } = await supabase
        .from("xp_history")
        .select("*")
        .eq("salesperson_id", salespersonId)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as XPHistory[];
    },
    enabled: !!salespersonId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useAddXP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      salespersonId,
      xpAmount,
      sourceType,
      sourceId,
      description,
      salespersonName,
    }: {
      salespersonId: string;
      xpAmount: number;
      sourceType: string;
      sourceId?: string;
      description?: string;
      salespersonName?: string;
    }) => {
      // Get or create XP record
      let { data: xpRecord, error: fetchError } = await supabase
        .from("salesperson_xp")
        .select("*")
        .eq("salesperson_id", salespersonId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const newTotalXP = (xpRecord?.total_xp || 0) + xpAmount;
      const levelInfo = calculateLevelFromXP(newTotalXP);
      const previousLevel = xpRecord?.current_level || 1;

      if (!xpRecord) {
        // Create new XP record
        const { data: newRecord, error: insertError } = await supabase
          .from("salesperson_xp")
          .insert({
            salesperson_id: salespersonId,
            total_xp: newTotalXP,
            current_level: levelInfo.level,
            xp_to_next_level: levelInfo.xpToNext - levelInfo.xpInLevel,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        xpRecord = newRecord;
      } else {
        // Update existing XP record
        const { error: updateError } = await supabase
          .from("salesperson_xp")
          .update({
            total_xp: newTotalXP,
            current_level: levelInfo.level,
            xp_to_next_level: levelInfo.xpToNext - levelInfo.xpInLevel,
          })
          .eq("id", xpRecord.id);

        if (updateError) throw updateError;
      }

      // Log XP history
      const { error: historyError } = await supabase
        .from("xp_history")
        .insert({
          salesperson_id: salespersonId,
          xp_amount: xpAmount,
          source_type: sourceType,
          source_id: sourceId || null,
          description: description || null,
        });

      if (historyError) throw historyError;

      const leveledUp = levelInfo.level > previousLevel;
      const levelsGained = levelInfo.level - previousLevel;

      return {
        newTotalXP,
        newLevel: levelInfo.level,
        previousLevel,
        leveledUp,
        levelsGained,
        salespersonName,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["salesperson-xp"] });
      queryClient.invalidateQueries({ queryKey: ["all-salespeople-xp"] });
      queryClient.invalidateQueries({ queryKey: ["xp-history"] });

      // Show level up toast if leveled up (celebration will be triggered separately)
      if (result.leveledUp && result.salespersonName) {
        const newLevelInfo = getLevelInfo(result.newLevel);
        toast.success(
          `${newLevelInfo.emoji} ${result.salespersonName} subiu para o nível ${result.newLevel}!`,
          {
            description: `Novo título: ${newLevelInfo.title}`,
            duration: 5000,
          }
        );
      }
    },
  });
}
