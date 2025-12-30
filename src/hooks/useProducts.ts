import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { CACHE_TIMES } from '@/constants';

// Re-export Product type for components
export type { Product } from '@/types';

export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        description: undefined,
        price: p.price,
        currency: 'BRL',
        sku: undefined,
        category: p.category,
        active: p.status === 'active',
        created_at: p.created_at,
        updated_at: p.updated_at,
      }));
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  sales_count: number;
  revenue: number;
  rating: number;
  trend?: 'up' | 'down' | 'stable';
  sales?: number;
}

export const useTopProducts = (limit: number = 10) => {
  return useQuery<TopProduct[]>({
    queryKey: ['top-products', limit],
    queryFn: async (): Promise<TopProduct[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sales_count', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        sales_count: p.sales_count,
        revenue: p.price * p.sales_count,
        rating: p.rating,
        trend: 'stable' as const,
        sales: p.sales_count,
      }));
    },
    staleTime: CACHE_TIMES.STALE_TIME,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: {
      name: string;
      price: number;
      category?: string;
    }) => {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: input.name,
          price: input.price,
          category: input.category || 'Geral',
          status: 'active',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; price?: number; category?: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
