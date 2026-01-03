import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CACHE_TIMES } from '@/constants';

export interface TeamMission {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  xpReward: number;
  deadline: string;
  participants: { id: string; name: string; contribution: number }[];
  status: 'active' | 'completed' | 'failed';
  missionType: 'revenue' | 'deals' | 'activities' | 'clients';
}

export interface CollaborativeMissionsResult {
  activeMissions: TeamMission[];
  completedMissions: TeamMission[];
  userContribution: number;
  teamProgress: number;
}

export function useCollaborativeMissions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['collaborative-missions'],
    queryFn: async (): Promise<CollaborativeMissionsResult> => {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      // Buscar weekly challenges como missões
      const { data: challenges, error: challengesError } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('is_active', true);

      if (challengesError) throw challengesError;

      // Buscar progresso
      const { data: progress, error: progressError } = await supabase
        .from('challenge_progress')
        .select('challenge_id, salesperson_id, current_value, completed_at');

      if (progressError) throw progressError;

      // Buscar salespeople para nomes
      const { data: salespeople, error: spError } = await supabase
        .from('salespeople')
        .select('id, name');

      if (spError) throw spError;

      // Processar missões
      const missions: TeamMission[] = (challenges || []).map(challenge => {
        const missionProgress = progress?.filter(p => p.challenge_id === challenge.id) || [];
        const totalContribution = missionProgress.reduce((sum, p) => sum + p.current_value, 0);
        
        const participants = missionProgress.map(p => {
          const sp = salespeople?.find(s => s.id === p.salesperson_id);
          return {
            id: p.salesperson_id,
            name: sp?.name || 'Desconhecido',
            contribution: p.current_value,
          };
        }).sort((a, b) => b.contribution - a.contribution);

        const isCompleted = totalContribution >= challenge.target_value;
        const deadline = new Date(challenge.end_date);
        const isFailed = !isCompleted && deadline < now;

        return {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description || '',
          targetValue: challenge.target_value,
          currentValue: totalContribution,
          xpReward: challenge.xp_reward,
          deadline: deadline.toISOString(),
          participants,
          status: isCompleted ? 'completed' : isFailed ? 'failed' : 'active',
          missionType: challenge.challenge_type as TeamMission['missionType'],
        };
      });

      const activeMissions = missions.filter(m => m.status === 'active');
      const completedMissions = missions.filter(m => m.status === 'completed');

      // Contribuição do usuário atual
      const userProgress = progress?.filter(p => {
        const sp = salespeople?.find(s => s.id === p.salesperson_id);
        return sp?.id === user?.id;
      });
      const userContribution = userProgress?.reduce((sum, p) => sum + p.current_value, 0) || 0;

      // Progresso geral do time
      const totalTarget = activeMissions.reduce((sum, m) => sum + m.targetValue, 0);
      const totalCurrent = activeMissions.reduce((sum, m) => sum + m.currentValue, 0);
      const teamProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

      return {
        activeMissions,
        completedMissions,
        userContribution,
        teamProgress,
      };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
    enabled: !!user,
  });
}
