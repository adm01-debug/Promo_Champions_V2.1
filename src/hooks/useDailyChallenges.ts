import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useDailyChallenges = () => {
  const { salesperson } = useAuth();
  
  return useQuery({
    queryKey: ['daily-challenges', salesperson?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: challenges } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today)
        .eq('is_active', true);

      if (!challenges || !salesperson?.id) return [];

      const { data: progress } = await supabase
        .from('daily_challenge_progress')
        .select('*')
        .eq('salesperson_id', salesperson.id)
        .in('challenge_id', challenges.map(c => c.id));

      return challenges.map(challenge => ({
        ...challenge,
        progress: progress?.find(p => p.challenge_id === challenge.id) || null,
      }));
    },
    enabled: !!salesperson?.id,
  });
};

export const useDailyChallengesWithProgress = (salespersonId?: string) => {
  return useQuery({
    queryKey: ['daily-challenges-with-progress', salespersonId],
    queryFn: async () => {
      if (!salespersonId) return [];
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data: challenges } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today)
        .eq('is_active', true);

      if (!challenges) return [];

      const { data: progress } = await supabase
        .from('daily_challenge_progress')
        .select('*')
        .eq('salesperson_id', salespersonId)
        .in('challenge_id', challenges.map(c => c.id));

      return challenges.map(challenge => ({
        ...challenge,
        progress: progress?.find(p => p.challenge_id === challenge.id) || null,
      }));
    },
    enabled: !!salespersonId,
  });
};

export const useClaimDailyChallengeReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ challengeId, salespersonId, xpReward }: { 
      challengeId: string; 
      salespersonId: string; 
      xpReward: number 
    }) => {
      if (!salespersonId) throw new Error('User not found');

      const { error } = await supabase
        .from('daily_challenge_progress')
        .update({ xp_claimed: true })
        .eq('challenge_id', challengeId)
        .eq('salesperson_id', salespersonId);

      if (error) throw error;
      
      return { challengeId, salespersonId, xpReward };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['daily-challenges-with-progress'] });
    },
  });
};

export const getDailyChallengeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    calls: '📞',
    meetings: '🤝',
    emails: '📧',
    deals: '💰',
    activities: '⚡',
    whatsapp: '💬',
    linkedin: '💼',
    default: '🎯',
  };
  return icons[type] || icons.default;
};

export const getDailyChallengeColor = (type: string): string => {
  const colors: Record<string, string> = {
    calls: 'from-blue-500 to-blue-600',
    meetings: 'from-green-500 to-green-600',
    emails: 'from-purple-500 to-purple-600',
    deals: 'from-amber-500 to-amber-600',
    activities: 'from-rose-500 to-rose-600',
    whatsapp: 'from-emerald-500 to-emerald-600',
    linkedin: 'from-sky-500 to-sky-600',
    default: 'from-gray-500 to-gray-600',
  };
  return colors[type] || colors.default;
};
