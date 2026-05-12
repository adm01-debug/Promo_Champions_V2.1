// Activity types and hooks
import { CACHE_TIMES } from '@/constants';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIndexEntity } from '@/hooks/semantic/useIndexEntity';

// Types matching database schema
export type ActivityType = 'call' | 'email' | 'meeting' | 'linkedin' | 'whatsapp' | 'note' | 'other';
export type ActivityOutcome = 'connected' | 'no_answer' | 'scheduled' | 'voicemail' | 'busy' | 'callback' | 'not_interested' | 'qualified' | 'bad_timing' | 'wrong_person' | 'unsubscribed';

export interface ActivityRecord {
  id: string;
  activity_type: ActivityType;
  outcome: ActivityOutcome;
  contact_name: string | null;
  notes: string | null;
  duration_minutes: number | null;
  sale_id: string | null;
  salesperson_id: string | null;
  created_at: string;
}

export interface ActivityStats {
  total: number;
  byType: Record<ActivityType, number>;
  byOutcome: Record<ActivityOutcome, number>;
  avgDuration: number;
  byTypeOutcome: Record<ActivityType, Record<ActivityOutcome, number>>;
  // Today stats for ActivityStats component
  totalToday: number;
  callsToday: number;
  emailsToday: number;
  meetingsToday: number;
  linkedinToday: number;
  whatsappToday: number;
  notesToday: number;
  connectedToday: number;
  scheduledToday: number;
}

interface UseActivitiesOptions {
  userId?: string;
  clientId?: string;
}

export const useActivities = (filters?: UseActivitiesOptions) => {
  return useQuery<ActivityRecord[]>({
    queryKey: ['activities', filters],
    queryFn: async (): Promise<ActivityRecord[]> => {
      let query = supabase.from('activities').select('*').order('created_at', { ascending: false });

      if (filters?.userId) {
        query = query.eq('salesperson_id', filters.userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ActivityRecord[];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const useRecentActivities = (limit: number = 100) => {
  return useQuery<ActivityRecord[]>({
    queryKey: ['activities', 'recent', limit],
    queryFn: async (): Promise<ActivityRecord[]> => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return (data || []) as ActivityRecord[];
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const useActivityStats = (salespersonId?: string) => {
  return useQuery<ActivityStats>({
    queryKey: ['activity-stats', salespersonId],
    queryFn: async (): Promise<ActivityStats> => {
      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase.from('activities').select('*');
      
      if (salespersonId) {
        query = query.eq('salesperson_id', salespersonId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const activities = (data || []) as ActivityRecord[];
      const todayActivities = activities.filter(a => a.created_at.startsWith(today));
      
      const byType: Record<ActivityType, number> = {
        call: 0, email: 0, meeting: 0, linkedin: 0, whatsapp: 0, note: 0, other: 0
      };
      
      const byOutcome: Record<ActivityOutcome, number> = {
        connected: 0, no_answer: 0, scheduled: 0, voicemail: 0,
        busy: 0, callback: 0, not_interested: 0, qualified: 0,
        bad_timing: 0, wrong_person: 0, unsubscribed: 0
      };
      
      const byTypeOutcome: Record<ActivityType, Record<ActivityOutcome, number>> = {
        call: { connected: 0, no_answer: 0, scheduled: 0, voicemail: 0, busy: 0, callback: 0, not_interested: 0, qualified: 0, bad_timing: 0, wrong_person: 0, unsubscribed: 0 },
        email: { connected: 0, no_answer: 0, scheduled: 0, voicemail: 0, busy: 0, callback: 0, not_interested: 0, qualified: 0, bad_timing: 0, wrong_person: 0, unsubscribed: 0 },
        meeting: { connected: 0, no_answer: 0, scheduled: 0, voicemail: 0, busy: 0, callback: 0, not_interested: 0, qualified: 0, bad_timing: 0, wrong_person: 0, unsubscribed: 0 },
        linkedin: { connected: 0, no_answer: 0, scheduled: 0, voicemail: 0, busy: 0, callback: 0, not_interested: 0, qualified: 0, bad_timing: 0, wrong_person: 0, unsubscribed: 0 },
        whatsapp: { connected: 0, no_answer: 0, scheduled: 0, voicemail: 0, busy: 0, callback: 0, not_interested: 0, qualified: 0, bad_timing: 0, wrong_person: 0, unsubscribed: 0 },
        note: { connected: 0, no_answer: 0, scheduled: 0, voicemail: 0, busy: 0, callback: 0, not_interested: 0, qualified: 0, bad_timing: 0, wrong_person: 0, unsubscribed: 0 },
        other: { connected: 0, no_answer: 0, scheduled: 0, voicemail: 0, busy: 0, callback: 0, not_interested: 0, qualified: 0, bad_timing: 0, wrong_person: 0, unsubscribed: 0 },
      };
      
      let totalDuration = 0;
      let durationCount = 0;
      
      activities.forEach(a => {
        if (a.activity_type in byType) {
          byType[a.activity_type]++;
        }
        if (a.outcome in byOutcome) {
          byOutcome[a.outcome]++;
        }
        if (a.activity_type in byTypeOutcome && a.outcome in byTypeOutcome[a.activity_type]) {
          byTypeOutcome[a.activity_type][a.outcome]++;
        }
        if (a.duration_minutes) {
          totalDuration += a.duration_minutes;
          durationCount++;
        }
      });
      
      // Today stats
      const todayByType: Record<ActivityType, number> = {
        call: 0, email: 0, meeting: 0, linkedin: 0, whatsapp: 0, note: 0, other: 0
      };
      const todayByOutcome: Record<ActivityOutcome, number> = {
        connected: 0, no_answer: 0, scheduled: 0, voicemail: 0,
        busy: 0, callback: 0, not_interested: 0, qualified: 0,
        bad_timing: 0, wrong_person: 0, unsubscribed: 0
      };
      
      todayActivities.forEach(a => {
        if (a.activity_type in todayByType) {
          todayByType[a.activity_type]++;
        }
        if (a.outcome in todayByOutcome) {
          todayByOutcome[a.outcome]++;
        }
      });
      
      return {
        total: activities.length,
        byType,
        byOutcome,
        byTypeOutcome,
        avgDuration: durationCount > 0 ? totalDuration / durationCount : 0,
        totalToday: todayActivities.length,
        callsToday: todayByType.call,
        emailsToday: todayByType.email,
        meetingsToday: todayByType.meeting,
        linkedinToday: todayByType.linkedin,
        whatsappToday: todayByType.whatsapp,
        notesToday: todayByType.note,
        connectedToday: todayByOutcome.connected,
        scheduledToday: todayByOutcome.scheduled,
      };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const useSDRLeaderboard = () => {
  return useQuery({
    queryKey: ['sdr-leaderboard'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('activities')
        .select('salesperson_id, salespeople:salesperson_id(name, avatar_url)')
        .gte('created_at', today);
      
      if (error) throw error;
      
      const counts: Record<string, { id: string; name: string; avatar: string | null; count: number }> = {};
      
      (data || []).forEach((a: any) => {
        const id = a.salesperson_id;
        if (!id) return;
        if (!counts[id]) {
          counts[id] = { 
            id, 
            name: a.salespeople?.name || 'Vendedor', 
            avatar: a.salespeople?.avatar_url,
            count: 0 
          };
        }
        counts[id].count++;
      });
      
      return Object.values(counts).sort((a, b) => b.count - a.count);
    },
    staleTime: 60000,
  });
};

export const useActivityGoals = (salespersonId?: string) => {
  return useQuery({
    queryKey: ['activity-goals', salespersonId],
    queryFn: async () => {
      if (!salespersonId) return null;
      const { data, error } = await supabase
        .from('activity_goals')
        .select('*')
        .eq('salesperson_id', salespersonId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!salespersonId,
  });
};

export const useUpdateActivityGoals = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      salesperson_id: string;
      calls_goal?: number;
      emails_goal?: number;
      meetings_goal?: number;
      linkedin_goal?: number;
      whatsapp_goal?: number;
    }) => {
      const { data, error } = await supabase
        .from('activity_goals')
        .upsert(input, { onConflict: 'salesperson_id' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activity-goals', variables.salesperson_id] });
      toast.success("Metas atualizadas!");
    },
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  const { index } = useIndexEntity();

  return useMutation({
    mutationFn: async (input: {
      activity_type: ActivityType;
      outcome: ActivityOutcome;
      contact_name?: string;
      notes?: string;
      duration_minutes?: number;
      sale_id?: string;
      client_id?: string;
      salesperson_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('activities')
        .insert([input as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity-stats'] });
      queryClient.invalidateQueries({ queryKey: ['sdr-leaderboard'] });
      if (data?.id) index('activity', data.id);
    },
  });
};
