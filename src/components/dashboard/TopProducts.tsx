import { Package, TrendingUp, TrendingDown, Award } from "lucide-react";

const products = [
  {
    name: "Plano Enterprise",
    revenue: 285000,
    sales: 12,
    trend: 15.2,
    color: "from-primary to-accent",
  },
  {
    name: "Plano Business",
    revenue: 198500,
    sales: 28,
    trend: 8.7,
    color: "from-secondary to-accent",
  },
  {
    name: "Plano Starter",
    revenue: 156000,
    sales: 45,
    trend: -3.2,
    color: "from-accent to-status-success",
  },
  {
    name: "Add-ons Premium",
    revenue: 98000,
    sales: 67,
    trend: 22.1,
    color: "from-status-success to-warning",
  },
  {
    name: "Consultoria",
    revenue: 75000,
    sales: 8,
    trend: 5.4,
    color: "from-warning to-primary",
  },
];

export const TopProducts = () => {
  const maxRevenue = Math.max(...products.map((p) => p.revenue));

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
          const isPositive = product.trend > 0;
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;

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
                </div>
              </div>
              <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${product.color} transition-all duration-700 ease-out`}
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
