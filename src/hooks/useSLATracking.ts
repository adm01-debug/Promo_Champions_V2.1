import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SLAPolicy {
  id: string;
  stage: string;
  max_hours: number;
  warning_hours: number;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SLAViolation {
  id: string;
  sale_id: string;
  policy_id: string | null;
  stage: string;
  hours_in_stage: number;
  status: string;
  detected_at: string;
  resolved_at: string | null;
}

export function useSLAPolicies() {
  return useQuery({
    queryKey: ["sla-policies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sla_policies").select("*").order("stage");
      if (error) throw error;
      return data as SLAPolicy[];
    },
  });
}

export function useSLAViolations() {
  return useQuery({
    queryKey: ["sla-violations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sla_violations")
        .select("*")
        .is("resolved_at", null)
        .order("detected_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as SLAViolation[];
    },
  });
}

export function useUpdateSLAPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; max_hours: number; warning_hours: number; is_active: boolean }) => {
      const { error } = await supabase
        .from("sla_policies")
        .update({ max_hours: params.max_hours, warning_hours: params.warning_hours, is_active: params.is_active })
        .eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Política SLA atualizada");
      qc.invalidateQueries({ queryKey: ["sla-policies"] });
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
}

export function useScanSLAViolations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("check_sla_violations");
      if (error) throw error;
      return data?.[0] as { processed: number; new_warnings: number; new_violations: number };
    },
    onSuccess: (r) => {
      toast.success(`Scan: ${r.processed} deals — ${r.new_warnings} alertas, ${r.new_violations} violações`);
      qc.invalidateQueries({ queryKey: ["sla-violations"] });
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
}

export function useResolveSLAViolation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sla_violations")
        .update({ resolved_at: new Date().toISOString(), status: "resolved" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Violação resolvida");
      qc.invalidateQueries({ queryKey: ["sla-violations"] });
    },
  });
}
