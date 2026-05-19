import { supabase } from "@/integrations/supabase/client";
import { ActivityRecord, ActivityStats, ActivityType, ActivityOutcome } from "@/types/activity";

export const activityService = {
  async getActivities(filters?: { userId?: string; clientId?: string }): Promise<ActivityRecord[]> {
    let query = supabase.from('activities').select('*').order('created_at', { ascending: false });
    if (filters?.userId) query = query.eq('salesperson_id', filters.userId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as ActivityRecord[];
  },

  async getRecentActivities(limit: number = 100): Promise<ActivityRecord[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []) as ActivityRecord[];
  },

  async getActivityStats(salespersonId?: string): Promise<ActivityStats> {
    const today = new Date().toISOString().split('T')[0];
    let query = supabase.from('activities').select('*');
    if (salespersonId) query = query.eq('salesperson_id', salespersonId);
    
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
      if (a.activity_type in byType) byType[a.activity_type]++;
      if (a.outcome in byOutcome) byOutcome[a.outcome]++;
      if (a.activity_type in byTypeOutcome && a.outcome in byTypeOutcome[a.activity_type]) {
        byTypeOutcome[a.activity_type][a.outcome]++;
      }
      if (a.duration_minutes) {
        totalDuration += a.duration_minutes;
        durationCount++;
      }
    });

    const todayByType = { call: 0, email: 0, meeting: 0, linkedin: 0, whatsapp: 0, note: 0, other: 0 };
    const todayByOutcome = { connected: 0, scheduled: 0 };
    todayActivities.forEach(a => {
      if (a.activity_type in todayByType) todayByType[a.activity_type as keyof typeof todayByType]++;
      if (a.outcome === 'connected') todayByOutcome.connected++;
      if (a.outcome === 'scheduled') todayByOutcome.scheduled++;
    });

    return {
      total: activities.length, byType, byOutcome, byTypeOutcome,
      avgDuration: durationCount > 0 ? totalDuration / durationCount : 0,
      totalToday: todayActivities.length,
      callsToday: todayByType.call, emailsToday: todayByType.email, meetingsToday: todayByType.meeting,
      linkedinToday: todayByType.linkedin, whatsappToday: todayByType.whatsapp, notesToday: todayByType.note,
      connectedToday: todayByOutcome.connected, scheduledToday: todayByOutcome.scheduled,
    };
  },

  async createActivity(input: any) {
    const { data, error } = await supabase.from('activities').insert(input).select().single();
    if (error) throw error;
    return data;
  }
};
