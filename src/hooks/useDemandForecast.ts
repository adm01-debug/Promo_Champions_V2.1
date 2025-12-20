import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ForecastResult {
  product_id: string;
  product_name: string;
  current_stock: number;
  predicted_demand_30d: number;
  predicted_demand_60d: number;
  predicted_demand_90d: number;
  reorder_recommendation: string;
  confidence: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

interface ForecastResponse {
  success: boolean;
  forecasts: ForecastResult[];
  generated_at: string;
  total_products: number;
  critical_items: number;
  high_risk_items: number;
}

interface InventoryLevel {
  id: string;
  product_id: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  lead_time_days: number;
  last_restock_date: string | null;
  products?: {
    name: string;
    price: number;
  };
}

export function useDemandForecast() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate forecasts mutation
  const generateForecasts = useMutation({
    mutationFn: async (): Promise<ForecastResponse> => {
      const { data, error } = await supabase.functions.invoke('demand-forecast', {
        body: { action: 'generate-forecasts' }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Previsões geradas",
        description: `${data.total_products} produtos analisados. ${data.critical_items} itens críticos.`,
      });
      queryClient.invalidateQueries({ queryKey: ['demand-forecasts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-levels'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao gerar previsões",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get stored forecasts
  const { data: storedForecasts, isLoading: forecastsLoading } = useQuery({
    queryKey: ['demand-forecasts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('demand_forecasts')
        .select(`
          *,
          products (
            name,
            price,
            sales_count
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Get inventory levels
  const { data: inventoryLevels, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory-levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_levels')
        .select(`
          *,
          products (
            name,
            price
          )
        `)
        .order('current_stock', { ascending: true });

      if (error) throw error;
      return data as InventoryLevel[];
    },
  });

  // Update inventory level
  const updateInventory = useMutation({
    mutationFn: async ({ 
      productId, 
      currentStock, 
      minStock, 
      maxStock, 
      reorderPoint 
    }: {
      productId: string;
      currentStock: number;
      minStock?: number;
      maxStock?: number;
      reorderPoint?: number;
    }) => {
      const { data, error } = await supabase
        .from('inventory_levels')
        .upsert({
          product_id: productId,
          current_stock: currentStock,
          min_stock_level: minStock ?? 10,
          max_stock_level: maxStock ?? 100,
          reorder_point: reorderPoint ?? 20,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'product_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Estoque atualizado",
        description: "Nível de estoque salvo com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-levels'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar estoque",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Record stock movement
  const recordMovement = useMutation({
    mutationFn: async ({
      productId,
      movementType,
      quantity,
      reason,
    }: {
      productId: string;
      movementType: 'in' | 'out' | 'adjustment';
      quantity: number;
      reason?: string;
    }) => {
      // Record the movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          product_id: productId,
          movement_type: movementType,
          quantity,
          reason,
        });

      if (movementError) throw movementError;

      // Update inventory level
      const { data: currentLevel } = await supabase
        .from('inventory_levels')
        .select('current_stock')
        .eq('product_id', productId)
        .single();

      const currentStock = currentLevel?.current_stock || 0;
      let newStock = currentStock;

      if (movementType === 'in') {
        newStock = currentStock + quantity;
      } else if (movementType === 'out') {
        newStock = Math.max(0, currentStock - quantity);
      } else {
        newStock = quantity; // adjustment sets absolute value
      }

      const { error: updateError } = await supabase
        .from('inventory_levels')
        .upsert({
          product_id: productId,
          current_stock: newStock,
          last_restock_date: movementType === 'in' ? new Date().toISOString() : undefined,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'product_id',
        });

      if (updateError) throw updateError;

      return { newStock };
    },
    onSuccess: () => {
      toast({
        title: "Movimentação registrada",
        description: "Estoque atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-levels'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
    },
    onError: (error) => {
      toast({
        title: "Erro na movimentação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get stock movements history
  const { data: stockMovements } = useQuery({
    queryKey: ['stock-movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          products (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  return {
    // Forecasts
    generateForecasts: generateForecasts.mutate,
    isGenerating: generateForecasts.isPending,
    lastForecastResult: generateForecasts.data,
    storedForecasts,
    forecastsLoading,
    
    // Inventory
    inventoryLevels,
    inventoryLoading,
    updateInventory: updateInventory.mutate,
    isUpdatingInventory: updateInventory.isPending,
    
    // Movements
    recordMovement: recordMovement.mutate,
    isRecordingMovement: recordMovement.isPending,
    stockMovements,
  };
}
