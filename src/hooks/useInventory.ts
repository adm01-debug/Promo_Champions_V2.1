import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InventoryLevel {
  id: string;
  product_id: string | null;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  lead_time_days: number | null;
  last_restock_date: string | null;
  created_at: string;
  updated_at: string;
  products?: { name: string } | null;
}

export interface StockMovement {
  id: string;
  product_id: string | null;
  movement_type: string;
  quantity: number;
  reason: string | null;
  reference_id: string | null;
  performed_by: string | null;
  created_at: string;
  products?: { name: string } | null;
}

export function useInventoryLevels() {
  return useQuery({
    queryKey: ["inventory_levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_levels")
        .select("*, products(name)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as InventoryLevel[];
    },
  });
}

export function useStockMovements(limit = 50) {
  return useQuery({
    queryKey: ["stock_movements", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_movements")
        .select("*, products(name)")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as StockMovement[];
    },
  });
}

export function useAddStockMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (movement: {
      product_id: string;
      movement_type: string;
      quantity: number;
      reason?: string;
    }) => {
      const { data, error } = await supabase
        .from("stock_movements")
        .insert(movement)
        .select()
        .single();
      if (error) throw error;

      // Update inventory level
      const { data: inv } = await supabase
        .from("inventory_levels")
        .select("current_stock")
        .eq("product_id", movement.product_id)
        .maybeSingle();

      if (inv) {
        const delta = movement.movement_type === "entry" ? movement.quantity : -movement.quantity;
        await supabase
          .from("inventory_levels")
          .update({
            current_stock: inv.current_stock + delta,
            last_restock_date: movement.movement_type === "entry" ? new Date().toISOString() : undefined,
          })
          .eq("product_id", movement.product_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory_levels"] });
      queryClient.invalidateQueries({ queryKey: ["stock_movements"] });
      toast.success("Movimentação registrada");
    },
    onError: (e) => toast.error("Erro ao registrar: " + e.message),
  });
}
