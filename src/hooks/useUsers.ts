import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface UserRecord {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'salesperson';
  created_at: string;
  updated_at: string;
}

export const useUsers = () => {
  return useQuery<UserRecord[]>({
    queryKey: ['users'],
    queryFn: async (): Promise<UserRecord[]> => {
      // Use user_roles table since there's no users table
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');
      
      if (error) throw error;
      
      return (data || []).map(ur => ({
        id: ur.id,
        email: ur.user_id, // user_id is the reference
        role: ur.role,
        created_at: ur.created_at,
        updated_at: ur.updated_at,
      })) as UserRecord[];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
