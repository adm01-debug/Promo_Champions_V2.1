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

export interface Sale {
  id: string;
  fullId: string;
  cliente: string;
  produto: string;
  valor: number;
  status: string;
  statusLabel: string;
  data: string;
  created_at: string;
  client_id?: string | null;
  product_id?: string | null;
  salesperson_id?: string | null;
  sku?: string | null;
  ai_prediction_score?: number | null;
  ai_prediction_reasoning?: string | null;
  whatsapp_status?: string | null;
  whatsapp_last_interaction?: string | null;
}

export interface CreateSaleInput {
  client_id?: string;
  product_id?: string;
  client_name: string;
  product_name: string;
  amount: number;
  status?: string;
  category?: string;
  source?: string;
  salesperson_id?: string;
  sdr_id?: string;
  closer_id?: string;
  sku?: string;
  is_first_sale?: boolean;
}
