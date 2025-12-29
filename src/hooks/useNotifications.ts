import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';


export const useNotifications = (userId?: string) => {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      let q = supabase.from('notifications').select('*');
      if (userId) q = q.eq('user_id', userId);
      const { data } = await q;
      return data || [];
    }
  ,
    staleTime: CACHE_TIMES.STALE_TIME
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
