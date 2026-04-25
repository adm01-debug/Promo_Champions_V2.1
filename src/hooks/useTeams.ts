import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  role: string;
  avatar_url: string | null;
}

export interface TeamCloser {
  id: string;
  closer_id: string;
  salesperson: TeamMember;
}

export interface Team {
  id: string;
  name: string;
  sdr_id: string | null;
  sdr: TeamMember | null;
  is_active: boolean;
  inactivity_days: number;
  closers: TeamCloser[];
  created_at: string;
}

export const useTeams = () => {
  return useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async (): Promise<Team[]> => {
      const { data: teams, error } = await supabase
        .from('teams')
        .select(`
          *,
          sdr:salespeople!teams_sdr_id_fkey(id, name, email, role, avatar_url),
          closers:team_closers(
            id,
            closer_id,
            salesperson:salespeople(id, name, email, role, avatar_url)
          )
        `);
      
      if (error) throw error;
      
      return (teams || []).map(t => ({
        id: t.id,
        name: t.name,
        sdr_id: t.sdr_id,
        sdr: t.sdr as TeamMember | null,
        is_active: t.is_active ?? true,
        inactivity_days: t.inactivity_days ?? 365,
        closers: (t.closers || []) as TeamCloser[],
        created_at: t.created_at,
      }));
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: { 
      name: string; 
      sdr_id?: string | null; 
      inactivity_days?: number;
      closer_ids?: string[];
    }) => {
      const { data, error } = await supabase
        .from('teams')
        .insert({ 
          name: input.name,
          sdr_id: input.sdr_id || null,
          inactivity_days: input.inactivity_days || 365,
          is_active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add closers if provided
      if (input.closer_ids && input.closer_ids.length > 0) {
        await supabase
          .from('team_closers')
          .insert(input.closer_ids.map(closerId => ({
            team_id: data.id,
            closer_id: closerId,
          })));
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      name, 
      sdr_id, 
      is_active, 
      inactivity_days,
      closer_ids 
    }: { 
      id: string; 
      name?: string; 
      sdr_id?: string | null;
      is_active?: boolean;
      inactivity_days?: number;
      closer_ids?: string[];
    }) => {
      const updates: TableUpdate<'teams'> = {};
      if (name !== undefined) updates.name = name;
      if (sdr_id !== undefined) updates.sdr_id = sdr_id;
      if (is_active !== undefined) updates.is_active = is_active;
      if (inactivity_days !== undefined) updates.inactivity_days = inactivity_days;
      
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('teams')
          .update(updates)
          .eq('id', id);
        
        if (error) throw error;
      }
      
      if (closer_ids) {
        // Remove existing closers
        await supabase.from('team_closers').delete().eq('team_id', id);
        
        // Add new closers
        if (closer_ids.length > 0) {
          await supabase
            .from('team_closers')
            .insert(closer_ids.map(closerId => ({
              team_id: id,
              closer_id: closerId,
            })));
        }
      }
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useAvailableClosers = () => {
  return useQuery<TeamMember[]>({
    queryKey: ['available-closers'],
    queryFn: async (): Promise<TeamMember[]> => {
      const { data, error } = await supabase
        .from('salespeople')
        .select('id, name, email, role, avatar_url')
        .eq('is_active', true)
        .in('role', ['closer', 'hybrid']);
      
      if (error) throw error;
      return (data || []) as TeamMember[];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (teamId: string) => {
      // Delete team closers first
      await supabase.from('team_closers').delete().eq('team_id', teamId);
      
      // Then delete the team
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};
