import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  title: string;
  description?: string;
  duration?: number;
  outcome?: string;
  deal_id?: string;
  client_id?: string;
  user_id: string;
  created_at: string;
  scheduled_at?: string;
}

export const useActivities = (filters?: {
  userId?: string;
  dealId?: string;
  clientId?: string;
  type?: Activity['type'];
  limit?: number;
}) => {
  return useQuery<Activity[], Error>({
    queryKey: ['activities', filters],
    queryFn: async () => {
      let query = supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      
      if (filters?.dealId) {
        query = query.eq('deal_id', filters.dealId);
      }
      
      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId);
      }
      
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Activity[];
    },
  });
};

export const useLogActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Activity, Error, Omit<Activity, 'id' | 'created_at'>>({
    mutationFn: async (activity) => {
      const { data, error } = await supabase
        .from('activities')
        .insert(activity)
        .select()
        .single();
      
      if (error) throw error;
      return data as Activity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useActivityStats = (userId: string, days: number = 30) => {
  return useQuery<{
    totalActivities: number;
    byType: Record<Activity['type'], number>;
    avgPerDay: number;
  }, Error>({
    queryKey: ['activityStats', userId, days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('activities')
        .select('type')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString());
      
      if (error) throw error;
      
      const byType: Record<Activity['type'], number> = {
        call: 0,
        email: 0,
        meeting: 0,
        note: 0,
        task: 0,
      };
      
      data?.forEach(a => {
        byType[a.type]++;
      });
      
      return {
        totalActivities: data?.length || 0,
        byType,
        avgPerDay: (data?.length || 0) / days,
      };
    },
  });
};
