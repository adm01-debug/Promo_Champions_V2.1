import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

export interface ContactDeal {
  id: string;
  client_name: string;
  product_name: string;
  amount: number;
  status: string;
  category: string;
  source: string | null;
  salesperson_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactDealsSummary {
  deals: ContactDeal[];
  totalDeals: number;
  totalValue: number;
  wonDeals: number;
  wonValue: number;
  openDeals: number;
  openValue: number;
  winRate: number;
  avgDealSize: number;
  lastInteraction: string | null;
}

/**
 * Hook returning the full deal history for a given contact (by client_name).
 * Useful for the contact 360 view and account intelligence panels.
 */
export const useContactDeals = (clientName?: string) => {
  return useQuery<ContactDealsSummary>({
    queryKey: ['contact-deals', clientName],
    enabled: !!clientName,
    queryFn: async (): Promise<ContactDealsSummary> => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .ilike('client_name', clientName!)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const deals = (data || []) as ContactDeal[];
      const totalValue = deals.reduce((s, d) => s + Number(d.amount || 0), 0);
      const won = deals.filter((d) => d.status === 'closed' || d.status === 'completed');
      const open = deals.filter(
        (d) => !['closed', 'completed', 'lost', 'cancelled'].includes(d.status),
      );
      const wonValue = won.reduce((s, d) => s + Number(d.amount || 0), 0);
      const openValue = open.reduce((s, d) => s + Number(d.amount || 0), 0);

      return {
        deals,
        totalDeals: deals.length,
        totalValue,
        wonDeals: won.length,
        wonValue,
        openDeals: open.length,
        openValue,
        winRate: deals.length > 0 ? Math.round((won.length / deals.length) * 100) : 0,
        avgDealSize: deals.length > 0 ? Math.round(totalValue / deals.length) : 0,
        lastInteraction: deals[0]?.updated_at || null,
      };
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};
