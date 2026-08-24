import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AutomationSuggestion {
  id: string;
  title: string;
  description: string;
  trigger_type: string;
  estimated_time_saved_minutes: number;
  priority: "high" | "medium" | "low";
  rationale: string;
  template: {
    name: string;
    trigger_type: string;
    trigger_config: Record<string, unknown>;
    conditions: unknown[];
    actions: unknown[];
  };
}

export interface AutomationROI {
  total_runs_30d: number;
  success_rate_pct: number;
  avg_duration_ms: number;
  estimated_time_saved_minutes: number;
  estimated_time_saved_hours: number;
}

interface IntelligenceResponse {
  suggestions: AutomationSuggestion[];
  roi_metrics: AutomationROI;
  active_workflows: number;
  total_workflows: number;
}

export const useAutomationIntelligence = () => {
  return useQuery<IntelligenceResponse>({
    queryKey: ["automation-intelligence"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("automation-suggestions", { body: {} });
      if (error) throw error;
      return data as IntelligenceResponse;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useApplyAutomationTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (template: AutomationSuggestion["template"]) => {
      const { data, error } = await supabase
        .from("automation_workflows")
        .insert({
          name: template.name,
          trigger_type: template.trigger_type,
          trigger_config: template.trigger_config,
          conditions: template.conditions,
          actions: template.actions,
          is_active: true,
        } as never)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["automation-workflows"] });
      qc.invalidateQueries({ queryKey: ["automation-intelligence"] });
      toast.success("Automação criada e ativada!");
    },
    onError: (e: Error) => toast.error(`Erro ao aplicar template: ${e.message}`),
  });
};
