// Melhoria 2.10 - useActivities.ts REFATORADO
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  title: string;
  description?: string;
  deal_id?: string;
  client_id?: string;
  user_id: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface ActivityFilters {
  type?: Activity['type'];
  deal_id?: string;
  user_id?: string;
  limit?: number;
}

export const useActivities = (filters?: ActivityFilters) => {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: async () => {
      let query = supabase.from('activities').select('*');
      
      if (filters?.type) query = query.eq('type', filters.type);
      if (filters?.deal_id) query = query.eq('deal_id', filters.deal_id);
      if (filters?.user_id) query = query.eq('user_id', filters.user_id);
      if (filters?.limit) query = query.limit(filters.limit);
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Activity[];
    },
  });
};
