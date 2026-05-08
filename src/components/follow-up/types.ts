import { Flame, ThermometerSun, Snowflake } from 'lucide-react';

export type LeadTemperature = 'hot' | 'warm' | 'cold' | 'frozen';

export interface ColdLead {
  id: string;
  client_name: string;
  product_name: string;
  amount: number;
  status: string;
  updated_at: string;
  salesperson_id?: string;
  days_inactive: number;
  temperature: LeadTemperature;
  suggested_action: string;
  suggested_channel: string;
  last_activity?: {
    notes: string;
    created_at: string;
    type: string;
  };
  score?: number;
  probability?: number;
  has_pending_task?: boolean;
  follow_up_count?: number;
}

export const temperatureConfig: Record<LeadTemperature, {
  label: string;
  icon: typeof Flame;
  colorClass: string;
  bgClass: string;
  emoji: string;
}> = {
  hot: { label: 'Quente', icon: Flame, colorClass: 'text-destructive', bgClass: 'bg-destructive/10', emoji: '🔥' },
  warm: { label: 'Morno', icon: ThermometerSun, colorClass: 'text-status-warning', bgClass: 'bg-status-warning/10', emoji: '🌡️' },
  cold: { label: 'Frio', icon: Snowflake, colorClass: 'text-status-info', bgClass: 'bg-status-info/10', emoji: '❄️' },
  frozen: { label: 'Congelado', icon: Snowflake, colorClass: 'text-primary', bgClass: 'bg-primary/10', emoji: '🧊' },
};

export function getTemperature(daysInactive: number): LeadTemperature {
  if (daysInactive <= 3) return 'hot';
  if (daysInactive <= 7) return 'warm';
  if (daysInactive <= 14) return 'cold';
  return 'frozen';
}

export function getSuggestedAction(temp: LeadTemperature): { action: string; channel: string } {
  const actions: Record<LeadTemperature, { action: string; channel: string }> = {
    hot: { action: 'Enviar proposta ou agendar reunião de fechamento', channel: 'call' },
    warm: { action: 'Check-in personalizado com valor agregado', channel: 'email' },
    cold: { action: 'Re-engajar com novo insight ou case de sucesso', channel: 'whatsapp' },
    frozen: { action: 'Campanha de reativação com oferta especial', channel: 'email' },
  };
  return actions[temp];
}
