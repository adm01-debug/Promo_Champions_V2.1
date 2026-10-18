import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { toBusinessDate } from '@/lib/date';

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
  calls: '📞',
  emails: '📧',
  meetings: '🤝',
  sales: '💰',
  linkedin: '💼',
  whatsapp: '💬',
  activity: '⚡',
};

export const CHALLENGE_COLORS: Record<string, string> = {
  calls: 'from-blue-500 to-blue-600',
  emails: 'from-green-500 to-green-600',
  meetings: 'from-purple-500 to-purple-600',
  sales: 'from-yellow-500 to-yellow-600',
  linkedin: 'from-sky-500 to-sky-600',
  whatsapp: 'from-emerald-500 to-emerald-600',
  activity: 'from-orange-500 to-orange-600',
};

export function useWeeklyChallenges() {
  return useQuery({
    queryKey: ['weekly-challenges'],
    queryFn: async () => {
      const today = toBusinessDate();

      const { data, error } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', today)
        .gte('end_date', today)
        .order('xp_reward', { ascending: false });

      if (error) throw error;
      return data as WeeklyChallenge[];
    },
  });
}

export function useChallengeProgress(salespersonId?: string) {
  return useQuery({
    queryKey: ['challenge-progress', salespersonId],
    queryFn: async () => {
      if (!salespersonId) return [];

      const { data, error } = await supabase
        .from('challenge_progress')
        .select('*')
        .eq('salesperson_id', salespersonId);

      if (error) throw error;
      return data as ChallengeProgress[];
    },
    enabled: !!salespersonId,
  });
}

export function useChallengesWithProgress(salespersonId?: string) {
  const { data: challenges, isLoading: loadingChallenges } = useWeeklyChallenges();
  const { data: progress, isLoading: loadingProgress } =
    useChallengeProgress(salespersonId);

  const challengesWithProgress: ChallengeWithProgress[] = (challenges || []).map(
    challenge => {
      const challengeProgress =
        progress?.find(p => p.challenge_id === challenge.id) || null;
      const currentValue = challengeProgress?.current_value || 0;
      const percentage = Math.min((currentValue / challenge.target_value) * 100, 100);
      const isCompleted = currentValue >= challenge.target_value;

      const endDate = new Date(challenge.end_date);
      const today = new Date();
      const daysRemaining = Math.max(
        0,
        Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      );

      return {
        ...challenge,
        progress: challengeProgress,
        percentage,
        isCompleted,
        daysRemaining,
      };
    }
  );

  return {
    challenges: challengesWithProgress,
    isLoading: loadingChallenges || loadingProgress,
  };
}

export function useClaimChallengeReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      challengeId,
      xpReward,
    }: {
      challengeId: string;
      salespersonId: string;
      xpReward: number;
      challengeTitle: string;
    }) => {
      // Claim no servidor: lê xp_reward do catálogo, marca o progresso e
      // credita o XP em xp_history (o cliente não escreve mais XP).
      const { data, error } = await supabase.rpc(
        'claim_weekly_challenge_reward' as never,
        { p_challenge_id: challengeId } as never
      );

      if (error) throw error;

      const granted = (data as { xp_reward?: number } | null)?.xp_reward ?? xpReward;
      return { xpReward: granted };
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['challenge-progress'] });
      queryClient.invalidateQueries({ queryKey: ['salesperson-xp'] });
      queryClient.invalidateQueries({ queryKey: ['xp-history'] });
      toast.success(`🎉 +${data.xpReward} XP ganhos pelo desafio!`);
    },
    onError: () => {
      toast.error('Erro ao resgatar recompensa');
    },
  });
}
