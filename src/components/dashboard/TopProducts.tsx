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
      <Card className="border-none bg-transparent shadow-none">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-2xl bg-white/[0.03]" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-transparent shadow-none group">
      <CardHeader className="pb-6 pt-0 px-0">
        <CardTitle className="text-sm font-black uppercase tracking-widest text-white/30 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10 ring-1 ring-accent/20">
            <Package className="h-4 w-4 text-accent" />
          </div>
          Inventory Alpha
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-0">
        {products && products.length > 0 ? products.map((product, index) => (
          <div key={index} className="space-y-2 group/item">
            <div className="flex justify-between items-end">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Sku {index + 1}</span>
                <p className="text-xs font-black text-white/70 group-hover/item:text-white transition-colors uppercase tracking-tight truncate max-w-[150px]">{product.name}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-white tabular-nums tracking-tighter">{product.sales}</span>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Closed</span>
              </div>
            </div>
            <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.05] p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-primary/40 to-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]"
                style={{ width: `${(product.sales / maxSales) * 100}%` }}
              />
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-20">
             <Package className="h-8 w-8 mb-2" />
             <p className="text-[10px] font-black uppercase tracking-widest">No assets found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TopProducts.displayName = "TopProducts";
