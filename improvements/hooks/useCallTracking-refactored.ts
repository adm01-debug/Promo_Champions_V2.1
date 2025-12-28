import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CallActivity {
  id: string;
  client_id: string;
  client_name: string;
  duration_seconds: number;
  outcome: 'answered' | 'voicemail' | 'no_answer' | 'busy';
  notes?: string;
  created_at: string;
}

interface CallTrackingStats {
  calls: CallActivity[];
  totalCalls: number;
  totalMinutes: number;
  avgCallDuration: number;
  answerRate: number;
  callsToday: number;
}

export const useCallTracking = () => {
  return useQuery<CallTrackingStats>({
    queryKey: ['call-tracking'],
    queryFn: async (): Promise<CallTrackingStats> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('activities')
        .select('*, clients(name)')
        .eq('type', 'call')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      if (!data) return {
        calls: [],
        totalCalls: 0,
        totalMinutes: 0,
        avgCallDuration: 0,
        answerRate: 0,
        callsToday: 0
      };
      
      const calls: CallActivity[] = data.map(activity => ({
        id: activity.id,
        client_id: activity.client_id,
        client_name: activity.clients?.name || 'Unknown',
        duration_seconds: activity.duration_seconds || 0,
        outcome: activity.outcome || 'no_answer',
        notes: activity.notes,
        created_at: activity.created_at
      }));
      
      const totalSeconds = calls.reduce((sum, c) => sum + c.duration_seconds, 0);
      const answeredCalls = calls.filter(c => c.outcome === 'answered').length;
      const today = new Date().toISOString().split('T')[0];
      const callsToday = calls.filter(c => c.created_at.startsWith(today)).length;
      
      return {
        calls,
        totalCalls: calls.length,
        totalMinutes: Math.round(totalSeconds / 60),
        avgCallDuration: calls.length > 0 ? Math.round(totalSeconds / calls.length) : 0,
        answerRate: calls.length > 0 ? (answeredCalls / calls.length) * 100 : 0,
        callsToday
      };
    }
  });
};
