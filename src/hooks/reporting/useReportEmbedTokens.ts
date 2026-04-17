import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateEmbedToken, type ReportEmbedToken } from "@/components/reporting/embedHelpers";

export function useReportEmbedTokens(reportId: string | undefined) {
  return useQuery({
    queryKey: ["report-embed-tokens", reportId],
    queryFn: async (): Promise<ReportEmbedToken[]> => {
      if (!reportId) return [];
      const { data, error } = await supabase
        .from("report_embed_tokens")
        .select("*")
        .eq("report_id", reportId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ReportEmbedToken[];
    },
    enabled: !!reportId,
  });
}

export function useCreateReportEmbedToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { report_id: string; expires_at: string | null; allowed_origins: string[] }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("report_embed_tokens")
        .insert({
          report_id: input.report_id,
          token: generateEmbedToken(),
          created_by: u.user.id,
          expires_at: input.expires_at,
          allowed_origins: input.allowed_origins,
        })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as ReportEmbedToken;
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["report-embed-tokens", r.report_id] });
      toast.success("Token de embed criado");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao criar token"),
  });
}

export function useRevokeReportEmbedToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, report_id }: { id: string; report_id: string }) => {
      const { error } = await supabase
        .from("report_embed_tokens")
        .update({ revoked: true })
        .eq("id", id);
      if (error) throw error;
      return { id, report_id };
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["report-embed-tokens", r.report_id] });
      toast.success("Token revogado");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao revogar"),
  });
}

export function useDeleteReportEmbedToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, report_id }: { id: string; report_id: string }) => {
      const { error } = await supabase.from("report_embed_tokens").delete().eq("id", id);
      if (error) throw error;
      return { id, report_id };
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["report-embed-tokens", r.report_id] });
      toast.success("Token removido");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao remover"),
  });
}
