import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const TopProducts = React.memo(() => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["top-products-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("product_name, amount")
        .not("product_name", "is", null);
      if (error) throw error;

      const grouped: Record<string, { sales: number; revenue: number }> = {};
      (data || []).forEach((s) => {
        const name = s.product_name || "Outros";
        if (!grouped[name]) grouped[name] = { sales: 0, revenue: 0 };
        grouped[name].sales += 1;
        grouped[name].revenue += s.amount || 0;
      });

      return Object.entries(grouped)
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    },
    staleTime: 60_000,
  });

  const maxSales = useMemo(() => {
    if (!products?.length) return 1;
    return Math.max(...products.map((p) => p.sales));
  }, [products]);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Top Produtos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          Top Produtos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {products && products.length > 0 ? products.map((product, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium truncate">{product.name}</span>
              <span className="text-muted-foreground">{product.sales} vendas</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(product.sales / maxSales) * 100}%` }}
              />
            </div>
          </div>
        )) : (
          <p className="text-sm text-muted-foreground text-center py-4">Sem dados de produtos</p>
        )}
      </CardContent>
    </Card>
  );
});

TopProducts.displayName = "TopProducts";
