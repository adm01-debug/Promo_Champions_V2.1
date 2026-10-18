import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

/** Solicitação de titular (LGPD art. 18) da fila administrativa. */
export interface DataSubjectRequest {
  id: string;
  request_type: string;
  subject_email: string;
  subject_id: string | null;
  subject_client_id: string | null;
  status: string;
  notes: string | null;
  payload: Json;
  result: Json | null;
  requested_at: string;
  due_at: string;
  processed_at: string | null;
}

export interface DataSubjectRequestFilters {
  /** Busca parcial pelo e-mail do titular (case-insensitive). */
  search: string;
  /** Status ou "all". */
  status: string;
  /** Tipo de solicitação ou "all". */
  requestType: string;
  /** Página 0-based. */
  page: number;
  pageSize: number;
}

export interface DataSubjectRequestsResult {
  rows: DataSubjectRequest[];
  total: number;
}

/** Escapa caracteres especiais do PostgREST `ilike` para evitar wildcards indesejados. */
function sanitizeSearch(term: string): string {
  return term.trim().replace(/[%,_]/g, m => `\\${m}`);
}

export function useDataSubjectRequests(filters: DataSubjectRequestFilters) {
  const { search, status, requestType, page, pageSize } = filters;

  return useQuery<DataSubjectRequestsResult>({
    queryKey: ['data-subject-requests', search, status, requestType, page, pageSize],
    staleTime: 30_000,
    queryFn: async () => {
      let query = supabase
        .from('data_subject_requests')
        .select(
          'id, request_type, subject_email, subject_id, subject_client_id, status, notes, payload, result, requested_at, due_at, processed_at',
          { count: 'exact' }
        )
        .order('due_at', { ascending: true })
        .range(page * pageSize, page * pageSize + pageSize - 1);

      const term = sanitizeSearch(search);
      if (term) query = query.ilike('subject_email', `%${term}%`);
      if (status !== 'all') query = query.eq('status', status);
      if (requestType !== 'all') query = query.eq('request_type', requestType);

      const { data, error, count } = await query;
      if (error) throw new Error(error.message);

      return {
        rows: (data ?? []) as DataSubjectRequest[],
        total: count ?? 0,
      };
    },
  });
}

/** Registra manualmente uma solicitação recebida por outro canal. */
export function useCreateDataSubjectRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      subject_email: string;
      request_type: string;
      notes?: string;
    }) => {
      const email = input.subject_email.trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('E-mail do titular inválido');
      }
      const { error } = await supabase.from('data_subject_requests').insert({
        subject_email: email,
        request_type: input.request_type,
        notes: input.notes?.trim() || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['data-subject-requests'] }),
  });
}

/** Atualiza status/notas de uma solicitação (admin/manager via RLS). */
export function useUpdateDataSubjectRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from('data_subject_requests')
        .update({
          status: input.status,
          processed_at: input.status === 'in_progress' ? null : new Date().toISOString(),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
        })
        .eq('id', input.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['data-subject-requests'] }),
  });
}

/**
 * Executa a anonimização do titular (RPC anonymize_data_subject) e marca a
 * solicitação como concluída com a contagem de linhas alteradas por tabela.
 */
export function useAnonymizeDataSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      request: Pick<DataSubjectRequest, 'id' | 'subject_email' | 'subject_id' | 'payload'>
    ) => {
      const phone =
        request.payload &&
        typeof request.payload === 'object' &&
        !Array.isArray(request.payload)
          ? (request.payload as { phone?: unknown }).phone
          : null;
      const { data, error } = await supabase.rpc('anonymize_data_subject', {
        p_subject_email: request.subject_email,
        p_subject_id: request.subject_id ?? undefined,
        p_phone: typeof phone === 'string' && phone ? phone : undefined,
        p_request_id: request.id,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['data-subject-requests'] }),
  });
}
