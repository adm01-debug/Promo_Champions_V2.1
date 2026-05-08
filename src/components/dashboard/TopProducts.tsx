import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
      <Card className="h-full bg-black/40 border-white/5 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-primary/60">
            <Package className="h-4 w-4" />
            Inventory Scan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse border border-white/5" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full relative overflow-hidden bg-black/40 border-white/5 backdrop-blur-md group">
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-primary/20 group-hover:border-primary/40 transition-colors" />
      </div>

      <CardHeader className="pb-3 relative z-10">
        <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Package className="h-3.5 w-3.5" />
          </div>
          Asset Ranking
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 relative z-10">
        {products && products.length > 0 ? products.map((product, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group/item space-y-2"
          >
            <div className="flex justify-between items-end">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-mono font-black truncate group-hover/item:text-primary transition-colors uppercase tracking-tight">
                  {product.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                   <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-tighter">
                    Volume: <span className="text-foreground/80 font-bold">{product.sales} units</span>
                  </p>
                  <div className="h-1.5 w-[1px] bg-white/10" />
                  <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-tighter">
                    Val: <span className="text-foreground/80 font-bold">R$ {product.revenue.toLocaleString("pt-BR")}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(product.sales / maxSales) * 100}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 + index * 0.1 }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/60 to-primary rounded-full shadow-[0_0_10px_rgba(14,165,233,0.3)]"
              />
              
              {/* Animated highlight on progress bar */}
              <motion.div 
                className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ left: ["-20%", "120%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: index * 0.5 }}
              />
            </div>
          </motion.div>
        )) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-30">
            <Package className="h-8 w-8 text-muted-foreground animate-pulse mb-3" />
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-center">Empty Inventory Cache</p>
          </div>
        )}
      </CardContent>

      {/* Background decoration */}
      <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-primary/5 blur-[40px] rounded-full pointer-events-none" />
    </Card>
  );
});

TopProducts.displayName = "TopProducts";