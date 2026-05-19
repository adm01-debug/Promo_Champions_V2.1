import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  target_value: number;
  xp_reward: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface ChallengeProgress {
  id: string;
  challenge_id: string;
  salesperson_id: string;
  current_value: number;
  completed_at: string | null;
  xp_claimed: boolean;
  created_at: string;
}

export interface ChallengeWithProgress extends WeeklyChallenge {
  progress: ChallengeProgress | null;
  percentage: number;
  isCompleted: boolean;
  daysRemaining: number;
}

export const CHALLENGE_ICONS: Record<string, string> = {
  calls: "📞",
  emails: "📧",
  meetings: "🤝",
  sales: "💰",
  linkedin: "💼",
  whatsapp: "💬",
  activity: "⚡",
};

export const CHALLENGE_COLORS: Record<string, string> = {
  calls: "from-blue-500 to-blue-600",
  emails: "from-green-500 to-green-600",
  meetings: "from-purple-500 to-purple-600",
  sales: "from-yellow-500 to-yellow-600",
  linkedin: "from-sky-500 to-sky-600",
  whatsapp: "from-emerald-500 to-emerald-600",
  activity: "from-orange-500 to-orange-600",
};

export function useWeeklyChallenges() {
  return useQuery({
    queryKey: ["weekly-challenges"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      
      const { data, error } = await supabase
        .from("weekly_challenges")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", today)
        .gte("end_date", today)
        .order("xp_reward", { ascending: false });

      if (error) throw error;
      return data as WeeklyChallenge[];
    },
  });
}

export function useChallengeProgress(salespersonId?: string) {
  return useQuery({
    queryKey: ["challenge-progress", salespersonId],
    queryFn: async () => {
      if (!salespersonId) return [];

      const { data, error } = await supabase
        .from("challenge_progress")
        .select("*")
        .eq("salesperson_id", salespersonId);

      if (error) throw error;
      return data as ChallengeProgress[];
    },
    enabled: !!salespersonId,
  });
}

export function useChallengesWithProgress(salespersonId?: string) {
  const { data: challenges, isLoading: loadingChallenges } = useWeeklyChallenges();
  const { data: progress, isLoading: loadingProgress } = useChallengeProgress(salespersonId);

  const challengesWithProgress: ChallengeWithProgress[] = (challenges || []).map((challenge) => {
    const challengeProgress = progress?.find((p) => p.challenge_id === challenge.id) || null;
    const currentValue = challengeProgress?.current_value || 0;
    const percentage = Math.min((currentValue / challenge.target_value) * 100, 100);
    const isCompleted = currentValue >= challenge.target_value;
    
    const endDate = new Date(challenge.end_date);
    const today = new Date();
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      ...challenge,
      progress: challengeProgress,
      percentage,
      isCompleted,
      daysRemaining,
    };
  });

  return {
    challenges: challengesWithProgress,
    isLoading: loadingChallenges || loadingProgress,
  };
}

export function useUpdateChallengeProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      challengeId,
      salespersonId,
      incrementBy = 1,
    }: {
      challengeId: string;
      salespersonId: string;
      incrementBy?: number;
    }) => {
      // Check if progress exists
      const { data: existing } = await supabase
        .from("challenge_progress")
        .select("*")
        .eq("challenge_id", challengeId)
        .eq("salesperson_id", salespersonId)
        .single();

      if (existing) {
        const newValue = existing.current_value + incrementBy;
        const { data, error } = await supabase
          .from("challenge_progress")
          .update({ current_value: newValue })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("challenge_progress")
          .insert({
            challenge_id: challengeId,
            salesperson_id: salespersonId,
            current_value: incrementBy,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge-progress"] });
    },
  });
}

export function useClaimChallengeReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      challengeId,
      salespersonId,
      xpReward,
      challengeTitle,
    }: {
      challengeId: string;
      salespersonId: string;
      xpReward: number;
      challengeTitle: string;
    }) => {
      // Mark as claimed
      const { error: updateError } = await supabase
        .from("challenge_progress")
        .update({ 
          xp_claimed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq("challenge_id", challengeId)
        .eq("salesperson_id", salespersonId);

      if (updateError) throw updateError;

      // Add XP to salesperson
      const { data: existingXP } = await supabase
        .from("salesperson_xp")
        .select("*")
        .eq("salesperson_id", salespersonId)
        .single();

      if (existingXP) {
        const newTotalXP = existingXP.total_xp + xpReward;
        await supabase
          .from("salesperson_xp")
          .update({ total_xp: newTotalXP })
          .eq("salesperson_id", salespersonId);
      } else {
        await supabase.from("salesperson_xp").insert({
          salesperson_id: salespersonId,
          total_xp: xpReward,
        });
      }

      // Log XP history
      await supabase.from("xp_history").insert({
        salesperson_id: salespersonId,
        xp_amount: xpReward,
        source_type: "weekly_challenge",
        source_id: challengeId,
        description: `Desafio completado: ${challengeTitle}`,
      });

      return { xpReward };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["challenge-progress"] });
      queryClient.invalidateQueries({ queryKey: ["salesperson-xp"] });
      queryClient.invalidateQueries({ queryKey: ["xp-history"] });
      toast.success(`🎉 +${data.xpReward} XP ganhos pelo desafio!`);
    },
    onError: () => {
      toast.error("Erro ao resgatar recompensa");
    },
  });
}
