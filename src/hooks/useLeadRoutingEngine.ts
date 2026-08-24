import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RoutingRule {
  id: string;
  name: string;
  strategy: string;
  priority: number;
  is_active: boolean;
  filter_min_value: number | null;
  filter_state: string | null;
  filter_source: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadAssignment {
  id: string;
  sale_id: string;
  salesperson_id: string;
  rule_id: string | null;
  strategy_used: string;
  assigned_at: string;
}

export function useRoutingRules() {
  return useQuery({
    queryKey: ["routing-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_routing_rules")
        .select("*")
        .order("priority");
      if (error) throw error;
      return data as RoutingRule[];
    },
  });
}

export function useLeadAssignments(limit = 50) {
  return useQuery({
    queryKey: ["lead-assignments", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_assignments")
        .select("*")
        .order("assigned_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as LeadAssignment[];
    },
  });
}

export function useToggleRoutingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("lead_routing_rules")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Regra atualizada");
      qc.invalidateQueries({ queryKey: ["routing-rules"] });
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
}

export function useAutoAssignLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (saleId: string) => {
      const { data, error } = await supabase.rpc("auto_assign_lead", { _sale_id: saleId });
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      toast.success("Lead atribuído automaticamente");
      qc.invalidateQueries({ queryKey: ["lead-assignments"] });
      qc.invalidateQueries({ queryKey: ["sales"] });
    },
    onError: (e: Error) => toast.error(`Falha ao atribuir: ${e.message}`),
  });
}
