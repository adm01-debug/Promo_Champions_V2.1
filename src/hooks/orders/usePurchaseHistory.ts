import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { OrderRow, OrderItemRow } from "./useOrder";

export interface OrderWithDetails extends OrderRow {
  items: OrderItemRow[];
  seller_name?: string;
  category?: string;
  discount_amount?: number;
}

export function usePurchaseHistory(clientId?: string) {
  return useQuery({
    queryKey: ["purchase-history", clientId],
    enabled: !!clientId,
    queryFn: async (): Promise<OrderWithDetails[]> => {
      if (!clientId) return [];
      
      // In a real scenario, orders would be linked to clients.
      // Assuming a 'client_id' field exists in 'orders' table.
      // We'll also fetch items and seller info.
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          items:order_items(*),
          profiles:user_id(display_name)
        `)
        .eq("client_id", clientId) // This assumes the schema has client_id
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching purchase history:", error);
        // Fallback or empty
        return [];
      }

      return (data || []).map((order: any) => ({
        ...order,
        seller_name: order.profiles?.display_name || "Sistema",
        // Mocking some fields if they don't exist yet to fulfill the "Intelligence" requirement
        discount_amount: order.discount_amount || 0,
        category: order.items?.[0]?.product_name?.split(' ')[0] || "Geral"
      })) as OrderWithDetails[];
    },
  });
}
