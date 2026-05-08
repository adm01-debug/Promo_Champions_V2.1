
export type TemplateType = 'whatsapp' | 'email' | 'call';

export interface CadenceTemplate {
  id: string;
  name: string;
  type: TemplateType;
  content: string;
  requires_approval: boolean;
  variables: string[]; // e.g. ["singu_lead_name", "singu_last_purchase"]
  created_at: string;
  updated_at: string;
}

export interface ContactFrequencyConfig {
  quiet_hours_start: string; // "HH:mm"
  quiet_hours_end: string;
  max_calls_per_day: number;
  max_messages_per_day: number;
  min_interval_minutes: number;
  prioritize_human: boolean;
}

export interface PendingAction {
  id: string;
  lead_id: string;
  lead_name: string;
  template_id: string;
  template_name: string;
  type: TemplateType;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
