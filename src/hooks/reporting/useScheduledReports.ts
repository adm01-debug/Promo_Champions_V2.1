import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { updatePayload, insertPayload } from "@/lib/supabase/typed-payloads";
import type { ScheduledReport, ScheduleFrequency, ScheduleFormat } from "@/components/reporting/scheduledReportHelpers";

const KEY = ["scheduled-reports"] as const;

export function useScheduledReports() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ScheduledReport[];
    },
    staleTime: 60_000,
  });
}

export interface CreateScheduledReportInput {
  report_id: string;
  name: string;
  frequency: ScheduleFrequency;
  hour_of_day: number;
  day_of_week?: number | null;
  day_of_month?: number | null;
  recipients: string[];
  format: ScheduleFormat;
  enabled?: boolean;
}

export function useCreateScheduledReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateScheduledReportInput) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("scheduled_reports")
        .insert(insertPayload("scheduled_reports", { ...input, created_by: u.user.id, enabled: input.enabled ?? true }))
        .select()
        .single();
      if (error) throw error;
      return data as unknown as ScheduledReport;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Agendamento criado");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao criar"),
  });
}

export function useUpdateScheduledReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<ScheduledReport> & { id: string }) => {
      const { error } = await supabase
        .from("scheduled_reports")
        .update(updatePayload("scheduled_reports", patch))
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Atualizado");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });
}

export function useDeleteScheduledReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("scheduled_reports").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Removido");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });
}

export function useToggleScheduledReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("scheduled_reports")
        .update(updatePayload("scheduled_reports", { enabled }))
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });
}
