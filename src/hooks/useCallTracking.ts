import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CallTracking {
  id: string;
  user_id: string;
  client_id?: string;
  duration: number;
  outcome: 'answered' | 'no_answer' | 'voicemail' | 'busy';
  recording_url?: string;
  notes?: string;
  created_at: string;
}

export const useCallTracking = (userId?: string) => {
  return useQuery({
    queryKey: ['callTracking', userId],
    queryFn: async () => {
      let query = supabase
        .from('call_tracking')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as CallTracking[];
    },
  });
};

export const useCallStats = (userId: string) => {
  return useQuery({
    queryKey: ['callStats', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('call_tracking')
        .select('outcome, duration')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      const total = data.length;
      const answered = data.filter(c => c.outcome === 'answered').length;
      const avgDuration = data.reduce((acc, c) => acc + c.duration, 0) / total;
      
      return {
        total,
        answered,
        answerRate: (answered / total) * 100,
        avgDuration,
      };
    },
  });
};
