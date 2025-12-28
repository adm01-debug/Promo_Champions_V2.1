import { useRef, CSSProperties } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';

interface VirtualScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => JSX.Element;
  height: number;
  itemHeight: number | ((index: number) => number);
  className?: string;
  overscan?: number;
  onLoadMore?: () => void;
  loadMoreThreshold?: number;
}

export function VirtualScroll<T>({
  items,
  renderItem,
  height,
  itemHeight,
  className = '',
  overscan = 5,
  onLoadMore,
  loadMoreThreshold = 10
}: VirtualScrollProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof itemHeight === 'function' ? itemHeight : () => itemHeight,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Infinite scroll logic
  const lastItem = virtualItems[virtualItems.length - 1];
  if (
    onLoadMore &&
    lastItem &&
    lastItem.index >= items.length - loadMoreThreshold
  ) {
    onLoadMore();
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height: `${height}px` }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          if (!item) return null;

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Hook para uso mais fácil
export function useVirtualScroll<T>(
  items: T[],
  options: {
    height: number;
    itemHeight: number | ((index: number) => number);
    overscan?: number;
  }
) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof options.itemHeight === 'function' 
      ? options.itemHeight 
      : () => options.itemHeight as number,
    overscan: options.overscan || 5,
  });

  return {
    parentRef,
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
  };
}

// Exemplo de uso com diferentes tipos de dados
export const VirtualDealsList = ({ deals }: { deals: any[] }) => {
  return (
    <VirtualScroll
      items={deals}
      height={600}
      itemHeight={80}
      renderItem={(deal, index) => (
        <div className="p-4 border-b hover:bg-accent transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{deal.title}</h3>
              <p className="text-sm text-muted-foreground">{deal.client_name}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">R$ {deal.value.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-muted-foreground">{deal.stage_name}</p>
            </div>
          </div>
        </div>
      )}
    />
  );
};

export const VirtualClientsList = ({ clients }: { clients: any[] }) => {
  return (
    <VirtualScroll
      items={clients}
      height={500}
      itemHeight={100}
      renderItem={(client) => (
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {client.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{client.name}</h3>
              <p className="text-sm text-muted-foreground">{client.email}</p>
              {client.company && (
                <p className="text-xs text-muted-foreground">{client.company}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {client.deals_count} deals
              </p>
              <p className="text-xs text-muted-foreground">
                R$ {client.total_revenue.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      )}
    />
  );
};

export const VirtualActivitiesFeed = ({ activities }: { activities: any[] }) => {
  // Variable height items
  const getItemHeight = (index: number) => {
    const activity = activities[index];
    if (!activity) return 80;
    return activity.notes ? 120 : 80;
  };

  return (
    <VirtualScroll
      items={activities}
      height={700}
      itemHeight={getItemHeight}
      renderItem={(activity) => (
        <div className="p-4 border-b">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-blue-600">
                {activity.type.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{activity.client_name}</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {activity.type}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {activity.notes && (
                <p className="text-sm mt-2 text-muted-foreground">
                  {activity.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      onLoadMore={() => console.log('Load more activities')}
      loadMoreThreshold={5}
    />
  );
};
