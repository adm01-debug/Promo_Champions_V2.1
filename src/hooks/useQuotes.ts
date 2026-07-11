import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TableUpdate } from '@/lib/supabase/typed-payloads';

export interface Quote {
  id: string;
  sale_id: string | null;
  client_name: string;
  title: string;
  description: string | null;
  total_value: number;
  status: string;
  external_reference: string | null;
  valid_until: string | null;
  sent_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // New fields from GIFT STORE integration
  quote_number: string | null;
  subtotal: number | null;
  discount_amount: number | null;
  discount_percent: number | null;
  items: QuoteItem[] | string | null; // JSONB stored as array or object
  external_quote_id: string | null;
  sync_status: string | null;
  pdf_url: string | null;
  // joined
  salespeople?: { name: string } | null;
  sales?: { client_name: string; product_name: string; status: string } | null;
}

export interface QuoteItem {
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  color_name?: string;
  personalizations: {
    technique_name: string;
    colors_count: number;
    positions_count: number;
    total_cost: number;
  }[];
}

/** Parse the items JSON string into typed array */
/** Parse the items into typed array */
export function parseQuoteItems(items: QuoteItem[] | string | null | unknown): QuoteItem[] {
  if (!items) return [];
  if (typeof items === 'string') {
    try {
      return JSON.parse(items) as QuoteItem[];
    } catch {
      return [];
    }
  }
  return items as QuoteItem[];
}

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

export const QUOTE_STATUSES: { value: QuoteStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Rascunho', color: 'bg-muted text-muted-foreground' },
  { value: 'sent', label: 'Enviado', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'approved', label: 'Aprovado', color: 'bg-green-500/20 text-green-400' },
  { value: 'rejected', label: 'Rejeitado', color: 'bg-destructive/20 text-destructive' },
  { value: 'expired', label: 'Expirado', color: 'bg-yellow-500/20 text-yellow-400' },
];

export function useQuotes(statusFilter?: string) {
  return useQuery({
    queryKey: ['quotes', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('quotes')
        .select(`*, salespeople:created_by (name), sales:sale_id (client_name, product_name, status)`)
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Quote[];
    },
  });
}

export function useQuoteSummary() {
  return useQuery({
    queryKey: ['quotes-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('status, total_value, valid_until');
      if (error) throw error;

      const now = new Date();
      const quotes = data || [];
      const total = quotes.length;
      const draft = quotes.filter(q => q.status === 'draft').length;
      const sent = quotes.filter(q => q.status === 'sent').length;
      const approved = quotes.filter(q => q.status === 'approved').length;
      const rejected = quotes.filter(q => q.status === 'rejected').length;
      const expiringSoon = quotes.filter(q => {
        if (!q.valid_until || (q.status !== 'sent' && q.status !== 'draft')) return false;
        const diff = new Date(q.valid_until).getTime() - now.getTime();
        return diff <= 3 * 24 * 60 * 60 * 1000; // ≤ 3 days (including expired)
      }).length;
      const totalValue = quotes.filter(q => q.status === 'approved').reduce((s, q) => s + Number(q.total_value), 0);

      return { total, draft, sent, approved, rejected, expiringSoon, totalValue };
    },
  });
}

interface CreateQuoteInput {
  client_name: string;
  title: string;
  description?: string;
  total_value: number;
  sale_id?: string;
  external_reference?: string;
  valid_until?: string;
  notes?: string;
  created_by?: string;
  subtotal?: number;
  discount_amount?: number;
  discount_percent?: number;
  items?: QuoteItem[] | string | null;
}

export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateQuoteInput) => {
      const { data, error } = await supabase.from('quotes').insert([input as any]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes'] });
      qc.invalidateQueries({ queryKey: ['quotes-summary'] });
      toast.success('Orçamento criado com sucesso');
    },
    onError: () => toast.error('Erro ao criar orçamento'),
  });
}

export function useUpdateQuoteStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, rejection_reason }: { id: string; status: string; rejection_reason?: string }) => {
      const updates: TableUpdate<'quotes'> = { status };
      if (status === 'sent') updates.sent_at = new Date().toISOString();
      if (status === 'approved') updates.approved_at = new Date().toISOString();
      if (status === 'rejected') {
        updates.rejected_at = new Date().toISOString();
        if (rejection_reason) updates.rejection_reason = rejection_reason;
      }

      const { data: quote, error } = await supabase.from('quotes').update(updates).eq('id', id).select('sale_id').single();
      if (error) throw error;

      // Sincronização automática com pipeline
      if (quote?.sale_id) {
        let newPipelineStatus = '';
        if (status === 'sent') newPipelineStatus = 'proposal';
        if (status === 'approved') newPipelineStatus = 'won';
        if (status === 'rejected') newPipelineStatus = 'lost';
        if (status === 'expired') newPipelineStatus = 'closed';

        if (newPipelineStatus) {
          await supabase.from('sales').update({ status: newPipelineStatus }).eq('id', quote.sale_id);
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes'] });
      qc.invalidateQueries({ queryKey: ['quotes-summary'] });
      qc.invalidateQueries({ queryKey: ['pipeline-deals'] });
      qc.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Status atualizado e pipeline sincronizado');
    },
    onError: () => toast.error('Erro ao atualizar status'),
  });
}

export function useDeleteQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('quotes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes'] });
      qc.invalidateQueries({ queryKey: ['quotes-summary'] });
      toast.success('Orçamento excluído');
    },
    onError: () => toast.error('Erro ao excluir orçamento'),
  });
}

export function useDealsForQuotes() {
  return useQuery({
    queryKey: ['deals-for-quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('id, client_name, product_name, status')
        .in('status', ['lead', 'qualified', 'proposal', 'negotiation'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
}

export interface ConvertQuoteResult {
  sale_id: string;
  order_id: string | null;
  order_number?: string;
  items_count?: number;
  idempotent: boolean;
  reused_order?: boolean;
}

import {
  CONVERT_QUOTE_ERROR_MESSAGES,
  parseConvertQuoteError,
  type ConvertQuoteErrorCode,
} from './quoteErrorMessages';
export { CONVERT_QUOTE_ERROR_MESSAGES, parseConvertQuoteError };
export type { ConvertQuoteErrorCode };

/**
 * Dispara notify-quote-conversion em background (fire-and-forget).
 * - Grava auditoria via RPC fn_record_conversion_attempt
 * - Envia Slack + webhook genérico se configurados
 * - Propaga X-Request-Id para correlação em logs
 * Falhas são logadas mas não impactam o UX da conversão.
 */
async function dispatchConversionNotification(payload: {
  quote_id: string;
  sale_id?: string | null;
  order_id?: string | null;
  order_number?: string | null;
  previous_status?: string | null;
  new_status?: string | null;
  reused_order?: boolean;
  idempotent?: boolean;
  success: boolean;
  error_code?: string | null;
  error_message?: string | null;
  latency_ms?: number;
  request_id: string;
}) {
  try {
    await supabase.functions.invoke('notify-quote-conversion', {
      body: payload,
      headers: { 'X-Request-Id': payload.request_id },
    });
  } catch (err) {
    console.warn('[notify-quote-conversion] falha ao notificar:', err);
  }
}

/**
 * Converte um orçamento em venda + pedido via RPC transacional.
 * A função no banco cuida de: lock, idempotência, autorização, validação
 * de status/valor/consistência, criação de orders/order_items e auditoria.
 */
export function useConvertQuoteToSale() {
  const qc = useQueryClient();
  return useMutation<ConvertQuoteResult, Error, string>({
    mutationFn: async (quoteId: string) => {
      const requestId =
        (globalThis.crypto as Crypto | undefined)?.randomUUID?.() ??
        `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

      // Snapshot do status anterior (best-effort — não bloqueia se falhar)
      let previousStatus: string | null = null;
      try {
        const { data: prev } = await supabase
          .from('quotes')
          .select('status')
          .eq('id', quoteId)
          .maybeSingle();
        previousStatus = (prev?.status as string | null) ?? null;
      } catch {
        /* ignore */
      }

      const t0 = performance.now();
      const { data, error } = await (supabase.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<{ data: ConvertQuoteResult | null; error: { message: string } | null }>)(
        'fn_convert_quote_to_sale',
        { _quote_id: quoteId },
      );
      const latencyMs = Math.round(performance.now() - t0);

      if (error || !data) {
        const message = error?.message ?? '[UNKNOWN] Resposta vazia da conversão';
        const code = parseConvertQuoteError(message);
        void dispatchConversionNotification({
          quote_id: quoteId,
          previous_status: previousStatus,
          new_status: previousStatus,
          success: false,
          error_code: code,
          error_message: message,
          latency_ms: latencyMs,
          request_id: requestId,
        });
        throw new Error(message);
      }

      void dispatchConversionNotification({
        quote_id: quoteId,
        sale_id: data.sale_id,
        order_id: data.order_id,
        order_number: data.order_number ?? null,
        previous_status: previousStatus,
        new_status: 'converted',
        reused_order: data.reused_order ?? false,
        idempotent: data.idempotent,
        success: true,
        latency_ms: latencyMs,
        request_id: requestId,
      });

      return data;
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['quotes'] });
      qc.invalidateQueries({ queryKey: ['quotes-summary'] });
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['pipeline-deals'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      if (result.idempotent) {
        toast.info('Orçamento já havia sido convertido');
      } else {
        toast.success(
          result.order_number
            ? `Convertido em venda • Pedido ${result.order_number}`
            : 'Orçamento convertido em venda',
        );
      }
    },
    onError: (err: Error) => {
      const code = parseConvertQuoteError(err.message);
      toast.error(CONVERT_QUOTE_ERROR_MESSAGES[code]);
    },
  });
}



