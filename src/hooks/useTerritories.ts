import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Territory {
  id: string;
  territory_name: string;
  territory_type: string;
  current_owner_id: string | null;
  is_contested: boolean;
  total_deals: number;
  total_revenue: number;
  conquered_at: string | null;
  created_at: string;
  owner?: { id: string; name: string; avatar_url: string | null } | null;
}

export interface TerritoryHistory {
  id: string;
  territory_id: string;
  salesperson_id: string;
  deals_count: number;
  revenue_contribution: number;
  conquered_at: string | null;
  lost_at: string | null;
  salesperson?: { name: string };
}

export function useTerritories() {
  return useQuery({
    queryKey: ['sales-territories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_territories')
        .select('*, salespeople!sales_territories_current_owner_id_fkey(id, name, avatar_url)')
        .order('total_revenue', { ascending: false });

      if (error) throw error;
      return (data || []).map((t) => ({
        ...t,
        owner: (t as Record<string, unknown>).salespeople || null,
        salespeople: undefined,
      })) as Territory[];
    },
  });
}

export function useTerritoryHistory(territoryId?: string) {
  return useQuery({
    queryKey: ['territory-history', territoryId],
    queryFn: async () => {
      if (!territoryId) return [];
      const { data, error } = await supabase
        .from('territory_history')
        .select('*, salespeople!territory_history_salesperson_id_fkey(name)')
        .eq('territory_id', territoryId)
        .order('conquered_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((h) => ({
        ...h,
        salesperson: (h as Record<string, unknown>).salespeople || null,
        salespeople: undefined,
      })) as TerritoryHistory[];
    },
    enabled: !!territoryId,
  });
}
