import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";
import { updatePayload, insertPayload } from "@/lib/supabase/typed-payloads";
import type { ReportEntity, ReportConfig } from "./reportBuilderHelpers";

export interface CustomReport {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  entity: ReportEntity;
  config: ReportConfig;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export function useCustomReports() {
  return useQuery({
    queryKey: ["custom-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_reports")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as CustomReport[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCustomReport(id: string | undefined) {
  return useQuery({
    queryKey: ["custom-report", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("custom_reports")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as CustomReport;
    },
    enabled: !!id,
  });
}

export function useCreateCustomReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      entity: ReportEntity;
      config: ReportConfig;
      is_shared?: boolean;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("custom_reports")
        .insert(insertPayload("custom_reports", {
          owner_id: userData.user.id,
          name: input.name,
          description: input.description,
          entity: input.entity,
          config: input.config as unknown as Json,
          is_shared: input.is_shared ?? false,
        }))
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CustomReport;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custom-reports"] });
      toast.success("Relatório criado");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao criar"),
  });
}

export function useUpdateCustomReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<CustomReport> & { id: string }) => {
      const { data, error } = await supabase
        .from("custom_reports")
        .update(updatePayload("custom_reports", {
          name: patch.name,
          description: patch.description,
          entity: patch.entity,
          config: patch.config as unknown as Json | undefined,
          is_shared: patch.is_shared,
        }))
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CustomReport;
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["custom-reports"] });
      qc.invalidateQueries({ queryKey: ["custom-report", r.id] });
      toast.success("Salvo");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar"),
  });
}

export function useDeleteCustomReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("custom_reports").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custom-reports"] });
      toast.success("Relatório removido");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao remover"),
  });
}
