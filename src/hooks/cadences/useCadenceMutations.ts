import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ActionType } from "./useCadenceQueries";

export function useCreateCadence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from("cadences")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cadences"] });
      toast.success("Cadência criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar cadência");
      console.error(error);
    },
  });
}

export function useDeleteCadence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cadenceId: string) => {
      const { error } = await supabase
        .from("cadences")
        .delete()
        .eq("id", cadenceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cadences"] });
      toast.success("Cadência excluída!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir cadência");
      console.error(error);
    },
  });
}

export function useCreateCadenceStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      cadence_id: string;
      day_number: number;
      action_type: ActionType;
      title: string;
      description?: string;
      template_content?: string;
      step_order: number;
    }) => {
      const { data, error } = await supabase
        .from("cadence_steps")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cadence-steps", variables.cadence_id] });
      toast.success("Etapa adicionada!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar etapa");
      console.error(error);
    },
  });
}

export function useDeleteCadenceStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stepId, cadenceId }: { stepId: string; cadenceId: string }) => {
      const { error } = await supabase
        .from("cadence_steps")
        .delete()
        .eq("id", stepId);

      if (error) throw error;
      return cadenceId;
    },
    onSuccess: (cadenceId) => {
      queryClient.invalidateQueries({ queryKey: ["cadence-steps", cadenceId] });
      toast.success("Etapa removida!");
    },
    onError: (error) => {
      toast.error("Erro ao remover etapa");
      console.error(error);
    },
  });
}
