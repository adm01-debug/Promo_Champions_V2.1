import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/** Rascunho de campanha que falhou e ainda não foi entregue. */
export interface FailedDraft {
  id: string;
  job_id: string;
  recipient_email: string | null;
  recipient_name: string | null;
  subject: string;
  error: string | null;
  retry_count: number;
  next_retry_at: string | null;
  last_error_at: string | null;
  approved: boolean;
}

const QUERY_KEY = ['email-failed-drafts'] as const;

/** Teto de leitura: o painel é operacional, não um relatório histórico. */
const READ_LIMIT = 200;

export function useFailedDrafts() {
  return useQuery<FailedDraft[]>({
    queryKey: QUERY_KEY,
    staleTime: 20_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_bulk_drafts')
        .select(
          'id, job_id, recipient_email, recipient_name, subject, error, retry_count, next_retry_at, last_error_at, approved',
        )
        .is('sent_at', null)
        .not('error', 'is', null)
        .order('last_error_at', { ascending: false, nullsFirst: false })
        .limit(READ_LIMIT);

      if (error) throw new Error(error.message);
      return (data ?? []) as FailedDraft[];
    },
  });
}

export interface ManualRetryResult {
  requested: number;
  scanned: number;
  retried: number;
  gaveUp: number;
  failed: number;
}

/**
 * Reenfileira manualmente rascunhos em falha e dispara o processador.
 *
 * O contador de tentativas é zerado e o erro é substituído por um marcador
 * neutro para que a política automática volte a considerar o rascunho. A
 * guarda de opt-out continua sendo aplicada no servidor: um endereço suprimido
 * será bloqueado de novo, mesmo com reenvio manual.
 */
export function useManualRetryDrafts() {
  const qc = useQueryClient();

  return useMutation<ManualRetryResult, Error, string[]>({
    mutationFn: async (ids: string[]) => {
      if (ids.length === 0) throw new Error('Selecione ao menos um rascunho.');

      const { error: updateError } = await supabase
        .from('email_bulk_drafts')
        .update({
          error: 'manual_retry_requested',
          retry_count: 0,
          next_retry_at: new Date().toISOString(),
        })
        .in('id', ids);
      if (updateError) throw new Error(updateError.message);

      const { data, error } = await supabase.functions.invoke('email-bulk-retry', { body: {} });
      if (error) throw new Error(error.message);

      const payload = (data ?? {}) as Partial<ManualRetryResult>;
      return {
        requested: ids.length,
        scanned: payload.scanned ?? 0,
        retried: payload.retried ?? 0,
        gaveUp: payload.gaveUp ?? 0,
        failed: payload.failed ?? 0,
      };
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/** Encerra rascunhos manualmente (marca como falha definitiva, sem reenvio). */
export function useDiscardDrafts() {
  const qc = useQueryClient();

  return useMutation<number, Error, string[]>({
    mutationFn: async (ids: string[]) => {
      if (ids.length === 0) throw new Error('Selecione ao menos um rascunho.');
      const { error } = await supabase
        .from('email_bulk_drafts')
        .update({ approved: false, next_retry_at: null })
        .in('id', ids);
      if (error) throw new Error(error.message);
      return ids.length;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
