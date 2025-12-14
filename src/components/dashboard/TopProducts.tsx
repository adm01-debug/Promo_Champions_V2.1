import { Package, TrendingUp, TrendingDown, Award, Loader2 } from "lucide-react";
import { useTopProducts } from "@/hooks/useProducts";

const COLORS = [
  "from-primary to-accent",
  "from-secondary to-accent",
  "from-accent to-status-success",
  "from-status-success to-warning",
  "from-warning to-primary",
];

export const TopProducts = () => {
  const { data: products, isLoading } = useTopProducts(5);
  
  const maxRevenue = products && products.length > 0 
    ? Math.max(...products.map((p) => p.revenue)) 
    : 1;

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 border border-border/40 dark:border-glow card-elevated">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="glass rounded-xl p-6 border border-border/40 dark:border-glow card-elevated">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-primary">
              <Award className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold font-display gradient-text">Top Produtos</h3>
              <p className="text-sm text-muted-foreground">Por faturamento</p>
            </div>
          </div>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>Nenhuma venda registrada ainda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 border border-border/40 dark:border-glow card-elevated">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl gradient-primary">
            <Award className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-display gradient-text">Top Produtos</h3>
            <p className="text-sm text-muted-foreground">Por faturamento</p>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-muted/50 border border-border/40">
          <Package className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-4">
        {products.map((product, index) => {
          const width = (product.revenue / maxRevenue) * 100;
          const isPositive = product.trend >= 0;
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;
          const color = COLORS[index % COLORS.length];

          return (
            <div key={product.name} className="group p-2 rounded-lg hover:bg-muted/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center ${
                    index === 0 ? "bg-rank-gold/20 text-rank-gold" :
                    index === 1 ? "bg-rank-silver/20 text-rank-silver" :
                    index === 2 ? "bg-rank-bronze/20 text-rank-bronze" :
                    "bg-muted/50 text-muted-foreground"
                  }`}>
                    #{index + 1}
                  </span>
                  <span className="text-sm font-medium font-display group-hover:text-primary transition-colors">
                    {product.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold gradient-text">
                    R$ {(product.revenue / 1000).toFixed(0)}k
                  </span>
                  {product.trend !== 0 && (
                    <div
                      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                        isPositive 
                          ? "bg-status-success/20 text-status-success" 
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      <TrendIcon className="h-3 w-3" />
                      {isPositive ? "+" : ""}
                      {product.trend}%
                    </div>
                  )}
                </div>
              </div>
              <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out`}
                  style={{ 
                    width: `${width}%`,
                    boxShadow: index === 0 ? "0 0 8px hsl(var(--primary) / 0.4)" : undefined
                  }}
                />
              </div>
              <div className="flex justify-end mt-1.5">
                <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
                  {product.sales} vendas
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
