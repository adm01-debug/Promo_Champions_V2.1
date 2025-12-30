import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES } from '@/constants';

// Extended product interface with database fields
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  status: string;
  rating: number;
  sales_count: number;
  created_at: string;
  updated_at: string;
}

export const useProducts = (filters?: { category?: string }) => {
  return useQuery<Product[]>({
    queryKey: ['products', filters],
    queryFn: async (): Promise<Product[]> => {
      let query = supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []) as Product[];
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
  trend: number;
  sales: number;
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
        trend: 0,
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
    mutationFn: async ({ id, name, price, category, status }: { 
      id: string; 
      name?: string; 
      price?: number; 
      category?: string;
      status?: string;
    }) => {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (name !== undefined) updates.name = name;
      if (price !== undefined) updates.price = price;
      if (category !== undefined) updates.category = category;
      if (status !== undefined) updates.status = status;

      const { data, error } = await supabase
        .from('products')
        .update(updates)
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

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
