import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DesignInboundRow {
  id: string;
  design_id: string;
  name: string | null;
  product_name: string | null;
  product_sku: string | null;
  thumbnail_url: string | null;
  seller_email: string | null;
  last_event: string | null;
  source: string;
  received_at: string;
}

const SELECT_COLUMNS =
  'id, design_id, name, product_name, product_sku, thumbnail_url, seller_email, last_event, source, received_at';

export function useDesignsInbound(limit = 100) {
  return useQuery({
    queryKey: ['designs-inbound', limit],
    queryFn: async (): Promise<DesignInboundRow[]> => {
      const { data, error } = await supabase
        .from('designs_inbound' as never)
        .select(SELECT_COLUMNS)
        .order('received_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as DesignInboundRow[];
    },
    refetchInterval: 30000,
  });
}
