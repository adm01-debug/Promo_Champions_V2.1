import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface ProductRecommendation {
  product: Product;
  score: number;
  reason: string;
}

export const useProductRecommendations = (clientId: string) => {
  return useQuery<ProductRecommendation[]>({
    queryKey: ['product-recommendations', clientId],
    queryFn: async (): Promise<ProductRecommendation[]> => {
      // Buscar histórico de compras do cliente
      const { data: purchases, error: purchasesError } = await supabase
        .from('deal_products')
        .select('product_id, products(*)')
        .eq('client_id', clientId);
      
      if (purchasesError) throw purchasesError;
      
      // Buscar todos produtos
      const { data: allProducts, error: productsError } = await supabase
        .from('products')
        .select('*');
      
      if (productsError) throw productsError;
      if (!allProducts) return [];
      
      const purchasedIds = new Set((purchases || []).map(p => p.product_id));
      const purchasedCategories = new Set(
        (purchases || [])
          .map(p => p.products?.category)
          .filter(Boolean)
      );
      
      const recommendations: ProductRecommendation[] = [];
      
      allProducts.forEach((product: Product) => {
        if (purchasedIds.has(product.id)) return;
        
        let score = 50; // Base score
        let reason = 'Popular product';
        
        if (purchasedCategories.has(product.category)) {
          score += 30;
          reason = `Similar to previous purchases in ${product.category}`;
        }
        
        recommendations.push({
          product,
          score,
          reason
        });
      });
      
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    },
    enabled: !!clientId
  });
};
