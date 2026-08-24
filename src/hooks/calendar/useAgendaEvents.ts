import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AgendaEventType = "reminder" | "follow_up" | "meeting" | "call" | "task";
export type AgendaEventStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type AgendaEventPriority = "low" | "medium" | "high" | "urgent";

export interface AgendaEvent {
  id: string;
  salesperson_id: string;
  sale_id: string | null;
  client_id: string | null;
  title: string;
  description: string | null;
  event_type: AgendaEventType;
  status: AgendaEventStatus;
  priority: AgendaEventPriority;
  scheduled_at: string;
  completed_at: string | null;
  reminder_minutes_before: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAgendaEventInput {
  title: string;
  description?: string;
  event_type?: AgendaEventType;
  priority?: AgendaEventPriority;
  scheduled_at: string;
  sale_id?: string | null;
  client_id?: string | null;
  reminder_minutes_before?: number;
}

export const useAgendaEvents = () => {
  return useQuery({
    queryKey: ["agenda_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agenda_events")
        .select("*, client:clients(name), sale:sales(product_name)")
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return (data || []) as AgendaEvent[];
    },
  });
};

export const useCreateAgendaEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAgendaEventInput) => {
      const { data: spData, error: spErr } = await supabase.rpc("get_current_salesperson_id");
      if (spErr) throw spErr;
      const salesperson_id = spData as unknown as string;
      if (!salesperson_id) throw new Error("Vendedor não identificado");

      const { error } = await supabase.from("agenda_events").insert([{ ...input, salesperson_id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda_events"] });
      toast.success("Evento criado");
    },
    onError: (e: Error) => toast.error(e.message || "Erro ao criar evento"),
  });
};

export const useUpdateAgendaEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<AgendaEvent>) => {
      const { error } = await supabase.from("agenda_events").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda_events"] });
      toast.success("Evento atualizado");
    },
    onError: () => toast.error("Erro ao atualizar evento"),
  });
};

export const useCompleteAgendaEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("agenda_events")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda_events"] });
      toast.success("Evento concluído");
    },
    onError: () => toast.error("Erro ao concluir evento"),
  });
};

export const useDeleteAgendaEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agenda_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda_events"] });
      toast.success("Evento removido");
    },
    onError: () => toast.error("Erro ao remover evento"),
  });
};
