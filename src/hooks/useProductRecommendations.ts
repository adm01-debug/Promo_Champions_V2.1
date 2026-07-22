import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { chunkedIn } from '@/lib/supabase/chunkedIn';

export interface Recommendation {
  id: string;
  name: string;
  price: number;
  confidence: number;
}

export const useProductRecommendations = (productId?: string) => {
  return useQuery<Recommendation[]>({
    queryKey: ['product-recommendations', productId],
    queryFn: async (): Promise<Recommendation[]> => {
      if (!productId) return [];

      // Logic: Find clients who bought this product and see what else they bought
      // 1. Get client IDs who bought this product
      const { data: clientSales, error: clientsError } = await supabase
        .from('sales')
        .select('client_id')
        .eq('product_id', productId)
        .not('client_id', 'is', null);

      if (clientsError || !clientSales || clientSales.length === 0) return [];

      const clientIds = [...new Set(clientSales.map(s => s.client_id))];

      // 2. Get other products bought by these clients — usa chunkedIn para
      // evitar overflow de URL PostgREST quando o portfolio ultrapassa ~200 clientes.
      type OtherSaleRow = { product_id: string | null; product_name: string | null; amount: number | null };
      let otherSales: OtherSaleRow[] = [];
      try {
        otherSales = await chunkedIn<OtherSaleRow>(
          clientIds.filter((c): c is string => !!c),
          (chunk) => supabase
            .from('sales')
            .select('product_id, product_name, amount')
            .in('client_id', chunk as string[])
            .neq('product_id', productId)
            .not('product_id', 'is', null),
          { parallel: true, label: 'useProductRecommendations' },
        );
      } catch {
        otherSales = [];
      }

      if (otherSales.length === 0) {
        // Fallback: Just return top products in the same category or overall top products
        const { data: productInfo } = await supabase
          .from('products')
          .select('category')
          .eq('id', productId)
          .single();

        const fallbackQuery = supabase
          .from('products')
          .select('id, name, price')
          .neq('id', productId)
          .order('sales_count', { ascending: false })
          .limit(3);

        if (productInfo?.category) {
          fallbackQuery.eq('category', productInfo.category);
        }

        const { data: fallbacks } = await fallbackQuery;
        return (fallbacks || []).map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          confidence: 0.5
        }));
      }

      // 3. Count occurrences
      const counts: Record<string, { count: number; name: string; price: number }> = {};
      otherSales.forEach(s => {
        if (!counts[s.product_id!]) {
          counts[s.product_id!] = { count: 0, name: s.product_name, price: Number(s.amount) };
        }
        counts[s.product_id!].count++;
      });

      // 4. Return top 3 recommendations
      return Object.entries(counts)
        .map(([id, info]) => ({
          id,
          name: info.name,
          price: info.price,
          confidence: info.count / clientIds.length
        }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
