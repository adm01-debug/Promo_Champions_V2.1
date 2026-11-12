import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { chunkedIn } from '@/lib/supabase/chunkedIn';
import type { DMURole, Sentiment } from '@/components/deal-intelligence/committeeHelpers';

/** Resumo de um stakeholder real (public.deal_stakeholders) para o card do pipeline. */
export interface DealStakeholderSummary {
  id: string;
  name: string;
  role_title: string | null;
  dmu_role: DMURole;
  sentiment: Sentiment;
}

type StakeholderRow = DealStakeholderSummary & { sale_id: string };

/**
 * Comitê de compra real de cada deal do board, em lote (uma query por chunk
 * de 100 ids em vez de uma por card). RLS de deal_stakeholders limita ao dono
 * ou admin/manager — deal sem linha visível simplesmente não mostra o badge.
 */
export function useStakeholdersBySaleIds(saleIds: string[]) {
  return useQuery({
    queryKey: ['pipeline-stakeholders-by-sales', saleIds],
    enabled: saleIds.length > 0,
    queryFn: async (): Promise<Record<string, DealStakeholderSummary[]>> => {
      const rows = await chunkedIn<StakeholderRow>(
        saleIds,
        chunk =>
          supabase
            .from('deal_stakeholders')
            .select('id, sale_id, name, role_title, dmu_role, sentiment')
            .in('sale_id', chunk as string[])
            .order('created_at', { ascending: true }) as PromiseLike<{
            data: StakeholderRow[] | null;
            error: { message?: string } | null;
          }>,
        { parallel: true, label: 'pipeline-stakeholders-by-sales' }
      );

      const bySale: Record<string, DealStakeholderSummary[]> = {};
      for (const { sale_id, ...stakeholder } of rows) {
        (bySale[sale_id] ??= []).push(stakeholder);
      }
      return bySale;
    },
  });
}

/** Telefone cadastrado (public.clients.phone) de cada cliente do board, em lote. */
export function useClientPhonesByIds(clientIds: string[]) {
  return useQuery({
    queryKey: ['pipeline-client-phones', clientIds],
    enabled: clientIds.length > 0,
    queryFn: async (): Promise<Record<string, string>> => {
      type Row = { id: string; phone: string | null };
      const rows = await chunkedIn<Row>(
        clientIds,
        chunk =>
          supabase
            .from('clients')
            .select('id, phone')
            .in('id', chunk as string[]),
        { parallel: true, label: 'pipeline-client-phones' }
      );

      const phones: Record<string, string> = {};
      for (const row of rows) {
        if (row.phone?.trim()) phones[row.id] = row.phone;
      }
      return phones;
    },
  });
}
