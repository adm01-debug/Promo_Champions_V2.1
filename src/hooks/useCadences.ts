import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addDays, format } from "date-fns";

export type ActionType = 'email' | 'call' | 'linkedin' | 'whatsapp' | 'meeting' | 'other';
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
        .eq("cadence_id", cadenceId)
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
        .eq("status", "active");

      if (error) throw error;
      
      // Create a map of sale_id -> cadence info
      const cadenceMap: Record<string, { cadenceName: string; currentStep: number }> = {};
      data?.forEach(pc => {
        cadenceMap[pc.sale_id] = {
          cadenceName: (pc.cadence as any)?.name || "Cadência",
          currentStep: pc.current_step,
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
        .eq("scheduled_date", today)
        .eq("status", "pending");

      if (error) throw error;
      return data;
    },
  });
}

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

export function useEnrollInCadence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      sale_id: string;
      cadence_id: string;
      salesperson_id?: string;
    }) => {
      // Get cadence steps to create tasks
      const { data: steps, error: stepsError } = await supabase
        .from("cadence_steps")
        .select("*")
        .eq("cadence_id", input.cadence_id)
        .order("step_order", { ascending: true });

      if (stepsError) throw stepsError;

      const today = new Date();
      const firstStepDate = steps?.[0] ? addDays(today, steps[0].day_number - 1) : today;

      // Create prospect cadence enrollment
      const { data: enrollment, error: enrollError } = await supabase
        .from("prospect_cadences")
        .insert({
          ...input,
          next_action_date: format(firstStepDate, "yyyy-MM-dd"),
        })
        .select()
        .single();

      if (enrollError) throw enrollError;

      // Create tasks for each step
      if (steps && steps.length > 0) {
        const tasks = steps.map(step => ({
          prospect_cadence_id: enrollment.id,
          cadence_step_id: step.id,
          scheduled_date: format(addDays(today, step.day_number - 1), "yyyy-MM-dd"),
        }));

        const { error: tasksError } = await supabase
          .from("cadence_tasks")
          .insert(tasks);

        if (tasksError) throw tasksError;
      }

      return enrollment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prospect-cadences"] });
      queryClient.invalidateQueries({ queryKey: ["todays-cadence-tasks"] });
      toast.success("Prospect inscrito na cadência!");
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error("Prospect já está inscrito nesta cadência");
      } else {
        toast.error("Erro ao inscrever na cadência");
      }
      console.error(error);
    },
  });
}

export function useCompleteCadenceTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, notes }: { taskId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from("cadence_tasks")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          notes,
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todays-cadence-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["prospect-cadences"] });
      toast.success("Tarefa concluída!");
    },
    onError: (error) => {
      toast.error("Erro ao concluir tarefa");
      console.error(error);
    },
  });
}

export function useSkipCadenceTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, notes }: { taskId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from("cadence_tasks")
        .update({
          status: "skipped",
          notes,
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todays-cadence-tasks"] });
      toast.success("Tarefa pulada!");
    },
    onError: (error) => {
      toast.error("Erro ao pular tarefa");
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
