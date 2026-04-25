import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";
import { insertPayload } from "@/lib/supabase/typed-payloads";

export type TriggerType = "deal_created" | "stage_changed" | "activity_logged" | "scheduled" | "manual" | "no_activity_days";
export type ActionType = "create_task" | "send_notification" | "update_stage" | "log_activity" | "assign_owner";

export interface WorkflowAction {
  type: ActionType;
  params: Record<string, unknown>;
}

export interface WorkflowCondition {
  field: string;
  operator: "eq" | "neq" | "gt" | "lt" | "contains";
  value: unknown;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string | null;
  trigger_type: TriggerType;
  trigger_config: Record<string, unknown>;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  is_active: boolean;
  run_count: number;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useAutomationWorkflows = () => {
  return useQuery({
    queryKey: ["automation-workflows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automation_workflows")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as AutomationWorkflow[];
    },
  });
};

export const useWorkflowRuns = (workflowId: string | null) => {
  return useQuery({
    queryKey: ["workflow-runs", workflowId],
    enabled: !!workflowId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automation_runs")
        .select("*")
        .eq("workflow_id", workflowId!)
        .order("started_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateWorkflow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<AutomationWorkflow> & { name: string; trigger_type: TriggerType }) => {
      const { data, error } = await supabase.from("automation_workflows").insert(payload as never).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["automation-workflows"] });
      toast.success("Workflow criado");
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
};

export const useToggleWorkflow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.rpc("toggle_workflow_active", {
        p_workflow_id: id,
        p_active: active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["automation-workflows"] });
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
};

export const useExecuteWorkflow = () => {
  return useMutation({
    mutationFn: async ({ workflowId, payload }: { workflowId: string; payload: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke("execute-workflow", {
        body: { workflow_id: workflowId, trigger_payload: payload },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const status = (data as { status?: string })?.status ?? "executado";
      toast.success(`Workflow ${status}`);
    },
    onError: (e: Error) => toast.error(`Erro: ${e.message}`),
  });
};
