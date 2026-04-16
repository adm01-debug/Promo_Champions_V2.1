import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Node, Edge } from "@xyflow/react";

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  nodes: Node[];
  edges: Edge[];
  is_active: boolean;
  execution_count: number;
  last_executed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: string;
  input_payload: Record<string, unknown>;
  step_log: Array<{ nodeId: string; label: string; status: string; detail?: string; at: string }>;
  error_message: string | null;
  duration_ms: number | null;
  started_at: string;
  finished_at: string | null;
}

export const useWorkflows = () =>
  useQuery({
    queryKey: ["workflows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Workflow[];
    },
  });

export const useWorkflow = (id: string | undefined) =>
  useQuery({
    queryKey: ["workflow", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as unknown as Workflow;
    },
  });

export const useWorkflowExecutions = (workflowId: string | undefined) =>
  useQuery({
    queryKey: ["workflow-executions", workflowId],
    enabled: !!workflowId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workflow_executions")
        .select("*")
        .eq("workflow_id", workflowId!)
        .order("started_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as WorkflowExecution[];
    },
  });

export const useSaveWorkflow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (wf: Partial<Workflow> & { id?: string }) => {
      const payload = {
        name: wf.name,
        description: wf.description,
        trigger_type: wf.trigger_type ?? "manual",
        trigger_config: wf.trigger_config ?? {},
        nodes: wf.nodes ?? [],
        edges: wf.edges ?? [],
        is_active: wf.is_active ?? false,
      };
      if (wf.id) {
        const { data, error } = await supabase
          .from("workflows")
          .update(payload)
          .eq("id", wf.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase
        .from("workflows")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["workflows"] });
      qc.invalidateQueries({ queryKey: ["workflow", data.id] });
      toast.success("Workflow salvo");
    },
    onError: (e: Error) => toast.error("Erro ao salvar", { description: e.message }),
  });
};

export const useDeleteWorkflow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("workflows").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Workflow removido");
    },
  });
};

export const useExecuteWorkflow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ workflowId, payload }: { workflowId: string; payload?: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke("workflow-executor", {
        body: { workflow_id: workflowId, input_payload: payload ?? {} },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["workflow-executions", vars.workflowId] });
      qc.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Execução concluída");
    },
    onError: (e: Error) => toast.error("Falha na execução", { description: e.message }),
  });
};
