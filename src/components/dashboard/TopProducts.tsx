import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

const topProducts = [
  { name: "Produto A", sales: 45, revenue: 67500 },
  { name: "Produto B", sales: 32, revenue: 48000 },
  { name: "Produto C", sales: 28, revenue: 42000 },
];

export const TopProducts = () => {
  const maxSales = Math.max(...topProducts.map((p) => p.sales));

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          Top Produtos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topProducts.map((product, index) => (
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
        ))}
      </CardContent>
    </Card>
  );
};
