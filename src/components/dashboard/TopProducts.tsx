import { Package, TrendingUp, TrendingDown } from "lucide-react";

const products = [
  {
    name: "Plano Enterprise",
    revenue: 285000,
    sales: 12,
    trend: 15.2,
    color: "from-primary to-secondary",
  },
  {
    name: "Plano Business",
    revenue: 198500,
    sales: 28,
    trend: 8.7,
    color: "from-secondary to-chart-3",
  },
  {
    name: "Plano Starter",
    revenue: 156000,
    sales: 45,
    trend: -3.2,
    color: "from-chart-3 to-chart-5",
  },
  {
    name: "Add-ons Premium",
    revenue: 98000,
    sales: 67,
    trend: 22.1,
    color: "from-chart-5 to-success",
  },
  {
    name: "Consultoria",
    revenue: 75000,
    sales: 8,
    trend: 5.4,
    color: "from-success to-warning",
  },
];

export const TopProducts = () => {
  const maxRevenue = Math.max(...products.map((p) => p.revenue));

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Top Produtos</h3>
          <p className="text-sm text-muted-foreground">Por faturamento</p>
        </div>
        <div className="p-2 rounded-lg bg-muted">
          <Package className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-4">
        {products.map((product, index) => {
          const width = (product.revenue / maxRevenue) * 100;
          const isPositive = product.trend > 0;
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;

          return (
            <div key={product.name} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-medium w-5">
                    #{index + 1}
                  </span>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                    {product.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    R$ {(product.revenue / 1000).toFixed(0)}k
                  </span>
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      isPositive ? "text-success" : "text-destructive"
                    }`}
                  >
                    <TrendIcon className="h-3 w-3" />
                    {isPositive ? "+" : ""}
                    {product.trend}%
                  </div>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${product.color} transition-all duration-700 ease-out`}
                  style={{ width: `${width}%` }}
                />
              </div>
              <div className="flex justify-end mt-1">
                <span className="text-xs text-muted-foreground">
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
