// Melhoria 2.8 - useTeams.ts REFATORADO
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Team {
  id: string;
  name: string;
  manager_id: string;
  members: TeamMember[];
  goals: TeamGoal[];
}

interface TeamMember {
  user_id: string;
  name: string;
  role: string;
  avatar_url?: string;
}

interface TeamGoal {
  id: string;
  target: number;
  current: number;
  deadline: string;
}

export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*, members:team_members(*), goals:team_goals(*)');
      
      if (error) throw error;
      return data as Team[];
    },
  });
};
