import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Team {
  id: string;
  name: string;
  members: number;
}

export function useTeams() {
  return useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async (): Promise<Team[]> => {
      const { data, error } = await supabase.from('teams').select('*');
      if (error) throw error;
      return data ?? [];
    }
  });
}
