import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CS360Summary {
  total_accounts: number;
  avg_health_v2: number;
  open_tickets: number;
  urgent_tickets: number;
  renewals_90d: number;
  renewals_30d: number;
  renewals_at_risk: number;
  renewals_at_risk_value: number;
  avg_csat: number;
  avg_ces: number;
  onboarding_active: number;
  onboarding_stalled: number;
  onboarding_completed: number;
  expansion_opportunities: number;
  expansion_pipeline_value: number;
  upcoming_qbrs_30d: number;
}

export interface CS360AccountRow {
  id: string;
  name: string;
  tier: string;
  health_status: string;
  account_score: number;
  annual_revenue: number | null;
  health_v2: number;
  open_tickets: number;
  adoption_score: number | null;
  next_renewal: string | null;
  created_at: string;
}

export interface CS360Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  cancellation_reason: string | null;
}

export interface CS360Ticket {
  id: string;
  account_id: string;
  subject: string;
  status: string;
  priority: string;
  sentiment: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface CS360Renewal {
  id: string;
  account_id: string;
  contract_value: number;
  renewal_date: string;
  status: string;
  owner_salesperson_id: string | null;
  auto_renew: boolean;
}

export interface CS360UsageRow {
  account_id: string;
  dau: number;
  wau: number;
  mau: number;
  last_login_at: string | null;
  top_features: unknown;
  adoption_score: number;
}

export interface CS360OnboardingRow {
  id: string;
  account_id: string;
  status: string;
  current_step: number;
  total_steps: number;
  started_at: string | null;
  completed_at: string | null;
  owner_salesperson_id: string | null;
}

export interface CS360ExpansionRow {
  id: string;
  account_id: string;
  type: string;
  estimated_value: number;
  status: string;
  confidence_score: number;
  owner_salesperson_id: string | null;
  created_at: string;
}

export interface CS360SurveyRow {
  id: string;
  account_id: string | null;
  survey_type: "csat" | "ces";
  score: number | null;
  comment: string | null;
  sent_at: string;
  responded_at: string | null;
}

export interface CS360QBRRow {
  id: string;
  account_id: string;
  frequency: string;
  next_qbr_at: string | null;
  last_qbr_at: string | null;
  owner_salesperson_id: string | null;
  is_active: boolean;
}

export interface CS360Response {
  summary: CS360Summary;
  accounts: CS360AccountRow[];
  tickets: CS360Ticket[];
  renewals: CS360Renewal[];
  usage: CS360UsageRow[];
  onboarding: CS360OnboardingRow[];
  expansion: CS360ExpansionRow[];
  surveys: CS360SurveyRow[];
  qbrs: CS360QBRRow[];
}

export function useCustomerSuccess360() {
  return useQuery({
    queryKey: ["customer-success-360"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<CS360Response>("customer-success-360", { body: {} });
      if (error) throw error;
      return data!;
    },
    staleTime: 5 * 60 * 1000,
  });
}
