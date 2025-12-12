import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Package } from "lucide-react";

const products = [
  { name: "CRM Enterprise", sales: 156, revenue: 702000, trend: 12.5 },
  { name: "ERP Completo", sales: 98, revenue: 490000, trend: 8.3 },
  { name: "PDV Cloud", sales: 234, revenue: 351000, trend: -2.1 },
  { name: "Analytics Pro", sales: 87, revenue: 261000, trend: 15.7 },
  { name: "TMS Complete", sales: 45, revenue: 225000, trend: 5.4 },
];

export function TopProducts() {
  const maxRevenue = Math.max(...products.map((p) => p.revenue));

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top Produtos</h3>
          <p className="text-sm text-muted-foreground">Mais vendidos este mês</p>
        </div>
        <div className="p-2 rounded-lg bg-secondary">
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-5">
        {products.map((product, index) => {
          const width = (product.revenue / maxRevenue) * 100;
          const isPositive = product.trend > 0;

          return (
            <div key={product.name} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-5">
                    #{index + 1}
                  </span>
                  <span className="font-medium text-foreground">{product.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-foreground">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      minimumFractionDigits: 0,
                    }).format(product.revenue)}
                  </span>
                  <span
                    className={`flex items-center gap-0.5 text-xs font-semibold ${
                      isPositive ? "text-success" : "text-destructive"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(product.trend)}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full gradient-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${width}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {product.sales} vendas
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}