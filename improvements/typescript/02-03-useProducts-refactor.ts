// Melhoria 2.3 - useProducts.ts REFATORADO
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  created_at: string;
}

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase.from('products').select('*');
      
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters?.inStock) {
        query = query.gt('stock', 0);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });
};
