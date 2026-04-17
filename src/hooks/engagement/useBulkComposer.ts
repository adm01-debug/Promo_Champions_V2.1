import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface BulkJob {
  id: string;
  owner_id: string;
  prompt: string;
  tone: string;
  language: string;
  target_count: number;
  status: string;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface BulkDraft {
  id: string;
  job_id: string;
  sale_id: string | null;
  client_id: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  subject: string;
  body: string;
  personalization_notes: string | null;
  approved: boolean;
  sent_at: string | null;
  error: string | null;
  created_at: string;
}

export interface CreateBulkJobInput {
  prompt: string;
  tone: string;
  language: string;
  sale_ids: string[];
}

export function useCreateBulkJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBulkJobInput) => {
      const { data, error } = await supabase.functions.invoke("email-composer-bulk", { body: input });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as { job_id: string; generated: number };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["bulk-jobs"] });
      toast({ title: "Rascunhos gerados", description: `${data.generated} e-mails prontos para revisão.` });
    },
    onError: (e: Error) => toast({ title: "Falha ao gerar", description: e.message, variant: "destructive" }),
  });
}

export function useBulkJob(jobId: string | undefined) {
  const qc = useQueryClient();

  const job = useQuery({
    queryKey: ["bulk-job", jobId],
    enabled: !!jobId,
    queryFn: async () => {
      const { data, error } = await supabase.from("email_bulk_jobs").select("*").eq("id", jobId!).maybeSingle();
      if (error) throw error;
      return data as BulkJob | null;
    },
  });

  const drafts = useQuery({
    queryKey: ["bulk-drafts", jobId],
    enabled: !!jobId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_bulk_drafts")
        .select("*")
        .eq("job_id", jobId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BulkDraft[];
    },
  });

  useEffect(() => {
    if (!jobId) return;
    const channel = supabase
      .channel(`bulk-drafts-${jobId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "email_bulk_drafts", filter: `job_id=eq.${jobId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["bulk-drafts", jobId] });
          qc.invalidateQueries({ queryKey: ["bulk-job", jobId] });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "email_bulk_jobs", filter: `id=eq.${jobId}` },
        () => qc.invalidateQueries({ queryKey: ["bulk-job", jobId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, qc]);

  return { job: job.data ?? null, drafts: drafts.data ?? [], isLoading: job.isLoading || drafts.isLoading };
}

export function useUpdateDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; patch: Partial<Pick<BulkDraft, "subject" | "body" | "approved" | "recipient_email">> }) => {
      const { error } = await supabase.from("email_bulk_drafts").update(input.patch).eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["bulk-drafts"] });
      // optimistic toast omitted to avoid noise on toggle
      void vars;
    },
    onError: (e: Error) => toast({ title: "Erro ao atualizar rascunho", description: e.message, variant: "destructive" }),
  });
}

export function useSendBulkJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase.functions.invoke("email-bulk-send", { body: { job_id: jobId } });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as { sent: number; failed: number };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["bulk-jobs"] });
      qc.invalidateQueries({ queryKey: ["bulk-job"] });
      qc.invalidateQueries({ queryKey: ["bulk-drafts"] });
      toast({
        title: "Envio concluído",
        description: `${data.sent} enviados • ${data.failed} falhas`,
        variant: data.failed > 0 ? "destructive" : "default",
      });
    },
    onError: (e: Error) => toast({ title: "Falha ao enviar lote", description: e.message, variant: "destructive" }),
  });
}

export function useBulkJobs() {
  return useQuery({
    queryKey: ["bulk-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_bulk_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as BulkJob[];
    },
  });
}
