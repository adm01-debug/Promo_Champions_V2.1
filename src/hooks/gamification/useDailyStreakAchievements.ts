import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Streak milestone definitions
export const STREAK_MILESTONES = [
  {
    type: 'streak_3',
    days: 3,
    xp: 50,
    title: 'Iniciante Dedicado',
    description: '3 dias consecutivos de desafios completos',
    icon: '🔥',
  },
  {
    type: 'streak_7',
    days: 7,
    xp: 150,
    title: 'Semana Perfeita',
    description: '7 dias consecutivos de desafios completos',
    icon: '⚡',
  },
  {
    type: 'streak_14',
    days: 14,
    xp: 400,
    title: 'Duas Semanas de Fogo',
    description: '14 dias consecutivos de desafios completos',
    icon: '🌟',
  },
  {
    type: 'streak_30',
    days: 30,
    xp: 1000,
    title: 'Mestre da Consistência',
    description: '30 dias consecutivos de desafios completos',
    icon: '👑',
  },
] as const;

export type StreakMilestoneType = (typeof STREAK_MILESTONES)[number]['type'];

interface StreakAchievement {
  id: string;
  salesperson_id: string;
  streak_type: string;
  achieved_at: string;
  streak_count: number;
  xp_awarded: number;
  created_at: string;
}

export function useCurrentStreak(salespersonId?: string) {
  return useQuery({
    queryKey: ['daily-streak', salespersonId],
    queryFn: async () => {
      if (!salespersonId) return 0;

      const { data, error } = await supabase.rpc('calculate_daily_challenge_streak', {
        p_salesperson_id: salespersonId,
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error calculating streak:', error);
        }
        return 0;
      }

      return data as number;
    },
    enabled: !!salespersonId,
  });
}

export function useStreakAchievements(salespersonId?: string) {
  return useQuery({
    queryKey: ['streak-achievements', salespersonId],
    queryFn: async () => {
      if (!salespersonId) return [];

      const { data, error } = await supabase
        .from('daily_streak_achievements')
        .select('*')
        .eq('salesperson_id', salespersonId)
        .order('achieved_at', { ascending: false });

      if (error) throw error;
      return data as StreakAchievement[];
    },
    enabled: !!salespersonId,
  });
}

export function useCheckAndAwardStreakMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ salespersonId }: { salespersonId: string }) => {
      // Get current streak
      const { data: currentStreak, error: streakError } = await supabase.rpc(
        'calculate_daily_challenge_streak',
        { p_salesperson_id: salespersonId }
      );

      if (streakError) throw streakError;

      // Get existing achievements
      const { data: existingAchievements, error: achievementsError } = await supabase
        .from('daily_streak_achievements')
        .select('streak_type')
        .eq('salesperson_id', salespersonId);

      if (achievementsError) throw achievementsError;

      const existingTypes = new Set(existingAchievements?.map(a => a.streak_type) || []);

      // Check for new milestones
      const newMilestones = STREAK_MILESTONES.filter(
        milestone => currentStreak >= milestone.days && !existingTypes.has(milestone.type)
      );

      if (newMilestones.length === 0) {
        return { newMilestones: [], currentStreak };
      }

      // Claim no servidor: o RPC grava a conquista e credita o XP em
      // xp_history (o cliente não escreve mais XP nem conquistas).
      const { data: claimResult, error: claimError } = await supabase.rpc(
        'claim_streak_achievements' as never
      );
      if (claimError) throw claimError;

      const claimed = (
        (claimResult as { claimed?: Array<{ streak_type: string }> } | null)?.claimed ??
        []
      ).map(c => c.streak_type);
      const awardedMilestones = newMilestones.filter(m => claimed.includes(m.type));

      return { newMilestones: awardedMilestones, currentStreak };
    },
    onSuccess: ({ newMilestones }) => {
      if (newMilestones.length > 0) {
        newMilestones.forEach(milestone => {
          toast.success(`${milestone.icon} Conquista Desbloqueada!`, {
            description: `${milestone.title}: +${milestone.xp} XP`,
            duration: 5000,
          });
        });
      }

      queryClient.invalidateQueries({ queryKey: ['streak-achievements'] });
      queryClient.invalidateQueries({ queryKey: ['daily-streak'] });
      queryClient.invalidateQueries({ queryKey: ['salesperson-xp'] });
      queryClient.invalidateQueries({ queryKey: ['xp-history'] });
    },
    onError: error => {
      if (import.meta.env.DEV) {
        console.error('Error checking streak milestones:', error);
      }
    },
  });
}

export function getStreakMilestoneInfo(streakType: string) {
  return STREAK_MILESTONES.find(m => m.type === streakType);
}

export function getNextMilestone(currentStreak: number, achievedTypes: string[]) {
  const achievedSet = new Set(achievedTypes);
  return STREAK_MILESTONES.find(
    milestone => !achievedSet.has(milestone.type) && milestone.days > currentStreak
  );
}
