import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DailyChallenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  target_value: number;
  xp_reward: number;
  challenge_date: string;
  is_active: boolean;
  created_at: string;
}

export interface DailyChallengeProgress {
  id: string;
  challenge_id: string;
  salesperson_id: string;
  current_value: number;
  completed_at: string | null;
  xp_claimed: boolean;
}

export interface DailyChallengeWithProgress extends DailyChallenge {
  progress: DailyChallengeProgress | null;
  isCompleted: boolean;
  percentComplete: number;
}

const DAILY_CHALLENGE_ICONS: Record<string, string> = {
  calls: '📞',
  emails: '📧',
  meetings: '📅',
  linkedin: '💼',
  whatsapp: '💬',
  sales: '💰',
  any: '🎯',
  follow_up: '🔄',
};

const DAILY_CHALLENGE_COLORS: Record<string, string> = {
  calls: 'from-blue-500 to-blue-600',
  emails: 'from-purple-500 to-purple-600',
  meetings: 'from-green-500 to-green-600',
  linkedin: 'from-sky-500 to-sky-600',
  whatsapp: 'from-emerald-500 to-emerald-600',
  sales: 'from-amber-500 to-amber-600',
  any: 'from-pink-500 to-pink-600',
  follow_up: 'from-orange-500 to-orange-600',
};

export const getDailyChallengeIcon = (type: string) => DAILY_CHALLENGE_ICONS[type] || '🎯';
export const getDailyChallengeColor = (type: string) => DAILY_CHALLENGE_COLORS[type] || 'from-gray-500 to-gray-600';

export function useDailyChallenges() {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['daily-challenges', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as DailyChallenge[];
    },
  });
}

export function useDailyChallengeProgress(salespersonId?: string) {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['daily-challenge-progress', salespersonId, today],
    queryFn: async () => {
      if (!salespersonId) return [];

      const { data, error } = await supabase
        .from('daily_challenge_progress')
        .select(`
          *,
          daily_challenges!inner(challenge_date)
        `)
        .eq('salesperson_id', salespersonId)
        .eq('daily_challenges.challenge_date', today);

      if (error) throw error;
      return data as (DailyChallengeProgress & { daily_challenges: { challenge_date: string } })[];
    },
    enabled: !!salespersonId,
  });
}

export function useDailyChallengesWithProgress(salespersonId?: string) {
  const { data: challenges, isLoading: challengesLoading } = useDailyChallenges();
  const { data: progress, isLoading: progressLoading } = useDailyChallengeProgress(salespersonId);

  const challengesWithProgress: DailyChallengeWithProgress[] = (challenges || []).map(challenge => {
    const challengeProgress = progress?.find(p => p.challenge_id === challenge.id) || null;
    const currentValue = challengeProgress?.current_value || 0;
    const isCompleted = currentValue >= challenge.target_value;
    const percentComplete = Math.min((currentValue / challenge.target_value) * 100, 100);

    return {
      ...challenge,
      progress: challengeProgress,
      isCompleted,
      percentComplete,
    };
  });

  return {
    data: challengesWithProgress,
    isLoading: challengesLoading || progressLoading,
  };
}

export function useClaimDailyChallengeReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ challengeId, salespersonId, xpReward }: { 
      challengeId: string; 
      salespersonId: string;
      xpReward: number;
    }) => {
      // Mark as claimed
      const { error: progressError } = await supabase
        .from('daily_challenge_progress')
        .update({ 
          xp_claimed: true,
          completed_at: new Date().toISOString()
        })
        .eq('challenge_id', challengeId)
        .eq('salesperson_id', salespersonId);

      if (progressError) throw progressError;

      // Award XP
      const { data: currentXP } = await supabase
        .from('salesperson_xp')
        .select('total_xp, current_level, xp_to_next_level')
        .eq('salesperson_id', salespersonId)
        .single();

      if (currentXP) {
        const newTotalXP = currentXP.total_xp + xpReward;
        let newLevel = currentXP.current_level;
        let newXPToNext = currentXP.xp_to_next_level;

        while (newTotalXP >= newXPToNext) {
          newLevel++;
          newXPToNext = newLevel * 100;
        }

        await supabase
          .from('salesperson_xp')
          .update({
            total_xp: newTotalXP,
            current_level: newLevel,
            xp_to_next_level: newXPToNext,
          })
          .eq('salesperson_id', salespersonId);
      }

      // Log XP history
      await supabase.from('xp_history').insert({
        salesperson_id: salespersonId,
        xp_amount: xpReward,
        source_type: 'daily_challenge',
        source_id: challengeId,
        description: 'Desafio diário completado',
      });

      return { xpReward };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenge-progress'] });
      queryClient.invalidateQueries({ queryKey: ['salesperson-xp'] });
      queryClient.invalidateQueries({ queryKey: ['xp-history'] });
      toast.success(`+${data.xpReward} XP! Desafio diário completado!`);
    },
    onError: (error) => {
      console.error('Error claiming daily challenge reward:', error);
      toast.error('Erro ao resgatar recompensa');
    },
  });
}

export function useUpdateDailyChallengeProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ challengeId, salespersonId, increment = 1 }: {
      challengeId: string;
      salespersonId: string;
      increment?: number;
    }) => {
      // Check if progress exists
      const { data: existing } = await supabase
        .from('daily_challenge_progress')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('salesperson_id', salespersonId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('daily_challenge_progress')
          .update({ 
            current_value: existing.current_value + increment,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
        return { current_value: existing.current_value + increment };
      } else {
        const { error } = await supabase
          .from('daily_challenge_progress')
          .insert({
            challenge_id: challengeId,
            salesperson_id: salespersonId,
            current_value: increment,
          });

        if (error) throw error;
        return { current_value: increment };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenge-progress'] });
      queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });
    },
  });
}
