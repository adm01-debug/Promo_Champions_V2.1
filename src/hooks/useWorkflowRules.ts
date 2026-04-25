import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";
import { updatePayload, insertPayload } from "@/lib/supabase/typed-payloads";

export type TriggerType = "deal_stagnant" | "stage_change" | "task_overdue" | "no_activity";
export type ActionType = "create_task" | "send_notification" | "change_stage" | "add_note";

export interface WorkflowRule {
  id: string;
  name: string;
  description: string | null;
  trigger_type: TriggerType;
  trigger_config: Record<string, unknown>;
  action_type: ActionType;
  action_config: Record<string, unknown>;
  is_active: boolean;
  salesperson_id: string | null;
  executions_count: number;
  last_executed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const TRIGGER_OPTIONS: { value: TriggerType; label: string; description: string; icon: string }[] = [
  { value: "deal_stagnant", label: "Deal parado", description: "Quando um deal fica sem atividade por X dias", icon: "⏱️" },
  { value: "stage_change", label: "Mudança de stage", description: "Quando um deal muda para um stage específico", icon: "🔄" },
  { value: "task_overdue", label: "Tarefa atrasada", description: "Quando uma tarefa passa do prazo", icon: "⚠️" },
  { value: "no_activity", label: "Sem atividade", description: "Quando não há atividades registradas por X dias", icon: "📭" },
];

export const ACTION_OPTIONS: { value: ActionType; label: string; description: string; icon: string }[] = [
  { value: "create_task", label: "Criar tarefa", description: "Cria automaticamente uma tarefa de follow-up", icon: "📋" },
  { value: "send_notification", label: "Enviar notificação", description: "Envia uma notificação push ao vendedor", icon: "🔔" },
  { value: "change_stage", label: "Mover stage", description: "Move o deal para outro stage automaticamente", icon: "➡️" },
  { value: "add_note", label: "Adicionar nota", description: "Adiciona uma nota automática ao deal", icon: "📝" },
];

export function useWorkflowRules() {
  const { salesperson } = useAuth();

  return useQuery({
    queryKey: ["workflow-rules", salesperson?.id],
    queryFn: async (): Promise<WorkflowRule[]> => {
      const query = supabase
        .from("workflow_rules")
        .select("*")
        .order("created_at", { ascending: false });

      if (salesperson?.id) {
        query.eq("salesperson_id", salesperson.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as WorkflowRule[];
    },
    enabled: !!salesperson?.id,
  });
}

export function useCreateWorkflowRule() {
  const queryClient = useQueryClient();
  const { salesperson } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      trigger_type: TriggerType;
      trigger_config: Record<string, unknown>;
      action_type: ActionType;
      action_config: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from("workflow_rules")
        .insert(insertPayload("workflow_rules", {
          name: input.name,
          description: input.description || null,
          trigger_type: input.trigger_type,
          trigger_config: input.trigger_config as Json,
          action_type: input.action_type,
          action_config: input.action_config as Json,
          salesperson_id: salesperson?.id,
        }))
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-rules"] });
      toast.success("Automação criada com sucesso!");
    },
    onError: () => toast.error("Erro ao criar automação"),
  });
}

export function useToggleWorkflowRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("workflow_rules")
        .update(updatePayload("workflow_rules", { is_active, updated_at: new Date().toISOString() }))
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-rules"] });
      toast.success("Automação atualizada!");
    },
  });
}

export function useDeleteWorkflowRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("workflow_rules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-rules"] });
      toast.success("Automação removida!");
    },
    onError: () => toast.error("Erro ao remover automação"),
  });
}
