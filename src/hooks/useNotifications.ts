import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useNotifications = (userId?: string) => {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      let q = supabase.from('notifications').select('*');
      if (userId) q = q.eq('user_id', userId);
      const { data } = await q;
      return data || [];
    }
  });
};
