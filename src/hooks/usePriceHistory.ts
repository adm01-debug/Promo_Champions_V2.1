import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PriceHistory {
  id: string;
  supplier_product_id: string;
  product_id: string;
  supplier_id: string;
  old_price: number;
  new_price: number;
  price_change_percent: number;
  recorded_at: string;
  created_at: string;
}

export interface PriceAlert {
  id: string;
  product_id: string;
  supplier_id: string;
  alert_type: 'price_drop' | 'price_increase' | 'new_best_price';
  old_price: number | null;
  new_price: number;
  price_change_percent: number | null;
  is_read: boolean;
  created_at: string;
  products?: { name: string };
  suppliers?: { name: string };
}

export function usePriceHistory(productId?: string) {
  return useQuery({
    queryKey: ['price-history', productId],
    queryFn: async () => {
      let query = supabase
        .from('price_history')
        .select(`
          *,
          products:product_id (name),
          suppliers:supplier_id (name)
        `)
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (PriceHistory & { products: { name: string }; suppliers: { name: string } })[];
    },
  });
}

export function usePriceAlerts() {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['price-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_alerts')
        .select(`
          *,
          products:product_id (name),
          suppliers:supplier_id (name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as PriceAlert[];
    },
  });

  const unreadCount = alerts.filter(a => !a.is_read).length;

  const markAsRead = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('price_alerts')
        .update({ is_read: true })
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('price_alerts')
        .update({ is_read: true })
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
    },
  });

  return {
    alerts,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}

export function usePriceEvolution(productId: string, days: number = 30) {
  return useQuery({
    queryKey: ['price-evolution', productId, days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('price_history')
        .select(`
          *,
          suppliers:supplier_id (name)
        `)
        .eq('product_id', productId)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
}
