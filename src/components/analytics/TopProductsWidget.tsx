import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Package, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductPerformance {
  id: string;
  name: string;
  category: string;
  revenue: number;
  quantity: number;
  growth: number;
  margin?: number;
  color?: string;
}

interface TopProductsWidgetProps {
  products: ProductPerformance[];
  maxItems?: number;
  showChart?: boolean;
  title?: string;
  className?: string;
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const TopProductsWidget: FC<TopProductsWidgetProps> = ({
  products,
  maxItems = 5,
  showChart = true,
  title = 'Top Produtos',
  className,
}) => {
  const topProducts = products.slice(0, maxItems);
  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);

  const chartData = topProducts.map((p, i) => ({
    name: p.name,
    value: p.revenue,
    color: p.color || COLORS[i % COLORS.length],
  }));

  return (
    <Card className={cn('p-4', className)}>
      <h3 className="font-semibold mb-4">{title}</h3>

      {showChart && (
        <div className="h-[180px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `R$ ${value.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-3">
        {topProducts.map((product, index) => {
          const percentage = (product.revenue / totalRevenue) * 100;
          const color = product.color || COLORS[index % COLORS.length];

          return (
            <div key={product.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium truncate max-w-[150px]">
                    {product.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    R$ {product.revenue.toLocaleString()}
                  </span>
                  <span className={cn(
                    'text-xs flex items-center',
                    product.growth >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {product.growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(product.growth)}%
                  </span>
                </div>
              </div>
              <Progress value={percentage} className="h-1" />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

interface ProductGridProps {
  products: ProductPerformance[];
  onProductClick?: (product: ProductPerformance) => void;
}

export const ProductPerformanceGrid: FC<ProductGridProps> = ({
  products,
  onProductClick,
}) => (
  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
    {products.map(product => (
      <Card
        key={product.id}
        className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => onProductClick?.(product)}
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-medium">{product.name}</h4>
            <p className="text-xs text-muted-foreground">{product.category}</p>
          </div>
          <Badge variant={product.growth >= 0 ? 'default' : 'destructive'}>
            {product.growth >= 0 ? '+' : ''}{product.growth}%
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Receita</p>
            <p className="font-medium">R$ {product.revenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Vendas</p>
            <p className="font-medium">{product.quantity}</p>
          </div>
        </div>
      </Card>
    ))}
  </div>
);
