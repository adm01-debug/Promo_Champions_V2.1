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
