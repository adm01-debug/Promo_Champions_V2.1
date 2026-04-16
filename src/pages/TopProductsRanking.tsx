import React from "react";
import { Helmet } from "react-helmet-async";
import { PageTransition, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useTopProducts } from "@/hooks/useProducts";
import { Package, TrendingUp, Star, Crown, Medal } from "lucide-react";

const RANK_ICONS = [Crown, Medal, Medal];
const RANK_COLORS = ["text-rank-gold", "text-slate-400", "text-amber-700"];

const TopProductsRanking = () => {
  const { data: products, isLoading } = useTopProducts(20);

  const maxSales = products?.[0]?.sales_count || 1;
  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(v);

  return (
    <>
      <Helmet>
        <title>Ranking de Produtos | Promo Champions</title>
        <meta name="description" content="Top produtos por volume de vendas e receita." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-page-title font-display">🏆 Ranking de Produtos</h1>
            <p className="text-sm text-muted-foreground mt-1">Top produtos por volume de vendas</p>
          </motion.div>

          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : !products?.length ? (
            <Card className="p-8 text-center glass border-border/40">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-display font-semibold">Sem dados de produtos</p>
            </Card>
          ) : (
            <motion.div variants={itemVariants} className="space-y-2">
              {products.map((product, index) => {
                const RankIcon = RANK_ICONS[index];
                const isTop3 = index < 3;
                return (
                  <Card key={product.id} className={cn(
                    "p-4 glass border-border/40 flex items-center gap-4",
                    isTop3 && "border-primary/20"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm",
                      isTop3 ? "bg-primary/10" : "bg-muted"
                    )}>
                      {RankIcon ? <RankIcon className={cn("h-5 w-5", RANK_COLORS[index])} /> : <span className="text-muted-foreground">{index + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <Badge variant="outline" className="text-[10px] shrink-0">{product.category}</Badge>
                      </div>
                      <Progress value={(product.sales_count / maxSales) * 100} className="h-1 mt-1.5" />
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display font-bold text-sm">{product.sales_count} vendas</p>
                      <p className="text-xs text-status-success">{fmtCurrency(product.revenue)}</p>
                    </div>
                    {product.rating > 0 && (
                      <Badge variant="outline" className="text-[10px] gap-1 shrink-0">
                        <Star className="h-3 w-3 text-rank-gold fill-rank-gold" />
                        {product.rating.toFixed(1)}
                      </Badge>
                    )}
                  </Card>
                );
              })}
            </motion.div>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default TopProductsRanking;
