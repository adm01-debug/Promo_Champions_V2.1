import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addDays, format } from "date-fns";

export function useEnrollInCadence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      sale_id: string;
      cadence_id: string;
      salesperson_id?: string;
    }) => {
      const { data: steps, error: stepsError } = await supabase
        .from("cadence_steps")
        .select("*")
        .eq("cadence_id", input.cadence_id)
        .order("step_order", { ascending: true });

      if (stepsError) throw stepsError;

      const today = new Date();
      const firstStepDate = steps?.[0] ? addDays(today, steps[0].day_number - 1) : today;

      const { data: enrollment, error: enrollError } = await supabase
        .from("prospect_cadences")
        .insert({
          ...input,
          next_action_date: format(firstStepDate, "yyyy-MM-dd"),
        })
        .select()
        .single();

      if (enrollError) throw enrollError;

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
    onError: (error: Error & { code?: string }) => {
      if (error.code === "23505") {
        toast.error("Prospect já está inscrito nesta cadência");
      } else {
        toast.error("Erro ao inscrever na cadência");
      }
      if (import.meta.env.DEV) {
        if (import.meta.env.DEV) console.error(error);
      }
    },
  });
}

export function usePauseCadence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleId: string) => {
      const { data, error } = await supabase
        .from("prospect_cadences")
        .update({ status: "paused" })
        .eq("sale_id", saleId)
        .eq("status", "active")
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prospect-cadences"] });
      queryClient.invalidateQueries({ queryKey: ["active-cadences-by-sales"] });
      queryClient.invalidateQueries({ queryKey: ["todays-cadence-tasks"] });
      toast.success("Cadência pausada!");
    },
    onError: (error) => {
      toast.error("Erro ao pausar cadência");
      if (import.meta.env.DEV) {
        if (import.meta.env.DEV) console.error(error);
      }
    },
  });
}

export function useResumeCadence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleId: string) => {
      const { data, error } = await supabase
        .from("prospect_cadences")
        .update({ status: "active" })
        .eq("sale_id", saleId)
        .eq("status", "paused")
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prospect-cadences"] });
      queryClient.invalidateQueries({ queryKey: ["active-cadences-by-sales"] });
      queryClient.invalidateQueries({ queryKey: ["todays-cadence-tasks"] });
      toast.success("Cadência retomada!");
    },
    onError: (error) => {
      toast.error("Erro ao retomar cadência");
      if (import.meta.env.DEV) {
        if (import.meta.env.DEV) console.error(error);
      }
    },
  });
}

export function useCancelCadence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleId: string) => {
      const { data, error } = await supabase
        .from("prospect_cadences")
        .update({ 
          status: "cancelled",
          completed_at: new Date().toISOString(),
        })
        .eq("sale_id", saleId)
        .in("status", ["active", "paused"])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prospect-cadences"] });
      queryClient.invalidateQueries({ queryKey: ["active-cadences-by-sales"] });
      queryClient.invalidateQueries({ queryKey: ["todays-cadence-tasks"] });
      toast.success("Cadência cancelada!");
    },
    onError: (error) => {
      toast.error("Erro ao cancelar cadência");
      if (import.meta.env.DEV) {
        if (import.meta.env.DEV) console.error(error);
      }
    },
  });
}

export function useUpdateLeadStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ saleId, stage }: { saleId: string; stage: string }) => {
      const { data, error } = await supabase
        .from("prospect_cadences")
        .update({ funnel_stage: stage })
        .eq("sale_id", saleId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prospect-cadences"] });
      queryClient.invalidateQueries({ queryKey: ["funnel-data"] });
      toast.success("Etapa do lead atualizada!");
    },
  });
}

