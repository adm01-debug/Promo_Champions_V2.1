import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export type ActionType = 'email' | 'call' | 'linkedin' | 'whatsapp' | 'meeting' | 'task' | 'other';
export type CadenceStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export type CadenceTaskStatus = 'pending' | 'completed' | 'skipped';

export interface Cadence {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CadenceStep {
  id: string;
  cadence_id: string;
  day_number: number;
  action_type: ActionType;
  title: string;
  description: string | null;
  template_content: string | null;
  step_order: number;
  created_at: string;
}

export interface ProspectCadence {
  id: string;
  sale_id: string;
  cadence_id: string;
  salesperson_id: string | null;
  status: CadenceStatus;
  funnel_stage: 'new' | 'high_interest' | 'waiting_approval' | 'scheduled';
  started_at: string;
  current_step: number;
  next_action_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CadenceTask {
  id: string;
  prospect_cadence_id: string;
  cadence_step_id: string;
  scheduled_date: string;
  status: CadenceTaskStatus;
  task_type: 'manual' | 'automatic';
  completed_at: string | null;
  notes: string | null;
  created_at: string;
}

export function useCadences() {
  return useQuery({
    queryKey: ["cadences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cadences")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Cadence[];
    },
  });
}

export function useCadenceSteps(cadenceId: string | undefined) {
  return useQuery({
    queryKey: ["cadence-steps", cadenceId],
    enabled: !!cadenceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cadence_steps")
        .select("*")
        .eq("cadence_id", cadenceId!)
        .order("step_order", { ascending: true });

      if (error) throw error;
      return data as CadenceStep[];
    },
  });
}

export function useProspectCadences(saleId?: string) {
  return useQuery({
    queryKey: ["prospect-cadences", saleId],
    queryFn: async () => {
      let query = supabase
        .from("prospect_cadences")
        .select("*")
        .order("created_at", { ascending: false });

      if (saleId) {
        query = query.eq("sale_id", saleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProspectCadence[];
    },
  });
}

export function useActiveCadencesBySaleIds(saleIds: string[]) {
  return useQuery({
    queryKey: ["active-cadences-by-sales", saleIds],
    enabled: saleIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prospect_cadences")
        .select(`
          sale_id,
          status,
          current_step,
          cadence:cadences(name)
        `)
        .in("sale_id", saleIds)
        .in("status", ["active", "paused"]);

      if (error) throw error;
      
      const cadenceMap: Record<string, { cadenceName: string; currentStep: number; status: 'active' | 'paused' }> = {};
      data?.forEach(pc => {
        if (!pc.sale_id) return;
        const cadenceData = pc.cadence as { name: string } | null;
        cadenceMap[pc.sale_id] = {
          cadenceName: cadenceData?.name || "Cadência",
          currentStep: pc.current_step,
          status: pc.status as 'active' | 'paused',
        };
      });
      
      return cadenceMap;
    },
  });
}

export function useTodaysCadenceTasks() {
  return useQuery({
    queryKey: ["todays-cadence-tasks"],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("cadence_tasks")
        .select(`
          *,
          cadence_step:cadence_steps(*),
          prospect_cadence:prospect_cadences(
            *,
            sale:sales(*),
            cadence:cadences(*)
          )
        `)
        .eq("status", "pending")
        .order("priority", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCadenceStats() {
  return useQuery({
    queryKey: ["cadence-stats"],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");

      const { count: prospectsInCadence } = await supabase
        .from("prospect_cadences")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const { count: tasksCompletedToday } = await supabase
        .from("cadence_tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("completed_at", `${today}T00:00:00`)
        .lte("completed_at", `${today}T23:59:59`);

      const { data: autoPaused } = await supabase
        .rpc("get_auto_paused_count", { _days: 7 });

      return {
        prospectsInCadence: prospectsInCadence || 0,
        tasksCompletedToday: tasksCompletedToday || 0,
        autoPausedLast7Days: (autoPaused as number) || 0,
      };
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export interface FunnelRule {
  id: string;
  cadence_id: string | null;
  from_stage: string;
  to_stage: string;
  condition_type: 'email_open' | 'quote_open' | 'price_click' | 'reply' | 'manual';
  condition_value: number;
  time_window_hours: number;
  is_active: boolean;
  notify_push: boolean;
  notify_email: boolean;
  alert_priority: 'low' | 'normal' | 'high' | 'urgent';
}

export function useFunnelRules(cadenceId?: string) {
  return useQuery({
    queryKey: ["funnel-rules", cadenceId],
    queryFn: async () => {
      let query = supabase
        .from("cadence_funnel_rules")
        .select("*")
        .order("created_at", { ascending: true });

      if (cadenceId) {
        query = query.eq("cadence_id", cadenceId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FunnelRule[];
    },
  });
}
