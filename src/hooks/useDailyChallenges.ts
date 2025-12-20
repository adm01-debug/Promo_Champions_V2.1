import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Streak milestone definitions (duplicated to avoid circular dependency)
const STREAK_MILESTONES = [
  { type: 'streak_3', days: 3, xp: 50, title: 'Iniciante Dedicado', icon: '🔥' },
  { type: 'streak_7', days: 7, xp: 150, title: 'Semana Perfeita', icon: '⚡' },
  { type: 'streak_14', days: 14, xp: 400, title: 'Duas Semanas de Fogo', icon: '🌟' },
  { type: 'streak_30', days: 30, xp: 1000, title: 'Mestre da Consistência', icon: '👑' },
];

// Helper function to check and award streak milestones
async function checkAndAwardStreakMilestones(salespersonId: string, queryClient: QueryClient) {
  try {
    // Get current streak
    const { data: currentStreak, error: streakError } = await supabase
      .rpc('calculate_daily_challenge_streak', { p_salesperson_id: salespersonId });
    
    if (streakError) throw streakError;
    
    // Get existing achievements
    const { data: existingAchievements } = await supabase
      .from('daily_streak_achievements')
      .select('streak_type')
      .eq('salesperson_id', salespersonId);
    
    const existingTypes = new Set(existingAchievements?.map(a => a.streak_type) || []);
    
    // Check for new milestones
    const newMilestones = STREAK_MILESTONES.filter(
      milestone => currentStreak >= milestone.days && !existingTypes.has(milestone.type)
    );
    
    if (newMilestones.length === 0) return;
    
    // Award new milestones
    for (const milestone of newMilestones) {
      // Insert streak achievement
      const { error: insertError } = await supabase
        .from('daily_streak_achievements')
        .insert({
          salesperson_id: salespersonId,
          streak_type: milestone.type,
          streak_count: currentStreak,
          xp_awarded: milestone.xp,
        });
      
      if (insertError && !insertError.message.includes('duplicate')) {
        console.error('Error inserting streak achievement:', insertError);
        continue;
      }
      
      // Award XP
      const { data: xpData } = await supabase
        .from('salesperson_xp')
        .select('total_xp, current_level, xp_to_next_level')
        .eq('salesperson_id', salespersonId)
        .single();
      
      if (xpData) {
        const newTotalXP = xpData.total_xp + milestone.xp;
        let newLevel = xpData.current_level;
        let newXPToNext = xpData.xp_to_next_level;
        
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
            updated_at: new Date().toISOString(),
          })
          .eq('salesperson_id', salespersonId);
        
        // Log XP history
        await supabase
          .from('xp_history')
          .insert({
            salesperson_id: salespersonId,
            xp_amount: milestone.xp,
            source_type: 'streak_achievement',
            description: `Conquista: ${milestone.title} (${milestone.days} dias)`,
          });
      }
      
      // Show celebration toast
      toast.success(`${milestone.icon} Conquista Desbloqueada!`, {
        description: `${milestone.title}: +${milestone.xp} XP`,
        duration: 5000,
      });
    }
    
    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ['streak-achievements'] });
    queryClient.invalidateQueries({ queryKey: ['daily-streak'] });
    queryClient.invalidateQueries({ queryKey: ['salesperson-xp'] });
    queryClient.invalidateQueries({ queryKey: ['xp-history'] });
  } catch (error) {
    console.error('Error checking streak milestones:', error);
  }
}

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
      const today = new Date().toISOString().split('T')[0];
      
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

      // Check if all daily challenges are now completed
      const { data: todaysChallenges } = await supabase
        .from('daily_challenges')
        .select('id')
        .eq('challenge_date', today)
        .eq('is_active', true);

      const { data: completedProgress } = await supabase
        .from('daily_challenge_progress')
        .select('challenge_id, xp_claimed')
        .eq('salesperson_id', salespersonId)
        .in('challenge_id', todaysChallenges?.map(c => c.id) || []);

      const allChallengesCompleted = todaysChallenges?.length === completedProgress?.filter(p => p.xp_claimed).length;

      return { xpReward, salespersonId, allChallengesCompleted };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenge-progress'] });
      queryClient.invalidateQueries({ queryKey: ['salesperson-xp'] });
      queryClient.invalidateQueries({ queryKey: ['xp-history'] });
      queryClient.invalidateQueries({ queryKey: ['daily-streak'] });
      queryClient.invalidateQueries({ queryKey: ['streak-achievements'] });
      toast.success(`+${data.xpReward} XP! Desafio diário completado!`);

      // If all challenges completed, check for streak milestones
      if (data.allChallengesCompleted) {
        toast.success('🎉 Todos os desafios do dia completados!', {
          description: 'Verificando conquistas de streak...',
          duration: 3000,
        });
        
        // Trigger streak milestone check
        await checkAndAwardStreakMilestones(data.salespersonId, queryClient);
      }
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
