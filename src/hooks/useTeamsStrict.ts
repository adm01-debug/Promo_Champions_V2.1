import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Team {
  id: string;
  name: string;
  description?: string;
  manager_id: string;
  created_at: string;
}

export interface TeamMember {
  user_id: string;
  team_id: string;
  role: 'member' | 'lead' | 'manager';
  joined_at: string;
  user: {
    email: string;
    avatar_url?: string;
  };
}

export const useTeams = () => {
  return useQuery<Team[], Error>({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Team[];
    },
  });
};

export const useTeam = (teamId: string) => {
  return useQuery<Team, Error>({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();
      
      if (error) throw error;
      return data as Team;
    },
    enabled: !!teamId,
  });
};

export const useTeamMembers = (teamId: string) => {
  return useQuery<TeamMember[], Error>({
    queryKey: ['teamMembers', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          user:users(email, avatar_url)
        `)
        .eq('team_id', teamId);
      
      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!teamId,
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { teamId: string; userId: string; role: string }>({
    mutationFn: async ({ teamId, userId, role }) => {
      const { error } = await supabase
        .from('team_members')
        .insert({ team_id: teamId, user_id: userId, role });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers', variables.teamId] });
    },
  });
};
