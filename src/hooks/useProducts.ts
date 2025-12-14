import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useInvalidateCache } from "@/hooks/useInvalidateCache";
import { useRetryMutation } from "@/hooks/useRetryMutation";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  sales_count: number;
  rating: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  name: string;
  category?: string;
  price: number;
  status?: string;
}

export const useProducts = (searchTerm?: string) => {
  return useQuery({
    queryKey: ["products", searchTerm],
    queryFn: async (): Promise<Product[]> => {
      let query = supabase
        .from("products")
        .select("*")
        .order("sales_count", { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};

export const useTopProducts = (limit = 5) => {
  return useQuery({
    queryKey: ["top-products", limit],
    queryFn: async () => {
      // Buscar produtos cadastrados
      const { data: products } = await supabase
        .from("products")
        .select("*")
        .order("sales_count", { ascending: false })
        .limit(limit);

      // Se não houver produtos, calcular a partir das vendas
      if (!products || products.length === 0) {
        const { data: sales } = await supabase
          .from("sales")
          .select("product_name, amount, status")
          .eq("status", "completed");

        if (!sales || sales.length === 0) return [];

        // Agregar vendas por produto
        const productMap = new Map<string, { revenue: number; sales: number }>();
        sales.forEach((sale) => {
          const existing = productMap.get(sale.product_name) || { revenue: 0, sales: 0 };
          productMap.set(sale.product_name, {
            revenue: existing.revenue + Number(sale.amount),
            sales: existing.sales + 1,
          });
        });

        // Converter para array e ordenar
        return Array.from(productMap.entries())
          .map(([name, data]) => ({
            name,
            revenue: data.revenue,
            sales: data.sales,
            trend: 0, // Sem histórico para calcular tendência
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, limit);
      }

      return products.map((p) => ({
        name: p.name,
        revenue: p.price * p.sales_count,
        sales: p.sales_count,
        trend: 0,
      }));
    },
  });
};

export const useCreateProduct = () => {
  const { invalidateDomain } = useInvalidateCache();

  return useRetryMutation(
    async (input: CreateProductInput) => {
      const { data, error } = await supabase
        .from("products")
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      retryConfig: { maxRetries: 3, baseDelay: 1000 },
      onSuccess: () => {
        invalidateDomain("products");
        toast.success("Produto criado com sucesso!");
      },
      onError: (error) => {
        console.error("Error creating product:", error);
        toast.error("Erro ao criar produto após múltiplas tentativas");
      },
    }
  );
};

export const useUpdateProduct = () => {
  const { invalidateDomain } = useInvalidateCache();

  return useRetryMutation(
    async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      retryConfig: { maxRetries: 3, baseDelay: 1000 },
      onSuccess: () => {
        invalidateDomain("products");
        toast.success("Produto atualizado com sucesso!");
      },
      onError: (error) => {
        console.error("Error updating product:", error);
        toast.error("Erro ao atualizar produto após múltiplas tentativas");
      },
    }
  );
};

export const useDeleteProduct = () => {
  const { invalidateDomain } = useInvalidateCache();

  return useRetryMutation(
    async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    {
      retryConfig: { maxRetries: 3, baseDelay: 1000 },
      onSuccess: () => {
        invalidateDomain("products");
        toast.success("Produto excluído com sucesso!");
      },
      onError: (error) => {
        console.error("Error deleting product:", error);
        toast.error("Erro ao excluir produto após múltiplas tentativas");
      },
    }
  );
};
