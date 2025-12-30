import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  RefreshCw,
  ShoppingCart,
  Calendar 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  lastRestock?: Date;
  daysUntilStockout?: number;
}

interface InventoryCardProps {
  item: InventoryItem;
  onReorder?: () => void;
  onClick?: () => void;
  className?: string;
}

export const InventoryCard: FC<InventoryCardProps> = ({
  item,
  onReorder,
  onClick,
  className,
}) => {
  const stockPercentage = (item.currentStock / item.maxStock) * 100;
  const isLow = item.currentStock <= item.reorderPoint;
  const isCritical = item.currentStock <= item.minStock;

  return (
    <Card 
      className={cn(
        'p-4 cursor-pointer hover:border-primary/50 transition-all',
        isCritical && 'border-destructive/50',
        isLow && !isCritical && 'border-yellow-500/50',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package size={18} className="text-muted-foreground" />
          <h4 className="font-medium">{item.productName}</h4>
        </div>
        {isCritical && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle size={12} />
            Crítico
          </Badge>
        )}
        {isLow && !isCritical && (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600/30 gap-1">
            <TrendingDown size={12} />
            Baixo
          </Badge>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Estoque</span>
          <span className="font-medium">
            {item.currentStock} / {item.maxStock}
          </span>
        </div>
        <Progress 
          value={stockPercentage} 
          className={cn(
            'h-2',
            isCritical && '[&>div]:bg-destructive',
            isLow && !isCritical && '[&>div]:bg-yellow-500'
          )} 
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="space-y-1">
          <p>Ponto de reposição: {item.reorderPoint}</p>
          {item.lastRestock && (
            <p className="flex items-center gap-1">
              <Calendar size={10} />
              Última reposição: {formatDistanceToNow(item.lastRestock, { addSuffix: true, locale: ptBR })}
            </p>
          )}
        </div>
        
        {(isLow || isCritical) && onReorder && (
          <Button 
            size="sm" 
            variant={isCritical ? 'destructive' : 'outline'}
            onClick={(e) => { e.stopPropagation(); onReorder(); }}
            className="gap-1"
          >
            <ShoppingCart size={14} />
            Repor
          </Button>
        )}
      </div>

      {item.daysUntilStockout !== undefined && item.daysUntilStockout <= 7 && (
        <div className="mt-3 pt-3 border-t">
          <p className={cn(
            'text-xs font-medium',
            item.daysUntilStockout <= 3 ? 'text-destructive' : 'text-yellow-600'
          )}>
            ⚠️ Estoque acaba em {item.daysUntilStockout} dias
          </p>
        </div>
      )}
    </Card>
  );
};

interface InventoryAlertsProps {
  items: InventoryItem[];
  onReorder?: (item: InventoryItem) => void;
}

export const InventoryAlerts: FC<InventoryAlertsProps> = ({
  items,
  onReorder,
}) => {
  const critical = items.filter(i => i.currentStock <= i.minStock);
  const low = items.filter(i => i.currentStock <= i.reorderPoint && i.currentStock > i.minStock);

  if (critical.length === 0 && low.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Package size={32} className="mx-auto text-green-500 mb-2" />
        <p className="font-medium">Estoque saudável</p>
        <p className="text-sm text-muted-foreground">
          Todos os produtos estão com níveis adequados
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {critical.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
            <AlertTriangle size={14} />
            Estoque Crítico ({critical.length})
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {critical.map(item => (
              <InventoryCard
                key={item.id}
                item={item}
                onReorder={() => onReorder?.(item)}
              />
            ))}
          </div>
        </div>
      )}

      {low.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-yellow-600 mb-2 flex items-center gap-2">
            <TrendingDown size={14} />
            Estoque Baixo ({low.length})
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {low.map(item => (
              <InventoryCard
                key={item.id}
                item={item}
                onReorder={() => onReorder?.(item)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
