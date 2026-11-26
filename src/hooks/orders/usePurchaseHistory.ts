import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { OrderRow, OrderItemRow } from './useOrder';

export interface OrderWithDetails extends OrderRow {
  items: OrderItemRow[];
  seller_name?: string;
  category?: string;
  discount_amount?: number;
}

/**
 * Raw shape returned by the purchase-history query: the order row plus its
 * embedded relations (`order_items` and the salesperson).
 */
interface RawPurchaseOrder extends OrderRow {
  items?: OrderItemRow[] | null;
  salesperson?: { name: string | null } | null;
  discount_amount?: number | null;
}

export function usePurchaseHistory(clientId?: string) {
  return useQuery({
    queryKey: ['purchase-history', clientId],
    enabled: !!clientId,
    queryFn: async (): Promise<OrderWithDetails[]> => {
      if (!clientId) return [];

      // `orders.client_id` aponta para `clients`, `order_items.order_id` para
      // `orders` e `orders.salesperson_id` para `salespeople`, o que permite os
      // embeds abaixo com o client tipado.
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          items:order_items(*),
          salesperson:salespeople(name)
        `
        )
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching purchase history:', error);
        return [];
      }

      return (
        (data as RawPurchaseOrder[] | null)?.map((order): OrderWithDetails => ({
          ...order,
          items: order.items ?? [],
          seller_name: order.salesperson?.name || 'Sistema',
          discount_amount: order.discount_amount || 0,
          category: order.items?.[0]?.product_name?.split(' ')[0] || 'Geral',
        })) ?? []
      );
    },
  });
}
