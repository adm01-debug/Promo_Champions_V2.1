import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { OrderStatus } from "@/components/orders/orderHelpers";

export interface OrderRow {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface OrderEventRow {
  id: string;
  order_id: string;
  status: OrderStatus;
  description: string | null;
  created_at: string;
}

export interface OrderDetail {
  order: OrderRow;
  items: OrderItemRow[];
  events: OrderEventRow[];
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["order", orderId],
    enabled: !!orderId,
    queryFn: async (): Promise<OrderDetail | null> => {
      if (!orderId) return null;
      const [{ data: order, error: orderErr }, { data: items, error: itemsErr }, { data: events, error: eventsErr }] = await Promise.all([
        supabase.from("orders").select("*").eq("id", orderId).maybeSingle(),
        supabase.from("order_items").select("*").eq("order_id", orderId).order("created_at"),
        supabase.from("order_status_events").select("*").eq("order_id", orderId).order("created_at"),
      ]);
      if (orderErr) throw orderErr;
      if (itemsErr) throw itemsErr;
      if (eventsErr) throw eventsErr;
      if (!order) return null;
      return {
        order: order as OrderRow,
        items: (items ?? []) as OrderItemRow[],
        events: (events ?? []) as OrderEventRow[],
      };
    },
  });
}
