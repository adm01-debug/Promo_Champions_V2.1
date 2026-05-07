import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
    <Card className="h-full border-none bg-gradient-to-br from-card/50 to-background shadow-lg shadow-black/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2 tracking-tight uppercase">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Package className="h-4 w-4 text-primary" />
          </div>
          Ranking de Produtos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {products && products.length > 0 ? products.map((product, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group space-y-2"
          >
            <div className="flex justify-between items-end">
              <div className="min-w-0">
                <p className="text-xs font-bold truncate group-hover:text-primary transition-colors uppercase tracking-tight">
                  {product.name}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  R$ {product.revenue.toLocaleString("pt-BR")} acumulados
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px] font-black h-5 px-1.5">
                {product.sales} sales
              </Badge>
            </div>
            <div className="h-2 bg-muted/40 rounded-full overflow-hidden border border-border/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(product.sales / maxSales) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.5 + index * 0.1 }}
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]"
              />
            </div>
          </motion.div>
        )) : (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <Package className="h-8 w-8 mb-2" />
            <p className="text-xs font-medium uppercase tracking-tighter">Inventário pendente...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TopProducts.displayName = "TopProducts";
