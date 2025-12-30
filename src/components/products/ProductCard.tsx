import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Search, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Star,
  Grid,
  List,
  Filter,
  SortAsc 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'low_stock';
  rating: number;
  salesCount: number;
  trend: 'up' | 'down' | 'stable';
  image?: string;
}

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  onQuickAdd?: () => void;
  variant?: 'card' | 'row';
}

const statusConfig = {
  active: { label: 'Ativo', variant: 'default' as const },
  inactive: { label: 'Inativo', variant: 'secondary' as const },
  low_stock: { label: 'Estoque baixo', variant: 'destructive' as const },
};

export const ProductCard: FC<ProductCardProps> = ({
  product,
  onClick,
  onQuickAdd,
  variant = 'card',
}) => {
  if (variant === 'row') {
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
      >
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <Package size={20} className="text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground">{product.category}</p>
        </div>

        <div className="text-right">
          <p className="font-semibold">R$ {product.price.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{product.stock} em estoque</p>
        </div>

        <Badge variant={statusConfig[product.status].variant}>
          {statusConfig[product.status].label}
        </Badge>

        {product.trend === 'up' && <TrendingUp size={16} className="text-green-500" />}
        {product.trend === 'down' && <TrendingDown size={16} className="text-red-500" />}
      </div>
    );
  }

  return (
    <motion.div whileHover={{ y: -2 }}>
      <Card
        className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
        onClick={onClick}
      >
        <div className="aspect-square bg-muted flex items-center justify-center">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Package size={48} className="text-muted-foreground" />
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-medium truncate">{product.name}</h4>
              <p className="text-xs text-muted-foreground">{product.category}</p>
            </div>
            <Badge variant={statusConfig[product.status].variant} className="text-xs">
              {statusConfig[product.status].label}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-lg font-bold">R$ {product.price.toLocaleString()}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star size={12} className="fill-yellow-500 text-yellow-500" />
              {product.rating.toFixed(1)}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-muted-foreground">
            <span>{product.stock} em estoque</span>
            <span className="flex items-center gap-1">
              {product.trend === 'up' && <TrendingUp size={12} className="text-green-500" />}
              {product.trend === 'down' && <TrendingDown size={12} className="text-red-500" />}
              {product.salesCount} vendas
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

interface ProductGridProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
  onCreateProduct?: () => void;
  showViewToggle?: boolean;
}

export const ProductGrid: FC<ProductGridProps> = ({
  products,
  onProductClick,
  onCreateProduct,
  showViewToggle = true,
}) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar produtos..."
            className="pl-9"
          />
        </div>

        {showViewToggle && (
          <div className="flex items-center border rounded-lg">
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setView('grid')}
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() => setView('list')}
            >
              <List size={16} />
            </Button>
          </div>
        )}

        {onCreateProduct && (
          <Button onClick={onCreateProduct} className="gap-2">
            <Plus size={16} />
            Novo Produto
          </Button>
        )}
      </div>

      {view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick?.(product)}
            />
          ))}
        </div>
      ) : (
        <Card className="divide-y">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              variant="row"
              onClick={() => onProductClick?.(product)}
            />
          ))}
        </Card>
      )}
    </div>
  );
};
